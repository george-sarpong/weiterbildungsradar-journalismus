"""Paket 6: app-v34.js (Paket 5) -> app-v35.js.
Schritt A (§5 Punkt 3, E014): main-Commit 89b9a1a (vergangene Termine).
Weitere Schritte werden unten angehängt. Jede Ersetzung muss genau einmal passen."""
import sys, hashlib, pathlib
src, dst = map(pathlib.Path, sys.argv[1:3])
code = src.read_text(encoding="utf-8")
assert hashlib.sha256(code.encode()).hexdigest().startswith("eb6fc9c57992"), "Quelle ist nicht app-v34.js (Paket 5)"

EDITS = [
 ("A 89b9a1a isCurrent: vergangener Start ohne endDate",
  """    if (Array.isArray(offer.sessions)) return Boolean(nextSession(offer));
    const end = parseDate(offer.endDate);
    return !end || end >= today;
  };""",
  """    if (Array.isArray(offer.sessions)) return Boolean(nextSession(offer));
    const end = parseDate(offer.endDate);
    const start = parseDate(offer.startDate);
    // Bei eintägigen Ausgaben fehlt teils ein endDate. Ihr vergangener Start
    // darf nicht als weiterhin aktueller Kurs auf der Website erscheinen.
    return (!end || end >= today) && (end || !start || start >= today);
  };"""),
 ("A 89b9a1a publicStart: keine alten Termine auf der Karte",
  """    if (session) return session.label || formatDate(session.startDate);
    return offer.start;
  };""",
  """    if (session) return session.label || formatDate(session.startDate);
    const raw = String(offer.start ?? "").trim();
    const start = parseDate(offer.startDate);
    const end = parseDate(offer.endDate);
    const datedText = [...raw.matchAll(/\\b(\\d{1,2})\\.(\\d{1,2})\\.(20\\d{2})\\b|\\b(20\\d{2})-(\\d{2})-(\\d{2})\\b/g)]
      .map(match => match[4]
        ? `${match[4]}-${match[5]}-${match[6]}`
        : `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`);
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const hasPastDate = datedText.some(date => date < todayIso);

    if (!hasPastDate && !(start && start < today)) {
      return /abgeschlossen/i.test(raw) && !start && !end
        ? "Nächste Ausgabe nicht publiziert"
        : raw;
    }
    // Im Datensatz bleiben die historischen Angaben vollständig erhalten.
    // Die Angebotskarte zeigt bei laufenden oder undatierten Ausgaben keine alten Termine.
    if (start && start >= today) return formatDate(offer.startDate);
    if (end && end >= today) return "Bereits begonnen; nächster Start nicht publiziert";
    return "Nächster Termin nicht publiziert";
  };"""),
]

EDITS_B = [  # Schritt B (§5 Punkt 2, E020): PR10-Commit 10c5943, nur app.js-Teil
 ("B 10c5943 Sortierung: APPROVED als Standard",
  """      case "APPROVED":
        return sorted.sort((a, b) => b.approved.localeCompare(a.approved)
          || a.provider.localeCompare(b.provider, "de-CH")
          || a.title.localeCompare(b.title, "de-CH"));
      case "PROVIDER":
        return sorted.sort((a, b) => a.provider.localeCompare(b.provider, "de-CH")
          || a.title.localeCompare(b.title, "de-CH"));
      default:
        return sorted;""",
  """      case "PROVIDER":
        return sorted.sort((a, b) => a.provider.localeCompare(b.provider, "de-CH")
          || a.title.localeCompare(b.title, "de-CH"));
      case "APPROVED":
      default:
        // Default to the documented review date, not an implied editorial ranking.
        return sorted.sort((a, b) => String(b.approved ?? "").localeCompare(String(a.approved ?? ""))
          || a.provider.localeCompare(b.provider, "de-CH")
          || a.title.localeCompare(b.title, "de-CH")
          || String(a.id).localeCompare(String(b.id), "de-CH"));"""),
 ("B 10c5943 URL ohne Standardsortierung",
  'if (el.sort.value !== "EDITORIAL") params.set("sort", el.sort.value);',
  'if (el.sort.value !== "APPROVED") params.set("sort", el.sort.value);'),
 ("B 10c5943 Filterzähler",
  '    el.sort.value !== "EDITORIAL",\n',
  '    el.sort.value !== "APPROVED",\n'),
 ("B 10c5943 Zurücksetzen",
  '    el.sort.value = "EDITORIAL";\n',
  '    el.sort.value = "APPROVED";\n'),
]

EDITS_C = [  # Schritt C (§5 Punkt 1, E037): main-Commits df18860, 119ca6e, e651956 (Inhalt wie main, Kontext an Live angepasst)
 ("C df18860 Budget in CHF/EUR/USD erkennen",
  """    const text = String(raw ?? "");
    const patterns = [
      /\\bCHF\\s*([0-9][0-9'’.,]*)/i,
      /\\b([0-9][0-9'’.,]*)\\s*CHF\\b/i,
      /\\b(?:Fr\\.?|Franken)\\s*([0-9][0-9'’.,]*)/i,
      /\\b([0-9][0-9'’.,]*)\\s*(?:Fr\\.?|Franken)\\b/i
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (!match) continue;
      const amount = smartNumber(match[1]);
      if (amount != null) return { amount, currency: "CHF" };
    }""",
  """    const input = String(raw ?? "");
    const patterns = [
      { currency: "CHF", match: /\\bCHF\\s*([0-9][0-9'’.,]*)/i },
      { currency: "CHF", match: /\\b([0-9][0-9'’.,]*)\\s*CHF\\b/i },
      { currency: "CHF", match: /\\b(?:Fr\\.?|Franken)\\s*([0-9][0-9'’.,]*)/i },
      { currency: "CHF", match: /\\b([0-9][0-9'’.,]*)\\s*(?:Fr\\.?|Franken)\\b/i },
      { currency: "EUR", match: /\\bEUR\\s*([0-9][0-9'’.,]*)/i },
      { currency: "EUR", match: /\\b([0-9][0-9'’.,]*)\\s*EUR\\b/i },
      { currency: "EUR", match: /\\b(?:Euro|Euros)\\s*([0-9][0-9'’.,]*)/i },
      { currency: "EUR", match: /\\b([0-9][0-9'’.,]*)\\s*(?:Euro|Euros)\\b/i },
      { currency: "EUR", match: /€\\s*([0-9][0-9'’.,]*)/i },
      { currency: "EUR", match: /([0-9][0-9'’.,]*)\\s*€/i },
      { currency: "USD", match: /\\bUSD\\s*([0-9][0-9'’.,]*)/i },
      { currency: "USD", match: /\\b([0-9][0-9'’.,]*)\\s*USD\\b/i },
      { currency: "USD", match: /\\b(?:Dollar|Dollars)\\s*([0-9][0-9'’.,]*)/i },
      { currency: "USD", match: /\\b([0-9][0-9'’.,]*)\\s*(?:Dollar|Dollars)\\b/i },
      { currency: "USD", match: /\\$\\s*([0-9][0-9'’.,]*)/i },
      { currency: "USD", match: /([0-9][0-9'’.,]*)\\s*\\$/i }
    ];
    for (const { currency, match: pattern } of patterns) {
      const match = input.match(pattern);
      if (!match) continue;
      const amount = smartNumber(match[1]);
      if (amount != null) return { amount, currency };
    }"""),
 ("C df18860 Betrag aus Themenwörtern entfernen (alle drei Währungen)",
  """      .replace(/\\bchf\\s*[0-9][0-9'’.,]*\\b/g, " ")
      .replace(/\\b[0-9][0-9'’.,]*\\s*chf\\b/g, " ")
      .replace(/\\b(?:fr\\.?|franken)\\s*[0-9][0-9'’.,]*\\b/g, " ")
      .replace(/\\b[0-9][0-9'’.,]*\\s*(?:fr\\.?|franken)\\b/g, " ")
""",
  """      .replace(/\\b(?:chf|eur|usd)\\s*[0-9][0-9'’.,]*\\b/g, " ")
      .replace(/\\b[0-9][0-9'’.,]*\\s*(?:chf|eur|usd)\\b/g, " ")
      .replace(/\\b(?:fr\\.?|franken|euro|euros|dollar|dollars)\\s*[0-9][0-9'’.,]*\\b/g, " ")
      .replace(/\\b[0-9][0-9'’.,]*\\s*(?:fr\\.?|franken|euro|euros|dollar|dollars)\\b/g, " ")
      .replace(/[€$]\\s*[0-9][0-9'’.,]*/g, " ")
      .replace(/[0-9][0-9'’.,]*\\s*[€$]/g, " ")
"""),
 ("C df18860 Preisvergleich CHF/EUR/USD 1:1",
  """      if (option.currency && option.currency !== parsed.budget.currency) {""",
  """      const currencies1to1 = ["CHF", "EUR", "USD"];
      const comparableCurrency = !option.currency || option.currency === parsed.budget.currency
        || (currencies1to1.includes(option.currency) && currencies1to1.includes(parsed.budget.currency));
      if (!comparableCurrency) {"""),
 ("C df18860+e651956 Budgettext mit Währungshinweis",
  """    const status = item.budget.status;
    if (["TARGET_GROUP_FIT", "DIRECT_FIT"].includes(status) && item.budget.amount != null) {
      const rest = Math.max(0, parsed.budget.amount - item.budget.amount);
      const prefix = status === "TARGET_GROUP_FIT" ? "Beim publizierten Journalist:innen-Tarif" : "Bei diesem Preis";
      return `${prefix} bleiben CHF ${rest.toLocaleString("de-CH")}.`;
    }
    if (status === "CONDITIONAL_FIT") return "Der passende Preis gilt nur unter einer veröffentlichten Bedingung; persönliche Berechtigung wurde nicht geprüft.";
    if (status === "POSSIBLE_FIT") return "Der publizierte Preis könnte ins Budget passen, ist aber nicht sicher als Gesamtpreis nutzbar.";
    if (status === "OVER_BUDGET") return "Der sicher vergleichbare Preis liegt über dem angegebenen Budget.";
    return "Für dieses Angebot ist keine sichere Budgetaussage möglich.";""",
  """    const status = item.budget.status;
    const actualCurrency = item.budget.option?.currency;
    const currencyNote = actualCurrency && actualCurrency !== parsed.budget.currency
      && ["CHF", "EUR", "USD"].includes(actualCurrency)
      && ["CHF", "EUR", "USD"].includes(parsed.budget.currency)
      ? "Währungen EUR/CHF/USD werden für diese Suche vereinfacht 1:1 verglichen; tatsächliche Wechselkurse und Steuern können abweichen."
      : "";
    const withCurrencyNote = message => currencyNote ? `${message} ${currencyNote}` : message;
    if (["TARGET_GROUP_FIT", "DIRECT_FIT"].includes(status) && item.budget.amount != null) {
      const rest = Math.max(0, parsed.budget.amount - item.budget.amount);
      const prefix = status === "TARGET_GROUP_FIT" ? "Beim publizierten Journalist:innen-Tarif" : "Bei diesem Preis";
      return withCurrencyNote(`${prefix} bleiben ${parsed.budget.currency} ${rest.toLocaleString("de-CH")}.`);
    }
    if (status === "CONDITIONAL_FIT") return withCurrencyNote("Der passende Preis gilt nur unter einer veröffentlichten Bedingung; persönliche Berechtigung wurde nicht geprüft.");
    if (status === "POSSIBLE_FIT") return withCurrencyNote("Der publizierte Preis könnte ins Budget passen, ist aber nicht sicher als Gesamtpreis nutzbar.");
    if (status === "OVER_BUDGET") return withCurrencyNote("Der sicher vergleichbare Preis liegt über dem angegebenen Budget.");
    return withCurrencyNote("Für dieses Angebot ist keine sichere Budgetaussage möglich.");"""),
 ("C 119ca6e Hinweis unter Preisbändern",
  "Preiskategorien des ${context}; Währungen werden nicht umgerechnet.`;",
  "Preiskategorien des ${context}; Budgets in CHF/EUR/USD werden zur Suche vereinfacht 1:1 verglichen. Anbieterpreise bleiben in Originalwährung.`;"),
 ("C 119ca6e Budget-Chip mit erkannter Währung",
  'if (parsed.budget) chips.push(`Budget: CHF ${parsed.budget.amount.toLocaleString("de-CH")}`);',
  'if (parsed.budget) chips.push(`Budget: ${parsed.budget.currency} ${parsed.budget.amount.toLocaleString("de-CH")}`);'),
]
STEPS = [EDITS, EDITS_B, EDITS_C]
for edits in STEPS:
    for name, old, new in edits:
        n = code.count(old)
        assert n == 1, f"{name}: {n} Treffer statt 1"
        code = code.replace(old, new)
dst.write_text(code, encoding="utf-8")
print("OK", sum(map(len, STEPS)), "Ersetzungen,", hashlib.sha256(code.encode()).hexdigest())
