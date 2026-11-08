"use strict";
/* Read-only, single-pass TARGET5 bulk materialisation for CI.
 * 1'352 typed CH/AT/LI catalog offers + 111 DE + 2'355 USA owner rows.
 * Creates a preview, never a production release; every HTML page is noindex.
 * Group field-level evidence tasks by provider hostname, not by chat prompts.
 * No source-crawling, inferred Swiss access or invented dates/prices/venues. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const sha=s=>crypto.createHash("sha256").update(s).digest("hex");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const jsonWindow=(body,opener,closer)=>JSON.parse(body.slice(body.indexOf(opener),body.lastIndexOf(closer)+1));
const csvRows=s=>{const [header,...lines]=s.trim().split(/\r?\n/).map(l=>l.split("\t"));
 return {header,records:lines.map(values=>{
  if(values.length!==header.length)throw Error("B2 matrix row width drift");
  return Object.fromEntries(header.map((key,i)=>[key,values[i]]));
 })};
};
const escapeHtml=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;")
 .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const urlHost=url=>{try{return new URL(url).hostname.toLowerCase()}catch{return "INVALID_SOURCE_HOST"}};
const safeFile=id=>encodeURIComponent(id).replace(/%/g,"_"); // stable, no slashes; collisions guarded
const iso=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x);
const pretty=s=>JSON.stringify(s,null,2)+"\n";
const TYPE_COURSE=new Set(["KURS","COURSE","SEMINAR","WORKSHOP","MASTERCLASS"]);
const TIER=(tags)=>tags.includes("SOURCE_PRIMARY_UNRESOLVED")||tags.includes("SOURCE_VERSION_OR_IDENTITY_GUARD")||tags.includes("OWNER_SCOPE_REVIEW")?"P0_SOURCE_SCOPE":tags.includes("CH_FINAL_FEE_NOT_PROVEN")||tags.includes("STRUCTURED_PRICE_BUDGET_UNVERIFIED")||tags.includes("ACCESS_TARIFF_ELIGIBILITY_GUARD")?"P1_PRICE_ACCESS":tags.includes("DELIVERY_NOT_VERIFIED")||tags.includes("VENUE_FORMAT_SESSION_CROSSWALK")||tags.includes("REMOTE_CHANNEL_SEAT_NOT_PROVEN")?"P2_OCCURRENCE_DELIVERY":"P3_CURRENTNESS";
function renderCourse(offer,typed,blocked){
 const title=escapeHtml(offer.title),description=escapeHtml(offer.description||"");
 const isCourse=TYPE_COURSE.has(String(offer.type||"").toUpperCase());
 const safeSource=String(offer.url||"");
 const meta={ "@context":"https://schema.org","@type":isCourse?"Course":"CreativeWork",
   name:offer.title,description:offer.description||offer.title,
   identifier:offer.id,inLanguage:offer.language||"und",
   provider:{"@type":"Organization",name:offer.provider}};
 // Only course-level identity and visible provider text, no guessed
 // CourseInstance/Offer, open seats, remote/hybrid or numerical totals.
 const ld=JSON.stringify(meta).replace(/</g,"\\u003c");
 const evidence=blocked?"Review-Queue HOLD (kein Website-Gold-Nachweis)":
  "Keine automatische Website-Gold-Freigabe durch diesen Build";
 const access=typed.audienceAccess.chEligibility==="UNKNOWN"?
  "CH-Teilnahmeberechtigung nicht positiv verifiziert":typed.audienceAccess.chEligibility;
 const price=typed.price.priceEligible
   ?"Preisangabe vorhanden – verbindlichen Tarif beim Anbieter prüfen"
   :"Keine sichere numerische Gesamtpreis-Angabe";
 const source=safeSource.startsWith("https://")?
  '<a rel="noopener noreferrer" href="'+escapeHtml(safeSource)+'">Offizielle Anbieterquelle</a>':
  "Anbieterquelle derzeit nicht verlinkbar";
 return '<!doctype html>\n<html lang="de-CH"><head><meta charset="utf-8">'+
  '<meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width, initial-scale=1">'+
  '<title>'+title+' – Media Skills Draft-Vorschau</title>'+
  '<script type="application/ld+json">'+ld+'</script></head><body>'+
  '<header><p>Media Skills · nicht veröffentlichte Datenvorschau</p>'+
  '<a href="../index.html">Zurück zum Vorschauregister</a></header>'+
  '<main><h1>'+title+'</h1><p><strong>'+escapeHtml(offer.provider)+'</strong></p>'+
  '<p>'+description+'</p>'+
  '<dl><dt>Quelle</dt><dd>'+source+'</dd>'+
  '<dt>Preisstatus</dt><dd>'+escapeHtml(price)+'</dd>'+
  '<dt>CH-Zugang</dt><dd>'+escapeHtml(access)+'</dd>'+
  '<dt>Datenstatus</dt><dd>'+escapeHtml(evidence)+'</dd></dl>'+
  '<p>Kein Nachweis über freie Plätze oder aktuelle Buchbarkeit.</p></main></body></html>\n';
}
function run(outDir,{inputRoot=root}={}){
 const read=p=>fs.readFileSync(path.join(inputRoot,p),"utf8");
 const raw=read("data.js"),sideRaw=read("smart-search-data.js");
 const offers=jsonWindow(raw,"[","]"),side=jsonWindow(sideRaw,"{","}");
 const staged=JSON.parse(read("data/staging/target5-de-usa-wave1-r4-20260915.json"));
 const owners=read("data/staging/usa-owner-evidence-crosswalk-20261107.jsonl").trim().split(/\r?\n/).map(x=>JSON.parse(x));
 const matrix=csvRows(read("docs/b2/evt264-active-140-website-gold-field-gates-20261107.tsv"));
 const typed=require("../offer-search-view-v1.js").build(offers,side.byId,require("../duration-model.js"));
 if(offers.length<1352||staged.records.length!==2466||matrix.records.length!==140
  ||owners.length!==2356||typed.summary.offers!==offers.length)
   throw Error("Target5 denominator or join drift");
 const ownerIds=new Set(owners.slice(1).map(x=>x.record_id));
 const usa=staged.records.filter(r=>r.country==="USA"),de=staged.records.filter(r=>r.country==="DE");
 if(usa.length!==2355||de.length!==111||ownerIds.size!==2355
  ||usa.some(r=>!ownerIds.has(r.record_id)))throw Error("USA/DE lineage drift");
 const idSet=new Set(offers.map(o=>o.id));
 if(idSet.size!==offers.length)throw Error("Duplicate legacy offer identity");
 const blockedIds=new Set(matrix.records.map(x=>x.offer_id));
 if(blockedIds.size!==140||matrix.records.some(r=>!idSet.has(r.offer_id)
    ||r.website_gold_gate!=="NOT_PROVEN"||r.publication_gate!=="HOLD_NO_AUTOMATIC_RELEASE"))
  throw Error("B2 holds or source joins changed; cannot build");
 const folder=path.resolve(outDir);
 if(folder===root||folder===path.parse(folder).root)throw Error("Unsafe output location");
 const temp=folder+".staging-"+process.pid;
 fs.rmSync(temp,{recursive:true,force:true});fs.mkdirSync(path.join(temp,"offers"),{recursive:true});
 const filenames=new Set(),siteRows=[];
 for(const offer of offers){
  const typedOffer=typed.byId[offer.id];
  const filename=safeFile(offer.id)+".html";
  if(filenames.has(filename))throw Error("Unsafe filename collision "+filename);
  filenames.add(filename);
  fs.writeFileSync(path.join(temp,"offers",filename),renderCourse(offer,typedOffer,blockedIds.has(offer.id)));
  siteRows.push({id:offer.id,provider:offer.provider,title:offer.title,country:offer.country,
   sourceUrl:offer.url,courseType:offer.type,reviewAfter:offer.reviewAfter||null,
   previewFile:"offers/"+filename,websiteGold:blockedIds.has(offer.id)?"NOT_PROVEN":"NOT_ASSESSED_BY_THIS_BUILD",
   access:typedOffer.audienceAccess.chEligibility,
   numericPriceEligible:typedOffer.price.priceEligible,
   evidenceTier:typedOffer.delivery.evidenceTier});
 }
 const groups=new Map();
 for(const r of matrix.records){
  const host=urlHost(r.source_url),tags=r.field_gap_tags.split("|").filter(Boolean);
  if(!groups.has(host))groups.set(host,{sourceHost:host,items:[],urlSet:new Set(),tags:new Set(),tiers:new Set()});
  const g=groups.get(host);
  g.urlSet.add(r.source_url);for(const tag of tags)g.tags.add(tag);g.tiers.add(TIER(tags));
  g.items.push({id:r.offer_id,sourceUrl:r.source_url,reviewAfter:r.review_after,
   dueDate:r.next_start,tags,priority:TIER(tags),nextAction:r.next_evidence_action,
   evidenceState:r.source_recheck_state,publicationGate:r.publication_gate});
 }
 const packs=[...groups.values()].map(g=>({host:g.sourceHost,offerCount:g.items.length,
  uniqueUrls:g.urlSet.size,fieldTags:[...g.tags].sort(),tiers:[...g.tiers].sort(),
  items:g.items.sort((a,b)=>a.priority.localeCompare(b.priority)||a.id.localeCompare(b.id))}))
 .sort((a,b)=>b.offerCount-a.offerCount||a.host.localeCompare(b.host));
 const manifest={type:"TARGET5_DETERMINISTIC_BULK_PREVIEW",status:"NOINDEX_UNRELEASED_NOT_WEBSITE_GOLD",
  source:"CURRENT_GITHUB_PR_DRAFT",counts:{catalogue:offers.length,stagedDE:111,stagedUSA:2355,
    combinedSourceRows:offers.length+staged.records.length,reviewHolds:140,sourceWorkpacks:packs.length,
    previewPages:siteRows.length},
  dataHashes:{data:sha(raw),sidecar:sha(sideRaw),ownerStaging:sha(read("data/staging/target5-de-usa-wave1-r4-20260915.json")),
   ownerCrosswalk:sha(read("data/staging/usa-owner-evidence-crosswalk-20261107.jsonl")),
   reviewMatrix:sha(read("docs/b2/evt264-active-140-website-gold-field-gates-20261107.tsv"))},
  typedSummary:typed.summary,publicationAllowed:false,
  limitations:["Existing CH/AT/LI catalogue is not universally Website-Gold",
   "DE/USA are sourced owner-publication staging, not verified website product records",
   "Source-gold/currentness/booking cannot be inferred by this build",
   "All detail pages are noindex until separately authorised publication"]};
 fs.writeFileSync(path.join(temp,"manifest.json"),pretty(manifest));
 fs.writeFileSync(path.join(temp,"catalogue-search-view.json"),pretty(siteRows));
 fs.writeFileSync(path.join(temp,"source-workpacks.json"),pretty(packs));
 fs.writeFileSync(path.join(temp,"owner-market-roster.json"),pretty(staged.records.map(r=>({
   country:r.country,recordId:r.record_id,provider:r.provider,title:r.title,
   sourceUrl:r.source_url,fieldStatus:"SOURCE_STAGED_NOT_WEBSITE_GOLD"}))));
 const card=siteRows.map(r=>'<li><a href="'+escapeHtml(r.previewFile)+'">'+
   escapeHtml(r.title)+'</a> – '+escapeHtml(r.provider)+' ('+escapeHtml(r.country)+
   '), '+escapeHtml(r.websiteGold)+'</li>').join("\n");
 const html='<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow">'+
   '<title>Media Skills – nicht veröffentlichte TARGET5-Vorschau</title></head><body><main>'+
   '<h1>Media Skills – CI-Vorschau, keine Veröffentlichung</h1>'+
   '<p>'+offers.length+' Katalogangebote; 111 DE- und 2’355 USA-Quellenzeilen sind zusätzlich nur staged.</p>'+
   '<p>140 offene B2-Feldprüfungen in '+packs.length+' hostbasierten Arbeitsgruppen.</p>'+
   '<ul>'+card+'</ul></main></body></html>';
 fs.writeFileSync(path.join(temp,"index.html"),html);
 const files=fs.readdirSync(path.join(temp,"offers"));
 if(files.length!==offers.length||!fs.readFileSync(path.join(temp,"index.html"),"utf8").includes('noindex,nofollow'))
  throw Error("Preview page coverage or index safety drift");
 fs.rmSync(folder,{recursive:true,force:true});
 fs.renameSync(temp,folder);
 return manifest;
}
if(require.main===module)try{
 const ix=process.argv.indexOf("--out");
 const dir=ix<0?path.join(root,"out/target5-preview"):process.argv[ix+1];
 if(!dir)throw Error("Missing --out directory");
 console.log(JSON.stringify(run(dir),null,2));
}catch(err){console.error(err.stack||err.message);process.exitCode=1}
module.exports={run,renderCourse,safeFile};
