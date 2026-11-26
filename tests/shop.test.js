'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { loadFile } = require('./helpers/load.js');

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

function stub() { return () => {}; }
function docStub() {
  return {
    getElementById: () => ({ style: {}, classList: { add: stub(), remove: stub() }, innerHTML: '', onclick: null, querySelector: () => null, querySelectorAll: () => [], getAttribute: () => '' }),
    querySelector: () => null,
    querySelectorAll: () => [],
    documentElement: { style: {}, setAttribute: stub(), removeAttribute: stub(), getAttribute: () => '' },
    createElement: () => ({ style: {}, classList: { add: stub(), remove: stub() }, textContent: '', appendChild: stub(), remove: stub() }),
    body: { appendChild: stub() },
    addEventListener: stub()
  };
}

function createSandbox(overrides) {
  const S = Object.assign({ xp: 1000, ur: {}, lv: 1, cs: 0, tp: 0, dq: [], wq: [], mq: [], yq: [], lq: [], lad: '2026-08-11', ua: {} }, overrides);
  const sandbox = loadSandbox(['data/pools/new-pools.js', 'data/shop.js', 'core/xp.js', 'core/random.js', 'core/shop.js', 'core/actions.js'], {
    S,
    SHOP: [],
    DQUESTS: [], WQUESTS: [], MQUESTS: [], YQUESTS: [], LQUESTS: [],
    lvFrom: () => 1,
    lvTitle: () => 'Test',
    today: () => '2026-08-11',
    isFri: () => false,
    toast: () => {},
    playSound: () => {},
    iqIcon: () => '',
    iqEmoji: () => '',
    saveState: () => {},
    checkA: () => {},
    renderAll: () => {},
    renderDynamic: () => {},
    markDirty: () => {},
    clearDirty: () => {},
    renderLv: () => {},
    genDQ: () => {},
    genWQ: () => {},
    genMQ: () => {},
    genYQ: () => {},
    genLQ: () => {},
    toggleQuest: () => {},
    iqIcon: () => '⭐',
    iqEmoji: () => '⭐',
    trackQuestXP: () => {},
    tlog: () => ({ p: {}, v: {} }),
    renderTab: () => {},
    updateTopBar: () => {},
    recalc: () => {},
    checkQ: () => {},
    checkLevelUp: () => {},
    document: docStub(),
    setTimeout: (fn, ms) => fn(),
    clearTimeout: stub(),
    resolveCurrentUser: stub(),
    loadState: () => S,
    addGratitude: stub(),
    toggleFasting: stub(),
    setCharityGoals: stub(),
    toggleMorning: stub(),
    toggleEvening: stub(),
    logWater: stub(),
    logSleep: stub(),
    logExercise: stub(),
    toggleMeal: stub(),
    openMuhasabah: stub(),
    dismissMuhasabah: stub(),
    joinJourney: stub(),
    addMemorization: stub(),
    calPrevMonth: stub(),
    calNextMonth: stub(),
    calGoToday: stub(),
    setQuranView: stub(),
    quranSearchFilter: stub(),
    openQuranSurah: stub(),
    quranBack: stub(),
    openQuranJuz: stub(),
    openHadithCollection: stub(),
    openHadithBook: stub(),
    hadithBack: stub(),
    playQuranVerse: stub(),
    playSurah: stub(),
    stopSurah: stub(),
    setQuranReciter: stub(),
    playJuz: stub(),
    updateJuzButton: stub(),
    refreshContent: stub(),
    initCalView: stub(),
    renderDailyContent: stub(),
    showWeeklySummary: stub(),
    TAB_GROUPS: { profile_main: [] },
    PRAYERS: [],
    VOLUNTARY: [],
    DEEDS: [],
    ACHS: [],
    DETAILS: {},
    TIPS: {},
    ws: () => '2026-W32'
  });
  return { sandbox, S };
}

test('ethical shop contains zero RNG mystery loot boxes and rewards earned themes/titles/rerolls cleanly', () => {
  const realShop = loadSandbox(['data/shop.js'], {});
  assert.ok(Array.isArray(realShop.SHOP) && realShop.SHOP.length > 0);
  assert.ok(!realShop.SHOP.some(item => item.t === 'mystery'), 'RNG loot box must be removed');
  assert.ok(!realShop.SHOP.some(item => /Friend of Allah|Pure Soul|Ultimate Flex/i.test(item.name)), 'presumptuous/vanity titles must be removed');
});

test('reroll reward regenerates daily quests safely without RNG traps', () => {
  let dqGen = 0;
  const S = { xp: 500, ur: {}, lv: 1, ownedTitles: [], ownedFrames: [] };
  const sandbox = loadSandbox(['core/xp.js', 'core/random.js', 'core/shop.js'], {
    S,
    SHOP: [{ id: 'reroll1', name: 'New Daily Quests', cost: 250, t: 'reroll' }],
    today: () => '2026-08-11',
    toast: () => {},
    saveState: () => {},
    renderAll: () => {},
    renderDynamic: () => {},
    markDirty: () => {},
    clearDirty: () => {},
    checkA: () => {},
    checkLevelUp: () => {},
    lvFrom: () => 1,
    iqIcon: () => '',
    genDQ: () => { dqGen++; },
    document: { querySelectorAll: () => [] },
    setTimeout: (fn) => fn()
  });
  sandbox.window.buy('reroll1');
  assert.strictEqual(S.xp, 250);
  assert.strictEqual(dqGen, 1);
});

test('selectTitle sets active title', () => {
  const S = { xp: 1000, ur: {}, lv: 1, cs: 0, tp: 0, ownedTitles: ['r1', 'r7'], activeTitle: null };
  const sandbox = loadSandbox(['data/pools/new-pools.js', 'data/shop.js', 'core/actions.js'], {
    S,
    SHOP: [{ id:'r1', name:'Title: True Seeker', cost:300 }],
    lvFrom: () => 1,
    lvTitle: () => 'Test',
    today: () => '2026-08-11',
    toast: () => {},
    playSound: () => {},
    saveState: () => {},
    renderProfile: () => {},
    iqIcon: () => '',
    iqEmoji: () => '',
    document: docStub(),
    setTimeout: (fn) => fn(),
    clearTimeout: stub(),
    renderAll: stub(),
    renderDynamic: stub(),
    renderLv: stub(),
    renderTopBar: stub(),
    checkA: stub(),
    checkLevelUp: stub(),
    checkQ: stub(),
    recalc: stub(),
    genDQ: stub(),
    tlog: () => ({ p: {}, v: {} }),
    TAB_GROUPS: { profile_main: [] },
    PRAYERS: [],
    VOLUNTARY: [],
    DEEDS: [],
    ACHS: [],
    DETAILS: {},
    TIPS: {},
    trackQuestXP: stub()
  });
  
  sandbox.selectTitle('r1');
  assert.strictEqual(S.activeTitle, 'r1');
});

test('selectTitle rejects unowned title', () => {
  const S = { xp: 1000, ur: {}, lv: 1, cs: 0, tp: 0, ownedTitles: ['r1'], activeTitle: null };
  const sandbox = loadSandbox(['data/pools/new-pools.js', 'data/shop.js', 'core/actions.js'], {
    S,
    SHOP: [{ id:'r1', name:'Title: True Seeker', cost:300 }],
    lvFrom: () => 1,
    lvTitle: () => 'Test',
    today: () => '2026-08-11',
    toast: () => {},
    playSound: () => {},
    saveState: () => {},
    renderProfile: () => {},
    iqIcon: () => '',
    iqEmoji: () => '',
    document: docStub(),
    setTimeout: (fn) => fn(),
    clearTimeout: stub(),
    renderAll: stub(),
    renderDynamic: stub(),
    renderLv: stub(),
    renderTopBar: stub(),
    checkA: stub(),
    checkLevelUp: stub(),
    checkQ: stub(),
    recalc: stub(),
    tlog: () => ({ p: {}, v: {} }),
    TAB_GROUPS: { profile_main: [] },
    PRAYERS: [],
    VOLUNTARY: [],
    DEEDS: [],
    ACHS: [],
    DETAILS: {},
    TIPS: {},
    trackQuestXP: stub()
  });
  
  sandbox.selectTitle('r7');
  assert.strictEqual(S.activeTitle, null);
});

test('selectFrame sets active frame', () => {
  const S = { xp: 1000, ur: {}, lv: 1, cs: 0, tp: 0, ownedFrames: ['r10', 'r19'], activeFrame: null };
  const sandbox = loadSandbox(['data/pools/new-pools.js', 'data/shop.js', 'core/actions.js'], {
    S,
    SHOP: [{ id:'r10', name:'Golden Profile Frame', cost:2000 }],
    lvFrom: () => 1,
    lvTitle: () => 'Test',
    today: () => '2026-08-11',
    toast: () => {},
    playSound: () => {},
    saveState: () => {},
    renderProfile: () => {},
    iqIcon: () => '',
    iqEmoji: () => ''
  });
  
  sandbox.selectFrame('r10');
  assert.strictEqual(S.activeFrame, 'r10');
});

test('buy with enough XP succeeds', () => {
  const S = { xp: 200, ur: {}, lv: 1 };
  const sandbox = loadSandbox(['core/xp.js', 'core/random.js', 'core/shop.js'], {
    S,
    SHOP: [{ id: 'r1', name: 'Title', cost: 100 }],
    today: () => '2026-08-11',
    toast: () => {},
    saveState: () => {},
    renderAll: () => {},
    renderDynamic: () => {},
    markDirty: () => {},
    clearDirty: () => {},
    checkA: () => {},
    checkLevelUp: () => {},
    lvFrom: () => 1,
    iqIcon: () => '',
    document: { querySelectorAll: () => [] },
    setTimeout: (fn) => fn()
  });
  sandbox.window.buy('r1');
  assert.strictEqual(S.xp, 100);
  assert.ok(S.ur.r1);
});

test('buy with not enough XP shows toast', () => {
  let toastCalled = false;
  const S = { xp: 50, ur: {}, lv: 1 };
  const sandbox = loadSandbox(['core/xp.js', 'core/random.js', 'core/shop.js'], {
    S,
    SHOP: [{ id: 'r1', name: 'Title', cost: 100 }],
    today: () => '2026-08-11',
    toast: () => { toastCalled = true; },
    saveState: () => {},
    renderAll: () => {},
    checkA: () => {},
    checkLevelUp: () => {},
    lvFrom: () => 1,
    iqIcon: () => '',
    document: { querySelectorAll: () => [] },
    setTimeout: (fn) => fn()
  });
  sandbox.window.buy('r1');
  assert.ok(toastCalled, 'toast should be called for insufficient XP');
  assert.strictEqual(S.xp, 50);
  assert.ok(!S.ur.r1);
});

test('booster pack doubles daily worship XP fairly without RNG', () => {
  const S = { xp: 500, ur: {}, lv: 1, ab: null };
  const sandbox = loadSandbox(['core/xp.js', 'core/random.js', 'core/shop.js'], {
    S,
    SHOP: [{ id: 'boost1', name: 'Sincere Momentum Boost', cost: 200, t: 'boost' }],
    today: () => '2026-08-11',
    toast: () => {},
    saveState: () => {},
    renderAll: () => {},
    renderDynamic: () => {},
    markDirty: () => {},
    clearDirty: () => {},
    checkA: () => {},
    checkLevelUp: () => {},
    lvFrom: () => 1,
    iqIcon: () => '',
    genDQ: () => {},
    document: { querySelectorAll: () => [] },
    setTimeout: (fn) => fn()
  });
  sandbox.window.buy('boost1');
  assert.strictEqual(S.xp, 300);
  assert.ok(S.ab && S.ab.exp >= '2026-08-11');
});

test('net-zero purchase does not trigger level-up toast', () => {
  const overlay = { innerHTML: '' };
  const S = { xp: 150, ur: {}, lv: 2 };
  const sandbox = loadSandbox(['core/xp.js', 'core/random.js', 'core/shop.js'], {
    S,
    SHOP: [{ id: 'x1', name: 'XP', cost: 100, t: 'xp', v: 100 }],
    today: () => '2026-08-11',
    toast: () => {},
    saveState: () => {},
    renderAll: () => {},
    renderDynamic: () => {},
    markDirty: () => {},
    clearDirty: () => {},
    checkA: () => {},
    lvFrom: (xp) => (xp >= 100 ? 2 : 1),
    iqIcon: () => '',
    iqEmoji: () => '',
    document: {
      querySelectorAll: () => [],
      getElementById: () => overlay,
      createElement: () => ({ style: { setProperty() {} }, className: '', textContent: '', setAttribute() {}, appendChild() {}, remove() {} }),
      body: { appendChild() {} }
    },
    setTimeout: () => {}
  });
  sandbox.window.buy('x1');
  assert.strictEqual(S.xp, 150, 'net-zero purchase restores starting XP');
  assert.strictEqual(S.lv, 2, 'level ends where it started');
  assert.ok(!overlay.innerHTML.includes('LEVEL UP'), 'no level-up toast when a purchase dips below a boundary and returns');
});
