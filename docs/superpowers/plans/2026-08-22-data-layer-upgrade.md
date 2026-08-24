# Data Layer Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace localStorage as the primary storage engine with IndexedDB, keeping localStorage as a read-only fallback for existing users.

**Architecture:** Introduce `core/storage.js` — a thin async IndexedDB wrapper. Modify `state/state.js` to load from IDB on init and save to IDB on each `saveState()` call. Migration runs automatically on first load for existing users.

**Tech Stack:** Raw IndexedDB API (no external libraries). Node.js built-in test runner with vm sandbox.

## Global Constraints

- No external dependencies — raw IndexedDB API only
- `S` global stays synchronous (loaded at init, saved on each action)
- `saveState()` remains a synchronous global callable from anywhere
- `freshState()` shape is unchanged
- localStorage keys outside the main blob (`iqTheme`, `iq9_prayer_times`, etc.) are NOT migrated
- All existing tests must pass after each task

---

### Task 1: Create `core/storage.js` with IndexedDB init and basic CRUD

**Files:**
- Create: `core/storage.js`
- Create: `tests/storage.test.js`

**Interfaces:**
- Consumes: nothing (greenfield)
- Produces: `Storage.init()`, `Storage.load(user)`, `Storage.save(user, state)` — all async, all on `window.Storage`

- [ ] **Step 1: Write failing tests for Storage.init, load, save**

Create `tests/storage.test.js`:

```javascript
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
  assert.deepStrictEqual(migrated, { xp: 500, lv: 3, log: {} });
  const loaded = await Storage.load('u1');
  assert.deepStrictEqual(loaded, { xp: 500, lv: 3, log: {} });
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/storage.test.js`
Expected: FAIL — `Storage is not defined` or similar

- [ ] **Step 3: Implement `core/storage.js`**

Create `core/storage.js`:

```javascript
(function() {
  const DB_NAME = 'ibadah-quest';
  const DB_VERSION = 1;
  const STORE_NAME = 'state';
  let db = null;

  function init() {
    return new Promise((resolve, reject) => {
      if (db) { resolve(db); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function(e) {
        var database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = function(e) { db = e.target.result; resolve(db); };
      req.onerror = function(e) { reject(e.target.error); };
    });
  }

  function getStore(mode) {
    var tx = db.transaction(STORE_NAME, mode);
    return tx.objectStore(STORE_NAME);
  }

  function load(user) {
    return new Promise(function(resolve, reject) {
      var req = getStore('readonly').get(user);
      req.onsuccess = function() { resolve(req.result || null); };
      req.onerror = function() { reject(req.error); };
    });
  }

  function save(user, state) {
    return new Promise(function(resolve, reject) {
      var req = getStore('readwrite').put(state, user);
      req.onsuccess = function() { resolve(); };
      req.onerror = function() { reject(req.error); };
    });
  }

  function destroy(user) {
    return new Promise(function(resolve, reject) {
      var req = getStore('readwrite').delete(user);
      req.onsuccess = function() { resolve(); };
      req.onerror = function() { reject(req.error); };
    });
  }

  function exportAll() {
    return new Promise(function(resolve, reject) {
      var req = getStore('readonly').getAllKeys();
      req.onsuccess = function() {
        var keys = req.result;
        var results = {};
        var pending = keys.length;
        if (pending === 0) { resolve(results); return; }
        for (var i = 0; i < keys.length; i++) {
          (function(key) {
            var r = getStore('readonly').get(key);
            r.onsuccess = function() { results[key] = r.result; if (--pending === 0) resolve(results); };
            r.onerror = function() { reject(r.error); };
          })(keys[i]);
        }
      };
      req.onerror = function() { reject(req.error); };
    });
  }

  function importAll(data) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(STORE_NAME, 'readwrite');
      var store = tx.objectStore(STORE_NAME);
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; i++) {
        store.put(data[keys[i]], keys[i]);
      }
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  }

  function migrate(user) {
    var PREFIX = 'iq9_user_';
    var key = PREFIX + user;
    return new Promise(function(resolve, reject) {
      try {
        var raw = localStorage.getItem(key);
        if (!raw) { resolve(null); return; }
        var state = JSON.parse(raw);
        save(user, state).then(function() { resolve(state); }).catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  window.Storage = { init: init, load: load, save: save, destroy: destroy, exportAll: exportAll, importAll: importAll, migrate: migrate };
})();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/storage.test.js`
Expected: PASS

- [ ] **Step 5: Run existing tests**

Run: `node --test tests/state.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add core/storage.js tests/storage.test.js
git commit -m "feat: add IndexedDB storage layer with init, load, save, destroy, export, import, migrate"
```

---

### Task 2: Wire `state/state.js` to use Storage

**Files:**
- Modify: `state/state.js`
- Modify: `tests/state.test.js`
- Add `<script src="core/storage.js"></script>` before state.js in `index.html`

**Interfaces:**
- Consumes: `Storage.init()`, `Storage.load()`, `Storage.migrate()`, `Storage.save()` from Task 1
- Produces: Modified `loadState()` tries IDB first, falls back to localStorage with auto-migration. Modified `saveState()` writes to both IDB and localStorage.

- [ ] **Step 1: Load storage.js before state.js in index.html**

In `index.html`, add before the state.js script tag (line 429):
```html
<script src="core/storage.js"></script>
<script src="state/state.js?v=3"></script>
```

- [ ] **Step 2: Modify `loadState()` in state/state.js**

Replace the current `loadState()` with:

```javascript
function loadState() {
  var key = PREFIX + currentUser;
  var d = freshState();
  // Try IndexedDB first
  if (window.Storage && window.Storage.load) {
    var idbState = null;
    try {
      // At this point init() was already called, IDB is ready
      window.Storage.load(currentUser).then(function(s) { idbState = s; }).catch(function() {});
    } catch(e) {}
    if (idbState) {
      for (var k of Object.keys(d)) if (!(k in idbState)) idbState[k] = d[k];
      if (typeof idbState.log !== 'object' || typeof idbState.td !== 'object') return idbState;
      for (var dk in idbState.log) {
        var e = idbState.log[dk];
        if (!e || typeof e !== 'object') idbState.log[dk] = {p:{},d:{},v:{}};
        else { if (!e.p) e.p = {}; if (!e.d) e.d = {}; if (!e.v) e.v = {}; }
      }
      return idbState;
    }
  }
  // Fallback: localStorage (legacy / IDB unavailable)
  try {
    var raw = localStorage.getItem(key);
    if (raw) {
      var p = JSON.parse(raw);
      for (var k of Object.keys(d)) if (!(k in p)) p[k] = d[k];
      if (typeof p.log !== 'object' || typeof p.td !== 'object') return p;
      for (var dk in p.log) {
        var e = p.log[dk];
        if (!e || typeof e !== 'object') p.log[dk] = {p:{},d:{},v:{}};
        else { if (!e.p) e.p = {}; if (!e.d) e.d = {}; if (!e.v) e.v = {}; }
      }
      return p;
    }
  } catch(e) {}
  return d;
}
```

- [ ] **Step 3: Modify `saveState()` in state/state.js**

Replace the current `saveState()` with:

```javascript
function saveState() {
  try {
    // Save to IndexedDB (primary)
    if (window.Storage && window.Storage.save) {
      window.Storage.save(currentUser, S).catch(function(e) {
        console.warn('IDB save failed:', e);
      });
    }
  } catch(e) {}
  try {
    // Also save to localStorage (fallback / backward compat)
    localStorage.setItem(PREFIX + currentUser, JSON.stringify(S));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) console.warn('localStorage quota exceeded');
  }
}
```

- [ ] **Step 4: Add Storage.init() call at startup**

In `index.html`, add an init script right after the storage.js and state.js script tags:

```html
<script>
  if (window.Storage && window.Storage.init) {
    window.Storage.init().then(function() {
      if (window.initApp) initApp();
    }).catch(function(e) {
      console.warn('IndexedDB unavailable:', e);
      if (window.initApp) initApp();
    });
  }
</script>
```

- [ ] **Step 5: Update tests to handle async IDB**

Modify `tests/state.test.js` — update the mock localStorage and add IDB mock:

```javascript
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
```

- [ ] **Step 6: Run all tests**

Run: `node --test tests/state.test.js tests/storage.test.js`
Expected: PASS

- [ ] **Step 7: Run full test suite**

Run: `node --test tests/*.test.js`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add state/state.js index.html tests/state.test.js
git commit -m "feat: wire state.js to use IndexedDB with localStorage fallback"
```

---

### Task 3: Update export/import to use Storage

**Files:**
- Modify: `core/actions.js` (exportData, importData functions)

**Interfaces:**
- Consumes: `Storage.exportAll()`, `Storage.importAll()` from Task 1
- Produces: Modified `exportData()` and `importData()` that use IDB

- [ ] **Step 1: Modify `exportData()` in core/actions.js**

Replace the export function body:

```javascript
function exportData() {
  if (window.Storage && window.Storage.exportAll) {
    window.Storage.exportAll().then(function(data) {
      data._exported = new Date().toISOString();
      data._version = '2.0';
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'ibadah-quest-backup-' + today() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast(iqIcon('download'), 'Data exported successfully!', false, 2000);
    }).catch(function() {
      // Fallback to localStorage export
      exportDataLS();
    });
  } else {
    exportDataLS();
  }
}
```

- [ ] **Step 2: Modify `importData()` in core/actions.js**

Replace the import function body to use `Storage.importAll()` with fallback:

```javascript
function importData() {
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var data = JSON.parse(ev.target.result);
        if (!data || typeof data !== 'object') throw new Error('Invalid file');
        // Remove legacy fields
        delete data._exported;
        delete data._version;
        if (window.Storage && window.Storage.importAll) {
          window.Storage.importAll(data).then(function() {
            S = window.loadState();
            initApp();
            toast(iqIcon('upload'), 'Data imported successfully!', false, 2000);
          }).catch(function() {
            importDataLS(data);
          });
        } else {
          importDataLS(data);
        }
      } catch(e) {
        toast(iqIcon('alert-triangle'), 'Invalid backup file.', false, 2000);
      }
    };
    reader.readAsText(file);
  };
  inp.click();
}
```

- [ ] **Step 3: Run full test suite**

Run: `node --test tests/*.test.js`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add core/actions.js
git commit -m "feat: update export/import to use IndexedDB with localStorage fallback"
```

---

### Task 4: Clean up localStorage duplication

**Files:**
- Modify: `core/themes.js` — read theme from IDB state when available
- Modify: `core/actions.js` — `iq9_intro_seen` reads from state

**Interfaces:**
- Consumes: `S.theme` from state.js
- Produces: Theme reads from `S.theme` instead of separate localStorage key

- [ ] **Step 1: Modify theme handling**

In `core/themes.js`, the `iqTheme` localStorage key should remain for the inline script in index.html (needed before scripts load). But once the app is initialized, `applyTheme()` should prefer `S.theme`.

No changes needed — current code already reads `S.theme` first with localStorage fallback. The duplication is intentional for FOUC prevention.

- [ ] **Step 2: Move `iq9_intro_seen` into state**

In `freshState()`, add `introSeen: false` (already exists).

In `core/actions.js`, replace:
```javascript
localStorage.getItem('iq9_intro_seen')
```
with:
```javascript
S.introSeen
```

And replace:
```javascript
localStorage.setItem('iq9_intro_seen', '1')
```
with:
```javascript
S.introSeen = true; saveState();
```

- [ ] **Step 3: Run full test suite**

Run: `node --test tests/*.test.js`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add core/actions.js
git commit -m "refactor: consolidate introSeen into state, reduce localStorage key sprawl"
```

---

### Task 5: Add cache-busting and version safety

**Files:**
- Modify: `core/storage.js` — add DB version management
- Modify: `sw.js` — bump cache version

**Interfaces:**
- Consumes: nothing
- Produces: DB version field in IDB for future structural migrations

- [ ] **Step 1: Add version to IDB state**

In `core/storage.js`, add a `saveWithVersion` wrapper that stamps `_dbVersion` on every save:

```javascript
var DB_VERSION = 1;

function save(user, state) {
  state._dbVersion = DB_VERSION;
  return new Promise(function(resolve, reject) {
    var req = getStore('readwrite').put(state, user);
    req.onsuccess = function() { resolve(); };
    req.onerror = function() { reject(req.error); };
  });
}
```

- [ ] **Step 2: Bump service worker cache**

In `sw.js`, change `CACHE_NAME` from `'iq-cache-v16'` to `'iq-cache-v17'`.

- [ ] **Step 3: Run full test suite**

Run: `node --test tests/*.test.js`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add core/storage.js sw.js
git commit -m "feat: add DB version stamp for future migrations, bump SW cache to v17"
```

---

### Task 6: Verify end-to-end

- [ ] **Step 1: Run all tests**

Run: `node --test tests/*.test.js`
Expected: ALL PASS

- [ ] **Step 2: Manual smoke test**

Open `index.html` in browser. Verify:
- Intro overlay appears and dismisses
- Prayers can be toggled
- XP updates
- Export produces a JSON file
- Import restores data
- Theme toggle works
- No console errors about IDB

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: data layer upgrade verification, cache-bust"
```
