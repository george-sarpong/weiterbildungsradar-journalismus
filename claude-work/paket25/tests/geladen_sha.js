// Paket 25 A12/G15 (B03): Nachweis der tatsächlich ausgelieferten Dateien, ohne die Testwerkzeuge zu ändern.
// Vorladen mit «node -r ./paket25/tests/geladen_sha.js …»: jede Datei, die der lokale Prüfstand-Server der Werkzeuge
// (fs.createReadStream) an den Browser ausliefert, wird mit SHA-256 in GELADEN_LOG (JSON-Zeilen) protokolliert.
"use strict";
const fs = require("fs"), crypto = require("crypto"), path = require("path");
const LOG = process.env.GELADEN_LOG || "/tmp/geladen_sha.jsonl", orig = fs.createReadStream;
fs.createReadStream = function (p, ...rest) {
  try { if (typeof p === "string" && /\.(js|html|css)$/.test(p)) fs.appendFileSync(LOG, JSON.stringify({ datei: path.basename(p), ordner: path.basename(path.dirname(p)), sha256: crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex") }) + "\n"); }
  catch (e) { /* Protokoll darf den Test nicht verändern */ }
  return orig.call(this, p, ...rest);
};
