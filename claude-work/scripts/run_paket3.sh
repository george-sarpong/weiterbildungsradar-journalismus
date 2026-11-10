#!/usr/bin/env bash
# Paket 3 reproduzierbar ausführen (offline). Voraussetzung: Git-Worktrees der drei Stände.
#   git worktree add --detach $GIT/base 86868e085d35bffb0da8e655a0580ec1d80fa0ac
#   git worktree add --detach $GIT/main 5f09e0789c42eeceef0661c47434b87ba369927d
#   git worktree add --detach $GIT/pr10 82bb95f948efe66075216c9a8e3e5b385697b546
# Aufruf aus claude-work/:  GIT=/pfad/zu/worktrees bash scripts/run_paket3.sh
# Paket 4: Owner-Entscheide aus paket3/config/owner_entscheide.csv (einmalig erzeugt mit scripts/paket4_owner_entscheide.py, E060–E064).
set -euo pipefail
GIT=${GIT:-/home/claude/git}
LIVE=live-snapshot-20261109; EIN=paket3/eingaben; OUT=paket3/out; ST=2026-11-09
(cd $LIVE && sha256sum -c --quiet SHA256SUMS.txt)
python3 -I scripts/merge3.py --base $GIT/base --live $LIVE --main $GIT/main --pr10 $GIT/pr10 \
  --katalog $EIN/Arbeitskatalog_3818_V288_20261108.xlsx --policy $GIT/pr10/data/staging/evt270-currentness-policy-20261107.json \
  --vorschlaege paket3/config/konflikt_vorschlaege.json --owner paket3/config/owner_entscheide.csv --out $OUT > /dev/null
python3 -I scripts/build_master_p3.py --merge $OUT --katalog $EIN/Arbeitskatalog_3818_V288_20261108.xlsx \
  --r4 $EIN/R4_PUBLICATION_ROWS_20260915.json --usowner $GIT/pr10/data/staging/usa-owner-evidence-crosswalk-20261107.jsonl \
  --v41e4 $EIN/V41_E4_SCHUTZ_1352.csv --v41v288 $EIN/V41_V288_PROVENIENZ_829.csv --stichtag $ST --out $OUT > /dev/null
python3 -I scripts/paket3_listen.py --out $OUT --r4 $EIN/R4_PUBLICATION_ROWS_20260915.json --at $EIN/AT_OWNER_DISPOSITIONS_R3_20260930.csv --stichtag $ST > /dev/null
python3 -I scripts/test_paket3.py --base $GIT/base --live $LIVE --main $GIT/main --pr10 $GIT/pr10 --eingaben $EIN \
  --usowner $GIT/pr10/data/staging/usa-owner-evidence-crosswalk-20261107.jsonl --out $OUT --scripts scripts --owner paket3/config/owner_entscheide.csv
