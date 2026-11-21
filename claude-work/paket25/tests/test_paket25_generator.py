"""Paket 25 – Generator Master → Website (SPEZIFIKATION_PAKET25_20261120.md §5 G01–G08, G12, G13, G16, G17).
Aufruf (aus claude-work/): NODE_PATH=<tools>/node_modules python3 -I paket25/tests/test_paket25_generator.py
Vorher-Stand für G17: Commit 11fcc70 (git ls-tree), Live-Stand p19 als SHA-256 (U3)."""
import collections, csv, hashlib, io, json, os, pathlib, re, shutil, subprocess, sys, tempfile

R = pathlib.Path(__file__).resolve().parents[2]
sha = lambda b: hashlib.sha256(b).hexdigest()
PRE = "window.WEITERBILDUNGSRADAR_OFFERS = "
ok = n = 0


def t(name, cond, info=""):
    global ok, n
    n += 1; ok += bool(cond); print(("PASS " if cond else "FAIL ") + name + (f" – {info}" if info and not cond else ""))


def daten(p):
    raw = pathlib.Path(p).read_text(encoding="utf-8")
    assert raw.startswith(PRE) and raw.endswith(";\n"); return json.loads(raw[len(PRE):-2])


MP = R / "paket3/out/master_3818_aktuell.csv"; PP = R / "paket3/out/master_nachtraege_protokoll.csv"
D25, S25 = R / "paket25/website/data-p25.js", R / "paket25/out/smart-search-data-p25.json"
GEN = ["scripts/generator_website.py", "scripts/generator_platzhalter.csv", "paket3/out/master_3818_aktuell.csv"]
SOLL7 = {("CH-CLEAN2-V9-D01", "duration"): ("NICHT_PUBLIZIERT", "NOT_PUBLISHED"), ("CH-V18-F03", "duration"): ("NICHT_PUBLIZIERT", "NOT_PUBLISHED"),
         ("CH-V19-N01", "duration"): ("NICHT_PUBLIZIERT", "NOT_PUBLISHED"), ("PJ-V16-09", "duration"): ("NICHT_PUBLIZIERT", "NOT_PUBLISHED"),
         ("AT-PROD-OFFER-151", "duration"): ("NICHT_PUBLIZIERT", "NOT_PUBLISHED"), ("V59-SZ05", "region"): ("NICHT_PUBLIZIERT", "NOT_PUBLISHED"),
         ("AT-PROD-OFFER-173", "priceDisplay"): ("NICHT_VERIFIZIERT_FUER_AKTUELLEN_KATALOGTERMIN", "NICHT_PUBLIZIERT")}
A4 = ["id", "provider", "title", "description", "access", "level", "language", "country", "url", "approved", "reviewAfter", "focus", "offerType",
      "priceDisplay", "priceCategory", "format", "duration", "start", "startDate", "endDate", "region", "release_origin",
      "publicationStatus", "publicationReason", "sessions", "laender"]


def gen(td, *extra):
    return subprocess.run([sys.executable, "-I", str(td / "scripts/generator_website.py"), *extra], cwd=td, capture_output=True, text=True)


def kopie(td, dateien):
    for p in dateien:
        (td / p).parent.mkdir(parents=True, exist_ok=True); shutil.copy(R / p, td / p)


# ---------- G08 Master nur gelesen (Repo) + G01 Eingaben ----------
vor = (sha(MP.read_bytes()), sha(PP.read_bytes()))
with tempfile.TemporaryDirectory() as td:
    td = pathlib.Path(td); kopie(td, GEN)
    pr = gen(td); alle = sorted(str(p.relative_to(td)) for p in td.rglob("*") if p.is_file())
    g01 = (pr.returncode == 0 and (td / "paket25/website/data-p25.js").read_bytes() == D25.read_bytes()
           and (td / "paket25/out/smart-search-data-p25.json").read_bytes() == S25.read_bytes()
           and alle == sorted(GEN + ["paket25/website/data-p25.js", "paket25/out/smart-search-data-p25.json"]))
    g08a = sha((td / GEN[2]).read_bytes()) == vor[0]
t("G01 Eingaben: Lauf in einem Ordner nur mit Master, Platzhaltertabelle und Generator ergibt dieselbe Ausgabe (bytegleich), keine weiteren Dateien", g01, pr.stdout + pr.stderr)
pr = gen(R)  # Repo-Lauf
t("G08 Master nur gelesen: Master und Protokoll vor und nach dem Generator bytegleich (E031)",
  pr.returncode == 0 and g08a and (sha(MP.read_bytes()), sha(PP.read_bytes())) == vor)

# ---------- G02–G05 ----------
A = daten(R / "paket19/website/data-p19.js"); B = daten(D25)
ida, idb = [o["id"] for o in A], [o["id"] for o in B]
M = list(csv.DictReader(open(MP, encoding="utf-8-sig")))
t("G02 Auswahl: 1'353 IDs = data-p19.js, keine Dublette; Reihenfolge = Master-Reihenfolge CH/AT/LI (Entscheid 3)",
  len(idb) == 1353 == len(set(idb)) and set(ida) == set(idb) and idb == [r["id"] for r in M if r["release_markt"] in ("CH", "AT", "LI")])
AK = {o["id"]: o for o in A}; abw = {}; keys = []
for o in B:
    a = AK[o["id"]]
    if set(o) != set(a): keys.append(o["id"])
    for k in o:
        if json.dumps(o[k], sort_keys=True) != json.dumps(a.get(k), sort_keys=True): abw[(o["id"], k)] = (a.get(k), o[k])
t("G03 Datendatei: je Angebot gleiche Schlüsselmenge; alle Werte gleich data-p19.js (typgenau) ausser der Sollliste von 7 Platzhaltern (ID, Feld, alt, neu fest); 0 weitere Abweichungen",
  not keys and abw == SOLL7, f"Schlüssel {keys[:3]}; Abweichungen {sorted(set(abw) ^ set(SOLL7))[:5]}")
reihen = collections.Counter(tuple(k for k in o) for o in B)
t("G04 Felder: kein korrekturen, kein Feld ausserhalb A4; feste Schlüsselreihenfolge (Reihenfolge A4, fehlende Felder ausgelassen)",
  all("korrekturen" not in o and set(o) <= set(A4) and list(o) == [k for k in A4 if k in o] for o in B), str(reihen.most_common(3)))
SA = json.loads((R / "paket19/out/smart-search-data-p19.json").read_text(encoding="utf-8")); SB = json.loads(S25.read_text(encoding="utf-8"))
t("G05 Smart-Datei: 1'353 Einträge, jeder gleich Smart-p19 (Struktur, typgenau); meta gleich; byId in der Reihenfolge der Datendatei",
  list(SB) == ["meta", "byId"] and SB["meta"] == SA["meta"] and list(SB["byId"]) == idb and set(SA["byId"]) == set(SB["byId"])
  and all(json.dumps(SB["byId"][i], sort_keys=True) == json.dumps(SA["byId"][i], sort_keys=True) for i in idb)
  and all(list(v) == ["parserStatus", "priceEligible", "priceOptions", "delivery"] for v in SB["byId"].values()))

# ---------- G06 Abbruch (A7, B04) ----------
recs = list(csv.reader(io.StringIO(MP.read_bytes().decode("utf-8-sig"))))
head = recs[0]; ix = {c: i for i, c in enumerate(head)}
zeile = lambda f: next(k for k, r in enumerate(recs[1:], 1) if f(r))
ch = lambda r: r[ix["release_markt"]] in ("CH", "AT", "LI")
k_any = zeile(ch)
k_sess = zeile(lambda r: ch(r) and r[ix["durchfuehrungen"]] != "nicht erfasst" and r[ix["durchfuehrungen_anzeige"]] == "")
k_anz = zeile(lambda r: ch(r) and r[ix["durchfuehrungen_anzeige"]] != "")
k_zweit = zeile(lambda r: ch(r) and recs.index(r) != k_any)
rid = lambda k: recs[k][ix["id"]]


def setz(k, f, v):
    def g(rs): rs[k][ix[f]] = v
    return g


def spalte_weg(f):
    def g(rs):
        i = rs[0].index(f)
        for r in rs: del r[i]
    return g


FAELLE = [  # (Name, Änderung, erwartete Teile der Meldung)
    ("Platzhalter in Feld ohne Eintrag (beschreibung)", setz(k_any, "beschreibung", "nicht erfasst"), [rid(k_any), "description"]),
    ("fehlende Pflichtspalte preis_optionen", spalte_weg("preis_optionen"), ["preis_optionen"]),
    ("leere ID", setz(k_any, "id", ""), ["Master-Zeile 2", "Feld id"]),  # B08: Zeilennummer statt ID
    ("doppelte ID", setz(k_zweit, "id", rid(k_any)), [rid(k_any), "Feld id"]),
    ("ungültiges JSON preis_optionen", setz(k_any, "preis_optionen", "[{"), [rid(k_any), "preis_optionen"]),
    ("ungültiges JSON durchfuehrungen", setz(k_sess, "durchfuehrungen", "[{"), [rid(k_sess), "durchfuehrungen"]),
    ("ungültiges JSON lieferform_json", setz(k_any, "lieferform_json", "{"), [rid(k_any), "lieferform_json"]),
    ("ungültiges JSON durchfuehrungen_anzeige", setz(k_anz, "durchfuehrungen_anzeige", "[{"), [rid(k_anz), "durchfuehrungen_anzeige"]),
    ("preis_optionen als Objekt", setz(k_any, "preis_optionen", "{}"), [rid(k_any), "preis_optionen"]),
    ("durchfuehrungen mit falschem Typ", setz(k_sess, "durchfuehrungen", '{"a": 1}'), [rid(k_sess), "durchfuehrungen"]),
    ("lieferform_json null", setz(k_any, "lieferform_json", "null"), [rid(k_any), "lieferform_json"]),
    ("lieferform_json []", setz(k_any, "lieferform_json", "[]"), [rid(k_any), "lieferform_json"]),
    ("unbekannter Wert preis_budgetfaehig", setz(k_any, "preis_budgetfaehig", "Ja"), [rid(k_any), "preis_budgetfaehig"]),
    ("fehlende lieferform_json", setz(k_any, "lieferform_json", "nicht erfasst"), [rid(k_any), "lieferform_json"]),
]
erg = {}
for name, aend, teile in FAELLE:
    with tempfile.TemporaryDirectory() as td:
        td = pathlib.Path(td); kopie(td, GEN)
        rs = [list(r) for r in recs]; aend(rs)
        b = io.StringIO(); csv.writer(b, lineterminator="\n").writerows(rs)
        (td / GEN[2]).write_bytes(("﻿" + b.getvalue()).encode("utf-8"))
        for p in ("paket25/website/data-p25.js", "paket25/out/smart-search-data-p25.json"):  # bestehender Ausgabeordner
            (td / p).parent.mkdir(parents=True, exist_ok=True); (td / p).write_bytes(b"alt-" + p.encode())
        (td / "paket25/website/index.html").write_bytes(b"alt-index")
        vorher = {str(p.relative_to(td)): p.read_bytes() for p in (td / "paket25").rglob("*") if p.is_file()}
        pr = gen(td); msg = pr.stdout + pr.stderr
        nachher = {str(p.relative_to(td)): p.read_bytes() for p in (td / "paket25").rglob("*") if p.is_file()}
        erg[name] = pr.returncode != 0 and "ABBRUCH" in msg and all(x in msg for x in teile) and nachher == vorher
        print(f"INFO G06 {name}: {msg.strip()[:150]}")
t(f"G06 Abbruch: {len(FAELLE)} Fälle einzeln gegen einen bestehenden Ausgabeordner: Rückgabecode ≠ 0, Meldung mit ID und Feld (bei leerer ID Zeilennummer, bei fehlender Spalte der Spaltenname; B08), Ausgabeordner bytegleich, keine neuen Dateien",
  all(erg.values()) and len(erg) == 14, str({k: v for k, v in erg.items() if not v}))

# G06b (Gegenprüfung S2): Fehler beim Schreiben der zweiten Ausgabe → erste Ausgabe bytegleich, keine Zwischendatei
with tempfile.TemporaryDirectory() as td:
    td = pathlib.Path(td); kopie(td, GEN)
    (td / "paket25/website").mkdir(parents=True); (td / "paket25/website/data-p25.js").write_bytes(b"alt-daten")
    (td / "paket25/out").write_bytes(b"Datei statt Ordner")
    pr = gen(td); reste = [str(p.relative_to(td)) for p in td.rglob(".tmp-*")]
    t("G06b Schreibfehler bei der Smart-Ausgabe (Ordner ist eine Datei): Rückgabecode ≠ 0, data-p25.js bytegleich, keine Zwischendatei (S2)",
      pr.returncode != 0 and (td / "paket25/website/data-p25.js").read_bytes() == b"alt-daten" and not reste, f"{pr.returncode} {reste}")

# ---------- G07 Determinismus, G12 Liste, G13 Sitemap (zwei Builds aus frischen Ordnern, Stichtag 20.11.) ----------
BUILD = GEN + ["paket25/scripts/build_p25.sh", "paket25/scripts/build_liste_p25.js", "paket19/config/sitemap_lastmod.csv",
               "live-snapshot-20261109/sitemap.xml"] + [str(p.relative_to(R)) for p in (R / "paket22/website").iterdir() if p.is_file()]
NODE_PATH = os.environ.get("NODE_PATH") or sys.exit("NODE_PATH fehlt")
ausg = []
for _ in range(2):
    with tempfile.TemporaryDirectory() as td:
        td = pathlib.Path(td); kopie(td, BUILD)
        pr = subprocess.run(["bash", "paket25/scripts/build_p25.sh", "2026-11-20"], cwd=td, capture_output=True, text=True,
                            env={"PATH": os.environ["PATH"], "NODE_PATH": NODE_PATH, "HOME": os.environ.get("HOME", "/tmp")})
        if pr.returncode: print(pr.stdout, pr.stderr)
        ausg.append({f: (td / f).read_bytes() for f in ("paket25/website/data-p25.js", "paket25/out/smart-search-data-p25.json",
                                                         "paket25/website/index.html", "paket25/website/sitemap.xml")})
t("G07 Determinismus: zwei Builds aus frischen Ordnern bytegleich (Datendatei, Smart, index.html, sitemap.xml) und gleich der Repo-Ausgabe",
  ausg[0] == ausg[1] and all(ausg[0][f] == (R / f).read_bytes() for f in ausg[0]))
LS, LE = "<!-- P19-LISTE -->", "<!-- /P19-LISTE -->"
blk = lambda h: h[h.index(LS):h.index(LE) + len(LE)]
i25 = ausg[0]["paket25/website/index.html"].decode("utf-8"); i19 = (R / "paket19/website/index.html").read_text(encoding="utf-8")
t("G12 Liste im HTML, Stichtag 20.11.: Block zwischen den P19-Markern bytegleich mit paket19/website/index.html; «Stand der Angaben: 20.11.2026» (ganze index.html bytegleich)",
  blk(i25) == blk(i19) and "Stand der Angaben: 20.11.2026" in i25 and i25 == i19 and blk(i25).count("<li>") == 1006)
t("G13 Sitemap, Stichtag 20.11.: bytegleich mit paket19/website/sitemap.xml", ausg[0]["paket25/website/sitemap.xml"] == (R / "paket19/website/sitemap.xml").read_bytes())

# ---------- G16 Grösse, G17 Unverändert ----------
gr = {"Datendatei": (D25.stat().st_size, (R / "paket19/website/data-p19.js").stat().st_size),
      "Smart-Datei": (S25.stat().st_size, (R / "paket19/out/smart-search-data-p19.json").stat().st_size)}
print("INFO G16 " + "; ".join(f"{k} {a:,} Byte gegen p19 {b:,} ({(a - b) / b * 100:+.4f} %)".replace(",", "'") for k, (a, b) in gr.items()))
t("G16 Grösse: Datendatei und Smart-Datei gegen p19 innerhalb ±1 %", all(abs(a - b) / b <= 0.01 for a, b in gr.values()))
git = lambda *a: subprocess.run(["git", *a], cwd=R, capture_output=True, text=True, check=True).stdout
basis = dict(l.split(None, 3)[2:4][::-1] for l in git("ls-tree", "-r", "11fcc70", "--", "paket19/website", "paket19/out/smart-search-data-p19.json",
                                                    "paket22", "paket3/out/master_3818.csv").splitlines())
jetzt = {p: git("hash-object", p).strip() for p in basis}
weitere = [str(p.relative_to(R)) for d in ("paket19/website", "paket22") for p in (R / d).rglob("*") if p.is_file() and str(p.relative_to(R)) not in basis]
t(f"G17 Unverändert gegenüber 11fcc70: paket19/website/* (inkl. .htaccess), smart-search-data-p19.json, paket22/ ({len(basis)} Dateien), Basis master_3818.csv; keine neuen Dateien dort",
  len(basis) > 20 and jetzt == basis and not weitere and "paket3/out/master_3818.csv" in basis, f"{[p for p in basis if jetzt[p] != basis[p]][:5]} {weitere[:5]}")
print(f"{ok}/{n} PASS")
sys.exit(0 if ok == n else 1)
