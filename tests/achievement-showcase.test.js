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

test('getUnlockedAchievements returns empty array when no achievements unlocked', () => {
  const ACHS = [
    { id: 'a1', name: 'First Step', desc: 'Complete 1 prayer', tier: 'bronze', c: () => true },
    { id: 'a2', name: 'Perfect Day', desc: 'All 5 prayers', tier: 'bronze', c: () => true }
  ];
  const S = { ua: {}, achievementShowcase: { featured: [] } };
  const sandbox = loadSandbox(['features/achievement-showcase.js'], {
    ACHS, S, saveState: () => {}, toast: () => {}, iqIcon: () => ''
  });

  const result = sandbox.getUnlockedAchievements();
  assert.deepStrictEqual(result, []);
});

test('getUnlockedAchievements returns only unlocked achievements', () => {
  const ACHS = [
    { id: 'a1', name: 'First Step', desc: 'Complete 1 prayer', tier: 'bronze', c: () => true },
    { id: 'a2', name: 'Perfect Day', desc: 'All 5 prayers', tier: 'bronze', c: () => true }
  ];
  const S = { ua: { a1: true }, achievementShowcase: { featured: [] } };
  const sandbox = loadSandbox(['features/achievement-showcase.js'], {
    ACHS, S, saveState: () => {}, toast: () => {}, iqIcon: () => ''
  });

  const result = sandbox.getUnlockedAchievements();
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'a1');
});

test('featureAchievement adds to featured list', () => {
  const ACHS = [
    { id: 'a1', name: 'First Step', desc: 'Complete 1 prayer', tier: 'bronze', c: () => true }
  ];
  const S = { ua: { a1: true }, achievementShowcase: { featured: [] } };
  const sandbox = loadSandbox(['features/achievement-showcase.js'], {
    ACHS, S, saveState: () => {}, toast: () => {}, iqIcon: () => '',
    document: { getElementById: () => null }
  });

  sandbox.featureAchievement('a1');
  assert.deepStrictEqual(S.achievementShowcase.featured, ['a1']);
});

test('featureAchievement rejects when 6 already featured', () => {
  const ACHS = [
    { id: 'a1', name: 'First Step', tier: 'bronze' },
    { id: 'a2', name: 'Second', tier: 'silver' },
    { id: 'a3', name: 'Third', tier: 'gold' },
    { id: 'a4', name: 'Fourth', tier: 'gold' },
    { id: 'a5', name: 'Fifth', tier: 'platinum' },
    { id: 'a6', name: 'Sixth', tier: 'diamond' },
    { id: 'a7', name: 'Seventh', tier: 'legendary' }
  ];
  const S = { ua: { a1:true,a2:true,a3:true,a4:true,a5:true,a6:true,a7:true }, achievementShowcase: { featured: ['a1','a2','a3','a4','a5','a6'] } };
  let toastCalled = false;
  const sandbox = loadSandbox(['features/achievement-showcase.js'], {
    ACHS, S, saveState: () => {}, toast: (msg) => { toastCalled = true; }, iqIcon: () => '',
    document: { getElementById: () => null }
  });

  sandbox.featureAchievement('a7');
  assert.strictEqual(S.achievementShowcase.featured.length, 6);
  assert.ok(toastCalled);
});

test('unfeatureAchievement removes from featured list', () => {
  const ACHS = [
    { id: 'a1', name: 'First Step', tier: 'bronze' },
    { id: 'a2', name: 'Second', tier: 'silver' }
  ];
  const S = { ua: { a1: true, a2: true }, achievementShowcase: { featured: ['a1', 'a2'] } };
  const sandbox = loadSandbox(['features/achievement-showcase.js'], {
    ACHS, S, saveState: () => {}, toast: () => {}, iqIcon: () => '',
    document: { getElementById: () => null }
  });

  sandbox.unfeatureAchievement('a1');
  assert.deepStrictEqual(S.achievementShowcase.featured, ['a2']);
});

test('featureAchievement does not add duplicate', () => {
  const ACHS = [{ id: 'a1', name: 'First Step', tier: 'bronze' }];
  const S = { ua: { a1: true }, achievementShowcase: { featured: ['a1'] } };
  const sandbox = loadSandbox(['features/achievement-showcase.js'], {
    ACHS, S, saveState: () => {}, toast: () => {}, iqIcon: () => '',
    document: { getElementById: () => null }
  });

  sandbox.featureAchievement('a1');
  assert.deepStrictEqual(S.achievementShowcase.featured, ['a1']);
});
