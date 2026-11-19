"""Paket 22: data-p22.js = paket21/website/data-p21.js + paket22/config/korrekturen.csv (Archiv Digicomp 041/044/033 E142,
CH-Zugang MAZ-086/AJM-002 E144) + paket22/config/neue_angebote.json (OFFER-DIGICOMP-075 «Bilder für Print, Web & Social Media», E143).
Alte Werte werden geprüft (fehlendes Feld = ""), Herkunft im Feld `korrekturen`. Smart-Daten: paket22/out/smart-search-data-p22.json
= paket14/out/smart-search-data-p14.json + Eintrag je neuem Angebot. Website-Kandidat paket22/website/ = paket21/website/ mit
data-p22.js. Aufruf (aus claude-work/): python3 -I paket22/scripts/build_daten_p22.py"""
import csv, json, hashlib, pathlib, shutil
R = pathlib.Path(__file__).resolve().parents[2]
pre = "window.WEITERBILDUNGSRADAR_OFFERS = "
data = json.loads((R / "paket21/website/data-p21.js").read_text(encoding="utf-8")[len(pre):].rstrip().rstrip(";"))
by = {o["id"]: o for o in data}; n = 0
for k in csv.DictReader(open(R / "paket22/config/korrekturen.csv", encoding="utf-8")):
    o = by[k["id"]]
    if k["feld"].startswith("laender."):
        ziel, key = o["laender"], k["feld"].split(".", 1)[1]
    else:
        assert k["feld"] in ("publicationStatus", "publicationReason"), k; ziel, key = o, k["feld"]
    assert ziel.get(key, "") == k["alt"], (k["id"], k["feld"], ziel.get(key), k["alt"])
    ziel[key] = k["neu"]
    o.setdefault("korrekturen", []).append({"feld": k["feld"], "alt": k["alt"], "register": k["register_id"], "quelle": k["quelle"]}); n += 1
NEU = json.loads((R / "paket22/config/neue_angebote.json").read_text(encoding="utf-8"))
smart = json.loads((R / "paket14/out/smart-search-data-p14.json").read_text(encoding="utf-8"))
for a in NEU["angebote"]:
    o = a["offer"]
    assert o["id"] not in by and o["id"] not in smart["byId"], o["id"]   # keine stille Überschreibung
    data.append(o); smart["byId"][o["id"]] = a["smart"]
smart["meta"]["rosterCount"] = len(smart["byId"])
assert smart["meta"]["rosterCount"] == len(data)
js = pre + json.dumps(data, ensure_ascii=False) + ";\n"
sj = json.dumps(smart, ensure_ascii=False)
(R / "paket22/out").mkdir(exist_ok=True)
(R / "paket22/out/smart-search-data-p22.json").write_text(sj, encoding="utf-8")
W = R / "paket22/website"
if W.exists(): shutil.rmtree(W)
shutil.copytree(R / "paket21/website", W)
(W / "data-p21.js").unlink()
(W / "data-p22.js").write_text(js, encoding="utf-8")
print("OK", n, "Felder,", len(NEU["angebote"]), "neues Angebot, data-p22.js", hashlib.sha256(js.encode()).hexdigest()[:16],
      "smart", hashlib.sha256(sj.encode()).hexdigest()[:16], len(data), "Angebote")
