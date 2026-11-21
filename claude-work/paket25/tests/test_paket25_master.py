"""Paket 25 – Master-Nachtrag Lieferform (SPEZIFIKATION_PAKET25_20261120.md A1, §5 M01–M08).
Aufruf (aus claude-work/): python3 -I paket25/tests/test_paket25_master.py
Referenzwerte: Master und Protokoll auf 111b0fd (vor Paket 25), Smart-Quelle p19 und Auszug als SHA-256 festgehalten."""
import collections, csv, hashlib, io, json, pathlib, re, shutil, subprocess, sys, tempfile

R = pathlib.Path(__file__).resolve().parents[2]
OUT = R / "paket3/out"; MP = OUT / "master_3818_aktuell.csv"; PP = OUT / "master_nachtraege_protokoll.csv"
sha = lambda b: hashlib.sha256(b).hexdigest()
ok = n = 0


def t(name, cond, info=""):
    global ok, n
    n += 1; ok += bool(cond); print(("PASS " if cond else "FAIL ") + name + (f" – {info}" if info and not cond else ""))


VORHER_MASTER = "e5afa29cde40b7129ca3797a537fcc61adb40610f1b03ceecff205e770d78b58"  # master_3818_aktuell.csv auf 111b0fd (123 Spalten)
VORHER_PROTO = "15a7520c02b8b4fa0019e1c29dabcf2b5fc3a036b810e1987962ee630a4d1b78"   # Protokoll auf 111b0fd, 5'423 Zeilen + Kopf
SMART_P19 = "7ddd326a26cbaaebcf4a9382c3e97d0f6399e6022d9d93f7ef2c21b377b2a35c"
AUSZUG = "d1bd2836e0d323728fac094906e01ee6fb40fcbe5cd404ca64efe11de82fc0e8"      # paket25/eingang/lieferform_p19.json
LF = R / "paket25/eingang/lieferform_p19.json"
TF = ["channels", "evidenceTier", "materialisationStatus", "scheduleSummary", "sourceText", "structure", "temporalSummary", "variants"]
NE = "nicht erfasst"

braw = MP.read_bytes()
recs = list(csv.reader(io.StringIO(braw.decode("utf-8-sig"))))
head, rows = recs[0], recs[1:]
N = [dict(zip(head, r)) for r in rows]
P = list(csv.DictReader(open(PP, encoding="utf-8")))

# M01 CSV-Form
t("M01 CSV-Form: 3'820 Zeilen inkl. Kopf, je 125 Spalten, UTF-8 mit BOM, LF; lieferform_json, h_lieferform_json am Ende",
  len(recs) == 3820 and all(len(z) == 125 for z in recs) and braw.startswith(b"\xef\xbb\xbf") and b"\r\n" not in braw
  and braw.endswith(b"\n") and head[-2:] == ["lieferform_json", "h_lieferform_json"])

# M02 unabhängig aus der Smart-Quelle p19 (nicht aus dem Auszug) abgeleitet
sb = (R / "paket19/out/smart-search-data-p19.json").read_bytes()
S = json.loads(sb.decode("utf-8"))["byId"]
f02 = []
for r in N:
    if r["release_markt"] in ("CH", "AT", "LI"):
        try: d = json.loads(r["lieferform_json"])
        except ValueError: f02.append((r["id"], "JSON")); continue
        q = S.get(r["id"], {}).get("delivery")
        if q is None or sorted(d) != TF or json.dumps(d, sort_keys=True) != json.dumps(q, sort_keys=True) or r["h_lieferform_json"] != "SMART_P19":
            f02.append((r["id"], "Wert/Herkunft"))
    elif (r["lieferform_json"], r["h_lieferform_json"]) != (NE, "LEER"): f02.append((r["id"], "DE/USA"))
cnt = collections.Counter(r["h_lieferform_json"] for r in N)
ids = {r["id"] for r in N if r["release_markt"] in ("CH", "AT", "LI")}
t("M02 lieferform_json: Smart-Quelle p19 (SHA-256 festgehalten) und Auszug (SHA-256 festgehalten); ID-Menge = Smart-p19; 1'353 CH/AT/LI mit allen 8 Teilfeldern gleich (Struktur, typgenau), Herkunft SMART_P19; 2'466 DE/USA «nicht erfasst», Herkunft LEER",
  sha(sb) == SMART_P19 and sha(LF.read_bytes()) == AUSZUG and ids == set(S) and not f02 and cnt == {"SMART_P19": 1353, "LEER": 2466},
  f"{f02[:5]} {dict(cnt)}")

# M03 Widerspruchsfreiheit zu lieferform, lieferform_struktur
SENT = re.compile(r'^(NOT_PUBLISHED|NICHT_PUBLIZIERT|NICHT_VERIFIZIERT\w*|PREIS_NICHT_PUBLIZIERT|NOT_IN_R4_SCHEMA|UNKNOWN|n/?a|-)$', re.I)
nrm = lambda v: NE if v is None or not str(v).strip() or SENT.match(str(v).strip()) else str(v)
f03 = [r["id"] for r in N if r["release_markt"] in ("CH", "AT", "LI")
       for d in [json.loads(r["lieferform_json"])] if nrm(d["evidenceTier"]) != r["lieferform"] or nrm(d["structure"]) != r["lieferform_struktur"]]
t("M03 Widerspruchsfreiheit: evidenceTier = lieferform, structure = lieferform_struktur (Platzhalter und leer = «nicht erfasst»), 1'353 von 1'353",
  not f03 and len(ids) == 1353, str(f03[:5]))

# M04 Rückprojektion auf die 123 bisherigen Spalten
b = io.StringIO(); csv.writer(b, lineterminator="\n").writerows([z[:-2] for z in recs])
t("M04 Rückprojektion auf die 123 bisherigen Spalten = Master 111b0fd (SHA-256 e5afa29c…)", sha(("﻿" + b.getvalue()).encode("utf-8")) == VORHER_MASTER)

# M05 Protokoll
pb = PP.read_bytes().decode("utf-8").split("\n")
alt = "\n".join(pb[:5424]) + "\n"
neu = P[5423:]
quell = json.loads(LF.read_text(encoding="utf-8"))["byId"]
M = {r["id"]: r for r in N}
f05 = [p["id"] for p in neu if not (p["feld"] == "lieferform_json" and p["neu"] == M[p["id"]]["lieferform_json"]
       and json.loads(p["neu"]) == quell[p["id"]] and json.dumps(json.loads(p["neu"]), sort_keys=True) == json.dumps(S[p["id"]]["delivery"], sort_keys=True)
       and (p["alt"], p["h_feld"], p["h_alt"], p["herkunft"], p["register_id"]) == (NE, "h_lieferform_json", "LEER", "SMART_P19", "E193")
       and p["quelle"].startswith("paket25/eingang/lieferform_p19.json") and SMART_P19 in p["quelle"])]
t("M05 Protokoll: 5'423 bisherige Zeilen identisch (SHA-256 15a7520c…); 1'353 neue Zeilen, jede einzeln gegen Master-Wert, Herkunft, Register E193 und Quelldatensatz (Auszug und Smart-p19)",
  sha(alt.encode("utf-8")) == VORHER_PROTO and len(P) == 6776 and len(neu) == 1353 and len({p["id"] for p in neu}) == 1353 and not f05, f"{len(P)} {f05[:5]}")

# M06 bestehende Tests (A10)
r1 = subprocess.run([sys.executable, "-I", str(R / "scripts/test_paket24.py"), "--out", "paket3/out"], cwd=R, capture_output=True, text=True)
r2 = subprocess.run([sys.executable, "-I", str(R / "scripts/test_nachtraege.py"), "--out", "paket3/out"], cwd=R, capture_output=True, text=True)
t("M06 bestehende Tests: test_paket24.py 14/14, test_nachtraege.py 14/14",
  r1.returncode == 0 and "14/14 PASS" in r1.stdout and r2.returncode == 0 and "14/14 PASS" in r2.stdout, r1.stdout[-200:] + r2.stdout[-200:])

# M07 Reproduzierbarkeit, M08 Abbruch Auszug (in Kopien der Eingaben)
EIN = ["scripts/master_nachtraege.py", "scripts/build_master_p3.py", "paket3/out/master_3818.csv", "paket13/config/owner_korrekturen.csv",
       "paket14/config/korrekturen.csv", "paket16/config/korrekturen.csv", "paket17/config/korrekturen.csv",
       "paket17/config/korrekturen_preis.csv", "paket18/config/korrekturen.csv", "paket21/config/korrekturen.csv",
       "paket22/config/korrekturen.csv", "paket22/config/neue_angebote.json", "paket25/eingang/lieferform_p19.json"]
def kopie(td):
    for p in EIN:
        (td / p).parent.mkdir(parents=True, exist_ok=True); shutil.copy(R / p, td / p)
def lauf(td):
    return subprocess.run([sys.executable, "-I", str(td / "scripts/master_nachtraege.py"), "--out", "paket3/out"], cwd=td, capture_output=True, text=True)
h = []
for _ in range(2):
    with tempfile.TemporaryDirectory() as td:
        td = pathlib.Path(td); kopie(td); lauf(td)
        h.append((sha((td / "paket3/out/master_3818_aktuell.csv").read_bytes()), sha((td / "paket3/out/master_nachtraege_protokoll.csv").read_bytes())))
t("M07 zwei Läufe aus frischen Ordnern bytegleich und gleich der Repo-Ausgabe", h[0] == h[1] == (sha(braw), sha(PP.read_bytes())), str(h))

A = json.loads(LF.read_text(encoding="utf-8"))
erste = next(iter(A["byId"]))
def ohne(a): a = json.loads(json.dumps(a)); del a["byId"][erste]; return json.dumps(a, ensure_ascii=False)
def fremd(a): a = json.loads(json.dumps(a)); a["byId"]["USR-001-FREMD"] = a["byId"][erste]; return json.dumps(a, ensure_ascii=False)
def doppelt(a):  # doppelter Schlüssel im JSON-Text (json.dumps kann ihn nicht erzeugen)
    teile = [json.dumps(k, ensure_ascii=False) + ": " + json.dumps(v, ensure_ascii=False) for k, v in a["byId"].items()]
    teile.insert(1, teile[0])
    rest = dict(a); rest["byId"] = "__BYID__"
    return json.dumps(rest, ensure_ascii=False).replace('"__BYID__"', "{" + ", ".join(teile) + "}")
def teil(a): a = json.loads(json.dumps(a)); del a["byId"][erste]["sourceText"]; return json.dumps(a, ensure_ascii=False)
def mehr(a): a = json.loads(json.dumps(a)); a["byId"][erste]["extra"] = 1; return json.dumps(a, ensure_ascii=False)
def null(a): a = json.loads(json.dumps(a)); a["byId"][erste] = None; return json.dumps(a, ensure_ascii=False)
unveraendert = lambda a: json.dumps(a, ensure_ascii=False) + " "  # gleicher Inhalt, anderer SHA-256
erg = {}
MELD = {"fehlende ID": "Lieferform fehlt", "fremde ID": "fremde ID", "doppelte ID": "doppelt", "Eintrag ohne Teilfeld": "8 Teilfelder",
        "Eintrag mit 9 Teilfeldern": "8 Teilfelder", "Eintrag null": "8 Teilfelder", "Auszug verändert (SHA-256)": "SHA-256"}
for name, f in (("fehlende ID", ohne), ("fremde ID", fremd), ("doppelte ID", doppelt), ("Eintrag ohne Teilfeld", teil),
                ("Eintrag mit 9 Teilfeldern", mehr), ("Eintrag null", null), ("Auszug verändert (SHA-256)", unveraendert)):
    with tempfile.TemporaryDirectory() as td:
        td = pathlib.Path(td); kopie(td)
        (td / "paket3/out/master_3818_aktuell.csv").write_bytes(b"alt-master"); (td / "paket3/out/master_nachtraege_protokoll.csv").write_bytes(b"alt-protokoll")
        vorher = {p.name: p.read_bytes() for p in (td / "paket3/out").iterdir()}
        (td / "paket25/eingang/lieferform_p19.json").write_text(f(A) + "\n", encoding="utf-8")
        if not name.startswith("Auszug verändert"):  # Einzelprüfung hinter der SHA-Sperre: Testkopie mit dem SHA-256 des veränderten Auszugs (H4)
            sk = td / "scripts/master_nachtraege.py"
            sk.write_text(sk.read_text(encoding="utf-8").replace(AUSZUG, sha((td / "paket25/eingang/lieferform_p19.json").read_bytes())), encoding="utf-8")
        pr = lauf(td)
        erg[name] = (pr.returncode != 0 and "ABBRUCH" in pr.stdout + pr.stderr and "lieferform" in (pr.stdout + pr.stderr) and MELD[name] in (pr.stdout + pr.stderr)
                     and {p.name: p.read_bytes() for p in (td / "paket3/out").iterdir()} == vorher)
        print(f"INFO M08 {name}: {(pr.stdout + pr.stderr).strip()[:140]}")
t("M08 Abbruch Auszug (B05, H4): fehlende, fremde, doppelte ID; Eintrag ohne bzw. mit mehr als 8 Teilfeldern, null; veränderter Auszug (SHA-256) → Abbruch mit passender Meldung, Ausgabeordner bytegleich, keine neuen Dateien",
  all(erg.values()) and len(erg) == 7, str(erg))
print(f"{ok}/{n} PASS")
sys.exit(0 if ok == n else 1)
