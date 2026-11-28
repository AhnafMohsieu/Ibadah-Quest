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
  const sb = loadFile(path.join(__dirname, '..', 'core', 'state.js'), { localStorage });
  const p = sb.loadState();
  assert.strictEqual(p.muhWeek, '');
  assert.deepEqual(p.journeys, {});
});

test('loadState migrates into existing saves', () => {
  const old = JSON.stringify({ log: { '2026-08-03': { p: { Fajr: true }, d: {}, v: {} } }, xp: 500 });
  const { localStorage } = makeStore({ iq9_user_default: old });
  const sb = loadFile(path.join(__dirname, '..', 'core', 'state.js'), { localStorage });
  const p = sb.loadState();
  assert.strictEqual(p.muhWeek, '');
  assert.deepEqual(p.journeys, {});
  assert.strictEqual(p.xp, 500);
  assert.strictEqual(p.log['2026-08-03'].p.fajr, true);
  assert.strictEqual(p.log['2026-08-03'].p.Fajr, undefined);
  assert.strictEqual(p.schemaVersion, 2);
});

test('saveState writes to both IDB and localStorage', () => {
  const lsStore = {};
  const ls = {
    getItem: k => lsStore[k] || null,
    setItem: (k, v) => { lsStore[k] = v; },
    removeItem: k => { delete lsStore[k]; }
  };
  let idbSaved = null;
  const fakeStorage = {
    init: () => Promise.resolve(),
    load: () => Promise.resolve(null),
    save: (user, state) => { idbSaved = state; return Promise.resolve(); },
    migrate: () => Promise.resolve(null),
  };
  const sb = loadFile(path.join(__dirname, '..', 'core', 'state.js'), { localStorage: ls, window: { Storage: fakeStorage } });
  sb.window.Storage = fakeStorage;
  // Set S via the module
  sb.S = { xp: 42, lv: 2, log: {}, td: {}, vc: {} };
  sb.saveState();
  // Verify localStorage was written
  assert.ok(lsStore['iq9_user_default']);
  const saved = JSON.parse(lsStore['iq9_user_default']);
  assert.strictEqual(saved.xp, 42);
  // Verify IDB was written
  assert.deepStrictEqual(idbSaved, sb.S);
});

test('loadState preserves existing garden visibility and upgrades growthSettings cleanly', () => {
  const old = JSON.stringify({
    log: {}, xp: 100,
    growthSettings: { visible: ['garden', 'lantern'] }
  });
  const { localStorage } = makeStore({ iq9_user_default: old });
  const sb = loadFile(path.join(__dirname, '..', 'core', 'state.js'), { localStorage });
  const p = sb.loadState();
  assert.strictEqual(p.growthSettings.visible.length, 1);
  assert.strictEqual(p.growthSettings.visible[0], 'garden', 'normalizes simplified single spiritual garden');
});

test('loadStateAsync prefers IndexedDB when it has a saved state', async () => {
  let requestedUser = null;
  const fakeStorage = {
    load: async (user) => {
      requestedUser = user;
      return { xp: 900, log: {} };
    },
    save: async () => {}
  };
  const { localStorage } = makeStore({ iq9_user_default: JSON.stringify({ xp: 10 }) });
  const sb = loadFile(path.join(__dirname, '..', 'core', 'state.js'), {
    localStorage,
    window: { Storage: fakeStorage }
  });
  const p = await sb.window.loadStateAsync();
  assert.strictEqual(requestedUser, 'default');
  assert.strictEqual(p.xp, 900);
  assert.deepEqual(p.log, {});
});

test('normalizeState remaps retired tab ids to combined parents', () => {
  const cases = [
    ['purification', 'worship-rulings'],
    ['zakatrules', 'wealth-oaths'],
    ['ikhlas', 'virtues'],
    ['heart', 'vices-return'],
    ['manners', 'character-path'],
    ['family', 'family-life'],
    ['neighbors', 'community'],
    ['orphans2', 'service'],
    ['health', 'wellness'],
    ['finance', 'charity'],
    ['zakatcalc', 'charity'],
    ['gratitude', 'healthlog'],
    ['rewards', 'profile'],
    ['growth', 'progress']
  ];
  for (const [oldId, expected] of cases) {
    const old = JSON.stringify({ log: {}, lastTab: oldId, lastCat: 'creed' });
    const { localStorage } = makeStore({ iq9_user_default: old });
    const sb = loadFile(path.join(__dirname, '..', 'core', 'state.js'), { localStorage });
    const p = sb.loadState();
    assert.strictEqual(p.lastTab, expected, oldId + ' should remap to ' + expected);
    assert.strictEqual(p.lastCat, 'knowledge', 'lastCat creed/library should remap to knowledge');
  }
  for (const live of ['community', 'prophets', 'virtues', 'charity', 'healthlog']) {
    const old = JSON.stringify({ log: {}, lastTab: live, lastCat: 'worship' });
    const { localStorage } = makeStore({ iq9_user_default: old });
    const sb = loadFile(path.join(__dirname, '..', 'core', 'state.js'), { localStorage });
    const p = sb.loadState();
    assert.strictEqual(p.lastTab, live, 'live tab ' + live + ' must not be remapped');
  }
});

test('saveState surfaces quota failure via flag and event, does not throw', () => {
  const events = [];
  const quotaErr = Object.assign(new Error('full'), { name: 'QuotaExceededError' });
  const lsStore = {};
  const ls = {
    getItem: k => lsStore[k] || null,
    setItem: (k, v) => { throw quotaErr; },
    removeItem: k => { delete lsStore[k]; }
  };
  let listeners = {};
  const win = {
    Storage: { save: () => Promise.resolve() },
    dispatchEvent: (ev) => { events.push(ev.type); return true; },
    addEventListener: (t, fn) => { listeners[t] = fn; }
  };
  const sb = loadFile(path.join(__dirname, '..', 'core', 'state.js'), { localStorage: ls, window: win });
  sb.S = { xp: 1, lv: 1, log: {}, td: {}, vc: {} };
  sb.saveState();                       // must not throw
  assert.strictEqual(sb.window.__iqQuotaFailed, true);
  assert.deepStrictEqual(events, ['iq:quota']);
  sb.saveState();                       // second failure stays quiet
  assert.deepStrictEqual(events, ['iq:quota'], 'event fires once until re-armed');
  sb.window.__iqQuotaFailed = false;    // re-arm
  sb.saveState();
  assert.deepStrictEqual(events, ['iq:quota', 'iq:quota']);
});
