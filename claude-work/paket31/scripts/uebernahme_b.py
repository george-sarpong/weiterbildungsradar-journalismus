"""Paket 31, zweiter Durchgang (E272): Eingangszeilen aus den Lese-Ergebnissen b1–bN und der ORSYS-Terminliste.

- Nachfolgeseiten (Fall DEFEKT, UEBERSICHT, KURS_WEG): neue Adresse nur, wenn der Lese-Agent «gleicher_kurs» bestätigt UND sein
  Titelzitat wörtlich auf der Seite steht (Gegenprobe); bestätigen zwei verschiedene Seiten denselben Kurs, geht der Fall an den Owner.
  Dann Adresse (url_status OK, geprüft am Abruftag) und die Lückenfelder von der neuen Seite.
- Bisher nicht lesbare Kurslinks (Fall NICHT_LESBAR), jetzt lesbar: nur Lückenfelder.
- Werte und Gegenprobe wie im ersten Durchgang (uebernahme.werte, uebernahme.gegenprobe), Stichtag des zweiten Abrufs.
- ORSYS: vorbereitete Zeilen (--orsys, JSON), Terminliste «Dates et lieux» vollständig maschinell gelesen.
Seitentexte nur lokal (--texte, nie ins Repo). Schreibt nur NNN_JJJJMMTT_korrekturen.csv und uebernahme_offen_b.csv in --out.

Aufruf (aus claude-work/): python3 -I paket31/scripts/uebernahme_b.py 030 <Lesedir> --orsys <json> [--out paket31/out]"""
import argparse, collections, csv, datetime, json, pathlib, re, sys

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[1].parent
sys.path.insert(0, str(R / "paket31/scripts")); sys.path.insert(0, str(R / "paket30/scripts")); sys.path.insert(0, str(R / "scripts"))
import uebernahme as U  # noqa: E402

TAG = "2026-11-24"
U.T = datetime.date(2026, 11, 24)
AUS = {}   # Durchsicht Claude: (id, feld) → Grund; feld «url» = keine neue Adresse, «*» = Angebot ganz an den Owner
LAEUFE = "P31-Läufe 45339148257, 45340574871, 45342063520"


def lade_texte(d):
    U.SEITEN.clear()
    for p in sorted(pathlib.Path(d).glob("texte_b*.jsonl")):
        for l in p.read_text(encoding="utf-8").splitlines():
            e = json.loads(l); v = e.get("volltext")
            if v and v.get("text"):
                q = " ".join(v.get("quelltext_daten") or [])
                U.SEITEN[e["url"]] = U.TX.Seite(U.TX._ws(v["text"] + " " + (v.get("h1") or "")), v["text"], q, v.get("strukturiert") or [], v.get("titel") or "", v.get("h1") or "")
    U.SEITEN.setdefault("__geladen__", None)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("laufnummer"); ap.add_argument("lesedir"); ap.add_argument("--orsys", required=True)
    ap.add_argument("--laeufe", default=""); ap.add_argument("--ausschluss", default=str(R / "paket31/config/ausschluss_b.csv"))
    ap.add_argument("--out", default=str(R / "paket31/out")); a = ap.parse_args()
    global LAEUFE
    if a.laeufe: LAEUFE = a.laeufe
    AUS.update({(r["id"], r["feld"]): r["grund"] for r in csv.DictReader(open(a.ausschluss, encoding="utf-8"))} if pathlib.Path(a.ausschluss).exists() else {})
    master = {z["id"]: z for z in U.S.lies_master(R / "paket3/out/master_3818_aktuell.csv")}
    lade_texte(a.lesedir)
    pakete = {}
    for p in sorted(pathlib.Path(a.lesedir).glob("paket_b*.jsonl")):
        for l in p.read_text(encoding="utf-8").splitlines():
            s = json.loads(l); pakete[s["url"]] = s
    zeilen, offen = [], []
    bestaetigt = collections.defaultdict(list)   # id → [(url, felder, zitat)]
    nl = {}                                      # id → (url, felder) bei NICHT_LESBAR
    for p in sorted(pathlib.Path(a.lesedir).glob("ergebnis_b*.jsonl")):
        for nr, l in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
            if not l.strip(): continue
            try: e = json.loads(l)
            except ValueError: offen.append({"id": "", "feld": "", "grund": f"{p.name}:{nr} kein gültiges JSON"}); continue
            u = e.get("url"); s = pakete.get(u)
            if s is None: offen.append({"id": "", "feld": "", "grund": f"{p.name}:{nr} unbekannte Seite"}); continue
            for i, f in (e.get("angebote") or {}).items():
                if i not in s["angebote"] or i not in master: continue
                fall = s["angebote"][i]["fall"]
                if (i, "") in AUS or (i, "*") in AUS: continue
                if fall == "NICHT_LESBAR":
                    if f.get("gleicher_kurs") is False: offen.append({"id": i, "feld": "", "grund": f"NICHT_LESBAR: Seite zeigt einen anderen Kurs ({u})"}); continue
                    if e.get("seite") == "OK": nl[i] = (u, f)
                    else: offen.append({"id": i, "feld": "", "grund": f"NICHT_LESBAR: Seite {e.get('seite')} {e.get('hinweis') or ''}"[:300]})
                    continue
                if f.get("gleicher_kurs") is True:
                    seite = U.seite_von(u)
                    if seite is None or not U.belegt_zitat(f.get("titel_zitat"), seite):
                        offen.append({"id": i, "feld": "url", "grund": f"Kandidat {u}: Titelzitat nicht wörtlich auf der Seite (Gegenprobe)"}); continue
                    bestaetigt[i].append((u, f))
    def felder(i, u, f, q_kopf):
        z = master[i]
        for feld, v in f.items():
            if feld in ("gleicher_kurs", "titel_zitat") or not isinstance(v, dict): continue
            if (i, feld) in AUS: offen.append({"id": i, "feld": feld, "grund": AUS[(i, feld)]}); continue
            if feld not in (pakete[u]["angebote"][i]["luecken"] or {}): continue
            try:
                neu = U.werte(z, feld, v)
                if neu: U.gegenprobe(feld, v, U.seite_von(u)); neu = U.werte(z, feld, v)
            except (ValueError, TypeError, KeyError) as ex: offen.append({"id": i, "feld": feld, "grund": f"nicht übernommen: {ex}"}); continue
            zit = re.sub(r"\s+", " ", str(v.get("zitat") or ""))[:160]
            for mf, nv in neu:
                alt = z[mf]
                if (alt or "") == (nv or "") or (mf.endswith("_anzeige") and not alt): continue
                zeilen.append({"id": i, "feld": mf, "alt": alt, "neu": nv, "alt_anzeige": "", "herkunft": U.HERKUNFT, "register_id": "E272",
                               "quelle": f"{q_kopf}{' «' + zit + '»' if zit else ''}", "url_status": "", "url_geprueft_am": "", "ursprung": f"P31b {feld} {v.get('status') or ''}".strip()})
    for i, liste in sorted(bestaetigt.items()):
        if (i, "url") in AUS: offen.append({"id": i, "feld": "url", "grund": AUS[(i, "url")]}); continue
        urls = sorted({u for u, _ in liste})
        basis = {u.split("?")[0] for u in urls}
        if len(basis) == 1 and basis & set(urls): liste = [x for x in liste if "?" not in x[0]][:1]; urls = [liste[0][0]]   # gleiche Seite mit/ohne Abfrageteil
        if len(urls) > 1: offen.append({"id": i, "feld": "url", "grund": "mehrere Seiten als gleicher Kurs bestätigt: " + " | ".join(urls)}); continue
        u, f = liste[0]; z = master[i]
        q = f"{u} (abgerufen {TAG}, {LAEUFE}; Nachfolgeseite für {z['url']}, gelesen von Claude) «{re.sub(chr(10), ' ', f.get('titel_zitat') or '')[:120]}»"
        zeilen.append({"id": i, "feld": "url", "alt": z["url"], "neu": u, "alt_anzeige": "", "herkunft": U.HERKUNFT, "register_id": "E272", "quelle": q,
                       "url_status": "OK", "url_geprueft_am": TAG, "ursprung": "P31b Nachfolgeseite"})
        felder(i, u, f, f"{u} (abgerufen {TAG}, {LAEUFE}; gelesen von Claude)")
    for i, (u, f) in sorted(nl.items()): felder(i, u, f, f"{u} (abgerufen {TAG}, {LAEUFE}; gelesen von Claude)")
    zeilen += json.loads(pathlib.Path(a.orsys).read_text(encoding="utf-8"))
    gesehen, ein = set(), []
    for x in zeilen:
        k = (x["id"], x["feld"])
        if k in gesehen: offen.append({"id": x["id"], "feld": x["feld"], "grund": "doppelt, nicht übernommen"}); continue
        gesehen.add(k); ein.append(x)
    ein.sort(key=lambda x: (x["id"], x["feld"] != "url", not x["feld"].endswith("_anzeige"), x["feld"]))
    o = pathlib.Path(a.out); o.mkdir(parents=True, exist_ok=True)
    with open(o / f"{a.laufnummer}_20261124_korrekturen.csv", "w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, U.KOPF, lineterminator="\n"); w.writeheader(); w.writerows(ein)
    with open(o / "uebernahme_offen_b.csv", "w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, ["id", "feld", "grund"], lineterminator="\n"); w.writeheader(); w.writerows(offen)
    neu_url = sum(1 for x in ein if x["feld"] == "url")
    print(f"OK {len(ein)} Eingangszeilen; neue Adressen {neu_url}; Angebote {len({x['id'] for x in ein})}; offen {len(offen)}")


if __name__ == "__main__":
    main()
