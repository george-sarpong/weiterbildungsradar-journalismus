# BERICHT PAKET 25 «Generator Master → Website», 21.11.2026

Status: **umgesetzt und getestet**, Code-Commit b895b50 auf `claude/datenharmonisierung`, kein Release (Entscheid 4 A). Owner-Bestätigung des Nachtrags offen.
Auftrag: Owner 21.11. («P25 umsetzen und testen … Nachprüfung von §11 durch ChatGPT … Befunde vor dem Commit einarbeiten. Danach Bericht, Register E192–E200 und GESAMTWISSENSSTAND nachführen»).
Grundlage: `SPEZIFIKATION_PAKET25_20261120.md` (freigegeben, Entscheide 1–9, §9–§11; neu §12), Arbeitszweig `claude/datenharmonisierung`, Basis 11fcc70 (gegenüber 111b0fd nur die Spezifikation), Schreibrecht E191.
Beleg: [GEPRÜFT] von Claude gezählt bzw. Test gelaufen · [OWNER] Owner-Entscheid.

## 1. Ergebnis in Kürze

- Der Master ist jetzt die **einzige Quelle** der Website-Daten: `scripts/generator_website.py` liest nur `paket3/out/master_3818_aktuell.csv` und `scripts/generator_platzhalter.csv` und schreibt `paket25/website/data-p25.js` und `paket25/out/smart-search-data-p25.json` [GEPRÜFT, G01].
- Inhalt wie live: Datendatei = `data-p19.js` bis auf die 7 vereinbarten Platzhalter (Entscheid 1), Smart-Datei strukturgleich; Karten, Filter, Kursliste im HTML und Sitemap gleich; `index.html` und `sitemap.xml` zum Stichtag 20.11. bytegleich mit Paket 19 [GEPRÜFT].
- Master: 2 Spalten `lieferform_json`, `h_lieferform_json` (123 → 125), 1'353 Protokollzeilen (5'423 → 6'776), alle bisherigen Spalten und Protokollzeilen unverändert [GEPRÜFT, M04, M05].
- Gegenprüfung ChatGPT §11 (Owner-Upload 21.11., HOLD): B06 zutreffend und nachgemessen, vom Owner entschieden (Entscheid 10), B07 und B08 eingearbeitet (§4).
- Gegenprüfung getrennter Agent: PASS mit Hinweisen, S1, S2, H2–H6 eingearbeitet (§6). Alle Tests ohne FAIL (§3). Kein Release, kein Upload, Website live unverändert.

## 2. Umsetzung

| Spez. | Datei | Inhalt |
|---|---|---|
| A1 | `paket25/eingang/lieferform_p19.json` (SHA-256 d1bd2836…), `paket25/scripts/auszug_lieferform.py` | eingefrorener Auszug `delivery` aus `paket19/out/smart-search-data-p19.json` (SHA-256 7ddd326a… geprüft), 1'353 IDs, Register E193 |
| A1 | `scripts/master_nachtraege.py` (letzter Schritt nach Paket 22) | Abbruch bei fehlender, fremder, doppelter ID oder Eintrag ohne genau 8 Teilfelder (B05); CH/AT/LI: JSON, Herkunft `SMART_P19`; DE/USA: «nicht erfasst», Herkunft `LEER` |
| A2–A7 | `scripts/generator_website.py`, `scripts/generator_platzhalter.csv` | Auswahl CH/AT/LI in Master-Reihenfolge; 25 Felder + `laender`; Anzeigefeld vor Original; Platzhalter nach Tabelle (12 Zeilen, E192); Smart mit fester `meta`; alle Prüfungen vor dem Schreiben, Schreiben über Zwischendatei und Umbenennen |
| A8 | `paket25/scripts/build_p25.sh`, `build_liste_p25.js` | Build wie Paket 19, Daten aus dem Generator; Liste/Sitemap-Skript = `build_liste_p19.js` mit 4 Parametern (Diff §5) |
| A12 | `paket25/scripts/pruefstand_p25.py` | Prüfstand mit Verweisen auf `data-p25.js`, `smart-search-data-p25.js`, `app-v43.js` (je genau einmal) und Smart-Hülle; schreibt SHA-256 je Datei |
| A10 | `scripts/test_paket24.py`, `scripts/test_nachtraege.py`, `paket8/tests/test_browser_p8.js` | minimal angepasst (§5) |
| – | `paket25/tests/` | `test_paket25_master.py` (M01–M08), `test_paket25_generator.py` (G01–G08, G12, G13, G16, G17), `test_paket25.js` (G09–G11, G11 Punktzahl, G19, G20), `geladen_sha.js` (Nachweis ausgelieferter Dateien für G15/B1) |

Auslegung Claude (bitte bestätigen): A1 «Herkunft leer» für DE/USA als `LEER` umgesetzt, wie die Master-Regel für «nicht erfasst» (`h_lieferform` 3'275 ×, `h_durchfuehrungen` 3'777 × `LEER`). Der im Repo abgelegte Build hat den Stichtag 20.11.2026, damit er direkt mit dem Live-Stand verglichen werden kann; das nächste Release baut mit eigenem Stichtag (E155, E195).

Prüfsummen: Master cf9fdb2d…, Protokoll 44a87475…, `data-p25.js` ae30bf39… (1'595'064 Byte, p19 1'595'112, −0,003 %), `smart-search-data-p25.json` 6e7ec9cd… (1'016'410 Byte = p19), `index.html` 66161dba… = p19, `app-v43.js` ada38d5e… unverändert.

## 3. Testergebnisse [GEPRÜFT, 21.11.]

**Master** (`paket25/tests/test_paket25_master.py`): **8/8 PASS.** M01 125 Spalten · M02 Lieferform unabhängig aus Smart-p19, 1'353 gleich, 2'466 «nicht erfasst» · M03 widerspruchsfrei zu `lieferform`, `lieferform_struktur` · M04 Rückprojektion = e5afa29c… · M05 5'423 alte Zeilen identisch, 1'353 neue einzeln geprüft · M06 `test_paket24.py` 14/14, `test_nachtraege.py` 14/14 · M07 zwei Läufe bytegleich · M08 7 Abbruchfälle (fehlende, fremde, doppelte ID; 7 bzw. 9 Teilfelder; null; veränderter Auszug, SHA-256).

**Generator** (`test_paket25_generator.py`): **13/13 PASS.** G01 isolierter Ordner, bytegleich · G02 1'353 IDs, Master-Reihenfolge · G03 genau die 7 Sollwerte verschieden, sonst typgleich · G04 kein `korrekturen`, feste Schlüsselreihenfolge · G05 Smart strukturgleich, `meta` gleich · G06 14 Abbruchfälle, Ausgabeordner bytegleich (bei leerer ID Zeilennummer, B08) · G06b Schreibfehler bei der zweiten Ausgabe: erste Ausgabe bytegleich, keine Zwischendatei (S2) · G07 zwei Builds bytegleich · G08 Master nur gelesen · G12/G13 `index.html` (1'006 Einträge) und Sitemap bytegleich mit Paket 19 · G16 Grösse −0,003 % / ±0 % · G17 60 Dateien in `paket19/`, `paket22/` und Basis = 11fcc70.

**Anzeige** (`test_paket25.js`, jsdom 20.11., 21.11., 01.12.; Chrome 21.11.): **16/16 PASS.**
- G09 Karten in allen drei Sortierungen gleich (Text, Links, auch outerHTML); sichtbar 1'006 / 1'001 / 945.
- G10 7 Filter, 52 Optionen einzeln gewählt, Optionen und Zähler gleich.
- G11 60 Anfragen (T01–T20 und 40 virtuelle, Liste nur gelesen): Treffer, Kartentexte, Budget, Begründung, Links, Chips, Status, Verstanden gleich; 0 Tausche bei den gezeigten Karten; keine JS-Fehler; im Browser gleich, nur eigene Herkunft.
- G11 Punktzahl (B06): ganze Kandidatenliste je Anfrage (3'749 / 3'727 / 3'522 Kandidaten) mit Punktzahl, Budget- und Gratis-Status je Angebot gleich; 13 Gleichstandsgruppen je Stichtag in anderer Reihenfolge, alle mit gleichem Status, gleicher Punktzahl und gleichem Titel (nur Dateireihenfolge, Entscheid 3). Gemessen mit einer Testkopie der App mit einer Haken-Zeile; ihre Ausgaben = Original-App; ausgeliefert bleibt `app-v43.js`.
- G19 Prüfstand: Verweise je genau einmal, Smart-Hülle aus zwei Läufen bytegleich, im Browser geladen = Generator-Ausgaben (SHA-256); Vergleichsstand p19 = Live-Bytes (fc0fc6f9…, 37cf74cf…, U3).
- G20 (Entscheid 10, ergänzt nach S1): 7 Titelanfragen (jede findet ihr Zielangebot in beiden Ständen) und 16 Anfragen mit Codewörtern und Wortteilen der Codes, Smart- und Katalogsuche; Abweichungen genau = Sollliste §4, nur bei den 7 Angeboten.

**Bestehende Werkzeuge:**
- G14 Stufe 1 (`test_paket8.js` direkt, MASTER aktuell, NEU=1): **35 PASS · 0 FAIL · 4 später** an 20.11. und 01.12.
- G15 Stufe 2 (`test_stufe2_browser.js`): **10 PASS**; das Werkzeug meldet D8 weiter als FAIL, D8 entfällt nach E105 (Paket 19 gleich). B1 (`test_browser_p8.js` mit DATA, SMART): B1, B3a, B3b, S1 PASS; T1 und T5 Soll offen wie live. Ausgelieferte Dateien per `geladen_sha.js` belegt: `data-p7.js` = `data-p25.js` (ae30bf39…), `smart-search-data-p7.js` = Hülle (afdb149a…), `app-v43.js` ada38d5e…
- G18: `test_browser_p8.js` ohne neue Parameter: Ergebnisse, axe, vnu und ausgelieferte Dateien gleich der alten Fassung; `test_paket24.py`, `test_nachtraege.py` mit allen historischen Sollwerten und Hashes grün.

## 4. Gegenprüfung ChatGPT §11 (Owner-Upload 21.11.)

| Befund | Nachprüfung Claude | Einarbeitung |
|---|---|---|
| B01, B03, B04, B05 | erledigt (ChatGPT) | – |
| B02 / **B06** Punktzahl (blockierend) | **zutreffend**: `smartHaystack` (app-v43.js Z. 988–991) und die Katalogsuche (Z. 1655–1670) durchsuchen `duration`, `region`, `priceDisplay` roh. Gemessen 21.11.: 60 Testanfragen und 7 Titelanfragen gleich (gleiche Punktzahl); anders nur Anfragen mit Wörtern oder Wortteilen der drei Codes, nur bei den 7 Angeboten (berichtigt nach S1, §6a) | G11 Punktzahl, G20; **Entscheid 10** (Owner 21.11., Vorschlag E201): annehmen, Sollliste im Test; Codes verschwinden aus dem Suchtext erst mit P27 (App-Änderung) |
| B07 Umgebung (sollte) | zutreffend | Test bricht ohne `TZ=Europe/Zurich` ab; beide Stände mit gleichem festem Datum, Chrome je Stand eigener Kontext mit gleicher Einstellung; Umgebung im Protokoll `paket25/out/test_paket25_js.json` |
| B08 leere ID (Hinweis) | zutreffend | G06 verlangt bei leerer ID Zeilennummer und Feld, bei fehlender Spalte den Spaltennamen |

Sollliste G20 (Smart-Kandidaten bzw. Katalogtreffer, p19 → p25):

| Anfrage | Smart | Katalog |
|---|---|---|
| «nicht», «nicht publiziert» | CH-V18-F03 fällt weg | CH-V18-F03 fällt weg |
| «published», «not published» | +AT-PROD-OFFER-151, CH-V18-F03, V59-SZ05 | dieselben 3 kommen dazu |
| «not» | dieselben 3 kommen dazu | dieselben 3 kommen dazu |
| «verifiziert», «Katalogtermin», «aktuellen Katalogtermin», «Termin», «Workshop Termin», «aktuell», «aktuellen», «Katalog», «fuer» | gleich | AT-PROD-OFFER-173 fällt weg |
| «publiziert», «für», 7 Titel | gleich | gleich |

Einordnung: Bei «Termin», «aktuell», «Katalog», «fuer» fiel in p19 ein Scheintreffer weg, der nur über den Code NICHT_VERIFIZIERT_FUER_AKTUELLEN_KATALOGTERMIN zustande kam (Katalogsuche vergleicht Teilzeichenketten). Die gezeigten Smart-Karten bleiben bei allen diesen Wörtern gleich.

## 5. Diffs bestehender Dateien (A8, A10)

- `test_paket24.py`: Konstante `LF_COLS`; T06 klammert die 2 Spalten aus (prüft weiter 113 Spalten gegen 283ebb70…); T08/T09 Eingabeliste + Auszug; T10 klammert `lieferform_json` aus (weiter 4'118 Zeilen gegen daf59282…); T14 125 Spalten.
- `test_nachtraege.py`: N01 erwartet `+ LF_COLS`. N02/N03 unverändert (Lauf verlangte nichts).
- `test_browser_p8.js`: `DATAFILE`, `SMARTFILE` aus `DATA`, `SMART`, Standard wie bisher (5 Zeilen).
- `build_liste_p25.js` gegenüber `build_liste_p19.js`: Kommentar, Aufrufzeile, `W`/`OUT`/`DATA`/`SMART` als Parameter, zwei Lesezeilen; Logik unverändert.
- Nicht geändert: `virtuelle_tests.js` (Entscheid 9), `run_paket3.sh` (die neuen Tests stehen in `paket25/tests/`, Aufnahme in den Lauf nicht verlangt).

## 6. Gegenprüfung getrennter Agent (21.11.)

Getrennter Agent, nur lesend, eigene Skripte; Urteil **PASS mit Hinweisen**. Selbst ausgeführt: Master 8/8, Generator 12/12, Anzeige 16/16; eigene Nachrechnung: genau 7 Werte verschieden (−48 Byte), Smart 0 Abweichungen, Rückprojektion e5afa29c…, Generator öffnet laut `strace` nur sich, Tabelle und Master; Diffs der bestehenden Tests ohne Abschwächung; Gleichstandslogik eher streng.

| Befund | Einarbeitung |
|---|---|
| S1 (sollte, Owner informieren): auch gewöhnliche Wörter, die Teil eines Codes sind («Termin», «aktuell», «Katalog», «fuer», «not»), ändern die Katalogsuche; Grundlage von Entscheid 10 ungenau beschrieben | G20 um 8 Anfragen ergänzt, Sollliste §4 gemessen und gleich der Zählung des Agenten; Wortlaut in Spezifikation §12 und Register E201 berichtigt. Richtung unverändert (meist fällt ein Scheintreffer weg) – **zur Kenntnis an den Owner** |
| S2 (sollte): Generator konnte bei einem Schreibfehler eine Teil-Ausgabe hinterlassen | `schreibe()` schreibt erst beide Zwischendateien, dann ersetzt es beide; Zwischendateien werden bei Fehler entfernt; Test G06b; Ausgaben bytegleich |
| H1: `build_p25.sh` leert `paket25/website` vor dem Generator | nicht geändert (wie `build_p19.sh`, A8); Abbruch zeigt sich am Rückgabecode |
| H2: Titelanfragen prüften nur «eines der 7» | jede Titelanfrage prüft ihr Zielangebot in beiden Ständen, Smart und Katalog |
| H3: Haken-Gleichheit nur für p25 | für beide Stände |
| H4: Auszug-SHA nur im Test | `master_nachtraege.py` prüft SHA-256 des Auszugs und Quelle/SHA im Auszug; M08 + Fall «Auszug verändert» |
| H5: irreführende Meldung bei doppeltem Teilfeld | Meldung «Schlüssel … doppelt (ID bzw. Teilfeld)» |
| H6: Protokoll `test_paket25_js.json` nicht bytegleich | Ladeprotokoll sortiert; die Datei ist ein Laufprotokoll, die Prüfergebnisse hängen nicht davon ab |

## 7. Prüfung nach Fachrollen

R2 Daten: eine Quelle, Herkunft je Zelle, Abbruch statt stiller Änderung (M02–M05, M08, G01, G06, G08) · R4 Build: deterministisch, Prüfstand nachweisbar (G07, G19, M07) · R6 Ladezeit: Grösse gleich (G16) · R8 Datenschutz: nicht betroffen (keine neuen Daten, S1/S2/S3 PASS) · R10 QS: getrennter Agent (PASS mit Hinweisen, alle eingearbeitet), ChatGPT §11 eingearbeitet.

## 8. Offen für den Owner

1. Nachtrag Paket 25 bestätigen (Register E192–E201, GESAMTWISSENSSTAND), dabei die Berichtigung S1 zur Grundlage von Entscheid 10 (§6).
2. Auslegung «Herkunft leer» = `LEER` (§2) bestätigen oder korrigieren.
3. Codes im Suchtext (Entscheid 10) mit P27 entfernen; vorgemerkt.
