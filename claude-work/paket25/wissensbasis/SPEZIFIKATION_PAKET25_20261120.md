# SPEZIFIKATION PAKET 25 «Generator Master → Website», 20.11.2026

Status: **vom Owner freigegeben 20.11.2026**, Entscheide 1–5 je Variante A (Code je Feld, Spalte `lieferform_json` im Master, Master-Reihenfolge, kein Release, Zweitmeinung ChatGPT parallel). **Nachtrag 20.11. (§9):** U4 entschieden, Rollen nach E033 bestätigt. **Berichtigung 20.11. (§10):** 6 statt 5 Schlüsselvarianten, Sollliste der 7 Rohwerte. **Zweitmeinung ChatGPT eingearbeitet 21.11. (§11):** B01–B05, Entscheide 8 und 9. U1–U4 erledigt (U3 PASS 20.11. 18:01 UTC). **Gegenprüfung ChatGPT §11 eingearbeitet 21.11. (§12):** B06 mit Entscheid 10, B07, B08. Umgesetzt und getestet 21.11. (`BERICHT_PAKET25_20261121.md`). Eintrag ins Register mit dem Bericht Paket 25 (E192–E201).
Auftrag: Owner 20.11. («Spezifikation P25 «Generator Master → Website» mit Testliste, Umsetzung erst nach meiner Freigabe»). Grundlage: `ZIELBILD_UNTERBAU_20261120.md` §2 B2, §3 Punkt 4, §4 Zeile P25; `BERICHT_PAKET24_20261120.md` §1, §7 Punkt 4; GESAMTWISSENSSTAND §2 (Master), §6 P24-N, §9; E031, E047, E074, E113, E114, E152, E156, E169, E172.
Vorprüfung: Arbeitszweig `claude/datenharmonisierung`, Commit 111b0fd (E191), flach geklont 20.11.; nur gelesen, nichts geschrieben. Messskripte im Scratch, nicht im Repo.
Beleg: [GEPRÜFT] von Claude gezählt · [GELESEN] Original gelesen · [ZU BELEGEN] vor Umsetzung prüfen.
Ablage: gleichlautend im Projektwissen (`claude/SPEZIFIKATION_PAKET25_20261120.md`) und auf dem Arbeitszweig (`claude-work/paket25/wissensbasis/`, damit ChatGPT sie lesen kann). Berichtigt 21.11.: SHA-256 der Smart-Quelle in A1 vollständig (vorher verstümmelt).

## 0. Einordnung und Driftprüfung

- P25 macht den Master zur **einzigen Quelle** der Website-Daten: Ein Generator liest nur `master_3818_aktuell.csv` und schreibt Datendatei und Smart-Datei. Danach baut kein Daten-Build mehr auf einer Website-Datei auf (ZIELBILD §3 Punkt 4).
- Ziel: gleicher Inhalt wie live (`data-p19.js`, `smart-search-data-p19.js`), keine sichtbare Änderung.
- **Nicht Teil von P25:** Eingangsformat (P26); Anbieter- und Durchführungstabellen, Strukturfelder (P27); nur Sichtbares ausliefern (E172), ungenutzte Felder, Cache-Regel (E176) (alle P28); Datei je Land, Listenseiten (P29); Prüfliste (P30); App-Änderung; Recherche; kostenpflichtige Läufe (E027); Wortlaut KI-Offenlegung (E188).
- HTML-Seiten und App kommen weiter aus `paket22/website/` wie bei `build_p19.sh`. Das ist Code, keine Daten; Bereinigung mit P29.

## 1. Befund [GEPRÜFT, 20.11., Commit 111b0fd]

### 1.1 Datendatei `data-p19.js` (1'353 Angebote, 25 Felder + `laender`)

- Auswahl: Die Website enthält genau alle Master-Zeilen mit `release_markt` CH, AT, LI (1'224 + 124 + 5 = 1'353; Kohorten WEBSITE_1352 und NEU_P22). DE 111 und US 2'355 nicht (E074).
- Werte: Master = Website in 33'825 Feldwerten (Paket 24, T01), Platzhalter gleichgesetzt.
- **Platzhalter:** Der Master trägt «nicht erfasst», die Website je Feld einen Code:

| Website-Feld | Website-Wert, wo der Master «nicht erfasst» trägt | Fälle |
|---|---|---|
| `format` | NICHT_PUBLIZIERT | 200 |
| `level` | NICHT_PUBLIZIERT | 291 |
| `priceCategory` | PREIS_NICHT_PUBLIZIERT | 202 |
| `language` | NOT_PUBLISHED | 24 |
| `region` | NOT_PUBLISHED 8 · NICHT_PUBLIZIERT 1 | 9 |
| `duration` | NOT_PUBLISHED 22 · NICHT_PUBLIZIERT 5 | 27 |
| `priceDisplay` | NICHT_PUBLIZIERT 17 · NICHT_VERIFIZIERT_FUER_AKTUELLEN_KATALOGTERMIN 1 (AT-PROD-OFFER-173) | 18 |
| `startDate` / `endDate` | leer | 707 / 816 |
| `publicationStatus` / `publicationReason` / `sessions` | Feld fehlt | 1'302 / 1'347 / 1'311 |
| `laender` (5 Teilfelder) | «nicht erfasst» wörtlich wie im Master (chZugang 407, ortLand 317, anbieterLand 19) | – |

- **Die App braucht die Codes:** Die Filter Kursform, Niveau, Preisklasse und Sprache führen NICHT_PUBLIZIERT, PREIS_NICHT_PUBLIZIERT bzw. NOT_PUBLISHED als Filterwert (`app-v43.js` Z. 69–72, 1768); angezeigt werden alle als «keine Angabe» (Z. 33–62, 196). Ein leerer Wert statt Code würde die Filter ändern. Die Erwartung in GESAMTWISSENSSTAND §6 P24-N («mit dem Generator P25 entfallen die Codes in der Datendatei») geht deshalb nicht ohne App-Änderung → Entscheid 1.
- Gemischte Felder: Ein einheitlicher Code je Feld ändert 7 Rohwerte; die Anzeige bleibt «keine Angabe» (Test G09). Sollliste: `duration` bei CH-CLEAN2-V9-D01, CH-V18-F03, CH-V19-N01, PJ-V16-09, AT-PROD-OFFER-151 (NICHT_PUBLIZIERT → NOT_PUBLISHED); `region` bei V59-SZ05 (NICHT_PUBLIZIERT → NOT_PUBLISHED); `priceDisplay` bei AT-PROD-OFFER-173 (NICHT_VERIFIZIERT_FUER_AKTUELLEN_KATALOGTERMIN → NICHT_PUBLIZIERT).
- **Reihenfolge:** Master und Website ordnen anders (nur 6 von 1'353 Angeboten an gleicher Stelle). Die Standardsortierung bricht Gleichstand über die ID (Z. 537–540), «Nächster Start» und «Anbieter» über Anbieter + Titel; Anbieter + Titel sind bei allen 1'353 eindeutig. Die Kartenreihenfolge hängt also nicht von der Dateireihenfolge ab. Die Smart-Suche reiht nach Punktzahl, dann Titel (Z. 1576–1586); 11 Titel kommen bei zusammen 24 Angeboten mehrfach vor. Nur dort kann die Dateireihenfolge die Reihenfolge der Smart-Treffer ändern → Entscheid 3.
- Die Schlüsselreihenfolge innerhalb eines Datensatzes ist uneinheitlich (**6 Varianten**, berichtigt §10: Ende nach `release_origin` = `laender` 1'260 · `publicationStatus, laender` 45 · `sessions, laender` 41 · `laender, publicationStatus, publicationReason` 5 · `publicationReason, publicationStatus, laender` 1 · `laender, sessions` 1); für die App ohne Bedeutung.

### 1.2 Smart-Datei (offene Frage aus ZIELBILD §2 B2, jetzt geklärt)

| Smart-Feld | Master-Feld | Ergebnis |
|---|---|---|
| `parserStatus` | `preis_parser_status` | 0 Abweichungen |
| `priceEligible` | `preis_budgetfaehig` (True/False) | 0 Abweichungen |
| `priceOptions` | `preis_optionen` (JSON) | 0 Abweichungen (331 × «nicht erfasst» ↔ `[]`) |
| `delivery` (8 Teilfelder) | `lieferform` (= evidenceTier), `lieferform_struktur` (= structure) | **nur 2 von 8 Teilfeldern im Master**; es fehlen `channels`, `variants`, `scheduleSummary`, `temporalSummary`, `sourceText`, `materialisationStatus`. 562 Angebote haben eine nicht leere Lieferform, 791 den leeren Standard. `structure` bei 18 Angeboten leer (R11_FROZEN_UNLABELED) ↔ Master «nicht erfasst» |
| `meta` | – | feste Kennungen (version, priceParser, priceResolver, deliveryModel, r11Policy) + `rosterCount` 1'353 |

- `app-v43.js` liest aus `delivery`: `channels`, `variants` (attendanceChannels, temporalMode, scheduleMode, instructionFormats), `sourceText`, `evidenceTier`, `structure`. **Lücke L3:** Ohne Nachtrag kann der Generator die Smart-Datei nicht aus dem Master bauen → Entscheid 2.
- `delivery` ist seit `paket3/out/merge_kandidat_smart.json` unverändert (Vergleich mit Smart-p19: nur `priceOptions` bei 51 Angeboten geändert, E107/E109, plus 1 neues Angebot, E143).

### 1.3 Build heute [GELESEN]

`build_p19.sh` kopiert `paket22/website/`; `build_daten_p19.py` liest `data-p22.js` und `smart-search-data-p22.json` und entfernt `korrekturen`; `build_liste_p19.js` rendert Liste und Sitemap mit `app-v43.js` in jsdom; `build_release.py` ersetzt in `index.html` die Verweise `data-a1-…`, `smart-search-data-a1-…`, `app-v33.js` durch die aktuellen Dateinamen und baut die JavaScript-Hülle der Smart-Datei. `paket19/website/index.html` trägt darum noch die alten Verweise (Befund ChatGPT B03). Die Datenkette `data-p7.js` → … → `data-p19.js` ist die heutige Quelle (ZIELBILD §2 B2).

## 2. Soll

A1 **Master-Nachtrag Lieferform** (Entscheid 2 A): 2 neue Spalten am Ende (123 → 125): `lieferform_json` (ganzes `delivery`-Objekt als JSON, wie `durchfuehrungen`) und `h_lieferform_json`. Quelle: einmaliger, eingefrorener Auszug `paket25/eingang/lieferform_p19.json` aus `paket19/out/smart-search-data-p19.json` (SHA-256 der Quelle 7ddd326a26cbaaebcf4a9382c3e97d0f6399e6022d9d93f7ef2c21b377b2a35c, wie `test_paket24.py` SMART; nur `delivery`, 1'353 IDs; SHA-256 des Auszugs im Test festgehalten). `master_nachtraege.py` bricht ab, wenn im Auszug eine CH/AT/LI-ID fehlt, eine fremde ID steht, eine ID doppelt ist oder ein Eintrag nicht genau die 8 Teilfelder hat (B05). Herkunft SMART_P19; DE/USA «nicht erfasst», Herkunft leer. Eine Protokollzeile je gesetzter Zelle (1'353; Protokoll 5'423 → 6'776). Letzter Schritt in `scripts/master_nachtraege.py` nach Paket 22. Bestehende Spalten bleiben unverändert, auch `lieferform` und `lieferform_struktur`.
A2 **Generator** `scripts/generator_website.py`: liest nur `master_3818_aktuell.csv` und die Platzhaltertabelle `scripts/generator_platzhalter.csv`; schreibt `paket25/website/data-p25.js` (`window.WEITERBILDUNGSRADAR_OFFERS = …;` + Zeilenende) und `paket25/out/smart-search-data-p25.json`. Keine weiteren Eingaben, keine Website-, Smart- oder Korrekturdatei.
A3 **Auswahl:** `release_markt` ∈ {CH, AT, LI} (E074); alle Zeilen, auch gesperrte und abgelaufene (E121 gilt bis zur Umsetzung von E172 in P28). Reihenfolge = Master-Reihenfolge (Entscheid 3 A).
A4 **Feldzuordnung** wie `test_paket24.py` (MAP, LMAP: 25 Felder, `laender` mit 5 Teilfeldern). Anzeigefeld vor Original bei Termin, Ort, Dauer, Preis, Durchführungen (E113, E114). `sessions` nur bei Durchführungsliste; `publicationStatus`, `publicationReason` nur, wenn nicht «nicht erfasst». `laender` wörtlich. Kein Feld `korrekturen` (E152, E156). Feste Schlüsselreihenfolge.
A5 **Platzhalter** (Entscheid 1 A): «nicht erfasst» → Code je Feld: `format`, `level`, `priceDisplay` NICHT_PUBLIZIERT; `priceCategory` PREIS_NICHT_PUBLIZIERT; `language`, `region`, `duration` NOT_PUBLISHED; `startDate`, `endDate` leer; `publicationStatus`, `publicationReason`, `sessions` entfallen. Steht «nicht erfasst» in einem anderen Feld: Abbruch.
A6 **Smart:** `byId` in der Reihenfolge der Datendatei; `parserStatus`, `priceEligible` (Wahrheitswert), `priceOptions` (JSON; «nicht erfasst» → `[]`), `delivery` aus `lieferform_json`; `meta` = feste Kennungen + `rosterCount` = Anzahl. Ausgabeform wie heute (JSON ohne Einrückung, UTF-8).
A7 **Abbruch vor jedem Schreiben**, mit Meldung, die ID und Feld nennt, bei: fehlender Pflichtspalte, leerer oder doppelter ID, ungültigem JSON und falschem Typ (`preis_optionen` keine Liste, `durchfuehrungen` bzw. `durchfuehrungen_anzeige` keine Liste, `lieferform_json` kein Objekt mit den 8 Teilfeldern, z. B. `null` oder `[]`), unbekanntem Wert in `preis_budgetfaehig` (nur True/False), fehlender `lieferform_json` bei CH/AT/LI, Platzhalter in einem Feld ohne Tabelleneintrag; der Ausgabeordner bleibt bytegleich (wie P24 T08; erweitert nach B04).
A8 **Build** `paket25/scripts/build_p25.sh <Stichtag>`: Seiten und App wie `build_p19.sh` aus `paket22/website/` (ohne Datendatei), dann Generator, dann `paket25/scripts/build_liste_p25.js` (= `build_liste_p19.js`, nur Pfade und Dateinamen als Parameter, Logik unverändert, Diff im Bericht) für Liste, «Stand der Angaben» und Sitemap.
A9 **Unverändert:** `paket19/` (Live-Stand), `app-v43.js`, alle HTML-Seiten, Basis `master_3818.csv`, die Website live. Kein Release, kein Upload (Entscheid 4 A).
A10 **Bestehende Tests angepasst** (Entscheide 6, 8, 9): `test_paket24.py` T06 (prüft weiter genau die 113 Originalspalten; die 10 Anzeige- und 2 Lieferformspalten werden ausgeklammert), T08/T09 (Eingabeliste um `paket25/eingang/lieferform_p19.json` ergänzt), T10 (prüft weiter genau die 4'118 historischen Protokollzeilen; die 1'353 Lieferform-Zeilen werden ausgeklammert), T14 (123 → 125 Spalten); `test_nachtraege.py` N01 (10 → 12 neue Spalten), N02/N03 nur falls der Lauf es verlangt und nur durch Ausklammern der neuen Spalte; `paket8/tests/test_browser_p8.js` Parameter für Daten- und Smart-Datei. Alle historischen Sollwerte, Hashes und Prüfabsichten bleiben, keine Prüfung wird abgeschwächt oder entfernt; Diff im Bericht. `virtuelle_tests.js` bleibt unverändert (Entscheid 9). Jede weitere Anpassung bestehender Tests nur nach Rückfrage.
A11 **Wissensbasis:** GESAMTWISSENSSTAND §6 P24-N berichtigen (Codes bleiben vorerst, einheitlich je Feld; entfallen erst mit P27 und App-Anpassung), §2 Master, §3, §9, §10.
A12 **Browser-Prüfstand** (B03): `paket25/scripts/pruefstand_p25.py` baut in einem temporären Ordner aus `paket25/website/` einen lauffähigen Stand: `index.html` mit den Verweisen auf `data-p25.js`, `smart-search-data-p25.js`, `app-v43.js` (Ersetzung wie `build_release.py`, jede genau einmal, sonst Abbruch), Smart-Hülle `window.MEDIA_SKILLS_SMART_DATA = …;` deterministisch aus `smart-search-data-p25.json`. Vor G11 (Browser-Teil), G15 und B1 bestätigt der Test die tatsächlich geladenen Dateien per SHA-256 (gleich den Generator-Ausgaben, `app-v43.js` ada38d5e…). Kein Release, keine Änderung live.

## 3. Entscheide (Owner 20.11., alle Variante A)

**Entscheid 1 – Platzhalter in der Datendatei** → **A** (Vorschlag E192)
- A: ein Code je Feld nach A5; App unverändert; 7 Rohwerte ändern, Anzeige gleich.
- B (nicht gewählt): Codes entfernen und `app-v44.js` anpassen; gehört eher zu P27.

**Entscheid 2 – Lieferform (Lücke L3)** → **A** (Vorschlag E193)
- A: Spalte `lieferform_json` im Master nach A1; danach ist der Master vollständig.
- B (nicht gewählt): Generator liest die Lieferform weiter aus `smart-search-data-p19.json`.

**Entscheid 3 – Reihenfolge der Datensätze** → **A** (Vorschlag E194)
- A: Master-Reihenfolge. Karten in allen drei Sortierungen gleich; Smart-Treffer können nur innerhalb von Gleichständen (gleiche Punktzahl und gleicher Titel; 11 Titel, 24 Angebote) anders stehen, jeder Fall im Bericht. Die Reihenfolge trägt keine Bedeutung (E020, E039).
- B (nicht gewählt): neue Master-Spalte `website_reihenfolge`.

**Entscheid 4 – Release** → **A** (Vorschlag E195)
- A: kein Release in P25; der Generator liefert die Daten für das nächste Release (Monatsbuild, E177).
- B (nicht gewählt): Release nach den Tests mit eigener Freigabe.

**Entscheid 5 – Freigabe** → **freigegeben**, Zweitmeinung ChatGPT parallel, Befunde vor dem Commit einarbeiten (wie E183) (Vorschlag E196).

Quelle: Owner-Antworten 20.11., Chat «Spezifikation P25» (Auswahl «Ein Code je Feld», «Spalte im Master», «Master-Reihenfolge», «Frei, ohne Release»).

## 4. Prüfschritte vor der Umsetzung (nur lesen)

U1 Zweig auf 111b0fd oder jünger ohne Änderung an `paket3/out/`, `paket19/`, `paket22/`; `master_3818_aktuell.csv` SHA-256 e5afa29cde40b712…; sonst anhalten. **Erledigt 20.11.**
U2 Zählungen §1.1 und §1.2 wiederholen; weicht eine ab, anhalten und melden. **Erledigt 20.11.** (§10).
U3 Live = Repo per fetch ohne Zwischenspeicher. **PASS 20.11. 18:01 UTC** (Chrome, über `methodik.html`; die Startseite leitet in Claudes Chrome im Kreis weiter, in Firefox lädt sie laut Owner normal): `data-p19.js` HTTP 200, 1'595'112 Byte, fc0fc6f9c245a4cb867ec4bfa19e05ccf6dd18f5bacf901203811b0bb3b14d61, Last-Modified 20.11. 01:04:05 GMT; `smart-search-data-p19.js` HTTP 200, 1'016'445 Byte, 37cf74cfcf033e795f71fcfb96b0d2f7077950a8c921af809e5dc1714a717216 (= Hülle aus `build_release.py` + `smart-search-data-p19.json`), Last-Modified 20.11. 01:04:06 GMT; beide = Repo 111b0fd.
U4 Erledigt 20.11., siehe §9.

## 5. Testliste (Abnahme)

**Master**

| Nr. | Prüfung | Erwartung |
|---|---|---|
| M01 | CSV-Form | 3'820 Zeilen inkl. Kopf, je 125 Spalten, UTF-8 mit BOM, LF |
| M02 | `lieferform_json` | ID-Menge und alle 8 Teilfelder unabhängig aus der Smart-p19-Quelle (SHA-256 festgehalten) abgeleitet und verglichen: 1'353 CH/AT/LI gleich (Struktur), 2'466 DE/USA «nicht erfasst»; Herkunft SMART_P19 bzw. leer; Auszug = festgehaltener SHA-256 |
| M03 | Widerspruchsfreiheit | `evidenceTier` = `lieferform`, `structure` = `lieferform_struktur` (Platzhalter und leer = «nicht erfasst»), 1'353 von 1'353 |
| M04 | bisherige 123 Spalten | Rückprojektion auf die 123 Spalten = SHA-256 e5afa29c… (Master 111b0fd) |
| M05 | Protokoll | 5'423 bisherige Zeilen identisch; jede der 1'353 neuen Zeilen einzeln gegen Master-Wert, Herkunft und Quelldatensatz geprüft |
| M06 | bestehende Tests (A10) | `test_paket24.py` 14/14, `test_nachtraege.py` 14/14 |
| M07 | Reproduzierbarkeit | zwei Läufe aus frischen Ordnern bytegleich |
| M08 | Abbruch Auszug (B05) | fehlende, fremde, doppelte ID im Auszug; Eintrag ohne 8 Teilfelder → Abbruch, Ausgabeordner bytegleich |

**Generator**

| Nr. | Prüfung | Erwartung |
|---|---|---|
| G01 | Eingaben | Lauf in einem Ordner nur mit Master, Platzhaltertabelle und Generator ergibt dieselbe Ausgabe |
| G02 | Auswahl | 1'353 IDs = `data-p19.js`, keine Dublette |
| G03 | Datendatei | je Angebot gleiche Schlüsselmenge; alle Werte gleich `data-p19.js` ausser der Sollliste von 7 Platzhaltern (§1.1, ID und Feld fest im Test); 0 weitere Abweichungen |
| G04 | Felder | kein `korrekturen`, kein Feld ausserhalb A4 |
| G05 | Smart-Datei | 1'353 Einträge, jeder gleich Smart-p19 (Struktur); `meta` gleich |
| G06 | Abbruch (A7, erweitert B04) | je ein Fall, jeder einzeln gegen einen bestehenden Ausgabeordner: Platzhalter in Feld ohne Eintrag; fehlende Pflichtspalte; leere ID; doppelte ID; ungültiges JSON in `preis_optionen`, `durchfuehrungen`, `lieferform_json`, `durchfuehrungen_anzeige`; `preis_optionen` als Objekt; `durchfuehrungen` mit falschem Typ; `lieferform_json` `null` bzw. `[]`; unbekannter Wert in `preis_budgetfaehig`; fehlende `lieferform_json`. Erwartung je Fall: Rückgabecode ≠ 0, Meldung mit ID und Feld, Ausgabeordner bytegleich, keine neuen Dateien |
| G07 | Determinismus | zwei Builds bytegleich (Datendatei, Smart, `index.html`, `sitemap.xml`) |
| G08 | Master nur gelesen | Master und Protokoll vor und nach dem Generator bytegleich (E031) |

**Anzeige** (`app-v43.js` in jsdom, Live-Daten gegen Generator-Daten, gleicher Stichtag, gleiche Laufzeitumgebung)

| Nr. | Prüfung | Erwartung |
|---|---|---|
| G09 | Karten | an 20.11., 21.11. und 01.12.2026 alle sichtbaren Karten mit Text und Link gleich, gleiche Reihenfolge in allen drei Sortierungen; 1'006 sichtbar am 20.11. |
| G10 | Filter | Optionen und Zähler aller Filter gleich (Kursform, Niveau, Sprache, Preisklasse, Durchführungsort, Kostenlos) |
| G11 | Smart-Suche (neuer Test `paket25/tests/test_paket25.js`, Entscheid 9) | 60 Anfragen: T01–T20 und die 40 Anfragen aus `virtuelle_tests.js` (Liste nur gelesen); je Treffer ID (über Anbieter + Titel, bei allen 1'353 eindeutig), vollständiger Kartentext mit allen Badges, Budget- und Begründungstext, Link; alle Chips, Status und Verstanden-Text; JavaScript-Fehler = FAIL. Erwartung: gleiche Treffermengen und Texte; Reihenfolge gleich, ausser dass Treffer mit gleichem Titel innerhalb ihrer zusammenhängenden Gruppe die Plätze tauschen dürfen; jeder Tausch im Bericht, jede andere Abweichung = FAIL. Eine Punktzahl braucht der Vergleich nicht: Bei inhaltsgleichen Daten hat jedes Angebot in beiden Läufen dieselbe Punktzahl, die Dateireihenfolge wirkt nur bei Gleichstand von Punktzahl und Titel (§1.1) |
| G12 | Liste im HTML, Stichtag 20.11. | Block zwischen den P19-Markern bytegleich mit `paket19/website/index.html`; «Stand der Angaben: 20.11.2026» |
| G13 | Sitemap, Stichtag 20.11. | bytegleich mit `paket19/website/sitemap.xml` |
| G14 | Stufe 1 (`test_paket8.js` direkt mit `STICHTAG`, `WEBSITE`, `APP`, `DATA`, `SMART`; `run_paket8.sh` bleibt unverändert) | 35 PASS · 0 FAIL · 4 später an 20.11. und 01.12. |
| G15 | Stufe 2 Browser (`test_stufe2_browser.js` mit `WEBSITE`, `APP`, `DATA`, `SMART`, `OUTDIR`); B1 mit `test_browser_p8.js` nach §9; beide auf dem Prüfstand A12, geladene Dateien per SHA-256 bestätigt | 10 PASS · 0 FAIL; B1 PASS |
| G16 | Grösse | Byte Datendatei und Smart-Datei gegen p19 im Bericht (erwartet ±1 %) |
| G17 | Unverändert | `paket19/website/*`, `paket19/out/smart-search-data-p19.json`, `paket22/`, Basis `master_3818.csv` (SHA-256 vorher = nachher) |
| G18 | Angepasste Testwerkzeuge (A10) | `test_browser_p8.js` ohne neue Parameter = bisheriges Verhalten; `test_paket24.py` und `test_nachtraege.py` prüfen weiter die historischen Sollwerte und Hashes; Diff im Bericht |
| G19 | Prüfstand (A12) | Verweise in `index.html` je genau einmal ersetzt; Smart-Hülle aus zwei Läufen bytegleich; geladene Dateien im Browser = Generator-Ausgaben (SHA-256) |

## 6. Lieferung und Aufwand

- Commits auf `claude/datenharmonisierung`, Push (E191); nie `main` (E041).
- `BERICHT_PAKET25_<Datum>.md` mit Testergebnissen, Gegenprüfung durch getrennten Agenten, Abgleich Zweitmeinung (§11); Nachtrag Register (E192–E200) und GESAMTWISSENSSTAND (A11).
- Kein Release, kein Upload (Entscheid 4 A).
- Zeit: Claude eine bis zwei Arbeitssitzungen; für den Owner später rund 5 Minuten (Bericht bestätigen).

## 7. Prüfung nach Fachrollen (FACHROLLEN.md Fassung 3)

| Rolle | Prüffrage | Ergebnis |
|---|---|---|
| R2 Daten | eine Quelle, Herkunft je Feld, keine stille Überschreibung | erfüllt: A1, A2, A7; M02, M04, M05, M08, G01, G08 |
| R4 Build | gleiche Eingabe = gleiche Ausgabe; Abbruch statt Teilergebnis; Prüfstand nachweisbar | erfüllt: G06, G07, G19, M07, M08 |
| R6 Ladezeit | Auslieferung nicht grösser | G16 |
| R8 Datenschutz | neue Personendaten, Tracking? | nicht betroffen |
| R10 QS | Befunde mit Beleg, getrennte Prüfung | getrennter Agent; Zweitmeinung ChatGPT eingearbeitet (§11) |
| R1, R3, R5, R7, R9 | – | nicht betroffen |

## 8. Bei Punkten ausserhalb dieser Spezifikation

Anhalten und fragen (wie E158).

## 9. Nachtrag 20.11.: Eingangsprüfung ChatGPT, U4, Rollen

Anlass: Bericht ChatGPT «Paket 25 – Eingangsprüfung U1–U4» (Owner-Upload 20.11., Gesamtstatus HOLD). ChatGPT meldet U1 PASS, U2 teilweise, U3 offen, U4 blockierend; die Zweitmeinung zur Spezifikation selbst stand laut Bericht noch aus.

Nachprüfung Claude auf 111b0fd [GEPRÜFT]:
- U1 und die von ChatGPT gezählten Werte zu U2 stimmen mit §1 überein (u. a. Master-SHA-256 e5afa29c…, 331 leere Preisoptionen, 18 leere `structure`, 6 gleiche Positionen).
- U4 `run_paket8.sh`: Die Stichtage 09.11. und 01.12. sind fest (Z. 10); das Werkzeug selbst, `test_paket8.js`, nimmt aber `STICHTAG`, `WEBSITE`, `APP`, `DATA`, `SMART` und `MASTER` als Parameter (Z. 17–24). Darum **nicht blockierend**: Aufruf direkt (G14), keine Änderung.
- U4 `test_browser_p8.js`: Der Prüfstand kopiert immer `paket7/website/data-p7.js` und `merge_kandidat_smart.json` (Z. 21–27). B1 prüft das Markup, liefe aber mit den Daten von Paket 7 → **zutreffend**.
- U4 `virtuelle_tests.js`: Prüfling fest `docs/`, Ausgabe fest `paket15/out/` (Z. 6) → **zutreffend**.
- U4 `test_stufe2_browser.js`: Parameter vorhanden → keine Änderung.

**Entscheid 6 – U4 Testwerkzeuge** → **minimal parametrisieren** (Owner 20.11., Vorschlag E197): Standard = bisheriger Wert, Testlogik, Kriterien und Sollwerte unverändert, Diff im Bericht, Prüfung G18. Nicht gewählt: eigene P25-Adapter. **Eingeschränkt durch Entscheid 9 (21.11.):** gilt nur noch für `test_browser_p8.js` (Parameter für Daten- und Smart-Datei); `virtuelle_tests.js` bleibt unverändert.

**Entscheid 7 – Rollen** → **E033 bleibt** (Owner 20.11., Vorschlag E198): Claude setzt P25 um und schliesst U2 und U3 ab; der Bericht von ChatGPT gilt als Gegenprüfung der Eingangsprüfung. Die Zweitmeinung zur Spezifikation holt der Owner ein; Einarbeitung vor dem Commit (Entscheid 5).

Quelle: Owner-Antworten 20.11., Chat «Spezifikation P25» (Auswahl «Minimal parametrisieren», «E033 bleibt»).

## 10. Berichtigung 20.11.: Befund ChatGPT U2-01

Anlass: Bericht ChatGPT «Paket 25 – Eingangsprüfung U2/U3» (Owner-Upload 20.11., HOLD wegen U2-01).
- **U2-01 zutreffend:** Die Schlüsselreihenfolge hat 6 Varianten, nicht 5. Ursache: Claude hatte bei der Vorprüfung nur die fünf häufigsten Varianten ausgegeben (Zählfehler in §1.1, kein Datenfehler). §1.1 berichtigt; Generator und Tests unverändert, weil die feste Schlüsselreihenfolge (A4) und G03 (Schlüsselmenge, nicht Reihenfolge) davon nicht abhängen [GEPRÜFT, Nachzählung 111b0fd].
- **Sollliste der 7 Rohwerte** (ChatGPT §2.3) mit der Nachzählung Claude identisch; in §1.1 und G03 übernommen.
- Übrige Zählungen von ChatGPT (U2, 33'825 Feldwerte, Platzhalter, Smart, Reihenfolge) = §1. Mit dieser Berichtigung ist U2 abgeschlossen.
- Keine Owner-Entscheidung nötig: reine Berichtigung eines Zählwerts in der Befundbeschreibung.

## 11. Zweitmeinung ChatGPT, eingearbeitet 21.11.

Anlass: «Paket 25 – unabhängige Zweitmeinung zur Spezifikation» (Owner-Upload 21.11.; HOLD, 3 blockierend, 2 sollte; Architektur, Datenmodell und Entscheide 1–7 PASS; statische Prüfung gegen 111b0fd, keine Tests ausgeführt). Alle Befunde von Claude am Code von 111b0fd nachgeprüft [GEPRÜFT].

| Befund | Nachprüfung Claude | Einarbeitung |
|---|---|---|
| B01 bestehende Tests nicht lauffähig (blockierend) | zutreffend: T06 erwartet die 10 Anzeigespalten am Ende und genau 113 übrige (Z. 148–157), T08/T09 kopieren nur die 12 bisherigen Eingaben (Z. 172–212), T10 zählt die neuen Protokollzeilen mit (Z. 214–218), T14 fest 123 | A10; Entscheid 8 |
| B02 Smart-Suche nicht ausreichend nachgewiesen (blockierend) | zutreffend: `virtuelle_tests.js` erfasst keine ID, höchstens 6 Badges (`slice(0, 6)`), Budget gekürzt, JS-Fehler ohne Fehlercode | G11 als neuer Vergleichstest; Entscheid 9. Punktzahl: nicht nötig, Begründung in G11 |
| B03 Prüfstand nicht eindeutig (blockierend) | zutreffend: `index.html` trägt bis zum Release die alten Verweise (§1.3), Smart nur als JSON | A12, G15, G19 |
| B04 Abbruchvertrag unvollständig (sollte) | zutreffend: A7 nannte fehlende Pflichtfelder, G06 prüfte sie nicht; Typfehler ungeprüft | A7, G06 erweitert |
| B05 Herkunft Lieferform stärker absichern (sollte) | sinnvoll | A1, M02, M04, M05, M08 |

**Entscheid 8 – Anpassung bestehender Tests (B01)** → **so anpassen** (Owner 21.11., Vorschlag E199): T06, T08/T09, T10, T14 in `test_paket24.py` nach A10; historische Sollwerte, Hashes und Prüfabsichten bleiben.

**Entscheid 9 – Nachweis Smart-Suche (B02)** → **neuer Vergleichstest** (Owner 21.11., Vorschlag E200): G11 in `paket25/tests/test_paket25.js`; `virtuelle_tests.js` bleibt unverändert; Entscheid 6 gilt nur noch für `test_browser_p8.js`. Nicht gewählt: zusätzlich `virtuelle_tests.js` parametrisieren.

Quelle: Owner-Antworten 21.11., Chat «Spezifikation P25» (Auswahl «Ja, so anpassen», «Neuer Vergleichstest»).
Damit sind alle Befunde der Zweitmeinung in der Spezifikation behandelt; ob die Umsetzung sie erfüllt, zeigen die Tests im Bericht P25.

## 12. Gegenprüfung ChatGPT §11, eingearbeitet 21.11.

Anlass: «Paket 25 – Gegenprüfung §11» (Owner-Upload 21.11.; HOLD; B01, B03, B04, B05 erledigt, B02 offen; neu B06 blockierend, B07 sollte, B08 Hinweis; statische Prüfung gegen 11fcc70). Nachprüfung Claude am Code und durch Messung [GEPRÜFT].

| Befund | Nachprüfung Claude | Einarbeitung |
|---|---|---|
| B06 Punktzahl nicht gesichert (blockierend) | zutreffend: `smartHaystack` (app-v43.js Z. 988–991) und die Katalogsuche (Z. 1655–1670) durchsuchen `duration`, `region`, `priceDisplay` roh; die 7 geänderten Codes ändern Suchen mit Wörtern oder Wortteilen der drei Codes («nicht», «publiziert», «not», «published», «verifiziert», «Katalogtermin»; in der Katalogsuche auch «Termin», «aktuell», «Katalog», «fuer», berichtigt nach der Gegenprüfung des getrennten Agenten, S1), nur bei den 7 Angeboten, nicht die 60 Testanfragen und nicht die Titelanfragen | G11 um Punktzahl je Kandidat und Nachweis echter Gleichstände erweitert; neuer Test **G20** mit fester Sollliste; Entscheid 10 |
| B07 Vergleichsumgebung (sollte) | zutreffend | G11: beide Stände mit gleichem festem Stichtag, `TZ=Europe/Zurich` Pflicht, Chrome je Stand eigener Kontext gleicher Einstellung (de-CH, Europe/Zurich) |
| B08 leere ID (Hinweis) | zutreffend | G06: bei leerer ID Zeilennummer und Feld, bei fehlender Spalte der Spaltenname |

**Entscheid 10 – Codewörter in der Suche (B06)** → **annehmen, als Test** (Owner 21.11., Vorschlag E201): «Ein Code je Feld» (Entscheid 1) bleibt; G20 hält die Abweichungen als Sollliste fest (BERICHT_PAKET25 §4) und belegt gleiche Punktzahlen; die Codes verschwinden aus dem Suchtext erst mit P27 (App-Änderung). Nicht gewählt: 7 Rohwerte unverändert (Ausnahmeliste je ID), App jetzt ändern.

Quelle: Owner-Antwort 21.11., Chat «P25 umsetzen» (Auswahl «Annehmen, als Test»).

