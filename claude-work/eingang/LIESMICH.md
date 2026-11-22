# Eingang für den Master (Paket 26)

Jede Änderung am Master und jedes neue Angebot kommt nur über diesen Ordner (E203). Regeln und Herleitung: `SPEZIFIKATION_PAKET26_20261121.md`, Bericht Paket 26.

## Ablauf

1. **Recherche:** Werte von der Anbieterseite, Register-ID des Owner-Entscheids oder der Regel, Quelle mit Adresse und Abrufdatum.
2. **Datei anlegen:** `NNN_JJJJMMTT_korrekturen.csv` bzw. `NNN_JJJJMMTT_neue_angebote.csv`. `NNN` ist die nächste freie Laufnummer, dreistellig, ab 026. 013–022 sind der überführte Altbestand, 023–025 sind vergeben (025 ist der Lieferform-Schritt aus P25). Haben beide Dateien dieselbe Laufnummer, gilt zuerst die Korrekturdatei.
3. **Prüfen:** `python3 -I scripts/eingang_pruefen.py`. Das Skript schreibt nichts. Bei einem Fehler meldet es Datei, Zeile, Spalte, Regel und Grund.
4. **Master fortschreiben:** `python3 -I scripts/master_nachtraege.py --out paket3/out`. Bei einem Fehler schreibt es nichts.
5. **Generator:** `python3 -I scripts/generator_website.py`.

## Form

Die Dateien sind UTF-8 ohne BOM, mit Zeilenende LF und Anführungszeichen nach RFC 4180 (Felder mit Komma in `"…"`).

**Korrekturen:** Eine Zeile ändert genau eine Master-Zelle. Der Kopf lautet genau:
`id,feld,alt,neu,alt_anzeige,herkunft,register_id,quelle,url_status,url_geprueft_am,ursprung`

- `feld` ist ein Master-Spaltenname, der in `scripts/eingang_felder.csv` als änderbar markiert ist (`aenderbar` = JA). `h_`-Spalten sind nicht änderbar; die Herkunft schreibt das Skript aus `herkunft`.
- `alt` ist der aktuelle Master-Wert. Ein Platzhalter wie `NICHT_PUBLIZIERT` entspricht «nicht erfasst». Bei Anzeigefeldern (`…_anzeige`) gilt der gezeigte Wert. `neu` gleich dem Original wird als leer gespeichert, dann gilt das Original.
- `alt_anzeige` ist freiwillig und prüft zusätzlich den gezeigten Wert.
- `herkunft` muss in `scripts/eingang_herkunft.csv` stehen; ein neuer Code braucht dort eine Zeile mit Register-ID. `register_id` muss in `claude-work/wissensbasis/ENTSCHEIDUNGSREGISTER.csv` stehen. An Schutz-IDs ist nur ein Register-Eintrag mit Beleg OWNER zulässig.
- `quelle` darf nie «wie oben», «dito» oder «s. o.» sein.
- `url_status` (OK, WEITERLEITUNG, NICHT_GEPRUEFT) ist nur bei `feld` = `url` zulässig, dort aber Pflicht. `url_geprueft_am` ist bei OK und WEITERLEITUNG Pflicht (Datum, nicht nach dem Laufdatum) und bleibt bei NICHT_GEPRUEFT leer.
- `id` + `feld` dürfen höchstens einmal je Datei vorkommen.

**Neue Angebote:** Eine Zeile ist ein Angebot. Die Spalten sind Master-Spalten plus
`herkunft,register_id,quelle,url_status,url_geprueft_am,scope_code,scope_begruendung,dedupe_freigabe,url_geteilt,ursprung`.

- Pflicht sind `market`, `id` (Muster `[A-Z0-9][A-Z0-9-]{2,40}`), `kohorte` = `NEU_<NNN>`, `anbieter`, `titel`, `url` und `release_markt`. Für CH/AT/LI kommen dazu alle Felder, die der Generator braucht (`pflicht_neu` in der Feldtabelle), etwa `lieferform_json` mit den 8 Teilfeldern, `preis_optionen` (Liste) und `preis_budgetfaehig` (True/False).
- Nicht genannte Spalten werden gesetzt: Anzeigefelder leer, `h_…` als «LEER», alle übrigen als «nicht erfasst», ausser es gilt eine Vorgabe (`vorgabe_neu`). Kennungen früherer Läufe (`r4_…`, `v288_…`, `schutz_…` usw.) gehören nicht in die Datei.
- `url_status` ist OK oder WEITERLEITUNG; `url_geprueft_am` liegt nicht nach dem Laufdatum.
- `scope_code` ist KERN_E005, PRAXIS_E005, GESCHAEFT_FREIE_E180 oder GRENZFALL_E179. Bei GRENZFALL_E179 ist `scope_begruendung` Pflicht.
- **Dubletten (E206):** Gleicher Anbieter und Titel wie im Master führt zum Abbruch, ausser `dedupe_freigabe` nennt einen Owner-Entscheid. Gleiche Adresse führt zum Abbruch, ausser `url_geteilt` = JA (Übersichtsseite); das Prüfskript listet diese Fälle.

Werte: Datum JJJJ-MM-TT, Länder ISO 3166-1 alpha-2 (mehrere mit `|` ohne Leerzeichen), Codelisten in `scripts/eingang_codelisten.csv`. Unbekanntes bleibt «nicht erfasst» (E031).

## Beispielzeilen

```
id,feld,alt,neu,alt_anzeige,herkunft,register_id,quelle,url_status,url_geprueft_am,ursprung
OFFER-HEAD-003,url,https://head.hesge.ch/formations-recherche/initiation-lintelligence-artificielle,https://head.hesge.ch/formations/formations-continues/initiation-a-lintelligence-artificielle,,OWNER_E098,E098,Owner-Antwort 10.11.,OK,2026-11-10,
OFFER-MAZ-001,anbieter_land,nicht erfasst,CH,,DOMAIN_E118,E118,Domain-Endung .ch der Angebotsseite,,,
```

Neue Angebote: siehe `022_20261119_neue_angebote.csv` (OFFER-DIGICOMP-075).
