# BERICHT Paket 15 – Smart-Suche nach virtuellen Nutzertests (E110), 10.11.2026

Auftrag: Owner-Antwort «ja alle» auf die Vorschläge A–D nach 40 virtuellen Nutzeranfragen (E110). Arbeitszweig `claude/datenharmonisierung`, Commit **7396ddc**, kein Merge nach `main`.

## 1. Was sich ändert (nur `app-v41.js`)

`app-v41.js` = `app-v40.js` + E110, erzeugt von `paket15/scripts/port_p15.py` (reproduzierbar). Alle anderen Website-Dateien sind identisch mit Paket 14; `index.html` lädt nur das neue Script. Daten unverändert (`data-p14.js`, `smart-search-data-p14`).

| Teil | Wirkung | Beispiel |
|---|---|---|
| A Füllwörter | Personen-, Form- und Füllwörter (auch FR/IT/EN) sind kein Thema. «…kurs», «…seminar», «…workshop» wird gekürzt; das gekürzte Wort muss am Wortanfang stehen | «Führungskurs für Chefredaktor:innen» → Thema Führung, 9 statt 392 Treffer (vorher passte «Durchführung») |
| A Sprachen | «en ligne», «in linea», «présentiel», «gratuit», «free», «data journalism», «English» werden wie die deutschen Wörter verstanden | «cours de vidéo en ligne» → Video, Online |
| B Teiltreffer | Passt kein Angebot zu allen Wörtern, erscheinen die Angebote mit den meisten Wörtern als «passt teilweise» | «Barrierefreie Kommunikation» → 172 teilweise |
| B Nulltreffer | Bei null Treffern sagt die Suche, wie viele Angebote das Thema allein hat und welche Bedingung (Ort, Durchführung, Sprache, Budget, kostenlos) wegfallen kann | «corso giornalismo Lugano» → «Zum Thema allein gibt es 380 Angebote. Lass Ort weg …» |
| C Orte | 27 Orte (DE/FR/IT-Namen) wirken als Kursort-Filter, nicht als Thema | «Kurs in Basel» → 52 Angebote, alle mit Basel |
| D Synonyme | Gleichbedeutende Begriffe werden mitgesucht (Fotojournalismus/Bildjournalismus, Faktencheck/Verifikation, KI/AI, Datenjournalismus/datajournalisme, Journalismus/journalisme/giornalismo, Podcast/Audio u. a.) | «Verifikation und Faktencheck» → 15 |

Von Claude als Teil von A/B ergänzt: Wortanfang-Regel für gekürzte Wörter, Nulltreffer-Hinweis.

## 2. Virtuelle Tests (40 Anfragen, `paket15/tests/virtuelle_tests.js`, Ergebnis `paket15/out/virtuelle_tests.json`)

32 voll getroffen, 4 «passt teilweise», 4 null mit Hinweis. Die 4 Nulltreffer sind echte Lücken im Bestand [GEPRÜFT]: kein Journalismus-Kurs in Lugano; kein Datenjournalismus online auf Englisch; Foto-/Bildjournalismus nur «auf Anfrage» oder hybrid, nicht als reine Präsenz bestätigt; kein bestätigt kostenloses KI-Webinar.

## 3. Tests

| Test | Ergebnis |
|---|---|
| `paket15/tests/test_paket15.js` (Reproduzierbarkeit, unveränderte Dateien, A1–A4, B1–B2, C1–C3, D1–D2, Owner-Fälle E106/E107) | 17/17 PASS |
| Stufe 1 `test_paket8.js` (Paket 15, Master-Nachtrag Paket 13) | 35 PASS, 0 FAIL, 4 später an beiden Stichtagen |
| Stufe 2 `test_stufe2_browser.js` (NO_D8, E105) | 10 PASS, 0 FAIL |
| `test_browser_p8.js` | B1, B3a, B3b, S1-Vorprüfung PASS |

Änderungen in Stufe 1 gegenüber Paket 14: T01 10 → 14 Treffer (französische Datajournalisme-Kurse über Synonym), T14a 0 → 3 gezeigt (Podcast/Audio). F4b fiel zuerst durch, weil erstmals ein Angebot mit «Kostenlos mit Bedingung: für Mitglieder» in einer Budget-Liste erschien; das ist eine Tarifbezeichnung nach E057. Die Prüfung erkennt diese Form jetzt an (Kommentar im Test); Paket 14 bleibt damit 35 PASS, 0 FAIL.

## 4. Abnahme-Stand

`docs/` neu gebaut mit `app-v41.js`. Link: `https://raw.githack.com/george-sarpong/weiterbildungsradar-journalismus/7396ddce6a54530c8a7af26e85c189463f1dfb6d/docs/index.html`. GitHub Pages zeigt weiter `main`.

## 5. Offen

Bestätigung Nachträge 14 und 15 (§10 Punkt 15); Owner-Abnahme läuft weiter; Master-Nachträge in `run_paket3.sh`; Gestaltung später; Release nur mit Freigabe.
