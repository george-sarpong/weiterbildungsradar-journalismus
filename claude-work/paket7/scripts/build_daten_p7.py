"""Paket 7, D7 (E043): Kandidaten-Datendatei mit Vier-Felder-Modell aus dem Master.
Eingaben: paket3/out/merge_kandidat_data.json (1'352 Angebote CH/AT/LI), paket3/out/master_3818.csv.
Ausgabe: paket7/website/data-p7.js (window.WEITERBILDUNGSRADAR_OFFERS) – Kandidat, kein Release-Asset.
Je Angebot kommt nur das Feld `laender` hinzu; alle übrigen Felder (auch der Rohwert `country`) bleiben unverändert.
Werte wörtlich aus dem Master, «nicht erfasst» bleibt «nicht erfasst» (E031, E036). Offline, keine Netzwerkaufrufe.
Aufruf (aus claude-work/): python3 paket7/scripts/build_daten_p7.py"""
import csv, json, hashlib, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
P3 = ROOT / "paket3/out"
OUT = ROOT / "paket7/website/data-p7.js"
MARKETS = {"CH", "AT", "LI"}

data = json.loads((P3 / "merge_kandidat_data.json").read_text(encoding="utf-8"))
rows = [r for r in csv.DictReader(open(P3 / "master_3818.csv", encoding="utf-8-sig")) if r["market"] in MARKETS]
master = {}
for r in rows:
    assert r["id"] not in master, f"ID doppelt im Master CH/AT/LI: {r['id']}"
    master[r["id"]] = r
ids = [o["id"] for o in data]
assert len(ids) == len(set(ids)) == len(master) == 1352, (len(ids), len(master))
assert set(ids) == set(master), "Kandidat und Master CH/AT/LI haben verschiedene IDs"

for o in data:
    r = master[o["id"]]
    assert r["release_markt"] == r["market"], o["id"]
    assert "laender" not in o, o["id"]
    o["laender"] = {
        "markt": r["release_markt"],
        "anbieterLand": r["anbieter_land"],
        "ortLand": r["durchfuehrungsort_land"],
        "ortSicherheit": r["durchfuehrungsort_sicherheit"],
        "chZugang": r["ch_zugang"],
    }
    # E030/E066: CH-Zugang JA nur mit CH im Durchführungsort
    assert r["ch_zugang"] != "JA" or "CH" in r["durchfuehrungsort_land"].split("|"), o["id"]

js = "window.WEITERBILDUNGSRADAR_OFFERS = " + json.dumps(data, ensure_ascii=False) + ";\n"
OUT.write_text(js, encoding="utf-8")
print("OK", len(data), "Angebote,", OUT.name, hashlib.sha256(js.encode()).hexdigest())
