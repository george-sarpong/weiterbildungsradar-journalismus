// Paket 19 – Browser-Prüfungen im kopflosen Chrome (Spezifikation §7: L01 Browser, L05, L06 Browser, J02, J04, J05, R05 Seite).
// Prüfstand: lokaler Apache mit .htaccess (CSP «self»), gestartet von test_apache_p19.sh; Paket = build_release.py.
// Argumente: <Basis Paket 19> <Basis Rückweg>  ·  Umgebung: STICHTAG (S0, Build-Stichtag), CHROME
"use strict";
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright-core");
const [BASE, RUECK] = process.argv.slice(2);
const S0 = process.env.STICHTAG || "2026-11-19", S2 = "2026-12-01";
const CW = path.join(process.cwd(), "claude-work"), OUT = path.join(CW, "paket19/out"), SHOT = path.join(OUT, "screenshots");
fs.mkdirSync(SHOT, { recursive: true });
const res = []; const check = (id, ok, info) => { res.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${id} – ${info}`); };
const PRE = "window.WEITERBILDUNGSRADAR_OFFERS = ";
const D19 = JSON.parse(fs.readFileSync(path.join(CW, "paket19/website/data-p19.js"), "utf8").slice(PRE.length).replace(/;\n$/, ""));
const vis = (D, t) => { const today = new Date(`${t}T00:00:00`); const pd = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "").trim()) ? new Date(`${String(v).trim()}T23:59:59`) : null;
  const cur = o => Array.isArray(o.sessions) ? o.sessions.some(s => pd(s.startDate) >= today) : (() => { const e = pd(o.endDate), s = pd(o.startDate); return (!e || e >= today) && (e || !s || s >= today); })();
  return D.filter(o => cur(o) && o.publicationStatus !== "HOLD").length; };
const [y, m, d] = S0.split("-"), STAND = `Stand der Angaben: ${d}.${m}.${y}`;

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome" });
  const neu = async (opts = {}, tag = S0) => {
    const ctx = await b.newContext({ locale: "de-CH", timezoneId: "Europe/Zurich", viewport: { width: 1280, height: 900 }, ...opts });
    await ctx.addInitScript(() => { window.__csp = []; document.addEventListener("securitypolicyviolation", e => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`)); });
    const p = await ctx.newPage(); p.__cons = []; p.__err = [];
    p.on("console", x => { if (x.type() === "error") p.__cons.push(x.text()); }); p.on("pageerror", e => p.__err.push(String(e)));
    if (opts.javaScriptEnabled !== false) await p.clock.install({ time: new Date(`${tag}T12:00:00`) });
    return { ctx, p };
  };
  // Karten im Browser lesen (gleiche Felder wie der Build)
  const karten = p => p.$$eval("#cards article.card", cs => cs.map(c => {
    const t = n => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
    const f = [...c.querySelectorAll(".fact-item")].find(x => t(x.querySelector("dt")) === "Preis");
    const o = [...c.querySelectorAll(".badges .badge")].map(t).find(x => x.startsWith("Ort: "));
    const a = c.querySelector(".card-links a.source-link");
    return `${t(c.querySelector("h3"))} · ${t(c.querySelector(".provider"))} · Ort: ${o ? o.slice(5) : "?"} · Preis: ${f ? t(f.querySelector("dd")) : "?"}|${a ? a.getAttribute("href") : ""}`;
  }));

  // ---------- ohne JavaScript ----------
  const { ctx: c0, p: p0 } = await neu({ javaScriptEnabled: false });
  const r0 = await p0.goto(BASE + "/");
  const liste = await p0.$$eval("#cards > .static-list > ul > li", ls => ls.map(li => `${li.textContent}|${li.querySelector("a") ? li.querySelector("a").getAttribute("href") : ""}`));
  const stand0 = await p0.$eval(".data-stand", n => n.textContent).catch(() => "");
  const sichtbar0 = await p0.$eval("#cards > .static-list > ul", n => { const r = n.getBoundingClientRect(); return r.height > 0 && getComputedStyle(n).visibility !== "hidden"; });
  await p0.screenshot({ path: path.join(SHOT, "p19_ohne_js.png") });
  const csp0 = await p0.evaluate(() => window.__csp.slice());
  await c0.close();

  // ---------- mit JavaScript am Stichtag ----------
  const { ctx: c1, p: p1 } = await neu({}, S0);
  await p1.goto(BASE + "/"); await p1.waitForSelector("#cards article.card");
  const k0 = await karten(p1);
  const ul1 = await p1.$$("#cards > .static-list > ul"), h1 = await p1.$$eval("#cards > .static-list > h3", x => x.length);
  const aria = await p1.locator("#angebote").ariaSnapshot();
  const stand1 = await p1.$eval(".data-stand", n => n.textContent);
  const count1 = await p1.$eval("#resultCount", n => n.textContent);
  // Filter, Katalogsuche, Smart-Suche, Merkliste laufen (J03 Rauchtest; Vollprüfung Stufe 1/2)
  await p1.fill("#searchInput", "Datenjournalismus"); await p1.waitForTimeout(300); const nSuche = (await p1.$$("#cards article.card")).length;
  await p1.fill("#searchInput", ""); await p1.waitForTimeout(300);
  await p1.click("#cards article.card [data-favorite-id]"); const fav = await p1.$eval("#favoritesCount", n => n.textContent);
  await p1.fill("#smartInput", "Datenjournalismus unter 800 Franken"); await p1.click(".smart-submit"); await p1.waitForTimeout(400);
  const nSmart = (await p1.$$("#smartResults .smart-card, #smartResults article")).length;
  const ulNach = (await p1.$$("#cards > .static-list > ul")).length;
  await p1.screenshot({ path: path.join(SHOT, "p19_mit_js.png") });
  const csp1 = await p1.evaluate(() => window.__csp.slice()), cons1 = p1.__cons.slice(), err1 = p1.__err.slice();
  await c1.close();

  check("P19-L01 Browser", liste.length === k0.length && k0.length === vis(D19, S0), `ohne JS ${liste.length} Einträge, mit JS ${k0.length} Karten am ${S0} (${count1})`);
  const ab = liste.map((l, i) => l === k0[i] ? null : `${i}: ${l.slice(0, 60)} ≠ ${String(k0[i]).slice(0, 60)}`).filter(Boolean);
  check("P19-L06 Browser", ab.length === 0 && liste.length > 0, `Titel, Anbieter, Ort, Preis und Link je Eintrag zeichengleich mit der Karte in Chrome (${ab.length} Abweichungen) ${ab.slice(0, 2).join(" | ")}`);
  check("P19-J01 Browser", r0.status() === 200 && liste.length > 0 && sichtbar0 && stand0 === STAND && csp0.length === 0,
    `ohne JavaScript: Status ${r0.status()}, Liste sichtbar, «${stand0}», keine CSP-Verletzung`);
  check("P19-J02", ul1.length === 0 && h1 === 0 && ulNach === 0 && !/Alle aktuellen Angebote/.test(aria) && stand1 === STAND,
    `mit JavaScript: statische Liste ersetzt (ul ${ul1.length}, Überschrift ${h1}), nicht im Zugänglichkeitsbaum; «${stand1}» bleibt sichtbar; kein app-v44.js nötig (U1)`);
  check("P19-J03 Rauchtest", nSuche > 0 && nSuche < k0.length && fav === "1" && nSmart > 0, `Katalogsuche ${nSuche} Treffer, Merkliste ${fav}, Smart-Suche ${nSmart} Karten (Vollprüfung Stufe 1 und 2)`);
  check("P19-J04", csp1.length === 0 && cons1.length === 0 && err1.length === 0, `Konsole ohne Fehler (${cons1.length}), keine Skriptfehler (${err1.length}), keine CSP-Verletzung (${csp1.length}) ${[...csp1, ...cons1, ...err1].slice(0, 2).join(" | ")}`);

  // ---------- L05 Drift: Liste gebaut an S0, App an S2 ----------
  const { ctx: c2, p: p2 } = await neu({}, S2);
  const html2 = await (await p2.request.get(BASE + "/")).text();
  await p2.goto(BASE + "/"); await p2.waitForSelector("#cards article.card");
  const k2 = await karten(p2), stand2 = await p2.$eval(".data-stand", n => n.textContent);
  await c2.close();
  const li2 = (html2.match(/<li>/g) || []).length, ks2 = new Set(k2), weg = liste.filter(l => !ks2.has(l)).length, dazu = k2.filter(k => !new Set(liste).has(k)).length;
  fs.writeFileSync(path.join(OUT, "drift_S0_S2.json"), JSON.stringify({ build: S0, app: S2, liste: li2, karten: k2.length, nur_in_liste: weg, nur_in_app: dazu }, null, 1) + "\n");
  check("P19-L05", li2 === liste.length && k2.length === vis(D19, S2) && stand2 === STAND && weg === liste.length - k2.length + dazu,
    `Drift: HTML-Liste unverändert ${li2} (Stand ${S0}), App am ${S2} ${k2.length} Karten; ${weg} nur in der Liste, ${dazu} nur in der App (Protokoll drift_S0_S2.json); Seite zeigt «${stand2}»`);

  // ---------- J05 Ansichten ----------
  const ans = [["Handy hoch", 390, 844], ["Handy quer", 844, 390], ["Desktop", 1280, 900]], t6 = [];
  for (const [n, w, h] of ans) for (const js of [true, false]) {
    const { ctx, p } = await neu({ viewport: { width: w, height: h }, javaScriptEnabled: js, isMobile: w < 900 && js, hasTouch: w < 900 && js });
    await p.goto(BASE + "/"); if (js) await p.waitForSelector("#cards article.card");
    const o = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      breit: [...document.querySelectorAll("#cards li, #cards article")].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1).length }));
    if (o.sw > o.cw + 1 || o.breit) t6.push(`${n} ${js ? "mit" : "ohne"} JS: ${o.sw}>${o.cw}, ${o.breit} breit`);
    if (!js) await p.screenshot({ path: path.join(SHOT, `p19_${n.replace(" ", "_")}_ohne_js.png`) });
    await ctx.close();
  }
  check("P19-J05", t6.length === 0, `Handy hoch/quer, Desktop, je mit und ohne JavaScript: nichts horizontal abgeschnitten ${t6.join(" | ")}`);

  // ---------- B1 ohne JavaScript: axe-core auf der statischen Liste (App-Skripte abgefangen, damit die Liste stehen bleibt) ----------
  { const { ctx, p } = await neu();
    // app-v43.js liefert axe-core aus (eigene Herkunft, CSP bleibt aktiv); Daten leer → die App läuft nicht, die Liste bleibt
    const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
    await p.route(/\/(app-v43|data-p19|smart-search-data-p19)\.js$/, r => r.fulfill({ status: 200, contentType: "text/javascript", body: /app-v43/.test(r.request().url()) ? AXE : "" }));
    await p.goto(BASE + "/"); await p.waitForFunction(() => typeof axe !== "undefined");
    const ax = await p.evaluate(async () => (await axe.run(document, { resultTypes: ["violations"] })).violations
      .filter(v => ["critical", "serious"].includes(v.impact)).map(v => `${v.id} (${v.nodes.length})`));
    const nli = (await p.$$("#cards > .static-list > ul > li")).length; await ctx.close();
    check("P19-B1 ohne JS", ax.length === 0 && nli > 0, `axe-core auf der Startseite mit statischer Liste (${nli} Einträge): ${ax.length} Befunde «critical»/«serious» ${ax.join(", ")}`); }

  // ---------- R05 Rückweg lädt Paket-22-Stand ----------
  const { ctx: c3, p: p3 } = await neu({}, S0); const srcs = [];
  p3.on("request", r => srcs.push(new URL(r.url()).pathname));
  await p3.goto(RUECK + "/"); await p3.waitForSelector("#cards article.card");
  const k3 = (await p3.$$("#cards article.card")).length, ul3 = (await p3.$$(".data-stand, #cards > .static-list > ul")).length;
  const csp3 = await p3.evaluate(() => window.__csp.slice()); await c3.close();
  check("P19-R05 Seite", srcs.includes("/data-p22.js") && srcs.includes("/smart-search-data-p22.js") && !srcs.some(s => /p19/.test(s)) && k3 === vis(D19, S0) && ul3 === 0 && csp3.length === 0,
    `rollback/index.html lädt data-p22.js und smart-search-data-p22.js, ${k3} Karten am ${S0}, ohne Liste, keine CSP-Verletzung`);
  await b.close();
  console.log(`\n${res.filter(Boolean).length}/${res.length} bestanden`); process.exit(res.every(Boolean) ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
