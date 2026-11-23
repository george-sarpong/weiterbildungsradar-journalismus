"""Paket 30 Q08, Q09 (SPEZIFIKATION_PAKET30_20261123.md §5) aus Läufen auf dem Runner.
Q08: Testlauf 20 Angebote gegen das Soll von Hand (paket30/tests/soll_u3.csv, vor dem Code committet). Abweichung = Befund, nicht still angepasst.
     GEAENDERT entsteht nur über einen absichtlich falschen Vormonats-Hash für OFFER-MEDIENCAMPUS-001 (SOLL_U3.md).
Q09: Vollauf: jede Adresse sichtbarer Angebote mit Status, Linkquote berechnet, NICHT_LESBAR aufgelistet.
Aufruf (aus claude-work/): python3 -I paket30/tests/test_paket30_lauf.py q08 <abruf_test.jsonl>
                           python3 -I paket30/tests/test_paket30_lauf.py q09 <abruf_voll.jsonl>"""
import csv, datetime, json, pathlib, sys, tempfile

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(R / "paket30/scripts"))
import abgleich as A  # noqa: E402
import messbericht as MB  # noqa: E402
import p30_katalog as K  # noqa: E402

S = K.S
T, N = datetime.date(2026, 11, 23), datetime.date(2026, 12, 23)


def q08(p):
    meta, ab = A.lies_abruf(p)
    soll = {r["id"]: r for r in csv.DictReader(open(R / "paket30/tests/soll_u3.csv", encoding="utf-8"))}
    rows = S.lies_master(R / "paket3/out/master_3818_aktuell.csv")
    url_mc = next(z["url"] for z in rows if z["id"] == "OFFER-MEDIENCAMPUS-001")
    vor = {u: {"hash": ("0" * 64 if u == url_mc else e.get("hash"))} for u, e in ab.items()}
    aus = {r["id"]: r for r in A.abgleich(rows, T, N, ab, vor)}
    abw = []
    for i, s in soll.items():
        r = aus.get(i)
        if r is None: abw.append((i, "fehlt im Abruf", s["soll_status"])); continue
        if r["status"] != s["soll_status"] or r["merkmale"] != s["soll_merkmale"]:
            abw.append((i, f"{r['status']} [{r['merkmale']}]", f"{s['soll_status']} [{s['soll_merkmale']}]", r["fehler"], r["http_erst"], r["titel_fund"], r["datum_fund"], r["preis_fehlt"]))
    print(f"Q08 Lauf: {meta.get('beginn')} – {meta.get('ende')}, {len(ab)} Adressen, robots {meta.get('robots')}")
    for r in sorted(aus.values(), key=lambda x: x["id"]):
        print(f"  {r['id']:24} {r['status']:13} {r['merkmale']:28} {r['einordnung']:8} http {r['http_erst']}/{r['http']} {r['fehler']} T={r['titel_fund']} D={r['datum_fund']} P-fehlt={r['preis_fehlt']}")
    print(("PASS" if not abw else "FAIL") + f" Q08 Testlauf 20 Angebote: {20 - len(abw)}/20 = Soll")
    for a in abw: print("  BEFUND", a)
    return not abw


def q09(p):
    meta, ab = A.lies_abruf(p)
    rows = S.lies_master(R / "paket3/out/master_3818_aktuell.csv")
    vis = [z for z in rows if S.sichtbar(z, T)]
    links = {z["url"].strip() for z in vis}
    ohne = sorted(links - set(ab))
    ohne_status = [u for u, e in ab.items() if e.get("status") is None and not e.get("fehler")]
    ag = A.abgleich(rows, T, N, ab)
    k = MB.kennzahlen(rows, T, N, ab, ag)
    nl = sorted({r["url"] for r in ag if r["status"] == "NICHT_LESBAR"})
    ok = not ohne and not ohne_status and k["b2_links"] == len(links)
    print(f"Q09 Lauf: {meta.get('beginn')} – {meta.get('ende')}, {len(ab)} Adressen, {meta.get('angebote')} Angebote")
    print(f"  Linkquote maschinell {k['b2_quote_maschinell'] * 100:.1f} % ({k['b2_erreichbar_maschinell']}/{k['b2_links']}); Status {k['status']}; Einordnung {k['einordnung']}")
    print(f"  NICHT_LESBAR: {len(nl)} Adressen")
    print(("PASS" if ok else "FAIL") + f" Q09 Vollauf: jede Adresse mit Status ({len(links)} Kurslinks, ohne Abruf {len(ohne)}, ohne Status {len(ohne_status)})")
    return ok


def rauschen(p1, p2):
    """Zwei Vollläufe kurz nacheinander: Anteil Seiten mit anderem Hash = Fehlalarm-Rate von GEAENDERT (Information, kein Soll)."""
    _, a = A.lies_abruf(p1); _, b = A.lies_abruf(p2)
    beide = [u for u in a if a[u].get("hash") and (b.get(u) or {}).get("hash")]
    anders = [u for u in beide if a[u]["hash"] != b[u]["hash"]]
    import collections, urllib.parse as up
    print(f"Rauschen: {len(anders)} von {len(beide)} Seiten mit anderem Hash ({len(anders) / max(1, len(beide)) * 100:.1f} %); "
          f"Hosts {collections.Counter(up.urlsplit(u).hostname for u in anders).most_common(8)}")
    return True


if __name__ == "__main__":
    if sys.argv[1] == "rauschen": sys.exit(0 if rauschen(sys.argv[2], sys.argv[3]) else 1)
    f = {"q08": q08, "q09": q09}[sys.argv[1]]
    sys.exit(0 if f(sys.argv[2]) else 1)
