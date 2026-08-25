'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function mkLS(initial) {
  const store = Object.assign({}, initial);
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    key: i => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length; }
  };
}
function loadBackup(ls) {
  const sb = loadFile(path.join(__dirname, '..', 'core', 'backup.js'),
    { localStorage: ls, console, window: {} });
  if (!sb.window.Backup && sb.Backup) sb.window = { Backup: sb.Backup };
  return sb.window.Backup;
}

test('stableStringify is key-order independent', () => {
  const B = loadBackup(mkLS({}));
  assert.strictEqual(B.stableStringify({ a: 1, b: { c: 2, d: 3 } }),
                     B.stableStringify({ b: { d: 3, c: 2 }, a: 1 }));
});

test('buildExport adds metadata + working checksum', () => {
  const B = loadBackup(mkLS({}));
  const exp = B.buildExport({ iq9_user_default: { xp: 5 }, iqTheme: 'dark' });
  assert.strictEqual(exp._version, '2.1');
  assert.ok(exp._exported);
  assert.ok(exp._checksum);
  assert.strictEqual(B.validateBackup(exp).ok, true);
});

test('tampered v2.1 payload fails checksum with specific error', () => {
  const B = loadBackup(mkLS({}));
  const exp = B.buildExport({ iq9_user_default: { xp: 5 } });
  exp.iq9_user_default = { xp: 99999 };
  const res = B.validateBackup(exp);
  assert.strictEqual(res.ok, false);
  assert.match(res.error, /checksum/i);
});

test('legacy v1/v2 formats validate without checksum', () => {
  const B = loadBackup(mkLS({}));
  assert.strictEqual(B.validateBackup({ _version: '1.0', iq9_user_old: { xp: 1 } }).ok, true);
  assert.strictEqual(B.validateBackup({ _version: '2.0', iq9_active_user: 'default' }).ok, true);
});

test('validateBackup rejects junk shapes with reasons', () => {
  const B = loadBackup(mkLS({}));
  assert.match(B.validateBackup(null).error, /not/i);
  assert.match(B.validateBackup({}).error, /no user data/i);
  assert.match(B.validateBackup({ _version: '9.9', iq9_user_x: {} }).error, /version/i);
});

test('snapshot rotation keeps newest 2 and rollback restores bytes', () => {
  const ls = mkLS({ iq9_user_default: '{"xp":1}', iq9_active_user: 'default' });
  const B = loadBackup(ls);
  B.snapshotBeforeImport(ls);
  ls.setItem('iq9_user_default', '{"xp":222}');           // simulate import overwrite
  B.snapshotBeforeImport(ls);                              // second import
  ls.setItem('iq9_user_default', '{"xp":333}');
  B.snapshotBeforeImport(ls);                              // third → oldest evicted
  const snapKeys = [];
  for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (k && k.indexOf('iq9_preimport_') === 0) snapKeys.push(k); }
  assert.strictEqual(snapKeys.length, 2, 'rotation cap');
  const n = B.rollbackSnapshot(ls);
  assert.strictEqual(n >= 1, true);
  assert.strictEqual(JSON.parse(ls.getItem('iq9_user_default')).xp, 333); // most recent snapshot (pre_1 = third capture)
});
