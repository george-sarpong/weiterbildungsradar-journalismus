"""Paket 30 A5 (SPEZIFIKATION_PAKET30_20261123.md, E258 B, E177, E186): Messbericht je Monatsbuild.
B1 sichtbare Kurse mit vergangenem Enddatum (Soll 0), B2 Linkquote = erreichbare / alle Kurslinks sichtbarer Angebote (Soll ≥ 95 %),
B3 Prüfliste abgearbeitet (jede Zeile mit Ergebnis), dazu Zahl der Zweifelsfälle mit Aufwandschätzung (Q14).
Erreichbar = letzte Antwort 2xx; ohne Antwort (z. B. robots.txt, Zeitüberschreitung) zählt der Link als nicht erreichbar,
bis die Nachprüfung im Chat (--nachpruefung, Spalte erreichbar = ja) ihn bestätigt. Liest nur, schreibt nur in --out.

Aufruf: python3 -I paket30/scripts/messbericht.py <Stichtag> <nächster Build> <abruf.jsonl> <abgleich.csv>
        [--nachpruefung csv] [--entscheide csv: id,entscheid] [--lauf ID] [--master …] [--out paket30/out]"""
import argparse, csv, json, pathlib, sys
from collections import Counter

sys.dont_write_bytecode = True
HIER = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HIER))
import abgleich as A  # noqa: E402
import p30_katalog as K  # noqa: E402
import pruefliste as PL  # noqa: E402

S, R = K.S, K.R
MIN_JE_ZWEIFEL = 2          # [SCHÄTZUNG] Owner liest Vorschlag, öffnet Link, entscheidet
MIN_STICHPROBE_10 = 15      # [SCHÄTZUNG] E259: 30 Einträge 30–45 Min.
MIN_UPLOAD = 20             # [SCHÄTZUNG] Release-Upload nach E163 mit Kontrolle
BUDGET_MIN = 90             # E186


def kennzahlen(rows, t, n, abruf, abgleich_zeilen, nachpruefung=None, entscheide=None):
    nachpruefung = nachpruefung or {}; entscheide = entscheide or {}
    vis = [z for z in rows if S.sichtbar(z, t)]
    def ende(z):
        """Spätestes Ende: bei Durchführungen deren letztes Ende (sonst Start), sonst end_datum."""
        du = K.durchfuehrungen(z)
        if du:
            xs = [S.datum(e.get("endDate")) or S.datum(e.get("startDate")) for e in du]
            xs = [x for x in xs if x]
            return max(xs) if xs else None
        return S.datum(z["end_datum"])
    b1 = [z["id"] for z in vis if ende(z) and ende(z) < t]
    links = sorted({z["url"].strip() for z in vis})
    def erreichbar(u):
        e = abruf.get(u) or {}
        if e.get("status") and 200 <= e["status"] < 300 and not e.get("fehler"): return "maschinell"
        np = nachpruefung.get(u)
        if np and (np.get("erreichbar") or "").strip().lower() == "ja": return "nachpruefung"
        return ""
    er = Counter(erreichbar(u) for u in links)
    ohne = [u for u in links if u not in abruf]
    nicht = [u for u in links if not erreichbar(u)]
    pl = PL.pruefliste(rows, t, n)
    erg = {r["id"]: r for r in abgleich_zeilen}
    offen = []
    for r in pl:
        a = erg.get(r["id"])
        if a is None: offen.append((r["id"], "kein Abgleich"))
        elif a["einordnung"] == "ZWEIFEL" and not entscheide.get(r["id"]): offen.append((r["id"], "Owner-Entscheid offen"))
        elif a["einordnung"] == "CHROME" and a["url"] not in nachpruefung: offen.append((r["id"], "Nachprüfung im Chat offen"))
    zweifel = [r for r in abgleich_zeilen if r["einordnung"] == "ZWEIFEL"]
    zweifel_seiten = len({r["url"] for r in zweifel})
    aufwand = zweifel_seiten * MIN_JE_ZWEIFEL + MIN_STICHPROBE_10 + MIN_UPLOAD
    q = (er["maschinell"] + er["nachpruefung"]) / len(links) if links else 0.0
    qm = er["maschinell"] / len(links) if links else 0.0
    return {"stichtag": t.isoformat(), "naechster_build": n.isoformat(), "sichtbar": len(vis),
            "b1_vergangenes_ende": len(b1), "b1_ids": b1,
            "b2_links": len(links), "b2_erreichbar_maschinell": er["maschinell"], "b2_erreichbar_nachpruefung": er["nachpruefung"],
            "b2_quote_maschinell": round(qm, 4), "b2_quote": round(q, 4), "b2_ohne_abruf": len(ohne), "b2_nicht_erreichbar": nicht,
            "b3_pruefliste": len(pl), "b3_offen": len(offen), "b3_offen_liste": offen,
            "status": dict(sorted(Counter(r["status"] for r in abgleich_zeilen).items())),
            "einordnung": dict(sorted(Counter(r["einordnung"] for r in abgleich_zeilen).items())),
            "zweifel": len(zweifel), "zweifel_seiten": zweifel_seiten, "aufwand_min_schaetzung": aufwand, "aufwand_ueber_budget": aufwand > BUDGET_MIN}


def als_md(k, lauf):
    j = lambda b: "erfüllt" if b else "nicht erfüllt"
    zeilen = [f"# Messbericht Aktualität (E258 B), Stichtag {k['stichtag']}", "",
              f"Abruf: Lauf {lauf or 'ohne Kennung'}; nächster Build {k['naechster_build']}; sichtbar {k['sichtbar']} Angebote.", "",
              "| Kriterium | Soll | Ist | Ergebnis |", "|---|---|---|---|",
              f"| B1 sichtbare Kurse mit vergangenem Enddatum | 0 | {k['b1_vergangenes_ende']} | {j(k['b1_vergangenes_ende'] == 0)} |",
              f"| B2 Linkquote (erreichbar / alle Kurslinks) | ≥ 95 % | {k['b2_quote'] * 100:.1f} % ({k['b2_erreichbar_maschinell']} maschinell + {k['b2_erreichbar_nachpruefung']} nachgeprüft von {k['b2_links']}) | {j(k['b2_quote'] >= 0.95)} |",
              f"| B3 Prüfliste abgearbeitet | 0 offen | {k['b3_offen']} offen von {k['b3_pruefliste']} | {j(k['b3_offen'] == 0)} |", "",
              "Status je Angebot: " + ", ".join(f"{a} {b}" for a, b in k["status"].items()) + ".",
              "Einordnung: " + ", ".join(f"{a} {b}" for a, b in k["einordnung"].items()) + ".", "",
              f"Zweifelsfälle für den Owner: {k['zweifel']} Angebote auf {k['zweifel_seiten']} Seiten. Aufwand [SCHÄTZUNG]: {k['aufwand_min_schaetzung']} Min. "
              f"({MIN_JE_ZWEIFEL} Min. je Seite, Stichprobe {MIN_STICHPROBE_10} Min., Upload {MIN_UPLOAD} Min.); "
              + ("über dem Budget von 1,5 Std. (E186): Owner fragen." if k["aufwand_ueber_budget"] else "im Budget von 1,5 Std. (E186)."), ""]
    if k["b1_ids"]: zeilen += ["B1 betroffen: " + ", ".join(k["b1_ids"]), ""]
    if k["b2_nicht_erreichbar"]: zeilen += [f"B2 nicht erreichbar ({len(k['b2_nicht_erreichbar'])}): siehe abgleich-Datei, Status LINK_DEFEKT und NICHT_LESBAR.", ""]
    return "\n".join(zeilen)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("stichtag"); ap.add_argument("naechster_build"); ap.add_argument("abruf"); ap.add_argument("abgleich")
    ap.add_argument("--nachpruefung", default=""); ap.add_argument("--entscheide", default=""); ap.add_argument("--lauf", default="")
    ap.add_argument("--master", default=str(R / "paket3/out/master_3818_aktuell.csv")); ap.add_argument("--out", default=str(R / "paket30/out"))
    a = ap.parse_args(); t, n = S.datum(a.stichtag), S.datum(a.naechster_build)
    if t is None or n is None: sys.exit("ABBRUCH: Daten als JJJJ-MM-TT")
    _, ab = A.lies_abruf(a.abruf)
    with open(a.abgleich, encoding="utf-8") as f: ag = list(csv.DictReader(f))
    ent = {}
    if a.entscheide:
        with open(a.entscheide, encoding="utf-8") as f: ent = {r["id"]: r.get("entscheid", "") for r in csv.DictReader(f)}
    k = kennzahlen(S.lies_master(a.master), t, n, ab, ag, A.lies_nachpruefung(a.nachpruefung), ent)
    o = pathlib.Path(a.out); o.mkdir(parents=True, exist_ok=True)
    (o / f"messbericht_{a.stichtag}.json").write_text(json.dumps(k, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    (o / f"messbericht_{a.stichtag}.md").write_text(als_md(k, a.lauf), encoding="utf-8")
    print(f"OK Messbericht {a.stichtag}: B1 {k['b1_vergangenes_ende']}, B2 {k['b2_quote'] * 100:.1f} %, B3 offen {k['b3_offen']}, Zweifel {k['zweifel']} → {o}")


if __name__ == "__main__":
    main()
