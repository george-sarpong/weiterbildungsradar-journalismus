// Paket 21 – Anbieterland (E118, E123, E132, E133) und Durchführungsort (E134–E137, E066). Aufruf im Repo-Root:
// node claude-work/paket21/tests/test_paket21.js
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto"), { execFileSync } = require("child_process");
const res = []; const check = (id, ok, info) => { res.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${id} – ${info}`); };
const CW = "claude-work", sha = f => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const load = f => { global.window = {}; delete require.cache[path.resolve(f)]; require(path.resolve(f)); return window.WEITERBILDUNGSRADAR_OFFERS; };
const csv = f => { const [h, ...r] = fs.readFileSync(f, "utf8").trim().split("\n").map(l => { const out = []; let cur = "", q = false;
  for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out; });
  return r.map(x => Object.fromEntries(h.map((k, i) => [k, x[i]]))); };
const run = () => { execFileSync("python3", ["-I", `${CW}/paket21/scripts/korrekturen_p21.py`]);
  execFileSync("python3", ["-I", `${CW}/paket21/scripts/build_daten_p21.py`]);
  return [sha(`${CW}/paket21/config/korrekturen.csv`), sha(`${CW}/paket21/website/data-p21.js`)].join(); };
const h1 = run(); check("P01", h1 === run(), "Korrekturliste und data-p21.js reproduzierbar");
const A = load(`${CW}/paket20/website/data-p18.js`), B = load(`${CW}/paket21/website/data-p21.js`);
const K = csv(`${CW}/paket21/config/korrekturen.csv`), byA = Object.fromEntries(A.map(o => [o.id, o])), byB = Object.fromEntries(B.map(o => [o.id, o]));
// P02: nichts ausser den gelisteten Feldern geändert
const nK = id => K.filter(k => k.id === id).length;
let abw = 0; for (const o of B) { const c = JSON.parse(JSON.stringify(o)); const n = nK(o.id);
  if (n) { const neu = c.korrekturen.slice(-n); if (neu.some((x, i) => x.feld !== K.filter(k => k.id === o.id)[i].feld)) abw++;
    c.korrekturen = c.korrekturen.slice(0, -n); if (!c.korrekturen.length && !byA[o.id].korrekturen) delete c.korrekturen; }
  for (const k of K.filter(k => k.id === o.id)) { if (k.feld.startsWith("laender.")) c.laender[k.feld.split(".")[1]] = k.alt; else c[k.feld] = k.alt; }
  if (JSON.stringify(c) !== JSON.stringify(byA[o.id])) abw++; }
check("P02", abw === 0 && A.length === B.length, `nur die ${K.length} gelisteten Felder geändert, alte Werte geprüft (${abw} Abweichungen)`);
// Sichtbarkeit wie app-v43.js
const vis = (D, tag) => { const today = new Date(`${tag}T00:00:00`); const pd = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "").trim()) ? new Date(`${String(v).trim()}T23:59:59`) : null;
  const next = o => Array.isArray(o.sessions) ? o.sessions.filter(s => pd(s.startDate) >= today)[0] || null : null;
  return D.filter(o => (Array.isArray(o.sessions) ? !!next(o) : (() => { const e = pd(o.endDate), s = pd(o.startDate); return (!e || e >= today) && (e || !s || s >= today); })()) && o.publicationStatus !== "HOLD").map(o => o.id).sort().join(); };
check("P03", ["2026-11-18", "2026-12-01"].every(t => vis(A, t) === vis(B, t)), "sichtbare Angebote unverändert (18.11. und 01.12.)");
const L = o => o.laender || {}, iso = v => String(v ?? "").split("|").filter(c => /^[A-Z]{2}$/.test(c.trim()));
const BEL = csv(`${CW}/paket21/config/anbieterland_belege.csv`);
const okAL = BEL.every(b => B.filter(o => o.provider === b.anbieter).every(o => L(o).anbieterLand === b.neu));
const at = B.filter(o => /^Ateliers de l/.test(o.provider));
check("P04", okAL && BEL.length === 23 && at.length === 19 && at.every(o => L(o).anbieterLand === "nicht erfasst"),
  "Anbieterland für 23 Anbieterbezeichnungen (22 Anbieter) gesetzt; Ateliers ohne Adresse bleibt «keine Angabe» (E123)");
const pr = p => [...new Set(B.filter(o => o.provider === p).map(o => L(o).anbieterLand))].join();
check("P05", pr("NobleProg Schweiz") === "CH" && pr("Dawan") === "FR" && pr("MiTech") === "IT" && pr("ORSYS Training Schweiz") === "CH" && pr("Laudius GmbH / Akademie für Fernstudien") === "DE",
  "Stichproben: NobleProg CH (E132), ORSYS CH, Dawan FR, Laudius DE, MiTech IT (E123)");
const ids21 = new Set(K.map(k => k.id)), alt066 = A.filter(o => iso(L(o).ortLand).includes("CH") && L(o).chZugang !== "JA").map(o => o.id);
check("P06", B.filter(o => ids21.has(o.id)).every(o => !iso(L(o).ortLand).includes("CH") || L(o).chZugang === "JA") && alt066.length === 2,
  `E066: jedes geänderte Angebot mit Ort Schweiz hat CH-Zugang «ja»; Altfälle MEHRERE_LAENDER unverändert (${alt066.join(", ")})`);
const ortK = K.filter(k => k.feld === "laender.ortLand");
check("P07", ortK.every(k => /^E13[4-7]$/.test(k.register_id) && k.quelle.length > 20) && K.every(k => /https?:\/\/|Owner/.test(k.quelle)),
  `jeder neue Ort aus Owner-Regel oder Anbieterseite, nie aus dem Anbieterland (${ortK.length} Ortsländer); jede Korrektur mit Quelle`);
const m8 = byB["OFFER-MAZ-008"], mz = B.filter(o => o.provider.startsWith("MAZ – ") && !iso(L(o).ortLand).length);
check("P08", L(m8).ortLand === "nicht erfasst" && mz.every(o => o.id === "OFFER-MAZ-008" || /ONLINE$/.test(L(o).ortSicherheit) || !["", "NOT_PUBLISHED", "NICHT_PUBLIZIERT"].includes(String(o.region).toUpperCase())),
  `MAZ: Ausnahme Ausland-Stages bleibt ohne Ort; übrige MAZ-Angebote ohne Ort nur mit eigener Ortsangabe (${mz.length})`);
// Anzeige wie app-v43.js placeLabel / placeFilterValues
const CN = { CH: "Schweiz", DE: "Deutschland", FR: "Frankreich", IT: "Italien", AT: "Österreich" };
const label = o => `${iso(L(o).ortLand).map(c => CN[c] || c).join(" / ") || (/(?:^|_)ONLINE$/.test(L(o).ortSicherheit) ? "Online" : "keine Angabe")} · ${o.region}`;
const filt = o => [...iso(L(o).ortLand).map(c => CN[c]), ...(/(?:^|_)ONLINE$/.test(L(o).ortSicherheit) ? ["Online"] : [])].join();
check("P09", label(byB["OFFER-MAZ-001"]) === "Schweiz · Luzern" && label(byB["V82-DAWAN-026"]) === "Schweiz · Fernunterricht; Genf wählbar (Termin auf Anfrage)"
  && filt(byB["V82-DAWAN-026"]) === "Schweiz,Online" && label(byB["OFFER-NOBLE-003"]) === "Schweiz · Basel, Bern, Genf, Lausanne, Zürich / Online",
  `Karte: ${label(byB["OFFER-MAZ-001"])} | ${label(byB["V82-DAWAN-026"])} | ${label(byB["OFFER-NOBLE-003"])}`);
// E129 neu zählen: sichtbare Angebote Schweizer Anbieter ohne Ortsland
const V = new Set(vis(B, "2026-11-18").split(",")), Va = new Set(vis(A, "2026-11-18").split(","));
const ohne = (D, S) => D.filter(o => S.has(o.id) && L(o).anbieterLand === "CH" && !iso(L(o).ortLand).length);
const vor = ohne(A, Va), nach = ohne(B, V), kein = nach.filter(o => !/(?:^|_)ONLINE$/.test(L(o).ortSicherheit));
check("P10", vor.length === 246 && nach.length < vor.length, `E129: sichtbar, Anbieter Schweiz, ohne Ort ${vor.length} → ${nach.length} (davon ohne «Online» ${kein.length})`);
fs.writeFileSync(`${CW}/paket21/out/e129_ohne_ort_nachher.json`, JSON.stringify(nach.map(o => ({ id: o.id, provider: o.provider, region: o.region, online: /ONLINE$/.test(L(o).ortSicherheit) })), null, 1) + "\n");
console.log(`\n${res.filter(Boolean).length}/${res.length} bestanden`); process.exit(res.every(Boolean) ? 0 : 1);
