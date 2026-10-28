"use strict";
// WDA-04: narrow, source-backed delivery-tier verification.
// Approved four IDs only. Does not assert bookability or release readiness.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const rosterSource = fs.readFileSync("data.js", "utf8");
const smartSource = fs.readFileSync("smart-search-data.js", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const parseAssigned = source => JSON.parse(source.slice(source.indexOf("{"), source.lastIndexOf("}") + 1));
const offers = JSON.parse(rosterSource.slice(rosterSource.indexOf("["), rosterSource.lastIndexOf("]") + 1));
const byId = parseAssigned(smartSource).byId;
const expected = {
  "OFFER-EDITO-002": ["2026-11-09", "https://academy.edito.ch/edito-deep-dive-euria/"],
  "OFFER-EDITO-003": ["2026-11-12", "https://academy.edito.ch/was-darf-die-ki-wissen/"],
  "OFFER-EDITO-004": ["2026-11-17", "https://academy.edito.ch/illustrieren-mit-ki-tausend-worte-fuer-ein-bild/"],
  "OFFER-EDITO-005": ["2026-12-15", "https://academy.edito.ch/vibe-coding-zeigitag/"]
};
const start = app.indexOf("  const variantsOf = delivery =>");
const end = app.indexOf("  function isDateActive(option) {", start);
assert(start !== -1 && end > start, "Production delivery resolver extraction failed");
const deliveryIntentMatches = vm.runInNewContext(
  "(() => {" +
  "const normalize = value => String(value ?? '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLocaleLowerCase('de-CH');" +
  app.slice(start, end) +
  "return deliveryIntentMatches;})()"
);
let checks = 0;
const yes = (condition, message) => { assert(condition, message); checks++; };
yes(offers.length === 1352, "Raw roster count changed");
yes(new Set(offers.map(o => o.id)).size === 1352, "Duplicate raw IDs");
yes(Object.keys(byId).length === 1352, "Smart sidecar count changed");
yes(offers.every(o => byId[o.id]), "Master/sidecar ID mismatch");
for (const [id, [date, url]] of Object.entries(expected)) {
  const offer = offers.find(o => o.id === id);
  const record = byId[id];
  yes(offer?.startDate === date && offer.endDate === date, id + " occurrence date changed");
  yes(offer?.url === url, id + " official URL changed");
  yes(offer?.format === "ONLINE LIVE", id + " catalog delivery hint changed");
  yes(record?.delivery?.evidenceTier === "VERIFIED", id + " is not verified");
  yes(record?.delivery?.materialisationStatus === "GOLD_SOURCE_VERIFIED", id + " source status missing");
  yes(record?.delivery?.sourceText?.includes(url) && record.delivery.sourceText.includes("Zoom"),
      id + " exact primary-source provenance missing");
  yes(record?.delivery?.structure === "SINGLE_CHANNEL" &&
      record.delivery.channels?.length === 1 && record.delivery.channels[0] === "REMOTE",
      id + " remote-only structure changed");
  yes(record?.delivery?.variants?.length === 1 &&
      record.delivery.variants[0].deliveryVariantId === "A" &&
      record.delivery.variants[0].temporalMode === "SYNCHRONOUS" &&
      record.delivery.variants[0].scheduleMode === "FIXED", id + " live-session variant changed");
  for (const intent of ["ONLINE", "LIVE_ONLINE", "STRICT_REMOTE"]) {
    const result = deliveryIntentMatches(record, [intent]);
    yes(result.outcome === "MATCH" && result.evidenceTier === "VERIFIED" &&
        result.matchedVariantIds.join(",") === "A", id + " " + intent + " misclassified");
  }
  yes(deliveryIntentMatches(record, ["IN_PERSON"]).outcome === "MISMATCH",
      id + " falsely matches in-person intent");
  yes(record.parserStatus === "AUTO_ACCEPT" && record.priceEligible === true,
      id + " price eligibility changed");
  yes(record.priceOptions.some(p => p.amountType === "EXACT" && p.amount === 25 &&
      p.currency === "CHF" && p.eligibilityType === "NONE"),
      id + " regular CHF 25 tariff changed");
  yes(record.priceOptions.filter(p => p.amountType === "FREE").length === 3 &&
      record.priceOptions.filter(p => p.amountType === "FREE")
        .every(p => ["MEMBERSHIP", "SUBSCRIPTION"].includes(p.eligibilityType)),
      id + " conditional-free tariff changed");
}
yes(byId["OFFER-SFJ-001"]?.delivery?.evidenceTier === "PROVISIONAL",
    "SFJ meetup must not be promoted without a new occurrence");
const tiers = Object.values(byId).reduce((acc, rec) => {
  const tier = rec.delivery?.evidenceTier || "UNKNOWN";
  acc[tier] = (acc[tier] || 0) + 1;
  return acc;
}, {});
yes(tiers.VERIFIED === 147 && tiers.PROVISIONAL === 397 && tiers.UNKNOWN === 808,
    "Global evidence tiers changed unexpectedly: " + JSON.stringify(tiers));
console.log("WDA04_EDITO_SOURCE_VERIFIED_4_OF_4_PASS");
console.log("WDA04_ONLINE_VARIANT_AND_PRICE_GUARDS_PASS");
console.log("WDA04_ROSTER_1352_PARITY_PASS");
console.log("WDA04_" + checks + "_ASSERTIONS_PASS");
