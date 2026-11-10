// Paket 15 – Virtuelle Nutzertests: realistische Suchanfragen im Browser auf dem Abnahme-Stand docs/
// Aufruf (im Repo-Root): NODE_PATH=<tools>/node_modules node claude-work/paket15/tests/virtuelle_tests.js
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { chromium } = require("playwright-core");
const DOCS = path.join(process.cwd(), "docs"), OUT = path.join(process.cwd(), "claude-work/paket15/out");
const Q = [
 // Freie Journalist:innen
 ["Freie", "Ich bin freie Journalistin und suche einen Kurs zu Recherche unter 500 Franken"],
 ["Freie", "günstiger Schreibkurs für Freie"],
 ["Freie", "Selbstständig als Journalist, Business und Akquise"],
 ["Freie", "Fotografie Kurs online bis 300 CHF"],
 // Redaktion / Lokal
 ["Redaktion", "Datenjournalismus Einführung"],
 ["Redaktion", "Verifikation und Faktencheck"],
 ["Redaktion", "KI im Journalismus, Zürich"],
 ["Redaktion", "Interviewtechnik"],
 ["Redaktion", "Lokaljournalismus Workshop"],
 ["Redaktion", "Newsletter erstellen"],
 ["Redaktion", "Podcast produzieren"],
 ["Redaktion", "Video fürs Handy, Mobile Reporting"],
 ["Redaktion", "Social Media für Redaktionen"],
 ["Redaktion", "Storytelling für Online"],
 ["Redaktion", "Medienrecht Grundlagen"],
 ["Redaktion", "Schreiben lernen, 2 Tage"],
 // Führung / Management
 ["Führung", "Führungskurs für Chefredaktor:innen"],
 ["Führung", "Redaktionsmanagement für 9000 CHF"],
 ["Führung", "Medienmanagement oder Datenjournalismus für 2000 CHF"],
 ["Führung", "Change Management in Medienunternehmen"],
 ["Führung", "MAS oder CAS Journalismus"],
 // Einsteiger / Studium
 ["Einstieg", "Journalismus Ausbildung Einstieg"],
 ["Einstieg", "Bachelor Journalismus"],
 ["Einstieg", "Volontariat"],
 // Budget / Form / Ort
 ["Budget", "kostenlos online"],
 ["Budget", "Weiterbildung bis 1000 CHF in Bern"],
 ["Budget", "Webinar gratis KI"],
 ["Budget", "Kurs in Basel"],
 ["Budget", "Weiterbildung in Luzern unter 2000 Franken"],
 ["Budget", "Präsenzkurs Fotojournalismus"],
 // Romandie / Tessin / Englisch
 ["Sprache", "formation journalisme Genève"],
 ["Sprache", "cours de vidéo en ligne"],
 ["Sprache", "corso giornalismo Lugano"],
 ["Sprache", "data journalism course online English"],
 // Spezifische Fälle
 ["Spezial", "Wissenschaftsjournalismus"],
 ["Spezial", "Sportjournalismus"],
 ["Spezial", "Lektorat und Korrektorat"],
 ["Spezial", "Barrierefreie Kommunikation"],
 ["Spezial", "Audio Storytelling, Masterclass"],
 ["Spezial", "Sicherheit für Journalisten, digitale Sicherheit"]
];
const serve = dir => new Promise(res => { const s = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/^\/$/, "/index.html")); if (!fs.existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "Content-Type": p.endsWith(".js") ? "text/javascript; charset=utf-8" : p.endsWith(".css") ? "text/css" : "text/html; charset=utf-8" }); fs.createReadStream(p).pipe(r); }).listen(0, "127.0.0.1", () => res(s)); });
(async () => {
  const srv = await serve(DOCS), base = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome" });
  const p = await (await b.newContext({ locale: "de-CH", timezoneId: "Europe/Zurich" })).newPage();
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(base); await p.waitForSelector("#cards .card");
  const out = [];
  for (const [gruppe, q] of Q) {
    await p.fill("#smartInput", q); await p.click(".smart-submit"); await p.waitForTimeout(250);
    out.push(await p.evaluate(([gruppe, q]) => {
      const t = s => (s || "").replace(/\s+/g, " ").trim();
      return { gruppe, q, verstanden: t((document.querySelector("#smartUnderstood") || {}).innerText), status: t((document.querySelector("#smartStatus") || {}).innerText),
        karten: [...document.querySelectorAll("#smartResults .smart-result-card")].map(c => ({ titel: t((c.querySelector("h3,h4") || {}).innerText), anbieter: t((c.querySelector(".smart-result-provider") || {}).innerText),
          badges: [...c.querySelectorAll(".smart-chip, .badge, .smart-result-meta span")].map(x => t(x.innerText)).filter(Boolean).slice(0, 6), warum: t((c.querySelector(".smart-fit") || {}).innerText), budget: t((c.querySelector(".smart-budget") || {}).innerText).slice(0, 120) })) };
    }, [gruppe, q]));
  }
  await b.close(); srv.close();
  fs.writeFileSync(path.join(OUT, "virtuelle_tests.json"), JSON.stringify({ fehler: errs, ergebnisse: out }, null, 1));
  for (const r of out) console.log(`\n[${r.gruppe}] ${r.q}\n  ${r.verstanden} → ${r.status}` + r.karten.map(k => `\n   • ${k.titel} (${k.anbieter}) ${k.badges.join(" | ")} ${k.warum}`).join(""));
  console.log("\nJS-Fehler:", errs.length);
})();
