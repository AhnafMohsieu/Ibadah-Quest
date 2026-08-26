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

function createSandbox(cs, bs, milestones) {
  const sandbox = loadSandbox(['core/xp.js', 'features/streak-milestones.js'], {
    S: {
      cs: cs || 0,
      bs: bs || 0,
      xp: 0,
      milestones: milestones || []
    },
    lvFrom: () => 1,
    toast: () => {},
    saveState: () => {}
  });
  return sandbox;
}

test('7-day streak grants 200 XP', () => {
  const { checkMilestones, S } = createSandbox(7, 0);
  checkMilestones();
  assert.strictEqual(S.xp, 200);
});

test('14-day streak grants 400 XP (cumulative 600)', () => {
  const { checkMilestones, S } = createSandbox(14, 0);
  checkMilestones();
  assert.strictEqual(S.xp, 600);
});

test('30-day streak grants 1000 XP (cumulative 1600)', () => {
  const { checkMilestones, S } = createSandbox(30, 0);
  checkMilestones();
  assert.strictEqual(S.xp, 1600);
});

test('60-day streak grants 2000 XP (cumulative 3600)', () => {
  const { checkMilestones, S } = createSandbox(60, 0);
  checkMilestones();
  assert.strictEqual(S.xp, 3600);
});

test('100-day streak grants 5000 XP (cumulative 8600)', () => {
  const { checkMilestones, S } = createSandbox(100, 0);
  checkMilestones();
  assert.strictEqual(S.xp, 8600);
});

test('200-day streak grants 10000 XP (cumulative 18600)', () => {
  const { checkMilestones, S } = createSandbox(200, 0);
  checkMilestones();
  assert.strictEqual(S.xp, 18600);
});

test('365-day streak grants 25000 XP (cumulative 43600)', () => {
  const { checkMilestones, S } = createSandbox(365, 0);
  checkMilestones();
  assert.strictEqual(S.xp, 43600);
});

test('idempotent - second call does not double-grant', () => {
  const { checkMilestones, S } = createSandbox(7, 0);
  checkMilestones();
  assert.strictEqual(S.xp, 200);
  checkMilestones();
  assert.strictEqual(S.xp, 200);
});

test('streak below 7 grants nothing', () => {
  const { checkMilestones, S } = createSandbox(6, 0);
  checkMilestones();
  assert.strictEqual(S.xp, 0);
});

test('uses max of cs and bs', () => {
  const { checkMilestones, S } = createSandbox(3, 14, []);
  checkMilestones();
  assert.strictEqual(S.xp, 600);
  assert.deepStrictEqual(S.milestones, [7, 14]);
});

test('initializes S.milestones if missing', () => {
  const { checkMilestones, S } = loadSandbox(['core/xp.js', 'features/streak-milestones.js'], {
    S: { cs: 7, bs: 0, xp: 0 },
    lvFrom: () => 1,
    toast: () => {},
    saveState: () => {}
  });
  assert.strictEqual(S.milestones, undefined);
  checkMilestones();
  assert.ok(Array.isArray(S.milestones));
  assert.strictEqual(S.milestones.length, 1);
  assert.strictEqual(S.milestones[0], 7);
});
