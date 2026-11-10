# BERICHT Paket 9 – Korrekturen aus dem Testsatz Paket 8 (10.11.2026)

Auftrag (Owner 10.11., «ja zu allem» auf Bericht Paket 8 §5): Nachtrag Paket 8 bestätigen (E085) und die Empfehlungen umsetzen: D5 Rohcodes übersetzen (E086), Code-Platzhalter als «nicht erfasst» (E087), T14b Erwartung für die Beta anpassen (E088), B1 Linknamen (E089), Smart-Karten ohne Nummer (E090), Suchtext nicht in die Adresse (E091), Reihenfolge Journalist:innen-Tarif lassen (E092).
Nicht in diesem Paket: Vorabprüfung im Browser (Stufe 2), Release-Paket, `main`, Infomaniak, Daten, Master, Smart-Daten, E053/E058/E059, DE/USA.
Beleg: [GEPRÜFT] per Test gerechnet · [GELESEN] Original gelesen · [OWNER] Entscheid George.

## 1. Grundlage
- Basis: `paket7/website/app-v36.js`, `index.html`, `methodik.html` (Hashes geprüft); `datenschutz.html`, `impressum.html`, `404.html` aus dem Live-Snapshot Paket A; Daten unverändert `paket7/website/data-p7.js` und `paket3/out/merge_kandidat_smart.json` [GEPRÜFT].
- Befunde und Empfehlungen: `BERICHT_PAKET8_20261110.md` §3–§5 [GELESEN]; Owner 10.11. [OWNER].
- GitHub: Push-Zugriff am 10.11. erteilt; Paket 8 (a6cdcf5, 12b3557) auf `claude/datenharmonisierung` gepusht [GEPRÜFT].

## 2. Umsetzung [GEPRÜFT]
| Datei | SHA-256 | erzeugt mit |
|---|---|---|
| `website/app-v37.js` | `922a72ff9c7a…` | `scripts/port_app_v37.py` (13 Ersetzungen auf app-v36) |
| `website/index.html` | `9de6bdab8d6f…` | `scripts/port_html_p9.py` (1 Zeile) |
| `website/methodik.html` | `475d9bf1c60d…` | dto. (2 Zeilen) |
| `website/datenschutz.html`, `impressum.html`, `404.html` | `4c2482e4bb71…`, `595fe7e87a43…`, `236b2168513b…` | dto. (je 1 Zeile) |

- **E086 Rohcodes:** Anzeigeübersetzung für Dauer, Start, Region (Karte und Smart-Karte): `ON_REQUEST`, `SUR_DEMANDE` → «auf Anfrage»; `FUTURE_BOOKABLE` → «buchbar»; `NO_FREE_PLACES` → «ausgebucht»; `NICHT_VERIFIZIERT_CURRENT_RECHECK` → «nicht verifiziert»; `NOT_PUBLISHED`, `NICHT_PUBLIZIERT` → «nicht erfasst». Unbekannte Codes bleiben sichtbar stehen, damit der Test D5 sie meldet. Der Datensatz bleibt unverändert (223 Datensätze tragen weiter Codes).
- **E087 Platzhalter:** Bezeichnungen der Codes `NICHT_PUBLIZIERT`/`NOT_PUBLISHED` (Niveau, Format, Sprache) → «nicht erfasst», `PREIS_NICHT_PUBLIZIERT` → «Preis nicht erfasst» (Karte und Filter, Filterwerte unverändert); Preis und Zugang ohne Angabe → «nicht erfasst». Lesbare Texte aus den Daten wie «Dauer nicht publiziert.» oder «Nächster Termin nicht publiziert» bleiben. Methodik nennt jetzt «nicht erfasst», «nicht publiziert» oder «Preis auf Anfrage».
- **E089 Linknamen (WCAG 2.5.3):** Logo-Link ohne eigenes `aria-label` auf Startseite, Methodik, Datenschutz, Impressum und 404 (Name = sichtbarer Text «Media Skills»); Angebotslinks heissen «‹sichtbarer Text›: ‹Titel› öffnen».
- **E090:** Smart-Karten ohne «Option 1–3»; die Zusammenfassung «Hier sind n Optionen» bleibt.
- **E091:** Die Katalogsuche schreibt den Suchtext nicht mehr als `?q=` in die Adresse; andere Filter bleiben in der Adresse; alte Links mit `?q=` werden weiter gelesen.
- **E088, E092:** keine Code-Änderung. T14b steht im Testsatz jetzt als «später» (mit E058).

## 3. Wirkung [GEPRÜFT]
- Sichtbare Menge und Standardreihenfolge unverändert: 1'071 am 09.11., 948 am 01.12.
- Am 09.11. ändern sich 492 Karten, nur in den Feldern oben; keine Karte zeigt mehr einen Rohcode (vorher 74).
- Smart-Suche: gleiche Treffer, Texte und Reihenfolge wie v36 (8 Anfragen), ausser übersetzten Codes und «nicht erfasst».
- Weiter «nicht publiziert» in lesbaren Texten (Datentexte und die Termin-Hinweise der App aus Paket 6, z. B. «Nächster Termin nicht publiziert»; 09.11.): Start 248, Zugang 110, Dauer 93, Ort 64, Preis 2.

## 4. Tests [GEPRÜFT]
| Lauf | 09.11. | 01.12. |
|---|---|---|
| `paket9/tests/test_app_v37.js` (neu, inkl. 3 Gegenproben) | 15/15 | 15/15 |
| Testsatz Stufe 1 `paket8/tests/test_paket8.js` auf Paket 9 | 35 PASS, 0 FAIL, 4 später | 35 PASS, 0 FAIL, 4 später |
| Browser `test_browser_p8.js` auf Paket 9 (Datum 10.11.) | B1, B3a, B3b, S1-Vorprüfung PASS; T1 und T5 Soll offen | – |
| Paket 5 / 6 / 7 | 24/24 · 35/35 · 41/41 | 24/24 · 35/35 · 41/41 |
| Prüfwerkzeug R1/R2 | 5/5 | – |

- Neue Prüfungen: N01 Reproduktion (app-v37.js und 5 HTML-Seiten byte-identisch), N02 HTML-Umfang und Skript-Verweise, N03 Logo-Link, N04/N05 Karten gegen v36 mit unabhängiger Referenz, N06 keine Rohcodes, N07 Daten unverändert, N08 Filter (Werte und Trefferzahlen gleich), N09 Linknamen (alle Angebotslinks), N10 Smart-Suche gegen v36, N11 ohne Optionsnummer, N12 Adresse ohne `?q=` und alte Links; Gegenproben G01 (Übersetzung entfernt), G02 (unbekannter Code bleibt sichtbar), G03 (`?q=` wieder schreiben).
- Testsatz Paket 8 angepasst: Prüfling wählbar (`WEBSITE`, `APP`), T14b «später» (E088), Hinweis F9 aus der Ausgabe statt fest. Die Ergebnisdateien von Paket 8 zu v36 bleiben unverändert; die Ergebnisse zu Paket 9 liegen in `paket8/out/paket9/`.
- Zwei Testfehler beim Bau behoben, keine App-Fehler: N10 verlangte zunächst unveränderte Platzhalter in der Smart-Suche, N09 hatte eine feste Mindestzahl Links (am 01.12. nur 948 Karten).
- T1 (Soll): unverändert 2 Fehler in `index.html` (Zeilen 80, 100: `aria-label`/`aria-labelledby` auf `div` ohne Rolle), live gleich.

**Damit sind alle Muss-Kriterien der Stufe 1 PASS oder nach E074/E088 «später».**

## 5. Hinweise
1. Die Zuordnung der Codes zu Texten (§2, E086) hat Claude festgelegt; «buchbar» und «ausgebucht» geben die Codes aus den Daten wieder und prüfen keine Buchungslage.
2. `index.html` verweist weiter auf `app-v33.js` und die Live-Daten. Erst das Release-Paket stellt auf `app-v37.js`, `data-p7.js` und die Smart-Daten des Kandidaten um und übernimmt die fünf geänderten HTML-Seiten.
3. Die Datenschutzerklärung stimmt jetzt auch für die Katalogsuche («keine Suchanfrage in der Internetadresse»); ihr Text ist unverändert.

## 6. Drift-Prüfung
Geändert: nur die sieben Entscheide E086–E092 in App und HTML, dazu Tests und Wissensbasis. Unberührt: Daten, Master, Smart-Daten, Skript-Verweise, `styles-v24.css`, `main`, Release, Infomaniak, kostenpflichtige Läufe.

## 7. Offen bis zur Beta
- Stufe 2 im Browser (Chrome, E048): D5 (Browser-Teil), D8, F9 (Browser-Teil), F11, S1, S2, S3, B2, T2, T3, T4, T5, T6.
- Release-Paket nur mit Freigabe: `index.html` auf `app-v37.js`, `data-p7.js`, Smart-Daten; die 5 HTML-Seiten aus `paket9/website/`; SHA256SUMS; R1-Prüfung mit `pruefe_paket.py`; Rollback = Paket A (R2 PASS); Anleitung R3/R5 (E040, Projektregel 7).
- Danach Owner-Abnahme 20 Min. (Vorlage §3).
