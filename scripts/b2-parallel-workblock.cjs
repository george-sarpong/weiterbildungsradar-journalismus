"use strict";
// B2 parallel review workblock (read-only): deterministic coverage of currently
// visible overdue-review offers. Output is a WORK QUEUE, not evidence of defects.
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const raw=fs.readFileSync(path.join(root,"data.js"),"utf8");
const offers=JSON.parse(raw.slice(raw.indexOf("["),raw.lastIndexOf("]")+1));
const frozenNear=fs.readFileSync(path.join(root,"docs/b2/near-term-39-20261105.tsv"),"utf8")
  .trim().split(/\r?\n/).slice(1).map(line=>line.split("\t"));
const evidence39=new Map(frozenNear.map(c=>[c[0],c[3]]));
const assertOnlyOnce=(x,tag)=>assert.equal(new Set(x).size,x.length,tag+" must contain unique IDs");
assertOnlyOnce(offers.map(o=>o.id),"Canonical stable offers");
assertOnlyOnce([...evidence39.keys()],"Existing near-term source tranche");
function build(asOf){
  assert.match(asOf,/^20\d\d-\d\d-\d\d$/);
  const end=new Date(Date.parse(asOf+"T00:00:00Z")+14*86400000).toISOString().slice(0,10);
  const next=o=>Array.isArray(o.sessions)?o.sessions.filter(s=>s.startDate>=asOf&&s.availabilityStatus!=="SOLD_OUT")
    .sort((a,b)=>a.startDate.localeCompare(b.startDate))[0]:null;
  const visible=o=>o.publicationStatus!=="HOLD"&&(Array.isArray(o.sessions)?!!next(o):
    (!o.endDate||o.endDate>=asOf)&&(o.endDate||!o.startDate||o.startDate>=asOf));
  const current=offers.filter(visible);
  const due=current.filter(o=>o.reviewAfter&&o.reviewAfter<asOf);
  const lane=o=>{
    const nextStart=next(o)?.startDate||o.startDate||"";
    if(nextStart&&nextStart>=asOf&&nextStart<=end){
      if(o.provider?.startsWith("MAZ")||o.provider?.startsWith("CFJM"))return "N01_JOURNALISM";
      if(o.id.startsWith("PCC-")||o.provider?.startsWith("PC-COLLEGE"))return "N02_PCC";
      return "N03_OTHER";
    }
    if(o.id.startsWith("OFFER-DJA-")&&/nächster offener start nicht publiziert/i.test(o.start||"")
      &&/abgelaufen/i.test(o.start||""))return "R01_DJA";
    if(!Array.isArray(o.sessions)&&o.startDate&&o.startDate<asOf&&o.endDate&&o.endDate>=asOf)
      return "R02_RUNNING";
    if(Array.isArray(o.sessions)){
      if(/MAZ|CFJM/.test(o.provider||""))return "R03_JOURNALISM_LATER";
      if(/PC-COLLEGE/.test(o.provider||""))return "R04_PCC_LATER";
      return "R05_TECH_LATER";
    }
    if(o.startDate>=asOf)return "R06_SINGLE_LATER";
    return "R07_UNDATED";
  };
  const field=o=>{
    if(o.id==="OFFER-MAZ-149"||o.id==="OFFER-MAZ-156")return "journalistic_scope";
    const k=lane(o);
    if(k==="R01_DJA")return "next_application_window";
    if(k==="R02_RUNNING")return "late_booking_not_proven";
    if(k==="R07_UNDATED")return "intake_and_admission";
    if(o.priceCategory==="PREIS_AUF_ANFRAGE")return "edition_and_unpublished_price";
    return "edition_date_location_price_access";
  };
  const clean=x=>String(x??"").replace(/[\t\r\n]/g," ").trim();
  const rows=due.map(o=>({
    lane:lane(o),id:o.id,provider:o.provider||"",country:o.country||"",
    reviewAfter:o.reviewAfter,start:next(o)?.startDate||o.startDate||"",
    sourceState:evidence39.get(o.id)||(lane(o)==="R01_DJA"?"APP_BOOKING_GUARD_PRESENT":"DUE_ONLY_NOT_A_DEFECT"),
    field:field(o),url:o.url||""
  })).sort((a,b)=>a.lane.localeCompare(b.lane)||a.id.localeCompare(b.id));
  const header=["lane","offer_id","provider","display_country","review_after","next_start","evidence_state","focus_field","source_url"];
  const lines=[header.join("\t"),...rows.map(r=>[r.lane,r.id,r.provider,r.country,r.reviewAfter,r.start,
    r.sourceState,r.field,r.url].map(clean).join("\t"))];
  const tally={};
  for(const r of rows)tally[r.lane]=(tally[r.lane]||0)+1;
  const nearIds=rows.filter(r=>r.lane.startsWith("N")).map(r=>r.id);
  if(asOf==="2026-11-05"){
    assert.deepEqual({offers:offers.length,visible:current.length,due:rows.length,near:nearIds.length,
      other:rows.length-nearIds.length,existing39:evidence39.size},
      {offers:1352,visible:1108,due:140,near:39,other:101,existing39:39});
    assert.deepEqual(new Set(nearIds),new Set(evidence39.keys()),"No near-term identity drift");
    assert.deepEqual(Object.fromEntries(Object.entries(tally).sort()),{
      N01_JOURNALISM:15,N02_PCC:8,N03_OTHER:16,R01_DJA:21,R02_RUNNING:11,
      R03_JOURNALISM_LATER:9,R04_PCC_LATER:15,R05_TECH_LATER:26,
      R06_SINGLE_LATER:9,R07_UNDATED:10
    },"Worker ownership and row counts drifted");
  }
  assertOnlyOnce(rows.map(r=>r.id),"Work queue");
  return {tsv:lines.join("\n")+"\n",summary:{asOf,offers:offers.length,visible:current.length,
    due:rows.length,near:nearIds.length,residual:rows.length-nearIds.length,lanes:tally}};
}
const asOf=process.argv.find(x=>x.startsWith("--as-of="))?.slice(8)||"2026-11-05";
const result=build(asOf);
const locked=path.join(root,"docs/b2/parallel-review-140-20261105.tsv");
if(process.argv.includes("--assert-locked")){
  if(asOf!=="2026-11-05")throw Error("Locked snapshot requires --as-of=2026-11-05");
  assert.equal(fs.readFileSync(locked,"utf8"),result.tsv,"Workblock ledger drift");
}
if(process.argv.includes("--emit-tsv"))process.stdout.write(result.tsv);
else console.log("B2_PARALLEL_140_WORKBLOCK_PASS "+JSON.stringify(result.summary));
