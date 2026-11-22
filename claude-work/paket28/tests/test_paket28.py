"""Paket 28 (SPEZIFIKATION_PAKET28_20261122.md §5): P01, P04–P09, P11 (Inhalt htaccess.txt), P13–P15 für
paket28/scripts/build_release_p28.py. P02, P03, P16: paket28/tests/test_paket28_anzeige.js; P10, P11 (Apache):
paket28/tests/test_apache_p28.sh; P12: Stufe 1/2 mit den Werkzeugen aus Paket 8 und 12.
Aufruf (aus claude-work/): TZ=UTC NODE_PATH=<nm> python3 -I paket28/tests/test_paket28.py JJJJ-MM-TT
(Stichtag = heutiger Tag oder früher; die Tests bauen nur in temporäre Ordner, das Repo bleibt unverändert, P15)."""
import csv, datetime, gzip, hashlib, importlib.util, io, json, os, pathlib, re, shutil, subprocess, sys, tempfile

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
BAU = R / "paket28/scripts/build_release_p28.py"
S0 = sys.argv[1]
PRE, SPRE = "window.WEITERBILDUNGSRADAR_OFFERS = ", "window.MEDIA_SKILLS_SMART_DATA = "
ERG = []


def check(nr, name, ok, detail=""):
    ERG.append({"nr": nr, "name": name, "status": "PASS" if ok else "FAIL", "detail": detail})
    print(("PASS" if ok else "FAIL"), nr, name, ("– " + detail) if detail else "")


def sha(b): return hashlib.sha256(b).hexdigest()


def bau(stichtag, ziel, *extra, env=None):
    e = dict(os.environ, P28_TEST="1", **(env or {}))
    return subprocess.run([sys.executable, "-I", str(BAU), stichtag, str(ziel), *extra], capture_output=True, text=True, cwd=R, env=e)


def baum(p):
    p = pathlib.Path(p)
    return {str(f.relative_to(p)): sha(f.read_bytes()) for f in sorted(p.rglob("*")) if f.is_file()} if p.exists() else None


def lade_daten(p):
    t = pathlib.Path(p).read_text(encoding="utf-8"); return json.loads(t[t.index("["):t.rindex("]") + 1])


def lade_smart(p):
    t = pathlib.Path(p).read_text(encoding="utf-8"); return json.loads(t[t.index("{"):t.rindex("}") + 1])


def modul():
    spec = importlib.util.spec_from_file_location("bau28", BAU); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


A8 = ["paket3/out/master_3818_aktuell.csv", "paket3/out/master_nachtraege_protokoll.csv", "eingang", "scripts", "daten",
      "paket19", "paket22", "paket25/website", "paket25/scripts", "paket27", "paket22/website/app-v43.js"]


def a8_stand():
    h = {}
    for a in A8:
        p = R / a
        if p.is_file(): h[a] = sha(p.read_bytes())
        elif p.is_dir(): h[a] = sha(json.dumps(baum(p), sort_keys=True).encode())
        else: h[a] = None
    return h


VOR = a8_stand()
git_vor = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all"], capture_output=True, text=True, cwd=R).stdout
T = pathlib.Path(tempfile.mkdtemp(prefix="p28test-"))
try:
    REL = T / "rel"
    b = bau(S0, REL)
    if b.returncode: sys.exit("Bau fehlgeschlagen: " + b.stderr + b.stdout)
    web = REL / "website"
    skripte = re.findall(r'<script src="([^"]+)"></script>', (web / "index.html").read_text(encoding="utf-8"))
    nd, ns = skripte[0], skripte[1]
    daten, smart = lade_daten(web / nd), lade_smart(web / ns)
    p27d, p27s = lade_daten(R / "paket27/website/data-p27.js"), json.loads((R / "paket27/out/smart-search-data-p27.json").read_text(encoding="utf-8"))
    m = modul()

    # P01 Auswahl
    subprocess.run([sys.executable, "-I", str(R / "scripts/sichtbarkeit.py"), S0, "--out", str(T / "sb")], check=True, capture_output=True, cwd=R)
    sb = [z["id"] for z in csv.DictReader(open(T / "sb" / f"sichtbarkeit_{S0}.csv", encoding="utf-8")) if z["sichtbar"] == "JA"]
    by27 = {o["id"]: o for o in p27d}
    gleich = all(o == m.ohne_felder(by27[o["id"]], m.FELDER_WEG) for o in daten)
    ok = [o["id"] for o in daten] == sb == list(smart["byId"]) and gleich and smart["meta"]["rosterCount"] == len(daten) == len(smart["byId"])
    meta_ok = {k: v for k, v in smart["meta"].items() if k != "rosterCount"} == {k: v for k, v in p27s["meta"].items() if k != "rosterCount"}
    check("P01", f"Auswahl: IDs Daten = Smart = sichtbar laut sichtbarkeit.py am {S0} ({len(sb)}), Master-Reihenfolge; Datensätze = data-p27.js ohne A2; rosterCount = {len(daten)}; übrige meta gleich",
          ok and meta_ok, f"Datensätze gleich {gleich}, meta {meta_ok}")

    # P04 Felder A2
    app = (R / "paket22/website/app-v43.js").read_text(encoding="utf-8")
    andere = {f: len(re.findall(rf"\b{re.escape(f.split('.')[-1])}\b", app)) for f in m.FELDER_WEG}
    try: m.pruefe_felder(m.FELDER_WEG, app); frei = True
    except m.Abbruch: frei = False
    weg_da = any(k in o for o in daten for k in ("country", "reviewAfter", "release_origin", "publicationReason")) or any("markt" in o["laender"] for o in daten)
    f1 = bau(S0, T / "f_title", "--felder-weg", "title")
    f2 = bau(S0, T / "f_land", "--felder-weg", "laender.ortLand")
    f3 = bau(S0, T / "f_fokus", "--felder-weg", "focus")
    fehl_ok = all(x.returncode and "A2: app-v43.js liest" in x.stdout + x.stderr for x in (f1, f2, f3)) and not any((T / n).exists() for n in ("f_title", "f_land", "f_fokus"))
    check("P04", "Felder A2: kein Feld der Liste wird von app-v43.js gelesen und keines steht im Release; Fehlfälle title, laender.ortLand, focus (über offer[key]) → Abbruch, kein Ziel",
          frei and not weg_da and fehl_ok and andere == {"country": 17, "reviewAfter": 0, "release_origin": 0, "publicationReason": 0, "laender.markt": 0},
          f"Namen sonst in app-v43.js (anderer Name, nicht Angebotsfeld): {andere}")

    # P05 Smart A3
    weg, amount_weg, nicht_leer = {}, 0, 0
    for k, r in smart["byId"].items():
        a = p27s["byId"][k]
        for kk, v in a["delivery"].items():
            if kk not in r["delivery"]:
                weg["delivery." + kk] = weg.get("delivery." + kk, 0) + 1; nicht_leer += not m.leer(v); nicht_leer += kk not in m.WEG_DELIVERY
            elif r["delivery"][kk] != v: nicht_leer += 1
        po_a, po_r = a["priceOptions"], r.get("priceOptions", [])
        if len(po_a) != len(po_r): nicht_leer += 1; continue
        for pa, pr in zip(po_a, po_r):
            for kk, v in pa.items():
                if kk not in pr:
                    weg["priceOptions." + kk] = weg.get("priceOptions." + kk, 0) + 1
                    nicht_leer += not m.leer(v); nicht_leer += kk not in m.WEG_PREIS; amount_weg += kk == "amount"
                elif pr[kk] != v: nicht_leer += 1
        if {k2 for k2 in r} - {"delivery", "priceOptions"} and {k2: r[k2] for k2 in r if k2 not in ("delivery", "priceOptions")} != {k2: a[k2] for k2 in a if k2 not in ("delivery", "priceOptions")}: nicht_leer += 1
    leer_po = sum(1 for r in smart["byId"].values() if "priceOptions" not in r)
    check("P05", "Smart A3: nur leere Teilfelder aus der Leseliste U3 weggelassen, «amount» nie, übrige Werte unverändert; Gleichheit der Suche siehe P03",
          nicht_leer == 0 and amount_weg == 0 and weg, f"weggelassen {dict(sorted(weg.items()))}; priceOptions ganz weg {leer_po}")

    # P06 Stichtag und Abbruch
    heute = datetime.datetime.now(datetime.timezone.utc).astimezone(m.ZH).date()
    morgen, gestern = heute + datetime.timedelta(days=1), heute - datetime.timedelta(days=1)
    r_m = bau(morgen.isoformat(), T / "s_morgen")
    r_h = bau(heute.isoformat(), T / "s_heute")
    r_g = bau(gestern.isoformat(), T / "s_gestern")
    utc = {"TZ": "UTC"}
    r_2359 = bau("2026-11-23", T / "s_2359", "--jetzt", "2026-11-22T22:59:00+00:00", env=utc)   # 23:59 in Zürich, 22.11.
    r_0001 = bau("2026-11-23", T / "s_0001", "--jetzt", "2026-11-22T23:01:00+00:00", env=utc)   # 00:01 in Zürich, 23.11.
    stich_ok = (r_m.returncode and not (T / "s_morgen").exists() and not r_h.returncode and not r_g.returncode
                and r_2359.returncode and "2026-11-23 liegt nach dem heutigen Tag 2026-11-22" in r_2359.stdout + r_2359.stderr
                and not r_0001.returncode)
    # Fehler nach Schreibschritten: Ziel mit altem Inhalt bleibt bytegleich, kein Zwischenordner
    ziel = T / "z" / "release"; shutil.copytree(REL, ziel); vor = baum(ziel)
    git_a = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all"], capture_output=True, text=True, cwd=R).stdout
    rf = [bau(S0, ziel, "--fehler-nach", s) for s in ("generator", "liste")]
    git_b = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all"], capture_output=True, text=True, cwd=R).stdout
    rest = [p.name for p in (T / "z").iterdir() if p.name != "release"]
    fehl_ok = all(x.returncode and "künstlicher Fehler" in x.stdout + x.stderr for x in rf) and baum(ziel) == vor and not rest and git_a == git_b
    (T / "z2").mkdir(); leer_ziel = T / "z2" / "neu"; rl = bau(S0, leer_ziel, "--fehler-nach", "liste")
    fehl_ok = fehl_ok and rl.returncode and not leer_ziel.exists() and not list((T / "z2").iterdir())
    check("P06", f"Stichtag: morgen ({morgen}) Abbruch, heute und gestern baut; TZ=UTC: 23:59 Zürich mit Stichtag 23.11. Abbruch, 00:01 baut; Fehler nach Generator und nach Listenbau: Ziel und Repo bytegleich, kein Zwischenordner",
          bool(stich_ok and fehl_ok), f"Codes morgen {r_m.returncode}, heute {r_h.returncode}, gestern {r_g.returncode}, 23:59 {r_2359.returncode}, 00:01 {r_0001.returncode}; Rest {rest}")

    # P06b Ziel-Schutz (Gegenprüfung B1, H3, H4)
    fremd = T / "fremd"; fremd.mkdir(); (fremd / "wichtig.txt").write_text("x"); vor_f = baum(fremd)
    datei = T / "datei.txt"; datei.write_text("y")
    zfaelle = {"Repo": R.parent, "claude-work": R, "paket28": R / "paket28", "Ordner darüber": R.parent.parent, "fremder Ordner": fremd,
               "Datei": datei, "fehlender Elternordner": T / "nicht" / "da" / "rel"}
    zr = {n: bau(S0, z) for n, z in zfaelle.items()}
    ohne_env = subprocess.run([sys.executable, "-I", str(BAU), S0, str(T / "ohne_env"), "--jetzt", "2026-11-22T12:00:00+01:00"],
                              capture_output=True, text=True, cwd=R, env={k: v for k, v in os.environ.items() if k != "P28_TEST"})
    import signal, time
    (T / "sig").mkdir(); pr = subprocess.Popen([sys.executable, "-I", str(BAU), S0, str(T / "sig" / "rel")], cwd=R, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(1.5); pr.send_signal(signal.SIGTERM); pr.wait()
    sig_ok = pr.returncode != 0 and not list((T / "sig").iterdir())
    git_z = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all"], capture_output=True, text=True, cwd=R).stdout
    z_ok = (all(x.returncode and "ABBRUCH" in x.stdout + x.stderr for x in zr.values()) and baum(fremd) == vor_f and datei.read_text() == "y"
            and not (T / "nicht").exists() and ohne_env.returncode and "P28_TEST" in ohne_env.stdout + ohne_env.stderr and not (T / "ohne_env").exists()
            and sig_ok and git_z == git_vor and not [p.name for p in T.iterdir() if p.name.startswith((".tmp-p28-", ".alt-p28-"))])
    prot_t = json.loads((T / "s_0001" / "BAUPROTOKOLL.json").read_text(encoding="utf-8")).get("testoptionen")
    check("P06b", "Ziel-Schutz: Repo, claude-work, paket28, Ordner darüber, fremder Ordner, Datei, fehlender Elternordner → Abbruch, nichts geändert; Abbruch durch SIGTERM räumt auf; Testoptionen ohne P28_TEST=1 → Abbruch; gesetzte Testoptionen im Bauprotokoll",
          bool(z_ok) and prot_t == {"jetzt": "2026-11-22T23:01:00+00:00"}, "; ".join(f"{n} {x.returncode}" for n, x in zr.items()) + f"; SIGTERM {pr.returncode}, aufgeräumt {sig_ok}; Protokoll {prot_t}")

    # P07 Liste und Sitemap gegen Bau aus data-p27.js
    vw = T / "vgl/website"; vo = T / "vgl/out"; shutil.copytree(R / "paket22/website", vw); vo.mkdir()
    (vw / "data-p22.js").unlink(); shutil.copyfile(R / "paket27/website/data-p27.js", vw / "data-p27.js")
    env = dict(os.environ, TZ="Europe/Zurich", WEBSITE=str(vw), OUTDIR=str(vo), DATA="data-p27.js", SMART=str(R / "paket27/out/smart-search-data-p27.json"))
    subprocess.run(["node", str(R / "paket25/scripts/build_liste_p25.js"), S0], env=env, check=True, capture_output=True, cwd=R)
    idx = (web / "index.html").read_text(encoding="utf-8")
    zurueck = idx.replace(f'src="{nd}"', 'src="data-a1-86ff68ddc9ac.js"').replace(f'src="{ns}"', 'src="smart-search-data-a1-a38a2a2b2391.js"').replace('src="app-v43.js"', 'src="app-v33.js"')
    gleich_idx = zurueck == (vw / "index.html").read_text(encoding="utf-8")
    gleich_map = (web / "sitemap.xml").read_bytes() == (vw / "sitemap.xml").read_bytes()
    eins = idx.count("<!-- P19-LISTE -->") == 1 and idx.count("Stand der Angaben:") == 1
    vl = bau(S0, T / "f_vorlage", "--vorlage", str(R / "paket27/website/index.html"))
    check("P07", "Liste und Sitemap: index.html (Liste, «Stand der Angaben») und sitemap.xml gleich wie aus data-p27.js am selben Stichtag bis auf die drei Skriptnamen; genau ein Listenblock und ein «Stand der Angaben»; Vorlage mit Liste → Abbruch",
          gleich_idx and gleich_map and eins and vl.returncode and "Vorlage" in vl.stdout + vl.stderr and not (T / "f_vorlage").exists(),
          f"index {gleich_idx}, sitemap {gleich_map}, einmal {eins}")

    # P08 Dateinamen und Verdrahtung
    name_ok = nd == f"daten-{sha((web / nd).read_bytes())[:12]}.js" and ns == f"suche-{sha((web / ns).read_bytes())[:12]}.js"
    reihen = skripte == [nd, ns, "app-v43.js"]
    alt = [h.name for h in web.glob("*.html") if re.search(r"data-a1-|smart-search-data|app-v33|data-p\d", h.read_text(encoding="utf-8"))]
    refs_ok = all((web / r).is_file() for h in web.glob("*.html") for r in re.findall(r'(?:src|href)="([^"#:?]+\.(?:js|css|html|xml|txt))"', h.read_text(encoding="utf-8")))
    dateien = sorted(p.name for p in web.iterdir())
    erwartet = sorted(["404.html", "SHA256SUMS.txt", "app-v43.js", nd, "datenschutz.html", "impressum.html", "index.html", "methodik.html",
                       "robots.txt", "sitemap.xml", "styles-v22.css", "styles-v24.css", ns])
    sums = dict(reversed(l.split("  ")) for l in (web / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines())
    sums_ok = all(sha((web / k).read_bytes()) == v for k, v in sums.items()) and set(sums) == set(dateien) - {"SHA256SUMS.txt"}
    # Fehlfälle über eine geänderte Vorlage (Prüfsumme der Vorlage im Modul angepasst, sonst greift die Vorlagen-Prüfung zuerst)
    vor_txt = (R / "paket22/website/index.html").read_text(encoding="utf-8")
    fehlfaelle = {"fehlender Verweis": vor_txt.replace('<script src="app-v33.js"></script>', ""),
                  "falscher Verweis": vor_txt.replace('<link rel="stylesheet" href="styles-v24.css">', '<link rel="stylesheet" href="styles-v99.css">')}
    grund = {"fehlender Verweis": 'Verweis src="app-v33.js" nicht genau einmal', "falscher Verweis": "Verweis styles-v99.css fehlt im Paket"}
    ff = {}
    for name, txt in fehlfaelle.items():
        vp = T / f"vorlage_{len(ff)}.html"; vp.write_text(txt, encoding="utf-8")
        code = (f"import sys,runpy,hashlib; sys.argv=['b','{S0}','{T / ('ff' + str(len(ff)))}','--vorlage','{vp}'];"
                f"import importlib.util as u; s=u.spec_from_file_location('b','{BAU}'); m=u.module_from_spec(s); s.loader.exec_module(m);"
                f"m.VORLAGE_SHA=hashlib.sha256(open('{vp}','rb').read()).hexdigest(); m.main()")
        x = subprocess.run([sys.executable, "-I", "-B", "-c", code], capture_output=True, text=True, cwd=R, env=dict(os.environ, P28_TEST="1"))
        ff[name] = bool(x.returncode and grund[name] in x.stdout + x.stderr and not (T / ("ff" + str(len(ff)))).exists())
    check("P08", f"Dateinamen = Kürzel des Inhalts ({nd}, {ns}); index.html lädt genau {skripte}; keine alten Daten-/App-Verweise; jeder Verweis aller Seiten im Paket; genau 13 Dateien + SHA256SUMS stimmt; Fehlfälle fehlender und falscher Verweis → Abbruch",
          name_ok and reihen and not alt and refs_ok and dateien == erwartet and sums_ok and all(ff.values()), f"alt {alt}; Fehlfälle {ff}")

    # P09 Versionsnamen
    soll = {"app-v43.js": R / "paket19/website/app-v43.js", "styles-v22.css": R / "live-snapshot-20261109/styles-v22.css",
            "styles-v24.css": R / "live-snapshot-20261109/styles-v24.css"}
    live19 = {"app-v43.js": "ada38d5ed342572b2b3e0daa476d9e6b4186426841047fb9a1655a6663789020",
              "styles-v22.css": "a64f96337d2d411561719efbb5911c7e57bb3e873d5a4af4ca6c77cd708c5c52",
              "styles-v24.css": "a957516ccc2d22ba2a343cb37b58d855e0c0a9b85ac6dbd59b7f6dea709e8308"}
    v_ok = all(sha((web / k).read_bytes()) == sha(p.read_bytes()) == live19[k] for k, p in soll.items())
    check("P09", "Versionsnamen: app-v43.js, styles-v22.css, styles-v24.css bytegleich mit dem Release Paket 19 (live seit 20.11., V01)", v_ok)

    # P11 Inhalt htaccess.txt
    live = (R / "paket28/config/htaccess_live_20261122.txt").read_bytes()
    hta = (REL / "htaccess.txt").read_bytes()
    block = (R / "paket28/config/cache_block.txt").read_bytes()
    h_ok = (sha(live) == "6d8a0c142c0b343841460da41f64158e31271f880cca191e82bf061cd263db1d" and hta == live + b"\n" + block
            and all(c < 128 for c in hta) and b"\r" not in hta and hta.endswith(b"\n"))
    check("P11a", "htaccess.txt = gelesene Live-.htaccess (891 Byte, 6d8a0c14…) + Zeilenende + nur der Cache-Block; ASCII, LF", h_ok, f"{len(hta)} Byte")

    # P13 Grösse
    prot = json.loads((REL / "BAUPROTOKOLL.json").read_text(encoding="utf-8"))
    tot = sum(p.stat().st_size for p in web.iterdir())
    p27_d, p27_s = (R / "paket27/website/data-p27.js").stat().st_size, len((SPRE + (R / "paket27/out/smart-search-data-p27.json").read_text(encoding="utf-8") + ";\n").encode())
    g_ok = (tot <= 9 * 1024 * 1024 and (web / nd).stat().st_size < p27_d and (web / ns).stat().st_size < p27_s
            and prot["website_byte"] == tot and prot["vorher_p27"]["data-p27.js"]["byte"] == p27_d and set(prot["dateien"]) == set(sums))
    check("P13", f"Grösse: website/ {tot} Byte ≤ 9 MB; Daten {(web / nd).stat().st_size} < {p27_d}, Smart {(web / ns).stat().st_size} < {p27_s}; Bauprotokoll vollständig", g_ok)

    # P14 Reproduzierbarkeit
    r2 = bau(S0, T / "rel2")
    check("P14", "Reproduzierbarkeit: zweiter Bau mit gleichem Stichtag in frischem Ordner bytegleich (website/, htaccess.txt, Bauprotokoll)",
          not r2.returncode and baum(REL) == baum(T / "rel2"))
finally:
    shutil.rmtree(T, ignore_errors=True)

# P15 Unverändert
nach = a8_stand()
git_nach = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all"], capture_output=True, text=True, cwd=R).stdout
check("P15a", "A8 per SHA-256 vorher = nachher (Master, Protokoll, Eingang, scripts, daten, paket19, paket22, paket25/website und scripts, paket27); git status unverändert",
      VOR == nach and git_vor == git_nach, "; ".join(k for k in VOR if VOR[k] != nach[k]))
json.dump(ERG, open(R / f"paket28/out/test_paket28_{S0}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
n = lambda s: sum(e["status"] == s for e in ERG)
print(f"\n{n('PASS')} PASS · {n('FAIL')} FAIL")
sys.exit(1 if n("FAIL") else 0)
