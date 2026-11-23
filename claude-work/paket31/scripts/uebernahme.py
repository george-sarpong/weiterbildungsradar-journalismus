"""Paket 31 «Lücken füllen» (E266–E268): Ergebnisse der Lese-Agenten (paket31/lesen/ergebnis_NN.jsonl) prüfen und in
Eingangszeilen im Master-Format umsetzen (Entwurf; Claude legt ihn nach Durchsicht als nächste Laufnummer in eingang/).
Nur Felder, die im Lesepaket als Lücke stehen. Ungültige Werte werden nicht übernommen, sondern gelistet.
Herkunft ANBIETERSEITE_P31 (Register E267), Quelle = Kurslink, Abrufdatum, Lauf und Zitat.

Aufruf (aus claude-work/): python3 -I paket31/scripts/uebernahme.py <Laufnummer NNN> <Lauf-ID> [--out paket31/out]
→ <NNN>_20261123_korrekturen.csv, uebernahme_offen.csv (Owner/Claude: Kurs weg, Übersicht, defekt, unklar), uebernahme_bericht.md"""
import argparse, collections, csv, datetime, json, pathlib, re, sys

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(R / "scripts"))
import sichtbarkeit as S  # noqa: E402
sys.path.insert(0, str(R / "paket30/scripts"))
import p30_text as TX  # noqa: E402

STATUSWOERTER = {"GEFUNDEN", "NICHT_AUF_SEITE", "NUR_VERGANGEN", "AUF_ANFRAGE", "KOSTENLOS", "fehlt", "null", "None"}
SEITEN = {}


def seite_von(u):
    """Gespeicherter Seitentext (paket31/lesen/texte, nur lokal) als Seite für die Gegenprobe."""
    if not SEITEN:
        for p in (R / "paket31/lesen/texte").glob("texte_*.jsonl"):
            for l in p.read_text(encoding="utf-8").splitlines():
                e = json.loads(l); v = e.get("volltext")
                if v:
                    q = " ".join(v.get("quelltext_daten") or [])
                    SEITEN[e["url"]] = TX.Seite(TX._ws(v["text"] + " " + v.get("h1", "")), v["text"], q, v.get("strukturiert") or [], v.get("titel", ""), v.get("h1", ""))
    return SEITEN.get(u)


def belegt_zitat(z, seite):
    z = TX.norm(z or "")
    return len(z) >= 4 and z in TX.norm(seite.text + " " + seite.quelltext_daten + " " + " ".join(seite.ld_werte))


def gegenprobe(feld, v, seite):
    """Wirft ValueError, wenn der Wert nicht auf der gespeicherten Seite steht (unabhängig vom Lese-Agenten)."""
    if seite is None: raise ValueError("kein gespeicherter Seitentext")
    st = v.get("status")
    if feld == "termin" and st == "GEFUNDEN":
        ok = [x for x in v.get("termine") or [] if d(x.get("start")) and TX.finde_datum(d(x["start"]), seite)]
        if not ok: raise ValueError("Termin nicht auf der Seite (Gegenprobe)")
        v["termine"] = ok
    elif feld == "preis" and st == "GEFUNDEN":
        ok = [t for t in v.get("tarife") or [] if isinstance(t.get("betrag"), (int, float)) and TX.finde_preis(t["betrag"], seite)]
        if not ok: raise ValueError("Betrag nicht auf der Seite (Gegenprobe)")
        v["tarife"] = ok
    elif st in ("AUF_ANFRAGE", "KOSTENLOS") or feld in ("dauer", "ort", "kursform", "sprache", "niveau"):
        if not belegt_zitat(v.get("zitat"), seite): raise ValueError("Zitat nicht wörtlich auf der Seite (Gegenprobe)")

T = datetime.date(2026, 11, 23)
NE = "nicht erfasst"
HERKUNFT, REG = "ANBIETERSEITE_P31", "E267"
FORMEN = ["PRÄSENZ", "ONLINE LIVE", "ONLINE SELBSTLERNEN", "HYBRID"]
SPRACHEN = ["DE", "FR", "IT", "EN"]
NIVEAUS = ["EINSTIEG", "VERTIEFUNG", "FORTGESCHRITTEN", "BERUFSERFAHRUNG", "VERSCHIEDENE_NIVEAUS"]
KOPF = ["id", "feld", "alt", "neu", "alt_anzeige", "herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "ursprung"]


def d(v):
    try: return datetime.date.fromisoformat(v) if isinstance(v, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", v) else None
    except ValueError: return None


def zahl(v):
    s = f"{v:,.2f}".replace(",", "'")
    s = s[:-3] if s.endswith(".00") else s
    return s.replace("'", "") if len(s.split(".")[0].replace("'", "")) <= 4 else s   # E115: ab 5 Stellen mit Apostroph


def label(s, e):
    if e and e != s:
        if s.year == e.year and s.month == e.month: return f"{s.day:02d}.–{e:%d.%m.%Y}"
        return f"{s:%d.%m.}–{e:%d.%m.%Y}" if s.year == e.year else f"{s:%d.%m.%Y}–{e:%d.%m.%Y}"
    return f"{s:%d.%m.%Y}"


def option(t):
    reg = t.get("art") == "REGULAER"
    mw = {"INKL": "INCLUDED", "ZZGL": "EXCLUDED"}.get(t.get("mwst"), "UNSPECIFIED")
    return {"amountType": "EXACT", "amount": float(t["betrag"]), "minAmount": None, "maxAmount": None, "currency": t["waehrung"],
            "tariffClass": "REGULAR" if reg else "CONDITIONAL", "tariffLabel": "Regulärer Preis" if reg else (t.get("bezeichnung") or "Bedingter Tarif"),
            "eligibilityType": "NONE" if reg else "UNKNOWN", "eligibilityValue": None, "billingBasis": "TOTAL", "billingCount": None,
            "priceScope": "FULL_OFFER", "taxMode": mw, "taxRate": None, "validFrom": None, "validThrough": None, "components": []}


def werte(z, feld, v):
    """Liefert Liste (master_feld, neu) oder wirft ValueError."""
    st = v.get("status")
    if feld == "termin":
        if st == "GEFUNDEN":
            ts = []
            for x in v.get("termine") or []:
                s, e = d(x.get("start")), d(x.get("ende")) if x.get("ende") else None
                if s and s >= T and (e is None or e >= s): ts.append((s, e, (x.get("ort") or "").strip()))
            if not ts: raise ValueError("kein gültiger künftiger Termin")
            ts.sort(); s, e, _ = ts[0]
            text = label(s, e) + (("; weitere Termine " + ", ".join(label(a, b) for a, b, _ in ts[1:6])) if len(ts) > 1 else "")
            out = [("start_datum", s.isoformat()), ("end_datum", (e or s).isoformat() if e else NE), ("termin_text", text), ("termin_anzeige", "")]
            if len(ts) > 1 or (z["durchfuehrungen"] or NE) != NE or z["durchfuehrungen_anzeige"]:
                du = [{"startDate": a.isoformat(), "endDate": (b or a).isoformat() if b else None, "label": label(a, b) + (f" · {o}" if o else "")} for a, b, o in ts]
                out += [("durchfuehrungen", json.dumps(du, ensure_ascii=False)), ("durchfuehrungen_anzeige", "")]
            return out
        if st == "AUF_ANFRAGE":
            out = [("termin_text", "Termin auf Anfrage"), ("termin_anzeige", "")]
            if d(z["start_datum"]) and d(z["start_datum"]) < T: out += [("start_datum", NE)]
            if d(z["end_datum"]) and d(z["end_datum"]) < T: out += [("end_datum", NE)]
            if (z["durchfuehrungen"] or NE) != NE: out += [("durchfuehrungen", NE), ("durchfuehrungen_anzeige", "")]
            return out
        return []
    if feld == "preis":
        if st == "KOSTENLOS":
            o = option({"betrag": 0, "waehrung": None, "art": "REGULAER"}); o.update(amountType="FREE", amount=0.0)
            return [("preis_optionen", json.dumps([o], ensure_ascii=False)), ("preis_text", "Kostenlos"), ("preis_anzeige", ""), ("preis_kategorie", "KOSTENLOS"), ("preis_budgetfaehig", "True")]
        if st != "GEFUNDEN": return []
        ts = [t for t in v.get("tarife") or [] if isinstance(t.get("betrag"), (int, float)) and t["betrag"] > 0 and t.get("waehrung") in ("CHF", "EUR", "USD")]
        if not ts: raise ValueError("kein gültiger Tarif")
        if len({t["waehrung"] for t in ts}) > 1: raise ValueError("mehrere Währungen (K16)")
        ts.sort(key=lambda t: (t.get("art") != "REGULAER", -t["betrag"]))
        if ts[0].get("art") != "REGULAER": raise ValueError("kein regulärer Tarif")
        w = ts[0]["waehrung"]; zus = " zzgl. MWST" if ts[0].get("mwst") == "ZZGL" else ""
        text = f"{w} {zahl(ts[0]['betrag'])}{zus}" + "".join(f" ({w} {zahl(t['betrag'])} {t.get('bezeichnung') or 'bedingt'})" for t in ts[1:4])
        b = ts[0]["betrag"]
        kat = "MEHRERE_TARIFE" if len(ts) > 1 else ("BIS_500" if b <= 500 else "501_2000" if b <= 2000 else "UEBER_2000")
        return [("preis_optionen", json.dumps([option(t) for t in ts], ensure_ascii=False)), ("preis_text", text), ("preis_anzeige", ""),
                ("preis_kategorie", kat), ("preis_budgetfaehig", "True")]
    w = v.get("wert")
    if st not in (None, "GEFUNDEN") or w in (None, "", []) or (isinstance(w, str) and w.strip() in STATUSWOERTER): return []
    if feld == "dauer":
        if not isinstance(w, str) or not 1 < len(w) <= 80 or re.search(r"vor kursbeginn|anmeldeschluss", w, re.I): raise ValueError("Dauer ungültig")
        return [("dauer", w.strip()), ("dauer_anzeige", "")]
    if feld == "ort":
        if not isinstance(w, str) or not w.strip(): raise ValueError("Ort leer")
        land = v.get("land")
        out = [("ort_text", w.strip()), ("ort_anzeige", "")]
        if isinstance(land, str) and re.fullmatch(r"[A-Z]{2}", land):
            out += [("durchfuehrungsort_land", land), ("durchfuehrungsort_sicherheit", "ORT_GENANNT_MIT_ONLINE" if "online" in w.lower() else "ORT_GENANNT")]
            if land == "CH" and z["ch_zugang"] != "JA": out += [("ch_zugang", "JA"), ("ch_zugang_regel", "Durchführungsort CH genannt (E066), Anbieterseite P31 (E267)")]
        return out
    if feld == "kursform":
        ws = [x for x in (w if isinstance(w, list) else [w]) if x in FORMEN]
        if not ws: raise ValueError("Kursform ungültig")
        return [("format", "|".join(sorted(set(ws), key=FORMEN.index)))]
    if feld == "sprache":
        ws = [x for x in (w if isinstance(w, list) else [w]) if x in SPRACHEN]
        if not ws: raise ValueError("Sprache ungültig")
        return [("sprache", "|".join(sorted(set(ws), key=SPRACHEN.index)))]
    if feld == "niveau":
        if w not in NIVEAUS: raise ValueError("Niveau ungültig")
        return [("niveau", w)]
    return []


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("laufnummer"); ap.add_argument("lauf"); ap.add_argument("--out", default=str(R / "paket31/out"))
    a = ap.parse_args()
    master = {z["id"]: z for z in S.lies_master(R / "paket3/out/master_3818_aktuell.csv")}
    pakete = {}
    for p in sorted((R / "paket31/lesen").glob("paket_*.jsonl")):
        for l in p.read_text(encoding="utf-8").splitlines():
            s = json.loads(l); pakete[s["url"]] = s
    zeilen, offen, z_feld = [], [], collections.Counter()
    gelesen = set()
    for p in sorted((R / "paket31/lesen").glob("ergebnis_*.jsonl")):
        for nr, l in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
            if not l.strip(): continue
            try: e = json.loads(l)
            except ValueError: offen.append({"datei": p.name, "zeile": nr, "id": "", "feld": "", "grund": "kein gültiges JSON"}); continue
            u = e.get("url"); s = pakete.get(u)
            if s is None: offen.append({"datei": p.name, "zeile": nr, "id": "", "feld": "", "grund": f"unbekannte Seite {u}"}); continue
            gelesen.add(u)
            if e.get("seite") in ("KURS_WEG", "UEBERSICHT", "DEFEKT", "NICHT_LESBAR"):
                for i in s["angebote"]: offen.append({"datei": p.name, "zeile": nr, "id": i, "feld": "", "grund": f"{e['seite']}: {e.get('hinweis') or ''}"[:300]})
            for i, felder in (e.get("angebote") or {}).items():
                z = master.get(i)
                if z is None or i not in s["angebote"]: offen.append({"datei": p.name, "zeile": nr, "id": i, "feld": "", "grund": "ID nicht im Paket"}); continue
                for feld, v in felder.items():
                    if feld not in s["angebote"][i]["luecken"] or not isinstance(v, dict): continue
                    try:
                        neu = werte(z, feld, v)
                        if neu: gegenprobe(feld, v, seite_von(u)); neu = werte(z, feld, v)
                    except (ValueError, TypeError, KeyError) as ex: offen.append({"datei": p.name, "zeile": nr, "id": i, "feld": feld, "grund": f"nicht übernommen: {ex}"}); continue
                    if not neu: continue
                    zit = re.sub(r"\s+", " ", str(v.get("zitat") or ""))[:160]
                    q = f"{u} (abgerufen 2026-11-23, P31-Lauf {a.lauf}; gelesen von Claude){' «' + zit + '»' if zit else ''}"
                    for mf, nv in neu:
                        alt = z[mf]
                        if (alt or "") == (nv or "") or (mf.endswith("_anzeige") and not alt): continue
                        zeilen.append({"id": i, "feld": mf, "alt": alt, "neu": nv, "alt_anzeige": "", "herkunft": HERKUNFT, "register_id": REG, "quelle": q,
                                       "url_status": "", "url_geprueft_am": "", "ursprung": f"P31 {feld} {v.get('status') or ''}".strip()})
                    z_feld[feld] += 1
    # je id+feld nur einmal (K12): bei Doppelung erste Zeile behalten, Rest melden
    gesehen, ein = set(), []
    for x in zeilen:
        k = (x["id"], x["feld"])
        if k in gesehen: offen.append({"datei": "", "zeile": "", "id": x["id"], "feld": x["feld"], "grund": "doppelt, nicht übernommen"}); continue
        gesehen.add(k); ein.append(x)
    ein.sort(key=lambda x: (x["id"], not x["feld"].endswith("_anzeige"), x["feld"]))   # Anzeige zuerst leeren, dann Original setzen (K06)
    o = pathlib.Path(a.out); o.mkdir(parents=True, exist_ok=True)
    with open(o / f"{a.laufnummer}_20261123_korrekturen.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, KOPF, lineterminator="\n"); w.writeheader(); w.writerows(ein)
    with open(o / "uebernahme_offen.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, ["datei", "zeile", "id", "feld", "grund"], lineterminator="\n"); w.writeheader(); w.writerows(offen)
    fehlt = sorted(set(pakete) - gelesen)
    print(f"OK {len(ein)} Eingangszeilen; Felder gefüllt {dict(z_feld)}; offen {len(offen)}; Seiten ohne Ergebnis {len(fehlt)}")


if __name__ == "__main__":
    main()
