# REVIEW_SCOPE — mediaskills_fix_20261008_V08_MS13

MODUS: BUGFIX-REVIEW
BUG-ID: MS-13

## Ausgangslage

V07 hat MS-12 nach interner Prüfung und unabhängigem Claude-Review bestanden. V05 und V06 bleiben widerrufen. V08 baut ausschliesslich auf V07 auf und behebt den danach separat eröffneten Parserfehler MS-13.

## MS-13

Problem: Negierte Kanalformulierungen wurden doppelt interpretiert. `ohne Präsenz` und `keine Präsenz` ergaben `STRICT_REMOTE + IN_PERSON`; `ohne Online-Anteil` und `ohne online` ergaben `ONLINE + STRICT_IN_PERSON`. V07 erkannte diese widersprüchlichen Intents korrekt als leere Varianten-Schnittmenge und lieferte deshalb 0 Treffer. Die Chips zeigten zusätzlich interne Intent-Namen.

Fundstelle: `app.js`, Funktion `parseDeliveryIntent` und Delivery-Chips in `renderSmart`.

Abnahmekriterien — nur diese prüfen:

A. `ohne Präsenz`, `keine Präsenz`, `kein Präsenzkurs` und `keinen Präsenzkurs` erzeugen exakt `STRICT_REMOTE`, nie zusätzlich `IN_PERSON`.
B. `ohne Online-Anteil`, `ohne online`, `kein Online-Anteil` und `kein online` erzeugen exakt `STRICT_IN_PERSON`, nie zusätzlich `ONLINE`.
C. Gross-/Kleinschreibung, Umlaute, die Schreibweise `Praesenz` und Satzzeichen ändern diese Erkennung nicht.
D. Die positiven Kontrollen `online`, `Präsenz`, `100% online` und `nur Präsenz` behalten ihre bisherigen einzelnen Intents.
E. Explizit widersprüchliche Anforderungen wie `100% online und nur Präsenz`, `nur Präsenz und online` oder `ohne Präsenz und Präsenz` bleiben als getrennte Intents erhalten und ergeben keinen bestätigten Treffer. Nur das Kanalwort innerhalb der negierten Phrase wird unterdrückt.
F. Zusätzliche unabhängige Intents wie `webinar`, Inhaltsterme, Budget und `kostenlos` bleiben kombinierbar; die negierte Kanalphrase erzeugt dabei keinen Inhaltsterm.
G. Die vier gemeldeten Negationsabfragen liefern denselben Realdatenbestand wie ihre positiven strikten Entsprechungen: Remote-Negation wie `100% online`, Online-Negation wie `nur Präsenz`.
H. Delivery-Chips sind verständlich deutsch beschriftet. Interne Tokens wie `STRICT_REMOTE`, `STRICT_IN_PERSON` und der irreführende Gegen-Intent erscheinen nicht.
I. Nur `VERIFIED + MATCH` erfüllt weiterhin einen harten Delivery-Constraint; `PROVISIONAL`, `UNKNOWN` und `MISMATCH` bleiben ausgeschlossen beziehungsweise getrennt.
J. Die V07-Varianten-Schnittmenge bleibt unverändert: Eigenschaften verschiedener Varianten dürfen nicht vereinigt werden; passende Varianten-IDs bleiben für FREE- und Budgetoptionen erhalten.
K. Alle bisherigen MS-12-Suites, die exhaustive Variantenmatrix und der Realdaten-Audit bleiben grün.
L. Gegenüber V07 ändern sich von den zwölf Release-Dateien ausschliesslich `app.js` und `REVIEW_SCOPE.md`; in `app.js` nur Parser-Präzedenz, Intent-Labels und Chip-Darstellung.
M. `data.js`, `smart-search-data.js`, Parser-/Resolver-Versionen, 1'352 Runtime-/Sidecar-IDs und die 20 R11-Blindzeilen bleiben unverändert.
N. Klassische Filter, Favoriten, Preisbandanzeige, `#smartBundle`, Speicher-/URL-Grenzen und Netzwerkfreiheit bleiben unverändert.

## Review-Regel
Claude prüft ausschliesslich MS-13 und die unmittelbaren Regressionen aus den Kriterien A–N in genau dieser Version. Andere Beobachtungen werden separat gemeldet und verändern dieses Urteil nur, wenn sie durch V08 neu entstanden sind.

Antwortformat gemäss kanonischem BUGFIX-REVIEW-Prozess:

MS-13 — PASS

oder

MS-13 — FAIL
Restfehler: <kurz>
Fundstelle: <Datei und Zeile dieser Version>

oder

MS-13 — NEUE REGRESSION
Regression: <kurz>
Fundstelle: <Datei und Zeile dieser Version>

Abschluss:
REVIEW = PASS

oder
REVIEW = FAIL
OFFEN = MS-13
