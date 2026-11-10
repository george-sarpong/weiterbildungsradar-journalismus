"""Paket 9: HTML-Seiten -> Paket 9. Nur E087 (Methodik-Text zu «nicht erfasst») und E089 (Logo-Link ohne abweichenden Namen, WCAG 2.5.3).
Quellen: index.html, methodik.html aus Paket 7; datenschutz.html, impressum.html, 404.html aus dem Live-Snapshot Paket A.
Skript-Verweise bleiben unverändert (Release-Paket ist ein eigener Schritt mit Freigabe).
Aufruf: python3 -I port_html_p9.py <p7-website> <live-snapshot> <p9-website>. Jede Ersetzung muss genau einmal passen."""
import hashlib
import pathlib
import sys

BRAND = ('<a class="brand brand-link" href="https://mediaskills.ch/" aria-label="Media Skills – Startseite">',
         '<a class="brand brand-link" href="https://mediaskills.ch/">')
FILES = {
    # Datei: (Quelle, Hash-Präfix der Quelle, Ersetzungen)
    "index.html": ("p7", "af1362139fc3", [("E089 Logo-Link", *BRAND)]),
    "methodik.html": ("p7", "bcc5408cea1f", [
        ("E089 Logo-Link", *BRAND),
        ("E087 fehlende Angaben",
         "Stattdessen erscheint beispielsweise «nicht publiziert» oder «Preis auf Anfrage».",
         "Stattdessen erscheint beispielsweise «nicht erfasst», «nicht publiziert» oder «Preis auf Anfrage»."),
    ]),
    "datenschutz.html": ("live", "9b429816090d", [("E089 Logo-Link", *BRAND)]),
    "impressum.html": ("live", "398059f37d28", [("E089 Logo-Link", *BRAND)]),
    "404.html": ("live", "4ad35df294d1", [("E089 Logo-Link", *BRAND)]),
}


def main(p7, live, dst):
    src = {"p7": pathlib.Path(p7), "live": pathlib.Path(live)}
    dst = pathlib.Path(dst)
    dst.mkdir(parents=True, exist_ok=True)
    for name, (where, prefix, edits) in FILES.items():
        html = (src[where] / name).read_text(encoding="utf-8")
        assert hashlib.sha256(html.encode()).hexdigest().startswith(prefix), f"{name}: unerwartete Quelle"
        for label, old, new in edits:
            n = html.count(old)
            assert n == 1, f"{name} {label}: {n} Treffer statt 1"
            html = html.replace(old, new)
        (dst / name).write_text(html, encoding="utf-8")
        print("OK", name, len(edits), "Ersetzungen,", hashlib.sha256(html.encode()).hexdigest())


if __name__ == "__main__":
    main(*sys.argv[1:4])
