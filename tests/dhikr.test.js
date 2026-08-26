'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { loadFile } = require('./helpers/load.js');

function setup(overrides) {
  const sandbox = loadFile(path.join(__dirname, '..', 'core', 'dhikr.js'), Object.assign({
    S: {
      lv: 1, xp: 0,
      dhikrCounters: { _active: 0, 0: 0 },
      dhikrSessions: [],
      dhikrStats: { total: {}, daily: {}, streak: 0, bestStreak: 0, lastSessionDate: null, badges: [], achievements: [] },
      dhikrSettings: {},
      dhikrCustom: [],
      dhikrFavorites: []
    },
    DHIKR_COUNTER_DATA: [
      { arabic: 'SubhanAllah', target: 33, color: '#16a34a' },
      { arabic: 'Alhamdulillah', target: 5, color: '#f59e0b' }
    ],
    DHIKR_BADGES: [],
    today: () => '2026-08-11',
    yesterdayKey: () => '2026-08-10',
    saveState: () => {},
    toast: () => {},
    playSound: () => {},
    lvFrom: (xp) => 1,
    lvTitle: () => 'Seeker',
    checkLevelUp: () => {},
    renderDhikrCounter: () => {},
    navigator: {},
    document: { getElementById: () => null },
    iqIcon: () => ''
  }, overrides || {}));
  // dhikr.js now grants xp via applyXpDelta; load the real primitive into the
  // same sandbox so its closures see this harness's S/lvFrom.
  const xpSrc = fs.readFileSync(path.join(__dirname, '..', 'core', 'xp.js'), 'utf8');
  vm.runInNewContext(xpSrc, sandbox, { filename: 'core/xp.js' });
  for (const key of Object.keys(sandbox.window)) sandbox[key] = sandbox.window[key];
  return sandbox;
}

test('tapDhikr: increments count', () => {
  const s = setup();
  s.window.tapDhikr();
  assert.strictEqual(s.S.dhikrCounters[0], 1);
  assert.strictEqual(s.S.xp, 1);
});

test('tapDhikr: resets on target reached', () => {
  const s = setup();
  s.S.dhikrCounters[0] = 32;
  s.window.tapDhikr();
  assert.strictEqual(s.S.dhikrCounters[0], 0);
  assert.strictEqual(s.S.xp, 21); // 1 per tap + 20 bonus
});

test('addCustomDhikr: adds to list', () => {
  const s = setup();
  s.window.addCustomDhikr('Allahu Akbar', 'Allahu Akbar', 'God is Greatest', 100);
  assert.strictEqual(s.S.dhikrCustom.length, 1);
  assert.strictEqual(s.S.dhikrCustom[0].arabic, 'Allahu Akbar');
  assert.strictEqual(s.S.dhikrCustom[0].target, 100);
});

test('removeCustomDhikr: removes from list', () => {
  const s = setup();
  s.S.dhikrCustom = [{ id: 'custom_1', arabic: 'test' }];
  s.window.removeCustomDhikr('custom_1');
  assert.strictEqual(s.S.dhikrCustom.length, 0);
});

test('removeCustomDhikr: does nothing if id not found', () => {
  const s = setup();
  s.S.dhikrCustom = [{ id: 'custom_1', arabic: 'test' }];
  s.window.removeCustomDhikr('custom_999');
  assert.strictEqual(s.S.dhikrCustom.length, 1);
});

test('toggleDhikrHaptic flips S.dhikrSettings.haptic and persists', () => {
  let savedCalls = 0;
  const s = setup({
    saveState: () => { savedCalls++; },
    navigator: {}
  });
  s.S.dhikrSettings = { haptic: true };
  s.window.toggleDhikrHaptic();
  assert.strictEqual(s.S.dhikrSettings.haptic, false);
  assert.strictEqual(savedCalls, 1);
  s.window.toggleDhikrHaptic();
  assert.strictEqual(s.S.dhikrSettings.haptic, true);
});

test('toggleDhikrHaptic: creates dhikrSettings if missing (legacy state)', () => {
  const s = setup();
  delete s.S.dhikrSettings;
  s.window.toggleDhikrHaptic();
  assert.strictEqual(s.S.dhikrSettings.haptic, true);
});