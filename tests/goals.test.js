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

test('addPersonalGoal creates goal', () => {
  const sandbox = loadSandbox(['core/xp.js', 'features/personal-goals.js'], {
    S: { personalGoals: [] },
    today: () => '2026-08-11',
    saveState: () => {},
    renderPersonalGoals: () => {},
    document: { getElementById: () => null }
  });
  
  sandbox.addPersonalGoal('prayer', 30, '2026-08-31');
  assert.strictEqual(sandbox.S.personalGoals.length, 1);
  assert.strictEqual(sandbox.S.personalGoals[0].type, 'prayer');
  assert.strictEqual(sandbox.S.personalGoals[0].target, 30);
  assert.strictEqual(sandbox.S.personalGoals[0].current, 0);
  assert.strictEqual(sandbox.S.personalGoals[0].completed, false);
});

test('updateGoalProgress increments progress', () => {
  const sandbox = loadSandbox(['core/xp.js', 'features/personal-goals.js'], {
    S: { personalGoals: [{ id: 'g1', type: 'prayer', target: 30, current: 0, deadline: '2026-08-31', xpReward: 300, completed: false }] },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {},
    lvFrom: () => 1,
    iqIcon: () => '⭐',
    document: { getElementById: () => null }
  });
  
  sandbox.updateGoalProgress('g1');
  assert.strictEqual(sandbox.S.personalGoals[0].current, 1);
});

test('updateGoalProgress completes goal at target', () => {
  const sandbox = loadSandbox(['core/xp.js', 'features/personal-goals.js'], {
    S: { 
      xp: 100,
      lv: 1,
      personalGoals: [{ id: 'g1', type: 'prayer', target: 1, current: 0, deadline: '2026-08-31', xpReward: 100, completed: false }] 
    },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {},
    lvFrom: () => 1,
    iqIcon: () => '⭐',
    document: { getElementById: () => null }
  });
  
  sandbox.updateGoalProgress('g1');
  assert.strictEqual(sandbox.S.personalGoals[0].completed, true);
  assert.strictEqual(sandbox.S.xp, 200); // 100 + 100 reward
});
