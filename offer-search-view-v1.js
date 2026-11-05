"use strict";
/*
 * B4 typed search view, source-preserving, read-only. This is NOT a
 * source verification or a batch update of legacy course records.
 * Deliberately no country, CH access, city, FX or seat-status inference
 * from provider headquarters / free text / missing values.
 */
(function(root,factory){
 const api=factory();
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 if(root)root.MEDIA_SKILLS_OFFER_VIEW=api;
})(typeof window!=="undefined"?window:null,function(){
 const ACCESS=new Set(["YES","CONDITIONAL","NO","UNKNOWN"]);
 const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
   .toLocaleLowerCase("de-CH").replace(/\s+/g," ").trim();
 const nonempty=s=>typeof s==="string"&&s.trim().length>0;
 const validHttps=s=>typeof s==="string"&&/^https:\/\/[^/\s]+(?:\/|$)/i.test(s);
 function eligibility(o){
   const value=o?.accessModel?.chEligibility;
   const proof=o?.sourceEvidence;
   const supported=ACCESS.has(value)&&validHttps(proof?.url)
     &&Array.isArray(proof?.verifiedFields)&&proof.verifiedFields.includes("access");
   return {
     chEligibility:supported?value:"UNKNOWN",
     evidenceTier:supported?"FIELD_SOURCE_REVIEWED":"LEGACY_UNSTRUCTURED",
     conditions:supported?String(o.accessModel.conditions||""):String(o.access||"")
   };
 }
 function venues(o){
   const list=Array.isArray(o?.deliveryLocations)?o.deliveryLocations:[];
   const seen=new Set(),out=[];
   for(const venue of list){
     if(!venue||venue.status!=="VERIFIED"||!validHttps(venue.sourceUrl)
       ||venue.kind!=="IN_PERSON"||!nonempty(venue.city)||!nonempty(venue.country))continue;
     const key=norm(venue.city)+"|"+venue.country;
     if(seen.has(key))continue;
     seen.add(key);
     out.push({city:venue.city.trim(),key:norm(venue.city),country:venue.country,
       label:String(venue.label||venue.city).trim(),sourceUrl:venue.sourceUrl,status:"VERIFIED"});
   }
   return out;
 }
 function project(offer,sidecar,durationModel){
   if(!nonempty(offer?.id))throw Error("Typed view requires stable offer id");
   const duration=durationModel?.fromRecord?durationModel.fromRecord(offer)
     :{status:"UNKNOWN",minDays:null,maxDays:null,source:"MISSING_DURATION_MODEL"};
   const price=sidecar||{};
   const source=offer.sourceEvidence||null;
   return {
     id:offer.id,
     provider:{name:offer.provider,country:offer.providerCountry||null},
     catalogueCountry:offer.country||null,
     topic:offer.focus||null,
     audienceAccess:eligibility(offer),
     learningTime:{raw:offer.duration||"",...duration},
     venues:venues(offer),
     delivery:{evidenceTier:price.delivery?.evidenceTier||"UNKNOWN",
       modes:Array.isArray(price.delivery?.channels)?price.delivery.channels:[]},
     price:{parserStatus:price.parserStatus||"NOT_PRESENT",
       priceEligible:price.priceEligible===true,
       options:Array.isArray(price.priceOptions)?price.priceOptions:[]},
     occurrences:Array.isArray(offer.sessions)?offer.sessions.map(s=>({
       startDate:s.startDate||null,endDate:s.endDate||null,
       regionText:s.region||null,availabilityStatus:s.availabilityStatus||"UNKNOWN",
       sourceOccurrenceId:s.sourceOccurrenceId||null
     })):[],
     source:{url:offer.url||null,checkedAt:source?.checkedAt||null,
       verifiedFields:source?.verifiedFields||[]},
     status:offer.publicationStatus==="HOLD"?"HOLD":"ACTIVE"
   };
 }
 function build(offers,byId,durationModel){
   if(!Array.isArray(offers)||!byId||typeof byId!=="object")throw Error("Invalid typed view input");
   const index=Object.create(null),cities=new Map();
   const summary={offers:offers.length,sourceSidecarIds:Object.keys(byId).length,
     legacyAccessUnknown:0,structuredCHAccess:0,verifiedCityOffers:0,
     durationExplicitDays:0,verifiedDelivery:0,priceEligible:0,
     occurrences:0,missingSidecars:0};
   for(const offer of offers){
     if(Object.prototype.hasOwnProperty.call(index,offer.id))throw Error("Duplicate stable ID: "+offer.id);
     const sidecar=byId[offer.id];
     if(!sidecar)summary.missingSidecars++;
     const record=project(offer,sidecar,durationModel);
     index[offer.id]=record;
     if(record.audienceAccess.evidenceTier==="FIELD_SOURCE_REVIEWED")summary.structuredCHAccess++;
     else summary.legacyAccessUnknown++;
     if(record.venues.length)summary.verifiedCityOffers++;
     for(const city of record.venues)if(!cities.has(city.key))cities.set(city.key,city.city);
     if(record.learningTime.status==="KNOWN")summary.durationExplicitDays++;
     if(record.delivery.evidenceTier==="VERIFIED")summary.verifiedDelivery++;
     if(record.price.priceEligible)summary.priceEligible++;
     summary.occurrences+=record.occurrences.length;
   }
   if(Object.keys(index).length!==offers.length||summary.missingSidecars
     ||Object.keys(byId).length!==offers.length)
     throw Error("Typed view/sidecar identity drift "+JSON.stringify(summary));
   return {byId:index,summary,cityOptions:[...cities].sort((a,b)=>a[1].localeCompare(b[1],"de-CH"))
     .map(([key,label])=>({key,label}))};
 }
 const matchAccess=(record,value)=>!value||Boolean(record)
   &&record.audienceAccess.chEligibility===value;
 const matchCity=(record,value)=>!value||Boolean(record)
   &&record.venues.some(x=>x.key===norm(value));
 return Object.freeze({project,build,matchAccess,matchCity,normalizeCity:norm});
});
