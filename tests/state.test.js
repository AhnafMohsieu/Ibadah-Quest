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

function makeFakeIDB() {
  const stores = {};
  return {
    open: () => {
      const req = { onsuccess: null, onerror: null, result: null };
      setTimeout(() => {
        req.result = {
          objectStoreNames: { contains: () => false },
          createObjectStore: (name) => { stores[name] = {}; return {}; },
          transaction: (name, mode) => {
            const store = stores[name] || {};
            return {
              objectStore: () => ({
                get: (key) => {
                  const r = { onsuccess: null, result: store[key] };
                  setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                  return r;
                },
                put: (val, key) => { store[key] = val; const r = { onsuccess: null }; setTimeout(() => r.onsuccess && r.onsuccess(), 0); return r; },
                delete: (key) => { delete store[key]; const r = { onsuccess: null }; setTimeout(() => r.onsuccess && r.onsuccess(), 0); return r; },
                getAllKeys: () => { const r = { onsuccess: null, result: Object.keys(store) }; setTimeout(() => r.onsuccess && r.onsuccess(), 0); return r; }
              })
            };
          }
        };
        if (req.onsuccess) req.onsuccess();
      }, 0);
      return req;
    },
    deleteDatabase: () => ({ onsuccess: null }),
    _stores: stores
  };
}

test('freshState includes muhWeek and journeys', () => {
  const { localStorage } = makeStore({});
  const sb = loadFile(path.join(__dirname, '..', 'state', 'state.js'), { localStorage });
  const p = sb.loadState();
  assert.strictEqual(p.muhWeek, '');
  assert.deepEqual(p.journeys, {});
});

test('loadState migrates into existing saves', () => {
  const old = JSON.stringify({ log: { '2026-08-03': { p: { Fajr: true }, d: {}, v: {} } }, xp: 500 });
  const { localStorage } = makeStore({ iq9_user_default: old });
  const sb = loadFile(path.join(__dirname, '..', 'state', 'state.js'), { localStorage });
  const p = sb.loadState();
  assert.strictEqual(p.muhWeek, '');
  assert.deepEqual(p.journeys, {});
  assert.strictEqual(p.xp, 500);
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
  const sb = loadFile(path.join(__dirname, '..', 'state', 'state.js'), { localStorage: ls, window: { Storage: fakeStorage } });
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
