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
