"use strict";
// Reproducible local review queue. Does not perform remote research or certify freshness.
const fs=require("node:fs"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const a=process.argv.find(x=>x.startsWith("--as-of="));
if(!a)throw Error("Usage: --as-of=YYYY-MM-DD");
const day=a.slice(8);
if(!/^20\d{2}-\d{2}-\d{2}$/.test(day))throw Error("Invalid date");
const r=fs.readFileSync("data.js","utf8"),b=fs.readFileSync("smart-search-data.js","utf8");
const offers=JSON.parse(r.slice(r.indexOf("["),r.lastIndexOf("]")+1));
const side=JSON.parse(b.slice(b.indexOf("{"),b.lastIndexOf("}")+1)).byId;
const next=o=>Array.isArray(o.sessions)?o.sessions.filter(s=>s.startDate>=day&&s.availabilityStatus!=="SOLD_OUT").sort((a,b)=>a.startDate.localeCompare(b.startDate))[0]:null;
const active=o=>o.publicationStatus!=="HOLD"&&(Array.isArray(o.sessions)?!!next(o):(!o.endDate||o.endDate>=day)&&(o.endDate||!o.startDate||o.startDate>=day));
const lane=o=>{const p=o.provider||"";if(p.startsWith("MAZ"))return "CH_MAZ";if(p.startsWith("CFJM"))return "CH_CFJM";if(p.startsWith("ifage"))return "CH_IFAGE";if(p.startsWith("PC-COLLEGE"))return "CH_PCC";if(p.startsWith("Deutsche Journalisten"))return "DE_DJA";if(/Microwin|ITTA|Cadschool|Dawan|ORSYS/.test(p))return "CH_TECH_MISC";if(o.id.startsWith("AT-"))return /fjum/i.test(p)?"AT_FJUM":/WIFI/i.test(p)?"AT_MISC":"AT_ACADEMIC";if(o.id.startsWith("LI-"))return "LI";return "CH_OTHER";};
const current=offers.filter(active),due=current.filter(o=>o.reviewAfter&&o.reviewAfter<day);
// Visible, already-started offers with a future end do not prove late admission.
// Keep this as a disjoint observation from the source-review due queue.
const running=current.filter(o=>!Array.isArray(o.sessions)&&o.startDate&&o.startDate<day&&o.endDate&&o.endDate>=day);
const runningTypes={},runningCountries={};
for(const o of running){runningTypes[o.offerType]=(runningTypes[o.offerType]||0)+1;
  runningCountries[o.country]=(runningCountries[o.country]||0)+1;}
const ongoingCohort={count:running.length,reviewDue:running.filter(o=>o.reviewAfter&&o.reviewAfter<day).length,byType:runningTypes,byCountry:runningCountries};
const risk=due.map(o=>{const start=next(o)?.startDate||o.startDate||"";
const days=start?Math.round((Date.parse(start)-Date.parse(day))/86400000):null;
const flags=["REVIEW_DUE"];let score=20;
if(days!=null&&days>=0&&days<=14){flags.push("START_14D");score+=60;}
if(["PCC-P01","PCC-P13","PCC-P20","IF-G06"].includes(o.id)){flags.push("SOURCE_CONFLICT");score+=35;}
if(o.format==="NICHT_PUBLIZIERT"||o.region==="NOT_PUBLISHED"){flags.push("DELIVERY_UNKNOWN");score+=9;}
if(o.provider?.startsWith("Deutsche Journalisten")){flags.push("DJA_INTAKE_SOURCE_CONFLICT");score+=10;}
return {id:o.id,lane:lane(o),score,flags,reviewAfter:o.reviewAfter,start:start||null,url:o.url};
}).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
const counts={};for(const o of risk)counts[o.lane]=(counts[o.lane]||0)+1;
let rows=0,duplicates=0,badDates=0,soldOut=0;
for(const o of offers){const seen=new Set();for(const s of o.sessions||[]){rows++;
const k=s.startDate+"|"+s.endDate;if(seen.has(k))duplicates++;seen.add(k);
if(s.endDate && s.endDate<s.startDate)badDates++;if(s.availabilityStatus==="SOLD_OUT")soldOut++;}}
const hash=s=>crypto.createHash("sha256").update(s).digest("hex");
const report={kind:"READ_ONLY_NOT_SOURCE_VERIFICATION",asOf:day,sha:{data:hash(r),sidecar:hash(b)},totals:{offers:offers.length,unique:new Set(offers.map(o=>o.id)).size,sidecar:Object.keys(side).length,visible:current.length,due:due.length,rows,duplicates,badDates,soldOut},laneCounts:counts,cohorts:{startedButRunning:ongoingCohort},reviewQueue:process.argv.includes("--summary")?risk.slice(0,12):risk};
if(process.argv.includes("--assert-baseline"))assert.deepEqual(report.totals,{offers:1352,unique:1352,sidecar:1352,visible:1112,due:137,rows:325,duplicates:0,badDates:0,soldOut:4});
if(process.argv.includes("--assert-baseline"))assert.deepEqual(report.cohorts.startedButRunning,{
  count:57,reviewDue:8,byType:{KURS:39,STUDIUM:8,PROGRAMM:10},byCountry:{"Schweiz":53,"Österreich":4}
});
if(process.argv.includes("--assert-baseline")) {
  const wifi=offers.find(o=>o.id==="AT-PROD-OFFER-073");
  assert(wifi,"WIFI podcast archive offer missing");
  assert.equal(wifi.startDate,"2026-09-23");
  assert.equal(wifi.endDate,"2026-10-20");
  assert.equal(active(wifi),false,"Completed WIFI podcast edition must not be visible");
}
console.log(JSON.stringify(report));
