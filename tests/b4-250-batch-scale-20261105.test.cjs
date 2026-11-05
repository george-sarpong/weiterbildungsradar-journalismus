"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const {validate,project}=require("../scripts/catalogue-ingest-v1.cjs");
const view=require("../offer-search-view-v1.js"),duration=require("../duration-model.js");
const fixture=JSON.parse(fs.readFileSync("tests/fixtures/b3-import-demo.json","utf8"));
const one=fixture.offers[0];
const many=Array.from({length:250},(_,i)=>{
 const o=structuredClone(one);
 o.id="CH-B4-BULK-"+String(i).padStart(4,"0");
 o.title="Journalistische Datenarbeit "+i;
 o.occurrences[0].id=o.id+"-2027";
 o.reviewAfter="2027-01-01";
 return o;
});
const batch={...fixture,batchId:"B4_BULK_250_TEST",offers:many};
const start=process.hrtime.bigint();
assert.deepEqual(validate(batch),[],"Every 250-item import batch validates");
const items=project(batch);
assert.equal(items.length,250);
const all=items.map(x=>x.offer);
const byId=Object.fromEntries(items.map(x=>[x.offer.id,x.sidecar]));
const index=view.build(all,byId,duration);
assert.equal(index.summary.offers,250);
assert.equal(index.summary.structuredCHAccess,250);
assert.equal(index.summary.occurrences,250);
assert.equal(index.summary.priceEligible,250);
assert.equal(new Set(all.map(x=>x.id)).size,250);
assert.equal(index.summary.legacyAccessUnknown,0);
assert.ok(all.every(o=>o.providerCountry==="CH"&&o.deliveryCountry===null
 &&o.country==="Nicht publiziert"&&o.publicationStatus==="HOLD"));
const over=structuredClone(batch);over.offers.push({...structuredClone(many[0]),id:"CH-B4-BULK-1000"});
assert.ok(validate(over).some(s=>s.includes("1..250")),"Oversize batch must fail");
const dup=structuredClone(batch);dup.offers[249].title=dup.offers[0].title;
assert.ok(validate(dup).some(s=>s.includes("duplicate provider/title identity")));
const elapsedMs=Number(process.hrtime.bigint()-start)/1e6;
console.log("B4_250_REAL_SCHEMA_IMPORT_AND_TYPED_INDEX_PASS "+JSON.stringify({
 count:all.length,elapsedMs:Math.round(elapsedMs),scope:"SYNTHETIC_ONLY"
}));
