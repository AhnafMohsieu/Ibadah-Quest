const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(path.join(__dirname, '..', 'core', 'content-cache.js'), 'utf8');

test('content-cache: separate DB, does not touch state storage', () => {
  assert.ok(src.includes("'iq-content-cache'"), 'uses its own DB name');
  assert.ok(!src.includes("Storage."), 'must not reference window.Storage');
  assert.ok(src.includes("'editions'"), 'has editions store');
});

test('content-cache: exposes get and put, failures resolve null/noop', () => {
  assert.ok(src.includes('window.ContentCache'), 'exports namespace');
  assert.match(src, /function get\(key\)/);
  assert.match(src, /function put\(key, value\)/);
  assert.match(src, /\.catch\(function \(\) \{ return null; \}\)/, 'get resolves null on failure');
});
