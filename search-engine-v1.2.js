(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SFJSearchV1 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STOPWORDS = new Set([
    "ich","habe","moechte","möchte","mochte","will","suche","lernen","mich","im","in","am","an","der","die","das",
    "den","dem","des","ein","eine","einen","einem","einer","und","oder","mit","fuer","für","etwas","bereich",
    "kurs","weiterbildung","machen","was","dafuer","dafür","koennen","können","muss","weiss","weiß","aber",
    "insgesamt","bitte","mir","mein","meine","nicht","zu","ueber","über","unter","von","bis","maximal","hoechstens","höchstens","gut","aber","waere","wäre","ware","lieber","zwei","drei","vier","fuenf","funf","sechs","sieben","acht","neun","zehn","tag","tage","tagen","stunde","stunden","std","bevorzugt","moeglichst","möglichst","inklusive","reise"
  ]);

  const HARD_MARKERS = ["maximal","höchstens","hoechstens","nicht über","nicht ueber","bis ","nur ","muss "];
  const SOFT_MARKERS = ["am liebsten","bevorzugt","wäre gut","waere gut","gern","gerne","möglichst","moeglichst","lieber"];
  const VAGUE_PRICE = ["nicht zu teuer","guenstig","günstig","wenig geld","preiswert"];
  const ADVISORY = ["was ich dafür können muss","was ich dafuer koennen muss","was muss ich können","was muss ich koennen","weiss aber nicht","weiß aber nicht"];

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/ß/g, "ss")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseNumber(s) {
    let t = String(s || "").trim().replace(/\s/g, "");
    if (!t) return null;
    // Swiss thousands apostrophes and decimal comma.
    t = t.replace(/[’']/g, "");
    if (t.includes(",") && t.includes(".")) {
      if (t.lastIndexOf(",") > t.lastIndexOf(".")) t = t.replace(/\./g,"").replace(",",".");
      else t = t.replace(/,/g,"");
    } else if (t.includes(",")) {
      const parts=t.split(",");
      t = parts.length===2 && parts[1].length<=2 ? parts[0]+"."+parts[1] : parts.join("");
    }
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }

  function markerStrength(text, start, end) {
    const before = text.slice(Math.max(0,start-28), start);
    const around = text.slice(Math.max(0,start-28), Math.min(text.length,end+28));
    if (HARD_MARKERS.some(x => before.includes(norm(x)))) return "hard";
    if (SOFT_MARKERS.some(x => around.includes(norm(x)))) return "soft";
    if (HARD_MARKERS.some(x => around.includes(norm(x)))) return "hard";
    return "hard";
  }

  function aliasMatch(text, alias) {
    const a=norm(alias);
    if (!a || a.length < 2) return false;
    const esc=a.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/\s+/g,"\\s+");
    return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`).test(text);
  }

  function topicCriteria(text, taxonomy) {
    const found=[];
    const seen=new Set();
    const entries = (taxonomy || []).filter(x=>x.userFacing !== false);
    for (const t of entries) {
      let best=null;
      for (const alias of (t.aliases || [])) {
        const a=norm(alias);
        const pos=text.indexOf(a);
        if (pos>=0 && aliasMatch(text,alias)) {
          if (!best || a.length>best.alias.length) best={alias:a,start:pos,end:pos+a.length};
        }
      }
      if (best && !seen.has(t.code)) {
        // Generic journalism is context, not a second hard constraint when paired with a specific skill.
        const negBefore=text.slice(Math.max(0,best.start-18),best.start);
        const negative=/\b(kein|keine|keinen|keinem|keiner|ohne|nicht)\b/.test(negBefore);
        found.push({kind:"topic",code:t.code,label:t.label,strength:negative?"hard":markerStrength(text,best.start,best.end),negative,evidence:"taxonomy",alias:best.alias});
        seen.add(t.code);
      }
    }
    return found;
  }

  function extractBudget(text) {
    const out=[];
    const patterns=[
      {cur:"CHF",re:/\b(?:chf|franken|fr\.?)\s*([0-9][0-9'’.,]*)/g},
      {cur:"CHF",re:/\b([0-9][0-9'’.,]*)\s*(?:chf|franken|fr\.?)\b/g},
      {cur:"EUR",re:/\b(?:eur|euro|€)\s*([0-9][0-9'’.,]*)/g},
      {cur:"EUR",re:/\b([0-9][0-9'’.,]*)\s*(?:eur|euro|€)\b/g},
    ];
    for(const p of patterns){
      let m;
      while((m=p.re.exec(text))){
        const n=parseNumber(m[1]);
        if(n!==null) out.push({kind:"budget",currency:p.cur,max:n,strength:markerStrength(text,m.index,m.index+m[0].length)});
      }
    }
    // De-duplicate identical currency/value.
    return out.filter((x,i,a)=>a.findIndex(y=>y.currency===x.currency&&y.max===x.max)===i);
  }

  function extractBareBudget(text) {
    if (/\b(?:chf|franken|fr\.?|eur|euro|€)\b/.test(text)) return [];
    const m=text.match(/\b(?:nicht\s+(?:uber|ueber)|maximal|hochstens|bis)\s*([0-9][0-9'’.,]*)\b/);
    if(!m) return [];
    const n=parseNumber(m[1]);
    return n===null ? [] : [{kind:"budget",currency:null,max:n,strength:"hard"}];
  }

  function numberWord(s) {
    const k=norm(s);
    const map={ein:1,eine:1,einen:1,einem:1,einer:1,eins:1,zwei:2,drei:3,vier:4,fuenf:5,funf:5,sechs:6,sieben:7,acht:8,neun:9,zehn:10};
    return Object.prototype.hasOwnProperty.call(map,k) ? map[k] : parseNumber(s);
  }

  function extractDuration(text) {
    const out=[];
    const re=/\b([0-9]+(?:[.,][0-9]+)?|ein(?:e|en|em|er|s)?|zwei|drei|vier|fuenf|funf|sechs|sieben|acht|neun|zehn)\s*(stunden?|std\.?|tage?|wochen?|monate?|jahre?)\b/g;
    let m;
    while((m=re.exec(text))){
      const n=numberWord(m[1]); if(n===null) continue;
      const u=norm(m[2]);
      let unit=null;
      if(u.startsWith("stund")||u.startsWith("std")) unit="HOURS";
      else if(u.startsWith("tag")) unit="DAYS";
      else if(u.startsWith("woch")) unit="WEEKS";
      else if(u.startsWith("monat")) unit="MONTHS";
      else if(u.startsWith("jahr")) unit="YEARS";
      out.push({kind:"durationMax",unit,max:n,strength:markerStrength(text,m.index,m.index+m[0].length)});
    }
    return out;
  }

  function extractFormats(text) {
    const defs=[
      {value:"ONLINE",terms:["online","remote","zoom"]},
      {value:"HYBRID",terms:["hybrid"]},
      {value:"PRAESENZ",terms:["präsenz","praesenz","vor ort"]},
      {value:"ON_DEMAND",terms:["on demand","on-demand","selbststudium"]},
    ];
    const out=[];
    for(const d of defs){
      for(const term of d.terms){
        const a=norm(term), pos=text.indexOf(a);
        if(pos>=0){
          const negBefore=text.slice(Math.max(0,pos-18),pos);
          const negative=/\b(kein|keine|ohne|nicht)\b/.test(negBefore);
          const local=text.slice(Math.max(0,pos-24),Math.min(text.length,pos+a.length+32));
          let strength=SOFT_MARKERS.some(x=>local.includes(norm(x))) ? "soft" : markerStrength(text,pos,pos+a.length);
          if(negative) strength="hard";
          out.push({kind:"format",value:d.value,strength,negative});
          break;
        }
      }
    }
    return out;
  }

  function extractLevel(text) {
    const out=[];
    const defs=[
      {value:"EINSTIEG",terms:["einsteiger","einstieg","anfänger","anfaenger","beginner"]},
      {value:"FORTGESCHRITTEN",terms:["fortgeschritten","advanced"]},
      {value:"EXPERT",terms:["expert","experten","profi"]},
    ];
    for(const d of defs){
      for(const term of d.terms){
        const a=norm(term), pos=text.indexOf(a);
        if(pos>=0){
          const negBefore=text.slice(Math.max(0,pos-18),pos);
          const negative=/\b(kein|keine|ohne|nicht)\b/.test(negBefore);
          out.push({kind:"level",value:d.value,strength:"hard",negative});
          break;
        }
      }
    }
    return out;
  }

  function fallbackTerms(text, criteria) {
    // If controlled topics were found, no generic fallback is needed for their words.
    if(criteria.some(c=>c.kind==="topic")) return [];
    let s=text
      .replace(/\b(?:chf|franken|fr\.?|eur|euro|€)\s*[0-9][0-9'’.,]*/g," ")
      .replace(/\b[0-9][0-9'’.,]*\s*(?:chf|franken|fr\.?|eur|euro|€)\b/g," ")
      .replace(/\b[0-9]+(?:[.,][0-9]+)?\s*(?:stunden?|std\.?|tage?|wochen?|monate?|jahre?)\b/g," ");
    const formatWords=["online","remote","zoom","hybrid","prasenz","praesenz","vor","ort","on","demand","selbststudium"];
    const levelWords=["einsteiger","einstieg","anfanger","anfaenger","beginner","fortgeschritten","advanced","expert","experten","profi"];
    const toks=norm(s).split(/[^a-z0-9]+/).filter(Boolean)
      .filter(t=>t.length>=3 && !STOPWORDS.has(t) && !formatWords.includes(t) && !levelWords.includes(t))
      .filter(t=>!["chf","eur","euro","franken","kostenlos","gratis"].includes(t));
    const uniq=[...new Set(toks)];
    return uniq.length ? [{kind:"fallbackText",terms:uniq,strength:"hard"}] : [];
  }

  function parseQuery(raw, index) {
    const text=norm(raw);
    const criteria=[];
    criteria.push(...topicCriteria(text,index && index.taxonomy));
    criteria.push(...extractBudget(text));
    if(!criteria.some(c=>c.kind==="budget")) criteria.push(...extractBareBudget(text));
    if(/\b(kostenlos|gratis|free)\b/.test(text)) criteria.push({kind:"freeOnly",strength:"hard"});
    criteria.push(...extractDuration(text));
    criteria.push(...extractFormats(text));
    criteria.push(...extractLevel(text));
    criteria.push(...fallbackTerms(text,criteria));
    const notes=[];
    if(VAGUE_PRICE.some(x=>text.includes(norm(x)))) notes.push("VAGUE_PRICE_SORT_ASC");
    if(text.includes("inklusive reise")||text.includes("inkl. reise")) notes.push("TRAVEL_NOT_INCLUDED");
    if(ADVISORY.some(x=>text.includes(norm(x)))) notes.push("ADVISORY_NOT_SUPPORTED");
    return {raw, criteria, notes, recognized:criteria.length>0 || notes.length>0};
  }

  function isCurrent(offer, asOf) {
    if(!offer) return false;
    const date=asOf ? new Date(asOf+"T12:00:00") : new Date();
    if(offer.endDate){
      const e=new Date(offer.endDate+"T23:59:59");
      if(e < date) return false;
    }
    return true;
  }

  function coverageGate(offers,index,asOf) {
    const ids=new Set((index.rows||[]).map(r=>r.id));
    const active=(offers||[]).filter(o=>isCurrent(o,asOf));
    const missing=active.filter(o=>!ids.has(o.id)).map(o=>o.id);
    return {pass:missing.length===0, activeCount:active.length, missing};
  }

  function priceState(meta, criterion) {
    if(!criterion) return {state:"MATCH"};
    const B=criterion.max, C=criterion.currency;
    if(meta.pt==="NOT_APPLICABLE" || meta.ps==="NOT_APPLICABLE") return {state:"UNCERTAIN",reason:"Preis nicht anwendbar"};
    if(meta.pt==="FREE") return {state:"MATCH",reason:"kostenlos"};
    if(meta.ps==="UNKNOWN_PRICE" || meta.pt==="UNKNOWN" || meta.pmin==null) return {state:"UNCERTAIN",reason:"Preis unbekannt"};
    if(!C) return {state:"UNCERTAIN",reason:"Währung der Budgetgrenze nicht angegeben"};
    if(!meta.cur || meta.cur!==C) return {state:"UNCERTAIN",reason:"Fremdwährung oder Währung nicht vergleichbar"};
    const min=Number(meta.pmin), max=meta.pmax==null?null:Number(meta.pmax);
    if(Number.isFinite(min) && min>B) return {state:"EXCLUDE",reason:`Mindestpreis ${min} ${C} > ${B} ${C}`};
    if(meta.pt==="FIXED" && max!=null && max<=B) return {state:"MATCH",reason:"Fixpreis im Budget"};
    if(["MULTIPLE","LIST","MULTIPLE_INCLUDING_FREE"].includes(meta.pt) && max!=null && max<=B) return {state:"MATCH",reason:"alle publizierten Preiswerte im Budget"};
    return {state:"UNCERTAIN",reason:"Tarif/Bedingungen nicht eindeutig als Budget-Fit prüfbar"};
  }

  function freeState(meta) {
    if(meta.pt==="FREE") return {state:"MATCH",reason:"kostenlos"};
    if(meta.pt==="MULTIPLE_INCLUDING_FREE") return {state:"UNCERTAIN",reason:"kostenloser Tarif nur bedingt/anwendungsabhängig"};
    if(meta.ps==="UNKNOWN_PRICE" || meta.pt==="UNKNOWN") return {state:"UNCERTAIN",reason:"Preis unbekannt"};
    return {state:"EXCLUDE",reason:"nicht als kostenlos ausgewiesen"};
  }

  function durationState(meta, criterion) {
    const expected="EXACT_"+criterion.unit;
    if(meta.ds===expected && meta.dmax!=null){
      return Number(meta.dmax)<=criterion.max
        ? {state:"MATCH",reason:`Dauer ${meta.dmax} ${criterion.unit}`}
        : {state:"EXCLUDE",reason:`Dauer ${meta.dmax} ${criterion.unit} > ${criterion.max}`};
    }
    return {state:"UNCERTAIN",reason:`Dauerzustand ${meta.ds || "UNKNOWN"} nicht direkt mit ${criterion.unit} vergleichbar`};
  }

  function normFormat(v){ return norm(v).replace(/a/g,"a"); }
  function formatState(offer,c) {
    const f=norm(offer.format);
    const map={
      ONLINE:["online"],
      HYBRID:["hybrid"],
      PRAESENZ:["prasenz","praesenz","präsenz","vor ort"],
      ON_DEMAND:["on demand","on-demand","ondemand"],
    };
    const known=offer.format && !/nicht_publiziert|unknown|unbekannt/i.test(String(offer.format));
    if(!known) return {state:"UNCERTAIN",reason:"Durchführungsform unbekannt"};
    const yes=(map[c.value]||[]).some(x=>f.includes(norm(x)));
    if(c.negative) return yes ? {state:"EXCLUDE",reason:`Format ${offer.format} ausgeschlossen`} : {state:"MATCH",reason:`Format ist nicht ${c.value}`};
    return yes ? {state:"MATCH",reason:`Format ${offer.format}`} : {state:"EXCLUDE",reason:`Format ${offer.format} entspricht nicht ${c.value}`};
  }

  function levelState(offer,c) {
    const l=norm(offer.level);
    if(!offer.level || /nicht_publiziert|unknown|unbekannt/.test(l)) return {state:"UNCERTAIN",reason:"Niveau unbekannt"};
    const isEntry=/einstieg|einsteiger|anfanger|anfaenger|beginner/.test(l);
    if(c.negative && c.value==="EINSTIEG") return isEntry ? {state:"EXCLUDE",reason:"explizites Einstiegsniveau"} : {state:"MATCH",reason:"kein reines Einstiegsniveau"};
    if(c.value==="EINSTIEG") {
      if(isEntry || /alle|all levels/.test(l)) return {state:"MATCH",reason:`Niveau ${offer.level}`};
      return {state:"EXCLUDE",reason:`Niveau ${offer.level}`};
    }
    const target=norm(c.value);
    if(l.includes(target)) return {state:"MATCH",reason:`Niveau ${offer.level}`};
    return {state:"UNCERTAIN",reason:`Niveau ${offer.level} nicht eindeutig mit ${c.value} vergleichbar`};
  }

  function narrowTopicTerms(c) {
    const a=norm(c.alias || "");
    const groups=[
      {aliases:["podcast"],terms:["podcast"]},
      {aliases:["radio","horfunk","hoerfunk"],terms:["radio","horfunk","hoerfunk"]},
      {aliases:["medienrecht"],terms:["medienrecht","presserecht","urheberrecht","bildrecht","recht am bild","droit de la presse","droit des medias","droit a limage"]},
      {aliases:["urheberrecht"],terms:["urheberrecht","copyright"]},
      {aliases:["datenschutz"],terms:["datenschutz","privacy","dsg","dsgvo"]},
      {aliases:["ethik"],terms:["ethik","ethics","pressekodex"]},
      {aliases:["sicherheit"],terms:["sicherheit","safety","security"]},
    ];
    const g=groups.find(g=>g.aliases.includes(a));
    return g ? g.terms : null;
  }

  function topicState(offer,meta,c) {
    const coded=(meta.tc||[]).includes(c.code);
    if(c.negative) {
      return coded
        ? {state:"EXCLUDE",reason:`Ausgeschlossenes Thema ${c.code} vorhanden`,evidence:0}
        : {state:"MATCH",reason:`Ausgeschlossenes Thema ${c.code} nicht codiert`,evidence:0};
    }
    if(!coded)
      return {state:c.strength==="hard"?"EXCLUDE":"MATCH",reason:`Thema ${c.code} nicht codiert`,evidence:0};
    const narrow=narrowTopicTerms(c);
    if(narrow){
      const hay=norm((offer.title||"")+" "+(offer.description||""));
      if(!narrow.some(t=>hay.includes(norm(t))))
        return {state:c.strength==="hard"?"EXCLUDE":"MATCH",reason:`Code ${c.code} vorhanden, aber Unterthema '${c.alias}' textlich nicht belegt`,evidence:0};
      return {state:"MATCH",reason:`Thema ${c.code} + Unterthema ${c.alias}`,evidence:3};
    }
    return {state:"MATCH",reason:`Thema ${c.code}`,evidence:3};
  }

  function fallbackState(offer,c) {
    const title=norm(offer.title), desc=norm(offer.description);
    const terms=c.terms||[];
    if(!terms.length) return {state:"MATCH",evidence:0};
    const titleAll=terms.every(t=>title.includes(t));
    if(titleAll) return {state:"MATCH",reason:"Suchbegriff im Titel",evidence:2};
    const hay=title+" "+desc;
    const all=terms.every(t=>hay.includes(t));
    return all ? {state:"MATCH",reason:"Suchbegriff in Titel/Beschreibung",evidence:1}
               : {state:"EXCLUDE",reason:"Suchbegriff nicht gefunden",evidence:0};
  }

  function evaluateOffer(offer,meta,parsed) {
    const checks=[], soft=[];
    let topicEvidence=0;
    for(const c of parsed.criteria){
      let r={state:"MATCH"};
      if(c.kind==="topic") r=topicState(offer,meta,c);
      else if(c.kind==="fallbackText") r=fallbackState(offer,c);
      else if(c.kind==="budget") r=priceState(meta,c);
      else if(c.kind==="freeOnly") r=freeState(meta);
      else if(c.kind==="durationMax") r=durationState(meta,c);
      else if(c.kind==="format") r=formatState(offer,c);
      else if(c.kind==="level") r=levelState(offer,c);
      if(r.evidence) topicEvidence=Math.max(topicEvidence,r.evidence);
      const item={criterion:c,result:r};
      if(c.strength==="soft" && c.kind!=="budget") soft.push(item); else checks.push(item);
    }
    const excluded=checks.some(x=>x.result.state==="EXCLUDE");
    const uncertain=!excluded && checks.some(x=>x.result.state==="UNCERTAIN");
    const state=excluded?"EXCLUDE":uncertain?"UNCERTAIN":"MATCH";
    const softMatches=soft.filter(x=>x.result.state==="MATCH").length;
    return {state,checks,soft,softMatches,topicEvidence};
  }

  function search(offers,index,raw,opts={}) {
    const asOf=opts.asOf || null;
    const gate=coverageGate(offers,index,asOf);
    if(!gate.pass) return {gate,parsed:parseQuery(raw,index),matches:[],uncertain:[],excluded:[],error:"SIDECAR_REFRESH_REQUIRED"};
    const parsed=parseQuery(raw,index);
    if(!parsed.recognized) return {gate,parsed,matches:[],uncertain:[],excluded:[],error:"NOTHING_RECOGNIZED"};
    const byId=new Map((index.rows||[]).map(r=>[r.id,r]));
    const active=(offers||[]).filter(o=>isCurrent(o,asOf));
    const buckets={MATCH:[],UNCERTAIN:[],EXCLUDE:[]};
    for(const o of active){
      const meta=byId.get(o.id);
      if(!meta) continue;
      const ev=evaluateOffer(o,meta,parsed);
      buckets[ev.state].push({offer:o,meta,evaluation:ev});
    }
    const cmp=(a,b)=>{
      if(b.evaluation.softMatches!==a.evaluation.softMatches) return b.evaluation.softMatches-a.evaluation.softMatches;
      if(b.evaluation.topicEvidence!==a.evaluation.topicEvidence) return b.evaluation.topicEvidence-a.evaluation.topicEvidence;
      const ad=a.offer.startDate||"9999-12-31", bd=b.offer.startDate||"9999-12-31";
      if(ad!==bd) return ad.localeCompare(bd);
      const p=(a.offer.provider||"").localeCompare(b.offer.provider||"","de");
      return p || (a.offer.title||"").localeCompare(b.offer.title||"","de");
    };
    buckets.MATCH.sort(cmp); buckets.UNCERTAIN.sort(cmp);
    if(parsed.notes.includes("VAGUE_PRICE_SORT_ASC")){
      const priceCmp=(a,b)=>{
        const av=a.meta.pt==="FREE"?0:(Number.isFinite(Number(a.meta.pmin))?Number(a.meta.pmin):Infinity);
        const bv=b.meta.pt==="FREE"?0:(Number.isFinite(Number(b.meta.pmin))?Number(b.meta.pmin):Infinity);
        return av-bv || cmp(a,b);
      };
      buckets.MATCH.sort(priceCmp); buckets.UNCERTAIN.sort(priceCmp);
    }
    return {gate,parsed,matches:buckets.MATCH,uncertain:buckets.UNCERTAIN,excluded:buckets.EXCLUDE};
  }

  function serializeNormalized(parsed) {
    const safe = {
      c: parsed.criteria.map(c=>{
        const x={k:c.kind,s:c.strength};
        for(const key of ["code","currency","max","unit","value","negative","terms"]) if(c[key]!=null) x[key]=c[key];
        return x;
      }),
      n: parsed.notes.slice()
    };
    return "#search="+encodeURIComponent(JSON.stringify(safe));
  }

  return {norm,parseQuery,isCurrent,coverageGate,evaluateOffer,search,serializeNormalized};
});
