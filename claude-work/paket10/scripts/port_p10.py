"""Paket 10: Owner-Entscheid E093 (10.11.) – fehlende Angaben neutral als «keine Angabe».
app-v37.js (Paket 9) -> app-v38.js; methodik.html (Paket 9) -> Paket 10. Daten bleiben unverändert.
Aufruf: python3 -I port_p10.py <paket9/website> <paket10/website>. Jede Ersetzung muss genau einmal passen."""
import hashlib
import pathlib
import sys

APP = [
 ("Niveau-Platzhalter", '      EXPERT: "Expert",\n      NICHT_PUBLIZIERT: "nicht erfasst"\n',
  '      EXPERT: "Expert",\n      NICHT_PUBLIZIERT: "keine Angabe"\n'),
 ("Preiskategorie", '      PREIS_NICHT_PUBLIZIERT: "Preis nicht erfasst",\n', '      PREIS_NICHT_PUBLIZIERT: "Preis: keine Angabe",\n'),
 ("Format-Platzhalter", '      "ON_REQUEST_FORMAT": "Format auf Anfrage",\n      "NICHT_PUBLIZIERT": "nicht erfasst"\n',
  '      "ON_REQUEST_FORMAT": "Format auf Anfrage",\n      "NICHT_PUBLIZIERT": "keine Angabe"\n'),
 ("Sprach-Platzhalter", '      IT: "Italienisch",\n      NOT_PUBLISHED: "nicht erfasst"\n', '      IT: "Italienisch",\n      NOT_PUBLISHED: "keine Angabe"\n'),
 ("Kommentar Codes", "  // E086/E087 (Paket 9): Rohcodes in Anzeigetexten lesbar machen; Platzhalter als «nicht erfasst».\n",
  "  // E086/E087 (Paket 9), E093 (Paket 10): Rohcodes in Anzeigetexten lesbar machen; Platzhalter als «keine Angabe».\n"),
 ("Codes NOT_PUBLISHED", '    NOT_PUBLISHED: "nicht erfasst", NICHT_PUBLIZIERT: "nicht erfasst",\n',
  '    NOT_PUBLISHED: "keine Angabe", NICHT_PUBLIZIERT: "keine Angabe",\n'),
 ("neutralMissing", '  const readableCodes = value => String(value ?? "").replace(/\\b[A-Z]{2,}(?:_[A-Z]+)+\\b/g, code => CODE_TEXT[code] ?? code);\n',
  '  const readableCodes = value => String(value ?? "").replace(/\\b[A-Z]{2,}(?:_[A-Z]+)+\\b/g, code => CODE_TEXT[code] ?? code);\n'
  '  // E093 (Paket 10): fehlende Angaben neutral. In Anzeigetexten wird «X nicht publiziert» bzw. «kein X publiziert»\n'
  '  // zu «X: keine Angabe»; steht X für das Feld selbst (z. B. «Dauer nicht publiziert»), bleibt «keine Angabe».\n'
  '  // Nur die Anzeige ändert sich; andere Formulierungen bleiben wörtlich stehen.\n'
  '  const MISSING = "keine Angabe";\n'
  '  const neutralMissing = (value, field = "") => String(value ?? "").split(/(\\s*;\\s*|\\s+\\/\\s+|,\\s+)/).map((part, index) => {\n'
  '    const negated = part.match(/^(.*?)\\s*\\b(?:noch\\s+)?nicht\\s+(?:separat\\s+)?publiziert\\.?(\\s*\\([^)]*\\))?$/i);\n'
  '    const none = negated ? null : part.match(/^kein(?:e|en|er|es)?\\s+(.+?)\\s+publiziert\\.?(\\s*\\([^)]*\\))?$/i);\n'
  '    const match = negated || none;\n'
  '    if (!match) return part;\n'
  '    let subject = match[1].trim();\n'
  '    const tail = match[2] || "";\n'
  '    if (!subject || normalize(subject) === normalize(field)) return `${MISSING}${tail}`;\n'
  '    if (index === 0) subject = subject.charAt(0).toUpperCase() + subject.slice(1);\n'
  '    return `${subject}: ${MISSING}${tail}`;\n'
  '  }).join("");\n'),
 ("NOT_RECORDED", '  const NOT_RECORDED = "nicht erfasst";\n', '  const NOT_RECORDED = MISSING;\n'),
 ("Kommentar Filter", "sonst «nicht erfasst».\n  const placeFilterValues", "sonst «keine Angabe» (E093).\n  const placeFilterValues"),
 ("Kommentar Anbieterland", "  // Anbieterland nur mit Beleg (E065); sonst sichtbar «nicht erfasst» (E036, Owner 10.11.).\n",
  "  // Anbieterland nur mit Beleg (E065); sonst sichtbar «keine Angabe» (E036, E082, Wortlaut E093).\n"),
 ("Termin Ausgabe", '        ? "Nächste Ausgabe nicht publiziert"\n', '        ? "Nächste Ausgabe: keine Angabe"\n'),
 ("Termin begonnen", '    if (end && end >= today) return "Bereits begonnen; nächster Start nicht publiziert";\n    return "Nächster Termin nicht publiziert";\n',
  '    if (end && end >= today) return "Bereits begonnen; nächster Start: keine Angabe";\n    return "Nächster Termin: keine Angabe";\n'),
 ("Preis Platzhalter", '        || normalized.includes("nicht_publiziert")) return "nicht erfasst";\n    if (normalized.includes("nicht publiziert")) return "Nicht publiziert";\n',
  '        || normalized.includes("nicht_publiziert")\n        || normalized.includes("nicht publiziert")) return MISSING;\n'),
 ("Zugang leer", '    if (!raw) return "nicht erfasst";\n', '    if (!raw) return MISSING;\n'),
 ("Zugang nicht publiziert", '        || normalized.includes("not published")) return "Nicht publiziert";\n', '        || normalized.includes("not published")) return MISSING;\n'),
 ("Region", '      : readableCodes(raw);\n', '      : neutralMissing(readableCodes(raw));\n'),
 ("Karte Dauer und Start", '          ${fact("Dauer", readableCodes(offer.duration))}\n          ${fact("Start", readableCodes(publicStart(offer)))}\n',
  '          ${fact("Dauer", neutralMissing(readableCodes(offer.duration), "Dauer"))}\n          ${fact("Start", neutralMissing(readableCodes(publicStart(offer)), "Start"))}\n'),
 ("Smart Dauer", '          <span>${escapeHtml(readableCodes(offer.duration || "Dauer nicht publiziert"))}</span>\n',
  '          <span>${escapeHtml(smartDuration(offer))}</span>\n'),
 ("Smart Originalpreis", 'Originalpreis: ${escapeHtml(offer.priceDisplay || "Preis nicht publiziert")}</p>',
  'Originalpreis: ${escapeHtml(offer.priceDisplay ? neutralMissing(offer.priceDisplay, "Preis") : MISSING)}</p>'),
 ("smartDuration", '  const humanizeTokens = (value, labelMap, pattern = /\\s*\\|\\s*/) =>\n',
  '  // Smart-Karte ohne Feldbezeichnung: ohne Angabe heisst es «Dauer: keine Angabe».\n'
  '  const smartDuration = offer => {\n'
  '    const text = neutralMissing(readableCodes(offer.duration || ""), "Dauer");\n'
  '    return text && text !== MISSING ? text : `Dauer: ${MISSING}`;\n'
  '  };\n\n'
  '  const humanizeTokens = (value, labelMap, pattern = /\\s*\\|\\s*/) =>\n'),
]
METHODIK = [
 ("Methodik fehlende Angaben", "Stattdessen erscheint beispielsweise «nicht erfasst», «nicht publiziert» oder «Preis auf Anfrage».",
  "Stattdessen erscheint «keine Angabe» oder beispielsweise «Preis auf Anfrage»."),
 ("Methodik Ort", "Fehlt eine dieser Angaben, steht «nicht erfasst».", "Fehlt eine dieser Angaben, steht «keine Angabe»."),
]


def port(text, edits, label):
    for name, old, new in edits:
        n = text.count(old)
        assert n == 1, f"{label} {name}: {n} Treffer statt 1"
        text = text.replace(old, new)
    return text


def main(src, dst):
    src, dst = pathlib.Path(src), pathlib.Path(dst)
    dst.mkdir(parents=True, exist_ok=True)
    for name, prefix, edits, out in [("app-v37.js", "922a72ff9c7a", APP, "app-v38.js"), ("methodik.html", "475d9bf1c60d", METHODIK, "methodik.html")]:
        text = (src / name).read_text(encoding="utf-8")
        assert hashlib.sha256(text.encode()).hexdigest().startswith(prefix), f"{name}: unerwartete Quelle"
        text = port(text, edits, name)
        (dst / out).write_text(text, encoding="utf-8")
        print("OK", out, len(edits), "Ersetzungen,", hashlib.sha256(text.encode()).hexdigest())


if __name__ == "__main__":
    main(*sys.argv[1:3])
