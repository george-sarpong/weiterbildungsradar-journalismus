"""Paket 18: data-p18.js = paket17/website/data-p17.js + paket18/config/korrekturen.csv (E118, Feld laender.anbieterLand).
Alte Werte werden geprüft, Herkunft im Feld `korrekturen`. Aufruf (aus claude-work/): python3 -I paket18/scripts/build_daten_p18.py"""
import csv, json, hashlib, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
pre = "window.WEITERBILDUNGSRADAR_OFFERS = "
data = json.loads((R / "paket17/website/data-p17.js").read_text(encoding="utf-8")[len(pre):].rstrip().rstrip(";"))
by = {o["id"]: o for o in data}; n = 0
for k in csv.DictReader(open(R / "paket18/config/korrekturen.csv", encoding="utf-8")):
    o = by[k["id"]]; assert k["feld"] == "laender.anbieterLand"
    assert o["laender"].get("anbieterLand", "") == k["alt"], (k["id"], o["laender"])
    o["laender"]["anbieterLand"] = k["neu"]
    o.setdefault("korrekturen", []).append({"feld": k["feld"], "alt": k["alt"], "register": k["register_id"], "quelle": k["quelle"]}); n += 1
js = pre + json.dumps(data, ensure_ascii=False) + ";\n"
(R / "paket18/website/data-p18.js").write_text(js, encoding="utf-8")
print("OK", n, "Felder data-p18.js", hashlib.sha256(js.encode()).hexdigest()[:16])
