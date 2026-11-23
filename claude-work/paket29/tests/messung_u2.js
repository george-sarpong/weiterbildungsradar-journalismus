// Paket 29 U2 (SPEZIFIKATION_PAKET29_20261123.md §4 U2, §7 V3, V5): Messung vor dem Code.
// Vergleicht die Suche von app-v43.js (vorher) mit einer Testkopie, in der nur der Suchtext nach paket29/config/a3_suchtext.json
// ersetzt ist (nachher = Soll für app-v44.js), auf den P28-Releases am Stichtag S (gebaut mit build_release_p28.py).
// Ausgaben (paket29/out/u2/): messliste_<S>.csv (je Angebot und Feld Rohtext, Anzeigetext, Wörter nur roh / nur Anzeige),
// sollliste_<S>.csv (je geänderter Treffer: Suchart, Anfrage, Ebene, Angebot, vorher, nachher, begründendes Feld),
// zusammenfassung_<S>.json. paket29/scripts/sollliste_u2.py fügt die drei Stichtage zu paket29/out/sollliste_u2.csv zusammen.
// Anfragen: 60 (T01–T20, 40 virtuelle wie P28) in Smart- und Katalogsuche; 4 Anfragen mit Trennzeichen (E221) in der
// Katalogsuche; Wortprobe: jedes Wort, das nur im Rohtext oder nur im Anzeigetext eines Felds steht, als Einwort-Anfrage in
// beiden Sucharten (zusätzlich, macht jede Wirkung einzeln sichtbar).
// Aufruf (aus claude-work/): TZ=Europe/Zurich NODE_PATH=<nm> REL=<p28-release> S=JJJJ-MM-TT node paket29/tests/messung_u2.js
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { JSDOM, VirtualConsole } = require("jsdom");
const read = p => fs.readFileSync(p, "utf8"), sha = b => crypto.createHash("sha256").update(b).digest("hex");
const CW = path.resolve(__dirname, "../.."), OUT = path.join(CW, "paket29/out/u2");
const REL = path.resolve(process.env.REL || ""), S = process.env.S || "";
if (!/^\d{4}-\d{2}-\d{2}$/.test(S) || !fs.existsSync(path.join(REL, "website/index.html"))) throw new Error("REL und S setzen");
if (process.env.TZ !== "Europe/Zurich") throw new Error("TZ=Europe/Zurich fehlt");
const prot = JSON.parse(read(path.join(REL, "BAUPROTOKOLL.json")));
if (prot.stichtag !== S) throw new Error(`Release hat Stichtag ${prot.stichtag}, nicht ${S}`);
const RWEB = path.join(REL, "website"), RIDX = read(path.join(RWEB, "index.html"));
const SKR = [...RIDX.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const APP = read(path.join(CW, "paket22/website/app-v43.js"));
if (sha(APP) !== "ada38d5ed342572b2b3e0daa476d9e6b4186426841047fb9a1655a6663789020" || SKR[2] !== "app-v43.js") throw new Error("app-v43.js");
const DATA = read(path.join(RWEB, SKR[0])), SMART = read(path.join(RWEB, SKR[1]));
const OFFERS = JSON.parse(DATA.slice(DATA.indexOf("["), DATA.lastIndexOf("]") + 1));
const KEY = {}; for (const o of OFFERS) { const k = `${o.title}|${o.provider}`; KEY[k] = KEY[k] ? KEY[k] + "|DUBLETTE" : o.id; }
const INDEX = RIDX.replace(/<script src="[^"]+"><\/script>/g, "");

// ---------- Testkopien ----------
const CFG = JSON.parse(read(path.join(CW, "paket29/config/a3_suchtext.json")));
const ein = (t, a, b) => { if (t.split(a).length !== 2) throw new Error("nicht eindeutig: " + a.slice(0, 60)); return t.replace(a, () => b); };
const HAKEN = "    evaluated.sort((a, b) => {", ENDE = "  applyUrlState();\n  render();\n})();";
const EXPOSE = "  window.__P29 = { labels, humanizeTokens, neutralMissing, readableCodes, publicStart, placeLabel, currentRegion, languageBadge,\n"
  + "    compactPrice, compactAccess, placeSearchText, normalize, parseSmartQuery, smartHaystack, offers };\n";
const mitHaken = t => ein(ein(t, HAKEN, "    window.__P25_EVAL = evaluated;\n" + HAKEN), ENDE, EXPOSE + ENDE);
let NEU = APP; for (const e of CFG.ersetzungen) NEU = ein(NEU, e.alt, e.neu);
const APP_VOR = mitHaken(APP), APP_NACH = mitHaken(NEU);

const DATEFIX = s => `(() => { const R = Date; const F = new R("${s}T12:00:00").getTime();
  class D extends R { constructor(...a) { a.length ? super(...a) : super(F); } static now() { return F; } }
  window.Date = D; })();`;
function load(app, fehler) {
  const vc = new VirtualConsole(); vc.on("jsdomError", e => fehler.push(String(e && e.message || e)));
  const dom = new JSDOM(INDEX, { url: "https://mediaskills.ch/", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window; w.eval(DATEFIX(S)); w.eval(DATA); w.eval(SMART); w.eval(app); return w;
}
const txt = n => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------- Felder (Matrix V3) ----------
const FELDER = {
  smart: { format: [o => o.format, (P, o) => P.humanizeTokens(o.format, P.labels.format)],
    duration: [o => o.duration, (P, o) => P.neutralMissing(P.readableCodes(o.duration), "Dauer")],
    start: [o => o.start, (P, o) => P.neutralMissing(P.readableCodes(P.publicStart(o)), "Start")],
    region: [o => o.region, (P, o) => P.placeLabel(o)] },
  katalog: { access: [o => o.access, (P, o) => P.compactAccess(o)], priceDisplay: [o => o.priceDisplay, (P, o) => P.compactPrice(o)],
    format: [o => o.format, (P, o) => P.humanizeTokens(o.format, P.labels.format)],
    duration: [o => o.duration, (P, o) => P.neutralMissing(P.readableCodes(o.duration), "Dauer")],
    start: [o => o.start, (P, o) => P.neutralMissing(P.readableCodes(P.publicStart(o)), "Start")],
    language: [o => o.language, (P, o) => P.languageBadge(o)], region: [(o, P) => P.currentRegion(o), (P, o) => P.placeLabel(o)] }
};
const woerter = (P, s) => [...new Set(P.normalize(s).split(/[^a-z0-9ß]+/).filter(Boolean))];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const fV = [], fN = [], fO = [];
  const WV = load(APP_VOR, fV), WN = load(APP_NACH, fN), WO = load(APP, fO);   // WO = Original-App (Haken-Kontrolle)
  const PV = WV.__P29, PN = WN.__P29;
  const sichtbar = PV.offers.map(o => o.id);
  if (!same(sichtbar, PN.offers.map(o => o.id))) throw new Error("sichtbare Angebote vorher ≠ nachher");

  // ---------- Messliste ----------
  const mess = [["stichtag", "angebot_id", "suchart", "feld", "rohtext", "anzeigetext", "woerter_nur_roh", "woerter_nur_anzeige"]];
  const probe = new Set(); const feldZahl = {};
  for (const o of PV.offers) for (const [art, fs_] of Object.entries(FELDER)) for (const [f, [roh, anz]] of Object.entries(fs_)) {
    const r = String(roh(o, PV) ?? ""), a = String(anz(PV, o) ?? "");
    const wr = woerter(PV, r), wa = woerter(PV, a), nurR = wr.filter(x => !wa.includes(x)), nurA = wa.filter(x => !wr.includes(x));
    const k = `${art}.${f}`; feldZahl[k] = feldZahl[k] || { angebote: 0, verschieden: 0, mit_nur_roh: 0 }; feldZahl[k].angebote++;
    if (PV.normalize(r) === PV.normalize(a)) continue;
    feldZahl[k].verschieden++; if (nurR.length) feldZahl[k].mit_nur_roh++;
    nurR.concat(nurA).forEach(x => probe.add(x));
    mess.push([S, o.id, art, f, r, a, nurR.join(" "), nurA.join(" ")]);
  }

  // ---------- Anfragen ----------
  const p27 = read(path.join(CW, "paket27/website/data-p27.js")), P27 = JSON.parse(p27.slice(p27.indexOf("["), p27.lastIndexOf("]") + 1));
  const T = [["T01", "Datenjournalismus, CHF 800, 2 Tage"], ["T02", "Datenjournalismus, CHF 800"], ["T03", "Datenjournalismus, CHF 511"],
    ["T04", "500 Euro"], ["T05", "Datenjournalismus, 300 Pfund"], ["T06", "kostenlos"], ["T07", "Kurs für Journalistinnen, CHF 500"],
    ["T08", "Journalismus"], ["T09", P27.find(o => o.id === "PCC-P08").title], ["T10", "Journalismus Kurs Deutschland"], ["T11", "Fotografie, CHF 1000"], ["T12", "Recherche"],
    ["T13", "Mobile Reporting, unter CHF 300"], ["T14", "Podcast produzieren, online"], ["T15", "KI im Journalismus, Zürich"],
    ["T16", "Videojournalismus, 3 Tage"], ["T17", "Bildbearbeitung für Fotojournalismus"], ["T18", "Social Media und Audience"],
    ["T19", "Moderation, 1000 Euro"], ["T20", "Datenvisualisierung kostenlos"]];
  const vt = read(path.join(CW, "paket15/tests/virtuelle_tests.js"));
  const V = eval(vt.slice(vt.indexOf("const Q = [") + "const Q = ".length, vt.indexOf("];", vt.indexOf("const Q = [")) + 1));
  if (V.length !== 40) throw new Error("virtuelle_tests.js: nicht 40");
  const Q60 = [...T, ...V.map(([g, q], i) => [`V${String(i + 1).padStart(2, "0")} ${g}`, q])];
  const E221 = [["E221a", "FR|EN"], ["E221b", "DE/EN"], ["E221c", "PRÄSENZ|ONLINE LIVE"], ["E221d", "|"]];
  const WP = [...probe].sort().map(x => [`W ${x}`, x]);
  const ANFRAGEN = { smart: [...Q60, ...WP], katalog: [...Q60, ...E221, ...WP] };

  const katalog = (w, q) => { const e = w.document.querySelector("#searchInput"); e.value = q; e.dispatchEvent(new w.Event("input", { bubbles: true }));
    return { zahl: txt(w.document.querySelector("#resultCount")), ids: [...w.document.querySelectorAll("#cards article.card")].map(c => c.dataset.offerId) }; };
  const smart = (w, q) => { w.__P25_EVAL = null; const d = w.document; d.querySelector("#smartInput").value = q;
    d.querySelector("#smartSearchForm").dispatchEvent(new w.Event("submit", { cancelable: true }));
    const cards = [...d.querySelectorAll("#smartResults .smart-result-card")].map(c => KEY[`${txt(c.querySelector("h3"))}|${txt(c.querySelector(".smart-result-provider"))}`] || "?");
    const ev = w.__P25_EVAL ? w.__P25_EVAL.map(i => [i.offer.id, i.score]) : [];
    return { gezeigt: cards, status: txt(d.querySelector("#smartStatus")), kandidaten: ev, text: txt(d.querySelector("#smartOutput")) }; };

  // begründendes Feld: Felder, in denen ein Wort der Anfrage im Roh- und im Anzeigetext verschieden vorkommt
  const begruende = (art, id, terme) => {
    const o = PV.offers.find(x => x.id === id); if (!o) return "?";
    const f = Object.entries(FELDER[art]).filter(([, [roh, anz]]) => {
      const r = PV.normalize(roh(o, PV) ?? ""), a = PV.normalize(anz(PV, o) ?? "");
      return terme.some(t => r.includes(t) !== a.includes(t));
    }).map(([k]) => k);
    return f.join("|") || "nicht zuzuordnen";
  };
  const soll = [["stichtag", "suchart", "anfrage_id", "anfrage", "ebene", "angebot_id", "vorher", "nachher", "feld"]];
  const proAnfrage = {}; let hakenAbw = 0;
  for (const art of ["katalog", "smart"]) for (const [qid, q] of ANFRAGEN[art]) {
    const a = art === "katalog" ? katalog(WV, q) : smart(WV, q), b = art === "katalog" ? katalog(WN, q) : smart(WN, q);
    if (Q60.some(x => x[0] === qid)) {   // Haken-Kontrolle: Testkopie vorher = Original-App
      const o = art === "katalog" ? katalog(WO, q) : smart(WO, q);
      if (art === "katalog" ? !same(o, a) : !same([o.gezeigt, o.status, o.text], [a.gezeigt, a.status, a.text])) hakenAbw++;
    }
    const terme = art === "katalog" ? PV.normalize(q.trim()).split(/\s+/).filter(Boolean) : PV.parseSmartQuery(q).tokens.map(t => t.replace(/^\^/, ""));
    const zeilen = [];
    const dazu = (ebene, id, v, n) => zeilen.push([S, art, qid, q, ebene, id, v, n, id === "-" ? "-" : begruende(art, id, terme)]);
    if (art === "katalog") {
      const A = new Set(a.ids), B = new Set(b.ids);
      for (const id of a.ids) if (!B.has(id)) dazu("treffer", id, "ja", "nein");
      for (const id of b.ids) if (!A.has(id)) dazu("treffer", id, "nein", "ja");
      if (!zeilen.length && !same(a.ids, b.ids)) dazu("reihenfolge", "-", a.ids.join(" "), b.ids.join(" "));
    } else {
      const A = Object.fromEntries(a.kandidaten), B = Object.fromEntries(b.kandidaten);
      for (const [id, s] of a.kandidaten) if (!(id in B)) dazu("kandidat", id, `ja (${s})`, "nein");
      for (const [id, s] of b.kandidaten) if (!(id in A)) dazu("kandidat", id, "nein", `ja (${s})`);
      for (const [id, s] of a.kandidaten) if (id in B && B[id] !== s) dazu("punktzahl", id, String(s), String(B[id]));
      for (const id of a.gezeigt) if (!b.gezeigt.includes(id)) dazu("gezeigt", id, "ja", "nein");
      for (const id of b.gezeigt) if (!a.gezeigt.includes(id)) dazu("gezeigt", id, "nein", "ja");
      if (a.status !== b.status) dazu("status", "-", a.status, b.status);
      if (!zeilen.length && a.text !== b.text) dazu("text", "-", a.text.slice(0, 120), b.text.slice(0, 120));
    }
    soll.push(...zeilen);
    proAnfrage[`${art} ${qid}`] = { anfrage: q, vorher: art === "katalog" ? a.ids.length : a.kandidaten.length, nachher: art === "katalog" ? b.ids.length : b.kandidaten.length, aenderungen: zeilen.length };
  }
  const csv = rows => rows.map(r => r.map(v => { const s = String(v ?? ""); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(",")).join("\n") + "\n";
  fs.writeFileSync(path.join(OUT, `messliste_${S}.csv`), csv(mess));
  fs.writeFileSync(path.join(OUT, `sollliste_${S}.csv`), csv(soll));
  const geaendert = a => Object.entries(proAnfrage).filter(([k, v]) => k.startsWith(a) && v.aenderungen).map(([k]) => k);
  const zus = { stichtag: S, release: path.basename(REL), app: "app-v43.js ada38d5e…", jsdom: require("jsdom/package.json").version, sichtbar: sichtbar.length,
    felder: feldZahl, wortprobe: WP.length, anfragen: { smart: ANFRAGEN.smart.length, katalog: ANFRAGEN.katalog.length },
    geaendert_q60: { katalog: geaendert("katalog ").filter(k => /katalog [TV]\d/.test(k)), smart: geaendert("smart ").filter(k => /smart [TV]\d/.test(k)) },
    geaendert_e221: geaendert("katalog E221"), sollzeilen: soll.length - 1, haken_abweichungen: hakenAbw, js_fehler: [...fV, ...fN, ...fO], je_anfrage: proAnfrage };
  fs.writeFileSync(path.join(OUT, `zusammenfassung_${S}.json`), JSON.stringify(zus, null, 1) + "\n");
  console.log(`OK U2 ${S}: ${sichtbar.length} sichtbar; Messliste ${mess.length - 1} Zeilen; Sollliste ${soll.length - 1} Zeilen; `
    + `Q60 geändert Katalog ${zus.geaendert_q60.katalog.length}, Smart ${zus.geaendert_q60.smart.length}; E221 geändert ${zus.geaendert_e221.length}; `
    + `Wortprobe ${WP.length}; Haken-Abweichungen ${hakenAbw}; JS-Fehler ${zus.js_fehler.length}`);
  for (const w of [WV, WN, WO]) w.close();
})().catch(e => { console.error(e); process.exit(2); });
