'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { loadFile } = require('./helpers/load');

function setup() {
  const ctx = loadFile(path.join(__dirname, '..', 'state', 'state.js'));
  const S = ctx.freshState();
  ctx.S = S;
  ctx.saveState = () => {};
  ctx.renderLv = () => {};
  ctx.renderTopBar = () => {};
  ctx.playSound = () => {};
  ctx.lvTitle = () => 'Seeker';
  ctx.document = {
    getElementById: () => ({
      style: {}, classList: { add: () => {}, remove: () => {} },
      innerHTML: '', onclick: null
    }),
    createElement: () => ({
      style: { setProperty: () => {} }, className: '', textContent: '',
      appendChild: () => {}, remove: () => {}
    }),
    body: { appendChild: () => {} },
    activeElement: null
  };
  ctx.iqEmoji = () => '⭐';
  ctx.setTimeout = (fn) => fn();
  ctx.clearTimeout = () => {};
  return ctx;
}

function loadXp(ctx) {
  loadFile(path.join(__dirname, '..', 'core', 'xp.js'), ctx);
}

describe('lvFrom', () => {
  it('returns 1 for 0 xp', () => {
    const ctx = setup();
    assert.equal(ctx.lvFrom(0), 1);
  });

  it('returns 1 for xp below level 2 threshold', () => {
    const ctx = setup();
    assert.equal(ctx.lvFrom(281), 1);
  });

  it('returns 2 at level 2 threshold', () => {
    const ctx = setup();
    assert.equal(ctx.lvFrom(282), 2);
  });

  it('returns correct level for higher xp', () => {
    const ctx = setup();
    const lv3 = ctx.xpFor(3);
    assert.equal(ctx.lvFrom(lv3), 3);
  });
});

describe('xpFor', () => {
  it('returns 0 for level 1', () => {
    const ctx = setup();
    assert.equal(ctx.xpFor(1), 0);
  });

  it('returns positive for level 2', () => {
    const ctx = setup();
    assert.ok(ctx.xpFor(2) > 0);
  });

  it('increases with level', () => {
    const ctx = setup();
    assert.ok(ctx.xpFor(5) > ctx.xpFor(3));
  });
});

describe('grantDailyXp', () => {
  it('grants XP on first call with a given key', () => {
    const ctx = setup();
    loadXp(ctx);
    const result = ctx.window.grantDailyXp(50, 'test');
    assert.equal(result, true);
    assert.equal(ctx.S.xp, 50);
  });

  it('returns false on duplicate key same day', () => {
    const ctx = setup();
    const S = ctx.S;
    S.xpDaily = {};
    S.xpDaily['test|' + ctx.today()] = true;
    loadXp(ctx);
    const result = ctx.window.grantDailyXp(50, 'test');
    assert.equal(result, false);
    assert.equal(S.xp, 0);
  });

  it('initializes xpDaily if missing', () => {
    const ctx = setup();
    const S = ctx.S;
    delete S.xpDaily;
    loadXp(ctx);
    ctx.window.grantDailyXp(50, 'test');
    assert.ok(S.xpDaily);
    assert.equal(S.xpDaily['test|' + ctx.today()], true);
  });

  it('updates level when xp crosses threshold', () => {
    const ctx = setup();
    const S = ctx.S;
    S.xp = 270;
    loadXp(ctx);
    ctx.window.grantDailyXp(20, 'test');
    assert.equal(S.xp, 290);
    assert.ok(S.lv >= 2);
  });

  it('uses different keys independently', () => {
    const ctx = setup();
    loadXp(ctx);
    assert.equal(ctx.window.grantDailyXp(50, 'keyA'), true);
    assert.equal(ctx.window.grantDailyXp(50, 'keyB'), true);
    assert.equal(ctx.S.xp, 100);
  });
});

describe('grantCappedDailyXp', () => {
  it('grants XP and returns true under cap', () => {
    const ctx = setup();
    loadXp(ctx);
    const result = ctx.window.grantCappedDailyXp(10, 'captest', 3);
    assert.equal(result, true);
    assert.equal(ctx.S.xp, 10);
  });

  it('increments count correctly', () => {
    const ctx = setup();
    loadXp(ctx);
    const S = ctx.S;
    ctx.window.grantCappedDailyXp(10, 'captest', 3);
    const ck = 'captest|count|' + ctx.today();
    assert.equal(S.xpDaily[ck], 1);
  });

  it('returns false when count reaches cap', () => {
    const ctx = setup();
    loadXp(ctx);
    const S = ctx.S;
    ctx.window.grantCappedDailyXp(10, 'captest', 2);
    ctx.window.grantCappedDailyXp(10, 'captest', 2);
    const result = ctx.window.grantCappedDailyXp(10, 'captest', 2);
    assert.equal(result, false);
    assert.equal(S.xp, 20);
  });

  it('does not add XP when cap is reached', () => {
    const ctx = setup();
    loadXp(ctx);
    const S = ctx.S;
    ctx.window.grantCappedDailyXp(10, 'captest', 1);
    ctx.window.grantCappedDailyXp(10, 'captest', 1);
    assert.equal(S.xp, 10);
  });

  it('initializes xpDaily if missing', () => {
    const ctx = setup();
    const S = ctx.S;
    delete S.xpDaily;
    loadXp(ctx);
    ctx.window.grantCappedDailyXp(10, 'captest', 3);
    assert.ok(S.xpDaily);
  });

  it('handles cap of 1 (single use)', () => {
    const ctx = setup();
    loadXp(ctx);
    assert.equal(ctx.window.grantCappedDailyXp(10, 'single', 1), true);
    assert.equal(ctx.window.grantCappedDailyXp(10, 'single', 1), false);
    assert.equal(ctx.S.xp, 10);
  });
});
