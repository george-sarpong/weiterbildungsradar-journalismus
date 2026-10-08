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
      NICHT_PUBLIZIERT: "Nicht publiziert"
    },
    priceCategory: {
      KOSTENLOS: "Kostenlos",
      BIS_500: "Bis 500",
      "501_2000": "501 bis 2'000",
      UEBER_2000: "Über 2'000",
      MEHRERE_TARIFE: "Mehrere Tarife",
      PREIS_AUF_ANFRAGE: "Preis auf Anfrage",
      PREIS_NICHT_PUBLIZIERT: "Preis nicht publiziert",
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
      "NICHT_PUBLIZIERT": "Nicht publiziert"
    },
    language: {
      DE: "Deutsch",
      EN: "Englisch",
      FR: "Französisch",
      IT: "Italienisch",
      NOT_PUBLISHED: "Nicht publiziert"
    }
  };

  const preferredOrder = {
    focus: ["JOURNALISMUS", "MEDIENPRAXIS", "MEDIENRECHT", "SICHERHEIT", "MODERATION", "MANAGEMENT"],
    offerType: ["KURS", "PROGRAMM", "EVENT", "FELLOWSHIP", "STUDIUM"],
    priceCategory: ["KOSTENLOS", "BIS_500", "501_2000", "UEBER_2000", "MEHRERE_TARIFE", "PREIS_AUF_ANFRAGE", "PREIS_NICHT_PUBLIZIERT", "NOT_APPLICABLE"],
    format: ["PRÄSENZ", "HYBRID", "ONLINE LIVE", "ONLINE", "ONLINE SELBSTLERNEN", "ON_DEMAND", "ON_REQUEST_FORMAT", "NICHT_PUBLIZIERT"],
    country: ["Schweiz", "Österreich", "Liechtenstein", "Deutschland", "Frankreich", "Grossbritannien", "USA", "International"],
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

  const isCurrent = offer => {
    const end = parseDate(offer.endDate);
    return !end || end >= today;
  };

  const offers = allOffers.filter(isCurrent);
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

  const humanizeTokens = (value, labelMap, pattern = /\s*\|\s*/) =>
    splitTokens(value, pattern).map(token => labelMap[token] ?? token).join(" · ");

  const countryDisplay = value => value === "CH_ACCESS / operational presence Chiasso"
    ? "Schweiz"
    : String(value ?? "");

  const countryValues = order => {
    const values = new Set(offers.map(offer => countryDisplay(offer.country)).filter(Boolean));
    return [
      ...order.filter(value => values.has(value)),
      ...[...values].filter(value => !order.includes(value)).sort((a, b) => a.localeCompare(b, "de-CH"))
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

  const compactAmount = value => String(value ?? "")
    .replace(/’/g, "'")
    .replace(/\.00\b/g, "");

  const compactPrice = offer => {
    const raw = String(offer.priceDisplay ?? "").trim();
    const normalized = normalize(raw);

    if (!raw || offer.priceCategory === "PREIS_NICHT_PUBLIZIERT"
        || normalized.includes("nicht_publiziert")
        || normalized.includes("nicht publiziert")) return "Nicht publiziert";
    if (offer.priceCategory === "NOT_APPLICABLE") return "Nicht anwendbar";
    if (offer.priceCategory === "KOSTENLOS" || /\b(kostenlos|gratis|free)\b/i.test(raw)) return "Kostenlos";
    if (offer.priceCategory === "PREIS_AUF_ANFRAGE" || /preis\s+auf\s+anfrage/i.test(raw)) return "Auf Anfrage";

    // Für die Zielgruppe ist ein explizit publizierter Journalist:innen-Tarif der relevanteste Kartenpreis.
    const journalist = raw.match(/((?:CHF|EUR|USD|GBP)\s*[0-9][0-9'’.,]*)(?=[^()]{0,45}(?:Kurspreis\s+)?Journalist)/i);
    if (journalist) return compactAmount(journalist[1]);

    // Explizite Preisbereiche wie EUR 480–512 oder CHF 0–590 erhalten.
    const range = raw.match(/\b(CHF|EUR|USD|GBP)\s*([0-9][0-9'’.,]*)\s*[–-]\s*([0-9][0-9'’.,]*)/i);
    if (range) return `${range[1].toUpperCase()} ${compactAmount(range[2])}–${compactAmount(range[3])}`;

    const moneyRegex = /\b(CHF|EUR|USD|GBP)\s*([0-9][0-9'’.,]*)/gi;
    const matches = [...raw.matchAll(moneyRegex)].filter(match => {
      const tail = raw.slice(match.index + match[0].length, match.index + match[0].length + 28);
      return !/\boptional\b/i.test(tail);
    });

    if (matches.length) {
      const first = `${matches[0][1].toUpperCase()} ${compactAmount(matches[0][2])}`;
      if (/^\s*ab\b/i.test(raw)) return `ab ${first}`;

      // Bei mehreren publizierten Tarifen bleibt die Karte knapp: niedrigster belastbarer Tarif.
      if (matches.length > 1) {
        const sameCurrency = matches.every(m => m[1].toUpperCase() === matches[0][1].toUpperCase());
        if (sameCurrency) {
          const values = matches.map(m => ({
            display: compactAmount(m[2]),
            numeric: Number(String(m[2]).replace(/[’']/g, "").replace(",", "."))
          })).filter(x => Number.isFinite(x.numeric));
          if (values.length) {
            const min = values.reduce((a, b) => b.numeric < a.numeric ? b : a);
            return `ab ${matches[0][1].toUpperCase()} ${min.display}`;
          }
        }
      }
      return first;
    }

    return labels.priceCategory[offer.priceCategory] ?? "Preis siehe Anbieter";
  };

  const compactAccess = offer => {
    const raw = String(offer.access ?? "").trim();
    if (!raw) return "Nicht publiziert";

    const upper = raw.toUpperCase();
    const normalized = normalize(raw);

    if (upper.startsWith("MEMBERSHIP_RESTRICTED")) return "Mitgliedschaft erforderlich";
    if (upper.startsWith("STUDENT_RESTRICTED_ACCESS")) return "Eingeschränkter Zugang";
    if (upper.startsWith("V95_EXPLICIT_APPLICATION_PREREQUISITE")) return "Bewerbung / Zulassung erforderlich";
    if (upper.startsWith("V95_EXPLICIT_PUBLIC_ACCESS")) return "Öffentlich zugänglich";

    if (normalized.includes("zugangsvoraussetzungen nicht publiziert")
        || normalized.includes("nicht publiziert")
        || normalized.includes("not published")) return "Nicht publiziert";

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
      : raw;
  };


  const sortOffers = list => {
    const sorted = [...list];
    switch (el.sort.value) {
      case "START":
        return sorted.sort((a, b) => {
          const aDate = a.startDate || "9999-12-31";
          const bDate = b.startDate || "9999-12-31";
          return aDate.localeCompare(bDate)
            || a.provider.localeCompare(b.provider, "de-CH")
            || a.title.localeCompare(b.title, "de-CH");
        });
      case "APPROVED":
        return sorted.sort((a, b) => b.approved.localeCompare(a.approved)
          || a.provider.localeCompare(b.provider, "de-CH")
          || a.title.localeCompare(b.title, "de-CH"));
      case "PROVIDER":
        return sorted.sort((a, b) => a.provider.localeCompare(b.provider, "de-CH")
          || a.title.localeCompare(b.title, "de-CH"));
      default:
        return sorted;
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
    if (filter.queryRaw) params.set("q", filter.queryRaw);
    if (filter.focus) params.set("focus", filter.focus);
    if (filter.type) params.set("type", filter.type);
    if (filter.price) params.set("price", filter.price);
    if (filter.format) params.set("format", filter.format);
    if (filter.language) params.set("language", filter.language);
    if (filter.country) params.set("country", filter.country);
    if (filter.level) params.set("level", filter.level);
    if (el.sort.value !== "EDITORIAL") params.set("sort", el.sort.value);

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

  const card = offer => {
    const isFavorite = favorites.has(offer.id);
    const favoriteLabel = isFavorite
      ? `${offer.title} aus den Favoriten entfernen`
      : `${offer.title} zu den Favoriten hinzufügen`;
    const displayCountry = countryDisplay(offer.country);
    const displayRegion = regionDisplay(offer.region);
    const place = displayRegion ? `${displayCountry} · ${displayRegion}` : displayCountry;
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
              title="${escapeHtml(favoriteLabel)}">
              ${heartSvg}
            </button>
          </div>
        </div>
        <h3>${escapeHtml(offer.title)}</h3>
        <dl class="facts" aria-label="Preis, Durchführungsform, Dauer und Start">
          ${fact("Preis", compactPrice(offer))}
          ${fact("Durchführung", humanizeTokens(offer.format, labels.format))}
          ${fact("Dauer", offer.duration)}
          ${fact("Start", offer.start)}
        </dl>
        <p class="card-description">${escapeHtml(offer.description)}</p>
        <p class="access"><strong>Zugang:</strong> ${escapeHtml(compactAccess(offer))}</p>
        <div class="badges" aria-label="Angebotsart und weitere Eigenschaften">
          <span class="badge badge-type">${escapeHtml(labels.offerType[offer.offerType] ?? offer.offerType)}</span>
          <span class="badge">${escapeHtml(labels.level[offer.level] ?? offer.level)}</span>
          <span class="badge">${escapeHtml(humanizeTokens(offer.language, labels.language, /\s*[|/]\s*/))}</span>
          <span class="badge">${escapeHtml(place)}</span>
        </div>
        <div class="card-footer">
          <div class="card-links">
            <a class="source-link" href="${escapeHtml(offer.url)}" target="_blank" rel="noopener noreferrer" aria-label="Offizielle Angebotsseite zu ${escapeHtml(offer.title)} öffnen">
              Offizielle Angebotsseite <span aria-hidden="true">↗</span>
            </a>
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
    "im", "in", "am", "an", "auf", "fur", "fuer", "zu", "zum", "zur", "von", "mit", "ohne",
    "und", "oder", "der", "die", "das", "den", "dem", "einen", "eine", "ein", "einem", "einer",
    "bereich", "lernen", "weiterbilden", "weiterbildung", "kurs", "kurse", "angebot", "angebote",
    "suche", "brauche", "bitte", "etwas", "maximal", "hochstens", "hoechstens", "unter", "bis",
    "budget", "franken", "chf", "zeit", "tage", "tag", "tagen", "stunden", "stunde", "std",
    "online", "remote", "hybrid", "prasenz", "praesenz", "ort", "live", "demand", "selbststudium",
    "selbstlernen", "self", "paced", "webinar", "hyflex", "asynchron", "asynchronous", "rein",
    "vollstandig", "vollstaendig", "nur", "kein", "keine", "lieber",
    "gratis", "kostenlos", "kostenfrei"
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
    const text = String(raw ?? "");
    const patterns = [
      /\bCHF\s*([0-9][0-9'’.,]*)/i,
      /\b([0-9][0-9'’.,]*)\s*CHF\b/i,
      /\b(?:Fr\.?|Franken)\s*([0-9][0-9'’.,]*)/i,
      /\b([0-9][0-9'’.,]*)\s*(?:Fr\.?|Franken)\b/i
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (!match) continue;
      const amount = smartNumber(match[1]);
      if (amount != null) return { amount, currency: "CHF" };
    }
    return null;
  };

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
    const broadInPerson = !strictInPerson && /\bprae?senz\b|\bvor\s+ort\b/.test(positiveChannelInput);
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

  const parseSmartQuery = raw => {
    const input = normalize(raw);
    const budget = parseSmartBudget(raw);
    const dayMatch = input.match(/\b(?:zwei|2)\s*(?:tag|tage|tagen)\b/);
    const numericDayMatch = input.match(/\b(\d{1,2})\s*(?:tag|tage|tagen)\b/);
    const deliveryIntents = parseDeliveryIntent(input);
    const freeOnly = SMART_FREE_INTENT_RE.test(input);
    let tokenSource = input
      .replace(/\bchf\s*[0-9][0-9'’.,]*\b/g, " ")
      .replace(/\b[0-9][0-9'’.,]*\s*chf\b/g, " ")
      .replace(/\b(?:fr\.?|franken)\s*[0-9][0-9'’.,]*\b/g, " ")
      .replace(/\b[0-9][0-9'’.,]*\s*(?:fr\.?|franken)\b/g, " ")
      .replace(/\b(?:zwei|\d{1,2})\s*(?:tag|tage|tagen)\b/g, " ")
      .replace(/\b(?:rein|vollstandig|vollstaendig|100\s*%)\s+online\b/g, " ")
      .replace(/\bohne\s+prae?senz\b|\bkein(?:e|en)?\s+prae?senz(?:kurs)?\b/g, " ")
      .replace(/\bnur\s+prae?senz\b|\b100\s*%\s+(?:vor\s+ort|prae?senz)\b|\b(?:ohne|kein(?:e|en)?)\s+online(?:[- ]?anteil)?\b/g, " ")
      .replace(/\blive\s+online\b|\bonline\s+live\b|\bon[- ]?demand\b|\bself[- ]?paced\b|\bself[- ]?study\b|\bim\s+eigenen\s+tempo\b/g, " ");
    const tokens = tokenSource.split(/[^a-z0-9äöüß]+/i)
      .map(token => token.trim())
      .filter(token => token.length >= 2
        && !SMART_STOPWORDS.has(token)
        && !SMART_FREE_TOKEN_RE.test(token)
        && !/^\d+$/.test(token));
    return {
      raw: String(raw ?? "").trim(),
      budget,
      maxDays: dayMatch ? 2 : numericDayMatch ? Number(numericDayMatch[1]) : null,
      deliveryIntents,
      freeOnly,
      tokens: [...new Set(tokens)]
    };
  };

  const smartHaystack = offer => normalize([
    offer.title, offer.description, offer.provider, offer.focus, offer.format, offer.duration, offer.start,
    offer.region, offer.country, labels.focus[offer.focus], labels.level[offer.level], labels.offerType[offer.offerType]
  ].join(" "));

  const topicMatch = (offer, parsed) => {
    if (!parsed.tokens.length) return { match: true, score: 0 };
    const title = normalize(offer.title);
    const haystack = smartHaystack(offer);
    const allMatch = parsed.tokens.every(token => haystack.includes(token));
    if (!allMatch) return { match: false, score: 0 };
    const score = parsed.tokens.reduce((sum, token) => sum + (title.includes(token) ? 8 : 2), 0);
    return { match: true, score };
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

  const isDateActive = option => {
    const now = today.getTime();
    const from = option.validFrom ? parseDate(option.validFrom) : null;
    const through = option.validThrough ? parseDate(option.validThrough) : null;
    if (from && from.getTime() > now) return false;
    if (through && through.getTime() < now) return false;
    return true;
  };

  const amountWithRequiredComponents = option => {
    if (option.amountType === "FREE") return { kind: "EXACT", amount: 0 };
    if (option.amountType === "FROM") return { kind: "FROM", amount: option.minAmount };
    if (option.amountType === "RANGE") return { kind: "RANGE", amount: option.minAmount, maxAmount: option.maxAmount };
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
      if (option.currency && option.currency !== parsed.budget.currency) {
        candidates.push({ status: "PRICE_UNKNOWN", option, amount: null });
        continue;
      }
      const calc = amountWithRequiredComponents(option);
      if (calc.kind === "UNKNOWN") {
        candidates.push({ status: "PRICE_UNKNOWN", option, amount: null });
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
    const amount = result.amount;
    if (option.amountType === "FREE") return option.tariffLabel
      ? `Kostenlos · ${option.tariffLabel}`
      : "Kostenlos";
    if (amount != null && option.currency) {
      const label = `${option.currency} ${amount.toLocaleString("de-CH")}`;
      return option.tariffLabel ? `${label} · ${option.tariffLabel}` : label;
    }
    return compactPrice(offer);
  };

  const smartEvaluate = (offer, parsed) => {
    const topic = topicMatch(offer, parsed);
    if (!topic.match) return null;
    const record = getSmartRecord(offer);
    const delivery = deliveryIntentMatches(record, parsed.deliveryIntents);
    if (parsed.deliveryIntents.length) {
      if (delivery.outcome !== "MATCH" || delivery.evidenceTier !== "VERIFIED") return null;
    }
    const free = parsed.freeOnly
      ? resolveFreeOption(record, delivery, parsed.deliveryIntents.length > 0)
      : null;
    if (parsed.freeOnly && !free) return null;
    const budget = resolveBudget(offer, record, parsed, delivery);
    let score = topic.score;
    if (parsed.deliveryIntents.length) score += 6;
    if (offer.startDate) score += 1;
    return { offer, record, delivery, budget, free, score };
  };

  const smartWhy = (item, parsed) => {
    const reasons = [];
    if (parsed.tokens.length) reasons.push(parsed.tokens.join(" + "));
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
    const tariff = result.option?.tariffLabel;
    if (result.status === "DIRECT_FIT") return "Kostenlos";
    if (result.status === "TARGET_GROUP_FIT") return `Kostenlos · ${tariff || "Journalist:innen-Tarif"}`;
    if (result.status === "CONDITIONAL_FIT") return `Kostenlos unter Bedingung${tariff ? ` · ${tariff}` : ""}`;
    return "Kostenlos-Option · Berechtigung unklar";
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
    if (["TARGET_GROUP_FIT", "DIRECT_FIT"].includes(status) && item.budget.amount != null) {
      const rest = Math.max(0, parsed.budget.amount - item.budget.amount);
      const prefix = status === "TARGET_GROUP_FIT" ? "Beim publizierten Journalist:innen-Tarif" : "Bei diesem Preis";
      return `${prefix} bleiben CHF ${rest.toLocaleString("de-CH")}.`;
    }
    if (status === "CONDITIONAL_FIT") return "Der passende Preis gilt nur unter einer veröffentlichten Bedingung; persönliche Berechtigung wurde nicht geprüft.";
    if (status === "POSSIBLE_FIT") return "Der publizierte Preis könnte ins Budget passen, ist aber nicht sicher als Gesamtpreis nutzbar.";
    if (status === "OVER_BUDGET") return "Der sicher vergleichbare Preis liegt über dem angegebenen Budget.";
    return "Für dieses Angebot ist keine sichere Budgetaussage möglich.";
  };

  const smartCard = (item, parsed, index) => {
    const offer = item.offer;
    const place = [countryDisplay(offer.country), regionDisplay(offer.region)].filter(Boolean).join(" · ");
    const price = parsed.freeOnly && item.free
      ? freeOptionLabel(item.free)
      : optionLabel(offer, item.budget);
    const budgetText = smartBudgetText(item, parsed);
    const freeText = smartFreeText(item, parsed);
    return `
      <article class="smart-result-card">
        <p class="smart-result-rank">Option ${index + 1}</p>
        <h3>${escapeHtml(offer.title)}</h3>
        <p class="smart-result-provider">${escapeHtml(offer.provider)}</p>
        <div class="smart-result-meta">
          <span>${escapeHtml(price)}</span>
          <span>${escapeHtml(humanizeTokens(offer.format, labels.format))}</span>
          <span>${escapeHtml(offer.duration || "Dauer nicht publiziert")}</span>
          ${place ? `<span>${escapeHtml(place)}</span>` : ""}
        </div>
        <p class="smart-fit"><strong>Passt, weil:</strong> ${escapeHtml(smartWhy(item, parsed))}.</p>
        ${budgetText ? `<p class="smart-budget">${escapeHtml(budgetText)}</p>` : ""}
        ${freeText ? `<p class="smart-budget">${escapeHtml(freeText)}</p>` : ""}
        ${item.budget.status === "PRICE_UNKNOWN" ? `<p class="smart-budget">Originalpreis: ${escapeHtml(offer.priceDisplay || "Preis nicht publiziert")}</p>` : ""}
        <a class="source-link" href="${escapeHtml(offer.url)}" target="_blank" rel="noopener noreferrer">Zum Angebot <span aria-hidden="true">↗</span></a>
      </article>`;
  };

  const priceBandCounts = list => {
    const counts = { free: 0, low: 0, mid: 0, high: 0, variable: 0 };
    list.forEach(offer => {
      if (offer.priceCategory === "KOSTENLOS") counts.free += 1;
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
    if (el.smartPriceNote) el.smartPriceNote.textContent = `Preiskategorien des ${context}; Währungen werden nicht umgerechnet.`;
  };

  const renderSmart = raw => {
    const parsed = parseSmartQuery(raw);
    if (!parsed.raw) return;
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
    if (parsed.tokens.length) chips.push(`Thema: ${parsed.tokens.join(" + ")}`);
    if (parsed.budget) chips.push(`Budget: CHF ${parsed.budget.amount.toLocaleString("de-CH")}`);
    if (parsed.maxDays) chips.push(`Zeit: ${parsed.maxDays} ${parsed.maxDays === 1 ? "Tag" : "Tage"} · erkannt, nicht angewendet`);
    parsed.deliveryIntents.forEach(intent => chips.push(`Durchführung: ${DELIVERY_INTENT_LABELS[intent] || intent.replaceAll("_", " ")}`));
    if (parsed.freeOnly) chips.push("Nur Angebote mit strukturierter Kostenlos-Option");

    el.smartUnderstood.innerHTML = `<span class="smart-understood-label">Verstanden:</span>${chips.length ? chips.map(chip => `<span class="smart-chip">${escapeHtml(chip)}</span>`).join("") : '<span class="smart-chip">Suchbegriffe aus deinem Satz</span>'}`;
    const shown = evaluated.slice(0, 3);
    el.smartSummary.innerHTML = evaluated.length
      ? `<p><strong>${evaluated.length.toLocaleString("de-CH")} passende Angebote</strong> im aktuellen Bestand. Hier sind ${shown.length} Optionen.</p>`
      : `<p><strong>Keine bestätigten Treffer.</strong> Formuliere Thema oder harte Durchführungsbedingung etwas breiter oder nutze die klassischen Filter.</p>`;
    el.smartResults.innerHTML = shown.map((item, index) => smartCard(item, parsed, index)).join("");
    if (el.smartBundle) {
      el.smartBundle.hidden = true;
      el.smartBundle.innerHTML = "";
    }
    const topicPool = parsed.tokens.length ? offers.filter(offer => topicMatch(offer, parsed).match) : offers;
    renderPriceBands(topicPool, parsed.tokens.length ? "Themas" : "aktuell sichtbaren Bestands");
    el.smartOutput.hidden = false;
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
      offer.country,
      offer.region,
      labels.level[offer.level],
      labels.focus[offer.focus],
      labels.offerType[offer.offerType]
    ].join(" "));

    return (!favoritesOnly || favorites.has(offer.id))
      && (!filter.query || haystack.includes(filter.query))
      && (!filter.focus || offer.focus === filter.focus)
      && (!filter.type || offer.offerType === filter.type)
      && (!filter.price || offer.priceCategory === filter.price)
      && (!filter.format || splitTokens(offer.format).includes(filter.format))
      && (!filter.language || splitTokens(offer.language, /\s*[|/]\s*/).includes(filter.language))
      && (!filter.country || countryDisplay(offer.country) === filter.country)
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
    filter.level
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
    el.sort.value = "EDITORIAL";
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
  addOptions(el.price, orderedValues("priceCategory", preferredOrder.priceCategory), value => labels.priceCategory[value] ?? value);
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
