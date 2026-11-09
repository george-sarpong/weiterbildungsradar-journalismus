# ERLEDIGT mediaskills.ch – nicht wieder öffnen (Fassung 1, 09.11.2026)

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
| – | Dreiwege-Merge-Analyse `data.js` (764/77/10 Felder) und Live-Snapshot mit Prüfsummen | STATUS §2 [GEPRÜFT] |
| – | Recherchen R1 (schema.org, Indexierung), R2 (Preisdarstellung, Budget), R3 (Webstandards CH) | `claude/RECHERCHEN_20261109.md` – vor Umsetzung Primärquelle erneut prüfen |

## D. In PR10 bereits umgesetzt – nicht neu entwickeln, sondern im Merge übernehmen oder verwerfen

Nicht live. PR10 ist Quellenmaterial (E033). Über die Übernahme entscheidet der Dreiwege-Merge (E035).

| Funktion | Beleg |
|---|---|
| CSS-Korrekturen MS48–MS58 inkl. Footer-Umbruch, lesbare Validierungsfarbe | CP01 CP-01D/E [GELESEN] |
| Smart-Suche: 3 direkte + 3 getrennt klassierte Alternativen, «Weitere Kurse anzeigen» in 3er-Schritten, Fokusführung | CP01 CP-01F/G [GELESEN] |
| Klassische Suche: Eingabe-Bündelung 180 ms | CP01 CP-01I [GELESEN] |
| Katalog: 30 Karten, «Weitere 30 Angebote anzeigen» | CP01 CP-01J [GELESEN] |
| Standardsortierung «Zuletzt geprüft», Methodik-Text ohne «redaktionelle Auswahl» (E020) | CP01 CP-01K [GELESEN] |
| CI-Rauchtests (lokal Chromium; gehostete Tests übersprungen) | CP01 CP-01H [GELESEN] |
| WDA-03 Gratis-Trennung (Bezeichnungen gemäss E057 anpassen) und WDA-05 Preiskarten-Schutz (nur Code-Entwurf) | Handoff §3.5, §9.5 B1-D03 [GELESEN] |
| Hinweistext Währung 1:1 (auch in main) | STATUS §1.5 [GEPRÜFT] |
| Preiskorrekturen Mediencampus (14) und zwei Hochschulangebote (EVT262/264) | Übergabe §D1 [CHATGPT] |

## E. Historische Prüfblöcke (abgeschlossen, Archiv)

| Block | Ergebnis | Beleg |
|---|---|---|
| Live-Abnahmen V26 (12.10.), V30 und V32 (13.10.) | je 11/11 Dateien hashgleich; V32 letzte belegte Abnahme vor Paket A | CP01 E [GELESEN] |
| V96-Hardening, V84-Struktur, QA09 V1–V16 (V17 «DO NOT IMPORT») | historisch abgeschlossen | Übergabe §D1 [CHATGPT] |
| EVT277/280/283/295 (Colab/Firecrawl 07.–08.11.) | Quellen gesichert, 0 Gold-Freigaben; kein Folgelauf ohne Freigabe (E027) | Übergabe §D1 [CHATGPT] |
| CFJM 2027: OFFER-CFJM-005 (01.–05.03.2027) und OFFER-CFJM-012 (26.–30.04. und 01.–05.11.2027) | Durchführungen positiv belegt; CHF 650 bei CFJM-005 pro Kurstag | Handoff §9.33 [GELESEN] |
| CAD-005 «InDesign – Base» | Termin 01.–02.12.2026 Lausanne, CHF 500 bestätigt; Termin war in PR10 bereits vorhanden, keine Datumskorrektur nötig | Handoff §9.34 [GELESEN] |
