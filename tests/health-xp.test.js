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

const levelTitles = [100, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000, 25000, 40000, 60000, 100000];
const sandbox = loadSandbox([
  'data/pools/health.js',
  'features/health.js'
], {
  S: {
    xp: 0, lv: 1,
    healthLog: {},
    healthXpClaimed: {},
    health: { monthStart: '', given: 0, daily: 0, monthly: 0 }
  },
  LEVELS: levelTitles.map((m, i) => ({ m, t: 'Tier' + (i + 1) })),
  today: () => '2026-08-10',
  saveState: () => {},
  lvFrom: (xp) => { let lv = 1; while (xp >= 100 * Math.pow(lv + 1, 1.5)) lv++; return lv; },
  lvTitle: (lv) => 'Tier' + lv,
  document: { getElementById: () => null }
});

const w = sandbox.window;
const S = sandbox.S;

function resetDay() {
  S.xp = 0;
  S.healthLog = { '2026-08-10': { water: 0, sleep: 0, exercise: [], meals: {} } };
  S.healthXpClaimed = { '2026-08-10': [] };
}

test('health: water milestone grants 25 XP once per day', () => {
  resetDay();
  w.logWater(8);
  assert.strictEqual(S.xp, 25, 'water target should grant 25 XP');
  w.logWater(8);
  assert.strictEqual(S.xp, 25, 'second log on same day must not grant again');
});

test('health: sleep milestone grants 25 XP once per day', () => {
  resetDay();
  w.logSleep(8);
  assert.strictEqual(S.xp, 25, 'sleep target should grant 25 XP');
  w.logSleep(10);
  assert.strictEqual(S.xp, 25, 're-logging must not double grant');
});

test('health: exercise milestone grants 25 XP once per day', () => {
  resetDay();
  w.logExercise('walking', 30);
  assert.strictEqual(S.xp, 25, 'any exercise log should grant 25 XP');
  w.logExercise('running', 30);
  assert.strictEqual(S.xp, 25, 'second exercise must not double grant');
});

test('health: all three meals grant 25 XP once per day', () => {
  resetDay();
  w.toggleMeal('breakfast');
  assert.strictEqual(S.xp, 0, 'one meal is not enough');
  w.toggleMeal('lunch');
  w.toggleMeal('dinner');
  assert.strictEqual(S.xp, 25, 'all three meals should grant 25 XP');
  w.toggleMeal('dinner');
  w.toggleMeal('dinner');
  assert.strictEqual(S.xp, 25, 'unchecking and rechecking must not double grant');
});

test('health: milestones stack (water+sleep+exercise+meals = 100)', () => {
  resetDay();
  w.logWater(8);
  w.logSleep(8);
  w.logExercise('walking', 30);
  w.toggleMeal('breakfast');
  w.toggleMeal('lunch');
  w.toggleMeal('dinner');
  assert.strictEqual(S.xp, 100, 'all four milestones should total 100 XP');
});

test('health: invalid input does not create invalid activity', () => {
  resetDay();
  w.logWater('not-a-number');
  w.logExercise('not-an-exercise', 30);
  w.toggleMeal('midnight-snack');
  assert.strictEqual(S.healthLog['2026-08-10'].water, 0);
  assert.deepStrictEqual(S.healthLog['2026-08-10'].exercise, []);
  assert.deepStrictEqual(S.healthLog['2026-08-10'].meals, {});
});
