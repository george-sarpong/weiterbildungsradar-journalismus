# BERICHT PAKET 28 «Schlanke Auslieferung», 22.11.2026

Status: umgesetzt und getestet, Release-Paket gebaut, **nicht hochgeladen** (E227: Upload erst nach eigener Release-Freigabe und Owner-Abnahme). Owner-Entscheid aus diesem Chat: E234; Befunde E235, E236. Nachtrag zur Bestätigung vorgelegt. Commit 315fd06 auf `claude/datenharmonisierung`, **nur lokal** (Push vom Git-Proxy dieser Sitzung abgelehnt, §8); Reserve als Git-Bundle.
Auftrag: Owner 22.11., Chat «weiter» (GESAMTWISSENSSTAND §9: «P28 umsetzen, zuerst Prüfschritte U1–U5»).
Grundlage: `SPEZIFIKATION_PAKET28_20261122.md` (freigegeben, E225–E233).
Beleg: [GEPRÜFT] von Claude gezählt bzw. getestet · [GEGENPRÜFUNG] getrennter Agent · [OWNER] Entscheid in diesem Chat.

## 1. Ergebnis

Der Release-Bau liefert nur noch, was am Build-Stichtag sichtbar ist, ohne ungenutzte Felder und ohne leere Smart-Teilfelder. Auf der Website ändert sich nichts. [GEPRÜFT]

| Stichtag | Angebote | Daten Byte (gzip) | Smart Byte (gzip) | `website/` |
|---|---|---|---|---|
| vorher P27 (alle 1'353) | 1'353 | 1'595'018 (206'291) | 1'016'445 (28'439) | – |
| Release 22.11. | 998 | 1'049'330 (147'445) | 513'223 (17'869) | 1,93 MB, 13 Dateien |
| Messbau 01.12. | 945 | 991'410 (139'720) = Spezifikation | 479'772 (16'700) | – |

- Daten am 01.12. −38 %, Smart −53 %. Die Smart-Datei ist 3'135 Byte grösser als in §1.3 berechnet, weil das Teilfeld `amount` bleibt (§2 U3).
- Neue Dateinamen: `daten-c988be9171c7.js`, `suche-54288fd7035f.js`. App und CSS behalten ihre Namen (bytegleich mit Paket 19).
- `htaccess.txt` = Live-`.htaccess` (891 Byte) + Cache-Block (E176): Daten, Suche, App, CSS ein Jahr `immutable`, HTML, `robots.txt`, `sitemap.xml` und «/» `no-cache`.
- Release-Paket `mediaskills_paket28_20261122.zip` (website/ und htaccess.txt), Bauprotokoll `paket28/out/release_20261122/`.

## 2. Prüfschritte U1–U5 [GEPRÜFT]

| Nr. | Ergebnis |
|---|---|
| U1 | Zweig auf 8d70e81 (nach f075c92 nur Wissensbasis); Master 194954d3… |
| U2 | §1.3 bestätigt: sichtbar 998 / 945 / 860; Daten 991'410, Smart ohne Leerwerte 476'636 (1 Byte weniger, weil `rosterCount` 945 statt 1353, B01). **Abweichung §1.2:** die fünf ungenutzten Felder machen über alle 1'353 Angebote 166'603 Byte (10,4 %) aus, nicht 138'178 (8,7 %); je Feld country 30'415, reviewAfter 39'237, release_origin 75'933, publicationReason 723, laender.markt 20'295. Kein Einfluss auf das Soll. |
| U3 | Leseliste `app-v43.js`: siehe unten. |
| U4 | Live-`.htaccess` im Infomaniak-Web-FTP lesend geöffnet (Chrome, Dateiabruf, keine Änderung): **891 Byte, 15 Zeilen, ohne Zeilenende am Schluss, SHA-256 6d8a0c14…** (= E150). Bytegenau nachgebaut als `paket28/config/htaccess_live_20261122.txt`. Abweichung zu allen Repo-Fassungen (809 Byte): Zeile 1 Kommentar «Stand 19.11.2026 (Variante bei Weiterleitungsschleife laut Infomaniak FAQ 1961)»; Zeile 5 `RewriteCond %{HTTP:X-Forwarded-Proto} !https` statt `%{HTTPS} off` (Rückweg aus E128). |
| U5 | Apache 2.4.58 mit `mod_headers`, `mod_rewrite`, `mod_ssl` lokal installiert. |

**Leseliste U3** (alle Lesestellen in `app-v43.js`):
- A2: `country`, `reviewAfter`, `release_origin`, `publicationReason`, `laender.markt` liest die App nirgends. `country` kommt nur als Name des Filters «Durchführungsort» vor (wertet `laender.ortLand` aus, Z. 71, 82, 228–260, 1769).
- A3 `delivery` (Z. 1015–1027): nur mit Ersatzwert (`|| "UNKNOWN"`, `|| ""`, `Array.isArray`); `scheduleSummary`, `temporalSummary`, `materialisationStatus` nie gelesen.
- A3 `priceOptions` (Z. 1139–1382): `Array.isArray(...) ? ... : []`; Teilfelder mit `== null`, `!= null`, Wahrheitswert, `??` oder Stringvergleich. `minAmount` Z. 1151 ist sicher: `undefined` statt `null` fliesst nur in `!= null` und `??`.
- **Ausnahme `amount`:** Z. 1378 rechnet `Number(option.amount)` ohne Prüfung (`null` → 0, fehlend → NaN). Heute trifft kein Datensatz den Fall; nach A3 bleibt `amount` trotzdem immer stehen (245 `null`-Werte, rund 3 KB).

## 3. Umsetzung

| Datei | Inhalt |
|---|---|
| `paket28/scripts/build_release_p28.py` | Release-Bau A1–A7; benutzt unverändert Generator, `sichtbarkeit.py`, `build_liste_p25.js` |
| `paket28/config/htaccess_live_20261122.txt`, `cache_block.txt`, `LIESMICH.md` | Live-Stand U4 und Cache-Block A5 |
| `paket28/tests/test_paket28.py` | P01, P04–P09, P11a, P13–P15 |
| `paket28/tests/test_paket28_anzeige.js` | P02, P03, P16 (aus `test_paket27_anzeige.js` abgeleitet; je Stichtag ein Prozess, `NUR=0/1/2/E`) |
| `paket28/tests/test_apache_p28.sh` | P10, P11 auf lokalem Apache |
| `paket28/tests/test_paket8_p28.js` | Testkopie Stufe 1 (E234), Diff `paket28/out/stufe1_p28.diff` |
| `paket28/out/release_20261122/` | Bauprotokoll, `htaccess.txt`, `SHA256SUMS.txt` des Releases |
| `paket28/abnahme/` | Vorschau des Releases für die Owner-Abnahme (gleiche 13 Dateien) |

Festlegungen von Claude im Rahmen der Spezifikation:
- Ziel des Baus: neuer Ordner oder ein früheres Release; nie das Repo, ein Ordner darüber oder ein Ordner im Repo ausserhalb von `paket28/out/` (Gegenprüfung B1).
- Testoptionen (`--jetzt`, `--felder-weg`, `--vorlage`, `--fehler-nach`) nur mit `P28_TEST=1`; gesetzte Optionen stehen im Bauprotokoll (H4).
- Abbruch durch SIGTERM/SIGHUP räumt den Zwischenordner auf (H1). SIGKILL lässt sich nicht abfangen; dann kann ein `.tmp-p28-…`-Ordner neben dem Ziel liegen bleiben. Zwischen den zwei Umbenennungen am Schluss gibt es eine kurze Lücke, in der das Ziel fehlt (H2).
- Apache-Test: Live steht die X-Forwarded-Proto-Variante; lokal setzt der HTTPS-Port die Kopfzeile wie der Infomaniak-Proxy (`RequestHeader … early`). Ob der Infomaniak-Proxy selbst Header ändert, zeigt erst V04 live.

## 4. Tests [GEPRÜFT]

| Nr. | Ergebnis |
|---|---|
| P01 | PASS: 998 IDs = sichtbar laut `sichtbarkeit.py` am 22.11., Master-Reihenfolge, Datensätze = `data-p27.js` ohne A2, `rosterCount` 998 |
| P02 | PASS: Karten in 3 Sortierungen, Filter (52 Optionen) und Zähler gleich an 22.11., 01.12., 20.12.; Merkliste gleich, `localStorage` nach dem Laden unverändert; zwei Releases: ohne Änderung wieder gemerkt, mit Änderung weg (E231) |
| P03 | PASS: 60 Anfragen an allen 3 Tagen, Treffer, Texte, Punktzahl je Kandidat (3'718 Kandidaten am 22.11.), 0 Tausch |
| P04 | PASS: Fehlfälle `title`, `laender.ortLand`, `focus` → Abbruch |
| P05 | PASS: nur leere Teilfelder der Leseliste weg, `amount` nie |
| P06 | PASS: morgen Abbruch, heute/gestern baut; TZ=UTC 23:59/00:01 Zürich; Fehler nach Generator und Listenbau: Ziel und Repo bytegleich. **P06b** (neu nach Gegenprüfung): Ziel-Schutz in 7 Fällen, SIGTERM, Testoptionen ohne `P28_TEST` |
| P07 | PASS: `index.html` und `sitemap.xml` = Bau aus `data-p27.js` bis auf die 3 Skriptnamen; Vorlage mit Liste → Abbruch |
| P08 | PASS: Namen = Inhaltskürzel, Reihenfolge Daten, Suche, App; keine alten Verweise; Fehlfälle mit genauer Meldung |
| P09 | PASS: App und CSS bytegleich mit Release Paket 19 |
| P10 | PASS 16/16 (Cache je Dateityp, «/», 304 mit ETag) |
| P11 | PASS 11/11 Apache (Weiterleitung, 3 Header auf 4 Adressen, CSP-Wortlaut, 404); `htaccess.txt` = Live + Cache-Block, ASCII, LF |
| P12 | Stufe 1 (Testkopie, E234) **35 PASS / 0 FAIL / 4 später** an 22.11. und 01.12.; Stufe 2 **10 PASS** (D8 entfällt); B1, B3a, B3b, S1 PASS; T1 (2 HTML-Fehler, live gleich) und T5 Soll offen wie live |
| P13 | PASS: 2'023'031 Byte ≤ 9 MB |
| P14 | PASS: zwei Bauten bytegleich |
| P15 | PASS: A8 per SHA-256 unverändert, `git status` unverändert; `test_paket27.py` 15/15, P27-Anzeige 12/12, `test_paket24.py` 14/14, `test_nachtraege.py` 14/14, P25 Master 8/8, Generator 13/13, P26 14/14 |
| P16 | PASS: `index.html` des Releases über HTTP mit eigenen Skriptverweisen geladen; Daten und Smart = Release-Dateien; 998 Karten = P27 |

**P12 Testkopie (E234).** Das alte Werkzeug `paket8/tests/test_paket8.js` setzt alle 1'353 Datensätze, immer ein Feld `priceOptions` und gesperrte Datensätze voraus. Die Testkopie ändert nur drei Stellen: D2a Soll = am Build-Stichtag sichtbare Master-Zeilen (E172); `priceOptions` darf fehlen (3 Stellen mit `|| []`); T09 und Gegenprobe G01 nehmen gesperrte Datensätze aus `data-p27.js`. Das Original bleibt unverändert.

## 5. Gegenprüfung durch getrennten Agenten [GEGENPRÜFUNG]

Urteil **FAIL** mit 1 Blocker; A1–A5 fachlich bestätigt, unabhängig von den Tests:
- A1: App-Regel auf `data-p27.js` = Release-IDs am 22.11.; über 801 Tage wird kein nicht geliefertes Angebot sichtbar; `sichtbarkeit.py` = App an 188 Stichtagen.
- A3: dynamischer Vergleich der Preis- und Lieferlogik (998 Datensätze × 14 Lieferformen × 41 Budgets = 1'145'704 Vergleiche), 0 Abweichungen; Begründung `amount` bestätigt.
- A5: Apache 27/27; Builds unter TZ=UTC und America/Los_Angeles bytegleich.

| Nr. | Befund | Erledigung |
|---|---|---|
| B1 | vorhandenes Ziel (z. B. `.`) wurde ungeprüft ersetzt und gelöscht | Ziel-Schutz, Test P06b |
| H1 | SIGTERM liess Zwischenordner liegen | Signale abgefangen, Test P06b |
| H2 | kurze Lücke zwischen zwei Umbenennungen | im Bericht (§3) |
| H3 | fehlende Elternordner wurden angelegt und blieben | Abbruch, wenn der Elternordner fehlt |
| H4 | `--jetzt` ohne Spur | nur mit `P28_TEST=1`, im Bauprotokoll |
| H5 | `pruefe_felder` erkennt nur Muster; Zählung nicht geprüft | P04 verlangt die Zählung exakt; für künftige Apps bleibt die Musterprüfung ein Netz, keine Garantie |
| H6 | P01/P05 nutzen dieselben Listen wie der Bau | unabhängiger Beleg oben |
| H7 | Zahlen weichen ab; A7 ohne Bytes je Feld | §1, §2 U2; Bauprotokoll mit Bytes je Feld und Smart vor/nach A3 |
| H8 | Testkopie schreibt Ergebnisse nach `paket8/out/` | Ergebnisse nach `paket28/out/stufe1/` verschoben; Kopie bleibt nach E234 bei drei Änderungen |
| H9 | Proxy-Nachbildung | §3; Endprüfung V04 live |
| H10 | Belege fehlten | nachgereicht (`paket28/out/`) |

Danach: `test_paket28.py` 12/12, Release unverändert (website/ bytegleich mit dem ersten Bau).

## 6. Release: Abnahme und Upload (erst nach Freigabe)

Voraussetzung: Release-Freigabe und deine Abnahme von rund 20 Minuten (E040, E227). Der Stichtag darf nicht nach dem Upload-Tag liegen; lädst du später als am 22.11. hoch, baue ich das Paket am Upload-Tag neu (Bauzeit unter einer Minute, Tests rund eine Stunde).

Upload nach E163 (rund 10 Minuten):
1. ZIP `mediaskills_paket28_20261122.zip` öffnen. Darin: Ordner `website/` (13 Dateien) und `htaccess.txt`.
2. Web-FTP öffnen: https://manager.infomaniak.com/v3/hosting/512105/hosting/816439/ftp → «Web FTP».
3. Hauptordner einmal leeren: alles löschen ausser `.ftpquota`. **Diesmal auch `.htaccess` löschen**, weil sie ersetzt wird.
4. Alle 13 Dateien aus `website/` **und** `htaccess.txt` in einem Zug per Drag and Drop hochladen.
5. `htaccess.txt` umbenennen in `.htaccess` (E146).
6. Mir «hochgeladen» schreiben. Ich prüfe V01 (SHA-256 je Datei), V02 (Liste ohne JavaScript), V03 (securityheaders.com, Note A), V04 (`Cache-Control` je Dateityp), V05 (Karten und Smart-Suche).

## 7. Nicht Teil von P28

App-Änderungen und Codes im Suchtext (P29, E213); Prüfliste und Abruf (P30); Kernliste (E222); Inhalt des Masters.

## 8. Lieferung

- Commit **315fd06** auf `claude/datenharmonisierung` (Code, Tests, Belege, Vorschau), **nicht gepusht**: Der Git-Proxy dieser Sitzung meldet, dass das Repo nur lesend eingebunden ist; das Einbinden mit Schreibrecht hat die Sicherheitsprüfung der Sitzung zu Beginn abgelehnt. Reserve: `paket28_20261122.bundle` (Voraussetzung 8d70e81). Kein Merge nach `main` (E041).
- Wissensbasis: dieser Bericht, Register E234–E236, GESAMTWISSENSSTAND; Repo-Kopien in `claude-work/paket28/wissensbasis/`.
- Testumgebung: Node 22, jsdom 24, playwright-core mit `/usr/bin/google-chrome`, vnu-jar, Apache 2.4.58; der Anzeigetest braucht je Stichtag einen eigenen Prozess (7 GB Speicher).

## 9. Offen und nächster Schritt

- **Owner:** Nachtrag bestätigen; Release P28 freigeben und abnehmen (rund 20 Minuten), dann Upload nach §6; Schreibzugang für den Push herstellen oder Bundle einspielen; Zweitmeinung ChatGPT nach Wunsch.
- Danach laut ZIELBILD §4: P29 (App-Anpassungen, Codes im Suchtext, Datei je Land) mit Spezifikation und Testliste.
