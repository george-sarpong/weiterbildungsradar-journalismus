#!/usr/bin/env python3
"""MediaSkills.ch – lokale, unveröffentlichte Master-Datensicht (Schritt A).

Liest ausschliesslich die Übergabe-ZIPs und die beiden Git-Worktrees (main, PR10).
Kein Netzwerk, keine API, keine Writes ausser in OUT. Es wird KEIN Wert promoviert:
current_value == original_value für alle Felder (0 freigegebene Writes).

Aufruf: python3 -I build_master.py <HANDOFF_DIR> <MAIN_DIR> <PR10_DIR> <OUT_DIR>
"""
import sys, json, csv, io, zipfile, glob, hashlib, sqlite3, re, collections, pathlib, unicodedata, datetime

H, MAIN, PR10, OUT = map(pathlib.Path, sys.argv[1:5])
OUT.mkdir(parents=True, exist_ok=True)
sha = lambda b: hashlib.sha256(b).hexdigest()
INPUT_HASHES = {}

def rb(path):
    b = pathlib.Path(path).read_bytes(); INPUT_HASHES[str(path)] = sha(b); return b

def jl(b):
    return [json.loads(l) for l in b.decode('utf-8-sig').split('\n') if l.strip()]

def js_array(path):
    t = rb(path).decode('utf-8'); return json.loads(t[t.index('['):t.rindex(']') + 1])

GS = H / '01_Grundstock/KONSOLIDIERTER_GRUNDSTOCK_3ce5dc16be7f69e1_1915311a12a9.zip'
BR = H / '01_Grundstock/SFJ_EVT271_TARGET5_3818_FIELD_BRIDGE_20261107.zip'
E257 = H / '03_Vorpruefungen/SFJ_EVT257_EVIDENZ_FELDTRIAGE_20261107.zip'
SRC = H / '02_Quellen/SFJ_V288_RESEARCH_SOURCE_ARCHIVE_SHA_7086DAE7.zip'
for p in (GS, BR, E257, SRC): rb(p)

with zipfile.ZipFile(GS) as z:
    rows = jl(z.read('alle_3818_daten_kandidaten.jsonl'))
    evt260 = list(csv.DictReader(io.StringIO(z.read('evt260_547_belegentscheide.csv').decode('utf-8-sig'))))
    city21 = jl(z.read('stadt_nachweise_21.jsonl'))
with zipfile.ZipFile(BR) as z:
    cat_bridge = {(x['market'], x['id']): x for x in jl(z.read('catalogue-field-bridge-1352.jsonl'))}
    oth_bridge = {(x['market'], x['id']): x for x in jl(z.read('de-usa-owner-product-bridge-2466.jsonl'))}
with zipfile.ZipFile(E257) as z:
    e4 = list(csv.DictReader(io.StringIO(z.read('E4_SHADOW_1352_READONLY_RISK_ROLLUP.csv').decode('utf-8-sig'))))
with zipfile.ZipFile(SRC) as z:
    captures = jl(z.read('CAPTURE_ALL_2579.jsonl'))
field_ck, src_ck = [], []
for f in sorted(glob.glob(str(H / '07_V288_Field_Checkpoints/*.zip'))):
    rb(f)
    with zipfile.ZipFile(f) as z: field_ck += [dict(r, _ck=pathlib.Path(f).name) for r in jl(z.read('records.jsonl'))]
for f in sorted(glob.glob(str(H / '08_V288_Source_Checkpoints/*.zip'))):
    rb(f)
    with zipfile.ZipFile(f) as z: src_ck += [dict(r, _ck=pathlib.Path(f).name) for r in jl(z.read('records.jsonl'))]

main_offers = {o['id']: o for o in js_array(MAIN / 'data.js')}
pr10_offers = {o['id']: o for o in js_array(PR10 / 'data.js')}
stage = {r['record_id']: r for r in json.loads(rb(PR10 / 'data/staging/target5-de-usa-wave1-r4-20260915.json'))['records']}
us_lines = rb(PR10 / 'data/staging/usa-owner-evidence-crosswalk-20261107.jsonl').decode('utf-8').strip().split('\n')
us_owner = {x['record_id']: x for x in map(json.loads, us_lines[1:])}
policy = json.loads(rb(PR10 / 'data/staging/evt270-currentness-policy-20261107.json'))

# ---------- Invarianten der Eingänge (Abbruch statt stilles Weiterrechnen) ----------
keys = [(r['market'], r['id']) for r in rows]
assert len(keys) == len(set(keys)) == 3818
assert collections.Counter(r['market'] for r in rows) == {'CH': 1223, 'AT': 124, 'LI': 5, 'DE': 111, 'USA': 2355}
assert set(keys) == set(cat_bridge) | set(oth_bridge) and not set(cat_bridge) & set(oth_bridge)
assert len(main_offers) == len(pr10_offers) == 1352 and set(main_offers) == set(pr10_offers)
assert all(r['catalogueOriginal'] == pr10_offers[r['id']] for r in rows if isinstance(r.get('catalogueOriginal'), dict))
assert len(stage) == 2466 and len(us_owner) == 2355
assert all(x['approved_field_value'] == 'NO' and x['field_write'] == 'NO' for x in evt260) and len(evt260) == 547

# ---------- 307er-Schutzmenge ----------
arc = {x['offer_id'] for x in e4 if x['legacy_policy'] == 'ARCHIVE_NO_AUTO_RESCAN'}
qa09 = {x['offer_id'] for x in e4 if x['legacy_policy'] == 'QA09_FROZEN_RECONCILIATION_ONLY'}
with zipfile.ZipFile(GS) as z:
    vollarchiv = {x['offer_id'] for x in jl(z.read('vollarchiv_191_evt257.jsonl'))}
pb2 = {x['offerId']: x['policy'] for x in policy['protectedB2']}
assert len(arc) == 191 and len(qa09) == 116 and not arc & qa09 and arc == vollarchiv
assert set(pb2) <= arc | qa09
protected = arc | qa09
id2market = {}
for m, i in keys: id2market.setdefault(i, []).append(m)
assert all(len(id2market.get(i, [])) == 1 for i in protected), 'Schutz-ID nicht eindeutig einem Markt zuordenbar'

# ---------- Feldmodell ----------
LEGACY_FIELDS = ['provider', 'title', 'description', 'focus', 'offerType', 'access', 'priceDisplay', 'priceCategory',
                 'language', 'level', 'duration', 'format', 'region', 'start', 'startDate', 'endDate', 'sessions',
                 'url', 'country', 'publicationStatus', 'publicationReason', 'approved', 'reviewAfter', 'release_origin']
# V288-Extraktionsfeld -> Legacy-Feld, Vergleichsart
V288_MAP = {'provider': ('provider', 'text'), 'title': ('title', 'text'), 'description': ('description', 'text'),
            'focus': (None, 'none'), 'topic_code': ('focus', 'vocab'), 'offer_type': ('offerType', 'vocab'),
            'access_ch': ('access', 'text'), 'price': ('priceDisplay', 'price'), 'language': ('language', 'lang'),
            'level': ('level', 'vocab'), 'duration': ('duration', 'text'), 'delivery': ('format', 'vocab'),
            'venue': ('region', 'text'), 'availability': ('start', 'text'), 'start_date': ('startDate', 'date'),
            'end_date': ('endDate', 'date')}
SENTINEL = re.compile(r'NOT_PUBLISHED|NICHT_PUBLIZIERT|nicht publiziert|PREIS_NICHT_PUBLIZIERT|NOT_IN_R4_SCHEMA', re.I)
ONREQ = re.compile(r'ON_REQUEST|auf Anfrage|nach Vereinbarung', re.I)

def state(v):
    if v is None: return 'ABSENT'
    if isinstance(v, (list, dict)): return 'VALUE' if v else 'EMPTY'
    s = str(v).strip()
    if not s: return 'EMPTY'
    if SENTINEL.search(s): return 'EXPLICIT_NOT_PUBLISHED'
    if ONREQ.search(s): return 'ON_REQUEST'
    return 'VALUE'

def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()

def nums(s):
    return {n.replace("'", '').replace('’', '').replace(',', '') for n in re.findall(r"\d[\d'’,]*(?:\.\d+)?", str(s or ''))
            if len(n.replace("'", '').replace(',', '')) >= 2}

LANG = {'deutsch': 'DE', 'german': 'DE', 'francais': 'FR', 'french': 'FR', 'franzosisch': 'FR', 'english': 'EN',
        'englisch': 'EN', 'italiano': 'IT', 'italienisch': 'IT', 'italian': 'IT'}

def compare(kind, orig, cand):
    if state(orig) != 'VALUE': return 'ORIGINAL_MISSING_CANDIDATE_PRESENT'
    if kind in ('none', 'vocab'): return 'NOT_COMPARABLE_DIFFERENT_VOCABULARY'
    if kind == 'price':
        a, b = nums(orig), nums(cand)
        if not b: return 'CANDIDATE_HAS_NO_AMOUNT'
        return 'SAME_AMOUNT_PRESENT' if a & b else 'DIFFERENT_AMOUNT'
    if kind == 'lang':
        c = {LANG.get(t, t.upper()) for t in norm(cand).split()}
        return 'SAME' if set(str(orig).upper().split('|')) & c else 'DIFFERENT'
    if kind == 'date':
        return 'SAME' if str(orig)[:10] == str(cand)[:10] else 'DIFFERENT'
    a, b = norm(orig), norm(cand)
    if not b: return 'CANDIDATE_EMPTY'
    return 'SAME_OR_CONTAINED' if (a == b or a in b or b in a) else 'DIFFERENT'

cap_by_url = {c['url']: c for c in captures}
cap_by_sha = {c['body_sha256']: c for c in captures if c['status'] == 'CONTENT_OK'}
qnorm = lambda s: re.sub(r'\s+', ' ', str(s or '').strip().strip('"„“”«»\'')).strip()

# ---------- Ausgaben ----------
offers_out, prov, conflicts = [], [], []

def add_prov(m, i, field, layer, value, status, source_url=None, source_sha=None, as_of=None, quote=None,
             quote_check=None, origin=None, comparison=None):
    prov.append(dict(market=m, id=i, field=field, layer=layer,
                     value=value if isinstance(value, str) or value is None else json.dumps(value, ensure_ascii=False),
                     value_state=state(value), status=status, source_url=source_url, source_sha256=source_sha,
                     as_of=as_of, quote=quote, quote_in_frozen_snapshot=quote_check, origin_artifact=origin,
                     comparison_to_original=comparison))

def add_conflict(m, i, field, ctype, detail, a=None, b=None, src=None):
    conflicts.append(dict(market=m, id=i, field=field, conflict_type=ctype, detail=detail,
                          value_a=None if a is None else str(a)[:500], value_b=None if b is None else str(b)[:500],
                          evidence=src))

v288 = {r['country_id']: r for r in field_ck}
assert len(v288) == 829 and all(r['gold'] is False for r in field_ck)
evt260_by = collections.defaultdict(list)
for x in evt260: evt260_by[(x['country'], x['offer_id'])].append(x)
city_by = {}
for x in city21:
    k = x.get('offer_id') or x.get('id'); city_by[k] = x

quote_stats = collections.Counter()
for r in rows:
    m, i = r['market'], r['id']
    legacy = isinstance(r.get('catalogueOriginal'), dict)
    o_main, o_pr10 = (main_offers.get(i), pr10_offers.get(i)) if legacy else (None, None)
    pol = 'ARCHIVE_NO_AUTO_RESCAN' if i in arc else 'QA09_FROZEN_RECONCILIATION_ONLY' if i in qa09 else ''
    main_diff = sorted(k for k in set(o_main or {}) | set(o_pr10 or {}) if (o_main or {}).get(k) != (o_pr10 or {}).get(k)) if legacy else []
    st = stage.get(i) if not legacy else None
    rec = dict(
        market=m, id=i, record_kind=r['kind'],
        occurrence_only=int(r['kind'] == 'OCCURRENCE_ONLY_DO_NOT_PROMOTE'),
        cohort='LEGACY_WEBSITE_1352' if legacy else 'STAGED_DE_USA_2466',
        object_type=(o_pr10 or {}).get('offerType') if legacy else r.get('objectType'),
        provider=r['provider'], title=r['title'], official_url=r['url'],
        provider_country_raw=(o_pr10 or {}).get('country') if legacy else None,
        protection_policy=pol, protected_307=int(bool(pol)), protectedNoReopen_flag=int(bool(r.get('protectedNoReopen'))),
        protectedB2_evt270=pb2.get(i, ''),
        ch_access=r.get('chAccess'), website_gold=r.get('websiteGold'), publication_gate=r.get('publicationGate'),
        source_url_status=r.get('sourceUrlStatus') or ('SINGLE_URL' if legacy else None),
        main_vs_pr10_diff_fields='|'.join(main_diff),
        r4_currentness=(st or {}).get('currentness'), r4_access_status=(st or {}).get('access_status'),
        r4_scope=(st or {}).get('scope'), r4_release_status=(st or {}).get('release_status'),
        v288_checked=int(f'{m}:{i}' in v288), v288_evidence_status=(v288.get(f'{m}:{i}') or {}).get('evidence_status'),
        evt260_decisions=len(evt260_by.get((m, i), [])),
        verification_status='OCCURRENCE_ONLY_NOT_PROMOTABLE' if r['kind'] == 'OCCURRENCE_ONLY_DO_NOT_PROMOTE'
            else 'PROTECTED_NO_AUTO_WRITE' if pol else 'NOT_VERIFIED',
        approved_field_writes=0)
    # Originalwerte (Legacy): main = publizierter Repo-Stand, PR10 = Grundstock-Original
    if legacy:
        for f in LEGACY_FIELDS:
            vm, vp = o_main.get(f), o_pr10.get(f)
            add_prov(m, i, f, 'ORIGINAL_MAIN_PUBLISHED_5f09e078', vm, 'ORIGINAL_UNCHANGED', o_main.get('url'),
                     as_of=o_main.get('approved'), origin='main:data.js')
            add_prov(m, i, f, 'ORIGINAL_PR10_DRAFT_82bb95f9', vp, 'ORIGINAL_UNCHANGED_DRAFT', o_pr10.get('url'),
                     as_of=o_pr10.get('approved'), origin='pr10:data.js = Grundstock.catalogueOriginal')
            if vm != vp:
                add_conflict(m, i, f, 'MAIN_VS_PR10_ORIGINAL_DIFFERS',
                             'Publizierter main-Wert und PR10-Draftwert weichen ab; Ownerentscheid, welcher Ausgangswert gilt',
                             vm, vp, 'main:data.js vs pr10:data.js')
            rec[f'orig_{f}'] = vp if not isinstance(vp, (list, dict)) else json.dumps(vp, ensure_ascii=False)
            rec[f'state_{f}'] = state(vp)
        c = city_by.get(i)
        if c:
            add_prov(m, i, 'region', 'OWNER_CONFIRMED_CITY_ONLY', c.get('city') or json.dumps(c, ensure_ascii=False)[:200],
                     'OWNER_FACT_NOT_WRITTEN_NOT_GOLD', c.get('source_url') or c.get('evidenceUrl'),
                     origin='Grundstock stadt_nachweise_21.jsonl')
        if r['market'] == 'CH' and o_pr10.get('country') not in ('Schweiz',):
            add_conflict(m, i, 'country', 'MARKET_NE_PROVIDER_COUNTRY_INFO',
                         'market=CH, Anbieterland-Rohwert abweichend; laut Briefing zulässig, nicht gleichsetzen',
                         m, o_pr10.get('country'), 'pr10:data.js')
    else:
        for f, v in [('object_type', st['object_type']), ('currentness', st['currentness']),
                     ('access_status', st['access_status']), ('scope', st['scope']), ('source_url', st['source_url']),
                     ('source_layer', st['source_layer']), ('source_publication_class', st['source_publication_class']),
                     ('release_status', st['release_status']), ('provider_id', st['provider_id'])]:
            add_prov(m, i, f, 'R4_OWNER_STAGING_20260915', v, 'OWNER_STAGED_NOT_VERIFIED', st['source_url'],
                     as_of='2026-09-15', origin='pr10:data/staging/target5-de-usa-wave1-r4-20260915.json')
        for f, v in (oth_bridge[(m, i)].get('productFields') or {}).items():
            add_prov(m, i, f, 'EVT271_BRIDGE_PRODUCT_FIELD', v, 'UNKNOWN', origin='EVT271 de-usa bridge')
            rec[f'state_{f}'] = state(v)
        u = us_owner.get(i)
        if u:
            for f in ('ownerSource', 'ownerEvidenceClass', 'accessEvidenceText', 'notes', 'ownerPrimarySource',
                      'programmeReleaseUrl', 'ownerDisposition', 'crossAxis'):
                add_prov(m, i, 'us_' + f, 'US_OWNER_CROSSWALK_20261107', u.get(f), 'OWNER_HISTORICAL_NOT_CH_ACCESS_PROOF',
                         u.get('ownerPrimarySource'), as_of='2026-11-07',
                         origin='pr10:data/staging/usa-owner-evidence-crosswalk-20261107.jsonl')
        if r.get('sourceUrlStatus') and r['sourceUrlStatus'] != 'SINGLE_SOURCE_URL_UNVERIFIED':
            add_conflict(m, i, 'url', 'SOURCE_IDENTITY_HOLD', r['sourceUrlStatus'], r.get('rawSourceUrl'), None, 'EVT271 bridge')
        if st['currentness'] and re.search(r'ARCHIVE|ELAPSED', st['currentness']):
            add_conflict(m, i, 'currentness', 'CURRENTNESS_ARCHIVED_OR_ELAPSED',
                         'R4 kennzeichnet archiviert/abgelaufen; nicht als buchbar darstellen', st['currentness'], None, 'R4 staging')
    # EVT260 (alle NO_WRITE)
    for d in evt260_by.get((m, i), []):
        add_prov(m, i, d['field'].lower(), 'EVT260_FIELD_DECISION', d['evt260_source_adjudication'],
                 'NO_WRITE_approved_field_value=NO', d['frozen_source_url'], d['frozen_source_sha256'],
                 origin='Grundstock evt260_547_belegentscheide.csv; next=' + d['evt260_next_action'])
    # V288 Erstextraktion (ungeprüft)
    vr = v288.get(f'{m}:{i}')
    if vr and isinstance(vr.get('initial_extraction'), dict):
        cap = cap_by_sha.get(vr.get('source_captured_sha256')) or cap_by_url.get(vr.get('source_captured_url') or '')
        body = qnorm(cap['body']) if cap and cap['status'] == 'CONTENT_OK' else None
        same_bytes = bool(cap and cap.get('body_sha256') == vr.get('source_captured_sha256'))
        for f, fv in vr['initial_extraction']['fields'].items():
            if fv.get('status') not in ('SUPPORTED', 'CONFLICT'):
                continue
            q = qnorm(fv.get('quote'))
            qc = 'NO_FROZEN_SNAPSHOT' if body is None else ('QUOTE_TOO_SHORT' if len(q) < 15 else 'FOUND' if q in body else 'NOT_FOUND')
            if body is not None and same_bytes: qc += '_SAME_BYTES'
            elif body is not None: qc += '_OLDER_SNAPSHOT'
            quote_stats[qc] += 1
            lf, kind = V288_MAP.get(f, (None, 'none'))
            cmpres = compare(kind, (o_pr10 or {}).get(lf) if legacy and lf else None, fv.get('value')) if legacy and lf else 'NO_LEGACY_FIELD'
            add_prov(m, i, lf or f'v288_{f}', 'V288_FIRECRAWL_EXTRACTION_UNVERIFIED', fv.get('value'),
                     'CANDIDATE_NOT_VERIFIED_' + fv['status'], vr.get('source_captured_url'), vr.get('source_captured_sha256'),
                     as_of='2026-11-08', quote=fv.get('quote'), quote_check=qc, origin=vr['_ck'], comparison=cmpres)
            if fv['status'] == 'CONFLICT':
                add_conflict(m, i, lf or f, 'V288_EXTRACTION_CONFLICT', 'Modell meldet CONFLICT', (o_pr10 or {}).get(lf) if lf else None, fv.get('value'), vr['_ck'])
            elif cmpres in ('DIFFERENT', 'DIFFERENT_AMOUNT'):
                add_conflict(m, i, lf, 'V288_CANDIDATE_DIFFERS_FROM_ORIGINAL',
                             f'heuristischer Vergleich; Zitatprüfung={qc}; kein Write', (o_pr10 or {}).get(lf), fv.get('value'), vr['_ck'])
    if vr and vr.get('accepted'):
        for f, v in vr['accepted'].items():
            if f == 'access_ch' and not re.search(r'schweiz|swiss|switzerland|international|ch\b|teilnehm|zulass|offen|open|anmeld', v, re.I):
                add_conflict(m, i, 'access', 'V288_ACCEPTED_SEMANTIC_MISFIT',
                             'V288 «accepted» access_ch enthält keinen CH-Zugangsbeleg (wirkt wie Vorkenntnis)', (o_pr10 or {}).get('access'), v, vr['_ck'])
    offers_out.append(rec)

for o in pr10_offers.values():
    if o.get('sessions'):
        for s in o['sessions']:
            pass  # Sessions bleiben im Originalwert erhalten; separate Tabelle unten

# ---------- Fehlstellenreport ----------
miss = collections.Counter()
for rec in offers_out:
    for k, v in rec.items():
        if k.startswith('state_'): miss[(rec['market'], rec['cohort'], k[6:], v)] += 1

# ---------- SQLite ----------
db_path = OUT / 'mediaskills_master_view.sqlite'
if db_path.exists(): db_path.unlink()
db = sqlite3.connect(db_path)

def table(name, dicts, pk=None):
    cols = sorted({k for d in dicts for k in d}, key=lambda c: (c not in ('market', 'id'), c))
    db.execute(f'CREATE TABLE {name} ({", ".join(chr(34)+c+chr(34) for c in cols)}{", PRIMARY KEY("+pk+")" if pk else ""})')
    db.executemany(f'INSERT INTO {name} VALUES ({",".join("?"*len(cols))})',
                   [[d.get(c) if not isinstance(d.get(c), (dict, list)) else json.dumps(d.get(c), ensure_ascii=False) for c in cols] for d in dicts])
    return cols

offer_cols = table('offers', offers_out, 'market,id')
table('field_provenance', prov)
table('conflicts', conflicts)
table('protection_307', [dict(id=i, market=id2market[i][0], policy='ARCHIVE_NO_AUTO_RESCAN' if i in arc else 'QA09_FROZEN_RECONCILIATION_ONLY',
                              protectedB2_evt270=pb2.get(i, ''), sources='E4_ROLLUP' + ('+VOLLARCHIV_191' if i in vollarchiv else '') + ('+PR10_POLICY_B2' if i in pb2 else ''))
                         for i in sorted(protected)])
sessions = []
for layer, src in (('main', main_offers), ('pr10', pr10_offers)):
    for o in src.values():
        for n, s in enumerate(o.get('sessions') or []):
            sessions.append(dict(id=o['id'], layer=layer, seq=n, **{k: (json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else v) for k, v in s.items()}))
table('occurrences_legacy', sessions)
table('source_captures', [dict(url=c['url'], final_url=c.get('final_url'), status=c['status'], method=c.get('method'),
                               fetched_at=c.get('fetched_at'), body_sha256=c.get('body_sha256'), offer_ids=c.get('offer_ids'),
                               body=c.get('body') if c['status'] == 'CONTENT_OK' else None) for c in captures])
table('v288_source_decisions', [dict(country_id=s.get('country_id'), url=s.get('url'), operation=s.get('operation'), source_status=s['source_status'],
                                     checkpoint=s['_ck']) for s in src_ck])
table('missing_report', [dict(market=k[0], cohort=k[1], field=k[2], value_state=k[3], n=v) for k, v in sorted(miss.items())])
db.execute('CREATE INDEX fp_key ON field_provenance(market,id,field)')
db.execute('CREATE INDEX cf_key ON conflicts(market,id)')
db.commit(); db.close()

# ---------- CSV-Exporte ----------
def wcsv(name, dicts, cols=None):
    cols = cols or sorted({k for d in dicts for k in d}, key=lambda c: (c not in ('market', 'id'), c))
    with open(OUT / name, 'w', newline='', encoding='utf-8-sig') as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction='ignore'); w.writeheader(); w.writerows(dicts)

wcsv('master_offers_3818.csv', offers_out, offer_cols)
wcsv('field_provenance.csv', prov)
wcsv('conflicts.csv', conflicts)
wcsv('missing_report_by_market_field.csv', [dict(market=k[0], cohort=k[1], field=k[2], value_state=k[3], n=v) for k, v in sorted(miss.items())])

summary = dict(
    built_at=datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
    git=dict(main='5f09e0789c42eeceef0661c47434b87ba369927d', pr10='82bb95f948efe66075216c9a8e3e5b385697b546'),
    records=len(offers_out), by_market=dict(collections.Counter(r['market'] for r in offers_out)),
    occurrence_only=sum(r['occurrence_only'] for r in offers_out),
    protected_307=len(protected), protected_307_in_dataset=sum(r['protected_307'] for r in offers_out),
    protectedNoReopen_flags=sum(r['protectedNoReopen_flag'] for r in offers_out),
    approved_field_writes=0, gold_promotions=0,
    main_vs_pr10_offers_differing=sum(bool(r['main_vs_pr10_diff_fields']) for r in offers_out),
    provenance_rows=len(prov), provenance_by_layer=dict(collections.Counter(p['layer'] for p in prov)),
    conflicts=len(conflicts), conflicts_by_type=dict(collections.Counter(c['conflict_type'] for c in conflicts)),
    v288_quote_check=dict(quote_stats),
    input_sha256=INPUT_HASHES)
(OUT / 'BUILD_SUMMARY.json').write_text(json.dumps(summary, ensure_ascii=False, indent=1), encoding='utf-8')
print(json.dumps({k: v for k, v in summary.items() if k != 'input_sha256'}, ensure_ascii=False, indent=1))
