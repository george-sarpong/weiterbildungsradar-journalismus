# REVIEW_SCOPE — mediaskills_fix_20261009_V12_MS20-MS22

MODUS: BUGFIX-REVIEW

Prüfe ausschliesslich diesen Versionsordner und die Bug-IDs MS-20 bis MS-22. V11 ist die unveränderte Baseline. Frühere Bugs nicht erneut öffnen.

## MS-20

Abnahmekriterium: Zwei Angebote favorisieren, «Nur Favoriten» aktivieren, Preis «501 bis 2'000» und Sortierung «Anbieter A–Z» setzen und danach «Filter zurücksetzen» klicken. Anschliessend gilt:

- `#favoritesToggle` hat `aria-pressed="false"` und nicht die Klasse `is-active`.
- Die Trefferzahl zeigt den vollständigen aktuellen Bestand ohne «· Favoriten» und die Zahl der sichtbaren Karten entspricht diesem Gesamtbestand. Beim gemeldeten Teststand vom 9. Oktober 2026 waren das «1246 von 1246 aktuellen Angeboten» und 1246 Karten.
- Die URL enthält keine Filter- oder Sortierparameter.
- Der localStorage-Schlüssel `weiterbildungsradar:favorites:v1` enthält weiterhin beide Favoriten-IDs.
- Das gilt bei 1440 × 900 und 390 × 844.

## MS-21

Abnahmekriterien:

- Ist ausschliesslich eine andere Sortierung als «Redaktionelle Auswahl» gesetzt, ist `#resetFilters.disabled === false` und `#filterStatus` meldet einen aktiven Zustand.
- Ist ausschliesslich «Nur Favoriten» aktiv, ist `#resetFilters.disabled === false` und `#filterStatus` meldet einen aktiven Zustand.
- Ein Klick auf «Filter zurücksetzen» stellt die Sortierung auf `EDITORIAL`, deaktiviert «Nur Favoriten» und entfernt `sort` aus der URL.
- Gespeicherte Favoriten werden dadurch nicht gelöscht.
- Das gilt bei 1440 × 900 und 390 × 844.

## MS-22

Abnahmekriterien:

- Bei Sortierung «Nächster Start» stehen alle Angebote mit gültigem `startDate` ab dem heutigen Datum zuerst und sind nach `startDate` aufsteigend sortiert.
- Danach folgen bereits begonnene Angebote und zuletzt Angebote ohne gültiges Startdatum.
- Innerhalb der bereits begonnenen Angebote stehen die jüngsten Startdaten zuerst.
- Die erste sichtbare Karte hat ein Startdatum ab heute.
- Ergebnismenge und Trefferzahl bleiben gegenüber «Redaktionelle Auswahl» unverändert.
- Das gilt bei 1440 × 900 und 390 × 844.

## Geänderte Dateien

- `app.js`: Reset deaktiviert die Favoritenansicht; nicht standardmässige Sortierung und Favoritenansicht werden als aktive zurücksetzbare Zustände gezählt; Startsortierung gruppiert zukünftige, bereits begonnene und undatierte Angebote.
- `REVIEW_SCOPE.md`: nur dieser Review-Auftrag.

Alle anderen Dateien sind bytegleich mit V11. Insbesondere sind `data.js`, `smart-search-data.js`, alle HTML-Dateien und `styles.css` unverändert.

## Review-Regel

Prüfe pro Bug nur das genannte Abnahmekriterium und unmittelbare Regressionen, die durch genau diese Änderung verursacht wurden. Keine Gesamtprüfung, keine neuen Verbesserungsvorschläge und keine früheren Bug-IDs wieder öffnen.

Antwort gemäss der festen Projektanweisung. Danach Prüfung beenden.
