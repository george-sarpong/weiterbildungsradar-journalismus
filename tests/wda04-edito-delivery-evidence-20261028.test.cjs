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
// Scoped successors: CAD-005, ifage, plus four source-proven B2 Microwin/ITTA delivery modes.
// Any further count change requires an exact-ID and provider-source guard.
yes(byId["CAD-005"]?.delivery?.evidenceTier === "VERIFIED" &&
    byId["CAD-005"]?.delivery?.structure === "MODE_CHOICE",
    "B2 CAD-005 source-proven delivery variant missing");
yes(["IF-G08","IF-G12"].every(id=>byId[id]?.delivery?.evidenceTier==="VERIFIED"&&
    byId[id]?.delivery?.structure==="SINGLE_CHANNEL"&&
    byId[id]?.delivery?.channels?.join(",")==="IN_PERSON"),
    "Ifage exact in-person source proof missing");
yes(["MW-P06","V78-01","V78-02","V78-03"].every(id=>byId[id]?.delivery?.evidenceTier==="VERIFIED" && byId[id]?.delivery?.variants?.length===2),"B2 four source-backed delivery successors missing");
yes(["V78-01","V78-02","V78-03"].every(id=>byId[id]?.delivery?.sourceText?.includes("trois jours") && byId[id]?.delivery?.materialisationStatus==="SOURCE_VERIFIED_PRICE_DELIVERY_DURATION_HOLD"),"ITTA duration-source contradiction must remain a hold");
yes(["OFFER-DJA-003","OFFER-DJA-005","OFFER-DJA-009","OFFER-DJA-012"].every(id=>byId[id]?.delivery?.evidenceTier==="VERIFIED" && byId[id]?.delivery?.structure==="SINGLE_CHANNEL" && byId[id]?.delivery?.variants?.[0]?.temporalMode==="ASYNCHRONOUS"),"B2 source-proven DJA online study design missing");
yes(["V82-DAWAN-010","V82-DAWAN-011","V82-DAWAN-013","V82-DAWAN-014"].every(id=>byId[id]?.delivery?.evidenceTier==="PROVISIONAL" && byId[id]?.delivery?.structure==="MODE_CHOICE" && byId[id]?.delivery?.variants?.length===1 && byId[id]?.delivery?.variants?.[0]?.attendanceChannels?.join(",")==="REMOTE" && byId[id]?.priceEligible===false),"B2 Dawan exact remote session must not become whole-offer verified or price eligible");
yes(["CAD-003","V78-05"].every(id=>byId[id]?.delivery?.evidenceTier==="VERIFIED" && byId[id]?.delivery?.structure==="MODE_CHOICE" && byId[id]?.delivery?.variants?.length===2),"B2 CAD and ITTA source-backed two-mode delivery fields missing");
yes(["OFFER-DJA-002","OFFER-DJA-004","OFFER-DJA-006","OFFER-DJA-007","OFFER-DJA-008","OFFER-DJA-010","OFFER-DJA-022"].every(id=>byId[id]?.delivery?.evidenceTier==="VERIFIED"&&byId[id]?.delivery?.structure==="SINGLE_CHANNEL"&&byId[id]?.delivery?.variants?.[0]?.temporalMode==="ASYNCHRONOUS"&&byId[id]?.delivery?.materialisationStatus?.includes("INTAKE_AND_CAMPUS_HOLD")),"DJA seven exact online programme proofs must retain intake restrictions");
yes(["OFFER-DJA-011","OFFER-DJA-013","OFFER-DJA-014","OFFER-DJA-015","OFFER-DJA-016","OFFER-DJA-017","OFFER-DJA-018","OFFER-DJA-019","OFFER-DJA-020","OFFER-DJA-021"].every(id=>byId[id]?.delivery?.evidenceTier==="VERIFIED" && byId[id]?.delivery?.structure==="SINGLE_CHANNEL" && byId[id]?.delivery?.variants?.[0]?.attendanceChannels?.join(",")==="REMOTE" && byId[id]?.delivery?.variants?.[0]?.temporalMode==="ASYNCHRONOUS" && byId[id]?.delivery?.materialisationStatus?.includes("INTAKE_CAMPUS_HOLD")),"DJA ten source-backed teaching modes still retain enrolment restriction");
yes(["MW-P08","MW-P07","MW-P09","MW-P03"].every(id=>byId[id]?.delivery?.evidenceTier==="VERIFIED"&&byId[id]?.delivery?.structure==="MODE_CHOICE"&&byId[id]?.delivery?.variants?.length===2&&byId[id]?.delivery?.materialisationStatus?.includes("CURRENTNESS_HOLD")),"four exact Microwin source delivery but not Gold");
yes(tiers.VERIFIED === 181 && tiers.PROVISIONAL === 399 && tiers.UNKNOWN === 772,
    "Global evidence tiers outside authorised B2 CAD-005/ifage changes: " + JSON.stringify(tiers));
console.log("WDA04_EDITO_SOURCE_VERIFIED_4_OF_4_PASS");
console.log("WDA04_ONLINE_VARIANT_AND_PRICE_GUARDS_PASS");
console.log("WDA04_ROSTER_1352_PARITY_PASS");
console.log("WDA04_" + checks + "_ASSERTIONS_PASS");
