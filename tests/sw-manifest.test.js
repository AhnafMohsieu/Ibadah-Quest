// tests/sw-manifest.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('precache manifest defines a non-empty __PRECACHE list', () => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'precache-manifest.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  sandbox.self = sandbox;
  vm.runInContext(code + '\nthis.__LIST__ = self.__PRECACHE;', sandbox, { filename: 'precache-manifest.js' });
  const list = sandbox.__LIST__;
  assert.ok(Array.isArray(list) && list.length > 0);
  for (const must of ['index.html', 'offline.html', 'src/pages/today/today.html']) {
    assert.ok(list.includes(must), 'manifest must precache ' + must);
  }
});
