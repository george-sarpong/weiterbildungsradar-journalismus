#!/usr/bin/env python3
"""R1/R2 (Vorlage Testkriterien §2.6, Projektregel 7): Release- bzw. Rollback-Paket prüfen.

Aufruf: python3 -I pruefe_paket.py <paketordner> [--ausser README.md ...]
Prüft:
  1. SHA256SUMS.txt vorhanden; jede gelistete Datei existiert und hat den gelisteten SHA-256.
  2. Keine Datei im Ordner fehlt in SHA256SUMS.txt (ausser --ausser).
  3. Jede lokale Referenz in HTML-Dateien (script src, link href, img src, a href auf .html/.css/.js) liegt im Paket.
Ausgabe: eine Zeile je Befund, am Schluss «R1 PASS» oder «R1 FAIL (n)». Exit-Code 0/1.
Keine Netzwerkzugriffe, keine Änderungen am Ordner.
"""
import hashlib
import re
import sys
from pathlib import Path

REF = re.compile(r'<(?:script|link|img|a)\b[^>]*?\b(?:src|href)="([^"#?]+)', re.I)


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    root = Path(argv[0]).resolve()
    ausser = set(argv[argv.index("--ausser") + 1:]) if "--ausser" in argv else set()
    fehler = []
    sums = root / "SHA256SUMS.txt"
    if not sums.is_file():
        print("FEHLT SHA256SUMS.txt")
        print("R1 FAIL (1)")
        return 1
    gelistet = {}
    for zeile in sums.read_text(encoding="utf-8").splitlines():
        if not zeile.strip():
            continue
        h, name = zeile.split(maxsplit=1)
        gelistet[name.lstrip("*").strip()] = h.lower()
    for name, h in sorted(gelistet.items()):
        p = root / name
        if not p.is_file():
            fehler.append(f"FEHLT {name}")
        elif hashlib.sha256(p.read_bytes()).hexdigest() != h:
            fehler.append(f"HASH {name}")
    vorhanden = {str(p.relative_to(root)) for p in root.rglob("*") if p.is_file()}
    for name in sorted(vorhanden - set(gelistet) - {"SHA256SUMS.txt"} - ausser):
        fehler.append(f"NICHT GELISTET {name}")
    for html in sorted(p for p in root.rglob("*.html")):
        for ref in REF.findall(html.read_text(encoding="utf-8")):
            if re.match(r"^(?:[a-z]+:|//|mailto:)", ref, re.I):
                continue
            if not ref.lower().endswith((".js", ".css", ".html", ".png", ".svg", ".jpg", ".webp", ".ico", ".xml", ".txt")) and ref != "/":
                continue
            ziel = (html.parent / ref.lstrip("/")) if not ref.startswith("/") else (root / ref.lstrip("/"))
            if ref == "/":
                ziel = root / "index.html"
            if not ziel.resolve().is_file() or root not in ziel.resolve().parents:
                fehler.append(f"VERWEIS {html.name} -> {ref}")
    for f in fehler:
        print(f)
    print("R1 PASS" if not fehler else f"R1 FAIL ({len(fehler)})")
    return 0 if not fehler else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
