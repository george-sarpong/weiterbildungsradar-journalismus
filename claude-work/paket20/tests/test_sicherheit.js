// Paket 20 – Browser-Prüfung der Sicherheits-Header (E124) auf lokalem Apache (gestartet von test_sicherheit.sh).
// Argumente: <Basis mit Headern> <Basis ohne mod_headers> <Basis mit Tippfehler in .htaccess>
"use strict";
const { chromium } = require("playwright");
const [BASE, OHNE, KAPUTT] = process.argv.slice(2);
const SOLL = {
  "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin"
};
const res = []; const check = (id, ok, info) => { res.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${id} – ${info}`); };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome" });
  const ctx = await b.newContext({ locale: "de-CH", timezoneId: "Europe/Zurich", viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => { window.__csp = []; document.addEventListener("securitypolicyviolation", e => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`)); });
  const p = await ctx.newPage(), heads = [], cons = [], perr = [];
  p.on("response", r => heads.push({ url: r.url(), status: r.status(), h: r.headers() }));
  p.on("console", m => { if (m.type() === "error") cons.push(m.text()); });
  p.on("pageerror", e => perr.push(String(e)));
  const csp = async () => p.evaluate(() => window.__csp.slice());
  const viol = [];
  // Start, Katalogsuche, Filter, Smart-Suche, Merken
  await p.goto(BASE + "/"); await p.waitForSelector("#cards .card");
  const n0 = await p.$$eval("#cards .card", cs => cs.length);
  await p.fill("#searchInput", "Datenjournalismus"); await p.waitForTimeout(500);
  const n1 = await p.$$eval("#cards .card", cs => cs.length);
  await p.fill("#searchInput", ""); await p.waitForTimeout(300);
  await p.selectOption("#countryFilter", { index: 1 }); await p.waitForTimeout(300);
  await p.click("#resetFilters"); await p.waitForTimeout(300);
  await p.fill("#smartInput", "Datenjournalismus unter 800 Franken"); await p.click(".smart-submit");
  await p.waitForFunction(() => document.querySelector("#smartStatus").textContent.trim().length > 0);
  const smart = await p.$$eval("#smartResults .smart-result-card", cs => cs.length);
  await p.click("#cards [data-favorite-id]"); await p.waitForTimeout(300);
  const fav = await p.evaluate(() => localStorage.getItem("weiterbildungsradar:favorites:v1"));
  viol.push(...(await csp()).map(v => `/: ${v}`));
  for (const f of ["methodik.html", "datenschutz.html", "impressum.html", "404.html", "gibt-es-nicht.html"]) {
    await p.goto(`${BASE}/${f}`); await p.waitForLoadState("load"); viol.push(...(await csp()).map(v => `${f}: ${v}`));
  }
  const ld = await (await ctx.newPage()).goto(BASE + "/").then(async r => (await r.text()).includes('type="application/ld+json"'));
  check("H1", n0 > 1000 && n1 > 0 && n1 < n0 && smart > 0 && fav && fav.length > 2,
    `Website funktioniert mit CSP: ${n0} Karten, Katalogsuche ${n1}, Smart-Suche ${smart} Karten, Merken in localStorage`);
  check("H2", viol.length === 0 && perr.length === 0 && cons.filter(c => /Content Security Policy|Refused/.test(c)).length === 0,
    `keine CSP-Verletzung, kein Skriptfehler (Start mit Suche/Filter/Merken, 4 Unterseiten, unbekannte Adresse): Verletzungen ${viol.length}, Skriptfehler ${perr.length} ${[...viol, ...perr].slice(0, 3).join(" | ")}`);
  check("H3", ld, "JSON-LD (application/ld+json) bleibt im HTML und löst keine Verletzung aus (Datenblock, kein Skript)");
  const eigen = heads.filter(x => x.url.startsWith(BASE));
  const fehlt = eigen.filter(x => Object.entries(SOLL).some(([k, v]) => x.h[k] !== v));
  check("H4", eigen.length >= 8 && fehlt.length === 0,
    `alle ${eigen.length} Antworten (HTML, JS, CSS, auch Status ${[...new Set(eigen.map(x => x.status))].join("/")}) tragen die drei Header ${fehlt.slice(0, 2).map(x => x.url).join(" ")}`);
  const typ = eigen.filter(x => x.status === 200 && /\.(js|css)$/.test(x.url) && !/^(text\/javascript|application\/javascript|text\/css)/.test(x.h["content-type"] || ""));
  check("H5", typ.length === 0, `nosniff: JS und CSS mit passendem Content-Type (${typ.map(x => x.url).join(" ")})`);
  // Server ohne mod_headers: keine Header, aber Website läuft (IfModule verhindert Fehler 500)
  const r2 = await p.goto(OHNE + "/");
  check("H6", r2.status() === 200 && !r2.headers()["content-security-policy"], `ohne mod_headers: Status ${r2.status()}, keine Header – der Test nach dem Upload erkennt das`);
  // Tippfehler in .htaccess: ganze Website Fehler 500 (Risiko FAQ 106) – deshalb Rückweg im Rezept
  const r3 = await p.goto(KAPUTT + "/");
  check("H7", r3.status() === 500, `Tippfehler in .htaccess: Status ${r3.status()} – zeigt, warum direkt nach dem Upload getestet und notfalls zurückgestellt wird`);
  await b.close();
  console.log(`\n${res.filter(Boolean).length}/${res.length} bestanden`); process.exit(res.every(Boolean) ? 0 : 1);
})();
