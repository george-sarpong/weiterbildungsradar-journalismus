// Paket 10 – Tests für app-v38.js und methodik.html (Owner-Entscheid E093: fehlende Angaben als «keine Angabe»)
// Aufruf (im Repo-Root): TZ=Europe/Zurich NODE_PATH=<ordner>/node_modules node claude-work/paket10/tests/test_app_v38.js
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), crypto = require("crypto");
const { execFileSync } = require("child_process");
const { JSDOM } = require("jsdom");

const CW = path.join(process.cwd(), "claude-work");
const W7 = path.join(CW, "paket7/website"), W9 = path.join(CW, "paket9/website"), W10 = path.join(CW, "paket10/website"), P3 = path.join(CW, "paket3/out");
const read = p => fs.readFileSync(p, "utf8"), sha = s => crypto.createHash("sha256").update(s).digest("hex");
const APP37 = read(path.join(W9, "app-v37.js")), APP38 = read(path.join(W10, "app-v38.js")), IDX = read(path.join(W10, "index.html"));
const DATA_JS = read(path.join(W7, "data-p7.js"));
const SMART_JS = `window.MEDIA_SKILLS_SMART_DATA = ${read(path.join(P3, "merge_kandidat_smart.json"))};`;
const T = process.env.STICHTAG || "2026-11-09";
function load(app, { data = DATA_JS } = {}) {
  const w = new JSDOM(IDX.replace(/<script src="[^"]+"><\/script>/g, ""), { url: "https://mediaskills.ch/", runScripts: "outside-only", pretendToBeVisual: true }).window;
  w.eval(`(() => { const R = Date; const F = new R("${T}T12:00:00").getTime();
    class D extends R { constructor(...a) { a.length ? super(...a) : super(F); } static now() { return F; } } window.Date = D; })();`);
  w.eval(data); w.eval(SMART_JS); w.eval(app);
  return w;
}
const txt = n => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
const cards = w => [...w.document.querySelectorAll("#cards article.card")].map(a => ({ id: a.dataset.offerId,
  facts: [...a.querySelectorAll(".fact-item")].map(f => [txt(f.querySelector("dt")), txt(f.querySelector("dd"))]),
  badges: [...a.querySelectorAll(".badges .badge")].map(txt), access: txt(a.querySelector(".access")), html: a.querySelector("h3").outerHTML + (a.querySelector(".card-description") || {}).outerHTML }));
const smart = (w, q) => { const d = w.document; d.querySelector("#smartInput").value = q;
  d.querySelector("#smartSearchForm").dispatchEvent(new w.Event("submit", { cancelable: true }));
  return { s: txt(d.querySelector("#smartSummary")), out: txt(d.querySelector("#smartOutput")),
    c: [...d.querySelectorAll("#smartResults .smart-result-card")].map(c => ({ t: txt(c.querySelector("h3")), m: [...c.querySelectorAll(".smart-result-meta span")].map(txt), b: [...c.querySelectorAll(".smart-budget")].map(txt).join(" // "), f: txt(c.querySelector(".smart-fit")) })) }; };
const results = [];
const check = (id, name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail ? " – " + detail : ""}`); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- Unabhängige Referenz (anders formuliert als die App): erst Platzhalter, dann Satzteile «… nicht/kein … publiziert»
const K = "keine Angabe";
const placeholders = s => s.replace(/^Preis nicht erfasst$/, `Preis: ${K}`).replace(/\bnicht erfasst\b/g, K).replace(/^Nicht publiziert$/, K)
  .replace(/^Nächster Termin nicht publiziert$/, `Nächster Termin: ${K}`).replace(/^Nächste Ausgabe nicht publiziert$/, `Nächste Ausgabe: ${K}`)
  .replace(/^Bereits begonnen; nächster Start nicht publiziert$/, `Bereits begonnen; nächster Start: ${K}`);
const SEP = /(\s*;\s*|\s+\/\s+|,\s+)/;
const refSentence = (s, field) => s.split(SEP).map((seg, i) => {
  if (SEP.test(seg) && !/\w/.test(seg)) return seg;
  let m = /^(.*?)\s*(?:noch )?nicht (?:separat )?publiziert\.?(\s*\([^)]*\))?$/i.exec(seg) || /^kein(?:e|en|er|es)? (.+?) publiziert\.?(\s*\([^)]*\))?$/i.exec(seg);
  if (!m) return seg;
  let subj = m[1].trim(); const tail = m[2] || "";
  if (!subj || subj.toLowerCase() === field.toLowerCase()) return K + tail;
  if (i === 0) subj = subj[0].toUpperCase() + subj.slice(1);
  return `${subj}: ${K}${tail}`;
}).join("");
const refFact = ([dt, dd]) => [dt, ["Dauer", "Start"].includes(dt) ? refSentence(placeholders(dd), dt) : placeholders(dd)];
const refBadge = (b, k) => k === 3 ? (() => { const [, rest] = b.match(/^Ort: (.*)$/); const [base, ...reg] = rest.split(" · ");
  return `Ort: ${placeholders(base)}${reg.length ? " · " + refSentence(reg.join(" · "), "") : ""}`; })() : placeholders(b.replace(/^(Anbieterland|CH-Zugang): nicht erfasst$/, `$1: ${K}`));

const W37 = load(APP37), W38 = load(APP38), C37 = cards(W37), C38 = cards(W38);
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "p10-"));
  execFileSync("python3", ["-I", path.join(CW, "paket10/scripts/port_p10.py"), W9, tmp]);
  check("P01", "Port-Skript reproduziert app-v38.js und methodik.html byte-identisch",
    ["app-v38.js", "methodik.html"].every(f => sha(read(path.join(tmp, f))) === sha(read(path.join(W10, f)))));
  check("P02", "Übrige Seiten = Paket 9 (index, datenschutz, impressum, 404)", ["index.html", "datenschutz.html", "impressum.html", "404.html"].every(f => sha(read(path.join(W9, f))) === sha(read(path.join(W10, f)))));
}
check("P03", "Sichtbare Menge und Reihenfolge identisch mit v37", same(C37.map(c => c.id), C38.map(c => c.id)), `${C38.length} Karten`);
{
  const bad = [];
  C38.forEach((c, i) => { const a = C37[i];
    if (!same(c.facts, a.facts.map(refFact))) bad.push(`${c.id} Fakten`);
    if (!same(c.badges, a.badges.map(refBadge))) bad.push(`${c.id} Badges`);
    if (c.access !== a.access.replace(/^Zugang: (nicht erfasst|Nicht publiziert)$/, `Zugang: ${K}`)) bad.push(`${c.id} Zugang`);
    if (c.html !== a.html) bad.push(`${c.id} Titel/Text`); });
  const changed = C38.filter((c, i) => !same(c, C37[i])).length;
  check("P04", "Karten = v37 ausser Wortlaut fehlender Angaben (unabhängige Referenz)", bad.length === 0, bad.length ? bad.slice(0, 4).join(", ") : `${changed} Karten geändert`);
}
const uiText = w => txt(w.document.body);
{
  const pages = ["index.html", "methodik.html", "datenschutz.html", "impressum.html", "404.html"].filter(f => /nicht erfasst/.test(read(path.join(W10, f))));
  const qs = ["Video", "Podcast", "Datenjournalismus, CHF 800", "kostenlos", "Videojournalismus, 3 Tage", "KI im Journalismus, Zürich"];
  const sm = qs.filter(q => /nicht erfasst/.test(smart(W38, q).out));
  check("P05", "«nicht erfasst» erscheint nirgends mehr (Karten, Filter, Smart-Suche, alle Seiten)", !/nicht erfasst/.test(uiText(W38)) && pages.length === 0 && sm.length === 0, [...pages, ...sm].join(", "));
  const rest = C38.flatMap(c => [...c.facts.map(f => f[1]), ...c.badges, c.access].filter(v => /\bnicht\b[^;/]*\bpubliziert\b|not published/i.test(v)).map(v => `${c.id}: ${v}`));
  const unexpected = rest.filter(v => !/nicht (belastbar|generalisiert) publiziert|not published/i.test(v));
  check("P06", "«nicht publiziert» nur noch in den bekannten Sonderfällen (Daten: «nicht belastbar/generalisiert publiziert», englische Texte)", unexpected.length === 0,
    unexpected.length ? unexpected.slice(0, 3).join(" | ") : `${rest.length} Stellen: ${[...new Set(rest.map(r => r.split(":")[0]))].join(", ")}`);
}
{
  // Beispiele aus dem Bestand, von Hand festgelegt
  const D = JSON.parse(DATA_JS.slice(DATA_JS.indexOf("["), DATA_JS.lastIndexOf("]") + 1));
  const golden = [["Dauer nicht publiziert.", "Dauer", K], ["17.11.2027; Uhrzeit nicht publiziert", "Start", `17.11.2027; Uhrzeit: ${K}`],
    ["Kein aktueller Termin publiziert", "Start", `Aktueller Termin: ${K}`], ["Termin auf Anfrage / keine feste Durchführung publiziert", "Start", `Termin auf Anfrage / feste Durchführung: ${K}`],
    ["ca. 2–4 Stunden pro Woche; Gesamtdauer nicht separat publiziert", "Dauer", `ca. 2–4 Stunden pro Woche; Gesamtdauer: ${K}`],
    ["3 Tage im Januar 2027 in Bern; exaktes Datum noch nicht publiziert", "Start", `3 Tage im Januar 2027 in Bern; exaktes Datum: ${K}`],
    ["Dauer nach individueller Vereinbarung; nicht publiziert", "Dauer", `Dauer nach individueller Vereinbarung; ${K}`],
    ["Herbstsemester; Bewerbungsfrist 2026 abgelaufen, nächste Runde noch nicht publiziert", "Start", `Herbstsemester; Bewerbungsfrist 2026 abgelaufen, nächste Runde: ${K}`]];
  const bad = golden.filter(([inp, field, exp]) => { const base = D.find(o => o.id && o.title) ;
    const o = { ...base, id: "GOLD-1", publicationStatus: "", sessions: undefined, startDate: "", endDate: "", start: field === "Start" ? inp : "offen", duration: field === "Dauer" ? inp : "1 Tag" };
    const w = load(APP38, { data: `window.WEITERBILDUNGSRADAR_OFFERS = ${JSON.stringify([o])};` });
    const c = cards(w)[0]; const got = c && (c.facts.find(f => f[0] === field) || [])[1];
    if (got !== exp) { console.log(`   erwartet «${exp}», erhalten «${got}»`); return true; } return false; });
  check("P07", `Handfeste Beispiele (${golden.length}) ergeben den erwarteten Wortlaut`, bad.length === 0);
}
{
  const opts = (w, s) => [...w.document.querySelectorAll(`${s} option`)].map(o => [o.value, txt(o)]);
  const sels = ["#formatFilter", "#levelFilter", "#languageFilter", "#priceFilter", "#countryFilter"].filter(s => W38.document.querySelector(s));
  const diffs = sels.flatMap(s => { const a = opts(W37, s), b = opts(W38, s); return a.map((x, k) => [s, x, b[k]]).filter(([, x, y]) => !same(x, y)).map(([s2, x, y]) => `${s2}: ${x[1]}→${y[1]}`); });
  const ok = diffs.every(d => /nicht erfasst→(keine Angabe|Preis: keine Angabe)$/.test(d));
  const cnt = (w, s, idx) => { const x = w.document.querySelector(s); x.selectedIndex = idx; x.dispatchEvent(new w.Event("input", { bubbles: true })); x.dispatchEvent(new w.Event("change", { bubbles: true })); const n = cards(w).length; x.selectedIndex = 0; x.dispatchEvent(new w.Event("input", { bubbles: true })); x.dispatchEvent(new w.Event("change", { bubbles: true })); return n; };
  const countsSame = sels.every(s => opts(W38, s).every((_, k) => cnt(W37, s, k) === cnt(W38, s, k)));
  check("P08", "Filter: nur Bezeichnungen «nicht erfasst» → «keine Angabe»; gleiche Trefferzahl je Option", sels.length >= 4 && ok && diffs.length > 0 && countsSame, diffs.join("; "));
}
{
  const qs = ["Datenjournalismus, CHF 800, 2 Tage", "kostenlos", "Videojournalismus, 3 Tage", "Moderation, 1000 Euro", "500 Euro", "KI im Journalismus, Zürich", "Podcast", "Video"];
  const norm = r => ({ s: r.s, c: r.c.map(c => ({ t: c.t, b: c.b, f: c.f })) });
  const diff = qs.filter(q => !same(norm(smart(W37, q)), norm(smart(W38, q))));
  const dur = qs.flatMap(q => smart(W38, q).c.map(c => c.m[2])).filter(m => !m || m === K);
  check("P09", `Smart-Suche: gleiche Treffer, Reihenfolge, Budget- und Begründungstexte wie v37 (${qs.length} Anfragen); Dauer nie nackt «keine Angabe»`, diff.length === 0 && dur.length === 0, diff.join("; "));
}
check("P10", "Daten unverändert (data-p7.js wie Paket 7)", sha(DATA_JS) === sha(read(path.join(W7, "data-p7.js"))) && /nicht publiziert/.test(DATA_JS));
{
  const a = APP38.replace("  const NOT_RECORDED = MISSING;\n", '  const NOT_RECORDED = "nicht erfasst";\n');
  check("G01", "Gegenprobe: alter Wortlaut beim Anbieterland würde von P05 erkannt", a !== APP38 && /nicht erfasst/.test(uiText(load(a))));
  const b = APP38.replace('    if (!match) return part;\n', '    return part;\n');
  const kb = cards(load(b)); check("G02", "Gegenprobe: ohne Satzregel bleibt «nicht publiziert» stehen und P04 würde abweichen", b !== APP38 && kb.some(c => c.facts.some(f => /Dauer nicht publiziert/.test(f[1]))));
}
const fail = results.filter(r => !r).length;
console.log(`\n${results.length - fail}/${results.length} PASS (Stichtag ${T})`);
process.exit(fail ? 1 : 0);
