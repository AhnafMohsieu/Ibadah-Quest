// tests/core-esm.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');

test('freshState backfills + xp pipeline is pure', async () => {
  const { freshState, normalizeState } = await import('../src/core/state.js');
  const { applyXpDelta, spendXp } = await import('../src/core/xp.js');
  const d = freshState('2026-09-07');
  assert.equal(d.schemaVersion, 2);
  assert.equal(d.xp, 0);
  const normalized = normalizeState({ xp: 5 });
  assert.equal(normalized.lv, 1);
  assert.ok('schemaVersion' in normalized);
  const S = freshState('2026-09-07');
  const r = applyXpDelta(S, 10, { skipLevelToast: true });
  assert.equal(S.xp, 10);
  assert.equal(r.leveledUp, false); // xpFor(2) = 282, so +10 stays level 1
  spendXp(S, 4, { skipLevelToast: true });
  assert.equal(S.xp, 6);
});

test('freshState has full legacy parity + normalize extras', async () => {
  const { freshState, normalizeState } = await import('../src/core/state.js');
  const fs = require('node:fs');
  const vm = require('node:vm');
  const path = require('node:path');
  // Execute the real legacy module in a sandbox and diff key sets — no
  // hand-maintained list to rot, no regex heuristics over nested keys.
  const code = fs.readFileSync(path.join(__dirname, '..', 'state', 'state.js'), 'utf8');
  const sandbox = {
    window: {},
    console,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'state/state.js' });
  const legacyKeys = Object.keys(sandbox.window.freshState());
  const d = freshState('2026-09-07');
  const missing = legacyKeys.filter((k) => !(k in d));
  assert.deepEqual(missing, []);
  // Legacy extras: growthSettings merge, lastActiveDate migration, day repair.
  const g = normalizeState({ growthSettings: { visible: ['garden'] } });
  assert.ok(g.growthSettings.visible.includes('garden'));
  assert.ok(g.growthSettings.visible.includes('lantern'));
  const l = normalizeState({ lastActiveDate: '2026-09-06', lad: '2026-09-05' });
  assert.equal(l.lad, '2026-09-06');
  assert.ok(!('lastActiveDate' in l));
  const r = normalizeState({ log: { '2026-09-07': null, '2026-09-06': { p: { fajr: true } } } });
  assert.deepEqual(r.log['2026-09-07'], { p: {}, d: {}, v: {} });
  assert.deepEqual(r.log['2026-09-06'].d, {});
});

test('storage quarantines junk and null literals, saves without IDB', async () => {
  const { loadState, saveState } = await import('../src/core/storage.js');
  const { freshState } = await import('../src/core/state.js');
  const store = {};
  globalThis.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    key: (i) => Object.keys(store)[i],
    get length() { return Object.keys(store).length; }
  };
  try {
    store['iq9_user_u'] = '{corrupt!!!';
    const s1 = loadState('u');
    assert.equal(s1.schemaVersion, 2);
    assert.ok(Object.keys(store).some((k) => k.startsWith('iq9_quarantine_u_')));
    store['iq9_user_v'] = 'null';
    const s2 = loadState('v');
    assert.equal(s2.schemaVersion, 2);
    assert.ok(Object.keys(store).some((k) => k.startsWith('iq9_quarantine_v_')));
    store['iq9_user_w'] = JSON.stringify([1, 2, 3]);
    const s3 = loadState('w');
    assert.equal(s3.schemaVersion, 2);
    // saveState works with no indexedDB and never throws.
    saveState('u', freshState('2026-09-07'));
    assert.ok(JSON.parse(store['iq9_user_u']).log['2026-09-07']);
  } finally {
    delete globalThis.localStorage;
  }
});
