"use strict";
// B2 source-exact integrated edition cohort: PC-COLLEGE INA + CFJM per-offer official course and current directory.
// Captured 2026-11-04. Historical sessions kept; no seat availability inferred. No manufacturer academy.
const assert=require("node:assert/strict");const fs=require("node:fs");
const txt=fs.readFileSync("data.js","utf8");const roster=JSON.parse(txt.slice(txt.indexOf("["),txt.lastIndexOf("]")+1));
const map=new Map(roster.map(o=>[o.id,o]));assert.equal(map.size,1352);assert.equal(roster.length,1352);
const expected={"PCC-P10":[["2026-11-05","2026-11-06"],["2026-11-11","2026-11-12"],["2026-11-26","2026-11-27"],["2026-11-30","2026-12-01"],["2027-01-25","2027-01-26"],["2027-02-15","2027-02-16"],["2027-03-22","2027-03-23"],["2027-04-12","2027-04-13"],["2027-06-07","2027-06-08"],["2027-08-02","2027-08-03"],["2027-09-06","2027-09-07"],["2027-09-27","2027-09-28"],["2027-11-02","2027-11-03"],["2027-11-22","2027-11-23"]],"OFFER-CFJM-002":[["2027-03-12","2027-03-12"],["2027-10-29","2027-10-29"]],"OFFER-CFJM-003":[["2026-09-24","2026-09-25"],["2027-05-24","2027-05-25"],["2027-09-27","2027-09-28"]],"OFFER-CFJM-009":[["2026-10-08","2026-10-08"],["2027-06-03","2027-06-03"],["2027-10-28","2027-10-28"]],"OFFER-CFJM-011":[["2026-10-16","2026-10-23"],["2027-04-23","2027-04-30"],["2027-10-29","2027-11-05"]],"OFFER-CFJM-020":[["2026-11-26","2026-11-27"],["2027-04-26","2027-04-27"]]};
for(const [id,windows] of Object.entries(expected)){
 const offer=map.get(id);assert.ok(offer,id);
 assert.equal(offer.sessions.length,windows.length,id+" window count");
 assert.deepEqual(offer.sessions.map(s=>[s.startDate,s.endDate]),windows,id+" source-specific edition dates");
 for(const row of offer.sessions){assert.ok(!row.availabilityStatus,id+" availability must not be inferred");if(id!=="PCC-P10" || row.startDate>="2027-01-01")assert.match(row.label,/Plätze nicht bestätigt/);}
}
assert.equal(map.get("OFFER-CFJM-020").startDate,"2026-11-26");
assert.equal(map.get("OFFER-CFJM-020").endDate,"2026-11-27");
assert.equal(map.get("OFFER-CFJM-020").offerType,"KURS");
assert.equal(map.get("PCC-P20").sessions,undefined,"PDL/PSI identity remains on HOLD");
assert.equal(roster.filter(o=>Array.isArray(o.sessions)).length,61);
assert.equal(roster.reduce((n,o)=>n+(o.sessions?.length||0),0),308);
console.log("B2_6_OFFERS_23_ADDED_SESSION_ROWS_1352_STABLE_IDS_PASS");
