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
        var raw = window.localStorage.getItem(key);
        if (!raw) { resolve(null); return; }
        var state = JSON.parse(raw);
        save(user, state).then(function() { resolve(state); }).catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  window.Storage = { init: init, load: load, save: save, saveRaw: saveRaw, getRaw: getRaw, destroy: destroy, exportAll: exportAll, importAll: importAll, migrate: migrate };
})();
