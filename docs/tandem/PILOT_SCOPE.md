# MODEL_ADVERSARIAL_AUDIT — Media Skills, Pilot TND-001

**Status:** einmaliger technischer Reviewer-Pilot. Kein laufender Projektauftrag, keine Auto-Review-Pflicht. **READ-ONLY**.

## Codebasis und Durchführung

- Öffentliches Repo: `george-sarpong/weiterbildungsradar-journalismus`.
- Zu prüfender **Website-Code-Snapshot**: `10c59436155f1f94ef054f2a7d277be171c2c215` (R2_138). Neuere Commits auf PR10 betreffen bislang nur Review-Dokumentation; zuerst SHA und Dateidiffs prüfen.
- Review durch Claude in einer Sitzung mit Terminal: öffentlich über HTTPS klonen, ohne GitHub-Credentials, den Code-SHA auschecken. **Nicht** automatisch den ganzen PR mit 46 Commits prüfen.
- Branch-Root `REVIEW_SCOPE.md` ist **SUPERSEDED** und ein historischer MS-32-Auftrag, kein neuer Arbeitsauftrag.
- Kein Git-Push, kein PR-Kommentar, kein Merge, kein Deploy, keine Recherchen zu den alten 116 Angeboten, kein erneuter Gesamtcheck.

```sh
git clone --filter=blob:none https://github.com/george-sarpong/weiterbildungsradar-journalismus.git
cd weiterbildungsradar-journalismus
git checkout --detach 10c59436155f1f94ef054f2a7d277be171c2c215
git rev-parse HEAD
```

**Vorbedingung:** Claude-Umgebung ohne GitHub-Schreib-Credentials verwenden. Git-Clone ist nur hinsichtlich des Remote-Pushs read-only; lokal kann ein Agent Dateien ändern. Deshalb keine geheimen Schlüssel oder Bereitstellungsrechte an die Sitzung geben.

## Zwei eng begrenzte Aufgaben

**K1 – Kontrollfall (Kalibrierung).** Prüfe Preisgül­tigkeits- und Datumsgrenzfälle in `app.js` und ihrer Absicherung in `.github/workflows/hosted-search-qa.yml`. Finde durch eigene Codeanalyse mindestens einen reproduzierbaren, relevanten Grenzfall – oder erkläre, warum keiner belegt ist. Keine Anbieter- oder Katalogdaten-Discovery. Nur Korrektheitsprüfung, kein Patch.

**B1 – Gegenprobe mit bestehender CI als Nullhypothese.** Prüfe nur die Katalog-Pagination und die Standardsortierung im Delta `9719ba5f2ed6122b57b83911c5b0f0e0bae367b7^..10c59436155f1f94ef054f2a7d277be171c2c215` (Schwerpunkte `app.js`, `index.html`, `methodik.html`, relevanter Workflow-Test). Suche **neue** material prüfbare Defekte, die vorhandene Tests nicht erfassen. Nicht jede alte PR10-Funktion nochmals bewerten. Wenn nichts Neues reproduzierbar ist, lautet das Ergebnis **NO_NEW_CONFIRMED_FINDINGS**.

**Messhinweis:** Der Code und die frühere Gegenprüfung sind mindestens teilweise bereits in Claude-Kontexten diskutiert. B1 ist deshalb **kein strikt blindes Experiment**. Gegenhypothese: die vorhandene ChatGPT+CI-Abdeckung genügt; Claude muss einen klaren zusätzlichen, bestätigten Befund liefern, um die Zusatzkosten im Einzelfall zu rechtfertigen.

## Ergebnisvertrag (max. 1’500 Wörter)

Pro Finding: `ID | CONFIRMED / RISK / DESIGN_CHOICE / DUPLICATE | Severity | filename:lines@SHA | erwartetes vs. tatsächliches Verhalten | reproduzierbarer Test | aktuelle Daten betroffen: ja/nein/unbekannt | zusätzliche CI-Abdeckung`. Keine Befunde ohne nachvollziehbare Reproduktion als CONFIRMED deklarieren.

Am Ende: Kontrollfall gefunden ja/nein; **neue** bestätigte B1-Findings; False Positives; nötige Nutzeraktionen/Copy-Paste; geschätzter bzw. beobachteter Token-/Zeitverbrauch (nur wenn messbar). Resultate nach Möglichkeit als **ein separates Google-Drive-Dokument** speichern, nicht diesen Scope überschreiben. Kein weiterer Architekturbericht und keine Gegen-Gegenprüfung vor Pilotabschluss.

**Pilot-Stopp:** Neuere funktionale Git-Änderung, fehlende Basis, nicht vorhandener Terminalzugriff, unerwarteter Authentifizierungsbedarf, unerlaubter Schreibversuch oder Scope-Expansion: stoppen und Sachverhalt kurz melden.
