"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const {validate,project}=require("../scripts/catalogue-ingest-v1.cjs");
const typed=require("../offer-search-view-v1.js"),duration=require("../duration-model.js");
const seed=JSON.parse(fs.readFileSync("tests/fixtures/b3-import-demo.json","utf8"));
const rows=Array.from({length:250},(_,i)=>{
  const o=structuredClone(seed.offers[0]);
  o.id="B4-HETERO-"+String(i).padStart(4,"0");
  o.title="Synthetisches journalistisches Lernangebot "+i;
  o.occurrences[0].id=o.id+"-2027";
  const family=i%5;
  const nations=["CH","DE","AT","US","LI"];
  o.provider.country=nations[family];
  if(family===0||family===2){
    o.deliveryVariants[0].mode="IN_PERSON";
    o.deliveryVariants[0].location={kind:"IN_PERSON",label:"Kursort Basel",city:"Basel",country:"CH"};
    o.occurrences[0].venue={kind:"IN_PERSON",label:"Kursort Basel",city:"Basel",country:"CH"};
  }
  if(family===1){
    o.prices=[{...o.prices[0],amountType:"FREE",amount:0,currency:null,taxMode:"NOT_APPLICABLE"}];
  }
  if(family===2){
    o.access={chEligibility:"CONDITIONAL",conditions:"Dokumentierte Anmeldung erforderlich"};
    o.prices=[{...o.prices[0],amountType:"FROM",amount:300,currency:"EUR",tariffClass:"CONDITIONAL",
      eligibilityType:"PROFESSION",eligibilityValue:"Journalist:innen"}];
  }
  if(family===3){
    o.deliveryVariants[0].mode="ON_DEMAND";
    o.deliveryVariants[0].location={kind:"ONLINE",label:"Selbstlernen",city:null,country:null};
    o.occurrences=[];
    const p={...o.prices[0],amountType:"NOT_PUBLISHED",amount:null,currency:null};
    o.prices=[p];
  }
  if(family===4){
    o.reviewStatus="HOLD";o.scopeDecision="HOLD";
    o.access={chEligibility:"UNKNOWN",conditions:"Nicht extern bestätigt"};
  }
  return o;
});
const batch={...seed,batchId:"B4_HETEROGENEOUS_250_20261105",offers:rows};
assert.deepEqual(validate(batch),[]);
const projected=project(batch),offers=projected.map(x=>x.offer);
const join=Object.fromEntries(projected.map(x=>[x.offer.id,x.sidecar]));
const index=typed.build(offers,join,duration);
assert.equal(index.summary.offers,250);
assert.equal(index.summary.occurrences,200);
assert.equal(index.summary.verifiedCityOffers,100);
assert.equal(index.summary.priceEligible,150);
assert.equal(index.summary.missingSidecars,0);
assert.equal(new Set(offers.map(o=>o.id)).size,250);
assert.ok(offers.every(o=>o.publicationStatus==="HOLD"),"No import authorizes publication");
for(let i=0;i<250;i++){
 const o=offers[i],t=index.byId[o.id],p=projected[i].sidecar;
 assert.equal(o.providerCountry,rows[i].provider.country);
 assert.equal(t.status,"HOLD");
 if(i%5===0||i%5===2){
   assert.equal(o.deliveryCountry,"CH");
   assert.equal(o.country,"Schweiz");
   assert.equal(t.venues.length,1);
 }else{
   assert.equal(o.deliveryCountry,null,"Provider seat must not become delivery country");
   assert.equal(o.country,"Nicht publiziert");
   assert.equal(t.venues.length,0);
 }
 if(i%5===3||i%5===4){
   assert.equal(p.priceEligible,false);
 }else{
   assert.equal(p.priceEligible,true);
 }
}
const bad=structuredClone(batch);
bad.offers[249].title=bad.offers[0].title;
assert.ok(validate(bad).some(x=>x.includes("duplicate provider/title identity"))===false,
  "Cross-provider title equality alone must not trigger a collision");
const badSameProvider=structuredClone(batch);
badSameProvider.offers[245].title=badSameProvider.offers[0].title;
assert.ok(validate(badSameProvider).some(x=>x.includes("duplicate provider/title identity")));
const overflow=structuredClone(batch);
overflow.offers.push({...structuredClone(rows[0]),id:"B4-HETERO-0250"});
assert.ok(validate(overflow).some(x=>x.includes("1..250")));
console.log("B4_HETEROGENEOUS_250_SAFETY_PASS",JSON.stringify({offers:250,priceEligible:150,venues:100,occurrences:200,allHeld:true}));
