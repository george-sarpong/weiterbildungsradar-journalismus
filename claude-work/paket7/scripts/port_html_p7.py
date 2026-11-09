"""Paket 7: index.html und methodik.html (Paket 6) -> Paket 7. Nur Texte zu D7 (E043) und F6 (E057).
Skript-Verweise bleiben unverändert (Release-Paket ist ein eigener Schritt mit Freigabe).
Aufruf: python3 port_html_p7.py <p6-website-ordner> <p7-website-ordner>. Jede Ersetzung muss genau einmal passen."""
import sys, hashlib, pathlib
src, dst = map(pathlib.Path, sys.argv[1:3])
FILES = {
 "index.html": ("d3eb7d5c3297", [
  ("D7 Lead",
   "Vergleiche Thema, Preis, Durchführungsform, Dauer, Start, Sprache und Anbieterbasis.</p>",
   "Vergleiche Thema, Preis, Durchführungsform, Dauer, Start, Sprache und Durchführungsort.</p>"),
  ("D7 Filterbezeichnung",
   """            <span>Land / Anbieterbasis</span>
            <select id="countryFilter"><option value="">Alle Länder</option></select>""",
   """            <span>Durchführungsort</span>
            <select id="countryFilter"><option value="">Alle Orte</option></select>"""),
 ]),
 "methodik.html": ("490f35baba7e", [
  ("F6 Kostenlos nach E057",
   "Als «kostenlos» gelten Angebote, für deren Teilnahme kein Entgelt anfällt; ein kostenloses Nutzerkonto ist keine Mitgliedschaft.</p>",
   "Als «Kostenlos» gelten Angebote, für deren Teilnahme ohne Bedingung kein Entgelt anfällt; ein kostenloses Nutzerkonto ist keine Mitgliedschaft. Gilt die kostenlose Teilnahme nur für bestimmte Personen, etwa Mitglieder, steht «Kostenlos mit Bedingung: …» mit der Bedingung. Ist eine Gratis-Angabe veraltet oder nicht bestätigt, steht «Preis unbestätigt».</p>"),
  ("D7 Abschnitt Ort",
   """        <h2 id="ort">Land, Region und Durchführungsform</h2>
        <p>Das Land bezeichnet die Anbieterbasis beziehungsweise die institutionelle Zuordnung. Bei Schweizer Anbietern wird auf der Karte zusätzlich Deutschschweiz oder Romandie ausgewiesen. Die Kurssprache bleibt davon getrennt.</p>""",
   """        <h2 id="ort">Ort, Anbieterland und Durchführungsform</h2>
        <p>Ort, Anbieterland und Zugang aus der Schweiz werden getrennt ausgewiesen. «Ort» nennt das Land des Durchführungsorts und die publizierte Region oder Stadt, bei reinen Online-Angeboten «Online». «Anbieterland» erscheint nur mit Beleg. «CH-Zugang: ja» steht, wenn ein Durchführungsort in der Schweiz genannt ist; aus dem Anbieterland wird der Zugang nie abgeleitet. Fehlt eine dieser Angaben, steht «nicht erfasst». Die Kurssprache bleibt davon getrennt.</p>"""),
 ]),
}
dst.mkdir(parents=True, exist_ok=True)
for name, (prefix, edits) in FILES.items():
    html = (src / name).read_text(encoding="utf-8")
    assert hashlib.sha256(html.encode()).hexdigest().startswith(prefix), f"{name}: Quelle ist nicht Paket 6"
    for label, old, new in edits:
        n = html.count(old)
        assert n == 1, f"{name} {label}: {n} Treffer statt 1"
        html = html.replace(old, new)
    (dst / name).write_text(html, encoding="utf-8")
    print("OK", name, len(edits), "Ersetzungen,", hashlib.sha256(html.encode()).hexdigest())
