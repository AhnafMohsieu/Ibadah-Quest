(function() {
  var DB_NAME = 'iq-content-cache';
  var DB_VERSION = 1;
  var STORE_NAME = 'editions';
  var dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function(resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function(e) {
        var database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
      };
      req.onsuccess = function() { resolve(req.result); };
      req.onerror = function() { dbPromise = null; reject(req.error); };
    });
    return dbPromise;
  }

  function get(key) {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var r = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
        r.onsuccess = function() { resolve(r.result ? r.result.v : null); };
        r.onerror = function() { reject(r.error); };
      });
    }).catch(function () { return null; });
  }

  function put(key, value) {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put({ v: value, t: Date.now() }, key);
        tx.oncomplete = function() { resolve(); };
        tx.onerror = function() { reject(tx.error); };
      });
    }).catch(function() {});
  }

  window.ContentCache = { get: get, put: put };
})();
