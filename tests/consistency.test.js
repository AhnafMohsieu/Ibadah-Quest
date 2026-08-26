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
  const sandbox = loadSandbox(['core/xp.js', 'features/consistency-bonuses.js'], {
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
  const sandbox = loadSandbox(['core/xp.js', 'features/consistency-bonuses.js'], {
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
  const sandbox = loadSandbox(['core/xp.js', 'features/consistency-bonuses.js'], {
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
  const sandbox = loadSandbox(['core/xp.js', 'features/consistency-bonuses.js'], {
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
  const sandbox = loadSandbox(['core/xp.js', 'features/consistency-bonuses.js'], {
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
  const sandbox = loadSandbox(['core/xp.js', 'features/consistency-bonuses.js'], {
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
  const sandbox = loadSandbox(['core/xp.js', 'features/consistency-bonuses.js'], {
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

test('checkWeeklyConsistency awards 500 XP for 7 perfect days on Sunday', () => {
  const SUNDAY = new Date(2026, 7, 9); // Aug 9 2026 is Sunday
  const FixedDate = function(...args) {
    if (args.length === 0) return new Date(SUNDAY.getTime());
    return new (Function.prototype.bind.apply(Date, [null].concat(Array.from(arguments))))();
  };
  FixedDate.now = Date.now;
  const log = {};
  for (let i = 0; i < 7; i++) {
    const dk = '2026-08-' + (9 - i).toString().padStart(2, '0');
    log[dk] = { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } };
  }
  const sandbox = loadSandbox(['core/xp.js', 'features/consistency-bonuses.js'], {
    S: { lad: '2026-08-09', xp: 100, lv: 1, log, lastWeeklyConsistency: null },
    today: (d) => {
      if (d) return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0');
      return '2026-08-09';
    },
    Date: FixedDate,
    lvFrom: () => 1,
    toast: () => {},
    saveState: () => {},
    iqIcon: () => '⭐'
  });
  sandbox.window.Date = FixedDate;
  sandbox.checkWeeklyConsistency();
  assert.strictEqual(sandbox.S.xp, 600);
  assert.strictEqual(sandbox.S.lastWeeklyConsistency, '2026-08-09');
});

test('checkWeeklyConsistency awards 200 XP for 6 days on Sunday', () => {
  const SUNDAY = new Date(2026, 7, 9); // Aug 9 2026 is Sunday
  const FixedDate = function(...args) {
    if (args.length === 0) return new Date(SUNDAY.getTime());
    return new (Function.prototype.bind.apply(Date, [null].concat(Array.from(arguments))))();
  };
  FixedDate.now = Date.now;
  const log = {};
  for (let i = 0; i < 6; i++) {
    const dk = '2026-08-' + (9 - i).toString().padStart(2, '0');
    log[dk] = { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } };
  }
  const sandbox = loadSandbox(['core/xp.js', 'features/consistency-bonuses.js'], {
    S: { lad: '2026-08-09', xp: 100, lv: 1, log, lastWeeklyConsistency: null },
    today: (d) => {
      if (d) return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0');
      return '2026-08-09';
    },
    Date: FixedDate,
    lvFrom: () => 1,
    toast: () => {},
    saveState: () => {},
    iqIcon: () => '⭐'
  });
  sandbox.window.Date = FixedDate;
  sandbox.checkWeeklyConsistency();
  assert.strictEqual(sandbox.S.xp, 300);
});

test('checkWeeklyConsistency skips if not Sunday', () => {
  const FixedDate = function(...args) {
    if (args.length === 0) return { getDay: () => 3 };
    return new (Function.prototype.bind.apply(Date, [null].concat(Array.from(arguments))))();
  };
  FixedDate.now = Date.now;
  const sandbox = loadSandbox(['core/xp.js', 'features/consistency-bonuses.js'], {
    S: { lad: '2026-08-11', xp: 100, lv: 1, log: {}, lastWeeklyConsistency: null },
    today: () => '2026-08-11',
    Date: FixedDate,
    lvFrom: () => 1,
    toast: () => {},
    saveState: () => {},
    iqIcon: () => '⭐'
  });
  sandbox.window.Date = FixedDate;
  sandbox.checkWeeklyConsistency();
  assert.strictEqual(sandbox.S.xp, 100);
});

test('checkWeeklyConsistency skips if already run today', () => {
  const FixedDate = function(...args) {
    if (args.length === 0) return { getDay: () => 0 };
    return new (Function.prototype.bind.apply(Date, [null].concat(Array.from(arguments))))();
  };
  FixedDate.now = Date.now;
  const sandbox = loadSandbox(['core/xp.js', 'features/consistency-bonuses.js'], {
    S: { lad: '2026-08-11', xp: 100, lv: 1, log: {}, lastWeeklyConsistency: '2026-08-11' },
    today: () => '2026-08-11',
    Date: FixedDate,
    lvFrom: () => 1,
    toast: () => {},
    saveState: () => {},
    iqIcon: () => '⭐'
  });
  sandbox.window.Date = FixedDate;
  sandbox.checkWeeklyConsistency();
  assert.strictEqual(sandbox.S.xp, 100);
});
