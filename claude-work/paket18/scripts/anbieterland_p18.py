"""Paket 18 (E118): Anbieterland = Land, in dem der Anbieter seinen Sitz hat (Owner, Beispiel MAZ = Schweiz).
Beleg je Anbieter: Domain-Endung der Angebotsseiten (.ch/.swiss → CH, .at/.wien → AT, .li → LI), sofern der Anbieter
nicht als ausländische Gesellschaft mit Schweizer Website bekannt ist (Impressum geprüft) – diese bleiben offen bis Owner-Entscheid.
Schreibt paket18/config/korrekturen.csv (Feld laender.anbieterLand). Aufruf (aus claude-work/): python3 -I paket18/scripts/anbieterland_p18.py"""
import csv, json, pathlib, collections
from urllib.parse import urlparse
R = pathlib.Path(__file__).resolve().parents[2]
pre = "window.WEITERBILDUNGSRADAR_OFFERS = "
data = json.loads((R / "paket17/website/data-p17.js").read_text(encoding="utf-8")[len(pre):].rstrip().rstrip(";"))
TLD = {"ch": "CH", "swiss": "CH", "at": "AT", "wien": "AT", "li": "LI"}
# Impressum 10.11.2026: ausländische Gesellschaft hinter Schweizer Website → Owner-Entscheid offen
OFFEN = {"NobleProg Schweiz": "NobleProg Limited, Adresse im Footer nicht genannt",
         "PC-COLLEGE Training GmbH (DE legal provider; CH delivery surface)": "deutsche GmbH laut Datensatz",
         "PC-COLLEGE Training GmbH": "deutsche GmbH laut Datensatz",
         "Dawan": "DAWAN SARL, Nantes (Frankreich), Mentions légales dawan.ch",
         "Laudius GmbH / Akademie für Fernstudien": "Postfach Zürich, Handelsregister Kleve (Deutschland), Impressum laudius.ch",
         "ORSYS Training Schweiz": "Gruppe ORSYS (Frankreich), Zentrum ORSYS Suisse in Genf, orsys.fr",
         "Ateliers de l’image et du son / Jérémie Gandin": "Rohwert country «Frankreich» trotz .ch-Domain; schon in der Nachrecherche (E043)"}
hosts = collections.defaultdict(set)
for o in data:
    try: hosts[o["provider"]].add(urlparse(o.get("url") or "").hostname.removeprefix("www.").rsplit(".", 1)[-1])
    except Exception: hosts[o["provider"]].add("?")
rows, offen, ohne = [], {}, {}
for o in data:
    p = o["provider"]; lae = o.get("laender") or {}; alt = lae.get("anbieterLand", "")
    if alt not in ("", "nicht erfasst"): continue
    t = hosts[p]
    if p in OFFEN: offen[p] = OFFEN[p]; continue
    if len(t) == 1 and next(iter(t)) in TLD:
        land = TLD[next(iter(t))]
        rows.append({"id": o["id"], "feld": "laender.anbieterLand", "alt": alt, "neu": land, "register_id": "E118",
                     "quelle": f"Sitzland des Anbieters nach Domain-Endung der Angebotsseite (.{next(iter(t))}); Owner-Regel «Land, in dem der Anbieter ist»", "bemerkung": p})
    else: ohne[p] = "/".join(sorted(t))
with open(R / "paket18/config/korrekturen.csv", "w", encoding="utf-8", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
json.dump({"offen_auslaendische_gesellschaft": offen, "ohne_landes_domain": ohne}, open(R / "paket18/out/anbieterland_offen.json", "w"), ensure_ascii=False, indent=1)
print(len(rows), "Angebote,", len({r["bemerkung"] for r in rows}), "Anbieter;", len(offen), "offen (ausländ. Gesellschaft);", len(ohne), "ohne Landes-Domain")
print(collections.Counter(r["neu"] for r in rows))
