"use strict";
// Media Skills B2 targeted regression: only source-backed CFJM sessions and CAD-005 delivery/price.
// Software, hardware and travel are personal costs, excluded from the course budget by owner decision.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("data.js", "utf8");
const sideSource = fs.readFileSync("smart-search-data.js", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const offers = JSON.parse(source.slice(source.indexOf("["), source.lastIndexOf("]") + 1));
const sidecar = JSON.parse(sideSource.slice(sideSource.indexOf("{"), sideSource.lastIndexOf("}") + 1));
const byId = sidecar.byId;
const get = id => offers.find(o => o.id === id);
const yes = (ok, label) => assert.ok(ok, label);
yes(offers.length === 1352 && new Set(offers.map(o => o.id)).size === 1352, "Stable Offer ID parity");
yes(Object.keys(byId).length === 1352 && offers.every(o => byId[o.id]), "Sidecar parity");
const expected = {
  "OFFER-CFJM-005": [
    ["2026-09-28", "2026-10-02"],
    ["2027-03-01", "2027-03-05"]
  ],
  "OFFER-CFJM-012": [
    ["2026-10-19", "2026-10-23"],
    ["2027-04-26", "2027-04-30"],
    ["2027-11-01", "2027-11-05"]
  ]
};
for (const [id, tuples] of Object.entries(expected)) {
  const offer = get(id);
  yes(Array.isArray(offer.sessions) && offer.sessions.length === tuples.length, id + " number of sessions");
  yes(offer.startDate === tuples[0][0] && offer.endDate === tuples[0][1], id + " historical top-level retained");
  yes(offer.sessions.every((s,i) => s.startDate === tuples[i][0] && s.endDate === tuples[i][1]),
      id + " exact source-backed sessions");
  yes(offer.sessions.every(s => !s.availabilityStatus || s.availabilityStatus === "UNKNOWN"),
      id + " no asserted capacity");
  yes(byId[id].priceEligible === false, id + " price must not be auto-promoted");
}
yes(get("OFFER-CFJM-005").priceDisplay.includes("par jour de formation"),
    "CFJM-005 per-day tariffs have not been converted to whole-course fees");
yes(offers.filter(o => Array.isArray(o.sessions)).length === 57 &&
    offers.reduce((n,o) => n + (o.sessions?.length || 0),0) === 223,
    "B2 source-backed CFJM/ifage and PC-COLLEGE session totals");
const cadOffer = get("CAD-005"), cad = byId["CAD-005"];
yes(cadOffer.sessions.length === 3 &&
    cadOffer.sessions[2].startDate === "2026-12-01" &&
    cadOffer.sessions[2].endDate === "2026-12-02", "Existing CAD005 December date retained without duplication");
yes(cadOffer.region.includes("Lausanne") && !cadOffer.region.includes("Avenue"),
    "Do not invent exact CAD005 classroom address");
yes(cad.parserStatus === "AUTO_ACCEPT" && cad.priceEligible === true &&
    cad.delivery.evidenceTier === "VERIFIED" && cad.delivery.structure === "MODE_CHOICE",
    "CAD005 source-verified classification");
yes(cad.delivery.variants.length === 2 &&
    cad.delivery.variants[0].attendanceChannels.join(",") === "IN_PERSON" &&
    cad.delivery.variants[1].attendanceChannels.join(",") === "REMOTE" &&
    cad.delivery.variants[1].temporalMode === "ASYNCHRONOUS", "Only 2 source-proven delivery variants");
const a = cad.priceOptions.find(p => p.deliveryVariantRefs.join(",") === "A");
const b = cad.priceOptions.find(p => p.deliveryVariantRefs.join(",") === "B");
yes(cad.priceOptions.length === 2 && a?.amount === 500 && b?.amount === 250 &&
    a.currency === "CHF" && b.currency === "CHF", "Variant-bound public course fees");
const licence = b.components.find(c => c.componentType === "SOFTWARE_LICENSE");
const certificate = b.components.find(c => c.componentType === "CERTIFICATION_FEE");
yes(licence?.requirementStatus === "REQUIRED" && licence.amountType === "NOT_PUBLISHED",
    "Unpriced personal Adobe licence documented");
yes(certificate?.requirementStatus === "OPTIONAL" && certificate.amount === 150 &&
    certificate.includedInBase === false, "Optional certification cost not added by default");
const extract=(start,end)=>{
  const a=app.indexOf(start),b=app.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,"Production source extraction failed: "+start);
  return app.slice(a,b);
};
const api=vm.runInNewContext([
  "(() => {",
  "const ISO_DATE=/^\\d{4}-\\d{2}-\\d{2}$/;",
  "const today=new Date(2026,10,4);",
  extract("  const NON_TUITION_COST_TYPES = new Set([","  const priceCategoryForDisplay ="),
  extract("  function isDateActive(option) {","  const amountWithRequiredComponents ="),
  extract("  const amountWithRequiredComponents =","  const freeStatusRank ="),
  "return {resolveBudget,amountWithRequiredComponents,nonTuition:NON_TUITION_COST_TYPES};",
  "})()"
].join("\n"));
yes(api.nonTuition.has("SOFTWARE_LICENSE") && api.nonTuition.has("HARDWARE") &&
    api.nonTuition.has("TRAVEL"), "Owner-approved personal costs excluded");
yes(api.amountWithRequiredComponents(a).kind === "EXACT" &&
    api.amountWithRequiredComponents(a).amount === 500, "In-person base course fee CHF500");
yes(api.amountWithRequiredComponents(b).kind === "EXACT" &&
    api.amountWithRequiredComponents(b).amount === 250, "Autonomous base course fee CHF250");
const budget=(amount,choice)=>api.resolveBudget(cadOffer,cad,{
  budget:{currency:"CHF",amount},deliveryIntents:[choice==="A"?"IN_PERSON":"ONLINE"],freeOnly:false
},{matchedVariantIds:[choice]});
yes(budget(800,"A").status === "DIRECT_FIT" && budget(800,"A").amount === 500,
    "In-person budget must count only CHF500 course fee");
yes(budget(800,"B").status === "DIRECT_FIT" && budget(800,"B").amount === 250,
    "Self-study budget must count only CHF250 course fee");
yes(budget(400,"A").status === "OVER_BUDGET" && budget(250,"B").status === "DIRECT_FIT",
    "Variant-sensitive budget thresholds");
console.log("B2_CFJM_2027_EXACT_SESSIONS_PASS");
console.log("B2_CADSCHOOL_MODE_CHOICE_AND_OPTIONAL_CERTIFICATION_PASS");
console.log("B2_PERSONAL_COSTS_EXCLUDED_FROM_COURSE_BUDGET_PASS");
console.log("B2_1352_ID_PARITY_AND_223_SESSION_ROWS_PASS");
