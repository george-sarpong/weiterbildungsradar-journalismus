# Weiterbildungsradar Journalismus – Web-MVP V1

Dieses Paket enthält eine statische Website mit 22 redaktionell freigegebenen Weiterbildungsangeboten. Die internen Google-Sheets-Daten werden nicht veröffentlicht.

## Eigentum und Partnerhinweis

Das Weiterbildungsradar Journalismus ist ein eigenständiges Projekt von George Sarpong.
Der SFJ ist Partner des Piloten 2026 und nicht Eigentümer des Produkts, des Repositorys,
des Codes oder des Datenmodells.

Der Partnerhinweis kann später entfernt werden, ohne Repository oder Produktnamen zu ändern.
SFJ-Name und -Logo dürfen nur im vereinbarten Umfang verwendet werden.

## Dateien
- `index.html` – Seitenstruktur
- `styles.css` – Gestaltung und responsive Darstellung
- `data.js` – freigegebener öffentlicher Datenbestand
- `app.js` – Suche und Filter
- `404.html` – einfache Fehlerseite

## Lokal ansehen
Die Datei `index.html` kann direkt im Browser geöffnet werden.

## Auf GitHub Pages veröffentlichen
1. Neues öffentliches Repository anlegen, zum Beispiel `weiterbildungsradar-journalismus`.
2. Alle Dateien aus diesem Ordner in die oberste Ebene des Repositorys laden.
3. In **Settings → Pages** als Quelle den Branch `main` und den Ordner `/root` wählen.
4. Nach dem ersten Test kann später eine eigene Subdomain verbunden werden.

## Aktualisierung
Nur nach menschlicher Freigabe: `PUBLIC_EXPORT_V1` prüfen, `data.js` ersetzen, Änderungen in GitHub speichern, Veröffentlichung kontrollieren und den öffentlichen Status im Produktionssheet nachführen.

## Nicht enthalten
Historische Angebote, Nutzerkonten, Tracking, Live-Verbindung zum internen Google Sheet und automatische Veröffentlichung.
