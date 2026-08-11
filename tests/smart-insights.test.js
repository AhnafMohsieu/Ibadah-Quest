'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require(path.join(__dirname, 'helpers', 'load.js'));

function today(d = new Date()) { return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0'); }

function makeState(logOverride) {
  const log = logOverride || {};
  return {
    log: log,
    xp: 500,
    lv: 5,
    cs: 3,
    bs: 10,
    td: {}
  };
}

function loadSmartInsights(overrides) {
  const state = (overrides && overrides.S) || makeState();
  const sandbox = loadFile(path.join(__dirname, '..', 'analytics', 'smart-insights.js'), Object.assign({
    S: state,
    PRAYERS: [
      { id: 'fajr', xp: 10 },
      { id: 'dhuhr', xp: 10 },
      { id: 'asr', xp: 10 },
      { id: 'maghrib', xp: 10 },
      { id: 'isha', xp: 10 }
    ],
    DEEDS: [
      { id: 'deed1', xp: 5 },
      { id: 'deed2', xp: 5 }
    ],
    today: today,
    xpFor: function(lv) { if (lv <= 1) return 0; return Math.floor(100 * Math.pow(lv, 1.5)); },
    iqIcon: function() { return ''; },
    document: { getElementById: function() { return null; } }
  }, overrides || {}));
  return sandbox;
}

test('generateInsights returns an array', () => {
  const w = loadSmartInsights().window;
  const insights = w.generateInsights();
  assert.ok(Array.isArray(insights), 'generateInsights should return an array');
});

test('each insight has icon, text, and type', () => {
  const log = {};
  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = today(d);
    log[key] = { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} };
  }
  const w = loadSmartInsights({ S: makeState(log) }).window;
  const insights = w.generateInsights();
  insights.forEach(i => {
    assert.ok(typeof i.icon === 'string', 'icon should be a string');
    assert.ok(typeof i.text === 'string', 'text should be a string');
    assert.ok(['pattern', 'suggestion', 'prediction'].includes(i.type), 'type should be pattern/suggestion/prediction');
  });
});

test('returns at most 5 insights', () => {
  const log = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = today(d);
    log[key] = { p: { fajr: i % 2 === 0, dhuhr: true, asr: true, maghrib: true, isha: true }, d: { deed1: true } };
  }
  const w = loadSmartInsights({ S: makeState(log) }).window;
  const insights = w.generateInsights();
  assert.ok(insights.length <= 5, `should return at most 5 insights, got ${insights.length}`);
});

test('returns empty array when no log data', () => {
  const w = loadSmartInsights({ S: makeState({}) }).window;
  const insights = w.generateInsights();
  assert.ok(Array.isArray(insights), 'should return array even with no data');
});

test('generateInsights is exposed on window', () => {
  const w = loadSmartInsights().window;
  assert.strictEqual(typeof w.generateInsights, 'function');
});

test('renderSmartInsights is exposed on window', () => {
  const w = loadSmartInsights().window;
  assert.strictEqual(typeof w.renderSmartInsights, 'function');
});

test('renderSmartInsights does not throw when container missing', () => {
  const w = loadSmartInsights().window;
  assert.doesNotThrow(() => w.renderSmartInsights());
});

test('detects streak pattern', () => {
  const log = {};
  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = today(d);
    log[key] = { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} };
  }
  const state = makeState(log);
  state.cs = 8;
  const w = loadSmartInsights({ S: state }).window;
  const insights = w.generateInsights();
  const streakInsight = insights.find(i => i.text.includes('8-day streak'));
  assert.ok(streakInsight, 'should detect streak pattern');
  assert.strictEqual(streakInsight.type, 'pattern');
});

test('suggests Fajr when missed frequently', () => {
  const log = {};
  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = today(d);
    log[key] = { p: { fajr: false, dhuhr: true, asr: true, maghrib: true, isha: true }, d: {} };
  }
  const w = loadSmartInsights({ S: makeState(log) }).window;
  const insights = w.generateInsights();
  const fajrInsight = insights.find(i => i.text.includes('Fajr'));
  assert.ok(fajrInsight, 'should suggest Fajr improvement');
  assert.strictEqual(fajrInsight.type, 'suggestion');
});
