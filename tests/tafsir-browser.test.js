const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'features', 'tafsir-browser.js'), 'utf8');

function loadBrowser() {
  const window = {};
  const els = {};
  const fakeEl = () => ({ innerHTML: '' });
  const document = { getElementById: (id) => (els[id] || (els[id] = fakeEl())) };
  const S = { tafsirLookup: { surah: 1, ayah: 1 }, tafsirEdition: 'ibnkathir' };
  let saved = 0;
  const saveState = () => { saved++; };
  const QURAN_SURAHS = [{ n: 1, en: 'Al-Fatihah', ar: 'x', ay: 7, type: 'Meccan' }, { n: 2, en: 'Al-Baqarah', ar: 'y', ay: 286, type: 'Medinan' }];
  const TafsirLibrary = {
    EDITIONS: [{ id: 'ibnkathir', name: 'Ibn Kathir', lang: 'en', dir: 'ltr' }, { id: 'jalalayn', name: 'Jalalayn', lang: 'ar', dir: 'rtl' }],
    getTafsir: (ed, s, a) => { return Promise.resolve({ text: 'T', dir: 'ltr' }); },
    sanitizeRichText: (s) => s
  };
  new Function('window', 'document', 'S', 'saveState', 'QURAN_SURAHS', 'TafsirLibrary', SRC)(window, document, S, saveState, QURAN_SURAHS, TafsirLibrary);
  return { window, document, els, S, getSaved: () => saved };
}

test('browser pins: exports, picker, clamp, retry, offline note', () => {
  assert.match(SRC, /window\.renderTafsirBrowser = /);
  assert.match(SRC, /window\.setBrowserSurah = /);
  assert.match(SRC, /window\.setBrowserAyah = /);
  assert.match(SRC, /window\.setBrowserEdition = /);
  assert.match(SRC, /window\.retryBrowserTafsir = /);
  assert.match(SRC, /needs connection once/);
  assert.match(SRC, /retryBrowserTafsir\(/);
});

test('surah change clamps ayah and persists lookup', () => {
  const { window, S, getSaved } = loadBrowser();
  window.setBrowserSurah(999);
  assert.deepEqual(S.tafsirLookup, { surah: 2, ayah: 1 });
  assert.ok(getSaved() > 0, 'lookup persists');
});

test('ayah clamps to surah bounds', () => {
  const { window, S } = loadBrowser();
  window.setBrowserSurah(1);
  window.setBrowserAyah(999);
  assert.deepEqual(S.tafsirLookup, { surah: 1, ayah: 7 });
  window.setBrowserAyah(0);
  assert.deepEqual(S.tafsirLookup, { surah: 1, ayah: 1 });
});

test('render writes picker with select, options, editions and result panel', () => {
  const { window, els } = loadBrowser();
  window.renderTafsirBrowser();
  const html = els['tafsirBrowser'].innerHTML;
  assert.ok(html.includes('<select'), 'surah picker missing');
  assert.ok(html.includes('Al-Baqarah'), 'surah options missing');
  assert.ok(html.includes('tafsirBrowserResult'), 'result panel missing');
  assert.ok(html.includes('ibnkathir') && html.includes('jalalayn'), 'edition buttons missing');
});
