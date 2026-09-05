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
      // include non-enumerable props (calendar view state uses defineProperty getters)
      for (const key of Object.getOwnPropertyNames(sandbox.window)) {
        try { sandbox[key] = sandbox.window[key]; } catch (e) { /* getter-only, skip */ }
      }
    }
  }
  return sandbox;
}

function pad(n) { return String(n).padStart(2, '0'); }
function fmtKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

function makeDoc(captured) {
  return {
    getElementById: (id) => {
      if (!captured[id]) captured[id] = { innerHTML: '', textContent: '', style: {} };
      return captured[id];
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    documentElement: { getAttribute: () => '' },
    addEventListener: () => {}
  };
}

function makeProgSandbox() {
  const captured = {};
  return { captured, sandbox: loadSandbox(['render/calendar.js', 'render/dynamic.js'], {
    document: makeDoc(captured),
    iqIcon: () => '',
    today: (d) => (d instanceof Date ? fmtKey(d) : '2026-09-06'),
    S: { log: {} }
  }) };
}

test('calendar header shows the viewed month, not the current month', () => {
  const { captured, sandbox } = makeProgSandbox();
  sandbox.window.calViewYear = 2025;
  sandbox.window.calViewMonth = 0; // January
  sandbox.window.calViewHijriY = 1446;
  sandbox.window.calViewHijriM = 7;
  sandbox.window.renderProg();
  assert.ok(captured.calArea.innerHTML.includes('<h3>January 2025</h3>'),
    'expected January 2025 header, got: ' + captured.calArea.innerHTML.slice(0, 200));
});

test('calendar header follows month navigation', () => {
  const { captured, sandbox } = makeProgSandbox();
  sandbox.window.calViewYear = 2026;
  sandbox.window.calViewMonth = 5; // June
  sandbox.window.calViewHijriY = 1447;
  sandbox.window.calViewHijriM = 12;
  sandbox.window.renderProg();
  assert.ok(captured.calArea.innerHTML.includes('<h3>June 2026</h3>'),
    'expected June 2026 header, got: ' + captured.calArea.innerHTML.slice(0, 200));
});

test('calendar prev/next month update the view and re-render', () => {
  let renders = 0;
  const sandbox = loadSandbox(['render/calendar.js'], {
    renderProg: () => { renders++; }
  });
  sandbox.window.initCalView();
  const startM = sandbox.window.calViewMonth;
  const startY = sandbox.window.calViewYear;
  sandbox.window.calNextMonth();
  assert.strictEqual(renders, 1, 'calNextMonth must re-render');
  const expNext = (startM + 1) % 12;
  assert.strictEqual(sandbox.window.calViewMonth, expNext, 'calNextMonth must advance the month');
  assert.strictEqual(sandbox.window.calViewYear, startM === 11 ? startY + 1 : startY, 'year rolls over in December');
  sandbox.window.calPrevMonth();
  sandbox.window.calPrevMonth();
  assert.strictEqual(renders, 3, 'each navigation must re-render');
  assert.strictEqual(sandbox.window.calViewMonth, (expNext + 10) % 12, 'calPrevMonth must go back');
});
