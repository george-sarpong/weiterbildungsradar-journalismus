"""Paket 13: Master-Nachtrag zu E098 und E103, ohne den Gesamtlauf run_paket3.sh.
Eingabe paket3/out/master_3818.csv (Paket 11), Ausgabe paket13/out/master_3818_p13.csv. Alte Werte werden geprüft.
Bei der nächsten Master-Fortschreibung in run_paket3.sh übernehmen. Aufruf (aus claude-work/): python3 -I paket13/scripts/master_p13.py"""
import csv, pathlib, hashlib
R = pathlib.Path(__file__).resolve().parents[2]
src = R / "paket3/out/master_3818.csv"; out = R / "paket13/out/master_3818_p13.csv"
ARCH = "ARCHIV: Kurs nicht mehr im Angebot (Nachrecherche 10.11.2026; E015; E103)"
K = [  # id, feld, alt, neu
 ("OFFER-HEAD-003", "url", "https://head.hesge.ch/formations-recherche/initiation-lintelligence-artificielle", "https://head.hesge.ch/formations/formations-continues/initiation-a-lintelligence-artificielle"),
 ("OFFER-HEAD-003", "h_url", "LIVE", "OWNER_E098"),
 ("AT-PROD-OFFER-040", "beta_sichtbar", "JA", "NEIN"), ("AT-PROD-OFFER-040", "beta_grund", "Release 30.09. (E007)", ARCH),
 ("AT-PROD-OFFER-026", "beta_sichtbar", "JA", "NEIN"), ("AT-PROD-OFFER-026", "beta_grund", "Release 30.09. (E007)", ARCH),
]
raw = src.read_text(encoding="utf-8-sig")
rows = list(csv.reader(raw.splitlines(keepends=False)))
head = rows[0]; idx = {c: i for i, c in enumerate(head)}
n = 0
for rid, feld, alt, neu in K:
    hit = [r for r in rows[1:] if r[idx["id"]] == rid]
    assert len(hit) == 1, rid
    assert hit[0][idx[feld]] == alt, (rid, feld, hit[0][idx[feld]])
    hit[0][idx[feld]] = neu; n += 1
out.parent.mkdir(parents=True, exist_ok=True)
with open(out, "w", encoding="utf-8-sig", newline="") as f:
    csv.writer(f, lineterminator="\n").writerows(rows)
print("OK", len(rows) - 1, "Zeilen,", n, "Felder geändert,", hashlib.sha256(out.read_bytes()).hexdigest()[:16])
