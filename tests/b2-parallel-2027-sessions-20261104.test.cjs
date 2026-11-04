"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const s=fs.readFileSync("data.js","utf8");
const a=JSON.parse(s.slice(s.indexOf("["),s.lastIndexOf("]")+1)),byId=new Map(a.map(o=>[o.id,o]));
assert.equal(a.length,1352);assert.equal(byId.size,1352);
assert.equal(a.filter(o=>Array.isArray(o.sessions)).length,61);
assert.equal(a.reduce((n,o)=>n+(o.sessions?.length||0),0),308);
const dates={
  "PCC-P04": [
    "2027-01-18",
    "2027-02-01",
    "2027-02-08",
    "2027-02-22",
    "2027-03-15",
    "2027-03-31",
    "2027-04-05",
    "2027-04-19",
    "2027-05-10",
    "2027-05-24",
    "2027-05-31",
    "2027-06-14",
    "2027-07-05",
    "2027-07-19",
    "2027-07-26",
    "2027-08-09",
    "2027-08-30",
    "2027-09-13",
    "2027-09-20",
    "2027-10-04",
    "2027-10-25"
  ],
  "PCC-P07": [
    "2027-02-11",
    "2027-03-08",
    "2027-03-09",
    "2027-05-03",
    "2027-06-03",
    "2027-06-28",
    "2027-07-29",
    "2027-08-23",
    "2027-09-23",
    "2027-10-18",
    "2027-11-18"
  ],
  "PCC-P09": [
    "2027-02-11",
    "2027-04-08",
    "2027-05-03",
    "2027-06-03",
    "2027-07-01",
    "2027-07-29",
    "2027-08-26",
    "2027-09-23",
    "2027-10-21",
    "2027-11-18",
    "2027-12-16"
  ],
  "PCC-P11": [
    "2027-01-14",
    "2027-02-11",
    "2027-04-08",
    "2027-05-03",
    "2027-06-03",
    "2027-07-01",
    "2027-07-29",
    "2027-08-26",
    "2027-09-23",
    "2027-10-21",
    "2027-11-18",
    "2027-12-16"
  ],
  "PCC-P12": [
    "2027-02-22",
    "2027-03-30",
    "2027-04-19",
    "2027-05-24",
    "2027-06-14",
    "2027-07-19",
    "2027-08-09",
    "2027-10-04",
    "2027-11-04"
  ],
  "MW-P07": [
    "2027-10-04"
  ],
  "MW-P08": [
    "2026-11-11",
    "2027-01-11",
    "2027-03-10",
    "2027-05-10",
    "2027-07-09",
    "2027-09-10",
    "2027-11-10"
  ],
  "MW-P09": [
    "2026-11-23",
    "2027-02-22",
    "2027-05-18",
    "2027-08-23",
    "2027-11-04"
  ]
};
const totals={
  "PCC-P04": 25,
  "PCC-P07": 14,
  "PCC-P09": 14,
  "PCC-P11": 15,
  "PCC-P12": 12,
  "MW-P07": 4,
  "MW-P08": 7,
  "MW-P09": 5
};
for(const [id,starts] of Object.entries(dates)){
 const o=byId.get(id);assert.ok(o,id);
 assert.equal(o.sessions.length,totals[id],id);
 const seen=new Set(o.sessions.map(x=>x.startDate+"|"+x.endDate));
 assert.equal(seen.size,o.sessions.length,id+" duplicate edition");
 for(const date of starts){
  const rows=o.sessions.filter(x=>x.startDate===date);assert.equal(rows.length,1,id+" date "+date);
  assert.equal(rows[0].availabilityStatus,undefined,id+" no seat guarantee");
  assert.match(rows[0].label,/Plätze.*nicht bestätigt/,id);
 }
}
assert.equal(byId.get("PCC-P13").sessions,undefined,"ACP/ACD alias HOLD");
assert.equal(byId.get("PCC-P20").sessions,undefined,"PDL/PSI alias HOLD");
assert.equal(byId.get("IF-G12").sessions.length,2,"ifage already correct");
assert.equal(byId.get("V58-S1-04").sessions[0].availabilityStatus,"SOLD_OUT");
console.log("B2_8_OFFERS_77_SOURCE_EXACT_NEW_SESSIONS_1352_IDS_60_PARENTS_304_ROWS_PASS");
