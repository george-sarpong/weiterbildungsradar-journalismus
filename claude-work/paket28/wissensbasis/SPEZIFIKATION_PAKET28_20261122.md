# SPEZIFIKATION PAKET 28 «Schlanke Auslieferung», 22.11.2026

Status: **vom Owner freigegeben 22.11.2026** (E229): Entscheid 1 A, 2 A, 3 A, 4 A, 5 A (§3; Register E225–E229). Zweitmeinung ChatGPT parallel, Befunde vor dem Commit einarbeiten. Upload nur mit eigener Release-Freigabe (E227).
Auftrag: Owner 22.11., Chat «weiter»; Plan GESAMTWISSENSSTAND §9 («Nächster Schritt: P28 … zuerst Spezifikation mit Testliste»).
Grundlage: `ZIELBILD_UNTERBAU_20261120.md` §2 B3, B4, B6, §3 Punkt 5, §4 Zeile P28, §5; `BERICHT_PAKET27_20261122.md` §6 (B05, B06, B14), §8; E124, E125, E128, E146, E148, E150, E152, E155, E163, E172, E173, E176, E177, E195, E213.
Vorprüfung: Arbeitszweig `claude/datenharmonisierung`, Commit f075c92 (22.11., Nachtrag P27), flach geklont 22.11.; Master SHA-256 194954d3… (= Bericht P27). Nur gelesen, nichts geschrieben. Messskripte im Scratch, nicht im Repo.
Beleg: [GEPRÜFT] von Claude gezählt bzw. gemessen · [GELESEN] Original gelesen · [SCHÄTZUNG] gerechnet · [ZU BELEGEN] vor Umsetzung prüfen.
Ablage: Projektwissen `claude/SPEZIFIKATION_PAKET28_20261122.md`; Repo-Kopie `claude-work/paket28/wissensbasis/` mit der Umsetzung.

## 0. Einordnung und Driftprüfung

- P28 macht die Auslieferung kleiner und schneller, ohne dass sich auf der Website etwas ändert: nur ausliefern, was am Build-Stichtag sichtbar ist (E172); Felder weglassen, die die App nicht liest; Smart-Datei ohne Leerwerte; Cache-Regel (E176).
- Ziel: gleiche Karten, Filter und Smart-Treffer wie mit `data-p27.js`, an jedem Tag ab dem Build-Stichtag. App `app-v43.js` bleibt unverändert (E213).
- Neu gegenüber P25–P27: ein **Release-Bau** aus dem Generator. Bisher setzt nur `paket19/scripts/build_release.py` die Dateinamen in `index.html` (Bericht P27 §6 B06); P28 braucht ihn, weil die Cache-Regel an den Dateinamen hängt.
- **Nicht Teil von P28:** App-Änderungen, Codes im Suchtext (P29, E213); Datei je Land, Filter-Reihenfolge, Listenseiten (P29); Prüfliste und Abruf (P30); Kernliste (E222); Inhaltsänderungen am Master.

## 1. Befund [GEPRÜFT, 22.11., Commit f075c92]

### 1.1 Grösse heute

| Datei | Byte | gzip (Stufe 6) | Anteil |
|---|---|---|---|
| `data-p27.js` (1'353 Angebote) | 1'595'018 | 206'291 | grösste Felder: description 15 %, access 12 %, laender 11 %, url 7 %, priceDisplay 5 %, release_origin 5 % |
| Smart-Datei als `.js` | 1'016'445 | 28'439 | priceOptions, delivery |
| `index.html` (Liste 1'006 Kurse, 20.11.) | 295'327 | 45'989 (live gemessen, ZIELBILD B4) | |

Release Paket 19 belegt 6,29 MB, davon Rückweg 3,5 MB (Bericht P19 §3). Der Rückweg entfällt seit E173.

### 1.2 Was die App liest (`app-v43.js`)

- Die App zeigt nur `offers` = alle Datensätze ohne HOLD und aktuell (Z. 134). Filterwerte (Z. 162–193, 1761–1770) und Suche entstehen aus `offers`, nicht aus allen Datensätzen.
- **Nie gelesen** (0 Treffer im Code, kein generischer Zugriff ausser `offer[key]` für focus, offerType, level, format, language): `country`, `reviewAfter`, `release_origin`, `publicationReason`, `laender.markt`. Zusammen 138'178 Byte (8,7 %).
- `publicationStatus` steht nur bei gesperrten Zeilen; bei sichtbaren fehlt es schon heute (0 von 945 am 01.12.).
- Alle Datensätze (`allOffers`) braucht die App nur für die Merkliste (Z. 135, 143, 1749): eine gemerkte ID, die nicht mehr in der Datei steht, fällt beim Laden aus dem Browser-Speicher. Sie wäre ohnehin nicht sichtbar. Wieder sichtbar würde sie nur, wenn ein Angebot später entsperrt oder um einen Termin ergänzt wird; dann ist sie aus der Merkliste verschwunden (Entscheid 4).
- Smart: `meta` liest die App nicht. `delivery` liest sie nur über `record?.delivery || {}` (Z. 1021) und prüft jedes Teilfeld mit Ersatzwert (`|| "UNKNOWN"`, `|| ""`, `Array.isArray`); `scheduleSummary`, `temporalSummary`, `materialisationStatus` liest sie nie. `priceOptions` liest sie mit `Array.isArray(…) ? … : []`, die Teilfelder mit `== null`, `!= null`, Wahrheitswert oder `?:` (Z. 1139–1382). Ein fehlendes Teilfeld wirkt dort wie `null`. Einzelstelle Z. 1151 (`raw.amount = option.minAmount`) prüft U3.

### 1.3 Sichtbarkeit und Messung

`scripts/sichtbarkeit.py` = App an 5 Stichtagen (Bericht P27 P09). Sichtbar: 22.11. 998, 01.12. 945, 20.12. 860.
Die Sichtbarkeit nimmt mit der Zeit nur ab: Ein Angebot, das am Stichtag nicht sichtbar ist, wird es danach ohne Datenänderung nie (Regel §1.4 Bericht P27: HOLD fest, Start und Ende nur «≥ Stichtag»). Wer nur das am Stichtag Sichtbare ausliefert, verliert ab dem Stichtag nichts.

| Stufe (Stichtag 01.12.2026) | Daten Byte | gzip | Smart Byte | gzip |
|---|---|---|---|---|
| heute (alle 1'353) | 1'595'018 | 206'291 | 1'016'445 | 28'439 |
| nur sichtbar (945, A1) | 1'104'877 | 144'581 | 681'938 | 18'631 |
| + ohne ungenutzte Felder (A2) | 991'410 | 139'720 | – | – |
| + Smart ohne Leerwerte (A3) | – | – | 476'637 | 16'663 |
| **Ergebnis** | **−38 %** | **−32 %** | **−53 %** | **−41 %** |

Leerwerte Smart: 791 von 1'353 `delivery` sind der leere Standard (alle Teilfelder leer, Stufe UNKNOWN); in den 1'179 Preisoptionen sind u. a. `billingCount` (1'179), `validFrom` (1'179), `validThrough` (1'173), `components` (1'165), `taxRate` (1'149), `minAmount` (1'126) leer oder `null`; 331 Angebote ohne Preisoption.
Paket ohne Rückweg [SCHÄTZUNG aus gemessenen Teilen]: heute rund 3,07 MB, nach P28 am 01.12. rund 1,9 MB.

### 1.4 Cache und `.htaccess`

- Live: kein `Cache-Control`, kein `Expires`, nur ETag und Last-Modified (ZIELBILD B4, gemessen 20.11.).
- Dateinamen heute: `app-v43.js`, `styles-v22.css`, `styles-v24.css` (Version im Namen); `data-p19.js` und `smart-search-data-p19.js` tragen die Paketnummer. Der Monatsbuild (E177) baut neue Daten ohne neues Paket. Bliebe der Name gleich, würde ein langer Cache alte Daten zeigen. Daher braucht jede Daten-Auslieferung einen neuen Namen.
- **Abweichung:** Live-`.htaccess` 891 Byte (Wissensbasis Paket 22, E150), alle Repo-Fassungen 809 Byte (`paket19/`, `paket20/`, …, `paket27/website/.htaccess`, gleich). Welche 82 Byte live dazukommen, ist unbekannt (vermutlich HSTS, live vorhanden laut E150). Weil `htaccess.txt` die Datei ganz ersetzt (E146), muss der Live-Inhalt vorher gelesen werden (U4).
- Infomaniak Starter: `mod_headers` wirkt (CSP live, E150); ob `mod_expires` läuft, ist nicht geprüft. Die Cache-Regel nutzt deshalb nur `Header set` in `<FilesMatch>`.

Praxis [GELESEN]: MDN empfiehlt für Dateien mit Version im Namen `Cache-Control: max-age=31536000, immutable` und für HTML `Cache-Control: no-cache`; `no-cache` speichert und prüft vor jeder Nutzung neu beim Server (MDN, Cache-Control). web.dev empfiehlt `max-age=31536000` für Dateien mit Fingerabdruck oder Version im Namen und ETag für die Neuprüfung (web.dev, HTTP-Cache).

## 2. Soll

**A1 Nur Sichtbares (E172).** Der Release-Bau liefert genau die Angebote, die `sichtbarkeit.py` am Build-Stichtag als sichtbar meldet, in Master-Reihenfolge (E194), Datendatei und Smart-Datei mit denselben IDs. Der Master bleibt unverändert (E014); der Generator `generator_website.py` bleibt unverändert und baut weiter alle 1'353 als Vergleichsstand (`data-p27.js`).
Regel Stichtag: Build-Stichtag ≤ Tag des Builds und ≤ Upload-Tag; ein Stichtag in der Zukunft → Abbruch. Grenze: Wer mit einer Uhr vor dem Stichtag die Seite öffnet (andere Zeitzone kurz nach Mitternacht), sieht Angebote nicht, die am Vortag noch liefen; angenommen.

**A2 Ungenutzte Felder weg:** `country`, `reviewAfter`, `release_origin`, `publicationReason`, `laender.markt` (§1.2). `publicationStatus` fällt mit A1 von selbst weg. Alle Felder bleiben im Master (E031). Die Liste ist fest im Release-Bau; ein Feld, das die App liest, darf nie darauf stehen (Test P04).

**A3 Smart ohne Leerwerte** (Entscheid 1): In `priceOptions` und `delivery` entfallen Teilfelder mit `null`, «», `[]`, `{}`; ein leeres `priceOptions` entfällt ganz; `meta` bleibt. Ein Teilfeld wird nur weggelassen, wenn U3 belegt, dass die App es mit Ersatzwert liest; sonst bleibt es und der Bericht nennt es.

**A4 Dateinamen** (Entscheid 2): Datendatei `daten-<12 Zeichen SHA-256>.js`, Smart-Datei `suche-<12 Zeichen SHA-256>.js` (wie der Live-Stand A `data-a1-86ff68ddc9ac.js`). App und CSS behalten ihre Versionsnamen; eine Datei mit Versionsnamen darf ihren Inhalt nie ändern (Test P09).

**A5 Cache-Regel (E176)** als Block in `htaccess.txt`, nach den bestehenden Blöcken, nur mit `mod_headers`:
- `daten-*.js`, `suche-*.js`, `app-v*.js`, `styles-v*.css`: `Cache-Control: max-age=31536000, immutable`
- `*.html`, `robots.txt`, `sitemap.xml` und die Startseite `/`: `Cache-Control: no-cache`
- HTTPS-Weiterleitung (E128) und Sicherheits-Header (E124) unverändert; `htaccess.txt` = Live-Inhalt (U4) + Cache-Block, nur ASCII, Zeilenende LF.

**A6 Release-Bau** `paket28/scripts/build_release_p28.py <Stichtag> <Ziel>`: Generator → Auswahl A1 → A2/A3 → Dateinamen A4 → Liste, «Stand der Angaben», Sitemap mit `build_liste_p25.js` (unverändert) → `index.html` mit den neuen Namen → Ordner `website/` (nur Dateien, die eine Seite lädt, plus `robots.txt`, `sitemap.xml`, `SHA256SUMS.txt`) und `htaccess.txt` daneben. Kein Rückweg (E173). Abbruch vor dem Schreiben bei: Stichtag in der Zukunft, fehlender Verweis, mehr als 9 MB (E148), IDs von Daten- und Smart-Datei ungleich.

**A7 Bauprotokoll** je Build: Stichtag, Zahl sichtbarer Angebote, Bytes und gzip-Bytes je Datei vorher (P27) und nachher, weggelassene Felder mit Byte-Anteil, SHA-256 je Datei.

**A8 Unverändert:** Master, Protokoll, Eingang, `generator_website.py`, `sichtbarkeit.py`, `app-v43.js`, `build_liste_p25.js`, `paket19/`, `paket22/`, `paket25/website/`, `paket27/`, alle bisherigen Tests und ihre Sollwerte. Website live bleibt, bis ein Release freigegeben ist.

**A9 Wissensbasis:** Bericht, Register, GESAMTWISSENSSTAND §2, §4, §7, §9, §10; Upload-Rezept nach E163 im Bericht.

## 3. Entscheide (Owner)

**Entscheid 1 – Smart-Datei ohne Leerwerte (A3)** → **A** (E225)
- **A (gewählt):** ja, nur mit Beleg je Teilfeld (U3) und Gleichheitstest P05; spart rund 205 KB Speicher (Smart 682 → 477 KB). Übertragung spart nur rund 2 KB, weil gzip Leerwerte schon gut packt.
- B: nur Sichtbares, Teilfelder unverändert. Weniger Prüfaufwand, rund 205 KB mehr auf dem Server.

**Entscheid 2 – Dateinamen der Daten (A4)** → **A** (E226)
- **A (gewählt):** Kürzel aus dem Inhalt (`daten-<hash>.js`). Neuer Inhalt gibt immer einen neuen Namen, auch bei zwei Builds am selben Tag.
- B: Datum im Namen (`daten-20261201.js`). Lesbarer, aber zwei Builds an einem Tag hätten denselben Namen.

**Entscheid 3 – Release** → **A** (E227)
- **A (gewählt):** P28 baut ein getestetes, hochladbares Paket mit Upload-Rezept; hochgeladen wird erst nach eigener Release-Freigabe und deiner Abnahme von rund 20 Minuten (E040). Grund: Die Cache-Regel wirkt erst live, und jedes weitere Paket auf ungeprüftem Live-Stand stapelt Risiko.
- B: wie P25–P27 kein Release; der Release-Bau wartet auf P29 oder den Monatsbuild.

**Entscheid 4 – Kleinere Festlegungen** → **A** (E228) (A1 Stichtag-Regel und Zeitzonen-Grenze; A2 Feldliste; Merkliste: gemerkte, nicht mehr gelieferte Angebote fallen aus dem Browser-Speicher, §1.2; `htaccess.txt` aus dem gelesenen Live-Inhalt, U4)
- **A (gewählt):** alle so übernehmen.
- B: einzeln besprechen.

**Entscheid 5 – Freigabe** → **A** (E229)
- **A (gewählt):** freigegeben; Zweitmeinung ChatGPT parallel, Befunde vor dem Commit einarbeiten (wie E217).
- B: erst nach Zweitmeinung.

Quelle: Owner-Antworten 22.11., Chat «weiter» (Auswahl je «A»).

## 4. Prüfschritte vor der Umsetzung

U1 Zweig auf f075c92 oder jünger ohne Änderung an `paket3/out/`, `scripts/`, `eingang/`; Master 194954d3907563b87fe2ab6b29efff5a221df684c15e210a2d616ae7c5f5ef4e; sonst anhalten.
U2 Zählungen und Bytes §1.3 wiederholen; weicht eine Zahl ab, anhalten und melden.
U3 Leseliste: für jedes Feld aus A2 und jedes Teilfeld aus A3 alle Lesestellen in `app-v43.js` mit Zeile; belegen, dass ein fehlendes Feld gleich wirkt wie heute. Ist eine Stelle unklar (z. B. Z. 1151), bleibt das Feld; im Bericht nennen.
U4 Live-`.htaccess` lesend öffnen (Chrome im Infomaniak-Web-FTP, nur lesen, E048), Inhalt und SHA-256 festhalten; ohne Lesezugriff anhalten und fragen.
U5 Lokaler Apache 2.4 mit `mod_headers` und `mod_rewrite` verfügbar (wie Paket 20); sonst anhalten.

## 5. Testliste (Abnahme)

| Nr. | Prüfung | Erwartung |
|---|---|---|
| P01 | Auswahl | IDs in Daten- und Smart-Datei = sichtbar laut `sichtbarkeit.py` am Stichtag, Master-Reihenfolge; Datensätze sonst gleich wie in `data-p27.js` ausser A2 |
| P02 | Gleichheit Anzeige | App mit Release-Daten = App mit `data-p27.js` an Stichtag, +9, +28 Tagen: gleiche Karten (Text, Reihenfolge in allen 3 Sortierungen), gleiche Filterwerte, gleiche Zähler, Merkliste gleich für sichtbare IDs |
| P03 | Gleichheit Smart-Suche | 60 Anfragen (T01–T20 und 40 virtuelle, wie P25 G11) an denselben 3 Tagen: gleiche Treffer, Gruppen, Punktzahl je Kandidat, Hinweise |
| P04 | Felder A2 | kein Feld der Liste kommt in `app-v43.js` vor (ausser als anderer Name, Liste im Bericht); Fehlfall: Liste mit `title` → Abbruch des Release-Baus |
| P05 | Smart A3 | jedes weggelassene Teilfeld in der Leseliste U3; P03 grün |
| P06 | Stichtag | Stichtag morgen → Abbruch, nichts geschrieben; Stichtag heute und gestern → baut |
| P07 | Liste und Sitemap | `index.html` (Liste, «Stand der Angaben») und `sitemap.xml` gleich wie aus `data-p27.js` am selben Stichtag, bis auf die Skript-Namen |
| P08 | Dateinamen | Name = Kürzel des Inhalts; jeder Verweis aller Seiten zeigt auf eine Datei im Paket; Fehlfall fehlender Verweis → Abbruch |
| P09 | Versionsnamen | `app-v43.js`, `styles-v22.css`, `styles-v24.css` bytegleich mit dem Live-Stand Paket 19 (SHA256SUMS) |
| P10 | Cache lokal | Apache mit `htaccess.txt`: Daten, Smart, App, CSS `max-age=31536000, immutable`; HTML, `/`, `robots.txt`, `sitemap.xml` `no-cache`; 304 bei Wiederholung mit ETag |
| P11 | Sicherheit lokal | CSP, nosniff, Referrer-Policy und HTTPS-Weiterleitung wie live (T3, 7/7 wie Paket 20); `htaccess.txt` = Live-Inhalt + nur der Cache-Block, ASCII, LF |
| P12 | Stufe 1 und 2 | Stufe 1 35 PASS / 0 FAIL / 4 später an Stichtag und +9 Tagen; Stufe 2 10 PASS; B1, B3a, B3b, S1 PASS |
| P13 | Grösse | Bauprotokoll A7; Paket ≤ 9 MB; Daten- und Smart-Datei kleiner als P27 |
| P14 | Reproduzierbarkeit | zwei Builds mit gleichem Stichtag aus frischen Ordnern bytegleich |
| P15 | Unverändert | A8 per SHA-256 vorher = nachher; P27 15/15, Anzeige 12/12, `test_paket24.py`, `test_nachtraege.py`, P25, P26 grün |

Nach einem Upload (nur bei Entscheid 3 A und Freigabe): V01 Dateien per SHA-256 live = Paket; V02 Startseite ohne JavaScript mit Liste; V03 securityheaders.com Note A (E150: von aussen prüfen); V04 `Cache-Control` je Dateityp wie P10 (Firefox oder securityheaders.com-Rohdaten); V05 Karten und Smart-Suche im Browser.

## 6. Lieferung und Aufwand

- Commits auf `claude/datenharmonisierung`, nie `main` (E041). Push braucht Schreibrecht wie E191; im Chat 22.11. war der Schreibzugriff von hier aus noch nicht erteilt.
- `BERICHT_PAKET28_<Datum>.md` mit Tests, Gegenprüfung durch getrennten Agenten, Abgleich Zweitmeinung; Register und GESAMTWISSENSSTAND (A9).
- Zeit: Claude eine bis zwei Arbeitssitzungen; Owner rund 5 Minuten für die Entscheide, rund 5 Minuten für den Bericht; bei Release dazu rund 20 Minuten Abnahme und 10 Minuten Upload.

## 7. Prüfung nach Fachrollen (FACHROLLEN.md Fassung 3)

| Rolle | Prüffrage | Ergebnis |
|---|---|---|
| R0 Produkt und Betrieb | Dient P28 dem Beta-Ausstieg? | ja: Platz für Stufe 1 (ZIELBILD §5 Szenario D), weniger Verkehr |
| R2 Daten | nichts gelöscht, Herkunft bleibt | A1, A2: nur Auslieferung, Master unverändert |
| R4 Build | ein Weg, Abbruch vor dem Schreiben, reproduzierbar | A6; P06, P08, P14 |
| R5 Sicherheit | Header unverändert | P11, V03 |
| R6 Leistung | weniger Bytes, Cache | P10, P13, V04 |
| R10 QS | Gleichheit belegt, getrennte Prüfung | P02, P03; getrennter Agent; Zweitmeinung |
| UX | sichtbare Änderung? | keine, ausser Merkliste bei später entsperrten Angeboten (Entscheid 4) |

## 8. Bei Punkten ausserhalb dieser Spezifikation

Anhalten und fragen (wie E158).

Quellen: MDN «Cache-Control» (developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control, abgerufen 22.11.2026); web.dev «Prevent unnecessary network requests with the HTTP Cache» (web.dev/articles/http-cache, abgerufen 22.11.2026).
