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

test('seasonForDate maps Ramadan/Dhul-Hijjah via Hijri math and null otherwise', () => {
  // Derive Gregorian anchors from the same algorithm as render/calendar.js so
  // this test validates season ROUTING, not calendar arithmetic.
  function hijriToGregorianLocal(hY, hM, hD) {
    const jd = Math.floor((11 * hY + 3) / 30) + 354 * hY + 30 * hM -
               Math.floor((hM - 1) / 2) + hD + 1948440 - 385;
    const l = jd + 68569;
    const n = Math.floor((4 * l) / 146097);
    const remainder = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (remainder + 1)) / 1461001);
    const remainderI = remainder - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * remainderI) / 2447);
    const gD = remainderI - Math.floor((2447 * j) / 80);
    const remainderJ2 = Math.floor(j / 11);
    // Tail mirrors render/calendar.js hijriToGregorian so anchors round-trip
    // against its gregorianToHijri (tabular pair has +-1 day internal drift).
    const gM = j + 2 - 12 * remainderJ2;
    const gY = 100 * (n - 49) + i + remainderJ2;
    return { y: gY, m: gM, d: gD };
  }

  // Stubbed gregorianToHijri: exact copy of the app's algorithm
  // (render/calendar.js) so routing is exercised against production math.
  function gregorianToHijriStub(gY, gM, gD) {
    const jd = Math.floor((1461 * (gY + 4800 + Math.floor((gM - 14) / 12))) / 4) +
               Math.floor((367 * (gM - 2 - 12 * Math.floor((gM - 14) / 12))) / 12) -
               Math.floor((3 * Math.floor((gY + 4900 + Math.floor((gM - 14) / 12)) / 100)) / 4) +
               gD - 32075;
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const remainder = l - 10631 * n + 354;
    const j = Math.floor((10985 - remainder) / 5316) * Math.floor((50 * remainder) / 17719) +
              Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);
    const remainderJ = remainder - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
                       Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const hM = Math.floor((24 * remainderJ) / 709);
    const hD = remainderJ - Math.floor((709 * hM) / 24);
    const hY = 30 * n + j - 30;
    return { year: hY, month: hM, day: hD };
  }

  const sb = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: null, ramadanQuests: [], hajjDays: 0, eidRewards: [], arafahDone: false } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {},
    document: { getElementById: () => ({ innerHTML: '' }) },
    window: { gregorianToHijri: gregorianToHijriStub }
  });

  const ram1 = hijriToGregorianLocal(1445, 9, 1);
  assert.strictEqual(
    sb.window.seasonForDate(new Date(ram1.y, ram1.m - 1, ram1.d)), 'ramadan');

  const dhi9 = hijriToGregorianLocal(1445, 12, 9);
  assert.strictEqual(
    sb.window.seasonForDate(new Date(dhi9.y, dhi9.m - 1, dhi9.d)), 'hajj');

  const shw15 = hijriToGregorianLocal(1445, 10, 15);
  assert.strictEqual(
    sb.window.seasonForDate(new Date(shw15.y, shw15.m - 1, shw15.d)), null);

  assert.strictEqual(sb.window.seasonForDate(new Date('not-a-date')), null);
});

test('syncSeason activates on range entry, is idempotent, deactivates on exit', () => {
  // Harness with controllable clock: syncSeason takes an ISO string, so feed
  // fixed dates. Stub gregorianToHijri deterministically.
  let saved = 0;
  const sbx = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: null, ramadanQuests: [], hajjDays: 0, eidRewards: [], arafahDone: false } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {},
    document: { getElementById: () => ({ innerHTML: '' }) },
    window: {
      gregorianToHijri: (y, m, d) => (m === 3 && d <= 10) ? { year: 1445, month: 9, day: d } :
                              (m === 6 && d <= 10) ? { year: 1445, month: 12, day: d } :
                              { year: 1445, month: 7, day: d }
    }
  });
  sbx.saveState = () => { saved++; };
  sbx.window.saveState = sbx.saveState;

  sbx.window.syncSeason('2026-03-01');
  assert.strictEqual(sbx.S.seasonal.active, 'ramadan');
  const afterActivate = saved;

  sbx.window.syncSeason('2026-03-05');            // same season again
  assert.strictEqual(sbx.S.seasonal.active, 'ramadan');
  assert.strictEqual(saved, afterActivate, 'idempotent: no extra transition work');

  sbx.window.syncSeason('2026-06-02');            // ramadan -> hajj
  assert.strictEqual(sbx.S.seasonal.active, 'hajj');

  sbx.window.syncSeason('2026-07-15');            // off-season
  assert.strictEqual(sbx.S.seasonal.active, null);
});

test('isRamadan returns true when active is ramadan', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: 'ramadan', ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {}
  });
  assert.strictEqual(sandbox.isRamadan(), true);
});

test('isRamadan returns false when active is not ramadan', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: 'hajj', ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {}
  });
  assert.strictEqual(sandbox.isRamadan(), false);
});

test('isHajjSeason returns true when active is hajj', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: 'hajj', ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {}
  });
  assert.strictEqual(sandbox.isHajjSeason(), true);
});

test('isHajjSeason returns false when active is not hajj', () => {
  const sandbox = loadSandbox(['features/seasonal-events.js'], {
    S: { seasonal: { active: 'ramadan', ramadanQuests: [], hajjDays: 0, eidRewards: [] } },
    today: () => '2026-08-12',
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '⭐',
    grantDailyXp: () => true,
    checkA: () => {}
  });
  assert.strictEqual(sandbox.isHajjSeason(), false);
});
