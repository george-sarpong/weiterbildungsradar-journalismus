# BERICHT PAKET 26 «Eingangsformat», 21.11.2026

Status: umgesetzt und getestet, kein Release (E207). Owner-Entscheide aus diesem Chat: E208–E210.
Auftrag: Owner 21.11., Chat «P26 umsetzen» («P26 umsetzen und testen; Schreibrecht auf GitHub ist erteilt (wie E191)»).
Grundlage: `SPEZIFIKATION_PAKET26_20261121.md` (freigegeben, E203–E207); GESAMTWISSENSSTAND (Stand E207); Register E207.
Arbeitszweig: `claude/datenharmonisierung`, Ausgang Commit 8e1c715, Umsetzung Commit siehe §9.
Beleg: [GEPRÜFT] von Claude gezählt bzw. getestet · [OWNER] Entscheid in diesem Chat.

## 1. Ergebnis

Lücke L2 ist geschlossen. Es gibt nur noch **einen Weg** in den Master: den Ordner `claude-work/eingang/` mit **einem** Format für Korrekturen und **einem** für neue Angebote. Das Prüfskript `scripts/eingang_pruefen.py` prüft jede Datei, bevor etwas geschrieben wird. `scripts/master_nachtraege.py` liest nur noch diesen Ordner. [GEPRÜFT]

- Der Altbestand ist maschinell überführt: **5'253 Korrekturzeilen** in 7 Dateien (Läufe 013, 014, 016, 017, 018, 021, 022) und **1 neues Angebot** (OFFER-DIGICOMP-075). Jede der 3'663 Altzeilen entspricht genau einer direkten Zeile; 1'590 Folgezeilen machen die bisher im Code versteckten Folgeregeln sichtbar.
- Der **Master ist bytegleich** (SHA-256 cf9fdb2d…). Das **Protokoll** ändert sich nur in der Spalte `quelle` von genau 136 Zeilen: «wie oben» ist durch die Adresse der Mediencampus-Kursseite ersetzt (E204). Neuer SHA-256 c82cef3d…
- Website, Generator-Ausgaben (`data-p25.js`, Smart-Datei), Altdateien, `paket19/`, `paket22/`, `paket25/website/` und die Basis sind unverändert.
- Tests: **P26 14/14**, `test_paket24.py` 14/14, `test_nachtraege.py` 14/14, P25 Master 8/8, P25 Generator 13/13.

## 2. Prüfschritte U1–U5 [GEPRÜFT]

| Nr. | Ergebnis |
|---|---|
| U1 | Zweig auf 8e1c715; Master cf9fdb2d…, Protokoll 44a87475… = Spezifikation |
| U2 | Alle Zählungen §1 bestätigt. Einzige Abweichung ist ein **Summenfehler im Spezifikationstext**: Die Einzelwerte der Tabelle §1.1 ergeben 3'663 Zeilen, nicht 3'664. Herkunftscodes: 33 im Master plus LIVE_OWNER_OFFEN (in `build_master_p3.py` definiert, 0 Zellen) = 34. Schutz-IDs: 1'098 Protokollzeilen an 306 IDs ohne Lieferform; mit P25-Lieferform 1'405 an 307. «Anbieter + Titel gleich»: 3 Gruppen im ganzen Master (DJA 2× nach E070, ORSYS 139/140), normalisiert nach NFKC, Gross/klein und Satzzeichen |
| U3 | Länderliste aus **Debian iso-codes 4.16.0-1** (`/usr/share/iso-codes/json/iso_3166-1.json`, 249 Codes, SHA-256 f01b812b…, gelesen 21.11.2026) in `scripts/iso3166_alpha2.csv` |
| U4 | Für OFFER-HEAD-003 (E098) gibt es einen Beleg: `paket13/out/t5_linkcheck_muss.json` vom 10.11. sagt «OK laut Owner 10.11. (E098)». Die Zeile bekommt deshalb `url_status` OK, `url_geprueft_am` 2026-11-10 |
| U5 | Der Altbestand verletzt nur **K12**: in Lauf 017 haben 18 Angebote mehrere Teilkorrekturen ihrer Durchführungen (58 Zeilen, davon 40 Wiederholungen). Ich habe angehalten und gefragt; der Owner hat entschieden (E208, §5). Alle übrigen Regeln K01–K14 und N01–N11 hält der Altbestand ein |

## 3. Umsetzung

| Datei | Inhalt (Spezifikation) |
|---|---|
| `eingang/013_…` bis `022_…` | überführter Altbestand (A7), Spalte `ursprung` = Altdatei und Zeile, bei Folgezeilen mit Zusatz «Folgezeile» |
| `eingang/LIESMICH.md` | Kurzanleitung (A12) |
| `scripts/eingang.py` | gemeinsamer Code: Dateifolge, Lesen, Regeln K01–K14 und N01–N11, Anwendung, Schema-Bericht (A5, A6) |
| `scripts/eingang_pruefen.py` | Prüfskript, schreibt nichts; `--schema-bericht <Datei>` (A5) |
| `scripts/master_nachtraege.py` | Schleife über `eingang/` statt der Paketblöcke 13–22; Lieferform-Schritt P25 unverändert, nach Lauf 022 und vor Lauf 026 (A6) |
| `scripts/eingang_felder.csv` | je Master-Spalte: `aenderbar`, `h_spalte`, `typ`, `codeliste`, `mehrfach`, `leer_erlaubt`, `pflicht_neu`, `neu_zulaessig`, `vorgabe_neu` (A4) |
| `scripts/eingang_codelisten.csv` | 67 Werte in 13 Listen: die 10 der Spezifikation plus MARKT, RELEASE_MARKT, JA_NEIN; Werte aus dem Master (A4) |
| `scripts/eingang_herkunft.csv` | 34 Herkunftscodes mit Bedeutung und Register-ID (A4) |
| `scripts/iso3166_alpha2.csv` | Länderliste mit Quelle und SHA-256 (U3) |
| `wissensbasis/ENTSCHEIDUNGSREGISTER.csv` | Register-Kopie, gegen die K09 prüft (A9) |
| `paket26/scripts/ueberfuehren.py`, `bau_tabellen.py` | einmalige Überführung bzw. Erstfassung der Tabellen (dokumentiert, läuft nicht im Build) |
| `paket26/tests/test_paket26.py` | Abnahme E01–E12 |
| `paket26/out/` | Ersetzungsliste «wie oben» (136), Schema-Bericht, Testausgabe, Diff der Testanpassung |

Zur Feldtabelle: `leer_erlaubt`, `neu_zulaessig` und `vorgabe_neu` sind Ergänzungen zu den vier Spalten aus A4. Sie bilden die Regeln A3 und P24 ab (Anzeigefelder dürfen leer sein; Kennungen früherer Läufe gehören nicht in Dateien neuer Angebote; feste Werte für neue Zeilen). MARKT, RELEASE_MARKT und JA_NEIN sind als Codelisten dazugekommen, weil `market`, `release_markt` und die Ja/Nein-Felder sonst nur als freier Text prüfbar wären. Nur `durchfuehrungsort_land` lässt mehrere Länder zu.

## 4. Tests [GEPRÜFT]

Ausgabe: `paket26/out/test_paket26_ausgabe.txt`.

| Nr. | Ergebnis |
|---|---|
| E01 | PASS: 5'253 Zeilen in 7 Dateien und 1 Angebot; jede Altzeile genau eine direkte Zeile; Überführung aus frischem Ordner bytegleich |
| E01b | PASS: Kette Lauf 017: genau 18 Angebote mit 58 Zeilen; jede Wiederholung hat als `alt` die Liste nach der vorigen Zeile, lückenlos (E208, nach Zweitmeinung B02) |
| E02 | PASS: Master cf9fdb2d…; Protokoll = 44a87475… bis auf `quelle` in genau 136 Zeilen; die Ersetzungsliste ist unabhängig gegen die Altdatei geprüft |
| E03 | PASS: Lauf in einem Ordner nur mit Basis, `eingang/`, Tabellen, Register-Kopie, P25-Auszug und Code (inkl. `build_master_p3.py` für SENT). Laut `strace` wird keine Altdatei geöffnet; neu entstehen nur die zwei Ausgaben |
| E04 | PASS: Prüfskript am Bestand, Rückgabecode 0, Ordner vorher = nachher (auch kein `__pycache__`) |
| E05 | PASS: 59 Fehlfälle (47 erste Fassung, 9 nach der Gegenprüfung, 3 nach der Zweitmeinung), jede Regel K01–K14 und N01–N11 mindestens einmal. Prüfskript und Master-Fortschreibung enden je mit Rückgabecode ≠ 0; die Meldung nennt Datei, Zeile, Spalte und Regel; der Ausgabeordner bleibt bytegleich |
| E06 | PASS: In einer Testkopie korrigiert Lauf 026 eine DE-Zeile und OFFER-DIGICOMP-075 und fügt ein neues CH-Testangebot hinzu. Es ändern sich genau die erwarteten Zellen und Protokollzeilen. Der Generator baut, und das Testangebot hat dieselben Schlüssel wie OFFER-DIGICOMP-075 in Datendatei und Smart-Datei. Der Repo-Eingang bleibt unverändert |
| E06b | PASS: Anzeigefeld leeren → Anzeigefeld und Herkunft leer, Original gilt (nach Gegenprüfung B2) |
| E07 | PASS: Adresse der Übersichtsseite sbvv.ch/weiterbildung ohne `url_geteilt` abgelehnt, mit JA angenommen und gelistet. Gleicher Anbieter + Titel: ohne Freigabe, mit Regel E108 und mit unbekannter ID abgelehnt, mit Owner-Entscheid E206 angenommen. URL mit NICHT_GEPRUEFT ohne Prüfdatum angenommen (nach Zweitmeinung B05, B06) |
| E08 | PASS: zwei Läufe aus frischen Ordnern bytegleich |
| E09 | PASS: 14/14, 14/14, 8/8, 13/13; `data-p25.js` ae30bf39…, Smart-Datei 6e7ec9cd… bytegleich |
| E10 | PASS: Altdateien, `paket19/`, `paket22/`, `paket25/website/` und Basis gleich den Git-Blobs auf 8e1c715 |
| E11 | PASS: historische Sollwerte und Hashes unverändert, gleiche Prüfungen; Diff `paket26/out/testanpassung_a10.diff` |
| E12 | PASS: Schema-Bericht am Master, siehe §8 |

**Testanpassung (A10, E209).** `test_paket24.py` T08/T09 und `test_paket25_master.py` M07/M08 kopieren jetzt `eingang/`, die Tabellen und die Register-Kopie statt der Altdateien. Die Abbruchfälle von T08 treffen über `ursprung` dieselben Altzeilen; beim Website-Altwert von Paket 21 ist das die Spalte `alt_anzeige`. T10 und M05 prüfen weiter jede historische Protokollzeile: Die Spalte `quelle` der 136 Zeilen wird gegen die Ersetzungsliste geprüft und dann auf «wie oben» zurückgesetzt. Danach gilt der bisherige Hash (15a7520c… bzw. daf59282…). T07 liest die Altdateien weiter als unabhängige Gegenprobe (A8).

## 5. Owner-Entscheide und Auslegungen in diesem Chat [OWNER]

- **E208 K12-Ausnahme Lauf 017:** Die Ausnahme gilt nur für die 18 IDs in `eingang.py` (`AUSNAHME_K12`). Jede Wiederholung wird gegen die Liste nach der vorigen Zeile geprüft (K06). K12 gilt für alle anderen und alle künftigen Dateien ohne Ausnahme. Owner: «Ja, Ausnahme».
- **E209 Test P25 M07/M08:** nur die Eingabeliste angepasst. Owner: «Ja, anpassen».
- **E210 Auslegung, an Claude delegiert** (Owner: «Ja, so lösen»):
  1. N11 widerspricht A3: A3 verlangt `id`, `market`, `kohorte` und erlaubt `h_`-Spalten. N11 verbietet deshalb in Dateien neuer Angebote nur die Kennungen früherer Läufe (`r4_…`, `us_owner_…`, `v288_…`, `schutz_307`, `schutz_grund`, `e4_legacy_policy`, `gold`, `termin_status_20261109`). Neue Zeilen bekommen fest `schutz_307` NEIN, `schutz_grund` KEIN_SCHUTZ, `v288_geprueft` NEIN, `gold` NEIN (`vorgabe_neu`).
  2. `lieferform_json` ist Pflicht, sobald die Spalte im Master steht, also für Läufe ab 026 (in Lauf 022 gab es sie noch nicht).
  3. Pflicht für CH/AT/LI ist alles, was der Generator braucht: die Smart-Felder (`lieferform_json`, `preis_optionen`, `preis_budgetfaehig`, `preis_parser_status`) und alle Website-Felder ohne Eintrag in der Platzhaltertabelle (`anbieter`, `titel`, `url`, `beschreibung`, `zugang_text`, `country_roh`, `geprueft_am`, `pruefen_ab`, `fokus`, `angebotsart_roh`, `termin_text`, `release_herkunft`). E06 belegt, dass ein angenommenes CH-Angebot den Generator nicht abbrechen lässt.

Weitere Festlegungen von Claude im Rahmen der Spezifikation:
- Laufnummern 023–025 sind vergeben; 025 ist der Lieferform-Schritt. Die automatische Protokollzeile «überholt» (P24 A5) heisst im Altbestand weiter «überholt durch Paket NN» (bytegleich) und ab Lauf 026 «überholt durch Lauf NNN».
- K11 lehnt «wie oben», «dito» und «s. o.» als ganze Quelle ab, unabhängig von Gross- und Kleinschreibung.
- K14 und N10: Ein Regeltext, der das Anbieterland nennt, gilt nicht als Beleg (E030).
- Bei Dubletten (N07) verlangt `dedupe_freigabe` die ID eines Owner-Entscheids im Register (Art ENTSCHEID, Beleg OWNER).
- Nach der Gegenprüfung (§6): Ein Platzhalter-Code als neuer Wert («n/a», «NICHT_PUBLIZIERT» ausserhalb einer Codeliste) wird abgelehnt; für Unbekanntes gilt «nicht erfasst» (E031). Ein Wert «nicht erfasst» bekommt die Herkunft LEER (Master-Regel). Abgelöste Register-Einträge (ABGELOEST) sind nicht zulässig (K09). Bei CH-Zugang nach Regel E066 muss ein Durchführungsort CH bleiben (K14, N10). Nach einer Korrektur muss eine CH/AT/LI-Zeile die Pflichtwerte noch haben, die der Generator braucht (K07; `preis_optionen` ausgenommen, weil der Generator «nicht erfasst» als leere Liste liest). `market` muss zu `release_markt` passen (N03). `url_geprueft_am` darf auch bei Korrekturen nicht nach dem Laufdatum liegen (K13). Alle Regeln lässt der Altbestand unverändert durch; Master und Protokoll bleiben bytegleich.

## 6. Gegenprüfung durch getrennten Agenten

Ein getrennter Agent (QS, R10) hat Code, Tests und Testanpassungen geprüft und 3–5 eigene Angriffe in Kopien gebaut. Die Spezifikation konnte er nicht lesen, weil ihm das Projektwissen fehlte; er prüfte gegen Docstrings, LIESMICH und eine Zusammenfassung. Er bestätigte: alle Tests grün, `git status` unverändert, E05-Meldungen aus dem richtigen Grund, T08 bricht in allen 6 Fällen mit K06 an der Zielzeile ab, K12-Ausnahme genau 18 Paare, historische Hashes erhalten. **Urteil zuerst FAIL** wegen drei Blockern. Alle sind behoben und mit Fehlfällen belegt:

| Nr. | Befund | Erledigung |
|---|---|---|
| B1 | `release_markt` = «CH\|AT» wurde angenommen; das Angebot wäre still von der Website gefallen | Typ Land wertet `mehrfach` aus; `release_markt` als Codeliste mit genau einem Wert (K07-Fall) |
| B2 | Anzeigefeld mit leerem `neu`: Herkunft blieb gesetzt | leer wie «= Original»: Anzeigefeld und Herkunft leer (E06b) |
| B3 | Laufnummern 015, 019, 020 wurden angenommen und vor 021/022 eingeschoben | nur Altbestand 013, 014, 016, 017, 018, 021, 022 oder ab 026 (K01-Fall) |
| H4 | Korrektur konnte bei CH einen Pflichtwert auf «nicht erfasst» setzen, der Generator bräche ab | Pflichtprüfung nach dem Lauf (K07-Fall) |
| H5 | Platzhalter-Code als neuer Wert | abgelehnt (K07-Fall) |
| H6 | Herkunft bei «nicht erfasst» | LEER (Master bytegleich) |
| H7 | abgelöste Register-Einträge zulässig | abgelehnt (K09-Fall) |
| H8 | Ort CH entfernt, CH-Zugang nach E066 blieb | abgelehnt (K14- und N10-Fall) |
| H9 | `market` ≠ `release_markt`; K13 ohne Obergrenze des Datums | beide geprüft (N03-, K13-Fall); **offen:** Herkunftscode und Register-ID werden nicht gegeneinander geprüft (die Codes sind nicht immer an eine Register-ID gebunden, z. B. LIVE, REGEL); gemeinsame Herkunftsspalte von Ort und Sicherheitsgrad bleibt wie bisher |
| H10 | Überführung hätte Läufe ab 026 gelöscht | bricht dann ab |
| H11 | Test schrieb den Diff ins Repo | vergleicht nur noch mit der abgelegten Fassung |
| H12 | Lieferform-Schritt meldet im Prüfskript ohne Zeilenformat | bleibt (Abbruch mit Rückgabecode 1 und Meldung mit Feld; der Schritt hat keine Eingangsdatei) |

Drift laut Agent: keine; die Auslegungen E210 sind umgesetzt.

**Nachprüfung durch denselben Agenten: PASS mit Hinweisen.** Alle 8 Angriffe werden jetzt richtig behandelt, Test 13/13, `git status` unverändert. Die neuen Prüfungen lösen am ganzen Master (3'819 Zeilen) keine Fehlablehnung aus (0 Treffer je Regel). Hinweise: (a) Eine Korrektur `release_markt` CH → DE lässt `lieferform_json` gefüllt (nach P25 stünde bei DE «nicht erfasst»). Das war schon vorher so und ist für P27 vorgemerkt. (b) Die Überführung meldete einen nicht numerischen Dateinamen mit einem Python-Fehler statt mit ABBRUCH; das ist behoben. (c) Teilweise abgelöste Register-Einträge (z. B. E036, E137) bleiben zulässig, denn der Altbestand stützt sich auf E137.

## 7. Zweitmeinung ChatGPT

Owner-Upload 22.11. Urteil **HOLD**, nur die Spezifikation geprüft (kein Zugriff auf den Code). Abgleich:

| Nr. | Befund ChatGPT | Stand |
|---|---|---|
| B01 | nicht änderbare Spalten vs. Pflicht bei Neuanlage (A3/A4/N11) | erledigt mit E210: getrennte Berechtigungen `aenderbar` (K05) und `neu_zulaessig` (N11) |
| B02 | Überführung verletzt K12 (58 Zeilen, 18 Angebote) | erledigt mit E208: ausdrückliche Ausnahme nur Lauf 017; neu Test E01b, dass die Kette lückenlos und geordnet ist |
| B03 | Lauf 022 vor dem P25-Schritt ohne `lieferform_json` | erledigt mit E210 Punkt 2; Fehlfall N03 «CH ohne lieferform_json» in Lauf 026 |
| B04 | `preis_parser_status`, `release_markt` als Pflicht; Aufnahme in die Ausgaben prüfen | erledigt: beide in `pflicht_neu`; E06 prüft Datendatei und Smart-Datei |
| B05 | Prüfdatum bei NICHT_GEPRUEFT widersprüchlich | **eingearbeitet:** `url_geprueft_am` Pflicht nur bei OK und WEITERLEITUNG, bei NICHT_GEPRUEFT leer (K13; LIESMICH); Fehl- und Gutfall. Ändert A2 im Wortlaut; der Altbestand ist nicht betroffen (E098 hat einen Beleg, OK) |
| B06 | Dublettenfreigabe und Fehlfälle zu wenig festgelegt | erledigt bzw. ergänzt: Testmatrix mit 59 Fällen (Mutation, Regelkennung, Abbruchnachweis); neu ungültige Freigaben (Regel, unbekannte ID) abgelehnt, Owner-Entscheid angenommen |
| B07 | `build_master_p3.py` (SENT) nicht als Eingabe genannt | erledigt: in E03 ausdrücklich zugelassen und per strace belegt |
| B08 | Summe 3'663 statt 3'664 | bestätigt, schon in §2 U2 gemeldet |

## 8. Schema-Bericht (Grundlage P27) [GEPRÜFT]

`paket26/out/schema_bericht.csv`: Von 125 Spalten weichen 3 ab, zusammen 52 Zellen. Der Master bleibt unverändert (E031, bis P27).

| Spalte | Zellen | Art |
|---|---|---|
| `url` | 30 | mehrere Adressen in einer Zelle (DE/USA ohne eindeutige URL, E068) |
| `sprache` | 5 | Trennzeichen «/» bzw. « \| » statt «\|» |
| `format` | 17 | Trennzeichen « \| » statt «\|» |

## 9. Lieferung

(folgt mit dem Commit)

## 10. Offen und nächster Schritt

- **Owner:** Bericht und Nachtrag bestätigen (rund 5 Minuten).
- Nächstes Paket laut ZIELBILD §4: P27 (Master-Spalten Scope, Anbieter und Durchführungen, Trennzeichen nach §8, Platzhalter-Codes aus dem Suchtext, E201).
- Die Recherche Stufe 1 (E168) läuft ab jetzt nur noch über `eingang/` (Laufnummer ab 026).
