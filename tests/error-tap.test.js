'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = path.join(__dirname, '..', 'core', 'error-tap.js');

// Build a browser-ish sandbox, run error-tap.js inside it, and return handles
// to spy on the recorded errors, console calls, and toasts.
function makeSandbox(extraWindow) {
  const listeners = {};
  const consoleCalls = [];
  const toasts = [];
  const win = Object.assign(
    {
      addEventListener: (type, fn) => { listeners[type] = fn; },
      toast: (icon, msg, conf, ms) => { toasts.push([icon, msg]); },
      iqIcon: (key) => 'i:el:' + key,
      document: {}
    },
    extraWindow || {}
  );
  const sandbox = {
    console: { error: (...a) => { consoleCalls.push(a.map(String).join(' ')); } },
    window: win
  };
  vm.runInNewContext(fs.readFileSync(SRC, 'utf8'), sandbox, { filename: 'core/error-tap.js' });
  return { win, listeners, consoleCalls, toasts };
}

test('install wires onerror + unhandledrejection exactly once', () => {
  const { win, listeners } = makeSandbox();
  assert.strictEqual(typeof win.onerror, 'function', 'window.onerror must be set');
  assert.strictEqual(typeof listeners.unhandledrejection, 'function', 'unhandledrejection must be registered');
  assert.strictEqual(win.__iqErrorTapInstalled, true);
  const before = win.onerror;
  win.__iqErrorTap.install(); // re-install must be a no-op
  assert.strictEqual(win.onerror, before, 'install() must not double-overwrite onerror');
});

test('onGlobalError records and logs the error', () => {
  const { win, consoleCalls } = makeSandbox();
  const err = new Error('kaboom');
  const result = win.__iqErrorTap.onGlobalError('kaboom', 'somewhere.js', 10, 5, err);
  assert.strictEqual(result, false, 'must defer to the browser default handler');
  const recorded = win.__iqErrorTap.errors;
  assert.strictEqual(recorded.length, 1);
  assert.strictEqual(recorded[0].message, 'kaboom');
  assert.strictEqual(recorded[0].source, 'somewhere.js');
  assert.strictEqual(recorded[0].line, 10);
  assert.ok(consoleCalls.some((c) => c.includes('kaboom')), 'debug logs to the console');
  // non-Error message strings are kept verbatim too
  win.__iqErrorTap.onGlobalError(undefined, 'fn.js', 3, 1, new Error('boom'));
  assert.strictEqual(win.__iqErrorTap.errors[1].message, 'boom');
});

test('toast fires at most once per session', () => {
  const { win, toasts } = makeSandbox({ toast: (icon, msg) => toasts.push([icon, msg]) });
  win.__iqErrorTap.onGlobalError('a', 'x.js', 1, 1, new Error('a'));
  win.__iqErrorTap.onGlobalError('b', 'y.js', 2, 1, new Error('b'));
  win.__iqErrorTap.onUnhandledRejection({ reason: new Error('c') });
  assert.strictEqual(toasts.length, 1, 'exactly one toast for the whole session');
  assert.ok(toasts[0][1].length > 0, 'toast carries a human-friendly message');
});

test('toast is skipped when toast() is not available yet (guarded)', () => {
  const { win } = makeSandbox({ toast: undefined });
  assert.doesNotThrow(() => {
    win.__iqErrorTap.onGlobalError('late-bound', 'z.js', 3, 1, new Error('z'));
  }, 'must not throw when window.toast is undefined');
});

test('unhandledrejection records the rejection reason', () => {
  const { win, listeners } = makeSandbox();
  listeners.unhandledrejection({ reason: new Error('fetch failed') });
  const recorded = win.__iqErrorTap.errors;
  assert.strictEqual(recorded.length, 1);
  assert.match(recorded[0].message, /fetch failed/);
  assert.strictEqual(recorded[0].source, 'unhandledrejection');
});

test('error list is capped to avoid unbounded growth', () => {
  const { win } = makeSandbox();
  for (let i = 0; i < 100; i++) {
    win.__iqErrorTap.onGlobalError('e' + i, 'f.js', i, 1, new Error('e' + i));
  }
  assert.ok(win.__iqErrorTap.errors.length <= 25, 'error buffer must be bounded');
});