"use strict";
// B2 05.11.2026: exact source-backed Austrian JKU access and Klagenfurt admissions.
// https://www.jku.at/studium/studieninteressierte/anmeldung-zum-studium/erweiterungsstudium/
// https://www.aau.at/studien/master-kreatives-schreiben-und-schreibkulturen/
// Do not imply Swiss citizenship is sufficient for JKU; do not infer semester teaching start.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const src=fs.readFileSync("data.js","utf8");
const offers=JSON.parse(src.slice(src.indexOf("["),src.lastIndexOf("]")+1));
const byId=new Map(offers.map(o=>[o.id,o]));
assert.equal(offers.length,1352);
assert.equal(byId.size,1352);
assert.equal(offers.reduce((n,o)=>n+(o.sessions?.length||0),0),325);
const jku=byId.get("AT-PROD-OFFER-144");
assert.ok(jku);
assert.match(jku.access,/JKU Linz/);
assert.match(jku.access,/120 ECTS/);
assert.match(jku.access,/80 ECTS/);
assert.match(jku.access,/Schweizer Staatsangehörigkeit allein genügt nicht/);
assert.equal(jku.startDate,"");
const aau=byId.get("AT-PROD-OFFER-098");
assert.ok(aau);
assert.match(aau.start,/Sommersemester 2027/);
assert.ok(aau.start.includes("08.01.2027") && aau.start.includes("31.03.2027"), "AAU official application period");
assert.match(aau.start,/Deutsch C1/);
assert.match(aau.start,/Exakter Studien- und Unterrichtsbeginn nicht publiziert/);
assert.equal(aau.startDate,"");
assert.equal(aau.priceCategory,"PREIS_NICHT_PUBLIZIERT");
console.log("B2_AT_JKU_ACCESS_AND_AAU_SUMMER2027_SOURCE_PASS");
