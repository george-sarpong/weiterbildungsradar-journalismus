#!/usr/bin/env python3
"""MediaSkills.ch – Owner-Liste und Nachrecherche-Warteschlange (Paket 3, 09.11.2026).

Owner-Liste: nur Fälle, die der Owner entscheidet (E035): echte Konflikte, Gruppenkonflikte, Änderungen an den
307 Schutz-IDs (beide Richtungen) und die 46 live fehlenden HOLD-Sperren. Je Fall Live-Wert, GitHub-Wert, Vorschlag.
Warteschlange: OUT/HOLD-Zeilen ausserhalb der 3'818 (E042), Nachrecherche-Fälle aus GESAMTWISSENSSTAND §6, E043, E055
sowie die in Paket 3 entstandenen Prüffälle (Deduplizierung E008, Objektklasse E029, Merge).

Aufruf: python3 -I paket3_listen.py --out DIR --r4 JSON --at CSV --stichtag YYYY-MM-DD
"""
import argparse, csv, collections, json, pathlib, re

AP = argparse.ArgumentParser()
for a in ('out', 'r4', 'at', 'stichtag'): AP.add_argument('--' + a, required=True)
A = AP.parse_args(); OUT = pathlib.Path(A.out); ST = A.stichtag
rcsv = lambda p: list(csv.DictReader(open(p, encoding='utf-8-sig')))
ENT = rcsv(OUT / 'merge_feldentscheide.csv'); MASTER = {(r['market'], r['id']): r for r in rcsv(OUT / 'master_3818.csv')}
BY_ID = {r['id']: r for r in MASTER.values() if r['kohorte'] == 'WEBSITE_1352'}
LIVE = {o['id']: o for o in json.load(open(OUT / 'merge_kandidat_data.json', encoding='utf-8'))}
R4 = json.load(open(A.r4, encoding='utf-8')); AT = {r['record_id']: r for r in rcsv(A.at)}
DEDUPE = rcsv(OUT / 'dedupe_de_usa.csv')

def live_sichtbar(i):
    """Live-App blendet nur nach Enddatum aus (STATUS §2, GEPRÜFT)."""
    e = LIVE[i].get('endDate') or ''
    return 'nein (Enddatum vorbei)' if re.match(r'\d{4}-\d{2}-\d{2}', e) and e < ST else 'ja'

ORDER = {'KONFLIKT': 1, 'GRUPPENKONFLIKT': 2, 'SCHUTZ_LIVE': 3, 'HOLD_SPERRE': 4, 'SCHUTZ_GITHUB': 5}
NAME = {'KONFLIKT': 'A Echter Konflikt', 'GRUPPENKONFLIKT': 'B Gruppenkonflikt', 'SCHUTZ_LIVE': 'C Live-Änderung an Schutz-ID',
        'HOLD_SPERRE': 'D HOLD-Sperre fehlt live', 'SCHUTZ_GITHUB': 'E GitHub-Änderung an Schutz-ID'}
owner = sorted((e for e in ENT if e['owner_entscheid_noetig'] == 'JA'), key=lambda e: (ORDER[e['klasse']], e['id'], e['datei'], e['feld']))
rows = []
for n, e in enumerate(owner, 1):
    m = BY_ID[e['id']]
    lw = e['live_wert'] if e['klasse'] != 'HOLD_SPERRE' else f"keine Sperre; live sichtbar: {live_sichtbar(e['id'])}"
    rows.append(dict(fall=f'O{n:04d}', kategorie=NAME[e['klasse']], datei=e['datei'], id=e['id'], anbieter=m['anbieter'], titel=m['titel'],
                     feld=e['feld'], schutz_307=e['schutz_307'], live_wert=lw, github_main_wert=e['github_main_wert'],
                     pr10_wert=e['pr10_wert'] if e['pr10_weicht_von_main_ab'] == 'JA' else '(= main)', basis_wert_11_10=e['basis_wert'],
                     vorschlag=e['vorschlag'], begruendung=e['begruendung'], entscheid_owner=''))
cols = list(rows[0])
with open(OUT / 'owner_liste.csv', 'w', newline='', encoding='utf-8-sig') as fh:
    w = csv.DictWriter(fh, fieldnames=cols); w.writeheader(); w.writerows(rows)

# ---------- Nachrecherche-Warteschlange ----------
Q = []
def q(regel, prio, market, i, anbieter, titel, url, grund, beleg, beta='NEIN'):
    Q.append(dict(regel=regel, prioritaet=prio, market=market, id=i, anbieter=anbieter, titel=titel, url=url, grund=grund, beleg=beleg, beta_sichtbar=beta))
im_master = {k for k in MASTER}
r4_ids = set()
for x in R4:
    if x['country'] not in ('CH', 'AT', 'LI'): continue
    r4_ids.add(x['record_id'])
    if (x['country'], x['record_id']) in im_master: continue
    if x['country'] == 'AT' and x['record_id'] in AT:
        d = AT[x['record_id']]
        q('E042 AT ' + d['disposition'], 3 if d['disposition'] == 'OUT_SCOPE' else 2, 'AT', x['record_id'], x['provider'], x['title'], x['source_url'],
          f"{d['disposition']}: {d['grund']}", f"AT-Owner-Sheet 1mtLbV9e…, Blatt {d['blatt']}")
    elif x['country'] == 'AT':
        q('E042 AT ohne Disposition', 2, 'AT', x['record_id'], x['provider'], x['title'], x['source_url'],
          'R4-Zeile nicht im AT-Release 124, keine Disposition in den AT-Blättern (W8)', 'R4 PUBLICATION_ROWS; WIDERSPRUECHE W8')
    else:
        q(f"E042 {x['country']} nicht im Release", 3, x['country'], x['record_id'], x['provider'], x['title'], x['source_url'],
          f"R4-Zeile (scope={x['scope']}, currentness={x['currentness']}) nicht im Release-Schnitt 30.09.; Einzelgrund nicht erfasst"
          + (' (u. a. 133 Scope-Ausschlüsse ggü. V113)' if x['country'] == 'CH' else ''), 'R4 PUBLICATION_ROWS 15.09.; QUELLENVERZEICHNIS §3')
for i, d in AT.items():
    if i not in r4_ids:
        q('E042 AT nur im Owner-Sheet (W8)', 2, 'AT', i, 'nicht erfasst', 'nicht erfasst', 'nicht erfasst',
          f"{d['disposition']}: {d['grund']} – Objekt fehlt in R4 (W8: 227 Owner-Zeilen vs. 224 R4-Zeilen)", f"AT-Owner-Sheet, Blatt {d['blatt']}")
def legacy(regel, prio, i, grund, beleg):
    m = BY_ID[i]; q(regel, prio, m['market'], i, m['anbieter'], m['titel'], m['url'], grund, beleg, m['beta_sichtbar'])
legacy('§6 WDA-05', 1, 'AT-PROD-OFFER-208', 'Zeigt vergangene Gratis-Septembertermine als Preis; aktuellen Preis/Termin belegen', 'Audit 28.10. Abschn. F')
legacy('§6 CAD-005', 2, 'CAD-005', 'Sidecar ohne Preisoptionen, Kursform UNKNOWN (Termin 01.–02.12.2026 und CHF 500 laut Handoff bestätigt)', 'Handoff §9.34')
for i in ('OFFER-CFJM-013', 'OFFER-CFJM-015'):
    legacy('§6/E055 FAM14-C05', 2, i, 'Ausgabe 2027 ohne Editionsbeleg', 'Handoff §3.3, §9.33; E055')
q('§6/E055 FAM04-C07', 2, 'CH', 'nicht erfasst', 'nicht erfasst', 'CH-V47 NEWSROOM-Geschwisterzeile', 'nicht erfasst',
  'Konkurrierende V47-WOZ/NEWSROOM-Parentfolge ohne Owner-Disposition; Angebots-ID in Live/R4 nicht auffindbar', 'Handoff §3.3; E055')
q('§6/E055 FAM05-C04', 2, 'AT', 'nicht erfasst', 'oe24 / ÖMA / KfJ', 'nicht erfasst', 'nicht erfasst',
  'Anbieter-ID-Zuordnung oe24 unbewiesen; kein oe24-Datensatz in Live/R4 gefunden', 'Handoff §3.3; E055')
n_on = sum(1 for r in MASTER.values() if r['kohorte'] == 'WEBSITE_1352' and re.search('ONLINE|ON_DEMAND', r['format'].upper()))
n_ver = sum(1 for r in MASTER.values() if r['kohorte'] == 'WEBSITE_1352' and re.search('ONLINE|ON_DEMAND', r['format'].upper()) and r['lieferform'] == 'VERIFIED')
q('§6 WDA-04 (Sammelzeile)', 3, 'CH|AT|LI', f'{n_on} Angebote', 'diverse', 'Online/On-Demand ohne VERIFIED-Kursform', 'master_3818.csv filtern: format ONLINE|ON_DEMAND, lieferform ≠ VERIFIED',
  f'Abdeckungslücke, kein Bug: {n_on} Online/On-Demand-Angebote, davon {n_ver} VERIFIED (Audit 28.10.: 428/90, andere Zählbasis)', 'Audit 28.10. Abschn. E', 'JA')
for r in BY_ID.values():
    roh = LIVE[r['id']].get('country', '')
    if roh == 'Frankreich': legacy('E043 Anbieterland', 2, r['id'], 'country-Rohwert «Frankreich» (Ateliers): Anbietersitz belegen', 'E043; WIDERSPRUECHE W7')
    elif 'Chiasso' in roh: legacy('E043 Anbieterland', 2, r['id'], 'country-Rohwert «CH_ACCESS / operational presence Chiasso» (MiTech): Anbietersitz und CH-Zugang belegen', 'E043; WIDERSPRUECHE W7')
for e in ENT:
    if e['owner_entscheid_noetig'] == 'JA' and e['vorschlag'] == 'NACHRECHERCHE':
        legacy('Merge ' + e['klasse'], 2, e['id'], f"Feld {e['feld']}: Live und main nicht vereinbar, Kombination nicht belegt", 'merge_feldentscheide.csv')
    if e['id'] == 'CAD-002' and e['feld'] == 'start' and e['datei'] == 'data':
        legacy('Merge PR10-Zweitquelle', 2, 'CAD-002', 'PR10 nennt Präsenztermin 23.–24.11.2026, main nicht: Termin beim Anbieter belegen', 'main_vs_pr10_zweite_quelle.csv')
for d in DEDUPE:
    m = MASTER[(d['market'], d['id'])]
    q('E008 Deduplizierung', 2, d['market'], d['id'], d['anbieter'], d['titel'], d['url'], f"{d['status']} → {d['referenz']}", 'dedupe_de_usa.csv', m['beta_sichtbar'])
for r in MASTER.values():
    if r['url_identitaet'] == 'OFFEN':
        q('E029/E031 Quellenidentität', 2, r['market'], r['id'], r['anbieter'], r['titel'], r['url'],
          'Keine eindeutige Angebots-URL (mehrere URLs bzw. Text im R4-Quellenfeld): eine Angebots-URL bestimmen', 'R4 PUBLICATION_ROWS; früher SOURCE_IDENTITY_HOLD (30)', r['beta_sichtbar'])
    if 'R4 currentness' in r['beta_grund']:
        q('E014/E015 R4-Aktualität', 3, r['market'], r['id'], r['anbieter'], r['titel'], r['url'],
          r['beta_grund'].split(': ')[0] + ': aktuelles Angebot belegen oder archivieren (nach Owner-Grundsatzentscheid)', 'R4 PUBLICATION_ROWS', r['beta_sichtbar'])
for r in MASTER.values():
    if r['objektklasse'].startswith('UNKLAR'):
        q('E029 Objektklasse', 3, r['market'], r['id'], r['anbieter'], r['titel'], r['url'],
          f"Objektklasse {r['objektklasse']} (Rohtyp {r['angebotsart_roh']}): Klasse bestimmen", 'objektklassen_zuordnung.csv', r['beta_sichtbar'])
for x in Q:
    x['auftrag'] = 'Paket 3 Punkt 4' if x['regel'].startswith(('E042', '§6', 'E043')) else 'Zusatz aus Master/Merge (E034)'
Q.sort(key=lambda x: (x['prioritaet'], x['regel'], x['market'], x['id']))
for n, x in enumerate(Q, 1): x['nr'] = f'N{n:04d}'
qcols = ['nr', 'prioritaet', 'auftrag', 'regel', 'market', 'id', 'anbieter', 'titel', 'url', 'grund', 'beleg', 'beta_sichtbar']
with open(OUT / 'nachrecherche_warteschlange.csv', 'w', newline='', encoding='utf-8-sig') as fh:
    w = csv.DictWriter(fh, fieldnames=qcols); w.writeheader(); w.writerows(Q)

# ---------- Lesbare Owner-Übersicht (Markdown) ----------
def k(v, n=110):
    v = (v or '').replace('|', '/').replace('\n', ' ').strip()
    return v if len(v) <= n else v[:n - 1] + '…'
VOR = {'GITHUB': 'main übernehmen', 'LIVE': 'Live behalten', 'NACHRECHERCHE': 'Nachrecherche'}
md = [f'# Owner-Entscheide Paket 3 – Übersicht (Stand {ST})', '',
      'Vollständige Werte: `owner_liste.csv` (Spalte `entscheid_owner` zum Ausfüllen). Hier gekürzt auf ca. 110 Zeichen.',
      'Bis zum Entscheid gilt in jedem Fall der Live-Wert (keine stille Überschreibung).', '']
def tabelle(prefix, titel, extra=''):
    rs = [r for r in rows if r['kategorie'].startswith(prefix)]
    md.extend([f'## {titel} ({len(rs)} Felder, {len({r["id"] for r in rs})} Angebote)', extra, '',
               '| Fall | Angebot | Feld | Live-Wert | GitHub (main) | Vorschlag | Begründung |', '|---|---|---|---|---|---|---|'])
    for r in rs:
        md.append(f"| {r['fall']} | {r['id']} ({k(r['anbieter'], 30)}) | {r['datei']}.{r['feld']} | {k(r['live_wert'])} | {k(r['github_main_wert'])} | "
                  f"{VOR[r['vorschlag']]} | {k(r['begruendung'], 160)} |")
    md.append('')
tabelle('A', 'A Echte Konflikte', 'Live und main haben dasselbe Feld verschieden geändert. Alle sechs betreffen Schutz-IDs; alle Termine liegen vor dem Stichtag.')
tabelle('B', 'B Gruppenkonflikte', 'Live hat ein Feld der Gruppe Termin geändert, main ein anderes derselben Gruppe.')
tabelle('C', 'C Live-Änderungen an Schutz-IDs')
rs = [r for r in rows if r['kategorie'].startswith('D')]
md.extend([f'## D HOLD-Sperren aus main, die live fehlen ({len(rs)})', 'GitHub-Wert jeweils `publicationStatus = HOLD`; PR10 identisch. Vorschlag in allen Fällen: HOLD übernehmen (E042).', '',
           '| Fall | Angebot | Anbieter | Titel | live sichtbar heute | Vorschlag |', '|---|---|---|---|---|---|'])
for r in rs:
    md.append(f"| {r['fall']} | {r['id']} | {k(r['anbieter'], 35)} | {k(r['titel'], 50)} | {r['live_wert'].split(': ')[-1]} | {VOR[r['vorschlag']]} |")
rs = [r for r in rows if r['kategorie'].startswith('E')]
fc = collections.Counter(f"{r['datei']}.{r['feld']}" for r in rs)
md.extend(['', f'## E GitHub-Änderungen an Schutz-IDs ({len(rs)} Felder, {len({r["id"] for r in rs})} Angebote)',
           'Stammen aus den 49 main-Commits vom 17.–24.10.2026 (86868e0..5f09e07, überwiegend QA09); live läuft noch der Datenstand vom 11.10. '
           'Vorschlag: als Block übernehmen; Ausnahmen einzeln in `owner_liste.csv` markieren.', '',
           'Felder: ' + ', '.join(f'{f} {n}' for f, n in fc.most_common()), '',
           'Angebote: ' + ', '.join(sorted({r['id'] for r in rs})), ''])
C0 = collections.Counter
ms = list(MASTER.values())
n_kand = sum(r['anbieter_land_kandidat'] != 'nicht erfasst' and r['anbieter_land'] == 'nicht erfasst' for r in ms if r['kohorte'] == 'WEBSITE_1352')
n_chort = sum('Durchführungsort CH genannt' in r['ch_zugang_hinweis'] for r in ms)
md.extend(['## F Zusatz: Grundsatzfragen aus der Master-Tabelle (keine Einzelfälle, nicht in owner_liste.csv)', '',
           '| Nr. | Frage | betrifft | Vorschlag |', '|---|---|---|---|',
           f"| F1 | Darf der Rohwert `country` als Anbieterland gelten, wo kein Gegenbefund besteht? | {n_kand} Website-Angebote | Nein ohne Beleg; Kandidat bleibt sichtbar in Spalte `anbieter_land_kandidat` |",
           f"| F2 | Gilt «Durchführungsort in der Schweiz genannt» als Beleg für CH-Zugang (E030)? | {n_chort} Angebote | Nein: CH-Ort als Hinweis «Durchführung in der Schweiz» zeigen, CH-Zugang bleibt «nicht erfasst», bis Teilnahmebedingungen belegt sind (E030, E036) |",
           f"| F3 | DE/USA-Zeilen mit R4-Vermerk archiviert/abgelaufen/geschlossen: in der Beta zeigen (E036) oder archivieren (E014/E015)? | {sum(r['beta_sichtbar'] == 'OFFEN_AKTUALITAET' for r in ms)} Zeilen | archivieren, bis aktuelles Angebot belegt |",
           f"| F4 | DE/USA-Zeilen ohne eindeutige Angebots-URL (mehrere URLs bzw. Text im Quellenfeld) | {sum(r['beta_sichtbar'] == 'OFFEN_QUELLE' for r in ms)} Zeilen | nicht zeigen, bis eine Angebots-URL bestimmt ist |",
           f"| F5 | Objektklassen-Regeln (`objektklassen_zuordnung.csv`) bestätigen; Sammelobjekte (PARENT/FAMILY) | {sum(r['objektklasse'] == 'UNKLAR_SAMMELOBJEKT' for r in ms)} Sammelobjekte, {sum(r['objektklasse'] == 'UNKLAR' for r in ms)} unklar | Sammelobjekte als Programm führen, Teilangebote später |",
           f"| F6 | Dedupe-Verdacht (DJA DE↔CH, gleiches Programm an mehreren Colleges) | {sum(r['beta_sichtbar'] == 'OFFEN_DEDUPE' for r in ms)} Zeilen | DJA: CH-Datensatz behalten, DE-Zeile als Dublette markieren (nicht sichtbar); Colleges: je Anbieter behalten |",
           ''])
(OUT / 'owner_liste_uebersicht.md').write_text('\n'.join(md), 'utf-8')

C = collections.Counter
zus = dict(owner_faelle=len(rows), owner_je_kategorie=dict(C(r['kategorie'] for r in rows)),
           owner_angebote_je_kategorie={k: len({r['id'] for r in rows if r['kategorie'] == k}) for k in NAME.values()},
           owner_vorschlag=dict(C((r['kategorie'][0], r['vorschlag']) for r in rows).items()),
           warteschlange=len(Q), warteschlange_je_auftrag=dict(C(x['auftrag'] for x in Q)), warteschlange_je_regel=dict(C(x['regel'] for x in Q)), warteschlange_je_prio=dict(C(x['prioritaet'] for x in Q)))
zus['owner_vorschlag'] = {f'{k[0]}:{k[1]}': v for k, v in zus['owner_vorschlag'].items()}
(OUT / 'LISTEN_SUMMARY.json').write_text(json.dumps(zus, ensure_ascii=False, indent=1), 'utf-8')
print(json.dumps(zus, ensure_ascii=False, indent=1))
