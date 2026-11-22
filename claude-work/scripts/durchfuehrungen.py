"""Paket 27 A6 (SPEZIFIKATION_PAKET27_20261122.md, E215): Durchführungstabelle, bei jedem Build aus dem Master abgeleitet;
keine Quelle. Eine Zeile je Eintrag aus durchfuehrungen_anzeige (sonst durchfuehrungen); sonst eine Zeile je Angebot mit
start_datum oder end_datum. Nur vorhandene Werte (E031): Fehlendes bleibt «nicht erfasst»; Ort und Kursform stehen am
Angebot und werden nicht je Termin abgeleitet (region nur, wo der Eintrag sie selbst trägt).
Aufruf (aus claude-work/): python3 -I scripts/durchfuehrungen.py [--master …] [--out paket27/out]"""
import argparse, csv, io, json, pathlib, sys

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[1]
NE = "nicht erfasst"
KOPF = ["angebot_id", "nr", "start", "ende", "label", "region", "quellfeld"]


def zeilen(rows):
    for z in rows:
        q = "durchfuehrungen_anzeige" if z["durchfuehrungen_anzeige"] else "durchfuehrungen"
        if z[q] not in ("", NE):
            for k, e in enumerate(json.loads(z[q]), 1):
                yield [z["id"], k] + [e.get(c) if e.get(c) not in (None, "") else NE for c in ("startDate", "endDate", "label", "region")] + [q]
        elif z["start_datum"] != NE or z["end_datum"] != NE:
            label = z["termin_anzeige"] or z["termin_text"]
            yield [z["id"], 1, z["start_datum"], z["end_datum"], label, NE, "start_datum/end_datum"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--master", default=str(R / "paket3/out/master_3818_aktuell.csv")); ap.add_argument("--out", default=str(R / "paket27/out"))
    a = ap.parse_args()
    rows = list(csv.DictReader(io.StringIO(pathlib.Path(a.master).read_text(encoding="utf-8-sig"))))
    out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True); p = out / "durchfuehrungen.csv"
    z = list(zeilen(rows))
    with open(p, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, lineterminator="\n"); w.writerow(KOPF); w.writerows(z)
    print(f"OK Durchführungen: {len(z)} Zeilen, {len({x[0] for x in z})} Angebote, aus Liste {sum(x[6] != 'start_datum/end_datum' for x in z)}")


if __name__ == "__main__":
    main()
