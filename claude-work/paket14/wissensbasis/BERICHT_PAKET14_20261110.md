# BERICHT Paket 14 – Rückmeldung aus der Owner-Abnahme (10.11.2026)

Auftrag: Owner-Rückmeldung nach dem Durchklicken des Abnahme-Stands Paket 13 (Link raw.githack.com auf docs/ des Arbeitszweigs).
Nicht in diesem Paket: Gestaltung (Owner: «Ästhetik … später, erst die Technik»), Release, `main`, Infomaniak.

## 1. Entscheide [OWNER]
| ID | Inhalt |
|---|---|
| E105 | «Laut Anbieter» mit Link streichen (redundant); die Beschreibung steht ohne Zusatz. Löst E096 ab; Kriterium D8 entfällt |
| E106 | Fehler: «Ich möchte einen Kurs für Medienmanagement oder Datenjournalismus machen für 2000 chf» fand nichts. Korrigieren |

## 2. Ursache und Korrektur [GEPRÜFT]
- Die Smart-Suche verknüpfte alle Themenwörter mit UND: «medienmanagement + datenjournalismus + machen». Kein Angebot erfüllt alle drei.
- Korrektur in `app-v40.js` (`scripts/port_p14.py` aus app-v39): «oder» trennt Themen-Alternativen, innerhalb einer Alternative gilt weiter UND; «machen», «besuchen», «belegen», «absolvieren» sind keine Themen. Anzeige «Thema: medienmanagement oder datenjournalismus». Ohne «oder» bleibt alles wie bisher.
- E105: Link und Methodik-Satz entfernt; `methodik.html` = Paket 10. Daten unverändert (`data-p13.js`).

## 3. Tests [GEPRÜFT]
| Lauf | Ergebnis |
|---|---|
| `tests/test_paket14.js` (09.11., 01.12.) | 6/6 PASS; Georges Satz: 17 Angebote = Medienmanagement 7 + Datenjournalismus 10; ohne «oder» gleiche Treffer wie Paket 13 |
| Stufe 1 `test_paket8.js` (Paket 14, Daten und Master-Nachtrag Paket 13) | 35 PASS, 0 FAIL, 4 später an beiden Stichtagen; Trefferlisten T01–T20 identisch mit Paket 13 |
| `test_browser_p8.js` | B1, B3 PASS |
| Stufe 2 | 10 PASS, 0 FAIL, D8 entfällt (E105) |

## 4. Abnahme-Stand
`docs/` auf `claude/datenharmonisierung` neu aus Paket 14 (`scripts/build_docs_abnahme.py`). Link für den Owner: raw.githack.com auf den Commit (siehe Chat). `main` unberührt.

## 5. Offen
- Gestaltung (später, Owner).
- Owner-Abnahme fortsetzen, danach Release-Paket mit Freigabe.
- Hinweis: In Georges Beispiel zeigen die 3 Vorschläge nur Datenjournalismus, weil die Auswahl nach Budget und Punktzahl erfolgt, nicht nach Thema. Kein Fehler, aber für «oder»-Suchen evtl. unerwartet.

## 6. Drift-Prüfung
Nur E105 und E106 umgesetzt. Keine Gestaltungsänderung, keine Datenänderung.

## 7. Ergänzung 10.11.: Daten OFFER-MEDIENCAMPUS-039 (E107)
- Owner-Test: «was gibt es für Redaktionsmanagement für 9000 CHF» zeigt «Modernes Redaktionsmanagement» (Mediencampus) ohne Preis. Auftrag: aktualisieren.
- Anbieterseite https://www.mediencampus.ch/cmf04-modernes-redaktionsmanagement.html, abgerufen 10.11. [GELESEN]: Kursgeld «Fr. 1'150.-, 1 Tag Privatseminar»; Kursdaten «Privatseminar»; MWST, Ort, Termine nicht genannt.
- Nachgeführt mit Herkunft (`config/korrekturen.csv`, `scripts/build_daten_p14.py`): `data-p14.js` Preis «CHF 1'150», Kategorie 501–2000, Dauer «1 Tag», Prüfdatum 10.11.2026; `out/smart-search-data-p14.json` Preis EXACT 1'150 CHF regulär. Ort, Termin, Format bleiben «auf Anfrage» bzw. «keine Angabe».
- Tests: `test_paket14.js` 7/7 (neu P07: Kurs erscheint bei «Redaktionsmanagement für 9000 CHF» mit CHF 1'150 «im Budget»); Stufe 1 35 PASS, 0 FAIL, 4 später; Stufe 2 10 PASS, 0 FAIL. `docs/` neu (data-p14, smart-p14). Master: Nachtrag offen (wie E098/E103).
- **E108 (Owner 10.11.):** «Ohne Hinweis ist die Mehrwertsteuer enthalten.» Das entspricht dem heutigen Verhalten: Preise ohne MWST-Angabe (`taxMode` UNSPECIFIED, 995 Preisoptionen) rechnen im Budget ohne Zuschlag, wie E084 es schon für Spannen festhält; nur «exkl. MWST» (EXCLUDED, 182) wird gesondert behandelt. Keine Code- oder Datenänderung nötig; Bemerkung in `korrekturen.csv` angepasst.

## 8. Ergänzung 10.11.: alle Mediencampus-Kurse ohne Preis (E109)
- Owner: «ja, natürlich» auf die Frage, die übrigen 53 Mediencampus-Kurse ohne Preis von den Anbieterseiten nachzutragen.
- 53 Seiten einzeln abgerufen (WebFetch, kostenlos), Kursgeld und Kursdaten wörtlich in `out/mediencampus_abruf.tsv` [GELESEN].
- 50 Seiten nennen CHF 1'150 («1150.--», «CHF 1'150.-», «Fr. 1'150.-», teils «inkl. Kursunterlagen», teils «1 Tag Privatseminar»); Kursdaten überall «Privatseminar» bzw. «Privatkurs/Mediencoaching», keine Termine.
- 3 Lehrgänge ohne Betrag auf der Seite: OFFER-MEDIENCAMPUS-010 (Crossmedia-Manager), -030 (Medienkorrektorat), -043 (Dipl. Lektor/in MNS); bleiben «keine Angabe», Nachrecherche.
- Nachgeführt mit Herkunft je Feld (`config/korrekturen.csv`): Preis «CHF 1'150», Kategorie 501–2000, Prüfdatum 10.11.2026 bei 50 Angeboten; Dauer «1 Tag» nur bei den 33, deren Seite «1 Tag» nennt; Smart-Preis EXACT 1'150 CHF regulär. MWST nach E108 inkl.
- Mediencampus danach: 56 sichtbare Kurse, 53 mit Preis, 3 ohne.
- Tests: `test_paket14.js` 8/8 (neu P08); Stufe 1 35 PASS, 0 FAIL, 4 später an beiden Stichtagen; Stufe 2 10 PASS, 0 FAIL. `docs/` neu. Master-Nachtrag offen.
