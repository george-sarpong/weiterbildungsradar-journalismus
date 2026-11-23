"""Paket 30, gemeinsame Textfunktionen für Abruf (Runner) und Tests (SPEZIFIKATION_PAKET30_20261123.md A2, §4).
Nur Standardbibliothek. Kein Seitentext verlässt den Runner: nach aussen gehen nur Hash und Fundstellen (≤ 200 Zeichen).

bereinige(html)  → Seite(text, haupttext, quelltext_daten, ld_werte, titel_tag)
hash_text(seite) → SHA-256 des bereinigten Haupttexts ohne wechselnde Werte (Uhrzeit, Zeitstempel, Sitzungskennung)
finde_titel / finde_datum / finde_preis / finde_wort → Fundstelle (Ort, Auszug) oder None
daten_auf_seite / preise_auf_seite → Kandidaten für neue Werte (Vorschlag, nie direkt in den Master)"""
import datetime, hashlib, html, html.parser, json, re, unicodedata

SKIP_TAGS = {"script", "style", "noscript", "svg", "iframe", "head", "object", "canvas"}   # <template> bleibt: Inhalt erscheint nach JavaScript (Befund digicomp.ch)
LEER_TAGS = {"br", "hr", "img", "input", "meta", "link", "area", "base", "col", "embed", "source", "track", "wbr", "param"}
BLOCK_TAGS = {"p", "div", "li", "tr", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6", "section", "article", "main", "header",
              "footer", "nav", "aside", "ul", "ol", "table", "dd", "dt", "dl", "form", "label", "option", "button", "span", "a"}
CONSENT = re.compile(r"^(?:cookie[-_]?(?:banner|consent|notice|bar|law|hinweis|popup|modal|overlay|layer|box|wrapper|container|info|message)s?|cookieconsent|cookie-?notice|cc-(?:window|banner)|"
                     r"onetrust.*|ot-sdk.*|didomi.*|usercentrics.*|uc-banner.*|cybotcookiebot.*|cookiebot.*|borlabs-cookie.*|klaro.*|tarteaucitron.*|iubenda.*|"
                     r"cmplz-.*|moove_gdpr.*|gdpr-cookie.*|consent-(?:banner|manager|layer|modal)|cmp-(?:banner|container|wrapper))$", re.I)
NIE_UEBERSPRINGEN = {"html", "body", "main", "article"}
HAUPT = ("main", "article")
AUSZUG = 200


class _P(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []          # (tag, skip, haupt)
        self.text, self.haupt, self.skript, self.ld, self.titel = [], [], [], [], []
        self._in_title = False
        self._ld = None
        self.h1, self._in_h1 = [], False

    def _skip(self): return any(s for _, s, _ in self.stack)
    def _haupt(self): return any(h for _, _, h in self.stack)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title": self._in_title = True
        if tag == "h1" and not self.h1: self._in_h1 = True
        if tag == "script":
            t = (a.get("type") or "").lower()
            self._ld = [] if "ld+json" in t else ("skript" if t in ("", "text/javascript", "application/json", "module") or "json" in t else None)
        for k, v in attrs:   # Termindaten in Attributen (data-*, datetime, content, value, x-data, :bind) zählen als Quelltext
            if v and (k.startswith("data-") or k in ("datetime", "content", "value", "x-data", "x-init") or k.startswith(":") or k.startswith("v-bind")):
                if re.search(r"\d", v): self.skript.append(v[:5000])
        if tag in LEER_TAGS:
            if tag == "br": self._add(" ")
            return
        if tag == "body":   # </head> darf fehlen (HTML5): offenen head-Bereich schliessen
            while self.stack and self.stack[-1][0] != "html": self.stack.pop()
        merk = (str(a.get("id") or "") + " " + str(a.get("class") or "")).split()
        verdeckt = any(CONSENT.match(x) for x in merk) or "hidden" in a or a.get("aria-hidden") == "true"
        skip = tag in SKIP_TAGS or (verdeckt and tag not in NIE_UEBERSPRINGEN and tag != "input")
        haupt = tag in HAUPT or a.get("role") == "main"
        self.stack.append((tag, skip, haupt))
        if tag in BLOCK_TAGS: self._add(" ")

    def handle_endtag(self, tag):
        if tag == "title": self._in_title = False
        if tag == "h1": self._in_h1 = False
        if tag == "script": self._ld = None
        for i in range(len(self.stack) - 1, -1, -1):   # tolerant gegen fehlende Endtags
            if self.stack[i][0] == tag:
                del self.stack[i:]; break
        if tag in BLOCK_TAGS: self._add(" ")

    def _add(self, s):
        if self._skip(): return
        self.text.append(s)
        if self._haupt(): self.haupt.append(s)

    def handle_data(self, data):
        if self._in_title: self.titel.append(data)
        if self._in_h1: self.h1.append(data)
        if isinstance(self._ld, list): self.ld.append(data); return
        if self._ld == "skript": self.skript.append(data); return
        if self._skip():   # verdeckter Inhalt (hidden, Auswahllisten u. a.): nicht Text, aber Quelltext für Termine und Preise
            if not any(t in ("style", "head") for t, _, _ in self.stack): self.skript.append(data)
            return
        self._add(data)


def _ws(s): return re.sub(r"\s+", " ", s).strip()


def _ld_werte(teile):
    """Werte aus JSON-LD (schema.org): startDate, endDate, price, lowPrice, highPrice, name; robust gegen ungültiges JSON."""
    out = []
    for t in teile:
        try: obj = json.loads(t)
        except (ValueError, RecursionError):
            out += [m.group(1) for m in re.finditer(r'"(?:startDate|endDate|price|lowPrice|highPrice|name)"\s*:\s*"?([^",}\]]{1,80})', t)]
            continue
        st = [obj]
        while st:
            o = st.pop()
            if isinstance(o, dict):
                for k, v in o.items():
                    if k in ("startDate", "endDate", "price", "lowPrice", "highPrice", "name") and isinstance(v, (str, int, float)): out.append(str(v))
                    elif isinstance(v, (dict, list)): st.append(v)
            elif isinstance(o, list): st.extend(o)
    return out


class Seite:
    __slots__ = ("text", "haupttext", "quelltext_daten", "ld_werte", "titel_tag", "h1")

    def __init__(self, text, haupttext, quelltext_daten, ld_werte, titel_tag, h1=""):
        self.text, self.haupttext, self.quelltext_daten, self.ld_werte, self.titel_tag, self.h1 = text, haupttext, quelltext_daten, ld_werte, titel_tag, h1


def bereinige(roh):
    p = _P()
    try: p.feed(roh); p.close()
    except Exception: pass   # kaputtes HTML: verwerten, was gelesen wurde
    text = _ws(html.unescape("".join(p.text)))
    haupt = _ws(html.unescape("".join(p.haupt)))
    if len(text) < 300:   # Rückfall bei unüblichem Aufbau: Tags grob entfernen (wie Handprobe U3)
        t2 = re.sub(r"(?is)<(script|style|noscript|svg)\b.*?</\1\s*>", " ", roh)
        t2 = _ws(html.unescape(re.sub(r"(?s)<[^>]+>", " ", re.sub(r"(?s)<!--.*?-->", " ", t2))))
        if len(t2) > len(text) + 500: text = haupt = t2
    if len(haupt) < 200: haupt = text
    skript = _ws(" ".join(p.skript))[:2_000_000]
    return Seite(text, haupt, skript, _ld_werte(p.ld), _ws(html.unescape("".join(p.titel))), _ws(html.unescape("".join(p.h1))))


# ---- Hash: wechselnde Werte vor dem Hash entfernen (Q04) ----
_WECHSEL = [
    re.compile(r"\b\d{4}-\d{2}-\d{2}[T ]\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?\b"),   # ISO-Zeitstempel
    re.compile(r"\b\d{1,2}:\d{2}(?::\d{2})?(?:\s?(?:Uhr|h|am|pm|AM|PM))?\b"),                           # Uhrzeit
    re.compile(r"\b[0-9a-fA-F]{16,}\b"),                                                               # Hex-Kennungen
    re.compile(r"\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{24,}\b"),                # Sitzungs-/Token-Kennungen
    re.compile(r"(?i)\b(?:session|sid|token|csrf|nonce)[\s:=]+\S+"),
]


def hash_text(seite):
    t = seite.haupttext
    for r in _WECHSEL: t = r.sub(" ", t)
    return hashlib.sha256(_ws(t).encode("utf-8")).hexdigest()


# ---- Normalisierung für den Vergleich ----
def norm(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.casefold().replace("ß", "ss")
    s = re.sub(r"[’'`´ʼ‘]", "'", s)
    s = re.sub(r"[^\w']+|_", " ", s)
    s = s.replace("'", " ")
    return _ws(s)


STOPP = set("""der die das und oder mit fur von im in am an zu zum zur den dem des ein eine einer einen auf aus bei nach uber unter vor
le la les de du des et ou en au aux un une pour par sur avec dans
il lo gli e di da per con su nel della delle
the and or of for to in on at with a an by from
kurs kurse cours corso course seminar workshop training formation""".split())


def woerter(s): return [w for w in norm(s).split() if len(w) >= 3 and w not in STOPP]


def auszug(text, a, b):
    """Auszug um [a, b) höchstens AUSZUG Zeichen."""
    rest = max(0, AUSZUG - (b - a)); l = rest // 2
    s, e = max(0, a - l), min(len(text), b + (rest - l))
    return text[s:e].strip()[:AUSZUG]


def _such(rx, seite, orte=("text", "ld", "quelltext")):
    for ort in orte:
        if ort == "text":
            m = rx.search(seite.text)
            if m: return ("text", auszug(seite.text, m.start(), m.end()))
        elif ort == "ld":
            for v in seite.ld_werte:
                if rx.search(v): return ("strukturiert", v[:AUSZUG])
        elif ort == "quelltext":
            m = rx.search(seite.quelltext_daten)
            if m: return ("quelltext", auszug(seite.quelltext_daten, m.start(), m.end()))
    return None


def finde_titel(titel, seite):
    """Ganzer Titel normalisiert, sonst mindestens drei Viertel der Titelwörter (mind. 2, Wörter ab 3 Zeichen ohne Füllwörter)
    im Seitentitel oder im Text innerhalb von 40 Wörtern; Fundstelle aus dem Originaltext, sonst normalisiert."""
    nt = norm(titel)
    if not nt: return None
    ntext = norm(seite.text)
    h1 = getattr(seite, "h1", "") or ""
    for quelle, nq in (("seitentitel", norm(seite.titel_tag)), ("h1", norm(h1)), ("text", ntext)):
        if nt and f" {nt} " in f" {nq} ":
            return (quelle, _orig_auszug(titel, seite) or seite.titel_tag[:AUSZUG])
    ws = list(dict.fromkeys(woerter(titel)))
    if len(ws) < 2: return None
    need = max(2, -(-len(ws) * 3 // 4))
    for quelle, roh_q in (("seitentitel", seite.titel_tag), ("h1", h1)):
        nq = norm(roh_q)
        if sum(1 for w in ws if f" {w} " in f" {nq} ") >= need: return (quelle, roh_q[:AUSZUG])
    toks = ntext.split()
    pos = {}
    for i, w in enumerate(toks): pos.setdefault(w, []).append(i)
    for i in pos.get(ws[0], []) + [j for w in ws[1:2] for j in pos.get(w, [])]:
        fenster = set(toks[max(0, i - 15): i + 25])
        if sum(1 for w in ws if w in fenster) >= need:
            return ("text", " ".join(toks[max(0, i - 5): i + 25])[:AUSZUG])
    return None


def _orig_auszug(titel, seite):
    ws = [w for w in re.split(r"\W+", titel) if w]
    if not ws: return None
    m = re.search(r"\W*".join(map(re.escape, ws)), seite.text, re.I)
    return auszug(seite.text, m.start(), m.end()) if m else None


MONATE = {
    1: "januar jan janvier janv gennaio gen january", 2: "februar feb fevrier fevr fev febbraio february", 3: "marz maerz mar mars marzo march",
    4: "april apr avril avr aprile", 5: "mai maggio mag may", 6: "juni jun juin giugno giu june",
    7: "juli jul juillet juil luglio lug july", 8: "august aug aout agosto ago", 9: "september sep sept septembre settembre set",
    10: "oktober okt oct octobre ottobre ott october", 11: "november nov novembre", 12: "dezember dez dec decembre dicembre dic december"}
_MONAT_ZU_NR = {w: n for n, s in MONATE.items() for w in s.split()}
_BIS = r"(?:[-–—]|bis|au|al|to|until|jusqu'au)"


def _monat_rx(m): return r"(?:" + "|".join(sorted(MONATE[m].split(), key=len, reverse=True)) + r")\.?"


def _datum_rx(d):
    """Regex (auf normierter Seite ohne Akzente, casefold, Satzzeichen erhalten) für Datum d in üblichen Schreibweisen."""
    D, M, Y, y2 = d.day, d.month, d.year, d.year % 100
    dd = rf"0?{D}" if D < 10 else str(D); mm = rf"0?{M}" if M < 10 else str(M)
    mon = _monat_rx(M)
    teile = [
        rf"(?<!\d){dd}\s?\.\s?{mm}\s?\.\s?(?:{Y}|{y2:02d})(?!\d)",                          # 12.03.2027, 12. 3. 27
        rf"(?<!\d){dd}\s?\.?\s?{_BIS}\s?\d{{1,2}}\s?\.\s?{mm}\s?\.\s?{Y}(?!\d)",              # 01.–02.03.2027
        rf"(?<![\d-]){Y}-0?{M}-0?{D}(?![\d])",                                             # 2027-03-12
        rf"(?<!\d){dd}/{mm}/(?:{Y}|{y2:02d})(?!\d)",                                       # 12/03/2027
        rf"(?<!\d){dd}(?:er|\.)?\s+{mon}\s*,?\s*{Y}(?!\d)",                                 # 12. März 2027, 1er mars 2027
        rf"(?<!\d){dd}(?:er|\.)?\s?{_BIS}\s?\d{{1,2}}(?:er|\.)?\s+{mon}\s*,?\s*{Y}(?!\d)",   # 14 au 15 décembre 2026
        rf"(?<!\d){dd}(?:er|\.)?\s+{mon}\s*,?\s*{_BIS}\s*\d{{1,2}}(?:er|\.)?\s+[a-z]+\.?\s*,?\s*{Y}(?!\d)",  # 18 novembre au 9 décembre 2026
        rf"\b{mon}\s+{dd}(?:st|nd|rd|th)?\s*,?\s*{Y}(?!\d)",                                 # January 21 2027, March 3, 2027
        rf"(?<!\d){dd}\s?\.\s?{mm}\s?\.\s?{_BIS}\s?\d{{1,2}}\s?\.\s?\d{{1,2}}\s?\.\s?{Y}(?!\d)",  # 18.11.–09.12.2026
    ]
    return re.compile("|".join(f"(?:{t})" for t in teile))


def _norm_datum(s):
    s = unicodedata.normalize("NFKD", s); s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", s.casefold().replace("ä", "a"))


class _NormSeite:
    def __init__(self, seite):
        self.text = _norm_datum(seite.text); self.ld_werte = [_norm_datum(v) for v in seite.ld_werte]
        self.quelltext_daten = _norm_datum(seite.quelltext_daten); self._orig = seite


def finde_datum(d, seite):
    """d: datetime.date. Fundstelle im Text, in strukturierten Daten oder in Termindaten des Quelltexts.
    Gesucht wird in normierter Form (ohne Akzente, Kleinschreibung); der Auszug kommt aus dem Original an gleicher Stelle."""
    if not isinstance(d, datetime.date): return None
    ns = seite if isinstance(seite, _NormSeite) else _NormSeite(seite)
    rx = _datum_rx(d); o = ns._orig
    m = rx.search(ns.text)
    if m: return ("text", auszug(o.text if len(o.text) == len(ns.text) else ns.text, m.start(), m.end()))
    for v, ov in zip(ns.ld_werte, o.ld_werte):
        if rx.search(v): return ("strukturiert", ov[:AUSZUG])
    m = rx.search(ns.quelltext_daten)
    if m: return ("quelltext", auszug(ns.quelltext_daten, m.start(), m.end()))
    return None


def _preis_rx(betrag):
    b = round(float(betrag), 2)
    ganz, rest = int(b), round(b - int(b), 2)
    g = str(ganz)
    if len(g) > 3:
        teile = []
        while len(g) > 3: teile.insert(0, g[-3:]); g = g[:-3]
        teile.insert(0, g)
        gz = r"[’'.\s  ,]?".join(teile)
    else:
        gz = g
    if rest:
        dez = f"{int(round(rest * 100)):02d}"
        nach = rf"[.,]{dez}(?!\d)"
    else:
        nach = r"(?:[.,](?:00|–|-|—)(?!\d)|(?![.,]\d))"
    return re.compile(rf"(?<![\d’'.,]){gz}{nach}(?!\d)(?![’'.,\u00a0\u202f]\d{{3}}(?!\d))")


_WAEHR_NAH = re.compile(r"CHF|SFr|Fr\.|EUR|€|Euro|USD|US\$|\$|francs?|franchi|[.,]\s?[–—-](?!\d)|Preis|Prix|Prezzo|Price|Kosten|Gebühr|tarif|costo|frais", re.I)


def finde_preis(betrag, seite):
    """Betrag mit Währung oder Preiswort höchstens 25 Zeichen davor oder danach (nicht Postleitzahl, Telefon, Dauer);
    in strukturierten Daten genügt ein reiner Zahlwert (Feld price)."""
    if betrag in (None, "") or float(betrag) <= 0: return None
    rx = _preis_rx(betrag)
    for ort, q in (("text", seite.text), ("quelltext", seite.quelltext_daten)):
        for m in rx.finditer(q):
            if _WAEHR_NAH.search(q[max(0, m.start() - 25):m.end() + 25]): return (ort, auszug(q, m.start(), m.end()))
    for v in seite.ld_werte:
        if re.fullmatch(r"\s*[\d.,’' ]+\s*", v) and rx.fullmatch(v.strip()): return ("strukturiert", v[:AUSZUG])
    return None


def finde_wort(wert, seite):
    """Freitext-Wert (Ort, Dauer, Anbieter …) als ganze Wörter normalisiert im Text; Fundstelle ≤ 200 Zeichen."""
    nw = norm(wert or "")
    if len(nw) < 2: return None
    nt = norm(seite.text)
    i = f" {nt} ".find(f" {nw} ")
    if i < 0: return None
    toks_vor = nt[:i].count(" ")
    toks = nt.split()
    return ("text", " ".join(toks[max(0, toks_vor - 8): toks_vor + len(nw.split()) + 12])[:AUSZUG])


_ALLE_DATEN = [
    (re.compile(r"(?<!\d)(\d{1,2})\s?\.\s?(\d{1,2})\s?\.\s?(\d{4})(?!\d)"), lambda m: (int(m[3]), int(m[2]), int(m[1]))),
    (re.compile(r"(?<![\d-])(\d{4})-(\d{2})-(\d{2})(?!\d)"), lambda m: (int(m[1]), int(m[2]), int(m[3]))),
    (re.compile(r"(?<!\d)(\d{1,2})(?:er|\.)?\s+([a-z]{3,9})\.?\s*,?\s*(\d{4})(?!\d)"), lambda m: (int(m[3]), _MONAT_ZU_NR.get(m[2]), int(m[1]))),
    (re.compile(r"\b([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(\d{4})(?!\d)"), lambda m: (int(m[3]), _MONAT_ZU_NR.get(m[1]), int(m[2]))),
    (re.compile(r"(?<!\d)(\d{1,2})(?:er|\.)?\s?" + _BIS + r"\s?\d{1,2}(?:er|\.)?\s+([a-z]{3,9})\.?\s*,?\s*(\d{4})(?!\d)"), lambda m: (int(m[3]), _MONAT_ZU_NR.get(m[2]), int(m[1]))),
    (re.compile(r"(?<!\d)(\d{1,2})(?:er|\.)?\s+([a-z]{3,9})\.?\s*" + _BIS + r"\s*\d{1,2}(?:er|\.)?\s+[a-z]+\.?\s*,?\s*(\d{4})(?!\d)"), lambda m: (int(m[3]), _MONAT_ZU_NR.get(m[2]), int(m[1]))),
    (re.compile(r"(?<!\d)(\d{1,2})\s?\.?\s?" + _BIS + r"\s?\d{1,2}\s?\.\s?(\d{1,2})\s?\.\s?(\d{4})(?!\d)"), lambda m: (int(m[3]), int(m[2]), int(m[1]))),
]


def daten_auf_seite(seite, ab, n=10):
    """Bis n verschiedene Daten ≥ ab (ISO, sortiert) aus Text und strukturierten Daten; Kandidaten für einen neuen Termin."""
    ns = _NormSeite(seite); gef = set()
    for quelle in [ns.text] + ns.ld_werte:
        for rx, f in _ALLE_DATEN:
            for m in rx.finditer(quelle):
                try:
                    y, mo, d = f(m)
                    if mo: x = datetime.date(y, mo, d)
                    else: continue
                except (ValueError, TypeError): continue
                if ab <= x <= ab.replace(year=ab.year + 3): gef.add(x)
    return [x.isoformat() for x in sorted(gef)[:n]]


_WAEHR = r"(?:CHF|Fr\.|SFr\.?|EUR|€|USD|US\$|\$)"
_BETRAG = r"(\d{1,3}(?:[’'.\s  ]\d{3})+|\d+)(?:[.,](\d{2}|–|-))?"
_PREIS_ALLE = re.compile(rf"{_WAEHR}\s?{_BETRAG}|{_BETRAG}\s?{_WAEHR}")


def preise_auf_seite(seite, n=10):
    """Bis n verschiedene Beträge mit Währung aus dem Text (Kandidaten); Währung roh."""
    gef = []
    for m in _PREIS_ALLE.finditer(seite.text):
        g = m.group(1) or m.group(3); dz = m.group(2) or m.group(4)
        w = re.search(_WAEHR, m.group(0)).group(0)
        try: v = float(re.sub(r"\D", "", g) + ("." + dz if dz and dz.isdigit() else ""))
        except ValueError: continue
        k = (w.replace("Fr.", "CHF").replace("SFr.", "CHF").replace("€", "EUR"), v)
        if v > 0 and k not in gef: gef.append(k)
        if len(gef) >= n: break
    return [f"{w} {v:g}" for w, v in gef]


# ---------------- Paket 31: Auslese von Kandidaten für fehlende Felder (E266–E268) ----------------
_KONTEXT_TERMIN = re.compile(r"termin|datum|daten|durchf|kursbeginn|beginn|start|dates?|session|du |le |dal |il |kursdaten|zeitraum|when|quand|quando", re.I)
_DAUER = re.compile(r"(?<![\d.,])(\d{1,3}(?:[.,]\d)?(?:\s?[–-]\s?\d{1,3})?)\s?(halbe?\s)?(Tage?n?|Kurstage?|Halbtage?|jours?|demi-journées?|giorni|giornate|days?|Stunden|Std\.?|Lektionen|heures|ore|hours?|h\b|Wochen|semaines|settimane|weeks?|Monate|mois|mesi|months?|Semester|semestres?|ECTS)", re.I)
_FORM = {"PRÄSENZ": r"präsenz|praesenz|vor ort|präsenzunterricht|en présentiel|présentiel|presentiel|in presenza|classroom|in person|kursraum|salle de cours",
         "ONLINE LIVE": r"online[- ]?live|live[- ]?online|virtuell|virtual classroom|webinar|zoom|teams|à distance|a distanza|classe à distance|remote",
         "ONLINE SELBSTLERNEN": r"e-learning|elearning|selbstlern|self[- ]paced|mooc|on[- ]demand|à votre rythme|in autonomia",
         "HYBRID": r"hybrid|blended"}
_SPRACHE = {"DE": r"\b(?:deutsch|german|allemand|tedesco)\b", "FR": r"\b(?:französisch|franzoesisch|french|français|francais|francese)\b",
            "IT": r"\b(?:italienisch|italian|italien|italiano)\b", "EN": r"\b(?:englisch|english|anglais|inglese)\b"}
_SPRACH_KONTEXT = re.compile(r"sprache|langue|lingua|language|kurssprache|unterrichtssprache", re.I)
_NIVEAU = {"EINSTIEG": r"einsteiger|einstieg|anfänger|grundlagen|grundkurs|basis|débutant|debutant|initiation|introduction|principiant|base\b|beginner|basics",
           "VERTIEFUNG": r"vertiefung|aufbau|fortgeschritten|perfectionnement|approfondissement|avancé|intermédiaire|avanzato|intermediate|advanced",
           "BERUFSERFAHRUNG": r"berufserfahrung|praxiserfahrung|erfahrene|expérience professionnelle|esperienza professionale|professionals with experience",
           "VERSCHIEDENE_NIVEAUS": r"alle niveaus|alle stufen|tous niveaux|tutti i livelli|all levels"}
_ANFRAGE = re.compile(r"auf anfrage|nach vereinbarung|jederzeit|laufend(?:er)? einstieg|on demand|sur demande|à la demande|sur rendez-vous|su richiesta|in qualsiasi momento|anytime|self-paced|individuell vereinbar", re.I)
ORTE = ["Zürich", "Zurich", "Basel", "Bern", "Luzern", "Lucerne", "Genf", "Genève", "Geneva", "Lausanne", "St. Gallen", "Winterthur", "Lugano", "Bellinzona",
        "Biel", "Bienne", "Freiburg", "Fribourg", "Neuenburg", "Neuchâtel", "Sion", "Sitten", "Chur", "Aarau", "Olten", "Zug", "Baar", "Thun", "Solothurn",
        "Schaffhausen", "Frauenfeld", "Wil", "Sierre", "Delémont", "Yverdon", "Montreux", "Vevey", "Locarno", "Mendrisio", "Vaduz", "Schaan", "Wien", "Graz",
        "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Krems", "St. Pölten", "Dornbirn", "Bregenz", "Liebefeld", "Online"]
_ORT_RX = re.compile(r"\b(" + "|".join(re.escape(o) for o in ORTE) + r")\b")
_ORT_KONTEXT = re.compile(r"\bort\b|kursort|durchführungsort|lieu|luogo|location|adresse|standort|venue", re.I)


def _treffer(rx, text, n, breite=60):
    out = []
    for m in rx.finditer(text):
        out.append((m, auszug_kurz(text, m.start(), m.end(), breite)))
        if len(out) >= n: break
    return out


def auszug_kurz(text, a, b, breite=60):
    return text[max(0, a - breite):min(len(text), b + breite)].strip()[:AUSZUG]


def extrakt(seite, ab):
    """Kandidaten je Feld mit Auszug (≤ 200 Zeichen). Nur Vorschläge: Claude prüft, bevor etwas über eingang/ in den Master geht."""
    ns = _NormSeite(seite); tx = seite.text; gleich = len(ns.text) == len(tx)
    termine = []
    for v in seite.ld_werte:   # strukturierte Daten zuerst
        m = re.match(r"(\d{4}-\d{2}-\d{2})", v)
        if m:
            try: x = datetime.date.fromisoformat(m.group(1))
            except ValueError: continue
            if x >= ab and all(e["datum"] != x.isoformat() for e in termine): termine.append({"datum": x.isoformat(), "quelle": "strukturiert", "auszug": v[:60], "kontext": True})
    for rx, f in _ALLE_DATEN:
        for m in rx.finditer(ns.text):
            try:
                y, mo, d = f(m)
                if not mo: continue
                x = datetime.date(y, mo, d)
            except (ValueError, TypeError): continue
            if not (ab <= x <= ab.replace(year=ab.year + 3)) or any(e["datum"] == x.isoformat() and e["quelle"] == "text" for e in termine): continue
            az = auszug_kurz(tx if gleich else ns.text, m.start(), m.end())
            termine.append({"datum": x.isoformat(), "quelle": "text", "auszug": az, "kontext": bool(_KONTEXT_TERMIN.search(az))})
            if len(termine) >= 16: break
    termine.sort(key=lambda e: (e["datum"], e["quelle"]))
    preise = []
    for m in _PREIS_ALLE.finditer(tx):
        g = m.group(1) or m.group(3); dz = m.group(2) or m.group(4)
        w = re.search(_WAEHR, m.group(0)).group(0)
        try: v = float(re.sub(r"\D", "", g) + ("." + dz if dz and dz.isdigit() else ""))
        except ValueError: continue
        w = {"Fr.": "CHF", "SFr.": "CHF", "SFr": "CHF", "€": "EUR", "US$": "USD", "$": "USD"}.get(w, w)
        if v > 0 and not any(p["betrag"] == v and p["waehrung"] == w for p in preise):
            preise.append({"betrag": v, "waehrung": w, "auszug": auszug_kurz(tx, m.start(), m.end())})
        if len(preise) >= 8: break
    dauer = [{"wert": _ws(m.group(0)), "auszug": a} for m, a in _treffer(_DAUER, tx, 6)]
    form = {k: [a for _, a in _treffer(re.compile(v, re.I), tx, 2)] for k, v in _FORM.items()}
    sprache = {k: [a for m, a in _treffer(re.compile(v, re.I), tx, 3) if _SPRACH_KONTEXT.search(a)][:2] for k, v in _SPRACHE.items()}
    niveau = {k: [a for _, a in _treffer(re.compile(v, re.I), tx, 2)] for k, v in _NIVEAU.items()}
    orte = [{"ort": m.group(1), "auszug": a, "kontext": bool(_ORT_KONTEXT.search(a))} for m, a in _treffer(_ORT_RX, tx, 8)]
    anfrage = [a for _, a in _treffer(_ANFRAGE, tx, 3)]
    return {"termine": termine, "preise": preise, "dauer": dauer, "kursform": {k: v for k, v in form.items() if v},
            "sprache": {k: v for k, v in sprache.items() if v}, "niveau": {k: v for k, v in niveau.items() if v}, "orte": orte, "anfrage": anfrage}
