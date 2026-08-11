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

test('getSeasonalMultiplier returns 1 by default', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: null, ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {}
  });

  assert.strictEqual(sandbox.getSeasonalMultiplier(), 1);
});

test('activateSeason ramadan sets active and returns 2x multiplier', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: null, ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {},
    document: { getElementById: () => ({ innerHTML: '' }) }
  });

  sandbox.activateSeason('ramadan');
  assert.strictEqual(sandbox.S.seasonal.active, 'ramadan');
  assert.strictEqual(sandbox.getSeasonalMultiplier(), 2);
});

test('deactivateSeason resets to 1x', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: 'ramadan', ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {},
    document: { getElementById: () => ({ innerHTML: '' }) }
  });

  sandbox.deactivateSeason();
  assert.strictEqual(sandbox.S.seasonal.active, null);
  assert.strictEqual(sandbox.getSeasonalMultiplier(), 1);
});

test('claimEidReward adds to eidRewards array', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: 'ramadan', ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {}
  });

  sandbox.claimEidReward('fitr');
  assert.deepStrictEqual(sandbox.S.seasonal.eidRewards, ['fitr']);
});

test('claimEidReward does not duplicate', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: 'ramadan', ramadanQuests: [], hajjDays: 0, eidRewards: ['fitr'] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {}
  });

  sandbox.claimEidReward('fitr');
  assert.deepStrictEqual(sandbox.S.seasonal.eidRewards, ['fitr']);
});

test('trackHajjDay increments hajjDays', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: 'hajj', ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {}
  });

  sandbox.trackHajjDay();
  assert.strictEqual(sandbox.S.seasonal.hajjDays, 1);
  sandbox.trackHajjDay();
  assert.strictEqual(sandbox.S.seasonal.hajjDays, 2);
});

test('trackHajjDay does nothing when not hajj season', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: 'ramadan', ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {}
  });

  sandbox.trackHajjDay();
  assert.strictEqual(sandbox.S.seasonal.hajjDays, 0);
});

test('hajj season returns 1.5x multiplier', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: 'hajj', ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {}
  });

  assert.strictEqual(sandbox.getSeasonalMultiplier(), 1.5);
});

test('seasonalActive returns true when a season is active', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: 'ramadan', ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {}
  });

  assert.strictEqual(sandbox.seasonalActive(), true);
});

test('seasonalActive returns false when no season is active', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: null, ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {}
  });

  assert.strictEqual(sandbox.seasonalActive(), false);
});
