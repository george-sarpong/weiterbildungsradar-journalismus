"""Paket 30 A3, A4 (SPEZIFIKATION_PAKET30_20261123.md, E261, E262): Abgleich der Abrufdaten mit dem Katalog.
Je Angebot ein Status nach Vorrang LINK_DEFEKT > NICHT_LESBAR > WEITERLEITUNG > WERT_FEHLT > GEAENDERT > OK; `merkmale` nennt alle.
- LINK_DEFEKT: HTTP 4xx ausser 401/403/429/451, 5xx (nach zweitem Versuch), Namensauflösung, Verbindung abgelehnt, TLS-Fehler
- NICHT_LESBAR: robots.txt sperrt (auch: robots.txt nicht erreichbar, RFC 9309), Zeitüberschreitung, Host ruht, 401/403/429/451
  (Zugang oder Abwehr von Robotern), kein HTML (z. B. PDF), Seite nur mit JavaScript, zu gross; prüft Claude im Chat (Chrome, wie E139)
- WEITERLEITUNG: Ziel nach Weiterleitung ≠ Kurslink (verglichen ohne http/https, «www.», Schrägstrich am Ende, Anker)
- WERT_FEHLT: Titel, Prüfdatum oder ein Betrag des Katalogs nicht auf der Seite
- GEAENDERT: Hash anders als im Vormonat (nur wenn beide Läufe eine Seite hatten)
Einordnung (E262): ZWEIFEL (Owner) = Link tot; Weiterleitung oder Seite ohne den Titel (Kurs nicht mehr im Angebot?);
CHROME (Claude) = NICHT_LESBAR, Datum fehlt und die Seite nennt kein Datum; ROUTINE (Claude über eingang/) = übrige.
Liest Master, Abrufdaten und Prüfliste; schreibt nur in --out. Gleiche Eingaben → bytegleiche Ausgaben (Q10).

Aufruf (aus claude-work/): python3 -I paket30/scripts/abgleich.py <Stichtag> <nächster Build> <abruf.jsonl>
         [--vormonat <abruf.jsonl>] [--nachpruefung <csv: url,erreichbar,bemerkung>] [--lauf <Lauf-ID>] [--master …] [--out paket30/out]"""
import argparse, csv, json, pathlib, sys, urllib.parse

sys.dont_write_bytecode = True
HIER = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HIER))
import p30_katalog as K  # noqa: E402
import pruefliste as PL  # noqa: E402

S, R = K.S, K.R
VORRANG = ["LINK_DEFEKT", "NICHT_LESBAR", "WEITERLEITUNG", "WERT_FEHLT", "GEAENDERT", "OK"]
NICHT_LESBAR_HTTP = {401, 403, 429, 451}
NICHT_LESBAR_FEHLER = {"ROBOTS", "TIMEOUT", "HOST_RUHT", "TYP", "GROESSE", "KODIERUNG", "VERBINDUNG", "SCHLEIFE", "ZU_VIELE_WEITERLEITUNGEN"}
DEFEKT_FEHLER = {"DNS", "VERBINDUNG_ABGELEHNT", "TLS", "KEINE_ADRESSE"}
KOPF = ["id", "market", "anbieter", "titel", "url", "sichtbar", "pruefliste", "status", "merkmale", "einordnung", "http_erst", "http",
        "ziel", "fehler", "titel_fund", "datum_katalog", "datum_fund", "preis_katalog", "preis_fehlt", "kandidaten_daten", "kandidaten_preise",
        "hash", "hash_vormonat", "seitentitel", "vorschlag"]


def url_norm(u):
    p = urllib.parse.urlsplit((u or "").strip())
    host = (p.hostname or "").lower()
    if host.startswith("www."): host = host[4:]
    port = f":{p.port}" if p.port and p.port not in (80, 443) else ""
    pfad = urllib.parse.unquote(p.path or "/").rstrip("/") or "/"
    return f"{host}{port}{pfad}" + (f"?{p.query}" if p.query else "")


def lies_abruf(p):
    if not p: return {}, {}
    zeilen = [json.loads(l) for l in pathlib.Path(p).read_text(encoding="utf-8").splitlines() if l.strip()]
    meta = zeilen[0].get("meta", {}) if zeilen and "meta" in zeilen[0] else {}
    return meta, {e["url"]: e for e in zeilen if "url" in e}


def lies_nachpruefung(p):
    if not p: return {}
    with open(p, encoding="utf-8") as f: return {r["url"]: r for r in csv.DictReader(f)}


def bewerte(z, e, vor, t):
    """z: Master-Zeile, e: Abrufzeile der URL, vor: Abrufzeile des Vormonats oder None. Liefert (status, merkmale, details)."""
    m, d = [], {}
    st, f = e.get("status"), e.get("fehler")
    if f in DEFEKT_FEHLER or (st is not None and st >= 400 and st not in NICHT_LESBAR_HTTP and not f):
        m.append("LINK_DEFEKT")
    elif f in NICHT_LESBAR_FEHLER or (st in NICHT_LESBAR_HTTP) or e.get("nur_js") or f:
        m.append("NICHT_LESBAR")
    if url_norm(e.get("ziel")) != url_norm(e.get("url")) and len(e.get("kette", [])) > 1: m.append("WEITERLEITUNG")
    w = (e.get("werte") or {}).get(z["id"])
    if w is not None and "NICHT_LESBAR" not in m:
        d["titel_fund"] = "ja" if w.get("titel") else "nein"
        d["titel_ort"] = (w.get("titel") or [""])[0]
        dfund = w.get("datum") or {}
        d["datum_fund"] = "" if not dfund else ("ja" if all(dfund.values()) else "nein")
        pf = [b for b, x in (w.get("preis") or {}).items() if not x]
        d["preis_fehlt"] = " / ".join(pf)
        if d["titel_fund"] == "nein" or d["datum_fund"] == "nein" or pf: m.append("WERT_FEHLT")
        if vor and vor.get("hash") and e.get("hash") and vor["hash"] != e["hash"]: m.append("GEAENDERT")
    status = next((s for s in VORRANG if s in m), "OK")
    return status, m, d


def _uebergeordnet(url, ziel):
    """Ziel ist ein übergeordneter Pfad oder die Startseite des Kurslinks (Übersicht statt Kursseite)."""
    a, b = urllib.parse.urlsplit(url), urllib.parse.urlsplit(ziel or "")
    pa, pb = (a.path or "/").rstrip("/"), (b.path or "/").rstrip("/")
    return pb == "" or (pa != pb and pa.startswith(pb + "/"))


def einordnen(status, m, d, e, ziel_mehrfach=False):
    kd = (e.get("kandidaten") or {}).get("daten") or []
    if "LINK_DEFEKT" in m:
        return "ZWEIFEL", "Link defekt: Nachfolgeseite suchen; ohne Nachfolger Archiv nach E015 (Owner)"
    if "NICHT_LESBAR" in m:
        return "CHROME", "Seite nicht maschinell lesbar: Claude prüft im Chat (Chrome, wie E139)"
    if d.get("titel_fund") == "nein":
        return "ZWEIFEL", ("Weiterleitung, Titel am Ziel nicht gefunden" if "WEITERLEITUNG" in m else "Titel nicht auf der Seite") + \
            ": Kurs nicht mehr im Angebot? (Owner, Archiv nach E015)"
    if "WEITERLEITUNG" in m:   # Gegenprüfung B1: Weiterleitung auf Übersicht, Sammel- oder Entwurfsseite entscheidet der Owner (E262)
        grund = []
        if d.get("titel_ort") not in ("seitentitel", "h1"): grund.append("Titel nur im Fliesstext")
        if _uebergeordnet(e.get("url"), e.get("ziel")): grund.append("Ziel ist übergeordnete Seite")
        if ziel_mehrfach: grund.append("mehrere Kurslinks führen auf dieses Ziel")
        if d.get("datum_fund") == "nein": grund.append("Termin am Ziel nicht gefunden")
        if grund:
            return "ZWEIFEL", f"Weiterleitung auf {e.get('ziel')} ({'; '.join(grund)}): Kursseite verschoben oder Kurs nicht mehr im Angebot? (Owner, E015)"
    teile = []
    if "WEITERLEITUNG" in m: teile.append(f"neue Adresse {e.get('ziel')}")
    if d.get("datum_fund") == "nein":
        if not kd: return "CHROME", "Datum fehlt, Seite nennt kein Datum (Termine evtl. nur mit JavaScript): Claude prüft im Chat"
        teile.append("neuer Termin? Seite nennt " + ", ".join(kd[:5]))
    if d.get("preis_fehlt"): teile.append(f"Preis {d['preis_fehlt']} nicht auf der Seite; Seite nennt " + (", ".join((e.get('kandidaten') or {}).get('preise') or []) or "keinen Betrag"))
    if "GEAENDERT" in m and not teile: teile.append("Seite geändert, Katalogwerte gefunden: Claude sichtet")
    if not teile: teile.append("Werte bestätigt: geprueft_am setzen")
    return "ROUTINE", "; ".join(teile)


def abgleich(rows, t, n, abruf, vormonat=None, nachpruefung=None):
    vormonat = vormonat or {}; nachpruefung = nachpruefung or {}
    pl = {r["id"]: r["grund"] for r in PL.pruefliste(rows, t, n)}
    by = {z["id"]: z for z in rows}
    from collections import Counter
    zielzahl = Counter(url_norm(e.get("ziel")) for e in abruf.values() if url_norm(e.get("ziel")) != url_norm(e.get("url")))
    aus = []
    for u, e in sorted(abruf.items()):
        for i in e.get("ids", []):
            z = by.get(i)
            if z is None: raise ValueError(f"ID {i} aus dem Abruf fehlt im Master")
            status, m, d = bewerte(z, e, vormonat.get(u), t)
            mehrfach = zielzahl[url_norm(e.get("ziel"))] > 1 or len({by[x]["titel"] for x in e.get("ids", []) if x in by}) > 1
            einord, vorschlag = einordnen(status, m, d, e, mehrfach and "WEITERLEITUNG" in m)
            np = nachpruefung.get(u)
            if np and status == "NICHT_LESBAR": vorschlag += f"; Nachprüfung: {np.get('erreichbar')} {np.get('bemerkung', '')}".rstrip()
            pd = K.pruefdatum(z, t)
            aus.append({"id": i, "market": z["market"], "anbieter": z["anbieter"], "titel": z["titel"], "url": u,
                        "sichtbar": "JA" if S.sichtbar(z, t) else "NEIN", "pruefliste": pl.get(i, ""), "status": status, "merkmale": "+".join(m),
                        "einordnung": einord, "http_erst": "" if e.get("erst_status") is None else str(e["erst_status"]),
                        "http": "" if e.get("status") is None else str(e["status"]), "ziel": e.get("ziel") or "", "fehler": e.get("fehler") or "",
                        "titel_fund": d.get("titel_fund", ""), "datum_katalog": pd.isoformat() if pd else "", "datum_fund": d.get("datum_fund", ""),
                        "preis_katalog": " / ".join(f"{b:g}" for b in K.betraege(z)), "preis_fehlt": d.get("preis_fehlt", ""),
                        "kandidaten_daten": " ".join((e.get("kandidaten") or {}).get("daten") or []),
                        "kandidaten_preise": " | ".join((e.get("kandidaten") or {}).get("preise") or []),
                        "seitentitel": " | ".join(x for x in dict.fromkeys([e.get("seitentitel") or "", e.get("h1") or ""]) if x),
                        "hash": e.get("hash") or "", "hash_vormonat": (vormonat.get(u) or {}).get("hash") or "", "vorschlag": vorschlag})
    aus.sort(key=lambda r: (VORRANG.index(r["status"]), r["anbieter"].casefold(), r["titel"].casefold(), r["id"]))
    return aus


def schreibe(p, kopf, zeilen):
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, kopf, lineterminator="\n", extrasaction="ignore"); w.writeheader(); w.writerows(zeilen)


OWNER_KOPF = ["nr", "url", "anzahl", "ids", "anbieter", "titel", "status", "http", "ziel", "seitentitel", "vorschlag", "entscheid_owner"]


def owner_liste(aus):
    """Zweifelsfälle je Kurslink zusammengefasst (ein Entscheid je Seite), Reihenfolge Status, Anbieter, Link."""
    g = {}
    for r in aus:
        if r["einordnung"] != "ZWEIFEL": continue
        g.setdefault(r["url"], []).append(r)
    zeilen = []
    for u, rs in sorted(g.items(), key=lambda kv: (A_VOR(kv[1][0]["status"]), kv[1][0]["anbieter"].casefold(), kv[0])):
        zeilen.append({"url": u, "anzahl": len(rs), "ids": " ".join(r["id"] for r in rs), "anbieter": rs[0]["anbieter"],
                       "titel": " | ".join(r["titel"] for r in rs), "status": rs[0]["status"], "http": rs[0]["http"], "ziel": rs[0]["ziel"],
                       "seitentitel": rs[0]["seitentitel"], "vorschlag": rs[0]["vorschlag"], "entscheid_owner": ""})
    for i, z in enumerate(zeilen, 1): z["nr"] = i
    return zeilen


def A_VOR(s): return VORRANG.index(s)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("stichtag"); ap.add_argument("naechster_build"); ap.add_argument("abruf")
    ap.add_argument("--vormonat", default=""); ap.add_argument("--nachpruefung", default=""); ap.add_argument("--lauf", default="")
    ap.add_argument("--master", default=str(R / "paket3/out/master_3818_aktuell.csv")); ap.add_argument("--out", default=str(R / "paket30/out"))
    a = ap.parse_args(); t, n = S.datum(a.stichtag), S.datum(a.naechster_build)
    if t is None or n is None: sys.exit("ABBRUCH: Daten als JJJJ-MM-TT")
    meta, ab = lies_abruf(a.abruf)
    if meta.get("stichtag") and meta["stichtag"] != a.stichtag: sys.exit(f"ABBRUCH: Abruf hat Stichtag {meta['stichtag']}")
    _, vor = lies_abruf(a.vormonat) if a.vormonat else ({}, {})
    try: aus = abgleich(S.lies_master(a.master), t, n, ab, vor, lies_nachpruefung(a.nachpruefung))
    except ValueError as e: sys.exit(f"ABBRUCH: {e}")
    o = pathlib.Path(a.out)
    schreibe(o / f"abgleich_{a.stichtag}.csv", KOPF, aus)
    schreibe(o / f"owner_liste_{a.stichtag}.csv", OWNER_KOPF, owner_liste(aus))
    schreibe(o / f"chrome_liste_{a.stichtag}.csv", KOPF, [r for r in aus if r["einordnung"] == "CHROME"])
    schreibe(o / f"routine_{a.stichtag}.csv", KOPF, [r for r in aus if r["einordnung"] == "ROUTINE"])
    from collections import Counter
    c = Counter(r["status"] for r in aus); e = Counter(r["einordnung"] for r in aus)
    print(f"OK Abgleich {a.stichtag}: {len(aus)} Angebote; " + ", ".join(f"{k} {c[k]}" for k in VORRANG if c[k]) +
          f"; Owner {e['ZWEIFEL']}, Chrome {e['CHROME']}, Routine {e['ROUTINE']} → {o}")


if __name__ == "__main__":
    main()
