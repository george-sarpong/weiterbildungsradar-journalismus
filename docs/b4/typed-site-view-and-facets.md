# B4 – Bestehenden Datenbestand als typisierte Suchsicht verwenden

**Datum:** 05.11.2026. **Autorität:** Drive Band02 EVT213, GitHub PR10 Draft. **Keine Angebotsrecherche.**

Der Katalog mit 1’352 Stable-Offer-IDs bleibt unverändert. `offer-search-view-v1.js` erzeugt beim Laden eine identitätsgesicherte, typisierte, read-only-Suchsicht aus `data.js`, `smart-search-data.js` und `duration-model.js`. Es gibt weder neue Offer-IDs noch verdeckte Korrekturen an Quellen, Preis, Sprache oder Ort.

**Kernprinzip:** Der vorhandene Originaltext bleibt anzeige- und archivfähig; für sichere Filter wird ein feldbezogener Evidenzstatus separat geführt. Aus `access`-Freitext entsteht **kein** bestätigter CH-Zugang. Aus `region`-Freitext entsteht **kein** überprüfter Kursort. Erst `sourceEvidence.verifiedFields` und `accessModel` erlauben positive Zugangsfacetten; erst `deliveryLocations[].status=VERIFIED` plus echte Provider-Quelle erlauben Ortsfacetten. Hersteller-/PR-OUT und Owner-Freeze bleiben unverändert.

**Neue Website-Filter:** CH-Zugang belegt/bedingt/unbekannt, belegter Präsenz-Kursort nach Stadt. Statuswerte sind sichtbar voneinander getrennt; unbekannte Altangaben sind nicht als fehlerhaft deklariert. Die Ortsauswahl wird nur aktiviert, wenn tatsächlich verifizierte Städte vorhanden sind. Standard-Suche, bestehende Filter, Favoriten und URLs bleiben erhalten; `access` und `venue` können als URL-Parameter geteilt werden.

**Natürlichsprachliche Suche:** Formulierungen «aus der Schweiz» oder «von der Schweiz aus» aktivieren die CH-Zugangsklausel; nur feldbezogen bestätigte YES-Datensätze werden direkt passend, unstrukturierte alte Angaben können als beschriftete mögliche Alternativen erscheinen. CHF 800 + Datenjournalismus + zwei Kurstage funktioniert weiter; ein ungesicherter Anbieterpreis oder eine zu lange Kursdauer wird nicht als sicher direkt passend ausgegeben.

**Import-Adapter:** `scripts/catalogue-ingest-v1.cjs` materialisiert für neue positive Ingest-Angebote die verifizierten Durchführungsorte als `deliveryLocations`. Providerland, Kursortland und Online-Zugang bleiben ausdrücklich getrennte Begriffe. Preis- und Kursformoptionen bleiben im Sidecar. HOLD-Einträge dürfen nie allein durch eine Ortsangabe als VERIFIED erscheinen. Der Import selbst bleibt add-only, mit SHA-256-Gates und ohne Master-Merge.

**QA:** `node scripts/audit-site-view-v1.cjs` liefert reproduzierbare Bestandszahlen plus SHA-256 der unveränderten Quelldateien. `node tests/b4-typed-view-20261105.test.cjs` prüft 1’352/325/Sidecar-Join, konservative UNKNOWN-Werte, synthetischen aus CH buchbaren Kurs in Basel als positives Beispiel, Preis-/Dauerkompatibilität, ID-Collision und Originalhashes. GitHub-Chromium testet Filterbedienung und URL-Synchronisation.

**Nächste echte Baustellen:** Validierung des vollständigen Datenvertrags gegen massive neue Provider-Batches mit unterschiedlichen Tarifen und Orts-/Variantenfamilien; Import-Performance und externe Quellevidence; normalisierte Quellstruktur für ältere Einträge nur dann, wenn echte Suchfunktionen die Felder brauchen. Gehostetes E5/G3 separat freizugeben, kein stiller Merge.

**Wichtige Grenze:** Es ist eine typisierte *Sicht*, keine nachträglich bewiesene Website-Gold-Normalisierung aller alten 1’352 Offers. 1352 UNKNOWN-CH-Access bei Altangeboten ist konservativer Stand im strukturierten Modell, **nicht** eine Behauptung, dass die Teilnahme tatsächlich unmöglich sei.
