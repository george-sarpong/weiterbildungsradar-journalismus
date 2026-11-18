"""Paket 21: Korrekturliste Anbieterland (E118, E123, E132, E133) und Durchführungsort (E134–E137) erzeugen.
Eingaben: paket20/website/data-p18.js (Live-Stand 18.11.), paket3/out/master_3818_aktuell.csv,
paket21/config/{anbieterland_belege,ort_regeln,ort_einzel}.csv, paket21/out/{dawan,nobleprog}_abruf_20261118.tsv.
Ausgabe: paket21/config/korrekturen.csv (id, feld, alt, neu, master_feld, master_alt, register_id, quelle).
Nichts wird erfunden: Ort nur aus Anbieterseite (Abruf 18.11.2026) oder Owner-Regel; CH-Zugang = JA nur, wenn der neue Ort
in der Schweiz liegt (E066). Aufruf (aus claude-work/): python3 -I paket21/scripts/korrekturen_p21.py"""
import csv, json, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parents[2]
C = R / "paket21/config"; O = R / "paket21/out"
pre = "window.WEITERBILDUNGSRADAR_OFFERS = "
D = json.loads((R / "paket20/website/data-p18.js").read_text(encoding="utf-8")[len(pre):].rstrip().rstrip(";"))
M = {r["id"]: r for r in csv.DictReader(open(R / "paket3/out/master_3818_aktuell.csv", encoding="utf-8-sig")) if r["kohorte"] == "WEBSITE_1352"}
ABRUF = "abgerufen 18.11.2026"
MF = {"laender.anbieterLand": "anbieter_land", "region": "ort_text", "laender.ortLand": "durchfuehrungsort_land",
      "laender.ortSicherheit": "durchfuehrungsort_sicherheit", "laender.chZugang": "ch_zugang"}
iso = lambda v: [c for c in str(v or "").split("|") if re.fullmatch(r"[A-Z]{2}", c.strip())]
L = lambda o: o.get("laender") or {}
rows, gesehen = [], set()


def neu(o, feld, wert, reg, quelle):
    alt = L(o).get(feld.split(".")[1], "") if feld.startswith("laender.") else o.get(feld, "")
    if alt == wert: return
    assert (o["id"], feld) not in gesehen, (o["id"], feld); gesehen.add((o["id"], feld))
    rows.append([o["id"], feld, alt, wert, MF[feld], M[o["id"]][MF[feld]], reg, quelle])


def ort(o, region, land, sicher, reg, quelle):
    assert not any(s.get("region") for s in o.get("sessions") or []), ("Termine mit eigenem Ort", o["id"])
    neu(o, "region", region, reg, quelle); neu(o, "laender.ortLand", land, reg, quelle)
    neu(o, "laender.ortSicherheit", sicher, reg, quelle)
    if land == "CH": neu(o, "laender.chZugang", "JA", "E066", f"Durchführungsort Schweiz ({reg}); " + quelle)


# 1 Anbieterland
B = {b["anbieter"]: b for b in csv.DictReader(open(C / "anbieterland_belege.csv", encoding="utf-8"))}
for o in D:
    b = B.get(o["provider"])
    if b: neu(o, "laender.anbieterLand", b["neu"], b["register_id"],
              f"Sitz {b['sitz']} ({b['rechtstraeger']}); {b['beleg_kurz']}; {b['quelle']} {ABRUF}")
ohne_ort = lambda o: not iso(L(o).get("ortLand")) and L(o).get("ortSicherheit") == "NICHT_PUBLIZIERT" \
    and str(o.get("region", "")).strip().upper() in ("", "NOT_PUBLISHED", "NICHT_PUBLIZIERT")
# 2 Schulregel (E134 MAZ, E135 weitere Schulen): nur Angebote ohne jede Ortsangabe («ausser es wird etwas Besonderes angegeben»)
AUS = {a["id"] for a in csv.DictReader(open(C / "ort_regel_ausnahmen.csv", encoding="utf-8"))}
for g in csv.DictReader(open(C / "ort_regeln.csv", encoding="utf-8")):
    for o in D:
        if o["provider"] == g["anbieter_praefix"] and ohne_ort(o) and o["id"] not in AUS:
            ort(o, g["ort"], "CH", "SCHULSTANDORT_OWNER_REGEL", g["register_id"], g["quelle"])
# 3 Einzelfälle mit Quelle (E136)
by = {o["id"]: o for o in D}
for e in csv.DictReader(open(C / "ort_einzel.csv", encoding="utf-8")):
    ort(by[e["id"]], e["ort"], e["ort_land"], e["ort_sicherheit"], e["register_id"], e["quelle"])
# 4 Dawan (E136): Ort «Genève» wählbar auf der Kursseite
DW = {l.split("\t")[0]: l.rstrip("\n").split("\t") for l in open(O / "dawan_abruf_20261118.tsv", encoding="utf-8")}
for o in D:
    if o["provider"] != "Dawan" or not str(o.get("region", "")).startswith("Fernunterricht / Präsenzort"): continue
    pfad, lieux, ge, di = DW[o["url"].replace("https://www.dawan.ch/formations/", "")]
    if "Genève" not in lieux: continue
    reg = "Fernunterricht oder Genf" if int(ge) else "Fernunterricht; Genf wählbar (Termin auf Anfrage)"
    ort(o, reg, "CH", "ORT_ALTERNATIV_ODER_UNSCHARF_MIT_ONLINE", "E136",
        f"{o['url']} {ABRUF}: Orte «{lieux}», Termine Genève {ge}, Distance {di}")
# 5 NobleProg (E136): Präsenzorte der Kursseite
NP = {l.split("\t")[0]: l.rstrip("\n").split("\t") for l in open(O / "nobleprog_abruf_20261118.tsv", encoding="utf-8")}
for o in D:
    if o["provider"] != "NobleProg Schweiz" or not str(o.get("region", "")).startswith("Schweiz / Online"): continue
    pfad, staedte, online = NP[o["url"].replace("https://www.nobleprog.ch/", "")]
    st = ", ".join(sorted(s.strip() for s in staedte.split(",")))
    ort(o, f"{st} / Online", "CH", "MEHRERE_ORTE_MIT_ONLINE", "E136",
        f"{o['url']} {ABRUF}: Präsenztermine in {st}, Online-Livetraining; Termine wechseln laufend")
# 6 Digicomp (E137): Standorte laut Anbieter alle in der Schweiz, Stadt je Kurs nicht lesbar
DQ = ("Digicomp-Standorte Zürich, Basel, Bern, Lausanne und Genf oder online (Selbstbeschreibung, "
      "https://www.ausbildung-weiterbildung.ch/Detail.aspx?schoolID=384; Kursseite AP6ADV: «Basel, Berne, Geneva, Lausanne, Zürich», "
      f"https://digicomp.ch/courses-digital-media-design/content-media-production/course-adobe-premiere-pro-cc-advanced) {ABRUF}; "
      "Kursseiten selbst ohne Browser nicht lesbar")
for o in D:
    if o["provider"] == "Digicomp Academy AG" and str(o.get("region", "")).strip() == "Digicomp" and not iso(L(o).get("ortLand")):
        ort(o, "Digicomp-Standorte (Zürich, Basel, Bern, Lausanne, Genf)", "CH", "ORT_ALTERNATIV_ODER_UNSCHARF", "E137", DQ)

with open(C / "korrekturen.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f, lineterminator="\n")
    w.writerow(["id", "feld", "alt", "neu", "master_feld", "master_alt", "register_id", "quelle"]); w.writerows(rows)
from collections import Counter
print("OK", len(rows), "Felder,", len({r[0] for r in rows}), "Angebote;", dict(Counter((r[6], r[1]) for r in rows)))
