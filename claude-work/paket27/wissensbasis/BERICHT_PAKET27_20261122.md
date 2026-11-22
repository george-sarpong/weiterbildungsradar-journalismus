# BERICHT PAKET 27 «Modell erweitern», 22.11.2026

Status: umgesetzt, getestet und gepusht, kein Release (E217). Owner-Entscheide aus diesem Chat: E213–E219; Befund E220. Nachtrag zur Bestätigung vorgelegt. Zweitmeinung ChatGPT steht noch aus.
Auftrag: Owner 22.11., Chat «weiter» (Spezifikation freigegeben E217; «ja schreibrecht ok»).
Grundlage: `SPEZIFIKATION_PAKET27_20261122.md` (freigegeben, E213–E217); GESAMTWISSENSSTAND (Stand E217).
Arbeitszweig: `claude/datenharmonisierung`, Ausgang Commit c8d390e (§9).
Beleg: [GEPRÜFT] von Claude gezählt bzw. getestet · [OWNER] Entscheid in diesem Chat.

## 1. Ergebnis

Das Datenmodell trägt jetzt, was die Recherche Stufe 1 braucht. Die Website zeigt dasselbe wie vorher. [GEPRÜFT]

- **Anbieter-Kennung:** Die Tabelle `daten/anbieter.csv` führt 1'295 Anbieter (vorher 1'301 Schreibweisen ohne Kennung; CH/AT/LI 169, DE 35, USA 1'092). Jede Master-Zeile trägt `anbieter_id`. Neue Anbieter und die Kernliste je Land (E171) kommen über `NNN_JJJJMMTT_anbieter.csv` (E214).
- **Scope-Spalten** im Master: OFFER-DIGICOMP-075 PRAXIS_E005, die übrigen 3'818 Zeilen «nicht erfasst» (E216).
- **Trennzeichen:** Lauf 027 setzt 22 Werte auf «|» (sprache 5, format 17). Danach weicht im Schema-Bericht nur noch `url` ab (30 USA-Zellen, E068).
- **Sichtbarkeit berechnet:** `scripts/sichtbarkeit.py` ergibt an 5 Stichtagen dieselben Angebote wie die App: 1'006 (20.11.), 998, 945, 860, 795 (01.03.2027).
- **Durchführungen** werden abgeleitet: `paket27/out/durchfuehrungen.csv` hat 731 Zeilen (118 aus Listen, 613 aus Start- und Enddatum).
- **Master** 125 → 130 Spalten, SHA-256 194954d3…. Die 125 bisherigen Spalten sind gleich wie in Paket 26, ausser den 22 Trennzeichen und ihrer Herkunft. **Protokoll** 6'776 → 10'618 Zeilen (bisherige bytegleich vorne, neu 3'819 `anbieter_id`, 1 Scope, 22 Trennzeichen).
- **Website-Daten** `paket27/website/data-p27.js` = `data-p25.js` bis auf die 22 Rohwerte. Smart-Datei, `index.html` und Sitemap (Stichtag 20.11.) sind bytegleich mit P25. Karten, Filter und Smart-Suche (60 Anfragen, 3 Stichtage) zeigen dasselbe.
- **Tests:** P27 15/15, Anzeige-Vergleich 12/12, `test_paket24.py` 14/14, `test_nachtraege.py` 14/14, P25 Master 8/8, Generator 13/13, P26 14/14.

## 2. Prüfschritte U1–U5 [GEPRÜFT]

| Nr. | Ergebnis |
|---|---|
| U1 | Zweig auf c8d390e; Master cf9fdb2d…, Protokoll c82cef3d… = Spezifikation |
| U2 | Zählungen §1 bestätigt. **Eine Abweichung:** Die Deutsche Journalisten Akademie hat 22 CH-Zeilen mit Anbieterland DE und 2 DE-Zeilen (V112-47, -48, Dubletten nach E070) mit «nicht erfasst». Ich habe angehalten und gefragt; der Owner hat entschieden: K15 = Sitzland **oder** «nicht erfasst» (E218) |
| U3 | Sichtbarkeit Python = `app-v43.js` in jsdom mit `data-p25.js` an allen 5 Stichtagen (gleiche ID-Mengen) |
| U4 | Die 6 Zusammenführungen sind Schreibvarianten derselben Einheit (ZHdK mit/ohne Klammer; 5 USA-Hochschulen mit «/», «—» oder Leerzeichen) |
| U5 | `beta_sichtbar` lesen nur Tests und Bauskripte früherer Pakete (3, 8, 13, 24, 26); P27 ändert keinen davon |

## 3. Umsetzung

| Datei | Inhalt |
|---|---|
| `daten/anbieter.csv` | Erstfassung der Anbieter-Tabelle (A2), gebaut von `paket27/scripts/bau_anbieter.py` (einmalig, dokumentiert) |
| `scripts/eingang.py` | Modellschritt 026, Klasse `Anbieter`, Anbieter-Lauf (B01–B08), `konsistenz` (K15, K16), Laufnummern ab 027, Scope bei neuen Angeboten |
| `scripts/master_nachtraege.py`, `eingang_pruefen.py` | Anbieter-Tabelle als Eingabe, Ausgaben `paket3/out/anbieter_aktuell.csv` und `anbieter_protokoll.csv`; Option `--bis 25` (nur für die alten Tests, E219) |
| `scripts/eingang_felder.csv`, `eingang_herkunft.csv` | 5 neue Spalten; Herkunftscodes `ANBIETER_TABELLE_P27`, `MASTER_P27`, `NORMIERUNG_P27` |
| `eingang/027_20261122_korrekturen.csv` | 22 Trennzeichen (aus `paket27/scripts/bau_lauf027.py`) |
| `scripts/sichtbarkeit.py`, `scripts/durchfuehrungen.py` | berechnete Sichtbarkeit (A7), abgeleitete Durchführungen (A6) |
| `scripts/stand_p26.py` | baut den Stand Paket 26 für die alten Tests (E219) |
| `paket27/scripts/build_p27.sh` | Build wie P25 nach `paket27/website/` und `paket27/out/` |
| `paket27/tests/` | `test_paket27.py` (P01–P15), `test_paket27_anzeige.js` (P12), `sichtbar_app.js` (P09) |
| `eingang/LIESMICH.md` | Anbieter-Datei, Scope-Spalten, Lieferform-Regel, Laufnummern ab 028 |

Festlegungen von Claude im Rahmen der Spezifikation:
- `schreibweisen` als JSON-Liste statt mit «|», weil eine Schreibweise «Canal9 | Kanal9» lautet. Die aktuelle Tabelle entsteht bei jedem Lauf als `paket3/out/anbieter_aktuell.csv` (Muster wie beim Master). Beides hat der Owner zur Kenntnis genommen (E219).
- Die Kennung wird über die genaue Schreibweise zugeordnet; die Normalisierung dient nur der Eindeutigkeit (B03).
- Anbieter-Datei: eine Zeile = eine Zelle der Tabelle; neuer Anbieter mit `alt` = «(neu)». K15/K16 prüfen nach jeder Laufnummer den ganzen Master. So kann ein Sitzland geändert werden, wenn die Angebote in derselben Laufnummer folgen (B06).
- `scope_begruendung` schreibt keine Herkunft in `h_scope_code`; die Herkunft der Begründung steht im Protokoll (nach Gegenprüfung B3).
- `sichtbarkeit_<Stichtag>.csv` hat zusätzlich die Spalte `market`.

## 4. Tests [GEPRÜFT]

| Nr. | Ergebnis |
|---|---|
| P01 | PASS: 3'820 × 130; 125 Spalten gleich P26 ausser 44 Zellen (22 Werte + Herkunft) |
| P02 | PASS: 6'776 Zeilen bytegleich vorne; neu 3'842 |
| P03 | PASS: 1'295 Anbieter, Kennungen fortlaufend, 6 Zusammenführungen; Erstfassung bytegleich nachgebaut |
| P04 | PASS: Anbieterland = Sitzland, ausser genau den 2 DJA-Zeilen «nicht erfasst» (E218) |
| P05a | PASS: 28 Fehlfälle (B01–B07, K01, K07, K15, K16, N03); Meldung mit Datei:Zeile:Spalte und Regel; nichts geschrieben |
| P05b | PASS: Gutfall Lauf 028 mit neuem Anbieter, Kernliste-Anbieter ohne Angebot (B08), neuem Angebot, Sitzland-Korrektur samt Angebot, Scope- und Marktkorrektur; Generator baut |
| P06 | PASS: Scope wie A4 |
| P07 | PASS: Schema-Bericht nur `url` 30 |
| P08 | PASS: 731 Durchführungen, jeder Wert aus dem Master |
| P09 | PASS: Sichtbarkeit = App an 5 Stichtagen |
| P10 | PASS: 0 Angebote mit zwei Währungen; Fehlfall abgelehnt |
| P11 | PASS: CH → DE behält die Lieferform; DE → CH ohne Lieferform abgelehnt |
| P12 | PASS: 22 Rohwerte; Smart, `index.html`, Sitemap bytegleich; Anzeige-Vergleich 12/12 |
| P13 | PASS: zwei Läufe bytegleich |
| P14 | PASS: alte Tests grün, Hashes und Zahl der Prüfungen unverändert; Diff `paket27/out/testanpassung_a11.diff` |
| P15 | PASS: Basis, Altdateien, `paket19/`, `paket22/`, `paket25/website/`, Generator, Eingang 013–022 unverändert |

**Testanpassung (E219, Abweichung von A11).** Die alten Tests prüfen den Stand Paket 26, den `master_nachtraege.py --bis 25` bytegleich nachbaut. Ihre Sollwerte und Hashes bleiben. P26 läuft mit dem Eingang von Paket 26 und Testläufen 027 statt 026; neue Angebote tragen dort `anbieter_id`. Den Schritt zu P27 prüft `test_paket27.py`.

## 5. Gegenprüfung durch getrennten Agenten

Urteil **FAIL** mit 2 Blockern und 4 Befunden. Die Modelllogik hielt allen Angriffen stand (z. B. doppelte Schreibweisen über zwei neue Anbieter, Schreibweise entfernen, die noch genutzt wird, Anbieter erst nach dem Angebot).

| Nr. | Befund | Erledigung |
|---|---|---|
| B1 | K15, K16, B03, B04 meldeten ohne Datei bzw. Zeile; der Test prüfte das nicht | Meldung nennt die verursachende Zeile (Datei:Zeile:Spalte); Test geschärft |
| B2 | A11 anders umgesetzt (Stand P26 über `--bis`) | Owner-Rückfrage, angenommen (E219) |
| B3 | Korrektur auf GRENZFALL_E179 ohne Begründung möglich; Begründung überschrieb die Herkunft des Codes | Prüfung nach dem Lauf (K07); Begründung ohne `h_scope_code`; Fehl- und Gutfall |
| B4 | `--bis` nahm jeden Wert an und konnte P27-Ausgaben stehen lassen | nur `--bis 25`; Abbruch, wenn der Ordner Ausgaben aus P27 enthält |
| B5 | `__pycache__` im Repo | gelöscht |
| B6 | Test schrieb den Schema-Bericht ins Repo; P12 hängt vom Anzeige-Test ab | Test vergleicht nur noch; Abhängigkeit im Docstring |
| H1 | exakt doppelte Schreibweise im selben Anbieter angenommen | B03; Fehlfall |
| H8 | f-String nur ab Python 3.12 lauffähig | umgeschrieben |
| H9 | kein Fehlfall für Korrekturdatei mit Laufnummer 026 | ergänzt |

Offen als Hinweis: H3 (Meldung bei fehlender Kennung in Schritt 026 nennt die Tabelle, nicht die Eingangsdatei), H4 (`bau_anbieter.py`, `bau_lauf027.py` prüfen den Master-Stand cf9fdb2d…; sie laufen nur auf dem Stand Paket 26, P03 belegt das mit einer Kopie), H7 (veralteter Altwert in der Anbieter-Datei läuft unter B02).

## 6. Zweitmeinung ChatGPT

Noch ausstehend (Nachricht `CHATGPT_ZWEITMEINUNG_P27_20261122.md` beim Owner). Befunde werden nachgetragen.

## 7. Lieferung

- Commit auf `claude/datenharmonisierung`, gepusht (Schreibrecht im Chat «weiter» erteilt, wie E191); kein Merge nach `main` (E041), kein Release.
- Wissensbasis: dieser Bericht, Register E218–E220, GESAMTWISSENSSTAND; Repo-Kopien in `claude-work/paket27/wissensbasis/`, Register-Kopie `claude-work/wissensbasis/ENTSCHEIDUNGSREGISTER.csv`.
- Testumgebung: jsdom über `NODE_PATH`; der Anzeige-Test braucht viel Speicher (rund 10 Minuten je Stichtag).

## 8. Offen und nächster Schritt

- **Owner:** Bericht und Nachtrag bestätigen (rund 5 Minuten); Zweitmeinung ChatGPT einholen.
- Nächstes Paket laut ZIELBILD §4: P28 (schlanke Auslieferung, nur Sichtbares nach E172 mit `sichtbarkeit.py`, Cache-Regel E176).
