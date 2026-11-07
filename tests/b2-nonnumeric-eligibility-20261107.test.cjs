"use strict";
// Entire current sidecar: a nonnumeric price is not a budget-fit candidate.
// Counts describe the verified 2026-11-07 draft; no provider source is rewritten.
const assert=require("node:assert/strict"),fs=require("node:fs");
const raw=fs.readFileSync("smart-search-data.js","utf8");
const side=JSON.parse(raw.slice(raw.indexOf("{"),raw.lastIndexOf("}")+1));
const records=Object.entries(side.byId);
assert.equal(records.length,1352,"Stable offer/sidecar count changed unexpectedly");
const numeric=new Set(["EXACT","FROM","RANGE","FREE"]);
const types=Object.create(null),parser=Object.create(null),tier=Object.create(null);
let eligible=0,invalid=[],priceOptions=0,distinct=new Set();
for(const [id,r] of records){
 assert.ok(!distinct.has(id),"Duplicate stable ID: "+id);distinct.add(id);
 parser[r.parserStatus]=(parser[r.parserStatus]||0)+1;
 const t=r.delivery?.evidenceTier||"UNKNOWN";tier[t]=(tier[t]||0)+1;
 for(const p of r.priceOptions||[]){
  const kind=p.amountType||"MISSING";types[kind]=(types[kind]||0)+1;
  priceOptions++;
 }
 if(r.priceEligible===true){
  eligible++;
  if(!(r.priceOptions||[]).some(p=>numeric.has(p.amountType)))
   invalid.push(id);
 }
}
assert.deepEqual(invalid,[],"Nonnumeric options must never be budget eligible");
assert.equal(eligible,757,"Expected targeted 226-case price flag remediation");
assert.equal(priceOptions,1226,"Price-option identities unexpectedly modified");
for(const [type,count] of Object.entries({
 EXACT:893,NOT_PUBLISHED:219,FREE:52,ON_REQUEST:7,
 NOT_APPLICABLE:2,RANGE:26,FROM:27
}))assert.equal(types[type],count,"Unexpected price-option change: "+type);
assert.equal(parser.AUTO_ACCEPT,1028);
assert.equal(parser.NEEDS_REVIEW,324);
assert.equal(tier.VERIFIED,210);
assert.equal(tier.PROVISIONAL,393);
assert.equal(tier.UNKNOWN,749);
const cfjm=side.byId["OFFER-CFJM-019"];
assert.equal(cfjm.parserStatus,"NEEDS_REVIEW");
assert.equal(cfjm.priceEligible,false);
assert.equal(cfjm.priceOptions[0].amountType,"NOT_PUBLISHED");
// The active 140-row review register must reflect the same current sidecar;
// existing field-specific holds and release gates remain untouched.
const lines=fs.readFileSync(
 "docs/b2/evt262-active-140-website-gold-field-gates-20261107.tsv","utf8"
).trim().split(/\r?\n/);
const headers=lines.shift().split("\t");
const at=key=>{const i=headers.indexOf(key);assert.ok(i>=0,key);return i};
const ids=new Set();
for(const line of lines){
 const r=line.split("\t"),id=r[at("offer_id")],entry=side.byId[id];
 assert.ok(entry,"140 register ID missing from sidecar: "+id);
 assert.ok(!ids.has(id),"Duplicate B2 ID: "+id);ids.add(id);
 assert.equal(String(entry.priceEligible),r[at("structured_numeric_price_eligible")],
   "Budget-eligibility drift for "+id);
 assert.equal(entry.parserStatus,r[at("structured_price_parser_status")],
   "Parser-status drift for "+id);
 assert.equal(entry.delivery?.evidenceTier,r[at("delivery_evidence_tier")],
   "Delivery tier drift for "+id);
 assert.equal(r[at("website_gold_gate")],"NOT_PROVEN");
 assert.equal(r[at("publication_gate")],"HOLD_NO_AUTOMATIC_RELEASE");
}
assert.equal(ids.size,140);
console.log("B2_1352_NUMERIC_PRICE_AND_140_FIELD_JOIN_PASS "+
 JSON.stringify({offers:records.length,numericEligible:eligible,checkedOptions:priceOptions,
  crosswalk:ids.size,nonnumericEligible:invalid.length}));
