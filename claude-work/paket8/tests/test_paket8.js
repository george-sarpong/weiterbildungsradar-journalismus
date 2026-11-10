// Paket 8 – Testsatz Stufe 1 (auto, jsdom) gemäss VORLAGE_TESTKRITERIEN_MESSUNG_20261109.md
// Kriterien: D2, D5, F1 (T01–T20), F4, F9, S2, S3 (Vorprüfung; Endprüfung im Browser, Stufe 2).
// Prüfling: claude-work/paket7/website (app-v36.js, data-p7.js, index.html) + paket3/out/merge_kandidat_smart.json.
// Aufruf (im Repo-Root): TZ=Europe/Zurich NODE_PATH=<ordner>/node_modules node claude-work/paket8/tests/test_paket8.js
// Prüfling wählbar (Paket 9): WEBSITE=claude-work/paket9/website APP=app-v37.js; Daten bleiben paket7/website/data-p7.js.
// Stichtag fest 2026-11-09 (überschreibbar mit STICHTAG=YYYY-MM-DD). Schreibt Trefferlisten nach paket8/out/.
// Ergebnisarten: PASS · FAIL · SPÄTER (Kriterium laut E074 nach der Beta). Exit-Code 1 nur bei FAIL.
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { JSDOM } = require("jsdom");

const ROOT = process.cwd();
const CW = path.join(ROOT, "claude-work");
const P3 = path.join(CW, "paket3/out"), W7 = path.join(CW, "paket7/website");
const WEB = path.resolve(ROOT, process.env.WEBSITE || path.join(CW, "paket7/website")), APPNAME = process.env.APP || "app-v36.js";
const OUT = path.join(CW, "paket8/out", WEB === W7 ? "" : path.basename(path.dirname(WEB)));
const read = p => fs.readFileSync(p, "utf8");
const APP = read(path.join(WEB, APPNAME)), INDEX = read(path.join(WEB, "index.html"));
const DATA_JS = read(process.env.DATA ? path.resolve(ROOT, process.env.DATA) : path.join(W7, "data-p7.js")); // Paket 13: DATA=claude-work/paket13/website/data-p13.js
const DATA = JSON.parse(DATA_JS.slice(DATA_JS.indexOf("["), DATA_JS.lastIndexOf("]") + 1));
const SMART = JSON.parse(read(process.env.SMART ? path.resolve(ROOT, process.env.SMART) : path.join(P3, "merge_kandidat_smart.json"))); // Paket 14: SMART=claude-work/paket14/out/smart-search-data-p14.json
const T = process.env.STICHTAG || "2026-11-09";
const strip = html => html.replace(/<script src="[^"]+"><\/script>/g, "");
const dataJs = offers => `window.WEITERBILDUNGSRADAR_OFFERS = ${JSON.stringify(offers)};`;
const smartJs = smart => `window.MEDIA_SKILLS_SMART_DATA = ${JSON.stringify(smart)};`;
const SMART_JS = smartJs(SMART);
const clone = o => JSON.parse(JSON.stringify(o));

function load(data = DATA_JS, smart = SMART_JS, { url = "https://mediaskills.ch/", app = APP } = {}) {
  const dom = new JSDOM(strip(INDEX), { url, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.eval(`(() => { const R = Date; const F = new R("${T}T12:00:00").getTime();
    class D extends R { constructor(...a) { a.length ? super(...a) : super(F); } static now() { return F; } }
    window.Date = D; })();`);
  w.eval(data); w.eval(smart); w.eval(app);
  return w;
}
const txt = n => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
const cards = w => [...w.document.querySelectorAll("#cards article.card")].map(a => ({
  id: a.dataset.offerId,
  facts: Object.fromEntries([...a.querySelectorAll(".fact-item")].map(f => [txt(f.querySelector("dt")), txt(f.querySelector("dd"))])),
  badges: [...a.querySelectorAll(".badges .badge")].map(txt),
  access: txt(a.querySelector(".access")), provider: txt(a.querySelector(".provider")), title: txt(a.querySelector("h3"))
}));
// Zuordnung Smart-Karte → Angebot über Titel, Anbieter und Angebotslink (Smart-Karten tragen keine ID).
const KEY = o => `${o.title}|${o.provider}|${o.url}`;
const BYKEY = {};
DATA.forEach(o => { (BYKEY[KEY(o)] = BYKEY[KEY(o)] || []).push(o.id); });
const byId = Object.fromEntries(DATA.map(o => [o.id, o]));
const BUDGET_LABELS = ["Journalist:innen-Tarif im Budget", "bedingter Tarif im Budget", "könnte ins Budget passen", "Preis nicht sicher vergleichbar", "über Budget", "im Budget"];
function smart(w, q) {
  const d = w.document;
  d.querySelector("#smartInput").value = q;
  d.querySelector("#smartSearchForm").dispatchEvent(new w.Event("submit", { cancelable: true }));
  const res = [...d.querySelectorAll("#smartResults .smart-result-card")].map(c => {
    const a = c.querySelector("a.source-link");
    const title = txt(c.querySelector("h3")), provider = txt(c.querySelector(".smart-result-provider"));
    const ids = BYKEY[`${title}|${provider}|${a ? a.getAttribute("href") : ""}`] || [];
    const fit = txt(c.querySelector(".smart-fit")).replace(/^Passt, weil:\s*/, "").replace(/\.$/, "");
    const status = BUDGET_LABELS.find(l => fit.split(" · ").includes(l)) || "";
    return { ids, title, provider, rank: txt(c.querySelector(".smart-result-rank")),
      meta: [...c.querySelectorAll(".smart-result-meta span")].map(txt), fit, status,
      budget: [...c.querySelectorAll(".smart-budget")].map(txt).join(" // ") };
  });
  const bands = Object.fromEntries([...d.querySelectorAll("#smartPriceBands .price-band")].map(b => [txt(b.querySelector("span")), Number(txt(b.querySelector("strong")).replace(/\D/g, ""))]));
  const summary = txt(d.querySelector("#smartSummary"));
  return { q, summary, total: Number((summary.match(/^([\d']+) passende/) || [0, "0"])[1].replace(/'/g, "")),
    understood: txt(d.querySelector("#smartUnderstood")), note: txt(d.querySelector("#smartPriceNote")),
    pool: Object.values(bands).reduce((a, b) => a + b, 0), res, output: txt(d.querySelector("#smartOutput")) };
}
const single = (offer, smartEntry, q) => smart(load(dataJs([offer]), smartJs({ meta: SMART.meta, byId: { [offer.id]: smartEntry } })), q);

const results = [];
const check = (id, name, ok, detail = "") => { const s = ok === "SPÄTER" ? "SPÄTER" : ok ? "PASS" : "FAIL";
  results.push({ id, name, status: s, detail }); console.log(`${s} ${id} ${name}${detail ? " – " + detail : ""}`); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const list = (arr, n = 4) => arr.slice(0, n).join(", ") + (arr.length > n ? ` … (+${arr.length - n})` : "");

// ---- Unabhängige Referenz Sichtbarkeit (separat formuliert)
const iso = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "").trim()) ? String(v).trim() : null;
const dateVisible = o => {
  if (Array.isArray(o.sessions)) return o.sessions.some(s => iso(s.startDate) && s.startDate >= T);
  const e = iso(o.endDate), s = iso(o.startDate);
  return e ? e >= T : (!s || s >= T);
};
// ---- Unabhängige Referenz Budget: notwendige Bedingungen für «im Budget» (E010, E037, E051, E054)
const NOMINAL = ["CHF", "EUR", "USD"];
const directOk = (id, budget) => {
  const s = SMART.byId[id];
  if (!s || !s.priceEligible) return false;
  return s.priceOptions.some(p => p.eligibilityType === "NONE" && (p.amountType === "FREE"
    || (NOMINAL.includes(p.currency) && ((p.amountType === "EXACT" && p.amount <= budget) || (p.amountType === "RANGE" && p.maxAmount != null && p.maxAmount <= budget)))));
};
const conditionalOk = (id, budget) => (SMART.byId[id]?.priceOptions || []).some(p => p.eligibilityType !== "NONE"
  && NOMINAL.includes(p.currency) && ((p.amountType === "EXACT" && p.amount <= budget) || p.amountType === "FREE"));

const W = load(), CARDS = cards(W);
const F1 = {};               // Trefferlisten für den ersten Lauf (Vorlage §2.7)
const ALL = [];              // alle Smart-Antworten für F4/F9/S2
const run = (tid, q, w = W) => { const r = smart(w, q); F1[tid] = F1[tid] || []; F1[tid].push(r); ALL.push(r); return r; };

// ======== D2 Sichtbare Menge = beta_sichtbar JA (E042, E063, E067, E068, E071) ========
{
  const M = JSON.parse(execFileSync("python3", ["-I", "-c", `
import csv,json,sys
print(json.dumps({x['id']:{'markt':x['market'],'beta':x['beta_sichtbar'],'grund':x['beta_grund'],'pub':x['publikationsstatus']}
   for x in csv.DictReader(open(sys.argv[1],encoding='utf-8-sig'))}))`, process.env.MASTER ? path.resolve(ROOT, process.env.MASTER) : path.join(P3, "master_3818.csv")], { maxBuffer: 1 << 27 }).toString());
  const vis = new Set(CARDS.map(c => c.id));
  const notInMaster = DATA.filter(o => !M[o.id]);
  const wrongMarket = DATA.filter(o => M[o.id] && !["CH", "AT", "LI"].includes(M[o.id].markt));
  check("D2a", "Website-Daten = 1'352 Master-Zeilen CH/AT/LI; keine DE/USA-Zeile (E074), also auch keine E067/E068-Zeile", DATA.length === 1352 && !notInMaster.length && !wrongMarket.length
    && Object.values(M).filter(m => ["CH", "AT", "LI"].includes(m.markt)).length === 1352, `${DATA.length} Zeilen`);
  const visNo = [...vis].filter(id => M[id].beta !== "JA");
  check("D2b", "Keine sichtbare Karte mit beta_sichtbar NEIN (u. a. 46 HOLD)", visNo.length === 0, visNo.length ? list(visNo) : `${DATA.filter(o => M[o.id].beta === "NEIN").length} NEIN-Zeilen, alle unsichtbar`);
  const holdVis = [...vis].filter(id => M[id].pub === "HOLD");
  check("D2c", "Keine sichtbare HOLD-Zeile (E063, E071)", holdVis.length === 0);
  const jaDiff = DATA.filter(o => M[o.id].beta === "JA" && vis.has(o.id) !== dateVisible(o)).map(o => o.id);
  const jaHidden = DATA.filter(o => M[o.id].beta === "JA" && !vis.has(o.id)).length;
  check("D2d", `beta_sichtbar JA, aber unsichtbar nur wegen Termin am Stichtag (E014); Referenz unabhängig`, jaDiff.length === 0,
    jaDiff.length ? list(jaDiff) : `${vis.size} sichtbar, ${jaHidden} JA-Zeilen wegen vergangenem Termin ausgeblendet`);
}

// ======== D5 Fehlende Felder sichtbar, nie leer, nie Rohcode (E031, E036) ========
const RAW = /\b[A-Z]{2,}(?:_[A-Z]+)+\b/;
const NOT_PUB = /nicht publiziert/i;
{
  const empty = [], raw = {}, notPub = {};
  for (const c of CARDS) {
    // Paket 17 (E116): Badges nach Bezeichnung statt Position; «Anbieterland» fehlt, wenn unbekannt
    const byPrefix = p => c.badges.find(x => x.startsWith(p + ":"));
    const fields = { ...c.facts, Sprache: c.badges[2], Niveau: c.badges[1], Ort: byPrefix("Ort"), ...(byPrefix("Anbieterland") ? { Anbieterland: byPrefix("Anbieterland") } : {}), "CH-Zugang": byPrefix("CH-Zugang"), Zugang: c.access, Anbieter: c.provider, Titel: c.title };
    for (const [k, v] of Object.entries(fields)) {
      const val = String(v ?? "").replace(/^(Ort|Anbieterland|CH-Zugang|Zugang):\s*/, "");
      if (!val || /\b(undefined|null|NaN)\b/.test(val)) empty.push(`${c.id}/${k}`);
      if (RAW.test(String(v))) (raw[k] = raw[k] || []).push(`${c.id} «${String(v).match(RAW)[0]}»`);
      if (NOT_PUB.test(val)) notPub[k] = (notPub[k] || 0) + 1;
    }
  }
  check("D5a", "Keine Kartenangabe leer, «undefined», «null» oder «NaN» (Fakten, Badges, Zugang)", empty.length === 0, empty.length ? list(empty) : `${CARDS.length} Karten`);
  const rawIds = [...new Set(Object.values(raw).flat().map(x => x.split(" ")[0]))];
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `d5_rohcodes_${T}.csv`), "id;feld;rohcode;anzeige\n" + CARDS.flatMap(c => {
    const f = { ...c.facts, Ort: c.badges[3] };
    return Object.entries(f).filter(([, v]) => RAW.test(String(v))).map(([k, v]) => `${c.id};${k};${String(v).match(RAW)[0]};"${String(v).replace(/"/g, "'")}"`);
  }).join("\n") + "\n");
  check("D5b", "Keine Rohcodes (z. B. NOT_PUBLISHED, ON_REQUEST) statt einer lesbaren Angabe auf den Karten", rawIds.length === 0,
    `${rawIds.length} Karten: ` + Object.entries(raw).map(([k, v]) => `${k} ${v.length} (${list(v, 2)})`).join("; "));
  const sm = ["Videojournalismus, 3 Tage", "Video", "Podcast", "Journalismus"].map(q => run("D5", q));
  const smRaw = sm.flatMap(r => r.res.flatMap(c => c.meta.filter(m => RAW.test(m)).map(m => `${c.ids[0]} «${m}»`)));
  check("D5c", "Keine Rohcodes in den Smart-Karten (Stichprobe 4 Anfragen)", smRaw.length === 0, smRaw.length ? list(smRaw, 3) : "");
  results.push({ id: "D5-Hinweis", status: "INFO", detail: `«nicht erfasst» vs. «Nicht publiziert»: ` + Object.entries(notPub).map(([k, n]) => `${k} ${n}`).join(", ") });
  console.log(`INFO D5-Hinweis Kartenangaben mit «nicht publiziert» (E087, E093): ${Object.entries(notPub).map(([k, n]) => `${k} ${n}`).join(", ")}`);
}

// ======== F1 Testfragen T01–T20 (Vorlage §2.7, E077) ========
const shownOk = r => r.res.length <= 3;
const directViolations = (r, budget) => r.res.filter(c => c.status === "im Budget" && !c.ids.some(id => directOk(id, budget))).map(c => c.title);
{
  // T01
  const r = run("T01", "Datenjournalismus, CHF 800, 2 Tage");
  const v = directViolations(r, 800);
  check("F1/T01", "«Datenjournalismus, CHF 800, 2 Tage»: «im Budget» nur mit belegtem unbedingtem Preis ≤ 800; höchstens 3 Optionen; Dauer erkannt, nicht als Hartfilter",
    v.length === 0 && shownOk(r) && r.res.length >= 2 && /Zeit: 2 Tage · erkannt, nicht angewendet/.test(r.understood), `${r.total} Treffer, gezeigt ${r.res.length}: ${r.res.map(c => `${c.ids[0]} (${c.status})`).join(", ")}`);
  check("F1/T01-Dauer", "Dauer als Trefferklasse, Kurse ohne Dauer als eigene Gruppe (E058)", "SPÄTER", "E058 nach der Beta (E074)");
}
{
  // T02, T03 – OFFER-DJA-009 einzeln (EUR 480–512)
  const o = byId["OFFER-DJA-009"], s = SMART.byId["OFFER-DJA-009"];
  const one = b => single(o, s, `Datenjournalismus, CHF ${b}`);
  const r800 = one(800); F1.T02 = [r800];
  check("F1/T02", "Budget CHF 800, OFFER-DJA-009 (EUR 480–512): direkter Treffer mit 1:1-Hinweis (E051, E037)",
    r800.res.length === 1 && r800.res[0].status === "im Budget" && /1:1/.test(r800.res[0].budget), r800.res[0] && r800.res[0].budget.slice(0, 60));
  const st = [511, 512, 513].map(b => { const x = one(b); (F1.T03 = F1.T03 || []).push(x); return x.res[0] ? x.res[0].status : "–"; });
  check("F1/T03", "Budget 511 / 512 / 513: «könnte ins Budget passen» / direkt / direkt (E051)", same(st, ["könnte ins Budget passen", "im Budget", "im Budget"]), st.join(" / "));
}
{
  const r = run("T04", "500 Euro");
  const v = directViolations(r, 500);
  const condBad = r.res.filter(c => /Tarif im Budget/.test(c.status) && !c.ids.some(id => conditionalOk(id, 500)));
  check("F1/T04", "«500 Euro»: Budget EUR 500 erkannt, Vergleich 1:1 mit Hinweis; Budgetaussagen belegt", /Budget: EUR 500/.test(r.understood) && /vereinfacht 1:1/.test(r.note)
    && v.length === 0 && condBad.length === 0 && shownOk(r), `${r.total} Treffer; gezeigt: ${r.res.map(c => c.status).join(" / ")}`);
}
{
  // T05 – kein GBP-Preis im Bestand; synthetischer Fall auf einer echten Karte
  const gbpInData = Object.values(SMART.byId).filter(s => s.priceOptions.some(p => p.currency === "GBP")).length;
  const o = byId["OFFER-DJA-009"], s = clone(SMART.byId["OFFER-DJA-009"]);
  s.priceOptions = [{ ...s.priceOptions[0], amountType: "EXACT", amount: 300, minAmount: null, maxAmount: null, currency: "GBP" }];
  const r = single(o, s, "Datenjournalismus, CHF 800"); F1.T05 = [r];
  const c = r.res[0] || {};
  check("F1/T05", "GBP-Preis: keine Budgetaussage (E009); synthetischer Fall, im Bestand 0 GBP-Preise",
    r.res.length === 1 && !["im Budget", "könnte ins Budget passen", "über Budget", "bedingter Tarif im Budget", "Journalist:innen-Tarif im Budget"].includes(c.status) && !/bleiben/.test(c.budget), `${gbpInData} GBP im Bestand; Status «${c.status}»`);
}
{
  const r = run("T06", "kostenlos");
  const ok = r.res.every(c => /^(Kostenlos|Kostenlos mit Bedingung: .+|Preis unbestätigt)$/.test(c.meta[0]));
  const freeBad = r.res.filter(c => c.meta[0] === "Kostenlos" && !c.ids.some(id => (SMART.byId[id]?.priceOptions || []).some(p => p.amountType === "FREE" && p.eligibilityType === "NONE")));
  check("F1/T06", "«kostenlos»: Bezeichnungen nach E057; «Kostenlos» nur mit unbedingtem Gratis-Tarif", ok && freeBad.length === 0 && shownOk(r), `${r.total} Treffer: ${r.res.map(c => c.meta[0]).join(" / ")}`);
}
{
  // T07 – jedes sichtbare Angebot mit günstigerem bedingtem und teurerem unbedingtem Preis (CHF/EUR, EXACT), je Bedingungstyp bis 5
  const vis = new Set(CARDS.map(c => c.id)), seen = {}, cases = [];
  for (const o of DATA.filter(x => vis.has(x.id))) {
    const s = SMART.byId[o.id]; if (!s.priceEligible) continue;
    const ex = s.priceOptions.filter(p => p.amountType === "EXACT" && NOMINAL.includes(p.currency));
    const u = ex.filter(p => p.eligibilityType === "NONE"), c = ex.filter(p => p.eligibilityType !== "NONE");
    if (!u.length || !c.length) continue;
    const cMin = Math.min(...c.map(p => p.amount)), uMin = Math.min(...u.map(p => p.amount));
    if (cMin >= uMin) continue;
    const k = c.find(p => p.amount === cMin).eligibilityType; seen[k] = (seen[k] || 0) + 1;
    if (seen[k] <= 5) cases.push({ o, s, b: cMin });
  }
  const bad = [];
  F1.T07 = cases.map(({ o, s, b }) => {
    // Anfrage aus Titelwörtern ohne Kursform-Wörter (sonst wird «online» zur harten Durchführungsbedingung)
    const words = o.title.replace(/[–—:()/,.]/g, " ").split(/\s+/).filter(x => x.length > 2 && !/^(online|präsenz|hybrid|live|vor ort)$/i.test(x));
    const r = single(o, s, `${words.join(" ")}, CHF ${b}`);
    const c = r.res[0];
    const nonDirect = ["Journalist:innen-Tarif im Budget", "bedingter Tarif im Budget", "könnte ins Budget passen"];
    const named = c && (/ · /.test(c.meta[0]) || /^Kostenlos mit Bedingung: /.test(c.meta[0]));
    if (!c || !nonDirect.includes(c.status) || !named) bad.push(`${o.id}: ${c ? `${c.status} / ${c.meta[0]}` : "kein Treffer"}`);
    return { id: o.id, budget: b, status: c && c.status, preis: c && c.meta[0] };
  });
  const st = {}; F1.T07.forEach(x => { st[x.status] = (st[x.status] || 0) + 1; });
  check("F1/T07", `Bedingter Tarif unter, Standardtarif über Budget: kein direkter Treffer, Tarif sichtbar und bezeichnet (E010, E039); ${cases.length} Fälle (${Object.keys(seen).join(", ")})`,
    cases.length > 0 && bad.length === 0, bad.length ? list(bad, 3) : Object.entries(st).map(([k, n]) => `${k} ${n}`).join(", "));
}
{
  const past = DATA.filter(o => !Array.isArray(o.sessions) && iso(o.startDate) && o.startDate < T && !iso(o.endDate));
  const shown = past.filter(o => CARDS.some(c => c.id === o.id));
  check("F1/T08", "Vergangener Start ohne Enddatum: nicht sichtbar (E014)", shown.length === 0, `${past.length} Fälle im Bestand`);
}
{
  const o = byId["PCC-P08"];
  const w = load(); w.document.querySelector("#searchInput").value = o.title; w.document.querySelector("#searchInput").dispatchEvent(new w.Event("input", { bubbles: true }));
  const classic = cards(w).some(c => c.id === "PCC-P08");
  const r = run("T09", o.title);
  check("F1/T09", "PCC-P08 (HOLD): weder im Katalog noch in der Smart-Suche auffindbar (E017, E050, E063)", o.publicationStatus === "HOLD" && !classic && !r.res.some(c => c.ids.includes("PCC-P08")));
}
check("F1/T10", "DE-Kurs ohne CH-Durchführungsort: CH-Zugang offen", "SPÄTER", "mit D6 nach der Beta (E074)");
check("F1/T11", "Merkliste mit unbestätigtem Preis", "SPÄTER", "mit F10 nach der Beta (E074)");
{
  const a = load().document.querySelector("#sortSelect").value;
  const b = load(DATA_JS, SMART_JS, { url: "https://mediaskills.ch/?sort=EDITORIAL" }).document.querySelector("#sortSelect").value;
  check("F1/T12", "Ohne Parameter und mit altem Link ?sort=EDITORIAL: Sortierung «Zuletzt geprüft» (E020)", a === "APPROVED" && b === "APPROVED");
}
{
  const r = run("T13", "Mobile Reporting, unter CHF 300");
  const v = directViolations(r, 300);
  const condDirect = r.res.filter(c => c.status === "im Budget" && /·/.test(c.meta[0]));
  check("F1/T13", "Freie «Mobile Reporting, unter CHF 300»: direkter Treffer nur mit Standardpreis ≤ 300; Tarife bezeichnet (E010, E039)",
    v.length === 0 && condDirect.length === 0 && shownOk(r), `${r.total} Treffer: ${r.res.map(c => `${c.meta[0]} → ${c.status}`).join(" / ")}`);
}
{
  const r = run("T14", "Podcast produzieren, online");
  const verifiedBad = r.res.filter(c => !c.ids.some(id => SMART.byId[id]?.delivery?.evidenceTier === "VERIFIED"));
  check("F1/T14a", "«Podcast produzieren, online»: «online» als bestätigt nur bei Kursform VERIFIED (E011)", verifiedBad.length === 0, `${r.res.length} gezeigt`);
  // E088 (Owner 10.11.): Erwartung für die Beta angepasst – harte Kursform-Bedingung bleibt; Gruppe «Kursform unbestätigt» später mit E058.
  check("F1/T14b", "… übrige Kursformen sichtbar als unbestätigt (Vorlage §2.7)", "SPÄTER",
    `E088: später mit E058; heute ${r.res.length} gezeigt, ${r.pool} Angebote zum Thema`);
}
const MAKER = /^(Adobe|Apple|Google|Microsoft|Meta|Avid|Blackmagic|Autodesk|Canva|Midjourney|OpenAI|Sony|Canon|Nikon)\b/i;
{
  const r = run("T15", "KI im Journalismus, Zürich");
  const notCH = r.res.filter(c => !/^Ort: Schweiz\b/.test(c.meta.find(m => m.startsWith("Ort: ")) || ""));
  const makerAll = CARDS.filter(c => MAKER.test(c.provider)).map(c => `${c.id} ${c.provider}`);
  check("F1/T15", "«KI im Journalismus, Zürich»: Treffer mit Ort Schweiz; keine Hersteller-Academy (E004, E066)",
    r.res.length > 0 && notCH.length === 0 && !r.res.some(c => MAKER.test(c.provider)) && makerAll.length === 0, `${r.total} Treffer; Hersteller-Anbieter im sichtbaren Bestand: ${makerAll.length}`);
}
{
  const r = run("T16", "Videojournalismus, 3 Tage"), r0 = smart(W, "Videojournalismus");
  check("F1/T16", "«Videojournalismus, 3 Tage»: kein harter Dauerfilter (E021); Treffermenge = ohne Dauer",
    /Zeit: 3 Tage · erkannt, nicht angewendet/.test(r.understood) && r.total === r0.total && r.total > 0, `${r.total} Treffer (ohne Dauer ${r0.total})`);
}
{
  const r = run("T17", "Bildbearbeitung für Fotojournalismus");
  check("F1/T17", "«Bildbearbeitung für Fotojournalismus»: keine Werbe-Beautyretusche (PCC-P32), keine Herstellerzertifizierung (E004, E016)",
    !r.res.some(c => c.ids.includes("PCC-P32") || MAKER.test(c.provider)) && !CARDS.some(c => c.id === "PCC-P32"), `${r.total} Treffer`);
}
{
  const r = run("T18", "Social Media und Audience");
  const pr = r.res.filter(c => /\b(PR|Public Relations|Marketing|Werbung)\b/i.test(c.title + " " + c.provider));
  check("F1/T18", "«Social Media und Audience»: kein reines PR/Marketing (E005)", pr.length === 0, `${r.total} Treffer`);
}
{
  const r = run("T19", "Moderation, 1000 Euro");
  const cur = c => (c.meta[0].match(/\b(CHF|EUR|USD)\b/) || [])[1];
  const bad = r.res.filter(c => /bleiben/.test(c.budget) && (!/bleiben EUR/.test(c.budget) || (cur(c) && cur(c) !== "EUR" && !/1:1/.test(c.budget))));
  check("F1/T19", "«Moderation, 1000 Euro»: Restbetrag in EUR; bei anderer Währung 1:1-Hinweis (E037, E079, E080)",
    /Budget: EUR 1/.test(r.understood) && bad.length === 0 && directViolations(r, 1000).length === 0 && r.res.some(c => /bleiben/.test(c.budget)), `${r.total} Treffer: ${r.res.map(c => c.budget.slice(0, 32)).join(" / ")}`);
}
{
  const r = run("T20", "Datenvisualisierung kostenlos");
  check("F1/T20", "«Datenvisualisierung kostenlos»: nur Bezeichnungen nach E057", r.res.every(c => /^(Kostenlos|Kostenlos mit Bedingung: .+|Preis unbestätigt)$/.test(c.meta[0])), `${r.total} Treffer`);
}

// ======== F4 Budgettreffer nur bei vollem unbedingtem Preis; Tarife bedingt (E010, E039, E054) ========
{
  const extra = [["Journalismus, CHF 1000", 1000], ["Video, CHF 500", 500], ["Podcast, CHF 2000", 2000], ["Recherche, CHF 700", 700], ["KI, EUR 400", 400]];
  const rs = [[F1.T01[0], 800], [F1.T04[0], 500], [F1.T13[0], 300], [F1.T19[0], 1000], ...extra.map(([q, b]) => [run("F4", q), b])];
  const v = rs.flatMap(([r, b]) => directViolations(r, b).map(t => `${r.q}: ${t}`));
  check("F4a", `«im Budget» nur mit belegtem unbedingtem Preis ≤ Budget (${rs.length} Anfragen)`, v.length === 0, v.length ? list(v, 3) : "");
  const cond = rs.flatMap(([r, b]) => r.res.filter(c => /Tarif im Budget/.test(c.status)).map(c => ({ c, r, b })));
  // Paket 15: «Kostenlos mit Bedingung: …» (E057) benennt den bedingten Tarif ebenfalls – vorher nie in einer F4-Trefferliste
  const cv = cond.filter(({ c, b }) => !(/·/.test(c.meta[0]) || /^Kostenlos mit Bedingung: .+/.test(c.meta[0])) || !c.ids.some(id => conditionalOk(id, b))).map(({ c, r }) => `${r.q}: ${c.title}`);
  check("F4b", "Bedingte Tarife nur mit Bezeichnung des Tarifs und belegtem bedingtem Preis ≤ Budget", cv.length === 0, `${cond.length} bedingte Treffer${cv.length ? "; " + list(cv, 2) : ""}`);
  const order = rs.filter(([r]) => { const s = r.res.map(c => c.status); const i = s.indexOf("Journalist:innen-Tarif im Budget"), j = s.indexOf("im Budget"); return i >= 0 && j >= 0 && i < j; }).map(([r]) => r.q);
  results.push({ id: "F4-Hinweis", status: "INFO", detail: `Journalist:innen-Tarif vor unbedingtem Preis gereiht in: ${order.join("; ") || "–"}` });
  console.log(`INFO F4-Hinweis Journalist:innen-Tarif (TARGET_GROUP_FIT) steht in der Reihenfolge vor «im Budget»: ${order.length} von ${rs.length} Anfragen (${list(order, 3)})`);
}

// ======== F9 2–3 begründete Alternativen, kein Ranking, keine «Top-Empfehlung» (E039) ========
{
  const withHits = ALL.filter(r => r.total > 0);
  const count = withHits.filter(r => r.res.length !== Math.min(3, r.total)).map(r => r.q);
  check("F9a", `Bis 3 Optionen, bei ≥ 2 Treffern mindestens 2 (${withHits.length} Anfragen mit Treffern)`, count.length === 0, list(count, 3));
  const why = withHits.flatMap(r => r.res.filter(c => !c.fit).map(c => `${r.q}: ${c.title}`));
  check("F9b", "Jede Option begründet («Passt, weil: …»)", why.length === 0, list(why, 2));
  const top = ALL.filter(r => /\b(Top|beste[nrs]?|Empfehlung|empfohlen)\b/i.test(r.output)).map(r => r.q);
  check("F9c", "Keine «Top»-, «beste»- oder «Empfehlung»-Bezeichnung in der Smart-Ausgabe", top.length === 0, list(top, 3));
  const numbered = ALL.some(r => /\bOption [1-3]\b/.test(r.output));
  console.log(`INFO F9-Hinweis Smart-Karten mit Nummer «Option 1–3»: ${numbered ? "ja" : "nein"}; Reihenfolge nach Budgetklasse und Punktzahl (Browser-Teil von F9)`);
  results.push({ id: "F9-Hinweis", status: "INFO", detail: `Nummer «Option 1–3»: ${numbered ? "ja" : "nein"}` });
}

// ======== S2 Suchtext nie in URL, Cookies, Storage (E012) – S3 Vorprüfung ========
{
  const w = load(), probe = "Datenschutzprobe Podcast CHF 750 xyzzy";
  const href0 = w.location.href;
  smart(w, probe);
  const store = s => JSON.stringify(Object.fromEntries(Object.keys(s).map(k => [k, s.getItem(k)])));
  check("S2a", "Smart-Suche: Eingabetext nicht in URL, Cookies, localStorage, sessionStorage (E012)",
    w.location.href === href0 && !w.document.cookie && !store(w.localStorage).includes("xyzzy") && !store(w.sessionStorage).includes("xyzzy"), w.location.href);
  w.document.querySelector("#searchInput").value = "xyzzy"; w.document.querySelector("#searchInput").dispatchEvent(new w.Event("input", { bubbles: true }));
  const classicInUrl = w.location.href.includes("xyzzy");
  console.log(`INFO S2-Hinweis Katalogsuche schreibt den Suchtext als ?q= in die Adresse: ${classicInUrl ? "ja" : "nein"} (live app-v33.js gleich; Datenschutzerklärung nennt nur die Freitext-Suche)`);
  results.push({ id: "S2-Hinweis", status: "INFO", detail: `Katalogsuche ?q= in der Adresse: ${classicInUrl ? "ja" : "nein"}` });
  const w2 = load();
  const before = w2.localStorage.length, cookie = w2.document.cookie;
  smart(w2, "Video"); w2.document.querySelector("#searchInput").value = "Video"; w2.document.querySelector("#searchInput").dispatchEvent(new w2.Event("input", { bubbles: true }));
  const afterSearch = w2.localStorage.length;
  const btn = w2.document.querySelector("#cards [data-favorite-id]"); const fid = btn.dataset.favoriteId; btn.click();
  const keys = Object.keys(w2.localStorage), val = w2.localStorage.getItem("weiterbildungsradar:favorites:v1");
  check("S3-Vorprüfung", "Keine Cookies; localStorage leer bis zum aktiven Merken, danach nur Schlüssel weiterbildungsradar:favorites:v1 mit Angebots-ID (jsdom; Endprüfung Stufe 2)",
    before === 0 && afterSearch === 0 && !cookie && !w2.document.cookie && same(keys, ["weiterbildungsradar:favorites:v1"]) && same(JSON.parse(val), [fid]), `${keys.join(", ")} = ${val}`);
}

// ======== Gegenproben: eingebaute Fehler müssen erkannt werden ========
{
  const holdOpen = DATA.filter(o => o.publicationStatus === "HOLD" && dateVisible(o)).map(o => o.id);
  const d = clone(DATA); d.filter(o => holdOpen.includes(o.id)).forEach(o => { o.publicationStatus = ""; });
  const leaked = holdOpen.length > 0 && cards(load(dataJs(d))).filter(c => holdOpen.includes(c.id)).length === holdOpen.length;
  const a1 = APP.replace('if (option.eligibilityType === "PROFESSION" && option.eligibilityValue === "JOURNALIST") return "TARGET_GROUP_FIT";', 'if (option.eligibilityType === "PROFESSION" && option.eligibilityValue === "JOURNALIST") return "DIRECT_FIT";');
  const m2 = a1 !== APP ? directViolations(smart(load(DATA_JS, SMART_JS, { app: a1 }), "500 Euro"), 500).length : 0;
  const a2 = APP.replace("const renderSmart = raw => {", "const renderSmart = raw => { try { window.localStorage.setItem('probe', raw); } catch (e) {}");
  const w3 = load(DATA_JS, SMART_JS, { app: a2 }); smart(w3, "xyzzy Podcast");
  const m3 = JSON.stringify(Object.values(w3.localStorage)).includes("xyzzy") || String(w3.localStorage.getItem("probe")).includes("xyzzy");
  check("G01", "Gegenprobe D2: HOLD bei terminlich sichtbaren HOLD-Angeboten entfernt → sie würden sichtbar, Referenz D2b/D2c erkennt das", leaked, `${holdOpen.length} Angebote`);
  check("G02", "Gegenprobe F4: Journalist:innen-Tarif als direkter Treffer → erkannt", m2 > 0, `${m2} Verstösse erkannt`);
  check("G03", "Gegenprobe S2: Suchtext in localStorage → erkannt", m3);
}

// ---- Ausgabe
fs.mkdirSync(OUT, { recursive: true });
const slim = r => ({ q: r.q, total: r.total, verstanden: r.understood, gezeigt: r.res.map(c => ({ id: c.ids.join("|"), titel: c.title, anbieter: c.provider, preis: c.meta[0], status: c.status, budget: c.budget })) });
fs.writeFileSync(path.join(OUT, `f1_trefferlisten_${T}.json`), JSON.stringify({ stichtag: T, pruefling: `${path.relative(ROOT, WEB)}/${APPNAME} + paket7/website/data-p7.js`,
  T07: F1.T07, ...Object.fromEntries(Object.entries(F1).filter(([k]) => k !== "T07").map(([k, v]) => [k, v.map(slim)])) }, null, 1));
fs.writeFileSync(path.join(OUT, `ergebnis_stufe1_jsdom_${T}.json`), JSON.stringify(results, null, 1));
const n = s => results.filter(r => r.status === s).length;
console.log(`\n${n("PASS")} PASS · ${n("FAIL")} FAIL · ${n("SPÄTER")} SPÄTER (Stichtag ${T})`);
process.exit(n("FAIL") ? 1 : 0);
