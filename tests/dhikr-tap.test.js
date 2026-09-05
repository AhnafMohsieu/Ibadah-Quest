'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

// Loads the REAL state.js + dhikr data + dhikr logic with production globals.
// Deliberately does NOT stub yesterdayKey: tapDhikr must work with only
// what the app actually provides.
function makeTapSandbox() {
  const calls = { save: 0, render: 0, xp: 0 };
  const sandbox = {
    window: {},
    console,
    navigator: {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    document: { getElementById: () => null, documentElement: { getAttribute: () => '' } },
    S: {},
    saveState: () => { calls.save++; },
    applyXpDelta: () => { calls.xp++; },
    renderDhikrCounter: () => { calls.render++; },
    toast: () => {},
    iqIcon: () => ''
  };
  for (const f of ['state/state.js', 'data/pools/dhikr.js', 'core/dhikr.js']) {
    const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    vm.runInNewContext(code, sandbox, { filename: f });
  }
  sandbox.S = {}; // state.js declares its own S; use a fresh store per test
  sandbox.saveState = () => { calls.save++; }; // state.js also defines saveState
  sandbox.renderDhikrCounter = () => { calls.render++; };
  sandbox.applyXpDelta = () => { calls.xp++; };
  return { sandbox, calls };
}

test('tapDhikr counts the first tap of the day without throwing', () => {
  const { sandbox, calls } = makeTapSandbox();
  sandbox.window.tapDhikr();
  assert.strictEqual(sandbox.S.dhikrCounters[0], 1, 'counter must increment');
  assert.ok(calls.save > 0, 'tap must persist state');
  assert.ok(calls.render > 0, 'tap must re-render the counter');
  assert.ok(calls.xp > 0, 'tap must grant XP');
});

test('tapDhikr keeps counting on repeated taps', () => {
  const { sandbox } = makeTapSandbox();
  sandbox.window.tapDhikr();
  sandbox.window.tapDhikr();
  sandbox.window.tapDhikr();
  assert.strictEqual(sandbox.S.dhikrCounters[0], 3, 'counter must reach 3 after 3 taps');
});

test('yesterdayKey is exported for dhikr streak tracking', () => {
  const { sandbox } = makeTapSandbox();
  assert.strictEqual(typeof sandbox.window.yesterdayKey, 'function', 'window.yesterdayKey must exist');
  assert.match(sandbox.window.yesterdayKey(), /^\d{4}-\d{2}-\d{2}$/, 'must return a date key');
});
