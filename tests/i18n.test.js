'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'data', 'i18n.js'), 'utf8');
const actions = fs.readFileSync(path.join(root, 'core', 'actions.js'), 'utf8');
const iqShell = fs.readFileSync(path.join(root, 'features', 'iq-shell.js'), 'utf8');

// Stub a minimal global so the i18n module's top-level code runs under node.
global.localStorage = {
  getItem: () => 'en',
  setItem: () => {}
};
global.document = {
  querySelectorAll: () => [],
  querySelector: () => null
};
global.window = {};
require(path.join(root, 'data', 'i18n.js'));
const I18N = window.I18N;
const t = window.t;

test('i18n script is loaded before core/actions.js', () => {
  const i1 = html.indexOf('data/i18n.js');
  const i2 = html.indexOf('core/actions.js');
  assert.ok(i1 > -1 && i2 > -1 && i1 < i2);
});

test('i18n translates known chrome strings across all three languages', () => {
  I18N.lang = 'en';
  assert.strictEqual(t('Prayer Times'), 'Prayer Times');
  I18N.lang = 'ar';
  assert.strictEqual(t('Prayer Times'), 'أوقات الصلاة');
  I18N.lang = 'bn';
  assert.strictEqual(t('Prayer Times'), 'নামাজের সময়');
  I18N.lang = 'en';
});

test('i18n falls back to the source string for unknown keys', () => {
  I18N.lang = 'bn';
  assert.strictEqual(t('Totally Unknown Label'), 'Totally Unknown Label');
  I18N.lang = 'en';
});

test('tab/category labels pass through the translate helper in 3-dot drawer', () => {
  assert.ok(iqShell.includes('tLabel(c.label)'), '3-dot drawer must translate category labels');
  assert.ok(iqShell.includes('tLabel(grp.label)'), '3-dot drawer must translate group labels');
  assert.ok(iqShell.includes('tLabel(tab.label)'), '3-dot drawer must translate sub-tab labels');
  assert.ok(i18n.includes('.bnav-btn'), 'iqSetLang must update .bnav-btn labels');
  assert.ok(i18n.includes('syncIqDrawer'), 'iqSetLang must sync 3-dot drawer labels');
});

test('bnav buttons carry data-i18n keys with .bnav-label spans', () => {
  assert.ok(html.includes('data-i18n="Home"'));
  assert.ok(html.includes('data-i18n="Worship"'));
  assert.ok(html.includes('data-i18n="Knowledge"'));
  assert.ok(html.includes('data-i18n="Profile"'));
  assert.ok(html.includes('class="bnav-label"'));
});