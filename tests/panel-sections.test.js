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

test('PANEL_SECTIONS covers every consolidated section', () => {
  const s = loadSections();
  for (const key of [
    'home', 'worship', 'quests', 'stats', 'growth', 'profile',
    'knowledge_quran', 'knowledge_fiqh', 'knowledge_heart', 'knowledge_history', 'names'
  ]) {
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
  const src = fs.readFileSync(path.join(ROOT, 'core', 'tabs.js'), 'utf8');
  assert.ok(src.includes('PANEL_SECTIONS'), 'tabs.js must use PANEL_SECTIONS');
  assert.ok(!/var\s+panelLookup/.test(src), 'inline panelLookup literal must be deleted');
  assert.ok(!/var sections = \{/.test(src), 'local sections literal must be deleted');
});

test('consolidated panels & merged areas exist; retired shop/library/growth panels gone', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  for (const p of [
    'panel-virtues', 'panel-vices-return', 'panel-character-path',
    'panel-worship-rulings', 'panel-wealth-oaths', 'panel-family-life',
    'panel-community', 'panel-service', 'panel-wellness',
    'panel-charity', 'panel-healthlog', 'panel-progress'
  ]) {
    assert.ok(html.includes(`id="${p}"`), 'missing ' + p);
  }
  // Merged containers inside consolidated panels
  assert.ok(html.includes('id="charityArea"') && html.includes('id="zakatcalcArea"') && html.includes('id="financeArea"'), 'charity/finance/zakat merged');
  assert.ok(html.includes('id="healthlogArea"') && html.includes('id="gratitudeArea"'), 'healthlog/gratitude merged');
  for (const retired of ['panel-rewards', 'panel-growth', 'section-library', 'panel-purification', 'panel-technology', 'panel-battles']) {
    assert.ok(!html.includes(`id="${retired}"`), 'retired ' + retired + ' still present');
  }
});
