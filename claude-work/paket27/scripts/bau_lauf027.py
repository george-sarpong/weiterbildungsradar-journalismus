"""Paket 27 A5 (E216): Korrekturdatei eingang/027_20261122_korrekturen.csv, einmalig maschinell aus dem Master cf9fdb2d….
Nur das Trennzeichen in sprache und format wird «|» ohne Leerzeichen (« | » und «/»); Reihenfolge der Codes bleibt.
Läuft nicht im Build; dokumentiert. Aufruf (aus claude-work/): python3 -I paket27/scripts/bau_lauf027.py"""
import csv, hashlib, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parents[2]
M = R / "paket3/out/master_3818_aktuell.csv"; SHA = "cf9fdb2d69d6e2a908c08889655b7cf923cdcb8a618c2341b84f5c98b8adad92"
KOPF = ["id", "feld", "alt", "neu", "alt_anzeige", "herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "ursprung"]
b = M.read_bytes()
if hashlib.sha256(b).hexdigest() != SHA: sys.exit("ABBRUCH: Master nicht auf cf9fdb2d…")
out = []
for r in csv.DictReader(b.decode("utf-8-sig").splitlines()):
    for f in ("sprache", "format"):
        v = r[f]; n = re.sub(r"\s*[|/]\s*", "|", v)
        if n != v: out.append([r["id"], f, v, n, "", "NORMIERUNG_P27", "E216",
                               "SPEZIFIKATION_PAKET27_20261122.md A5: nur Trennzeichen vereinheitlicht, Werte und Reihenfolge unverändert", "", "", ""])
p = R / "eingang/027_20261122_korrekturen.csv"
with open(p, "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f, lineterminator="\n"); w.writerow(KOPF); w.writerows(out)
print(f"OK {len(out)} Zeilen: sprache {sum(z[1] == 'sprache' for z in out)}, format {sum(z[1] == 'format' for z in out)}")
