# BERICHT PAKET 24 «Master nachführen» – 20.11.2026

Status: **umgesetzt, getestet, Zweitmeinung ChatGPT eingearbeitet (§5a), committet auf `claude/datenharmonisierung` (nur lokal, Lieferung als Git-Bundle, §7).** Register und GESAMTWISSENSSTAND nachgeführt (E183–E190).
Grundlage: `SPEZIFIKATION_PAKET24_20261120.md`, freigegeben 20.11. (E183, Entwurf). Arbeitszweig `claude/datenharmonisierung`, Basis 9fd113f.
Beleg: [GEPRÜFT] von Claude gezählt oder getestet.

## 1. Ergebnis in einem Satz

Der Master `paket3/out/master_3818_aktuell.csv` trägt jetzt jede Angabe der Live-Website: 0 statt 1'068 Abweichungen in 25 Feldern bei 1'353 Angeboten; die Originalfelder sind unverändert [GEPRÜFT, T01, T06].

## 2. Prüfschritte vor der Umsetzung (U1–U3)

- **U1** Zählung wiederholt: Termin 377, Ort 340, Dauer 292, Preis 36, Durchführungen 18 Angebote, Sperren 5 (Status und Grund), 671 Angebote; gleich wie Spezifikation §1 [GEPRÜFT].
- **U2** AT-PROD-OFFER-173: Die Karte zeigt mit `app-v43.js` (jsdom, 20.11.) «Preis: keine Angabe», keinen Rohcode; auf keiner sichtbaren Karte steht ein Rohcode. Nur gemeldet, keine Änderung [GEPRÜFT].
- **U3** `paket19/website/data-p19.js` = live: SHA-256 fc0fc6f9… im Browser mit `fetch` ohne Zwischenspeicher bestätigt (Last-Modified 20.11. 01:04 GMT) [GEPRÜFT].

## 3. Umsetzung

- `scripts/master_nachtraege.py`: 10 neue Spalten am Ende (113 → 123): `termin_anzeige`, `ort_anzeige`, `dauer_anzeige`, `preis_anzeige`, `durchfuehrungen_anzeige`, je mit `h_…`; leer = Original gilt (A1, A2). Reihenfolge 13, 14, 16, 17, 18, 21, 22 (A4). Altwert-Prüfung mit der Platzhalterregel `SENT`, gelesen aus `build_master_p3.py` (eine Quelle, A6). Paket 21 prüft beim Ort zusätzlich den Website-Altwert gegen die aktuelle Anzeige und leert ein früheres Anzeigefeld (A5). Sperren E103/E142 auch in `publikationsstatus`/`-grund` (A3).
- Herkunft: ANZEIGE_E113 (Paket 16, 132 Protokollzeilen), ANZEIGE_E114 (Paket 17, 1'070); 93 Zeilen «überholt durch Paket 21» (A7). Protokoll 4'118 → 5'423 Zeilen.
- `scripts/test_paket24.py` neu (T01–T14), Aufruf in `scripts/run_paket3.sh` nach `test_nachtraege.py` (A8).
- `scripts/test_nachtraege.py`: N01 auf 10 neue Spalten (A8). **Abweichung von A8, vom Owner am 20.11. bestätigt (E189, Entwurf):** N02 zählt nur noch die 113 bisherigen Spalten (die neuen prüft T03); N03 prüft die letzte Protokollzeile je Zelle und dass die Zeilen je Zelle lückenlos anschliessen, weil eine Zelle jetzt mehrmals geändert werden kann (16 → 17, 17 → 21).
- Unverändert: Basis `master_3818.csv`, alle Website-Dateien, Smart-Datei. Kein Release, kein Upload, kein kostenpflichtiger Lauf.
- Ausgaben: `master_3818_aktuell.csv` SHA-256 e5afa29cde40b712…, Protokoll 15a7520c02b8b4fa….

## 4. Tests [GEPRÜFT, 20.11.]

`test_paket24.py` **14/14 PASS**, `test_nachtraege.py` **14/14 PASS**.

| Nr. | Ergebnis |
|---|---|
| T01 | 3'819 Master-Zeilen, 1'353 Website-IDs, keine Dublette, jede Website-ID genau einmal; 33'825 Feldwerte (1'353 × 25), 0 Abweichungen (vorher 1'068 fallbezogen); jedes Website-Feld zugeordnet; Durchführungen als Struktur mit Reihenfolge verglichen. Ausgewiesen: 4'943 Feldwerte nur über `SENT` gleich, davon 4'172 Website leer/fehlend und 771 Website mit Platzhalter-Code (NICHT_PUBLIZIERT 514, PREIS_NICHT_PUBLIZIERT 202, NOT_PUBLISHED 54, NICHT_VERIFIZIERT_FUER_AKTUELLEN_KATALOGTERMIN 1 = AT-PROD-OFFER-173 Preis); die App zeigt diese als «keine Angabe» (E086, E093) |
| T02 | gesetzte Anzeigefelder = unabhängig ermittelte Sollmenge (ID × Feld, wo Website ≠ Original): Termin 377 · Ort 340 · Dauer 292 · Preis 36 · Durchführungen 18 = 1'063 |
| T03 | jede der 1'202 Korrekturen (Paket 16: 132, Paket 17: 1'070) genau eine Protokollzeile mit ID, Feld bzw. JSON-Pfad, Paket (Herkunft), Register-ID, Quelle, alt, neu; bei Durchführungen ändert jede Zeile nur ihren Pfad; Kette je Zelle lückenlos bis Master-Wert und Herkunft; 6 Termine mit Paket 16 und 17; leer ⇔ Herkunft leer |
| T04 | 5 konkrete Sperren HOLD, Grund = Website, Herkunft OWNER_E103 (AT-PROD-OFFER-026, -040) bzw. OWNER_E142 (DIGICOMP-033, -041, -044) |
| T05 | `beta_sichtbar` JA 3'441 · NEIN 378 |
| T06 | 113 Originalspalten = Stand 9fd113f, ausser Status/Grund und deren h_-Felder der 5 IDs (20 Zellen) |
| T07 | 93 überholte Ortskorrekturen = Sollmenge aus den Korrekturdateien (Ortskorrektur Paket 17 ∩ Ort Paket 21); Paket 21 prüfte Website-Altwert gegen die Anzeige aus Paket 17; Anzeigefeld und Herkunft leer, frühere Herkunft im Protokoll |
| T08 | Abbruch in 6 Fällen (Paket 17 Termin, Durchführung, Kette 16 → 17; Paket 21 Ort gegen Anzeige und gegen Original; Paket 22 am Ende); Ausgabeordner inkl. früherer Ausgaben bytegleich, keine neuen Dateien |
| T09 | zwei unabhängige Builds aus frischen Ordnern bytegleich und gleich der Repo-Ausgabe; SHA-256 der 12 Eingaben in §5a |
| T10 | 4'118 Protokollzeilen der Pakete 13, 14, 18, 21, 22 identisch |
| T11 | `test_nachtraege.py` 14/14 |
| T12 | Basis bytegleich |
| T13 | 10 Website-Dateien inkl. `.htaccess` und Smart-Datei unverändert |
| T14 | 3'820 Zeilen, je 123 Spalten, UTF-8 mit BOM, LF |

Weitere Leser des Masters: `paket19/tests/test_paket19.js` vergleicht nur vorher/nachher im eigenen Lauf, `paket21/scripts/korrekturen_p21.py` liest Spalten nach Namen; beide nicht betroffen.

## 5. Gegenprüfung (getrennter Agent, R10)

Unabhängig nachgerechnet: 0 Abweichungen, 20 geänderte Originalzellen (nur die Sperren), keine stille Überschreibung, kein Anzeigefeld gleich dem Original, Protokollketten lückenlos, 8 eigene Abbruchfälle korrekt, reproduzierbar. Befunde: 2 «sollte» (Abbruchtest zu schmal; N03 ohne Kettenprüfung), beide behoben; 4 Hinweise, davon 2 umgesetzt (sauberer Abbruch bei fehlender Durchführungsliste; T01 prüft, dass jedes Website-Feld zugeordnet ist), 2 ohne aktuellen Fall belassen (Gleich-Original-Regel ohne `SENT`; Altwert-Regel mit `SENT` gilt jetzt für alle Pakete, wie A6 verlangt).

## 5a. Zweitmeinung ChatGPT (Owner-Upload 20.11.)

Urteil ChatGPT: HOLD, 4 blockierend, 1 sollte. ChatGPT prüfte nur die Spezifikation, nicht den Code («statische Spezifikationsprüfung»). Abgleich mit der Umsetzung:

| Befund | Umsetzung (schon vorher) | Ergänzt nach der Zweitmeinung |
|---|---|---|
| B01 Herkunft zusammengesetzter Werte | Herkunftsfeld = letzte wirksame Korrektur; ganze Kette im Protokoll (eine Zeile je Korrektur, JSON-Pfad in der Quelle, Herkunft nennt das Paket); überholte Zeilen mit leerer Herkunft und Vermerk | T03 rekonstruiert jede Anzeige aus Korrekturdateien und Protokoll, prüft je Durchführungszeile den einzigen geänderten Pfad |
| B02 Speicherort Herkunft der Sperren | in den bestehenden Spalten `h_publikationsstatus`, `h_publikationsgrund`; T06 lässt genau diese 20 Zellen zu | T04 prüft die 5 IDs einzeln mit E103/E142 |
| B03 Reihenfolge und Altwert | A: alt gegen Original; B (16 → 17): alt gegen die Anzeige des Vorgängers; C (Paket 21): Master-Altwert gegen das Original **und** Website-Altwert gegen die aktuelle Anzeige; `SENT` nur, wenn der Vergleichswert «nicht erfasst» ist; beim Leeren auch h_ leer, frühere Herkunft im Protokoll (`h_alt`); Überholung als eigene Zeile, darum bleiben die Zeilen von Paket 21 unverändert (T10) | T08 mit Negativfällen für A, B, C; Positivfälle T02, T03 (6 Ketten), T07 |
| B04 Strenge der Abnahme | T01 vergleicht Website-Referenz gegen Master ohne Produktionslogik | T01 Identität und Dubletten, 33'825 Feldwerte, Ausweis der `SENT`-Gleichsetzungen, Durchführungen strukturell; T02 und T07 gegen unabhängig ermittelte Sollmengen |
| B05 Reproduzierbarkeit, Abbruch | Abbruch vor jedem Schreiben | T09 zwei frische Builds; T08 prüft Master, Protokoll und Ordner bytegleich, auch Fehler am Ende der Folge; Ausgangscommit 9fd113f; vollständige Hashes unten |

Ergebnis: Kein Befund verlangte eine Änderung am Datenmodell oder an der Ausgabe; Master und Protokoll sind bytegleich wie vor der Zweitmeinung. Die Spezifikation selbst bleibt unverändert; dieser Abschnitt hält den präzisierten Verarbeitungs- und Prüfvertrag fest.

Referenzwerte (SHA-256, vollständig): `data-p19.js` live = Repo fc0fc6f9c245a4cb867ec4bfa19e05ccf6dd18f5bacf901203811b0bb3b14d61 · Ausgabe `master_3818_aktuell.csv` e5afa29cde40b7129ca3797a537fcc61adb40610f1b03ceecff205e770d78b58 · Protokoll 15a7520c02b8b4fa0019e1c29dabcf2b5fc3a036b810e1987962ee630a4d1b78 · Eingaben: `master_nachtraege.py` 5a9671c2ca4470aa8927a91030c4935e5611a422e1777af1b3915a997f189861, `build_master_p3.py` fce592dc757425171a72b01e3e7585d688228260d6fba0a381ec7e091358a414, `master_3818.csv` a013ba468195c690b770113237b8a4bfaf817389bcd6b186e9dd06d4b5f18639, Korrekturen P13 3ecefb3ca879bc4a…, P14 18ced79c25d9989b…, P16 66dad2155c249801…, P17 54e453343ff5d982…, P17 Preis da172a74ddc3cedeab…, P18 b768b7067243d683…, P21 0bf1fd0646bb3e8a…, P22 902ac7ae117d20dd…, neue Angebote P22 30aee111856462b7… (vollständig: Ausgabe `INFO T09` von `test_paket24.py`).

## 6. Owner-Entscheide 20.11. (im Register als E183–E190)

- **E183** Spezifikation Paket 24 freigegeben; Zweitmeinung ChatGPT parallel, Befunde vor dem Commit.
- **E184** FACHROLLEN.md Fassung 3 bestätigt.
- **E185** Nachträge Paket 23 und E171–E182 im GESAMTWISSENSSTAND bestätigt.
- **E186** Aufwand E177 rund 1,5 Std. pro Monat in Ordnung (präzisiert E177).
- **E187** Messkriterien Beta-Ausstieg später, spätestens vor P30; Vorschlag Übergabe §4 bleibt Entwurf.
- **E188** KI-Einsatz auf der Methodik-Seite offenlegen; Claude legt den Wortlaut zur Freigabe vor; Umsetzung mit einem späteren Release.
- **E189** Tests N02 und N03 in `test_nachtraege.py` zusätzlich zu N01 angepasst (Abweichung von Spezifikation P24 A8).
- **E190** (BEFUND) Paket 24 umgesetzt; Zweitmeinung ChatGPT (HOLD, B01–B05) mit verschärften Tests T01–T04, T07–T09 eingearbeitet, ohne Änderung der Ausgabe; Commit lokal, Lieferung als Bundle.

Quelle E183–E189: Owner-Antworten 20.11., Chat «Start nach Übergabe 20.11.»; E190: dieser Bericht.

## 7. Offen

1. Lieferung: Push wurde in diesem Chat abgelehnt; Commit liegt als Git-Bundle `paket24_20261120.bundle` vor (Voraussetzung 9fd113f). Push-Recht für Claude oder Bundle einspielen (wie Paket 20, GESAMTWISSENSSTAND §10 Punkt 15).
2. Projektregel 7 an E173 anpassen (Owner, Projektanweisungen; Wortlaut Übergabe §6 Schritt 1). Stand 20.11. nachmittags: Regel 7 nennt noch «mit Rollback».
3. Wortlaut KI-Offenlegung Methodik-Seite (E188) vorlegen, Umsetzung mit einem späteren Release.
4. Nächstes Umbaupaket P25 (Generator Master → Website), ZIELBILD §4; erst Spezifikation, dann Freigabe.
