// Paket 18 – Prüfung E118 (Anbieterland = Sitzland). Aufruf im Repo-Root:
// node claude-work/paket18/tests/test_paket18.js <gegenlesen Paket 17> <gegenlesen Paket 18>
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto"), { execFileSync } = require("child_process");
const [vor, nach] = process.argv.slice(2).map(f => JSON.parse(fs.readFileSync(f, "utf8")).cards);
const res = []; const check = (id, ok, info) => { res.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${id} – ${info}`); };
const f = "claude-work/paket18/website/data-p18.js", sha = () => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
execFileSync("python3", ["-I", "claude-work/paket18/scripts/build_daten_p18.py"]); const h = sha();
execFileSync("python3", ["-I", "claude-work/paket18/scripts/build_daten_p18.py"]); check("A1", h === sha(), `data-p18.js reproduzierbar (${h.slice(0, 12)})`);
global.window = {}; require(path.resolve(f)); const D = window.WEITERBILDUNGSRADAR_OFFERS;
const k = D.flatMap(o => (o.korrekturen || []).filter(x => x.register === "E118"));
check("A2", k.length === 934 && k.every(x => x.alt === "nicht erfasst" && /Domain-Endung/.test(x.quelle)), `${k.length} Felder mit altem Wert und Herkunft (E118)`);
check("A3", vor.map(c => c.id).sort().join() === nach.map(c => c.id).sort().join(), `sichtbare Angebote unverändert (${nach.length})`);
const lab = new Set(nach.flatMap(c => c.badges.filter(b => b.startsWith("Anbieterland:"))));
check("A4", [...lab].every(b => /^Anbieterland: (Schweiz|Österreich|Liechtenstein|Deutschland)$/.test(b)), `Anbieterland-Werte: ${[...lab].join(", ")}`);
const offen = Object.keys(JSON.parse(fs.readFileSync("claude-work/paket18/out/anbieterland_offen.json", "utf8")).offen_auslaendische_gesellschaft);
const prov = Object.fromEntries(D.map(o => [o.id, o.provider]));
const leak = nach.filter(c => offen.includes(prov[c.id]) && c.badges.some(b => b.startsWith("Anbieterland:")));
check("A5", leak.length === 0, `offene Fälle (ausländische Gesellschaft) ohne Anbieterland (${leak.length})`);
const maz = nach.filter(c => /^MAZ/.test(prov[c.id]));
check("A6", maz.length > 0 && maz.every(c => c.badges.includes("Anbieterland: Schweiz")), `Owner-Beispiel MAZ = Schweiz (${maz.length} Karten)`);
const vB = Object.fromEntries(vor.map(c => [c.id, c])), only = nach.every(c => c.all === vB[c.id].all || c.badges.filter(b => !b.startsWith("Anbieterland")).join() === vB[c.id].badges.filter(b => !b.startsWith("Anbieterland")).join());
check("A7", only, "nur das Anbieterland-Badge ändert sich");
console.log(`\n${res.filter(Boolean).length}/${res.length} bestanden`); process.exit(res.every(Boolean) ? 0 : 1);
