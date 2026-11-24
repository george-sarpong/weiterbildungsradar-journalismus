# P31 zweiter Durchgang – Anleitung für Lese-Agenten (E266–E268, E272)

Du liest Anbieterseiten von Weiterbildungskursen und trägst fehlende Angaben zusammen. Stichtag 2026-11-24. Genauigkeit vor Vollständigkeit: lieber «NICHT_AUF_SEITE» als raten. Nichts erfinden (E031).

## Eingabe
`paket_bN.jsonl`: eine Zeile je Seite: `url`, `angebote` (ID → `titel`, `anbieter`, `kurslink_katalog` (bisheriger Kurslink im Katalog), `fall` (DEFEKT, UEBERSICHT, KURS_WEG, NICHT_LESBAR), `luecken`: Feld → heutiger Katalogwert). Nur die Felder unter `luecken` sind gesucht.

## Vorgehen je Seite
1. **Keine Web-Abrufe.** Der Text jeder Seite liegt schon lokal in `texte_bN.jsonl` (gleicher Ordner) (gleiche Reihenfolge wie das Paket): `http`, `ziel` (nach Weiterleitung), `fehler`, `volltext` mit `titel`, `h1`, `text` (Haupttext, höchstens 40000 Zeichen), `strukturiert` (schema.org-Werte wie startDate, price) und `quelltext_daten` (Datumsangaben aus dem Quelltext, z. B. Terminlisten). `volltext` = null heisst: Seite nicht gelesen (defekt, gesperrt, Zeitüberschreitung) → `seite` NICHT_LESBAR bzw. DEFEKT (http 4xx). Lies die Datei mit dem Read-Werkzeug.
   Frage dich je Kurs: alle künftigen Termine (Start, Ende, Ort), Preise mit Währung und Tarif (regulär, Mitglieder, Journalist:innen …, inkl./zzgl. MWST), Dauer, Durchführungsort, Kursform, Kurssprache, Niveau – je Angabe ein kurzes wörtliches Zitat. Steht etwas nicht da: NICHT_AUF_SEITE. Ist der Kurs nicht mehr im Angebot oder führt der Link auf eine Übersicht, ohne dass der Kurs dort steht: `seite` KURS_WEG bzw. UEBERSICHT.
2. Bei mehreren Angeboten auf derselben Seite (Übersichtsseite): Werte nur übernehmen, wenn sie eindeutig zu genau diesem Kurs gehören.
3. Fehlerseite, 404, Login, leere Seite: `seite` = `NICHT_LESBAR` oder `DEFEKT`, keine Werte.
4. Nur Angaben aus dem lokalen Seitentext. Kein Wissen aus dem Gedächtnis. Die Seitentexte nicht kopieren oder weitergeben; nur Werte und kurze Zitate ins Ergebnis.

## Nachfolgeseite prüfen (neu im zweiten Durchgang)
Bei `fall` DEFEKT, UEBERSICHT oder KURS_WEG ist die Seite ein **Kandidat** für die neue Adresse des Kurses. Setze je Angebot `"gleicher_kurs": true` nur, wenn die Seite eindeutig genau diesen Kurs desselben Anbieters beschreibt (gleicher oder fast gleicher Titel im Seitentitel/h1, gleicher Inhalt), mit `"titel_zitat"` (wörtlich, ≤ 15 Wörter). Sonst `"gleicher_kurs": false` und keine weiteren Felder für dieses Angebot. Ein anderer Kurs mit ähnlichem Thema ist **nicht** derselbe Kurs. Bei `fall` NICHT_LESBAR ist die Seite der bisherige Kurslink; dort `gleicher_kurs` weglassen.
Die Seitenangabe `seite` gilt für die Seite; ist sie eine Kursseite eines anderen Kurses, `seite` = OK und `gleicher_kurs` false.

## Werte (nur diese Formen)
- `termin`: `status` GEFUNDEN | AUF_ANFRAGE (Seite sagt ausdrücklich auf Anfrage/jederzeit/nach Vereinbarung/laufend, E268) | NICHT_AUF_SEITE | NUR_VERGANGEN; `termine`: Liste `{"start":"JJJJ-MM-TT","ende":"JJJJ-MM-TT" oder null,"ort":"…" oder null}`, nur Start ≥ 2026-11-24, höchstens 8, aufsteigend.
- `preis`: `status` GEFUNDEN | KOSTENLOS | AUF_ANFRAGE | NICHT_AUF_SEITE; `tarife`: Liste `{"betrag":Zahl,"waehrung":"CHF|EUR|USD","art":"REGULAER|BEDINGT","bezeichnung":"z. B. Mitglieder" oder null,"mwst":"INKL|ZZGL|UNBEKANNT"}`. Nur Kursgebühr (keine Gutscheine, Rabattbeträge, Spenden, Einzelmodule anderer Kurse).
- `dauer`: `wert` kurz auf Deutsch wie «2 Tage (14 Std.)», «3 Abende à 3 Std.», «6 Monate»; nicht Fristen («4 Wochen vor Kursbeginn»).
- `ort`: `wert` Ort(e) auf Deutsch («Zürich», «Genf», «Online»), `land` ISO-Code (CH, AT, LI, DE …) oder null bei nur Online.
- `kursform`: `wert` Liste aus PRÄSENZ, ONLINE LIVE, ONLINE SELBSTLERNEN, HYBRID.
- `sprache`: `wert` Liste aus DE, FR, IT, EN (Kurssprache, nicht Sprache der Website).
- `niveau`: `wert` eines von EINSTIEG, VERTIEFUNG, FORTGESCHRITTEN, BERUFSERFAHRUNG, VERSCHIEDENE_NIVEAUS – nur wenn die Seite es ausdrücklich sagt (Zielgruppe/Voraussetzungen/Stufe), nicht aus Menüs.
- Je Feld `zitat`: wörtlich, höchstens 15 Wörter.

## Ausgabe
Datei `ergebnis_bN.jsonl` im selben Ordner, eine Zeile je Seite (gültiges JSON, UTF-8):
`{"url":…,"abgerufen":"2026-11-24","seite":"OK|DEFEKT|NICHT_LESBAR|KURS_WEG|UEBERSICHT","hinweis":"…","angebote":{"ID":{"gleicher_kurs":true,"titel_zitat":"…","termin":{"status":…,"termine":[…],"zitat":…},"preis":{…},…}}}`
Nur Felder aus `luecken`. Schreibe die Datei laufend fort (nach jeder Seite eine Zeile anhängen), damit nichts verloren geht. Keine git-Befehle, keine anderen Dateien ändern. Zum Schluss eine Zeile Zusammenfassung zurückgeben: Seiten gelesen, davon OK, Felder gefunden.
