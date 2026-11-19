# Bericht Paket 22 – Digicomp-Archiv, neues Angebot BILDER, CH-Zugang Altfälle (19.11.2026)

Auftrag (Owner 19.11.): «1. archivieren, bitte Bilder aufnehmen 2. ja» auf die Fragen aus Paket 21 §6 (Digicomp 041, 044, 033; Abruf der Anbieterseiten für OFFER-MAZ-086 und OFFER-AJM-002). Arbeitszweig `claude/datenharmonisierung`, nur kostenlose Abrufe (Chrome für digicomp.ch, WebFetch für maz.ch und unine.ch). Kein Release ohne Freigabe.

## 1. Entscheide und Umsetzung

| ID | Inhalt | Umsetzung |
|---|---|---|
| E142 | Digicomp 041 Publisher Professional, 044 Adobe Video- und Audio – Basic, 033 Affinity Photo archivieren (E015, wie E103) | `publicationStatus` HOLD, `publicationReason` «ARCHIV: Kurs nicht mehr im Angebot (Nachrecherche 19.11.2026; E015; E142)»; Master `beta_sichtbar` NEIN, `beta_grund` gleich; Zeilen bleiben (E121) |
| E143 | Neues Angebot OFFER-DIGICOMP-075 «Bilder für Print, Web & Social Media – Erstellung und Bearbeitung (Einsteiger/innen)» (Code BILDER) | alle Felder wie die übrigen Digicomp-Kurse, Angaben nach Kursseite 19.11.: CHF 1'200 zzgl. 8.1% MWST, 2 Tage, Deutsch, Einstieg, 4 Termine 2027 (`sessions`), Ort «Zürich, Basel, Bern», CH-Zugang ja (E066), Kursform HYBRID (je Termin «Vor Ort» oder «Virtuell» wählbar); Smart-Daten-Eintrag CHF 1200 regulär, MWST exkl.; Master neue Zeile (Kohorte NEU_P22) |
| E144 | MAZ-086 und AJM-002 CH-Zugang «ja» nach E066 | `laender.chZugang` und Master `ch_zugang`, `ch_zugang_regel`; Ort und Sicherheitsgrad unverändert |

Belege [GEPRÜFT/GELESEN]:
- Digicomp (Chrome 19.11.): Kurzlinks `/d/9PM`, `/d/praeau`, `/d/affpho` und die alten Kursseiten melden «Diese URL ist nicht mehr gültig»; Gegenprobe `/d/AP6` leitet auf die Kursseite. Die Lehrgangsliste führt Publisher Professional nicht mehr; die Übersichtsseiten After Effects und Premiere verlinken noch auf die toten Kurzlinks. Datei `out/digicomp_nachrecherche_20261119.tsv`.
- BILDER: eigener Kurs; die Kursseite nennt Affinity Photo als Werkzeug, ein Nachfolger von OFFER-DIGICOMP-033 ist nicht belegt. Die schema.org-Termine sind alle «Offline»; «Virtuell» ist eine Wahl je Termin, keine eigene Online-Durchführung. Darum Ort nur mit Städten (wie E139), Kursform HYBRID.
- MAZ-086 (maz.ch/kurs/leadership, 19.11.): Lehrgang von Akademie für Publizistik (Hamburg), MAZ (Luzern) und HSG (St. Gallen), «16 Tage in der Schweiz und in Hamburg»; einzelne Module digital; Termine nur über my.maz.ch. Sonderprogramm mit Partnern, die Schweizer Kursorte sind aber Teil des Programms.
- AJM-002 (unine.ch/ajm/maji, 19.11.): 1. Studienjahr Neuenburg, 2. Jahr Louvain-la-Neuve (Doppeldiplom).

## 2. Wirkung

- Sichtbare Angebote: 19.11. 1'018 → 1'016, 01.12. 947 → 945 (weg nur 033, 041, 044; neu nur 075). 075 bleibt bis zum letzten Termin 20.12.2027 sichtbar.
- Website-Daten `data-p22.js`: 1'353 Angebote (vorher 1'352). Master `master_3818_aktuell.csv`: 3'819 Zeilen (Dateiname bleibt), Beta sichtbar JA 3'441 · NEIN 378.
- E066 gilt jetzt ohne Ausnahme: kein Angebot mit Ort Schweiz ohne CH-Zugang «ja» (vorher 2).

## 3. Dateien

- `config/korrekturen.csv` (8 Felder mit altem Wert, Master-Feld, Register, Quelle), `config/neue_angebote.json` (Angebot + Smart-Eintrag)
- `scripts/build_daten_p22.py` → `website/data-p22.js`, `out/smart-search-data-p22.json`
- `scripts/build_release.py` (index auf `data-p22.js`, `smart-search-data-p22.js`; Rückweg = Live-Stand Paket 21, byte-gleich)
- `../scripts/master_nachtraege.py` Block Paket 22; `../scripts/test_nachtraege.py` N01, N02, N05, N06 angepasst, N13, N14 neu
- `../paket8/tests/test_paket8.js` D2a: Soll 1'352 + `NEU` (Umgebungsvariable, Paket 22: `NEU=1`)
- `tests/test_paket22.js`

## 4. Tests

- `test_paket22.js` 10/10 (reproduzierbar, nur gelistete Felder, Sichtbarkeit, Archiv, neues Angebot vollständig, Smart-Daten, E144/E066, Release und Rückweg)
- `test_nachtraege.py` 14/14
- Stufe 1 (`WEBSITE=claude-work/paket22/website APP=app-v43.js DATA=…/data-p22.js SMART=…/smart-search-data-p22.json MASTER=…/master_3818_aktuell.csv NEU=1`): 35 PASS, 0 FAIL, 4 später an beiden Stichtagen (19.11., 01.12.)
- Stufe 2 Browser: 10 PASS; D8 FAIL bekannt und entfallen (E105)
- Browser Stufe 1 (`test_browser_p8.js`): B1, B3a, B3b, S1 PASS; T1, T5 Soll offen wie live
- Pakete 5, 6, 7, 9, 10 grün an beiden Stichtagen; `test_paket21.js` 11/11; R1 PASS, SHA256SUMS OK

## 5. Offen für den Owner

1. Nachtrag Paket 22 bestätigen.
2. Release: freigegeben 19.11. (E145); Paket 21 wird nicht separat hochgeladen. `mediaskills_paket22_20261119.zip`: website/ 22 Dateien + `.htaccess`, R1 PASS, SHA256SUMS OK; `rollback/index.html` = Live-Stand 18.11. (data-p18.js).
