# REVIEW_SCOPE — mediaskills_fix_20261009_V10_MS14-MS17

MODUS: BUGFIX-REVIEW

Prüfe ausschliesslich diesen Versionsordner und die Bug-IDs MS-14 bis MS-17. V09 ist die unveränderte Baseline. Frühere Bugs nicht erneut öffnen.

## MS-14

Abnahmekriterium: Die Anfrage «Ich suche einen Online-Kurs zu KI für höchstens CHF 500.» liefert weiterhin 7 passende Angebote und zeigt weiterhin in dieser Reihenfolge:

1. Avid Media Composer Ultimate : Tracking
2. Canva and AI in practice
3. Designing Personal Knowledge Bases with Notion

Bei Option 2 und Option 3 enthält die angezeigte Durchführung «Online». Auch die Durchführung derselben beiden Angebote in der normalen Angebotsliste enthält «Online». Die Zeile «Passt, weil» widerspricht damit der sichtbaren Durchführung nicht mehr.

## MS-15

Abnahmekriterien:

- «Recherche vor Ort» zeigt dieselben Chips und dieselbe Trefferzahl wie «Recherche Präsenz»: Thema «recherche», Durchführung «Präsenz», 1 Treffer.
- «Social Media bis EUR 400» zeigt den Thema-Chip «social + media» ohne «eur» und nicht weniger Treffer als «Social Media bis CHF 400» mit 64 Treffern.
- «Präsenzkurs Fotografie» erkennt «Präsenz» als Durchführung und verwendet nur «fotografie» als Thema.
- «kostenlos aber maximal CHF 1000 Video» verwendet nur «video» als Thema. Kostenlos- und Budget-Erkennung bleiben erhalten.
- In keinem Thema-Chip dieser Anfragen erscheinen «vor», «eur», «prasenzkurs» oder «aber».

## MS-16

Abnahmekriterien:

- Der klassische Preisfilter «Über 2'000» liefert weiterhin 114 aktuelle Angebote. Keine sichtbare Karte zeigt dabei einen Preis oder Mindestpreis von 2'000 oder weniger.
- Der klassische Preisfilter «501 bis 2'000» liefert weiterhin 385 aktuelle Angebote. Keine sichtbare Karte zeigt dabei einen Preis oder Mindestpreis unter 501 oder über 2'000.
- Die 20 im Bugbericht genannten Karten zeigen jetzt einen Preis, der zu ihrer Filterkategorie passt. Bei komplexen Raten- oder Komponentenpreisen ist ein eindeutiges Kategorienlabel zulässig.
- Die gespeicherten `priceCategory`-Werte, strukturierten `priceOptions`, Parser- und Resolverstände bleiben unverändert. Geändert wurde nur die kompakte Kartenanzeige.

## MS-17

Abnahmekriterium: Nach einer erfolgreichen Freitext-Suche entfernt ein anschliessendes Absenden eines leeren oder nur aus Leerzeichen bestehenden Felds sämtliche vorherigen Chips, die Trefferzeile und die Ergebniskarten. Das gilt sowohl beim Button als auch bei Enter. Der Freitext-Ausgabebereich ist danach verborgen; die Preisübersicht zeigt wieder den aktuellen Gesamtbestand.

## Geänderte Dateien

- `app.js`: kategoriekonsistente kompakte Preisanzeige; zusätzliche Füll-/Währungs-/Formatwörter; Erkennung von «Präsenzkurs»; Löschen veralteter Freitext-Ausgabe bei leerer Eingabe.
- `data.js`: ausschliesslich `format` bei `OFFER-NOBLE-021` und `OFFER-NOBLE-037` von `PRÄSENZ` auf `PRÄSENZ | ONLINE` erweitert. Die bereits vorhandene VERIFIED-Sidecar-Evidenz nennt für beide Angebote REMOTE und IN_PERSON.
- `REVIEW_SCOPE.md`: nur dieser Review-Auftrag.

Alle anderen Dateien sind bytegleich mit V09. `smart-search-data.js` ist unverändert.

## Review-Regel

Prüfe pro Bug nur das genannte Abnahmekriterium und unmittelbare Regressionen, die durch genau diese Änderung verursacht wurden. Keine Gesamtprüfung, keine neuen Verbesserungsvorschläge und keine früheren Bug-IDs wieder öffnen.

Antwort gemäss der festen Projektanweisung. Danach Prüfung beenden.
