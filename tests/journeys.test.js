'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

let toastCount = 0;
const journeySandbox = loadFile(path.join(__dirname, '..', 'features', 'journeys.js'), {
  S: { journeyStats: {} },
  toast: () => { toastCount++; },
  saveState: () => {}
});
const w = journeySandbox.window;

const fajrJourney = { id: 'fajr40', name: '40 Days of Fajr', icon: '', desc: '', kind: 'p', key: 'fajr', target: 40 };
const istighfarJourney = { id: 'istighfar40', name: '40 Days of Istighfar', icon: '', desc: '', kind: 'd', key: 'istighfar', target: 40 };

const log = {
  '2026-08-03': { p: { fajr: true }, d: { istighfar: true } },
  '2026-08-04': { p: {}, d: {} },
  '2026-08-05': { p: { fajr: true }, d: { istighfar: true } },
  '2026-08-06': { p: { fajr: true }, d: {} },
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

test('journeyProgress ignores days after the end date', () => {
  const extended = Object.assign({}, log, {
    '2026-08-08': { p: { fajr: true }, d: { istighfar: true } }
  });
  assert.strictEqual(w.journeyProgress(extended, fajrJourney, '2026-08-03', '2026-08-07'), 3);
  assert.strictEqual(w.journeyProgress(extended, istighfarJourney, '2026-08-03', '2026-08-07'), 3);
});

test('Fajr journey definitions use the lowercase prayer log key', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'data', 'journeys.js'), 'utf8');
  assert.match(source, /id: 'fajr7'[\s\S]*?key: 'fajr'/);
  assert.doesNotMatch(source, /id: 'fajr(?:7|21|40|90)'[\s\S]*?key: 'Fajr'/);
});

test('journey milestones are only announced once', () => {
  toastCount = 0;
  const journey = { id: 'fajr7', target: 7 };
  w.checkJourneyMilestone(journey, 2);
  w.checkJourneyMilestone(journey, 2);
  assert.strictEqual(toastCount, 1);
});
