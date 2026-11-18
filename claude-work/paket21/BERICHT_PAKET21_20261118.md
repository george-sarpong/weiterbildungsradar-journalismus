# BERICHT Paket 21 – Anbieterland (E123) und Durchführungsort, 18.11.2026

Auftrag: Owner 18.11. «Anbieterland der 24 offenen Anbieter nach Regel E123 klären und dabei prüfen, ob «Ort» die Schweizer Durchführungsorte zeigt; fehlende Orte mit Quelle nachtragen (rund 300 Angebote Schweizer Anbieter ohne Ort, vgl. E129).» Erst Bestandsaufnahme, dann Owner-Entscheide E132–E139, dann Umsetzung. Arbeitszweig `claude/datenharmonisierung`, Basis 57461cb. Nur kostenlose Abrufe (WebFetch, Websuche, Chrome des Owners für digicomp.ch), kein Firecrawl. Website live unverändert; Release nur mit Freigabe.

## 1. Ausgangslage (Live-Stand `data-p18.js`, Stichtag 18.11.)

- Sichtbar 1'027 Angebote (10.11.: 1'068). Die 24 offenen Namen sind 22 Anbieter (PC-COLLEGE und Basel Institute je zweimal benannt), 396 Angebote, davon 298 sichtbar. [GEPRÜFT]
- E129 «rund 300»: gezählt 246 sichtbare Angebote mit Anbieterland Schweiz ohne Ortsland (10.11.: 256), davon 182 ohne jede Ortsangabe (MAZ 96, Mediencampus 56, übrige 30). [GEPRÜFT]
- ChatGPT-Vorarbeit `paket19/input/anbieterland_chatgpt_20261110.csv`: 22 Zeilen, deckt alle 22 Anbieter ab. [GELESEN]

## 2. Anbieterland (E118, E123, E132, E133)

Jede Zeile an Impressum, AGB oder amtlichem UID-Register geprüft (Abruf 18.11.). Belege mit Rechtsträger, Sitz, Quelle und Wortlaut: `paket21/config/anbieterland_belege.csv`.

| Ergebnis | Anbieter |
|---|---|
| Schweiz, Vorarbeit bestätigt | ORSYS (SA Bernex, UID-Register), SAWI, Compass Security, Baumgartner Research, Swiss Creator Academy (UID-Register SIA AG Meggen; Impressum per robots.txt gesperrt), SAE (UID-Register), Swiss Photo Club, Basel Institute (2 Bezeichnungen), Julien Matthey (UID-Register), ITTA, Microwin, décadréE (UID-Register) |
| Schweiz, abweichend entschieden | NobleProg: Zweigniederlassung Baar im Handelsregister (E132; Vorarbeit DE); ASF, ASPP: Schweizer Vereine, Sitz laut Impressum (E133; Vorarbeit offen) |
| Ausland, bestätigt | Laudius DE, PC-COLLEGE DE (2 Bezeichnungen), Dawan FR (keine Schweizer Zweigniederlassung gefunden); LIK AT, Russmedia AT |
| Ausland, abweichend | MiTech IT: Sitz Mailand, Chiasso nur Sede operativa; Angebots-URLs auf mitech.education, Zuordnung damit eindeutig (Vorarbeit offen) |
| bleibt keine Angabe | Ateliers de l'image et du son: weder Rechtsform noch Adresse auf der Website (E123) |

Ergebnis: 377 Angebote (279 sichtbar) mit Anbieterland und Beleg. [GEPRÜFT]

## 3. Durchführungsort (E134–E139, E066)

- Prüfung «Ort zeigt die Schweizer Orte?» bei den 24: meist ja. Lücken: Dawan (Fernunterricht), NobleProg (nur «Schweiz / Online»), ORSYS 27 (nur Fernunterricht, Seiten bestätigen «Classe à distance», bleibt), Ateliers (Seite nennt keinen Kursort, bleibt «Suisse romande»), reine Online-Angebote (bleiben). [GELESEN]
- **Schulregel** (Kursseite nennt keinen Ort, nur die Schuladresse im Footer): MAZ Luzern (E134, 117 Angebote, 93 sichtbar), CFJM Lausanne (18), ZHdK Zürich, cap fotoschule Bern-Liebefeld, Canal9 Sierre (je 1) (E135). Herkunft OWNER_E134/E135, Vermerk «Ort laut Schulstandort, nicht je Kurs belegt». Nur Angebote ohne jede Ortsangabe. Ausnahme OFFER-MAZ-008 «Ausland-Stages» (Praxis in Redaktionen in Asien, Afrika, Lateinamerika, Osteuropa). Gesuchte Hinweise «online» in den übrigen MAZ-Beschreibungen sind Themen, keine Kursform. [GEPRÜFT]
- **Mit Quelle** (E136): Dawan 51 Kursseiten abgerufen, 50 mit «Genève» wählbar (4 mit Genf-Terminen) → «Fernunterricht oder Genf» bzw. «Fernunterricht; Genf wählbar (Termin auf Anfrage)», 1 PDF ohne Ort bleibt; NobleProg 43 Kursseiten → «Basel, Bern, Genf, Lausanne, Zürich / Online» (1 Seite ohne Bern), Termine wechseln laufend; Uni Freiburg → «Freiburg (Universität Freiburg)»; JJS-Events → «verschiedene Orte in der Schweiz (u. a. Zürich, Bern, Luzern, Aarau)». Abrufe in `paket21/out/dawan_abruf_20261118.tsv`, `nobleprog_abruf_20261118.tsv`. [GELESEN]
- **Digicomp** (E139, löst E137 teilweise ab): alle 27 Angebote mit Ort «Digicomp…» im Chrome des Owners geöffnet, Orte je Kurs aus den Termindaten der Kursseite (schema.org EducationEvent). 24 Angebote mit belegten Städten: 14 französische Kurse nur «Lausanne, Genf», deutsche Kurse «Zürich, Basel, Bern» oder alle fünf Standorte, Lehrgang Web Design Professional «Zürich / Online»; «Online» nur bei 6 Angeboten mit Online-Terminen. 13 frühere «Virtual Training»-Angebote zeigen heute nur Präsenztermine; das Feld Kursform bleibt unverändert. 041 «Publisher Professional» und 044 «Adobe Video- und Audio – Basic»: Eintrags-URL führt auf eine Übersichtsseite, Kursseite nicht gefunden → nur «Digicomp-Standort in der Schweiz». 033 Affinity Photo: Link 404, unverändert. Abrufe in `paket21/out/digicomp_abruf_20261118.tsv`. Die frühere pauschale Fünf-Städte-Angabe (E137) hätte in der Smart-Suche falsche Ortstreffer erzeugt (E110). [GELESEN]
- Ohne Ort bleiben (Seite nennt keinen): Mediencampus 56 (Privatseminar; Sekretariat Stein AG ist kein Kursort), Geschichten-Bäckerei, JJS-Mentoring, Reflekt, Schreibszene, RTS, investigativ.ch («direkt in den Redaktionen»), OFFER-MAZ-159 (photojournalism.ch mit MAZ; MAZ-Seite verweist auf photojournalism.ch); nicht lesbar: Lobbywatch (robots.txt), zB. Zentrum Bildung und photojournalism.ch (Fehler). [GELESEN]
- CH-Zugang nach E066 bei jedem neuen Schweizer Ort: 216 Angebote. Ort nie aus dem Anbieterland abgeleitet (E030). [GEPRÜFT]
- Summe: 259 Orte, 216 Ortsländer, 216 CH-Zugänge, 377 Anbieterländer = 1'327 Felder bei 543 Angeboten (`paket21/config/korrekturen.csv`). [GEPRÜFT]

## 4. Daten und Master

- `paket21/scripts/korrekturen_p21.py` erzeugt die Korrekturliste aus Belegen, Regeln, Ausnahmen und Abrufen (alter Wert aus `data-p18.js` und Master); `build_daten_p21.py` prüft jeden alten Wert und schreibt `paket21/website/data-p21.js` mit Herkunft im Feld `korrekturen`; Website-Kandidat `paket21/website/` = Paket 20 mit `data-p21.js`.
- Master: `scripts/master_nachtraege.py` um Paket 21 erweitert (Herkunft IMPRESSUM_E118/E123, UID_REGISTER_E132, IMPRESSUM_E133, OWNER_E134/E135, ANBIETERSEITE_E136, ANBIETERSEITE_E139, REGEL_E066; dazu `anbieter_land_beleg`, `ch_zugang_regel`). `master_3818_aktuell.csv` jetzt 4'031 Felder im Protokoll, Anbieterland belegt 1'333; Beta-Sichtbarkeit unverändert. Basis `master_3818.csv` byte-gleich. [GEPRÜFT]
- E129 neu gezählt: sichtbare Angebote Schweizer Anbieter ohne Ortsland 246 → 162, davon 69 ohne Online-Kennung (56 Mediencampus). Die Katalogsuche über das Anbieterland (E129) bleibt deshalb sinnvoll; neu findet «Frankreich» auch Dawan, «Deutschland» Laudius und PC-COLLEGE (`paket21/out/e129_ohne_ort_nachher.json`). [GEPRÜFT]

## 5. Tests (18.11.2026)

| Testsatz | Ergebnis |
|---|---|
| `paket21/tests/test_paket21.js` | 11/11 (reproduzierbar; nur gelistete Felder; Sichtbarkeit 18.11./01.12. unverändert; Anbieterland; E066; Ort nie aus Anbieterland; MAZ-Ausnahme; Kartenanzeige; E129; Digicomp je Kurs) |
| `scripts/test_nachtraege.py` | 12/12 (N06 nachgeführt auf 1'333, neu N12 Master = data-p21.js) |
| Stufe 1 `test_paket8.js` (MASTER aktuell) | 35 PASS, 0 FAIL, 4 später an beiden Stichtagen |
| Stufe 1 Browser `test_browser_p8.js` | B1, B3a, B3b, S1 PASS; T1, T5 Soll offen wie live |
| Stufe 2 `test_stufe2_browser.js` | 10 PASS (D8 entfällt, E105); 1'027 Karten ohne Rohcode |
| Pakete 5, 6, 7, 9, 10 | 24/24, 35/35, 41/41, 15/15, 12/12 |
| Release-Paket (`paket21/scripts/build_release.py`) | R1 PASS, Prüfsummen OK; Rückweg `rollback/index.html` byte-gleich mit dem Live-Stand 18.11., `data-p18.js` bleibt im Paket |

`.htaccess` und `robots.txt` unverändert gegenüber dem Live-Stand.

## 6. Regel «ein Angebot = ein Eintrag» (E138)

Recherche 18.11.: Keine Norm verlangt Mehrfacheinträge; BA KURSNET verbietet inhaltlich identische Angebote (1:n-Prinzip), schema.org (Course → CourseInstance), Europass ELM und open-Qcat trennen Kurs und Durchführung, berufsberatung.ch zeigt «Mehrere Ausbildungsorte» auf einer Seite. Der Katalog erfüllt das schon (ein Angebot, Ort als mehrwertige Angabe); keine Datenänderung.

## 7. Offen (Owner)

1. Nachtrag Paket 21 im GESAMTWISSENSSTAND bestätigen.
2. Release-Freigabe für Paket 21 (vollständiges Paket mit allen Dateien, wie 18.11.).
3. Digicomp 041 und 044 (Eintrags-URL führt auf eine Übersichtsseite, Kursseite nicht gefunden) und 033 (Link 404): archivieren oder URL nachrecherchieren (E015)?
4. 2 Altfälle mit mehreren Ländern ohne CH-Zugang (OFFER-MAZ-086 «Hamburg | St. Gallen | Luzern», OFFER-AJM-002) – aus Paket 4, nicht geändert.
5. Hinweise für die Nachrecherche (nicht beauftragt): Reflekt «Aktuell sind keine Workshops geplant», Schreibszene «aktuell nicht ausgeschrieben» (E015); Russmedia Akademie laut Website für eigene Mitarbeitende (E005), Angebot nicht sichtbar.

Quellen (abgerufen 18.11.2026): BA KURSNET Eingabehilfe (https://www.arbeitsagentur.de/datei/kursnet-eingabehilfe-weiterbildungsangebote_ba035945.pdf), schema.org CourseInstance (https://schema.org/CourseInstance), berufsberatung.ch Datenmanagement (https://www.berufsberatung.ch/dyn/show/128618); UID-Register uid.admin.ch (CHE-163.498.540, -357.494.167, -320.936.886, -106.127.941, -470.755.502, -154.191.373); Impressen und AGB laut `anbieterland_belege.csv`; KMU-Portal Bund, Handelsregister (https://www.kmu.admin.ch/de/handelsregister-rechte-und-pflichten-fuer-kmu); Kursseiten Dawan, NobleProg, CFJM, MAZ, Mediencampus, Uni Freiburg, JJS, Digicomp (Websuche) laut Korrekturliste.
