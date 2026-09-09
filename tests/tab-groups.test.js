'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function loadGroups() {
  const sb = loadFile(path.join(__dirname, '..', 'data', 'tab-groups.js'), {});
  return sb.window.TAB_GROUPS;
}

test('profile_main group is declared in data with the five core entries in order', () => {
  const g = loadGroups();
  assert.ok(Array.isArray(g.profile_main), 'profile_main must exist in data/tab-groups.js');
  assert.deepEqual(
    g.profile_main.map(t => t.id),
    ['profile', 'trophies', 'progress', 'stats', 'rewards']
  );
  g.profile_main.forEach(t => {
    assert.ok(t.label && t.icon, 'each entry needs icon+label: ' + JSON.stringify(t));
  });
});

test('every profile_main tab id has a matching panel in index.html', () => {
  const fs = require('fs');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const g = loadGroups();
  g.profile_main.forEach(t => {
    assert.ok(html.includes(`id="panel-${t.id}"`), `missing panel-${t.id}`);
  });
});

test('knowledge groups match consolidated IA (31 subtabs)', () => {
  const g = loadGroups();
  const tabs = id => g.knowledge.find(gr => gr.id === id).tabs.map(t => t.id);
  assert.deepEqual(tabs('quran_sunnah'), ['quran', 'tafsir', 'hadith', 'sunnahs']);
  assert.deepEqual(tabs('fiqh'), ['fiqh', 'worship-rulings', 'wealth-oaths']);
  assert.deepEqual(tabs('arabic'), ['arabic']);
  assert.ok(!('creed' in Object.fromEntries(g.knowledge.map(gr => [gr.id, 1]))), 'creed id gone');
  assert.deepEqual(tabs('heart'), ['virtues', 'vices-return', 'character-path']);
  assert.deepEqual(tabs('society'), ['family-life', 'community', 'service', 'work-justice']);
  assert.deepEqual(tabs('life'), ['wellness', 'earth-living', 'youth-tech', 'ethics-finance']);
  assert.deepEqual(tabs('history'), ['seerah', 'stories', 'battles', 'science', 'modernhist', 'ancientprophets']);
  assert.deepEqual(tabs('hereafter'), ['akhirah', 'jannah', 'jahannam', 'grave', 'signs', 'dreams']);
});

test('library groups match consolidated IA (21 subtabs) + names_main exists', () => {
  const g = loadGroups();
  const tabs = id => g.library.find(gr => gr.id === id).tabs.map(t => t.id);
  assert.deepEqual(tabs('dynasties'), ['umayyads', 'abbasids', 'andalus', 'ottomans', 'mamluks', 'seljuks', 'fatimids', 'ayyubids']);
  assert.deepEqual(tabs('cities'), ['holy-cities', 'capitals', 'east']);
  assert.deepEqual(tabs('arts'), ['pattern', 'sacred-space', 'living-crafts', 'word']);
  assert.deepEqual(tabs('arabic_lang'), ['structure', 'sound-script', 'words-poetry']);
  assert.deepEqual(tabs('philosophy'), ['being', 'knowing', 'will-evil']);
  assert.ok(Array.isArray(g.names_main), 'names_main group must exist');
  assert.deepEqual(g.names_main[0].tabs.map(t => t.id),
    ['allah_names', 'prophets', 'sahaba', 'women', 'scholars_names']);
});
