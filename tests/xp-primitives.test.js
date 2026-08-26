'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function mk(opts) {
  opts = opts || {};
  const calls = { markDirty: [], saves: 0, renders: 0 };
  const sb = loadFile(path.join(__dirname, '..', 'core', 'xp.js'), {
    S: Object.assign({ xp: 100, lv: 2, log: {}, td: {}, vc: {}, xpDaily: {} }, opts.S || {}),
    lvFrom: xp => { let l = 1; while (xp >= 100 * l * l) l++; return l; }, // simple quadratic
    checkLevelUp: () => {},
    playSound: () => {},
    saveState: () => { calls.saves++; },
    markDirty: k => { calls.markDirty.push(k); },
    renderDynamic: () => { calls.renders++; },
    today: () => '2026-08-26',
    // xp.js's IIFE-internal checkLevelUp shadows this sandbox's stub, so on a
    // genuine level-up levelUpToast runs and needs these DOM stubs.
    lvTitle: () => 'Seeker',
    iqEmoji: () => '\u2B50',
    document: {
      activeElement: null,
      getElementById: () => ({ style: {}, classList: { add() {}, remove() {} }, innerHTML: '', onclick: null }),
      createElement: () => ({ style: { setProperty() {} }, className: '', textContent: '', appendChild() {}, remove() {}, setAttribute() {} }),
      body: { appendChild() {} }
    },
    setTimeout: () => 0,
    clearTimeout: () => {}
  });
  sb.__calls = calls;
  return sb;
}

test('applyXpDelta mutates xp, recomputes level, returns info, no side I/O', () => {
  const sb = mk({ S: { xp: 350, lv: 2 } });
  const r = sb.window.applyXpDelta(150);
  assert.strictEqual(sb.S.xp, 500);
  assert.strictEqual(r.newLv, 3);
  assert.strictEqual(r.leveledUp, true);
  assert.strictEqual(r.oldLv, 2);
  assert.strictEqual(sb.__calls.saves, 0, 'no implicit save');
  assert.strictEqual(sb.__calls.renders, 0, 'no implicit render');
});

test('negative delta allowed (no clamp) via applyXpDelta', () => {
  const sb = mk({ S: { xp: 10, lv: 2 } });
  sb.window.applyXpDelta(-30);
  assert.strictEqual(sb.S.xp, -20, 'raw primitive does not clamp');
});

test('spendXp clamps at zero like legacy Math.max(0, xp-cost)', () => {
  const sb = mk({ S: { xp: 10, lv: 2 } });
  sb.window.spendXp(30);
  assert.strictEqual(sb.S.xp, 0);
  const sb2 = mk({ S: { xp: 50, lv: 2 } });
  sb2.window.spendXp(30);
  assert.strictEqual(sb2.S.xp, 20);
});

test('saveAndRenderDirty saves once and marks the four standard panels', () => {
  const sb = mk({});
  sb.window.saveAndRenderDirty();
  assert.strictEqual(sb.__calls.saves, 1);
  assert.deepEqual([...sb.__calls.markDirty].sort(), ['lv', 'progress', 'today', 'topbar']);
  assert.strictEqual(sb.__calls.renders, 1);
});
