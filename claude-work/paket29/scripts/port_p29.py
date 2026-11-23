"""Paket 29 A2, A3, E248 (SPEZIFIKATION_PAKET29_20261123.md §4, §7): app-v44.js aus app-v43.js.
Jede Ersetzung muss genau einmal passen, sonst Abbruch; sonst keine Änderung (A5). Neue Datei, weil sich der Inhalt einer
Datei mit Versionsnamen nie ändert (E226).
- A2 (E242): feste Länderliste preferredOrder.country entfällt; Länderfilter Schweiz zuerst, übrige alphabetisch (de-CH),
  dann «Online», «keine Angabe» (countryValues unverändert).
- A3 (E243, E250, E251): Suchtext von Smart- und Katalogsuche aus den Funktionen der Karte, Ersetzungen aus
  paket29/config/a3_suchtext.json (dieselben wie in der Messung U2).
- E248: Ladeprüfung gegen window.MEDIA_SKILLS_KATALOG (soll, daten, suche; geschrieben von build_release_p29.py);
  fehlt ein Teil: Hinweis oben auf der Seite, geladene Märkte bleiben nutzbar, gemerkte IDs, die nicht geladen sind, bleiben
  im lokalen Speicher. Ohne Fehler Verhalten wie app-v43.js (E231).
Aufruf (aus claude-work/): python3 -I paket29/scripts/port_p29.py  → paket29/website/app-v44.js"""
import hashlib, json, pathlib, sys

R = pathlib.Path(__file__).resolve().parents[2]
QUELLE, QUELLE_SHA = R / "paket22/website/app-v43.js", "ada38d5ed342572b2b3e0daa476d9e6b4186426841047fb9a1655a6663789020"
ZIEL = R / "paket29/website/app-v44.js"

E248_KOPF_ALT = '  const FAVORITES_KEY = "weiterbildungsradar:favorites:v1";\n'
E248_KOPF_NEU = E248_KOPF_ALT + """
  // P29 E248: Daten- und Smart-Dateien je Markt; jede Datendatei nennt die erwarteten Märkte mit Anzahl (soll), jede Daten-
  // und Smart-Datei meldet ihren Markt mit Anzahl als geladen. Fehlt etwas, zeigt die Seite einen Hinweis und die Merkliste
  // behält gemerkte IDs, die nicht geladen sind.
  const KATALOG = window.MEDIA_SKILLS_KATALOG && typeof window.MEDIA_SKILLS_KATALOG === "object" ? window.MEDIA_SKILLS_KATALOG : {};
  const catalogIncomplete = !KATALOG.soll || typeof KATALOG.soll !== "object" || ["daten", "suche"].some(teil =>
    Object.entries(KATALOG.soll).some(([markt, anzahl]) => !KATALOG[teil] || KATALOG[teil][markt] !== anzahl));
  const LOAD_WARNING = "Ein Teil des Katalogs konnte nicht geladen werden. Bitte Seite neu laden.";
"""
ERSETZUNGEN = [
    ("A2 feste Länderliste", '    country: ["Schweiz", "Österreich", "Liechtenstein", "Deutschland"],\n', ""),
    ("A2 Länderfilter", "  addOptions(el.country, countryValues(preferredOrder.country));\n",
     "  // P29 A2 (E242): Schweiz zuerst, übrige Länder alphabetisch, dann «Online», «keine Angabe»; keine feste Länderliste.\n"
     "  addOptions(el.country, countryValues([countryName(\"CH\")]));\n"),
    ("E248 Ladeprüfung", E248_KOPF_ALT, E248_KOPF_NEU),
    ("E248 Merkliste Variable", "  let favorites = loadFavorites();\n",
     "  let preservedFavorites = [];   // E248: gemerkte IDs, die bei unvollständigem Katalog nicht geladen sind\n"
     "  let favorites = loadFavorites();\n"),
    ("E248 Merkliste laden",
     "      return new Set(Array.isArray(stored) ? stored.filter(id => allKnownIds.has(id)) : []);\n",
     "      if (catalogIncomplete && Array.isArray(stored)) preservedFavorites = stored.filter(id => !allKnownIds.has(id));\n"
     "      return new Set(Array.isArray(stored) ? stored.filter(id => allKnownIds.has(id)) : []);\n"),
    ("E248 Merkliste speichern", "      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));\n",
     "      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites, ...preservedFavorites]));\n"),
    ("E248 Hinweis", "  applyUrlState();\n  render();\n})();",
     "  if (catalogIncomplete) {\n"
     "    const main = document.querySelector(\"main\");\n"
     "    if (main) main.insertAdjacentHTML(\"afterbegin\",\n"
     "      `<div class=\"shell\"><div class=\"warning-box\" role=\"alert\" data-load-warning><p>${escapeHtml(LOAD_WARNING)}</p></div></div>`);\n"
     "  }\n\n"
     "  applyUrlState();\n  render();\n})();"),
]


def main():
    t = QUELLE.read_text(encoding="utf-8")
    if hashlib.sha256(t.encode()).hexdigest() != QUELLE_SHA: sys.exit("ABBRUCH: app-v43.js nicht ada38d5e…")
    cfg = json.loads((R / "paket29/config/a3_suchtext.json").read_text(encoding="utf-8"))
    alle = ERSETZUNGEN[:2] + [("A3 " + e["name"], e["alt"], e["neu"]) for e in cfg["ersetzungen"]] + ERSETZUNGEN[2:]
    for name, alt, neu in alle:
        n = t.count(alt)
        if n != 1: sys.exit(f"ABBRUCH: {name}: Stelle {n}× statt 1×")
        t = t.replace(alt, neu)
    if "preferredOrder.country" in t: sys.exit("ABBRUCH: preferredOrder.country noch verwendet")
    ZIEL.parent.mkdir(parents=True, exist_ok=True)
    ZIEL.write_text(t, encoding="utf-8")
    print(f"OK {ZIEL.name}: {len(alle)} Ersetzungen, {len(t.encode())} Byte, SHA-256 {hashlib.sha256(t.encode()).hexdigest()[:12]}…")


if __name__ == "__main__":
    main()
