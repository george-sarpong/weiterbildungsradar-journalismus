"""Monatsbuild 24.11.2026, Zweifelsfälle verkleinern (E291): Ergebnis je Angebot für die 95 Zweifelsfälle des Vollaufs 45421480007.
Belege: Abruf auf dem Runner, Läufe 45496574482 (Volltext der 62 Seiten, Linklisten, Elternseiten, Sitemaps) und 45497656026
(Kandidatenseiten), Kurstexte verschlüsselt übergeben und nur lokal gelesen (Schlüsselpaar vom 24.11. abends). Schreibt nichts in den Master.
Aufruf (aus claude-work/): python3 -I paket30/scripts/zweifel_ergebnis.py"""
import collections, csv, pathlib, sys

sys.dont_write_bytecode = True
R0 = pathlib.Path(__file__).resolve().parents[2]
L1, L2 = "45496574482", "45497656026"
z = {x["id"]: x for x in csv.DictReader(open(R0 / "paket30/out/abgleich_2026-11-24.csv", encoding="utf-8")) if x["einordnung"] == "ZWEIFEL"}
R = {}


def s(ids, erg, beleg, vorschlag, lauf=L1):
    for i in ids.split(): R[i] = (erg, beleg, vorschlag, lauf)


s("OFFER-FF-004 OFFER-FF-005 OFFER-KLUBPRO-033 OFFER-KLUBPRO-039 OFFER-KLUBPRO-042 OFFER-KLUBPRO-044 OFFER-KLUBPRO-045 "
  "OFFER-SCA-001 OFFER-SCA-002 OFFER-SCA-003 OFFER-SCA-004", "E281", "bereits entschieden: Website derzeit nicht lesbar",
  "unverändert, nächster Monatsbuild (E281)", "")
s("OFFER-FOCAL-010 OFFER-MEDIENCAMPUS-010 OFFER-SFGZ-004 OFFER-UNIGE-011 OFFER-UNIGE-012 OFFER-UNIGE-013 OFFER-UNIGE-014", "E282",
  "bereits entschieden: Kurs belegt, fehlende Angaben «keine Angabe»", "unverändert (E282)", "")

BELEGT = [
    ("OFFER-AJM-002", "Seite MAJI «L’orientation Journalisme innovant»"),
    ("OFFER-BIG-007", "Kursliste «Analyse financière réalisée avec Excel» (Titel französisch)"),
    ("OFFER-BIG-008", "Kursliste «Visualiser les cas et les flux d'argent»"),
    ("OFFER-BIG-009", "Kursliste «Analyse des sources et des applications des fonds»"),
    ("OFFER-DSA-017", "Kursseite Web Analytics Lugano"),
    ("OFFER-DSA-001", "«Prossima Edizione 2027 | Corso Serale»"),
    ("OFFER-DSA-002", "«1^ Edizione 2027 | Corso Serale | Lezioni online»"),
    ("OFFER-MOSALE-003", "«Programmi di montaggio video»"),
    ("CH-V28-U04", "h1 «Master Film Dokumentarfilm und experimenteller Film»"),
    ("LI-REG-004", "«Wir bieten Workshops und Schulungen an»"),
    ("OFFER-MARS-001", "«Cours Indesign (Base à Intermédiaire)»"),
    ("OFFER-MARS-002", "«Cours Indesign (Avancé)»"),
    ("OFFER-MARS-004", "«Cours Illustrator (Base à intermédiaire)»"),
    ("OFFER-MARS-005", "«Cours Illustrator (Avancé)»"),
    ("OFFER-MARS-007", "«Cours Photoshop (Base à intermédiaire)»"),
    ("OFFER-MARS-008", "«Cours Photoshop (Avancé)»"),
    ("OFFER-MARS-016", "«Cours After Effect (Avancé)»"),
    ("OFFER-NICEPHORE-001", "«à partir de CHF 215 / mois»"),
    ("AT-PROD-OFFER-142", "«Grundkurs Frühling 2027: 15.-20. Februar 2027 …», EUR 990 / 1.300"),
    ("OFFER-PODCASTSCHMIEDE-003", "Abschnitt «Coaching»"),
    ("OFFER-SAEZH-007", "«Filmen mit dem Handy – Basics … 18.01.2027»"),
    ("OFFER-TEXTAK-001", "«Lehrgang Februar 2027 … 6.2.27», «regulär: CHF 2’199.-»"),
    ("OFFER-UNIBE-010", "«Module 4: AI for Imaging»"),
    ("OFFER-UNIBE-011", "Modulliste CAS AI for Creative Practices"),
    ("AT-PROD-OFFER-023", "Bachelor-Studiengang Medienmanagement"),
    ("AT-PROD-OFFER-034", "«Wir nehmen das ganze Jahr über Bewerbungen an»"),
    ("OFFER-CFPOCST-001", "Übersicht CFP-OCST «Web Creator … 02.02.2027 Lugano … CHF 1'800» (Kursseite leitet auf die Übersicht)"),
    ("OFFER-CFJM-002", "h1 «Prendre des photos publiables au smartphone», «12/03/2027 … 29/10/2027», CHF 590/400/300/130"),
    ("OFFER-CFJM-015", "h1 «Podcast: reportage et documentaire», «24/05/2027 28/05/2027 … 27/09/2027 01/10/2027», CHF 2'950/2'000/1'500/650"),
    ("OFFER-ATED-004", "«Modulo 631 – Progettazione di Interazioni Incentrate sull’Utente con AI – AI Booster» (Kurslink leitet auf …-bozza, Seite ist veröffentlicht)"),
]
for i, b in BELEGT:
    R[i] = ("BELEGT", b, "keine Master-Änderung: Kurs und Katalogwerte stehen auf der Seite; Zweifel kam vom Titelabgleich", L1)

ROUTINE = [
    ("OFFER-DIGICOMP-003", "Weiterleitung auf …/weiterbildung-digital-marketing-design/…; h1 gleich, «Preis 1'700.–»", "Kurslink = Ziel der Weiterleitung"),
    ("OFFER-DIGICOMP-049", "Weiterleitung auf …/formations-digital-marketing-design/…; h1 gleich, «Prix 1'400.–»", "Kurslink = Ziel der Weiterleitung"),
    ("OFFER-DIGICOMP-007", "Weiterleitung auf …/weiterbildung-digital-marketing-design/…; h1 gleich, «Preis 1'400.–»", "Kurslink = Ziel der Weiterleitung"),
    ("OFFER-DIGICOMP-052", "Weiterleitung auf …/formations-digital-marketing-design/…; h1 gleich, «Prix 1'400.–»", "Kurslink = Ziel der Weiterleitung"),
    ("OFFER-DIGICOMP-063", "Weiterleitung auf …/weiterbildung-digital-marketing-design/…; h1 gleich", "Kurslink = Ziel der Weiterleitung"),
    ("OFFER-CFJM-019", "h1 gleich; «01/03/2027 19/03/2027 … 08/11/2027 26/11/2027»", "Termin 01.–19.03.2027, weiterer 08.–26.11.2027"),
    ("OFFER-CFJM-020", "h1 «De journaliste à auteur …»; «26/04/2027 27/04/2027», «1'180.- Auditeurs hors médias 800.- … 260.- … 0.-»",
     "Termin 26.–27.04.2027; Preis nach Tarifliste"),
    ("AT-PROD-OFFER-035", "Weiterleitung auf …/zertifikatslehrgang-gesundheitsjournalismus/; «15.9.-24.11.2027», «€ 249,-»", "Kurslink = Ziel; Termin und Preis stimmen schon"),
    ("AT-PROD-OFFER-037", "Weiterleitung auf …/lehrgang-digital-media-kompakt-3/; Module 17.2.–14.4.2027, 2.699 € / 3.699 €", "Kurslink = Ziel; Termin 17.02.–14.04.2027"),
    ("OFFER-NOBLE-057", "h1 «Multimodale KI für Content-Erstellung Schulung»; schema.org Termine ab 2026-12-29 (Bern, Basel, Genf, Lausanne …), 5958",
     "Termin nach Terminliste nachführen"),
]
for i, b, v in ROUTINE: R[i] = ("ROUTINE", b, v + " (Routine-Eingang des Monats, E262)", L1)
R["OFFER-SFGB-001"] = ("ROUTINE", "Nachfolgeseite …/video--animation/video-filmen-und-schneiden-2741: h1 «Video Filmen und Schneiden», "
                       "«Mo, 05.04.2027 … Mo, 03.05.2027», «CHF 210.–»", "Kurslink = Nachfolgeseite; Termin 05.04.–03.05.2027 (Routine-Eingang, E262)", L2)

for i in "OFFER-FF-002 OFFER-FF-012 OFFER-FF-014 OFFER-FF-016 OFFER-FF-018".split():
    R[i] = ("WIE_E281", "ffzh.ch: Startseite 200 verlinkt «Kursangebot» …/Weiterbildungskurse/, dieselbe Adresse liefert dem Abruf 404",
            "wie E281 unverändert, nächster Monatsbuild (Owner)", L1)
for i in "OFFER-KLUBPRO-005 OFFER-KLUBPRO-003 OFFER-KLUBPRO-054".split():
    R[i] = ("WIE_E281", "Kurslink 404; Kategorieseite Klubschule Pro lädt die Kurse nur per Skript, kein Nachfolger lesbar",
            "wie E281 unverändert, nächster Monatsbuild (Owner)", L1 + ", " + L2)
R["OFFER-MSSG-001"] = ("WIE_E281", "medienschule-ost.ch: robots.txt Zeitüberschreitung, nach RFC 9309 nicht abgerufen",
                       "wie E281 unverändert, nächster Monatsbuild (Owner)", L1)
# Chrome 24.11. abends (Owner-Freigabe im Chat, E308): unige.ch zeigt dem Abruf eine Sicherheitsprüfung, in Chrome lesbar
R["UNIGE-V22-03"] = ("BELEGT_CHROME", "Chrome: CAS Techniques de la communication écrite 2026-2027, Programm «Le texte journalistique», «Inscriptions par module possible»",
                     "keine Master-Änderung (E308)", "Chrome 2026-11-24")
for i, m in (("OFFER-UNIGE-004", "UX /UI Design"), ("OFFER-UNIGE-005", "Gestion de projet numérique / Création de site web"),
             ("OFFER-UNIGE-009", "Création de contenus et stratégies d’influence"), ("OFFER-UNIGE-010", "IA Générative: pratiques et enjeux")):
    R[i] = ("BELEGT_CHROME", f"Chrome: DAS Communication digitale 2026-2027, Modul «{m}», «CHF 1’700.- par module»", "keine Master-Änderung (E308)", "Chrome 2026-11-24")

ARCHIV = [
    ("OFFER-BICT-001", "Kurslink 404, bict.ch/ausbildung/ 404, Sitemap ohne Ausbildungsseiten", L1),
    ("OFFER-FHNW-016", "Kurslink 404, Liste der Weiterbildungen Informatik FHNW ohne DPX", L1 + ", " + L2),
    ("OFFER-KLUB-MIDUCA-006", "Kurslink 404, Kategorieseite Fotografie ohne lesbare Kursliste", L1 + ", " + L2),
    ("OFFER-KLUB-MIDUCA-010", "Kurslink 404, Kategorieseite Fotografie ohne lesbare Kursliste", L1 + ", " + L2),
    ("AT-PROD-OFFER-201", "Kurslink 404, Seminarliste und Sitemap oema.at ohne Magazinanalyse/-kritik", L1 + ", " + L2),
    ("OFFER-SBVV-009", "Weiterbildungsliste SBVV (23 Kurse) ohne «Metadatenmanagement»", L1),
    ("OFFER-SBVV-010", "Weiterbildungsliste SBVV ohne «Kinder- und Jugendbuch für Fortgeschrittene»", L1),
    ("OFFER-SBVV-016", "Weiterbildungsliste SBVV ohne «Sensitivity Reading» (Katalogtermin 28.11.2026)", L1),
    ("OFFER-FOCAL-018", "einzige Durchführung «12. und 13. September 2024, Bern Anmeldefrist abgelaufen!»", L1),
    ("OFFER-CFPOCST-002", "Übersicht CFP-OCST «Photoshop base 29.06.2026 Lugano … CHF 300», kein späterer Termin", L1),
    ("OFFER-ATGS-001", "Vereinsseite nennt Kurse «a partire dal 2017/18», keinen aktuellen Kurs", L1),
]
for i, b, l in ARCHIV: R[i] = ("OWNER_ARCHIV", b, "Archiv nach E015 (HOLD, bleibt im Master, umkehrbar)", l)

WIEDER = [
    ("OFFER-CORSO-002", "«L’edizione 2025/2026 è conclusa. Informazioni … per il prossimo corso … ad inizio anno 2027»", L2),
    ("LI-REG-001", "«geht im Sommer 2026 in die nächste Runde», Termin 3.–22. August 2026; seit 2010", L1 + ", " + L2),
    ("OFFER-UNIBE-003", "«Cycle Annual», Modul 1 vom 18.–21.08.2026 vorbei; 2027/28 nicht publiziert", L1),
    ("OFFER-UNIBE-004", "«Cycle Annual», Modul 2 im Zyklus 2026/27 vorbei; 2027/28 nicht publiziert", L1),
    ("OFFER-SAWI-003", "Kurslink leitet auf …/formation-communication/storytelling/; «Dates coming soon», CHF 8'900", L1),
]
for i, b, l in WIEDER: R[i] = ("OWNER_WIEDERKEHREND", b, "behalten, Termin «keine Angabe» bis zur neuen Ausschreibung (statt Archiv)", l)

UMBENANNT = [
    ("OFFER-DIGICOMP-020", "Weiterleitung auf «User Experience gestalten und KI sinnvoll einsetzen», 5 Tage, «Preis 4'650.–» (Katalog «UX – Der Mensch im Zentrum …», CHF 6'500)"),
    ("OFFER-KLUBPRO-031", "gleiche Kursseite heisst «KI verstehen und sicher anwenden», CHF 385, Termine 23.08. und 27.08.2027 (Katalog «Basics der KI …», CHF 380, 06.02.2027)"),
    ("OFFER-KLUBPRO-043", "gleiche Kursseite heisst «KI Videos für Social Media & Co. - einfach einsteigen», CHF 585, 02.–04.03.2027 und 12.06.2027 (Katalog CHF 580)"),
    ("OFFER-WEKA-006", "gleiche Kursseite heisst «Content Creation mit KI», Termine 15.06.2027 und 24.11.2027, CHF 890 (Katalogtermin 01.12.2026)"),
    ("OFFER-HSG-005", "h1 «Leading Journalism in the Age of AI: Strategic Insights and Newsroom Practice» (Katalog «… Executive Insights and Strategy»); Termine und CHF 550 stimmen"),
    ("AT-PROD-OFFER-037", "Katalogtitel «… – Herbst 2026», neue Ausgabe Februar–April 2027"),
    ("AT-PROD-OFFER-035", "Katalogtitel «… 2026», Seite «Zertifikatslehrgang Gesundheitsjournalismus 2027»"),
]
for i, b in UMBENANNT:
    if i in R: R[i] = ("ROUTINE+OWNER_TITEL", R[i][1] + "; " + b, R[i][2] + "; Titel nach Seite (Owner)", R[i][3])
    else: R[i] = ("OWNER_UMBENANNT", b, "Titel und Werte nach Anbieterseite übernehmen (gleiches Angebot, E029)", L1)
R["OFFER-SPC-011"] = ("OWNER_EINZEL", "Seite «Ateliers Pratique 90 CHF | 2 heures» und «Ateliers Signature 250 CHF | 4 heures»; Katalog «Master Ateliers Pratique», CHF 250",
                      "Owner: welches Angebot ist gemeint?", L1)

fehlt, fremd = set(z) - set(R), set(R) - set(z)
if fehlt or fremd: sys.exit(f"ABBRUCH: fehlt {sorted(fehlt)}, fremd {sorted(fremd)}")
ziel = R0 / "paket30/out/zweifel_ergebnis_2026-11-24.csv"
with open(ziel, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f, lineterminator="\n"); w.writerow(["id", "anbieter", "titel", "status_vollauf", "ergebnis", "beleg", "vorschlag", "lauf"])
    for i in z: w.writerow([i, z[i]["anbieter"], z[i]["titel"], z[i]["status"], *R[i]])
print(dict(collections.Counter(v[0] for v in R.values())), len(R), "→", ziel.name)
