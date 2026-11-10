"""Paket 14: data-p14.js = paket13/website/data-p13.js + paket14/config/korrekturen.csv (E107);
smart-search-data-p14.json = paket3/out/merge_kandidat_smart.json + Preis OFFER-MEDIENCAMPUS-039 (E107).
Alte Werte werden geprüft, Herkunft im Feld `korrekturen`. Aufruf (aus claude-work/): python3 -I paket14/scripts/build_daten_p14.py"""
import csv, json, hashlib, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
pre = "window.WEITERBILDUNGSRADAR_OFFERS = "
raw = (R / "paket13/website/data-p13.js").read_text(encoding="utf-8")
data = json.loads(raw[len(pre):].rstrip().rstrip(";")); by = {o["id"]: o for o in data}; n = 0
for k in csv.DictReader(open(R / "paket14/config/korrekturen.csv", encoding="utf-8")):
    o = by[k["id"]]
    assert o.get(k["feld"], "") == k["alt"], (k["id"], k["feld"], o.get(k["feld"]))
    o[k["feld"]] = k["neu"]
    o.setdefault("korrekturen", []).append({"feld": k["feld"], "alt": k["alt"], "register": k["register_id"], "quelle": k["quelle"]}); n += 1
js = pre + json.dumps(data, ensure_ascii=False) + ";\n"
(R / "paket14/website/data-p14.js").write_text(js, encoding="utf-8")
smart = json.loads((R / "paket3/out/merge_kandidat_smart.json").read_text(encoding="utf-8"))
rec = smart["byId"]["OFFER-MEDIENCAMPUS-039"]
assert len(rec["priceOptions"]) == 1 and rec["priceOptions"][0]["amountType"] == "NOT_PUBLISHED", rec["priceOptions"]
rec["priceOptions"][0].update({"amountType": "EXACT", "amount": 1150.0, "currency": "CHF", "tariffLabel": "Regulärer Preis"})
rec["korrekturen"] = [{"feld": "priceOptions[0]", "alt": "NOT_PUBLISHED", "register": "E107", "quelle": "https://www.mediencampus.ch/cmf04-modernes-redaktionsmanagement.html, abgerufen 10.11.2026"}]
out = json.dumps(smart, ensure_ascii=False)
(R / "paket14/out/smart-search-data-p14.json").write_text(out, encoding="utf-8")
print("OK", n, "Felder data-p14.js", hashlib.sha256(js.encode()).hexdigest()[:16], "· smart", hashlib.sha256(out.encode()).hexdigest()[:16])
