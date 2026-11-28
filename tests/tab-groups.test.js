'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const { loadFile } = require('./helpers/load.js');

function loadGroups() {
  const sb = loadFile(path.join(__dirname, '..', 'data', 'tab-groups.js'), {});
  return sb.window.TAB_GROUPS;
}

test('4-pillar navigation structure declares ibadah, worship, knowledge, profile_main', () => {
  const g = loadGroups();
  assert.deepEqual(Object.keys(g), ['ibadah', 'worship', 'knowledge', 'profile_main']);
  assert.ok(!g.library, 'library pillar removed');
  assert.ok(!g.names_main, 'names folded into knowledge');
});

test('profile_main group is declared in data with the four core entries in order', () => {
  const g = loadGroups();
  assert.ok(Array.isArray(g.profile_main), 'profile_main must exist in data/tab-groups.js');
  assert.deepEqual(
    g.profile_main.map(t => t.id),
    ['profile', 'trophies', 'progress', 'stats']
  );
  g.profile_main.forEach(t => {
    assert.ok(t.label && t.icon, 'each entry needs icon+label: ' + JSON.stringify(t));
  });
});

test('worship pillar groups cover Quran, Adhkar, merged Giving & Zakat, and Health & Gratitude', () => {
  const g = loadGroups();
  const qa = g.worship.find(gr => gr.id === 'quran_adhkar').tabs.map(t => t.id);
  const dev = g.worship.find(gr => gr.id === 'devotions').tabs.map(t => t.id);
  assert.deepEqual(qa, ['quran', 'memorization', 'morning', 'evening', 'dhikr', 'situational', 'duas']);
  assert.deepEqual(dev, ['fasting', 'charity', 'healthlog', 'wudu', 'jumuah', 'salah', 'volprayers', 'extradeeds']);
});

test('every declared tab id in TAB_GROUPS has a matching panel in index.html', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const g = loadGroups();
  for (const cat of Object.keys(g)) {
    g[cat].forEach(item => {
      if (Array.isArray(item.tabs)) {
        item.tabs.forEach(t => assert.ok(html.includes(`id="panel-${t.id}"`), `missing panel-${t.id}`));
      } else {
        assert.ok(html.includes(`id="panel-${item.id}"`), `missing panel-${item.id}`);
      }
    });
  }
});

test('knowledge groups hold core sciences, character, Seerah & Hereafter, and Names & Figures', () => {
  const g = loadGroups();
  const tabs = id => g.knowledge.find(gr => gr.id === id).tabs.map(t => t.id);
  assert.deepEqual(tabs('quran_sunnah'), ['tafsir', 'hadith', 'sunnahs']);
  assert.deepEqual(tabs('fiqh'), ['fiqh', 'worship-rulings', 'wealth-oaths', 'aqeedah']);
  assert.deepEqual(tabs('faith_life'), ['virtues', 'vices-return', 'character-path', 'family-life', 'community', 'service', 'wellness']);
  assert.deepEqual(tabs('history'), ['seerah', 'stories', 'akhirah', 'jannah', 'jahannam', 'grave', 'signs']);
  assert.deepEqual(tabs('names'), ['allah_names', 'prophets', 'sahaba', 'women', 'scholars_names']);
});
