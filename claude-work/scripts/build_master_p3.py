#!/usr/bin/env python3
"""MediaSkills.ch – Master-Tabelle 3'818 market+id (Paket 3, 09.11.2026).

Nachfolger von build_master.py für Paket 3. Unterschied: Basis ist der Live-Stand (E035, E044), eingebracht über den
Dreiwege-Merge (merge3.py). build_master.py bleibt unverändert; es braucht die Teil-ZIPs aus Übergabe V4.1, die am
09.11. nicht ladbar waren (Drive-Connector-Limit 10 MB, ZIP 14,8 MB). Ersatzquelle: Arbeitskatalog-XLSX (gleiche
3'818 Zeilen, 307 Schutz-IDs, V288-Feldbelege) und R4-Publikationstabelle (Google Sheet, gleich wie PR10-Staging).

Je Feld: Wert («nicht erfasst», wenn leer oder Platzhalter, E036) + Herkunftscode h_<feld>.
Herkunftscodes: LIVE (unverändert seit Basis) · LIVE_GEAENDERT · MAIN (per Merge übernommen) · LIVE_OWNER_OFFEN
(Live-Wert vorläufig, Owner-Entscheid offen) · MAIN_OWNER / LIVE_OWNER (per Owner-Entscheid, Register E060–E064) ·
R4 (Owner-Publikation 15.09.) · KATALOG_XLSX · REGEL (abgeleitet, Regel in Spalte *_regel) · AUDIT (Beleg im Audit 28.10.) · LEER.
Keine Netzwerkaufrufe. Nichts wird erfunden.
Paket 4 (Owner-Grundsatzentscheide 09.11.2026): F1 Anbieterland nur mit Beleg (E065) · F2 CH-Durchführungsort = CH-Zugang JA
(E066) · F3 R4 archiviert/abgelaufen = nicht sichtbar bis Beleg (E067) · F4 ohne eindeutige URL = nicht sichtbar (E068) ·
F5 Sammelobjekte als Programm (E069) · F6 DJA-DE-Dubletten nicht sichtbar, Maricopa je Anbieter (E070, nur diese 5 Zeilen).

Aufruf: python3 -I build_master_p3.py --merge DIR --katalog XLSX --r4 JSON --usowner JSONL --stichtag YYYY-MM-DD --out DIR
"""
import argparse, csv, collections, gzip, hashlib, json, pathlib, re, unicodedata
import openpyxl

AP = argparse.ArgumentParser()
for a in ('merge', 'katalog', 'r4', 'usowner', 'stichtag', 'out'):
    AP.add_argument('--' + a, required=True)
A = AP.parse_args()
OUT = pathlib.Path(A.out); OUT.mkdir(parents=True, exist_ok=True)
HASH = {}
def rd(p):
    b = pathlib.Path(p).read_bytes(); HASH[str(p)] = hashlib.sha256(b).hexdigest(); return b

M = pathlib.Path(A.merge)
DATA = {o['id']: o for o in json.loads(rd(M / 'merge_kandidat_data.json'))}
SMART = json.loads(rd(M / 'merge_kandidat_smart.json'))['byId']
ENT = list(csv.DictReader(open(M / 'merge_feldentscheide.csv', encoding='utf-8-sig')))
rd(M / 'merge_feldentscheide.csv')
ENT_BY = {(e['datei'], e['id'], e['feld']): e for e in ENT}

wb = openpyxl.load_workbook(A.katalog, read_only=True); HASH[A.katalog] = hashlib.sha256(pathlib.Path(A.katalog).read_bytes()).hexdigest()
def sheet(n):
    r = list(wb[n].iter_rows(values_only=True)); return [dict(zip(r[0], x)) for x in r[1:]]
KAT = sheet('Katalog_3818'); GEP = {(r['Land'], r['Offer ID']): r for r in sheet('Geprueft_829')}
R4 = json.loads(rd(A.r4)); R4K = {(r['country'], r['record_id']): r for r in R4}
US = {}
for l in rd(A.usowner).decode('utf-8').strip().split('\n')[1:]:
    x = json.loads(l); US[x['record_id']] = x
STICHTAG = A.stichtag

# ---------- Invarianten ----------
keys = [(r['Land'], r['Offer ID']) for r in KAT]
assert len(keys) == len(set(keys)) == 3818
assert collections.Counter(k[0] for k in keys) == {'CH': 1223, 'AT': 124, 'LI': 5, 'DE': 111, 'USA': 2355}
legacy_keys = {k for k in keys if k[0] in ('CH', 'AT', 'LI')}
assert {k[1] for k in legacy_keys} == set(DATA) == set(SMART) and len(DATA) == 1352
staged = {k for k in keys if k[0] in ('DE', 'USA')}
assert staged <= set(R4K), 'DE/USA-Zeile fehlt in R4'
PROT = {r['Offer ID'] for r in KAT if r['Schutz 307'] == 'JA'}
assert len(PROT) == 307

SENT = re.compile(r'^(NOT_PUBLISHED|NICHT_PUBLIZIERT|NICHT_VERIFIZIERT\w*|PREIS_NICHT_PUBLIZIERT|NOT_IN_R4_SCHEMA|UNKNOWN|n/?a|-)$', re.I)
NE = 'nicht erfasst'
def anzeige(v):
    if v is None: return NE
    if isinstance(v, (list, dict)): return json.dumps(v, ensure_ascii=False) if v else NE
    s = str(v).strip()
    return NE if not s or SENT.match(s) else s

def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()

def norm_url(u):
    u = str(u or '').strip().lower()
    u = re.sub(r'^https?://', '', u); u = re.sub(r'^www\.', '', u); u = u.split('#')[0]
    u = re.sub(r'[?&](utm_[^=&]+|fbclid|gclid)=[^&]*', '', u)
    return u.rstrip('/?&')

# ---------- Objektklasse (E029) ----------
OBJ_REGELN = [
    ('DURCHFUEHRUNG', r'OCCURRENCE'),
    ('EVENT', r'CONFERENCE|CONVENTION|SUMMIT|SYMPOSIUM|CONVENING|HACKATHON|ROUNDTABLE|MEETING|PROFESSIONAL_DEVELOPMENT_DAY|^EVENT$|TRAINING_EVENT'),
    ('SERVICE', r'(^|_)FUND($|_)|CONSULTATION|(^|_)SERVICE|COACHING$'),
    ('UNKLAR_SAMMELOBJEKT', r'PARENT|FAMIL(Y|IES)|PACKAGE_AND_COMPONENTS|AND_CURRENT_COURSES|PROGRAMME_AND_CORE|ON_DEMAND_AND_STANDING|STANDING_TRAINING'),
    ('PROGRAMM', r'DEGREE|BACHELOR|MASTER|(^|_)(BA|BS|MS|MA|MFA|BFA|AA|AAS|AS|CP|BJ|BAJMC)($|_)|DOCTOR|ASSOCIATE|MAJOR|CONCENTRATION|EMPHASIS|TRACK|CERTIFICATE|DIPLOMA|'
                 r'CREDENTIAL|PROGRAM|ROUTE|FELLOWSHIP|INTERNSHIP|APPRENTICESHIP|ACADEMY|INSTITUTE|CAMP|(^|_)LAB($|_)|CURRICULUM|'
                 r'^STUDIUM$|LEHRGANG|^CAS$|^MAS$|^DAS$|STUDY_GROUP|ACCELERATOR|INCUBATOR|CORPS|NETWORK|COMMUNITY$'),
    ('STABLE_OFFER', r'COURSE|^KURS$|WORKSHOP|SEMINAR|WEBINAR|TRAINING|STABLE_OFFER|MODULE|LIBRARY|PRODUCT|SERIES|REPLAY|INTENSIVE|HEFAT|CERTIFICATION'),
]
def objektklasse(roh, rid=''):
    u = re.sub(r'[\s\-/]+', '_', str(roh or '').upper().strip())
    if rid.startswith('occ_'): return 'DURCHFUEHRUNG', 'ID occ_* (Occurrence-only, nicht promovierbar)'
    if u == 'KURS': return 'STABLE_OFFER', 'offerType KURS'
    for k, rx in OBJ_REGELN:
        if re.search(rx, u): return k, f'Muster {k}'
    return 'UNKLAR', 'kein Muster'

# ---------- Ort -> Land (E043, ISO-3166-1) ----------
# Je Land: Orte (Städte/Gemeinden), Institutionen (Ort nur indirekt) und Land/Region. Alle Muster mit Wortgrenzen
# (Prüfbefund 09.11.: «Klagenfurt» enthielt «genf»).
B = lambda *w: r'\b(?:' + '|'.join(w) + r')\b'
ORTE = {
    'CH': B('z[uü]rich', 'zurich', 'bern', 'basel', 'b[aâ]le', 'luzern', 'lucerne', 'gen[eè]ve', 'genf', 'geneva', 'lausanne', 'lugano', 'luganese',
            r'st\.? ?-?gallen', 'saint-gall', 'aarau', 'winterthur', 'wallisellen', 'baden', 'camorino', 'riazzino', 'chiasso', r'neuch[aâ]tel', 'sion',
            'olten', 'zug', 'chur', 'biel', 'thun', 'fribourg', 'freiburg', 'yverdon(?:-les-bains)?', 'montreux', 'vevey', 'sierre', 'bellinzona', 'locarno',
            'schaffhausen', 'frauenfeld', 'solothurn', 'uster', r'd[uü]bendorf', 'kloten', 'nyon', 'davos', 'stettlen', r'emmenbr[uü]cke', 'rotkreuz',
            'payerne', 'sainte-croix', 'vernier', 'luins', 'anzonico', 'faido', 'lumino', 'sonvico', 'magliaso', 'burgdorf', 'brugg', 'windisch',
            'monthey', r'm[uü]rren', r'sch[oö]nenwerd', 'buchs sg', 'looren'),
    'AT': B('wien', 'vienna', 'graz', 'salzburg', 'linz', 'innsbruck', 'klagenfurt', 'krems', r'st\.? ?p[oö]lten', 'dornbirn', 'eisenstadt', 'schwarzach',
            'wiener neustadt', r'm[oö]dling'),
    'LI': B('vaduz', 'schaan'),
    'DE': B('berlin', 'hamburg', r'm[uü]nchen', r'k[oö]ln', 'frankfurt', 'stuttgart', 'leipzig', 'dresden', r'd[uü]sseldorf', 'weeze'),
    'FR': B('paris', 'lyon', 'annemasse', 'annecy'),
    'BE': B(r'br[uü]ssel', 'brussels', 'louvain-la-neuve'), 'NO': B('oslo'), 'SE': B('stockholm'), 'PT': B('porto'),
}
INSTITUTION = {'CH': B('unil', 'epfl', 'zhaw', 'zhdk', 'uzh', 'eth', 'hes-so', 'toni-areal', 'predigerplatz', 'fhnw', 'hgk', 'hkb')}
LAND_REGION = {
    'CH': B('schweiz', 'suisse', 'svizzera', 'switzerland', 'ch', 'valais', 'wallis', 'tessin', 'ticino', 'romandie', 'suisse romande', 'ostschweiz',
            'vs', 'zh', 'vd', 'sg', 'vaud'),
    'AT': B(r'[oö]sterreich', 'oesterreich', 'austria', 'vorarlberg', 'tirol', r'k[aä]rnten', 'steiermark', r'ober[oö]sterreich'),
    'LI': B('liechtenstein'), 'DE': B('deutschland', 'germany'), 'FR': B('france', 'frankreich'), 'BE': B('belgien', 'belgium'),
    'NO': B('norway', 'norwegen'), 'SE': B('sweden', 'schweden'), 'PT': B('portugal'),
}
ONLINE = r'online|distance|virtu|livestream|live-?stream|zoom|teams|skype|e-?learning|selbstlern|on.?demand|remote|classe virtuelle|à distance'
UNSCHARF = (r'\boder\b|\bor\b|/|nach (vereinbarung|absprache|ausschreibung)|beim (kunden|auftraggeber|unternehmen)|je (durchf|session|nach)|'
            r'nicht (publiziert|bestätigt|ausgewiesen|separat)|not published|weitere|praxisorte|redaktionen|extern|\bzb\b|noch zu klären|on location|'
            r'auf anfrage|individuell|flexibel|client company|in azienda|varianten|standorte')
SYNONYM = [('zuerich', r'z[uü]rich|zurich'), ('genf', r'gen[eè]ve|genf|geneva'), ('basel', r'basel|b[aâ]le'), ('luzern', r'luzern|lucerne'),
           ('stgallen', r'st\.? ?-?gallen|saint-gall'), ('lugano', r'lugan'), ('wien', r'wien$|vienna'), ('fribourg', r'fribourg|freiburg'),
           ('neuchatel', r'neuch')]
def kanon(x):
    for name, rx in SYNONYM:
        if re.match(rx, x): return name
    return re.sub(r'[^a-z]', '', x)

def ort(region):
    """Ortstext -> (Land ISO-3166-1, Text, Sicherheitsgrad). Regel, kein Beleg."""
    s = str(region or '').strip()
    if not s or SENT.match(s): return NE, NE, 'NICHT_PUBLIZIERT'
    if re.fullmatch(r'ON_REQUEST\w*', s, re.I): return NE, s, 'AUF_ANFRAGE'
    t = s.lower(); onl = bool(re.search(ONLINE, t)); suf = '_MIT_ONLINE' if onl else ''
    staedte = {k: set(re.findall(rx, t)) for k, rx in ORTE.items()}
    inst = {k: bool(re.search(rx, t)) for k, rx in INSTITUTION.items()}
    reg = {k: bool(re.search(rx, t)) for k, rx in LAND_REGION.items()}
    laender = sorted({k for k, v in staedte.items() if v} | {k for k, v in inst.items() if v} | {k for k, v in reg.items() if v})
    if not laender: return (NE, s, 'NUR_ONLINE') if onl else (NE, s, 'UNKLAR_KEIN_LAND_ERKANNT')
    if len(laender) > 1: return '|'.join(laender), s, 'MEHRERE_LAENDER'
    k = laender[0]; n = len({kanon(x) for x in staedte.get(k, set())})
    if n == 0: grad = 'INSTITUTION_GENANNT' if inst.get(k) else 'NUR_LAND_ODER_REGION'
    elif n > 1: grad = 'MEHRERE_ORTE'
    else: grad = 'ORT_GENANNT'
    if grad in ('ORT_GENANNT', 'INSTITUTION_GENANNT') and re.search(UNSCHARF, t): grad = 'ORT_ALTERNATIV_ODER_UNSCHARF'
    return k, s, grad + suf

R4_KRITISCH = re.compile(r'ARCHIV|ELAPSED|CLOSED|SUPPRESS|ENDED|EXPIRED', re.I)
ISO = {'CH': 'CH', 'AT': 'AT', 'LI': 'LI', 'DE': 'DE', 'USA': 'US'}
COUNTRY_ROH = {'Schweiz': 'CH', 'Österreich': 'AT', 'Liechtenstein': 'LI', 'Frankreich': 'FR'}

def termin_status(o):
    ds = [s.get('endDate') or s.get('startDate') for s in (o.get('sessions') or []) if isinstance(s, dict)]
    ds += [o.get('endDate') or o.get('startDate')]
    ds = [d for d in ds if isinstance(d, str) and re.match(r'\d{4}-\d{2}-\d{2}', d)]
    if not ds: return 'OHNE_DATUM'
    return 'ZUKUENFTIG' if max(d[:10] for d in ds) >= STICHTAG else 'VERGANGEN'

# Owner-Dispositionen, die Sichtbarkeit sperren (E016, E017, E050)
DISPO = {'PCC-P32': ('NEIN', 'OUT_SCOPE (E016)'), 'PCC-P33': ('NEIN', 'ARCHIV (E017, E050)'), 'OFFER-CORSO-001': ('NEIN', 'ARCHIV (E017, E050)'),
         'OFFER-FERNUNI-002': ('NEIN', 'ARCHIV (E017, E050)'), 'OFFER-CFJM-008': ('NEIN', 'ARCHIV (E017, E050)'),
         'PCC-P08': ('NEIN', 'CH-HOLD ohne neuen identischen Termin (E017, E050)')}

FELDER = [  # master_spalte, data.js-Feld
    ('anbieter', 'provider'), ('titel', 'title'), ('beschreibung', 'description'), ('url', 'url'), ('sprache', 'language'),
    ('niveau', 'level'), ('fokus', 'focus'), ('angebotsart_roh', 'offerType'), ('format', 'format'), ('dauer', 'duration'),
    ('termin_text', 'start'), ('start_datum', 'startDate'), ('end_datum', 'endDate'), ('durchfuehrungen', 'sessions'),
    ('ort_text', 'region'), ('preis_text', 'priceDisplay'), ('preis_kategorie', 'priceCategory'), ('zugang_text', 'access'),
    ('publikationsstatus', 'publicationStatus'), ('publikationsgrund', 'publicationReason'), ('geprueft_am', 'approved'),
    ('pruefen_ab', 'reviewAfter'), ('release_herkunft', 'release_origin'), ('country_roh', 'country')]
SMART_FELDER = [('preis_parser_status', 'parserStatus'), ('preis_budgetfaehig', 'priceEligible'), ('preis_optionen', 'priceOptions'),
                ('lieferform', 'delivery')]

def herkunft(datei, i, f):
    e = ENT_BY.get((datei, i, f))
    if not e: return 'LIVE'
    if e['owner_entscheid_noetig'] == 'JA':
        if e['owner_status'] != 'ENTSCHIEDEN': return 'LIVE_OWNER_OFFEN'
        return 'MAIN_OWNER' if e['owner_entscheid'] == 'GITHUB' else 'LIVE_OWNER'
    return 'MAIN' if e['merge_wert_quelle'] == 'MAIN' else 'LIVE_GEAENDERT'

master, lang, objmap = [], [], collections.Counter()
def setf(rec, m, i, col, val, h, quelle):
    rec[col] = anzeige(val); rec['h_' + col] = h if anzeige(val) != NE else ('LEER' if h not in ('LIVE_OWNER_OFFEN',) else h)
    lang.append(dict(market=m, id=i, feld=col, wert_roh=None if val is None else val if isinstance(val, str) else json.dumps(val, ensure_ascii=False),
                     anzeige=rec[col], herkunft=h, quelle=quelle))

owner_ids = collections.defaultdict(set)
for e in ENT:
    if e['owner_status'] == 'OFFEN': owner_ids[e['id']].add(e['klasse'])

for r in KAT:
    m, i = r['Land'], r['Offer ID']; legacy = (m, i) in legacy_keys
    rec = dict(market=m, id=i, kohorte='WEBSITE_1352' if legacy else 'DE_USA_R4_2466')
    if legacy:
        o, s = DATA[i], SMART[i]
        for col, f in FELDER:
            setf(rec, m, i, col, o.get(f), herkunft('data', i, f), 'Merge-Kandidat data (Live-Basis)')
        for col, f in SMART_FELDER:
            v = s.get(f)
            if f == 'delivery' and isinstance(v, dict): v = v.get('evidenceTier')
            setf(rec, m, i, col, v, herkunft('smart', i, f), 'Merge-Kandidat smart (Live-Basis)')
        rec['lieferform_struktur'] = anzeige((s.get('delivery') or {}).get('structure'))
        for col in ('r4_aktualitaet', 'r4_scope', 'r4_quellenebene', 'r4_publikationsklasse', 'r4_release_status', 'r4_anbieter_id'):
            rec[col], rec['h_' + col] = NE, 'LEER'
        rec['us_owner_disposition'] = rec['us_owner_belegklasse'] = NE
        roh = o.get('offerType'); rid_country = o.get('country')
    else:
        x = R4K[(m, i)]
        for col, f in (('anbieter', 'provider'), ('titel', 'title'), ('url', 'source_url'), ('angebotsart_roh', 'object_type')):
            setf(rec, m, i, col, x.get(f), 'R4', 'R4 PUBLICATION_ROWS 15.09.2026 (Sheet 1s6nKTq5…)')
        for col, _ in FELDER + SMART_FELDER:
            if col not in rec: setf(rec, m, i, col, None, 'LEER', 'in R4 nicht geführt')
        rec['lieferform_struktur'] = NE
        for col, f in (('r4_aktualitaet', 'currentness'), ('r4_scope', 'scope'), ('r4_quellenebene', 'source_layer'),
                       ('r4_publikationsklasse', 'source_publication_class'), ('r4_release_status', 'release_status'), ('r4_anbieter_id', 'provider_id')):
            setf(rec, m, i, col, x.get(f), 'R4', 'R4 PUBLICATION_ROWS 15.09.2026')
        u = US.get(i) or {}
        rec['us_owner_disposition'] = anzeige(u.get('ownerDisposition')); rec['us_owner_belegklasse'] = anzeige(u.get('ownerEvidenceClass'))
        roh = x.get('object_type'); rid_country = None
    # Objektklasse
    k, regel = objektklasse(roh, i); objmap[(rec['kohorte'], str(roh), k)] += 1
    rec['sammelobjekt'] = 'JA' if k == 'UNKLAR_SAMMELOBJEKT' else 'NEIN'
    if k == 'UNKLAR_SAMMELOBJEKT': k, regel = 'PROGRAMM', regel + '; Sammelobjekt vorerst als Programm, Teilangebote später (E069)'
    rec['objektklasse'], rec['objektklasse_regel'], rec['h_objektklasse'] = k, regel, 'REGEL'
    # Vier-Felder-Modell (E043)
    rec['release_markt'] = ISO[m]; rec['h_release_markt'] = 'KATALOG_XLSX'
    if legacy and (i.startswith('OFFER-DJA-') or str(DATA[i].get('release_origin', '')).startswith('V105_DJA')):
        rec['anbieter_land'], rec['h_anbieter_land'] = 'DE', 'AUDIT'
        rec['anbieter_land_beleg'] = 'Anbietersitz Berlin laut End-to-End-Audit 28.10. WDA-02 (E043-Bemerkung)'
    else:
        rec['anbieter_land'], rec['h_anbieter_land'], rec['anbieter_land_beleg'] = NE, 'LEER', NE
    kand = COUNTRY_ROH.get(rid_country) if legacy else ISO[m]
    rec['anbieter_land_kandidat'] = kand or NE
    rec['anbieter_land_kandidat_quelle'] = ('Rohfeld country (mischt Markt/Sitz/Ort, E043) – ohne Beleg nicht übernommen (E065)' if legacy else
                                            'Recherchemarkt R4 – nicht übernommen') if kand else NE
    if legacy:
        land, txt, grad = ort(DATA[i].get('region'))
    else:
        land, txt, grad = NE, NE, 'NICHT_ERFASST'
    rec['durchfuehrungsort_land'], rec['durchfuehrungsort_sicherheit'] = land, grad
    rec['h_durchfuehrungsort_land'] = 'REGEL' if land != NE else 'LEER'
    if legacy and land == 'CH':
        rec['ch_zugang'], rec['h_ch_zugang'] = 'JA', 'REGEL'
        rec['ch_zugang_regel'] = f'Durchführungsort CH genannt (E066), Sicherheitsgrad Ort: {grad}'
    else:
        rec['ch_zugang'], rec['h_ch_zugang'], rec['ch_zugang_regel'] = NE, 'LEER', NE
    hinweise = []
    if legacy and 'Chiasso' in str(rid_country or ''): hinweise.append('Rohwert country: CH_ACCESS / operational presence Chiasso')
    if not legacy:
        a = R4K[(m, i)].get('access_status'); hinweise.append('R4 access_status: ' + (a or 'leer'))
        if US.get(i): hinweise.append('US-Owner accessEvidenceText: ' + str(US[i].get('accessEvidenceText')) + ' (laut Quelle kein CH-Zugangsbeweis)')
    rec['ch_zugang_hinweis'] = '; '.join(hinweise) or NE
    # Schutz
    rec['schutz_307'] = 'JA' if i in PROT else 'NEIN'
    # Status, Sichtbarkeit
    rec['termin_status_' + STICHTAG.replace('-', '')] = termin_status(DATA[i]) if legacy else NE
    oc = owner_ids.get(i, set())
    rec['owner_offen'] = '|'.join(sorted(oc)) if oc else ''
    if legacy:
        if i in DISPO: sb, gr = DISPO[i]
        elif DATA[i].get('publicationStatus') == 'HOLD' and herkunft('data', i, 'publicationStatus') == 'MAIN_OWNER':
            sb, gr = 'NEIN', 'HOLD aus main übernommen (E063): Folgetermin bzw. Aktualität in Nachrecherche'
        elif DATA[i].get('publicationStatus') == 'HOLD': sb, gr = 'NEIN', 'HOLD (publicationStatus)'
        elif 'HOLD_SPERRE' in oc: sb, gr = 'OFFEN_OWNER', 'HOLD aus main, live ohne Sperre – Owner-Entscheid'
        else: sb, gr = 'JA', 'Release 30.09. (E007)'
    else:
        x = R4K[(m, i)]
        if R4_KRITISCH.search(x['currentness'] or ''):
            sb, gr = 'NEIN', f"R4 currentness «{x['currentness']}»: archiviert/abgelaufen/geschlossen – archiviert bis Beleg (E067)"
        elif not r['Offizielle URL']:
            sb, gr = 'NEIN', 'Keine eindeutige Angebots-URL (Katalog ohne offizielle URL; R4-Quellenfeld mit mehreren URLs/Text): nicht sichtbar bis URL bestimmt (E068)'
        else:
            sb, gr = 'JA', 'Beta mit DE/USA (E036)'
    rec['beta_sichtbar'], rec['beta_grund'] = sb, gr
    rec['url_identitaet'] = 'OFFEN' if not r['Offizielle URL'] else 'EINDEUTIG'
    rec['h_url_identitaet'] = 'KATALOG_XLSX'
    g = GEP.get((m, i)); rec['v288_geprueft'] = 'JA' if g else 'NEIN'; rec['v288_resultat'] = (g or {}).get('Resultat') or NE
    rec['gold'] = 'NEIN'
    master.append(rec)

# ---------- Deduplizierung DE/USA vor Aufnahme (E008, E003) ----------
bestand = collections.defaultdict(list)
for rec in master:
    if rec['kohorte'] == 'WEBSITE_1352':
        bestand[('url', norm_url(DATA[rec['id']].get('url')))].append(rec['id'])
        bestand[('pt', norm(DATA[rec['id']].get('provider')) + '|' + norm(DATA[rec['id']].get('title')))].append(rec['id'])
        bestand[('t', norm(DATA[rec['id']].get('title')))].append(rec['id'])
for x in R4:
    if x['country'] in ('FR', 'IT'):
        bestand[('url', norm_url(x['source_url']))].append(f"{x['country']}:{x['record_id']}")
        bestand[('pt', norm(x['provider']) + '|' + norm(x['title']))].append(f"{x['country']}:{x['record_id']}")
# Owner-Entscheid E070: gilt nur für genau diese 5 Verdachtsfälle; neue Verdachtsfälle bleiben offen.
F6 = {('DE', 'V112-47'): ('VERDACHT_BESTAND_ANBIETER_TITEL', 'OFFER-DJA-012', 'DUBLETTE_BESTAND_OWNER'),
      ('DE', 'V112-48'): ('VERDACHT_BESTAND_ANBIETER_TITEL', 'OFFER-DJA-010', 'DUBLETTE_BESTAND_OWNER'),
      ('USA', 'USR-785'): ('VERDACHT_INTERN_GLEICHES_PROGRAMM_ANDERER_ANBIETER', None, 'EIGENSTAENDIG_ANDERER_ANBIETER_OWNER'),
      ('USA', 'USR-788'): ('VERDACHT_INTERN_GLEICHES_PROGRAMM_ANDERER_ANBIETER', None, 'EIGENSTAENDIG_ANDERER_ANBIETER_OWNER'),
      ('USA', 'USR-793'): ('VERDACHT_INTERN_GLEICHES_PROGRAMM_ANDERER_ANBIETER', None, 'EIGENSTAENDIG_ANDERER_ANBIETER_OWNER')}
F6_GENUTZT = set()
dedupe, gesehen = [], {}
for rec in master:
    if rec['kohorte'] != 'DE_USA_R4_2466': rec['dedupe_status'] = 'BESTAND'; continue
    x = R4K[(rec['market'], rec['id'])]; u, pt = norm_url(x['source_url']), norm(x['provider']) + '|' + norm(x['title'])
    hu, hpt = bestand.get(('url', u), []), bestand.get(('pt', pt), [])
    st, ref = 'EINDEUTIG', ''
    if set(hu) & set(hpt): st, ref = 'DUBLETTE_BESTAND', '|'.join(sorted(set(hu) & set(hpt)))
    elif hpt: st, ref = 'VERDACHT_BESTAND_ANBIETER_TITEL', '|'.join(hpt)
    elif hu: st, ref = 'VERDACHT_BESTAND_URL', '|'.join(hu)
    elif (u, norm(x['title']), norm(x['provider'])) in gesehen: st, ref = 'DUBLETTE_INTERN_URL_TITEL_ANBIETER', gesehen[(u, norm(x['title']), norm(x['provider']))]
    elif (u, norm(x['title'])) in gesehen:  # gleiches Programm, anderer Anbieter (z. B. Bezirksprogramm an mehreren Colleges): E029, nicht still verwerfen
        st, ref = 'VERDACHT_INTERN_GLEICHES_PROGRAMM_ANDERER_ANBIETER', gesehen[(u, norm(x['title']))]
    gesehen.setdefault((u, norm(x['title']), norm(x['provider'])), f"{rec['market']}:{rec['id']}")
    gesehen.setdefault((u, norm(x['title'])), f"{rec['market']}:{rec['id']}")
    erkannt = st
    f6 = F6.get((rec['market'], rec['id']))
    if f6:
        assert f6[0] == st and (f6[1] is None or f6[1] == ref), f'E070-Fall verändert: {rec["id"]} {st} {ref}'
        st = f6[2]; F6_GENUTZT.add((rec['market'], rec['id']))
    rec['dedupe_status'], rec['dedupe_referenz'] = st, ref
    vorher = '' if rec['beta_sichtbar'] == 'JA' else ' | zusätzlich: ' + rec['beta_grund']
    if st.startswith('DUBLETTE'): rec['beta_sichtbar'], rec['beta_grund'] = 'NEIN', f'{st} → {ref} (E008, E029' + (', E070' if f6 else '') + ')' + vorher
    elif st.startswith('VERDACHT'): rec['beta_sichtbar'], rec['beta_grund'] = 'OFFEN_DEDUPE', f'{st} → {ref} (E008)' + vorher
    if st != 'EINDEUTIG': dedupe.append(dict(market=rec['market'], id=rec['id'], anbieter=x['provider'], titel=x['title'], url=x['source_url'],
                                             status=st, referenz=ref, erkannt=erkannt, owner_entscheid='E070' if f6 else ''))
assert F6_GENUTZT == set(F6), f'E070-Fälle nicht gefunden: {set(F6) - F6_GENUTZT}'

# ---------- Ausgaben ----------
cols = []
for rec in master:
    for k in rec:
        if k not in cols: cols.append(k)
def wcsv(name, rows, cols=None, gz=False):
    cols = cols or (list(rows[0]) if rows else ['leer'])
    op = (lambda p: gzip.open(p, 'wt', newline='', encoding='utf-8')) if gz else (lambda p: open(p, 'w', newline='', encoding='utf-8-sig'))
    with op(OUT / name) as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction='ignore', restval=''); w.writeheader(); w.writerows(rows)
wcsv('master_3818.csv', master, cols)
wcsv('master_herkunft_lang.csv.gz', lang, gz=True)
wcsv('dedupe_de_usa.csv', dedupe)
wcsv('objektklassen_zuordnung.csv', [dict(kohorte=k[0], typ_roh=k[1], objektklasse=k[2], anzahl=n) for k, n in sorted(objmap.items(), key=lambda x: (-x[1], x[0]))])
C = collections.Counter
zus = dict(stichtag=STICHTAG, zeilen=len(master), markt=dict(C(r['market'] for r in master)),
           objektklasse=dict(C(r['objektklasse'] for r in master)), sammelobjekte=sum(r['sammelobjekt'] == 'JA' for r in master),
           objektklasse_je_kohorte={k: dict(C(r['objektklasse'] for r in master if r['kohorte'] == k)) for k in ('WEBSITE_1352', 'DE_USA_R4_2466')},
           beta_sichtbar=dict(C(r['beta_sichtbar'] for r in master)), dedupe=dict(C(r['dedupe_status'] for r in master)),
           durchfuehrungsort_land=dict(C(r['durchfuehrungsort_land'] for r in master if r['kohorte'] == 'WEBSITE_1352')),
           durchfuehrungsort_sicherheit=dict(C(r['durchfuehrungsort_sicherheit'] for r in master)),
           anbieter_land=dict(C(r['anbieter_land'] for r in master)), ch_zugang=dict(C(r['ch_zugang'] for r in master)),
           schutz_307=sum(r['schutz_307'] == 'JA' for r in master), owner_offen_angebote=sum(bool(r['owner_offen']) for r in master),
           termin_status=dict(C(r['termin_status_' + STICHTAG.replace('-', '')] for r in master if r['kohorte'] == 'WEBSITE_1352')),
           nicht_erfasst_je_feld={c: sum(r.get(c) == NE for r in master) for c, _ in FELDER + SMART_FELDER},
           herkunft_je_code=dict(C(v for r in master for k, v in r.items() if k.startswith('h_'))),
           gold=0, freigegebene_writes=0, eingaben_sha256=HASH)
(OUT / 'MASTER_SUMMARY.json').write_text(json.dumps(zus, ensure_ascii=False, indent=1), 'utf-8')
print(json.dumps({k: v for k, v in zus.items() if k not in ('eingaben_sha256', 'nicht_erfasst_je_feld')}, ensure_ascii=False, indent=1))
