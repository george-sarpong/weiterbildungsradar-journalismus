"""Paket 27 A2 (SPEZIFIKATION_PAKET27_20261122.md, E214): Erstfassung der Anbieter-Tabelle claude-work/daten/anbieter.csv,
einmalig und maschinell aus dem Master von Commit c8d390e (SHA-256 cf9fdb2d…). Läuft nicht im Build; dokumentiert.
- Ein Anbieter = eine Schreibweise nach Normalisierung wie P26 N07 (NFKC, Gross/klein, Satzzeichen; eingang.norm_text).
- Kennung ANB-0001 ff. in Master-Reihenfolge des ersten Vorkommens; danach fest.
- name = häufigste Schreibweise (bei Gleichstand die erste); schreibweisen = alle Schreibweisen als JSON-Liste
  (Reihenfolge des ersten Vorkommens; JSON statt «|», weil eine Schreibweise «Canal9 | Kanal9» lautet).
- sitzland = anbieter_land der Angebote (je Anbieter widerspruchsfrei, «nicht erfasst» zählt nicht als Land; E218);
  sitzland_beleg = anbieter_land_beleg einer Zeile mit diesem Land (je Anbieter einheitlich).
Abbruch, wenn ein Anbieter zwei Länder oder zwei Belege hätte.
Aufruf (aus claude-work/): python3 -I paket27/scripts/bau_anbieter.py"""
import collections, csv, hashlib, json, pathlib, sys
sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(R / "scripts"))
import eingang as E  # noqa: E402

MASTER = R / "paket3/out/master_3818_aktuell.csv"; SHA = "cf9fdb2d69d6e2a908c08889655b7cf923cdcb8a618c2341b84f5c98b8adad92"
NE = E.NE


def main():
    b = MASTER.read_bytes()
    if hashlib.sha256(b).hexdigest() != SHA: sys.exit("ABBRUCH: Master hat nicht den Stand cf9fdb2d… (P27 U1)")
    rows = list(csv.DictReader(b.decode("utf-8-sig").splitlines()))
    gruppen = {}
    for r in rows: gruppen.setdefault(E.norm_text(r["anbieter"]), []).append(r)
    out = []
    for k, L in gruppen.items():
        zahl = collections.Counter(r["anbieter"] for r in L)
        folge = list(dict.fromkeys(r["anbieter"] for r in L))
        name = max(folge, key=lambda s: (zahl[s], -folge.index(s)))
        laender = {r["anbieter_land"] for r in L} - {NE}
        if len(laender) > 1: sys.exit(f"ABBRUCH: {name}: mehrere Anbieterländer {laender}")
        land = laender.pop() if laender else NE
        belege = {r["anbieter_land_beleg"] for r in L if r["anbieter_land"] == land} if land != NE else {NE}
        if len(belege) != 1: sys.exit(f"ABBRUCH: {name}: mehrere Belege {belege}")
        out.append([f"ANB-{len(out) + 1:04d}", name, json.dumps(folge, ensure_ascii=False), land, belege.pop(),
                    "MASTER_P27", "E214", f"paket3/out/master_3818_aktuell.csv (SHA-256 {SHA[:16]}…), Spalten anbieter, anbieter_land, anbieter_land_beleg"])
    p = R / "daten/anbieter.csv"; p.parent.mkdir(exist_ok=True)
    with open(p, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(["anbieter_id", "name", "schreibweisen", "sitzland", "sitzland_beleg", "herkunft", "register_id", "quelle"]); w.writerows(out)
    zus = [(z[0], json.loads(z[2])) for z in out if len(json.loads(z[2])) > 1]
    print(f"OK {len(out)} Anbieter aus {len(rows)} Zeilen, {sum(len(json.loads(z[2])) for z in out)} Schreibweisen; Zusammenführungen {len(zus)}:")
    for i, s in zus: print("  ", i, " / ".join(s))


if __name__ == "__main__":
    main()
