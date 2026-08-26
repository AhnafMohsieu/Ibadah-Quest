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

function makeSandbox() {
  const errors = [];
  const spyConsole = {
    log: () => {}, info: () => {}, debug: () => {}, warn: () => {},
    error: (...args) => { errors.push(args); }
  };
  const sandbox = {
    window: {
      escapeHTML: (v) => String(v == null ? '' : v).replace(/[&<>\"']/g, function(ch) { return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]; })
    },
    document: { getElementById: () => makeEl(), querySelector: () => makeEl(), querySelectorAll: () => [], addEventListener: () => {}, createElement: () => makeEl(), createDocumentFragment: () => makeEl(), body: makeEl(), head: makeEl(), activeElement: makeEl(), readyState: 'complete' },
    console: spyConsole,
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
  return { sandbox, errors };
}

// Same load order as app-registry.test.js
const files = [
  'data/levels.js','data/prayers.js','data/quests.js','data/deeds.js','data/voluntary.js','data/morning-evening.js',
  'data/relatable-dhikr.js',
  'data/shop.js','data/journeys.js','data/achievements.js','data/tab-groups.js','data/icons.js',
  'data/tips-details.js','data/hadith-collections.js','data/theme-meta.js','data/streak-msgs.js',
  'data/pools/new-pools.js','data/pools/helpers.js',
  'state/state.js',
  'render/calendar.js','render/prayers.js','render/static.js','render/dynamic.js','render/tabs.js','render/render.js',
  'core/themes.js','core/xp.js','core/prayers.js','core/quests.js','core/achievements.js','core/shop.js','core/dhikr.js','core/content.js',
  'core/actions.js'
];

test('boot falls back to sync init when storageReady rejects', async () => {
  const { sandbox, errors } = makeSandbox();
  // IndexedDB unavailable/blocked (file:// origins): the storage promise rejects.
  sandbox.window.storageReady = Promise.reject(new Error('idb blocked'));

  for (const f of files) {
    try { loadModule(sandbox, f); } catch (e) {
      // tolerate missing optional deps, same as app-registry harness
    }
  }

  // Let the rejected promise propagate through microtasks + timers.
  await new Promise(r => setTimeout(r, 50));

  // Boot must have recovered via the synchronous fallback path.
  assert.strictEqual(typeof sandbox.window.App, 'object', 'window.App must exist after fallback boot');
  assert.ok(
    errors.some(args => args[0] === 'Ibadah Quest async init error:'),
    'console.error must report the async init failure'
  );
});
