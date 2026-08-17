'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadModule(sandbox, relPath) {
  const code = fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: relPath });
}

// All App.X calls referenced from HTML/templates/feature scripts
const expected = [
  'toggleP','toggleV','toggleD','detail','tip','toggleQuest','addGratitude','toggleFasting','setCharityGoals',
  'grantDailyXp','grantCappedDailyXp','logWater','logSleep','logExercise','toggleMeal','addMemorization',
  'toggleMorning','toggleEvening','switchUser','logout','resetAll','openMuhasabah','dismissMuhasabah',
  'joinJourney','manualRefresh','ensureQuranLoaded','ensureHadithLoaded','claimBonus','setQuranView',
  'quranSearchFilter','openQuranSurah','quranBack','openQuranJuz','openHadithCollection','openHadithBook',
  'hadithBack','playQuranVerse','playSurah','stopSurah','setQuranReciter','playJuz','updateJuzButton',
  'calPrevMonth','calNextMonth','calGoToday','selectAvatar','selectTitle','selectFrame','setTheme',
  'toggleTheme','toggleNotifications','buy','tapDhikr','resetDhikr','nextDhikr','activateTab',
  'switchCategory','toggleAvatarPicker'
];

// Build a DOM stub
function makeEl() {
  const el = {
    innerHTML: '', textContent: '', value: '',
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    style: {}, dataset: {}, children: [],
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter(x => x !== c); },
    addEventListener: () => {}, removeEventListener: () => {},
    setAttribute: () => {}, removeAttribute: () => {},
    querySelector: () => makeEl(), querySelectorAll: () => [],
    getBoundingClientRect: () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
    focus: () => {}, click: () => {}, dispatchEvent: () => {},
    cloneNode: () => makeEl()
  };
  return el;
}

const sandbox = {
  window: {},
  document: { getElementById: () => makeEl(), querySelector: () => makeEl(), querySelectorAll: () => [], addEventListener: () => {}, createElement: () => makeEl(), createDocumentFragment: () => makeEl(), body: makeEl(), head: makeEl(), activeElement: makeEl() },
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  iqIcon: () => '', iqEmoji: () => '',
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  fetch: () => Promise.resolve({ json: () => Promise.resolve([]) }),
  Promise, Math, Date, JSON, Object, Array, Number, String, Boolean, RegExp, Error, Symbol, Map, Set,
  navigator: { serviceWorker: { register: () => Promise.resolve() } },
  location: { hash: '', href: 'http://localhost/' },
  history: { pushState: () => {}, replaceState: () => {}, state: null },
  Notification: { permission: 'default', requestPermission: () => Promise.resolve('default') },
  AudioContext: function() { return { state: 'running', resume: () => Promise.resolve(), destination: {}, createOscillator: () => ({ connect: () => {}, start: () => {}, frequency: { value: 0 }, type: '' }), createGain: () => ({ connect: () => {}, gain: { value: 0, exponentialRampToValueAtTime: () => {} } }) }; },
  requestAnimationFrame: (cb) => setTimeout(cb, 16)
};
sandbox.global = sandbox;

const files = [
  'data/levels.js','data/prayers.js','data/quests.js','data/deeds.js','data/voluntary.js','data/morning-evening.js',
  'data/shop.js','data/journeys.js','data/achievements.js','data/tab-groups.js','data/icons.js',
  'data/tips-details.js','data/hadith-collections.js','data/theme-meta.js','data/streak-msgs.js',
  'data/pools/new-pools.js','data/pools/helpers.js',
  'state/state.js',
  'render/calendar.js','render/prayers.js','render/static.js','render/dynamic.js','render/tabs.js','render/render.js',
  'core/themes.js','core/xp.js','core/prayers.js','core/quests.js','core/achievements.js','core/shop.js','core/dhikr.js','core/content.js',
  'core/actions.js'
];

for (const f of files) {
  try { loadModule(sandbox, f); } catch (e) {
    // Silently tolerate — the goal is to check whether window.App was populated, not perfect init
  }
}

const App = sandbox.window.App || {};
const missing = expected.filter(k => typeof App[k] !== 'function');

test('window.App has all expected methods', () => {
  if (missing.length) console.log('MISSING:', missing);
  assert.deepStrictEqual(missing, [], `Missing App methods: ${missing.join(', ')}`);
});

test('window.switchCategory is defined', () => {
  assert.strictEqual(typeof sandbox.window.switchCategory, 'function');
});
test('window.activateTab is defined', () => {
  assert.strictEqual(typeof sandbox.window.activateTab, 'function');
});
test('window.tapDhikr is defined', () => {
  assert.strictEqual(typeof sandbox.window.tapDhikr, 'function');
});

test('switchCategory syncs bottom nav active state', () => {
  const tabsSrc = require('fs').readFileSync(require('path').join(__dirname, '..', 'render', 'tabs.js'), 'utf8');
  const fnIdx = tabsSrc.indexOf('function switchCategory');
  const body = tabsSrc.slice(fnIdx, fnIdx + 1400);
  assert.ok(body.includes('.bnav-btn'), 'switchCategory must sync .bnav-btn');
});
