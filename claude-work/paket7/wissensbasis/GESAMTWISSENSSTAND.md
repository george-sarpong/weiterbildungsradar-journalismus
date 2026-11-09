# GESAMTWISSENSSTAND mediaskills.ch – Fassung 1 + Nachträge Paket 3 bis 7, Stand 10.11.2026

Status: **Vom Owner abgenommen 09.11.2026 (E049). Nachträge Paket 3 (§3, §4, §5 Punkt 6, §6, §9, §10) und Paket 4 (Owner-Entscheide E060–E071: §2 CH-Zugang, §3, §5 Punkt 4, §9, §10) vom Owner bestätigt 09.11.2026, mit Präzisierungen in §3, §5 Punkt 6 und §9 (E072). Nachträge Paket 5 (§4, §5 Punkt 6, §9, §10) und Paket 6 (§4, §5 Punkte 1–3, §9, §10) vom Owner bestätigt 09.11.2026 (E073).** Nachtrag Paket 7 (§2, §4, §5, §6, §7, §9, §10; Owner-Entscheide E081, E082) vom 10.11.2026: **Bestätigung durch den Owner ausstehend** (§10 Punkt 7). Dieses Dokument ersetzt `claude/STATUS_20261109.md` als Einstieg für jeden neuen Chat.
Lesereihenfolge: dieses Dokument → `ENTSCHEIDUNGSREGISTER.csv` → `ERLEDIGT.md` → `VORLAGE_TESTKRITERIEN_MESSUNG_20261109.md` → `BERICHT_PAKET7_20261110.md` → bei Bedarf `BERICHT_PAKET6_20261109.md`, `BERICHT_PAKET5_20261109.md`, `BERICHT_PAKET4_20261109.md`, `BERICHT_PAKET3_20261109.md`, `QUELLENVERZEICHNIS.md`, `WIDERSPRUECHE.md`.
Vorrang: jüngster datierter Owner-Entscheid im Register. Alles ältere Material (Projektbibel, Control Plane, MS_S00, Claim-Register, Handoff Phase A, CP01, ChatGPT-Übergabe) ist **Archiv**: Beleg, kein Auftrag.
Beleg: [OWNER] · [GEPRÜFT] von Claude gezählt/gerechnet · [GELESEN] Original gelesen · [CHATGPT] nur Übergabe · [NOTIZ] frühere Claude-Chats, Original nicht gelesen. E… = Register-ID.

## 1. Projekt in Kürze

mediaskills.ch ist ein nicht-kommerzieller Weiterbildungsradar für Schweizer Medienschaffende. Betreiber und einziger Entscheider: George Sarpong. Claude baut, testet und harmonisiert Daten und Wissen; ChatGPT gibt nur Zweitmeinungen; George entscheidet und lädt auf Infomaniak hoch (E033). Ablauf: Daten harmonisieren → Website überarbeiten → Beta → BOSW (E034, E046).

## 2. Geltende Leitentscheide (Kurzfassung)

**Rollen und Ablauf**
- Zuerst Wissen und Daten harmonisieren: eine Master-Tabelle, maschinell abgeglichen, Lücken in die Nachrecherche-Warteschlange (E034).
- Basis ist der Live-Stand; GitHub wird per Dreiwege-Merge als «Best of» eingebracht; Owner entscheidet nur echte Konflikte und geschützte IDs (E035).
- GitHub nur auf `claude/datenharmonisierung` (E041). Beta live erst nach Tests und rund 20 Minuten Owner-Abnahme (E040). Kostenpflichtige Läufe nur mit Freigabe (E027, E047).

**Scope**
- Länder CH, DE, AT, LI, USA; FR/IT/UK/ES nur zur Deduplizierung (E003). Schweizer Website, DE/US-Kurse nur unter dem Aspekt Teilnahme aus der Schweiz (E046).
- Journalismus inkl. übertragbarer Praxis-Skills; reines PR/Marketing, fiktional-spezialisierte Gewerke und Herstellerschulungen OUT (E004, E005). Katalog ist kuratiert, keine Vollständigkeitsbehauptung (E006).
- Beta zeigt die vorhandenen Daten CH/AT/LI, fehlende Felder als «nicht erfasst» (E036); DE/USA später (E074); OUT/HOLD-Zeilen nicht sichtbar (E042, E063, E071); DE/USA mit R4-Vermerk archiviert/abgelaufen und ohne eindeutige URL nicht sichtbar (E067, E068).

**Datenregeln**
- Objektklassen trennen (Anbieter, Stable Offer, Durchführung, Programm, Event, Service) (E029); Sammelobjekte vorerst als Programm (E069). Nichts erfinden, Unbekanntes sichtbar, Herkunft je Feld, keine stillen Überschreibungen (E031, E047).
- Länder: vier Felder `release_markt`, `anbieter_land`, `durchfuehrungsort` (+ Sicherheitsgrad), `ch_zugang`, ISO-3166-1 (E043). Anbieterland nur mit Beleg (E065). CH-Zugang nie aus Anbieterland; genannter CH-Durchführungsort gilt als Zugangsbeleg (E030, E036, E066). Anzeige: Filter nach Durchführungsort, Karte mit Ort, Anbieterland und CH-Zugang getrennt, Anbieterland ohne Beleg «nicht erfasst» (E081, E082).
- Vergangene Durchführungen behalten, nicht als bevorstehend zeigen; Angebote ohne aktuelle Kurse archivieren (E014, E015). ORSYS «Lausanne und Genf» genügt (E013).
- Anbieterbeschreibungen als gekennzeichnetes Snippet mit Quellenlink (E038).

**Preis und Suche**
- CHF/EUR/USD 1:1 als Rechengrundlage, Originalwährung zeigen, Hinweis im main-Wortlaut (E037, E079); Restbetrag bei Fremdwährung in Budgetwährung mit 1:1-Hinweis (E080); GBP nicht nominal (E009).
- Budget rechnet nur mit Kursgebühren inkl. Pflichtgebühren (E054). Direkter Budgettreffer nur bei vollem unbedingtem Preis; Tarife (Mitglied, Journalist:in, Freie) sichtbar und als bedingt markiert; unbekannter Preis nie als Treffer (E010, E039).
- Preisspanne: Obergrenze ≤ Budget = direkter Treffer, Untergrenze ≤ Budget < Obergrenze = möglich (E051). Trefferklasse «knapp über Budget» bis 15 % (E053). «Kostenlos» / «Kostenlos mit Bedingung: …» / «Preis unbestätigt» (E052, E057). Merkliste mit Summe und Restbudget nur aus bestätigten Preisen (E059).
- Bei Budgetsuche 2–3 begründete Alternativen, kein Ranking, keine «Top-Empfehlung» (E039). Keine redaktionelle Rangfolge, Standardsortierung «Zuletzt geprüft» (E020).
- Kursform/Preis nur bei nachweislich gleicher Variante bzw. Durchführung; bestätigte Kursform nur bei Evidenz VERIFIED (E011).
- Dauer wie Preis: belegt passend = Treffer, unbekannt = eigene sichtbare Gruppe, länger = Alternative; kein Hartfilter (E021, E058).
- Smart-Suche im Browser, kein Speichern des Eingabetexts, kein ausgehendes Tracking (E012). Datenschutz hat Vorrang; Messung nur gemäss Schweizer Datenschutzrecht (E056); in der Beta keine Messung, später (E075).

## 3. Datenbestand (Zähleinheiten nie vermischen)

| Bestand | Zahl | Einheit | Beleg |
|---|---|---|---|
| Live-Website `data-a1-86ff68ddc9ac.js` | 1'352 | Angebote (CH 1'223 + AT 124 + LI 5) | QV #12 [GEPRÜFT] |
| davon live sichtbar am 09.11. | 1'097 | Angebote (Ausblendung nur nach Enddatum) | STATUS §2 [GEPRÜFT] |
| Gesamtbrücke Target5 | 3'818 | market+id (1'352 + DE 111 + USA 2'355) | QV §3 [GEPRÜFT] |
| DE in R4 | 111 | Publikationszeilen (100 + 8 + 3) | QV #7 [GEZÄHLT] |
| USA in R4 | 2'355 | Publikationszeilen (2'290 + 58 Knight + 5 + 2) | W2 [GEPRÜFT] |
| Schutz-IDs | 307 | IDs (191 Archiv + 116 QA09); im Master nur ja/nein, Aufteilung für 29 IDs bekannt (ZIP V4.1 fehlt) | STATUS §2, Bericht Paket 3 §8 [GEPRÜFT] |
| Ausserhalb Master 3'818, nicht in Beta (→ Nachrecherche) | 326 = AT 103, LI 3, CH 220 | Zeilen; OUT/HOLD bzw. R4 ohne R43; **nicht** Teil der 373 «nicht sichtbar»; alle in Warteschlange | W9 [OWNER], Paket 3, Repo-Prüfung 09.11. (E072) [GEPRÜFT] |
| Master nach Paket 4 | 3'818 | market+id; Beta sichtbar JA 3'445 · NEIN 373 · offen 0; ch_zugang JA 727 | Bericht Paket 4 §4 [GEPRÜFT] |
| Owner-Fälle Paket 3 | 799 | Felder, alle entschieden (E060–E064, E071) | Bericht Paket 4 §1 [OWNER] |
| Nachrecherche-Warteschlange | 720 | Zeilen (Prio 1: 1 · 2: 87 · 3: 632); davon 391 zu Master-Zeilen, 329 ausserhalb (326 oben + 3 Sonderzeilen FAM04-C07, FAM05-C04, WDA-04) | Bericht Paket 4 §4, Repo-Prüfung 09.11. (E072) [GEPRÜFT] |
| Freigegebene Feld-Writes / Gold | 0 / 0 | – | STATUS §2, Paket 4 [GEPRÜFT] |

Historische Zähler ohne operative Bedeutung: DE 317 (Research), USA 2'312/2'326 (Research), CH 641 (Foundation-Routen bzw. leere startDate), AT 227 (Owner-Zeilen) – siehe W2, W3, `ERLEDIGT.md` B.

## 4. Website-Stände

| Stand | Kennung | Rolle |
|---|---|---|
| Live (Infomaniak) | Paket A: `index.html`, `app-v33.js`, `data-a1-86ff68ddc9ac.js`, `smart-search-data-a1-a38a2a2b2391.js`, `styles-v24.css`; Snapshot `claude-work/live-snapshot-20261109/` | **Basis** (E035, E044) |
| GitHub main | 5f09e078 | Merge-Quelle |
| PR10 (Draft, nicht gemergt) | 82bb95f9 | nur Vergleichsliste, nicht weiterentwickeln (E033) |
| Arbeitszweig `claude/datenharmonisierung` | c013c5a | Merge-Kandidat Daten (`claude-work/paket3/out/`); Website-Kandidat `claude-work/paket7/website/` (`app-v36.js`, `data-p7.js`, `index.html`, `methodik.html`; baut auf `paket6/website/app-v35.js` auf); nicht live |

Dreiwege-Merge (Basis 86868e0, 11.10.) [GEPRÜFT, Paket 3]: **gegenüber main** 655 Felder/215 Angebote nur GitHub geändert · 81/61 nur live · 6 echte Konflikte · 18 Live-Änderungen an Schutz-IDs. Die früher hier genannten Werte 764/274 · 77/59 · 10 · 16 beruhen auf einem Vergleich mit PR10 (exakt reproduziert). `smart-search-data`: priceEligible live 996 / main 983 / PR10 757; Merge-Kandidat nach Paket 4: 983. Merge-Kandidat und Regeln: `BERICHT_PAKET3_20261109.md`, Anwendung der Owner-Entscheide: `BERICHT_PAKET4_20261109.md`, App-Code: `BERICHT_PAKET5_20261109.md`, `BERICHT_PAKET6_20261109.md` und `BERICHT_PAKET7_20261110.md`.
App-Code: `app-v33.js` beruht am ehesten auf main 347f634 (11.10.) plus Live-Änderungen; von den acht späteren main-App-Commits sind sieben in `app-v35.js` übernommen, offen bleibt c79eb56 («exkl. MWST» in Smart-Ergebnissen) [GEPRÜFT, Bericht Paket 6 §1]. `app-v36.js` = `app-v35.js` + Beta-Muss D7, F5, F6 (Paket 7); `data-p7.js` = Merge-Kandidat + Feld `laender` aus dem Master [GEPRÜFT, Bericht Paket 7 §2].
Was PR10 zusätzlich kann: `ERLEDIGT.md` Abschnitt D.

## 5. Bekannte Umsetzungslücken auf live (Entscheid besteht, live fehlt)

1. Hinweis «zum Tageskurs nachrechnen»; Fremdwährung gilt live als «Preis unbekannt» (E037) [GEPRÜFT]. **Stand Paket 6:** in `app-v35.js` CHF/EUR/USD 1:1 mit Hinweis (main df18860, 119ca6e, e651956); Wortlaut main bestätigt (E079), Restbetrag in Budgetwährung bestätigt (E080) [GEPRÜFT].
2. Erste Sortieroption live «Redaktionelle Auswahl» statt «Zuletzt geprüft» (E020) [GEPRÜFT, Snapshot]. **Stand Paket 6:** in `app-v35.js`, `index.html`, `methodik.html` umgesetzt (PR10 10c5943) [GEPRÜFT].
3. 151 sichtbare Angebote mit vergangenem Startdatum (E014) [GEPRÜFT]. **Stand Paket 6:** in `app-v35.js` umgesetzt (main 89b9a1a): live-Daten 89 ausgeblendet, 62 als «Bereits begonnen» beschriftet [GEPRÜFT].
4. 46 HOLD-Sperren aus main fehlen live (STATUS §2); alle 46 im Merge-Kandidaten übernommen (E063, E071) [GEPRÜFT].
5. Feld `country` mischt Markt, Sitz und Ort: 19 «Frankreich» (Ateliers), 2 «CH_ACCESS Chiasso» (MiTech), 22 DJA als «Schweiz» trotz Sitz Berlin (E043; Audit 28.10. WDA-02) [GELESEN]. **Stand Paket 7:** in `app-v36.js` mit `data-p7.js` umgesetzt: Karte zeigt Ort, Anbieterland, CH-Zugang getrennt aus dem Master, Filter «Durchführungsort» (E081, E082); `country` bleibt Rohwert im Datensatz, wird nicht mehr angezeigt [GEPRÜFT, Bericht Paket 7].
6. `app-v33.js` kennt `publicationStatus` nicht und wertet `sessions` kaum aus: HOLD-Sperren und Durchführungslisten wirken live erst mit angepasstem App-Code [GEPRÜFT, Paket 3]. Im Merge-Kandidaten betrifft das 46 Angebote mit `publicationStatus` HOLD und 41 mit `sessions`; bei 5 Angeboten ist `endDate` nach E061 leer (PCC-P03, PCC-P05, PCC-P28, V58-S1-07 mit `sessions`; PCC-P08 HOLD), dort wäre die Ausblendung nach Enddatum mit dem heutigen App-Code wirkungslos [GEPRÜFT, Bericht Paket 4 §5, Repo-Prüfung 09.11. (E072)]. **Stand Paket 5:** `app-v34.js` auf dem Arbeitszweig gebaut (Port der main-Commits f420299, 9efdea9, 3b3cbfb auf Live-Basis), Tests 24/24 an zwei Stichtagen; Kandidat am 09.11. 1'094 statt 1'098 sichtbar (−36 HOLD, +32 dank künftigem Termin) [GEPRÜFT, Bericht Paket 5].

Alle Punkte 1–3, 5 und 6 wirken live erst mit Release. Sichtbar am 09.11. mit `app-v35.js`: Live-Daten 1'008, Kandidat 1'071; mit `app-v36.js` Kandidat unverändert 1'071 (01.12.: 948) [GEPRÜFT, Bericht Paket 6 §5, Bericht Paket 7 §3].
Website-Kandidat und Methodik umfassen CH/AT/LI; DE/USA stehen nur im Master 3'818 und kommen später (E074) [GEPRÜFT aus Bericht Paket 6 §5, §6.6].
Für die Beta zusätzlich Muss (E074): §5 Punkt 5 Länderanzeige (E043), Preisspanne WDA-01 (E051), «Kostenlos»-Trennung WDA-03 (E052, E057). **Stand Paket 7:** alle drei in `app-v36.js` umgesetzt, Tests 41/41 an zwei Stichtagen, Paket 5 und 6 weiter grün [GEPRÜFT, Bericht Paket 7 §4].

## 6. Offene fachliche Befunde (keine Entscheide; alle Nachrecherche-Fälle stehen in der Warteschlange)

| ID | Befund | Stand | Beleg |
|---|---|---|---|
| WDA-01 | Budget mit Preisspanne: liegt die Obergrenze im Budget, wird trotzdem nur «möglich» gezeigt (z. B. OFFER-DJA-009, EUR 480–512 bei CHF 800); 18 Kandidaten | Regel entschieden (E051); **in `app-v36.js` umgesetzt** (Paket 7; 25 sichtbare Angebote mit Spanne, 18 mit Obergrenze ≤ 800); Frage MWST «UNSPECIFIED» §10 Punkt 8 | Audit 28.10. B [GELESEN], Bericht Paket 7 [GEPRÜFT] |
| WDA-03 | «Kostenlos» meint in Filter und Smart-Suche Verschiedenes (22 vs. 15 ohne Bedingung) | Trennung und Bezeichnungen entschieden (E052, E057); **in `app-v36.js` umgesetzt** (Paket 7; Filter «Kostenlos» am 09.11. 15 statt 23, «mit Bedingung» 6, «Preis unbestätigt» 2) | Audit 28.10. D [GELESEN], Bericht Paket 7 [GEPRÜFT] |
| WDA-04 | Online/On-Demand: 428 Angebote, nur 90 mit VERIFIED-Kursform (Audit); auf Merge-Stand 532/56 (andere Zählbasis) | Abdeckungslücke, kein Bug; Sammelzeile in Warteschlange | Audit 28.10. E [GELESEN], Paket 3 [GEPRÜFT] |
| WDA-05 | AT-PROD-OFFER-208 zeigt vergangene Gratis-Septembertermine als Preis | Warteschlange Prio 1; Karte zeigt mit `app-v36.js` «Preis unbestätigt» statt «Kostenlos» | Audit 28.10. F [GELESEN], Bericht Paket 7 [GEPRÜFT] |
| W3 | CH 641 Foundation-Bericht ungelesen | nur lesen, falls für Beta nötig | WIDERSPRUECHE |
| W8 | AT 227 Owner-Zeilen vs. 224 R4-Zeilen (3 Objekte) | 3 Objekte nur im AT-Owner-Sheet, in Warteschlange | WIDERSPRUECHE, Paket 3 [GEPRÜFT] |
| CAD-005 | Sidecar ohne Preisoptionen, Kursform UNKNOWN | Warteschlange | Handoff §9.34 [GELESEN] |
| Hold FAM04-C07 | CH-V47 NEWSROOM-Geschwisterzeile ohne Owner-Disposition; keine Angebots-ID in Live/R4 auffindbar | Warteschlange (E055) | Handoff §3.3 [GELESEN] |
| Hold FAM05-C04 | AT oe24: Anbieter-ID-Zuordnung unbewiesen; kein oe24-Datensatz in Live/R4 | Warteschlange (E055) | Handoff §3.3 [GELESEN] |
| Hold FAM14-C05 | CFJM 2027: -005 und -012 belegt; -013 und -015 ohne Editionsbeleg | Warteschlange für -013/-015 (E055) | Handoff §3.3, §9.33 [GELESEN] |
| c79eb56 | main zeigt in Smart-Ergebnissen «exkl. MWST» bei Nettopreisen ohne Satz; fehlt live, in keinem §5-Punkt | nicht übernommen | Bericht Paket 6 §6 [GEPRÜFT] |

## 7. Release- und Prüfmodell

Gilt: E040 (Tests + Owner-Abnahme) und Projektregel 7 (getestetes, versioniertes Paket mit Rollback). Die alten Stufen G0–G3/E0–E5 der Projektbibel sind Archiv; brauchbar bleibt die Unterscheidung «Metadaten gefunden / Original gelesen / Feld belegt / heutige Anbieterquelle / live geprüft» als Beleggrad je Feld. Testkriterien für die Beta: Vorlage `VORLAGE_TESTKRITERIEN_MESSUNG_20261109.md` (Stufenmodell, Kriterien D/F/S/B/T/R, Testfragen T01–T20, Abnahme 20 Min., Messung); Owner-Entscheide E074–E078 (u. a. keine Testumgebung bei Infomaniak, Vorprüfung lokal bzw. über GitHub). Stand Paket 7: D7, F5, F6 vorhanden; D4 im Website-Test abgedeckt; T02, T03, T06, T20 PASS (Bericht Paket 7 §4).

## 8. Archiv-Fundstellen (nur lesen, nicht fortschreiben)

Projektbibel Band 01 `1Thna9EVLMSrvmxor0mUA056kDzBI05_4J6IW89SuJGI`, Band 02 `1zOTSwhCC8-1IQDxI5HgwpPC__LAc2zGuDXFtM2Pj-Cs`, Band 03 `1b1Zx5sjZuqYrEQr6zy9xlxs0eW7R4iDOpEBFl8ZeXsw` · Claim-Register `1bBDP8Nm0uY5Sr1b7SiKfhV1kPhJEk8IkFWX-YMTYbh0` · Handoff Phase A `1xal-qeanjwiAds-C1l0azZ9X7XKJCGrHiZVEEE7cMuE` · Project Core CP01 `1sBd9_4o5FOk2hjrP7tDo2AyFVkOPo1WW0mw2GzWQgyg` · End-to-End-Audit `1mv4fmYveqPsBw849T5w_NbEq-22xubTxZwrltCWZiFE` · ChatGPT-Übergabe (Wissensbasis). Weitere IDs: `QUELLENVERZEICHNIS.md`.

## 9. Nächster Schritt

Paket 4 ist vollständig angewendet und getestet (`claude-work/paket3/`); alle 799 Owner-Fälle entschieden; auf 6dd901b 51/51 PASS [GEPRÜFT, E072]. Paket 5 (§5 Punkt 6: HOLD, `sessions`) gebaut und getestet (24/24), Commits 5222bf6, dde33a4, d6a0b82. Paket 6 (§5 Punkte 3, 2, 1) gebaut und getestet (35/35 an zwei Stichtagen, Paket 5 weiter 24/24), Commit aa410bf. Nachträge Paket 5 und 6 bestätigt (E073).
Vorlage Testkriterien Beta und Messung (E040, E056) am 09.11. geliefert und entschieden (E074–E080): `VORLAGE_TESTKRITERIEN_MESSUNG_20261109.md`.
Paket 7 (Beta-Muss E074: D7, F5, F6) am 10.11. gebaut und getestet (41/41 an zwei Stichtagen, Paket 5 und 6 weiter grün), Commit **c013c5a** = letzter Commit auf `claude/datenharmonisierung`; kein Merge nach `main` [GEPRÜFT, Bericht Paket 7].
Bis zur Beta offen (Owner wählt die Reihenfolge): Testsatz gemäss Vorlage vervollständigen (u. a. D2, D5, D8, F1 mit T01–T20, S1–S3, B1–B2, T2, T5, T6, R1–R5), Vorabprüfung im Browser (Stufe 2, u. a. Darstellung der drei Länder-Badges), Release-Paket (`index.html` auf `app-v36.js`, `data-p7.js` und Smart-Daten aus dem Kandidaten, Prüfsummen, Rollback) nur mit Freigabe (E040, Projektregel 7), Nachrecherche ohne kostenpflichtige Läufe (E034). Später: DE/USA (E074), E053/E058/E059, Messung (E075).

## 10. Offene Owner-Entscheide

Entschieden am 09.11.: E049–E059 (Paket-2-Chat), E060–E071 (Paket-4-Chat), E072 (Nachträge Paket 3 und 4 bestätigt), E073 (Nachträge Paket 5 und 6 bestätigt), E074–E080 (Vorlage O1–O5, Währungshinweis, Restbetrag). Am 10.11.: E081, E082 (Länderfilter nach Durchführungsort, Anbieterland «nicht erfasst»). Noch offen:
1. erledigt: in der Beta keine Messung, später (E075).
2. **Übergabe-ZIP V4.1** hier anhängen oder Teil-ZIPs einzeln in Drive (für 191/116-Aufteilung und V288-Provenienz).
3. erledigt (E073).
4. erledigt (E079).
5. erledigt (E080).
6. erledigt (E074–E078).
7. **Nachtrag Paket 7** in diesem Dokument (§2, §4, §5, §6, §7, §9, §10), in `ERLEDIGT.md` K und im Register (E043, E051, E052, E057 Bemerkungen; E081, E082) bestätigen.
8. **MWST «UNSPECIFIED» bei Preisspannen** (Bericht Paket 7 §5 Punkt 1): wie beim Einzelpreis (E010) als nicht offen werten, so umgesetzt? Alle 26 Spannen sind «UNSPECIFIED»; bei strengerer Lesart von E051 hätte F5 keine Wirkung.
