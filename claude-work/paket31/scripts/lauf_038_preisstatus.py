"""Monatsbuild 24.11.2026, Lauf 038 (Owner-Entscheide E289, E290): Eingangsdatei eingang/038_20261124_korrekturen.csv.

E289 Preisstatus: Angebote, deren Preis in P31 mit Beleg eingetragen wurde (h_preis_budgetfaehig = ANBIETERSEITE_P31), die am
Stichtag sichtbar sind und noch preis_parser_status NEEDS_REVIEW tragen, bekommen AUTO_ACCEPT nur, wenn
  - alle Tarife amountType EXACT oder FREE, billingBasis TOTAL, priceScope FULL_OFFER, ohne components sind,
  - jeder Betrag (ausser FREE) im Preistext vorkommt (Gegenprobe gegen den belegten Text),
  - Preistext und Tarifbezeichnungen keine Abrechnungseinheit nennen (pro Semester, je/pro Modul, Rate, pro Tag/Monat …).
  In diesen Angeboten wird bei Tarifen mit eligibilityType UNKNOWN die Bedingung gesetzt, wenn die Bezeichnung eindeutig ist:
  Mitglied/membre/member → MEMBERSHIP (impressum → IMPRESSUM); Journalist (ohne Mitglied) → PROFESSION JOURNALIST,
  «libres» → PROFESSION FREELANCE_JOURNALIST; Lernende/Studierende/étudiant → STUDENT_STATUS. Alles Übrige bleibt.
E290: OFFER-HEVS-006 bis -008 beta_sichtbar «nicht erfasst» → JA (wie OFFER-DIGICOMP-075).
Liest nur den Master, schreibt nur die Eingangsdatei und eine Fallliste. Aufruf (aus claude-work/):
  python3 -I paket31/scripts/lauf_038_preisstatus.py 2026-11-24"""
import csv, datetime, json, pathlib, re, sys

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(R / "scripts"))
import sichtbarkeit as S  # noqa: E402

csv.field_size_limit(10 ** 9)
KOPF = ["id", "feld", "alt", "neu", "alt_anzeige", "herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "ursprung"]
EINHEIT = re.compile(r"pro\s+semester|par\s+semestre|je\s+modul|pro\s+modul|par\s+module|\brate|ratenzahlung|pro\s+tag\b|par\s+jour|"
                     r"pro\s+monat|monatlich|par\s+mois|pro\s+jahr|par\s+an\b|pro\s+lektion|pro\s+stunde|par\s+heure", re.I)


def betrag_im_text(betrag, text):
    zahlen = {re.sub(r"[’'.\s]", "", m) for m in re.findall(r"\d[\d’'.\s]*\d|\d", text) + re.findall(r"\d[\d’'.]*\d|\d", text)}
    zahlen |= {z.split(",")[0] for z in zahlen}
    b = f"{betrag:.2f}".rstrip("0").rstrip(".")
    return b in zahlen or b.replace(".", "") in zahlen or str(int(betrag)) in zahlen and float(betrag).is_integer()


def bedingung(label):
    l = (label or "").lower()
    if re.search(r"mitglied|membre|member", l): return ("MEMBERSHIP", "IMPRESSUM" if "impressum" in l else None)
    if "journalist" in l: return ("PROFESSION", "FREELANCE_JOURNALIST" if re.search(r"\blibres?\b", l) else "JOURNALIST")
    if re.search(r"lernende|studierende|student|étudiant|etudiant", l): return ("STUDENT_STATUS", None)
    return None


def main():
    t = datetime.date.fromisoformat(sys.argv[1])
    rows = S.lies_master(str(R / "paket3/out/master_3818_aktuell.csv"))
    aus, faelle = [], []
    for z in rows:
        if z["id"] in ("OFFER-HEVS-006", "OFFER-HEVS-007", "OFFER-HEVS-008") and z["beta_sichtbar"] == "nicht erfasst":
            aus.append({"id": z["id"], "feld": "beta_sichtbar", "alt": z["beta_sichtbar"], "neu": "JA", "herkunft": "OWNER_E290",
                        "register_id": "E290", "quelle": f"Neues Angebot nach E283 (Lauf 035), sichtbar nach scripts/sichtbarkeit.py; Kurslink {z['url']}",
                        "ursprung": "Monatsbuild 24.11. Lauf 038 E290"})
        if not (S.sichtbar(z, t) and z["preis_parser_status"] == "NEEDS_REVIEW" and z["preis_budgetfaehig"] == "True"
                and z["h_preis_budgetfaehig"] == "ANBIETERSEITE_P31"): continue
        po = json.loads(z["preis_optionen"] or "[]"); text = z["preis_text"]; grund = []
        if not po: grund.append("keine Tarife")
        for p in po:
            if p.get("amountType") not in ("EXACT", "FREE"): grund.append(f"amountType {p.get('amountType')}")
            if p.get("billingBasis") != "TOTAL": grund.append(f"billingBasis {p.get('billingBasis')}")
            if p.get("priceScope") != "FULL_OFFER": grund.append(f"priceScope {p.get('priceScope')}")
            if p.get("components"): grund.append("components")
            if p.get("amountType") == "EXACT" and (p.get("amount") is None or not betrag_im_text(float(p["amount"]), text)):
                grund.append(f"Betrag {p.get('amount')} nicht im Preistext")
            if EINHEIT.search(p.get("tariffLabel") or ""): grund.append(f"Einheit in Bezeichnung «{p.get('tariffLabel')}»")
        if EINHEIT.search(text): grund.append("Einheit im Preistext")
        if grund:
            faelle.append({"id": z["id"], "anbieter": z["anbieter"], "ergebnis": "BLEIBT_NEEDS_REVIEW", "grund": "; ".join(sorted(set(grund))), "preis_text": text})
            continue
        q = f"Regel E289 auf den in P31 belegten Preis ({z['h_preis_optionen']}); Preistext «{text[:150]}»; Kurslink {z['url']}"
        neu_po, gesetzt = [], []
        for p in po:
            p2 = dict(p)
            if p.get("eligibilityType") == "UNKNOWN":
                b = bedingung(p.get("tariffLabel"))
                if b: p2["eligibilityType"], p2["eligibilityValue"] = b; gesetzt.append(f"«{p.get('tariffLabel')}» → {b[0]} {b[1] or ''}".strip())
            neu_po.append(p2)
        if gesetzt:
            aus.append({"id": z["id"], "feld": "preis_optionen", "alt": z["preis_optionen"], "neu": json.dumps(neu_po, ensure_ascii=False),
                        "herkunft": "REGEL_E289", "register_id": "E289", "quelle": q + "; Bedingung " + ", ".join(gesetzt),
                        "ursprung": "Monatsbuild 24.11. Lauf 038 E289"})
        aus.append({"id": z["id"], "feld": "preis_parser_status", "alt": z["preis_parser_status"], "neu": "AUTO_ACCEPT", "herkunft": "REGEL_E289",
                    "register_id": "E289", "quelle": q, "ursprung": "Monatsbuild 24.11. Lauf 038 E289"})
        faelle.append({"id": z["id"], "anbieter": z["anbieter"], "ergebnis": "AUTO_ACCEPT", "grund": ", ".join(gesetzt), "preis_text": text})
    for a in aus:
        for k in KOPF: a.setdefault(k, "")
    with open(R / "eingang/038_20261124_korrekturen.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, KOPF, lineterminator="\n"); w.writeheader(); w.writerows(aus)
    with open(R / "paket31/out/lauf_038_faelle_2026-11-24.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, ["id", "anbieter", "ergebnis", "grund", "preis_text"], lineterminator="\n"); w.writeheader(); w.writerows(faelle)
    n = sum(1 for x in faelle if x["ergebnis"] == "AUTO_ACCEPT")
    print(f"OK Lauf 038: {len(aus)} Zeilen; AUTO_ACCEPT {n}, bleibt {len(faelle) - n}; Bedingung gesetzt bei "
          f"{sum(1 for a in aus if a['feld'] == 'preis_optionen')} Angeboten; HEVS {sum(1 for a in aus if a['feld'] == 'beta_sichtbar')}")


if __name__ == "__main__":
    main()
