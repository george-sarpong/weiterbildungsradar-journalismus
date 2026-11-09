"""Paket 6, Schritt B (§5 Punkt 2, E020): PR10-Commit 10c5943, Teile index.html und methodik.html.
Quelle: Live-Snapshot. Skript-Verweise in index.html bleiben unverändert (Release-Schritt)."""
import sys, hashlib, pathlib
snap, out = map(pathlib.Path, sys.argv[1:3])
HASH = {"index.html": "08ab7e1a876b", "methodik.html": "d16ef72c1dd5"}
EDITS = {
 "index.html": [
  ("""                <option value="EDITORIAL">Redaktionelle Auswahl</option>
                <option value="START">Nächster Start</option>
                <option value="APPROVED">Zuletzt geprüft</option>
""", """                <option value="APPROVED">Zuletzt geprüft (neueste zuerst)</option>
                <option value="START">Nächster Start</option>
"""),
  ("<p>Media Skills ist eine redaktionell ausgewählte und anhand offizieller Quellen geprüfte Marktübersicht für Journalist:innen und Creator-Journalist:innen. Die Beta-Version",
   "<p>Media Skills erfasst Weiterbildungsangebote anhand dokumentierter Aufnahmekriterien und prüft die Angaben anhand offizieller Quellen. Die Beta-Version"),
 ],
 "methodik.html": [
  ("Media Skills ist eine redaktionell ausgewählte und anhand offizieller Quellen geprüfte, laufend erweiterte Marktübersicht",
   "Media Skills ist eine anhand dokumentierter Aufnahmekriterien aufgebaute und mit offiziellen Quellen geprüfte, laufend erweiterte Marktübersicht"),
  ("Das Prüfdatum auf der Karte dokumentiert den letzten redaktionellen Kontrollstand.</p>",
   "Das Prüfdatum auf der Karte dokumentiert den letzten belegten Kontrollstand. Die Standardsortierung zeigt zuletzt geprüfte Angebote zuerst; der nächste Kursbeginn ist ein separates Sortierkriterium.</p>"),
  ("<p>Die Aufnahme ist eine redaktionelle Auswahl und keine Rangliste, Qualitätsgarantie oder Kaufempfehlung.",
   "<p>Die Aufnahme richtet sich nach den beschriebenen Kriterien und stellt weder eine Rangliste noch eine Qualitätsgarantie oder Kaufempfehlung dar."),
 ],
}
out.mkdir(parents=True, exist_ok=True)
for name, edits in EDITS.items():
    t = (snap / name).read_text(encoding="utf-8")
    assert hashlib.sha256(t.encode()).hexdigest().startswith(HASH[name]), f"{name}: Quelle ist nicht der Live-Snapshot"
    for old, new in edits:
        assert t.count(old) == 1, f"{name}: {t.count(old)} Treffer statt 1 für {old[:50]!r}"
        t = t.replace(old, new)
    (out / name).write_text(t, encoding="utf-8")
    print("OK", name, len(edits), "Ersetzungen,", hashlib.sha256(t.encode()).hexdigest())
