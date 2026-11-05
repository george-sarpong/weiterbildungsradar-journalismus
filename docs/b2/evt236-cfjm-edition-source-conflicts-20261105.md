# B2 / EVT236 — CFJM-Durchführungen: versionsgenaue Gegenprüfung
Datum: 05.11.2026. Dokumenttyp: unabhängiger source/version/occurrence Guard; **kein Master-Write, keine terminliche Korrektur und keine Publikationsfreigabe**.

## Feststellung

Bei sieben genau identifizierten CFJM-Angeboten zeigt die auslesbare **offizielle Einzelkursseite** eine andere, ältere 2026er Durchführung als die im unveränderten 140er-Prüfkatalog geführte 2026/27-Due-Edition. Diese Beobachtung kann darauf zurückgehen, dass CFJM Kursdetail-URLs pro Durchführung oder über Kursversionen wiederverwendet. Es folgt weder, dass die katalogisierte 2027er Edition falsch, noch dass sie buchbar ist. Der gesamte 2027-Eintrag bleibt als archivierungs-/currentnessrelevante Offer- bzw. Occurrence-Information erhalten und bekommt **keine** automatische Source-Gold- oder Booking-Freigabe.

| Offer-ID | Eingefrorener Due-Start | Auf offizieller Einzelkursseite auslesbare frühere Edition | Primärquelle | Reconciliation-Hinweis |
|---|---|---|---|---|
| `OFFER-CFJM-005` | 2027-03-01 | 28.09.–02.10.2026 | [CFJM]( https://www.cfjm.ch/model/formation-continue/fc-tourner-monter-une-video-avec-un-smartphone-les-fondamentaux-19 ) | Five-day course; official price label 'par jour' conflicts with 5-day displayed tariff; retain price review. |
| `OFFER-CFJM-013` | 2027-04-15 | 22.–23.10.2026 | [CFJM]( https://www.cfjm.ch/model/formation-continue/fc-initiation-au-datajournalisme-mettre-les-donnees-au-service-de-l-information-15 ) | Two-day datajournalism course; do not reuse October 2026 details as proof of April 2027. |
| `OFFER-CFJM-011` | 2027-04-23 | 16. und 23.10.2026 | [CFJM]( https://www.cfjm.ch/model/formation-continue/fc-creer-une-video-percutante-pour-les-reseaux-sociaux-16 ) | Two nonconsecutive October 2026 sessions; distinguish two-day course from other video offers. |
| `OFFER-CFJM-012` | 2027-04-26 | 19.–23.10.2026 | [CFJM]( https://www.cfjm.ch/model/formation-continue/fc-l-ia-au-service-du-journalisme-8 ) | Five-day 2026 issue; five tariff amounts known, but 2027 edition timing not proved by this detail. |
| `OFFER-CFJM-015` | 2027-05-24 | 26.–30.10.2026 | [CFJM]( https://www.cfjm.ch/model/formation-continue/fc-podcast-reportage-et-documentaire-22 ) | Five-day podcast course; 2027 intake not proved by 2026 detail. |
| `OFFER-CFJM-014` | 2027-05-26 | 22.10.2026 | [CFJM]( https://www.cfjm.ch/model/formation-continue/fc-creer-une-newsletter-pertinente-et-efficace-qui-trouve-son-audience-20 ) | One-day newsletter course; 2027 date requires separate booking/listing proof. |
| `OFFER-CFJM-020` | 2026-11-26 | 26.–27.10.2026 | [CFJM]( https://www.cfjm.ch/model/formation-continue/fc-de-journaliste-a-auteur-comment-creer-son-premier-ouvrage-12 ) | Two-day authorship course; November edition not proved by October detail. |

## Verbindliche Disposition

1. **Nicht aus der alten Kursseite auf die 2027er Einzeldurchführung schliessen.** Die Katalogtermine bleiben vorerst als historische/frozen Due-Information bestehen. Aktuelle Durchführung muss aus der exakten aktuellen CFJM-Listen- oder Buchungsoberfläche und idealerweise einer nicht bloss alten Cache-Version positiv verifiziert werden.
2. **Preise und Berechtigungen bleiben edition- und tarifgebunden.** Selbst wenn eine Staffel auf einer alten offiziellen Seite lesbar ist, beweist das nicht automatisch die Preisgültigkeit für die spätere Durchführung. Bei `OFFER-CFJM-005` ist die pro-Tag-Anmerkung zusätzlich intern erklärungsbedürftig. Gratis für beitragszahlende CFJM-FC-Mitglieder ist kein allgemeiner Gratispreis.
3. **Venue/Delivery nicht aufblasen.** Schweizer Sitz des CFJM ist kein Beleg für den tatsächlichen Unterrichtsraum oder die konkret gebuchte Lehrform.
4. **Quellenversion-HOLD statt Cancellation.** Ein bereits vergangener Termin bleibt in der Datenbank als Historie, darf aber nicht allein wegen des abgelaufenen Datums als zukünftiger Kurs oder freier Platz erscheinen.
5. **Keine Quellendrift.** `data.js`, die 39er/101er frozen Quellendifferentiale, die 140er Source-Felder, Termine und alle E4/E5/G3-/Website-Gold-Gates bleiben unverändert. Dieses Dokument ergänzt die aktuelle Prüfbeobachtung, ohne ältere freigegebene Evidenz zu überschreiben.

## Verbundener vollständiger 140er-Preis-/Delivery-Audit

[EVT236 140er Trust-Ledger](./evt236-140-price-delivery-trust-audit-20261105.tsv) enumeriert sämtliche 140 eingefrorenen IDs. Die bisherige Matrix bezeichnet 107 Sidecars als `priceEligible=true`; das ist **technische Parser-Akzeptanz, kein 107-fach belegter vollständiger Endpreis**. Distribution: 33 parserseitig gesperrt; 19 nur `FROM`-Mindestpreise; 2 `NOT_PUBLISHED`; 1 `NOT_APPLICABLE` (Beschäftigungsroute); 21 `RANGE`; 27 numerisch, aber konditionale Tarife; 37 numerisch mit ungeklärter Steuersemantik. Die letzten drei Gruppen von 21+27+37 = 85 sind numerisch strukturiert, aber nicht automatisch unbedingte CHF-Brutto-Gesamtpreise.

## Technische Grenze

PC-COLLEGE-Kursmodelle wurden getrennt davon **nur als Unterrichtsoptionen** in zehn exakt belegten Kurs-Sidecars auf `VERIFIED MODE_CHOICE` gesetzt: Live-Online oder Präsenz Basel/Bern/Zürich. Die Kursseiten nennen EUR-ab-Preise mit deutschem 19%-Steuerbeispiel; **keine CHF-/CH-Endpreis-Freigabe**, keine definitive Raum-/Stadtwahl für einen bestimmten Termin und keine individuelle Buchung wurde abgeleitet. Die globale Datenmenge bleibt 1352 Sidecars.
