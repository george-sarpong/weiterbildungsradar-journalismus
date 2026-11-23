"""Paket 30: Katalogwerte je Master-Zeile für Abruf, Abgleich und Prüfblatt (SPEZIFIKATION_PAKET30_20261123.md A2, A3, A6).
Liest nur den Master. Unbekanntes («nicht erfasst», Platzhalter) wird nicht gesucht (E031).

pruefdatum(z, t)  → nächster Termin aus den Durchführungen (Start ≥ t), sonst start_datum (wie scripts/sichtbarkeit.py)
betraege(z)       → Beträge der Preisoptionen (EXACT, RANGE, FROM; nicht PROMOTIONAL, FREE, NOT_PUBLISHED, ON_REQUEST)
pruefblatt_felder(z) → Katalogwert je Prüfblatt-Feld (Titel, Anbieter, Datum, Ort, Kursform, Sprache, Dauer, Preis)
suchbegriffe(z)   → je Prüfblatt-Feld die Wörter, nach denen die Seite durchsucht wird (nur für die Fundstelle)"""
import json, pathlib, re, sys

sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(R / "scripts"))
import sichtbarkeit as S  # noqa: E402

NE = S.NE
PLATZHALTER = {"", NE, "NICHT_PUBLIZIERT", "NOT_PUBLISHED", "PREIS_NICHT_PUBLIZIERT", "ON_REQUEST", "SUR_DEMANDE", "ON_REQUEST_FORMAT"}
FELDER = ["titel", "anbieter", "datum", "ort", "kursform", "sprache", "dauer", "preis"]


def wert(z, *felder):
    for f in felder:
        v = (z.get(f) or "").strip()
        if v and v not in PLATZHALTER: return v
    return ""


def durchfuehrungen(z):
    s = z["durchfuehrungen_anzeige"] or z["durchfuehrungen"]
    if not s or s == NE: return []
    try: return json.loads(s)
    except ValueError: return []


def pruefdatum(z, t):
    ds = [S.datum(e.get("startDate")) for e in durchfuehrungen(z)]
    ds = sorted(x for x in ds if x and x >= t)
    if ds: return ds[0]
    return S.datum(z["start_datum"])


def preisoptionen(z):
    s = z["preis_optionen"]
    if not s.startswith("["): return []
    try: return json.loads(s)
    except ValueError: return []


def betraege(z):
    out = []
    for o in preisoptionen(z):
        typ = o.get("amountType"); tk = o.get("tariffClass")
        if tk == "PROMOTIONAL": continue
        if typ == "EXACT": kand = [o.get("amount")]
        elif typ == "RANGE": kand = [o.get("minAmount"), o.get("maxAmount")]
        elif typ == "FROM": kand = [o.get("amount") if o.get("amount") is not None else o.get("minAmount")]
        else: continue
        for a in kand:
            if a is None: continue
            try: a = float(a)
            except (TypeError, ValueError): continue
            if a > 0 and a not in out: out.append(a)
    return out


def preis_kostenlos(z): return any(o.get("amountType") == "FREE" and o.get("tariffClass") == "REGULAR" for o in preisoptionen(z))


SPRACHE = {"DE": "Deutsch", "FR": "Französisch", "IT": "Italienisch", "EN": "Englisch", "RM": "Rätoromanisch", "ES": "Spanisch"}
SPRACH_WOERTER = {"DE": ["deutsch", "german", "allemand", "tedesco"], "FR": ["französisch", "franzoesisch", "french", "français", "francais", "francese"],
                  "IT": ["italienisch", "italian", "italien", "italiano"], "EN": ["englisch", "english", "anglais", "inglese"]}
FORM_WOERTER = {"PRÄSENZ": ["präsenz", "praesenz", "vor ort", "présentiel", "presentiel", "en classe", "in presenza", "classroom", "in person"],
                "ONLINE LIVE": ["online", "live online", "virtuell", "virtual", "à distance", "a distance", "zoom", "webinar"],
                "ONLINE SELBSTLERNEN": ["selbstlern", "e-learning", "elearning", "self-paced", "mooc", "on demand", "online"],
                "ON_DEMAND": ["on demand", "on-demand", "jederzeit", "e-learning"], "HYBRID": ["hybrid", "vor ort", "virtuell", "online"],
                "ONLINE": ["online"]}


def pruefblatt_felder(z, t):
    d = pruefdatum(z, t)
    bs = betraege(z)
    if bs: preis = " / ".join(f"{a:g}" for a in bs) + (f" ({z['preis_text']})" if wert(z, "preis_text") else "")
    elif preis_kostenlos(z): preis = "kostenlos"
    else: preis = wert(z, "preis_anzeige", "preis_text")
    sp = [SPRACHE.get(c, c) for c in wert(z, "sprache").split("|") if c]
    return {"titel": wert(z, "titel"), "anbieter": wert(z, "anbieter"), "datum": d.isoformat() if d else wert(z, "termin_anzeige", "termin_text"),
            "ort": wert(z, "ort_anzeige", "ort_text"), "kursform": wert(z, "format").replace("|", " · "), "sprache": " · ".join(sp),
            "dauer": wert(z, "dauer_anzeige", "dauer"), "preis": preis}


def _orte(s):
    teile = re.split(r"[;,/|()]| und | oder | et | ou |·", s)
    return [x.strip() for x in teile if 2 < len(x.strip()) <= 40 and not re.search(r"\d{4}|[A-Z_]{5,}|exact|venue|published|request", x)][:4]


def suchbegriffe(z):
    """Wörter je Prüfblatt-Feld für die Fundstelle (Titel, Datum, Preis sucht p30_text eigens)."""
    f = wert(z, "format")
    form = []
    for c in f.split("|"):
        form += FORM_WOERTER.get(c, [])
    sp = []
    for c in wert(z, "sprache").split("|"): sp += SPRACH_WOERTER.get(c, [])
    dauer = wert(z, "dauer_anzeige", "dauer")
    m = re.match(r"\s*([\d.,–-]+\s*[A-Za-zÄÖÜäöüéè.]+)", dauer)
    an = wert(z, "anbieter")
    an_kurz = re.split(r"\s[-–(]|\s\(", an)[0].strip()
    return {"anbieter": list(dict.fromkeys(x for x in (an, an_kurz) if x)), "ort": _orte(wert(z, "ort_anzeige", "ort_text")),
            "kursform": list(dict.fromkeys(form)), "sprache": list(dict.fromkeys(sp)), "dauer": [m.group(1).strip()] if m else []}


def abrufmenge(rows, t, extra_ids=(), nur_extra=False):
    """Zeilen, deren Kurslink abgerufen wird: alle am Stichtag sichtbaren (Entscheid 3 A, E261) plus extra_ids (Testmenge)."""
    extra = set(extra_ids)
    sel = [z for z in rows if (z["id"] in extra) or (not nur_extra and S.sichtbar(z, t))]
    fehlend = extra - {z["id"] for z in sel}
    if fehlend: raise ValueError(f"unbekannte IDs: {sorted(fehlend)}")
    return sel
