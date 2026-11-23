# SPEZIFIKATION PAKET 29 «Website-Architektur», 23.11.2026

Status: **Freigegeben 23.11.2026** (E241–E245: Entscheide 1–3 je A, Entscheid 4 B). Umsetzung zuerst Prüfschritte U1, U2; Zweitmeinung ChatGPT parallel; Release nur mit eigener Freigabe (E227).
Auftrag: Owner 23.11., Chat «weiter» (GESAMTWISSENSSTAND §9: «P29, Spezifikation mit Testliste, ZIELBILD §4»).
Grundlage: `ZIELBILD_UNTERBAU_20261120.md` §4 Zeile P29; E174 (Liste darf wachsen), E201/E213 (Codes im Suchtext in P29), E221 (Trennzeichen, keine App-Änderung vor P29), E226/E227 (Dateinamen, Release-Bau), Release P28 live (E239, E240).
Vorprüfung: Arbeitszweig `claude/datenharmonisierung` auf ef37b3d (flach geklont 23.11., nur lesend); Release P28 `paket28/abnahme/`; Master `paket3/out/master_3818_aktuell.csv`.
Beleg: [GEPRÜFT] von Claude gezählt/gelesen · [SCHÄTZUNG] gerechnet, nicht gemessen.

## 1. Ausgangslage (Vorprüfung)

### 1.1 Daten je Markt im Release P28 (Stichtag 23.11., 998 Angebote) [GEPRÜFT]

| Markt (`release_markt`) | Angebote | Daten Byte (gzip) | Smart Byte (gzip) |
|---|---|---|---|
| CH | 923 | 977'039 (134'420) | 475'437 (15'191) |
| AT | 71 | 67'408 (10'253) | 35'832 (1'844) |
| LI | 4 | 4'845 (1'842) | 1'593 (454) |

Die Schweiz macht heute 93 % der Daten aus. Eine Datei je Land spart beim Erstbesuch heute fast nichts (rund 12 KB gzip). Sie lohnt sich erst, wenn DE, FR, IT dazukommen (ZIELBILD §5: bei rund 5'100 Datensätzen in einer Datei rund 1 MB je Erstbesuch) [SCHÄTZUNG].

### 1.2 App `app-v43.js` [GEPRÜFT]

- Daten kommen aus zwei globalen Variablen (`WEITERBILDUNGSRADAR_OFFERS`, `MEDIA_SKILLS_SMART_DATA`), geladen über drei `<script>`-Zeilen in `index.html` (Z. 1267–1269).
- Länderfilter: feste Reihenfolge `Schweiz, Österreich, Liechtenstein, Deutschland` (Z. 71), danach alphabetisch, am Schluss «Online», «keine Angabe» (Z. 256–262). Ländernamen deutsch in `COUNTRY_NAMES` (Z. 230; 13 Länder). Die ISO-Tabelle `scripts/iso3166_alpha2.csv` hat nur englische Namen.
- Suchtext Smart-Suche (Z. 988–991) und Katalogsuche (Z. 1655–1670) enthalten **Rohwerte**, die Karte zeigt **übersetzte Texte**. In den 998 gelieferten Angeboten:

| Feld | Rohcodes im Suchtext (Anzahl Werte) | Karte zeigt |
|---|---|---|
| `format` | NICHT_PUBLIZIERT 155, ON_REQUEST_FORMAT 57, ON_DEMAND 26 | Text aus `labels.format` |
| `region` | ON_REQUEST 56, NOT_PUBLISHED 9 | `regionDisplay` |
| `duration` | NOT_PUBLISHED 27 | «Dauer: keine Angabe» |
| `language` (nur Katalog) | NOT_PUBLISHED 24 | «Sprache: keine Angabe» |
| `priceDisplay` (nur Katalog) | NICHT_PUBLIZIERT 16, NICHT_PUBLIZIERT_IN_CURRENT_RECHECK 6 | `compactPrice` |
| `start` | SUR_DEMANDE 5, FUTURE_BOOKABLE 4, CURRENT_BOOKABLE 1, ON_REQUEST 1, NO_FREE_PLACES 1 | lesbarer Text (E086) |
| `access` (nur Katalog) | 25 Belegcodes, z. B. V95_DOCUMENTED_BOOKING_CTA 72, OFFICIAL_PROVIDER_ACCESS_RULE_2026 72 | Kurzlabel `compactAccess` (z. B. «Öffentlich buchbar») |

- **Befund B1 (neu, nicht in E213):** Das Feld `access` enthält neben Codes auch interne Arbeitsnotizen, z. B. OFFER-MAZ-001: «… Konkrete Durchführungen in D3 geprüft und im Blatt Termine erfasst.» Die Karte zeigt davon nur «Öffentlich buchbar», die Katalogsuche findet aber Wörter wie «Blatt», «geprüft», «D3». Das ist dieselbe Art Scheintreffer wie E201.
- Oberflächentexte: rund 130 deutsche Zeichenketten fest im Code, dazu das Objekt `labels`; HTML-Seiten deutsch, `lang="de-CH"`.

### 1.3 Kursliste (O4)

Entschieden mit E174: Die Liste bleibt auf der Startseite und darf wachsen; `index.html` heute 292'849 Byte. P29 ändert daran nichts; nur die Ladezeit wird gemessen (E174).

## 2. Auftrag P29 (Umfang)

| Nr. | Inhalt | nach |
|---|---|---|
| A1 | Datendatei und Smart-Datei je Markt (`release_markt`) | ZIELBILD §3 Punkt 5, §4 |
| A2 | Länderfilter ohne feste Länderliste im Code | ZIELBILD §4 |
| A3 | Suchtext ohne Codes: gesucht wird, was die Karte zeigt | E201, E213 |
| A4 | ~~Textschicht für Landessprachen~~ entfällt in P29, eigenes Paket später (E244) | ZIELBILD §4, Projektregel 10 |
| A5 | neue App-Datei `app-v44.js` (E226: Inhalt einer Datei mit Versionsnamen ändert nie); Release-Bau `build_release_p29.py` auf Basis P28 | E226, E227 |

Nicht Teil von P29: Prüfliste und Abruf (P30), Kernliste (E222), Inhalt des Masters, Gestaltung, KI-Offenlegung (E188), Merkliste, Anbieterland in der Suche (E129 bleibt), Trennzeichen-Ausnahme E221 (bleibt, siehe A3).

## 3. Entscheidungsvorlagen für den Owner

**Entscheid 1 – Datei je Land: wann laden?**
- A (Empfehlung): Jetzt eine Daten- und eine Smart-Datei je Markt (`daten-ch-<Kürzel>.js`, `daten-at-…`, `daten-li-…`, ebenso `suche-…`); die Startseite lädt **alle** beim Start. Verhalten gleich wie heute, Gleichheitstest möglich. Nutzen heute klein (eine unveränderte Länderdatei bleibt im Browser-Cache); später genügt ein Schalter, um nur die Schweiz zuerst zu laden.
- B: Jetzt eine Datei je Markt und nur die Schweiz zuerst laden, übrige Länder nachladen. Spart heute rund 12 KB, aber Suche und Filter sind bis zum Nachladen unvollständig; braucht eigene Tests und Anzeige «weitere Länder werden geladen».
- C: Verschieben, bis DE-Daten im Master stehen; bis dahin eine Datei.

**Entscheid 2 – Reihenfolge im Länderfilter**
- A (Empfehlung): Schweiz zuerst, dann alle übrigen Länder alphabetisch, dann «Online», «keine Angabe». Keine Liste zu pflegen; heute: Schweiz, Belgien, Deutschland, Liechtenstein, Österreich (statt Schweiz, Österreich, Liechtenstein, Deutschland, Belgien).
- B: Schweiz zuerst, dann nach Ausbaustufe E168 (Deutschland, Österreich, Liechtenstein, Frankreich, Italien, USA), übrige alphabetisch; Liste in einer Tabelle des Builds.
- C: Schweiz zuerst, übrige nach Zahl der Angebote.
Bei allen: Ländernamen bleiben deutsch in der App; ein Land ohne deutschen Namen erscheint mit ISO-Code, der Build meldet das (Test P07).

**Entscheid 3 – Suchtext**
- A (Empfehlung): Regel «suchbar ist, was die Karte zeigt»: Smart- und Katalogsuche lesen für `format`, `region`, `duration`, `language`, `priceDisplay`, `start` und `access` die Anzeigetexte statt der Rohwerte. Löst E201 und Befund B1. Folge: Anfragen mit Wörtern aus Codes oder internen Notizen («nicht», «published», «Blatt», «D3» …) finden weniger; Anfragen mit Wörtern der Anzeige finden gleich viel oder mehr. Die genaue Liste der Änderungen wird gemessen und als Sollliste festgehalten (wie E201, E221).
- B: Nur die Platzhalter-Codes entfernen (E213 wörtlich), `access` bleibt roh durchsuchbar.
Bei beiden: E129 (Anbieterland in der Suche) und E221 (Trennzeichen) bleiben; die 60 Testanfragen T01–T20 und 40 virtuelle Anfragen werden verglichen.

**Entscheid 4 – Textschicht für Landessprachen**
- A: Alle Oberflächentexte der App in ein Textobjekt `TEXTE.de` (in `app-v44.js`), Zugriff nur über dieses Objekt; HTML-Seiten bleiben. Anzeige bytegleich. Aufwand gross (rund 130 Stellen), Nutzen erst mit der zweiten Sprache.
- B (Empfehlung): Verschieben in ein eigenes Paket vor der ersten zweiten Sprache. Grund: Die Textschicht betrifft weder Datenmodell noch Pipeline noch Länderausbau (E169); jede Umstellung jetzt ist Risiko ohne Nutzen bis dahin.

**Entscheid 5 – Freigabe**
- A: Spezifikation mit den gewählten Varianten freigeben; Zweitmeinung ChatGPT parallel, Befunde vor dem Commit einarbeiten; Release nur mit eigener Freigabe und Abnahme (E227).

## 4. Umsetzung (gewählt: Empfehlungen, E241–E244)

U1 Prüfschritt: Zweig auf Stand ef37b3d oder später ohne Code-Änderung; Release P28 = live (SHA-256 je Datei).
U2 Prüfschritt: Messliste A3 je Angebot und Feld: Rohtext, Anzeigetext; Liste der Anfragen, deren Treffer sich ändern (60 + 40 Anfragen, Katalog und Smart, an 3 Stichtagen).

A1 Build `paket29/scripts/build_release_p29.py <Stichtag> <Ziel>` = P28-Bau + Aufteilung nach `release_markt` aus dem Master; je Markt `daten-<markt>-<12 Zeichen SHA-256>.js` und `suche-<markt>-<…>.js`; jede Datei hängt ihre Datensätze an die bestehenden globalen Variablen an (Reihenfolge der Datensätze = Master-Reihenfolge, E194); `index.html` lädt die Dateien in der festen Reihenfolge CH, dann übrige Märkte alphabetisch, dann `app-v44.js`. Markt ohne sichtbares Angebot: keine Datei. Markt leer oder unbekannt im Master: Abbruch.
A2 `app-v44.js`: `preferredOrder.country` entfällt; Reihenfolge nach Entscheid 2.
A3 `app-v44.js`: Suchtext nach Entscheid 3 aus denselben Funktionen, die die Karte nutzt (`humanizeTokens`, `regionDisplay`, `neutralMissing(readableCodes(…))`, `compactPrice`, `compactAccess`).
A5 Sonst keine App-Änderung; CSS, HTML-Seiten (ausser Skriptzeilen in `index.html`), `robots.txt`, Sitemap wie P28; `htaccess.txt` = Live-`.htaccess` 23.11. (E239) unverändert, Cache-Regel greift für die neuen Namen (Muster prüfen, Test P10).

## 5. Testliste

| Nr. | Prüfung | Soll |
|---|---|---|
| P01 | Vereinigung aller Länderdateien = Daten- bzw. Smart-Datei P28 am gleichen Stichtag | jeder Datensatz bytegleich, gleiche Reihenfolge, `rosterCount` gleich |
| P02 | jede Datei enthält nur ihren Markt; kein Angebot doppelt, keines fehlt | 0 Abweichungen |
| P03 | Karten (3 Sortierungen), Zähler, Filteroptionen an 23.11., 01.12., 20.12. gegen P28 | gleich ausser Reihenfolge Länderfilter (Soll nach Entscheid 2) |
| P04 | Smart-Suche und Katalogsuche, 60 + 40 Anfragen, 3 Stichtage | gleich bis auf die Sollliste aus U2; keine Änderung ausserhalb der Liste |
| P05 | Suchtext enthält kein Wort, das die Karte nicht zeigt (Codes, Notizen aus `access`) | 0 Funde je Angebot |
| P06 | Merkliste über P28 → P29 | gemerkte, weiter gelieferte Angebote bleiben gemerkt |
| P07 | Land ohne deutschen Namen | Build meldet es; Filter zeigt ISO-Code |
| P08 | Ladereihenfolge in `index.html`; App läuft auch, wenn eine Länderdatei fehlt | Meldung im Bauprotokoll; App zeigt die übrigen Länder, kein Absturz |
| P09 | Fehlfälle Build: Markt leer, Stichtag in der Zukunft, Ziel im Repo | Abbruch, Ziel und Repo bytegleich |
| P10 | Apache: Cache-Regel für `daten-xx-…`, `suche-xx-…`, `app-v44.js`; Sicherheits-Header; HTTPS-Weiterleitung | wie P28 (27/27) |
| P11 | Stufe 1 (Testkopie P28, E234, nur Dateinamen parametrisiert) und Stufe 2, B1, B3a, B3b, S1 | 35 PASS / 0 FAIL / 4 später; Stufe 2 10 PASS |
| P12 | Grösse `website/` und Erstbesuch (gzip) vorher/nachher; Ladezeit Startseite (E174) in Chrome, gedrosselt «Fast 4G» | Paket ≤ 9 MB; Erstbesuch höchstens +2 KB; Ladezeit im Bericht |
| P13 | zwei Bauten bytegleich; Zeitzone Europe/Zurich | bytegleich |
| P14 | alte Tests (P28 12/12, P27, P26, P25, P24, Nachträge) | grün |
| P15 | Ende zu Ende: Release über HTTP laden | 998 Karten am 23.11. = P28 |

Gegenprüfung durch getrennten Agenten wie P28 (§5 dort).

## 6. Offen nach P29

P30 Aktualisierung (Prüfliste, Abruf nach E175); Beta-Messkriterien spätestens vor P30 (E187); Textschicht (E244).
