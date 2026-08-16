'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function setup(overrides) {
  const sandbox = loadFile(path.join(__dirname, '..', 'core', 'achievements.js'), Object.assign({
    ACHS: [
      { id: 'a1', name: 'First Step', tier: 'bronze', c: s => s.tp >= 1 },
      { id: 'a2', name: 'Perfect Day', tier: 'bronze', c: s => s.pd >= 1 },
      { id: 'a3', name: 'High Target', tier: 'bronze', c: s => s.tp >= 100 }
    ],
    S: { ua: {}, tp: 0, pd: 0 },
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {},
    renderAll: () => {},
    iqIcon: () => '',
    setTimeout: (fn) => fn(),
    clearTimeout: () => {}
  }, overrides || {}));
  return sandbox;
}

test('checkA: unlocks achievement when condition is met', () => {
  const s = setup();
  s.S.tp = 1;
  s.window.checkA();
  assert.ok(s.S.ua.a1, 'achievement a1 should be unlocked');
  assert.strictEqual(s.S.ua.a1, '2026-08-11');
});

test('checkA: no double-unlock if already unlocked', () => {
  const s = setup();
  s.S.ua.a1 = '2026-08-10';
  s.S.tp = 1;
  s.window.checkA();
  assert.strictEqual(s.S.ua.a1, '2026-08-10', 'should keep original date');
});

test('checkA: shows toast on unlock', () => {
  let toastCalled = false;
  const s = setup({
    toast: () => { toastCalled = true; }
  });
  s.S.tp = 1;
  s.window.checkA();
  assert.ok(toastCalled, 'toast should be called');
});

test('checkA: calls renderAll when new achievements unlocked', () => {
  let renderCalled = false;
  const s = setup({
    renderAll: () => { renderCalled = true; }
  });
  s.S.tp = 1;
  s.window.checkA();
  assert.ok(renderCalled, 'renderAll should be called');
});

test('checkA: does not call renderAll when no new achievements', () => {
  let renderCalled = false;
  const s = setup({
    renderAll: () => { renderCalled = true; }
  });
  s.S.tp = 0;
  s.window.checkA();
  assert.ok(!renderCalled, 'renderAll should not be called');
});