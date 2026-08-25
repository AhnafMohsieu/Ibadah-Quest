'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Browser semantics: a classic script's top-level `var` becomes a property of
// window, because window IS the global object. We replicate that by pointing
// sandbox.window at the sandbox itself before evaluation.
function bootBrowserLike(extra) {
  const store = {};
  const sb = {
    console,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    iqIcon: () => '',
    LEVELS: []
  };
  Object.assign(sb, extra || {});
  sb.window = sb;
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, '..', 'state', 'state.js'), 'utf8'),
    sb, { filename: 'state.js' }
  );
  return { sb, store };
}

test('top-level var S creates window.S after boot assignment (browser semantics)', () => {
  const { sb } = bootBrowserLike();
  assert.strictEqual(typeof sb.window.S, 'object'); // null -> typeof is object even pre-boot
  // core/actions.js does exactly this bare assignment inside its IIFE:
  vm.runInNewContext('S = window.loadState();', sb, { filename: 'actions-sim.js' });
  assert.ok(sb.window.S, 'window.S must be truthy after init assignment');
});

test('tabs.js gated persistence writes lastCat through window.S', () => {
  const { sb, store } = bootBrowserLike();
  vm.runInNewContext('S = window.loadState();', sb, { filename: 'actions-sim.js' });
  // Exact code shape used by render/tabs.js switchCategory():
  vm.runInNewContext('if (window.S) { window.S.lastCat = "profile"; window.saveState(); }', sb, { filename: 'tabs-sim.js' });
  const saved = JSON.parse(store['iq9_user_default']);
  assert.strictEqual(saved.lastCat, 'profile', 'lastCat must persist via the window.S gate');
});
