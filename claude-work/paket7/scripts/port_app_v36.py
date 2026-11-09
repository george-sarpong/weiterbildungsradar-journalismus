"""Paket 7: app-v35.js (Paket 6) -> app-v36.js. Beta-Muss gemäss E074.
Schritt F5 (WDA-01, E051): Preisspanne – Obergrenze ≤ Budget = direkter Treffer.
Schritt F6 (WDA-03, E052/E057): eine «Kostenlos»-Klassierung für Karte, Filter, Preisbänder, Smart-Suche.
Schritt D7 (§5 Punkt 5, E043/E065/E066, Owner 10.11.: Filter nach Durchführungsort, Anbieterland «nicht erfasst»).
Aufruf: python3 port_app_v36.py <app-v35.js> <app-v36.js>. Jede Ersetzung muss genau einmal passen."""
import sys, hashlib, pathlib
src, dst = map(pathlib.Path, sys.argv[1:3])
code = src.read_text(encoding="utf-8")
assert hashlib.sha256(code.encode()).hexdigest().startswith("2ece5c59b436"), "Quelle ist nicht app-v35.js (Paket 6)"

EDITS_F5 = [
 ("F5 Preisspanne mit Pflichtgebühren-, Abrechnungs- und MWST-Regeln",
  r"""  const amountWithRequiredComponents = option => {
    if (option.amountType === "FREE") return { kind: "EXACT", amount: 0 };
    if (option.amountType === "FROM") return { kind: "FROM", amount: option.minAmount };
    if (option.amountType === "RANGE") return { kind: "RANGE", amount: option.minAmount, maxAmount: option.maxAmount };""",
  r"""  // WDA-01 (E051): Eine Preisspanne gilt nur dann als belegter Gesamtpreis (certain), wenn beide
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
    if (option.amountType === "RANGE") return rangeWithRequiredComponents(option);"""),
 ("F5 resolveBudget: Obergrenze ≤ Budget = direkter Treffer",
  r"""      if (calc.kind === "FROM" || calc.kind === "RANGE" || calc.kind === "POSSIBLE") {""",
  r"""      // WDA-01 (E051): Obergrenze ≤ Budget = direkter Treffer, nur bei unbedingtem Tarif und belegtem
      // Gesamtpreis; Untergrenze ≤ Budget < Obergrenze = möglich; Untergrenze > Budget = über Budget.
      if (calc.kind === "RANGE" && calc.certain && classifyEligibility(option) === "DIRECT_FIT"
          && calc.maxAmount <= parsed.budget.amount) {
        candidates.push({ status: "DIRECT_FIT", option, amount: calc.maxAmount, range: true });
        continue;
      }
      if (calc.kind === "FROM" || calc.kind === "RANGE" || calc.kind === "POSSIBLE") {"""),
 ("F5 Restbetrag bei Preisspanne ab Obergrenze",
  r"""      const prefix = status === "TARGET_GROUP_FIT" ? "Beim publizierten Journalist:innen-Tarif" : "Bei diesem Preis";""",
  r"""      const prefix = status === "TARGET_GROUP_FIT" ? "Beim publizierten Journalist:innen-Tarif"
        : item.budget.range ? "Bei der Preisobergrenze" : "Bei diesem Preis";"""),
]

EDITS_F6 = [
 ("F6 Bezeichnungen Filter",
  r"""      KOSTENLOS: "Kostenlos",
      BIS_500: "Bis 500",""",
  r"""      KOSTENLOS: "Kostenlos",
      KOSTENLOS_MIT_BEDINGUNG: "Kostenlos mit Bedingung",
      PREIS_UNBESTAETIGT: "Preis unbestätigt",
      BIS_500: "Bis 500","""),
 ("F6 Reihenfolge Filter",
  r"""    priceCategory: ["KOSTENLOS", "BIS_500",""",
  r"""    priceCategory: ["KOSTENLOS", "KOSTENLOS_MIT_BEDINGUNG", "PREIS_UNBESTAETIGT", "BIS_500","""),
 ("F6 Karte: Bezeichnung nach E057",
  r"""    if (offer.priceCategory === "KOSTENLOS") return "Kostenlos";""",
  r"""    // WDA-03 (E057): «Kostenlos» nur ohne Bedingung; sonst Bedingung nennen oder «Preis unbestätigt».
    if (offer.priceCategory === "KOSTENLOS") return freeStatus(offer).label;"""),
 ("F6 gemeinsame Klassierung",
  r"""  const isSafelyFree = (record, deliveryResult, hasDeliveryIntent) =>
    Boolean(resolveFreeOption(record, deliveryResult, hasDeliveryIntent));""",
  r"""  const isSafelyFree = (record, deliveryResult, hasDeliveryIntent) =>
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
  };"""),
 ("F6 Smart-Preisangabe einer Gratis-Option",
  r"""    if (option.amountType === "FREE") return option.tariffLabel
      ? `Kostenlos · ${option.tariffLabel}`
      : "Kostenlos";""",
  r"""    if (option.amountType === "FREE") {
      const eligibility = classifyEligibility(option);
      if (eligibility === "DIRECT_FIT") return "Kostenlos";
      return eligibility === "POSSIBLE_FIT" ? "Preis unbestätigt" : `Kostenlos mit Bedingung: ${freeConditionText(option)}`;
    }"""),
 ("F6 Smart-Bezeichnung «Nur kostenlos»",
  r"""    const tariff = result.option?.tariffLabel;
    if (result.status === "DIRECT_FIT") return "Kostenlos";
    if (result.status === "TARGET_GROUP_FIT") return `Kostenlos · ${tariff || "Journalist:innen-Tarif"}`;
    if (result.status === "CONDITIONAL_FIT") return `Kostenlos unter Bedingung${tariff ? ` · ${tariff}` : ""}`;
    return "Kostenlos-Option · Berechtigung unklar";""",
  r"""    if (result.status === "DIRECT_FIT") return "Kostenlos";
    if (result.status === "TARGET_GROUP_FIT" || result.status === "CONDITIONAL_FIT") {
      return `Kostenlos mit Bedingung: ${freeConditionText(result.option)}`;
    }
    return "Preis unbestätigt";"""),
 ("F6 Preisband «Kostenlos» = ohne Bedingung",
  r"""      if (offer.priceCategory === "KOSTENLOS") counts.free += 1;""",
  r"""      if (freeStatus(offer)?.kind === "FREE") counts.free += 1;"""),
 ("F6 Filter nach gemeinsamer Klassierung",
  r"""      && (!filter.price || offer.priceCategory === filter.price)""",
  r"""      && (!filter.price || priceFilterCategory(offer) === filter.price)"""),
 ("F6 Filteroptionen nach gemeinsamer Klassierung",
  r"""  addOptions(el.price, orderedValues("priceCategory", preferredOrder.priceCategory), value => labels.priceCategory[value] ?? value);""",
  r"""  addOptions(el.price, (values => [
    ...preferredOrder.priceCategory.filter(value => values.has(value)),
    ...[...values].filter(value => !preferredOrder.priceCategory.includes(value)).sort((a, b) => a.localeCompare(b, "de-CH"))
  ])(new Set(offers.map(priceFilterCategory).filter(Boolean))), value => labels.priceCategory[value] ?? value);"""),
]

EDITS_D7 = [
 ("D7 Reihenfolge Filter Durchführungsort",
  r"""    country: ["Schweiz", "Österreich", "Liechtenstein", "Deutschland", "Frankreich", "Grossbritannien", "USA", "International"],""",
  r"""    country: ["Schweiz", "Österreich", "Liechtenstein", "Deutschland"],"""),
 ("D7 Vier-Felder-Modell statt country",
  r"""  const countryDisplay = value => value === "CH_ACCESS / operational presence Chiasso"
    ? "Schweiz"
    : String(value ?? "");

  const countryValues = order => {
    const values = new Set(offers.map(offer => countryDisplay(offer.country)).filter(Boolean));
    return [
      ...order.filter(value => values.has(value)),
      ...[...values].filter(value => !order.includes(value)).sort((a, b) => a.localeCompare(b, "de-CH"))
    ];
  };""",
  r"""  // D7 (E043, E065, E066): Länder nach dem Vier-Felder-Modell aus dem Master (Feld laender).
  // Der Rohwert country bleibt im Datensatz, wird aber nicht mehr angezeigt oder gefiltert.
  const NOT_RECORDED = "nicht erfasst";
  const COUNTRY_NAMES = {
    CH: "Schweiz", AT: "Österreich", LI: "Liechtenstein", DE: "Deutschland", FR: "Frankreich", IT: "Italien",
    BE: "Belgien", NO: "Norwegen", SE: "Schweden", PT: "Portugal", ES: "Spanien", GB: "Grossbritannien", US: "USA"
  };
  const countryName = code => COUNTRY_NAMES[code] ?? code;
  const isoCodes = value => String(value ?? "").split("|").map(code => code.trim()).filter(code => /^[A-Z]{2}$/.test(code));
  const laender = offer => offer.laender && typeof offer.laender === "object" ? offer.laender : {};
  const placeOnline = offer => /(?:^|_)ONLINE$/.test(String(laender(offer).ortSicherheit ?? ""));
  // Filter Durchführungsort (Owner 10.11.): Länder des Orts, «Online» bei Online-Anteil, sonst «nicht erfasst».
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
  // Anbieterland nur mit Beleg (E065); sonst sichtbar «nicht erfasst» (E036, Owner 10.11.).
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
  };"""),
 ("D7 Karte: Ort",
  r"""    const displayCountry = countryDisplay(offer.country);
    const displayRegion = regionDisplay(currentRegion(offer));
    const place = displayRegion ? `${displayCountry} · ${displayRegion}` : displayCountry;""",
  r"""    const place = placeLabel(offer);"""),
 ("D7 Karte: Ort, Anbieterland, CH-Zugang getrennt",
  r"""          <span class="badge">${escapeHtml(place)}</span>""",
  r"""          <span class="badge">Ort: ${escapeHtml(place)}</span>
          <span class="badge">Anbieterland: ${escapeHtml(providerCountryLabel(offer))}</span>
          <span class="badge">CH-Zugang: ${escapeHtml(chAccessLabel(offer))}</span>"""),
 ("D7 Smart-Karte: Ort",
  r"""    const place = [countryDisplay(offer.country), regionDisplay(currentRegion(offer))].filter(Boolean).join(" · ");""",
  r"""    const place = `Ort: ${placeLabel(offer)}`;"""),
 ("D7 Smart-Themensuche ohne Rohwert country",
  r"""    offer.region, offer.country, labels.focus[offer.focus],""",
  r"""    offer.region, placeSearchText(offer), labels.focus[offer.focus],"""),
 ("D7 Volltextsuche ohne Rohwert country",
  r"""      offer.country,
      currentRegion(offer),""",
  r"""      placeSearchText(offer),
      currentRegion(offer),"""),
 ("D7 Filter nach Durchführungsort",
  r"""      && (!filter.country || countryDisplay(offer.country) === filter.country)""",
  r"""      && (!filter.country || placeFilterValues(offer).includes(filter.country))"""),
]

STEPS = [EDITS_F5, EDITS_F6, EDITS_D7]
for edits in STEPS:
    for name, old, new in edits:
        n = code.count(old)
        assert n == 1, f"{name}: {n} Treffer statt 1"
        code = code.replace(old, new)
assert "countryDisplay" not in code, "countryDisplay noch referenziert"
dst.write_text(code, encoding="utf-8")
print("OK", sum(map(len, STEPS)), "Ersetzungen,", hashlib.sha256(code.encode()).hexdigest())
