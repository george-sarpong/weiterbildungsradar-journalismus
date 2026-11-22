"""Paket 26 «Eingangsformat» (SPEZIFIKATION_PAKET26_20261121.md A1–A6; E203–E207): gemeinsamer Code für
scripts/eingang_pruefen.py (nur prüfen, schreibt nichts) und scripts/master_nachtraege.py (Master fortschreiben).
Ein Eingang claude-work/eingang/: NNN_JJJJMMTT_korrekturen.csv (eine Zeile = eine Master-Zelle) und
NNN_JJJJMMTT_neue_angebote.csv (eine Zeile = ein Angebot). Regeln K01–K14, N01–N11 (Spezifikation §5).
Ohne Netzabruf: url_status ist eine Markierung aus der Recherche, geprüft werden Form und Wert.
Bei einem Fehler: alle Fehler der ersten fehlerhaften Datei melden (Datei, Zeile, Spalte, Regel, Grund), dann Abbruch.
Paket 27 (SPEZIFIKATION_PAKET27_20261122.md A1–A5, E213–E218): fester Modellschritt 026 nach dem Lieferform-Schritt 025
(Spalten anbieter_id, h_anbieter_id, scope_code, scope_begruendung, h_scope_code aus der Anbieter-Tabelle daten/anbieter.csv
und der Scope-Steuerspalte); dritte Dateiart NNN_JJJJMMTT_anbieter.csv (eine Zeile = eine Zelle der Anbieter-Tabelle,
Regeln B01–B08); nach jeder Laufnummer ab 027 die Regeln K15 (Anbieter) und K16 (eine Währung je Angebot) am ganzen Master.
Neue Läufe ab 027."""
import ast, csv, datetime, io, json, pathlib, re, sys, unicodedata, urllib.parse

R = pathlib.Path(__file__).resolve().parents[1]
NE = "nicht erfasst"
KOPF_K = ["id", "feld", "alt", "neu", "alt_anzeige", "herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "ursprung"]
STEUER_N = ["herkunft", "register_id", "quelle", "url_status", "url_geprueft_am", "scope_code", "scope_begruendung",
            "dedupe_freigabe", "url_geteilt", "ursprung"]
NAME = re.compile(r"(\d{3})_(\d{8})_(anbieter|korrekturen|neue_angebote)\.csv")
LAUF_P25 = 25                # fester Lieferform-Schritt aus P25 zwischen Altbestand (013–022) und Läufen ab 026 (A1)
ALTBESTAND = {13, 14, 16, 17, 18, 21, 22}   # überführte Läufe (A7); sonst nur Laufnummern ab 027 (023–026 vergeben, 025 = Lieferform-Schritt)
LAUF_P27 = 26                # fester Modellschritt P27 (A1) nach 025, vor den Läufen ab 027
KOPF_A = ["anbieter_id", "feld", "alt", "neu", "herkunft", "register_id", "quelle", "ursprung"]   # P27 A3
KOPF_T = ["anbieter_id", "name", "schreibweisen", "sitzland", "sitzland_beleg", "herkunft", "register_id", "quelle"]   # P27 A2
FELDER_A = ["name", "schreibweisen", "sitzland", "sitzland_beleg"]
ANB_MUSTER = re.compile(r"ANB-\d{4}")
P27_COLS = ["anbieter_id", "h_anbieter_id", "scope_code", "scope_begruendung", "h_scope_code"]
ANZ = {"termin_text": "termin_anzeige", "ort_text": "ort_anzeige", "dauer": "dauer_anzeige", "preis_text": "preis_anzeige",
       "durchfuehrungen": "durchfuehrungen_anzeige"}
ANZ_INV = {v: k for k, v in ANZ.items()}
ANZ_COLS = [c for a in ANZ.values() for c in (a, "h_" + a)]
TF = ["channels", "evidenceTier", "materialisationStatus", "scheduleSummary", "sourceText", "structure", "temporalSummary", "variants"]
VERBOTEN = re.compile(r"(wie\s+oben|dito|s\.\s*o\.?)[\s.;,]*", re.I)    # K11 (Entscheid 2 B, ohne Ausnahme)
ID_MUSTER = re.compile(r"[A-Z0-9][A-Z0-9-]{2,40}")                      # N02
REG_ARTEN = ("ENTSCHEID", "REGEL", "BEFUND")                             # K09
# K12-Ausnahme nur für den Altbestand Lauf 017 (Owner 21.11., E208): 18 Angebote mit mehreren Teilkorrekturen ihrer
# Durchführungen (Paket 17, 58 Zeilen) stehen als Kette ganzer Listen; jede Zeile wird gegen die Liste nach der vorigen
# geprüft (K06). Alle anderen und alle künftigen Dateien: K12 ohne Ausnahme.
AUSNAHME_K12 = {"017_20261110_korrekturen.csv": {(i, "durchfuehrungen_anzeige") for i in (
    "CAD-025", "IF-G04", "IF-W03", "OFFER-CFJM-013", "OFFER-CFJM-014", "OFFER-CFJM-015", "OFFER-NOBLE-067", "OFFER-ORSYS-041",
    "PCC-P02", "PCC-P16", "PCC-P23", "PCC-P29", "V78-01", "V78-02", "V78-04", "V78-05", "V82-DAWAN-037", "V82-DAWAN-039")}}


class Abbruch(Exception):
    """Fehlerliste der ersten fehlerhaften Datei; Text = eine Zeile je Fehler."""
    def __init__(self, fehler): self.fehler = fehler; super().__init__("\n".join(fehler))


def lade_sent():
    """Platzhalterregel SENT aus build_master_p3.py (eine Quelle, P24 A6)."""
    for z in (R / "scripts/build_master_p3.py").read_text(encoding="utf-8").splitlines():
        m = re.fullmatch(r"SENT = re\.compile\((r'.*'), re\.I\)", z.strip())
        if m: return re.compile(ast.literal_eval(m.group(1)), re.I)
    raise Abbruch(["ABBRUCH: SENT in build_master_p3.py nicht gefunden"])


SENT = lade_sent()
leer = lambda v: not str(v).strip() or bool(SENT.match(str(v).strip()))
passt = lambda ist, alt: ist == alt or (ist == NE and leer(alt))   # Altwert-Prüfung wie bisher (SENT)


def norm_text(s):  # N07: Anbieter und Titel (Unicode NFKC, Gross/klein, Satzzeichen)
    return re.sub(r"[\W_]+", " ", unicodedata.normalize("NFKC", s).casefold()).strip()


def norm_url(u):   # N07: Adresse ohne Schema, «www.», Anker und Schrägstrich am Ende
    return re.sub(r"/+$", "", re.sub(r"^https?://(www\.)?", "", u.strip().lower().split("#")[0]))


def csv_lesen(p):
    return list(csv.DictReader(open(p, encoding="utf-8", newline="")))


class Tabellen:
    """A4: Feldtabelle, Codelisten, Herkunftsliste, Länderliste; A9: Register-Kopie."""
    def __init__(self, register=None):
        s = R / "scripts"
        self.felder = {z["spalte"]: z for z in csv_lesen(s / "eingang_felder.csv")}
        self.codes = {}
        for z in csv_lesen(s / "eingang_codelisten.csv"): self.codes.setdefault(z["codeliste"], set()).add(z["wert"])
        self.herkunft = {z["code"] for z in csv_lesen(s / "eingang_herkunft.csv")}
        self.iso = {z["alpha_2"] for z in csv_lesen(s / "iso3166_alpha2.csv")}
        self.register = {z["id"]: z for z in csv_lesen(register or R / "wissensbasis/ENTSCHEIDUNGSREGISTER.csv")}

    def typfehler(self, spalte, v):
        """K07/N04: Grund als Text oder None. «nicht erfasst» ist immer zulässig (E031)."""
        f = self.felder[spalte]
        if v == NE: return None
        if v == "": return None if f["leer_erlaubt"] == "JA" else "leer (nur «nicht erfasst» zulässig)"
        if f["typ"] != "Codeliste" and SENT.match(v.strip()): return f"Platzhalter «{v}» (für Unbekanntes «nicht erfasst» schreiben, E031)"
        if "\n" in v or "\r" in v: return "Zeilenumbruch im Wert"
        t = f["typ"]
        if t == "Text": return None if v.strip() else "nur Leerzeichen"
        if t == "Datum":
            if not re.fullmatch(r"\d{4}-\d\d-\d\d", v): return "kein Datum JJJJ-MM-TT"
            try: datetime.date.fromisoformat(v)
            except ValueError: return "ungültiges Datum"
            return None
        if t == "Land":
            teile = v.split("|") if f["mehrfach"] == "JA" else [v]
            falsch = [x for x in teile if x not in self.iso]
            return (f"kein ISO-3166-1-alpha-2-Code {falsch}" + (" (mehrere mit «|» ohne Leerzeichen)" if f["mehrfach"] == "JA" else " (genau ein Land)")) if falsch else None
        if t == "Codeliste":
            teile = v.split("|") if f["mehrfach"] == "JA" else [v]
            falsch = [x for x in teile if x not in self.codes.get(f["codeliste"], set())]
            return f"nicht in Codeliste {f['codeliste']}: {falsch}" + (" (mehrere mit «|» ohne Leerzeichen)" if f["mehrfach"] == "JA" else "") if falsch else None
        if t == "Wahrheitswert": return None if v in ("True", "False") else "nur True oder False"
        if t == "URL":
            u = urllib.parse.urlsplit(v)
            return None if u.scheme in ("http", "https") and u.hostname and " " not in v else "keine URL mit http:// oder https:// und Host"
        if t in ("JSON-Liste", "JSON-Objekt"):
            try: x = json.loads(v)
            except ValueError: return "ungültiges JSON"
            if t == "JSON-Liste": return None if isinstance(x, list) else "keine JSON-Liste"
            if not isinstance(x, dict): return "kein JSON-Objekt"
            if spalte == "lieferform_json" and sorted(x) != TF: return "Lieferform nicht genau mit den 8 Teilfeldern"
            return None
        if t == "Herkunft": return None if v in self.herkunft else "nicht in der Herkunftsliste (scripts/eingang_herkunft.csv)"
        if t == "AnbieterID": return None if ANB_MUSTER.fullmatch(v) else "keine Anbieter-Kennung ANB-NNNN (P27 A2)"
        return f"unbekannter Typ {t} in der Feldtabelle"


class Master:
    """Master im Speicher: Basis + Anzeigefelder (P24 A1); Protokoll wie bisher."""
    def __init__(self, basis):
        recs = list(csv.reader(io.StringIO(pathlib.Path(basis).read_text(encoding="utf-8-sig"))))
        self.head, self.rows = recs[0], recs[1:]
        if any(c in self.head for c in ANZ_COLS): raise Abbruch(["ABBRUCH: Basis enthält schon Anzeigefelder"])
        self.head = self.head + ANZ_COLS; self.rows = [r + [""] * len(ANZ_COLS) for r in self.rows]
        self.neu_index(); self.proto = []; self.geteilt = []
        self.anbieter = None; self.scope_steuer = {}; self.quellen = {}   # quellen: Zeile je (ID, Feld) im laufenden Lauf (Meldungen K15/K16)   # P27: Anbieter-Tabelle ab Schritt 026; Scope neuer Angebote vor 026

    def neu_index(self):
        self.ix = {c: i for i, c in enumerate(self.head)}
        self.byid = {r[self.ix["id"]]: r for r in self.rows}

    def anzeige(self, r, feld):  # gezeigter Wert: Anzeigefeld, falls gesetzt, sonst Original (P24 A4)
        a = ANZ.get(feld)
        return r[self.ix[a]] if a and r[self.ix[a]] != "" else r[self.ix[feld]]

    def schreibe(self, mpfad, ppfad):
        with open(mpfad, "w", encoding="utf-8-sig", newline="") as f:
            csv.writer(f, lineterminator="\n").writerows([self.head] + self.rows)
        with open(ppfad, "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f, lineterminator="\n")
            w.writerow(["id", "feld", "alt", "neu", "h_feld", "h_alt", "herkunft", "register_id", "quelle"]); w.writerows(self.proto)


def dateien(eingang):
    """K01: Dateinamen, Laufnummer eindeutig und aufsteigend (mit dem Datum), innerhalb einer Laufnummer erst
    Anbieter (P27 A3), dann Korrekturen, dann neue Angebote. Rückgabe: Liste (nnn, datum, art, pfad) in Anwendungsreihenfolge."""
    eingang = pathlib.Path(eingang); out, fehler, laeufe = [], [], {}
    for p in sorted(eingang.iterdir()):
        if p.name == "LIESMICH.md" or p.is_dir(): continue
        m = NAME.fullmatch(p.name)
        if not m: fehler.append(f"{p.name}:-:-: K01 Dateiname nicht nach NNN_JJJJMMTT_korrekturen.csv, NNN_JJJJMMTT_neue_angebote.csv bzw. NNN_JJJJMMTT_anbieter.csv"); continue
        nnn, dat, art = int(m.group(1)), m.group(2), m.group(3)
        try: datetime.date(int(dat[:4]), int(dat[4:6]), int(dat[6:]))
        except ValueError: fehler.append(f"{p.name}:-:-: K01 ungültiges Datum im Dateinamen"); continue
        if nnn not in ALTBESTAND and nnn <= LAUF_P27 or (art == "anbieter" and nnn <= LAUF_P27):
            fehler.append(f"{p.name}:-:-: K01 Laufnummer {nnn:03d} nicht zulässig (Altbestand 013, 014, 016, 017, 018, 021, 022; neue Läufe ab 027)"); continue
        laeufe.setdefault(nnn, []).append((dat, art, p))
    for nnn, dd in laeufe.items():
        arten = [a for _, a, _ in dd]
        if len(set(d for d, _, _ in dd)) > 1 or len(arten) != len(set(arten)):
            fehler.append(f"{dd[0][2].name}:-:-: K01 Laufnummer {nnn:03d} nicht eindeutig (mehrere Dateien gleicher Art oder verschiedene Daten)")
    folge = sorted(laeufe)
    for a, b in zip(folge, folge[1:]):
        if laeufe[b][0][0] < laeufe[a][0][0]:
            fehler.append(f"{laeufe[b][0][2].name}:-:-: K01 Laufnummer {b:03d} nicht aufsteigend (Datum vor Lauf {a:03d})")
    if fehler: raise Abbruch(fehler)
    for nnn in folge:
        for art in ("anbieter", "korrekturen", "neue_angebote"):
            out += [(nnn, d, a, p) for d, a, p in laeufe[nnn] if a == art]
    return out


def lies(p, kopf=None, regel="K02"):
    """K02/N01 (Anbieter-Datei P27: B01): UTF-8 ohne BOM, LF, RFC 4180, gleiche Spaltenzahl; Rückgabe Kopf, Zeilen (Zeilennummer, Liste)."""
    b = pathlib.Path(p).read_bytes(); n = pathlib.Path(p).name; fehler = []
    if b.startswith(b"\xef\xbb\xbf"): fehler.append(f"{n}:1:-: {regel} Datei beginnt mit BOM (UTF-8 ohne BOM verlangt)")
    if b"\r" in b: fehler.append(f"{n}:-:-: {regel} Zeilenende CR/CRLF (nur LF zulässig)")
    try: t = b.decode("utf-8")
    except UnicodeDecodeError as e: raise Abbruch(fehler + [f"{n}:-:-: {regel} kein gültiges UTF-8 ({e})"])
    if t and not t.endswith("\n"): fehler.append(f"{n}:-:-: {regel} letzte Zeile ohne Zeilenende LF")
    try: recs = list(csv.reader(io.StringIO(t.lstrip("﻿")), strict=True))
    except csv.Error as e: raise Abbruch(fehler + [f"{n}:-:-: {regel} CSV nicht nach RFC 4180 ({e})"])
    if not recs: raise Abbruch(fehler + [f"{n}:1:-: {regel} Datei leer"])
    head = recs[0]
    if kopf is not None and head != kopf:
        fehler.append(f"{n}:1:-: {regel} Kopf nicht genau «{','.join(kopf)}»")
    zeilen, nr = [], 1
    for r in recs[1:]:
        nr += 1
        if len(r) != len(head): fehler.append(f"{n}:{nr}:-: {regel} {len(r)} statt {len(head)} Spalten")
        zeilen.append((nr, r))
    if fehler: raise Abbruch(fehler)
    return head, zeilen


def lauf_label(nnn):  # Text der Protokollzeile «überholt» (P24 A5): Altbestand nach Paket, danach nach Lauf
    return f"Paket {nnn}" if nnn <= 22 else f"Lauf {nnn:03d}"


def pruefe_register(T, reg, schutz):
    """K09, K10: Grund oder None."""
    z = T.register.get(reg)
    if z is None: return "K09", f"Register-ID {reg} nicht in der Register-Kopie (claude-work/wissensbasis/ENTSCHEIDUNGSREGISTER.csv)"
    if z["art"] not in REG_ARTEN: return "K09", f"Register-ID {reg} hat Art {z['art']} (zulässig ENTSCHEID, REGEL, BEFUND)"
    if z["geltung"] == "ABGELOEST": return "K09", f"Register-ID {reg} ist abgelöst (durch {z['abgeloest_durch'] or '?'})"
    if schutz and z["beleg"] != "OWNER": return "K10", f"Schutz-ID (schutz_307 = JA): Register-ID {reg} hat Beleg {z['beleg']}, verlangt OWNER (E035)"
    return None


GENERATOR_TOLERIERT = {"preis_optionen"}   # generator_website.py setzt «nicht erfasst» → [] (Pflicht nur für neue Angebote, A3)


def pflicht_fehler(M, T, r):
    """K07 nach einer Korrektur: Pflichtwerte je Markt (A4), soweit der Generator sie braucht; Liste der fehlenden Spalten."""
    markt = r[M.ix["release_markt"]]
    gruppe = "CH/AT/LI" if markt in ("CH", "AT", "LI") else "DE/US"
    return [c for c, f in T.felder.items() if c in M.ix and c not in GENERATOR_TOLERIERT
            and f["pflicht_neu"] in ("ALLE", gruppe) and r[M.ix[c]] in ("", NE)]


def ch_zugang_fehler(M, r):
    """K14/N10: CH-Zugang JA nur mit Durchführungsort CH oder Regeltext; nie aus dem Anbieterland (E030, E066)."""
    if r[M.ix["ch_zugang"]] != "JA": return None
    regel = r[M.ix["ch_zugang_regel"]]
    if "anbieterland" in regel.casefold() or "anbieter_land" in regel.casefold():
        return "CH-Zugang JA aus dem Anbieterland abgeleitet (verboten, E030)"
    ort_ch = "CH" in r[M.ix["durchfuehrungsort_land"]].split("|")
    if r[M.ix["h_ch_zugang"]] == "REGEL_E066" and not ort_ch: return "CH-Zugang JA nach Regel E066, aber kein Durchführungsort CH (mehr)"
    if ort_ch or regel not in (NE, ""): return None
    return "CH-Zugang JA ohne Durchführungsort CH und ohne Regeltext in ch_zugang_regel"


def korrekturen(M, T, nnn, datum, p):
    """A2, K02–K14: wendet die Datei im Speicher auf M an (nur gültige Zeilen); wirft Abbruch mit allen Fehlern."""
    n = p.name; head, zeilen = lies(p, KOPF_K); fehler = []; gesehen = set(); beruehrt = {}
    ausnahme_k12 = AUSNAHME_K12.get(n, set())
    F = lambda nr, sp, regel, grund: fehler.append(f"{n}:{nr}:{sp}: {regel} {grund}")
    proto = []
    for nr, werte in zeilen:
        z = dict(zip(KOPF_K, werte)); vor = len(fehler)
        for c in ("id", "feld", "herkunft", "register_id", "quelle"):
            if not z[c].strip(): F(nr, c, "K03", "leer")
        rid, feld = z["id"], z["feld"]
        r = M.byid.get(rid)
        if rid and r is None: F(nr, "id", "K04", f"{rid} nicht im Master")
        if feld and feld not in M.ix: F(nr, "feld", "K05", f"{feld} ist keine Master-Spalte" + (" (noch nicht, erst nach dem Lieferform-Schritt P25)" if feld in T.felder else ""))
        elif feld and (feld.startswith("h_") or T.felder.get(feld, {}).get("aenderbar") != "JA"): F(nr, "feld", "K05", f"{feld} nicht änderbar (scripts/eingang_felder.csv)")
        if feld in M.ix and feld in T.felder and not (feld.startswith("h_") or T.felder[feld]["aenderbar"] != "JA"):
            if z["neu"] == "" and feld not in ANZ_INV: F(nr, "neu", "K03", "leer (nur bei Anzeigefeldern zulässig)")
            elif z["neu"] != "":
                g = T.typfehler(feld, z["neu"])
                if g: F(nr, "neu", "K07", g)
        if z["herkunft"] and z["herkunft"] not in T.herkunft: F(nr, "herkunft", "K08", f"{z['herkunft']} nicht in der Herkunftsliste")
        if z["register_id"]:
            g = pruefe_register(T, z["register_id"], r is not None and r[M.ix["schutz_307"]] == "JA")
            if g: F(nr, "register_id", *g)
        if VERBOTEN.fullmatch(z["quelle"].strip()): F(nr, "quelle", "K11", f"«{z['quelle']}» verboten (Entscheid 2 B, E204)")
        if (rid, feld) in gesehen and (rid, feld) not in ausnahme_k12: F(nr, "feld", "K12", f"{rid} + {feld} mehrmals in der Datei")
        gesehen.add((rid, feld))
        if feld == "url":
            if z["url_status"] not in T.codes["URL_STATUS"] or z["url_status"] == "FEHLER": F(nr, "url_status", "K13", f"«{z['url_status']}» (zulässig OK, WEITERLEITUNG, NICHT_GEPRUEFT)")
            if z["url_status"] == "NICHT_GEPRUEFT":  # Zweitmeinung ChatGPT B05: ohne Prüfung kein Prüfdatum
                if z["url_geprueft_am"]: F(nr, "url_geprueft_am", "K13", "bei NICHT_GEPRUEFT leer lassen")
            elif T.typfehler("geprueft_am", z["url_geprueft_am"]) or z["url_geprueft_am"] in ("", NE): F(nr, "url_geprueft_am", "K13", "kein Datum JJJJ-MM-TT (Pflicht bei OK und WEITERLEITUNG)")
            elif z["url_geprueft_am"].replace("-", "") > datum: F(nr, "url_geprueft_am", "K13", f"nach dem Laufdatum {datum}")
        elif z["url_status"] or z["url_geprueft_am"]: F(nr, "url_status", "K13", "nur bei feld = url")
        if len(fehler) > vor or r is None: continue
        # K06 und Anwendung (eine Zeile = eine Zelle)
        neu, herk, reg, quelle = z["neu"], z["herkunft"], z["register_id"], z["quelle"]
        if feld in ANZ_INV:  # Anzeigefeld: alt gegen den gezeigten Wert; neu = Original → leer, Original gilt (P24 A4)
            orig = ANZ_INV[feld]; ist = M.anzeige(r, orig)
            if not passt(ist, z["alt"]): F(nr, "alt", "K06", f"{rid}.{feld} zeigt «{ist}», Datei erwartet «{z['alt']}» (veralteter Nachtrag)"); continue
            if z["alt_anzeige"] and not passt(ist, z["alt_anzeige"]): F(nr, "alt_anzeige", "K06", f"{rid}.{feld} zeigt «{ist}», Datei erwartet «{z['alt_anzeige']}»"); continue
            vorher, h_vorher = r[M.ix[feld]], r[M.ix["h_" + feld]]
            neu_a, herk_a = ("", "") if neu in ("", r[M.ix[orig]]) else (neu, herk)  # leer oder = Original: Original gilt
            r[M.ix[feld]] = neu_a; r[M.ix["h_" + feld]] = herk_a
            proto.append([rid, feld, vorher, neu_a, "h_" + feld, h_vorher, herk_a, reg, quelle])
        else:
            ist = r[M.ix[feld]]
            if not passt(ist, z["alt"]): F(nr, "alt", "K06", f"{rid}.{feld} ist «{ist}», Datei erwartet «{z['alt']}» (veralteter Nachtrag)"); continue
            if z["alt_anzeige"] and not passt(M.anzeige(r, feld), z["alt_anzeige"]):
                F(nr, "alt_anzeige", "K06", f"{rid}.{feld} zeigt «{M.anzeige(r, feld)}», Datei erwartet «{z['alt_anzeige']}» (veralteter Nachtrag)"); continue
            h = T.felder[feld]["h_spalte"]
            h_alt = r[M.ix[h]] if h else ""
            r[M.ix[feld]] = neu
            if h: r[M.ix[h]] = "LEER" if neu == NE else herk  # Master-Regel: «nicht erfasst» hat Herkunft LEER
            proto.append([rid, feld, ist, neu, h, h_alt, herk, reg, quelle])  # Spalte herkunft = Herkunft der Zeile
            a = ANZ.get(feld)
            if a and r[M.ix[a]] != "":  # P24 A5: Änderung am Originalfeld überholt ein gesetztes Anzeigefeld
                proto.append([rid, a, r[M.ix[a]], "", "h_" + a, r[M.ix["h_" + a]], "", reg, f"überholt durch {lauf_label(nnn)}"])
                r[M.ix[a]] = ""; r[M.ix["h_" + a]] = ""
        beruehrt.setdefault(rid, nr); M.quellen[(rid, feld)] = (n, nr, feld)
    for rid, nr in beruehrt.items():
        r = M.byid[rid]
        if "scope_code" in M.ix and r[M.ix["scope_code"]] == "GRENZFALL_E179" and r[M.ix["scope_begruendung"]] in ("", NE):
            F(nr, "id", "K07", f"{rid}: scope_code GRENZFALL_E179 ohne scope_begruendung nach dem Lauf (E179, wie N08)")
        g = ch_zugang_fehler(M, M.byid[rid])
        if g: F(nr, "id", "K14", f"{rid}: {g}")
        if M.byid[rid][M.ix["release_markt"]] in ("CH", "AT", "LI") or M.byid[rid][M.ix["release_markt"]] != M.byid[rid][M.ix["market"]].replace("USA", "US"):
            fehlt = pflicht_fehler(M, T, M.byid[rid])
            if fehlt: F(nr, "id", "K07", f"{rid}: Pflichtwert fehlt nach dem Lauf ({', '.join(fehlt)}; Pflicht laut pflicht_neu, ohne Platzhalter)")
    if fehler: raise Abbruch(fehler)
    M.proto.extend(proto)
    return len(zeilen)


def neue_angebote(M, T, nnn, datum, p):
    """A3, N01–N11: hängt die Angebote als neue Zeilen an; wirft Abbruch mit allen Fehlern."""
    n = p.name; head, zeilen = lies(p); fehler = []
    F = lambda nr, sp, regel, grund: fehler.append(f"{n}:{nr}:{sp}: {regel} {grund}")
    for c in head:
        if c in STEUER_N: continue
        if c not in T.felder: F(1, c, "N01", "unbekannte Spalte (weder Master- noch Steuerspalte)")
        elif T.felder[c]["neu_zulaessig"] != "JA": F(1, c, "N11", "Kennung früherer Läufe, nicht in Dateien neuer Angebote (A3, A4)")
        elif c not in M.ix: F(1, c, "N01", "noch keine Master-Spalte (erst nach dem Lieferform-Schritt P25)")
    for c in STEUER_N + ["market", "id", "kohorte"]:
        if c not in head: F(1, c, "N01", "Pflichtspalte fehlt im Kopf")
    if len(set(head)) != len(head): F(1, "-", "N01", "Spalte doppelt im Kopf")
    if fehler: raise Abbruch(fehler)
    kohorte = "NEU_P22" if nnn == 22 else f"NEU_{nnn:03d}"
    ids, anb_titel, adressen = set(), {}, {}
    for r in M.rows:
        anb_titel.setdefault((norm_text(r[M.ix["anbieter"]]), norm_text(r[M.ix["titel"]])), r[M.ix["id"]])
        adressen.setdefault(norm_url(r[M.ix["url"]]), r[M.ix["id"]])
    lauf_datum = datetime.date(int(datum[:4]), int(datum[4:6]), int(datum[6:]))
    neu_rows, proto, geteilt = [], [], []
    for nr, werte in zeilen:
        z = dict(zip(head, werte)); vor = len(fehler); rid = z["id"]
        if not ID_MUSTER.fullmatch(rid): F(nr, "id", "N02", f"«{rid}» nicht nach Muster [A-Z0-9][A-Z0-9-]{{2,40}}")
        elif rid in M.byid: F(nr, "id", "N02", f"{rid} schon im Master")
        elif rid in ids: F(nr, "id", "N02", f"{rid} doppelt in der Datei")
        ids.add(rid)
        if z["kohorte"] != kohorte: F(nr, "kohorte", "N02", f"«{z['kohorte']}», verlangt {kohorte}")
        markt = z.get("release_markt", "")
        gruppe = "CH/AT/LI" if markt in ("CH", "AT", "LI") else "DE/US" if markt in ("DE", "US") else None
        for c, f in T.felder.items():
            pf = f["pflicht_neu"]
            if c in M.ix and pf and (pf == "ALLE" or pf == gruppe):
                if c not in head: F(nr, c, "N03", f"Pflichtspalte fehlt (Pflicht {pf})")
                elif z[c] in ("", NE): F(nr, c, "N03", f"Pflichtwert fehlt (Pflicht {pf}, ohne Platzhalter)")
        if gruppe is None: F(nr, "release_markt", "N03", f"«{markt}» (CH, AT, LI, DE oder US)")
        elif z.get("market") != {"US": "USA"}.get(markt, markt): F(nr, "market", "N03", f"«{z.get('market')}» passt nicht zu release_markt {markt}")
        for c in head:
            if c in STEUER_N or c not in T.felder or c in ("id", "kohorte"): continue
            g = T.typfehler(c, z[c])
            if g: F(nr, c, "N09" if c in ("lieferform_json", "preis_optionen", "preis_budgetfaehig") and gruppe == "CH/AT/LI" else "N04", g)
        for c in ("herkunft", "register_id", "quelle"):
            if not z[c].strip(): F(nr, c, "N05", "leer")
        if z["herkunft"] and z["herkunft"] not in T.herkunft: F(nr, "herkunft", "N05", f"{z['herkunft']} nicht in der Herkunftsliste")
        if z["register_id"]:
            g = pruefe_register(T, z["register_id"], False)
            if g: F(nr, "register_id", "N05", g[1])
        if VERBOTEN.fullmatch(z["quelle"].strip()): F(nr, "quelle", "N05", f"«{z['quelle']}» verboten (E204)")
        if z["url_status"] not in ("OK", "WEITERLEITUNG"): F(nr, "url_status", "N06", f"«{z['url_status']}» (verlangt OK oder WEITERLEITUNG)")
        if T.typfehler("geprueft_am", z["url_geprueft_am"]) or z["url_geprueft_am"] in ("", NE): F(nr, "url_geprueft_am", "N06", "kein Datum JJJJ-MM-TT")
        elif datetime.date.fromisoformat(z["url_geprueft_am"]) > lauf_datum: F(nr, "url_geprueft_am", "N06", f"nach dem Laufdatum {datum}")
        at = (norm_text(z.get("anbieter", "")), norm_text(z.get("titel", "")))
        if at in anb_titel and not z["dedupe_freigabe"].strip():
            F(nr, "titel", "N07", f"gleicher Anbieter und Titel wie {anb_titel[at]} (Freigabe nur mit Owner-Entscheid in dedupe_freigabe, E206)")
        elif z["dedupe_freigabe"].strip():
            g = T.register.get(z["dedupe_freigabe"].strip())
            if not g or g["art"] != "ENTSCHEID" or g["beleg"] != "OWNER": F(nr, "dedupe_freigabe", "N07", f"«{z['dedupe_freigabe']}» ist kein Owner-Entscheid im Register")
        u = norm_url(z.get("url", ""))
        if z["url_geteilt"] not in ("", "JA"): F(nr, "url_geteilt", "N07", "nur leer oder JA")
        if u in adressen:
            if z["url_geteilt"] != "JA": F(nr, "url", "N07", f"gleiche Adresse wie {adressen[u]} (Übersichtsseite: url_geteilt = JA, E206)")
            else: geteilt.append((rid, adressen[u], z.get("url", "")))
        if M.anbieter is not None and "anbieter_id" in head:  # P27 B07: Kennung in der Tabelle, Text eine ihrer Schreibweisen
            a = M.anbieter.byid.get(z["anbieter_id"])
            if a is None: F(nr, "anbieter_id", "B07", f"«{z['anbieter_id']}» nicht in der Anbieter-Tabelle (neuer Anbieter zuerst über …_anbieter.csv)")
            elif z.get("anbieter", "") not in a["schreibweisen"]: F(nr, "anbieter", "B07", f"«{z.get('anbieter', '')}» ist keine Schreibweise von {z['anbieter_id']} (neue Schreibweise über …_anbieter.csv)")
        if z["scope_code"] not in T.codes["SCOPE"]: F(nr, "scope_code", "N08", f"«{z['scope_code']}» nicht in der Codeliste SCOPE")
        elif z["scope_code"] == "GRENZFALL_E179" and not z["scope_begruendung"].strip(): F(nr, "scope_begruendung", "N08", "Grenzfall ohne Begründung (E179)")
        if len(fehler) > vor: continue
        anb_titel.setdefault(at, rid); adressen.setdefault(u, rid)
        # Zeile bauen: nicht genannte Spalten Anzeigefelder leer, h_ «LEER», sonst «nicht erfasst», Vorgaben laut Feldtabelle
        zz = {c: ("" if c in ANZ_COLS else "LEER" if c.startswith("h_") else NE) for c in M.head}
        for c, f in T.felder.items():
            if c in zz and f["vorgabe_neu"]: zz[c] = f["vorgabe_neu"]
        for c in head:
            if c in STEUER_N: continue
            zz[c] = z[c]
            h = T.felder[c]["h_spalte"]
            if h and h not in head and c not in ("market", "id", "kohorte") and not c.startswith("h_"):
                zz[h] = "LEER" if z[c] == NE else z["herkunft"]  # Master-Regel: «nicht erfasst» hat Herkunft LEER
        if "scope_code" in M.ix:  # P27 A4: Steuerspalte scope_code wird Master-Spalte
            zz["scope_code"] = z["scope_code"]; zz["scope_begruendung"] = z["scope_begruendung"].strip() or NE; zz["h_scope_code"] = z["herkunft"]
        else:
            M.scope_steuer[rid] = (z["scope_code"], z["scope_begruendung"].strip() or NE, z["herkunft"], z["register_id"], z["quelle"])
        r = [zz[c] for c in M.head]
        g = ch_zugang_fehler(M, r)
        if g: F(nr, "ch_zugang", "N10", g); continue
        neu_rows.append(r); M.quellen[(rid, "*")] = (n, nr, "anbieter_id")
        proto.extend([rid, c, "(neu)", zz[c], "", "", z["herkunft"], z["register_id"], z["quelle"]] for c in M.head if zz[c] not in (NE, "LEER", ""))
    if fehler: raise Abbruch(fehler)
    M.rows.extend(neu_rows); M.neu_index(); M.proto.extend(proto); M.geteilt.extend((n,) + g for g in geteilt)
    return len(zeilen)


def wende_an(M, T, eingang, p25, bis=None, anbieter_basis=None):
    """Alle Dateien der Reihe nach; vor dem ersten Lauf ab 026 der Lieferform-Schritt p25(M) (A1 P26), danach der
    Modellschritt P27 (026); nach jeder Laufnummer ab 027 K15/K16 am ganzen Master. bis: nur Läufe ≤ bis."""
    erg, stufe = [], 0
    def schritte(bis_stufe):
        nonlocal stufe
        if stufe < 1 <= bis_stufe: p25(M); stufe = 1
        if stufe < 2 <= bis_stufe: modell_schritt_p27(M, T, anbieter_basis); stufe = 2
    liste = dateien(eingang)
    for k, (nnn, datum, art, p) in enumerate(liste):
        if bis is not None and nnn > bis: break
        if nnn > LAUF_P25: schritte(2)
        if k == 0 or liste[k - 1][0] != nnn: M.quellen = {}
        anz = (anbieter_lauf(M, T, nnn, datum, p) if art == "anbieter" else korrekturen(M, T, nnn, datum, p)
               if art == "korrekturen" else neue_angebote(M, T, nnn, datum, p))
        erg.append((p.name, anz))
        if nnn > LAUF_P27 and (k + 1 == len(liste) or liste[k + 1][0] != nnn): konsistenz(M, f"Lauf {nnn:03d}")
    if bis is None or bis >= LAUF_P27: schritte(2)
    elif bis >= LAUF_P25: schritte(1)
    return erg


# ---------------- Paket 27 ----------------

class Anbieter:
    """P27 A2: Anbieter-Tabelle (Erstfassung daten/anbieter.csv) im Speicher; Protokoll eigener Zeilen (A3)."""
    def __init__(self, pfad, T):
        pfad = pathlib.Path(pfad); n = pfad.name
        head, zeilen = lies(pfad, None, "B01")
        if head != KOPF_T: raise Abbruch([f"{n}:1:-: B01 Kopf nicht genau «{','.join(KOPF_T)}»"])
        self.head = head; self.rows = []; self.byid = {}; self.proto = []; self.zeilen = {}; fehler = []
        for nr, w in zeilen:
            z = dict(zip(head, w))
            try: z["schreibweisen"] = json.loads(z["schreibweisen"])
            except ValueError: fehler.append(f"{n}:{nr}:schreibweisen: B03 kein JSON"); continue
            if z["anbieter_id"] in self.byid: fehler.append(f"{n}:{nr}:anbieter_id: B02 doppelt")
            self.byid[z["anbieter_id"]] = z; self.rows.append(z); self.zeilen[z["anbieter_id"]] = nr
        fehler += self.pruefe(T, n)
        if fehler: raise Abbruch(fehler)

    def max_nr(self): return max((int(i[4:]) for i in self.byid), default=0)

    def pruefe(self, T, n, nur=None, zeile=None):
        """B02–B04 je Anbieter (nur: Kennungen der Datei); B03 Schreibweisen über alle Anbieter eindeutig, je Anbieter
        ohne exakte Wiederholung. zeile(Kennung, Feld) → Zeilennummer für die Meldung."""
        fehler, gesehen = [], {}
        zeile = zeile or (lambda i, f: self.zeilen.get(i, "-"))
        for z in self.rows:
            i = z["anbieter_id"]; sw = z["schreibweisen"]
            for s in sw if isinstance(sw, list) else []: gesehen.setdefault(norm_text(s), set()).add(i)
            if nur is not None and i not in nur: continue
            if not ANB_MUSTER.fullmatch(i): fehler.append(f"{n}:{zeile(i, 'anbieter_id')}:anbieter_id: B02 «{i}» nicht nach ANB-NNNN")
            if not z["name"].strip(): fehler.append(f"{n}:{zeile(i, 'name')}:name: B03 {i}: Name leer")
            if not (isinstance(sw, list) and sw and all(isinstance(s, str) and s.strip() for s in sw)): fehler.append(f"{n}:{zeile(i, 'schreibweisen')}:schreibweisen: B03 {i}: keine Liste nicht leerer Texte")
            elif len(set(sw)) != len(sw): fehler.append(f"{n}:{zeile(i, 'schreibweisen')}:schreibweisen: B03 {i}: Schreibweise doppelt")
            elif z["name"] not in sw: fehler.append(f"{n}:{zeile(i, 'name')}:name: B03 {i}: Name «{z['name']}» nicht unter den Schreibweisen")
            if z["sitzland"] != NE and z["sitzland"] not in T.iso: fehler.append(f"{n}:{zeile(i, 'sitzland')}:sitzland: B04 {i}: «{z['sitzland']}» kein ISO-3166-1-alpha-2-Code")
            if z["sitzland"] != NE and z["sitzland_beleg"] in ("", NE): fehler.append(f"{n}:{zeile(i, 'sitzland_beleg')}:sitzland_beleg: B04 {i}: Sitzland ohne Beleg (E065, E118)")
        for k, ids in gesehen.items():
            if len(ids) > 1 and (nur is None or ids & set(nur)):
                i = sorted(ids & set(nur))[0] if nur is not None else sorted(ids)[0]
                fehler.append(f"{n}:{zeile(i, 'schreibweisen')}:schreibweisen: B03 Schreibweise «{k}» bei mehreren Anbietern {sorted(ids)}")
        return fehler

    def schreibe(self, tpfad, ppfad):
        with open(tpfad, "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f, lineterminator="\n"); w.writerow(KOPF_T)
            w.writerows([[z[c] if c != "schreibweisen" else json.dumps(z[c], ensure_ascii=False) for c in KOPF_T] for z in self.rows])
        with open(ppfad, "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f, lineterminator="\n"); w.writerow(["anbieter_id", "feld", "alt", "neu", "herkunft", "register_id", "quelle"]); w.writerows(self.proto)


def waehrungen(r, ix):
    p = r[ix["preis_optionen"]]
    if p in ("", NE): return set()
    try: return {o.get("currency") for o in json.loads(p) if isinstance(o, dict)} - {None, ""}
    except ValueError: return set()


def konsistenz(M, wo):
    """K15 (E214, E218): anbieter_id in der Tabelle, anbieter eine ihrer Schreibweisen, anbieter_land = Sitzland oder
    «nicht erfasst» (nie ein anderes Land); K16 (E216): höchstens eine Währung je Angebot. Am ganzen Master. Die Meldung
    nennt die verursachende Zeile des Laufs (Datei:Zeile:Spalte), sonst den Ort wo (z. B. «Schritt 026»)."""
    A, ix, fehler, Q = M.anbieter, M.ix, [], M.quellen
    def ort(rid, aid, felder, afelder, spalte):
        for k in [(rid, f) for f in felder] + [(rid, "*")] + [(("ANB", aid), f) for f in afelder]:
            if k in Q: d, nr, sp = Q[k]; return f"{d}:{nr}:{sp}"
        return f"{wo}:-:{spalte}"
    for r in M.rows:
        rid = r[ix["id"]]; aid = r[ix["anbieter_id"]]; a = A.byid.get(aid)
        if a is None: fehler.append(f"{ort(rid, aid, ['anbieter_id'], [], 'anbieter_id')}: K15 {rid}: «{aid}» nicht in der Anbieter-Tabelle"); continue
        if r[ix["anbieter"]] not in a["schreibweisen"]:
            fehler.append(f"{ort(rid, aid, ['anbieter', 'anbieter_id'], ['schreibweisen'], 'anbieter')}: K15 {rid}: «{r[ix['anbieter']]}» keine Schreibweise von {aid}")
        if r[ix["anbieter_land"]] not in (a["sitzland"], NE):
            fehler.append(f"{ort(rid, aid, ['anbieter_land', 'anbieter_id'], ['sitzland'], 'anbieter_land')}: K15 {rid}: «{r[ix['anbieter_land']]}» ≠ Sitzland {a['sitzland']} von {aid} (Sitzland oder «nicht erfasst», E218)")
        w = waehrungen(r, ix)
        if len(w) > 1: fehler.append(f"{ort(rid, aid, ['preis_optionen'], [], 'preis_optionen')}: K16 {rid}: mehrere Währungen {sorted(w)}")
    if fehler: raise Abbruch(fehler)


def modell_schritt_p27(M, T, basis=None):
    """P27 A1 (Schritt 026): Anbieter-Tabelle laden, 5 Spalten anhängen; anbieter_id je Zeile über die Schreibweisen
    (genau ein Treffer, sonst Abbruch); scope_code aus der Steuerspalte neuer Angebote (A4), sonst «nicht erfasst»;
    danach K15/K16 am ganzen Master. Eine Protokollzeile je gesetzter Zelle."""
    if any(c in M.head for c in P27_COLS): raise Abbruch(["ABBRUCH: Master enthält schon die Spalten aus P27"])
    pfad = pathlib.Path(basis or R / "daten/anbieter.csv")
    A = Anbieter(pfad, T)
    sw = {}
    for z in A.rows:
        for s in z["schreibweisen"]: sw.setdefault(s, []).append(z["anbieter_id"])
    fehler = []
    for r in M.rows:
        t = sw.get(r[M.ix["anbieter"]], [])
        if len(t) != 1: fehler.append(f"{pfad.name}:-:schreibweisen: A2 {r[M.ix['id']]}: «{r[M.ix['anbieter']]}» hat {len(t)} Treffer (genau einer verlangt)")
    if fehler: raise Abbruch(fehler)
    import hashlib
    quelle = f"claude-work/daten/anbieter.csv (SHA-256 {hashlib.sha256(pfad.read_bytes()).hexdigest()[:16]}…)"
    M.head = M.head + P27_COLS; M.neu_index(); ix = M.ix
    for r in M.rows:
        rid = r[ix["id"]]; aid = sw[r[ix["anbieter"]]][0]
        r.extend([aid, "ANBIETER_TABELLE_P27", NE, NE, "LEER"])
        M.proto.append([rid, "anbieter_id", NE, aid, "h_anbieter_id", "LEER", "ANBIETER_TABELLE_P27", "E214", quelle])
        if rid in M.scope_steuer:
            code, begr, herk, reg, q = M.scope_steuer[rid]
            r[ix["scope_code"]], r[ix["scope_begruendung"]], r[ix["h_scope_code"]] = code, begr, herk
            M.proto.append([rid, "scope_code", NE, code, "h_scope_code", "LEER", herk, reg, q])
            if begr != NE: M.proto.append([rid, "scope_begruendung", NE, begr, "h_scope_code", "LEER", herk, reg, q])
    M.anbieter = A
    konsistenz(M, "Schritt 026")


def anbieter_lauf(M, T, nnn, datum, p):
    """P27 A3, B01–B08: wendet die Anbieter-Datei auf die Tabelle an (Master unverändert); wirft Abbruch mit allen Fehlern."""
    n = p.name; head, zeilen = lies(p, KOPF_A, "B01"); A = M.anbieter; fehler = []; gesehen = set()
    F = lambda nr, sp, regel, grund: fehler.append(f"{n}:{nr}:{sp}: {regel} {grund}")
    neu_ids, proto, aend, zn = {}, [], {}, {}   # zn: (Kennung, Feld) bzw. Kennung → erste Zeile
    naechste = A.max_nr() + 1
    for nr, werte in zeilen:
        z = dict(zip(KOPF_A, werte)); vor = len(fehler); i, feld = z["anbieter_id"], z["feld"]
        for c in ("anbieter_id", "feld", "herkunft", "register_id", "quelle"):
            if not z[c].strip(): F(nr, c, "B05" if c in ("herkunft", "register_id", "quelle") else "B01", "leer")
        if feld and feld not in FELDER_A: F(nr, "feld", "B01", f"{feld} (zulässig {', '.join(FELDER_A)})")
        if (i, feld) in gesehen: F(nr, "feld", "B01", f"{i} + {feld} mehrmals in der Datei")
        gesehen.add((i, feld))
        if z["herkunft"] and z["herkunft"] not in T.herkunft: F(nr, "herkunft", "B05", f"{z['herkunft']} nicht in der Herkunftsliste")
        if z["register_id"]:
            g = pruefe_register(T, z["register_id"], False)
            if g: F(nr, "register_id", "B05", g[1])
        if VERBOTEN.fullmatch(z["quelle"].strip()): F(nr, "quelle", "B05", f"«{z['quelle']}» verboten (E204)")
        if z["alt"] == "(neu)":
            if i in A.byid: F(nr, "anbieter_id", "B02", f"{i} schon in der Tabelle (Korrektur mit altem Wert statt «(neu)»)")
            elif not ANB_MUSTER.fullmatch(i): F(nr, "anbieter_id", "B02", f"«{i}» nicht nach ANB-NNNN")
            elif i not in neu_ids:
                if int(i[4:]) != naechste: F(nr, "anbieter_id", "B02", f"{i} nicht fortlaufend (nächste Kennung ANB-{naechste:04d})")
                else: neu_ids[i] = {"anbieter_id": i, "name": "", "schreibweisen": None, "sitzland": None, "sitzland_beleg": NE,
                                    "herkunft": z["herkunft"], "register_id": z["register_id"], "quelle": z["quelle"]}; naechste += 1
        elif i not in A.byid: F(nr, "anbieter_id", "B02", f"{i} nicht in der Tabelle (neuer Anbieter: alt «(neu)»)")
        wert = z["neu"]
        if feld == "schreibweisen":
            try:
                wert = json.loads(z["neu"])
                if not (isinstance(wert, list) and wert and all(isinstance(x, str) and x.strip() for x in wert)): raise ValueError
            except ValueError: F(nr, "neu", "B03", "Schreibweisen als JSON-Liste nicht leerer Texte")
        elif feld == "sitzland" and z["neu"] != NE and z["neu"] not in T.iso: F(nr, "neu", "B04", f"«{z['neu']}» kein ISO-3166-1-alpha-2-Code")
        elif feld in ("name", "sitzland_beleg") and not z["neu"].strip(): F(nr, "neu", "B03" if feld == "name" else "B04", "leer")
        zn.setdefault(i, nr); zn.setdefault((i, feld), nr)
        if len(fehler) > vor: continue
        if z["alt"] == "(neu)":
            if i in neu_ids: neu_ids[i][feld] = wert; proto.append([i, feld, "(neu)", z["neu"], z["herkunft"], z["register_id"], z["quelle"]])
            continue
        a = aend.setdefault(i, dict(A.byid[i], schreibweisen=list(A.byid[i]["schreibweisen"])))
        ist = json.dumps(a[feld], ensure_ascii=False) if feld == "schreibweisen" else a[feld]
        alt_cmp = z["alt"]
        if feld == "schreibweisen":
            try: alt_cmp = json.dumps(json.loads(z["alt"]), ensure_ascii=False)
            except ValueError: pass
        if ist != alt_cmp: F(nr, "alt", "B02", f"{i}.{feld} ist «{ist}», Datei erwartet «{z['alt']}» (veralteter Nachtrag)"); continue
        a[feld] = wert; a["herkunft"], a["register_id"], a["quelle"] = z["herkunft"], z["register_id"], z["quelle"]
        proto.append([i, feld, z["alt"], z["neu"], z["herkunft"], z["register_id"], z["quelle"]])
    for i, a in neu_ids.items():
        if not a["name"]: F(zn[i], "name", "B03", f"{i}: neuer Anbieter ohne Zeile name")
        if a["sitzland"] is None: F(zn[i], "sitzland", "B04", f"{i}: neuer Anbieter ohne Zeile sitzland («nicht erfasst» zulässig)")
        if a["schreibweisen"] is None: a["schreibweisen"] = [a["name"]]
    if fehler: raise Abbruch(fehler)
    alt_rows, alt_by = A.rows, A.byid
    A.rows = [aend.get(z["anbieter_id"], z) for z in A.rows] + list(neu_ids.values())
    A.byid = {z["anbieter_id"]: z for z in A.rows}
    g = A.pruefe(T, n, nur=set(neu_ids) | set(aend), zeile=lambda i, f: zn.get((i, f), zn.get(i, "-")))
    if g: A.rows, A.byid = alt_rows, alt_by; raise Abbruch(g)
    A.proto.extend(proto)
    for (i, f), nr in [(k, v) for k, v in zn.items() if isinstance(k, tuple)]: M.quellen[(("ANB", i), f)] = (n, nr, f)
    return len(zeilen)


def schema_bericht(M, T):
    """A5 --schema-bericht: ganzer Master gegen die Feldtabelle, Abweichungen je Spalte (nur Bericht, kein Abbruch)."""
    zeilen = []
    for c in M.head:
        if c not in T.felder: zeilen.append((c, "-", len(M.rows), "Spalte fehlt in der Feldtabelle", "")); continue
        bsp, anz = {}, 0
        for r in M.rows:
            g = T.typfehler(c, r[M.ix[c]])
            if g: anz += 1; bsp.setdefault(g.split(":")[0], r[M.ix[c]])
        f = T.felder[c]
        zeilen.append((c, f["typ"] + (" " + f["codeliste"] if f["codeliste"] else ""), anz,
                       "; ".join(sorted(bsp)), "; ".join(f"«{v[:40]}»" for v in list(bsp.values())[:3])))
    return zeilen
