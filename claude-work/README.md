# Arbeitszweig `claude/datenharmonisierung`

Eigener Arbeitszweig von Claude für die Daten- und Wissensharmonisierung von mediaskills.ch (Owner-Entscheid George Sarpong, 09.11.2026).

- Nicht gemergt, kein Release. `main`, PR10 und die Website auf Infomaniak bleiben unberührt.
- Zusammenführen nur nach ausdrücklicher Freigabe durch George Sarpong.

## Inhalt
- `scripts/build_master.py` – baut die lokale, unveröffentlichte Master-Datensicht (3'818 market+id) mit Feldherkunft, Konflikt- und Fehlstellenreport. Liest nur Übergabe-ZIP und Git-Stände, keine Netzwerkaufrufe.
- `scripts/test_master.py` – 21 Tests inkl. 3 Manipulationstests (Stand 09.11.2026: 21/21 PASS).
- `scripts/cmp_main_pr10.py` – Feldvergleich data.js main vs. PR10.
- `paket1/` – Quellenverzeichnis und Widersprüche (09.11.2026).
- `paket3/` – Dreiwege-Merge, Master 3'818, Owner-Liste, Nachrecherche-Warteschlange (09.11.2026); Skripte `scripts/merge3.py`, `build_master_p3.py`, `paket3_listen.py`, `test_paket3.py` (35/35 PASS), Lauf `scripts/run_paket3.sh`. `build_master.py` bleibt unverändert (braucht Übergabe-ZIP V4.1).
- `paket2/` – Entwurf Gesamtwissensstand, Entscheidungsregister (CSV), Erledigt-Liste (09.11.2026, Owner-Abnahme ausstehend).
