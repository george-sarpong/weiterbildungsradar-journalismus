"use strict";
// Media Skills B2 W2: positive primary-source follow-ups for ifage and PC-COLLEGE.
// Source families remain independent; never turn a website CTA into a seat guarantee.
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const a=fs.readFileSync("data.js","utf8");
const roster=JSON.parse(a.slice(a.indexOf("["),a.lastIndexOf("]")+1));
const offer=id=>roster.find(o=>o.id===id);
const yes=(x,s)=>assert.ok(x,s);
yes(roster.length===1352&&new Set(roster.map(o=>o.id)).size===1352,"Stable 1352 ID count");
const G=offer("IF-G08"),M=offer("IF-G12"),P=offer("PCC-P27");
yes(G.provider.startsWith("ifage") && M.provider.startsWith("ifage"),"ifage parent IDs");
yes(G.url==="https://www.ifage.ch/formation/tic/formations-cao-dao-pao/indesign-niveau-1/" &&
  M.url==="https://www.ifage.ch/formation/tic/graphisme-infographie/mise-en-page-et-maquettage/",
  "Exact ifage product detail URLs");
yes(G.priceDisplay==="CHF 620"&&M.priceDisplay==="CHF 620"&&
    P.priceDisplay==="ab EUR 990 + MwSt.","Do not alter provider course fees");
const dates=o=>o.sessions.map(s=>s.startDate+".."+s.endDate);
yes(JSON.stringify(dates(G))===JSON.stringify(["2026-11-09..2026-11-13","2027-04-20..2027-05-04"]),
  "ifage InDesign 2026/2027 editions");
yes(G.sessions[0].availabilityStatus==="SOLD_OUT"&&
    G.sessions[1].availabilityStatus===undefined&&
    G.sessions[1].label.includes("Plätze nicht bestätigt"),"Only November 2026 edition explicitly full");
yes(JSON.stringify(dates(M))===JSON.stringify(["2026-11-16..2026-11-25","2027-05-11..2027-05-25"]),
  "ifage Mise en page editions and individual 25 Nov end date");
yes(M.sessions.every(s=>s.availabilityStatus===undefined),"No invented ifage seat confirmation");
const pDates=[
["2026-11-05","2026-11-06"],
["2027-01-18","2027-01-19"],["2027-02-15","2027-02-16"],
["2027-03-18","2027-03-19"],["2027-04-15","2027-04-16"],
["2027-05-10","2027-05-11"],["2027-06-07","2027-06-08"],
["2027-07-08","2027-07-09"],["2027-08-05","2027-08-06"],
["2027-08-30","2027-08-31"],["2027-09-27","2027-09-28"],
["2027-10-28","2027-10-29"],["2027-11-25","2027-11-26"]
];
yes(P.url==="https://www.pc-college.ch/seminar/programmieren-fuer-anfaenger/adobe-indesign-und-xml-seminar-schulung-ixm.php",
    "PC-COLLEGE exact source detail URL");
yes(P.startDate==="2026-11-05"&&P.endDate==="2026-11-06", "Original PC-COLLEGE top-level dates retained");
yes(P.sessions.length===pDates.length&&P.sessions.every((s,i)=>
  s.startDate===pDates[i][0]&&s.endDate===pDates[i][1]&&s.availabilityStatus===undefined),
  "13 source-backed edition windows, no seats asserted");
const app=fs.readFileSync("app.js","utf8");
const from=app.indexOf("  const ISO_DATE ="),to=app.indexOf("  // Ausgelaufene Präsenz-Sessions",from);
yes(from>=0&&to>from,"Source extraction for production nextSession");
const code=app.slice(from,to).replace("const today = new Date();","const today = new Date(2026,10,4);");
const run=vm.runInNewContext("(()=>{"+code+"return {nextSession,isCurrent};})()");
yes(run.nextSession(G).startDate==="2027-04-20"&&run.isCurrent(G)===true,
    "Production parser must skip fully-booked Nov 2026 edition and keep 2027");
yes(run.nextSession(M).startDate==="2026-11-16"&&run.nextSession(P).startDate==="2026-11-05",
    "Correct next edition per offer");
yes(roster.filter(o=>Array.isArray(o.sessions)).length===51&&
    roster.reduce((n,o)=>n+(o.sessions?.length||0),0)===152,
    "All B2 cumulative session rows, no unexpected additions");
const sideRaw=fs.readFileSync("smart-search-data.js","utf8");
const byId=JSON.parse(sideRaw.slice(sideRaw.indexOf("{"),sideRaw.lastIndexOf("}")+1)).byId;
for(const id of ["IF-G08","IF-G12"]) {
  const delivery=byId[id].delivery;
  yes(delivery.evidenceTier==="VERIFIED"&&delivery.structure==="SINGLE_CHANNEL"&&
      delivery.channels.join(",")==="IN_PERSON"&&
      delivery.variants.length===1&&delivery.variants[0].scheduleMode==="FIXED"&&
      delivery.variants[0].temporalMode==="SYNCHRONOUS"&&
      delivery.sourceText.startsWith(offer(id).url),id+" edition-specific in-person proof");
}
const J=offer("OFFER-CFJM-019");
yes(J.priceDisplay==="Preis nicht publiziert"&&J.region==="NOT_PUBLISHED",
    "JRI price and venue must remain unresolved");
yes(J.sessions?.length===2&&J.sessions[0].startDate==="2026-11-09"&&
    J.sessions[0].endDate==="2026-11-27"&&
    J.sessions[1].startDate==="2027-03-01"&&J.sessions[1].endDate==="2027-03-19"&&
    J.sessions.every(s=>!s.availabilityStatus), "CFJM JRI Mar 2027 session, no seat assertion");
console.log("B2_W2_IFAGE_BOOKED_OUT_NEXT_2027_PASS");
console.log("B2_W2_IFAGE_DETAILS_PRICE_AND_2027_SESSIONS_PASS");
console.log("B2_W2_PCC_13_EXACT_SESSIONS_PASS");
console.log("B2_W2_CFJM_JRI_MAR2027_PRESERVES_PRICE_HOLD_PASS");
console.log("B2_W2_1352_IDS_152_SESSIONS_PASS");
