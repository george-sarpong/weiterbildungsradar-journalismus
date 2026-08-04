(() => {
  "use strict";

  const offers = Array.isArray(window.WEITERBILDUNGSRADAR_OFFERS)
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
      FUEHRUNG_STRATEGIE: "Führung & Strategie",
      GEMISCHT: "Gemischt"
    }
  };

  const preferredOrder = {
    focus: ["JOURNALISMUS", "MEDIENPRAXIS", "MANAGEMENT"],
    offerType: ["KURS", "PROGRAMM", "EVENT", "FELLOWSHIP", "STUDIUM"]
  };

  const el = {
    search: document.querySelector("#searchInput"),
    focus: document.querySelector("#focusFilter"),
    type: document.querySelector("#typeFilter"),
    language: document.querySelector("#languageFilter"),
    country: document.querySelector("#countryFilter"),
    level: document.querySelector("#levelFilter"),
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

  const knownIds = new Set(offers.map(offer => offer.id));
  let favorites = loadFavorites();
  let favoritesOnly = false;

  function loadFavorites() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]");
      return new Set(Array.isArray(stored) ? stored.filter(id => knownIds.has(id)) : []);
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
    return order.filter(value => values.has(value));
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

  const heartSvg = `
    <svg class="heart-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20.4 4.4 13A5.1 5.1 0 0 1 11.6 5.8L12 6.2l.4-.4A5.1 5.1 0 0 1 19.6 13Z"></path>
    </svg>`;

  const card = offer => {
    const isFavorite = favorites.has(offer.id);
    const favoriteLabel = isFavorite
      ? `${offer.title} aus den Favoriten entfernen`
      : `${offer.title} zu den Favoriten hinzufügen`;

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
        <p class="card-description">${escapeHtml(offer.description)}</p>
        <p class="access"><strong>Zugang:</strong> ${escapeHtml(offer.access)}</p>
        <div class="badges" aria-label="Angebotsart und weitere Eigenschaften">
          <span class="badge badge-type">${escapeHtml(labels.offerType[offer.offerType] ?? offer.offerType)}</span>
          <span class="badge">${escapeHtml(labels.level[offer.level] ?? offer.level)}</span>
          <span class="badge">${escapeHtml(offer.language)}</span>
          <span class="badge">${escapeHtml(offer.country)}</span>
        </div>
        <div class="card-footer">
          <a class="source-link" href="${escapeHtml(offer.url)}" target="_blank" rel="noopener noreferrer" aria-label="Offizielle Angebotsseite zu ${escapeHtml(offer.title)} öffnen">
            Offizielle Angebotsseite <span aria-hidden="true">↗</span>
          </a>
          <span class="checked">Geprüft: ${escapeHtml(formatDate(offer.approved))}</span>
        </div>
      </article>`;
  };

  const filters = () => ({
    query: normalize(el.search.value.trim()),
    focus: el.focus.value,
    type: el.type.value,
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
      offer.language,
      offer.country,
      labels.level[offer.level],
      labels.focus[offer.focus],
      labels.offerType[offer.offerType]
    ].join(" "));

    return (!favoritesOnly || favorites.has(offer.id))
      && (!filter.query || haystack.includes(filter.query))
      && (!filter.focus || offer.focus === filter.focus)
      && (!filter.type || offer.offerType === filter.type)
      && (!filter.language || offer.language === filter.language)
      && (!filter.country || offer.country === filter.country)
      && (!filter.level || offer.level === filter.level);
  };

  const activeFilterCount = filter => [
    filter.query,
    filter.focus,
    filter.type,
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
    if (favoritesOnly && favorites.size === 0) {
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

    el.cards.innerHTML = filtered.map(card).join("");
    el.count.textContent = `${filtered.length} von ${offers.length} Angeboten${favoritesOnly ? " · Favoriten" : ""}`;
    el.filterStatus.textContent = activeCount === 0
      ? "Keine Filter aktiv"
      : `${activeCount} ${activeCount === 1 ? "Filter" : "Filter"} aktiv`;
    el.reset.disabled = activeCount === 0;
    el.favoritesCount.textContent = String(favorites.size);
    el.favoritesToggle.setAttribute("aria-pressed", String(favoritesOnly));
    el.favoritesToggle.classList.toggle("is-active", favoritesOnly);
    updateEmptyState(filtered.length, activeCount);
  };

  const reset = () => {
    el.search.value = "";
    el.focus.value = "";
    el.type.value = "";
    el.language.value = "";
    el.country.value = "";
    el.level.value = "";
    render();
    el.search.focus();
  };

  const toggleFavorite = id => {
    if (!knownIds.has(id)) return;

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
  addOptions(el.language, uniqueSorted("language"));
  addOptions(el.country, uniqueSorted("country"));
  addOptions(el.level, uniqueSorted("level"), value => labels.level[value] ?? value);

  [el.search, el.focus, el.type, el.language, el.country, el.level]
    .forEach(node => node.addEventListener("input", render));

  el.reset.addEventListener("click", reset);
  el.favoritesToggle.addEventListener("click", () => {
    favoritesOnly = !favoritesOnly;
    render();
  });
  el.cards.addEventListener("click", event => {
    const button = event.target.closest("[data-favorite-id]");
    if (button) toggleFavorite(button.dataset.favoriteId);
  });

  render();
})();
