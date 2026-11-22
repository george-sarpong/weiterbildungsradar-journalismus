"""Paket 28 «Schlanke Auslieferung» (SPEZIFIKATION_PAKET28_20261122.md A1–A7; E172, E176, E225–E233): Release-Bau.
Baut ein hochladbares Release aus dem Generator, nur bauen, nicht hochladen (Upload nur mit eigener Freigabe, E227).
Ziel/website/   = Hauptordner nach dem Upload (ohne .ftpquota und .htaccess, die auf dem Server bleiben, E146):
                  index.html (Liste, «Stand der Angaben»), 4 Seiten, app-v43.js, styles-v22.css, styles-v24.css,
                  daten-<hash>.js, suche-<hash>.js, robots.txt, sitemap.xml, SHA256SUMS.txt
Ziel/htaccess.txt = gelesener Live-Inhalt (U4) + Cache-Block (A5); der Owner benennt sie auf dem Server um (E146)
Ziel/BAUPROTOKOLL.json = A7 (wird nicht hochgeladen)
- A1 nur Angebote, die scripts/sichtbarkeit.py am Build-Stichtag als sichtbar meldet, Master-Reihenfolge (E172, E194);
  Stichtag ≤ heute in Europe/Zurich, sonst Abbruch (B06).
- A2 ungenutzte Felder weg (FELDER_WEG); Abbruch, wenn app-v43.js eines davon liest (P04).
- A3 Smart ohne Leerwerte (null, «», [], {}) nur bei Teilfeldern der Leseliste U3 (WEG_DELIVERY, WEG_PREIS);
  `amount` bleibt (Z. 1378 Number(option.amount) ohne Prüfung); leeres priceOptions entfällt; meta.rosterCount = n (B01).
- A4 Namen daten-<12 Zeichen SHA-256>.js, suche-<12 Zeichen SHA-256>.js; App und CSS mit Versionsnamen unverändert.
- A6 Bau im temporären Ordner neben dem Ziel; erst nach allen Prüfungen ersetzt er das Ziel. Bei einem Fehler bleiben
  Ziel und Repo bytegleich, kein Zwischenordner (B05). Kein Rückweg (E173).
Unverändert benutzt: scripts/generator_website.py, scripts/sichtbarkeit.py, paket25/scripts/build_liste_p25.js, app-v43.js.
Aufruf (aus claude-work/): NODE_PATH=<nm> python3 -I paket28/scripts/build_release_p28.py JJJJ-MM-TT <Ziel>
Ziel: neuer Ordner in einem vorhandenen Ordner oder ein früheres Release (genau BAUPROTOKOLL.json, htaccess.txt, website/);
nie das Repo selbst, ein Ordner darüber oder ein Ordner im Repo ausserhalb von paket28/out/ (Gegenprüfung B1).
Nur für Tests und nur mit P28_TEST=1: --jetzt <ISO-Zeit mit Zone> (statt der Systemuhr), --felder-weg <a,b>,
--vorlage <index.html>, --fehler-nach <generator|liste> (künstlicher Fehler nach diesem Schreibschritt, P06);
gesetzte Testoptionen stehen im Bauprotokoll (Gegenprüfung H4)."""
import argparse, datetime, gzip, hashlib, importlib.util, json, os, pathlib, re, shutil, signal, subprocess, sys, tempfile
from zoneinfo import ZoneInfo

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]                     # claude-work/
ZH = ZoneInfo("Europe/Zurich")
PRE = "window.WEITERBILDUNGSRADAR_OFFERS = "
SPRE = "window.MEDIA_SKILLS_SMART_DATA = "
VORLAGE = R / "paket22/website/index.html"
VORLAGE_SHA = "9de6bdab8d6f40e3b42c521da326244bff12665f8feec96497071a5a69bfad02"
SEITEN = ("404.html", "datenschutz.html", "impressum.html", "methodik.html", "robots.txt")
APP = R / "paket22/website/app-v43.js"
CSS = (R / "live-snapshot-20261109/styles-v22.css", R / "live-snapshot-20261109/styles-v24.css")
HTACCESS_LIVE = R / "paket28/config/htaccess_live_20261122.txt"
HTACCESS_LIVE_SHA = "6d8a0c142c0b343841460da41f64158e31271f880cca191e82bf061cd263db1d"
CACHE_BLOCK = R / "paket28/config/cache_block.txt"
VERWEISE = (('src="data-a1-86ff68ddc9ac.js"', "daten"), ('src="smart-search-data-a1-a38a2a2b2391.js"', "suche"),
            ('src="app-v33.js"', "app"))
FELDER_WEG = ("country", "reviewAfter", "release_origin", "publicationReason", "laender.markt")      # A2
# A3, Leseliste U3 (Bericht P28 §2): Teilfelder, die app-v43.js nie oder nur mit Ersatzwert liest
WEG_DELIVERY = {"channels", "evidenceTier", "materialisationStatus", "scheduleSummary", "sourceText", "structure",
                "temporalSummary", "variants"}
WEG_PREIS = {"amountType", "billingBasis", "billingCount", "components", "currency", "deliveryVariantRefs",
             "eligibilityType", "eligibilityValue", "maxAmount", "minAmount", "priceScope", "tariffClass",
             "tariffLabel", "taxMode", "taxRate", "validFrom", "validThrough"}                    # ohne «amount»
MAX_BYTE = 9 * 1024 * 1024
RELEASE_INHALT = {"BAUPROTOKOLL.json", "htaccess.txt", "website"}


class Abbruch(Exception):
    pass


def leer(v): return v is None or v == "" or v == [] or v == {}


def sha(b): return hashlib.sha256(b).hexdigest()


def gz(b): return len(gzip.compress(b, 6, mtime=0))


def app_liest(app_text):
    """Feldnamen, die die App aus einem Angebot liest: offer.x, laender(offer).x und offer[key] über die Filterhelfer."""
    direkt = set(re.findall(r"\boffer\??\.([A-Za-z_]\w*)", app_text))
    land = set(re.findall(r"laender\(offer\)\??\.([A-Za-z_]\w*)", app_text))
    schluessel = set(re.findall(r"\b(?:orderedValues|tokenValues|uniqueSorted)\(\s*\"(\w+)\"", app_text))
    return direkt | schluessel, land


def pruefe_felder(felder, app_text):
    direkt, land = app_liest(app_text)
    for f in felder:
        if f.startswith("laender."):
            if f.split(".", 1)[1] in land: raise Abbruch(f"A2: app-v43.js liest {f}")
        elif f in direkt or re.search(rf"\[\s*[\"']{re.escape(f)}[\"']\s*\]", app_text):
            raise Abbruch(f"A2: app-v43.js liest {f}")


def ohne_felder(o, felder):
    o = {k: v for k, v in o.items() if k not in felder}
    lw = {f.split(".", 1)[1] for f in felder if f.startswith("laender.")}
    if lw: o["laender"] = {k: v for k, v in o["laender"].items() if k not in lw}
    return o


def smart_schlank(r, bericht):
    r = dict(r)
    d = {}
    for k, v in r["delivery"].items():
        if leer(v) and k in WEG_DELIVERY: bericht["delivery." + k] = bericht.get("delivery." + k, 0) + 1; continue
        d[k] = v
    r["delivery"] = d
    po = []
    for p in r.get("priceOptions", []):
        q = {}
        for k, v in p.items():
            if leer(v) and k in WEG_PREIS: bericht["priceOptions." + k] = bericht.get("priceOptions." + k, 0) + 1; continue
            q[k] = v
        po.append(q)
    if po: r["priceOptions"] = po
    else: r.pop("priceOptions", None); bericht["priceOptions (leer)"] = bericht.get("priceOptions (leer)", 0) + 1
    return r


def lade_modul(name, pfad):
    spec = importlib.util.spec_from_file_location(name, pfad)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


def baue(stichtag, tmp, a):
    web, aus = tmp / "website", tmp / "bau"
    web.mkdir(); aus.mkdir()
    # 1 Vorlage und Seiten
    vorlage = pathlib.Path(a.vorlage)
    if sha(vorlage.read_bytes()) != VORLAGE_SHA: raise Abbruch(f"Vorlage {vorlage} hat nicht SHA-256 {VORLAGE_SHA[:12]}…")
    shutil.copyfile(vorlage, web / "index.html")
    for f in SEITEN: shutil.copyfile(R / "paket22/website" / f, web / f)
    shutil.copyfile(APP, web / "app-v43.js")
    for c in CSS: shutil.copyfile(c, web / c.name)
    app_text = APP.read_text(encoding="utf-8")
    pruefe_felder(a.felder_weg, app_text)
    # 2 Generator (unverändert), alle 1'353 als Vergleichsstand
    g = subprocess.run([sys.executable, "-I", str(R / "scripts/generator_website.py"), "--daten", str(aus / "data-voll.js"),
                        "--smart", str(aus / "smart-voll.json")], capture_output=True, text=True)
    if g.returncode: raise Abbruch("Generator: " + (g.stderr or g.stdout).strip())
    if a.fehler_nach == "generator": raise Abbruch("künstlicher Fehler nach dem Generator (Test P06)")
    dtext = (aus / "data-voll.js").read_text(encoding="utf-8")
    if not dtext.startswith(PRE) or not dtext.endswith(";\n"): raise Abbruch("Datendatei des Generators unerwartet")
    daten = json.loads(dtext[len(PRE):-2])
    smart = json.loads((aus / "smart-voll.json").read_text(encoding="utf-8"))
    # 3 Auswahl A1 (Sichtbarkeit wie die App, berechnet am Stichtag)
    sb = lade_modul("sichtbarkeit", R / "scripts/sichtbarkeit.py")
    t = datetime.date.fromisoformat(stichtag)
    sichtbar = [z["id"] for z in sb.lies_master(R / "paket3/out/master_3818_aktuell.csv") if sb.sichtbar(z, t)]
    S = set(sichtbar)
    auswahl = [o for o in daten if o["id"] in S]
    if [o["id"] for o in auswahl] != sichtbar: raise Abbruch("A1: Reihenfolge oder Menge der sichtbaren IDs ≠ Datendatei")
    # 4 A2 / A3
    auswahl2 = [ohne_felder(o, a.felder_weg) for o in auswahl]
    weg = {}
    by = {k: smart_schlank(v, weg) for k, v in smart["byId"].items() if k in S}
    if list(by) != sichtbar: raise Abbruch("A1: IDs der Smart-Datei ≠ Datendatei")
    meta = dict(smart["meta"]); meta["rosterCount"] = len(auswahl2)
    dneu = (PRE + json.dumps(auswahl2, ensure_ascii=False) + ";\n").encode()
    sjson = json.dumps({"meta": meta, "byId": by}, ensure_ascii=False)
    sneu = (SPRE + sjson + ";\n").encode()
    if meta["rosterCount"] != len(by): raise Abbruch("rosterCount ≠ Zahl der Datensätze")
    # 5 A4 Namen
    nd, ns = f"daten-{sha(dneu)[:12]}.js", f"suche-{sha(sneu)[:12]}.js"
    (web / nd).write_bytes(dneu); (web / ns).write_bytes(sneu)
    (aus / "smart.json").write_text(sjson, encoding="utf-8")
    # 6 Liste, «Stand der Angaben», Sitemap (build_liste_p25.js unverändert)
    env = dict(os.environ, TZ="Europe/Zurich", WEBSITE=str(web), OUTDIR=str(aus), DATA=nd, SMART=str(aus / "smart.json"))
    lb = subprocess.run(["node", str(R / "paket25/scripts/build_liste_p25.js"), stichtag], env=env, capture_output=True, text=True)
    if lb.returncode: raise Abbruch("Listenbau: " + (lb.stderr or lb.stdout).strip()[-400:])
    if a.fehler_nach == "liste": raise Abbruch("künstlicher Fehler nach dem Listenbau (Test P06)")
    zp = json.loads((aus / f"zaehlprotokoll_{stichtag}.json").read_text(encoding="utf-8"))
    if zp["sichtbar"] != len(auswahl2) or zp["angebote"] != len(auswahl2):
        raise Abbruch(f"Listenbau: {zp['sichtbar']} Karten ≠ {len(auswahl2)} ausgelieferte Angebote")
    # 7 Skriptverweise zuletzt (B02)
    idx = (web / "index.html").read_text(encoding="utf-8")
    if idx.count("<!-- P19-LISTE -->") != 1 or idx.count("Stand der Angaben:") != 1:
        raise Abbruch("index.html: nicht genau ein Listenblock bzw. ein «Stand der Angaben»")
    ziel = {"daten": nd, "suche": ns, "app": "app-v43.js"}
    for alt, k in VERWEISE:
        if idx.count(alt) != 1: raise Abbruch(f"index.html: Verweis {alt} nicht genau einmal")
        idx = idx.replace(alt, f'src="{ziel[k]}"')
    (web / "index.html").write_text(idx, encoding="utf-8")
    skripte = re.findall(r'<script src="([^"]+)"></script>', idx)
    if skripte != [nd, ns, "app-v43.js"]: raise Abbruch(f"index.html lädt {skripte}")
    for h in web.glob("*.html"):
        for ref in re.findall(r'(?:src|href)="([^"#:?]+\.(?:js|css|html|xml|txt))"', h.read_text(encoding="utf-8")):
            if not (web / ref).is_file(): raise Abbruch(f"{h.name}: Verweis {ref} fehlt im Paket")
    # 8 htaccess.txt (A5)
    live = HTACCESS_LIVE.read_bytes()
    if sha(live) != HTACCESS_LIVE_SHA: raise Abbruch("htaccess_live: SHA-256 ≠ gelesener Live-Stand (U4)")
    hta = live + (b"" if live.endswith(b"\n") else b"\n") + CACHE_BLOCK.read_bytes()
    if any(b > 127 for b in hta) or b"\r" in hta: raise Abbruch("htaccess.txt: nur ASCII und LF")
    (tmp / "htaccess.txt").write_bytes(hta)
    # 9 Prüfsummen, Grösse
    dateien = sorted(p for p in web.iterdir())
    total = sum(p.stat().st_size for p in dateien)
    if total > MAX_BYTE: raise Abbruch(f"website/ {total} Byte > 9 MB")
    sums = {p.name: sha(p.read_bytes()) for p in dateien}
    (web / "SHA256SUMS.txt").write_text("".join(f"{v}  {k}\n" for k, v in sums.items()), encoding="utf-8")
    # 10 Bauprotokoll A7
    p27d, p27s = dtext.encode(), (SPRE + (aus / "smart-voll.json").read_text(encoding="utf-8") + ";\n").encode()
    blen = lambda ds: len((PRE + json.dumps(ds, ensure_ascii=False) + ";\n").encode())
    anteil = len(p27d) - blen([ohne_felder(o, a.felder_weg) for o in daten])
    je_feld = {f: blen(auswahl) - blen([ohne_felder(o, (f,)) for o in auswahl]) for f in a.felder_weg}
    s_ohne_a2 = len((SPRE + json.dumps({"meta": meta, "byId": {k: v for k, v in smart["byId"].items() if k in S}}, ensure_ascii=False) + ";\n").encode())
    prot = {"stichtag": stichtag, "generator_angebote": len(daten), "sichtbar_ausgeliefert": len(auswahl2),
            "dateien": {k: {"byte": (web / k).stat().st_size, "gzip": gz((web / k).read_bytes()), "sha256": v}
                        for k, v in sums.items()},
            "htaccess.txt": {"byte": len(hta), "sha256": sha(hta)},
            "vorher_p27": {"data-p27.js": {"byte": len(p27d), "gzip": gz(p27d), "sha256": sha(p27d)},
                           "smart-search-data-p27.js": {"byte": len(p27s), "gzip": gz(p27s), "sha256": sha(p27s)}},
            "nachher": {nd: {"byte": len(dneu), "gzip": gz(dneu)}, ns: {"byte": len(sneu), "gzip": gz(sneu)}},
            "felder_weg": list(a.felder_weg), "felder_weg_byte_alle_1353": anteil, "felder_weg_byte_je_feld_ausgeliefert": je_feld,
            "smart_teilfelder_weg": dict(sorted(weg.items())), "smart_byte_vor_a3": s_ohne_a2, "smart_byte_nach_a3": len(sneu),
            "testoptionen": a.testoptionen, "website_byte": total + (web / "SHA256SUMS.txt").stat().st_size,
            "liste": {"index_bytes": zp["index_bytes"], "lastmod": zp["lastmod"]}}
    (tmp / "BAUPROTOKOLL.json").write_text(json.dumps(prot, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    shutil.rmtree(aus)
    return prot


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("stichtag"); ap.add_argument("ziel")
    ap.add_argument("--jetzt"); ap.add_argument("--felder-weg", default=",".join(FELDER_WEG))
    ap.add_argument("--vorlage", default=str(VORLAGE)); ap.add_argument("--fehler-nach", choices=("generator", "liste"))
    a = ap.parse_args()
    a.testoptionen = {k: v for k, v in (("jetzt", a.jetzt), ("felder_weg", a.felder_weg if a.felder_weg != ",".join(FELDER_WEG) else None),
                      ("vorlage", a.vorlage if a.vorlage != str(VORLAGE) else None), ("fehler_nach", a.fehler_nach)) if v}
    if a.testoptionen and os.environ.get("P28_TEST") != "1": sys.exit("ABBRUCH: Testoptionen nur mit P28_TEST=1 (" + ", ".join(a.testoptionen) + ")")
    a.felder_weg = tuple(f for f in a.felder_weg.split(",") if f)
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", a.stichtag): sys.exit("ABBRUCH: Stichtag JJJJ-MM-TT")
    jetzt = datetime.datetime.fromisoformat(a.jetzt) if a.jetzt else datetime.datetime.now(datetime.timezone.utc)
    if jetzt.tzinfo is None: sys.exit("ABBRUCH: --jetzt braucht eine Zeitzone")
    heute = jetzt.astimezone(ZH).date()
    if datetime.date.fromisoformat(a.stichtag) > heute:
        sys.exit(f"ABBRUCH: Stichtag {a.stichtag} liegt nach dem heutigen Tag {heute} (Europe/Zurich)")
    ziel = pathlib.Path(a.ziel).resolve()
    repo, out = R.parent, (R / "paket28/out").resolve()
    if ziel == repo or ziel in repo.parents or (ziel.is_relative_to(repo) and not ziel.is_relative_to(out)) or ziel == out:
        sys.exit(f"ABBRUCH: Ziel {ziel} ist das Repo, ein Ordner darüber oder im Repo ausserhalb von paket28/out/")
    if not ziel.parent.is_dir(): sys.exit(f"ABBRUCH: Ordner {ziel.parent} fehlt")
    if ziel.exists() and not (ziel.is_dir() and not ziel.is_symlink() and {p.name for p in ziel.iterdir()} == RELEASE_INHALT):
        sys.exit(f"ABBRUCH: Ziel {ziel} existiert und ist kein früheres Release (erwartet genau {sorted(RELEASE_INHALT)})")
    for sig in (signal.SIGTERM, signal.SIGHUP): signal.signal(sig, lambda *_: sys.exit(1))   # Aufräumen auch bei kill (H1)
    tmp = pathlib.Path(tempfile.mkdtemp(prefix=".tmp-p28-", dir=ziel.parent)); os.chmod(tmp, 0o755)
    try:
        prot = baue(a.stichtag, tmp, a)
    except BaseException as e:
        shutil.rmtree(tmp, ignore_errors=True)
        if isinstance(e, Abbruch): sys.exit("ABBRUCH: " + str(e))
        raise
    alt = None
    if ziel.exists():
        alt = pathlib.Path(tempfile.mkdtemp(prefix=".alt-p28-", dir=ziel.parent)); os.rmdir(alt); os.replace(ziel, alt)
    os.replace(tmp, ziel)
    if alt: shutil.rmtree(alt)
    print(f"OK Release {a.stichtag}: {prot['sichtbar_ausgeliefert']} Angebote; website/ "
          f"{round(prot['website_byte'] / 1048576, 2)} MB; " + ", ".join(f"{k} {v['byte']}" for k, v in prot["nachher"].items()))


if __name__ == "__main__":
    main()
