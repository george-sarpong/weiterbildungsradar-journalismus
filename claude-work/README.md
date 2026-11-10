# Arbeitszweig `claude/datenharmonisierung`

Eigener Arbeitszweig von Claude für die Daten- und Wissensharmonisierung von mediaskills.ch (Owner-Entscheid George Sarpong, 09.11.2026).

- Nicht gemergt, kein Release. `main`, PR10 und die Website auf Infomaniak bleiben unberührt.
- Zusammenführen nur nach ausdrücklicher Freigabe durch George Sarpong.

## Inhalt
- `scripts/build_master.py` – baut die lokale, unveröffentlichte Master-Datensicht (3'818 market+id) mit Feldherkunft, Konflikt- und Fehlstellenreport. Liest nur Übergabe-ZIP und Git-Stände, keine Netzwerkaufrufe.
- `scripts/test_master.py` – 21 Tests inkl. 3 Manipulationstests (Stand 09.11.2026: 21/21 PASS).
- `scripts/cmp_main_pr10.py` – Feldvergleich data.js main vs. PR10.
- `paket1/` – Quellenverzeichnis und Widersprüche (09.11.2026).
- `paket3/` – Dreiwege-Merge, Master 3'818, Owner-Liste, Nachrecherche-Warteschlange (09.11.2026); Skripte `scripts/merge3.py`, `build_master_p3.py`, `paket3_listen.py`, `test_paket3.py` (41/41 PASS), Lauf `scripts/run_paket3.sh`. `build_master.py` bleibt unverändert (braucht Übergabe-ZIP V4.1).
- `paket2/` – Entwurf Gesamtwissensstand, Entscheidungsregister (CSV), Erledigt-Liste (09.11.2026, Owner-Abnahme ausstehend).
- `paket7/` – Beta-Muss E074 (10.11.2026): `app-v36.js` (Preisspanne WDA-01, «Kostenlos» WDA-03, Länderanzeige D7), `data-p7.js` (Kandidat + Feld `laender` aus dem Master), `index.html`, `methodik.html`; Skripte `port_app_v36.py`, `port_html_p7.py`, `build_daten_p7.py`; Tests `test_app_v36.js` (41/41 PASS an 09.11. und 01.12.2026). Kein Release.
- `paket8/` – Testsatz Stufe 1 (10.11.2026): `tests/test_paket8.js` (D2, D5, F1 T01–T20, F4, F9, S2, S3), `tests/test_browser_p8.js` (B1, B3, S1, T1), `scripts/pruefe_paket.py` (R1/R2), Gesamtlauf `run_paket8.sh`; Ergebnis 3 Muss-FAIL (D5, T14b, B1), Website unverändert. Kein Release.
- `paket9/` – Korrekturen aus Paket 8 (10.11.2026, E086–E092): `website/app-v37.js` (Rohcodes übersetzt, Platzhalter «nicht erfasst», Linknamen, ohne Optionsnummer, kein `?q=`), 5 HTML-Seiten (Logo-Link, Methodik-Satz); Skripte `port_app_v37.py`, `port_html_p9.py`; Tests `test_app_v37.js` (15/15) und Testsatz Paket 8 auf Paket 9 (0 FAIL). Kein Release.
