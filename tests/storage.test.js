'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

function loadStorage() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'core', 'storage.js'), 'utf8');
  const sandbox = { window: {}, console, indexedDB: null };
  vm.runInNewContext(code, sandbox, { filename: 'storage.js' });
  return sandbox;
}

function makeFakeIDB() {
  const stores = {};
  return {
    open: () => {
      const req = { onsuccess: null, onerror: null, result: null };
      setTimeout(() => {
        const dbResult = {
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
                put: (val, key) => {
                  store[key] = val;
                  const r = { onsuccess: null };
                  setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                  return r;
                },
                delete: (key) => {
                  delete store[key];
                  const r = { onsuccess: null };
                  setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                  return r;
                },
                getAllKeys: () => {
                  const r = { onsuccess: null, result: Object.keys(store) };
                  setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                  return r;
                }
              })
            };
          }
        };
        req.result = dbResult;
        if (req.onupgradeneeded) req.onupgradeneeded({ target: req });
        if (req.onsuccess) req.onsuccess();
      }, 0);
      return req;
    },
    deleteDatabase: () => {
      const r = { onsuccess: null };
      setTimeout(() => r.onsuccess && r.onsuccess(), 0);
      return r;
    },
    _stores: stores
  };
}

test('Storage.init opens database', async () => {
  const fakeIDB = makeFakeIDB();
  const sb = loadStorage();
  sb.window.indexedDB = fakeIDB;
  const Storage = sb.window.Storage;
  await Storage.init();
  assert.ok(Storage, 'Storage is defined');
});

test('Storage.save and Storage.load round-trip', async () => {
  const fakeIDB = makeFakeIDB();
  const sb = loadStorage();
  sb.window.indexedDB = fakeIDB;
  const Storage = sb.window.Storage;
  await Storage.init();
  const state = { xp: 100, lv: 5, log: {} };
  await Storage.save('testuser', state);
  const loaded = await Storage.load('testuser');
  assert.deepStrictEqual(loaded, state);
});

test('Storage.load returns null for unknown user', async () => {
  const fakeIDB = makeFakeIDB();
  const sb = loadStorage();
  sb.window.indexedDB = fakeIDB;
  const Storage = sb.window.Storage;
  await Storage.init();
  const loaded = await Storage.load('nobody');
  assert.strictEqual(loaded, null);
});

test('Storage.migrate copies localStorage to IDB', async () => {
  const fakeIDB = makeFakeIDB();
  const lsData = { iq9_user_u1: JSON.stringify({ xp: 500, lv: 3, log: {} }) };
  const fakeLS = {
    getItem: (k) => lsData[k] || null,
    setItem: (k, v) => { lsData[k] = v; },
    removeItem: (k) => { delete lsData[k]; },
    key: (i) => Object.keys(lsData)[i] || null,
    get length() { return Object.keys(lsData).length; }
  };
  const sb = loadStorage();
  sb.window.indexedDB = fakeIDB;
  sb.window.localStorage = fakeLS;
  const Storage = sb.window.Storage;
  await Storage.init();
  const migrated = await Storage.migrate('u1');
  assert.deepEqual(migrated, { xp: 500, lv: 3, log: {}, _dbVersion: 1 });
  const loaded = await Storage.load('u1');
  assert.deepEqual(loaded, { xp: 500, lv: 3, log: {}, _dbVersion: 1 });
});

test('Storage.migrate returns null when no localStorage data', async () => {
  const fakeIDB = makeFakeIDB();
  const fakeLS = { getItem: () => null, setItem: () => {}, removeItem: () => {}, key: () => null, get length() { return 0; } };
  const sb = loadStorage();
  sb.window.indexedDB = fakeIDB;
  sb.window.localStorage = fakeLS;
  const Storage = sb.window.Storage;
  await Storage.init();
  const result = await Storage.migrate('nobody');
  assert.strictEqual(result, null);
});

test('Storage.destroy removes user data', async () => {
  const fakeIDB = makeFakeIDB();
  const sb = loadStorage();
  sb.window.indexedDB = fakeIDB;
  const Storage = sb.window.Storage;
  await Storage.init();
  await Storage.save('user1', { xp: 10 });
  await Storage.destroy('user1');
  const loaded = await Storage.load('user1');
  assert.strictEqual(loaded, null);
});

// --- Storage compaction tests ---

function makeCompactionSandbox() {
  const store = {};
  const sb = {
    window: {
      Storage: null,
      compactStorage: null,
      getStorageSize: null,
      S: { dhikrSessions: [], xpDaily: {} }
    },
    localStorage: {
      getItem(k) { return k in store ? store[k] : null; },
      setItem(k, v) { store[k] = String(v); },
      removeItem(k) { delete store[k]; },
      get length() { return Object.keys(store).length; },
      key(i) { return Object.keys(store)[i]; }
    }
  };
  sb.window.localStorage = sb.localStorage;
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, '..', 'core', 'storage.js'), 'utf8'),
    sb,
    { filename: 'storage.js' }
  );
  return sb;
}

test('compactDhikrSessions aggregates old entries', () => {
  const sb = makeCompactionSandbox();
  const now = Date.now();
  const day = 86400000;
  const sessions = [];
  for (let i = 0; i < 150; i++) {
    const dayOffset = 8 + (i % 10);
    sessions.push({ type: 'morning', count: 1, ts: now - dayOffset * day });
  }
  for (let i = 0; i < 50; i++) {
    sessions.push({ type: 'evening', count: 2, ts: now - i });
  }
  sb.window.S.dhikrSessions = sessions;
  sb.window.compactStorage();
  const result = sb.window.S.dhikrSessions;
  assert.ok(result.length < 200, 'should compact: ' + result.length);
  const recentCount = result.filter(s => s.ts >= now - 7 * day).length;
  assert.equal(recentCount, 50);
});

test('compactDhikrSessions skips if fewer than 100', () => {
  const sb = makeCompactionSandbox();
  sb.window.S.dhikrSessions = [{ type: 'morning', count: 1, ts: Date.now() }];
  const before = JSON.stringify(sb.window.S.dhikrSessions);
  sb.window.compactStorage();
  assert.equal(JSON.stringify(sb.window.S.dhikrSessions), before);
});

test('compactXpDaily keeps 14 days and archives older', () => {
  const sb = makeCompactionSandbox();
  const now = Date.now();
  const day = 86400000;
  const daily = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(now - i * day);
    const key = d.toISOString().slice(0, 10) + ':prayer:fajr';
    daily[key] = 5;
  }
  sb.window.S.xpDaily = daily;
  sb.window.compactStorage();
  const result = sb.window.S.xpDaily;
  assert.ok(result._archived > 0, 'should have archived XP');
  const kept = Object.keys(result).filter(k => !k.startsWith('_')).length;
  assert.ok(kept <= 14 * 2, 'should keep ~14 days: ' + kept);
});

test('getStorageSize returns positive number', () => {
  const sb = makeCompactionSandbox();
  sb.window.localStorage.setItem('iq9_user_test', '{"xp":100}');
  const size = sb.window.getStorageSize();
  assert.ok(size > 0);
});

test('compactStorage is idempotent', () => {
  const sb = makeCompactionSandbox();
  const now = Date.now();
  const day = 86400000;
  for (let i = 0; i < 200; i++) {
    sb.window.S.dhikrSessions.push({ type: 'a', count: 1, ts: now - (8 + (i % 5)) * day });
  }
  sb.window.compactStorage();
  const after1 = JSON.stringify(sb.window.S.dhikrSessions);
  sb.window.compactStorage();
  const after2 = JSON.stringify(sb.window.S.dhikrSessions);
  assert.equal(after1, after2);
});
