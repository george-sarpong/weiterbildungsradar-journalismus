// Paket 29 V2 (SPEZIFIKATION_PAKET29_20261123.md §7.2, B04): Kopie von paket25/scripts/build_liste_p25.js, Logik unverändert.
// Neu als Parameter: App-Datei (APP, Standard app-v44.js) und die Daten- und Smart-Dateien je Markt in Ladereihenfolge
// (DATA, SMART_JS: kommagetrennte Dateinamen im Website-Ordner); die Smart-Daten kommen aus derselben Zusammenführung wie im
// Browser (jede Datei wird nacheinander ausgeführt). build_liste_p25.js bleibt unverändert.
// Kopf der Vorlage (Paket 19, Paket 25):
// | Paket 19 Teil A und C (E151, E154, E155): Kursliste im HTML der Startseite, «Stand der Angaben», sitemap.xml.
// | Die Liste entsteht aus den Karten, die app-v43.js selbst am Stichtag rendert (jsdom, fester Stichtag wie Paket 8):
// | gleiches Sichtbarkeits-Gate (isCurrent + publicationStatus ≠ HOLD), gleiche Formatierung, gleiche Standardsortierung
// | «Zuletzt geprüft» (A3–A5). Keine zweite Logik: das Skript liest nur Texte und Link aus dem gerenderten DOM.
// | Eingang: paket19/website/index.html (Kopie Paket 22), data-p19.js, app-v43.js; paket19/out/smart-search-data-p19.json.
// | Paket 25 (SPEZIFIKATION_PAKET25 A8): Kopie von paket19/scripts/build_liste_p19.js, nur Pfade und Dateinamen als Parameter,
// | Logik unverändert. WEBSITE (Standard paket25/website), OUTDIR (Standard paket25/out), DATA (Dateiname im Website-Ordner,
// | Standard data-p25.js), SMART (Standard <OUTDIR>/smart-search-data-p25.json).
// | Vorheriger Build (C2): VORHER=<ordner mit index.html und sitemap.xml>, Standard = paket22/website/index.html + Live-Sitemap.
// | Aufruf (aus claude-work/): TZ=Europe/Zurich NODE_PATH=<nm> node paket25/scripts/build_liste_p25.js YYYY-MM-DD
// Aufruf (aus claude-work/): TZ=Europe/Zurich NODE_PATH=<nm> WEBSITE=<ordner> OUTDIR=<ordner> DATA=<a.js,b.js> SMART_JS=<c.js,d.js> node paket29/scripts/build_liste_p29.js YYYY-MM-DD
"use strict";
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const CW = path.resolve(__dirname, "../.."), W = path.resolve(process.env.WEBSITE || path.join(CW, "paket29/website")), OUT = path.resolve(process.env.OUTDIR || path.join(CW, "paket29/out"));
const dateiliste = v => String(v || "").split(",").map(s => s.trim()).filter(Boolean);
const DATA = dateiliste(process.env.DATA), SMART_JS = dateiliste(process.env.SMART_JS), APP = process.env.APP || "app-v44.js";
const read = p => fs.readFileSync(p, "utf8");
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const LS = "<!-- P19-LISTE -->", LE = "<!-- /P19-LISTE -->";

// ---------- App am Stichtag rendern ----------
function renderApp(indexHtml, stichtag) {
  const html = indexHtml.replace(/<script src="[^"]+"><\/script>/g, "");
  const dom = new JSDOM(html, { url: "https://mediaskills.ch/", runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.eval(`(() => { const R = Date; const F = new R("${stichtag}T12:00:00").getTime();
    class D extends R { constructor(...a) { a.length ? super(...a) : super(F); } static now() { return F; } }
    window.Date = D; })();`);
  for (const d of DATA) w.eval(read(path.join(W, d)));
  for (const s of SMART_JS) w.eval(read(path.join(W, s)));
  w.eval(read(path.join(W, APP)));
  return w;
}
const txt = n => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
function cardEntries(w) {
  return [...w.document.querySelectorAll("#cards article.card")].map(c => {
    const fact = [...c.querySelectorAll(".fact-item")].find(f => txt(f.querySelector("dt")) === "Preis");
    const ort = [...c.querySelectorAll(".badges .badge")].map(txt).find(t => t.startsWith("Ort: "));
    const a = c.querySelector(".card-links a.source-link");
    return { id: c.dataset.offerId, titel: txt(c.querySelector("h3")), anbieter: txt(c.querySelector(".provider")),
      ort: ort ? ort.slice(5) : null, preis: fact ? txt(fact.querySelector("dd")) : null,
      href: a ? a.getAttribute("href") : null, target: a ? a.getAttribute("target") : null, rel: a ? a.getAttribute("rel") : null };
  });
}
module.exports = { renderApp, cardEntries, LS, LE };
if (require.main !== module) return;
if (!DATA.length || !SMART_JS.length) { console.error("DATA und SMART_JS setzen"); process.exit(2); }
const S0 = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(S0 || "")) { console.error("Stichtag YYYY-MM-DD fehlt"); process.exit(2); }

const quelle = read(path.join(W, "index.html"));
const w = renderApp(quelle, S0);
const E = cardEntries(w);
const all = w.WEITERBILDUNGSRADAR_OFFERS;
if (!E.length || E.some(e => !e.titel || !e.anbieter || e.ort === null || e.preis === null)) { console.error("Karte ohne Pflichtangabe"); process.exit(1); }

// ---------- Liste (A1, A2, A9); <li> ohne Einzug wegen Grössenbudget A10 (300 KB) ----------
const li = e => {
  const t = e.href ? `<a href="${esc(e.href)}" target="${esc(e.target)}" rel="${esc(e.rel)}">${esc(e.titel)}</a>` : esc(e.titel);
  return `<li>${t} · ${esc(e.anbieter)} · Ort: ${esc(e.ort)} · Preis: ${esc(e.preis)}</li>`;
};
// ein gemeinsamer Block im Raster .cards (2 Spalten), damit die Überschrift über der Liste steht; volle Breite = Gestaltung (später)
const liste = `${LS}\n          <div class="static-list">\n          <h3>Alle aktuellen Angebote</h3>\n          <ul>\n${E.map(li).join("\n")}\n          </ul>\n          </div>\n          ${LE}`;
const [y, m, d] = S0.split("-"), stand = `Stand der Angaben: ${d}.${m}.${y}`;

// ---------- index.html ----------
let idx = quelle;
const ersetze = (a, b) => { if (idx.split(a).length !== 2) throw new Error("nicht eindeutig: " + a); idx = idx.replace(a, b); };
// Skriptverweise bleiben wie im Website-Ordner seit Paket 7 (Live-Stand A); build_release.py setzt data-p19, smart-p19, app-v43 (Regressionstests ersetzen sie selbst).
ersetze('<p class="footer-meta">Datenstand: 30. September 2026 · Schweiz, Österreich und Liechtenstein</p>',
        '<p class="footer-meta">Schweiz, Österreich und Liechtenstein</p>');                                   // A6, E154
ersetze('        <div class="cards" id="cards"></div>',
        `        <p class="data-stand">${stand}</p>\n        <div class="cards" id="cards">\n          ${liste}\n        </div>`);
fs.writeFileSync(path.join(W, "index.html"), idx);

// ---------- sitemap.xml (C1–C3) ----------
const VOR = process.env.VORHER;
const vorIndex = read(VOR ? path.join(VOR, "index.html") : path.join(CW, "paket22/website/index.html"));
const vorMap = read(VOR ? path.join(VOR, "sitemap.xml") : path.join(CW, "live-snapshot-20261109/sitemap.xml"));
const block = h => { const i = h.indexOf(LS), j = h.indexOf(LE); return i < 0 || j < 0 ? null : h.slice(i, j + LE.length); };
const vorLast = u => (vorMap.match(new RegExp(`<loc>${u.replace(/[.]/g, "\\.")}</loc><lastmod>(\\d{4}-\\d{2}-\\d{2})</lastmod>`)) || [])[1];
const geaendert = block(vorIndex) !== block(idx);
const lmStart = geaendert ? S0 : vorLast("https://mediaskills.ch/");
const cfg = Object.fromEntries(read(path.join(CW, "paket19/config/sitemap_lastmod.csv")).trim().split("\n").slice(1).map(l => l.split(",")));
const lmMethodik = cfg["/methodik.html"];
if (!lmStart || !/^\d{4}-\d{2}-\d{2}$/.test(lmMethodik || "")) throw new Error("lastmod fehlt");
fs.writeFileSync(path.join(W, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://mediaskills.ch/</loc><lastmod>${lmStart}</lastmod></url>
  <url><loc>https://mediaskills.ch/methodik.html</loc><lastmod>${lmMethodik}</lastmod></url>
</urlset>
`);

// ---------- Zählprotokoll (D1) ----------
const sichtbar = new Set(E.map(e => e.id));
const aus = all.filter(o => !sichtbar.has(o.id));
const prot = { stichtag: S0, angebote: all.length, sichtbar: E.length,
  ausgeblendet: { gesamt: aus.length, HOLD: aus.filter(o => o.publicationStatus === "HOLD").length,
    nicht_aktuell_ohne_HOLD: aus.filter(o => o.publicationStatus !== "HOLD").length },
  ohne_link: E.filter(e => !e.href).map(e => e.id), liste_geaendert: geaendert,
  lastmod: { "/": lmStart, "/methodik.html": lmMethodik },
  index_bytes: Buffer.byteLength(idx), liste_bytes: Buffer.byteLength(liste) };
fs.writeFileSync(path.join(OUT, `zaehlprotokoll_${S0}.json`), JSON.stringify(prot, null, 1) + "\n");
console.log(`OK ${S0}: ${E.length} von ${all.length} sichtbar (HOLD ${prot.ausgeblendet.HOLD}, nicht aktuell ${prot.ausgeblendet.nicht_aktuell_ohne_HOLD}); `
  + `index.html ${(prot.index_bytes / 1024).toFixed(1)} KB; lastmod / ${lmStart}`);
