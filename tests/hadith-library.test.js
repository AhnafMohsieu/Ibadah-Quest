const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(path.join(__dirname, '..', 'features', 'hadith-library.js'), 'utf8');

test('library: targets verified CDN and minified editions', () => {
  assert.ok(src.includes('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/'));
  assert.ok(src.includes("eng-' + id + '.min.json'"));
  assert.ok(src.includes("ara-' + id + '.min.json'"));
});

test('library: exactly the five remote collections, Musnad Ahmad absent', () => {
  const ids = [...src.matchAll(/id:'([a-z]+)', name:/g)].map(m => m[1]);
  assert.deepEqual(ids, ['abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik']);
  assert.ok(!src.toLowerCase().includes('musnad'));
});

test('library: cache-first with shared in-flight promise and arabic backfill', () => {
  assert.match(src, /ContentCache\.get\('col-' \+ id\)/);
  assert.match(src, /_pending\[id\]/);
  assert.ok(src.includes('ensureBundledArabic'));
  assert.match(src, /window\.HadithLibrary = \{/);
});
