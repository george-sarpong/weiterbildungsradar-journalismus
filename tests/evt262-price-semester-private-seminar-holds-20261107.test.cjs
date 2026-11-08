"use strict";
/* EVT262: dated primary-source prices are not automatic promises of booking or whole-offer budget fit.
 * Parent: EVT261. MedienCampus capture: 2026-11-06 FREE_DIRECT CONTENT_OK, exact URL/ID/SHA.
 * AT: FH Joanneum and Universität Wien official tuition policy, 2026-11-07.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");

const read = (name, first, last) => {
  const text = fs.readFileSync(name, "utf8");
  return JSON.parse(text.slice(text.indexOf(first), text.lastIndexOf(last) + 1));
};
const offers = read("data.js", "[", "]");
const sidecar = read("smart-search-data.js", "{", "}");
const offerMap = new Map(offers.map(x => [x.id, x]));
assert.equal(offers.length, 1352);
assert.equal(offerMap.size, 1352);
assert.equal(Object.keys(sidecar.byId).length, 1352);

const mediaIds = [
  "OFFER-MEDIENCAMPUS-014", "OFFER-MEDIENCAMPUS-017",
  "OFFER-MEDIENCAMPUS-026", "OFFER-MEDIENCAMPUS-031",
  "OFFER-MEDIENCAMPUS-032", "OFFER-MEDIENCAMPUS-034",
  "OFFER-MEDIENCAMPUS-035", "OFFER-MEDIENCAMPUS-036",
  "OFFER-MEDIENCAMPUS-045", "OFFER-MEDIENCAMPUS-051",
  "OFFER-MEDIENCAMPUS-053", "OFFER-MEDIENCAMPUS-055",
  "OFFER-MEDIENCAMPUS-060", "OFFER-MEDIENCAMPUS-063"
];
assert.equal(mediaIds.length, new Set(mediaIds).size);
for (const id of mediaIds) {
  const o = offerMap.get(id), s = sidecar.byId[id];
  assert.ok(o && s, id + " missing");
  assert.match(o.provider, /Mediencampus/i);
  assert.equal(o.priceDisplay, "CHF 1'150 (Privatseminar; Termin beim Anbieter erfragen)");
  assert.equal(o.priceCategory, "501_2000");
  assert.match(o.url, /^https:\/\/www\.mediencampus\.ch\//);
  assert.equal(o.reviewAfter, "2026-11-14");
  assert.equal(s.parserStatus, "NEEDS_REVIEW");
  assert.equal(s.priceEligible, false,
    id + ": unverified booking must not be automatic budget fit");
  assert.equal(s.priceOptions.length, 1);
  const p = s.priceOptions[0];
  assert.equal(p.amountType, "EXACT");
  assert.equal(p.amount, 1150);
  assert.equal(p.currency, "CHF");
  assert.equal(p.billingBasis, "TOTAL");
  assert.equal(p.priceScope, "FULL_OFFER");
  assert.equal(p.taxMode, "UNSPECIFIED");
  assert.match(p.tariffLabel, /Privatseminar/);
}

const fh = offerMap.get("AT-PROD-OFFER-021");
const uni = offerMap.get("AT-PROD-OFFER-092");
assert.ok(fh && uni);
assert.match(fh.priceDisplay, /363,36.*Semester/);
assert.match(fh.priceDisplay, /ÖH-Beitrag separat/);
assert.equal(fh.priceCategory, "UEBER_2000");
assert.match(uni.priceDisplay, /8\. Semester/);
assert.match(uni.priceDisplay, /9\. Semester/);
assert.match(uni.priceDisplay, /26,20/);
assert.equal(uni.priceCategory, "MEHRERE_TARIFE");
for (const id of ["AT-PROD-OFFER-021", "AT-PROD-OFFER-092"]) {
  const s = sidecar.byId[id];
  assert.equal(s.parserStatus, "NEEDS_REVIEW");
  assert.equal(s.priceEligible, false,
    "semester-specific fee is not verified total cost");
  assert.equal(s.priceOptions.length, 0,
    "prevent a single-semester fee from masquerading as entire BA price");
}
assert.equal(fh.reviewAfter, "2026-10-31",
  "expired review marker must not be silently reset");
console.log("EVT262 PASS: 14 source-dated private seminars + 2 AT conditional semester prices; zero automatic budget promotions.");
