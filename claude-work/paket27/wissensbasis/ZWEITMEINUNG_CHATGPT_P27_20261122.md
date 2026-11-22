# **Zweitmeinung Paket 27 – Spezifikationsprüfung**

HOLD

**Gesamturteil:** Die Architektur von P27 ist grundsätzlich mit den fünf Owner-Entscheiden vereinbar. Die Spezifikation ist jedoch noch nicht ausreichend abgesichert, um eine fehlerfreie Umsetzung und Abnahme zu gewährleisten.

Die kritischsten Probleme betreffen die Herkunftsprotokollierung, die Anbieter-Tabelle als neue Datenquelle und die Aussagekraft der Gleichheitstests. Einzelne Anforderungen widersprechen sich unmittelbar; andere lassen Implementierungen zu, die einen Test bestehen könnten, obwohl Daten falsch zugeordnet oder verändert wurden.

Die Prüfung beruht ausschliesslich auf der vorgelegten Spezifikation. Aussagen über das tatsächliche Verhalten des Codes sind damit nicht verbunden.

## **Blockierende Befunde**

### **B01 – Scope-Werte widersprechen dem Protokollierungsvertrag**

**Fundstelle:** §2 A1, A4; §5 P01, P02, P06.

**Befund:** A1 verlangt eine Protokollzeile je gesetzter Zelle. A4 weist 3'818 bestehenden Angeboten «nicht erfasst» zu. P02 erwartet trotzdem nur eine neue Scope-Protokollzeile, nämlich für OFFER-DIGICOMP-075.

Wenn «nicht erfasst» tatsächlich in die 3'818 Master-Zellen geschrieben wird, widerspricht das A1 und P02. Zudem bleibt unklar, wie ein expliziter Wert «nicht erfasst» bei Herkunft `LEER` von einem wirklich leeren Feld unterschieden wird.

**Vorschlag:** Eine von zwei Varianten verbindlich festlegen:

- **Variante A:** Die 3'818 Zellen bleiben physisch leer. «nicht erfasst» ist lediglich ihre interpretierte Bedeutung. P06 muss ausdrücklich leere Master-Zellen prüfen.
- **Variante B:** «nicht erfasst» wird tatsächlich gespeichert. Dann sind auch diese 3'818 Schreibvorgänge zu protokollieren. P02 erwartet insgesamt 7'660 statt 3'842 neue Protokolleinträge.

Die gewählte Variante muss auch `h_scope_code` und den Umgang mit späteren Scope-Korrekturen verbindlich regeln.

**Schweregrad: blockierend.**

### **B02 – Anbieter-Korrekturen sind nicht revisionssicher spezifiziert**

**Fundstelle:** §2 A2, A3; §5 B01–B08, P02, P05, P13.

**Befund:** Die Anbieter-Tabelle wird zur eigenständigen Quelle. A3 erlaubt die Korrektur einzelner Anbieter-Zellen. Die Spezifikation regelt aber nicht ausreichend, wie solche Änderungen ausgeführt und protokolliert werden.

Insbesondere fehlen:

- Eindeutiges Eingabeformat für Feldkorrekturen und die Unterscheidung zwischen leerem Wert und unverändertem Wert.
- Verbindliche Behandlung mehrerer Änderungen derselben Zelle innerhalb eines Laufs.
- Nachvollziehbare Historie mit Altwert, Neuwert, Herkunft und Register-ID für jede Anbieter-Korrektur.
- Vorgaben für die atomare Übernahme von Anbieter-Änderungen zusammen mit Angebotskorrekturen und neuen Angeboten.

Die einmaligen 3'819 `anbieter_id`-Protokollzeilen aus P02 lösen dieses Problem nicht. Sie dokumentieren keine späteren Änderungen an der Anbieter-Tabelle.

Besonders kritisch ist, dass `herkunft`, `register_id` und `quelle` als Felder einer Anbieter-Zeile nicht eindeutig die Herkunft einzelner, zu unterschiedlichen Zeitpunkten korrigierter Werte dokumentieren.

**Vorschlag:** A3 um ein verbindliches Korrekturformat und eine persistente, feldbezogene Änderungshistorie für `anbieter.csv` ergänzen. Jede Änderung muss vor der Übernahme vollständig validiert werden. Bei einem Fehler dürfen weder Anbieter-Tabelle noch Master, Protokoll oder Ausgaben verändert werden. P05 und P13 um entsprechende Wiederholungs-, Konflikt- und Rollback-Tests ergänzen.

**Schweregrad: blockierend.**

### **B03 – Übernahme des Anbieter-Sitzlands ohne eindeutige Belegregel**

**Fundstelle:** §1.1, §2 A2; §4 U2, U4; §5 B04, P03, P04.

**Befund:** A2 übernimmt `sitzland` aus `anbieter_land` und `sitzland_beleg` aus `anbieter_land_beleg`. Ein Anbieter kann aber mehrere Angebote mit unterschiedlichen Belegwerten haben.

Die Spezifikation definiert weder die Auswahl noch den Umgang mit fehlenden oder widersprüchlichen Belegen. Die Feststellung, dass ein Anbieter in keinem Angebot zwei verschiedene Länder hat, beweist noch nicht, dass dieses Land korrekt belegt ist.

B04 verlangt für Anbieter mit Land einen Beleg, aber §1 weist nicht nach, dass die dafür erforderlichen Belege bei sämtlichen 1'295 Anbietern vorhanden sind.

**Vorschlag:** Für die Erstübernahme eine deterministische Regel festlegen:

1. Sämtliche bestehenden Länder- und Belegwerte je Anbieter sammeln.
2. Bei mehreren Belegen die Konsistenz prüfen; nichts still auswählen oder verwerfen.
3. Fehlende, widersprüchliche oder nicht zuordenbare Belege als Prüfkonflikt behandeln.
4. Das Ergebnis samt Herkunft je Anbieter dokumentieren.

P03 um die Prüfung aller Anbieter-Belege und gezielte Fehlfälle ergänzen. P04 muss neben der Länderübereinstimmung auch die Belegvalidierung abdecken.

**Schweregrad: blockierend.**

### **B04 – Durchführungstabelle: Zählregel und Quellenpriorität nicht ausreichend gesichert**

**Fundstelle:** §1.2, §1.4, §2 A6; §5 P08.

**Befund:** §1.2 zählt 118 Einträge in `durchfuehrungen`. Gleichzeitig besitzen 18 Angebote ein Feld `durchfuehrungen_anzeige`.

A6 verwendet vorrangig `durchfuehrungen_anzeige`. P08 erwartet dennoch:

`118 + Angebote mit Datum ohne Liste`

Dieser Sollwert ist nur richtig, wenn die 18 vorrangigen Werte die bisher gezählten Einträge nicht verändern. Das wird nicht belegt.

Unbestimmt bleiben ausserdem das zulässige Format von `durchfuehrungen_anzeige`, die Behandlung leerer und ungültiger Werte sowie die genaue Abgrenzung zwischen einer fehlenden Liste und einer ausdrücklich leeren Liste.

**Vorschlag:** Die Prioritäts- und Parsing-Regeln vollständig definieren. Die erwartete Zeilenzahl nach Anwendung dieser Regeln am Ausgangsbestand ermitteln und in P08 festhalten.

Zusätzliche Tests: beide Felder gefüllt, leere Liste, fehlende Liste, ungültige Struktur und Angebot mit Datum ohne Liste. `start`, `ende`, `label` und `region` müssen jeweils auf ihren tatsächlichen Master-Ursprung zurückführbar sein.

**Schweregrad: blockierend.**

### **B05 – Stichtagslogik kann die Sichtbarkeitsprüfung verfälschen**

**Fundstelle:** §1.4, §2 A7, A10; §4 U3; §5 P09, P12.

**Befund:** P09 vergleicht die Sichtbarkeit an fünf Stichtagen. A10 spricht dagegen nur von einer Website-Liste «zum Stichtag», ohne eindeutig zu definieren, ob `data-p27.js` den vollständigen relevanten Bestand oder eine bereits zeitlich gefilterte Auswahl enthält.

Falls der Generator vorab nach dem Build-Stichtag filtert, können frühere Angebote im jsdom-Vergleich fehlen, obwohl sie am geprüften Stichtag sichtbar gewesen wären.

Hinzu kommt, dass Zeitzone, Tagesgrenze und einheitliche Datumsfixierung für Python und JavaScript nicht festgelegt sind.

**Vorschlag:** A7, A10 und P09 ergänzen:

- Python und JavaScript erhalten denselben expliziten Stichtag und dieselbe definierte Datums-/Zeitzonenregel.
- Für historische Vergleiche muss der geprüfte Ausgangsbestand verfügbar bleiben.
- Jeder der fünf Stichtage erhält einen reproduzierbaren, tatsächlich ausgeführten Vergleich.
- Die Sollzahlen aus §1.4 (1'006, 998, 945, 860, 795) werden ausdrücklich gegen die resultierenden ID-Mengen geprüft.

Ein Test darf nicht bestehen, wenn ein Angebot nur deshalb in beiden Ergebnissen fehlt, weil die Eingabedatei bereits vor dem Sichtbarkeitstest gefiltert wurde.

**Schweregrad: blockierend.**

### **B06 – P12 kann trotz falscher Website-Datenquelle bestehen**

**Fundstelle:** §2 A10, A12; §5 P12, P15.

**Befund:** A10 erstellt `data-p27.js` und kopiert die Website-Bestandteile aus `paket22/website/`. Die Spezifikation verpflichtet den Website-Kandidaten aber nicht ausdrücklich, die neue Datei tatsächlich zu laden.

Falls die kopierten Seiten weiterhin einen alten Datenstand referenzieren, könnte der Anzeigevergleich erfolgreich sein, obwohl die Website überhaupt nicht mit den Daten aus P27 arbeitet.

P12 vergleicht zwar die erzeugten Dateien, beweist damit aber noch nicht deren Verwendung durch die getestete Website.

**Vorschlag:** P12 um eine zwingende Ladeprüfung ergänzen: Der Website-Kandidat muss nachweisbar `data-p27.js` verwenden; die durch die App tatsächlich geladene Datenmenge muss dem geprüften P27-Artefakt entsprechen. Alte Datenreferenzen oder Fallbacks müssen den Test scheitern lassen.

Das darf nur den P27-Kandidaten betreffen. Die geschützten Altdateien aus A12/P15 bleiben unverändert.

**Schweregrad: blockierend.**

### **B07 – Bestehende Angebote können eine falsche Anbieter-Kennung behalten**

**Fundstelle:** §2 A1–A3; §5 B03, B06, B07, P03, P04.

**Befund:** B07 prüft die Übereinstimmung zwischen `anbieter_id` und `anbieter` ausdrücklich nur für neue Angebote. Schritt 026 ordnet die bestehenden Angebote einmalig zu.

Wird später bei einem bestehenden Angebot der Anbietername über eine Korrektur geändert, kann die bisherige Kennung stehen bleiben.

Beispiel: Ein Angebot wird von Anbieter A auf Anbieter B korrigiert. Beide haben Sitzland CH. K15 erkennt keinen Widerspruch, weil beide Länder übereinstimmen. Trotzdem zeigt `anbieter_id` weiterhin auf Anbieter A.

Dieser Fehler könnte unbemerkt in den Master gelangen und später die Anbieterstatistik und Kernlisten-Abdeckung verfälschen.

**Vorschlag:** Eine dauerhafte Invariante ergänzen:

Für **jede** Master-Zeile muss `anbieter` nach den definierten Zuordnungsregeln genau zu `anbieter_id` passen – nicht nur bei der Erstmigration und bei neuen Angeboten.

Bei Änderungen an `anbieter`, `anbieter_id` oder `schreibweisen` muss diese Prüfung nach dem gesamten Lauf erneut erfolgen. Jede erforderliche Kennungsänderung wird ausdrücklich protokolliert. Fehlfälle mit zwei Anbietern desselben Sitzlands in P05 aufnehmen.

**Schweregrad: blockierend.**

## **Weitere Befunde**

### **B08 – Die zugesicherte Gleichheit der Suche ist nicht hinreichend nachgewiesen**

**Fundstelle:** §1.3, §2 A5, A10, A11; §5 P07, P12.

**Befund:** A5 ändert bewusst 22 Rohwerte. §1.3 hält selbst fest, dass dadurch Leerzeichen im Suchtext wegfallen. Trotzdem verlangen §0 und P12 dieselben Suchergebnisse.

Die tolerante Trennung für Anzeige und Filter beweist noch keine Gleichheit der Freitextsuche. Suchanfragen mit wörtlichen Trennzeichen, etwa `FR | EN`, `FR|EN` oder `DE/EN`, können unterschiedlich behandelt werden.

Die 60 Vergleichsanfragen aus P12 schliessen diesen Fehler nicht aus, solange ihre Auswahl nicht geregelt ist.

**Vorschlag:** P12 um gezielte Suchtests für alle 22 geänderten Datensätze ergänzen, jeweils mit alten und neuen Trennzeichenvarianten. Dazu gehören die Kombinationen mit und ohne Leerzeichen sowie `/` und `|`.

Wenn die wörtliche Suche nach Trennzeichen nachweislich abweicht, ist das ausdrücklich als begrenzte Ausnahme vom Gleichheitsziel festzuhalten. Soll dagegen uneingeschränkte Suchgleichheit gelten, muss die Spezifikation einen entsprechenden Normalisierungsmechanismus verlangen. Der Entscheid, App-Änderungen nach P29 zu verschieben, bleibt dabei zu berücksichtigen.

**Schweregrad: sollte vor Commit geklärt werden.**

### **B09 – K16 lässt Preisangaben mit Betrag, aber ohne Währung zu**

**Fundstelle:** §1.3, §2 A8; §5 P10.

**Befund:** Der Bestand enthält 237 Preisoptionen ohne Währung. Laut §1.3 haben diese alle keinen Betrag.

K16 prüft ausschliesslich, ob ein Angebot höchstens eine Währung enthält. Eine neue Preisoption mit einem Betrag von beispielsweise `800` und leerer Währung würde diese Regel erfüllen.

Damit könnte bei der späteren Recherche ein unvollständiger Preis still übernommen werden.

**Vorschlag:** K16 ergänzen:

- Ein expliziter Geldbetrag erfordert eine gültige Währungsangabe.
- Die bestehende Ausnahme für Preisoptionen ohne Betrag bleibt erhalten, soweit sie mit dem Preisstatus vereinbar ist.
- Höchstens eine Währung je Angebot bleibt als zusätzliche Regel bestehen.

P10 um die Fehlfälle «Betrag ohne Währung» und «zwei unterschiedliche Währungen» ergänzen.

**Schweregrad: sollte vor Commit behoben werden.**

### **B10 – Scope-Begründung und Übernahmequelle sind unvollständig definiert**

**Fundstelle:** §1.5, §2 A1, A4; §5 P06.

**Befund:** Die fünf neuen Master-Spalten enthalten `scope_begruendung`, aber A4 definiert praktisch nur die Übernahme von `scope_code`.

Es fehlt die Regel, wann eine Scope-Begründung erforderlich ist, wie sie aus dem Eingang übernommen oder korrigiert wird und wie ihre Herkunft nachvollziehbar bleibt. Eine eigene Herkunftsspalte für `scope_begruendung` ist nicht vorgesehen.

Zusätzlich ist §1.5 sprachlich widersprüchlich: Der Scope-Code soll nur in der Eingangsdatei stehen, gleichzeitig soll ihn im Master bereits ein Angebot besitzen.

**Vorschlag:** A4 um die Semantik von `scope_begruendung`, ihre Herkunft und die erlaubten Änderungswege ergänzen. Für OFFER-DIGICOMP-075 den exakten Herkunftsdatensatz benennen und §1.5 entsprechend präzisieren.

P06 muss sowohl die Übernahme als auch die zulässige Kombination und Korrektur von Scope-Code und Begründung prüfen.

**Schweregrad: sollte vor Commit behoben werden.**

### **B11 – Anbieter-Tabelle kann die Kernliste je Markt nicht eindeutig abbilden**

**Fundstelle:** §0, §2 A2, A3; §3 Entscheid 2; §7 R0.

**Befund:** Entscheid 2 sieht vor, die Kernliste je Land in der Anbieter-Tabelle zu führen. Diese besitzt jedoch nur ein Länderfeld: `sitzland`.

Das Sitzland eines Anbieters ist nicht gleichbedeutend mit dem Markt, für den er recherchiert werden soll. §1.1 dokumentiert sogar einen Anbieter, der in zwei Märkten vorkommt.

Damit lässt sich aus dem vorgesehenen Schema weder die Zugehörigkeit zur Kernliste eines bestimmten Markts noch der Abdeckungsgrad dieser Kernliste zuverlässig bestimmen. Das betrifft unmittelbar die spätere Recherche DE, FR und IT sowie die Messung nach E181.

**Vorschlag:** A2 ausdrücklich auf die Stammdaten der Anbieter begrenzen und die Zuordnung von Anbietern zu Kernlisten je Markt als eigenständige Beziehung definieren. Alternativ muss das Schema eine Mehrfachzuordnung mit eindeutigem Marktcode und Kernlistenstatus unterstützen.

Falls die Marktzuordnung bewusst erst in der Recherche Stufe 1 eingeführt wird, ist dies als offene Voraussetzung festzuhalten. Die Aussage in Entscheid 2, die Tabelle ermögliche bereits die Kernlistenmessung, muss entsprechend eingeschränkt werden.

**Schweregrad: sollte vor Commit geklärt werden; blockierend für die behauptete Kernlistenfunktion.**

### **B12 – Testanforderung B08 ist logisch nicht erfüllbar**

**Fundstelle:** §5 Einleitung, B08, P05.

**Befund:** Die Testliste verlangt je Anbieter-Regel mindestens einen abgelehnten Fehlfall. B08 ist jedoch keine Verbotsregel, sondern eine ausdrücklich erlaubte Situation: Ein Anbieter darf ohne Angebot existieren.

Für diese Erlaubnis gibt es keinen Fehlfall, der aufgrund von B08 zurückgewiesen werden müsste.

**Vorschlag:** B08 als positive Zulässigkeitsregel kennzeichnen. P05 verlangt dafür einen erfolgreichen Test, keinen erwarteten Abbruch.

Der Test sollte zudem bestätigen, dass der Anbieter ohne Angebote in der Tabelle bestehen bleibt und bei einer späteren Angebotsaufnahme dieselbe Kennung behält.

**Schweregrad: sollte vor Commit behoben werden.**

### **B13 – Reproduzierbarkeit der Anbieter-Tabelle ist nicht vollständig festgelegt**

**Fundstelle:** §2 A2, A3; §5 P03, P13.

**Befund:** Die Erstfassung von `anbieter.csv` wird einmalig aus dem Master erzeugt. Danach ist dieselbe Tabelle eine eigenständige Quelle, die durch Eingangsdateien verändert wird.

Die Spezifikation unterscheidet nicht eindeutig zwischen dem unveränderlichen Ausgangszustand und der nach den Eingangsläufen fortgeschriebenen Tabelle.

Damit bleibt offen, wie ein vollständiger Neuaufbau verhindert, dass dieselben Anbieter-Korrekturen erneut auf einen bereits fortgeschriebenen Tabellenstand angewendet werden. P13 verlangt zwei bytegleiche Läufe, definiert aber nicht ausreichend die dafür identischen Ausgangsartefakte.

**Vorschlag:** A2/A3 um ein eindeutiges Replay-Modell ergänzen: versionierter Ausgangsstand, geordnete Anbieter-Eingänge und daraus deterministisch erzeugter aktueller Tabellenstand.

P13 muss den Neuaufbau aus demselben festgelegten Ausgangszustand prüfen, nicht bloss zwei Ausführungen mit bereits fortgeschriebenen Daten.

**Schweregrad: sollte vor Commit behoben werden.**

### **B14 – P28-Sichtbarkeit benötigt einen verbindlichen Ausgabe-Vertrag**

**Fundstelle:** §2 A7; §5 P09; §7 R0.

**Befund:** A7 definiert eine berechnete Sichtbarkeit und eine CSV-Ausgabe mit ID, Sichtbarkeit und Grund. P09 prüft jedoch nur die Gleichheit der sichtbaren ID-Mengen.

Nicht geprüft wird, ob alle Master-Angebote genau einmal in der Sichtbarkeitsdatei stehen und ob die Ausschlussgründe vollständig und widerspruchsfrei sind.

Für P28 besteht damit das Risiko, dass ein unvollständiges oder veraltetes Sichtbarkeitsartefakt ungeprüft als Grundlage der reduzierten Auslieferung dient.

**Vorschlag:** P09 ergänzen: genau eine Entscheidung je Master-Angebot, definierte Gründe für Marktausschluss, HOLD und fehlende Aktualität sowie eindeutiger Stichtag im Artefakt. Die sichtbare ID-Menge muss weiterhin mit JavaScript übereinstimmen.

Für P28 ausdrücklich festhalten, dass die Auslieferung nur eine zum jeweiligen Build-Stichtag validierte Sichtbarkeitsentscheidung verwenden darf.

**Schweregrad: sollte vor Commit behoben werden.**

## **Schlussurteil**

**HOLD bleibt bestehen.** Die Spezifikation ist fachlich weitgehend konsistent mit der gewählten Ausbaurichtung. Ihre offenen Punkte sind aber nicht ausschliesslich redaktioneller Natur.

Für die Freigabe der Umsetzung sind insbesondere **B01–B07** zu schliessen. B11 betrifft zusätzlich eine wesentliche Voraussetzung der späteren Kernlisten-Recherche. Die weiteren Befunde betreffen Testschärfe, Eingangsvalidierung und Reproduzierbarkeit.

Die fünf Owner-Entscheide müssen dafür voraussichtlich nicht neu getroffen werden. Die Mängel lassen sich überwiegend durch präzisere Verarbeitungsregeln und zusätzliche Abnahmetests beheben.

**Massstab für einen anschliessenden PASS:** Jede neue Datenbeziehung ist eindeutig validiert und nachvollziehbar, jeder Eingriff reproduzierbar, und P12 belegt die tatsächliche Website-Ausgabe mit den neuen P27-Daten – nicht nur die Gleichheit isolierter Dateien oder zufällig gleicher Testergebnisse.

Es wurden keine Dateien verändert und keine Repository-Aktionen ausgeführt.