"""Paket 27 A11 (SPEZIFIKATION_PAKET27_20261122.md, E217): Stand Paket 26 für die historischen Tests der Pakete 24–26.
Baut Master und Protokoll mit scripts/master_nachtraege.py --bis 25 (ohne Modellschritt 026 und ohne Läufe ab 027) in einen
Ordner ausserhalb des Repos und prüft die festgehaltenen SHA-256 von Paket 26 (Master cf9fdb2d…, Protokoll c82cef3d…).
So prüfen die alten Tests weiter genau den Stand, für den ihre Sollwerte gelten; den Unterschied zum aktuellen Master
(5 Spalten, 22 Trennzeichen, 3'842 Protokollzeilen) prüft paket27/tests/test_paket27.py (P01, P02).
Gebrauch: import stand_p26; OUT = stand_p26.ordner()  → pathlib.Path mit master_3818.csv, master_3818_aktuell.csv,
master_nachtraege_protokoll.csv (Stand P26). Der Ordner wird bei Programmende gelöscht."""
import atexit, hashlib, pathlib, shutil, subprocess, sys, tempfile

R = pathlib.Path(__file__).resolve().parents[1]
MASTER_P26 = "cf9fdb2d69d6e2a908c08889655b7cf923cdcb8a618c2341b84f5c98b8adad92"
PROTO_P26 = "c82cef3df6c81045006bc1911973e01cfb88805a592d65098150a4ec3dd274b8"
_ordner = None


def ordner():
    global _ordner
    if _ordner: return _ordner
    td = pathlib.Path(tempfile.mkdtemp(prefix="stand-p26-")); atexit.register(shutil.rmtree, td, True)
    shutil.copy2(R / "paket3/out/master_3818.csv", td / "master_3818.csv")
    pr = subprocess.run([sys.executable, "-I", str(R / "scripts/master_nachtraege.py"), "--out", str(td), "--bis", "25"], cwd=R, capture_output=True, text=True)
    sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
    if pr.returncode or sha(td / "master_3818_aktuell.csv") != MASTER_P26 or sha(td / "master_nachtraege_protokoll.csv") != PROTO_P26:
        sys.exit("ABBRUCH stand_p26: Stand Paket 26 nicht reproduziert\n" + pr.stdout + pr.stderr)
    _ordner = td
    return td
