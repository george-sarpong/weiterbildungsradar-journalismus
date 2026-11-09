# ERLEDIGT mediaskills.ch – nicht wieder öffnen (Fassung 1 + Nachträge Paket 3 bis 7, 10.11.2026)

Regel: Ein Punkt wird nur wieder geöffnet bei **konkretem neuem Auslöser** (Angebots-ID + Feld + Ausgabe/Termin + datierte Quelle) oder auf ausdrückliche Anweisung des Owners (Projektregel 2; Handoff Phase A §5).
Beleg: **[GELESEN]** = Original am 09.11. gelesen · **[GEPRÜFT]** = von Claude nachgezählt/gerechnet · **[OWNER]** = Entscheid George · **[CHATGPT]** = nur Übergabe, Original nicht gelesen.
Entscheid-IDs (E…) verweisen auf `ENTSCHEIDUNGSREGISTER.csv`.

## A. Vom Owner geschlossen

| Thema | Ergebnis | Beleg |
|---|---|---|
| QA09-116 Sonderfälle | Wieder normaler Katalogbestand; keine Sonderrecherche, keine 116er-Queue (E018) | CP01 CP-01D, Handoff §2 [GELESEN] |
| 307 Schutz-IDs (191 Archiv + 116 QA09) | Nicht neu bearbeiten; Änderungen nur per Owner (E035) | Übergabe §B2 [CHATGPT], STATUS §1.3 [OWNER] |
| «Master V120» | Kein Datenbestand für die Harmonisierung (E045) | WIDERSPRUECHE W4 [OWNER] |
| Massgebliche Live-Dateien | Paket A ist massgeblich, kein Freigabebericht nötig (E044) | WIDERSPRUECHE W1 [OWNER] |
| OUT/HOLD-Zeilen in der Beta | Nicht sichtbar, nur Nachrecherche-Warteschlange (E042) | WIDERSPRUECHE W9 [OWNER] |
| ORSYS Schweiz Durchführungsort | «Lausanne und Genf» genügt (E013) | CP01 B, Claim FAM13-C01 [GELESEN] |
| PCC-P32 | OUT_SCOPE (E016) | CP01 B, Claim 0W.14 [GELESEN] |
| PCC-P33, OFFER-CORSO-001, OFFER-FERNUNI-002, OFFER-CFJM-008 | ARCHIV; PCC-P08 CH-HOLD (E017, bestätigt E050) | CP01 B [GELESEN], Owner 09.11. [OWNER] |
| Hold FAM15-C04 (August-Importfehler V118/V119) | Geschlossen, betrifft nur archivierte Masterlinie (E055) | Owner 09.11. [OWNER] |
| Paket-2-Entwürfe | Abgenommen; GESAMTWISSENSSTAND ist Einstieg (E049) | Owner 09.11. [OWNER] |
| Projektbibel Phase A | Abgenommen mit vier Holds (EVT138, EVT144), heute Archiv (E023) | Handoff §9.4, §9.10 [GELESEN] |
| Colab-Notebook-Freigabe | Auf «eingeschränkt» gestellt | STATUS §2 [OWNER] |
| 22 NobleProg-/ORSYS-Kurse, AT-PROD-OFFER-154, PCC-P38 | HOLD wie main; mit ChatGPT mehrfach untersucht, nicht neu untersuchen (E071) | Owner 09.11. [OWNER] |
| Nachträge Paket 3 und 4 im GESAMTWISSENSSTAND | Bestätigt; präzisiert §3 (326 Zeilen ausserhalb Master), §5 Punkt 6 (46 HOLD, 41 sessions, 5 ohne endDate), §9 (letzter Commit 6dd901b, 51/51 erneut) (E072) | Owner 09.11. [OWNER], Repo-Prüfung [GEPRÜFT] |
| Nachträge Paket 5 und 6 im GESAMTWISSENSSTAND und in H, I | Bestätigt (E073) | Owner 09.11. [OWNER] |
| Länderanzeige: Filter und Anbieterland | Filter nach Durchführungsort; Anbieterland ohne Beleg «nicht erfasst» (E081, E082) | Owner 10.11. [OWNER] |

## B. Keine offenen Fehlermengen (historische Zähler, nicht neu abarbeiten)

| Zahl | Bedeutung | Beleg |
|---|---|---|
| 135 Case-Keys / 186 Legacy-OPEN / 1'856 Feldmatrix (116 × 16) | Historisches Kontrollinventar, keine Arbeitsliste | CP01 D, Handoff §3.5 [GELESEN] |
| 346 Preise NEEDS_REVIEW (PriceParser V1_010, 07.10.) | Bewusst vorsichtig klassiert, keine 346 Bugs. Einzelne Preise können trotzdem in die Nachrecherche (z. B. OFFER-CFJM-013) | CP01 F [GELESEN] |
| 105 Claims, 33 Widersprüche, 2'719 Drive-IDs (842 geprüft, 441 bedingt P1) | Dokumentarische Abnahme der Projektbibel; keine Lese-Pflicht für die 441 | Handoff §3, §6 [GELESEN] |
| 17 Mehrvarianten-Angebote ohne gebundenen Preis | Alle priceEligible=false, kein aktiver Fehltreffer | End-to-End-Audit Abschn. A, G [GELESEN] |
| D4-Preisnormalisierung August | 224 → 218 normalisiert + 6 bewusst komplexe Ausnahmen | Claim FAM11-C02 [GELESEN] |

## C. In Paket 1 geklärt (09.11.)

| Nr. | Ergebnis | Beleg |
|---|---|---|
| W1 | `app-v33.js` gehört zu Paket A (live zwischen 13.10. und 15.10.), nicht zum Review-Strang V33–V36 | WIDERSPRUECHE [GEPRÜFT] |
| W2 | USA: 2'326 = Research-Zähler, 2'290 = Publikation ohne Knight, 2'355 = R4 (massgeblich für Website) | WIDERSPRUECHE [GEPRÜFT] |
| W4 | V120 kein Datenbestand | WIDERSPRUECHE [OWNER] |
| W5 | 13 fehlende Suchindex-IDs = vor 30.09. abgelaufen; Index wird ohnehin neu erzeugt | WIDERSPRUECHE [GEPRÜFT] |
| W6 | AT-Dateiname: 124 AT-Zeilen vollständig in R4-AT | WIDERSPRUECHE [GEPRÜFT] |
| W9 | OUT/HOLD → Nachrecherche, nicht sichtbar | WIDERSPRUECHE [OWNER] |
| – | Dreiwege-Merge-Analyse `data.js` (764/77/10 Felder; Vergleich mit PR10, siehe F) und Live-Snapshot mit Prüfsummen | STATUS §2 [GEPRÜFT] |
| – | Recherchen R1 (schema.org, Indexierung), R2 (Preisdarstellung, Budget), R3 (Webstandards CH) | `claude/RECHERCHEN_20261109.md` – vor Umsetzung Primärquelle erneut prüfen |

## D. In PR10 bereits umgesetzt – nicht neu entwickeln, sondern im Merge übernehmen oder verwerfen

Nicht live. PR10 ist Quellenmaterial (E033). Über die Übernahme entscheidet der Dreiwege-Merge (E035).

| Funktion | Beleg |
|---|---|
| CSS-Korrekturen MS48–MS58 inkl. Footer-Umbruch, lesbare Validierungsfarbe | CP01 CP-01D/E [GELESEN] |
| Smart-Suche: 3 direkte + 3 getrennt klassierte Alternativen, «Weitere Kurse anzeigen» in 3er-Schritten, Fokusführung | CP01 CP-01F/G [GELESEN] |
| Klassische Suche: Eingabe-Bündelung 180 ms | CP01 CP-01I [GELESEN] |
| Katalog: 30 Karten, «Weitere 30 Angebote anzeigen» | CP01 CP-01J [GELESEN] |
| Standardsortierung «Zuletzt geprüft», Methodik-Text ohne «redaktionelle Auswahl» (E020) | CP01 CP-01K [GELESEN]; **in Paket 6 übernommen** (PR10 10c5943, siehe I) |
| CI-Rauchtests (lokal Chromium; gehostete Tests übersprungen) | CP01 CP-01H [GELESEN] |
| WDA-03 Gratis-Trennung (Bezeichnungen gemäss E057 anpassen) und WDA-05 Preiskarten-Schutz (nur Code-Entwurf) | Handoff §3.5, §9.5 B1-D03 [GELESEN]; **WDA-03 in Paket 7 neu nach E057 gebaut**, PR10-Entwurf nicht übernommen (siehe K) |
| Hinweistext Währung 1:1 (auch in main) | STATUS §1.5 [GEPRÜFT]; **in Paket 6 aus main übernommen** (siehe I) |
| Preiskorrekturen Mediencampus (14) und zwei Hochschulangebote (EVT262/264) | Übergabe §D1 [CHATGPT] |
| Termin-Logik-Erweiterungen (SOLD_OUT überspringen, Selbstlern-Projektion, «Buchbarkeit unbestätigt» bei laufenden Kursen ohne `sessions`) | Paket 5 geprüft: keine Wirkung auf den Kandidaten bzw. gehört zu §5 Punkt 3; nicht übernommen (Bericht Paket 5 §3) [GEPRÜFT] |

## E. Historische Prüfblöcke (abgeschlossen, Archiv)

| Block | Ergebnis | Beleg |
|---|---|---|
| Live-Abnahmen V26 (12.10.), V30 und V32 (13.10.) | je 11/11 Dateien hashgleich; V32 letzte belegte Abnahme vor Paket A | CP01 E [GELESEN] |
| V96-Hardening, V84-Struktur, QA09 V1–V16 (V17 «DO NOT IMPORT») | historisch abgeschlossen | Übergabe §D1 [CHATGPT] |
| EVT277/280/283/295 (Colab/Firecrawl 07.–08.11.) | Quellen gesichert, 0 Gold-Freigaben; kein Folgelauf ohne Freigabe (E027) | Übergabe §D1 [CHATGPT] |
| CFJM 2027: OFFER-CFJM-005 (01.–05.03.2027) und OFFER-CFJM-012 (26.–30.04. und 01.–05.11.2027) | Durchführungen positiv belegt; CHF 650 bei CFJM-005 pro Kurstag | Handoff §9.33 [GELESEN] |
| CAD-005 «InDesign – Base» | Termin 01.–02.12.2026 Lausanne, CHF 500 bestätigt; Termin war in PR10 bereits vorhanden, keine Datumskorrektur nötig | Handoff §9.34 [GELESEN] |

## F. In Paket 3 gebaut (09.11., Claude; nicht neu bauen, nur nach Owner-Entscheiden neu laufen lassen)

| Thema | Ergebnis | Beleg |
|---|---|---|
| Dreiwege-Merge-Skript `data.js` + `smart-search-data.js` | `claude-work/scripts/merge3.py`, Lauf `run_paket3.sh`, 41/41 Tests | `BERICHT_PAKET3_20261109.md` §1, §3 [GEPRÜFT] |
| Kontrollzahlen §4 | Reproduziert; beruhen auf PR10. Gegenüber main: 655/215 · 81/61 · 6 Konflikte · 18 Schutz-ID-Änderungen | Bericht §2 [GEPRÜFT] |
| main ↔ PR10 | 85 Angebote / 326 Sidecars als Vergleichsliste, nicht übernommen | Bericht §1 [GEPRÜFT] |
| Master 3'818 | `build_master_p3.py`, Herkunft je Feld, Vier-Felder-Modell, Objektklasse, Dedupe | Bericht §5 [GEPRÜFT] |
| Owner-Liste und Warteschlange | 799 Felder/142 Angebote; 860 Zeilen | Bericht §4, §1 [GEPRÜFT] |
| AT-Dispositionen 103 (76 OUT + 27 HOLD) | aus AT-Owner-Sheet `1mtLbV9e…` gelesen, als CSV abgelegt | `paket3/eingaben/` [GELESEN] |

## G. In Paket 4 entschieden und angewendet (09.11.; Commits 4157a0c, 0d07757, Textpräzisierungen 6dd901b auf `claude/datenharmonisierung`)

| Thema | Ergebnis | Beleg |
|---|---|---|
| Owner-Liste Paket 3 A–E | alle 799 Felder entschieden (E060–E064, E071) | `BERICHT_PAKET4_20261109.md` §1 [OWNER] |
| Grundsatzfragen F1–F6 | E065–E070 (u. a. F2: CH-Durchführungsort = CH-Zugang JA; F3/F4 nicht sichtbar) | Bericht Paket 4 §1 [OWNER] |
| Anwendung und Neulauf | `config/owner_entscheide.csv`, `merge3.py --owner`, Tests 51/51; Warteschlange 720, Beta JA 3'445 / NEIN 373 / offen 0 | Bericht Paket 4 §3, §4 [GEPRÜFT] |
| Bestätigungslauf auf 6dd901b | 51/51 PASS, Ausgaben inhaltlich identisch (E072) | Repo-Prüfung 09.11. [GEPRÜFT] |

## H. In Paket 5 gebaut (09.11., Claude; Commits 5222bf6, dde33a4, d6a0b82 auf `claude/datenharmonisierung`; Nachtrag vom Owner bestätigt, E073)

| Thema | Ergebnis | Beleg |
|---|---|---|
| App-Code `publicationStatus` HOLD und `sessions` (§5 Punkt 6) | `claude-work/paket5/website/app-v34.js` = `app-v33.js` + Port der main-Commits f420299, 9efdea9, 3b3cbfb; erzeugt mit `paket5/scripts/port_app_v34.py` (+22/−6 Zeilen) | `BERICHT_PAKET5_20261109.md` §1, §2 [GEPRÜFT] |
| Tests | `paket5/tests/test_app_v34.js` (jsdom), 24/24 an den Stichtagen 09.11. und 01.12.2026; Regression mit Live-Daten identisch (1'097) | Bericht Paket 5 §4 [GEPRÜFT] |
| Wirkung auf Kandidat 09.11. | 1'094 statt 1'098 sichtbar (−36 HOLD, +32 dank künftigem Termin); deckungsgleich mit `beta_sichtbar` im Master | Bericht Paket 5 §5 [GEPRÜFT] |
| Bewusst nicht übernommen | main 89b9a1a (in Paket 6 übernommen, siehe I); PR10-Erweiterungen (siehe D) | Bericht Paket 5 §1, §3 [GEPRÜFT] |

## I. In Paket 6 gebaut (09.11., Claude; Commit aa410bf auf `claude/datenharmonisierung`; Nachtrag vom Owner bestätigt, E073)

| Thema | Ergebnis | Beleg |
|---|---|---|
| §5 Punkt 3 vergangene Termine (E014) | main 89b9a1a in `paket6/website/app-v35.js`; Live-Daten: von 151 Angeboten 89 ausgeblendet, 62 «Bereits begonnen»; Kandidat: 23 ausgeblendet, alle im Master VERGANGEN | `BERICHT_PAKET6_20261109.md` §2, §3 [GEPRÜFT] |
| §5 Punkt 2 Standardsortierung «Zuletzt geprüft» (E020) | PR10 10c5943 in `app-v35.js`, `paket6/website/index.html`, `methodik.html` | Bericht Paket 6 §2 [GEPRÜFT] |
| §5 Punkt 1 CHF/EUR/USD 1:1 mit Hinweis (E037) | main df18860, 119ca6e, e651956 in `app-v35.js`; Live-Regel MS-41 dadurch wirkungslos, MS-46 bleibt; 111 Live-Angebote mit EUR-Preis neu vergleichbar | Bericht Paket 6 §2, §3 [GEPRÜFT] |
| Tests | `paket6/tests/test_app_v35.js`, 35/35 am 09.11. und 01.12.2026; Port-Skripte reproduzieren alle drei Dateien byte-identisch | Bericht Paket 6 §4 [GEPRÜFT] |
| Owner-Fragen Paket 6 | Wortlaut E037 = main-Text (E079); Restbetrag in Budgetwährung (E080) | Bericht Paket 6 §6, Owner 09.11. [OWNER] |

## J. Vorlage Testkriterien Beta und Messung (09.11., Claude; vom Owner entschieden, E074–E080)

| Thema | Ergebnis | Beleg |
|---|---|---|
| Vorlage E040/E056 | `VORLAGE_TESTKRITERIEN_MESSUNG_20261109.md`: Stufenmodell, Kriterien D/F/S/B/T/R, Testfragen T01–T20, Abnahme 20 Min., Messoptionen A–D mit Quellen; entschieden: DE/USA und Messung später, Beta-Muss D7/F5/F6, Schwellen T1/T5, T13–T20, keine Testumgebung bei Infomaniak, Währungshinweis main, Restbetrag in Budgetwährung. Recherche nicht neu machen, nur bei neuer Fassung des EDÖB-Leitfadens oder der Infomaniak-FAQ | Vorlage §6 [GELESEN] |

## K. In Paket 7 gebaut (10.11., Claude; Commit c013c5a auf `claude/datenharmonisierung`; Nachtrag, Bestätigung durch Owner ausstehend)

| Thema | Ergebnis | Beleg |
|---|---|---|
| F5 Preisspanne WDA-01 (E051) | `paket7/website/app-v36.js`: Obergrenze ≤ Budget = direkter Treffer bei unbedingtem, belegtem Gesamtpreis; Restbetrag ab Obergrenze; T02, T03 PASS | `BERICHT_PAKET7_20261110.md` §2, §4 [GEPRÜFT] |
| F6 «Kostenlos» WDA-03 (E052, E057) | gemeinsame Klassierung für Karte, Filter, Preisbänder, Smart-Suche; 31 KOSTENLOS-Angebote: 22 «Kostenlos», 7 «Kostenlos mit Bedingung: …», 2 «Preis unbestätigt»; PR10-Entwurf nicht übernommen | Bericht Paket 7 §2, §3 [GEPRÜFT] |
| D7 Länderanzeige (E043, E065, E066, E081, E082) | `paket7/website/data-p7.js` (Kandidat + Feld `laender` wörtlich aus dem Master), Karte Ort/Anbieterland/CH-Zugang, Filter «Durchführungsort»; `index.html`, `methodik.html` je 3 Zeilen | Bericht Paket 7 §2, §3 [GEPRÜFT] |
| Tests | `paket7/tests/test_app_v36.js`, 41/41 am 09.11. und 01.12.2026; Paket 5 24/24, Paket 6 35/35; 3 Manipulationsproben erkannt; alle vier Dateien byte-identisch reproduzierbar | Bericht Paket 7 §4 [GEPRÜFT] |
