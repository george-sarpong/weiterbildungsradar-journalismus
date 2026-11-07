"use strict";
/* Bounded, grouped primary-source fetch for B2 due-field review.
 * Stores source signals, NOT provider-approved field facts. Never changes
 * the catalog, owner controls, a release gate, GitHub main or Drive.
 * Explicit --live is required. Incremental JSONL persists partial results.
 */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const hash=s=>crypto.createHash("sha256").update(s).digest("hex");
const safeUrl=s=>{
 try{
  const u=new URL(s);
  if(u.protocol!=="https:"||!u.hostname||/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[::1\])/.test(u.hostname.toLowerCase()))return null;
  return u;
 }catch{return null}
};
const tidy=s=>String(s??"").replace(/<script[\s\S]*?<\/script>/gi," ")
 .replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g," ")
 .replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();
const tags=s=>{
 const title=s.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
 const htmlLang=s.match(/<html[^>]*\blang=["']([^"']+)/i);
 const canonical=s.match(/<link[^>]*\brel=["']canonical["'][^>]*>/i)?.[0]||
  s.match(/<link[^>]*\bhref=["'][^"']+["'][^>]*\brel=["']canonical["'][^>]*>/i)?.[0];
 const canon=canonical?.match(/\bhref=["']([^"']+)["']/i)?.[1]||null;
 const ld=s.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)||[];
 const structured=[];
 for(const script of ld.slice(0,10)){
  const body=script.replace(/^[\s\S]*?>/,"").replace(/<\/script>[\s\S]*$/i,"");
  try{const obj=JSON.parse(body),values=Array.isArray(obj)?obj:[obj];
   for(const v of values){const types=Array.isArray(v["@type"])?v["@type"]:[v["@type"]];
    structured.push(...types.filter(Boolean).map(String).slice(0,6));}
  }catch{structured.push("UNPARSEABLE_JSON_LD")}
 }
 return {title:title?tidy(title[1]).slice(0,240):null,htmlLang:htmlLang?.[1]||null,
   canonicalUrl:canon,structuredTypes:[...new Set(structured)].slice(0,20)};
};
const errMessage=e=>String(e?.name||"Error")+": "+String(e?.message||e).slice(0,180);
async function download(url,{fetchImpl=fetch,timeoutMs=11000,maxBytes=350000}={}){
 const clean=safeUrl(url);if(!clean)return {state:"INVALID_SOURCE_URL"};
 const ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),timeoutMs);
 try{
  const response=await fetchImpl(clean.toString(),{method:"GET",signal:ctl.signal,
   headers:{"User-Agent":"MediaSkillsResearch/1.0 (source evidence review; no auto publication)",
    "Accept":"text/html,application/xhtml+xml;q=0.9,*/*;q=0.4"}});
  const finalUrl=safeUrl(response.url||url);
  if(!finalUrl)return {state:"REDIRECT_NOT_HTTPS_OR_PRIVATE",status:response.status};
  if(!response.ok)return {state:"HTTP_ERROR",status:response.status,finalUrl:finalUrl.toString()};
  const type=response.headers?.get("content-type")||"";
  if(type&&!/(text\/html|application\/xhtml\+xml|text\/plain)/i.test(type))
   return {state:"UNSUPPORTED_MEDIA_TYPE",status:response.status,contentType:type,finalUrl:finalUrl.toString()};
  const reader=response.body?.getReader();
  let size=0,truncated=false,body="";
  if(reader){
   const decoder=new TextDecoder();
   for(;;){
    const chunk=await reader.read();if(chunk.done)break;
    const remaining=maxBytes-size;
    if(remaining<=0){truncated=true;await reader.cancel();break}
    const data=chunk.value.length>remaining?chunk.value.subarray(0,remaining):chunk.value;
    body+=decoder.decode(data,{stream:true});size+=data.length;
    if(data.length<chunk.value.length){truncated=true;await reader.cancel();break}
   }
   body+=decoder.decode();
  }else{
   body=String(await response.text()).slice(0,maxBytes);
   size=Buffer.byteLength(body,"utf8");
  }
  const fields=tags(body);
  const bodyHash=hash(body);
  const priceMentions=(tidy(body).match(/(?:CHF|EUR|USD|€|\$)\s*[0-9][0-9.,']*/gi)||[])
   .filter(signal=>{
    const value=signal.replace(/^(?:CHF|EUR|USD|€|\$)\s*/i,"").trim();
    // E.g. "€ 07.11.2026" is a date, never a fee. This is only a signal,
    // not a source-verified price even when the shape is plausible.
    return !/^\d{1,2}[.\/-]\d{1,2}[.\/-]20\d{2}$/.test(value);
   }).slice(0,8);
  const dateMentions=(tidy(body).match(/\b(?:20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]20\d{2})\b/g)||[]).slice(0,12);
  return {state:"SOURCE_FETCHED_NOT_FIELD_VERIFIED",status:response.status,
   finalUrl:finalUrl.toString(),contentType:type||null,bytes:size,truncated,bodySha256:bodyHash,
   ...fields,priceSignals:priceMentions,dateSignals:dateMentions};
 }catch(e){return {state:"FETCH_FAILED",error:errMessage(e)}}
 finally{clearTimeout(timeout)}
}
function jobs(packs,{limit=140}={}){
 if(!Array.isArray(packs))throw Error("Invalid workpacks");
 const urls=new Map();
 for(const p of packs)for(const r of p.items||[]){
  const source=safeUrl(r.sourceUrl);
  if(!source)throw Error("Unsafe source URL "+r.sourceUrl);
  const key=source.toString();
  if(!urls.has(key))urls.set(key,{url:key,host:source.hostname,offerIds:new Set(),fields:new Set()});
  const j=urls.get(key);j.offerIds.add(r.id);
  for(const tag of r.tags||[])j.fields.add(tag);
 }
 if(urls.size>limit)throw Error("Source volume exceeds confirmed 140 B2 cohort: "+urls.size);
 return [...urls.values()].map(v=>({url:v.url,host:v.host,offerIds:[...v.offerIds].sort(),fieldTags:[...v.fields].sort()}))
   .sort((a,b)=>a.host.localeCompare(b.host)||a.url.localeCompare(b.url));
}
async function snapshot(packs,outDir,{fetchImpl=fetch,limit=140,concurrency=5,delayMs=800,timeoutMs=11000,now=()=>new Date().toISOString()}={}){
 const tasks=jobs(packs,{limit});
 if(!Number.isInteger(concurrency)||concurrency<1||concurrency>8)throw Error("Concurrency 1..8");
 if(delayMs<0)throw Error("Invalid host delay");
 fs.mkdirSync(outDir,{recursive:true});
 const out=path.join(outDir,"source-signals.jsonl");
 fs.writeFileSync(out,"");
 let next=0;
 const states={},byHost={},hostSchedule=new Map();
 async function worker(){
  for(;;){
   const idx=next++;if(idx>=tasks.length)return;
   const job=tasks[idx];
   const due=hostSchedule.get(job.host)||0;
   const ready=Math.max(Date.now(),due);
   hostSchedule.set(job.host,ready+delayMs);
   if(ready>Date.now())await new Promise(resolve=>setTimeout(resolve,ready-Date.now()));
   const result=await download(job.url,{fetchImpl,timeoutMs});
   const record={...job,fetchedAt:now(),...result,fieldState:"REVIEW_REQUIRED",
     autoCloseGold:false,autoRelease:false};
   fs.appendFileSync(out,JSON.stringify(record)+"\n");
   states[result.state]=(states[result.state]||0)+1;
   byHost[job.host]=(byHost[job.host]||0)+1;
  }
 }
 await Promise.all(Array.from({length:concurrency},worker));
 const summary={status:"SOURCE_SIGNAL_SNAPSHOT_ONLY",sourceUrls:tasks.length,
  offerRefs:[...new Set(tasks.flatMap(x=>x.offerIds))].length,hostCount:Object.keys(byHost).length,
  states,autoValidatedGold:0,autoPublished:0,
  reportSha256:hash(fs.readFileSync(out,"utf8"))};
 fs.writeFileSync(path.join(outDir,"source-summary.json"),JSON.stringify(summary,null,2)+"\n");
 return summary;
}
async function cli(){
 const args=process.argv.slice(2),arg=x=>args.indexOf(x)<0?null:args[args.indexOf(x)+1];
 if(!args.includes("--live"))throw Error("Read-only source access requires explicit --live");
 const source=arg("--workpacks"),out=arg("--out");
 if(!source||!out)throw Error("Provide --workpacks JSON and --out directory");
 const packs=JSON.parse(fs.readFileSync(source,"utf8"));
 const result=await snapshot(packs,out);
 console.log(JSON.stringify(result));
}
if(require.main===module)cli().catch(e=>{console.error(e.stack||e);process.exitCode=1});
module.exports={jobs,download,snapshot,tags};
