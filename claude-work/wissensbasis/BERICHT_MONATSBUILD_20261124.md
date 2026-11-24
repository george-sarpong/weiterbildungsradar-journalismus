# BERICHT Monatsbuild 24.11.2026 (erster Monatsbuild nach E177/E258)

Grundlage: GESAMTWISSENSSTAND §9 (E281 und Dawan im nächsten Monatsbuild, danach Monatsbuild und Release nur mit Freigabe); Owner-Entscheide E289–E292, E294 (Release-Freigabe), E295 (Test Q12), E296 (Paket optimiert), E297 (VSM-003 nur für Mitglieder), E298 (SFJ-Meetup Resilienz), E299 (keine Offenlegung); Befund E293.
Arbeitszweig `claude/datenharmonisierung`, gepusht. Kein Upload, kein Merge.
Beleg: [GEPRÜFT] von Claude gemessen oder getestet.

## 1. Ergebnis in Kürze

- **Neuabruf E281** (Lauf 45421207703, 21 Angebote): alle weiterhin nicht lesbar. EJC 10 (robots.txt HTTP 503, Wartung), Swiss Creator Academy 4 (TLS-Fehler), F+F 2 und Klubschule Pro 5 (jetzt HTTP 404). Master unverändert; die Fälle stehen in der Owner-Liste des Vollaufs (E291). Dawan bleibt nach RFC 9309 gesperrt. [GEPRÜFT]
- **Vollauf** (Lauf 45421480007): alle Kurslinks der 1'062 am 24.11. sichtbaren Angebote, 954 Adressen. [GEPRÜFT]

| Kriterium E258 B | Soll | 23.11. | 24.11. |
|---|---|---|---|
| B1 sichtbar mit vergangenem Enddatum | 0 | 0 | 0, erfüllt |
| B2 Linkquote | ≥ 95 % | 84,5 % | **95,6 %, erfüllt** |
| B3 Prüfliste abgearbeitet | 0 offen | 87 von 307 | 88 von 370, nicht erfüllt |

  - Status je Angebot: OK 546, WERT_FEHLT 273, GEAENDERT 125, WEITERLEITUNG 63, NICHT_LESBAR 30, LINK_DEFEKT 25.
  - Einordnung: Routine 834, Chrome 133, Zweifel 95 Angebote auf 78 Seiten (WERT_FEHLT 54, LINK_DEFEKT 25, WEITERLEITUNG 16). Aufwand für den Owner rund 191 Min. [SCHÄTZUNG], über dem Budget E186.
  - Nach E291 kommt zuerst das Release; danach verkleinert Claude die Liste (Nachfolgesuche, Chrome), und der Owner bekommt nur den Rest.
- **Lauf 038** (215 Zellen, E289, E290):
  - 194 Angebote mit Preis aus P31 von «NEEDS_REVIEW» auf «AUTO_ACCEPT». Bei 18 davon ist die Bedingung des Tarifs gesetzt (Journalist:innen 8, Lernende/Studierende 7, Mitglieder 3, freie Journalist:innen 1; OFFER-DPSUISSE-003 hat zwei).
  - 7 bleiben bei «NEEDS_REVIEW»: pro Semester 4, je Modul 1, Ratenzahlung 1. Bei CH-V18-F03 («CHF 5.50») erkennt die Gegenprobe den Rappenbetrag nicht; der Eintrag bleibt vorsichtshalber.
  - Liste der Fälle: `paket31/out/lauf_038_faelle_2026-11-24.csv`.
  - OFFER-HEVS-006 bis -008: Feld `beta_sichtbar` → JA.
  - Neue Herkunftscodes REGEL_E289, OWNER_E290. Skript `paket31/scripts/lauf_038_preisstatus.py`.
  - Budgetfähig in der Smart-Suche (AUTO_ACCEPT) am 24.11.: 814 → 1'008 von 1'062.
- **Release-Kandidat** `mediaskills_monatsbuild_20261124.zip` (Stichtag 24.11.2026):
  - 1'062 Angebote (CH 978, AT 80, LI 4), 17 Dateien, website/ 2,23 MB.
  - Bau mit `paket29/scripts/build_release_p29.py`, `htaccess.txt` bytegleich mit P28/P29, die .htaccess auf dem Server bleibt unverändert.
  - Bauprotokoll und Prüfsummen: `paket29/out/release_20261124/`. Vorschau: `paket29/out/abnahme_20261124/`.
  - Live seit 23.11. sind 998 Angebote.

## 1b. Optimiertes Paket (E296)

- `mediaskills_monatsbuild_20261124_v2.zip` ersetzt das erste Paket: 15 statt 17 Dateien in website/, 2,31 MB.
  - Die vier Unterseiten laden `styles-v24.css` statt `styles-v22.css`; `styles-v22.css` entfällt. `styles-v24.css` = `styles-v22.css` + Block MS-48, dessen Regeln nur Startseiten-Elemente treffen (Karten, Ergebnisleiste, Titelbereich).
  - `SHA256SUMS.txt` liegt neben `website/`, nicht mehr darin; es wird nicht hochgeladen.
  - Alle übrigen Dateien, Bauprotokoll und `htaccess.txt` bytegleich mit dem getesteten Bau.
- Skript `paket29/scripts/optimiere_release.py` (bricht ab, wenn eine Annahme nicht stimmt), Nachweis `paket29/out/release_20261124/OPTIMIERUNG.json`.
- Test `paket29/tests/test_optimierung.js`: 16/16 PASS, die vier Unterseiten in 375, 800, 1100 und 1440 px pixelgleich, 0 Ladefehler. [GEPRÜFT]
- Nicht geändert: Fusszeile «Datenstand: 30. September 2026» der Unterseiten (Befund Paket 19 U5); folgt mit dem Methodik-Wortlaut.
- Für künftige Releases: den Schritt in den Release-Bau übernehmen.

## 1c. Korrektur VSM-Webinar (E297), Paket v3

- OFFER-VSM-003 «KI-Tools & Prompts für den Redaktionsalltag» war als unbedingt kostenlos erfasst (P31 Lauf 028), obwohl der Zugangstext im Master «exklusiv für VSM-Mitglieder» nennt. Owner-Hinweis 24.11.
- Lauf 039 (2 Zellen, Herkunft OWNER_E297): Preistext «Kostenlos, exklusiv für VSM-Mitglieder», Tarif mit Bedingung MEMBERSHIP VSM. Karte und Smart-Suche zeigen «Kostenlos mit Bedingung: für Mitglieder». Bei «KI Nur kostenlos» zählt die Preisübersicht jetzt 1 statt 2 kostenlose Angebote.
- Suche nach demselben Widerspruch (Gratis-Tarif ohne Bedingung, Text nennt Mitglieder, Abo, exklusiv) bei allen sichtbaren Angeboten: nur dieser Fall; OFFER-SFJ-001 ist ausdrücklich öffentlich.
- Paket `mediaskills_monatsbuild_20261124_v3.zip` (ersetzt v2, Upload offen): 15 Dateien, 2,31 MB; gegenüber v2 geändert nur `index.html` (Kursliste), CH-Daten- und CH-Suchdatei.
- Tests [GEPRÜFT]: Eingang 22 Dateien ohne Fehler, P24 14/14, Nachträge 14/14, P30 34/34, `test_paket29.py` 9/1 (P12 +4'0xx Byte wie E253), Anzeige P01/P03/P05/P06/P08 PASS, P04 PASS (Sollliste 24.11. neu gemessen, 644), Stufe 1 35/0/4 an 24.11. und 03.12., Unterseiten pixelgleich 16/16.
- Befund für später: Bei null Treffern zählt die Preisübersicht nur nach Thema (ohne Ort/Budget), und der Hinweis nennt alle Bedingungen statt der entscheidenden; beides App-Änderung, Owner-Entscheid offen.

## 1d. Neues Angebot SFJ-Meetup Resilienz (E298), Paket v4

- OFFER-SFJ-002 «Stark bleiben: SFJ-Meetup zu Resilienz und Mental Health»: 26.11.2026, 17.00–18.00 Uhr, online via Zoom, kostenlos (freiwilliger Unkostenbeitrag), Deutsch; eigenes Angebot nach Owner-Entscheid E298, Angaben nach der Anbieterseite (abgerufen im Chat 24.11.).
- Lauf 040 (neues Angebot, Herkunft ANBIETERSEITE_E298): Scope GRENZFALL_E179 mit Begründung, Fokus Medienpraxis, Angebotsart Event, `beta_sichtbar` JA wie E290. Die Reihe OFFER-SFJ-001 bleibt unverändert.
- E299: keine Offenlegung der SFJ-Rolle des Owners auf der Methodik-Seite.
- Paket `mediaskills_monatsbuild_20261124_v4.zip` (ersetzt v3, Upload offen): 1'063 Angebote (CH 979, AT 80, LI 4), 15 Dateien, 2,31 MB; gegenüber v3 geändert `index.html`, CH-Daten- und CH-Suchdatei.
- Tests [GEPRÜFT]: Eingang 23 Dateien ohne Fehler, P24 14/14, Nachträge 14/14, P30 34/34, `test_paket29.py` 9/1 (P12 wie E253), Anzeige P01/P03/P05/P06/P08 PASS, P04 PASS (Sollliste 24.11. neu gemessen, 644), Stufe 1 35/0/4 an 24.11. und 03.12. (`NEU=5`), Unterseiten pixelgleich 16/16.

## 1e. Zweifelsfälle verkleinert (E291, E302–E306), Lauf 041

- **Abruf:** Die 95 Zweifelsfälle des Vollaufs neu auf dem Runner geholt (WebFetch im Chat war ohne Freigabe nicht möglich). Lauf 45496574482: Volltext von 62 Seiten, Linklisten, Elternseiten toter Links, Sitemaps. Lauf 45497656026: Kandidatenseiten für Nachfolger. Kurstexte verschlüsselt, nur lokal gelesen, neues Schlüsselpaar 24.11. abends. [GEPRÜFT]
- **Ergebnis je Angebot:** `paket30/out/zweifel_ergebnis_2026-11-24.csv` (Skript `paket30/scripts/zweifel_ergebnis.py`, Abrufdaten ohne Kurstext in `paket30/out/abruf/`).

| Ergebnis | Angebote |
|---|---|
| schon entschieden (E281 11, E282 7) | 18 |
| belegt, keine Änderung (Titel auf der Seite anders geschrieben, z. B. französisch oder mit Präfix) | 30 |
| Routine nach E262 (Kurslink nach Weiterleitung oder Nachfolgeseite, neuer Termin) | 11 |
| Website derzeit nicht lesbar, wie E281 (E306) | 9 |
| UNIGE hinter Sicherheitsprüfung, später in Chrome | 5 |
| Owner: Archiv (E303) 11, jährlich ohne Ausschreibung (E304) 5, umbenannt (E305) 5 | 21 |
| Owner offen: OFFER-SPC-011 | 1 |

- **Lauf 041** (74 Zellen bei 28 Angeboten, Skript `paket30/scripts/lauf_041_zweifel.py`):
  - Archiv nach E015 (E303, Herkunft OWNER_E303): BICT-001, FHNW-016, KLUB-MIDUCA-006, -010, AT-PROD-OFFER-201, SBVV-009, -010, -016, FOCAL-018, CFPOCST-002, ATGS-001.
  - Kurslinks nach Weiterleitung (ANBIETERSEITE_P30): Digicomp 003, 007, 049, 052, 063 (Rubrik «digital-media-design» heisst jetzt «digital-marketing-design»), AT-PROD-OFFER-035, -037; Nachfolgeseite SFGB-001.
  - Neue Termine: CFJM-019 (01.–19.03.2027), CFJM-020 (26.–27.04.2027), NOBLE-057 (ab 29.12.2026, vier Städte), SFGB-001 (05.04.–03.05.2027), AT-PROD-OFFER-037 (17.02.–14.04.2027), WEKA-006 (15.06.2027).
  - E304: SAWI-003 Kurslink nach Weiterleitung, Termin «keine Angabe» (Seite: «Dates coming soon»). CORSO-002, LI-REG-001, UNIBE-003, -004 waren schon ohne Datum.
  - E305: Titel nach Seite bei KLUBPRO-031, KLUBPRO-043 (dazu CHF 585), WEKA-006, HSG-005, AT-PROD-OFFER-035, -037; DIGICOMP-020 als Nachfolgelehrgang «User Experience gestalten und KI sinnvoll einsetzen» (5 Tage, CHF 4'650 zzgl. MWST, Termin «keine Angabe», weil Digicomp die Daten nur per Skript zeigt).
  - Nicht übernommen: Preis und Termine von KLUBPRO-031, weil sich die Seite widerspricht (schema.org CHF 380 und 2 Termine in Winterthur, Seitentext CHF 385); Master-Wert bleibt.
- **Stand:** Master 3'823 Zeilen, Protokoll 13'979. Sichtbar am 24.11. 1'063 → 1'052 (CH 969, AT 79, LI 4), am 03.12. 998 → 996: 7 archivierte fallen weg, 5 bleiben dank neuem Termin sichtbar. [GEPRÜFT]
- **Tests** [GEPRÜFT]: Eingang 24 Dateien ohne Fehler, P24 14/14, Nachträge 14/14, P30 34/34. Kein neues Release gebaut.

## 2. Tests [GEPRÜFT]

| Test | Ergebnis |
|---|---|
| `eingang_pruefen.py` | 21 Dateien ohne Fehler; Master 3'822 × 130, Protokoll 13'823 |
| `test_paket24.py`, `test_nachtraege.py` | 14/14, 14/14 |
| `test_paket29.py` (24.11.) | 9 PASS, 1 FAIL = P12: Erstbesuch +4'045 Byte statt höchstens +2'048, gleiche Art wie die mit E253 angenommenen +4'000 |
| `test_paket29_anzeige.js` (24.11.) | P01, P03, P05, P06, P08 PASS; P04 PASS mit nachgemessener Sollliste 24.11. (644 Änderungen nach E243, `messung_u2.js` auf dem P28-Bau 24.11., 0 Abweichungen, 0 JS-Fehler; Messung in `paket29/out/u2/*_2026-11-24*`). Die verbindliche `sollliste_u2.csv` ist nicht geändert; für den Lauf wurden die Zeilen vom 24.11. nur vorübergehend angehängt |
| Stufe 1 (`paket28/tests/test_paket8_p28.js` auf dem P28-Bau 24.11., `MASTER=…aktuell.csv`, `NEU=4`) | 35 PASS / 0 FAIL / 4 später an 24.11. und 03.12. Vor Lauf 038 waren es 33 / 2 / 4: D2b (HEVS `beta_sichtbar`) und F1/T07 (bedingter Tarif in der Smart-Suche wegen NEEDS_REVIEW nicht bezeichnet) |
| `test_paket30.py` | 34/34 nach Testanpassung E295 (vorher 33/34: Q12 FAIL nur wegen des Testaufbaus). Der Test legt seinen Entwurf in der Kopie des Eingangs unter dem Namen der echten Datei 028 ab; Lauf 038 baut auf Werten aus 028 auf. Mit freier Laufnummer (999) PASS. Anpassung des Tests offen (Owner) |
| Apache (P10) | nicht gelaufen (kein Apache in dieser Umgebung); `htaccess.txt` ist bytegleich mit P28/P29 (A5 PASS) |

## 3. Annahmen ohne Owner-Antwort (E293)

- 401/403/429/451 bleiben NICHT_LESBAR, wie in P30 umgesetzt (Bericht P30 §3 Punkt 1, §7.4).
- Die Methodik-Seite bleibt in diesem Release unverändert. Wortlaut zu Prüfabruf (Bericht P30 §7.5) und KI-Offenlegung (E188) folgt separat.

## 4. Offen für den Owner

1. erledigt: Paket v4 freigegeben (E300), live seit 24.11.2026 (E301; V05 Owner).
2. erledigt: Testanpassung Q12 (E295), `test_paket30.py` 34/34.
3. erledigt: Zweifelsfälle 95 (E291) verkleinert und entschieden (E302–E306, Lauf 041), §1e.
4. Offen: OFFER-SPC-011 (Katalog «Master Ateliers Pratique», CHF 250; Seite «Ateliers Pratique» CHF 90, «Ateliers Signature» CHF 250); UNIGE-V22-03, -004, -005, -009, -010 in Chrome lesen (Freigabe je Website).
5. Nächster Schritt: Routine-Eingang des Monats (geprueft_am, pruefen_ab nach E292) für die Routinefälle des Vollaufs und der 30 belegten Zweifelsfälle; danach Release mit Freigabe.

## 5. Nicht Teil dieses Monatsbuilds

Testfragenliste D (E258), Kernliste (E222), Lighthouse/axe (E258 E), Stichprobe 30 (E259, erst mit DE, FR, IT), Methodik-Wortlaut (E188).
