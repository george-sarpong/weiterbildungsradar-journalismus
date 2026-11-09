#!/usr/bin/env python3
"""Paket 1 (09.11.2026): Zeilenzählung R4 und Crosswalks gegen data.js / search-index.

Eingaben (nicht eingecheckt, per Google-Sheets-API neu abrufbar):
  R4_JSON  = values-Export von Sheet 1s6nKTq56BCli70sr0Jsf-sn2pxVaaZ0EBjA9X9lCNQU,
             Bereich PUBLICATION_ROWS!A2:N3816 (JSON mit Schlüssel "values")
Repo-Dateien: data.js, search-index-v1.2.js (Branch claude/datenharmonisierung).
Aufruf: python3 paket1_crosswalk.py R4_JSON REPO_ROOT   (benötigt node für das Laden der JS-Dateien)
"""
import collections, json, subprocess, sys

r4_path, repo = sys.argv[1], sys.argv[2].rstrip('/')

JS = r"""
const fs=require('fs'),vm=require('vm');
function load(f){const c={window:{}};c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync(f,'utf8'),c);return c;}
const d=load(process.argv[1]+'/data.js').window.WEITERBILDUNGSRADAR_OFFERS;
const si=load(process.argv[1]+'/search-index-v1.2.js').SFJ_SEARCH_INDEX;
console.log(JSON.stringify({offers:d.map(o=>[o.id,o.country,o.endDate||'']),index:si.rows.map(r=>r.id),snapshot:si.snapshot}));
"""
web = json.loads(subprocess.check_output(['node', '-e', JS, repo]))

rows = [r for r in json.load(open(r4_path))['values'] if r and r[0]]
print('R4 Zeilen', len(rows), dict(collections.Counter(r[0] for r in rows)))
assert len({(r[0], r[1]) for r in rows}) == len(rows), 'country+id nicht eindeutig'

MARKT = {'Schweiz': 'CH', 'Frankreich': 'CH', 'CH_ACCESS / operational presence Chiasso': 'CH',
         'Österreich': 'AT', 'Liechtenstein': 'LI'}
wm = collections.defaultdict(set)
for i, c, _ in web['offers']:
    wm[MARKT[c]].add(i)
print('Website', len(web['offers']), {k: len(v) for k, v in wm.items()})
print('country-Werte', dict(collections.Counter(c for _, c, _ in web['offers'])))

for k in ['CH', 'AT', 'LI', 'DE']:
    r = {x[1] for x in rows if x[0] == k}
    w = wm.get(k, set())
    print(f'{k}: R4 {len(r)} | Website {len(w)} | beide {len(r & w)} | nur R4 {len(r - w)} | nur Website {len(w - r)}')

idx = set(web['index'])
miss = [(i, e) for i, _, e in web['offers'] if i not in idx]
print('Suchindex', len(idx), 'Snapshot', web['snapshot'], 'fehlend', len(miss))
for i, e in miss:
    print('  ', i, 'endDate', e, 'vor Snapshot' if e and e < web['snapshot'] else 'NICHT vor Snapshot')
if len(rows) > 0 and len(rows[0]) > 10:
    de = [r for r in rows if r[0] == 'DE']
    print('DE source_layer', dict(collections.Counter(r[10] for r in de)))
