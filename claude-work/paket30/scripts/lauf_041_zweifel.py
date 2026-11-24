"""Lauf 041 (Monatsbuild 24.11.2026, Zweifelsfälle E291): Archiv E303, Termin «keine Angabe» E304, umbenannte Angebote E305,
Routinefälle E262 (Kurslink nach Weiterleitung oder Nachfolgeseite, neuer Termin) mit Beleg der Anbieterseite.
Belege: Runner-Läufe 45496574482 und 45497656026 (Kurstexte verschlüsselt, nur lokal gelesen), Ergebnis paket30/out/zweifel_ergebnis_2026-11-24.csv.
Altwerte aus dem aktuellen Master. Schreibt nur eingang/041_20261124_korrekturen.csv.
Aufruf (aus claude-work/): python3 -I paket30/scripts/lauf_041_zweifel.py"""
import csv, io, json, pathlib, sys

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
TAG = "2026-11-24"
L1, L2 = "45496574482", "45497656026"
M = {z["id"]: z for z in csv.DictReader(io.StringIO((R / "paket3/out/master_3818_aktuell.csv").read_text(encoding="utf-8-sig")))}
KOPF = ["id", "feld", "alt", "neu", "alt_anzeige", "herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "ursprung"]
Z = []


def q(url, zitat, lauf=L1):
    return f"{url} (abgerufen {TAG}, Zweifelsabruf Lauf {lauf}; gelesen von Claude) «{zitat}»"


def zeile(i, feld, neu, herkunft, reg, quelle, ursprung, url_status="", url_geprueft_am=""):
    if M[i][feld] == neu: return
    Z.append({"id": i, "feld": feld, "alt": M[i][feld], "neu": neu, "alt_anzeige": "", "herkunft": herkunft, "register_id": reg,
              "quelle": quelle, "url_status": url_status, "url_geprueft_am": url_geprueft_am, "ursprung": ursprung})


def dfj(*t):   # Durchführungen wie in P31: startDate, endDate, label
    return json.dumps([{"startDate": a, "endDate": b, "label": l} for a, b, l in t], ensure_ascii=False)


def preis(i, betrag):
    p = json.loads(M[i]["preis_optionen"]); assert len(p) == 1 and p[0]["amountType"] == "EXACT", i
    p[0]["amount"] = float(betrag); return json.dumps(p, ensure_ascii=False)


# ---------- E303: Archiv nach E015 ----------
ARCHIV = {r["id"]: r["beleg"] for r in csv.DictReader(open(R / "paket30/out/zweifel_ergebnis_2026-11-24.csv", encoding="utf-8")) if r["ergebnis"] == "OWNER_ARCHIV"}
assert len(ARCHIV) == 11
GRUND = f"ARCHIV: Kurs nicht mehr auf der Anbieterseite (Zweifelsabruf {TAG}; E015; E303)"
for i, b in ARCHIV.items():
    quelle = f"{M[i]['url']}: {b} (Zweifelsabruf Läufe {L1}, {L2}, abgerufen {TAG})"
    zeile(i, "publikationsgrund", GRUND, "OWNER_E303", "E303", quelle, "Zweifelsfälle 24.11. Archiv E303")
    zeile(i, "publikationsstatus", "HOLD", "OWNER_E303", "E303", quelle, "Zweifelsfälle 24.11. Archiv E303")

# ---------- Routine E262: Kurslink = Ziel der Weiterleitung (Titel auf der Zielseite) ----------
WL = {
    "OFFER-DIGICOMP-003": ("https://digicomp.ch/weiterbildung-digital-marketing-design/adobe-creative-cloud-adobe-cc/adobe-after-effects/kurs-adobe-after-effects-advanced", "Adobe After Effects – Advanced … Dauer 2 Tage Preis 1'700.–"),
    "OFFER-DIGICOMP-049": ("https://digicomp.ch/formations-digital-marketing-design/adobe-creative-cloud-adobe-cc/illustrator/cours-adobe-illustrator-cc--creer-des-infographies", "Adobe Illustrator CC - Créer des infographies … Durée 2 jours Prix 1'400.–"),
    "OFFER-DIGICOMP-007": ("https://digicomp.ch/weiterbildung-digital-marketing-design/adobe-creative-cloud-adobe-cc/adobe-photoshop/kurs-adobe-photoshop-cc-basic", "Adobe Photoshop CC – Basic … Dauer 2 Tage Preis 1'400.–"),
    "OFFER-DIGICOMP-052": ("https://digicomp.ch/formations-digital-marketing-design/adobe-creative-cloud-adobe-cc/cours-adobe-xd-niveau-avance", "Adobe XD – Niveau avancé … Durée 1 jour Prix 1'400.–"),
    "OFFER-DIGICOMP-063": ("https://digicomp.ch/weiterbildung-digital-marketing-design/digital-marketing/data-analytics/kurs-google-analytics-4-ga4-basic", "Kurs digicode: GA4 Google Analytics 4 (GA4) – Basic"),
    "AT-PROD-OFFER-035": ("https://oema.at/seminare/zertifikatslehrgang-gesundheitsjournalismus/", "Zertifikatslehrgang Gesundheitsjournalismus 2027 … Datum: 15.9.-24.11.2027 … Spezialpreis: € 249,-"),
    "AT-PROD-OFFER-037": ("https://oema.at/seminare/lehrgang-digital-media-kompakt-3/", "Lehrgang Digital Media Kompakt … Modul 1: Mobile Video & Mobile Reporting (17.-18.2.2027) … Modul 5: Recht in den digitalen Medien (14.4.2027)"),
    "OFFER-SAWI-003": ("https://sawi.com/formation-communication/storytelling/", "Storytelling Programme … CHF 8'900.- … Dates coming soon"),
}
for i, (u, zit) in WL.items():
    herk, reg = ("OWNER_E304", "E304") if i == "OFFER-SAWI-003" else ("ANBIETERSEITE_P30", "E262")
    zeile(i, "url", u, herk, reg, q(M[i]["url"] + " → " + u, zit), "Zweifelsfälle 24.11. Kurslink nach Weiterleitung", "OK", TAG)

# SfG Basel: Nachfolgeseite (Sitemap), Titel wörtlich
U_SFGB = "https://www.sfgbasel.ch/oeffentliche-weiterbildungskurse/uebersicht/video--animation/video-filmen-und-schneiden-2741"
Q_SFGB = q(U_SFGB, "Video Filmen und Schneiden … Kosten CHF 210.– … Mo, 05.04.2027 17:15–20:15 … Mo, 03.05.2027 17:15–20:15", L2)
zeile("OFFER-SFGB-001", "url", U_SFGB, "ANBIETERSEITE_P30", "E262", Q_SFGB, "Zweifelsfälle 24.11. Nachfolgeseite", "OK", TAG)
zeile("OFFER-SFGB-001", "termin_text", "05.04.–03.05.2027", "ANBIETERSEITE_P30", "E262", Q_SFGB, "Zweifelsfälle 24.11. Termin")
zeile("OFFER-SFGB-001", "start_datum", "2027-04-05", "ANBIETERSEITE_P30", "E262", Q_SFGB, "Zweifelsfälle 24.11. Termin")
zeile("OFFER-SFGB-001", "end_datum", "2027-05-03", "ANBIETERSEITE_P30", "E262", Q_SFGB, "Zweifelsfälle 24.11. Termin")
zeile("OFFER-SFGB-001", "dauer", "5 Montagabende, 05.04.–03.05.2027, jeweils 17:15–20:15", "ANBIETERSEITE_P30", "E262", Q_SFGB, "Zweifelsfälle 24.11. Termin")

# CFJM: neuer Termin (Kurslink unverändert, leitet auf die Kursseite)
Q19 = q("https://www.cfjm.ch/certificat-fc-journaliste-reporter-dimages/", "Certificat FC de JRI – Journaliste reporter d’images … 01/03/2027 19/03/2027 … 08/11/2027 26/11/2027")
zeile("OFFER-CFJM-019", "termin_text", "01.–19.03.2027; weitere Termine 08.–26.11.2027", "ANBIETERSEITE_P30", "E262", Q19, "Zweifelsfälle 24.11. Termin")
zeile("OFFER-CFJM-019", "start_datum", "2027-03-01", "ANBIETERSEITE_P30", "E262", Q19, "Zweifelsfälle 24.11. Termin")
zeile("OFFER-CFJM-019", "end_datum", "2027-03-19", "ANBIETERSEITE_P30", "E262", Q19, "Zweifelsfälle 24.11. Termin")
zeile("OFFER-CFJM-019", "durchfuehrungen", dfj(("2027-03-01", "2027-03-19", "01.–19.03.2027"), ("2027-11-08", "2027-11-26", "08.–26.11.2027")), "ANBIETERSEITE_P30", "E262", Q19, "Zweifelsfälle 24.11. Termin")
Q20 = q("https://www.cfjm.ch/course/de-journaliste-a-auteur-comment-creer-son-premier-ouvrage/", "De journaliste à auteur, comment créer son premier ouvrage … 26/04/2027 27/04/2027 2 jours, de 9h à 17h")
zeile("OFFER-CFJM-020", "termin_text", "26.–27.04.2027", "ANBIETERSEITE_P30", "E262", Q20, "Zweifelsfälle 24.11. Termin")
zeile("OFFER-CFJM-020", "start_datum", "2027-04-26", "ANBIETERSEITE_P30", "E262", Q20, "Zweifelsfälle 24.11. Termin")
zeile("OFFER-CFJM-020", "end_datum", "2027-04-27", "ANBIETERSEITE_P30", "E262", Q20, "Zweifelsfälle 24.11. Termin")

# NobleProg: Terminliste (schema.org) der Kursseite
QN = q("https://www.nobleprog.ch/cc/multimodalaicc", "Multimodale KI für Content-Erstellung: 2026-12-29–2027-01-01 Bern, 2027-01-12–2027-01-15 Basel, 2027-01-26–2027-01-29 Genf, 2027-02-09–2027-02-12 Lausanne (schema.org)")
TN = "29.12.2026–01.01.2027; weitere Termine 12.–15.01.2027, 26.–29.01.2027, 09.–12.02.2027"
zeile("OFFER-NOBLE-057", "termin_text", TN, "ANBIETERSEITE_P30", "E262", QN, "Zweifelsfälle 24.11. Termin")
zeile("OFFER-NOBLE-057", "start_datum", "2026-12-29", "ANBIETERSEITE_P30", "E262", QN, "Zweifelsfälle 24.11. Termin")
zeile("OFFER-NOBLE-057", "end_datum", "2027-01-01", "ANBIETERSEITE_P30", "E262", QN, "Zweifelsfälle 24.11. Termin")
zeile("OFFER-NOBLE-057", "durchfuehrungen", dfj(("2026-12-29", "2027-01-01", "29.12.2026–01.01.2027 · Bern"), ("2027-01-12", "2027-01-15", "12.–15.01.2027 · Basel"),
                                                ("2027-01-26", "2027-01-29", "26.–29.01.2027 · Genf"), ("2027-02-09", "2027-02-12", "09.–12.02.2027 · Lausanne")),
      "ANBIETERSEITE_P30", "E262", QN, "Zweifelsfälle 24.11. Termin")

# ---------- E304: SAWI Termin «keine Angabe» bis zur neuen Ausschreibung ----------
QS = q("https://sawi.com/formation-communication/storytelling/", "Storytelling Programme … Dates coming soon")
zeile("OFFER-SAWI-003", "termin_text", "Nächste Durchführung: keine Angabe (Anbieter: Daten folgen)", "OWNER_E304", "E304", QS, "Zweifelsfälle 24.11. E304")
zeile("OFFER-SAWI-003", "start_datum", "nicht erfasst", "OWNER_E304", "E304", QS, "Zweifelsfälle 24.11. E304")
zeile("OFFER-SAWI-003", "end_datum", "nicht erfasst", "OWNER_E304", "E304", QS, "Zweifelsfälle 24.11. E304")

# ---------- E305: umbenannte Angebote nach Seite ----------
U20 = "https://digicomp.ch/weiterbildung-software-engineering/programmieren/ux/lehrgang-user-experience-gestalten-und-ki-sinnvoll-einsetzen"
Q20D = q(M["OFFER-DIGICOMP-020"]["url"] + " → " + U20, "User Experience gestalten und KI sinnvoll einsetzen … Dauer 5 Tage Preis 4'650.– zzgl. 8.1% MWST")
for f, v in (("titel", "User Experience gestalten und KI sinnvoll einsetzen"), ("dauer", "5 Tage"), ("preis_text", "CHF 4'650 zzgl. 8.1% MWST"),
             ("preis_optionen", preis("OFFER-DIGICOMP-020", 4650)), ("termin_text", "Nächster Termin: keine Angabe"), ("start_datum", "nicht erfasst"), ("end_datum", "nicht erfasst")):
    zeile("OFFER-DIGICOMP-020", f, v, "OWNER_E305", "E305", Q20D, "Zweifelsfälle 24.11. E305 Nachfolgelehrgang")
zeile("OFFER-DIGICOMP-020", "url", U20, "OWNER_E305", "E305", Q20D, "Zweifelsfälle 24.11. E305 Nachfolgelehrgang", "OK", TAG)
zeile("OFFER-KLUBPRO-031", "titel", "KI verstehen und sicher anwenden", "OWNER_E305", "E305",
      q(M["OFFER-KLUBPRO-031"]["url"], "KI verstehen und sicher anwenden St. Gallen, Bahnhofplatz 2"), "Zweifelsfälle 24.11. E305 Titel")
Q43 = q(M["OFFER-KLUBPRO-043"]["url"], "KI Videos für Social Media & Co. - einfach einsteigen … Preis CHF 585.00 … 2027-03-02–2027-03-04, 2027-06-12 (schema.org)")
zeile("OFFER-KLUBPRO-043", "titel", "KI Videos für Social Media & Co. – einfach einsteigen", "OWNER_E305", "E305", Q43, "Zweifelsfälle 24.11. E305 Titel")
zeile("OFFER-KLUBPRO-043", "preis_text", "CHF 585", "OWNER_E305", "E305", Q43, "Zweifelsfälle 24.11. E305 Preis")
zeile("OFFER-KLUBPRO-043", "preis_optionen", preis("OFFER-KLUBPRO-043", 585), "OWNER_E305", "E305", Q43, "Zweifelsfälle 24.11. E305 Preis")
QW = q(M["OFFER-WEKA-006"]["url"], "Content Creation mit KI … Praxis-Seminar, 1 Tag ZWB, Zürich Dienstag, 15. Juni 2027 Mittwoch, 24. November 2027")
for f, v in (("titel", "Content Creation mit KI"), ("termin_text", "15.06.2027; weitere Termine 24.11.2027"), ("start_datum", "2027-06-15"), ("end_datum", "2027-06-15"),
             ("durchfuehrungen", dfj(("2027-06-15", "2027-06-15", "15.06.2027 · Zürich"), ("2027-11-24", "2027-11-24", "24.11.2027 · Zürich")))):
    zeile("OFFER-WEKA-006", f, v, "OWNER_E305", "E305", QW, "Zweifelsfälle 24.11. E305")
zeile("OFFER-HSG-005", "titel", "Leading Journalism in the Age of AI: Strategic Insights and Newsroom Practice", "OWNER_E305", "E305",
      q(M["OFFER-HSG-005"]["url"], "Leading Journalism in the Age of AI: Strategic Insights and Newsroom Practice"), "Zweifelsfälle 24.11. E305 Titel")
Q37 = q("https://oema.at/seminare/lehrgang-digital-media-kompakt-3/", "Lehrgang Digital Media Kompakt … Modul 1 … (17.-18.2.2027) – Wien … Modul 5: Recht in den digitalen Medien (14.4.2027) – Wien … Ort: Wien und Online")
for f, v in (("titel", "Lehrgang Digital Media Kompakt"), ("termin_text", "17.02.–14.04.2027"), ("start_datum", "2027-02-17"), ("end_datum", "2027-04-14"), ("dauer", "5 Module, Wien und online")):
    zeile("AT-PROD-OFFER-037", f, v, "OWNER_E305", "E305", Q37, "Zweifelsfälle 24.11. E305")
Q35 = q("https://oema.at/seminare/zertifikatslehrgang-gesundheitsjournalismus/", "Zertifikatslehrgang Gesundheitsjournalismus 2027 … Modul 1, 15.-16.9.2027 … Abschluss & Zertifikatsverleihung: 24.11.2027")
zeile("AT-PROD-OFFER-035", "titel", "Zertifikatslehrgang Gesundheitsjournalismus 2027", "OWNER_E305", "E305", Q35, "Zweifelsfälle 24.11. E305 Titel")
zeile("AT-PROD-OFFER-035", "dauer", "5 Module und Abschluss, 15.09.–24.11.2027", "OWNER_E305", "E305", Q35, "Zweifelsfälle 24.11. E305")

p = R / "eingang/041_20261124_korrekturen.csv"
with open(p, "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=KOPF, lineterminator="\n"); w.writeheader(); w.writerows(Z)
print(f"{p.name}: {len(Z)} Zeilen, {len({z['id'] for z in Z})} Angebote")
