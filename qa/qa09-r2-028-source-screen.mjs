import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const expected=["V52-MEEL-INSTAGRAM","OFFER-CORSO-001","OFFER-FERNUNI-002","OFFER-HKB-001","OFFER-IFC-005","OFFER-IFC-006","OFFER-IFC-007","OFFER-IFC-008","OFFER-IFC-012","OFFER-IFC-014","OFFER-IFC-020","V79-02","OFFER-NOBLE-004","OFFER-NOBLE-006","OFFER-NOBLE-008","OFFER-NOBLE-013","OFFER-NOBLE-014","OFFER-NOBLE-016","OFFER-NOBLE-020","OFFER-NOBLE-021","OFFER-NOBLE-033","OFFER-NOBLE-035","OFFER-NOBLE-037","OFFER-NOBLE-044","OFFER-NOBLE-057","OFFER-NOBLE-064","OFFER-NOBLE-067","OFFER-ORSYS-006","OFFER-ORSYS-007","OFFER-ORSYS-008","OFFER-ORSYS-009","OFFER-ORSYS-012","OFFER-ORSYS-014","OFFER-ORSYS-020","OFFER-ORSYS-039","OFFER-ORSYS-041","OFFER-ORSYS-042","OFFER-ORSYS-051","OFFER-ORSYS-054","OFFER-ORSYS-057","OFFER-ORSYS-063","OFFER-ORSYS-069","OFFER-ORSYS-070","OFFER-ORSYS-075","OFFER-ORSYS-076","OFFER-ORSYS-078","OFFER-ORSYS-082","OFFER-ORSYS-083","OFFER-ORSYS-088","OFFER-ORSYS-094","OFFER-ORSYS-099","OFFER-ORSYS-103","OFFER-ORSYS-115","OFFER-ORSYS-118","OFFER-ORSYS-120","OFFER-ORSYS-122","OFFER-ORSYS-137","OFFER-ORSYS-138","OFFER-ORSYS-139","OFFER-ORSYS-141","OFFER-ORSYS-143","OFFER-ORSYS-144","OFFER-ORSYS-146","OFFER-ORSYS-151","AT-PROD-OFFER-168","AT-PROD-OFFER-154","OFFER-UZHDSI-001","CAD-002","CAD-018","CAD-025","OFFER-CFJM-007","OFFER-CFJM-008","OFFER-CFJM-013","OFFER-CFJM-014","OFFER-CFJM-015","OFFER-CFJM-016","V82-DAWAN-012","V82-DAWAN-017","V82-DAWAN-029","V82-DAWAN-037","V82-DAWAN-039","V82-DAWAN-094","OFFER-EBU-013","OFFER-EBU-014","OFFER-EBU-015","OFFER-EBU-019","AT-PROD-OFFER-003","AT-PROD-OFFER-209","AT-PROD-OFFER-211","IF-G04","IF-P03","IF-P08","IF-P10","IF-W03","V78-04","OFFER-MAZ-005","OFFER-MAZ-045","OFFER-MAZ-058","OFFER-MAZ-075","OFFER-MAZ-107","OFFER-MAZ-168","OFFER-MAZ-176","OFFER-MAZ-181","OFFER-MAZ-182","PCC-P02","PCC-P03","PCC-P05","PCC-P08","PCC-P16","PCC-P23","PCC-P28","PCC-P32","PCC-P33","PJ-V16-07","V58-S1-07","AT-PROD-OFFER-172"];
const t=fs.readFileSync('data.js','utf8');
const ctx={window:{}};vm.runInNewContext(t,ctx,{timeout:20000});
const all=ctx.window.WEITERBILDUNGSRADAR_OFFERS;
const m=new Map(all.map(x=>[x.id,x]));
if(all.length!==1352||expected.length!==116||new Set(expected).size!==116||expected.some(x=>!m.has(x)))throw Error('FROZEN_ROSTER_MISMATCH');
const results=new Array(expected.length);let next=0;
async function worker(){while(next<expected.length){const i=next++,o=m.get(expected[i]);let obj={id:o.id,provider:o.provider,title:o.title,source_url:o.url||'',time:new Date().toISOString(),http:'',content_type:'',html_bytes:0,sha256:'',course_identity_signal:'NOT_CHECKED',note:''};
try{const c=new AbortController();const timer=setTimeout(()=>c.abort(),16000);let resp;try{resp=await fetch(o.url,{signal:c.signal,redirect:'follow',headers:{'User-Agent':'Mozilla/5.0 (compatible; SFJ-QA09-evidence-audit/1.0; scholarly-research)','Accept':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'}});}finally{clearTimeout(timer)}
obj.http=String(resp.status);obj.final_url=resp.url;obj.content_type=resp.headers.get('content-type')||'';const body=await resp.text();obj.html_bytes=Buffer.byteLength(body,'utf8');obj.sha256=crypto.createHash('sha256').update(body).digest('hex');
if(!resp.ok)obj.note='HTTP_NON_2XX_NOT_PROOF_OF_INVALID_OFFER';
else if(!/html/i.test(obj.content_type))obj.note='NON_HTML_SOURCE_REQUIRES_MANUAL_INSPECTION';
else {const contentText=body.toLocaleLowerCase();const words=o.title.toLocaleLowerCase().split(/[^a-z0-9]+/i).filter(w=>w.length>=5&&!['grundlagen','cours','formation','training','online','advanced','intermediaire'].includes(w));let hits=words.filter(w=>contentText.includes(w));obj.course_identity_signal=words.length?Math.round(hits.length*100/words.length)+'%_TITLE_TOKEN_COVERAGE':'UNUSABLE_TITLE';obj.note='AUTOMATIC_SCREENING_ONLY_NOT_SOURCE_COMPLETE';if(contentText.length<100)obj.note='HTML_HAS_LITTLE_VISIBLE_TEXT';}
}catch(e){obj.http='FETCH_ERROR';obj.note=String(e.name||e.message||e).slice(0,150);}
results[i]=obj;}}
await Promise.all(Array.from({length:12},worker));
fs.mkdirSync('qa09-reports',{recursive:true});fs.writeFileSync('qa09-reports/qa09-116-source-probe.json',JSON.stringify({roster:expected.length,report_type:'SOURCE_REACHABILITY_AND_TITLE_SCREENING_NOT_FULL_SOURCE_VALIDATION',observed_at:new Date().toISOString(),results},null,2));
const count={};for(const x of results)count[x.http]=(count[x.http]||0)+1;
console.log('QA09_ROSTER_ID_COVERAGE',results.length,JSON.stringify(count));
for(const x of results.filter(r=>r.http!=='200').slice(0,35))console.log('QA09_NON_200',x.id,x.http,x.source_url,x.note);
console.log('QA09_SOURCE_AUDIT_DONE__DO_NOT_CONFUSE_WITH_GATE_C_PASS');
