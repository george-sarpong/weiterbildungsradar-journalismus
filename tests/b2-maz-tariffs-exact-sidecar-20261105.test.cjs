"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const data=fs.readFileSync("data.js","utf8"),smart=fs.readFileSync("smart-search-data.js","utf8");
const offers=JSON.parse(data.slice(data.indexOf("["),data.lastIndexOf("]")+1));
const side=JSON.parse(smart.slice(smart.indexOf("{"),smart.lastIndexOf("}")+1));
const offerMap=new Map(offers.map(o=>[o.id,o]));
assert.equal(offers.length,1352);assert.equal(offerMap.size,1352);
assert.equal(Object.keys(side.byId).length,1352);
for(const [id,regular,journalist] of [
 ["OFFER-MAZ-077",4250,3100],
 ["OFFER-MAZ-100",380,290]
]){
 const offer=offerMap.get(id),p=side.byId[id];
 assert.ok(offer&&p,id+" missing");
 assert.equal(p.parserStatus,"AUTO_ACCEPT");
 assert.equal(p.priceEligible,true);
 assert.equal(p.priceOptions.length,2);
 assert.equal(p.priceOptions[0].amount,regular);
 assert.equal(p.priceOptions[0].amountType,"EXACT");
 assert.equal(p.priceOptions[0].tariffClass,"REGULAR");
 assert.equal(p.priceOptions[0].eligibilityType,"NONE");
 assert.equal(p.priceOptions[1].amount,journalist);
 assert.equal(p.priceOptions[1].tariffClass,"CONDITIONAL");
 assert.equal(p.priceOptions[1].eligibilityType,"PROFESSION");
 assert.equal(p.priceOptions[1].eligibilityValue,"JOURNALIST");
 assert.ok(p.priceOptions.every(x=>x.currency==="CHF"
     &&x.priceScope==="FULL_OFFER"&&x.billingBasis==="TOTAL"
     &&x.taxMode==="UNSPECIFIED"&&x.components.length===0));
 assert.ok(offer.priceDisplay.includes(String(regular).replace(/\B(?=(\d{3})+(?!\d))/g,"'"))
       ||offer.priceDisplay.includes(String(regular)));
 assert.ok(p.delivery.evidenceTier!=="VERIFIED",
     "Price proof must not promote delivery source Gold");
 assert.ok(!offer.publicationStatus || offer.publicationStatus!=="HOLD");
}
assert.equal(side.byId["OFFER-MAZ-080"].priceEligible,false,
 "Conflicted historical/canonical price variants require separate review");
assert.equal(side.byId["OFFER-MAZ-080"].priceOptions.length,0);
assert.equal(side.byId["OFFER-MAZ-146"].priceOptions[0].amount,1300,
 "Do not silently overwrite 1300 with stale 1060 source");
console.log("B2_MAZ_2_PRICE_SIDECAR_GUARDED_PASS",JSON.stringify({
   roster:offers.length,sidecar:Object.keys(side.byId).length,
   changedPriceIds:["OFFER-MAZ-077","OFFER-MAZ-100"],
   stillHeld:["OFFER-MAZ-080"],noReleaseClaim:true
}));
