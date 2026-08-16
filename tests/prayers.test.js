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

function today(d = new Date()) {
  return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
}

function dateAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return today(d);
}

function setup() {
  const S = {
    log: {},
    tp: 0, td: {}, vc: {}, tj: 0, pd: 0, cs: 0, bs: 0, lad: today(),
    xp: 0, lv: 1, ua: {}, ur: {}, ab: null
  };
  S.log[today()] = { p: {}, d: {}, v: {} };
  function tlog() {
    const t = today();
    if (!S.log[t]) S.log[t] = { p: {}, d: {}, v: {} };
    return S.log[t];
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
    lvFrom: () => 1,
    isFri: () => false,
    playSound: () => {},
    saveState: () => {},
    renderDynamic: () => {},
    checkQ: () => {},
    checkA: () => {},
    checkCombo: () => {},
    checkSurpriseReward: () => {},
    checkMilestones: () => {},
    checkLevelUp: () => {}
  });
  sandbox.S = S;
  return sandbox;
}

function allPrayers() {
  return { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true };
}

test('toggleP: praying Fajr sets l.p.fajr = true, increases S.tp and S.xp', () => {
  const s = setup();
  s.toggleP('fajr');
  const l = s.S.log[today()];
  assert.strictEqual(l.p.fajr, true);
  assert.strictEqual(s.S.tp, 1);
  assert.strictEqual(s.S.xp, 70);
});

test('toggleP: unpraying Fajr sets l.p.fajr = false, decreases S.tp and S.xp', () => {
  const s = setup();
  s.toggleP('fajr');
  s.toggleP('fajr');
  const l = s.S.log[today()];
  assert.strictEqual(l.p.fajr, false);
  assert.strictEqual(s.S.tp, 0);
  assert.strictEqual(s.S.xp, 0);
});

test('toggleP: XP amount matches PRAYERS data', () => {
  const s = setup();
  s.toggleP('asr');
  assert.strictEqual(s.S.xp, 40);
  s.toggleP('asr');
  s.toggleP('isha');
  assert.strictEqual(s.S.xp, 60);
});

test('toggleP: Friday bonus for Dhuhr', () => {
  const s = setup();
  s.isFri = () => true;
  s.toggleP('dhuhr');
  assert.strictEqual(s.S.xp, 100);
  assert.strictEqual(s.S.tj, 1);
  s.toggleP('dhuhr');
  assert.strictEqual(s.S.xp, 0);
  assert.strictEqual(s.S.tj, 0);
});

test('toggleV: toggling voluntary prayer on/off', () => {
  const s = setup();
  s.toggleV('witr');
  assert.strictEqual(s.S.xp, 45);
  assert.strictEqual(s.S.vc.witr, 1);
  s.toggleV('witr');
  assert.strictEqual(s.S.xp, 0);
  assert.strictEqual(s.S.vc.witr, 0);
});

test('toggleV: XP adjustment', () => {
  const s = setup();
  s.toggleV('witr');
  assert.strictEqual(s.S.xp, 45);
  s.toggleV('witr');
  s.toggleV('witr');
  assert.strictEqual(s.S.xp, 45);
});

test('toggleD: toggling deed on/off', () => {
  const s = setup();
  s.toggleD('charity');
  assert.strictEqual(s.S.xp, 35);
  assert.strictEqual(s.S.td.charity, 1);
  s.toggleD('charity');
  assert.strictEqual(s.S.xp, 0);
  assert.strictEqual(s.S.td.charity, 0);
});

test('toggleD: XP adjustment', () => {
  const s = setup();
  s.toggleD('charity');
  assert.strictEqual(s.S.xp, 35);
  s.toggleD('charity');
  s.toggleD('charity');
  assert.strictEqual(s.S.xp, 35);
});

test('recalc: calculates current streak correctly', () => {
  const s = setup();
  s.S.log[dateAgo(2)] = { p: allPrayers() };
  s.S.log[dateAgo(1)] = { p: allPrayers() };
  s.S.log[today()] = { p: allPrayers() };
  s.recalc();
  assert.strictEqual(s.S.cs, 3);
});

test('recalc: calculates best streak correctly', () => {
  const s = setup();
  s.S.log[dateAgo(6)] = { p: allPrayers() };
  s.S.log[dateAgo(5)] = { p: allPrayers() };
  s.S.log[dateAgo(3)] = { p: allPrayers() };
  s.S.log[dateAgo(2)] = { p: allPrayers() };
  s.S.log[dateAgo(1)] = { p: allPrayers() };
  s.S.log[today()] = { p: allPrayers() };
  s.recalc();
  assert.strictEqual(s.S.bs, 4);
});

test('recalc: counts perfect days', () => {
  const s = setup();
  s.S.log[dateAgo(2)] = { p: allPrayers() };
  s.S.log[dateAgo(1)] = { p: allPrayers() };
  s.S.log[today()] = { p: allPrayers() };
  s.recalc();
  assert.strictEqual(s.S.pd, 3);
});