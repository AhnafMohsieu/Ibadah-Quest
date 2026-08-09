'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

const w = loadFile(path.join(__dirname, '..', 'features', 'muhasabah.js')).window;

const log = {
  '2026-08-03': { p: { Fajr: true, Dhuhr: true }, d: { istighfar: true } },
  '2026-08-04': { p: { Fajr: true }, d: {} },
  '2026-08-05': { p: {}, d: { charity: true } }
};

test('muhasabahMetrics counts prayers, days prayed, and deeds in the week window', () => {
  const m = w.muhasabahMetrics(log, '2026-08-03', '2026-08-05');
  assert.strictEqual(m.prayers, 3);
  assert.strictEqual(m.daysPrayed, 2);
  assert.strictEqual(m.deeds, 2);
});

test('computeDeedCounts counts each pool deed in the trailing window', () => {
  const counts = w.computeDeedCounts(log, ['charity', 'fasting', 'istighfar'], '2026-08-05', 14);
  assert.deepEqual(counts, [
    { id: 'charity', count: 1 },
    { id: 'fasting', count: 0 },
    { id: 'istighfar', count: 1 }
  ]);
});

test('pickSuggestion returns the lowest-count deed when it is 0 (ties resolve to pool order)', () => {
  const counts = w.computeDeedCounts(log, ['charity', 'fasting', 'istighfar'], '2026-08-05', 14);
  assert.deepEqual(w.pickSuggestion(counts), { id: 'fasting', count: 0 });
});

test('pickSuggestion returns null when every pool deed was logged', () => {
  const full = {
    '2026-08-03': { p: {}, d: { charity: true, fasting: true, istighfar: true } }
  };
  const counts = w.computeDeedCounts(full, ['charity', 'fasting', 'istighfar'], '2026-08-05', 14);
  assert.strictEqual(w.pickSuggestion(counts), null);
});

test('muhasabahHTML renders the hero line, list, and celebration fallback', () => {
  const html = w.muhasabahHTML({ prayers: 3, daysPrayed: 2, deeds: 2 }, null, 6);
  assert.ok(html.includes('Alhamdulillah, you prayed <b>3</b> prayers this week and kept a <b>6</b>-day streak.'));
  assert.ok(html.includes('Your garden is thriving — keep nourishing it.'));
});

test('muhasabahHTML renders the gentle suggestion when one is given', () => {
  const html = w.muhasabahHTML({ prayers: 3, daysPrayed: 2, deeds: 2 }, { icon: '', label: 'Charity' }, 6);
  assert.ok(html.includes('Perhaps next week, try dedicating a moment to  Charity.'));
});

test('computeDeedCounts window excludes deeds older than the trailing 14 days', () => {
  const log2 = {
    '2026-08-06': { p: {}, d: { charity: true } },
    '2026-08-07': { p: {}, d: { charity: true } },
    '2026-08-20': { p: {}, d: { fasting: true } }
  };
  const counts = w.computeDeedCounts(log2, ['charity', 'fasting'], '2026-08-20', 14);
  assert.deepEqual(counts, [
    { id: 'charity', count: 1 },
    { id: 'fasting', count: 1 }
  ]);
});

test('pickSuggestion returns the first pool deed when every count is zero', () => {
  const counts = w.computeDeedCounts({}, ['charity', 'fasting', 'istighfar'], '2026-08-05', 14);
  assert.deepEqual(w.pickSuggestion(counts), { id: 'charity', count: 0 });
});