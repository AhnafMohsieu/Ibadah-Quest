'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function makeStore(initial) {
  const store = Object.assign({}, initial);
  return {
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = v; },
      removeItem: k => { delete store[k]; }
    }
  };
}

test('freshState includes muhWeek and journeys', () => {
  const { localStorage } = makeStore({});
  const sb = loadFile(path.join(__dirname, '..', 'state', 'state.js'), { localStorage });
  const p = sb.loadState();
  assert.strictEqual(p.muhWeek, '');
  assert.deepEqual(p.journeys, {});
});

test('loadState migrates muhWeek and journeys into existing saves', () => {
  const old = JSON.stringify({ log: { '2026-08-03': { p: { Fajr: true }, d: {}, v: {} } }, xp: 500 });
  const { localStorage } = makeStore({ iq9_user_default: old });
  const sb = loadFile(path.join(__dirname, '..', 'state', 'state.js'), { localStorage });
  const p = sb.loadState();
  assert.strictEqual(p.muhWeek, '');
  assert.deepEqual(p.journeys, {});
  assert.strictEqual(p.xp, 500);
});
