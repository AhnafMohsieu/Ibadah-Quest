'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function loadWith(raw) {
  const store = {
    getItem: k => (k === 'iq9_user_default' ? raw : null),
    setItem: () => {}, removeItem: () => {}
  };
  return loadFile(path.join(__dirname, '..', 'state', 'state.js'), { localStorage: store });
}

test('legacy lastActiveDate newer than lad migrates into lad and is deleted', () => {
  const legacy = JSON.stringify({
    log: {}, td: {}, vc: {},
    lad: '2026-08-01', lastActiveDate: '2026-08-20'
  });
  const sb = loadWith(legacy);
  const p = sb.window.loadState();
  assert.strictEqual(p.lad, '2026-08-20');
  assert.strictEqual(p.lastActiveDate, undefined);
});

test('stale lastActiveDate does NOT overwrite fresher lad', () => {
  const legacy = JSON.stringify({
    log: {}, td: {}, vc: {},
    lad: '2026-08-25', lastActiveDate: '2026-07-01'
  });
  const sb = loadWith(legacy);
  const p = sb.window.loadState();
  assert.strictEqual(p.lad, '2026-08-25');
  assert.strictEqual(p.lastActiveDate, undefined);
});
