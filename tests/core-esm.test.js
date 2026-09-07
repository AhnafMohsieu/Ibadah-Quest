// tests/core-esm.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');

test('freshState backfills + xp pipeline is pure', async () => {
  const { freshState, normalizeState } = await import('../src/core/state.js');
  const { applyXpDelta, spendXp } = await import('../src/core/xp.js');
  const d = freshState('2026-09-07');
  assert.equal(d.schemaVersion, 2);
  assert.equal(d.xp, 0);
  const normalized = normalizeState({ xp: 5 });
  assert.equal(normalized.lv, 1);
  assert.ok('schemaVersion' in normalized);
  const S = freshState('2026-09-07');
  const r = applyXpDelta(S, 10, { skipLevelToast: true });
  assert.equal(S.xp, 10);
  assert.equal(r.leveledUp, false); // xpFor(2) = 282, so +10 stays level 1
  spendXp(S, 4, { skipLevelToast: true });
  assert.equal(S.xp, 6);
});
