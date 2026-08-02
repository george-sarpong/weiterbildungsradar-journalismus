(() => {
  "use strict";
  const offers = Array.isArray(window.SFJ_OFFERS) ? window.SFJ_OFFERS : [];
  const labels = {
    category: {KERNMARKT:"Kernmarkt",GRENZFALL:"Grenzfall",MEDIENNAHER_MARKT:"Mediennaher Markt",EVENT:"Event"},
    level: {EINSTIEG:"Einstieg",BERUFSERFAHRUNG:"Berufserfahrung",FUEHRUNG_STRATEGIE:"Führung & Strategie",GEMISCHT:"Gemischt"}
  };
  const el = {search:document.querySelector("#searchInput"),language:document.querySelector("#languageFilter"),country:document.querySelector("#countryFilter"),level:document.querySelector("#levelFilter"),category:document.querySelector("#categoryFilter"),reset:document.querySelector("#resetFilters"),cards:document.querySelector("#cards"),count:document.querySelector("#resultCount"),empty:document.querySelector("#emptyState")};
  const normalize = v => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("de-CH");
  const uniqueSorted = key => [...new Set(offers.map(o=>o[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"de-CH"));
  const addOptions = (select,values,formatter=v=>v) => values.forEach(value=>{const option=document.createElement("option");option.value=value;option.textContent=formatter(value);select.append(option);});
  const escapeHtml = value => String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const formatDate = iso => {const p=String(iso).split("-");return p.length===3?`${p[2]}.${p[1]}.${p[0]}`:iso;};
  const card = offer => `<article class="card"><div class="card-topline"><p class="provider">${escapeHtml(offer.provider)}</p><span class="badge badge-category" data-category="${escapeHtml(offer.category)}">${escapeHtml(labels.category[offer.category]??offer.category)}</span></div><h3>${escapeHtml(offer.title)}</h3><p class="card-description">${escapeHtml(offer.description)}</p><p class="access"><strong>Zugang:</strong> ${escapeHtml(offer.access)}</p><div class="badges" aria-label="Eigenschaften"><span class="badge">${escapeHtml(labels.level[offer.level]??offer.level)}</span><span class="badge">${escapeHtml(offer.language)}</span><span class="badge">${escapeHtml(offer.country)}</span></div><div class="card-footer"><a class="source-link" href="${escapeHtml(offer.url)}" target="_blank" rel="noopener noreferrer">Offizielle Angebotsseite <span aria-hidden="true">↗</span></a><span class="checked">Geprüft: ${escapeHtml(formatDate(offer.approved))}</span></div></article>`;
  const filters = () => ({query:normalize(el.search.value.trim()),language:el.language.value,country:el.country.value,level:el.level.value,category:el.category.value});
  const matches = (offer,f) => {const haystack=normalize([offer.provider,offer.title,offer.description,offer.access,offer.language,offer.country,labels.level[offer.level],labels.category[offer.category]].join(" "));return(!f.query||haystack.includes(f.query))&&(!f.language||offer.language===f.language)&&(!f.country||offer.country===f.country)&&(!f.level||offer.level===f.level)&&(!f.category||offer.category===f.category);};
  const render = () => {const filtered=offers.filter(o=>matches(o,filters()));el.cards.innerHTML=filtered.map(card).join("");el.count.textContent=`${filtered.length} von ${offers.length} Angeboten`;el.empty.hidden=filtered.length!==0;};
  const reset = () => {el.search.value="";el.language.value="";el.country.value="";el.level.value="";el.category.value="";render();el.search.focus();};
  addOptions(el.language,uniqueSorted("language"));addOptions(el.country,uniqueSorted("country"));addOptions(el.level,uniqueSorted("level"),v=>labels.level[v]??v);addOptions(el.category,uniqueSorted("category"),v=>labels.category[v]??v);
  [el.search,el.language,el.country,el.level,el.category].forEach(node=>node.addEventListener("input",render));el.reset.addEventListener("click",reset);render();
})();
