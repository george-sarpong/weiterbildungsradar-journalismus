"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict");
function load(file) {
 const lines=fs.readFileSync(file,"utf8").trim().split(/\r?\n/);
 const keys=lines.shift().split("\t");
 return lines.map((line,index)=>{
   const values=line.split("\t");
   assert.equal(values.length,keys.length,"TSV width "+file+" row "+(index+2));
   return Object.fromEntries(keys.map((key,i)=>[key,values[i]]));
 });
}
const frozen=load("docs/b2/parallel-review-140-20261105.tsv");
const expected=frozen.filter(r=>r.lane.startsWith("R"));
const actual=load("docs/b2/remainder-101-source-differential-20261105.tsv");
assert.equal(frozen.length,140);assert.equal(expected.length,101);
assert.equal(actual.length,101);assert.equal(new Set(actual.map(x=>x.offer_id)).size,101);
const immutable=["lane","offer_id","provider","display_country","review_after","next_start","evidence_state","focus_field","source_url"];
for(let i=0;i<expected.length;i++){
 const row=actual[i],parent=expected[i];
 for(const key of immutable)assert.equal(row[key],parent[key],"lineage drift "+row.offer_id+"."+key);
 assert.ok(row.source_url.startsWith("https://"));
 assert.ok(row.decision.length>0);
 assert.ok(!/AUTO_PUBLISH|RELEASE_APPROVED|FULL_E4_VERIFIED|AUTO_D5/.test(row.recheck_state+"|"+row.decision));
 if(row.recheck_state==="PENDING_FRESH_FIELD_PROOF"){
   assert.equal(row.source_verified_fields,"");
   assert.equal(row.secondary_primary_url,"");
   assert.equal(row.decision,"NO_WRITE");
 }else{
   assert.ok(row.recheck_state.startsWith("PRIMARY_"));
   assert.ok(row.source_verified_fields.length>0);
   assert.ok(row.secondary_primary_url.startsWith("https://"));
   assert.ok(row.differential_note.length>30);
 }
}
const byLane={},partialByLane={},pendingByLane={};
for(const r of actual){
 byLane[r.lane]=(byLane[r.lane]||0)+1;
 if(r.recheck_state==="PENDING_FRESH_FIELD_PROOF")pendingByLane[r.lane]=(pendingByLane[r.lane]||0)+1;
 else partialByLane[r.lane]=(partialByLane[r.lane]||0)+1;
}
assert.deepEqual(byLane,{R01_DJA:21,R02_RUNNING:11,R03_JOURNALISM_LATER:9,R04_PCC_LATER:15,R05_TECH_LATER:26,R06_SINGLE_LATER:9,R07_UNDATED:10});
const partial=actual.filter(x=>x.recheck_state.startsWith("PRIMARY_"));
const pending=actual.filter(x=>x.recheck_state==="PENDING_FRESH_FIELD_PROOF");
assert.equal(partial.length,72);
assert.equal(pending.length,29);
assert.deepEqual(pendingByLane,{R04_PCC_LATER:2,R05_TECH_LATER:26,R06_SINGLE_LATER:1});
const get=id=>actual.find(x=>x.offer_id===id);
assert.ok(get("OFFER-CFJM-013").decision.includes("HOLD_2027_04_15_EDITION_NOT_SOURCE_PROVEN"));
assert.ok(get("OFFER-CFJM-005").decision.includes("HOLD_2027_03_01"));
assert.ok(get("OFFER-MAZ-151").decision.includes("OWNER_SCOPE_REVIEW_SIGNAL"));
assert.ok(get("AT-PROD-OFFER-144").decision.includes("HOLD_CH_GENERAL_ELIGIBILITY"));
assert.ok(get("PCC-P09").decision.includes("HOLD_2026_11_26_EDITION_FRESHNESS"));
assert.ok(get("PCC-P20").decision.includes("HOLD_PDL_PSI_ALIAS_CROSSWALK"));
assert.ok(get("LI-REG-003").decision.includes("HOLD_EXACT_EMPLOYMENT_ACCESS"));
assert.ok(actual.filter(x=>x.lane==="R01_DJA").every(x=>x.decision.includes("HOLD_")));
console.log("B2_REMAINDER101_SOURCE_DIFFERENTIAL_PASS",JSON.stringify({total:101,sourcePartial:72,pending:29,byLane,partialByLane,pendingByLane,publicationChanges:0}));
