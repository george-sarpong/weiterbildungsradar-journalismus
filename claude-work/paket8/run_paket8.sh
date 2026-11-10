#!/usr/bin/env bash
# Paket 8 – Testsatz Stufe 1 vollständig ausführen (offline). Aufruf im Repo-Root.
# Voraussetzungen: node 22, python3, java 17+, Chrome; npm-Pakete jsdom, axe-core, vnu-jar, playwright in $NM.
#   NM=/pfad/node_modules PLAYWRIGHT=/pfad/playwright CHROME=/usr/bin/google-chrome bash claude-work/paket8/run_paket8.sh
# Prüfling Paket 9: zusätzlich WEBSITE=claude-work/paket9/website APP=app-v37.js (sonst paket7/website, app-v36.js).
# D1 (Master 51/51) separat: GIT=/pfad/zu/worktrees bash claude-work/scripts/run_paket3.sh (aus claude-work/).
set -uo pipefail
export TZ=Europe/Zurich NODE_PATH=${NM:?NM fehlt}
rc=0
for d in 2026-11-09 2026-12-01; do
  echo "== Stichtag $d"
  for t in paket5/tests/test_app_v34.js paket6/tests/test_app_v35.js paket7/tests/test_app_v36.js; do
    STICHTAG=$d node claude-work/$t | tail -1 || rc=1
  done
  [ -n "${WEBSITE:-}" ] && { STICHTAG=$d node claude-work/paket9/tests/test_app_v37.js | tail -1 || rc=1; }
  STICHTAG=$d node claude-work/paket8/tests/test_paket8.js | tail -1 || rc=1
done
echo "== Prüfwerkzeug R1/R2"; bash claude-work/paket8/tests/test_pruefe_paket.sh | tail -1 || rc=1
echo "== Browser (axe-core, Nu Html Checker)"
VNU=${VNU:-$NM/vnu-jar/build/dist/vnu.jar} node claude-work/paket8/tests/test_browser_p8.js 2>/dev/null | tail -1 || rc=1
exit $rc
