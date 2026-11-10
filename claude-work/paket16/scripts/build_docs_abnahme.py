"""Abnahme-Stand für GitHub Pages: docs/ auf dem Arbeitszweig claude/datenharmonisierung (E041, E078).
Inhalt = Live-Snapshot Paket A + paket14/website (app-v40.js, HTML-Seiten, data-p13.js) + Smart-Daten des Merge-Kandidaten;
index.html verweist auf diese Dateien. Kein Release-Paket (Projektregel 7). Aufruf im Repo-Root: python3 -I claude-work/paket14/scripts/build_docs_abnahme.py"""
import pathlib, shutil, hashlib, json
R = pathlib.Path(__file__).resolve().parents[3]; CW = R / "claude-work"
LIVE, W13, OUT = CW / "live-snapshot-20261109", CW / "paket16/website", R / "docs"
NEED = ["styles-v24.css", "styles-v22.css", "robots.txt", "sitemap.xml"]
if OUT.exists(): shutil.rmtree(OUT)
OUT.mkdir()
for f in NEED: shutil.copy2(LIVE / f, OUT / f)
for f in W13.iterdir():
    if f.name != "index.html": shutil.copy2(f, OUT / f.name)
(OUT / "smart-search-data-p14.js").write_text("window.MEDIA_SKILLS_SMART_DATA = " + (CW / "paket14/out/smart-search-data-p14.json").read_text(encoding="utf-8") + ";\n", encoding="utf-8")
idx = (W13 / "index.html").read_text(encoding="utf-8")
for a, b in [('src="data-a1-86ff68ddc9ac.js"', 'src="data-p16.js"'), ('src="smart-search-data-a1-a38a2a2b2391.js"', 'src="smart-search-data-p14.js"'), ('src="app-v33.js"', 'src="app-v41.js"')]:
    assert idx.count(a) == 1, a; idx = idx.replace(a, b)
(OUT / "index.html").write_text(idx, encoding="utf-8")
(OUT / ".nojekyll").write_text("")
# alle lokalen Verweise in den HTML-Seiten müssen existieren
import re
for h in OUT.glob("*.html"):
    for ref in re.findall(r'(?:src|href)="([^"#?:]+\.(?:js|css|html|xml|txt))"', h.read_text(encoding="utf-8")):
        assert (OUT / ref.lstrip("/")).exists(), (h.name, ref)
sums = {f.name: hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(OUT.iterdir()) if f.is_file()}
(OUT / "ABNAHME_STAND.txt").write_text("Abnahme-Stand Paket 16 (10.11.2026), nicht live. Quelle: claude-work/paket16. SHA-256:\n" + "\n".join(f"{v}  {k}" for k, v in sums.items()) + "\n", encoding="utf-8")
print("OK", len(sums), "Dateien in docs/")
