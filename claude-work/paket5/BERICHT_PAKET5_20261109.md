# BERICHT Paket 5 – App-Code für publicationStatus und sessions (09.11.2026)

Auftrag: GESAMTWISSENSSTAND §5 Punkt 6, nur auf `claude/datenharmonisierung`. Nicht in diesem Paket: `main`, Release, `index.html`, Erzeugen von `data.js` aus dem Merge-Kandidaten, kostenpflichtige Läufe.
Beleg: [GEPRÜFT] gerechnet bzw. per Test abgesichert · [GELESEN] Original gelesen.

## 1. Grundlage
- Basis ist `app-v33.js` aus dem Live-Snapshot (E035, E044), SHA-256 `046887cd76d2…`.
- Die Funktion existiert in GitHub main bereits; sie wird übernommen, nicht neu entwickelt (ERLEDIGT D, E035) [GELESEN]:
  - `f420299` (17.10.) HOLD-Filter
  - `9efdea9` (20.10.) nächster Termin aus `sessions` für Sichtbarkeit, Karte, Sortierung «Nächster Start»
  - `3b3cbfb` (20.10.) Region des gewählten Termins
- Bewusst **nicht** übernommen: `89b9a1a` (vergangene Termine ohne `sessions` ausblenden, «Bereits begonnen …»). Das ist §5 Punkt 3 (E014), eigener Auftrag.
- Entscheide, die der Code umsetzt: E061 (`sessions` übernommen), E063/E071 (46 HOLD nicht sichtbar), E042.

## 2. Umsetzung
- `website/app-v34.js` (SHA-256 `eb6fc9c57992…`), erzeugt mit `scripts/port_app_v34.py` aus `app-v33.js`: 8 exakte Ersetzungen, jede muss genau einmal passen, sonst Abbruch. 25 geänderte Zeilen.
- Eine Stelle für HOLD: die Liste `offers`. Katalog, Filteroptionen, Smart-Suche, Preisbänder und Merkliste lesen alle aus `offers` [GEPRÜFT].
- Ohne `sessions` bleibt die Live-Regel unverändert (`endDate` leer oder ≥ heute).

## 3. Tests [GEPRÜFT]
`TZ=Europe/Zurich NODE_PATH=<jsdom>/node_modules node claude-work/paket5/tests/test_app_v34.js` (jsdom 24, Stichtag fest 09.11.2026): **19/19 PASS**.
- R01–R03 Regression: mit den Live-Daten liefert v34 exakt das gleiche Karten-HTML, den gleichen Zähler (1'097, deckt sich mit §3) und die gleiche Smart-Suche wie v33.
- K01–K09 Merge-Kandidat: sichtbare Menge = unabhängige Referenz; kein HOLD in Katalog und Smart-Suche (Titelsuche je HOLD: v34 0, Gegenprobe v33 36); Karten zeigen nächsten Termin und dessen Region; die 4 Angebote mit leerem `endDate` (E061) richtig; PCC-P08 ausgeblendet; Sortierung nach nächstem Termin.
- M01–M05 Manipulation: nur vergangene Termine → aus; HOLD → aus; Termin ohne gültiges Datum ignoriert; ohne `sessions` bleibt Live-Verhalten; andere Statuswerte blenden nicht aus. D01 reproduzierbar.

## 4. Wirkung auf den Merge-Kandidaten am 09.11. [GEPRÜFT]
| Grösse | app-v33 | app-v34 |
|---|---|---|
| sichtbare Angebote | 1'098 | 1'094 |
| davon ausgeblendet wegen HOLD | 0 | 36 (die übrigen 10 HOLD sind schon über das Enddatum aus) |
| sichtbar dank künftigem Termin in `sessions` trotz vergangenem `endDate` | 0 | 32 |
| Karten mit Termin aus `sessions` | 0 | 40 (von 41; CAD-001 ohne künftigen Start) |

Abgleich mit `master_3818.csv`: alle 46 Zeilen mit `beta_sichtbar` NEIN sind ausgeblendet; sichtbar sind nur Zeilen mit JA. Die 32 neu sichtbaren haben im Master JA und `termin_status` ZUKUENFTIG.

## 5. Hinweise
- CAD-001 (Durchführung 26.10.–10.11.2026 läuft): main zählt nur Termine mit künftigem Start, der Master-Terminstatus zählt bis zum Enddatum. Übernommen ist die main-Regel; betrifft am 09.11. nur dieses Angebot.
- Laufende Kurse **ohne** `sessions` bleiben nach Live-Regel sichtbar. Die Angleichung gehört zu §5 Punkt 3.
- Für eine Veröffentlichung fehlen noch: `index.html` auf `app-v34.js` umstellen, `data.js`/`smart-search-data.js` aus dem Kandidaten erzeugen, Release-Paket mit Rollback (Projektregel 7, E040).
