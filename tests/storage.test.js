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
