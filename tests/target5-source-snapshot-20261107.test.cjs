"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const {jobs,download,snapshot}=require("../scripts/target5-source-snapshot-v1.cjs");
async function main(){
 const packs=[{host:"example.edu",items:[
  {id:"OFFER-1",sourceUrl:"https://example.edu/courses/a",tags:["CURRENTNESS_REVIEW_DUE"]},
  {id:"OFFER-2",sourceUrl:"https://example.edu/courses/a",tags:["VENUE_NOT_PUBLISHED"]},
  {id:"OFFER-3",sourceUrl:"https://example.edu/courses/b",tags:["DELIVERY_NOT_VERIFIED"]}
 ]}];
 const work=jobs(packs);
 assert.equal(work.length,2);assert.deepEqual(work[0].offerIds,["OFFER-1","OFFER-2"]);
 assert.equal(work[0].fieldTags.length,2);
 assert.throws(()=>jobs([{items:[{sourceUrl:"http://localhost/admin",id:"BAD"}]}]),/Unsafe source URL/);
 assert.throws(()=>jobs(packs,{limit:1}),/volume exceeds/);
 const html='<html lang="de"><head><title>KI-Kurs 2026</title>'+
 '<link rel="canonical" href="https://example.edu/courses/a">'+
 '<script type="application/ld+json">{"@type":"Course","name":"KI-Kurs"}</script></head>'+
 '<body><p>CHF 400</p><time>2026-12-12</time></body></html>';
 let calls=0;
 const fetchImpl=async url=>{calls++;
  if(url.includes("/b"))return new Response("Service Unavailable",{status:503});
  return new Response(html,{status:200,headers:{"content-type":"text/html; charset=utf-8"}});
 };
 const result=await download("https://example.edu/courses/a",{fetchImpl});
 assert.equal(result.state,"SOURCE_FETCHED_NOT_FIELD_VERIFIED");
 assert.equal(result.title,"KI-Kurs 2026");assert.equal(result.htmlLang,"de");
 assert.equal(result.canonicalUrl,"https://example.edu/courses/a");
 assert.deepEqual(result.structuredTypes,["Course"]);
 assert.deepEqual(result.priceSignals,["CHF 400"]);
 assert.deepEqual(result.dateSignals,["2026-12-12"]);
 assert.equal(result.bodySha256.length,64);
 const dateAsFeeHtml='<html><title>Source</title><body>€ 07.11.2026 / EUR 1250</body></html>';
 const dateAsFee=await download("https://example.edu/courses/a",{
  fetchImpl:async()=>new Response(dateAsFeeHtml,{status:200,headers:{"content-type":"text/html"}})
 });
 assert.ok(!dateAsFee.priceSignals.includes("€ 07.11.2026"),
   "A formatted date prefixed by EUR symbol must never be extracted as a fee");
 assert.ok(dateAsFee.priceSignals.some(x=>x.includes("1250")));

 const invalid=await download("http://localhost:8080/secret",{fetchImpl});
 assert.equal(invalid.state,"INVALID_SOURCE_URL");assert.equal(calls,1);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"ms-source-crawl-"));
 try{
  const run=await snapshot(packs,tmp,{fetchImpl,delayMs:0,concurrency:2,
   now:()=>"2026-11-07T00:00:00.000Z"});
  assert.equal(run.sourceUrls,2);assert.equal(run.offerRefs,3);assert.equal(run.hostCount,1);
  assert.equal(run.states.SOURCE_FETCHED_NOT_FIELD_VERIFIED,1);
  assert.equal(run.states.HTTP_ERROR,1);
  assert.equal(run.autoValidatedGold,0);assert.equal(run.autoPublished,0);
  const lines=fs.readFileSync(path.join(tmp,"source-signals.jsonl"),"utf8").trim().split("\n")
   .map(x=>JSON.parse(x));
  assert.equal(lines.length,2);
  assert.ok(lines.every(x=>x.autoCloseGold===false&&x.autoRelease===false&&x.fieldState==="REVIEW_REQUIRED"));
  assert.ok(lines.some(x=>x.status===503&&x.state==="HTTP_ERROR"));
  assert.equal(fs.readFileSync(path.join(tmp,"source-summary.json"),"utf8").includes("SOURCE_SIGNAL_SNAPSHOT_ONLY"),true);
 }finally{fs.rmSync(tmp,{recursive:true,force:true})}
 console.log("TARGET5_SOURCE_SNAPSHOT_GROUPED_RATE_LIMITED_SIGNAL_ONLY_PASS");
}
main().catch(e=>{console.error(e.stack);process.exitCode=1});
