# QUELLENVERZEICHNIS mediaskills.ch – Paket 1, Stand 09.11.2026

Zweck: Je Datenbestand Datei-ID, Stand, Zeilenzahl und Zähleinheit, direkt aus den Originalen erhoben. Gilt neben `claude/STATUS_20261109.md`, bis GESAMTWISSENSSTAND.md existiert. Die ChatGPT-Übergabe wurde nur zur Gegenprobe benutzt.

Prüfart:
- **[GEZÄHLT]** = von Claude am 09.11.2026 zeilenweise ausgezählt (Skript, nicht Kontrollblatt).
- **[GELESEN]** = Kontroll- oder Summenwert im Original gelesen, nicht nachgezählt.
- **[HASH]** = Bytes heruntergeladen, Grösse und SHA-256 gegen dokumentierten Wert geprüft.
- **[META]** = nur Drive-Metadaten (Titel, Typ, Datum).

Alle Drive-Dateien gehören sarpong.george@googlemail.com; Claude hat nur Lesezugriff (canEdit = false).

## 1. Priorität-1-Bestände (Länder-Releases und Research-Basen)

| # | Bestand (Drive-Titel) | Drive-ID | Typ | Stand | massgebliches Blatt | Zeilen | Zähleinheit | Rolle | Prüfart |
|---|---|---|---|---|---|---|---|---|---|
| 1 | SFJ_TARGET5_PARALLEL_CONTROL_V1_20260928 | 19Jx2KOsSip7BQwF3M-xUeBTp0YRtU5xSncbS6XQS0I8 | Google Sheet, 5 Blätter | 28.–30.09. | `TARGET5_CONTROL`, `MVP_RELEASE_20260930` | 5 Länderzeilen | Länder-Autorität je Land | Steuerblatt (Archiv). Release `MEDIASKILLS_MVP_CH_AT_LI_20260930` = CH R43 1'223 + AT R3 124 + LI R1 5 = **1'352**; am 30.09. **1'339 sichtbar**, 13 abgelaufene CH-Zeilen ausgeblendet | [GELESEN] |
| 2 | SFJ_CH_GOLD_SUCCESSOR_V114_SCOPE_DRIFT_REMEDIATION_R38_20260930 | 1myP-DOYm0ORVkoeMsAyNy0AFrPa4EHuUTRcKpjyB_ao | Google Sheet, rund 330 Blätter (R15–R43, V92–V114) | 30.09. | `V114_CH_RELEASE_CANDIDATE_R43_1223` (22 Spalten) | **1'223** | CH-Release-Angebote (Stable Offer, 22 Website-Felder) | CH-Release-Autorität 30.09.; ältere Kandidaten-Blätter (R15…R42) sind Vorgänger. Blatt 1'224 Zeilen inkl. Kopf; Website-CH (data.js) ebenfalls 1'223 | [GELESEN] Blattgrösse + QA, Website-Seite [GEZÄHLT] |
| 2a | dto., QA-Blatt | dto. | | 30.09. | `V114_CH_R43_PUBLICATION_QA_R1` | – | Kontrollwerte | 1'223 URLs gültig; **641 leere startDate**, 768 leere endDate (erlaubt); 1'210 sichtbar + 13 abgelaufen; 782 Zeilen brauchten App-Patch | [GELESEN] |
| 3 | **SFJ_AT_SCOPE_R1_20260930** (in Target5 als «SFJ_AT_R3_FINAL_DATA_GOLD_124_20260930» bezeichnet) | 1mtLbV9ec2520p4-VicTAzmOThztpyhRiLfYl0BMooL0 | Google Sheet, 15 Blätter | 30.09. | `AT_R3_FINAL_GATE` | 227 Owner-Zeilen | AT-Owner-Angebote | **227 = 124 sichtbar + 76 OUT + 27 kontrollierte HOLD**. Overlay/Kontrolle; physische Parent-Tabelle R2 = 1Vg42tEtZXhqcPdVJsBbYO4GEJmoeCUcK (146 Zeilen, nicht geöffnet) | [GELESEN] |
| 4 | SFJ_LI_WEBSITE_GOLD_RELEASE_SUCCESSOR_R1_20260930 | 1j7mAKaObeiuqrRUrzXhXBN6FGI3OVmk-6exusOUP0uQ | Google Sheet, 7 Blätter | 30.09. | `LI_SCOPE_ADJUDICATION_R1` | **8** | LI-Basisobjekte | 5 RETAIN (LI-REG-001/002/003/004/006), 1 SUPPRESS (005, Anlass 09.06.2026 vorbei), 1 OUT_SCOPE (007 Selfpublishing), 1 CONTROLLED_HOLD (008 Kunstschule) | [GEZÄHLT] |
| 5 | SFJ_DE_OWNER_RUN_STATE_POST_REDTEAM_REMEDIATION_2026-09-03 | 16HRJ0je04-2vpjj0QAnT2XR6QlrrHUt09ZmpWOffte4 | **Google Doc** (kein Sheet) | 03.09. | Abschnitte 1, 11, 13 | – | Zähler | `DE_BASELINE = 317` (historischer Research-Zähler, «not recomputed»), 8 geparkte Anbieterfamilien, 0 neue kanonische IDs | [GELESEN] |
| 6 | MEDIASKILLS_DE_OWNER_DATA_FREEZE_FINALIZED_2026-09-04.xlsx | 1ndAnLs8zAqIAIl4L85WZsrZwqVeRTofR | XLSX, 14'140 Byte | 04.09. | `Release_Decisions`, `Scope_Exclusions` | 7 Entscheide | DE-Produktentscheide | 3 IN (DE-RLS-001 WAVE, -002 Röpke, -003 WAM), 4 OUT (TH Köln ×2, DJV NRW, Zentrum Pop); Baseline 317 «UNCHANGED» | [GELESEN] |
| 7 | MEDIASKILLS_WAVE1_PUBLICATION_R4_KNIGHT_FULL_CURRENT_20260915 | 1s6nKTq56BCli70sr0Jsf-sn2pxVaaZ0EBjA9X9lCNQU | Google Sheet, 7 Blätter | 15.09. | `PUBLICATION_ROWS` (14 Spalten) | **3'811** | Publikationszeilen (country+record_id, alle eindeutig) | CH 1'014 · DE 111 · AT 224 · LI 8 · USA 2'355 · FR 72 · IT 27. Deckt sich mit `COUNTRY_COUNTS` | [GEZÄHLT] |
| 7a | dto. Vorgänger MEDIASKILLS_WAVE1_PUBLICATION_20260915 (R1) | 10A44fTR4_h_adCNzFtF5k0YYP6OOo3RjDG8M9p76BPo | Google Sheet | 15.09. | `RELEASE_MANIFEST` | 3'746 | Publikationszeilen | R1 ohne Knight; USA 2'290 aus `Q8_USA_RELEASE1_2290_EX_KNIGHT` | [GELESEN] |
| 8 | MEDIASKILLS_USA_OWNER_RESEARCH_2026-09-05 | 1dcGWBedZnGRZnNPEmFtkxQaraYqHFo9U5xdtTZmDnrQ | Google Sheet, **579 Blätter** | 05.–15.09. | `US_EXTERNAL_GOLD_FINAL_R176DE`, `US_RELEASE1_EX_KNIGHT_R177F`, `US_KNIGHT_OWNER_REAUDIT_R177N` | – | Owner-Zähler | Zählkette siehe WIDERSPRUECHE W2 | [GELESEN] |
| 9 | MEDIASKILLS_USA_CLAUDE_FRESH_RUN3_R176DB_COMPACT_20260914.xlsx | 1sybP0Wv8BbSNiH0D8BfLxGh92bVcaDhY | XLSX, 21 Blätter | 14.09. | `UNION_2326`, `PHYSICAL_LEDGER` | 4'904 Ledger-Zeilen | physische USA-Kandidaten (alle Zustände, nicht nur aktiv) | Owner 2'326 = 434 logisch + 1'934 aktiv physisch − 42 Überschneidung. **1'013'653 Byte, SHA-256 eb55acb7…14faea = Hash-Lock R176DC** | [HASH], [GEZÄHLT] |

## 2. Website-Stände (GitHub und Live)

| # | Bestand | Fundort | Stand | Zeilen | Zähleinheit | Prüfart |
|---|---|---|---|---|---|---|
| 10 | `data.js` GitHub main = Branch `claude/datenharmonisierung` | Repo george-sarpong/weiterbildungsradar-journalismus, main 5f09e078, Branch c2b56fe | 08.11. | **1'352** | Website-Angebote | [GEZÄHLT] |
| 11 | `search-index-v1.2.js` (main) | dto. | Snapshot 30.09., Version SEARCH_V1_2_20261001 | **1'339** | indexierte Angebote | [GEZÄHLT] |
| 12 | Live `data-a1-86ff68ddc9ac.js` (Infomaniak) | `claude-work/live-snapshot-20261109/` (aus website-data_20261109.zip, Drive 17kUbtVvyx8XIm1PNANnrwxj4cVXCbOMP) | geladen am 09.11. | **1'352** | Website-Angebote | [GEZÄHLT] |
| 13 | V32-Live-Abnahme MEDIASKILLS_V32_LIVE_DEPLOYMENT_FINAL_PASS_20261013.md | Drive 1T4l9XOd4OmqH-OS54GUzFaClRNagUnO3 | 13.10. 15:04 | 11 Dateien | Datei-Hashes | [GELESEN] |
| 14 | MediaSkills_QA09_V4_VERIFIKATIONSBERICHT_2026-10-15.md | Drive 13yLYfBcaq18kDsjnZqxH2wTCHv8XgpX1 | 15.10. | – | nennt `data-a1-86ff68ddc9ac.js` als «exakt veröffentlichte Paket-A-Datenfassung» | [META]+Ausschnitt |

## 3. Crosswalks (von Claude am 09.11. gerechnet)

| Vergleich | beide | nur links | nur rechts | Befund |
|---|---|---|---|---|
| R4 CH (1'014) ↔ Website CH (1'223) | 794 | 220 | 429 | verschiedene Schnitte: R4 = V95-Scope 14.09., Website = R43 30.09. (133 Scope-Ausschlüsse ggü. V113 dokumentiert) |
| R4 AT (224) ↔ Website AT (124) | 124 | 100 | 0 | Website-AT ist echte Teilmenge von R4 |
| R4 LI (8) ↔ Website LI (5) | 5 | 3 | 0 | genau die 5 RETAIN-Objekte |
| R4 DE (111) ↔ Website | 0 | 111 | – | DE nicht auf der Website |
| Website `data.js` (1'352) ↔ Suchindex (1'339) | 1'339 | 13 | 0 | alle 13 mit endDate 12.–29.09.2026, also vor Index-Snapshot 30.09. |

Rechenidentitäten (geprüft): 1'223 + 124 + 5 = 1'352 · 1'352 + 111 + 2'355 = 3'818 · 2'290 + 58 + 7 = 2'355 · 100 + 8 + 3 = 111 (DE).

## 4. Website-Feld `country` in `data.js` (Nebenbefund)

1'202 «Schweiz», 19 «Frankreich» (IDs CH-V33-A01 ff.), 2 «CH_ACCESS / operational presence Chiasso», 124 «Österreich», 5 «Liechtenstein». Das Feld mischt Release-Markt und Durchführungsort (siehe W7).

## 5. Gesucht, nicht gefunden

- Datei mit «V120» im Titel: Drive-Titelsuche 0 Treffer (siehe W4).
- Freigabe- oder Abnahmebericht für «Paket A» (app-v33.js, data-a1): Volltextsuche nach `app-v33.js` findet nur das Live-ZIP vom 09.11. (siehe W1).

## 5a. Noch nicht gelesen (Priorität 2 laut STATUS Abschnitt 4)

Auftrag Paket 1 umfasste nur Priorität 1. Ungelesen: Project Core CP01 (1sBd9_4o5FOk2hjrP7tDo2AyFVkOPo1WW0mw2GzWQgyg), End-to-End-Audit 28.10. (1mv4fmYveqPsBw849T5w_NbEq-22xubTxZwrltCWZiFE), Handoff Phase A (1xal-qeanjwiAds-C1l0azZ9X7XKJCGrHiZVEEE7cMuE), Claim-Register (1bBDP8Nm0uY5Sr1b7SiKfhV1kPhJEk8IkFWX-YMTYbh0). Aus Bibel Band 01/02 nur die Passagen zum Durchführungsort (W7) gelesen.

## 6. Reproduktion

Zeilenzählungen und Crosswalks: Skript `claude-work/paket1/paket1_crosswalk.py` (liest Sheets-Exporte und Repo-Dateien; Exporte nicht eingecheckt, weil per Google-Sheets-API jederzeit neu abrufbar).
