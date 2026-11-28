'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

test('getWorshipDayCues detects Sunnah fasts, Jumuah, and Ramadan cleanly', () => {
  const code = fs.readFileSync(path.join(ROOT, 'core', 'calendar.js'), 'utf8');
  const sb = {
    window: { t: s => s, iqFormatNum: n => String(n) },
    S: { hijriOffset: 0 },
    console
  };
  sb.window = Object.assign(sb.window, sb);
  vm.runInNewContext(code, sb);
  // Monday test date (2026-11-30 is Monday)
  const monCue = sb.window.getWorshipDayCues(new Date(2026, 10, 30, 12, 0, 0));
  assert.strictEqual(monCue.isMonThu, true);
  assert.strictEqual(monCue.isFriday, false);
  assert.ok(monCue.hijriText.length > 0);
  // Friday test date (2026-11-27 is Friday)
  const friCue = sb.window.getWorshipDayCues(new Date(2026, 10, 27, 12, 0, 0));
  assert.strictEqual(friCue.isFriday, true);
});

test('Qibla compass rose dial SVG and cardinal markers replace thin bar without text elements in SVG', () => {
  const src = fs.readFileSync(path.join(ROOT, 'core', 'render-prayers.js'), 'utf8');
  assert.ok(src.includes('iq-qibla-dial-wrap'), 'Compass rose dial container missing');
  assert.ok(src.includes('iq-qibla-dial-svg') && src.includes('iq-qibla-needle-svg'), 'Compass rose SVG layers missing');
  assert.ok(src.includes('id="iqQiblaNeedle"'), 'Rotating needle SVG missing');
  assert.ok(!/<svg[\s\S]*?<text/.test(src), 'SVGs must not embed raw <text> elements');
});

test('Quran reader includes Ayah bookmarks, quranLastRead resume, and persistent audio player bar', () => {
  const dynSrc = fs.readFileSync(path.join(ROOT, 'core', 'dynamic.js'), 'utf8');
  const stateSrc = fs.readFileSync(path.join(ROOT, 'core', 'state.js'), 'utf8');
  assert.ok(stateSrc.includes('quranLastRead:null'), 'freshState must track quranLastRead');
  assert.ok(dynSrc.includes('_toggleQuranVerseBookmark'), 'dynamic.js must wire verse bookmarking');
  assert.ok(dynSrc.includes('_syncQuranAudioBar') && dynSrc.includes('iqQuranAudioBar'), 'dynamic.js must render sticky audio bar');
  assert.ok(dynSrc.includes('iq-mushaf-plaque') && dynSrc.includes('iq-ayah-end'), 'Quran reader must render Mushaf ornaments');
});

test('Lazy pool loader ensures on-demand loading and exposes search pools', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const contentSrc = fs.readFileSync(path.join(ROOT, 'core', 'content.js'), 'utf8');
  assert.ok(!html.includes('data/pools/fiqh.js'), 'heavy fiqh pool should lazy-load rather than block initial boot');
  assert.ok(html.includes('data/pools/dua.js'), 'tiny core dua pool stays eager');
  assert.ok(contentSrc.includes('ensurePoolsForTab'), 'content.js must export ensurePoolsForTab');
  assert.ok(contentSrc.includes('ensureAllSearchPoolsLoaded'), 'content.js must support lazy search hydration');
});
