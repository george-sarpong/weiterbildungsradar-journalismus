# REVIEW_SCOPE — mediaskills_fix_20261009_V11_MS18-MS19

MODUS: BUGFIX-REVIEW

Prüfe ausschliesslich diesen Versionsordner und die Bug-IDs MS-18 und MS-19. V10 ist die unveränderte Baseline. Frühere Bugs nicht erneut öffnen.

## MS-18

Abnahmekriterien:

- Auf `index.html`, `methodik.html`, `impressum.html`, `datenschutz.html` und `404.html` umschliesst genau ein Link mit `href="https://mediaskills.ch/"` sowohl das «MS»-Zeichen als auch den Text «Media Skills».
- Auf allen fünf Seiten ist das Logo per Tab fokussierbar und mit Enter aktivierbar.
- Ein Klick auf «MS», ein Klick auf «Media Skills» und Tab plus Enter führen jeweils zu `https://mediaskills.ch/`.
- Das gilt bei 1440 × 900 und 390 × 844.

## MS-19

Abnahmekriterium: Der Text von `.header-note` auf `404.html` ist zeichengleich mit dem Text auf `index.html`, `methodik.html`, `impressum.html` und `datenschutz.html`: «redaktionell geprüft · laufend erweitert».

## Geänderte Dateien

- `index.html`: Das bisher nicht verlinkte Logo ist jetzt ein Link zu `https://mediaskills.ch/`.
- `methodik.html`, `impressum.html`, `datenschutz.html`: Der relative Logo-Link `index.html` wurde durch `https://mediaskills.ch/` ersetzt.
- `404.html`: Der relative Logo-Link wurde durch `https://mediaskills.ch/` ersetzt; die Header-Notiz wurde an die übrigen Seiten angeglichen.
- `REVIEW_SCOPE.md`: nur dieser Review-Auftrag.

Alle anderen Dateien sind bytegleich mit V10. Insbesondere sind `app.js`, `data.js`, `smart-search-data.js` und `styles.css` unverändert.

## Review-Regel

Prüfe pro Bug nur das genannte Abnahmekriterium und unmittelbare Regressionen, die durch genau diese Änderung verursacht wurden. Keine Gesamtprüfung, keine neuen Verbesserungsvorschläge und keine früheren Bug-IDs wieder öffnen.

Antwort gemäss der festen Projektanweisung. Danach Prüfung beenden.
