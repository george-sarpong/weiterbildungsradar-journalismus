"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),
 path=require("node:path"),os=require("node:os"),crypto=require("node:crypto");
const {run}=require("../scripts/target5-evidence-bridge-v1.cjs");
const sha=f=>crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"sfj-evt271-"));
const read=(d,f)=>fs.readFileSync(path.join(d,f),"utf8");
const jsonl=(d,f)=>read(d,f).trim().split(/\r?\n/).map(JSON.parse);
try{
 const one=path.join(dir,"one"),two=path.join(dir,"two");
 const m=run(one);
 assert.equal(m.type,"TARGET5_EVT271_EVIDENCE_BRIDGE_READ_ONLY");
 assert.equal(m.publicationAllowed,false);
 assert.deepEqual(m.counts,{
   catalogue:1352,stagedDE:111,stagedUSA:2355,combinedRows:3818,
   dueCurrentness:117,protectedDue:145,dueB2:111,dueOutsideB2:6,
   cityOnlyOwnerFacts:21,uniqueHosts:25,occurrenceOnly:2,compositeSourceHolds:30});
 const catalogue=jsonl(one,"catalogue-field-bridge-1352.jsonl");
 const deUs=jsonl(one,"de-usa-owner-product-bridge-2466.jsonl");
 const due=jsonl(one,"unprotected-currentness-117.jsonl");
 const locked=jsonl(one,"locked-currentness-145.jsonl");
 const city=jsonl(one,"city-only-owner-21.jsonl");
 const hosts=JSON.parse(read(one,"host-workpacks-25.json"));
 assert.equal(catalogue.length,1352);assert.equal(deUs.length,2466);
 assert.equal(due.length,117);assert.equal(locked.length,145);
 assert.equal(city.length,21);assert.equal(hosts.length,25);
 assert.equal(new Set(catalogue.map(r=>r.id)).size,1352);
 assert.equal(new Set(deUs.map(r=>r.market+"/"+r.id)).size,2466);
 assert.equal(new Set(city.map(r=>r.id)).size,21);
 assert.equal(due.filter(r=>r.reviewPolicy==="B2_EXISTING_EVIDENCE_FIRST").length,111);
 assert.equal(due.filter(r=>r.reviewPolicy==="SIX_EXCEPTION_EXISTING_EVIDENCE_FIRST").length,6);
 assert.equal(locked.filter(r=>r.reviewPolicy==="HISTORICAL_NO_REOPEN").length,29);
 assert.equal(locked.filter(r=>r.reviewPolicy==="EVT270_HISTORICAL_NO_REOPEN_OUTSIDE_B2").length,116);
 assert.ok(due.every(r=>!r.protectedNoReopen&&r.reviewDue));
 assert.ok(locked.every(r=>r.protectedNoReopen&&r.reviewDue));
 assert.ok(!due.some(r=>locked.some(l=>l.id===r.id)));
 assert.equal(city.filter(x=>x.city==="Luzern").length,20);
 assert.equal(city.filter(x=>x.id==="OFFER-MAZ-100"&&x.city==="Zürich").length,1);
 assert.ok(city.every(r=>r.deliveryFormat==="NOT_PROVEN_BY_CITY_EVIDENCE"
   &&r.websiteGold===false&&r.status==="OWNER_CONFIRMED_CITY_ONLY"));
 assert.equal(deUs.filter(r=>r.kind==="OCCURRENCE_ONLY_DO_NOT_PROMOTE").length,2);
 const composite=deUs.filter(r=>r.sourceUrlStatus!=="SINGLE_SOURCE_URL_UNVERIFIED");
 assert.equal(composite.length,30);
 assert.ok(composite.every(r=>r.url===null&&r.sourceUrlCandidates.length>=1
    &&r.rawSourceUrl.startsWith("https://")));
 assert.equal(composite.filter(r=>r.unparsedSourceNotes.length).length,1);
 assert.ok(deUs.every(r=>r.sourceUrlCandidates.length>=1));
 assert.ok(deUs.some(r=>r.id==="USR-3561"&&r.sourceUrlStatus==="COMPOSITE_URL_AND_NOTE_HOLD"));
 assert.ok(deUs.every(r=>r.websiteGold==="NOT_PROVEN"
   &&r.publicationGate==="HOLD_NO_AUTOMATIC_RELEASE"
   &&r.chAccess==="UNKNOWN_NOT_INFERRED_FROM_R4_OR_OWNER"
   &&r.productFields.city==="NOT_IN_R4_SCHEMA"));
 assert.ok(catalogue.every(r=>r.publicationGate==="HOLD_NO_AUTOMATIC_RELEASE"
   &&r.chAccess==="UNKNOWN_NOT_INFERRED_FROM_LEGACY_TEXT"));
 assert.equal(hosts.reduce((sum,x)=>sum+x.count,0),117);
 for(const [name, expected] of Object.entries(m.outputs))
   assert.equal(sha(path.join(one,name)),expected,"Output SHA drift "+name);
 const repeat=run(two);
 assert.deepEqual(repeat.sources,m.sources);
 assert.deepEqual(repeat.outputs,m.outputs,"Non-deterministic product bridge export");
 // Adversarial: 29 protected records cannot be skipped by altered policy.
 const input=path.join(dir,"input");
 for(const f of ["data.js","smart-search-data.js",
  "data/staging/target5-de-usa-wave1-r4-20260915.json",
  "data/staging/usa-owner-evidence-crosswalk-20261107.jsonl",
  "docs/b2/evt264-active-140-website-gold-field-gates-20261107.tsv",
  "data/staging/evt270-currentness-policy-20261107.json"]){
  const to=path.join(input,f);fs.mkdirSync(path.dirname(to),{recursive:true});
  fs.copyFileSync(path.join(__dirname,"..",f),to);
 }
 const policyFile=path.join(input,"data/staging/evt270-currentness-policy-20261107.json");
 const policy=JSON.parse(fs.readFileSync(policyFile,"utf8"));
 policy.protectedB2.pop();
 fs.writeFileSync(policyFile,JSON.stringify(policy));
 assert.throws(()=>run(path.join(dir,"bad"),{inputRoot:input}),/EVT270_POPULATION_OR_POLICY_DRIFT/);
 console.log("TARGET5_EVT271_3818_BRIDGE_117_DUE_145_PROTECTED_21_CITY_NO_GOLD_PASS");
}finally{fs.rmSync(dir,{recursive:true,force:true})}
