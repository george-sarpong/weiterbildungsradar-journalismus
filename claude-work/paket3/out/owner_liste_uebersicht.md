# Owner-Entscheide Paket 3 – Übersicht (Stand 2026-11-09)

Vollständige Werte: `owner_liste.csv` (Spalte `entscheid_owner` zum Ausfüllen). Hier gekürzt auf ca. 110 Zeichen.
Bis zum Entscheid gilt in jedem Fall der Live-Wert (keine stille Überschreibung).

## A Echte Konflikte (6 Felder, 6 Angebote)
Live und main haben dasselbe Feld verschieden geändert. Alle sechs betreffen Schutz-IDs; alle Termine liegen vor dem Stichtag.

| Fall | Angebot | Feld | Live-Wert | GitHub (main) | Vorschlag | Begründung |
|---|---|---|---|---|---|---|
| O0001 | CAD-002 (Cadschool) | data.start | 2026-10-26–2026-10-27 | 26.–27.10.2026 (Lausanne, Präsenz); weitere Präsenzdurchführung kursgenau nicht bestätigt; Selbstlernvariante… | main übernehmen | main übernehmen (zweiter Präsenztermin nicht bestätigt). PR10 nennt 23.–24.11.2026 als Termin: nicht übernehmen, sondern in die Nachrecherche (zweite Quelle). |
| O0002 | OFFER-UZHDSI-001 (Universität Zürich / Digital …) | data.region | Zürich – genauer Raum noch zu klären | Universität Zürich, Raum KO2 (DSI-OSINT-Wahlpflichtmodul HS 2026; konkrete Gebäudeadresse nicht publiziert) | main übernehmen | main nennt konkreten Raum (KO2) aus QA09-Quelle; Live ist nur eingedeutschte Fassung von «Raum tbd». |
| O0003 | PCC-P02 (PC-COLLEGE Training GmbH) | data.start | 22.10.2026–23.10.2026 (erfasster Termin; beim Anbieter prüfen) | Live-Online-Durchführungen 22.–23.10.2026 (FRG261022) und 14.–15.12.2026 (FRG261214); Präsenzstandort und Plä… | main übernehmen | main belegt zweite Durchführung 14.–15.12.2026 mit Produktcode; Live nennt nur den vergangenen Termin 22.–23.10.2026 (E014). |
| O0004 | PCC-P16 (PC-COLLEGE Training GmbH) | data.start | 23.10.2026 (erfasster Termin; beim Anbieter prüfen); die ausgewiesene Durchführung ist Live-Online | Veröffentlichte Live-Online-Ausgaben: 23.10.2026, 20.11.2026 und 18.12.2026 (je 1 Tag, 09:00–16:00). Präsenz … | main übernehmen | main nennt Folgetermine 20.11. und 18.12.2026; Live nur vergangenen Termin 23.10.2026 (E014). |
| O0005 | PCC-P32 (PC-COLLEGE Training GmbH) | data.start | 02.11.2026–03.11.2026 (erfasster Termin; beim Anbieter prüfen) | PSP-Kurs im Anbieterkatalog erwähnt; keine aktuell bestätigte kursgenaue Durchführung. Termin 02.–03.11.2026 … | main übernehmen | main hält fest, dass der Termin nicht nachgewiesen ist; Live zeigt ihn als erfassten Termin. Angebot ist OUT_SCOPE (E016) und ohnehin nicht sichtbar. |
| O0006 | PCC-P33 (PC-COLLEGE Training GmbH) | data.start | 29.10.2026–30.10.2026 (erfasster Termin; beim Anbieter prüfen); 21.–22.12.2026 laut bisherigem Datenstand | Historisch dokumentierte Ankündigungen: 29.–30.10. und 21.–22.12.2026. Derzeit keine Durchführung angeboten; … | main übernehmen | main: keine aktuelle Durchführung; deckt sich mit ARCHIV-Entscheid (E017, E050). |

## B Gruppenkonflikte (18 Felder, 7 Angebote)
Live hat ein Feld der Gruppe Termin geändert, main ein anderes derselben Gruppe.

| Fall | Angebot | Feld | Live-Wert | GitHub (main) | Vorschlag | Begründung |
|---|---|---|---|---|---|---|
| O0007 | MW-P06 (Microwin AG) | data.sessions |  | [{"startDate": "2026-12-15", "endDate": "2026-12-16", "label": "15.–16.12.2026 · Wallisellen oder LiveStream"… | main übernehmen | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0008 | MW-P06 (Microwin AG) | data.start | 15.10.2026–16.10.2026 (erfasster Termin; beim Anbieter prüfen); weitere Termine im Dezember 2026 und 2027 lau… | 15.10.2026–16.10.2026 next future; additional Dec 2026 and 2027 sessions published | Live behalten | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0009 | PCC-P03 (PC-COLLEGE Training GmbH) | data.endDate | 2026-10-23 |  | main übernehmen | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0010 | PCC-P03 (PC-COLLEGE Training GmbH) | data.sessions |  | [{"startDate": "2026-10-21", "endDate": "2026-10-23", "label": "21.–23.10.2026"}, {"startDate": "2026-11-18",… | main übernehmen | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0011 | PCC-P03 (PC-COLLEGE Training GmbH) | data.start | 21.10.2026–23.10.2026 (erfasster Termin; beim Anbieter prüfen); weitere Termine im November und Dezember laut… | 21.10.2026–23.10.2026 next future; further Nov/Dec sessions published | Live behalten | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0012 | PCC-P05 (PC-COLLEGE Training GmbH) | data.endDate | 2026-10-23 |  | main übernehmen | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0013 | PCC-P05 (PC-COLLEGE Training GmbH) | data.sessions |  | [{"startDate": "2026-10-21", "endDate": "2026-10-23", "label": "21.–23.10.2026"}, {"startDate": "2026-10-26",… | main übernehmen | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0014 | PCC-P05 (PC-COLLEGE Training GmbH) | data.start | 21.10.2026–23.10.2026 (erfasster Termin; beim Anbieter prüfen); weitere Termine im Oktober, November und Deze… | 21.10.2026–23.10.2026 next future; further Oct/Nov/Dec sessions published | Live behalten | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0015 | PCC-P08 (PC-COLLEGE Training GmbH) | data.endDate | 2026-10-30 |  | main übernehmen | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0016 | PCC-P08 (PC-COLLEGE Training GmbH) | data.start | 29.10.2026–30.10.2026 (erfasster Termin; beim Anbieter prüfen); weiterer Termin im Dezember laut bisherigem D… | 29.10.2026–30.10.2026 next future; further Dec session published | Live behalten | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0017 | PCC-P28 (PC-COLLEGE Training GmbH) | data.endDate | 2026-10-23 |  | main übernehmen | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0018 | PCC-P28 (PC-COLLEGE Training GmbH) | data.sessions |  | [{"startDate": "2026-10-22", "endDate": "2026-10-23", "label": "22.–23.10.2026"}, {"startDate": "2026-12-14",… | main übernehmen | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0019 | PCC-P28 (PC-COLLEGE Training GmbH) | data.start | 22.10.2026–23.10.2026 (erfasster Termin; beim Anbieter prüfen); weitere Termine im Dezember 2026 und 2027 lau… | 22.10.2026–23.10.2026 next future; further Dec 2026 and 2027 sessions published | Live behalten | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0020 | PCC-P29 (PC-COLLEGE Training GmbH) | data.sessions |  | [{"startDate": "2026-12-07", "endDate": "2026-12-08", "label": "07.–08.12.2026 · Live-Online", "region": "Liv… | main übernehmen | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0021 | PCC-P29 (PC-COLLEGE Training GmbH) | data.start | 15.10.2026–16.10.2026 (erfasster Termin; beim Anbieter prüfen); 07.–08.12. und 09.–10.12.2026 laut bisherigem… | 15.10.2026–16.10.2026 next future; 07.12–08.12 and 09.12–10.12.2026 also published | Live behalten | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0022 | V58-S1-07 (Studio 1 GmbH) | data.endDate | 2026-11-04 |  | main übernehmen | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0023 | V58-S1-07 (Studio 1 GmbH) | data.sessions |  | [{"startDate": "2026-11-02", "endDate": "2026-11-04", "label": "02.–04.11.2026 · Wallisellen"}, {"startDate":… | main übernehmen | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |
| O0024 | V58-S1-07 (Studio 1 GmbH) | data.start | 02.11.2026–04.11.2026; weitere Termine 2027 laut bisherigem Datenstand (Buchbarkeit nicht neu geprüft) | 02.11.2026–04.11.2026; further 2027 dates bookable | Live behalten | Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortla… |

## C Live-Änderungen an Schutz-IDs (29 Felder, 18 Angebote)


| Fall | Angebot | Feld | Live-Wert | GitHub (main) | Vorschlag | Begründung |
|---|---|---|---|---|---|---|
| O0025 | CAD-018 (Cadschool) | data.region | Genf oder Lausanne | Genève or Lausanne | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0026 | CAD-023 (Cadschool) | data.region | Genf oder Lausanne | Genève or Lausanne | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0027 | CAD-025 (Cadschool) | data.region | Genf oder Lausanne | Genève or Lausanne | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0028 | MW-P05 (Microwin AG) | data.region | Wallisellen oder Livestream | Wallisellen or LiveStream | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0029 | MW-P05 (Microwin AG) | smart.priceOptions | [{"amountType": "EXACT", "amount": 1490, "minAmount": null, "maxAmount": null, "currency": "CHF", "tariffClas… | [{"amountType": "EXACT", "amount": 1490, "minAmount": null, "maxAmount": null, "currency": "CHF", "tariffClas… | Live behalten | Live und main haben identisch geändert (z. B. Tausendertrennung im Preis); nur bestätigen. |
| O0030 | OFFER-EBU-013 (EBU Academy – European Broadc…) | smart.priceOptions | [{"amountType": "EXACT", "amount": 1900, "minAmount": null, "maxAmount": null, "currency": "EUR", "tariffClas… | [{"amountType": "EXACT", "amount": 1900, "minAmount": null, "maxAmount": null, "currency": "EUR", "tariffClas… | Live behalten | Live und main haben identisch geändert (z. B. Tausendertrennung im Preis); nur bestätigen. |
| O0031 | PCC-P02 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0032 | PCC-P03 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0033 | PCC-P05 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0034 | PCC-P08 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0035 | PCC-P14 (PC-COLLEGE Training GmbH) | data.endDate | 2026-11-04 | 2026-10-14 | Live behalten | Live ist Basis (E035); Live-Änderung enthält neue Angaben (z. B. datierter Terminnachtrag) – bestätigen. |
| O0036 | PCC-P14 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0037 | PCC-P14 (PC-COLLEGE Training GmbH) | data.start | 02.11.2026–04.11.2026 (gemäss PC-COLLEGE Schweiz; Stand 14.10.2026) | 12.10.2026–14.10.2026 next future | Live behalten | Live ist Basis (E035); Live-Änderung enthält neue Angaben (z. B. datierter Terminnachtrag) – bestätigen. |
| O0038 | PCC-P14 (PC-COLLEGE Training GmbH) | data.startDate | 2026-11-02 | 2026-10-12 | Live behalten | Live ist Basis (E035); Live-Änderung enthält neue Angaben (z. B. datierter Terminnachtrag) – bestätigen. |
| O0039 | PCC-P14 (PC-COLLEGE Training GmbH) | data.url | https://www.pc-college.ch/seminare-schulungen-kurse/after-effects/adobe-after-effects-animierte-erklaervideos… | https://www.pc-college.ch/seminare-schulungen-kurse/after-effects/adobe-after-effects-animierte-erklaervideos… | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0040 | PCC-P15 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0041 | PCC-P15 (PC-COLLEGE Training GmbH) | data.start | 19.10.2026–20.10.2026 (erfasster Termin; beim Anbieter prüfen) | 19.10.2026–20.10.2026 next future | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0042 | PCC-P16 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0043 | PCC-P18 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0044 | PCC-P18 (PC-COLLEGE Training GmbH) | data.start | 15.10.2026–16.10.2026 (erfasster Termin; beim Anbieter prüfen) | 15.10.2026–16.10.2026 next future | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0045 | PCC-P21 (PC-COLLEGE Training GmbH) | data.endDate | 2026-10-30 |  | Live behalten | Live ist Basis (E035); Live-Änderung enthält neue Angaben (z. B. datierter Terminnachtrag) – bestätigen. |
| O0046 | PCC-P21 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0047 | PCC-P21 (PC-COLLEGE Training GmbH) | data.start | 30.10.2026 (gemäss PC-COLLEGE Schweiz; Stand 14.10.2026) | 02.10.2026 next future | Live behalten | Live ist Basis (E035); Live-Änderung enthält neue Angaben (z. B. datierter Terminnachtrag) – bestätigen. |
| O0048 | PCC-P21 (PC-COLLEGE Training GmbH) | data.startDate | 2026-10-30 | 2026-10-02 | Live behalten | Live ist Basis (E035); Live-Änderung enthält neue Angaben (z. B. datierter Terminnachtrag) – bestätigen. |
| O0049 | PCC-P21 (PC-COLLEGE Training GmbH) | data.url | https://www.pc-college.ch/seminare-schulungen-kurse/adobe-creative-cloud/adobe-creative-suite-adobe-creative-… | https://www.pc-college.ch/seminare-schulungen-kurse/adobe-creative-cloud/adobe-creative-cloud-cc-reinzeichnun… | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0050 | PCC-P23 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0051 | PCC-P28 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0052 | PCC-P32 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |
| O0053 | PCC-P33 (PC-COLLEGE Training GmbH) | data.provider | PC-COLLEGE Training GmbH | PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface) | Live behalten | Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen). |

## D HOLD-Sperren aus main, die live fehlen (46)
GitHub-Wert jeweils `publicationStatus = HOLD`; PR10 identisch. Vorschlag in allen Fällen: HOLD übernehmen (E042).

| Fall | Angebot | Anbieter | Titel | live sichtbar heute | Vorschlag |
|---|---|---|---|---|---|
| O0054 | AT-PROD-OFFER-154 | Russmedia | Traineeprogramm Redaktion | ja | main übernehmen |
| O0055 | AT-PROD-OFFER-168 | Paris Lodron Universität Salzburg … | Universitätslehrgang Sportjournalismus | ja | main übernehmen |
| O0056 | OFFER-CFJM-008 | CFJM – Centre de formation au jour… | Fondamentaux / Le droit à l'image des journalistes | ja | main übernehmen |
| O0057 | OFFER-CORSO-001 | Corso di giornalismo della Svizzer… | Corso per Giornalisti – Diploma cantonale di Gior… | ja | main übernehmen |
| O0058 | OFFER-EBU-014 | EBU Academy – European Broadcastin… | How to Create and Measure Public Value for Public… | nein (Enddatum vorbei) | main übernehmen |
| O0059 | OFFER-EBU-019 | EBU Academy – European Broadcastin… | Networked Media Open Specifications Hands-on Work… | nein (Enddatum vorbei) | main übernehmen |
| O0060 | OFFER-FERNUNI-002 | FernUni Schweiz / UniDistance Suis… | Histoire des Fake News et des Médias | ja | main übernehmen |
| O0061 | OFFER-IFC-006 | Istituto della formazione continua… | Fotografia di ragni e serpenti | ja | main übernehmen |
| O0062 | OFFER-IFC-007 | Istituto della formazione continua… | Fotografia: approfondimento e ricerca di uno stil… | ja | main übernehmen |
| O0063 | OFFER-IFC-012 | Istituto della formazione continua… | Fotografia: musica e paesaggio | ja | main übernehmen |
| O0064 | OFFER-IFC-014 | Istituto della formazione continua… | Fotografiamo gli animali | ja | main übernehmen |
| O0065 | OFFER-IFC-020 | Istituto della formazione continua… | WordPress: crea il tuo sito web | ja | main übernehmen |
| O0066 | OFFER-MAZ-107 | MAZ – Institut für Journalismus un… | Medienlandschaft, Medienethik und Medienrecht – G… | nein (Enddatum vorbei) | main übernehmen |
| O0067 | OFFER-MAZ-181 | MAZ – Institut für Journalismus un… | Wirkungsvoll auftreten | nein (Enddatum vorbei) | main übernehmen |
| O0068 | OFFER-MAZ-182 | MAZ – Institut für Journalismus un… | Wirtschaft – Grundlagen von Aktien bis Zinsen | nein (Enddatum vorbei) | main übernehmen |
| O0069 | OFFER-NOBLE-004 | NobleProg Schweiz | Adobe Creative Cloud for Academic and Institution… | ja | main übernehmen |
| O0070 | OFFER-NOBLE-013 | NobleProg Schweiz | Advanced Stable Diffusion: Deep Learning for Text… | ja | main übernehmen |
| O0071 | OFFER-NOBLE-014 | NobleProg Schweiz | AI-Powered Audio Enhancement and Noise Reduction | ja | main übernehmen |
| O0072 | OFFER-NOBLE-020 | NobleProg Schweiz | Blockchain and Cryptocurrency Investigation Maste… | ja | main übernehmen |
| O0073 | OFFER-NOBLE-033 | NobleProg Schweiz | Contentful Headless CMS | ja | main übernehmen |
| O0074 | OFFER-NOBLE-035 | NobleProg Schweiz | DeepSeek for Automated Content Creation | ja | main übernehmen |
| O0075 | OFFER-NOBLE-037 | NobleProg Schweiz | Designing Personal Knowledge Bases with Notion | ja | main übernehmen |
| O0076 | OFFER-NOBLE-044 | NobleProg Schweiz | Google Gemini AI for Content Creation | ja | main übernehmen |
| O0077 | OFFER-ORSYS-054 | ORSYS Training Schweiz | Digital analytics, stratégie et bonnes pratiques | ja | main übernehmen |
| O0078 | OFFER-ORSYS-057 | ORSYS Training Schweiz | Drupal 7, gérer son CMS | ja | main übernehmen |
| O0079 | OFFER-ORSYS-063 | ORSYS Training Schweiz | Développer un site web dynamique grâce à l'IA | ja | main übernehmen |
| O0080 | OFFER-ORSYS-076 | ORSYS Training Schweiz | Gérer sa visibilité et sa réputation numérique | ja | main übernehmen |
| O0081 | OFFER-ORSYS-078 | ORSYS Training Schweiz | HTML5 & CSS3, maîtriser la création de ses pages … | ja | main übernehmen |
| O0082 | OFFER-ORSYS-082 | ORSYS Training Schweiz | Intégrer l’IA et le GEO dans sa stratégie de cont… | ja | main übernehmen |
| O0083 | OFFER-ORSYS-083 | ORSYS Training Schweiz | Joomla!, créer et administrer un site Web | ja | main übernehmen |
| O0084 | OFFER-ORSYS-099 | ORSYS Training Schweiz | Mettre en œuvre sa stratégie sur TikTok | ja | main übernehmen |
| O0085 | OFFER-ORSYS-118 | ORSYS Training Schweiz | Réaliser un site Web, pour non-informaticiens | ja | main übernehmen |
| O0086 | OFFER-ORSYS-139 | ORSYS Training Schweiz | UX design et ergonomie des sites web | ja | main übernehmen |
| O0087 | OFFER-ORSYS-141 | ORSYS Training Schweiz | UX design et ergonomie pour tablettes et smartpho… | ja | main übernehmen |
| O0088 | OFFER-ORSYS-143 | ORSYS Training Schweiz | UX-PM, niveau 1 : adoption de l'UX, certification… | ja | main übernehmen |
| O0089 | OFFER-ORSYS-144 | ORSYS Training Schweiz | UX-PM, niveau 2 : exécution de l'UX, certificatio… | ja | main übernehmen |
| O0090 | OFFER-ORSYS-151 | ORSYS Training Schweiz | WordPress, perfectionnement | ja | main übernehmen |
| O0091 | OFFER-UZHDSI-001 | Universität Zürich / Digital Socie… | Open Source Intelligence (OSINT) – DSI Wahlpflich… | ja | main übernehmen |
| O0092 | PCC-P08 | PC-COLLEGE Training GmbH | Adobe FrameMaker - Aufbaukurs | nein (Enddatum vorbei) | main übernehmen |
| O0093 | PCC-P32 | PC-COLLEGE Training GmbH | Adobe Photoshop - Professionelle Porträt - Retusc… | nein (Enddatum vorbei) | main übernehmen |
| O0094 | PCC-P33 | PC-COLLEGE Training GmbH | Adobe Premiere + Adobe After Effects - Umsteiger … | nein (Enddatum vorbei) | main übernehmen |
| O0095 | PCC-P38 | PC-COLLEGE Training GmbH (DE legal… | Adobe XD - Kompaktkurs | nein (Enddatum vorbei) | main übernehmen |
| O0096 | V52-MEEL-INSTAGRAM | Association MEEL | Les boîtes à outils du vendredi – Instagram | ja | main übernehmen |
| O0097 | V82-DAWAN-012 | Dawan | Premiere Pro : techniques de montage Avancé | nein (Enddatum vorbei) | main übernehmen |
| O0098 | V82-DAWAN-017 | Dawan | After Effects Avancé : Duik | nein (Enddatum vorbei) | main übernehmen |
| O0099 | V82-DAWAN-094 | Dawan | Accessibilité : Concevoir des contenus web et édi… | nein (Enddatum vorbei) | main übernehmen |

## E GitHub-Änderungen an Schutz-IDs (700 Felder, 133 Angebote)
Stammen aus den 49 main-Commits vom 17.–24.10.2026 (86868e0..5f09e07, überwiegend QA09); live läuft noch der Datenstand vom 11.10. Vorschlag: als Block übernehmen; Ausnahmen einzeln in `owner_liste.csv` markieren.

Felder: data.reviewAfter 102, smart.delivery 91, data.start 83, data.startDate 68, data.region 51, smart.priceOptions 49, data.description 43, smart.parserStatus 40, smart.priceEligible 31, data.format 30, data.priceDisplay 24, data.url 18, data.endDate 17, data.sessions 15, data.access 14, data.priceCategory 14, data.duration 9, data.publicationReason 1

Angebote: AT-PROD-OFFER-003, AT-PROD-OFFER-154, AT-PROD-OFFER-168, AT-PROD-OFFER-172, AT-PROD-OFFER-209, AT-PROD-OFFER-211, CAD-001, CAD-002, CAD-006, CAD-018, CAD-025, IF-G04, IF-P03, IF-P08, IF-P10, IF-W03, OFFER-CFJM-007, OFFER-CFJM-008, OFFER-CFJM-013, OFFER-CFJM-014, OFFER-CFJM-015, OFFER-CFJM-016, OFFER-CORSO-001, OFFER-EBU-013, OFFER-EBU-014, OFFER-EBU-015, OFFER-EBU-019, OFFER-FERNUNI-002, OFFER-HKB-001, OFFER-IFC-005, OFFER-IFC-006, OFFER-IFC-007, OFFER-IFC-008, OFFER-IFC-012, OFFER-IFC-014, OFFER-IFC-020, OFFER-MAZ-005, OFFER-MAZ-045, OFFER-MAZ-058, OFFER-MAZ-075, OFFER-MAZ-107, OFFER-MAZ-168, OFFER-MAZ-176, OFFER-MAZ-181, OFFER-MAZ-182, OFFER-NOBLE-004, OFFER-NOBLE-006, OFFER-NOBLE-008, OFFER-NOBLE-013, OFFER-NOBLE-014, OFFER-NOBLE-016, OFFER-NOBLE-020, OFFER-NOBLE-021, OFFER-NOBLE-033, OFFER-NOBLE-035, OFFER-NOBLE-037, OFFER-NOBLE-044, OFFER-NOBLE-057, OFFER-NOBLE-064, OFFER-NOBLE-067, OFFER-ORSYS-005, OFFER-ORSYS-006, OFFER-ORSYS-007, OFFER-ORSYS-008, OFFER-ORSYS-009, OFFER-ORSYS-012, OFFER-ORSYS-014, OFFER-ORSYS-020, OFFER-ORSYS-022, OFFER-ORSYS-026, OFFER-ORSYS-039, OFFER-ORSYS-041, OFFER-ORSYS-042, OFFER-ORSYS-045, OFFER-ORSYS-048, OFFER-ORSYS-051, OFFER-ORSYS-054, OFFER-ORSYS-057, OFFER-ORSYS-058, OFFER-ORSYS-063, OFFER-ORSYS-064, OFFER-ORSYS-066, OFFER-ORSYS-069, OFFER-ORSYS-070, OFFER-ORSYS-075, OFFER-ORSYS-076, OFFER-ORSYS-078, OFFER-ORSYS-079, OFFER-ORSYS-082, OFFER-ORSYS-083, OFFER-ORSYS-088, OFFER-ORSYS-094, OFFER-ORSYS-099, OFFER-ORSYS-103, OFFER-ORSYS-107, OFFER-ORSYS-108, OFFER-ORSYS-115, OFFER-ORSYS-116, OFFER-ORSYS-118, OFFER-ORSYS-119, OFFER-ORSYS-120, OFFER-ORSYS-122, OFFER-ORSYS-129, OFFER-ORSYS-135, OFFER-ORSYS-137, OFFER-ORSYS-138, OFFER-ORSYS-139, OFFER-ORSYS-141, OFFER-ORSYS-143, OFFER-ORSYS-144, OFFER-ORSYS-146, OFFER-ORSYS-151, OFFER-UZHDSI-001, PCC-P02, PCC-P03, PCC-P05, PCC-P08, PCC-P16, PCC-P23, PCC-P28, PCC-P32, PCC-P33, PJ-V16-07, V52-MEEL-INSTAGRAM, V58-S1-07, V78-04, V79-02, V82-DAWAN-012, V82-DAWAN-017, V82-DAWAN-029, V82-DAWAN-037, V82-DAWAN-039, V82-DAWAN-094

## F Zusatz: Grundsatzfragen aus der Master-Tabelle (keine Einzelfälle, nicht in owner_liste.csv)

| Nr. | Frage | betrifft | Vorschlag |
|---|---|---|---|
| F1 | Darf der Rohwert `country` als Anbieterland gelten, wo kein Gegenbefund besteht? | 1328 Website-Angebote | Nein ohne Beleg; Kandidat bleibt sichtbar in Spalte `anbieter_land_kandidat` |
| F2 | Gilt «Durchführungsort in der Schweiz genannt» als Beleg für CH-Zugang (E030)? | 735 Angebote | Nein: CH-Ort als Hinweis «Durchführung in der Schweiz» zeigen, CH-Zugang bleibt «nicht erfasst», bis Teilnahmebedingungen belegt sind (E030, E036) |
| F3 | DE/USA-Zeilen mit R4-Vermerk archiviert/abgelaufen/geschlossen: in der Beta zeigen (E036) oder archivieren (E014/E015)? | 295 Zeilen | archivieren, bis aktuelles Angebot belegt |
| F4 | DE/USA-Zeilen ohne eindeutige Angebots-URL (mehrere URLs bzw. Text im Quellenfeld) | 30 Zeilen | nicht zeigen, bis eine Angebots-URL bestimmt ist |
| F5 | Objektklassen-Regeln (`objektklassen_zuordnung.csv`) bestätigen; Sammelobjekte (PARENT/FAMILY) | 151 Sammelobjekte, 24 unklar | Sammelobjekte als Programm führen, Teilangebote später |
| F6 | Dedupe-Verdacht (DJA DE↔CH, gleiches Programm an mehreren Colleges) | 5 Zeilen | DJA: CH-Datensatz behalten, DE-Zeile als Dublette markieren (nicht sichtbar); Colleges: je Anbieter behalten |
