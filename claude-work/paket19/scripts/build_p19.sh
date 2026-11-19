#!/usr/bin/env bash
# Paket 19 – Build (D1): Website-Kandidat paket19/website/ aus paket22/website/ zum Stichtag.
# Aufruf (aus claude-work/): NODE_PATH=<ordner>/node_modules bash paket19/scripts/build_p19.sh YYYY-MM-DD
# Optional VORHER=<ordner mit index.html und sitemap.xml des letzten Builds> für lastmod (C2).
# Ausgang: index.html (Liste, «Stand der Angaben»), data-p19.js, sitemap.xml + unveränderte Seiten aus Paket 22;
# paket19/out/smart-search-data-p19.json, b2_herkunft.json, zaehlprotokoll_<Stichtag>.json.
set -euo pipefail
S0=${1:?Stichtag YYYY-MM-DD fehlt}
export TZ=Europe/Zurich NODE_PATH=${NODE_PATH:?NODE_PATH fehlt}
rm -rf paket19/website && mkdir -p paket19/website
cp -a paket22/website/. paket19/website/ && rm paket19/website/data-p22.js
python3 -I paket19/scripts/build_daten_p19.py
node paket19/scripts/build_liste_p19.js "$S0"
