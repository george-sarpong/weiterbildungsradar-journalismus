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
    smartChangeButton: document.querySelector("#smartChangeButton")
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
  let smartRaw = "";
  const smartManaged = { format: null, level: null, price: null };

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

  const card = (offer, searchEvaluation = null) => {
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
        ${searchEvaluation ? searchExplanation(searchEvaluation) : ""}
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


  // Search V1.2: deterministischer, clientseitiger Parser gegen den Search-Sidecar.
  // Der Originalsatz bleibt flüchtig im Browser und wird nicht in URL/localStorage geschrieben.
  const searchIndex = window.SFJ_SEARCH_INDEX || { rows: [], taxonomy: [] };

  const searchCriterionLabel = criterion => {
    if (criterion.kind === "topic") return `${criterion.negative ? "ohne Thema" : "Thema"}: ${criterion.label ?? criterion.code}`;
    if (criterion.kind === "budget") return `Budget: ${criterion.currency ?? "Währung offen"} ${Number(criterion.max).toLocaleString("de-CH")}`;
    if (criterion.kind === "freeOnly") return "nur kostenlos";
    if (criterion.kind === "durationMax") return `Dauer: bis ${criterion.max} ${criterion.unit === "DAYS" ? "Tage" : criterion.unit === "HOURS" ? "Stunden" : criterion.unit}`;
    if (criterion.kind === "format") return `${criterion.negative ? "ohne" : "Format"}: ${criterion.value}${criterion.strength === "soft" ? " (Wunsch)" : ""}`;
    if (criterion.kind === "level") return `${criterion.negative ? "ohne Niveau" : "Niveau"}: ${criterion.value}`;
    if (criterion.kind === "fallbackText") return `Suchbegriff: ${(criterion.terms ?? []).join(" ")}`;
    return criterion.kind;
  };

  const searchExplanation = evaluation => {
    const rows = [
      ...evaluation.checks.filter(item => ["MATCH", "UNCERTAIN"].includes(item.result.state)),
      ...evaluation.soft.filter(item => ["MATCH", "UNCERTAIN"].includes(item.result.state))
    ];
    if (!rows.length) return "";
    return `<div class="search-explanation" aria-label="Begründung der Suchzuordnung">
      <strong>${evaluation.state === "UNCERTAIN" ? "Nicht eindeutig prüfbar" : "Das trifft zu"}</strong>
      <ul>${rows.map(item => `<li><span class="search-state">${escapeHtml(item.result.state === "UNCERTAIN" ? "Nicht eindeutig prüfbar" : "Das trifft zu")}:</span> ${escapeHtml(item.result.reason ?? searchCriterionLabel(item.criterion))}</li>`).join("")}</ul>
    </div>`;
  };

  const renderSmartSummary = (parsed, summaryText) => {
    if (!el.smartOutput || !el.smartUnderstood || !el.smartSummary) return;
    el.smartOutput.hidden = false;
    const chips = parsed.criteria.length
      ? parsed.criteria.map(item => `<span class="smart-chip">${escapeHtml(searchCriterionLabel(item))}</span>`).join("")
      : '<span class="smart-chip">Keine belastbaren Kriterien erkannt</span>';
    el.smartUnderstood.innerHTML = `<span class="smart-understood-label">Erkannt:</span>${chips}`;
    const notes = parsed.notes.map(note => {
      if (note === "VAGUE_PRICE_SORT_ASC") return "Preiswunsch ohne Schwellenwert: passende Ergebnisse werden preislich sortiert.";
      if (note === "TRAVEL_NOT_INCLUDED") return "Reise- und Verpflegungskosten werden nicht berechnet.";
      if (note === "ADVISORY_NOT_SUPPORTED") return "Voraussetzungen und Lernpfade werden nicht automatisch beraten.";
      return note;
    });
    el.smartSummary.innerHTML = `<p>${escapeHtml(summaryText)}</p>${notes.length ? `<p class="muted">${notes.map(escapeHtml).join(" · ")}</p>` : ""}`;
  };

  const clearSmartManagedCriteria = () => {
    [["format", el.format], ["level", el.level], ["price", el.price]].forEach(([key, node]) => {
      if (smartManaged[key] && node.value === smartManaged[key]) node.value = "";
      smartManaged[key] = null;
    });
  };

  const applyRepresentableSmartCriteria = parsed => {
    clearSmartManagedCriteria();
    const hardPositiveFormat = parsed.criteria.find(c => c.kind === "format" && c.strength === "hard" && !c.negative);
    const hardPositiveLevel = parsed.criteria.find(c => c.kind === "level" && c.strength === "hard" && !c.negative);
    const freeOnly = parsed.criteria.some(c => c.kind === "freeOnly");
    if (hardPositiveFormat?.value === "PRAESENZ" && hasOption(el.format, "PRÄSENZ")) {
      el.format.value = "PRÄSENZ";
      smartManaged.format = "PRÄSENZ";
    }
    if (hardPositiveLevel?.value === "EINSTIEG" && hasOption(el.level, "EINSTIEG")) {
      el.level.value = "EINSTIEG";
      smartManaged.level = "EINSTIEG";
    }
    if (freeOnly && hasOption(el.price, "KOSTENLOS")) {
      el.price.value = "KOSTENLOS";
      smartManaged.price = "KOSTENLOS";
    }
  };

  const smartSorted = items => {
    if (el.sort.value === "EDITORIAL") return items;
    const sortedOffers = sortOffers(items.map(item => item.offer));
    const rank = new Map(sortedOffers.map((offer, index) => [offer.id, index]));
    return [...items].sort((a, b) => (rank.get(a.offer.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.offer.id) ?? Number.MAX_SAFE_INTEGER));
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
    const classicFiltered = offers.filter(offer => matches(offer, currentFilters));
    const classicIds = new Set(classicFiltered.map(offer => offer.id));
    const activeFavoriteCount = [...favorites].filter(id => activeIds.has(id)).length;

    if (smartRaw) {
      const smart = window.SFJSearchV1.search(allOffers, searchIndex, smartRaw);
      if (smart.error === "SIDECAR_REFRESH_REQUIRED") {
        el.cards.innerHTML = "";
        el.count.textContent = "Suche gestoppt: Suchindex und Angebotsbestand sind nicht vollständig synchron.";
        renderSmartSummary(smart.parsed, "Technischer Abdeckungsfehler. Es werden keine Teilresultate ausgegeben.");
        updateEmptyState(0, activeCount + 1);
      } else if (smart.error === "NOTHING_RECOGNIZED") {
        smartRaw = "";
        el.cards.innerHTML = sortOffers(classicFiltered).map(offer => card(offer)).join("");
        el.count.textContent = `${classicFiltered.length} von ${offers.length} aktuellen Angeboten${favoritesOnly ? " · Favoriten" : ""}`;
        renderSmartSummary(smart.parsed, "Keine belastbaren Kriterien erkannt. Nutze konkretere Begriffe oder die klassischen Filter.");
        updateEmptyState(classicFiltered.length, activeCount);
      } else {
        const matchesSmart = smartSorted(smart.matches.filter(item => classicIds.has(item.offer.id)));
        const uncertainSmart = smartSorted(smart.uncertain.filter(item => classicIds.has(item.offer.id)));
        const excludedBySmart = smart.excluded.filter(item => classicIds.has(item.offer.id)).length;
        el.cards.innerHTML = `
          <section class="search-result-group" aria-labelledby="search-match-title">
            <h3 id="search-match-title">Das trifft zu (${matchesSmart.length.toLocaleString("de-CH")})</h3>
            <div class="search-result-list">${matchesSmart.map(item => card(item.offer, item.evaluation)).join("")}</div>
          </section>
          <section class="search-result-group" aria-labelledby="search-uncertain-title">
            <h3 id="search-uncertain-title">Nicht eindeutig prüfbar (${uncertainSmart.length.toLocaleString("de-CH")})</h3>
            <div class="search-result-list">${uncertainSmart.map(item => card(item.offer, item.evaluation)).join("")}</div>
          </section>
          <details class="search-excluded"><summary>${excludedBySmart.toLocaleString("de-CH")} durch Freitext-Kriterien ausgeschlossen</summary><p>Ausgeschlossene Angebote erfüllen mindestens ein hartes Suchkriterium nicht.</p></details>`;
        const shown = matchesSmart.length + uncertainSmart.length;
        el.count.textContent = `${shown.toLocaleString("de-CH")} Ergebnisse nach Freitext und Filtern · ${matchesSmart.length.toLocaleString("de-CH")} Treffer · ${uncertainSmart.length.toLocaleString("de-CH")} nicht eindeutig prüfbar`;
        renderSmartSummary(smart.parsed, `${matchesSmart.length.toLocaleString("de-CH")} Treffer und ${uncertainSmart.length.toLocaleString("de-CH")} nicht eindeutig prüfbare Angebote nach den aktuell gesetzten Filtern.`);
        updateEmptyState(shown, activeCount + 1);
      }
    } else {
      const sorted = sortOffers(classicFiltered);
      el.cards.innerHTML = sorted.map(offer => card(offer)).join("");
      el.count.textContent = `${classicFiltered.length} von ${offers.length} aktuellen Angeboten${favoritesOnly ? " · Favoriten" : ""}`;
      updateEmptyState(classicFiltered.length, activeCount);
    }

    el.filterStatus.textContent = activeCount === 0 ? (smartRaw ? "Freitext aktiv" : "Keine Filter aktiv") : `${activeCount} Filter aktiv${smartRaw ? " · Freitext aktiv" : ""}`;
    el.reset.disabled = activeCount === 0 && !smartRaw;
    el.favoritesCount.textContent = String(activeFavoriteCount);
    el.favoritesToggle.setAttribute("aria-pressed", String(favoritesOnly));
    el.favoritesToggle.classList.toggle("is-active", favoritesOnly);
    syncUrl(currentFilters);
  };

  const reset = () => {
    [el.search, el.focus, el.type, el.price, el.format, el.language, el.country, el.level]
      .forEach(node => { node.value = ""; });
    el.sort.value = "EDITORIAL";
    smartRaw = "";
    clearSmartManagedCriteria();
    if (el.smartInput) el.smartInput.value = "";
    if (el.smartOutput) el.smartOutput.hidden = true;
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
    .forEach(node => node.addEventListener("input", () => {
      if (node === el.format && smartManaged.format && node.value !== smartManaged.format) smartManaged.format = null;
      if (node === el.level && smartManaged.level && node.value !== smartManaged.level) smartManaged.level = null;
      if (node === el.price && smartManaged.price && node.value !== smartManaged.price) smartManaged.price = null;
      render();
    }));
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
    const activateSmart = raw => {
      const probe = window.SFJSearchV1.search(allOffers, searchIndex, raw);
      if (probe.error === "NOTHING_RECOGNIZED") {
        smartRaw = "";
        clearSmartManagedCriteria();
        renderSmartSummary(probe.parsed, "Keine belastbaren Kriterien erkannt. Nutze konkretere Begriffe oder die klassischen Filter.");
        render();
        return;
      }
      smartRaw = String(raw ?? "").trim();
      applyRepresentableSmartCriteria(probe.parsed);
      render();
    };
    el.smartForm.addEventListener("submit", event => {
      event.preventDefault();
      activateSmart(el.smartInput.value);
    });
    document.querySelectorAll("[data-smart-example]").forEach(button => {
      button.addEventListener("click", () => {
        el.smartInput.value = button.dataset.smartExample || "";
        activateSmart(el.smartInput.value);
      });
    });
    if (el.smartChangeButton) el.smartChangeButton.addEventListener("click", () => {
      el.smartInput.focus();
      el.smartInput.select();
    });
  }

  applyUrlState();
  render();
})();
