"""P31 Restfälle, Nachbau der Läufe 033–035 (E277, E280, E282–E284) in neuer Sitzung am 24.11.2026.
Die ursprünglichen Läufe 033–035 lagen nur im Git-Bundle der Vorsitzung (nicht gepusht); Owner-Antwort «neu machen».
Belege: P31-Lauf 45415385968 (Abruf auf dem Runner, Kurstexte verschlüsselt, nur lokal gelesen), Websuche 24.11.,
Chrome-Befunde der Vorsitzung, soweit in paket31/out/owner_liste_restfaelle_2026-11-24.csv festgehalten.
Schreibt eingang/033_…, 034_…, 035_… (korrekturen) und 035_…_neue_angebote.csv. Altwerte aus dem aktuellen Master.
Aufruf (aus claude-work/): python3 -I paket31/scripts/nachbau_033_035.py"""
import csv, io, json, pathlib, sys

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
TAG = "2026-11-24"
LAUF = "45415385968"
M = {z["id"]: z for z in csv.DictReader(io.StringIO((R / "paket3/out/master_3818_aktuell.csv").read_text(encoding="utf-8-sig")))}
KOPF = ["id", "feld", "alt", "neu", "alt_anzeige", "herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "ursprung"]


def zeile(i, feld, neu, herkunft, reg, quelle, ursprung, url_status="", url_geprueft_am=""):
    return {"id": i, "feld": feld, "alt": M[i][feld], "neu": neu, "alt_anzeige": "", "herkunft": herkunft, "register_id": reg,
            "quelle": quelle, "url_status": url_status, "url_geprueft_am": url_geprueft_am, "ursprung": ursprung}


def schreibe(name, zeilen, kopf=KOPF):
    p = R / "eingang" / name
    with open(p, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=kopf, lineterminator="\n"); w.writeheader(); w.writerows(zeilen)
    print(f"{name}: {len(zeilen)} Zeilen")


# ---------- Lauf 033: Archiv nach E015/E277 (toter Link oder Übersicht ohne den Kurs, keine Nachfolgeseite) ----------
A277 = {
    "OFFER-DPSUISSE-002": "https://dpsuisse.ch/video/basiskurs/1 HTTP 404, https://dpsuisse.ch/video/ HTTP 404; Kursportal https://media-campus.dpsuisse.ch/ ohne «Video Basiskurs»",
    "OFFER-DPSUISSE-004": "Kursportal https://media-campus.dpsuisse.ch/ (HTTP 200) ohne «Video Vertiefung 1»",
    "OFFER-DPSUISSE-005": "Kursportal https://media-campus.dpsuisse.ch/ (HTTP 200) ohne «Video Vertiefung 2»",
    "OFFER-DIGICOMP-023": "Kurslink HTTP 404; Kandidat …/publishing/adobe/workshop-html5-banner-from-a-to-z HTTP 404",
    "OFFER-DIGICOMP-024": "Kurslink HTTP 404; Kandidaten …/web-ux-design/course-html5-banners-with-google-web-designer-basic und …/kurs-html5-werbebanner-mit-google-web-designer--basic HTTP 404",
    "OFFER-FHNW-010": "Kurslink HTTP 404; Kandidat https://www.fhnw.ch/de/weiterbildung/wirtschaft/suchmaschine-optimiertes-schreiben HTTP 404",
    "OFFER-FHNW-012": "Kurslink leitet auf …/weiterbildungen/archiv/cas-digital-literacy (HTTP 404); englischer Kandidat HTTP 404",
    "OFFER-HEAD-005": "Kurslink und Kandidat leiten auf die Übersicht https://head.hesge.ch/formations/formations-continues ohne ComfyUI; englischer Kandidat HTTP 404",
    "OFFER-HEVS-004": "Kursplan-PDF 2026 HTTP 404; Kandidat …/la-photo-numerique-8711 HTTP 404",
    "OFFER-HEVS-005": "Kursplan-PDF 2026 HTTP 404; Kandidaten …/video--creer-une-video-integrant-des-sequences-filmees-avec-son-smartphone-23635 und …--soiree-23636 HTTP 404",
    "OFFER-HWZ-013": "Kurslink HTTP 404; Kandidat https://fh-hwz.ch/bildungsangebot/weiterbildung/cas-das/das-ai-writing-ai-prompting-hwz leitet auf den toten Kurslink",
    "OFFER-HWZ-015": "Kurslink HTTP 404; Kandidat https://fh-hwz.ch/bildungsangebot/weiterbildung/cas-das/das-digital-content-creation-hwz leitet auf den toten Kurslink",
    "IF-W05": "Übersicht https://www.ifage.ch/formation/tic/formations-cms-developpement-web/ (HTTP 200) ohne SEO-Kurs; Kandidat …/wordpress-seo-search-engine-optimization/ HTTP 404",
    "CH-V29-P02": "Workshop-PDF 25.3.2026 HTTP 404; Kandidat https://www.keystone-sda.ch/en/news/events/detail/videos-fuer-websites-en-260603 HTTP 404; Websuche: nur PDF zum Termin 2.9.2026 (vergangen)",
    "OFFER-SGP-006": "Übersicht https://sgp-geneve.ch/masterclass/ (HTTP 200) ohne Affinity Photo; Produktseite …/21-10-2026-affinity-photo-module-2-par-denis-ponte/ HTTP 404",
    "OFFER-SGP-007": "Übersicht https://sgp-geneve.ch/masterclass/ (HTTP 200) ohne «Etudes visuelles»; Produktseite …/13-10-26-etudes-visuelles-… HTTP 404",
    "OFFER-SGP-009": "Übersicht https://sgp-geneve.ch/workshops/ (HTTP 200) ohne «Droit à l’image»; Produktseite …/workshop-droit-a-limage-pour-les-photographes-octobre/ HTTP 404",
    "OFFER-WEBEDU-003": "Startseite https://webedu.ch/ (HTTP 200) ohne «WordPress Developer Crashkurs»; Kandidaten …/kurseworkshops/?kursid=2824 und /wordpress-developer-crashkurs HTTP 404",
    "OFFER-ZB-001": "Kurslink HTTP 404; Kandidaten …/analoge-werkstatt-filmentwicklung und …-4efnf HTTP 404",
    "OFFER-ZB-002": "Kurslink HTTP 404; Kandidat …/analoge-dunkelkammervergroessernentwickeln HTTP 404",
}
GRUND277 = f"ARCHIV: Kurslink tot bzw. Übersicht ohne den Kurs, keine Nachfolgeseite (Abruf und Websuche {TAG}; E015; E277)"
z033 = []
for i, beleg in A277.items():
    q = f"{beleg} (P31-Lauf {LAUF}, abgerufen {TAG}; Websuche {TAG})"
    for feld, neu in (("publikationsgrund", GRUND277), ("publikationsstatus", "HOLD")):
        z033.append(zeile(i, feld, neu, "ARCHIV_E277", "E277", q, "P31 Nachbau Lauf 033 Archiv E277"))

# ---------- Lauf 034: Archiv nach E280; Termin OFFER-ZB-005 nach E282 ----------
O = {x["id"]: x for x in csv.DictReader(open(R / "paket31/out/owner_liste_restfaelle_2026-11-24.csv", encoding="utf-8"))}
A280 = {
    "OFFER-FFHS-002": f"Kurslink leitet auf die Startseite https://www.ffhs.ch/de/ (P31-Lauf {LAUF}, {TAG})",
    "OFFER-HWZ-004": f"Kurslink leitet auf «CAS Digital Publishing & Brand Journalism» https://fh-hwz.ch/de/weiterbildung/cas/cas-digital-publishing-and-brand-journalism (P31-Lauf {LAUF}, {TAG})",
    "PCC-P02": f"Kurslink leitet auf die Kategorie FrameMaker: «Leider haben wir zur Zeit keine Schulungen in dieser Kategorie.» (P31-Lauf {LAUF}, {TAG})",
    "PCC-P15": f"Kurslink leitet auf die Kategorie Animate: «Leider haben wir zur Zeit keine Schulungen in dieser Kategorie.» (P31-Lauf {LAUF}, {TAG})",
}
for i in ("OFFER-EBU-012", "OFFER-EBU-013", "OFFER-EBU-015", "OFFER-EBU-016", "OFFER-EBU-017"):
    A280[i] = f"{M[i]['url']}: {O[i]['hinweis'].split(' | ')[0]} (Owner-Liste paket31/out/owner_liste_restfaelle_2026-11-24.csv); Runner {TAG} HTTP 403"
for i in ("CH-NOV-OF-022", "CH-NOV-OF-023", "CH-NOV-OF-024", "CH-NOV-OF-025", "CH-NOV-OF-026"):
    A280[i] = f"https://kanalk.ch/ausbildung/radiokurse/: {O[i]['hinweis'].split(' | ')[0]} (Owner-Liste paket31/out/owner_liste_restfaelle_2026-11-24.csv)"
A280["OFFER-SASJ-001"] = f"https://www.science-journalism.ch/evenements: {O['OFFER-SASJ-001']['hinweis'].split(' | ')[0]} (Owner-Liste paket31/out/owner_liste_restfaelle_2026-11-24.csv)"
GRUND280 = "ARCHIV: keine aktuelle Durchführung auf der Anbieterseite (Owner-Entscheid E280; E015)"
z034 = []
for i, beleg in A280.items():
    for feld, neu in (("publikationsgrund", GRUND280), ("publikationsstatus", "HOLD")):
        z034.append(zeile(i, feld, neu, "OWNER_E280", "E280", beleg, "P31 Nachbau Lauf 034 Archiv E280"))
QZB = (f"https://www.fotografie-weiterbildung.ch/angebot-zb-foto/grundkurs-food-fotografie-adrian-ehrbar-2027 (abgerufen {TAG}, "
       f"P31-Lauf {LAUF}; gelesen von Claude) Kopfzeile «Samstag, 28. August 2027 09:00 16:00», schema.org 2027-08-28T09:00; "
       "Fliesstext nennt weiter «Samstag, 28. August 2026»; Owner-Entscheid E282: Termin 2027 nach der Kursseite 2027")
for feld, neu in (("termin_text", "28.08.2027, 09.00–16.00 Uhr"), ("start_datum", "2027-08-28"), ("end_datum", "2027-08-28")):
    z034.append(zeile("OFFER-ZB-005", feld, neu, "ANBIETERSEITE_P31", "E282", QZB, "P31 Nachbau Lauf 034 E282"))

# ---------- Lauf 035: HEVS-Tageskurse (E283), Kurslinks (E284); Anzeigefelder leert master_nachtraege.py bei geändertem Original ----------
def preis(betrag):
    return json.dumps([{"amountType": "EXACT", "amount": float(betrag), "minAmount": None, "maxAmount": None, "currency": "CHF",
                        "tariffClass": "REGULAR", "tariffLabel": "Regulärer Preis", "eligibilityType": "NONE", "eligibilityValue": None,
                        "billingBasis": "TOTAL", "billingCount": None, "priceScope": "FULL_OFFER", "taxMode": "UNSPECIFIED", "taxRate": None,
                        "validFrom": None, "validThrough": None, "components": []}], ensure_ascii=False)


SITE_BELLEVUE = "Sierre, HES-SO Valais-Wallis, Campus Bellevue (Rte de la Plaine 2)"
SITE_ZWEI = "Sierre, HES-SO Valais (Rte de la Plaine 2 oder TechnoArk, Techno-Pôle 3)"
HEVS = {  # id: (Tagesseite, Zitat, termin_text, start, ende, preis, preis_text, ort)
    "OFFER-HEVS-001": ("https://www.hevs.ch/fr/autres-formations/adobe-photoshop-9191",
                       "«Date : dès le 25.05.2027 - 13h30 à 17h00 … Durée de la formation 6 demi-journées à raison d'un cours par semaine … Coûts CHF 1'200.00, documentation comprise et licences Photoshop durant la formation … Lieu du cours : HES-SO Valais-Wallis, campus Bellevue (Rte de la Plaine 2, 3960 Sierre)»",
                       "ab 25.05.2027, 13.30–17.00 Uhr (6 Halbtage, wöchentlich)", "2027-05-25", None, 1200,
                       "CHF 1'200 (inkl. Kursunterlagen und Photoshop-Lizenzen während des Kurses)", SITE_BELLEVUE),
    "OFFER-HEVS-002": ("https://www.hevs.ch/fr/autres-formations/adobe-illustrator-9190",
                       "«Date : 05.04.2027 / 12.04.2027 / 19.04.2027 / 26.04.2027 - 08h30 à 12h00 … Durée de la formation 4 demi-journée à raison d'un cours par semaine … Coûts CHF 750.00, documentation et licences de formation comprises … Lieu du cours : HES-SO Valais, site de Sierre (Rte de la Plaine 2) ou HES-SO Valais, site TechnoArk à Sierre (Techno-Pôle 3)»",
                       "05.04.2027; weitere Termine 12.04., 19.04., 26.04.2027; 08.30–12.00 Uhr", "2027-04-05", "2027-04-26", 750,
                       "CHF 750 (inkl. Kursunterlagen und Lizenzen)", SITE_ZWEI),
    "OFFER-HEVS-003": ("https://www.hevs.ch/fr/autres-formations/adobe--techniques-d-animation-animate-after-effect-9182",
                       "«Date : 26.04.2027 / 03.05.2027 / 10.05.2027 / 17.05.2027 - 13h30 à 17h00 … Durée de la formation 4 demi-journées … Coûts CHF 750.00 … Lieu du cours : HES-SO Valais-Wallis, campus Bellevue (Rte de la Plaine 2, 3960 Sierre)»",
                       "26.04.2027; weitere Termine 03.05., 10.05., 17.05.2027; 13.30–17.00 Uhr", "2027-04-26", "2027-05-17", 750,
                       "CHF 750 (inkl. Kursunterlagen und Lizenzen)", SITE_BELLEVUE),
}
z035 = []
for i, (url, zitat, tt, st, en, betrag, ptext, ort) in HEVS.items():
    q = f"{url} (abgerufen {TAG}, P31-Lauf {LAUF}; gelesen von Claude) {zitat}"
    u = "P31 Nachbau Lauf 035 E283 Tageskurs"
    z035.append(zeile(i, "url", url, "ANBIETERSEITE_P31", "E283", q, u, "OK", TAG))
    z035.append(zeile(i, "termin_text", tt, "ANBIETERSEITE_P31", "E283", q, u))
    z035.append(zeile(i, "start_datum", st, "ANBIETERSEITE_P31", "E283", q, u))
    if en: z035.append(zeile(i, "end_datum", en, "ANBIETERSEITE_P31", "E283", q, u))
    z035.append(zeile(i, "preis_text", ptext, "ANBIETERSEITE_P31", "E283", q, u))
    z035.append(zeile(i, "preis_optionen", preis(betrag), "ANBIETERSEITE_P31", "E283", q, u))
    z035.append(zeile(i, "preis_kategorie", "501_2000", "ANBIETERSEITE_P31", "E283", q, u))
    if ort:
        z035.append(zeile(i, "ort_text", ort, "ANBIETERSEITE_P31", "E283", q, u))
        z035.append(zeile(i, "durchfuehrungsort_sicherheit", "ORT_GENANNT", "ANBIETERSEITE_P31", "E283", q, u))
LINKS = {
    "IF-G08": ("https://www.ifage.ch/formation/tic/formations-cao-dao-pao/indesign-niveau-1/", "H1 «Indesign : les fondamentaux de la mise en page»"),
    "AT-PROD-OFFER-166": ("https://donauakademie.at/kurse/journalistisches-schreiben/", "H1 «Journalistisches Schreiben»"),
    "OFFER-KLUB-MIDUCA-008": ("https://www.klubschule.ch/kurs/fotografie-atelier-expert--D_91939_2659_1003", "H1 «Fotografie - Atelier Expert», Zürich-Altstetten; zweite Standortseite …D_91939_2661_951 (Bern) ohne publizierte Termine im Seitentext"),
}
for i, (url, beleg) in LINKS.items():
    z035.append(zeile(i, "url", url, "ANBIETERSEITE_P31", "E284", f"{url} (abgerufen {TAG}, P31-Lauf {LAUF}; gelesen von Claude) {beleg}; Owner-Entscheid E284",
                      "P31 Nachbau Lauf 035 E284", "OK", TAG))

# ---------- Lauf 035: neue Angebote OFFER-HEVS-006 bis -008 (Abendkurse «Soirée», E283 nach E143) ----------
SOIREE = {  # neue id: (Vorlage, Seite, Titel, Zitat, termin_text, start, ende, dauer, preis, preis_text)
    "OFFER-HEVS-006": ("OFFER-HEVS-001", "https://www.hevs.ch/fr/autres-formations/adobe-photoshop--soiree-200686", "Adobe Photoshop – Soirée",
                       "«Date : 10.03.2027 / 17.03.2027 / 24.03.2027 / 31.03.2027 / 07.04.2027 / 14.04.2027 - 17h15 à 20h30 … Durée de la formation 6 soirées à raison d’un cours par semaine … Coûts CHF 1'200.00, documentation comprise et licences Photoshop durant la formation … Lieu du cours : HES-SO Valais, site de Sierre (Rte de la Plaine 2) ou HES-SO Valais, site TechnoArk à Sierre (Techno-Pôle 3)»",
                       "10.03.2027; weitere Termine 17.03., 24.03., 31.03., 07.04., 14.04.2027; 17.15–20.30 Uhr", "2027-03-10", "2027-04-14",
                       "6 soirées", 1200, "CHF 1'200 (inkl. Kursunterlagen und Photoshop-Lizenzen während des Kurses)"),
    "OFFER-HEVS-007": ("OFFER-HEVS-002", "https://www.hevs.ch/fr/autres-formations/adobe-illustrator--soiree-3878", "Adobe Illustrator – Soirée",
                       "«Date : 07.06.2027 / 14.06.2027 / 21.06.2027 / 28.06.2027 - 17h15 à 20h30 … Durée de la formation 4 soirées … Coûts CHF 750.00, documentation et licences de formation comprises … Lieu du cours : HES-SO Valais, site de Sierre (Rte de la Plaine 2) ou HES-SO Valais, site TechnoArk à Sierre (Techno-Pôle 3)»",
                       "07.06.2027; weitere Termine 14.06., 21.06., 28.06.2027; 17.15–20.30 Uhr", "2027-06-07", "2027-06-28",
                       "4 soirées", 750, "CHF 750 (inkl. Kursunterlagen und Lizenzen)"),
    "OFFER-HEVS-008": ("OFFER-HEVS-003", "https://www.hevs.ch/fr/autres-formations/adobe--techniques-d-animation-animate-after-effect--soiree-4326",
                       "Adobe – Techniques d’animation (Animate) – Soirée",
                       "«Date : 26.04.2027 / 03.05.2027 / 10.05.2027 / 17.05.2027 - 17h15 à 20h30 … Durée de la formation 4 soirées à raison d'un cours par semaine … Coûts CHF 750.00, documentation et licences de formation comprises … Lieu du cours : HES-SO Valais, site de Sierre (Rte de la Plaine 2) ou HES-SO Valais, site TechnoArk à Sierre (Techno-Pôle 3)»",
                       "26.04.2027; weitere Termine 03.05., 10.05., 17.05.2027; 17.15–20.30 Uhr", "2027-04-26", "2027-05-17",
                       "4 soirées", 750, "CHF 750 (inkl. Kursunterlagen und Lizenzen)"),
}
NKOPF = ["market", "id", "kohorte", "anbieter", "anbieter_id", "titel", "beschreibung", "url", "fokus", "angebotsart_roh", "dauer", "dauer_anzeige", "termin_text",
         "start_datum", "end_datum", "ort_text", "preis_text", "preis_kategorie", "zugang_text", "geprueft_am", "pruefen_ab", "release_herkunft",
         "country_roh", "preis_parser_status", "preis_budgetfaehig", "preis_optionen", "lieferform", "lieferform_struktur", "sammelobjekt",
         "objektklasse", "objektklasse_regel", "release_markt", "anbieter_land", "anbieter_land_beleg", "durchfuehrungsort_land",
         "durchfuehrungsort_sicherheit", "ch_zugang", "ch_zugang_regel", "url_identitaet", "dedupe_status", "lieferform_json",
         "herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "scope_code", "scope_begruendung", "dedupe_freigabe", "url_geteilt", "ursprung"]
neu = []
for i, (vorl, url, titel, zitat, tt, st, en, dauer, betrag, ptext) in SOIREE.items():
    v = M[vorl]
    neu.append({
        "market": "CH", "id": i, "kohorte": "NEU_035", "anbieter": v["anbieter"], "anbieter_id": v["anbieter_id"], "titel": titel,
        "beschreibung": v["beschreibung"], "url": url, "fokus": v["fokus"], "angebotsart_roh": v["angebotsart_roh"], "dauer": dauer, "dauer_anzeige": dauer.replace(" soirées", " Abende"),
        "termin_text": tt, "start_datum": st, "end_datum": en, "ort_text": SITE_ZWEI, "preis_text": ptext, "preis_kategorie": "501_2000",
        "zugang_text": f"Öffentlicher Abendkurs der HES-SO Valais-Wallis (HEG Formation continue); Kursseite {TAG}: Termine, Preis und Anmeldung publiziert.",
        "geprueft_am": TAG, "pruefen_ab": "2027-05-24", "release_herkunft": "PAKET31_NEU_E283", "country_roh": "Schweiz",
        "preis_parser_status": "AUTO_ACCEPT", "preis_budgetfaehig": "True", "preis_optionen": preis(betrag),
        "lieferform": v["lieferform"], "lieferform_struktur": v["lieferform_struktur"], "sammelobjekt": "NEIN", "objektklasse": "STABLE_OFFER",
        "objektklasse_regel": "offerType KURS", "release_markt": "CH", "anbieter_land": v["anbieter_land"], "anbieter_land_beleg": v["anbieter_land_beleg"],
        "durchfuehrungsort_land": "CH", "durchfuehrungsort_sicherheit": "ORT_GENANNT", "ch_zugang": "JA",
        "ch_zugang_regel": f"Durchführungsort CH genannt (E066), Kursseite {TAG} (E283)", "url_identitaet": "EINDEUTIG", "dedupe_status": "EINDEUTIG",
        "lieferform_json": v["lieferform_json"], "herkunft": "ANBIETERSEITE_P31", "register_id": "E283",
        "quelle": f"{url} (abgerufen {TAG}, P31-Lauf {LAUF}; gelesen von Claude) {zitat}; Beschreibung, Fokus und Lieferform vom Tageskurs {vorl}",
        "url_status": "OK", "url_geprueft_am": TAG, "scope_code": "PRAXIS_E005", "scope_begruendung": "", "dedupe_freigabe": "", "url_geteilt": "",
        "ursprung": f"P31 Nachbau Lauf 035 E283 Abendkurs zu {vorl}"})

schreibe(f"033_{TAG.replace('-', '')}_korrekturen.csv", z033)
schreibe(f"034_{TAG.replace('-', '')}_korrekturen.csv", z034)
schreibe(f"035_{TAG.replace('-', '')}_korrekturen.csv", z035)
schreibe(f"035_{TAG.replace('-', '')}_neue_angebote.csv", neu, NKOPF)
