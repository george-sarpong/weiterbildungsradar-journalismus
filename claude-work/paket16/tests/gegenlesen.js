// Paket 16 – Gegenlesen: alle sichtbaren Texte der Website je Element sammeln (docs/)
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { chromium } = require("playwright-core");
const DOCS = path.resolve(process.argv[2] || "docs"), OUT = path.resolve(process.argv[3] || "claude-work/paket16/out");
const serve = dir => new Promise(res => { const s = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/^\/$/, "/index.html")); if (!fs.existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "Content-Type": p.endsWith(".js") ? "text/javascript; charset=utf-8" : p.endsWith(".css") ? "text/css" : "text/html; charset=utf-8" }); fs.createReadStream(p).pipe(r); }).listen(0, "127.0.0.1", () => res(s)); });
(async () => {
  const srv = await serve(DOCS), base = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  const p = await (await b.newContext({ locale: "de-CH", viewport: { width: 1280, height: 900 } })).newPage();
  await p.goto(base); await p.waitForSelector("#cards .card");
  const cards = await p.$$eval("#cards .card", cs => cs.map(c => {
    const t = e => (e ? e.textContent : "").replace(/\s+/g, " ").trim();
    const facts = {}; c.querySelectorAll(".fact-item").forEach(f => { facts[t(f.querySelector("dt"))] = t(f.querySelector("dd")); });
    return { id: c.dataset.offerId, title: t(c.querySelector("h2,h3")), badges: [...c.querySelectorAll(".badges .badge")].map(t), facts,
      desc: t(c.querySelector(".card-description, .description, p.summary")), all: t(c) };
  }));
  const ui = await p.evaluate(() => { const c = document.querySelector("#cards"); const clone = document.body.cloneNode(true); clone.querySelector("#cards")?.remove(); return clone.innerText; });
  const pages = {};
  for (const f of ["methodik.html", "datenschutz.html", "impressum.html", "404.html"]) { await p.goto(base + f); pages[f] = await p.evaluate(() => document.body.innerText); }
  await p.goto(base); await p.waitForSelector("#cards .card");
  await p.screenshot({ path: path.join(OUT, "start_desktop.png") });
  await b.close(); srv.close();
  fs.writeFileSync(path.join(OUT, "gegenlesen.json"), JSON.stringify({ cards, ui, pages }, null, 1));
  console.log("Karten", cards.length);
})();
