"""Paket 25 A1 (SPEZIFIKATION_PAKET25_20261120.md, Entscheid 2 A): einmaliger, eingefrorener Auszug der Lieferform
(`delivery`) aus paket19/out/smart-search-data-p19.json nach paket25/eingang/lieferform_p19.json.
Der Auszug ist danach Eingabe von scripts/master_nachtraege.py; dieses Skript läuft nicht im Build, es dokumentiert nur,
wie der Auszug entstand. Abbruch, wenn die Quelle nicht den festgehaltenen SHA-256 hat (Live-Stand, U3).
Aufruf (aus claude-work/): python3 -I paket25/scripts/auszug_lieferform.py"""
import hashlib, json, pathlib, sys

R = pathlib.Path(__file__).resolve().parents[2]
QUELLE = "paket19/out/smart-search-data-p19.json"
SHA_QUELLE = "7ddd326a26cbaaebcf4a9382c3e97d0f6399e6022d9d93f7ef2c21b377b2a35c"
TEILFELDER = ["channels", "evidenceTier", "materialisationStatus", "scheduleSummary", "sourceText", "structure", "temporalSummary", "variants"]

b = (R / QUELLE).read_bytes()
if hashlib.sha256(b).hexdigest() != SHA_QUELLE: sys.exit("ABBRUCH: Quelle hat nicht den festgehaltenen SHA-256")
S = json.loads(b.decode("utf-8"))
by = {}
for i, v in S["byId"].items():
    d = v["delivery"]
    if sorted(d) != TEILFELDER: sys.exit(f"ABBRUCH: {i}.delivery ohne die 8 Teilfelder")
    by[i] = d
aus = {"quelle": QUELLE, "sha256_quelle": SHA_QUELLE, "register_id": "E193", "teilfelder": TEILFELDER, "byId": by}
ziel = R / "paket25/eingang/lieferform_p19.json"; ziel.parent.mkdir(parents=True, exist_ok=True)
ziel.write_text(json.dumps(aus, ensure_ascii=False) + "\n", encoding="utf-8")
print("OK", len(by), "Einträge,", hashlib.sha256(ziel.read_bytes()).hexdigest())
