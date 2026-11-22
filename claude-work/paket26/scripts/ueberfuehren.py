"""Paket 26 A7 (Entscheid 1 A, E203): einmalige, maschinelle Überführung des Altbestands ins Eingangsformat.
Liest die 9 Altdateien (Pakete 13, 14, 16, 17, 18, 21, 22) und bildet die Folgeregeln aus scripts/master_nachtraege.py
auf Commit 8e1c715 als ausdrückliche Zeilen ab (eine Zeile = eine Master-Zelle, in Protokollreihenfolge):
Paket 13 publicationStatus → beta_sichtbar, beta_grund, publikationsstatus; Paket 14 Preis → zusätzlich preis_optionen;
Paket 18 Anbieterland → zusätzlich anbieter_land_beleg; Paket 21 Anbieterland → anbieter_land_beleg, CH-Zugang →
ch_zugang_regel; Paket 22 Sperre → publikationsstatus/-grund, CH-Zugang → ch_zugang_regel; Paket 17 Durchführungen als
ganze JSON-Liste in durchfuehrungen_anzeige. Die Herkunftscodes, die der alte Code aus Paket und Register-ID ableitete,
stehen jetzt in der Spalte herkunft. Quelle «wie oben» (136 Zeilen Paket 14, Entscheid 2 B, E204): ersetzt durch die
Quelle der nächsten vorangehenden Zeile derselben ID; Liste paket26/out/ersetzungsliste_wie_oben.csv.
Alte Werte: bei der direkten Zeile der Wert der Altdatei (Master-Altwert in Paket 21/22, Website-Altwert in alt_anzeige
bei den Ortskorrekturen Paket 21); bei Folgezeilen der Master-Wert in diesem Moment (wie im alten Code).
Wendet jede erzeugte Datei sofort mit scripts/eingang.py an, damit die Altwerte der Folgezeilen stimmen.
Schreibt eingang/013_…_korrekturen.csv bis eingang/022_…_neue_angebote.csv. Aufruf (aus claude-work/):
python3 -I paket26/scripts/ueberfuehren.py"""
import csv, json, pathlib, re, sys

sys.dont_write_bytecode = True

R = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(R / "scripts"))
import eingang as E           # noqa: E402
import master_nachtraege as MN  # noqa: E402

EIN = R / "eingang"; OUT = R / "paket26/out"
ARCH = "ARCHIV: Kurs nicht mehr im Angebot (Nachrecherche 10.11.2026; E015; E103)"
DATUM = {13: "20261110", 14: "20261110", 16: "20261110", 17: "20261110", 18: "20261110", 21: "20261118", 22: "20261119"}
WEB = {"start": "termin_anzeige", "region": "ort_anzeige", "duration": "dauer_anzeige", "priceDisplay": "preis_anzeige"}
MAP14 = {"priceDisplay": "preis_text", "priceCategory": "preis_kategorie", "duration": "dauer", "approved": "geprueft_am"}
H21 = {"E118": "IMPRESSUM_E118", "E123": "IMPRESSUM_E123", "E132": "UID_REGISTER_E132", "E133": "IMPRESSUM_E133",
       "E134": "OWNER_E134", "E135": "OWNER_E135", "E136": "ANBIETERSEITE_E136", "E137": "ANBIETER_STANDORTE_E137",
       "E139": "ANBIETERSEITE_E139", "E066": "REGEL_E066"}
# U4: Beleg für die URL von OFFER-HEAD-003 (E098): paket13/out/t5_linkcheck_muss.json, 10.11.2026 «OK laut Owner 10.11. (E098)»
URL_E098 = ("OK", "2026-11-10")


def lade(p):
    return list(csv.DictReader(open(R / p, encoding="utf-8", newline="")))


class Lauf:
    """Erzeugt die Zeilen eines Laufs gegen einen Schattenstand (Master + Änderungen dieses Laufs)."""
    def __init__(self, M): self.M = M; self.z = []; self.schatten = {}

    def ist(self, rid, feld):
        return self.schatten.get((rid, feld), self.M.byid[rid][self.M.ix[feld]])

    def gezeigt(self, rid, orig):
        a = E.ANZ[orig]; v = self.ist(rid, a)
        return v if v != "" else self.ist(rid, orig)

    def zeile(self, rid, feld, alt, neu, herk, reg, quelle, urspr, alt_anzeige="", url=("", "")):
        self.z.append([rid, feld, alt, neu, alt_anzeige, herk, reg, quelle, url[0], url[1], urspr])
        orig = E.ANZ_INV.get(feld)
        if orig: neu = "" if neu == self.ist(rid, orig) else neu
        self.schatten[(rid, feld)] = neu
        a = E.ANZ.get(feld)
        if a and self.ist(rid, a) != "": self.schatten[(rid, a)] = ""   # P24 A5 (überholt)


def schreibe(name, kopf, zeilen):
    with open(EIN / name, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, lineterminator="\n"); w.writerow(kopf); w.writerows(zeilen)


def main():
    spaeter = [p.name for p in EIN.glob("*.csv") if not (p.name[:3].isdigit() and int(p.name[:3]) <= 22)]
    if spaeter: sys.exit(f"ABBRUCH: eingang/ enthält schon andere Dateien als den Altbestand 013–022 ({spaeter[:3]}); die Überführung ist einmalig")
    for p in EIN.glob("*.csv"): p.unlink()
    M = E.Master(R / "paket3/out/master_3818.csv"); T = E.Tabellen()
    ersetzt, zaehl = [], {}

    def fertig(nnn, L):
        name = f"{nnn:03d}_{DATUM[nnn]}_korrekturen.csv"
        schreibe(name, E.KOPF_K, L.z); zaehl[name] = len(L.z)
        E.korrekturen(M, T, nnn, DATUM[nnn], EIN / name)

    # Lauf 013 (E098, E103)
    L = Lauf(M); p = "paket13/config/owner_korrekturen.csv"
    for ln, k in enumerate(lade(p), 2):
        u = f"{p}:{ln}"
        if k["feld"] == "url":
            L.zeile(k["id"], "url", k["alt"], k["neu"], "OWNER_E098", k["register_id"], k["quelle"], u, url=URL_E098)
        elif k["feld"] == "publicationStatus":
            L.zeile(k["id"], "beta_sichtbar", "JA", "NEIN", "OWNER_E103", k["register_id"], k["quelle"], u + " Folgezeile")
            L.zeile(k["id"], "beta_grund", "Release 30.09. (E007)", ARCH, "OWNER_E103", k["register_id"], k["quelle"], u + " Folgezeile")
            L.zeile(k["id"], "publikationsstatus", k["alt"], k["neu"], "OWNER_E103", k["register_id"], k["quelle"], u)
        elif k["feld"] == "publicationReason":
            L.zeile(k["id"], "publikationsgrund", k["alt"], k["neu"], "OWNER_E103", k["register_id"], k["quelle"], u)
        else: sys.exit(f"ABBRUCH: unbekanntes Feld {u}")
    fertig(13, L)

    # Lauf 014 (E107, E109); «wie oben» auflösen (E204)
    L = Lauf(M); p = "paket14/config/korrekturen.csv"; letzte = {}
    for ln, k in enumerate(lade(p), 2):
        u = f"{p}:{ln}"; q = k["quelle"]
        if E.VERBOTEN.fullmatch(q.strip()):
            if k["id"] not in letzte: sys.exit(f"ABBRUCH: {u} «wie oben» ohne vorangehende Zeile derselben ID")
            q, von = letzte[k["id"]]
            ersetzt.append({"ursprung": u, "id": k["id"], "feld": MAP14[k["feld"]], "quelle_alt": k["quelle"], "quelle_neu": q, "quelle_von": von})
        else: letzte[k["id"]] = (q, u)
        herk = "ANBIETERSEITE_" + k["register_id"]; mf = MAP14[k["feld"]]
        L.zeile(k["id"], mf, k["alt"], k["neu"], herk, k["register_id"], q, u)
        if k["feld"] == "priceDisplay" and k["neu"] == "CHF 1'150":
            alt = L.ist(k["id"], "preis_optionen"); po = json.loads(alt)
            assert len(po) == 1 and po[0]["amountType"] == "NOT_PUBLISHED", (k["id"], po)
            po[0].update({"amountType": "EXACT", "amount": 1150.0, "currency": "CHF", "tariffLabel": "Regulärer Preis"})
            L.zeile(k["id"], "preis_optionen", alt, json.dumps(po, ensure_ascii=False), herk, k["register_id"], q, u + " Folgezeile")
    fertig(14, L)

    # Läufe 016 (E113) und 017 (E114): Anzeigefelder; Paket 17 Durchführungen als ganze Liste
    for nnn, pfade, herk in ((16, ["paket16/config/korrekturen.csv"], "ANZEIGE_E113"),
                             (17, ["paket17/config/korrekturen.csv", "paket17/config/korrekturen_preis.csv"], "ANZEIGE_E114")):
        L = Lauf(M)
        for p in pfade:
            for ln, k in enumerate(lade(p), 2):
                u = f"{p}:{ln}"
                if k["feld"] in WEB:
                    L.zeile(k["id"], WEB[k["feld"]], k["alt"], k["neu"], herk, k["register_id"], k["quelle"], u)
                    continue
                m = re.fullmatch(r"sessions\[(\d+)\]\.(label|region)", k["feld"])
                if not m: sys.exit(f"ABBRUCH: unbekanntes Feld {u}")
                alt = L.gezeigt(k["id"], "durchfuehrungen"); liste = json.loads(alt); i, s = int(m.group(1)), m.group(2)
                if not E.passt(str(liste[i].get(s, "")), k["alt"]): sys.exit(f"ABBRUCH: {u} Teilfeld passt nicht")
                liste[i][s] = k["neu"]
                L.zeile(k["id"], "durchfuehrungen_anzeige", alt, json.dumps(liste, ensure_ascii=False), herk, k["register_id"],
                        f"{k['feld']}: {k['quelle']}", u)
        fertig(nnn, L)

    # Lauf 018 (E118)
    L = Lauf(M); p = "paket18/config/korrekturen.csv"
    for ln, k in enumerate(lade(p), 2):
        u = f"{p}:{ln}"; assert k["feld"] == "laender.anbieterLand", k
        L.zeile(k["id"], "anbieter_land", k["alt"], k["neu"], "DOMAIN_E118", k["register_id"], k["quelle"], u)
        L.zeile(k["id"], "anbieter_land_beleg", "nicht erfasst", "Domain-Endung der Angebots-URL (E118)", "DOMAIN_E118", k["register_id"], k["quelle"], u + " Folgezeile")
    fertig(18, L)

    # Lauf 021 (E118, E123, E132–E139, E066)
    L = Lauf(M); p = "paket21/config/korrekturen.csv"
    for ln, k in enumerate(lade(p), 2):
        u = f"{p}:{ln}"; mf = k["master_feld"]; reg = k["register_id"]; herk = H21[reg]
        L.zeile(k["id"], mf, k["master_alt"], k["neu"], herk, reg, k["quelle"], u, alt_anzeige=k["alt"] if mf in E.ANZ else "")
        if mf == "anbieter_land":
            L.zeile(k["id"], "anbieter_land_beleg", L.ist(k["id"], "anbieter_land_beleg"), k["quelle"][:300], herk, reg, k["quelle"], u + " Folgezeile")
        if mf == "ch_zugang":
            L.zeile(k["id"], "ch_zugang_regel", L.ist(k["id"], "ch_zugang_regel"), "Durchführungsort CH genannt (E066), " + k["quelle"].split(";")[0], herk, reg, k["quelle"], u + " Folgezeile")
    fertig(21, L)

    # Lauf 022 (E142, E144) und neues Angebot (E143)
    L = Lauf(M); p = "paket22/config/korrekturen.csv"
    for ln, k in enumerate(lade(p), 2):
        u = f"{p}:{ln}"; mf = k["master_feld"]; reg = k["register_id"]
        if mf in ("beta_sichtbar", "beta_grund"):
            L.zeile(k["id"], mf, k["master_alt"], "NEIN" if mf == "beta_sichtbar" else k["neu"], "OWNER_" + reg, reg, k["quelle"], u)
            pf = {"publicationStatus": "publikationsstatus", "publicationReason": "publikationsgrund"}[k["feld"]]
            L.zeile(k["id"], pf, k["alt"], k["neu"], "OWNER_" + reg, reg, k["quelle"], u + " Folgezeile")
        elif mf == "ch_zugang":
            L.zeile(k["id"], mf, k["master_alt"], k["neu"], "ANBIETERSEITE_" + reg, reg, k["quelle"], u)
            L.zeile(k["id"], "ch_zugang_regel", L.ist(k["id"], "ch_zugang_regel"), "Durchführungsort CH genannt (E066), " + k["quelle"].split(":")[0] + " (" + reg + ")",
                    "ANBIETERSEITE_" + reg, reg, k["quelle"], u + " Folgezeile")
        else: sys.exit(f"ABBRUCH: unbekanntes Feld {u}")
    fertig(22, L)

    p = "paket22/config/neue_angebote.json"; NEU = json.loads((R / p).read_text(encoding="utf-8")); zeilen = []
    for n, a in enumerate(NEU["angebote"]):
        o, s = a["offer"], a["smart"]; reg = NEU["register_id"]; L_ = o["laender"]
        w = {"market": L_["markt"], "id": o["id"], "kohorte": "NEU_P22", "anbieter": o["provider"], "titel": o["title"],
             "beschreibung": o["description"], "url": o["url"], "sprache": o["language"], "niveau": o["level"], "fokus": o["focus"],
             "angebotsart_roh": o["offerType"], "format": o["format"], "dauer": o["duration"], "termin_text": o["start"],
             "start_datum": o["startDate"], "end_datum": o["endDate"], "durchfuehrungen": json.dumps(o["sessions"], ensure_ascii=False),
             "ort_text": o["region"], "preis_text": o["priceDisplay"], "preis_kategorie": o["priceCategory"], "zugang_text": o["access"],
             "geprueft_am": o["approved"], "pruefen_ab": o["reviewAfter"], "release_herkunft": o["release_origin"], "country_roh": o["country"],
             "preis_parser_status": s["parserStatus"], "preis_budgetfaehig": str(s["priceEligible"]),
             "preis_optionen": json.dumps(s["priceOptions"], ensure_ascii=False),
             "sammelobjekt": "NEIN", "objektklasse": "STABLE_OFFER", "objektklasse_regel": "offerType KURS", "h_objektklasse": "REGEL",
             "release_markt": L_["markt"], "h_release_markt": "OWNER_" + reg, "anbieter_land": L_["anbieterLand"], "h_anbieter_land": "DOMAIN_E118",
             "anbieter_land_beleg": "Domain-Endung der Angebots-URL (E118)", "durchfuehrungsort_land": L_["ortLand"],
             "durchfuehrungsort_sicherheit": L_["ortSicherheit"], "h_durchfuehrungsort_land": "ANBIETERSEITE_" + reg, "ch_zugang": L_["chZugang"],
             "h_ch_zugang": "REGEL_E066", "ch_zugang_regel": f"Durchführungsort CH genannt (E066), Kursseite 19.11. ({reg})",
             "owner_offen": "", "beta_sichtbar": "JA", "beta_grund": f"Neu aufgenommen 19.11.2026 ({reg})",
             "url_identitaet": "EINDEUTIG", "h_url_identitaet": "ANBIETERSEITE_" + reg, "dedupe_status": "EINDEUTIG", "dedupe_referenz": ""}
        # schutz_307 NEIN, schutz_grund KEIN_SCHUTZ, v288_geprueft NEIN, gold NEIN: Vorgabe der Feldtabelle (Kennungen früherer Läufe)
        st = {"herkunft": "ANBIETERSEITE_" + reg, "register_id": reg, "quelle": NEU["quelle"], "url_status": "OK",
              "url_geprueft_am": "2026-11-19", "scope_code": "PRAXIS_E005", "scope_begruendung": "", "dedupe_freigabe": "",
              "url_geteilt": "", "ursprung": f"{p}:angebote[{n}]"}
        kopf = [c for c in M.head if c in w] + E.STEUER_N
        zeilen.append([{**w, **st}[c] for c in kopf])
    name = f"022_{DATUM[22]}_neue_angebote.csv"; schreibe(name, kopf, zeilen); zaehl[name] = len(zeilen)
    E.neue_angebote(M, T, 22, DATUM[22], EIN / name)
    with open(OUT / "ersetzungsliste_wie_oben.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, list(ersetzt[0]), lineterminator="\n"); w.writeheader(); w.writerows(ersetzt)
    MN.lieferform_schritt(M)
    print("OK Überführung:", zaehl, "Ersetzungen «wie oben»:", len(ersetzt), "Protokollzeilen:", len(M.proto))
    return M


if __name__ == "__main__":
    try: main()
    except E.Abbruch as e: sys.exit("\n".join("ABBRUCH: " + f for f in e.fehler[:40]) + f"\n… {len(e.fehler)} Fehler")
