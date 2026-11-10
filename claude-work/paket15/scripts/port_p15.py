"""Paket 15 (10.11.2026): app-v41.js aus app-v40.js – Befunde der virtuellen Nutzertests (E110).
A: Wörter zur Person, Kursform-Wörter und Füllwörter (DE/FR/IT/EN) sind keine Themen; Komposita auf -kurs/-seminar werden gekürzt;
   «en ligne», «in linea», «présentiel», «gratuit» usw. werden wie «online», «Präsenz», «kostenlos» verstanden.
B: Findet die Suche nichts, zeigt sie Angebote, die die meisten Suchwörter treffen, gekennzeichnet als «passt teilweise».
C: Schweizer Ortsnamen (und Wien, Vaduz) gelten als Kursort (harte Bedingung auf Ortsangaben), nicht als Thema.
D: Gleichbedeutende Begriffe werden mitgesucht (z. B. Fotojournalismus = Bildjournalismus, Faktencheck = Verifikation).
Daten unverändert. Aufruf (aus claude-work/): python3 -I paket15/scripts/port_p15.py"""
import pathlib, hashlib
R = pathlib.Path(__file__).resolve().parents[2]
def rep(s, a, b):
    assert s.count(a) == 1, a[:100]
    return s.replace(a, b)
s = (R / "paket14/website/app-v40.js").read_text(encoding="utf-8")

# A: Stoppwörter
s = rep(s, '    "machen", "besuchen", "belegen", "absolvieren"\n  ]);',
'''    "machen", "besuchen", "belegen", "absolvieren",
    // E110 A (Owner 10.11.): Wörter zur Person, Kursform und Füllwörter sind keine Themen (DE/FR/IT/EN)
    "freie", "freier", "freien", "freischaffende", "freischaffender", "journalist", "journalistin", "journalisten",
    "journalistinnen", "medienschaffende", "medienschaffender", "innen", "chefredaktor", "chefredaktorin", "chefredaktoren",
    "redaktionen", "workshop", "workshops", "seminar", "seminare", "einfuhrung", "einfuehrung", "gunstig", "gunstige",
    "gunstiger", "gunstigen", "guenstig", "guenstiger", "billig", "preiswert", "als", "furs", "fuers", "erstellen",
    "gute", "guten", "beste", "besten", "st", "sankt",
    "je", "cherche", "voudrais", "veux", "de", "du", "des", "la", "le", "les", "et", "un", "une", "pour", "sur", "avec",
    "cours", "formation", "formations", "atelier", "ligne",
    "cerco", "vorrei", "corso", "corsi", "di", "del", "della", "il", "lo", "gli", "per", "con", "formazione", "una",
    "looking", "want", "course", "courses", "training", "class", "the", "for", "with", "an", "and", "english"
  ]);

  // E110 C: Ortsnamen gelten als Kursort. Schlüssel = normalisiertes Suchwort, Wert = Schreibweisen in Ortsangaben.
  const SMART_PLACES = Object.freeze({
    zurich: ["zurich", "zuerich"], bern: ["bern"], berne: ["bern"], basel: ["basel", "bale"], bale: ["basel", "bale"],
    luzern: ["luzern", "lucerne"], lucerne: ["luzern", "lucerne"], genf: ["geneve", "genf", "geneva"], geneve: ["geneve", "genf", "geneva"],
    geneva: ["geneve", "genf", "geneva"], lausanne: ["lausanne"], lugano: ["lugano"], winterthur: ["winterthur"], aarau: ["aarau"],
    olten: ["olten"], chur: ["chur"], fribourg: ["fribourg", "freiburg"], freiburg: ["fribourg", "freiburg"], neuchatel: ["neuchatel", "neuenburg"],
    biel: ["biel", "bienne"], bienne: ["biel", "bienne"], zug: ["zug"], schaffhausen: ["schaffhausen"], sion: ["sion", "sitten"],
    sitten: ["sion", "sitten"], bellinzona: ["bellinzona"], locarno: ["locarno"], thun: ["thun"], gallen: ["gallen"],
    solothurn: ["solothurn"], frauenfeld: ["frauenfeld"], liestal: ["liestal"], vaduz: ["vaduz"], wien: ["wien", "vienna"]
  });
  const SMART_PLACE_LABELS = Object.freeze({ zurich: "Zürich", genf: "Genf", geneve: "Genf", geneva: "Genf", neuchatel: "Neuchâtel",
    bale: "Basel", berne: "Bern", lucerne: "Luzern", bienne: "Biel", sitten: "Sion", gallen: "St. Gallen", freiburg: "Fribourg" });
  const placeLabelOf = key => SMART_PLACE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
  const placeMatches = (offer, places) => {
    const text = normalize([offer.region, placeSearchText(offer)].join(" "));
    return places.some(key => SMART_PLACES[key].some(variant => text.includes(variant)));
  };

  // E110 D: gleichbedeutende Begriffe (normalisiert)
  const SMART_SYNONYMS = Object.freeze({
    fotojournalismus: ["bildjournalismus", "pressefotografie", "photojournalisme", "photojournalism"],
    bildjournalismus: ["fotojournalismus", "pressefotografie", "photojournalisme", "photojournalism"],
    faktencheck: ["verifikation", "fact-check", "factcheck", "fact checking", "verification", "faktenprufung"],
    verifikation: ["faktencheck", "fact-check", "factcheck", "fact checking", "verification", "faktenprufung"],
    ki: ["kunstliche intelligenz", "ai", "intelligence artificielle", "intelligenza artificiale"],
    datenjournalismus: ["data journalism", "datajournalisme", "data-journalismus", "datenjournalist"],
    lektorat: ["lektorieren", "lektor"],
    korrektorat: ["korrektur", "korrigieren"],
    lokaljournalismus: ["lokaljournalis", "lokale geschichten", "journalisme local", "local journalism"],
    fotografie: ["foto", "photo", "fotograf"],
    sicherheit: ["security", "securite", "sicherheits"],
    video: ["vidéo", "videojournal"],
    podcast: ["podcasting", "audio"],
    journalismus: ["journalisme", "giornalismo", "journalism"],
    journalisme: ["journalismus", "giornalismo", "journalism"],
    giornalismo: ["journalismus", "journalisme", "journalism"],
    journalism: ["journalismus", "journalisme", "giornalismo"]
  });''')

# A: Vor-Normalisierung FR/IT/EN
s = rep(s, '  const parseSmartQuery = raw => {\n    const input = normalize(raw);',
'''  // E110 A: Form- und Preiswörter in FR/IT/EN wie die deutschen behandeln
  const smartPrenormalize = text => ` ${text} `
    .replace(/\\ben\\s+ligne\\b|\\bin\\s+linea\\b|\\ba\\s+distanza\\b|\\ba\\s+distance\\b/g, " online ")
    .replace(/\\ben\\s+presentiel\\b|\\bpresentiel\\b|\\bin\\s+presenza\\b|\\bin\\s+person\\b|\\bon[- ]site\\b/g, " praesenz ")
    .replace(/\\bdata\\s+journalism\\b|\\bdatajournalisme\\b|\\bjournalisme\\s+de\\s+donnees\\b|\\bgiornalismo\\s+dei\\s+dati\\b/g, " datenjournalismus ")
    .replace(/\\b(?:in\\s+)?english\\b/g, " in englisch ")
    .replace(/\\ben\\s+francais\\b/g, " in francais ")
    .replace(/\\bgratuit(?:e|s|es)?\\b|\\bgratuit[oa]\\b|\\bfree\\s+of\\s+charge\\b|\\bfree\\b/g, " kostenlos ")
    .trim();
  const parseSmartQuery = raw => {
    const input = smartPrenormalize(normalize(raw));''')

# A + C: Themenwörter ohne Orte, Komposita kürzen
s = rep(s, '''    const topicTokensOf = text => text.split(/[^a-z0-9äöüß]+/i)
      .map(token => token.trim())''',
'''    const topicTokensOf = text => text.split(/[^a-z0-9äöüß]+/i)
      .map(token => token.trim())
      // E110 A: «Schreibkurs», «Führungskurs», «Fotoseminar» → Thema ohne Kursform
      .map(token => token.length > 8 && /(?:kurs(?:e|en)?|seminar(?:e|en)?|workshop(?:s)?)$/.test(token)
        ? `^${token.replace(/s?(?:kurs(?:e|en)?|seminar(?:e|en)?|workshop(?:s)?)$/, "")}` : token)
      .filter(token => !SMART_PLACES[token] && token !== "^"
        && !SMART_STOPWORDS.has(token.replace(/^\\^/, ""))
        && !/^\\^(?:prae?senz|online|webinar|hybrid|abend|wochenend|intensiv|grund|einsteiger)$/.test(token))''')
s = rep(s, '''    const tokens = topicTokensOf(tokenSource);''',
'''    const tokens = topicTokensOf(tokenSource);
    const places = [...new Set(tokenSource.split(/[^a-z0-9äöüß]+/i).filter(token => SMART_PLACES[token]))];''')
s = rep(s, '''      tokenGroups: tokenGroups.length > 1 ? tokenGroups : [[...new Set(tokens)]]
    };''', '''      tokenGroups: tokenGroups.length > 1 ? tokenGroups : [[...new Set(tokens)]],
      places
    };''')

# D: Synonyme beim Vergleich
s = rep(s, '''  const topicTokenOccurs = (text, token) => token.length > 3
    ? text.includes(token)
    : new RegExp(`(?:^|[^a-z0-9ß])${token}(?=$|[^a-z0-9ß])`).test(text);''',
'''  // «^wort» (aus einem gekürzten Kompositum) passt nur am Wortanfang: «Führungskurs» → Führung…, nicht Durchführung
  const topicTokenOccursExact = (text, token) => token.startsWith("^")
    ? new RegExp(`(?:^|[^a-z0-9ß])${token.slice(1)}`).test(text)
    : token.length > 3
    ? text.includes(token)
    : new RegExp(`(?:^|[^a-z0-9ß])${token}(?=$|[^a-z0-9ß])`).test(text);
  // E110 D: ein Themenwort passt auch über einen gleichbedeutenden Begriff
  const topicTokenOccurs = (text, token) => topicTokenOccursExact(text, token)
    || (SMART_SYNONYMS[token.replace(/^\\^/, "")] || []).some(alt => topicTokenOccursExact(text, normalize(alt)));''')

# C: Ort als harte Bedingung
s = rep(s, '''    if (parsed.language && !splitTokens(offer.language, /\\s*[|/]\\s*/).includes(parsed.language)) return null;''',
'''    if (parsed.language && !splitTokens(offer.language, /\\s*[|/]\\s*/).includes(parsed.language)) return null;
    if (parsed.places.length && !placeMatches(offer, parsed.places)) return null;''')
s = rep(s, '''    const hasAppliedConstraint = Boolean(parsed.tokens.length || parsed.language || parsed.budget''',
           '''    const hasAppliedConstraint = Boolean(parsed.tokens.length || parsed.places.length || parsed.language || parsed.budget''')
s = rep(s, '''    if (parsed.language) chips.push(`Sprache: ${SMART_LANGUAGE_LABELS[parsed.language]}`);
    if (parsed.budget) chips.push(''',
'''    if (parsed.places.length) chips.push(`Ort: ${[...new Set(parsed.places.map(placeLabelOf))].join(" oder ")}`);
    if (parsed.language) chips.push(`Sprache: ${SMART_LANGUAGE_LABELS[parsed.language]}`);
    if (parsed.budget) chips.push(''')

# B: Rückfall «passt teilweise»
s = rep(s, '''    const evaluated = offers.map(offer => smartEvaluate(offer, parsed)).filter(Boolean);
    evaluated.sort(''',
'''    let evaluated = offers.map(offer => smartEvaluate(offer, parsed)).filter(Boolean);
    // E110 B: Passt kein Angebot zu allen Suchwörtern, die Angebote mit den meisten Treffern zeigen (gekennzeichnet).
    let partial = null;
    if (!evaluated.length && parsed.tokens.length >= 2) {
      const loose = { ...parsed, tokenGroups: parsed.tokens.map(token => [token]) };
      const items = offers.map(offer => smartEvaluate(offer, loose)).filter(Boolean);
      items.forEach(item => {
        const haystack = smartHaystack(item.offer);
        item.partialHits = parsed.tokens.filter(token => topicTokenOccurs(haystack, token));
      });
      const best = Math.max(0, ...items.map(item => item.partialHits.length));
      if (best >= 1) {
        evaluated = items.filter(item => item.partialHits.length === best);
        partial = { best, of: parsed.tokens.length };
      }
    }
    evaluated.sort(''')
s = rep(s, '''    const statusMessage = evaluated.length
      ? `${matchLabel} im aktuellen Bestand. ${optionsLabel}`''',
'''    const partialLabel = partial
      ? `Kein Angebot passt zu allen Suchwörtern. ${evaluated.length.toLocaleString("de-CH")} ${evaluated.length === 1 ? "Angebot passt" : "Angebote passen"} teilweise (${partial.best} von ${partial.of} Wörtern).`
      : "";
    const statusMessage = partial ? `${partialLabel} ${optionsLabel}` : evaluated.length
      ? `${matchLabel} im aktuellen Bestand. ${optionsLabel}`''')
s = rep(s, '''    el.smartSummary.innerHTML = evaluated.length
      ? `<p><strong>${matchLabel}</strong> im aktuellen Bestand. ${optionsLabel}</p>`''',
'''    el.smartSummary.innerHTML = partial ? `<p><strong>${escapeHtml(partialLabel)}</strong> ${optionsLabel}</p>` : evaluated.length
      ? `<p><strong>${matchLabel}</strong> im aktuellen Bestand. ${optionsLabel}</p>`''')
s = rep(s, '''      const hit = parsed.tokenGroups.find(group => group.every(token => topicTokenOccurs(haystack, token)));
      reasons.push((hit || parsed.tokens).join(" + "));''',
'''      const hit = parsed.tokenGroups.find(group => group.every(token => topicTokenOccurs(haystack, token)));
      reasons.push(item.partialHits ? `${item.partialHits.join(" + ")} (passt teilweise)` : (hit || parsed.tokens).join(" + "));''')
s = rep(s, '''    if (parsed.language) reasons.push(`Sprache: ${SMART_LANGUAGE_LABELS[parsed.language]}`);''',
'''    if (parsed.places.length) reasons.push(`Ort: ${[...new Set(parsed.places.map(placeLabelOf))].join(" oder ")}`);
    if (parsed.language) reasons.push(`Sprache: ${SMART_LANGUAGE_LABELS[parsed.language]}`);''')
# E110 B: Bei null Treffern sagen, was das Thema allein ergibt
s = rep(s, """      : "Keine bestätigten Treffer. Formuliere Thema oder harte Durchführungsbedingung etwas breiter oder nutze die klassischen Filter.";""",
"""      : `Keine bestätigten Treffer. ${zeroHint}`;""")
s = rep(s, """      : `<p><strong>Keine bestätigten Treffer.</strong> Formuliere Thema oder harte Durchführungsbedingung etwas breiter oder nutze die klassischen Filter.</p>`;""",
"""      : `<p><strong>Keine bestätigten Treffer.</strong> ${escapeHtml(zeroHint)}</p>`;""")
s = rep(s, """    const statusMessage = partial ? """,
"""    // E110 B: Nulltreffer erklären – welche Bedingung weglassen?
    let zeroHint = "Formuliere Thema oder harte Durchführungsbedingung etwas breiter oder nutze die klassischen Filter.";
    if (!evaluated.length && parsed.tokens.length) {
      const dropped = [
        parsed.places.length ? "Ort" : "",
        (parsed.deliveryIntents.length || parsed.deliveryOrGroup) ? "Durchführung" : "",
        parsed.language ? "Sprache" : "",
        parsed.budget ? "Budget" : "",
        parsed.freeOnly ? "«kostenlos»" : ""
      ].filter(Boolean);
      const topicOnly = offers.filter(offer => topicMatch(offer, parsed).match).length;
      if (dropped.length && topicOnly) {
        const list = dropped.length > 1 ? `${dropped.slice(0, -1).join(", ")} oder ${dropped.at(-1)}` : dropped[0];
        zeroHint = `Zum Thema allein gibt es ${topicOnly.toLocaleString("de-CH")} ${topicOnly === 1 ? "Angebot" : "Angebote"}. Lass ${list} weg, um ${topicOnly === 1 ? "es" : "sie"} zu sehen.`;
      }
    }
    const statusMessage = partial ? """)
# Anzeige: Wortanfang-Marke «^» nie zeigen
s = rep(s, '''  const topicLabel = parsed => parsed.tokenGroups.map(group => group.join(" + ")).join(" oder ");''',
'''  const shownToken = token => String(token).replace(/^\\^/, "");
  const topicLabel = parsed => parsed.tokenGroups.map(group => group.map(shownToken).join(" + ")).join(" oder ");''')
s = rep(s, '''reasons.push(item.partialHits ? `${item.partialHits.join(" + ")} (passt teilweise)` : (hit || parsed.tokens).join(" + "));''',
'''reasons.push(item.partialHits ? `${item.partialHits.map(shownToken).join(" + ")} (passt teilweise)` : (hit || parsed.tokens).map(shownToken).join(" + "));''')
(R / "paket15/website/app-v41.js").write_text(s, encoding="utf-8")
print("app-v41.js", hashlib.sha256(s.encode()).hexdigest()[:16])
