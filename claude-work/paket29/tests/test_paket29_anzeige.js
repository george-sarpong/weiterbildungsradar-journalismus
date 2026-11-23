// Paket 29 (SPEZIFIKATION_PAKET29_20261123.md §5 mit §7.3): Anzeige- und Suchtests Release P29 (Dateien je Markt, app-v44.js)
// gegen Release P28 (eine Datei, app-v43.js) am selben Stichtag, beide mit build_release_p2x.py gebaut, feste Uhr Stichtag 12:00.
// P01 Zusammenführung, P03 Karten/Zähler/Filter, P04 Smart- und Katalogsuche gegen paket29/out/sollliste_u2.csv, P05 Suchtext nur
// aus der Karte, P06 Merkliste P28 → P29, P08 Ladefehler je Markt und Datei (E248). Abgeleitet aus paket28/tests/test_paket28_anzeige.js.
// Aufruf (aus claude-work/): TZ=Europe/Zurich NODE_PATH=<nm> REL29=<ordner> REL28=<ordner> S=JJJJ-MM-TT [NUR=REST|P08|SUCHE] node paket29/tests/test_paket29_anzeige.js
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { JSDOM, VirtualConsole } = require("jsdom");
const read = p => fs.readFileSync(p, "utf8"), sha = b => crypto.createHash("sha256").update(b).digest("hex");
const CW = path.resolve(__dirname, "../.."), OUT = path.join(CW, "paket29/out");
const S = process.env.S || "", NUR = process.env.NUR || "";
if (!/^\d{4}-\d{2}-\d{2}$/.test(S)) throw new Error("S setzen");
if (process.env.TZ !== "Europe/Zurich") throw new Error("TZ=Europe/Zurich fehlt");
const stand = (rel, app) => {
  const web = path.join(rel, "website"), idx = read(path.join(web, "index.html"));
  const skr = [...idx.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
  if (skr[skr.length - 1] !== app) throw new Error(`${rel} lädt ${skr}`);
  const prot = JSON.parse(read(path.join(rel, "BAUPROTOKOLL.json")));
  if (prot.stichtag !== S) throw new Error(`${rel}: Stichtag ${prot.stichtag}`);
  return { rel, web, idx, prot, files: skr.slice(0, -1), app: read(path.join(web, app)), appName: app };
};
const P28 = stand(path.resolve(process.env.REL28 || ""), "app-v43.js"), P29 = stand(path.resolve(process.env.REL29 || ""), "app-v44.js");
if (sha(P28.app) !== "ada38d5ed342572b2b3e0daa476d9e6b4186426841047fb9a1655a6663789020") throw new Error("app-v43.js");
const INDEX = P28.idx.replace(/<script src="[^"]+"><\/script>/g, "");
const HAKEN = "    evaluated.sort((a, b) => {", ENDE = "  applyUrlState();\n  render();\n})();";
const HAY = "    return (!favoritesOnly || favorites.has(offer.id))";
const ein = (t, a, b) => { if (t.split(a).length !== 2) throw new Error("Haken nicht eindeutig: " + a.slice(0, 50)); return t.replace(a, () => b); };
const mitHaken = t => ein(ein(ein(t, HAKEN, "    window.__P25_EVAL = evaluated;\n" + HAKEN), HAY, "    (window.__P29_HAY = window.__P29_HAY || {})[offer.id] = haystack;\n" + HAY),
  ENDE, "  window.__P29 = { smartHaystack, placeSearchText, normalize, offers, labels, humanizeTokens, neutralMissing, readableCodes, publicStart,\n"
  + "    placeLabel, currentRegion, languageBadge, compactPrice, compactAccess };\n" + ENDE);
for (const s of [P28, P29]) s.appH = mitHaken(s.app);
const DATEFIX = s => `(() => { const R = Date; const F = new R("${s}T12:00:00").getTime();
  class D extends R { constructor(...a) { a.length ? super(...a) : super(F); } static now() { return F; } }
  window.Date = D; })();`;
const FAV_KEY = "weiterbildungsradar:favorites:v1";
function load(st, { app = st.app, ohne = null, fav = null, fehler = [] } = {}) {
  const vc = new VirtualConsole(); vc.on("jsdomError", e => fehler.push(String(e && e.message || e))); vc.on("error", e => fehler.push("console.error " + e));
  const dom = new JSDOM(INDEX, { url: "https://mediaskills.ch/", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window; w.addEventListener("error", e => fehler.push(e.message));
  w.eval(DATEFIX(S)); if (fav !== null) w.localStorage.setItem(FAV_KEY, fav);
  const weg = [].concat(ohne || []);
  for (const f of st.files) if (!weg.includes(f)) w.eval(read(path.join(st.web, f)));
  w.eval(app); return w;
}
const txt = n => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const karten = w => [...w.document.querySelectorAll("#cards article.card")].map(c => ({ id: c.dataset.offerId, text: txt(c),
  links: [...c.querySelectorAll("a")].map(a => [a.getAttribute("href"), a.getAttribute("target"), a.getAttribute("rel"), a.getAttribute("aria-label"), txt(a)]) }));
const setze = (w, sel, v, ev = ["change", "input"]) => { const e = w.document.querySelector(sel); e.value = v; for (const x of ev) e.dispatchEvent(new w.Event(x, { bubbles: true })); };
const FILTER = ["focusFilter", "typeFilter", "priceFilter", "formatFilter", "languageFilter", "countryFilter", "levelFilter"];
const results = [];
const check = (id, name, ok, detail = "") => { const s = ok ? "PASS" : "FAIL"; results.push({ id, name, status: s, detail }); console.log(`${s} ${id} ${name}${detail ? " – " + detail : ""}`); };
const proto = { stichtag: S, jsdom: require("jsdom/package.json").version, p28: P28.files, p29: P29.files };

// ---------- P01 Zusammenführung ----------
function zusammen(st) {
  const d = new JSDOM("", { runScripts: "outside-only" }).window;
  for (const f of st.files) d.eval(read(path.join(st.web, f)));
  return { offers: d.WEITERBILDUNGSRADAR_OFFERS, smart: d.MEDIA_SKILLS_SMART_DATA, kat: d.MEDIA_SKILLS_KATALOG };
}
const markt = {}; for (const [m, v] of Object.entries(P29.prot.maerkte)) {
  const d = new JSDOM("", { runScripts: "outside-only" }).window; d.eval(read(path.join(P29.web, v.daten)));
  for (const o of d.WEITERBILDUNGSRADAR_OFFERS) markt[o.id] = m; d.close(); }
const ids = Object.fromEntries(Object.keys(P29.prot.maerkte).map(m => [m, Object.keys(markt).find(i => markt[i] === m)]));
if (NUR === "" || NUR === "REST") {
  const a = zusammen(P28), b = zusammen(P29);
  const reihe = Object.keys(P29.prot.maerkte);
  const soll = reihe.flatMap(m => a.offers.filter(o => markt[o.id] === m).map(o => o.id));
  const byA = Object.fromEntries(a.offers.map(o => [o.id, JSON.stringify(o)]));
  const fehl = [];
  if (!same(b.offers.map(o => o.id), soll)) fehl.push("Reihenfolge ≠ E247");
  if (b.offers.some(o => JSON.stringify(o) !== byA[o.id]) || b.offers.length !== a.offers.length) fehl.push("Datensatz verschieden");
  if (!same(Object.keys(b.smart.byId), soll)) fehl.push("byId-Reihenfolge ≠ E247");
  if (Object.keys(b.smart.byId).some(k => JSON.stringify(b.smart.byId[k]) !== JSON.stringify(a.smart.byId[k])) || Object.keys(b.smart.byId).length !== Object.keys(a.smart.byId).length) fehl.push("byId verschieden");
  if (JSON.stringify(b.smart.meta) !== JSON.stringify(a.smart.meta)) fehl.push("meta verschieden");
  const zaehl = Object.fromEntries(reihe.map(m => [m, soll.filter(i => markt[i] === m).length]));
  if (!same(b.kat.soll, zaehl) || !same(b.kat.daten, zaehl) || !same(b.kat.suche, zaehl)) fehl.push("Soll-Angabe ≠ gezählt");
  check(`P01 ${S}`, `Zusammenführung im Browser-Ablauf = P28: ${b.offers.length} Datensätze und byId-Einträge bytegleich, meta bytegleich, Reihenfolge CH, übrige alphabetisch, je Markt Master-Reihenfolge (E247), Soll = gezählt`,
    !fehl.length, fehl.join("; ") + ` ${JSON.stringify(zaehl)}`);
  proto.P01 = { maerkte: zaehl, fehl };

  // ---------- P03 Karten, Zähler, Filter ----------
  const f3 = { a: [], b: [] }, W = { a: load(P28, { fehler: f3.a }), b: load(P29, { fehler: f3.b }) };
  const sorts = [...W.b.document.querySelectorAll("#sortSelect option")].map(o => o.value);
  const g = []; let n = 0;
  for (const so of sorts) { for (const k of ["a", "b"]) setze(W[k], "#sortSelect", so, ["change"]);
    const A = karten(W.a), B = karten(W.b); if (so === sorts[0]) n = B.length;
    if (!same(A, B)) g.push(`${so}: erste Abweichung bei ${A.findIndex((x, i) => !same(x, B[i]))}`); }
  for (const k of ["a", "b"]) setze(W[k], "#sortSelect", sorts[0], ["change"]);
  const g10 = []; let nOpt = 0; const ordnung = {};
  for (const f of FILTER) {
    const opt = k => [...W[k].document.querySelectorAll(`#${f} option`)].map(o => [o.value, txt(o)]);
    const oa = opt("a"), ob = opt("b");
    if (f === "countryFilter") {
      const rest = oa.slice(1).map(x => x[1]), tail = ["Online", "keine Angabe"].filter(x => rest.includes(x));
      const erw = [oa[0], ...["Schweiz"].filter(x => rest.includes(x)), ...rest.filter(x => x !== "Schweiz" && !tail.includes(x)).sort((x, y) => x.localeCompare(y, "de-CH")), ...tail]
        .map(x => Array.isArray(x) ? x : [x, x]);
      ordnung.vorher = oa.map(x => x[1]); ordnung.nachher = ob.map(x => x[1]);
      if (!same(ob, erw)) g10.push(`Länderfilter ${JSON.stringify(ob.map(x => x[1]))} ≠ Soll ${JSON.stringify(erw.map(x => x[1]))}`);
      if (!same([...oa].sort(), [...ob].sort())) g10.push("Länderfilter: andere Optionen");
    } else if (!same(oa, ob)) g10.push(`${f}: Optionen verschieden`);
    for (const [v] of ob) { nOpt++;
      const z = {}; for (const k of ["a", "b"]) { setze(W[k], `#${f}`, v); z[k] = [txt(W[k].document.querySelector("#resultCount")), karten(W[k]).map(c => c.id).join(",")]; }
      if (!same(z.a, z.b)) g10.push(`${f}=${v}: «${z.a[0]}» ≠ «${z.b[0]}»`); }
    for (const k of ["a", "b"]) setze(W[k], `#${f}`, "");
  }
  check(`P03 ${S}`, `Karten in ${sorts.length} Sortierungen (Text, Links, Reihenfolge), Optionen und Zähler aller ${FILTER.length} Filter (${nOpt} Optionen einzeln) gleich P28, ausser Reihenfolge Länderfilter nach E242; keine JS-Fehler`,
    sorts.length === 3 && n > 0 && !g.length && !g10.length && !f3.a.length && !f3.b.length, `${n} Karten; ${[...g, ...g10, ...f3.b].slice(0, 4).join("; ")}; Länderfilter ${ordnung.nachher.join(", ")}`);
  proto.P03 = { karten: n, laenderfilter: ordnung, abweichungen: [...g, ...g10] };
  W.a.close(); W.b.close();

  // ---------- P05 Suchtext nur aus der Karte ----------
  const p5 = {};
  for (const [k, st] of [["P28 app-v43 (Kontrolle)", P28], ["P29 app-v44", P29]]) {
    const fe = [], w = load(st, { app: st.appH, fehler: fe }), P = w.__P29;
    const wo = s => new Set(P.normalize(s).split(/[^a-z0-9ß]+/).filter(Boolean));
    const kt = Object.fromEntries(karten(w).map(c => [c.id, c.text]));
    // (a) feldweise (§7.3 P05, Gegenprüfung B4): ein Wort, das nur im Rohwert eines der sieben Felder steht, darf im Suchtext nur
    // stehen, wenn es aus einem Anzeigetext oder einem anderen gezeigten Teil kommt (Titel, Beschreibung, Anbieter, Labels, Anbieterland E129)
    const FELDER = {
      smart: { format: [o => o.format, o => P.humanizeTokens(o.format, P.labels.format)], duration: [o => o.duration, o => P.neutralMissing(P.readableCodes(o.duration), "Dauer")],
        start: [o => o.start, o => P.neutralMissing(P.readableCodes(P.publicStart(o)), "Start")], region: [o => o.region, o => P.placeLabel(o)] },
      katalog: { access: [o => o.access, o => P.compactAccess(o)], priceDisplay: [o => o.priceDisplay, o => P.compactPrice(o)],
        format: [o => o.format, o => P.humanizeTokens(o.format, P.labels.format)], duration: [o => o.duration, o => P.neutralMissing(P.readableCodes(o.duration), "Dauer")],
        start: [o => o.start, o => P.neutralMissing(P.readableCodes(P.publicStart(o)), "Start")], language: [o => o.language, o => P.languageBadge(o)],
        region: [o => P.currentRegion(o), o => P.placeLabel(o)] } };
    let verstoss = 0, karte = 0; const bsp = [];
    for (const o of P.offers) {
      const gezeigt = [o.title, o.description, o.provider, o.focus, P.labels.focus[o.focus], P.labels.level[o.level], P.labels.offerType[o.offerType], P.placeSearchText(o)].join(" ");
      const erlaubtKarte = new Set([...wo(kt[o.id] || ""), ...wo(P.placeSearchText(o)), ...wo(o.focus)]);   // (b) ganzer Kartentext
      for (const [art, hay] of [["smart", P.smartHaystack(o)], ["katalog", (w.__P29_HAY || {})[o.id] || ""]]) {
        const h = wo(hay), anz = Object.values(FELDER[art]).map(([, a]) => String(a(o) ?? "")).join(" ");
        const erlaubt = new Set([...wo(gezeigt), ...wo(anz)]);
        const x = [...new Set(Object.values(FELDER[art]).flatMap(([r, a]) => { const wa = wo(String(a(o) ?? "")); return [...wo(String(r(o) ?? ""))].filter(t => !wa.has(t)); }))]
          .filter(t => h.has(t) && !erlaubt.has(t));
        if (x.length) { verstoss++; if (bsp.length < 4) bsp.push(`${o.id} ${art}: ${x.slice(0, 4).join(" ")}`); }
        if ([...h].some(t => !erlaubtKarte.has(t))) karte++;
      }
    }
    p5[k] = { angebote: P.offers.length, verstoesse: verstoss, verstoesse_kartentext: karte, beispiele: bsp, katalog_hay: Object.keys(w.__P29_HAY || {}).length, js: fe };
    w.close();
  }
  const v44 = p5["P29 app-v44"], v43 = p5["P28 app-v43 (Kontrolle)"];
  check(`P05 ${S}`, "Suchtext (Smart und Katalog), feldweise für die sieben Felder V3: kein Wort, das nur aus dem Rohwert stammt; zusätzlich kein Wort, das nicht im Kartentext steht (Ausnahme Anbieterland E129); Kontrolle: app-v43.js hat solche Wörter",
    v44.verstoesse === 0 && v44.verstoesse_kartentext === 0 && v44.katalog_hay === v44.angebote && v43.verstoesse > 0 && !v44.js.length,
    `app-v44 ${v44.verstoesse} feldweise / ${v44.verstoesse_kartentext} Kartentext bei ${v44.angebote} Angeboten; app-v43 ${v43.verstoesse} / ${v43.verstoesse_kartentext} (z. B. ${v43.beispiele[0]}); ${v44.beispiele.join("; ")}`);
  proto.P05 = p5;

  // ---------- P06 Merkliste P28 → P29 ----------
  const fav = JSON.stringify([...Object.values(ids), "UNBEKANNT-ID"]), f6 = [];
  const wa = load(P28, { fav, fehler: f6 }), wb = load(P29, { fav, fehler: f6 });
  const zf = w => [txt(w.document.querySelector("#favoritesCount")), [...w.document.querySelectorAll(".favorite-button.is-favorite")].map(b => b.dataset.favoriteId).sort().join(",")];
  const ok6a = same(zf(wa), zf(wb)) && wa.localStorage.getItem(FAV_KEY) === fav && wb.localStorage.getItem(FAV_KEY) === fav;
  // Änderung in P28 (merken), dann P29 laden: gleiche gemerkte IDs
  const andere = karten(wa).map(c => c.id).find(i => !Object.values(ids).includes(i));
  wa.document.querySelector(`[data-favorite-id="${andere}"]`).dispatchEvent(new wa.MouseEvent("click", { bubbles: true }));
  const nach = wa.localStorage.getItem(FAV_KEY), wc = load(P29, { fav: nach, fehler: f6 });
  const ok6b = same(JSON.parse(wc.localStorage.getItem(FAV_KEY)).sort(), [...Object.values(ids), andere].sort()) && zf(wc)[1] === [...Object.values(ids), andere].sort().join(",");
  check(`P06 ${S}`, "Merkliste über P28 → P29: gemerkte IDs aus CH, AT, LI bleiben gemerkt, unbekannte ID nach Änderung weg wie P28 (E231), localStorage nach dem Laden unverändert",
    ok6a && ok6b && !f6.length && !wb.document.querySelector("[data-load-warning]"), `${zf(wb)[0]}; ${JSON.stringify(ids)}`);
  wa.close(); wb.close(); wc.close();
}
if (NUR === "" || NUR === "P08") {
  // ---------- P08 Ladefehler je Markt und Datei ----------
  const p8 = [], f8 = [];
  const voll = load(P29, { fehler: f8 }); const nVoll = karten(voll).length, hinweisVoll = !!voll.document.querySelector("[data-load-warning]"); voll.close();
  for (const [m, v] of Object.entries(P29.prot.maerkte)) for (const art of ["daten", "suche"]) {
    const fe = [], fehlId = ids[m], andereM = Object.keys(ids).find(x => x !== m), da = ids[andereM];
    const w = load(P29, { ohne: v[art], fav: JSON.stringify([fehlId, da]), fehler: fe });
    const hinweis = txt(w.document.querySelector("[data-load-warning]"));
    const n8 = karten(w).length, erwartet = art === "daten" ? nVoll - v.angebote : nVoll;
    const neu = karten(w).map(c => c.id).find(i => i !== da && i !== fehlId);
    w.document.querySelector(`[data-favorite-id="${neu}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    const gesp = JSON.parse(w.localStorage.getItem(FAV_KEY));
    // Smart-Suche läuft weiter
    w.document.querySelector("#smartInput").value = "Journalismus"; w.document.querySelector("#smartSearchForm").dispatchEvent(new w.Event("submit", { cancelable: true }));
    const smartOk = w.document.querySelectorAll("#smartResults .smart-result-card").length > 0;
    const ok = !fe.length && hinweis === "Ein Teil des Katalogs konnte nicht geladen werden. Bitte Seite neu laden." && n8 === erwartet
      && gesp.includes(fehlId) && gesp.includes(da) && gesp.includes(neu) && smartOk;
    p8.push({ markt: m, datei: art, ok, karten: n8, erwartet, gespeichert: gesp, js: fe.slice(0, 2) });
    w.close();
    if (global.gc) global.gc();
  }
  // Gegenprüfung B5: alle Datendateien, alle Smart-Dateien, alles fehlt (keine Soll-Angabe)
  const alleD = Object.values(P29.prot.maerkte).map(v => v.daten), alleS = Object.values(P29.prot.maerkte).map(v => v.suche);
  for (const [name, weg] of [["alle Daten", alleD], ["alle Smart", alleS], ["nichts (Soll fehlt)", [...alleD, ...alleS]]]) {
    const fe = [], fav = JSON.stringify(Object.values(ids)), w = load(P29, { ohne: weg, fav, fehler: fe });
    const hinweis = txt(w.document.querySelector("[data-load-warning]")), n8 = karten(w).length, erwartet = weg === alleS ? nVoll : 0;
    w.document.querySelector("#smartInput").value = "Journalismus"; w.document.querySelector("#smartSearchForm").dispatchEvent(new w.Event("submit", { cancelable: true }));
    const ok = !fe.length && hinweis === "Ein Teil des Katalogs konnte nicht geladen werden. Bitte Seite neu laden." && n8 === erwartet && w.localStorage.getItem(FAV_KEY) === fav;
    p8.push({ markt: "alle", datei: name, ok, karten: n8, erwartet, gespeichert: JSON.parse(w.localStorage.getItem(FAV_KEY)), js: fe.slice(0, 2) });
    w.close(); if (global.gc) global.gc();
  }
  check(`P08 ${S}`, `Ladefehler: je Markt Daten- oder Smart-Datei weggelassen, dazu alle Daten, alle Smart, nichts geladen (${p8.length} Fälle): kein JS-Fehler, Hinweis nach E248, übrige Märkte nutzbar (Karten, Smart-Suche), gemerkte IDs des fehlenden Markts nach Merken eines anderen Angebots weiter gespeichert; ohne Fehler kein Hinweis`,
    p8.every(x => x.ok) && !hinweisVoll && !f8.length, p8.filter(x => !x.ok).map(x => `${x.markt} ${x.datei}: ${x.karten}/${x.erwartet} ${x.js}`).join("; "));
  proto.P08 = p8;
}

// ---------- P04 Smart- und Katalogsuche gegen die Sollliste ----------
if (NUR === "" || NUR === "SUCHE") {
  const p27 = read(path.join(CW, "paket27/website/data-p27.js")), D27 = JSON.parse(p27.slice(p27.indexOf("["), p27.lastIndexOf("]") + 1));
  const T = [["T01", "Datenjournalismus, CHF 800, 2 Tage"], ["T02", "Datenjournalismus, CHF 800"], ["T03", "Datenjournalismus, CHF 511"],
    ["T04", "500 Euro"], ["T05", "Datenjournalismus, 300 Pfund"], ["T06", "kostenlos"], ["T07", "Kurs für Journalistinnen, CHF 500"],
    ["T08", "Journalismus"], ["T09", D27.find(o => o.id === "PCC-P08").title], ["T10", "Journalismus Kurs Deutschland"], ["T11", "Fotografie, CHF 1000"], ["T12", "Recherche"],
    ["T13", "Mobile Reporting, unter CHF 300"], ["T14", "Podcast produzieren, online"], ["T15", "KI im Journalismus, Zürich"],
    ["T16", "Videojournalismus, 3 Tage"], ["T17", "Bildbearbeitung für Fotojournalismus"], ["T18", "Social Media und Audience"],
    ["T19", "Moderation, 1000 Euro"], ["T20", "Datenvisualisierung kostenlos"]];
  const vt = read(path.join(CW, "paket15/tests/virtuelle_tests.js"));
  const V = eval(vt.slice(vt.indexOf("const Q = [") + "const Q = ".length, vt.indexOf("];", vt.indexOf("const Q = [")) + 1));
  const Q60 = [...T, ...V.map(([g, q], i) => [`V${String(i + 1).padStart(2, "0")} ${g}`, q])];
  const E221 = [["E221a", "FR|EN"], ["E221b", "DE/EN"], ["E221c", "PRÄSENZ|ONLINE LIVE"], ["E221d", "|"]];
  // Sollliste lesen (einfacher CSV-Leser mit Anführungszeichen)
  const parse = t => { const rows = []; let r = [], f = "", q = false;
    for (let i = 0; i < t.length; i++) { const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true; else if (c === ",") { r.push(f); f = ""; } else if (c === "\n") { r.push(f); rows.push(r); r = []; f = ""; } else f += c; }
    return rows; };
  const sl = parse(read(path.join(OUT, "sollliste_u2.csv"))); const kopf = sl[0];
  const SOLL = sl.slice(1).map(r => Object.fromEntries(kopf.map((k, i) => [k, r[i]]))).filter(r => r.stichtag === S);
  const key = r => [r.suchart, r.anfrage_id, r.ebene, r.angebot_id, r.vorher, r.nachher].join("\u0001");
  const keyMap = st => { const m = {}; for (const o of zusammen(st).offers) { const k = `${o.title}|${o.provider}`; m[k] = m[k] ? m[k] + "|DUBLETTE" : o.id; } return m; };
  const KM = { a: keyMap(P28), b: keyMap(P29) };
  const fe = { a: [], b: [] }, W = { a: load(P28, { app: P28.appH, fehler: fe.a }), b: load(P29, { app: P29.appH, fehler: fe.b }) };
  const kat = (w, q) => { setze(w, "#searchInput", q, ["input"]); return karten(w).map(c => c.id); };
  const smart = (w, k, q) => { w.__P25_EVAL = null; const d = w.document; d.querySelector("#smartInput").value = q;
    d.querySelector("#smartSearchForm").dispatchEvent(new w.Event("submit", { cancelable: true }));
    const cards = [...d.querySelectorAll("#smartResults .smart-result-card")];
    return { gezeigt: cards.map(c => KM[k][`${txt(c.querySelector("h3"))}|${txt(c.querySelector(".smart-result-provider"))}`] || "?"),
      texte: cards.map(c => txt(c)), titel: cards.map(c => txt(c.querySelector("h3"))), status: txt(d.querySelector("#smartStatus")),
      kandidaten: (w.__P25_EVAL || []).map(i => [i.offer.id, i.score]), text: txt(d.querySelector("#smartOutput")) }; };
  const ist = [], gleich = [], fehl = [];
  for (const [art, liste] of [["katalog", [...Q60, ...E221]], ["smart", Q60]]) for (const [qid, q] of liste) {
    const z = []; const dazu = (e, id, v, n) => z.push({ suchart: art, anfrage_id: qid, ebene: e, angebot_id: id, vorher: v, nachher: n });
    if (art === "katalog") {
      const a = kat(W.a, q), b = kat(W.b, q), A = new Set(a), B = new Set(b);
      for (const id of a) if (!B.has(id)) dazu("treffer", id, "ja", "nein");
      for (const id of b) if (!A.has(id)) dazu("treffer", id, "nein", "ja");
      if (!z.length && !same(a, b)) fehl.push(`${qid} katalog: Reihenfolge verschieden`);
    } else {
      const a = smart(W.a, "a", q), b = smart(W.b, "b", q), A = Object.fromEntries(a.kandidaten), B = Object.fromEntries(b.kandidaten);
      for (const [id, s] of a.kandidaten) if (!(id in B)) dazu("kandidat", id, `ja (${s})`, "nein");
      for (const [id, s] of b.kandidaten) if (!(id in A)) dazu("kandidat", id, "nein", `ja (${s})`);
      for (const [id, s] of a.kandidaten) if (id in B && B[id] !== s) dazu("punktzahl", id, String(s), String(B[id]));
      for (const id of a.gezeigt) if (!b.gezeigt.includes(id)) dazu("gezeigt", id, "ja", "nein");
      for (const id of b.gezeigt) if (!a.gezeigt.includes(id)) dazu("gezeigt", id, "nein", "ja");
      if (a.status !== b.status) dazu("status", "-", a.status, b.status);
      if (!z.length) {
        if (!same(a.gezeigt, b.gezeigt)) {   // nur Tausch bei gleichem Titel (Gleichstand, E247)
          const tausch = same([...a.gezeigt].sort(), [...b.gezeigt].sort()) && a.gezeigt.every((id, i) => id === b.gezeigt[i] || a.titel[i] === b.titel[i]);
          if (tausch) gleich.push({ anfrage: qid, vorher: a.gezeigt, nachher: b.gezeigt, titel: [...new Set(a.titel.filter((t, i) => a.gezeigt[i] !== b.gezeigt[i]))] });
          else fehl.push(`${qid} smart: Reihenfolge ${a.gezeigt} ≠ ${b.gezeigt}`);
        } else if (a.text !== b.text) fehl.push(`${qid} smart: Text verschieden ohne Treffer-Änderung`);
        const kb = Object.fromEntries(b.gezeigt.map((id, i) => [id, b.texte[i]]));
        if (a.gezeigt.some((id, i) => kb[id] !== a.texte[i])) fehl.push(`${qid} smart: Kartentext verschieden`);
      }
    }
    ist.push(...z);
  }
  const sollK = SOLL.map(key).sort(), istK = ist.map(r => key({ ...r })).sort();
  const nurIst = istK.filter(k => !sollK.includes(k)), nurSoll = sollK.filter(k => !istK.includes(k));
  check(`P04 ${S}`, `Smart- (60) und Katalogsuche (60 + 4 Trennzeichen): Änderungen gegenüber P28 = Sollliste U2 (${SOLL.length} Zeilen), Reihenfolge sonst gleich, Gleichstände nach E247 einzeln aufgeführt; keine JS-Fehler`,
    !nurIst.length && !nurSoll.length && !fehl.length && !fe.a.length && !fe.b.length,
    `Ist ${ist.length}, Soll ${SOLL.length}; nur Ist ${nurIst.slice(0, 2).map(k => k.split("\u0001").join("/"))}; nur Soll ${nurSoll.slice(0, 2).map(k => k.split("\u0001").join("/"))}; ${fehl.slice(0, 3).join("; ")}; Gleichstände ${gleich.length}`);
  proto.P04 = { ist: ist.length, soll: SOLL.length, nur_ist: nurIst, nur_soll: nurSoll, gleichstaende: gleich, fehl };
  W.a.close(); W.b.close();
}
fs.writeFileSync(path.join(OUT, `test_paket29_anzeige_${S}${NUR ? "_" + NUR : ""}.json`), JSON.stringify({ results, proto }, null, 1));
const n = s => results.filter(r => r.status === s).length;
console.log(`\n${n("PASS")} PASS · ${n("FAIL")} FAIL`);
process.exit(n("FAIL") ? 1 : 0);
