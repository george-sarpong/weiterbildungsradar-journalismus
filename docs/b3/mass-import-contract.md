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

`node scripts/catalogue-ingest-v1.cjs --input research-batch.json` prüft JSON-Struktur, Feldbelege, Fremdschlüssel, Zeitfenster, Tarife und eindeutige IDs. Ergebnis ist standardmässig **PREVIEW_ONLY**, keine Schreibmutation. `--apply` ist bewusst explizit, verlangt `--data-file`, `--sidecar-file` und `--expected-existing-offers` und die beiden obligatorischen `--expected-data-sha256`/`--expected-sidecar-sha256` als Baseline-Sperren. Es ergänzt **nur neue IDs**, validiert beide erzeugten Artefakte, schreibt beide lokal mit Backups und bricht bei Duplikat oder Drift ab. Bestehende IDs/Versionen werden nicht überschrieben. `REVIEWED + IN_SCOPE` mit feldbezogenen Quellenbelegen bescheinigt nur die Import-Vorprüfung. **Alle neuen importierten Records erhalten zunächst `publicationStatus=HOLD`**, auch bei vollständigem Quellenreview. Der separate Owner-/E4-/E5-Release-Prozess muss vor jeder Website-Sichtbarkeit ausdrücklich freigeben; das CLI entsperrt keine neuen Angebote.

Das Kommando ändert **kein Google-Drive-Master, GitHub-main oder die gehostete Website**. Veröffentlichung, Nacharbeiten an Quellen und Merge bleiben gesonderte Gates. Ausführen nur mit projektdefiniertem Single Writer, nicht parallel mit anderen schreibenden Importen.

## Testfall der Produktsuche

Gespeicherter Kurs: **Datenjournalismus, CHF 750, 2 Kurstage**, Quelle geprüft, CH-Zugang belegt, nächster Termin separat geführt. Anfrage «Datenjournalismus, Budget CHF 800, ca. 2 Tage» → Budget/Schwerpunkt/Unterrichtstage können gemeinsam positiv geprüft werden. Ist eine Dimension unklar, gehört das Angebot als gekennzeichnete Alternative dazu, nicht als sicherer Treffer.

`tests/fixtures/b3-import-demo.json` ist **synthetische Testware**, kein reales veröffentlichbares Kursangebot und wird niemals in den 1’352er Bestand materialisiert. Der automatische Test materialisiert ausschliesslich in ein temporäres Testverzeichnis.

## Weiterer technischer Ausbau

Der v1-Adapter erhält die bestehende `data.js`-/Sidecar-Darstellung. Beim Übergang zu einem serverbasierten Backend wird die API aus den typisierten Provider-, Offer-, Occurrence-, Price- und Evidence-Entitäten generiert, ohne die Suchlogik neu zu schreiben. Für künftige Quellenfunde pro Provider eine Batchdatei und ein konsolidiertes atomisches Writer-Commit; Nutzeroberfläche liest weiterhin allein validierte Angebote.

## Quellengesicherte Aktualisierung bestehender Angebote (B3 Refresh, 07.11.2026)

Auch bestehende Stable Offers können inzwischen ohne Neuanlage und ohne automatischen Release aktualisiert werden:

`node scripts/catalogue-refresh-v1.cjs --input verified-existing-batch.json --data-file data.js --sidecar-file smart-search-data.js --expected-existing-offers 1352`

Das ist standardmässig **PREVIEW_ONLY**. Für einen lokalen Draft-Write müssen zusätzlich `--apply` sowie die **vorher verifizierten** `--expected-data-sha256` und `--expected-sidecar-sha256` gesetzt sein. Nur bereits existierende Offer-IDs sind zulässig. Das neue B3-Batch muss vollständig quellengeprüft sein; stabiler Anbietername und Angebotstitel bleiben ohne gesonderte Owner-Freigabe unverändert. Frühere Occurrences werden nicht gelöscht. Eine vollständig leer übergebene Preisliste kann vorhandene Preisoptionen nicht still entfernen. Der Writer erhält alle unberührten `data.js`-Angebotsobjekte bytegleich und prüft beide neuen Dateien nach einem lokalen Schreiben. Der aktualisierte Datensatz erhält **publicationStatus=HOLD** und erfordert vor Live-Übernahme weiterhin die separate Owner-/E4-/E5-Freigabe.

Der synthetische End-to-End-Test `node tests/b3-refresh-existing-20261107.test.cjs` prüft Preview ohne Mutation, geänderten Preis, einen zusätzlichen Termin, Erhalt früherer Termine, nicht berührte Fremdzeilen, abgewiesene Identitätswechsel, Quellenregression und veraltete Hash-Leases. **Das ist keine Bestätigung eines produktiven Drive-Master-Updates.**

Nicht gelöst durch diesen Datenvertrag: alle vorbestehenden Freitextfelder der 1’352 Angebote automatisch auf Gold-Niveau normalisieren, neue API/Backend, Hosted E5/G3, geografische Suchanfragen oder tatsächliche Platzverfügbarkeit. Ebenso fehlt noch die freigegebene Übertragung eines lokal geprüften Refreshs in den autoritativen Drive-Master.

### Zusätzliche Datenintegrität

Der Import verwirft nicht nur doppelte Offer-IDs, sondern auch dieselbe normalisierte **Provider-/Titel-Identität** unter einer anderen ID; spätere Kurstermine müssen als Occurrences derselben Offer-Familie erfasst werden. Unbekannte Eingabefelder sind Fehler, keine still ignorierten Angaben. Für einen Write müssen die SHA-256-Prüfsummen **beider** Eingangsdatenbestände mit den vorab gelesenene Prüfsummen übereinstimmen; fehlt ein Lease oder stimmt er nicht, wird ohne Mutation abgebrochen. Nach lokalem Apply ist ein separater Git-Commit und CI-/Drive-Readback weiterhin Pflicht.
