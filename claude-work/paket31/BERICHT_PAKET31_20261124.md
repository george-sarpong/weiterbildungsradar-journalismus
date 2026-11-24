# BERICHT PAKET 31 «Lücken füllen», zweiter Durchgang, 24.11.2026

Grundlage: Owner-Entscheide E266–E268, E271, E272; Befunde E269, E270 (erster Durchgang), E273 (dieser Durchgang); Nachtrag MAZ und «Privatkurs»: E274–E276; Restfälle: E277–E279; dritter Durchgang: E280–E288 (Nachbau der Läufe 033–035 in neuer Sitzung, Läufe 036, 037).
Arbeitszweig `claude/datenharmonisierung`, gepusht. Kein Release, kein Merge.
Beleg: [GEPRÜFT] von Claude gemessen oder getestet.

## 1. Ergebnis in Kürze

- **Lauf 029** (E271): 53 Mediencampus-Kurse mit «Privatseminar» (48) oder «Privatkurs» (5) gelten als «Termin nach Vereinbarung», mit Prüfdatum 23.11. und Beleg der Anbieterseite. Den Wert «Termin nach Vereinbarung» hatte der Master schon. Die Lehrgänge 010, 030 und 043 nennen auf der Seite weder einen Termin noch «Privatseminar» und gehen an den Owner. [GEPRÜFT]
- **Lückenregel berichtigt:** Ein Termin «auf Anfrage» oder «nach Vereinbarung» gilt als vollständig, wenn die Anbieterseite ihn bestätigt (Herkunft `ANBIETERSEITE_P31`), wie in E268 entschieden. Bisher zählte er als Lücke.
- **Lauf 030** (E272): 288 Zellen bei 81 Angeboten.
  - ORSYS: 43 Kurse mit ganzer Terminliste, zusammen 159 künftige Termine, alle «Classe à distance» (online). Die Gegenprobe fand jedes Datum auf der Seite (159/159). 15 ORSYS-Seiten haben gar keinen Abschnitt «Dates et lieux».
  - 35 neue Kurslinks nach der Nachfolgesuche (ifage 22, fjum 4, PC-College 5, weitere). Übernommen wurde ein Link nur, wenn der Titel wörtlich auf der neuen Seite steht.
  - Dazu Termine, Preise und Niveau von den neuen bzw. jetzt lesbaren Seiten.
- **Termin vollständig:** 657 am 23.11. → 706 am 24.11. von 1'302. Sichtbar am 24.11.: 1'103 → 1'126. [GEPRÜFT]
- **MAZ-Termine nicht erreicht:** Die Kursseiten verweisen je Kurs auf `my.maz.ch/public/Ereignis/PublicList?angebote=…`. Diese Seite lädt die Termine nur per JavaScript, der Abruf liefert leeren Text. Den Weg über die interne Schnittstelle von my.maz.ch habe ich nicht verfolgt.
- **Nachtrag MAZ (E275, E276), Lauf 031:** In Chrome sind die öffentlichen Terminlisten von my.maz.ch lesbar; das sind dieselben Listen, die maz.ch je Kurs einbindet. 67 Listen gelesen:
  - 35 Kurse mit künftigen Terminen, 114 Zellen. Übernommen nur Zeilen, deren Titel dem Katalogtitel entspricht.
  - 29 Listen «Keine Daten»: MAZ publiziert derzeit keine Durchführung.
  - Nicht verwendet: 2 Listen ohne Kursfilter, MAZ-031 (nur Bewerbungsfenster), MAZ-175 (Liste eines anderen Kurses).
  - Rohdaten `paket31/out/maz_terminlisten_chrome_2026-11-24.txt`.
- **Nach Lauf 031:** Termin vollständig 741, sichtbar am 24.11. 1'143. «Privatkurs» bestätigt (E274). [GEPRÜFT]
- **Restfälle:** 201 Angebote bei 56 Anbietern, davon 141 sichtbar, in `paket31/out/owner_liste_restfaelle_2026-11-24.csv`:
  - DEFEKT 91, UEBERSICHT 60, NICHT_LESBAR 36, KURS_WEG 4, ZWEIFEL 10
  - Die grössten Blöcke: CFJM 19, MAZ 16, ZLI 12, ÖMA 11, EJC 10

## 1b. Nachtrag Restfälle (E277–E279), Lauf 032

- **Websuche:** Je Kurs wurde für die 151 Fälle mit totem Link oder Übersicht im Web gesucht (E277). Bei 6 Fällen ist die Suche unvollständig, weil das Suchbudget aufgebraucht war. 50 Fälle hatten einen Kandidaten. Von 58 Kandidatenseiten waren 26 lesbar.
- **Lauf 032**, 243 Zellen:
  - 11 neue Kurslinks (CFJM 7, fjum 2, FOCAL, SAE), dazu Termine, Preise und Niveau.
  - Ausgeschlossen: CFJM-005 Preis (Angabe pro Tag widersprüchlich), CFJM-020 Preis (Beträge ohne Währung), ZLI-005, -007 und -008 (Kandidat nur eine Übersicht).
- **Archiviert nach E015/E277:** 105 Angebote, davon 65 vorher sichtbar. Sie sind auf HOLD gesetzt und bleiben im Master. Der Schritt ist umkehrbar. Liste zur Kenntnis in `paket31/out/archiv_e277_2026-11-24.csv`.
- **Chrome (E278):**
  - Eingetragen: RaBe Termin 06.02.–30.06.2027, UNIGE-013 Preis CHF 7900, UNIGE-014 Termin laufend.
  - Auch in Chrome nicht lesbar: EJC (Website in Wartung), Swiss Creator Academy (TLS-Fehler), AAU-097 (Sicherheitsprüfung), SFGZ-004.
  - Lesbar, aber ohne Termin: EBU, Kanal K, SASJ.
- **Stand am 24.11.:**

| | vorher | jetzt |
|---|---|---|
| Bestand CH/AT/LI ohne HOLD | 1'302 | 1'197 |
| Sichtbar | 1'143 | 1'080 |
| Termin vollständig | – | 734 von 1'197 |

- **Owner-Liste Restfälle:** 201 → 85: NICHT_LESBAR 36, DEFEKT 24, UEBERSICHT 11, ZWEIFEL 10, KURS_WEG 4.

## 1c. Restfälle, dritter Durchgang (E280–E286), Läufe 033–035

- **Owner-Entscheide 24.11.:** E280 15 Angebote ohne Durchführung archivieren (FFHS, HWZ-004, PC-College 2, EBU 5, Kanal K 5, SASJ); E281 21 Angebote auf derzeit nicht lesbaren Websites bleiben, nächster Monatsbuild; E282 Rest bleibt «keine Angabe», Mediencampus-PDFs lesen, zB.-Termin; E283 HES-SO VS Tages- und Abendkurs als zwei Angebote; E284 drei Kurslinks.
- **Nachbau:** Die erste Fassung der Läufe 033–035 (E285) lag nur im Git-Bundle der Vorsitzung, der Push war abgelehnt worden; sie ist verloren. Auf Owner-Antwort «neu machen» habe ich die Läufe in einer neuen Sitzung nachgebaut (E286): neues Schlüsselpaar, Abruf der Belege auf dem Runner (Lauf 45415385968, 73 Adressen), Websuche. Skript `paket31/scripts/nachbau_033_035.py`, Abrufdaten ohne Kurstext `paket31/out/abruf/abruf_2026-11-24_nachbau_45415385968.jsonl.gz`. [GEPRÜFT]
- **Lauf 033** (40 Zellen, E277): 20 Angebote archiviert, davon 14 vorher sichtbar: dpsuisse 3, Digicomp 2, FHNW 2, HEAD-005, HES-SO VS 004/005, HWZ 013/015, ifage W05, Keystone-SDA, SGP 3, webedu, zB. 001/002. Belege je Fall in der Spalte `quelle`: HTTP 404 oder Übersicht ohne den Kurs.
- **Lauf 034** (33 Zellen):
  - 15 Archivierungen nach E280 (Herkunft `OWNER_E280`, neu in `scripts/eingang_herkunft.csv`). FFHS, HWZ-004 und PC-College 2 neu belegt (Weiterleitung auf Startseite, Nachfolgekurs bzw. leere Kategorie); EBU, Kanal K und SASJ nach den Chrome-Befunden der Vorsitzung in der Owner-Liste (für den Runner HTTP 403 bzw. Seite nur per Skript).
  - OFFER-ZB-005: Termin 28.08.2027 nach Kopfzeile und schema.org (E282). Der Fliesstext der Seite nennt weiter «28. August 2026»; der Widerspruch besteht also noch.
- **Lauf 035** (29 Zellen, 3 neue Angebote):
  - HEVS-001 bis -003 (Tageskurse): Kurslink, Termin, Preis, Ort.
  - Neu: OFFER-HEVS-006 bis -008 (Abendkurse «Soirée»), Termin, Preis, Dauer, Ort nach Kursseite. Beschreibung, Fokus und Lieferform vom Tageskurs, Niveau «nicht erfasst».
  - Kurslinks IF-G08, AT-PROD-OFFER-166, OFFER-KLUB-MIDUCA-008 (E284). Die Berner Standortseite der Klubschule nennt im Seitentext keine Termine, daher keine zweite Durchführung.
- **Abweichungen zur ersten Fassung (E285):**
  - OFFER-USI-002: Kurslink **nicht** ersetzt. usi.ch antwortet dem Runner nur mit HTTP 403 (Sperre); das belegt keinen toten Link. Unterseiten des Programms stehen im Suchindex.
  - Mediencampus-030 und -043: nicht im Nachbau, sondern als **Lauf 036** (12 Zellen, E287) aus den PDF, die du hochgeladen hast: Termin «Einstieg jederzeit möglich» (E268), Dauer 9 Seminare / ca. 1 Jahr bzw. 15 Seminare / ca. 1½ Jahre, Preis ca. CHF 10'350 bzw. CHF 17'250 und 17'940 (mit Abschlussprojekt). Auf deinen Entscheid E288 gilt der Preis als **Mindestpreis** (Lauf 037): ab CHF 10'350 (mindestens 9 Seminare à CHF 1'150) bzw. ab CHF 17'250 (mindestens 15 Seminare), mit Abschlussprojekt ab CHF 17'940; die Budgetsuche zeigt die Lehrgänge als «möglich», solange der Mindestpreis im Budget liegt (E051).
- **Stand am 24.11.:**

| | vor Lauf 033 | jetzt |
|---|---|---|
| Master | 3'819 | 3'822 |
| Bestand CH/AT/LI ohne HOLD | 1'197 | 1'165 |
| Sichtbar | 1'080 | 1'062 |

- **Ergebnis aller 85 Restfälle:** `paket31/out/restfaelle_ergebnis_2026-11-24.csv` (Archiv 35, unverändert 26, «keine Angabe» 15, HEVS 3, Kurslink 3, PDF 2, Termin 1).
- **Grenzen:** klubschule-pro.ch ist für die Browser-Werkzeuge nicht lesbar, nur als Bildschirm. Der Kursbereich von ffzh.ch leitet auch bei aktuellen Kursen auf die Startseite. «Termin vollständig» wurde nicht neu gezählt, weil dafür ein neuer Abruf nötig ist.
- **Tests:** `eingang_pruefen.py` 20 Dateien ohne Fehler (mit Läufen 036, 037); P24 14/14, Nachträge 14/14, P30 34/34. [GEPRÜFT]

## 2. Vorgehen

1. **Stufe 1, Lauf 45339148257:** 358 Angebote abgerufen (ORSYS und MAZ mit Termin-Lücke, alle offenen Fälle aus dem ersten Durchgang). Ganze Seiten bis 40'000 Zeichen, Linklisten, bei toten Seiten die übergeordneten Pfade.
2. **Stufe 2, Lauf 45340574871:** Sitemaps von 46 Anbieter-Hosts (72'042 Adressen), Kandidaten aus den Linklisten, Startseite von my.maz.ch.
3. **Stufe 3, Lauf 45342063520:** 81 MAZ-Kursseiten mit Folgeadresse my.maz.ch und Kandidaten aus den Sitemaps.
4. **Auswertung:**
   - ORSYS mit einem Leser für die feste Vorlage «Dates et lieux». Kein Eintrag blieb unerfasst.
   - Kandidatenseiten und jetzt lesbare Seiten: 4 Lese-Agenten, 117 Seiten, Anleitung `paket31/lesen/ANLEITUNG_B.md`.
   - Übernahme mit Gegenprobe: `paket31/scripts/uebernahme_b.py`.
   - Durchsicht Claude mit 2 Ausschlüssen, festgehalten in `paket31/config/ausschluss_b.csv`: Bei MAZ-LEG-005 sind die Kandidaten nur News-Artikel von 2021. Bei ZB-005 widerspricht sich das Datum auf der Seite.
   - Bestätigen mehrere Seiten denselben Kurs, geht der Fall an den Owner, z. B. bei Tages- und Abendvariante (HEVS).
5. Kurstexte nur verschlüsselt im Laufprotokoll (neues Schlüsselpaar), nur lokal gelesen, nicht im Repo.

Code: `paket30/scripts/abruf.py` (Version p30-abruf-6) mit den neuen Optionen `--links`, `--eltern`, `--zusatz`, `--folge`, `--textgrenze` und `--ids` im Umfang `luecken`. Den Workflow habe ich um diese Optionen ergänzt. Ohne die neuen Optionen ist das Verhalten unverändert: P30 34/34.

## 3. Tests [GEPRÜFT]

- `eingang_pruefen.py`: 12 Dateien ohne Fehler.
- Master ohne Lauf 029: bytegleich mit dem Stand vor diesem Durchgang (SHA-256 f8b43358…).
- Tests: P24 14/14, Nachträge 14/14, P30 34/34.
- ORSYS-Gegenprobe 159/159.
- Neue Kurslinks: Titel aus dem Katalog und von der Seite stimmen überein. Die Liste steht in Lauf 030, Spalte `quelle`.

## 4. Offen für den Owner

1. erledigt: Owner-Liste Restfälle (E277–E284, Ergebnis `paket31/out/restfaelle_ergebnis_2026-11-24.csv`); offen nur E281 im nächsten Monatsbuild.
2. erledigt: MAZ-Termine über Chrome (E275, E276); 29 MAZ-Kurse ohne publizierte Durchführung bleiben mit Termin-Lücke.
3. erledigt: «Privatkurs» bestätigt (E274).
4. **Dawan** bleibt nach RFC 9309 gesperrt (40 Kurse mit Termin-Lücke).

## 5. Nicht Teil dieses Durchgangs

Release, Monatsbuild, ORSYS-Preise und andere Felder ausserhalb von E272, die 55 Fälle «Gegenprobe» aus dem ersten Durchgang.
