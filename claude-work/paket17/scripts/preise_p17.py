"""Paket 17 (E114, Punkt 4): 36 Preise, die nur als Preisklasse erschienen. Der Betrag steht schon im Datensatz,
aber in einer Form, die die Karte nicht liest («490 CHF», «700.–»). Normalisiert auf «CHF …», Originaltext in «alt».
Aufruf (aus claude-work/): python3 -I paket17/scripts/preise_p17.py"""
import csv, json, re, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
pre = "window.WEITERBILDUNGSRADAR_OFFERS = "
data = json.loads((R / "paket16/website/data-p16.js").read_text(encoding="utf-8")[len(pre):].rstrip().rstrip(";"))
by = {o["id"]: o for o in data}
ids = [l.split()[0] for l in (R / "paket17/config/preise_ids.txt").read_text().split("\n") if l.strip()]
Q = "Betrag aus dem publizierten Preistext übernommen, Schreibweise vereinheitlicht (Claude); Originaltext in «alt»"
rows = []
for i in ids:
    v = by[i]["priceDisplay"]; q = Q
    m = re.fullmatch(r"([\d']+) CHF", v)
    d = re.fullmatch(r"([\d']+)\.–(?: (?:excl\.|zzgl\.) 8\.1% (?:TVA|MWST))?", v)
    if m: n = f"CHF {m.group(1)}"
    elif d: n = f"CHF {d.group(1)}" + (" zzgl. 8,1 % MWST" if "8.1%" in v else ""); q += "; Währung CHF (Schweizer Anbieter, Schreibweise «.–»)"
    elif i == "OFFER-NICEPHORE-001":
        n = "ab CHF 5500 (Anzahlung CHF 340 + 24 × CHF 215 pro Monat; je nach Optionen)"; q += "; Gesamtbetrag aus den publizierten Teilbeträgen gerechnet (340 + 24 × 215)"
    elif i == "CH-CLEAN2-V12-D02":
        n = "CHF 550 (Kurs CHF 500 + Anmeldung CHF 50); für impressum-Mitglieder übernommen"; q += "; Kursgebühr inkl. Pflichtgebühr nach E054"
    else: raise SystemExit(f"unbekannt: {i} {v}")
    rows.append({"id": i, "feld": "priceDisplay", "alt": v, "neu": n, "register_id": "E114", "quelle": q, "bemerkung": ""})
with open(R / "paket17/config/korrekturen_preis.csv", "w", encoding="utf-8", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
print(len(rows), "Preise")
