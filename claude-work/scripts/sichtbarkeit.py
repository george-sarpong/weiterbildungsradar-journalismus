"""Paket 27 A7 (SPEZIFIKATION_PAKET27_20261122.md, E216): Sichtbarkeit berechnet statt gespeichert.
sichtbar(zeile, stichtag) folgt der Regel von app-v43.js (Z. 109–134): Markt der Website (CH, AT, LI; Generator A3),
nicht HOLD, aktuell. Aktuell: mit Durchführungen (durchfuehrungen_anzeige, sonst durchfuehrungen; wie der Generator)
ein Termin mit Start ≥ Stichtag; sonst Ende ≥ Stichtag bzw. ohne Ende Start ≥ Stichtag oder kein Start.
beta_sichtbar und beta_grund (Stand Paket 4) bleiben historische Spalten und werden hier nicht gelesen.
Aufruf (aus claude-work/): python3 -I scripts/sichtbarkeit.py JJJJ-MM-TT [--master paket3/out/master_3818_aktuell.csv]
                           [--out paket27/out]  → <out>/sichtbarkeit_<Stichtag>.csv (id, market, sichtbar, grund)"""
import argparse, csv, datetime, io, json, pathlib, re, sys

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[1]
NE = "nicht erfasst"
MAERKTE = ("CH", "AT", "LI")
ISO = re.compile(r"\d{4}-\d{2}-\d{2}")


def datum(v):
    v = str(v or "").strip()
    if not ISO.fullmatch(v): return None
    try: return datetime.date.fromisoformat(v)
    except ValueError: return None


def grund(z, t):
    """Grund als Code: MARKT, HOLD, KEIN_KUENFTIGER_TERMIN, ABGELAUFEN oder SICHTBAR. z: dict einer Master-Zeile."""
    if z["release_markt"] not in MAERKTE: return "MARKT"
    if z["publikationsstatus"] == "HOLD": return "HOLD"
    s = z["durchfuehrungen_anzeige"] or z["durchfuehrungen"]
    if s != NE:
        liste = json.loads(s)
        return "SICHTBAR" if any((datum(e.get("startDate")) or datetime.date.min) >= t for e in liste) else "KEIN_KUENFTIGER_TERMIN"
    ende, start = datum(z["end_datum"]), datum(z["start_datum"])
    return "SICHTBAR" if (not ende or ende >= t) and (ende or not start or start >= t) else "ABGELAUFEN"


def sichtbar(z, t): return grund(z, t) == "SICHTBAR"


def lies_master(p):
    return list(csv.DictReader(io.StringIO(pathlib.Path(p).read_text(encoding="utf-8-sig"))))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("stichtag")
    ap.add_argument("--master", default=str(R / "paket3/out/master_3818_aktuell.csv")); ap.add_argument("--out", default=str(R / "paket27/out"))
    a = ap.parse_args(); t = datum(a.stichtag)
    if t is None: sys.exit("ABBRUCH: Stichtag JJJJ-MM-TT")
    rows = lies_master(a.master); out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
    p = out / f"sichtbarkeit_{a.stichtag}.csv"; n = 0
    with open(p, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, lineterminator="\n"); w.writerow(["id", "market", "sichtbar", "grund"])
        for z in rows:
            g = grund(z, t); n += g == "SICHTBAR"; w.writerow([z["id"], z["market"], "JA" if g == "SICHTBAR" else "NEIN", g])
    print(f"OK Sichtbarkeit {a.stichtag}: {n} von {len(rows)} sichtbar → {p.relative_to(R) if p.is_relative_to(R) else p}")


if __name__ == "__main__":
    main()
