// Paket 8 – Testsatz Stufe 1 im kopflosen Chrome (Playwright) und Nu Html Checker (lokal, vnu.jar)
// Kriterien: B1 (axe-core critical/serious = 0), B3 auto-Teil (2.5.8 Zielgrösse, 4.1.3 Statusmeldung), T1 (Soll, E076),
//            S1 Vorprüfung (Anfragen nur an die eigene Herkunft; Endprüfung Stufe 2 auf dem Release-Paket).
// Prüfstand: temporärer Ordner = Live-Snapshot Paket A + paket7/website (app-v36.js, data-p7.js, index.html, methodik.html)
//            + Smart-Daten des Merge-Kandidaten; index.html verweist im Prüfstand auf diese Dateien. Kein Release-Paket (Projektregel 7).
// Vergleich: derselbe Lauf auf dem Live-Snapshot (Paket A), damit neue und bestehende Befunde getrennt sind.
// Aufruf (im Repo-Root): NODE_PATH=<ordner>/node_modules PLAYWRIGHT=<pfad>/playwright CHROME=/usr/bin/google-chrome VNU=<pfad>/vnu.jar \
//          node claude-work/paket8/tests/test_browser_p8.js
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), http = require("http");
const { spawnSync } = require("child_process");
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const AXE = require.resolve("axe-core/axe.min.js");
const CW = path.join(process.cwd(), "claude-work"), LIVE = path.join(CW, "live-snapshot-20261109"), W7 = path.join(CW, "paket7/website");
const OUT = path.join(CW, "paket8/out");

function pruefstand() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p8-stand-"));
  for (const f of fs.readdirSync(LIVE)) if (!/^(SHA256SUMS|README)/.test(f)) fs.copyFileSync(path.join(LIVE, f), path.join(dir, f));
  for (const f of ["app-v36.js", "data-p7.js", "methodik.html"]) fs.copyFileSync(path.join(W7, f), path.join(dir, f));
  fs.writeFileSync(path.join(dir, "smart-search-data-p7.js"), `window.MEDIA_SKILLS_SMART_DATA = ${fs.readFileSync(path.join(CW, "paket3/out/merge_kandidat_smart.json"), "utf8")};\n`);
  const idx = fs.readFileSync(path.join(W7, "index.html"), "utf8")
    .replace('src="data-a1-86ff68ddc9ac.js"', 'src="data-p7.js"').replace('src="smart-search-data-a1-a38a2a2b2391.js"', 'src="smart-search-data-p7.js"').replace('src="app-v33.js"', 'src="app-v36.js"');
  if (!/src="app-v36\.js"/.test(idx) || !/src="data-p7\.js"/.test(idx)) throw new Error("Skript-Verweise im Prüfstand nicht ersetzt");
  fs.writeFileSync(path.join(dir, "index.html"), idx);
  return dir;
}
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".xml": "application/xml", ".txt": "text/plain" };
const serve = dir => new Promise(res => {
  const srv = http.createServer((q, r) => {
    const p = path.join(dir, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/^\/$/, "/index.html"));
    if (!p.startsWith(dir) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end("404"); }
    r.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
  }).listen(0, "127.0.0.1", () => res(srv));
});

const PAGES = [["Startseite", "/"], ["Ergebnisansicht", "/?smart=1"], ["Methodik", "/methodik.html"], ["Datenschutz", "/datenschutz.html"], ["Impressum", "/impressum.html"]];
async function audit(browser, base, label) {
  const out = { label, pages: {}, foreign: [], status: {} };
  for (const [name, p] of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    page.on("request", r => { if (!r.url().startsWith(base) && !r.url().startsWith("data:")) out.foreign.push(`${name}: ${r.url()}`); });
    await page.goto(base + p.replace("?smart=1", ""), { waitUntil: "load" });
    if (name === "Ergebnisansicht") {
      await page.fill("#smartInput", "Datenjournalismus, CHF 800");
      await page.click(".smart-submit");
      await page.waitForSelector("#smartResults .smart-result-card");
      out.status.smart = await page.$eval("#smartStatus", e => ({ role: e.getAttribute("role"), live: e.getAttribute("aria-live"), text: e.textContent.trim() }));
      out.status.count = await page.$eval("#resultCount", e => ({ live: e.getAttribute("aria-live"), text: e.textContent.trim() }));
    }
    await page.addScriptTag({ path: AXE });
    const r = await page.evaluate(async () => {
      const res = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] }, resultTypes: ["violations"] });
      return res.violations.map(v => ({ id: v.id, impact: v.impact, tags: v.tags.filter(t => /^wcag/.test(t)), n: v.nodes.length, help: v.help, beispiel: v.nodes.slice(0, 2).map(n => n.target.join(" ")) }));
    });
    out.pages[name] = r;
    await ctx.close();
  }
  return out;
}

(async () => {
  const stand = pruefstand();
  const [s1, s2] = [await serve(stand), await serve(LIVE)];
  const b1 = `http://127.0.0.1:${s1.address().port}`, b2 = `http://127.0.0.1:${s2.address().port}`;
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, headless: true });
  const kand = await audit(browser, b1, "Kandidat (Prüfstand)"), live = await audit(browser, b2, "Live-Snapshot Paket A");
  await browser.close(); s1.close(); s2.close();

  const results = [];
  const check = (id, name, ok, detail = "") => { const s = ok === "SOLL-OFFEN" ? "SOLL-OFFEN" : ok ? "PASS" : "FAIL"; results.push({ id, name, status: s, detail }); console.log(`${s} ${id} ${name}${detail ? " – " + detail : ""}`); };
  const sev = (o, imp) => Object.entries(o.pages).flatMap(([p, vs]) => vs.filter(v => imp.includes(v.impact)).map(v => `${p}: ${v.id} (${v.impact}, ${v.n})`));
  const kHard = sev(kand, ["critical", "serious"]), lHard = sev(live, ["critical", "serious"]);
  const neu = kHard.filter(x => !lHard.includes(x));
  check("B1", "axe-core: 0 Befunde «critical» und «serious» auf Startseite, Ergebnisansicht, Methodik, Datenschutz, Impressum", kHard.length === 0,
    kHard.length ? `${kHard.length}: ${kHard.join("; ")} · davon neu gegenüber live: ${neu.length ? neu.join("; ") : "keine"}` : "");
  const tgt = Object.entries(kand.pages).flatMap(([p, vs]) => vs.filter(v => v.id === "target-size").map(v => `${p}: ${v.n} Elemente`));
  check("B3a", "2.5.8 Zielgrösse ≥ 24 × 24 px (axe target-size)", tgt.length ? "SOLL-OFFEN" : true, tgt.join("; "));
  const st = kand.status;
  check("B3b", "4.1.3 Trefferzahl als Statusmeldung (Smart: role=status, Katalog: aria-live)", st.smart && st.smart.role === "status" && st.smart.live === "polite" && /passende/.test(st.smart.text) && st.count && st.count.live === "polite",
    st.smart ? `«${st.smart.text}» / «${st.count.text}»` : "");
  check("S1-Vorprüfung", "Beim Laden und bei der Suche nur Anfragen an die eigene Herkunft (lokaler Prüfstand; Endprüfung Stufe 2)", kand.foreign.length === 0, kand.foreign.slice(0, 3).join("; "));

  // T1 Nu Html Checker (lokal), Kandidat und live
  const vnu = dir => { const files = ["index.html", "methodik.html", "datenschutz.html", "impressum.html", "404.html"].map(f => path.join(dir, f));
    const raw = spawnSync("java", ["-jar", process.env.VNU, "--format", "json", "--exit-zero-always", ...files], { encoding: "utf8" }).stderr;
    const msgs = JSON.parse(raw.slice(raw.indexOf("{\"version\""))).messages;
    return msgs.filter(m => m.type === "error").map(m => `${path.basename(m.url)}:${m.lastLine} ${m.message}`); };
  const vk = vnu(stand), vl = vnu(LIVE);
  check("T1", "HTML ohne Fehler im Nu Html Checker (Soll, E076)", vk.length ? "SOLL-OFFEN" : true, `${vk.length} Fehler (live ${vl.length})${vk.length ? ": " + vk.slice(0, 3).join(" | ") : ""}`);
  check("T5", "Linkcheck Anbieterlinks", "SOLL-OFFEN", "in dieser Umgebung nicht ausführbar: ausgehende Anfragen an Anbieter-Websites sind gesperrt; Lauf in Stufe 2 (Browser)");

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "ergebnis_stufe1_browser.json"), JSON.stringify({ results, axe: { kandidat: kand, live }, vnu: { kandidat: vk, live: vl } }, null, 1));
  fs.rmSync(stand, { recursive: true, force: true });
  const n = s => results.filter(r => r.status === s).length;
  console.log(`\n${n("PASS")} PASS · ${n("FAIL")} FAIL · ${n("SOLL-OFFEN")} SOLL-OFFEN`);
  process.exit(n("FAIL") ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
