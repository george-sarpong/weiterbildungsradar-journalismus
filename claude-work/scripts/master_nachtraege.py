"""Master-Fortschreibung: Nachträge Paket 13 (E098, E103), Paket 14 (E107, E109) und Paket 18 (E118)
auf paket3/out/master_3818.csv (Basis aus build_master_p3.py, bleibt unverändert) → paket3/out/master_3818_aktuell.csv.
Die Basis bleibt, weil paket7/scripts/build_daten_p7.py und die Tests der Pakete 3, 7 und 8 sie byte-genau voraussetzen.
Paket 21 (E118, E123, E132–E137, E066) aus paket21/config/korrekturen.csv.
Paket 22 (E142 Archiv, E144 CH-Zugang) aus paket22/config/korrekturen.csv; E143 neue Angebote aus paket22/config/neue_angebote.json
als neue Zeilen am Ende (Kohorte NEU_P22; Dateiname master_3818_aktuell.csv bleibt, Zeilenzahl jetzt 3'819).
Paket 24 (Spezifikation SPEZIFIKATION_PAKET24_20261120.md, Owner-Freigabe 20.11.2026): Anzeigetexte der Pakete 16 (E113)
und 17 (E114) in fünf Anzeigefeldern am Ende (termin_, ort_, dauer_, preis_, durchfuehrungen_anzeige, je mit h_-Feld);
leer = Original gilt; Originalfelder bleiben (E113). Sperren E103/E142 auch in publikationsstatus/-grund. Reihenfolge
13, 14, 16, 17, 18, 21, 22; ein späterer Nachtrag am Originalfeld leert ein früheres Anzeigefeld («überholt», A5).
Paket 25 (SPEZIFIKATION_PAKET25_20261120.md A1, Entscheid 2 A): Lieferform als Spalte lieferform_json (+ h_lieferform_json)
am Ende, aus dem eingefrorenen Auszug paket25/eingang/lieferform_p19.json; letzter Schritt nach Paket 22; bestehende
Spalten bleiben unverändert (auch lieferform, lieferform_struktur).
Läuft in run_paket3.sh nach test_paket3.py (der den Bau aus den Quellen prüft).
Jeder alte Wert wird geprüft (sonst Abbruch), jede Änderung bekommt eine Herkunft im h_-Feld und eine Zeile im
Protokoll paket3/out/master_nachtraege_protokoll.csv. Keine stillen Überschreibungen (Projektregel 6).
Idempotent: Eingabe ist immer die Basis.
Aufruf (aus claude-work/): python3 -I scripts/master_nachtraege.py --out paket3/out"""
import argparse, ast, csv, hashlib, json, pathlib, re, sys

R = pathlib.Path(__file__).resolve().parents[1]
ARCH = "ARCHIV: Kurs nicht mehr im Angebot (Nachrecherche 10.11.2026; E015; E103)"
NE = "nicht erfasst"


def lade_sent():
    """Platzhalterregel SENT aus build_master_p3.py (eine Quelle, A6): Codes, die der Master als «nicht erfasst» führt."""
    for z in (R / "scripts/build_master_p3.py").read_text(encoding="utf-8").splitlines():
        m = re.fullmatch(r"SENT = re\.compile\((r'.*'), re\.I\)", z.strip())
        if m: return re.compile(ast.literal_eval(m.group(1)), re.I)
    sys.exit("ABBRUCH: SENT in build_master_p3.py nicht gefunden")


SENT = lade_sent()
leer = lambda v: not str(v).strip() or bool(SENT.match(str(v).strip()))
# Anzeigefelder (A1): Originalfeld -> Anzeigefeld; Website-Feld -> Originalfeld
ANZ = {"termin_text": "termin_anzeige", "ort_text": "ort_anzeige", "dauer": "dauer_anzeige", "preis_text": "preis_anzeige",
       "durchfuehrungen": "durchfuehrungen_anzeige"}
ANZ_COLS = [c for a in ANZ.values() for c in (a, "h_" + a)]
WEB = {"start": "termin_text", "region": "ort_text", "duration": "dauer", "priceDisplay": "preis_text"}


def lade(pfad):
    raw = pfad.read_text(encoding="utf-8-sig")
    rows = list(csv.reader(raw.splitlines()))
    return rows[0], rows[1:]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--out", default="paket3/out"); a = ap.parse_args()
    out = R / a.out; mpfad = out / "master_3818_aktuell.csv"
    head, rows = lade(out / "master_3818.csv")
    if any(c in head for c in ANZ_COLS): sys.exit("ABBRUCH: Basis enthält schon Anzeigefelder")
    head = head + ANZ_COLS; rows = [r + [""] * len(ANZ_COLS) for r in rows]  # leer = Original gilt (A1)
    ix = {c: i for i, c in enumerate(head)}
    web = {r[ix["id"]]: r for r in rows if r[ix["kohorte"]] == "WEBSITE_1352"}
    proto = []

    def passt(ist, alt):
        # Altwert-Prüfung mit Platzhalterregel SENT (A6): Code oder leer im Nachtrag = «nicht erfasst» im Master
        return ist == alt or (ist == NE and leer(alt))

    def anzeige(r, feld):
        # aktueller Stand eines Felds mit Anzeigefeld: Anzeigefeld, falls gesetzt, sonst Original (A4)
        a = ANZ.get(feld)
        return r[ix[a]] if a and r[ix[a]] != "" else r[ix[feld]]

    def setze(rid, feld, alt, neu, herkunft, reg, quelle, h_feld=None, alt_master=None, alt_web=None):
        r = web.get(rid)
        if r is None: sys.exit(f"ABBRUCH: {rid} nicht im Master (WEBSITE_1352)")
        ist = r[ix[feld]]
        if not (passt(ist, alt) or (alt_master and ist == alt_master)):
            sys.exit(f"ABBRUCH: {rid}.{feld} ist «{ist}», erwartet «{alt}» (veralteter Nachtrag)")
        a = ANZ.get(feld)
        if a and alt_web is not None and not passt(anzeige(r, feld), alt_web):
            sys.exit(f"ABBRUCH: {rid}.{feld} zeigt «{anzeige(r, feld)}», Nachtrag erwartet «{alt_web}» (veralteter Nachtrag)")
        r[ix[feld]] = neu
        h = h_feld or ("h_" + feld)
        h_alt = r[ix[h]] if h in ix else ""
        if h in ix: r[ix[h]] = herkunft
        proto.append([rid, feld, ist, neu, h if h in ix else "", h_alt, herkunft, reg, quelle])
        if a and r[ix[a]] != "":
            # A5: späterer Nachtrag am Originalfeld überholt ein früheres Anzeigefeld
            proto.append([rid, a, r[ix[a]], "", "h_" + a, r[ix["h_" + a]], "", reg, f"überholt durch Paket {PAKET}"])
            r[ix[a]] = ""; r[ix["h_" + a]] = ""

    def setze_anzeige(rid, feld, alt, neu, herkunft, reg, quelle):
        # Pakete 16/17: Anzeigetext ins Anzeigefeld, Original bleibt (A1, A2); alt gegen aktuellen Stand (A4)
        r = web.get(rid)
        if r is None: sys.exit(f"ABBRUCH: {rid} nicht im Master (WEBSITE_1352)")
        a = ANZ[feld]; ist = anzeige(r, feld)
        if not passt(ist, alt): sys.exit(f"ABBRUCH: {rid}.{a} ist «{ist}», erwartet «{alt}» (veralteter Nachtrag)")
        vorher, h_vorher = r[ix[a]], r[ix["h_" + a]]
        neu_a, herk = ("", "") if neu == r[ix[feld]] else (neu, herkunft)  # gleich dem Original: Original gilt
        r[ix[a]] = neu_a; r[ix["h_" + a]] = herk
        proto.append([rid, a, vorher, neu_a, "h_" + a, h_vorher, herk, reg, quelle])

    def setze_termin(rid, teil, alt, neu, herkunft, reg, quelle):
        # Paket 17: Teilkorrektur einer Durchführung (sessions[i].label/region); Anzeigefeld = ganze Liste als JSON (A1)
        r = web.get(rid)
        if r is None: sys.exit(f"ABBRUCH: {rid} nicht im Master (WEBSITE_1352)")
        m = re.fullmatch(r"sessions\[(\d+)\]\.(label|region)", teil)
        if not m: sys.exit(f"ABBRUCH: unbekanntes Teilfeld {rid} {teil}")
        a = "durchfuehrungen_anzeige"; vorher, h_vorher = r[ix[a]], r[ix["h_" + a]]
        try: liste = json.loads(anzeige(r, "durchfuehrungen"))
        except ValueError: sys.exit(f"ABBRUCH: {rid} hat keine Durchführungsliste für {teil}")
        i, k = int(m.group(1)), m.group(2)
        if i >= len(liste) or not passt(str(liste[i].get(k, "")), alt):
            sys.exit(f"ABBRUCH: {rid}.{teil} ist «{liste[i].get(k) if i < len(liste) else '(fehlt)'}», erwartet «{alt}» (veralteter Nachtrag)")
        liste[i][k] = neu; neu_a = json.dumps(liste, ensure_ascii=False)
        r[ix[a]] = neu_a; r[ix["h_" + a]] = herkunft
        proto.append([rid, a, vorher, neu_a, "h_" + a, h_vorher, herkunft, reg, f"{teil}: {quelle}"])

    PAKET = 13

    # Paket 13: E098 (URL), E103 (Archiv AT-PROD-OFFER-040, -026), wie paket13/scripts/master_p13.py
    for k in csv.DictReader(open(R / "paket13/config/owner_korrekturen.csv", encoding="utf-8")):
        if k["feld"] == "url":
            setze(k["id"], "url", k["alt"], k["neu"], "OWNER_E098", k["register_id"], k["quelle"])
        elif k["feld"] == "publicationStatus":
            # Master führt die Sichtbarkeit in beta_sichtbar/beta_grund (kein h_-Feld; Herkunft im Protokoll)
            setze(k["id"], "beta_sichtbar", "JA", "NEIN", "OWNER_E103", k["register_id"], k["quelle"], h_feld="-")
            setze(k["id"], "beta_grund", "Release 30.09. (E007)", ARCH, "OWNER_E103", k["register_id"], k["quelle"], h_feld="-")
            setze(k["id"], "publikationsstatus", k["alt"], k["neu"], "OWNER_E103", k["register_id"], k["quelle"])  # Paket 24 A3
        elif k["feld"] == "publicationReason":
            # Sichtbarkeit oben in beta_grund; Paket 24 A3: Website-Text auch in publikationsgrund
            setze(k["id"], "publikationsgrund", k["alt"], k["neu"], "OWNER_E103", k["register_id"], k["quelle"])
        else:
            sys.exit(f"ABBRUCH: unbekanntes Feld Paket 13 {k['feld']}")

    # Paket 14: E107, E109 (Mediencampus nach Anbieterseiten)
    PAKET = 14
    MAP14 = {"priceDisplay": "preis_text", "priceCategory": "preis_kategorie", "duration": "dauer", "approved": "geprueft_am"}
    for k in csv.DictReader(open(R / "paket14/config/korrekturen.csv", encoding="utf-8")):
        herk = "ANBIETERSEITE_" + k["register_id"]
        setze(k["id"], MAP14[k["feld"]], k["alt"], k["neu"], herk, k["register_id"], k["quelle"])
        if k["feld"] == "priceDisplay" and k["neu"] == "CHF 1'150":
            # wie build_daten_p14.py für die Smart-Daten: Preisoption NOT_PUBLISHED -> EXACT 1150 CHF
            r = web[k["id"]]; alt = r[ix["preis_optionen"]]; po = json.loads(alt)
            assert len(po) == 1 and po[0]["amountType"] == "NOT_PUBLISHED", (k["id"], po)
            po[0].update({"amountType": "EXACT", "amount": 1150.0, "currency": "CHF", "tariffLabel": "Regulärer Preis"})
            setze(k["id"], "preis_optionen", alt, json.dumps(po, ensure_ascii=False), herk, k["register_id"], k["quelle"])

    # Paket 16 (E113) und 17 (E114): Anzeigetexte in die Anzeigefelder (Paket 24 A1, A7)
    for PAKET, pfade, herk in ((16, ["paket16/config/korrekturen.csv"], "ANZEIGE_E113"),
                               (17, ["paket17/config/korrekturen.csv", "paket17/config/korrekturen_preis.csv"], "ANZEIGE_E114")):
        for p in pfade:
            for k in csv.DictReader(open(R / p, encoding="utf-8")):
                if k["feld"] in WEB:
                    setze_anzeige(k["id"], WEB[k["feld"]], k["alt"], k["neu"], herk, k["register_id"], k["quelle"])
                elif k["feld"].startswith("sessions["):
                    setze_termin(k["id"], k["feld"], k["alt"], k["neu"], herk, k["register_id"], k["quelle"])
                else:
                    sys.exit(f"ABBRUCH: unbekanntes Feld Paket {PAKET} {k['feld']}")

    # Paket 18: E118 (Anbieterland = Sitzland nach Domain-Endung)
    PAKET = 18
    for k in csv.DictReader(open(R / "paket18/config/korrekturen.csv", encoding="utf-8")):
        assert k["feld"] == "laender.anbieterLand", k
        setze(k["id"], "anbieter_land", k["alt"], k["neu"], "DOMAIN_E118", k["register_id"], k["quelle"])
        setze(k["id"], "anbieter_land_beleg", "nicht erfasst", "Domain-Endung der Angebots-URL (E118)", "DOMAIN_E118",
              k["register_id"], k["quelle"], h_feld="-")

    # Paket 21: E118/E123/E132/E133 (Anbieterland), E134–E137 (Durchführungsort), E066 (CH-Zugang)
    PAKET = 21
    for k in csv.DictReader(open(R / "paket21/config/korrekturen.csv", encoding="utf-8")):
        mf = k["master_feld"]; reg = k["register_id"]
        herk = {"E118": "IMPRESSUM_E118", "E123": "IMPRESSUM_E123", "E132": "UID_REGISTER_E132", "E133": "IMPRESSUM_E133",
                "E134": "OWNER_E134", "E135": "OWNER_E135", "E136": "ANBIETERSEITE_E136", "E137": "ANBIETER_STANDORTE_E137", "E139": "ANBIETERSEITE_E139",
                "E066": "REGEL_E066"}[reg]
        h = {"durchfuehrungsort_sicherheit": "h_durchfuehrungsort_land"}.get(mf)  # Sicherheitsgrad teilt das h_-Feld des Ortslands
        # Website-Altwert gegen die aktuelle Anzeige (A4); ein früheres Anzeigefeld wird geleert (A5)
        setze(k["id"], mf, k["master_alt"], k["neu"], herk, reg, k["quelle"], h_feld=h, alt_web=k["alt"] if mf in ANZ else None)
        if mf == "anbieter_land":
            setze(k["id"], "anbieter_land_beleg", web[k["id"]][ix["anbieter_land_beleg"]], k["quelle"][:300], herk, reg, k["quelle"], h_feld="-")
        if mf == "ch_zugang":
            setze(k["id"], "ch_zugang_regel", web[k["id"]][ix["ch_zugang_regel"]], "Durchführungsort CH genannt (E066), " + k["quelle"].split(";")[0], herk, reg, k["quelle"], h_feld="-")

    # Paket 22: E142 (Archiv Digicomp 041/044/033), E144 (CH-Zugang MAZ-086/AJM-002 nach E066)
    PAKET = 22
    for k in csv.DictReader(open(R / "paket22/config/korrekturen.csv", encoding="utf-8")):
        mf = k["master_feld"]; reg = k["register_id"]
        if mf in ("beta_sichtbar", "beta_grund"):
            setze(k["id"], mf, k["master_alt"], "NEIN" if mf == "beta_sichtbar" else k["neu"], "OWNER_" + reg, reg, k["quelle"], h_feld="-")
            # Paket 24 A3: Sperre auch in publikationsstatus/-grund wie auf der Website
            pf = {"publicationStatus": "publikationsstatus", "publicationReason": "publikationsgrund"}[k["feld"]]
            setze(k["id"], pf, k["alt"], k["neu"], "OWNER_" + reg, reg, k["quelle"])
        elif mf == "ch_zugang":
            setze(k["id"], mf, k["master_alt"], k["neu"], "ANBIETERSEITE_" + reg, reg, k["quelle"])
            setze(k["id"], "ch_zugang_regel", web[k["id"]][ix["ch_zugang_regel"]], "Durchführungsort CH genannt (E066), " + k["quelle"].split(":")[0] + " (" + reg + ")",
                  "ANBIETERSEITE_" + reg, reg, k["quelle"], h_feld="-")
        else:
            sys.exit(f"ABBRUCH: unbekanntes Feld Paket 22 {mf}")

    # Paket 22: E143 neue Angebote als eigene Zeilen (Kohorte NEU_P22), jede Zelle im Protokoll mit alt «(neu)»
    NEU = json.loads((R / "paket22/config/neue_angebote.json").read_text(encoding="utf-8"))
    for a in NEU["angebote"]:
        o, s = a["offer"], a["smart"]; reg = NEU["register_id"]; herk = "ANBIETERSEITE_" + reg
        if any(r[ix["id"]] == o["id"] for r in rows): sys.exit(f"ABBRUCH: {o['id']} schon im Master")
        z = {c: ("" if c in ANZ_COLS else "LEER" if c.startswith("h_") else "nicht erfasst") for c in head}
        L = o["laender"]
        werte = {"market": L["markt"], "id": o["id"], "kohorte": "NEU_P22", "anbieter": o["provider"], "titel": o["title"],
                 "beschreibung": o["description"], "url": o["url"], "sprache": o["language"], "niveau": o["level"], "fokus": o["focus"],
                 "angebotsart_roh": o["offerType"], "format": o["format"], "dauer": o["duration"], "termin_text": o["start"],
                 "start_datum": o["startDate"], "end_datum": o["endDate"], "durchfuehrungen": json.dumps(o["sessions"], ensure_ascii=False),
                 "ort_text": o["region"], "preis_text": o["priceDisplay"], "preis_kategorie": o["priceCategory"], "zugang_text": o["access"],
                 "geprueft_am": o["approved"], "pruefen_ab": o["reviewAfter"], "release_herkunft": o["release_origin"], "country_roh": o["country"],
                 "preis_parser_status": s["parserStatus"], "preis_budgetfaehig": str(s["priceEligible"]),
                 "preis_optionen": json.dumps(s["priceOptions"], ensure_ascii=False)}
        for c in list(werte):
            if "h_" + c in ix and c not in ("market", "id", "kohorte"): z["h_" + c] = herk
        werte.update({"sammelobjekt": "NEIN", "objektklasse": "STABLE_OFFER", "objektklasse_regel": "offerType KURS", "h_objektklasse": "REGEL",
                      "release_markt": L["markt"], "h_release_markt": "OWNER_" + reg, "anbieter_land": L["anbieterLand"], "h_anbieter_land": "DOMAIN_E118",
                      "anbieter_land_beleg": "Domain-Endung der Angebots-URL (E118)", "durchfuehrungsort_land": L["ortLand"],
                      "durchfuehrungsort_sicherheit": L["ortSicherheit"], "h_durchfuehrungsort_land": herk, "ch_zugang": L["chZugang"],
                      "h_ch_zugang": "REGEL_E066", "ch_zugang_regel": f"Durchführungsort CH genannt (E066), Kursseite 19.11. ({reg})",
                      "schutz_307": "NEIN", "owner_offen": "", "beta_sichtbar": "JA", "beta_grund": f"Neu aufgenommen 19.11.2026 ({reg})",
                      "url_identitaet": "EINDEUTIG", "h_url_identitaet": herk, "v288_geprueft": "NEIN", "schutz_grund": "KEIN_SCHUTZ",
                      "gold": "NEIN", "dedupe_status": "EINDEUTIG", "dedupe_referenz": ""})
        for c, v in werte.items():
            assert c in ix, c; z[c] = v
        rows.append([z[c] for c in head])
        proto.extend([o["id"], c, "(neu)", z[c], "", "", herk, reg, NEU["quelle"]] for c in head if z[c] not in ("nicht erfasst", "LEER", ""))

    # Paket 25 (A1, B05): Lieferform aus dem eingefrorenen Auszug; Abbruch vor jedem Schreiben bei fehlender, fremder
    # oder doppelter ID und bei einem Eintrag ohne genau die 8 Teilfelder. DE/USA «nicht erfasst», Herkunft LEER
    # (Master-Regel für «nicht erfasst», wie h_lieferform, h_durchfuehrungen). Eine Protokollzeile je gesetzter Zelle.
    PAKET = 25
    LF = "paket25/eingang/lieferform_p19.json"; LF_COLS = ["lieferform_json", "h_lieferform_json"]
    if any(c in head for c in LF_COLS): sys.exit("ABBRUCH: Master enthält schon lieferform_json")
    TF = ["channels", "evidenceTier", "materialisationStatus", "scheduleSummary", "sourceText", "structure", "temporalSummary", "variants"]
    def paare(ps):
        d = {}
        for k, v in ps:
            if k in d: sys.exit(f"ABBRUCH: {LF}: Schlüssel {k} doppelt (ID bzw. Teilfeld der Lieferform)")
            d[k] = v
        return d
    # Gegenprüfung H4: Auszug eingefroren (SHA-256 festgehalten), Herkunftsangaben im Auszug geprüft
    SHA_AUSZUG, SHA_QUELLE = "d1bd2836e0d323728fac094906e01ee6fb40fcbe5cd404ca64efe11de82fc0e8", "7ddd326a26cbaaebcf4a9382c3e97d0f6399e6022d9d93f7ef2c21b377b2a35c"
    lfb = (R / LF).read_bytes()
    if hashlib.sha256(lfb).hexdigest() != SHA_AUSZUG: sys.exit(f"ABBRUCH: {LF} hat nicht den festgehaltenen SHA-256 (Feld lieferform_json)")
    try: AUS = json.loads(lfb.decode("utf-8"), object_pairs_hook=paare)
    except ValueError as e: sys.exit(f"ABBRUCH: {LF} ungültiges JSON ({e})")
    by = AUS.get("byId") if isinstance(AUS, dict) else None
    if not isinstance(by, dict): sys.exit(f"ABBRUCH: {LF} ohne byId")
    if (AUS.get("quelle"), AUS.get("sha256_quelle")) != ("paket19/out/smart-search-data-p19.json", SHA_QUELLE): sys.exit(f"ABBRUCH: {LF}: Quelle oder SHA-256 der Quelle falsch")
    ziel = [r[ix["id"]] for r in rows if r[ix["release_markt"]] in ("CH", "AT", "LI")]
    fehlt = [i for i in ziel if i not in by]; fremd = [i for i in by if i not in set(ziel)]
    if fehlt: sys.exit(f"ABBRUCH: {LF}: Lieferform fehlt für {fehlt[:5]} (Feld lieferform_json)")
    if fremd: sys.exit(f"ABBRUCH: {LF}: fremde ID {fremd[:5]} (nicht CH/AT/LI im Master)")
    for i, d in by.items():
        if not isinstance(d, dict) or sorted(d) != TF: sys.exit(f"ABBRUCH: {LF}: {i}.lieferform_json hat nicht genau die 8 Teilfelder")
    head = head + LF_COLS; ix.update({c: len(head) - 2 + k for k, c in enumerate(LF_COLS)})
    quelle = f"{LF} (Auszug aus {AUS.get('quelle')}, SHA-256 {AUS.get('sha256_quelle')})"
    for r in rows:
        r.extend(["nicht erfasst", "LEER"])
        i = r[ix["id"]]
        if r[ix["release_markt"]] in ("CH", "AT", "LI"):
            r[ix["lieferform_json"]] = json.dumps(by[i], ensure_ascii=False); r[ix["h_lieferform_json"]] = "SMART_P19"
            proto.append([i, "lieferform_json", "nicht erfasst", r[ix["lieferform_json"]], "h_lieferform_json", "LEER", "SMART_P19", "E193", quelle])

    with open(mpfad, "w", encoding="utf-8-sig", newline="") as f:
        csv.writer(f, lineterminator="\n").writerows([head] + rows)
    with open(out / "master_nachtraege_protokoll.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(["id", "feld", "alt", "neu", "h_feld", "h_alt", "herkunft", "register_id", "quelle"]); w.writerows(proto)
    print("OK Master-Nachträge:", len(proto), "Felder,", len({p[0] for p in proto}), "Angebote,",
          hashlib.sha256(mpfad.read_bytes()).hexdigest()[:16])


if __name__ == "__main__":
    main()
