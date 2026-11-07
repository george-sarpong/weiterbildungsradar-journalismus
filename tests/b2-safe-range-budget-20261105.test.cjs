/* B2 regression: financially safe whole-course ranges are not falsely downgraded. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const app=fs.readFileSync("app.js","utf8");
const extract=(start,end)=>{
  const a=app.indexOf(start), b=app.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,"Extraction boundary missing: "+start);
  return app.slice(a,b);
};
const blocks=[
  extract("  function isDateActive(option) {","  const amountWithRequiredComponents ="),
  extract("  const NON_TUITION_COST_TYPES = new Set([","  const priceCategoryForDisplay ="),
  extract("  const amountWithRequiredComponents =","  const freeStatusRank ="),
  extract("  const optionLabel =","  const smartEvaluate ="),
  extract("  const smartBudgetText =","  const smartCard =")
];
const api=vm.runInNewContext("(()=>{const ISO_DATE=/^\\d{4}-\\d{2}-\\d{2}$/;"+
  "const today=new Date(2026,10,5);const compactPrice=()=>'';"+
  blocks.join("\n")+"return {resolveBudget,optionLabel,smartBudgetText};})()");
const priceRaw=fs.readFileSync("smart-search-data.js","utf8");
const prices=JSON.parse(priceRaw.slice(priceRaw.indexOf("{"),priceRaw.lastIndexOf("}")+1));
const r=prices.byId["OFFER-DJA-009"];
assert.equal(r.parserStatus,"AUTO_ACCEPT");
assert.equal(r.priceEligible,true);
const base=r.priceOptions.find(o=>o.amountType==="RANGE");
assert.ok(base&&base.minAmount===480&&base.maxAmount===512);
const delivery={matchedVariantIds:[]};
const match=(budget,option=base,currency="CHF",parser=r)=>{
 const x=api.resolveBudget({}, {...parser,priceOptions:[option]},
   {budget:{amount:budget,currency},freeOnly:false,deliveryIntents:[]},delivery);
 return x;
};
for(const [n,expected] of [[479,"OVER_BUDGET"],[480,"POSSIBLE_FIT"],
 [500,"POSSIBLE_FIT"],[511,"POSSIBLE_FIT"],[512,"DIRECT_FIT"],
 [513,"DIRECT_FIT"],[800,"DIRECT_FIT"]]){
 assert.equal(match(n).status,expected,"EUR-range vs CHF "+n);
}
assert.equal(match(800).amount,512,"Use conservative upper bound, not minimum");
assert.equal(match(800,base,"EUR").status,"DIRECT_FIT","Same-currency safe range");
assert.equal(match(800,base,"GBP").status,"PRICE_UNKNOWN","No invented GBP FX");
assert.equal(match(800,{...base,maxAmount:null}).status,"POSSIBLE_FIT","Unbounded range");
assert.equal(match(800,{...base,maxAmount:400}).status,"POSSIBLE_FIT","Inverted bounds");
assert.equal(match(800,{...base,taxMode:"EXCLUDED"}).status,"POSSIBLE_FIT","Excluded tax");
assert.equal(match(800,{...base,eligibilityType:"MEMBERSHIP"}).status,"POSSIBLE_FIT","Conditional tariff");
assert.equal(match(800,{...base,priceScope:"VARIANT"}).status,"POSSIBLE_FIT","Variant-only tariff");
assert.equal(match(800,{...base,billingBasis:"MONTHLY"}).status,"PRICE_UNKNOWN","Unbounded non-total billing");
assert.equal(match(800,{...base,billingBasis:"MONTHLY",billingCount:2}).status,"PRICE_UNKNOWN","A billing count without a sourced whole-course total cannot establish fit");
const jo=prices.byId["AT-PROD-OFFER-022"];
assert.equal(jo.priceOptions[0].billingBasis,"SEMESTER");
assert.equal(jo.priceOptions[0].billingCount,null);
assert.equal(match(8000,jo.priceOptions[0],"EUR",jo).status,"PRICE_UNKNOWN","Unknown whole-programme semester count must not become POSSIBLE_FIT");
assert.equal(match(800,{...base,deliveryVariantRefs:["ONLINE"]}).status,"POSSIBLE_FIT","Unbound delivery variant");
assert.equal(match(800,{...base,components:[{componentType:"ENROLLMENT_FEE",requirementStatus:"REQUIRED",amountType:"EXACT",amount:25}]}).status,"POSSIBLE_FIT","Mandatory component");
assert.equal(match(800,{...base,validThrough:"2026-11-04"}).status,"PRICE_UNKNOWN","Expired price");
assert.equal(match(800,{...base,validFrom:"2026-11-06"}).status,"PRICE_UNKNOWN","Future price");
assert.equal(match(800,{...base,amountType:"FROM",maxAmount:null}).status,"POSSIBLE_FIT","FROM never upgraded");
assert.equal(match(800,{...base,amountType:"EXACT",amount:480}).status,"DIRECT_FIT","EXACT regression");
const result=match(800);
assert.match(api.optionLabel({},result),/EUR 480–512/);
const same=match(800,base,"EUR");
const remaining=api.smartBudgetText({budget:same},{budget:{amount:800,currency:"EUR"}});
assert.match(remaining,/mindestens EUR 288/);
const fx=api.smartBudgetText({budget:result},{budget:{amount:800,currency:"CHF"}});
assert.match(fx,/1:1-Vergleich/);assert.doesNotMatch(fx,/bleiben CHF/);
assert.ok(!app.includes("Kurs ist buchbar"),"No new booking guarantee");
const rangeOptions=Object.values(prices.byId).flatMap(x=>x.priceOptions||[]).filter(x=>x.amountType==="RANGE");
assert.equal(rangeOptions.length,26,"No sidecar price-option mutation");
console.log("B2_SAFE_RANGE_BUDGET_7_THRESHOLDS_AND_12_GUARDS_PASS");
