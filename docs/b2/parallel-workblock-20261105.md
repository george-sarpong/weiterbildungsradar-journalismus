# B2 – Parallel-Arbeitsblock WB-20261105-01

**Arbeitsgrundlage:** Google-Drive-Control-Plane Band 02, zuletzt EVT211; PR #10 Draft-HEAD 6afc54928337c9d0e94becd0aa17099aacefa813. **Stichtag:** 05.11.2026, Europe/Zurich. **Keine Release-Freigabe.**

## Ziel und Grundsatz

Ziel ist **Website-Gold** für CH, DE, AT, LI und USA mit real nutzbaren Such-/Budget-/Zugangs-/Termin-/Ort-Funktionen. Die vorliegende Queue ist eine **Review-Fälligkeitsliste, keine Fehlerliste**. Auch ein E4-Quellenmatch ist weder ein bestätigter freier Platz noch E5/Live-Abnahme. Präzisionsregeln: Stable Offer != Occurrence != Programme; tatsächlicher Kursort != Firmensitz; Präsenz/Hybrid/Live/On-demand trennen; bedingte Preise != unbedingter Gratispreis; Zugang aus der Schweiz getrennt von Kosten; abgelaufene Termine nicht auf der Website anzeigen, nicht aus der Historie löschen.

**Verbindliche Aufteilung:** 1’352 Offer-IDs, 325 Sessions; 1’108 sichtbare Offers am Stichtag; 140 sichtbare Angebote mit früherem reviewAfter, davon exakt 39 mit Start/naechster Session 05.–19.11. und 101 weitere. Keine der Zahlen darf als Anzahl materieller Fehler deklariert werden. Die 39er-Evidencezustände stammen aus dem bestehenden `docs/b2/near-term-39-20261105.tsv`, nicht aus einer neuen Vollverifikation.

**Vorgehen:** zehn disjunkte Evidence-Lanes werden parallel gelesen/verifiziert; zwei unabhängige Produkt-/Release-Lanes parallel programmiert bzw. vorbereitet. Schreibzugriffe sind **nur ein atomarer Writer** in Batches zu höchstens 4–8 unterschiedlichen Offer-IDs; jedes B2-Paket mit vorbestehendem Git-HEAD-Lease, exakt dokumentierten Quellversionsbelegen, Diff-Guard, CI, Git-Readback und Control-Plane-Event. Kein unbelegter Preis-/Datum-/Venue-Patch; kein pauschales `reviewAfter`-Refresh.

## Zehn unabhängige Fall-Lanes (140 / 140, exklusiv)

| Lane | Anzahl | Konkretes Arbeitsziel | Fertig-Kriterium |
|:---|---:|:---|:---|
| N01_JOURNALISM | 15 | MAZ/CFJM: aktuell startende journalistische Kurse, Edition und Anmeldekontext, insbesondere MAZ149 Scope und CFJM018 | Titel/Edition/Ort/Tarif/Anmeldestatus quellenbezogen; unklare Zielgruppe HOLD |
| N02_PCC | 8 | PC-COLLEGE startnah: CH-Durchführung, Alias, Dauer, Schweizer Tarife | Exakte Schweizer Edition, keine Alias-/Preisübertragung von DE |
| N03_OTHER | 16 | Dawan/ifage/Helias/ORSYS/ITTA/MW/Schreibszene/VSM startnah | Aktueller Terminstatus; bekannte NO_CHANGE beibehalten, Buchung nicht raten |
| R01_DJA | 21 | DJA nächster offener Intake unbekannt, 21 bereits technisch als BOOKING-Alternative markiert | Neue offizielle Bewerbungsrunde belegt oder als unbestätigt belassen |
| R02_RUNNING | 11 | Laufende Angebote ohne Session-Array; Späteinstieg nicht pauschal behaupten | Nachweis einer tatsächlich neuen Anmeldemöglichkeit oder BOOKING-Warnung |
| R03_JOURNALISM_LATER | 9 | MAZ/CFJM spätere Editionen 2026/27 | Kurstermin/Ort/Zielgruppe und Konditionstarif quellenbezogen |
| R04_PCC_LATER | 15 | PC-COLLEGE Schweizer Folgeeditionen, darunter P01 Konfliktfall | Quellen-/Tarif-/Aliasversion positiv; sonst spezifischer HOLD |
| R05_TECH_LATER | 26 | ifage/Studio1/ITTA/Cadschool/DAWAN/Microwin/BeVisible spätere Editionen | Dates/Session/Ort/Preis-Variant getrennt, keine Duplikate |
| R06_SINGLE_LATER | 9 | MAZ/ORSYS/PCC/MW/Cadschool/AT nächster Einmalstart | Aktueller positiver nächster Start oder belegter HOLD |
| R07_UNDATED | 10 | AT-Studien-/Journalismusprogramme und LI-Register; teils Monat bekannt, maschinenlesbarer Tag fehlt | Keine erfundene Tagespräzision; Zugang CH, Bewerbungsfenster und Quellfakten prüfen |

Die vollständigen 140 IDs und die disjunkte Lane-Zuteilung liegen in `docs/b2/parallel-review-140-20261105.tsv`. Erzeugbar/revalidierbar mit `node scripts/b2-parallel-workblock.cjs --as-of=2026-11-05 --assert-locked`. Bei anderem Stichtag **neuen Successor** erzeugen, nicht diese historische Momentaufnahme überschreiben.

## Parallele Produkt-Lane P01 – Website-Funktionalität

**WDA-01 – Budget und Währung:** Direkte Preis-Passung nur bei vollständig eingrenzbarer Gesamtsumme; CHF/EUR/USD 1:1 als deklarierte *Planungsannahme*, nicht als Devisenkurs. Preiswarnung/Tarifberechtigung/Steuern/optionale Kosten testen. Angefangene und ohne neue Intake-Frist publizierte Angebote nicht als sofort buchbar bewerben.

**WDA-02 – Natürliche Suche:** In `app.js` erkannte Dauerangaben und `Keine Gratisangebote` werden aktuell als *erkannt, nicht angewendet* angezeigt. Zuerst Semantik/Sidecar strukturieren, dann echte Filter implementieren – keine still erfundene Dauer/Preis-Erkennung. Redesign von `CHF 800 Datenjournalismus` und `KI online unter CHF 300` als dauerhafte Browsertests.

**WDA-03 – Kursort/Format:** Angezeigter Ort = reale Durchführung (z. B. Präsenz, Lausanne/Genf, Online, Hybrid/On-demand), nicht Anbieteradresse. Session- und Parent-Felder getrennt; Online vs Distance/FOAD und Venue differenziert.

**WDA-04 – Evidenz/Verfügbarkeit:** Trennung `Finanziell passend`, `Teilnahme aus CH möglich`, `nächster Termin bekannt`, `Anmeldung offen`, `Plätze verfügbar`. Die letzten beiden keinesfalls ohne aktuelles providerseitiges positives Buchungs-/Platzsignal behaupten. Unbekannte Kursstarts bleiben sichtbar als Weiterbildungsangebote, aber nicht als buchbare Starts.

**WDA-05 – Suchqualität/Barrierefreiheit:** Filter+Sortierung+Favoriten+leere Ergebnismengen+Mobil/Keyboard+Browser-Regressions; überprüfbare semantische Labels und Grenzfälle anstatt nur optischer QA.

## Parallele Release-/Integrations-Lane P02

Nur `integration/media-skills-smart-search-20261025`, PR #10. **Keine** Änderungen auf `main`, keinem Google-Drive-Master, FTP/Hosting/Website-Publikation ohne gesonderte ausdrückliche Owner-Freigabe. CI = lokale Regression, **nicht** gehostete Abnahme. E4/G2 national und E5/G3 gehostet getrennt nachweisen. DE/USA nicht allein wegen fehlender aktueller Review-Due-IDs zu Gold deklarieren. Scope bleibt CH/DE/AT/LI/USA, keine Erweiterung um FR/IT/UK/ES.

## Verarbeitungsvorschrift je Lane

1. Exakte Offer-IDs aus Queue laden, aktuelle SourceURL und Drive-Evidence-Reuse prüfen. Keine bereits absorbierten alten E4-Pakete wieder recherchieren.
2. Pro ID nur materielle Felder vergleichen: `title`, `focus`, `journalistic_scope`, `access`, `price`/Tarife/Steuern, `language`, `level`, `duration`, `format`, `start/end/availability`, `delivery_location` (nicht Firmensitz), SourceURL und Review-Frist.
3. Pro ID Ergebnis zwingend genau eines: `FIELD_DELTA_PROVEN` mit Quellen-/Versionsbeleg; `NO_CHANGE_REUSE` (bereits belegt); `SOURCE_VERSION_HOLD`; `OWNER_SCOPE_HOLD`; `NOT_BOOKABLE_YET` (keine Bestätigung). Keine erfundenen `PASS`-Labels.
4. Alle unabhängigen Lanes gleichzeitig **lesen und vorbereiten**; nur ein Writer materialisiert disjunkte Mini-Batches. Vor jedem Writer PR-HEAD und Drive-Successor erneut vergleichen, danach GitHub-CI und Readback.
5. Jeder Batch protokolliert `parent_sha`, `new_head_sha`, `stable_offer_ids`, `fields_changed`, `evidence_url`, `edition_version`, `CI_RUNS`, `readback`, `unresolved_holds` im Drive-Logbuch. Nur bestätigter Successor zählt.

## Priorisierung und Stop-Regeln

- **P0:** Konkrete aktuelle Buchungs-/Tarif-/Ort-Fehlinformation; erst dann sichere Code-/Datenkorrektur.
- **P1:** Neue kommende Edition 2026/27, Scope-/Tarifkonflikt, unfertiger Website-Filter mit belastbarem Feldvertrag.
- **P2:** Bereits belegte oder nur kalenderseitig fällige Wiedervorlage; NO_CHANGE abschliessen, nicht künstlich wieder öffnen.

Keine Rücknahme bestätigter Termine bloss wegen dynamisch anderer Kurzliste; keine Hersteller-Academies und reinen PR-Angebote ausserhalb des journalistischen Scopes. Immer eindeutige Stable-Offer- und Session-Identitäten erhalten. Das gesamte Vorhaben ist fertig **erst wenn** Website-Gold-Nutzbarkeit national belegt und ein separater Release-Gate positiv abgeschlossen ist; bestandene Draft-CI allein genügt nicht.

## Zwischenstand dieses Batches

- B2 PR10 HEAD vor Erstellung des Workblocks: `6afc54928337c9d0e94becd0aa17099aacefa813`, bisherige Produktregressionen PASS.
- Originalliste 39 auf Identitäten, Datenbestand und 14-Tage-Differenz abgeglichen, `39/39 MATCH`.
- 140 sichtbare Due-ID-Fälle neu disjunkt in zehn Lanes eingerastert, 140/140 Unique; keine Offer-Daten dafür verändert.
- Aus öffentlich aktuell abgerufener MAZ-Quelle: `OFFER-MAZ-149` Zielgruppe ausdrücklich Kommunikationsfachleute aus Unternehmen/Agenturen/NPO, journalistischer Scope nicht abschliessend positiv; bleibt `OWNER_SCOPE_HOLD`. Keine automatische Löschung.
