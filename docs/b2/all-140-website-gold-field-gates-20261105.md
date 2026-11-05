# SFJ / Media Skills B2 – Ein gemeinsamer Prüfblock für alle 140 fälligen Angebote

**Stand:** 5. November 2026 · **EVT220-Fortschreibung** · **Arbeitsstatus:** Ausgangsaudit vollständig, vier quellengeprüfte Sidecar-Reparaturen · **Publikationsstatus:** HOLD, nicht Website-Gold.

## Ziel und Reichweite

Der Nutzer verlangte ausdrücklich, **alle 140 Fälle gleichzeitig**, nicht weitere serielle Kleinstwellen. Hierzu wurden die zuvor eingefrorenen **140 eindeutigen Stable Offer IDs** in **einer gemeinsamen, sortierbaren 57-Felder-Matrix** gegen die bestehenden Anbieter-Differentiale, das tatsächliche `data.js` und alle 1'352 Smart-Search-Sidecars abgeglichen. Die 39 Near-Term- und 101 R-Lane-Angebote sind **ein Scope**, keine neue Anbieterrecherche und kein Master-Merge. Die historischen zehn disjunkten Teilzuständigkeiten bleiben erhalten.

**Drei Begriffe sind strikt zu trennen:**

- **140/140 AUDITED:** jede vorhandene ID wurde automatisch mit allen verfügbaren Feldern, Datum, Preis-Sidecar, Quellenbeleg, Venue, Sprache, Niveau, Zugang und Gates verknüpft. **Keine fehlende oder doppelte ID.**
- **139/140 BOUNDED PRIMARY FIELD SIGNAL:** ein Primäranbieter-Indiz liegt für mindestens EIN begrenztes Feld vor; das kann bloss der Programmtitel im offiziellen Anbieterindex sein. **Nicht** gleichbedeutend mit aktualisiertem Vollbeleg, allen Einzelterminen oder vollständiger Teilnahmeberechtigung.
- **0/140 NEW E4/E5/G3/WEBSITE-GOLD APPROVALS:** dieser Lauf erteilt **keine** Vollfreigabe. Die vorhandenen Daten, ihre bisherigen Genehmigungen und frühere terminale Lanes bleiben unverändert; der neue B2-Ledger ist ein separates QA-Hilfsartefakt.

## Die geprüften 140 Datensätze

| Kontrollbereich | Ergebnis | Interpretation |
|---|---:|---|
| Eindeutige eingefrorene Offer IDs | 140 / 140 | vollständige Kohorten-Lineage |
| Anbietername exakt gleich im kanonischen Datensatz | 140 / 140 | keine Namensdrift |
| Land exakt gleich im kanonischen Datensatz | 140 / 140 | keine Länderdrift |
| Kanonische Original-Source-URL exakt gleich | 140 / 140 | Alias-URLs separat erfasst, nicht still umgeschrieben |
| Due-Start deckt sich mit mindestens einem kanonischen Start oder Session-Start | 109 | **interne** Datumskonsistenz, kein Echtzeit-Platzbeweis |
| Due ohne konkret datierten Start | 31 | oft On-demand, Programme, alte Aufnahmefenster oder offene Starts |
| Datum in Queue ohne Entsprechung in Daten-Start oder Sessions | 0 | kein struktureller Mismatch in dieser eingefrorenen Kohorte |
| Strukturierter numerischer Preis für Filter freigegeben | 106 | technische Filterfähigkeit, **kein** attestierter gültiger Endpreis |
| Preis nicht verlässlich numerisch im strukturierten Sidecar | 34 | Budgetempfehlungen aus diesen Werten bleiben gesperrt |
| Kursort nicht publiziert | 32 | Kursort als individuelles E4-Feld offen |
| Ausschliesslich online im Katalog gekennzeichnet | 37 | nicht mit hybrider / mehreren Standorten gleichsetzen |
| Mehrere Orts- oder Formatoptionen im Katalog | 39 | echte Edition/Variante nötig, kein willkürlich gewählter Standort |
| Ein einzelner angegebener Ort | 32 | Angabe im Katalog ≠ erneuter unabhängiger Veranstaltungsortbeweis |
| Nicht source-verifiziertes Delivery-Modell | 84 | Semantik/Durchführung muss getrennt vom Anbieter-Sitz belegt werden |
| Präzise Owner-Scope-Signale | 10 | redaktionell/journalistisch vs. PR/Marketing/IT prüfen |
| Offene Quellenversion-/Alias-/Dauer-Guards | 18 | konfliktbehaftete Fälle, **ohne** zwei falsch-positive Hold-Markierungen |
| `reviewAfter` am 05.11.2026 fällig | 140 | nicht automatisch auf ein neues Datum verschieben |

Alle Zeilen enthalten die 9 unveränderten Originalfelder (einschliesslich Provider, ID, Source-URL, Evidence State und review_after) plus **48 nachgeprüfte und normalisierte Felder/Statusindikatoren**, insgesamt 57. Unter anderem: Name, Beschreibung, Fokus, Typ, Sprache, Kursniveau, Access-Text, Preis-Text, Preis-Sidecar-Optionen, Steuerklasse, Anzahl Konditionaltarife, Format, Dauer, Start/Ende, Session-Anzahl, Ort, Durchführungs-Evidenz, Quelle/Alter, Einzelbefund, Problemklassifikation, Aktion und getrennte Freigabegates. Die unterschiedlichen Feldlücken überlappen; die Summen dürfen nicht addiert werden.

### Quellenstand: 139 von 140 mit begrenztem Primärsignal

Die [39er-Ledger](near-term-39-source-differential-20261105.tsv) und [101er-Ledger](remainder-101-source-differential-20261105.tsv) enthalten **38/39** beziehungsweise **101/101** source-partial. Der einzige weiterhin **quellenunbelegte** Fall ist **`OFFER-HELIAS-014`**, der syndicom-Kurs «Wie mache ich mich selbständig?» am 13.11.2026 in Olten. Die genaue `my.syndicom`-Buchungs-URL kann derzeit nicht zuverlässig ausgelesen werden. Eine allgemeine Gewerkschaftsanmeldeseite ist **kein** Nachweis für dieses spezifische Kursdatum, Preis und Ort. Das vorhandene Angebot nicht allein deswegen löschen, archivieren, als ausgebucht oder abgesagt klassifizieren.

Die übrigen zuvor source-pending Fälle wurden lediglich in genau dem Umfang verbessert, den der Anbieter belegt:

- **`OFFER-CFJM-018`**: CFJM-Anbieterindex verlinkt den genau gleichen Kurs und nennt **6.11.2026**, aber Original-Detailseite nicht zuverlässig abrufbar. [CFJM-Index](https://www.cfjm.ch/model/formation-continue).
- **`PCC-P41`**: genau benannte PDF-in-Creative-Cloud-Schulung im PC-COLLEGE-Index, **kein** eindeutiger Code, Preis oder 6.11.2026-Sessionbeweis. [PC-COLLEGE-Index](https://www.pc-college.ch/seminar/online-trainings/index.php).
- **`PCC-P29` / `PCC-P31`**: Produkttitel im offiziellen PC-COLLEGE-Katalog. Das Mac-Seminar **PS3** beweist **nicht** den PC-Kurs **PSF**. [Herstellerindex](https://www.pc-college.ch/seminare-schulungen-hersteller.php?start=A).
- **`MW-P06`**: direktes Microwin-INDE-Detail, 15.–16.12.2026, CHF1'490, Wallisellen oder LiveStream. Das Provider-Garantiedatum ist kein garantierter einzelner Platz. [Microwin](https://www.microwin.com/pages/coursedetails/inde.aspx).
- **`V78-04`**: ITTA After Effects Avancé ADBAE-02 **3.–4.12.2026**; virtuell CHF1'300 oder Genève Route des Jeunes 35 CHF1'400, aber Anbietertext widerspricht sich weiter mit **2 jours** im Header gegen **sur trois jours** im Fliesstext; `HOLD_DURATION_SOURCE_CONFLICT`. [ITTA](https://www.itta.net/formations/multimedia/video-et-son/adobe-after-effects-avance/).
- **`V82-DAWAN-037`**: Originalprogramm **PAO946-F**, **3 Tage/21h**, CHF1'575 Präsenz oder CHF1'260 Distanz exkl. Steuer; Anbieter-Distanzindex publiziert **30.11.–2.12.2026**. Kurs und Kombinationskurs sind **verschiedene** Stable Offers. [Original-PDF](https://www.dawan.ch/formations/pao/premiers-pas-en-creation-graphique/graphiste-adobe-initiation.pdf) · [Distanzindex](https://www.dawan.ch/formations/pao/formations-premiers-pas-en-creation-graphique-Distance).

**Zwei alte scheinbare Quellkonflikte** nicht künstlich wiedereröffnen: `OFFER-MAZ-146` hat eine neuere CHF1'300-Quelle und einen veralteten CHF1'060-Snapshot, aber der vorhandene Preis ist bereits CHF1'300; dies ist kein *offener* Änderungsbedarf. `OFFER-MAZ-163` hat eine unbestätigte Dauer, aber keinen belegten *internen Quellwiderspruch*. Deshalb von 20 anfänglichen Pauschalflags auf **18 tatsächliche Source-Guards** korrigiert.

Ausserdem nennt der neuere CFJM-Anbieterindex künftige Daten für `OFFER-CFJM-005` (1.–5.3.2027 Smartphone-Video) und `OFFER-CFJM-013` (15.–16.4.2027 Datajournalismus). Ältere Kursdetailseiten zeigen nur 2026. Die **künftigen Anbieterindex-Daten** sind ein Positivsignal, aber die alte Detail-ID und die konkrete neue Durchführung müssen für Gold separat abgeglichen werden.

## Einheitlicher 140er-Remediation-Backlog

[Alle 140 Fälle wurden zusätzlich **in einer priorisierten Einzel-ID-Queue** materialisiert](all-140-priority-evidence-backlog-20261105.tsv):

| Priorität | Anzahl | Behandlung |
|---|---:|---|
| **P0 Quellenidentität, Widersprüche oder journalistischer Owner-Scope** | 28 | genaue Kursversionen, Dauerwidersprüche, Alias-Familien und journalistischer Bezug |
| **P1 Preis, CH-Zugang, fehlender Ort** | 85 | echte Teilnahmegebühr für Schweiz, Konditionaltarife, Steuer/Ort/Nachweis |
| **P2 Durchführungsmodell und Session-Mapping** | 18 | Remote vs. Präsenz, konkreter Kursort, Occurrence-Abgrenzung |
| **P3 Currentness und verbleibende Vollabnahme** | 9 | tatsächliche Angebotsaktualität, danach Schluss-Gates |
| **Gesamt** | **140** | disjunkt priorisiert; **keine** automatische Publikation |

Eine Zeile kann mehrere Qualitätsprobleme enthalten; die Priorität zeigt den **ersten sinnvollen Klärungsschritt**, keine Vollständigkeit oder Gold-Freigabe. Für jeden Datensatz sind Originalquelle, eventuell neue Primärquelle, Feldlücken, Aktion und Owner-Gate verlinkt.

## Unveränderte Sicherheitsregeln

- **Provider ≠ Kursort; Stable Offer ≠ Occurrence ≠ Programm ≠ Event ≠ Service.** Vergangene Daten behalten, auf der Website vergangene Editionen nicht als zukünftige Kurse zeigen.
- **Hersteller-Academies out** nach globaler Scope-Regel; ITTA-Quellen nennen `formation officielle Adobe` als Kursmaterial/Schulung, daher einschlägige Kurse vor E4 zusätzlich auf tatsächliche Hersteller-Academy-Zugehörigkeit prüfen und nicht still löschen oder automatisch releasen.
- **Schweizer Zielgruppe / wirklich nutzbarer Zugang**: Tarife gelten nicht automatisch für jede Person; beispielsweise Journalist:innen-/Mitgliedstarife und Genfer CAF-Zuschüsse sind konditional.
- Preis-/Dauer-/Ortsnachweise sind **per Kursvariante und Session** zu prüfen. Ein Online-Modus kann keinen konkreten Campus erben; deutsch ausgewiesene EUR+19%-MWST-Angebote sind kein belegter Schweizer Bruttopreis.
- Ein **Booking-Button ≠ freier Platz**; ältere HTML-Crawls können eine aktuell nicht mehr buchbare Ausgabe beschreiben. Bei laufenden oder vergangenen Lehrgängen keine falsche Neuaufnahme behaupten.
- **0** automatische Publikations-/Releasefreigaben; keine stillen `reviewAfter`-Verschiebungen; keine Umbenennung/Neuerstellung von IDs; keine geöffnete terminale Lane.
- **EVT219-Ausgangsaudit:** Damals keine Änderungen an `data.js` oder `smart-search-data.js`. **EVT220:** Genau vier Existing-Sidecars in `smart-search-data.js` wurden quellenbelegt geändert; `data.js` unverändert. Die zwei MAZ-Preis-Sidecar-Korrekturen gehörten bereits zum früheren EVT217. Keine Änderungen an `main`, Drive Master, Hosting oder LIVE.

## QA / Readback und nächste tatsächliche Arbeit

Die maschinenlesbaren 140-Zeilen- und 140-Prioritätsartefakte sind auf dem **Draft-PR-Branch** gespeichert. `tests/b2-all140-website-gold-field-gates-20261105.test.cjs` kontrolliert alle 57-Spalten-Lineages gegen Daten und Source-Ledgers, die 139/1-Grenze, Datumszuordnung, Preis-, Venue-, Delivery- und Source-Guards. Alte N39/R101-Tests wurden auf 38/1 bzw. 101/0 aktualisiert und bleiben für Regressionen erhalten. Keine Testmeldung behauptet gehostete E5/G3-Abnahme.

**Nächster sachlicher Block:** Die 140er-Kohorte ist jetzt **in einem Zug auditiert und priorisiert**. Um 140/140 auf Website-Gold zu bringen, müssen die belegbaren, pro Feld offenen Source-/Preis-/Access-/Session-/Ort-/Scope-Fragen abgearbeitet werden. Eine weitere *blosse* globale Prüfschleife bringt keine zusätzliche Vollständigkeit; für die Felder ohne Primärbeweis ist eine konkrete Anbieterquelle oder Owner-Entscheidung nötig. Nur evidence-gestützte Einzel-IDs über streng kleine atomare alte-Wert-gesicherte Datenwrites und getrennte Freigabe.

## EVT220 – B2-Datenkorrekturen nach dem 140er-Ausgangsaudit

**Vier bestehende Stable Offer IDs im PR10-Sidecar geändert.** Keine ID-, Termin-, Katalog-, reviewAfter-, Main-, Release- oder Hosting-Änderung. Quellen belegen lediglich die Preis-/Formatfelder.

| Offer-ID | Jetzt quellengeprüft | Bleibender Hold |
|---|---|---|
| `MW-P06` | Offizieller Microwin INDE: CHF 1'490 zzgl. MWST; synchrones Präsenztraining Wallisellen **oder** LiveStream; 15.–16.12.2026 und weitere Termine. Delivery-Modell von UNKNOWN zu VERIFIED. [Quelle](https://www.microwin.com/pages/coursedetails/inde.aspx) | Endpreis/Steuer, individuelle Platzverfügbarkeit. Nicht mit INDF verwechseln. |
| `V78-01` | ITTA ADBPP-01: CHF 1'300 virtuell, CHF 1'400 Präsenz; 7.–8.12.2026 Lausanne Mon-Repos oder virtuell. Zwei formatgebundene Preisoptionen, Delivery verifiziert. [Quelle](https://www.itta.net/formations/multimedia/video-et-son/adobe-premiere-pro-fondamentaux/) | Anbieter nennt im Header 2 jours, im Fliesstext sur trois jours. Dauer-Hold, Steuern, Plätze. |
| `V78-02` | ITTA ADBPP-02: CHF 1'300 virtuell, CHF 1'400 Präsenz; 12.–13.11.2026 Lausanne Mon-Repos oder virtuell, spätere Dezember-Ausgabe in Genf. Zwei Preis- und Delivery-Optionen verifiziert. [Quelle](https://www.itta.net/formations/multimedia/video-et-son/adobe-premiere-pro-avance/) | Gleicher Quellwiderspruch 2/3 Tage, Steuern, Plätze. |
| `V78-03` | ITTA ADBAE-01: CHF 1'300 virtuell, CHF 1'400 Präsenz; 23.–24.11.2026 Lausanne Mon-Repos oder virtuell. Zwei Preis- und Delivery-Optionen verifiziert. [Quelle](https://www.itta.net/formations/multimedia/video-et-son/adobe-after-effects-fondamentaux/) | Gleicher Quellwiderspruch 2/3 Tage, Steuern, Plätze. |

**Post-Correction-Kohorte 140:** 98 numerisch nutzbare Smart-Preise (vorher 95), 42 Preis-Gaps (vorher 45), 111 nicht source-verifizierte Delivery-Sidecars (vorher 115). Unverändert: 139/1 Source-Teilbelege, 18 Quellkonflikt-Guards, 10 Owner-Scope-Signale, 28/85/18/9 Prioritäten, 0 neue E4/E5/G3/Website-Gold-Freigaben. Der Dauerkonflikt der drei ITTA-Angebote bleibt ausdrücklich als SOURCE_VERSION_OR_IDENTITY_GUARD markiert.

Der Regressionstest tests/b2-all140-website-gold-field-gates-20261105.test.cjs prüft die nachgeführten vier bestehenden Sidecars und die 140er-Matrix; CI/Actions ist davon getrennt zu prüfen.

## EVT221 – vier weitere DJA-Onlinelehrgänge: Delivery-Only-Remediation

**Geändert in vier bestehenden Smart-Sidecars:** `OFFER-DJA-003` Podcasting, `OFFER-DJA-005` Investigativer Journalismus, `OFFER-DJA-009` Datenjournalismus, `OFFER-DJA-012` KI für Journalismus. Alle vier Anbieter-Einzelseiten belegen 100% Online-Unterricht, digitale Lernmaterialien, Online-Prüfungen und weitgehend selbständiges Lerntempo ohne Präsenzphasen. Die Software-Einordnung ist `SINGLE_CHANNEL REMOTE`, `ASYNCHRONOUS`, `FIXED` (Intake-Fenster ist nicht jederzeit offen), `E_LEARNING|SELF_STUDY`, `delivery.evidenceTier=VERIFIED`, aber ausdrücklich **nur** für die Lehrgangsmodalität, nicht für Buchung, aktuelle Campus-Erreichbarkeit oder Website-Gold.

- [Podcasting](https://deutschejournalistenakademie.de/lehrgang/podcasting/) – `OFFER-DJA-003`
- [Investigativer Journalismus](https://deutschejournalistenakademie.de/lehrgang/investigativer-journalismus/) – `OFFER-DJA-005`
- [Datenjournalismus](https://deutschejournalistenakademie.de/lehrgang/datenjournalismus/) – `OFFER-DJA-009`
- [KI für Journalismus](https://deutschejournalistenakademie.de/lehrgang/ki-fuer-journalismus/) – `OFFER-DJA-012`

**Materielle Vorsichtsmeldung:** Die offiziellen Kursseiten zeigen je nach Beobachtungsstand unterschiedliche und abgelaufene Bewerbungsfenster/Starttermine (einige August/September 2026, andere Oktober 2026). Kein altes `data.js`-Startdatum auf neue Durchführung fortschreiben und kein neues Aufnahmefenster behaupten. Die DJA meldete ausserdem am [22. Oktober 2026 die vorübergehende Nichtverfügbarkeit ihres Online-Campus](https://deutschejournalistenakademie.de/voruebergehende-nichtverfuegbarkeit-des-online-campus/). Die Wiederherstellung ist nicht unabhängig belegt. `BOOKING_OR_INTAKE_NOT_PROVEN`, `CURRENTNESS_REVIEW_DUE` und `REMOTE_CHANNEL_SEAT_NOT_PROVEN` bleiben offen. Nicht als `ON_DEMAND` mit jederzeit möglichem Einstieg darstellen; Self-Paced-Lernmaterial ist nicht Self-Enrollment.

**Neue Gesamtrechnung nach EVT220+EVT221:** Weiterhin 1'352 Bestands-Sidecars und 140 eindeutige Due-IDs; 98/140 numerische Preisfelder, 42 Preis-Gaps; **107/140** Delivery-Sidecars ohne `VERIFIED` (vor EVT220 115, nach EVT220 111). Globaler Sidecar-Tier-Count 158 VERIFIED / 395 PROVISIONAL / 799 UNKNOWN. Unverändert 18 bestehende Source-Guards, 10 Owner-Scope-Signale, 139/1 Source-Partial und 0 neue Website-Gold-/E4/E5/G3-/Owner- oder Release-Abnahmen. Vier neuen Regression-Guards in 140er-Test und global WDA-04-Counter-Test; aktuelle CI separat nach letztem Commit zu prüfen.

## EVT223 – vier CFJM-Angebote mit voll strukturierten konditionalen Kurspreisen

Die folgenden bestehenden vier CFJM-Sidecars wurden anhand der direkten offiziellen CFJM-Kursseiten **nur im Preisfeld** repariert. Alle fünf Tarife gelten je **für den Gesamtkurs**, nicht für einen einzelnen Tag. Die allgemeinen Höchsttarife sind normale Preiskandidaten; Medien-, Partner-, Impressum- und Beitragszahler-Tarife sind ausdrücklich **konditional** und dürfen nicht automatisch als Preis für jede Person verwendet werden.

| ID | Regulär CHF | Medien ohne Partner CHF | Partner nicht beitragszahlend CHF | Freie Journalist:innen mit impressum CHF | Beitragszahler FC | Quelle |
|---|---:|---:|---:|---:|---|---|
| `OFFER-CFJM-009` (1 Tag) | 590 | 400 | 300 | 130, nur bei **mindestens 50 % freier journalistischer Tätigkeit** und Mitgliedschaft | CHF 0; ggf. CHF 100 bei Annullierung | [CFJM](https://www.cfjm.ch/model/formation-continue/fc-journaliste-libre-un-guide-de-survie-27) |
| `OFFER-CFJM-011` (2 Tage) | 1'180 | 800 | 600 | 260 | CHF 0; ggf. CHF 100 bei Annullierung | [CFJM](https://www.cfjm.ch/model/formation-continue/fc-creer-une-video-percutante-pour-les-reseaux-sociaux-16) |
| `OFFER-CFJM-012` (5 Tage) | 2'950 | 2'000 | 1'500 | 650 | CHF 0; ggf. CHF 100 bei Annullierung | [CFJM](https://www.cfjm.ch/model/formation-continue/fc-l-ia-au-service-du-journalisme-8) |
| `OFFER-CFJM-020` (2 Tage) | 1'180 | 800 | 600 | 260 | CHF 0; ggf. CHF 100 bei Annullierung | [CFJM](https://www.cfjm.ch/model/formation-continue/fc-de-journaliste-a-auteur-comment-creer-son-premier-ouvrage-12) |

**Quellen-/Qualitätsbegrenzung:** CFJM kann Tarife laufend ändern. Steuerklasse blieb `UNSPECIFIED`. Keine Ableitung eines neuen Starttermins oder eines Kursraums vom CFJM-Sitz. Der 2026er Dauerstale-Text in `CFJM-011`, der November-2026-Index-Widerspruch bei `CFJM-020`, die unbestätigte Buchbarkeit aller vier sowie eventuell notwendige Softwarelizenzen bei `CFJM-012` bleiben als separate Fragen offen. `data.js` (Angebotsdetails und vergangene Termine) unverändert.

Die 140er-Feldmatrix und der Backlog wurden strikt nur um vier Preisfeld-Korrekturen aktualisiert; Preisfilter-fähige Datensätze **102/140** (vorher 98); offene strukturierte Preisfälle **38/140** (vorher 42). Die 107 nicht auf Angebotslevel verifizierten Delivery-Modelle bleiben unverändert. Die Regression `tests/b2-all140-website-gold-field-gates-20261105.test.cjs` prüft alle vier fünfstufigen Preisprofile, die 130-CHF-Impressum-/50-%-Zugangsbedingung, die Quelle und offene Release-Gates. Veröffentlichung weiterhin nicht freigegeben.

## EVT224 – vier weitere geprüfte Preisfelder und zwei geprüfte Kursformate

Am 05.11.2026 wurden vier bestehende Angebote in einem Guarded-Write auf dem PR10-Entwurfszweig preisfeldbezogen korrigiert, ohne die Stable Offer IDs, die alten und neuen Starttermine, Anbieter, Quellen-URLs, `reviewAfter`, `data.js`, die 140er-Kohorte oder den Release-Status zu ändern:

- **`OFFER-CFJM-017`**: dreitägiger Premiere-Pro-Kurs beim CFJM. Anbieter belegt Gesamtkurstarife CHF 1'770 regulär, 1'200 Medien nicht Partner, 900 Medienpartner ohne FC-Beitrag, 390 freie Journalist:innen mit impressum und 0 FC-Beitragszahlende (allenfalls Storno CHF 100). Alle vier ermässigten Stufen sind persönlich bedingt. Anbieter: https://www.cfjm.ch/model/formation-continue/fc-monter-une-video-avec-adobe-premiere-pro-initiation-et-pratique-26 . Exakte ehemalige 4.–6.11.-Edition, Kursort und Buchbarkeit bleiben ungeprüft.
- **`V78-05`**: ITTA APPFC-01 Final Cut Pro Fondamentaux. CHF 2'350 synchron virtuell, CHF 2'500 Präsenz in Genf/Lausanne, je drei Tage, Varianten A und B getrennt. Anbieter: https://www.itta.net/formations/multimedia/video-et-son/final-cut-pro-fondamentaux/ . Die konkrete eingefrorene November-Durchführung und Sitzplätze werden durch den älteren Quellenauszug nicht frisch belegt; Hersteller-Academy-Scope gesondert.
- **`CAD-003`**: unabhängiger Anbieter Cadschool, Photoshop Intermédiaire: CHF 500 betreuter Präsenz-Mischkurs mit Videolektionen, CHF 250 autonomes Online-Lernen mit mindestens 15 Stunden Lernaufwand und einstündigem Abschlusscoaching, optionale Zertifizierung CHF 150 extra. Online-Arbeit erfordert separate persönliche Photoshop-Nutzung; Softwarekosten sind nicht im Kursbudget angesetzt. Anbieter: https://www.cadschool.ch/formation/photoshop/photoshop-intermediaire/ . Aktueller Anbieter nennt Präsenzdaten **auf Anfrage**, nicht die im Katalog früher eingefrorene 25.11.-Ausgabe; Datum bleibt Hold. Keine neue Behauptung eines Kursraums.
- **`OFFER-MAZ-151`**: CHF 990 Normalpreis / CHF 650 Journalist:innenpreis, die zweite Stufe nur mit Berufsberechtigung. Anbieter: https://www.maz.ch/kurs/sichtbarkeit-und-reichweite-im-ki-zeitalter-j . **OWNER_SCOPE_REVIEW bleibt explizit offen**, weil Kurszielgruppe primär Kommunikations- und Content-Marketing-Funktionen nennt, redaktionelle Nutzung zwar möglich ist, aber keine pauschale journalistische Einstufung ohne Entscheid erteilt wird.

Nach dem Batch sind **106/140** Sidecars numerisch preisfilterfähig, **34/140** Preis-Gaps und **105/140** nicht vollständig source-verifizierte Delivery-Modelle offen. 18 Source-Version-/Alias-Holds und 10 Owner-Scope-Gates unverändert. Die Regression kontrolliert die vier Preisprofile, ITTA/CAD-Modellvarianten, die optionale CHF150-Zertifizierung und den offenen MAZ-Scope-Gate. Gültige Tarifstruktur oder modellierter Kursmodus ist keine individualisierte Buchungs- oder Website-Gold-Freigabe. Keine E4/E5/G3/Owner-/Hosted-Release-Abnahme.

## EVT225 – sieben DJA-Lehrgänge: tatsächliche Online-Lernform verifiziert

Das Anbieterprogramm der Deutschen Journalisten-Akademie nennt bei **sieben weiteren exakt benannten und bereits eingefrorenen Angeboten** 100 % Onlineunterricht, videobasiertes und schriftliches Selbststudium, Online-Prüfungen und individuelles Lerntempo. Jeweils nur das **Unterrichtsmodell**, nicht die aktuell offene Einschreibung oder der Zugang zum Online-Campus, wurde als `VERIFIED` klassifiziert. Die Lehrgänge behalten die `FIXED`-Aufnahmecharakteristik: Selbstlernen heisst nicht jederzeit buchen.

| Offer | Offizieller Einzelnachweis |
|---|---|
| `OFFER-DJA-002` Blogging | https://deutschejournalistenakademie.de/lehrgang/blogging/ |
| `OFFER-DJA-004` Unternehmerischer Journalismus | https://deutschejournalistenakademie.de/lehrgang/unternehmerischer-journalismus/ |
| `OFFER-DJA-006` Konstruktiver Journalismus | https://deutschejournalistenakademie.de/lehrgang/konstruktiver-journalismus/ |
| `OFFER-DJA-007` Mobiler Journalismus | https://deutschejournalistenakademie.de/lehrgang/mobiler-journalismus/ |
| `OFFER-DJA-008` Auslandsberichterstattung | https://deutschejournalistenakademie.de/lehrgang/auslandsberichterstattung/ |
| `OFFER-DJA-010` Digitaler Journalismus | https://deutschejournalistenakademie.de/lehrgang/digitaler-journalismus/ |
| `OFFER-DJA-022` Wissenschaftsjournalismus | https://deutschejournalistenakademie.de/lehrgang/wissenschaftsjournalismus/ |

Bei `DJA-007` steht offiziell **«Demnächst!»** statt einer nachgewiesen geöffneten Anmeldung. Einzelne andere DJA-Seiten zeigen alte 2026-Bewerbungsfenster. Das Anbieter-Online-Campus-Störungsereignis vom 22.10.2026 wurde noch nicht als definitiv behoben bestätigt. Folglich bleiben `BOOKING_OR_INTAKE_NOT_PROVEN`, `CURRENTNESS_REVIEW_DUE`, `REMOTE_CHANNEL_SEAT_NOT_PROVEN` und nicht gesicherte Schweizer Endpreise in allen sieben Fällen unverändert offen. 0 automatische Neuaufnahmen oder Gold-Freigaben.

Die beiden existierenden B2-Matrix-/Backlog-Dateien und zwei Regressionsdateien wurden nach genau sieben Source/Old-Value-gesicherten Sidecar-Writes synchronisiert. 140 Offer-IDs und 1'352 Sidecars bleiben konstant; numerische Preisfelder **106** und Preis-Gaps **34** unverändert; Delivery ohne Full Source Verification nun **98** (zuvor 105). Globaler Sidecar-Tier-Counter: VERIFIED 167 / PROVISIONAL 399 / UNKNOWN 786. Tests prüfen die exakten sieben IDs und alle offenen Admission-Gates. Neue externe Red-Team-/Hosted-E5-/G3-/Owner-Freigaben: 0.

## EVT226 – restliche zehn DJA-Fernlehrgänge: Unterrichtsmodell verifiziert

Die restlichen zehn Angebote aus der bereits eingefrorenen DJA-Teilgruppe haben je eine **offizielle anbietereigene Kursseite**, die einen 100-%-Online-Fernlehrgang mit digitalen Skripten/Videos, selbständigem Lerntempo und Online-Prüfungen belegt. Es handelt sich um ein verifiziertes **Unterrichtsmodell**, nicht um eine bestätigte freie Aufnahme oder garantierte Zugänglichkeit zum Online-Campus. Alle Lehrgänge erhalten `SINGLE_CHANNEL REMOTE`, `ASYNCHRONOUS`, `FIXED` (kein falsches jederzeitiges Self-Enrollment) und den Hold `SOURCE_VERIFIED_DELIVERY_ONLY_INTAKE_CAMPUS_HOLD`.

| Offer-ID | Offizielle Anbieter-Einzelseite |
|---|---|
| `OFFER-DJA-011` Fernsehjournalismus | https://deutschejournalistenakademie.de/lehrgang/fernsehjournalismus/ |
| `OFFER-DJA-013` Klimajournalismus | https://deutschejournalistenakademie.de/lehrgang/nachhaltigkeitsjournalismus/ |
| `OFFER-DJA-014` Kulturjournalismus | https://deutschejournalistenakademie.de/lehrgang/kulturjournalismus/ |
| `OFFER-DJA-015` Lokaljournalismus | https://deutschejournalistenakademie.de/lehrgang/lokaljournalismus/ |
| `OFFER-DJA-016` Musikjournalismus | https://deutschejournalistenakademie.de/lehrgang/musikjournalismus/ |
| `OFFER-DJA-017` Politikjournalismus | https://deutschejournalistenakademie.de/lehrgang/politikjournalismus/ |
| `OFFER-DJA-018` Radiojournalismus | https://deutschejournalistenakademie.de/lehrgang/radiojournalismus/ |
| `OFFER-DJA-019` Reisejournalismus | https://deutschejournalistenakademie.de/lehrgang/reisejournalismus/ |
| `OFFER-DJA-020` Sportjournalismus | https://deutschejournalistenakademie.de/lehrgang/sportjournalismus/ |
| `OFFER-DJA-021` Wirtschaftsjournalismus | https://deutschejournalistenakademie.de/lehrgang/wirtschaftsjournalismus/ |

**Identitäts-Guard:** Der historische URL-Slug `nachhaltigkeitsjournalismus` führt bei DJA ausdrücklich die Kursüberschrift «Klimajournalismus» (`OFFER-DJA-013`); die bestehende Stable-ID und Quellen-URL wurden nicht umgeschrieben. Keine neue doppelte Offer-ID. Die früheren DJA-2026-Fristen und die Anbieter-Störungsmeldung zur Online-Campus-Nichtverfügbarkeit vom 22.10.2026 erlauben keine aktuelle Platz-/Neubeginn-Zusage. Die 2026 Kursstarts bleiben historische, nicht neu gebuchte Editionen. Allgemeine aktuelle Betreiber-FAQ ersetzt keinen neuen individueller Angebotstermin.

**Neue 140er-Zahlen:** 1'352 Sidecars unverändert, exakt 140 frozen IDs; 106 numerisch preisfilterbar, 34 Preis-Gaps, **88 nicht auf Whole-Offer-Level source-verifizierte Delivery-Modelle** (vor EVT225 105, nach EVT225 98). Alle 21 DJA-Angebote der Due-Teilgruppe haben nun quellenverifizierte Unterrichtsmodelle; Aufnahme/Plattform/CH-Endpreis/individuelle Berechtigung bleiben gesondert offen. Globale Statusverteilung: VERIFIED 177, PROVISIONAL 399, UNKNOWN 776. Source-Version-Guards 18, Owner-Scope-Signale 10, 139/1 limited source signals, 0 neue Gold-/E4-/E5-/G3-/Owner-/Publish-Freigaben. Die 140er Matrix/Backlog-Regressions und der globale WDA-04-Tier-Test prüfen die zehn exakten IDs; beide Sidecar-Writes erfolgten in getrennten Fünferblöcken.

## EVT227 – vier Microwin-Mediendesignkurse, quellengenaue Unterrichtsform

Vier bestehende Microwin-Angebote erhielten aus der **jeweiligen offiziellen Kursseite** die belegte Wahl zwischen synchronem Präsenzunterricht in **Wallisellen** und **LiveStream**. Dieser Nachweis gilt für die Modalität, **nicht** für den aktuell buchbaren individuellen Platz oder den aktuellen Schulungsinhalt. Die Kursgebühren blieben als im Datenbestand vorhandene CHF-Werte unverändert, in den offiziellen Quellen jeweils zzgl. MwSt. Alle vier haben `SINGLE` nicht, sondern `MODE_CHOICE` mit getrennten A-Präsenz- und B-Remote-Varianten.

| ID | Quelle und Nachweis | Offene Qualitätsfrage |
|---|---|---|
| `MW-P08` Adobe Photoshop CC (PHOT), CHF 790 zzgl. MwSt. | https://www.microwin.com/pages/coursedetails/phot.aspx – Anbieter listet 11.11.2026/11.01.2027 und zu jedem Termin LiveStream | Originalquelle ca. 1 Jahr alt; tatsächliche 2026-Buchung und unveränderte Details nicht frisch bestätigt |
| `MW-P07` Adobe InDesign Advanced (INDF), CHF 1'690 zzgl. MwSt. | https://www.microwin.com/pages/coursedetails/indf.aspx – 12.–13.01.2027, weitere spätere Wallisellen- und LiveStream-Ausgaben | Kurscode **INDF**, nicht bereits erledigtes **INDE**; Kursdurchführungsgarantie ist keine freie-Platz-Garantie |
| `MW-P09` Webdesign (WEBDA), CHF 1'490 zzgl. MwSt. | https://www.microwin.com/pages/coursedetails/webda.aspx – 23.–24.11.2026, Wallisellen/LiveStream | **Substanzieller aktueller Inhalts-Hold**: Anbieter-Lehrplan nennt Flash, DHTML und veraltete Frame-basierte Web-Techniken; fachliche Aktualität neu beurteilen, nicht als moderne Web-Publishing-Ausbildung freigeben |
| `MW-P03` Adobe FrameMaker (FRMA), CHF 2'490 zzgl. MwSt. | https://www.microwin.com/pages/coursedetails/frma.aspx – 23.–25.11.2026, weitere 2027-Termine, Wallisellen/LiveStream | Kein Beleg für freien einzelnen Sitzplatz, steuerinklusiven Endbetrag oder Gold-Release |

Die vier Sidecars, Matrix-/Backlog-Zeilen und beiden Regressionsdateien wurden anhand unveränderter Stable IDs, Originalquellen und Vorwerten synchronisiert. **140er Delivery weiterhin offen: 84**, vorher 88. Numerisch strukturierte Preise weiter **106** und 34 Preis-Gaps. Globaltier VERIFIED181 / PROVISIONAL399 / UNKNOWN772. 18 source-version-Holds und 10 ursprüngliche Scope-Signale unverändert; der WEBDA-Lehrplan braucht zusätzliche fachliche Aktualitätsabnahme, ohne eigenmächtige Umklassifikation des Scope-Gates. Datum auf Kursseite ≠ freie Buchungskapazität; keine E4/E5/G3/Owner-/Release-Freigabe.

## EVT228 – vier Dawan-Kursfamilien mit gesicherten Online-Durchführungen

**Stand 05.11.2026.** Offizielle Dawan-Quellenseite: https://www.dawan.ch/sessions-confirmees . Die vier bestehenden Stable Offer IDs wurden nur beim **konkret belegten FOAD-Online-Termin** verbessert. Der gesamte Kurs bleibt PROVISIONAL, weil die ursprünglichen Katalog-Angebote zusätzlich Präsenz behaupten. **Keine** neu belegte buchbare Präsenzdurchführung, kein steuerinklusive CHF-Angebot und kein individueller Sitzplatz. Preisstatus in allen vier `NEEDS_REVIEW`, `priceEligible=false`, `priceOptions=[]`.

| ID | Nur belegter aktueller FOAD-Termin | Spezifische Sperre |
|---|---|---|
| `V82-DAWAN-027` DaVinci Resolve | 30.11.–04.12.2026, Distanz | Historischer Indexbeleg 23.–27.11.2026 nicht automatisch ersetzt; Datumsversion und einzelne Durchführungen gesondert abgleichen |
| `V82-DAWAN-028` DaVinci Resolve, Kommunikationsvideo kurz | 30.11.–02.12.2026, Distanz | Einzelkurs nicht mit dem fünftägigen Angebot oder Kombikurs vermischen |
| `V82-DAWAN-046` Illustrator Initiation | 14.–16.12.2026, Distanz | Nicht mit Initiation+Approfondissement 14.–18.12.2026 verwechseln |
| `V82-DAWAN-100` WordPress Initiation | 30.11.–02.12.2026, Distanz | Bisheriger kanonischer Ortswert Genève ist **kein** Nachweis für den Raum der belegten Online-Durchführung; kein stiller Ortsersatz |

Zustand: 1352 Sidecars, vier neue `PROVISIONAL` statt `UNKNOWN`; VERIFIED **181**, PROVISIONAL **403**, UNKNOWN **768**. 140er Kohorte **106** numerisch budgetfähig, **34** Preis-Gaps, **84** auf Offer-Niveau nicht `VERIFIED` (die vier bleiben darin), 18 Source-Guards, 10 Scope-Signale, 0 neue Website-Gold/Owner/Release. Eingefrorene Quellendifferentiale, `data.js`, kalendarische Originaldaten und alle `DELIVERY_NOT_VERIFIED`-Gaps unverändert. Die Tests prüfen vier konkrete ID/FOAD/PROVISIONAL/HOLD-Kombinationen und den globalen Tier-Snapshot.

## EVT229 – Drei echte Kursraumdurchführungen quellenbelegt

Nach EVT228 wurden genau die drei bereits vorhandenen Datensätze `IF-G06`, `V58-S1-04` und `V58-S1-07` gegen ihre offiziellen Kurs-/Anmeldeseiten abgeglichen. Unterrichtsmodell je **eine separate ausschliessliche Präsenzvariante**, `SINGLE_CHANNEL`, `IN_PERSON`, `SYNCHRONOUS`, `FIXED`; drei Sidecars **PROVISIONAL → VERIFIED** nur im Fachfeld Delivery. Ihre bereits korrekt strukturierten CHF-Preiswerte wurden nicht verändert.

| ID | Anbieterbeleg für Termin und tatsächlichen Unterrichtsort | Offene Schranke |
|---|---|---|
| `IF-G06` | [ifage Illustrator](https://www.ifage.ch/formation/tic/formations-cao-dao-pao/illustrator-niveau-1/), Kurs S-03275 an **fünf Abenden** 17., 19., 24. und 26. November sowie 1. Dezember 2026, 18–21 Uhr, **insgesamt 15 Stunden**, Ifage Montbrillant Genf, CHF 620 | kein Kapazitätsversprechen, keine Rechnung/Steuerprüfung, keine Gold-Freigabe |
| `V58-S1-04` | [Studio 1 DaVinci Resolve](https://www.studioeins.ch/kurse/davinci-resolve/), 8.–10. März 2027, 9–17 Uhr, Wallisellen, CHF 1'690 | ausgebuchter November 2026 (Mac/PC) nicht auf März übertragen; kein Einzelplatzbeleg |
| `V58-S1-07` | [Studio 1 Smartphone-Videokurs](https://www.studioeins.ch/kurse/video-mit-smartphone/), 8.–10. Februar 2027, 9–17 Uhr, Wallisellen, CHF 1'690 | eigenes Smartphone und Stativ nötig, keine freie-Platz-Garantie |

Stand: 1'352 Sidecars unverändert, 140 eingefrorene IDs; Delivery `VERIFIED` global nun **184**, `PROVISIONAL` **400**, `UNKNOWN` **768**, Summe 1'352. In der 140er Due-Kohorte jetzt **81** nicht `VERIFIED` (zuvor 84). Preise technisch nutzbar **106/140**, offene Preis-Gaps **34** unverändert, Source-Holds **18**, Scope-Signale **10**. Entfernt wurde pro ID ausschliesslich `DELIVERY_NOT_VERIFIED`; der ursprüngliche generelle Ortsklassifikator wurde nicht neu erfunden und aktuelle Sitzplätze und individuelle Buchung bleiben offene Gates. `data.js`, Frozen-Differentiale und Termin-Historie unberührt; keine E4/E5/G3/Owner-Freigaben.

## EVT230 – Helias KI-Bildkurs: echte Raumangabe, Preisstaffel, Buchung gesperrt

`OFFER-HELIAS-011`, Freitag 06.11.2026 09:45–16:45: [offizielles Originaldetail von dpsuisse](https://dpsuisse.ch/kurs/weiterf%C3%BChrend-k%C3%BCnstliche-intelligenz?hsLang=de) belegt den Unterricht im **Impact Room, 3. Stock, Impact Hub Bern, Spitalgasse 28, 3011 Bern**, als eintägige Präsenzdurchführung. Im Smart-Sidecar wurde daher nur `delivery.evidenceTier` von `PROVISIONAL` nach `VERIFIED` gesetzt, als **eine** synchrone feste Präsenzvariante; keine anderen Orte und keine freien Plätze behauptet.

Die publizierte Gesamt-Kursgebühr hat **drei Kategorien**: CHF 420 für Nichtmitglieder (REGULAR), CHF 140 für Kategorie 2 (CONDITIONAL) und CHF 0 für Kategorie 1 (CONDITIONAL, von syndicom/Syna übernommen). Die spezifischen syndicom-/VISCOM-Betriebsbedingungen von Kategorie 1 und Mitgliedschaft von Kategorie 2 sind in einem [syndicom-Helias-Kursdetail aus 2025](https://my.syndicom.ch/kurs.php/?k=12795&p=ce37c989e979f9ca65f8aa998a9c5d1a) erklärt; sie sind für die 2026er Edition **noch nicht direkt erneut bestätigt**. Das explizite `ACCESS_TARIFF_ELIGIBILITY_GUARD` bleibt deshalb erhalten. Der allgemein zugängliche reguläre Preis ist nie als Gratisangebot auszuweisen. Publizierter Anmeldeschluss lag bereits im Oktober 2026; keine Kapazitäts- oder Buchbarkeitszusage.

Der Quellenbeleg reicht nicht für die inhaltliche journalistische Scope-Freigabe: KI-generierte Bilder können journalistischer Praxis dienen, aber diese konkrete Ausschreibung ist allgemein und die Zielgruppenprüfung bleibt offen. Kein E4/E5/G3/Website-Gold, kein Publishing.

Nach der exakt ein-ID-begrenzten Korrektur: 1'352 Sidecars, global VERIFIED **185**, PROVISIONAL **399**, UNKNOWN **768**. In der 140er Prüfkohorte **107/140** numerisch strukturierte Preise (vorher 106), **33** Preis-Gaps, **80** Delivery nicht vollständig VERIFIED (vorher 81), 18 Source-Guards, 10 Owner-Scope-Flags; null neue Website-Gold-Gates. Die zugehörige Matrix, Prioritätsqueue und die beiden Regressionsfiles werden mit altem Blob-SHA und Quell-Differential-Gates synchronisiert.

## EVT231 – VSM Trendtagung Fach- und Spezialmedien: Präsenzdurchführung belegt

Einzig `OFFER-VSM-001`: Die [offizielle VSM-Ausschreibung](https://www.schweizermedien.ch/events/agenda/2026/2026-11-17-trendtagung-fach-und-spezialmedien-2026/) bestätigt **Dienstag, 17.11.2026, 08:30–13:30 Uhr**, tatsächlichen Veranstaltungsort **WESTHIVE HARDTURM, Zürich** und Präsenzdurchführung. Exakter Veranstaltungsraum und verfügbare Einzelplätze sind nicht nachgewiesen. Der bestehende Smart-Delivery-Status wechselte daher `PROVISIONAL → VERIFIED`, mit `SINGLE_CHANNEL / IN_PERSON / SYNCHRONOUS / FIXED`. Im eingefrorenen Ursprungsdatensatz und in den Quellendifferentialen wurde nichts geändert.

Die 3 bestehenden strukturierten Teilnahmeoptionen wurden **unverändert** gelassen: CHF 250 Nichtmitglieder regulär **exkl. MWST**, CHF 150 für bestimmte Mitglieder / MAZ-Absolvent:innen ebenfalls **exkl. MWST**, und eine **ausdrücklich nur für Journalist:innen im Anmeldeformular ausgewiesene**, bedingte kostenlose Teilnahme. Das Vorhandensein des Formulars ist keine Zusage verfügbarer Plätze. `TAX_SCOPE_UNSPECIFIED`, `BOOKING_OR_INTAKE_NOT_PROVEN`, `CURRENTNESS_REVIEW_DUE`, Scope-/Gold-/Publication-Holds bleiben. Die früheren Preisoptionen dürfen nicht pauschal als allgemein günstig oder kostenlos kategorisiert werden.

Nach diesem exakt ein-ID-begrenzten Schritt 1'352 Sidecars: global VERIFIED **186**, PROVISIONAL **398**, UNKNOWN **768**. In der 140er Due-Kohorte 107 numerisch strukturierte Preise, 33 Preis-Gaps, **79** nicht vollständig verifizierte Delivery-Modelle (zuvor 80), 18 Versions- und 10 Scope-Holds, null Gold-Freigaben. Synchrone Anpassung: Preis-/Delivery-Sidecar (nur Delivery), 140×57 Matrix, 140×19 Backlog, beide Regression-Tests; nachfolgende CI-Gates separat abfragen.

## EVT232 – Schreibszene und BeVisible: drei belegte Präsenzkursmodelle

Für drei bestehende Datensätze ist die **Unterrichtsform Präsenz, zeitgleich und termingebunden** durch Anbieter-Kursseiten belegt. Es werden weder die historische Termin-/Ortsbasis in `data.js` noch die eingefrorenen Quellendifferentiale verändert.

| ID | Anbieterbeleg | Eng begrenzte Korrektur |
|---|---|---|
| `V59-SZ01` | [Schreibszene – Das gelungene Interview](https://schreibszene.ch/das-gelungene-interview/): 17.11.2026, 09:00–17:00, Zürich, CHF 700 | Eine `IN_PERSON`, `SYNCHRONOUS`, `FIXED`-Variante, genaue Raumadresse weiterhin unbekannt, keine individuelle Platzzusage |
| `V59-SZ04` | [Schreibszene – Redigieren](https://schreibszene.ch/redigieren/): 10.11.2026, Zürich, CHF 640 | Gleiches einheitliches Präsenzmodell, kein erfundener Unterrichtsraum, Quelle ist eine jüngere Indexfassung als eine ältere Detailcache-Variante |
| `V77-04` | [BeVisible – BeSMARTphoneVIDEO](https://www.bevisible.swiss/book-online): 15.10.2026 Leman Studio Luins (vergangene Ausgabe) und 20.11.2026 Downtown Studio, Rue des Vieux-Grenadiers 10, Genève; CHF 689 | Anbieter bestätigt Präsenzformat, aber der abrufbare Buchungsstand ist rund vier Monate alt; `VENUE_FORMAT_SESSION_CROSSWALK` und `BOOKING_OR_INTAKE_NOT_PROVEN` bleiben bestehen |

Bei Schreibszene werden auf Wunsch **zusätzliche** Online-Firmenkurse angeboten. Daraus folgt **keine** neue Online-Variante für die drei hier eingefrorenen festen öffentlichen Editionen. Auch ein Buchungsformular ist nicht die individuelle Zulassung.

Genau diese drei Sidecars `PROVISIONAL → VERIFIED` (nur Delivery), die Matrix-/Backlog-Delivery-Gaps und zwei Regressionstests wurden source-boundiert angepasst. Preisschätzungen, steuerliche Behandlung und alle Release-Gates bleiben unverändert. Global 1'352 Sidecars: **189 VERIFIED, 395 PROVISIONAL, 768 UNKNOWN**; 140 Due-IDs: **107** Preis-fähig, 33 Preis-Gaps, **76** Delivery nicht VERIFIED (zuvor 79), 18 Source-/10 Scope-Holds, null neue Website-Gold. Nachfolgende CI-Ergebnisse separat readback-bestätigen.

## EVT233 – MAZ KI-Thementagung mit tatsächlichem NZZ-Ort

`OFFER-MAZ-100` [offizielle MAZ-Veranstaltungsseite](https://www.maz.ch/kurs/maz-thementagung-ki-im-journalismus): **18.11.2026**, MAZ-Thementagung KI im Journalismus, **NZZ, Falkenstrasse 11, 8008 Zürich**. Damit ist der spezifische Veranstaltungsort statt eines MAZ-Firmensitzes und das feste Präsenzformat eindeutig belegt. Preisprofil **CHF 380 regulär / CHF 290 nur für Journalist:innen** war zuvor korrekt und bleibt unverändert. Nach diesem Quellenabgleich **nur** Delivery `PROVISIONAL → VERIFIED`, eine feste synchrone Präsenzvariante, kein eigenständiger Live-Teilnehmerplatz oder MWST-Beleg. Eine CTA beweist keine Reservierung.

Die 140×57 Matrix, 140×19 Backlog und beide Tests synchron, Frozen Sources und `data.js` unverändert. Stand global 1'352 VERIFIED190 / PROVISIONAL394 / UNKNOWN768. In der 140er Due-Kohorte **75** Delivery nicht vollständig VERIFIED (zuvor 76), **107** Preisfilter-brauchbar, **33** Preisgaps, **18** Source-Guards, **10** Owner-Scope-Signale; weiterhin keine Website-Gold-Freigabe.

## EVT234 – Dawan: zwei konkret bestätigte FOAD-Termine, kein Preis-Gold

Die offizielle [Dawan-Liste bestätigter Kurse](https://www.dawan.ch/sessions-confirmees) enthält für **19.–20. November 2026** sowohl `V82-DAWAN-020` «After Effects pour le Motion Design Approfondissement» als auch `V82-DAWAN-050` «InDesign : Approfondissement», jeweils **FOAD (Distanciel)**. Die Quelle belegt eine konkrete terminierte Fernunterrichtsvariante, **nicht** die im allgemeinen Angebot zusätzlich beworbene Schweizer Präsenzvariante. Bei 020 sind die Tarifarten besonders komplex (Tagespreis, Intra-/Intertraining, Tutoring), bei 050 fehlt die verbindliche Schweizer Brutto-Tarif-/Zugangsbestätigung. Eine numerische Preisfilterfreigabe wäre deshalb unzulässig.

Exakt zwei bestehende Sidecars: `UNKNOWN → PROVISIONAL`, je **nur eine** belegte `REMOTE`-Variante, `SYNCHRONOUS`, `FIXED`. `MODE_CHOICE` behält `IN_PERSON` auf Anbieter-Angebotslevel, aber keine unbelegte Präsenzvariante in `variants`. Die `DELIVERY_NOT_VERIFIED`- und `STRUCTURED_PRICE_BUDGET_UNVERIFIED`-Gaps, zusätzlich alle bestehenden Access-, Booking- und Currentness-Sperren bleiben. `data.js`, frozen Differentiale, Preise und historische Starts unverändert. Die 140er-Matrix und Backlog spiegeln diesen begrenzten Evidenzzuwachs.

Global 1'352 Sidecars: **190 VERIFIED, 396 PROVISIONAL, 766 UNKNOWN**. In 140 Due-IDs **75** Delivery nicht VERIFIED und **107** numerische Preise mit 33 Gaps unverändert. 18 Versions-, 10 Scope-Signale; 0 Gold und kein Release. Nachfolgende CI/Drive-Validierung separat nachtragen.


## EVT235 – MAZ-Ortsregel aus Nutzervorgabe (05.11.2026)

Der Projektverantwortliche hat den regulären MAZ-Durchführungsort ausdrücklich als **Luzern** festgelegt. Die aktuelle 140er-Matrix umfasst 21 MAZ-Zeilen: **20** hatten bisher den kanonischen Ort `NOT_PUBLISHED`. Für diese 20 gilt in der B2-Audit-Matrix ab jetzt die separate, quellenklar deklarierte Stadt-Entscheidung `OWNER_CONFIRMED_CITY_LUZERN_EXACT_VENUE_UNVERIFIED`. Dieselben 20 IDs sind im Prioritäts-Backlog konsistent markiert. Die kanonischen `catalogue_region`-Werte, `data.js`, Smart-Sidecars und die eingefrorenen Originalfelder wurden nicht stillschweigend umgeschrieben; es handelt sich um einen **Owner-City-Override für die nächste kontrollierte Datenmaterialisierung**, nicht um eine vorgetäuschte unabhängige Quellenbestätigung jeder Kursedition. Die ursprünglichen 32 ohne publizierte Ortsangabe reduzieren sich in der **B2-Disposition** auf 12 ohne redaktionell bestimmten Stadtort + 20 mit Owner-Stadtort; die rohe Katalogmetrik bleibt 32.

**Explizite Ausnahme:** `OFFER-MAZ-100` («MAZ-Thementagung: KI im Journalismus – Was kommt 2027?») ist nach der offiziellen MAZ-Kursseite vom 18.11.2026 an der NZZ, Falkenstrasse 11, 8008 **Zürich** angesetzt. Ein allgemeiner Luzern-Default darf eine konkrete Veranstaltungsquelle nicht überschreiben. https://www.maz.ch/kurs/maz-thementagung-ki-im-journalismus

**Gates:** Der Owner-Default belegt ausschliesslich die **Stadt Luzern**, nicht den spezifischen Raum, ein belegtes edition-specific Datum, tatsächliche Durchführung, Sitzplatz, vollständigen Teilnehmerzugang oder Preis. Deshalb bleiben `VENUE_NOT_PUBLISHED` (exakte Venue-Details), `DELIVERY_NOT_VERIFIED` und alle bestehenden Source-, Booking-, Owner-Scope-, Website-Gold- und Publication-Holds bestehen. Keine Master-, Main- oder Hosting-Änderung, keine Gold-/E4-/E5-/G3-Freigabe. Quelle für das MAZ-Kurszentrum: https://www.maz.ch/hinweise_kursteilnehmende ; https://www.maz.ch/kontakt .
