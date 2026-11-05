"use strict";
/* Mass import contract: independently sourced offers -> validated typed records
 * -> preview -> opt-in materialization, never silently publish or alter the master.
 * No dependencies beyond Node.js and no network calls. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),crypto=require("node:crypto");
const schema=require("../schemas/media-skills-batch-v1.schema.json");
const COUNTRIES={CH:"Schweiz",DE:"Deutschland",AT:"Österreich",LI:"Liechtenstein",US:"USA"};
const HTTPS=/^https:\/\/[^/\s]+\//i;
const validDate=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)
  &&!Number.isNaN(Date.parse(x))&&new Date(x+"T00:00:00Z").toISOString().slice(0,10)===x;
const isText=x=>typeof x==="string"&&x.trim().length>0;
const sha256=s=>crypto.createHash("sha256").update(s).digest("hex");
const fingerprint=o=>{
 const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
   .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
 return norm(o.provider?.name)+"|"+norm(o.title);
};
const checkKeys=(x,allowed,id,label,add)=>{
 if(!x||typeof x!=="object"||Array.isArray(x)){add(id,label+" must be object");return}
 for(const k of Object.keys(x))if(!allowed.includes(k))add(id,label+" unknown field "+k);
};
const known=(x,items)=>items.includes(x);
function validate(batch,existingIds=new Set(),existingFingerprints=new Set()){
 const errors=[];
 const add=(id,msg)=>errors.push(id+": "+msg);
 if(!batch||batch.schemaVersion!=="MEDIA_SKILLS_BATCH_V1")add("BATCH","unknown schemaVersion");
 if(!/^[A-Z0-9][A-Z0-9_-]{4,80}$/.test(batch?.batchId||""))add("BATCH","invalid batchId");
 if(!isText(batch?.reviewer)||batch.reviewer.length<3)add("BATCH","reviewer missing");
 if(!Array.isArray(batch?.offers)||!batch.offers.length||batch.offers.length>250){add("BATCH","offers must have 1..250 entries");return errors}
 checkKeys(batch,Object.keys(schema.properties),"BATCH","batch",add);
 const seen=new Set(),semantic=new Set();
 const critical=["provider","title","focus","access","duration","delivery","price","availability"];
 for(const o of batch.offers){
  const id=o?.id||"<missing-id>";
  if(!/^[A-Z0-9][A-Z0-9_-]{4,99}$/.test(id))add(id,"invalid stable ID");
  if(seen.has(id)||existingIds.has(id))add(id,"duplicate stable offer ID; no automatic overwrite");seen.add(id);
  const fp=fingerprint(o);
  if(semantic.has(fp)||existingFingerprints.has(fp))add(id,"duplicate provider/title identity; model next editions as occurrences");
  semantic.add(fp);
  checkKeys(o,Object.keys(schema.definitions.offer.properties),id,"offer",add);
  checkKeys(o.provider,Object.keys(schema.definitions.provider.properties),id,"provider",add);
  checkKeys(o.access,Object.keys(schema.definitions.access.properties),id,"access",add);
  checkKeys(o.learningTime,Object.keys(schema.definitions.learningTime.properties),id,"learningTime",add);
  if(o.learningTime?.instructionDays)checkKeys(o.learningTime.instructionDays,Object.keys(schema.definitions.learningTime.properties.instructionDays.properties),id,"instructionDays",add);
  checkKeys(o.source,Object.keys(schema.definitions.source.properties),id,"source",add);

  if(!isText(o.title)||!isText(o.description)||!isText(o.level))add(id,"title/description/level required");
  if(!known(o.focus,["JOURNALISMUS","MEDIENPRAXIS","MANAGEMENT","MEDIENRECHT","SICHERHEIT","MODERATION"]))add(id,"unknown focus");
  if(!known(o.offerType,["KURS","PROGRAMM","STUDIUM","EVENT"]))add(id,"unknown offerType");
  if(!known(o.provider?.country,Object.keys(COUNTRIES))||!isText(o.provider?.name)||!isText(o.provider?.id))add(id,"invalid provider/country");
  if(!Array.isArray(o.languages)||!o.languages.length||o.languages.some(x=>!known(x,["DE","FR","IT","EN"])))add(id,"language not normalized");
  if(!validDate(o.reviewAfter))add(id,"reviewAfter invalid");
  if(!known(o.access?.chEligibility,["YES","CONDITIONAL","NO","UNKNOWN"])||typeof o.access?.conditions!=="string")add(id,"CH eligibility / access conditions missing");
  if(!isText(o.learningTime?.raw))add(id,"duration raw missing");
  const days=o.learningTime?.instructionDays;
  if(days!=null&&(!Number.isFinite(days.min)||!Number.isFinite(days.max)||days.min<=0||days.max<days.min||days.status!=="VERIFIED"))add(id,"invalid verified instruction-day range");
  if(!known(o.scopeDecision,["IN_SCOPE","HOLD"])||!known(o.reviewStatus,["REVIEWED","HOLD"]))add(id,"scope/review state absent");
  const src=o.source;
  if(!HTTPS.test(src?.url||"")||!validDate(src?.checkedAt)||!Array.isArray(src?.verifiedFields))add(id,"primary source / checkedAt / evidence missing");
  if(o.reviewStatus==="REVIEWED"&&o.scopeDecision==="IN_SCOPE"){
    for(const f of critical)if(!src?.verifiedFields?.includes(f))add(id,"missing field-level source proof: "+f);
    if(o.access?.chEligibility==="UNKNOWN"||o.access?.chEligibility==="NO")add(id,"source-reviewed offer cannot claim confirmed CH participation");
  }
  const variants=o.deliveryVariants;
  if(!Array.isArray(variants)||!variants.length)add(id,"delivery variants missing");
  const vIds=new Set();
  for(const v of variants||[]){
   checkKeys(v,Object.keys(schema.definitions.variant.properties),id,"delivery variant",add);
   checkKeys(v.location,Object.keys(schema.definitions.location.properties),id,"delivery location",add);
   if(!isText(v.id)||vIds.has(v.id))add(id,"invalid/duplicate delivery variant");vIds.add(v.id);
   if(!known(v.mode,["IN_PERSON","LIVE_ONLINE","ON_DEMAND","HYBRID"]))add(id,"invalid delivery mode");
   if(!HTTPS.test(v.sourceUrl||""))add(id,"delivery source required");
   if(!known(v.location?.kind,["IN_PERSON","ONLINE","UNSPECIFIED"])||!isText(v.location?.label))add(id,"real venue/online must be classified");
   if(v.location?.country!=null&&!known(v.location.country,Object.keys(COUNTRIES)))add(id,"delivery country outside approved MVP");
   if(v.mode==="IN_PERSON"&&(v.location?.kind!=="IN_PERSON"||!v.location?.country))add(id,"in-person requires evidenced delivery country");
  }
  if(!Array.isArray(o.prices))add(id,"prices array missing");
  for(const p of o.prices||[]){
    checkKeys(p,Object.keys(schema.definitions.price.properties),id,"price",add);
    if(!known(p.amountType,["EXACT","RANGE","FREE","FROM","ON_REQUEST","NOT_PUBLISHED"]))add(id,"invalid amountType");
    if(!known(p.tariffClass,["REGULAR","CONDITIONAL"])||!known(p.eligibilityType,["NONE","MEMBERSHIP","PROFESSION","STUDENT","OTHER"]))add(id,"tariff eligibility missing");
    if(!known(p.priceScope,["FULL_OFFER","PARTIAL","UNKNOWN"])||!known(p.billingBasis,["TOTAL","PER_DAY","PER_SEMESTER","UNKNOWN"]))add(id,"scope/basis missing");
    if(!known(p.taxMode,["INCLUDED","EXCLUDED","NOT_APPLICABLE","UNSPECIFIED"]))add(id,"tax mode missing");
    if(!HTTPS.test(p.sourceUrl||""))add(id,"price evidence URL missing");
    if(["EXACT","FROM"].includes(p.amountType)&&(!Number.isFinite(p.amount)||p.amount<0||!known(p.currency,["CHF","EUR","USD"])))add(id,"invalid priced amount");
    if(p.amountType==="RANGE"&&(!Number.isFinite(p.minAmount)||!Number.isFinite(p.maxAmount)||p.minAmount<0||p.maxAmount<p.minAmount||!known(p.currency,["CHF","EUR","USD"])))add(id,"invalid priced range");
    if(p.amountType==="FREE"&&p.eligibilityType!=="NONE"&&p.tariffClass!=="CONDITIONAL")add(id,"conditional free must not look unconditional");
    if(p.validThrough&&!validDate(p.validThrough))add(id,"invalid price validity");
    for(const v of p.deliveryVariantRefs||[])if(!vIds.has(v))add(id,"price refers to absent variant "+v);
  }
  if(!Array.isArray(o.occurrences))add(id,"occurrences array missing");
  const sIds=new Set(),datePairs=new Set();
  for(const occ of o.occurrences||[]){
    checkKeys(occ,Object.keys(schema.definitions.occurrence.properties),id,"occurrence",add);
    checkKeys(occ.venue,Object.keys(schema.definitions.location.properties),id,"occurrence venue",add);
    if(!isText(occ.id)||sIds.has(occ.id))add(id,"duplicate occurrence ID");sIds.add(occ.id);
    if(!validDate(occ.startDate)||!validDate(occ.endDate)||occ.endDate<occ.startDate)add(id,"invalid occurrence window");
    const pair=occ.startDate+"|"+occ.endDate;
    if(datePairs.has(pair))add(id,"ambiguous duplicate edition window");datePairs.add(pair);
    if(!known(occ.availability,["UNKNOWN","OPEN","SOLD_OUT"]))add(id,"invalid availability status");
    if(occ.availability!=="UNKNOWN"&&(!validDate(occ.availabilityObservedAt)||!HTTPS.test(occ.sourceUrl||"")))add(id,"bookability requires dated official evidence");
    if(!HTTPS.test(occ.sourceUrl||""))add(id,"occurrence evidence missing");
    if(!known(occ.venue?.kind,["IN_PERSON","ONLINE","UNSPECIFIED"])||!isText(occ.venue?.label))add(id,"occurrence venue not classified");
    if(occ.venue?.country!=null&&!known(occ.venue.country,Object.keys(COUNTRIES)))add(id,"occurrence venue country outside MVP");
  }
 }
 return errors;
}
const parseFile=raw=>JSON.parse(raw.slice(raw.indexOf("["),raw.lastIndexOf("]")+1));
const parseSide=raw=>JSON.parse(raw.slice(raw.indexOf("{"),raw.lastIndexOf("}")+1));
const dayLabel=days=>days?.status==="VERIFIED"&&days.min===days.max?days.max+" Tage":null;
const formatMap={IN_PERSON:"PRÄSENZ",LIVE_ONLINE:"ONLINE LIVE",ON_DEMAND:"ONLINE SELBSTLERNEN",HYBRID:"HYBRID"};
const channels=m=>m==="HYBRID"?["IN_PERSON","REMOTE"]:m==="IN_PERSON"?["IN_PERSON"]:["REMOTE"];
function priceCategory(prices){
 if(!prices.length)return "PREIS_NICHT_PUBLIZIERT";
 if(prices.length>1)return "MEHRERE_TARIFE";
 const p=prices[0];
 if(p.amountType==="FREE"&&p.eligibilityType==="NONE"&&p.priceScope==="FULL_OFFER")return "KOSTENLOS";
 if(p.amountType==="ON_REQUEST")return "PREIS_AUF_ANFRAGE";
 if(p.amountType==="NOT_PUBLISHED")return "PREIS_NICHT_PUBLIZIERT";
 if(p.amountType!=="EXACT"||p.priceScope!=="FULL_OFFER"||p.billingBasis!=="TOTAL"||p.eligibilityType!=="NONE"||p.taxMode==="EXCLUDED")return "MEHRERE_TARIFE";
 return p.amount<=500?"BIS_500":p.amount<=2000?"501_2000":"UEBER_2000";
}
function displayPrice(p){
 if(p.amountType==="FREE")return p.eligibilityType==="NONE"?"Kostenlos":"Gratis bei Berechtigung";
 if(p.amountType==="NOT_PUBLISHED")return "Preis nicht publiziert";
 if(p.amountType==="ON_REQUEST")return "Preis auf Anfrage";
 const value=p.amountType==="RANGE"?p.minAmount+"–"+p.maxAmount:p.amount;
 return (p.currency||"")+" "+(p.amountType==="FROM"?"ab ":"")+value+
  (p.tariffLabel?" · "+p.tariffLabel:"")+(p.taxMode==="EXCLUDED"?" exkl. Steuer":"");
}
function project(batch){
 return batch.offers.map(o=>{
  const ready=o.reviewStatus==="REVIEWED"&&o.scopeDecision==="IN_SCOPE";
  const variants=o.deliveryVariants;
  const sessions=(o.occurrences||[]).map(s=>({startDate:s.startDate,endDate:s.endDate,
    label:s.startDate+"–"+s.endDate+" · "+s.venue.label+" · Buchbarkeit beim Anbieter prüfen",
    region:s.venue.label,...(s.availability==="SOLD_OUT"?{availabilityStatus:"SOLD_OUT"}:{}),
    ...(s.availabilityObservedAt?{statusObservedAt:s.availabilityObservedAt}:{}),
    ...(s.availability!=="UNKNOWN"?{statusEvidenceUrl:s.sourceUrl,bookingStatusObserved:s.availability}:{}),
    sourceOccurrenceId:s.id}));
  sessions.sort((a,b)=>a.startDate.localeCompare(b.startDate));
  const earliest=sessions[0];
  const location=earliest?.region||variants.map(v=>v.location.label).filter(Boolean).join(" / ");
  const actualVenue=(o.occurrences.find(s=>s.venue.country)?.venue.country
    ||variants.find(v=>v.location.country)?.location.country||o.provider.country);
  const primaryCountry=COUNTRIES[actualVenue];
  const accessText={YES:"Zugang aus der Schweiz bestätigt",CONDITIONAL:"Zugang aus der Schweiz mit Bedingungen",
    NO:"Zugang aus der Schweiz nicht nachgewiesen / ausgeschlossen",UNKNOWN:"Zugang aus der Schweiz unklar"}[o.access.chEligibility];
  const duration=o.learningTime.raw;
  const record={
    id:o.id,provider:o.provider.name,title:o.title,description:o.description,
    access:accessText+(o.access.conditions?" – "+o.access.conditions:""),
    level:o.level,language:o.languages.join("|"),country:primaryCountry,url:o.source.url,
    approved:o.source.checkedAt,reviewAfter:o.reviewAfter,focus:o.focus,offerType:o.offerType,
    priceDisplay:o.prices.length?o.prices.map(displayPrice).join(" / "):"Preis nicht publiziert",
    priceCategory:priceCategory(o.prices),format:[...new Set(variants.map(v=>formatMap[v.mode]))].join("|"),
    duration,start:earliest?earliest.startDate:(variants.some(v=>v.mode==="ON_DEMAND")?"Selbstlernend – Start beim Anbieter prüfen":"Nächster Termin nicht publiziert"),
    startDate:earliest?.startDate||"",endDate:earliest?.endDate||"",region:location||"NOT_PUBLISHED",
    providerCountry:o.provider.country,deliveryCountry:actualVenue,
    accessModel:o.access,learningTime:o.learningTime,
    sourceEvidence:{url:o.source.url,checkedAt:o.source.checkedAt,verifiedFields:o.source.verifiedFields},
    release_origin:"B3_IMPORT_"+batch.batchId,
    ...(sessions.length?{sessions}:{}),
    ...(!ready?{publicationStatus:"HOLD",publicationReason:"Import source/scope review not complete"}:{})
  };
  const deliveryVariants=variants.map(v=>({
    deliveryVariantId:v.id,attendanceChannels:channels(v.mode),
    temporalMode:v.mode==="ON_DEMAND"?"ASYNCHRONOUS":v.mode==="HYBRID"?"MIXED":"SYNCHRONOUS",
    scheduleMode:o.occurrences.length?"FIXED":"UNKNOWN",
    instructionFormats:v.mode==="ON_DEMAND"?["SELF_STUDY"]:[],
    sourceLocation:v.location.label
  }));
  const side={
    parserStatus:ready&&o.prices.length?"AUTO_ACCEPT":"NEEDS_REVIEW",
    priceEligible:ready&&o.prices.length>0,
    priceOptions:o.prices.map(p=>({
      amountType:p.amountType,amount:p.amount??null,minAmount:p.minAmount??null,maxAmount:p.maxAmount??null,
      currency:p.currency??null,tariffClass:p.tariffClass,tariffLabel:p.tariffLabel??null,
      eligibilityType:p.eligibilityType,eligibilityValue:p.eligibilityValue??null,
      billingBasis:p.billingBasis,billingCount:null,priceScope:p.priceScope,
      taxMode:p.taxMode,taxRate:null,validFrom:null,validThrough:p.validThrough??null,components:[],
      deliveryVariantRefs:p.deliveryVariantRefs||[],
      sourceEvidenceUrl:p.sourceUrl
    })),
    delivery:{
      evidenceTier:ready?"VERIFIED":"UNKNOWN",
      structure:variants.length>1?"MODE_CHOICE":variants[0].mode==="HYBRID"?"HYBRID_COMBINED":"SINGLE_CHANNEL",
      channels:[...new Set(variants.flatMap(v=>channels(v.mode)))],
      variants:deliveryVariants,
      scheduleSummary:earliest?"FIXED":"UNKNOWN",
      temporalSummary:variants.some(v=>v.mode==="ON_DEMAND")?"MIXED_OR_ASYNCHRONOUS":"SYNCHRONOUS",
      sourceText:variants.map(v=>v.sourceUrl).join(" | "),
      materialisationStatus:ready?"GOLD_SOURCE_VERIFIED":"NEEDS_DELIVERY_REVIEW"
    }
  };
  return {offer:record,sidecar:side};
 });
}
function materialize(batch,dataFile,sideFile,expectedCount,expectedDataSha,expectedSideSha){
 const dataRaw=fs.readFileSync(dataFile,"utf8"),sideRaw=fs.readFileSync(sideFile,"utf8");
 if(!/^[a-f0-9]{64}$/.test(expectedDataSha||"")||!/^[a-f0-9]{64}$/.test(expectedSideSha||""))
   throw Error("Both SHA-256 baseline leases are required for --apply");
 if(sha256(dataRaw)!==expectedDataSha||sha256(sideRaw)!==expectedSideSha)
   throw Error("SHA256_BASELINE_DRIFT: data/sidecar changed; reconcile before retry");
 const prev=parseFile(dataRaw),side=parseSide(sideRaw);
 assert.equal(prev.length,expectedCount,"Canonical offer-count lease changed");
 assert.equal(prev.length,new Set(prev.map(o=>o.id)).size,"Canonical duplicates");
 assert.equal(Object.keys(side.byId).length,prev.length,"Offer ↔ sidecar parity failed");
 const errors=validate(batch,new Set(prev.map(o=>o.id)),
   new Set(prev.map(o=>fingerprint(o))));
 if(errors.length)throw Error("VALIDATION_FAILED\n"+errors.join("\n"));
 const projections=project(batch);
 const newOffers=projections.map(x=>x.offer);
 const join=prev.concat(newOffers);
 assert.equal(new Set(join.map(o=>o.id)).size,join.length,"Stable ID collision");
 const oldIndex=dataRaw.lastIndexOf("]");
 if(oldIndex<0)throw Error("Missing offer-array closing bracket");
 const prefix=dataRaw.slice(0,oldIndex).trimEnd();
 const dataOut=prefix+(prev.length?",\n":"\n")+newOffers.map(o=>JSON.stringify(o)).join(",\n")+"\n"+dataRaw.slice(oldIndex);
 const sideOut={...side,meta:{...side.meta,rosterCount:join.length},byId:{...side.byId}};
 for(const entry of projections)sideOut.byId[entry.offer.id]=entry.sidecar;
 if(Object.keys(sideOut.byId).length!==join.length)throw Error("Generated sidecar parity failed");
 const sideContent="window.MEDIA_SKILLS_SMART_DATA = "+JSON.stringify(sideOut)+";\n";
 const dir=path.dirname(dataFile);
 if(path.dirname(sideFile)!==dir)throw Error("Data and sidecar must share directory for transactional import");
 const daTmp=path.join(dir,".b3-offers-"+process.pid+".tmp");
 const siTmp=path.join(dir,".b3-sidecar-"+process.pid+".tmp");
 fs.writeFileSync(daTmp,dataOut);fs.writeFileSync(siTmp,sideContent);
 assert.equal(parseFile(fs.readFileSync(daTmp,"utf8")).length,join.length);
 assert.equal(Object.keys(parseSide(fs.readFileSync(siTmp,"utf8")).byId).length,join.length);
 // No mutation before BOTH artefacts are validated.
 const daBak=path.join(dir,".b3-offers-"+process.pid+".bak");
 const siBak=path.join(dir,".b3-sidecar-"+process.pid+".bak");
 try{
  if(sha256(fs.readFileSync(dataFile,"utf8"))!==expectedDataSha
    ||sha256(fs.readFileSync(sideFile,"utf8"))!==expectedSideSha)
    throw Error("SHA256_BASELINE_DRIFT before atomic writer");
  fs.copyFileSync(dataFile,daBak);fs.copyFileSync(sideFile,siBak);
  fs.renameSync(daTmp,dataFile);fs.renameSync(siTmp,sideFile);
 }catch(e){
  if(fs.existsSync(daBak))fs.copyFileSync(daBak,dataFile);
  if(fs.existsSync(siBak))fs.copyFileSync(siBak,sideFile);
  throw e;
 }finally{
  for(const f of [daTmp,siTmp,daBak,siBak])try{fs.unlinkSync(f)}catch{}
 }
 return {oldCount:prev.length,newCount:join.length,added:newOffers.map(o=>o.id),
   held:newOffers.filter(o=>o.publicationStatus==="HOLD").map(o=>o.id)};
}
function main(){
 const argv=process.argv.slice(2),arg=x=>{const i=argv.indexOf(x);return i<0?null:argv[i+1]};
 const input=arg("--input");if(!input)throw Error("Usage: node scripts/catalogue-ingest-v1.cjs --input path [--preview | --apply --data-file path --sidecar-file path --expected-existing-offers N]");
 const batch=JSON.parse(fs.readFileSync(input,"utf8"));
 const errors=validate(batch);
 if(errors.length)throw Error("VALIDATION_FAILED\n"+errors.join("\n"));
 if(!argv.includes("--apply")){
  const o=project(batch);
  console.log(JSON.stringify({status:"PREVIEW_ONLY",schema:schema.$id,batchId:batch.batchId,
    count:o.length,ids:o.map(x=>x.offer.id),held:o.filter(x=>x.offer.publicationStatus==="HOLD").map(x=>x.offer.id),
    siteSchema:"data.js + smart-search-data.js / additive only",unchanged:true}));
  return;
 }
 const count=Number(arg("--expected-existing-offers"));
 if(!Number.isInteger(count)||count<0)throw Error("Explicit expected baseline count required");
 const dataFile=arg("--data-file"),sideFile=arg("--sidecar-file");
 const expectedDataSha=arg("--expected-data-sha256"),expectedSideSha=arg("--expected-sidecar-sha256");
 if(!dataFile||!sideFile)throw Error("Explicit data/sidecar paths required");
 console.log(JSON.stringify({status:"APPLIED_LOCAL_DRAFT_ONLY",...materialize(batch,dataFile,sideFile,count,expectedDataSha,expectedSideSha)}));
}
if(require.main===module)try{main()}catch(e){console.error(String(e.message||e));process.exitCode=1}
module.exports={validate,project,materialize};
