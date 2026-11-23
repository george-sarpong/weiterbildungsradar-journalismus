"""Paket 30 A2 (SPEZIFIKATION_PAKET30_20261123.md, E175, E260, E261): Abruf der Kurslinks, läuft auf dem GitHub-Runner.
Höflich: robots.txt nach RFC 9309 (Gruppe für «mediaskills-pruefung», sonst «*»; Platzhalter * und $; 4xx = alles erlaubt,
5xx oder nicht erreichbar = alles gesperrt), je Host höchstens eine Anfrage zugleich, Abstand ≥ 2 s (Crawl-delay bis 10 s),
eigener User-Agent mit Link auf die Methodik, gzip. Nach 3 Zeitüberschreitungen oder Verbindungsfehlern in Folge ruht der Host.
Ergebnis je Adresse: HTTP-Status (erste Antwort und Ende), Ziel nach Weiterleitung, Hash des bereinigten Seitentexts,
Fundstellen (≤ 200 Zeichen) der Katalogwerte je Angebot, Kandidaten (Daten, Beträge). Kein Seitentext im Ergebnis.
Schreibt nur die Ergebnisdatei, nie in Master, Protokoll, eingang/ oder Website (E031, E175).

Aufruf (aus claude-work/): python3 -I paket30/scripts/abruf.py <Stichtag> --out <Datei.jsonl>
         [--ids ID,ID,…] [--nur-ids] [--master …] [--max-hosts 6] [--abstand 2] [--timeout 30] [--basis-url-ersatz ALT=NEU]
--basis-url-ersatz ist nur für Tests (lokaler Testserver)."""
import argparse, concurrent.futures as cf, datetime, gzip, http.client, json, pathlib, re, socket, ssl, sys, threading, time, zlib
import urllib.error, urllib.parse, urllib.request

sys.dont_write_bytecode = True
HIER = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HIER))
import p30_katalog as K  # noqa: E402
import p30_text as T  # noqa: E402

R = K.R
S = K.S
UA_TOKEN = "mediaskills-pruefung"
UA = f"{UA_TOKEN}/1.0 (+https://mediaskills.ch/methodik.html)"
MAX_BYTES = 4_000_000
MAX_REDIRECTS = 8
MAX_DELAY = 10.0
FOLGEFEHLER_RUHE = 3
VERSION = "p30-abruf-2"


class _KeinRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None


def _ctx():
    c = ssl.create_default_context()
    return c


OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}), _KeinRedirect(), urllib.request.HTTPSHandler(context=_ctx()))  # kein Proxy aus der Umgebung


# ---------------- robots.txt (RFC 9309) ----------------
def robots_parse(text, token=UA_TOKEN):
    """Liefert Liste (allow:bool, muster) der passenden Gruppe; [] = alles erlaubt."""
    gruppen, aktuell, in_ua = [], None, False
    for zeile in text.splitlines():
        zeile = zeile.split("#", 1)[0].strip()
        if ":" not in zeile: continue
        k, v = [x.strip() for x in zeile.split(":", 1)]; k = k.lower()
        if k == "user-agent":
            if not in_ua: aktuell = {"ua": [], "regeln": [], "delay": None}; gruppen.append(aktuell)
            aktuell["ua"].append(v.lower()); in_ua = True
        elif k in ("allow", "disallow") and aktuell is not None:
            in_ua = False
            if v: aktuell["regeln"].append((k == "allow", v))
            elif k == "disallow": pass   # leeres Disallow = nichts gesperrt
        elif k == "crawl-delay" and aktuell is not None:
            in_ua = False
            try: aktuell["delay"] = float(v)
            except ValueError: pass
        elif k != "sitemap" and aktuell is not None:
            in_ua = False
    t = token.lower()
    eigene = [g for g in gruppen if any(u == t for u in g["ua"])]
    sel = eigene or [g for g in gruppen if "*" in g["ua"]]
    regeln = [r for g in sel for r in g["regeln"]]
    delay = max([g["delay"] for g in sel if g["delay"] is not None], default=None)
    return regeln, delay


def _muster_rx(m):
    ende = m.endswith("$"); m = m[:-1] if ende else m
    rx = "".join(".*" if c == "*" else re.escape(c) for c in m)
    return re.compile(rx + ("$" if ende else ""))


def robots_erlaubt(regeln, pfad):
    """Längste passende Regel gewinnt; bei Gleichstand Allow (RFC 9309 2.2.2)."""
    best = None
    for allow, m in regeln:
        if _muster_rx(m).match(pfad):
            l = len(m)
            if best is None or l > best[0] or (l == best[0] and allow): best = (l, allow)
    return True if best is None else best[1]


# ---------------- Host-Zustand (Höflichkeit) ----------------
class Host:
    def __init__(self, basis, abstand):
        self.basis, self.abstand = basis, abstand
        self.lock = threading.Lock(); self.letzte = 0.0; self.robots = None; self.robots_status = None
        self.folgefehler = 0; self.ruht = False; self.anfragen = []   # (start, ende) monotonic, für Test Q05

    def warte(self):
        d = max(self.abstand, min(MAX_DELAY, self.robots[1] or 0) if self.robots else self.abstand)
        jetzt = time.monotonic(); w = self.letzte + d - jetzt
        if w > 0: time.sleep(w)


HOSTS, HOSTS_LOCK = {}, threading.Lock()


def host_von(url, abstand):
    p = urllib.parse.urlsplit(url); basis = f"{p.scheme}://{p.netloc}".lower()
    with HOSTS_LOCK:
        if basis not in HOSTS: HOSTS[basis] = Host(basis, abstand)
        return HOSTS[basis]


def _anfrage(url, timeout):
    """Eine Anfrage ohne Weiterleitung. Liefert (status, header, body_bytes, fehler)."""
    req = urllib.request.Request(_sicher(url), headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
                                                         "Accept-Language": "de-CH,de;q=0.9,fr;q=0.8,it;q=0.7,en;q=0.6", "Accept-Encoding": "gzip, deflate"})
    try:
        r = OPENER.open(req, timeout=timeout); status, hdr = r.status, r.headers
    except urllib.error.HTTPError as e:
        r, status, hdr = e, e.code, e.headers
    except urllib.error.URLError as e:
        g = e.reason
        if isinstance(g, socket.gaierror): return None, None, b"", "DNS"
        if isinstance(g, (socket.timeout, TimeoutError)): return None, None, b"", "TIMEOUT"
        if isinstance(g, ssl.SSLError): return None, None, b"", "TLS"
        if isinstance(g, ConnectionRefusedError): return None, None, b"", "VERBINDUNG_ABGELEHNT"
        return None, None, b"", "VERBINDUNG"
    except (socket.timeout, TimeoutError): return None, None, b"", "TIMEOUT"
    except (http.client.HTTPException, ConnectionError, OSError, ValueError): return None, None, b"", "VERBINDUNG"
    try:
        body = r.read(MAX_BYTES + 1)
    except (socket.timeout, TimeoutError): return status, hdr, b"", "TIMEOUT"
    except (http.client.HTTPException, ConnectionError, OSError): return status, hdr, b"", "VERBINDUNG"
    finally:
        try: r.close()
        except Exception: pass
    if len(body) > MAX_BYTES: return status, hdr, b"", "GROESSE"
    enc = (hdr.get("Content-Encoding") or "").lower() if hdr else ""
    try:
        if "gzip" in enc: body = gzip.decompress(body)
        elif "deflate" in enc: body = zlib.decompress(body, -zlib.MAX_WBITS) if body[:1] != b"x" else zlib.decompress(body)
    except (OSError, zlib.error, EOFError): return status, hdr, b"", "KODIERUNG"
    return status, hdr, body, None


def _sicher(url):
    p = urllib.parse.urlsplit(url)
    pfad = urllib.parse.quote(p.path, safe="/%:@!$&'()*+,;=-._~")
    q = urllib.parse.quote(p.query, safe="=&%:@!$'()*+,;/?-._~")
    try: netloc = p.netloc.encode("idna").decode("ascii") if not p.netloc.isascii() else p.netloc
    except UnicodeError: netloc = p.netloc
    return urllib.parse.urlunsplit((p.scheme, netloc, pfad or "/", q, ""))


def hoeflich(host, url, timeout):
    """Anfrage mit Host-Sperre und Mindestabstand."""
    with host.lock:
        host.warte(); t0 = time.monotonic()
        try: return _anfrage(url, timeout)
        finally:
            host.letzte = time.monotonic(); host.anfragen.append((t0, host.letzte))


def robots_laden(host, timeout):
    if host.robots is not None: return
    st, hdr, body, f = hoeflich(host, host.basis + "/robots.txt", timeout)
    if f in ("TIMEOUT", "VERBINDUNG") or (st is not None and 500 <= st < 600):
        time.sleep(3); st, hdr, body, f = hoeflich(host, host.basis + "/robots.txt", timeout)   # ein zweiter Versuch
    host.robots_status = st if st is not None else f
    if f is None and st is not None and 200 <= st < 300:
        host.robots = robots_parse(body.decode("utf-8", "replace"))
    elif f is None and st is not None and 300 <= st < 400:
        host.robots = ([], None)          # Weiterleitung nicht gefolgt: wie nicht vorhanden behandelt (RFC 9309 2.3.1.2 erlaubt bis 5 Hops)
    elif f is None and st is not None and 400 <= st < 500:
        host.robots = ([], None)          # «unavailable»: alles erlaubt (RFC 9309 2.3.1.3)
    else:
        host.robots = ([(False, "/")], None)  # «unreachable»: alles gesperrt (RFC 9309 2.3.1.4)


def _text(hdr, body):
    ct = (hdr.get("Content-Type") or "") if hdr else ""
    m = re.search(r"charset=([\w.-]+)", ct, re.I)
    cs = m.group(1) if m else None
    if not cs:
        m = re.search(rb"<meta[^>]+charset=[\"']?([\w.-]+)", body[:4096], re.I)
        cs = m.group(1).decode("ascii", "replace") if m else "utf-8"
    try: return body.decode(cs, "replace")
    except LookupError: return body.decode("utf-8", "replace")


def hole(url, timeout, abstand):
    """Folgt Weiterleitungen selbst (jede Stufe höflich). Liefert dict ohne Seitentext und die Seite (oder None)."""
    erg = {"url": url, "erst_status": None, "status": None, "ziel": url, "kette": [], "fehler": None, "typ": None, "nur_js": False}
    aktuell, besucht = url, set()
    for stufe in range(MAX_REDIRECTS + 1):
        h = host_von(aktuell, abstand)
        if h.ruht: erg["fehler"] = "HOST_RUHT"; return erg, None
        robots_laden(h, timeout)
        if h.robots_status in ("DNS", "VERBINDUNG_ABGELEHNT", "TLS"):   # Host fehlt oder lehnt ab: Link defekt, nicht «robots»
            if stufe == 0: erg["erst_status"] = None
            erg["fehler"] = h.robots_status; erg["kette"].append([None, aktuell]); return erg, None
        pfad = urllib.parse.urlsplit(aktuell); pq = (pfad.path or "/") + (("?" + pfad.query) if pfad.query else "")
        if not robots_erlaubt(h.robots[0], pq):
            erg["fehler"] = "ROBOTS"; erg["robots_status"] = h.robots_status; return erg, None
        st, hdr, body, f = hoeflich(h, aktuell, timeout)
        if f in ("TIMEOUT", "VERBINDUNG") or (st is not None and 500 <= st < 600):
            time.sleep(1); st, hdr, body, f = hoeflich(h, aktuell, timeout)   # ein zweiter Versuch
        if f in ("TIMEOUT", "VERBINDUNG", "VERBINDUNG_ABGELEHNT"):
            with h.lock:
                h.folgefehler += 1
                if h.folgefehler >= FOLGEFEHLER_RUHE: h.ruht = True
        else:
            with h.lock: h.folgefehler = 0
        if stufe == 0: erg["erst_status"] = st
        erg["kette"].append([st, aktuell]); erg["status"] = st
        if f: erg["fehler"] = f; return erg, None
        if 300 <= st < 400 and hdr and hdr.get("Location"):
            neu = urllib.parse.urljoin(aktuell, hdr["Location"])
            if neu in besucht: erg["fehler"] = "SCHLEIFE"; return erg, None
            besucht.add(aktuell); aktuell = neu; erg["ziel"] = neu; continue
        erg["ziel"] = aktuell
        ct = (hdr.get("Content-Type") or "").lower() if hdr else ""
        erg["typ"] = ct.split(";")[0].strip()
        if st >= 400: return erg, None
        if erg["typ"] not in ("text/html", "application/xhtml+xml", "text/plain", ""):
            erg["fehler"] = "TYP"; return erg, None
        roh = _text(hdr, body)
        erg["roh_bytes"] = len(body); erg["kodierung"] = (hdr.get("Content-Encoding") or "") if hdr else ""
        seite = T.bereinige(roh) if erg["typ"] != "text/plain" else T.Seite(T._ws(roh), T._ws(roh), "", [], "")
        erg["laenge"] = len(seite.text)
        erg["seitentitel"] = seite.titel_tag[:200]; erg["h1"] = seite.h1[:200]   # zur Einordnung durch den Owner (Q14)
        if not seite.text: erg["roh_anfang"] = re.sub(r"\s+", " ", roh[:160])   # nur Markup-Anfang zur Fehlersuche, kein Seitentext
        if len(seite.text) < 300 and re.search(r"<script", roh, re.I):
            erg["nur_js"] = True
        erg["hash"] = T.hash_text(seite)
        return erg, seite
    erg["fehler"] = "ZU_VIELE_WEITERLEITUNGEN"; return erg, None


def werte_fuer(z, seite, t):
    """Fundstellen je Prüfblatt-Feld für ein Angebot (z) auf der Seite."""
    d = K.pruefdatum(z, t); bs = K.betraege(z)
    w = {"titel": T.finde_titel(z["titel"], seite),
         "datum": {d.isoformat(): T.finde_datum(d, seite)} if d else {},
         "preis": {f"{b:g}": T.finde_preis(b, seite) for b in bs}}
    for feld, begriffe in K.suchbegriffe(z).items():
        w[feld] = next((x for x in (T.finde_wort(b, seite) for b in begriffe) if x), None)
    return w


def lauf(rows, t, timeout, abstand, max_hosts, ersatz=None, log=print):
    nach_url = {}
    for z in rows: nach_url.setdefault(z["url"].strip(), []).append(z)
    def ziel(u): return u if not ersatz else u.replace(ersatz[0], ersatz[1], 1)
    gruppen = {}
    for u in nach_url: gruppen.setdefault(urllib.parse.urlsplit(ziel(u)).netloc.lower(), []).append(u)
    ergebnisse = {}

    def arbeite(urls):
        for u in sorted(urls):
            if not re.match(r"https?://", u):
                ergebnisse[u] = {"url": u, "erst_status": None, "status": None, "ziel": u, "kette": [], "fehler": "KEINE_ADRESSE", "ids": [z["id"] for z in nach_url[u]]}
                continue
            e, seite = hole(ziel(u), timeout, abstand)
            e["url"] = u
            if ersatz: e["ziel"] = e["ziel"].replace(ersatz[1], ersatz[0], 1); e["kette"] = [[s, x.replace(ersatz[1], ersatz[0], 1)] for s, x in e["kette"]]
            e["ids"] = sorted(z["id"] for z in nach_url[u])
            if seite is not None:
                e["werte"] = {z["id"]: werte_fuer(z, seite, t) for z in nach_url[u]}
                e["kandidaten"] = {"daten": T.daten_auf_seite(seite, t), "preise": T.preise_auf_seite(seite)}
            ergebnisse[u] = e

    with cf.ThreadPoolExecutor(max_workers=max_hosts) as ex:
        futs = {ex.submit(arbeite, us): h for h, us in gruppen.items()}
        for fu in cf.as_completed(futs):
            fu.result(); log(f"Host fertig: {futs[fu]} ({len(gruppen[futs[fu]])} Adressen)")
    return [ergebnisse[u] for u in sorted(ergebnisse)]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("stichtag"); ap.add_argument("--out", required=True)
    ap.add_argument("--ids", default=""); ap.add_argument("--nur-ids", action="store_true")
    ap.add_argument("--master", default=str(R / "paket3/out/master_3818_aktuell.csv"))
    ap.add_argument("--max-hosts", type=int, default=6); ap.add_argument("--abstand", type=float, default=2.0)
    ap.add_argument("--timeout", type=float, default=30.0); ap.add_argument("--basis-url-ersatz", default="")
    a = ap.parse_args(); t = S.datum(a.stichtag)
    if t is None: sys.exit("ABBRUCH: Stichtag JJJJ-MM-TT")
    if a.abstand < 2.0 and not a.basis_url_ersatz: sys.exit("ABBRUCH: Abstand mindestens 2 s")
    ids = [x for x in a.ids.replace("\n", ",").split(",") if x.strip()]
    try: rows = K.abrufmenge(S.lies_master(a.master), t, [x.strip() for x in ids], a.nur_ids)
    except ValueError as e: sys.exit(f"ABBRUCH: {e}")
    ersatz = tuple(a.basis_url_ersatz.split("=", 1)) if a.basis_url_ersatz else None
    beginn = datetime.datetime.now(datetime.timezone.utc)
    erg = lauf(rows, t, a.timeout, a.abstand, a.max_hosts, ersatz)
    meta = {"meta": {"version": VERSION, "stichtag": a.stichtag, "beginn": beginn.isoformat(timespec="seconds"),
                     "ende": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"), "angebote": len(rows),
                     "adressen": len(erg), "user_agent": UA, "abstand_s": a.abstand, "nur_ids": a.nur_ids, "ids": sorted(set(ids)),
                     "robots": {b: str(h.robots_status) for b, h in sorted(HOSTS.items())}}}
    p = pathlib.Path(a.out); p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(meta, ensure_ascii=False, sort_keys=True) + "\n")
        for e in erg: f.write(json.dumps(e, ensure_ascii=False, sort_keys=True) + "\n")
    n_ok = sum(1 for e in erg if e.get("status") and 200 <= e["status"] < 300 and not e.get("fehler"))
    print(f"OK Abruf {a.stichtag}: {len(rows)} Angebote, {len(erg)} Adressen, {n_ok} mit Seite → {p}")


if __name__ == "__main__":
    main()
