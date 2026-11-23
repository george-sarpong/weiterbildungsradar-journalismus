"""Paket 30 A6 (SPEZIFIKATION_PAKET30_20261123.md, E259): Prüfblatt für die Stichprobe.
Zieht n am Stichtag sichtbare Einträge reproduzierbar (random.Random(Startwert) über die nach id sortierte Liste) und stellt je Feld
(Titel, Anbieter, Datum, Ort, Kursform, Sprache, Dauer, Preis) den Katalogwert neben die Fundstelle aus dem Abruf (A2), mit Link.
Spalte «stimmt» füllt der Owner (stimmt / stimmt nicht). Ohne Abrufdaten bleibt die Fundstelle leer. Liest nur, schreibt nur in --out.

Aufruf: python3 -I paket30/scripts/stichprobe.py <Stichtag> <n> <Startwert> [--abruf abruf.jsonl] [--master …] [--out paket30/out]
        → <out>/pruefblatt_<Stichtag>_n<n>_s<Startwert>.csv"""
import argparse, csv, pathlib, random, sys

sys.dont_write_bytecode = True
HIER = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HIER))
import abgleich as A  # noqa: E402
import p30_katalog as K  # noqa: E402

S, R = K.S, K.R
KOPF = ["nr", "id", "anbieter", "titel", "url", "feld", "katalogwert", "fundstelle", "fundort", "stimmt"]
NAMEN = {"titel": "Titel", "anbieter": "Anbieter", "datum": "Datum", "ort": "Ort", "kursform": "Kursform", "sprache": "Sprache", "dauer": "Dauer", "preis": "Preis"}


def ziehe(rows, t, n, start):
    ids = sorted(z["id"] for z in rows if S.sichtbar(z, t))
    if n > len(ids): raise ValueError(f"nur {len(ids)} sichtbare Einträge")
    return random.Random(start).sample(ids, n)


def _fund(w, feld):
    if not w: return "", ""
    x = w.get(feld)
    if feld in ("datum", "preis"):
        teile = [v for v in (x or {}).values() if v]
        if not x: return "", ""
        if len(teile) < len(x): return " | ".join(v[1] for v in teile), "teilweise" if teile else "nicht gefunden"
        return " | ".join(v[1] for v in teile), ", ".join(dict.fromkeys(v[0] for v in teile))
    return (x[1], x[0]) if x else ("", "nicht gefunden")


def pruefblatt(rows, t, n, start, abruf=None):
    abruf = abruf or {}; by = {z["id"]: z for z in rows}
    aus = []
    for nr, i in enumerate(ziehe(rows, t, n, start), 1):
        z = by[i]; e = abruf.get(z["url"].strip()) or {}; w = (e.get("werte") or {}).get(i)
        kw = K.pruefblatt_felder(z, t)
        for feld in K.FELDER:
            fs, fo = _fund(w, feld)
            if not e: fo = "kein Abruf"
            elif w is None: fo = "Seite nicht gelesen (" + (e.get("fehler") or f"HTTP {e.get('status')}") + ")"
            aus.append({"nr": nr, "id": i, "anbieter": z["anbieter"], "titel": z["titel"], "url": z["url"], "feld": NAMEN[feld],
                        "katalogwert": kw[feld] or "keine Angabe", "fundstelle": fs, "fundort": fo, "stimmt": ""})
    return aus


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("stichtag"); ap.add_argument("n", type=int); ap.add_argument("startwert", type=int)
    ap.add_argument("--abruf", default=""); ap.add_argument("--master", default=str(R / "paket3/out/master_3818_aktuell.csv"))
    ap.add_argument("--out", default=str(R / "paket30/out"))
    a = ap.parse_args(); t = S.datum(a.stichtag)
    if t is None or a.n < 1: sys.exit("ABBRUCH: Stichtag JJJJ-MM-TT, n ≥ 1")
    _, ab = A.lies_abruf(a.abruf) if a.abruf else ({}, {})
    try: aus = pruefblatt(S.lies_master(a.master), t, a.n, a.startwert, ab)
    except ValueError as e: sys.exit(f"ABBRUCH: {e}")
    p = pathlib.Path(a.out) / f"pruefblatt_{a.stichtag}_n{a.n}_s{a.startwert}.csv"
    A.schreibe(p, KOPF, aus)
    print(f"OK Prüfblatt {a.stichtag}: {a.n} Einträge, {len(aus)} Zeilen → {p}")


if __name__ == "__main__":
    main()
