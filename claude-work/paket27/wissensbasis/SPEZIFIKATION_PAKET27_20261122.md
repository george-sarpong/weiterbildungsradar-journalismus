# SPEZIFIKATION PAKET 27 «Modell erweitern», 22.11.2026

Status: **vom Owner freigegeben 22.11.2026** (E217): Entscheid 1 A, 2 A, 3 A, 4 A, 5 A (§3; Register E213–E217). Zweitmeinung ChatGPT parallel, Befunde vor dem Commit einarbeiten.
Auftrag: Owner 22.11., Chat «weiter»; Plan GESAMTWISSENSSTAND §9 («Nächstes Paket: P27 … zuerst Spezifikation mit Testliste»).
Grundlage: `ZIELBILD_UNTERBAU_20261120.md` §2 B1, §3 Punkte 1–3, §4 Zeile P27; `BERICHT_PAKET26_20261121.md` §6 Hinweis (a), §8; `SPEZIFIKATION_PAKET26_20261121.md`; GESAMTWISSENSSTAND §2, §9; E029, E031, E043, E118, E122, E138, E171, E172, E192, E201, E205, E210.
Vorprüfung: Arbeitszweig `claude/datenharmonisierung`, Commit c8d390e (22.11., Wissensbasis nach Code-Commit 5c2b761), flach geklont 22.11.; Master SHA-256 cf9fdb2d…, Protokoll c82cef3d… (= Bericht P26). Nur gelesen, nichts geschrieben. Messskripte im Scratch, nicht im Repo.
Beleg: [GEPRÜFT] von Claude gezählt · [GELESEN] Original gelesen · [ZU BELEGEN] vor Umsetzung prüfen.
Ablage: Projektwissen `claude/SPEZIFIKATION_PAKET27_20261122.md`; Repo-Kopie `claude-work/paket27/wissensbasis/` mit der Umsetzung.

## 0. Einordnung und Driftprüfung

- P27 erweitert das Datenmodell um das, was die Recherche Stufe 1 (E168) braucht: eine **Anbieter-Kennung** für Zuordnung und Dubletten über Länder (E122) und für die Kernliste je Land (E171), die **Scope-Spalte** im Master (E205), **ein Trennzeichen** für Sprache und Kursform (Schema-Bericht P26 §8) und eine **berechnete Sichtbarkeit** als Grundlage für P28 (E172).
- Ziel: Website-Ausgabe gleich wie heute, bis auf 22 Trennzeichen in den Rohwerten (Anzeige, Filter und Suche gleich, Nachweis wie P25).
- **Nicht Teil von P27:** Kernliste je Land befüllen (Recherche); `url` mit mehreren Adressen (30 USA-Zellen, E068, Nachrecherche); Anbieterland aus dem Master entfernen; Ort als normierte Stadt, Dauer als Zahl und Einheit (später, ZIELBILD §3 Punkt 2); schlanke Auslieferung und nur Sichtbares ausliefern (P28, E172); Datei je Land, Filter-Reihenfolge (P29); Prüfliste und Abruf (P30); Release.
- Abweichung vom Plan (Entscheid 1): Die Platzhalter-Codes aus dem Suchtext (E201) brauchen eine App-Änderung. Vorschlag: mit den übrigen App-Änderungen in P29.

## 1. Befund [GEPRÜFT, 22.11., Commit c8d390e]

### 1.1 Anbieter

| Bestand | Zeilen | Schreibweisen roh | nach Normalisierung |
|---|---|---|---|
| alle Märkte | 3'819 | 1'301 | 1'295 |
| CH/AT/LI (Website) | 1'353 | 170 | 169 |
| DE | 111 | 35 | 35 |
| USA | 2'355 | 1'097 | 1'092 |

- Normalisierung wie P26 N07: NFKC, Gross/klein, Satzzeichen. Sie fasst 6 Gruppen zusammen: «Zürcher Hochschule der Künste (ZHdK)» / «… ZHdK» (CH) und 5 USA-Paare mit «/» bzw. «—» (z. B. «Northwestern University Medill» / «Northwestern University / Medill»).
- `r4_anbieter_id` ist bei allen 3'819 Zeilen leer. Eine Anbieter-Kennung gibt es nicht.
- `anbieter_land` ist je normalisiertem Anbieter widerspruchsfrei (0 Anbieter mit zwei Ländern). CH/AT/LI: 168 von 169 Anbietern mit Land (CH 125, AT 32, LI 5, DE 4, IT 1, FR 1; 1 «nicht erfasst»).
- Ein Anbieter steht in zwei Märkten: Deutsche Journalisten Akademie (CH und DE, E070).
- Grösste Anbieter CH/AT/LI: MAZ 139, ORSYS 111, Dawan 86, NobleProg 59, Mediencampus 56, Digicomp 55 Angebote.

### 1.2 Durchführungen

- `durchfuehrungen` (JSON-Liste) bei 42 Angeboten mit 118 Einträgen; Teilfelder `startDate`, `endDate`, `label` (je 118), `region` (43). `durchfuehrungen_anzeige` bei 18.
- Sonst je Angebot `start_datum` (646 gefüllt), `end_datum` (537), `termin_text` (Freitext).
- Ort und Kursform stehen nur am Angebot (`ort_text`, `durchfuehrungsort_land`, `format`), ausser `region` in 43 Einträgen. Eine echte Durchführungstabelle mit Ort und Kursform je Termin liesse sich aus den Daten nicht füllen, ohne zu erfinden (E031).

### 1.3 Sprache, Kursform, Währung

- `sprache`: 22 Zellen in CH/AT mit mehreren Werten, davon 5 mit abweichendem Trennzeichen (AT-PROD-OFFER-208 «DE/EN»; OFFER-AJM-001, -002 «FR | EN»; OFFER-CORSO-001, -002 «IT | FR | EN»).
- `format`: 17 Zellen in CH mit « | » (CAD-002, 15 NobleProg, PCC-P33).
- Die App trennt bei Anzeige und Filter tolerant (`/\s*\|\s*/`, bei Sprache auch «/»; app-v43.js Z. 182, 224, 1679). Anzeige und Filter bleiben nach der Vereinheitlichung gleich; im Suchtext fällt nur das Leerzeichen um «|» weg.
- Währung: 1'179 Preisoptionen, CHF 802, EUR 140, ohne Währung 237 (alle ohne Betrag: NOT_PUBLISHED 183, FREE 45, ON_REQUEST 7, NOT_APPLICABLE 2). Kein Angebot hat zwei Währungen.

### 1.4 Sichtbarkeit

- Die App zeigt ein Angebot, wenn es nicht HOLD ist und aktuell (app-v43.js Z. 125–134: mit Durchführungen ein künftiger Termin, sonst Ende ≥ heute bzw. Start ≥ heute). Durchführungen = `durchfuehrungen_anzeige`, sonst `durchfuehrungen` (Generator).
- Dieselbe Regel in Python auf dem Master ergibt: 20.11.2026 **1'006** (= Paket 19 und 25), 22.11. 998, 01.12. 945, 20.12. 860, 01.03.2027 795 (= ZIELBILD §2 B5).
- `beta_sichtbar` ist gespeichert, nicht berechnet: JA 3'441, NEIN 378; DE/USA 2'139 «JA» (Stand Paket 4, durch E074 überholt). Gelesen wird die Spalte nur von Tests und Bauskripten früherer Pakete, nicht vom Generator.

### 1.5 Offene Punkte aus P26

- Scope-Code steht nur in der Eingangsdatei (E205: «Master-Spalte kommt mit P27»); im Master hat ihn 1 Angebot (OFFER-DIGICOMP-075, PRAXIS_E005).
- Lieferform bei Marktwechsel (Bericht P26 §6 Hinweis a): Eine Korrektur `release_markt` CH → DE lässt `lieferform_json` gefüllt.
- Platzhalter-Codes im Suchtext (E201): in `data-p25.js` u. a. `format` NICHT_PUBLIZIERT 200, `duration` NOT_PUBLISHED 27, `region` NOT_PUBLISHED 9, `language` NOT_PUBLISHED 24, `priceDisplay` 40 Werte mit Code. Die App durchsucht diese Felder roh (app-v43.js Z. 988–991, 1655–1670). Entfernen geht nur mit App-Änderung.

## 2. Soll

**A1 Modellschritt P27.** Fester Schritt **026** nach dem Lieferform-Schritt 025, vor den Läufen ab 027 (Laufnummer 026 ist noch nicht vergeben; K01 neu: Läufe ab 027). Er hängt 5 Spalten an: `anbieter_id`, `h_anbieter_id`, `scope_code`, `scope_begruendung`, `h_scope_code` (125 → 130). Eine Protokollzeile je gesetzter Zelle.

**A2 Anbieter-Tabelle** `claude-work/daten/anbieter.csv` (Entscheid 2):
- Spalten: `anbieter_id`, `name`, `schreibweisen` (alle Master-Schreibweisen, mit `|`), `sitzland`, `sitzland_beleg`, `herkunft`, `register_id`, `quelle`.
- Kennung `ANB-0001` ff., vergeben in Master-Reihenfolge des ersten Vorkommens, danach fest. `name` = häufigste Schreibweise.
- Erstfassung maschinell aus dem Master (`paket27/scripts/bau_anbieter.py`, dokumentiert, läuft nicht im Build): 1'295 Anbieter; die 6 Zusammenführungen aus §1.1 im Bericht gelistet.
- `sitzland` = `anbieter_land` der Angebote (widerspruchsfrei, §1.1), `sitzland_beleg` aus `anbieter_land_beleg`.
- Schritt 026 setzt `anbieter_id` je Master-Zeile über `schreibweisen`; eine Zeile ohne Treffer oder mit zwei Treffern → Abbruch.
- Der Master-Text `anbieter` bleibt unverändert (so wie publiziert); `anbieter_land` bleibt im Master. Neue Prüfregel **K15**: `anbieter_land` = `sitzland` der Kennung, sonst Abbruch.

**A3 Eingang Anbieter** `NNN_JJJJMMTT_anbieter.csv` (Entscheid 2 A): eine Zeile = ein neuer Anbieter oder eine Korrektur einer Anbieter-Zelle. Innerhalb einer Laufnummer zuerst Anbieter, dann Korrekturen, dann neue Angebote. Regeln B01–B08 (§5). Neue Angebote: `anbieter_id` Pflicht und in der Tabelle; neue Schreibweise nur über eine Anbieter-Zeile.

**A4 Scope-Spalten** (E205): `scope_code` aus der Steuerspalte der Datei neuer Angebote; ab Lauf 027 ist `scope_code` normale Master-Spalte (Codeliste aus P26, korrigierbar über K). Bestehende 3'818 Zeilen «nicht erfasst», Herkunft LEER (E031, nichts zuordnen ohne Prüfung). OFFER-DIGICOMP-075: PRAXIS_E005 aus Lauf 022.

**A5 Trennzeichen** über den Eingang, Lauf **027** `027_<Datum>_korrekturen.csv`: 22 Zeilen (sprache 5, format 17), nur das Trennzeichen wird `|` ohne Leerzeichen, Reihenfolge der Codes bleibt. Herkunft `NORMIERUNG_P27` (neuer Code in `eingang_herkunft.csv`), Register-ID des Freigabe-Entscheids. Danach Schema-Bericht `sprache` 0, `format` 0; K07 lehnt « | » und «/» ab (heute nur für neue Werte, A4 P26).

**A6 Durchführungstabelle** (Entscheid 3 A): Ausgabe `paket27/out/durchfuehrungen.csv`, bei jedem Build neu aus dem Master, keine Quelle. Eine Zeile je Eintrag aus `durchfuehrungen_anzeige` bzw. `durchfuehrungen`, sonst eine Zeile je Angebot mit `start_datum` oder `end_datum`. Spalten: `angebot_id`, `nr`, `start`, `ende`, `label`, `region`, `quellfeld`. Nur vorhandene Werte, nichts abgeleitet.

**A7 Sichtbarkeit berechnet** `scripts/sichtbarkeit.py`: Funktion `sichtbar(zeile, stichtag)` nach §1.4 (Markt CH/AT/LI, nicht HOLD, aktuell). Aufruf mit Stichtag schreibt `paket27/out/sichtbarkeit_<Stichtag>.csv` (ID, sichtbar, Grund). `beta_sichtbar` und `beta_grund` bleiben unverändert als historische Spalten (Stand Paket 4) und werden von P27 nicht gelesen. Grundlage für P28 (E172).

**A8 Währung:** kein eigenes Feld. Die Währung steht schon je Preisoption; ein zweites Feld könnte widersprechen. Neue Prüfregel **K16**: höchstens eine Währung je Angebot (heute 0 Verstösse).

**A9 Lieferform bei Marktwechsel:** `lieferform_json` darf in allen Märkten stehen; Pflicht nur CH/AT/LI (wie P26 E210). Bei CH → DE bleibt der Wert stehen; er wird gebraucht, sobald DE auf die Website kommt (E168). DE → CH ohne Lieferform bleibt Abbruch (P26 H4). Nur im LIESMICH festhalten, keine Code-Änderung.

**A10 Generator** unverändert, Ausgabe nach `paket27/website/data-p27.js` und `paket27/out/smart-search-data-p27.json` (Parameter `--daten`, `--smart`). Website-Kandidat `paket27/website/` wie P25 (Seiten und `app-v43.js` aus `paket22/website/`, Liste zum Stichtag).

**A11 Bestehende Tests** (wie E199, E209): Spaltenzahl 125 → 130 und Laufnummern ab 027 in `test_paket24.py`, `test_nachtraege.py`, P25 Master und P26; Sollwerte für `data-p25.js` um die 22 Trennzeichen ergänzt, wo ein Test den neu gebauten Master liest. Historische Hashes, Sollwerte und Prüfabsichten bleiben. Diff im Bericht. Weitere Anpassungen nur nach Rückfrage.

**A12 Unverändert:** Basis `master_3818.csv`, bisherige 125 Spalten (ausser den 22 Zellen A5), bisherige 6'776 Protokollzeilen, `generator_website.py`, `app-v43.js`, `paket19/`, `paket22/`, `paket25/website/`, Altdateien, Website live.

**A13 Wissensbasis:** Bericht, Register, GESAMTWISSENSSTAND §2, §3, §4, §9, §10; `eingang/LIESMICH.md` um Anbieter-Datei, Scope-Spalte, Lieferform-Regel ergänzt.

## 3. Entscheide (Owner)

**Entscheid 1 – Platzhalter-Codes im Suchtext (E201)** → **A** (E213)
- **A (gewählt):** in P29 mit den übrigen App-Änderungen (Filter-Reihenfolge, Datei je Land); P27 bleibt ohne App-Änderung und lässt sich mit dem Gleichheitstest abnehmen. E201 gilt bis dahin weiter (Wirkung nur bei Code-Wörtern).
- B (nicht gewählt): jetzt in P27 mit `app-v44.js`; dann zusätzlich Stufe 1 und 2, Browser- und Suchvergleich (60 Anfragen).

**Entscheid 2 – Anbieter-Tabelle** → **A** (E214)
- **A (gewählt):** eigene Tabelle als Quelle (A2) mit eigener Eingangsdatei (A3). Neue Anbieter und die Kernliste je Land (E171) kommen dort hinein, bevor die Angebote recherchiert werden. Messbar für den Beta-Ausstieg (E181: 90–100 % der Kernliste).
- B (nicht gewählt): nur Spalte `anbieter_id` im Master; die Tabelle ist eine Übersicht, bei jedem Build abgeleitet. Weniger Aufwand, aber Kernliste und Anbieter-Angaben haben keinen festen Ort.

**Entscheid 3 – Durchführungstabelle** → **A** (E215)
- **A (gewählt):** abgeleitete Tabelle bei jedem Build (A6); Quelle bleibt der Master. Grund: Ort und Kursform stehen nur am Angebot (§1.2), eine Quelltabelle hätte heute fast nur leere Felder.
- B (nicht gewählt): eigene Quelltabelle mit eigener Eingangsdatei; `durchfuehrungen`, `start_datum`, `end_datum` wandern aus dem Master. Grösserer Umbau, Generator und Eingang ändern.

**Entscheid 4 – Kleinere Festlegungen** → **A** (E216) (A4 alte Zeilen «nicht erfasst», A5 Trennzeichen über Lauf 027, A7 `beta_sichtbar` bleibt historisch, A8 kein Währungsfeld, A9 Lieferform bleibt bei Marktwechsel)
- **A (gewählt):** alle so übernehmen.
- B (nicht gewählt): einzeln besprechen.

**Entscheid 5 – Freigabe** → **A** (E217)
- **A (gewählt):** freigegeben samt Testanpassung nach A11; Zweitmeinung ChatGPT parallel, Befunde vor dem Commit einarbeiten (wie E207); kein Release.
- B (nicht gewählt): erst nach Zweitmeinung.

Quelle: Owner-Antworten 22.11., Chat «weiter» (Auswahl je «A»).

## 4. Prüfschritte vor der Umsetzung (nur lesen)

U1 Zweig auf c8d390e oder jünger ohne Änderung an `paket3/out/`, `scripts/`, `eingang/`; Master cf9fdb2d69d6e2a908c08889655b7cf923cdcb8a618c2341b84f5c98b8adad92, Protokoll c82cef3df6c81045006bc1911973e01cfb88805a592d65098150a4ec3dd274b8; sonst anhalten.
U2 Zählungen §1 wiederholen; weicht eine ab, anhalten und melden.
U3 Sichtbarkeit Python gegen `app-v43.js` in jsdom mit `data-p25.js` an den 5 Stichtagen §1.4: gleiche ID-Mengen. Sonst anhalten.
U4 Die 6 Zusammenführungen (§1.1) einzeln ansehen; ist eine fraglich (z. B. verschiedene Einheiten einer Hochschule), anhalten und fragen.
U5 Wer liest `beta_sichtbar` heute (Tests Pakete 3, 8, 24, Bauskripte)? Bestätigen, dass P27 keinen dieser Leser ändert.

## 5. Testliste (Abnahme)

**Regeln Eingang Anbieter.** Je Regel mindestens ein Fehlfall, abgelehnt mit Rückgabecode ≠ 0, Meldung mit Datei, Zeile, Spalte, Regel; Master, Tabelle, Protokoll und Ausgabeordner bytegleich.

| Nr. | Regel |
|---|---|
| B01 | Dateiname nach A3, Form wie K02 |
| B02 | neue `anbieter_id` Muster `ANB-\d{4}`, fortlaufend, nicht vorhanden; Korrektur: Kennung vorhanden |
| B03 | `name` nicht leer; Schreibweise (normalisiert) bei keinem anderen Anbieter |
| B04 | `sitzland` ISO-3166-1 oder «nicht erfasst»; mit Land Pflicht `sitzland_beleg` (E065, E118) |
| B05 | `herkunft`, `register_id`, `quelle` wie K08, K09, K11 |
| B06 | Korrektur `sitzland`: nach dem Lauf `anbieter_land` aller Angebote gleich, sonst Abbruch (Korrektur der Angebote in derselben Laufnummer) |
| B07 | neues Angebot: `anbieter_id` Pflicht, in der Tabelle, `anbieter` ist eine ihrer Schreibweisen |
| B08 | Anbieter ohne Angebot zulässig (Kernliste vor Recherche, Entscheid 2 A) |

**Abnahme**

| Nr. | Prüfung | Erwartung |
|---|---|---|
| P01 | Master-Form | 3'820 Zeilen inkl. Kopf × 130 Spalten; die 125 bisherigen Spalten gleich wie cf9fdb2d… ausser den 22 Zellen A5 |
| P02 | Protokoll | die 6'776 bisherigen Zeilen bytegleich vorne; neu genau 3'842 Zeilen: 3'819 `anbieter_id` (Herkunft `ANBIETER_TABELLE_P27`), 1 `scope_code`, 22 Trennzeichen |
| P03 | Anbieter-Tabelle | 1'295 Anbieter; jede Master-Zeile genau eine Kennung; Zählung vorher/nachher im Bericht (ZIELBILD §4); die 6 Zusammenführungen gelistet |
| P04 | Anbieterland | `anbieter_land` = `sitzland` für alle 3'819 Zeilen; Fehlfall abgelehnt |
| P05 | Regeln B01–B08 | je Regel ein Fehlfall wie oben; Gutfall: neuer Anbieter ohne Angebot, danach neues Angebot dieses Anbieters in Lauf 028 einer Testkopie |
| P06 | Scope | OFFER-DIGICOMP-075 PRAXIS_E005, übrige «nicht erfasst»; Korrektur `scope_code` ab Lauf 027 angenommen, ungültiger Code abgelehnt |
| P07 | Trennzeichen | Schema-Bericht: `sprache` 0, `format` 0, `url` 30 (bleibt, E068); Fehlfall « | » abgelehnt |
| P08 | Durchführungen | Zeilen = 118 + Angebote mit Datum ohne Liste (Zahl im Bericht); jede Zeile mit `quellfeld`; kein Wert, der nicht im Master steht |
| P09 | Sichtbarkeit | `sichtbarkeit.py` = `app-v43.js` in jsdom mit `data-p27.js` an 20.11., 22.11., 01.12., 20.12.2026, 01.03.2027: gleiche ID-Mengen (1'006 am 20.11.) |
| P10 | Währung | Regel «eine Währung je Angebot»: 0 Verstösse am Bestand; Fehlfall abgelehnt |
| P11 | Lieferform | Testkopie: CH → DE angenommen, `lieferform_json` bleibt; DE → CH ohne Lieferform abgelehnt |
| P12 | Generator | `data-p27.js` = `data-p25.js` bis auf die 22 Rohwerte; Smart-Datei bytegleich mit 6e7ec9cd…; Anzeige-Vergleich wie P25 (Karten, Filter, Smart-Suche 60 Anfragen an 20.11., 22.11., 01.12.) gleich |
| P13 | Reproduzierbarkeit | zwei Läufe aus frischen Ordnern bytegleich (Master, Tabelle, Protokoll, Ausgaben) |
| P14 | bestehende Tests | nach A11: `test_paket24.py`, `test_nachtraege.py`, P25 Master und Generator, P26 grün; Diff im Bericht |
| P15 | Unverändert | Basis, Altdateien, `paket19/`, `paket22/`, `paket25/website/`, `app-v43.js` (SHA-256 vorher = nachher) |

Stufe 1 und 2 und Browser-Tests entfallen bei Entscheid 1 A: Die App bleibt gleich, und P12 belegt gleiche Anzeige. Bei 1 B kommen sie dazu.

## 6. Lieferung und Aufwand

- Commits auf `claude/datenharmonisierung`, nie `main` (E041); Push braucht Schreibrecht wie E191.
- `BERICHT_PAKET27_<Datum>.md` mit Testergebnissen, Gegenprüfung durch getrennten Agenten, Abgleich Zweitmeinung; Register und GESAMTWISSENSSTAND (A13).
- Kein Release.
- Zeit: Claude eine bis zwei Arbeitssitzungen; Owner rund 5 Minuten für die Entscheide, später rund 5 Minuten für den Bericht.

## 7. Prüfung nach Fachrollen (FACHROLLEN.md Fassung 3)

| Rolle | Prüffrage | Ergebnis |
|---|---|---|
| R0 Produkt und Betrieb | Dient P27 dem Beta-Ausstieg (E181)? | ja: Anbieter-Kennung und Kernliste machen die Abdeckung messbar (Entscheid 2 A) |
| R1 Fachredaktion | Scope sichtbar im Master (E205)? | A4 |
| R2 Daten | nichts erfunden, Herkunft je Zelle, keine stillen Änderungen | A2, A4–A6; P02, P08 |
| R4 Build | ein Weg, Abbruch vor dem Schreiben, reproduzierbar | A1, A3; P05, P13 |
| R10 QS | jede neue Regel mit Fehlfall, getrennte Prüfung | §5; getrennter Agent; Zweitmeinung |
| übrige Rollen | – | nicht betroffen bei Entscheid 1 A (keine Änderung an App, Auslieferung, Datenschutz) |

## 8. Bei Punkten ausserhalb dieser Spezifikation

Anhalten und fragen (wie E158).
