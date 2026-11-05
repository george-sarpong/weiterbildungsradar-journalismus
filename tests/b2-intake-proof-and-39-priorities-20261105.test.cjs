"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const app=fs.readFileSync("app.js","utf8");
const src=fs.readFileSync("data.js","utf8");
const roster=JSON.parse(src.slice(src.indexOf("["),src.lastIndexOf("]")+1));
const by=new Map(roster.map(x=>[x.id,x]));
assert.equal(roster.length,1352);assert.equal(by.size,1352);
const a=app.indexOf("  const startedButRunning = offer => {");
const b=app.indexOf("  // Ausgelaufene Präsenz-Sessions",a);
assert.ok(a>0&&b>a);
const code=app.slice(a,b);
const funcs=vm.runInNewContext("(()=>{const ISO_DATE=/^\\d{4}-\\d{2}-\\d{2}$/;"+
  "const parseDate=v=>ISO_DATE.test(String(v??'').trim())?new Date(String(v).trim()+'T23:59:59'):null;"+
  "const today=new Date(2026,10,5);"+code+
  "return {startedButRunning,intakeNotConfirmed,bookingStatusUnconfirmed};})()");
const dj=roster.filter(x=>x.id.startsWith("OFFER-DJA-"));
assert.equal(dj.length,22);
assert.equal(dj.filter(funcs.intakeNotConfirmed).length,21,"Only 21 explicitly unpublished intakes");
assert.equal(funcs.intakeNotConfirmed(by.get("OFFER-DJA-001")),false,"Known 01.11 programme not blindly blocked");
assert.equal(funcs.intakeNotConfirmed(by.get("OFFER-DJA-009")),true);
assert.equal(funcs.intakeNotConfirmed(by.get("OFFER-MAZ-077")),false);
assert.equal(funcs.bookingStatusUnconfirmed(by.get("OFFER-DJA-009")),true);
assert.equal(funcs.bookingStatusUnconfirmed(by.get("OFFER-MAZ-077")),false);
assert.ok(app.includes("Kein neuer offener Start bestätigt"),"No user-facing intake warning");
assert.ok(app.includes('durationDirect(item) && !bookingStatusUnconfirmed(item.offer)'));
assert.ok(app.includes('durationDirect(item) && bookingStatusUnconfirmed(item.offer)'));
const dawan=by.get("V82-DAWAN-049");
assert.equal(dawan.sessions.length,4);
assert.ok(dawan.sessions[1].label.includes("05.11.2026 bestätigt"),"Newly re-confirmed Nov30 edition lost");
assert.ok(dawan.sessions[1].label.includes("Plätze nicht bestätigt"));
const rows=fs.readFileSync("docs/b2/near-term-39-20261105.tsv","utf8").trim().split("\n");
assert.equal(rows.length,40,"39 distinct source-risk rows + header");
const ids=rows.slice(1).map(row=>row.split("\t")[0]);
assert.equal(new Set(ids).size,39);
assert.ok(ids.every(id=>by.has(id)),"Risk queue contains ID absent from canonical roster");
assert.ok(!app.includes("Nächster Start ist garantiert"));
console.log("B2_DJA_21_INTAKES_DAWAN_RECONFIRMED_39_RISK_IDS_PASS");
