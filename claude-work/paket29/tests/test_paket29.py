"""Paket 29 (SPEZIFIKATION_PAKET29_20261123.md §5 mit §7.3): Build-Tests für paket29/scripts/build_release_p29.py.
P02 Marktzuordnung und Fehlfälle, P07 Land ohne deutschen Namen, P09 Fehlfälle Build (Ziel und Repo bytegleich),
P12 Grösse und Erstbesuch, P13 zwei Bauten bytegleich, dazu V1 (Vertrag der Dateien) und A5 (übrige Dateien wie P28).
P01, P03–P06, P08, P15: paket29/tests/test_paket29_anzeige.js; P10: paket29/tests/test_apache_p29.sh.
Aufruf (aus claude-work/): TZ=UTC NODE_PATH=<nm> python3 -I paket29/tests/test_paket29.py JJJJ-MM-TT <p28-release-am-stichtag>
Die Tests bauen nur in temporäre Ordner; das Repo bleibt unverändert (geprüft mit git status)."""
import csv, gzip, hashlib, importlib.util, json, os, pathlib, re, subprocess, sys, tempfile

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
BAU = R / "paket29/scripts/build_release_p29.py"
S0, P28REL = sys.argv[1], pathlib.Path(sys.argv[2]).resolve()
ERG = []
csv.field_size_limit(10 ** 9)


def check(nr, name, ok, detail=""):
    ERG.append({"nr": nr, "name": name, "status": "PASS" if ok else "FAIL", "detail": detail})
    print(("PASS" if ok else "FAIL"), nr, name, ("– " + detail) if detail else "")


def sha(b): return hashlib.sha256(b).hexdigest()


def gz(b): return len(gzip.compress(b, 6, mtime=0))


def bau(stichtag, ziel, *extra, test=True):
    e = dict(os.environ); e.pop("P29_TEST", None)
    if test: e["P29_TEST"] = "1"
    return subprocess.run([sys.executable, "-I", str(BAU), stichtag, str(ziel), *extra], capture_output=True, text=True, cwd=R, env=e)


def baum(p):
    p = pathlib.Path(p)
    return {str(f.relative_to(p)): sha(f.read_bytes()) for f in sorted(p.rglob("*")) if f.is_file()} if p.exists() else None


def git_stand(): return subprocess.run(["git", "status", "--porcelain", "--ignored"], capture_output=True, text=True, cwd=R).stdout


def jsdom_eval(web, dateien, ausdruck):
    """Dateien in jsdom ausführen (ohne App) und einen Ausdruck als JSON zurückgeben."""
    prog = ("const {JSDOM}=require('jsdom');const fs=require('fs');const d=new JSDOM('',{runScripts:'outside-only'});const w=d.window;"
            f"for(const f of {json.dumps(dateien)}) w.eval(fs.readFileSync({json.dumps(str(web))}+'/'+f,'utf8'));"
            f"process.stdout.write(JSON.stringify(w.eval({json.dumps(ausdruck)})));")
    r = subprocess.run(["node", "-e", prog], capture_output=True, text=True)
    if r.returncode: raise RuntimeError(r.stderr[-400:])
    return json.loads(r.stdout)


def master_kopie(ziel, aendern):
    src = R / "paket3/out/master_3818_aktuell.csv"
    with src.open(encoding="utf-8", newline="") as f:
        rd = csv.reader(f); kopf = next(rd); zeilen = list(rd)
    aendern(kopf, zeilen)
    with ziel.open("w", encoding="utf-8", newline="") as f:
        csv.writer(f, lineterminator="\n").writerows([kopf] + zeilen)
    return ziel


def main():
    GIT0 = git_stand()
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="p29test-")); os.chmod(tmp, 0o755)
    jetzt = f"{S0}T12:00:00+01:00"
    # ---------- Bau am Stichtag ----------
    A = tmp / "rel_a"
    r = bau(S0, A, "--jetzt", jetzt)
    if r.returncode: print(r.stdout, r.stderr); sys.exit("Bau fehlgeschlagen")
    prot = json.loads((A / "BAUPROTOKOLL.json").read_text(encoding="utf-8")); web = A / "website"
    p28 = json.loads((P28REL / "BAUPROTOKOLL.json").read_text(encoding="utf-8"))
    if p28["stichtag"] != S0: sys.exit("P28-Release hat anderen Stichtag")
    sb_spec = importlib.util.spec_from_file_location("sb", R / "scripts/sichtbarkeit.py"); sb = importlib.util.module_from_spec(sb_spec); sb_spec.loader.exec_module(sb)
    master = sb.lies_master(R / "paket3/out/master_3818_aktuell.csv")
    markt = {z["id"]: z["release_markt"] for z in master}
    # ---------- P02 Marktzuordnung ----------
    fehl, alle = [], []
    for m, v in prot["maerkte"].items():
        ids_d = jsdom_eval(web, [v["daten"]], "window.WEITERBILDUNGSRADAR_OFFERS.map(o=>o.id)")
        ids_s = jsdom_eval(web, [v["suche"]], "Object.keys(window.MEDIA_SKILLS_SMART_DATA.byId)")
        if ids_d != ids_s: fehl.append(f"{m}: Daten ≠ Smart")
        if any(markt[i] != m for i in ids_d): fehl.append(f"{m}: fremder Markt")
        if len(ids_d) != v["angebote"]: fehl.append(f"{m}: Anzahl")
        alle += ids_d
    p28ids = jsdom_eval(P28REL / "website", [n for n in p28["dateien"] if n.startswith("daten-")], "window.WEITERBILDUNGSRADAR_OFFERS.map(o=>o.id)")
    check("P02a", "Marktzuordnung: jede Datei nur ihr Markt, Daten = Smart je Markt, 0 doppelt, 0 fehlend gegenüber P28",
          not fehl and len(alle) == len(set(alle)) and set(alle) == set(p28ids), "; ".join(fehl) + f" {len(alle)} / P28 {len(p28ids)}")
    reihe = list(prot["maerkte"])
    check("P02b", "Ladereihenfolge der Märkte CH, dann übrige alphabetisch (E247); index.html lädt Daten, Smart, app-v44.js",
          reihe == ["CH"] + sorted(set(reihe) - {"CH"}) and prot["ladereihenfolge"] == [prot["maerkte"][m]["daten"] for m in reihe]
          + [prot["maerkte"][m]["suche"] for m in reihe] + ["app-v44.js"], f"{reihe}")
    # V1 Vertrag: Soll gleich in allen Datendateien, Geladen-Meldung, meta gleich und nicht überschrieben
    kat = jsdom_eval(web, prot["ladereihenfolge"][:-1], "window.MEDIA_SKILLS_KATALOG")
    metas = [jsdom_eval(web, [prot["maerkte"][m]["suche"]], "window.MEDIA_SKILLS_SMART_DATA.meta") for m in reihe]
    meta_vor = jsdom_eval(web, [prot["maerkte"][reihe[-1]]["suche"], prot["maerkte"][reihe[0]]["suche"]], "window.MEDIA_SKILLS_SMART_DATA.meta")
    solls = [re.search(r"\.soll = (\{[^}]*\});", (web / prot["maerkte"][m]["daten"]).read_text(encoding="utf-8")).group(1) for m in reihe]
    check("V1", "Vertrag: Soll {Markt: Anzahl} in jeder Datendatei gleich und = gezählte Datensätze; Daten und Smart melden Markt und Anzahl; meta in allen Smart-Dateien gleich, erste gesetzte bleibt",
          len(set(solls)) == 1 and kat["soll"] == {m: prot["maerkte"][m]["angebote"] for m in reihe} == kat["daten"] == kat["suche"]
          and all(x == metas[0] for x in metas) and meta_vor == metas[0] and metas[0]["rosterCount"] == len(alle), json.dumps(kat)[:200])
    # Fehlfälle P02
    sichtbar = [z["id"] for z in master if sb.sichtbar(z, __import__("datetime").date.fromisoformat(S0))]
    i_ch = next(i for i in sichtbar if markt[i] == "CH")
    def setze(spalte, wert, ids):
        def f(kopf, zeilen):
            k, ki = kopf.index(spalte), kopf.index("id")
            for z in zeilen:
                if z[ki] in ids: z[k] = wert
        return f
    def doppelt(kopf, zeilen):
        ki = kopf.index("id"); zeilen.append(list(next(z for z in zeilen if z[ki] == i_ch)))
    faelle = {"doppelte id": doppelt, "release_markt leer": setze("release_markt", "", {i_ch}),
              "unbekannter ISO-Code": setze("release_markt", "XX", {i_ch})}
    fehl = []
    for name, f in faelle.items():
        mk = master_kopie(tmp / f"m_{len(fehl)}_{name[:4]}.csv", f)
        z = tmp / f"rel_f{abs(hash(name)) % 1000}"
        r = bau(S0, z, "--jetzt", jetzt, "--master", str(mk))
        if r.returncode == 0 or "ABBRUCH" not in r.stderr + r.stdout or z.exists() or list(tmp.glob(".tmp-p29-*")): fehl.append(f"{name}: {r.returncode} {(r.stderr or r.stdout).strip()[-120:]}")
        else: print("   ", name, "→", (r.stderr or r.stdout).strip()[-110:])
    # Smart ohne Angebot / Angebot ohne Smart: direkt an aufteilen()
    spec = importlib.util.spec_from_file_location("b29", BAU); b29 = importlib.util.module_from_spec(spec); spec.loader.exec_module(b29)
    mz = [{"id": "A", "release_markt": "CH"}, {"id": "B", "release_markt": "AT"}]
    for name, by in (("Smart ohne Angebot", {"A": {}, "B": {}, "C": {}}), ("Angebot ohne Smart", {"A": {}})):
        try: b29.aufteilen(mz, ["A", "B"], [{"id": "A"}, {"id": "B"}], by, {}, {"CH", "AT"}); fehl.append(f"{name}: kein Abbruch")
        except b29.Abbruch as e: print("   ", name, "→", e)
    ok_teile = b29.aufteilen(mz, ["A", "B"], [{"id": "A"}, {"id": "B"}], {"A": {}, "B": {}}, {}, {"CH", "AT"})
    check("P02c", "Fehlfälle Marktzuordnung: doppelte id, release_markt leer, unbekannter ISO-Code, Smart ohne Angebot, Angebot ohne Smart → Abbruch, nichts geschrieben",
          not fehl and [t[0] for t in ok_teile] == ["CH", "AT"], "; ".join(fehl))
    # ---------- P07 Land ohne deutschen Namen ----------
    mk = master_kopie(tmp / "m_nz.csv", setze("durchfuehrungsort_land", "NZ", {i_ch}))
    z7 = tmp / "rel_nz"; r = bau(S0, z7, "--jetzt", jetzt, "--master", str(mk))
    p7 = json.loads((z7 / "BAUPROTOKOLL.json").read_text(encoding="utf-8")) if r.returncode == 0 else {}
    opt = []
    if r.returncode == 0:
        w7 = z7 / "website"
        prog = ("const {JSDOM}=require('jsdom');const fs=require('fs');const d=new JSDOM(fs.readFileSync(process.argv[1]+'/index.html','utf8').replace(/<script src=\"[^\"]+\"><\\/script>/g,''),"
                "{url:'https://mediaskills.ch/',runScripts:'outside-only',pretendToBeVisual:true});const w=d.window;"
                "for(const f of JSON.parse(process.argv[2])) w.eval(fs.readFileSync(process.argv[1]+'/'+f,'utf8'));"
                "process.stdout.write(JSON.stringify([...w.document.querySelectorAll('#countryFilter option')].map(o=>o.textContent.trim())));")
        o = subprocess.run(["node", "-e", prog, str(w7), json.dumps(p7["ladereihenfolge"])], capture_output=True, text=True,
                           env=dict(os.environ, TZ="Europe/Zurich"))
        opt = json.loads(o.stdout) if o.returncode == 0 else [o.stderr[-200:]]
    check("P07", "Land ohne deutschen Namen (Testkopie Master, ein sichtbares CH-Angebot mit Durchführungsland NZ): Build meldet es, Filter zeigt «NZ»",
          r.returncode == 0 and "MELDUNG P07: Durchführungsland NZ" in r.stdout and p7.get("p07_laender_ohne_deutschen_namen") == ["NZ"] and "NZ" in opt,
          f"Optionen {opt}")
    # ---------- P09 Fehlfälle Build ----------
    vor_a = baum(A)
    import datetime as dt
    morgen = (dt.date.fromisoformat(S0) + dt.timedelta(days=1)).isoformat()
    faelle = [("Stichtag in der Zukunft", [morgen, A, "--jetzt", jetzt], True), ("Testoption ohne P29_TEST", [S0, A, "--jetzt", jetzt], False),
              ("Ziel im Repo", [S0, R / "paket29", "--jetzt", jetzt], True), ("Ziel = Repo", [S0, R.parent, "--jetzt", jetzt], True),
              ("Ziel ist kein Release", [S0, tmp, "--jetzt", jetzt], True)]
    faelle += [(f"künstlicher Fehler nach {x}", [S0, A, "--jetzt", jetzt, "--fehler-nach", x], True) for x in ("generator", "aufteilung", "liste")]
    fehl = []
    for name, args, test in faelle:
        r = bau(*map(str, args[:2]), *map(str, args[2:]), test=test)
        if r.returncode == 0 or "ABBRUCH" not in (r.stderr + r.stdout) or baum(A) != vor_a or list(tmp.glob(".tmp-p29-*")) or list(tmp.glob(".alt-p29-*")):
            fehl.append(f"{name}: rc {r.returncode}")
        else: print("   ", name, "→", (r.stderr or r.stdout).strip()[-100:])
    check("P09", f"Fehlfälle Build ({len(faelle)}): Abbruch, früheres Release im Ziel bytegleich, kein Zwischenordner", not fehl, "; ".join(fehl))
    # ---------- P12 Grösse, Erstbesuch ----------
    def erstbesuch(rel):
        idx = (rel / "website/index.html").read_bytes(); t = idx.decode("utf-8")
        refs = re.findall(r'<script src="([^"]+)">', t) + re.findall(r'<link rel="stylesheet" href="([^"]+)">', t)
        return {"index.html": gz(idx), **{n: gz((rel / "website" / n).read_bytes()) for n in refs}}
    e29, e28 = erstbesuch(A), erstbesuch(P28REL)
    d = sum(e29.values()) - sum(e28.values())
    check("P12", "Paket ≤ 9 MB; Erstbesuch (gzip: index.html, CSS, App, Daten, Smart) höchstens +2 KB gegenüber P28",
          prot["website_byte"] <= 9 * 1024 * 1024 and d <= 2048,
          f"website/ {prot['website_byte']} Byte; Erstbesuch P28 {sum(e28.values())}, P29 {sum(e29.values())}, Differenz {d:+d} Byte "
          f"(Daten+Smart {sum(v for k, v in e29.items() if k[:5] in ('daten', 'suche')) - sum(v for k, v in e28.items() if k[:5] in ('daten', 'suche')):+d}, "
          f"App {e29['app-v44.js'] - e28['app-v43.js']:+d}, index.html {e29['index.html'] - e28['index.html']:+d})")
    # ---------- P13 zwei Bauten ----------
    B = tmp / "rel_b"; r = bau(S0, B, "--jetzt", jetzt)
    check("P13", "Zwei Bauten: gesamtes Release samt Bauprotokoll und SHA256SUMS.txt bytegleich", r.returncode == 0 and baum(A) == baum(B),
          f"{len(baum(A) or {})} Dateien")
    # ---------- A5 übrige Dateien wie P28 ----------
    p28web = P28REL / "website"
    gleich = ["404.html", "datenschutz.html", "impressum.html", "methodik.html", "robots.txt", "sitemap.xml", "styles-v22.css", "styles-v24.css"]
    abw = [n for n in gleich if (web / n).read_bytes() != (p28web / n).read_bytes()]
    ix29 = re.sub(r'(\n  <script src="[^"]+"></script>)+', "\n<SKRIPTE>", (web / "index.html").read_text(encoding="utf-8"))
    ix28 = re.sub(r'(\n  <script src="[^"]+"></script>)+', "\n<SKRIPTE>", (p28web / "index.html").read_text(encoding="utf-8"))
    hta = (A / "htaccess.txt").read_bytes() == (P28REL / "htaccess.txt").read_bytes()
    check("A5", "Übrige Dateien bytegleich mit P28 (4 Seiten, robots.txt, sitemap.xml, 2 CSS); index.html gleich ausser Skriptzeilen (Kursliste bytegleich); htaccess.txt bytegleich (E246)",
          not abw and ix29 == ix28 and hta, f"abweichend {abw}; index ohne Skripte gleich {ix29 == ix28}; htaccess {hta}")
    # ---------- Repo unverändert ----------
    check("REPO", "Repo nach allen Tests unverändert (git status)", git_stand() == GIT0)
    out = R / "paket29/out"; out.mkdir(exist_ok=True)
    (out / f"test_paket29_{S0}.json").write_text(json.dumps({"stichtag": S0, "ergebnisse": ERG, "erstbesuch": {"p28": e28, "p29": e29}},
                                                             ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    import shutil; shutil.rmtree(tmp)
    n = lambda s: sum(1 for e in ERG if e["status"] == s)
    print(f"\n{n('PASS')} PASS · {n('FAIL')} FAIL")
    sys.exit(1 if n("FAIL") else 0)


if __name__ == "__main__":
    main()
