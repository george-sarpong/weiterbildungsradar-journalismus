# BERICHT Paket 6 – Website-Lücken §5 Punkte 3, 2, 1 (09.11.2026)

Auftrag (Owner 09.11., «make it so» auf Empfehlung): GESAMTWISSENSSTAND §5 Punkt 3, dann 2 und 1, als Übernahme bestehenden Codes auf die Live-Basis, nur auf `claude/datenharmonisierung`.
Nicht in diesem Paket: §5 Punkt 5 (`country`), Suchlogik WDA-01/03, `main`, Release, Skript-Verweise in `index.html`, Datendateien, kostenpflichtige Läufe.
Beleg: [GEPRÜFT] gerechnet bzw. per Test abgesichert · [GELESEN] Original gelesen.

## 1. Grundlage [GELESEN]
- Basis: `paket5/website/app-v34.js` (= Live `app-v33.js` + Paket 5), Live-Snapshot `index.html` und `methodik.html`.
- `app-v33.js` beruht am ehesten auf main `347f634` (11.10.) plus eigenen Live-Änderungen. main hat danach acht App-Commits; Paket 5 und 6 übernehmen sieben davon, offen bleibt `c79eb56` (§6 Punkt 4).
| Schritt | §5 | Entscheid | Quelle |
|---|---|---|---|
| A vergangene Termine | 3 | E014 | main `89b9a1a` (20.10.) |
| B Standardsortierung «Zuletzt geprüft» | 2 | E020 | PR10 `10c5943` (27.10., CP-01K) – nur `app.js`, `index.html`, `methodik.html`, ohne CI-Workflow |
| C CHF/EUR/USD 1:1 mit Hinweis | 1 | E037 (ergänzt E009) | main `df18860`, `119ca6e`, `e651956` (22.10.) |

## 2. Umsetzung [GEPRÜFT]
- `website/app-v35.js` (SHA-256 `2ece5c59b436…`), `website/index.html` (`d3eb7d5c3297…`), `website/methodik.html` (`490f35baba7e…`). Erzeugt mit `scripts/port_app_v35.py` (12 Ersetzungen auf app-v34, +77/−30 Zeilen) und `scripts/port_html_e020.py` (5 Ersetzungen auf dem Live-Snapshot). Beide prüfen den Hash der Quelle; jede Ersetzung muss genau einmal passen.
- Wortgleich mit main: `nextSession`, `currentRegion`, `isCurrent`, `publicStart`, `parseSmartBudget`, `smartBudgetText`.
- **A:** Ohne Enddatum und mit vergangenem Start → ausgeblendet. Karten zeigen keine vergangenen Daten mehr, sondern das künftige Startdatum, «Bereits begonnen; nächster Start nicht publiziert», «Nächster Termin nicht publiziert» oder «Nächste Ausgabe nicht publiziert». Die Datensätze bleiben unverändert.
- **B:** «Zuletzt geprüft (neueste zuerst)» ist die erste Option und der Standard; «Redaktionelle Auswahl» entfällt. Reihenfolge: Prüfdatum absteigend, dann Anbieter, Titel, ID. Alte Links `?sort=EDITORIAL` fallen auf den Standard zurück. Je ein Text in Startseite und Methodik beschreibt Aufnahmekriterien statt Auswahl.
- **C:** Budgets in CHF, EUR und USD (auch €, $, Euro, Dollar) werden erkannt und 1:1 mit CHF-, EUR- und USD-Preisen verglichen; GBP nicht. Bei Fremdwährung steht ein Hinweis beim Budgettext, unter den Preisbändern ein allgemeiner Hinweis. An drei Stellen passte der main-Kontext nicht wörtlich (Live-Regeln MS-41/MS-46); dort ist der main-Inhalt in die Live-Struktur eingesetzt. Live MS-41 («EUR erkannt, nicht angewendet») wird dadurch wirkungslos; MS-46 («Betrag ohne Währung, nicht angewendet») bleibt.
- `index.html` und `app-v35.js` gehören zusammen: Die neue Sortieroption braucht die neue App und umgekehrt.

## 3. Detailprüfung vor Umsetzung [GEPRÜFT]
- §5 Punkt 3 reproduziert: Live-Daten am 09.11. zeigen 151 Angebote mit vergangenem Start; mit A: 89 ausgeblendet, 62 als «Bereits begonnen» beschriftet.
- Risiko «künftiges Datum im Text, aber ‹nicht publiziert› angezeigt»: 0 Fälle in Live und Kandidat.
- Kandidat: A blendet 23 Angebote aus (20 Kurse, 2 CAS, 1 Programm); alle im Master `termin_status` VERGANGEN, keiner mit künftigem Datum im Text.
- E037: 111 budgetfähige Live-Angebote (Kandidat 100) mit EUR-Preis werden bei einem CHF-Budget neu verglichen statt «Preis unbekannt». GBP-Preise: 0.

## 4. Tests [GEPRÜFT]
`claude-work/paket6/tests/test_app_v35.js` (jsdom 24, Aufruf wie Paket 5): **35/35 PASS** am 09.11.2026 und am 01.12.2026; Paket-5-Test weiterhin 24/24.
- A01–A10: sichtbare Menge und Starttext je Karte = unabhängige Referenz (Live und Kandidat); keine Karte mit vergangenem Datum; Gegenprobe v34 (151); Grenzfälle; Datensatz unverändert.
- B01–B09: Optionen, Standardreihenfolge, Filterzähler, URL, Zurücksetzen, alter Link, Gegenprobe v34; HTML: nur die vorgesehenen Stellen geändert, Skript-Verweise unverändert.
- C01–C08: EUR-, USD-, €-, $-Budgets; Gegenprobe v34; MS-46 bleibt; Hinweistexte; gleicher Preis in EUR/CHF/GBP (EUR mit Hinweis, CHF ohne, GBP keine Budgetaussage).
- K01–K03: HOLD und `sessions` aus Paket 5 unverändert wirksam. D01–D02: Skripte reproduzieren alle drei Dateien byte-identisch; Läufe identisch.

## 5. Wirkung [GEPRÜFT]
| sichtbare Angebote am 09.11. | Live-Daten | Kandidat |
|---|---|---|
| app-v33 (live) | 1'097 | 1'098 |
| app-v34 (Paket 5) | 1'097 | 1'094 |
| app-v35 (Paket 6) | 1'008 | 1'071 |
Am 01.12.2026: Live-Daten 900, Kandidat 948 (app-v35).

## 6. Hinweise und offene Fragen an den Owner
1. **Wortlaut E037:** Der Entscheid nennt «zum Tageskurs nachrechnen»; übernommen ist der main-Text «… vereinfacht 1:1 verglichen; tatsächliche Wechselkurse und Steuern können abweichen». STATUS §1.5 wertet den main-Text als Umsetzung. Frage: Wortlaut so lassen oder «zum Tageskurs nachrechnen» ergänzen?
2. **E009 vs. E037:** E009 schliesst einen «fiktiven Fremdwährungs-Restbetrag» aus; main zeigt bei Fremdwährung den Restbetrag in der Budgetwährung mit 1:1-Hinweis. Nach Projektregel 1 gilt der jüngere E037 («1:1 als Rechengrundlage»); bitte bestätigen.
3. **Weitere «redaktionell»-Texte:** `10c5943` ändert nur Auswahl- und Rangfolge-Aussagen. Unverändert bleiben «redaktionell geprüft» (Meta-Beschreibungen, Kopfzeile, Lead), «Aktuelle Auswahl» und «Die Auswahl wird redaktionell aktualisiert». Das beschreibt Prüfung, keine Rangfolge; keine Änderung ohne Auftrag.
4. **main `c79eb56`** (20.10., QA09): Smart-Ergebnisse zeigen bei Nettopreisen ohne MWST-Satz «exkl. MWST». Fehlt live, steht in keinem §5-Punkt; nicht übernommen.
5. **Toter Code:** Die Live-Funktion `parseUnappliedEuroBudget` (MS-41) wird nicht mehr erreicht; belassen, um nur den main-Inhalt einzusetzen.
6. Die Methodik-Seite nennt weiterhin nur CH/AT/LI und erwähnt HOLD nicht (Paket 5 §6).

## 7. Drift-Prüfung
Geändert: nur §5 Punkte 3, 2, 1 und die zugehörigen Texte aus `10c5943`. Unberührt: §5 Punkt 5, WDA-01/03, weitere PR10-Funktionen (ERLEDIGT D), `c79eb56`, Skript-Verweise, Datendateien, `main`, Release.

## 8. Offen
- Release-Paket nur mit Freigabe: `index.html` auf `app-v35.js` (und Datendateien) umstellen, Rollback, Owner-Abnahme (E040, Projektregel 7).
- Vorlage Testkriterien Beta und Messung (E040, E056): eigener Schritt.
