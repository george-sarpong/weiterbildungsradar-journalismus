// Monatsbuild 24.11. (E296): Bildschirmvergleich der vier Unterseiten vor/nach optimiere_release.py in 4 Breiten.
// Aufruf: VORHER=<release>/website NACHHER=<release>/website NODE_PATH=<nm mit playwright> node paket29/tests/test_optimierung.js
const { chromium } = require("playwright");
const fs = require("fs"); const path = require("path");
(async () => {
  const b = await chromium.launch(); const erg = []; let ok = true;
  for (const w of [375, 800, 1100, 1440]) for (const s of ["404.html","datenschutz.html","impressum.html","methodik.html"]) {
    const shots = [];
    for (const rel of [process.env.VORHER, process.env.NACHHER]) {
      const p = await b.newPage({ viewport: { width: w, height: 900 } });
      const fehler = []; p.on("requestfailed", r => fehler.push(r.url())); p.on("console", m => { if (m.type()==="error") fehler.push(m.text()); });
      await p.goto("file://" + path.join(rel, s)); await p.waitForLoadState("networkidle");
      const css = await p.evaluate(() => [...document.styleSheets].map(x => (x.href||"").split("/").pop()));
      shots.push({ png: await p.screenshot({ fullPage: true }), fehler, css }); await p.close();
    }
    const gleich = Buffer.compare(shots[0].png, shots[1].png) === 0;
    if (!gleich || shots[1].fehler.length || shots[1].css.join() !== "styles-v24.css") ok = false;
    erg.push(`${gleich && !shots[1].fehler.length ? "PASS" : "FAIL"} ${s} ${w}px: Bild ${gleich ? "pixelgleich" : "VERSCHIEDEN"}; CSS vorher ${shots[0].css} nachher ${shots[1].css}; Fehler ${shots[1].fehler.length}`);
  }
  await b.close(); console.log(erg.join("\n")); console.log(ok ? "ALLE PASS" : "FAIL"); process.exit(ok ? 0 : 1);
})();
