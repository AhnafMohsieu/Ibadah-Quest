'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

test('showDailySummary shows once per day', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-summary.js'), {
    S: {
      log: { '2026-08-11': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } } },
      xp: 500,
      dq: [{ done: true }, { done: true }, { done: false }, { done: false }],
      cs: 7,
      lastDailySummary: null
    },
    today: () => '2026-08-11',
    toast: () => {},
    saveState: () => {},
    openToastModal: function(html) {
      var el = { innerHTML: html, style: {}, classList: { add: () => {} } };
      return el;
    },
    document: { getElementById: () => ({ innerHTML: '', style: {}, classList: { add: () => {} } }) }
  });

  sandbox.window.showDailySummary();
  assert.strictEqual(sandbox.S.lastDailySummary, '2026-08-11');
});

test('showDailySummary does not show twice same day', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-summary.js'), {
    S: {
      log: { '2026-08-11': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } } },
      xp: 500,
      dq: [{ done: true }, { done: true }, { done: false }, { done: false }],
      cs: 7,
      lastDailySummary: '2026-08-11'
    },
    today: () => '2026-08-11',
    toast: () => {},
    saveState: () => {},
    openToastModal: function(html) {
      var el = { innerHTML: html, style: {}, classList: { add: () => {} } };
      return el;
    },
    document: { getElementById: () => ({ innerHTML: '', style: {}, classList: { add: () => {} } }) }
  });

  sandbox.window.showDailySummary();
  assert.strictEqual(sandbox.S.lastDailySummary, '2026-08-11');
});
