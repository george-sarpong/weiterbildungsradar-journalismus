"use strict";
// Verified on 2026-11-04 using Dawan's official CH confirmed-session page:
// https://www.dawan.ch/sessions-confirmees
// "Confirmed" is delivery status, never guaranteed enrolment or vacant seats.
const assert=require("node:assert/strict"),fs=require("node:fs");
const text=fs.readFileSync("data.js","utf8");
const offers=JSON.parse(text.slice(text.indexOf("["),text.lastIndexOf("]")+1));
assert.equal(offers.length,1352);
assert.equal(new Set(offers.map(o=>o.id)).size,1352);
const d=offers.find(o=>o.id==="V82-DAWAN-049");
assert.ok(d,"Dawan offer missing");
assert.equal(d.provider,"Dawan");
assert.equal(d.duration,"3 Tage / 21 Stunden");
assert.equal(d.priceDisplay,"CHF 1,125 present / CHF 900 distance");
assert.equal(d.format,"PRÄSENZ|ONLINE LIVE");
assert.deepEqual(d.sessions.map(x=>[x.startDate,x.endDate]),[
 ["2026-11-16","2026-11-18"],
 ["2026-11-30","2026-12-02"],
 ["2026-12-07","2026-12-09"],
 ["2026-12-14","2026-12-16"]
]);
for(const x of d.sessions){
 assert.equal(x.region,"ONLINE / Distance");
 assert.equal(x.availabilityStatus,undefined);
 assert.match(x.label,/Plätze nicht bestätigt/);
}
assert.equal(offers.filter(o=>Array.isArray(o.sessions)).length,61);
assert.equal(offers.reduce((n,o)=>n+(o.sessions?.length||0),0),308);
console.log("B2_DAWAN_FOAD_FOUR_SOURCE_CONFIRMED_SESSIONS_PASS");
