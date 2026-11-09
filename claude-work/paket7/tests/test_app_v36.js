// Paket 7 – Tests für app-v36.js, data-p7.js, index.html/methodik.html (Beta-Muss E074: D7, F5, F6)
// Aufruf (im Repo-Root): TZ=Europe/Zurich NODE_PATH=<ordner>/node_modules node claude-work/paket7/tests/test_app_v36.js
// Stichtag fest 2026-11-09 (überschreibbar mit STICHTAG=YYYY-MM-DD). Braucht python3 für die Reproduktionsprüfung.
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { JSDOM } = require("jsdom");

const ROOT = process.cwd();
const CW = path.join(ROOT, "claude-work");
const P3 = path.join(CW, "paket3/out"), W6 = path.join(CW, "paket6/website"), W7 = path.join(CW, "paket7/website");
const read = p => fs.readFileSync(p, "utf8");
const sha = s => crypto.createHash("sha256").update(s).digest("hex");
const APP35 = read(path.join(W6, "app-v35.js")), APP36 = read(path.join(W7, "app-v36.js"));
const INDEX6 = read(path.join(W6, "index.html")), INDEX7 = read(path.join(W7, "index.html"));
const METH6 = read(path.join(W6, "methodik.html")), METH7 = read(path.join(W7, "methodik.html"));
const DATA7_JS = read(path.join(W7, "data-p7.js"));
const DATA7 = JSON.parse(DATA7_JS.slice(DATA7_JS.indexOf("["), DATA7_JS.lastIndexOf("]") + 1));
const CAND = JSON.parse(read(path.join(P3, "merge_kandidat_data.json")));
const SMART = JSON.parse(read(path.join(P3, "merge_kandidat_smart.json")));
const T = process.env.STICHTAG || "2026-11-09";
const strip = html => html.replace(/<script src="[^"]+"><\/script>/g, "");
const dataJs = offers => `window.WEITERBILDUNGSRADAR_OFFERS = ${JSON.stringify(offers)};`;
const smartJs = smart => `window.MEDIA_SKILLS_SMART_DATA = ${JSON.stringify(smart)};`;
const SMART_JS = smartJs(SMART);
const V36 = [APP36, INDEX7], V35 = [APP35, INDEX6];

function load([app, index], data = DATA7_JS, smart = SMART_JS, { url = "https://mediaskills.ch/" } = {}) {
  const dom = new JSDOM(strip(index), { url, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.eval(`(() => { const R = Date; const F = new R("${T}T12:00:00").getTime();
    class D extends R { constructor(...a) { a.length ? super(...a) : super(F); } static now() { return F; } }
    window.Date = D; })();`);
  w.eval(data); w.eval(smart); w.eval(app);
  return w;
}
const cards = w => [...w.document.querySelectorAll("#cards article.card")].map(a => ({
  id: a.dataset.offerId,
  facts: Object.fromEntries([...a.querySelectorAll(".fact-item")].map(f => [f.querySelector("dt").textContent, f.querySelector("dd").textContent])),
  badges: [...a.querySelectorAll(".badges .badge")].map(b => b.textContent.trim()),
  rest: [".provider", "h3", ".card-description", ".access", ".card-links", ".checked"].map(s => (a.querySelector(s) || {}).innerHTML)
}));
const setSelect = (w, sel, value) => { const s = w.document.querySelector(sel); s.value = value; s.dispatchEvent(new w.Event("input", { bubbles: true })); };
const smart = (w, q) => {
  const d = w.document;
  d.querySelector("#smartInput").value = q;
  d.querySelector("#smartSearchForm").dispatchEvent(new w.Event("submit", { cancelable: true }));
  return {
    summary: d.querySelector("#smartSummary").textContent.replace(/\s+/g, " ").trim(),
    bands: Object.fromEntries([...d.querySelectorAll("#smartPriceBands .price-band")].map(b => [b.querySelector("span").textContent, Number(b.querySelector("strong").textContent.replace(/\D/g, ""))])),
    cards: [...d.querySelectorAll("#smartResults .smart-result-card")].map(c => ({
      title: c.querySelector("h3").textContent, provider: c.querySelector(".smart-result-provider").textContent,
      meta: [...c.querySelectorAll(".smart-result-meta span")].map(s => s.textContent),
      budget: [...c.querySelectorAll(".smart-budget")].map(b => b.textContent).join(" // ") }))
  };
};
const total = summary => Number((summary.match(/^([\d']+) passende/) || [0, "0"])[1].replace(/'/g, ""));

// ---- Unabhängige Referenz (separat formuliert, nicht aus app-v36.js kopiert)
const iso = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "").trim()) ? String(v).trim() : null;
const next = o => Array.isArray(o.sessions) ? o.sessions.filter(s => iso(s.startDate) && s.startDate >= T).sort((a, b) => a.startDate.localeCompare(b.startDate))[0] || null : null;
const visible = o => {
  if (o.publicationStatus === "HOLD") return false;
  if (Array.isArray(o.sessions)) return Boolean(next(o));
  const e = iso(o.endDate), s = iso(o.startDate);
  if (e) return e >= T;
  return !s || s >= T;
};
const VIS = DATA7.filter(visible);
const NAMES = { CH: "Schweiz", AT: "Österreich", LI: "Liechtenstein", DE: "Deutschland", BE: "Belgien", NO: "Norwegen", SE: "Schweden", PT: "Portugal", FR: "Frankreich" };
const codes = v => String(v ?? "").split("|").filter(c => /^[A-Z]{2}$/.test(c));
const online = o => /ONLINE$/.test(o.laender.ortSicherheit) && !/^(?:NICHT|UNKLAR)/.test(o.laender.ortSicherheit);
const fold = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const refRegion = o => { const r = String((next(o) || {}).region || o.region || "").trim(); return ["", "NOT_PUBLISHED", "NICHT_PUBLIZIERT", "NOT_APPLICABLE"].includes(r.toUpperCase()) ? "" : r; };
const refPlace = o => {
  const c = codes(o.laender.ortLand).map(x => NAMES[x] || x);
  const base = c.length ? c.join(" / ") : online(o) ? "Online" : "nicht erfasst";
  const r = refRegion(o);
  return r && fold(r) !== fold(base) ? `${base} · ${r}` : base;
};
const refPlaceValues = o => { const v = codes(o.laender.ortLand).map(x => NAMES[x] || x); if (online(o)) v.push("Online"); return v.length ? v : ["nicht erfasst"]; };
const active = p => (!p.validFrom || p.validFrom <= T) && (!p.validThrough || p.validThrough >= T);
const noCosts = p => (p.components || []).every(c => c.includedInBase || c.requirementStatus === "OPTIONAL" || (c.requirementStatus === "REQUIRED" && c.amountType === "EXACT" && c.amount === 0));
const freeOpts = id => { const r = SMART.byId[id]; return r && r.parserStatus === "AUTO_ACCEPT" && r.priceEligible === true ? (r.priceOptions || []).filter(p => p.amountType === "FREE" && active(p) && noCosts(p)) : []; };
const refDirectFree = id => freeOpts(id).some(p => p.eligibilityType === "NONE");
const refCondFree = id => !refDirectFree(id) && freeOpts(id).some(p => !["NONE", "UNKNOWN"].includes(p.eligibilityType));
// Erwartete Bezeichnungen der 9 KOSTENLOS-Angebote ohne strukturierte Gratis-Option (Audit 28.10. WDA-03 und Preisangaben)
const EXPECT_TEXT = {
  "OFFER-CORSO-002": "Kostenlos mit Bedingung: für Mitarbeitende bzw. Mitglieder der Partnerorganisationen",
  "CH-NOV-OF-022": "Kostenlos mit Bedingung: für Mitglieder", "CH-NOV-OF-023": "Kostenlos mit Bedingung: für Mitglieder",
  "CH-NOV-OF-024": "Kostenlos mit Bedingung: für Mitglieder", "CH-NOV-OF-025": "Kostenlos mit Bedingung: für Mitglieder",
  "CH-NOV-OF-026": "Kostenlos mit Bedingung: für Mitglieder", "OFFER-VSM-003": "Kostenlos mit Bedingung: für VSM-Mitglieder",
  "CH-CLEAN2-V9-D01": "Preis unbestätigt", "AT-PROD-OFFER-208": "Preis unbestätigt"
};
const refFreeLabel = o => refDirectFree(o.id) ? "Kostenlos" : EXPECT_TEXT[o.id];
const refPriceFilter = o => refDirectFree(o.id) ? "Kostenlos" : o.priceCategory !== "KOSTENLOS" ? null
  : EXPECT_TEXT[o.id] === "Preis unbestätigt" ? "Preis unbestätigt" : "Kostenlos mit Bedingung";
const forceVisible = o => Object.assign(JSON.parse(JSON.stringify(o)), { startDate: "", endDate: "", sessions: undefined, publicationStatus: "", start: "laufend" });

const results = [];
const check = (id, name, ok, detail = "") => { results.push({ id, ok }); console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail ? " – " + detail : ""}`); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const W = load(V36), CARDS = cards(W), byId = Object.fromEntries(DATA7.map(o => [o.id, o]));

// ---- D7 Länderanzeige (E043, E065, E066; Owner 10.11.: Filter Durchführungsort, Anbieterland «nicht erfasst»)
{
  const MASTER = JSON.parse(execFileSync("python3", ["-I", "-c", `
import csv,json,sys
r={x['id']:{'markt':x['release_markt'],'anbieterLand':x['anbieter_land'],'ortLand':x['durchfuehrungsort_land'],'ortSicherheit':x['durchfuehrungsort_sicherheit'],'chZugang':x['ch_zugang']}
   for x in csv.DictReader(open(sys.argv[1],encoding='utf-8-sig')) if x['market'] in ('CH','AT','LI')}
print(json.dumps(r))`, path.join(P3, "master_3818.csv")], { maxBuffer: 1 << 26 }).toString());
  const stripL = o => { const c = { ...o }; delete c.laender; return c; };
  check("L01", "data-p7: gleiche 1'352 Angebote wie Kandidat, nur Feld laender ergänzt, Rohwert country unverändert",
    DATA7.length === 1352 && same(DATA7.map(stripL), CAND));
  const wrong = DATA7.filter(o => !same(o.laender, MASTER[o.id]));
  check("L02", "laender je Angebot wörtlich aus dem Master (markt, anbieterLand, ortLand, ortSicherheit, chZugang)", wrong.length === 0, wrong.slice(0, 3).map(o => o.id).join(", "));
  check("L03", "sichtbare Menge unverändert = Referenz (E014, HOLD, sessions)", same(CARDS.map(c => c.id).sort(), VIS.map(o => o.id).sort()), `${CARDS.length} sichtbar`);
  const shape = CARDS.filter(c => { const b = c.badges.slice(-3); return !(b[0].startsWith("Ort: ") && b[1].startsWith("Anbieterland: ") && b[2].startsWith("CH-Zugang: ")) || b.some(x => /:\s*$/.test(x)); });
  check("L04", "jede Karte zeigt Ort, Anbieterland und CH-Zugang getrennt, keiner leer", shape.length === 0, shape.slice(0, 2).map(c => c.id).join(", "));
  const badPlace = CARDS.filter(c => c.badges.at(-3) !== `Ort: ${refPlace(byId[c.id])}`);
  check("L05", "Ort je Karte = Referenz (Land des Durchführungsorts + Region, «Online», sonst «nicht erfasst»)", badPlace.length === 0, badPlace.slice(0, 2).map(c => `${c.id}: «${c.badges.at(-3)}» statt «Ort: ${refPlace(byId[c.id])}»`).join("; "));
  const badProv = CARDS.filter(c => c.badges.at(-2) !== `Anbieterland: ${byId[c.id].laender.anbieterLand === "DE" ? "Deutschland" : "nicht erfasst"}`);
  const djaVis = CARDS.filter(c => /^OFFER-DJA-0\d\d$/.test(c.id));
  check("L06", "Anbieterland nur mit Beleg (E065): DJA «Deutschland», sonst «nicht erfasst»", badProv.length === 0 && djaVis.every(c => c.badges.at(-2) === "Anbieterland: Deutschland"), `${djaVis.length} DJA sichtbar`);
  const badCh = CARDS.filter(c => { const o = byId[c.id]; const exp = o.laender.chZugang === "JA" ? "CH-Zugang: ja (Ort in der Schweiz)" : "CH-Zugang: nicht erfasst";
    return c.badges.at(-1) !== exp || (c.badges.at(-1).includes("ja") && !codes(o.laender.ortLand).includes("CH")); });
  const djaCh = djaVis.filter(c => c.badges.at(-1) !== "CH-Zugang: nicht erfasst");
  check("L07", "CH-Zugang «ja» nur mit CH-Durchführungsort (E066), nie aus Anbieterland (E030; DJA nicht «ja»)", badCh.length === 0 && djaCh.length === 0,
    `${CARDS.filter(c => c.badges.at(-1).includes("ja")).length} mit «ja»`);
  const raw = CARDS.filter(c => c.badges.some(b => /Frankreich|CH_ACCESS|Chiasso|Anbieterbasis/.test(b)));
  const atel = CARDS.filter(c => /^CH-V33-A\d\d$/.test(c.id)), mitech = CARDS.filter(c => /^V79-0[12]$/.test(c.id));
  check("L08", "Rohwert country erscheint nicht mehr: 19 Ateliers ohne «Frankreich», MiTech ohne «CH_ACCESS»", raw.length === 0
    && atel.every(c => c.badges.at(-3).startsWith("Ort: Schweiz")) && mitech.every(c => c.badges.at(-3) === "Ort: Online"),
    `${atel.length} Ateliers, ${mitech.length} MiTech sichtbar`);
  const opts = [...W.document.querySelector("#countryFilter").options].map(o => o.textContent);
  const refVals = new Set(VIS.flatMap(refPlaceValues));
  check("L09", "Filter «Durchführungsort»: Optionen = Werte der sichtbaren Angebote, «Online» und «nicht erfasst» am Schluss",
    opts[0] === "Alle Orte" && same(new Set(opts.slice(1)), refVals) && opts.at(-1) === "nicht erfasst" && opts.at(-2) === "Online" && opts[1] === "Schweiz", opts.join(" | "));
  const counts = {};
  let okAll = true;
  for (const v of opts.slice(1)) {
    setSelect(W, "#countryFilter", v);
    const got = cards(W).map(c => c.id).sort(), exp = VIS.filter(o => refPlaceValues(o).includes(v)).map(o => o.id).sort();
    counts[v] = got.length; okAll = okAll && same(got, exp);
  }
  setSelect(W, "#countryFilter", "");
  check("L10", "Filter je Option = Referenz; kein Angebot geht verloren", okAll && VIS.every(o => refPlaceValues(o).length > 0), Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(", "));
  const wu = load(V36, DATA7_JS, SMART_JS, { url: "https://mediaskills.ch/?country=Online" });
  check("L11", "URL ?country=Online wendet den Filter an", cards(wu).length === counts.Online && wu.document.querySelector("#countryFilter").value === "Online");
  const s = smart(W, "Datenjournalismus CHF 800");
  check("L12", "Smart-Karte zeigt «Ort: …» statt Rohwert country", s.cards.length > 0 && s.cards.every(c => c.meta.some(m => m.startsWith("Ort: ")) && !c.meta.some(m => /^(Schweiz|Frankreich)\b/.test(m))));
}

// ---- F5 Preisspanne (E051, WDA-01; Testwerte laut Audit 28.10.)
{
  const dja = byId["OFFER-DJA-009"];
  const one = (offer, rec) => [dataJs([forceVisible(offer)]), smartJs({ meta: SMART.meta, byId: { [offer.id]: rec } })];
  const rec = (patch = {}) => { const r = JSON.parse(JSON.stringify(SMART.byId["OFFER-DJA-009"])); Object.assign(r.priceOptions[0], patch); return r; };
  const run = (budget, r = rec(), app = V36) => smart(load(app, ...one(dja, r)), `Datenjournalismus CHF ${budget}`).cards[0]?.budget || "";
  const DIRECT = /^Bei der Preisobergrenze bleiben CHF (\d+)\./, POSS = /könnte ins Budget passen/, OVER = /über dem angegebenen Budget/;
  const r = Object.fromEntries([479, 480, 511, 512, 513, 800].map(b => [b, run(b)]));
  check("P01", "OFFER-DJA-009 (EUR 480–512), CHF 800: direkter Treffer, Rest ab Obergrenze 288, Hinweis 1:1 (T02)", DIRECT.test(r[800]) && r[800].match(DIRECT)[1] === "288" && r[800].includes("vereinfacht 1:1"), r[800].slice(0, 60));
  check("P02", "CHF 511 «möglich», 512 und 513 direkter Treffer (T03)", POSS.test(r[511]) && DIRECT.test(r[512]) && r[512].match(DIRECT)[1] === "0" && DIRECT.test(r[513]) && r[513].match(DIRECT)[1] === "1");
  check("P03", "CHF 480 «möglich» (Untergrenze = Budget), CHF 479 «über Budget»", POSS.test(r[480]) && OVER.test(r[479]));
  const g = run(800, undefined, V35);
  check("P04", "Gegenprobe v35: CHF 800 nur «möglich» (WDA-01)", POSS.test(g));
  const cases = [
    ["Mitgliedertarif (bedingt)", { eligibilityType: "MEMBERSHIP", eligibilityValue: "X" }, POSS],
    ["MWST ausgeschlossen ohne Satz", { taxMode: "EXCLUDED", taxRate: null }, POSS],
    ["MWST ausgeschlossen 8,1 % (Obergrenze 553,47)", { taxMode: "EXCLUDED", taxRate: 8.1 }, POSS],
    ["Pflichtgebühr unbekannt", { components: [{ requirementStatus: "REQUIRED", amountType: "NOT_PUBLISHED", amount: null }] }, POSS],
    ["Pflichtgebühr unklar", { components: [{ requirementStatus: "UNKNOWN", amountType: "EXACT", amount: 10 }] }, POSS],
    ["Abrechnung pro Monat ohne Anzahl", { billingBasis: "MONTH", billingCount: null }, POSS],
    ["nur Variante (VARIANT)", { priceScope: "VARIANT" }, POSS],
    ["Obergrenze fehlt", { maxAmount: null }, POSS],
    ["Pflichtgebühr EUR 300 → 780–812 (Untergrenze über Budget)", { components: [{ requirementStatus: "REQUIRED", amountType: "EXACT", amount: 300 }] }, OVER],
    ["optionale Gebühr zählt nicht", { components: [{ requirementStatus: "OPTIONAL", amountType: "EXACT", amount: 999 }] }, DIRECT],
    ["Tarif abgelaufen", { validThrough: "2026-01-01" }, /keine sichere Budgetaussage/]
  ];
  const bad = cases.filter(([, p, re]) => !re.test(run(550, rec(p))));
  check("P05", `Grenzfälle bei CHF 550: nur unbedingter, vollständig belegter Gesamtpreis wird direkt (${cases.length} Fälle)`, bad.length === 0, bad.map(b => b[0]).join("; "));
  check("P06", "Pflichtgebühr EUR 300 und Budget CHF 812 → direkter Treffer, Rest 0", /^Bei der Preisobergrenze bleiben CHF 0\./.test(run(812, rec({ components: [{ requirementStatus: "REQUIRED", amountType: "EXACT", amount: 300 }] }))));
  const gbp = run(800, rec({ currency: "GBP" }));
  check("P07", "GBP-Spanne: keine Budgetaussage (E009)", /keine sichere Budgetaussage/.test(gbp));
  // Wirkung auf den Bestand: sichtbare Angebote mit belegter Spanne
  const ranges = VIS.filter(o => { const s = SMART.byId[o.id]; return s && s.parserStatus === "AUTO_ACCEPT" && s.priceEligible === true
    && (s.priceOptions || []).some(p => p.amountType === "RANGE" && p.eligibilityType === "NONE" && p.priceScope === "FULL_OFFER" && p.billingBasis === "TOTAL"
      && p.taxMode !== "EXCLUDED" && p.minAmount != null && p.maxAmount != null && active(p) && ["CHF", "EUR", "USD"].includes(p.currency)
      && (p.components || []).every(c => c.includedInBase || c.requirementStatus === "OPTIONAL")); });
  const le800 = ranges.filter(o => SMART.byId[o.id].priceOptions.some(p => p.amountType === "RANGE" && p.maxAmount <= 800));
  check("P08", "Bestand: sichtbare Angebote mit belegter Spanne (Information)", ranges.length > 0, `${ranges.length} mit Spanne, davon ${le800.length} mit Obergrenze ≤ 800 (Audit 28.10.: 18)`);
}

// ---- F6 «Kostenlos»-Trennung (E052, E057, WDA-03)
{
  const freeCat = DATA7.filter(o => o.priceCategory === "KOSTENLOS");
  check("K01", "alle KOSTENLOS-Angebote eingeordnet: strukturiert ohne Bedingung oder mit erwarteter Bezeichnung", freeCat.every(o => refFreeLabel(o)),
    `${freeCat.length} gesamt, ${freeCat.filter(o => refDirectFree(o.id)).length} ohne Bedingung`);
  const wf = load(V36, dataJs(freeCat.map(forceVisible)));
  const bad = cards(wf).filter(c => c.facts.Preis !== refFreeLabel(byId[c.id]));
  check("K02", "Karte: «Kostenlos» / «Kostenlos mit Bedingung: …» / «Preis unbestätigt» je Angebot = Referenz (T06)", bad.length === 0 && cards(wf).length === freeCat.length,
    bad.slice(0, 2).map(c => `${c.id}: «${c.facts.Preis}»`).join("; "));
  const visFreeCards = CARDS.filter(c => byId[c.id].priceCategory === "KOSTENLOS");
  check("K03", "sichtbare Karten am Stichtag ebenso", visFreeCards.every(c => c.facts.Preis === refFreeLabel(byId[c.id])), `${visFreeCards.length} sichtbar`);
  const opts = [...W.document.querySelector("#priceFilter").options].map(o => o.textContent);
  const fcount = label => { const s = W.document.querySelector("#priceFilter"); const v = [...s.options].find(o => o.textContent === label)?.value; if (v == null) return 0; setSelect(W, "#priceFilter", v); const n = cards(W).map(c => c.id).sort(); setSelect(W, "#priceFilter", ""); return n; };
  const fk = fcount("Kostenlos"), fb = fcount("Kostenlos mit Bedingung"), fu = fcount("Preis unbestätigt");
  const refK = VIS.filter(o => refPriceFilter(o) === "Kostenlos").map(o => o.id).sort();
  const refB = VIS.filter(o => refPriceFilter(o) === "Kostenlos mit Bedingung").map(o => o.id).sort();
  const refU = VIS.filter(o => refPriceFilter(o) === "Preis unbestätigt").map(o => o.id).sort();
  check("K04", "Filter «Kostenlos» = nur ohne Bedingung; «Kostenlos mit Bedingung» und «Preis unbestätigt» getrennt (= Referenz)",
    same(fk, refK) && same(fb || [], refB) && same(fu || [], refU) && opts[1] === "Kostenlos",
    `Kostenlos ${refK.length}, mit Bedingung ${refB.length}, unbestätigt ${refU.length}`);
  const allOpts = [...W.document.querySelector("#priceFilter").options].slice(1).map(o => o.textContent);
  const sum = allOpts.reduce((n, l) => n + fcount(l).length, 0);
  check("K05", "Preisfilter: jedes sichtbare Angebot in genau einer Option (nichts geht verloren)", sum === VIS.length, `${sum} = ${VIS.length}`);
  const s = smart(W, "Nur kostenlos");
  const refSmart = VIS.filter(o => refDirectFree(o.id) || refCondFree(o.id)).length;
  check("K06", "Gleiche Bedeutung: Preisband «Kostenlos» = Filter «Kostenlos»; Smart «kostenlos» = ohne Bedingung + strukturiert mit Bedingung",
    s.bands.Kostenlos === refK.length && total(s.summary) === refSmart, `Band ${s.bands.Kostenlos}, Filter ${refK.length}, Smart ${total(s.summary)} = ${refK.length} + ${refSmart - refK.length}`);
  const s35 = smart(load(V35), "Nur kostenlos"), f35 = (() => { const w = load(V35); const v = [...w.document.querySelector("#priceFilter").options].find(o => o.textContent === "Kostenlos").value; setSelect(w, "#priceFilter", v); return cards(w).length; })();
  check("K07", "Gegenprobe v35: Filter «Kostenlos» zählte auch bedingte und unbestätigte Angebote (WDA-03)", f35 > refK.length || freeCat.filter(visible).length === refK.length, `v35 Filter ${f35}, Band ${s35.bands.Kostenlos}`);
  // Smart-Bezeichnungen für strukturierte Gratis-Tarife (synthetisch, ein Angebot)
  const base = byId["OFFER-DJA-009"];
  const lab = (opt, q = "Datenjournalismus kostenlos") => {
    const r = JSON.parse(JSON.stringify(SMART.byId[base.id]));
    r.priceOptions = [Object.assign({ amountType: "FREE", amount: 0, currency: null, eligibilityType: "NONE", eligibilityValue: null, billingBasis: "TOTAL", priceScope: "FULL_OFFER", taxMode: "UNSPECIFIED", components: [], tariffLabel: "Mitgliederpreis" }, opt)];
    const w = load(V36, dataJs([forceVisible(base)]), smartJs({ meta: SMART.meta, byId: { [base.id]: r } }));
    const c = smart(w, q).cards[0]; return c ? c.meta[0] : "";
  };
  const L = {
    none: lab({}), member: lab({ eligibilityType: "MEMBERSHIP", eligibilityValue: "X" }), sub: lab({ eligibilityType: "SUBSCRIPTION", eligibilityValue: "X" }),
    journ: lab({ eligibilityType: "PROFESSION", eligibilityValue: "JOURNALIST" }), budget: lab({ eligibilityType: "MEMBERSHIP", eligibilityValue: "X" }, "Datenjournalismus CHF 10")
  };
  check("K08", "Smart: «Kostenlos» · «Kostenlos mit Bedingung: für Mitglieder / für Abonnent:innen / für Journalist:innen» (E057), auch bei Budgetsuche",
    L.none === "Kostenlos" && L.member === "Kostenlos mit Bedingung: für Mitglieder" && L.sub === "Kostenlos mit Bedingung: für Abonnent:innen"
    && L.journ === "Kostenlos mit Bedingung: für Journalist:innen" && L.budget === "Kostenlos mit Bedingung: für Mitglieder", JSON.stringify(L));
  check("K09", "Alte Bezeichnungen entfernt; «unbedingt gratis» nirgends (E052)",
    !/Kostenlos unter Bedingung|Kostenlos-Option · Berechtigung|`Kostenlos · \$\{/.test(APP36) && !/unbedingt gratis/i.test(APP36 + INDEX7 + METH7));
  const t20 = smart(W, "Datenvisualisierung kostenlos");
  check("K10", "T20 «Datenvisualisierung kostenlos»: nur Bezeichnungen nach E057", t20.cards.every(c => /^(Kostenlos|Kostenlos mit Bedingung: .+|Preis unbestätigt)$/.test(c.meta[0])), `${t20.cards.length} Treffer`);
}

// ---- Regression gegenüber app-v35 (nur vorgesehene Änderungen)
{
  const W35 = load(V35), C35 = cards(W35);
  check("R01", "sichtbare Menge und Standardreihenfolge identisch mit v35", same(C35.map(c => c.id), CARDS.map(c => c.id)));
  const diff = CARDS.filter((c, i) => { const o = C35[i]; const f = { ...c.facts }, g = { ...o.facts };
    if (byId[c.id].priceCategory === "KOSTENLOS") { delete f.Preis; delete g.Preis; }
    return !same(f, g) || !same(c.rest, o.rest) || !same(c.badges.slice(0, -3), o.badges.slice(0, -1)); });
  check("R02", "Karten identisch ausser Länder-Badges und Preis der KOSTENLOS-Angebote", diff.length === 0, diff.slice(0, 2).map(c => c.id).join(", "));
  const plain = ["Datenjournalismus", "Podcast produzieren, online", "KI im Journalismus, Zürich", "Videojournalismus, 3 Tage", "Bildbearbeitung für Fotojournalismus", "Social Media und Audience", "Mobile Reporting"];
  const strip2 = r => ({ summary: r.summary, cards: r.cards.map(c => ({ title: c.title, provider: c.provider, budget: c.budget, meta: c.meta.filter(m => !/^Ort: /.test(m)) })) });
  const d1 = plain.filter(q => !same(strip2(smart(W, q)), (x => ({ summary: x.summary, cards: x.cards.map(c => ({ title: c.title, provider: c.provider, budget: c.budget, meta: c.meta.slice(0, 3) })) }))(smart(W35, q))));
  check("R03", `Smart-Suche ohne Budget/kostenlos: identische Ergebnisse (${plain.length} Anfragen, T14–T18)`, d1.length === 0, d1.join("; "));
  const withBudget = ["Datenjournalismus, CHF 800, 2 Tage", "Mobile Reporting, unter CHF 300", "Moderation, 1000 Euro", "500 Euro Video", "Podcast USD 2000"];
  const hasRange = (title, provider) => DATA7.filter(o => o.title === title && o.provider === provider).some(o => (SMART.byId[o.id]?.priceOptions || []).some(p => p.amountType === "RANGE"));
  const key = c => `${c.title}|${c.provider}`;
  const bad = withBudget.filter(q => { const a = smart(W, q), b = smart(W35, q); if (a.summary !== b.summary) return true;
    const B = Object.fromEntries(b.cards.map(c => [key(c), c])), A = Object.fromEntries(a.cards.map(c => [key(c), c]));
    const changedCommon = a.cards.filter(c => B[key(c)] && B[key(c)].budget !== c.budget && !hasRange(c.title, c.provider));
    const moved = [...a.cards.filter(c => !B[key(c)]), ...b.cards.filter(c => !A[key(c)])].filter(c => !hasRange(c.title, c.provider));
    const rangeUp = a.cards.some(c => hasRange(c.title, c.provider) && c.budget.startsWith("Bei der Preisobergrenze"));
    return changedCommon.length > 0 || (moved.length > 0 && !rangeUp); });
  check("R04", `Smart-Suche mit Budget: gleiche Trefferzahl; Abweichungen nur bei Angeboten mit Preisspanne (${withBudget.length} Anfragen)`, bad.length === 0, bad.join("; "));
  const w12 = load(V36, DATA7_JS, SMART_JS, { url: "https://mediaskills.ch/?sort=EDITORIAL" });
  check("R05", "Paket 6 bleibt: Standard «Zuletzt geprüft», alter Link fällt zurück (T12)", w12.document.querySelector("#sortSelect").value === "APPROVED");
  const t09 = DATA7.find(o => o.id === "PCC-P08");
  check("R06", "Paket 5 bleibt: PCC-P08 (HOLD) nicht sichtbar (T09)", t09 && !CARDS.some(c => c.id === "PCC-P08"));
}

// ---- HTML und Reproduzierbarkeit
{
  const lines = (a, b) => { const x = a.split("\n"), y = b.split("\n"); return x.length === y.length ? x.filter((l, i) => l !== y[i]).length : -1; };
  check("H01", "index.html: genau 3 Zeilen geändert (Lead, Filterbezeichnung, Standardoption), Skript-Verweise unverändert",
    lines(INDEX6, INDEX7) === 3 && same(INDEX6.match(/<script src="[^"]+">/g), INDEX7.match(/<script src="[^"]+">/g)) && INDEX7.includes("<span>Durchführungsort</span>") && !INDEX7.includes("Anbieterbasis"));
  check("H02", "methodik.html: genau 3 Zeilen geändert (Kostenlos, Überschrift, Abschnitt Ort), keine «Anbieterbasis» mehr",
    lines(METH6, METH7) === 3 && !METH7.includes("Anbieterbasis") && METH7.includes("Kostenlos mit Bedingung: …") && METH7.includes("Preis unbestätigt"));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "p7-"));
  execFileSync("python3", ["-I", path.join(CW, "paket7/scripts/port_app_v36.py"), path.join(W6, "app-v35.js"), path.join(tmp, "app-v36.js")]);
  execFileSync("python3", ["-I", path.join(CW, "paket7/scripts/port_html_p7.py"), W6, tmp]);
  const ok = ["app-v36.js", "index.html", "methodik.html"].every(f => sha(read(path.join(tmp, f))) === sha(read(path.join(W7, f))));
  check("H03", "Port-Skripte reproduzieren app-v36.js, index.html, methodik.html byte-identisch", ok);
  const before = sha(DATA7_JS);
  execFileSync("python3", ["-I", path.join(CW, "paket7/scripts/build_daten_p7.py")]);
  check("H04", "build_daten_p7.py reproduziert data-p7.js byte-identisch", sha(read(path.join(W7, "data-p7.js"))) === before);
  const h1 = load(V36).document.querySelector("#cards").innerHTML, h2 = load(V36).document.querySelector("#cards").innerHTML;
  check("H05", "Zwei Läufe liefern identisches Karten-HTML", h1 === h2);
}

const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} PASS (Stichtag ${T})`);
process.exit(failed ? 1 : 0);
