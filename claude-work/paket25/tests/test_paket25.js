// Paket 25 – Anzeige-Vergleich Live-Daten (p19) gegen Generator-Daten (p25) mit derselben App app-v43.js
// (SPEZIFIKATION_PAKET25_20261120.md §5 G09, G10, G11, G19 Browser-Teil; Entscheid 9, E200).
// G09 Karten in allen drei Sortierungen, G10 Filter (Optionen und Zähler), G11 Smart-Suche mit 60 Anfragen
// (T01–T20 und die 40 Anfragen aus paket15/tests/virtuelle_tests.js, Liste nur gelesen); jsdom an 20.11., 21.11., 01.12.2026,
// G11 zusätzlich im kopflosen Chrome auf dem Prüfstand A12 (Stichtag 21.11.2026), geladene Dateien per SHA-256 bestätigt (G19).
// Treffer-ID über Anbieter + Titel (bei allen 1'353 eindeutig). Reihenfolge der Smart-Treffer: gleich, ausser Tausch innerhalb
// einer zusammenhängenden Gruppe mit gleichem Titel (Entscheid 3); jeder Tausch wird gemeldet, jede andere Abweichung = FAIL.
// Nachtrag 21.11. (Gegenprüfung ChatGPT §11, B06/B07; Owner-Entscheid 10, E201): G11 zusätzlich mit Punktzahl je Kandidat
// (Testkopie der App mit einer Haken-Zeile, nur im Test; ausgeliefert bleibt app-v43.js ada38d5e…), Gleichstand belegt;
// G20 gezielte Anfragen zu den 7 geänderten Rohwerten (Smart- und Katalogsuche) gegen eine feste Sollliste; Umgebung fest (B07).
// Aufruf (aus claude-work/): TZ=Europe/Zurich NODE_PATH=<tools>/node_modules CHROME=/usr/bin/google-chrome node paket25/tests/test_paket25.js
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), http = require("http"), crypto = require("crypto");
const { execFileSync } = require("child_process");
const { JSDOM, VirtualConsole } = require("jsdom");
const CW = path.resolve(__dirname, "../.."), OUT = path.join(CW, "paket25/out");
const read = p => fs.readFileSync(p, "utf8"), sha = b => crypto.createHash("sha256").update(b).digest("hex");
const APP_SHA = "ada38d5ed342572b2b3e0daa476d9e6b4186426841047fb9a1655a6663789020";
const STAENDE = {
  p19: { web: path.join(CW, "paket19/website"), data: "data-p19.js", smart: path.join(CW, "paket19/out/smart-search-data-p19.json") },
  p25: { web: path.join(CW, "paket25/website"), data: "data-p25.js", smart: path.join(CW, "paket25/out/smart-search-data-p25.json") },
};
for (const s of Object.values(STAENDE)) {
  s.dataJs = read(path.join(s.web, s.data)); s.smartJs = `window.MEDIA_SKILLS_SMART_DATA = ${read(s.smart)};\n`;
  s.offers = JSON.parse(s.dataJs.slice(s.dataJs.indexOf("["), s.dataJs.lastIndexOf("]") + 1));
  s.key = {}; for (const o of s.offers) { const k = `${o.title}|${o.provider}`; s.key[k] = s.key[k] ? s.key[k] + "|DUBLETTE" : o.id; }
}
const APP = read(path.join(STAENDE.p25.web, "app-v43.js")), INDEX = read(path.join(STAENDE.p25.web, "index.html"));
if (sha(APP) !== APP_SHA || read(path.join(STAENDE.p19.web, "app-v43.js")) !== APP) throw new Error("app-v43.js nicht ada38d5e…");
if (process.env.TZ !== "Europe/Zurich") throw new Error("TZ=Europe/Zurich fehlt (B07: gleiche Umgebung für beide Stände)");
// B06: Testkopie mit Haken vor der Sortierung der Smart-Kandidaten (sortiert wird dasselbe Array an Ort und Stelle)
const HAKEN = "    evaluated.sort((a, b) => {";
if (APP.split(HAKEN).length !== 2) throw new Error("Haken-Stelle nicht eindeutig");
const APP_I = APP.replace(HAKEN, "    window.__P25_EVAL = evaluated;\n" + HAKEN);

// ---------- 60 Anfragen ----------
const pcc = STAENDE.p19.offers.find(o => o.id === "PCC-P08");
const T = [["T01", "Datenjournalismus, CHF 800, 2 Tage"], ["T02", "Datenjournalismus, CHF 800"], ["T03", "Datenjournalismus, CHF 511"],
  ["T04", "500 Euro"], ["T05", "Datenjournalismus, 300 Pfund"], ["T06", "kostenlos"], ["T07", "Kurs für Journalistinnen, CHF 500"],
  ["T08", "Journalismus"], ["T09", pcc.title], ["T10", "Journalismus Kurs Deutschland"], ["T11", "Fotografie, CHF 1000"], ["T12", "Recherche"],
  ["T13", "Mobile Reporting, unter CHF 300"], ["T14", "Podcast produzieren, online"], ["T15", "KI im Journalismus, Zürich"],
  ["T16", "Videojournalismus, 3 Tage"], ["T17", "Bildbearbeitung für Fotojournalismus"], ["T18", "Social Media und Audience"],
  ["T19", "Moderation, 1000 Euro"], ["T20", "Datenvisualisierung kostenlos"]];
const vt = read(path.join(CW, "paket15/tests/virtuelle_tests.js"));
const V = eval(vt.slice(vt.indexOf("const Q = [") + "const Q = ".length, vt.indexOf("];", vt.indexOf("const Q = [")) + 1)); // nur gelesen
if (V.length !== 40) throw new Error("virtuelle_tests.js: nicht 40 Anfragen");
const Q = [...T, ...V.map(([g, q], i) => [`V${String(i + 1).padStart(2, "0")} ${g}`, q])];

// ---------- Erfassung im Seitenkontext (jsdom und Chrome gleich) ----------
const CAPTURE = `(q) => {
  const d = document, txt = n => (n ? n.textContent.replace(/\\s+/g, " ").trim() : "");
  d.querySelector("#smartInput").value = q;
  d.querySelector("#smartSearchForm").dispatchEvent(new Event("submit", { cancelable: true }));
  const links = c => [...c.querySelectorAll("a")].map(a => [a.getAttribute("href"), a.getAttribute("target"), a.getAttribute("rel"), a.getAttribute("aria-label"), txt(a)]);
  const out = d.querySelector("#smartOutput"), rest = out.cloneNode(true);
  rest.querySelectorAll(".smart-result-card").forEach(c => c.remove());
  return { chips: [...d.querySelectorAll("#smartUnderstood .smart-chip")].map(txt), verstanden: txt(d.querySelector("#smartUnderstood")),
    status: txt(d.querySelector("#smartStatus")), summary: txt(d.querySelector("#smartSummary")), note: txt(d.querySelector("#smartPriceNote")),
    validation: txt(d.querySelector("#smartValidation")), bands: txt(d.querySelector("#smartPriceBands")), bundle: txt(d.querySelector("#smartBundle")),
    rest: txt(rest), restHtml: rest.innerHTML,
    cards: [...d.querySelectorAll("#smartResults .smart-result-card")].map(c => ({ titel: txt(c.querySelector("h3")),
      anbieter: txt(c.querySelector(".smart-result-provider")), text: txt(c), html: c.outerHTML, links: links(c) })) };
}`;
const CAPTURE_EVAL = `(q) => { window.__P25_EVAL = null; const r = (${CAPTURE})(q);
  r.eval = window.__P25_EVAL ? window.__P25_EVAL.map(i => ({ id: i.offer.id, titel: i.offer.title, score: i.score,
    budget: i.budget ? i.budget.status : null, free: i.free ? i.free.status : null, teil: i.partialHits || null })) : null; return r; }`;
const DATEFIX = s => `(() => { const R = Date; const F = new R("${s}T12:00:00").getTime();
  class D extends R { constructor(...a) { a.length ? super(...a) : super(F); } static now() { return F; } }
  window.Date = D; })();`;

function load(st, stichtag, fehler, app = APP) {
  const vc = new VirtualConsole(); vc.on("jsdomError", e => fehler.push(String(e && e.message || e))); vc.on("error", e => fehler.push("console.error " + e));
  const dom = new JSDOM(INDEX.replace(/<script src="[^"]+"><\/script>/g, ""), { url: "https://mediaskills.ch/", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window; w.addEventListener("error", e => fehler.push(e.message));
  w.eval(DATEFIX(stichtag)); w.eval(st.dataJs); w.eval(st.smartJs); w.eval(app);
  return w;
}
const txt = n => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
const karten = w => [...w.document.querySelectorAll("#cards article.card")].map(c => ({ id: c.dataset.offerId, text: txt(c),
  links: [...c.querySelectorAll("a")].map(a => [a.getAttribute("href"), a.getAttribute("target"), a.getAttribute("rel"), a.getAttribute("aria-label"), txt(a)]), html: c.outerHTML }));
const setze = (w, sel, v) => { const e = w.document.querySelector(sel); e.value = v; e.dispatchEvent(new w.Event("change", { bubbles: true })); e.dispatchEvent(new w.Event("input", { bubbles: true })); };
const FILTER = ["focusFilter", "typeFilter", "priceFilter", "formatFilter", "languageFilter", "countryFilter", "levelFilter"];

const results = [];
const check = (id, name, ok, detail = "") => { const s = ok ? "PASS" : "FAIL"; results.push({ id, name, status: s, detail }); console.log(`${s} ${id} ${name}${detail ? " – " + detail : ""}`); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Vergleich zweier Smart-Antworten (G11)
function vergleiche(qid, a, b, stA, stB, tausch, fehl) {
  for (const k of ["chips", "verstanden", "status", "summary", "note", "validation", "bands", "bundle", "rest", "restHtml"])
    if (!same(a[k], b[k])) fehl.push(`${qid}: ${k} «${String(a[k]).slice(0, 80)}» ≠ «${String(b[k]).slice(0, 80)}»`);
  const id = (st, c) => st.key[`${c.titel}|${c.anbieter}`];
  const ia = a.cards.map(c => id(stA, c)), ib = b.cards.map(c => id(stB, c));
  if (ia.some(x => !x || x.includes("DUBLETTE")) || ib.some(x => !x || x.includes("DUBLETTE"))) fehl.push(`${qid}: Treffer ohne eindeutige ID`);
  if (!same([...ia].sort(), [...ib].sort())) { fehl.push(`${qid}: Treffermengen ${ia} ≠ ${ib}`); return; }
  const byA = Object.fromEntries(a.cards.map((c, i) => [ia[i], c])), byB = Object.fromEntries(b.cards.map((c, i) => [ib[i], c]));
  for (const x of ia) for (const k of ["text", "html", "links"]) if (!same(byA[x][k], byB[x][k])) fehl.push(`${qid}: ${x} ${k} verschieden`);
  if (same(ia, ib)) return;
  // nur Tausch innerhalb zusammenhängender Gruppen gleichen Titels
  const gruppen = (cards, ids) => { const g = []; cards.forEach((c, i) => { if (g.length && g[g.length - 1].titel === c.titel) g[g.length - 1].ids.push(ids[i]); else g.push({ titel: c.titel, ids: [ids[i]] }); }); return g; };
  const ga = gruppen(a.cards, ia), gb = gruppen(b.cards, ib);
  if (ga.length !== gb.length || ga.some((g, i) => g.titel !== gb[i].titel || !same([...g.ids].sort(), [...gb[i].ids].sort()))) fehl.push(`${qid}: Reihenfolge ${ia} ≠ ${ib} (nicht nur Tausch bei gleichem Titel)`);
  else tausch.push({ anfrage: qid, live: ia, generator: ib, titel: ga.filter((g, i) => !same(g.ids, gb[i].ids)).map(g => g.titel) });
}

// B06: Punktzahl, Budget- und Gratis-Status je Kandidat gleich; jede Umstellung der ganzen sortierten Kandidatenliste nur
// innerhalb eines tatsächlichen Gleichstands (gleicher Status, gleiche Punktzahl, gleicher Titel)
function vergleicheEval(qid, a, b, fehl, gleichstand) {
  if (!a || !b) { if (a !== b) fehl.push(`${qid}: Kandidatenliste nur in einem Stand`); return; }
  const k = x => JSON.stringify([x.budget, x.free, x.score, x.titel]);
  const A = Object.fromEntries(a.map(x => [x.id, JSON.stringify([x.score, x.budget, x.free, x.teil])]));
  const B = Object.fromEntries(b.map(x => [x.id, JSON.stringify([x.score, x.budget, x.free, x.teil])]));
  if (a.length !== b.length || !same(Object.keys(A).sort(), Object.keys(B).sort())) { fehl.push(`${qid}: Kandidaten ${a.length} ≠ ${b.length}`); return; }
  const pz = Object.keys(A).filter(i => A[i] !== B[i]);
  if (pz.length) { fehl.push(`${qid}: Punktzahl/Status verschieden bei ${pz.slice(0, 3)}`); return; }
  const gr = l => { const g = []; l.forEach(x => { if (g.length && g[g.length - 1].k === k(x)) g[g.length - 1].ids.push(x.id); else g.push({ k: k(x), ids: [x.id] }); }); return g; };
  const ga = gr(a), gb = gr(b);
  if (ga.length !== gb.length || ga.some((g, i) => g.k !== gb[i].k || !same([...g.ids].sort(), [...gb[i].ids].sort()))) fehl.push(`${qid}: Reihenfolge der Kandidaten nicht nur innerhalb von Gleichständen`);
  else gleichstand.n += ga.filter((g, i) => !same(g.ids, gb[i].ids)).length;
}

(async () => {
  const protokoll = { umgebung: { TZ: process.env.TZ, node: process.version, jsdom: require("jsdom/package.json").version, app: APP_SHA,
    stichtage_jsdom: ["2026-11-20", "2026-11-21", "2026-12-01"], stichtag_browser: "2026-11-21 12:00 (Date fest)", browser: "Chrome kopflos, locale de-CH, timezoneId Europe/Zurich, je Stand eigener Kontext gleicher Einstellung" }, stichtage: {}, browser: {} };
  // ---------- jsdom: G09, G10, G11 an drei Stichtagen ----------
  for (const S of ["2026-11-20", "2026-11-21", "2026-12-01"]) {
    const fehler = { p19: [], p25: [] }, W = { p19: load(STAENDE.p19, S, fehler.p19), p25: load(STAENDE.p25, S, fehler.p25) };
    const P = protokoll.stichtage[S] = {};
    // G09
    const sorts = [...W.p25.document.querySelectorAll("#sortSelect option")].map(o => o.value);
    const g09 = []; let sichtbar = null, htmlAbw = 0;
    for (const so of sorts) {
      const k = {}; for (const n of ["p19", "p25"]) { setze(W[n], "#sortSelect", so); k[n] = karten(W[n]); }
      if (so === sorts[0]) sichtbar = k.p25.length;
      const A = k.p19.map(c => [c.id, c.text, c.links]), B = k.p25.map(c => [c.id, c.text, c.links]);
      if (!same(A, B)) g09.push(`${so}: ${A.length}/${B.length} Karten, erste Abweichung bei ${A.findIndex((x, i) => !same(x, B[i]))}`);
      htmlAbw += k.p19.filter((c, i) => !k.p25[i] || c.html !== k.p25[i].html).length;
    }
    setze(W.p19, "#sortSelect", sorts[0]); setze(W.p25, "#sortSelect", sorts[0]);
    P.G09 = { sortierungen: sorts, sichtbar, abweichungen: g09, html_abweichungen: htmlAbw };
    check(`G09 ${S}`, `Karten: alle sichtbaren Karten mit Text und Link gleich, gleiche Reihenfolge in allen drei Sortierungen (${sorts.join(", ")})${S === "2026-11-20" ? "; 1'006 sichtbar" : ""}`,
      sorts.length === 3 && !g09.length && (S !== "2026-11-20" || sichtbar === 1006), `${sichtbar} sichtbar; ${g09.join("; ")}; outerHTML abweichend ${htmlAbw}`);
    // G10
    const g10 = []; let nOpt = 0; const zaehler = {};
    for (const f of FILTER) {
      const opt = n => [...W[n].document.querySelectorAll(`#${f} option`)].map(o => [o.value, txt(o)]);
      if (!same(opt("p19"), opt("p25"))) g10.push(`${f}: Optionen verschieden`);
      for (const [v] of opt("p25")) {
        nOpt++;
        const z = {}; for (const n of ["p19", "p25"]) { setze(W[n], `#${f}`, v); z[n] = [txt(W[n].document.querySelector("#resultCount")), karten(W[n]).map(c => c.id).join(",")]; }
        zaehler[`${f}=${v}`] = z.p25[0];
        if (!same(z.p19, z.p25)) g10.push(`${f}=${v}: «${z.p19[0]}» ≠ «${z.p25[0]}»`);
      }
      setze(W.p19, `#${f}`, ""); setze(W.p25, `#${f}`, "");
    }
    // «Kostenlos»-Schaltfläche der Smart-Suche (smartFreeButton) gehört zu G11; Filter «Kostenlos» ist eine Option von priceFilter
    P.G10 = { optionen: nOpt, zaehler, abweichungen: g10 };
    check(`G10 ${S}`, `Filter: Optionen und Zähler aller ${FILTER.length} Filter gleich (u. a. Kursform, Niveau, Sprache, Preisklasse inkl. Kostenlos, Durchführungsort), ${nOpt} Optionen einzeln gewählt`,
      !g10.length && nOpt > 20, g10.slice(0, 5).join("; "));
    // G11 jsdom
    const tausch = [], fehl = [], antworten = {};
    for (const [qid, q] of Q) {
      const r = {}; for (const n of ["p19", "p25"]) r[n] = JSON.parse(W[n].eval(`JSON.stringify((${CAPTURE})(${JSON.stringify(q)}))`));
      antworten[qid] = { q, p19: r.p19, p25: r.p25 };
      vergleiche(qid, r.p19, r.p25, STAENDE.p19, STAENDE.p25, tausch, fehl);
    }
    const js = [...fehler.p19, ...fehler.p25];
    P.G11 = { anfragen: Q.length, treffer: Object.values(antworten).reduce((s, a) => s + a.p25.cards.length, 0), tausch, abweichungen: fehl, js_fehler: js };
    check(`G11 jsdom ${S}`, `Smart-Suche: ${Q.length} Anfragen (T01–T20, 40 virtuelle), Treffermengen, Kartentexte, Budget, Begründung, Links, Chips, Status, Verstanden gleich; Reihenfolge gleich bis auf Tausch bei gleichem Titel; keine JS-Fehler`,
      Q.length === 60 && !fehl.length && !js.length, `${fehl.slice(0, 3).join("; ")} ${js.slice(0, 2).join("; ")}`);
    console.log(`INFO G11 ${S}: ${P.G11.treffer} Treffer gezeigt, ${tausch.length} Tausch(e) ${tausch.map(t => `${t.anfrage} «${t.titel.join(", ")}»`).join("; ")}`);
    if (S === "2026-11-21") fs.writeFileSync(path.join(OUT, "g11_antworten_2026-11-21.json"), JSON.stringify(Object.fromEntries(Object.entries(antworten).map(([k, v]) => [k, { q: v.q, p25: v.p25 }])), null, 1));
    // G11 Punktzahl (B06): Testkopie mit Haken; ihre Ausgaben müssen den Ausgaben der Original-App gleichen
    const fI = { p19: [], p25: [] }, WI = { p19: load(STAENDE.p19, S, fI.p19, APP_I), p25: load(STAENDE.p25, S, fI.p25, APP_I) };
    const fehlP = [], gleich = { n: 0 }; let kand = 0, hakenAbw = 0;
    for (const [qid, q] of Q) {
      const r = {}; for (const n of ["p19", "p25"]) r[n] = JSON.parse(WI[n].eval(`JSON.stringify((${CAPTURE_EVAL})(${JSON.stringify(q)}))`));
      for (const n of ["p19", "p25"]) { const { eval: e, ...ohne } = r[n]; if (!same(ohne, antworten[qid][n])) hakenAbw++; }  // H3: beide Stände
      kand += (r.p25.eval || []).length;
      vergleicheEval(qid, r.p19.eval, r.p25.eval, fehlP, gleich);
    }
    P.G11_punktzahl = { kandidaten: kand, umgestellte_gleichstaende: gleich.n, abweichungen: fehlP, haken_abweichungen: hakenAbw, js_fehler: [...fI.p19, ...fI.p25] };
    check(`G11 Punktzahl ${S}`, `Smart-Suche, ganze Kandidatenliste je Anfrage (nicht nur die 3 gezeigten): Punktzahl, Budget- und Gratis-Status je Angebot gleich; Umstellungen nur innerhalb tatsächlicher Gleichstände (Status, Punktzahl, Titel); Testkopie mit Haken liefert dieselben Ausgaben wie die Original-App`,
      !fehlP.length && !hakenAbw && !P.G11_punktzahl.js_fehler.length, `${fehlP.slice(0, 3).join("; ")}; Haken-Abweichungen ${hakenAbw}`);
    console.log(`INFO G11 Punktzahl ${S}: ${kand} Kandidaten in 60 Anfragen, ${gleich.n} Gleichstandsgruppe(n) in anderer Reihenfolge (nur Dateireihenfolge, Entscheid 3)`);
    // G20 (B06, Entscheid 10): gezielte Anfragen zu den 7 geänderten Rohwerten, nur am festen Stichtag 21.11.
    if (S === "2026-11-21") {
      const SIEBEN = ["CH-CLEAN2-V9-D01", "CH-V18-F03", "CH-V19-N01", "PJ-V16-09", "AT-PROD-OFFER-151", "V59-SZ05", "AT-PROD-OFFER-173"];
      const titel = SIEBEN.map(i => STAENDE.p25.offers.find(o => o.id === i).title);
      // Gegenprüfung S1: auch gewöhnliche Wörter, die Teil eines Codes sind (Katalogsuche vergleicht Teilzeichenketten)
      const QW = ["publiziert", "nicht publiziert", "published", "not published", "verifiziert", "Katalogtermin", "aktuellen Katalogtermin", "nicht",
        "not", "Termin", "Workshop Termin", "aktuell", "aktuellen", "Katalog", "fuer", "für"];
      // Sollliste (Owner-Entscheid 10): nur Anfragen mit internen Codewörtern ändern sich; Smart nur19 / nur25, Katalog nur19 / nur25
      const SOLL = { "nicht publiziert": [["CH-V18-F03"], [], ["CH-V18-F03"], []], "nicht": [["CH-V18-F03"], [], ["CH-V18-F03"], []],
        "published": [[], ["AT-PROD-OFFER-151", "CH-V18-F03", "V59-SZ05"], [], ["AT-PROD-OFFER-151", "CH-V18-F03", "V59-SZ05"]],
        "not published": [[], ["AT-PROD-OFFER-151", "CH-V18-F03", "V59-SZ05"], [], ["AT-PROD-OFFER-151", "CH-V18-F03", "V59-SZ05"]],
        "verifiziert": [[], [], ["AT-PROD-OFFER-173"], []], "Katalogtermin": [[], [], ["AT-PROD-OFFER-173"], []], "aktuellen Katalogtermin": [[], [], ["AT-PROD-OFFER-173"], []],
        "not": [[], ["AT-PROD-OFFER-151", "CH-V18-F03", "V59-SZ05"], [], ["AT-PROD-OFFER-151", "CH-V18-F03", "V59-SZ05"]], "Termin": [[], [], ["AT-PROD-OFFER-173"], []], "Workshop Termin": [[], [], ["AT-PROD-OFFER-173"], []],
        "aktuell": [[], [], ["AT-PROD-OFFER-173"], []], "aktuellen": [[], [], ["AT-PROD-OFFER-173"], []], "Katalog": [[], [], ["AT-PROD-OFFER-173"], []], "fuer": [[], [], ["AT-PROD-OFFER-173"], []] };
      const g20 = [], ist = {};
      for (const q of [...titel, ...QW]) {
        const r = {};
        for (const n of ["p19", "p25"]) {
          r[n] = JSON.parse(WI[n].eval(`JSON.stringify((${CAPTURE_EVAL})(${JSON.stringify(q)}))`));
          const sI = WI[n].document.querySelector("#searchInput"); sI.value = q; sI.dispatchEvent(new WI[n].Event("input", { bubbles: true }));
          r[n].katalog = karten(WI[n]).map(c => c.id); sI.value = ""; sI.dispatchEvent(new WI[n].Event("input", { bubbles: true }));
        }
        const ids = (x) => (x.eval || []).map(e => e.id), nur = (a, b) => a.filter(x => !b.includes(x)).sort();
        const d = [nur(ids(r.p19), ids(r.p25)), nur(ids(r.p25), ids(r.p19)), nur(r.p19.katalog, r.p25.katalog), nur(r.p25.katalog, r.p19.katalog)];
        ist[q] = d;
        const gem = (r.p19.eval || []).filter(e => ids(r.p25).includes(e.id));
        const pz = gem.filter(e => { const f = r.p25.eval.find(x => x.id === e.id); return f.score !== e.score || f.budget !== e.budget || f.free !== e.free; });
        if (!same(d, SOLL[q] || [[], [], [], []]) || pz.length) g20.push(`${q}: ${JSON.stringify(d)}${pz.length ? " Punktzahl " + pz.map(e => e.id) : ""}`);
        const ziel = SIEBEN[titel.indexOf(q)];  // H2: das jeweilige Zielangebot
        if (ziel && !(ids(r.p19).includes(ziel) && ids(r.p25).includes(ziel) && r.p19.katalog.includes(ziel) && r.p25.katalog.includes(ziel))) g20.push(`${q}: Zielangebot ${ziel} nicht in beiden Ständen gefunden`);
        if (d.flat().some(i => !SIEBEN.includes(i))) g20.push(`${q}: Abweichung ausserhalb der 7 Angebote`);
      }
      P.G20 = { anfragen: titel.length + QW.length, ist, abweichungen: g20 };
      check("G20 2026-11-21", `Gezielte Anfragen zu den 7 geänderten Rohwerten (B06, S1): 7 Titel und ${QW.length} Anfragen mit Codewörtern und Wortteilen der Codes, Smart- und Katalogsuche; Abweichungen genau = Sollliste, nur bei den 7 Angeboten; Punktzahl gemeinsamer Kandidaten gleich; jede Titelanfrage findet ihr Zielangebot in beiden Ständen (Smart und Katalog)`,
        !g20.length, g20.slice(0, 4).join("; "));
    }
  }

  // ---------- Browser: G11 und G19 auf dem Prüfstand A12 ----------
  const { chromium } = require("playwright-core");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "p25-stand-")), ps = { p25: path.join(tmp, "p25"), p19: path.join(tmp, "p19") };
  execFileSync("python3", ["-I", path.join(CW, "paket25/scripts/pruefstand_p25.py"), ps.p25], { cwd: CW });
  execFileSync("python3", ["-I", path.join(CW, "paket25/scripts/pruefstand_p25.py"), ps.p19, "--website", "paket19/website", "--daten", "data-p19.js",
    "--smart", "paket19/out/smart-search-data-p19.json", "--kennung", "p19"], { cwd: CW });
  // G19: Smart-Hülle aus einem zweiten Lauf bytegleich, Verweise je genau einmal
  const ps2 = path.join(tmp, "p25b"); execFileSync("python3", ["-I", path.join(CW, "paket25/scripts/pruefstand_p25.py"), ps2], { cwd: CW });
  const idx = read(path.join(ps.p25, "index.html")), cnt = s => idx.split(s).length - 1;
  const SOLL = { "data-p25.js": sha(fs.readFileSync(path.join(CW, "paket25/website/data-p25.js"))),
    "smart-search-data-p25.js": sha(STAENDE.p25.smartJs), "app-v43.js": APP_SHA };
  check("G19 Prüfstand", "Verweise in index.html je genau einmal ersetzt (data-p25.js, smart-search-data-p25.js, app-v43.js; keine alten Verweise); Smart-Hülle aus zwei Läufen bytegleich; = Generator-Ausgaben (SHA-256)",
    cnt('src="data-p25.js"') === 1 && cnt('src="smart-search-data-p25.js"') === 1 && cnt('src="app-v43.js"') === 1 && !/data-a1-|smart-search-data-a1-|app-v33/.test(idx)
    && fs.readFileSync(path.join(ps.p25, "smart-search-data-p25.js")).equals(fs.readFileSync(path.join(ps2, "smart-search-data-p25.js")))
    && Object.entries(SOLL).every(([f, h]) => sha(fs.readFileSync(path.join(ps.p25, f))) === h));
  const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".xml": "application/xml", ".txt": "text/plain" };
  const serve = dir => new Promise(res => { const srv = http.createServer((q, r) => {
    const p = path.join(dir, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/^\/$/, "/index.html"));
    if (!p.startsWith(dir) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end("404"); }
    r.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r); }).listen(0, "127.0.0.1", () => res(srv)); });
  const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", headless: true });
  const S = "2026-11-21", br = {};
  for (const n of ["p19", "p25"]) {
    const srv = await serve(ps[n]), base = `http://127.0.0.1:${srv.address().port}/`;
    const ctx = await browser.newContext({ locale: "de-CH", timezoneId: "Europe/Zurich" }); await ctx.addInitScript(DATEFIX(S));
    const page = await ctx.newPage(), geladen = {}, fehler = [], fremd = [];
    // Chrome fragt von sich aus /favicon.ico ab; die Website hat keines (live gleich) – diese eine 404 ist kein Fehler der Seite
    page.on("pageerror", e => fehler.push(e.message)); page.on("console", m => { if (m.type() === "error" && !/^Failed to load resource: .*404/.test(m.text())) fehler.push("console " + m.text()); });
    page.on("request", r => { if (!r.url().startsWith(base)) fremd.push(r.url()); });
    page.on("response", async r => { const f = new URL(r.url()).pathname.slice(1) || "index.html"; if (r.status() === 404 && f !== "favicon.ico") fehler.push("404 " + f); try { geladen[f] = sha(await r.body()); } catch (e) { geladen[f] = "FEHLER"; } });
    await page.goto(base, { waitUntil: "load" }); await page.waitForSelector("#cards article.card");
    const ant = {}; for (const [qid, q] of Q) ant[qid] = JSON.parse(await page.evaluate(`JSON.stringify((${CAPTURE})(${JSON.stringify(q)}))`));
    br[n] = { ant, geladen: Object.fromEntries(Object.entries(geladen).sort()), fehler, fremd, karten: await page.$$eval("#cards article.card", a => a.length) };
    await ctx.close(); srv.close();
  }
  await browser.close(); fs.rmSync(tmp, { recursive: true, force: true });
  const gl = br.p25.geladen;
  check("G19 geladen", "Browser hat auf dem Prüfstand genau die Generator-Ausgaben geladen: data-p25.js, smart-search-data-p25.js, app-v43.js (SHA-256); Vergleichsstand p19 = Live-Bytes (U3)",
    Object.entries(SOLL).every(([f, h]) => gl[f] === h) && br.p19.geladen["data-p19.js"] === "fc0fc6f9c245a4cb867ec4bfa19e05ccf6dd18f5bacf901203811b0bb3b14d61"
    && br.p19.geladen["smart-search-data-p19.js"] === "37cf74cfcf033e795f71fcfb96b0d2f7077950a8c921af809e5dc1714a717216" && br.p19.geladen["app-v43.js"] === APP_SHA,
    JSON.stringify({ p25: gl, p19: br.p19.geladen }).slice(0, 400));
  const tausch = [], fehl = [];
  for (const [qid] of Q) vergleiche(qid, br.p19.ant[qid], br.p25.ant[qid], STAENDE.p19, STAENDE.p25, tausch, fehl);
  const js = [...br.p19.fehler, ...br.p25.fehler];
  protokoll.browser = { stichtag: S, karten: { p19: br.p19.karten, p25: br.p25.karten }, geladen: { p19: br.p19.geladen, p25: gl }, tausch, abweichungen: fehl, js_fehler: js, fremde_anfragen: [...br.p19.fremd, ...br.p25.fremd] };
  check(`G11 Browser ${S}`, "Smart-Suche im kopflosen Chrome auf dem Prüfstand A12: 60 Anfragen gleich wie oben; keine JS-Fehler; nur Anfragen an die eigene Herkunft",
    !fehl.length && !js.length && !protokoll.browser.fremde_anfragen.length && br.p19.karten === br.p25.karten, `${fehl.slice(0, 3).join("; ")} ${js.slice(0, 2).join("; ")}`);
  console.log(`INFO G11 Browser: ${tausch.length} Tausch(e) ${tausch.map(t => `${t.anfrage} «${t.titel.join(", ")}»`).join("; ")}`);
  fs.writeFileSync(path.join(OUT, "test_paket25_js.json"), JSON.stringify({ results, protokoll }, null, 1));
  const n = s => results.filter(r => r.status === s).length;
  console.log(`\n${n("PASS")} PASS · ${n("FAIL")} FAIL`);
  process.exit(n("FAIL") ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
