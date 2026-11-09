# BERICHT Paket 5 – App-Code für publicationStatus und sessions (09.11.2026), Fassung 2

Auftrag: GESAMTWISSENSSTAND §5 Punkt 6, nur auf `claude/datenharmonisierung`.
Nicht in diesem Paket: `main`, Release, `index.html`, Methodik-Text, `data.js` aus dem Merge-Kandidaten erzeugen, §5 Punkt 3 (vergangene Termine ohne `sessions`), kostenpflichtige Läufe.
Beleg: [GEPRÜFT] gerechnet bzw. per Test abgesichert · [GELESEN] Original gelesen.

## 1. Grundlage [GELESEN]
- Basis: `app-v33.js` aus dem Live-Snapshot (E035, E044), SHA-256 `046887cd76d2…`.
- Die Funktion existiert in GitHub main (5f09e07) bereits; übernommen, nicht neu entwickelt (ERLEDIGT D, E035):
  - `f420299` (17.10.) HOLD-Filter; laut Commit-Text freigegeben 17.10. (QA09 R2_026, Gate D PASS)
  - `9efdea9` (20.10.) nächster Termin aus `sessions` für Sichtbarkeit, Karte, Sortierung «Nächster Start»
  - `3b3cbfb` (20.10.) Region des gewählten Termins
- Nach `3b3cbfb` hat main an dieser Logik nichts mehr geändert; keine andere main-Datei nutzt `sessions` oder `publicationStatus`.
- Nicht übernommen: `89b9a1a` (Angebote ohne `sessions` mit vergangenem Start ausblenden) = §5 Punkt 3 (E014), eigener Auftrag.
- Umgesetzte Entscheide: E061 (`sessions`), E063 und E071 (46 HOLD nicht sichtbar), E042.

## 2. Umsetzung [GEPRÜFT]
- `website/app-v34.js` (SHA-256 `eb6fc9c57992…`), erzeugt mit `scripts/port_app_v34.py`. Das Skript prüft den Hash der Quelle und bricht ab, wenn eine der 8 Ersetzungen nicht genau einmal passt. Umfang: +22 / −6 Zeilen.
- HOLD wirkt an einer Stelle, der Liste `offers`. Katalog, Filteroptionen, Smart-Suche, Preisbänder und Merkliste lesen nur daraus. Die URL kennt nur Suche, Filter und Sortierung, keinen Direktlink auf eine Angebots-ID.
- Ohne `sessions` gilt unverändert die Live-Regel (`endDate` leer oder ≥ heute).

## 3. Vergleich mit PR10 (82bb95f9, nur Quellenmaterial, E033) [GEPRÜFT]
PR10 erweitert dieselbe Logik um drei Punkte. Keiner wirkt auf den Merge-Kandidaten, deshalb nicht übernommen:
| PR10-Erweiterung | Wirkung im Kandidaten |
|---|---|
| ausgebuchte Termine (`availabilityStatus` SOLD_OUT) überspringen | 0 Termine mit diesem Feld |
| Selbstlern-Projektion bei abgelaufenen Präsenzterminen (nur mit VERIFIED-Sidecar) | 0, auch künftig: die drei möglichen Fälle CAD-001/-003/-005 haben Sidecar UNKNOWN |
| begonnene, laufende Kurse ohne `sessions` als «Buchbarkeit unbestätigt» | betrifft 60 Angebote ohne `sessions` → §5 Punkt 3 |

## 4. Tests [GEPRÜFT]
`claude-work/paket5/tests/test_app_v34.js` mit jsdom 24 (separat installieren: `npm i jsdom@24`), Aufruf im Repo-Root:
`TZ=Europe/Zurich NODE_PATH=<ordner>/node_modules node claude-work/paket5/tests/test_app_v34.js`
Ergebnis: **24/24 PASS** am Stichtag 09.11.2026, ebenso 24/24 mit `STICHTAG=2026-12-01`.
- R01–R03 Regression: mit Live-Daten gleiches Karten-HTML, gleicher Zähler (09.11.: 1'097 = GESAMTWISSENSSTAND §3) und gleiche Smart-Suche wie v33.
- K00–K11 Merge-Kandidat: sichtbare Menge = unabhängige Referenz; kein HOLD in Katalog und Smart-Suche; Karte zeigt nächsten Termin und dessen Region; 4 Angebote mit leerem `endDate` (E061) richtig; PCC-P08 aus; Sortierung nach nächstem Termin. Gegenproben mit v33 (K03, K09, K10, K11) zeigen, dass die Tests trennscharf sind.
- M01–M07 Manipulation und Grenzfälle: nur vergangene Termine → aus; HOLD → aus; Termin ohne gültiges Datum ignoriert; ohne `sessions` Live-Verhalten; andere Statuswerte blenden nicht aus; Start am Stichtag zählt; Termin ohne Label → TT.MM.JJJJ.
- D01–D02: zwei Läufe identisch; Port-Skript erzeugt `app-v34.js` byte-identisch neu.

## 5. Wirkung auf den Merge-Kandidaten [GEPRÜFT]
| Grösse | 09.11.2026 | 01.12.2026 |
|---|---|---|
| sichtbar mit app-v33 | 1'098 | 1'003 |
| sichtbar mit app-v34 | 1'094 | 994 |
| davon weg wegen HOLD | 36 (übrige 10 HOLD schon über `endDate` aus) | 33 |
| neu sichtbar: `endDate` vorbei, künftiger Termin in `sessions` | 32 | 24 |
| `sessions`-Angebote mit künftigem Termin | 40 von 41 | 31 von 41 |

1'098 (Kandidat) und 1'097 (Live) unterscheiden sich wegen der Daten, nicht wegen des Codes.
Abgleich mit `master_3818.csv` am 09.11.: alle 46 Zeilen mit `beta_sichtbar` NEIN sind aus; sichtbar sind nur Zeilen mit JA. Die 32 neu sichtbaren haben im Master JA und `termin_status` ZUKUENFTIG.

## 6. Hinweise (ohne Änderung)
1. CAD-001 (Termin 26.10.–10.11.2026 läuft): main zählt nur Termine mit künftigem Start, der Master-Terminstatus zählt bis zum Enddatum. Übernommen ist die main-Regel; am 09.11. nur dieses Angebot.
2. Laufende Kurse **ohne** `sessions` (60) bleiben nach Live-Regel sichtbar; Angleichung gehört zu §5 Punkt 3.
3. Terminlisten veralten schnell: bis 01.12. verlieren 9 weitere `sessions`-Angebote ihren letzten künftigen Termin und verschwinden.
4. HOLD-Angebote bleiben wie in main in `data.js` enthalten und im Quelltext lesbar (inkl. `publicationReason` bei PCC-P32); ausgeblendet ist nur die Anzeige.
5. `methodik.html` beschreibt das Ausblenden nach Enddatum, nicht HOLD.

## 7. Korrekturen gegenüber Fassung 1
- Diff-Umfang +22/−6 statt «25 geänderte Zeilen».
- Tests 24/24 statt 19/19: neu Gegenproben K10/K11, Grenzfälle M06/M07, Reproduzierbarkeit D02, zweiter Stichtag.
- Neu: PR10-Vergleich (§3), Wirkung am 01.12. (§5), Hinweise 3–5 (§6), Erklärung 1'098 vs. 1'097.

## 8. Drift-Prüfung
Geändert wurden nur HOLD-Filter und `sessions`-Auswertung (§5 Punkt 6). Unberührt: Live-Regel ohne `sessions`, Sortieroptionen (§5 Punkt 2), Währungshinweis (§5 Punkt 1), `country` (§5 Punkt 5), Methodik-Text, PR10-Funktionen, `main`, Release.

## 9. Offen
- Gepusht am 09.11. auf `claude/datenharmonisierung`: `5222bf6` (Umsetzung) und `dde33a4` (Fassung 2); Inhalt identisch mit den lokalen Vorgängern 31aad3a/e34c01e. Kein Merge nach `main`.
- Für eine Veröffentlichung: `index.html` auf `app-v34.js` umstellen, `data.js` und `smart-search-data.js` aus dem Kandidaten erzeugen, Release-Paket mit Rollback (Projektregel 7, E040).
