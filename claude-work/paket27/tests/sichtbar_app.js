// Paket 27 P09/U3: sichtbare IDs, wie app-v43.js sie in jsdom am Stichtag rendert (renderApp aus build_liste_p25.js),
// mit paket27/website/data-p27.js und paket27/out/smart-search-data-p27.json. Ausgabe JSON {Stichtag: [IDs sortiert]}.
// Aufruf (aus claude-work/): TZ=Europe/Zurich NODE_PATH=<nm> node paket27/tests/sichtbar_app.js 2026-11-20 …
"use strict";
const path = require("path"), fs = require("fs");
const CW = path.resolve(__dirname, "../..");
process.env.WEBSITE = path.join(CW, "paket27/website"); process.env.OUTDIR = path.join(CW, "paket27/out");
process.env.DATA = "data-p27.js"; process.env.SMART = path.join(CW, "paket27/out/smart-search-data-p27.json");
const { renderApp } = require(path.join(CW, "paket25/scripts/build_liste_p25.js"));
const idx = fs.readFileSync(path.join(CW, "paket27/website/index.html"), "utf8"), out = {};
for (const d of process.argv.slice(2)) out[d] = [...renderApp(idx, d).document.querySelectorAll("#cards article.card")].map(c => c.dataset.offerId).sort();
process.stdout.write(JSON.stringify(out));
