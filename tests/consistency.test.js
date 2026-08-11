'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

function loadSandbox(files, globals) {
  const sandbox = Object.assign({
    window: {},
    console,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  }, globals || {});
  for (const f of files) {
    const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    vm.runInNewContext(code, sandbox, { filename: f });
    if (sandbox.window) {
      for (const key of Object.keys(sandbox.window)) {
        sandbox[key] = sandbox.window[key];
      }
    }
  }
  return sandbox;
}

test('comeback bonus after 1 day missed', () => {
  const sandbox = loadSandbox(['features/consistency-bonuses.js'], {
    S: {
      lastActiveDate: '2026-08-09',
      xp: 100,
      lv: 1,
      log: { '2026-08-11': { p: { fajr: true } } }
    },
    today: () => '2026-08-11',
    lvFrom: () => 1,
    toast: () => {},
    saveState: () => {},
    iqIcon: () => '⭐'
  });

  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.xp, 150);
});

test('comeback bonus after 2+ days missed', () => {
  const sandbox = loadSandbox(['features/consistency-bonuses.js'], {
    S: {
      lastActiveDate: '2026-08-08',
      xp: 100,
      lv: 1,
      log: { '2026-08-11': { p: { fajr: true } } }
    },
    today: () => '2026-08-11',
    lvFrom: () => 1,
    toast: () => {},
    saveState: () => {},
    iqIcon: () => '⭐'
  });

  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.xp, 200);
});

test('no bonus if logged yesterday', () => {
  const sandbox = loadSandbox(['features/consistency-bonuses.js'], {
    S: {
      lastActiveDate: '2026-08-10',
      xp: 100,
      lv: 1,
      log: { '2026-08-11': { p: { fajr: true } } }
    },
    today: () => '2026-08-11',
    lvFrom: () => 1,
    toast: () => {},
    saveState: () => {},
    iqIcon: () => '⭐'
  });

  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.xp, 100);
});

test('no bonus if same day', () => {
  const sandbox = loadSandbox(['features/consistency-bonuses.js'], {
    S: {
      lastActiveDate: '2026-08-11',
      xp: 100,
      lv: 1,
      log: { '2026-08-11': { p: { fajr: true } } }
    },
    today: () => '2026-08-11',
    lvFrom: () => 1,
    toast: () => {},
    saveState: () => {},
    iqIcon: () => '⭐'
  });

  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.xp, 100);
});

test('no bonus if no last active date', () => {
  const sandbox = loadSandbox(['features/consistency-bonuses.js'], {
    S: {
      lastActiveDate: null,
      xp: 100,
      lv: 1,
      log: { '2026-08-11': { p: { fajr: true } } }
    },
    today: () => '2026-08-11',
    lvFrom: () => 1,
    toast: () => {},
    saveState: () => {},
    iqIcon: () => '⭐'
  });

  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.xp, 100);
});

test('lastActiveDate is updated after checkConsistency', () => {
  const sandbox = loadSandbox(['features/consistency-bonuses.js'], {
    S: {
      lastActiveDate: '2026-08-09',
      xp: 100,
      lv: 1,
      log: {}
    },
    today: () => '2026-08-11',
    lvFrom: () => 1,
    toast: () => {},
    saveState: () => {},
    iqIcon: () => '⭐'
  });

  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.lastActiveDate, '2026-08-11');
});
