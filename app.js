(() => {
  "use strict";

  const offers = Array.isArray(window.WEITERBILDUNGSRADAR_OFFERS)
    ? window.WEITERBILDUNGSRADAR_OFFERS
    : [];

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

  const card = offer => `
    <article class="card">
      <div class="card-topline">
        <p class="provider">${escapeHtml(offer.provider)}</p>
        <div class="card-labels" aria-label="Berufsbezug">
          <span class="badge badge-focus" data-focus="${escapeHtml(offer.focus)}">
            ${escapeHtml(labels.focus[offer.focus] ?? offer.focus)}
          </span>
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

    return (!filter.query || haystack.includes(filter.query))
      && (!filter.focus || offer.focus === filter.focus)
      && (!filter.type || offer.offerType === filter.type)
      && (!filter.language || offer.language === filter.language)
      && (!filter.country || offer.country === filter.country)
      && (!filter.level || offer.level === filter.level);
  };

  const render = () => {
    const filtered = offers.filter(offer => matches(offer, filters()));
    el.cards.innerHTML = filtered.map(card).join("");
    el.count.textContent = `${filtered.length} von ${offers.length} Angeboten`;
    el.empty.hidden = filtered.length !== 0;
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

  addOptions(el.focus, orderedValues("focus", preferredOrder.focus), value => labels.focus[value] ?? value);
  addOptions(el.type, orderedValues("offerType", preferredOrder.offerType), value => labels.offerType[value] ?? value);
  addOptions(el.language, uniqueSorted("language"));
  addOptions(el.country, uniqueSorted("country"));
  addOptions(el.level, uniqueSorted("level"), value => labels.level[value] ?? value);

  [el.search, el.focus, el.type, el.language, el.country, el.level]
    .forEach(node => node.addEventListener("input", render));

  el.reset.addEventListener("click", reset);
  render();
})();
