"use strict";
/* Deterministic legacy catalog coverage report. Read-only, no research or updates. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const body=fs.readFileSync(path.join(root,"data.js"),"utf8");
const sideBody=fs.readFileSync(path.join(root,"smart-search-data.js"),"utf8");
const offers=JSON.parse(body.slice(body.indexOf("["),body.lastIndexOf("]")+1));
const side=JSON.parse(sideBody.slice(sideBody.indexOf("{"),sideBody.lastIndexOf("}")+1));
const model=require("../offer-search-view-v1.js"),duration=require("../duration-model.js");
const built=model.build(offers,side.byId,duration);
const byCountry={},access={YES:0,CONDITIONAL:0,NO:0,UNKNOWN:0};
for(const offer of offers){
 byCountry[offer.country]=(byCountry[offer.country]||0)+1;
 access[built.byId[offer.id].audienceAccess.chEligibility]++;
}
if(built.summary.offers!==offers.length||Object.keys(built.byId).length!==offers.length)
 throw Error("Typed view join/invariant failure");
const output={
 projection:"B4_TYPED_READONLY_V1",
 note:"NOT source Gold; UNKNOWN values never imply invalid legacy courses",
 offerCount:offers.length,sessionCount:built.summary.occurrences,
 sidecarJoin:built.summary.sourceSidecarIds,typedView:built.summary,
 providerCountryNotGuaranteed:true,
 countryLabelsInLegacy:byCountry,access,
 originalShas:{
  offerDataSha256:crypto.createHash("sha256").update(body).digest("hex"),
  sidecarSha256:crypto.createHash("sha256").update(sideBody).digest("hex")
 }
};
console.log(JSON.stringify(output,null,2));
