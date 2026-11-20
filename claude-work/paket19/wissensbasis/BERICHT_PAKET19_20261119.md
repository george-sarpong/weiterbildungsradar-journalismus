# Bericht Paket 19 – Kursliste im HTML der Startseite, Datendatei ohne `korrekturen` (19.11.2026)

Auftrag (Owner 19.11.): Paket 19 nach `SPEZIFIKATION_PAKET19_20261119.md` (E154–E158) umsetzen und testen, auf `claude/datenharmonisierung`, zuerst die Lese-Prüfschritte U1–U6. **Kein Release ohne Owner-Freigabe.** Stichtag des Builds S0 = 19.11.2026.

## 1. Lese-Prüfschritte (Spezifikation §8)

| Schritt | Befund | Folge |
|---|---|---|
| U1 | `app-v43.js` Z. 1726: `el.cards.innerHTML = sorted.map(card).join("")` ersetzt den ganzen Inhalt von `#cards` | Liste steht in `#cards`; **kein `app-v44.js`** (A7) |
| U2 | Funktionen liegen in einer geschlossenen Funktion (IIFE), nicht einzeln aufrufbar; die ganze App läuft in jsdom mit festem Stichtag (wie Paket 8) | Build liest Titel, Anbieter, Ort, Preis, Link aus den Karten, die `app-v43.js` rendert: gleiches Gate, gleiche Formatierung, gleiche Sortierung, keine zweite Logik (A3–A5) |
| U3 | `smart-search-data-p22` enthält `korrekturen` bei 51 Mediencampus-Einträgen (E107, E109) | B4/E156: `smart-search-data-p19.js` ohne das Feld |
| U4 | `methodik.html` zuletzt geändert mit Paket 20 (Commit a3c38a3, 17.11.2026); Paket 21 und 22 byte-gleich | `lastmod` Methodik 2026-11-17 (`config/sitemap_lastmod.csv`) |
| U5 | «Datenstand: 30. September 2026 · Schweiz, Österreich und Liechtenstein» in der Fusszeile von `index.html`; derselbe Satz in `404.html`, `datenschutz.html`, `impressum.html`, `methodik.html` | Startseite: nur «Datenstand: 30. September 2026 ·» entfällt; andere Seiten nur gemeldet, unverändert |
| U6 | Search Console: Schalter «Einstellungen › Search generative AI» (Einschliessen/Ausschliessen), wird laut Google erst einem Teil der Konten ausgerollt (support.google.com/webmasters/answer/16908024) | Nur Befund; Prüfung durch den Owner im eigenen Konto |

Nebenbefund: `index.html` hat seit Live-Stand A einen JSON-LD-Block «WebSite». E157 betrifft neues JSON-LD; der Block bleibt unverändert.

## 2. Umsetzung

| Datei | Inhalt |
|---|---|
| `scripts/build_p19.sh <Stichtag>` | Einstieg (D1): kopiert `paket22/website/`, ruft die beiden Skripte |
| `scripts/build_daten_p19.py` | B2-Prüfung, dann `website/data-p19.js` und `out/smart-search-data-p19.json` ohne `korrekturen`; bricht ab und meldet, wenn ein Eintrag kein Gegenstück hat |
| `scripts/build_liste_p19.js` | rendert `app-v43.js` am Stichtag (jsdom), schreibt Liste und «Stand der Angaben» in `website/index.html`, `website/sitemap.xml`, `out/zaehlprotokoll_<Stichtag>.json` |
| `scripts/build_release.py <ziel>` | Release-Paket (D3) mit Rückweg; setzt die Skriptverweise auf `data-p19.js`, `smart-search-data-p19.js`, `app-v43.js` (im Website-Ordner bleiben sie wie seit Paket 7, damit die Regressionstests unverändert laufen) |
| `config/sitemap_lastmod.csv` | lastmod Methodik mit Beleg (U4) |
| `tests/test_paket19.js`, `tests/test_browser_p19.js`, `tests/test_apache_p19.sh` | Testliste §7 |

**Liste (A1–A10):** in `<section id="angebote">`, in `#cards`, Block `<div class="static-list">` mit `<h3>Alle aktuellen Angebote</h3>` und `<ul>`. Je Eintrag: `<a href="URL" target="_blank" rel="noopener noreferrer">Titel</a> · Anbieter · Ort: … · Preis: …`, Texte zeichengleich mit der Karte. Über `#cards`: `<p class="data-stand">Stand der Angaben: 19.11.2026</p>`, auch mit JavaScript sichtbar. Fusszeile Startseite: «Schweiz, Österreich und Liechtenstein». Keine neuen Skripte, keine `style`-Attribute, keine externen Ressourcen, CSS unverändert.

**B2 [GEPRÜFT]:** 3'664 `korrekturen`-Einträge (1'317 Angebote) in `data-p22.js` haben alle ein Gegenstück: 3'663 in den `korrekturen.csv` der Pakete 13, 14, 16, 17 (2 Dateien), 18, 21, 22, 1 in `paket22/config/neue_angebote.json` (E143). 51 Smart-Einträge haben ihr Gegenstück in der `priceDisplay`-Zeile von `paket14/config/korrekturen.csv`. Protokoll `out/b2_herkunft.json`.

**B5:** Die Tests 14, 16 und 22 lesen die Herkunft schon heute aus den Repo-Dateien ihres eigenen Pakets (`data-p14.js`, `data-p16.js`, `data-p22.js`), die unverändert bleiben. Eine Anpassung war nicht nötig.

## 3. Wirkung [GEPRÜFT]

- Startseite ohne JavaScript: 1'016 Kurse am 19.11. (alle mit Link), am 01.12. wären es 945. Ausgeblendet am 19.11.: 337 (51 HOLD, 286 nicht aktuell).
- `data-p19.js` 1'595'112 Byte statt 2'486'409 (−36 %); `smart-search-data-p19.js` 1'016'445 statt 1'030'960 Byte.
- `index.html` 298'271 Byte = 291,3 KB (Budget 300 KB). **Reserve rund 9 KB, das reicht für etwa 30 weitere Einträge.** Für mehr Kurse muss das Budget A10 neu entschieden werden.
- `sitemap.xml`: `/` 2026-11-19, `/methodik.html` 2026-11-17.
- Release-Paket: 15 Dateien, 6,29 MB inkl. Rückweg Paket 22 (Budget 9 MB).

## 4. Tests (Spezifikation §7, 40 Prüfungen)

| Bereich | Ergebnis |
|---|---|
| 7.1 Liste und Gate L01–L12 | L01–L11 PASS (L01, L02 an 19.11. und 01.12.; L04: 35 Grenzfälle mit Datum 18.–20.11., 0 Abweichungen zu `isCurrent`; L05 Drift 72 nur in der Liste, 1 nur in der App; L06 in jsdom und Chrome zeichengleich; L08 789 Beträge, 0 falsch). **L12 Soll offen**: kein Netz zu Anbieterseiten im Arbeitsbereich (wie T5) |
| 7.2 ohne/mit JavaScript J01–J05 | PASS (J01 lokal per jsdom, curl und Chrome; live = V02). Zusätzlich axe-core auf der Liste ohne JavaScript: 0 Befunde «critical»/«serious» |
| 7.3 Datendatei D01–D05 | PASS. D03 mit Gegenprobe: erfundener Eintrag → Build bricht ab, nichts entfernt. D05: `test_paket14.js` 8/8, `test_paket22.js` 10/10, `test_paket16.js` U1, U2 (Herkunft) PASS; U3 und U5 FAIL nur wegen fester Zahlen vom 10.11. (1'068 sichtbar, 113 Karten; heute 1'018 bzw. 109 auf den unveränderten Abnahme-Ständen 15/16), kein Bezug zu Paket 19 |
| 7.4 Sitemap S01–S03 | PASS (S02: gleiche Liste → lastmod bleibt, geänderte Liste → Stichtag; `test_robots.py` 6/6) |
| 7.5 Build, Paket R01–R06 | PASS (R01 byte-gleich; R02 R1 PASS, Rückweg = Release Paket 22 byte-gleich; R04, R05 Apache mit `.htaccess`: Status 200, Sicherheits-Header je 7/7; R06 Nu Html Checker: 2 Fehler wie Paket 22, keine neuen) |
| 7.6 Regression X01–X04 | PASS: Stufe 1 35 PASS / 0 FAIL / 4 später an 19.11. und 01.12.; Stufe 2 10 PASS (D8 entfallen, E105); B1, B3a, B3b, S1 PASS, T1/T5 Soll offen wie live; Pakete 5, 6, 7, 9, 10 an beiden Stichtagen grün; `test_paket20.js` 11/11 (Abnahme-Stände 18/20 aus Git), `test_paket21.js` 11/11, `test_paket22.js` 10/10, `test_nachtraege.py` 14/14 |
| 7.7 Live V01–V05 | PASS am 20.11.2026 nach Upload (§6, E164) |

Aufrufe (Repo-Root, `NODE_PATH` mit jsdom, axe-core, vnu-jar, playwright-core; Apache 2.4):
`bash claude-work/paket19/scripts/build_p19.sh 2026-11-19` (aus `claude-work/`) · `node claude-work/paket19/tests/test_paket19.js` · `bash claude-work/paket19/tests/test_apache_p19.sh` · `QUELLE=<website> bash claude-work/paket20/tests/test_sicherheit.sh`.

## 5. Befunde

1. **Zweite Art Zeit-Drift (neu):** Der Ort folgt dem nächsten Termin (`currentRegion`). Bei OFFER-NOBLE-067 steht in der Liste «Schweiz · Basel / Live-Online», am 01.12. zeigt die App «Schweiz · Genf (angeboten) / Live-Online». Am Stichtag ist der Text richtig (A3). Mit dem Neubau bei jedem Release (E155) korrigiert sich das.
2. **Darstellung ohne JavaScript:** `#cards` ist ein zweispaltiges Raster. Die Liste steht als ein Block in der linken Spalte, auf dem Desktop also in halber Breite, auf dem Handy in voller Breite. Volle Breite braucht eine CSS-Regel → Gestaltung (später).
3. **Kurzes Aufblitzen:** Beim Laden mit JavaScript ist die Liste sichtbar, bis `app-v43.js` gelaufen ist. Danach ist sie ersetzt (J02).
4. Ortsangaben der Karten enthalten teils selbst « · » (z. B. «keine Angabe · auf Anfrage»). Die Liste übernimmt das zeichengleich.
5. U6: Search Console prüfen (Owner).

## 6. Upload (E163, ausgeführt 20.11.2026)

1. ZIP öffnen und in den Ordner `website` gehen (nicht `rollback`, nicht `DATEILISTE.txt`). (1 Min.)
2. Web-FTP: im Hauptordner alles löschen ausser `.ftpquota` und `.htaccess`. (3 Min.)
3. Alle 15 Dateien aus `website` markieren und in einem Schritt per Drag and Drop in den Hauptordner ziehen. (5 Min.)
4. Claude prüft live V01–V05. (10 Min.) Nur bei einem Fehler: `rollback/index.html` als `index.html` hochladen.

Ergebnis 20.11.2026 (E164): V01 15 Dateien per SHA-256 = Paket; V02 Startseite ohne JavaScript mit 1'006 Kursen und «Stand der Angaben: 20.11.2026»; V03 securityheaders.com Note A (CSP, nosniff, Referrer-Policy, HSTS); V04 `sitemap.xml` mit lastmod 2026-11-20 / 2026-11-17; V05 kein Rückweg nötig. Paket 19 ist live.

## 7. Offen für den Owner

1. erledigt: Release freigegeben (E161), live seit 20.11. (E164).
2. erledigt: Nachtrag bestätigt (E162), Nachtrag live bestätigt (E165).
3. erledigt: Search Console eingerichtet, Schalter auf «berücksichtigen» (E160); `sitemap.xml` eingereicht 20.11.; offen: Status dort in den Folgetagen kontrollieren.

## 8. Vorschlag Nachtrag GESAMTWISSENSSTAND (eingetragen 20.11., E162; Live-Stand E163, E164)

- §4 Website-Stände: Kandidat `claude-work/paket19/website/` (`index.html` mit Kursliste und «Stand der Angaben», `data-p19.js` ohne `korrekturen`, `sitemap.xml`); Smart-Daten `paket19/out/smart-search-data-p19.json`; `app-v43.js` unverändert.
- §9: Paket 19 am 19.11. umgesetzt und getestet: U1–U6 erledigt; 1'016 Kurse im HTML (19.11.); `data-p19.js` −36 %; 33 von 38 Muss PASS (V01–V05 erst nach Upload), Soll R06 PASS, L12 offen; Befunde Ort-Drift, halbe Breite ohne JavaScript, Reserve `index.html` ~9 KB; Release nur mit Freigabe.
- §10: Release-Freigabe Paket 19 offen; U6 beim Owner.
