#!/usr/bin/env python3
"""MediaSkills.ch – Dreiwege-Merge der beiden Datendateien (Paket 3, 09.11.2026).

Basis  = Commit 86868e0 (= live data.js vom 11.10.2026)
Live   = Infomaniak-Snapshot 09.11.2026 (data-a1-86ff68ddc9ac.js, smart-search-data-a1-a38a2a2b2391.js)  -> massgeblich (E035, E044)
GitHub = main 5f09e078 (data.js, smart-search-data.js)
PR10   = 82bb95f9, nur zweite Quelle: Abweichungen main<->PR10 als eigene Liste, nie automatisch übernommen.

Regeln je (Datei, Angebot, Top-Level-Feld):
  UNVERAENDERT       Basis = Live = main                         -> Live-Wert
  NUR_LIVE           Live geändert, main = Basis                 -> Live-Wert
  NUR_GITHUB         main geändert, Live = Basis                 -> main-Wert (automatisch)
  BEIDE_GLEICH       beide gleich geändert                       -> Live-Wert
  KONFLIKT           beide verschieden geändert                  -> Live-Wert bleibt, Owner entscheidet
  SCHUTZ_LIVE        NUR_LIVE an einer der 307 Schutz-IDs        -> Live-Wert bleibt, Owner bestätigt
  SCHUTZ_GITHUB      NUR_GITHUB an einer Schutz-ID               -> Live-Wert bleibt, Owner entscheidet
  HOLD_SPERRE        main setzt publicationStatus=HOLD, Live hat keine Sperre -> Live bleibt, Owner entscheidet
  GRUPPENKONFLIKT    innerhalb einer Feldgruppe (Termin, Preis, Ort) hat die eine Seite Feld A, die andere Feld B
                     geändert -> automatische main-Übernahme in dieser Gruppe ausgesetzt, Live bleibt, Owner entscheidet
Nichts wird still überschrieben: jede Abweichung von der Basis steht in merge_feldentscheide.csv.

Aufruf:
  python3 -I merge3.py --base DIR --live DIR --main DIR --pr10 DIR --katalog XLSX --policy JSON --vorschlaege JSON --out DIR
"""
import argparse, csv, collections, hashlib, json, pathlib, sys

AP = argparse.ArgumentParser()
for a in ('base', 'live', 'main', 'pr10', 'katalog', 'policy', 'vorschlaege', 'out'):
    AP.add_argument('--' + a, required=True)
A = AP.parse_args()
OUT = pathlib.Path(A.out); OUT.mkdir(parents=True, exist_ok=True)
HASH = {}

def rd(p):
    b = pathlib.Path(p).read_bytes(); HASH[str(p)] = hashlib.sha256(b).hexdigest(); return b.decode('utf-8')

def js_array(p):
    t = rd(p); return json.loads(t[t.index('['):t.rindex(']') + 1])

def js_object(p):
    t = rd(p); return json.loads(t[t.index('{'):t.rindex('}') + 1])

LIVE_DATA, LIVE_SMART = 'data-a1-86ff68ddc9ac.js', 'smart-search-data-a1-a38a2a2b2391.js'
SRC = {
    'data': {'base': js_array(f'{A.base}/data.js'), 'live': js_array(f'{A.live}/{LIVE_DATA}'),
             'main': js_array(f'{A.main}/data.js'), 'pr10': js_array(f'{A.pr10}/data.js')},
    'smart': {k: js_object(p) for k, p in (('base', f'{A.base}/smart-search-data.js'), ('live', f'{A.live}/{LIVE_SMART}'),
                                            ('main', f'{A.main}/smart-search-data.js'), ('pr10', f'{A.pr10}/smart-search-data.js'))},
}
D = {k: {o['id']: o for o in v} for k, v in SRC['data'].items()}
S = {k: v['byId'] for k, v in SRC['smart'].items()}

# ---------- Eingangsinvarianten ----------
for X in (D, S):
    assert all(len(v) == 1352 for v in X.values()), 'nicht 1352 Angebote'
    assert set(X['base']) == set(X['live']) == set(X['main']) == set(X['pr10']), 'ID-Mengen verschieden'
assert all(len(v) == 1352 for v in SRC['data'].values()), 'doppelte IDs in data.js'
assert SRC['smart']['live']['meta'] == SRC['smart']['base']['meta']

# ---------- Schutz-IDs (307) aus Arbeitskatalog XLSX (Drive 1IDwc5qM…, 08.11.2026) ----------
import openpyxl
wb = openpyxl.load_workbook(A.katalog, read_only=True)
rows = list(wb['Katalog_3818'].iter_rows(values_only=True)); hdr = rows[0]
KAT = [dict(zip(hdr, r)) for r in rows[1:]]
PROT = {r['Offer ID'] for r in KAT if r['Schutz 307'] == 'JA'}
assert len(KAT) == 3818 and len(PROT) == 307 and PROT <= set(D['live']), 'Schutzmenge nicht 307 bzw. nicht in 1352'
POL = json.loads(rd(A.policy))
PROT_KAT = {x['offerId']: ('ARCHIV' if x['policy'] == 'ARCHIVE_NO_AUTO_RESCAN' else 'QA09') for x in POL['protectedB2']}
assert set(PROT_KAT) <= PROT

VORSCHLAG = {(x['datei'], x['id'], x['feld']): x for x in json.loads(rd(A.vorschlaege))['faelle']}
GRUPPEN = {'data': {'TERMIN': {'start', 'startDate', 'endDate', 'sessions'}, 'PREIS': {'priceDisplay', 'priceCategory'},
                    'ORT': {'region'}},
           'smart': {'PREIS': {'priceOptions', 'priceEligible', 'parserStatus'}, 'TERMIN': {'delivery'}}}

import re
def nur_umformulierung(b, l):
    """Live-Änderung ohne neue Zahlen (gleiche Ziffernfolge) = Umformulierung/Eindeutschung."""
    z = lambda v: re.findall(r'\d+', ser(v) or '')
    return isinstance(b, str) and isinstance(l, str) and z(b) == z(l)

def ser(v):
    return None if v is None else v if isinstance(v, str) else json.dumps(v, ensure_ascii=False)

def roh_klasse(b, l, g):
    if l == b and g == b: return 'UNVERAENDERT'
    if g == b: return 'NUR_LIVE'
    if l == b: return 'NUR_GITHUB'
    return 'BEIDE_GLEICH' if l == g else 'KONFLIKT'

def kontrolle(X, gh):
    """Rohzählung ohne Schutzregeln, für den Abgleich mit GESAMTWISSENSSTAND §4."""
    c = collections.Counter(); o = collections.defaultdict(set)
    for i in X['base']:
        for f in set(X['base'][i]) | set(X['live'][i]) | set(X[gh][i]):
            k = roh_klasse(X['base'][i].get(f), X['live'][i].get(f), X[gh][i].get(f))
            c[k] += 1; o[k].add(i)
            if k == 'NUR_LIVE' and i in PROT: o['NUR_LIVE_SCHUTZ'].add(i)
    return {k: {'felder': c[k], 'angebote': len(o[k])} for k in ('NUR_GITHUB', 'NUR_LIVE', 'BEIDE_GLEICH', 'KONFLIKT')} | \
           {'NUR_LIVE_SCHUTZ_angebote': len(o['NUR_LIVE_SCHUTZ'])}

KONTROLLE = {'data_github=pr10 (Methode §4)': kontrolle(D, 'pr10'), 'data_github=main (Auftrag)': kontrolle(D, 'main'),
             'smart_github=pr10': kontrolle(S, 'pr10'), 'smart_github=main': kontrolle(S, 'main')}

# ---------- Merge ----------
entscheide, merged = [], {'data': {}, 'smart': {}}
for datei, X in (('data', D), ('smart', S)):
    for i in X['live']:
        b, l, g, p = X['base'][i], X['live'][i], X['main'][i], X['pr10'][i]
        felder = sorted(set(b) | set(l) | set(g), key=lambda f: (list(l).index(f) if f in l else 999, f))
        kl = {f: roh_klasse(b.get(f), l.get(f), g.get(f)) for f in felder}
        # Gruppenkonflikt: eine Seite ändert Feld A, die andere Feld B derselben Gruppe
        gk = set()
        for gname, gf in GRUPPEN[datei].items():
            seiten = {kl[f] for f in gf if f in kl}
            if 'NUR_LIVE' in seiten and 'NUR_GITHUB' in seiten:
                gk |= {f for f in gf if f in kl and kl[f] in ('NUR_LIVE', 'NUR_GITHUB')}
        neu = {}
        for f in felder:
            k = kl[f]; vb, vl, vg = b.get(f), l.get(f), g.get(f)
            if k == 'NUR_GITHUB' and datei == 'data' and f == 'publicationStatus' and vg == 'HOLD':
                k = 'HOLD_SPERRE'
            elif f in gk:
                k = 'GRUPPENKONFLIKT'
            elif i in PROT and k in ('NUR_LIVE', 'BEIDE_GLEICH'):
                k = 'SCHUTZ_LIVE'
            elif i in PROT and k == 'NUR_GITHUB':
                k = 'SCHUTZ_GITHUB'
            uebernehmen_github = k == 'NUR_GITHUB'
            if uebernehmen_github:
                if f in g: neu[f] = vg          # Feld fehlt in main -> entfällt auch im Kandidaten
            elif f in l:
                neu[f] = vl
            owner = k in ('KONFLIKT', 'SCHUTZ_LIVE', 'SCHUTZ_GITHUB', 'HOLD_SPERRE', 'GRUPPENKONFLIKT')
            if k == 'UNVERAENDERT': continue
            v = VORSCHLAG.get((datei, i, f))
            if v: vor, begr = v['vorschlag'], v['begruendung']
            elif k == 'HOLD_SPERRE': vor, begr = 'GITHUB', 'HOLD aus main übernehmen: Angebot in der Beta nicht sichtbar (E042); Sperre stammt aus QA09-Arbeit auf main.'
            elif k == 'SCHUTZ_LIVE':
                vor = 'LIVE'
                begr = ('Live und main haben identisch geändert (z. B. Tausendertrennung im Preis); nur bestätigen.' if vl == vg
                        else 'Live ist Basis (E035); Live-Änderung ist reine Umformulierung (gleiche Zahlen).' if nur_umformulierung(vb, vl)
                        else 'Live ist Basis (E035); Live-Änderung enthält neue Angaben (z. B. datierter Terminnachtrag) – bestätigen.')
            elif k == 'GRUPPENKONFLIKT' and all(nur_umformulierung(b.get(x), l.get(x)) for x in gk if kl[x] == 'NUR_LIVE'):
                vor = 'GITHUB' if kl[f] == 'NUR_GITHUB' else 'LIVE'
                begr = ('Gruppe Termin: Live hat nur umformuliert (gleiche Zahlen), main ergänzt strukturierte Durchführungen. '
                        'Vorschlag: main-Felder der Gruppe übernehmen, Live-Wortlaut im Textfeld behalten; Gesamtbild nach Übernahme prüfen.')
            elif k == 'SCHUTZ_GITHUB': vor, begr = 'GITHUB', 'main-Änderung aus der QA09-Konsolidierung (auf main publiziert, beedf06 23.10.2026); Live-Wert ist der Stand vom 11.10.'
            elif k == 'GRUPPENKONFLIKT': vor, begr = 'NACHRECHERCHE', 'Live und main haben verschiedene Felder derselben Gruppe geändert; Kombination nicht belegt. Bis zum Entscheid gilt die Live-Gruppe.'
            elif k == 'KONFLIKT': vor, begr = 'NACHRECHERCHE', 'Kein kuratierter Vorschlag hinterlegt.'
            else: vor, begr = ('GITHUB' if uebernehmen_github else 'LIVE'), 'automatisch nach Merge-Regel'
            entscheide.append(dict(datei=datei, id=i, feld=f, klasse=k, schutz_307='JA' if i in PROT else 'NEIN',
                                   schutz_kategorie=PROT_KAT.get(i, 'nicht erfasst') if i in PROT else '',
                                   owner_entscheid_noetig='JA' if owner else 'NEIN', merge_wert_quelle='MAIN' if uebernehmen_github else 'LIVE',
                                   basis_wert=ser(vb), live_wert=ser(vl), github_main_wert=ser(vg), pr10_wert=ser(p.get(f)),
                                   pr10_weicht_von_main_ab='JA' if p.get(f) != vg else 'NEIN', vorschlag=vor, begruendung=begr))
        # Feldreihenfolge: wie live, neue Felder hinten
        merged[datei][i] = neu

# Kreuzprüfung data <-> smart: Preisgruppe darf nicht aus verschiedenen Quellen stammen
quelle = collections.defaultdict(set)
for e in entscheide:
    if (e['datei'], e['feld']) in {('data', 'priceDisplay'), ('data', 'priceCategory'), ('smart', 'priceOptions'), ('smart', 'priceEligible')}:
        quelle[e['id']].add(e['merge_wert_quelle'])
kreuz = sorted(i for i, q in quelle.items() if len(q) > 1)

# main <-> PR10 (zweite Quelle, nicht übernommen)
m_p = []
for datei, X in (('data', D), ('smart', S)):
    for i in X['main']:
        g, p = X['main'][i], X['pr10'][i]
        for f in sorted(set(g) | set(p)):
            if g.get(f) != p.get(f):
                m_p.append(dict(datei=datei, id=i, feld=f, schutz_307='JA' if i in PROT else 'NEIN', live_wert=ser(X['live'][i].get(f)),
                                github_main_wert=ser(g.get(f)), pr10_wert=ser(p.get(f)),
                                merge_wert=ser(merged[datei][i].get(f)), status='NICHT_UEBERNOMMEN_ZWEITE_QUELLE'))

# ---------- Ausgaben ----------
def wcsv(name, dicts):
    cols = list(dicts[0]) if dicts else ['leer']
    with open(OUT / name, 'w', newline='', encoding='utf-8-sig') as fh:
        w = csv.DictWriter(fh, fieldnames=cols); w.writeheader(); w.writerows(dicts)

wcsv('merge_feldentscheide.csv', entscheide)
wcsv('main_vs_pr10_zweite_quelle.csv', m_p)
order = [o['id'] for o in SRC['data']['live']]
(OUT / 'merge_kandidat_data.json').write_text(json.dumps([merged['data'][i] for i in order], ensure_ascii=False, indent=0), 'utf-8')
(OUT / 'merge_kandidat_smart.json').write_text(json.dumps({'meta': SRC['smart']['live']['meta'], 'byId': {i: merged['smart'][i] for i in order}},
                                                          ensure_ascii=False, indent=0), 'utf-8')
zus = dict(
    stand='2026-11-09', basis='86868e085d35bffb0da8e655a0580ec1d80fa0ac', github_main='5f09e0789c42eeceef0661c47434b87ba369927d',
    pr10='82bb95f948efe66075216c9a8e3e5b385697b546', live=[LIVE_DATA, LIVE_SMART],
    kontrolle_rohzaehlung=KONTROLLE,
    klassen={d: dict(collections.Counter(e['klasse'] for e in entscheide if e['datei'] == d)) for d in ('data', 'smart')},
    klassen_angebote={d: {k: len({e['id'] for e in entscheide if e['datei'] == d and e['klasse'] == k})
                          for k in sorted({e['klasse'] for e in entscheide})} for d in ('data', 'smart')},
    owner_faelle_felder=sum(e['owner_entscheid_noetig'] == 'JA' for e in entscheide),
    owner_faelle_angebote=len({e['id'] for e in entscheide if e['owner_entscheid_noetig'] == 'JA'}),
    kreuzpruefung_preis_quellen_gemischt=kreuz,
    main_vs_pr10={'felder': len(m_p), 'angebote_data': len({x['id'] for x in m_p if x['datei'] == 'data'}),
                  'angebote_smart': len({x['id'] for x in m_p if x['datei'] == 'smart'})},
    priceEligible={k: sum(1 for o in S[k].values() if o.get('priceEligible')) for k in S} |
                  {'merge_kandidat': sum(1 for o in merged['smart'].values() if o.get('priceEligible'))},
    schutz_307=len(PROT), schutz_kategorie_bekannt=dict(collections.Counter(PROT_KAT.values())),
    eingaben_sha256=HASH)
(OUT / 'MERGE_SUMMARY.json').write_text(json.dumps(zus, ensure_ascii=False, indent=1), 'utf-8')
print(json.dumps({k: v for k, v in zus.items() if k != 'eingaben_sha256'}, ensure_ascii=False, indent=1))
