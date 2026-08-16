'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

function today(d = new Date()) {
  return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
}

function dateAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return today(d);
}

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

function createDocument() {
  let dataTheme = null;
  return {
    documentElement: {
      setAttribute: (name, value) => { if (name === 'data-theme') dataTheme = value; },
      removeAttribute: (name) => { if (name === 'data-theme') dataTheme = null; },
      getAttribute: (name) => { if (name === 'data-theme') return dataTheme; return null; },
      style: {}
    },
    querySelector: (sel) => {
      if (sel === 'meta[name="theme-color"]') return { setAttribute: () => {} };
      if (sel === '.tab-panel.active') return { id: 'panel-home' };
      return null;
    },
    querySelectorAll: () => [],
    getElementById: () => ({
      style: {},
      classList: { add: () => {}, remove: () => {} },
      innerHTML: '',
      onclick: null
    }),
    createElement: () => ({
      style: { setProperty: () => {} },
      className: '',
      textContent: '',
      appendChild: () => {},
      remove: () => {}
    }),
    body: { appendChild: () => {} },
    activeElement: null
  };
}

function allPrayers() {
  return { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true };
}

function setupPrayerEnv() {
  const t = today();
  const S = {
    log: { [t]: { p: {}, d: {}, v: {} } },
    tp: 0, td: {}, vc: {}, tj: 0, pd: 0, cs: 0, bs: 0, lad: t,
    xp: 0, lv: 1, ua: {}, ur: {}, ab: null, tq: 0, dq: [], qd: t,
    questXP: { daily: 0, weekly: 0, monthly: 0, yearly: 0, lifetime: 0 },
    xpDaily: {}
  };
  function tlog() {
    const t2 = today();
    if (!S.log[t2]) S.log[t2] = { p: {}, d: {}, v: {} };
    return S.log[t2];
  }
  const sandbox = loadSandbox(['core/prayers.js'], {
    S,
    tlog,
    PRAYERS: [
      { id: 'fajr', xp: 70 },
      { id: 'dhuhr', xp: 50, fri: { xp: 100 } },
      { id: 'asr', xp: 40 },
      { id: 'maghrib', xp: 50 },
      { id: 'isha', xp: 60 }
    ],
    VOLUNTARY: [{ id: 'witr', xp: 45 }],
    DEEDS: [{ id: 'charity', xp: 35 }],
    today,
    lvFrom: (xp) => { let lv = 1; while (xp >= Math.floor(100 * Math.pow(lv + 1, 1.5))) lv++; return lv; },
    isFri: () => false,
    playSound: stub(),
    saveState: stub(),
    renderDynamic: stub(),
    checkQ: stub(),
    checkA: stub(),
    checkCombo: stub(),
    checkSurpriseReward: stub(),
    checkMilestones: stub(),
    checkLevelUp: stub()
  });
  sandbox.S = S;
  sandbox._tlog = tlog;
  return sandbox;
}

function setupQuestEnv() {
  const t = today();
  const S = {
    log: { [t]: { p: {}, d: {}, v: {} } },
    tp: 0, td: {}, vc: {}, tj: 0, pd: 0, cs: 0, bs: 0, lad: t,
    xp: 0, lv: 1, ua: {}, ur: {}, sd: false, ab: null, tq: 0, dq: [], qd: t, sfu: false,
    lbd: null, tdismiss: false, wq: [], mq: [], yq: [], lq: [], wqd: '', mqd: '', yqd: '', lqd: '',
    questXP: { daily: 0, weekly: 0, monthly: 0, yearly: 0, lifetime: 0 }
  };
  const sandbox = loadSandbox(['core/quests.js'], {
    S,
    DQUESTS: [
      { id: 'dq1', xp: 10, c: () => true },
      { id: 'dq2', xp: 15, c: () => false }
    ],
    WQUESTS: [
      { id: 'w1', xp: 100, c: () => true },
      { id: 'w2', xp: 150, c: () => false }
    ],
    MQUESTS: [
      { id: 'm1', xp: 500, c: () => true }
    ],
    YQUESTS: [
      { id: 'y1', xp: 2000, c: () => true }
    ],
    LQUESTS: [
      { id: 'l1', xp: 5000, c: () => true }
    ],
    saveState: stub(),
    renderDynamic: stub(),
    renderQ: stub(),
    checkLevelUp: stub(),
    checkA: stub(),
    checkSurpriseReward: stub(),
    lvFrom: (xp) => { let lv = 1; while (xp >= Math.floor(100 * Math.pow(lv + 1, 1.5))) lv++; return lv; },
    today: () => t,
    ws: () => '2026-W33',
    ms: () => '2026-08-01',
    me: () => '2026-08-31',
    ys: () => '2026-01-01',
    ye: () => '2026-12-31',
    tlog: () => S.log[t] || { p: {}, d: {}, v: {} }
  });
  sandbox.S = S;
  return sandbox;
}

function setupThemeEnv() {
  const doc = createDocument();
  const sandbox = loadSandbox(['core/themes.js'], {
    window: { Themes: [{ key: 'light' }, { key: 'serene' }, { key: 'royal' }] },
    S: { theme: 'light' },
    localStorage: {
      store: {},
      getItem: function (k) { return this.store[k] || null; },
      setItem: function (k, v) { this.store[k] = v; },
      removeItem: function (k) { delete this.store[k]; }
    },
    saveState: stub(),
    updateTopBar: stub(),
    renderTab: stub(),
    document: doc,
    getComputedStyle: () => ({ getPropertyValue: () => '' })
  });
  sandbox._doc = doc;
  return sandbox;
}

describe('Full prayer flow', () => {
  it('init -> pray Fajr -> check XP -> check level', () => {
    const s = setupPrayerEnv();
    assert.equal(s.S.xp, 0, 'initial XP is 0');
    assert.equal(s.S.lv, 1, 'initial level is 1');

    s.toggleP('fajr');

    assert.equal(s.S.xp, 70, 'XP increased by 70 after Fajr');
    assert.ok(s.S.lv >= 1, 'level is at least 1');

    const l = s._tlog();
    assert.equal(l.p.fajr, true, 'Fajr marked as prayed');
    assert.equal(s.S.tp, 1, 'total prayers incremented');
  });

  it('pray all 5 daily prayers -> streak recalculated', () => {
    const s = setupPrayerEnv();

    s.toggleP('fajr');
    s.toggleP('dhuhr');
    s.toggleP('asr');
    s.toggleP('maghrib');
    s.toggleP('isha');

    const expectedXp = 70 + 50 + 40 + 50 + 60;
    assert.equal(s.S.xp, expectedXp, 'total XP equals sum of all 5 prayers');

    const l = s._tlog();
    assert.equal(l.p.fajr, true);
    assert.equal(l.p.dhuhr, true);
    assert.equal(l.p.asr, true);
    assert.equal(l.p.maghrib, true);
    assert.equal(l.p.isha, true);
    assert.equal(s.S.tp, 5, 'total prayers is 5');
  });

  it('pray then unpray Fajr -> XP and level revert', () => {
    const s = setupPrayerEnv();

    s.toggleP('fajr');
    assert.equal(s.S.xp, 70);

    s.toggleP('fajr');
    assert.equal(s.S.xp, 0, 'XP reverted after unpray');
    assert.equal(s.S.tp, 0, 'total prayers reverted');
  });
});

describe('Quest completion flow', () => {
  it('quest condition met -> checkQ -> XP awarded', () => {
    const s = setupQuestEnv();
    s.S.dq = [{ id: 'dq1', xp: 10, done: false }];

    s.checkQ();

    assert.equal(s.S.dq[0].done, true, 'quest marked as done');
    assert.equal(s.S.xp, 10, 'XP awarded');
    assert.equal(s.S.tq, 1, 'total quests incremented');
  });

  it('multiple quests completed in one checkQ call', () => {
    const s = setupQuestEnv();
    s.S.dq = [
      { id: 'dq1', xp: 10, done: false },
      { id: 'dq2', xp: 15, done: false }
    ];
    s.S.wq = [{ id: 'w1', xp: 100, done: false }];

    s.checkQ();

    assert.equal(s.S.dq[0].done, true, 'daily quest dq1 done');
    assert.equal(s.S.dq[1].done, false, 'daily quest dq2 stays undone (condition false)');
    assert.equal(s.S.wq[0].done, true, 'weekly quest w1 done');
    assert.equal(s.S.xp, 110, 'XP is sum of completed quests');
    assert.equal(s.S.tq, 2, 'total quests is 2');
  });

  it('already done quest does not award XP again', () => {
    const s = setupQuestEnv();
    s.S.dq = [{ id: 'dq1', xp: 10, done: true }];

    s.checkQ();

    assert.equal(s.S.xp, 0, 'no duplicate XP');
    assert.equal(s.S.tq, 0, 'total quests unchanged');
  });
});

describe('Theme switch flow', () => {
  it('setTheme -> applyTheme -> data-theme attribute set', () => {
    const s = setupThemeEnv();

    s.setTheme('serene');

    assert.equal(s.S.theme, 'serene', 'S.theme set to serene');
    assert.equal(s._doc.documentElement.getAttribute('data-theme'), 'serene', 'data-theme attribute set');
  });

  it('applyTheme reads S.theme and applies it', () => {
    const s = setupThemeEnv();
    s.S.theme = 'royal';

    s.applyTheme();

    assert.equal(s._doc.documentElement.getAttribute('data-theme'), 'royal', 'applyTheme sets data-theme');
  });

  it('light theme removes data-theme attribute', () => {
    const s = setupThemeEnv();
    s.S.theme = 'light';
    s._doc.documentElement.setAttribute('data-theme', 'serene');

    s.applyTheme();

    assert.equal(s._doc.documentElement.getAttribute('data-theme'), null, 'data-theme removed for light');
  });
});
