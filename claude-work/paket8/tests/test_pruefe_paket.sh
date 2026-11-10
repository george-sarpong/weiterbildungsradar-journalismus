#!/usr/bin/env bash
# Paket 8 – Test des Prüfwerkzeugs R1/R2 (pruefe_paket.py) am Rollback-Paket = Live-Snapshot Paket A (E044).
# Aufruf im Repo-Root: bash claude-work/paket8/tests/test_pruefe_paket.sh
set -uo pipefail
CW=claude-work; P=$CW/paket8/scripts/pruefe_paket.py; SNAP=$CW/live-snapshot-20261109
T=$(mktemp -d); ok=0; n=0
t() { n=$((n+1)); if [ "$2" = "$3" ]; then ok=$((ok+1)); echo "PASS $1"; else echo "FAIL $1 (erwartet $3, erhalten $2)"; fi; }
python3 -I $P $SNAP --ausser README.md >/dev/null; t "R2 Rollback-Paket Paket A: alle Hashes und Verweise in Ordnung" $? 0
cp -r $SNAP $T/a; rm $T/a/README.md
printf 'x' >> $T/a/app-v33.js; python3 -I $P $T/a >/dev/null; t "Gegenprobe: veränderte Datei erkannt" $? 1
cp -r $SNAP $T/b; rm $T/b/README.md $T/b/styles-v24.css
o=$(python3 -I $P $T/b); grep -qF "FEHLT styles-v24.css" <<<"$o"; t "Gegenprobe: fehlende Datei erkannt" $? 0
cp -r $SNAP $T/c; rm $T/c/README.md; echo neu > $T/c/extra.js
o=$(python3 -I $P $T/c); grep -qF "NICHT GELISTET extra.js" <<<"$o"; t "Gegenprobe: ungelistete Datei erkannt" $? 0
cp -r $SNAP $T/d; rm $T/d/README.md; sed -i 's/src="app-v33.js"/src="app-v99.js"/' $T/d/index.html
(cd $T/d && sha256sum $(awk '{print $2}' SHA256SUMS.txt) > SHA256SUMS.txt)
o=$(python3 -I $P $T/d); grep -qF "VERWEIS index.html -> app-v99.js" <<<"$o"; t "Gegenprobe: Verweis auf Datei ausserhalb des Pakets erkannt" $? 0
rm -rf $T
echo; echo "$ok/$n PASS"; [ $ok -eq $n ]
