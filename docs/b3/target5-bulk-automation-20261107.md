# TARGET5 – automatisierter Bulk-Lauf (Draft PR10)

**Keine neue Ontologie, keine automatische Veröffentlichung.** Dieser Ablauf baut auf den bestehenden B3-Import-/Refresh- und B4-Suchmodellen auf.

`node scripts/target5-bulk-preview-v1.cjs --out out/target5-preview` verarbeitet in einem deterministischen CI-Lauf:
- 1’352 CH/AT/LI-Katalogangebote samt typisierter Suchsicht und Sidecar;
- 111 DE- und 2’355 USA-Owner-Publikationszeilen als **nicht freigegebenes Staging**;
- 140 aktive B2-Website-Gold-Holds und deren Quellen-/Feldentscheidungen.

Die Ausgabe umfasst `manifest.json` mit SHA-256-Eingabeprüfsummen, `catalogue-search-view.json`, `owner-market-roster.json`, `source-workpacks.json`, einen statischen HTML-Index und 1’352 **noindex**-Angebotsvorschauen. Quelle/Preis/Ort/Zugang werden nicht erfunden; Course-Instanzen, freie Plätze und vollständige Gebühren werden nicht ohne Beleg behauptet.

Die 140 Review-Fälle werden automatisch nach offizieller Quellendomain gruppiert (im ersten Lauf 25 Pakete). Ein Anbieter kann so mit einer zusammenhängenden Recherchewelle bearbeitet werden. Bekannte Evidenz bleibt erhalten. Der Quellen-Snapshot wird nur beim expliziten GitHub-Commit-Marker `[source-snapshot]` ausgeführt; er lädt nach Domain gruppierte Anbieter-URLs begrenzt parallel und legt HTTP-Status, kanonische URL, Hash sowie Preis-/Datums-/JSON-LD-**Signale** im separaten CI-Artefakt ab. Diese Signale sind **keine verifizierten Feldwerte** und setzen keine Holds zurück.

Alle Runs erzeugen GitHub Actions Artefakte: `target5-review-preview` und bei explizitem Snapshot `target5-official-source-signals`. Quellensignale müssen vor einer Änderung anhand des vorhandenen Provider-/Feldkontrakts geprüft werden. Freigegebene B3-Pakete können über die bestehenden add-only-/Refresh-Schreiber verarbeitet werden. Für einen produktiven Drive-Masterwrite, Main-Merge oder Website-Deploy ist weiterhin die separate Owner-/Release-Gate-Freigabe notwendig.

**Tests:** `node tests/target5-bulk-preview-20261107.test.cjs`; `node tests/target5-source-snapshot-20261107.test.cjs`. Die PR-CI führt beides automatisch aus. Nicht über die prüfbaren Daten hinaus behaupten: 3’818 Quellen-/Katalogzeilen sind nicht 3’818 Website-Gold-Angebote.
