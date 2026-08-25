'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function loadRecovery(lsStore, storageStub, extraOverrides) {
  const store = Object.assign({}, lsStore);
  const ls = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    key: i => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length; }
  };
  const sb = loadFile(path.join(__dirname, '..', 'core', 'recovery.js'), Object.assign({
    localStorage: ls,
    console,
    window: storageStub || {}
  }, extraOverrides || {}));
  if (!sb.window.Recovery && sb.Recovery) sb.window = { Recovery: sb.Recovery };
  return { sb, store };
}

test('isJunkState: junk rejected, plausible legacy saves accepted', () => {
  const { sb } = loadRecovery({});
  const R = sb.window.Recovery;
  assert.strictEqual(R.isJunkState(null), true);
  assert.strictEqual(R.isJunkState('garbage'), true);
  assert.strictEqual(R.isJunkState(42), true);
  assert.strictEqual(R.isJunkState([1, 2]), true);
  assert.strictEqual(R.isJunkState({}), true);                       // no markers
  assert.strictEqual(R.isJunkState({ foo: 1 }), true);               // no markers
  assert.strictEqual(R.isJunkState({ log: {} }), false);             // marker 1
  assert.strictEqual(R.isJunkState({ xp: 0 }), false);               // marker 2
  assert.strictEqual(R.isJunkState({ schemaVersion: 1 }), false);    // marker 3
  assert.strictEqual(R.isJunkState({ log: {}, xp: 5 }), false);
});

test('quarantine writes timestamped copy and prunes to newest 3 per user', () => {
  const { sb, store } = loadRecovery({});
  const R = sb.window.Recovery;
  for (let i = 1; i <= 5; i++) {
    R.quarantine('default', '{"xp:' + i + '"}');
  }
  const qKeys = Object.keys(store).filter(k => k.startsWith('iq9_quarantine_default_')).sort();
  assert.strictEqual(qKeys.length, 3, 'retention cap');
  assert.ok(store[qKeys[2]].includes('5'), 'newest retained');
  assert.ok(!store[qKeys[0]].includes('"xp:1"') || qKeys.length === 3);
});

test('quarantine yields two distinct keys when both stores flag in the same millisecond', () => {
  const FrozenDate = function () {
    return { toISOString: () => '2026-08-26T00:00:00.000Z' };
  };
  const { sb, store } = loadRecovery({}, {}, { Date: FrozenDate });
  const k1 = sb.window.Recovery.quarantine('default', '{"source":"ls"}');
  const k2 = sb.window.Recovery.quarantine('default', '{"source":"idb"}');
  assert.notStrictEqual(k1, k2, 'same-ms quarantines must not collide');
  assert.strictEqual(store[k1], '{"source":"ls"}');
  assert.strictEqual(store[k2], '{"source":"idb"}');
});

test('salvageInto copies type-compatible known keys onto fresh template', () => {
  const { sb } = loadRecovery({});
  const R = sb.window.Recovery;
  const fresh = { log: {}, xp: 0, td: {}, vc: {}, lv: 1, bookmarks: [] };
  const out = R.salvageInto(JSON.parse(JSON.stringify(fresh)),
    JSON.stringify({ log: { '2026-01-01': { p: { fajr: true }, d: {}, v: {} } }, xp: 999,
                     junkUnknown: 'x', lv: 'corrupted-type', bookmarks: 'not-array' }));
  assert.strictEqual(out.xp, 999);
  assert.ok(out.log['2026-01-01'].p.fajr);
  assert.strictEqual(out.lv, 1, 'wrong-typed values rejected');
  assert.deepStrictEqual(out.bookmarks, [], 'array type enforced');
  assert.strictEqual(out.junkUnknown, undefined, 'unknown keys dropped');
});

test('salvageInto returns null on unparseable payload', () => {
  const { sb } = loadRecovery({});
  const out = sb.window.Recovery.salvageInto({}, '{"truncated');
  assert.strictEqual(out, null);
});
