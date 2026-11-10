#!/usr/bin/env python3
"""Paket 11: aus dem Übergabe-ZIP V4.1 (SFJ_CLAUDE_CODE_UEBERGABE_V4_1_DRIFTKORRIGIERT_20261109.zip) zwei Eingabedateien für den Master ziehen.
Liest nur Daten (CSV/JSONL in verschachtelten ZIPs), führt nichts aus, kein Netz.
  V41_E4_SCHUTZ_1352.csv       E4-Rollup der 1'352 Website-Angebote: legacy_policy (ARCHIVE_NO_AUTO_RESCAN = Archiv, QA09_FROZEN_RECONCILIATION_ONLY = QA09), currentness, stage, write_permission
  V41_V288_PROVENIENZ_829.csv  V288-Feldprüfungen (Firecrawl-Lauf 08.11.): Ergebnis, Prüfmethode, Quell-URL und SHA-256 des erfassten Quelltexts, Checkpoint
  V41_HERKUNFT.json            SHA-256 des ZIPs und der gelesenen Innendateien, Zählungen
Aufruf: python3 -I extrahiere_v41.py <zip> <zielordner>"""
import collections, csv, hashlib, io, json, pathlib, sys, zipfile

ROOT = 'SFJ_CLAUDE_CODE_HANDOFF_V4_1_DRIFTKORRIGIERT_20261109/'
E4_ZIP = ROOT + '03_Vorpruefungen/SFJ_EVT257_EVIDENZ_FELDTRIAGE_20261107.zip'
E4_CSV = 'E4_SHADOW_1352_READONLY_RISK_ROLLUP.csv'
V288_DIR = ROOT + '07_V288_Field_Checkpoints/'
sha = lambda b: hashlib.sha256(b).hexdigest()


def main(zpath, out):
    raw = pathlib.Path(zpath).read_bytes()
    outer = zipfile.ZipFile(io.BytesIO(raw))
    herkunft = {'zip': pathlib.Path(zpath).name, 'zip_sha256': sha(raw), 'innen': {}}

    e4zip = outer.read(E4_ZIP); herkunft['innen'][E4_ZIP] = sha(e4zip)
    e4b = zipfile.ZipFile(io.BytesIO(e4zip)).read(E4_CSV); herkunft['innen'][E4_ZIP + '!' + E4_CSV] = sha(e4b)
    rows = list(csv.DictReader(io.StringIO(e4b.decode('utf-8-sig'))))
    pol = collections.Counter(r['legacy_policy'] for r in rows)
    assert len(rows) == 1352 and len({r['offer_id'] for r in rows}) == 1352
    assert pol['ARCHIVE_NO_AUTO_RESCAN'] == 191 and pol['QA09_FROZEN_RECONCILIATION_ONLY'] == 116
    e4cols = ['offer_id', 'legacy_policy', 'currentness', 'stage', 'write_permission', 'e4_field_gold_verified']
    out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
    with open(out / 'V41_E4_SCHUTZ_1352.csv', 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=e4cols, extrasaction='ignore'); w.writeheader()
        w.writerows(sorted(rows, key=lambda r: r['offer_id']))

    recs = {}
    for name in sorted(n for n in outer.namelist() if n.startswith(V288_DIR) and n.endswith('.zip')):
        b = outer.read(name); herkunft['innen'][name] = sha(b)
        for line in zipfile.ZipFile(io.BytesIO(b)).read('records.jsonl').decode('utf-8-sig').splitlines():
            if not line.strip(): continue
            r = json.loads(line); key = r['country_id']
            assert key not in recs, f'doppelt: {key}'
            m, i = key.split(':', 1)
            recs[key] = dict(market=m, id=i, evidence_status=r.get('evidence_status', ''), verification_method=r.get('verification_method', ''),
                             gold=str(r.get('gold')), source_captured_url=r.get('source_captured_url', '') or '',
                             source_captured_sha256=r.get('source_captured_sha256', '') or '',
                             holds=json.dumps(r.get('holds', []), ensure_ascii=False), checkpoint=name.rsplit('/', 1)[1])
    assert len(recs) == 829 and all(r['gold'] == 'False' for r in recs.values())
    with open(out / 'V41_V288_PROVENIENZ_829.csv', 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=list(next(iter(recs.values())))); w.writeheader()
        w.writerows(sorted(recs.values(), key=lambda r: (r['market'], r['id'])))
    herkunft['zaehlung'] = {'e4_zeilen': len(rows), 'e4_policy': dict(pol), 'v288_pruefungen': len(recs),
                            'v288_evidence_status': dict(collections.Counter(r['evidence_status'] for r in recs.values())), 'v288_gold': 0}
    (out / 'V41_HERKUNFT.json').write_text(json.dumps(herkunft, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print('OK', herkunft['zaehlung'])


if __name__ == '__main__':
    main(*sys.argv[1:3])
