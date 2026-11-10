"""Paket 9: app-v36.js (Paket 7) -> app-v37.js. Nur die Owner-Entscheide zu den Befunden Paket 8 (E086–E091).
Aufruf: python3 -I port_app_v37.py <app-v36.js> <app-v37.js>. Jede Ersetzung muss genau einmal passen."""
import hashlib
import pathlib
import sys

EDITS = [
 # E087: Platzhalter aus Codes als «nicht erfasst» (Bezeichnungslisten für Karte und Filter)
 ("E087 Niveau NICHT_PUBLIZIERT",
  '      EXPERT: "Expert",\n      NICHT_PUBLIZIERT: "Nicht publiziert"\n',
  '      EXPERT: "Expert",\n      NICHT_PUBLIZIERT: "nicht erfasst"\n'),
 ("E087 Preiskategorie PREIS_NICHT_PUBLIZIERT",
  '      PREIS_NICHT_PUBLIZIERT: "Preis nicht publiziert",\n',
  '      PREIS_NICHT_PUBLIZIERT: "Preis nicht erfasst",\n'),
 ("E087 Format NICHT_PUBLIZIERT",
  '      "ON_REQUEST_FORMAT": "Format auf Anfrage",\n      "NICHT_PUBLIZIERT": "Nicht publiziert"\n',
  '      "ON_REQUEST_FORMAT": "Format auf Anfrage",\n      "NICHT_PUBLIZIERT": "nicht erfasst"\n'),
 ("E087 Sprache NOT_PUBLISHED",
  '      IT: "Italienisch",\n      NOT_PUBLISHED: "Nicht publiziert"\n',
  '      IT: "Italienisch",\n      NOT_PUBLISHED: "nicht erfasst"\n'),
 # E086: Rohcodes in Anzeigetexten übersetzen (Daten bleiben unverändert)
 ("E086 Übersetzungstabelle",
  '  const humanizeTokens = (value, labelMap, pattern = /\\s*\\|\\s*/) =>\n',
  '  // E086/E087 (Paket 9): Rohcodes in Anzeigetexten lesbar machen; Platzhalter als «nicht erfasst».\n'
  '  // Nur die Anzeige ändert sich, der Datensatz bleibt wörtlich erhalten. Unbekannte Codes bleiben stehen (Test D5).\n'
  '  const CODE_TEXT = Object.freeze({\n'
  '    NOT_PUBLISHED: "nicht erfasst", NICHT_PUBLIZIERT: "nicht erfasst",\n'
  '    ON_REQUEST: "auf Anfrage", SUR_DEMANDE: "auf Anfrage",\n'
  '    FUTURE_BOOKABLE: "buchbar", NO_FREE_PLACES: "ausgebucht",\n'
  '    NICHT_VERIFIZIERT_CURRENT_RECHECK: "nicht verifiziert"\n'
  '  });\n'
  '  const readableCodes = value => String(value ?? "").replace(/\\b[A-Z]{2,}(?:_[A-Z]+)+\\b/g, code => CODE_TEXT[code] ?? code);\n'
  '\n'
  '  const humanizeTokens = (value, labelMap, pattern = /\\s*\\|\\s*/) =>\n'),
 ("E086 Region",
  '    return ["", "NOT_PUBLISHED", "NICHT_PUBLIZIERT", "NOT_APPLICABLE"].includes(raw.toUpperCase())\n      ? ""\n      : raw;\n',
  '    return ["", "NOT_PUBLISHED", "NICHT_PUBLIZIERT", "NOT_APPLICABLE"].includes(raw.toUpperCase())\n      ? ""\n      : readableCodes(raw);\n'),
 ("E086 Karte Dauer und Start",
  '          ${fact("Dauer", offer.duration)}\n          ${fact("Start", publicStart(offer))}\n',
  '          ${fact("Dauer", readableCodes(offer.duration))}\n          ${fact("Start", readableCodes(publicStart(offer)))}\n'),
 ("E086 Smart-Karte Dauer",
  '          <span>${escapeHtml(offer.duration || "Dauer nicht publiziert")}</span>\n',
  '          <span>${escapeHtml(readableCodes(offer.duration || "Dauer nicht publiziert"))}</span>\n'),
 ("E087 Preis ohne Angabe oder als Code",
  '    if (!raw || offer.priceCategory === "PREIS_NICHT_PUBLIZIERT"\n        || normalized.includes("nicht_publiziert")\n        || normalized.includes("nicht publiziert")) return "Nicht publiziert";\n',
  '    if (!raw || offer.priceCategory === "PREIS_NICHT_PUBLIZIERT"\n        || normalized.includes("nicht_publiziert")) return "nicht erfasst";\n'
  '    if (normalized.includes("nicht publiziert")) return "Nicht publiziert";\n'),
 ("E087 Zugang ohne Angabe",
  '    const raw = String(offer.access ?? "").trim();\n    if (!raw) return "Nicht publiziert";\n',
  '    const raw = String(offer.access ?? "").trim();\n    if (!raw) return "nicht erfasst";\n'),
 # E089: Name eines Links enthält den sichtbaren Text (WCAG 2.5.3)
 ("E089 Angebotslink",
  'aria-label="Offizielle Angebotsseite zu ${escapeHtml(offer.title)} öffnen">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;',
  'aria-label="${escapeHtml(label)}: ${escapeHtml(offer.title)} öffnen">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;'),
 # E090: Smart-Karten ohne Nummer «Option 1–3» (E039)
 ("E090 ohne Optionsnummer",
  '        <p class="smart-result-rank">Option ${index + 1}</p>\n',
  ''),
 # E091: Suchtext der Katalogsuche nicht in die Adresse schreiben; alte Links mit ?q= werden weiter gelesen
 ("E091 kein q in der Adresse",
  '    if (filter.queryRaw) params.set("q", filter.queryRaw);\n',
  '    // E091 (E056): Suchtext nicht in die Adresse schreiben; applyUrlState liest alte Links mit ?q= weiter.\n'),
]


def main(src, dst):
    js = pathlib.Path(src).read_text(encoding="utf-8")
    assert hashlib.sha256(js.encode()).hexdigest().startswith("38e666511b91"), "Quelle ist nicht app-v36.js (Paket 7)"
    for label, old, new in EDITS:
        n = js.count(old)
        assert n == 1, f"{label}: {n} Treffer statt 1"
        js = js.replace(old, new)
    pathlib.Path(dst).parent.mkdir(parents=True, exist_ok=True)
    pathlib.Path(dst).write_text(js, encoding="utf-8")
    print("OK app-v37.js", len(EDITS), "Ersetzungen,", hashlib.sha256(js.encode()).hexdigest())


if __name__ == "__main__":
    main(*sys.argv[1:3])
