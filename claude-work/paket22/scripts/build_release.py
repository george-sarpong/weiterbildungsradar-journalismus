"""Release-Paket Paket 22 (Archiv Digicomp E142, neues Angebot BILDER E143, CH-Zugang E144); Freigabe E145, Ablauf E147/E148.
Speicherplatz: Starter-Hosting Infomaniak = 10 MB (E148). Darum nur Dateien, die eine Seite lädt, plus der Rückweg:
website/  = Hauptordner nach dem Upload (ohne .ftpquota und .htaccess, die auf dem Server bleiben, E146):
            neuer Stand Paket 22 (12 Dateien) + Rückweg Paket 21 (data-p21.js, smart-search-data-p14.js) + SHA256SUMS.txt = 15 Dateien
rollback/ = index.html des Live-Stands seit 19.11. (Paket 21), nur lokal aufbewahren
Abbruch, wenn website/ mehr als 9 MB belegt (Reserve für .htaccess, .ftpquota und Dateisystem).
Aufruf (aus claude-work/): python3 -I paket22/scripts/build_release.py <zielordner>"""
import hashlib, pathlib, re, shutil, sys
R = pathlib.Path(__file__).resolve().parents[2]
LIVE, W, OUT = R / "live-snapshot-20261109", R / "paket22/website", pathlib.Path(sys.argv[1])
if OUT.exists(): shutil.rmtree(OUT)
web = OUT / "website"; web.mkdir(parents=True); (OUT / "rollback").mkdir()
smart = lambda j: "window.MEDIA_SKILLS_SMART_DATA = " + (R / j).read_text(encoding="utf-8") + ";\n"
idx = (W / "index.html").read_text(encoding="utf-8")
for a, b in [('src="data-a1-86ff68ddc9ac.js"', 'src="data-p22.js"'), ('src="smart-search-data-a1-a38a2a2b2391.js"', 'src="smart-search-data-p22.js"'), ('src="app-v33.js"', 'src="app-v43.js"')]:
    assert idx.count(a) == 1, a; idx = idx.replace(a, b)
(web / "index.html").write_text(idx, encoding="utf-8")
for f in ("404.html", "datenschutz.html", "impressum.html", "methodik.html", "app-v43.js", "robots.txt", "data-p22.js"):
    shutil.copy2(W / f, web / f)
for f in ("styles-v22.css", "styles-v24.css", "sitemap.xml"):   # unverändert seit dem Live-Stand 09.11.
    shutil.copy2(LIVE / f, web / f)
(web / "smart-search-data-p22.js").write_text(smart("paket22/out/smart-search-data-p22.json"), encoding="utf-8")
# Rückweg = Live-Stand Paket 21
shutil.copy2(R / "paket21/website/data-p21.js", web / "data-p21.js")
(web / "smart-search-data-p14.js").write_text(smart("paket14/out/smart-search-data-p14.json"), encoding="utf-8")
(OUT / "rollback/index.html").write_text(idx.replace('src="data-p22.js"', 'src="data-p21.js"').replace('src="smart-search-data-p22.js"', 'src="smart-search-data-p14.js"'), encoding="utf-8")
# jede Datei, die eine Seite lädt, ist im Paket
for h in web.glob("*.html"):
    for ref in re.findall(r'(?:src|href)="([^"#:?]+\.(?:js|css))"', h.read_text(encoding="utf-8")):
        assert (web / ref).exists(), (h.name, ref)
total = sum(f.stat().st_size for f in web.iterdir())
assert len(list(web.iterdir())) == 14 and total <= 9 * 1024 * 1024, (len(list(web.iterdir())), total)
sums = {f.name: hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(web.iterdir())}
(web / "SHA256SUMS.txt").write_text("".join(f"{v}  {k}\n" for k, v in sums.items()), encoding="utf-8")   # für R1, wie bisher
(OUT / "rollback/SHA256SUMS.txt").write_text(f"{hashlib.sha256((OUT / 'rollback/index.html').read_bytes()).hexdigest()}  index.html\n", encoding="utf-8")
(OUT / "DATEILISTE.txt").write_text("".join(f"{k}\t{(web / k).stat().st_size}\n" for k in sums) + f"SUMME\t{total}\n", encoding="utf-8")
print("OK", len(sums), "Dateien in website/,", round(total / 1048576, 2), "MB")
