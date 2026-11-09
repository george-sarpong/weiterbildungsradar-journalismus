# GESAMTWISSENSSTAND mediaskills.ch – Fassung 1, Stand 09.11.2026

Status: **Vom Owner abgenommen 09.11.2026 (E049).** Dieses Dokument ersetzt `claude/STATUS_20261109.md` als Einstieg für jeden neuen Chat.
Lesereihenfolge: dieses Dokument → `ENTSCHEIDUNGSREGISTER.csv` → `ERLEDIGT.md` → bei Bedarf `QUELLENVERZEICHNIS.md`, `WIDERSPRUECHE.md`.
Vorrang: jüngster datierter Owner-Entscheid im Register. Alles ältere Material (Projektbibel, Control Plane, MS_S00, Claim-Register, Handoff Phase A, CP01, ChatGPT-Übergabe) ist **Archiv**: Beleg, kein Auftrag.
Beleg: [OWNER] · [GEPRÜFT] von Claude gezählt/gerechnet · [GELESEN] Original gelesen · [CHATGPT] nur Übergabe · [NOTIZ] frühere Claude-Chats, Original nicht gelesen. E… = Register-ID.

## 1. Projekt in Kürze

mediaskills.ch ist ein nicht-kommerzieller Weiterbildungsradar für Schweizer Medienschaffende. Betreiber und einziger Entscheider: George Sarpong. Claude baut, testet und harmonisiert Daten und Wissen; ChatGPT gibt nur Zweitmeinungen; George entscheidet und lädt auf Infomaniak hoch (E033). Ablauf: Daten harmonisieren → Website überarbeiten → Beta → BOSW (E034, E046).

## 2. Geltende Leitentscheide (Kurzfassung)

**Rollen und Ablauf**
- Zuerst Wissen und Daten harmonisieren: eine Master-Tabelle, maschinell abgeglichen, Lücken in die Nachrecherche-Warteschlange (E034).
- Basis ist der Live-Stand; GitHub wird per Dreiwege-Merge als «Best of» eingebracht; Owner entscheidet nur echte Konflikte und geschützte IDs (E035).
- GitHub nur auf `claude/datenharmonisierung` (E041). Beta live erst nach Tests und rund 20 Minuten Owner-Abnahme (E040). Kostenpflichtige Läufe nur mit Freigabe (E027, E047).

**Scope**
- Länder CH, DE, AT, LI, USA; FR/IT/UK/ES nur zur Deduplizierung (E003). Schweizer Website, DE/US-Kurse nur unter dem Aspekt Teilnahme aus der Schweiz (E046).
- Journalismus inkl. übertragbarer Praxis-Skills; reines PR/Marketing, fiktional-spezialisierte Gewerke und Herstellerschulungen OUT (E004, E005). Katalog ist kuratiert, keine Vollständigkeitsbehauptung (E006).
- Beta zeigt alle vorhandenen Daten inkl. DE/USA, fehlende Felder als «nicht erfasst» (E036); OUT/HOLD-Zeilen nicht sichtbar (E042).

**Datenregeln**
- Objektklassen trennen (Anbieter, Stable Offer, Durchführung, Programm, Event, Service) (E029). Nichts erfinden, Unbekanntes sichtbar, Herkunft je Feld, keine stillen Überschreibungen (E031, E047).
- Länder: vier Felder `release_markt`, `anbieter_land`, `durchfuehrungsort` (+ Sicherheitsgrad), `ch_zugang`, ISO-3166-1 (E043). CH-Zugang nie geraten (E030, E036).
- Vergangene Durchführungen behalten, nicht als bevorstehend zeigen; Angebote ohne aktuelle Kurse archivieren (E014, E015). ORSYS «Lausanne und Genf» genügt (E013).
- Anbieterbeschreibungen als gekennzeichnetes Snippet mit Quellenlink (E038).

**Preis und Suche**
- CHF/EUR/USD 1:1 als Rechengrundlage, Originalwährung zeigen, Hinweis «zum Tageskurs nachrechnen»; GBP nicht nominal (E009, E037).
- Budget rechnet nur mit Kursgebühren inkl. Pflichtgebühren (E054). Direkter Budgettreffer nur bei vollem unbedingtem Preis; Tarife (Mitglied, Journalist:in, Freie) sichtbar und als bedingt markiert; unbekannter Preis nie als Treffer (E010, E039).
- Preisspanne: Obergrenze ≤ Budget = direkter Treffer, Untergrenze ≤ Budget < Obergrenze = möglich (E051). Trefferklasse «knapp über Budget» bis 15 % (E053). «Kostenlos» / «Kostenlos mit Bedingung: …» / «Preis unbestätigt» (E052, E057). Merkliste mit Summe und Restbudget nur aus bestätigten Preisen (E059).
- Bei Budgetsuche 2–3 begründete Alternativen, kein Ranking, keine «Top-Empfehlung» (E039). Keine redaktionelle Rangfolge, Standardsortierung «Zuletzt geprüft» (E020).
- Kursform/Preis nur bei nachweislich gleicher Variante bzw. Durchführung; bestätigte Kursform nur bei Evidenz VERIFIED (E011).
- Dauer wie Preis: belegt passend = Treffer, unbekannt = eigene sichtbare Gruppe, länger = Alternative; kein Hartfilter (E021, E058).
- Smart-Suche im Browser, kein Speichern des Eingabetexts, kein ausgehendes Tracking (E012). Datenschutz hat Vorrang; Messung nur gemäss Schweizer Datenschutzrecht (E056).

## 3. Datenbestand (Zähleinheiten nie vermischen)

| Bestand | Zahl | Einheit | Beleg |
|---|---|---|---|
| Live-Website `data-a1-86ff68ddc9ac.js` | 1'352 | Angebote (CH 1'223 + AT 124 + LI 5) | QV #12 [GEPRÜFT] |
| davon live sichtbar am 09.11. | 1'097 | Angebote (Ausblendung nur nach Enddatum) | STATUS §2 [GEPRÜFT] |
| Gesamtbrücke Target5 | 3'818 | market+id (1'352 + DE 111 + USA 2'355) | QV §3 [GEPRÜFT] |
| DE in R4 | 111 | Publikationszeilen (100 + 8 + 3) | QV #7 [GEZÄHLT] |
| USA in R4 | 2'355 | Publikationszeilen (2'290 + 58 Knight + 5 + 2) | W2 [GEPRÜFT] |
| Schutz-IDs | 307 | IDs (191 Archiv + 116 QA09) | STATUS §2 [GEPRÜFT] |
| Nicht in Beta (→ Nachrecherche) | AT 103, LI 3, CH 220 | OUT/HOLD bzw. R4 ohne R43 | W9 [OWNER] |
| Freigegebene Feld-Writes / Gold | 0 / 0 | – | STATUS §2 [GEPRÜFT] |

Historische Zähler ohne operative Bedeutung: DE 317 (Research), USA 2'312/2'326 (Research), CH 641 (Foundation-Routen bzw. leere startDate), AT 227 (Owner-Zeilen) – siehe W2, W3, `ERLEDIGT.md` B.

## 4. Website-Stände

| Stand | Kennung | Rolle |
|---|---|---|
| Live (Infomaniak) | Paket A: `index.html`, `app-v33.js`, `data-a1-86ff68ddc9ac.js`, `smart-search-data-a1-a38a2a2b2391.js`, `styles-v24.css`; Snapshot `claude-work/live-snapshot-20261109/` | **Basis** (E035, E044) |
| GitHub main | 5f09e078 | Merge-Quelle |
| PR10 (Draft, nicht gemergt) | 82bb95f9 | Merge-Quelle, nicht weiterentwickeln (E033) |

Dreiwege-Merge `data.js` (Basis 11.10.) [GEPRÜFT, STATUS §2]: 764 Felder/274 Angebote nur GitHub geändert · 77 Felder/59 Angebote nur live · 10 echte Konflikte · 16 Live-Änderungen an Schutz-IDs. Ausserdem auseinandergelaufen: `smart-search-data` (priceEligible live 996 / main 983 / PR10 757), `index.html`, App-Code.
Was PR10 zusätzlich kann: `ERLEDIGT.md` Abschnitt D.

## 5. Bekannte Umsetzungslücken auf live (Entscheid besteht, live fehlt)

1. Hinweis «zum Tageskurs nachrechnen»; Fremdwährung gilt live als «Preis unbekannt» (E037) [GEPRÜFT].
2. Erste Sortieroption live «Redaktionelle Auswahl» statt «Zuletzt geprüft» (E020) [GEPRÜFT, Snapshot].
3. 151 sichtbare Angebote mit vergangenem Startdatum (E014) [GEPRÜFT].
4. 46 HOLD-Sperren aus main fehlen live (STATUS §2) [GEPRÜFT].
5. Feld `country` mischt Markt, Sitz und Ort: 19 «Frankreich» (Ateliers), 2 «CH_ACCESS Chiasso» (MiTech), 22 DJA als «Schweiz» trotz Sitz Berlin (E043; Audit 28.10. WDA-02) [GELESEN].

## 6. Offene fachliche Befunde (keine Entscheide, Bearbeitung im Merge bzw. Master)

| ID | Befund | Stand | Beleg |
|---|---|---|---|
| WDA-01 | Budget mit Preisspanne: liegt die Obergrenze im Budget, wird trotzdem nur «möglich» gezeigt (z. B. OFFER-DJA-009, EUR 480–512 bei CHF 800); 18 Kandidaten | Regel entschieden (E051), Umsetzung offen | Audit 28.10. B [GELESEN] |
| WDA-03 | «Kostenlos» meint in Filter und Smart-Suche Verschiedenes (22 vs. 15 ohne Bedingung) | Trennung entschieden (E052), Bezeichnungen offen; Code-Entwurf in PR10 | Audit 28.10. D [GELESEN] |
| WDA-04 | Online/On-Demand: 428 Angebote, nur 90 mit VERIFIED-Kursform | Abdeckungslücke, kein Bug | Audit 28.10. E [GELESEN] |
| WDA-05 | AT-PROD-OFFER-208 zeigt vergangene Gratis-Septembertermine als Preis | Einzelfall, Nachrecherche | Audit 28.10. F [GELESEN] |
| W3 | CH 641 Foundation-Bericht ungelesen | nur lesen, falls für Beta nötig | WIDERSPRUECHE |
| W8 | AT 227 Owner-Zeilen vs. 224 R4-Zeilen (3 Objekte) | Klärung über AT-Parent R2 | WIDERSPRUECHE |
| CAD-005 | Sidecar ohne Preisoptionen, Kursform UNKNOWN | Nachrecherche bzw. Merge | Handoff §9.34 [GELESEN] |
| Hold FAM04-C07 | CH-V47 NEWSROOM-Geschwisterzeile ohne Owner-Disposition | Nachrecherche (E055) | Handoff §3.3 [GELESEN] |
| Hold FAM05-C04 | AT oe24: Anbieter-ID-Zuordnung unbewiesen | Nachrecherche (E055) | Handoff §3.3 [GELESEN] |
| Hold FAM14-C05 | CFJM 2027: -005 und -012 belegt; -013 und -015 ohne Editionsbeleg | Nachrecherche für -013/-015 (E055) | Handoff §3.3, §9.33 [GELESEN] |

## 7. Release- und Prüfmodell

Gilt: E040 (Tests + Owner-Abnahme) und Projektregel 7 (getestetes, versioniertes Paket mit Rollback). Die alten Stufen G0–G3/E0–E5 der Projektbibel sind Archiv; brauchbar bleibt die Unterscheidung «Metadaten gefunden / Original gelesen / Feld belegt / heutige Anbieterquelle / live geprüft» als Beleggrad je Feld. Testkriterien für die Beta sind noch festzulegen (STATUS §5).

## 8. Archiv-Fundstellen (nur lesen, nicht fortschreiben)

Projektbibel Band 01 `1Thna9EVLMSrvmxor0mUA056kDzBI05_4J6IW89SuJGI`, Band 02 `1zOTSwhCC8-1IQDxI5HgwpPC__LAc2zGuDXFtM2Pj-Cs`, Band 03 `1b1Zx5sjZuqYrEQr6zy9xlxs0eW7R4iDOpEBFl8ZeXsw` · Claim-Register `1bBDP8Nm0uY5Sr1b7SiKfhV1kPhJEk8IkFWX-YMTYbh0` · Handoff Phase A `1xal-qeanjwiAds-C1l0azZ9X7XKJCGrHiZVEEE7cMuE` · Project Core CP01 `1sBd9_4o5FOk2hjrP7tDo2AyFVkOPo1WW0mw2GzWQgyg` · End-to-End-Audit `1mv4fmYveqPsBw849T5w_NbEq-22xubTxZwrltCWZiFE` · ChatGPT-Übergabe (Wissensbasis). Weitere IDs: `QUELLENVERZEICHNIS.md`.

## 9. Nächster Schritt

Paket 3: Master-Tabelle und Dreiwege-Merge. Die offenen Entscheide in Abschnitt 10 blockieren Paket 3 nicht; sie betreffen die spätere Suchlogik.

## 10. Offene Owner-Entscheide

Entschieden am 09.11. (Paket-2-Chat): E049–E059. Noch offen:
1. **Messung**: konkrete Ausgestaltung gemäss E056 (Schweizer Datenschutzrecht) vor Beta-Start recherchieren und vorlegen.
