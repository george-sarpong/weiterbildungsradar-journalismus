# BERICHT Paket 4 – Owner-Entscheide zu Paket 3 angewendet (09.11.2026)

Grundlage: BERICHT_PAKET3 §9, Owner-Antworten 09.11.2026 (Auswahlfragen im Paket-4-Chat), Register E060–E070.
Ablage: Branch `claude/datenharmonisierung`, Ordner `claude-work/paket3/`. Nicht in diesem Paket: Website-Code, Suchlogik, Release, `main`, kostenpflichtige Läufe.
Beleg: [OWNER] Antwort George · [GEPRÜFT] gerechnet und per Test abgesichert.

## 1. Entscheide [OWNER]
| Frage | Entscheid | Register |
|---|---|---|
| A 6 echte Konflikte | wie vorgeschlagen: main übernehmen; PR10-Termin CAD-002 in Nachrecherche | E060 |
| B 18 Gruppenkonflikte | wie vorgeschlagen: 11 main-Felder, 7 Live-Termintexte | E061 |
| C 29 Live-Änderungen Schutz-IDs | Live bestätigt (inkl. PCC-P14, PCC-P21) | E062 |
| D 46 HOLD | Gruppe 1 (6) und Gruppe 2 (16) übernommen; **Gruppe 3 (8 NobleProg, 14 ORSYS) und AT-PROD-OFFER-154, PCC-P38 offen** (nicht beantwortet, Live-Wert gilt) | E063 |
| E 700 Felder Schutz-IDs | als Block übernommen | E064 |
| F1 Anbieterland aus country | nein ohne Beleg | E065 |
| F2 CH-Zugang bei CH-Ort | **ja**, CH-Durchführungsort gilt als Zugangsbeleg (präzisiert E030/E036) | E066 |
| F3 295 DE/USA archiviert/abgelaufen | archivieren bis Beleg | E067 |
| F4 30 ohne eindeutige URL | nicht zeigen | E068 |
| F5 Objektklassen | bestätigt, 151 Sammelobjekte als Programm | E069 |
| F6 Dedupe DJA/Maricopa | wie vorgeschlagen | E070 |

## 2. Umsetzung
- `config/owner_entscheide.csv`: 799 Fälle, je Fall Entscheid (GITHUB/LIVE/leer), Register-ID, Prüfwert über Live- und main-Wert. Erzeugt mit `scripts/paket4_owner_entscheide.py` aus der Owner-Liste Paket 3.
- `merge3.py --owner`: wendet Entscheide an; bricht ab bei veraltetem Entscheid (Prüfwert) oder Entscheid ohne Owner-Fall. Ohne `--owner` unverändert wie Paket 3.
- `build_master_p3.py`: Herkunftscodes MAIN_OWNER / LIVE_OWNER; F1–F6 (E065–E070). F6 gilt nur für die 5 benannten Zeilen, neue Verdachtsfälle bleiben offen.
- `paket3_listen.py`: Owner-Liste mit Spalten `entscheid_owner`, `register_id`, `status`; Warteschlange mit E063 (16 HOLD-Nachrecherchen) und E067.

## 3. Testergebnis [GEPRÜFT]
`GIT=… bash scripts/run_paket3.sh`: **51/51 PASS** (bisher 41; neu P01–P08 und Manipulationstests A05 veralteter Entscheid, A06 fremder Entscheid; angepasst M05–M07, X04, X09, X18, Q06).

## 4. Zahlen vorher (Paket 3) → nachher (Paket 4) [GEPRÜFT]
| Grösse | vorher | nachher |
|---|---|---|
| Owner-Fälle offen (Felder / Angebote) | 799 / 142 | 24 / 24 |
| Beta sichtbar JA | 3'442 | 3'445 (+3 Maricopa) |
| Beta NEIN | 6 | 349 (6 E016/E017 + 16 HOLD E063 + 295 E067 + 30 E068 + 2 DJA E070) |
| Beta offen | 370 (Owner 40, Aktualität 295, Quelle 30, Dedupe 5) | 24 (nur Owner-HOLD D Gruppe 3 + 2 Einzelfälle) |
| ch_zugang JA | 0 | 727 |
| Durchführungsort CH | 735 | 727 (E-Block korrigiert 12 Orte, v. a. ORSYS «Classe à distance» statt Lausanne/Genf: −9 CH, +1 CH) |
| Objektklasse Programm / Sammelobjekt | 1'535 / 151 | 1'686 / 0 (Kennzeichen `sammelobjekt` = JA: 151) |
| Terminstatus Website (zukünftig / vergangen / ohne Datum) | 334 / 324 / 694 | 407 / 247 / 698 |
| priceEligible im Kandidaten | 996 (= live) | 983 (= main; E-Block) |
| Kandidat neue Felder ggü. live | sessions 20 | sessions 41, publicationStatus 22, publicationReason 1 |
| Warteschlange (Prio 1/2/3) | 860 (1/92/767) | 720 (1/87/632): −151 Sammelobjekte, −5 Dedupe, +16 HOLD |
| Gold / freigegebene Writes | 0 / 0 | 0 / 0 |

## 5. Hinweise
- Der Kandidat bleibt ohne angepassten App-Code nicht veröffentlichbar: `app-v33.js` kennt `publicationStatus` nicht und wertet `sessions` kaum aus (GESAMTWISSENSSTAND §5 Punkt 6). Neu 22 HOLD und 41 `sessions`.
- B übernimmt bei 5 Angeboten das leere `endDate` aus main (PCC-P03, PCC-P05, PCC-P08, PCC-P28, V58-S1-07); 4 davon tragen dafür `sessions`, PCC-P08 ist HOLD. Mit dem heutigen App-Code wäre dort die Ausblendung nach Enddatum wirkungslos.
- E066 setzt CH-Zugang per Regel aus dem Ortstext; Sicherheitsgrad je Zeile in `ch_zugang_regel` (z. B. «ORT_ALTERNATIV_ODER_UNSCHARF»).

## 6. Offen
1. D Gruppe 3 (OFFER-NOBLE-004/-013/-014/-020/-033/-035/-037/-044, OFFER-ORSYS-054/-057/-063/-076/-078/-082/-083/-099/-118/-139/-141/-143/-144/-151) und Einzelfälle AT-PROD-OFFER-154, PCC-P38: HOLD-Grund in main nicht dokumentiert.
2. Übergabe-ZIP V4.1, Nachtrag Paket 3 im GESAMTWISSENSSTAND, Messung E056 (unverändert aus BERICHT_PAKET3 §9).
