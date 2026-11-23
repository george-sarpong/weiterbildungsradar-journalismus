"""Paket 30: Übergabe des Abruf-Ergebnisses vom Runner in die Arbeitsumgebung über das Laufprotokoll.
Grund: Artefakte von GitHub Actions liegen auf einem Speicher, den die Arbeitsumgebung nicht erreicht (Proxy-Sperre,
Befund U3 23.11.2026); das Laufprotokoll ist lesbar. Inhalt = Ergebnisdatei (Status, Hash, Fundstellen ≤ 200 Zeichen), kein Seitentext.

drucke <Datei>                    gzip + base64 in Zeilen «P30DATA …» zwischen «P30DATA-BEGIN <sha256> <bytes> <zeilen>» und «P30DATA-END»
hole <Lauf-ID> <Ziel> [--repo …]  liest das Protokoll mit gh, prüft SHA-256 und Länge, schreibt die Datei (bricht sonst ab)
lies <Protokolldatei> <Ziel>      wie hole, aus einer gespeicherten Protokolldatei (Tests)"""
import base64, gzip, hashlib, pathlib, re, subprocess, sys

sys.dont_write_bytecode = True
BREITE = 3000


def drucke(p, aus=sys.stdout):
    roh = pathlib.Path(p).read_bytes()
    z = base64.b64encode(gzip.compress(roh, compresslevel=9, mtime=0)).decode("ascii")
    teile = [z[i:i + BREITE] for i in range(0, len(z), BREITE)]
    print(f"P30DATA-BEGIN {hashlib.sha256(roh).hexdigest()} {len(roh)} {len(teile)}", file=aus)
    for t in teile: print(f"P30DATA {t}", file=aus)
    print("P30DATA-END", file=aus)


def lies_text(log):
    kopf, teile, drin = None, [], False
    for zeile in log.splitlines():
        m = re.search(r"P30DATA-BEGIN ([0-9a-f]{64}) (\d+) (\d+)\s*$", zeile)
        if m: kopf, teile, drin = m, [], True; continue
        if drin and re.search(r"P30DATA-END\s*$", zeile): drin = False; break
        m2 = re.search(r"P30DATA ([A-Za-z0-9+/=]+)\s*$", zeile)
        if drin and m2: teile.append(m2.group(1))
    if kopf is None or drin: raise ValueError("Datenblock fehlt oder unvollständig")
    if len(teile) != int(kopf.group(3)): raise ValueError(f"{len(teile)} statt {kopf.group(3)} Zeilen")
    roh = gzip.decompress(base64.b64decode("".join(teile)))
    if len(roh) != int(kopf.group(2)) or hashlib.sha256(roh).hexdigest() != kopf.group(1): raise ValueError("Prüfsumme oder Länge falsch")
    return roh


def schreibe(roh, ziel):
    p = pathlib.Path(ziel); p.parent.mkdir(parents=True, exist_ok=True); p.write_bytes(roh)
    print(f"OK {len(roh)} Byte, SHA-256 {hashlib.sha256(roh).hexdigest()[:12]}… → {p}")


def main():
    a = sys.argv[1:]
    if len(a) >= 2 and a[0] == "drucke": drucke(a[1]); return
    try:
        if len(a) >= 3 and a[0] == "hole":
            repo = a[a.index("--repo") + 1] if "--repo" in a else "george-sarpong/weiterbildungsradar-journalismus"
            log = subprocess.run(["gh", "run", "view", a[1], "-R", repo, "--log"], capture_output=True, text=True, check=True).stdout
            schreibe(lies_text(log), a[2]); return
        if len(a) >= 3 and a[0] == "lies": schreibe(lies_text(pathlib.Path(a[1]).read_text(encoding="utf-8")), a[2]); return
    except (ValueError, subprocess.CalledProcessError) as e:
        sys.exit(f"ABBRUCH: {e}")
    sys.exit(__doc__)


if __name__ == "__main__":
    main()
