// Paket 16 – Prüfung E113 (englische Anzeigetexte auf Deutsch). Aufruf im Repo-Root nach gegenlesen.js auf docs/:
// NODE_PATH=<tools>/node_modules node claude-work/paket16/tests/test_paket16.js <gegenlesen.json vorher> <gegenlesen.json nachher>
"use strict";
const fs = require("fs"), crypto = require("crypto"), { execFileSync } = require("child_process");
const [vorher, nachher] = process.argv.slice(2).map(f => JSON.parse(fs.readFileSync(f, "utf8")).cards);
const res = []; const check = (id, ok, info) => { res.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${id} – ${info}`); };
const f = "claude-work/paket16/website/data-p16.js", sha = () => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
execFileSync("python3", ["-I", "claude-work/paket16/scripts/build_daten_p16.py"]); const h1 = sha();
execFileSync("python3", ["-I", "claude-work/paket16/scripts/build_daten_p16.py"]); check("U1", h1 === sha(), `data-p16.js reproduzierbar (${h1.slice(0, 12)})`);
global.window = {}; require(require("path").resolve(f)); const D = window.WEITERBILDUNGSRADAR_OFFERS;
const k = D.flatMap(o => (o.korrekturen || []).filter(x => x.register === "E113").map(x => ({ id: o.id, ...x })));
check("U2", k.length === 132 && k.every(x => x.alt && x.quelle), `${k.length} Felder mit altem Wert und Herkunft (E113)`);
const ids = a => a.map(c => c.id).sort().join();
check("U3", ids(vorher) === ids(nachher) && nachher.length === 1068, `sichtbare Angebote unverändert (${nachher.length})`);
const EN = /\b(provider|organi[sz]e|Hours|hours|days|self-paced|next future|further|additional|published|bookable|custom|determined|client|exact venue|listing|extract|occurrence|on location|Geneva|Switzerland|Zurich|Batch|Enroll)\b/;
const left = nachher.flatMap(c => [c.facts.Start || "", c.facts.Dauer || "", ...c.badges].filter(t => EN.test(t)).map(t => `${c.id}: ${t}`));
check("U4", left.length === 0, `keine englischen Arbeitsnotizen in Start, Dauer, Badges (${left.length}) ${left.slice(0, 2).join(" | ")}`);
const vB = Object.fromEntries(vorher.map(c => [c.id, c])), changed = nachher.filter(c => c.all !== vB[c.id].all).map(c => c.id);
const kIds = new Set(k.map(x => x.id));
check("U5", changed.every(id => kIds.has(id)) && changed.length === kIds.size, `nur korrigierte Karten geändert (${changed.length})`);
const sz = nachher.find(c => c.id === "V59-SZ05");
check("U6", sz.facts.Start === "ausgebucht; Zusatztermin auf Anfrage per Telefon", `Owner-Fall V59-SZ05: «${sz.facts.Start}»`);
console.log(`\n${res.filter(Boolean).length}/${res.length} bestanden`); process.exit(res.every(Boolean) ? 0 : 1);
