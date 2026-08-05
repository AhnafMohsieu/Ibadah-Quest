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

const sandbox = loadSandbox([
  'features/spiritual-growth/data.js',
  'features/garden.js'
], { S: { xp: 0, cs: 0, bs: 0 } });

const w = sandbox.window;
const S = sandbox.S;

function setS(xp, cs, bs) {
  S.xp = xp; S.cs = cs; S.bs = bs || 0;
}

test('garden has 7 stages', () => {
  setS(0, 0, 0);
  assert.strictEqual(w.gardenStage(0, 0).stage, 1);
  assert.strictEqual(w.gardenStage(0, 0).name, 'Seed');
  setS(25000, 0, 0);
  assert.strictEqual(w.gardenStage(25000, 0).stage, 7);
  assert.strictEqual(w.gardenStage(25000, 0).name, 'Paradise Garden');
});

test('stage advances by combined score (xp + streak*10)', () => {
  setS(140, 0, 0);
  assert.strictEqual(w.gardenStage(140, 0).stage, 1);
  setS(150, 0, 0);
  assert.strictEqual(w.gardenStage(150, 0).stage, 2);
  setS(100, 5, 0);
  assert.strictEqual(w.gardenStage(100, 5).stage, 2);
});

test('highest unlocked stage wins', () => {
  setS(10000, 0, 0);
  assert.strictEqual(w.gardenStage(10000, 0).stage, 6);
  setS(3900, 0, 0);
  assert.strictEqual(w.gardenStage(3900, 0).stage, 4);
  setS(3900, 10, 0);
  assert.strictEqual(w.gardenStage(3900, 10).stage, 5);
});

test('xpPct progresses inside the stage XP range', () => {
  setS(295, 3, 0);
  assert.strictEqual(w.gardenStage(295, 3).xpPct, 0.5);
});

test('flowers grow with streak beyond 30, capped at 12', () => {
  assert.strictEqual(w.flowerCount(30), 1);
  assert.strictEqual(w.flowerCount(45), 4);
  assert.strictEqual(w.flowerCount(100), 12);
});

test('flowerCount returns 0 before the bloom stage', () => {
  assert.strictEqual(w.flowerCount(10), 0);
  assert.strictEqual(w.flowerCount(29), 0);
});

test('stage boundary at combined 500 rolls to Sapling', () => {
  setS(439, 6, 0);
  assert.strictEqual(w.gardenStage(439, 6).stage, 2);
  setS(440, 6, 0);
  assert.strictEqual(w.gardenStage(440, 6).stage, 3);
});

test('xpPct clamps to [0, 1] within the stage range', () => {
  setS(0, 0, 0);
  assert.strictEqual(w.gardenStage(0, 0).xpPct, 0);
  setS(25000, 0, 0);
  assert.strictEqual(w.gardenStage(25000, 0).xpPct, 1);
});

test('stage 6 and 7 are reachable', () => {
  setS(10000, 0, 0);
  assert.strictEqual(w.gardenStage(10000, 0).stage, 6);
  setS(25000, 0, 0);
  assert.strictEqual(w.gardenStage(25000, 0).stage, 7);
});
