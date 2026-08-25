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
      lad: '2026-08-10',
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

  sandbox.window._iqPrevLad = '2026-08-10';
  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.xp, 150);
});

test('comeback bonus after 2+ days missed', () => {
  const sandbox = loadSandbox(['features/consistency-bonuses.js'], {
    S: {
      lad: '2026-08-08',
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

  sandbox.window._iqPrevLad = '2026-08-08';
  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.xp, 200);
});

test('comeback bonus if logged yesterday', () => {
  const sandbox = loadSandbox(['features/consistency-bonuses.js'], {
    S: {
      lad: '2026-08-10',
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

  sandbox.window._iqPrevLad = '2026-08-10';
  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.xp, 150);
});

test('no bonus if same day', () => {
  const sandbox = loadSandbox(['features/consistency-bonuses.js'], {
    S: {
      lad: '2026-08-11',
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

  sandbox.window._iqPrevLad = '2026-08-11';
  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.xp, 100);
});

test('no bonus if no previous active date', () => {
  const sandbox = loadSandbox(['features/consistency-bonuses.js'], {
    S: {
      lad: null,
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

  sandbox.window._iqPrevLad = null;
  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.xp, 100);
});

test('lad is updated after checkConsistency and prev is consumed', () => {
  const sandbox = loadSandbox(['features/consistency-bonuses.js'], {
    S: {
      lad: '2026-08-09',
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

  sandbox.window._iqPrevLad = '2026-08-09';
  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.lad, '2026-08-11');
  assert.strictEqual(sandbox.window._iqPrevLad, null);
});

test('mid-session rollover pays comeback bonus exactly once and consumes prev', () => {
  const sandbox = loadSandbox(['features/consistency-bonuses.js'], {
    S: {
      lad: '2026-08-10',
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

  // initApp rollover-capture step (mid-session path): capture prev, roll forward.
  sandbox.window._iqPrevLad = sandbox.S.lad;
  sandbox.S.lad = '2026-08-11';

  // Deferred features are already loaded mid-session, so checkConsistency runs now.
  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.xp, 150);
  assert.strictEqual(sandbox.window._iqPrevLad, null);

  // Consume-once semantics: a repeat invocation must not pay the bonus again.
  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.xp, 150);
});
