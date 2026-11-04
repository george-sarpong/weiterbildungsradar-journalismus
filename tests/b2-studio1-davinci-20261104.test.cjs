"use strict";
// Source: https://www.studioeins.ch/kurse/davinci-resolve/ ; dates cross-check official trainer page.
// Historical 2026 edition is sold out; unconfirmed seats remain unconfirmed for 2027.
const assert=require("node:assert/strict"),fs=require("node:fs");
const src=fs.readFileSync("data.js","utf8");
const roster=JSON.parse(src.slice(src.indexOf("["),src.lastIndexOf("]")+1));
const byId=new Map(roster.map(x=>[x.id,x]));
assert.equal(roster.length,1352);assert.equal(byId.size,1352);
assert.equal(roster.filter(x=>Array.isArray(x.sessions)).length,58);
assert.equal(roster.reduce((n,x)=>n+(x.sessions?.length||0),0),227);
const o=byId.get("V58-S1-04");assert.ok(o);assert.equal(o.provider,"Studio 1 GmbH");
assert.equal(o.startDate,"2026-11-09");assert.equal(o.endDate,"2026-11-11");
assert.equal(o.priceDisplay,"CHF 1'690");assert.equal(o.sessions.length,4);
assert.deepEqual(o.sessions.map(x=>[x.startDate,x.endDate]),[
["2026-11-09","2026-11-11"],["2027-03-08","2027-03-10"],
["2027-06-14","2027-06-16"],["2027-10-25","2027-10-27"]]);
assert.equal(o.sessions[0].availabilityStatus,"SOLD_OUT");
assert.equal(o.sessions[0].statusEvidenceUrl,o.url);
for(const x of o.sessions.slice(1)){
 assert.equal(x.availabilityStatus,undefined,"Do not invent seat availability");
 assert.match(x.label,/Plätze nicht bestätigt/);
}
const next=o.sessions.filter(x=>x.startDate>="2026-11-04"&&x.availabilityStatus!=="SOLD_OUT").sort((a,b)=>a.startDate.localeCompare(b.startDate))[0];
assert.equal(next.startDate,"2027-03-08","Never recommend the sold-out November 2026 edition");
console.log("B2_STUDIO1_DAVINCI_2026_SOLDOUT_3_VERIFIED_2027_WINDOWS_PASS");
