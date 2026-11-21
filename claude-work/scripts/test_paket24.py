"""Paket 24 «Master nachführen» (SPEZIFIKATION_PAKET24_20261120.md §4, T01–T14): Master trägt jede Angabe der Website.
Aufruf in run_paket3.sh nach test_nachtraege.py:  python3 -I scripts/test_paket24.py --out paket3/out
Referenzwerte «vorher» = Stand Commit 9fd113f (vor Paket 24), als SHA-256 festgehalten.
Paket 25 (SPEZIFIKATION_PAKET25 A10, Entscheid 8, E199): T06, T08/T09, T10, T14 um die 2 Lieferformspalten (A1) ergänzt;
historische Sollwerte, Hashes und Prüfabsichten unverändert; die neuen Spalten prüft paket25/tests/test_paket25_master.py."""
import argparse, collections, csv, hashlib, io, json, pathlib, re, shutil, subprocess, sys, tempfile

R = pathlib.Path(__file__).resolve().parents[1]
ap = argparse.ArgumentParser(); ap.add_argument("--out", default="paket3/out"); a = ap.parse_args()
OUT = R / a.out; MP = OUT / "master_3818_aktuell.csv"
ok = 0; n = 0


def t(name, cond, info=""):
    global ok, n
    n += 1; ok += bool(cond); print(("PASS " if cond else "FAIL ") + name + (f" – {info}" if info and not cond else ""))


sha = lambda b: hashlib.sha256(b).hexdigest()
VORHER_AKTUELL = "283ebb70ec7d250f6fe720f25dd115a51e994488ee2c7c16dc04ca48571b53d8"  # master_3818_aktuell.csv auf 9fd113f
VORHER_PROTO = "daf5928222ca2867553587e2f96d958f96d0fb8b2518d26c5a83b1f08f132800"    # Protokoll 9fd113f ohne Kopf, 4'118 Zeilen
BASIS = "a013ba468195c690b770113237b8a4bfaf817389bcd6b186e9dd06d4b5f18639"           # master_3818.csv (N11)
WEBSITE = {".htaccess": "661d6b4944dec5f10574eb91161dfba4e680718d0889b6a4dfb4e69b19cee741",
           "404.html": "236b2168513ba2fe2901f374102ee462833a78b44b68351c3d2c2ce7442a2c7d",
           "app-v43.js": "ada38d5ed342572b2b3e0daa476d9e6b4186426841047fb9a1655a6663789020",
           "data-p19.js": "fc0fc6f9c245a4cb867ec4bfa19e05ccf6dd18f5bacf901203811b0bb3b14d61",
           "datenschutz.html": "4c2482e4bb710b92a4eaf51d2c362ba767a2148ee907ac969662149968e3b06d",
           "impressum.html": "595fe7e87a43f60fcac8a02b62f9b7749dcd39b2c8a707136b3bd42ae01efb8c",
           "index.html": "66161dbadd424cc0090feb152ce32be262cc06b4714b4d8630b15cb6b92d76e5",
           "methodik.html": "4fb97b26b8735864e772c91015b3426009ec5b566dfd7ff0156363f07d9fd763",
           "robots.txt": "4d5160c370c864f9493561f0ab02f0149d8e07e589b12b8c29b20eda95aaa396",
           "sitemap.xml": "2c2f31a513ad944b72dcdadc8d96ae85b5539c8650d366684c6f90d1966dfb90"}
SMART = "7ddd326a26cbaaebcf4a9382c3e97d0f6399e6022d9d93f7ef2c21b377b2a35c"
SPERREN = {"AT-PROD-OFFER-026": "OWNER_E103", "AT-PROD-OFFER-040": "OWNER_E103", "OFFER-DIGICOMP-033": "OWNER_E142",
           "OFFER-DIGICOMP-041": "OWNER_E142", "OFFER-DIGICOMP-044": "OWNER_E142"}
ANZ = {"termin_text": "termin_anzeige", "ort_text": "ort_anzeige", "dauer": "dauer_anzeige", "preis_text": "preis_anzeige",
       "durchfuehrungen": "durchfuehrungen_anzeige"}
ANZ_COLS = [c for x in ANZ.values() for c in (x, "h_" + x)]
NEUE_FELDER = set(ANZ_COLS) | {"publikationsstatus", "publikationsgrund"}
LF_COLS = ["lieferform_json", "h_lieferform_json"]  # Paket 25 A1: am Ende nach den Anzeigefeldern

braw = MP.read_bytes()
head = next(csv.reader(io.StringIO(braw.decode("utf-8-sig"))))
N = list(csv.DictReader(io.StringIO(braw.decode("utf-8-sig"))))
B = list(csv.DictReader(open(OUT / "master_3818.csv", encoding="utf-8-sig")))
P = list(csv.DictReader(open(OUT / "master_nachtraege_protokoll.csv", encoding="utf-8")))
web = {r["id"]: r for r in N if r["kohorte"] in ("WEBSITE_1352", "NEU_P22")}

# ---------- T01 Gleichheitstest Website (data-p19.js) gegen Master ----------
SENT = re.compile(r'^(NOT_PUBLISHED|NICHT_PUBLIZIERT|NICHT_VERIFIZIERT\w*|PREIS_NICHT_PUBLIZIERT|NOT_IN_R4_SCHEMA|UNKNOWN|n/?a|-)$', re.I)
src = (R / "scripts/build_master_p3.py").read_text(encoding="utf-8")
assert SENT.pattern in src, "SENT im Test ≠ build_master_p3.py"
NE = "nicht erfasst"
def norm(v):
    if v is None: return NE
    s = str(v).strip()
    return NE if not s or SENT.match(s) else s
def mwert(r, f):
    x = ANZ.get(f); return r[x] if x and r[x] != "" else r[f]
def gleich(w, m, feld):
    """(gleich, exakt): exakt = Rohwert gleich; sonst nur über SENT gleichgesetzt. Durchführungen als Struktur
    (Liste in Reihenfolge, Einträge und Werte gleich; Schlüsselreihenfolge ohne Bedeutung)."""
    if feld == "sessions":
        ws = w if w else None; ms = None if norm(m) == NE else json.loads(m)
        return ws == ms, ws == ms
    if str(w if w is not None else "") == m: return True, True
    return norm(w) == norm(m), False
MAP = {"provider": "anbieter", "title": "titel", "description": "beschreibung", "access": "zugang_text", "level": "niveau",
       "language": "sprache", "country": "country_roh", "url": "url", "approved": "geprueft_am", "reviewAfter": "pruefen_ab",
       "focus": "fokus", "offerType": "angebotsart_roh", "priceDisplay": "preis_text", "priceCategory": "preis_kategorie",
       "format": "format", "duration": "dauer", "start": "termin_text", "startDate": "start_datum", "endDate": "end_datum",
       "region": "ort_text", "release_origin": "release_herkunft", "publicationStatus": "publikationsstatus",
       "publicationReason": "publikationsgrund", "sessions": "durchfuehrungen"}
LMAP = {"markt": "release_markt", "anbieterLand": "anbieter_land", "ortLand": "durchfuehrungsort_land",
        "ortSicherheit": "durchfuehrungsort_sicherheit", "chZugang": "ch_zugang"}
raw = (R / "paket19/website/data-p19.js").read_text(encoding="utf-8")
D = json.loads(raw[len("window.WEITERBILDUNGSRADAR_OFFERS = "):].rstrip().rstrip(";"))
# Identität (ZG-B04 A): keine Dublette in Master und Website, jede Website-ID genau einmal im Master, nur über Website-Kohorten
mid = collections.Counter(r["id"] for r in N); wid = collections.Counter(o["id"] for o in D)
ident = (len(N) == 3819 and max(mid.values()) == 1 and len(D) == 1353 and max(wid.values()) == 1
         and set(wid) == set(web) and all(mid[i] == 1 for i in wid))
abw, geprueft, normalisiert, codes = [], 0, collections.Counter(), []
for o in D:
    r = web[o["id"]] if o["id"] in web else None
    if r is None: continue
    for wf, mf in MAP.items():
        g, ex = gleich(o.get(wf), mwert(r, mf), wf); geprueft += 1
        if not g: abw.append((o["id"], wf))
        elif not ex:
            wv = str(o.get(wf) if o.get(wf) is not None else "").strip()
            normalisiert[("Code " if wv else "leer ") + wf] += 1
            if wv: codes.append((o["id"], wf, wv))
    g = all(norm((o.get("laender") or {}).get(lf)) == norm(r[mf]) for lf, mf in LMAP.items()); geprueft += 1  # laender = 1 Feld, 5 Teilfelder
    if not g: abw.append((o["id"], "laender"))
    elif any((o.get("laender") or {}).get(lf) != r[mf] for lf, mf in LMAP.items()): normalisiert["laender"] += 1
unbekannt = {k for o in D for k in o} - set(MAP) - {"id", "laender"}
print(f"INFO T01 nur über SENT gleichgesetzt (kein Rohwert-Treffer): {sum(normalisiert.values())} Feldwerte {dict(sorted(normalisiert.items()))}")
print(f"INFO T01 davon Website mit Platzhalter-Code: {len(codes)} {collections.Counter(c[2] for c in codes).most_common()}; Beispiel {[c for c in codes if c[0] == 'AT-PROD-OFFER-173']}")
t("T01 Gleichheitstest: 3'819 Master-Zeilen und 1'353 Website-IDs ohne Dublette, jede Website-ID genau einmal; 33'825 Feldwerte (1'353 × 25), 0 Abweichungen; Master = Anzeigefeld, sonst Original",
  ident and geprueft == 33825 and not abw and not unbekannt, f"Identität {ident}, geprüft {geprueft}, {len(abw)} Abweichungen {abw[:5]}, ohne Zuordnung {unbekannt}")

# ---------- T02 Sollmenge unabhängig aus Website und Originalfeldern ----------
WF = {"termin_text": "start", "ort_text": "region", "dauer": "duration", "preis_text": "priceDisplay", "durchfuehrungen": "sessions"}
soll = {(o["id"], ANZ[f]) for o in D for f, wf in WF.items() if not gleich(o.get(wf), web[o["id"]][f], wf)[0]}
ist = {(r["id"], x) for r in N for x in ANZ.values() if r[x] != ""}
gesetzt = collections.Counter(x for _, x in ist)
t("T02 gesetzte Anzeigefelder = Sollmenge (ID × Feld, wo die Website vom Original abweicht): Termin 377 · Ort 340 · Dauer 292 · Preis 36 · Durchführungen 18 = 1'063",
  ist == soll and len(ist) == 1063 and gesetzt == {"termin_anzeige": 377, "ort_anzeige": 340, "dauer_anzeige": 292, "preis_anzeige": 36, "durchfuehrungen_anzeige": 18},
  f"nur ist {sorted(ist - soll)[:3]}, nur soll {sorted(soll - ist)[:3]}, {dict(gesetzt)}")

# ---------- T03 Herkunft rekonstruierbar: Korrekturdateien → Protokoll → Master (ZG-B01) ----------
KORR = {"ANZEIGE_E113": ["paket16/config/korrekturen.csv"], "ANZEIGE_E114": ["paket17/config/korrekturen.csv", "paket17/config/korrekturen_preis.csv"]}
WEB2 = {"start": "termin_anzeige", "region": "ort_anzeige", "duration": "dauer_anzeige", "priceDisplay": "preis_anzeige"}
quell = [(h, k) for h, ps in KORR.items() for p in ps for k in csv.DictReader(open(R / p, encoding="utf-8"))]
PZ = [p for p in P if p["feld"] in ANZ.values()]
wirk = [p for p in PZ if p["herkunft"]]  # Zeilen aus Paket 16/17; leere Herkunft = überholt (T07)
f03 = []
if len(wirk) != len(quell): f03.append(("Anzahl", len(wirk), len(quell)))
for (h, k), p in zip(quell, wirk):  # gleiche Reihenfolge wie die Korrekturdateien, jede Korrektur genau eine Zeile
    feld = WEB2.get(k["feld"], "durchfuehrungen_anzeige")
    if (p["id"], p["feld"], p["herkunft"], p["register_id"]) != (k["id"], feld, h, k["register_id"]): f03.append((k["id"], k["feld"], "Zuordnung")); continue
    if feld != "durchfuehrungen_anzeige":
        if p["neu"] != k["neu"] or p["quelle"] != k["quelle"]: f03.append((k["id"], k["feld"], "Wert/Quelle"))
        continue
    m = re.fullmatch(r"sessions\[(\d+)\]\.(label|region)", k["feld"])
    if not p["quelle"].startswith(k["feld"] + ": "): f03.append((k["id"], k["feld"], "JSON-Pfad")); continue
    vor = json.loads(p["alt"] or web[k["id"]]["durchfuehrungen"]); nach = json.loads(p["neu"]); i, s = int(m.group(1)), m.group(2)
    erw = json.loads(json.dumps(vor)); erw[i][s] = k["neu"]
    if nach != erw or str(vor[i].get(s, "")) != k["alt"]: f03.append((k["id"], k["feld"], "Teilfeld"))  # nur dieser Pfad ändert
# Kette je Zelle: beginnt leer (= Original), alt = neu der vorigen, letzte Zeile = Master-Wert und Herkunft
kette = collections.defaultdict(list)
for p in PZ: kette[(p["id"], p["feld"])].append(p)
for (i, x), zs in kette.items():
    ok_k = zs[0]["alt"] == "" and all(b["alt"] == a["neu"] and b["h_alt"] == a["herkunft"] for a, b in zip(zs, zs[1:]))
    if not ok_k or web[i][x] != zs[-1]["neu"] or web[i]["h_" + x] != zs[-1]["herkunft"]: f03.append((i, x, "Kette"))
leer_h = [(r["id"], x) for r in N for x in ANZ.values() if (r[x] == "") != (r["h_" + x] == "")]
mehr = sum(len({p["herkunft"] for p in zs}) == 2 and x == "termin_anzeige" for (_, x), zs in kette.items())
t("T03 Herkunft rekonstruierbar: jede der 1'202 Korrekturen (Paket 16: 132, 17: 1'070) genau eine Protokollzeile mit ID, Feld bzw. JSON-Pfad, Paket, Register-ID, Quelle, alt, neu; Kette je Zelle lückenlos bis zum Master-Wert; 6 Termine mit Paket 16 und 17; leer ⇔ Herkunft leer",
  not f03 and not leer_h and len(quell) == 1202 and mehr == 6, f"{f03[:5]} {leer_h[:3]} Kette16→17 {mehr}")

# ---------- T04 Sperren, T05 Sichtbarkeit, T06 Originalfelder ----------
BK = {(r["market"], r["id"]): r for r in B}
hold_neu = {r["id"] for r in N if r["publikationsstatus"] != BK.get((r["market"], r["id"]), {}).get("publikationsstatus", r["publikationsstatus"])}
t("T04 Sperren: 5 IDs HOLD, Grund = Website, Herkunft OWNER_E103/E142; sonst publikationsstatus unverändert",
  hold_neu == set(SPERREN) and all(
      web[i]["publikationsstatus"] == "HOLD" == d["publicationStatus"] and web[i]["publikationsgrund"] == d["publicationReason"]
      and web[i]["h_publikationsstatus"] == web[i]["h_publikationsgrund"] == SPERREN[i]
      for d in D for i in [d["id"]] if i in SPERREN), str(sorted(hold_neu)))
cnt = collections.Counter(r["beta_sichtbar"] for r in N)
t("T05 Sichtbarkeit Master unverändert: beta_sichtbar JA 3'441 · NEIN 378", (cnt["JA"], cnt["NEIN"]) == (3441, 378), str(cnt))
alt_kopf = head[:-len(ANZ_COLS) - len(LF_COLS)]  # Paket 25: Lieferformspalten ausgeklammert
zurueck = []
for r in N:
    z = dict(r)
    if r["id"] in SPERREN:
        z.update({"publikationsstatus": NE, "publikationsgrund": NE, "h_publikationsstatus": "LEER", "h_publikationsgrund": "LEER"})
    zurueck.append([z[c] for c in alt_kopf])
b = io.StringIO(); csv.writer(b, lineterminator="\n").writerows([alt_kopf] + zurueck)
t("T06 Originalfelder: alle 113 bisherigen Spalten wie vorher (9fd113f), ausser publikationsstatus/-grund der 5 IDs",
  head[-len(ANZ_COLS) - len(LF_COLS):] == ANZ_COLS + LF_COLS and len(alt_kopf) == 113 and sha(("﻿" + b.getvalue()).encode("utf-8")) == VORHER_AKTUELL)

# ---------- T07 überholte Ortskorrekturen ----------
ueb = [p for p in P if p["quelle"] == "überholt durch Paket 21"]
# Sollmenge unabhängig aus den Korrekturdateien: Ortskorrektur Paket 17, deren ID Paket 21 im Originalfeld Ort setzt
o21 = {k["id"]: k for k in csv.DictReader(open(R / "paket21/config/korrekturen.csv", encoding="utf-8")) if k["master_feld"] == "ort_text"}
o17 = {k["id"]: k for k in csv.DictReader(open(R / "paket17/config/korrekturen.csv", encoding="utf-8")) if k["feld"] == "region"}
soll07 = set(o17) & set(o21)
t("T07 überholte Ortskorrekturen Paket 17 → Paket 21: 93 = Sollmenge aus den Korrekturdateien; Paket 21 prüfte den Website-Altwert gegen die Anzeige aus Paket 17; Anzeigefeld und Herkunft leer, frühere Herkunft im Protokoll",
  len(ueb) == 93 and {p["id"] for p in ueb} == soll07 and all(
      p["feld"] == "ort_anzeige" and p["h_alt"] == "ANZEIGE_E114" and p["alt"] == o17[p["id"]]["neu"] == o21[p["id"]]["alt"]
      and web[p["id"]]["ort_anzeige"] == web[p["id"]]["h_ort_anzeige"] == "" and web[p["id"]]["ort_text"] == o21[p["id"]]["neu"] for p in ueb),
  f"{len(ueb)} / Soll {len(soll07)}")

# ---------- T08 veralteter alter Wert, T09 Reproduzierbarkeit (in einer Kopie der Eingaben) ----------
EIN = ["scripts/master_nachtraege.py", "scripts/build_master_p3.py", "paket3/out/master_3818.csv", "paket13/config/owner_korrekturen.csv",
       "paket14/config/korrekturen.csv", "paket16/config/korrekturen.csv", "paket17/config/korrekturen.csv",
       "paket17/config/korrekturen_preis.csv", "paket18/config/korrekturen.csv", "paket21/config/korrekturen.csv",
       "paket22/config/korrekturen.csv", "paket22/config/neue_angebote.json", "paket25/eingang/lieferform_p19.json"]  # Paket 25 A1
def kopie(td):
    for p in EIN:
        (td / p).parent.mkdir(parents=True, exist_ok=True); shutil.copy(R / p, td / p)
def lauf(td):
    return subprocess.run([sys.executable, "-I", str(td / "scripts/master_nachtraege.py"), "--out", "paket3/out"], cwd=td, capture_output=True, text=True)
k16 = list(csv.DictReader(open(R / "paket16/config/korrekturen.csv", encoding="utf-8")))
kette = {(k["id"], k["feld"]) for k in k16}  # Paket-17-Zeilen, deren alter Wert die Anzeige aus Paket 16 ist (16 → 17)
FAELLE = [("paket17/config/korrekturen.csv", "alt", lambda z: z["feld"] == "start" and (z["id"], "start") not in kette),
          ("paket17/config/korrekturen.csv", "alt", lambda z: z["feld"].startswith("sessions[")),
          ("paket17/config/korrekturen.csv", "alt", lambda z: (z["id"], z["feld"]) in kette),
          ("paket21/config/korrekturen.csv", "alt", lambda z: z["master_feld"] == "ort_text"),
          ("paket21/config/korrekturen.csv", "master_alt", lambda z: z["master_feld"] == "ort_text"),
          ("paket22/config/korrekturen.csv", "master_alt", lambda z: z["master_feld"] == "ch_zugang")]  # Fehler am Ende der Paketfolge
erg = []
for pfad, spalte, wahl in FAELLE:
    with tempfile.TemporaryDirectory() as td:
        td = pathlib.Path(td); kopie(td)
        # bestehende Ausgaben eines früheren Laufs müssen bei Abbruch bytegleich bleiben (ZG-B05)
        (td / "paket3/out/master_3818_aktuell.csv").write_bytes(b"alt-master"); (td / "paket3/out/master_nachtraege_protokoll.csv").write_bytes(b"alt-protokoll")
        vorher = {p.name: p.read_bytes() for p in (td / "paket3/out").iterdir()}
        zs = list(csv.DictReader(open(td / pfad, encoding="utf-8"))); felder = list(zs[0].keys())
        z = next(z for z in zs if wahl(z)); z[spalte] = z[spalte] + " (veraltet)"
        with open(td / pfad, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, felder, lineterminator="\n"); w.writeheader(); w.writerows(zs)
        pr = lauf(td)
        erg.append(pr.returncode != 0 and "ABBRUCH" in pr.stdout + pr.stderr
                   and {p.name: p.read_bytes() for p in (td / "paket3/out").iterdir()} == vorher)
t("T08 veralteter alter Wert → Abbruch; Master, Protokoll und Ausgabeordner bytegleich, keine neuen Dateien (Paket 17 Termin, Durchführung, Kette 16 → 17; Paket 21 Ort gegen Anzeige und gegen Original; Paket 22 am Ende)",
  erg == [True] * 6, str(erg))
h = []
for _ in range(2):  # zwei unabhängige Builds, je aus einem frischen Ordner mit den versionierten Eingaben
    with tempfile.TemporaryDirectory() as td:
        td = pathlib.Path(td); kopie(td); pr = lauf(td)
        h.append((sha((td / "paket3/out/master_3818_aktuell.csv").read_bytes()), sha((td / "paket3/out/master_nachtraege_protokoll.csv").read_bytes())))
print("INFO T09 Eingaben SHA-256: " + "; ".join(f"{p} {sha((R / p).read_bytes())}" for p in EIN))
t("T09 zwei unabhängige Builds aus frischen Ordnern: Master und Protokoll bytegleich und gleich der Repo-Ausgabe",
  h[0] == h[1] == (sha(braw), sha((OUT / "master_nachtraege_protokoll.csv").read_bytes())), str(h))

# ---------- T10 Protokollzeilen der Pakete 13, 14, 18, 21, 22 ----------
alt_p = [list(p.values()) for p in P if p["feld"] not in NEUE_FELDER and p["quelle"] != "überholt durch Paket 21"
         and p["herkunft"] not in ("ANZEIGE_E113", "ANZEIGE_E114") and p["feld"] != "lieferform_json"]  # Paket 25: 1'353 Lieferform-Zeilen ausgeklammert
b = io.StringIO(); csv.writer(b, lineterminator="\n").writerows(alt_p)
t("T10 Protokollzeilen der Pakete 13, 14, 18, 21, 22 identisch zu vorher (Platzhalterregel SENT)", len(alt_p) == 4118 and sha(b.getvalue().encode()) == VORHER_PROTO, str(len(alt_p)))

# ---------- T11 test_nachtraege.py, T12 Basis, T13 Website, T14 Form ----------
pr = subprocess.run([sys.executable, "-I", str(R / "scripts/test_nachtraege.py"), "--out", a.out], cwd=R, capture_output=True, text=True)
t("T11 test_nachtraege.py 14/14 PASS", pr.returncode == 0 and "14/14 PASS" in pr.stdout, pr.stdout[-300:])
t("T12 Basis master_3818.csv bytegleich (N11)", sha((OUT / "master_3818.csv").read_bytes()) == BASIS)
W = R / "paket19/website"
t("T13 Website (paket19/website, alle Dateien) und Smart-Datei unverändert (SHA-256)",
  {p.name: sha(p.read_bytes()) for p in W.iterdir() if p.is_file()} == WEBSITE and sha((R / "paket19/out/smart-search-data-p19.json").read_bytes()) == SMART)
recs = list(csv.reader(io.StringIO(braw.decode("utf-8-sig"))))
t("T14 CSV-Form: 3'820 Zeilen inkl. Kopf, je 125 Spalten (Paket 25: 123 + 2 Lieferform), UTF-8 mit BOM, Zeilenende LF",
  len(recs) == 3820 and all(len(z) == 125 for z in recs) and braw.startswith(b"\xef\xbb\xbf") and b"\r\n" not in braw and braw.endswith(b"\n"))
print(f"{ok}/{n} PASS")
sys.exit(0 if ok == n else 1)
