# BERICHT Paket 13 – Owner-Entscheide zu Paket 12 umgesetzt (10.11.2026)

Auftrag: Owner-Antworten auf Bericht Paket 12 §4 (E096–E101) eintragen und umsetzen.
Nicht in diesem Paket: Release-Paket, `main`, Infomaniak, Master-Fortschreibung, kostenpflichtige Läufe.
Beleg: [GEPRÜFT] per Test · [OWNER] Entscheid George · [GELESEN] Original gelesen.

## 1. Entscheide [OWNER]
| ID | Inhalt |
|---|---|
| E096 | D8: Beschreibung endet mit «Laut Anbieter ↗» (Link zur Angebotsseite); Methodik: «Die Kurzbeschreibungen stammen von den Anbietern. Der Link «Laut Anbieter» führt zur Quelle.» |
| E097 | AT-PROD-OFFER-040 (Link defekt) und AT-PROD-OFFER-026 (Link führt zur Kursübersicht) bleiben sichtbar, Nachrecherche |
| E098 | OFFER-HEAD-003: neue URL laut Owner |
| E099 | T3-Header und eigene 404-Seite nach der Beta |
| E100 | «Niveau: keine Angabe» |
| E101 | Nachträge Paket 11 und 12 bestätigt |

Für 040 und 026 hat eine Websuche am 10.11. keine Nachfolgeseite gefunden.

## 2. Umsetzung (`claude-work/paket13/`)
- `scripts/port_p13.py` → `website/app-v39.js` (app-v38 + `descriptionSource`, `levelBadge`) und `website/methodik.html` (+1 Satz). Name des neuen Links beginnt mit dem sichtbaren Text (E089).
- `config/owner_korrekturen.csv` + `scripts/build_daten_p13.py` → `website/data-p13.js` = data-p7 + URL HEAD-003. Der alte Wert wird geprüft; die Herkunft steht im Feld `korrekturen` (E098). Der Master ist noch nicht nachgeführt.
- Übrige Seiten (index, datenschutz, impressum, 404) = Paket 10. Smart-Daten unverändert.

## 3. Tests [GEPRÜFT]
| Lauf | Ergebnis |
|---|---|
| `tests/test_paket13.js` (09.11., 01.12.) | 7/7 PASS: Reproduktion, übrige Dateien unverändert, Daten nur HEAD-003, Methodik +1 Satz, 1'071 bzw. 948 Karten mit «Laut Anbieter ↗», 214 bzw. 182 «Niveau: keine Angabe», sonst gleiche Karten |
| Testsatz Stufe 1 `test_paket8.js` auf Paket 13 | 35 PASS, 0 FAIL, 4 später an beiden Stichtagen |
| `test_browser_p8.js` | B1 PASS (axe 0 critical/serious, auch mit neuem Link), B3 PASS, S1-Vorprüfung PASS; T1 Soll offen (2 Fehler, live gleich) |
| Stufe 2 `paket12/tests/test_stufe2_browser.js` auf Paket 13 | 11 PASS, 0 FAIL: D5, D8, F9, F11, S1–S3, B2, T6, Länder-Badges, Niveau-Badge |

## 4. Stand Beta-Kriterien
- Alle Muss-Kriterien der Stufen 1 und 2 PASS oder «später», **ausser T5 Muss-Teil: FAIL**. 2 von 46 Links in den Testfrage-Ergebnissen sind defekt (AT-PROD-OFFER-040, -026) und bleiben nach E097 sichtbar. E076 sagt: ein solcher Link blockiert. Nach Vorlage §1 geht die Beta so nicht live.
- Soll offen: T1, T3, T4, eigene 404-Seite (T3/404 nach der Beta, E099).

## 5. Offene Owner-Fragen
1. **T5:** Die Beta bleibt blockiert, bis eines geschieht: (a) richtige URLs für 040 und 026 finden (Nachrecherche, ohne Kosten), (b) beide Angebote bis dahin ausblenden, oder (c) E076 ändern (defekter Link mit Nachrecherche-Vermerk blockiert nicht). *Empfehlung: b*, weil die Karten heute ins Leere führen.
2. **Sprach-Badge:** Bei 24 Angeboten steht ebenfalls nur «keine Angabe». *Empfehlung:* «Sprache: keine Angabe», gleiche Regel wie E100.
3. **Nachtrag Paket 13** im GESAMTWISSENSSTAND bestätigen.
4. **Repo:** Paket 12 und 13 sind nicht gepusht (Push in der Sitzung abgelehnt). Dateien als ZIP im Chat.

## 6. Drift-Prüfung
Umgesetzt nur E096, E098, E100; E097, E099, E101 nur eingetragen. Unberührt: Master, Smart-Daten, übrige Seiten, `main`, Infomaniak.

## 7. Ergänzung 10.11. (E102–E104)
- **E102:** «Sprache: keine Angabe» (24 Angebote), in `app-v39.js` über `port_p13.py`.
- **E103:** Nachrecherche der zwei Links: oema.at/seminare und apa-campus.at/de/c/workshops führen die Kurse nicht mehr, die Websuche fand keine Nachfolgeseite [GELESEN]. Der Owner hat archivieren gewählt (E015). Umgesetzt als HOLD mit Grund ARCHIV in `data-p13.js` (`owner_korrekturen.csv`, Herkunft je Feld) und im Master-Nachtrag `out/master_3818_p13.csv` (`scripts/master_p13.py`, 6 Felder inkl. E098, alte Werte geprüft). E097 ist abgelöst.
- **E104:** Nachtrag Paket 13 bestätigt.
- **Tests (Endstand):** `test_paket13.js` 7/7 an beiden Stichtagen (Daten nur die 3 Korrekturen; sichtbar 1'069 statt 1'071 bzw. 947 statt 948). Stufe 1 mit `DATA`/`MASTER` des Pakets: 35 PASS, 0 FAIL, 4 später an beiden Stichtagen. B1 PASS. Stufe 2: 11 PASS, 0 FAIL (heute 1'068 sichtbar). **T5 Muss-Teil: 45/45 Links OK** (neu AT-PROD-OFFER-147 geprüft, HEAD-003 laut Owner).
- **Damit sind alle Muss-Kriterien der Stufen 1 und 2 PASS oder «später».** Offen: Owner-Abnahme (Vorlage §3), Release-Paket mit Freigabe, Push von Paket 12/13, Übernahme des Master-Nachtrags in `run_paket3.sh`.
- `test_paket8.js` hat zwei optionale Parameter erhalten: `DATA` und `MASTER`. Ohne sie verhält er sich wie bisher.
