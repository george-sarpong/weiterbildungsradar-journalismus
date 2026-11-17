"""Paket 20: app-v43.js = paket18/website/app-v42.js + E122 (Badge «Anbieterland» nicht mehr auf der Karte; Feld bleibt in den Daten).
methodik.html = paket18/website/methodik.html mit angepasstem Abschnitt «Ort». Übrige Seiten und data-p18.js unverändert kopiert.
Aufruf (aus claude-work/): python3 -I paket20/scripts/port_p20.py"""
import hashlib, pathlib, shutil
R = pathlib.Path(__file__).resolve().parents[2]
SRC, DST = R / "paket18/website", R / "paket20/website"
DST.mkdir(parents=True, exist_ok=True)
def rep(s, a, b):
    assert s.count(a) == 1, (s.count(a), a[:90]); return s.replace(a, b)
app = (SRC / "app-v42.js").read_text(encoding="utf-8")
app = rep(app, '''  // Anbieterland nur mit Beleg (E065); sonst sichtbar «keine Angabe» (E036, E082, Wortlaut E093).
  const providerCountryLabel = offer => isoCodes(laender(offer).anbieterLand).map(countryName).join(" / ") || NOT_RECORDED;
''', '''  // Anbieterland steht nur in den Daten (Zuordnung, Deduplizierung), nicht auf der Karte (E122, löst E116 ab).
''')
app = rep(app, '''          ${providerCountryLabel(offer) !== NOT_RECORDED ? `<span class="badge">Anbieterland: ${escapeHtml(providerCountryLabel(offer))}</span>` : ""}
''', "")
assert "providerCountryLabel" not in app
(DST / "app-v43.js").write_text(app, encoding="utf-8")
m = (SRC / "methodik.html").read_text(encoding="utf-8")
m = rep(m, '<h2 id="ort">Ort, Anbieterland und Durchführungsform</h2>', '<h2 id="ort">Ort und Durchführungsform</h2>')
m = rep(m, '''<p>Ort, Anbieterland und Zugang aus der Schweiz werden getrennt ausgewiesen. «Ort» nennt das Land des Durchführungsorts und die publizierte Region oder Stadt, bei reinen Online-Angeboten «Online». «Anbieterland» nennt das Land, in dem der Anbieter seinen Sitz hat; es erscheint nur mit Beleg. «CH-Zugang: ja» steht, wenn ein Durchführungsort in der Schweiz genannt ist; aus dem Anbieterland wird der Zugang nie abgeleitet. Fehlt der Ort oder der CH-Zugang, steht «keine Angabe»; ein unbekanntes Anbieterland wird nicht angezeigt. Die Kurssprache bleibt davon getrennt.</p>''',
'''<p>Ort und Zugang aus der Schweiz werden getrennt ausgewiesen. «Ort» nennt das Land des Durchführungsorts und die publizierte Region oder Stadt, bei reinen Online-Angeboten «Online». «CH-Zugang: ja» steht, wenn ein Durchführungsort in der Schweiz genannt ist. Fehlt der Ort oder der CH-Zugang, steht «keine Angabe». Wo der Anbieter seinen Sitz hat, führen wir nur in den Daten, um Angebote richtig zuzuordnen; den Zugang leiten wir daraus nie ab. Die Kurssprache bleibt davon getrennt.</p>''')
(DST / "methodik.html").write_text(m, encoding="utf-8")
for f in ("404.html", "datenschutz.html", "impressum.html", "index.html", "data-p18.js"):
    shutil.copy2(SRC / f, DST / f)
for f in sorted(DST.iterdir()):
    print(hashlib.sha256(f.read_bytes()).hexdigest()[:16], f.name)
