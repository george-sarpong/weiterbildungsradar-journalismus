// Paket 9 – Tests für app-v37.js und die HTML-Seiten (Owner-Entscheide E086–E091 zu den Befunden Paket 8)
// Aufruf (im Repo-Root): TZ=Europe/Zurich NODE_PATH=<ordner>/node_modules node claude-work/paket9/tests/test_app_v37.js
// Stichtag fest 2026-11-09 (überschreibbar mit STICHTAG=YYYY-MM-DD). Braucht python3 für die Reproduktionsprüfung.
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), crypto = require("crypto");
const { execFileSync } = require("child_process");
const { JSDOM } = require("jsdom");

const ROOT = process.cwd(), CW = path.join(ROOT, "claude-work");
const W7 = path.join(CW, "paket7/website"), W9 = path.join(CW, "paket9/website"), LIVE = path.join(CW, "live-snapshot-20261109"), P3 = path.join(CW, "paket3/out");
const read = p => fs.readFileSync(p, "utf8"), sha = s => crypto.createHash("sha256").update(s).digest("hex");
const APP36 = read(path.join(W7, "app-v36.js")), APP37 = read(path.join(W9, "app-v37.js"));
const IDX7 = read(path.join(W7, "index.html")), IDX9 = read(path.join(W9, "index.html"));
const DATA_JS = read(path.join(W7, "data-p7.js"));
const DATA = JSON.parse(DATA_JS.slice(DATA_JS.indexOf("["), DATA_JS.lastIndexOf("]") + 1));
const SMART_JS = `window.MEDIA_SKILLS_SMART_DATA = ${read(path.join(P3, "merge_kandidat_smart.json"))};`;
const T = process.env.STICHTAG || "2026-11-09";
const strip = html => html.replace(/<script src="[^"]+"><\/script>/g, "");
function load(app, index, { url = "https://mediaskills.ch/" } = {}) {
  const dom = new JSDOM(strip(index), { url, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.eval(`(() => { const R = Date; const F = new R("${T}T12:00:00").getTime();
    class D extends R { constructor(...a) { a.length ? super(...a) : super(F); } static now() { return F; } }
    window.Date = D; })();`);
  w.eval(DATA_JS); w.eval(SMART_JS); w.eval(app);
  return w;
}
const txt = n => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
const cards = w => [...w.document.querySelectorAll("#cards article.card")].map(a => ({
  id: a.dataset.offerId,
  facts: Object.fromEntries([...a.querySelectorAll(".fact-item")].map(f => [txt(f.querySelector("dt")), txt(f.querySelector("dd"))])),
  badges: [...a.querySelectorAll(".badges .badge")].map(txt), access: txt(a.querySelector(".access")),
  links: [...a.querySelectorAll("a.source-link")].map(l => ({ text: txt(l), aria: l.getAttribute("aria-label"), href: l.getAttribute("href") })),
  rest: [".provider", "h3", ".card-description", ".checked", ".feedback-link"].map(s => (a.querySelector(s) || {}).outerHTML)
}));
const smart = (w, q) => { const d = w.document; d.querySelector("#smartInput").value = q;
  d.querySelector("#smartSearchForm").dispatchEvent(new w.Event("submit", { cancelable: true }));
  return { summary: txt(d.querySelector("#smartSummary")), html: d.querySelector("#smartResults").innerHTML,
    cards: [...d.querySelectorAll("#smartResults .smart-result-card")].map(c => ({ title: txt(c.querySelector("h3")), provider: txt(c.querySelector(".smart-result-provider")),
      meta: [...c.querySelectorAll(".smart-result-meta span")].map(txt), fit: txt(c.querySelector(".smart-fit")), budget: [...c.querySelectorAll(".smart-budget")].map(txt).join(" // "),
      links: [...c.querySelectorAll("a.source-link")].map(l => ({ text: txt(l), aria: l.getAttribute("aria-label") })) })) }; };

const results = [];
const check = (id, name, ok, detail = "") => { results.push({ id, ok }); console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail ? " – " + detail : ""}`); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- Unabhängige Referenz der Übersetzung (separat formuliert)
const REF_CODES = { NOT_PUBLISHED: "nicht erfasst", NICHT_PUBLIZIERT: "nicht erfasst", ON_REQUEST: "auf Anfrage", SUR_DEMANDE: "auf Anfrage",
  FUTURE_BOOKABLE: "buchbar", NO_FREE_PLACES: "ausgebucht", NICHT_VERIFIZIERT_CURRENT_RECHECK: "nicht verifiziert" };
const RAW = /\b[A-Z]{2,}(?:_[A-Z]+)+\b/g;
const refText = s => String(s).replace(RAW, c => REF_CODES[c] || c);
const hasPlaceholder = v => /(^|\|)\s*(NICHT_PUBLIZIERT|NOT_PUBLISHED)\s*($|\|)/.test(String(v ?? ""));
const norm = s => String(s ?? "").toLowerCase();
const byId = Object.fromEntries(DATA.map(o => [o.id, o]));

const W36 = load(APP36, IDX7), W37 = load(APP37, IDX9), C36 = cards(W36), C37 = cards(W37);

// ---- Reproduzierbarkeit und Änderungsumfang
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "p9-"));
  execFileSync("python3", ["-I", path.join(CW, "paket9/scripts/port_app_v37.py"), path.join(W7, "app-v36.js"), path.join(tmp, "app-v37.js")]);
  execFileSync("python3", ["-I", path.join(CW, "paket9/scripts/port_html_p9.py"), W7, LIVE, tmp]);
  const files = ["app-v37.js", "index.html", "methodik.html", "datenschutz.html", "impressum.html", "404.html"];
  const bad = files.filter(f => sha(read(path.join(tmp, f))) !== sha(read(path.join(W9, f))));
  check("N01", "Port-Skripte reproduzieren app-v37.js und 5 HTML-Seiten byte-identisch", bad.length === 0, bad.join(", "));
  const diffLines = (a, b) => { const x = a.split("\n"), y = b.split("\n"); return x.length === y.length ? x.filter((l, i) => l !== y[i]).length : -1; };
  const src = { "index.html": IDX7, "methodik.html": read(path.join(W7, "methodik.html")), "datenschutz.html": read(path.join(LIVE, "datenschutz.html")), "impressum.html": read(path.join(LIVE, "impressum.html")), "404.html": read(path.join(LIVE, "404.html")) };
  const expect = { "index.html": 1, "methodik.html": 2, "datenschutz.html": 1, "impressum.html": 1, "404.html": 1 };
  const off = Object.keys(src).filter(f => { const now = read(path.join(W9, f));
    return diffLines(src[f], now) !== expect[f] || !same(src[f].match(/<script src="[^"]+">/g), now.match(/<script src="[^"]+">/g)); });
  check("N02", "HTML nur an den vorgesehenen Zeilen geändert (Logo-Link, Methodik-Satz), Skript-Verweise unverändert", off.length === 0, off.join(", "));
  const noLabel = Object.keys(src).every(f => { const h = read(path.join(W9, f)); return /<a class="brand brand-link" href="https:\/\/mediaskills\.ch\/">/.test(h) && !/brand-link"[^>]*aria-label/.test(h); });
  check("N03", "E089: Logo-Link auf allen 5 Seiten ohne abweichenden Namen (Name = sichtbarer Text «Media Skills»)", noLabel);
}

// ---- Karten: gleiche Menge und Reihenfolge, Änderungen nur gemäss E086/E087/E089
check("N04", "Sichtbare Menge und Standardreihenfolge identisch mit v36", same(C36.map(c => c.id), C37.map(c => c.id)), `${C37.length} Karten`);
{
  const bad = [];
  C37.forEach((c, i) => {
    const o = byId[c.id], a = C36[i], f = c.facts, g = a.facts;
    const priceCode = !String(o.priceDisplay ?? "").trim() || o.priceCategory === "PREIS_NICHT_PUBLIZIERT" || norm(o.priceDisplay).includes("nicht_publiziert");
    const exp = {
      Preis: priceCode ? "nicht erfasst" : g.Preis,
      Durchführung: hasPlaceholder(o.format) ? g.Durchführung.replace(/Nicht publiziert/g, "nicht erfasst") : g.Durchführung,
      Dauer: refText(g.Dauer), Start: refText(g.Start)
    };
    if (!same(f, exp)) bad.push(`${c.id} Fakten`);
    const eb = a.badges.map((b, k) => k === 1 && hasPlaceholder(o.level) ? b.replace("Nicht publiziert", "nicht erfasst")
      : k === 2 && hasPlaceholder(o.language) ? b.replace(/Nicht publiziert/g, "nicht erfasst") : k === 3 ? refText(b) : b);
    if (!same(c.badges, eb)) bad.push(`${c.id} Badges`);
    const ea = String(o.access ?? "").trim() ? a.access : "Zugang: nicht erfasst";
    if (c.access !== ea) bad.push(`${c.id} Zugang`);
    if (!same(c.rest, a.rest) || !same(c.links.map(l => [l.text, l.href]), a.links.map(l => [l.text, l.href]))) bad.push(`${c.id} übrige Teile`);
  });
  check("N05", "Karten identisch mit v36 ausser: Rohcodes übersetzt (E086), Code-Platzhalter «nicht erfasst» (E087); unabhängige Referenz", bad.length === 0, bad.slice(0, 4).join(", "));
  const raw = C37.flatMap(c => [...Object.values(c.facts), ...c.badges, c.access].filter(v => RAW.test(v) && (RAW.lastIndex = 0, true)).map(v => `${c.id} «${v}»`));
  RAW.lastIndex = 0;
  const changed = C37.filter((c, i) => !same(c.facts, C36[i].facts) || !same(c.badges, C36[i].badges) || c.access !== C36[i].access).length;
  check("N06", "D5: keine Rohcodes mehr auf den Karten", raw.length === 0, raw.length ? raw.slice(0, 3).join("; ") : `${changed} Karten geändert`);
  const dataUnchanged = DATA.filter(o => /NOT_PUBLISHED|ON_REQUEST|SUR_DEMANDE|FUTURE_BOOKABLE|NO_FREE_PLACES|NICHT_VERIFIZIERT/.test(JSON.stringify([o.duration, o.start, o.region, o.sessions]))).length;
  check("N07", "Daten unverändert: Rohcodes bleiben im Datensatz (keine stille Überschreibung), nur die Anzeige übersetzt", dataUnchanged > 0 && sha(DATA_JS) === sha(read(path.join(W7, "data-p7.js"))), `${dataUnchanged} Datensätze mit Codes`);
}
{
  const opts = (w, sel) => [...w.document.querySelectorAll(`${sel} option`)].map(o => [o.value, txt(o)]);
  const sels = ["#formatFilter", "#levelFilter", "#languageFilter", "#priceFilter"].filter(s => W37.document.querySelector(s));
  const diff = sels.flatMap(s => { const a = opts(W36, s), b = opts(W37, s);
    return a.length !== b.length ? [`${s} Anzahl`] : a.map((x, k) => [x, b[k]]).filter(([x, y]) => x[0] !== y[0] || (x[1] !== y[1] && !(/^(Nicht publiziert|Preis nicht publiziert)$/.test(x[1]) && /^(nicht erfasst|Preis nicht erfasst)$/.test(y[1])))).map(([x, y]) => `${s}: ${x[1]}→${y[1]}`); });
  const renamed = sels.flatMap(s => opts(W37, s).filter(([, t]) => /nicht erfasst/.test(t)).map(([v]) => `${s}=${v}`));
  const counts = renamed.every(r => { const [s, v] = r.split("="); const n = w => { const x = w.document.querySelector(s); x.value = v; x.dispatchEvent(new w.Event("input", { bubbles: true })); const k = cards(w).length; x.value = ""; x.dispatchEvent(new w.Event("input", { bubbles: true })); return k; }; return n(W36) === n(W37); });
  check("N08", "Filter: Werte unverändert, nur Platzhalter-Bezeichnungen «nicht erfasst»; gleiche Trefferzahlen je Option", sels.length >= 3 && diff.length === 0 && renamed.length > 0 && counts, `${renamed.join(", ")}`);
}
{
  const links = [...C37.flatMap(c => c.links), ...["Datenjournalismus, CHF 800", "Podcast", "KI im Journalismus, Zürich"].flatMap(q => smart(W37, q).cards.flatMap(c => c.links))];
  const bad = links.filter(l => !l.aria || !l.aria.startsWith(l.text.replace(/\s*↗$/, "")));
  check("N09", "E089: Name jedes Angebotslinks beginnt mit dem sichtbaren Text (Karten und Smart-Suche)", links.length >= C37.length && bad.length === 0, `${links.length} Links${bad.length ? "; " + bad[0].aria : ""}`);
}
// ---- Smart-Suche: gleiche Ergebnisse, ohne Optionsnummer
{
  const qs = ["Datenjournalismus, CHF 800, 2 Tage", "kostenlos", "Videojournalismus, 3 Tage", "Moderation, 1000 Euro", "500 Euro", "KI im Journalismus, Zürich", "Mobile Reporting, unter CHF 300", "Podcast"];
  // Referenz: Rohcodes übersetzt; Preis (meta 0) und Durchführung (meta 1) als «nicht erfasst», wenn der Datensatz einen Platzhaltercode trägt (E087)
  const offerOf = c => DATA.find(o => o.title === c.title && o.provider === c.provider) || {};
  const priceCodeOf = o => !String(o.priceDisplay ?? "").trim() || o.priceCategory === "PREIS_NICHT_PUBLIZIERT" || norm(o.priceDisplay).includes("nicht_publiziert");
  const refMeta = (c, v36) => c.meta.map((m, j) => {
    if (!v36) return m;
    const o = offerOf(c);
    if (j === 0 && m === "Nicht publiziert" && priceCodeOf(o)) return "nicht erfasst";
    if (j === 1 && hasPlaceholder(o.format)) return m.replace(/Nicht publiziert/g, "nicht erfasst");
    return refText(m);
  });
  const strip2 = (r, v36) => ({ s: r.summary, c: r.cards.map(c => ({ t: c.title, p: c.provider, m: refMeta(c, v36), f: c.fit, b: c.budget })) });
  const detail = [];
  const diff = qs.filter(q => { const a = strip2(smart(W36, q), true), b = strip2(smart(W37, q), false);
    if (!same(a, b)) a.c.forEach((c, i) => c.m.forEach((m, j) => { if (b.c[i] && m !== b.c[i].m[j]) detail.push(`${q}: «${m}» → «${b.c[i].m[j]}»`); }));
    return !same(a, b); });
  if (process.env.DEBUG) console.log(detail.join("\n"));
  const rank = qs.filter(q => /smart-result-rank|>Option \d/.test(smart(W37, q).html));
  check("N10", `Smart-Suche: gleiche Treffer, Texte und Reihenfolge wie v36, Rohcodes übersetzt, Code-Platzhalter «nicht erfasst» (${qs.length} Anfragen)`, diff.length === 0, diff.join("; "));
  check("N11", "E090: keine Nummer «Option 1–3» auf Smart-Karten; Zusammenfassung «Hier sind n Optionen» bleibt", rank.length === 0 && /Hier sind 3 Optionen/.test(smart(W37, "Podcast").summary), rank.join("; "));
}
// ---- Adresse: kein ?q= mehr, alte Links funktionieren (E091)
{
  const w = load(APP37, IDX9); const s = w.document.querySelector("#searchInput");
  s.value = "Podcast"; s.dispatchEvent(new w.Event("input", { bubbles: true }));
  const typed = !/[?&]q=/.test(w.location.href);
  const fp = w.document.querySelector("#formatFilter"); fp.value = "HYBRID"; fp.dispatchEvent(new w.Event("input", { bubbles: true }));
  const otherKept = /format=HYBRID/.test(w.location.href) && !/[?&]q=/.test(w.location.href);
  const url = "https://mediaskills.ch/?q=Podcast&format=HYBRID";
  const a = load(APP36, IDX7, { url }), b = load(APP37, IDX9, { url });
  const old = b.document.querySelector("#searchInput").value === "Podcast" && same(cards(a).map(c => c.id), cards(b).map(c => c.id)) && cards(b).length > 0;
  check("N12", "E091: Katalogsuche schreibt den Suchtext nicht in die Adresse; andere Filter bleiben in der Adresse; alte Links mit ?q= liefern dieselben Treffer wie v36",
    typed && otherKept && old, `${w.location.href}; alter Link ${cards(b).length} Treffer`);
}
// ---- Gegenproben
{
  const a1 = APP37.replace('ON_REQUEST: "auf Anfrage", ', "");
  const leak = cards(load(a1, IDX9)).some(c => /ON_REQUEST/.test(c.badges[3]));
  check("G01", "Gegenprobe: ohne Übersetzung von ON_REQUEST erscheint der Rohcode wieder und wird erkannt", a1 !== APP37 && leak);
  const d = JSON.parse(JSON.stringify(DATA)); const o = d.find(x => byId[x.id] && C37.some(c => c.id === x.id)); o.duration = "FOO_BAR_CODE";
  const w = new JSDOM(strip(IDX9), { url: "https://mediaskills.ch/", runScripts: "outside-only", pretendToBeVisual: true }).window;
  w.eval(`(() => { const R = Date; const F = new R("${T}T12:00:00").getTime(); class D extends R { constructor(...a) { a.length ? super(...a) : super(F); } static now() { return F; } } window.Date = D; })();`);
  w.eval(`window.WEITERBILDUNGSRADAR_OFFERS = ${JSON.stringify(d)};`); w.eval(SMART_JS); w.eval(APP37);
  const shown = cards(w).find(c => c.id === o.id);
  check("G02", "Gegenprobe: unbekannter Code wird nicht still ersetzt, sondern bleibt sichtbar (Test D5 meldet ihn)", shown && shown.facts.Dauer === "FOO_BAR_CODE");
  const a3 = APP37.replace("    // E091 (E056): Suchtext nicht in die Adresse schreiben; applyUrlState liest alte Links mit ?q= weiter.\n", '    if (filter.queryRaw) params.set("q", filter.queryRaw);\n');
  const w3 = load(a3, IDX9); const s3 = w3.document.querySelector("#searchInput"); s3.value = "Podcast"; s3.dispatchEvent(new w3.Event("input", { bubbles: true }));
  check("G03", "Gegenprobe: mit ?q=-Schreiben würde N12 anschlagen", a3 !== APP37 && /[?&]q=Podcast/.test(w3.location.href));
}

const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} PASS (Stichtag ${T})`);
process.exit(failed ? 1 : 0);
