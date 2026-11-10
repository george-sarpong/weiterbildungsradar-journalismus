# BERICHT Paket 18 – Anbieterland = Sitzland (E118), 10.11.2026

Auftrag: Owner-Antwort «bin mit allem einverstanden … beim anbieterland hätte ich vorgeschlagen, das land zu nehmen, in dem der anbieter ist. Zum Beispiel MAZ = Schweiz» (E117 Bestätigung Nachträge 16 und 17, E118). Commit **d198274**, kein Merge nach `main`.

## 1. Umsetzung

Beleg je Anbieter: Domain-Endung der Angebotsseiten (.ch/.swiss → Schweiz, .at/.wien → Österreich, .li → Liechtenstein); nur wenn alle Angebote des Anbieters dieselbe Landes-Domain haben. `paket18/scripts/anbieterland_p18.py` → `paket18/config/korrekturen.csv` (alter Wert «nicht erfasst», Herkunft) → `data-p18.js`. 934 Angebote / 145 Anbieter (CH 807, AT 122, LI 5); Deutschland bleibt bei der DJA (schon belegt). Sichtbar: 765 Karten mit Anbieterland (Schweiz 660, Österreich 80, Deutschland 21, Liechtenstein 4), 303 ohne. `methodik.html`: «Anbieterland» nennt das Sitzland. App unverändert (app-v42).

## 2. Offen (Owner-Entscheid bzw. Impressum-Prüfung)

| Fall | Anbieter | Befund |
|---|---|---|
| Ausländische Gesellschaft hinter Schweizer Website (7) | NobleProg Schweiz, ORSYS Training Schweiz, Dawan, PC-COLLEGE (2 Einträge), Laudius, Ateliers de l’image et du son | Impressum 10.11.: NobleProg Limited (keine Adresse); ORSYS-Gruppe Frankreich, Zentrum ORSYS Suisse Genf; DAWAN SARL Nantes; PC-COLLEGE deutsche GmbH; Laudius Postfach Zürich, Handelsregister Kleve (DE); Ateliers Rohwert «Frankreich» (Nachrecherche E043) |
| Ohne Landes-Domain (17) | SAWI, Compass Security Schweiz AG, Baumgartner Research, Swiss Creator Academy, SAE Institute Zürich, ASF Genève, ASPP, Swiss Photo Club, Basel Institute on Governance (2), Julien Matthey, ITTA, MiTech, Microwin, décadréE, LIK Akademie, Russmedia | Impressum noch nicht geprüft (Webabruf brauchte Freigabe, Owner abwesend) |

Liste: `paket18/out/anbieterland_offen.json`.

## 3. Tests

`test_paket18.js` 7/7 (reproduzierbar, 934 Felder mit Herkunft, Sichtbarkeit unverändert, nur CH/AT/LI/DE, offene Fälle ohne Badge, MAZ = Schweiz auf 118 Karten, nur das Anbieterland-Badge ändert sich). `test_paket17.js` 13/13. Stufe 1 35 PASS, 0 FAIL, 4 später an beiden Stichtagen. Stufe 2 10 PASS, 0 FAIL. B1 PASS.
