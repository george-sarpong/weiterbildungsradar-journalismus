// Paket 28 P02, P03, P16 (SPEZIFIKATION_PAKET28_20261122.md §5): Anzeige-Vergleich Release (daten-<hash>.js,
// suche-<hash>.js, nur am Build-Stichtag Sichtbares, ohne ungenutzte Felder und Smart-Leerwerte) gegen P27 (data-p27.js,
// alle 1'353) mit derselben App app-v43.js, an Stichtag, +9 und +28 Tagen. Maschinell abgeleitet aus
// paket27/tests/test_paket27_anzeige.js (G09 Karten in drei Sortierungen, G10 Filter, G11 Smart-Suche mit 60 Anfragen und
// Punktzahl je Kandidat). Dazu P02 Merkliste (gleich für sichtbare IDs, localStorage nach dem Laden unverändert, zwei
// Releases nach E231) und P16 Ende zu Ende (index.html des Releases mit seinen eigenen Skriptverweisen laden).
// Die Bezeichner «p25»/«p27» im Code meinen die beiden Stände: p25 = P27 (Vergleichsstand), p27 = Release P28.
// Aufruf (aus claude-work/): TZ=Europe/Zurich NODE_PATH=<nm> REL=<release-ordner> S0=JJJJ-MM-TT node paket28/tests/test_paket28_anzeige.js
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), http = require("http"), crypto = require("crypto");
const { execFileSync } = require("child_process");
const { JSDOM, VirtualConsole } = require("jsdom");
const read = p => fs.readFileSync(p, "utf8"), sha = b => crypto.createHash("sha256").update(b).digest("hex");
const CW = path.resolve(__dirname, "../.."), OUT = path.join(CW, "paket28/out");
const REL = path.resolve(process.env.REL || ""), S0 = process.env.S0 || "";
if (!/^\d{4}-\d{2}-\d{2}$/.test(S0) || !fs.existsSync(path.join(REL, "website/index.html"))) throw new Error("REL und S0 setzen");
const plus = (s, n) => { const d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ALLE_TAGE = [S0, plus(S0, 9), plus(S0, 28)];
// Speicher: je Lauf ein Teil (NUR=0, 1, 2 = ein Stichtag; NUR=E = Merkliste und P16); ohne NUR alles in einem Prozess
const NUR = process.env.NUR, TAGE = NUR === undefined ? ALLE_TAGE : /^[012]$/.test(NUR) ? [ALLE_TAGE[+NUR]] : [];
if (NUR !== undefined && !/^[012E]$/.test(NUR)) throw new Error("NUR = 0, 1, 2 oder E");
const RWEB = path.join(REL, "website"), RIDX = read(path.join(RWEB, "index.html"));
const RSKR = [...RIDX.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
if (RSKR.length !== 3 || !/^daten-[0-9a-f]{12}\.js$/.test(RSKR[0]) || !/^suche-[0-9a-f]{12}\.js$/.test(RSKR[1]) || RSKR[2] !== "app-v43.js") throw new Error("Release-index.html lädt " + RSKR);
const APP_SHA = "ada38d5ed342572b2b3e0daa476d9e6b4186426841047fb9a1655a6663789020";
const STAENDE = {
  p25: { web: path.join(CW, "paket27/website"), data: "data-p27.js", smart: path.join(CW, "paket27/out/smart-search-data-p27.json") },
  p27: { web: RWEB, data: RSKR[0], smartJsDatei: path.join(RWEB, RSKR[1]) },
};
for (const s of Object.values(STAENDE)) {
  s.dataJs = read(path.join(s.web, s.data)); s.smartJs = s.smartJsDatei ? read(s.smartJsDatei) : `window.MEDIA_SKILLS_SMART_DATA = ${read(s.smart)};\n`;
  s.offers = JSON.parse(s.dataJs.slice(s.dataJs.indexOf("["), s.dataJs.lastIndexOf("]") + 1));
  s.key = {}; for (const o of s.offers) { const k = `${o.title}|${o.provider}`; s.key[k] = s.key[k] ? s.key[k] + "|DUBLETTE" : o.id; }
}
const APP = read(path.join(STAENDE.p27.web, "app-v43.js")), INDEX = read(path.join(CW, "paket27/website/index.html"));
if (sha(APP) !== APP_SHA || read(path.join(STAENDE.p25.web, "app-v43.js")) !== APP) throw new Error("app-v43.js nicht ada38d5e…");
if (process.env.TZ !== "Europe/Zurich") throw new Error("TZ=Europe/Zurich fehlt (B07: gleiche Umgebung für beide Stände)");
// B06: Testkopie mit Haken vor der Sortierung der Smart-Kandidaten (sortiert wird dasselbe Array an Ort und Stelle)
const HAKEN = "    evaluated.sort((a, b) => {";
if (APP.split(HAKEN).length !== 2) throw new Error("Haken-Stelle nicht eindeutig");
const APP_I = APP.replace(HAKEN, "    window.__P25_EVAL = evaluated;\n" + HAKEN);

// ---------- 60 Anfragen ----------
const pcc = STAENDE.p25.offers.find(o => o.id === "PCC-P08");
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

function load(st, stichtag, fehler, app = APP, fav = null) {
  const vc = new VirtualConsole(); vc.on("jsdomError", e => fehler.push(String(e && e.message || e))); vc.on("error", e => fehler.push("console.error " + e));
  const dom = new JSDOM(INDEX.replace(/<script src="[^"]+"><\/script>/g, ""), { url: "https://mediaskills.ch/", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window; w.addEventListener("error", e => fehler.push(e.message));
  w.eval(DATEFIX(stichtag)); if (fav !== null) w.localStorage.setItem(FAV_KEY, fav); w.eval(st.dataJs); w.eval(st.smartJs); w.eval(app);
  return w;
}
const FAV_KEY = "weiterbildungsradar:favorites:v1";
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
    stichtage_jsdom: TAGE, release: REL, skripte: RSKR }, stichtage: {} };
  // ---------- jsdom: G09, G10, G11 an drei Stichtagen ----------
  for (const S of TAGE) {
    const fehler = { p25: [], p27: [] }, W = { p25: load(STAENDE.p25, S, fehler.p25), p27: load(STAENDE.p27, S, fehler.p27) };
    const P = protokoll.stichtage[S] = {};
    // G09
    const sorts = [...W.p27.document.querySelectorAll("#sortSelect option")].map(o => o.value);
    const g09 = []; let sichtbar = null, htmlAbw = 0;
    for (const so of sorts) {
      const k = {}; for (const n of ["p25", "p27"]) { setze(W[n], "#sortSelect", so); k[n] = karten(W[n]); }
      if (so === sorts[0]) sichtbar = k.p27.length;
      const A = k.p25.map(c => [c.id, c.text, c.links]), B = k.p27.map(c => [c.id, c.text, c.links]);
      if (!same(A, B)) g09.push(`${so}: ${A.length}/${B.length} Karten, erste Abweichung bei ${A.findIndex((x, i) => !same(x, B[i]))}`);
      htmlAbw += k.p25.filter((c, i) => !k.p27[i] || c.html !== k.p27[i].html).length;
    }
    setze(W.p25, "#sortSelect", sorts[0]); setze(W.p27, "#sortSelect", sorts[0]);
    P.G09 = { sortierungen: sorts, sichtbar, abweichungen: g09, html_abweichungen: htmlAbw };
    check(`G09 ${S}`, `Karten: alle sichtbaren Karten mit Text und Link gleich, gleiche Reihenfolge in allen drei Sortierungen (${sorts.join(", ")})`,
      sorts.length === 3 && !g09.length && sichtbar > 0, `${sichtbar} sichtbar; ${g09.join("; ")}; outerHTML abweichend ${htmlAbw}`);
    // G10
    const g10 = []; let nOpt = 0; const zaehler = {};
    for (const f of FILTER) {
      const opt = n => [...W[n].document.querySelectorAll(`#${f} option`)].map(o => [o.value, txt(o)]);
      if (!same(opt("p25"), opt("p27"))) g10.push(`${f}: Optionen verschieden`);
      for (const [v] of opt("p27")) {
        nOpt++;
        const z = {}; for (const n of ["p25", "p27"]) { setze(W[n], `#${f}`, v); z[n] = [txt(W[n].document.querySelector("#resultCount")), karten(W[n]).map(c => c.id).join(",")]; }
        zaehler[`${f}=${v}`] = z.p27[0];
        if (!same(z.p25, z.p27)) g10.push(`${f}=${v}: «${z.p25[0]}» ≠ «${z.p27[0]}»`);
      }
      setze(W.p25, `#${f}`, ""); setze(W.p27, `#${f}`, "");
    }
    // «Kostenlos»-Schaltfläche der Smart-Suche (smartFreeButton) gehört zu G11; Filter «Kostenlos» ist eine Option von priceFilter
    P.G10 = { optionen: nOpt, zaehler, abweichungen: g10 };
    check(`G10 ${S}`, `Filter: Optionen und Zähler aller ${FILTER.length} Filter gleich (u. a. Kursform, Niveau, Sprache, Preisklasse inkl. Kostenlos, Durchführungsort), ${nOpt} Optionen einzeln gewählt`,
      !g10.length && nOpt > 20, g10.slice(0, 5).join("; "));
    // G11 jsdom
    const tausch = [], fehl = [], antworten = {};
    for (const [qid, q] of Q) {
      const r = {}; for (const n of ["p25", "p27"]) r[n] = JSON.parse(W[n].eval(`JSON.stringify((${CAPTURE})(${JSON.stringify(q)}))`));
      antworten[qid] = { q, p25: r.p25, p27: r.p27 };
      vergleiche(qid, r.p25, r.p27, STAENDE.p25, STAENDE.p27, tausch, fehl);
    }
    const js = [...fehler.p25, ...fehler.p27];
    P.G11 = { anfragen: Q.length, treffer: Object.values(antworten).reduce((s, a) => s + a.p27.cards.length, 0), tausch, abweichungen: fehl, js_fehler: js };
    check(`G11 jsdom ${S}`, `Smart-Suche: ${Q.length} Anfragen (T01–T20, 40 virtuelle), Treffermengen, Kartentexte, Budget, Begründung, Links, Chips, Status, Verstanden gleich; Reihenfolge gleich bis auf Tausch bei gleichem Titel; keine JS-Fehler`,
      Q.length === 60 && !fehl.length && !js.length, `${fehl.slice(0, 3).join("; ")} ${js.slice(0, 2).join("; ")}`);
    console.log(`INFO G11 ${S}: ${P.G11.treffer} Treffer gezeigt, ${tausch.length} Tausch(e) ${tausch.map(t => `${t.anfrage} «${t.titel.join(", ")}»`).join("; ")}`);
    // G11 Punktzahl (B06): Testkopie mit Haken; ihre Ausgaben müssen den Ausgaben der Original-App gleichen
    const fI = { p25: [], p27: [] }, WI = { p25: load(STAENDE.p25, S, fI.p25, APP_I), p27: load(STAENDE.p27, S, fI.p27, APP_I) };
    const fehlP = [], gleich = { n: 0 }; let kand = 0, hakenAbw = 0;
    for (const [qid, q] of Q) {
      const r = {}; for (const n of ["p25", "p27"]) r[n] = JSON.parse(WI[n].eval(`JSON.stringify((${CAPTURE_EVAL})(${JSON.stringify(q)}))`));
      for (const n of ["p25", "p27"]) { const { eval: e, ...ohne } = r[n]; if (!same(ohne, antworten[qid][n])) hakenAbw++; }  // H3: beide Stände
      kand += (r.p27.eval || []).length;
      vergleicheEval(qid, r.p25.eval, r.p27.eval, fehlP, gleich);
    }
    P.G11_punktzahl = { kandidaten: kand, umgestellte_gleichstaende: gleich.n, abweichungen: fehlP, haken_abweichungen: hakenAbw, js_fehler: [...fI.p25, ...fI.p27] };
    check(`G11 Punktzahl ${S}`, `Smart-Suche, ganze Kandidatenliste je Anfrage (nicht nur die 3 gezeigten): Punktzahl, Budget- und Gratis-Status je Angebot gleich; Umstellungen nur innerhalb tatsächlicher Gleichstände (Status, Punktzahl, Titel); Testkopie mit Haken liefert dieselben Ausgaben wie die Original-App`,
      !fehlP.length && !hakenAbw && !P.G11_punktzahl.js_fehler.length, `${fehlP.slice(0, 3).join("; ")}; Haken-Abweichungen ${hakenAbw}`);
    console.log(`INFO G11 Punktzahl ${S}: ${kand} Kandidaten in 60 Anfragen, ${gleich.n} Gleichstandsgruppe(n) in anderer Reihenfolge (nur Dateireihenfolge, Entscheid 3)`);
    for (const w of [W.p25, W.p27, WI.p25, WI.p27]) w.close();  // Speicher freigeben (sonst Abbruch durch das System nach zwei Stichtagen)
  }

  // ---------- P02 Merkliste ----------
  if (NUR === undefined || NUR === "E") {
    const p27ids = STAENDE.p25.offers.map(o => o.id), relIds = new Set(STAENDE.p27.offers.map(o => o.id));
    const nichtGeliefert = p27ids.filter(i => !relIds.has(i)), geliefert = [...relIds];
    const fav = JSON.stringify([geliefert[0], nichtGeliefert[0], geliefert[5], nichtGeliefert[1], "UNBEKANNT-ID"]);
    const fehl = [];
    for (const S of ALLE_TAGE) {
      const f = { a: [], b: [] }, A = load(STAENDE.p25, S, f.a, APP, fav), B = load(STAENDE.p27, S, f.b, APP, fav);
      const z = w => [txt(w.document.querySelector("#favoritesCount")), [...w.document.querySelectorAll(".favorite-button.is-favorite")].map(b => b.dataset.favoriteId).join(",")];
      if (!same(z(A), z(B))) fehl.push(`${S}: Merkliste ${z(A)} ≠ ${z(B)}`);
      for (const [n, w] of [["P27", A], ["Release", B]]) if (w.localStorage.getItem(FAV_KEY) !== fav) fehl.push(`${S} ${n}: localStorage nach dem Laden geändert`);
      A.close(); B.close();
    }
    // zwei Releases (E231): Release 1 = dieses Release (ID nicht geliefert), Release 2 = P27 (ID wieder geliefert)
    const X = nichtGeliefert[0], V1 = geliefert[0], V2 = geliefert[1];
    const f2 = [];
    let w1 = load(STAENDE.p27, S0, f2, APP, JSON.stringify([X, V1])); const ohne = w1.localStorage.getItem(FAV_KEY); w1.close();
    let w2 = load(STAENDE.p25, S0, f2, APP, ohne); const wieder = w2.eval("JSON.parse(localStorage.getItem('weiterbildungsradar:favorites:v1'))"); w2.close();
    if (!same(wieder, [X, V1])) fehl.push(`ohne Änderung: ${JSON.stringify(wieder)} statt ${JSON.stringify([X, V1])}`);
    w1 = load(STAENDE.p27, S0, f2, APP, JSON.stringify([X, V1]));
    const btn = [...w1.document.querySelectorAll("[data-favorite-id]")].find(b => b.dataset.favoriteId === V2);
    if (!btn) fehl.push(`Knopf für ${V2} fehlt`); else btn.dispatchEvent(new w1.MouseEvent("click", { bubbles: true }));
    const mit = w1.localStorage.getItem(FAV_KEY); w1.close();
    w2 = load(STAENDE.p25, S0, f2, APP, mit); const weg = w2.eval("JSON.parse(localStorage.getItem('weiterbildungsradar:favorites:v1'))"); w2.close();
    if (!same([...weg].sort(), [V1, V2].sort())) fehl.push(`mit Änderung: ${JSON.stringify(weg)} statt ${JSON.stringify([V1, V2])}`);
    protokoll.merkliste = { nicht_geliefert: X, ohne_aenderung: wieder, mit_aenderung: weg, abweichungen: fehl, js_fehler: f2 };
    check("P02 Merkliste", "Merkliste gleich für sichtbare IDs an allen drei Tagen, localStorage nach dem Laden unverändert; zwei Releases: ohne Änderung wieder gemerkt, mit Änderung weg (E231)", !fehl.length && !f2.length, fehl.slice(0, 3).join("; "));
  }
  // ---------- P16 Ende zu Ende ----------
  if (NUR === undefined || NUR === "E") {
    const fehler = [], vc = new VirtualConsole(); vc.on("jsdomError", e => fehler.push(String(e && e.message || e)));
    // über HTTP wie ein Browser (unter file:// lehnt jsdom history.replaceState der App ab)
    const TYP = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css" };
    const srv = await new Promise(res => { const s = http.createServer((q, r) => {
      const p = path.join(RWEB, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/^\/$/, "/index.html"));
      if (!p.startsWith(RWEB) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end("404"); }
      r.writeHead(200, { "Content-Type": TYP[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
    }).listen(0, "127.0.0.1", () => res(s)); });
    const dom = await JSDOM.fromURL(`http://127.0.0.1:${srv.address().port}/`, { runScripts: "dangerously", resources: "usable", pretendToBeVisual: true, virtualConsole: vc,
      beforeParse(w) { w.eval(DATEFIX(S0)); } });
    await new Promise(r => dom.window.addEventListener("load", r));
    const w = dom.window, rel = STAENDE.p27;
    const smartRel = JSON.parse(rel.smartJs.slice(rel.smartJs.indexOf("{"), rel.smartJs.lastIndexOf("}") + 1));
    const ok1 = same(w.WEITERBILDUNGSRADAR_OFFERS, rel.offers), ok2 = same(w.MEDIA_SKILLS_SMART_DATA, smartRel);
    const f = [], vgl = load(STAENDE.p25, S0, f);
    const kR = karten(w).map(c => [c.id, c.text, c.links]), kV = karten(vgl).map(c => [c.id, c.text, c.links]); vgl.close();
    protokoll.p16 = { daten: ok1, smart: ok2, karten: kR.length, js_fehler: fehler };
    check("P16 Ende zu Ende", `index.html des Releases mit eigenen Skriptverweisen (${RSKR.join(", ")}) geladen: Daten und Smart = Dateien des Releases, ${kR.length} Karten am ${S0} = P27`,
      ok1 && ok2 && kR.length > 0 && same(kR, kV) && !fehler.length, `Daten ${ok1}, Smart ${ok2}, Karten gleich ${same(kR, kV)}; ${fehler.slice(0, 2).join("; ")}`);
    w.close(); srv.close();
  }
  fs.writeFileSync(path.join(OUT, `test_paket28_anzeige_${S0}${NUR === undefined ? "" : "_" + NUR}.json`), JSON.stringify({ results, protokoll }, null, 1));
  const n = s => results.filter(r => r.status === s).length;
  console.log(`\n${n("PASS")} PASS · ${n("FAIL")} FAIL`);
  process.exit(n("FAIL") ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
