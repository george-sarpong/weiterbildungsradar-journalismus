# BERICHT PAKET 31 «Lücken füllen», zweiter Durchgang, 24.11.2026

Grundlage: Owner-Entscheide E266–E268, E271, E272; Befunde E269, E270 (erster Durchgang), E273 (dieser Durchgang).
Arbeitszweig `claude/datenharmonisierung`, gepusht. Kein Release, kein Merge.
Beleg: [GEPRÜFT] von Claude gemessen oder getestet.

## 1. Ergebnis in Kürze

- **Lauf 029** (E271): 53 Mediencampus-Kurse mit «Privatseminar» (48) oder «Privatkurs» (5) gelten als «Termin nach Vereinbarung», mit Prüfdatum 23.11. und Beleg der Anbieterseite. Den Wert «Termin nach Vereinbarung» hatte der Master schon. Die Lehrgänge 010, 030 und 043 nennen auf der Seite weder einen Termin noch «Privatseminar» und gehen an den Owner. [GEPRÜFT]
- **Lückenregel berichtigt:** Ein Termin «auf Anfrage» oder «nach Vereinbarung» gilt als vollständig, wenn die Anbieterseite ihn bestätigt (Herkunft `ANBIETERSEITE_P31`), wie in E268 entschieden. Bisher zählte er als Lücke.
- **Lauf 030** (E272): 288 Zellen bei 81 Angeboten.
  - ORSYS: 43 Kurse mit ganzer Terminliste, zusammen 159 künftige Termine, alle «Classe à distance» (online). Die Gegenprobe fand jedes Datum auf der Seite (159/159). 15 ORSYS-Seiten haben gar keinen Abschnitt «Dates et lieux».
  - 35 neue Kurslinks nach der Nachfolgesuche (ifage 22, fjum 4, PC-College 5, weitere). Übernommen wurde ein Link nur, wenn der Titel wörtlich auf der neuen Seite steht.
  - Dazu Termine, Preise und Niveau von den neuen bzw. jetzt lesbaren Seiten.
- **Termin vollständig:** 657 am 23.11. → 706 am 24.11. von 1'302. Sichtbar am 24.11.: 1'103 → 1'126. [GEPRÜFT]
- **MAZ-Termine nicht erreicht:** Die Kursseiten verweisen je Kurs auf `my.maz.ch/public/Ereignis/PublicList?angebote=…`. Diese Seite lädt die Termine nur per JavaScript, der Abruf liefert leeren Text. Den Weg über die interne Schnittstelle von my.maz.ch habe ich nicht verfolgt.
- **Restfälle:** 201 Angebote bei 56 Anbietern, davon 141 sichtbar, in `paket31/out/owner_liste_restfaelle_2026-11-24.csv`:
  - DEFEKT 91, UEBERSICHT 60, NICHT_LESBAR 36, KURS_WEG 4, ZWEIFEL 10
  - Die grössten Blöcke: CFJM 19, MAZ 16, ZLI 12, ÖMA 11, EJC 10

## 2. Vorgehen

1. **Stufe 1, Lauf 45339148257:** 358 Angebote abgerufen (ORSYS und MAZ mit Termin-Lücke, alle offenen Fälle aus dem ersten Durchgang). Ganze Seiten bis 40'000 Zeichen, Linklisten, bei toten Seiten die übergeordneten Pfade.
2. **Stufe 2, Lauf 45340574871:** Sitemaps von 46 Anbieter-Hosts (72'042 Adressen), Kandidaten aus den Linklisten, Startseite von my.maz.ch.
3. **Stufe 3, Lauf 45342063520:** 81 MAZ-Kursseiten mit Folgeadresse my.maz.ch und Kandidaten aus den Sitemaps.
4. **Auswertung:**
   - ORSYS mit einem Leser für die feste Vorlage «Dates et lieux». Kein Eintrag blieb unerfasst.
   - Kandidatenseiten und jetzt lesbare Seiten: 4 Lese-Agenten, 117 Seiten, Anleitung `paket31/lesen/ANLEITUNG_B.md`.
   - Übernahme mit Gegenprobe: `paket31/scripts/uebernahme_b.py`.
   - Durchsicht Claude mit 2 Ausschlüssen, festgehalten in `paket31/config/ausschluss_b.csv`: Bei MAZ-LEG-005 sind die Kandidaten nur News-Artikel von 2021. Bei ZB-005 widerspricht sich das Datum auf der Seite.
   - Bestätigen mehrere Seiten denselben Kurs, geht der Fall an den Owner, z. B. bei Tages- und Abendvariante (HEVS).
5. Kurstexte nur verschlüsselt im Laufprotokoll (neues Schlüsselpaar), nur lokal gelesen, nicht im Repo.

Code: `paket30/scripts/abruf.py` (Version p30-abruf-6) mit den neuen Optionen `--links`, `--eltern`, `--zusatz`, `--folge`, `--textgrenze` und `--ids` im Umfang `luecken`. Den Workflow habe ich um diese Optionen ergänzt. Ohne die neuen Optionen ist das Verhalten unverändert: P30 34/34.

## 3. Tests [GEPRÜFT]

- `eingang_pruefen.py`: 12 Dateien ohne Fehler.
- Master ohne Lauf 029: bytegleich mit dem Stand vor diesem Durchgang (SHA-256 f8b43358…).
- Tests: P24 14/14, Nachträge 14/14, P30 34/34.
- ORSYS-Gegenprobe 159/159.
- Neue Kurslinks: Titel aus dem Katalog und von der Seite stimmen überein. Die Liste steht in Lauf 030, Spalte `quelle`.

## 4. Offen für den Owner

1. **Owner-Liste Restfälle** (201): je Fall archivieren nach E015, eine neue Adresse nennen oder so lassen. Die Liste ist nach Anbieter geordnet.
2. **MAZ-Termine** (81 Kurse mit Lücke): im Chat mit Claude in Chrome prüfen (vgl. Bericht P30 §7.3) oder offen lassen.
3. **«Privatkurs»** (5 Kurse) wie «Privatseminar» nach E271 behandelt: bestätigen.
4. **Dawan** bleibt nach RFC 9309 gesperrt (40 Kurse mit Termin-Lücke).

## 5. Nicht Teil dieses Durchgangs

Release, Monatsbuild, ORSYS-Preise und andere Felder ausserhalb von E272, die 55 Fälle «Gegenprobe» aus dem ersten Durchgang.
