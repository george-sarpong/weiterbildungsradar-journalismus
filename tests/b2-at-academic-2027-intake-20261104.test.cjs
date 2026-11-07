"use strict";
// Source-exact AT 2027 journalism intake. Not a claim that admission or seats are guaranteed.
// FHWien: https://www.fh-wien.ac.at/studium/bewerben/aufnahmeverfahren-bachelor/
//         https://www.fh-wien.ac.at/studium/bewerben/aufnahmeverfahren-master/journalismus-neue-medien/
// FH JOANNEUM: https://www.fh-joanneum.at/journalismus-und-public-relations/bachelor/vor-dem-studium/termine-fristen/
const assert = require("node:assert/strict");
const fs = require("node:fs");
const text = fs.readFileSync("data.js", "utf8");
const offers = JSON.parse(text.slice(text.indexOf("["), text.lastIndexOf("]") + 1));
const byId = new Map(offers.map(o => [o.id, o]));
assert.equal(offers.length, 1352);
assert.equal(byId.size, 1352);

const vienna = [
  "AT-PROD-OFFER-017", "AT-PROD-OFFER-018", "AT-PROD-OFFER-019"
];
for (const id of vienna) {
  const offer = byId.get(id);
  assert.ok(offer, id + " missing");
  assert.equal(offer.country, "Österreich");
  assert.equal(offer.offerType, "STUDIUM");
  assert.equal(offer.provider, "FHWien der WKW");
  assert.equal(offer.startDate, "", id + " must not invent the exact autumn day");
  assert.match(offer.start, /Studienstart Herbst 2027/);
  assert.match(offer.start, /07\.01\.\D*30\.03\.2027/);
  assert.match(offer.start, /09\.03\.2027/);
  assert.match(offer.start, /Aufnahmeentscheid vorbehalten/);
}
const joanneum = byId.get("AT-PROD-OFFER-021");
assert.ok(joanneum);
assert.equal(joanneum.startDate, "2027-10-04");
assert.match(joanneum.start, /04\.10\.2027/);
assert.match(joanneum.start, /22\.03\.2027/);
assert.match(joanneum.start, /Aufnahmeentscheid vorbehalten/);
// EVT262: the separate, source-proven CH semester fee is now visible; intake/date guards are unchanged.
assert.equal(joanneum.priceCategory, "UEBER_2000");
assert.match(joanneum.priceDisplay, /363,36.*Semester/);
assert.match(joanneum.priceDisplay, /ÖH-Beitrag separat/);
for (const id of vienna) assert.equal(byId.get(id).priceCategory, "BIS_500");
assert.equal(offers.reduce((n, o) => n + (o.sessions?.length || 0), 0), 325);
// USTP official intake (2027/28), no invented September study date.
// https://www.ustp.at/de/studium/bewerbungsinfo/alle-bewerbungsfristen-und-aufnahmetermine
const ustp = byId.get("AT-PROD-OFFER-023");
assert.ok(ustp);
assert.equal(ustp.startDate, "");
assert.match(ustp.start, /Wintersemester 2027\/28/);
assert.match(ustp.start, /01\.10\.2026/);
assert.match(ustp.start, /31\.05\.2027/);
assert.match(ustp.start, /01\.02\.2027/);
assert.match(ustp.access, /Schweizer Zugang grundsätzlich möglich/);
assert.match(ustp.access, /Aufnahmetest vorbehalten/);
console.log("B2_AT_2027_JOURNALISM_INTAKE_SOURCE_REGRESSION_PASS");
