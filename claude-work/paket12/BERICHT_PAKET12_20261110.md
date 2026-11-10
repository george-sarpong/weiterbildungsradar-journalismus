# BERICHT Paket 12 – Stufe 2 Vorabprüfung im Browser (10.11.2026)

Auftrag (Owner 10.11.): «Stufe 2 Browser-Prüfung» (GESAMTWISSENSSTAND §9; Kriterienliste Bericht Paket 8 §8: D5 Browser-Teil, D8, F9 Browser-Teil, F11, S1, S2, S3, B2, T2, T3, T4, T5, T6; dazu Darstellung der drei Länder-Badges).
Nicht in diesem Paket: Korrekturen am Website-Kandidaten, Release-Paket, `main`, Infomaniak-Upload, kostenpflichtige Läufe. Befunde sind Befunde, keine Aufträge.
Beleg: [GEPRÜFT] per Test im Browser gemessen · [LIVE] auf mediaskills.ch im Chrome des Owners gemessen (E048) · [GELESEN] Original gelesen.

## 1. Grundlage
- Repo `claude/datenharmonisierung` auf ab2eabc (Paket 11), nur gelesen [GEPRÜFT].
- Prüfling: lokaler Prüfstand wie Paket 8 = Live-Snapshot Paket A + `paket10/website/` (`app-v38.js`, 5 HTML-Seiten) + `paket7/website/data-p7.js` + Smart-Daten `paket3/out/merge_kandidat_smart.json`. Kein Release-Paket (Projektregel 7); Vorlage §1 erlaubt «lokal bzw. über GitHub» (E078).
- Werkzeuge: Chrome for Testing 153 kopflos (playwright-core 1.63), Lighthouse (Labor), Datum 10.11.2026, Europe/Zurich: **1'069 von 1'069** aktuellen Angeboten sichtbar (= Bericht Paket 8).
- Live-Kriterien T2/T3 im Chrome des Owners auf mediaskills.ch (E048); T5 per Web-Abruf der Anbieterseiten. Der Arbeitsbereich selbst erreicht weder mediaskills.ch noch Anbieterseiten.
- Test: `paket12/tests/test_stufe2_browser.js`; Ergebnisse und 25 Screenshots in `paket12/out/`.

## 2. Ergebnis je Kriterium

| ID | Stufe | Ergebnis | Messung |
|---|---|---|---|
| D5 Browser | Muss | **PASS** | 1'069 Karten gerendert: 0 Rohcodes, 0 leere Felder, 0 «nicht erfasst»/«nicht publiziert» in Fakten, Zugang, Badges [GEPRÜFT] |
| D8 | Muss | **FAIL** | 1'069 Karten mit Beschreibung, keine als Anbietertext gekennzeichnet, kein Quellenlink an der Beschreibung, kein Hinweis in der Methodik. Live `app-v33.js` identisch (Zeile 535), also kein neuer Fehler [GEPRÜFT] |
| F9 Browser | Muss | PASS | «Datenjournalismus, CHF 800», «Moderation, 1000 Euro», «Video, CHF 500»: je 3 sichtbare Karten, alle mit «Passt, weil …», keine Nummer, kein «Top»/«Empfehlung». «Podcast produzieren, online»: 0 Karten (= E088) [GEPRÜFT] |
| F11 | Muss | PASS | 9 Fundstellen «vollständig» auf allen Seiten und Smart-Ergebnissen, keine behauptet Marktabdeckung: verneinend, Filterbezug, Haftung, 404-Text oder Kursinhalt (2 Beschreibungen) (u. a. Startseite «keinen Anspruch auf vollständige Marktabdeckung», Methodik «keinen Anspruch auf Vollständigkeit») [GEPRÜFT] |
| S1 | Muss | PASS | 68 Anfragen (Laden, Katalogsuche, 4 Smart-Suchen, alle Ortsfilter, Merken, 5 Unterseiten, Handy/Tablet): 0 an fremde Herkunft [GEPRÜFT] |
| S2 | Muss | PASS | Suchtext weder in URL (Katalog bleibt `/`, E091), Cookies, local- noch sessionStorage [GEPRÜFT] |
| S3 | Muss | PASS | 0 Cookies; localStorage leer bis zum Merken, danach nur `weiterbildungsradar:favorites:v1` [GEPRÜFT] |
| B2 | Muss | PASS | 70 Tab-Stopps: Smart-Suche, Katalogsuche, 7 Filter, Sortierung, Favoriten, Merken, Angebotslink erreicht; Fokus sichtbar (3-px-Umriss) und nie verdeckt (2.4.7, 2.4.11); Enter startet Smart-Suche, Leertaste merkt, Pfeiltaste ändert Filter [GEPRÜFT] |
| T6 | Muss | PASS | Handy hoch (390 px), Handy quer, Tablet, Desktop × Start mit Smart-Ergebnis, Methodik, Datenschutz, Impressum: 16 Ansichten ohne horizontalen Überlauf [GEPRÜFT] |
| Länder-Badges | (D7, E081/E082) | PASS | Je Karte genau 3 Badges «Ort», «Anbieterland», «CH-Zugang», sichtbar, nicht abgeschnitten, innerhalb der Karte – Desktop, Handy hoch/quer, Tablet je 1'069 Karten. Screenshots AT, LI, Online, DJA (Anbieterland Deutschland), Mediencampus [GEPRÜFT] |
| T2 | Muss | PASS | `http://mediaskills.ch/` landet auf `https://mediaskills.ch/`; unbekannte Seite liefert Status 404 [LIVE] |
| T3 | Soll | offen | HSTS vorhanden; CSP, `X-Content-Type-Options: nosniff` und `Referrer-Policy` fehlen [LIVE] |
| T4 | Soll | offen (nur Labor) | Lighthouse mobil mit gzip wie live: Kandidat LCP 2,2 s, CLS 0, TBT 980 ms · Live-Snapshot LCP 0,8 s, CLS 0, TBT 1'940 ms. INP ist im Labor nicht messbar; TBT als Ersatz hoch, beim Kandidaten nicht schlechter als live. Felddaten (PageSpeed Insights) erst mit Besuchen [GEPRÜFT] |
| T5 | Muss-Teil | **offen, 3 Links** | 46 Anbieterlinks der gezeigten Treffer T01–T20: 43 erreichbar mit passendem Titel; nicht bestätigt: AT-PROD-OFFER-040 (Abruf 4xx), OFFER-HEAD-003 (Serverfehler), AT-PROD-OFFER-026 (Abruf zeigt nur Workshop-Übersicht, Seite lädt evtl. per Skript). Soll-Teil (alle sichtbaren Links) nicht gelaufen |

**Damit: 1 Muss FAIL (D8), 1 Muss offen (T5, 3 Links). Nach Vorlage §1 geht die Beta so nicht live.**

## 3. Hinweise (kein FAIL)
1. **404-Seite:** Live liefert Status 404, aber die Standard-Fehlerseite des Servers (Apache), nicht `404.html`. Eine Server-Regel (`ErrorDocument`) fehlt; im Live-Snapshot gibt es keine `.htaccess`.
2. **Badge ohne Feldname:** Fehlt das Niveau, steht auf der Karte ein Badge nur mit «keine Angabe» (Beispiel Screenshot `t6_Handy_hoch_karte.png`). Nicht erkennbar, welches Feld gemeint ist.
3. **Smart-Karten** zeigen nur das Badge «Ort», nicht Anbieterland und CH-Zugang. E081 nennt die Katalogkarte; ob Smart-Karten dazugehören, ist nicht entschieden.
4. **Datentexte:** 1 Beschreibung (OFFER-ORSYS-008) enthält «… sind nicht publiziert»; dazu die 8 bekannten Restfälle aus Paket 10. Ortstexte wie «ONLINE / Distance» und Dauer «2j - 14h00» erscheinen wörtlich. Alles Nachrecherche, nicht E093.
5. Anbieterland ist im Kandidaten nur bei 22 Angeboten belegt (DJA = DE), sonst «keine Angabe» (E065).

## 4. Offene Owner-Fragen (mit Empfehlung)
1. **D8 (Muss):** Die Beschreibungen sind gemischt: teils wörtlich vom Anbieter (z. B. MAZ), teils zusammengefasst; die Herkunft je Text steht nicht in den Daten. *Empfehlung:* unter jede Beschreibung «Kurzbeschreibung nach Angaben des Anbieters · Quelle ↗» mit dem vorhandenen Angebotslink, dazu ein Satz in der Methodik. Daten bleiben unverändert. Alternative: D8 für die Beta auf «später» setzen.
2. **T5 (Muss-Teil):** 3 Links von Hand prüfen (Rezept im Chat). Ist einer defekt, gilt T5 als FAIL; der Link geht in die Nachrecherche (E076).
3. **T3 und 404-Seite (Soll):** Header und `ErrorDocument` per `.htaccess` im Release-Paket ergänzen oder später. *Empfehlung:* später, nach der Beta, weil eine Server-Regel ohne Testumgebung (E078) erst live prüfbar ist.
4. **Hinweise §3.2 und §3.3:** *Empfehlung:* Niveau-Badge als «Niveau: keine Angabe» beschriften (gleiche Regel wie E093); Smart-Karten unverändert lassen.
5. **Nachtrag Paket 11 und 12** in GESAMTWISSENSSTAND bestätigen.

## 5. Drift-Prüfung
Gebaut: ein Browsertest, Messungen, dieser Bericht. Unberührt: Website-Kandidat, Daten, Master, `main`, Infomaniak. Kein Release-Paket, keine kostenpflichtigen Läufe. Auf mediaskills.ch nur gelesen.
**Repo:** Der Push auf `claude/datenharmonisierung` wurde von der Rechteprüfung dieser Sitzung abgelehnt. Test, Ergebnisse und Screenshots liegen nur im Arbeitsbereich und als ZIP im Chat.
