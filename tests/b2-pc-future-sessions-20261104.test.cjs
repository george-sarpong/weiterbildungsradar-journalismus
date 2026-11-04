"use strict";
// PC-COLLEGE source-exact course identifiers ILL, PSG, PRE, verified 2026-11-04.
// Source: pc-college.ch course URL ILL/PRE; official pc-college.de PSG timetable. Dates are NOT seat confirmations.
const assert=require("node:assert/strict"),fs=require("node:fs");
const s=fs.readFileSync("data.js","utf8");const data=JSON.parse(s.slice(s.indexOf("["),s.lastIndexOf("]")+1));
const byId=Object.fromEntries(data.map(o=>[o.id,o]));assert.equal(data.length,1352);assert.equal(Object.keys(byId).length,1352);
const expected={"PCC-P03":["2027-01-06","2027-02-03","2027-03-03","2027-03-31","2027-04-28","2027-05-26","2027-06-23","2027-07-21","2027-08-18","2027-09-15","2027-10-13","2027-11-10"],"PCC-P05":["2027-01-06","2027-01-11","2027-02-03","2027-03-03","2027-03-31","2027-04-28","2027-05-24","2027-05-26","2027-06-23","2027-07-21","2027-08-18","2027-09-15","2027-10-13","2027-11-10","2027-12-08","2027-12-13"],"PCC-P06":["2027-01-25","2027-02-15","2027-03-22","2027-04-12","2027-05-18","2027-06-07","2027-07-12","2027-08-02","2027-09-06","2027-09-27","2027-10-27","2027-11-22","2027-12-20"]};
const codes={"PCC-P03":"ILL","PCC-P05":"PSG","PCC-P06":"PRE"};
const total={"PCC-P03":15,"PCC-P05":21,"PCC-P06":15};
for(const [id,starts] of Object.entries(expected)){
 const o=byId[id];assert.ok(o,id);assert.equal(o.sessions?.length,total[id]);
 assert.deepEqual(o.sessions.filter(x=>x.startDate.startsWith("2027")).map(x=>x.startDate),starts);
 for(const s of o.sessions.filter(x=>x.startDate>="2027-02-01")){
  assert.equal(s.availabilityStatus,undefined,id+" do not assume places available");
  assert.match(s.label,/Plätze nicht bestätigt/);
  assert.ok(s.label.includes(codes[id]));
 }
}
assert.equal(byId["PCC-P13"].sessions,undefined,"ACP versus ACD identity remains HOLD");
assert.equal(byId["PCC-P20"].sessions,undefined,"PDL versus PSI identity remains HOLD");
assert.equal(data.filter(o=>Array.isArray(o.sessions)).length,60);
assert.equal(data.reduce((n,o)=>n+(o.sessions?.length||0),0),304);
console.log("B2_PC_COLLEGE_3_OFFERS_38_NEW_FUTURE_EDITION_WINDOWS_PASS");
