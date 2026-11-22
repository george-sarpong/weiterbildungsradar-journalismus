"""Paket 26 A5 (SPEZIFIKATION_PAKET26_20261121.md): prüft den Eingang claude-work/eingang/ vor dem Schreiben.
Wendet Basis und alle Eingangsdateien der Reihe nach im Speicher an (mit dem Lieferform-Schritt P25 vor den Läufen ab 026),
schreibt nichts. Bei einem Fehler: alle Fehler der ersten fehlerhaften Datei mit Datei, Zeile, Spalte, Regel und Grund,
Rückgabecode 1. Regeln K01–K14, N01–N11 in scripts/eingang.py. Ohne Netzabruf.
Mit --schema-bericht DATEI zusätzlich (und nur dann eine Datei): der ganze Master nach allen Läufen gegen die Feldtabelle,
Abweichungen je Spalte gezählt; nur Bericht, kein Abbruch (Altwerte wie «FR | EN» bleiben bis P27).
Aufruf (aus claude-work/): python3 -I scripts/eingang_pruefen.py [--eingang eingang] [--basis paket3/out/master_3818.csv]
                            [--schema-bericht paket26/out/schema_bericht.csv]"""
import argparse, csv, pathlib, sys

sys.dont_write_bytecode = True  # E04: das Prüfskript schreibt nichts, auch keinen __pycache__
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import eingang as E               # noqa: E402
import master_nachtraege as MN    # noqa: E402  (Lieferform-Schritt P25, eine Quelle)

R = E.R


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--eingang", default=str(R / "eingang")); ap.add_argument("--basis", default=str(R / "paket3/out/master_3818.csv"))
    ap.add_argument("--schema-bericht", default=None)
    a = ap.parse_args()
    try:
        M = E.Master(a.basis); T = E.Tabellen()
        erg = E.wende_an(M, T, pathlib.Path(a.eingang), MN.lieferform_schritt)
    except E.Abbruch as e:
        print("\n".join("FEHLER " + f for f in e.fehler)); print(f"ABBRUCH: {len(e.fehler)} Fehler, nichts geschrieben"); sys.exit(1)
    for name, n in erg: print(f"OK {name}: {n} Zeilen")
    for datei, rid, ref, url in M.geteilt: print(f"GETEILTE ADRESSE {datei}: {rid} wie {ref} ({url}), url_geteilt = JA (E206)")
    print(f"OK Eingang: {len(erg)} Dateien, Master {len(M.rows)} Zeilen × {len(M.head)} Spalten, Protokoll {len(M.proto)} Zeilen")
    if a.schema_bericht:
        z = E.schema_bericht(M, T)
        with open(a.schema_bericht, "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f, lineterminator="\n"); w.writerow(["spalte", "typ", "abweichungen", "gruende", "beispiele"]); w.writerows(z)
        print(f"OK Schema-Bericht {a.schema_bericht}: {sum(1 for x in z if x[2])} Spalten mit Abweichungen, {sum(x[2] for x in z)} Zellen")


if __name__ == "__main__":
    main()
