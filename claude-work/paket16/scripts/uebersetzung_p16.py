"""Paket 16 (E113): englische Arbeitsnotizen in den Anzeigefeldern start, duration, region auf Deutsch.
Liest die sichtbaren Kandidaten (paket16/out/englisch_kandidaten.tsv, aus dem Browser) und schreibt paket16/config/korrekturen.csv.
Alte Werte bleiben in der CSV und im Feld `korrekturen` des Datensatzes erhalten. Aufruf (aus claude-work/): python3 -I paket16/scripts/uebersetzung_p16.py"""
import csv, re, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
ORTE = [("Zurich", "Zürich"), ("Genève", "Genf"), ("Geneva", "Genf"), ("Bâle", "Basel"), ("Neuchâtel", "Neuenburg"),
        ("Lucerne", "Luzern"), ("Saint-Gall", "St. Gallen"), ("Fribourg", "Freiburg"), ("Vaud", "Waadt")]
def orte(s):
    for a, b in ORTE: s = re.sub(rf"\b{a}\b", b, s)
    return s
FEST = {
  "NO_FREE_PLACES; provider offers to organise additional date by phone": "NO_FREE_PLACES; Zusatztermin auf Anfrage per Telefon",
  "Aktuelle/künftige Durchführungen im Provider-Kalender; nächste offer-spezifische Durchführung in diesem Batch nicht separat normalisiert": "Termine im Kalender des Anbieters",
  "Genève; exact venue not published in category extract": "Genf; genauer Kursort: keine Angabe",
  "Genève; exact venue not published for on-request run": "Genf; genauer Kursort: keine Angabe",
  "Genève; exact building not published in visible current listing": "Genf; genauer Kursort: keine Angabe",
  "Genève / distance; exact on-request venue not published": "Genf / Fernunterricht; genauer Kursort: keine Angabe",
  "16.11.2026–25.11.2026 / inscriptions ouvertes; additional 2027 session published": "16.11.2026–25.11.2026 / Anmeldung offen; weiterer Termin 2027",
  "01.03.2027, 08.03.2027, 15.03.2027; additional 3-day Aug 2027 variant": "01.03.2027, 08.03.2027, 15.03.2027; zusätzlich 3-tägige Variante im August 2027",
  "17.11.2026 future current index occurrence": "17.11.2026",
  "Lausanne for fixed present sessions": "Lausanne (Präsenztermine)",
  "Custom / determined from client objectives": "Nach Vereinbarung",
  "Custom / determined from objectives": "Nach Vereinbarung",
  "Genève / Lausanne / client company": "Genf / Lausanne / beim Auftraggeber",
  "5 days total (2-day initiation + 3-day perfectionnement)": "5 Tage (2 Tage Einführung + 3 Tage Vertiefung)",
  "Aktuell «Enroll Now»; kein aktuelles fixes Startdatum publiziert": "Anmeldung offen; Startdatum: keine Angabe",
  "5 Sessions à 4 heures": "5 Termine à 4 Stunden",
  "2 Sessions à 3 heures": "2 Termine à 3 Stunden",
  "Ca. 450 Stunden; self-paced": "Ca. 450 Stunden; im eigenen Tempo",
  "Vier Abende je Durchführung; aktuelle Kohorten im Occurrence-Layer getrennt.": "Vier Abende je Durchführung",
  "EBU Headquarters, Geneva, Switzerland": "EBU-Hauptsitz, Genf",
  "01.12. and 09.12.2026, each 09:30–17:00": "01.12. und 09.12.2026, jeweils 09:30–17:00",
  "2026-09-23 09:30; 14 hours": "14 Stunden",
  "2 day": "2 Tage",
}
def regel(v):
    if v in FEST: return FEST[v]
    s = v
    s = re.sub(r"\b(\d+(?:[.,]\d+)?) hours?\b", lambda m: f"{m.group(1).replace('.', ',')} Stunden", s, flags=re.I)
    s = re.sub(r"\b1 day\b", "1 Tag", s); s = re.sub(r"\b(\d+) days\b", r"\1 Tage", s)
    s = s.replace(" on location", " an wechselnden Orten")
    s = orte(s)
    return s
rows, seen = [], set()
for line in open(R / "paket16/out/englisch_kandidaten.tsv", encoding="utf-8"):
    i, f, v = line.rstrip("\n").split("\t")
    if (i, f) in seen: continue
    n = regel(v)
    if n == v: continue
    seen.add((i, f)); rows.append({"id": i, "feld": f, "alt": v, "neu": n, "register_id": "E113", "quelle": "Übersetzung Claude (Anzeige auf Deutsch); Originaltext unverändert in «alt»", "bemerkung": ""})
with open(R / "paket16/config/korrekturen.csv", "w", encoding="utf-8", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
print(len(rows), "Felder,", len({r["id"] for r in rows}), "Angebote")
