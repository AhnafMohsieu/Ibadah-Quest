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

function stub() { return () => {}; }

function createSandbox(overrides) {
  const todayStr = '2026-08-17';
  const S = Object.assign({
    log: { [todayStr]: { p: {}, d: {}, v: {} } },
    tp: 0, td: {}, vc: {}, tj: 0, pd: 0, cs: 0, bs: 0, lad: todayStr,
    xp: 0, lv: 1, ua: {}, ur: {}, sd: false, ab: null, tq: 0, dq: [], qd: todayStr, sfu: false,
    lbd: null, tdismiss: false, wq: [], mq: [], yq: [], lq: [], wqd: '', mqd: '', yqd: '', lqd: '',
    contentDate: todayStr, duaIdx: [], quranIdx: [], sunnahIdx: [], dhikrIdx: [], dhikrCustom: [], dhikrFavorites: [],
    storiesIdx: [], hadithIdx: [], namesIdx: [], sinsIdx: [], punishmentsIdx: [],
    repentanceIdx: [], seerahIdx: [], tafsirIdx: [], mannersIdx: [],
    aqeedahIdx: [], familyIdx: [], healthIdx: [], financeIdx: [], ummahIdx: [], hajjIdx: [],
    questXP: { daily: 0, weekly: 0, monthly: 0, yearly: 0, lifetime: 0 },
    akhirahIdx: [], prophetsIdx: [], womenIdx: [], knowledgeIdx: [], heartIdx: [],
    jumuahIdx: [], marriageIdx: [], scienceIdx: [], wuduIdx: [], scholarsIdx: [],
    patienceIdx: [], workIdx: [], communityIdx: [], environmentIdx: [], travelIdx: [],
    fiqhIdx: [], arabicIdx: [], tawakkulIdx: [], ikhlasIdx: [], zuhdIdx: [],
    dawahIdx: [], civilisationIdx: [], battlesIdx: [], jannahIdx: [], jahannamIdx: [],
    graveIdx: [], signsIdx: [], dreamsIdx: [], parentingIdx: [], foodIdx: [], tibbIdx: [],
    youthIdx: [], techIdx: [], neighborsIdx: [],
    inspireIdx: [], dhikrCounters: {}, dhikrSessions: [], dhikrStats: { total: {}, daily: {}, streak: 0, bestStreak: 0, lastSessionDate: null, badges: [], achievements: [] },
    muhWeek: '', journeys: {}, journeyStats: { completed: [], currentStreaks: {}, bestStreaks: {}, totalCompleted: 0, unlockedTiers: ['7day'], history: [] }, gratitudeLog: {}, fastingDays: {}, memorized: 0, memorizationList: [],
    morningDone: {}, eveningDone: {}, charity: { daily: 0, monthly: 0, given: 0, monthStart: '' },
    quranAudioReciter: 7,
    avatar: '', joinDate: null,
    healthLog: {}, financeLog: {},
    growthSettings: { visible: ['garden', 'lantern', 'keys', 'mosque', 'boat', 'heart', 'armor', 'ramadan', 'laylat'] },
    theme: 'light', lastTab: 'home', lastCat: null, lastSub: null, introSeen: false,
    notificationsEnabled: false
  }, overrides);
  
  // Don't load state.js or data/quests.js - their const declarations
  // leak into the quests.js context and shadow our mocks.
  const sandbox = loadSandbox(['core/xp.js', 'core/quests.js'], {
    S,
    DQUESTS: [
      { id: 'dq1', xp: 10, c: (S, l) => true },
      { id: 'dq2', xp: 15, c: (S, l) => false },
      { id: 'dq3', xp: 20, c: (S, l) => true },
      { id: 'dq4', xp: 25, c: (S, l) => false },
      { id: 'dq5', xp: 30, c: (S, l) => true }
    ],
    WQUESTS: [
      { id: 'w1', xp: 100, c: (S) => true },
      { id: 'w2', xp: 150, c: (S) => false },
      { id: 'w3', xp: 200, c: (S) => true }
    ],
    MQUESTS: [
      { id: 'm1', xp: 500, c: (S) => true },
      { id: 'm2', xp: 600, c: (S) => false },
      { id: 'm3', xp: 700, c: (S) => true }
    ],
    YQUESTS: [
      { id: 'y1', xp: 2000, c: (S) => true },
      { id: 'y2', xp: 2500, c: (S) => false },
      { id: 'y3', xp: 3000, c: (S) => true }
    ],
    LQUESTS: [
      { id: 'l1', xp: 5000, c: (S) => true },
      { id: 'l2', xp: 6000, c: (S) => false },
      { id: 'l3', xp: 7000, c: (S) => true }
    ],
    saveState: stub(),
    renderDynamic: stub(),
    renderQ: stub(),
    markDirty: stub(),
    clearDirty: stub(),
    checkLevelUp: stub(),
    checkA: stub(),
    checkSurpriseReward: stub(),
    lvFrom: () => 1,
    today: () => todayStr,
    ws: () => '2026-W33',
    ms: () => '2026-08-01',
    me: () => '2026-08-31',
    ys: () => '2026-01-01',
    ye: () => '2026-12-31',
    tlog: () => S.log[todayStr] || { p: {}, d: {}, v: {} }
  });
  
  return { sandbox, S };
}

test('genDQ generates 4 daily quests', () => {
  const { sandbox, S } = createSandbox();
  S.dq = [];
  S.qd = '';
  
  sandbox.genDQ();
  
  assert.strictEqual(S.dq.length, 4, 'Should generate exactly 4 daily quests');
  assert.strictEqual(S.qd, '2026-08-17', 'Should set current date');
});

test('genDQ does not regenerate on same day', () => {
  const { sandbox, S } = createSandbox();
  S.qd = '2026-08-17';
  S.dq = [{ id: 'dq1', xp: 10, done: false }];
  
  sandbox.genDQ();
  
  assert.strictEqual(S.dq.length, 1, 'Should not regenerate quests');
  assert.strictEqual(S.dq[0].id, 'dq1', 'Should keep existing quests');
});

test('generated quests contain no functions (IndexedDB clone-safe)', () => {
  const { sandbox, S } = createSandbox();
  S.dq = []; S.qd = '';
  S.wq = []; S.wqd = '';
  S.mq = []; S.mqd = '';
  S.yq = []; S.yqd = '';
  S.lq = []; S.lqd = '';
  
  sandbox.genDQ(); sandbox.genWQ(); sandbox.genMQ(); sandbox.genYQ(); sandbox.genLQ();
  
  for (const arr of [S.dq, S.wq, S.mq, S.yq, S.lq]) {
    for (const q of arr) {
      assert.doesNotThrow(() => structuredClone(q),
        `quest ${q.id} must be structured-cloneable or IDB saves fail`);
      assert.strictEqual(typeof q.c, 'undefined',
        `quest ${q.id} must not carry the condition function into state`);
    }
  }
});

test('genDQ shuffles quest order', () => {
  const { sandbox, S } = createSandbox();
  const ctxMath = vm.runInNewContext('Math', sandbox);
  const originalRandom = ctxMath.random;
  try {
    ctxMath.random = () => 0.42;

    S.dq = [];
    S.qd = '';
    sandbox.genDQ();
    const firstOrder = S.dq.map(q => q.id);

    S.dq = [];
    S.qd = '';
    sandbox.genDQ();
    const secondOrder = S.dq.map(q => q.id);

    assert.deepStrictEqual(firstOrder, secondOrder,
      'Same fixed Math.random stub must produce identical quest order');

    const expectedPool = [...sandbox.DQUESTS]
      .sort(() => ctxMath.random() - 0.5)
      .slice(0, 4)
      .map(q => q.id);

    assert.strictEqual(firstOrder.length, expectedPool.length,
      'Should generate exactly 4 quests');
    assert.deepStrictEqual([...firstOrder].sort(), [...expectedPool].sort(),
      'Generated ids must be exactly the shuffled fixture pool (order-insensitive)');
    assert.strictEqual(new Set(firstOrder).size, firstOrder.length,
      'No duplicate quest ids');
  } finally {
    ctxMath.random = originalRandom;
  }
});

test('genWQ generates 3 weekly quests', () => {
  const { sandbox, S } = createSandbox();
  S.wq = [];
  S.wqd = '';
  
  sandbox.genWQ();
  
  assert.strictEqual(S.wq.length, 3, 'Should generate exactly 3 weekly quests');
  assert.strictEqual(S.wqd, '2026-W33', 'Should set current week');
});

test('checkQ completes a quest when condition is met', () => {
  const { sandbox, S } = createSandbox();
  S.dq = [{ id: 'dq1', xp: 10, done: false }]; // dq1 condition returns true
  
  sandbox.checkQ();
  
  assert.strictEqual(S.dq[0].done, true, 'Quest should be marked as done');
});

test('checkQ does not complete already done quest', () => {
  const { sandbox, S } = createSandbox();
  const initialXp = S.xp;
  S.dq = [{ id: 'dq1', xp: 10, done: true }]; // Already done
  
  sandbox.checkQ();
  
  assert.strictEqual(S.xp, initialXp, 'XP should not change for already done quest');
});

test('checkQ awards XP on completion', () => {
  const { sandbox, S } = createSandbox();
  const initialXp = S.xp;
  S.dq = [{ id: 'dq1', xp: 10, done: false }]; // dq1 condition returns true
  
  sandbox.checkQ();
  
  assert.strictEqual(S.xp, initialXp + 10, 'XP should increase by quest XP');
  assert.strictEqual(S.tq, 1, 'Total quests completed should increase');
});

test('checkQ tracks quest XP by type', () => {
  const { sandbox, S } = createSandbox();
  S.dq = [{ id: 'dq1', xp: 10, done: false }];
  S.wq = [{ id: 'w1', xp: 100, done: false }];
  
  sandbox.checkQ();
  
  assert.strictEqual(S.questXP.daily, 10, 'Daily XP should be tracked');
  assert.strictEqual(S.questXP.weekly, 100, 'Weekly XP should be tracked');
});

test('toggleQuest toggles quest done status', () => {
  const { sandbox, S } = createSandbox();
  S.dq = [{ id: 'dq1', xp: 10, done: false }];
  
  sandbox.toggleQuest('dq1', 'daily', 10);
  assert.strictEqual(S.dq[0].done, true, 'Quest should be marked as done');
  
  sandbox.toggleQuest('dq1', 'daily', 10);
  assert.strictEqual(S.dq[0].done, false, 'Quest should be marked as undone');
});

test('toggleQuest adjusts XP correctly', () => {
  const { sandbox, S } = createSandbox();
  const initialXp = S.xp;
  S.dq = [{ id: 'dq1', xp: 10, done: false }];
  
  sandbox.toggleQuest('dq1', 'daily', 10);
  assert.strictEqual(S.xp, initialXp + 10, 'XP should increase when marking done');
  
  sandbox.toggleQuest('dq1', 'daily', 10);
  assert.strictEqual(S.xp, initialXp, 'XP should decrease when marking undone');
});

test('toggleQuest handles different quest types', () => {
  const { sandbox, S } = createSandbox();
  S.dq = [{ id: 'dq1', xp: 10, done: false }];
  S.wq = [{ id: 'w1', xp: 100, done: false }];
  S.mq = [{ id: 'm1', xp: 500, done: false }];
  S.yq = [{ id: 'y1', xp: 2000, done: false }];
  S.lq = [{ id: 'l1', xp: 5000, done: false }];
  
  // Test daily
  sandbox.toggleQuest('dq1', 'daily', 10);
  assert.strictEqual(S.dq[0].done, true);
  assert.strictEqual(S.xp, 10);
  
  // Test weekly
  sandbox.toggleQuest('w1', 'weekly', 100);
  assert.strictEqual(S.wq[0].done, true);
  assert.strictEqual(S.xp, 110);
  
  // Test monthly
  sandbox.toggleQuest('m1', 'monthly', 500);
  assert.strictEqual(S.mq[0].done, true);
  assert.strictEqual(S.xp, 610);
  
  // Test yearly
  sandbox.toggleQuest('y1', 'yearly', 2000);
  assert.strictEqual(S.yq[0].done, true);
  assert.strictEqual(S.xp, 2610);
  
  // Test lifetime
  sandbox.toggleQuest('l1', 'lifetime', 5000);
  assert.strictEqual(S.lq[0].done, true);
  assert.strictEqual(S.xp, 7610);
});

test('toggleQuest does not go below 0 XP', () => {
  const { sandbox, S } = createSandbox();
  S.xp = 5;
  S.dq = [{ id: 'dq1', xp: 10, done: true }]; // Already done
  
  sandbox.toggleQuest('dq1', 'daily', 10);
  
  assert.strictEqual(S.xp, 0, 'XP should not go below 0');
});

test('toggleQuest does not go below 0 total quests', () => {
  const { sandbox, S } = createSandbox();
  S.tq = 0;
  S.dq = [{ id: 'dq1', xp: 10, done: true }]; // Already done
  
  sandbox.toggleQuest('dq1', 'daily', 10);
  
  assert.strictEqual(S.tq, 0, 'Total quests should not go below 0');
});

test('checkQ calls saveState and recomputes level on completion', () => {
  const { sandbox, S } = createSandbox();
  let saveStateCalled = false;

  sandbox.saveState = () => { saveStateCalled = true; };
  // xp.js's IIFE-internal checkLevelUp shadows any sandbox spy, so observe the
  // level evaluation through lvFrom instead (see task-1-report.md).
  sandbox.lvFrom = (xp) => (xp >= 10 ? 2 : 1);
  // A real level-up now fires the genuine levelUpToast path; stub its DOM deps.
  sandbox.lvTitle = () => 'Test';
  sandbox.iqIcon = () => '';
  sandbox.iqEmoji = () => '*';
  sandbox.document = {
    activeElement: null,
    getElementById: () => ({ style: {}, classList: { add() {}, remove() {} }, innerHTML: '', onclick: null }),
    createElement: () => ({ style: { setProperty() {} }, className: '', textContent: '', setAttribute() {}, appendChild() {}, remove() {} }),
    body: { appendChild() {} }
  };
  sandbox.setTimeout = () => {};
  sandbox.clearTimeout = () => {};

  S.dq = [{ id: 'dq1', xp: 10, done: false }];

  sandbox.checkQ();

  assert.strictEqual(saveStateCalled, true, 'saveState should be called');
  assert.strictEqual(S.lv, 2, 'level should be recomputed from XP via applyXpDelta');
});

test('toggleQuest calls saveState, markDirty, renderDynamic', () => {
  const { sandbox, S } = createSandbox();
  let saveStateCalled = false;
  let markDirtyCalled = false;
  let renderDynamicCalled = false;
  
  sandbox.saveState = () => { saveStateCalled = true; };
  sandbox.markDirty = () => { markDirtyCalled = true; };
  sandbox.renderDynamic = () => { renderDynamicCalled = true; };
  
  S.dq = [{ id: 'dq1', xp: 10, done: false }];
  
  sandbox.toggleQuest('dq1', 'daily', 10);
  
  assert.strictEqual(saveStateCalled, true, 'saveState should be called');
  assert.strictEqual(markDirtyCalled, true, 'markDirty should be called');
  assert.strictEqual(renderDynamicCalled, true, 'renderDynamic should be called');
});

test('toggleQuest with invalid quest id does nothing', () => {
  const { sandbox, S } = createSandbox();
  const initialXp = S.xp;
  S.dq = [{ id: 'dq1', xp: 10, done: false }];
  
  sandbox.toggleQuest('invalid_id', 'daily', 10);
  
  assert.strictEqual(S.xp, initialXp, 'XP should not change');
  assert.strictEqual(S.dq[0].done, false, 'Quest should remain undone');
});

test('toggleQuest with invalid quest type does nothing', () => {
  const { sandbox, S } = createSandbox();
  const initialXp = S.xp;
  S.dq = [{ id: 'dq1', xp: 10, done: false }];

  sandbox.toggleQuest('dq1', 'invalid_type', 10);

  assert.strictEqual(S.xp, initialXp, 'XP should not change');
  assert.strictEqual(S.dq[0].done, false, 'Quest should remain undone');
});

test('toggleQuest refreshes the quests panel via original dirty-mark set', () => {
  const { sandbox, S } = createSandbox();
  const marked = [];
  sandbox.markDirty = (panel) => { marked.push(panel); };

  S.dq = [{ id: 'dq1', xp: 10, done: false }];

  sandbox.toggleQuest('dq1', 'daily', 10);

  assert.ok(marked.includes('quests'), 'quests panel must be marked dirty');
});