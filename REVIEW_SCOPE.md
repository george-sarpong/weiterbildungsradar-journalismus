# REVIEW_SCOPE — mediaskills_fix_20261008_V09_MS01-MS04

MODUS: BUGFIX-REVIEW

## MS-01

Abnahmekriterium: Auf `datenschutz.html` erscheinen in Header, Tagline, `<title>` und Footer nur «Media Skills» und die Tagline der übrigen Seiten. Der Text «Weiterbildungsradar Journalismus» kommt dort nicht mehr vor.

## MS-02

Abnahmekriterium: Die Datenschutzerklärung enthält einen eigenen Abschnitt zur Freitext-Suche. Er erklärt eindeutig, dass die Eingabe ausschliesslich lokal im Browser verarbeitet, nicht an den Betreiber oder Dritte übermittelt und nicht in Cookies, lokalem Browserspeicher oder der URL gespeichert wird. Das Stand-Datum ist 8. Oktober 2026.

## MS-03

Abnahmekriterium: `sitemap.xml` enthält nur indexierbare URLs. `impressum.html` und `datenschutz.html` bleiben `noindex, follow` und sind nicht mehr in der Sitemap aufgeführt.

## MS-04

Abnahmekriterium: «Sicherheit» bleibt als Berufsbezug und im Abschnitt «Was wird erfasst?» bestehen und wird sowohl in der Begriffserklärung der Startseite als auch in der Klassifikation der Methodik eindeutig erklärt.

## Review-Regel

Prüfe ausschliesslich MS-01, MS-02, MS-03 und MS-04 in dieser Version sowie unmittelbare Regressionen, die durch genau diese Änderungen verursacht wurden. Keine früheren Bug-IDs oder Versionen wieder öffnen.

Antwort gemäss der festen Projektanweisung. Danach Prüfung beenden.
