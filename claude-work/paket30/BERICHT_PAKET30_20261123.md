# BERICHT PAKET 30 «Aktualisierung», 23.11.2026

Grundlage: `SPEZIFIKATION_PAKET30_20261123.md`, Owner-Entscheide E260–E263; Befunde E264, E265.
Arbeitszweig `claude/datenharmonisierung`: Soll U3 c26cc08 (vor dem Code), Code 00d23dd, Befund-Korrekturen bdf7a80, f793d9d, b021f75, 19c433c, Gegenprüfung eingearbeitet in einem eigenen Commit; alles gepusht. Kein Release, kein Write in den Master.
Beleg: [GEPRÜFT] von Claude gemessen oder getestet · [SCHÄTZUNG] gerechnet, nicht gemessen.

## 1. Ergebnis in Kürze

- Der Abruf läuft auf dem GitHub-Runner, ausgelöst durch den Push von `claude-work/pruefung/auftrag.txt` auf dem Arbeitszweig (E260). Ein Vollauf über alle 850 Kurslinks der 998 sichtbaren Angebote dauert rund 10 Minuten und kostet nichts. [GEPRÜFT, Läufe 45214509069, 45217350865, 45221462893]
- Testlauf mit 20 Angeboten: **20/20 = Soll von Hand** (Q08), nach vier Befunden im ersten Lauf, alle im Code behoben und mit Regressionstests belegt (§4).
- Erster echter Stand am 23.11. (Vollauf 45221462893): OK 570, WERT_FEHLT 218, WEITERLEITUNG 62, NICHT_LESBAR 82, **LINK_DEFEKT 66** (Link liefert 404 oder TLS-Fehler, z. B. OFFER-CFJM-007). Linkquote maschinell **84,5 %** (718 von 850; Soll E258 B ≥ 95 %).
- Einordnung nach E262: Routine (Claude) 685, Chrome-Nachprüfung (Claude) 148, **Zweifelsfälle (Owner) 165 auf 135 Seiten**. Aufwand für den Owner rund 305 Min. [SCHÄTZUNG], **über dem Budget von 1,5 Std. (E186)** → Owner-Entscheid §7 Punkt 1 (Q14).
- Alle Tests bestanden: P30 34/34, Q08 20/20, Q09 PASS; alte Suiten grün (P29 P12 wie vom Owner angenommen, E253). Gegenprüfung durch getrennten Agenten: FAIL mit einem Blocker, eingearbeitet (§5).

## 2. Prüfschritte U1–U3

- **U1** erledigt (E260): Workflow-Push geht, Runner erreicht die Anbieterseiten.
- **U2** `paket30/scripts/pruefliste.py 2026-11-23 2026-12-23`: 307 Angebote = Zählung Spezifikation §1.1 (fällig 252, fällt weg 141; beides 86). Q01 an drei Stichtagen gleich einer unabhängigen Zählung (307 / 356 / 289) und sichtbare Menge 23.11. = Release P29 (998). [GEPRÜFT]
- **U3** Soll der 20 Testangebote von Hand, committet vor dem Code (c26cc08 vor 00d23dd): `paket30/tests/soll_u3.csv`, `SOLL_U3.md`. Grundlage drei einfache curl-Handproben auf dem Runner (Auszüge im Protokoll), weil WebFetch ohne Freigabe nicht ging. Auswahl: je Status mindestens ein Fall, maz.ch, orsys.fr, digicomp.ch, mediencampus.ch; 4 HOLD-Angebote mit bekannten defekten Links. GEAENDERT ist im ersten Lauf unmöglich (keine Hash-Basis) und wird im Test mit einem absichtlich falschen Vormonats-Hash erzeugt.
- **Befund E264:** Artefakte von GitHub Actions kann diese Arbeitsumgebung nicht laden (Speicher von GitHub durch den Proxy gesperrt), das Laufprotokoll schon. Das Ergebnis kommt deshalb gzip+base64 mit SHA-256 über das Protokoll (`uebergabe.py drucke/hole`) statt als Datei des Laufs (Abweichung von §4). Inhalt unverändert: Status, Hash, Fundstellen ≤ 200 Zeichen, kein Seitentext.

## 3. Umsetzung

| Datei | Inhalt |
|---|---|
| `.github/workflows/p30-pruefung.yml` | nur `push` auf `claude/datenharmonisierung` mit `paths: claude-work/pruefung/auftrag.txt`; `permissions: contents: read`; `persist-credentials: false`; keine Geheimnisse, kein Zeitplan, nichts auf `main` |
| `paket30/scripts/abruf.py` | höflicher Abruf: robots.txt nach RFC 9309 (eigene Gruppe, sonst `*`, Muster `*` und `$`, Weiterleitung bis 5, 4xx = erlaubt, nicht erreichbar = gesperrt), je Host 1 Anfrage zugleich, Abstand ≥ 2 s (Crawl-delay bis 10 s), User-Agent `mediaskills-pruefung/1.0 (+https://mediaskills.ch/methodik.html)`, gzip, zweiter Versuch bei 5xx/Zeitüberschreitung, Host ruht nach 3 Fehlern in Folge; je Adresse Status, Ziel, Hash, Fundstellen, Kandidaten (Daten, Beträge), Seitentitel/h1 (≤ 200) |
| `paket30/scripts/p30_text.py` | Bereinigung (Skripte, Stile, Cookie-Banner, verdeckte Elemente; `<template>` bleibt), Hash ohne Uhrzeit, Zeitstempel, Kennungen; Titel (ganz oder ¾ der Wörter), Datum (Zahlen, Monatsnamen DE/FR/IT/EN, Zeiträume, ISO, strukturierte Daten, Termindaten im Quelltext), Preis (Schreibweisen mit Trennzeichen, nur mit Währung oder Preiswort in der Nähe) |
| `p30_katalog.py`, `abgleich.py` | Status nach Vorrang LINK_DEFEKT > NICHT_LESBAR > WEITERLEITUNG > WERT_FEHLT > GEAENDERT > OK; Einordnung ZWEIFEL / CHROME / ROUTINE nach E262; Owner-Liste je Seite gebündelt |
| `messbericht.py` | B1, B2, B3 nach E258 B, Zweifelsfälle mit Aufwand (Q14) |
| `stichprobe.py` | Prüfblatt E259: n Einträge reproduzierbar, 8 Felder mit Fundstelle und Link |
| `eingang_vorschlag.py` | Entwurf für `eingang/` (nur in `paket30/out/`): `geprueft_am` und `pruefen_ab` bei bestätigten fälligen Angeboten, neue `url` nach sauberer Weiterleitung; Herkunft `ANBIETERSEITE_P30` (neu in `scripts/eingang_herkunft.csv`), Register-ID E262 |

Abweichungen von der Spezifikation, technisch begründet:
1. 401, 403, 429, 451, Zeitüberschreitung und robots-Sperre gelten als **NICHT_LESBAR** (Claude prüft im Chat), nicht als LINK_DEFEKT: meist Zugangs- oder Roboterabwehr, Seite für Menschen erreichbar (Gegenprüfung H1). TLS-Fehler gelten als LINK_DEFEKT (4 Angebote Swiss Creator Academy); Chrome kann sie anders sehen, Claude prüft vor der Owner-Liste.
2. Ergebnis über das Laufprotokoll statt als Datei des Laufs (E264).
3. Zusätzliche Felder im Ergebnis: `seitentitel`, `h1` (≤ 200 Zeichen, für die Owner-Liste), `roh_anfang` (≤ 160 Zeichen Markup, nur bei leerem Text, zur Fehlersuche).

## 4. Tests [GEPRÜFT]

| Nr. | Ergebnis |
|---|---|
| Q01 | PASS: 23.11. 307, 01.12. 356, 20.12. 289 = unabhängige Zählung; sichtbar = Release P29; Abbruch bei falschem Build-Datum |
| Q02 | PASS: Master, Protokoll, `eingang/`, `daten/`, Website, Tabellen per SHA-256 gleich vor und nach allen Skripten |
| Q03 | PASS: Testserver 20 Fälle (OK 2, WERT_FEHLT 3, GEAENDERT 2, LINK_DEFEKT 4, WEITERLEITUNG 3, NICHT_LESBAR 6), Status und Einordnung aller 20 = Soll; Weiterleitung auf Übersicht → Owner |
| Q04 | PASS: Zeitstempel, Cookie-Banner, Kennung → gleicher Hash; Datum/Preis → anderer Hash; fehlendes `</head>`, Inhalt in `<template>`, verdeckte Termindaten |
| Q05 | PASS: robots.txt beachtet (eigene Gruppe, `*`, Allow mit `$`), je Host 1 Anfrage zugleich, Abstand ≥ 2 s, eigener User-Agent |
| Q06 | PASS: 12 Datumsformate, 6 Gegenproben; 9 Preisformate, 10 Gegenproben (u. a. Postleitzahl, Telefon, Kursnummer, Dauer) |
| Q07 | PASS: Datei geprüft; Protokoll: 9 Läufe, jeder aus einem Commit mit geänderter Auftragsdatei; Code-Commits (00d23dd, 30c0d49, 2a25e44) ohne Lauf; nicht auf `main` |
| Q08 | PASS 20/20 im Testlauf 45214168374 und erneut 45221141798 nach der Gegenprüfung. Vorher Befunde (nicht still angepasst, je mit Regressionstest): Lauf 1 14/20 (leerer Seitentext bei fehlendem `</head>`; robots.txt oema.at einmal Zeitüberschreitung), Lauf 2 17/20, Lauf 4 19/20 (Inhalt in `<template>` übersprungen, digicomp.ch), Lauf 5 20/20 (Termindaten in Attributen) |
| Q09 | PASS: Vollauf 45221462893, 850 Adressen alle mit Status, Linkquote 84,5 %, NICHT_LESBAR 75 Adressen gelistet (`chrome_liste`) |
| Q10 | PASS: Auswertung zweimal bytegleich (Abgleich, Listen, Messbericht, Prüfliste, Prüfblatt, Entwurf) |
| Q11 | PASS: Prüfblatt 30 Einträge reproduzierbar, nur sichtbare, 8 Felder mit Link |
| Q12 | PASS: Entwurf 028 (354 Zeilen) mit `eingang_pruefen.py` an einer Kopie ohne Fehler; `pruefen_ab` nach der Regel |
| Q13 | grün: P24 14/14, Nachträge 14/14, P25 Master 8/8, Generator 13/13, P26 14/14, P27 15/15, P28 12/12, P29 9 PASS / 1 FAIL = P12 (+4'000 Byte, angenommen E253) |
| Q14 | Owner-Liste je Seite, Zahl und Aufwand im Messbericht; über Budget → §7 |

Messung Hash-Rauschen: zwei Vollläufe kurz nacheinander, 48 von 718 Seiten mit anderem Hash (6,7 %; vor allem pc-college.ch 19, oema.at 10). Ab dem zweiten Monat sind so viele GEAENDERT-Fälle Fehlalarme; sie gehen nur an Claude.

## 5. Gegenprüfung (getrennter Agent)

Urteil FAIL mit einem Blocker. **B1** eingearbeitet: Eine Weiterleitung galt als Routine, sobald der Titel irgendwo am Ziel stand; der Entwurf hätte Kurslinks auf Übersichts- oder Entwurfsseiten umgeschrieben (OFFER-CFPOCST-001/-002, PCC-P22, OFFER-ATED-004). Neu geht eine Weiterleitung an den Owner, wenn der Titel nur im Fliesstext steht, das Ziel übergeordnet ist, mehrere Kurslinks auf dasselbe Ziel führen oder der Termin am Ziel fehlt; alle vier Fälle stehen jetzt in der Owner-Liste. Hinweise eingearbeitet: H2 Preis nur mit Währung oder Preiswort (Fehltreffer wie `transition_duration:500` bei CAD-011 entfallen), H4 Host-Schlüssel ohne Schema, robots.txt-Weiterleitung, Ziele nur http/https, H6 GEAENDERT setzt kein `geprueft_am`, Regel `pruefen_ab` in der Quelle jeder Zeile als Vorschlag markiert, H9 Tests Q03, Q06, Q12 verschärft. Offen als Hinweis: H3 ¾-Titelregel prüft Niveau-Wörter nicht («Grundlagen»/«Fortgeschrittene»); H7 Hash-Rauschen; H8 B1 sagt wenig aus (687 sichtbare Angebote ohne Datum), B3 zählt Routine schon vor dem Eintrag in `eingang/`; H9 Q05 ohne Fall robots.txt 5xx; H10 Methodik-Seite erklärt den Prüfabruf noch nicht; H11 `actions/checkout@v4` nicht auf Commit festgelegt (nur Leserechte).

## 6. Ergebnis am 23.11. (Vollauf 45221462893)

Dateien in `paket30/out/`: `pruefliste_2026-11-23.csv` (307), `abgleich_2026-11-23.csv` (998), `owner_liste_2026-11-23.csv` (135 Seiten), `chrome_liste_2026-11-23.csv` (148), `routine_2026-11-23.csv` (685), `messbericht_2026-11-23.md/.json`, Entwurf `028_20261123_korrekturen.csv` (354 Zeilen: `geprueft_am` 164, `pruefen_ab` 160, `url` 30); Abrufdaten `paket30/out/abruf/`.

- Zweifelsfälle 165 Angebote auf 135 Seiten: Link defekt 66 (u. a. Klubschule Pro 11, CFJM 9, F+F 7, HES-SO Valais 5), Titel fehlt 67 (u. a. MAZ-Kurse mit Weiterleitung auf die Kursübersicht), Weiterleitung unklar 32. Davon auf der Prüfliste 45 Angebote auf 41 Seiten.
- Chrome 148 auf 141 Seiten, zu zwei Dritteln strukturell: **Dawan 54** (www.dawan.ch antwortet dem Runner nicht, auch robots.txt nicht; nach RFC 9309 gesperrt) und **MAZ 54** (Termine stehen nicht auf der Kursseite, nur über my.maz.ch). Das wiederholt sich jeden Monat.
- Routine 685: 570 Werte bestätigt, 50 neuer Termin auf der Seite, 30 neue Adresse, übrige Preis anders.
- Messbericht: B1 0 (erfüllt), B2 84,5 % (nicht erfüllt), B3 87 offen von 307 (vor der Abarbeitung).

Der erste Aktualisierungszyklus (E181) kann damit beginnen: Chrome-Nachprüfung, Nachfolgeseiten für defekte Links suchen, Owner-Liste, Entwurf 028 nach Durchsicht in `eingang/`, Monatsbuild.

## 7. Offen für den Owner

1. **Aufwand (Q14, E186):** 135 Seiten Zweifelsfälle ≈ 305 Min. statt 90. Vorschlag: im ersten Zyklus sucht Claude zuerst Nachfolgeseiten für die 66 defekten Links und prüft die Weiterleitungen im Chat; dem Owner gehen nur die Restfälle, gebündelt je Anbieter (62 Anbieter), zuerst die 41 Seiten der Prüfliste. Der Rückstand ist einmalig; danach sollte der Monat im Budget liegen [SCHÄTZUNG].
2. **Regel `pruefen_ab`** (Vorschlag Claude, aus den häufigsten Abständen im Master): Abruf + 180 Tage, höchstens Termin − 21 Tage, frühestens Abruf + 1 Tag.
3. **Strukturelle Chrome-Last:** MAZ-Termine (54) und Dawan (54) jeden Monat im Chat prüfen, oder einen anderen Weg suchen (z. B. Terminquelle my.maz.ch; Dawan bleibt nach RFC 9309 gesperrt).
4. **Abweichung Statusliste:** 401/403/429/451 als NICHT_LESBAR statt LINK_DEFEKT (§3 Punkt 1) annehmen.
5. Methodik-Satz zum Prüfabruf (User-Agent verweist auf die Methodik) mit dem nächsten Release, zusammen mit E188.

## 8. Nicht Teil von P30

Monatsbuild und Release, Abarbeitung der Listen (erster Zyklus), Testfragenliste D (E258), Kernliste (E222), Lighthouse/axe (E258 E), Stichprobe 30 (E259, erst mit DE, FR, IT).
