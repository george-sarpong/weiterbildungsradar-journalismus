"""Paket 16: data-p16.js = paket14/website/data-p14.js + paket16/config/korrekturen.csv (E113, Anzeige auf Deutsch).
Alte Werte werden geprüft, Herkunft im Feld `korrekturen`. Aufruf (aus claude-work/): python3 -I paket16/scripts/build_daten_p16.py"""
import csv, json, hashlib, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
pre = "window.WEITERBILDUNGSRADAR_OFFERS = "
raw = (R / "paket14/website/data-p14.js").read_text(encoding="utf-8")
data = json.loads(raw[len(pre):].rstrip().rstrip(";")); by = {o["id"]: o for o in data}; n = 0
for k in csv.DictReader(open(R / "paket16/config/korrekturen.csv", encoding="utf-8")):
    o = by[k["id"]]
    assert o.get(k["feld"], "") == k["alt"], (k["id"], k["feld"], o.get(k["feld"]))
    o[k["feld"]] = k["neu"]
    o.setdefault("korrekturen", []).append({"feld": k["feld"], "alt": k["alt"], "register": k["register_id"], "quelle": k["quelle"]}); n += 1
js = pre + json.dumps(data, ensure_ascii=False) + ";\n"
(R / "paket16/website/data-p16.js").write_text(js, encoding="utf-8")
print("OK", n, "Felder data-p16.js", hashlib.sha256(js.encode()).hexdigest()[:16])
