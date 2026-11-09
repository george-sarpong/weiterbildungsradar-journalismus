"""Paket 5: app-v33.js (live, E035/E044) -> app-v34.js.
Portiert NUR main-Commits f420299 (HOLD), 9efdea9 (sessions), 3b3cbfb (Region des Termins).
Nicht portiert: 89b9a1a (vergangene Termine ohne sessions, GESAMTWISSENSSTAND §5 Punkt 3)."""
import sys, hashlib, pathlib
src, dst = map(pathlib.Path, sys.argv[1:3])
code = src.read_text(encoding="utf-8")
assert hashlib.sha256(code.encode()).hexdigest().startswith("046887cd76d2"), "Quelle ist nicht app-v33.js (live)"

EDITS = [
 ("9efdea9+3b3cbfb nextSession/currentRegion/isCurrent",
  """  const isCurrent = offer => {
    const end = parseDate(offer.endDate);
    return !end || end >= today;
  };
""",
  """  const nextSession = offer => {
    if (!Array.isArray(offer.sessions)) return null;
    return offer.sessions
      .filter(session => parseDate(session.startDate) >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] || null;
  };

  const currentRegion = offer => nextSession(offer)?.region || offer.region;

  const isCurrent = offer => {
    if (Array.isArray(offer.sessions)) return Boolean(nextSession(offer));
    const end = parseDate(offer.endDate);
    return !end || end >= today;
  };
"""),
 ("f420299 HOLD-Filter",
  "  const offers = allOffers.filter(isCurrent);\n",
  "  const offers = allOffers.filter(offer => isCurrent(offer) && offer.publicationStatus !== \"HOLD\");\n"),
 ("9efdea9 publicStart (nur Session-Zweig; Rest wie live)",
  """  const compactAmount = value => String(value ?? "")""",
  """  const publicStart = offer => {
    const session = nextSession(offer);
    if (session) return session.label || formatDate(session.startDate);
    return offer.start;
  };

  const compactAmount = value => String(value ?? "")"""),
 ("9efdea9 Sortierung Nächster Start",
  """          const value = String(offer.startDate ?? "").trim();
          return ISO_DATE.test(value) ? value : "";""",
  """          const value = String(nextSession(offer)?.startDate ?? offer.startDate ?? "").trim();
          return ISO_DATE.test(value) ? value : "";"""),
 ("3b3cbfb Region Karte",
  "    const displayRegion = regionDisplay(offer.region);\n",
  "    const displayRegion = regionDisplay(currentRegion(offer));\n"),
 ("9efdea9 Start Karte",
  """          ${fact("Start", offer.start)}""",
  """          ${fact("Start", publicStart(offer))}"""),
 ("3b3cbfb Region Smart-Karte",
  "    const place = [countryDisplay(offer.country), regionDisplay(offer.region)].filter(Boolean).join(\" · \");\n",
  "    const place = [countryDisplay(offer.country), regionDisplay(currentRegion(offer))].filter(Boolean).join(\" · \");\n"),
 ("3b3cbfb Region Smart-Suchtext",
  """      offer.country,
      offer.region,
      labels.level[offer.level],""",
  """      offer.country,
      currentRegion(offer),
      labels.level[offer.level],"""),
]
for name, old, new in EDITS:
    n = code.count(old)
    assert n == 1, f"{name}: {n} Treffer statt 1"
    code = code.replace(old, new)
dst.write_text(code, encoding="utf-8")
print("OK", len(EDITS), "Ersetzungen,", hashlib.sha256(code.encode()).hexdigest())
