// Paket 6 – Tests für app-v35.js + index.html/methodik.html (GESAMTWISSENSSTAND §5 Punkte 3, 2, 1; Paket-5-Funktionen weiter geprüft)
// Aufruf (im Repo-Root): TZ=Europe/Zurich NODE_PATH=<ordner>/node_modules node claude-work/paket6/tests/test_app_v35.js
// Stichtag fest 2026-11-09 (überschreibbar mit STICHTAG=YYYY-MM-DD).
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = process.cwd();
const SNAP = path.join(ROOT, "claude-work/live-snapshot-20261109");
const P3 = path.join(ROOT, "claude-work/paket3/out");
const W6 = path.join(ROOT, "claude-work/paket6/website");
const read = p => fs.readFileSync(p, "utf8");
const APP34 = read(path.join(ROOT, "claude-work/paket5/website/app-v34.js"));
const APP35 = read(path.join(W6, "app-v35.js"));
const strip = html => html.replace(/<script src="[^"]+"><\/script>/g, "");
const INDEX_LIVE = read(path.join(SNAP, "index.html")), INDEX_NEW = read(path.join(W6, "index.html"));
const METH_LIVE = read(path.join(SNAP, "methodik.html")), METH_NEW = read(path.join(W6, "methodik.html"));
const LIVE_DATA = read(path.join(SNAP, "data-a1-86ff68ddc9ac.js"));
const LIVE_SMART = read(path.join(SNAP, "smart-search-data-a1-a38a2a2b2391.js"));
const LIVE = JSON.parse(LIVE_DATA.slice(LIVE_DATA.indexOf("["), LIVE_DATA.lastIndexOf("]") + 1));
const CAND = JSON.parse(read(path.join(P3, "merge_kandidat_data.json")));
const CAND_SMART = JSON.parse(read(path.join(P3, "merge_kandidat_smart.json")));
const T = process.env.STICHTAG || "2026-11-09";

const dataJs = offers => `window.WEITERBILDUNGSRADAR_OFFERS = ${JSON.stringify(offers)};`;
const smartJs = smart => `window.MEDIA_SKILLS_SMART_DATA = ${JSON.stringify(smart)};`;
const V35 = [APP35, INDEX_NEW], V34 = [APP34, INDEX_LIVE];

function load([app, index], data, smart, { sort, url = "https://mediaskills.ch/" } = {}) {
  const dom = new JSDOM(strip(index), { url, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.eval(`(() => { const R = Date; const F = new R("${T}T12:00:00").getTime();
    class D extends R { constructor(...a) { a.length ? super(...a) : super(F); } static now() { return F; } }
    window.Date = D; })();`);
  w.eval(data); w.eval(smart); w.eval(app);
  if (sort) { const s = w.document.querySelector("#sortSelect"); s.value = sort; s.dispatchEvent(new w.Event("change", { bubbles: true })); }
  return w;
}
const cards = w => [...w.document.querySelectorAll("#cards article.card")].map(a => {
  const facts = Object.fromEntries([...a.querySelectorAll(".fact-item")].map(f => [f.querySelector("dt").textContent, f.querySelector("dd").textContent]));
  return { id: a.dataset.offerId, start: facts.Start, place: ([...a.querySelectorAll(".badges .badge")].pop() || {}).textContent };
});
const smart = (w, q) => {
  w.document.querySelector("#smartInput").value = q;
  w.document.querySelector("#smartSearchForm").dispatchEvent(new w.Event("submit", { cancelable: true }));
  return { text: w.document.querySelector("#smartOutput").textContent.replace(/\s+/g, " "),
    cards: [...w.document.querySelectorAll("#smartResults .smart-result-card")].map(c => ({
      title: c.querySelector("h3").textContent, provider: c.querySelector(".smart-result-provider").textContent,
      budget: (c.querySelector(".smart-budget") || {}).textContent || "" })) };
};

// Unabhängige Referenz (separat formuliert, nicht aus app-v35.js kopiert)
const iso = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "").trim()) ? String(v).trim() : null;
const next = o => Array.isArray(o.sessions)
  ? o.sessions.filter(s => iso(s.startDate) && s.startDate >= T).sort((a, b) => a.startDate.localeCompare(b.startDate))[0] || null : null;
const visible = o => {
  if (o.publicationStatus === "HOLD") return false;
  if (Array.isArray(o.sessions)) return Boolean(next(o));
  const e = iso(o.endDate), s = iso(o.startDate);
  if (e) return e >= T;
  return !s || s >= T;
};
const textDates = raw => [...String(raw).matchAll(/\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\b|\b(20\d{2})-(\d{2})-(\d{2})\b/g)]
  .map(m => m[4] ? `${m[4]}-${m[5]}-${m[6]}` : `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`);
const dmy = d => d.split("-").reverse().join(".");
const refStart = o => {
  const s = next(o); if (s) return s.label || dmy(s.startDate);
  const raw = String(o.start ?? "").trim(), st = iso(o.startDate), en = iso(o.endDate);
  const past = textDates(raw).some(d => d < T) || (st && st < T);
  if (!past) return /abgeschlossen/i.test(raw) && !st && !en ? "Nächste Ausgabe nicht publiziert" : raw;
  if (st && st >= T) return dmy(st);
  if (en && en >= T) return "Bereits begonnen; nächster Start nicht publiziert";
  return "Nächster Termin nicht publiziert";
};
const refApprovedOrder = list => [...list].sort((a, b) => String(b.approved ?? "").localeCompare(String(a.approved ?? ""))
  || a.provider.localeCompare(b.provider, "de-CH") || a.title.localeCompare(b.title, "de-CH") || String(a.id).localeCompare(String(b.id), "de-CH")).map(o => o.id);

const results = [];
const check = (id, name, ok, detail = "") => { results.push({ id, ok }); console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail ? " – " + detail : ""}`); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const lineDiff = (a, b) => { const x = a.split("\n"), y = b.split("\n"); return x.length === y.length ? x.filter((l, i) => l !== y[i]).length : -1; };

// ---- §5 Punkt 3 (E014): vergangene Termine, mit Live- und Kandidatendaten
for (const [tag, D, S] of [["Live", LIVE, LIVE_SMART], ["Kandidat", CAND, smartJs(CAND_SMART)]]) {
  const w = load(V35, dataJs(D), typeof S === "string" ? S : S), cc = cards(w);
  const exp = D.filter(visible);
  check(`A01-${tag}`, `${tag}: sichtbare Menge = Referenz (E014 + HOLD + sessions)`, same(cc.map(c => c.id).sort(), exp.map(o => o.id).sort()), `${cc.length} sichtbar`);
  const bad = cc.filter(c => c.start !== refStart(D.find(o => o.id === c.id)));
  check(`A02-${tag}`, `${tag}: Starttext jeder Karte = Referenz`, bad.length === 0, bad.slice(0, 2).map(b => `${b.id}: «${b.start}»`).join("; "));
  const pastShown = cc.filter(c => { const o = D.find(x => x.id === c.id); return !next(o) && textDates(c.start).some(d => d < T); });
  check(`A03-${tag}`, `${tag}: keine Karte zeigt ein vergangenes Datum als Start`, pastShown.length === 0, pastShown.slice(0, 2).map(c => c.id).join(", "));
}
{
  const w34 = cards(load(V34, LIVE_DATA, LIVE_SMART)), past34 = w34.filter(c => { const o = LIVE.find(x => x.id === c.id); return iso(o.startDate) && o.startDate < T && !Array.isArray(o.sessions); });
  const w35 = new Set(cards(load(V35, LIVE_DATA, LIVE_SMART)).map(c => c.id));
  const hidden = past34.filter(c => !w35.has(c.id)).length, relabeled = past34.filter(c => w35.has(c.id)).length;
  check("A04", "Gegenprobe Live-Daten: v34 zeigt Angebote mit vergangenem Start (§5 Punkt 3), v35 blendet aus oder beschriftet neu",
    past34.length > 0 && hidden + relabeled === past34.length, `${past34.length} unter v34 (am 09.11.: 151 laut §5), v35: ${hidden} ausgeblendet, ${relabeled} neu beschriftet`);
}
{
  const base = CAND.find(o => !Array.isArray(o.sessions) && o.publicationStatus !== "HOLD" && iso(o.endDate) && o.endDate > T);
  const one = ch => [Object.assign(JSON.parse(JSON.stringify(base)), ch)];
  const c = ch => cards(load(V35, dataJs(one(ch)), smartJs(CAND_SMART)))[0];
  check("A05", "Vergangener Start ohne Enddatum → ausgeblendet", !c({ startDate: "2026-10-01", endDate: "", start: "01.10.2026" }));
  check("A06", "Laufender Kurs → «Bereits begonnen; nächster Start nicht publiziert»", c({ startDate: "2026-10-01", endDate: "2027-06-30", start: "01.10.2026–30.06.2027" })?.start === "Bereits begonnen; nächster Start nicht publiziert");
  check("A07", "Altes Datum im Text, künftiger startDate → künftiges Datum", c({ startDate: "2027-02-01", start: "Letzte Runde 01.09.2026" })?.start === "01.02.2027");
  check("A08", "Text ohne Datum bleibt unverändert", c({ startDate: "", endDate: "", start: "laufend buchbar" })?.start === "laufend buchbar");
  check("A09", "«abgeschlossen» ohne Daten → «Nächste Ausgabe nicht publiziert»", c({ startDate: "", endDate: "", start: "Ausgabe abgeschlossen" })?.start === "Nächste Ausgabe nicht publiziert");
  check("A10", "Datensatz bleibt unverändert (nur Anzeige)", (() => { const d = one({ startDate: "2026-10-01", endDate: "2027-06-30", start: "01.10.2026–30.06.2027" }); const before = JSON.stringify(d); const w = load(V35, dataJs(d), smartJs(CAND_SMART)); return JSON.stringify(w.WEITERBILDUNGSRADAR_OFFERS) === before; })());
}

// ---- §5 Punkt 2 (E020): Standardsortierung «Zuletzt geprüft»
{
  const w = load(V35, LIVE_DATA, LIVE_SMART), d = w.document, sel = d.querySelector("#sortSelect");
  const opts = [...sel.options].map(o => o.value);
  check("B01", "Sortieroptionen: APPROVED zuerst, kein EDITORIAL", same(opts, ["APPROVED", "START", "PROVIDER"]) && sel.value === "APPROVED", opts.join(", "));
  const vis = LIVE.filter(visible);
  check("B02", "Standardreihenfolge = Prüfdatum absteigend, dann Anbieter, Titel, ID", same(cards(w).map(c => c.id), refApprovedOrder(vis)));
  check("B03", "Ohne Eingriff: «Keine Filter aktiv», URL ohne sort", d.querySelector("#filterStatus")?.textContent === "Keine Filter aktiv" && !w.location.search.includes("sort="),
    `${d.querySelector("#filterStatus")?.textContent} | «${w.location.search}»`);
  const ws = load(V35, LIVE_DATA, LIVE_SMART, { sort: "START" });
  check("B04", "Andere Sortierung zählt als Filter und steht in der URL", ws.location.search.includes("sort=START") && ws.document.querySelector("#filterStatus").textContent === "1 Filter aktiv");
  ws.document.querySelector("#resetFilters, #reset, [data-reset]")?.click();
  check("B05", "Zurücksetzen → APPROVED", ws.document.querySelector("#sortSelect").value === "APPROVED");
  const old = load(V35, LIVE_DATA, LIVE_SMART, { url: "https://mediaskills.ch/?sort=EDITORIAL" });
  check("B06", "Alter Link ?sort=EDITORIAL fällt auf APPROVED zurück", old.document.querySelector("#sortSelect").value === "APPROVED");
  check("B07", "Gegenprobe v34: Standard war «Redaktionelle Auswahl» (Datenreihenfolge)",
    load(V34, LIVE_DATA, LIVE_SMART).document.querySelector("#sortSelect").value === "EDITORIAL");
  check("B08", "index.html: genau die 2 E020-Stellen geändert (Optionen, Orientierungstext), Skript-Verweise unverändert",
    !INDEX_NEW.includes("Redaktionelle Auswahl") && INDEX_NEW.includes("dokumentierter Aufnahmekriterien")
    && same(INDEX_NEW.match(/<script src="[^"]+">/g), INDEX_LIVE.match(/<script src="[^"]+">/g))
    && INDEX_LIVE.split("\n").length - INDEX_NEW.split("\n").length === 1);
  check("B09", "methodik.html: genau 3 Zeilen geändert, keine «redaktionelle Auswahl» mehr", lineDiff(METH_LIVE, METH_NEW) === 3 && !/redaktionelle Auswahl/i.test(METH_NEW));
}

// ---- §5 Punkt 1 (E037): CHF/EUR/USD 1:1 mit Hinweis
{
  const w = load(V35, dataJs(CAND), smartJs(CAND_SMART)), w34 = load(V34, dataJs(CAND), smartJs(CAND_SMART));
  const q = "Ich habe EUR 800 und möchte mich im Bereich Datenjournalismus weiterbilden.";
  const a = smart(w, q), b = smart(w34, q);
  check("C01", "EUR-Budget wird angewendet (Chip «Budget: EUR 800»)", a.text.includes("Budget: EUR 800") && !a.text.includes("erkannt, nicht angewendet"));
  check("C02", "Gegenprobe v34: EUR-Budget nur «erkannt, nicht angewendet»", b.text.includes("erkannt, nicht angewendet"));
  check("C03", "USD- und €-Schreibweisen werden erkannt", smart(w, "Video bis 600 $").text.includes("Budget: USD 600") && smart(w, "Podcast 700 €").text.includes("Budget: EUR 700"));
  check("C04", "Betrag ohne Währung bleibt «Währung offen, nicht angewendet» (MS-46 bleibt)", smart(w, "Budget 500 Video").text.includes("Währung offen, nicht angewendet"));
  check("C05", "Hinweis unter den Preisbändern nennt 1:1 und Originalwährung",
    /vereinfacht 1:1 verglichen\. Anbieterpreise bleiben in Originalwährung/.test(w.document.querySelector("#smartPriceNote").textContent));
  // Manipulation: ein Angebot, identischer Preis, nur die Währung wechselt
  const base = CAND.find(o => o.id === "OFFER-EBU-013"), rec = CAND_SMART.byId["OFFER-EBU-013"];
  const run = currency => {
    const o = Object.assign(JSON.parse(JSON.stringify(base)), { id: "TEST-FX", sessions: undefined, publicationStatus: undefined, startDate: "", endDate: "", start: "laufend" });
    const r = JSON.parse(JSON.stringify(rec)); r.priceOptions = r.priceOptions.map(p => Object.assign(p, { currency }));
    const ww = load(V35, dataJs([o]), smartJs({ meta: CAND_SMART.meta, byId: { "TEST-FX": r } }));
    return smart(ww, `CHF 2000 ${base.title}`).cards[0]?.budget || "";
  };
  const eur = run("EUR"), chf = run("CHF"), gbp = run("GBP");
  check("C06", "EUR-Preis bei CHF-Budget: Restbetrag in Budgetwährung plus 1:1-Hinweis", /bleiben CHF 100\./.test(eur) && /vereinfacht 1:1 verglichen/.test(eur), eur);
  check("C07", "Gleiche Währung: kein Hinweis", /bleiben CHF 100\.$/.test(chf.trim()), chf);
  check("C08", "GBP wird nicht nominal verglichen (E009)", /keine sichere Budgetaussage/.test(gbp), gbp);
}

// ---- Paket-5-Funktionen bleiben (HOLD, sessions)
{
  const w = load(V35, dataJs(CAND), smartJs(CAND_SMART)), ids = new Set(cards(w).map(c => c.id));
  const hold = CAND.filter(o => o.publicationStatus === "HOLD");
  check("K01", "Kein HOLD sichtbar (46 im Kandidaten)", hold.length === 46 && hold.every(o => !ids.has(o.id)));
  let leak = 0; for (const o of hold) if (smart(w, o.title).cards.some(c => c.title === o.title && c.provider === o.provider)) leak++;
  check("K02", "Kein HOLD in der Smart-Suche", leak === 0);
  const sw = cards(load(V35, dataJs(CAND), smartJs(CAND_SMART), { sort: "START" }));
  const d = sw.map(c => { const o = CAND.find(x => x.id === c.id); return (next(o) || {}).startDate || iso(o.startDate) || ""; }).filter(x => x && x >= T);
  check("K03", "Sortierung «Nächster Start» aufsteigend nach nächstem Termin", d.every((x, i) => !i || d[i - 1] <= x), `${d.length} künftige Starts`);
}

// ---- Reproduzierbarkeit
{
  const cp = require("child_process"), os = require("os"), tmp = fs.mkdtempSync(path.join(os.tmpdir(), "p6-"));
  cp.execFileSync("python3", ["-I", path.join(ROOT, "claude-work/paket6/scripts/port_app_v35.py"), path.join(ROOT, "claude-work/paket5/website/app-v34.js"), path.join(tmp, "app-v35.js")]);
  cp.execFileSync("python3", ["-I", path.join(ROOT, "claude-work/paket6/scripts/port_html_e020.py"), SNAP, tmp]);
  check("D01", "Port-Skripte erzeugen app-v35.js, index.html, methodik.html byte-identisch neu",
    ["app-v35.js", "index.html", "methodik.html"].every(f => read(path.join(tmp, f)) === read(path.join(W6, f))));
  check("D02", "Zwei Läufe liefern identisches Karten-HTML",
    load(V35, dataJs(CAND), smartJs(CAND_SMART)).document.querySelector("#cards").innerHTML === load(V35, dataJs(CAND), smartJs(CAND_SMART)).document.querySelector("#cards").innerHTML);
}

const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} PASS (Stichtag ${T})`);
process.exit(failed.length ? 1 : 0);
