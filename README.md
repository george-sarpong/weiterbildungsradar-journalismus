# Weiterbildungsradar Journalismus – Web-MVP V6.2

Statische Website für GitHub Pages. V6.2 verbessert die Vergleichbarkeit der 22 redaktionell geprüften Angebote. Die Website bleibt ein nicht kommerzieller Pilot.

## Neu in V6.2

- strukturierte Kartenfelder für Preis, Durchführungsform, Dauer und Start
- Preisfilter mit den Kategorien Kostenlos, Bis 500, 501 bis 2'000, Über 2'000, Mehrere Tarife und Preis auf Anfrage
- Filter für PRÄSENZ, ONLINE LIVE, ONLINE SELBSTLERNEN und HYBRID
- saubere Trennung von Land, Schweizer Sprachregion und Kurssprache
- Erfahrungsniveau bereinigt: Einstieg, Berufserfahrung, verschiedene Niveaus
- Rückkanal per E-Mail für Fehler und fehlende Angebote
- automatische Ausblendung abgelaufener Einmalangebote anhand des Enddatums
- Methodik um Vergleichsdaten, Tarife, Regionen und Aktualisierungsregel ergänzt
- Daten- und Prüfstand auf 6. August 2026 aktualisiert

## Datenregeln

- Preisangaben werden in der veröffentlichten Währung wiedergegeben und nicht umgerechnet.
- Bei mehreren Zielgruppen-, Mitglieder- oder Unterkunftstarifen steht das Angebot unter «Mehrere Tarife».
- Fehlende Angaben werden nicht geschätzt; die Karte zeigt «nicht publiziert» oder «Preis auf Anfrage».
- Land bezeichnet die Anbieterbasis. Schweizer Anbieter erhalten zusätzlich die Angabe Deutschschweiz oder Romandie.
- Einmalangebote mit abgelaufenem Enddatum werden automatisch ausgeblendet.

## Vor öffentlicher Lancierung noch zu erledigen

1. Beide Projekt-E-Mail-Adressen technisch einrichten und testen.
2. In `datenschutz.html` beim Abschnitt «Kontakt per E-Mail» den tatsächlich eingesetzten E-Mail-Dienstleister, die relevanten Verarbeitungsstaaten und allfällige Garantien ergänzen.
3. Sechs unterschiedlich gelagerte Einträge durch eine unabhängige Person stichprobenweise zweitprüfen.
4. Tastatur-, Mobil-, Kontrast- und Screenreader-Test durchführen.
5. Nach Festlegung der eigenen Domain Canonical-URLs, Open-Graph-URL, Sitemap und `robots.txt` anpassen.
6. Rechtstexte erneut prüfen, bevor Werbung, bezahlte Partnerschaften, Newsletter, Nutzerkonten, Kontaktformulare oder eigene kostenpflichtige Leistungen aktiviert werden.

## Dateien

- `index.html` – Hauptseite
- `styles.css` – Gestaltung und Responsive Design
- `data.js` – 22 redaktionell geprüfte Angebote mit Vergleichsfeldern
- `app.js` – Suche, Filter, Favoriten, Ablaufregel und Darstellung
- `methodik.html` – Auswahlkriterien und Prüfprozess
- `impressum.html` – Betreiberangaben und redaktionelle Hinweise
- `datenschutz.html` – Datenschutz für den aktuellen technischen Pilotstand
- `404.html` – Fehlerseite
- `robots.txt` – Suchmaschinenhinweis
- `sitemap.xml` – indexierbare Haupt- und Methodikseite

## Datenschutz-Hinweis

Der eigene Website-Code setzt keine Analyse- oder Werbetracker ein. Favoriten werden ausschliesslich im lokalen Browserspeicher (`localStorage`) des jeweiligen Geräts gespeichert. GitHub Pages protokolliert beim Seitenaufruf nach eigenen Angaben IP-Adressen zu Sicherheitszwecken.

Die Rechtstexte bilden den dokumentierten technischen Stand ab, ersetzen aber keine individuelle Rechtsberatung.
