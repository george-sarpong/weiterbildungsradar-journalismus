"use strict";
// B2 single-offer ADE future schedule. Official course overview and ADE edition IDs, as of 2026-11-04:
// https://www.pc-college.ch/seminar/photoshop-cc/adobe-creative-cloud-cc-seminar-schulung-ade.php
// No inference of free seats, local attendance, course-fee changes, or PDL/PSI cross-identity.
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const source=fs.readFileSync("data.js","utf8");
const offers=JSON.parse(source.slice(source.indexOf("["),source.lastIndexOf("]")+1));
const byId=Object.fromEntries(offers.map(o=>[o.id,o]));
assert.equal(offers.length,1352);assert.equal(Object.keys(byId).length,1352);
const o=byId["PCC-P19"],other=byId["PCC-P20"];
assert.equal(o.url,"https://www.pc-college.ch/seminar/photoshop-cc/adobe-creative-cloud-cc-seminar-schulung-ade.php");
assert.equal(o.startDate,"2026-11-06");assert.equal(o.endDate,"");
assert.equal(o.priceDisplay,"ab EUR 630 + MwSt.");
assert.equal(o.duration,"1 Tag");assert.equal(o.region,"CH-Basel / CH-Bern / CH-Zürich / Live-Online");
assert.equal(o.sessions?.length,10);
const expected=["2026-11-06","2027-01-18","2027-02-15","2027-03-19","2027-04-16","2027-05-14","2027-06-11","2027-07-09","2027-08-06","2027-09-03"];
assert.deepEqual(o.sessions.map(s=>s.startDate),expected);
for(const s of o.sessions){
 assert.equal(s.startDate,s.endDate);
 assert.equal(s.availabilityStatus,undefined);
 assert.match(s.label,/PC-COLLEGE ADE \d{6}/);
 assert.match(s.label,/Live-Online laut Anbieter/);
 assert.match(s.label,/Plätze nicht bestätigt/);
}
assert.equal(other.url,"https://www.pc-college.ch/seminare-schulungen-kurse/adobe-creative-cloud/adobe-creative-cloud-cc-print-und-digitales-layout-mit-indesign-und-photoshop-pdl.php");
assert.equal(other.sessions,undefined,"Unverified PSI sessions must not enter the PDL offer");
assert.equal(offers.filter(x=>Array.isArray(x.sessions)).length,60);
assert.equal(offers.reduce((n,x)=>n+(x.sessions?.length||0),0),304);
const app=fs.readFileSync("app.js","utf8");
const from=app.indexOf("  const ISO_DATE ="),to=app.indexOf("  // Ausgelaufene Präsenz-Sessions",from);
assert.ok(from>=0&&to>from);
const api=vm.runInNewContext("(()=>{"+app.slice(from,to).replace("const today = new Date();","const today = new Date(2026,10,7);")+"return {nextSession,isCurrent};})()");
assert.equal(api.nextSession(o)?.startDate,"2027-01-18");
assert.equal(api.isCurrent(o),true);
console.log("B2_PCC_P19_10_ADE_EDITION_WINDOWS_PASS");
console.log("B2_PCC_P20_PDL_PSI_IDENTITY_HOLD_PASS");
console.log("B2_1352_IDS_60_SESSION_PARENTS_304_SESSION_ROWS_PASS");
