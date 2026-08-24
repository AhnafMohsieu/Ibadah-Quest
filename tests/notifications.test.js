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
    setInterval: () => {},
    clearInterval: () => {},
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

test('toggleNotifications updates state', () => {
  const state = { notificationsEnabled: false };
  const notification = { permission: 'granted' };
  const sandbox = loadSandbox(['features/notifications.js'], {
    S: state,
    Notification: notification,
    window: { Notification: notification },
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '🔔'
  });
  
  sandbox.toggleNotifications();
  assert.strictEqual(state.notificationsEnabled, true);
});

test('toggleNotifications can disable', () => {
  const state = { notificationsEnabled: true };
  const sandbox = loadSandbox(['features/notifications.js'], {
    S: state,
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '🔔'
  });
  
  sandbox.toggleNotifications();
  assert.strictEqual(state.notificationsEnabled, false);
});
