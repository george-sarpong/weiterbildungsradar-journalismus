// Paket 29 P15 und P12 Ladezeit (SPEZIFIKATION_PAKET29_20261123.md §7.3): Release über lokalen HTTP-Server (gzip wie live) in
// Chrome headless mit den eigenen Skriptverweisen der index.html. P15: alle Anfragen 200, 0 JavaScript-Fehler, Karten wie jsdom
// (P28 am selben Stichtag), ein Filter, eine Smart- und eine Katalogsuche wie jsdom (app-v44.js). P12: Kaltstart (neuer
// Browser-Kontext, Cache leer), Netz gedrosselt wie Chrome DevTools «Fast 4G» (9 Mbit/s ×0,9 down, 1,5 Mbit/s ×0,9 up,
// 60 ms ×2,75 Latenz), 5 Wiederholungen, Median; P28 und P29 gleich gemessen.
// Aufruf (aus claude-work/): TZ=Europe/Zurich NODE_PATH=<nm>:<playwright> REL29=<ordner> REL28=<ordner> S=JJJJ-MM-TT node paket29/tests/test_paket29_chrome.js
"use strict";
const fs = require("fs"), path = require("path"), http = require("http"), zlib = require("zlib");
const { chromium } = require("playwright");
const { JSDOM } = require("jsdom");
const CW = path.resolve(__dirname, "../.."), OUT = path.join(CW, "paket29/out"), S = process.env.S;
const REL = { p28: path.resolve(process.env.REL28 || ""), p29: path.resolve(process.env.REL29 || "") };
const read = p => fs.readFileSync(p, "utf8");
const DATEFIX = `(() => { const R = Date; const F = new R("${S}T12:00:00").getTime();
  class D extends R { constructor(...a) { a.length ? super(...a) : super(F); } static now() { return F; } }
  window.Date = D; })();`;
const TYP = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".xml": "application/xml", ".txt": "text/plain" };
const serve = web => new Promise(res => { const s = http.createServer((q, r) => {
  const p = path.join(web, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/^\/$/, "/index.html"));
  if (!p.startsWith(web) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end("404"); }
  const b = fs.readFileSync(p), gz = /gzip/.test(q.headers["accept-encoding"] || "");
  r.writeHead(200, { "Content-Type": TYP[path.extname(p)] || "application/octet-stream", ...(gz ? { "Content-Encoding": "gzip" } : {}) });
  r.end(gz ? zlib.gzipSync(b, { level: 6 }) : b);
}).listen(0, "127.0.0.1", () => res(s)); });
const results = [], check = (id, name, ok, detail = "") => { results.push({ id, name, status: ok ? "PASS" : "FAIL", detail }); console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail ? " – " + detail : ""}`); };
const med = a => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

// jsdom-Vergleichswerte mit derselben index.html (Skripte nacheinander ausgeführt)
function jsdomWerte(web) {
  const idx = read(path.join(web, "index.html")), skr = [...idx.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
  const w = new JSDOM(idx.replace(/<script src="[^"]+"><\/script>/g, ""), { url: "https://mediaskills.ch/", runScripts: "outside-only", pretendToBeVisual: true }).window;
  w.eval(DATEFIX); for (const f of skr) w.eval(read(path.join(web, f)));
  return aktionen(w.document, w);
}
// gleiche Aktionen im Seitenkontext (Chrome) und in jsdom
function aktionen(d, w) {
  const txt = n => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
  const ids = () => [...d.querySelectorAll("#cards article.card")].map(c => c.dataset.offerId);
  const r = { karten: ids() };
  const set = (sel, v, ev) => { const e = d.querySelector(sel); e.value = v; for (const x of ev) e.dispatchEvent(new w.Event(x, { bubbles: true })); };
  set("#countryFilter", "Österreich", ["change", "input"]); r.filter = [txt(d.querySelector("#resultCount")), ids().join(",")]; set("#countryFilter", "", ["change", "input"]);
  set("#searchInput", "Basel", ["input"]); r.katalog = [txt(d.querySelector("#resultCount")), ids().join(",")]; set("#searchInput", "", ["input"]);
  d.querySelector("#smartInput").value = "Journalismus"; d.querySelector("#smartSearchForm").dispatchEvent(new w.Event("submit", { cancelable: true }));
  r.smart = [...d.querySelectorAll("#smartResults .smart-result-card")].map(c => txt(c));
  r.hinweis = !!d.querySelector("[data-load-warning]");
  return r;
}

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const proto = { stichtag: S, chrome: browser.version(), ladezeit_ms: {} };
  const srv = {}; for (const k of ["p28", "p29"]) srv[k] = await serve(path.join(REL[k], "website"));
  // ---------- P15 ----------
  {
    const ctx = await browser.newContext(); await ctx.addInitScript(DATEFIX);
    const page = await ctx.newPage(), anfragen = [], fehler = [];
    page.on("response", r => anfragen.push([r.status(), new URL(r.url()).pathname]));
    page.on("pageerror", e => fehler.push(String(e))); page.on("console", m => { if (m.type() === "error") fehler.push(m.text()); });
    await page.goto(`http://127.0.0.1:${srv.p29.address().port}/`, { waitUntil: "load" });
    const chrome = await page.evaluate(`(${aktionen.toString()})(document, window)`);
    const j29 = jsdomWerte(path.join(REL.p29, "website")), j28 = jsdomWerte(path.join(REL.p28, "website"));
    const skr = [...read(path.join(REL.p29, "website/index.html")).matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
    const geladen = anfragen.filter(([, p]) => p.endsWith(".js")).map(([, p]) => p.slice(1));
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    check(`P15 ${S}`, `Ende zu Ende in Chrome headless: alle Anfragen 200, ${skr.length} Skripte in der Reihenfolge der index.html geladen, 0 JS-Fehler; Karten = P28 (jsdom); Filter «Österreich», Katalogsuche «Basel», Smart-Suche «Journalismus» = jsdom; kein Ladehinweis`,
      anfragen.every(([s]) => s === 200) && same(geladen, skr) && !fehler.length && same(chrome.karten, j28.karten) && chrome.karten.length > 0
      && same(chrome.filter, j29.filter) && same(chrome.katalog, j29.katalog) && same(chrome.smart, j29.smart) && !chrome.hinweis,
      `${chrome.karten.length} Karten; Anfragen ${anfragen.length} (${[...new Set(anfragen.map(a => a[0]))]}); Filter ${chrome.filter[0]}; Katalog ${chrome.katalog[0]}; Smart ${chrome.smart.length} Karten; Fehler ${fehler.slice(0, 2)}`);
    proto.p15 = { anfragen, fehler, karten: chrome.karten.length, filter: chrome.filter[0], katalog: chrome.katalog[0] };
    await ctx.close();
  }
  // ---------- P12 Ladezeit ----------
  for (const k of ["p28", "p29"]) {
    const t = [];
    for (let i = 0; i < 5; i++) {
      const ctx = await browser.newContext(); await ctx.addInitScript(DATEFIX);
      const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
      await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 60 * 2.75, downloadThroughput: 9 * 1000 * 1000 / 8 * 0.9, uploadThroughput: 1.5 * 1000 * 1000 / 8 * 0.9 });
      const t0 = Date.now();
      await page.goto(`http://127.0.0.1:${srv[k].address().port}/`, { waitUntil: "load" });
      await page.waitForFunction(() => document.querySelectorAll("#cards article.card").length > 0 && !document.querySelector("#cards .static-list"));
      const nav = await page.evaluate(() => { const n = performance.getEntriesByType("navigation")[0]; return { dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd }; });
      t.push({ karten_ms: Date.now() - t0, dcl: Math.round(nav.dcl), load: Math.round(nav.load) });
      await ctx.close();
    }
    proto.ladezeit_ms[k] = { laeufe: t, median_load: med(t.map(x => x.load)), median_dcl: med(t.map(x => x.dcl)), median_karten: med(t.map(x => x.karten_ms)) };
    console.log(`INFO P12 Ladezeit ${k}: Median load ${proto.ladezeit_ms[k].median_load} ms, DOMContentLoaded ${proto.ladezeit_ms[k].median_dcl} ms, Karten sichtbar ${proto.ladezeit_ms[k].median_karten} ms`);
  }
  for (const s of Object.values(srv)) s.close();
  await browser.close();
  fs.writeFileSync(path.join(OUT, `test_paket29_chrome_${S}.json`), JSON.stringify({ results, proto }, null, 1));
  const n = s => results.filter(r => r.status === s).length;
  console.log(`\n${n("PASS")} PASS · ${n("FAIL")} FAIL`); process.exit(n("FAIL") ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
