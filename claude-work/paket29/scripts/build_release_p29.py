"""Paket 29 «Website-Architektur» (SPEZIFIKATION_PAKET29_20261123.md §4 A1, A5, §7 V1, V4; E241, E246, E247, E248): Release-Bau.
= Release-Bau P28 (paket28/scripts/build_release_p28.py, Schritte 1–4 und 6–10 unverändert) + Aufteilung nach release_markt.
Nur bauen, nicht hochladen (Upload nur mit eigener Freigabe, E227).
Ziel/website/   = index.html (Liste, «Stand der Angaben»), 4 Seiten, app-v44.js, styles-v22.css, styles-v24.css,
                  je Markt daten-<hash>.js und suche-<hash>.js, robots.txt, sitemap.xml, SHA256SUMS.txt
Ziel/htaccess.txt = bytegleich mit Release P28 (E246; = Live-.htaccess seit E239), Ziel/BAUPROTOKOLL.json (Markt je Datei)
- Auswahl, Feldliste, Smart ohne Leerwerte, meta wie P28 (A1–A3 P28); App app-v44.js (port_p29.py, A2, A3, E248).
- Aufteilung (A1, E247, V1): Märkte in Ladereihenfolge CH, dann übrige alphabetisch nach ISO-Code; je Markt Master-Reihenfolge.
  Datendatei: hängt an window.WEITERBILDUNGSRADAR_OFFERS an, setzt window.MEDIA_SKILLS_KATALOG.soll ({Markt: Anzahl}, in allen
  Datendateien gleich) und meldet zuletzt ihren Markt in MEDIA_SKILLS_KATALOG.daten. Smart-Datei: legt
  window.MEDIA_SKILLS_SMART_DATA mit meta an, falls nicht vorhanden (meta in allen Dateien gleich, wird nie überschrieben),
  fügt ihre Einträge in byId ein und meldet zuletzt ihren Markt in MEDIA_SKILLS_KATALOG.suche.
  Namen daten-<12 Zeichen SHA-256>.js, suche-<…>.js wie P28 (E246). Markt ohne sichtbares Angebot: keine Datei.
- Abbruch, nichts geschrieben: doppelte id im Master; release_markt leer oder nicht in scripts/iso3166_alpha2.csv (geprüft
  über alle Master-Zeilen, siehe pruefe_master); ungleiches meta; Smart-Eintrag ohne Angebot oder umgekehrt; Datensatz doppelt oder fehlend
  nach der Aufteilung.
- Meldung (kein Abbruch, P07): Durchführungsland ohne deutschen Namen in app-v44.js (COUNTRY_NAMES), Filter zeigt ISO-Code.
Aufruf (aus claude-work/): NODE_PATH=<nm> python3 -I paket29/scripts/build_release_p29.py JJJJ-MM-TT <Ziel>
Ziel: neuer Ordner in einem vorhandenen Ordner oder ein früheres Release (genau BAUPROTOKOLL.json, htaccess.txt, website/);
nie das Repo selbst, ein Ordner darüber oder ein Ordner im Repo ausserhalb von paket29/out/.
Nur für Tests und nur mit P29_TEST=1 (V4): --jetzt <ISO-Zeit mit Zone>, --felder-weg <a,b>, --vorlage <index.html>,
--master <csv>, --fehler-nach <generator|aufteilung|liste>; gesetzte Testoptionen stehen im Bauprotokoll."""
import argparse, csv, datetime, gzip, hashlib, importlib.util, json, os, pathlib, re, shutil, signal, subprocess, sys, tempfile
from zoneinfo import ZoneInfo

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]                     # claude-work/
ZH = ZoneInfo("Europe/Zurich")
P28 = None                                                           # Modul paket28/scripts/build_release_p28.py (Hilfsfunktionen)
PRE = "window.WEITERBILDUNGSRADAR_OFFERS = "
SPRE = "window.MEDIA_SKILLS_SMART_DATA = "
VORLAGE = R / "paket22/website/index.html"
VORLAGE_SHA = "9de6bdab8d6f40e3b42c521da326244bff12665f8feec96497071a5a69bfad02"
SEITEN = ("404.html", "datenschutz.html", "impressum.html", "methodik.html", "robots.txt")
APP = R / "paket29/website/app-v44.js"
APP_SHA = "a417dff1c571c3081e77b9268c0407f3a06aaba741230c151fbdeffaec226519"   # = Ausgabe von paket29/scripts/port_p29.py
CSS = (R / "live-snapshot-20261109/styles-v22.css", R / "live-snapshot-20261109/styles-v24.css")
HTACCESS_P28 = R / "paket28/out/release_20261123/htaccess.txt"
MASTER = R / "paket3/out/master_3818_aktuell.csv"
ISO = R / "scripts/iso3166_alpha2.csv"
VERWEISE = ('<script src="data-a1-86ff68ddc9ac.js"></script>', '<script src="smart-search-data-a1-a38a2a2b2391.js"></script>',
            '<script src="app-v33.js"></script>')
MAX_BYTE = 9 * 1024 * 1024
RELEASE_INHALT = {"BAUPROTOKOLL.json", "htaccess.txt", "website"}
KAT = "window.MEDIA_SKILLS_KATALOG"


class Abbruch(Exception):
    pass


def sha(b): return hashlib.sha256(b).hexdigest()


def gz(b): return len(gzip.compress(b, 6, mtime=0))


def lade_modul(name, pfad):
    spec = importlib.util.spec_from_file_location(name, pfad)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


def js(v): return json.dumps(v, ensure_ascii=False)


def datendatei(markt, saetze, soll):
    return (f"{KAT} = {KAT} || {{}};\n{KAT}.soll = {js(soll)};\n"
            f"{PRE}({PRE.split(' = ')[0]} || []).concat({js(saetze)});\n"
            f"({KAT}.daten = {KAT}.daten || {{}})[{js(markt)}] = {len(saetze)};\n").encode()


def smartdatei(markt, meta, eintraege):
    return (f"{SPRE}{SPRE.split(' = ')[0]} || {{\"meta\": {js(meta)}, \"byId\": {{}}}};\n"
            f"Object.assign({SPRE.split(' = ')[0]}.byId, {js(eintraege)});\n"
            f"{KAT} = {KAT} || {{}};\n({KAT}.suche = {KAT}.suche || {{}})[{js(markt)}] = {len(eintraege)};\n").encode()


def pruefe_master(master_zeilen, iso):
    """V1 vor der Auswahl: doppelte id; release_markt leer oder nicht ISO. Geprüft über alle Master-Zeilen, weil eine Zeile ohne
    gültigen Markt nach scripts/sichtbarkeit.py nie sichtbar ist und sonst still verschwände (Bericht P29: «sichtbare Zeile» in
    §7 V1 ist so nicht erreichbar)."""
    ids, doppelt = set(), set()
    for z in master_zeilen:
        if z["id"] in ids: doppelt.add(z["id"])
        ids.add(z["id"])
    if doppelt: raise Abbruch(f"V1: doppelte id im Master: {sorted(doppelt)[:5]}")
    for z in master_zeilen:
        if not z["release_markt"]: raise Abbruch(f"V1: release_markt leer ({z['id']})")
        if z["release_markt"] not in iso: raise Abbruch(f"V1: release_markt «{z['release_markt']}» nicht in scripts/iso3166_alpha2.csv ({z['id']})")


def aufteilen(master_zeilen, sichtbar, auswahl2, by, meta, iso):
    """V1: Marktzuordnung und Prüfungen; gibt [(markt, saetze, eintraege)] in Ladereihenfolge (E247)."""
    ids = [z["id"] for z in master_zeilen]
    doppelt = sorted({i for i in ids if ids.count(i) > 1}) if len(set(ids)) != len(ids) else []
    if doppelt: raise Abbruch(f"V1: doppelte id im Master: {doppelt[:5]}")
    markt = {z["id"]: z["release_markt"] for z in master_zeilen}
    for i in sichtbar:
        m = markt.get(i, "")
        if not m: raise Abbruch(f"V1: release_markt leer bei sichtbarer Zeile {i}")
        if m not in iso: raise Abbruch(f"V1: release_markt «{m}» nicht in scripts/iso3166_alpha2.csv ({i})")
    if [o["id"] for o in auswahl2] != sichtbar or list(by) != sichtbar:
        raise Abbruch("V1: Smart-Eintrag ohne Angebot oder Angebot ohne Smart-Eintrag")
    vorhanden = {markt[i] for i in sichtbar}
    reihe = (["CH"] if "CH" in vorhanden else []) + sorted(vorhanden - {"CH"})
    teile = []
    for m in reihe:
        s = [o for o in auswahl2 if markt[o["id"]] == m]
        e = {k: v for k, v in by.items() if markt[k] == m}
        if [o["id"] for o in s] != list(e): raise Abbruch(f"V1: Markt {m}: Daten und Smart verschieden")
        teile.append((m, s, e))
    alle = [o["id"] for _, s, _ in teile for o in s]
    if len(alle) != len(set(alle)) or set(alle) != set(sichtbar): raise Abbruch("V1: Datensatz doppelt oder fehlend nach der Aufteilung")
    return teile


def baue(stichtag, tmp, a):
    web, aus = tmp / "website", tmp / "bau"
    web.mkdir(); aus.mkdir()
    # 1 Vorlage und Seiten (wie P28, App app-v44.js)
    vorlage = pathlib.Path(a.vorlage)
    if sha(vorlage.read_bytes()) != VORLAGE_SHA: raise Abbruch(f"Vorlage {vorlage} hat nicht SHA-256 {VORLAGE_SHA[:12]}…")
    shutil.copyfile(vorlage, web / "index.html")
    for f in SEITEN: shutil.copyfile(R / "paket22/website" / f, web / f)
    app_bytes = APP.read_bytes()
    if APP_SHA and sha(app_bytes) != APP_SHA: raise Abbruch(f"app-v44.js hat nicht SHA-256 {APP_SHA[:12]}… (port_p29.py)")
    shutil.copyfile(APP, web / "app-v44.js")
    for c in CSS: shutil.copyfile(c, web / c.name)
    app_text = app_bytes.decode("utf-8")
    try: P28.pruefe_felder(a.felder_weg, app_text)
    except P28.Abbruch as e: raise Abbruch(str(e).replace("app-v43.js", "app-v44.js"))
    # 2 Master prüfen (V1), Generator (unverändert)
    sb = lade_modul("sichtbarkeit", R / "scripts/sichtbarkeit.py")
    master = sb.lies_master(pathlib.Path(a.master))
    iso = {z["alpha_2"] for z in csv.DictReader(ISO.open(encoding="utf-8"))}
    pruefe_master(master, iso)
    g = subprocess.run([sys.executable, "-I", str(R / "scripts/generator_website.py"), "--master", str(a.master),
                        "--daten", str(aus / "data-voll.js"), "--smart", str(aus / "smart-voll.json")], capture_output=True, text=True)
    if g.returncode: raise Abbruch("Generator: " + (g.stderr or g.stdout).strip())
    if a.fehler_nach == "generator": raise Abbruch("künstlicher Fehler nach dem Generator (Test P09)")
    dtext = (aus / "data-voll.js").read_text(encoding="utf-8")
    if not dtext.startswith(PRE) or not dtext.endswith(";\n"): raise Abbruch("Datendatei des Generators unerwartet")
    daten = json.loads(dtext[len(PRE):-2])
    smart = json.loads((aus / "smart-voll.json").read_text(encoding="utf-8"))
    # 3 Auswahl (Sichtbarkeit wie die App, berechnet am Stichtag; wie P28)
    t = datetime.date.fromisoformat(stichtag)
    sichtbar = [z["id"] for z in master if sb.sichtbar(z, t)]
    S = set(sichtbar)
    auswahl = [o for o in daten if o["id"] in S]
    if [o["id"] for o in auswahl] != sichtbar: raise Abbruch("A1: Reihenfolge oder Menge der sichtbaren IDs ≠ Datendatei")
    # 4 Felder weg, Smart ohne Leerwerte (wie P28)
    auswahl2 = [P28.ohne_felder(o, a.felder_weg) for o in auswahl]
    weg = {}
    by = {k: P28.smart_schlank(v, weg) for k, v in smart["byId"].items() if k in S}
    meta = dict(smart["meta"]); meta["rosterCount"] = len(auswahl2)
    if meta["rosterCount"] != len(by): raise Abbruch("rosterCount ≠ Zahl der Datensätze")
    # 5 Aufteilung je Markt (A1, E247, V1)
    teile = aufteilen(master, sichtbar, auswahl2, by, meta, iso)
    soll = {m: len(s) for m, s, _ in teile}
    dateien_markt, daten_namen, such_namen = {}, [], []
    for m, s, e in teile:
        db, sbt = datendatei(m, s, soll), smartdatei(m, meta, e)
        nd, ns = f"daten-{sha(db)[:12]}.js", f"suche-{sha(sbt)[:12]}.js"
        if nd in dateien_markt or ns in dateien_markt: raise Abbruch(f"Dateiname doppelt ({nd}, {ns})")
        (web / nd).write_bytes(db); (web / ns).write_bytes(sbt)
        dateien_markt[nd] = {"markt": m, "art": "daten", "angebote": len(s)}
        dateien_markt[ns] = {"markt": m, "art": "suche", "angebote": len(e)}
        daten_namen.append(nd); such_namen.append(ns)
    metas = {js(meta)}
    if len(metas) != 1: raise Abbruch("V1: meta ungleich")
    if a.fehler_nach == "aufteilung": raise Abbruch("künstlicher Fehler nach der Marktaufteilung (Test P09)")
    # P07: Durchführungsland ohne deutschen Namen
    namen = re.search(r"const COUNTRY_NAMES = \{([^}]*)\}", app_text)
    deutsch = set(re.findall(r"\b([A-Z]{2}):", namen.group(1))) if namen else set()
    ohne_name = sorted({c for o in auswahl2 for c in str((o.get("laender") or {}).get("ortLand") or "").split("|")
                        if re.fullmatch(r"[A-Z]{2}", c.strip() or "-") and c.strip() not in deutsch})
    for c in ohne_name: print(f"MELDUNG P07: Durchführungsland {c} ohne deutschen Namen in app-v44.js, Filter zeigt «{c}»")
    # 6 Liste, «Stand der Angaben», Sitemap (build_liste_p29.js = build_liste_p25.js mit Dateilisten, V2)
    env = dict(os.environ, TZ="Europe/Zurich", WEBSITE=str(web), OUTDIR=str(aus), DATA=",".join(daten_namen),
               SMART_JS=",".join(such_namen), APP="app-v44.js")
    lb = subprocess.run(["node", str(R / "paket29/scripts/build_liste_p29.js"), stichtag], env=env, capture_output=True, text=True)
    if lb.returncode: raise Abbruch("Listenbau: " + (lb.stderr or lb.stdout).strip()[-400:])
    if a.fehler_nach == "liste": raise Abbruch("künstlicher Fehler nach dem Listenbau (Test P09)")
    zp = json.loads((aus / f"zaehlprotokoll_{stichtag}.json").read_text(encoding="utf-8"))
    if zp["sichtbar"] != len(auswahl2) or zp["angebote"] != len(auswahl2):
        raise Abbruch(f"Listenbau: {zp['sichtbar']} Karten ≠ {len(auswahl2)} ausgelieferte Angebote")
    # 7 Skriptverweise zuletzt: Daten je Markt, Smart je Markt, App (A1, Ladereihenfolge E247)
    idx = (web / "index.html").read_text(encoding="utf-8")
    if idx.count("<!-- P19-LISTE -->") != 1 or idx.count("Stand der Angaben:") != 1:
        raise Abbruch("index.html: nicht genau ein Listenblock bzw. ein «Stand der Angaben»")
    neu = ("\n  ".join(f'<script src="{n}"></script>' for n in daten_namen),
           "\n  ".join(f'<script src="{n}"></script>' for n in such_namen), '<script src="app-v44.js"></script>')
    for alt, n in zip(VERWEISE, neu):
        if idx.count(alt) != 1: raise Abbruch(f"index.html: Verweis {alt} nicht genau einmal")
        idx = idx.replace(alt, n)
    (web / "index.html").write_text(idx, encoding="utf-8")
    skripte = re.findall(r'<script src="([^"]+)"></script>', idx)
    if skripte != daten_namen + such_namen + ["app-v44.js"]: raise Abbruch(f"index.html lädt {skripte}")
    for h in web.glob("*.html"):
        for ref in re.findall(r'(?:src|href)="([^"#:?]+\.(?:js|css|html|xml|txt))"', h.read_text(encoding="utf-8")):
            if not (web / ref).is_file(): raise Abbruch(f"{h.name}: Verweis {ref} fehlt im Paket")
    # 8 htaccess.txt bytegleich mit P28 (E246)
    hta = HTACCESS_P28.read_bytes()
    p28prot = json.loads((HTACCESS_P28.parent / "BAUPROTOKOLL.json").read_text(encoding="utf-8"))
    if sha(hta) != p28prot["htaccess.txt"]["sha256"]: raise Abbruch("htaccess.txt P28: SHA-256 ≠ Bauprotokoll P28")
    muster = re.findall(r'<FilesMatch "([^"]+)">\s*\n\s*Header set Cache-Control "max-age=31536000, immutable"', hta.decode("ascii"))
    if len(muster) != 1: raise Abbruch("htaccess.txt: Cache-Regel «immutable» nicht genau einmal")
    for n in daten_namen + such_namen + ["app-v44.js"]:
        if not re.search(muster[0], n): raise Abbruch(f"Cache-Regel greift nicht für {n}")
    (tmp / "htaccess.txt").write_bytes(hta)
    # 9 Prüfsummen, Grösse
    dateien = sorted(p for p in web.iterdir())
    total = sum(p.stat().st_size for p in dateien)
    if total > MAX_BYTE: raise Abbruch(f"website/ {total} Byte > 9 MB")
    sums = {p.name: sha(p.read_bytes()) for p in dateien}
    (web / "SHA256SUMS.txt").write_text("".join(f"{v}  {k}\n" for k, v in sums.items()), encoding="utf-8")
    # 10 Bauprotokoll (P28-Felder + Märkte, Vergleich mit einer Datei wie P28)
    p28d = (PRE + js(auswahl2) + ";\n").encode()
    p28s = (SPRE + js({"meta": meta, "byId": by}) + ";\n").encode()
    erst = lambda namen: sum(gz((web / n).read_bytes()) for n in namen)
    prot = {"stichtag": stichtag, "generator_angebote": len(daten), "sichtbar_ausgeliefert": len(auswahl2),
            "dateien": {k: {"byte": (web / k).stat().st_size, "gzip": gz((web / k).read_bytes()), "sha256": v,
                            **({"markt": dateien_markt[k]["markt"], "angebote": dateien_markt[k]["angebote"]} if k in dateien_markt else {})}
                        for k, v in sums.items()},
            "htaccess.txt": {"byte": len(hta), "sha256": sha(hta), "gleich_p28": True},
            "maerkte": {m: {"angebote": len(s), "daten": dn, "suche": sn} for (m, s, _), dn, sn in zip(teile, daten_namen, such_namen)},
            "ladereihenfolge": skripte, "soll": soll,
            "vergleich_eine_datei_p28": {"daten": {"byte": len(p28d), "gzip": gz(p28d), "sha256": sha(p28d)},
                                         "suche": {"byte": len(p28s), "gzip": gz(p28s), "sha256": sha(p28s)}},
            "erstbesuch_gzip": {"daten_und_suche_p29": erst(daten_namen + such_namen), "daten_und_suche_eine_datei": gz(p28d) + gz(p28s),
                                "app_v44": gz(app_bytes)},
            "p07_laender_ohne_deutschen_namen": ohne_name,
            "felder_weg": list(a.felder_weg), "smart_teilfelder_weg": dict(sorted(weg.items())),
            "testoptionen": a.testoptionen, "website_byte": total + (web / "SHA256SUMS.txt").stat().st_size,
            "liste": {"index_bytes": zp["index_bytes"], "lastmod": zp["lastmod"]}}
    (tmp / "BAUPROTOKOLL.json").write_text(json.dumps(prot, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    shutil.rmtree(aus)
    return prot


def main():
    global P28
    P28 = lade_modul("build_release_p28", R / "paket28/scripts/build_release_p28.py")
    ap = argparse.ArgumentParser()
    ap.add_argument("stichtag"); ap.add_argument("ziel")
    ap.add_argument("--jetzt"); ap.add_argument("--felder-weg", default=",".join(P28.FELDER_WEG))
    ap.add_argument("--vorlage", default=str(VORLAGE)); ap.add_argument("--master", default=str(MASTER))
    ap.add_argument("--fehler-nach", choices=("generator", "aufteilung", "liste"))
    a = ap.parse_args()
    a.testoptionen = {k: v for k, v in (("jetzt", a.jetzt), ("felder_weg", a.felder_weg if a.felder_weg != ",".join(P28.FELDER_WEG) else None),
                      ("vorlage", a.vorlage if a.vorlage != str(VORLAGE) else None), ("master", a.master if a.master != str(MASTER) else None),
                      ("fehler_nach", a.fehler_nach)) if v}
    if a.testoptionen and os.environ.get("P29_TEST") != "1": sys.exit("ABBRUCH: Testoptionen nur mit P29_TEST=1 (" + ", ".join(a.testoptionen) + ")")
    a.felder_weg = tuple(f for f in a.felder_weg.split(",") if f)
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", a.stichtag): sys.exit("ABBRUCH: Stichtag JJJJ-MM-TT")
    jetzt = datetime.datetime.fromisoformat(a.jetzt) if a.jetzt else datetime.datetime.now(datetime.timezone.utc)
    if jetzt.tzinfo is None: sys.exit("ABBRUCH: --jetzt braucht eine Zeitzone")
    heute = jetzt.astimezone(ZH).date()
    if datetime.date.fromisoformat(a.stichtag) > heute:
        sys.exit(f"ABBRUCH: Stichtag {a.stichtag} liegt nach dem heutigen Tag {heute} (Europe/Zurich)")
    ziel = pathlib.Path(a.ziel).resolve()
    repo, out = R.parent, (R / "paket29/out").resolve()
    if ziel == repo or ziel in repo.parents or (ziel.is_relative_to(repo) and not ziel.is_relative_to(out)) or ziel == out:
        sys.exit(f"ABBRUCH: Ziel {ziel} ist das Repo, ein Ordner darüber oder im Repo ausserhalb von paket29/out/")
    if not ziel.parent.is_dir(): sys.exit(f"ABBRUCH: Ordner {ziel.parent} fehlt")
    if ziel.exists() and not (ziel.is_dir() and not ziel.is_symlink() and {p.name for p in ziel.iterdir()} == RELEASE_INHALT):
        sys.exit(f"ABBRUCH: Ziel {ziel} existiert und ist kein früheres Release (erwartet genau {sorted(RELEASE_INHALT)})")
    for sig in (signal.SIGTERM, signal.SIGHUP): signal.signal(sig, lambda *_: sys.exit(1))
    tmp = pathlib.Path(tempfile.mkdtemp(prefix=".tmp-p29-", dir=ziel.parent)); os.chmod(tmp, 0o755)
    try:
        prot = baue(a.stichtag, tmp, a)
    except BaseException as e:
        shutil.rmtree(tmp, ignore_errors=True)
        if isinstance(e, Abbruch): sys.exit("ABBRUCH: " + str(e))
        raise
    alt = None
    if ziel.exists():
        alt = pathlib.Path(tempfile.mkdtemp(prefix=".alt-p29-", dir=ziel.parent)); os.rmdir(alt); os.replace(ziel, alt)
    os.replace(tmp, ziel)
    if alt: shutil.rmtree(alt)
    print(f"OK Release {a.stichtag}: {prot['sichtbar_ausgeliefert']} Angebote; Märkte "
          + ", ".join(f"{m} {v['angebote']}" for m, v in prot["maerkte"].items())
          + f"; website/ {round(prot['website_byte'] / 1048576, 2)} MB")


if __name__ == "__main__":
    main()
