"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),os=require("node:os"),path=require("node:path"),crypto=require("node:crypto");
const {validate,project,materialize}=require("../scripts/catalogue-ingest-v1.cjs");
const sha=s=>crypto.createHash("sha256").update(fs.readFileSync(s)).digest("hex");
const input=JSON.parse(fs.readFileSync("tests/fixtures/b3-import-demo.json","utf8"));
assert.deepEqual(validate(input),[]);
const duplicate=structuredClone(input);
duplicate.offers.push({...structuredClone(input.offers[0]),id:"CH-DEMO-DJ-002"});
assert.ok(validate(duplicate).some(x=>x.includes("duplicate provider/title identity")));
const unknownField=structuredClone(input);
unknownField.offers[0].unmappedResearchClaim="not silently lost";
assert.ok(validate(unknownField).some(x=>x.includes("offer unknown field")));

const p=project(input);assert.equal(p.length,1);
const o=p[0].offer,s=p[0].sidecar;
assert.equal(o.learningTime.instructionDays.max,2);
assert.equal(o.priceCategory,"501_2000");assert.equal(o.country,"Nicht publiziert");
assert.equal(o.providerCountry,"CH");assert.equal(o.deliveryCountry,null);
assert.equal(o.publicationStatus,"HOLD");
assert.equal(o.sessions.length,1);assert.equal(o.sessions[0].availabilityStatus,undefined);
assert.equal(s.priceOptions[0].amount,750);
assert.equal(s.delivery.evidenceTier,"VERIFIED");
assert.equal(s.delivery.variants[0].temporalMode,"SYNCHRONOUS");
assert.equal(s.parserStatus,"AUTO_ACCEPT");
assert.ok(validate(input,new Set(["CH-DEMO-DJ-001"])).some(x=>x.includes("duplicate")));
const bad=structuredClone(input);bad.offers[0].prices[0].amount=-3;
assert.ok(validate(bad).some(x=>x.includes("invalid priced amount")));
const bad2=structuredClone(input);bad2.offers[0].source.verifiedFields=["title"];
assert.ok(validate(bad2).some(x=>x.includes("field-level source proof")));
const bad3=structuredClone(input);bad3.offers[0].occurrences[0].availability="OPEN";
assert.ok(validate(bad3).some(x=>x.includes("bookability requires dated official evidence")));
const hold=structuredClone(input);hold.offers[0].reviewStatus="HOLD";
hold.offers[0].access.chEligibility="UNKNOWN";
assert.deepEqual(validate(hold),[]);
assert.equal(project(hold)[0].offer.publicationStatus,"HOLD");
assert.equal(project(hold)[0].sidecar.priceEligible,false);
// Real legacy vocabulary must be accepted by the B3 import contract without
// downgrading SEMESTER/MODULE, conditional tariffs or price non-publication.
const schema=require("../schemas/media-skills-batch-v1.schema.json");
const sideRaw=fs.readFileSync("smart-search-data.js","utf8");
const sideFull=JSON.parse(sideRaw.slice(sideRaw.indexOf("{"),sideRaw.lastIndexOf("}")+1));
let checkedLegacyPrices=0;
for(const record of Object.values(sideFull.byId)){
  for(const price of record.priceOptions||[]){
    for(const field of ["amountType","tariffClass","eligibilityType","priceScope","billingBasis"]){
      assert.ok(schema.definitions.price.properties[field].enum.includes(price[field]),
        "B3 vocabulary would silently lose an existing "+field+"="+price[field]);
    }
    checkedLegacyPrices++;
  }
}
assert.ok(checkedLegacyPrices>1000,"Expected real price-option vocabulary census");
const priceBatch=patch=>{
  const batch=structuredClone(input);
  batch.offers[0].prices=[{...input.offers[0].prices[0],...patch}];
  return batch;
};
const fromOnly=priceBatch({amountType:"FROM",amount:null,minAmount:240});
assert.deepEqual(validate(fromOnly),[]);
const fromProjected=project(fromOnly)[0];
assert.equal(fromProjected.sidecar.priceOptions[0].minAmount,240);
assert.ok(fromProjected.offer.priceDisplay.includes("ab 240"));
const semester=priceBatch({amount:363.36,currency:"EUR",
  billingBasis:"SEMESTER",billingCount:2});
assert.deepEqual(validate(semester),[]);
const periodProjected=project(semester)[0];
assert.equal(periodProjected.sidecar.priceOptions[0].billingBasis,"SEMESTER");
assert.equal(periodProjected.sidecar.priceOptions[0].billingCount,2);
assert.equal(periodProjected.sidecar.priceEligible,false,
  "Period rate must not establish whole-course budget eligibility");
assert.ok(periodProjected.offer.priceDisplay.includes("pro Semester"));
const moduleTariff=priceBatch({amount:250,billingBasis:"MODULE",priceScope:"MODULE",
  tariffClass:"PROMOTIONAL",eligibilityType:"STUDENT_STATUS"});
assert.deepEqual(validate(moduleTariff),[]);
assert.equal(project(moduleTariff)[0].sidecar.priceEligible,false);
assert.ok(project(moduleTariff)[0].offer.priceDisplay.includes("pro Modul"));
const notApplicable=priceBatch({amountType:"NOT_APPLICABLE",amount:null,
  currency:null,priceScope:"UNKNOWN"});
assert.deepEqual(validate(notApplicable),[]);
assert.equal(project(notApplicable)[0].sidecar.priceEligible,false);
assert.equal(project(notApplicable)[0].offer.priceCategory,"NOT_APPLICABLE");
assert.equal(project(notApplicable)[0].offer.priceDisplay,"Preis nicht anwendbar");
const conditionalFree=priceBatch({amountType:"FREE",amount:0,
  tariffClass:"CONDITIONAL",eligibilityType:"NONE"});
assert.deepEqual(validate(conditionalFree),[]);
assert.equal(project(conditionalFree)[0].sidecar.priceEligible,false);
assert.notEqual(project(conditionalFree)[0].offer.priceCategory,"KOSTENLOS");
assert.match(project(conditionalFree)[0].offer.priceDisplay,/Bedingungen/);
const promotional=priceBatch({amount:399,tariffClass:"PROMOTIONAL"});
assert.deepEqual(validate(promotional),[]);
assert.equal(project(promotional)[0].sidecar.priceEligible,false);
console.log("B3_LEGACY_PRICE_VOCABULARY_AND_SAFE_PERIOD_IMPORT_PASS "+checkedLegacyPrices);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"b3-import-test-"));
const data=path.join(dir,"data.js"),side=path.join(dir,"smart-search-data.js");
try{
 fs.writeFileSync(data,'window.WEITERBILDUNGSRADAR_OFFERS = [\n{"id":"BASE-0001"}\n];\n');
 fs.writeFileSync(side,'window.MEDIA_SKILLS_SMART_DATA = {"meta":{"rosterCount":1},"byId":{"BASE-0001":{"parserStatus":"NEEDS_REVIEW"}}};\n');
 const firstDataSha=sha(data),firstSideSha=sha(side);
 assert.throws(()=>materialize(input,data,side,1,"0".repeat(64),firstSideSha),/SHA256_BASELINE_DRIFT/);
 const r=materialize(input,data,side,1,firstDataSha,firstSideSha);
 assert.equal(r.oldCount,1);assert.equal(r.newCount,2);
 const add=JSON.parse(fs.readFileSync(data,"utf8").split(" = ")[1].trim().replace(/;$/,""));
 const ps=JSON.parse(fs.readFileSync(side,"utf8").split(" = ")[1].trim().replace(/;$/,""));
 assert.deepEqual(add.map(x=>x.id),["BASE-0001","CH-DEMO-DJ-001"]);
 assert.equal(Object.keys(ps.byId).length,2);
 assert.equal(ps.meta.rosterCount,2);
 assert.throws(()=>materialize(input,data,side,2,sha(data),sha(side)),/duplicate stable offer ID/);
 assert.equal(JSON.parse(fs.readFileSync(data,"utf8").split(" = ")[1].trim().replace(/;$/,"")).length,2);
}finally{fs.rmSync(dir,{recursive:true,force:true})}
const duration=require("../duration-model.js");
assert.equal(duration.classify(o,2).status,"FIT");
assert.equal(duration.classify(o,1).status,"OVER");
console.log("B3_MASS_IMPORT_SCHEMA_PREVIEW_ATOMIC_APPEND_VALIDATION_PASS");
