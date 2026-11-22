"""Paket 27 «Modell erweitern» – Abnahme P01–P15 und Regeln B01–B08, K15, K16 (SPEZIFIKATION_PAKET27_20261122.md §5;
E213–E218). Aufruf (aus claude-work/): NODE_PATH=<tools>/node_modules python3 -I paket27/tests/test_paket27.py
Alle Fehl- und Gutfälle laufen in Kopien der Eingaben in einem Temp-Ordner; das Repo bleibt unverändert.
Referenz «vorher» = Stand Paket 26 (Commit c8d390e; Master cf9fdb2d…, Protokoll c82cef3d…, über scripts/stand_p26.py
bzw. git gelesen). P12 setzt voraus, dass vorher paket27/tests/test_paket27_anzeige.js gelaufen ist (Ergebnis
paket27/out/test_paket27_js.json, Build-Ausgabe im Repo); fehlt die Datei, ist P12 FAIL. Die Meldungen der Fehlfälle werden
auf «Datei:Zeile:Spalte» und Regel geprüft (Gegenprüfung B1)."""
import collections, csv, hashlib, io, json, os, pathlib, re, shutil, subprocess, sys, tempfile

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
GIT = R.parent
sys.path.insert(0, str(R / "scripts"))
import stand_p26  # noqa: E402
import sichtbarkeit as SB  # noqa: E402

sha = lambda b: hashlib.sha256(b).hexdigest()
ok = n = 0
VOR = "c8d390e"
NE = "nicht erfasst"
P26 = stand_p26.ordner()
NODE_PATH = os.environ.get("NODE_PATH", "")
TAB = ["scripts/eingang_felder.csv", "scripts/eingang_codelisten.csv", "scripts/eingang_herkunft.csv", "scripts/iso3166_alpha2.csv"]
CODE = ["scripts/master_nachtraege.py", "scripts/eingang.py", "scripts/eingang_pruefen.py", "scripts/build_master_p3.py"]
EIN = CODE + TAB + ["paket3/out/master_3818.csv", "wissensbasis/ENTSCHEIDUNGSREGISTER.csv", "paket25/eingang/lieferform_p19.json", "daten/anbieter.csv"]
EINGANG = sorted(str(p.relative_to(R)) for p in (R / "eingang").iterdir() if p.is_file())
KK = ["id", "feld", "alt", "neu", "alt_anzeige", "herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "ursprung"]
KA = ["anbieter_id", "feld", "alt", "neu", "herkunft", "register_id", "quelle", "ursprung"]
Q = "https://example.org/testfall-p27, abgerufen 22.11.2026 (Testfall, kein echter Nachtrag)"
H, REG = "ANBIETERSEITE_E143", "E214"


def t(name, cond, info=""):
    global ok, n
    n += 1; ok += bool(cond); print(("PASS " if cond else "FAIL ") + name + (f" – {info}" if info and not cond else ""))


def git(*a): return subprocess.run(["git", *a], cwd=GIT, capture_output=True, check=True).stdout
def lies(p): return list(csv.DictReader(open(p, encoding="utf-8", newline="")))
def lies_m(p): return list(csv.DictReader(io.StringIO(pathlib.Path(p).read_text(encoding="utf-8-sig"))))
def baum(d): return {str(p.relative_to(d)): sha(p.read_bytes()) for p in sorted(pathlib.Path(d).rglob("*")) if p.is_file()}
def schreibe_csv(p, kopf, zeilen):
    b = io.StringIO(); csv.writer(b, lineterminator="\n").writerows([kopf] + zeilen); p.write_bytes(b.getvalue().encode("utf-8"))
def kopie(td, extra=()):
    for p in EIN + EINGANG + list(extra):
        (td / p).parent.mkdir(parents=True, exist_ok=True); shutil.copy(R / p, td / p)
def lauf(td, skript, *args):
    return subprocess.run([sys.executable, "-I", str(td / skript), *args], cwd=td, capture_output=True, text=True)


MP, PP = R / "paket3/out/master_3818_aktuell.csv", R / "paket3/out/master_nachtraege_protokoll.csv"
braw = MP.read_bytes()
recs = list(csv.reader(io.StringIO(braw.decode("utf-8-sig"))))
M = [dict(zip(recs[0], r)) for r in recs[1:]]; MI = {r["id"]: r for r in M}
V = lies_m(P26 / "master_3818_aktuell.csv"); VI = {r["id"]: r for r in V}
P = lies(PP); PV = lies(P26 / "master_nachtraege_protokoll.csv")
A = lies(R / "daten/anbieter.csv"); AI = {z["anbieter_id"]: z for z in A}
for z in A: z["sw"] = json.loads(z["schreibweisen"])
L027 = lies(R / "eingang/027_20261122_korrekturen.csv")
P27_COLS = ["anbieter_id", "h_anbieter_id", "scope_code", "scope_begruendung", "h_scope_code"]

# ---------- P01 Master-Form ----------
diff = sorted((r["id"], c) for r in M for c in VI[r["id"]] if r[c] != VI[r["id"]][c])
soll01 = sorted([(z["id"], z["feld"]) for z in L027] + [(z["id"], "h_" + z["feld"]) for z in L027])
t("P01 Master-Form: 3'820 Zeilen inkl. Kopf × 130 Spalten (125 + anbieter_id, h_anbieter_id, scope_code, scope_begruendung, h_scope_code), UTF-8 mit BOM, LF; "
  "die 125 Spalten von Paket 26 gleich cf9fdb2d… ausser den 22 Zellen aus Lauf 027 und ihrer Herkunft (44 Zellen); Zeilen in gleicher Reihenfolge",
  len(recs) == 3820 and all(len(z) == 130 for z in recs) and recs[0] == list(V[0]) + P27_COLS and braw.startswith(b"\xef\xbb\xbf")
  and b"\r\n" not in braw and [r["id"] for r in M] == [r["id"] for r in V] and diff == soll01 and len(diff) == 44
  and all(MI[z["id"]]["h_" + z["feld"]] == "NORMIERUNG_P27" and MI[z["id"]][z["feld"]] == z["neu"] for z in L027),
  f"{len(diff)} {diff[:4]}")

# ---------- P02 Protokoll ----------
pv_raw, p_raw = (P26 / "master_nachtraege_protokoll.csv").read_bytes(), PP.read_bytes()
neu = P[len(PV):]
an = [p for p in neu if p["feld"] == "anbieter_id"]; sc = [p for p in neu if p["feld"].startswith("scope_")]; nm = [p for p in neu if p["herkunft"] == "NORMIERUNG_P27"]
t("P02 Protokoll: die 6'776 Zeilen von Paket 26 bytegleich vorne (c82cef3d…); neu genau 3'842 Zeilen = 3'819 anbieter_id (ANBIETER_TABELLE_P27, E214) "
  "+ 1 scope_code (OFFER-DIGICOMP-075 PRAXIS_E005) + 22 Trennzeichen (NORMIERUNG_P27, E216); jede neue Zeile = Master-Wert",
  p_raw.startswith(pv_raw) and len(PV) == 6776 and len(neu) == 3842 and len(an) == 3819 and len(nm) == 22 and len(sc) == 1
  and all(p["herkunft"] == "ANBIETER_TABELLE_P27" and p["register_id"] == "E214" and p["alt"] == NE for p in an)
  and [(p["id"], p["neu"]) for p in sc] == [("OFFER-DIGICOMP-075", "PRAXIS_E005")]
  and all(MI[p["id"]][p["feld"]] == p["neu"] for p in neu) and len(an) + len(sc) + len(nm) == len(neu), f"{len(neu)} / {len(an)} {len(sc)} {len(nm)}")

# ---------- P03 Anbieter-Tabelle ----------
mk = collections.defaultdict(set)
for r in M: mk[r["release_markt"]].add(r["anbieter_id"])
zus = sorted((z["anbieter_id"], tuple(z["sw"])) for z in A if len(z["sw"]) > 1)
with tempfile.TemporaryDirectory() as td:  # Erstfassung reproduzierbar aus dem Master Stand P26
    td = pathlib.Path(td); kopie(td, ["paket27/scripts/bau_anbieter.py"]); shutil.copy(P26 / "master_3818_aktuell.csv", td / "paket3/out/master_3818_aktuell.csv")
    (td / "daten/anbieter.csv").unlink(); pr = lauf(td, "paket27/scripts/bau_anbieter.py")
    repro = pr.returncode == 0 and (td / "daten/anbieter.csv").read_bytes() == (R / "daten/anbieter.csv").read_bytes()
print(f"INFO P03 Anbieter je Markt: " + ", ".join(f"{k} {len(v)}" for k, v in sorted(mk.items())) + f"; Zusammenführungen: {zus}")
t("P03 Anbieter-Tabelle: 1'295 Anbieter (vorher 1'301 Schreibweisen, keine Kennung; CH/AT/LI 169, DE 35, USA 1'092), Kennungen ANB-0001 … fortlaufend; "
  "jede Master-Zeile genau eine Kennung, Text = eine ihrer Schreibweisen; 6 Zusammenführungen (ZHdK und 5 USA); Erstfassung aus dem Master Stand P26 bytegleich reproduziert; "
  "anbieter_aktuell.csv = daten/anbieter.csv (kein Anbieter-Lauf)",
  len(A) == 1295 and [z["anbieter_id"] for z in A] == [f"ANB-{i:04d}" for i in range(1, 1296)] and sum(len(z["sw"]) for z in A) == 1301
  and len({r["anbieter"] for r in V}) == 1301 and all(r["anbieter"] in AI[r["anbieter_id"]]["sw"] for r in M)
  and len(mk["CH"] | mk["AT"] | mk["LI"]) == 169 and len(mk["DE"]) == 35 and len(mk["US"]) == 1092 and len(zus) == 6
  and any("Zürcher Hochschule der Künste ZHdK" in s for _, s in zus) and repro
  and (R / "paket3/out/anbieter_aktuell.csv").read_bytes() == (R / "daten/anbieter.csv").read_bytes()
  and lies(R / "paket3/out/anbieter_protokoll.csv") == [], pr.stdout[-300:] + pr.stderr[-300:])

# ---------- P04 Anbieterland (K15, E218) ----------
abw = [r["id"] for r in M if r["anbieter_land"] != AI[r["anbieter_id"]]["sitzland"]]
t("P04 Anbieterland: anbieter_land = Sitzland der Kennung für alle Zeilen ausser genau 2 «nicht erfasst» (DJA V112-47, V112-48; E218); kein anderes Land",
  sorted(abw) == ["V112-47", "V112-48"] and all(MI[i]["anbieter_land"] == NE for i in abw), str(abw[:5]))

# ---------- Fehl- und Gutfälle ----------
de = next(r for r in M if r["release_markt"] == "DE" and r["dauer"] == NE)
zahl = collections.Counter(r["anbieter_id"] for r in M)
klein = next(z for z in A if zahl[z["anbieter_id"]] == 1 and z["sitzland"] == "CH")      # CH-Anbieter mit genau einem Angebot (B06)
klein_r = next(r for r in M if r["anbieter_id"] == klein["anbieter_id"])
anders = next(z for z in A if z["anbieter_id"] != klein["anbieter_id"])
naechste = f"ANB-{len(A) + 1:04d}"
vorlage = lies(R / "eingang/022_20261119_neue_angebote.csv")[0]
NK = list(vorlage); NK.insert(NK.index("h_url_identitaet") + 1, "lieferform_json"); NK.insert(NK.index("anbieter") + 1, "anbieter_id")
def gut_n(**w):
    z = dict(vorlage); z.update({"id": "TEST-P27-NEU-001", "kohorte": "NEU_028", "titel": "Testkurs Paket 27 (kein echtes Angebot)",
                                 "url": "https://example.org/test-paket-27", "lieferform_json": MI["OFFER-DIGICOMP-075"]["lieferform_json"],
                                 "anbieter_id": MI["OFFER-DIGICOMP-075"]["anbieter_id"], "quelle": Q, "url_geprueft_am": "2026-11-22",
                                 "ursprung": "Testfall"}); z.update(w)
    return [z[c] for c in NK]
NEU_A = [[naechste, "name", "(neu)", "Testanbieter P27", H, REG, Q, "Testfall"], [naechste, "sitzland", "(neu)", "CH", H, REG, Q, "Testfall"],
         [naechste, "sitzland_beleg", "(neu)", "Impressum Testanbieter (Testfall)", H, REG, Q, "Testfall"]]
FA, FK, FN = "eingang/028_20261122_anbieter.csv", "eingang/028_20261122_korrekturen.csv", "eingang/028_20261122_neue_angebote.csv"
def af(*zeilen, kopf=KA): return lambda td: schreibe_csv(td / FA, kopf, [list(z) for z in zeilen])
def kf(*zeilen): return lambda td: schreibe_csv(td / FK, KK, [list(z) for z in zeilen])
def nf(**w): return lambda td: schreibe_csv(td / FN, NK, [gut_n(**w)])
def mit(*fs):
    def f(td):
        for x in fs: x(td)
    return f
def kz(rid, feld, alt, neu_, h=H, reg=REG): return [rid, feld, alt, neu_, "", h, reg, Q, "", "", "Testfall"]
po = json.loads(MI["OFFER-DIGICOMP-075"]["preis_optionen"]); po2 = po + [dict(po[0], currency="EUR")]
FAELLE = [
    ("B01", "Kopf", af(NEU_A[0], kopf=KA[:-1] + ["bemerkung"]), "028_20261122_anbieter.csv:1"),
    ("B01", "Feld unbekannt", af([klein["anbieter_id"], "web", "x", "y", H, REG, Q, ""]), "028_20261122_anbieter.csv:2:feld"),
    ("B01", "Kennung + Feld doppelt", af([klein["anbieter_id"], "sitzland_beleg", klein["sitzland_beleg"], "a", H, REG, Q, ""],
                                          [klein["anbieter_id"], "sitzland_beleg", "a", "b", H, REG, Q, ""]), "028_20261122_anbieter.csv:3:feld"),
    ("K01", "Anbieter-Datei mit Laufnummer 026 (Modellschritt)", lambda td: schreibe_csv(td / "eingang/026_20261122_anbieter.csv", KA, NEU_A), "026_20261122_anbieter.csv"),
    ("B02", "neue Kennung nicht fortlaufend", af(*[[f"ANB-{len(A) + 5:04d}"] + z[1:] for z in NEU_A]), "028_20261122_anbieter.csv:2:anbieter_id"),
    ("B02", "neue Kennung schon vorhanden", af(*[[klein["anbieter_id"]] + z[1:] for z in NEU_A]), "028_20261122_anbieter.csv:2:anbieter_id"),
    ("B02", "Korrektur unbekannte Kennung", af(["ANB-9999", "sitzland", "CH", "AT", H, REG, Q, ""]), "028_20261122_anbieter.csv:2:anbieter_id"),
    ("B02", "alter Wert veraltet", af([klein["anbieter_id"], "sitzland", "DE", "AT", H, REG, Q, ""]), "028_20261122_anbieter.csv:2:alt"),
    ("B03", "Schreibweise eines anderen Anbieters", af([klein["anbieter_id"], "schreibweisen", klein["schreibweisen"],
                                                        json.dumps(klein["sw"] + [anders["sw"][0].upper()], ensure_ascii=False), H, REG, Q, ""]), "028_20261122_anbieter.csv:2:schreibweisen"),
    ("B03", "Schreibweise im selben Anbieter doppelt (Gegenprüfung H1)", af([klein["anbieter_id"], "schreibweisen", klein["schreibweisen"],
                                                        json.dumps(klein["sw"] + klein["sw"][:1], ensure_ascii=False), H, REG, Q, ""]), "028_20261122_anbieter.csv:2:schreibweisen"),
    ("B03", "neuer Anbieter ohne Name", af(NEU_A[1], NEU_A[2]), "028_20261122_anbieter.csv:2:name"),
    ("B03", "Name nicht unter den Schreibweisen", af([klein["anbieter_id"], "name", klein["name"], "Ganz anderer Name", H, REG, Q, ""]), "028_20261122_anbieter.csv:2:name"),
    ("B04", "Sitzland kein ISO-Code", af(NEU_A[0], [naechste, "sitzland", "(neu)", "XX", H, REG, Q, ""], NEU_A[2]), "028_20261122_anbieter.csv:3:neu"),
    ("B04", "Sitzland ohne Beleg", af(NEU_A[0], NEU_A[1]), "028_20261122_anbieter.csv:2:sitzland_beleg"),
    ("B05", "Herkunft unbekannt", af(*[z[:4] + ["ERFUNDEN_E999"] + z[5:] for z in NEU_A]), "028_20261122_anbieter.csv:2:herkunft"),
    ("B05", "Quelle «wie oben»", af(*[z[:6] + ["wie oben"] + z[7:] for z in NEU_A]), "028_20261122_anbieter.csv:2:quelle"),
    ("B06", "Sitzland geändert, Angebote nicht", af([klein["anbieter_id"], "sitzland", "CH", "AT", H, REG, Q, ""]), "028_20261122_anbieter.csv:2:sitzland"),
    ("N03", "neues Angebot ohne Spalte anbieter_id (Pflicht ab Lauf 027)", lambda td: schreibe_csv(td / FN, [c for c in NK if c != "anbieter_id"], [[z for c, z in zip(NK, gut_n()) if c != "anbieter_id"]]), "028_20261122_neue_angebote.csv:2:anbieter_id"),
    ("B07", "neues Angebot mit unbekannter Kennung", nf(anbieter_id="ANB-9999"), "028_20261122_neue_angebote.csv:2:anbieter_id"),
    ("B07", "neues Angebot, Text keine Schreibweise", nf(anbieter="Digicomp (falsch geschrieben)"), "028_20261122_neue_angebote.csv:2:anbieter"),
    ("K15", "Korrektur anbieter_land auf ein anderes Land", kf(kz(klein_r["id"], "anbieter_land", "CH", "DE")), "028_20261122_korrekturen.csv:2:anbieter_land"),
    ("K15", "Korrektur anbieter_id auf fremden Anbieter", kf(kz(klein_r["id"], "anbieter_id", klein["anbieter_id"], anders["anbieter_id"])), "028_20261122_korrekturen.csv:2:anbieter_id"),
    ("K16", "zwei Währungen je Angebot", kf(kz("OFFER-DIGICOMP-075", "preis_optionen", MI["OFFER-DIGICOMP-075"]["preis_optionen"], json.dumps(po2, ensure_ascii=False))), "028_20261122_korrekturen.csv:2:preis_optionen"),
    ("K07", "Trennzeichen « | » (P07)", kf(kz(de["id"], "sprache", de["sprache"], "DE | FR")), "028_20261122_korrekturen.csv:2:neu"),
    ("K07", "Scope-Code ungültig (P06)", kf(kz(de["id"], "scope_code", NE, "KERN")), "028_20261122_korrekturen.csv:2:neu"),
    ("K07", "Grenzfall ohne Begründung per Korrektur (Gegenprüfung B3)", kf(kz(de["id"], "scope_code", NE, "GRENZFALL_E179")), "028_20261122_korrekturen.csv:2:id"),
    ("K01", "Korrekturdatei mit Laufnummer 026 (Gegenprüfung H9)", lambda td: schreibe_csv(td / "eingang/026_20261122_korrekturen.csv", KK, [kz(de["id"], "dauer", NE, "2 Tage")]), "026_20261122_korrekturen.csv"),
    ("K07", "DE → CH ohne Lieferform (P11)", kf(kz(de["id"], "release_markt", "DE", "CH")), "028_20261122_korrekturen.csv:2:id"),
]
erg = {}; regeln = set()
for regel, name, aend, ort in FAELLE:
    with tempfile.TemporaryDirectory() as td:
        td = pathlib.Path(td); kopie(td)
        for f in ("master_3818_aktuell.csv", "master_nachtraege_protokoll.csv", "anbieter_aktuell.csv", "anbieter_protokoll.csv"):
            (td / "paket3/out" / f).write_bytes(b"alt-" + f.encode())
        aend(td); vor = baum(td)
        a = lauf(td, "scripts/eingang_pruefen.py"); b = lauf(td, "scripts/master_nachtraege.py", "--out", "paket3/out")
        meld = a.stdout + a.stderr
        tok = "K15" if regel == "B06" else regel   # B06 greift über K15 am Ende der Laufnummer
        gut = (a.returncode != 0 and b.returncode != 0 and f" {tok} " in meld + " " and ort in meld and "ABBRUCH" in b.stdout + b.stderr and baum(td) == vor)
        erg[f"{regel} {name}"] = gut; regeln.add(regel) if gut else None
        print(f"INFO Fehlfall {regel} {name}: {[z for z in meld.splitlines() if regel in z][:1]}")
alle_r = {f"B0{i}" for i in range(1, 8)} | {"K01", "K07", "K15", "K16", "N03"}
t(f"P05a Regeln B01–B07, K15, K16 (dazu K01 Laufnummer 026, N03 anbieter_id Pflicht, K07 Trennzeichen, Scope, DE → CH): {len(FAELLE)} Fehlfälle abgelehnt (Prüfskript und Master-Fortschreibung Rückgabecode ≠ 0, "
  "Meldung mit Datei, Zeile, Spalte, Regel; Master, Tabelle, Protokolle und Ausgabeordner bytegleich, keine neue Datei)",
  all(erg.values()) and regeln == alle_r, str({k: v for k, v in erg.items() if not v}) + f" fehlt {sorted(alle_r - regeln)}")

# Gutfall: neuer Anbieter (B08 zweiter ohne Angebot), neues Angebot dieses Anbieters, Sitzland-Korrektur mit Angebot (B06), Scope- und Lieferform-Korrektur
NEU_B = [[f"ANB-{len(A) + 2:04d}", "name", "(neu)", "Kernliste-Anbieter ohne Angebot (Test)", H, REG, Q, "Testfall"],
         [f"ANB-{len(A) + 2:04d}", "sitzland", "(neu)", NE, H, REG, Q, "Testfall"]]
ch_r = next(r for r in M if r["release_markt"] == "CH" and r["kohorte"] == "WEBSITE_1352" and r["schutz_307"] != "JA" and r["anbieter_id"] != klein["anbieter_id"]
            and r["durchfuehrungsort_land"] == "CH")
with tempfile.TemporaryDirectory() as td:
    td = pathlib.Path(td); kopie(td, ["scripts/generator_website.py", "scripts/generator_platzhalter.csv"]); repo_ein = baum(R / "eingang")
    schreibe_csv(td / FA, KA, NEU_A + NEU_B + [[klein["anbieter_id"], "sitzland", "CH", "AT", H, REG, Q, "Testfall"]])
    schreibe_csv(td / FK, KK, [kz(klein_r["id"], "anbieter_land", "CH", "AT"), kz(de["id"], "scope_code", NE, "KERN_E005"), kz(de["id"], "scope_begruendung", NE, "Testbegründung", h="ANBIETERSEITE_E136"),
                               kz(ch_r["id"], "release_markt", "CH", "DE")])
    schreibe_csv(td / FN, NK, [gut_n(anbieter="Testanbieter P27", anbieter_id=naechste)])
    pr = lauf(td, "scripts/master_nachtraege.py", "--out", "paket3/out")
    N2 = {r["id"]: r for r in lies_m(td / "paket3/out/master_3818_aktuell.csv")} if pr.returncode == 0 else {}
    A2 = {z["anbieter_id"]: z for z in lies(td / "paket3/out/anbieter_aktuell.csv")} if pr.returncode == 0 else {}
    AP2 = lies(td / "paket3/out/anbieter_protokoll.csv") if pr.returncode == 0 else []
    P2 = lies(td / "paket3/out/master_nachtraege_protokoll.csv") if pr.returncode == 0 else []
    gut = (pr.returncode == 0 and len(A2) == 1297 and A2[naechste]["name"] == "Testanbieter P27" and json.loads(A2[naechste]["schreibweisen"]) == ["Testanbieter P27"]
           and A2[f"ANB-{len(A) + 2:04d}"]["sitzland"] == NE and A2[klein["anbieter_id"]]["sitzland"] == "AT" and len(AP2) == 6
           and N2["TEST-P27-NEU-001"]["anbieter_id"] == naechste and N2["TEST-P27-NEU-001"]["h_anbieter_id"] == H and N2["TEST-P27-NEU-001"]["scope_code"] == "PRAXIS_E005"
           and N2[klein_r["id"]]["anbieter_land"] == "AT" and N2[de["id"]]["scope_code"] == "KERN_E005" and N2[de["id"]]["h_scope_code"] == H and N2[de["id"]]["scope_begruendung"] == "Testbegründung"
           and N2[ch_r["id"]]["release_markt"] == "DE" and N2[ch_r["id"]]["lieferform_json"] == MI[ch_r["id"]]["lieferform_json"] != NE
           and P2[:len(P)] == P and baum(R / "eingang") == repo_ein)
    gen = lauf(td, "scripts/generator_website.py", "--daten", str(td / "d.js"), "--smart", str(td / "s.json")) if gut else None
    gut_g = bool(gen) and gen.returncode == 0 and '"TEST-P27-NEU-001"' in (td / "d.js").read_text(encoding="utf-8") and f'"{ch_r["id"]}"' not in (td / "d.js").read_text(encoding="utf-8")
t("P05b/P06/P11 Gutfall (Testkopie, Lauf 028): neuer Anbieter und Kernliste-Anbieter ohne Angebot (B08) in der Tabelle; neues Angebot dieses Anbieters mit Kennung, Herkunft und Scope-Spalte; "
  "Sitzland-Korrektur mit Korrektur des Angebots in derselben Laufnummer (B06); scope_code korrigierbar (P06), Korrektur der Begründung lässt h_scope_code beim Code (Gegenprüfung B3); CH → DE angenommen, lieferform_json bleibt (P11, E216); "
  "Anbieter-Protokoll 6 Zeilen; Protokoll vorne unverändert; Generator baut (neues Angebot drin, nach DE gewechseltes draussen); Repo-Eingang unverändert",
  gut and gut_g, f"{pr.stdout[-300:]}{pr.stderr[-500:]}")

# ---------- P06 Scope, P07 Trennzeichen (Schema-Bericht) ----------
sc_ok = (MI["OFFER-DIGICOMP-075"]["scope_code"] == "PRAXIS_E005" and MI["OFFER-DIGICOMP-075"]["h_scope_code"] == vorlage["herkunft"]
         and MI["OFFER-DIGICOMP-075"]["scope_begruendung"] == NE and all(r["scope_code"] == NE and r["h_scope_code"] == "LEER" for r in M if r["id"] != "OFFER-DIGICOMP-075"))
t("P06 Scope: OFFER-DIGICOMP-075 PRAXIS_E005 (Herkunft aus Lauf 022), alle übrigen 3'818 Zeilen «nicht erfasst», Herkunft LEER (E216)", sc_ok)
with tempfile.TemporaryDirectory() as td:
    td = pathlib.Path(td); kopie(td)
    pr = lauf(td, "scripts/eingang_pruefen.py", "--schema-bericht", "schema.csv")
    sb = {z["spalte"]: z for z in lies(td / "schema.csv")} if (td / "schema.csv").exists() else {}
    ab = {c: int(z["abweichungen"]) for c, z in sb.items() if z["abweichungen"] != "0"}
    sb_gleich = sb and (td / "schema.csv").read_bytes() == (R / "paket27/out/schema_bericht.csv").read_bytes()
t("P07 Trennzeichen: Schema-Bericht am ganzen Master (130 Spalten): sprache 0, format 0, nur url 30 (mehrere Adressen USA, E068, bleibt); Lauf 027 = 22 Zeilen (sprache 5, format 17), "
  "nur das Trennzeichen geändert (Werte und Reihenfolge gleich); = paket27/out/schema_bericht.csv",
  pr.returncode == 0 and len(sb) == 130 and ab == {"url": 30} and sb_gleich and len(L027) == 22 and collections.Counter(z["feld"] for z in L027) == {"format": 17, "sprache": 5}
  and all(re.split(r"\s*[|/]\s*", z["alt"]) == z["neu"].split("|") and z["alt"] != z["neu"] for z in L027), str(ab) + pr.stderr[-200:])

# ---------- P08 Durchführungen ----------
with tempfile.TemporaryDirectory() as td:
    pr = subprocess.run([sys.executable, "-I", str(R / "scripts/durchfuehrungen.py"), "--out", td], cwd=R, capture_output=True, text=True)
    DF = lies(pathlib.Path(td) / "durchfuehrungen.csv"); same = (pathlib.Path(td) / "durchfuehrungen.csv").read_bytes() == (R / "paket27/out/durchfuehrungen.csv").read_bytes()
liste = [r for r in M if (r["durchfuehrungen_anzeige"] or r["durchfuehrungen"]) not in ("", NE)]
nur_d = [r for r in M if r not in liste and (r["start_datum"] != NE or r["end_datum"] != NE)]
herk = True
for z in DF:
    r = MI[z["angebot_id"]]
    if z["quellfeld"] == "start_datum/end_datum":
        herk &= (z["start"], z["ende"], z["label"], z["region"]) == (r["start_datum"], r["end_datum"], r["termin_anzeige"] or r["termin_text"], NE)
    else:
        e = json.loads(r[z["quellfeld"]])[int(z["nr"]) - 1]
        herk &= [z[k] for k in ("start", "ende", "label", "region")] == [e.get(c) if e.get(c) not in (None, "") else NE for c in ("startDate", "endDate", "label", "region")]
t("P08 Durchführungen (abgeleitet, E215): Zeilen = 118 Einträge aus den Listen + 1 je Angebot mit Datum ohne Liste (613) = 731; jede Zeile mit quellfeld, jeder Wert steht so im Master; "
  "Neubau bytegleich mit paket27/out/durchfuehrungen.csv",
  pr.returncode == 0 and len(DF) == sum(len(json.loads(r["durchfuehrungen_anzeige"] or r["durchfuehrungen"])) for r in liste) + len(nur_d) == 731
  and sum(z["quellfeld"] != "start_datum/end_datum" for z in DF) == 118 and herk and same, f"{len(DF)} {len(nur_d)}")

# ---------- P09 Sichtbarkeit Python = App ----------
TAGE = ["2026-11-20", "2026-11-22", "2026-12-01", "2026-12-20", "2027-03-01"]
p09 = None
if NODE_PATH:
    js = subprocess.run(["node", str(R / "paket27/tests/sichtbar_app.js"), *TAGE], cwd=R, capture_output=True, text=True,
                        env={"PATH": os.environ["PATH"], "NODE_PATH": NODE_PATH, "TZ": "Europe/Zurich", "HOME": os.environ.get("HOME", "/tmp")})
    app = json.loads(js.stdout) if js.returncode == 0 else {}
    import datetime
    py = {d: sorted(r["id"] for r in M if SB.sichtbar(r, datetime.date.fromisoformat(d))) for d in TAGE}
    p09 = app == py and [len(py[d]) for d in TAGE] == [1006, 998, 945, 860, 795]
    print("INFO P09 sichtbar: " + ", ".join(f"{d} {len(py[d])}" for d in TAGE))
t("P09 Sichtbarkeit: scripts/sichtbarkeit.py = app-v43.js in jsdom mit data-p27.js an 20.11., 22.11., 01.12., 20.12.2026, 01.03.2027 (gleiche ID-Mengen; 1'006 / 998 / 945 / 860 / 795)",
  bool(p09), "NODE_PATH fehlt" if not NODE_PATH else "")

# ---------- P10 Währung ----------
mehr = [r["id"] for r in M if r["preis_optionen"] != NE and len({o.get("currency") for o in json.loads(r["preis_optionen"]) if isinstance(o, dict)} - {None, ""}) > 1]
t("P10 Währung (K16): am Bestand 0 Angebote mit mehr als einer Währung; Fehlfall abgelehnt (P05a K16)", not mehr and erg.get("K16 zwei Währungen je Angebot"), str(mehr[:3]))

# ---------- P12 Generator ----------
def daten(p):
    s = pathlib.Path(p).read_text(encoding="utf-8"); return json.loads(s[s.index("["):s.rindex("]") + 1])
D25, D27 = daten(R / "paket25/website/data-p25.js"), daten(R / "paket27/website/data-p27.js")
d12 = sorted((a["id"], k) for a, b in zip(D25, D27) for k in set(a) | set(b) if a.get(k) != b.get(k))
soll12 = sorted((z["id"], {"sprache": "language", "format": "format"}[z["feld"]]) for z in L027)
jsr = json.loads((R / "paket27/out/test_paket27_js.json").read_text(encoding="utf-8")) if (R / "paket27/out/test_paket27_js.json").exists() else {"results": []}
fails = [x["id"] for x in jsr["results"] if x["status"] != "PASS"]
t("P12 Generator: data-p27.js = data-p25.js bis auf genau die 22 Rohwerte aus Lauf 027 (language 5, format 17); Smart-Datei, index.html und sitemap.xml (Stichtag 20.11.) bytegleich mit P25; "
  f"Anzeige-Vergleich test_paket27_anzeige.js ohne FAIL ({len(jsr['results'])} Prüfungen: Karten, Filter, Smart-Suche 60 Anfragen an 20.11., 22.11., 01.12.)",
  [a["id"] for a in D25] == [b["id"] for b in D27] and d12 == soll12
  and (R / "paket27/out/smart-search-data-p27.json").read_bytes() == (R / "paket25/out/smart-search-data-p25.json").read_bytes()
  and (R / "paket27/website/index.html").read_bytes() == (R / "paket25/website/index.html").read_bytes()
  and (R / "paket27/website/sitemap.xml").read_bytes() == (R / "paket25/website/sitemap.xml").read_bytes()
  and len(jsr["results"]) == 12 and not fails, f"{d12[:3]} js {fails} {len(jsr['results'])}")

# ---------- P13 Reproduzierbarkeit ----------
AUS = ["master_3818_aktuell.csv", "master_nachtraege_protokoll.csv", "anbieter_aktuell.csv", "anbieter_protokoll.csv"]
h = []
for _ in range(2):
    with tempfile.TemporaryDirectory() as td:
        td = pathlib.Path(td); kopie(td); pr = lauf(td, "scripts/master_nachtraege.py", "--out", "paket3/out")
        h.append(tuple(sha((td / "paket3/out" / f).read_bytes()) for f in AUS))
with tempfile.TemporaryDirectory() as td:
    s1 = subprocess.run([sys.executable, "-I", str(R / "scripts/sichtbarkeit.py"), "2026-11-20", "--out", td], cwd=R, capture_output=True, text=True)
    sb_same = (pathlib.Path(td) / "sichtbarkeit_2026-11-20.csv").read_bytes() == (R / "paket27/out/sichtbarkeit_2026-11-20.csv").read_bytes()
t("P13 Reproduzierbarkeit: zwei Läufe aus frischen Ordnern bytegleich (Master, Protokoll, Anbieter-Tabelle, Anbieter-Protokoll) und gleich der Repo-Ausgabe; Sichtbarkeit 20.11. bytegleich",
  h[0] == h[1] == tuple(sha((R / "paket3/out" / f).read_bytes()) for f in AUS) and sb_same, str(h))

# ---------- P14 bestehende Tests, Testanpassung A11 ----------
def test(cmd, soll, env=None):
    pr = subprocess.run([sys.executable, "-I", *cmd], cwd=R, capture_output=True, text=True, env=env)
    return pr.returncode == 0 and f"{soll} PASS" in pr.stdout, pr.stdout[-150:] + pr.stderr[-150:]
envn = {"PATH": os.environ["PATH"], "NODE_PATH": NODE_PATH, "HOME": os.environ.get("HOME", "/tmp")}
r14 = [test(["scripts/test_paket24.py", "--out", "paket3/out"], "14/14"), test(["scripts/test_nachtraege.py", "--out", "paket3/out"], "14/14"),
       test(["paket25/tests/test_paket25_master.py"], "8/8")]
if NODE_PATH: r14 += [test(["paket25/tests/test_paket25_generator.py"], "13/13", envn), test(["paket26/tests/test_paket26.py"], "14/14", envn)]
TESTS = ["scripts/test_paket24.py", "scripts/test_nachtraege.py", "paket25/tests/test_paket25_master.py", "paket25/tests/test_paket25_generator.py", "paket26/tests/test_paket26.py"]
f14 = []
for p in TESTS:
    a_, b_ = git("show", f"{VOR}:claude-work/{p}").decode("utf-8"), (R / p).read_text(encoding="utf-8")
    hx = lambda s: set(re.findall(r"\b[0-9a-f]{64}\b", s))
    if not hx(a_) <= hx(b_): f14.append((p, "Hash fehlt"))
    if len(re.findall(r'^t\(', a_, re.M)) != len(re.findall(r'^t\(', b_, re.M)): f14.append((p, "Zahl der Prüfungen"))
d14 = git("diff", VOR, "--", *[f"claude-work/{p}" for p in TESTS])
abgelegt = (R / "paket27/out/testanpassung_a11.diff").read_bytes() if (R / "paket27/out/testanpassung_a11.diff").exists() else b""
t("P14 bestehende Tests nach A11 (Stand Paket 26 über scripts/stand_p26.py bzw. --bis 25; P26 mit Laufnummer 027): test_paket24.py 14/14, test_nachtraege.py 14/14, "
  "P25 Master 8/8, Generator 13/13, P26 14/14; historische Hashes und Zahl der Prüfungen unverändert; Diff = paket27/out/testanpassung_a11.diff",
  all(x[0] for x in r14) and len(r14) == 5 and not f14 and d14 and d14 == abgelegt, f"{[x[1] for x in r14 if not x[0]]} {f14} diff {'gleich' if d14 == abgelegt else 'abweichend'}")

# ---------- P15 Unverändert ----------
def blobs(*pfade):
    out = {}
    for z in git("ls-tree", "-r", VOR, "--", *[f"claude-work/{p}" for p in pfade]).decode().splitlines():
        meta, pfad = z.split("\t", 1); out[pfad] = meta.split()[2]
    return out
ALT = ["paket13/config", "paket14/config", "paket16/config", "paket17/config", "paket18/config", "paket21/config", "paket22/config"]
b15 = blobs(*ALT, "paket19", "paket22", "paket25/website", "paket25/out/smart-search-data-p25.json", "paket3/out/master_3818.csv",
            "scripts/generator_website.py", "scripts/generator_platzhalter.csv", *[p for p in EINGANG if re.match(r"eingang/0(1\d|2[0-2])_", p)])
jetzt = {p: git("hash-object", p).decode().strip() for p in b15}
t("P15 unverändert gegenüber c8d390e: Basis master_3818.csv, Altdateien, paket19/, paket22/, paket25/website/ (inkl. app-v43.js), Smart-Datei P25, Generator, "
  "Platzhaltertabelle, Eingang 013–022 (Git-Blob vorher = nachher)",
  b15 == jetzt and len(b15) > 60, str([p for p in b15 if b15[p] != jetzt[p]][:5]))
print(f"{ok}/{n} PASS")
sys.exit(0 if ok == n else 1)
