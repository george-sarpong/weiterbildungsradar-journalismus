// Paket 14 – Tests für app-v40.js (E105: ohne «Laut Anbieter»; E106: «oder» = Themen-Alternativen, Füllverben keine Themen)
// Aufruf (im Repo-Root): NODE_PATH=<tools>/node_modules STICHTAG=2026-11-09 node claude-work/paket14/tests/test_paket14.js
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto"), { spawnSync } = require("child_process");
const { JSDOM } = require("jsdom");
const CW = path.join(process.cwd(), "claude-work"), W13 = path.join(CW, "paket13/website"), W14 = path.join(CW, "paket14/website"), W10 = path.join(CW, "paket10/website");
const read = f => fs.readFileSync(f, "utf8"), sha = s => crypto.createHash("sha256").update(s).digest("hex");
const T = process.env.STICHTAG || "2026-11-09";
let pass = 0, fail = 0;
const check = (id, name, ok, detail = "") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail ? " – " + detail : ""}`); };

{ const files = ["app-v40.js", "methodik.html"], before = files.map(f => sha(read(path.join(W14, f))));
  const r = spawnSync("python3", ["-I", "paket14/scripts/port_p14.py"], { cwd: CW });
  check("P01", "Port-Skript reproduziert app-v40.js und methodik.html byte-identisch", r.status === 0 && files.every((f, i) => sha(read(path.join(W14, f))) === before[i])); }
{ const same = ["index.html", "datenschutz.html", "impressum.html", "404.html"].every(f => sha(read(path.join(W13, f))) === sha(read(path.join(W14, f))));
  const P = js => JSON.parse(js.slice(js.indexOf("=") + 1).trim().replace(/;$/, ""));
  const a = P(read(path.join(W13, "data-p13.js"))), b = P(read(path.join(W14, "data-p14.js"))), diffs = [];
  a.forEach((o, i) => { for (const k of new Set([...Object.keys(o), ...Object.keys(b[i])])) if (JSON.stringify(o[k]) !== JSON.stringify(b[i][k])) diffs.push(`${o.id}.${k}`); });
  const sa = JSON.parse(read(path.join(CW, "paket3/out/merge_kandidat_smart.json"))).byId, sb = JSON.parse(read(path.join(CW, "paket14/out/smart-search-data-p14.json"))).byId;
  const sd = Object.keys(sa).filter(k => JSON.stringify(sa[k]) !== JSON.stringify(sb[k]));
  const r = spawnSync("python3", ["-I", "paket14/scripts/build_daten_p14.py"], { cwd: CW });
  check("P02", "Übrige Seiten = Paket 13, Methodik = Paket 10 (E105); Daten nur Mediencampus Preis, Kategorie, Dauer, Prüfdatum mit Herkunft (E107, E109); Skript reproduzierbar",
    same && sha(read(path.join(W14, "methodik.html"))) === sha(read(path.join(W10, "methodik.html"))) && r.status === 0
    && diffs.every(d => /^OFFER-MEDIENCAMPUS-\d+\.(approved|duration|korrekturen|priceCategory|priceDisplay)$/.test(d))
    && sd.length === b.filter(o => o.priceDisplay === "CHF 1'150" && /MEDIENCAMPUS/.test(o.id) && o.korrekturen).length && sd.every(id => /MEDIENCAMPUS/.test(id)),
    `${new Set(diffs.map(d => d.split(".")[0])).size} Angebote, ${diffs.length} Felder, Smart ${sd.length}`); }
{ const P = js => JSON.parse(js.slice(js.indexOf("=") + 1).trim().replace(/;$/, ""));
  const mc = P(read(path.join(W14, "data-p14.js"))).filter(o => /MEDIENCAMPUS/.test(o.id) && o.publicationStatus !== "HOLD");
  const ohne = mc.filter(o => o.priceCategory === "PREIS_NICHT_PUBLIZIERT").map(o => o.id).sort();
  check("P08", "Mediencampus: alle Kurse mit Preis ausser den 3 Lehrgängen ohne Preis auf der Anbieterseite (E109)",
    ohne.join() === "OFFER-MEDIENCAMPUS-010,OFFER-MEDIENCAMPUS-030,OFFER-MEDIENCAMPUS-043" && mc.filter(o => o.priceDisplay === "CHF 1'150").length === 51, `${mc.length} Kurse, ohne Preis: ${ohne.join(", ")}`); }

const app = (appFile) => {
  const dom = new JSDOM(read(path.join(W14, "index.html")).replace(/<script[^>]*src=[^>]*><\/script>/g, ""), { runScripts: "outside-only", url: "https://mediaskills.ch/", pretendToBeVisual: true });
  const w = dom.window, RealDate = w.Date, fixed = new RealDate(`${T}T12:00:00+01:00`).getTime();
  w.Date = class extends RealDate { constructor(...a) { super(...(a.length ? a : [fixed])); } static now() { return fixed; } };
  w.eval(read(path.join(W14, "data-p14.js")));
  w.eval(`window.MEDIA_SKILLS_SMART_DATA = ${read(path.join(CW, "paket14/out/smart-search-data-p14.json"))};`);
  w.eval(read(appFile));
  const ask = q => { w.document.querySelector("#smartInput").value = q;
    w.document.querySelector("#smartSearchForm").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
    const st = w.document.querySelector("#smartStatus").textContent, n = Number((st.match(/^(\d+)/) || [0, 0])[1]);
    return { n, chips: w.document.querySelector("#smartUnderstood").textContent.replace(/\s+/g, " "), cards: [...w.document.querySelectorAll("#smartResults .smart-result-card")].map(c => c.textContent.replace(/\s+/g, " ")) }; };
  return { w, ask };
};
const A = app(path.join(W14, "app-v40.js")), B = app(path.join(W13, "app-v39.js"));
{ const n = A.w.document.querySelectorAll(".description-source").length, txt = read(path.join(W14, "app-v40.js")) + read(path.join(W14, "methodik.html"));
  check("P03", "Keine Kennzeichnung «Laut Anbieter» mehr (E105)", n === 0 && !/Laut Anbieter|descriptionSource/.test(txt), `${A.w.document.querySelectorAll("#cards .card").length} Karten`); }
{ const g = A.ask("Ich möchte einen Kurs für Medienmanagement oder Datenjournalismus machen für 2000 chf");
  const m = A.ask("Medienmanagement, 2000 CHF").n, d = A.ask("Datenjournalismus, 2000 CHF").n, both = A.ask("Medienmanagement Datenjournalismus, 2000 CHF").n;
  check("P04", "Georges Satz: «oder» liefert die Vereinigung beider Themen, «machen» ist kein Thema (E106)",
    g.n === m + d - both && g.n > 0 && /medienmanagement oder datenjournalismus/.test(g.chips) && !/machen/.test(g.chips), `${g.n} = ${m} + ${d} − ${both} · ${g.chips.trim()}`); }
{ const qs = ["Datenjournalismus, CHF 800", "Video, CHF 500", "Moderation, 1000 Euro", "Podcast produzieren, online", "Mobile Reporting, unter CHF 300", "KI im Journalismus, Zürich", "Datenvisualisierung kostenlos", "500 Euro"];
  const diff = qs.filter(q => { const a = A.ask(q), b = B.ask(q); return a.n !== b.n || a.chips !== b.chips || a.cards.join("|") !== b.cards.join("|"); });
  check("P05", "Ohne «oder» gleiche Treffer, Zahlen und Karten wie Paket 13", diff.length === 0, diff.join(", ")); }
{ const r = A.ask("was gibt es für Redaktionsmanagement für 9000 CHF"), card = r.cards.find(c => /Modernes Redaktionsmanagement/.test(c)) || "";
  check("P07", "«Redaktionsmanagement für 9000 CHF»: CMF.04 mit CHF 1'150 im Budget (E107)", /1.150/.test(card) && /im Budget/.test(card), card.slice(0, 200)); }
{ const a = A.ask("Podcast oder Video, online"), p = A.ask("Podcast, online").n, v = A.ask("Video, online").n;
  check("P06", "«oder» mit harter Bedingung: Bedingung gilt für beide Alternativen", a.n > 0 && a.n <= p + v && a.n >= Math.max(p, v), `${a.n} (Podcast ${p}, Video ${v})`); }
console.log(`\nPaket 14 (${T}): ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
