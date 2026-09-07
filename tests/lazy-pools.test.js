// tests/lazy-pools.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('today never bundles heavy pools; knowledge lazy-loads them', () => {
  const today = fs.readFileSync(path.join(__dirname, '..', 'src/pages/today/entry.js'), 'utf8');
  assert.doesNotMatch(today, /quran-verses|hadiths/);
  const knowledge = fs.readFileSync(path.join(__dirname, '..', 'src/pages/knowledge/entry.js'), 'utf8');
  assert.match(knowledge, /import\(['"]\.\.\/\.\.\/data\/pools\.js['"]\)|loadPool\(['"]quran-verses['"]\)/);
});

test('pool loader resolves known pools only', async () => {
  const { loadPool } = await import('../src/data/pools.js');
  await assert.rejects(() => loadPool('nope'), /unknown pool/);
});
