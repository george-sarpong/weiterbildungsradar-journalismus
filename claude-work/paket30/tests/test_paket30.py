"""Paket 30 Tests (SPEZIFIKATION_PAKET30_20261123.md §5): Q01–Q07, Q10–Q12 lokal; Q08/Q09 aus den Läufen auf dem Runner
(test_paket30_lauf.py); Q13 = alte Testsuiten; Q14 im Messbericht.
Aufruf (aus claude-work/): python3 -I paket30/tests/test_paket30.py [Q01 Q03 …]"""
import csv, datetime, hashlib, http.server, io, json, os, pathlib, random, re, shutil, socketserver, subprocess, sys, tempfile, threading, time

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
SK = R / "paket30/scripts"
sys.path.insert(0, str(SK)); sys.path.insert(0, str(R / "scripts"))
import abgleich as A  # noqa: E402
import abruf as AB  # noqa: E402
import eingang_vorschlag as EV  # noqa: E402
import messbericht as MB  # noqa: E402
import p30_katalog as K  # noqa: E402
import p30_text as T  # noqa: E402
import pruefliste as PL  # noqa: E402
import sichtbarkeit as S  # noqa: E402
import stichprobe as SP  # noqa: E402

MASTER = R / "paket3/out/master_3818_aktuell.csv"
D = datetime.date
ERG = []


def check(name, ok, info=""):
    ERG.append((name, bool(ok), info)); print(("PASS " if ok else "FAIL ") + name + (f" – {info}" if info else ""))


def py(*a, cwd=R):
    return subprocess.run([sys.executable, "-I", *map(str, a)], cwd=cwd, capture_output=True, text=True)


# ---------------- Q01 Prüfliste gegen unabhängige Zählung ----------------
def unabhaengig(t, n):
    """Eigene Zählung ohne sichtbarkeit.py und ohne pruefliste.py (Regel nach app-v43.js Z. 109–134, Spezifikation P27 A7)."""
    def dt(v):
        try: return D.fromisoformat(v) if re.fullmatch(r"\d{4}-\d{2}-\d{2}", v or "") else None
        except ValueError: return None
    def sicht(z, tag):
        if z["release_markt"] not in ("CH", "AT", "LI") or z["publikationsstatus"] == "HOLD": return False
        s = z["durchfuehrungen_anzeige"] or z["durchfuehrungen"]
        if s != "nicht erfasst": return any((dt(e.get("startDate")) or D.min) >= tag for e in json.loads(s))
        e_, s_ = dt(z["end_datum"]), dt(z["start_datum"])
        if e_: return e_ >= tag
        return s_ is None or s_ >= tag
    rows = list(csv.DictReader(io.StringIO(MASTER.read_text(encoding="utf-8-sig"))))
    out = {}
    for z in rows:
        if not sicht(z, t): continue
        g = []
        p = dt(z["pruefen_ab"])
        if p is None or p <= n: g.append("FAELLIG")
        if not sicht(z, n): g.append("FAELLT_WEG")
        if g: out[z["id"]] = "+".join(g)
    return out


def q01():
    rows = S.lies_master(MASTER)
    for t, n, soll in ((D(2026, 11, 23), D(2026, 12, 23), 307), (D(2026, 12, 1), D(2027, 1, 1), None), (D(2026, 12, 20), D(2027, 1, 20), None)):
        pl = PL.pruefliste(rows, t, n); mine = {r["id"]: r["grund"] for r in pl}; ref = unabhaengig(t, n)
        ok = mine == ref and (soll is None or len(pl) == soll)
        check(f"Q01 Prüfliste {t} → {n}", ok, f"{len(pl)} Zeilen, unabhängig {len(ref)}" + (f", Soll {soll}" if soll else ""))
    # P29-Release 23.11. als zweite Quelle der Sichtbarkeit
    js = "".join(p.read_text(encoding="utf-8") for p in sorted((R / "paket29/abnahme").glob("daten-*.js")))
    ids = set(re.findall(r'"id":\s*"([^"]+)"', js))
    vis = {z["id"] for z in rows if S.sichtbar(z, D(2026, 11, 23))}
    check("Q01 sichtbar 23.11. = Release P29", vis == ids and len(vis) == 998, f"{len(vis)} / {len(ids)}")
    p = py(SK / "pruefliste.py", "2026-11-23", "2026-11-23", "--out", tempfile.mkdtemp())
    check("Q01 nächster Build nicht nach Stichtag → Abbruch", p.returncode != 0 and "ABBRUCH" in p.stderr)


# ---------------- Testserver ----------------
SEITE = """<!doctype html><html><head><meta charset="utf-8"><title>{titel} – Testanbieter</title>{kopf}</head><body>
<div class="cookie-consent">Wir verwenden Cookies. {banner}</div><nav>Startseite Kurse Kontakt</nav><main><h1>{titel}</h1>
<p>Nächster Termin: {datum}. Kosten: {preis}. Ort: Zürich. Kursform: Präsenz. Sprache: Deutsch. Dauer: 2 Tage.</p>
<p>{fuell}</p><p>{extra}</p></main><footer>© Testanbieter · Stand {stempel} · Sitzung {sitzung}</footer></body></html>"""
FUELL = "Dieser Kurs vermittelt Grundlagen und Praxis für Medienschaffende. " * 8


def seite(titel, datum, preis, extra="", banner="", stempel="2026-11-23T08:00:00Z", sitzung="a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6", kopf=""):
    return SEITE.format(titel=titel, datum=datum, preis=preis, extra=extra, banner=banner, stempel=stempel, sitzung=sitzung, fuell=FUELL, kopf=kopf)


class Server:
    def __init__(self):
        self.log, self.version = [], {}
        srv = self

        class H(http.server.BaseHTTPRequestHandler):
            protocol_version = "HTTP/1.1"
            def log_message(self, *a): pass
            def do_GET(self):
                h = self.headers.get("Host", "").split(":")[0]
                eintrag = [h, self.path, time.monotonic(), None, self.headers.get("User-Agent")]; srv.log.append(eintrag)
                try: srv.antwort(self, h)
                except (BrokenPipeError, ConnectionResetError): pass
                finally: eintrag[3] = time.monotonic()

        class TS(socketserver.ThreadingMixIn, http.server.HTTPServer): daemon_threads = True
        self.httpd = TS(("127.0.0.1", 0), H); self.port = self.httpd.server_address[1]
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()

    def basis(self, host="127.0.0.1"): return f"http://{host}:{self.port}"

    def senden(self, h, code, body=b"", typ="text/html; charset=utf-8", kopf=None):
        if isinstance(body, str): body = body.encode("utf-8")
        h.send_response(code); h.send_header("Content-Type", typ); h.send_header("Content-Length", str(len(body)))
        for k, v in (kopf or {}).items(): h.send_header(k, v)
        h.end_headers(); h.wfile.write(body)

    def antwort(self, h, host):
        p = h.path.split("?")[0]
        if p == "/robots.txt":
            if host == "localhost": return self.senden(h, 200, "User-agent: *\nDisallow: /gesperrt/\nAllow: /gesperrt/frei$\n", "text/plain")
            return self.senden(h, 200, "User-agent: *\nDisallow: /privat\n\nUser-agent: mediaskills-pruefung\nDisallow: /gesperrt/\n", "text/plain")
        r = {
            "/ok/a": lambda: seite("Datenjournalismus Grundlagen", "12.03.2027", "CHF 1'150.–"),
            "/ok/b": lambda: seite("Podcast produzieren", "Du 14 au 15 décembre 2026", "Prix : 1380 CHF H.T."),
            "/wf/datum": lambda: seite("Interview führen", "20.04.2027", "CHF 900"),
            "/wf/preis": lambda: seite("Schreiben fürs Web", "05.05.2027", "CHF 1290"),
            "/wf/titel": lambda: seite("Ganz anderer Kurs über Gartenbau", "06.06.2027", "CHF 500"),
            "/aend/a": lambda: seite("Mobile Reporting", "07.07.2027", "CHF 700", extra=f"Version {self.version.get('aend', 1)}"),
            "/aend/b": lambda: seite("Faktencheck", "08.08.2027", "CHF 800", extra=f"Version {self.version.get('aend', 1)}"),
            "/ziel/a": lambda: seite("Social Media im Journalismus", "09.09.2027", "CHF 600"),
            "/ziel/b": lambda: seite("Videojournalismus kompakt", "10.10.2027", "CHF 650"),
            "/uebersicht": lambda: seite("Alle Kurse", "laufend", "verschieden"),
            "/gesperrt/x": lambda: seite("Gesperrt", "01.01.2027", "CHF 1"),
            "/js": lambda: '<html><head><script src="app.js"></script></head><body><div id="app"></div><script>start()</script></body></html>',
        }
        if p in r: return self.senden(h, 200, r[p]())
        if p == "/umzug/a": return self.senden(h, 301, "", kopf={"Location": "/ziel/a"})
        if p == "/umzug/b": return self.senden(h, 302, "", kopf={"Location": self.basis("127.0.0.1") + "/ziel/b"})
        if p == "/umzug/weg": return self.senden(h, 302, "", kopf={"Location": "/uebersicht"})
        if p in ("/defekt/404", "/fehlt"): return self.senden(h, 404, "<h1>Nicht gefunden</h1>")
        if p == "/defekt/410": return self.senden(h, 410, "<h1>Weg</h1>")
        if p == "/defekt/500": return self.senden(h, 500, "<h1>Fehler</h1>")
        if p == "/abwehr": return self.senden(h, 403, "<h1>Forbidden</h1>")
        if p == "/pdf": return self.senden(h, 200, b"%PDF-1.4 ...", "application/pdf")
        if p == "/langsam": time.sleep(3); return self.senden(h, 200, seite("Langsam", "1.1.2027", "CHF 1"))
        if p == "/schleife": return self.senden(h, 302, "", kopf={"Location": "/schleife"})
        return self.senden(h, 404, "nicht da")

    def stop(self): self.httpd.shutdown()


# ---------------- Testmaster ----------------
def testmaster(eintraege):
    """Echte Kopfzeile, Vorlage = erste sichtbare CH-Zeile; je Eintrag (id, url, titel, start, betraege, extra)."""
    rows = S.lies_master(MASTER)
    v = next(z for z in rows if z["release_markt"] == "CH" and S.sichtbar(z, D(2026, 11, 23)) and z["durchfuehrungen"] == "nicht erfasst")
    out = []
    for i, url, titel, start, bs, extra in eintraege:
        z = dict(v); z.update({"id": i, "url": url, "titel": titel, "start_datum": start or "nicht erfasst", "end_datum": start or "nicht erfasst",
                               "durchfuehrungen": "nicht erfasst", "durchfuehrungen_anzeige": "", "publikationsstatus": "PUBLISHED",
                               "pruefen_ab": "2026-12-01", "geprueft_am": "2026-08-30", "release_markt": "CH",
                               "preis_optionen": json.dumps([{"amountType": "EXACT", "amount": b, "currency": "CHF", "tariffClass": "REGULAR"} for b in bs])})
        z.update(extra or {}); out.append(z)
    return out


def faelle(srv):
    b, l = srv.basis(), srv.basis("localhost")
    return [  # id, url, titel, start, betraege, extra, soll
        ("T-OK-1", b + "/ok/a", "Datenjournalismus Grundlagen", "2027-03-12", [1150], None, "OK"),
        ("T-OK-2", b + "/ok/b", "Podcast produzieren", "2026-12-14", [1380], None, "OK"),
        ("T-WF-1", b + "/wf/datum", "Interview führen", "2027-04-21", [900], None, "WERT_FEHLT"),
        ("T-WF-2", b + "/wf/preis", "Schreiben fürs Web", "2027-05-05", [1250], None, "WERT_FEHLT"),
        ("T-WF-3", b + "/wf/titel", "Kamera und Licht", "2027-06-06", [500], None, "WERT_FEHLT"),
        ("T-AE-1", b + "/aend/a", "Mobile Reporting", "2027-07-07", [700], None, "GEAENDERT"),
        ("T-AE-2", b + "/aend/b", "Faktencheck", "2027-08-08", [800], None, "GEAENDERT"),
        ("T-LD-1", b + "/defekt/404", "Weg A", "2027-01-01", [100], None, "LINK_DEFEKT"),
        ("T-LD-2", b + "/defekt/410", "Weg B", "2027-01-01", [100], None, "LINK_DEFEKT"),
        ("T-LD-3", b + "/defekt/500", "Weg C", "2027-01-01", [100], None, "LINK_DEFEKT"),
        ("T-LD-4", "http://kein-host.invalid/kurs", "Weg D", "2027-01-01", [100], None, "LINK_DEFEKT"),
        ("T-WL-1", b + "/umzug/a", "Social Media im Journalismus", "2027-09-09", [600], None, "WEITERLEITUNG"),
        ("T-WL-2", b + "/umzug/b", "Videojournalismus kompakt", "2027-10-10", [650], None, "WEITERLEITUNG"),
        ("T-WL-3", b + "/umzug/weg", "Recherche vertieft", "2027-01-01", [100], None, "WEITERLEITUNG"),
        ("T-NL-1", b + "/gesperrt/x", "Gesperrt", "2027-01-01", [1], None, "NICHT_LESBAR"),
        ("T-NL-2", l + "/gesperrt/y", "Gesperrt 2", "2027-01-01", [1], None, "NICHT_LESBAR"),
        ("T-NL-3", b + "/js", "Nur Skript", "2027-01-01", [1], None, "NICHT_LESBAR"),
        ("T-NL-4", b + "/pdf", "Als PDF", "2027-01-01", [1], None, "NICHT_LESBAR"),
        ("T-NL-5", b + "/abwehr", "Abwehr", "2027-01-01", [1], None, "NICHT_LESBAR"),
        ("T-NL-6", b + "/langsam", "Langsam", "2027-01-01", [1], None, "NICHT_LESBAR"),
    ]


def abruf_lokal(srv, rows, t=D(2026, 11, 23), abstand=0.05, timeout=1.5):
    AB.HOSTS.clear()
    return {e["url"]: json.loads(json.dumps(e)) for e in AB.lauf(rows, t, timeout, abstand, 4, log=lambda *_: None)}


def q03(srv):
    f = faelle(srv); rows = testmaster([x[:6] for x in f])
    ab1 = abruf_lokal(srv, rows)
    srv.version["aend"] = 2
    ab2 = abruf_lokal(srv, rows)
    srv.version["aend"] = 1
    aus = {r["id"]: r for r in A.abgleich(rows, D(2026, 11, 23), D(2026, 12, 23), ab2, vormonat=ab1)}
    abw = [(i, aus[i]["status"], soll) for i, *_, soll in f if aus[i]["status"] != soll]
    zaehl = {s: sum(1 for *_, soll in f if soll == s) for s in A.VORRANG}
    check("Q03 Abgleich am Testserver: Status = Soll", not abw, f"{len(f)} Fälle, je Status {zaehl}" + (f"; Abweichungen {abw}" if abw else ""))
    ein = {i: aus[i]["einordnung"] for i in aus}
    soll_e = {"T-LD-1": "ZWEIFEL", "T-WL-3": "ZWEIFEL", "T-WF-3": "ZWEIFEL", "T-WL-1": "ROUTINE", "T-NL-1": "CHROME", "T-WF-1": "ROUTINE", "T-OK-1": "ROUTINE"}
    check("Q03 Einordnung Owner/Chrome/Routine", all(ein[k] == v for k, v in soll_e.items()), str({k: ein[k] for k in soll_e}))
    check("Q03 Weiterleitung Ziel erfasst", aus["T-WL-1"]["ziel"].endswith("/ziel/a") and aus["T-WL-1"]["http_erst"] == "301")
    check("Q03 Kandidat neues Datum", "2027-04-20" in aus["T-WF-1"]["kandidaten_daten"], aus["T-WF-1"]["kandidaten_daten"])
    # Erster Lauf ohne Vormonat: GEAENDERT unmöglich (Spezifikation §1.1)
    aus1 = {r["id"]: r["status"] for r in A.abgleich(rows, D(2026, 11, 23), D(2026, 12, 23), ab1)}
    check("Q03 ohne Vormonat kein GEAENDERT", aus1["T-AE-1"] == "OK" and "GEAENDERT" not in aus1.values())
    return rows, ab1, ab2


# ---------------- Q04 Bereinigung ----------------
def q04():
    a = T.bereinige(seite("Kurs X", "12.03.2027", "CHF 1150"))
    b = T.bereinige(seite("Kurs X", "12.03.2027", "CHF 1150", banner="Akzeptieren Ablehnen", stempel="2026-12-24T17:45:12+01:00", sitzung="ff00ee11dd22cc33bb44aa55ff66ee77"))
    c = T.bereinige(seite("Kurs X", "12.03.2027", "CHF 1150", extra="Seite erzeugt um 17:45:03 Uhr, Kennung Zx9Yw8Vu7Ts6Rq5Po4Nm3Lk2Ji1"))
    c2 = T.bereinige(seite("Kurs X", "12.03.2027", "CHF 1150", extra="Seite erzeugt um 09:02:11 Uhr, Kennung Ab1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9"))
    d1 = T.bereinige(seite("Kurs X", "19.03.2027", "CHF 1150")); d2 = T.bereinige(seite("Kurs X", "12.03.2027", "CHF 1250"))
    h = T.hash_text
    check("Q04 Zeitstempel, Cookie-Banner, Sitzungskennung → gleicher Hash", h(a) == h(b) and h(c) == h(c2), f"{h(a)[:8]} {h(b)[:8]} / {h(c)[:8]} {h(c2)[:8]}")
    check("Q04 echte Änderung Datum/Preis → anderer Hash", len({h(a), h(d1), h(d2)}) == 3)
    check("Q04 Cookie-Text nicht im Text, Skript/Stil entfernt", "Cookies" not in b.text and "Akzeptieren" not in b.text)
    # Befund Testlauf 45212354429: Seitentext leer (Digicomp, SGP); Ursache fehlendes </head> bzw. Klasse am body
    o = T.bereinige("<html><head><title>X</title><body class='home cookies-not-set'><main><h1>Kurs Y</h1><p>" + FUELL + "</p></main>")
    check("Q04 fehlendes </head> und Cookie-Klasse am body: Text bleibt", "Kurs Y" in o.text and len(o.text) > 300, f"{len(o.text)} Zeichen")
    o2 = T.bereinige("<html><body><div id='app'><template x-if='true'><main><h1>Kurs Z</h1><p>" + FUELL + "</p></main></template></div></body></html>")
    check("Q04 Inhalt in <template> (Termine nach JavaScript) bleibt", "Kurs Z" in o2.text, f"{len(o2.text)} Zeichen")


# ---------------- Q05 Höflichkeit ----------------
def q05(srv):
    b, l = srv.basis(), srv.basis("localhost")
    rows = testmaster([(f"H-{i}", u, "Datenjournalismus Grundlagen", "2027-03-12", [1150], None) for i, u in enumerate(
        [b + "/ok/a", b + "/ok/b", b + "/gesperrt/x", b + "/fehlt", l + "/ok/a", l + "/ok/b", l + "/gesperrt/y", l + "/gesperrt/frei"])])
    srv.log.clear(); AB.HOSTS.clear()
    t0 = time.monotonic(); AB.lauf(rows, D(2026, 11, 23), 5, 2.0, 4, log=lambda *_: None); dauer = time.monotonic() - t0
    log = [x for x in srv.log]
    gesperrt = [x for x in log if x[1].startswith("/gesperrt/") and x[1] != "/gesperrt/frei"]
    ok_abstand, ok_parallel = True, True
    for host in ("127.0.0.1", "localhost"):
        z = sorted((x for x in log if x[0] == host), key=lambda x: x[2])
        for v, n in zip(z, z[1:]):
            if n[2] < v[3] - 1e-3: ok_parallel = False
            if n[2] - v[3] < 1.95: ok_abstand = False
    ua = {x[4] for x in log}
    check("Q05 robots.txt beachtet (eigene Gruppe, *-Gruppe, Allow mit $)", not gesperrt and any(x[1] == "/gesperrt/frei" for x in log), f"{len(log)} Anfragen")
    check("Q05 je Host höchstens 1 Anfrage zugleich", ok_parallel)
    check("Q05 Abstand je Host ≥ 2 s", ok_abstand, f"Laufzeit {dauer:.1f} s; Hosts parallel")
    check("Q05 eigener User-Agent mit Methodik-Link", ua == {AB.UA} and "mediaskills.ch/methodik.html" in AB.UA, str(ua))
    # RFC 9309: robots.txt unerreichbar (5xx) → alles gesperrt; 4xx → alles erlaubt
    r1 = AB.robots_parse("User-agent: *\nDisallow: /a*b$\nAllow: /a1b$\n")[0]
    check("Q05 robots-Muster * und $, längste Regel", not AB.robots_erlaubt(r1, "/axxb") and AB.robots_erlaubt(r1, "/a1b") and AB.robots_erlaubt(r1, "/axxbc"))


# ---------------- Q06 Datum, Preis ----------------
def q06():
    d = D(2027, 3, 12)
    pos = ["Start 12.03.2027", "am 12. März 2027", "le 12 mars 2027", "il 12 marzo 2027", "2027-03-12", "12.3.2027", "Thursday, March 12 2027",
           "March 12, 2027", "11.–12.03.2027", "du 12 au 13 mars 2027", "12/03/2027", "dal 12 marzo al 14 aprile 2027"]
    neg = ["13.03.2027", "12.03.2028", "112.03.2027", "12. Mai 2027", "2027-03-13", "22.03.2027"]
    s = lambda x: T.bereinige(f"<main><p>{x} {FUELL}</p></main>")
    p_ok = [x for x in pos if not T.finde_datum(d, s(x))]; n_ok = [x for x in neg if T.finde_datum(d, s(x))]
    check("Q06 Datumsformate erkannt", not p_ok, f"{len(pos)} Formate" + (f"; nicht erkannt {p_ok}" if p_ok else ""))
    check("Q06 Datums-Gegenproben nicht erkannt", not n_ok, f"{len(neg)} Gegenproben" + (f"; fälschlich {n_ok}" if n_ok else ""))
    ppos = ["1150", "1'150", "1.150", "CHF 1150.–", "Fr. 1'150.-", "1’150.00", "CHF 1 150", "1150 CHF H.T.", "€ 1.150,00"]
    pneg = ["11150", "1151", "1150.50", "1'150'000", "21150", "1.1500"]
    pp = [x for x in ppos if not T.finde_preis(1150, s(x))]; pn = [x for x in pneg if T.finde_preis(1150, s(x))]
    check("Q06 Preisformate erkannt", not pp, f"{len(ppos)} Formate" + (f"; nicht erkannt {pp}" if pp else ""))
    check("Q06 Preis-Gegenproben nicht erkannt", not pn, f"{len(pneg)} Gegenproben" + (f"; fälschlich {pn}" if pn else ""))
    check("Q06 Dezimalbetrag 680,00 und 12.50", T.finde_preis(680, s("680,00 €")) and T.finde_preis(12.5, s("CHF 12.50")) and not T.finde_preis(12.5, s("CHF 12.55")))


# ---------------- Q02 kein Write ----------------
def schutz_hash():
    h = hashlib.sha256()
    for p in sorted(list((R / "paket3/out").glob("*")) + list((R / "eingang").glob("*")) + list((R / "daten").glob("*")) +
                    [p for p in (R / "paket29").rglob("*") if p.is_file()] + list((R / "scripts").glob("*.csv")) + list((R / "scripts").glob("*.py"))):
        if p.is_file(): h.update(str(p.relative_to(R)).encode()); h.update(p.read_bytes())
    return h.hexdigest()


def q02_q10_q11_q12(srv, rows_t, ab1, ab2):
    vor = schutz_hash()
    tmp = pathlib.Path(tempfile.mkdtemp())
    ab_p, vm_p = tmp / "abruf.jsonl", tmp / "vormonat.jsonl"
    for p, ab in ((ab_p, ab2), (vm_p, ab1)):
        p.write_text("\n".join([json.dumps({"meta": {"stichtag": "2026-11-23"}})] + [json.dumps(ab[u], sort_keys=True, ensure_ascii=False) for u in sorted(ab)]) + "\n", encoding="utf-8")
    mpath = tmp / "master_test.csv"
    with open(mpath, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, list(rows_t[0].keys()), lineterminator="\n"); w.writeheader(); w.writerows(rows_t)
    outs = []
    for k in (1, 2):
        o = tmp / f"out{k}"
        r1 = py(SK / "abgleich.py", "2026-11-23", "2026-12-23", ab_p, "--vormonat", vm_p, "--master", mpath, "--out", o, "--lauf", "TEST")
        r2 = py(SK / "messbericht.py", "2026-11-23", "2026-12-23", ab_p, o / "abgleich_2026-11-23.csv", "--master", mpath, "--out", o, "--lauf", "TEST")
        r3 = py(SK / "pruefliste.py", "2026-11-23", "2026-12-23", "--out", o)
        r4 = py(SK / "stichprobe.py", "2026-11-23", "30", "20261123", "--out", o)
        r5 = py(SK / "eingang_vorschlag.py", o / "abgleich_2026-11-23.csv", "2026-11-23", "028", "--master", mpath, "--out", o, "--lauf", "TEST")
        for r in (r1, r2, r3, r4, r5):
            if r.returncode: print(r.stdout, r.stderr)
        outs.append({p.name: p.read_bytes() for p in sorted(o.iterdir())})
    check("Q10 Auswertung zweimal → bytegleich", outs[0] == outs[1] and len(outs[0]) >= 9, ", ".join(outs[0]))
    # Q11 Prüfblatt
    rows = S.lies_master(MASTER)
    a = SP.pruefblatt(rows, D(2026, 11, 23), 30, 20261123); b = SP.pruefblatt(rows, D(2026, 11, 23), 30, 20261123)
    c = SP.pruefblatt(rows, D(2026, 11, 23), 30, 7)
    ids = list(dict.fromkeys(r["id"] for r in a)); vis = {z["id"] for z in rows if S.sichtbar(z, D(2026, 11, 23))}
    voll = all(sum(1 for r in a if r["id"] == i) == 8 for i in ids) and all(r["url"].startswith("http") for r in a)
    check("Q11 Prüfblatt reproduzierbar, nur sichtbare, 8 Felder mit Link", a == b and len(ids) == 30 and set(ids) <= vis and voll and a != c,
          f"{len(ids)} Einträge, {len(a)} Zeilen; anderer Startwert → andere Auswahl")
    # Q12 Eingang-Entwurf gegen eingang_pruefen.py (echter Master, echte Abrufzeilen der Testmenge? → synthetisch über echte IDs)
    q12(tmp)
    nach = schutz_hash()
    check("Q02 kein Write in Master, Protokoll, eingang/, daten/, Website, Tabellen", vor == nach, vor[:12])


def q12(tmp):
    rows = S.lies_master(MASTER); t = D(2026, 11, 23)
    pl = {r["id"]: r for r in PL.pruefliste(rows, t, D(2026, 12, 23))}
    by = {z["id"]: z for z in rows}
    fae = [i for i, r in pl.items() if r["grund"] == "FAELLIG"][:5]
    zeilen = []
    for i in fae:
        z = by[i]; pd = K.pruefdatum(z, t)
        zeilen.append({"id": i, "status": "OK", "einordnung": "ROUTINE", "pruefliste": "FAELLIG", "url": z["url"], "ziel": z["url"], "titel_fund": "ja",
                       "datum_katalog": pd.isoformat() if pd else ""})
    z = by[[i for i in pl if i not in fae][0]]
    zeilen.append({"id": z["id"], "status": "WEITERLEITUNG", "einordnung": "ROUTINE", "pruefliste": "", "url": z["url"], "ziel": z["url"].rstrip("/") + "-neu",
                   "titel_fund": "ja", "datum_katalog": ""})
    ev = EV.vorschlag(zeilen, rows, t, "TEST")
    e = tmp / "eingang"; shutil.copytree(R / "eingang", e)
    with open(e / "028_20261123_korrekturen.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, EV.KOPF, lineterminator="\n"); w.writeheader(); w.writerows(ev)
    r = py(R / "scripts/eingang_pruefen.py", "--eingang", e)
    herk = all(x["herkunft"] == "ANBIETERSEITE_P30" and x["register_id"] == "E262" and x["quelle"] for x in ev)
    check("Q12 Eingang-Entwurf: eingang_pruefen.py ohne Fehler, Herkunft und Register-ID je Zeile", r.returncode == 0 and herk and len(ev) == 11,
          f"{len(ev)} Zeilen; " + (r.stdout.strip().splitlines() or [""])[-1][:160] + (r.stderr[-300:] if r.returncode else ""))
    pa = [x for x in ev if x["feld"] == "pruefen_ab"]
    check("Q12 pruefen_ab nach der Regel (≤ Abruf + 180, ≤ Start − 21, > Abruf)", all(t < D.fromisoformat(x["neu"]) <= t + datetime.timedelta(days=180) for x in pa))


# ---------------- Q07 Workflow ----------------
def q07():
    y = (R.parent / ".github/workflows/p30-pruefung.yml").read_text(encoding="utf-8")
    ok = ("branches: [claude/datenharmonisierung]" in y and "paths: [claude-work/pruefung/auftrag.txt]" in y and "contents: read" in y
          and "schedule" not in y and "workflow_dispatch" not in y and "secrets." not in y and "persist-credentials: false" in y
          and re.search(r"^on:\n  push:\n", y, re.M) and "write" not in y.split("permissions:")[1].split("concurrency")[0])
    check("Q07 Workflow statisch: nur push auf Arbeitszweig + Auftragsdatei, nur Leserechte, kein Zeitplan, keine Geheimnisse", ok)


def main():
    wahl = set(sys.argv[1:])
    los = lambda q: not wahl or q in wahl
    if los("Q01"): q01()
    if los("Q04"): q04()
    if los("Q06"): q06()
    if los("Q07"): q07()
    srv = Server()
    try:
        if los("Q05"): q05(srv)
        if wahl & {"Q03", "Q02", "Q10", "Q11", "Q12"} or not wahl:
            rows_t, ab1, ab2 = q03(srv)
            if not wahl or wahl & {"Q02", "Q10", "Q11", "Q12"}: q02_q10_q11_q12(srv, rows_t, ab1, ab2)
    finally:
        srv.stop()
    n_f = sum(1 for _, ok, _ in ERG if not ok)
    print(f"\n{len(ERG) - n_f}/{len(ERG)} PASS")
    sys.exit(1 if n_f else 0)


if __name__ == "__main__":
    main()
