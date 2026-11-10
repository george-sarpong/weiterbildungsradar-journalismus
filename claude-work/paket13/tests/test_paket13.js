// Paket 13 – Tests für app-v39.js, methodik.html und data-p13.js (Owner-Entscheide E096, E098, E100)
// Aufruf (im Repo-Root): NODE_PATH=<tools>/node_modules STICHTAG=2026-11-09 node claude-work/paket13/tests/test_paket13.js
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), crypto = require("crypto"), { spawnSync } = require("child_process");
const { JSDOM } = require("jsdom");
const CW = path.join(process.cwd(), "claude-work"), W10 = path.join(CW, "paket10/website"), W13 = path.join(CW, "paket13/website"), W7 = path.join(CW, "paket7/website");
const read = f => fs.readFileSync(f, "utf8"), sha = s => crypto.createHash("sha256").update(s).digest("hex");
const T = process.env.STICHTAG || "2026-11-09";
let pass = 0, fail = 0;
const check = (id, name, ok, detail = "") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail ? " – " + detail : ""}`); };
const parse = js => JSON.parse(js.slice(js.indexOf("=") + 1).trim().replace(/;$/, ""));

// P01 Reproduktion
{
  const before = ["app-v39.js", "methodik.html", "data-p13.js"].map(f => sha(read(path.join(W13, f))));
  const r1 = spawnSync("python3", ["-I", "paket13/scripts/port_p13.py"], { cwd: CW }), r2 = spawnSync("python3", ["-I", "paket13/scripts/build_daten_p13.py"], { cwd: CW });
  const after = ["app-v39.js", "methodik.html", "data-p13.js"].map(f => sha(read(path.join(W13, f))));
  check("P01", "Skripte reproduzieren app-v39.js, methodik.html, data-p13.js byte-identisch", r1.status === 0 && r2.status === 0 && before.join() === after.join());
}
// P02 übrige Website-Dateien = Paket 10
{
  const others = fs.readdirSync(W13).filter(f => !["app-v39.js", "methodik.html", "data-p13.js"].includes(f));
  const same = others.every(f => fs.existsSync(path.join(W10, f)) && sha(read(path.join(W10, f))) === sha(read(path.join(W13, f))));
  check("P02", "index, datenschutz, impressum, 404 unverändert gegenüber Paket 10", same && others.length === 4, others.join(", "));
}
// P03 Daten: nur HEAD-003 url geändert, Herkunft vermerkt
{
  const a = parse(read(path.join(W7, "data-p7.js"))), b = parse(read(path.join(W13, "data-p13.js")));
  const diffs = [];
  a.forEach((o, i) => { const p = b[i]; for (const k of new Set([...Object.keys(o), ...Object.keys(p)])) if (JSON.stringify(o[k]) !== JSON.stringify(p[k])) diffs.push(`${o.id}.${k}`); });
  const h = b.find(o => o.id === "OFFER-HEAD-003");
  const soll = ["AT-PROD-OFFER-026.korrekturen", "AT-PROD-OFFER-026.publicationReason", "AT-PROD-OFFER-026.publicationStatus", "AT-PROD-OFFER-040.korrekturen", "AT-PROD-OFFER-040.publicationReason", "AT-PROD-OFFER-040.publicationStatus", "OFFER-HEAD-003.korrekturen", "OFFER-HEAD-003.url"];
  const arch = ["AT-PROD-OFFER-040", "AT-PROD-OFFER-026"].map(id => b.find(o => o.id === id));
  check("P03", "data-p13.js = data-p7.js bis auf URL OFFER-HEAD-003 (E098) und Archiv AT-PROD-OFFER-040/-026 als HOLD (E103), je mit Herkunft",
    a.length === b.length && diffs.sort().join() === soll.join() && h.url === "https://head.hesge.ch/formations/formations-continues/initiation-a-lintelligence-artificielle" && h.korrekturen[0].register === "E098"
    && arch.every(o => o.publicationStatus === "HOLD" && /^ARCHIV/.test(o.publicationReason) && o.korrekturen.every(k => k.register === "E103")),
    diffs.join(", "));
}
// P04 Methodik: genau ein neuer Absatz
{
  const m10 = read(path.join(W10, "methodik.html")), m13 = read(path.join(W13, "methodik.html"));
  const add = "\n        <p>Die Kurzbeschreibungen stammen von den Anbietern. Der Link «Laut Anbieter» führt zur Quelle.</p>";
  check("P04", "Methodik: nur der Satz zu den Kurzbeschreibungen ergänzt (E096)", m13.replace(add, "") === m10 && m13.includes(add));
}
// Karten rendern (jsdom, Stichtag)
const dom = new JSDOM(read(path.join(W13, "index.html")).replace(/<script[^>]*src=[^>]*><\/script>/g, ""), { runScripts: "outside-only", url: "https://mediaskills.ch/", pretendToBeVisual: true });
const w = dom.window;
const RealDate = w.Date; const fixed = new RealDate(`${T}T12:00:00+01:00`).getTime();
w.Date = class extends RealDate { constructor(...a) { super(...(a.length ? a : [fixed])); } static now() { return fixed; } };
w.eval(read(path.join(W13, "data-p13.js")));
w.eval(`window.MEDIA_SKILLS_SMART_DATA = ${read(path.join(CW, "paket3/out/merge_kandidat_smart.json"))};`);
w.eval(read(path.join(W13, "app-v39.js")));
const cards = [...w.document.querySelectorAll("#cards .card")];
// P05 D8
{
  let ok = 0, bad = [];
  for (const c of cards) {
    const d = c.querySelector(".card-description"), a = d.querySelector("a.description-source"), off = c.querySelector(".card-links a.source-link");
    const label = a ? a.getAttribute("aria-label") : "";
    if (a && off && a.href === off.href && a.textContent.trim().startsWith("Laut Anbieter") && label.startsWith("Laut Anbieter") && a.target === "_blank" && /noopener/.test(a.rel)) ok++;
    else if (!a && !off && d.querySelector(".description-source")) ok++;
    else bad.push(c.dataset.offerId);
  }
  check("P05", "Jede Beschreibung endet mit «Laut Anbieter ↗» (gleicher Link wie die Angebotsseite, Name beginnt mit sichtbarem Text, E089)", cards.length > 0 && bad.length === 0, `${ok}/${cards.length}${bad.length ? " · " + bad.slice(0, 5).join(", ") : ""}`);
}
// P06 E100 Niveau
{
  // Niveau-Badge = 2. Badge der Karte. Sprach-Badge «keine Angabe» (24 Karten) ist nicht Teil von E100, nur gezählt.
  const lvl = cards.map(c => c.querySelectorAll(".badges .badge")[1].textContent.trim());
  const bare = lvl.filter(t => t === "keine Angabe").length, niv = lvl.filter(t => t === "Niveau: keine Angabe").length;
  const lang = cards.filter(c => c.querySelectorAll(".badges .badge")[2].textContent.trim() === "keine Angabe").length;
  const exp = cards.filter(c => w.WEITERBILDUNGSRADAR_OFFERS.find(o => o.id === c.dataset.offerId).level === "NICHT_PUBLIZIERT").length;
  const langKA = cards.filter(c => c.querySelectorAll(".badges .badge")[2].textContent.trim() === "Sprache: keine Angabe").length;
  check("P06", "Niveau und Sprache ohne Angabe mit Feldname, nie nur «keine Angabe» (E100, E102)", bare === 0 && niv === exp && exp > 0 && lang === 0 && langKA > 0, `Niveau ${niv} · Sprache ${langKA} Karten`);
}
// P07 Sichtbarkeit unverändert gegenüber Paket 10 (gleiches Datum, gleiche Karten-IDs)
{
  const d2 = new JSDOM(read(path.join(W10, "index.html")).replace(/<script[^>]*src=[^>]*><\/script>/g, ""), { runScripts: "outside-only", url: "https://mediaskills.ch/", pretendToBeVisual: true });
  const w2 = d2.window; w2.Date = w.Date;
  w2.eval(read(path.join(W7, "data-p7.js"))); w2.eval(`window.MEDIA_SKILLS_SMART_DATA = ${read(path.join(CW, "paket3/out/merge_kandidat_smart.json"))};`); w2.eval(read(path.join(W10, "app-v38.js")));
  const ids10 = [...w2.document.querySelectorAll("#cards .card")].map(c => c.dataset.offerId), ids13 = cards.map(c => c.dataset.offerId);
  const strip = c => { const x = c.cloneNode(true); x.querySelectorAll(".description-source").forEach(e => e.remove()); return x.innerHTML.replace(/(Niveau|Sprache): keine Angabe/g, "keine Angabe").replace(/<\/p>/g, "").replace(/\s+/g, " "); };
  const c10 = [...w2.document.querySelectorAll("#cards .card")];
  const ARCH = ["AT-PROD-OFFER-040", "AT-PROD-OFFER-026"], c10k = c10.filter(c => !ARCH.includes(c.dataset.offerId));
  const changed = cards.filter((c, i) => strip(c) !== strip(c10k[i]) && c.dataset.offerId !== "OFFER-HEAD-003").map(c => c.dataset.offerId);
  check("P07", "Gleiche sichtbare Karten wie Paket 10 ohne die 2 archivierten, gleiche Reihenfolge; sonst nur Kennzeichnung, Badges und HEAD-003-Link geändert",
    ids10.filter(id => !ARCH.includes(id)).join() === ids13.join() && !ids13.some(id => ARCH.includes(id)) && changed.length === 0, `${ids13.length} Karten am ${T} (Paket 10: ${ids10.length})${changed.length ? " · abweichend: " + changed.slice(0, 5).join(", ") : ""}`);
}
console.log(`\nPaket 13 (${T}): ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
