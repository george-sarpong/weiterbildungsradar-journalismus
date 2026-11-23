"""Paket 30 A1 (SPEZIFIKATION_PAKET30_20261123.md, E177): Prüfliste des Monatsbuilds.
Je am Stichtag sichtbares Angebot ein Grund: FAELLIG (pruefen_ab ≤ nächster Build) und/oder
FAELLT_WEG (sichtbar am Stichtag, nicht mehr am nächsten Build; Grund nach scripts/sichtbarkeit.py).
Liest nur den Master, schreibt nur die Ausgabedatei (E175, E031).
Aufruf (aus claude-work/): python3 -I paket30/scripts/pruefliste.py JJJJ-MM-TT JJJJ-MM-TT
         [--master paket3/out/master_3818_aktuell.csv] [--out paket30/out]
         → <out>/pruefliste_<Stichtag>.csv, Sortierung Anbieter, Titel, id (casefold)."""
import argparse, csv, pathlib, sys

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(R / "scripts"))
import sichtbarkeit as S  # noqa: E402

KOPF = ["id", "market", "anbieter", "titel", "url", "geprueft_am", "pruefen_ab", "grund", "wegfall_grund"]


def pruefliste(rows, t, n):
    """rows: Master-Zeilen (dict); t: Stichtag; n: nächster Build (date). Liefert Liste von dict nach KOPF."""
    if n <= t: raise ValueError("nächster Build muss nach dem Stichtag liegen")
    aus = []
    for z in rows:
        if not S.sichtbar(z, t): continue
        p = S.datum(z["pruefen_ab"]); g = []
        if p is None or p <= n: g.append("FAELLIG")   # ohne gültiges Datum: fällig (nichts still auslassen, E031)
        wg = S.grund(z, n)
        if wg != "SICHTBAR": g.append("FAELLT_WEG")
        if not g: continue
        aus.append({"id": z["id"], "market": z["market"], "anbieter": z["anbieter"], "titel": z["titel"], "url": z["url"],
                    "geprueft_am": z["geprueft_am"], "pruefen_ab": z["pruefen_ab"], "grund": "+".join(g),
                    "wegfall_grund": "" if wg == "SICHTBAR" else wg})
    aus.sort(key=lambda r: (r["anbieter"].casefold(), r["titel"].casefold(), r["id"]))
    return aus


def schreibe(p, liste):
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, KOPF, lineterminator="\n"); w.writeheader(); w.writerows(liste)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("stichtag"); ap.add_argument("naechster_build")
    ap.add_argument("--master", default=str(R / "paket3/out/master_3818_aktuell.csv")); ap.add_argument("--out", default=str(R / "paket30/out"))
    a = ap.parse_args(); t, n = S.datum(a.stichtag), S.datum(a.naechster_build)
    if t is None or n is None: sys.exit("ABBRUCH: Daten als JJJJ-MM-TT")
    try: liste = pruefliste(S.lies_master(a.master), t, n)
    except ValueError as e: sys.exit(f"ABBRUCH: {e}")
    p = pathlib.Path(a.out) / f"pruefliste_{a.stichtag}.csv"; schreibe(p, liste)
    nf = sum("FAELLIG" in r["grund"] for r in liste); nw = sum("FAELLT_WEG" in r["grund"] for r in liste)
    print(f"OK Prüfliste {a.stichtag} → {a.naechster_build}: {len(liste)} Angebote (fällig {nf}, fällt weg {nw}) → {p}")


if __name__ == "__main__":
    main()
