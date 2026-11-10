# BERICHT Paket 11 – Übergabe-ZIP V4.1 im Master (10.11.2026)

Auftrag: GESAMTWISSENSSTAND §10 Punkt 2. Der Owner hat am 10.11. das Übergabe-ZIP V4.1 im Chat hochgeladen; offen waren die Aufteilung der 307 Schutz-IDs (191 Archiv / 116 QA09) und die V288-Herkunft (Bericht Paket 3 §8).
Nicht in diesem Paket: Feldwerte ändern, Gold, Website, Release, `main`, kostenpflichtige Läufe. Code aus dem ZIP (Audit-Skripte, Notebook) wurde nicht ausgeführt.
Beleg: [GEPRÜFT] per Skript gerechnet und getestet · [GELESEN] Original gelesen · [OWNER] Owner.

## 1. Quelle [GELESEN]
- `SFJ_CLAUDE_CODE_UEBERGABE_V4_1_DRIFTKORRIGIERT_20261109.zip`, SHA-256 `06e436b7de69…`, 81 Dateien (= Drive `1qZvJHImOlLp0PpQ2EC6PnmfydoauJgtv` laut Bericht Paket 3 §8, dort wegen Grösse nicht ladbar).
- Schutzgrund: `03_Vorpruefungen/SFJ_EVT257_…zip` → `E4_SHADOW_1352_READONLY_RISK_ROLLUP.csv`, Spalte `legacy_policy` (`ARCHIVE_NO_AUTO_RESCAN` 191, `QA09_FROZEN_RECONCILIATION_ONLY` 116, `SOURCE_RESEARCH_CANDIDATE` 995, `NO_PAID_FETCH_NEEDED` 50). Dieselbe Datei nutzt das Audit-Skript des ZIPs für die 307.
- V288: 42 Checkpoints `07_V288_Field_Checkpoints/*.zip` = Firecrawl-Lauf 08.11. (`V288_FIRECRAWL_ONLY_20261108_R1`), 829 Prüfungen, alle HOLD, 0 Gold. Die Arbeitsdatei im ZIP ist byte-gleich mit `paket3/eingaben/Arbeitskatalog_3818_V288_20261108.xlsx`; `v288_geprueft`/`v288_resultat` standen deshalb schon im Master.

## 2. Umsetzung [GEPRÜFT]
- `paket11/scripts/extrahiere_v41.py` liest nur Daten aus dem ZIP und schreibt nach `paket3/eingaben/`: `V41_E4_SCHUTZ_1352.csv`, `V41_V288_PROVENIENZ_829.csv`, `V41_HERKUNFT.json` (SHA-256 des ZIPs und der 44 gelesenen Innendateien). Das ZIP selbst liegt nicht im Repo.
- `scripts/build_master_p3.py` (2 neue Pflicht-Argumente) und `run_paket3.sh`: 9 neue Master-Spalten `schutz_grund` (ARCHIV / QA09 / KEIN_SCHUTZ), `e4_legacy_policy`, `v288_methode`, `v288_quelle_url`, `v288_quelle_sha256`, `v288_checkpoint` sowie die Herkunftscodes `h_schutz_grund`, `h_e4_legacy_policy`, `h_v288_quelle` (neu: `V41_E4_ROLLUP`, `V41_V288_CHECKPOINTS`; ohne Quelle `LEER`). Das Skript bricht ab, wenn die Schutzmenge aus V4.1 nicht genau der Katalogmenge entspricht.

## 3. Ergebnis [GEPRÜFT]
| Grösse | Wert |
|---|---|
| Schutzgrund | ARCHIV 191 (CH 154, AT 36, LI 1) · QA09 116 (CH 110, AT 6); deckungsgleich mit `schutz_307`, keine Überschneidung |
| E4-Policy (1'352 Website-Zeilen) | wie Quelle; DE/USA «nicht erfasst» |
| V288-Herkunft | 829 Zeilen (CH 322, USA 321, DE 107, AT 75, LI 4), davon 749 mit Quell-URL und SHA-256 des erfassten Texts; 80 ohne erfassten Quelltext |
| Bestehende Master-Werte | 0 geändert, gleiche 3'818 Zeilen in gleicher Reihenfolge |
| Gold / freigegebene Writes | 0 / 0 (unverändert) |

## 4. Tests [GEPRÜFT]
- `run_paket3.sh`: **56/56 PASS** (bisher 51; neu V01–V05: Schutzgrund 191/116 = Schutzmenge, Werte wörtlich aus E4, V288-Herkunft genau bei den 829, kein Gold, Herkunftsdatei; X09 um die zwei Herkunftscodes ergänzt).
- Website unberührt: Paket 7 41/41, Paket 10 12/12, Testsatz Stufe 1 auf Paket 10 ohne FAIL.

## 5. Hinweise
1. Im ZIP liegen weitere Inhalte (Projektbibel, Quellenarchiv mit 2'579 Erfassungen, EVT-Vorprüfungen). Sie sind Archiv (E033) und wurden nur so weit gelesen, wie §1 nennt.
2. Der Hinweis im ZIP zur Colab-Freigabe «anyone / writer» ist erledigt (ERLEDIGT A: auf «eingeschränkt» gestellt).

## 6. Drift-Prüfung
Nur Herkunftsspalten ergänzt. Keine Feldwerte, keine Sichtbarkeit, keine Website-Datei geändert.
