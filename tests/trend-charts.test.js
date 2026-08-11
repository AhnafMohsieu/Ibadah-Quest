'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require(path.join(__dirname, 'helpers', 'load.js'));

const sandbox = loadFile(path.join(__dirname, '..', 'analytics', 'trend-charts.js'), {
  Analytics: {
    getPrayerStats: (days) => ({
      total: 10, possible: 15, rate: 67, fajrRate: 80,
      daily: [
        { date: '2026-08-01', count: 3, fajr: 1 },
        { date: '2026-08-02', count: 5, fajr: 1 },
        { date: '2026-08-03', count: 2, fajr: 0 }
      ]
    }),
    getXPStats: (days) => ({
      daily: [
        { date: '2026-08-01', cumulative: 100 },
        { date: '2026-08-02', cumulative: 250 },
        { date: '2026-08-03', cumulative: 400 }
      ]
    })
  },
  Charts: {
    createLine: () => {},
    createBar: () => {},
    destroyAll: () => {},
    COLORS: { primary: '#e11d48', bg: 'rgba(251,113,133,0.15)', accent: '#f43f5e' }
  },
  document: { getElementById: () => null }
});

const w = sandbox.window;

test('getPrayerTrend returns labels and values', () => {
  const result = w.getPrayerTrend(30);
  assert.ok(Array.isArray(result.labels), 'labels should be an array');
  assert.ok(Array.isArray(result.values), 'values should be an array');
  assert.strictEqual(result.labels.length, 3);
  assert.strictEqual(result.values.length, 3);
  assert.strictEqual(result.labels[0], '08-01');
  assert.strictEqual(result.values[0], 60);
  assert.strictEqual(result.values[1], 100);
  assert.strictEqual(result.values[2], 40);
});

test('getXPTrend returns labels and values', () => {
  const result = w.getXPTrend(30);
  assert.ok(Array.isArray(result.labels), 'labels should be an array');
  assert.ok(Array.isArray(result.values), 'values should be an array');
  assert.strictEqual(result.labels.length, 3);
  assert.strictEqual(result.values.length, 3);
  assert.strictEqual(result.labels[0], '08-01');
  assert.strictEqual(result.values[0], 100);
  assert.strictEqual(result.values[1], 250);
  assert.strictEqual(result.values[2], 400);
});

test('getPrayerTrend returns empty arrays when no data', () => {
  const emptySandbox = loadFile(path.join(__dirname, '..', 'analytics', 'trend-charts.js'), {
    Analytics: {
      getPrayerStats: () => ({ total: 0, possible: 0, rate: 0, fajrRate: 0, daily: [] }),
      getXPStats: () => ({ daily: [] })
    },
    Charts: { createLine: () => {}, createBar: () => {}, destroyAll: () => {}, COLORS: {} },
    document: { getElementById: () => null }
  });
  const result = emptySandbox.window.getPrayerTrend(30);
  assert.strictEqual(result.labels.length, 0);
  assert.strictEqual(result.values.length, 0);
});

test('renderTrendCharts does not throw when container missing', () => {
  assert.doesNotThrow(() => w.renderTrendCharts());
});

test('getPrayerTrend is exposed on window', () => {
  assert.strictEqual(typeof w.getPrayerTrend, 'function');
});

test('getXPTrend is exposed on window', () => {
  assert.strictEqual(typeof w.getXPTrend, 'function');
});

test('renderTrendCharts is exposed on window', () => {
  assert.strictEqual(typeof w.renderTrendCharts, 'function');
});
