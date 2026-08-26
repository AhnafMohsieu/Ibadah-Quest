'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function loadStateModule() {
  return loadFile(path.join(__dirname, '..', 'state', 'state.js'), {
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    }
  });
}

test('getTodayKey returns YYYY-MM-DD local date', () => {
  const sb = loadStateModule();
  const key = sb.window.getTodayKey();
  assert.match(key, /^\d{4}-\d{2}-\d{2}$/);
  const now = new Date();
  const expected = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
  assert.strictEqual(key, expected);
});

test('getYesterdayKey returns previous day local date', () => {
  const sb = loadStateModule();
  const key = sb.window.getYesterdayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const expected = yesterday.getFullYear() + '-' + String(yesterday.getMonth()+1).padStart(2,'0') + '-' + String(yesterday.getDate()).padStart(2,'0');
  assert.strictEqual(key, expected);
});

test('getWeekAgoKey returns 7 days ago local date', () => {
  const sb = loadStateModule();
  const key = sb.window.getWeekAgoKey();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const expected = weekAgo.getFullYear() + '-' + String(weekAgo.getMonth()+1).padStart(2,'0') + '-' + weekAgo.getDate().toString().padStart(2,'0');
  assert.strictEqual(key, expected);
});

test('milestone keys follow LOCAL date, not UTC (UTC+6 scenario)', () => {
  class FixedDate extends Date {
    constructor(...a) {
      if (a.length === 0) {
        super(1786824000000);
      } else {
        super(...a);
      }
    }
    toISOString() { return super.toISOString(); }
  }

  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'streak-milestones.js'), {
    Date: FixedDate,
    S: {
      cs: 0, bs: 0, xp: 0, milestones: [],
      lastWeeklySummary: null
    },
    getTodayKey: function() {
      var d = new FixedDate();
      return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0');
    },
    lvFrom: () => 1,
    toast: () => {},
    openToastModal: () => null,
    saveState: () => {},
    applyXpDelta: () => {}
  });

  sandbox.window.showWeeklySummary();

  const expectedKey = '2026-08-16';
  const stored = sandbox.S.lastWeeklySummary;
  assert.strictEqual(stored, expectedKey,
    `Expected local date key '${expectedKey}' but got '${stored}' — UTC mismatch`);
});

test('getTodayKey, getYesterdayKey, getWeekAgoKey are exported on window', () => {
  const sb = loadStateModule();
  assert.strictEqual(typeof sb.window.getTodayKey, 'function');
  assert.strictEqual(typeof sb.window.getYesterdayKey, 'function');
  assert.strictEqual(typeof sb.window.getWeekAgoKey, 'function');
});
