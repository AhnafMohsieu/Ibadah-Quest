// src/core/idb.js — minimal IndexedDB mirror, ported from legacy core/storage.js
// (init/load/save/destroy only; compaction helpers stayed legacy). Keeps the MPA
// track's writes mirrored to the same 'ibadah-quest' database the legacy track
// uses, so neither track reads stale data. All functions no-op safely in Node
// (no indexedDB) and never throw to callers.
const DB_NAME = 'ibadah-quest';
const DB_VERSION = 1;
const STORE_NAME = 'state';

function idb() {
  try {
    if (typeof indexedDB === 'undefined') return null;
    return indexedDB;
  } catch { return null; }
}

let dbPromise = null;
export function init() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const engine = idb();
      if (!engine) { reject(new Error('indexedDB unavailable')); return; }
      const req = engine.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }
  return dbPromise;
}

export function load(user) {
  return init().then(
    (db) =>
      new Promise((resolve, reject) => {
        try {
          const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(user);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => reject(req.error);
        } catch (e) { reject(e); }
      })
  );
}

export function save(user, state) {
  return init().then(
    (db) =>
      new Promise((resolve, reject) => {
        try {
          const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(state, user);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (e) { reject(e); }
      })
  );
}

export function destroy(user) {
  return init().then(
    (db) =>
      new Promise((resolve, reject) => {
        try {
          const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(user);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (e) { reject(e); }
      })
  );
}
