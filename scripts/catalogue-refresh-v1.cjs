"use strict";
/* Source-verified refresh of EXISTING B3 offer IDs. Deliberately separate
 * from add-only import; never writes Drive, main or a public host. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {validate,project}=require("./catalogue-ingest-v1.cjs");
const hash=s=>crypto.createHash("sha256").update(s).digest("hex");
const offersFrom=raw=>JSON.parse(raw.slice(raw.indexOf("["),raw.lastIndexOf("]")+1));
const sideFrom=raw=>JSON.parse(raw.slice(raw.indexOf("{"),raw.lastIndexOf("}")+1));
const isIso=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||"");
const exactly=(actual,expected,label)=>{
 if(actual!==expected)throw Error(label+" expected "+expected+" got "+actual);
};
function mergeSessions(oldSessions,newSessions){
 const out=(Array.isArray(oldSessions)?oldSessions:[]).map(s=>({...s}));
 for(const fresh of newSessions||[]){
  let i=out.findIndex(old=>fresh.sourceOccurrenceId&&old.sourceOccurrenceId===fresh.sourceOccurrenceId);
  if(i<0)i=out.findIndex(old=>old.startDate===fresh.startDate
    &&old.endDate===fresh.endDate&&old.region===fresh.region);
  if(i<0)out.push({...fresh});
  else out[i]={...out[i],...fresh};
 }
 out.sort((a,b)=>(a.startDate||"").localeCompare(b.startDate||"")
   ||(a.sourceOccurrenceId||"").localeCompare(b.sourceOccurrenceId||""));
 return out;
}
/* Preserve every untargeted data.js offer byte for byte, including its
 * formatting and order. Only the matched top-level JSON object is replaced. */
function replaceOfferObjects(raw,updates){
 const start=raw.indexOf("["),stop=raw.lastIndexOf("]");
 if(start<0||stop<=start)throw Error("Cannot find data.js offer array");
 let depth=0,inString=false,escaped=false,objStart=-1,cursor=0,out="",changed=new Set();
 for(let i=start+1;i<stop;i++){
  const ch=raw[i];
  if(inString){
   if(escaped)escaped=false;
   else if(ch==="\\")escaped=true;
   else if(ch==='"')inString=false;
   continue;
  }
  if(ch==='"'){inString=true;continue}
  if(ch==="{"){if(depth++===0)objStart=i;continue}
  if(ch==="}"){
   if(--depth<0)throw Error("Unexpected closing brace in offer array");
   if(depth===0){
    const prior=JSON.parse(raw.slice(objStart,i+1));
    if(updates.has(prior.id)){
     if(changed.has(prior.id))throw Error("Duplicate existing offer ID "+prior.id);
     out+=raw.slice(cursor,objStart)+JSON.stringify(updates.get(prior.id));
     cursor=i+1;changed.add(prior.id);
    }
   }
  }
 }
 if(inString||depth!==0)throw Error("Unbalanced data.js JSON");
 for(const id of updates.keys())if(!changed.has(id))throw Error("Update ID not found "+id);
 return out+raw.slice(cursor);
}
function prepare(batch,dataRaw,sideRaw,expectedCount){
 const old=offersFrom(dataRaw),side=sideFrom(sideRaw);
 exactly(old.length,expectedCount,"Offer roster lease");
 exactly(new Set(old.map(o=>o.id)).size,old.length,"Existing unique IDs");
 exactly(Object.keys(side.byId||{}).length,old.length,"Sidecar cardinality");
 if(side.meta?.rosterCount!=null)exactly(side.meta.rosterCount,old.length,"Sidecar rosterCount");
 const errors=validate(batch);
 if(errors.length)throw Error("B3_SOURCE_VALIDATION_FAILED\n"+errors.join("\n"));
 const byId=new Map(old.map(o=>[o.id,o]));
 const updates=new Map(),sideUpdates=new Map(),changes=[];
 for(const fresh of batch.offers){
  const before=byId.get(fresh.id);
  if(!before)throw Error("UPDATE_ID_NOT_FOUND: "+fresh.id+"; use add-only B3 for new IDs");
  if(fresh.reviewStatus!=="REVIEWED"||fresh.scopeDecision!=="IN_SCOPE")
   throw Error("UPDATE_REQUIRES_REVIEWED_IN_SCOPE: "+fresh.id);
  if(before.provider!==fresh.provider.name||before.title!==fresh.title)
   throw Error("IDENTITY_CHANGE_REQUIRES_OWNER_REVIEW: "+fresh.id);
  const priorCheck=before.sourceEvidence?.checkedAt||before.approved||"";
  if(isIso(priorCheck)&&fresh.source.checkedAt<priorCheck)
   throw Error("SOURCE_CHECK_REGRESSION: "+fresh.id);
  if(fresh.reviewAfter<=fresh.source.checkedAt)
   throw Error("reviewAfter must follow source checkedAt: "+fresh.id);
  const existingSide=side.byId[fresh.id];
  if(!existingSide)throw Error("MISSING_EXISTING_SIDECAR: "+fresh.id);
  if((existingSide.priceOptions||[]).length>0&&!fresh.prices.length)
   throw Error("PRICE_ERASURE_REQUIRES_EXPLICIT_STATUS: "+fresh.id);
  const built=project({schemaVersion:batch.schemaVersion,batchId:batch.batchId,
    reviewer:batch.reviewer,offers:[fresh]})[0];
  const mergedSessions=mergeSessions(before.sessions,built.offer.sessions);
  const next={...before,...built.offer,publicationStatus:"HOLD",
    publicationReason:"SOURCE_REFRESH_AWAITING_OWNER_RELEASE_GATE"};
  if(Object.prototype.hasOwnProperty.call(before,"release_origin"))
   next.release_origin=before.release_origin;
  else delete next.release_origin;
  if(mergedSessions.length)next.sessions=mergedSessions;
  else delete next.sessions;
  // Old run dates remain archived in the sessions array. Do not rewrite
  // session startDate to a new, unverified date from provider headquarters.
  if(mergedSessions.length){
   next.startDate=mergedSessions[0].startDate||"";
   next.endDate=mergedSessions[0].endDate||"";
  }
  const nextSide={...existingSide,...built.sidecar};
  if(JSON.stringify(before)===JSON.stringify(next)
    &&JSON.stringify(existingSide)===JSON.stringify(nextSide))
    throw Error("NO_EFFECTIVE_REFRESH: "+fresh.id);
  updates.set(fresh.id,next);sideUpdates.set(fresh.id,nextSide);
  changes.push({id:fresh.id,checkedAt:fresh.source.checkedAt,
    originalSource:before.url,newSource:next.url,
    beforeSessionCount:(before.sessions||[]).length,
    afterSessionCount:(next.sessions||[]).length,
    oldPriceOptions:(existingSide.priceOptions||[]).length,
    newPriceOptions:(nextSide.priceOptions||[]).length,
    publicationStatus:next.publicationStatus});
 }
 const dataOut=replaceOfferObjects(dataRaw,updates);
 const nextSide={...side,meta:{...side.meta,rosterCount:old.length},
   byId:{...side.byId}};
 for(const [id,record] of sideUpdates)nextSide.byId[id]=record;
 const originalSideRaw="window.MEDIA_SKILLS_SMART_DATA = "+JSON.stringify(side)+";\n";
 if(sideRaw!==originalSideRaw)throw Error("NONCANONICAL_SIDECAR_FORMAT: no bulk sidecar reformat");
 const sideOut="window.MEDIA_SKILLS_SMART_DATA = "+JSON.stringify(nextSide)+";\n";
 exactly(offersFrom(dataOut).length,old.length,"Output offers");
 exactly(Object.keys(sideFrom(sideOut).byId).length,old.length,"Output sidecars");
 return {dataOut,sideOut,changes,existing:old.length};
}
function refresh(batch,dataFile,sideFile,expectedCount,expectedDataSha,expectedSideSha,apply=false){
 const dataRaw=fs.readFileSync(dataFile,"utf8"),sideRaw=fs.readFileSync(sideFile,"utf8");
 if(apply){
  if(!/^[a-f0-9]{64}$/.test(expectedDataSha||"")
   ||!/^[a-f0-9]{64}$/.test(expectedSideSha||""))
   throw Error("Both SHA256 leases required for --apply");
  if(hash(dataRaw)!==expectedDataSha||hash(sideRaw)!==expectedSideSha)
   throw Error("SHA256_BASELINE_DRIFT");
 }
 const plan=prepare(batch,dataRaw,sideRaw,expectedCount);
 const summary={status:apply?"APPLIED_LOCAL_DRAFT_ONLY":"PREVIEW_ONLY",
  unchanged:!apply,roster:plan.existing,changes:plan.changes,
  outputDataSHA256:hash(plan.dataOut),outputSidecarSHA256:hash(plan.sideOut)};
 if(!apply)return summary;
 if(path.dirname(dataFile)!==path.dirname(sideFile))
  throw Error("Data and sidecar must share directory");
 const dir=path.dirname(dataFile),id=process.pid;
 const dt=path.join(dir,".refresh-data-"+id+".tmp"),
  st=path.join(dir,".refresh-side-"+id+".tmp"),
  db=path.join(dir,".refresh-data-"+id+".bak"),
  sb=path.join(dir,".refresh-side-"+id+".bak");
 try{
  fs.writeFileSync(dt,plan.dataOut);fs.writeFileSync(st,plan.sideOut);
  exactly(offersFrom(fs.readFileSync(dt,"utf8")).length,plan.existing,"Staged offers");
  exactly(Object.keys(sideFrom(fs.readFileSync(st,"utf8")).byId).length,
    plan.existing,"Staged sidecars");
  if(hash(fs.readFileSync(dataFile,"utf8"))!==expectedDataSha
   ||hash(fs.readFileSync(sideFile,"utf8"))!==expectedSideSha)
   throw Error("SHA256_BASELINE_DRIFT before local write");
  fs.copyFileSync(dataFile,db);fs.copyFileSync(sideFile,sb);
  fs.renameSync(dt,dataFile);fs.renameSync(st,sideFile);
  if(hash(fs.readFileSync(dataFile,"utf8"))!==summary.outputDataSHA256
   ||hash(fs.readFileSync(sideFile,"utf8"))!==summary.outputSidecarSHA256)
   throw Error("LOCAL_READBACK_MISMATCH");
 }catch(err){
  if(fs.existsSync(db))fs.copyFileSync(db,dataFile);
  if(fs.existsSync(sb))fs.copyFileSync(sb,sideFile);
  throw err;
 }finally{
  for(const p of [dt,st,db,sb])try{fs.unlinkSync(p)}catch{}
 }
 return summary;
}
function cli(){
 const args=process.argv.slice(2);
 const arg=x=>{const i=args.indexOf(x);return i<0?null:args[i+1]};
 const batchPath=arg("--input");
 if(!batchPath)throw Error("Required --input batch.json");
 const batch=JSON.parse(fs.readFileSync(batchPath,"utf8"));
 const dataFile=arg("--data-file")||"data.js";
 const sideFile=arg("--sidecar-file")||"smart-search-data.js";
 const count=Number(arg("--expected-existing-offers")||1352);
 const result=refresh(batch,dataFile,sideFile,count,
   arg("--expected-data-sha256"),arg("--expected-sidecar-sha256"),args.includes("--apply"));
 console.log(JSON.stringify(result,null,2));
}
if(require.main===module)try{cli()}catch(e){console.error(e.message||e);process.exitCode=1}
module.exports={prepare,refresh,mergeSessions,replaceOfferObjects};
