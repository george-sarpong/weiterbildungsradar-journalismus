"""Paket 31 «Lücken füllen» (Owner-Auftrag 23.11.2026; E266–E268): Lückenübersicht und Vorschläge je Angebot und Feld.
Liest Master und Abrufdaten mit Auslese (abruf.py --umfang luecken); schreibt nur in --out. Nichts geht ohne Durchsicht in den Master:
Vorschläge mit Sicherheit AUTO prüft Claude stichprobenweise, PRUEFEN einzeln; erst dann entstehen Eingangszeilen (E262, E267).

Felder: termin (start_datum, end_datum, termin_text), preis (preis_text, preis_optionen), dauer, ort (ort_text), kursform (format),
sprache, niveau. Lücke = Platzhalter, «nicht erfasst», «nicht publiziert» bzw. beim Termin kein Datum ab Stichtag.
«Auf Anfrage» gilt als vollständig, wenn die Seite es bestätigt (E268).
Sicherheit AUTO nur, wenn die Seite genau einem Angebot gehört (Kurslink nicht geteilt), Status OK oder WERT_FEHLT mit Titel gefunden,
und genau ein Kandidat (bzw. strukturierte Daten beim Termin) vorliegt.

Aufruf (aus claude-work/): python3 -I paket31/scripts/luecken.py <Stichtag> <abruf.jsonl> [--master …] [--out paket31/out]"""
import argparse, collections, csv, json, pathlib, re, sys

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(R / "paket30/scripts"))
import abgleich as A  # noqa: E402
import p30_katalog as K  # noqa: E402

S = K.S
P = K.PLATZHALTER | {"Dauer nicht publiziert.", "Preis nicht publiziert", "keine Angabe", "Online"}
FELDER = ["termin", "preis", "dauer", "ort", "kursform", "sprache", "niveau"]
KOPF = ["id", "market", "anbieter", "titel", "url", "sichtbar", "status", "feld", "katalog", "vorschlag", "sicherheit", "grund", "fundstelle"]


def leer(z, *f): return not any((z.get(x) or "").strip() not in P for x in f)


def luecke(z, feld, t):
    if feld == "termin":   # Lücke, wenn kein Termin und kein Kursende ab Stichtag (laufende Kurse sind vollständig)
        pd, ende = K.pruefdatum(z, t), S.datum(z["end_datum"])
        return not ((pd and pd >= t) or (ende and ende >= t))
    if feld == "preis": return not K.betraege(z) and not K.preis_kostenlos(z)
    if feld == "dauer": return leer(z, "dauer_anzeige", "dauer") or "nicht publiz" in (z["dauer_anzeige"] or z["dauer"]).lower()
    if feld == "ort": return leer(z, "ort_anzeige", "ort_text") and (z["ort_anzeige"] or z["ort_text"]) != "Online"
    if feld == "kursform": return leer(z, "format")
    if feld == "sprache": return leer(z, "sprache")
    if feld == "niveau": return leer(z, "niveau")


def vorschlag(z, feld, ex, einzel, lesbar, t):
    """(vorschlag, sicherheit, grund, fundstelle)"""
    if not lesbar: return "", "KEIN", "Seite nicht gelesen (defekt, gesperrt oder Titel fehlt)", ""
    if not ex: return "", "KEIN", "keine Auslese", ""
    if feld == "termin":
        st = [e for e in ex["termine"] if e["quelle"] == "strukturiert"]
        tx = [e for e in ex["termine"] if e["quelle"] == "text" and e["kontext"]]
        if st:
            return st[0]["datum"], "AUTO" if einzel else "PRUEFEN", f"strukturierte Daten ({len(st)} Termine)", st[0]["auszug"]
        if tx:
            dist = sorted({e["datum"] for e in tx})
            return dist[0], "AUTO" if einzel and len(dist) <= 4 else "PRUEFEN", f"{len(dist)} Daten im Termin-Zusammenhang", tx[0]["auszug"]
        if ex["anfrage"]: return "auf Anfrage", "AUTO" if einzel else "PRUEFEN", "Seite nennt «auf Anfrage/jederzeit» (E268)", ex["anfrage"][0]
        return "", "KEIN", "kein Datum ab Stichtag auf der Seite", ""
    if feld == "preis":
        ps = ex["preise"]
        if not ps: return "", "KEIN", "kein Betrag mit Währung", ""
        if len(ps) == 1: return f"{ps[0]['waehrung']} {ps[0]['betrag']:g}", "AUTO" if einzel else "PRUEFEN", "ein Betrag auf der Seite", ps[0]["auszug"]
        return " | ".join(f"{p['waehrung']} {p['betrag']:g}" for p in ps[:4]), "PRUEFEN", f"{len(ps)} Beträge", ps[0]["auszug"]
    if feld == "dauer":
        ds = list(dict.fromkeys(d["wert"] for d in ex["dauer"]))
        if not ds: return "", "KEIN", "keine Dauer", ""
        return " / ".join(ds[:3]), "AUTO" if einzel and len(ds) == 1 else "PRUEFEN", f"{len(ds)} Angaben", ex["dauer"][0]["auszug"]
    if feld == "ort":
        os_ = [o for o in ex["orte"] if o["kontext"]] or ex["orte"]
        dist = list(dict.fromkeys(o["ort"] for o in os_))
        if not dist: return "", "KEIN", "kein Ort", ""
        return ", ".join(dist[:4]), "AUTO" if einzel and len(dist) == 1 and os_[0]["kontext"] else "PRUEFEN", f"{len(dist)} Orte", os_[0]["auszug"]
    if feld in ("kursform", "sprache", "niveau"):
        d = ex["kursform" if feld == "kursform" else feld]
        if not d: return "", "KEIN", "kein Hinweis", ""
        ks = sorted(d)
        return "|".join(ks), "AUTO" if einzel and len(ks) == 1 else "PRUEFEN", f"{len(ks)} Kategorien", next(iter(d.values()))[0]
    return "", "KEIN", "", ""


def katalog(z, feld, t):
    return {"termin": (z["termin_anzeige"] or z["termin_text"]), "preis": (z["preis_anzeige"] or z["preis_text"]), "dauer": (z["dauer_anzeige"] or z["dauer"]),
            "ort": (z["ort_anzeige"] or z["ort_text"]), "kursform": z["format"], "sprache": z["sprache"], "niveau": z["niveau"]}[feld][:120]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("stichtag"); ap.add_argument("abruf")
    ap.add_argument("--master", default=str(R / "paket3/out/master_3818_aktuell.csv")); ap.add_argument("--out", default=str(R / "paket31/out"))
    a = ap.parse_args(); t = S.datum(a.stichtag)
    rows = S.lies_master(a.master); meta, ab = A.lies_abruf(a.abruf)
    bestand = [z for z in rows if z["release_markt"] in ("CH", "AT", "LI") and z["publikationsstatus"] != "HOLD"]
    status = {r["id"]: r for r in A.abgleich(rows, t, t.replace(day=28) if t.day < 28 else t.replace(month=t.month % 12 + 1, day=1), ab)}
    zahl_url = collections.Counter(z["url"].strip() for z in bestand)
    aus, ueb = [], collections.defaultdict(collections.Counter)
    for z in bestand:
        e = ab.get(z["url"].strip()) or {}; r = status.get(z["id"], {})
        lesbar = bool(e.get("extrakt")) and r.get("status") in ("OK", "WERT_FEHLT", "GEAENDERT", "WEITERLEITUNG") and r.get("titel_fund") == "ja"
        einzel = zahl_url[z["url"].strip()] == 1 and r.get("status") in ("OK", "WERT_FEHLT", "GEAENDERT")
        vis = S.sichtbar(z, t)
        for feld in FELDER:
            if not luecke(z, feld, t): ueb[feld]["voll"] += 1; continue
            v, sich, grund, fs = vorschlag(z, feld, e.get("extrakt"), einzel, lesbar, t)
            ueb[feld][sich] += 1
            aus.append({"id": z["id"], "market": z["market"], "anbieter": z["anbieter"], "titel": z["titel"], "url": z["url"], "sichtbar": "JA" if vis else "NEIN",
                        "status": r.get("status", ""), "feld": feld, "katalog": katalog(z, feld, t), "vorschlag": v, "sicherheit": sich, "grund": grund, "fundstelle": fs})
    aus.sort(key=lambda x: (FELDER.index(x["feld"]), {"AUTO": 0, "PRUEFEN": 1, "KEIN": 2}[x["sicherheit"]], x["anbieter"].casefold(), x["id"]))
    o = pathlib.Path(a.out); A.schreibe(o / f"luecken_vorschlaege_{a.stichtag}.csv", KOPF, aus)
    voll = sum(1 for z in bestand if not any(luecke(z, f, t) for f in FELDER))
    md = [f"# Lückenübersicht CH/AT/LI, Stichtag {a.stichtag}", "", f"Bestand {len(bestand)} Angebote (ohne HOLD/Archiv); Abruf {meta.get('beginn', '')}; "
          f"vollständig in allen 7 Feldern: {voll}.", "", "| Feld | vollständig | Lücke | Vorschlag AUTO | Vorschlag PRUEFEN | kein Kandidat |", "|---|---|---|---|---|---|"]
    for f in FELDER:
        c = ueb[f]; l = c["AUTO"] + c["PRUEFEN"] + c["KEIN"]
        md.append(f"| {f} | {c['voll']} | {l} | {c['AUTO']} | {c['PRUEFEN']} | {c['KEIN']} |")
    (o / f"luecken_uebersicht_{a.stichtag}.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print("\n".join(md))


if __name__ == "__main__":
    main()
