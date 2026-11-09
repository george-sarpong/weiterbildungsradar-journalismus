#!/usr/bin/env python3
"""Tests Paket 3: Dreiwege-Merge, Master 3'818, Owner-Liste, Warteschlange. Offline. Positiv + Manipulationstests.
Paket 4 (09.11.2026): Tests P01–P08 und A05–A06 für die Owner-Entscheide E060–E070; M05–M07, X04, X09, X18, Q06 angepasst.

Aufruf: python3 -I test_paket3.py --base DIR --live DIR --main DIR --pr10 DIR --eingaben DIR --usowner JSONL --out DIR --scripts DIR
"""
import argparse, csv, json, pathlib, re, shutil, subprocess, sys, tempfile

AP = argparse.ArgumentParser()
for a in ('base', 'live', 'main', 'pr10', 'eingaben', 'usowner', 'out', 'scripts', 'owner'): AP.add_argument('--' + a, required=True)
A = AP.parse_args(); OUT = pathlib.Path(A.out); SC = pathlib.Path(A.scripts); EIN = pathlib.Path(A.eingaben)
res = []
def t(name, cond, info=''):
    res.append(bool(cond)); print(('PASS ' if cond else 'FAIL ') + name + (f'  [{info}]' if info and not cond else ''))
def arr(p):
    s = pathlib.Path(p).read_text('utf-8'); return json.loads(s[s.index('['):s.rindex(']') + 1])
def obj(p):
    s = pathlib.Path(p).read_text('utf-8'); return json.loads(s[s.index('{'):s.rindex('}') + 1])
rcsv = lambda p: list(csv.DictReader(open(p, encoding='utf-8-sig')))
MS = json.loads((OUT / 'MERGE_SUMMARY.json').read_text('utf-8')); K = MS['kontrolle_rohzaehlung']
ENT = rcsv(OUT / 'merge_feldentscheide.csv'); OWN = rcsv(OUT / 'owner_liste.csv'); Q = rcsv(OUT / 'nachrecherche_warteschlange.csv')
MASTER = rcsv(OUT / 'master_3818.csv')
B = {o['id']: o for o in arr(f'{A.base}/data.js')}; L = {o['id']: o for o in arr(f'{A.live}/data-a1-86ff68ddc9ac.js')}
G = {o['id']: o for o in arr(f'{A.main}/data.js')}
LS = obj(f'{A.live}/smart-search-data-a1-a38a2a2b2391.js')['byId']; GS = obj(f'{A.main}/smart-search-data.js')['byId']
KD = {o['id']: o for o in json.loads((OUT / 'merge_kandidat_data.json').read_text('utf-8'))}
KS = json.loads((OUT / 'merge_kandidat_smart.json').read_text('utf-8'))['byId']

# --- Merge-Kontrollzahlen ---
p = K['data_github=pr10 (Methode §4)']
t('M01 §4 reproduziert: 764/274 nur GitHub, 77/59 nur live, 10 Konflikte, 16 Schutz-ID-Änderungen (GitHub-Seite PR10)',
  (p['NUR_GITHUB']['felder'], p['NUR_GITHUB']['angebote'], p['NUR_LIVE']['felder'], p['NUR_LIVE']['angebote'], p['KONFLIKT']['felder'],
   p['KONFLIKT']['angebote'], p['NUR_LIVE_SCHUTZ_angebote']) == (764, 274, 77, 59, 10, 10, 16), p)
m = K['data_github=main (Auftrag)']
t('M02 Auftrag (GitHub-Seite main): 655/215, 81/61, 6 Konflikte, 18 Schutz-ID-Änderungen',
  (m['NUR_GITHUB']['felder'], m['NUR_GITHUB']['angebote'], m['NUR_LIVE']['felder'], m['NUR_LIVE']['angebote'], m['KONFLIKT']['felder'],
   m['NUR_LIVE_SCHUTZ_angebote']) == (655, 215, 81, 61, 6, 18), m)
t('M03 main↔PR10 = 85 Angebote data.js, 326 Smart-Sidecars (wie EVT269)', (MS['main_vs_pr10']['angebote_data'], MS['main_vs_pr10']['angebote_smart']) == (85, 326))
t('M04 priceEligible live 996 / main 983 / PR10 757 (wie STATUS §2)', [MS['priceEligible'][k] for k in ('live', 'main', 'pr10')] == [996, 983, 757])
# unabhängige Nachrechnung des Kandidaten
ent = {(e['datei'], e['id'], e['feld']): e for e in ENT}
bad = 0
for datei, Lx, Gx, Kx in (('data', L, G, KD), ('smart', LS, GS, KS)):
    for i in Lx:
        for f in set(Lx[i]) | set(Gx[i]) | set(Kx[i]):
            e = ent.get((datei, i, f)); exp = Gx[i].get(f) if e and (e['klasse'] == 'NUR_GITHUB' or e['owner_entscheid'] == 'GITHUB') else Lx[i].get(f)
            bad += Kx[i].get(f) != exp
t('M05 Kandidat = Live, ausser NUR_GITHUB-Feldern und Owner-Entscheiden GITHUB (= main)', bad == 0, bad)
offen = [e for e in ENT if e['owner_status'] == 'OFFEN']
t('M06 keine stille Überschreibung: alle offenen Owner-Fälle tragen im Kandidaten den Live-Wert',
  all((KD if e['datei'] == 'data' else KS)[e['id']].get(e['feld']) == (L if e['datei'] == 'data' else LS)[e['id']].get(e['feld']) for e in offen))
prot = {r['id'] for r in MASTER if r['schutz_307'] == 'JA'}
gh_owner = {(e['datei'], e['id'], e['feld']) for e in ENT if e['owner_entscheid'] == 'GITHUB'}
t('M07 Schutz-IDs im Kandidaten nur per Owner-Entscheid GITHUB verändert (data + smart)',
  all(Kx[i].get(f) == (Gx if (d, i, f) in gh_owner else Lx)[i].get(f) for d, Lx, Gx, Kx in (('data', L, G, KD), ('smart', LS, GS, KS))
      for i in prot for f in set(Lx[i]) | set(Gx[i]) | set(Kx[i])))
BS = obj(f'{A.base}/smart-search-data.js')['byId']
t('M08 jede Abweichung von der Basis ist protokolliert (data + smart)', all(((d, i, f) in ent) for d, Bx, Lx, Gx in (('data', B, L, G), ('smart', BS, LS, GS))
                                                                         for i in Bx for f in set(Bx[i]) | set(Lx[i]) | set(Gx[i])
                                                                         if not (Bx[i].get(f) == Lx[i].get(f) == Gx[i].get(f))))
# --- Owner-Liste ---
kat = lambda k: [r for r in OWN if r['kategorie'].startswith(k)]
hold_main = {i for i, o in G.items() if o.get('publicationStatus') == 'HOLD'}
t('O01 6 echte Konflikte', len(kat('A')) == 6)
t('O02 46 HOLD-Sperren = alle HOLD aus main, live ohne Sperre', {r['id'] for r in kat('D')} == hold_main and len(hold_main) == 46
  and not any(L[i].get('publicationStatus') for i in hold_main))
schutz_aend = {(d, i, f) for d, Lx, Gx, Bx in (('data', L, G, B), ('smart', LS, GS, obj(f'{A.base}/smart-search-data.js')['byId']))
               for i in prot for f in set(Bx[i]) | set(Lx[i]) | set(Gx[i]) if not (Bx[i].get(f) == Lx[i].get(f) == Gx[i].get(f))}
t('O03 jede Änderung an einer Schutz-ID (beide Richtungen) steht in der Owner-Liste', schutz_aend == {(r['datei'], r['id'], r['feld']) for r in OWN if r['schutz_307'] == 'JA'})
t('O04 je Fall Live-Wert-Spalte, GitHub-Wert-Spalte und Vorschlag GITHUB/LIVE/NACHRECHERCHE', all(r['vorschlag'] in ('GITHUB', 'LIVE', 'NACHRECHERCHE') and 'live_wert' in r and 'github_main_wert' in r for r in OWN))
t('O05 Owner-Liste enthält nur Konflikt-, Gruppen-, Schutz- und HOLD-Fälle', {r['kategorie'][0] for r in OWN} <= set('ABCDE'))
# --- Master ---
keys = [(r['market'], r['id']) for r in MASTER]
t('X01 3818 eindeutige market+id, Marktverteilung', len(set(keys)) == 3818 and {k: sum(1 for x in keys if x[0] == k) for k in ('CH', 'AT', 'LI', 'DE', 'USA')}
  == {'CH': 1223, 'AT': 124, 'LI': 5, 'DE': 111, 'USA': 2355})
t('X02 307 Schutz-IDs markiert, alle im Website-Bestand', len(prot) == 307 and all(r['kohorte'] == 'WEBSITE_1352' for r in MASTER if r['schutz_307'] == 'JA'))
t('X03 Vier-Felder-Modell vorhanden, release_markt ISO-3166-1', all(r['release_markt'] in ('CH', 'AT', 'LI', 'DE', 'US') and all(c in r for c in
  ('anbieter_land', 'durchfuehrungsort_land', 'durchfuehrungsort_sicherheit', 'ch_zugang')) for r in MASTER))
t('X04 CH-Zugang nur aus genanntem CH-Durchführungsort (E066), sonst «nicht erfasst»; nie aus Anbieterland',
  all((r['ch_zugang'] == 'JA') == (r['kohorte'] == 'WEBSITE_1352' and r['durchfuehrungsort_land'] == 'CH') for r in MASTER)
  and all(r['h_ch_zugang'] == 'REGEL' and 'E066' in r['ch_zugang_regel'] for r in MASTER if r['ch_zugang'] == 'JA')
  and {r['ch_zugang'] for r in MASTER} <= {'JA', 'nicht erfasst'})
t('X05 Anbieterland nur mit Beleg (22 DJA laut Audit), sonst «nicht erfasst»', sum(r['anbieter_land'] != 'nicht erfasst' for r in MASTER) == 22
  and all(r['h_anbieter_land'] == 'AUDIT' for r in MASTER if r['anbieter_land'] != 'nicht erfasst'))
iso = {'CH', 'AT', 'LI', 'DE', 'FR', 'BE', 'NO', 'SE', 'PT', 'US', 'nicht erfasst'}
t('X06 Durchführungsort-Land nur ISO-Codes oder «nicht erfasst»', all(set(r['durchfuehrungsort_land'].split('|')) <= iso for r in MASTER))
FELDER = ('anbieter', 'titel', 'beschreibung', 'url', 'sprache', 'preis_text', 'termin_text', 'ort_text', 'format', 'dauer')
t('X07 keine leeren Anzeigewerte (fehlend = «nicht erfasst», E036)', all(r[c].strip() for r in MASTER for c in FELDER))
t('X08 Objektklassen nur aus E029-Menge', {r['objektklasse'] for r in MASTER} <= {'STABLE_OFFER', 'PROGRAMM', 'EVENT', 'SERVICE', 'DURCHFUEHRUNG', 'UNKLAR', 'UNKLAR_SAMMELOBJEKT'})
t('X09 Herkunftscode je Feld gesetzt und gültig', all(v in {'LIVE', 'LIVE_GEAENDERT', 'MAIN', 'LIVE_OWNER_OFFEN', 'MAIN_OWNER', 'LIVE_OWNER', 'R4', 'KATALOG_XLSX', 'REGEL', 'AUDIT', 'LEER'}
                                                      for r in MASTER for k, v in r.items() if k.startswith('h_')))
t('X10 Legacy-Werte = Merge-Kandidat (Titel, URL)', all(r['titel'] == KD[r['id']]['title'] and r['url'] == KD[r['id']]['url'] for r in MASTER if r['kohorte'] == 'WEBSITE_1352'))
r4 = {(x['country'], x['record_id']): x for x in json.loads((EIN / 'R4_PUBLICATION_ROWS_20260915.json').read_text('utf-8'))}
t('X11 DE/USA-Werte = R4 (Titel, Anbieter), keine erfundenen Felder', all(r['titel'] == r4[(r['market'], r['id'])]['title'] and r['beschreibung'] == 'nicht erfasst'
                                                                          and r['preis_text'] == 'nicht erfasst' for r in MASTER if r['kohorte'] == 'DE_USA_R4_2466'))
t('X12 Dubletten nicht sichtbar, Verdacht offen (E008)', all(r['beta_sichtbar'] == 'NEIN' for r in MASTER if r['dedupe_status'].startswith('DUBLETTE'))
  and all(r['beta_sichtbar'] == 'OFFEN_DEDUPE' for r in MASTER if r['dedupe_status'].startswith('VERDACHT')))
t('X13 HOLD-Fälle nicht automatisch sichtbar', all(r['beta_sichtbar'] in ('OFFEN_OWNER', 'NEIN') for r in MASTER if r['id'] in hold_main))
t('X14 0 Gold, 0 freigegebene Writes', all(r['gold'] == 'NEIN' for r in MASTER))
ortfall = lambda txt: {r['durchfuehrungsort_land'] for r in MASTER if r['ort_text'] == txt}
t('X15 Ortsregel mit Wortgrenzen: Klagenfurt = AT (nicht CH), Wiener Neustadt = AT, Brüssel = BE', ortfall('Klagenfurt') == {'AT'}
  and ortfall('Wiener Neustadt') == {'AT'} and ortfall('Brüssel, Belgien') == {'BE'})
t('X16 «Zürich, Bern» = mehrere Orte, «Zürich»/«Zurich» = ein Ort', {r['durchfuehrungsort_sicherheit'] for r in MASTER if r['ort_text'] == 'Zürich, Bern'} == {'MEHRERE_ORTE'}
  and {r['durchfuehrungsort_sicherheit'] for r in MASTER if r['ort_text'] in ('Zürich', 'Zurich')} == {'ORT_GENANNT'})
t('X17 R4 archiviert/abgelaufen und Mehrfach-URL nicht automatisch sichtbar', not any(r['beta_sichtbar'] == 'JA' for r in MASTER if r['kohorte'] == 'DE_USA_R4_2466'
  and (re.search(r'ARCHIV|ELAPSED|CLOSED|SUPPRESS', r['r4_aktualitaet']) or r['url_identitaet'] == 'OFFEN')))
t('X18 gleiches Programm bei verschiedenen Anbietern = Verdacht oder eigenständig, nicht verworfen',
  all(r['beta_sichtbar'] != 'NEIN' for r in MASTER if r['dedupe_status'].startswith(('VERDACHT', 'EIGENSTAENDIG'))))
# --- Warteschlange ---
qr = lambda pre: [x for x in Q if x['regel'].startswith(pre)]
at = qr('E042 AT')
t('Q01 E042 AT 103 (76 OUT + 27 HOLD, inkl. 3 nur im Owner-Sheet), CH 220, LI 3',
  len(at) == 103 and sum('OUT' in x['grund'] for x in at) == 76 and sum('HOLD' in x['grund'] for x in at) == 27 and len(qr('E042 CH')) == 220 and len(qr('E042 LI')) == 3)
t('Q02 keine Warteschlangenzeile E042 ist im Master (nicht sichtbar)', not any((x['market'], x['id']) in set(keys) for x in qr('E042')))
t('Q03 §6/E055 vollständig: WDA-05, CAD-005, CFJM-013/-015, FAM04-C07, FAM05-C04, WDA-04', {x['regel'] for x in Q} >= {'§6 WDA-05', '§6 CAD-005', '§6/E055 FAM14-C05',
  '§6/E055 FAM04-C07', '§6/E055 FAM05-C04', '§6 WDA-04 (Sammelzeile)'} and {x['id'] for x in qr('§6/E055 FAM14')} == {'OFFER-CFJM-013', 'OFFER-CFJM-015'})
t('Q04 E043: 19 Ateliers + 2 MiTech', len(qr('E043')) == 21)
t('Q05 alle 30 Zeilen ohne eindeutige URL (frühere SOURCE_IDENTITY_HOLD) markiert und in der Warteschlange', len(qr('E029/E031')) == 30 == sum(r['url_identitaet'] == 'OFFEN' for r in MASTER))
t('Q06 jede nicht sichtbare oder offene Master-Zeile hat einen Owner- oder Warteschlangenfall',
  all(r['owner_offen'] or (r['market'], r['id']) in {(x['market'], x['id']) for x in Q} or r['beta_grund'].startswith(('OUT_SCOPE', 'ARCHIV', 'CH-HOLD'))
      or 'E070' in r['beta_grund'] or '(E071)' in r['beta_grund']
      for r in MASTER if r['beta_sichtbar'] != 'JA'))

# --- Paket 4: Owner-Entscheide E060–E070 ---
OE = rcsv(A.owner); OEK = {(x['datei'], x['id'], x['feld']): x for x in OE}
D_OFFEN = {'OFFER-NOBLE-004', 'OFFER-NOBLE-013', 'OFFER-NOBLE-014', 'OFFER-NOBLE-020', 'OFFER-NOBLE-033', 'OFFER-NOBLE-035', 'OFFER-NOBLE-037',
           'OFFER-NOBLE-044', 'OFFER-ORSYS-054', 'OFFER-ORSYS-057', 'OFFER-ORSYS-063', 'OFFER-ORSYS-076', 'OFFER-ORSYS-078', 'OFFER-ORSYS-082',
           'OFFER-ORSYS-083', 'OFFER-ORSYS-099', 'OFFER-ORSYS-118', 'OFFER-ORSYS-139', 'OFFER-ORSYS-141', 'OFFER-ORSYS-143', 'OFFER-ORSYS-144',
           'OFFER-ORSYS-151', 'AT-PROD-OFFER-154', 'PCC-P38'}
from collections import Counter
t('P01 799 Owner-Fälle alle entschieden (A 6, B 11+7, C 29, D 46, E 700); D Gruppe 3 + AT-PROD-OFFER-154 + PCC-P38 = E071',
  len(OWN) == 799 and Counter((r['kategorie'][0], r['entscheid_owner'] or 'OFFEN') for r in OWN) == {('A', 'GITHUB'): 6, ('B', 'GITHUB'): 11,
  ('B', 'LIVE'): 7, ('C', 'LIVE'): 29, ('D', 'GITHUB'): 46, ('E', 'GITHUB'): 700}
  and {r['id'] for r in OWN if r['register_id'] == 'E071'} == D_OFFEN)
t('P02 owner_liste.csv: entscheid_owner = Entscheiddatei, Register-ID passt zur Kategorie (A E060 · B E061 · C E062 · D E063 · E E064)',
  all(r['entscheid_owner'] == OEK[(r['datei'], r['id'], r['feld'])]['entscheid'] and
      r['register_id'] == ({'A': 'E060', 'B': 'E061', 'C': 'E062', 'D': 'E071' if r['id'] in D_OFFEN else 'E063', 'E': 'E064'}[r['kategorie'][0]] if r['entscheid_owner'] else '') for r in OWN))
t('P03 Kandidat folgt dem Entscheid: GITHUB = main-Wert, LIVE = Live-Wert',
  all((KD if e['datei'] == 'data' else KS)[e['id']].get(e['feld']) == ((G if e['datei'] == 'data' else GS) if e['owner_entscheid'] == 'GITHUB'
      else (L if e['datei'] == 'data' else LS))[e['id']].get(e['feld']) for e in ENT if e['owner_status'] == 'ENTSCHIEDEN'))
MI = {r['id']: r for r in MASTER if r['kohorte'] == 'WEBSITE_1352'}
t('P04 E063/E071: alle 46 HOLD im Kandidaten, nicht sichtbar; 16 Nachrecherche (E063), 24 ohne (E071)',
  all(KD[i].get('publicationStatus') == 'HOLD' and MI[i]['beta_sichtbar'] == 'NEIN' for i in hold_main) and len(hold_main) == 46
  and len(qr('E063')) == 16 and not ({x['id'] for x in Q} & D_OFFEN) and all('(E071)' in MI[i]['beta_grund'] for i in D_OFFEN))
t('P05 E067/E068: 295 R4-archiviert und 30 ohne eindeutige URL nicht sichtbar und in der Warteschlange',
  sum('(E067)' in r['beta_grund'] and r['beta_sichtbar'] == 'NEIN' for r in MASTER) == 295 == len(qr('E014/E015'))
  and sum('(E068)' in r['beta_grund'] and r['beta_sichtbar'] == 'NEIN' for r in MASTER) == 30 == len(qr('E029/E031')))
t('P06 E069: 151 Sammelobjekte als Programm, keine Klasse UNKLAR_SAMMELOBJEKT, 24 unklar in Warteschlange',
  sum(r['sammelobjekt'] == 'JA' for r in MASTER) == 151 and all(r['objektklasse'] == 'PROGRAMM' for r in MASTER if r['sammelobjekt'] == 'JA')
  and not any(r['objektklasse'] == 'UNKLAR_SAMMELOBJEKT' for r in MASTER) and len(qr('E029 Objektklasse')) == 24 == sum(r['objektklasse'] == 'UNKLAR' for r in MASTER))
MK = {(r['market'], r['id']): r for r in MASTER}
t('P07 E070: DJA V112-47/-48 Dublette nicht sichtbar, Maricopa USR-785/-788/-793 sichtbar; keine offenen Dedupe-Fälle',
  all(MK[('DE', i)]['beta_sichtbar'] == 'NEIN' and MK[('DE', i)]['dedupe_status'] == 'DUBLETTE_BESTAND_OWNER' for i in ('V112-47', 'V112-48'))
  and all(MK[('USA', i)]['beta_sichtbar'] == 'JA' for i in ('USR-785', 'USR-788', 'USR-793')) and not qr('E008'))
t('P08 E065: Anbieterland weiterhin nur mit Beleg (22 DJA), Rohwert nur als Kandidat mit Verweis E065',
  sum(r['anbieter_land'] != 'nicht erfasst' for r in MASTER) == 22
  and all('E065' in r['anbieter_land_kandidat_quelle'] for r in MASTER if r['kohorte'] == 'WEBSITE_1352' and r['anbieter_land_kandidat'] != 'nicht erfasst'))

# --- Manipulationstests ---
def run(cmd): return subprocess.run([sys.executable, '-I'] + [str(c) for c in cmd], capture_output=True, text=True)
def merge_mit(live_dir, main_dir, out):
    return run([SC / 'merge3.py', '--base', A.base, '--live', live_dir, '--main', main_dir, '--pr10', A.pr10, '--katalog', EIN / 'Arbeitskatalog_3818_V288_20261108.xlsx',
                '--policy', f'{A.pr10}/data/staging/evt270-currentness-policy-20261107.json', '--vorschlaege', SC.parent / 'paket3/config/konflikt_vorschlaege.json', '--out', out])
with tempfile.TemporaryDirectory() as td:
    td = pathlib.Path(td)
    lv = td / 'live'; shutil.copytree(A.live, lv)
    f = lv / 'data-a1-86ff68ddc9ac.js'; s = f.read_text('utf-8'); f.write_text(s.replace('"id": "OFFER-MAZ-001"', '"id": "OFFER-MAZ-001X"', 1), 'utf-8')
    t('A01 fehlende/umbenannte Live-ID -> Merge bricht ab', run([SC / 'merge3.py']).returncode != 0 and merge_mit(lv, A.main, td / 'o1').returncode != 0)
    mn = td / 'main'; mn.mkdir(); [shutil.copy(pathlib.Path(A.main) / n, mn / n) for n in ('data.js', 'smart-search-data.js')]
    d = arr(mn / 'data.js'); x = next(o for o in d if o['id'] == 'OFFER-MAZ-001'); x['priceDisplay'] = 'CHF 9999 (manipuliert)'
    (mn / 'data.js').write_text('window.X = ' + json.dumps(d, ensure_ascii=False) + ';', 'utf-8')
    r = merge_mit(A.live, mn, td / 'o2'); e2 = {(e['id'], e['feld']): e for e in rcsv(td / 'o2/merge_feldentscheide.csv')} if r.returncode == 0 else {}
    k2 = {o['id']: o for o in json.loads((td / 'o2/merge_kandidat_data.json').read_text('utf-8'))} if r.returncode == 0 else {}
    t('A02 neue main-Änderung an Nicht-Schutz-ID wird protokolliert und übernommen', e2.get(('OFFER-MAZ-001', 'priceDisplay'), {}).get('klasse') == 'NUR_GITHUB'
      and k2.get('OFFER-MAZ-001', {}).get('priceDisplay') == 'CHF 9999 (manipuliert)')
    pid = sorted(prot)[0]; x = next(o for o in d if o['id'] == pid); x['title'] = 'MANIPULIERT'
    (mn / 'data.js').write_text('window.X = ' + json.dumps(d, ensure_ascii=False) + ';', 'utf-8')
    r = merge_mit(A.live, mn, td / 'o3'); k3 = {o['id']: o for o in json.loads((td / 'o3/merge_kandidat_data.json').read_text('utf-8'))}
    e3 = {(e['id'], e['feld']): e for e in rcsv(td / 'o3/merge_feldentscheide.csv')}
    t('A03 main-Änderung an Schutz-ID wird NICHT übernommen, sondern Owner-Fall', k3[pid]['title'] == L[pid]['title'] and e3[(pid, 'title')]['klasse'] == 'SCHUTZ_GITHUB')
    lv2 = td / 'live2'; shutil.copytree(A.live, lv2); dl = arr(lv2 / 'data-a1-86ff68ddc9ac.js')
    nid = next(i for i in G if i not in prot and L[i] == G[i] == B[i]); y = next(o for o in dl if o['id'] == nid); y['region'] = 'LIVE-X'
    (lv2 / 'data-a1-86ff68ddc9ac.js').write_text('window.X = ' + json.dumps(dl, ensure_ascii=False) + ';', 'utf-8')
    dm = arr(pathlib.Path(A.main) / 'data.js'); z = next(o for o in dm if o['id'] == nid); z['region'] = 'MAIN-Y'
    (mn / 'data.js').write_text('window.X = ' + json.dumps(dm, ensure_ascii=False) + ';', 'utf-8')
    r = merge_mit(lv2, mn, td / 'o4'); k4 = {o['id']: o for o in json.loads((td / 'o4/merge_kandidat_data.json').read_text('utf-8'))}
    e4 = {(e['id'], e['feld']): e for e in rcsv(td / 'o4/merge_feldentscheide.csv')}
    t('A04 eingeschleuster Konflikt -> KONFLIKT, Kandidat behält Live-Wert', e4[(nid, 'region')]['klasse'] == 'KONFLIKT' and k4[nid]['region'] == 'LIVE-X')
    oe = rcsv(A.owner); cols = list(oe[0])
    def owner_mit(rows, name):
        pth = td / name
        with open(pth, 'w', newline='', encoding='utf-8-sig') as fh:
            w = csv.DictWriter(fh, fieldnames=cols); w.writeheader(); w.writerows(rows)
        return run([SC / 'merge3.py', '--base', A.base, '--live', A.live, '--main', A.main, '--pr10', A.pr10, '--katalog', EIN / 'Arbeitskatalog_3818_V288_20261108.xlsx',
                    '--policy', f'{A.pr10}/data/staging/evt270-currentness-policy-20261107.json', '--vorschlaege', SC.parent / 'paket3/config/konflikt_vorschlaege.json',
                    '--out', td / ('o' + name), '--owner', pth])
    alt = [dict(x) for x in oe]; alt[0]['pruefwert'] = '0000000000000000'
    t('A05 veralteter Owner-Entscheid (Live- oder main-Wert seither geändert) -> Merge bricht ab', owner_mit(alt, 'o5.csv').returncode != 0)
    fremd = [dict(x) for x in oe] + [dict(oe[0], id='OFFER-MAZ-001', feld='title')]
    t('A06 Owner-Entscheid ohne passenden Owner-Fall -> Merge bricht ab', owner_mit(fremd, 'o6.csv').returncode != 0)
n = sum(res); print(f'{n}/{len(res)} PASS'); sys.exit(0 if n == len(res) else 1)
