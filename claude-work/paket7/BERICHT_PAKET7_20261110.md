# BERICHT Paket 7 – Beta-Muss D7, F5, F6 (10.11.2026)

Auftrag (Owner 10.11.): Beta-Muss gemäss E074 bauen – Länderanzeige (§5 Punkt 5, D7), Preisspanne (WDA-01, F5), «Kostenlos»-Trennung (WDA-03, F6) – mit Tests, nur auf `claude/datenharmonisierung`.
Nicht in diesem Paket: E053/E058/E059, DE/USA (E074), `c79eb56`, Master, Smart-Datendatei, Skript-Verweise in `index.html`, `main`, Release, kostenpflichtige Läufe.
Beleg: [GEPRÜFT] gerechnet bzw. per Test abgesichert · [GELESEN] Original gelesen · [OWNER] Entscheid George.

## 1. Grundlage
- Basis: `paket6/website/app-v35.js`, `index.html`, `methodik.html` (Hashes geprüft); Daten `paket3/out/merge_kandidat_data.json`, `merge_kandidat_smart.json`, `master_3818.csv` [GEPRÜFT].
- WDA-01 und WDA-03: End-to-End-Audit 28.10. Abschn. B, D, H (Drive `1mv4fmYv…`) [GELESEN]; Code-Entwurf WDA-03 in PR10 (`priceCategoryForDisplay`) gelesen, Bezeichnungen dort weichen von E057 ab, deshalb nicht übernommen, sondern neu nach E057 [GELESEN].
- Owner 10.11. (Rückfrage D7): Länderfilter nach **Durchführungsort**; Anbieterland ohne Beleg als **«nicht erfasst»** zeigen (E081, E082) [OWNER].

## 2. Umsetzung [GEPRÜFT]
| Datei | SHA-256 | erzeugt mit |
|---|---|---|
| `website/app-v36.js` | `38e666511b91…` | `scripts/port_app_v36.py` (20 Ersetzungen auf app-v35, +136/−28 Zeilen) |
| `website/data-p7.js` | `f9ea7b48fb83…` | `scripts/build_daten_p7.py` (Kandidat + Feld `laender` aus dem Master) |
| `website/index.html` | `af1362139fc3…` | `scripts/port_html_p7.py` (2 Ersetzungen, 3 Zeilen) |
| `website/methodik.html` | `bcc5408cea1f…` | `scripts/port_html_p7.py` (2 Ersetzungen, 3 Zeilen) |

- **F5 Preisspanne (E051):** Eine Spanne gilt als belegter Gesamtpreis, wenn beide Grenzen publiziert sind und nach denselben Regeln wie beim Einzelpreis nichts offen bleibt (Pflichtgebühren bekannt, Abrechnung gesamt oder mit Anzahl, MWST nicht «ausgeschlossen ohne Satz», ganzes Angebot). Dann: Obergrenze ≤ Budget bei unbedingtem Tarif = direkter Treffer («im Budget», Restbetrag ab Obergrenze: «Bei der Preisobergrenze bleiben …»); Untergrenze ≤ Budget < Obergrenze = «könnte ins Budget passen»; Untergrenze > Budget = «über Budget». Sonst bleibt das Ergebnis wie bisher.
- **F6 «Kostenlos» (E052, E057):** Eine gemeinsame Klassierung für Karte, Preisfilter, Preisbänder und Smart-Suche. «Kostenlos» = strukturierter Gratis-Tarif ohne Bedingung (dieselbe Regel wie die Smart-Suche). «Kostenlos mit Bedingung: …» nennt die Bedingung aus dem strukturierten Tarif («für Mitglieder», «für Abonnent:innen», «für Journalist:innen») oder wörtlich aus der Preisangabe. Sonst «Preis unbestätigt». Der Preisfilter hat dafür drei getrennte Optionen.
- **D7 Länderanzeige (E043, E065, E066):** Je Angebot das Feld `laender` (Markt, Anbieterland, Land des Durchführungsorts, Sicherheitsgrad, CH-Zugang) wörtlich aus dem Master; `country` bleibt als Rohwert im Datensatz, wird aber nicht mehr angezeigt, gefiltert oder durchsucht. Karte: «Ort: …», «Anbieterland: …», «CH-Zugang: …»; fehlt eine Angabe, steht «nicht erfasst». Filter «Durchführungsort»: Länder des Orts, «Online» bei Online-Anteil, sonst «nicht erfasst». Startseite und Methodik beschreiben die drei Angaben; «Anbieterbasis» entfällt.
- `index.html`, `app-v36.js` und `data-p7.js` gehören zusammen: die App braucht das Feld `laender`.

## 3. Detailprüfung [GEPRÜFT]
- Spannen im Kandidaten: 26 RANGE-Tarife, alle unbedingt, ganzes Angebot, gesamt, MWST «UNSPECIFIED», ohne Zusatzgebühren. Am 09.11. sichtbar: 25 Angebote, davon 18 mit Obergrenze ≤ 800 (= Audit 28.10.).
- «Kostenlos» im Kandidaten: 31 Angebote mit Kategorie KOSTENLOS; 22 ohne Bedingung strukturiert; 7 mit Bedingung (OFFER-CORSO-002, CH-NOV-OF-022 bis -026, OFFER-VSM-003); 2 «Preis unbestätigt» (CH-CLEAN2-V9-D01, AT-PROD-OFFER-208). Am 09.11. sichtbar: Filter «Kostenlos» 15 (vorher 23), «mit Bedingung» 6, «unbestätigt» 2.
- Länder am 09.11. (1'071 sichtbar): Schweiz 602, Österreich 61, Liechtenstein 4, Deutschland 5, Belgien 2, Online 477, nicht erfasst 192 (Mehrfachzuordnung möglich); CH-Zugang «ja» 600; 21 DJA mit Anbieterland Deutschland und CH-Zugang «nicht erfasst»; 19 Ateliers mit Ort Schweiz statt «Frankreich».
- Sichtbare Menge unverändert: 1'071 am 09.11., 948 am 01.12. (wie Paket 6).

## 4. Tests [GEPRÜFT]
`paket7/tests/test_app_v36.js` (jsdom, Aufruf wie Paket 6): **41/41 PASS** am 09.11. und am 01.12.2026. Paket 6 weiterhin 35/35, Paket 5 24/24 (beide Stichtage). Drei Manipulationsproben (bedingte Spanne direkt, alle KOSTENLOS als «Kostenlos», CH-Zugang aus Markt) werden erkannt.
- L01–L12 (D7): Daten nur um `laender` ergänzt und wörtlich = Master; drei getrennte Angaben je Karte = unabhängige Referenz; CH-Zugang nur aus CH-Ort, DJA nicht «ja»; kein Rohwert «Frankreich»/«CH_ACCESS»; Filteroptionen und Treffer je Option = Referenz; URL-Parameter; Smart-Karte.
- P01–P08 (F5): T02 (CHF 800 → direkt, Rest 288, Hinweis 1:1), T03 (511 möglich, 512/513 direkt), 480/479, Gegenprobe v35, 11 Grenzfälle (bedingter Tarif, MWST, Pflichtgebühren, Abrechnung, Variante, fehlende Obergrenze, abgelaufener Tarif), GBP.
- K01–K10 (F6): alle 31 KOSTENLOS-Angebote mit Bezeichnung = Referenz (T06); Filter «Kostenlos» = Preisband = Smart ohne Bedingung; jedes Angebot in genau einer Preisoption; Gegenprobe v35; Smart-Bezeichnungen E057 inkl. Budgetsuche; T20.
- R01–R06: Karten, Reihenfolge und Smart-Suche ohne Budget identisch mit v35 (ausser Länder-Badges und KOSTENLOS-Preis); mit Budget nur Verschiebungen durch Spannen; T09, T12.
- H01–H05: HTML nur an den vorgesehenen Stellen, Skript-Verweise unverändert; alle vier Dateien byte-identisch reproduzierbar.

Vorlage Testkriterien: D7, F5, F6 jetzt «vorh.»; D4 im Website-Test abgedeckt (L07); T02, T03, T06, T20 PASS.

## 5. Hinweise und offene Fragen an den Owner
1. **MWST «UNSPECIFIED»:** Wie beim Einzelpreis seit E010 gilt eine nicht angegebene MWST nicht als offen. Alle 26 Spannen haben «UNSPECIFIED»; bei strengerer Lesart von E051 («keine offenen … MWST») hätte F5 keine Wirkung. Frage: so lassen?
2. **Bedingte Spanne:** E051 regelt nur unbedingte Tarife. Eine Mitgliederspanne mit Obergrenze ≤ Budget bleibt «möglich» (Einzelpreis: «bedingter Tarif im Budget»). Im Bestand kein Fall.
3. **Bedingt kostenlos, zwei Abdeckungen:** Die Smart-Suche «kostenlos» zeigt nur strukturierte bedingte Tarife (z. B. Edito, CFJM, Helias, impressum; E010), nicht die 7 bedingten Angebote ohne prüfbare Preisdaten. Der Preisfilter «Kostenlos mit Bedingung» enthält nur Angebote der Kategorie KOSTENLOS; Edito usw. bleiben unter «Mehrere Tarife». Die Bezeichnungen sind überall gleich.
4. Unverändert: Knopf «Nur Gratis-Angebote», Chip «Nur Angebote mit strukturierter Kostenlos-Option», Rohtexte der Region wie «ON_REQUEST» hinter dem Ort, URL-Parameter heisst weiter `country`.
5. Die Volltextsuche nach «Schweiz» findet jetzt nur Angebote mit Ort oder Anbieterland Schweiz, nicht mehr alle mit Rohwert «Schweiz».
6. Jede Karte hat drei Badges mehr. Darstellung auf Handy und Desktop (T6) ist Teil der Vorabprüfung im Browser (Stufe 2), noch nicht gemacht.

## 6. Drift-Prüfung
Geändert: nur D7, F5, F6 und die zugehörigen Texte in Startseite und Methodik; neue Kandidaten-Datendatei mit Feld `laender`. Unberührt: E053/E058/E059, DE/USA, `c79eb56`, Master, Smart-Datendatei, Skript-Verweise, `main`, Release, Infomaniak.

## 7. Offen bis zur Beta
- Testsatz gemäss Vorlage vervollständigen (u. a. D2, D5, D8, F1 mit T01–T20, S1–S3, B1–B2, T2, T5, T6, R1–R5).
- Release-Paket nur mit Freigabe: `index.html` auf `app-v36.js`, `data-p7.js` und Smart-Daten aus dem Kandidaten, Prüfsummen, Rollback (E040, Projektregel 7).
