"""Paket 29 U2 / V5: fügt die Messung paket29/out/u2/ (messung_u2.js je Stichtag) zusammen.
- paket29/out/sollliste_u2.csv  verbindliche Sollliste für P04: alle Änderungen der 60 Anfragen (T01–T20, 40 virtuelle) in
  Smart- und Katalogsuche und der 4 Trennzeichen-Anfragen (E221, entfällt mit P29: E251), an 3 Stichtagen.
- paket29/out/messliste_u2.csv  je Stichtag, Angebot und Feld: Rohtext, Anzeigetext, Wörter nur roh / nur Anzeige.
- paket29/out/wortprobe_u2.csv  zusätzlich: je Wort aus der Messliste als Einwort-Anfrage Treffer vorher/nachher (nicht verbindlich).
Aufruf (aus claude-work/): python3 -I paket29/scripts/sollliste_u2.py 2026-11-23 2026-12-01 2026-12-20"""
import csv, json, pathlib, sys

R = pathlib.Path(__file__).resolve().parents[2]
U2, OUT = R / "paket29/out/u2", R / "paket29/out"
csv.field_size_limit(10 ** 9)


def main():
    tage = sys.argv[1:]
    if len(tage) != 3: sys.exit("drei Stichtage angeben")
    soll, mess, wort, info = [], [], [["stichtag", "suchart", "wort", "treffer_vorher", "treffer_nachher"]], {}
    for i, s in enumerate(tage):
        z = json.loads((U2 / f"zusammenfassung_{s}.json").read_text(encoding="utf-8"))
        if z["haken_abweichungen"] or z["js_fehler"]: sys.exit(f"{s}: Haken-Abweichungen oder JS-Fehler")
        rows = list(csv.reader((U2 / f"sollliste_{s}.csv").open(encoding="utf-8")))
        if i == 0: soll.append(rows[0])
        soll += [r for r in rows[1:] if not r[2].startswith("W ")]
        m = list(csv.reader((U2 / f"messliste_{s}.csv").open(encoding="utf-8")))
        if i == 0: mess.append(m[0])
        mess += m[1:]
        for k, v in z["je_anfrage"].items():
            art, qid = k.split(" ", 1)
            if qid.startswith("W "): wort.append([s, art, v["anfrage"], v["vorher"], v["nachher"]])
        info[s] = {"sichtbar": z["sichtbar"], "geaendert_q60": z["geaendert_q60"], "geaendert_e221": z["geaendert_e221"],
                   "sollzeilen_q60_e221": sum(1 for r in rows[1:] if not r[2].startswith("W ")), "wortprobe": z["wortprobe"],
                   "wortprobe_anfragen_geaendert_beide_sucharten": sum(1 for k, v in z["je_anfrage"].items() if " W " in f" {k}" and v["aenderungen"])}
    for name, rows in (("sollliste_u2.csv", soll), ("messliste_u2.csv", mess), ("wortprobe_u2.csv", wort)):
        with (OUT / name).open("w", encoding="utf-8", newline="") as f: csv.writer(f, lineterminator="\n").writerows(rows)
    (OUT / "sollliste_u2_info.json").write_text(json.dumps(info, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(json.dumps(info, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
