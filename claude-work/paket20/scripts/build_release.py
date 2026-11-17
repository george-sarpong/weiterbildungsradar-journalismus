"""Release-Paket Beta 18.11.2026 (E120: Go mit Release-Freigabe; Projektregel 7).
website/  = kompletter Hauptordner: neuer Stand Paket 20 + alte Live-Dateien (bleiben für den Rückweg auf dem Server)
rollback/ = alte index.html (Live-Snapshot 09.11.), nur lokal aufbewahren
Aufruf (aus claude-work/): python3 -I paket20/scripts/build_release.py <zielordner>"""
import hashlib, pathlib, shutil, sys
R = pathlib.Path(__file__).resolve().parents[2]
LIVE, W, OUT = R / "live-snapshot-20261109", R / "paket20/website", pathlib.Path(sys.argv[1])
if OUT.exists(): shutil.rmtree(OUT)
web = OUT / "website"; web.mkdir(parents=True); (OUT / "rollback").mkdir()
for f in LIVE.iterdir():                     # alte Live-Dateien (inkl. styles, sitemap)
    if f.name not in ("README.md", "SHA256SUMS.txt"): shutil.copy2(f, web / f.name)
for f in W.iterdir():                        # neuer Stand überschreibt gleichnamige Dateien
    shutil.copy2(f, web / f.name)
(web / "smart-search-data-p14.js").write_text("window.MEDIA_SKILLS_SMART_DATA = " + (R / "paket14/out/smart-search-data-p14.json").read_text(encoding="utf-8") + ";\n", encoding="utf-8")
idx = (W / "index.html").read_text(encoding="utf-8")
for a, b in [('src="data-a1-86ff68ddc9ac.js"', 'src="data-p18.js"'), ('src="smart-search-data-a1-a38a2a2b2391.js"', 'src="smart-search-data-p14.js"'), ('src="app-v33.js"', 'src="app-v43.js"')]:
    assert idx.count(a) == 1, a; idx = idx.replace(a, b)
(web / "index.html").write_text(idx, encoding="utf-8")
shutil.copy2(LIVE / "index.html", OUT / "rollback/index.html")
sums = {f.name: hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(web.iterdir()) if f.is_file()}
(web / "SHA256SUMS.txt").write_text("".join(f"{v}  {k}\n" for k, v in sums.items()), encoding="utf-8")
(OUT / "rollback/SHA256SUMS.txt").write_text(f"{hashlib.sha256((OUT / 'rollback/index.html').read_bytes()).hexdigest()}  index.html\n")
print("OK", len(sums), "Dateien in website/")
