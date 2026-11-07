"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const ownerFile="data/staging/usa-owner-evidence-crosswalk-20261107.jsonl";
const stage=JSON.parse(fs.readFileSync("data/staging/target5-de-usa-wave1-r4-20260915.json","utf8"));
const lines=fs.readFileSync(ownerFile,"utf8").trim().split(/\r?\n/);
const header=JSON.parse(lines.shift());
assert.equal(header._type,"SOURCE_LINED_PROJECTION_NOT_AUTHORITATIVE");
assert.equal(header.status,"EVIDENCE_NOT_SWISS_ACCESS_PROOF");
assert.equal(header.sourceOwnerDrive,"10K0QvTljMwxWPGRIa7wNbB5mpO2Px0u70QuimUwGFjE");
const row=lines.map(x=>JSON.parse(x)),usa=stage.records.filter(r=>r.country==="USA");
assert.equal(row.length,2355);assert.equal(usa.length,2355);
const by=new Map(usa.map(x=>[x.record_id,x]));
const seen=new Set(),groups={},noteCount={access:0,programme:0};let urls=0;
for(const record of row){
 assert.ok(by.has(record.record_id),"Owner row outside USA R4: "+record.record_id);
 assert.ok(!seen.has(record.record_id),"Duplicate owner evidence ID: "+record.record_id);seen.add(record.record_id);
 const pub=by.get(record.record_id);
 assert.equal(record.programmeReleaseUrl,pub.source_url,"Mismatched source URL for "+record.record_id);
 assert.equal(record.ownerCheckOnly,true);
 assert.ok(!Object.prototype.hasOwnProperty.call(record,"chEligibility"),
   "Swiss access not source-verified; cannot infer eligibility from owner notes");
 assert.ok(!Object.prototype.hasOwnProperty.call(record,"price"),
   "No price present in owner evidence");
 if(record.ownerPrimarySource){
  assert.ok(/^https:\/\//.test(record.ownerPrimarySource));
  urls++;
 }
 if(record.accessEvidenceText)noteCount.access++;
 if(record.notes)noteCount.programme++;
 const type=record.ownerEvidenceClass;groups[type]=(groups[type]||0)+1;
}
assert.equal(seen.size,usa.length);
assert.equal(groups.HISTORICAL_OWNER_SOURCE_ROW,2290);
assert.equal(groups.KNIGHT_20260915_SOURCE_CLUSTER,58);
assert.equal(groups.KNIGHT_CURRENT_RELEASE_NO_ATTACHED_STRUCTURED_OWNER_ROW,7);
assert.ok(noteCount.access>2200,"Existing owner access notes missing");
assert.ok(urls>2200,"Owner source URLs missing");
console.log("TARGET5_USA_2355_OWNER_EVIDENCE_REUSE_PASS "+
 JSON.stringify({groups,noteCount,urls}));
