# Paket 3 – Dreiwege-Merge und Master-Tabelle (09.11.2026)

Grundlage: E034, E035. Arbeitszweig `claude/datenharmonisierung`. Kein Website-Code, kein Release, nichts auf `main` oder Infomaniak.

## Ablauf
`GIT=/pfad/zu/worktrees bash scripts/run_paket3.sh` (aus `claude-work/`), offline, ca. 10 Sekunden.

1. `scripts/merge3.py` – Dreiwege-Merge `data.js` und `smart-search-data.js`: Basis 86868e0, Live-Snapshot, main 5f09e078; PR10 82bb95f9 nur als Vergleichsliste.
2. `scripts/build_master_p3.py` – Master 3'818 market+id mit Herkunft je Feld, Vier-Felder-Modell (E043), Objektklasse (E029), Schutz-IDs, Deduplizierung DE/USA (E008), «nicht erfasst» (E036).
3. `scripts/paket3_listen.py` – Owner-Liste und Nachrecherche-Warteschlange.
4. `scripts/test_paket3.py` – 51 Tests inkl. 6 Manipulationstests (Stand Paket 4, 09.11.2026: 51/51 PASS).

Paket 4 (09.11.2026): Owner-Entscheide E060–E070 angewendet. Eingabe `config/owner_entscheide.csv` (775 entschieden, 24 offen;
einmalig erzeugt mit `scripts/paket4_owner_entscheide.py`). Bericht: `BERICHT_PAKET4_20261109.md`. Register: `ENTSCHEIDUNGSREGISTER.csv`.

## Eingaben (`eingaben/`)
- `Arbeitskatalog_3818_V288_20261108.xlsx` – Drive `1IDwc5qM-sbZu2HOKq6Ba7x3mqAjk12b7` (3'818 Zeilen, 307 Schutz-IDs). Ersatz für die Teil-ZIPs aus Übergabe V4.1 (Drive `1qZvJHIm…`, 14,8 MB, über dem 10-MB-Limit des Drive-Connectors).
- `R4_PUBLICATION_ROWS_20260915.json` – Sheet `1s6nKTq56BCli70sr0Jsf-sn2pxVaaZ0EBjA9X9lCNQU`, Blatt PUBLICATION_ROWS (3'811 Zeilen; DE/USA identisch mit PR10-Staging, geprüft).
- `AT_OWNER_DISPOSITIONS_R3_20260930.csv` – aus Sheet `1mtLbV9ec2520p4-VicTAzmOThztpyhRiLfYl0BMooL0` (Blätter AT_SCOPE_OUT_R1, AT_R3_SCOPE_OUT_DELTA, AT_CONTROLLED_HOLDS_R1, AT_R3_CURRENT_HOLDS, AT_SCOPE_GATE_R2): 76 OUT + 27 HOLD.

## Ausgaben (`out/`)
| Datei | Inhalt |
|---|---|
| `owner_liste_uebersicht.md` | Lesbare Owner-Liste (A Konflikte, B Gruppenkonflikte, C Live-Änderungen an Schutz-IDs, D HOLD, E Block GitHub-Änderungen an Schutz-IDs) plus F Grundsatzfragen |
| `owner_liste.csv` | Dieselben 799 Fälle mit vollen Werten, Spalten `entscheid_owner`, `register_id`, `status` (Paket 4) |
| `nachrecherche_warteschlange.csv` | 720 Zeilen (Paket 4), Priorität 1–3; Spalte `auftrag` trennt Auftrag Punkt 4 (354) von Zusatz aus Master/Merge (366) |
| `master_3818.csv` | Master-Tabelle, Spalten `h_*` = Herkunft je Feld |
| `master_herkunft_lang.csv.gz` | Langformat: ein Datensatz je Angebot und Feld mit Rohwert, Herkunft, Quelle |
| `merge_feldentscheide.csv` | jede Abweichung von der Basis mit Klasse und Vorschlag |
| `merge_kandidat_data.json`, `merge_kandidat_smart.json` | Merge-Ergebnis mit Owner-Entscheiden (offene Owner-Fälle = Live-Wert). Kein Website-Asset |
| `main_vs_pr10_zweite_quelle.csv` | Abweichungen main ↔ PR10, nicht übernommen |
| `dedupe_de_usa.csv`, `objektklassen_zuordnung.csv` | Prüflisten E008, E029 |
| `*_SUMMARY.json` | Zählungen und SHA-256 der Eingaben |
