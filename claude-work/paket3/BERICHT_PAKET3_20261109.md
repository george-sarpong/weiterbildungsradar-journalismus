# BERICHT Paket 3 – Dreiwege-Merge und Master-Tabelle (Fassung 2, 09.11.2026)

Grundlage: E034, E035. Ablage: GitHub `claude/datenharmonisierung`, Ordner `claude-work/paket3/` (README und gleichlautender Bericht dort). Kein Website-Code, kein Release, `main`, PR10 und Infomaniak unberührt, keine kostenpflichtigen Läufe.
Fassung 2 = nach Detailprüfung, Korrekturen und Drift-Prüfung. Beleg: [GEPRÜFT] = gerechnet und per Test abgesichert; [REGEL] = abgeleitet, kein Beleg.

## 1. Stand
- Lauf: `GIT=… bash claude-work/scripts/run_paket3.sh` (offline, ca. 10 s). **Tests 41/41 PASS** (inkl. 4 Manipulationstests) [GEPRÜFT].
- Dreiwege-Merge `data.js` + `smart-search-data.js` (`scripts/merge3.py`): Basis 86868e0 (11.10.), Live-Snapshot = massgeblich, GitHub = main 5f09e078. PR10 82bb95f9 nur als Vergleichsliste (85 Angebote `data.js`, 326 Smart-Sidecars), nie übernommen [GEPRÜFT].
- Master 3'818 market+id (`out/master_3818.csv`, Herkunft je Feld in `h_*`, Langformat `master_herkunft_lang.csv.gz`) [GEPRÜFT].
- Owner-Liste 799 Felder / 142 Angebote (`out/owner_liste_uebersicht.md`, `out/owner_liste.csv` mit Spalte `entscheid_owner`).
- Nachrecherche-Warteschlange 860 Zeilen (`out/nachrecherche_warteschlange.csv`): 354 aus Auftrag Punkt 4, 506 markierter Zusatz aus Master/Merge (E034). Prio 1: 1 · Prio 2: 92 · Prio 3: 767.

## 2. Kontrollzahlen GESAMTWISSENSSTAND §4 [GEPRÜFT]
| Zählung | §4 alt | Vergleich mit PR10 | Vergleich mit main (Auftrag) |
|---|---|---|---|
| nur GitHub geändert (Felder/Angebote) | 764/274 | 764/274 | 655/215 |
| nur live geändert | 77/59 | 77/59 | 81/61 |
| echte Konflikte | 10 | 10 | 6 |
| Live-Änderungen an Schutz-IDs (Angebote) | 16 | 16 | 18 |

§4 ist exakt reproduziert, beruht aber auf PR10 statt main (GESAMTWISSENSSTAND nachgeführt). priceEligible live 996 / main 983 / PR10 757 bestätigt. Die Smart-Search-Datei wurde auf main nur an Schutz-IDs geändert (211 Felder, 104 Angebote).

## 3. Merge-Regeln (je Datei, Angebot, Feld)
Unverändert/nur live/beide gleich → Live · nur main → main automatisch (109 Felder, 79 Angebote, nur Nicht-Schutz-IDs) · echter Konflikt, Gruppenkonflikt (Termin/Preis/Ort), jede Änderung an einer der 307 Schutz-IDs, HOLD aus main → Live-Wert bleibt, Owner entscheidet. Jede Abweichung von der Basis steht in `merge_feldentscheide.csv`.

## 4. Owner-Liste (bis zum Entscheid gilt der Live-Wert)
| Kat. | Inhalt | Felder / Angebote | Vorschlag |
|---|---|---|---|
| A | Echte Konflikte, alle an Schutz-IDs, Termine vor Stichtag | 6 / 6 | main übernehmen; CAD-002: PR10-Termin 23.–24.11. in Nachrecherche |
| B | Gruppenkonflikte Termin (live nur umformuliert, main ergänzt Durchführungen) | 18 / 7 | main-Felder übernehmen (11), Live-Wortlaut behalten (7) |
| C | Live-Änderungen an Schutz-IDs | 29 / 18 | Live behalten; neue Termine nur PCC-P14 und PCC-P21 (Stand 14.10.) |
| D | HOLD aus main, live fehlend | 46 / 46 | HOLD übernehmen (E042); 6 davon ohnehin E016/E017 |
| E | main-Änderungen an Schutz-IDs (49 main-Commits 17.–24.10., überwiegend QA09) | 700 / 133 | als Block übernehmen, Ausnahmen einzeln |
| F | Zusatz: Grundsatzfragen (siehe §9) | – | – |

## 5. Master 3'818
- **Objektklasse** [REGEL, Tabelle `objektklassen_zuordnung.csv`]: Stable Offer 1'996 · Programm 1'535 · Event 104 · Service 5 · Durchführung 3 · Sammelobjekt 151 · unklar 24.
- **Vier-Felder-Modell (E043):** `release_markt` überall (ISO). `anbieter_land` nur 22 DJA = DE (Audit 28.10.), sonst «nicht erfasst»; `country`-Rohwert nur als Kandidat. `durchfuehrungsort_land` [REGEL] aus Ortstext: CH 735, AT 78, LI 4, DE 5, Ausland/mehrere Länder 7, nicht erfasst 523; Sicherheitsgrad je Zeile. `ch_zugang` überall «nicht erfasst» (E030, E036).
- **Deduplizierung DE/USA (E008):** keine sichere Dublette mit dem Bestand. 2 Verdachtsfälle DJA (DE V112-47/-48 ↔ OFFER-DJA-012/-010), 3 Verdachtsfälle «gleiches Programm, anderer Anbieter» (Maricopa-Colleges USR-785/-788/-793).
- **Beta-Sichtbarkeit (Vorschlag, kein Entscheid):** ja 3'442 · offen HOLD 40 · offen Aktualität 295 · offen Quelle 30 · offen Dedupe 5 · nein 6 (E016/E017).
- Terminstatus Website-Bestand am 09.11.: zukünftig 334 · vergangen 324 · ohne Datum 694. 0 Gold, 0 freigegebene Writes.

## 6. Korrekturen aus der Detailprüfung (Fassung 1 → 2)
1. Ortsregel ohne Wortgrenzen («Klagenfurt» → fälschlich CH), fehlende Orte, «Zürich, Bern» als ein Ort, «Digicomp» als Ort: behoben (Tests X15/X16).
2. 3 «interne Dubletten» waren dasselbe Programm an verschiedenen Colleges: jetzt Verdacht statt unsichtbar (X18).
3. 295 DE/USA-Zeilen mit R4-Vermerk archiviert/abgelaufen/geschlossen waren sichtbar (Widerspruch E014/E015): jetzt offen (X17).
4. 30 Zeilen ohne eindeutige URL (frühere SOURCE_IDENTITY_HOLD) waren sichtbar: jetzt offen und in der Warteschlange (Q05).
5. Umformulierungsregel bei Termintexten (PCC-P29) und Objektklassen-Regel «CPD» zu grosszügig: korrigiert.
6. Zwei identische Live/main-Preiskorrekturen an Schutz-IDs (MW-P05, OFFER-EBU-013) fehlten in der Owner-Liste: ergänzt (Kat. C).
7. Drift: Vorschlag zu F2 entschärft (CH-Ort nur als Hinweis, kein Zugangsbeleg); Warteschlange markiert Zusatzfälle (Spalte `auftrag`).

## 7. Befund für die spätere Website-Arbeit (nicht in diesem Paket)
`app-v33.js` kennt `publicationStatus` nicht und wertet `sessions` kaum aus. Übernommene HOLD-Sperren würden live nichts ausblenden; der Merge-Kandidat enthält bei 20 Angeboten neu `sessions`. Der Kandidat ist nur zusammen mit angepasstem App-Code veröffentlichbar.

## 8. Grenzen
- Übergabe-ZIP V4.1 (Drive `1qZvJHImOlLp0PpQ2EC6PnmfydoauJgtv`, 14,8 MB) über den Drive-Connector nicht ladbar (Limit 10 MB). Ersatz: Arbeitskatalog-XLSX (Drive `1IDwc5qM-sbZu2HOKq6Ba7x3mqAjk12b7`, Website-Teil = PR10, geprüft) und R4-Sheet `1s6nKTq5…` (= PR10-Staging, geprüft). Folge: 307 Schutz-IDs nur ja/nein, Aufteilung 191/116 nur für 29 IDs; V288-Provenienz und E4-Rollup nicht im Master. `build_master.py` (alt) unverändert; Nachfolger `build_master_p3.py`.
- WDA-04 auf heutigem Stand 532/56 (Audit 28.10.: 428/90, andere Zählbasis) → Sammelzeile.
- FAM04-C07 und FAM05-C04: keine Angebots-ID in Live oder R4 auffindbar.

## 9. Offene Owner-Entscheide
1. Owner-Liste A–E (E als Block?).
2. F1 Anbieterland aus `country`-Rohwert? (1'328 Website-Angebote) – Vorschlag: nein ohne Beleg.
3. F2 CH-Zugang bei genanntem CH-Durchführungsort? (735) – Vorschlag: nein, nur Hinweis.
4. F3 295 DE/USA-Zeilen mit Archiv-/Abgelaufen-Vermerk zeigen oder archivieren? – Vorschlag: archivieren bis Beleg.
5. F4 30 Zeilen ohne eindeutige URL nicht zeigen? – Vorschlag: ja.
6. F5 Objektklassen-Regeln und 151 Sammelobjekte – Vorschlag: als Programm führen.
7. F6 Dedupe-Verdacht DJA (DE-Zeile als Dublette) und Maricopa (je Anbieter behalten).
8. Übergabe-ZIP V4.1 hier anhängen oder Teil-ZIPs einzeln in Drive.
9. Nachtrag Paket 3 im GESAMTWISSENSSTAND bestätigen.
10. Messung gemäss E056 (unverändert offen).
