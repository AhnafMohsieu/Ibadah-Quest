'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

let code = '';
try {
  code = fs.readFileSync(path.join(__dirname, '..', 'features', 'swipe-nav.js'), 'utf8');
} catch (e) {}

const sandbox = {
  window: { matchMedia: () => ({ matches: false }) },
  console,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
};
if (code) vm.runInNewContext(code, sandbox, { filename: 'features/swipe-nav.js' });
const dir = sandbox.window._swipeDir;
const idx = sandbox.window._swipeIndex;

test('SP2: swipe-nav module exports its gesture math', () => {
  assert.strictEqual(typeof dir, 'function', 'features/swipe-nav.js must define window._swipeDir');
  assert.strictEqual(typeof idx, 'function', 'feature module must define window._swipeIndex');
});

test('SP2: _swipeDir ignores edge-origin gestures (iOS back zones)', () => {
  assert.strictEqual(dir(10, -120, 0, 390), 0);
  assert.strictEqual(dir(385, -120, 0, 390), 0);
});

test('SP2: _swipeDir requires the 60px floor and rejects vertical dominance', () => {
  assert.strictEqual(dir(200, -59, 0, 390), 0);
  assert.strictEqual(dir(200, -60, 0, 390), 1);
  assert.strictEqual(dir(200, -80, -80, 390), 0);
  assert.strictEqual(dir(200, -80, -20, 390), 1);
});

test('SP2: _swipeDir maps left/right to next/previous', () => {
  assert.strictEqual(dir(200, -100, 0, 390), 1);
  assert.strictEqual(dir(200, 100, 0, 390), -1);
});

test('SP2: _swipeIndex clamps at both ends', () => {
  assert.strictEqual(idx(0, -1, 5), -1);
  assert.strictEqual(idx(4, 1, 5), -1);
  assert.strictEqual(idx(2, 1, 5), 3);
  assert.strictEqual(idx(2, -1, 5), 1);
});
