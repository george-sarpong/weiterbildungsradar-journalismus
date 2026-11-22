// Paket 27 P09/U3: sichtbare IDs, wie app-v43.js sie in jsdom am Stichtag rendert (renderApp aus build_liste_p25.js),
// mit paket27/website/data-p27.js und paket27/out/smart-search-data-p27.json. Ausgabe JSON {Stichtag: [IDs sortiert], _probe: {…}}.
// Aufruf (aus claude-work/): TZ=Europe/Zurich NODE_PATH=<nm> node paket27/tests/sichtbar_app.js 2026-11-20 …
"use strict";
const path = require("path"), fs = require("fs");
const CW = path.resolve(__dirname, "../..");
process.env.WEBSITE = path.join(CW, "paket27/website"); process.env.OUTDIR = path.join(CW, "paket27/out");
process.env.DATA = "data-p27.js"; process.env.SMART = path.join(CW, "paket27/out/smart-search-data-p27.json");
const { renderApp } = require(path.join(CW, "paket25/scripts/build_liste_p25.js"));
const idx = fs.readFileSync(path.join(CW, "paket27/website/index.html"), "utf8"), out = {};
for (const d of process.argv.slice(2)) {
  const w = renderApp(idx, d);
  out[d] = [...w.document.querySelectorAll("#cards article.card")].map(c => c.dataset.offerId).sort();
  // Ladeprobe (Zweitmeinung B06): Die App arbeitet mit data-p27.js (Rohwert aus Lauf 027, nur dort mit «|» ohne Leerzeichen)
  if (!out._probe) { const all = w.WEITERBILDUNGSRADAR_OFFERS; out._probe = { "OFFER-AJM-001": all.find(o => o.id === "OFFER-AJM-001").language, anzahl: all.length }; }
  w.close();
}
process.stdout.write(JSON.stringify(out));
