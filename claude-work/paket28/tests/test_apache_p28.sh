#!/usr/bin/env bash
# Paket 28 P10 (Cache-Regel) und P11 (Sicherheit, HTTPS-Weiterleitung) auf lokalem Apache 2.4 mit mod_headers, mod_rewrite,
# mod_ssl (wie paket20/tests/test_https.sh). Hauptordner = website/ des Releases, .htaccess = htaccess.txt des Releases.
# Live steht die Variante «RewriteCond %{HTTP:X-Forwarded-Proto} !https» (U4): bei Infomaniak setzt der vorgelagerte Proxy
# X-Forwarded-Proto. Lokal nachgebildet: der HTTPS-Port setzt «X-Forwarded-Proto: https», der HTTP-Port nichts.
# Aufruf (aus claude-work/): bash paket28/tests/test_apache_p28.sh <release-ordner>
set -uo pipefail
REL=$(cd "${1:?Release-Ordner fehlt}" && pwd); T=$(mktemp -d /tmp/p28apache.XXXX); chmod 755 "$T"; MOD=/usr/lib/apache2/modules
mkdir -p "$T/www"; cp -r "$REL/website/." "$T/www/"; cp "$REL/htaccess.txt" "$T/www/.htaccess"; chmod -R a+rX "$T/www"
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
  RequestHeader set X-Forwarded-Proto https early
</VirtualHost>
EOF
apache2 -f "$T/httpd.conf" -k start || { cat "$T/error.log"; exit 1; }; sleep 1
R="--resolve mediaskills.ch:80:127.0.0.1 --resolve mediaskills.ch:443:127.0.0.1"
c() { curl -sk --noproxy '*' $R -o /dev/null "$@"; }
kopf() { curl -sk --noproxy '*' $R -D - -o /dev/null "$@" | tr -d '\r'; }
cc() { kopf "$@" | grep -i '^cache-control:' | sed 's/^[^:]*: //'; }
ok=0; n=0; t() { n=$((n+1)); if [ "$2" = "$3" ]; then ok=$((ok+1)); echo "PASS $1"; else echo "FAIL $1 – ist «$2», soll «$3»"; fi; }
D=$(cd "$T/www" && ls daten-*.js); S=$(cd "$T/www" && ls suche-*.js); L="max-age=31536000, immutable"; U=https://mediaskills.ch
# P10 Cache-Regel
t "C01 $D lang" "$(cc $U/$D)" "$L"
t "C02 $S lang" "$(cc $U/$S)" "$L"
t "C03 app-v43.js lang" "$(cc $U/app-v43.js)" "$L"
t "C04 styles-v22.css lang" "$(cc $U/styles-v22.css)" "$L"
t "C05 styles-v24.css lang" "$(cc $U/styles-v24.css)" "$L"
t "C06 Startseite / no-cache" "$(cc $U/)" "no-cache"
t "C07 index.html no-cache" "$(cc $U/index.html)" "no-cache"
for f in methodik.html datenschutz.html impressum.html 404.html robots.txt sitemap.xml; do t "C08 $f no-cache" "$(cc $U/$f)" "no-cache"; done
t "C09 SHA256SUMS.txt ohne Cache-Regel" "$(cc $U/SHA256SUMS.txt)" ""
E=$(kopf $U/$D | grep -i '^etag:' | sed 's/^[^:]*: //')
t "C10 $D Wiederholung mit ETag 304, Cache-Control bleibt" "$(kopf -H "If-None-Match: $E" $U/$D | awk 'NR==1{print $2} tolower($0)~/^cache-control:/{sub(/^[^:]*: /,"");print}' | paste -sd'|')" "304|$L"
E2=$(kopf $U/ | grep -i '^etag:' | sed 's/^[^:]*: //')
t "C11 Startseite Wiederholung mit ETag 304, no-cache bleibt" "$(kopf -H "If-None-Match: $E2" $U/ | awk 'NR==1{print $2} tolower($0)~/^cache-control:/{sub(/^[^:]*: /,"");print}' | paste -sd'|')" "304|no-cache"
# P11 Sicherheit und Weiterleitung (wie Paket 20 W1–W7)
t "W1 http Start -> 301 auf https" "$(c -w '%{http_code} %{redirect_url}' http://mediaskills.ch/)" "301 https://mediaskills.ch/"
t "W2 Pfad und Suchparameter bleiben" "$(c -w '%{http_code} %{redirect_url}' 'http://mediaskills.ch/methodik.html?q=x#y')" "301 https://mediaskills.ch/methodik.html?q=x"
t "W3 Datendatei über http -> https" "$(c -w '%{http_code} %{redirect_url}' http://mediaskills.ch/$D)" "301 https://mediaskills.ch/$D"
t "W4 https Start 200, keine Weiterleitung" "$(c -w '%{http_code} %{redirect_url}' $U/)" "200 "
t "W5 von http aus genau 1 Weiterleitung, keine Schleife" "$(c -L --max-redirs 3 -w '%{http_code} %{num_redirects}' http://mediaskills.ch/methodik.html)" "200 1"
for f in "" "$D" "app-v43.js" "robots.txt"; do
  t "W6 Sicherheits-Header über https (3) /$f" "$(kopf $U/$f | grep -ciE '^(content-security-policy|x-content-type-options|referrer-policy):')" "3"; done
t "W7 unbekannte Adresse über https bleibt 404" "$(c -w '%{http_code}' $U/gibt-es-nicht.html)" "404"
t "W8 CSP-Wortlaut = Live-Datei" "$(kopf $U/ | grep -i '^content-security-policy:' | sed 's/^[^:]*: //')" "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
apache2 -f "$T/httpd.conf" -k stop; sleep 1; rm -rf "${T:?}"
echo "$ok/$n PASS"; [ $ok -eq $n ]
