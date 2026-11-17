// Paket 20 – Prüfung E122 (Anbieterland nicht mehr auf der Karte, nur in den Daten). Aufruf im Repo-Root nach gegenlesen.js
// auf dem Abnahme-Stand Paket 18 (git HEAD docs/) und Paket 20 (docs/), beide am selben Tag:
// node claude-work/paket20/tests/test_paket20.js <gegenlesen Paket 18> <gegenlesen Paket 20>
// Übernimmt die Daten-Prüfungen aus test_paket18.js (A2, A5, A6), die dort an den Badges hingen.
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto"), { execFileSync } = require("child_process");
const [vor, nach] = process.argv.slice(2).map(f => JSON.parse(fs.readFileSync(f, "utf8")));
const res = []; const check = (id, ok, info) => { res.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${id} – ${info}`); };
const W = "claude-work/paket20/website", sha = f => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const run = () => { execFileSync("python3", ["-I", "claude-work/paket20/scripts/port_p20.py"]); return ["app-v43.js", "methodik.html"].map(f => sha(`${W}/${f}`)).join(); };
const h1 = run(); check("C1", h1 === run(), "app-v43.js und methodik.html reproduzierbar");
const a42 = fs.readFileSync("claude-work/paket18/website/app-v42.js", "utf8").split("\n"), a43 = fs.readFileSync(`${W}/app-v43.js`, "utf8").split("\n");
const weg = a42.filter(l => !a43.includes(l)), neu = a43.filter(l => !a42.includes(l));
check("C2", weg.length === 3 && neu.length === 1 && weg.some(l => l.includes('<span class="badge">Anbieterland:')) && /E122/.test(neu[0]),
  `app-v43 = app-v42 ohne Anbieterland-Badge und Hilfsfunktion (${weg.length} Zeilen weg, ${neu.length} Kommentar neu)`);
check("C3", ["data-p18.js", "index.html", "404.html", "datenschutz.html", "impressum.html"].every(f => sha(`${W}/${f}`) === sha(`claude-work/paket18/website/${f}`)),
  "Daten und übrige Seiten unverändert (= Paket 18)");
const C18 = vor.cards, C20 = nach.cards, ids = a => a.map(c => c.id).sort().join();
check("C4", ids(C18) === ids(C20) && C20.length > 1000, `sichtbare Angebote unverändert (${C20.length}, Stichtag heute)`);
const mitAL = C20.filter(c => c.badges.some(b => b.startsWith("Anbieterland")) || /Anbieterland/.test(c.all));
check("C5", mitAL.length === 0 && C18.some(c => c.badges.some(b => b.startsWith("Anbieterland:"))), `keine Karte nennt «Anbieterland» (${mitAL.length}; Paket 18: ${C18.filter(c => c.badges.some(b => b.startsWith("Anbieterland:"))).length})`);
const B = Object.fromEntries(C18.map(c => [c.id, c])), ohne = c => c.badges.filter(b => !b.startsWith("Anbieterland:")).join("|");
const sonst = C20.filter(c => ohne(c) !== ohne(B[c.id]) || JSON.stringify(c.facts) !== JSON.stringify(B[c.id].facts) || c.title !== B[c.id].title || c.desc !== B[c.id].desc);
check("C6", sonst.length === 0, `sonst ändert sich auf keiner Karte etwas (Titel, Fakten, Beschreibung, übrige Badges) (${sonst.length})`);
check("C7", vor.ui === nach.ui, "Bedienoberfläche ausserhalb der Karten unverändert");
const m = nach.pages["methodik.html"];
check("C8", !/Anbieterland/.test(m) && /Wo der Anbieter seinen Sitz hat, führen wir nur in den Daten/.test(m) && /den Zugang leiten wir daraus nie ab/.test(m),
  "Methodik: Satz zum Anbietersitz angepasst, kein «Anbieterland» mehr");
global.window = {}; require(path.resolve(`${W}/data-p18.js`)); const D = window.WEITERBILDUNGSRADAR_OFFERS;
const k = D.flatMap(o => (o.korrekturen || []).filter(x => x.register === "E118"));
check("C9", k.length === 934, `Daten: Anbieterland weiter in 934 Angeboten mit Herkunft (E118)`);
const maz = D.filter(o => /^MAZ/.test(o.provider) && C20.some(c => c.id === o.id));
check("C10", maz.length > 0 && maz.every(o => (o.laender || {}).anbieterLand === "CH"), `Owner-Beispiel MAZ = Schweiz jetzt in den Daten geprüft (${maz.length} sichtbare MAZ-Angebote)`);
const offen = Object.keys(JSON.parse(fs.readFileSync("claude-work/paket18/out/anbieterland_offen.json", "utf8")).offen_auslaendische_gesellschaft);
const leak = D.filter(o => offen.includes(o.provider) && !["", "nicht erfasst", undefined].includes((o.laender || {}).anbieterLand));
check("C11", leak.length === 0, `offene Fälle (ausländische Gesellschaft) in den Daten ohne Anbieterland (${leak.length}); Regel E123 später`);
console.log(`\n${res.filter(Boolean).length}/${res.length} bestanden`); process.exit(res.every(Boolean) ? 0 : 1);
