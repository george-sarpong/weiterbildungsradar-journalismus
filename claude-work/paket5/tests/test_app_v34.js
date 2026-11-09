// Paket 5 – Tests für app-v34.js (publicationStatus HOLD und sessions, GESAMTWISSENSSTAND §5 Punkt 6)
// Aufruf (im Repo-Root): TZ=Europe/Zurich NODE_PATH=<pfad>/node_modules node claude-work/paket5/tests/test_app_v34.js
// Stichtag fest 2026-11-09 (überschreibbar mit STICHTAG=YYYY-MM-DD), damit Ergebnisse reproduzierbar sind.
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = process.cwd();
const SNAP = path.join(ROOT, "claude-work/live-snapshot-20261109");
const P3 = path.join(ROOT, "claude-work/paket3/out");
const APP33 = fs.readFileSync(path.join(SNAP, "app-v33.js"), "utf8");
const APP34 = fs.readFileSync(path.join(ROOT, "claude-work/paket5/website/app-v34.js"), "utf8");
const INDEX = fs.readFileSync(path.join(SNAP, "index.html"), "utf8").replace(/<script src="[^"]+"><\/script>/g, "");
const LIVE_DATA = fs.readFileSync(path.join(SNAP, "data-a1-86ff68ddc9ac.js"), "utf8");
const LIVE_SMART = fs.readFileSync(path.join(SNAP, "smart-search-data-a1-a38a2a2b2391.js"), "utf8");
const CAND = JSON.parse(fs.readFileSync(path.join(P3, "merge_kandidat_data.json"), "utf8"));
const CAND_SMART = JSON.parse(fs.readFileSync(path.join(P3, "merge_kandidat_smart.json"), "utf8"));
const STICHTAG = process.env.STICHTAG || "2026-11-09";

const dataJs = offers => `window.WEITERBILDUNGSRADAR_OFFERS = ${JSON.stringify(offers)};`;
const smartJs = smart => `window.MEDIA_SKILLS_SMART_DATA = ${JSON.stringify(smart)};`;

function load(app, data, smart, sort) {
  const dom = new JSDOM(INDEX, { url: "https://mediaskills.ch/", runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.eval(`(() => { const R = Date; const F = new R("${STICHTAG}T12:00:00").getTime();
    class D extends R { constructor(...a) { a.length ? super(...a) : super(F); } static now() { return F; } }
    window.Date = D; })();`);
  w.eval(data); w.eval(smart); w.eval(app);
  if (sort) { w.document.querySelector("#sortSelect").value = sort; w.document.querySelector("#sortSelect").dispatchEvent(new w.Event("change", { bubbles: true })); }
  return w;
}
const cards = w => [...w.document.querySelectorAll("#cards article.card")].map(a => {
  const facts = Object.fromEntries([...a.querySelectorAll(".fact-item")].map(f => [f.querySelector("dt").textContent, f.querySelector("dd").textContent]));
  return { id: a.dataset.offerId, start: facts.Start, place: ([...a.querySelectorAll(".badges .badge")].pop() || {}).textContent };
});
const smartRun = (w, q) => {
  w.document.querySelector("#smartInput").value = q;
  w.document.querySelector("#smartSearchForm").dispatchEvent(new w.Event("submit", { cancelable: true }));
  return [...w.document.querySelectorAll("#smartResults .smart-result-card")].map(c => ({
    title: c.querySelector("h3").textContent, provider: c.querySelector(".smart-result-provider").textContent,
    meta: [...c.querySelectorAll(".smart-result-meta span")].map(s => s.textContent) }));
};

// Unabhängige Referenz (bewusst nicht aus app-v34.js übernommen)
const today = STICHTAG;
const iso = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "").trim()) ? String(v).trim() : null;
const next = o => Array.isArray(o.sessions)
  ? o.sessions.filter(s => iso(s.startDate) && s.startDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate))[0] || null
  : null;
const expectedVisible = o => o.publicationStatus !== "HOLD" &&
  (Array.isArray(o.sessions) ? Boolean(next(o)) : (!iso(o.endDate) || o.endDate >= today));

const results = [];
const check = (id, name, ok, detail = "") => { results.push({ id, name, ok }); console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail ? " – " + detail : ""}`); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// R: Regression – mit Live-Daten (ohne sessions/publicationStatus) verhält sich v34 exakt wie v33
for (const sort of [null, "START"]) {
  const a = load(APP33, LIVE_DATA, LIVE_SMART, sort), b = load(APP34, LIVE_DATA, LIVE_SMART, sort);
  const tag = sort || "Standard";
  check(`R0${sort ? 2 : 1}`, `Live-Daten, Sortierung ${tag}: Karten-HTML und Zähler identisch`,
    a.document.querySelector("#cards").innerHTML === b.document.querySelector("#cards").innerHTML &&
    a.document.querySelector("#resultCount")?.textContent === b.document.querySelector("#resultCount")?.textContent,
    `${cards(b).length} Karten`);
}
{
  const qs = ["Ich habe CHF 800 und möchte mich im Bereich Datenjournalismus weiterbilden.", "Video kostenlos", "KI im Journalismus online"];
  const a = load(APP33, LIVE_DATA, LIVE_SMART), b = load(APP34, LIVE_DATA, LIVE_SMART);
  check("R03", "Live-Daten: Smart-Suche (3 Beispielanfragen) identisch",
    qs.every(q => { smartRun(a, q); smartRun(b, q); return a.document.querySelector("#smartOutput").innerHTML === b.document.querySelector("#smartOutput").innerHTML; }));
}

// K: Merge-Kandidat Paket 4
const C = load(APP34, dataJs(CAND), smartJs(CAND_SMART));
const cc = cards(C), shown = new Set(cc.map(c => c.id));
const exp = new Set(CAND.filter(expectedVisible).map(o => o.id));
const hold = CAND.filter(o => o.publicationStatus === "HOLD"), sess = CAND.filter(o => Array.isArray(o.sessions));
check("K00", "Kandidat: 46 HOLD und 41 Angebote mit sessions vorhanden", hold.length === 46 && sess.length === 41, `${hold.length}/${sess.length}`);
check("K01", "Sichtbare Menge = unabhängige Referenz", same([...shown].sort(), [...exp].sort()), `${shown.size} sichtbar, Referenz ${exp.size}`);
check("K02", "Kein HOLD-Angebot im Katalog", hold.every(o => !shown.has(o.id)));
{
  const C33 = load(APP33, dataJs(CAND), smartJs(CAND_SMART)); const s33 = new Set(cards(C33).map(c => c.id));
  const n = hold.filter(o => s33.has(o.id)).length;
  check("K03", "Gegenprobe: app-v33 zeigt HOLD-Angebote (Test ist trennscharf)", n > 0, `${n} HOLD unter v33 sichtbar`);
}
const sessionCardErrors = list => {
  const ids = new Set(list.map(c => c.id)), bad = [];
  for (const o of sess.filter(o => ids.has(o.id) && next(o))) {
    const c = list.find(x => x.id === o.id), s = next(o);
    const wantStart = s.label || s.startDate.split("-").reverse().join(".");
    if (c.start !== wantStart) bad.push(`${o.id} Start «${c.start}» statt «${wantStart}»`);
    if (s.region && !c.place.includes(s.region)) bad.push(`${o.id} Ort «${c.place}» ohne Termin-Region «${s.region}»`);
  }
  return bad;
};
{
  const bad = sessionCardErrors(cc);
  const vis = sess.filter(o => shown.has(o.id)).length;
  check("K04", "sessions: Karte zeigt nächsten Termin und dessen Region", bad.length === 0, bad.slice(0, 3).join("; ") || `${vis} von 41 sichtbar, ${41 - vis} ohne künftigen Termin ausgeblendet`);
}
{
  const ids = ["PCC-P03", "PCC-P05", "PCC-P28", "V58-S1-07"];
  const info = ids.map(id => { const o = CAND.find(x => x.id === id); const c = cc.find(x => x.id === id);
    return { id, endDate: o.endDate || "", ok: Boolean(next(o)) === Boolean(c) && (!c || !/^21\.10\.|^22\.10\./.test(c.start)), start: c && c.start }; });
  check("K05", "4 Angebote mit leerem endDate (E061): Sichtbarkeit über sessions, kein vergangener Termin auf Karte",
    info.every(i => i.ok && i.endDate === ""), info.map(i => `${i.id}: ${i.start || "ausgeblendet"}`).join(" | "));
}
check("K06", "PCC-P08 (HOLD, leeres endDate) nicht sichtbar", !shown.has("PCC-P08"));
const byId = Object.fromEntries(CAND.map(o => [o.id, o]));
const startSortOk = app => {
  const S = load(app, dataJs(CAND), smartJs(CAND_SMART), "START");
  const dates = cards(S).map(c => { const o = byId[c.id]; return (next(o) || {}).startDate || iso(o.startDate) || ""; });
  const fut = dates.filter(d => d && d >= today);
  const firstNonFuture = dates.findIndex(d => !(d && d >= today));
  const sortedFut = fut.every((d, i) => i === 0 || fut[i - 1] <= d);
  const block = firstNonFuture === -1 || dates.slice(firstNonFuture).every(d => !(d && d >= today));
  return { ok: sortedFut && block, n: fut.length };
};
{
  const r = startSortOk(APP34);
  check("K07", "Sortierung «Nächster Start» nutzt nächsten Termin aus sessions", r.ok, `${r.n} künftige Starts aufsteigend`);
  const C33 = cards(load(APP33, dataJs(CAND), smartJs(CAND_SMART)));
  const g = sessionCardErrors(C33).length;
  check("K10", "Gegenprobe: app-v33 zeigt bei sessions-Angeboten nicht den nächsten Termin", g > 0, `${g} Abweichungen unter v33`);
  check("K11", "Gegenprobe: app-v33 sortiert «Nächster Start» nicht nach sessions", !startSortOk(APP33).ok);
}
{
  const B33 = load(APP33, dataJs(CAND), smartJs(CAND_SMART)), B34 = load(APP34, dataJs(CAND), smartJs(CAND_SMART));
  let leak34 = 0, leak33 = 0;
  for (const o of hold) {
    const hit = r => r.some(x => x.title === o.title && x.provider === o.provider);
    if (hit(smartRun(B34, o.title))) leak34++;
    if (hit(smartRun(B33, o.title))) leak33++;
  }
  check("K08", "Smart-Suche: kein HOLD-Angebot in den Treffern (Titelsuche je HOLD)", leak34 === 0, `v34: ${leak34}, Gegenprobe v33: ${leak33}`);
  check("K09", "Gegenprobe Smart-Suche: app-v33 liefert HOLD-Angebote", leak33 > 0);
}

// M: Manipulationstests
const base = CAND.find(o => !Array.isArray(o.sessions) && o.publicationStatus !== "HOLD" && iso(o.endDate) && o.endDate > today);
const mk = changes => [Object.assign(JSON.parse(JSON.stringify(base)), changes)];
const vis = offers => cards(load(APP34, dataJs(offers), smartJs(CAND_SMART))).length === 1;
check("M01", "Alle sessions vergangen, endDate künftig → ausgeblendet", !vis(mk({ sessions: [{ startDate: "2026-10-01", endDate: "2026-10-02", label: "alt" }] })));
check("M02", "publicationStatus HOLD auf sonst sichtbarem Angebot → ausgeblendet", vis(mk({})) && !vis(mk({ publicationStatus: "HOLD" })));
check("M03", "Session ohne gültiges startDate wird ignoriert", !vis(mk({ sessions: [{ label: "ohne Datum" }, { startDate: "bald", label: "x" }] })));
check("M04", "Ohne sessions: vergangener Start, kein endDate bleibt wie live sichtbar (89b9a1a / §5 Punkt 3 nicht portiert)",
  vis(mk({ startDate: "2026-10-01", endDate: "" })));
check("M05", "Andere publicationStatus-Werte blenden nicht aus (nur HOLD wirkt, wie main)", vis(mk({ publicationStatus: "PUBLISH" })));
{
  const w = load(APP34, dataJs(mk({ sessions: [{ startDate: today, endDate: today, label: "heute" }] })), smartJs(CAND_SMART));
  check("M06", "Grenzfall: Termin mit Start am Stichtag zählt als künftig", cards(w).length === 1 && cards(w)[0].start === "heute");
  const v = load(APP34, dataJs(mk({ sessions: [{ startDate: "2027-03-05", endDate: "2027-03-06" }] })), smartJs(CAND_SMART));
  check("M07", "Termin ohne Label: Datum als TT.MM.JJJJ", cards(v)[0]?.start === "05.03.2027", cards(v)[0]?.start);
}
{
  const cp = require("child_process"), tmp = require("os").tmpdir() + "/app-v34-repro.js";
  cp.execFileSync("python3", ["-I", path.join(ROOT, "claude-work/paket5/scripts/port_app_v34.py"), path.join(SNAP, "app-v33.js"), tmp]);
  check("D02", "Port-Skript erzeugt app-v34.js byte-identisch neu", fs.readFileSync(tmp, "utf8") === APP34);
}
{
  const a = load(APP34, dataJs(CAND), smartJs(CAND_SMART)).document.querySelector("#cards").innerHTML;
  const b = load(APP34, dataJs(CAND), smartJs(CAND_SMART)).document.querySelector("#cards").innerHTML;
  check("D01", "Zwei Läufe liefern identisches Karten-HTML", a === b);
}

const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} PASS (Stichtag ${STICHTAG})`);
process.exit(failed.length ? 1 : 0);
