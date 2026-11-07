"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const d=require("../duration-model.js");
for(const [text,min,max] of [
 ["2 Tage",2,2],["1 Tag",1,1],["1–2 Tage / 14 Stunden",1,2],
 ["2 Kurstage",2,2],["2 jours",2,2],["2 days",2,2],["0,5 Tage",0.5,0.5],
 ["3 Tage / 21 Stunden",3,3]
]) {
 const p=d.fromText(text);assert.equal(p.status,"KNOWN",text);assert.equal(p.minDays,min,text);assert.equal(p.maxDays,max,text);
}
for(const value of ["", "16 Stunden", "3–6 Monate", "2 Tage pro Woche",
 "3 mal 2 Tage", "2 Tage / 1 Tag", "ca. 2 Tage", "2 Tage / 3 Wochen"])
 assert.equal(d.fromText(value).status,"UNKNOWN",value);
assert.equal(d.classify({duration:"2 Tage"},2).status,"FIT");
assert.equal(d.classify({duration:"3 Tage"},2).status,"OVER");
assert.equal(d.classify({duration:"3 Tage"},2,true).status,"NEAR");
assert.equal(d.classify({duration:"2–3 Tage"},2).status,"POSSIBLE");
assert.equal(d.classify({duration:"16 Stunden"},2).status,"UNKNOWN");
assert.equal(d.classify({duration:"12 Tage"},2,true).status,"OVER");
assert.equal(d.classify({duration:"2 Tage",learningTime:{instructionDays:{min:1,max:3,status:"VERIFIED"}}},2).status,"POSSIBLE");
const html=fs.readFileSync("index.html","utf8");
assert.ok(html.indexOf("duration-model.js")<html.indexOf("app.js")&&html.includes("duration-model.js"));
const app=fs.readFileSync("app.js","utf8");
assert.ok(app.includes('durationFit = DURATION_MODEL.classify'));
assert.ok(app.includes('durationDirect(item)'));
assert.ok(app.includes('alternativeReason: "DAUER"'));
assert.ok(app.includes("Kursdauer nicht sicher passend"));
assert.ok(app.includes(" · angewendet"));
console.log("B3_DURATION_STRICT_KURSTAGE_BUDGET_APPLICATION_PASS");
