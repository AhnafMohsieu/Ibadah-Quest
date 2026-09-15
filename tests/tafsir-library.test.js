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

test('editions list exposes only Ibn Kathir', () => {
  const T = loadModule([]);
  assert.deepEqual(T.EDITIONS.map(e => e.id), ['ibnkathir']);
  assert.equal(T.EDITIONS[0].lang, 'en');
  assert.equal(T.EDITIONS[0].dir, 'ltr');
  assert.equal(T.EDITIONS[0].apiId, 169);
});

test('wiring pins: CDN endpoint and cache key', () => {
  assert.ok(SRC.includes('https://api.quran.com/api/v4/tafsirs/'));
  assert.match(SRC, /ContentCache\.get\('taf-' \+ editionId/);
  assert.match(SRC, /window\.TafsirLibrary = \{/);
});

test('fetchJSON aborts hung requests (offline-first timeout)', () => {
  assert.match(SRC, /AbortController/);
  assert.match(SRC, /12000/);
  assert.match(SRC, /signal/);
});
