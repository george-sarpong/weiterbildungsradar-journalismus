'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const src = fs.readFileSync('app.js', 'utf8');
const extract = (left, right) => {
  const a = src.indexOf(left), b = src.indexOf(right, a + left.length);
  assert(a !== -1 && b > a, 'Source extraction boundary changed: ' + left);
  return src.slice(a, b);
};
const code = extract('  const labels =', '  const preferredOrder =')
  + extract('  const SMART_FREE_TOKEN_RE', '  const smartHaystack =')
  + extract('  const smartHaystack =', '  const getSmartRecord =')
  + extract('  const unappliedSmartConstraints =', '  let smartResultState =');
const normalize = v => String(v ?? '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('de-CH');
const api = new Function('normalize', code
  + 'return {parseSmartQuery,topicMatch,unappliedSmartConstraints};')(normalize);
const raw = fs.readFileSync('data.js', 'utf8');
const roster = JSON.parse(raw.slice(raw.indexOf('=') + 1).trim().replace(/;\s*$/, ''));
assert.equal(roster.length, 1352, 'Runtime roster drift');
const cases = [
  ['Datenjournalismus maximal zwei Tage', 'datenjournalismus', 'MAX', false],
  ['Ich habe höchstens zwei Tage Zeit für Videoproduktion', 'videoproduktion', 'MAX', false],
  ['Datenjournalismus höchstens zwei Unterrichtstage', 'datenjournalismus', 'MAX', false],
  ['Datenjournalismus in zwei Tagen fertig sein', 'datenjournalismus', 'UNSPECIFIED', false],
  ['Datenjournalismus in einem Tag abschliessen', 'datenjournalismus', 'UNSPECIFIED', false],
  ['Datenjournalismus maximal 16 Stunden inklusive Übungen', 'datenjournalismus', 'MAX', false],
  ['Datenjournalismus zwei Freitage in drei Wochen', 'datenjournalismus', 'UNSPECIFIED', false],
  ['Datenjournalismus vier Abende zu je zwei Stunden', 'datenjournalismus', 'UNSPECIFIED', false],
  ['Datenjournalismus maximal zwei Tage aber 20 Stunden Pflicht-Selbststudium', 'datenjournalismus', 'MAX', false],
  ['Datenjournalismus mit maximal zwei aufeinanderfolgenden Tagen', 'datenjournalismus', 'MAX', false],
  ['Datenjournalismus mindestens zwei Tage', 'datenjournalismus', 'MIN', false],
  ['Datenjournalismus mehr als zwei Tage', 'datenjournalismus', 'MIN', false],
  ['Datenjournalismus länger als zwei Tage', 'datenjournalismus', 'MIN', false],
  ['Datenjournalismus nur abends nach Feierabend', 'datenjournalismus', 'UNSPECIFIED', false],
  ['Datenjournalismus Dienstag und Mittwoch Abend', 'datenjournalismus', 'UNSPECIFIED', false],
  ['Keine kostenlosen Kurse maximal 2 Tage', '', 'MAX', true],
  ['Keine Gratisangebote maximal zwei Tage', '', 'MAX', true],
  ['Datenjournalismus ohne Gratisangebote', 'datenjournalismus', null, true],
  ['Datenjournalismus nur kostenpflichtige Angebote', 'datenjournalismus', null, true],
  ['Datenjournalismus keine Kurse die gratis sind', 'datenjournalismus', null, true],
  ['Ich suche keine kostenlosen Kurse zu KI', 'ki', null, true],
  ['Datenjournalismus nur kostenlose Kurse', 'datenjournalismus', null, false],
  ['Datenjournalismus und Datenvisualisierung', 'datenjournalismus,datenvisualisierung', null, false],
  ['Recherche über zwei Tage Proteste', 'recherche,uber,zwei,proteste', null, false],
  ['Artikel über zwei Tage Krieg', 'artikel,uber,zwei,krieg', null, false],
  ['Datenjournalismus unter CHF 800', 'datenjournalismus', null, false]
];
for (const [query, tokens, comp, excluded] of cases) {
  const parsed = api.parseSmartQuery(query);
  assert.equal(parsed.tokens.join(','), tokens, 'Topic changed: ' + query);
  assert.equal(parsed.excludesFree, excluded, 'Negation changed: ' + query);
  assert(!excluded || !parsed.freeOnly, 'Negation became only-free: ' + query);
  if (comp) {
    assert(parsed.durationClauses.some(c => c.comparator === comp),
      'Comparator missed: ' + query);
    assert(api.unappliedSmartConstraints(parsed).includes('Nicht angewendet:'),
      'No honest warning for ' + query);
  } else assert.equal(parsed.durationClauses.length, 0, 'False time request: ' + query);
}
const topicCount = q => roster.filter(o => api.topicMatch(o, api.parseSmartQuery(q)).match).length;
assert.equal(topicCount('Datenjournalismus'), 12);
assert.equal(topicCount('Datenjournalismus höchstens zwei Unterrichtstage'), 12);
assert.equal(topicCount('Datenjournalismus in zwei Tagen fertig sein'), 12);
assert.equal(topicCount('Datenjournalismus ohne Gratisangebote'), 12);
assert.equal(topicCount('Datenjournalismus und Datenvisualisierung'), 2);
const max = api.parseSmartQuery('Ich habe höchstens zwei Tage Zeit für Videoproduktion');
assert.equal(max.maxDays, 2);
assert(api.unappliedSmartConstraints(max).includes('die gewünschte Höchstdauer'));
const min = api.parseSmartQuery('Datenjournalismus mindestens zwei Tage');
assert.equal(min.maxDays, null);
assert(!api.unappliedSmartConstraints(min).includes('gewünschte Höchstdauer'));
const free = api.parseSmartQuery('Datenjournalismus nur kostenlose Kurse');
assert(free.freeOnly && !free.excludesFree);
console.log('SMART_P0_SEMANTIC_INTENTS_PASS ' + cases.length + '/' + cases.length);
console.log('SMART_P0_TOPIC_ROSTER_PASS 1352 rows; baseline 12');