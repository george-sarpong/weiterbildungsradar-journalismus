# Media Skills – technischer Datenvertrag für Massenrecherche (B3, v1)

## Prinzip

Die **bestehenden 1’352 Angebote bleiben unverändert**. Neue Recherche wird in 250er-Microbatches als JSON geliefert und lokal geprüft. Jede Offer-ID ist stabil, eine Durchführung (Occurrence) ist ein eigenes Kindobjekt und jede Preisoption gehört zur Offer-Identität mit optionalen Kursform-Varianten. Anbieterland und **tatsächliches Durchführungsland** sind getrennt; ein deutscher Anbieter mit Schweizer Kursort darf nicht als rein deutscher Kurs behandelt werden. Eine online von CH besuchbare Schulung wird nicht ohne Nachweis als Schweizer Provider umetikettiert.

## Normale Ingest-Felder

- **Identität**: `id`, `provider.id/name/country`, `title`, `description`, `focus`, `offerType`, `level`, `languages`.
- **CH-Zugang**: `access.chEligibility = YES/CONDITIONAL/NO/UNKNOWN`, `conditions`, Quellenbeleg.
- **Kursdauer**: `learningTime.raw` als Originalwortlaut sowie `instructionDays.min/max/status` **nur bei explizit belegten Unterrichtstagen**. Nicht aus Stunden oder Kalendermonaten automatisch ableiten. 2 Kurstage ≠ 2 Tage bis zum Abschluss.
- **Durchführung**: `deliveryVariants[].id/mode/location/sourceUrl`. Orte sind **Kursorte**, keine Unternehmenssitze. Werte `IN_PERSON`, `LIVE_ONLINE`, `ON_DEMAND`, `HYBRID`; Kursort, Stadt und Land separat.
- **Termine**: `occurrences[].id/startDate/endDate/venue/availability/sourceUrl`. `OPEN` oder `SOLD_OUT` nur mit datiertem Anbieterbeleg; ansonsten `UNKNOWN`. Abgelaufene Termine bleiben archiviert, auf der Website ausgeblendet.
- **Preise**: `prices[]` mit `amountType`, Betrag/Intervall, `currency`, `tariffClass`, `eligibilityType`, `priceScope`, `billingBasis`, `taxMode`, optionaler `deliveryVariantRefs`-Zuordnung und **Quellenbeleg pro Preis**. Kein Gratispreis aus einem Mitgliedertarif ableiten.
- **Provenienz**: `source.url/checkedAt/verifiedFields`; `reviewAfter`, `reviewStatus`, `scopeDecision`.
- **Scope**: CH, DE, AT, LI, US für Anbieter- und Durchführungsland; keine automatischen Länder-Expansionen.

## Import-Pipeline (funktionsfähiges CLI)

`node scripts/catalogue-ingest-v1.cjs --input research-batch.json` prüft JSON-Struktur, Feldbelege, Fremdschlüssel, Zeitfenster, Tarife und eindeutige IDs. Ergebnis ist standardmässig **PREVIEW_ONLY**, keine Schreibmutation. `--apply` ist bewusst explizit, verlangt `--data-file`, `--sidecar-file` und `--expected-existing-offers` als optimistische Baseline-Sperre. Es ergänzt **nur neue IDs**, validiert beide erzeugten Artefakte, schreibt beide lokal mit Backups und bricht bei Duplikat oder Drift ab. Bestehende IDs/Versionen werden nicht überschrieben. Freigabe `REVIEWED + IN_SCOPE` mit feldbezogenen Quellenbelegen ist Voraussetzung für die sichtbare Angebotsschicht; andere Records erhalten `publicationStatus=HOLD`.

Das Kommando ändert **kein Google-Drive-Master, GitHub-main oder die gehostete Website**. Veröffentlichung, Nacharbeiten an Quellen und Merge bleiben gesonderte Gates. Ausführen nur mit projektdefiniertem Single Writer, nicht parallel mit anderen schreibenden Importen.

## Testfall der Produktsuche

Gespeicherter Kurs: **Datenjournalismus, CHF 750, 2 Kurstage**, Quelle geprüft, CH-Zugang belegt, nächster Termin separat geführt. Anfrage «Datenjournalismus, Budget CHF 800, ca. 2 Tage» → Budget/Schwerpunkt/Unterrichtstage können gemeinsam positiv geprüft werden. Ist eine Dimension unklar, gehört das Angebot als gekennzeichnete Alternative dazu, nicht als sicherer Treffer.

`tests/fixtures/b3-import-demo.json` ist **synthetische Testware**, kein reales veröffentlichbares Kursangebot und wird niemals in den 1’352er Bestand materialisiert. Der automatische Test materialisiert ausschliesslich in ein temporäres Testverzeichnis.

## Weiterer technischer Ausbau

Der v1-Adapter erhält die bestehende `data.js`-/Sidecar-Darstellung. Beim Übergang zu einem serverbasierten Backend wird die API aus den typisierten Provider-, Offer-, Occurrence-, Price- und Evidence-Entitäten generiert, ohne die Suchlogik neu zu schreiben. Für künftige Quellenfunde pro Provider eine Batchdatei und ein konsolidiertes atomisches Writer-Commit; Nutzeroberfläche liest weiterhin allein validierte Angebote.

Nicht gelöst durch diesen Importvertrag: alle vorbestehenden Freitextfelder der 1’352 Angebote automatisch auf Gold-Niveau normalisieren, neue API/Backend, Hosted E5/G3, geografische Suchanfragen oder tatsächliche Platzverfügbarkeit.
