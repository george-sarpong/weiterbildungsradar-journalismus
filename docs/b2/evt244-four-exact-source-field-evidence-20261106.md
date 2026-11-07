# EVT244 – Eng begrenzte Quellen-Nachweise für vier bereits offene B2-IDs

Datum 2026-11-06. Parent GitHub PR10 HEAD: 713f17360403912431dfad6627851197c3f566ac; Project Bible EVT243 mit nachfolgendem technischem PRICE-P0-Successor.

Keine neue Anbieter-Discovery, keine Änderung an data.js, smart-search-data.js, all-140-Website-Gold-Gates, all-140-Backlog, Master, main oder Hosting. Diese Nachweisnotiz ist **nicht** die finale Änderung des Queue-Gates. Konkrete alte Feldwerte gegen neue Originalquellen geprüft, bestehende Holds explizit beibehalten.

## PCC-P13 — Preisevidenz neu bestätigt, Code-/Edition-Alias offen

Canonical/frozen URL (Katalog): https://www.pc-college.ch/seminare-schulungen-kurse/acrobat/adobe-acrobat-pdf-fuer-die-druckvorstufe-acp.php
Aktuelle offizielle Produktseite: https://www.pc-college.ch/seminare-schulungen-kurse/acrobat/adobe-acrobat-pdf-fuer-die-druckvorstufe-acd.php (Provider-Index-Snapshot vor ca. 2 Wochen).
Exakte Überschrift stimmt; aktuelle Seite nennt `kursacd`, Code ACD 261106 für 06.11.2026, 1 Tag, alternativ Live-Online / Präsenzwahl und Preis **ab EUR 590** mit deutscher 19%-MWST-Rechenillustration. Folgetermine ab 22.01.2027 publiziert. Die alte Katalogadresse enthält ACP, NICHT ACD. **DELTA NUR: EUR-590-AB-PREIS ist auf aktuellere offizielle ACD-Variante positiv corroboriert**, aber mangels offiziellen ACP→ACD-Codeübergangs nicht automatisch als preis-/editionsidentischer alter ACP-Stable-Offer verifiziert. Quelle bestätigt kein Schweizer Endtotal, keine gewählte reale Durchführungsadresse und keine Buchungszusage. Status: MATERIAL_PRICE_FIELD_EVIDENCE, IDENTITY_HOLD_PERSISTS. Kein Werbetext «verfügbar».

## PCC-P20 — Preisevidenz neu bestätigt, PDL/PSI offen

Canonical/frozen: https://www.pc-college.ch/seminare-schulungen-kurse/adobe-creative-cloud/adobe-creative-cloud-cc-print-und-digitales-layout-mit-indesign-und-photoshop-pdl.php
Aktuelle offizielle Seite: https://www.pc-college.ch/seminar/photoshop/adobe-creative-cloud-cc-seminar-schulung-psi.php (Provider-Index-Snapshot ca. 3 Wochen alt).
Exakte Langüberschrift, Preis **ab EUR 1'390** und 19%-MwSt.-Illustration, PSI 261104 vom 04.–06.11.2026, 3 Unterrichtstage; Live-Online oder Standortwahl. Weitere PSI-Ausgabe 20.–22.01.2027. Alte ID im Link PDL statt PSI: **kein Aliasbeweis**. DELTA: aktueller Preisuntergrenzen-Beleg für Ersatzprodukt PSI, nicht für identischen PDL-Quellcode. CH-All-in, tatsächliche Unterrichtsstadt/Platz, definitive Überführung weiter HOLD. Eine 04.–06.11-Ausgabe ist ab Ablauf nicht zukünftige buchbare Website-Occurrence.

## PCC-P40 — zwei offizielle Pfade mit gleichem Kurscode und gleicher Edition

Eingefrorene Seite: https://www.pc-college.ch/seminare-schulungen-kurse/barrierefreie-pdf/barrierefreie-pdfs-dokumente-mit-ms-word-und-adobe-acrobat-professional-bp1.php (Index-Archiv ca. 5 Monate).
Offizielle neuere Seite: https://www.pc-college.ch/seminar/acrobat/barrierefreie-pdfs-seminar-schulung-bp1.php (Index-Snapshot ca. 1 Monat).
Beide **selber ausgeschriebener Kursname, kursbp1 / BP1 261123, Ausgabe 23.–24.11.2026, 2 Tage** sowie Produktwahl Live-Online oder Präsenz (Basel, Bern, Zürich als auswählbare Standorte, kein gewählter Ort). Aktuellere Seite führt zusätzlich BP1 270211, 11.–12.02.2027. **POSITIVE_PRODUCT_AND_EDITION_IDENTITY_CROSSWALK** auf identischen Anbieter-Code und Datum, nicht technische HTTP-Redirect-Messung, nicht Garantie einer konkreten Campus-Sitzplatz-Option. `ab EUR 990 + MWST` als Untergrenze; Schweizer tatsächlich geschuldeter Bruttopreis und gewählte Stadt nicht erwiesen. Dieser Identitätsnachweis ist als Kandidat für Entfernung des Quellversions-Guards in einem separaten voll synchronen Queue-Successor geeignet. Bis zum readback-bestaetigten Queue-Commit bleiben ursprüngliche Zähler und Holds unverändert.

## OFFER-ORSYS-069 — CH-spezifische Tarif- und Editionsquelle

Frozen URL: https://www.orsys.fr/suisse/formation/formation-fact-checking-information
Offizieller CH-Kurscode: https://www.orsys.fr/suisse/formation/fck (Provider-Index-Snapshot vor ca. 1 Monat).
Gleicher Kursname und eindeutig **FCK**, 3 Tage/21 Stunden, **CHF 1'640 exkl. Steuern**, digitale Session 23.11.2026 sowie neue digitale 2027er Startdaten (u.a. 18.01.2027). Die französische FCK-Seite zeigt stattdessen **EUR 1'640**; diese Euro-Tarifseite darf den CH-Sidecar-CHF-Wert nicht überschreiben. Zielgruppe ausdrücklich Journalist:innen/Redaktor:innen; keine Schweizer Präsenzsession aus Pariser Angebot abgeleitet. Neue Materialisierung NICHT nötig, bestehender CHF-Sidecar-Wert war richtig; Quelle bekräftigt Code/CH-Tarif, nicht definitiven Slot oder unbekannte MWST. Alte ausgeschriebene URL versus Codepfad bleibt ohne dokumentierte HTTP-Aliasregel ein eigener Currentness/Source-Guard.

## Abnahmegrenzen

Diese Eintragsnotiz enthält **vier positive Feldbelege**, keinen universellen Offer-Gold-PASS und keine neue Angebotszählung. Die bereits geschlossenen 116 QA09-Fälle werden nicht neu geöffnet. Referenz-Populationen 140 B2 Due, 63 historische Delivery-Review bleiben unverändert. Source-code-alias und Kursbuchung sind verschiedene Beweisziele. Im nächsten atomar konsistenten Queue-Patch dürfen nur positiv belegte Identitäts-/Preisfelder enger dieser IDs aktualisiert werden, mit Old-Value-Guard und Matrix/Backlog/Trust/Test-Readback. Insbesondere PCC-P40 ist kein vollständig veröffentlichungsbereiter Fall. PR10 bleibt Draft, kein Master/Main/Deployment/Infomaniak-Release.
