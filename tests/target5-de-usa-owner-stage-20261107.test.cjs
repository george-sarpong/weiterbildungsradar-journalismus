"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const d=JSON.parse(fs.readFileSync("data/staging/target5-de-usa-wave1-r4-20260915.json","utf8"));
assert.equal(d.snapshotType,"NON_AUTHORITATIVE_READONLY_OWNER_PUBLICATION_PROJECTION");
assert.equal(d.status,"STAGING_NOT_WEBSITE_GOLD_NOT_PUBLISHED");
assert.equal(d.sourceDriveSpreadsheetId,"1s6nKTq56BCli70sr0Jsf-sn2pxVaaZ0EBjA9X9lCNQU");
assert.equal(d.records.length,2466);
assert.deepEqual(d.expectedCount,{DE:111,USA:2355});
const expected=[
"country","record_id","provider_id","provider","title","object_type",
"currentness","access_status","scope","source_url","source_layer",
"source_publication_class","release_status","source_package"
];assert.deepEqual(d.columns,expected);
const seen=new Set(),by={DE:0,USA:0},missing={},occurrences={DE:0,USA:0};
for(const record of d.records){
 assert.ok(record.country in by,"Off-scope country must never be imported "+record.country);
 by[record.country]++;
 const key=record.country+"|"+record.record_id;
 assert.ok(!seen.has(key),"Duplicate country+record identity "+key);seen.add(key);
 for(const field of expected)assert.ok(Object.prototype.hasOwnProperty.call(record,field),
  "Missing source field "+field+" "+key);
 for(const key of ["record_id","provider","title","source_url"])
  assert.ok(String(record[key]).trim(),"Missing critical source field "+record.record_id+" "+key);
 assert.ok(/^https:\/\/\S+/.test(record.source_url),"Invalid source URL "+record.record_id);
 assert.equal(record.provider_id,"","Never invent provider IDs for this 2026-09 baseline");
 assert.ok(!Object.prototype.hasOwnProperty.call(record,"price"),
  "Owner publication has no verified price; do not manufacture Website-Gold");
 assert.ok(!Object.prototype.hasOwnProperty.call(record,"accessModel"),
  "Owner source access_status does not prove personal Swiss eligibility");
 assert.ok(!Object.prototype.hasOwnProperty.call(record,"deliveryVariants"),
  "Owner publication has no actual delivery variant proof");
 if(/OCCURRENCE_ONLY|WEBINAR_OCCURRENCE/i.test(record.object_type))
  occurrences[record.country]++;
 for(const field of expected)
  if(!record[field])missing[record.country+"."+field]=(missing[record.country+"."+field]||0)+1;
}
assert.deepEqual(by,{DE:111,USA:2355});
assert.equal(missing["DE.access_status"],111);
assert.equal(missing["DE.currentness"],8);
assert.equal(missing["USA.scope"],2290);
assert.equal(missing["USA.access_status"],2);
assert.equal(missing["USA.currentness"],2);
assert.equal(missing["USA.provider_id"],2355);
assert.ok(occurrences.USA>=2,"USA occurrence-only rows must not become stable course identities");
// The existing 1,352 CH/AT/LI website catalogue is a different authority;
// this source snapshot must never be appended to its released data.js.
console.log("TARGET5_OWNER_DE111_US2355_STAGE_PROVENANCE_PASS "+
 JSON.stringify({by,blankDEAccess:missing["DE.access_status"],
  blankUSAScope:missing["USA.scope"],occurrenceOnly:occurrences.USA}));
