(function() {
  var DB_NAME = 'ibadah-quest';
  var DB_VERSION = 1;
  var STORE_NAME = 'state';
  var db = null;

  function init() {
    return new Promise(function(resolve, reject) {
      if (db) { resolve(db); return; }
      var req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function(e) {
        var database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = function() { db = req.result; resolve(db); };
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
    state._dbVersion = DB_VERSION;
    return new Promise(function(resolve, reject) {
      var req = getStore('readwrite').put(state, user);
      req.onsuccess = function() { resolve(); };
      req.onerror = function() { reject(req.error); };
    });
  }

  function saveRaw(key, value) {
    return new Promise(function(resolve, reject) {
      var req = getStore('readwrite').put(value, key);
      req.onsuccess = function() { resolve(); };
      req.onerror = function() { reject(req.error); };
    });
  }

  function getRaw(key) {
    return new Promise(function(resolve, reject) {
      var req = getStore('readonly').get(key);
      req.onsuccess = function() { resolve(req.result); };
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
      var tx, store;
      try {
        tx = db.transaction(STORE_NAME, 'readonly');
        store = tx.objectStore(STORE_NAME);
      } catch (e) { reject(e); return; }
      var req = store.getAllKeys();
      req.onsuccess = function() {
        var keys = req.result;
        var results = {};
        var pending = keys.length;
        if (pending === 0) { resolve(results); return; }
        for (var i = 0; i < keys.length; i++) {
          (function(key) {
            var r = store.get(key);
            r.onsuccess = function() { results[key] = r.result; if (--pending === 0) resolve(results); };
            r.onerror = function() { reject(r.error); };
          })(keys[i]);
        }
      };
      req.onerror = function() { reject(req.error); };
      tx.onerror = function() { reject(tx.error); };
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
        var raw = window.localStorage.getItem(key);
        if (!raw) { resolve(null); return; }
        var state = JSON.parse(raw);
        save(user, state).then(function() { resolve(state); }).catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  // --- Storage compaction ---
  function compactDhikrSessions() {
    var sessions = window.S && window.S.dhikrSessions;
    if (!Array.isArray(sessions) || sessions.length < 100) return;
    var cutoff = Date.now() - 7 * 86400000;
    var recent = sessions.filter(function(s) { return s.ts >= cutoff; });
    var old = sessions.filter(function(s) { return s.ts < cutoff; });
    if (old.length === 0) return;
    var aggregates = {};
    for (var i = 0; i < old.length; i++) {
      var s = old[i];
      var dateKey = new Date(s.ts).toISOString().slice(0, 10);
      var key = dateKey + ':' + (s.type || 'unknown');
      if (!aggregates[key]) aggregates[key] = { date: dateKey, type: s.type, count: 0 };
      aggregates[key].count += (s.count || 1);
    }
    window.S.dhikrSessions = recent.concat(Object.values(aggregates));
  }

  function compactXpDaily() {
    var daily = window.S && window.S.xpDaily;
    if (!daily || typeof daily !== 'object') return;
    var cutoff = Date.now() - 14 * 86400000;
    var keep = {};
    var archived = 0;
    var keys = Object.keys(daily);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key.charAt(0) === '_') continue;
      var dateStr = key.split(':')[0];
      var dateMs = new Date(dateStr).getTime();
      if (dateMs >= cutoff) {
        keep[key] = daily[key];
      } else {
        archived += (typeof daily[key] === 'number' ? daily[key] : 0);
      }
    }
    if (archived > 0) keep._archived = (keep._archived || 0) + archived;
    window.S.xpDaily = keep;
  }

  function compactStorage() {
    compactDhikrSessions();
    compactXpDaily();
  }

  function getStorageSize() {
    var total = 0;
    var ls = window.localStorage;
    for (var i = 0; i < ls.length; i++) {
      var key = ls.key(i);
      if (key && key.indexOf('iq9_') === 0) {
        total += ls.getItem(key).length;
      }
    }
    return total;
  }

  window.Storage = { init: init, load: load, save: save, saveRaw: saveRaw, getRaw: getRaw, destroy: destroy, exportAll: exportAll, importAll: importAll, migrate: migrate };
  window.compactStorage = compactStorage;
  window.getStorageSize = getStorageSize;
})();
