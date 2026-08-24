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

test('library: exactly the six remote collections, Musnad Ahmad absent', () => {
  const ids = [...src.matchAll(/id:'([a-z]+)', name:/g)].map(m => m[1]);
  assert.deepEqual(ids, ['abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik', 'qudsi']);
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

test('quran reader wires tafsir selector and panels', () => {
  const dyn = fs.readFileSync(path.join(__dirname, '..', 'render', 'dynamic.js'), 'utf8');
  assert.match(dyn, /App\.toggleTafsir\(/);
  assert.match(dyn, /App\.setTafsirEdition\(/);
  assert.match(dyn, /TafsirLibrary\.getTafsir\(/);
  assert.match(dyn, /TafsirLibrary\.sanitizeRichText\(/);
  assert.match(dyn, /EDITIONS\.forEach/);
  assert.match(dyn, /openTafsir = \{\}/);
  const st = fs.readFileSync(path.join(__dirname, '..', 'state', 'state.js'), 'utf8');
  assert.match(st, /tafsirEdition:'ibnkathir'/);
  const act = fs.readFileSync(path.join(__dirname, '..', 'core', 'actions.js'), 'utf8');
  assert.match(act, /toggleTafsir/);
  assert.match(act, /setTafsirEdition/);
});
