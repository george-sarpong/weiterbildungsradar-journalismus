"""Paket 13: data-p13.js = paket7/website/data-p7.js + Owner-Korrekturen aus paket13/config/owner_korrekturen.csv.
E098 (URL HEAD-003), E103 (Archiv AT-PROD-OFFER-040, -026 als HOLD). Jede Korrektur prüft den alten Wert (keine stille Überschreibung) und vermerkt die Herkunft im Feld `korrekturen` des Angebots.
Aufruf (aus claude-work/): python3 -I paket13/scripts/build_daten_p13.py"""
import csv, json, hashlib, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
raw = (R / "paket7/website/data-p7.js").read_text(encoding="utf-8")
pre = "window.WEITERBILDUNGSRADAR_OFFERS = "
assert raw.startswith(pre) and raw.rstrip().endswith(";")
data = json.loads(raw[len(pre):].rstrip().rstrip(";"))
by = {o["id"]: o for o in data}
n = 0
for k in csv.DictReader(open(R / "paket13/config/owner_korrekturen.csv", encoding="utf-8")):
    o = by[k["id"]]
    assert o.get(k["feld"], "") == k["alt"], (k["id"], k["feld"], o.get(k["feld"]))  # leerer alter Wert = Feld fehlt
    o[k["feld"]] = k["neu"]
    o.setdefault("korrekturen", []).append({"feld": k["feld"], "alt": k["alt"], "register": k["register_id"], "quelle": k["quelle"]})
    n += 1
js = pre + json.dumps(data, ensure_ascii=False) + ";\n"
(R / "paket13/website/data-p13.js").write_text(js, encoding="utf-8")
print("OK", len(data), "Angebote,", n, "Korrektur(en), data-p13.js", hashlib.sha256(js.encode()).hexdigest()[:16])
