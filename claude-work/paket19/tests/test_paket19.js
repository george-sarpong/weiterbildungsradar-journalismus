// Paket 19 – automatische Prüfungen (Spezifikation §7: L01–L04, L06–L11, J01, D01–D04, S01–S03, R01–R03, A1/A8).
// Browser-Teile (L01 Browser, L05, L06 Browser, J02, J04, J05) in test_browser_p19.js, Apache (R04, R05) in test_apache_p19.sh.
// Aufruf (im Repo-Root): TZ=Europe/Zurich NODE_PATH=<ordner>/node_modules node claude-work/paket19/tests/test_paket19.js
// Stichtage: S0 = STICHTAG (Standard 2026-11-19), S−1, S+1, S2 = 2026-12-01. Endstand danach wieder Build an S0.
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), crypto = require("crypto"), { execFileSync, spawnSync } = require("child_process");
const { JSDOM } = require("jsdom");
const ROOT = process.cwd(), CW = path.join(ROOT, "claude-work"), W = path.join(CW, "paket19/website"), OUT = path.join(CW, "paket19/out");
const S0 = process.env.STICHTAG || "2026-11-19", S2 = "2026-12-01";
const tag = (d, n) => { const x = new Date(`${d}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const SM1 = tag(S0, -1), SP1 = tag(S0, 1);
const res = []; const check = (id, ok, info) => { res.push([id, ok]); console.log(`${ok ? "PASS" : "FAIL"} ${id} – ${info}`); };
const read = p => fs.readFileSync(p, "utf8"), sha = p => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const env = { ...process.env, TZ: "Europe/Zurich" };
const build = (d, extra = {}) => execFileSync("bash", ["paket19/scripts/build_p19.sh", d], { cwd: CW, env: { ...env, ...extra } }).toString();
const PRE = "window.WEITERBILDUNGSRADAR_OFFERS = ";
const loadData = f => JSON.parse(read(f).slice(PRE.length).replace(/;\n$/, ""));
const { renderApp, cardEntries, LS, LE } = require(path.join(CW, "paket19/scripts/build_liste_p19.js"));

// unabhängiges Orakel für die Sichtbarkeit (wie test_paket22.js, aus app-v43.js abgeschrieben) – nur zur Gegenprobe
const vis = (D, t) => { const today = new Date(`${t}T00:00:00`); const pd = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "").trim()) ? new Date(`${String(v).trim()}T23:59:59`) : null;
  const cur = o => Array.isArray(o.sessions) ? o.sessions.some(s => pd(s.startDate) >= today) : (() => { const e = pd(o.endDate), s = pd(o.startDate); return (!e || e >= today) && (e || !s || s >= today); })();
  return new Set(D.filter(o => cur(o) && o.publicationStatus !== "HOLD").map(o => o.id)); };
// Liste aus dem ausgelieferten HTML lesen, ohne JavaScript
const parseList = html => { const d = new JSDOM(html).window.document;
  return [...d.querySelectorAll("#angebote #cards > .static-list > ul > li")].map(li => { const a = li.querySelector("a");
    return { text: li.textContent, a: a && { href: a.getAttribute("href"), target: a.getAttribute("target"), rel: a.getAttribute("rel"), text: a.textContent, attrs: a.getAttributeNames().sort().join() } }; }); };
const expText = e => `${e.titel} · ${e.anbieter} · Ort: ${e.ort} · Preis: ${e.preis}`;
const snap = () => Object.fromEntries(["index.html", "data-p19.js", "sitemap.xml"].map(f => [f, sha(path.join(W, f))]).concat([["smart", sha(path.join(OUT, "smart-search-data-p19.json"))]]));

const MASTER = ["paket3/out/master_3818_aktuell.csv", "paket3/out/master_nachtraege_protokoll.csv", "paket22/website/data-p22.js", "paket22/out/smart-search-data-p22.json"];
const vorher = MASTER.map(f => sha(path.join(CW, f)));

// ---------- Builds an allen Stichtagen ----------
const B = {};
for (const d of [SM1, SP1, S2, S0]) { build(d); const html = read(path.join(W, "index.html"));
  const w = renderApp(html, d); B[d] = { html, list: parseList(html), cards: cardEntries(w), proto: JSON.parse(read(path.join(OUT, `zaehlprotokoll_${d}.json`))) }; }
const s1 = snap(); build(S0); const s2 = snap();
check("P19-R01", JSON.stringify(s1) === JSON.stringify(s2), `Determinismus: zwei Builds an ${S0} byte-gleich (index ${s1["index.html"].slice(0, 12)}, data-p19 ${s1["data-p19.js"].slice(0, 12)})`);

const D22 = loadData(path.join(CW, "paket22/website/data-p22.js")), D19 = loadData(path.join(W, "data-p19.js"));
const by19 = Object.fromEntries(D19.map(o => [o.id, o]));

// ---------- 7.1 Liste und Gate ----------
const ids = d => B[d].cards.map(c => c.id);
for (const d of [S0, S2]) { const { list, cards } = B[d];
  check(`P19-L01 ${d}`, list.length === cards.length && cards.length > 0, `Einträge im HTML ${list.length} = Karten der App ${cards.length}`); }
const seqGleich = d => B[d].list.length === B[d].cards.length && B[d].list.every((l, i) => l.text === expText(B[d].cards[i]) && l.a && l.a.href === B[d].cards[i].href);
const orakel = d => { const o = vis(D19, d), a = new Set(ids(d)); return o.size === a.size && [...o].every(x => a.has(x)); };
check("P19-L02", [S0, S2].every(d => seqGleich(d) && orakel(d)),
  `IDs: Eintrag i = Karte i (Titel, Anbieter, Ort, Preis, Link) an ${S0} und ${S2}, damit ID-Menge = App; Gegenprobe Orakel ${vis(D19, S0).size} / ${vis(D19, S2).size}`);
const HOLD = new Set(D19.filter(o => o.publicationStatus === "HOLD").map(o => o.id));
const l03 = [S0, S2].map(d => { const o = vis(D19, d); return ids(d).filter(i => HOLD.has(i) || !o.has(i)).length; });
check("P19-L03", l03.every(n => n === 0) && HOLD.size === 51, `keine HOLD-ID (${HOLD.size} im Bestand) und keine vergangene ID in der Liste (${l03.join(" / ")} Treffer)`);
// L04: alle Angebote mit einem Datum zwischen S−1 und S+1
const nahe = D19.filter(o => [o.startDate, o.endDate, ...(Array.isArray(o.sessions) ? o.sessions.map(s => s.startDate) : [])].some(v => v >= SM1 && v <= SP1));
const l04 = [SM1, S0, SP1].map(d => { const o = vis(D19, d), a = new Set(ids(d)); return nahe.filter(x => o.has(x.id) !== a.has(x.id)).map(x => `${d}:${x.id}`); });
const l04n = [SM1, S0, SP1].map(d => nahe.filter(x => new Set(ids(d)).has(x.id)).length);
check("P19-L04", l04.flat().length === 0 && nahe.length > 0 && [SM1, S0, SP1].every(seqGleich),
  `Grenzfälle: ${nahe.length} Angebote mit Datum ${SM1}–${SP1}; in der Liste an S−1/S0/S+1: ${l04n.join(" / ")}, gleiche Entscheidung wie isCurrent (${l04.flat().length} Abweichungen)`);
const L = B[S0].list, C = B[S0].cards;
check("P19-L06 auto", seqGleich(S0) && L.every((l, i) => l.a.text === C[i].titel), `Texte je Eintrag zeichengleich mit der Karte (jsdom, ${L.length} Einträge); Browser-Teil in test_browser_p19.js`);
const RAW = /\b[A-Z]{2,}(?:_[A-Z]+)+\b/, J = /Evidenz|Produktcode|Batch|normalisiert|Datenstand|belastbar|indexiert|Crawl|editionsscharf|jahresscharf|Formatvariante|erfasster Termin|Katalogtermin|nicht verifiziert|Stable Identity|kanonisch|\(Katalog\)|nicht bestätigt|Genève|Bâle|Zurich|Neuchâtel|Saint-Gall|Lucerne|Geneva/i;
const l07 = C.flatMap(c => { const f = [c.titel, c.anbieter, c.ort, c.preis]; const bad = [];
  if (f.some(v => RAW.test(v))) bad.push("Rohcode"); if (f.some(v => /nicht erfasst|nicht publiziert|\b(undefined|null|NaN)\b/i.test(v) || !v.trim())) bad.push("Platzhalter");
  if ([c.ort, c.preis].some(v => J.test(v))) bad.push("Prüfsprache"); return bad.map(b => `${c.id}:${b}`); });
check("P19-L07", l07.length === 0, `keine Rohcodes, kein «nicht erfasst»/«nicht publiziert», keine Prüfsprache in Ort/Preis (${l07.length}) ${l07.slice(0, 3).join(" | ")}`);
const betr = C.flatMap(c => [...c.preis.matchAll(/(?:CHF|EUR|USD|GBP)\s(\d[\d']*)/g)].map(m => m[1]));
const falsch = betr.filter(b => { const n = b.replace(/'/g, ""); return n.length <= 4 ? b.includes("'") : b !== n.replace(/\B(?=(\d{3})+(?!\d))/g, "'"); });
const nachgestellt = C.filter(c => /\d\s?(CHF|EUR|USD|GBP)\b/.test(c.preis)).map(c => c.id);
const mwst = C.filter(c => /(zzgl\.|exkl\.)\s*MWST/i.test(by19[c.id].priceDisplay || "") && !/(zzgl\.|exkl\.)\s*MWST/i.test(c.preis)).map(c => c.id);
check("P19-L08", falsch.length === 0 && nachgestellt.length === 0 && mwst.length === 0 && betr.some(b => b.replace(/'/g, "").length === 4) && betr.some(b => b.replace(/'/g, "").length === 5),
  `Zahlenformat E115: ${betr.length} Beträge (4-stellig ${betr.filter(b => b.length === 4).length}, 5-stellig ${betr.filter(b => b.replace(/'/g, "").length === 5).length}), falsch ${falsch.length}, Währung nach Betrag ${nachgestellt.length}; «zzgl./exkl. MWST» fehlt ${mwst.length}`);
const appr = C.map(c => String(by19[c.id].approved ?? "")), sortiert = appr.every((a, i) => i === 0 || appr[i - 1] >= a);
check("P19-L09", seqGleich(S0) && sortiert, "Reihenfolge = Standardsortierung der App «Zuletzt geprüft» (Eintrag i = Karte i; Prüfdatum absteigend)");
const idx = B[S0].html, [y, m, d] = S0.split("-");
const daten = idx.replace(new RegExp(`${LS}[\\s\\S]*${LE}`), "").match(/\b\d{1,2}\.\s?(\d{1,2}\.|Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s?\d{4}\b/g) || [];
check("P19-L10", idx.split(`<p class="data-stand">Stand der Angaben: ${d}.${m}.${y}</p>`).length === 2 && !/Datenstand|30\. September 2026/.test(idx) && daten.length === 1,
  `«Stand der Angaben: ${d}.${m}.${y}» einmal sichtbar über der Liste; «Datenstand 30. September 2026» entfällt; Daten auf der Seite ausserhalb der Liste: ${daten.join(", ")}`);
const l11 = C.filter((c, i) => L[i].a.href !== by19[c.id].url || L[i].a.text !== c.titel || L[i].a.target !== c.target || L[i].a.rel !== c.rel || L[i].a.attrs !== "href,rel,target").map(c => c.id);
check("P19-L11", l11.length === 0, `Linkziel = Angebots-URL des Datensatzes, Linkname = Titel (E089), target/rel wie die Karte, kein abweichender aria-label (${l11.length} Abweichungen)`);
console.log("SOLL P19-L12 – Linkprüfung der Liste: aus dem Arbeitsbereich kein Netz zu Anbieterseiten (Allowlist); wie T5 offen, Muss-Teil T01–T20 unverändert (E076)");

// ---------- 7.2 ohne JavaScript, A1/A8 ----------
const dom = new JSDOM(idx).window.document, sec = dom.querySelector("section#angebote");
const h3 = dom.querySelector("#cards > .static-list > h3"), ul = dom.querySelectorAll("#cards > .static-list > ul > li");
const vier = [...ul].every(li => /^.+ · .+ · Ort: .+ · Preis: .+$/.test(li.textContent));
check("P19-J01 lokal", sec && sec.contains(h3) && h3.textContent === "Alle aktuellen Angebote" && ul.length === C.length && vier,
  `ohne JavaScript: ${ul.length} Einträge im Bereich «Weiterbildungsangebote» unter eigener Überschrift, je Titel, Anbieter, Ort, Preis (A1, A2); live: WebFetch nach Upload (V02)`);
const p22 = read(path.join(CW, "paket22/website/index.html"));
const skripte = h => (h.match(/<script\b(?![^>]*\bsrc=)[^>]*>/g) || []).join("|");
const fremd = [...idx.matchAll(/<(?:script|link|img|iframe|source)\b[^>]*(?:src|href)="(https?:)?\/\//g)].filter(x => !/rel="canonical"/.test(x[0]));
check("P19-A8", skripte(idx) === skripte(p22) && !/\sstyle="/.test(idx) && fremd.length === 0,
  `keine neuen Inline-Skripte (nur der bestehende JSON-LD-Block WebSite), keine style-Attribute, keine externen Ressourcen (CSP «self», E124)`);

// ---------- 7.3 Datendatei ----------
const S22 = JSON.parse(read(path.join(CW, "paket22/out/smart-search-data-p22.json"))), S19 = JSON.parse(read(path.join(OUT, "smart-search-data-p19.json")));
check("P19-D01", D19.length === 1353 && D19.every(o => !("korrekturen" in o)) && Object.values(S19.byId).every(v => !("korrekturen" in v)) && !read(path.join(W, "data-p19.js")).includes('"korrekturen"'),
  `korrekturen in 0 von ${D19.length} Datensätzen (data-p19.js) und 0 von ${Object.keys(S19.byId).length} Smart-Einträgen`);
const minus = o => { const c = { ...o }; delete c.korrekturen; return JSON.stringify(c); };
const d02 = D22.length === D19.length && D22.every((o, i) => minus(o) === JSON.stringify(D19[i]));
const s02 = JSON.stringify(Object.keys(S22.byId)) === JSON.stringify(Object.keys(S19.byId)) && Object.keys(S22.byId).every(k => minus(S22.byId[k]) === JSON.stringify(S19.byId[k]))
  && JSON.stringify(S22.meta) === JSON.stringify(S19.meta);
check("P19-D02", d02 && s02, `Wertgleichheit: jeder Datensatz data-p19 = data-p22 minus korrekturen (Reihenfolge, 1353 inkl. ${HOLD.size} HOLD); Smart-Datei ebenso (B4)`);
const b2 = JSON.parse(read(path.join(OUT, "b2_herkunft.json")));
// Gegenprobe: ein erfundener korrekturen-Eintrag muss den Build abbrechen (B2: melden statt entfernen)
const T = fs.mkdtempSync(path.join(os.tmpdir(), "p19-b2-"));
for (const f of [...new Set(b2.quellen), "paket19/scripts/build_daten_p19.py", "paket22/out/smart-search-data-p22.json"]) { fs.mkdirSync(path.dirname(path.join(T, f)), { recursive: true }); fs.copyFileSync(path.join(CW, f), path.join(T, f)); }
const fake = loadData(path.join(CW, "paket22/website/data-p22.js")); fake[0].korrekturen = [...(fake[0].korrekturen || []), { feld: "title", alt: "x", register: "E999", quelle: "erfunden" }];
fs.mkdirSync(path.join(T, "paket22/website"), { recursive: true }); fs.writeFileSync(path.join(T, "paket22/website/data-p22.js"), PRE + JSON.stringify(fake) + ";\n");
const man = spawnSync("python3", ["-I", path.join(T, "paket19/scripts/build_daten_p19.py")]);
const manB = JSON.parse(read(path.join(T, "paket19/out/b2_herkunft.json")));
check("P19-D03", b2.daten_ohne_beleg.length === 0 && b2.smart_ohne_beleg.length === 0 && b2.daten_eintraege === 3664 && b2.smart_eintraege === 51
  && man.status === 1 && manB.daten_ohne_beleg.length === 1 && !fs.existsSync(path.join(T, "paket19/website/data-p19.js")),
  `Herkunft belegt: ${b2.daten_eintraege} Daten-Einträge (${b2.daten_angebote} Angebote) und ${b2.smart_eintraege} Smart-Einträge mit Gegenstück in korrekturen.csv der Pakete 13–22 bzw. neue_angebote.json; Gegenprobe mit erfundenem Eintrag bricht ab, nichts entfernt`);
fs.rmSync(T, { recursive: true });
const nachher = MASTER.map(f => sha(path.join(CW, f)));
check("P19-D04", JSON.stringify(vorher) === JSON.stringify(nachher), `Master, Nachtragsprotokoll, data-p22.js und Smart-Daten Paket 22 vor = nach ${Object.keys(B).length + 1} Builds (Rückweg B3)`);

// ---------- 7.4 Sitemap ----------
const map = read(path.join(W, "sitemap.xml")), xd = new JSDOM(map, { contentType: "application/xml" }).window.document;
const urls = [...xd.getElementsByTagNameNS("http://www.sitemaps.org/schemas/sitemap/0.9", "url")];
const gueltig = !xd.querySelector("parsererror") && xd.documentElement.localName === "urlset" && map.startsWith('<?xml version="1.0" encoding="UTF-8"?>')
  && urls.every(u => [...u.children].every(c => ["loc", "lastmod"].includes(c.localName)) && /^https:\/\/mediaskills\.ch\//.test(u.children[0].textContent) && /^\d{4}-\d{2}-\d{2}$/.test(u.children[1].textContent));
const locs = urls.map(u => u.children[0].textContent + "=" + u.children[1].textContent);
check("P19-S01", gueltig && JSON.stringify(locs) === JSON.stringify([`https://mediaskills.ch/=${S0}`, "https://mediaskills.ch/methodik.html=2026-11-17"]),
  `gültiges XML nach sitemaps.org 0.9 (urlset/url/loc/lastmod, UTF-8, W3C-Datum), 2 Adressen: ${locs.join(", ")}`);
const V = fs.mkdtempSync(path.join(os.tmpdir(), "p19-vor-"));
fs.copyFileSync(path.join(W, "index.html"), path.join(V, "index.html")); fs.writeFileSync(path.join(V, "sitemap.xml"), map.replace(`<lastmod>${S0}</lastmod>`, "<lastmod>2026-11-01</lastmod>"));
build(S0, { VORHER: V }); const gleich = read(path.join(W, "sitemap.xml"));
fs.writeFileSync(path.join(V, "index.html"), read(path.join(W, "index.html")).replace("<li>", "<li>Testeintrag</li>\n<li>"));
build(S0, { VORHER: V }); const anders = read(path.join(W, "sitemap.xml"));
fs.rmSync(V, { recursive: true }); build(S0);
check("P19-S02", /<loc>https:\/\/mediaskills\.ch\/<\/loc><lastmod>2026-11-01<\/lastmod>/.test(gleich) && new RegExp(`<lastmod>${S0}</lastmod>`).test(anders)
  && /methodik\.html<\/loc><lastmod>2026-11-17</.test(gleich) && JSON.stringify(snap()) === JSON.stringify(s1),
  `lastmod nach C2: gleiche Liste → lastmod bleibt (2026-11-01), geänderte Liste → ${S0}; Methodik 2026-11-17 (U4); Endstand = Build ${S0}`);
const rb = spawnSync("python3", ["-I", path.join(CW, "paket20/tests/test_robots.py"), path.join(W, "robots.txt")]).stdout.toString();
check("P19-S03", sha(path.join(W, "robots.txt")) === sha(path.join(CW, "paket20/website/robots.txt")) && /^6\/6 PASS$/m.test(rb) && !/FAIL/.test(rb) && /Sitemap: https:\/\/mediaskills\.ch\/sitemap\.xml/.test(read(path.join(W, "robots.txt"))),
  `robots.txt byte-gleich mit Paket 20 (live, E130), verweist auf die Sitemap; test_robots.py ${(rb.match(/^\d+\/\d+ PASS$/m) || ["FAIL"])[0]}`);

// ---------- 7.5 Paket ----------
const R = fs.mkdtempSync(path.join(os.tmpdir(), "p19-rel-")); execFileSync("python3", ["-I", path.join(CW, "paket19/scripts/build_release.py"), R]);
const r1 = spawnSync("python3", ["-I", path.join(CW, "paket8/scripts/pruefe_paket.py"), path.join(R, "website")]).stdout.toString();
const ri = read(path.join(R, "website/index.html")), rr = read(path.join(R, "rollback/index.html"));
const refs = h => [...h.matchAll(/(?:src|href)="([^"#:?]+\.(?:js|css))"/g)].map(x => x[1]);
const t22 = fs.mkdtempSync(path.join(os.tmpdir(), "p22-rel-")); execFileSync("python3", ["-I", path.join(CW, "paket22/scripts/build_release.py"), t22]);
check("P19-R02", /R1 PASS/.test(r1) && /src="data-p19\.js"/.test(ri) && /src="smart-search-data-p19\.js"/.test(ri) && /src="app-v43\.js"/.test(ri)
  && refs(ri).concat(refs(rr)).every(f => fs.existsSync(path.join(R, "website", f))) && rr === read(path.join(t22, "website/index.html"))
  && ri.replace(/data-p19|smart-search-data-p19/g, "") === read(path.join(W, "index.html")).replace(/data-a1-86ff68ddc9ac|smart-search-data-a1-a38a2a2b2391/g, "").replace("app-v33.js", "app-v43.js"),
  `R1 PASS (Dateiliste, SHA-256); index.html verweist nur auf Dateien im Paket; rollback/index.html = Release Paket 22 (byte-gleich), Daten des Rückwegs im Paket`);
const lst = fs.readdirSync(path.join(R, "website")), mb = lst.reduce((n, f) => n + fs.statSync(path.join(R, "website", f)).size, 0);
const kb = fs.statSync(path.join(R, "website/index.html")).size;
check("P19-R03", mb <= 9 * 1048576 && kb <= 300 * 1024, `Paket ${lst.length} Dateien, ${(mb / 1048576).toFixed(2)} MB inkl. Rückweg (≤ 9 MB, E148); index.html ${(kb / 1024).toFixed(1)} KB (≤ 300 KB, A10); data-p19.js ${(fs.statSync(path.join(R, "website/data-p19.js")).size / 1048576).toFixed(2)} MB statt 2.37`);
fs.rmSync(t22, { recursive: true }); fs.rmSync(R, { recursive: true });

// Zählprotokoll
const P = B[S0].proto, P2 = B[S2].proto;
console.log(`INFO Zählprotokoll ${S0}: ${P.sichtbar} sichtbar, ausgeblendet ${P.ausgeblendet.gesamt} (HOLD ${P.ausgeblendet.HOLD}, nicht aktuell ${P.ausgeblendet.nicht_aktuell_ohne_HOLD}); ${S2}: ${P2.sichtbar} sichtbar`);
console.log(`\n${res.filter(r => r[1]).length}/${res.length} bestanden`); process.exit(res.every(r => r[1]) ? 0 : 1);
