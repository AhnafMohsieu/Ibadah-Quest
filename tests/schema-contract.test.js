'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function loadStateModule(store) {
  return loadFile(path.join(__dirname, '..', 'state', 'state.js'), { localStorage: store });
}
function plain(v) {
  return v === undefined ? undefined : JSON.parse(JSON.stringify(v));
}
function makeStore(initial) {
  const store = Object.assign({}, initial);
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  };
}

const EXPECTED = {
  personalGoals: [],  seasonal: { active: null, ramadanQuests: [], hajjDays: 0, eidRewards: [], arafahDone: false },
  xpDaily: {},
  combos: {},
  milestones: [],
  achievementShowcase: { featured: [], unlockedAt: {} },
  dailyRatings: {},
  dailyReflections: {},
  lastDailyRitual: null,
  lastDailySummary: null,
  lastWeeklySummary: null,
  lastWeeklyConsistency: null,
  healthXpClaimed: {},
  ownedTitles: [],
  activeTitle: null,
  ownedFrames: [],
  activeFrame: null,
  lastAllPrayersSurprise: null,
  dhikrSettings: { haptic: true }
};

test('freshState declares every formerly-ad-hoc field', () => {
  const sb = loadStateModule(makeStore({}));
  const f = sb.window.freshState();
  for (const [k, v] of Object.entries(EXPECTED)) {
    assert.deepStrictEqual(plain(f[k]), v, 'field ' + k);
  }
});

test('normalizeState backfills all of them into legacy saves', () => {
  const legacy = JSON.stringify({
    log: { '2026-01-01': { p: {}, d: {}, v: {} } }, xp: 250, lv: 2, td: {}, vc: {}
  });
  const store = makeStore({ iq9_user_default: legacy });
  const sb = loadStateModule(store);
  const p = sb.window.loadState();
  for (const [k, v] of Object.entries(EXPECTED)) {
    assert.deepStrictEqual(plain(p[k]), v, 'backfilled ' + k);
  }
  assert.strictEqual(p.xp, 250, 'legacy data preserved');
});

test('backfill preserves existing user values (no clobber)', () => {
  const legacy = JSON.stringify({
    log: {}, xp: 10, td: {}, vc: {},
    ownedTitles: ['title_a'], activeTitle: 'title_a',
    dhikrSettings: { haptic: false },
    seasonal: { active: 'ramadan', ramadanQuests: [], hajjDays: 3, eidRewards: [], arafahDone: true }
  });
  const sb = loadStateModule(makeStore({ iq9_user_default: legacy }));
  const p = sb.window.loadState();
  assert.deepStrictEqual(plain(p.ownedTitles), ['title_a']);
  assert.strictEqual(p.activeTitle, 'title_a');
  assert.deepStrictEqual(plain(p.dhikrSettings), { haptic: false }, 'user pref must win over default');
  assert.strictEqual(p.seasonal.active, 'ramadan');
  assert.strictEqual(p.seasonal.hajjDays, 3);
});
