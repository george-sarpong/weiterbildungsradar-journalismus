# Weiterbildungsradar Journalismus – Web-MVP V6.3

Statische Website für GitHub Pages. V6.3 baut kontrolliert auf V6.2 auf und verbessert Navigation, Teilbarkeit und redaktionelle Wartung. Die Website bleibt ein nicht kommerzieller Pilot.

## Neu in V6.3

- Sortierung: Redaktionelle Auswahl, Nächster Start, Zuletzt geprüft, Anbieter A–Z
- Such- und Filterzustände werden als URL-Parameter gespeichert und können geteilt werden
- ungültige URL-Parameter werden ignoriert
- Filter zurücksetzen setzt auch Sortierung und URL auf den Ausgangszustand zurück
- internes Feld `reviewAfter` für die nächste redaktionelle Kontrolle jedes Angebots
- `reviewAfter` wird nicht auf den öffentlichen Angebotskarten angezeigt

## URL-Parameter

- `q` – Suchbegriff
- `focus` – Berufsbezug
- `type` – Angebotsart
- `price` – Preiskategorie
- `format` – Durchführungsform
- `language` – Sprache
- `country` – Anbieterbasis
- `level` – Erfahrungsniveau
- `sort` – Sortierung

Favoriten bleiben bewusst lokal im Browser und werden nicht über die URL geteilt.

## Regel für `reviewAfter`

- Angebote mit konkretem Starttermin: 21 Tage vor Start
- Studium/CAS ohne konkretes Startdatum: 120 Tage nach letzter Prüfung
- Start oder Preis auf Anfrage: 90 Tage nach letzter Prüfung
- dauerhaft verfügbare bzw. On-demand-Angebote: 180 Tage nach letzter Prüfung

Die bestehende automatische Ausblendung einmaliger Angebote anhand von `endDate` bleibt unverändert.

## Aus V6.2 weiterhin enthalten

- 22 redaktionell geprüfte Angebote
- strukturierte Kartenfelder für Preis, Durchführungsform, Dauer und Start
- acht Such- und Filterdimensionen
- Favoriten im lokalen Browserspeicher
- automatische Ausblendung abgelaufener Einmalangebote
- Methodik, Impressum, Datenschutz, robots.txt, Sitemap und 404-Seite

## Datenregeln

- Preisangaben werden in der veröffentlichten Währung wiedergegeben und nicht umgerechnet.
- Bei mehreren Zielgruppen-, Mitglieder- oder Unterkunftstarifen steht das Angebot unter «Mehrere Tarife».
- Fehlende Angaben werden nicht geschätzt; die Karte zeigt «nicht publiziert» oder «Preis auf Anfrage».
- Land bezeichnet die Anbieterbasis. Schweizer Anbieter erhalten zusätzlich Deutschschweiz oder Romandie.
- Einmalangebote mit abgelaufenem Enddatum werden automatisch ausgeblendet.

## Vor öffentlicher Lancierung noch zu erledigen

1. Beide Projekt-E-Mail-Adressen technisch einrichten und testen.
2. In `datenschutz.html` den tatsächlich eingesetzten E-Mail-Dienstleister und allfällige Auslandbearbeitungen ergänzen.
3. Sechs unterschiedlich gelagerte Einträge unabhängig zweitprüfen.
4. Tastatur-, Mobil-, Kontrast- und Screenreader-Test durchführen.
5. Kleinen Usability-Test mit 5–8 Medienschaffenden durchführen.
6. Vor Umstellung auf `mediaskills.ch` Canonical-URLs, Open-Graph-URL, Sitemap, robots.txt und GitHub-Pages-Domain gemeinsam umstellen.
7. Rechtstexte erneut prüfen, bevor Werbung, bezahlte Partnerschaften, Newsletter, Nutzerkonten, Kontaktformulare oder eigene kostenpflichtige Leistungen aktiviert werden.

## Dateien

- `index.html` – Hauptseite
- `styles.css` – Gestaltung und Responsive Design
- `data.js` – 22 redaktionell geprüfte Angebote mit Vergleichs- und Prüffeldern
- `app.js` – Suche, Filter, Sortierung, teilbare URLs, Favoriten, Ablaufregel und Darstellung
- `methodik.html` – Auswahlkriterien und Prüfprozess
- `impressum.html` – Betreiberangaben und redaktionelle Hinweise
- `datenschutz.html` – Datenschutz für den aktuellen technischen Pilotstand
- `404.html` – Fehlerseite
- `robots.txt` – Suchmaschinenhinweis
- `sitemap.xml` – indexierbare Haupt- und Methodikseite

## Datenschutz-Hinweis

Der eigene Website-Code setzt keine Analyse- oder Werbetracker ein. Favoriten werden ausschliesslich im lokalen Browserspeicher (`localStorage`) des jeweiligen Geräts gespeichert. GitHub Pages protokolliert beim Seitenaufruf nach eigenen Angaben IP-Adressen zu Sicherheitszwecken.

Die Rechtstexte bilden den dokumentierten technischen Stand ab, ersetzen aber keine individuelle Rechtsberatung.
