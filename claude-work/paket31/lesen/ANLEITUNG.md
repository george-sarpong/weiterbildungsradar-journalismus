# P31 Lücken füllen – Anleitung für Lese-Agenten (E266–E268)

Du liest Anbieterseiten von Weiterbildungskursen und trägst fehlende Angaben zusammen. Stichtag 2026-11-23. Genauigkeit vor Vollständigkeit: lieber «NICHT_AUF_SEITE» als raten. Nichts erfinden (E031).

## Eingabe
`paket_NN.jsonl`: eine Zeile je Seite: `url`, `angebote` (ID → `titel`, `anbieter`, `luecken`: Feld → heutiger Katalogwert). Nur die Felder unter `luecken` sind gesucht.

## Vorgehen je Seite
1. Seite mit **WebFetch** lesen (keine anderen Abrufwege, nichts Kostenpflichtiges, kein Firecrawl). Prompt sinngemäss: «Gib für den Kurs ‹Titel› genau an, was auf der Seite steht: alle künftigen Termine (Start, Ende, Ort), Preise mit Währung und Tarif (regulär, Mitglieder, Journalist:innen …, inkl./zzgl. MWST), Dauer, Durchführungsort, Kursform (Präsenz/online live/selbstlernend/hybrid), Kurssprache, Niveau; je Angabe ein kurzes wörtliches Zitat. Steht etwas nicht da, schreibe ‹fehlt›. Ist der Kurs nicht mehr im Angebot oder ist es eine Übersichtsseite mit vielen Kursen, sage das.»
2. Bei mehreren Angeboten auf derselben Seite (Übersichtsseite): Werte nur übernehmen, wenn sie eindeutig zu genau diesem Kurs gehören.
3. Fehlerseite, 404, Login, leere Seite, Zeitüberschreitung: `seite` = `NICHT_LESBAR` oder `DEFEKT`, keine Werte. Höchstens ein zweiter Versuch.
4. Nur Angaben der Seite selbst (oder direkt verlinkte Terminliste derselben Website, dann `quelle_url` angeben). Kein Wissen aus dem Gedächtnis.

## Werte (nur diese Formen)
- `termin`: `status` GEFUNDEN | AUF_ANFRAGE (Seite sagt ausdrücklich auf Anfrage/jederzeit/nach Vereinbarung/laufend, E268) | NICHT_AUF_SEITE | NUR_VERGANGEN; `termine`: Liste `{"start":"JJJJ-MM-TT","ende":"JJJJ-MM-TT" oder null,"ort":"…" oder null}`, nur Start ≥ 2026-11-23, höchstens 8, aufsteigend.
- `preis`: `status` GEFUNDEN | KOSTENLOS | AUF_ANFRAGE | NICHT_AUF_SEITE; `tarife`: Liste `{"betrag":Zahl,"waehrung":"CHF|EUR|USD","art":"REGULAER|BEDINGT","bezeichnung":"z. B. Mitglieder" oder null,"mwst":"INKL|ZZGL|UNBEKANNT"}`. Nur Kursgebühr (keine Gutscheine, Rabattbeträge, Spenden, Einzelmodule anderer Kurse).
- `dauer`: `wert` kurz auf Deutsch wie «2 Tage (14 Std.)», «3 Abende à 3 Std.», «6 Monate»; nicht Fristen («4 Wochen vor Kursbeginn»).
- `ort`: `wert` Ort(e) auf Deutsch («Zürich», «Genf», «Online»), `land` ISO-Code (CH, AT, LI, DE …) oder null bei nur Online.
- `kursform`: `wert` Liste aus PRÄSENZ, ONLINE LIVE, ONLINE SELBSTLERNEN, HYBRID.
- `sprache`: `wert` Liste aus DE, FR, IT, EN (Kurssprache, nicht Sprache der Website).
- `niveau`: `wert` eines von EINSTIEG, VERTIEFUNG, FORTGESCHRITTEN, BERUFSERFAHRUNG, VERSCHIEDENE_NIVEAUS – nur wenn die Seite es ausdrücklich sagt (Zielgruppe/Voraussetzungen/Stufe), nicht aus Menüs.
- Je Feld `zitat`: wörtlich, höchstens 15 Wörter.

## Ausgabe
Datei `ergebnis_NN.jsonl` im selben Ordner, eine Zeile je Seite (gültiges JSON, UTF-8):
`{"url":…,"abgerufen":"2026-11-23","seite":"OK|DEFEKT|NICHT_LESBAR|KURS_WEG|UEBERSICHT","hinweis":"…","angebote":{"ID":{"termin":{"status":…,"termine":[…],"zitat":…},"preis":{…},…}}}`
Nur Felder aus `luecken`. Schreibe die Datei laufend fort (nach jeder Seite eine Zeile anhängen), damit nichts verloren geht. Keine git-Befehle, keine anderen Dateien ändern. Zum Schluss eine Zeile Zusammenfassung zurückgeben: Seiten gelesen, davon OK, Felder gefunden.
