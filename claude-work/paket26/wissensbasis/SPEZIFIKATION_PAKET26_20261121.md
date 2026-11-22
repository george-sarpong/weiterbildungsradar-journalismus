# SPEZIFIKATION PAKET 26 «Eingangsformat», 21.11.2026

Status: **vom Owner freigegeben 21.11.2026** (E207): Entscheid 1 A, 2 B, 3 A, 4 A, 5 A (§3; Register E203–E207). Zweitmeinung ChatGPT parallel, Befunde vor dem Commit einarbeiten.
Auftrag: Owner 21.11. (Auswahl «Spezifikation P26»; Plan GESAMTWISSENSSTAND §9: «erst Spezifikation mit Testliste, Umsetzung nach Freigabe»).
Grundlage: `ZIELBILD_UNTERBAU_20261120.md` §2 B2 (Lücke L2), §3 Punkt 4, §4 Zeile P26; `BERICHT_PAKET25_20261121.md`; `SPEZIFIKATION_PAKET24_20261120.md` (A4, A5: Anzeigefelder); GESAMTWISSENSSTAND §2; E029, E030, E031, E035, E047, E066, E138, E143, E172, E178, E179, E180, E202.
Vorprüfung: Arbeitszweig `claude/datenharmonisierung`, Commit 8e1c715 (21.11., Wissensbasis P25 nach Code-Commit b895b50), flach geklont 21.11.; nur gelesen, nichts geschrieben. Messskripte im Scratch, nicht im Repo.
Beleg: [GEPRÜFT] von Claude gezählt · [GELESEN] Original gelesen · [ZU BELEGEN] vor Umsetzung prüfen.
Ablage: Projektwissen `claude/SPEZIFIKATION_PAKET26_20261121.md`; Repo-Kopie `claude-work/paket26/wissensbasis/` erst, wenn Claude wieder auf den Arbeitszweig schreiben darf (Push in diesem Chat abgelehnt).

## 0. Einordnung und Driftprüfung

- P26 schliesst Lücke L2: Es gibt künftig **ein** Format für Korrekturen und **ein** Format für neue Angebote, beide in `claude-work/eingang/`, mit einem Prüfskript, das jede Datei vor dem Schreiben prüft. Recherche-Ergebnisse (Stufe 1, E168) laufen danach nur noch über diesen Eingang in den Master.
- Ziel: Der Master bleibt **bytegleich**, das Nachtragsprotokoll bis auf 136 aufgelöste Quellenangaben (Entscheid 2 B); damit bleiben Generator-Ausgaben und Website gleich.
- **Nicht Teil von P26:** neue Master-Spalten, Anbieter- und Durchführungstabellen, ein Trennzeichen für Sprache und Kursform, Währungsfeld, berechnete Sichtbarkeit (alle P27); schlanke Auslieferung, Cache-Regel (P28); Datei je Land (P29); Prüfliste und Abruf (P30); Recherche; Netzabrufe im Prüfskript; App- und Website-Änderungen; Release (kein Release, wie E195).

## 1. Befund [GEPRÜFT, 21.11., Commit 8e1c715]

### 1.1 Eingänge heute

| Datei | Zeilen | Kopf | Feldnamen | Zeilenende |
|---|---|---|---|---|
| `paket13/config/owner_korrekturen.csv` | 5 | A | Website | LF |
| `paket14/config/korrekturen.csv` | 187 | A | Website | LF |
| `paket16/config/korrekturen.csv` | 132 | A | Website | CRLF |
| `paket17/config/korrekturen.csv` | 1'034 | A | Website, `sessions[i].label/region` | CRLF |
| `paket17/config/korrekturen_preis.csv` | 36 | A | Website | CRLF |
| `paket18/config/korrekturen.csv` | 934 | A | Website (`laender.anbieterLand`) | CRLF |
| `paket21/config/korrekturen.csv` | 1'327 | B | Website + Master | LF |
| `paket22/config/korrekturen.csv` | 8 | B | Website + Master | LF |
| `paket22/config/neue_angebote.json` | 1 Angebot | JSON | Website-Datensatz + Smart | – |

Kopf A `id,feld,alt,neu,register_id,quelle,bemerkung`; Kopf B `id,feld,alt,neu,master_feld,master_alt,register_id,quelle`. Zusammen 3'664 Zeilen und 1 neues Angebot.

- **Folgeregeln stecken im Code:** `scripts/master_nachtraege.py` hat je Paket einen eigenen Block. Aus 3'664 Zeilen werden 5'253 geänderte Master-Zellen, z. B. Paket 13 «publicationStatus» → `beta_sichtbar`, `beta_grund`, `publikationsstatus`; Paket 14 Preis → zusätzlich `preis_optionen`; Paket 18 Anbieterland → zusätzlich `anbieter_land_beleg`; Paket 21/22 → `ch_zugang_regel`. Die Herkunftscodes (z. B. `ANBIETERSEITE_E109`, `OWNER_E134`) leitet der Code aus Paket und Register-ID ab.
- Protokoll `paket3/out/master_nachtraege_protokoll.csv` 6'776 Zeilen = 5'253 Korrekturen + 93 «überholt» (Regel A5 aus P24) + 77 Zellen des neuen Angebots + 1'353 Lieferform (P25).
- **Quellenlücke:** 136 Zeilen in Paket 14 tragen als Quelle nur «wie oben».
- **Nur Website-Zeilen korrigierbar:** Der Code findet IDs nur in Kohorte `WEBSITE_1352`. Eine Korrektur an OFFER-DIGICOMP-075 (Kohorte `NEU_P22`) oder an einer DE-Zeile (Recherche nach E178) bricht heute ab.
- Prüfungen gibt es nur je Paket in eigenen Tests (L2); ein allgemeines Prüfskript fehlt.

### 1.2 Werte im Master (Grundlage für Typen und Codelisten)

- Datumsfelder `geprueft_am`, `pruefen_ab`, `start_datum` bei allen gefüllten Zeilen JJJJ-MM-TT.
- Länder ISO-3166-1 alpha-2, mehrere mit `|` (`AT|DE`, `NO|SE`).
- Sprache und Kursform mit 4 bzw. 3 Schreibweisen des Trennzeichens («DE|FR», «FR | EN», «DE/EN»; «PRÄSENZ|ONLINE LIVE», «PRÄSENZ | ONLINE LIVE»); Vereinheitlichung ist P27.
- 49 Herkunftsspalten `h_…`, 34 verschiedene Herkunftscodes. Ohne eigene Herkunftsspalte: `anbieter_land_beleg`, `ch_zugang_regel`, `beta_sichtbar`, `beta_grund` (Herkunft nur im Protokoll); `durchfuehrungsort_sicherheit` teilt `h_durchfuehrungsort_land`.
- Schutz-IDs (`schutz_307` = JA): 1'098 Protokollzeilen an 306 Schutz-IDs, alle mit Register-Einträgen mit Beleg OWNER.
- CH-Zugang «JA» ohne Durchführungsort CH: 0 von 946.
- **Geteilte Adressen:** 48 URL-Gruppen mit 219 Angeboten in CH/AT/LI und 235 Gruppen mit 995 Zeilen in DE/USA teilen eine Adresse (Übersichtsseiten, z. B. ateliers-image-son.ch 19 Angebote, sbvv.ch/weiterbildung 14); Anbieter + Titel sind nur in 3 Gruppen gleich. OFFER-DIGICOMP-075 hätte keine Dublette.

## 2. Soll

**A1 Ordner und Reihenfolge.** `claude-work/eingang/`, Dateinamen `NNN_JJJJMMTT_korrekturen.csv` bzw. `NNN_JJJJMMTT_neue_angebote.csv`; `NNN` = dreistellige Laufnummer, eindeutig und aufsteigend; innerhalb einer Laufnummer zuerst Korrekturen, dann neue Angebote. Läufe 013–022 = überführter Altbestand (A7), danach fest der Lieferform-Schritt aus P25, danach Läufe ab 026.

**A2 Korrekturdatei.** UTF-8 ohne BOM, LF, Anführung nach RFC 4180. Kopf genau:
`id,feld,alt,neu,alt_anzeige,herkunft,register_id,quelle,url_status,url_geprueft_am,ursprung`
- Eine Zeile = **eine Master-Zelle** (ausdrücklich, ohne Folgeregeln im Code). `feld` ist ein Master-Spaltenname, keine `h_`-Spalte.
- `herkunft` schreibt das Skript in die Herkunftsspalte laut Feldtabelle (A4); ohne Herkunftsspalte steht sie nur im Protokoll (wie heute).
- `alt` wird gegen den aktuellen Master-Wert geprüft (Platzhalterregel SENT wie heute). Für Anzeigefelder (`…_anzeige`) gegen den gezeigten Wert; `neu` gleich dem Original wird als leer gespeichert (P24 A4). Ändert eine Zeile ein Originalfeld mit gesetztem Anzeigefeld, wird das Anzeigefeld geleert und protokolliert (P24 A5). `alt_anzeige` (freiwillig) prüft zusätzlich den gezeigten Wert vor der Änderung (wie Paket 21).
- `url_status` (OK, WEITERLEITUNG, NICHT_GEPRUEFT) und `url_geprueft_am` nur und dann Pflicht bei `feld` = `url`.
- `ursprung` freiwillig, im überführten Altbestand Pflicht: Altdatei und Zeilennummer, bei Folgezeilen mit Zusatz «Folgezeile». Steht nicht im Protokoll.
- IDs aller Kohorten sind korrigierbar (heute nur `WEBSITE_1352`, §1.1).

**A3 Datei neue Angebote.** Gleiche Form wie A2. Eine Zeile = ein Angebot. Spalten: Master-Spalten (ohne Kennungen früherer Läufe, A4) und die Steuerspalten `herkunft,register_id,quelle,url_status,url_geprueft_am,scope_code,scope_begruendung,dedupe_freigabe,url_geteilt,ursprung`.
- Nicht genannte Spalten: Anzeigefelder leer, `h_…` «LEER», alle übrigen «nicht erfasst» (wie Paket 22).
- Genannte Inhaltsspalten mit Herkunftsspalte bekommen `herkunft`, ausser die `h_`-Spalte steht selbst in der Datei.
- Protokoll wie heute: eine Zeile je Zelle mit Wert, `alt` «(neu)».
- `kohorte` Pflicht: `NEU_<NNN>` mit der Laufnummer der Datei (Altbestand: `NEU_P22`).
- Für CH/AT/LI zusätzlich Pflicht, was der Generator braucht (P25 A7): `lieferform_json` (Objekt mit den 8 Teilfeldern), `preis_optionen` (Liste), `preis_budgetfaehig` (True/False). So kann ein geprüftes Angebot den Generator nicht mehr abbrechen lassen.
- `scope_code` (Entscheid 3): KERN_E005 · PRAXIS_E005 · GESCHAEFT_FREIE_E180 · GRENZFALL_E179 (dann `scope_begruendung` Pflicht).

**A4 Tabellen** (im Repo, Teil der Prüfung):
- `scripts/eingang_felder.csv`: je Master-Spalte `aenderbar` (JA/NEIN), `h_spalte`, `typ`, `pflicht_neu` (CH/AT/LI bzw. DE/US). Nicht änderbar: `market`, `id`, `kohorte`, alle `h_…`, `r4_…`, `us_owner_…`, `schutz_307`, `schutz_grund`, `e4_legacy_policy`, `v288_…`, `gold`, `termin_status_20261109`.
- Typen: Text (nicht leer, kein Zeilenumbruch), Datum (JJJJ-MM-TT, gültiges Datum), Land (ISO-3166-1 alpha-2, mehrere mit `|`), Codeliste, Wahrheitswert (True/False), URL (`http://` oder `https://` mit Host), JSON-Liste, JSON-Objekt (Lieferform: genau 8 Teilfelder). Jedes Feld lässt «nicht erfasst» zu, ausser es ist Pflicht ohne Platzhalter (E031: Unbekanntes bleibt sichtbar).
- `scripts/eingang_codelisten.csv`: zulässige Werte je Codeliste (Sprache, Kursform, Niveau, Preisklasse, Sicherheitsgrad, Objektklasse, Publikationsstatus, CH-Zugang, URL-Status, Scope). Neue Mehrfachwerte nur mit `|` ohne Leerzeichen; bestehende Schreibweisen bleiben im Master bis P27.
- `scripts/eingang_herkunft.csv`: die 34 bestehenden Herkunftscodes mit Bedeutung; ein neuer Code braucht eine Zeile mit Register-ID.
- `scripts/iso3166_alpha2.csv`: Länderliste mit Quelle und Abrufdatum (U3).

**A5 Prüfskript** `scripts/eingang_pruefen.py`: wendet Basis und alle Eingangsdateien der Reihe nach im Speicher an, schreibt nichts. Meldet alle Fehler der ersten fehlerhaften Datei mit Datei, Zeilennummer, Spalte, Regel und Grund und endet dann mit Rückgabecode ≠ 0. Regeln §5 (K01–K14, N01–N11). Ohne Netzabruf: der URL-Status ist eine Markierung aus der Recherche, das Skript prüft Form und Wert. Zusätzlich schreibt es auf Wunsch (`--schema-bericht <Datei>`) einen Bericht: der ganze Master gegen die Feldtabelle, Abweichungen je Spalte gezählt; nur Bericht, kein Abbruch (Altwerte wie «FR | EN» bleiben bis P27; offen seit P24, R2).

**A6 Master-Fortschreibung** `scripts/master_nachtraege.py`: Die Paketblöcke 13–22 werden ersetzt durch eine Schleife über `eingang/` mit derselben Prüfung wie A5 (gemeinsamer Code, z. B. `scripts/eingang.py`); bei einem Fehler wird nichts geschrieben. Unverändert: Basis `master_3818.csv`, Regeln SENT, A4, A5, der Lieferform-Schritt P25, die Ausgabeform.

**A7 Überführung Altbestand** (Entscheid 1): einmalig, maschinell mit `paket26/scripts/ueberfuehren.py` aus den 9 Altdateien und dem Protokoll von 8e1c715 in `eingang/013_…` bis `022_…`: 5'253 Korrekturzeilen in Protokollreihenfolge (Paket 17: Korrekturen, dann Preise; Durchführungen als ganze JSON-Liste in `durchfuehrungen_anzeige`) und 1 neues Angebot. `alt_anzeige` bei den Ortskorrekturen aus Paket 21 aus dem dortigen Website-Altwert. Quelle «wie oben» (Entscheid 2 B): ersetzt durch die Quelle der nächsten vorangehenden Zeile derselben ID in der Altdatei; Liste der 136 Ersetzungen im Bericht. URL-Status für E098 NICHT_GEPRUEFT, ausser U4 findet einen Beleg; für OFFER-DIGICOMP-075 OK, 19.11.2026 (Kursseite abgerufen, E143). Scope-Code OFFER-DIGICOMP-075: PRAXIS_E005 (Einordnung Claude; Aufnahme durch Owner E143).

**A8 Altdateien** bleiben unverändert im Repo (Beleg). `master_nachtraege.py` liest sie nicht mehr; `test_paket24.py` T07 und die Anzeige-Gegenprobe lesen sie weiter als unabhängige Gegenprobe.

**A9 Register-Kopie** `claude-work/wissensbasis/ENTSCHEIDUNGSREGISTER.csv` (gegen sie prüft K09); Claude führt sie mit jedem Register-Nachtrag im selben Commit nach.

**A10 Bestehende Tests** (Entscheid 5): `test_paket24.py` T08/T09: Eingabeliste mit `eingang/` und den Tabellen A4 statt der Altdateien; die Abbruchfälle treffen dieselben Zeilen in den überführten Dateien. `test_paket24.py` T10 und P25 M05 (Entscheid 2 B): prüfen weiter jede historische Protokollzeile; Spalte `quelle` in genau den 136 Zeilen gegen die Ersetzungsliste, alles andere gegen die bisherigen Werte und Hashes. Historische Sollwerte, Hashes und Prüfabsichten bleiben; Diff im Bericht. Weitere Anpassungen nur nach Rückfrage.

**A11 Unverändert:** Master (bytegleich), Protokoll bis auf die 136 Quellenangaben (Entscheid 2 B), Basis, `generator_website.py`, `paket19/`, `paket22/`, `paket25/website/`, `app-v43.js`, Website live.

**A12 Kurzanleitung** `eingang/LIESMICH.md` (eine Seite): Dateinamen, Spalten, Ablauf «Recherche → Datei → Prüfskript → Master-Fortschreibung → Generator», Beispielzeilen.

**A13 Wissensbasis:** Bericht, Register-Nachtrag, GESAMTWISSENSSTAND §2 (Datenregeln), §4, §9, §10.

## 3. Entscheide (Owner)

**Entscheid 1 – Altbestand** → **A** (E203)
- **A (gewählt):** Korrekturen 13–22 und das neue Angebot aus Paket 22 einmalig ins neue Format überführen (A7); danach nur noch ein Weg in den Master. Abnahme: Master und Protokoll bytegleich.
- B (nicht gewählt): Altdateien bleiben Eingang, das neue Format gilt nur für künftige Läufe. Zwei Wege bleiben, L2 ist nur halb geschlossen.

**Entscheid 2 – Quelle «wie oben»** (136 Zeilen Paket 14) → **B** (E204)
- A (nicht gewählt): wörtlich übernehmen, nur im Lauf 014 zulässig.
- **B (gewählt):** beim Überführen auflösen. Geprüft 21.11. [GEPRÜFT]: alle 136 Zeilen stehen direkt unter einer Zeile derselben ID; die Kette endet bei der Adresse der Mediencampus-Kursseite. Keine neue Recherche nötig. Das Protokoll ändert sich nur in der Spalte `quelle` dieser 136 Zeilen; `test_paket24.py` T10 und P25 M05 werden dafür angepasst (A10). «wie oben» ist in allen Dateien verboten (K11).
- Owner 21.11. auf die erste Fassung: «klingt als würden wir uns selbst unnötig beschränken, kann man nicht nachrecherchieren?»; danach Auswahl «Ja, Adresse einsetzen».

**Entscheid 3 – Scope-Code bei neuen Angeboten** (E179, E180) → **A** (E205)
- **A (gewählt):** Pflicht und geprüft in der Eingangsdatei (A3, N08), dort dauerhaft im Repo; eine Master-Spalte kommt mit P27.
- B (nicht gewählt): jetzt neue Master-Spalten `scope_code`, `scope_begruendung` (125 → 127); Master nicht mehr bytegleich, alle Spalten-Tests anpassen.

**Entscheid 4 – Dubletten** (E029, E138) → **A** (E206)
- **A (gewählt):** Gleiche Anbieter + Titel (normalisiert) gegenüber Master oder Datei → Abbruch, ausser `dedupe_freigabe` nennt einen Owner-Entscheid. Gleiche Adresse (normalisiert) → Abbruch, ausser die Zeile setzt `url_geteilt` = JA (Übersichtsseite, wie bei 219 Angeboten heute); solche Fälle listet der Bericht des Laufs.
- B (nicht gewählt): Gleiche Adresse immer Abbruch, Freigabe nur durch Owner-Entscheid je Fall (bremst die Recherche bei Übersichtsseiten).

**Entscheid 5 – Freigabe** → **A** (E207)
- **A (gewählt):** freigegeben samt Anpassung der bestehenden Tests nach A10 (wie E199), Zweitmeinung ChatGPT parallel, Befunde vor dem Commit einarbeiten (wie E183, E196); kein Release.
- B (nicht gewählt): erst nach Zweitmeinung freigeben.

Quelle: Owner-Antworten 21.11., Chat «weiter» («1. ja», «4. ok», «5. ja»; Rückfragen zu 2 und 3: «Ja, Adresse einsetzen», «Erst in der Eingangsdatei»).

## 4. Prüfschritte vor der Umsetzung (nur lesen)

U1 Zweig auf 8e1c715 oder jünger ohne Änderung an `paket3/out/`, `scripts/`, Altdateien; Master SHA-256 cf9fdb2d69d6e2a908c08889655b7cf923cdcb8a618c2341b84f5c98b8adad92, Protokoll 44a874753197e96982c687da0a699c762f5793655b25331742aef8a9fcadf683; sonst anhalten.
U2 Zählungen §1 wiederholen; weicht eine ab, anhalten und melden.
U3 Quelle der Länderliste festlegen und belegen (Projektregel 5): ISO 3166 Maintenance Agency oder die Debian-Datei `iso-codes`; Abrufdatum und SHA-256 in `iso3166_alpha2.csv`. [ZU BELEGEN]
U4 Beleg für den URL-Status von OFFER-HEAD-003 (E098) in Bericht und Tests Paket 13 suchen; ohne Beleg NICHT_GEPRUEFT.
U5 Überführten Altbestand gegen alle Regeln prüfen. Verstösst eine historische Zeile gegen eine Regel, nicht still ausnehmen, sondern anhalten und melden.

## 5. Testliste (Abnahme)

**Regeln des Prüfskripts.** Je Regel mindestens ein Fehlfall, der abgelehnt wird (Rückgabecode ≠ 0, Meldung mit Datei, Zeile, Spalte, Regel; Master, Protokoll und Ausgabeordner bytegleich, keine neue Datei).

| Nr. | Regel Korrekturen |
|---|---|
| K01 | Dateiname nach A1, Laufnummer eindeutig und aufsteigend |
| K02 | UTF-8 ohne BOM, LF, Kopf genau, gleiche Spaltenzahl je Zeile |
| K03 | `id`, `feld`, `herkunft`, `register_id`, `quelle` nicht leer; `neu` leer nur bei Anzeigefeldern |
| K04 | `id` im Master (alle Kohorten) |
| K05 | `feld` ist Master-Spalte und änderbar (A4) |
| K06 | `alt` = aktueller Wert (SENT), Anzeigefelder gegen den gezeigten Wert; `alt_anzeige` = gezeigter Wert, falls gefüllt |
| K07 | `neu` nach Typ und Codeliste (A4) |
| K08 | `herkunft` in der Herkunftsliste |
| K09 | `register_id` in der Register-Kopie (A9), Art ENTSCHEID, REGEL oder BEFUND |
| K10 | Zeile an einer Schutz-ID nur mit Registereintrag, Beleg OWNER (E035) |
| K11 | `quelle` nicht «wie oben», «dito», «s. o.» (Entscheid 2 B, ohne Ausnahme) |
| K12 | `id` + `feld` höchstens einmal je Datei |
| K13 | bei `feld` = `url`: `url_status` aus der Liste, nicht FEHLER, `url_geprueft_am` Datum |
| K14 | CH-Zugang JA nach dem Lauf nur mit Durchführungsort CH oder Regeltext in `ch_zugang_regel`; nie aus dem Anbieterland (E030, E066) |

| Nr. | Regel neue Angebote |
|---|---|
| N01 | Form wie K01, K02; nur bekannte Spalten (Master oder Steuerspalte) |
| N02 | `id` Muster `[A-Z0-9][A-Z0-9-]{2,40}`, nicht im Master, nicht doppelt; `kohorte` nach A3 |
| N03 | Pflichtspalten und Pflichtwerte je Markt (A4) |
| N04 | Werte nach Typ und Codeliste (wie K07) |
| N05 | `herkunft`, `register_id`, `quelle` wie K08, K09, K11 |
| N06 | `url_status` OK oder WEITERLEITUNG, `url_geprueft_am` nicht nach dem Laufdatum |
| N07 | Dubletten nach Entscheid 4 (Anbieter + Titel; Adresse) gegen Master und Datei |
| N08 | `scope_code` aus der Liste; GRENZFALL_E179 nur mit `scope_begruendung` |
| N09 | CH/AT/LI: `lieferform_json` mit 8 Teilfeldern, `preis_optionen` Liste, `preis_budgetfaehig` True/False |
| N10 | CH-Zugang wie K14 |
| N11 | nicht änderbare Spalten (A4) nicht in der Datei |

**Abnahme**

| Nr. | Prüfung | Erwartung |
|---|---|---|
| E01 | Überführung | 5'253 Korrekturzeilen in 7 Dateien (Läufe 013, 014, 016, 017, 018, 021, 022) und 1 Angebot in `022_…_neue_angebote.csv`; jede Altzeile ist mindestens einer Zeile zugeordnet (`ursprung`), jede überführte Zeile genau einer Altzeile |
| E02 | Master und Protokoll | aus `eingang/` gebaut: Master bytegleich mit cf9fdb2d…; Protokoll gleich 44a87475… bis auf die Spalte `quelle` in genau den 136 Zeilen der Ersetzungsliste (Entscheid 2 B), neuer SHA-256 im Bericht |
| E03 | Eingaben | `master_nachtraege.py` öffnet nur Basis, `eingang/`, Tabellen A4, Register-Kopie, P25-Auszug (Nachweis wie P25 G01, z. B. `strace`) |
| E04 | Prüfskript am Bestand | Rückgabecode 0; schreibt nichts (Ordner vorher = nachher) |
| E05 | Fehlfälle | je Regel K01–K14 und N01–N11 mindestens ein Fall abgelehnt, wie oben |
| E06 | Gutfall | in einer Testkopie: eine Korrektur an einer DE-Zeile, eine an OFFER-DIGICOMP-075, ein neues CH-Angebot (Lauf 026); genau die erwarteten Zellen und Protokollzeilen; der Generator baut, das Angebot steht mit allen Schlüsseln in Datendatei und Smart-Datei; Repo-Eingang unverändert |
| E07 | geteilte Adresse | Testangebot mit Adresse einer Übersichtsseite: ohne `url_geteilt` abgelehnt, mit JA angenommen und gelistet (Entscheid 4 A) |
| E08 | Reproduzierbarkeit | zwei Läufe aus frischen Ordnern bytegleich |
| E09 | bestehende Tests | nach A10 angepasst: `test_paket24.py` 14/14, `test_nachtraege.py` 14/14, P25 Master 8/8, Generator 13/13; `data-p25.js` und Smart-Datei bytegleich (ae30bf39…, 6e7ec9cd…) |
| E10 | Unverändert | Altdateien, `paket19/`, `paket22/`, `paket25/website/`, Basis (SHA-256 vorher = nachher) |
| E11 | Testanpassung (A10) | Diff im Bericht; historische Sollwerte und Hashes unverändert |
| E12 | Schema-Bericht | läuft am Master; Abweichungen je Spalte im Bericht P26 als Grundlage für P27; Master unverändert |

Anzeige-, Browser- und Stufentests entfallen: Master und Generator-Ausgaben sind bytegleich (E02, E09), die Website ändert sich nicht.

## 6. Lieferung und Aufwand

- Commits auf `claude/datenharmonisierung`, nie `main` (E041); Push braucht wieder Schreibrecht für diesen Chat oder den Umsetzungs-Chat.
- `BERICHT_PAKET26_<Datum>.md` mit Testergebnissen, Gegenprüfung durch getrennten Agenten, Abgleich Zweitmeinung; Register E203 ff. und GESAMTWISSENSSTAND (A13).
- Kein Release.
- Zeit: Claude eine Arbeitssitzung; Owner rund 5 Minuten für die Entscheide, später rund 5 Minuten für den Bericht.

## 7. Prüfung nach Fachrollen (FACHROLLEN.md Fassung 3)

| Rolle | Prüffrage | Ergebnis |
|---|---|---|
| R0 Produkt und Betrieb | Dient P26 dem Beta-Ausstieg (E181)? Kann jemand anderes einen Lauf anhand der Unterlagen machen? | ja: Recherche Stufe 1 läuft nur über den Eingang; A12 Kurzanleitung |
| R1 Fachredaktion | Scope und Grenzfälle begründet (E179, E180)? | A3, N08 (Entscheid 3) |
| R2 Daten | ein Eingang, Herkunft je Zelle, Altwert-Prüfung, nichts erfunden; Schema-Prüfung aller Felder (offen seit P24) | A2–A7; K03–K11, N03–N09; E02, E12 |
| R4 Build | Abbruch vor dem Schreiben, reproduzierbar | A5, A6; E05, E08 |
| R10 QS | jede Regel mit Fehlfall belegt, getrennte Prüfung | E05; getrennter Agent; Zweitmeinung |
| übrige Rollen | – | nicht betroffen (keine Änderung an Website, Auslieferung, Datenschutz) |

## 8. Bei Punkten ausserhalb dieser Spezifikation

Anhalten und fragen (wie E158).
