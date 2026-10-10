# REVIEW_SCOPE — mediaskills_fix_20261010_V15_MS23

MODUS: BUGFIX-REVIEW

Prüfe ausschliesslich diesen Versionsordner und die Bug-ID MS-23. V14 ist die unveränderte direkte Baseline; V12 bleibt die letzte freigegebene Version. Frühere Bugs nicht erneut öffnen.

## MS-23

Prüfe bei 390 × 844 und 320 × 568 jeweils diese drei Zustände:

1. frisch geladene Startseite;
2. klassische Filterung mit Angebotsart «Kurs»;
3. Freitextanfrage «Datenjournalismus».

Abnahmekriterien:

- In allen drei Zuständen gilt `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
- Jede sichtbare `#cards .card` liegt vollständig innerhalb des horizontalen Viewports: `left >= 0` und `right <= clientWidth`.
- Jeder sichtbare `.favorite-button` in diesen Karten liegt vollständig innerhalb des horizontalen Viewports.
- Das gilt insbesondere für `OFFER-SAEZH-013` mit der Beschreibung «Street-/People-/Documentary-/…».
- Lange Kartentitel wie bei `AT-PROD-OFFER-022` und «Kompaktkurs Video in der Unternehmenskommunikation» umbrechen innerhalb der Karte und ragen bei 320 × 568 nicht über den Viewport hinaus.
- Lange Werte in `.fact-item dd`, insbesondere «Diplomlehrgang Photojournalismus/Pressefotografie» bei `AT-PROD-OFFER-044`, umbrechen innerhalb der Karte und ragen bei 320 × 568 nicht über den Viewport hinaus.
- Die Favoritenherzen und die Links «Offizielle Angebotsseite» bleiben ohne horizontales Seitenscrollen per Maus und Tastatur erreichbar.
- Desktopdarstellung, Smart-Ergebniskarten und klassische Filterfunktion bleiben unverändert nutzbar.

## Geänderte Dateien

- `styles.css`: Zusätzlich zu den bisherigen Korrekturen dürfen jetzt auch lange Werte in `.fact-item dd` im mobilen Layout sicher umbrechen.
- `REVIEW_SCOPE.md`: nur dieser Review-Auftrag.

Alle anderen Dateien sind bytegleich mit V14 und damit auch mit V12. Insbesondere sind `app.js`, `data.js`, `smart-search-data.js` und alle HTML-Dateien unverändert.

## Review-Regel

Prüfe pro Bug nur das genannte Abnahmekriterium und unmittelbare Regressionen, die durch genau diese Änderung verursacht wurden. Keine Gesamtprüfung, keine neuen Verbesserungsvorschläge und keine früheren Bug-IDs wieder öffnen.

Antwort gemäss der festen Projektanweisung. Danach Prüfung beenden.
