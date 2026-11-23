# SPEZIFIKATION PAKET 30 «Aktualisierung», 23.11.2026

Status: **Freigegeben 23.11.2026** (E260–E263: Entscheide 1–4 je A, ohne Zweitmeinung). U1 erledigt (E260).
Auftrag: Owner 23.11., Chat «weiter» (GESAMTWISSENSSTAND §9: «P30 (Aktualisierung, E175, E177) mit Beta-Messkriterien vorher (E187)»); Messkriterien entschieden (E258, E259).
Grundlage: `ZIELBILD_UNTERBAU_20261120.md` §3 Punkt 6, §4 Zeile P30; E175 (Abruf ausserhalb des Chats, nur Hash, nur Prüfliste, nie Write in den Master), E177/E186 (Monatsbuild mit Prüfliste, Owner rund 1,5 Std.), E181 (ein Aktualisierungszyklus vor Beta-Ausstieg), E258 B (Linkquote ≥ 95 %), E259 (Prüfblatt Stichprobe), E031, E041, E027/E166.
Vorprüfung: Arbeitszweig `claude/datenharmonisierung` auf 81fbafe; Master `paket3/out/master_3818_aktuell.csv`; Sichtbarkeit mit `scripts/sichtbarkeit.py`.
Beleg: [GEPRÜFT] von Claude gezählt/gelesen · [GELESEN] Quelle gelesen · [SCHÄTZUNG] gerechnet, nicht gemessen · [ZU BELEGEN] in der Umsetzung prüfen.

## 1. Ausgangslage (Vorprüfung)

### 1.1 Bestand am 23.11. [GEPRÜFT]

| Grösse | Wert |
|---|---|
| sichtbar 23.11. | 998 Angebote (CH 923, AT 71, LI 4) = Release P29 |
| fallen bis 23.12. weg (ohne Nachpflege) | 141 |
| `pruefen_ab` ≤ 23.12. | 252, davon 188 schon fällig (≤ 23.11.) |
| Prüfliste nach E177 (fällig bis 23.12. oder fällt weg) | 307 Angebote |
| `geprueft_am` | August 545, September 401, November 52 |
| `pruefen_ab`-Herkunft | LIVE 948, MAIN_OWNER 49, ANBIETERSEITE_E143 1 |
| Kurslinks (`url`) | 850 verschiedene Adressen auf 144 Hosts; grösste: maz.ch 106, orsys.fr 78, mediencampus.ch 56, dawan.ch 54, nobleprog.ch 50, digicomp.ch 34 |
| gespeicherte Seiten-Hashes | nur V288 (829 Zeilen, alle HOLD, nicht sichtbar); für sichtbare Angebote **keine Basis** |

Folge: Ein reiner Hash-Vergleich (E175) findet im ersten Zyklus nichts, weil es keinen früheren Hash gibt. Er wirkt erst ab dem zweiten Lauf.

### 1.2 Werkzeug [GELESEN, GEPRÜFT]

- Aus dieser Arbeitsumgebung erreicht `curl` keine Anbieterseite (maz.ch, orsys.fr, digicomp.ch: keine Verbindung). Im Chat bleibt nur WebFetch oder Chrome, je Seite ein Aufruf: bei 307 bis 850 Seiten je Monat langsam und teuer an Tokens.
- Repo ist öffentlich, Standardzweig `main` [GEPRÜFT, GitHub API]. GitHub Actions auf Standard-Runnern ist für öffentliche Repos kostenlos (ZIELBILD §2 B5).
- GitHub Docs «Events that trigger workflows» (abgerufen 23.11.2026) [GELESEN]: «Scheduled workflows will only run on the default branch»; `workflow_dispatch` löst nur aus, «if the workflow file exists on the default branch»; «In a public repository, scheduled workflows are automatically disabled when no repository activity has occurred in 60 days.» Der Ereignistyp `push` dagegen umfasst ausdrücklich «workflows that are not merged into the default branch» und lässt sich mit `branches` und `paths` filtern.
- Damit klärt sich [ZU BELEGEN] aus ZIELBILD O5: Zeitplan und Start-Knopf brauchen `main` (Konflikt E041). Ein Ablauf, der beim Push einer Auftragsdatei auf den Arbeitszweig startet, braucht `main` nicht.
- Offen [ZU BELEGEN, U1]: ob der Schreibzugang dieser Sitzung Dateien unter `.github/workflows/` pushen darf (GitHub verlangt dafür eine eigene Berechtigung).
- Ein vorhandener Ablauf `.github/workflows/hosted-search-qa.yml` läuft nur auf `main` (GitHub Pages) und bleibt unberührt.

## 2. Auftrag P30 (Umfang)

| Nr. | Inhalt |
|---|---|
| A1 | **Prüfliste** `paket30/scripts/pruefliste.py <Stichtag> <nächster Build>`: je sichtbares Angebot Grund «fällig» (`pruefen_ab` ≤ nächster Build) und/oder «fällt weg» (sichtbar am Stichtag, nicht am nächsten Build); Ausgabe CSV, Sortierung Anbieter, Titel |
| A2 | **Abruf** ausserhalb des Chats (Entscheid 1): Seiten der Kurslinks laden, höflich (robots.txt beachten, je Host eine Anfrage zugleich, mindestens 2 s Abstand, eigener User-Agent mit Link auf die Methodik), Ergebnis je Adresse: HTTP-Status, Ziel nach Weiterleitung, Hash des bereinigten Seitentexts, gefundene Werte. Keine Seitentexte im Repo, nur Hash und Fundstellen (höchstens 200 Zeichen je Wert) |
| A3 | **Abgleich** (Entscheid 2) je Angebot: Status `OK`, `WERT_FEHLT` (Datum, Preis oder Titel des Katalogs nicht auf der Seite), `GEAENDERT` (Hash anders als im Vormonat), `LINK_DEFEKT` (4xx, 5xx, Namensauflösung), `WEITERLEITUNG` (anderes Ziel), `NICHT_LESBAR` (robots.txt sperrt, Zeitüberschreitung, Seite nur mit JavaScript). `NICHT_LESBAR` prüft Claude im Chat (Chrome, wie E139) |
| A4 | **Ergebnis für den Owner**: eine Liste nur mit Zweifelsfällen (Entscheid 4), mit Link und Vorschlag; übrige Fälle setzt Claude über `eingang/` um (Entscheid 4). Die Abrufdaten schreiben nie in den Master (E175, E031) |
| A5 | **Messbericht** je Monatsbuild für E258 B: sichtbare Kurse mit vergangenem Enddatum (Soll 0), Linkquote = erreichbare / alle Kurslinks (Soll ≥ 95 %), Prüfliste abgearbeitet (jede Zeile mit Ergebnis) |
| A6 | **Prüfblatt Stichprobe** (E259) `paket30/scripts/stichprobe.py <Stichtag> <n> <Startwert>`: zieht n sichtbare Einträge reproduzierbar; je Feld (Titel, Anbieter, Datum, Ort, Kursform, Sprache, Dauer, Preis) Katalogwert neben Fundstelle aus A2 mit Link; Spalte «stimmt / stimmt nicht» für den Owner |
| A7 | **Testlauf** (ZIELBILD §4): 20 Angebote mit bekanntem Ergebnis, dann ein ganzer Lauf über alle Kurslinks; erst danach gilt der erste Zyklus (E181) als begonnen |

Nicht Teil von P30: Monatsbuild und Release selbst (Bau wie P29), Recherche und Kernliste (E222), Testfragenliste D (E258), Lighthouse- und axe-Messung E (beim nächsten Release), Seiten je Kurs (E151).

## 3. Entscheidungsvorlagen für den Owner

**Entscheid 1 – Wo läuft der Abruf?**
- A (Empfehlung): GitHub Actions auf dem Arbeitszweig, ausgelöst durch einen Push einer Auftragsdatei (`claude-work/pruefung/auftrag.txt` mit Stichtag). Claude startet den Lauf selbst, holt das Ergebnis (Datei des Laufs) mit `gh` und wertet aus. Kein `main`, E041 bleibt. Kein fester Zeitplan: Claude stösst den Lauf beim Monatsbuild an.
- B: Zeitplan auf `main` (läuft z. B. am 1. jedes Monats von selbst). Braucht eine Ausnahme zu E041 (Workflow-Datei auf `main`) und wird nach 60 Tagen ohne Aktivität im Repo automatisch abgeschaltet.
- C: Kein GitHub-Ablauf; Claude ruft im Chat ab (WebFetch, Chrome). Je Monat 307 bis 850 Einzelaufrufe; nur für die Prüfliste realistisch, keine Linkquote über alle Links.

**Entscheid 2 – Was wird verglichen?** (präzisiert E175 «nur Hash-Vergleich»)
- A (Empfehlung): Hash des bereinigten Seitentexts **und** Wertabgleich (kommen Datum, Preis und Titel des Katalogs auf der Seite vor?). Der Wertabgleich wirkt schon im ersten Lauf; der Hash ab dem zweiten.
- B: nur Hash wie E175 wörtlich. Im ersten Lauf keine Aussage ausser Link erreichbar.

**Entscheid 3 – Welche Angebote werden abgerufen?**
- A (Empfehlung): alle sichtbaren (850 Adressen). Nötig für die Linkquote E258 B; dauert auf dem Runner geschätzt 10–20 Min. [SCHÄTZUNG], kostet nichts. Dem Owner gehen trotzdem nur Zweifelsfälle zu.
- B: nur die Prüfliste (307 Angebote). Linkquote dann nur für diese.

**Entscheid 4 – Wer setzt Ergebnisse um?** (heute braucht jede Eingangszeile eine Register-ID, `eingang/LIESMICH.md`)
- A (Empfehlung): Claude trägt **Routinefälle** mit Beleg der Anbieterseite ohne Einzelentscheid über `eingang/` ein: neuer Termin, Preis, Dauer, Ort, neue Adresse nach Weiterleitung, `geprueft_am`, `pruefen_ab`. Grundlage ist ein stehender Register-Eintrag mit eigenem Herkunftscode (z. B. `ANBIETERSEITE_P30`). **Zweifelsfälle entscheidet der Owner:** Kurs nicht mehr im Angebot (Archiv nach E015), Link tot ohne Nachfolger, Scope-Frage, Widerspruch auf der Seite. Passt zu E177 («Claude prüft, Owner entscheidet Zweifelsfälle»).
- B: Jede Änderung legt Claude dem Owner einzeln vor. Bei rund 300 Fällen im Monat sprengt das die 1,5 Std. (E186).

**Entscheid 5 – Freigabe**
- A: Spezifikation mit den gewählten Varianten freigeben; Umsetzung zuerst U1–U3; Zweitmeinung ChatGPT parallel (Claude legt den fertigen Text bereit); kein Release in P30.
- B: wie A, ohne Zweitmeinung.

## 4. Umsetzung (nach Freigabe)

- U1: Prüfen, ob ein Push nach `.github/workflows/` mit dem Schreibzugang dieser Sitzung geht (Testdatei auf dem Arbeitszweig, danach entfernt). Geht es nicht: anhalten, Owner fragen (z. B. Datei einmal vom Owner anlegen lassen, mit fertigem Text).
- U2: Prüfliste am 23.11. gegen die Zählung §1.1 (307 Angebote).
- U3: 20 Testangebote auswählen und ihr Soll-Ergebnis von Hand festhalten (je Status mindestens ein Fall, darunter maz.ch, orsys.fr, digicomp.ch), committet vor dem Code (wie P29 V5).
- Dateien: `.github/workflows/p30-pruefung.yml` (nur `push` auf `claude/datenharmonisierung` mit `paths: claude-work/pruefung/auftrag.txt`; `permissions: contents: read`; Ergebnis als Datei des Laufs, keine Schreibrechte, keine Geheimnisse), `paket30/scripts/abruf.py`, `abgleich.py`, `pruefliste.py`, `stichprobe.py`, `messbericht.py`, Tests `paket30/tests/`.
- Bereinigung vor dem Hash: HTML-Tags, Skripte, Styles, Leerraum entfernt; Werte, die sich bei jedem Abruf ändern (z. B. Zeitstempel, Sitzungskennungen), werden mit Testfällen erkannt und ausgenommen.

## 5. Testliste

| Nr. | Prüfung | Soll |
|---|---|---|
| Q01 | Prüfliste an 23.11., 01.12., 20.12. gegen unabhängige Zählung | gleiche Menge, Gründe je Zeile; am 23.11. 307 |
| Q02 | Kein Write: Master, Protokoll, `eingang/`, Website vor und nach jedem Lauf | SHA-256 gleich |
| Q03 | Abgleich mit lokalem Testserver: je Status mindestens 2 Fälle (OK, WERT_FEHLT, GEAENDERT, LINK_DEFEKT, WEITERLEITUNG, NICHT_LESBAR) | Status wie Soll, 0 Abweichungen |
| Q04 | Bereinigung: gleiche Seite mit anderem Zeitstempel, Cookie-Banner, Sitzungskennung | gleicher Hash; echte Änderung (Datum, Preis) → anderer Hash |
| Q05 | Höflichkeit am Testserver: robots.txt-Sperre beachtet, je Host höchstens 1 Anfrage zugleich, Abstand ≥ 2 s | Protokoll des Testservers belegt es |
| Q06 | Datumserkennung: 12.03.2027, 12. März 2027, 12 mars 2027, 12 marzo 2027, 2027-03-12; Preis 1150, 1'150, 1.150, CHF 1150.– | erkannt; Gegenproben (anderes Datum, anderer Betrag) nicht |
| Q07 | Workflow: läuft bei Push der Auftragsdatei auf dem Arbeitszweig, nicht bei anderen Pushes, nicht auf `main`; nur Leserechte | belegt mit Laufprotokoll |
| Q08 | Testlauf 20 Angebote (U3) | Status = Soll von Hand; Abweichung = Befund, nicht still angepasst |
| Q09 | Vollauf alle Kurslinks | Linkquote berechnet; jede Adresse mit Status; `NICHT_LESBAR` aufgelistet |
| Q10 | Auswertung zweimal mit denselben Abrufdaten | Prüfliste, Owner-Liste und Messbericht bytegleich |
| Q11 | Prüfblatt: gleicher Startwert → gleiche 30 Einträge; jeder Eintrag mit Link und allen Feldern | reproduzierbar; nur sichtbare Einträge |
| Q12 | Eingangszeilen aus Routinefällen (nur bei Entscheid 4 A) | `eingang_pruefen.py` ohne Fehler; Herkunft und Register-ID je Zeile |
| Q13 | Alte Tests (P29 Suite, P28, P27, P26, P25, P24, Nachträge) | grün |
| Q14 | Owner-Liste: Zahl der Zweifelsfälle im Bericht, mit Schätzung des Aufwands | im Bericht; liegt sie über 1,5 Std., Owner fragen (E177) |

Gegenprüfung durch getrennten Agenten wie P28, P29.

## 6. Offen nach P30

Erster Monatsbuild mit Prüfliste (Release wie P29) = erster Zyklus nach E181; Testfragenliste D (E258); Kernliste je Land (E222) und Recherche Stufe 1 über `eingang/`; Lighthouse- und axe-Messung beim nächsten Release (E258 E).
