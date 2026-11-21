#!/usr/bin/env bash
# Paket 25 – Build (SPEZIFIKATION_PAKET25_20261120.md A8): Website-Kandidat paket25/website/ zum Stichtag.
# Seiten und App wie build_p19.sh aus paket22/website/ (ohne Datendatei); Daten nur aus dem Master über den Generator
# (scripts/generator_website.py, E192–E194); Liste, «Stand der Angaben» und Sitemap mit build_liste_p25.js.
# Aufruf (aus claude-work/): NODE_PATH=<ordner>/node_modules bash paket25/scripts/build_p25.sh YYYY-MM-DD
# Optional VORHER=<ordner mit index.html und sitemap.xml des letzten Builds> für lastmod (wie Paket 19).
# Ausgang: paket25/website/ (index.html, data-p25.js, sitemap.xml + unveränderte Seiten aus Paket 22),
#          paket25/out/smart-search-data-p25.json, zaehlprotokoll_<Stichtag>.json. Kein Release (Entscheid 4 A, E195).
set -euo pipefail
S0=${1:?Stichtag YYYY-MM-DD fehlt}
export TZ=Europe/Zurich NODE_PATH=${NODE_PATH:?NODE_PATH fehlt}
rm -rf paket25/website && mkdir -p paket25/website paket25/out
cp -a paket22/website/. paket25/website/ && rm paket25/website/data-p22.js
python3 -I scripts/generator_website.py
node paket25/scripts/build_liste_p25.js "$S0"
