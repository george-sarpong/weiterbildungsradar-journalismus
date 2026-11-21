"""Paket 25 A12 (B03): lauffähiger Browser-Prüfstand aus dem Website-Kandidaten, kein Release, keine Änderung live.
Baut in <zielordner> (wird neu angelegt): alle Dateien aus --website (Standard paket25/website), dazu styles-v22.css und
styles-v24.css aus dem Live-Snapshot (wie build_release.py); index.html mit den Verweisen auf --daten, smart-search-data-<k>.js
und app-v43.js (Ersetzung wie build_release.py, jede genau einmal, sonst Abbruch); Smart-Hülle
«window.MEDIA_SKILLS_SMART_DATA = …;» deterministisch aus --smart. Schreibt PRUEFSTAND_SHA256.json (SHA-256 je Datei).
Aufruf (aus claude-work/): python3 -I paket25/scripts/pruefstand_p25.py <zielordner>
   [--website paket25/website --daten data-p25.js --smart paket25/out/smart-search-data-p25.json --kennung p25]"""
import argparse, hashlib, json, pathlib, shutil, sys

R = pathlib.Path(__file__).resolve().parents[2]
ap = argparse.ArgumentParser()
ap.add_argument("ziel"); ap.add_argument("--website", default="paket25/website"); ap.add_argument("--daten", default="data-p25.js")
ap.add_argument("--smart", default="paket25/out/smart-search-data-p25.json"); ap.add_argument("--kennung", default="p25")
a = ap.parse_args()
W, Z = R / a.website, pathlib.Path(a.ziel)
if Z.exists(): shutil.rmtree(Z)
Z.mkdir(parents=True)
smart_js = f"smart-search-data-{a.kennung}.js"
idx = (W / "index.html").read_text(encoding="utf-8")
for alt, neu in [('src="data-a1-86ff68ddc9ac.js"', f'src="{a.daten}"'), ('src="smart-search-data-a1-a38a2a2b2391.js"', f'src="{smart_js}"'),
                 ('src="app-v33.js"', 'src="app-v43.js"')]:
    if idx.count(alt) != 1: sys.exit(f"ABBRUCH: Verweis {alt} nicht genau einmal in index.html ({idx.count(alt)})")
    idx = idx.replace(alt, neu)
for f in sorted(W.iterdir()):
    if f.is_file() and f.name != "index.html": shutil.copy2(f, Z / f.name)
for f in ("styles-v22.css", "styles-v24.css"):
    shutil.copy2(R / "live-snapshot-20261109" / f, Z / f)
(Z / "index.html").write_text(idx, encoding="utf-8")
(Z / smart_js).write_text("window.MEDIA_SKILLS_SMART_DATA = " + (R / a.smart).read_text(encoding="utf-8") + ";\n", encoding="utf-8")
for ref in [a.daten, smart_js, "app-v43.js"]:
    if not (Z / ref).exists(): sys.exit(f"ABBRUCH: {ref} fehlt im Prüfstand")
sums = {f.name: hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(Z.iterdir()) if f.is_file()}
(Z / "PRUEFSTAND_SHA256.json").write_text(json.dumps(sums, indent=1) + "\n", encoding="utf-8")
print("OK Prüfstand", Z, len(sums), "Dateien;", a.daten, sums[a.daten][:12], smart_js, sums[smart_js][:12], "app-v43.js", sums["app-v43.js"][:12])
