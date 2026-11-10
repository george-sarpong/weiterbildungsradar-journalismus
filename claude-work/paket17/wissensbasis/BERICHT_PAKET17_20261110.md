# BERICHT Paket 17 – Befunde des Gegenlesens umgesetzt (E114–E116), 10.11.2026

Auftrag: Owner-Antwort auf Bericht Paket 16 §3: «5.: CHF 1300 oder 1300 CHF, CHF 13'000 oder 13'000 CHF / alle weiteren einverstanden». Arbeitszweig `claude/datenharmonisierung`, Commit **d622204**, kein Merge nach `main`.

## 1. Umsetzung

| Punkt (Bericht 16) | Umsetzung | Ort |
|---|---|---|
| G1 Prüfsprache | ersetzt oder gestrichen, z. B. «Keine aktuelle/künftige Durchführung in der geprüften Evidenz» → «Nächster Termin: keine Angabe» (195), «(offizielle Kurs-/Formatvariante)», «(erfasster Termin; beim Anbieter prüfen)», Kurscodes wie «BRI261120», «Varianten nach Produktcode» | `data-p17.js` (E114) |
| G2 FR/IT | «2j - 14h00» → «2 Tage (14 Std.)», «jours/heures/demi-journées/lezioni» → Tage/Stunden/Halbtage/Lektionen, «inscriptions ouvertes» → «Anmeldung offen», «classe à distance» → «Live-Online» | `data-p17.js` (E114) |
| G3 Ortsnamen | Genève → Genf, Bâle → Basel, Neuchâtel → Neuenburg, Zurich → Zürich u. a.; Eigennamen von Institutionen bleiben, ausser «Université de Genève» → «Universität Genf» | `data-p17.js` (E114) |
| G4 Preis ohne Betrag (36) | Betrag stand im Datensatz, aber als «490 CHF» oder «700.–»: auf «CHF …» vereinheitlicht; NICEPHORE-001 «ab CHF 5500» aus publizierten Teilbeträgen (340 + 24 × 215); CH-CLEAN2-V12-D02 «CHF 550» inkl. Anmeldegebühr (E054). Keine Webabrufe nötig | `korrekturen_preis.csv` (E114) |
| G5 Zahlen | CHF 1300 / CHF 13'000 (Owner); Währung vor dem Betrag; für Preise, Budgets, Restbeträge, Zähler, Preisklassen | `app-v42.js` (E115) |
| G5 Ergänzung | 38 Karten mit publiziertem «zzgl./exkl. MWST» zeigen den Zusatz («CHF 850 zzgl. MWST»); ohne ihn wären sie nach E108 als inkl. MWST gelesen worden | `app-v42.js` (E115) |
| G6 Anbieterland | Badge nur, wenn belegt (21 Karten); löst E082 ab; Methodik-Satz angepasst | `app-v42.js`, `methodik.html` (E116) |
| G7 Start ohne Datum | «Termin: keine Angabe» bzw. «Datum: keine Angabe; 09:30–17:00 Uhr» | `data-p17.js` (E114) |
| G8 Niveau | «Expert» → «Experte/Expertin» | `app-v42.js` (E114) |
| G9 Beschreibungen | bleiben in Originalsprache (später, mit den Landessprachen) | – |

Daten: 1'070 Felder (Start, Dauer, Ort, Termine, Preis) bei 691 Angeboten, je mit altem Wert und Herkunft (`build_daten_p17.py` prüft jeden alten Wert); die Regeln wirken auch auf nicht sichtbare Datensätze. Sichtbare Angebote unverändert 1'068, geänderte Karten 1'048.

## 2. Tests

`test_paket17.js` 13/13 (reproduzierbar, Herkunft, Sichtbarkeit, keine Prüfsprache/FR/IT/frz. Ortsnamen, Preisformat, Anbieterland, Niveau, MWST 38/38, Start, Owner-Fälle «Budget: CHF 9000» und «CHF 1150», «Budget: CHF 20'000», 0 JS-Fehler). Stufe 1 35 PASS, 0 FAIL, 4 später an beiden Stichtagen; Kriterium D5a liest Badges jetzt nach Bezeichnung (Gegenprobe Paket 16 weiter 35 PASS). Stufe 2 10 PASS, 0 FAIL; Kriterium LB nach E116 (Ort und CH-Zugang immer, Anbieterland nur wenn bekannt). B1, B3a, B3b PASS. 40 virtuelle Anfragen: gleiche Ergebnisse wie Paket 15 (nur Zahlformat anders). `test_paket15.js` T3/R2 sind an app-v41 bzw. «1'150» gebunden und durch P10/P11 ersetzt.

## 3. Offen

Bestätigung der Nachträge 16 und 17; Kursbeschreibungen in Originalsprache (später); Smart-Preisdaten für die 15 Digicomp-, 1 Nicephore- und 1 CH-CLEAN2-Angebote fehlen weiterhin (Budgetsuche nutzt sie nicht; Anzeige korrekt).
