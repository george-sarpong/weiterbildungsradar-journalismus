"""Paket 26 (SPEZIFIKATION_PAKET26_20261121.md A4): baut einmalig die Tabellen des Eingangs aus dem Master auf 8e1c715.
Danach sind die Tabellen die Quelle (von Hand nachführen, neue Werte nur mit Register-ID); dieses Skript dokumentiert,
woher die Erstfassung kommt. Schreibt scripts/eingang_felder.csv, eingang_codelisten.csv, eingang_herkunft.csv,
iso3166_alpha2.csv. Aufruf (aus claude-work/): python3 -I paket26/scripts/bau_tabellen.py
U3: Länderliste aus der Debian-Datei iso-codes (Paket iso-codes 4.16.0-1, /usr/share/iso-codes/json/iso_3166-1.json)."""
import collections, csv, hashlib, json, pathlib, re, sys

R = pathlib.Path(__file__).resolve().parents[2]
M = R / "paket3/out/master_3818_aktuell.csv"
ISO = pathlib.Path("/usr/share/iso-codes/json/iso_3166-1.json")
SHA_ISO = "f01b812b57fba9f31ff621bf33e7c7570a01964dbeb5be2167e94decf538c89f"
NE = "nicht erfasst"

rows = list(csv.reader(M.read_text(encoding="utf-8-sig").splitlines()))
head, recs = rows[0], rows[1:]
werte = {c: [r[i] for r in recs] for i, c in enumerate(head)}

ANZ = ["termin_anzeige", "ort_anzeige", "dauer_anzeige", "preis_anzeige", "durchfuehrungen_anzeige"]
FRUEHER = lambda c: (c.startswith(("r4_", "h_r4_", "us_owner_", "v288_", "h_v288_")) or
                     c in ("schutz_307", "schutz_grund", "h_schutz_grund", "e4_legacy_policy", "h_e4_legacy_policy", "gold",
                           "termin_status_20261109"))
NICHT_AENDERBAR = lambda c: c in ("market", "id", "kohorte") or c.startswith("h_") or FRUEHER(c)
CODE = {"market": ("MARKT", "NEIN"), "sprache": ("SPRACHE", "JA"), "niveau": ("NIVEAU", "NEIN"), "format": ("KURSFORM", "JA"),
        "preis_kategorie": ("PREISKLASSE", "NEIN"), "publikationsstatus": ("PUBLIKATIONSSTATUS", "NEIN"),
        "sammelobjekt": ("JA_NEIN", "NEIN"), "objektklasse": ("OBJEKTKLASSE", "NEIN"),
        "durchfuehrungsort_sicherheit": ("SICHERHEITSGRAD", "NEIN"), "release_markt": ("RELEASE_MARKT", "NEIN"), "ch_zugang": ("CH_ZUGANG", "NEIN"),
        "schutz_307": ("JA_NEIN", "NEIN"), "beta_sichtbar": ("JA_NEIN", "NEIN"), "v288_geprueft": ("JA_NEIN", "NEIN"),
        "gold": ("JA_NEIN", "NEIN")}
TYP = {"url": "URL", "start_datum": "Datum", "end_datum": "Datum", "geprueft_am": "Datum", "pruefen_ab": "Datum",
       "durchfuehrungen": "JSON-Liste", "preis_optionen": "JSON-Liste", "durchfuehrungen_anzeige": "JSON-Liste",
       "preis_budgetfaehig": "Wahrheitswert", "lieferform_json": "JSON-Objekt",
       "anbieter_land": "Land", "anbieter_land_kandidat": "Land", "durchfuehrungsort_land": "Land"}
LEER_OK = set(ANZ) | {"h_" + a for a in ANZ} | {"owner_offen", "dedupe_referenz"}
PFLICHT = {c: "ALLE" for c in ("market", "id", "kohorte", "anbieter", "titel", "url", "release_markt")}
# CH/AT/LI: was der Generator braucht (A3, P25 A7): Smart-Felder und alle Website-Felder ohne Eintrag in der
# Platzhaltertabelle (generator_website.py bricht sonst bei «nicht erfasst» ab); Auslegung bestätigt 21.11. (E210)
PFLICHT.update({c: "CH/AT/LI" for c in ("lieferform_json", "preis_optionen", "preis_budgetfaehig", "preis_parser_status",
                                        "beschreibung", "zugang_text", "country_roh", "geprueft_am", "pruefen_ab", "fokus",
                                        "angebotsart_roh", "termin_text", "release_herkunft")})
VORGABE = {"schutz_307": "NEIN", "schutz_grund": "KEIN_SCHUTZ", "v288_geprueft": "NEIN", "gold": "NEIN"}
HSP = {"durchfuehrungsort_sicherheit": "h_durchfuehrungsort_land"}  # Sicherheitsgrad teilt das h_-Feld des Ortslands (§1.2)

felder = []
for c in head:
    if c.startswith("h_"): typ, cl, mf = "Herkunft", "", "NEIN"
    elif c in CODE: typ, (cl, mf) = "Codeliste", CODE[c]
    else: typ, cl, mf = TYP.get(c, "Text"), "", "JA" if c == "durchfuehrungsort_land" else "NEIN"  # nur der Ort hat mehrere Länder
    h = HSP.get(c, "h_" + c if "h_" + c in head and not c.startswith("h_") else "")
    bem = ("Kennung früherer Läufe: nicht änderbar, nicht in Dateien neuer Angebote" if FRUEHER(c) else
           "Kennung: nicht änderbar; in Dateien neuer Angebote Pflicht" if c in ("market", "id", "kohorte") else
           "Herkunftsspalte: nicht änderbar (schreibt das Skript); in Dateien neuer Angebote zulässig (A3)" if c.startswith("h_") else
           "Anzeigefeld (P24): leer = Original gilt" if c in ANZ else
           "lieferform_json: genau 8 Teilfelder (P25 A7)" if c == "lieferform_json" else "")
    felder.append({"spalte": c, "aenderbar": "NEIN" if NICHT_AENDERBAR(c) else "JA", "h_spalte": h, "typ": typ,
                   "codeliste": cl, "mehrfach": mf, "leer_erlaubt": "JA" if c in LEER_OK else "NEIN",
                   "pflicht_neu": PFLICHT.get(c, ""), "neu_zulaessig": "NEIN" if FRUEHER(c) else "JA",
                   "vorgabe_neu": VORGABE.get(c, ""), "bemerkung": bem})

# Codelisten: Einzelwerte aus dem Master (Mehrfachwerte an «|», « | », «/» zerlegt), plus URL-Status und Scope (A2, A3)
atome = lambda v, mehr: [x.strip() for x in re.split(r"\||/", v)] if mehr == "JA" else [v]
codes = collections.OrderedDict()
for c, (cl, mf) in CODE.items():
    z = collections.Counter(a for v in werte[c] if v != NE for a in atome(v, mf))
    for w, n in sorted(z.items()):
        codes.setdefault((cl, w), [0, set()]); codes[(cl, w)][0] += n; codes[(cl, w)][1].add(c)
liste = [{"codeliste": cl, "wert": w, "bedeutung": "", "quelle": f"Master 8e1c715, Spalte {'/'.join(sorted(sp))}: {n} Zellen"}
         for (cl, w), (n, sp) in codes.items()]
liste += [{"codeliste": "URL_STATUS", "wert": w, "bedeutung": b, "quelle": "SPEZIFIKATION_PAKET26 A2, K13, N06 (E207)"} for w, b in
          (("OK", "Seite mit Angebotstitel erreichbar"), ("WEITERLEITUNG", "leitet auf die Angebotsseite weiter"),
           ("NICHT_GEPRUEFT", "nicht geprüft (nur Korrekturen)"), ("FEHLER", "Seite nicht erreichbar (nie zulässig, K13, N06)"))]
liste += [{"codeliste": "SCOPE", "wert": w, "bedeutung": b, "quelle": "SPEZIFIKATION_PAKET26 A3, Entscheid 3 (E205)"} for w, b in
          (("KERN_E005", "Journalismus-Kern (E005)"), ("PRAXIS_E005", "übertragbare Praxis-Skills (E005)"),
           ("GESCHAEFT_FREIE_E180", "Geschäftskurs für Freie mit Medienbezug (E180)"),
           ("GRENZFALL_E179", "Grenzfall, Begründung Pflicht (E179)"))]

HK = {"LIVE": ("Live-Website Paket A, unverändert seit Basis 11.10.", "E035"),
      "LIVE_GEAENDERT": ("Live-Wert, nach der Basis auf live geändert (Dreiwege-Merge Paket 3)", "E035"),
      "LIVE_OWNER": ("Live-Wert per Owner-Entscheid (Paket 4)", "E060"),
      "LIVE_OWNER_OFFEN": ("Live-Wert vorläufig, Owner-Entscheid offen (build_master_p3.py; 0 Zellen)", "E035"),
      "MAIN": ("per Dreiwege-Merge aus GitHub main übernommen", "E035"),
      "MAIN_OWNER": ("main-Wert per Owner-Entscheid (Paket 4)", "E060"),
      "R4": ("Owner-Publikation R4 vom 15.09. (DE/USA)", "E036"), "KATALOG_XLSX": ("Arbeitskatalog 3818 V288", "E034"),
      "REGEL": ("abgeleitet, Regel in der Spalte *_regel", "E043"), "AUDIT": ("Beleg im Audit 28.10.", "E043"),
      "LEER": ("nicht erfasst", "E031"), "V41_E4_ROLLUP": ("Übergabe-ZIP V4.1, E4-Rollup", "E095"),
      "V41_V288_CHECKPOINTS": ("Übergabe-ZIP V4.1, V288-Checkpoints", "E095"),
      "SMART_P19": ("Smart-Datei Paket 19 (Auszug lieferform_p19.json)", "E193"),
      "DOMAIN_E118": ("Domain-Endung der Angebots-URL", "E118"), "UID_REGISTER_E132": ("UID-Register (Zweigniederlassung)", "E132"),
      "REGEL_E066": ("Regel E066: Durchführungsort CH = CH-Zugang", "E066")}
for c, b in (("ANBIETERSEITE", "Angebotsseite des Anbieters abgerufen"), ("OWNER", "Owner-Entscheid"),
             ("ANZEIGE", "Anzeigetext (Pakete 16/17), Original bleibt"), ("IMPRESSUM", "Impressum des Anbieters")):
    for k in sorted({v for c2 in head if c2.startswith("h_") for v in werte[c2] if v.startswith(c + "_E")}):
        HK[k] = (b, k.rsplit("_", 1)[1])
zellen = collections.Counter(v for c in head if c.startswith("h_") for v in werte[c] if v)
fehlt = set(zellen) - set(HK)
if fehlt: sys.exit(f"ABBRUCH: Herkunftscode ohne Bedeutung {fehlt}")
herkunft = [{"code": k, "bedeutung": b, "register_id": reg, "zellen_master_8e1c715": zellen.get(k, 0)} for k, (b, reg) in sorted(HK.items())]

b = ISO.read_bytes()
if hashlib.sha256(b).hexdigest() != SHA_ISO: sys.exit("ABBRUCH: iso_3166-1.json hat nicht den festgehaltenen SHA-256")
iso = sorted(json.loads(b)["3166-1"], key=lambda x: x["alpha_2"])
quelle = f"Debian iso-codes 4.16.0-1, /usr/share/iso-codes/json/iso_3166-1.json, SHA-256 {SHA_ISO}, gelesen 21.11.2026"


def schreibe(name, zeilen):
    with open(R / "scripts" / name, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, list(zeilen[0]), lineterminator="\n"); w.writeheader(); w.writerows(zeilen)


schreibe("eingang_felder.csv", felder)
schreibe("eingang_codelisten.csv", liste)
schreibe("eingang_herkunft.csv", herkunft)
schreibe("iso3166_alpha2.csv", [{"alpha_2": x["alpha_2"], "name": x["name"], "quelle": quelle} for x in iso])
print(f"OK Tabellen: {len(felder)} Spalten, {len(liste)} Codewerte, {len(herkunft)} Herkunftscodes, {len(iso)} Länder")
