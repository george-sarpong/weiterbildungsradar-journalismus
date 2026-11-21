"""Paket 25 «Generator Master → Website» (SPEZIFIKATION_PAKET25_20261120.md A2–A7; Entscheide 1–3 je A, E192–E194).
Liest nur den Master (paket3/out/master_3818_aktuell.csv) und die Platzhaltertabelle (scripts/generator_platzhalter.csv);
schreibt die Datendatei (paket25/website/data-p25.js) und die Smart-Datei (paket25/out/smart-search-data-p25.json).
Keine weiteren Eingaben, keine Website-, Smart- oder Korrekturdatei; der Master wird nur gelesen (E031).
- Auswahl A3: release_markt CH, AT, LI (E074); alle Zeilen, auch gesperrte und abgelaufene (E121 bis P28/E172);
  Reihenfolge = Master-Reihenfolge (E194).
- Felder A4: 25 Felder + laender (5 Teilfelder, wörtlich); Anzeigefeld vor Original bei Termin, Ort, Dauer, Preis,
  Durchführungen (E113, E114); sessions nur bei Durchführungsliste; publicationStatus/-Reason nur, wenn erfasst;
  kein Feld korrekturen (E152, E156); feste Schlüsselreihenfolge.
- Platzhalter A5: «nicht erfasst» → Code bzw. leer bzw. Feld entfällt laut Platzhaltertabelle (E192); in einem Feld ohne
  Tabelleneintrag: Abbruch.
- Smart A6: byId in der Reihenfolge der Datendatei; parserStatus, priceEligible (Wahrheitswert), priceOptions (JSON,
  «nicht erfasst» → []), delivery aus lieferform_json (E193); meta = feste Kennungen + rosterCount.
- Abbruch A7 vor jedem Schreiben, Meldung mit ID und Feld; der Ausgabeordner bleibt dann bytegleich.
Aufruf (aus claude-work/): python3 -I scripts/generator_website.py [--master …] [--platzhalter …] [--daten …] [--smart …]"""
import argparse, csv, io, json, os, pathlib, sys, tempfile

R = pathlib.Path(__file__).resolve().parents[1]
PRE = "window.WEITERBILDUNGSRADAR_OFFERS = "
NE = "nicht erfasst"
MAERKTE = ("CH", "AT", "LI")
# Website-Feld -> Master-Feld (wie test_paket24.py MAP); Reihenfolge = Schlüsselreihenfolge im Datensatz, nach «id»
MAP = {"provider": "anbieter", "title": "titel", "description": "beschreibung", "access": "zugang_text", "level": "niveau",
       "language": "sprache", "country": "country_roh", "url": "url", "approved": "geprueft_am", "reviewAfter": "pruefen_ab",
       "focus": "fokus", "offerType": "angebotsart_roh", "priceDisplay": "preis_text", "priceCategory": "preis_kategorie",
       "format": "format", "duration": "dauer", "start": "termin_text", "startDate": "start_datum", "endDate": "end_datum",
       "region": "ort_text", "release_origin": "release_herkunft", "publicationStatus": "publikationsstatus",
       "publicationReason": "publikationsgrund", "sessions": "durchfuehrungen"}
LMAP = {"markt": "release_markt", "anbieterLand": "anbieter_land", "ortLand": "durchfuehrungsort_land",
        "ortSicherheit": "durchfuehrungsort_sicherheit", "chZugang": "ch_zugang"}
ANZ = {"termin_text": "termin_anzeige", "ort_text": "ort_anzeige", "dauer": "dauer_anzeige", "preis_text": "preis_anzeige",
       "durchfuehrungen": "durchfuehrungen_anzeige"}
SMART_COLS = ["preis_parser_status", "preis_budgetfaehig", "preis_optionen", "lieferform_json"]
TF = ["channels", "evidenceTier", "materialisationStatus", "scheduleSummary", "sourceText", "structure", "temporalSummary", "variants"]
META = {"version": "MS12_SMART_DATA_R1_20261008", "rosterCount": None, "priceParser": "PRICE_PARSER_V1_010_CANDIDATE_C23",
        "priceResolver": "PRICE_RESOLVER_V1_003_RECONCILED",
        "deliveryModel": "MEDIASKILLS_DELIVERY_MODEL_V1_READONLY_SIDECAR_R3_BUGFIX_20261007",
        "r11Policy": "BLIND_NO_STRUCTURED_SEMANTIC_OPENING"}


def abbruch(msg):
    sys.exit("ABBRUCH: " + msg)


def lade_tabelle(p):
    tab = {}
    for z in csv.DictReader(open(p, encoding="utf-8")):
        f, w = z["website_feld"], z["wirkung"]
        if f not in MAP or w not in ("CODE", "LEER", "ENTFAELLT") or f in tab or (w == "CODE") != bool(z["wert"]):
            abbruch(f"Platzhaltertabelle: ungültige Zeile {z}")
        tab[f] = (w, z["wert"])
    return tab


def json_wert(rid, feld, v, typ):
    try: x = json.loads(v)
    except ValueError: abbruch(f"{rid}.{feld}: ungültiges JSON")
    if not isinstance(x, typ): abbruch(f"{rid}.{feld}: falscher Typ {type(x).__name__}, erwartet {typ.__name__}")
    return x


def baue(master, tab):
    raw = master.read_bytes().decode("utf-8-sig")
    recs = list(csv.reader(io.StringIO(raw)))
    if not recs: abbruch("Master leer")
    head = recs[0]
    pflicht = ["id", "kohorte"] + list(MAP.values()) + list(ANZ.values()) + list(LMAP.values()) + SMART_COLS
    for c in pflicht:
        if head.count(c) != 1: abbruch(f"Pflichtspalte {c} fehlt im Master (oder doppelt)")
    ix = {c: head.index(c) for c in pflicht}
    gesehen = set()
    for k, r in enumerate(recs[1:], 2):
        if len(r) != len(head): abbruch(f"Master-Zeile {k}: {len(r)} statt {len(head)} Spalten (Feld id {r[ix['id']] if len(r) > ix['id'] else '?'})")
        rid = r[ix["id"]]
        if not rid.strip(): abbruch(f"Master-Zeile {k}: leere ID (Feld id)")
        if rid in gesehen: abbruch(f"{rid}: doppelte ID (Feld id)")
        gesehen.add(rid)
    daten, by = [], {}
    for r in recs[1:]:
        if r[ix["release_markt"]] not in MAERKTE: continue
        rid = r[ix["id"]]
        wert = lambda mf: r[ix[ANZ[mf]]] if mf in ANZ and r[ix[ANZ[mf]]] != "" else r[ix[mf]]
        o = {"id": rid}
        for wf, mf in MAP.items():
            v = wert(mf)
            if v == NE:
                if wf not in tab: abbruch(f"{rid}.{wf} ({mf}): «nicht erfasst» ohne Eintrag in der Platzhaltertabelle")
                w, code = tab[wf]
                if w == "CODE": o[wf] = code
                elif w == "LEER": o[wf] = ""
                continue                                   # ENTFAELLT: Feld fehlt
            if wf == "sessions":
                o[wf] = json_wert(rid, ANZ[mf] if r[ix[ANZ[mf]]] != "" else mf, v, list)
            else:
                o[wf] = v
        if r[ix["durchfuehrungen"]] != NE: json_wert(rid, "durchfuehrungen", r[ix["durchfuehrungen"]], list)  # Typ auch hinter einem Anzeigefeld
        o["laender"] = {lf: r[ix[mf]] for lf, mf in LMAP.items()}
        # Smart (A6)
        ps = r[ix["preis_parser_status"]]
        if ps == NE: abbruch(f"{rid}.parserStatus (preis_parser_status): «nicht erfasst» ohne Eintrag in der Platzhaltertabelle")
        pe = r[ix["preis_budgetfaehig"]]
        if pe not in ("True", "False"): abbruch(f"{rid}.priceEligible (preis_budgetfaehig): unbekannter Wert «{pe}» (nur True/False)")
        po = r[ix["preis_optionen"]]
        po = [] if po == NE else json_wert(rid, "preis_optionen", po, list)
        lf = r[ix["lieferform_json"]]
        if lf == NE or not lf.strip(): abbruch(f"{rid}.lieferform_json: fehlt (CH/AT/LI)")
        d = json_wert(rid, "lieferform_json", lf, dict)
        if sorted(d) != TF: abbruch(f"{rid}.lieferform_json: nicht genau die 8 Teilfelder")
        daten.append(o)
        by[rid] = {"parserStatus": ps, "priceEligible": pe == "True", "priceOptions": po, "delivery": d}
    meta = dict(META); meta["rosterCount"] = len(daten)
    return PRE + json.dumps(daten, ensure_ascii=False) + ";\n", json.dumps({"meta": meta, "byId": by}, ensure_ascii=False), len(daten)


def schreibe(auftraege):
    """Gegenprüfung S2: erst alle Zwischendateien schreiben, dann alle ersetzen; bei einem Fehler davor bleiben die
    bisherigen Ausgaben bytegleich und keine Zwischendatei liegen."""
    tmps = []
    try:
        for ziel, text in auftraege:
            ziel.parent.mkdir(parents=True, exist_ok=True)
            fd, tmp = tempfile.mkstemp(dir=ziel.parent, prefix=".tmp-"); tmps.append(tmp)
            with os.fdopen(fd, "w", encoding="utf-8", newline="") as f: f.write(text)
            os.chmod(tmp, 0o644)
    except BaseException:
        for tmp in tmps:
            if os.path.exists(tmp): os.remove(tmp)
        raise
    for (ziel, _), tmp in zip(auftraege, tmps): os.replace(tmp, ziel)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--master", default=str(R / "paket3/out/master_3818_aktuell.csv"))
    ap.add_argument("--platzhalter", default=str(R / "scripts/generator_platzhalter.csv"))
    ap.add_argument("--daten", default=str(R / "paket25/website/data-p25.js"))
    ap.add_argument("--smart", default=str(R / "paket25/out/smart-search-data-p25.json"))
    a = ap.parse_args()
    tab = lade_tabelle(a.platzhalter)
    d, s, n = baue(pathlib.Path(a.master), tab)          # alles prüfen und bauen, erst dann schreiben (A7)
    schreibe([(pathlib.Path(a.daten), d), (pathlib.Path(a.smart), s)])
    print(f"OK Generator: {n} Angebote; {a.daten} {len(d.encode())} Byte; {a.smart} {len(s.encode())} Byte")


if __name__ == "__main__":
    main()
