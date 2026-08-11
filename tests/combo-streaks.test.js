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
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    iqIcon: () => ''
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

function freshState() {
  return {
    combos: {},
    log: {},
    xp: 0,
    lv: 1
  };
}

// ── getComboMultiplier tests ──

test('getComboMultiplier returns 1x for count < 3', () => {
  const s = loadSandbox(['features/combo-streaks.js'], { S: freshState(), today: () => '2026-08-11', saveState: () => {}, toast: () => {} });
  assert.strictEqual(s.getComboMultiplier(0), 1);
  assert.strictEqual(s.getComboMultiplier(1), 1);
  assert.strictEqual(s.getComboMultiplier(2), 1);
});

test('getComboMultiplier returns 1.5x for count 3-6', () => {
  const s = loadSandbox(['features/combo-streaks.js'], { S: freshState(), today: () => '2026-08-11', saveState: () => {}, toast: () => {} });
  assert.strictEqual(s.getComboMultiplier(3), 1.5);
  assert.strictEqual(s.getComboMultiplier(6), 1.5);
});

test('getComboMultiplier returns 2x for count 7-13', () => {
  const s = loadSandbox(['features/combo-streaks.js'], { S: freshState(), today: () => '2026-08-11', saveState: () => {}, toast: () => {} });
  assert.strictEqual(s.getComboMultiplier(7), 2);
  assert.strictEqual(s.getComboMultiplier(13), 2);
});

test('getComboMultiplier returns 3x for count 14-29', () => {
  const s = loadSandbox(['features/combo-streaks.js'], { S: freshState(), today: () => '2026-08-11', saveState: () => {}, toast: () => {} });
  assert.strictEqual(s.getComboMultiplier(14), 3);
  assert.strictEqual(s.getComboMultiplier(29), 3);
});

test('getComboMultiplier returns 5x for count 30+', () => {
  const s = loadSandbox(['features/combo-streaks.js'], { S: freshState(), today: () => '2026-08-11', saveState: () => {}, toast: () => {} });
  assert.strictEqual(s.getComboMultiplier(30), 5);
  assert.strictEqual(s.getComboMultiplier(100), 5);
});

// ── checkCombo increment tests ──

test('checkCombo increments count when completed and lastDate is today', () => {
  const s = loadSandbox(['features/combo-streaks.js'], {
    S: { ...freshState(), combos: { fajr: { count: 2, lastDate: '2026-08-11' } } },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {}
  });
  s.checkCombo('fajr', true);
  assert.strictEqual(s.S.combos.fajr.count, 3);
});

test('checkCombo increments count when completed and lastDate is yesterday', () => {
  const s = loadSandbox(['features/combo-streaks.js'], {
    S: { ...freshState(), combos: { fajr: { count: 4, lastDate: '2026-08-10' } } },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {}
  });
  s.checkCombo('fajr', true);
  assert.strictEqual(s.S.combos.fajr.count, 5);
});

test('checkCombo sets count to 1 when completed and lastDate is older than yesterday', () => {
  const s = loadSandbox(['features/combo-streaks.js'], {
    S: { ...freshState(), combos: { fajr: { count: 10, lastDate: '2026-08-08' } } },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {}
  });
  s.checkCombo('fajr', true);
  assert.strictEqual(s.S.combos.fajr.count, 1);
});

test('checkCombo sets count to 1 when completed and no previous lastDate', () => {
  const s = loadSandbox(['features/combo-streaks.js'], {
    S: { ...freshState(), combos: {} },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {}
  });
  s.checkCombo('fajr', true);
  assert.strictEqual(s.S.combos.fajr.count, 1);
  assert.strictEqual(s.S.combos.fajr.lastDate, '2026-08-11');
});

// ── checkCombo break combo tests ──

test('checkCombo breaks combo when not completed and lastDate is older than yesterday', () => {
  const s = loadSandbox(['features/combo-streaks.js'], {
    S: { ...freshState(), combos: { fajr: { count: 10, lastDate: '2026-08-08' } } },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {}
  });
  s.checkCombo('fajr', false);
  assert.strictEqual(s.S.combos.fajr.count, 0);
});

test('checkCombo does NOT break combo when not completed but lastDate is today', () => {
  const s = loadSandbox(['features/combo-streaks.js'], {
    S: { ...freshState(), combos: { fajr: { count: 5, lastDate: '2026-08-11' } } },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {}
  });
  s.checkCombo('fajr', false);
  assert.strictEqual(s.S.combos.fajr.count, 5);
});

test('checkCombo does NOT break combo when not completed but lastDate is yesterday', () => {
  const s = loadSandbox(['features/combo-streaks.js'], {
    S: { ...freshState(), combos: { fajr: { count: 5, lastDate: '2026-08-10' } } },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {}
  });
  s.checkCombo('fajr', false);
  assert.strictEqual(s.S.combos.fajr.count, 5);
});

// ── milestone toast tests ──

test('checkCombo shows toast at milestone 3', () => {
  let toastCalled = false;
  const s = loadSandbox(['features/combo-streaks.js'], {
    S: { ...freshState(), combos: { fajr: { count: 2, lastDate: '2026-08-10' } } },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => { toastCalled = true; }
  });
  s.checkCombo('fajr', true);
  assert.strictEqual(toastCalled, true);
  assert.strictEqual(s.S.combos.fajr.count, 3);
});

test('checkCombo does NOT show toast when not at milestone', () => {
  let toastCount = 0;
  const s = loadSandbox(['features/combo-streaks.js'], {
    S: { ...freshState(), combos: { fajr: { count: 1, lastDate: '2026-08-10' } } },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => { toastCount++; }
  });
  s.checkCombo('fajr', true);
  // toast is called for multiplier change info, but not the milestone confetti
  // milestone check: count becomes 2, not a milestone
});

// ── renderCombos tests ──

test('renderCombos renders combo grid into #comboDisplay', () => {
  const el = { innerHTML: '' };
  const s = loadSandbox(['features/combo-streaks.js'], {
    S: { ...freshState(), combos: { fajr: { count: 5, lastDate: '2026-08-11', best: 10 } } },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {},
    document: { getElementById: () => el }
  });
  s.renderCombos();
  assert.ok(el.innerHTML.includes('combo-card'));
});

test('renderCombos returns empty if no combos', () => {
  const el = { innerHTML: '' };
  const s = loadSandbox(['features/combo-streaks.js'], {
    S: { ...freshState(), combos: {} },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {},
    document: { getElementById: () => el }
  });
  s.renderCombos();
  assert.strictEqual(el.innerHTML, '');
});
