"use strict";
// Source-exact Dawan CH 2026 FOAD courses confirmed at:
 // https://www.dawan.ch/sessions-confirmees (source read 2026-11-04).
// "Session confirmée" means scheduled by provider; seats and individual enrollment not certified.
// Multi-offer edition windows remain grouped by stable offer; no manufacturer academies added.
const assert=require("node:assert/strict"),fs=require("node:fs");
const raw=fs.readFileSync("data.js","utf8");
const offers=JSON.parse(raw.slice(raw.indexOf("["),raw.lastIndexOf("]")+1));
const index=new Map(offers.map(o=>[o.id,o]));
assert.equal(offers.length,1352);assert.equal(index.size,1352);
const cohort={
 "V82-DAWAN-020":[["2026-11-19","2026-11-20"]],
 "V82-DAWAN-027":[["2026-11-23","2026-11-27"],["2026-11-30","2026-12-04"],["2026-12-14","2026-12-18"]],
 "V82-DAWAN-028":[["2026-11-30","2026-12-02"]],
 "V82-DAWAN-029":[["2026-11-26","2026-11-27"],["2026-12-03","2026-12-04"]],
 "V82-DAWAN-050":[["2026-11-19","2026-11-20"],["2026-12-03","2026-12-04"],["2026-12-10","2026-12-11"]],
 "V82-DAWAN-013":[["2026-12-07","2026-12-09"]],
 "V82-DAWAN-100":[["2026-11-30","2026-12-02"]],
 "V82-DAWAN-010":[["2026-12-07","2026-12-09"]],
 "V82-DAWAN-011":[["2026-12-10","2026-12-11"]],
 "V82-DAWAN-014":[["2026-12-14","2026-12-16"]],
 "V82-DAWAN-046":[["2026-12-14","2026-12-16"]],
 "V82-DAWAN-051":[["2026-12-07","2026-12-11"]]
};
let sum=0;
for(const [id,expected] of Object.entries(cohort)){
  const o=index.get(id);assert.ok(o,id+" missing");
  assert.equal(o.provider,"Dawan");
  assert.equal(o.country,"Schweiz");
  assert.ok(Array.isArray(o.sessions),id+" missing sessions");
  assert.deepEqual(o.sessions.map(s=>[s.startDate,s.endDate]),expected,id+" source edition mismatch");
  for(const s of o.sessions){
    assert.equal(s.region,"ONLINE / Distance");
    assert.equal(s.availabilityStatus,undefined,id+" must not assume vacancies");
    assert.match(s.label,/Plätze nicht bestätigt/);
  }
  sum+=expected.length;
}
assert.equal(sum,17);
assert.equal(offers.filter(o=>Array.isArray(o.sessions)).length,73);
assert.equal(offers.reduce((n,o)=>n+(o.sessions?.length||0),0),325);
const indesign=index.get("V82-DAWAN-049");
assert.deepEqual(indesign.sessions.map(s=>s.startDate),
 ["2026-11-16","2026-11-30","2026-12-07","2026-12-14"],
 "All four InDesign sessions, including 30 November, remain officially confirmed");
console.log("B2_DAWAN_12_OFFERS_17_FOAD_DATES_SOURCE_PASS");
