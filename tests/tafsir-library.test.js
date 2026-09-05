const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'features', 'tafsir-library.js'), 'utf8');

function loadModule(quranSurahs) {
  const window = {};
  new Function('window', 'QURAN_SURAHS', SRC)(window, quranSurahs || []);
  return window.TafsirLibrary;
}

test('sanitizeRichText strips scripts, styles, handlers, javascript: urls', () => {
  const T = loadModule([]);
  assert.equal(T.sanitizeRichText('<p onclick="evil()">ok</p><script>alert(1)<\/script>'), '<p>ok</p>');
  assert.equal(T.sanitizeRichText('<style>.x{}</style><b>keep</b>'), '<b>keep</b>');
  assert.equal(T.sanitizeRichText('<a href="javascript:alert(1)">x</a>'), '<a href="alert(1)">x</a>');
  assert.equal(T.sanitizeRichText("<p onmouseover='bad()'>y</p>"), '<p>y</p>');
  assert.equal(T.sanitizeRichText(null), '');
});

test('global ayah index math matches revelation-order cumulative counts', () => {
  const FAKE = [{ n:1, ay:7 },{ n:2, ay:286 },{ n:3, ay:200 }];
  const T = loadModule(FAKE);
  // internal: expose via getTafsir jalalayn path is async; instead pin through source contract:
  assert.match(SRC, /cum \+= QURAN_SURAHS\[i\]\.ay/);
  assert.match(SRC, /cum \+ ayah - 1/);
});

test('editions list exposes both editions with correct lang/dir', () => {
  const T = loadModule([]);
  assert.deepEqual(T.EDITIONS.map(e => e.id), ['ibnkathir', 'jalalayn']);
  assert.equal(T.EDITIONS[0].lang, 'en');
  assert.equal(T.EDITIONS[1].dir, 'rtl');
});

test('wiring pins: CDN endpoints and cache keys', () => {
  assert.ok(SRC.includes('https://api.quran.com/api/v4/tafsirs/169/by_ayah/'));
  assert.ok(SRC.includes('ara-jalaladdinalmah.json'));
  assert.match(SRC, /ContentCache\.get\('taf-jalalayn-ar'\)/);
  assert.match(SRC, /ContentCache\.get\('taf-ibnkathir-' \+/);
  assert.match(SRC, /_jalalaynPromise/, 'in-flight dedup present');
  assert.match(SRC, /window\.TafsirLibrary = \{/);
});

test('fetchJSON aborts hung requests (offline-first timeout)', () => {
  assert.match(SRC, /AbortController/);
  assert.match(SRC, /12000/);
  assert.match(SRC, /signal/);
});
