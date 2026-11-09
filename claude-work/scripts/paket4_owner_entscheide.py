#!/usr/bin/env python3
"""MediaSkills.ch – Owner-Entscheide Paket 4 erfassen (09.11.2026).

Erzeugt einmalig paket3/config/owner_entscheide.csv aus den Owner-Antworten vom 09.11.2026 (Register E060–E064, E071).
Grundlage: merge_feldentscheide.csv und owner_liste.csv aus Paket 3 (Fassung 2, Commit 3eb9895).
Die erzeugte CSV ist danach die massgebliche Eingabe für merge3.py (--owner); dieses Skript dokumentiert nur die Zuordnung.

Je Fall: Entscheid GITHUB (main-Wert übernehmen) oder LIVE (Live-Wert behalten) bzw. leer = offen (Live-Wert gilt weiter).
Prüfwert = sha256 über [live_wert, github_main_wert]; merge3.py bricht ab, wenn sich einer der Werte seither geändert hat.

Aufruf: python3 -I paket4_owner_entscheide.py --p3out DIR --out CSV
"""
import argparse, csv, hashlib, json, collections

AP = argparse.ArgumentParser(); AP.add_argument('--p3out', required=True); AP.add_argument('--out', required=True)
A = AP.parse_args()
rcsv = lambda p: list(csv.DictReader(open(p, encoding='utf-8-sig')))
ENT = {(e['datei'], e['id'], e['feld']): e for e in rcsv(f'{A.p3out}/merge_feldentscheide.csv')}
OWN = rcsv(f'{A.p3out}/owner_liste.csv')
assert len(OWN) == 799 and not any(r['entscheid_owner'] for r in OWN), 'erwartet: Owner-Liste Paket 3 Fassung 2, unentschieden'

# Kategorie D: Owner-Antwort je Gruppe (E063); Gruppe 3 und Einzelfälle per Nachfrage HOLD wie main (E071).
D_G1 = {'OFFER-CFJM-008', 'OFFER-CORSO-001', 'OFFER-FERNUNI-002', 'PCC-P08', 'PCC-P32', 'PCC-P33'}
D_G2 = {'OFFER-EBU-014', 'OFFER-EBU-019', 'OFFER-MAZ-107', 'OFFER-MAZ-181', 'OFFER-MAZ-182', 'V82-DAWAN-012', 'V82-DAWAN-017',
        'V82-DAWAN-094', 'OFFER-IFC-006', 'OFFER-IFC-007', 'OFFER-IFC-012', 'OFFER-IFC-014', 'OFFER-IFC-020', 'V52-MEEL-INSTAGRAM',
        'OFFER-UZHDSI-001', 'AT-PROD-OFFER-168'}
D_OFFEN_EINZEL = {'AT-PROD-OFFER-154', 'PCC-P38'}
assert len(D_G1) == 6 and len(D_G2) == 16

def pruefwert(e):
    return hashlib.sha256(json.dumps([e['live_wert'], e['github_main_wert']], ensure_ascii=False).encode()).hexdigest()[:16]

rows = []
for r in OWN:
    e = ENT[(r['datei'], r['id'], r['feld'])]; k = r['kategorie'][0]
    if k == 'A': ent, rid, bem = 'GITHUB', 'E060', 'wie vorgeschlagen'
    elif k == 'B': ent, rid, bem = r['vorschlag'], 'E061', 'wie vorgeschlagen'
    elif k == 'C': ent, rid, bem = 'LIVE', 'E062', 'Live bestätigt'
    elif k == 'D' and r['id'] in D_G1: ent, rid, bem = 'GITHUB', 'E063', 'HOLD übernehmen, Gruppe 1 (E016/E017/E050)'
    elif k == 'D' and r['id'] in D_G2: ent, rid, bem = 'GITHUB', 'E063', 'HOLD übernehmen, Gruppe 2 (Termin vorbei/Kurs begonnen)'
    elif k == 'D': ent, rid, bem = 'GITHUB', 'E071', 'HOLD wie main, ' + ('Einzelfall' if r['id'] in D_OFFEN_EINZEL else 'Gruppe 3 NobleProg/ORSYS') + '; Ergebnis frühere Prüfung, keine Nachrecherche'
    elif k == 'E': ent, rid, bem = 'GITHUB', 'E064', 'Block'
    assert ent in ('GITHUB', 'LIVE', '')
    rows.append(dict(fall_p3=r['fall'], kategorie=r['kategorie'], datei=r['datei'], id=r['id'], feld=r['feld'], entscheid=ent,
                     register_id=rid, bemerkung=bem, pruefwert=pruefwert(e)))

c = collections.Counter((x['kategorie'][0], x['entscheid'] or 'OFFEN') for x in rows)
assert c == {('A', 'GITHUB'): 6, ('B', 'GITHUB'): 11, ('B', 'LIVE'): 7, ('C', 'LIVE'): 29, ('D', 'GITHUB'): 46,
             ('E', 'GITHUB'): 700}, c
with open(A.out, 'w', newline='', encoding='utf-8-sig') as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
print(json.dumps({f'{k[0]}:{k[1]}': n for k, n in sorted(c.items())}, ensure_ascii=False))
