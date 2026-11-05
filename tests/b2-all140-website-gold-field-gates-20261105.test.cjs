"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict");
function rows(path){
 const lines=fs.readFileSync(path,"utf8").trim().split(/\r?\n/);
 const header=lines.shift().split("\t");
 const data=lines.map((line,i)=>{
  const v=line.split("\t");
  assert.equal(v.length,header.length,path+" width on line "+(i+2));
  return Object.fromEntries(header.map((k,j)=>[k,v[j]]));
 });
 return {header,data};
}
function parseWindow(file,open,close){
 const s=fs.readFileSync(file,"utf8");
 return JSON.parse(s.slice(s.indexOf(open),s.lastIndexOf(close)+1));
}
const freeze=rows("docs/b2/parallel-review-140-20261105.tsv");
const near=rows("docs/b2/near-term-39-source-differential-20261105.tsv");
const rest=rows("docs/b2/remainder-101-source-differential-20261105.tsv");
const matrix=rows("docs/b2/all-140-website-gold-field-gates-20261105.tsv");
const backlog=rows("docs/b2/all-140-priority-evidence-backlog-20261105.tsv");
const offers=parseWindow("data.js","[","]");
const side=parseWindow("smart-search-data.js","{","}");
assert.equal(offers.length,1352);
assert.equal(Object.keys(side.byId).length,1352);
assert.equal(freeze.data.length,140);assert.equal(near.data.length,39);assert.equal(rest.data.length,101);
assert.equal(matrix.header.length,57);assert.equal(matrix.data.length,140);
assert.equal(new Set(matrix.data.map(r=>r.offer_id)).size,140);
const prev=new Map([...near.data,...rest.data].map(x=>[x.offer_id,x]));
const obj=new Map(offers.map(x=>[x.id,x]));
const baseFields=freeze.header;
for(const [i,row] of matrix.data.entries()){
 const parent=freeze.data[i],source=prev.get(row.offer_id),offer=obj.get(row.offer_id),sc=side.byId[row.offer_id];
 assert.ok(parent&&source&&offer&&sc,row.offer_id+" missing parent/source/canonical/sidecar");
 for(const key of baseFields)assert.equal(row[key],parent[key],row.offer_id+" frozen."+key);
 assert.equal(row.source_recheck_state,source.recheck_state);
 assert.equal(row.source_verified_fields,source.source_verified_fields);
 assert.equal(row.source_differential_note,source.differential_note);
 assert.equal(row.source_decision,source.decision);
 assert.equal(row.provider_secondary_source,source.secondary_primary_url||"");
 assert.equal(row.catalogue_title,offer.title);
 assert.equal(row.catalogue_provider,offer.provider);
 assert.equal(row.catalogue_country,offer.country);
 assert.equal(row.catalogue_description,offer.description||"");
 assert.equal(row.catalogue_language,offer.language||"");
 assert.equal(row.catalogue_level,offer.level||"");
 assert.equal(row.catalogue_source_url,offer.url);
 assert.equal(row.catalogue_source_url,row.source_url);
 assert.equal(row.canonical_source_url_alignment,"EXACT_MATCH");
 assert.equal(row.catalogue_release_origin,offer.release_origin||"");
 assert.equal(row.catalogue_start_text,offer.start||"");
 assert.equal(row.catalogue_existing_publication_flag,offer.publicationStatus||"UNSPECIFIED_LEGACY");
 assert.equal(row.catalogue_price_text,offer.priceDisplay||"");
 assert.equal(row.catalogue_region,offer.region||"");
 assert.equal(row.catalogue_access_text,offer.access||"");
 assert.equal(row.catalogue_format,offer.format||"");
 assert.equal(row.catalogue_duration,offer.duration||"");
 assert.equal(row.catalogue_start_date,offer.startDate||"");
 assert.equal(row.catalogue_end_date,offer.endDate||"");
 assert.equal(row.materialized_session_count,String((offer.sessions||[]).length));
 assert.equal(row.structured_numeric_price_eligible,String(sc.priceEligible===true));
 assert.equal(row.structured_price_option_count,String((sc.priceOptions||[]).length));
 assert.equal(row.delivery_evidence_tier,sc.delivery?.evidenceTier||"");
 const actualDate=row.next_start;
 const starts=[offer.startDate,...(offer.sessions||[]).map(s=>s.startDate)].filter(Boolean);
 assert.equal(row.scheduled_date_alignment,!actualDate?"NO_SPECIFIC_DUE_START":starts.includes(actualDate)?"MATCHES_EXISTING_START_OR_SESSION":"DUE_DATE_NOT_IN_START_OR_SESSIONS");
 const isPrimary=source.recheck_state.startsWith("PRIMARY_");
 assert.equal(row.primary_field_evidence_class,isPrimary?"BOUNDED_PRIMARY_FIELD":"NO_ADEQUATE_CURRENT_PRIMARY_FIELD");
 assert.ok(row.field_gap_tags.includes("CURRENTNESS_REVIEW_DUE"));
 assert.equal(row.currentness_gate,"OPEN_FIELD_SPECIFIC");
 assert.equal(row.booking_gate,"NOT_PROVEN_FOR_INDIVIDUAL_SEAT");
 assert.equal(row.website_gold_gate,"NOT_PROVEN");
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
 assert.notEqual(row.scope_gate,"OWNER_APPROVED");
 assert.ok(!/AUTO_PUBLISH|RELEASE_APPROVED|FULL_E4_VERIFIED|AUTO_D5/.test(JSON.stringify(row)));
}
const get=id=>matrix.data.find(x=>x.offer_id===id),n=matrix.data.filter(x=>x.primary_field_evidence_class==="BOUNDED_PRIMARY_FIELD");
const pending=matrix.data.filter(x=>x.primary_field_evidence_class!=="BOUNDED_PRIMARY_FIELD");
assert.equal(n.length,139);assert.deepEqual(pending.map(x=>x.offer_id),["OFFER-HELIAS-014"]);
assert.deepEqual(matrix.data.filter(x=>x.scheduled_date_alignment==="MATCHES_EXISTING_START_OR_SESSION").length,109);
assert.deepEqual(matrix.data.filter(x=>x.scheduled_date_alignment==="NO_SPECIFIC_DUE_START").length,31);
assert.equal(matrix.data.filter(x=>x.structured_numeric_price_eligible==="true").length,107);
assert.equal(matrix.data.filter(x=>x.field_gap_tags.includes("STRUCTURED_PRICE_BUDGET_UNVERIFIED")).length,33);
assert.equal(matrix.data.filter(x=>x.venue_data_state==="NOT_PUBLISHED").length,12);
assert.equal(matrix.data.filter(x=>x.venue_data_state==="OWNER_CONFIRMED_CITY_LUZERN_EXACT_VENUE_UNVERIFIED").length,20);
assert.equal(matrix.data.filter(x=>x.provider.startsWith("MAZ")).length,21);
assert.equal(matrix.data.filter(x=>x.provider.startsWith("MAZ")&&x.venue_data_state==="OWNER_CONFIRMED_CITY_LUZERN_EXACT_VENUE_UNVERIFIED").length,20);
assert.ok(get("OFFER-MAZ-100").catalogue_region.includes("Zürich"));
assert.ok(get("OFFER-MAZ-100").catalogue_region.includes("NZZ"));
assert.ok(matrix.data.filter(x=>x.venue_data_state==="OWNER_CONFIRMED_CITY_LUZERN_EXACT_VENUE_UNVERIFIED").every(x=>x.catalogue_region==="NOT_PUBLISHED"&&x.field_gap_tags.includes("VENUE_NOT_PUBLISHED")&&x.delivery_evidence_tier!=="VERIFIED"&&x.website_gold_gate==="NOT_PROVEN"));

assert.equal(matrix.data.filter(x=>x.venue_data_state==="MULTIPLE_OPTIONS_OR_AMBIGUOUS").length,39);
assert.equal(matrix.data.filter(x=>x.venue_data_state==="REMOTE_ONLY_DISPLAY_NOT_OCCURRENCE_GOLD").length,37);
assert.equal(matrix.data.filter(x=>x.venue_data_state==="SINGLE_DISPLAY_LOCATION_UNPROVEN").length,32);
assert.equal(matrix.data.filter(x=>x.delivery_evidence_tier!=="VERIFIED").length,55);
assert.equal(matrix.data.filter(x=>x.field_gap_tags.includes("OWNER_SCOPE_REVIEW")).length,10);
assert.equal(matrix.data.filter(x=>x.field_gap_tags.includes("SOURCE_VERSION_OR_IDENTITY_GUARD")).length,17);
assert.ok(!get("OFFER-MAZ-146").field_gap_tags.includes("SOURCE_VERSION_OR_IDENTITY_GUARD"));
assert.ok(!get("OFFER-MAZ-163").field_gap_tags.includes("SOURCE_VERSION_OR_IDENTITY_GUARD"));
assert.equal(get("OFFER-CFJM-018").source_recheck_state,"PRIMARY_PROVIDER_CATALOG_EXACT_DATE_TITLE");
assert.ok(get("PCC-P41").source_decision.includes("HOLD_EXACT_COURSE_CODE"));
assert.ok(get("PCC-P31").source_decision.includes("HOLD_PSF_VS_PS3_ALIAS"));
assert.ok(get("V78-04").source_decision.includes("HOLD_DURATION_SOURCE_CONFLICT"));
assert.ok(get("V82-DAWAN-037").source_verified_fields.includes("PAO946-F"));
assert.ok(get("OFFER-CFJM-013").source_decision.includes("HOLD_EXACT_DETAIL_VERSION"));
assert.ok(get("OFFER-HELIAS-014").field_gap_tags.includes("SOURCE_PRIMARY_UNRESOLVED"));
assert.ok(get("OFFER-MAZ-100").structured_price_option_count==="2");
assert.equal(backlog.data.length,140);
assert.equal(backlog.header.length,19);
assert.equal(new Set(backlog.data.map(r=>r.offer_id)).size,140);
assert.deepEqual(new Set(backlog.data.map(r=>r.offer_id)),new Set(matrix.data.map(r=>r.offer_id)));
const priority={};
for(const r of backlog.data){
 priority[r.priority]=(priority[r.priority]||0)+1;
 const original=get(r.offer_id);
 assert.equal(r.unresolved_field_gaps,original.field_gap_tags);
 assert.equal(r.source_evidence_class,original.primary_field_evidence_class);
 assert.equal(r.full_differential_action,original.next_evidence_action);
 assert.equal(r.automatic_publication_allowed,"NO");
 assert.equal(r.owner_release_required,"YES");
 assert.equal(r.status,"QUEUE_NOT_GOLD");
}
assert.deepEqual(priority,{P0_SOURCE_IDENTITY_SCOPE:28,P1_PRICE_ACCESS_VENUE:85,P2_OCCURRENCE_DELIVERY:18,P3_CURRENTNESS_AND_CLOSURE:9});
assert.ok(backlog.data.every((r,i)=>i===0||backlog.data[i-1].priority<=r.priority));
const corrected=["MW-P06","V78-01","V78-02","V78-03"];
for(const id of corrected){
 const row=get(id),live=side.byId[id];
 assert.equal(row.delivery_evidence_tier,"VERIFIED",id+" delivery source");
 assert.equal(row.delivery_variant_count,"2",id+" variant count");
 assert.ok(!row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"),id+" delivery gap closed");
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
 if(id.startsWith("V78")){
  assert.equal(row.structured_numeric_price_eligible,"true");
  assert.equal(row.structured_price_option_count,"2");
  assert.deepEqual(live.priceOptions.map(x=>x.amount),[1300,1400]);
  assert.ok(live.delivery.sourceText.includes("2 jours")&&live.delivery.sourceText.includes("trois jours"),id+" duration conflict remains");
  assert.ok(row.field_gap_tags.includes("SOURCE_VERSION_OR_IDENTITY_GUARD"),id+" source duration gate remains");
 }else{
  assert.equal(row.structured_numeric_price_eligible,"true");
  assert.equal(row.structured_price_option_count,"1");
  assert.equal(live.priceOptions[0].taxMode,"EXCLUDED");
 }
}
const djaGuardIds=["OFFER-DJA-003","OFFER-DJA-005","OFFER-DJA-009","OFFER-DJA-012"];
for(const id of djaGuardIds){
 const row=get(id),delivery=side.byId[id]?.delivery;
 assert.equal(row.delivery_evidence_tier,"VERIFIED",id+" delivery evidence source");
 assert.equal(row.delivery_variant_count,"1",id+" single remote mode");
 assert.ok(!row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"),id+" delivery gap removed");
 assert.ok(row.field_gap_tags.includes("BOOKING_OR_INTAKE_NOT_PROVEN"),id+" intake hold persists");
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
 assert.equal(delivery.structure,"SINGLE_CHANNEL");
 assert.deepEqual(delivery.channels,["REMOTE"]);
 assert.equal(delivery.variants[0].temporalMode,"ASYNCHRONOUS");
 assert.equal(delivery.variants[0].scheduleMode,"FIXED");
 assert.ok(delivery.materialisationStatus.includes("INTAKE_HOLD"));
}
const dawanDecIds=["V82-DAWAN-010","V82-DAWAN-011","V82-DAWAN-013","V82-DAWAN-014"];
for(const id of dawanDecIds){
 const row=get(id),sc=side.byId[id],b=backlog.data.find(x=>x.offer_id===id);
 assert.ok(row&&sc&&b,id+" cross-artifact completeness");
 assert.equal(row.delivery_evidence_tier,"PROVISIONAL",id+" whole-offer remains provisional");
 assert.equal(sc.delivery.structure,"MODE_CHOICE",id+" mixed provider formats");
 assert.equal(sc.delivery.variants.length,1,id+" only sourced FOAD occurrence");
 assert.deepEqual(sc.delivery.variants[0].attendanceChannels,["REMOTE"]);
 assert.equal(sc.delivery.variants[0].temporalMode,"SYNCHRONOUS");
 assert.ok(sc.delivery.sourceText.includes("sessions-confirmees"));
 assert.ok(sc.delivery.materialisationStatus.includes("INPERSON_VARIANT_UNRESOLVED"));
 assert.equal(row.delivery_variant_count,"1");
 assert.ok(row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
 assert.equal(row.structured_numeric_price_eligible,"false");
 assert.equal(sc.priceEligible,false);
 assert.equal(sc.priceOptions.length,0);
 assert.equal(b.delivery_tier,"PROVISIONAL");
 assert.equal(b.unresolved_field_gaps,row.field_gap_tags);
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
}
const cfjmTariffIds={"OFFER-CFJM-009":[590,400,300,130,0],"OFFER-CFJM-011":[1180,800,600,260,0],"OFFER-CFJM-012":[2950,2000,1500,650,0],"OFFER-CFJM-020":[1180,800,600,260,0]};
for(const [id,amounts] of Object.entries(cfjmTariffIds)){
 const row=get(id),prices=side.byId[id].priceOptions,bl=backlog.data.find(r=>r.offer_id===id);
 assert.deepEqual(prices.map(x=>x.amount),amounts,id+" exact fee tiers");
 assert.equal(row.structured_numeric_price_eligible,"true");
 assert.equal(row.structured_price_option_count,"5");
 assert.equal(row.structured_conditional_tariff_count,"4");
 assert.equal(bl.price_numeric_eligible,"true");
 assert.equal(bl.unresolved_field_gaps,row.field_gap_tags);
 assert.ok(!row.field_gap_tags.includes("STRUCTURED_PRICE_BUDGET_UNVERIFIED"));
 assert.equal(row.website_gold_gate,"NOT_PROVEN");
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
 assert.deepEqual(prices.map(x=>x.tariffClass),["REGULAR","CONDITIONAL","CONDITIONAL","CONDITIONAL","CONDITIONAL"]);
 assert.equal(prices[4].eligibilityValue,"CFJM_FC_COTISANT");
 assert.equal(prices[4].amountType,"FREE");
 assert.equal(prices[4].amount,0);
 assert.equal(prices[0].eligibilityType,"NONE");
 assert.equal(prices[3].eligibilityValue,id==="OFFER-CFJM-009"?"IMPRESSUM_AND_50_PERCENT_FREELANCE":"IMPRESSUM");
}
const priceBatchNext={"OFFER-CFJM-017":[1770,1200,900,390,0],"V78-05":[2350,2500],"CAD-003":[500,250],"OFFER-MAZ-151":[990,650]};
for(const [id,amounts] of Object.entries(priceBatchNext)){
 const row=get(id),sc=side.byId[id],bl=backlog.data.find(x=>x.offer_id===id);
 assert.deepEqual(sc.priceOptions.map(p=>p.amount),amounts,id+" source matched prices");
 assert.equal(row.structured_numeric_price_eligible,"true");
 assert.equal(row.structured_price_option_count,String(amounts.length));
 assert.equal(bl.price_numeric_eligible,"true");
 assert.equal(bl.unresolved_field_gaps,row.field_gap_tags);
 assert.ok(!row.field_gap_tags.includes("STRUCTURED_PRICE_BUDGET_UNVERIFIED"));
 assert.equal(row.website_gold_gate,"NOT_PROVEN");
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
 if(id==="CAD-003"||id==="V78-05"){
  assert.equal(row.delivery_evidence_tier,"VERIFIED");
  assert.equal(sc.delivery.structure,"MODE_CHOICE");
  assert.deepEqual(sc.delivery.variants.map(x=>x.deliveryVariantId),["A","B"]);
  assert.equal(row.delivery_variant_count,"2");
  assert.ok(!row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
  assert.ok(sc.delivery.materialisationStatus.includes("HOLD"));
 }
 if(id==="OFFER-CFJM-017")assert.equal(sc.priceOptions[4].eligibilityValue,"CFJM_FC_COTISANT");
 if(id==="CAD-003"){
   assert.equal(sc.priceOptions[1].components.find(x=>x.componentType==="CERTIFICATION_FEE").amount,150);
   assert.equal(sc.priceOptions[1].components.find(x=>x.componentType==="CERTIFICATION_FEE").requirementStatus,"OPTIONAL");
 }
 if(id==="OFFER-MAZ-151"){
   assert.ok(row.field_gap_tags.includes("OWNER_SCOPE_REVIEW"));
   assert.equal(row.scope_gate,"OWNER_REVIEW_REQUIRED");
   assert.equal(sc.priceOptions[1].eligibilityValue,"JOURNALIST");
 }
}
const djaBatchMore=["OFFER-DJA-002","OFFER-DJA-004","OFFER-DJA-006","OFFER-DJA-007","OFFER-DJA-008","OFFER-DJA-010","OFFER-DJA-022"];
for(const id of djaBatchMore){
 const row=get(id),rec=side.byId[id],back=backlog.data.find(r=>r.offer_id===id);
 assert.equal(row.delivery_evidence_tier,"VERIFIED",id+" provider 100% online");
 assert.equal(row.delivery_variant_count,"1");
 assert.equal(back.unresolved_field_gaps,row.field_gap_tags);
 assert.equal(back.delivery_tier,"VERIFIED");
 assert.equal(rec.delivery.structure,"SINGLE_CHANNEL");
 assert.deepEqual(rec.delivery.channels,["REMOTE"]);
 assert.equal(rec.delivery.variants[0].temporalMode,"ASYNCHRONOUS");
 assert.equal(rec.delivery.variants[0].scheduleMode,"FIXED");
 assert.ok(rec.delivery.materialisationStatus.includes("INTAKE_AND_CAMPUS_HOLD"));
 assert.ok(row.field_gap_tags.includes("BOOKING_OR_INTAKE_NOT_PROVEN"));
 assert.ok(row.field_gap_tags.includes("REMOTE_CHANNEL_SEAT_NOT_PROVEN"));
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
 assert.equal(rec.priceEligible,true);
 if(id==="OFFER-DJA-007")assert.ok(rec.delivery.sourceText.includes("Demnächst"));
}
const lastDjaTen=["OFFER-DJA-011","OFFER-DJA-013","OFFER-DJA-014","OFFER-DJA-015","OFFER-DJA-016","OFFER-DJA-017","OFFER-DJA-018","OFFER-DJA-019","OFFER-DJA-020","OFFER-DJA-021"];
for(const id of lastDjaTen){
 const row=get(id),delivery=side.byId[id].delivery,action=backlog.data.find(r=>r.offer_id===id);
 assert.equal(delivery.evidenceTier,"VERIFIED",id+" official online model");
 assert.equal(row.delivery_evidence_tier,"VERIFIED");
 assert.equal(row.delivery_variant_count,"1");
 assert.equal(action.delivery_tier,"VERIFIED");
 assert.equal(action.unresolved_field_gaps,row.field_gap_tags);
 assert.equal(delivery.structure,"SINGLE_CHANNEL");
 assert.deepEqual(delivery.channels,["REMOTE"]);
 assert.equal(delivery.variants[0].temporalMode,"ASYNCHRONOUS");
 assert.equal(delivery.variants[0].scheduleMode,"FIXED");
 assert.ok(delivery.materialisationStatus.includes("INTAKE_CAMPUS_HOLD"));
 assert.ok(!row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
 assert.ok(row.field_gap_tags.includes("BOOKING_OR_INTAKE_NOT_PROVEN"));
 assert.ok(row.field_gap_tags.includes("REMOTE_CHANNEL_SEAT_NOT_PROVEN"));
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
}
assert.ok(side.byId["OFFER-DJA-013"].delivery.sourceText.includes("/nachhaltigkeitsjournalismus/"),"DJA013 existing original URL slug preserved despite Klimajournalismus title");
const microwinExtra=["MW-P08","MW-P07","MW-P09","MW-P03"];
for(const id of microwinExtra){
 const row=get(id),rec=side.byId[id],bl=backlog.data.find(b=>b.offer_id===id);
 assert.equal(rec.delivery.evidenceTier,"VERIFIED",id+" teaching format");
 assert.equal(rec.delivery.structure,"MODE_CHOICE");
 assert.deepEqual(rec.delivery.variants.map(v=>v.deliveryVariantId),["A","B"]);
 assert.deepEqual(rec.delivery.variants[0].attendanceChannels,["IN_PERSON"]);
 assert.deepEqual(rec.delivery.variants[1].attendanceChannels,["REMOTE"]);
 assert.equal(row.delivery_evidence_tier,"VERIFIED");
 assert.equal(row.delivery_variant_count,"2");
 assert.equal(bl.delivery_tier,"VERIFIED");
 assert.equal(bl.unresolved_field_gaps,row.field_gap_tags);
 assert.ok(row.field_gap_tags.includes("CURRENTNESS_REVIEW_DUE"));
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
 assert.ok(rec.delivery.materialisationStatus.includes("CAPACITY_CURRENTNESS_HOLD"));
}
assert.ok(side.byId["MW-P09"].delivery.sourceText.includes("Flash/DHTML"),"WEBDA syllabus currentness flag required");
assert.ok(side.byId["MW-P07"].delivery.sourceText.includes("INDF not INDE"),"Microwin exact course code identity");
const nextDawanFOADIds=["V82-DAWAN-027","V82-DAWAN-028","V82-DAWAN-046","V82-DAWAN-100"];
for(const id of nextDawanFOADIds){
 const row=get(id),sc=side.byId[id],q=backlog.data.find(x=>x.offer_id===id);
 assert.ok(row&&sc&&q,id+" missing frozen cross-reference");
 assert.equal(row.delivery_evidence_tier,"PROVISIONAL",id+" source-backed whole offer provisional");
 assert.equal(row.delivery_variant_count,"1",id+" exact one observed remote cohort");
 assert.equal(q.delivery_tier,"PROVISIONAL",id+" queue synchronised");
 assert.equal(q.unresolved_field_gaps,row.field_gap_tags,id+" unresolved field parity");
 assert.ok(row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"),id+" in-person still not verified");
 assert.ok(row.field_gap_tags.includes("CURRENTNESS_REVIEW_DUE"),id+" currentness gate retained");
 assert.equal(sc.priceEligible,false);
 assert.equal(sc.priceOptions.length,0);
 assert.deepEqual(sc.delivery.channels,["REMOTE","IN_PERSON"]);
 assert.equal(sc.delivery.variants.length,1);
 assert.deepEqual(sc.delivery.variants[0].attendanceChannels,["REMOTE"]);
 assert.equal(sc.delivery.variants[0].temporalMode,"SYNCHRONOUS");
 assert.equal(sc.delivery.variants[0].scheduleMode,"FIXED");
 assert.ok(sc.delivery.sourceText.includes("dawan.ch/sessions-confirmees"));
 assert.ok(sc.delivery.materialisationStatus.includes("INPERSON_VARIANT_UNRESOLVED"));
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
}
assert.ok(side.byId["V82-DAWAN-027"].delivery.materialisationStatus.includes("SOURCE_VERSION_DIFFERENTIAL_HOLD"));
assert.ok(side.byId["V82-DAWAN-100"].delivery.materialisationStatus.includes("CANONICAL_CITY_VS_REMOTE_HOLD"));
const verifiedPhysicalIds=["IF-G06","V58-S1-04","V58-S1-07"];
for(const id of verifiedPhysicalIds){
 const row=get(id),sc=side.byId[id],q=backlog.data.find(x=>x.offer_id===id);
 assert.equal(row.delivery_evidence_tier,"VERIFIED",id+" current provider confirms in-person mode");
 assert.equal(q.delivery_tier,"VERIFIED");
 assert.equal(q.unresolved_field_gaps,row.field_gap_tags,id+" frozen ledger parity");
 assert.ok(!row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
 assert.ok(row.field_gap_tags.includes("CURRENTNESS_REVIEW_DUE"));
 assert.equal(sc.delivery.structure,"SINGLE_CHANNEL");
 assert.deepEqual(sc.delivery.channels,["IN_PERSON"]);
 assert.equal(sc.delivery.variants.length,1);
 assert.deepEqual(sc.delivery.variants[0].attendanceChannels,["IN_PERSON"]);
 assert.equal(sc.delivery.variants[0].temporalMode,"SYNCHRONOUS");
 assert.equal(sc.delivery.variants[0].scheduleMode,"FIXED");
 assert.ok(sc.delivery.materialisationStatus.includes("SEAT_TAX_CURRENTNESS_HOLD"));
 assert.equal(row.website_gold_gate,"NOT_PROVEN");
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
}
assert.ok(side.byId["IF-G06"].delivery.sourceText.includes("Five meetings are 15 hours NOT five full 8-hour teaching days."));
assert.ok(side.byId["V58-S1-04"].delivery.sourceText.includes("sold out"));
const heli = get("OFFER-HELIAS-011"),heliSide=side.byId["OFFER-HELIAS-011"],heliQueue=backlog.data.find(x=>x.offer_id==="OFFER-HELIAS-011");
assert.equal(heli.structured_numeric_price_eligible,"true");
assert.equal(heli.structured_price_option_count,"3");
assert.equal(heli.structured_conditional_tariff_count,"2");
assert.equal(heli.delivery_evidence_tier,"VERIFIED");
assert.deepEqual(heliSide.priceOptions.map(p=>p.amount),[420,140,0]);
assert.deepEqual(heliSide.priceOptions.map(p=>p.eligibilityType),["NONE","MEMBERSHIP","MEMBERSHIP"]);
assert.deepEqual(heliSide.priceOptions.map(p=>p.tariffClass),["REGULAR","CONDITIONAL","CONDITIONAL"]);
assert.equal(heliSide.delivery.structure,"SINGLE_CHANNEL");
assert.deepEqual(heliSide.delivery.channels,["IN_PERSON"]);
assert.equal(heliSide.delivery.variants.length,1);
assert.equal(heliSide.delivery.variants[0].scheduleMode,"FIXED");
assert.ok(heliSide.delivery.sourceText.includes("Impact Room"));
assert.ok(heliSide.delivery.sourceText.includes("2025"));
assert.ok(!heli.field_gap_tags.includes("STRUCTURED_PRICE_BUDGET_UNVERIFIED"));
assert.ok(!heli.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
assert.ok(heli.field_gap_tags.includes("ACCESS_TARIFF_ELIGIBILITY_GUARD"));
assert.ok(heli.field_gap_tags.includes("BOOKING_OR_INTAKE_NOT_PROVEN"));
assert.equal(heli.scope_gate,"NOT_FULLY_REVIEWED_FOR_SCOPE");
assert.equal(heli.website_gold_gate,"NOT_PROVEN");
assert.equal(heli.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
assert.equal(heliQueue.price_numeric_eligible,"true");
assert.equal(heliQueue.delivery_tier,"VERIFIED");
assert.equal(heliQueue.unresolved_field_gaps,heli.field_gap_tags);
const vsmRow=get("OFFER-VSM-001"),vsmSide=side.byId["OFFER-VSM-001"],vsmQueue=backlog.data.find(x=>x.offer_id==="OFFER-VSM-001");
assert.equal(vsmRow.delivery_evidence_tier,"VERIFIED");
assert.equal(vsmRow.delivery_variant_count,"1");
assert.deepEqual(vsmSide.delivery.channels,["IN_PERSON"]);
assert.equal(vsmSide.delivery.structure,"SINGLE_CHANNEL");
assert.equal(vsmSide.delivery.variants.length,1);
assert.equal(vsmSide.delivery.variants[0].temporalMode,"SYNCHRONOUS");
assert.equal(vsmSide.delivery.variants[0].scheduleMode,"FIXED");
assert.ok(vsmSide.delivery.sourceText.includes("08:30–13:30")&&vsmSide.delivery.sourceText.includes("WESTHIVE HARDTURM"));
assert.equal(vsmSide.delivery.materialisationStatus,"SOURCE_VERIFIED_EXACT_INPERSON_ONLY_TAX_BOOKING_SCOPE_CURRENTNESS_HOLD");
assert.deepEqual(vsmSide.priceOptions.map(p=>p.amount),[250,150,0]);
assert.deepEqual(vsmSide.priceOptions.map(p=>p.taxMode),["EXCLUDED","EXCLUDED","UNSPECIFIED"]);
assert.deepEqual(vsmSide.priceOptions.map(p=>p.tariffClass),["REGULAR","CONDITIONAL","CONDITIONAL"]);
assert.equal(vsmRow.structured_numeric_price_eligible,"true");
assert.ok(!vsmRow.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
assert.ok(vsmRow.field_gap_tags.includes("TAX_SCOPE_UNSPECIFIED")&&vsmRow.field_gap_tags.includes("BOOKING_OR_INTAKE_NOT_PROVEN"));
assert.equal(vsmRow.website_gold_gate,"NOT_PROVEN");
assert.equal(vsmRow.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
assert.equal(vsmQueue.delivery_tier,"VERIFIED");
assert.equal(vsmQueue.unresolved_field_gaps,vsmRow.field_gap_tags);
const exactOnsite={"V59-SZ01":{"price":700,"date":"17.11.2026"},"V59-SZ04":{"price":640,"date":"10.11.2026"},"V77-04":{"price":689,"date":"20.11.2026"}};
for(const [id,p] of Object.entries(exactOnsite)){
 const row=get(id),sc=side.byId[id],q=backlog.data.find(x=>x.offer_id===id);
 assert.equal(row.delivery_evidence_tier,"VERIFIED",id+" onsite tier");
 assert.equal(row.structured_numeric_price_eligible,"true");
 assert.equal(sc.priceOptions.length,1);
 assert.equal(sc.priceOptions[0].amount,p.price);
 assert.equal(sc.delivery.structure,"SINGLE_CHANNEL");
 assert.deepEqual(sc.delivery.channels,["IN_PERSON"]);
 assert.equal(sc.delivery.variants.length,1);
 assert.deepEqual(sc.delivery.variants[0].attendanceChannels,["IN_PERSON"]);
 assert.equal(sc.delivery.variants[0].temporalMode,"SYNCHRONOUS");
 assert.equal(sc.delivery.variants[0].scheduleMode,"FIXED");
 assert.ok(sc.delivery.sourceText.includes(p.date));
 assert.ok(sc.delivery.materialisationStatus.includes("_HOLD"));
 assert.ok(!row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
 assert.ok(row.field_gap_tags.includes("CURRENTNESS_REVIEW_DUE"));
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
 assert.equal(q.delivery_tier,"VERIFIED");
 assert.equal(q.unresolved_field_gaps,row.field_gap_tags);
}
assert.ok(get("V77-04").field_gap_tags.includes("VENUE_FORMAT_SESSION_CROSSWALK"));
assert.ok(side.byId["V77-04"].delivery.sourceText.includes("4 months old"));
const mazKi=get("OFFER-MAZ-100"),mazKiSide=side.byId["OFFER-MAZ-100"],mazKiQueue=backlog.data.find(x=>x.offer_id==="OFFER-MAZ-100");
assert.equal(mazKi.delivery_evidence_tier,"VERIFIED");
assert.equal(mazKi.catalogue_region,"NZZ, Falkenstrasse 11, 8008 Zürich");
assert.equal(mazKiSide.delivery.structure,"SINGLE_CHANNEL");
assert.deepEqual(mazKiSide.delivery.channels,["IN_PERSON"]);
assert.equal(mazKiSide.delivery.variants[0].temporalMode,"SYNCHRONOUS");
assert.equal(mazKiSide.delivery.variants[0].scheduleMode,"FIXED");
assert.ok(mazKiSide.delivery.sourceText.includes("Falkenstrasse 11"));
assert.deepEqual(mazKiSide.priceOptions.map(p=>p.amount),[380,290]);
assert.equal(mazKiSide.priceOptions[1].tariffClass,"CONDITIONAL");
assert.ok(mazKi.field_gap_tags.includes("CURRENTNESS_REVIEW_DUE"));
assert.ok(!mazKi.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
assert.equal(mazKi.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
assert.equal(mazKiQueue.unresolved_field_gaps,mazKi.field_gap_tags);
assert.equal(mazKiQueue.delivery_tier,"VERIFIED");
for(const id of ["V82-DAWAN-050"]){
 const row=get(id),sc=side.byId[id],q=backlog.data.find(x=>x.offer_id===id);
 assert.ok(row&&sc&&q);
 assert.equal(row.delivery_evidence_tier,"PROVISIONAL");
 assert.equal(q.delivery_tier,"PROVISIONAL");
 assert.equal(row.delivery_variant_count,"1");
 assert.equal(sc.delivery.structure,"MODE_CHOICE");
 assert.deepEqual(sc.delivery.channels,["REMOTE","IN_PERSON"]);
 assert.equal(sc.delivery.variants.length,1);
 assert.deepEqual(sc.delivery.variants[0].attendanceChannels,["REMOTE"]);
 assert.equal(sc.delivery.variants[0].temporalMode,"SYNCHRONOUS");
 assert.equal(sc.delivery.variants[0].scheduleMode,"FIXED");
 assert.ok(sc.delivery.sourceText.includes("19–20.11.2026"));
 assert.ok(sc.delivery.materialisationStatus.includes("INPERSON_VARIANT_UNRESOLVED"));
 assert.equal(sc.priceEligible,false);
 assert.equal(sc.priceOptions.length,0);
 assert.ok(row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
 assert.ok(row.field_gap_tags.includes("STRUCTURED_PRICE_BUDGET_UNVERIFIED"));
 assert.equal(q.unresolved_field_gaps,row.field_gap_tags);
 assert.equal(row.website_gold_gate,"NOT_PROVEN");
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
}

const pccBatch236=["PCC-P40","PCC-P10","PCC-P06","PCC-P01","PCC-P04","PCC-P09","PCC-P39","PCC-P07","PCC-P12","PCC-P30","PCC-P26","PCC-P27"];
for (const id of pccBatch236) {
 const row=get(id),sc=side.byId[id],b=backlog.data.find(r=>r.offer_id===id);
 assert.equal(sc.delivery.evidenceTier,"VERIFIED",id+" product-level mode evidence");
 assert.equal(sc.delivery.structure,"MODE_CHOICE");
 assert.deepEqual(sc.delivery.channels,["REMOTE","IN_PERSON"]);
 assert.equal(sc.delivery.variants.length,2);
 assert.equal(sc.delivery.variants[0].temporalMode,"SYNCHRONOUS");
 assert.equal(sc.delivery.variants[1].scheduleMode,"FIXED");
 assert.ok(sc.delivery.sourceText.includes("Official exact course") && sc.delivery.sourceText.includes("not the modality, room, booking status or seat") && sc.delivery.sourceText.includes(row.catalogue_source_url));
 assert.ok(sc.delivery.variants.every(v=>v.instructionFormats.length===0));
 assert.ok(sc.delivery.materialisationStatus.includes("CH_FEE_SEAT_CURRENTNESS_HOLD"));
 assert.equal(row.delivery_evidence_tier,"VERIFIED");
 assert.equal(row.delivery_variant_count,"2");
 assert.ok(!row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
 assert.ok(row.field_gap_tags.includes("CH_FINAL_FEE_NOT_PROVEN"));
 assert.ok(row.field_gap_tags.includes("VENUE_FORMAT_SESSION_CROSSWALK"));
 assert.equal(row.website_gold_gate,"NOT_PROVEN");
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
 assert.equal(b.delivery_tier,"VERIFIED");
 assert.equal(b.unresolved_field_gaps,row.field_gap_tags);
 assert.ok(sc.priceOptions.every(p=>p.amountType==="FROM" && p.taxMode==="EXCLUDED"),id+" original from-price untouched");
}


const evt237SourceProofs=[
 {id:"CAD-026", structure:"SINGLE_CHANNEL", channels:["IN_PERSON"], note:"Cours en présentiel",hold:"CACHED_OCCURRENCE_VERSION_SCOPE_TAX_SEAT_CURRENTNESS_HOLD"},
 {id:"AT-PROD-OFFER-022",structure:"HYBRID_COMBINED",channels:["IN_PERSON","REMOTE"],note:"25 required in-person days",hold:"FUTURE_INTAKE_ADMISSION_TAX_CURRENTNESS_HOLD"}
];
for(const spec of evt237SourceProofs) {
 const row=get(spec.id),sc=side.byId[spec.id],b=backlog.data.find(x=>x.offer_id===spec.id);
 assert.equal(sc.delivery.evidenceTier,"VERIFIED");
 assert.equal(sc.delivery.structure,spec.structure);
 assert.deepEqual(sc.delivery.channels,spec.channels);
 assert.equal(sc.delivery.variants.length,1);
 assert.equal(sc.delivery.variants[0].scheduleMode,"FIXED");
 assert.ok(sc.delivery.sourceText.includes(spec.note));
 assert.ok(sc.delivery.materialisationStatus.includes(spec.hold));
 assert.equal(row.delivery_evidence_tier,"VERIFIED");
 assert.equal(row.delivery_variant_count,"1");
 assert.ok(!row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
 assert.equal(row.website_gold_gate,"NOT_PROVEN");
 assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
 assert.equal(b.delivery_tier,"VERIFIED");
 assert.equal(b.unresolved_field_gaps,row.field_gap_tags);
 assert.equal(sc.priceEligible,true);
 assert.equal(row.scope_gate, spec.id==="CAD-026"?"OWNER_REVIEW_REQUIRED":"NOT_FULLY_REVIEWED_FOR_SCOPE");
}
assert.ok(get("CAD-026").source_decision.includes("HOLD_2026_11_25_EDITION_NOT_PROVEN"),
 "Original frozen observation is intentionally retained; newer version evidence in EVT237");
assert.ok(side.byId["AT-PROD-OFFER-022"].delivery.sourceText.includes("NOT choice"));



// EVT238: historical EVT237 ledger is immutable, later exact provider sources are successor updates.
for(const id of ["PCC-P11","PCC-P19","V82-DAWAN-020"]){
 const r=get(id),sc=side.byId[id],q=backlog.data.find(x=>x.offer_id===id);
 assert.equal(sc.delivery.evidenceTier,"VERIFIED",id+" source-supported course teaching choice");
 assert.equal(sc.delivery.structure,"MODE_CHOICE");
 assert.deepEqual(sc.delivery.channels,["REMOTE","IN_PERSON"]);
 assert.equal(sc.delivery.variants.length,2);
 assert.ok(sc.delivery.sourceText.includes(r.catalogue_source_url));
 assert.ok(sc.delivery.materialisationStatus.includes("_HOLD"));
 assert.equal(r.delivery_evidence_tier,"VERIFIED");
 assert.equal(r.delivery_variant_count,"2");
 assert.ok(!r.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
 assert.equal(q.unresolved_field_gaps,r.field_gap_tags);
 assert.equal(q.delivery_tier,"VERIFIED");
 assert.equal(r.website_gold_gate,"NOT_PROVEN");
 assert.equal(r.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
}
assert.ok(side.byId["V82-DAWAN-020"].delivery.sourceText.includes("AUD102205-F"));
assert.equal(side.byId["V82-DAWAN-020"].priceEligible,false);
assert.equal(side.byId["V82-DAWAN-020"].priceOptions.length,0);
assert.equal(get("PCC-P19").source_decision,freeze.data.find(x=>x.offer_id==="PCC-P19")?.source_decision||get("PCC-P19").source_decision);


// EVT239 exact APF identity: same full title, code and source-date appear on the provider's verified brand site, but not a CH final price or seat.
const apf=get("PCC-P41"),apfSide=side.byId["PCC-P41"],apfBack=backlog.data.find(x=>x.offer_id==="PCC-P41");
assert.equal(apf.delivery_evidence_tier,"VERIFIED");
assert.equal(apf.delivery_variant_count,"2");
assert.equal(apfSide.delivery.structure,"MODE_CHOICE");
assert.deepEqual(apfSide.delivery.channels,["REMOTE","IN_PERSON"]);
assert.equal(apfSide.delivery.variants.length,2);
assert.ok(apfSide.delivery.sourceText.includes("course ID APF")&&apfSide.delivery.sourceText.includes("2027 APF")&&apfSide.delivery.sourceText.includes("https://adobe.pc-college.de/"));
assert.ok(!apf.field_gap_tags.includes("DELIVERY_NOT_VERIFIED")&&apf.field_gap_tags.includes("CH_FINAL_FEE_NOT_PROVEN"));
assert.ok(apf.source_decision.includes("HOLD_EXACT_COURSE_CODE"),"Historic source differential remains frozen for forensic trace");
assert.equal(apfBack.delivery_tier,"VERIFIED");
assert.equal(apfBack.unresolved_field_gaps,apf.field_gap_tags);
assert.equal(apf.website_gold_gate,"NOT_PROVEN");
assert.equal(apf.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");


for(const [id,code] of [["PCC-P29","PSC"],["PCC-P31","PSF"]]){
 const row=get(id),d=side.byId[id].delivery,q=backlog.data.find(x=>x.offer_id===id);
 assert.equal(d.evidenceTier,"VERIFIED");assert.equal(d.structure,"MODE_CHOICE");
 assert.deepEqual(d.channels,["REMOTE","IN_PERSON"]);assert.equal(d.variants.length,2);
 assert.ok(d.sourceText.includes("PC-COLLEGE")&&d.sourceText.includes(code)&&d.materialisationStatus.includes("CH_EDITION_FEE_TAX_SEAT_HOLD"));
 assert.equal(row.delivery_evidence_tier,"VERIFIED");assert.equal(row.delivery_variant_count,"2");
 assert.ok(!row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
 assert.ok(row.field_gap_tags.includes("CH_FINAL_FEE_NOT_PROVEN"));
 assert.ok(row.field_gap_tags.includes("VENUE_FORMAT_SESSION_CROSSWALK"));
 assert.equal(q.delivery_tier,"VERIFIED");assert.equal(q.unresolved_field_gaps,row.field_gap_tags);
 assert.equal(row.website_gold_gate,"NOT_PROVEN");assert.equal(row.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
 assert.equal(side.byId[id].priceOptions.length,1);assert.equal(side.byId[id].priceOptions[0].amountType,"FROM");
}
const cfjmJri=side.byId["OFFER-CFJM-019"].delivery;
assert.equal(cfjmJri.evidenceTier,"PROVISIONAL");
assert.equal(cfjmJri.variants.length,1);
assert.equal(cfjmJri.variants[0].temporalMode,"SYNCHRONOUS");
assert.equal(cfjmJri.variants[0].scheduleMode,"FIXED");
assert.ok(cfjmJri.sourceText.includes("Lausanne")&&cfjmJri.sourceText.includes("optional module spécifique")&&cfjmJri.sourceText.includes("Programme_-FC-JRI.pdf"));
assert.ok(cfjmJri.materialisationStatus.includes("PROVISIONAL_PRICE_SEAT_HOLD"));
assert.equal(get("OFFER-CFJM-019").delivery_evidence_tier,"PROVISIONAL");
assert.ok(get("OFFER-CFJM-019").field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
assert.equal(side.byId["OFFER-CFJM-019"].priceOptions[0].amountType,"NOT_PUBLISHED");


// EVT241: preserve 2026-10 cached individual course as historical; current CFJM exact detail independently matches scheduled 26 Nov 2026 course.
const cfjmAuteur=get("OFFER-CFJM-020"),cfjmAuteurQ=backlog.data.find(x=>x.offer_id==="OFFER-CFJM-020");
assert.equal(cfjmAuteur.next_start,"2026-11-26");
assert.ok(cfjmAuteur.source_decision.includes("HOLD_INDEX_DETAIL_DATE_VERSION_AND_SEAT"),"Frozen 39/101 source decision remains auditable");
assert.ok(cfjmAuteur.source_observation_freshness.includes("CURRENT_HEADER_RECHECKED"));
assert.ok(!cfjmAuteur.field_gap_tags.includes("SOURCE_VERSION_OR_IDENTITY_GUARD"));
assert.ok(cfjmAuteur.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
assert.ok(cfjmAuteur.field_gap_tags.includes("BOOKING_OR_INTAKE_NOT_PROVEN"));
assert.equal(cfjmAuteur.website_gold_gate,"NOT_PROVEN");
assert.equal(cfjmAuteur.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
assert.equal(cfjmAuteurQ.unresolved_field_gaps,cfjmAuteur.field_gap_tags);

const original63=rows("docs/b2/evt237-all63-parallel-delivery-source-review-20261105.tsv");
assert.equal(original63.header.length,27);
assert.equal(original63.data.length,63);
assert.equal(new Set(original63.data.map(x=>x.offer_id)).size,63);
const delta237=new Set(["CAD-026","AT-PROD-OFFER-022"]);
assert.deepEqual(new Set(original63.data.filter(x=>x.review_disposition==="FIELD_DELTA_PROVEN").map(x=>x.offer_id)),delta237);
const delta238=new Set(["PCC-P11","PCC-P19","V82-DAWAN-020"]);
const delta239=new Set(["PCC-P41"]);
const delta240=new Set(["PCC-P29","PCC-P31"]);
const delta241Source=new Set(["OFFER-CFJM-020"]);
const dueCurrentlyNotVerified=new Set(matrix.data.filter(x=>x.delivery_evidence_tier!=="VERIFIED").map(x=>x.offer_id));
assert.equal(dueCurrentlyNotVerified.size,55);
assert.deepEqual(new Set([...dueCurrentlyNotVerified,...delta237,...delta238,...delta239,...delta240]),new Set(original63.data.map(x=>x.offer_id)));
const original63Groups=original63.data.reduce((o,x)=>((o[x.source_cohort]=(o[x.source_cohort]||0)+1),o),{});
assert.deepEqual(original63Groups,{
 CH_CFJM:11,CH_MAZ:20,CH_PCC:7,CH_HELIAS_SYNDICOM:2,CH_DAWAN:10,
 CH_JJS:1,AT_ACADEMIC:8,CADSCHOOL:1,AT_FH_JOANNEUM:1,AT_FJUM:1,LI_WORK_ENTRY:1
});
for(const x of original63.data) {
 const row=get(x.offer_id),sc=side.byId[x.offer_id],priority=backlog.data.find(z=>z.offer_id===x.offer_id);
 assert.ok(row&&sc&&priority);
 assert.equal(x.lane,row.lane);
 assert.equal(x.provider,row.provider);
 assert.equal(x.title,row.catalogue_title);
 assert.equal(x.canonical_primary_url,row.catalogue_source_url);
 if(!delta238.has(x.offer_id)&&!delta239.has(x.offer_id)&&!delta240.has(x.offer_id)&&!delta241Source.has(x.offer_id)) {
  assert.equal(x.current_delivery_tier_evt237,row.delivery_evidence_tier);
  assert.equal(x.delivery_variant_count,String(sc.delivery.variants.length));
  assert.equal(x.full_field_gaps,row.field_gap_tags);
 } else if(delta241Source.has(x.offer_id)) {
  assert.equal(x.current_delivery_tier_evt237,row.delivery_evidence_tier);
  assert.ok(x.full_field_gaps.includes("SOURCE_VERSION_OR_IDENTITY_GUARD"));
  assert.ok(!row.field_gap_tags.includes("SOURCE_VERSION_OR_IDENTITY_GUARD"));
  assert.equal(x.full_field_gaps.replace("|SOURCE_VERSION_OR_IDENTITY_GUARD",""),row.field_gap_tags);
 } else {
  assert.notEqual(x.current_delivery_tier_evt237,"VERIFIED");
  assert.equal(row.delivery_evidence_tier,"VERIFIED");
  assert.equal(sc.delivery.variants.length,2);
  assert.ok(!row.field_gap_tags.includes("DELIVERY_NOT_VERIFIED"));
  assert.ok(x.full_field_gaps.includes("DELIVERY_NOT_VERIFIED"));
 }
 assert.equal(x.venue_evidence_state,row.venue_data_state);
 assert.equal(x.price_parser_eligible,String(sc.priceEligible));
 assert.equal(x.booking_gate,"NOT_PROVEN_FOR_INDIVIDUAL_SEAT");
 assert.equal(x.website_gold_gate,"NOT_PROVEN");
 assert.equal(x.publication_gate,"HOLD_NO_AUTOMATIC_RELEASE");
 assert.equal(priority.delivery_tier,row.delivery_evidence_tier);
 assert.ok(x.specific_open_gate.length>10 && x.source_observation.length>20);
 if(delta237.has(x.offer_id)){
  assert.equal(x.baseline_delivery_tier_evt236,"PROVISIONAL");
  assert.equal(x.current_delivery_tier_evt237,"VERIFIED");
  assert.equal(x.control_plane_write_kind,"SCOPED_SIDECAR_MATRIX_BACKLOG_QA_COMMIT");
 }else{
  assert.equal(x.baseline_delivery_tier_evt236,x.current_delivery_tier_evt237);
  assert.ok(x.full_field_gaps.includes("DELIVERY_NOT_VERIFIED"));
  assert.ok(x.control_plane_write_kind.includes("REPORT_ONLY"));
 }
}

console.log("B2_ALL140_FIELD_GATE_MATRIX_PASS",JSON.stringify({
 all:140,sourceBounded:139,sourcePending:1,numericEligible:107,
 priceGap:33,venueUnpublishedInCanonical:32,ownerConfirmedCityLuzern:20,venueCityUnassigned:12,venueAmbiguous:51,
 deliveryUnverified:55,ownerScopeFlags:10,publicationApproved:0
}));
