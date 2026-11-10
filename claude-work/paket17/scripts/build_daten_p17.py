"""Paket 17: data-p17.js = paket16/website/data-p16.js + paket17/config/korrekturen.csv + korrekturen_preis.csv (E114).
Feld «sessions[i].label/region» adressiert einen Termin. Alte Werte werden geprüft, Herkunft im Feld `korrekturen`.
Aufruf (aus claude-work/): python3 -I paket17/scripts/build_daten_p17.py"""
import csv, json, hashlib, pathlib, re
R = pathlib.Path(__file__).resolve().parents[2]
pre = "window.WEITERBILDUNGSRADAR_OFFERS = "
data = json.loads((R / "paket16/website/data-p16.js").read_text(encoding="utf-8")[len(pre):].rstrip().rstrip(";"))
by = {o["id"]: o for o in data}; n = 0
for f in ("korrekturen.csv", "korrekturen_preis.csv"):
    for k in csv.DictReader(open(R / "paket17/config" / f, encoding="utf-8")):
        o = by[k["id"]]; m = re.fullmatch(r"sessions\[(\d+)\]\.(label|region)", k["feld"])
        tgt, key = (o["sessions"][int(m.group(1))], m.group(2)) if m else (o, k["feld"])
        assert tgt.get(key, "") == k["alt"], (k["id"], k["feld"], tgt.get(key))
        tgt[key] = k["neu"]
        o.setdefault("korrekturen", []).append({"feld": k["feld"], "alt": k["alt"], "register": k["register_id"], "quelle": k["quelle"]}); n += 1
js = pre + json.dumps(data, ensure_ascii=False) + ";\n"
(R / "paket17/website/data-p17.js").write_text(js, encoding="utf-8")
print("OK", n, "Felder data-p17.js", hashlib.sha256(js.encode()).hexdigest()[:16])
