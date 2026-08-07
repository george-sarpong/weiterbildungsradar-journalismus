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
      MANAGEMENT: "Management"
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
      VERSCHIEDENE_NIVEAUS: "Verschiedene Niveaus"
    },
    priceCategory: {
      KOSTENLOS: "Kostenlos",
      BIS_500: "Bis 500",
      "501_2000": "501 bis 2'000",
      UEBER_2000: "Über 2'000",
      MEHRERE_TARIFE: "Mehrere Tarife",
      PREIS_AUF_ANFRAGE: "Preis auf Anfrage"
    }
  };

  const preferredOrder = {
    focus: ["JOURNALISMUS", "MEDIENPRAXIS", "MANAGEMENT"],
    offerType: ["KURS", "PROGRAMM", "EVENT", "FELLOWSHIP", "STUDIUM"],
    priceCategory: ["KOSTENLOS", "BIS_500", "501_2000", "UEBER_2000", "MEHRERE_TARIFE", "PREIS_AUF_ANFRAGE"],
    format: ["PRÄSENZ", "ONLINE LIVE", "ONLINE SELBSTLERNEN", "HYBRID"],
    country: ["Schweiz", "Deutschland", "Österreich", "Frankreich", "Grossbritannien", "USA", "International"],
    level: ["EINSTIEG", "BERUFSERFAHRUNG", "VERSCHIEDENE_NIVEAUS"]
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
    emptyText: document.querySelector("#emptyText")
  };

  const parseDate = value => value ? new Date(`${value}T23:59:59`) : null;
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
    const place = offer.region ? `${offer.country} · ${offer.region}` : offer.country;
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
          ${fact("Preis", offer.priceDisplay)}
          ${fact("Durchführung", offer.format)}
          ${fact("Dauer", offer.duration)}
          ${fact("Start", offer.start)}
        </dl>
        <p class="card-description">${escapeHtml(offer.description)}</p>
        <p class="access"><strong>Zugang:</strong> ${escapeHtml(offer.access)}</p>
        <div class="badges" aria-label="Angebotsart und weitere Eigenschaften">
          <span class="badge badge-type">${escapeHtml(labels.offerType[offer.offerType] ?? offer.offerType)}</span>
          <span class="badge">${escapeHtml(labels.level[offer.level] ?? offer.level)}</span>
          <span class="badge">${escapeHtml(offer.language)}</span>
          <span class="badge">${escapeHtml(place)}</span>
        </div>
        <div class="card-footer">
          <div class="card-links">
            <a class="source-link" href="${escapeHtml(offer.url)}" target="_blank" rel="noopener noreferrer" aria-label="Offizielle Angebotsseite zu ${escapeHtml(offer.title)} öffnen">
              Offizielle Angebotsseite <span aria-hidden="true">↗</span>
            </a>
            <a class="feedback-link" href="mailto:kontakt@weiterbildungsradar.ch?subject=${feedbackSubject}">Fehler melden</a>
          </div>
          <span class="checked">Geprüft: ${escapeHtml(formatDate(offer.approved))}</span>
        </div>
      </article>`;
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
      && (!filter.format || offer.format === filter.format)
      && (!filter.language || offer.language === filter.language)
      && (!filter.country || offer.country === filter.country)
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
  addOptions(el.format, orderedValues("format", preferredOrder.format));
  addOptions(el.language, uniqueSorted("language"));
  addOptions(el.country, orderedValues("country", preferredOrder.country));
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

  applyUrlState();
  render();
})();
