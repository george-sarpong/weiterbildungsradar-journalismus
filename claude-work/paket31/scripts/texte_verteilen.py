"""P31: verschlüsseltes Abruf-Ergebnis aus dem Laufprotokoll entschlüsseln und Kurstexte je Lesepaket ablegen (nur lokal, .gitignore).
Aufruf (aus claude-work/): python3 -I paket31/scripts/texte_verteilen.py <Lauf-ID> <privater Schlüssel>"""
import json, pathlib, re, subprocess, sys, tempfile
sys.dont_write_bytecode = True
R = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(R / "paket30/scripts"))
import uebergabe as U  # noqa: E402

lauf, priv = sys.argv[1], sys.argv[2]
log = subprocess.run(["gh", "run", "view", lauf, "-R", "george-sarpong/weiterbildungsradar-journalismus", "--log"], capture_output=True, text=True, check=True).stdout
k = re.search(r"P30KEY ([A-Za-z0-9+/=]+)\s*$", log, re.M).group(1)
tmp = pathlib.Path(tempfile.mkdtemp())
(tmp / "k.enc").write_bytes(__import__("base64").b64decode(k)); (tmp / "a.enc").write_bytes(U.lies_text(log))
subprocess.run(["openssl", "pkeyutl", "-decrypt", "-inkey", priv, "-pkeyopt", "rsa_padding_mode:oaep", "-in", tmp / "k.enc", "-out", tmp / "k.bin"], check=True)
subprocess.run(["openssl", "enc", "-d", "-aes-256-cbc", "-pbkdf2", "-pass", f"file:{tmp / 'k.bin'}", "-in", tmp / "a.enc", "-out", tmp / "a.jsonl"], check=True)
zeilen = [json.loads(l) for l in (tmp / "a.jsonl").read_text(encoding="utf-8").splitlines() if l.strip()]
nach_url = {e["url"]: e for e in zeilen if "url" in e}
ziel = R / "paket31/lesen/texte"; ziel.mkdir(parents=True, exist_ok=True)
ohne_vt = {k_: v for k_, v in nach_url.items()}
n = 0
for p in sorted((R / "paket31/lesen").glob("paket_*.jsonl")):
    with open(ziel / p.name.replace("paket_", "texte_"), "w", encoding="utf-8") as f:
        for l in p.read_text(encoding="utf-8").splitlines():
            s = json.loads(l); e = nach_url.get(s["url"], {})
            f.write(json.dumps({"url": s["url"], "http": e.get("status"), "ziel": e.get("ziel"), "fehler": e.get("fehler"), "volltext": e.get("volltext")}, ensure_ascii=False) + "\n")
            n += 1
# Abrufdaten ohne Kurstext für das Repo
for e in zeilen: e.pop("volltext", None)
(R / "paket31/out/abruf").mkdir(parents=True, exist_ok=True)
import gzip
with gzip.open(R / f"paket31/out/abruf/abruf_2026-11-23_luecken_{lauf}.jsonl.gz", "wt", encoding="utf-8") as g:
    for e in zeilen: g.write(json.dumps(e, ensure_ascii=False, sort_keys=True) + "\n")
print(f"OK {n} Seiten verteilt nach {ziel}; mit Text siehe Pakete")
