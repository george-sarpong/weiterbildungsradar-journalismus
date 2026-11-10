"""Paket 13 (10.11.2026): app-v39.js und methodik.html aus Paket 10.
E096: Beschreibung kurz gekennzeichnet «Laut Anbieter ↗» mit Link zur Angebotsseite (E038, Name beginnt mit sichtbarem Text, E089).
E100: Niveau-Badge ohne Angabe heisst «Niveau: keine Angabe» (wie E093). E102: Sprache gleich. Daten unverändert.
Aufruf (aus claude-work/): python3 -I paket13/scripts/port_p13.py"""
import pathlib, hashlib
R = pathlib.Path(__file__).resolve().parents[2]
src = (R / "paket10/website/app-v38.js").read_text(encoding="utf-8")
def rep(s, a, b):
    assert s.count(a) == 1, a[:80]
    return s.replace(a, b)
s = rep(src,
 '<p class="card-description">${escapeHtml(offer.description)}</p>',
 '<p class="card-description">${escapeHtml(offer.description)} ${descriptionSource(offer)}</p>')
s = rep(s,
 '<span class="badge">${escapeHtml(labels.level[offer.level] ?? offer.level)}</span>',
 '<span class="badge">${escapeHtml(levelBadge(offer))}</span>')
s = rep(s,
 '<span class="badge">${escapeHtml(humanizeTokens(offer.language, labels.language, /\\s*[|/]\\s*/))}</span>',
 '<span class="badge">${escapeHtml(languageBadge(offer))}</span>')
s = rep(s,
 '  const card = offer => {\n',
 '''  // E096 (Owner 10.11.): Beschreibung kurz als Anbietertext kennzeichnen, Link zur Angebotsseite (E038, E089).
  const descriptionSource = offer => {
    const href = safeOfferHref(offer.url);
    if (!href) return '<span class="description-source">Laut Anbieter.</span>';
    return `<a class="description-source" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="Laut Anbieter: Angebotsseite zu ${escapeHtml(offer.title)} öffnen">Laut Anbieter <span aria-hidden="true">↗</span></a>`;
  };
  // E100 (Owner 10.11.): Niveau ohne Angabe mit Feldname, wie E093.
  const levelBadge = offer => {
    const label = labels.level[offer.level] ?? offer.level;
    return !String(label ?? "").trim() || label === MISSING ? `Niveau: ${MISSING}` : label;
  };

  // E102 (Owner 10.11.): Sprache ohne Angabe mit Feldname, gleiche Regel wie E100.
  const languageBadge = offer => {
    const label = humanizeTokens(offer.language, labels.language, /\\s*[|/]\\s*/);
    return !String(label ?? "").trim() || label === MISSING ? `Sprache: ${MISSING}` : label;
  };

  const card = offer => {
''')
(R / "paket13/website/app-v39.js").write_text(s, encoding="utf-8")
m = (R / "paket10/website/methodik.html").read_text(encoding="utf-8")
m = rep(m, 'Verbindlich sind immer die Angaben des Anbieters.</p>',
 'Verbindlich sind immer die Angaben des Anbieters.</p>\n        <p>Die Kurzbeschreibungen stammen von den Anbietern. Der Link «Laut Anbieter» führt zur Quelle.</p>')
(R / "paket13/website/methodik.html").write_text(m, encoding="utf-8")
for f in ["app-v39.js", "methodik.html"]:
    print(f, hashlib.sha256((R / "paket13/website" / f).read_bytes()).hexdigest()[:16])
