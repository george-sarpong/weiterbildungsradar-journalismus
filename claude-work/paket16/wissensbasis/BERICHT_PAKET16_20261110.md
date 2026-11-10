# BERICHT Paket 16 – Anzeige auf Deutsch (E113) und Gegenlesen der Website, 10.11.2026

Auslöser: Owner-Hinweis «ausgebucht; provider offers to organise additional date by phone das ist auch nicht schön»; Owner-Antwort «1: ja» (alle englischen Notizen auf Deutsch) und Auftrag «überall drüberlesen und bewerten». Arbeitszweig `claude/datenharmonisierung`, Commit **024046c**, kein Merge nach `main`.

## 1. Umsetzung E113

`paket16/config/korrekturen.csv` (erzeugt von `paket16/scripts/uebersetzung_p16.py`): 132 Felder (Start, Dauer, Ort) bei 113 sichtbaren Angeboten; alter Wert und Herkunft je Feld; `data-p16.js` = `data-p14.js` + CSV (`build_daten_p16.py`, prüft jeden alten Wert). App, Smart-Daten und HTML-Seiten unverändert. Beispiele: «14 Hours» → «14 Stunden» (NobleProg, 52), «Zurich / Lausanne / Genève / Bâle» → «Zürich / Lausanne / Genf / Basel», «Genève; exact venue not published …» → «Genf; genauer Kursort: keine Angabe», «Aktuelle/künftige Durchführungen im Provider-Kalender; … Batch nicht separat normalisiert» → «Termine im Kalender des Anbieters», V59-SZ05 → «ausgebucht; Zusatztermin auf Anfrage per Telefon». Eigenname «ZHAW School of Management and Law» bleibt. Die Rückfrage nannte 76 Kurse (engere Zählung auf den Rohdaten); die Zählung auf den gerenderten Karten ergab 113.

## 2. Tests

`test_paket16.js` 6/6 (reproduzierbar, 132 Felder mit Herkunft, 1'068 sichtbare Angebote unverändert, keine englischen Notizen in Start/Dauer/Badges, nur korrigierte Karten geändert, Owner-Fall). `test_paket15.js` 17/17. Stufe 1 35 PASS, 0 FAIL, 4 später an beiden Stichtagen (identisch mit Paket 15). Stufe 2 10 PASS, 0 FAIL. B1, B3a, B3b PASS.

## 3. Gegenlesen (alle 1'068 sichtbaren Karten, Filter, Unterseiten; `paket16/tests/gegenlesen.js`, Ergebnis `paket16/out/gegenlesen_nachher.json`) – Owner-Entscheid offen

| # | Befund | Karten |
|---|---|---|
| G1 | Interne Prüfsprache im Feld Start/Ort: «Keine aktuelle/künftige Durchführung in der geprüften Evidenz» (195), «Varianten nach Produktcode» (49), «(offizielle Kurs-/Formatvariante)» (18), weitere wie «(erfasster Termin; beim Anbieter prüfen)», «nicht belastbar», «indexiert» | 287 |
| G2 | Französische/italienische Kurzformen in Dauer und Start: «2j - 14h00» (ORSYS, 58), «2 jours», «4 heures», «demi-journées», «/ inscriptions ouvertes», «1 lezioni» | 157 |
| G3 | Französische Ortsnamen im Ort-Badge (Genève, Bâle, Zurich …) | 70 |
| G4 | Preis zeigt nur Preisklasse ohne Währung («Bis 500», «501 bis 2'000», «Über 2'000») | 36 |
| G5 | Zahlenformat uneinheitlich («CHF 1300» ohne Apostroph 7, «ab CHF 1,740» mit Komma 4), «ab CHF 0»/«ab EUR 0» (2), Preis «Nicht anwendbar» (3) | 16 |
| G6 | Badge «Anbieterland: keine Angabe» auf fast jeder Karte; «CH-Zugang: keine Angabe» | 1'047 / 468 |
| G7 | Start enthält Dauer oder nur Uhrzeit («1 Tag», «09:30–17:00», «Workshop», «12 LE») | 23 |
| G8 | Niveau «Expert» englisch (Filter und 1 Karte) | 1 |
| G9 | Kursbeschreibungen in Originalsprache (Anbietertext, E038): englisch 53, französisch 70; 5 mit interner Prüfsprache | 128 |

Kein Befund: Kopfbereich, Freitext-Suche, Filterbeschriftungen (ausser G8), Unterseiten; keine Rohcodes (D5 PASS).
