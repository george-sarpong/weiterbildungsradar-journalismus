"""Tests zur Master-Fortschreibung (scripts/master_nachtraege.py). Aufruf in run_paket3.sh:
python3 -I scripts/test_nachtraege.py --out paket3/out"""
import argparse, csv, hashlib, json, pathlib, shutil, subprocess, sys, tempfile

R = pathlib.Path(__file__).resolve().parents[1]
ap = argparse.ArgumentParser(); ap.add_argument("--out", default="paket3/out"); a = ap.parse_args()
OUT = R / a.out
ok = 0; n = 0


def t(name, cond, info=""):
    global ok, n
    n += 1; ok += bool(cond); print(("PASS " if cond else "FAIL ") + name + (f" – {info}" if info and not cond else ""))


def lade(p):
    rows = list(csv.DictReader(open(p, encoding="utf-8-sig")))
    return rows, {(r["market"], r["id"]): r for r in rows}


V, VK = lade(OUT / "master_3818.csv"); N, NK = lade(OUT / "master_3818_aktuell.csv")
P = list(csv.DictReader(open(OUT / "master_nachtraege_protokoll.csv", encoding="utf-8")))
web = {r["id"]: r for r in N if r["kohorte"] == "WEBSITE_1352"}

t("N01 Master 3'818 Zeilen, Spalten unverändert", len(N) == len(V) == 3818 and list(N[0].keys()) == list(V[0].keys()))
diff = {(k, f) for k in VK for f in V[0] if VK[k][f] != NK[k][f]}
doku = {(web[p["id"]]["market"], p["id"], p["feld"]) for p in P} | \
       {(web[p["id"]]["market"], p["id"], p["h_feld"]) for p in P if p["h_feld"]}
t("N02 jede geänderte Zelle steht im Protokoll (Wert oder Herkunft), keine sonstige Änderung",
  {(k[0], k[1], f) for k, f in diff} == doku, f"{len(diff)} geändert, {len(doku)} protokolliert")
t("N03 Protokoll: neuer Wert steht im Master", all(web[p["id"]][p["feld"]] == p["neu"] for p in P))
p13 = {r["id"]: r for r in csv.DictReader(open(R / "paket13/out/master_3818_p13.csv", encoding="utf-8-sig"))}
t("N04 Paket 13 deckungsgleich mit paket13/out/master_3818_p13.csv (6 Felder)",
  all(web[i][f] == p13[i][f] for i in ("OFFER-HEAD-003", "AT-PROD-OFFER-040", "AT-PROD-OFFER-026")
      for f in ("url", "h_url", "beta_sichtbar", "beta_grund")))
cnt = lambda rows, v: sum(r["beta_sichtbar"] == v for r in rows)
t("N05 Beta sichtbar JA 3'445 → 3'443, NEIN 373 → 375 (E103)", (cnt(V, "JA"), cnt(N, "JA"), cnt(V, "NEIN"), cnt(N, "NEIN")) == (3445, 3443, 373, 375))
al = [r for r in N if r["anbieter_land"] != "nicht erfasst"]
p21h = ("IMPRESSUM_E118", "IMPRESSUM_E123", "UID_REGISTER_E132", "IMPRESSUM_E133")
t("N06 Anbieterland: 22 Audit (DJA) + 934 Domain (E118) + 377 Paket 21 (Impressum/UID), keine Überschneidung",
  len(al) == 1333 and sum(r["h_anbieter_land"] == "AUDIT" for r in al) == 22 and sum(r["h_anbieter_land"] == "DOMAIN_E118" for r in al) == 934
  and sum(r["h_anbieter_land"] in p21h for r in al) == 377, str(len(al)))
# Paket 21: Master = data-p21.js für Anbieterland, Ortsland, Sicherheitsgrad und CH-Zugang
raw21 = (R / "paket21/website/data-p21.js").read_text(encoding="utf-8")
D21 = {o["id"]: o for o in json.loads(raw21[len("window.WEITERBILDUNGSRADAR_OFFERS = "):].rstrip().rstrip(";"))}
K21 = list(csv.DictReader(open(R / "paket21/config/korrekturen.csv", encoding="utf-8")))
get = lambda o, f: (o.get("laender") or {}).get(f.split(".")[1]) if f.startswith("laender.") else o.get(f)
t("N12 Paket 21: jede Korrektur steht gleich in Master und data-p21.js",
  all(web[k["id"]][k["master_feld"]] == k["neu"] == get(D21[k["id"]], k["feld"]) for k in K21), str(len(K21)))
mc = [p for p in P if p["register_id"] in ("E107", "E109") and p["feld"] == "preis_text"]
t("N07 Mediencampus: 51 Preise CHF 1'150 mit Herkunft Anbieterseite, Preisoption EXACT 1150",
  len(mc) == 51 and all(web[p["id"]]["h_preis_text"].startswith("ANBIETERSEITE_") and
                        json.loads(web[p["id"]]["preis_optionen"])[0]["amount"] == 1150.0 for p in mc))
# Abgleich mit dem Website-Kandidaten
pre = "window.WEITERBILDUNGSRADAR_OFFERS = "
raw = (R / "paket18/website/data-p18.js").read_text(encoding="utf-8")
D = {o["id"]: o for o in json.loads(raw[len(pre):].rstrip().rstrip(";"))}
abw = [i for i, o in D.items() if i in web and (o.get("laender") or {}).get("anbieterLand", "nicht erfasst") not in (web[i]["anbieter_land"], "nicht erfasst")]
t("N08 Anbieterland Master = data-p18.js (wo dort belegt)", not abw, str(abw[:5]))
t("N09 Preis, Dauer, URL der Nachträge = data-p18.js",
  all(D[p["id"]]["priceDisplay"] == web[p["id"]]["preis_text"] for p in mc)
  and D["OFFER-HEAD-003"]["url"] == web["OFFER-HEAD-003"]["url"]
  and all(D[i].get("publicationStatus") == "HOLD" for i in ("AT-PROD-OFFER-040", "AT-PROD-OFFER-026")))
# Negativtest: veralteter alter Wert -> Abbruch, Master unverändert
with tempfile.TemporaryDirectory() as td:
    tdp = pathlib.Path(td); shutil.copy(OUT / "master_3818.csv", tdp / "master_3818.csv")
    rows = list(csv.reader((tdp / "master_3818.csv").read_text(encoding="utf-8-sig").splitlines()))
    ix = {c: i for i, c in enumerate(rows[0])}
    for r in rows[1:]:
        if r[ix["id"]] == "OFFER-MAZ-001": r[ix["anbieter_land"]] = "DE"
    with open(tdp / "master_3818.csv", "w", encoding="utf-8-sig", newline="") as f:
        csv.writer(f, lineterminator="\n").writerows(rows)
    vor = (tdp / "master_3818.csv").read_bytes()
    pr = subprocess.run([sys.executable, "-I", str(R / "scripts/master_nachtraege.py"), "--out", str(tdp)], cwd=R, capture_output=True, text=True)
    t("N10 veralteter alter Wert -> Abbruch, keine Ausgabe, Basis unverändert", pr.returncode != 0 and "ABBRUCH" in (pr.stderr + pr.stdout)
      and (tdp / "master_3818.csv").read_bytes() == vor and not (tdp / "master_3818_aktuell.csv").exists(), pr.stdout + pr.stderr)
t("N11 Basis master_3818.csv bleibt die Ausgabe von build_master_p3.py (für Paket 7 und Tests)", hashlib.sha256((OUT / "master_3818.csv").read_bytes()).hexdigest() == "a013ba468195c690b770113237b8a4bfaf817389bcd6b186e9dd06d4b5f18639", hashlib.sha256((OUT / "master_3818.csv").read_bytes()).hexdigest()[:16])
print(f"{ok}/{n} PASS")
sys.exit(0 if ok == n else 1)
