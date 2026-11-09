#!/usr/bin/env python3
"""Tests der lokalen Master-Datensicht. Positiv + Adversarial. Offline.
Aufruf: python3 -I test_master.py <HANDOFF_DIR> <MAIN_DIR> <PR10_DIR> <OUT_DIR> <BUILD_SCRIPT>"""
import sys, sqlite3, json, pathlib, shutil, subprocess, tempfile
H, MAIN, PR10, OUT, BUILD = map(pathlib.Path, sys.argv[1:6])
db = sqlite3.connect(OUT / 'mediaskills_master_view.sqlite')
q = lambda s, *a: db.execute(s, a).fetchall()
res = []
def t(name, cond):
    res.append((name, bool(cond))); print(('PASS ' if cond else 'FAIL ') + name)

def arr(p):
    s = p.read_text('utf-8'); return json.loads(s[s.index('['):s.rindex(']') + 1])

t('T01 3818 eindeutige (market,id)', q('select count(*), count(distinct market||":"||id) from offers')[0] == (3818, 3818))
t('T02 Marktverteilung', dict(q('select market,count(*) from offers group by market')) == {'AT': 124, 'CH': 1223, 'DE': 111, 'LI': 5, 'USA': 2355})
occ = q("select id,verification_status from offers where occurrence_only=1")
t('T03 genau 2 Occurrence-only, nicht promovierbar', sorted(occ) == [('occ_avatar_ai_webinar_current', 'OCCURRENCE_ONLY_NOT_PROMOTABLE'), ('occ_podcasting_webinar_series_2026', 'OCCURRENCE_ONLY_NOT_PROMOTABLE')])
t('T04 307 Schutz-IDs, 191/116', dict(q('select policy,count(*) from protection_307 group by policy')) == {'ARCHIVE_NO_AUTO_RESCAN': 191, 'QA09_FROZEN_RECONCILIATION_ONLY': 116})
t('T05 alle 307 im Datensatz und PROTECTED_NO_AUTO_WRITE', q("select count(*) from offers o join protection_307 p on o.id=p.id where o.verification_status='PROTECTED_NO_AUTO_WRITE'")[0][0] == 307)
t('T06 145 protectedNoReopen-Flags ⊂ 307', q('select count(*) from offers where protectedNoReopen_flag=1 and protected_307=1')[0][0] == 145 == q('select count(*) from offers where protectedNoReopen_flag=1')[0][0])
t('T07 0 freigegebene Writes', q('select sum(approved_field_writes) from offers')[0][0] == 0)
t('T08 keine Gold-Promotion', q("select count(*) from offers where verification_status like '%GOLD%' or upper(coalesce(website_gold,'')) in ('TRUE','PROVEN','GOLD','FIELD_GOLD_PROVEN')")[0][0] == 0)
t('T09 V288 nur als ungeprüfte Kandidaten', q("select count(*) from field_provenance where layer like 'V288%' and status not like 'CANDIDATE_NOT_VERIFIED_%'")[0][0] == 0)
t('T10 EVT260 nur NO_WRITE', q("select count(*) from field_provenance where layer='EVT260_FIELD_DECISION' and status!='NO_WRITE_approved_field_value=NO'")[0][0] == 0 and q("select count(*) from field_provenance where layer='EVT260_FIELD_DECISION'")[0][0] == 547)
t('T11 jede Zeile hat Provenienz (auch UNVERIFIED)', q('select count(*) from offers o where not exists (select 1 from field_provenance f where f.market=o.market and f.id=o.id)')[0][0] == 0)

pr10 = {o['id']: o for o in arr(PR10 / 'data.js')}; main = {o['id']: o for o in arr(MAIN / 'data.js')}
bad = 0
for (i, f, layer, v) in q("select id,field,layer,value from field_provenance where layer like 'ORIGINAL_%'"):
    src = main if 'MAIN' in layer else pr10
    exp = src[i].get(f); exp = exp if isinstance(exp, str) or exp is None else json.dumps(exp, ensure_ascii=False)
    bad += exp != v
t('T12 1352 Originalwerte main+PR10 byte-treu übernommen', bad == 0 and q("select count(distinct id) from field_provenance where layer like 'ORIGINAL_PR10%'")[0][0] == 1352)
t('T13 85 Angebote main≠PR10 als Konflikt sichtbar', q("select count(distinct id) from conflicts where conflict_type='MAIN_VS_PR10_ORIGINAL_DIFFERS'")[0][0] == 85)
t('T14 MW-P06 accepted access_ch als semantischer Fehlgriff markiert', q("select count(*) from conflicts where id='MW-P06' and conflict_type='V288_ACCEPTED_SEMANTIC_MISFIT'")[0][0] == 1)
t('T15 DE/USA ohne erfundene Produktwerte', q("select count(*) from field_provenance where layer='EVT271_BRIDGE_PRODUCT_FIELD' and value_state='VALUE'")[0][0] == 0)
t('T16 CH-Zugang nie aus Staging abgeleitet', q("select count(*) from offers where cohort='STAGED_DE_USA_2466' and ch_access not like 'UNKNOWN%'")[0][0] == 0)
t('T17 30 Mehrfach-URL-Identitäts-Holds', q("select count(*) from conflicts where conflict_type='SOURCE_IDENTITY_HOLD'")[0][0] == 30)
t('T18 Kurzzitate (<15 Zeichen) nicht als FOUND', q("select count(*) from field_provenance where quote_in_frozen_snapshot like 'FOUND%' and length(trim(quote,'\" '))<15")[0][0] == 0)

# Adversarial: manipulierte Eingänge müssen den Build stoppen
def build_fails(mutate):
    with tempfile.TemporaryDirectory() as td:
        p = pathlib.Path(td) / 'pr10'; shutil.copytree(PR10, p, ignore=shutil.ignore_patterns('.git'))
        mutate(p)
        r = subprocess.run([sys.executable, '-I', str(BUILD), str(H), str(MAIN), str(p), str(pathlib.Path(td) / 'o')], capture_output=True, text=True)
        return r.returncode != 0
def m1(p):
    f = p / 'data.js'; s = f.read_text('utf-8'); f.write_text(s.replace('"CHF 1\'300.00', '"CHF 1\'301.00', 1), 'utf-8')
def m2(p):
    f = p / 'data/staging/target5-de-usa-wave1-r4-20260915.json'; d = json.loads(f.read_text('utf-8')); d['records'].pop(); f.write_text(json.dumps(d), 'utf-8')
def m3(p):
    f = p / 'data/staging/evt270-currentness-policy-20261107.json'; d = json.loads(f.read_text('utf-8')); d['protectedB2'][0]['offerId'] = 'OFFER-FAKE-999'; f.write_text(json.dumps(d), 'utf-8')
t('A01 geänderter Originalpreis in data.js -> Build bricht ab', build_fails(m1))
t('A02 fehlender Staging-Datensatz -> Build bricht ab', build_fails(m2))
t('A03 Schutz-ID ausserhalb 307 -> Build bricht ab', build_fails(m3))
n = sum(ok for _, ok in res); print(f'{n}/{len(res)} PASS'); sys.exit(0 if n == len(res) else 1)
