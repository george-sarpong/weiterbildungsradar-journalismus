"""Paket 19 Teil B (E152, E156): Website-Daten ohne das Feld `korrekturen`; die Herkunft bleibt im Master, im
Nachtragsprotokoll und im Repo (paket22/website/data-p22.js, korrekturen.csv der Pakete).
Eingang: paket22/website/data-p22.js, paket22/out/smart-search-data-p22.json (beide unverändert, Rückweg B3).
Ausgang: paket19/website/data-p19.js, paket19/out/smart-search-data-p19.json, paket19/out/b2_herkunft.json.
B2: Vor dem Entfernen muss jeder `korrekturen`-Eintrag ein Gegenstück in den korrekturen.csv der Pakete 13–22
(bzw. paket22/config/neue_angebote.json für E143) haben; Smart-Einträge in paket14/config/korrekturen.csv (Preis E107/E109).
Fehlt eines, bricht das Skript ab und meldet die Fälle, es wird nichts entfernt.
Aufruf (aus claude-work/): python3 -I paket19/scripts/build_daten_p19.py"""
import collections, csv, json, pathlib, sys
R = pathlib.Path(__file__).resolve().parents[2]
PRE = "window.WEITERBILDUNGSRADAR_OFFERS = "
QUELLEN = ["paket13/config/owner_korrekturen.csv", "paket14/config/korrekturen.csv", "paket16/config/korrekturen.csv",
           "paket17/config/korrekturen.csv", "paket17/config/korrekturen_preis.csv", "paket18/config/korrekturen.csv",
           "paket21/config/korrekturen.csv", "paket22/config/korrekturen.csv"]

raw = (R / "paket22/website/data-p22.js").read_text(encoding="utf-8")
assert raw.startswith(PRE) and raw.endswith(";\n")
data = json.loads(raw[len(PRE):-2])
smart = json.loads((R / "paket22/out/smart-search-data-p22.json").read_text(encoding="utf-8"))

# B2 – Gegenstücke als Multimenge (id, feld, alt, register, quelle)
belege = collections.Counter()
for q in QUELLEN:
    for k in csv.DictReader(open(R / q, encoding="utf-8")):
        belege[(k["id"], k["feld"], k["alt"], k["register_id"], k["quelle"])] += 1
for a in json.loads((R / "paket22/config/neue_angebote.json").read_text(encoding="utf-8"))["angebote"]:
    o = a["offer"]
    for k in o.get("korrekturen", []):
        belege[(o["id"], k["feld"], k["alt"], k["register"], k["quelle"])] += 1
offen, gefunden = [], collections.Counter()
for o in data:
    for k in o.get("korrekturen", []):
        key = (o["id"], k["feld"], k["alt"], k["register"], k["quelle"])
        if gefunden[key] < belege[key]: gefunden[key] += 1
        else: offen.append({"id": o["id"], **k})
# Smart (E156): Preis-Korrektur aus der priceDisplay-Zeile von paket14/config/korrekturen.csv (build_daten_p14.py)
p14 = {(k["id"], k["register_id"], k["quelle"]) for k in csv.DictReader(open(R / "paket14/config/korrekturen.csv", encoding="utf-8"))
       if k["feld"] == "priceDisplay" and k["neu"] == "CHF 1'150"}
offen_smart = [{"id": i, **k} for i, v in smart["byId"].items() for k in v.get("korrekturen", [])
               if not (k["feld"] == "priceOptions[0]" and k["alt"] == "NOT_PUBLISHED" and (i, k["register"], k["quelle"]) in p14)]
n_data = sum(len(o.get("korrekturen", [])) for o in data)
n_smart = sum(len(v.get("korrekturen", [])) for v in smart["byId"].values())
bericht = {"daten_eintraege": n_data, "daten_angebote": sum(1 for o in data if "korrekturen" in o), "daten_ohne_beleg": offen,
           "smart_eintraege": n_smart, "smart_ohne_beleg": offen_smart, "quellen": QUELLEN + ["paket22/config/neue_angebote.json"]}
OUT = R / "paket19/out"; OUT.mkdir(parents=True, exist_ok=True)
(OUT / "b2_herkunft.json").write_text(json.dumps(bericht, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
if offen or offen_smart:
    print("ABBRUCH B2:", len(offen), "Daten- und", len(offen_smart), "Smart-Einträge ohne Gegenstück, siehe paket19/out/b2_herkunft.json")
    sys.exit(1)

# B1 / B4 – Feld entfernen, alles andere wertgleich, Reihenfolge und Anzahl bleiben (E121)
for o in data: o.pop("korrekturen", None)
for v in smart["byId"].values(): v.pop("korrekturen", None)
W = R / "paket19/website"; W.mkdir(parents=True, exist_ok=True)
(W / "data-p19.js").write_text(PRE + json.dumps(data, ensure_ascii=False) + ";\n", encoding="utf-8")
(OUT / "smart-search-data-p19.json").write_text(json.dumps(smart, ensure_ascii=False), encoding="utf-8")
print("OK B2", n_data, "Daten- und", n_smart, "Smart-Einträge belegt;", len(data), "Angebote in data-p19.js")
