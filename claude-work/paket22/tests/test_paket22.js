// Paket 22 – Archiv Digicomp 041/044/033 (E142), neues Angebot BILDER (E143), CH-Zugang MAZ-086/AJM-002 (E144).
// Aufruf im Repo-Root: node claude-work/paket22/tests/test_paket22.js
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto"), { execFileSync } = require("child_process");
const res = []; const check = (id, ok, info) => { res.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${id} – ${info}`); };
const CW = "claude-work", sha = f => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const load = (f, v = "WEITERBILDUNGSRADAR_OFFERS") => { global.window = {}; delete require.cache[path.resolve(f)]; require(path.resolve(f)); return window[v]; };
const csv = f => { const [h, ...r] = fs.readFileSync(f, "utf8").trim().split("\n").map(l => { const out = []; let cur = "", q = false;
  for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out; });
  return r.map(x => Object.fromEntries(h.map((k, i) => [k, x[i]]))); };
const run = () => { execFileSync("python3", ["-I", `${CW}/paket22/scripts/build_daten_p22.py`]);
  return [sha(`${CW}/paket22/website/data-p22.js`), sha(`${CW}/paket22/out/smart-search-data-p22.json`)].join(); };
check("P01", run() === run(), "data-p22.js und Smart-Daten reproduzierbar");
const A = load(`${CW}/paket21/website/data-p21.js`), B = load(`${CW}/paket22/website/data-p22.js`);
const K = csv(`${CW}/paket22/config/korrekturen.csv`), byA = Object.fromEntries(A.map(o => [o.id, o])), byB = Object.fromEntries(B.map(o => [o.id, o]));
const NEU = JSON.parse(fs.readFileSync(`${CW}/paket22/config/neue_angebote.json`, "utf8")).angebote.map(a => a.offer.id);
// P02: bestehende Angebote nur in den gelisteten Feldern geändert, neues Angebot am Ende angehängt
let abw = 0; for (const o of B.slice(0, A.length)) { const c = JSON.parse(JSON.stringify(o)); const ks = K.filter(k => k.id === o.id);
  if (ks.length) { c.korrekturen = c.korrekturen.slice(0, -ks.length); if (!c.korrekturen.length && !byA[o.id].korrekturen) delete c.korrekturen; }
  for (const k of ks) { if (k.feld.startsWith("laender.")) c.laender[k.feld.split(".")[1]] = k.alt; else if (k.alt === "") delete c[k.feld]; else c[k.feld] = k.alt; }
  if (JSON.stringify(c) !== JSON.stringify(byA[o.id])) abw++; }
check("P02", abw === 0 && B.length === A.length + 1 && JSON.stringify(B.slice(A.length).map(o => o.id)) === JSON.stringify(NEU) && K.length === 8,
  `nur die ${K.length} gelisteten Felder geändert, 1 neues Angebot angehängt (${B.length} Angebote; ${abw} Abweichungen)`);
// Sichtbarkeit wie app-v43.js
const vis = (D, tag) => { const today = new Date(`${tag}T00:00:00`); const pd = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "").trim()) ? new Date(`${String(v).trim()}T23:59:59`) : null;
  const next = o => Array.isArray(o.sessions) ? o.sessions.filter(s => pd(s.startDate) >= today)[0] || null : null;
  return new Set(D.filter(o => (Array.isArray(o.sessions) ? !!next(o) : (() => { const e = pd(o.endDate), s = pd(o.startDate); return (!e || e >= today) && (e || !s || s >= today); })()) && o.publicationStatus !== "HOLD").map(o => o.id)); };
const ARCH = ["OFFER-DIGICOMP-041", "OFFER-DIGICOMP-044", "OFFER-DIGICOMP-033"];
const diff = t => { const a = vis(A, t), b = vis(B, t); return { weg: [...a].filter(x => !b.has(x)).sort(), neu: [...b].filter(x => !a.has(x)).sort(), na: a.size, nb: b.size }; };
const d1 = diff("2026-11-19"), d2 = diff("2026-12-01"), d3 = diff("2027-07-01");
check("P03", [d1, d2].every(d => JSON.stringify(d.weg) === JSON.stringify([...ARCH].sort()) && JSON.stringify(d.neu) === JSON.stringify(NEU)) && d3.neu.includes("OFFER-DIGICOMP-075"),
  `sichtbar 19.11. ${d1.na} → ${d1.nb}, 01.12. ${d2.na} → ${d2.nb}: weg nur ${d1.weg.join(", ")}; neu nur ${d1.neu.join(", ")}; 01.07.2027 noch sichtbar (nächster Termin)`);
check("P04", ARCH.every(i => byB[i].publicationStatus === "HOLD" && /^ARCHIV: Kurs nicht mehr im Angebot \(Nachrecherche 19\.11\.2026; E015; E142\)$/.test(byB[i].publicationReason)),
  "Archiv wie E103: HOLD mit Grund ARCHIV, Zeilen bleiben in der Datendatei (E121)");
const n = byB["OFFER-DIGICOMP-075"], ref = byB["OFFER-DIGICOMP-046"];
check("P05", JSON.stringify(Object.keys(n).filter(k => !["sessions", "korrekturen"].includes(k))) === JSON.stringify(Object.keys(ref).filter(k => k !== "korrekturen"))
  && n.laender.ortLand === "CH" && n.laender.chZugang === "JA" && n.region === "Zürich, Basel, Bern" && n.sessions.length === 4 && n.startDate === n.sessions[0].startDate,
  `neues Angebot mit allen Feldern wie die übrigen Digicomp-Kurse, Ort ${n.region}, CH-Zugang ${n.laender.chZugang} (E066), 4 Termine`);
check("P06", /^https:\/\/digicomp\.ch\//.test(n.url) && n.priceDisplay === "CHF 1'200 zzgl. 8.1% MWST" && n.korrekturen[0].register === "E143" && /19\.11\.2026/.test(n.korrekturen[0].quelle),
  "URL, Preis mit MWST-Zusatz (E115) und Herkunft E143 mit Datum");
const SM = JSON.parse(fs.readFileSync(`${CW}/paket22/out/smart-search-data-p22.json`, "utf8")), S14 = JSON.parse(fs.readFileSync(`${CW}/paket14/out/smart-search-data-p14.json`, "utf8"));
const sAlt = Object.keys(S14.byId).every(i => JSON.stringify(S14.byId[i]) === JSON.stringify(SM.byId[i]));
check("P07", sAlt && Object.keys(SM.byId).length === B.length && SM.byId["OFFER-DIGICOMP-075"].priceOptions[0].amount === 1200 && SM.meta.rosterCount === B.length,
  `Smart-Daten: alte Einträge unverändert, neuer Eintrag CHF 1200 zzgl. MWST, ${Object.keys(SM.byId).length} Einträge = Datendatei`);
check("P08", ["OFFER-MAZ-086", "OFFER-AJM-002"].every(i => byB[i].laender.chZugang === "JA" && byB[i].laender.ortSicherheit === "MEHRERE_LAENDER" && byB[i].region === byA[i].region)
  && K.filter(k => k.register_id === "E144").every(k => /abgerufen 19\.11\./.test(k.quelle)),
  "E144: MAZ-086 und AJM-002 CH-Zugang «ja» nach E066, Ort und Sicherheitsgrad unverändert, Quelle Anbieterseite 19.11.");
const iso = v => String(v ?? "").split("|").filter(c => /^[A-Z]{2}$/.test(c.trim()));
const rest066 = B.filter(o => iso((o.laender || {}).ortLand).includes("CH") && o.laender.chZugang !== "JA");
check("P09", rest066.length === 0, `E066 jetzt ohne Ausnahme: kein Angebot mit Ort Schweiz ohne CH-Zugang «ja» (${rest066.length})`);
// Release: index lädt data-p22 und smart-p22; Rückweg = Live-Stand Paket 21
const T = fs.mkdtempSync("/tmp/rel22-"); execFileSync("python3", ["-I", `${CW}/paket22/scripts/build_release.py`, T]);
const T21 = fs.mkdtempSync("/tmp/rel21-"); execFileSync("python3", ["-I", `${CW}/paket21/scripts/build_release.py`, T21]);
const idx = fs.readFileSync(`${T}/website/index.html`, "utf8");
check("P10", /src="angebote-20261119\.js"/.test(idx) && /src="suche-20261119\.js"/.test(idx) && /src="app-v43\.js"/.test(idx)
  && sha(`${T}/website/angebote-20261119.js`) === sha(`${CW}/paket22/website/data-p22.js`)
  && fs.readFileSync(`${T}/website/suche-20261119.js`, "utf8") === "window.MEDIA_SKILLS_SMART_DATA = " + fs.readFileSync(`${CW}/paket22/out/smart-search-data-p22.json`, "utf8") + ";\n"
  && fs.readFileSync(`${T}/rollback/index.html`, "utf8") === fs.readFileSync(`${T21}/website/index.html`, "utf8") && fs.existsSync(`${T}/website/.htaccess`),
  "Release: index lädt angebote-20261119.js (= data-p22.js) und suche-20261119.js (= Smart-Daten p22); rollback/index.html = Live-Stand seit 19.11. (Paket 21); .htaccess dabei");
console.log(`\n${res.filter(Boolean).length}/${res.length} bestanden`); process.exit(res.every(Boolean) ? 0 : 1);
