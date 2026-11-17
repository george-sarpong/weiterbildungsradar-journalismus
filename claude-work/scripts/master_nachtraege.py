"""Master-Fortschreibung: Nachträge Paket 13 (E098, E103), Paket 14 (E107, E109) und Paket 18 (E118)
auf paket3/out/master_3818.csv (Basis aus build_master_p3.py, bleibt unverändert) → paket3/out/master_3818_aktuell.csv.
Die Basis bleibt, weil paket7/scripts/build_daten_p7.py und die Tests der Pakete 3, 7 und 8 sie byte-genau voraussetzen.
Läuft in run_paket3.sh nach test_paket3.py (der den Bau aus den Quellen prüft).
Jeder alte Wert wird geprüft (sonst Abbruch), jede Änderung bekommt eine Herkunft im h_-Feld und eine Zeile im
Protokoll paket3/out/master_nachtraege_protokoll.csv. Keine stillen Überschreibungen (Projektregel 6).
Idempotent: Eingabe ist immer die Basis.
Aufruf (aus claude-work/): python3 -I scripts/master_nachtraege.py --out paket3/out"""
import argparse, csv, hashlib, json, pathlib, sys

R = pathlib.Path(__file__).resolve().parents[1]
ARCH = "ARCHIV: Kurs nicht mehr im Angebot (Nachrecherche 10.11.2026; E015; E103)"
# Platzhalter-Codes der Website-Daten, die im Master als «nicht erfasst» stehen (build_master_p3.py normalisiert)
LEER_CODES = {"PREIS_NICHT_PUBLIZIERT", "NOT_PUBLISHED"}


def lade(pfad):
    raw = pfad.read_text(encoding="utf-8-sig")
    rows = list(csv.reader(raw.splitlines()))
    return rows[0], rows[1:]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--out", default="paket3/out"); a = ap.parse_args()
    out = R / a.out; mpfad = out / "master_3818_aktuell.csv"
    head, rows = lade(out / "master_3818.csv"); ix = {c: i for i, c in enumerate(head)}
    web = {r[ix["id"]]: r for r in rows if r[ix["kohorte"]] == "WEBSITE_1352"}
    proto = []

    def setze(rid, feld, alt, neu, herkunft, reg, quelle, h_feld=None, alt_master=None):
        r = web.get(rid)
        if r is None: sys.exit(f"ABBRUCH: {rid} nicht im Master (WEBSITE_1352)")
        ist = r[ix[feld]]
        erlaubt = {alt} | ({"nicht erfasst"} if alt in LEER_CODES else set()) | ({alt_master} if alt_master else set())
        if ist not in erlaubt: sys.exit(f"ABBRUCH: {rid}.{feld} ist «{ist}», erwartet «{alt}» (veralteter Nachtrag)")
        r[ix[feld]] = neu
        h = h_feld or ("h_" + feld)
        h_alt = r[ix[h]] if h in ix else ""
        if h in ix: r[ix[h]] = herkunft
        proto.append([rid, feld, ist, neu, h if h in ix else "", h_alt, herkunft, reg, quelle])

    # Paket 13: E098 (URL), E103 (Archiv AT-PROD-OFFER-040, -026), wie paket13/scripts/master_p13.py
    for k in csv.DictReader(open(R / "paket13/config/owner_korrekturen.csv", encoding="utf-8")):
        if k["feld"] == "url":
            setze(k["id"], "url", k["alt"], k["neu"], "OWNER_E098", k["register_id"], k["quelle"])
        elif k["feld"] == "publicationStatus":
            # Master führt die Sichtbarkeit in beta_sichtbar/beta_grund (kein h_-Feld; Herkunft im Protokoll)
            setze(k["id"], "beta_sichtbar", "JA", "NEIN", "OWNER_E103", k["register_id"], k["quelle"], h_feld="-")
            setze(k["id"], "beta_grund", "Release 30.09. (E007)", ARCH, "OWNER_E103", k["register_id"], k["quelle"], h_feld="-")
        elif k["feld"] == "publicationReason":
            pass  # im Master in beta_grund abgebildet (oben)
        else:
            sys.exit(f"ABBRUCH: unbekanntes Feld Paket 13 {k['feld']}")

    # Paket 14: E107, E109 (Mediencampus nach Anbieterseiten)
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

    # Paket 18: E118 (Anbieterland = Sitzland nach Domain-Endung)
    for k in csv.DictReader(open(R / "paket18/config/korrekturen.csv", encoding="utf-8")):
        assert k["feld"] == "laender.anbieterLand", k
        setze(k["id"], "anbieter_land", k["alt"], k["neu"], "DOMAIN_E118", k["register_id"], k["quelle"])
        setze(k["id"], "anbieter_land_beleg", "nicht erfasst", "Domain-Endung der Angebots-URL (E118)", "DOMAIN_E118",
              k["register_id"], k["quelle"], h_feld="-")

    with open(mpfad, "w", encoding="utf-8-sig", newline="") as f:
        csv.writer(f, lineterminator="\n").writerows([head] + rows)
    with open(out / "master_nachtraege_protokoll.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(["id", "feld", "alt", "neu", "h_feld", "h_alt", "herkunft", "register_id", "quelle"]); w.writerows(proto)
    print("OK Master-Nachträge:", len(proto), "Felder,", len({p[0] for p in proto}), "Angebote,",
          hashlib.sha256(mpfad.read_bytes()).hexdigest()[:16])


if __name__ == "__main__":
    main()
