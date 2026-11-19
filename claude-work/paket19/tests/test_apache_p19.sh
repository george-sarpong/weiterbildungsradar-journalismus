#!/usr/bin/env bash
# Paket 19 – Release-Paket auf lokalem Apache 2.4 mit .htaccess (R04, R05, J01 per curl) und Browser-Prüfungen.
# Prüfstand: build_release.py → website/ + .htaccess (paket22/website/.htaccess = Live-Stand, E146/E150); Rückweg = website/ mit rollback/index.html.
# Sicherheits-Header 7/7: separat mit QUELLE=<ordner> bash claude-work/paket20/tests/test_sicherheit.sh (Paket und Rückweg).
# Aufruf im Repo-Root: NODE_PATH=<ordner>/node_modules [STICHTAG=YYYY-MM-DD] bash claude-work/paket19/tests/test_apache_p19.sh
set -uo pipefail
ROOT=$(pwd); CW=$ROOT/claude-work; T=$(mktemp -d /tmp/p19apache.XXXX); chmod 755 $T
MOD=/usr/lib/apache2/modules; rc=0; S0=${STICHTAG:-2026-11-19}
python3 -I $CW/paket19/scripts/build_release.py $T/rel >/dev/null || exit 1
mkdir -p $T/www $T/rueck
cp -a $T/rel/website/. $T/www/; cp $CW/paket22/website/.htaccess $T/www/
cp -a $T/www/. $T/rueck/; cp $T/rel/rollback/index.html $T/rueck/index.html
chmod -R a+rX $T
conf() { cat > $T/httpd-$1.conf <<EOF
ServerName localhost
DefaultRuntimeDir $T
PidFile $T/httpd-$1.pid
Listen 127.0.0.1:$1
LoadModule mpm_event_module $MOD/mod_mpm_event.so
LoadModule authz_core_module $MOD/mod_authz_core.so
LoadModule dir_module $MOD/mod_dir.so
LoadModule mime_module $MOD/mod_mime.so
LoadModule headers_module $MOD/mod_headers.so
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
  apache2 -f $T/httpd-$1.conf -k start || { cat $T/error-$1.log; exit 1; }; }
conf 8091 $T/www; conf 8092 $T/rueck; sleep 1
ok() { if [ "$1" = 1 ]; then echo "PASS $2"; else echo "FAIL $2"; rc=1; fi; }
st() { curl -s -o /dev/null -w '%{http_code}' "$1"; }
a=$(st http://127.0.0.1:8091/); b=$(st http://127.0.0.1:8091/methodik.html); c=$(st http://127.0.0.1:8091/sitemap.xml)
ct=$(curl -sI http://127.0.0.1:8091/sitemap.xml | tr -d '\r' | grep -i '^content-type' | cut -d' ' -f2-)
ok $([ "$a$b$c" = 200200200 ] && echo 1) "P19-R04 Status – Startseite $a, Methodik $b, Sitemap $c (Content-Type ${ct})"
n=$(curl -s http://127.0.0.1:8091/ | grep -c '^<li><a href=')
s=$(curl -s http://127.0.0.1:8091/ | grep -o 'Stand der Angaben: [0-9.]*')
ok $([ "$n" -gt 900 ] && [ -n "$s" ] && echo 1) "P19-J01 curl – ohne JavaScript $n Einträge mit Link, «$s»"
r=$(st http://127.0.0.1:8092/); ok $([ "$r" = 200 ] && curl -s http://127.0.0.1:8092/ | grep -q 'src="data-p22.js"' && echo 1) "P19-R05 Status – Rückweg $r, lädt data-p22.js"
STICHTAG=$S0 node $CW/paket19/tests/test_browser_p19.js http://127.0.0.1:8091 http://127.0.0.1:8092 || rc=1
for p in 8091 8092; do apache2 -f $T/httpd-$p.conf -k stop; done
sleep 1; rm -rf "${T:?}"
exit $rc
