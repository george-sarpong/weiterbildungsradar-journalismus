"""Master-Fortschreibung: paket3/out/master_3818.csv (Basis aus build_master_p3.py, bleibt unverändert)
→ paket3/out/master_3818_aktuell.csv und Protokoll paket3/out/master_nachtraege_protokoll.csv.
Die Basis bleibt, weil paket7/scripts/build_daten_p7.py und die Tests der Pakete 3, 7 und 8 sie byte-genau voraussetzen.
Paket 26 (SPEZIFIKATION_PAKET26_20261121.md A6, E203): ein einziger Eingang claude-work/eingang/ statt der Paketblöcke
13–22; dieselbe Prüfung wie scripts/eingang_pruefen.py (gemeinsamer Code scripts/eingang.py), bei einem Fehler wird
nichts geschrieben. Der Altbestand (Korrekturen der Pakete 13, 14, 16, 17, 18, 21, 22 und das neue Angebot aus Paket 22)
steht überführt in eingang/013_… bis 022_… (paket26/scripts/ueberfuehren.py); die Altdateien bleiben als Beleg (A8).
Unverändert: Basis, Anzeigefelder am Ende (Paket 24 A1: termin_, ort_, dauer_, preis_, durchfuehrungen_anzeige mit h_;
leer = Original gilt), Platzhalterregel SENT, Regeln P24 A4/A5, der Lieferform-Schritt aus Paket 25 (unten; nach den
Läufen bis 022, vor den Läufen ab 026), die Ausgabeform. Keine stillen Überschreibungen (Projektregel 6).
Idempotent: Eingabe ist immer die Basis.
Aufruf (aus claude-work/): python3 -I scripts/master_nachtraege.py --out paket3/out [--eingang eingang]"""
import argparse, hashlib, json, pathlib, sys

sys.dont_write_bytecode = True  # kein __pycache__ im Repo

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))  # -I nimmt das Skriptverzeichnis nicht in sys.path
import eingang as E  # noqa: E402

R = pathlib.Path(__file__).resolve().parents[1]


def lieferform_schritt(M):
    """Paket 25 (A1, B05): Lieferform aus dem eingefrorenen Auszug; Abbruch vor jedem Schreiben bei fehlender, fremder
    oder doppelter ID und bei einem Eintrag ohne genau die 8 Teilfelder. DE/USA «nicht erfasst», Herkunft LEER
    (Master-Regel für «nicht erfasst», wie h_lieferform, h_durchfuehrungen). Eine Protokollzeile je gesetzter Zelle."""
    head, rows, ix, proto = M.head, M.rows, M.ix, M.proto
    LF = "paket25/eingang/lieferform_p19.json"; LF_COLS = ["lieferform_json", "h_lieferform_json"]
    if any(c in head for c in LF_COLS): sys.exit("ABBRUCH: Master enthält schon lieferform_json")
    TF = E.TF
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
    M.head = head = head + LF_COLS; M.neu_index(); ix = M.ix
    quelle = f"{LF} (Auszug aus {AUS.get('quelle')}, SHA-256 {AUS.get('sha256_quelle')})"
    for r in rows:
        r.extend(["nicht erfasst", "LEER"])
        i = r[ix["id"]]
        if r[ix["release_markt"]] in ("CH", "AT", "LI"):
            r[ix["lieferform_json"]] = json.dumps(by[i], ensure_ascii=False); r[ix["h_lieferform_json"]] = "SMART_P19"
            proto.append([i, "lieferform_json", "nicht erfasst", r[ix["lieferform_json"]], "h_lieferform_json", "LEER", "SMART_P19", "E193", quelle])


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--out", default="paket3/out"); ap.add_argument("--eingang", default=str(R / "eingang"))
    a = ap.parse_args()
    out = R / a.out; mpfad = out / "master_3818_aktuell.csv"
    try:
        M = E.Master(out / "master_3818.csv"); T = E.Tabellen()
        E.wende_an(M, T, pathlib.Path(a.eingang), lieferform_schritt)
    except E.Abbruch as e:
        sys.exit("\n".join("ABBRUCH: " + f for f in e.fehler))
    M.schreibe(mpfad, out / "master_nachtraege_protokoll.csv")
    print("OK Master-Nachträge:", len(M.proto), "Felder,", len({p[0] for p in M.proto}), "Angebote,",
          hashlib.sha256(mpfad.read_bytes()).hexdigest()[:16])


if __name__ == "__main__":
    main()
