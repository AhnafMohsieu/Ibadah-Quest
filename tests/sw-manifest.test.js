// tests/sw-manifest.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('precache manifest defines a non-empty __PRECACHE list', () => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'core', 'precache-manifest.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  sandbox.self = sandbox;
  vm.runInContext(code + '\nthis.__LIST__ = self.__PRECACHE;', sandbox, { filename: 'precache-manifest.js' });
  const list = sandbox.__LIST__;
  assert.ok(Array.isArray(list) && list.length > 0);
  for (const must of ['index.html', '404.html', 'privacy.html', 'features/iq-shell.js', 'features/masjid-checkins.js', 'features/analytics/charts.js', 'assets/vendor/adhan.umd.min.js', 'styles/tokens.css', 'data/i18n.js', 'core/offline.html']) {
    assert.ok(list.includes(must), 'manifest must precache ' + must);
  }
  for (const dead of ['core/shop.js', 'data/shop.js', 'features/combo-streaks.js', 'src/pages/today/today.html']) {
    assert.ok(!list.includes(dead), 'retired asset must not be precached: ' + dead);
  }
});

test('every precache manifest entry exists on disk', () => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'core', 'precache-manifest.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  sandbox.self = sandbox;
  vm.runInContext(code + '\nthis.__LIST__ = self.__PRECACHE;', sandbox, { filename: 'precache-manifest.js' });
  const root = path.join(__dirname, '..');
  for (const entry of sandbox.__LIST__) {
    const clean = entry.replace(/^\.\//, '').split('?')[0];
    if (!clean) continue;
    assert.ok(fs.existsSync(path.join(root, clean)), 'precache asset missing on disk: ' + entry);
  }
});
