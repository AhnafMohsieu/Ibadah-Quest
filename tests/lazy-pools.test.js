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
  assert.match(knowledge, /quran-verses/);
});

test('pool loader resolves known pools only', async () => {
  const { loadPool } = await import('../src/data/pools.js');
  await assert.rejects(() => loadPool('nope'), /unknown pool/);
});

test('pool loader needs DOM for known pools, rejects unknown anywhere', async () => {
  const { loadPool, poolURL } = await import('../src/data/pools.js');
  await assert.rejects(() => loadPool('nope'), /unknown pool/);
  await assert.rejects(() => loadPool('quran-verses'), /browser DOM/);
  assert.match(poolURL('quran-verses'), /quran-verses\.js$/);
  assert.match(poolURL('hadiths'), /hadiths\.js$/);
  assert.throws(() => poolURL('nope'), /unknown pool/);
});
