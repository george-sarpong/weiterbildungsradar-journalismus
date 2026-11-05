"use strict";
// B2 05.11.2026: official source-specific offer URL/focus, VSM conditional price, started-course enrollment risk.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const txt=fs.readFileSync("data.js","utf8");
const roster=JSON.parse(txt.slice(txt.indexOf("["),txt.lastIndexOf("]")+1));
const byId=new Map(roster.map(o=>[o.id,o]));
const src=fs.readFileSync("smart-search-data.js","utf8");
const side=JSON.parse(src.slice(src.indexOf("{"),src.lastIndexOf("}")+1)).byId;
const app=fs.readFileSync("app.js","utf8");
assert.equal(roster.length,1352); assert.equal(byId.size,1352);
assert.equal(Object.keys(side).length,1352);
assert.equal(roster.reduce((n,o)=>n+(o.sessions?.length||0),0),325);
assert.equal(byId.get("OFFER-MAZ-044").focus,"JOURNALISMUS");
assert.equal(byId.get("OFFER-MAZ-135").url,"https://www.maz.ch/kurs/recherche-in-oeffentlichen-registern-j");
assert.equal(byId.get("V59-SZ01").url,"https://schreibszene.ch/das-gelungene-interview/");
const price=side["OFFER-VSM-001"];
assert.equal(price.parserStatus,"AUTO_ACCEPT"); assert.equal(price.priceEligible,true);
assert.equal(price.priceOptions.length,3);
assert.deepEqual(price.priceOptions.map(p=>[p.amountType,p.amount,p.eligibilityType,p.taxMode]),[
  ["EXACT",250,"NONE","EXCLUDED"],
  ["EXACT",150,"UNKNOWN","EXCLUDED"],
  ["FREE",0,"PROFESSION","UNSPECIFIED"]]);
assert.equal(price.priceOptions[2].eligibilityValue,"JOURNALIST");
assert.equal(price.priceOptions.filter(p=>p.amountType==="FREE"&&p.eligibilityType==="NONE").length,0);
const begin=app.indexOf("  const startedButRunning = offer => {");
const end=app.indexOf("  // Ausgelaufene Präsenz-Sessions",begin);
assert.ok(begin>0&&end>begin);
const snippet=app.slice(begin,end);
const scope = "(function() {"+
  "const ISO_DATE=/^\\d{4}-\\d{2}-\\d{2}$/;"+
  "const parseDate=value=>ISO_DATE.test(String(value??'').trim()) ? new Date(String(value).trim()+'T23:59:59') : null;"+
  "const today=new Date(2026,10,5);"+snippet+"return startedButRunning;})()";
const startedButRunning=vm.runInNewContext(scope);
const running=roster.filter(o=>o.publicationStatus!=="HOLD"&&startedButRunning(o));
assert.equal(running.length,60);
assert.ok(startedButRunning(byId.get("OFFER-MAZ-075")));
assert.ok(!startedButRunning(byId.get("OFFER-MAZ-077")));
assert.ok(!startedButRunning(byId.get("OFFER-MAZ-005")));
assert.ok(!startedButRunning(byId.get("OFFER-CFJM-019")));
assert.ok(app.includes('const durationDirect = item => parsed.maxDays == null || item.durationFit.status === "FIT"'));
assert.ok(app.includes('durationDirect(item) && !bookingStatusUnconfirmed(item.offer)'));
assert.ok(app.includes('&& item.budget.status === "DIRECT_FIT"'));
assert.ok(app.includes('const bookingAlternatives = parsed.tokens.length'));
assert.ok(app.includes('alternativeReason: "BOOKING"'));
assert.ok(app.includes("Eine Neuanmeldung oder ein Späteinstieg ist nicht bestätigt"));
console.log("B2_NEAR_TERM_LINK_FOCUS_VSM_AND_STARTED_BOOKING_GUARD_PASS");
