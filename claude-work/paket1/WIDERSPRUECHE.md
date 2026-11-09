# WIDERSPRUECHE mediaskills.ch – Entwurf 1, Stand 09.11.2026

Bezug: `claude/STATUS_20261109.md` Abschnitt 3 (W1–W5) plus neue Befunde aus Paket 1 (W6–W9). Belege: Kürzel #n verweisen auf QUELLENVERZEICHNIS.md.
Status: **GEKLÄRT** = mit Originalbeleg aufgelöst · **TEILWEISE** = Ursache belegt, Rest offen · **OFFEN**.

## W1 – Live lädt `app-v33.js`, laut ChatGPT gingen V33–V36 nie live → GEKLÄRT (Owner 09.11.: Live-Dateien massgeblich)

Belege:
- V32-Abnahme 13.10. 15:04 (#13): 11 Dateien, `index.html` SHA ba6d87…, Asset-Referenzen `data.js`, `smart-search-data.js`, `app-v32.js`, `styles-v24.css`.
- Live-Snapshot 09.11. (#12): 10 der 11 V32-Dateien sind hashgleich vorhanden. Nur `index.html` ist anders (08ab7e…). Zusätzlich liegen `app-v33.js`, `data-a1-86ff68ddc9ac.js`, `smart-search-data-a1-a38a2a2b2391.js`, `styles-v22.css`. Die neue `index.html` lädt nur noch `data-a1-…`, `smart-search-data-a1-…`, `app-v33.js`, `styles-v24.css`.
- QA09-V4-Bericht 15.10. (#14) nennt `data-a1-86ff68ddc9ac.js` die «exakt veröffentlichte Paket-A-Datenfassung».

Schluss: Nach V32 wurde zwischen 13.10. 15:04 und 15.10. ein «Paket A» live gestellt (neue `index.html` + drei neue Assets). Der Dateiname `app-v33.js` gehört zu Paket A, nicht zum Review-Strang V33–V36 (CSS-Bugfixes MS50–MS57). Die ChatGPT-Aussage «V33–V36 nie live» bezieht sich auf diesen Review-Strang und widerspricht dem Live-Befund nicht.
Offen: Kein Freigabe- oder Abnahmebericht für Paket A auf Drive gefunden. `data.js`, `smart-search-data.js`, `app-v32.js`, `styles-v22.css` liegen auf dem Server, werden aber nicht geladen (verwaiste Dateien).

## W2 – USA 2'326 vs. 2'290 → GEKLÄRT

Zählkette aus den Originalen (#8, #9, #7, #7a):

| Stand | Wert | Formel | Quelle |
|---|---|---|---|
| R176AQ 13.09. | 2'312 | Owner-Zähler vor Fresh-Red-Team | Blattname `US_GOLD_TERMINAL_R176AQ`, Wert laut R176BC-Kopf |
| R176CS 14.09. | 2'327 | 434 + 1'935 − 42 | `UNION_2326` (#9) |
| **R176CV/DB 14.09.** | **2'326** | 434 logisch + 1'934 aktiv physisch − 42 Überschneidung | `UNION_2326`, R176DE «FINAL_RESEARCH_AUDIT_AUTHORITY» |
| R177E 15.09. | 2'346 | 454 + 1'934 − 42 (Knight-Reparatur: +20 logisch) | `US_RELEASE1_EX_KNIGHT_R177F` |
| **Release 1, 15.09.** | **2'290** | (454 − 56 Knight) + (1'934 − 42) = 398 + 1'892 | R177F, R1-Manifest |
| R3 15.09. | 2'348 | 2'290 + 58 Knight | R177N |
| **R4 15.09.** | **2'355** | 2'290 + 58 Knight-On-Demand + 5 Kurse + 2 Webinare | R4-Manifest, Zeilen gezählt |

Schluss: 2'326 ist der Research-Zähler (Owner-Gold nach externem Red-Team), 2'290 die Publikationsmenge ohne Knight Center. Differenz 36 = Knight-Anbieterzeilen im logischen Teil (434 − 398). Target5 hält fest: «Do not use intermediate 2326/2346 counts as current publication total». Für die Website gilt R4 = 2'355.

## W3 – DE 317 vs. 111 und CH 641 vs. 1'223 → TEILWEISE

DE (#5, #6, #7): 317 ist ein historischer Research-Zähler («not recomputed in this release layer»). Die 111 R4-Zeilen setzen sich zusammen aus 100 `V112_ADJUDICATED` + 8 `DE_CURRENT_REACQ` + 3 `DE_FINAL_POSITIVE` (= die 3 IN-Entscheide vom 04.09.). Ein Zeilen-Crosswalk 317 → 111 ist nicht möglich: Das DE-Dokument hält fest, dass die historische Zeilenschicht (A49–A54, 252→305) nicht rekonstruierbar ist, und erklärt sie zur «RETIRED_LINEAGE_GAP / HISTORICAL_ONLY».
CH (#2a): 1'223 = CH-Release-Angebote R43. Die Zahl 641 kommt im R43-QA-Blatt als Anzahl **leerer startDate-Felder** vor; die gleichlautende Zahl «641 Foundation-Routen» (Bericht 02.09., Drive 1wsHAyFejslTHmBnW_c2bRiaxUlfiigXF) wurde in Paket 1 nicht geöffnet. Verschiedene Einheiten, keine Teilmenge.
Offen: CH-641-Foundation-Bericht in Paket 2 lesen, nur falls die Foundation-Routen für die Beta gebraucht werden.

## W4 – «Master V120» nicht auffindbar → GEKLÄRT (als Label)

Drive-Titelsuche «V120»: 0 Treffer. «V120» erscheint nur als Statuszeile in Kontrolldokumenten, z. B. DE-Dokument 03.09.: «V96 / V120 = UNCHANGED». Nachfolger für die Website sind CH R43, AT R3, LI R1 (30.09.) und R4 (15.09.). V120 ist damit kein Datenbestand, der in die Harmonisierung einfliesst.

## W5 – 13 IDs fehlen im Suchindex → GEKLÄRT

Alle 13 fehlenden IDs (OFFER-MAZ-145, OFFER-FHNW-010, OFFER-DIGICOMP-055, OFFER-IBAW-013, OFFER-NOBLE-034, OFFER-SBVV-011, OFFER-FOTOMUSEUM-001, OFFER-ZB-002, CH-CLEAN2-V12-D01, V78-01, PCC-P26, PCC-P39, CAD-003) haben ein endDate zwischen 12.09. und 29.09.2026. Der Index ist ein Snapshot vom 30.09. (`"snapshot":"2026-09-30"`, `rowCount 1339`). Target5 `MVP_RELEASE_20260930` belegt dasselbe: «13 elapsed CH rows suppressed by exact ISO endDate logic». Kein Datenfehler; der Index wird beim Merge ohnehin neu erzeugt.

## W6 – AT-Dateiname stimmt nicht mit Target5 überein → GEKLÄRT

Target5 nennt «SFJ_AT_R3_FINAL_DATA_GOLD_124_20260930 / … R3 overlay/control 1mtLbV9ec…». Die Datei mit dieser ID heisst tatsächlich `SFJ_AT_SCOPE_R1_20260930` und enthält die R3-Blätter (`AT_R3_FINAL_GATE` usw.). Laut Target5 gibt es kein einzelnes Drive-Blatt mit den 124 Zeilen: «Drive canonical is parent+overlay because raw XLSX import was unavailable». Die 124 AT-Zeilen in `data.js` sind vollständig in R4-AT enthalten (Crosswalk 124/124).

## W7 – Feld `country` mischt Markt, Anbieterland und Ort → TEILWEISE (Regel besteht, Umsetzung offen)

Befund: In `data.js` tragen 19 CH-Release-Angebote von «Ateliers de l’image et du son» (CH-V33-A01 bis A19, region «Suisse romande / Ort nach Vereinbarung») «Frankreich» und 2 Angebote von MiTech (V79-01/02, region «ONLINE») den Freitext «CH_ACCESS / operational presence Chiasso». Die Website filtert über `countryDisplay()` nach diesem Feld.

Frühere Klärung mit ChatGPT (Bibel Band 01 und 02, Drive 1Thna9EVLMSrvmxor0mUA056kDzBI05_4J6IW89SuJGI und 1zOTSwhCC8-1IQDxI5HgwpPC__LAc2zGuDXFtM2Pj-Cs, gelesen 09.11.):
- Regel: «Ort der Durchführung, nicht Firmensitz»; «Orte sind tatsächliche Veranstaltungsorte und nicht Firmensitz. Ortsunsicherheit muss ehrlich angezeigt werden.»
- Owner-Fallentscheid 18.10.: ORSYS Lausanne und Genf als bewusst ungefähre Durchführungsort-Angabe (59 Angebote).
- Befund 28.10. (B1-D02): 22 DJA-Angebote haben country «Schweiz», Anbieterbasis ist Berlin. Vorschlag damals: «provider_country=DE, CH_ACCESS und delivery_location separat mappen, keine Duplikatangebote in DE erzeugen» – nicht umgesetzt.
- Ausdrücklich offen gelassen: «Die anderen 19 CH-Rows mit Rohland Frankreich/2 Chiasso separat konkret entscheiden.»

Daraus folgt für den Master (Vorschlag, Paket 2): vier getrennte Felder statt `country`, Länder als ISO-3166-1-Code (CH, LI, AT, DE, FR, IT, US):
1. `release_markt` – unter welchem Länderbestand das Angebot geführt wird (CH/LI/AT/DE/US).
2. `anbieter_land` – Sitz des Anbieters laut Impressum.
3. `durchfuehrungsort` – tatsächlicher Kursort(e) bzw. «online», mit Sicherheitsgrad (belegt / ungefähr / unbekannt).
4. `ch_zugang` – Teilnahme aus der Schweiz möglich (belegt / unbekannt), nie geraten.
Anbieterland der Ateliers (19) und MiTech (2) ist noch nicht belegt und kommt in die Nachrecherche-Warteschlange.

## W8 – AT 227 Owner-Zeilen vs. 224 R4-Zeilen → OFFEN (neu, klein)

227 = 124 + 76 OUT + 27 HOLD (30.09.). R4 (15.09.) enthält 224 AT-Zeilen, davon 124 auf der Website, 100 nicht. 103 OUT/HOLD stehen 100 Nicht-Website-Zeilen gegenüber: Drei AT-Objekte sind zwischen 15.09. und 30.09. hinzugekommen oder anders gezählt. Klärung im Paket 2 über die physische Parent-Tabelle R2 (1Vg42tEtZXhqcPdVJsBbYO4GEJmoeCUcK).

## W9 – «Alle vorhandenen Daten in die Beta» vs. dokumentierte OUT/HOLD-Zeilen → OWNER-ENTSCHEID

Owner-Entscheid 4 (09.11.) verlangt alle vorhandenen Daten in der Beta. Die Quellen enthalten aber auch bewusst ausgeschlossene Zeilen: AT 76 OUT + 27 HOLD, LI 1 OUT + 1 HOLD + 1 abgelaufen, CH 220 R4-Zeilen nicht in R43 (u. a. 133 Scope-Ausschlüsse vom 30.09.).

**Owner-Entscheid 09.11. (Nachtrag):** Diese Zeilen kommen in die Nachrecherche-Warteschlange und sind in der Beta nicht sichtbar. → GEKLÄRT.

## Owner-Entscheide 09.11. zu Paket 1 (Nachtrag)
- W1: Die Live-Dateien (Paket A: `index.html`, `app-v33.js`, `data-a1-86ff68ddc9ac.js`, `smart-search-data-a1-a38a2a2b2391.js`, `styles-v24.css`) sind massgeblich. Fehlender Paket-A-Freigabebericht ist damit kein Blocker.
- W9: OUT- und HOLD-Zeilen → Nachrecherche-Warteschlange, nicht sichtbar.
- W7: Owner verweist auf die frühere Klärung mit ChatGPT und auf Ländercodes; Vier-Felder-Vorschlag oben zur Bestätigung offen.
- W4 (V120 schliessen): noch keine Antwort.

---

Rechenidentitäten und Zählungen: QUELLENVERZEICHNIS.md Abschnitt 3. Nichts davon ist auf GitHub `main`, PR10 oder Infomaniak geschrieben worden.
