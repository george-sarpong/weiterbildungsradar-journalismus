"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),
 os=require("node:os"),path=require("node:path"),crypto=require("node:crypto");
const {project}=require("../scripts/catalogue-ingest-v1.cjs");
const {refresh}=require("../scripts/catalogue-refresh-v1.cjs");
const sha=file=>crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const src=JSON.parse(fs.readFileSync("tests/fixtures/b3-import-demo.json","utf8"));
const old=project(src)[0];
const untouched={id:"BASE-KEEP-001",provider:"Archive Provider",title:"Legacy source row",
 legacyKey:"DO_NOT_REWRITE",priceDisplay:"Preis nicht publiziert"};
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"media-skills-refresh-"));
const df=path.join(dir,"data.js"),sf=path.join(dir,"smart-search-data.js");
const parse=x=>JSON.parse(x.slice(x.indexOf("=")+1).trim().replace(/;\s*$/,""));
const previousSource=old.offer.sourceEvidence.checkedAt;
try{
 const untouchedBytes="  "+JSON.stringify(untouched);
 fs.writeFileSync(df,"window.WEITERBILDUNGSRADAR_OFFERS = [\n"+
   JSON.stringify(old.offer)+",\n"+untouchedBytes+"\n];\n");
 fs.writeFileSync(sf,"window.MEDIA_SKILLS_SMART_DATA = "+
   JSON.stringify({meta:{rosterCount:2},byId:{
     [old.offer.id]:old.sidecar,[untouched.id]:{parserStatus:"NEEDS_REVIEW",priceEligible:false,priceOptions:[]}
   }})+";\n");
 const initialD=sha(df),initialS=sha(sf);
 const update=structuredClone(src);
 update.batchId="B3_REFRESH_20261107";
 update.offers[0].source.checkedAt="2026-11-07";
 update.offers[0].reviewAfter="2027-01-15";
 update.offers[0].prices[0].amount=780;
 update.offers[0].occurrences=[{...update.offers[0].occurrences[0],
   id:"CH-DEMO-DJ-001-E2",startDate:"2027-05-01",endDate:"2027-05-02"}];
 const pre=refresh(update,df,sf,2,null,null,false);
 assert.equal(pre.status,"PREVIEW_ONLY");
 assert.equal(pre.roster,2);assert.equal(pre.changes.length,1);
 assert.equal(pre.changes[0].beforeSessionCount,1);
 assert.equal(pre.changes[0].afterSessionCount,2);
 assert.equal(sha(df),initialD);assert.equal(sha(sf),initialS);
 assert.throws(()=>refresh(update,df,sf,2,"0".repeat(64),initialS,true),
   /SHA256_BASELINE_DRIFT/,"Stale write lease must fail");
 assert.equal(sha(df),initialD);assert.equal(sha(sf),initialS);
 const changed=refresh(update,df,sf,2,initialD,initialS,true);
 assert.equal(changed.status,"APPLIED_LOCAL_DRAFT_ONLY");
 assert.equal(sha(df),changed.outputDataSHA256);
 assert.equal(sha(sf),changed.outputSidecarSHA256);
 const actualData=fs.readFileSync(df,"utf8"),offers=parse(actualData);
 const actualSide=parse(fs.readFileSync(sf,"utf8"));
 assert.equal(offers.length,2);assert.equal(actualSide.meta.rosterCount,2);
 assert.ok(actualData.includes(untouchedBytes),"Unchanged record bytes were rewritten");
 assert.deepEqual(offers.map(o=>o.id),[old.offer.id,untouched.id]);
 assert.equal(offers[1].legacyKey,"DO_NOT_REWRITE");
 assert.equal(offers[0].sourceEvidence.checkedAt,"2026-11-07");
 assert.notEqual(offers[0].sourceEvidence.checkedAt,previousSource);
 assert.equal(offers[0].sessions.length,2,"Previous course date must remain archived");
 assert.ok(offers[0].sessions.some(x=>x.sourceOccurrenceId==="CH-DEMO-DJ-001-E1"));
 assert.ok(offers[0].sessions.some(x=>x.sourceOccurrenceId==="CH-DEMO-DJ-001-E2"));
 assert.equal(offers[0].publicationStatus,"HOLD");
 assert.match(offers[0].publicationReason,/OWNER_RELEASE_GATE/);
 assert.equal(offers[0].release_origin,old.offer.release_origin);
 assert.equal(actualSide.byId[old.offer.id].priceOptions[0].amount,780);
 assert.equal(actualSide.byId[untouched.id].parserStatus,"NEEDS_REVIEW");
 assert.throws(()=>refresh(update,df,sf,2,initialD,initialS,true),/SHA256_BASELINE_DRIFT/);
 const missing=structuredClone(update);missing.offers[0].id="CH-UNKNOWN-999";
 assert.throws(()=>refresh(missing,df,sf,2,null,null,false),/UPDATE_ID_NOT_FOUND/);
 const older=structuredClone(update);older.offers[0].source.checkedAt="2026-11-01";
 assert.throws(()=>refresh(older,df,sf,2,null,null,false),/SOURCE_CHECK_REGRESSION/);
 const alias=structuredClone(update);alias.offers[0].title="Different Course";
 assert.throws(()=>refresh(alias,df,sf,2,null,null,false),/IDENTITY_CHANGE_REQUIRES_OWNER_REVIEW/);
 const erase=structuredClone(update);erase.offers[0].prices=[];
 assert.throws(()=>refresh(erase,df,sf,2,null,null,false),/PRICE_ERASURE_REQUIRES_EXPLICIT_STATUS/);
 console.log("B3_EXISTING_OFFER_UPDATE_E2E_HASH_SOURCE_ARCHIVE_HOLD_PASS");
}finally{fs.rmSync(dir,{recursive:true,force:true})}
