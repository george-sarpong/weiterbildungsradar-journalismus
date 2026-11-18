#!/usr/bin/env bash
# Paket 20 – HTTPS-Weiterleitung in .htaccess (Infomaniak FAQ 1961) auf lokalem Apache 2.4 mit mod_rewrite und mod_ssl prüfen.
# Ports 80/443 lokal, Host mediaskills.ch per --resolve auf 127.0.0.1. Aufruf im Repo-Root: bash claude-work/paket20/tests/test_https.sh
set -uo pipefail
ROOT=$(pwd); W=$ROOT/claude-work/paket20/website; T=$(mktemp -d /tmp/p20https.XXXX); chmod 755 "$T"; MOD=/usr/lib/apache2/modules
mkdir -p "$T/www"; cp -r "$ROOT/docs/." "$T/www/"; cp "$W/.htaccess" "$W/robots.txt" "$T/www/"; chmod -R a+rX "$T/www"
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj "/CN=mediaskills.ch" -keyout "$T/k.pem" -out "$T/c.pem" 2>/dev/null
cat > "$T/httpd.conf" <<EOF
ServerName mediaskills.ch
DefaultRuntimeDir $T
PidFile $T/httpd.pid
Listen 127.0.0.1:80
Listen 127.0.0.1:443
LoadModule mpm_event_module $MOD/mod_mpm_event.so
LoadModule authz_core_module $MOD/mod_authz_core.so
LoadModule dir_module $MOD/mod_dir.so
LoadModule mime_module $MOD/mod_mime.so
LoadModule headers_module $MOD/mod_headers.so
LoadModule rewrite_module $MOD/mod_rewrite.so
LoadModule socache_shmcb_module $MOD/mod_socache_shmcb.so
LoadModule ssl_module $MOD/mod_ssl.so
User www-data
Group www-data
ErrorLog $T/error.log
TypesConfig /etc/mime.types
DocumentRoot $T/www
DirectoryIndex index.html
<Directory $T/www>
  AllowOverride All
  Require all granted
</Directory>
<VirtualHost 127.0.0.1:443>
  SSLEngine on
  SSLCertificateFile $T/c.pem
  SSLCertificateKeyFile $T/k.pem
</VirtualHost>
EOF
apache2 -f "$T/httpd.conf" -k start || { cat "$T/error.log"; exit 1; }; sleep 1
c() { curl -sk --noproxy '*' --resolve mediaskills.ch:80:127.0.0.1 --resolve mediaskills.ch:443:127.0.0.1 -o /dev/null "$@"; }
ok=0; n=0; t() { n=$((n+1)); if [ "$2" = "$3" ]; then ok=$((ok+1)); echo "PASS $1"; else echo "FAIL $1 – ist «$2», soll «$3»"; fi; }
t "W1 http Start -> 301 auf https" "$(c -w '%{http_code} %{redirect_url}' http://mediaskills.ch/)" "301 https://mediaskills.ch/"
t "W2 Pfad und Suchparameter bleiben" "$(c -w '%{http_code} %{redirect_url}' 'http://mediaskills.ch/methodik.html?q=x#y')" "301 https://mediaskills.ch/methodik.html?q=x"
t "W3 robots.txt über http -> https" "$(c -w '%{http_code} %{redirect_url}' http://mediaskills.ch/robots.txt)" "301 https://mediaskills.ch/robots.txt"
t "W4 https Start 200, keine Weiterleitung" "$(c -w '%{http_code} %{redirect_url}' https://mediaskills.ch/)" "200 "
t "W5 von http aus genau 1 Weiterleitung, keine Schleife" "$(c -L --max-redirs 3 -w '%{http_code} %{num_redirects}' http://mediaskills.ch/methodik.html)" "200 1"
H=$(curl -sk --noproxy '*' --resolve mediaskills.ch:443:127.0.0.1 -D - -o /dev/null https://mediaskills.ch/ | tr -d '\r' | grep -ciE '^(content-security-policy|x-content-type-options|referrer-policy):')
t "W6 Sicherheits-Header über https unverändert (3)" "$H" "3"
t "W7 unbekannte Adresse über https bleibt 404" "$(c -w '%{http_code}' https://mediaskills.ch/gibt-es-nicht.html)" "404"
apache2 -f "$T/httpd.conf" -k stop; sleep 1; rm -rf "${T:?}"
echo "$ok/$n PASS"; [ $ok -eq $n ]
