'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

const w = loadFile(path.join(__dirname, '..', 'features', 'garden.js')).window;

test('garden starts at Seed', () => {
  assert.strictEqual(w.gardenStage(0, 0).stage, 1);
  assert.strictEqual(w.gardenStage(0, 0).name, 'Seed');
});

test('stage requires BOTH xp and streak', () => {
  assert.strictEqual(w.gardenStage(149, 3).stage, 1);
  assert.strictEqual(w.gardenStage(150, 2).stage, 1);
  assert.strictEqual(w.gardenStage(150, 3).stage, 2);
});

test('highest unlocked stage wins', () => {
  assert.strictEqual(w.gardenStage(4000, 30).stage, 5);
  assert.strictEqual(w.gardenStage(4000, 15).stage, 4);
  assert.strictEqual(w.gardenStage(2000, 14).stage, 4);
});

test('xpPct progresses inside the stage XP range', () => {
  assert.strictEqual(w.gardenStage(325, 3).xpPct, 0.5); // (325-150)/(500-150)
});

test('flowers grow with streak beyond 30, capped at 7', () => {
  assert.strictEqual(w.flowerCount(30), 1);
  assert.strictEqual(w.flowerCount(45), 4);
  assert.strictEqual(w.flowerCount(80), 7);
});
