(() => {
  "use strict";

  const allOffers = Array.isArray(window.WEITERBILDUNGSRADAR_OFFERS)
    ? window.WEITERBILDUNGSRADAR_OFFERS
    : [];

  const FAVORITES_KEY = "weiterbildungsradar:favorites:v1";

  const labels = {
    focus: {
      JOURNALISMUS: "Journalismus",
      MEDIENPRAXIS: "Medienpraxis",
      MANAGEMENT: "Management",
      MEDIENRECHT: "Medienrecht",
      SICHERHEIT: "Sicherheit",
      MODERATION: "Moderation"
    },
    offerType: {
      KURS: "Kurs",
      PROGRAMM: "Programm",
      EVENT: "Event",
      FELLOWSHIP: "Fellowship",
      STUDIUM: "Studium"
    },
    level: {
      EINSTIEG: "Einstieg",
      BERUFSERFAHRUNG: "Berufserfahrung",
      VERSCHIEDENE_NIVEAUS: "Verschiedene Niveaus",
      FORTGESCHRITTEN: "Fortgeschritten",
      VERTIEFUNG: "Vertiefung",
      EXPERT: "Expert",
      NICHT_PUBLIZIERT: "keine Angabe"
    },
    priceCategory: {
      KOSTENLOS: "Kostenlos",
      KOSTENLOS_MIT_BEDINGUNG: "Kostenlos mit Bedingung",
      PREIS_UNBESTAETIGT: "Preis unbestätigt",
      BIS_500: "Bis 500",
      "501_2000": "501 bis 2'000",
      UEBER_2000: "Über 2'000",
      MEHRERE_TARIFE: "Mehrere Tarife",
      PREIS_AUF_ANFRAGE: "Preis auf Anfrage",
      PREIS_NICHT_PUBLIZIERT: "Preis: keine Angabe",
      NOT_APPLICABLE: "Nicht anwendbar"
    },
    format: {
      "PRÄSENZ": "Präsenz",
      "ONLINE LIVE": "Online live",
      "ONLINE SELBSTLERNEN": "Online Selbstlernen",
      "ONLINE": "Online",
      "HYBRID": "Hybrid",
      "ON_DEMAND": "On-Demand",
      "ON_REQUEST_FORMAT": "Format auf Anfrage",
      "NICHT_PUBLIZIERT": "keine Angabe"
    },
    language: {
      DE: "Deutsch",
      EN: "Englisch",
      FR: "Französisch",
      IT: "Italienisch",
      NOT_PUBLISHED: "keine Angabe"
    }
  };

  const preferredOrder = {
    focus: ["JOURNALISMUS", "MEDIENPRAXIS", "MEDIENRECHT", "SICHERHEIT", "MODERATION", "MANAGEMENT"],
    offerType: ["KURS", "PROGRAMM", "EVENT", "FELLOWSHIP", "STUDIUM"],
    priceCategory: ["KOSTENLOS", "KOSTENLOS_MIT_BEDINGUNG", "PREIS_UNBESTAETIGT", "BIS_500", "501_2000", "UEBER_2000", "MEHRERE_TARIFE", "PREIS_AUF_ANFRAGE", "PREIS_NICHT_PUBLIZIERT", "NOT_APPLICABLE"],
    format: ["PRÄSENZ", "HYBRID", "ONLINE LIVE", "ONLINE", "ONLINE SELBSTLERNEN", "ON_DEMAND", "ON_REQUEST_FORMAT", "NICHT_PUBLIZIERT"],
    country: ["Schweiz", "Österreich", "Liechtenstein", "Deutschland"],
    level: ["EINSTIEG", "BERUFSERFAHRUNG", "FORTGESCHRITTEN", "VERTIEFUNG", "EXPERT", "VERSCHIEDENE_NIVEAUS", "NICHT_PUBLIZIERT"]
  };

  const el = {
    search: document.querySelector("#searchInput"),
    focus: document.querySelector("#focusFilter"),
    type: document.querySelector("#typeFilter"),
    price: document.querySelector("#priceFilter"),
    format: document.querySelector("#formatFilter"),
    language: document.querySelector("#languageFilter"),
    country: document.querySelector("#countryFilter"),
    level: document.querySelector("#levelFilter"),
    sort: document.querySelector("#sortSelect"),
    reset: document.querySelector("#resetFilters"),
    filterStatus: document.querySelector("#filterStatus"),
    favoritesToggle: document.querySelector("#favoritesToggle"),
    favoritesCount: document.querySelector("#favoritesCount"),
    cards: document.querySelector("#cards"),
    count: document.querySelector("#resultCount"),
    empty: document.querySelector("#emptyState"),
    emptyTitle: document.querySelector("#emptyTitle"),
    emptyText: document.querySelector("#emptyText"),
    smartForm: document.querySelector("#smartSearchForm"),
    smartInput: document.querySelector("#smartInput"),
    smartOutput: document.querySelector("#smartOutput"),
    smartStatus: document.querySelector("#smartStatus"),
    smartValidation: document.querySelector("#smartValidation"),
    smartUnderstood: document.querySelector("#smartUnderstood"),
    smartSummary: document.querySelector("#smartSummary"),
    smartResults: document.querySelector("#smartResults"),
    smartBundle: document.querySelector("#smartBundle"),
    smartBudgetButton: document.querySelector("#smartBudgetButton"),
    smartFreeButton: document.querySelector("#smartFreeButton"),
    smartPriceBands: document.querySelector("#smartPriceBands"),
    smartPriceNote: document.querySelector("#smartPriceNote")
  };

  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const parseDate = value => ISO_DATE.test(String(value ?? "").trim())
    ? new Date(`${String(value).trim()}T23:59:59`)
    : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextSession = offer => {
    if (!Array.isArray(offer.sessions)) return null;
    return offer.sessions
      .filter(session => parseDate(session.startDate) >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] || null;
  };

  const currentRegion = offer => nextSession(offer)?.region || offer.region;

  const isCurrent = offer => {
    if (Array.isArray(offer.sessions)) return Boolean(nextSession(offer));
    const end = parseDate(offer.endDate);
    const start = parseDate(offer.startDate);
    // Bei eintägigen Ausgaben fehlt teils ein endDate. Ihr vergangener Start
    // darf nicht als weiterhin aktueller Kurs auf der Website erscheinen.
    return (!end || end >= today) && (end || !start || start >= today);
  };

  const offers = allOffers.filter(offer => isCurrent(offer) && offer.publicationStatus !== "HOLD");
  const allKnownIds = new Set(allOffers.map(offer => offer.id));
  const activeIds = new Set(offers.map(offer => offer.id));
  let favorites = loadFavorites();
  let favoritesOnly = false;

  function loadFavorites() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]");
      return new Set(Array.isArray(stored) ? stored.filter(id => allKnownIds.has(id)) : []);
    } catch {
      return new Set();
    }
  }

  function saveFavorites() {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch {
      // Die Website bleibt auch nutzbar, wenn lokales Speichern blockiert ist.
    }
  }

  const normalize = value => String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("de-CH");

  const uniqueSorted = key => [...new Set(offers.map(offer => offer[key]).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "de-CH"));

  const orderedValues = (key, order) => {
    const values = new Set(offers.map(offer => offer[key]).filter(Boolean));
    return [
      ...order.filter(value => values.has(value)),
      ...[...values].filter(value => !order.includes(value)).sort((a, b) => a.localeCompare(b, "de-CH"))
    ];
  };

  const addOptions = (select, values, formatter = value => value) => {
    values.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = formatter(value);
      select.append(option);
    });
  };

  const splitTokens = (value, pattern = /\s*\|\s*/) =>
    String(value ?? "").split(pattern).map(token => token.trim()).filter(Boolean);

  const tokenValues = (key, order, pattern = /\s*\|\s*/) => {
    const values = new Set(offers.flatMap(offer => splitTokens(offer[key], pattern)));
    return [
      ...order.filter(value => values.has(value)),
      ...[...values].filter(value => !order.includes(value)).sort((a, b) => a.localeCompare(b, "de-CH"))
    ];
  };

  // E086/E087 (Paket 9), E093 (Paket 10): Rohcodes in Anzeigetexten lesbar machen; Platzhalter als «keine Angabe».
  // Nur die Anzeige ändert sich, der Datensatz bleibt wörtlich erhalten. Unbekannte Codes bleiben stehen (Test D5).
  const CODE_TEXT = Object.freeze({
    NOT_PUBLISHED: "keine Angabe", NICHT_PUBLIZIERT: "keine Angabe",
    ON_REQUEST: "auf Anfrage", SUR_DEMANDE: "auf Anfrage",
    FUTURE_BOOKABLE: "buchbar", NO_FREE_PLACES: "ausgebucht",
    NICHT_VERIFIZIERT_CURRENT_RECHECK: "nicht verifiziert"
  });
  const readableCodes = value => String(value ?? "").replace(/\b[A-Z]{2,}(?:_[A-Z]+)+\b/g, code => CODE_TEXT[code] ?? code);
  // E093 (Paket 10): fehlende Angaben neutral. In Anzeigetexten wird «X nicht publiziert» bzw. «kein X publiziert»
  // zu «X: keine Angabe»; steht X für das Feld selbst (z. B. «Dauer nicht publiziert»), bleibt «keine Angabe».
  // Nur die Anzeige ändert sich; andere Formulierungen bleiben wörtlich stehen.
  const MISSING = "keine Angabe";
  const neutralMissing = (value, field = "") => String(value ?? "").split(/(\s*;\s*|\s+\/\s+|,\s+)/).map((part, index) => {
    const negated = part.match(/^(.*?)\s*\b(?:noch\s+)?nicht\s+(?:separat\s+)?publiziert\.?(\s*\([^)]*\))?$/i);
    const none = negated ? null : part.match(/^kein(?:e|en|er|es)?\s+(.+?)\s+publiziert\.?(\s*\([^)]*\))?$/i);
    const match = negated || none;
    if (!match) return part;
    let subject = match[1].trim();
    const tail = match[2] || "";
    if (!subject || normalize(subject) === normalize(field)) return `${MISSING}${tail}`;
    if (index === 0) subject = subject.charAt(0).toUpperCase() + subject.slice(1);
    return `${subject}: ${MISSING}${tail}`;
  }).join("");

  // Smart-Karte ohne Feldbezeichnung: ohne Angabe heisst es «Dauer: keine Angabe».
  const smartDuration = offer => {
    const text = neutralMissing(readableCodes(offer.duration || ""), "Dauer");
    return text && text !== MISSING ? text : `Dauer: ${MISSING}`;
  };

  const humanizeTokens = (value, labelMap, pattern = /\s*\|\s*/) =>
    splitTokens(value, pattern).map(token => labelMap[token] ?? token).join(" · ");

  // D7 (E043, E065, E066): Länder nach dem Vier-Felder-Modell aus dem Master (Feld laender).
  // Der Rohwert country bleibt im Datensatz, wird aber nicht mehr angezeigt oder gefiltert.
  const NOT_RECORDED = MISSING;
  const COUNTRY_NAMES = {
    CH: "Schweiz", AT: "Österreich", LI: "Liechtenstein", DE: "Deutschland", FR: "Frankreich", IT: "Italien",
    BE: "Belgien", NO: "Norwegen", SE: "Schweden", PT: "Portugal", ES: "Spanien", GB: "Grossbritannien", US: "USA"
  };
  const countryName = code => COUNTRY_NAMES[code] ?? code;
  const isoCodes = value => String(value ?? "").split("|").map(code => code.trim()).filter(code => /^[A-Z]{2}$/.test(code));
  const laender = offer => offer.laender && typeof offer.laender === "object" ? offer.laender : {};
  const placeOnline = offer => /(?:^|_)ONLINE$/.test(String(laender(offer).ortSicherheit ?? ""));
  // Filter Durchführungsort (Owner 10.11.): Länder des Orts, «Online» bei Online-Anteil, sonst «keine Angabe» (E093).
  const placeFilterValues = offer => {
    const values = isoCodes(laender(offer).ortLand).map(countryName);
    if (placeOnline(offer)) values.push("Online");
    return values.length ? values : [NOT_RECORDED];
  };
  const placeLabel = offer => {
    const countries = isoCodes(laender(offer).ortLand).map(countryName);
    const base = countries.length ? countries.join(" / ") : placeOnline(offer) ? "Online" : NOT_RECORDED;
    const region = regionDisplay(currentRegion(offer));
    return region && normalize(region) !== normalize(base) ? `${base} · ${region}` : base;
  };
  // Anbieterland nur mit Beleg (E065); sonst sichtbar «keine Angabe» (E036, E082, Wortlaut E093).
  const providerCountryLabel = offer => isoCodes(laender(offer).anbieterLand).map(countryName).join(" / ") || NOT_RECORDED;
  // CH-Zugang nur aus CH-Durchführungsort (E066), nie aus dem Anbieterland (E030).
  const chAccessLabel = offer => laender(offer).chZugang === "JA" ? "ja (Ort in der Schweiz)" : NOT_RECORDED;
  const placeSearchText = offer => [...isoCodes(laender(offer).ortLand), ...isoCodes(laender(offer).anbieterLand)]
    .map(countryName).join(" ");

  const countryValues = order => {
    const values = new Set(offers.flatMap(placeFilterValues));
    const tail = ["Online", NOT_RECORDED];
    return [
      ...order.filter(value => values.has(value)),
      ...[...values].filter(value => !order.includes(value) && !tail.includes(value)).sort((a, b) => a.localeCompare(b, "de-CH")),
      ...tail.filter(value => values.has(value))
    ];
  };

  const escapeHtml = value => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const formatDate = value => {
    const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : String(value ?? "");
  };

  const publicStart = offer => {
    const session = nextSession(offer);
    if (session) return session.label || formatDate(session.startDate);
    const raw = String(offer.start ?? "").trim();
    const start = parseDate(offer.startDate);
    const end = parseDate(offer.endDate);
    const datedText = [...raw.matchAll(/\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\b|\b(20\d{2})-(\d{2})-(\d{2})\b/g)]
      .map(match => match[4]
        ? `${match[4]}-${match[5]}-${match[6]}`
        : `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`);
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const hasPastDate = datedText.some(date => date < todayIso);

    if (!hasPastDate && !(start && start < today)) {
      return /abgeschlossen/i.test(raw) && !start && !end
        ? "Nächste Ausgabe: keine Angabe"
        : raw;
    }
    // Im Datensatz bleiben die historischen Angaben vollständig erhalten.
    // Die Angebotskarte zeigt bei laufenden oder undatierten Ausgaben keine alten Termine.
    if (start && start >= today) return formatDate(offer.startDate);
    if (end && end >= today) return "Bereits begonnen; nächster Start: keine Angabe";
    return "Nächster Termin: keine Angabe";
  };

  const compactAmount = value => String(value ?? "")
    .replace(/’/g, "'")
    .replace(/\.00\b/g, "")
    .replace(/[.,](?:[-–—])?$/, "");

  const compactMoneyNumber = value => {
    const cleaned = String(value ?? "")
      .replace(/[’'\s]/g, "")
      .replace(/([.,]\d{2})$/, "")
      .replace(/[.,]/g, "");
    const amount = Number(cleaned);
    return Number.isFinite(amount) ? amount : null;
  };

  // MS-39: A price charged per unit must never look like a total course fee.
  // Only a unit next to the chosen amount is appended; unrelated fees are not reclassified.
  const priceBillingSuffix = (raw, match) => {
    if (!match || match.index == null) return "";
    const after = raw.slice(match.index + match[0].length, match.index + match[0].length + 55)
      .replace(/^[\s.\-–—]+/, "");
    const unit = after.match(/^(brutto\s*)?(?:(?:pro|per|par|je)\s+|\/\s*)(halbtag|semester|stunde|monat|modul|jahr|jour|semestre|heure|mois|module)\b/i);
    if (!unit) return "";
    const labels = { halbtag: "Halbtag", semester: "Semester", stunde: "Stunde", monat: "Monat", modul: "Modul", jahr: "Jahr", jour: "Kurstag", semestre: "Semester", heure: "Stunde", mois: "Monat", module: "Modul" };
    return `${unit[1] ? " brutto" : ""} pro ${labels[unit[2].toLowerCase()]}`;
  };

  const priceHasBillingUnit = raw => /\b(?:pro|per|par|je)\s+(?:halbtag|semester|stunde|monat|modul|jahr|jour|semestre|heure|mois|module)\b|\/\s*(?:halbtag|semester|stunde|monat|modul|jahr|jour|semestre|heure|mois|module)\b/i.test(raw);

  const compactPrice = offer => {
    const raw = String(offer.priceDisplay ?? "").trim();
    const normalized = normalize(raw);

    if (!raw || offer.priceCategory === "PREIS_NICHT_PUBLIZIERT"
        || normalized.includes("nicht_publiziert")
        || normalized.includes("nicht publiziert")) return MISSING;
    if (offer.priceCategory === "NOT_APPLICABLE") return "Nicht anwendbar";
    // MS-43: conditional free tariffs mentioned in a price text are not generally free.
    // WDA-03 (E057): «Kostenlos» nur ohne Bedingung; sonst Bedingung nennen oder «Preis unbestätigt».
    if (offer.priceCategory === "KOSTENLOS") return freeStatus(offer).label;
    // A mostly-free event series with individual paid sessions has no single course price.
    if (offer.priceCategory === "MEHRERE_TARIFE" && /\bgr[oö]sstenteils\s+kostenlos\b/i.test(raw)) return labels.priceCategory[offer.priceCategory];
    if (offer.priceCategory === "PREIS_AUF_ANFRAGE" || /preis\s+auf\s+anfrage/i.test(raw)) return "Auf Anfrage";
    // A provider-wide per-day tariff note does not identify a reliable all-in course price.
    if (/les prix sont indiqu[eé]s par jour de formation/i.test(raw)) return labels.priceCategory[offer.priceCategory] ?? "Mehrere Tarife";

    // MS-39 V26: conservative guard for multi-tariff offers with independent
    // application fees, separately billed extras, optional coaching, or instalments.
    // A smaller secondary charge or periodic instalment is never a course price.
    // Returning the published category is safer than guessing a comparable total.
    const multiTariffAncillaryCharge =
      /\banmeldegeb[uü]hr\b/i.test(raw)
      || /\bzus[aä]tzlich\s+(?:ca\.?\s*)?(?:CHF|EUR|USD|GBP)\s*\d/i.test(raw)
      || /\boptional\b[^;|]{0,48}\b(?:CHF|EUR|USD|GBP)\s*\d/i.test(raw)
      || /\b\d+\s*[x×]\s*(?:CHF|EUR|USD|GBP)\s*\d/i.test(raw);
    if (offer.priceCategory === "MEHRERE_TARIFE" && multiTariffAncillaryCharge) {
      return labels.priceCategory[offer.priceCategory];
    }

    const moneyRegex = /\b(CHF|EUR|USD|GBP)\s*([0-9][0-9'’.,]*)/gi;
    const matches = [...raw.matchAll(moneyRegex)].filter(match => {
      const tail = raw.slice(match.index + match[0].length, match.index + match[0].length + 28);
      const before = raw.slice(Math.max(0, match.index - 60), match.index);
      const cancellationFee = /\b(?:annulation|stornierung|stornogeb[uü]hr|cancellation)\b[^|;()]{0,35}$/i.test(before);
      return !cancellationFee && !/\boptional\b/i.test(tail);
    });

    // Bei festen Preisfiltern muss der kompakte Kartenpreis dieselbe Preislage
    // darstellen wie die redaktionell gesetzte Kategorie. Sonst erscheinen
    // Anmeldegebühren, Rabatte oder Raten irreführend als Angebotspreis.
    const categoryBounds = {
      BIS_500: amount => amount <= 500,
      "501_2000": amount => amount >= 501 && amount <= 2000,
      UEBER_2000: amount => amount > 2000
    };
    const inCategory = categoryBounds[offer.priceCategory];
    if (matches.length && inCategory) {
      const categoryMatch = matches.find(match => {
        const amount = compactMoneyNumber(match[2]);
        return amount != null && inCategory(amount);
      });
      if (categoryMatch) {
        const prefix = /^\s*ab\b/i.test(raw) ? "ab " : "";
        const display = `${prefix}${categoryMatch[1].toUpperCase()} ${compactAmount(categoryMatch[2])}`;
        const unit = priceBillingSuffix(raw, categoryMatch);
        // If a total and a per-semester alternative are both given, show both
        // verbatim rather than leaving a standalone, potentially ambiguous amount.
        if (!unit && priceHasBillingUnit(raw)) {
          const byUnit = matches.find(m => m !== categoryMatch && priceBillingSuffix(raw, m));
          if (byUnit && byUnit[1].toUpperCase() === categoryMatch[1].toUpperCase()) {
            return `${display} (${byUnit[1].toUpperCase()} ${compactAmount(byUnit[2])}${priceBillingSuffix(raw, byUnit)})`;
          }
        }
        return `${display}${unit}`;
      }
      return labels.priceCategory[offer.priceCategory];
    }

    // Für mehrere Tarife ist ein explizit publizierter Journalist:innen-Tarif
    // weiterhin der relevanteste Kartenpreis.
    const journalist = raw.match(/((?:CHF|EUR|USD|GBP)\s*[0-9][0-9'’.,]*)(?=[^()]{0,45}(?:Kurspreis\s+)?Journalist)/i);
    if (journalist) {
      const unit = priceBillingSuffix(raw, journalist);
      return priceHasBillingUnit(raw) && !unit ? labels.priceCategory[offer.priceCategory] ?? "Mehrere Tarife" : `${compactAmount(journalist[1])}${unit}`;
    }

    // Explizite Preisbereiche wie EUR 480–512 oder CHF 0–590 erhalten.
    const range = raw.match(/\b(CHF|EUR|USD|GBP)\s*([0-9][0-9'’.,]*)\s*[–-]\s*([0-9][0-9'’.,]*)/i);
    if (range) return `${range[1].toUpperCase()} ${compactAmount(range[2])}–${compactAmount(range[3])}${priceBillingSuffix(raw, range)}`;

    if (matches.length) {
      const first = `${matches[0][1].toUpperCase()} ${compactAmount(matches[0][2])}`;
      if (/^\s*ab\b/i.test(raw)) return `ab ${first}${priceBillingSuffix(raw, matches[0])}`;

      // Bei mehreren publizierten Tarifen bleibt die Karte knapp: niedrigster belastbarer Tarif.
      if (matches.length > 1) {
        const sameCurrency = matches.every(m => m[1].toUpperCase() === matches[0][1].toUpperCase());
        if (sameCurrency) {
          const values = matches.map(m => ({
            display: compactAmount(m[2]),
            numeric: compactMoneyNumber(m[2])
          })).filter(x => Number.isFinite(x.numeric));
          if (values.length) {
            const min = values.reduce((a, b) => b.numeric < a.numeric ? b : a);
            const chosenMatch = matches.find(m => compactMoneyNumber(m[2]) === min.numeric);
            const unit = priceBillingSuffix(raw, chosenMatch);
            return priceHasBillingUnit(raw) && !unit
              ? labels.priceCategory[offer.priceCategory] ?? "Mehrere Tarife"
              : `ab ${matches[0][1].toUpperCase()} ${min.display}${unit}`;
          }
        }
      }
      const unit = priceBillingSuffix(raw, matches[0]);
      return priceHasBillingUnit(raw) && !unit && offer.priceCategory === "MEHRERE_TARIFE"
        ? labels.priceCategory[offer.priceCategory]
        : `${first}${unit}`;
    }

    return labels.priceCategory[offer.priceCategory] ?? "Preis siehe Anbieter";
  };

  const compactAccess = offer => {
    const raw = String(offer.access ?? "").trim();
    if (!raw) return MISSING;

    const upper = raw.toUpperCase();
    const normalized = normalize(raw);

    if (upper.startsWith("MEMBERSHIP_RESTRICTED")) return "Mitgliedschaft erforderlich";
    if (upper.startsWith("STUDENT_RESTRICTED_ACCESS")) return "Eingeschränkter Zugang";
    if (upper.startsWith("V95_EXPLICIT_APPLICATION_PREREQUISITE")) return "Bewerbung / Zulassung erforderlich";
    if (upper.startsWith("V95_EXPLICIT_PUBLIC_ACCESS")) return "Öffentlich zugänglich";

    if (normalized.includes("zugangsvoraussetzungen nicht publiziert")
        || normalized.includes("nicht publiziert")
        || normalized.includes("not published")) return MISSING;

    if (/\b(bewerbung|zulassung|aufnahmeverfahren|application|admission|eligibility)\b/i.test(raw)
        || /\b(bachelor|masterabschluss|hochschulabschluss)\b/i.test(raw)) {
      return "Bewerbung / Zulassung erforderlich";
    }

    // Die folgenden Evidenzklassen belegen eine öffentliche Buchungs-/Anmeldemöglichkeit.
    if (/^(V95_DOCUMENTED_BOOKING_CTA|OFFICIAL_PROVIDER_(ACCESS_RULE|AGB|BOOKING_FORM|RULE)|CURRENT_OFFICIAL_(PRODUCT_TEMPLATE|PRODUCT_PAGE|PROVIDER|SBVV|EBU|SFGZ|EJC|WEKA|SAWI))\b/i.test(raw)) {
      return "Öffentlich buchbar";
    }

    if (/^(CURRENT_OFFICIAL_(ZHdK|DSA|UNIBE|SUPSI|UNIGE|MAZ))/i.test(raw)) {
      return "Bewerbung / Zulassung erforderlich";
    }

    if (/\b(öffentlich|buchbar|anmeldung|anmelden|inscription|register|booking)\b/i.test(raw)) {
      return "Öffentlich buchbar";
    }

    return "Details beim Anbieter";
  };

  const regionDisplay = value => {
    const raw = String(value ?? "").trim();
    return ["", "NOT_PUBLISHED", "NICHT_PUBLIZIERT", "NOT_APPLICABLE"].includes(raw.toUpperCase())
      ? ""
      : neutralMissing(readableCodes(raw));
  };


  const sortOffers = list => {
    const sorted = [...list];
    switch (el.sort.value) {
      case "START": {
        const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const startDate = offer => {
          const value = String(nextSession(offer)?.startDate ?? offer.startDate ?? "").trim();
          return ISO_DATE.test(value) ? value : "";
        };
        const startTier = date => !date ? 2 : date >= todayDate ? 0 : 1;
        return sorted.sort((a, b) => {
          const aDate = startDate(a);
          const bDate = startDate(b);
          const aTier = startTier(aDate);
          const bTier = startTier(bDate);
          const dateOrder = aTier === 0
            ? aDate.localeCompare(bDate)
            : aTier === 1
              ? bDate.localeCompare(aDate)
              : 0;
          return aTier - bTier
            || dateOrder
            || a.provider.localeCompare(b.provider, "de-CH")
            || a.title.localeCompare(b.title, "de-CH");
        });
      }
      case "PROVIDER":
        return sorted.sort((a, b) => a.provider.localeCompare(b.provider, "de-CH")
          || a.title.localeCompare(b.title, "de-CH"));
      case "APPROVED":
      default:
        // Default to the documented review date, not an implied editorial ranking.
        return sorted.sort((a, b) => String(b.approved ?? "").localeCompare(String(a.approved ?? ""))
          || a.provider.localeCompare(b.provider, "de-CH")
          || a.title.localeCompare(b.title, "de-CH")
          || String(a.id).localeCompare(String(b.id), "de-CH"));
    }
  };

  const urlParamMap = {
    q: el.search,
    focus: el.focus,
    type: el.type,
    price: el.price,
    format: el.format,
    language: el.language,
    country: el.country,
    level: el.level
  };

  const hasOption = (select, value) => [...select.options].some(option => option.value === value);

  const applyUrlState = () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) el.search.value = query;

    Object.entries(urlParamMap).forEach(([name, node]) => {
      if (name === "q") return;
      const value = params.get(name);
      if (value && hasOption(node, value)) node.value = value;
    });

    const sort = params.get("sort");
    if (sort && hasOption(el.sort, sort)) el.sort.value = sort;
  };

  const syncUrl = filter => {
    const params = new URLSearchParams();
    // E091 (E056): Suchtext nicht in die Adresse schreiben; applyUrlState liest alte Links mit ?q= weiter.
    if (filter.focus) params.set("focus", filter.focus);
    if (filter.type) params.set("type", filter.type);
    if (filter.price) params.set("price", filter.price);
    if (filter.format) params.set("format", filter.format);
    if (filter.language) params.set("language", filter.language);
    if (filter.country) params.set("country", filter.country);
    if (filter.level) params.set("level", filter.level);
    if (el.sort.value !== "APPROVED") params.set("sort", el.sort.value);

    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", next);
  };

  const heartSvg = `
    <svg class="heart-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20.4 4.4 13A5.1 5.1 0 0 1 11.6 5.8L12 6.2l.4-.4A5.1 5.1 0 0 1 19.6 13Z"></path>
    </svg>`;

  const fact = (label, value) => `
    <div class="fact-item">
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>`;


  // Paket A / QA-24: a non-HTTPS or malformed URL must never become a clickable link.
  const safeOfferHref = raw => {
    if (typeof raw !== "string" || !raw.startsWith("https://") || /[\u0000-\u0020\u007f]/.test(raw)) return null;
    try {
      const parsed = new URL(raw);
      if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) return null;
      return parsed.href;
    } catch { return null; }
  };
  const officialOfferLink = (offer, label) => {
    const href = safeOfferHref(offer.url);
    if (!href) return '<span class="source-link source-link-unavailable">Angebotslink nicht verfügbar</span>';
    return `<a class="source-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}: ${escapeHtml(offer.title)} öffnen">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;
  };

  // E100 (Owner 10.11.): Niveau ohne Angabe mit Feldname, wie E093.
  const levelBadge = offer => {
    const label = labels.level[offer.level] ?? offer.level;
    return !String(label ?? "").trim() || label === MISSING ? `Niveau: ${MISSING}` : label;
  };

  // E102 (Owner 10.11.): Sprache ohne Angabe mit Feldname, gleiche Regel wie E100.
  const languageBadge = offer => {
    const label = humanizeTokens(offer.language, labels.language, /\s*[|/]\s*/);
    return !String(label ?? "").trim() || label === MISSING ? `Sprache: ${MISSING}` : label;
  };

  const card = offer => {
    const isFavorite = favorites.has(offer.id);
    const favoriteLabel = `${offer.title} als Favorit merken`;
    const favoriteTitle = isFavorite
      ? `${offer.title} aus den Favoriten entfernen`
      : `${offer.title} zu den Favoriten hinzufügen`;
    const place = placeLabel(offer);
    const feedbackSubject = encodeURIComponent(`Hinweis zu ${offer.provider}: ${offer.title}`);

    return `
      <article class="card" data-offer-id="${escapeHtml(offer.id)}">
        <div class="card-topline">
          <p class="provider">${escapeHtml(offer.provider)}</p>
          <div class="card-actions">
            <span class="badge badge-focus" data-focus="${escapeHtml(offer.focus)}">
              ${escapeHtml(labels.focus[offer.focus] ?? offer.focus)}
            </span>
            <button class="favorite-button${isFavorite ? " is-favorite" : ""}"
              type="button"
              data-favorite-id="${escapeHtml(offer.id)}"
              aria-pressed="${isFavorite}"
              aria-label="${escapeHtml(favoriteLabel)}"
              title="${escapeHtml(favoriteTitle)}">
              ${heartSvg}
            </button>
          </div>
        </div>
        <h3>${escapeHtml(offer.title)}</h3>
        <dl class="facts" aria-label="Preis, Durchführungsform, Dauer und Start">
          ${fact("Preis", compactPrice(offer))}
          ${fact("Durchführung", humanizeTokens(offer.format, labels.format))}
          ${fact("Dauer", neutralMissing(readableCodes(offer.duration), "Dauer"))}
          ${fact("Start", neutralMissing(readableCodes(publicStart(offer)), "Start"))}
        </dl>
        <p class="card-description">${escapeHtml(offer.description)}</p>
        <p class="access"><strong>Zugang:</strong> ${escapeHtml(compactAccess(offer))}</p>
        <div class="badges" aria-label="Angebotsart und weitere Eigenschaften">
          <span class="badge badge-type">${escapeHtml(labels.offerType[offer.offerType] ?? offer.offerType)}</span>
          <span class="badge">${escapeHtml(levelBadge(offer))}</span>
          <span class="badge">${escapeHtml(languageBadge(offer))}</span>
          <span class="badge">Ort: ${escapeHtml(place)}</span>
          <span class="badge">Anbieterland: ${escapeHtml(providerCountryLabel(offer))}</span>
          <span class="badge">CH-Zugang: ${escapeHtml(chAccessLabel(offer))}</span>
        </div>
        <div class="card-footer">
          <div class="card-links">
            ${officialOfferLink(offer, "Offizielle Angebotsseite")}
            <a class="feedback-link" href="mailto:contact@mediaskills.ch?subject=${feedbackSubject}">Fehler melden</a>
          </div>
          <span class="checked">Geprüft: ${escapeHtml(formatDate(offer.approved))}</span>
        </div>
      </article>`;
  };


  // Smart Search MS-12: deterministic BUG-01 implementation.
  // Structured price/delivery truth comes from smart-search-data.js; data.js remains the display/topic roster.
  const SMART_DATA = window.MEDIA_SKILLS_SMART_DATA && window.MEDIA_SKILLS_SMART_DATA.byId
    ? window.MEDIA_SKILLS_SMART_DATA
    : { meta: {}, byId: {} };

  const SMART_FREE_TOKEN_RE = /^(?:gratis|kostenlos(?:e(?:n|r|s|m)?)?|kostenfrei(?:e(?:n|r|s|m)?)?)$/;
  const SMART_FREE_INTENT_RE = /\b(?:gratis|kostenlos(?:e(?:n|r|s|m)?)?|kostenfrei(?:e(?:n|r|s|m)?)?)\b/;

  const DELIVERY_INTENT_LABELS = Object.freeze({
    ONLINE: "Online",
    IN_PERSON: "Präsenz",
    STRICT_REMOTE: "Nur online / ohne Präsenz",
    STRICT_IN_PERSON: "Nur Präsenz / ohne Online-Anteil",
    HYBRID: "Hybrid",
    LIVE_ONLINE: "Online live",
    ON_DEMAND: "On-Demand",
    ASYNCHRONOUS: "Asynchron",
    SELF_STUDY: "Selbststudium",
    SELF_PACED: "Selbstbestimmtes Tempo",
    WEBINAR: "Webinar",
    HYFLEX: "Hyflex"
  });

  const SMART_STOPWORDS = new Set([
    "ich", "habe", "hatte", "mochte", "moechte", "will", "wurde", "wuerde", "mich", "mir",
    "im", "in", "am", "an", "auf", "fur", "fuer", "zu", "zum", "zur", "von", "mit", "ohne", "vor",
    "und", "oder", "der", "die", "das", "den", "dem", "einen", "eine", "ein", "einem", "einer",
    "bereich", "lernen", "weiterbilden", "weiterbildung", "kurs", "kurse", "angebot", "angebote",
    "suche", "brauche", "bitte", "etwas", "maximal", "hochstens", "hoechstens", "unter", "bis",
    "budget", "franken", "chf", "eur", "euro", "euros", "usd", "gbp", "zeit", "tage", "tag", "tagen", "stunden", "stunde", "std",
    "online", "remote", "hybrid", "prasenz", "praesenz", "ort", "live", "demand", "selbststudium",
    "selbstlernen", "self", "paced", "webinar", "hyflex", "asynchron", "asynchronous", "rein",
    "vollstandig", "vollstaendig", "nur", "kein", "keine", "lieber", "aber", "prasenzkurs", "praesenzkurs",
    "gratis", "kostenlos", "kostenfrei",
    // MS-38: non-topic words in natural-language German questions.
    "gerne", "uber", "interessiere", "welche", "gibt", "es", "was", "bin",
    "weiterbildungen", "verbessern",
    // E106 (Owner 10.11.): Füllverben in Sätzen wie «… machen für 2000 CHF»
    "machen", "besuchen", "belegen", "absolvieren"
  ]);

  const smartNumber = raw => {
    const cleaned = String(raw ?? "")
      .replace(/[’'\s]/g, "")
      .replace(/([.,]\d{2})$/, "")
      .replace(/[.,]/g, "");
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : null;
  };

  const parseSmartBudget = raw => {
    const input = String(raw ?? "");
    const patterns = [
      { currency: "CHF", match: /\bCHF\s*([0-9][0-9'’.,]*)/i },
      { currency: "CHF", match: /\b([0-9][0-9'’.,]*)\s*CHF\b/i },
      { currency: "CHF", match: /\b(?:Fr\.?|Franken)\s*([0-9][0-9'’.,]*)/i },
      { currency: "CHF", match: /\b([0-9][0-9'’.,]*)\s*(?:Fr\.?|Franken)\b/i },
      { currency: "EUR", match: /\bEUR\s*([0-9][0-9'’.,]*)/i },
      { currency: "EUR", match: /\b([0-9][0-9'’.,]*)\s*EUR\b/i },
      { currency: "EUR", match: /\b(?:Euro|Euros)\s*([0-9][0-9'’.,]*)/i },
      { currency: "EUR", match: /\b([0-9][0-9'’.,]*)\s*(?:Euro|Euros)\b/i },
      { currency: "EUR", match: /€\s*([0-9][0-9'’.,]*)/i },
      { currency: "EUR", match: /([0-9][0-9'’.,]*)\s*€/i },
      { currency: "USD", match: /\bUSD\s*([0-9][0-9'’.,]*)/i },
      { currency: "USD", match: /\b([0-9][0-9'’.,]*)\s*USD\b/i },
      { currency: "USD", match: /\b(?:Dollar|Dollars)\s*([0-9][0-9'’.,]*)/i },
      { currency: "USD", match: /\b([0-9][0-9'’.,]*)\s*(?:Dollar|Dollars)\b/i },
      { currency: "USD", match: /\$\s*([0-9][0-9'’.,]*)/i },
      { currency: "USD", match: /([0-9][0-9'’.,]*)\s*\$/i }
    ];
    for (const { currency, match: pattern } of patterns) {
      const match = input.match(pattern);
      if (!match) continue;
      const amount = smartNumber(match[1]);
      if (amount != null) return { amount, currency };
    }
    return null;
  };

  // MS-41: EUR budgets are recognized but intentionally NOT compared to CHF.
  // The CHF-only budget engine is unchanged; no unsupported FX conversion occurs.
  const parseUnappliedEuroBudget = raw => {
    const patterns = [
      /\bEUR\s*([0-9][0-9'’.,]*)/i,
      /\b([0-9][0-9'’.,]*)\s*EUR\b/i,
      /\bEuros?\s*([0-9][0-9'’.,]*)/i,
      /\b([0-9][0-9'’.,]*)\s*Euros?\b/i
    ];
    for (const pattern of patterns) {
      const match = String(raw ?? "").match(pattern);
      if (!match) continue;
      const amount = smartNumber(match[1]);
      if (amount != null) return { amount, currency: "EUR" };
    }
    return null;
  };

  // MS-46: a currency-free budget is visible but not applied. In particular,
  // "bis" alone must not classify a date, calendar year or clock time as money.
  const parseUnappliedAmountBudget = input => {
    const candidates = /\b(?:budget|maximal|hochstens|hoechstens|bis)\s+(?:von\s+)?([0-9][0-9'’.,]*)/g;
    for (const match of input.matchAll(candidates)) {
      const tail = input.slice(match.index + match[0].length);
      if (/^\s*(?:tage?|tagen|stunden?|wochen?|monate?|jahre?)\b/.test(tail)) continue;
      if (/^bis\b/.test(match[0])) {
        const candidate = match[1].replace(/[.,]$/, "");
        const explicitMoney = /\.\s*[-–]/.test(match[1] + tail.slice(0, 4))
          || /[’']\d{3}(?:\D|$)/.test(match[1]);
        const dotDate = candidate.match(/^(\d{1,2})[.](\d{1,2})(?:[.]\d{2,4})?$/);
        const validDotDate = dotDate && Number(dotDate[1]) >= 1 && Number(dotDate[1]) <= 31
          && Number(dotDate[2]) >= 1 && Number(dotDate[2]) <= 12;
        // Swiss price suffixes and grouped thousands override a bare year.
        // Unmarked round hundreds (e.g. "bis 2000") remain visibly ambiguous.
        const likelyYear = /^(?:19|20)\d{2}$/.test(candidate)
          && !explicitMoney && Number(candidate) % 100 !== 0;
        // Handle abbreviated month names and slash-separated dates: these are
        // deadlines, not budgets (e.g. 30. Okt., 31/12/2027, 12/2027).
        const writtenMonth = /^\s*(?:jan(?:uar)?|feb(?:ruar)?|marz|mar|apr(?:il)?|mai|jun(?:i)?|jul(?:i)?|aug(?:ust)?|sep(?:t(?:ember)?)?|okt(?:ober)?|nov(?:ember)?|dez(?:ember)?)\b/.test(tail);
        const slashParts = tail.match(/^\s*\/\s*(\d{1,4})(?:\s*\/\s*(\d{2,4}))?(?=\D|$)/);
        const first = Number(candidate);
        const validSlashDate = slashParts && (
          (first >= 1 && first <= 31 && Number(slashParts[1]) >= 1 && Number(slashParts[1]) <= 12)
          || (first >= 1 && first <= 12 && Number(slashParts[1]) >= 1900 && Number(slashParts[1]) <= 2199)
        );
        const yearDash = /^\s*[-/]\s*(?:19|20)\d{2}\b/.test(tail) && first >= 1 && first <= 12;
        const clockWithDot = candidate.match(/^(\d{1,2})[.](\d{2})$/);
        const validClock = clockWithDot && Number(clockWithDot[1]) <= 23 && Number(clockWithDot[2]) <= 59;
        const timeOrMonth = /^\s*(?:uhr\b|:\s*\d{1,2}\b)/.test(tail);
        if (likelyYear || validDotDate || writtenMonth || validSlashDate || yearDash
            || timeOrMonth || (validClock && !explicitMoney)) continue;
      }
      const amount = smartNumber(match[1]);
      if (amount != null) return { amount };
    }
    return null;
  };

  // MS-45: the word "oder" between the two positive delivery channels is OR,
  // not a request for an offer supporting both channels simultaneously.
  const hasAlternativeChannels = input =>
    /\b(?:online|remote)\s+oder\s+(?:prae?senz|vor\s+ort)\b|\b(?:prae?senz|vor\s+ort)\s+oder\s+(?:online|remote)\b/.test(input);

  const parseDeliveryIntent = input => {
    const negatedInPerson = /\b(?:ohne\s+prae?senz|kein(?:e|en)?\s+prae?senz(?:kurs)?)\b/;
    const negatedOnline = /\b(?:ohne|kein(?:e|en)?)\s+online(?:[- ]?anteil)?\b/;
    const strictRemote = /\b(?:rein|100\s*%|vollstandig|vollstaendig)\s+online\b/.test(input) || negatedInPerson.test(input);
    const strictInPerson = /\bnur\s+prae?senz\b|\b100\s*%\s+(?:vor\s+ort|prae?senz)\b/.test(input) || negatedOnline.test(input);
    const positiveChannelInput = input
      .replace(new RegExp(negatedInPerson.source, "g"), " ")
      .replace(new RegExp(negatedOnline.source, "g"), " ");
    const liveOnline = /\blive\s+online\b|\bonline\s+live\b/.test(positiveChannelInput);
    const onDemand = /\bon[- ]?demand\b/.test(input);
    const asynchronous = /\basynchron(?:ous)?\b/.test(input);
    const selfStudy = /\bselbststudium\b|\bself[- ]?study\b|\bselbstlern/.test(input);
    const selfPaced = /\bself[- ]?paced\b|\beigen(?:en|em)?\s+tempo\b|\bim\s+eigenen\s+tempo\b/.test(input);
    const webinar = /\bwebinar\b/.test(input);
    const hyflex = /\bhyflex\b/.test(input);
    const hybrid = /\bhybrid\b/.test(input) && !hyflex;
    // Search broad channels only after removing negated phrases. Independent,
    // explicitly positive channel words remain visible and can expose a genuinely
    // contradictory query instead of being silently discarded.
    const broadOnline = !strictRemote && (liveOnline || /\bonline\b|\bremote\b/.test(positiveChannelInput));
    const broadInPerson = !strictInPerson && /\bprae?senz(?:kurs)?\b|\bvor\s+ort\b/.test(positiveChannelInput);
    const intents = [];
    if (strictRemote) intents.push("STRICT_REMOTE");
    else if (broadOnline) intents.push("ONLINE");
    if (strictInPerson) intents.push("STRICT_IN_PERSON");
    else if (broadInPerson) intents.push("IN_PERSON");
    if (hybrid) intents.push("HYBRID");
    if (liveOnline) intents.push("LIVE_ONLINE");
    if (onDemand) intents.push("ON_DEMAND");
    if (asynchronous) intents.push("ASYNCHRONOUS");
    if (selfStudy) intents.push("SELF_STUDY");
    if (selfPaced) intents.push("SELF_PACED");
    if (webinar) intents.push("WEBINAR");
    if (hyflex) intents.push("HYFLEX");
    return [...new Set(intents)];
  };

  const SMART_LANGUAGE_CODES = Object.freeze({
    deutsch: "DE", englisch: "EN", english: "EN", franzosisch: "FR",
    francais: "FR", italienisch: "IT", italiano: "IT"
  });
  const SMART_LANGUAGE_LABELS = Object.freeze({ DE: "Deutsch", EN: "Englisch", FR: "Französisch", IT: "Italienisch" });
  const SMART_LANGUAGE_PATTERN = /\b(?:auf|in)\s+(deutsch|englisch|english|franzosisch|francais|italienisch|italiano)\b/g;

  const parseSmartQuery = raw => {
    const input = normalize(raw);
    const requestedLanguages = new Set([...input.matchAll(SMART_LANGUAGE_PATTERN)]
      .map(match => SMART_LANGUAGE_CODES[match[1]]));
    const language = requestedLanguages.size === 1 ? [...requestedLanguages][0] : null;
    const budget = parseSmartBudget(raw);
    const unappliedBudget = budget ? null : parseUnappliedEuroBudget(raw);
    const unappliedAmountBudget = budget || unappliedBudget ? null : parseUnappliedAmountBudget(input);
    const dayMatch = input.match(/\b(?:zwei|2)\s*(?:tag|tage|tagen)\b/);
    const numericDayMatch = input.match(/\b(\d{1,2})\s*(?:tag|tage|tagen)\b/);
    const deliveryIntents = parseDeliveryIntent(input);
    const deliveryOrGroup = deliveryIntents.includes("ONLINE") && deliveryIntents.includes("IN_PERSON")
      && hasAlternativeChannels(input) ? ["ONLINE", "IN_PERSON"] : null;
    const freeOnly = SMART_FREE_INTENT_RE.test(input);
    let tokenSource = (language ? input.replace(SMART_LANGUAGE_PATTERN, " ") : input)
      .replace(/\bich\s+bin\s+journalist(?:in)?\b/g, " ")
      .replace(/\b(?:chf|eur|usd)\s*[0-9][0-9'’.,]*\b/g, " ")
      .replace(/\b[0-9][0-9'’.,]*\s*(?:chf|eur|usd)\b/g, " ")
      .replace(/\b(?:fr\.?|franken|euro|euros|dollar|dollars)\s*[0-9][0-9'’.,]*\b/g, " ")
      .replace(/\b[0-9][0-9'’.,]*\s*(?:fr\.?|franken|euro|euros|dollar|dollars)\b/g, " ")
      .replace(/[€$]\s*[0-9][0-9'’.,]*/g, " ")
      .replace(/[0-9][0-9'’.,]*\s*[€$]/g, " ")
      .replace(/\b(?:zwei|\d{1,2})\s*(?:tag|tage|tagen)\b/g, " ")
      .replace(/\b(?:rein|vollstandig|vollstaendig|100\s*%)\s+online\b/g, " ")
      .replace(/\bohne\s+prae?senz\b|\bkein(?:e|en)?\s+prae?senz(?:kurs)?\b/g, " ")
      .replace(/\bnur\s+prae?senz\b|\b100\s*%\s+(?:vor\s+ort|prae?senz)\b|\b(?:ohne|kein(?:e|en)?)\s+online(?:[- ]?anteil)?\b/g, " ")
      .replace(/\blive\s+online\b|\bonline\s+live\b|\bon[- ]?demand\b|\bself[- ]?paced\b|\bself[- ]?study\b|\bim\s+eigenen\s+tempo\b/g, " ");
    const topicTokensOf = text => text.split(/[^a-z0-9äöüß]+/i)
      .map(token => token.trim())
      .filter(token => token.length >= 2
        && !SMART_STOPWORDS.has(token)
        && !SMART_FREE_TOKEN_RE.test(token)
        && !/^\d+$/.test(token));
    const tokens = topicTokensOf(tokenSource);
    // E106: «oder» trennt Themen-Alternativen; innerhalb einer Alternative müssen alle Wörter passen.
    const tokenGroups = tokenSource.split(/\boder\b/)
      .map(part => [...new Set(topicTokensOf(part))])
      .filter(group => group.length);
    return {
      raw: String(raw ?? "").trim(),
      budget,
      unappliedBudget,
      unappliedAmountBudget,
      maxDays: dayMatch ? 2 : numericDayMatch ? Number(numericDayMatch[1]) : null,
      deliveryIntents,
      deliveryOrGroup,
      language,
      freeOnly,
      tokens: [...new Set(tokens)],
      tokenGroups: tokenGroups.length > 1 ? tokenGroups : [[...new Set(tokens)]]
    };
  };

  const smartHaystack = offer => normalize([
    offer.title, offer.description, offer.provider, offer.focus, offer.format, offer.duration, offer.start,
    offer.region, placeSearchText(offer), labels.focus[offer.focus], labels.level[offer.level], labels.offerType[offer.offerType]
  ].join(" "));

  const topicTokenOccurs = (text, token) => token.length > 3
    ? text.includes(token)
    : new RegExp(`(?:^|[^a-z0-9ß])${token}(?=$|[^a-z0-9ß])`).test(text);

  const topicMatch = (offer, parsed) => {
    if (!parsed.tokens.length) return { match: true, score: 0 };
    const title = normalize(offer.title);
    const haystack = smartHaystack(offer);
    const groupScores = parsed.tokenGroups
      .filter(group => group.every(token => topicTokenOccurs(haystack, token)))
      .map(group => group.reduce((sum, token) => sum + (topicTokenOccurs(title, token) ? 8 : 2), 0));
    if (!groupScores.length) return { match: false, score: 0 };
    return { match: true, score: Math.max(...groupScores) };
  };

  const getSmartRecord = offer => SMART_DATA.byId[offer.id] || null;
  const variantsOf = delivery => Array.isArray(delivery?.variants) ? delivery.variants : [];
  const variantChannels = variant => Array.isArray(variant?.attendanceChannels) ? variant.attendanceChannels : [];
  const variantFormats = variant => Array.isArray(variant?.instructionFormats) ? variant.instructionFormats : [];

  const deliveryIntentMatches = (record, intents) => {
    if (!intents.length) return { outcome: "MATCH", evidenceTier: "VERIFIED", matchedVariantIds: [] };
    const delivery = record?.delivery || {};
    const tier = delivery.evidenceTier || "UNKNOWN";
    if (tier === "UNKNOWN") return { outcome: "UNKNOWN", evidenceTier: tier, matchedVariantIds: [] };
    const variants = variantsOf(delivery);
    const structure = delivery.structure || "UNKNOWN";
    const offerChannels = Array.isArray(delivery.channels) ? delivery.channels : [];
    const sourceText = normalize(delivery.sourceText || "");

    const variantMatches = predicate => new Set(variants
      .filter(predicate)
      .map(variant => variant.deliveryVariantId)
      .filter(Boolean));
    const allVariantIds = new Set(variants.map(variant => variant.deliveryVariantId).filter(Boolean));
    const scopedMatch = (matches, ids = null, scope = "OFFER") => ({
      matches,
      ids: ids?.size ? ids : null,
      scope: ids?.size ? "VARIANT" : scope
    });
    const broadChannelMatch = channel => {
      const ids = variantMatches(variant => variantChannels(variant).includes(channel));
      if (ids.size) return scopedMatch(true, ids);
      if (!offerChannels.includes(channel)) return scopedMatch(false);
      if (structure === "SINGLE_CHANNEL" && offerChannels.length === 1) {
        return scopedMatch(true, allVariantIds);
      }
      return scopedMatch(true, null, variants.length ? "UNRESOLVED_VARIANT" : "OFFER");
    };
    const strictRemote = () => {
      const ids = variantMatches(variant => {
        const channels = variantChannels(variant);
        return channels.length === 1 && channels[0] === "REMOTE";
      });
      if (structure === "SINGLE_CHANNEL") {
        const matches = offerChannels.length === 1 && offerChannels[0] === "REMOTE";
        return scopedMatch(matches, ids.size ? ids : matches ? allVariantIds : null);
      }
      if (structure === "MODE_CHOICE" || structure === "HYFLEX") return scopedMatch(ids.size > 0, ids);
      return scopedMatch(false);
    };
    const strictInPerson = () => {
      const ids = variantMatches(variant => {
        const channels = variantChannels(variant);
        return channels.length === 1 && channels[0] === "IN_PERSON";
      });
      if (structure === "SINGLE_CHANNEL") {
        const matches = offerChannels.length === 1 && offerChannels[0] === "IN_PERSON";
        return scopedMatch(matches, ids.size ? ids : matches ? allVariantIds : null);
      }
      if (structure === "MODE_CHOICE" || structure === "HYFLEX") return scopedMatch(ids.size > 0, ids);
      return scopedMatch(false);
    };
    const tests = {
      ONLINE: () => broadChannelMatch("REMOTE"),
      IN_PERSON: () => broadChannelMatch("IN_PERSON"),
      STRICT_REMOTE: () => strictRemote(),
      STRICT_IN_PERSON: () => strictInPerson(),
      HYBRID: () => scopedMatch(structure === "HYBRID_COMBINED"),
      HYFLEX: () => scopedMatch(structure === "HYFLEX"),
      LIVE_ONLINE: () => {
        const ids = variantMatches(v => variantChannels(v).includes("REMOTE") && v.temporalMode === "SYNCHRONOUS");
        return scopedMatch(ids.size > 0, ids);
      },
      ON_DEMAND: () => {
        const ids = variantMatches(v => v.scheduleMode === "ON_DEMAND");
        return scopedMatch(ids.size > 0, ids);
      },
      ASYNCHRONOUS: () => {
        const ids = variantMatches(v => v.temporalMode === "ASYNCHRONOUS");
        return scopedMatch(ids.size > 0, ids);
      },
      SELF_STUDY: () => {
        const ids = variantMatches(v => variantFormats(v).includes("SELF_STUDY"));
        return scopedMatch(ids.size > 0, ids);
      },
      WEBINAR: () => {
        const ids = variantMatches(v => variantFormats(v).includes("WEBINAR"));
        return scopedMatch(ids.size > 0, ids);
      },
      SELF_PACED: () => {
        const matches = /\bself[- ]?paced\b|\bown pace\b|\beigen(?:en|em)? tempo\b/.test(sourceText);
        if (!matches) return scopedMatch(false);
        if (variants.length === 1) return scopedMatch(true, allVariantIds);
        return scopedMatch(true, null, variants.length ? "UNRESOLVED_VARIANT" : "OFFER");
      }
    };
    const results = intents.map(intent => tests[intent] ? tests[intent]() : scopedMatch(false));
    if (results.some(result => !result.matches)) {
      return { outcome: "MISMATCH", evidenceTier: tier, matchedVariantIds: [] };
    }
    const variantResults = results.filter(result => result.scope !== "OFFER");
    if (variantResults.length > 1 && variantResults.some(result => result.scope === "UNRESOLVED_VARIANT")) {
      return { outcome: "MISMATCH", evidenceTier: tier, matchedVariantIds: [] };
    }
    const scopedIds = variantResults.filter(result => result.ids).map(result => result.ids);
    if (!scopedIds.length) return { outcome: "MATCH", evidenceTier: tier, matchedVariantIds: [] };
    const matchingIds = [...scopedIds[0]].filter(id => scopedIds.every(ids => ids.has(id)));
    if (!matchingIds.length) return { outcome: "MISMATCH", evidenceTier: tier, matchedVariantIds: [] };
    return { outcome: "MATCH", evidenceTier: tier, matchedVariantIds: matchingIds };
  };

  // MS-45: each OR alternative is checked by the established delivery matcher,
  // including its variant logic. Combine only VERIFIED matching alternatives.
  const matchParsedDelivery = (record, parsed) => {
    if (!parsed.deliveryOrGroup) return deliveryIntentMatches(record, parsed.deliveryIntents);
    const required = parsed.deliveryIntents.filter(intent => !parsed.deliveryOrGroup.includes(intent));
    const alternatives = parsed.deliveryOrGroup
      .map(intent => deliveryIntentMatches(record, [...required, intent]))
      .filter(result => result.outcome === "MATCH" && result.evidenceTier === "VERIFIED");
    if (!alternatives.length) return { outcome: "MISMATCH", evidenceTier: "UNKNOWN", matchedVariantIds: [] };
    return {
      outcome: "MATCH",
      evidenceTier: "VERIFIED",
      matchedVariantIds: [...new Set(alternatives.flatMap(result => result.matchedVariantIds))]
    };
  };

  const isDateActive = option => {
    const now = today.getTime();
    const from = option.validFrom ? parseDate(option.validFrom) : null;
    const through = option.validThrough ? parseDate(option.validThrough) : null;
    if (from && from.getTime() > now) return false;
    if (through && through.getTime() < now) return false;
    return true;
  };

  // WDA-01 (E051): Eine Preisspanne gilt nur dann als belegter Gesamtpreis (certain), wenn beide
  // Grenzen publiziert sind und dieselben Regeln wie beim Einzelpreis nichts Offenes ergeben:
  // Pflichtgebühren bekannt, Abrechnung gesamt oder mit Anzahl, MWST nicht offen, ganzes Angebot.
  // Sonst bleibt das bisherige Ergebnis unverändert (Untergrenze, «möglich»).
  const rangeWithRequiredComponents = option => {
    const raw = { kind: "RANGE", amount: option.minAmount, maxAmount: option.maxAmount, certain: false };
    const min = Number(option.minAmount);
    const max = Number(option.maxAmount);
    if (option.minAmount == null || option.maxAmount == null || !Number.isFinite(min) || !Number.isFinite(max) || min > max) return raw;
    if (option.priceScope !== "FULL_OFFER") return raw;
    let add = 0;
    let factor = 1;
    for (const component of Array.isArray(option.components) ? option.components : []) {
      if (component.includedInBase || component.requirementStatus === "OPTIONAL") continue;
      if (component.requirementStatus === "REQUIRED" && component.amountType === "EXACT"
          && component.amount != null && Number.isFinite(Number(component.amount))) add += Number(component.amount);
      else return raw;
    }
    if (option.billingBasis !== "TOTAL") {
      if (option.billingCount && Number.isFinite(Number(option.billingCount))) factor *= Number(option.billingCount);
      else return raw;
    }
    if (option.taxMode === "EXCLUDED") {
      if (option.taxRate != null && Number.isFinite(Number(option.taxRate))) factor *= 1 + Number(option.taxRate) / 100;
      else return raw;
    }
    return { kind: "RANGE", amount: (min + add) * factor, maxAmount: (max + add) * factor, certain: true };
  };

  const amountWithRequiredComponents = option => {
    if (option.amountType === "FREE") return { kind: "EXACT", amount: 0 };
    if (option.amountType === "FROM") return { kind: "FROM", amount: option.minAmount };
    if (option.amountType === "RANGE") return rangeWithRequiredComponents(option);
    if (option.amountType !== "EXACT" || option.amount == null) return { kind: "UNKNOWN", amount: null };
    let amount = Number(option.amount);
    let uncertain = false;
    for (const component of Array.isArray(option.components) ? option.components : []) {
      if (component.includedInBase || component.requirementStatus === "OPTIONAL") continue;
      if (component.requirementStatus !== "REQUIRED") { uncertain = true; continue; }
      if (component.amountType === "EXACT" && component.amount != null) amount += Number(component.amount);
      else { uncertain = true; }
    }
    if (option.billingBasis !== "TOTAL") {
      if (option.billingCount && Number.isFinite(Number(option.billingCount))) amount *= Number(option.billingCount);
      else uncertain = true;
    }
    if (option.taxMode === "EXCLUDED") {
      if (option.taxRate != null && Number.isFinite(Number(option.taxRate))) amount *= 1 + Number(option.taxRate) / 100;
      else uncertain = true;
    }
    return uncertain ? { kind: "POSSIBLE", amount } : { kind: "EXACT", amount };
  };

  const budgetStatusRank = {
    TARGET_GROUP_FIT: 0,
    DIRECT_FIT: 1,
    CONDITIONAL_FIT: 2,
    POSSIBLE_FIT: 3,
    PRICE_UNKNOWN: 4,
    OVER_BUDGET: 5,
    NO_BUDGET: 6
  };

  const classifyEligibility = option => {
    if (option.eligibilityType === "NONE") return "DIRECT_FIT";
    if (option.eligibilityType === "PROFESSION" && option.eligibilityValue === "JOURNALIST") return "TARGET_GROUP_FIT";
    if (option.eligibilityType === "UNKNOWN") return "POSSIBLE_FIT";
    return "CONDITIONAL_FIT";
  };

  const optionAppliesToDelivery = (option, deliveryResult, hasDeliveryIntent) => {
    if (!hasDeliveryIntent) return true;
    const refs = Array.isArray(option.deliveryVariantRefs) ? option.deliveryVariantRefs : [];
    if (refs.length) return refs.some(ref => deliveryResult.matchedVariantIds.includes(ref));
    return option.priceScope === "FULL_OFFER";
  };

  const resolveBudget = (offer, record, parsed, deliveryResult) => {
    if (!parsed.budget) return { status: "NO_BUDGET", option: null, amount: null };
    if (!record || record.parserStatus !== "AUTO_ACCEPT" || record.priceEligible !== true) return { status: "PRICE_UNKNOWN", option: null, amount: null };
    const options = Array.isArray(record.priceOptions) ? record.priceOptions : [];
    const candidates = [];
    for (const option of options) {
      if (!isDateActive(option)) continue;
      if (!optionAppliesToDelivery(option, deliveryResult, parsed.deliveryIntents.length > 0)) continue;
      if (option.amountType === "NOT_PUBLISHED" || option.amountType === "ON_REQUEST" || option.amountType === "NOT_APPLICABLE") {
        candidates.push({ status: "PRICE_UNKNOWN", option, amount: null });
        continue;
      }
      const currencies1to1 = ["CHF", "EUR", "USD"];
      const comparableCurrency = !option.currency || option.currency === parsed.budget.currency
        || (currencies1to1.includes(option.currency) && currencies1to1.includes(parsed.budget.currency));
      if (!comparableCurrency) {
        candidates.push({ status: "PRICE_UNKNOWN", option, amount: null });
        continue;
      }
      const calc = amountWithRequiredComponents(option);
      if (calc.kind === "UNKNOWN") {
        candidates.push({ status: "PRICE_UNKNOWN", option, amount: null });
        continue;
      }
      // WDA-01 (E051): Obergrenze ≤ Budget = direkter Treffer, nur bei unbedingtem Tarif und belegtem
      // Gesamtpreis; Untergrenze ≤ Budget < Obergrenze = möglich; Untergrenze > Budget = über Budget.
      if (calc.kind === "RANGE" && calc.certain && classifyEligibility(option) === "DIRECT_FIT"
          && calc.maxAmount <= parsed.budget.amount) {
        candidates.push({ status: "DIRECT_FIT", option, amount: calc.maxAmount, range: true });
        continue;
      }
      if (calc.kind === "FROM" || calc.kind === "RANGE" || calc.kind === "POSSIBLE") {
        const min = calc.amount;
        candidates.push({ status: min != null && min > parsed.budget.amount ? "OVER_BUDGET" : "POSSIBLE_FIT", option, amount: min });
        continue;
      }
      const base = classifyEligibility(option);
      candidates.push({ status: calc.amount > parsed.budget.amount ? "OVER_BUDGET" : base, option, amount: calc.amount });
    }
    if (!candidates.length) return { status: "PRICE_UNKNOWN", option: null, amount: null };
    const withinOfferTier = status => {
      if (status === "DIRECT_FIT" || status === "TARGET_GROUP_FIT") return 0;
      if (status === "CONDITIONAL_FIT") return 1;
      if (status === "POSSIBLE_FIT") return 2;
      if (status === "PRICE_UNKNOWN") return 3;
      if (status === "OVER_BUDGET") return 4;
      return 99;
    };
    candidates.sort((a, b) => withinOfferTier(a.status) - withinOfferTier(b.status)
      || (a.amount ?? Number.MAX_SAFE_INTEGER) - (b.amount ?? Number.MAX_SAFE_INTEGER)
      || (a.status === "TARGET_GROUP_FIT" ? -1 : b.status === "TARGET_GROUP_FIT" ? 1 : 0));
    return candidates[0];
  };

  const freeStatusRank = {
    DIRECT_FIT: 0,
    TARGET_GROUP_FIT: 1,
    CONDITIONAL_FIT: 2,
    POSSIBLE_FIT: 3
  };

  const freeOptionHasNoRequiredCosts = option =>
    (Array.isArray(option.components) ? option.components : []).every(component => {
      if (component.includedInBase || component.requirementStatus === "OPTIONAL") return true;
      return component.requirementStatus === "REQUIRED"
        && component.amountType === "EXACT"
        && typeof component.amount === "number"
        && Number.isFinite(component.amount)
        && component.amount === 0;
    });

  const resolveFreeOption = (record, deliveryResult = { matchedVariantIds: [] }, hasDeliveryIntent = false) => {
    if (!record || record.parserStatus !== "AUTO_ACCEPT" || record.priceEligible !== true) return null;
    const candidates = (Array.isArray(record.priceOptions) ? record.priceOptions : [])
      .filter(option => option.amountType === "FREE"
        && isDateActive(option)
        && freeOptionHasNoRequiredCosts(option)
        && optionAppliesToDelivery(option, deliveryResult, hasDeliveryIntent))
      .map(option => ({ option, status: classifyEligibility(option) }))
      .filter(result => result.status !== "POSSIBLE_FIT")
      .sort((a, b) => (freeStatusRank[a.status] ?? 99) - (freeStatusRank[b.status] ?? 99));
    return candidates[0] || null;
  };

  const isSafelyFree = (record, deliveryResult, hasDeliveryIntent) =>
    Boolean(resolveFreeOption(record, deliveryResult, hasDeliveryIntent));

  // WDA-03 (E052, E057): eine «Kostenlos»-Klassierung für Karte, Filter, Preisbänder und Smart-Suche.
  // «Kostenlos» = strukturiert ohne Bedingung (wie Smart-Suche); «Kostenlos mit Bedingung: …» nennt die
  // Bedingung aus dem strukturierten Tarif oder wörtlich aus der Preisangabe; sonst «Preis unbestätigt».
  const freeConditionText = option => {
    if (option?.eligibilityType === "PROFESSION" && option.eligibilityValue === "JOURNALIST") return "für Journalist:innen";
    if (option?.eligibilityType === "MEMBERSHIP") return "für Mitglieder";
    if (option?.eligibilityType === "SUBSCRIPTION") return "für Abonnent:innen";
    return "für Berechtigte";
  };
  const FREE_TEXT_GROUP_RE = /(?:mitglied|abonnent|journalist|student|mitarbeit|teilnehm)/i;
  const freeConditionFromText = raw => {
    const text = String(raw ?? "");
    // Satzende beendet die Bedingung; Abkürzungen wie «bzw.» nicht.
    const part = String.raw`(?:[^.;:|]|(?<=\b(?:bzw|resp|inkl|evtl))\.)`;
    const match = text.match(new RegExp(String.raw`\bfür\s+(${part}{1,90}?)\s+(?:kostenlos|gratis)\b`, "i"))
      || text.match(new RegExp(String.raw`\b(?:kostenlos|gratis)\s+für\s+(${part}{1,90})`, "i"));
    return match && FREE_TEXT_GROUP_RE.test(match[1]) ? `für ${match[1].trim()}` : null;
  };
  const freeStatus = offer => {
    const free = resolveFreeOption(getSmartRecord(offer));
    if (free?.status === "DIRECT_FIT") return { kind: "FREE", label: "Kostenlos" };
    if (free) return { kind: "CONDITIONAL", label: `Kostenlos mit Bedingung: ${freeConditionText(free.option)}` };
    if (offer.priceCategory !== "KOSTENLOS") return null;
    const condition = freeConditionFromText(offer.priceDisplay);
    return condition
      ? { kind: "CONDITIONAL", label: `Kostenlos mit Bedingung: ${condition}` }
      : { kind: "UNCONFIRMED", label: "Preis unbestätigt" };
  };
  const priceFilterCategory = offer => {
    const free = freeStatus(offer);
    if (free?.kind === "FREE") return "KOSTENLOS";
    if (offer.priceCategory !== "KOSTENLOS") return offer.priceCategory;
    return free.kind === "CONDITIONAL" ? "KOSTENLOS_MIT_BEDINGUNG" : "PREIS_UNBESTAETIGT";
  };

  const budgetLabel = result => ({
    TARGET_GROUP_FIT: "Journalist:innen-Tarif im Budget",
    DIRECT_FIT: "im Budget",
    CONDITIONAL_FIT: "bedingter Tarif im Budget",
    POSSIBLE_FIT: "könnte ins Budget passen",
    PRICE_UNKNOWN: "Preis nicht sicher vergleichbar",
    OVER_BUDGET: "über Budget",
    NO_BUDGET: ""
  }[result.status] || result.status);

  const optionLabel = (offer, result) => {
    if (!result.option) return compactPrice(offer);
    const option = result.option;
    if (option.amountType === "FREE") {
      const eligibility = classifyEligibility(option);
      if (eligibility === "DIRECT_FIT") return "Kostenlos";
      return eligibility === "POSSIBLE_FIT" ? "Preis unbestätigt" : `Kostenlos mit Bedingung: ${freeConditionText(option)}`;
    }
    if (!option.currency) return compactPrice(offer);

    const billingUnits = {
      HALF_DAY: "pro Halbtag", MONTH: "pro Monat", MODULE: "pro Modul", SEMESTER: "pro Semester"
    };
    const unit = option.billingBasis !== "TOTAL" && !option.billingCount
      ? billingUnits[option.billingBasis] : null;
    if (option.billingBasis !== "TOTAL" && !option.billingCount && !unit) return compactPrice(offer);
    const money = value => `${option.currency} ${Number(value).toLocaleString("de-CH")}`;
    let label = "";
    if (option.amountType === "RANGE" && option.minAmount != null && option.maxAmount != null) {
      label = `${money(option.minAmount)}–${Number(option.maxAmount).toLocaleString("de-CH")}`;
    } else if (option.amountType === "FROM" && option.minAmount != null) {
      label = `ab ${money(option.minAmount)}`;
    } else if (result.amount != null && Number.isFinite(Number(result.amount))) {
      label = money(unit ? option.amount : result.amount);
    }
    if (!label) return compactPrice(offer);
    if (unit) label += ` ${unit}`;
    return option.tariffLabel ? `${label} · ${option.tariffLabel}` : label;
  };

  const smartEvaluate = (offer, parsed) => {
    if (parsed.language && !splitTokens(offer.language, /\s*[|/]\s*/).includes(parsed.language)) return null;
    const topic = topicMatch(offer, parsed);
    if (!topic.match) return null;
    const record = getSmartRecord(offer);
    const delivery = matchParsedDelivery(record, parsed);
    if (parsed.deliveryIntents.length) {
      if (delivery.outcome !== "MATCH" || delivery.evidenceTier !== "VERIFIED") return null;
    }
    const free = parsed.freeOnly
      ? resolveFreeOption(record, delivery, parsed.deliveryIntents.length > 0)
      : null;
    if (parsed.freeOnly && !free) return null;
    // MS-44: with a free-only request, the card and budget must refer to the
    // same selected free tariff, including its eligibility restrictions.
    const budget = parsed.budget && free
      ? { status: free.status, option: free.option, amount: 0 }
      : resolveBudget(offer, record, parsed, delivery);
    let score = topic.score;
    if (parsed.deliveryIntents.length) score += 6;
    if (offer.startDate) score += 1;
    return { offer, record, delivery, budget, free, score };
  };

  const topicLabel = parsed => parsed.tokenGroups.map(group => group.join(" + ")).join(" oder ");
  const smartWhy = (item, parsed) => {
    const reasons = [];
    if (parsed.tokens.length) {
      const haystack = smartHaystack(item.offer);
      const hit = parsed.tokenGroups.find(group => group.every(token => topicTokenOccurs(haystack, token)));
      reasons.push((hit || parsed.tokens).join(" + "));
    }
    if (parsed.language) reasons.push(`Sprache: ${SMART_LANGUAGE_LABELS[parsed.language]}`);
    if (parsed.deliveryIntents.length) reasons.push("Durchführungsform verifiziert");
    if (parsed.budget) reasons.push(budgetLabel(item.budget));
    if (parsed.freeOnly && item.free) {
      if (item.free.status === "DIRECT_FIT") reasons.push("sicher als kostenlos strukturiert");
      else if (item.free.status === "TARGET_GROUP_FIT") reasons.push("kostenloser Journalist:innen-Tarif publiziert");
      else if (item.free.status === "CONDITIONAL_FIT") reasons.push("kostenlose Option unter Bedingung publiziert");
      else reasons.push("kostenlose Option publiziert; Berechtigung unklar");
    }
    return reasons.length ? reasons.join(" · ") : "passt zu den erkannten Suchbegriffen";
  };

  const freeOptionLabel = result => {
    if (!result) return "";
    if (result.status === "DIRECT_FIT") return "Kostenlos";
    if (result.status === "TARGET_GROUP_FIT" || result.status === "CONDITIONAL_FIT") {
      return `Kostenlos mit Bedingung: ${freeConditionText(result.option)}`;
    }
    return "Preis unbestätigt";
  };

  const smartFreeText = (item, parsed) => {
    if (!parsed.freeOnly || !item.free || item.free.status === "DIRECT_FIT") return "";
    const published = item.offer.priceDisplay || "Bedingung beim Anbieter publiziert";
    if (item.free.status === "TARGET_GROUP_FIT") {
      return `Der kostenlose Tarif gilt für Journalist:innen; persönliche Berechtigung wurde nicht geprüft. Publizierte Preisangabe: ${published}`;
    }
    if (item.free.status === "CONDITIONAL_FIT") {
      return `Die kostenlose Option gilt nur unter einer publizierten Bedingung; persönliche Berechtigung wurde nicht geprüft. Publizierte Preisangabe: ${published}`;
    }
    return `Eine kostenlose Option ist publiziert, die Berechtigung aber nicht sicher bestimmbar. Publizierte Preisangabe: ${published}`;
  };

  const smartBudgetText = (item, parsed) => {
    if (!parsed.budget) return "";
    const status = item.budget.status;
    const actualCurrency = item.budget.option?.currency;
    const currencyNote = actualCurrency && actualCurrency !== parsed.budget.currency
      && ["CHF", "EUR", "USD"].includes(actualCurrency)
      && ["CHF", "EUR", "USD"].includes(parsed.budget.currency)
      ? "Währungen EUR/CHF/USD werden für diese Suche vereinfacht 1:1 verglichen; tatsächliche Wechselkurse und Steuern können abweichen."
      : "";
    const withCurrencyNote = message => currencyNote ? `${message} ${currencyNote}` : message;
    if (["TARGET_GROUP_FIT", "DIRECT_FIT"].includes(status) && item.budget.amount != null) {
      const rest = Math.max(0, parsed.budget.amount - item.budget.amount);
      const prefix = status === "TARGET_GROUP_FIT" ? "Beim publizierten Journalist:innen-Tarif"
        : item.budget.range ? "Bei der Preisobergrenze" : "Bei diesem Preis";
      return withCurrencyNote(`${prefix} bleiben ${parsed.budget.currency} ${rest.toLocaleString("de-CH")}.`);
    }
    if (status === "CONDITIONAL_FIT") return withCurrencyNote("Der passende Preis gilt nur unter einer veröffentlichten Bedingung; persönliche Berechtigung wurde nicht geprüft.");
    if (status === "POSSIBLE_FIT") return withCurrencyNote("Der publizierte Preis könnte ins Budget passen, ist aber nicht sicher als Gesamtpreis nutzbar.");
    if (status === "OVER_BUDGET") return withCurrencyNote("Der sicher vergleichbare Preis liegt über dem angegebenen Budget.");
    return withCurrencyNote("Für dieses Angebot ist keine sichere Budgetaussage möglich.");
  };

  const smartCard = (item, parsed, index) => {
    const offer = item.offer;
    const place = `Ort: ${placeLabel(offer)}`;
    const price = parsed.freeOnly && item.free
      ? freeOptionLabel(item.free)
      : optionLabel(offer, item.budget);
    const budgetText = smartBudgetText(item, parsed);
    const freeText = smartFreeText(item, parsed);
    return `
      <article class="smart-result-card">
        <h3>${escapeHtml(offer.title)}</h3>
        <p class="smart-result-provider">${escapeHtml(offer.provider)}</p>
        <div class="smart-result-meta">
          <span>${escapeHtml(price)}</span>
          <span>${escapeHtml(humanizeTokens(offer.format, labels.format))}</span>
          <span>${escapeHtml(smartDuration(offer))}</span>
          ${place ? `<span>${escapeHtml(place)}</span>` : ""}
        </div>
        <p class="smart-fit"><strong>Passt, weil:</strong> ${escapeHtml(smartWhy(item, parsed))}.</p>
        ${budgetText ? `<p class="smart-budget">${escapeHtml(budgetText)}</p>` : ""}
        ${freeText ? `<p class="smart-budget">${escapeHtml(freeText)}</p>` : ""}
        ${item.budget.status === "PRICE_UNKNOWN" ? `<p class="smart-budget">Originalpreis: ${escapeHtml(offer.priceDisplay ? neutralMissing(offer.priceDisplay, "Preis") : MISSING)}</p>` : ""}
        ${officialOfferLink(offer, "Zum Angebot")}
      </article>`;
  };

  const priceBandCounts = list => {
    const counts = { free: 0, low: 0, mid: 0, high: 0, variable: 0 };
    list.forEach(offer => {
      if (freeStatus(offer)?.kind === "FREE") counts.free += 1;
      else if (offer.priceCategory === "BIS_500") counts.low += 1;
      else if (offer.priceCategory === "501_2000") counts.mid += 1;
      else if (offer.priceCategory === "UEBER_2000") counts.high += 1;
      else counts.variable += 1;
    });
    return counts;
  };

  const renderPriceBands = (list = offers, context = "aktuell sichtbaren Bestands") => {
    if (!el.smartPriceBands) return;
    const c = priceBandCounts(list);
    const bands = [
      [c.free, "Kostenlos"], [c.low, "Bis 500"], [c.mid, "501–2'000"], [c.high, "Über 2'000"], [c.variable, "Tarife / offen"]
    ];
    el.smartPriceBands.innerHTML = bands.map(([count, label]) => `<div class="price-band"><strong>${count.toLocaleString("de-CH")}</strong><span>${escapeHtml(label)}</span></div>`).join("");
    if (el.smartPriceNote) el.smartPriceNote.textContent = `Preiskategorien des ${context}; Budgets in CHF/EUR/USD werden zur Suche vereinfacht 1:1 verglichen. Anbieterpreise bleiben in Originalwährung.`;
  };

  const renderSmart = raw => {
    const parsed = parseSmartQuery(raw);
    if (!parsed.raw) {
      const message = "Bitte eine Anfrage eingeben.";
      el.smartUnderstood.innerHTML = "";
      el.smartSummary.innerHTML = "";
      el.smartResults.innerHTML = "";
      if (el.smartBundle) {
        el.smartBundle.hidden = true;
        el.smartBundle.innerHTML = "";
      }
      el.smartOutput.hidden = true;
      el.smartValidation.textContent = message;
      el.smartValidation.hidden = false;
      el.smartStatus.textContent = message;
      renderPriceBands(offers);
      return;
    }
    el.smartValidation.hidden = true;
    el.smartValidation.textContent = "";
    // MS-47: do not present an unfiltered roster as personalized matches.
    const hasAppliedConstraint = Boolean(parsed.tokens.length || parsed.language || parsed.budget
      || parsed.deliveryIntents.length || parsed.freeOnly);
    if (!hasAppliedConstraint) {
      const notices = [];
      if (parsed.unappliedBudget) notices.push(`Budget: EUR ${parsed.unappliedBudget.amount.toLocaleString("de-CH")} · erkannt, nicht angewendet`);
      if (parsed.unappliedAmountBudget) notices.push(`Budget: ${parsed.unappliedAmountBudget.amount.toLocaleString("de-CH")} · Währung offen, nicht angewendet`);
      if (parsed.maxDays) notices.push(`Zeit: ${parsed.maxDays} ${parsed.maxDays === 1 ? "Tag" : "Tage"} · erkannt, nicht angewendet`);
      el.smartUnderstood.innerHTML = `<span class="smart-understood-label">Verstanden:</span>${notices.length ? notices.map(chip => `<span class="smart-chip">${escapeHtml(chip)}</span>`).join("") : '<span class="smart-chip">Keine Suchbedingung erkannt</span>'}`;
      el.smartSummary.innerHTML = "<p><strong>Keine anwendbare Suchbedingung erkannt.</strong> Bitte Thema oder weitere Suchbedingung angeben.</p>";
      el.smartResults.innerHTML = "";
      if (el.smartBundle) { el.smartBundle.hidden = true; el.smartBundle.innerHTML = ""; }
      renderPriceBands(offers);
      el.smartOutput.hidden = false;
      el.smartStatus.textContent = "Keine anwendbare Suchbedingung erkannt.";
      return;
    }
    const evaluated = offers.map(offer => smartEvaluate(offer, parsed)).filter(Boolean);
    evaluated.sort((a, b) => {
      if (parsed.budget) {
        const rank = (budgetStatusRank[a.budget.status] ?? 99) - (budgetStatusRank[b.budget.status] ?? 99);
        if (rank) return rank;
      }
      if (parsed.freeOnly) {
        const rank = (freeStatusRank[a.free?.status] ?? 99) - (freeStatusRank[b.free?.status] ?? 99);
        if (rank) return rank;
      }
      return b.score - a.score || a.offer.title.localeCompare(b.offer.title, "de-CH");
    });

    const chips = [];
    if (parsed.tokens.length) chips.push(`Thema: ${topicLabel(parsed)}`);
    if (parsed.language) chips.push(`Sprache: ${SMART_LANGUAGE_LABELS[parsed.language]}`);
    if (parsed.budget) chips.push(`Budget: ${parsed.budget.currency} ${parsed.budget.amount.toLocaleString("de-CH")}`);
    if (parsed.unappliedBudget) chips.push(`Budget: EUR ${parsed.unappliedBudget.amount.toLocaleString("de-CH")} · erkannt, nicht angewendet`);
    if (parsed.unappliedAmountBudget) chips.push(`Budget: ${parsed.unappliedAmountBudget.amount.toLocaleString("de-CH")} · Währung offen, nicht angewendet`);
    if (parsed.maxDays) chips.push(`Zeit: ${parsed.maxDays} ${parsed.maxDays === 1 ? "Tag" : "Tage"} · erkannt, nicht angewendet`);
    if (parsed.deliveryOrGroup) chips.push(`Durchführung: ${parsed.deliveryOrGroup.map(intent => DELIVERY_INTENT_LABELS[intent]).join(" oder ")}`);
    parsed.deliveryIntents.filter(intent => !parsed.deliveryOrGroup?.includes(intent))
      .forEach(intent => chips.push(`Durchführung: ${DELIVERY_INTENT_LABELS[intent] || intent.replaceAll("_", " ")}`));
    if (parsed.freeOnly) chips.push("Nur Angebote mit strukturierter Kostenlos-Option");

    el.smartUnderstood.innerHTML = `<span class="smart-understood-label">Verstanden:</span>${chips.length ? chips.map(chip => `<span class="smart-chip">${escapeHtml(chip)}</span>`).join("") : '<span class="smart-chip">Suchbegriffe aus deinem Satz</span>'}`;
    const shown = evaluated.slice(0, 3);
    // MS-49: Einheitliche Einzahl-/Mehrzahlformen für sichtbaren und Screenreader-Status.
    const matchLabel = `${evaluated.length.toLocaleString("de-CH")} ${evaluated.length === 1 ? "passendes Angebot" : "passende Angebote"}`;
    const optionsLabel = shown.length === 1 ? "Hier ist 1 Option." : `Hier sind ${shown.length} Optionen.`;
    const statusMessage = evaluated.length
      ? `${matchLabel} im aktuellen Bestand. ${optionsLabel}`
      : "Keine bestätigten Treffer. Formuliere Thema oder harte Durchführungsbedingung etwas breiter oder nutze die klassischen Filter.";
    el.smartSummary.innerHTML = evaluated.length
      ? `<p><strong>${matchLabel}</strong> im aktuellen Bestand. ${optionsLabel}</p>`
      : `<p><strong>Keine bestätigten Treffer.</strong> Formuliere Thema oder harte Durchführungsbedingung etwas breiter oder nutze die klassischen Filter.</p>`;
    el.smartResults.innerHTML = shown.map((item, index) => smartCard(item, parsed, index)).join("");
    if (el.smartBundle) {
      el.smartBundle.hidden = true;
      el.smartBundle.innerHTML = "";
    }
    const topicPool = parsed.tokens.length ? offers.filter(offer => topicMatch(offer, parsed).match) : offers;
    renderPriceBands(topicPool, parsed.tokens.length ? "Themas" : "aktuell sichtbaren Bestands");
    el.smartOutput.hidden = false;
    el.smartStatus.textContent = statusMessage;
  };


  const filters = () => ({
    queryRaw: el.search.value.trim(),
    query: normalize(el.search.value.trim()),
    focus: el.focus.value,
    type: el.type.value,
    price: el.price.value,
    format: el.format.value,
    language: el.language.value,
    country: el.country.value,
    level: el.level.value
  });

  const matches = (offer, filter) => {
    const haystack = normalize([
      offer.provider,
      offer.title,
      offer.description,
      offer.access,
      offer.priceDisplay,
      offer.format,
      offer.duration,
      offer.start,
      offer.language,
      placeSearchText(offer),
      currentRegion(offer),
      labels.level[offer.level],
      labels.focus[offer.focus],
      labels.offerType[offer.offerType]
    ].join(" "));

    return (!favoritesOnly || favorites.has(offer.id))
      && (!filter.query || filter.query.split(/\s+/).every(term => haystack.includes(term)))
      && (!filter.focus || offer.focus === filter.focus)
      && (!filter.type || offer.offerType === filter.type)
      && (!filter.price || priceFilterCategory(offer) === filter.price)
      && (!filter.format || splitTokens(offer.format).includes(filter.format))
      && (!filter.language || splitTokens(offer.language, /\s*[|/]\s*/).includes(filter.language))
      && (!filter.country || placeFilterValues(offer).includes(filter.country))
      && (!filter.level || offer.level === filter.level);
  };

  const activeFilterCount = filter => [
    filter.query,
    filter.focus,
    filter.type,
    filter.price,
    filter.format,
    filter.language,
    filter.country,
    filter.level,
    el.sort.value !== "APPROVED",
    favoritesOnly
  ].filter(Boolean).length;

  const updateEmptyState = (filteredLength, activeCount) => {
    if (filteredLength !== 0) {
      el.empty.hidden = true;
      return;
    }

    el.empty.hidden = false;
    if (favoritesOnly && [...favorites].filter(id => activeIds.has(id)).length === 0) {
      el.emptyTitle.textContent = "Noch keine Favoriten";
      el.emptyText.textContent = "Markiere interessante Angebote mit dem Herz. Sie bleiben auf diesem Gerät gespeichert.";
    } else if (favoritesOnly) {
      el.emptyTitle.textContent = "Keine passenden Favoriten";
      el.emptyText.textContent = "Setze einzelne Filter zurück oder zeige wieder alle Angebote.";
    } else if (activeCount > 0) {
      el.emptyTitle.textContent = "Keine passenden Angebote";
      el.emptyText.textContent = "Ändere den Suchbegriff oder setze einzelne Filter zurück.";
    } else {
      el.emptyTitle.textContent = "Zurzeit keine Angebote";
      el.emptyText.textContent = "Die Auswahl wird redaktionell aktualisiert.";
    }
  };

  const render = () => {
    const currentFilters = filters();
    const activeCount = activeFilterCount(currentFilters);
    const filtered = offers.filter(offer => matches(offer, currentFilters));
    const sorted = sortOffers(filtered);
    const activeFavoriteCount = [...favorites].filter(id => activeIds.has(id)).length;

    el.cards.innerHTML = sorted.map(card).join("");
    el.count.textContent = `${filtered.length} von ${offers.length} aktuellen Angeboten${favoritesOnly ? " · Favoriten" : ""}`;
    el.filterStatus.textContent = activeCount === 0
      ? "Keine Filter aktiv"
      : `${activeCount} Filter aktiv`;
    el.reset.disabled = activeCount === 0;
    el.favoritesCount.textContent = String(activeFavoriteCount);
    el.favoritesToggle.setAttribute("aria-pressed", String(favoritesOnly));
    el.favoritesToggle.classList.toggle("is-active", favoritesOnly);
    updateEmptyState(filtered.length, activeCount);
    syncUrl(currentFilters);
  };

  const reset = () => {
    [el.search, el.focus, el.type, el.price, el.format, el.language, el.country, el.level]
      .forEach(node => { node.value = ""; });
    el.sort.value = "APPROVED";
    favoritesOnly = false;
    render();
    el.search.focus();
  };

  const toggleFavorite = id => {
    if (!allKnownIds.has(id)) return;
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    saveFavorites();
    render();

    const newButton = [...el.cards.querySelectorAll("[data-favorite-id]")]
      .find(button => button.dataset.favoriteId === id);
    if (newButton) newButton.focus();
    else el.favoritesToggle.focus();
  };

  addOptions(el.focus, orderedValues("focus", preferredOrder.focus), value => labels.focus[value] ?? value);
  addOptions(el.type, orderedValues("offerType", preferredOrder.offerType), value => labels.offerType[value] ?? value);
  addOptions(el.price, (values => [
    ...preferredOrder.priceCategory.filter(value => values.has(value)),
    ...[...values].filter(value => !preferredOrder.priceCategory.includes(value)).sort((a, b) => a.localeCompare(b, "de-CH"))
  ])(new Set(offers.map(priceFilterCategory).filter(Boolean))), value => labels.priceCategory[value] ?? value);
  addOptions(el.format, tokenValues("format", preferredOrder.format), value => labels.format[value] ?? value);
  addOptions(el.language, tokenValues("language", ["DE", "FR", "IT", "EN", "NOT_PUBLISHED"], /\s*[|/]\s*/), value => labels.language[value] ?? value);
  addOptions(el.country, countryValues(preferredOrder.country));
  addOptions(el.level, orderedValues("level", preferredOrder.level), value => labels.level[value] ?? value);

  [el.search, el.focus, el.type, el.price, el.format, el.language, el.country, el.level]
    .forEach(node => node.addEventListener("input", render));
  el.sort.addEventListener("change", render);

  el.reset.addEventListener("click", reset);
  el.favoritesToggle.addEventListener("click", () => {
    favoritesOnly = !favoritesOnly;
    render();
  });
  el.cards.addEventListener("click", event => {
    const button = event.target.closest("[data-favorite-id]");
    if (button) toggleFavorite(button.dataset.favoriteId);
  });

  if (el.smartForm && el.smartInput) {
    el.smartForm.addEventListener("submit", event => {
      event.preventDefault();
      renderSmart(el.smartInput.value);
    });
    document.querySelectorAll("[data-smart-example]").forEach(button => {
      button.addEventListener("click", () => {
        el.smartInput.value = button.dataset.smartExample || "";
        renderSmart(el.smartInput.value);
      });
    });
    if (el.smartBudgetButton) el.smartBudgetButton.addEventListener("click", () => {
      el.smartInput.focus();
      el.smartInput.select();
    });
    if (el.smartFreeButton) el.smartFreeButton.addEventListener("click", () => {
      const current = el.smartInput.value.trim();
      el.smartInput.value = SMART_FREE_INTENT_RE.test(normalize(current))
        ? current
        : `${current} Nur kostenlos.`.trim();
      renderSmart(el.smartInput.value);
    });
    renderPriceBands(offers);
  }

  applyUrlState();
  render();
})();
