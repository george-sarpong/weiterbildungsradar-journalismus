#!/usr/bin/env bash
# Paket 20 – Sicherheits-Header (.htaccess, E124) und robots.txt (E125) auf einem lokalen Apache 2.4 prüfen.
# Prüfstand = docs/ (Abnahme-Stand Paket 20) + paket20/website/.htaccess + robots.txt. Kein Release-Paket (Projektregel 7).
# Voraussetzung: apache2 (Debian/Ubuntu), node 22, playwright + Chrome. Aufruf im Repo-Root:
#   NODE_PATH=<ordner>/node_modules bash claude-work/paket20/tests/test_sicherheit.sh
set -uo pipefail
ROOT=$(pwd); W=$ROOT/claude-work/paket20/website; T=$(mktemp -d /tmp/p20apache.XXXX); chmod 755 $T
MOD=/usr/lib/apache2/modules; rc=0
conf() { # $1 = Port, $2 = Docroot, $3 = mit mod_headers (1/0)
  cat > $T/httpd-$1.conf <<EOF
ServerName localhost
DefaultRuntimeDir $T
PidFile $T/httpd-$1.pid
Listen 127.0.0.1:$1
LoadModule mpm_event_module $MOD/mod_mpm_event.so
LoadModule authz_core_module $MOD/mod_authz_core.so
LoadModule dir_module $MOD/mod_dir.so
LoadModule mime_module $MOD/mod_mime.so
$( [ "$3" = 1 ] && echo "LoadModule headers_module $MOD/mod_headers.so" )
User www-data
Group www-data
ErrorLog $T/error-$1.log
TypesConfig /etc/mime.types
AddType text/javascript .js
DocumentRoot $2
DirectoryIndex index.html
<Directory $2>
  AllowOverride All
  Require all granted
</Directory>
EOF
  apache2 -f $T/httpd-$1.conf -k start || { echo "Apache Start fehlgeschlagen ($1)"; cat $T/error-$1.log; exit 1; }
}
QUELLE=${QUELLE:-$ROOT/docs}   # auch mit dem Live-Snapshot prüfen: Rückweg auf die alte index.html, .htaccess bleibt
mk() { mkdir -p "$T/$1"; cp -r "$QUELLE/." "$T/$1/"; cp $W/.htaccess $W/robots.txt $T/$1/; chmod -R a+rX $T/$1; }
mk www; conf 8088 $T/www 1
mk ohne; conf 8089 $T/ohne 0                     # Server ohne mod_headers: Website muss trotzdem laufen (IfModule)
mk kaputt; printf 'Header always sett X-Test "1"\n' >> $T/kaputt/.htaccess; conf 8090 $T/kaputt 1   # Tippfehler: zeigt das Risiko
sleep 1
node $ROOT/claude-work/paket20/tests/test_sicherheit.js http://127.0.0.1:8088 http://127.0.0.1:8089 http://127.0.0.1:8090 || rc=1
python3 -I $ROOT/claude-work/paket20/tests/test_robots.py $W/robots.txt || rc=1
for p in 8088 8089 8090; do apache2 -f $T/httpd-$p.conf -k stop; done
sleep 1; rm -rf "${T:?}"
exit $rc
