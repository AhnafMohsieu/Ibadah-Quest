'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function loadRandom() {
  return loadFile(path.join(__dirname, '..', 'core', 'random.js'));
}

// loadFile runs random.js inside a fresh vm context whose intrinsics differ
// from this process's globals, so mutating outer Math.random would never be
// seen. weightedPick references Math.random at call time, so assigning
// sandbox.Math after load works (same pattern as shop.test.js mockMath).

test('weightedPick respects weights deterministically under stubbed Math.random', () => {
  const sb = loadRandom();
  sb.Math = { random: () => 0 };
  // random=0 → first entry always
  assert.strictEqual(sb.window.weightedPick([{ id: 'a', weight: 1 }, { id: 'b', weight: 9 }]).id, 'a');
});

test('weightedPick lands in later bucket proportionally', () => {
  const sb = loadRandom();
  sb.Math = { random: () => 0.95 }; // past a(1)/total(10) → b
  assert.strictEqual(sb.window.weightedPick([{ id: 'a', weight: 1 }, { id: 'b', weight: 9 }]).id, 'b');
});

test('weightedPick with roll near 1 lands on the last weighted entry', () => {
  const sb = loadRandom();
  sb.Math = { random: () => 0.999999999999 };
  const pool = [{ id: 'a', weight: 60 }, { id: 'b', weight: 25 }, { id: 'c', weight: 10 }, { id: 'd', weight: 5 }];
  assert.strictEqual(sb.window.weightedPick(pool).id, 'd');
});

test('weightedPick matches both legacy selection loops exactly across a roll sweep', () => {
  // Replicated verbatim from core/shop.js mystery-box branch (pre-refactor)
  function legacyShopPick(pool) {
    const total = pool.reduce((s, p) => s + p.weight, 0);
    let roll = Math.random() * total;
    let chosen = pool[0];
    for (const p of pool) { roll -= p.weight; if (roll <= 0) { chosen = p; break; } }
    return chosen;
  }
  // Replicated verbatim from features/surprise-rewards.js checkSurpriseReward (pre-refactor)
  function legacySurprisePick(pool) {
    const total = pool.reduce((s, p) => s + p.weight, 0);
    let roll = Math.random() * total;
    let chosen = pool[0];
    for (const p of pool) { roll -= p.weight; if (roll <= 0) { chosen = p; break; } }
    return chosen;
  }

  const shopPool = [
    { type: 'xp', weight: 60, min: 100, max: 2000 },
    { type: 'freeze', weight: 10 },
    { type: 'reroll', weight: 15 },
    { type: 'boost', weight: 15 }
  ];
  const surprisePool = [
    { type: 'xp', weight: 60, min: 50, max: 200 },
    { type: 'reroll', weight: 25 },
    { type: 'freeze', weight: 10 },
    { type: 'boost', weight: 5 }
  ];

  const sb = loadRandom();
  const rolls = [];
  for (let i = 0; i <= 1000; i++) rolls.push(i / 1000);
  rolls.push(0.9999999999999999); // largest double below 1

  for (const r of rolls) {
    sb.Math = { random: () => r };
    const origRandom = Math.random;
    Math.random = () => r;
    let shopExpected, surpriseExpected;
    try {
      shopExpected = legacyShopPick(shopPool);
      surpriseExpected = legacySurprisePick(surprisePool);
    } finally {
      Math.random = origRandom;
    }
    assert.strictEqual(
      sb.window.weightedPick(shopPool), shopExpected,
      `shop pool diverges at random=${r}`
    );
    assert.strictEqual(
      sb.window.weightedPick(surprisePool), surpriseExpected,
      `surprise pool diverges at random=${r}`
    );
  }
});
