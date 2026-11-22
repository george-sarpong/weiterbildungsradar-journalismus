"""Paket 26 «Eingangsformat» – Abnahme E01–E12 (SPEZIFIKATION_PAKET26_20261121.md §5; E203–E210).
Aufruf (aus claude-work/): NODE_PATH=<tools>/node_modules python3 -I paket26/tests/test_paket26.py
Alle Fehl- und Gutfälle laufen in Kopien der Eingaben in einem Temp-Ordner; das Repo bleibt unverändert.
Referenz «vorher» = Commit 8e1c715 (über git gelesen).
Paket 27 (SPEZIFIKATION_PAKET27 A11, E217): geprüft wird der Eingang von Paket 26 (Läufe bis 022, ohne 027); Neubauten ohne
Testdatei mit master_nachtraege.py bzw. eingang_pruefen.py --bis 25 (Stand Paket 26, historische Hashes); Testläufe heissen
027 statt 026 (026 = Modellschritt P27), neue Angebote tragen anbieter_id (B07); E06/E06b überspringen die 3'820 Zeilen des
Modellschritts im Protokoll und vergleichen die 125 Spalten von Paket 26; E11 vergleicht die Testanpassung von Paket 26
(8e1c715 → 5c2b761) mit der abgelegten Fassung, die von Paket 27 prüft paket27/tests/test_paket27.py."""
import collections, csv, hashlib, io, json, os, pathlib, re, shutil, subprocess, sys, tempfile

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
GIT = R.parent
sha = lambda b: hashlib.sha256(b).hexdigest()
ok = n = 0
VOR = "8e1c715"
MASTER = "cf9fdb2d69d6e2a908c08889655b7cf923cdcb8a618c2341b84f5c98b8adad92"
PROTO_VOR = "44a874753197e96982c687da0a699c762f5793655b25331742aef8a9fcadf683"
PROTO_NEU = "c82cef3df6c81045006bc1911973e01cfb88805a592d65098150a4ec3dd274b8"   # nach Entscheid 2 B (136 Quellen)
DATEN_P25, SMART_P25 = "ae30bf390833bb6548a5bdd8bf508f74257bc51dd25c3f3ee31e55113da8374f", "6e7ec9cd3128c5f9a7fd7d96341304428d36d2ef5b11dac45e1a1cdfa61eb2a1"
ALT = ["paket13/config/owner_korrekturen.csv", "paket14/config/korrekturen.csv", "paket16/config/korrekturen.csv",
       "paket17/config/korrekturen.csv", "paket17/config/korrekturen_preis.csv", "paket18/config/korrekturen.csv",
       "paket21/config/korrekturen.csv", "paket22/config/korrekturen.csv", "paket22/config/neue_angebote.json"]
TAB = ["scripts/eingang_felder.csv", "scripts/eingang_codelisten.csv", "scripts/eingang_herkunft.csv", "scripts/iso3166_alpha2.csv"]
CODE = ["scripts/master_nachtraege.py", "scripts/eingang.py", "scripts/eingang_pruefen.py", "scripts/build_master_p3.py"]
EIN = CODE + TAB + ["paket3/out/master_3818.csv", "wissensbasis/ENTSCHEIDUNGSREGISTER.csv", "paket25/eingang/lieferform_p19.json", "daten/anbieter.csv"]
EINGANG = sorted(str(p.relative_to(R)) for p in (R / "eingang").iterdir() if p.is_file() and not re.match(r"0(2[6-9]|[3-9]\d)_", p.name))  # P27: Eingang Paket 26
P26_CODE = "5c2b761"   # Code-Commit Paket 26 (für E11)
sys.path.insert(0, str(R / "scripts")); import stand_p26  # noqa: E402  Paket 27 A11 (E217)
P26 = stand_p26.ordner()
ANB = {json.loads(z["schreibweisen"])[0]: z["anbieter_id"] for z in csv.DictReader(open(R / "daten/anbieter.csv", encoding="utf-8"))}
GEN = ["scripts/generator_website.py", "scripts/generator_platzhalter.csv"]


def t(name, cond, info=""):
    global ok, n
    n += 1; ok += bool(cond); print(("PASS " if cond else "FAIL ") + name + (f" – {info}" if info and not cond else ""))


def git(*a): return subprocess.run(["git", *a], cwd=GIT, capture_output=True, check=True).stdout
def vorher(pfad): return git("show", f"{VOR}:claude-work/{pfad}")
def lies(p): return list(csv.DictReader(open(p, encoding="utf-8", newline="")))
def baum(d): return {str(p.relative_to(d)): sha(p.read_bytes()) for p in sorted(pathlib.Path(d).rglob("*")) if p.is_file()}


def kopie(td, extra=()):
    for p in EIN + EINGANG + list(extra):
        (td / p).parent.mkdir(parents=True, exist_ok=True); shutil.copy(R / p, td / p)


def lauf(td, skript, *args):
    return subprocess.run([sys.executable, "-I", str(td / skript), *args], cwd=td, capture_output=True, text=True)


def schreibe_csv(p, kopf, zeilen, bom=False, crlf=False):
    b = io.StringIO(); csv.writer(b, lineterminator="\r\n" if crlf else "\n").writerows([kopf] + zeilen)
    p.write_bytes((b"\xef\xbb\xbf" if bom else b"") + b.getvalue().encode("utf-8"))


M = list(csv.DictReader(io.StringIO((P26 / "master_3818_aktuell.csv").read_text(encoding="utf-8-sig"))))
MI = {r["id"]: r for r in M}
P = lies(P26 / "master_nachtraege_protokoll.csv")
SCHRITT = 3820   # P27: Protokollzeilen des Modellschritts 026 (3'819 anbieter_id + 1 scope_code OFFER-DIGICOMP-075)
ERS = lies(R / "paket26/out/ersetzungsliste_wie_oben.csv")

# ---------- E01 Überführung ----------
korr = {p: lies(R / p) for p in EINGANG if p.endswith("_korrekturen.csv")}
neu = {p: lies(R / p) for p in EINGANG if p.endswith("_neue_angebote.csv")}
laeufe = sorted(re.match(r"eingang/(\d{3})_", p).group(1) for p in korr)
alle = [z for zs in korr.values() for z in zs]
basis = collections.Counter(z["ursprung"].replace(" Folgezeile", "") for z in alle)
direkt = collections.Counter(z["ursprung"] for z in alle if not z["ursprung"].endswith(" Folgezeile"))
altzeilen = [f"{p}:{ln}" for p in ALT[:-1] for ln in range(2, len(lies(R / p)) + 2)]
f01 = [u for u in altzeilen if direkt[u] != 1] + [u for u in basis if u not in set(altzeilen)]
with tempfile.TemporaryDirectory() as td:  # Überführung reproduzierbar: frischer Ordner, Skript neu ausgeführt
    td = pathlib.Path(td); kopie(td, ALT + ["paket26/scripts/ueberfuehren.py"]); (td / "paket26/out").mkdir(parents=True)
    pr = lauf(td, "paket26/scripts/ueberfuehren.py")
    repro = pr.returncode == 0 and all((td / p).read_bytes() == (R / p).read_bytes() for p in EINGANG if p.endswith(".csv")) \
        and (td / "paket26/out/ersetzungsliste_wie_oben.csv").read_bytes() == (R / "paket26/out/ersetzungsliste_wie_oben.csv").read_bytes()
t("E01 Überführung: 5'253 Korrekturzeilen in 7 Dateien (Läufe 013, 014, 016, 017, 018, 021, 022) und 1 Angebot in 022_…_neue_angebote.csv; jede der 3'663 Altzeilen genau eine direkte Zeile (ursprung), jede überführte Zeile genau einer Altzeile; Überführung aus frischem Ordner bytegleich",
  len(alle) == 5253 and laeufe == ["013", "014", "016", "017", "018", "021", "022"] and list(neu) == ["eingang/022_20261119_neue_angebote.csv"]
  and len(neu["eingang/022_20261119_neue_angebote.csv"]) == 1 and neu["eingang/022_20261119_neue_angebote.csv"][0]["ursprung"] == "paket22/config/neue_angebote.json:angebote[0]"
  and len(altzeilen) == 3663 and not f01 and repro, f"{len(alle)} {laeufe} {f01[:3]} repro {repro} {pr.stderr[-300:]}")

k017 = korr["eingang/017_20261110_korrekturen.csv"]
kette = collections.defaultdict(list)
for i, z in enumerate(k017):
    if z["feld"] == "durchfuehrungen_anzeige": kette[z["id"]].append((i, z))
mehr = {k: v for k, v in kette.items() if len(v) > 1}
k_ok = (len(mehr) == 18 and sum(len(v) for v in mehr.values()) == 58
        and all(v[j][1]["alt"] == v[j - 1][1]["neu"] for v in mehr.values() for j in range(1, len(v)))
        and all(not z["ursprung"].endswith("Folgezeile") for v in mehr.values() for _, z in v))
t("E01b Kette Lauf 017 (E208, ChatGPT B02): genau 18 Angebote mit 58 Zeilen in durchfuehrungen_anzeige; jede Wiederholung hat als alt die Liste nach der vorigen Zeile (lückenlos); je Zeile eine Altzeile (sessions[i])",
  k_ok, f"{len(mehr)} / {sum(len(v) for v in mehr.values())}")

# ---------- E02 Master und Protokoll; Ersetzungsliste unabhängig gegen die Altdatei ----------
p14 = lies(R / "paket14/config/korrekturen.csv"); soll_ers = []; letzte = {}
for ln, k in enumerate(p14, 2):
    if k["quelle"].strip() == "wie oben": soll_ers.append((f"paket14/config/korrekturen.csv:{ln}", k["id"], k["quelle"], letzte[k["id"]]))
    else: letzte[k["id"]] = k["quelle"]
ers_ok = [(e["ursprung"], e["id"], e["quelle_alt"], e["quelle_neu"]) for e in ERS] == soll_ers and len(soll_ers) == 136 \
    and all(q.startswith("https://www.mediencampus.ch/") for *_, q in soll_ers)
alt_p = list(csv.DictReader(io.StringIO(vorher("paket3/out/master_nachtraege_protokoll.csv").decode("utf-8"))))
EK = {(e["id"], e["feld"]): e for e in ERS}
diff = [(a, b) for a, b in zip(alt_p, P) if a != b]
d_ok = len(alt_p) == len(P) == 6776 and len(diff) == 136 and all(
    {k for k in a if a[k] != b[k]} == {"quelle"} and a["quelle"] == "wie oben" and b["quelle"] == EK[(b["id"], b["feld"])]["quelle_neu"] for a, b in diff)
h = []
for _ in range(2):  # E08 gleich mit
    with tempfile.TemporaryDirectory() as td:
        td = pathlib.Path(td); kopie(td); pr = lauf(td, "scripts/master_nachtraege.py", "--out", "paket3/out", "--bis", "25")
        h.append((sha((td / "paket3/out/master_3818_aktuell.csv").read_bytes()), sha((td / "paket3/out/master_nachtraege_protokoll.csv").read_bytes())))
print(f"INFO E02 Protokoll SHA-256 neu {h[0][1]} (vorher {PROTO_VOR})")
t("E02 aus eingang/ gebaut: Master bytegleich (cf9fdb2d…); Protokoll = 44a87475… bis auf die Spalte quelle in genau den 136 Zeilen der Ersetzungsliste (Entscheid 2 B); Ersetzungsliste = Quelle der vorangehenden Zeile derselben ID in der Altdatei (Mediencampus-Adresse)",
  h[0] == (MASTER, PROTO_NEU) and sha(vorher("paket3/out/master_nachtraege_protokoll.csv")) == PROTO_VOR and d_ok and ers_ok,
  f"{h[0]} diff {len(diff)} ers {ers_ok}")
t("E08 Reproduzierbarkeit: zwei Läufe aus frischen Ordnern bytegleich und gleich der Repo-Ausgabe",
  h[0] == h[1] == (sha((P26 / "master_3818_aktuell.csv").read_bytes()), sha((P26 / "master_nachtraege_protokoll.csv").read_bytes())), str(h))

# ---------- E03 Eingaben (Ordner nur mit den erlaubten Eingaben; strace) ----------
with tempfile.TemporaryDirectory() as td:
    td = pathlib.Path(td); kopie(td)
    vorh = sorted(baum(td))
    pr = subprocess.run(["strace", "-f", "-qq", "-e", "trace=open,openat", "-o", str(td / "strace.txt"), sys.executable, "-I",
                         str(td / "scripts/master_nachtraege.py"), "--out", "paket3/out", "--bis", "25"], cwd=td, capture_output=True, text=True)
    geoeffnet = set()
    for z in (td / "strace.txt").read_text().splitlines():
        m = re.search(r'open(?:at)?\([^"]*"([^"]+)"', z)
        if m and "ENOENT" not in z:
            p = pathlib.Path(m.group(1)); p = p if p.is_absolute() else td / p
            if str(p).startswith(str(td)) and p.name != "strace.txt" and p.is_file(): geoeffnet.add(str(p.relative_to(td)))
    (td / "strace.txt").unlink()
    nachher = sorted(baum(td))
    erlaubt = set(EIN) - {"scripts/eingang_pruefen.py", "daten/anbieter.csv"} | set(EINGANG) - {"eingang/LIESMICH.md"} | {"paket3/out/master_3818_aktuell.csv", "paket3/out/master_nachtraege_protokoll.csv"}
    e03 = (pr.returncode == 0 and geoeffnet <= erlaubt and not any(a in geoeffnet for a in ALT)
           and {"paket3/out/master_3818.csv", "wissensbasis/ENTSCHEIDUNGSREGISTER.csv", "paket25/eingang/lieferform_p19.json"} | set(TAB) <= geoeffnet
           and set(nachher) - set(vorh) == {"paket3/out/master_3818_aktuell.csv", "paket3/out/master_nachtraege_protokoll.csv"}
           and sha((td / "paket3/out/master_3818_aktuell.csv").read_bytes()) == MASTER)
    print("INFO E03 geöffnet: " + ", ".join(sorted(geoeffnet)))
t("E03 Eingaben: master_nachtraege.py läuft in einem Ordner nur mit Basis, eingang/, Tabellen A4, Register-Kopie, P25-Auszug (und dem Code inkl. build_master_p3.py für SENT); strace: keine Altdatei geöffnet, nur die zwei Ausgaben neu",
  e03, f"{pr.stderr[-300:]} {sorted(geoeffnet - erlaubt)}")

# ---------- E04 Prüfskript am Bestand ----------
with tempfile.TemporaryDirectory() as td:
    td = pathlib.Path(td); kopie(td); vor = baum(td)
    pr = lauf(td, "scripts/eingang_pruefen.py")
    e04 = pr.returncode == 0 and baum(td) == vor and "OK Eingang: 8 Dateien" in pr.stdout
t("E04 Prüfskript am Bestand: Rückgabecode 0, 8 Dateien OK, schreibt nichts (Ordner vorher = nachher, auch kein __pycache__)", e04, pr.stdout[-300:] + pr.stderr[-300:])

# ---------- E05 Fehlfälle K01–K14, N01–N11 ----------
KK = ["id", "feld", "alt", "neu", "alt_anzeige", "herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "ursprung"]
de = next(r for r in M if r["release_markt"] == "DE" and r["dauer"] == "nicht erfasst")
schutz = next(r for r in M if r["schutz_307"] == "JA" and r["release_markt"] == "CH")
k14 = next(r for r in M if r["release_markt"] == "DE" and r["ch_zugang"] == "nicht erfasst" and r["ch_zugang_regel"] == "nicht erfasst")
e066 = next(r for r in M if r["h_ch_zugang"] == "REGEL_E066" and r["durchfuehrungsort_land"] == "CH")
ch = next(r for r in M if r["release_markt"] == "CH" and r["kohorte"] == "WEBSITE_1352" and r["termin_anzeige"] and r["beschreibung"] != "nicht erfasst")
Q = "https://example.org/testfall-p26, abgerufen 21.11.2026 (Testfall, kein echter Nachtrag)"
GUT_K = [de["id"], "dauer", "nicht erfasst", "2 Tage", "", "ANBIETERSEITE_E136", "E178", Q, "", "", ""]
vorlage = neu["eingang/022_20261119_neue_angebote.csv"][0]
NK = list(vorlage)
NK.insert(NK.index("h_url_identitaet") + 1, "lieferform_json")  # ab Lauf 026 Pflicht für CH (Spalte existiert nach dem P25-Schritt)
NK.insert(NK.index("anbieter") + 1, "anbieter_id")  # Paket 27 B07: ab Lauf 027 Pflicht
def gut_n(**w):
    z = dict(vorlage); z.update({"id": "TEST-P26-NEU-001", "kohorte": "NEU_027", "titel": "Testkurs Paket 26 (kein echtes Angebot)",
                                 "url": "https://digicomp.ch/test-paket-26", "lieferform_json": MI["OFFER-DIGICOMP-075"]["lieferform_json"], "anbieter_id": ANB[vorlage["anbieter"]],
                                 "quelle": Q, "url_geprueft_am": "2026-11-21", "ursprung": "Testfall"}); z.update(w)
    return [z[c] for c in NK]
def kf(*aend, kopf=KK, name="027_20261121_korrekturen.csv", **kw):  # Korrekturfall: Datei 026 mit einer veränderten Zeile
    def f(td):
        z = list(GUT_K)
        for i, v in aend: z[KK.index(i)] = v
        schreibe_csv(td / "eingang" / name, kopf, [z], **kw)
    return f
def nf(*w, kopf=None, **wk):
    def f(td):
        k = kopf or NK; z = dict(zip(NK, gut_n(**wk)))
        schreibe_csv(td / "eingang/027_20261121_neue_angebote.csv", k, [[z.get(c, dict(w).get(c, "")) for c in k]])
    return f
def doppelt(td): schreibe_csv(td / "eingang/027_20261121_korrekturen.csv", KK, [GUT_K, GUT_K[:3] + ["3 Tage"] + GUT_K[4:]])
def ersetze(datei, alt, neu_):
    def f(td):
        p = td / datei; p.write_text(p.read_text(encoding="utf-8").replace(alt, neu_, 1), encoding="utf-8")
    return f
FAELLE = [
    ("K01", "Dateiname", kf(name="26_20261121_korrekturen.csv"), "26_20261121_korrekturen.csv"),
    ("K01", "Laufnummer 024 vergeben", kf(name="024_20261121_korrekturen.csv"), "024_"),
    ("K01", "Laufnummer nicht aufsteigend (Datum)", kf(name="027_20261101_korrekturen.csv"), "027_20261101"),
    ("K01", "Lücke im Altbestand (019, Gegenprüfung B3)", kf(name="019_20261118_korrekturen.csv"), "019_"),
    ("K02", "BOM", kf(bom=True), "027_20261121_korrekturen.csv:1"),
    ("K02", "CRLF", kf(crlf=True), "027_20261121_korrekturen.csv"),
    ("K02", "Kopf", kf(kopf=KK[:-1] + ["bemerkung"]), "027_20261121_korrekturen.csv:1"),
    ("K02", "Spaltenzahl", lambda td: schreibe_csv(td / "eingang/027_20261121_korrekturen.csv", KK, [GUT_K[:-2]]), "027_20261121_korrekturen.csv:2"),
    ("K03", "quelle leer", kf(("quelle", "")), "027_20261121_korrekturen.csv:2:quelle"),
    ("K03", "neu leer (kein Anzeigefeld)", kf(("neu", "")), "027_20261121_korrekturen.csv:2:neu"),
    ("K04", "ID nicht im Master", kf(("id", "OFFER-GIBTS-NICHT-999")), "027_20261121_korrekturen.csv:2:id"),
    ("K05", "h_-Spalte", kf(("feld", "h_dauer")), "027_20261121_korrekturen.csv:2:feld"),
    ("K05", "Kennung gold", kf(("feld", "gold"), ("alt", "NEIN"), ("neu", "JA")), "027_20261121_korrekturen.csv:2:feld"),
    ("K05", "keine Master-Spalte", kf(("feld", "foo")), "027_20261121_korrekturen.csv:2:feld"),
    ("K06", "alt veraltet", kf(("alt", "5 Tage")), "027_20261121_korrekturen.csv:2:alt"),
    ("K06", "alt_anzeige veraltet", kf(("alt_anzeige", "3 Tage")), "027_20261121_korrekturen.csv:2:alt_anzeige"),
    ("K07", "Datum ungültig", kf(("feld", "geprueft_am"), ("neu", "2026-13-01")), "027_20261121_korrekturen.csv:2:neu"),
    ("K07", "Land kein ISO-Code", kf(("feld", "anbieter_land"), ("alt", de["anbieter_land"]), ("neu", "XX")), "027_20261121_korrekturen.csv:2:neu"),
    ("K07", "Sprache mit Leerzeichen", kf(("feld", "sprache"), ("alt", de["sprache"]), ("neu", "DE | FR")), "027_20261121_korrekturen.csv:2:neu"),
    ("K07", "Markt mit zwei Ländern (Gegenprüfung B1)", kf(("id", ch["id"]), ("feld", "release_markt"), ("alt", "CH"), ("neu", "CH|AT")), "027_20261121_korrekturen.csv:2:neu"),
    ("K07", "Platzhalter-Code als neuer Wert", kf(("neu", "n/a")), "027_20261121_korrekturen.csv:2:neu"),
    ("K07", "CH-Pflichtwert danach «nicht erfasst»", kf(("id", ch["id"]), ("feld", "beschreibung"), ("alt", ch["beschreibung"]), ("neu", "nicht erfasst")), "027_20261121_korrekturen.csv:2:id"),
    ("K08", "Herkunft unbekannt", kf(("herkunft", "ERFUNDEN_E999")), "027_20261121_korrekturen.csv:2:herkunft"),
    ("K09", "Register-ID unbekannt", kf(("register_id", "E999")), "027_20261121_korrekturen.csv:2:register_id"),
    ("K09", "Register-Eintrag abgelöst (E082)", kf(("register_id", "E082")), "027_20261121_korrekturen.csv:2:register_id"),
    ("K10", "Schutz-ID ohne Beleg OWNER", kf(("id", schutz["id"]), ("feld", "pruefen_ab"), ("alt", schutz["pruefen_ab"]), ("neu", "2027-12-31"), ("register_id", "E144")), "027_20261121_korrekturen.csv:2:register_id"),
    ("K11", "quelle «wie oben»", kf(("quelle", "wie oben")), "027_20261121_korrekturen.csv:2:quelle"),
    ("K11", "quelle «dito»", kf(("quelle", "Dito")), "027_20261121_korrekturen.csv:2:quelle"),
    ("K12", "id + feld doppelt", doppelt, "027_20261121_korrekturen.csv:3:feld"),
    ("K13", "URL mit Status FEHLER", kf(("feld", "url"), ("alt", de["url"]), ("neu", "https://example.org/neu"), ("url_status", "FEHLER"), ("url_geprueft_am", "2026-11-21")), "027_20261121_korrekturen.csv:2:url_status"),
    ("K13", "URL ohne Prüfdatum", kf(("feld", "url"), ("alt", de["url"]), ("neu", "https://example.org/neu"), ("url_status", "OK")), "027_20261121_korrekturen.csv:2:url_geprueft_am"),
    ("K13", "URL-Prüfdatum nach dem Laufdatum", kf(("feld", "url"), ("alt", de["url"]), ("neu", "https://example.org/neu"), ("url_status", "OK"), ("url_geprueft_am", "2026-11-22")), "027_20261121_korrekturen.csv:2:url_geprueft_am"),
    ("K13", "NICHT_GEPRUEFT mit Prüfdatum (ChatGPT B05)", kf(("feld", "url"), ("alt", de["url"]), ("neu", "https://example.org/neu"), ("url_status", "NICHT_GEPRUEFT"), ("url_geprueft_am", "2026-11-21")), "027_20261121_korrekturen.csv:2:url_geprueft_am"),
    ("K14", "Ort CH entfernt, CH-Zugang nach Regel E066 bleibt", kf(("id", e066["id"]), ("feld", "durchfuehrungsort_land"), ("alt", "CH"), ("neu", "DE"), ("herkunft", "ANBIETERSEITE_E136"), ("register_id", "E136")), "027_20261121_korrekturen.csv:2:id"),
    ("K14", "CH-Zugang JA ohne Ort CH und Regel", kf(("id", k14["id"]), ("feld", "ch_zugang"), ("alt", "nicht erfasst"), ("neu", "JA"), ("herkunft", "ANBIETERSEITE_E136"), ("register_id", "E136")), "027_20261121_korrekturen.csv:2:id"),
    ("N01", "unbekannte Spalte", nf(("foo", "x"), kopf=NK + ["foo"]), "027_20261121_neue_angebote.csv:1:foo"),
    ("N01", "Steuerspalte fehlt", nf(kopf=[c for c in NK if c != "scope_code"]), "027_20261121_neue_angebote.csv:1:scope_code"),
    ("N02", "ID klein geschrieben", nf(id="test-p26"), "027_20261121_neue_angebote.csv:2:id"),
    ("N02", "ID schon im Master", nf(id="OFFER-DIGICOMP-075"), "027_20261121_neue_angebote.csv:2:id"),
    ("N02", "Kohorte falsch", nf(kohorte="NEU_P26"), "027_20261121_neue_angebote.csv:2:kohorte"),
    ("N03", "Titel leer", nf(titel=""), "027_20261121_neue_angebote.csv:2:titel"),
    ("N03", "CH ohne lieferform_json", nf(kopf=[c for c in NK if c != "lieferform_json"]), "027_20261121_neue_angebote.csv:2:lieferform_json"),
    ("N03", "market passt nicht zu release_markt", nf(market="USA"), "027_20261121_neue_angebote.csv:2:market"),
    ("N04", "Startdatum ungültig", nf(start_datum="01.03.2027"), "027_20261121_neue_angebote.csv:2:start_datum"),
    ("N05", "Herkunft unbekannt", nf(herkunft="ERFUNDEN_E999"), "027_20261121_neue_angebote.csv:2:herkunft"),
    ("N05", "quelle «s. o.»", nf(quelle="s. o."), "027_20261121_neue_angebote.csv:2:quelle"),
    ("N06", "URL nicht geprüft", nf(url_status="NICHT_GEPRUEFT"), "027_20261121_neue_angebote.csv:2:url_status"),
    ("N06", "Prüfdatum nach Laufdatum", nf(url_geprueft_am="2026-11-22"), "027_20261121_neue_angebote.csv:2:url_geprueft_am"),
    ("N07", "Anbieter + Titel wie im Master", nf(titel=MI["OFFER-DIGICOMP-075"]["titel"].upper() + " "), "027_20261121_neue_angebote.csv:2:titel"),
    ("N07", "Adresse wie im Master, ohne url_geteilt (E07)", nf(url="https://www.sbvv.ch/weiterbildung/"), "027_20261121_neue_angebote.csv:2:url"),
    ("N07", "Dublettenfreigabe ohne Owner-Entscheid (REGEL E108, ChatGPT B06)", nf(titel=MI["OFFER-DIGICOMP-075"]["titel"], dedupe_freigabe="E108"), "027_20261121_neue_angebote.csv:2:dedupe_freigabe"),
    ("N07", "Dublettenfreigabe unbekannte ID", nf(titel=MI["OFFER-DIGICOMP-075"]["titel"], dedupe_freigabe="E999"), "027_20261121_neue_angebote.csv:2:dedupe_freigabe"),
    ("N08", "Scope-Code unbekannt", nf(scope_code="KERN"), "027_20261121_neue_angebote.csv:2:scope_code"),
    ("N08", "Grenzfall ohne Begründung", nf(scope_code="GRENZFALL_E179"), "027_20261121_neue_angebote.csv:2:scope_begruendung"),
    ("N09", "Lieferform mit 7 Teilfeldern", nf(lieferform_json=json.dumps({k: v for k, v in json.loads(MI["OFFER-DIGICOMP-075"]["lieferform_json"]).items() if k != "variants"})), "027_20261121_neue_angebote.csv:2:lieferform_json"),
    ("N09", "preis_budgetfaehig «ja»", nf(preis_budgetfaehig="ja"), "027_20261121_neue_angebote.csv:2:preis_budgetfaehig"),
    ("N10", "CH-Zugang JA ohne Ort CH und Regel", nf(durchfuehrungsort_land="DE", ch_zugang_regel="nicht erfasst", h_ch_zugang="ANBIETERSEITE_E143"), "027_20261121_neue_angebote.csv:2:ch_zugang"),
    ("N10", "CH-Zugang nach Regel E066 ohne Ort CH", nf(durchfuehrungsort_land="DE"), "027_20261121_neue_angebote.csv:2:ch_zugang"),
    ("N11", "Kennung früherer Läufe (gold)", nf(("gold", "NEIN"), kopf=NK + ["gold"]), "027_20261121_neue_angebote.csv:1:gold"),
]
erg = {}; regeln = set()
for regel, name, aend, ort in FAELLE:
    with tempfile.TemporaryDirectory() as td:
        td = pathlib.Path(td); kopie(td)
        (td / "paket3/out/master_3818_aktuell.csv").write_bytes(b"alt-master"); (td / "paket3/out/master_nachtraege_protokoll.csv").write_bytes(b"alt-protokoll")
        aend(td); vor = baum(td)
        a = lauf(td, "scripts/eingang_pruefen.py"); b = lauf(td, "scripts/master_nachtraege.py", "--out", "paket3/out")
        meld = a.stdout + a.stderr
        gut = (a.returncode != 0 and b.returncode != 0 and f" {regel} " in meld and ort in meld and "ABBRUCH" in b.stdout + b.stderr
               and baum(td) == vor)
        erg[f"{regel} {name}"] = gut; regeln.add(regel) if gut else None
        print(f"INFO E05 {regel} {name}: {[z for z in meld.splitlines() if regel in z][:1]}")
alle_regeln = {f"K{i:02d}" for i in range(1, 15)} | {f"N{i:02d}" for i in range(1, 12)}
t(f"E05 Fehlfälle: {len(FAELLE)} Fälle, je Regel K01–K14 und N01–N11 mindestens einer abgelehnt (Prüfskript und Master-Fortschreibung Rückgabecode ≠ 0, Meldung mit Datei, Zeile, Spalte, Regel; Master, Protokoll und Ausgabeordner bytegleich, keine neue Datei)",
  all(erg.values()) and regeln == alle_regeln, str({k: v for k, v in erg.items() if not v}) + f" fehlt {sorted(alle_regeln - regeln)}")

# ---------- E06 Gutfall, E07 geteilte Adresse ----------
NODE_PATH = os.environ.get("NODE_PATH", "")
with tempfile.TemporaryDirectory() as td:
    td = pathlib.Path(td); kopie(td, GEN); repo_ein = baum(R / "eingang")
    k075 = ["OFFER-DIGICOMP-075", "pruefen_ab", "2027-05-19", "2027-06-01", "", "ANBIETERSEITE_E143", "E143", Q, "", "", "Testfall"]
    schreibe_csv(td / "eingang/027_20261121_korrekturen.csv", KK, [GUT_K, k075])
    schreibe_csv(td / "eingang/027_20261121_neue_angebote.csv", NK, [gut_n()])
    pr = lauf(td, "scripts/master_nachtraege.py", "--out", "paket3/out")
    N2 = list(csv.DictReader(io.StringIO((td / "paket3/out/master_3818_aktuell.csv").read_text(encoding="utf-8-sig"))))
    P2 = lies(td / "paket3/out/master_nachtraege_protokoll.csv")
    geaendert = {(r["id"], c) for r, s in zip(N2, M) for c in s if r[c] != s[c]}  # P27: nur die 125 Spalten von Paket 26
    neuz = N2[-1]
    zellen = [c for c in neuz if neuz[c] not in ("nicht erfasst", "LEER", "")]
    p_soll = [[de["id"], "dauer", "nicht erfasst", "2 Tage", "h_dauer", "LEER", "ANBIETERSEITE_E136", "E178", Q],
              ["OFFER-DIGICOMP-075", "pruefen_ab", "2027-05-19", "2027-06-01", "h_pruefen_ab", "ANBIETERSEITE_E143", "ANBIETERSEITE_E143", "E143", Q]] + \
             [["TEST-P26-NEU-001", c, "(neu)", neuz[c], "", "", "ANBIETERSEITE_E143", "E143", Q] for c in zellen]
    e06m = (pr.returncode == 0 and len(N2) == 3820 and geaendert == {(de["id"], "dauer"), (de["id"], "h_dauer"), ("OFFER-DIGICOMP-075", "pruefen_ab")}
            and [r["id"] for r in N2[:-1]] == [r["id"] for r in M] and [list(p.values()) for p in P2[:len(P)]] == [list(p.values()) for p in P]
            and all(p["herkunft"] == "ANBIETER_TABELLE_P27" or p["feld"] == "scope_code" for p in P2[len(P):len(P) + SCHRITT])
            and [list(p.values()) for p in P2[len(P) + SCHRITT:]] == p_soll and neuz["kohorte"] == "NEU_027" and neuz["schutz_307"] == "NEIN"
            and neuz["h_titel"] == "ANBIETERSEITE_E143" and neuz["h_objektklasse"] == "REGEL")
    e06g = False
    if e06m:
        g = lauf(td, "scripts/generator_website.py", "--daten", str(td / "d.js"), "--smart", str(td / "s.json"))
        if g.returncode == 0:
            D = json.loads((td / "d.js").read_text(encoding="utf-8")[len("window.WEITERBILDUNGSRADAR_OFFERS = "):].rstrip().rstrip(";"))
            S = json.loads((td / "s.json").read_text(encoding="utf-8"))["byId"]
            o = {x["id"]: x for x in D}
            e06g = ("TEST-P26-NEU-001" in o and list(o["TEST-P26-NEU-001"]) == list(o["OFFER-DIGICOMP-075"])
                    and set(S["TEST-P26-NEU-001"]) == set(S["OFFER-DIGICOMP-075"]) and de["id"] not in o and len(D) == 1354)
    e06r = baum(R / "eingang") == repo_ein
t("E06 Gutfall (Testkopie): Korrektur an einer DE-Zeile und an OFFER-DIGICOMP-075, neues CH-Angebot in Lauf 026; genau die erwarteten Zellen und Protokollzeilen; Generator baut, das Angebot steht mit allen Schlüsseln in Datendatei und Smart-Datei; Repo-Eingang unverändert",
  e06m and e06g and e06r, f"master {e06m} gen {e06g} repo {e06r} {pr.stdout[-200:]}{pr.stderr[-300:]} {sorted(geaendert)[:6]}")
with tempfile.TemporaryDirectory() as td:
    td = pathlib.Path(td); kopie(td)
    schreibe_csv(td / "eingang/027_20261121_neue_angebote.csv", NK, [gut_n(url="https://www.sbvv.ch/weiterbildung", url_geteilt="JA")])
    a = lauf(td, "scripts/eingang_pruefen.py"); b = lauf(td, "scripts/master_nachtraege.py", "--out", "paket3/out")
    ref = next(r["id"] for r in M if r["url"].rstrip("/").lower().endswith("sbvv.ch/weiterbildung"))
    e07 = (a.returncode == 0 and b.returncode == 0 and f"GETEILTE ADRESSE 027_20261121_neue_angebote.csv: TEST-P26-NEU-001 wie {ref}" in a.stdout
           and erg.get("N07 Adresse wie im Master, ohne url_geteilt (E07)") and erg.get("N07 Anbieter + Titel wie im Master")
           and erg.get("N07 Dublettenfreigabe ohne Owner-Entscheid (REGEL E108, ChatGPT B06)"))
with tempfile.TemporaryDirectory() as td:  # Gutfälle zu B05/B06: NICHT_GEPRUEFT ohne Datum; gleicher Anbieter + Titel mit Owner-Freigabe
    td = pathlib.Path(td); kopie(td)
    schreibe_csv(td / "eingang/027_20261121_korrekturen.csv", KK, [[de["id"], "url", de["url"], "https://example.org/neu-p26", "", "ANBIETERSEITE_E136", "E178", Q, "NICHT_GEPRUEFT", "", "Testfall"]])
    schreibe_csv(td / "eingang/027_20261121_neue_angebote.csv", NK, [gut_n(titel=MI["OFFER-DIGICOMP-075"]["titel"], dedupe_freigabe="E206")])
    g = lauf(td, "scripts/eingang_pruefen.py")
    e07b = g.returncode == 0 and "OK 027_20261121_korrekturen.csv: 1 Zeilen" in g.stdout and "OK 027_20261121_neue_angebote.csv: 1 Zeilen" in g.stdout
t("E07 Dubletten (Entscheid 4 A): Adresse der Übersichtsseite sbvv.ch/weiterbildung ohne url_geteilt abgelehnt, mit JA angenommen und gelistet; gleicher Anbieter + Titel ohne bzw. mit ungültiger Freigabe abgelehnt, mit Owner-Entscheid E206 angenommen; URL NICHT_GEPRUEFT ohne Prüfdatum angenommen (ChatGPT B05, B06)",
  e07 and e07b, a.stdout[-300:] + a.stderr[-300:] + f" b {e07b}")

with tempfile.TemporaryDirectory() as td:
    td = pathlib.Path(td); kopie(td)
    schreibe_csv(td / "eingang/027_20261121_korrekturen.csv", KK, [[ch["id"], "termin_anzeige", ch["termin_anzeige"], "", "", "ANBIETERSEITE_E136", "E136", Q, "", "", "Testfall"]])
    pr = lauf(td, "scripts/master_nachtraege.py", "--out", "paket3/out")
    N3 = {r["id"]: r for r in csv.DictReader(io.StringIO((td / "paket3/out/master_3818_aktuell.csv").read_text(encoding="utf-8-sig")))}
    P3 = lies(td / "paket3/out/master_nachtraege_protokoll.csv")
    e06b = (pr.returncode == 0 and N3[ch["id"]]["termin_anzeige"] == N3[ch["id"]]["h_termin_anzeige"] == ""
            and [list(p.values()) for p in P3[len(P) + SCHRITT:]] == [[ch["id"], "termin_anzeige", ch["termin_anzeige"], "", "h_termin_anzeige", ch["h_termin_anzeige"], "", "E136", Q]])
t("E06b Anzeigefeld leeren (Testkopie): Anzeigefeld und Herkunft leer, Original gilt; Protokoll ohne Herkunft (Gegenprüfung B2)", e06b, pr.stderr[-300:])

# ---------- E09 bestehende Tests ----------
def test(cmd, soll, env=None):
    pr = subprocess.run([sys.executable, "-I", *cmd], cwd=R, capture_output=True, text=True, env=env)
    return pr.returncode == 0 and f"{soll} PASS" in pr.stdout, pr.stdout[-150:] + pr.stderr[-150:]
r = [test(["scripts/test_paket24.py", "--out", "paket3/out"], "14/14"), test(["scripts/test_nachtraege.py", "--out", "paket3/out"], "14/14"),
     test(["paket25/tests/test_paket25_master.py"], "8/8")]
if NODE_PATH: r.append(test(["paket25/tests/test_paket25_generator.py"], "13/13", {"PATH": os.environ["PATH"], "NODE_PATH": NODE_PATH, "HOME": os.environ.get("HOME", "/tmp")}))
t("E09 bestehende Tests nach A10: test_paket24.py 14/14, test_nachtraege.py 14/14, P25 Master 8/8, Generator 13/13; data-p25.js und Smart-Datei bytegleich (ae30bf39…, 6e7ec9cd…)",
  all(x[0] for x in r) and len(r) == 4 and sha((R / "paket25/website/data-p25.js").read_bytes()) == DATEN_P25
  and sha((R / "paket25/out/smart-search-data-p25.json").read_bytes()) == SMART_P25, f"{[x[1] for x in r if not x[0]]} NODE_PATH {'gesetzt' if NODE_PATH else 'fehlt'}")

# ---------- E10 Unverändert, E11 Testanpassung ----------
def blobs(*pfade):
    out = {}
    for z in git("ls-tree", "-r", VOR, "--", *[f"claude-work/{p}" for p in pfade]).decode().splitlines():
        meta, pfad = z.split("\t", 1); out[pfad] = meta.split()[2]
    return out
alt_b = blobs(*ALT, "paket19", "paket22", "paket25/website", "paket3/out/master_3818.csv")
jetzt = {p: git("hash-object", p).decode().strip() for p in alt_b}
neu_dort = [str(p.relative_to(GIT)) for d in ("paket19", "paket22", "paket25/website") for p in (R / d).rglob("*") if p.is_file()
            and str(p.relative_to(GIT)) not in alt_b]
t("E10 unverändert gegenüber 8e1c715: 9 Altdateien, paket19/, paket22/, paket25/website/, Basis master_3818.csv (Git-Blob vorher = nachher); keine neuen Dateien dort",
  alt_b == jetzt and len(alt_b) > 9 and not neu_dort, f"{[p for p in alt_b if alt_b[p] != jetzt[p]][:5]} neu {neu_dort[:3]}")
f11 = []
for p in ("scripts/test_paket24.py", "paket25/tests/test_paket25_master.py"):
    a, b = vorher(p).decode("utf-8"), git("show", f"{P26_CODE}:claude-work/{p}").decode("utf-8")
    hx = lambda s: set(re.findall(r"\b[0-9a-f]{64}\b", s))
    if not hx(a) <= hx(b): f11.append((p, "Hash fehlt"))
    if len(re.findall(r'^t\("', a, re.M)) != len(re.findall(r'^t\("', b, re.M)): f11.append((p, "Zahl der Prüfungen"))
    for k in re.findall(r'^t\("(\w+) ', a, re.M):
        if not re.search(rf'^t\("{k} ', b, re.M): f11.append((p, k))
d11 = git("diff", VOR, P26_CODE, "--", "claude-work/scripts/test_paket24.py", "claude-work/paket25/tests/test_paket25_master.py")
abgelegt = (R / "paket26/out/testanpassung_a10.diff").read_bytes() if (R / "paket26/out/testanpassung_a10.diff").exists() else b""
t("E11 Testanpassung (A10, E209): historische Sollwerte und Hashes unverändert, gleiche Prüfungen (T01–T14, M01–M08); Diff = paket26/out/testanpassung_a10.diff",
  not f11 and d11 and d11 == abgelegt, str(f11) + (" Diff ≠ abgelegte Fassung" if d11 != abgelegt else ""))

# ---------- E12 Schema-Bericht ----------
with tempfile.TemporaryDirectory() as td:
    td = pathlib.Path(td); kopie(td); vor = sha((td / "paket3/out/master_3818.csv").read_bytes())
    pr = lauf(td, "scripts/eingang_pruefen.py", "--schema-bericht", "schema.csv", "--bis", "25")
    sb = {z["spalte"]: z for z in lies(td / "schema.csv")} if (td / "schema.csv").exists() else {}
    e12 = (pr.returncode == 0 and len(sb) == 125 and {c: int(z["abweichungen"]) for c, z in sb.items() if z["abweichungen"] != "0"} == {"url": 30, "sprache": 5, "format": 17}
           and sha((td / "paket3/out/master_3818.csv").read_bytes()) == vor and (R / "paket26/out/schema_bericht.csv").read_bytes() == (td / "schema.csv").read_bytes())
t("E12 Schema-Bericht: ganzer Master (125 Spalten) gegen die Feldtabelle; Abweichungen url 30, sprache 5, format 17 (Grundlage P27); Master unverändert; = paket26/out/schema_bericht.csv",
  e12, pr.stdout[-200:] + str({c: z["abweichungen"] for c, z in sb.items() if z["abweichungen"] != "0"}))
print(f"{ok}/{n} PASS")
sys.exit(0 if ok == n else 1)
