"""Paket 14 (10.11.2026): app-v40.js und methodik.html aus Paket 13.
E105: Kennzeichnung «Laut Anbieter» mit Link entfällt; Beschreibung steht ohne Zusatz (löst E096 ab).
E106: Smart-Suche: «oder» trennt Themen-Alternativen (ODER statt UND); Füllverben «machen», «besuchen», «belegen», «absolvieren» sind keine Themen.
Ohne «oder» verhält sich die Suche wie bisher. Daten unverändert (data-p13.js).
Aufruf (aus claude-work/): python3 -I paket14/scripts/port_p14.py"""
import pathlib, hashlib
R = pathlib.Path(__file__).resolve().parents[2]
def rep(s, a, b):
    assert s.count(a) == 1, a[:90]
    return s.replace(a, b)
s = (R / "paket13/website/app-v39.js").read_text(encoding="utf-8")
# E105
s = rep(s, '<p class="card-description">${escapeHtml(offer.description)} ${descriptionSource(offer)}</p>',
           '<p class="card-description">${escapeHtml(offer.description)}</p>')
a = s.index("  // E096 (Owner 10.11.): Beschreibung kurz als Anbietertext kennzeichnen")
b = s.index("  // E100 (Owner 10.11.)")
s = s[:a] + s[b:]
# E106 Stoppwörter
s = rep(s, '    "weiterbildungen", "verbessern"\n  ]);',
           '    "weiterbildungen", "verbessern",\n    // E106 (Owner 10.11.): Füllverben in Sätzen wie «… machen für 2000 CHF»\n    "machen", "besuchen", "belegen", "absolvieren"\n  ]);')
# E106 Themengruppen
s = rep(s, '''    const tokens = tokenSource.split(/[^a-z0-9äöüß]+/i)
      .map(token => token.trim())
      .filter(token => token.length >= 2
        && !SMART_STOPWORDS.has(token)
        && !SMART_FREE_TOKEN_RE.test(token)
        && !/^\\d+$/.test(token));''',
'''    const topicTokensOf = text => text.split(/[^a-z0-9äöüß]+/i)
      .map(token => token.trim())
      .filter(token => token.length >= 2
        && !SMART_STOPWORDS.has(token)
        && !SMART_FREE_TOKEN_RE.test(token)
        && !/^\\d+$/.test(token));
    const tokens = topicTokensOf(tokenSource);
    // E106: «oder» trennt Themen-Alternativen; innerhalb einer Alternative müssen alle Wörter passen.
    const tokenGroups = tokenSource.split(/\\boder\\b/)
      .map(part => [...new Set(topicTokensOf(part))])
      .filter(group => group.length);''')
s = rep(s, '''      freeOnly,
      tokens: [...new Set(tokens)]
    };''', '''      freeOnly,
      tokens: [...new Set(tokens)],
      tokenGroups: tokenGroups.length > 1 ? tokenGroups : [[...new Set(tokens)]]
    };''')
s = rep(s, '''    const allMatch = parsed.tokens.every(token => topicTokenOccurs(haystack, token));
    if (!allMatch) return { match: false, score: 0 };
    const score = parsed.tokens.reduce((sum, token) => sum + (topicTokenOccurs(title, token) ? 8 : 2), 0);
    return { match: true, score };''',
'''    const groupScores = parsed.tokenGroups
      .filter(group => group.every(token => topicTokenOccurs(haystack, token)))
      .map(group => group.reduce((sum, token) => sum + (topicTokenOccurs(title, token) ? 8 : 2), 0));
    if (!groupScores.length) return { match: false, score: 0 };
    return { match: true, score: Math.max(...groupScores) };''')
s = rep(s, '''  const smartWhy = (item, parsed) => {
    const reasons = [];
    if (parsed.tokens.length) reasons.push(parsed.tokens.join(" + "));''',
'''  const topicLabel = parsed => parsed.tokenGroups.map(group => group.join(" + ")).join(" oder ");
  const smartWhy = (item, parsed) => {
    const reasons = [];
    if (parsed.tokens.length) {
      const haystack = smartHaystack(item.offer);
      const hit = parsed.tokenGroups.find(group => group.every(token => topicTokenOccurs(haystack, token)));
      reasons.push((hit || parsed.tokens).join(" + "));
    }''')
s = rep(s, '    if (parsed.tokens.length) chips.push(`Thema: ${parsed.tokens.join(" + ")}`);',
           '    if (parsed.tokens.length) chips.push(`Thema: ${topicLabel(parsed)}`);')
(R / "paket14/website/app-v40.js").write_text(s, encoding="utf-8")
m = (R / "paket13/website/methodik.html").read_text(encoding="utf-8")
m = rep(m, '\n        <p>Die Kurzbeschreibungen stammen von den Anbietern. Der Link «Laut Anbieter» führt zur Quelle.</p>', '')
(R / "paket14/website/methodik.html").write_text(m, encoding="utf-8")
for f in ["app-v40.js", "methodik.html"]:
    print(f, hashlib.sha256((R / "paket14/website" / f).read_bytes()).hexdigest()[:16])
