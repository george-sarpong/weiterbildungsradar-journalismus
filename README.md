# Weiterbildungsradar Journalismus – Web-MVP V5

Statische Website für GitHub Pages.

## Neu in V5

- Favoritenherz auf jeder Angebotskarte
- lokale Speicherung der Favoriten im Browser (`localStorage`)
- Anzeige der Favoritenzahl
- Umschalter «Nur Favoriten»
- passende Leerzustände für Favoriten und Filter
- sichtbarer Filterstatus und deaktivierter Reset ohne aktive Filter
- Tastatur- und Screenreader-taugliche Favoritenbuttons
- mobile Anpassungen für die neuen Bedienelemente

## Dateien

- `index.html` – Seitenstruktur und Metadaten
- `styles.css` – Gestaltung und Responsive Design
- `data.js` – 22 redaktionell geprüfte Angebote
- `app.js` – Suche, Filter, Favoriten und Darstellung
- `404.html` – Fehlerseite für GitHub Pages
- `robots.txt` – Suchmaschinenhinweis

## Veröffentlichung

Alle Dateien müssen direkt im Stammverzeichnis des GitHub-Repositorys liegen. GitHub Pages kann anschliessend wie bisher aus dem Branch `main` veröffentlicht werden.

## Datenschutz-Hinweis zu Favoriten

Favoriten werden ausschliesslich im Browser des jeweiligen Geräts gespeichert. Es werden keine Favoritendaten an einen Server übertragen. Beim Löschen der Browserdaten können die Favoriten verloren gehen.
