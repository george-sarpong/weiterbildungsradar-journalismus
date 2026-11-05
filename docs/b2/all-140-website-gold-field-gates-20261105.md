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
| Strukturierter numerischer Preis für Filter freigegeben | 102 | technische Filterfähigkeit, **kein** attestierter gültiger Endpreis |
| Preis nicht verlässlich numerisch im strukturierten Sidecar | 38 | Budgetempfehlungen aus diesen Werten bleiben gesperrt |
| Kursort nicht publiziert | 32 | Kursort als individuelles E4-Feld offen |
| Ausschliesslich online im Katalog gekennzeichnet | 37 | nicht mit hybrider / mehreren Standorten gleichsetzen |
| Mehrere Orts- oder Formatoptionen im Katalog | 39 | echte Edition/Variante nötig, kein willkürlich gewählter Standort |
| Ein einzelner angegebener Ort | 32 | Angabe im Katalog ≠ erneuter unabhängiger Veranstaltungsortbeweis |
| Nicht source-verifiziertes Delivery-Modell | 107 | Semantik/Durchführung muss getrennt vom Anbieter-Sitz belegt werden |
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
