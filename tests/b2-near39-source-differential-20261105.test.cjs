"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const read=p=>{
 const lines=fs.readFileSync(p,"utf8").trim().split(/\r?\n/);
 const heads=lines.shift().split("\t");
 return lines.map((line,i)=>{
  const values=line.split("\t");
  assert.equal(values.length,heads.length,"TSV width "+i);
  return Object.fromEntries(heads.map((k,j)=>[k,values[j]]));
 });
};
const src=read("docs/b2/parallel-review-140-20261105.tsv");
const near=src.filter(row=>row.lane.startsWith("N"));
const current=read("docs/b2/near-term-39-source-differential-20261105.tsv");
assert.equal(src.length,140);
assert.equal(near.length,39);
assert.equal(current.length,39);
assert.equal(new Set(current.map(row=>row.offer_id)).size,39);
for(const [i,row] of current.entries()){
 const original=near[i];
 for(const key of ["lane","offer_id","provider","display_country","review_after","next_start","evidence_state","focus_field","source_url"])
  assert.equal(row[key],original[key],"original source lineage drift: "+row.offer_id+"."+key);
 assert.ok(row.source_url.startsWith("https://"));
 assert.ok(row.decision.length>0);
 assert.ok(row.recheck_state!=="FULL_E4_VERIFIED");
 assert.ok(!/AUTO_PUBLISH|RELEASE_APPROVED|AUTO_D5/.test(row.decision));
}
const counts={};
for(const r of current) counts[r.lane]=(counts[r.lane]||0)+1;
assert.deepEqual(counts,{N01_JOURNALISM:15,N02_PCC:8,N03_OTHER:16});
const partially=current.filter(r=>r.recheck_state.startsWith("PRIMARY_"));
const pending=current.filter(r=>r.recheck_state==="PENDING_FRESH_EDITION_PROOF");
assert.equal(partially.length,29);
assert.equal(pending.length,10);
assert.ok(partially.every(r=>r.source_verified_fields.length>0&&r.differential_note.length>0));
assert.ok(pending.every(r=>!r.source_verified_fields&&r.decision==="NO_WRITE"));
assert.ok(current.some(r=>r.offer_id==="V78-02"&&r.decision==="HOLD_DURATION_SOURCE_CONFLICT"));
assert.ok(current.some(r=>r.offer_id==="OFFER-MAZ-100"&&r.decision==="SIDECAR_PRICE_PATCHED_DRAFT_GIT_ONLY|NO_RELEASE"));
assert.ok(current.some(r=>r.offer_id==="OFFER-MAZ-077"&&r.decision==="SIDECAR_PRICE_PATCHED_DRAFT_GIT_ONLY|NO_RELEASE"));
assert.ok(current.some(r=>r.offer_id==="OFFER-MAZ-080"&&r.decision==="HOLD_PRICE_VERSION_AND_TARIFF|NO_SIDECAR_PATCH"));
assert.ok(current.some(r=>r.offer_id==="OFFER-MAZ-146"&&r.decision==="NO_CHANGE_PRICE|IGNORE_STALE_SNAPSHOT"));
assert.ok(current.some(r=>r.offer_id==="PCC-P03"&&r.decision.includes("HOLD_SWISS_PRICE")));
assert.ok(current.some(r=>r.offer_id==="IF-G06"&&r.source_verified_fields.includes("5_sessions_x_3h")));
assert.ok(current.some(r=>r.offer_id==="OFFER-VSM-001"&&r.decision.includes("HOLD_BOOKING")));
console.log("B2_NEAR39_SOURCE_DIFFERENTIAL_READONLY_PASS",JSON.stringify({total:39,partiallyObserved:29,pendingFresh:10,counts,productionWrites:0}));
