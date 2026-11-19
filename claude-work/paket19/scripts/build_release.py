"""Release-Paket Paket 19 (D3; E148, E151, E152, E156). Nur bauen, nicht hochladen: Release nur mit Owner-Freigabe (E158).
website/  = Hauptordner nach dem Upload (ohne .ftpquota und .htaccess, die auf dem Server bleiben, E146):
            Stand Paket 19 (index.html mit Liste, data-p19.js, smart-search-data-p19.js, sitemap.xml, app-v43.js, 4 Seiten,
            robots.txt, styles-v22.css, styles-v24.css) + Rückweg Paket 22 (data-p22.js, smart-search-data-p22.js) + SHA256SUMS.txt
rollback/ = index.html des Live-Stands seit 19.11. (Paket 22, byte-gleich mit dem Paket-22-Release), nur lokal aufbewahren
Abbruch, wenn website/ mehr als 9 MB belegt oder index.html grösser als 300 KB ist (A10).
Aufruf (aus claude-work/): python3 -I paket19/scripts/build_release.py <zielordner>"""
import hashlib, pathlib, re, shutil, subprocess, sys, tempfile
R = pathlib.Path(__file__).resolve().parents[2]
LIVE, W, OUT = R / "live-snapshot-20261109", R / "paket19/website", pathlib.Path(sys.argv[1])
if OUT.exists(): shutil.rmtree(OUT)
web = OUT / "website"; web.mkdir(parents=True); (OUT / "rollback").mkdir()
smart = lambda j: "window.MEDIA_SKILLS_SMART_DATA = " + (R / j).read_text(encoding="utf-8") + ";\n"
idx = (W / "index.html").read_text(encoding="utf-8")
for a, b in [('src="data-a1-86ff68ddc9ac.js"', 'src="data-p19.js"'), ('src="smart-search-data-a1-a38a2a2b2391.js"', 'src="smart-search-data-p19.js"'), ('src="app-v33.js"', 'src="app-v43.js"')]:
    assert idx.count(a) == 1, a; idx = idx.replace(a, b)
(web / "index.html").write_text(idx, encoding="utf-8")
for f in ("404.html", "datenschutz.html", "impressum.html", "methodik.html", "app-v43.js", "robots.txt", "data-p19.js", "sitemap.xml"):
    shutil.copy2(W / f, web / f)
for f in ("styles-v22.css", "styles-v24.css"):   # unverändert seit dem Live-Stand 09.11.
    shutil.copy2(LIVE / f, web / f)
(web / "smart-search-data-p19.js").write_text(smart("paket19/out/smart-search-data-p19.json"), encoding="utf-8")
# Rückweg = Live-Stand Paket 22 (index aus dem Paket-22-Release, Daten aus dem Repo)
with tempfile.TemporaryDirectory() as t:
    subprocess.run([sys.executable, "-I", str(R / "paket22/scripts/build_release.py"), t + "/r22"], check=True, capture_output=True)
    shutil.copy2(t + "/r22/website/index.html", OUT / "rollback/index.html")
shutil.copy2(R / "paket22/website/data-p22.js", web / "data-p22.js")
(web / "smart-search-data-p22.js").write_text(smart("paket22/out/smart-search-data-p22.json"), encoding="utf-8")
# jede Datei, die eine Seite lädt, ist im Paket (auch der Rückweg)
for h in list(web.glob("*.html")) + [OUT / "rollback/index.html"]:
    for ref in re.findall(r'(?:src|href)="([^"#:?]+\.(?:js|css))"', h.read_text(encoding="utf-8")):
        assert (web / ref).exists(), (h.name, ref)
total = sum(f.stat().st_size for f in web.iterdir())
assert len(list(web.iterdir())) == 14 and total <= 9 * 1024 * 1024, (len(list(web.iterdir())), total)
assert (web / "index.html").stat().st_size <= 300 * 1024, (web / "index.html").stat().st_size
sums = {f.name: hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(web.iterdir())}
(web / "SHA256SUMS.txt").write_text("".join(f"{v}  {k}\n" for k, v in sums.items()), encoding="utf-8")
(OUT / "rollback/SHA256SUMS.txt").write_text(f"{hashlib.sha256((OUT / 'rollback/index.html').read_bytes()).hexdigest()}  index.html\n", encoding="utf-8")
(OUT / "DATEILISTE.txt").write_text("".join(f"{k}\t{(web / k).stat().st_size}\n" for k in sums) + f"SUMME\t{total}\n", encoding="utf-8")
print("OK", len(sums) + 1, "Dateien in website/,", round(total / 1048576, 2), "MB")
