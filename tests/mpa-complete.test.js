// tests/mpa-complete.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('all 6 pages exist with module entries and shell nav', () => {
  for (const p of ['today', 'ibadah', 'knowledge', 'names', 'library', 'profile']) {
    const html = fs.readFileSync(path.join(__dirname, '..', `src/pages/${p}/${p}.html`), 'utf8');
    assert.match(html, /type="module"/);
    const entry = fs.readFileSync(path.join(__dirname, '..', `src/pages/${p}/entry.js`), 'utf8');
    assert.match(entry, new RegExp("renderShell\\(['\"]" + p + "['\"]\\)"));
    assert.match(entry, /import ['"]\.\.\/\.\.\/core\/error-tap\.js['"]/);
    assert.ok(entry.indexOf('error-tap') < entry.indexOf('renderShell'), p + ': error-tap must be the FIRST import');
  }
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  assert.match(sw, /precache-manifest|PRECACHE/);
});

test('error-tap auto-installs in browsers', () => {
  const tap = fs.readFileSync(path.join(__dirname, '..', 'src/core/error-tap.js'), 'utf8');
  assert.match(tap, /if \(typeof window !== 'undefined' && typeof window\.addEventListener === 'function'\) installErrorTap\(\);/);
});

// Evaluate the `const <NAME> = [...]` array literal out of an ESM entry
// whose top-level DOM code cannot run under node.
function extractGroups(entryRelPath, constName) {
  const src = fs.readFileSync(path.join(__dirname, '..', entryRelPath), 'utf8');
  const m = src.match(new RegExp('const ' + constName + '\\s*=\\s*(\\[[\\s\\S]*?\\n\\]);'));
  assert.ok(m, constName + ' array literal must exist in ' + entryRelPath);
  return new Function('return (' + m[1] + ')')();
}

test('knowledge MPA entry mirrors consolidated TAB_GROUPS.knowledge ids', () => {
  const groups = extractGroups('src/pages/knowledge/entry.js', 'KNOWLEDGE_GROUPS');
  const tabs = (id) => groups.find((gr) => gr.id === id).tabs.map((t) => t.id);
  assert.deepEqual(tabs('quran_sunnah'), ['quran', 'tafsir', 'hadith', 'sunnahs']);
  assert.deepEqual(tabs('fiqh'), ['fiqh', 'worship-rulings', 'wealth-oaths']);
  assert.deepEqual(tabs('arabic'), ['arabic']);
  assert.deepEqual(tabs('heart'), ['virtues', 'vices-return', 'character-path']);
  assert.deepEqual(tabs('society'), ['family-life', 'community', 'service', 'work-justice']);
  assert.deepEqual(tabs('life'), ['wellness', 'earth-living', 'youth-tech', 'ethics-finance']);
  assert.deepEqual(tabs('history'), ['seerah', 'stories', 'battles', 'science', 'modernhist', 'ancientprophets']);
  assert.deepEqual(tabs('hereafter'), ['akhirah', 'jannah', 'jahannam', 'grave', 'signs', 'dreams']);
});

test('library MPA entry mirrors consolidated TAB_GROUPS.library ids', () => {
  const groups = extractGroups('src/pages/library/entry.js', 'LIBRARY_GROUPS');
  const tabs = (id) => groups.find((gr) => gr.id === id).tabs.map((t) => t.id);
  assert.deepEqual(tabs('dynasties'), ['umayyads', 'abbasids', 'andalus', 'ottomans', 'mamluks', 'seljuks', 'fatimids', 'ayyubids']);
  assert.deepEqual(tabs('cities'), ['holy-cities', 'capitals', 'east']);
  assert.deepEqual(tabs('arts'), ['pattern', 'sacred-space', 'living-crafts', 'word']);
  assert.deepEqual(tabs('arabic_lang'), ['structure', 'sound-script', 'words-poetry']);
  assert.deepEqual(tabs('philosophy'), ['being', 'knowing', 'will-evil']);
});

test('names MPA entry mirrors consolidated TAB_GROUPS.names_main ids', () => {
  const groups = extractGroups('src/pages/names/entry.js', 'NAMES_GROUPS');
  assert.deepEqual(groups.map(gr => gr.id), ['names']);
  assert.deepEqual(groups[0].tabs.map(t => t.id),
    ['allah_names', 'prophets', 'sahaba', 'women', 'scholars_names']);
});
