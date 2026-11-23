# BERICHT PAKET 29 «Website-Architektur», 23.11.2026

Grundlage: `SPEZIFIKATION_PAKET29_20261123.md` (§7 geht §4/§5 vor), Owner-Entscheide E241–E248, neu E250, E251 (23.11.); Befund E252.
Arbeitszweig `claude/datenharmonisierung`: Commits 65a4b27 (Sollliste U2, vor dem Code nach V5), b27985c (Code), 6a6411e (Gegenprüfung, Testergebnisse); lokal, Push offen (§8).
Beleg: [GEPRÜFT] von Claude gemessen oder getestet.

## 1. Ergebnis in Kürze

- Release P29 gebaut und getestet (nicht hochgeladen, E227): 998 Angebote am 23.11., je Markt eine Daten- und eine Smart-Datei (CH 923, AT 71, LI 4), `app-v44.js`. Zusammengeführt im Browser **bytegleich mit P28** (gleiche SHA-256 c988be91…, 54288fd7…). [GEPRÜFT]
- Alle Tests bestanden **ausser P12**: Erstbesuch gzip **+4'000 Byte statt höchstens +2'048** (Owner-Entscheid nötig, §6).
- Gegenprüfung durch getrennten Agenten: kein Code-Blocker; Blocker nur P12; Hinweise eingearbeitet (§5).

## 2. Prüfschritte U1, U2

**U1** [GEPRÜFT]: Code seit ef37b3d unverändert (nur Wissensbasis bis 1949daf); P28-Bau am 23.11. reproduziert bytegleich das Release `paket28/abnahme/` (12/12 Prüfsummen, `htaccess.txt` gleich); live = Paket laut V01 vom 23.11. (E239), Abruf von mediaskills.ch aus dieser Umgebung gesperrt (Proxy 403).

**U2** (`paket29/tests/messung_u2.js`): app-v43.js gegen Testkopie mit Suchtext nach Matrix V3 (`paket29/config/a3_suchtext.json`, dieselben Ersetzungen wie im Port), auf P28-Releases 23.11., 01.12., 20.12. Ergebnis [GEPRÜFT]:

| | 23.11. | 01.12. | 20.12. |
|---|---|---|---|
| sichtbare Angebote | 998 | 945 | 860 |
| Smart-Suche, 60 Anfragen geändert | 0 | 0 | 0 |
| Katalogsuche, 60 Anfragen geändert | 9 | 9 | 9 |
| Trennzeichen-Anfragen geändert (von 4) | 3 | 3 | 3 |
| Zeilen Sollliste | 594 | 559 | 527 |

Katalog 23.11.: T06 «kostenlos» 26 → 24, T08 «Journalismus» 352 → 350, V14 14 → 11, V21 «MAS oder CAS Journalismus» 5 → 1, V22 17 → 11, V23 «Bachelor Journalismus» 17 → 6, V25 «kostenlos online» 10 → 8, V28 «Kurs in Basel» 103 → 99, V31 «formation journalisme Genève» 8 → 1; Ursache fast nur `access`, sonst `priceDisplay`. Trennzeichen: «PRÄSENZ|ONLINE LIVE» 242 → 0, «FR|EN» 6 → 0, «|» 307 → 8, «DE/EN» gleich.
Zwei Befunde dem Owner vorgelegt und entschieden: **E250** (Regel gilt auch für echte Angaben in Zugang/Preistext; Orte aus dem Zugangstext später über `eingang/`), **E251** (Ausnahme E221 entfällt; P04 «Trennzeichen unverändert» widersprach E243).
Zusätzlich, nicht verbindlich: Wortprobe (jedes Wort nur roh / nur Anzeige als Einwort-Anfrage), `paket29/out/wortprobe_u2.csv`; grösste Wirkungen Katalog 23.11. z. B. «Schweiz» 997 → 898, «Preis» 240 → 3, «Zugang» 195 → 13, «online» 493 → 466, «publiziert» 495 → 3, «official» 303 → 0.
Dateien: `paket29/out/sollliste_u2.csv` (verbindlich, vor dem Code committet 65a4b27), `messliste_u2.csv` (je Angebot und Feld Roh- und Anzeigetext), `sollliste_u2_info.json`.

## 3. Umsetzung

| Datei | Inhalt |
|---|---|
| `paket29/scripts/build_release_p29.py` | P28-Bau (Auswahl, Felder, Smart unverändert, Hilfsfunktionen aus P28) + Aufteilung nach `release_markt`; Ladereihenfolge CH, dann alphabetisch nach ISO-Code, je Markt Master-Reihenfolge (E247); Vertrag V1 (Soll `{Markt: Anzahl}` in jeder Datendatei, Geladen-Meldung je Daten- und Smart-Datei in `window.MEDIA_SKILLS_KATALOG`, `meta` einmal gesetzt); Namen `daten-/suche-<12 SHA>.js` (E246); `htaccess.txt` bytegleich P28 (SHA a4ed18a2… fest); Cache-Regel gegen jeden Dateinamen geprüft; Meldung P07; Testschalter `P29_TEST=1` (V4) |
| `paket29/scripts/port_p29.py` → `paket29/website/app-v44.js` | 9 Ersetzungen, je genau einmal: Länderfilter ohne feste Liste (E242), Suchtext Smart und Katalog nach V3 (E243, E250, E251), Ladeprüfung mit Hinweis «Ein Teil des Katalogs konnte nicht geladen werden. Bitte Seite neu laden.» und geschützter Merkliste (E248); sonst unverändert (SHA a417dff1…) |
| `paket29/scripts/build_liste_p29.js` | Kopie `build_liste_p25.js`, Logik gleich, Parameter App und Dateilisten (V2) |

Abweichung von §7 V1 (technisch, ohne Owner-Entscheid): «`release_markt` leer oder unbekannt bei einer sichtbaren Zeile» ist nicht erreichbar, weil `scripts/sichtbarkeit.py` nur Märkte CH/AT/LI sichtbar macht; eine solche Zeile verschwände still. Geprüft wird deshalb über **alle** Master-Zeilen (heute 3'819 gültig: US 2'355, CH 1'224, AT 124, DE 111, LI 5).

## 4. Tests [GEPRÜFT]

| Nr. | Ergebnis |
|---|---|
| P01 | PASS an 3 Stichtagen: Datensätze, byId, meta bytegleich P28; Reihenfolge E247; Soll = gezählt |
| P02 | PASS: Marktzuordnung; Fehlfälle doppelte ID, Markt leer, ISO unbekannt, Smart ohne Angebot, Angebot ohne Smart → Abbruch, nichts geschrieben |
| P03 | PASS an 3 Stichtagen: Karten in 3 Sortierungen, 52 Filteroptionen mit Zählern gleich P28; Länderfilter neu Schweiz, Belgien, Deutschland, Liechtenstein, Österreich, Online, keine Angabe |
| P04 | PASS an 3 Stichtagen: echte app-v44.js ändert genau die Sollliste (594 / 559 / 527 Zeilen), 0 Gleichstände betroffen |
| P05 | PASS an 3 Stichtagen, feldweise und gegen den Kartentext: app-v44 0 Verstösse; Kontrolle app-v43 1'532 / 1'456 / 1'333 |
| P06 | PASS: Merkliste P28 → P29 (IDs aus CH, AT, LI) |
| P07 | PASS: Testkopie mit Durchführungsland NZ → Build meldet, Filter zeigt «NZ» |
| P08 | PASS an 3 Stichtagen, 9 Fälle (je Markt Daten oder Smart fehlt, alle Daten, alle Smart, nichts): Hinweis, kein JS-Fehler, übrige Märkte nutzbar, gemerkte IDs bleiben; ohne Fehler kein Hinweis |
| P09 | PASS: 8 Fehlfälle, früheres Release bytegleich, kein Zwischenordner |
| P10 | PASS 31/31 Apache (Cache-Regel für 6 Marktdateien und app-v44.js, Header, HTTPS-Weiterleitung) |
| P11/P14 | Historische Tests gegen ihre Artefakte grün: P24 14/14, Nachträge 14/14, P25 8/8 und 13/13, P26 14/14, P27 15/15, P28 12/12 (allein gelaufen; parallel störten P29-Schreibvorgänge die git-status-Prüfung P06b/P15a). Stufe 1/2 und P28-Anzeigetest nicht erneut gelaufen: ihre Eingaben sind bytegleich (P28 P15a) |
| **P12** | **FAIL**: Paket 2,03 MB ≤ 9 MB ok; Erstbesuch gzip P28 243'273 → P29 247'273 Byte = **+4'000** (Daten+Smart +3'184 durch 6 getrennt komprimierte Dateien, App +766, index.html +50); Ladezeit Chrome «Fast 4G», Kaltstart, Median aus 5: load P28 1'391 ms, P29 1'387 ms; Karten sichtbar 1'487 / 1'508 ms |
| P13 | PASS: zwei Bauten bytegleich (auch Bauprotokoll, SHA256SUMS) |
| P15 | PASS: Chrome headless, 9 Anfragen 200, 7 Skripte, 0 JS-Fehler, 998 Karten = P28, Filter, Katalog- und Smart-Suche = jsdom |
| A5 | PASS: übrige Dateien bytegleich P28, index.html nur Skriptzeilen anders |

## 5. Gegenprüfung (getrennter Agent)

Urteil FAIL allein wegen P12 (B1); Code ohne Blocker; eigener Bau bytegleich, E248 in 4 Zusatzfällen geprüft. Eingearbeitet: B4 (P05 feldweise), B5 (P08 +3 Fälle), B6 (meta-Prüfung echt, htaccess-SHA fest), B3 (überschriebene P28-Ergebnisdatei zurückgesetzt); B2 überholt (alle Läufe danach vollständig). Offen als Hinweis: **B7** – die Soll-Angabe steht in jeder Datendatei, darum ändert sich bei jeder Anzahländerung eines Markts der Name aller Datendateien; der Cache-Vorteil aus E241 entfällt (Vorschlag später: eigene Datei `katalog-<hash>.js`). **B8** – Wortwirkungen (§2). **B9** – Upload: alles in einem Zug (E163), dann ist der kurze Zwischenzustand ohne neue Dateien unkritisch.

## 6. Offen für den Owner

1. P12: +4'000 Byte Erstbesuch (rund +1,6 %, Ladezeit gemessen gleich) annehmen oder Aufteilung ändern.
2. Release P29 freigeben (E227), danach Paket und Upload-Rezept.
3. Push der Commits 65a4b27, b27985c, 6a6411e: Einbinden mit Schreibrecht wurde in diesem Chat blockiert.

## 7. Nicht Teil von P29

Textschicht Landessprachen (E244), Prüfliste und Abruf P30, Beta-Messkriterien (E187), Orte aus Zugangstexten nachtragen (E250, über `eingang/`).
