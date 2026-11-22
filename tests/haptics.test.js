'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

const XP = path.join(__dirname, '..', 'core', 'xp.js');

function mk(haptic, withVibrate) {
  const calls = [];
  const overrides = {
    S: { xp: 0, lv: 1, dhikrSettings: { haptic } },
    saveState: () => {},
    markDirty: () => {},
    renderDynamic: () => {},
    today: () => '2026-10-17',
    setTimeout: () => 0,
    clearTimeout: () => {}
  };
  if (withVibrate !== false) overrides.navigator = { vibrate: (p) => { calls.push(p); return true; } };
  const sb = loadFile(XP, overrides);
  return { sb, calls };
}

test('SP2: iqHaptic exists on the feedback module', () => {
  const { sb } = mk(true);
  assert.strictEqual(typeof sb.window.iqHaptic, 'function');
});

test('SP2: iqHaptic vibrates with the given pattern when enabled', () => {
  const { sb, calls } = mk(true);
  sb.window.iqHaptic(10);
  assert.deepStrictEqual(calls, [10]);
});

test('SP2: iqHaptic defaults to 10 and passes arrays through', () => {
  const { sb, calls } = mk(true);
  sb.window.iqHaptic();
  sb.window.iqHaptic([30, 50, 30]);
  assert.deepStrictEqual(calls, [10, [30, 50, 30]]);
});

test('SP2: iqHaptic is silent when the setting is off', () => {
  const { sb, calls } = mk(false);
  sb.window.iqHaptic(10);
  assert.deepStrictEqual(calls, []);
});

test('SP2: iqHaptic never throws without navigator.vibrate or S', () => {
  const a = mk(true, false); // no navigator at all
  a.sb.window.iqHaptic(10);
  const b = loadFile(XP, { setTimeout: () => 0, clearTimeout: () => {} }); // no S
  assert.strictEqual(typeof b.window.iqHaptic, 'function');
  b.window.iqHaptic(10);
});
