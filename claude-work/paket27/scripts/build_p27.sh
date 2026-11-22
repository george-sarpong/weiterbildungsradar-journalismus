#!/usr/bin/env bash
# Paket 27 – Build (SPEZIFIKATION_PAKET27_20261122.md A6, A7, A10): Website-Kandidat paket27/website/ zum Stichtag, wie
# paket25/scripts/build_p25.sh; Generator unverändert, nur Ausgabepfade (data-p27.js, smart-search-data-p27.json).
# Dazu die abgeleiteten Tabellen: paket27/out/durchfuehrungen.csv (E215) und sichtbarkeit_<Stichtag>.csv (E216).
# Voraussetzung: Master nach P27 (python3 -I scripts/master_nachtraege.py --out paket3/out).
# Aufruf (aus claude-work/): NODE_PATH=<ordner>/node_modules bash paket27/scripts/build_p27.sh YYYY-MM-DD
set -euo pipefail
S0=${1:?Stichtag YYYY-MM-DD fehlt}
export TZ=Europe/Zurich NODE_PATH=${NODE_PATH:?NODE_PATH fehlt}
rm -rf paket27/website && mkdir -p paket27/website paket27/out
cp -a paket22/website/. paket27/website/ && rm paket27/website/data-p22.js
python3 -I scripts/generator_website.py --daten paket27/website/data-p27.js --smart paket27/out/smart-search-data-p27.json
WEBSITE=paket27/website OUTDIR=paket27/out DATA=data-p27.js SMART=paket27/out/smart-search-data-p27.json \
  node paket25/scripts/build_liste_p25.js "$S0"
python3 -I scripts/durchfuehrungen.py
python3 -I scripts/sichtbarkeit.py "$S0"
