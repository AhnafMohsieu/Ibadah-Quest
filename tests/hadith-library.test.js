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

test('renderer: hadith UI wires library + audio', () => {
  const dyn = fs.readFileSync(path.join(__dirname, '..', 'render', 'dynamic.js'), 'utf8');
  assert.match(dyn, /HadithLibrary\.ensureHadithCollection\(/);
  assert.match(dyn, /HadithLibrary\.ensureBundledArabic\(/);
  assert.match(dyn, /AppAudio\.toggleTTS\(/);
  assert.match(dyn, /window\.hadithSpeak = hadithSpeak;/);
  assert.match(dyn, /Online<\/span>/, 'remote cards carry an Online badge');
});

test('dhikr: speakers wired in static renderers with stopPropagation', () => {
  const st = fs.readFileSync(path.join(__dirname, '..', 'render', 'static.js'), 'utf8');
  assert.match(st, /App\.dhikrSpeak\('morning'/);
  assert.match(st, /App\.dhikrSpeak\('evening'/);
  assert.match(st, /App\.dhikrSpeak\('situational'/);
  assert.match(st, /App\.dhikrPlayAll\('morning'\)/);
  assert.match(st, /event\.stopPropagation\(\);App\.dhikrSpeak/);
});
