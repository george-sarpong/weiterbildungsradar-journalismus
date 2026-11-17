# BERICHT Paket 20 – Übergabe 17.11.2026 abgearbeitet (E119–E125), 17.11.2026

Auftrag: Owner 17.11. «Lies GESAMTWISSENSSTAND.md, ENTSCHEIDUNGSREGISTER.csv und UEBERGABE_20261117.md und arbeite die Übergabe ab.» Grundlage `UEBERGABE_20261117.md` §3 Punkte 1–5; Punkt 6 (Release-Paket) erst nach Freigabe. Ausgangsstand Arbeitszweig `claude/datenharmonisierung` a8b146e. **Nicht gepusht:** Schreibzugriff auf GitHub in diesem Chat abgelehnt; lokaler Commit, Übergabe als Git-Bundle (§8). Kein Merge nach `main`.

## 1. Register und Wissensstand (Übergabe §3 Punkt 1)

Register E119–E125 neu; Bemerkungen nachgeführt bei E040 (Ausnahme E120), E081 (teilweise abgelöst durch E122), E098 (Master nachgeführt), E099 (T3 abgelöst durch E124), E116 (abgelöst durch E122), E118 (Master-Nachtrag, E122, E123). GESAMTWISSENSSTAND fortgeschrieben (§2, §3, §4, §7, §9, §10), Vormerkung GEO/LLMO in §9 «Später». Wortlaute der Owner-Aussagen aus `UEBERGABE_20261117.md` §1.

## 2. Master-Nachträge Pakete 13, 14, 18 (Übergabe §3 Punkt 2)

- `scripts/master_nachtraege.py` liest die Korrekturlisten `paket13/config/owner_korrekturen.csv`, `paket14/config/korrekturen.csv`, `paket18/config/korrekturen.csv`, prüft jeden alten Wert (sonst Abbruch) und schreibt **`paket3/out/master_3818_aktuell.csv`** mit Herkunft je Feld (`OWNER_E098`, `OWNER_E103`, `ANBIETERSEITE_E107/E109`, `DOMAIN_E118`) und Protokoll `paket3/out/master_nachtraege_protokoll.csv` (2'111 Felder). In `run_paket3.sh` nach `test_paket3.py` eingebunden, danach `scripts/test_nachtraege.py`.
- **Warum eine eigene Datei:** `paket7/scripts/build_daten_p7.py` baut `data-p7.js` aus `master_3818.csv`, und alle späteren Datendateien (p13 bis p18) bauen darauf auf. Ein überschriebener `master_3818.csv` hätte `data-p7.js` beim nächsten Testlauf still verändert (im Test so aufgetreten, sofort zurückgesetzt). Die Basis `master_3818.csv` bleibt deshalb byte-gleich; aktueller Master = `master_3818_aktuell.csv`. [GEPRÜFT]
- Ergebnis: Beta sichtbar JA 3'443 · NEIN 375 (vorher 3'445 / 373; E103); Anbieterland belegt 956 (22 Audit DJA + 934 Domain E118); 51 Mediencampus-Preise CHF 1'150 inkl. Preisoption; URL OFFER-HEAD-003. Deckungsgleich mit `data-p18.js` und mit `paket13/out/master_3818_p13.csv`. [GEPRÜFT]
- Tests: `run_paket3.sh` 56/56 + `test_nachtraege.py` 11/11 (u. a. jede geänderte Zelle im Protokoll, Negativtest veralteter Wert → Abbruch, Basis unverändert); zweimal gelaufen, gleiche Prüfsumme (`master_3818_aktuell.csv` 6e1803d6ee943b0a). Nicht nachgeführt: `master_herkunft_lang.csv.gz` (Langform der Basis).

## 3. Anbieterland nicht mehr auf der Karte (Übergabe §3 Punkt 3, E122)

- `paket20/scripts/port_p20.py`: `app-v43.js` = `app-v42.js` ohne Badge «Anbieterland» und ohne die Hilfsfunktion dafür (3 Zeilen weg, 1 Kommentar neu). `methodik.html` Abschnitt «Ort und Durchführungsform»: «Wo der Anbieter seinen Sitz hat, führen wir nur in den Daten, um Angebote richtig zuzuordnen; den Zugang leiten wir daraus nie ab.» Daten (`data-p18.js`) und übrige Seiten unverändert.
- Tests nachgeführt: Stufe-2-Kriterium **LB** prüft ab `app-v43` «kein Badge Anbieterland» (`paket12/tests/test_stufe2_browser.js`); **D5a** braucht keine Änderung (Badge war schon optional), Kommentar ergänzt; die Badge-Prüfungen aus `test_paket18.js` (MAZ = Schweiz) prüft neu `paket20/tests/test_paket20.js` in den Daten. `test_paket18.js` bleibt als Test des Stands Paket 18.
- **Befund (Owner-Frage):** Die Katalogsuche findet Angebote weiter auch über den Ländernamen des Anbieters (`placeSearchText` in `app-v43.js`, seit E118 bei 934 Angeboten belegt). Wer «Schweiz» eintippt, findet auch Online-Kurse von Schweizer Anbietern, ohne dass die Karte den Grund zeigt. Empfehlung: in der Suche nur noch das Land des Durchführungsorts verwenden (eine Zeile). Nicht umgesetzt, weil nicht beauftragt.

## 4. Sicherheits-Header (Übergabe §3 Punkt 4, E124)

`paket20/website/.htaccess` (Block mit BEGIN/END zum Anfügen an eine bestehende Datei):

```
<IfModule mod_headers.c>
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

- CSP nur eigene Herkunft: Die Seiten laden keine fremden Skripte, Stile, Schriften oder Bilder, keine Inline-Skripte, keine `style`-Attribute; JSON-LD ist ein Datenblock und wird von `script-src` nicht erfasst (Browser-Test H3). `frame-ancestors 'none'` verhindert Einbetten in fremde Seiten (Clickjacking), gehört zur CSP.
- Infomaniak dokumentiert `Header set …` in der `.htaccess` ausdrücklich (FAQ 360, X-Frame-Options und CSP). Das Risiko «nicht offiziell dokumentiert» aus der Übergabe ist damit erledigt. Bleibt: Ein Tippfehler legt die ganze Website lahm (Fehler 500, Test H7) → Prüfschritt und Rückweg im Rezept (§7).
- `<IfModule>`: Fehlt `mod_headers`, läuft die Website weiter, nur ohne Header (Test H6); die Prüfung nach dem Upload zeigt das.
- Tests `paket20/tests/test_sicherheit.sh` auf **lokalem Apache 2.4** mit der `.htaccess`: Kandidat Paket 20 und **Live-Snapshot** (Rückweg auf alte `index.html` lässt die `.htaccess` auf dem Server) je **7/7**: Website funktioniert (Karten, Katalogsuche, Filter, Smart-Suche, Merken in localStorage), 0 CSP-Verletzungen, 0 Skriptfehler auf Start, 4 Unterseiten und unbekannter Adresse, alle Antworten (200/304/404) mit den drei Headern, JS/CSS mit passendem Content-Type. [GEPRÜFT]
- Folge: Die `.htaccess` kann unabhängig vom Release hochgeladen werden.

## 5. robots.txt mit Trainingssperre (Übergabe §3 Punkt 5, E125)

`paket20/website/robots.txt`: je eine Gruppe `Disallow: /` für Crawler, die laut Betreiber für KI-Training sammeln; `User-agent: *` / `Allow: /`; Sitemap-Zeile bleibt.

| Token | Betreiber | Zweck laut Primärquelle | Regel |
|---|---|---|---|
| GPTBot | OpenAI | Training | gesperrt |
| OAI-SearchBot, ChatGPT-User | OpenAI | Suche, Nutzerabruf | offen |
| ClaudeBot | Anthropic | Training | gesperrt |
| Claude-SearchBot, Claude-User | Anthropic | Suche, Nutzerabruf | offen |
| Google-Extended | Google | Training und Grounding Gemini-Apps/Vertex AI; Google-Suche nicht betroffen (Stand 2026-10-30) | gesperrt |
| Applebot-Extended | Apple | Training Apple-Foundation-Modelle; Siri/Spotlight nicht betroffen (2026-09-04) | gesperrt |
| meta-externalagent | Meta | u. a. Training von Foundation-Modellen | gesperrt |
| meta-webindexer | Meta | Meta-AI-Suche | offen |
| Amazonbot | Amazon | «may be used to train Amazon AI models» | gesperrt |
| Amzn-SearchBot | Amazon | Suche, kein Training | offen |

Nicht aufgenommen (Owner-Frage): **CCBot** (Common Crawl; die Seite nennt kein KI-Training, der Datensatz wird aber breit fürs Training genutzt) und **Bytespider** (ByteDance; keine Primärquelle gefunden). Anthropic erkennt seit 30.10.2026 zusätzlich ein maschinenlesbares «kein Training»-Signal nach IETF-Entwurf (aipref); Syntax dort nicht genannt, eine `ClaudeBot`-Regel hat Vorrang → nicht nötig.
Tests `paket20/tests/test_robots.py` 6/6 (Trainings-Crawler gesperrt, 11 Such-/Nutzer-Crawler offen, Sitemap, nur RFC-9309-Felder, eigene Gruppen, Grösse). [GEPRÜFT]

## 6. Tests gesamt (17.11.2026)

| Testsatz | Ergebnis |
|---|---|
| `run_paket3.sh` + `test_nachtraege.py` | 56/56, 11/11 |
| Stufe 1 (`test_paket8.js`, Prüfling Paket 20) | 35 PASS, 0 FAIL, 4 später an beiden Stichtagen |
| Stufe 1 Browser (`test_browser_p8.js`) | B1, B3a, B3b, S1-Vorprüfung PASS; T1 Soll offen (2 HTML-Fehler, live gleich); T5 hier nicht ausführbar |
| Stufe 2 (`test_stufe2_browser.js`) | 10 PASS (D5, NB, F9, S2, S3, F11, B2, T6, LB, S1), D8 entfällt (E105) |
| `test_paket20.js` | 11/11 |
| `test_sicherheit.sh` (Kandidat / Live-Snapshot) | 7/7 + 6/6 / 7/7 + 6/6 |
| Pakete 5, 6, 7, 9, 10 | 24/24, 35/35, 41/41, 15/15, 12/12 an beiden Stichtagen |

T3 (CSP, nosniff, Referrer-Policy) lokal PASS; Endprüfung live nach dem Upload (Rezept §7 Schritt 5).

## 7. Upload-Rezept Sicherheits-Header (jetzt möglich, ca. 15 Min.)

Im Chat geliefert; Kurzfassung: (1) im FTP-Manager prüfen, ob im Hauptordner eine `.htaccess` liegt; (2) falls ja: herunterladen und sichern, Block ans Ende anfügen; falls nein: neue Datei `.htaccess` mit dem Block anlegen; (3) Website testen; (4) Header mit securityheaders.com prüfen; (5) Rückweg bei Fehler 500: Block entfernen bzw. Datei löschen. `robots.txt` kommt mit dem Release-Paket (E125).

## 8. Übergabe Git

Lokaler Commit auf `claude/datenharmonisierung` (Basis a8b146e), nicht gepusht. Git-Bundle `paket20_claude-datenharmonisierung.bundle` im Chat; Einspielen: `git fetch <bundle> claude/datenharmonisierung` und pushen, oder Push-Recht für Claude freigeben.

## 9. Offen

- Owner: Bestätigung Nachtrag Paket 20; Release-Freigabe; Katalogsuche über Anbieterland (§3); CCBot/Bytespider (§5); Push-Recht.
- Release-Paket (Übergabe §3 Punkt 6) nach Freigabe: `index.html` → `app-v43.js`, `data-p18.js`, `smart-search-data-p14`; 5 HTML-Seiten und `robots.txt` aus `paket20/website/`; Prüfsummen, R1, Rollback.
- Später: Anbieterland der 24 offenen Anbieter (E123); Paket 19 GEO/LLMO (Vormerkung), inkl. Sichtbarkeits-Gate (E121).

Quellen: Infomaniak FAQ 360 (https://faq.infomaniak.com/360); OpenAI Bots (https://developers.openai.com/api/docs/bots); Anthropic (https://support.claude.com/en/articles/8896518); Google Common Crawlers (https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers); Apple (https://support.apple.com/en-us/119829); Meta (https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/); Amazon (https://developer.amazon.com/amazonbot); Common Crawl (https://commoncrawl.org/ccbot). Alle abgerufen 17.11.2026.
