// Paket 12 – Testsatz Stufe 2 (Vorabprüfung im Browser) auf dem lokalen Prüfstand des Website-Kandidaten Paket 10.
// Kriterien (Vorlage §2, Bericht Paket 8 §8): D5 Browser-Teil, D8, F9 Browser-Teil, F11, S1, S2, S3, B2, T6, Länder-Badges (GESAMTWISSENSSTAND §9).
// Prüfstand wie Paket 8: Live-Snapshot Paket A + paket10/website + paket7/website/data-p7.js + Smart-Daten des Merge-Kandidaten.
// Kein Release-Paket (Projektregel 7). Datum = echtes Datum (Europe/Zurich).
// Aufruf (im Repo-Root): NODE_PATH=<tools>/node_modules CHROME=/usr/bin/google-chrome node claude-work/paket12/tests/test_stufe2_browser.js
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), http = require("http");
const { chromium } = require("playwright-core");
const CW = path.join(process.cwd(), "claude-work"), LIVE = path.join(CW, "live-snapshot-20261109");
// Prüfling wählbar (Paket 13): WEBSITE=claude-work/paket13/website APP=app-v39.js DATA=claude-work/paket13/website/data-p13.js OUTDIR=claude-work/paket13/out
const WEB = path.resolve(process.env.WEBSITE || path.join(CW, "paket10/website")), APPNAME = process.env.APP || "app-v38.js";
const DATAFILE = path.resolve(process.env.DATA || path.join(CW, "paket7/website/data-p7.js"));
const OUT = path.resolve(process.env.OUTDIR || path.join(CW, "paket12/out")), SHOT = path.join(OUT, "screenshots");
fs.mkdirSync(SHOT, { recursive: true });

function pruefstand() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p12-stand-"));
  for (const f of fs.readdirSync(LIVE)) if (!/^(SHA256SUMS|README)/.test(f)) fs.copyFileSync(path.join(LIVE, f), path.join(dir, f));
  for (const f of fs.readdirSync(WEB)) if (f !== "index.html" && !/^data-p\d+\.js$/.test(f)) fs.copyFileSync(path.join(WEB, f), path.join(dir, f));
  fs.copyFileSync(DATAFILE, path.join(dir, "data-p7.js"));
  fs.writeFileSync(path.join(dir, "smart-search-data-p7.js"), `window.MEDIA_SKILLS_SMART_DATA = ${fs.readFileSync(path.join(CW, "paket3/out/merge_kandidat_smart.json"), "utf8")};\n`);
  const idx = fs.readFileSync(path.join(WEB, "index.html"), "utf8")
    .replace('src="data-a1-86ff68ddc9ac.js"', 'src="data-p7.js"').replace('src="smart-search-data-a1-a38a2a2b2391.js"', 'src="smart-search-data-p7.js"').replace('src="app-v33.js"', `src="${APPNAME}"`);
  if (!idx.includes(`src="${APPNAME}"`) || !/src="data-p7\.js"/.test(idx)) throw new Error("Skript-Verweise im Prüfstand nicht ersetzt");
  fs.writeFileSync(path.join(dir, "index.html"), idx);
  return dir;
}
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".xml": "application/xml", ".txt": "text/plain", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };
const serve = dir => new Promise(res => {
  const srv = http.createServer((q, r) => {
    const p = path.join(dir, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/^\/$/, "/index.html"));
    if (!p.startsWith(dir) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end("404"); }
    r.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
  }).listen(0, "127.0.0.1", () => res(srv));
});

const results = [];
const check = (id, name, status, detail = "") => { results.push({ id, name, status, detail }); console.log(`${status} ${id} ${name}${detail ? " – " + detail : ""}`); };
const RAWCODE = /\b[A-Z]{2,}(?:_[A-Z0-9]+)+\b/g;
const OLDWORD = /nicht erfasst|nicht publiziert|Nicht publiziert/;
const COMPLETE = /(vollständige[rn]? (Markt|Übersicht|Abdeckung)(?! ?\.?$)|alle (Weiterbildungs)?angebote (der|in der) Schweiz|sämtliche (Angebote|Kurse)|lückenlos|komplette[rn]? (Übersicht|Markt))/i;
const SEARCHES = ["Datenjournalismus, CHF 800", "Moderation, 1000 Euro", "Video, CHF 500", "Podcast produzieren, online"];

(async () => {
  const stand = pruefstand();
  const srv = await serve(stand); const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", headless: true });
  const foreign = [], requests = [];
  const newPage = async (vp = { width: 1280, height: 900 }, extra = {}) => {
    const ctx = await browser.newContext({ viewport: vp, locale: "de-CH", timezoneId: "Europe/Zurich", ...extra });
    const page = await ctx.newPage();
    page.on("request", r => { requests.push(r.url()); if (!r.url().startsWith(base) && !r.url().startsWith("data:") && !r.url().startsWith("mailto:")) foreign.push(r.url()); });
    return { ctx, page };
  };
  const storageState = async (page, ctx) => ({ url: page.url(), cookies: await ctx.cookies(), docCookie: await page.evaluate(() => document.cookie),
    local: await page.evaluate(() => Object.fromEntries(Object.entries(localStorage))), session: await page.evaluate(() => Object.fromEntries(Object.entries(sessionStorage))) });

  // ---------- Desktop: Katalog, Smart-Suche, Datenschutz-Spuren ----------
  const { ctx, page } = await newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForSelector("#cards .card");
  const s0 = await storageState(page, ctx);
  const nCards = await page.$$eval("#cards .card", c => c.length);
  const countText = await page.$eval("#resultCount", e => e.textContent.trim());

  // D5 Browser-Teil: gerenderter Text aller Karten
  // Felder = Fakten, Zugang, Badges; die Beschreibung ist Datentext und wird separat gezählt (Hinweis, kein Feld).
  const cardTexts = await page.$$eval("#cards .card", cs => cs.map(c => ({ id: c.dataset.offerId,
    text: [...c.querySelectorAll(".facts, .access, .badges")].map(e => e.innerText).join("\n"),
    desc: ((c.querySelector(".card-description") || {}).innerText || "") })));
  const descOld = cardTexts.filter(c => /nicht (separat |belastbar |generalisiert )?publiziert|nicht erfasst/i.test(c.desc)).map(c => c.id);
  const raw = [], old = [], emptyFacts = [];
  for (const c of cardTexts) {
    const m = c.text.match(RAWCODE); if (m) raw.push(`${c.id}: ${[...new Set(m)].join(",")}`);
    if (OLDWORD.test(c.text)) old.push(c.id);
  }
  const ef = await page.$$eval("#cards .card .fact-item", fs => fs.filter(f => { const dd = f.querySelector("dd"); return !dd || !dd.innerText.trim(); }).length);
  const nKA = cardTexts.filter(c => /keine Angabe/.test(c.text)).length;
  check("D5", "Browser: gerenderte Karten ohne Rohcode, ohne leeres Feld, fehlende Angaben «keine Angabe»", raw.length === 0 && ef === 0 && old.length === 0 ? "PASS" : "FAIL",
    `${nCards} Karten · Rohcodes ${raw.length}${raw.length ? " (" + raw.slice(0, 8).join("; ") + ")" : ""} · leere Fakten ${ef} · alter Wortlaut ${old.length}${old.length ? " (" + old.slice(0, 8).join(", ") + ")" : ""} · Karten mit «keine Angabe» ${nKA} · Hinweis: Beschreibungstexte mit «nicht publiziert» ${descOld.length}`);
  fs.writeFileSync(path.join(OUT, "d5_beschreibung_nicht_publiziert.txt"), descOld.join("\n") + "\n");
  fs.writeFileSync(path.join(OUT, "d5_rohcodes_browser.txt"), raw.join("\n") + "\n");

  // Länder-Badges: drei Badges je Karte, nicht abgeschnitten, innerhalb der Karte
  const badgeCheck = async (pg, label) => pg.$$eval("#cards .card", cs => {
    const bad = []; let n = 0;
    for (const c of cs) {
      const cb = c.getBoundingClientRect();
      const bs = [...c.querySelectorAll(".badges .badge")].filter(b => /^(Ort|Anbieterland|CH-Zugang):/.test(b.textContent.trim()));
      if (bs.length !== 3) { bad.push(`${c.dataset.offerId}: ${bs.length} Länder-Badges`); continue; }
      n++;
      for (const b of bs) {
        const r = b.getBoundingClientRect(), cs2 = getComputedStyle(b);
        if (r.width === 0 || r.height === 0 || cs2.visibility === "hidden" || cs2.display === "none") bad.push(`${c.dataset.offerId}: ${b.textContent.trim()} unsichtbar`);
        else if (r.right > cb.right + 1 || r.left < cb.left - 1) bad.push(`${c.dataset.offerId}: ${b.textContent.trim()} ragt aus der Karte`);
        else if (b.scrollWidth > b.clientWidth + 1) bad.push(`${c.dataset.offerId}: ${b.textContent.trim()} abgeschnitten`);
      }
    }
    return { n, bad };
  });
  const bDesk = await badgeCheck(page, "Desktop");
  const nb = await page.$$eval("#cards .card", cs => { const t = (c, i) => c.querySelectorAll(".badges .badge")[i].textContent.trim();
    return { bare: cs.filter(c => t(c, 1) === "keine Angabe").length, niv: cs.filter(c => t(c, 1) === "Niveau: keine Angabe").length, lang: cs.filter(c => t(c, 2) === "keine Angabe").length }; });
  check("NB", "Niveau- und Sprach-Badge nie nur «keine Angabe» (E100, E102)", nb.bare === 0 && nb.lang === 0 ? "PASS" : "FAIL", `nur «keine Angabe» ${nb.bare} · «Niveau: keine Angabe» ${nb.niv} · Hinweis Sprach-Badge nur «keine Angabe» ${nb.lang}`);
  const badgeSamples = await page.$$eval("#cards .card", cs => cs.slice(0, 400).map(c => [...c.querySelectorAll(".badges .badge")].map(b => b.textContent.trim()).filter(t => /^(Ort|Anbieterland|CH-Zugang):/.test(t)).join(" | ")));
  const distinct = [...new Set(badgeSamples)].slice(0, 12);
  // Beispielkarten für Screenshots: AT, LI, Online, DJA (Anbieter DE, Ort CH?), Mediencampus
  const pick = await page.$$eval("#cards .card", cs => {
    const t = c => c.innerText;
    const f = re => { const c = cs.find(x => re.test(t(x))); return c ? c.dataset.offerId : null; };
    return { AT: f(/Ort: [^\n|]*Österreich/), LI: f(/Ort: [^\n|]*Liechtenstein/), Online: f(/Ort: Online/), AnbDE: f(/Anbieterland: Deutschland/), KA: f(/Anbieterland: keine Angabe/), Mediencampus: f(/Mediencampus/) };
  });
  for (const [k, id] of Object.entries(pick)) if (id) { const el = await page.$(`#cards .card[data-offer-id="${id}"]`); await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: path.join(SHOT, `karte_desktop_${k}_${id}.png`) }); }

  // F11: gerenderter Text Startseite
  const homeText = await page.evaluate(() => document.body.innerText);

  // S2 Katalogsuche
  await page.fill("#searchInput", "Datenjournalismus"); await page.waitForTimeout(600);
  const sCat = await storageState(page, ctx);
  await page.fill("#searchInput", ""); await page.waitForTimeout(300);

  // F9 + S2 Smart-Suche, Screenshots
  const smart = [];
  for (const q of SEARCHES) {
    await page.fill("#smartInput", q); await page.click(".smart-submit");
    await page.waitForFunction(() => document.querySelector("#smartStatus") && document.querySelector("#smartStatus").textContent.trim().length > 0);
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("#smartResults .smart-result-card")];
      const vis = c => { const b = c.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
      return { status: document.querySelector("#smartStatus").textContent.trim(), summary: (document.querySelector("#smartSummary") || {}).innerText || "",
        n: cards.length, visible: cards.filter(vis).length,
        reasons: cards.map(c => ((c.querySelector(".smart-fit") || {}).innerText || "").trim()),
        text: (document.querySelector("#smartOutput") || {}).innerText || "" };
    });
    const st = await storageState(page, ctx);
    const leak = [st.url, st.docCookie, JSON.stringify(st.local), JSON.stringify(st.session)].some(x => x.toLowerCase().includes(q.split(",")[0].toLowerCase()));
    smart.push({ q, ...r, leak });
    await page.$eval("#smartOutput", e => e.scrollIntoView());
    await page.screenshot({ path: path.join(SHOT, `smart_desktop_${q.replace(/[^A-Za-z0-9]+/g, "_")}.png`), fullPage: false });
  }
  const f9bad = smart.filter(s => s.n > 0 && (s.n > 3 || s.visible !== s.n || s.reasons.some(x => !x) || /\bOption \d|\bTop\b|Top-Empfehlung|Empfehlung/i.test(s.text)));
  check("F9", "Browser: Smart-Suche zeigt höchstens 3 sichtbare, begründete Karten ohne Nummer, «Top» oder «Empfehlung»", f9bad.length === 0 ? "PASS" : "FAIL",
    smart.map(s => `«${s.q}»: ${s.n} Karten, ${s.visible} sichtbar, Begründung ${s.reasons.filter(Boolean).length}/${s.n}`).join(" · "));

  // S2 Gesamt
  const catLeak = [sCat.url, sCat.docCookie, JSON.stringify(sCat.local), JSON.stringify(sCat.session)].some(x => /datenjournalismus/i.test(x));
  const smartLeak = smart.filter(s => s.leak).map(s => s.q);
  check("S2", "Browser: Suchtext (Katalog und Smart) nie in URL, Cookies, local- oder sessionStorage", !catLeak && smartLeak.length === 0 ? "PASS" : "FAIL",
    `Katalog-URL ${sCat.url.replace(base, "")} · Smart-Lecks ${smartLeak.length ? smartLeak.join(", ") : "keine"}`);

  // S3 Cookies und localStorage vor/nach Merken
  const before = await storageState(page, ctx);
  const favId = await page.$eval("#cards .card [data-favorite-id]", b => b.dataset.favoriteId);
  await page.click(`#cards [data-favorite-id="${favId}"]`); await page.waitForTimeout(200);
  const after = await storageState(page, ctx);
  const keysBefore = Object.keys(s0.local).concat(Object.keys(before.local)), keysAfter = Object.keys(after.local);
  const s3ok = s0.cookies.length === 0 && after.cookies.length === 0 && !after.docCookie && keysBefore.length === 0 &&
    keysAfter.length === 1 && keysAfter[0] === "weiterbildungsradar:favorites:v1" && Object.keys(after.session).length === 0;
  check("S3", "Browser: keine Cookies; localStorage erst nach Merken, nur weiterbildungsradar:favorites:v1", s3ok ? "PASS" : "FAIL",
    `Cookies ${after.cookies.length} · localStorage vor Merken ${JSON.stringify(keysBefore)} · nach Merken ${JSON.stringify(keysAfter)} = ${JSON.stringify(after.local)}`);
  await page.click(`#cards [data-favorite-id="${favId}"]`);

  // Filter durchklicken (für S1): Durchführungsort-Filter Werte
  const countryOpts = await page.$$eval("#countryFilter option", os => os.map(o => [o.value, o.textContent.trim()]));
  for (const [v] of countryOpts.slice(1)) { await page.selectOption("#countryFilter", v); await page.waitForTimeout(100); }
  await page.selectOption("#countryFilter", countryOpts[0][0]);
  await ctx.close();

  // ---------- Unterseiten: F11 und S1 ----------
  const pageTexts = { Startseite: homeText };
  for (const p of ["methodik.html", "datenschutz.html", "impressum.html", "gibt-es-nicht.html", "404.html"]) {
    const { ctx: c2, page: p2 } = await newPage();
    await p2.goto(`${base}/${p}`, { waitUntil: "load" });
    pageTexts[p] = await p2.evaluate(() => document.body.innerText);
    await c2.close();
  }
  for (const s of smart) pageTexts[`Smart «${s.q}»`] = s.text;
  const claims = [];
  for (const [k, t] of Object.entries(pageTexts)) {
    for (const line of t.split(/\n+/)) { if (COMPLETE.test(line) && !/kein(en)? Anspruch|nicht vollständig|keine Vollständigkeit|Haftung für Vollständigkeit/.test(line)) claims.push(`${k}: ${line.trim().slice(0, 140)}`); }
  }
  const vollTreffer = Object.entries(pageTexts).flatMap(([k, t]) => t.split(/\n+/).filter(l => /vollständig/i.test(l)).map(l => `${k}: ${l.trim().slice(0, 160)}`));
  check("F11", "Kein gerenderter Text behauptet vollständige Marktabdeckung", claims.length === 0 ? "PASS" : "FAIL",
    claims.length ? claims.join(" · ") : `Fundstellen «vollständig» (alle verneinend oder Filterbezug): ${vollTreffer.length}`);
  fs.writeFileSync(path.join(OUT, "f11_fundstellen_vollstaendig.txt"), vollTreffer.join("\n") + "\n");

  // ---------- D8 Anbietertext gekennzeichnet ----------
  {
    const { ctx: c3, page: p3 } = await newPage();
    await p3.goto(base + "/", { waitUntil: "load" }); await p3.waitForSelector("#cards .card");
    const d8 = await p3.$$eval("#cards .card", cs => {
      let withDesc = 0, labelled = 0, linked = 0;
      for (const c of cs) {
        const d = c.querySelector(".card-description"); if (!d || !d.innerText.trim()) continue; withDesc++;
        const around = (d.previousElementSibling ? d.previousElementSibling.innerText : "") + " " + d.innerText + " " + (d.getAttribute("aria-label") || "") + " " + (d.title || "");
        if (/Anbietertext|Anbieterbeschreibung|laut Anbieter|Quelle:/i.test(around)) labelled++;
        if (d.querySelector("a[href]")) linked++;
      }
      return { withDesc, labelled, linked };
    });
    const methodik = pageTexts["methodik.html"];
    const methodikHinweis = methodik.split(/\n+/).filter(l => /Beschreibung|Anbietertext|Kurztext/i.test(l)).map(l => l.trim().slice(0, 160));
    check("D8", "Anbietertext als Snippet mit Quellenlink gekennzeichnet (E038)", process.env.NO_D8 ? "ENTFÄLLT (E105)" : d8.labelled === d8.withDesc && d8.withDesc > 0 ? "PASS" : "FAIL",
      `${d8.withDesc} Karten mit Beschreibung · gekennzeichnet ${d8.labelled} · Quellenlink in der Beschreibung ${d8.linked} · Methodik-Hinweis: ${methodikHinweis.length ? methodikHinweis.join(" / ") : "keiner"}`);
    await c3.close();
  }

  // ---------- B2 Tastatur ----------
  {
    const { ctx: c4, page: p4 } = await newPage();
    await p4.goto(base + "/", { waitUntil: "load" }); await p4.waitForSelector("#cards .card");
    const seen = [], problems = [];
    for (let i = 0; i < 70; i++) {
      await p4.keyboard.press("Tab");
      await p4.waitForTimeout(450); // html { scroll-behavior: smooth } – Scrollen abwarten
      const info = await p4.evaluate(() => {
        const e = document.activeElement; if (!e || e === document.body) return null;
        const r = e.getBoundingClientRect(), s = getComputedStyle(e);
        const visibleFocus = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== "none");
        const cx = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1), cy = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
        const top = document.elementFromPoint(cx, cy);
        const obscured = !(top && (top === e || e.contains(top) || top.contains(e) || (e.labels && [...e.labels].some(l => l.contains(top)))));
        const inView = r.bottom > 0 && r.top < innerHeight;
        return { tag: e.tagName.toLowerCase(), id: e.id, cls: (e.className && e.className.baseVal === undefined ? e.className : "").toString().slice(0, 40),
          name: (e.getAttribute("aria-label") || e.innerText || e.value || "").trim().slice(0, 50), visibleFocus, obscured, inView, w: r.width, h: r.height };
      });
      if (!info) continue;
      seen.push(info);
      if (!info.visibleFocus) problems.push(`Fokus nicht sichtbar: ${info.tag}#${info.id}.${info.cls} «${info.name}»`);
      if (info.obscured || !info.inView) problems.push(`Fokus verdeckt/ausserhalb: ${info.tag}#${info.id}.${info.cls} «${info.name}»`);
    }
    const ids = new Set(seen.map(s => s.id));
    const need = ["smartInput", "searchInput", "focusFilter", "typeFilter", "priceFilter", "formatFilter", "languageFilter", "countryFilter", "levelFilter", "sortSelect", "favoritesToggle"];
    const missing = need.filter(n => !ids.has(n));
    const reachedFav = seen.some(s => /favorite-button/.test(s.cls)), reachedOffer = seen.some(s => /source-link/.test(s.cls));
    // Bedienung: Smart-Suche per Enter, Merken per Leertaste, Filter per Pfeiltaste
    await p4.focus("#smartInput"); await p4.keyboard.type("Datenjournalismus, CHF 800"); await p4.keyboard.press("Enter");
    await p4.waitForTimeout(400);
    const smartOk = await p4.$$eval("#smartResults .smart-result-card", c => c.length > 0);
    await p4.focus("#cards [data-favorite-id]"); await p4.keyboard.press("Space"); await p4.waitForTimeout(150);
    const favOk = await p4.$eval("#cards [data-favorite-id]", b => b.getAttribute("aria-pressed") === "true");
    const cnt0 = await p4.$eval("#resultCount", e => e.textContent);
    await p4.focus("#countryFilter"); await p4.keyboard.press("ArrowDown"); await p4.waitForTimeout(200);
    const cnt1 = await p4.$eval("#resultCount", e => e.textContent);
    const filterOk = cnt0 !== cnt1;
    const uniqProblems = [...new Set(problems)];
    check("B2", "Tastatur: Suche, Filter, Sortierung, Merkliste erreichbar und bedienbar; Fokus sichtbar und nicht verdeckt (2.4.7, 2.4.11)",
      missing.length === 0 && reachedFav && reachedOffer && smartOk && favOk && filterOk && uniqProblems.length === 0 ? "PASS" : "FAIL",
      `${seen.length} Tab-Stopps · fehlend: ${missing.length ? missing.join(", ") : "keine"} · Merken erreicht ${reachedFav} · Angebotslink erreicht ${reachedOffer} · Enter Smart ${smartOk} · Leertaste Merken ${favOk} · Pfeiltaste Filter ${filterOk} · Probleme ${uniqProblems.length}${uniqProblems.length ? ": " + uniqProblems.slice(0, 6).join("; ") : ""}`);
    fs.writeFileSync(path.join(OUT, "b2_tabfolge.json"), JSON.stringify(seen, null, 1));
    await c4.close();
  }

  // ---------- T6 Handy hoch/quer, Desktop + Länder-Badges mobil ----------
  const vps = [["Handy hoch", { width: 390, height: 844 }, true], ["Handy quer", { width: 844, height: 390 }, true], ["Tablet hoch", { width: 768, height: 1024 }, true], ["Desktop", { width: 1280, height: 900 }, false]];
  const t6 = [], badgeMobile = [];
  for (const [name, vp, mobile] of vps) {
    for (const p of ["/", "/methodik.html", "/datenschutz.html", "/impressum.html"]) {
      const { ctx: c5, page: p5 } = await newPage(vp, mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {});
      await p5.goto(base + p, { waitUntil: "load" });
      if (p === "/") { await p5.waitForSelector("#cards .card"); await p5.fill("#smartInput", "Datenjournalismus, CHF 800"); await p5.click(".smart-submit"); await p5.waitForTimeout(400); }
      const ov = await p5.evaluate(() => {
        const vw = document.documentElement.clientWidth, over = [];
        for (const e of document.querySelectorAll("body *")) {
          const r = e.getBoundingClientRect(); if (r.width === 0 || r.height === 0) continue;
          const s = getComputedStyle(e); if (s.position === "fixed" && r.right <= vw + 1) continue;
          let clipped = false; for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === "auto" || o === "scroll" || o === "hidden") { clipped = true; break; } }
          if (!clipped && (r.right > vw + 1 || r.left < -1)) over.push(`${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}${e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : ""}`);
        }
        return { vw, sw: document.documentElement.scrollWidth, over: [...new Set(over)].slice(0, 6) };
      });
      t6.push({ name, p, ...ov });
      if (p === "/") {
        await p5.screenshot({ path: path.join(SHOT, `t6_${name.replace(/ /g, "_")}_start.png`) });
        const card = await p5.$("#cards .card"); await card.scrollIntoViewIfNeeded(); await p5.screenshot({ path: path.join(SHOT, `t6_${name.replace(/ /g, "_")}_karte.png`) });
        const smartEl = await p5.$("#smartOutput"); if (smartEl) { await smartEl.scrollIntoViewIfNeeded(); await p5.screenshot({ path: path.join(SHOT, `t6_${name.replace(/ /g, "_")}_smart.png`) }); }
        if (mobile) { const b = await badgeCheck(p5, name); badgeMobile.push({ name, ...b }); }
      } else if (name === "Handy hoch") await p5.screenshot({ path: path.join(SHOT, `t6_${name.replace(/ /g, "_")}_${p.slice(1, -5)}.png`), fullPage: true });
      await c5.close();
    }
  }
  const t6bad = t6.filter(x => x.sw > x.vw + 1 || x.over.length);
  check("T6", "Handy hoch/quer, Tablet, Desktop: keine horizontal abgeschnittenen Inhalte (Start mit Smart-Ergebnis, Methodik, Datenschutz, Impressum)", t6bad.length === 0 ? "PASS" : "FAIL",
    t6bad.length ? t6bad.map(x => `${x.name} ${x.p}: Breite ${x.sw}/${x.vw} ${x.over.join(",")}`).join(" · ") : `${t6.length} Ansichten geprüft, Screenshots in out/screenshots`);
  const allBadgeBad = bDesk.bad.concat(...badgeMobile.map(b => b.bad.map(x => `${b.name}: ${x}`)));
  check("LB", "Länder-Badges Ort / Anbieterland / CH-Zugang: je Karte genau drei, sichtbar, nicht abgeschnitten (Desktop, Handy hoch/quer, Tablet)", allBadgeBad.length === 0 ? "PASS" : "FAIL",
    `Desktop ${bDesk.n} Karten; ${badgeMobile.map(b => `${b.name} ${b.n}`).join(", ")} · Befunde ${allBadgeBad.length}${allBadgeBad.length ? ": " + allBadgeBad.slice(0, 6).join("; ") : ""} · Beispiele: ${distinct.slice(0, 6).join(" ‖ ")}`);

  // ---------- S1 ----------
  check("S1", "Netzwerk: alle Anfragen (Laden, Katalogsuche, Smart-Suche, Filter, Merken, Unterseiten, Handy) nur an die eigene Herkunft", foreign.length === 0 ? "PASS" : "FAIL",
    `${requests.length} Anfragen, fremd ${foreign.length}${foreign.length ? ": " + [...new Set(foreign)].slice(0, 6).join(", ") : ""}`);

  await browser.close(); srv.close();
  fs.writeFileSync(path.join(OUT, "stufe2_browser.json"), JSON.stringify({ datum: new Date().toISOString(), sichtbar: countText, karten: nCards, beispiele: pick, laenderBadges: distinct, smart, t6, results }, null, 1));
  const fail = results.filter(r => r.status === "FAIL").length;
  console.log(`\nStufe 2 lokal: ${results.filter(r => r.status === "PASS").length} PASS, ${fail} FAIL (${countText})`);
  fs.rmSync(stand, { recursive: true, force: true });
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
