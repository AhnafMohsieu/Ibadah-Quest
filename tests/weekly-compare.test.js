'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require(path.join(__dirname, 'helpers', 'load.js'));

function today(d = new Date()) { return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0'); }
function ws(d = new Date()) { const day = d.getDay(); const diff = d.getDate() - day + (day===0?-6:1); const m = new Date(d); m.setDate(diff); return today(m); }
function we(d = new Date()) { const s = new Date(d); s.setDate(s.getDate() + (7-s.getDay())%7); return today(s); }
function shift(base, dayDelta) { const d = new Date(base); d.setDate(d.getDate() + dayDelta); return today(d); }

// Build week dates dynamically relative to today so the test is not time-dependent
const weekStart = new Date(ws());
const day0 = shift(weekStart, 0);
const day1 = shift(weekStart, 1);
const day2 = shift(weekStart, 2);

const sandbox = loadFile(path.join(__dirname, '..', 'analytics', 'weekly-compare.js'), {
  S: {
    log: {
      [shift(weekStart, -6)]: { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: { deed1: true } },
      [shift(weekStart, -5)]: { p: { fajr: true, dhuhr: true, asr: false, maghrib: true, isha: true }, d: {} },
      [shift(weekStart, -4)]: { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: { deed1: true, deed2: true } },
      [shift(weekStart, -3)]: { p: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }, d: {} },
      [day0]: { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: { deed1: true } },
      [day1]: { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} },
      [day2]: { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: { deed1: true, deed2: true, deed3: true } },
      [shift(weekStart, -7)]: { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: { deed1: true } },
      [shift(weekStart, -8)]: { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} },
      [shift(weekStart, -9)]: { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: { deed1: true, deed2: true } },
      [shift(weekStart, -10)]: { p: { fajr: false, dhuhr: true, asr: false, maghrib: true, isha: false }, d: {} },
      [shift(weekStart, -11)]: { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: { deed1: true } },
      [shift(weekStart, -12)]: { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} },
      [shift(weekStart, -13)]: { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: { deed1: true } }
    },
    dq: [{ done: true, xp: 10 }, { done: false, xp: 10 }],
    wq: [{ done: true, xp: 20 }]
  },
  PRAYERS: [
    { id: 'fajr', xp: 10 },
    { id: 'dhuhr', xp: 10 },
    { id: 'asr', xp: 10 },
    { id: 'maghrib', xp: 10 },
    { id: 'isha', xp: 10 }
  ],
  DEEDS: [
    { id: 'deed1', xp: 5 },
    { id: 'deed2', xp: 5 },
    { id: 'deed3', xp: 5 }
  ],
  today: today,
  ws: ws,
  we: we,
  iqIcon: () => '',
  document: { getElementById: () => null }
});

const w = sandbox.window;

test('getWeekStats returns correct structure', () => {
  const stats = w.getWeekStats(0);
  assert.ok(typeof stats === 'object', 'stats should be an object');
  assert.ok(typeof stats.xp === 'number', 'xp should be a number');
  assert.ok(typeof stats.prayers === 'number', 'prayers should be a number');
  assert.ok(typeof stats.quests === 'number', 'quests should be a number');
  assert.ok(typeof stats.weekStart === 'string', 'weekStart should be a string');
  assert.ok(typeof stats.weekEnd === 'string', 'weekEnd should be a string');
});

test('getWeekStats returns correct prayer count', () => {
  const stats = w.getWeekStats(0);
  // Current week: day0(5) + day1(5) + day2(5) = 15
  assert.strictEqual(stats.prayers, 15, 'should have 15 prayers logged');
});

test('getWeekStats returns correct XP count', () => {
  const stats = w.getWeekStats(0);
  // Current week: 15 prayers × 10 + deed1×2×5 + deed2×1×5 + deed3×1×5 = 170
  assert.strictEqual(stats.xp, 170, 'should have 170 XP earned');
});

test('getWeekStats returns correct quest count', () => {
  const stats = w.getWeekStats(0);
  // Quest counting removed: S.dq/S.wq lack date fields
  assert.strictEqual(stats.quests, 0, 'quest count should be 0');
});

test('getWeekStats handles previous week offset', () => {
  const currentWeek = w.getWeekStats(0);
  const previousWeek = w.getWeekStats(-1);
  assert.ok(previousWeek.weekStart < currentWeek.weekStart, 'previous week should start before current week');
});

test('getWeekStats returns empty stats when no data', () => {
  const emptySandbox = loadFile(path.join(__dirname, '..', 'analytics', 'weekly-compare.js'), {
    S: { log: {}, dq: [], wq: [] },
    PRAYERS: [],
    DEEDS: [],
    today: today,
    ws: ws,
    we: we,
    iqIcon: () => '',
    document: { getElementById: () => null }
  });
  const stats = emptySandbox.window.getWeekStats(0);
  assert.strictEqual(stats.xp, 0);
  assert.strictEqual(stats.prayers, 0);
  assert.strictEqual(stats.quests, 0);
});

test('renderWeeklyCompare does not throw when container missing', () => {
  assert.doesNotThrow(() => w.renderWeeklyCompare());
});

test('renderWeeklyCompare renders cards when container exists', () => {
  let innerHTML = '';
  const mockContainer = {
    set innerHTML(val) { innerHTML = val; },
    get innerHTML() { return innerHTML; }
  };
  const testSandbox = loadFile(path.join(__dirname, '..', 'analytics', 'weekly-compare.js'), {
    S: {
      log: {
        '2026-08-06': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} },
        '2026-08-07': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} },
        '2026-08-08': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} },
        '2026-08-09': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} },
        '2026-08-10': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} },
        '2026-08-11': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} },
        '2026-08-12': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} }
      },
      dq: [],
      wq: []
    },
    PRAYERS: [
      { id: 'fajr', xp: 10 },
      { id: 'dhuhr', xp: 10 },
      { id: 'asr', xp: 10 },
      { id: 'maghrib', xp: 10 },
      { id: 'isha', xp: 10 }
    ],
    DEEDS: [],
    today: today,
    ws: ws,
    we: we,
    iqIcon: () => '',
    document: { getElementById: () => mockContainer }
  });
  testSandbox.window.renderWeeklyCompare();
  assert.ok(innerHTML.includes('compare-grid'), 'should render compare-grid');
  assert.ok(innerHTML.includes('compare-card'), 'should render compare-cards');
  assert.ok(innerHTML.includes('XP Earned'), 'should show XP label');
  assert.ok(innerHTML.includes('Prayers Logged'), 'should show prayers label');
});

test('getWeekStats is exposed on window', () => {
  assert.strictEqual(typeof w.getWeekStats, 'function');
});

test('renderWeeklyCompare is exposed on window', () => {
  assert.strictEqual(typeof w.renderWeeklyCompare, 'function');
});
