(() => {
  "use strict";

  const offers = Array.isArray(window.WEITERBILDUNGSRADAR_OFFERS)
    ? window.WEITERBILDUNGSRADAR_OFFERS
    : [];

  const labels = {
    category: {
      KERNMARKT: "Kernmarkt",
      GRENZFALL: "Grenzfall",
      MEDIENNAHER_MARKT: "Mediennaher Markt",
      EVENT: "Event"
    },
    level: {
      EINSTIEG: "Einstieg",
      BERUFSERFAHRUNG: "Berufserfahrung",
      FUEHRUNG_STRATEGIE: "Führung & Strategie",
      GEMISCHT: "Gemischt"
    }
  };

  const el = {
    search: document.querySelector("#searchInput"),
    language: document.querySelector("#languageFilter"),
    country: document.querySelector("#countryFilter"),
    level: document.querySelector("#levelFilter"),
    category: document.querySelector("#categoryFilter"),
    reset: document.querySelector("#resetFilters"),
    cards: document.querySelector("#cards"),
    count: document.querySelector("#resultCount"),
    empty: document.querySelector("#emptyState")
  };

  const normalize = value => String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("de-CH");

  const uniqueSorted = key => [...new Set(offers.map(offer => offer[key]).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "de-CH"));

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

  const card = offer => `
    <article class="card">
      <div class="card-topline">
        <p class="provider">${escapeHtml(offer.provider)}</p>
        <span class="badge badge-category" data-category="${escapeHtml(offer.category)}">
          ${escapeHtml(labels.category[offer.category] ?? offer.category)}
        </span>
      </div>
      <h3>${escapeHtml(offer.title)}</h3>
      <p class="card-description">${escapeHtml(offer.description)}</p>
      <p class="access"><strong>Zugang:</strong> ${escapeHtml(offer.access)}</p>
      <div class="badges" aria-label="Eigenschaften">
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

  const filters = () => ({
    query: normalize(el.search.value.trim()),
    language: el.language.value,
    country: el.country.value,
    level: el.level.value,
    category: el.category.value
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
      labels.category[offer.category]
    ].join(" "));

    return (!filter.query || haystack.includes(filter.query))
      && (!filter.language || offer.language === filter.language)
      && (!filter.country || offer.country === filter.country)
      && (!filter.level || offer.level === filter.level)
      && (!filter.category || offer.category === filter.category);
  };

  const render = () => {
    const filtered = offers.filter(offer => matches(offer, filters()));
    el.cards.innerHTML = filtered.map(card).join("");
    el.count.textContent = `${filtered.length} von ${offers.length} Angeboten`;
    el.empty.hidden = filtered.length !== 0;
  };

  const reset = () => {
    el.search.value = "";
    el.language.value = "";
    el.country.value = "";
    el.level.value = "";
    el.category.value = "";
    render();
    el.search.focus();
  };

  addOptions(el.language, uniqueSorted("language"));
  addOptions(el.country, uniqueSorted("country"));
  addOptions(el.level, uniqueSorted("level"), value => labels.level[value] ?? value);
  addOptions(el.category, uniqueSorted("category"), value => labels.category[value] ?? value);

  [el.search, el.language, el.country, el.level, el.category]
    .forEach(node => node.addEventListener("input", render));

  el.reset.addEventListener("click", reset);
  render();
})();
