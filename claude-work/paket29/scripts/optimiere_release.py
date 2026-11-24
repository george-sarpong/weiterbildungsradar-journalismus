"""Monatsbuild 24.11.2026 (Owner-Auftrag E296): Release aus build_release_p29.py bereinigen, ohne Inhalte zu ändern.
1. Die vier Unterseiten (404, datenschutz, impressum, methodik) laden styles-v24.css statt styles-v22.css.
   styles-v24.css = styles-v22.css + Block MS-48 (Regeln nur für Startseiten-Elemente: Karten, Ergebnisleiste, hero);
   die Unterseiten enthalten keines dieser Elemente (geprüft in test_optimierung.js: Bildschirmvergleich).
2. styles-v22.css entfällt (keine Datei verweist mehr darauf).
3. SHA256SUMS.txt liegt neben website/ statt darin (lädt keine Seite; dient nur der Prüfung nach dem Upload).
Schreibt OPTIMIERUNG.json (Dateien vorher/nachher mit SHA-256). Bricht ab, ohne etwas zu ändern, wenn eine Annahme nicht stimmt.
Aufruf (aus claude-work/): python3 -I paket29/scripts/optimiere_release.py <release-ordner aus build_release_p29.py>"""
import difflib, hashlib, json, pathlib, sys

sys.dont_write_bytecode = True
SEITEN = ("404.html", "datenschutz.html", "impressum.html", "methodik.html")
ALT, NEU = '<link rel="stylesheet" href="styles-v22.css">', '<link rel="stylesheet" href="styles-v24.css">'


def sha(b): return hashlib.sha256(b).hexdigest()


def main():
    rel = pathlib.Path(sys.argv[1]).resolve(); web = rel / "website"
    if not (web / "index.html").exists() or not (rel / "BAUPROTOKOLL.json").exists(): sys.exit("ABBRUCH: kein Release-Ordner")
    vorher = {p.name: sha(p.read_bytes()) for p in sorted(web.iterdir()) if p.is_file()}
    v22, v24 = (web / "styles-v22.css").read_bytes(), (web / "styles-v24.css").read_bytes()
    ops = difflib.SequenceMatcher(None, v22.decode().splitlines(), v24.decode().splitlines(), autojunk=False).get_opcodes()
    zusatz = [o for o in ops if o[0] != "equal"]
    if any(o[0] != "insert" for o in zusatz) or "MS-48" not in "\n".join(v24.decode().splitlines()[zusatz[0][3]:zusatz[0][4]] if zusatz else []):
        sys.exit("ABBRUCH: styles-v24.css ist nicht styles-v22.css plus der Block MS-48")
    neu_text = {}
    for s in SEITEN:
        t = (web / s).read_text(encoding="utf-8")
        if t.count(ALT) != 1 or "styles-v24.css" in t: sys.exit(f"ABBRUCH: {s} verweist nicht genau einmal auf styles-v22.css")
        neu_text[s] = t.replace(ALT, NEU)
    if "styles-v22.css" in (web / "index.html").read_text(encoding="utf-8"): sys.exit("ABBRUCH: index.html verweist auf styles-v22.css")
    for s, t in neu_text.items(): (web / s).write_text(t, encoding="utf-8")
    (web / "styles-v22.css").unlink()
    rest = [p.name for p in web.iterdir() if p.is_file() and p.suffix in (".html", ".js", ".css")
            and "styles-v22.css" in p.read_text(encoding="utf-8")]
    if rest: sys.exit(f"ABBRUCH nach Änderung: Verweis auf styles-v22.css in {rest}")
    (web / "SHA256SUMS.txt").unlink()
    nachher = {p.name: sha(p.read_bytes()) for p in sorted(web.iterdir()) if p.is_file()}
    (rel / "SHA256SUMS.txt").write_text("".join(f"{v}  website/{k}\n" for k, v in nachher.items()), encoding="utf-8")
    (rel / "OPTIMIERUNG.json").write_text(json.dumps({"auftrag": "E296", "vorher": vorher, "nachher": nachher,
        "entfernt": sorted(set(vorher) - set(nachher)), "geaendert": sorted(k for k in nachher if vorher.get(k) != nachher[k])},
        ensure_ascii=False, indent=1), encoding="utf-8")
    groesse = sum((web / k).stat().st_size for k in nachher)
    print(f"OK optimiert: {len(vorher)} → {len(nachher)} Dateien in website/, {groesse} Byte; geändert {sorted(k for k in nachher if vorher.get(k) != nachher[k])}")


if __name__ == "__main__":
    main()
