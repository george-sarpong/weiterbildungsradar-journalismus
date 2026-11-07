"use strict";
/*
 * EVT271: source-faithful large-batch field bridge for TARGET5.
 * 1,352 existing website records + 111 DE + 2,355 USA historical publication records.
 * Emits review-only JSONL; no provider fetch, no master/site write, no new Gold status.
 * The 29 protected B2 IDs and six non-B2 exceptions originate in EVT270 Drive.
 */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const hash=s=>crypto.createHash("sha256").update(s).digest("hex");
const get=(p,dir=root)=>fs.readFileSync(path.join(dir,p),"utf8");
const decode=(text,left,right)=>JSON.parse(text.slice(text.indexOf(left),text.lastIndexOf(right)+1));
const tsv=text=>{
 const [heads,...records]=text.trim().split(/\r?\n/).map(x=>x.split("\t"));
 return records.map((row,i)=>{
  if(row.length!==heads.length)throw Error("TSV_COLUMN_DRIFT_ROW_"+(i+2));
  return Object.fromEntries(heads.map((k,j)=>[k,row[j]]));
 });
};
const validUrl=s=>typeof s==="string"&&/^https:\/\/[^\s;|]+$/.test(s);
const sourceReference=raw=>{
 const input=String(raw??"");
 if(validUrl(input))return {status:"SINGLE_SOURCE_URL_UNVERIFIED",raw:input,urls:[input],unparsed:[]};
 const parts=input.split(/\s*(?:;|\|)\s*|\s+\+\s+/).map(x=>x.trim()).filter(Boolean);
 const urls=parts.filter(validUrl),unparsed=parts.filter(x=>!validUrl(x));
 if(!urls.length)throw Error("SOURCE_REFERENCE_HAS_NO_SAFE_URL");
 return {status:unparsed.length?"COMPOSITE_URL_AND_NOTE_HOLD":"MULTI_URL_OFFER_IDENTITY_HOLD",
  raw:input,urls,unparsed};
};
const cityEvidence=(r,o)=>{
 if(r.venue_data_state==="OWNER_CONFIRMED_CITY_LUZERN_EXACT_VENUE_UNVERIFIED"){
  if(o.region!=="NOT_PUBLISHED"||r.catalogue_region!=="NOT_PUBLISHED")
   throw Error("CITY_OWNER_OLD_VALUE_CHANGED "+o.id);
  return {city:"Luzern",country:"CH",status:"OWNER_CONFIRMED_CITY_ONLY",
    deliveryFormat:"NOT_PROVEN_BY_CITY_EVIDENCE",evidenceUrl:r.source_url,
    provenance:"EVT253_EVT254_B2_OWNER_CONFIRMATION",websiteGold:false};
 }
 if(o.id==="OFFER-MAZ-100"){
  if(!/zürich|zuerich/i.test(o.region)||!validUrl(r.source_url))
   throw Error("MAZ100_CITY_SOURCE_REGRESSION");
  return {city:"Zürich",country:"CH",status:"OWNER_CONFIRMED_CITY_ONLY",
    deliveryFormat:"NOT_PROVEN_BY_CITY_EVIDENCE",evidenceUrl:r.source_url,
    provenance:"EVT235_EVT256_OWNER_CONFIRMATION",websiteGold:false};
 }
 return null;
};
function run(outDir,{inputRoot=root,asOf="2026-11-07"}={}){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(asOf))throw Error("INVALID_AS_OF");
 const originals={
  offers:get("data.js",inputRoot),sidecars:get("smart-search-data.js",inputRoot),
  deUs:get("data/staging/target5-de-usa-wave1-r4-20260915.json",inputRoot),
  usEvidence:get("data/staging/usa-owner-evidence-crosswalk-20261107.jsonl",inputRoot),
  b2:get("docs/b2/evt264-active-140-website-gold-field-gates-20261107.tsv",inputRoot),
  policy:get("data/staging/evt270-currentness-policy-20261107.json",inputRoot)};
 const offers=decode(originals.offers,"[","]");
 const side=decode(originals.sidecars,"{","}");
 const staged=JSON.parse(originals.deUs).records;
 const usOwner=originals.usEvidence.trim().split(/\r?\n/).slice(1).map(JSON.parse);
 const b2=tsv(originals.b2),policy=JSON.parse(originals.policy);
 const b2Ids=new Map(b2.map(x=>[x.offer_id,x])),protectedIds=new Map(policy.protectedB2.map(x=>[x.offerId,x.policy]));
 const exceptions=new Set(policy.unprotectedOutsideB2),usOwnerIds=new Map(usOwner.map(x=>[x.record_id,x]));
 if(offers.length!==1352||Object.keys(side.byId).length!==1352||staged.length!==2466
    ||usOwner.length!==2355||usOwnerIds.size!==2355||b2.length!==140
    ||b2Ids.size!==140||protectedIds.size!==29||exceptions.size!==6)
  throw Error("EVT270_POPULATION_OR_POLICY_DRIFT");
 if([...protectedIds.keys()].some(id=>!b2Ids.has(id))||[...exceptions].some(id=>b2Ids.has(id)))
  throw Error("PROTECTED_OR_EXCEPTION_B2_POLICY_DRIFT");
 const byOffer=new Map(offers.map(o=>[o.id,o]));
 if(byOffer.size!==offers.length||[...b2Ids].some(([id,r])=>!byOffer.has(id)
   ||byOffer.get(id).url!==r.source_url||r.website_gold_gate!=="NOT_PROVEN"
   ||r.publication_gate!=="HOLD_NO_AUTOMATIC_RELEASE"))
  throw Error("B2_SOURCE_ID_RELEASE_DRIFT");
 const active=[],due=[],cities=[],protectedDue=[];
 const hostGroups=new Map();
 for(const o of offers){
  const sidecar=side.byId[o.id],r=b2Ids.get(o.id),isDue=!!(o.reviewAfter&&o.reviewAfter<asOf);
  if(!sidecar||!validUrl(o.url))throw Error("OFFER_SOURCE_SIDECAR_DRIFT "+o.id);
  let p=null;
  if(r)p=protectedIds.has(o.id)?"HISTORICAL_NO_REOPEN":"B2_EXISTING_EVIDENCE_FIRST";
  else if(isDue)p=exceptions.has(o.id)?"SIX_EXCEPTION_EXISTING_EVIDENCE_FIRST":
    "EVT270_HISTORICAL_NO_REOPEN_OUTSIDE_B2";
  else p="NOT_DUE";
  if(r&&(!isDue||String(sidecar.priceEligible)!==r.structured_numeric_price_eligible))
   throw Error("B2_DATE_OR_PRICE_DRIFT "+o.id);
  const city=r?cityEvidence(r,o):null;
  if(city)cities.push({id:o.id,provider:o.provider,title:o.title,...city});
  const entry={market:o.country==="Österreich"?"AT":o.country==="Liechtenstein"?"LI":"CH",
   id:o.id,kind:"LEGACY_STABLE_OFFER",provider:o.provider,title:o.title,
   url:o.url,provenance:"DRAFT_PR10_LEGACY",reviewAfter:o.reviewAfter||null,
   reviewDue:isDue,reviewPolicy:p,protectedNoReopen:p.includes("NO_REOPEN"),
   priceStatus:sidecar.parserStatus==="AUTO_ACCEPT"&&sidecar.priceEligible?
     "STRUCTURED_NUMERIC_NOT_GOLD":"NOT_NUMERICALLY_ELIGIBLE",
   deliveryTier:sidecar.delivery?.evidenceTier||"UNKNOWN",
   chAccess:"UNKNOWN_NOT_INFERRED_FROM_LEGACY_TEXT",
   cityEvidence:city?city.status:"NOT_YET_TYPED_FROM_EXACT_SOURCE",
   websiteGold:r?"NOT_PROVEN":"NOT_ASSESSED_BY_B2",
   publicationGate:"HOLD_NO_AUTOMATIC_RELEASE"};
  active.push(entry);
  if(isDue){
   if(entry.protectedNoReopen)protectedDue.push(entry);
   else{
    const row={...entry,host:new URL(o.url).hostname.toLowerCase().replace(/^www\./,""),
     evidenceAction:r?"REUSE_PRIOR_B2_SOURCE_NOT_NEW_CRAWL":"REUSE_EXISTING_EVIDENCE_FIRST",
     b2NextAction:r?.next_evidence_action||null,cityOnlyCandidate:!!city};
    due.push(row);
    if(!hostGroups.has(row.host))hostGroups.set(row.host,[]);
    hostGroups.get(row.host).push(row.id);
   }
  }
 }
 const byStage=new Set(),deUs=[],stageMarkets={DE:0,USA:0},occurrenceOnly=[],compositeSourceIds=[];
 for(const item of staged){
  const key=item.country+"/"+item.record_id;
  if(byStage.has(key)||!["DE","USA"].includes(item.country)||!sourceReference(item.source_url).urls.length)
   throw Error("STAGED_ID_SOURCE_DRIFT "+key);
  byStage.add(key);stageMarkets[item.country]++;
  const owner=item.country==="USA"?usOwnerIds.get(item.record_id):null;
  if(item.country==="USA"&&(!owner||owner.programmeReleaseUrl!==item.source_url))
   throw Error("USA_OWNER_EXACT_URL_DRIFT "+key);
  const source=sourceReference(item.source_url);
  if(source.status!=="SINGLE_SOURCE_URL_UNVERIFIED")compositeSourceIds.push(key);
  const isOccurrence=/^OCCURRENCE_ONLY/.test(item.object_type||"");
  if(isOccurrence)occurrenceOnly.push(key);
  deUs.push({market:item.country,id:item.record_id,objectType:item.object_type,
   kind:isOccurrence?"OCCURRENCE_ONLY_DO_NOT_PROMOTE":"SOURCE_STAGED_STABLE_PARENT_OR_ROUTE",
   provider:item.provider,title:item.title,url:source.urls.length===1&&source.unparsed.length===0?source.urls[0]:null,
   rawSourceUrl:source.raw,sourceUrlCandidates:source.urls,
   sourceUrlStatus:source.status,unparsedSourceNotes:source.unparsed,
   r4Status:item.release_status,sourceClass:item.source_publication_class,
   sourceOwnerType:owner?.ownerEvidenceClass||"NOT_APPLICABLE_DE",
   ownerEvidenceUrl:validUrl(owner?.ownerPrimarySource)?owner.ownerPrimarySource:null,
   ownerAccessTextState:owner?.accessEvidenceText?"HISTORICAL_NOT_CH_ELIGIBILITY_PROOF":"NO_SOURCE_ACCESS_NOTE",
   chAccess:"UNKNOWN_NOT_INFERRED_FROM_R4_OR_OWNER",
   productFields:{price:"NOT_IN_R4_SCHEMA",delivery:"NOT_IN_R4_SCHEMA",
    duration:"NOT_IN_R4_SCHEMA",language:"NOT_IN_R4_SCHEMA",
    city:"NOT_IN_R4_SCHEMA",currentOccurrence:"NOT_IN_R4_SCHEMA"},
   websiteGold:"NOT_PROVEN",publicationGate:"HOLD_NO_AUTOMATIC_RELEASE"});
 }
 if(active.length!==1352||due.length!==117||protectedDue.length!==145
   ||cities.length!==21||new Set(cities.map(x=>x.id)).size!==21
   ||stageMarkets.DE!==111||stageMarkets.USA!==2355||occurrenceOnly.length!==2
   ||compositeSourceIds.length!==30
   ||hostGroups.size!==25)
  throw Error("EVT270_SOURCE_CONTRACT_DRIFT "+JSON.stringify({
   catalogue:active.length,due:due.length,protected:protectedDue.length,
   cities:cities.length,stageMarkets,occurrences:occurrenceOnly.length,
   compositeSourceIds:compositeSourceIds.length,
   hosts:hostGroups.size}));
 if(due.filter(x=>x.reviewPolicy==="B2_EXISTING_EVIDENCE_FIRST").length!==111
   ||due.filter(x=>x.reviewPolicy==="SIX_EXCEPTION_EXISTING_EVIDENCE_FIRST").length!==6)
  throw Error("EVT270_WORK_QUEUE_SPLIT_DRIFT");
 const out=path.resolve(outDir),temp=out+".staging-"+process.pid;
 if(out===root||out===path.parse(out).root||out===inputRoot)
  throw Error("UNSAFE_OUTPUT_PATH");
 const write=(filename,rows)=>fs.writeFileSync(path.join(temp,filename),rows.map(x=>JSON.stringify(x)).join("\n")+"\n");
 fs.rmSync(temp,{recursive:true,force:true});
 fs.mkdirSync(temp,{recursive:true});
 write("catalogue-field-bridge-1352.jsonl",active);
 write("de-usa-owner-product-bridge-2466.jsonl",deUs);
 write("unprotected-currentness-117.jsonl",due);
 write("locked-currentness-145.jsonl",protectedDue);
 write("city-only-owner-21.jsonl",cities);
 const hosts=[...hostGroups].map(([host,ids])=>({host,count:ids.length,ids:ids.sort()}))
   .sort((a,b)=>b.count-a.count||a.host.localeCompare(b.host));
 fs.writeFileSync(path.join(temp,"host-workpacks-25.json"),JSON.stringify(hosts,null,2)+"\n");
 const files=fs.readdirSync(temp).sort();
 const manifest={type:"TARGET5_EVT271_EVIDENCE_BRIDGE_READ_ONLY",
   source:"PR10_DRAFT_AND_EVT270_AUTHORITY",asOf,publicationAllowed:false,
   counts:{catalogue:active.length,stagedDE:stageMarkets.DE,stagedUSA:stageMarkets.USA,
    combinedRows:active.length+deUs.length,dueCurrentness:due.length,
    protectedDue:protectedDue.length,dueB2:111,dueOutsideB2:6,
    cityOnlyOwnerFacts:cities.length,uniqueHosts:hostGroups.size,
    occurrenceOnly:occurrenceOnly.length,compositeSourceHolds:compositeSourceIds.length},
   sources:Object.fromEntries(Object.entries(originals).map(([k,v])=>[k,hash(v)])),
   outputs:Object.fromEntries(files.map(k=>[k,hash(fs.readFileSync(path.join(temp,k)))])),
   caveats:["Never infer Swiss eligibility from historical owner text",
    "City-only evidence never establishes in-person modality or available seat",
    "This is a website-gold field pipeline, NOT a product release",
    "No protected historical source is scheduled for refetch",
    "Composite R4 USA source URLs are preserved and quarantined, never treated as offer-specific exact link"]};
 fs.writeFileSync(path.join(temp,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
 fs.rmSync(out,{recursive:true,force:true});fs.renameSync(temp,out);
 return manifest;
}
if(require.main===module)try{
 const at=process.argv.indexOf("--out");
 if(at<0||!process.argv[at+1])throw Error("Usage --out <directory>");
 console.log(JSON.stringify(run(process.argv[at+1]),null,2));
}catch(e){console.error(e.stack||e.message);process.exitCode=1}
module.exports={run,cityEvidence};
