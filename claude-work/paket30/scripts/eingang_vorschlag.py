"""Paket 30 A4 (SPEZIFIKATION_PAKET30_20261123.md, E262): Eingangszeilen für Routinefälle, die ohne Lesen im Chat feststehen.
Entwurf in --out, nie direkt in eingang/ oder den Master; Claude legt die Datei nach Durchsicht als nächste Laufnummer in eingang/.
Erfasst nur zwei Fälle:
1. Werte bestätigt (Titel, Prüfdatum, alle Beträge auf der Seite), Angebot auf der Prüfliste (fällig): geprueft_am = Abrufdatum,
   pruefen_ab = min(Abrufdatum + 180 Tage, Prüfdatum − 21 Tage), frühestens Abrufdatum + 1 Tag
   (die zwei häufigsten Abstände im Master: 180–184 Tage nach der Prüfung, 21 Tage vor dem Start; Vorschlag Claude).
2. Weiterleitung, Titel am Ziel gefunden: url = Ziel, url_status WEITERLEITUNG, url_geprueft_am = Abrufdatum.
Neue Termine, Preise, Orte (Kandidaten) bestätigt Claude zuerst auf der Seite; sie stehen nur in der Routine-Liste.
Herkunft ANBIETERSEITE_P30, Register-ID E262. Quelle = Kurslink mit Abrufdatum und Lauf-ID.

Aufruf: python3 -I paket30/scripts/eingang_vorschlag.py <abgleich.csv> <Abrufdatum> <Laufnummer NNN> [--lauf ID] [--master …] [--out paket30/out]"""
import argparse, csv, datetime, pathlib, sys

sys.dont_write_bytecode = True
HIER = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HIER))
import p30_katalog as K  # noqa: E402

S, R = K.S, K.R
HERKUNFT, REGISTER = "ANBIETERSEITE_P30", "E262"
KOPF = ["id", "feld", "alt", "neu", "alt_anzeige", "herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "ursprung"]


def neues_pruefen_ab(abruf, pruefdatum):
    k = [abruf + datetime.timedelta(days=180)]
    if pruefdatum and pruefdatum >= abruf: k.append(pruefdatum - datetime.timedelta(days=21))
    return max(min(k), abruf + datetime.timedelta(days=1))


def vorschlag(abgleich_zeilen, rows, abruf, lauf):
    by = {z["id"]: z for z in rows}; aus = []
    for r in abgleich_zeilen:
        if r["einordnung"] != "ROUTINE": continue
        z = by[r["id"]]; q = f"{r['url']} (abgerufen {abruf.isoformat()}, P30-Lauf {lauf or 'ohne Kennung'})"
        if r["status"] == "OK" and "FAELLIG" in r["pruefliste"]:   # GEAENDERT erst nach Sichtung durch Claude (Gegenprüfung H6)
            pd = S.datum(r["datum_katalog"])
            for feld, neu in (("geprueft_am", abruf.isoformat()), ("pruefen_ab", neues_pruefen_ab(abruf, pd).isoformat())):
                if z[feld] != neu:
                    qf = q + ("; pruefen_ab nach Regel-Vorschlag Claude (Abruf + 180 Tage, höchstens Termin − 21 Tage), Owner-Entscheid offen" if feld == "pruefen_ab" else "")
                    aus.append({"id": r["id"], "feld": feld, "alt": z[feld], "neu": neu, "alt_anzeige": "", "herkunft": HERKUNFT,
                                "register_id": REGISTER, "quelle": qf, "url_status": "", "url_geprueft_am": "", "ursprung": f"P30 {r['status']}"})
        if r["status"] == "WEITERLEITUNG" and r["titel_fund"] == "ja" and r["ziel"] and r["ziel"] != z["url"]:
            aus.append({"id": r["id"], "feld": "url", "alt": z["url"], "neu": r["ziel"], "alt_anzeige": "", "herkunft": HERKUNFT,
                        "register_id": REGISTER, "quelle": q, "url_status": "WEITERLEITUNG", "url_geprueft_am": abruf.isoformat(),
                        "ursprung": "P30 WEITERLEITUNG"})
    aus.sort(key=lambda x: (x["id"], x["feld"]))
    return aus


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("abgleich"); ap.add_argument("abrufdatum"); ap.add_argument("laufnummer")
    ap.add_argument("--lauf", default=""); ap.add_argument("--master", default=str(R / "paket3/out/master_3818_aktuell.csv"))
    ap.add_argument("--out", default=str(R / "paket30/out"))
    a = ap.parse_args(); d = S.datum(a.abrufdatum)
    if d is None or not (a.laufnummer.isdigit() and len(a.laufnummer) == 3): sys.exit("ABBRUCH: Abrufdatum JJJJ-MM-TT, Laufnummer NNN")
    with open(a.abgleich, encoding="utf-8") as f: ag = list(csv.DictReader(f))
    aus = vorschlag(ag, S.lies_master(a.master), d, a.lauf)
    p = pathlib.Path(a.out) / f"{a.laufnummer}_{d.strftime('%Y%m%d')}_korrekturen.csv"
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, KOPF, lineterminator="\n"); w.writeheader(); w.writerows(aus)
    print(f"OK Eingang-Entwurf: {len(aus)} Zeilen → {p}")


if __name__ == "__main__":
    main()
