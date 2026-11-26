'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function loadI18n(lang, stateExtras) {
  let dir = 'ltr', htmlLang = 'en';
  const S = Object.assign({ lang, numerals: 'auto', bnTermMode: 'namaz' }, stateExtras || {});
  const sandbox = {
    window: {},
    console,
    Intl,
    navigator: { language: lang === 'bn' ? 'bn-BD' : (lang === 'ar' ? 'ar-SA' : 'en-US') },
    localStorage: { getItem: () => lang, setItem: () => {} },
    S,
    document: {
      documentElement: {
        setAttribute(k, v) { if (k === 'dir') dir = v; if (k === 'lang') htmlLang = v; }
      },
      body: { setAttribute() {} },
      querySelectorAll: () => [],
      querySelector: () => null
    }
  };
  sandbox.global = sandbox;
  const code = fs.readFileSync(path.join(ROOT, 'data', 'i18n.js'), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: 'data/i18n.js' });
  for (const k of Object.keys(sandbox.window)) sandbox[k] = sandbox.window[k];
  return { sandbox, S, getDir: () => dir, getHtmlLang: () => htmlLang };
}

test('Arabic language sets RTL dir="rtl" and translates real Arabic strings (zero Romanized placeholders)', () => {
  const { sandbox, getDir, getHtmlLang } = loadI18n('ar');
  sandbox.iqSetLang('ar');
  assert.strictEqual(getDir(), 'rtl');
  assert.strictEqual(getHtmlLang(), 'ar');
  assert.strictEqual(sandbox.t('Prayer Times'), 'أوقات الصلاة');
  assert.strictEqual(sandbox.t('Quran'), 'القرآن الكريم');
});

test('Bangla language supports Namaz/Roza vs Salat/Siyam terminology toggle cleanly', () => {
  const namazEnv = loadI18n('bn', { bnTermMode: 'namaz' });
  assert.strictEqual(namazEnv.sandbox.t('Prayers'), 'নামাজ');
  assert.strictEqual(namazEnv.sandbox.t('Fasting'), 'রোজা');

  const salatEnv = loadI18n('bn', { bnTermMode: 'salat' });
  assert.strictEqual(salatEnv.sandbox.t('Prayers'), 'সালাত');
  assert.strictEqual(salatEnv.sandbox.t('Fasting'), 'সিয়াম');
});

test('iqFormatNum formats Western, Bangla, and Arabic-Indic numerals per user preference', () => {
  const wEnv = loadI18n('en', { numerals: 'western' });
  assert.strictEqual(wEnv.sandbox.iqFormatNum(2026), '2026');

  const bnEnv = loadI18n('bn', { numerals: 'bangla' });
  assert.strictEqual(bnEnv.sandbox.iqFormatNum(2026), '২০২৬');

  const arEnv = loadI18n('ar', { numerals: 'arabic' });
  assert.strictEqual(arEnv.sandbox.iqFormatNum(2026), '٢٠٢٦');

  // Auto mode defaults Bangla -> Bangla digits, Arabic -> Arabic-Indic digits
  const autoBn = loadI18n('bn', { numerals: 'auto' });
  assert.strictEqual(autoBn.sandbox.iqFormatNum(15), '১৫');
  const autoAr = loadI18n('ar', { numerals: 'auto' });
  assert.strictEqual(autoAr.sandbox.iqFormatNum(15), '١٥');
});

test('Arabic 6-category plural rules classify zero, one, two, few, many, other accurately', () => {
  const { sandbox } = loadI18n('ar', { numerals: 'arabic' });
  assert.strictEqual(sandbox.iqPluralCategory(0, 'ar'), 'zero');
  assert.strictEqual(sandbox.iqPluralCategory(1, 'ar'), 'one');
  assert.strictEqual(sandbox.iqPluralCategory(2, 'ar'), 'two');
  assert.strictEqual(sandbox.iqPluralCategory(5, 'ar'), 'few');
  assert.strictEqual(sandbox.iqPluralCategory(15, 'ar'), 'many');
  assert.strictEqual(sandbox.iqPluralCategory(100, 'ar'), 'other');
});
