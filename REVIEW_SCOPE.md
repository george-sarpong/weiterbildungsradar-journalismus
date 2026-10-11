# REVIEW_SCOPE — mediaskills_fix_20261011_V21_MS32

MODUS: BUGFIX-REVIEW

Prüfe ausschliesslich diesen Versionsordner und die Bug-ID MS-32. V18 ist die direkte Baseline und letzte freigegebene Version. V19 und V20 sind fehlgeschlagen, nicht freigegeben und gehören nicht zum Review. Frühere Bugs nicht erneut öffnen.

## Prüfgrössen

- Desktop: 1440 × 900
- iPhone 5 / SE der ersten Generation: 320 × 568
- Browser-Zoom: 100 %
- Navigation mit Tab und Shift+Tab

Jeder Ablauf beginnt mit einer frisch geladenen Seite.

## Messmethode

- Ermittle pro fokussiertem Element mit `getComputedStyle` mindestens `outline-style`, `outline-width`, `outline-color`, `outline-offset` und `box-shadow`.
- Ermittle sämtliche Farben, die unmittelbar an die Outline grenzen oder von ihr überdeckt werden.
- Berücksichtige Transparenz mittels Alpha-Compositing.
- Berechne das ungerundete Kontrastverhältnis nach der WCAG-Formel für relative Luminanz in sRGB.
- Massgeblich sind mindestens 3,00 : 1 nach WCAG 2.2 AA, Erfolgskriterium 1.4.11 in Verbindung mit 2.4.7.
- Nicht an geglätteten Schrift-, Eck- oder Outline-Pixeln messen.
- Automatische Scanner oder eine rein visuelle Schätzung genügen nicht.

## MS-32 — kontextsichere Fokusfarben

### Erwarteter CSS-Zustand

Grundregel für jedes Element mit `:focus-visible`:

- `outline-style: solid`
- `outline-width: 3px`
- `outline-color: rgb(172, 120, 36)` (`#ac7824`, `var(--focus-ring)`)
- `outline-offset: 3px`
- kein neu eingeführter Fokus-`box-shadow`

Gezielte Ausnahme:

- `#favoritesToggle:focus-visible` hat `outline-color: rgb(23, 32, 51)` (`#172033`, `var(--ink)`).
- Stärke, Stil und Offset bleiben unverändert.
- Die Ausnahme gilt bei `aria-pressed="false"` und `aria-pressed="true"`.

Es gibt keine weiteren Fokus-Overrides.

### Verbindliche Kontrastwerte

Globaler Ring `#ac7824`:

- gegen `#ffffff`: rund 3,8418 : 1
- gegen `#f7f5f0`: rund 3,5260 : 1
- gegen `#f2f6f8`: rund 3,5332 : 1
- gegen `#eaf1f6`: rund 3,3682 : 1
- gegen `#edf1f4`: rund 3,3825 : 1
- gegen `#f5f0e4`: rund 3,3784 : 1
- gegen `#f0f6f1`: rund 3,5047 : 1
- gegen `#17334f`: rund 3,3682 : 1
- gegen `#172033`: rund 4,2346 : 1

Ring von `#favoritesToggle` `#172033`:

- gegen `#b9c4ce`, den Rand von `#sortSelect`: rund 9,1801 : 1
- gegen `#ffffff`: rund 16,2685 : 1
- gegen `#f7f5f0`: rund 14,9314 : 1
- gegen `#eaf1f6`: rund 14,2631 : 1

Jede tatsächlich vorkommende unmittelbar angrenzende oder überdeckte Farbe muss ungerundet mindestens 3,00 : 1 erreichen.

## Verbindliche Prüfabläufe

### `index.html`, Zustand A — frisch geladen

Tabbe vom Seitenanfang durch alle sichtbaren Fokusziele, insbesondere `.skip-link`, Markenlink, `#smartInput`, `.smart-submit`, alle `.smart-examples button`, `#searchInput`, alle `.field select`, `details.classification-help > summary`, `#sortSelect`, `#favoritesToggle`, mindestens die ersten drei `.favorite-button`, mindestens die ersten drei Karten-`.source-link`, `.feedback-button` und die Footerlinks.

Für `.skip-link` ausdrücklich prüfen:

1. Auf der frisch geladenen, am Seitenanfang stehenden Seite mit dem ersten Tab fokussieren.
2. Die Outline grenzt teilweise an den Navy-Header `#17334f` und teilweise an den weissen Kreis `.brand-mark` `#ffffff`.
3. Der Kontrast erreicht gegen beide Farben jeweils ungerundet mindestens 3,00 : 1.
4. Der Skip-Link bleibt vollständig sichtbar, lesbar und per Enter aktivierbar.

### `index.html`, Zustand B — klassischer Filter

1. Seite frisch laden.
2. `Sprache = DE` wählen.
3. `#resetFilters`, `#sortSelect`, `#favoritesToggle` und die ersten sichtbaren Kartenaktionen mit Tab beziehungsweise Shift+Tab prüfen.

### `index.html`, Zustand C — Smart-Ergebnisse

1. Seite frisch laden.
2. `Datenjournalismus` über `#smartInput` und Enter absenden.
3. Alle `.smart-result-card .source-link`, `#smartBudgetButton`, `#smartFreeButton` und den Link «Klassische Filter verwenden» prüfen.

### `index.html`, Zustand D — Favoriten; V20-Restfehler

1. Seite frisch laden bei 1440 × 900.
2. Die erste `.favorite-button` per Tastatur aktivieren.
3. `#favoritesToggle` per Tastatur auf `aria-pressed="true"` setzen und fokussiert lassen.
4. Bestätigen, dass die Schaltfläche wie in V18 auf zwei Zeilen umbrechen darf und ihre Geometrie unverändert bleibt.
5. Die gesamte Outline von `#favoritesToggle` pixelgeometrisch prüfen, insbesondere dort, wo sie den Rand von `#sortSelect` überdeckt oder berührt.
6. `#172033` gegen `#b9c4ce` muss ungerundet mindestens 3,00 : 1 erreichen; erwartet sind rund 9,1801 : 1.
7. Danach `#favoritesToggle` auch bei `aria-pressed="false"` prüfen.
8. Den Ablauf bei 320 × 568 wiederholen; auch dort müssen alle angrenzenden Farben bestehen.

### Statische Seiten

Prüfe in beiden Viewports sämtliche Fokusziele auf `methodik.html`, `impressum.html`, `datenschutz.html` und `404.html`, insbesondere Skip-Link mit der Überlappung zum weissen `.brand-mark`, Markenlink, Inhalts- und Rücklinks, E-Mail-Links sowie Footerlinks.

## Abnahmekriterien

- Jedes im Scope per Tab oder Shift+Tab erreichte Element besitzt eine sichtbare, solide 3px-Outline mit 3px Offset.
- Der globale Ring ist `#ac7824`; ausschliesslich `#favoritesToggle` verwendet `#172033`.
- Jede Fokusanzeige erreicht gegenüber jeder unmittelbar angrenzenden oder von ihr überdeckten Farbe ungerundet mindestens 3,00 : 1.
- Der Skip-Link besteht gleichzeitig gegenüber dem weissen `.brand-mark` und dem Navy-Header.
- `#favoritesToggle` besteht im Zustand D bei 1440 × 900 insbesondere gegenüber dem überdeckten Rand `#b9c4ce` von `#sortSelect`.
- Die normalen Feldränder aus MS-30 und MS-31 bleiben unverändert.
- Kein Fokusziel wird vollständig verdeckt, abgeschnitten oder unerreichbar.
- Tab, Shift+Tab und Tastaturaktivierung funktionieren weiterhin.
- Layout, Position, Umbruch und Darstellung ohne Tastaturfokus bleiben gegenüber V18 unverändert.

## Geänderte Dateien

- `styles.css`: Gegenüber V18 wurde ausschliesslich `--focus-ring` von `#f2b84b` auf `#ac7824` geändert und der gezielte Override `#favoritesToggle:focus-visible { outline-color: var(--ink); }` ergänzt.
- `REVIEW_SCOPE.md`: nur dieser Review-Auftrag.

Alle anderen Dateien sind bytegleich mit V18. Insbesondere sind `app.js`, `index.html`, `data.js` und `smart-search-data.js` unverändert.

## Review-Regel

Prüfe nur das Abnahmekriterium von MS-32 und unmittelbare Regressionen, die durch genau diese beiden CSS-Änderungen verursacht wurden. Keine Gesamtprüfung, keine neuen Verbesserungsvorschläge und keine früheren Bug-IDs wieder öffnen.

Antwort gemäss der festen Projektanweisung. Danach Prüfung beenden.

