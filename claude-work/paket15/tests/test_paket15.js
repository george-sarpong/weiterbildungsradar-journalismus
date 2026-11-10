// Paket 15 – Abnahmetests für die Suchverbesserungen A–D (E110)
// Aufruf (im Repo-Root): NODE_PATH=<tools>/node_modules node claude-work/paket15/tests/test_paket15.js
"use strict";
const fs = require("fs"), path = require("path"), http = require("http"), crypto = require("crypto"), { execFileSync } = require("child_process");
const { chromium } = require("playwright-core");
const ROOT = process.cwd(), W = path.join(ROOT, "claude-work"), DOCS = path.join(ROOT, "docs");
const sha = p => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const results = [];
const check = (id, ok, info) => { results.push({ id, ok: Boolean(ok), info }); console.log(`${ok ? "PASS" : "FAIL"} ${id} – ${info}`); };

// T1 Reproduzierbarkeit: zweimal erzeugen → gleiche Datei
const app = path.join(W, "paket15/website/app-v41.js");
execFileSync("python3", [path.join(W, "paket15/scripts/port_p15.py")]); const h1 = sha(app);
execFileSync("python3", [path.join(W, "paket15/scripts/port_p15.py")]); const h2 = sha(app);
check("T1", h1 === h2, `app-v41.js reproduzierbar (${h1.slice(0, 12)})`);

// T2 Nur das Script wechselt: alle anderen Website-Dateien identisch mit Paket 14 (index nur app-v40 → app-v41)
const others = ["404.html", "datenschutz.html", "impressum.html", "methodik.html", "data-p14.js"];
const same = others.every(f => sha(path.join(W, "paket14/website", f)) === sha(path.join(W, "paket15/website", f)));
const idx14 = fs.readFileSync(path.join(W, "paket14/website/index.html"), "utf8").replaceAll("app-v40.js", "app-v41.js");
const idx15 = fs.readFileSync(path.join(W, "paket15/website/index.html"), "utf8");
check("T2", same && idx14 === idx15, "übrige Dateien unverändert, index.html nur Script-Name getauscht");

const serve = dir => new Promise(res => { const s = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/^\/$/, "/index.html")); if (!fs.existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "Content-Type": p.endsWith(".js") ? "text/javascript; charset=utf-8" : p.endsWith(".css") ? "text/css" : "text/html; charset=utf-8" }); fs.createReadStream(p).pipe(r); }).listen(0, "127.0.0.1", () => res(s)); });

(async () => {
  const srv = await serve(DOCS), base = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome" });
  const p = await (await b.newContext({ locale: "de-CH", timezoneId: "Europe/Zurich" })).newPage();
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(base); await p.waitForSelector("#cards .card");
  check("T3", (await p.evaluate(() => [...document.scripts].some(s => /app-v41\.js/.test(s.src)))), "Abnahme-Stand docs/ lädt app-v41.js");
  const ask = async q => { await p.fill("#smartInput", q); await p.click(".smart-submit"); await p.waitForTimeout(250);
    return p.evaluate(() => { const t = s => (s || "").replace(/\s+/g, " ").trim();
      return { chips: [...document.querySelectorAll("#smartUnderstood .smart-chip")].map(c => t(c.innerText)), status: t(document.querySelector("#smartStatus").innerText),
        cards: [...document.querySelectorAll("#smartResults .smart-result-card")].map(c => t(c.innerText)), all: t(document.querySelector("#smartOutput").innerText) }; }); };
  const count = s => { const m = s.match(/^([\d'’]+) passende/); return m ? Number(m[1].replace(/['’]/g, "")) : 0; };

  // A: Personen-, Form- und Füllwörter sind kein Thema
  let r = await ask("Führungskurs für Chefredaktor:innen");
  check("A1", r.chips.includes("Thema: fuhrung") && count(r.status) > 0 && count(r.status) < 50 && !/\^/.test(r.all), `«Führungskurs» → nur Führung, nicht «Durchführung» (${r.status})`);
  r = await ask("Ich bin freie Journalistin und suche einen Kurs zu Recherche unter 500 Franken");
  check("A2", r.chips.includes("Thema: recherche") && r.chips.some(c => c.startsWith("Budget: CHF 500")), `Satz auf Thema + Budget reduziert (${r.chips.join(" | ")})`);
  r = await ask("cours de vidéo en ligne");
  check("A3", r.chips.includes("Thema: video") && r.chips.includes("Durchführung: Online") && count(r.status) > 0, `Französisch verstanden (${r.chips.join(" | ")})`);
  r = await ask("Präsenzkurs Fotojournalismus");
  check("A4", r.chips.includes("Thema: fotojournalismus") && r.chips.includes("Durchführung: Präsenz"), `«Präsenzkurs» ist Form, nicht Thema (${r.chips.join(" | ")})`);
  // B: Teiltreffer und Nulltreffer-Hinweis
  r = await ask("Selbstständig als Journalist, Business und Akquise");
  check("B1", /passen? teilweise/.test(r.status) && r.cards.length > 0 && r.cards.every(c => /passt teilweise/.test(c)), `Teiltreffer gekennzeichnet (${r.status})`);
  r = await ask("corso giornalismo Lugano");
  check("B2", /^Keine bestätigten Treffer\. Zum Thema allein gibt es [\d'’]+ Angebote\. Lass Ort weg/.test(r.status), `Nulltreffer mit Hinweis (${r.status})`);
  // C: Orte als Kursort
  r = await ask("Kurs in Basel");
  check("C1", r.chips.includes("Ort: Basel") && !r.chips.some(c => c.startsWith("Thema")) && r.cards.length && r.cards.every(c => /basel/i.test(c)), `Basel als Kursort (${r.status})`);
  r = await ask("formation journalisme Genève");
  check("C2", r.chips.includes("Ort: Genf") && r.cards.length && r.cards.every(c => /gen[eè]v|genf/i.test(c)), `Genève = Genf (${r.status})`);
  r = await ask("KI im Journalismus, Zürich");
  check("C3", r.chips.includes("Ort: Zürich") && r.cards.every(c => /z[uü]rich/i.test(c)), `Zürich als Kursort (${r.status})`);
  // D: Synonyme
  r = await ask("Verifikation und Faktencheck");
  check("D1", count(r.status) > 0, `Faktencheck/Verifikation (${r.status})`);
  r = await ask("data journalism course online English");
  check("D2", r.chips.includes("Thema: datenjournalismus") && r.chips.includes("Sprache: Englisch"), `Englisch verstanden (${r.chips.join(" | ")})`);
  // Regression: frühere Owner-Fälle unverändert
  r = await ask("Ich möchte einen Kurs für Medienmanagement oder Datenjournalismus machen für 2000 chf");
  check("R1", r.chips.includes("Thema: medienmanagement oder datenjournalismus") && count(r.status) > 0, `E106 «oder» (${r.status})`);
  r = await ask("was gibt es für Redaktionsmanagement für 9000 CHF");
  check("R2", count(r.status) > 0 && r.cards.some(c => /Redaktionsmanagement/.test(c) && /1.150/.test(c)), `E107 Mediencampus-Preis (${r.status})`);
  check("R3", errs.length === 0, `JS-Fehler: ${errs.length}`);
  await b.close(); srv.close();
  const failed = results.filter(x => !x.ok).length;
  fs.writeFileSync(path.join(W, "paket15/out/test_paket15.json"), JSON.stringify({ bestanden: results.length - failed, total: results.length, results }, null, 1));
  console.log(`\n${results.length - failed}/${results.length} bestanden`);
  process.exit(failed ? 1 : 0);
})();
