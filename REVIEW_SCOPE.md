# REVIEW_SCOPE — mediaskills_fix_20261011_V18_MS30-MS31

MODUS: BUGFIX-REVIEW

Prüfe ausschliesslich diesen Versionsordner und die Bug-IDs MS-30 und MS-31. V17 ist die unveränderte direkte Baseline und die letzte freigegebene Version. Frühere Bugs nicht erneut öffnen.

Prüfgrössen für beide Bugs:

- Desktop: 1440 × 900
- iPhone 5 / SE der ersten Generation: 320 × 568
- Browser-Zoom: 100 %

Jeder Ablauf beginnt mit einer frisch geladenen `index.html`.

## Messmethode für beide Bugs

- Ermittle die tatsächlich berechnete Randfarbe mit `getComputedStyle(element).borderColor`.
- Ermittle die unmittelbar angrenzenden Farben der Feldfläche und des ausserhalb liegenden Hintergrunds an einer geraden Randstelle; nicht an einem geglätteten, abgerundeten Eckpixel messen.
- Berücksichtige vorhandene Transparenz mittels Alpha-Compositing.
- Berechne das ungerundete Kontrastverhältnis nach der WCAG-Formel für relative Luminanz in sRGB.
- Massgeblich sind mindestens 3,00 : 1 nach WCAG 2.2 AA, Erfolgskriterium 1.4.11.
- Automatische Scanner oder eine rein visuelle Schätzung genügen nicht.

## MS-30 — Randkontrast der klassischen Textsuche

Prüfe `#searchInput` in beiden Viewports:

1. Zustand A: frisch geladene Startseite;
2. Zustand B: klassischer Filter `Sprache = DE` aktiv, während `#searchInput` leer bleibt.

Abnahmekriterien:

- Die berechnete Randfarbe von `#searchInput` ist in beiden Zuständen `rgb(113, 128, 143)` (`#71808f`) bei Opazität 1.
- Feldfläche und angrenzender Hintergrund bleiben `rgb(255, 255, 255)`.
- Der Rand erreicht gegen die weisse Feldfläche und den weissen Aussenhintergrund ungerundet mindestens 3,00 : 1; für `#71808f` gegen Weiss beträgt das Verhältnis rund 4,0490 : 1.
- Breite, Höhe, Randstärke, Radius, Innenabstand, Text, Platzhalter und Funktion von `#searchInput` bleiben gegenüber V17 unverändert.

## MS-31 — Randkontrast der Smart-Eingabe

Prüfe `#smartInput` in beiden Viewports:

1. Zustand A: frisch geladene Startseite;
2. Zustand C: `Datenjournalismus` eingegeben und über `Vorschläge finden` abgesendet.

Abnahmekriterien:

- Die berechnete Randfarbe von `#smartInput` ist in beiden Zuständen `rgb(113, 128, 143)` (`#71808f`) bei Opazität 1.
- Die Feldfläche bleibt `rgb(255, 255, 255)`.
- Der Rand erreicht gegen die Feldfläche und an jeder unmittelbar angrenzenden Stelle des tatsächlichen Verlaufs von `.smart-section` ungerundet mindestens 3,00 : 1.
- Gegen Weiss beträgt das Verhältnis rund 4,0490 : 1. Gegen die in V17 gemessenen Hintergrundwerte `rgb(239, 244, 245)` bis `rgb(244, 247, 248)` beträgt es rund 3,6497 : 1 bis 3,7610 : 1.
- Breite, Höhe, Randstärke, Radius, Innenabstand, Text, Platzhalter und Funktion von `#smartInput` bleiben gegenüber V17 unverändert.

## Unmittelbare Regressionskontrolle

- Prüfe, dass die beiden Randänderungen keine Grössen-, Positions- oder Umbruchänderung verursachen.
- Prüfe, dass Eingabe, Löschen und Absenden in beiden Feldern weiterhin funktionieren.
- Prüfe, dass der vorhandene Fokusindikator unverändert erscheint; seine eigene WCAG-Bewertung gehört nicht zum Scope.
- Keine anderen Bedienelemente oder Kontrastarten erneut prüfen.

## Geänderte Dateien

- `styles.css`: ausschliesslich ein gezielter Randfarben-Override für `#searchInput` und die Randfarbe von `.smart-input-row input` wurden auf `#71808f` gesetzt. Die Select-Felder der gemeinsamen Basisregel bleiben unverändert.
- `REVIEW_SCOPE.md`: nur dieser Review-Auftrag.

Alle anderen Dateien sind bytegleich mit V17. Insbesondere sind `app.js`, `index.html`, `data.js` und `smart-search-data.js` unverändert.

## Review-Regel

Prüfe pro Bug nur das genannte Abnahmekriterium und unmittelbare Regressionen, die durch genau diese beiden CSS-Änderungen verursacht wurden. Keine Gesamtprüfung, keine neuen Verbesserungsvorschläge und keine früheren Bug-IDs wieder öffnen.

Antwort gemäss der festen Projektanweisung. Danach Prüfung beenden.
