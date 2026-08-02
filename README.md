# Weiterbildungsradar Journalismus – Web-MVP V2

**Können, was kommt.**

Dieses Paket enthält eine statische Website mit 22 redaktionell freigegebenen Weiterbildungsangeboten für Journalistinnen, Journalisten und Medienschaffende. Die Auswahl wird aus der Schweiz kuratiert und umfasst auch internationale Angebote. Interne Google-Sheets-Arbeitsdaten werden nicht veröffentlicht.

## Projekt

Der Weiterbildungsradar Journalismus ist ein eigenständiges redaktionelles Projekt von George Sarpong. Jedes veröffentlichte Angebot verweist auf eine offizielle Quelle und trägt ein Prüfdatum. Termine, Preise und Buchbarkeit sind vor der Anmeldung nochmals auf der Angebotsseite zu kontrollieren.

## Dateien

- `index.html` – Seitenstruktur, sichtbare Texte sowie SEO-/GEO-Metadaten
- `styles.css` – Gestaltung und responsive Darstellung
- `data.js` – freigegebener öffentlicher Datenbestand
- `app.js` – Suche, Filter und Datumsanzeige
- `404.html` – Fehlerseite
- `robots.txt` – Freigabe für Suchmaschinen

## Lokal ansehen

Die Datei `index.html` kann direkt im Browser geöffnet werden.

## Auf GitHub Pages veröffentlichen

1. Alle Dateien in die oberste Ebene des Repositorys `weiterbildungsradar-journalismus` laden.
2. In **Settings → Pages** unter **Build and deployment** die Quelle **Deploy from a branch** wählen.
3. Branch **main** und Ordner **/(root)** auswählen und speichern.
4. Die veröffentlichte Website vollständig testen, bevor sie aktiv beworben wird.

## Aktualisierung

Nur nach menschlicher Freigabe: öffentlichen Export prüfen, `data.js` ersetzen, Änderung committen, Website kontrollieren und den Publikationsstatus im Produktionssystem nachführen.

## Nicht enthalten

Historische Angebote, Nutzerkonten, Tracking, eine Live-Verbindung zum internen Google Sheet und automatische Veröffentlichung.
