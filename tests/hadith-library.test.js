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

test('quran reader carries no tafsir UI (lives in interpretation browser)', () => {
  const dyn = fs.readFileSync(path.join(__dirname, '..', 'render', 'dynamic.js'), 'utf8');
  assert.ok(!dyn.includes('verse-tafsir-btn'), 'verse tafsir buttons must be gone');
  assert.ok(!dyn.includes('tafsir-panel'), 'inline tafsir panels must be gone');
  assert.ok(!dyn.includes('fillOpenTafsirs'), 'panel filler must be gone');
  assert.ok(!dyn.includes('tafsir-hint'), 'edition hint must be gone');
  assert.ok(!dyn.includes('openTafsir'), 'open-panel state must be gone');
  assert.ok(dyn.includes('function setTafsirEdition'), 'edition writer stays for the browser');
  const st = fs.readFileSync(path.join(__dirname, '..', 'state', 'state.js'), 'utf8');
  assert.match(st, /tafsirEdition:'ibnkathir'/);
  assert.match(st, /tafsirLookup:\{surah:1,ayah:1\}/);
  const act = fs.readFileSync(path.join(__dirname, '..', 'core', 'actions.js'), 'utf8');
  assert.ok(!act.includes("toggleTafsir: appAction"), 'facade must drop toggleTafsir');
  assert.ok(!act.includes("retryTafsir: appAction"), 'facade must drop retryTafsir');
  assert.ok(act.includes("setTafsirEdition: appAction('setTafsirEdition')"), 'facade keeps setTafsirEdition');
});
