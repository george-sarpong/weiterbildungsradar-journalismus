"""Paket 21: data-p21.js = paket20/website/data-p18.js (Live-Stand 18.11.) + paket21/config/korrekturen.csv
(Anbieterland E118/E123/E132/E133, Durchführungsort E134–E137, CH-Zugang E066). Alte Werte werden geprüft, Herkunft im Feld
`korrekturen`. Website-Kandidat paket21/website/ = paket20/website/ mit data-p21.js. Aufruf (aus claude-work/):
python3 -I paket21/scripts/build_daten_p21.py"""
import csv, json, hashlib, pathlib, shutil
R = pathlib.Path(__file__).resolve().parents[2]
pre = "window.WEITERBILDUNGSRADAR_OFFERS = "
data = json.loads((R / "paket20/website/data-p18.js").read_text(encoding="utf-8")[len(pre):].rstrip().rstrip(";"))
by = {o["id"]: o for o in data}; n = 0
for k in csv.DictReader(open(R / "paket21/config/korrekturen.csv", encoding="utf-8")):
    o = by[k["id"]]
    if k["feld"].startswith("laender."):
        ziel, key = o["laender"], k["feld"].split(".", 1)[1]
    else:
        assert k["feld"] == "region", k; ziel, key = o, "region"
    assert ziel.get(key, "") == k["alt"], (k["id"], k["feld"], ziel.get(key), k["alt"])
    ziel[key] = k["neu"]
    o.setdefault("korrekturen", []).append({"feld": k["feld"], "alt": k["alt"], "register": k["register_id"], "quelle": k["quelle"]}); n += 1
js = pre + json.dumps(data, ensure_ascii=False) + ";\n"
W = R / "paket21/website"
if W.exists(): shutil.rmtree(W)
shutil.copytree(R / "paket20/website", W)
(W / "data-p18.js").unlink()
(W / "data-p21.js").write_text(js, encoding="utf-8")
print("OK", n, "Felder data-p21.js", hashlib.sha256(js.encode()).hexdigest()[:16])
