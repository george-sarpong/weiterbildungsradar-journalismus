# Arbeitszweig `claude/datenharmonisierung`

Eigener Arbeitszweig von Claude für die Daten- und Wissensharmonisierung von mediaskills.ch (Owner-Entscheid George Sarpong, 09.11.2026).

- Nicht gemergt, kein Release. `main`, PR10 und die Website auf Infomaniak bleiben unberührt.
- Zusammenführen nur nach ausdrücklicher Freigabe durch George Sarpong.

## Inhalt
- `scripts/build_master.py` – baut die lokale, unveröffentlichte Master-Datensicht (3'818 market+id) mit Feldherkunft, Konflikt- und Fehlstellenreport. Liest nur Übergabe-ZIP und Git-Stände, keine Netzwerkaufrufe.
- `scripts/test_master.py` – 21 Tests inkl. 3 Manipulationstests (Stand 09.11.2026: 21/21 PASS).
- `scripts/cmp_main_pr10.py` – Feldvergleich data.js main vs. PR10.
