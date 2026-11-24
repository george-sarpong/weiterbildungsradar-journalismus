"""P31 Lauf 037 (E288): Mediencampus-030/-043 Preis als Mindestpreis (FROM), budgetfähig. Aufruf (aus claude-work/): python3 -I paket31/scripts/lauf_037_mediencampus_mindestpreis.py"""
import csv, io, json, pathlib, sys
sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
M = {z["id"]: z for z in csv.DictReader(io.StringIO((R / "paket3/out/master_3818_aktuell.csv").read_text(encoding="utf-8-sig")))}
KOPF = ["id", "feld", "alt", "neu", "alt_anzeige", "herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "ursprung"]
def ab(betrag, label):
    return {"amountType": "FROM", "amount": None, "minAmount": float(betrag), "maxAmount": None, "currency": "CHF", "tariffClass": "REGULAR",
            "tariffLabel": label, "eligibilityType": "NONE", "eligibilityValue": None, "billingBasis": "TOTAL", "billingCount": None,
            "priceScope": "FULL_OFFER", "taxMode": "UNSPECIFIED", "taxRate": None, "validFrom": None, "validThrough": None, "components": []}
F = {
    "OFFER-MEDIENCAMPUS-030": ("lehrgang_medienkorrektorat.pdf (SHA-256 40f7f98f…) «mindestens neun Seminaren obligatorisch», je Seminar «Fr. 1'150.— (1 Tag Privatseminar)», «Ca. Fr. 10'350.— für 9 Seminare»",
        "ab CHF 10'350 (mindestens 9 Seminare à CHF 1'150, inkl. Kursunterlagen)", [ab(10350, "mindestens 9 Seminare")]),
    "OFFER-MEDIENCAMPUS-043": ("lehrgang_lektorat.pdf (SHA-256 94bca13c…) «Lehrgang mit mindestens 15 Seminaren», «Fr. 17’250.—, bei 15 Privatseminaren, inkl. Kursunterlagen», «Fr. 17'940.—, … inkl. Kursunterlagen und Abschlussprojekt»",
        "ab CHF 17'250 (mindestens 15 Seminare à CHF 1'150, inkl. Kursunterlagen); mit Abschlussprojekt ab CHF 17'940",
        [ab(17250, "mindestens 15 Seminare"), ab(17940, "mindestens 15 Seminare, mit Abschlussprojekt")]),
}
z = []
for i, (q, text, opts) in F.items():
    q = "https://www.mediencampus.ch/uploads/6/7/9/6/67962411/" + q + "; Owner-Entscheid E288 (Mindestpreis)"
    for feld, neu in (("preis_text", text), ("preis_optionen", json.dumps(opts, ensure_ascii=False)), ("preis_budgetfaehig", "True")):
        z.append({"id": i, "feld": feld, "alt": M[i][feld], "neu": neu, "alt_anzeige": "", "herkunft": "ANBIETERSEITE_P31", "register_id": "E288",
                  "quelle": q, "url_status": "", "url_geprueft_am": "", "ursprung": "P31 Lauf 037 Mindestpreis E288"})
with open(R / "eingang/037_20261124_korrekturen.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=KOPF, lineterminator="\n"); w.writeheader(); w.writerows(z)
print(len(z), "Zeilen")
