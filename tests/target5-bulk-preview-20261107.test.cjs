"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),
 os=require("node:os"),path=require("node:path");
const {run}=require("../scripts/target5-bulk-preview-v1.cjs");
const base=fs.mkdtempSync(path.join(os.tmpdir(),"ms-target5-bulk-"));
const dir=path.join(base,"preview");
try{
 const m=run(dir);
 assert.deepEqual(m.counts,{
  catalogue:1352,stagedDE:111,stagedUSA:2355,
  combinedSourceRows:3818,reviewHolds:140,
  sourceWorkpacks:m.counts.sourceWorkpacks,previewPages:1352
 });
 assert.equal(m.publicationAllowed,false);
 assert.equal(m.status,"NOINDEX_UNRELEASED_NOT_WEBSITE_GOLD");
 assert.ok(m.counts.sourceWorkpacks>0&&m.counts.sourceWorkpacks<140,
   "Repeated provider sources should group into fewer workpacks");
 const rows=JSON.parse(fs.readFileSync(path.join(dir,"catalogue-search-view.json"),"utf8"));
 const packs=JSON.parse(fs.readFileSync(path.join(dir,"source-workpacks.json"),"utf8"));
 const stage=JSON.parse(fs.readFileSync(path.join(dir,"owner-market-roster.json"),"utf8"));
 assert.equal(rows.length,1352);assert.equal(stage.length,2466);
 assert.deepEqual(stage.reduce((x,r)=>{x[r.country]=(x[r.country]||0)+1;return x},{}),
  {DE:111,USA:2355});
 assert.ok(stage.every(r=>r.fieldStatus==="SOURCE_STAGED_NOT_WEBSITE_GOLD"));
 const seenIds=new Set(),seenPaths=new Set();
 for(const r of rows){
  assert.ok(!seenIds.has(r.id),"Duplicate offer ID "+r.id);seenIds.add(r.id);
  assert.ok(!seenPaths.has(r.previewFile),"Duplicate preview file "+r.previewFile);seenPaths.add(r.previewFile);
  assert.ok(["NOT_PROVEN","NOT_ASSESSED_BY_THIS_BUILD"].includes(r.websiteGold));
  const content=fs.readFileSync(path.join(dir,r.previewFile),"utf8");
  assert.ok(content.includes('<meta name="robots" content="noindex,nofollow">'),
    "Accidental indexable preview "+r.id);
  assert.ok(!content.includes('https://schema.org/CourseInstance'),
    "Never invent an instance "+r.id);
  assert.ok(!content.includes('"@type":"Offer"'),"Never publish unverified structured fee "+r.id);
  assert.ok(!content.includes('"availability":"InStock"'),"Never assert seat "+r.id);
  assert.ok(content.includes("Kein Nachweis über freie Plätze"));
 }
 assert.equal(seenIds.size,1352);
 assert.equal(packs.reduce((n,p)=>n+p.items.length,0),140);
 assert.equal(packs.reduce((n,p)=>n+p.uniqueUrls,0)<=140,true);
 assert.equal(new Set(packs.map(x=>x.host)).size,packs.length);
 const packed=new Map();
 for(const pack of packs)for(const item of pack.items){
  assert.ok(!packed.has(item.id),"Duplicate review workpack ID "+item.id);
  assert.equal(item.publicationGate,"HOLD_NO_AUTOMATIC_RELEASE");
  assert.ok(item.tags.includes("CURRENTNESS_REVIEW_DUE"));
  packed.set(item.id,item);
 }
 assert.equal(packed.size,140);
 const c=packed.get("OFFER-CFJM-019"),vsm=packed.get("OFFER-VSM-001");
 assert.ok(c&&vsm&&c.sourceUrl.startsWith("https://")&&vsm.sourceUrl.startsWith("https://"));
 const index=fs.readFileSync(path.join(dir,"index.html"),"utf8");
 assert.ok(index.includes('noindex,nofollow'));
 assert.ok(index.includes("3818")===false,"Source count is split by source authority");
 assert.ok(index.includes("1’352")&&index.includes("2’355"));
 const repeat=run(dir);
 assert.deepEqual(m.dataHashes,repeat.dataHashes,"Non-deterministic source hashes");
 assert.equal(repeat.counts.sourceWorkpacks,m.counts.sourceWorkpacks);
 assert.equal(fs.readdirSync(path.join(dir,"offers")).length,1352);
 // A future source-approved B3 addition must not break this pipeline merely
 // because the September baseline contained 1352 offers.
 const nextRoot=path.join(base,"expanded-input");
 for(const p of ["data.js","smart-search-data.js",
  "data/staging/target5-de-usa-wave1-r4-20260915.json",
  "data/staging/usa-owner-evidence-crosswalk-20261107.jsonl",
  "docs/b2/evt264-active-140-website-gold-field-gates-20261107.tsv"]){
   fs.mkdirSync(path.dirname(path.join(nextRoot,p)),{recursive:true});
   fs.copyFileSync(p,path.join(nextRoot,p));
 }
 const raw=fs.readFileSync(path.join(nextRoot,"data.js"),"utf8");
 const start=raw.indexOf("["),end=raw.lastIndexOf("]");
 const existing=JSON.parse(raw.slice(start,end+1));
 const extra={...existing[0],id:"TEST-FUTURE-ADD-2026",title:"Synthetic future course for build test"};
 fs.writeFileSync(path.join(nextRoot,"data.js"),raw.slice(0,start)+JSON.stringify([...existing,extra])+raw.slice(end+1));
 const sc=fs.readFileSync(path.join(nextRoot,"smart-search-data.js"),"utf8");
 const side=JSON.parse(sc.slice(sc.indexOf("{"),sc.lastIndexOf("}")+1));
 side.byId[extra.id]={...side.byId[existing[0].id]};
 if(side.meta?.rosterCount!=null)side.meta.rosterCount=1353;
 fs.writeFileSync(path.join(nextRoot,"smart-search-data.js"),
  "window.MEDIA_SKILLS_SMART_DATA = "+JSON.stringify(side)+";\n");
 const expandedDir=path.join(base,"expanded-output");
 const newManifest=run(expandedDir,{inputRoot:nextRoot});
 assert.equal(newManifest.counts.catalogue,1353);
 assert.equal(newManifest.counts.combinedSourceRows,3819);
 assert.equal(newManifest.counts.previewPages,1353);
 assert.equal(newManifest.counts.reviewHolds,140);
 assert.equal(fs.readdirSync(path.join(expandedDir,"offers")).length,1353);
 assert.ok(fs.readFileSync(path.join(expandedDir,"index.html"),"utf8").includes("1353 Katalogangebote"));

 console.log("TARGET5_BULK_PREVIEW_3818_ROWS_1352_DETAIL_PAGES_140_GROUPED_HOLDS_PASS "+
  JSON.stringify({manifest:m.counts,firstHost:packs[0].host}));
}finally{fs.rmSync(base,{recursive:true,force:true})}
