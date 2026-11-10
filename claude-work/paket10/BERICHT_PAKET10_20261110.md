# BERICHT Paket 10 – Fehlende Angaben als «keine Angabe» (10.11.2026)

Auftrag (Owner 10.11.): «nicht erfasst» suggeriert fehlende Arbeit, «nicht publiziert»/«nicht veröffentlicht» schiebt die Schuld auf den Anbieter. Neu überall neutral «keine Angabe» (Owner: «keine Angabe oder k. A.», «Empfehlung 2» = auch lesbare Texte vereinheitlichen) → E093.
Nicht in diesem Paket: Daten, Master, Smart-Daten, übrige Seiten, Release, `main`, Infomaniak.
Beleg: [GEPRÜFT] per Test gerechnet · [OWNER] Entscheid George.

## 1. Umsetzung [GEPRÜFT]
| Datei | SHA-256 | erzeugt mit |
|---|---|---|
| `website/app-v38.js` | `4eb6a7e4a985…` | `scripts/port_p10.py` (20 Ersetzungen auf app-v37) |
| `website/methodik.html` | `7e74d409475b…` | dto. (2 Sätze) |
| `website/index.html`, `datenschutz.html`, `impressum.html`, `404.html` | = Paket 9 | Kopie |

- **Ausgeschrieben «keine Angabe», nicht «k. A.»** (Wahl Claude): Screenreader lesen «k. A.» schlecht vor, und die Website spricht überall gleich.
- **Platzhalter der App:** Anbieterland, CH-Zugang, Ort, Niveau, Format, Sprache, Zugang, Preis und Filter «Durchführungsort» zeigen «keine Angabe» (Preisfilter «Preis: keine Angabe»). Termin-Hinweise: «Nächster Termin: keine Angabe», «Bereits begonnen; nächster Start: keine Angabe», «Nächste Ausgabe: keine Angabe». Smart-Karte: «Dauer: keine Angabe», «Originalpreis: keine Angabe».
- **Lesbare Datentexte (nur Anzeige):** «X nicht publiziert» bzw. «kein X publiziert» wird zu «X: keine Angabe». Ist X das Feld selbst, bleibt «keine Angabe». Beispiele: «Dauer nicht publiziert.» → «keine Angabe»; «17.11.2026; Uhrzeit nicht publiziert» → «17.11.2026; Uhrzeit: keine Angabe»; «Kein aktueller Termin publiziert» → «Aktueller Termin: keine Angabe». Die Daten bleiben wörtlich erhalten.
- **Methodik:** «Stattdessen erscheint «keine Angabe» oder beispielsweise «Preis auf Anfrage».» und «Fehlt eine dieser Angaben, steht «keine Angabe».»

## 2. Wirkung [GEPRÜFT]
- Sichtbare Menge und Reihenfolge unverändert (1'071 am 09.11., 948 am 01.12.). Alle 1'071 Karten haben mindestens eine fehlende Angabe und ändern sich deshalb im Wortlaut (häufigste: «Anbieterland: keine Angabe» 1'050).
- «nicht erfasst» erscheint nirgends mehr (Karten, Filter, Smart-Suche, alle Seiten).
- **Restfälle, bewusst nicht umformuliert** (Datentexte, in der Anzeige wörtlich): 2 deutsche Sonderformulierungen (OFFER-MAZ-031 «… im geprüften aktuellen Katalog nicht belastbar publiziert», CH-NOV-OF-036 «… nicht generalisiert publiziert») und 6 englische Ortsangaben «exact venue not published …» (IF-G03, IF-G05, IF-G07, IF-P10, IF-W04, IF-W05). Vorschlag: bei der Nachrecherche umschreiben.

## 3. Tests [GEPRÜFT]
| Lauf | 09.11. | 01.12. |
|---|---|---|
| `paket10/tests/test_app_v38.js` (neu, 2 Gegenproben) | 12/12 | 12/12 |
| Testsatz Stufe 1 auf Paket 10 | 35 PASS, 0 FAIL, 4 später | 35 PASS, 0 FAIL, 4 später |
| Browser auf Paket 10 | B1, B3a, B3b, S1-Vorprüfung PASS; T1, T5 Soll offen | – |
| Paket 5 / 6 / 7 / 9 | 24/24 · 35/35 · 41/41 · 15/15 | 24/24 · 35/35 · 41/41 · 15/15 |

- Neue Prüfungen: P01 Reproduktion, P02 übrige Seiten = Paket 9, P03 Menge und Reihenfolge, P04 Karten gegen v37 mit unabhängiger Referenz, P05 kein «nicht erfasst», P06 Restfälle nur die bekannten 8, P07 acht Beispiele aus dem Bestand von Hand festgelegt, P08 Filter (gleiche Trefferzahlen je Option), P09 Smart-Suche (gleiche Treffer, Reihenfolge, Budgettexte), P10 Daten unverändert; G01/G02 Gegenproben.
- Ein Testfehler beim Bau behoben: Ein Beispiel nutzte den 17.11.2026, der am Stichtag 01.12. vorbei ist (die App blendet vergangene Termine korrekt aus, E014).

## 4. Drift-Prüfung
Geändert: nur Wortlaut fehlender Angaben in App und Methodik, Tests, Wissensbasis. Unberührt: Daten, Logik, Sichtbarkeit, Filterwerte, übrige Seiten, Release, `main`.

## 5. Offen bis zur Beta
Wie Bericht Paket 9 §7, Website-Kandidat jetzt `paket10/website/` (`app-v38.js`; Daten `paket7/website/data-p7.js`).
