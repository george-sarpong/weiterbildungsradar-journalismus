# REVIEW_SCOPE — mediaskills_fix_20261011_V17_MS28-MS29

MODUS: BUGFIX-REVIEW

Prüfe ausschliesslich diesen Versionsordner und die Bug-IDs MS-28 und MS-29. V16 ist die unveränderte direkte Baseline und die letzte freigegebene Version. Frühere Bugs nicht erneut öffnen.

Prüfgrössen für beide Bugs:

- Desktop: 1440 × 900
- iPhone 5 / SE der ersten Generation: 320 × 568
- Browser-Zoom: 100 %

Jeder Ablauf beginnt mit einer frisch geladenen `index.html`.

## Messmethode für beide Bugs

- Ermittle Farbe und Opazität des Platzhaltertexts mit `getComputedStyle(input, "::placeholder")`.
- Ermittle den tatsächlich hinter dem Platzhalter gerenderten Hintergrund; berücksichtige vorhandene Transparenz durch Alpha-Compositing.
- Berechne den ungerundeten Kontrast nach der WCAG-Formel für relative Luminanz in sRGB.
- Massgeblich ist mindestens 4,50 : 1, weil beide Platzhalter 16 CSS-Pixel gross und normal gewichtet sind.
- Eine rein visuelle Schätzung oder ein gerundeter Wert genügt nicht.

## MS-28 — Kontrast des Platzhalters der klassischen Textsuche

Prüfe `#searchInput::placeholder` mit dem Text `Titel, Anbieter oder Stichwort` in beiden Viewports in diesen vier Zuständen:

1. frisch geladene Startseite;
2. klassischer Filter `Sprache = DE` aktiv, während `#searchInput` leer bleibt;
3. Smart-Suche nach `Datenjournalismus` ausgeführt, während `#searchInput` leer bleibt;
4. auf frischer Seite die erste Karte favorisiert und danach `Nur Favoriten` aktiviert, während `#searchInput` leer bleibt.

Abnahmekriterien:

- Der berechnete Platzhalterfarbwert ist in jedem Zustand `rgb(93, 104, 122)` (`#5d687a`) bei Opazität 1.
- Der tatsächliche Hintergrund ist `rgb(255, 255, 255)` (`#ffffff`).
- Das ungerundete Kontrastverhältnis beträgt in jedem Zustand mindestens 4,50 : 1; für diese beiden Farben beträgt es rund 5,6352 : 1.
- Text, Grösse, Gewicht, Position und Funktion des Felds bleiben gegenüber V16 unverändert.

## MS-29 — Kontrast des Platzhalters der Freitextsuche

Prüfe `#smartInput::placeholder` mit dem Text `z. B. Ich habe CHF 800 und möchte mich im Bereich Datenjournalismus weiterbilden.` in beiden Viewports in diesen drei Zuständen:

1. frisch geladene Startseite;
2. leere Smart-Suche über `Vorschläge finden` abgesendet;
3. in der klassischen Textsuche `__kein_treffer_20261011__` eingegeben, sodass die Angebotsliste den Leerzustand zeigt, während `#smartInput` leer bleibt.

Abnahmekriterien:

- Der berechnete Platzhalterfarbwert ist in jedem Zustand `rgb(93, 104, 122)` (`#5d687a`) bei Opazität 1.
- Der tatsächliche Hintergrund ist `rgb(255, 255, 255)` (`#ffffff`).
- Das ungerundete Kontrastverhältnis beträgt in jedem Zustand mindestens 4,50 : 1; für diese beiden Farben beträgt es rund 5,6352 : 1.
- Text, Grösse, Gewicht, Position und Funktion des Felds bleiben gegenüber V16 unverändert.

## Geänderte Dateien

- `styles.css`: ausschliesslich die beiden Platzhalterfarben wurden auf die bestehende Variable `var(--muted)` (`#5d687a`) gesetzt.
- `REVIEW_SCOPE.md`: nur dieser Review-Auftrag.

Alle anderen Dateien sind bytegleich mit V16. Insbesondere sind `app.js`, `index.html`, `data.js` und `smart-search-data.js` unverändert.

## Review-Regel

Prüfe pro Bug nur das genannte Abnahmekriterium und unmittelbare Regressionen, die durch genau diese beiden CSS-Änderungen verursacht wurden. Keine Gesamtprüfung, keine neuen Verbesserungsvorschläge und keine früheren Bug-IDs wieder öffnen.

Antwort gemäss der festen Projektanweisung. Danach Prüfung beenden.
