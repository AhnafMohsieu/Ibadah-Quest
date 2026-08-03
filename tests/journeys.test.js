'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

const w = loadFile(path.join(__dirname, '..', 'features', 'journeys.js')).window;

const fajrJourney = { id: 'fajr40', name: '40 Days of Fajr', icon: '🕌', desc: '', kind: 'p', key: 'Fajr', target: 40 };
const istighfarJourney = { id: 'istighfar40', name: '40 Days of Istighfar', icon: '🤍', desc: '', kind: 'd', key: 'istighfar', target: 40 };

const log = {
  '2026-08-03': { p: { Fajr: true }, d: { istighfar: true } },
  '2026-08-04': { p: {}, d: {} },
  '2026-08-05': { p: { Fajr: true }, d: { istighfar: true } },
  '2026-08-06': { p: { Fajr: true }, d: {} },
  '2026-08-07': { p: { Dhuhr: true }, d: { istighfar: true } }
};

test('journeyProgress counts only days where the mapped log key is present', () => {
  assert.strictEqual(w.journeyProgress(log, fajrJourney, '2026-08-03', '2026-08-07'), 3);
  assert.strictEqual(w.journeyProgress(log, istighfarJourney, '2026-08-03', '2026-08-07'), 3);
});

test('journeyProgress ignores days before the start date', () => {
  assert.strictEqual(w.journeyProgress(log, fajrJourney, '2026-08-05', '2026-08-07'), 2);
});

test('gridHTML has 40 cells and fills only the first N', () => {
  const html = w.gridHTML(3, 40);
  assert.strictEqual((html.match(/journey-cell/g) || []).length, 40);
  assert.strictEqual((html.match(/journey-cell filled/g) || []).length, 3);
});

test('journeyStart sets the start date once and never overwrites', () => {
  const s1 = w.journeyStart({ journeys: {} }, 'fajr40', '2026-08-03');
  assert.strictEqual(s1.journeys.fajr40, '2026-08-03');
  const s2 = w.journeyStart(s1, 'fajr40', '2026-09-01');
  assert.strictEqual(s2.journeys.fajr40, '2026-08-03');
});
