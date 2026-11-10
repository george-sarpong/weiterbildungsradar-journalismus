# BERICHT Paket 8 – Testsatz Stufe 1 (10.11.2026)

Auftrag (Owner 10.11., an Claude delegiert: «entscheid du, wir können nachjustieren»): GESAMTWISSENSSTAND §9, Schritt 1 «Testsatz gemäss Vorlage vervollständigen». Gleichzeitig §10 Punkte 7 und 8 entschieden (E083, E084).
Nicht in diesem Paket: Korrekturen am Website-Kandidaten, Vorabprüfung im Browser (Stufe 2), Release-Paket, `main`, Infomaniak, kostenpflichtige Läufe. Befunde sind Befunde, keine Aufträge.
Beleg: [GEPRÜFT] per Test gerechnet · [GELESEN] Original gelesen · [OWNER] Entscheid George.

## 1. Grundlage
- Repo `claude/datenharmonisierung` auf 20176e5; letzter Code-Commit c013c5a (danach nur Wissensbasis-Kopien d94afc5, 20176e5) [GEPRÜFT].
- Prüfling: `paket7/website/app-v36.js`, `data-p7.js`, `index.html`, `methodik.html` und die Smart-Daten `paket3/out/merge_kandidat_smart.json`; Kriterien und Testfragen aus `VORLAGE_TESTKRITERIEN_MESSUNG_20261109.md` §2 [GELESEN].
- Werkzeuge: Node 22, jsdom 31.0.0, axe-core 4.14.0, Nu Html Checker (vnu.jar 26.11.9, lokal), Chrome for Testing 153 (Playwright 1.63, ohne Bildschirm). Keine Netzwerkzugriffe ausser auf lokale Prüfstände.
- Ausgangslage erneut grün am 10.11.: Master `run_paket3.sh` 51/51 (Inhalt der Ausgaben identisch); Paket 5 24/24, Paket 6 35/35, Paket 7 41/41 an beiden Stichtagen [GEPRÜFT].

## 2. Ergebnis je Kriterium (Stufe 1)

Stichtage 09.11. und 01.12.2026, wo nicht anders vermerkt. Der Browserlauf nutzt das echte Datum (10.11.; 1'069 sichtbar).

| ID | Stufe | Ergebnis | Test |
|---|---|---|---|
| D1 | Muss | PASS 51/51 | `run_paket3.sh` |
| D2 | Muss | **PASS**: 1'352 Zeilen = Master CH/AT/LI, keine DE/USA-Zeile; keine Karte mit `beta_sichtbar` NEIN (46 HOLD); unsichtbare JA-Zeilen nur wegen Termin (09.11.: 235, 01.12.: 358) | `test_paket8.js` D2a–D2d |
| D3 | Muss | PASS (Paket 6) | A01–A10 |
| D4 | Muss | PASS (Paket 7) | L07 |
| D5 | Muss | **FAIL** (auto): nie leer (D5a PASS), aber Rohcodes auf 74 Karten (01.12.: 71) und in Smart-Karten, siehe §3.1. Browser-Teil Stufe 2 | D5a–D5c |
| D6 | später | – (E074) | – |
| D7 | Muss | PASS (Paket 7) | L01–L12 |
| D8 | Muss | Stufe 2 (Browser) | – |
| F1 | Muss | **FAIL**: 18 PASS, 1 FAIL (T14b, §3.2), 3 später (T01-Dauer/E058, T10, T11) | F1/T01–T20 |
| F2, F3 | Muss | PASS (Paket 6) | B, C |
| F4 | Muss | **PASS**: «im Budget» nur mit belegtem unbedingtem Preis (9 Anfragen); 16 bedingte Treffer alle mit Tarifbezeichnung; T07 20 Fälle (Journalist:innen, Mitglieder, Alumni, «Begünstigter Preis») nie direkt | F4a, F4b, T07 |
| F5, F6 | Muss | PASS (Paket 7) | P, K |
| F7, F8, F10 | später | – (E074) | – |
| F9 | Muss | **PASS** (auto): bis 3 Optionen, bei ≥ 2 Treffern mindestens 2, jede begründet, kein «Top»/«Empfehlung». Browser-Teil Stufe 2 | F9a–F9c |
| F11 | Muss | Stufe 2 (Browser) | – |
| S1 | Muss | Vorprüfung PASS (lokaler Prüfstand: nur Anfragen an die eigene Herkunft); Endprüfung Stufe 2 | `test_browser_p8.js` |
| S2 | Muss | **PASS** für die Smart-Suche (nicht in URL, Cookies, local-/sessionStorage); Hinweis Katalogsuche §4.4 | S2a |
| S3 | Muss | Vorprüfung PASS (jsdom: keine Cookies, localStorage erst nach Merken, nur `weiterbildungsradar:favorites:v1`); Endprüfung Stufe 2 | S3-Vorprüfung |
| S4 | entfällt | – (E075) | – |
| B1 | Muss | **FAIL**: 1 Regel «serious» auf allen 5 Seiten, live identisch (§3.3); sonst 0 «critical»/«serious» | `test_browser_p8.js` |
| B2 | Muss | Stufe 2 (Browser) | – |
| B3 | Soll | auto-Teil PASS: 2.5.8 Zielgrösse ohne Befund; 4.1.3 Statusmeldungen vorhanden (Smart `role=status`, Katalog `aria-live`) | B3a, B3b |
| B4 | Soll | manuell, offen | – |
| T1 | Soll | offen: 2 Fehler in `index.html` (Zeilen 80, 100: `aria-label`/`aria-labelledby` auf `div` ohne Rolle), live identisch | vnu |
| T2, T3, T4, T6 | Muss/Soll | Stufe 2 (Browser) | – |
| T5 | Soll/Muss | hier nicht ausführbar: Anbieter-Websites aus dieser Umgebung gesperrt; Lauf in Stufe 2 | – |
| R1 | Muss | Werkzeug `pruefe_paket.py` gebaut und getestet (5/5, 4 Gegenproben); Anwendung auf das Release-Paket offen (Freigabe) | `test_pruefe_paket.sh` |
| R2 | Muss | PASS: Rollback-Paket = Live-Snapshot Paket A, alle Hashes und Verweise in Ordnung | dto. |
| R3, R5 | Muss | Anleitung mit dem Release-Paket | – |
| R4 | Muss | nach dem Upload | – |

Gegenproben (eingebaute Fehler werden erkannt): G01 HOLD entfernt (33 bzw. 20 Angebote würden sichtbar), G02 Journalist:innen-Tarif als direkter Treffer, G03 Suchtext in localStorage; dazu 4 Gegenproben für R1 [GEPRÜFT].
Trefferlisten des ersten Laufs (Vorlage §2.7): `paket8/out/f1_trefferlisten_<Stichtag>.json`.

**Damit sind 3 Muss-Kriterien FAIL (D5, F1/T14b, B1). Nach Vorlage §1 geht die Beta so nicht live.**

## 3. Muss-Befunde

### 3.1 D5 Rohcodes statt lesbarer Angabe
Am 09.11. auf 74 sichtbaren Karten (130 Stellen, Liste `paket8/out/d5_rohcodes_2026-11-09.csv`):

| Feld | Rohcode | Stellen |
|---|---|---|
| Ort (Regionstext hinter dem Land) | `ON_REQUEST` | 56 |
| Dauer | `NOT_PUBLISHED` | 56 |
| Dauer | `NICHT_PUBLIZIERT` | 5 |
| Start | `SUR_DEMANDE` | 5 |
| Ort | `NICHT_VERIFIZIERT_CURRENT_RECHECK` | 4 |
| Start | `FUTURE_BOOKABLE` 2 · `ON_REQUEST` 1 · `NO_FREE_PLACES` 1 | 4 |

112 der 130 Stellen betreffen Mediencampus (56 Karten mit Dauer und Ort). Dieselben Codes erscheinen in Smart-Karten (z. B. «Videojournalismus, 3 Tage»). Die Region-Rohtexte waren im Bericht Paket 7 §5 Punkt 4 als unverändert vermerkt. Ursache: Die App zeigt `duration`, `start` und `region` wörtlich; nur Format, Niveau und Sprache werden über Bezeichnungslisten übersetzt [GEPRÜFT].

### 3.2 F1/T14 «Podcast produzieren, online»
T14a PASS: «online» gilt nur bei Kursform VERIFIED als bestätigt (E011). T14b FAIL gegen die Erwartung der Vorlage («übrige Kursformen sichtbar unbestätigt»): Die Smart-Suche zeigt «Keine bestätigten Treffer» und blendet die 2 Angebote zum Thema aus, weil «online» als harte Durchführungsbedingung wirkt (live gleich). Die Erwartung stammt aus der Vorlage (E077), nicht aus E011 selbst.

### 3.3 B1 Barrierefreiheit (WCAG 2.5.3 «Label in Name», Stufe A)
axe-core meldet «label-content-name-mismatch» (serious): Logo-Link `.brand` auf allen 5 Seiten (sichtbar «MS Media Skills», Name «Media Skills – Startseite») und in der Ergebnisansicht die 3 Links «Zum Angebot ↗» (Name «Offizielle Angebotsseite zu … öffnen»). Live-Snapshot Paket A: identisch, also kein neuer Fehler.

## 4. Hinweise (kein FAIL)
1. **Wortlaut fehlender Angaben:** Fehlende Angaben heissen auf den Karten meist «Nicht publiziert» u. ä. (Start 248, Preis 233, Niveau 214, Durchführung 170, Zugang 110, Dauer 93, Ort 64, Sprache 24), nicht «nicht erfasst» wie in E036.
2. **Reihenfolge Budget:** Der Journalist:innen-Tarif steht in der Sortierung vor «im Budget» (TARGET_GROUP_FIT vor DIRECT_FIT; live gleich). Er ist als «Journalist:innen-Tarif im Budget» bezeichnet, nie als direkter Treffer (F4 PASS). In 1 von 9 Anfragen sichtbar («Video, CHF 500»).
3. **Nummerierung:** Smart-Karten tragen «Option 1–3» und sind nach Budgetklasse und Punktzahl geordnet (E039: «ohne Ranking»).
4. **Katalogsuche:** Die klassische Suche schreibt den Suchtext als `?q=` in die Adresse (live app-v33.js gleich). Die Datenschutzerklärung schliesst das nur für die Freitext-Suche aus; beim Neuladen landet `q` in den Server-Logs.
5. **Leere Ergebnisse:** T17 «Bildbearbeitung für Fotojournalismus», T18 «Social Media und Audience» und T20 «Datenvisualisierung kostenlos» liefern 0 Treffer (Regel erfüllt, Ergebnis für Nutzende schwach). Alle Suchwörter müssen zutreffen.
6. **T05:** Im Bestand gibt es keinen GBP-Preis; geprüft mit einem synthetischen Fall.
7. Der lokale Prüfstand für B1/S1/T1 setzt `index.html` auf `app-v36.js`, `data-p7.js` und Smart-Daten des Kandidaten (temporär, wird gelöscht). Er ist kein Release-Paket.

## 5. Offene Owner-Fragen (mit Empfehlung)
1. **D5 Rohcodes:** In der App eine Anzeigeübersetzung ergänzen (Codes → lesbarer Text, Platzhaltercodes → «nicht erfasst»). Die Daten bleiben unverändert (keine stillen Überschreibungen). *Empfehlung: ja, Paket 9.*
2. **Wortlaut «Nicht publiziert» vs. «nicht erfasst» (§4.1):** *Empfehlung:* Platzhalter aus Codes (`NICHT_PUBLIZIERT`, `NOT_PUBLISHED`) als «nicht erfasst» zeigen (E036); lesbare Texte aus den Daten wie «Dauer nicht publiziert.» unverändert lassen.
3. **T14b:** A = Erwartung für die Beta anpassen: Die harte Kursform-Bedingung bleibt (wie live), eine Gruppe «Kursform unbestätigt» kommt später mit E058 (Dauer-Gruppe, ebenfalls später). B = Gruppe jetzt bauen. *Empfehlung: A*, weil E074 für die Beta nur Korrekturen verlangt.
4. **B1:** Logo-Link und «Zum Angebot» so benennen, dass der sichtbare Text im Namen steht. *Empfehlung: ja, Paket 9* (Muss, kleine Änderung).
5. **Hinweise §4.2–4.4:** *Empfehlungen:* Reihenfolge Journalist:innen-Tarif lassen (Zielgruppe, Bezeichnung korrekt). «Option 1–3» ohne Nummer zeigen (E039). `q` nicht mehr in die Adresse schreiben, alte Links weiter lesen (E056 «Datenschutz hat Vorrang»). Alle drei optional, Paket 9.
6. **Nachtrag Paket 8** in GESAMTWISSENSSTAND, ERLEDIGT L und Register (E083, E084) bestätigen.

## 6. Dateien (`claude-work/paket8/`)
| Datei | Zweck |
|---|---|
| `tests/test_paket8.js` | D2, D5, F1 (T01–T20), F4, F9, S2, S3-Vorprüfung, Gegenproben G01–G03 (jsdom) |
| `tests/test_browser_p8.js` | B1, B3, S1-Vorprüfung, T1 (Chrome ohne Bildschirm, vnu), Vergleich mit live |
| `scripts/pruefe_paket.py`, `tests/test_pruefe_paket.sh` | R1/R2-Prüfwerkzeug und Test (5/5) |
| `run_paket8.sh` | Gesamtlauf; Voraussetzungen im Kopf der Datei |
| `out/` | Ergebnisse je Stichtag, Trefferlisten F1, Rohcode-Liste D5, Browser-Ergebnis mit axe- und vnu-Details |

## 7. Drift-Prüfung
Gebaut wurden nur Tests, ein Prüfwerkzeug und dieser Bericht. Unberührt: `app-v36.js`, `data-p7.js`, `index.html`, `methodik.html`, Master, Smart-Daten, `main`, PR10, Infomaniak. Kein Release-Paket, keine kostenpflichtigen Läufe. Die Befunde in §3 werden nicht behoben, bevor der Owner entschieden hat.

## 8. Offen bis zur Beta
- Owner-Entscheide §5, danach Paket 9 (Korrekturen) und erneuter Lauf `run_paket8.sh`.
- Stufe 2 im Browser: D5 (Browser-Teil), D8, F9 (Browser-Teil), F11, S1, S2, S3, B2, T2, T3, T4, T5, T6.
- Release-Paket mit R1-Prüfung, R3/R5-Anleitung, nur mit Freigabe (E040, Projektregel 7).
