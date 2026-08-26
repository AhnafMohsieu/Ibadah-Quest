'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { loadFile } = require('./helpers/load.js');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Extract the REAL closeToastOverlay from core/actions.js so the callback
// contract is tested against production code, not a test-local mirror.
function loadRealCloseToastOverlay(sandbox) {
  const src = fs.readFileSync(path.join(__dirname, '..', 'core', 'actions.js'), 'utf8');
  const start = src.indexOf('function closeToastOverlay()');
  assert.ok(start > -1, 'closeToastOverlay found in actions.js');
  const marker = '\n  }';
  const end = src.indexOf(marker, start);
  assert.ok(end > start, 'closeToastOverlay body extracted');
  sandbox.window.closeToastOverlay = vm.runInNewContext('(' + src.slice(start, end + marker.length) + ')', sandbox);
}

test('showDailySummary shows once per day', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-summary.js'), {
    S: {
      log: { '2026-08-11': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } } },
      xp: 500,
      dq: [{ done: true }, { done: true }, { done: false }, { done: false }],
      cs: 7,
      lastDailySummary: null
    },
    today: () => '2026-08-11',
    toast: () => {},
    saveState: () => {},
    openToastModal: function(html) {
      var el = { innerHTML: html, style: {}, classList: { add: () => {} } };
      return el;
    },
    document: { getElementById: () => ({ innerHTML: '', style: {}, classList: { add: () => {} } }) }
  });

  sandbox.window.showDailySummary();
  assert.strictEqual(sandbox.S.lastDailySummary, '2026-08-11');
});

test('showDailySummary does not show twice same day', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-summary.js'), {
    S: {
      log: { '2026-08-11': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } } },
      xp: 500,
      dq: [{ done: true }, { done: true }, { done: false }, { done: false }],
      cs: 7,
      lastDailySummary: '2026-08-11'
    },
    today: () => '2026-08-11',
    toast: () => {},
    saveState: () => {},
    openToastModal: function(html) {
      var el = { innerHTML: html, style: {}, classList: { add: () => {} } };
      return el;
    },
    document: { getElementById: () => ({ innerHTML: '', style: {}, classList: { add: () => {} } }) }
  });

  sandbox.window.showDailySummary();
  assert.strictEqual(sandbox.S.lastDailySummary, '2026-08-11');
});

test('showDailySummary(cb) then closeToastOverlay() fires cb after ~300ms', async () => {
  let fired = 0;
  const S = {
    log: {},
    xp: 500,
    dq: [{ done: true }],
    cs: 3,
    lastDailySummary: null
  };
  const ovEl = { innerHTML: '', style: { display: 'none' }, classList: { remove: () => {} } };
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-summary.js'), {
    S,
    today: () => '2026-08-11',
    toast: () => {},
    saveState: () => {},
    openToastModal: function(html) { ovEl.innerHTML = html; ovEl.style.display = 'flex'; return ovEl; },
    document: { getElementById: () => ovEl },
    setTimeout, clearTimeout
  });
  loadRealCloseToastOverlay(sandbox);

  sandbox.window.showDailySummary(() => { fired++; });
  assert.strictEqual(S.lastDailySummary, '2026-08-11', 'day stamped on show');
  assert.strictEqual(ovEl.style.display, 'flex', 'overlay shown');

  sandbox.window.closeToastOverlay();
  assert.strictEqual(ovEl.style.display, 'none', 'overlay closed');
  assert.strictEqual(fired, 0, 'callback waits out the ~300ms inter-modal gap');

  await sleep(400);
  assert.strictEqual(fired, 1, 'cb fires once after the gap');

  sandbox.window.closeToastOverlay();
  await sleep(400);
  assert.strictEqual(fired, 1, 'consumed callback cannot fire twice (no double-advance)');
});

test('already-stamped day: cb fires synchronously and no overlay opens (no stall)', () => {
  let opened = false;
  let fired = 0;
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-summary.js'), {
    S: { log: {}, xp: 0, dq: [], cs: 0, lastDailySummary: '2026-08-11' },
    today: () => '2026-08-11',
    toast: () => {},
    saveState: () => {},
    openToastModal: function(html) { opened = true; return { innerHTML: html, style: {}, classList: { add: () => {} } }; },
    document: { getElementById: () => null }
  });

  sandbox.window.showDailySummary(() => { fired++; });
  assert.strictEqual(fired, 1, 'queue advances synchronously — no 10s watchdog stall');
  assert.strictEqual(opened, false, 'no overlay for already-stamped day');
});

test('missing overlay element: cb fires and stored hook is cleared', () => {
  let fired = 0;
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-summary.js'), {
    S: { log: {}, xp: 0, dq: [], cs: 0, lastDailySummary: null },
    today: () => '2026-08-11',
    toast: () => {},
    saveState: () => {},
    openToastModal: function() { return null; },
    document: { getElementById: () => null }
  });

  sandbox.window.showDailySummary(() => { fired++; });
  assert.strictEqual(fired, 1, 'advance without overlay element');
  assert.strictEqual(sandbox.window._iqModalDone, null, 'no stale hook left to fire late');
});
