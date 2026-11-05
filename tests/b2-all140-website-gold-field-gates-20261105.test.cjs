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
assert.equal(matrix.data.filter(x=>x.structured_numeric_price_eligible==="true").length,98);
assert.equal(matrix.data.filter(x=>x.field_gap_tags.includes("STRUCTURED_PRICE_BUDGET_UNVERIFIED")).length,42);
assert.equal(matrix.data.filter(x=>x.venue_data_state==="NOT_PUBLISHED").length,32);
assert.equal(matrix.data.filter(x=>x.venue_data_state==="MULTIPLE_OPTIONS_OR_AMBIGUOUS").length,39);
assert.equal(matrix.data.filter(x=>x.venue_data_state==="REMOTE_ONLY_DISPLAY_NOT_OCCURRENCE_GOLD").length,37);
assert.equal(matrix.data.filter(x=>x.venue_data_state==="SINGLE_DISPLAY_LOCATION_UNPROVEN").length,32);
assert.equal(matrix.data.filter(x=>x.delivery_evidence_tier!=="VERIFIED").length,111);
assert.equal(matrix.data.filter(x=>x.field_gap_tags.includes("OWNER_SCOPE_REVIEW")).length,10);
assert.equal(matrix.data.filter(x=>x.field_gap_tags.includes("SOURCE_VERSION_OR_IDENTITY_GUARD")).length,18);
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
console.log("B2_ALL140_FIELD_GATE_MATRIX_PASS",JSON.stringify({
 all:140,sourceBounded:139,sourcePending:1,numericEligible:98,
 priceGap:42,venueUnpublished:32,venueAmbiguous:51,
 deliveryUnverified:111,ownerScopeFlags:10,publicationApproved:0
}));
