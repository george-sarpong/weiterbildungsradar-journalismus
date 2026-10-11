# REVIEW_SCOPE — mediaskills_fix_20261011_V16_MS24-MS27

MODUS: BUGFIX-REVIEW

Prüfe ausschliesslich diesen Versionsordner und die Bug-IDs MS-24 bis MS-27. V15 ist die unveränderte direkte Baseline und die letzte freigegebene Version. Frühere Bugs nicht erneut öffnen.

Prüfgrössen für alle vier Bugs:

- Desktop: 1440 × 900
- Mobile: 390 × 844
- iPhone 5 / SE der ersten Generation: 320 × 568

Jeder Ablauf beginnt mit einer frisch geladenen `index.html`.

## MS-24 — stabiler Name des Favoriten-Umschalters

1. Wähle eine sichtbare `.favorite-button`.
2. Ermittle im Accessibility Tree den berechneten Namen und `aria-pressed`.
3. Aktiviere sie mit Enter; lade frisch und wiederhole mit Leertaste.

Abnahmekriterien:

- Der berechnete Name lautet vor und nach der Aktivierung unverändert `<Angebotstitel> als Favorit merken`.
- Nur `aria-pressed` wechselt von `false` zu `true` beziehungsweise zurück.
- Die visuelle Favoritenmarkierung und das Speichern im Local Storage funktionieren weiterhin.
- Das `title`-Attribut darf weiterhin die jeweils ausführbare Aktion «hinzufügen» oder «entfernen» beschreiben; es darf den berechneten Namen wegen des stabilen `aria-label` nicht ersetzen.

## MS-25 — dauerhaft vorhandene Statusregion

1. Lade die Seite frisch.
2. Prüfe den Accessibility Tree vor der ersten Suche.
3. Suche nach `Datenjournalismus`.

Abnahmekriterien:

- `#smartStatus` ist bereits vor der ersten Suche als leere Statusregion im Accessibility Tree vorhanden und nicht `ignored`.
- `#smartStatus` hat `role="status"`, `aria-live="polite"` und `aria-atomic="true"` und wird nicht mit `hidden` oder `display:none` entfernt.
- Die Ergebnisbox `#smartOutput` bleibt vor der ersten Suche verborgen.
- Nach `Datenjournalismus` enthält `#smartStatus` die Trefferzahl und die Zahl der gezeigten Optionen; die sichtbare Ergebnisbox enthält weiterhin die bisherigen Chips, die Trefferzeile und drei Ergebniskarten.

## MS-26 — verständliche Reaktion auf leere Eingabe

Prüfe jeweils per Klick auf «Vorschläge finden» und per Enter:

1. leere beziehungsweise nur aus Leerzeichen bestehende Eingabe nach frischem Laden;
2. leere Eingabe nach einer erfolgreichen Suche nach `Datenjournalismus`;
3. danach erneut eine gültige Suche nach `Datenjournalismus`.

Abnahmekriterien:

- Bei leerer Eingabe erscheint sichtbar `Bitte eine Anfrage eingeben.`.
- `#smartInput` ist über `aria-describedby="smartValidation"` mit diesem Hinweis verbunden.
- `#smartStatus` enthält denselben Hinweis, sodass die Änderung programmatisch erkennbar ist.
- Alte Chips, Trefferzeile und Ergebniskarten werden vollständig entfernt; `#smartOutput` ist verborgen. Damit bleibt MS-17 erfüllt.
- Nach der nächsten gültigen Suche ist `#smartValidation` wieder verborgen und leer, und die normale Ergebnisausgabe funktioniert wieder.

## MS-27 — eindeutige Namen der Smart-Ergebnislinks

1. Suche nach `Datenjournalismus`.
2. Ermittle die berechneten Namen aller `.smart-result-card .source-link`.

Abnahmekriterien:

- Der berechnete Name jedes Links lautet `Offizielle Angebotsseite zu <Angebotstitel> öffnen`.
- Der jeweilige Angebotstitel ist enthalten; die drei berechneten Linknamen sind eindeutig.
- Der sichtbare Linktext `Zum Angebot ↗`, Zieladresse, neues Browserfenster und `rel="noopener noreferrer"` bleiben unverändert.

## Geänderte Dateien

- `app.js`: stabile Favoritenbezeichnung; Status- und Validierungslogik; eindeutige Namen der Smart-Ergebnislinks.
- `index.html`: dauerhaft vorhandene Statusregion, Eingabehinweis und semantische Verknüpfung; die versteckte Ergebnisbox ist nicht mehr selbst die Live-Region.
- `styles.css`: rein visuelles Verbergen der Statusregion und Darstellung des Eingabehinweises.
- `REVIEW_SCOPE.md`: nur dieser Review-Auftrag.

Alle anderen Dateien sind bytegleich mit V15. Insbesondere sind `data.js` und `smart-search-data.js` unverändert.

## Review-Regel

Prüfe pro Bug nur das genannte Abnahmekriterium und unmittelbare Regressionen, die durch genau diese Änderungen verursacht wurden. Keine Gesamtprüfung, keine neuen Verbesserungsvorschläge und keine früheren Bug-IDs wieder öffnen.

Antwort gemäss der festen Projektanweisung. Danach Prüfung beenden.
