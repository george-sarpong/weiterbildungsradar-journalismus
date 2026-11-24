"""P31 Lauf 036 (E282): Mediencampus-Lehrgänge 030 und 043 aus den PDF des Anbieters.
PDF auf der Lehrgangsseite verlinkt (Linkliste P31-Lauf 45415385968); Dateien vom Owner am 24.11.2026 in den Chat geladen,
Text mit pdftotext gelesen. Preis nicht budgetfähig: «ca.» bzw. «Kosten können je nach Seminarauswahl variieren» (E010).
Aufruf (aus claude-work/): python3 -I paket31/scripts/lauf_036_mediencampus_pdf.py"""
import csv, io, json, pathlib, sys

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
M = {z["id"]: z for z in csv.DictReader(io.StringIO((R / "paket3/out/master_3818_aktuell.csv").read_text(encoding="utf-8-sig")))}
KOPF = ["id", "feld", "alt", "neu", "alt_anzeige", "herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "ursprung"]


def opt(betrag, label):
    return {"amountType": "EXACT", "amount": float(betrag), "minAmount": None, "maxAmount": None, "currency": "CHF",
            "tariffClass": "REGULAR", "tariffLabel": label, "eligibilityType": "NONE", "eligibilityValue": None,
            "billingBasis": "TOTAL", "billingCount": None, "priceScope": "FULL_OFFER", "taxMode": "UNSPECIFIED", "taxRate": None,
            "validFrom": None, "validThrough": None, "components": []}


F = {
    "OFFER-MEDIENCAMPUS-030": (
        "https://www.mediencampus.ch/uploads/6/7/9/6/67962411/lehrgang_medienkorrektorat.pdf (SHA-256 40f7f98f…, vom Owner am 2026-11-24 bereitgestellt; "
        "verlinkt auf https://www.mediencampus.ch/lehrgang-medienkorrektorat.html, P31-Lauf 45415385968) «Ausbildungsdauer: 9 Privatseminare, Dauer: ca. 1 Jahr; "
        "… Einstieg jederzeit möglich» «Kosten: Ca. Fr. 10'350.— für 9 Seminare, inkl. Kursunterlagen (die Kosten können je nach der persönlichen Seminarauswahl variieren).»",
        {"termin_text": "Einstieg jederzeit möglich; Privatseminare nach Vereinbarung",
         "dauer": "9 Privatseminare, ca. 1 Jahr",
         "preis_text": "ca. CHF 10'350 für 9 Seminare inkl. Kursunterlagen (je nach Seminarauswahl)",
         "preis_optionen": json.dumps([opt(10350, "ca., je nach Seminarauswahl")], ensure_ascii=False),
         "preis_budgetfaehig": "False", "preis_kategorie": "UEBER_2000"}),
    "OFFER-MEDIENCAMPUS-043": (
        "https://www.mediencampus.ch/uploads/6/7/9/6/67962411/lehrgang_lektorat.pdf (SHA-256 94bca13c…, vom Owner am 2026-11-24 bereitgestellt; "
        "verlinkt auf https://www.mediencampus.ch/lehrgang-dipl-lektor-in-mns.html, P31-Lauf 45415385968) «Ausbildungsdauer: 15 Privatseminare; Dauer: ca. 1 ½ Jahre; "
        "… Einstieg jederzeit möglich» «Kosten: Fr. 17’250.—, bei 15 Privatseminaren, inkl. Kursunterlagen Fr. 17'940.—, bei 15 Privatseminaren, inkl. Kursunterlagen und "
        "Abschlussprojekt (Die Kosten können je nach der persönlichen Seminarauswahl variieren)»",
        {"termin_text": "Einstieg jederzeit möglich; Privatseminare nach Vereinbarung",
         "dauer": "15 Privatseminare, ca. 1½ Jahre",
         "preis_text": "CHF 17'250 bei 15 Privatseminaren inkl. Kursunterlagen; CHF 17'940 inkl. Abschlussprojekt (je nach Seminarauswahl)",
         "preis_optionen": json.dumps([opt(17250, "15 Privatseminare inkl. Kursunterlagen, je nach Seminarauswahl"),
                                       opt(17940, "inkl. Abschlussprojekt, je nach Seminarauswahl")], ensure_ascii=False),
         "preis_budgetfaehig": "False", "preis_kategorie": "UEBER_2000"}),
}
zeilen = []
for i, (q, felder) in F.items():
    for feld, neu in felder.items():
        zeilen.append({"id": i, "feld": feld, "alt": M[i][feld], "neu": neu, "alt_anzeige": "", "herkunft": "ANBIETERSEITE_P31",
                       "register_id": "E282", "quelle": q, "url_status": "", "url_geprueft_am": "", "ursprung": "P31 Lauf 036 Mediencampus-PDF E282"})
p = R / "eingang/036_20261124_korrekturen.csv"
with open(p, "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=KOPF, lineterminator="\n"); w.writeheader(); w.writerows(zeilen)
print(f"{p.name}: {len(zeilen)} Zeilen")
