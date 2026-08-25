'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

const ROOT = path.join(__dirname, '..');

function loadSections() {
  return loadFile(path.join(ROOT, 'data', 'panel-sections.js'), {}).window.PANEL_SECTIONS;
}

test('PANEL_SECTIONS covers every section incl. ones only activateTab knew about', () => {
  const s = loadSections();
  for (const key of ['home','quests','stats','growth','profile','knowledge_quran','knowledge_fiqh',
                     'knowledge_creed','knowledge_heart','knowledge_society','knowledge_life',
                     'knowledge_history','knowledge_hereafter','library_dynasties','library_cities',
                     'library_arts','library_arabic','library_philosophy']) {
    assert.ok(Array.isArray(s[key]) && s[key].length > 0, 'missing section: ' + key);
  }
});

test('every listed panel id exists in index.html', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const s = loadSections();
  const missing = [];
  for (const key of Object.keys(s)) {
    for (const p of s[key]) {
      if (!html.includes(`id="${p}"`)) missing.push(key + ':' + p);
    }
  }
  assert.deepEqual(missing, [], 'panels referenced but not in index.html: ' + missing.join(', '));
});

test('tabs.js consumes PANEL_SECTIONS and no second literal map remains', () => {
  const src = fs.readFileSync(path.join(ROOT, 'render', 'tabs.js'), 'utf8');
  assert.ok(src.includes('PANEL_SECTIONS'), 'tabs.js must use PANEL_SECTIONS');
  assert.ok(!/var\s+panelLookup/.test(src), 'inline panelLookup literal must be deleted');
  assert.ok(!/var sections = \{/.test(src), 'local sections literal must be deleted');
});
