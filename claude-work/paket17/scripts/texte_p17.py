"""Paket 17 (E114): Anzeigetexte in Start, Dauer, Ort und Terminen (sessions) bereinigen:
G1 interne Prüfsprache weg, G2 französische/italienische Kurzformen auf Deutsch, G3 Ortsnamen deutsch, G7 Start ohne Datum.
Basis paket16/website/data-p16.js. Schreibt paket17/config/korrekturen.csv (id, feld, alt, neu). Aufruf (aus claude-work/): python3 -I paket17/scripts/texte_p17.py"""
import csv, json, re, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
pre = "window.WEITERBILDUNGSRADAR_OFFERS = "
raw = (R / "paket16/website/data-p16.js").read_text(encoding="utf-8")
data = json.loads(raw[len(pre):].rstrip().rstrip(";"))

FEST = {  # ganze Werte (interne Prüfsprache, Sonderfälle)
 "Keine aktuelle/künftige Durchführung in der geprüften Evidenz": "Nächster Termin: keine Angabe",
 "2026-Durchführung(en) abgeschlossen; Stable Identity durch wiederkehrende 2025/2026 Provider-Kurspläne belegt": "Kurs 2026 abgeschlossen; findet jährlich statt, nächster Termin: keine Angabe",
 "Aktueller Kurs über SAE-Buchungsoberfläche; exaktes Startdatum nicht indexiert": "Buchbar über die SAE-Website; Startdatum: keine Angabe",
 "Jahrgang 2027–2029 / HF-Übergang; exaktes Startdatum im geprüften aktuellen Katalog nicht belastbar publiziert": "Jahrgang 2027–2029; Startdatum: keine Angabe",
 "Aktuelle Kursseite buchbar; nächste Durchführung im geprüften Crawl nicht belastbar datiert": "Buchbar; nächster Termin: keine Angabe",
 "Termine publiziert; aktuelle Terminangaben auf der Angebotsseite widersprüchlich.": "Termine: siehe Angebotsseite",
 "Termine publiziert; keine kanonische Durchführung wegen widersprüchlicher Terminangaben": "Termine: siehe Angebotsseite",
 "Mehrmals jährlich; aktuelle Anbieterunterlagen nennen wiederkehrende Durchführungsmonate, aber keine hier belastbar jahresscharf zugeordnete nächste Durchführung": "Mehrmals jährlich; nächster Termin: keine Angabe",
 "Mitte August bis Mitte Juli; nächste jahresscharfe Durchführung nicht separat publiziert": "Mitte August bis Mitte Juli; nächster Termin: keine Angabe",
 "Bachelorprogramm aktiv; Aufnahmeverfahren 2026 abgeschlossen": "Aufnahme 2026 abgeschlossen; nächste Aufnahme: keine Angabe",
 "Periode und Anmeldefrist: auf Anfrage (Se renseigner)": "Termin und Anmeldefrist auf Anfrage",
 "2 Jahre; aktueller DAJ-Detailstand: 90 MAZ-Kurstage + 280 Praxistage; HF-Nachfolger mit 140 Kurstagen angekündigt": "2 Jahre; 90 Kurstage am MAZ + 280 Praxistage",
 "Dauer je konkreter Stage; auf der standing Familienseite nicht generalisiert publiziert": "Dauer je nach Stage",
 "Montagabendkurs; aktueller Kategorienstand 12.10.–07.12.2026": "Montagabendkurs, 12.10.–07.12.2026",
 "Kursdauer nicht eindeutig indexiert": "keine Angabe",
 "2 Kurstage (offizielle aktuelle Kurskarte 2028 und kursgenaue Detailseite: 2 Tage).": "2 Kurstage",
 "Geprüfte Ausgaben: 60 Minuten (17–18 Uhr)": "60 Minuten (17–18 Uhr)",
 "Letzte belegte Ausgabe: 1 Online-Halbtag + 1 Präsenztag": "1 Online-Halbtag + 1 Präsenztag",
 "Letzte belegte Ausgabe: 1 Online-Session + 1 Präsenztag": "1 Online-Termin + 1 Präsenztag",
 "Letzte belegte Ausgabe: 3 Tage": "3 Tage",
 "3 Semester / 1,5 Jahre; Start 04.03.2027; Do abends + Sa; aktuelle Seite listet technisches Event-Ende 15.09.2028": "3 Semester / 1,5 Jahre; Start 04.03.2027; Do abends + Sa",
 "INTER und INTRA: 2 Tage / 14 Stunden; SUR MESURE: individuelle Dauer, nicht ausgewiesen.": "2 Tage / 14 Stunden; massgeschneidert nach Vereinbarung",
 "Katalog: 90h / ca. 3 Monate; Detailseite: 3 Monate": "90 Stunden / ca. 3 Monate",
 "DE-Detail: 13 Monate; FR/Katalog: 300h / ca. 16 Monate": "13–16 Monate / ca. 300 Stunden",
 "Online / CH-facing Laudius-Oberfläche": "Online",
 "Durchführungsort dieser Ausgabe nicht editionsscharf bestätigt": "Kursort: keine Angabe",
 "NICHT_VERIFIZIERT_CURRENT_RECHECK": "keine Angabe",
 "Distance / Präsenzort nicht publiziert": "Fernunterricht / Präsenzort: keine Angabe",
 "ONLINE / Distance": "Online",
 "Salle LR22 – VD / PC, Lausanne (editionsbelegt)": "Salle LR22, Lausanne",
 "Université de Genève, Uni Mail, 40 Bd du Pont-d’Arve, Genève": "Universität Genf, Uni Mail, Bd du Pont-d’Arve 40",
 "2 jours, les 25 septembre et 2 octobre, de 9h à 17h": "2 Tage (25. September und 2. Oktober), 9–17 Uhr",
 "4 lezioni da mezza giornata": "4 Halbtage",
 "16 h / 4 lezioni da mezza giornata": "16 Std. / 4 Halbtage",
 "2 heures en ligne": "2 Stunden online",
 "Genève current occurrence": "Genf",
 "10 Sessions à 4 heures": "10 Termine à 4 Stunden",
}
# G7: Start ohne Datum (Dauer, nur Uhrzeit, Formatwort) → «Termin: keine Angabe» (+ Uhrzeit, falls vorhanden)
def g7(v):
    if re.fullmatch(r"\d+ Tage?|1 Tag|1-day seminar|Workshop|Seminar|12 LE", v): return "Termin: keine Angabe"
    if re.fullmatch(r"\d{2}:\d{2}–\d{2}:\d{2}", v): return f"Datum: keine Angabe; {v} Uhr"
    if re.fullmatch(r"\d{2}:\d{2}–\d{2}:\d{2} both days", v): return f"Datum: keine Angabe; {v[:11]} Uhr"
    return None
ORTE = [("Genève", "Genf"), ("Geneve", "Genf"), ("Bâle", "Basel"), ("Neuchâtel", "Neuenburg"), ("Zurich", "Zürich"), ("Lucerne", "Luzern"), ("Saint-Gall", "St. Gallen")]
def regeln(v, feld):
    s = v
    # G1 interne Zusätze in Terminen
    s = re.sub(r"\s*\(offizielle Kurs-/Formatvariante\)", "", s)
    s = re.sub(r"\s*\(erfasster Termin; beim Anbieter prüfen\)", "", s)
    s = re.sub(r";\s*weitere Termine 2027 laut bisherigem Datenstand", "; weitere Termine 2027", s)
    s = re.sub(r"\s*\(Live-Online-Option laut ORSYS Suisse; Platz nicht bestätigt\)", " (Live-Online)", s)
    s = re.sub(r"\s*\(Live-Online, Classe à distance; Verfügbarkeit nicht geprüft\)", " (Live-Online)", s)
    s = re.sub(r"\s*\(classe à distance / ONLINE LIVE\)", " (Live-Online)", s)
    s = re.sub(r"\s*\((?:CFJM-Katalog; Plätze nicht bestätigt|Katalogtermin; Verfügbarkeit prüfen|aktueller CFJM-Weiterbildungskatalog; Buchbarkeit nicht gesondert bestätigt)\)", "", s)
    s = re.sub(r"\s*\(Kursdetail\)", "", s)
    s = re.sub(r"\s*·\s*(?:[A-Z]{3}\d{6}|S-\d{5})\s*·", " ·", s)
    s = s.replace(" · Präsenz (Katalog)", " · Präsenz")
    s = re.sub(r";\s*(?:Verfügbarkeit|Plätze) prüfen", "", s)
    s = re.sub(r";\s*Varianten nach Produktcode", "", s)
    s = re.sub(r";\s*konkreter Präsenzort nicht bestätigt", "; genauer Kursort: keine Angabe", s)
    s = re.sub(r";\s*NobleProg publiziert Online- und Vor-Ort-Varianten", "", s)
    s = re.sub(r"\s*\((?:offizielle Kursdetailseite|kein abweichender Kursraum bestätigt)\)\.?", "", s)
    s = re.sub(r";\s*genaue Präsenzadresse prüfen", "", s).replace("Basel (angeboten)", "Basel")
    s = s.replace("Live-Online; kein Präsenzort für INTER-Ausgabe", "Live-Online")
    s = re.sub(r"\(mögliche (?:ORSYS-)?Präsenzstandorte; genau(?:e Ausgabe und|er) Ort bei Anmeldung\)", "(Ort bei Anmeldung)", s)
    s = s.replace(" / Durchführungsort im Kursplan nicht separat ausgewiesen", "; genauer Kursort: keine Angabe")
    s = re.sub(r"\bCH-(Basel|Bern|Zürich)\b", r"\1", s)
    s = re.sub(r"\s*laut bisherigem Datenstand", "", s)
    s = re.sub(r"\s*\((?:Buchbarkeit nicht neu geprüft|Plätze/Format/Ort nicht gesondert bestätigt|beide als separate Durchführungen, nicht Verfügbarkeit)\)", "", s)
    s = re.sub(r"weitere Katalog(?:ausgabe|edition)", "weiterer Termin", s)
    s = re.sub(r";\s*additional future session published", "; weiterer Termin publiziert", s)
    s = re.sub(r";\s*additional (\d{4}) session published", r"; weiterer Termin \1", s)
    # G2 französische/italienische Kurzformen
    s = re.sub(r"\b(\d+)j - (\d+)h00\b", lambda m: f"{m.group(1)} {'Tag' if m.group(1) == '1' else 'Tage'} ({m.group(2)} Std.)", s)
    s = re.sub(r"\b0\.5 jour\b", "0,5 Tage", s)
    s = re.sub(r"\b1 jour\b", "1 Tag", s); s = re.sub(r"\b(\d+) jours\b", r"\1 Tage", s)
    s = re.sub(r"\b1 heure\b", "1 Stunde", s); s = re.sub(r"\b(\d+) heures\b", r"\1 Stunden", s)
    s = re.sub(r"\b(\d+) h / ", r"\1 Std. / ", s)
    s = re.sub(r"\b(\d+) demi-journées\b", r"\1 Halbtage", s)
    s = re.sub(r"\b1 lezioni\b", "1 Lektion", s); s = re.sub(r"\b(\d+) lezioni\b", r"\1 Lektionen", s)
    s = s.replace(", de 9h à 17h", ", 9–17 Uhr")
    s = s.replace(" en présence + une phase de formation à distance", " Präsenz + Fernunterricht").replace(" en présence", " Präsenz")
    s = re.sub(r"\s*/\s*inscriptions ouvertes", " / Anmeldung offen", s)
    s = s.replace("SUR_DEMANDE / Anmeldung offen", "SUR_DEMANDE / Anmeldung offen")
    s = re.sub(r"\bclasse virtuelle\b", "virtuell", s); s = re.sub(r"\+ virtuel\b", "+ virtuell", s)
    s = re.sub(r"Online – Classe à distance", "Live-Online", s)
    s = re.sub(r"Live-Online \([^)]*kein physischer Kursort[^)]*\)", "Live-Online", s)
    s = re.sub(r"\s*/\s*Distance\b", " / Fernunterricht", s)
    # G3 Ortsnamen
    for a, b in ORTE: s = re.sub(rf"\b{a}\b", b, s)
    return s
rows = []
def pruefe(oid, feld, v):
    if not isinstance(v, str) or not v: return
    n = FEST.get(v) or (g7(v) if feld == "start" else None) or regeln(v, feld)
    if n != v: rows.append({"id": oid, "feld": feld, "alt": v, "neu": n, "register_id": "E114", "quelle": "Anzeigetext bereinigt (Claude, Owner-Freigabe 10.11.); Originaltext in «alt»", "bemerkung": ""})
for o in data:
    for f in ("start", "duration", "region"): pruefe(o["id"], f, o.get(f))
    for i, s in enumerate(o.get("sessions") or []):
        pruefe(o["id"], f"sessions[{i}].label", s.get("label")); pruefe(o["id"], f"sessions[{i}].region", s.get("region"))
with open(R / "paket17/config/korrekturen.csv", "w", encoding="utf-8", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
print(len(rows), "Felder,", len({r["id"] for r in rows}), "Angebote")
