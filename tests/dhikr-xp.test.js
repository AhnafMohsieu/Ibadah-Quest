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

const DHIKR_COUNTER_DATA = [
  { arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'SubhanAllah', english: 'Glory be to Allah', target: 33, color: '#16a34a' },
  { arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', english: 'All praise is for Allah', target: 5, color: '#f59e0b' }
];

const sandbox = loadSandbox([], {
  S: {
    lv: 1, xp: 0,
    dhikrCounters: { _active: 0 },
    dhikrSessions: [],
    dhikrStats: { total: {}, daily: {}, streak: 0, bestStreak: 0, lastSessionDate: null, badges: [], achievements: [] },
    dhikrSettings: {},
    dhikrCustom: [], dhikrFavorites: []
  },
  DHIKR_COUNTER_DATA,
  DHIKR_BADGES: [],
  today: () => '2026-08-10',
  saveState: () => {},
  toast: () => {},
  playSound: () => {},
  lvFrom: (xp) => { let lv = 1; while (xp >= 100 * Math.pow(lv + 1, 1.5)) lv++; return lv; },
  lvTitle: (lv) => 'Tier' + lv,
  checkLevelUp: () => {},
  updateDhikrStreak: () => {},
  checkDhikrBadges: () => {},
  renderDhikrCounter: () => {},
  navigator: {},
  document: { getElementById: () => null },
  iqIcon: (key) => '<img class="iq-icon">'
});

const S = sandbox.S;
const actionsSrc = fs.readFileSync(path.join(__dirname, '..', 'core', 'actions.js'), 'utf8');

function extractFunction(src, name) {
  const idx = src.indexOf('function ' + name);
  const openIdx = src.indexOf('{', idx);
  let depth = 0, inStr = false, strCh = '';
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === strCh) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return src.slice(idx, i + 1); }
  }
  throw new Error('could not extract ' + name);
}

const tapSrc = extractFunction(actionsSrc, 'tapDhikr');

const wrapped = tapSrc + '\nthis.__tap = tapDhikr;';
vm.runInNewContext(wrapped, sandbox, { filename: 'tapDhikr' });

const tap = sandbox.__tap;

test('dhikr: each tap grants +1 XP', () => {
  S.xp = 0; S.dhikrCounters = { _active: 0, 0: 0 };
  tap();
  tap();
  assert.strictEqual(S.xp, 2, 'two taps should grant 2 XP');
});

test('dhikr: target completion grants +20 bonus and auto-resets counter', () => {
  S.xp = 0;
  S.dhikrCounters = { _active: 1, 1: 4 }; // budget 5 (test data), one tap to reach
  tap();
  assert.strictEqual(S.xp, 21, 'completing tap = 1 per-tap + 20 bonus');
  assert.strictEqual(S.dhikrCounters[1], 0, 'counter resets after completion');
});

test('dhikr: session records completed cycle count', () => {
  S.xp = 0;
  S.dhikrSessions = [];
  S.dhikrCounters = { _active: 1, 1: 4 };
  tap();
  assert.strictEqual(S.dhikrSessions.length, 1, 'a session is recorded');
  assert.strictEqual(S.dhikrSessions[0].count, 5, 'session records the full count reached');
});