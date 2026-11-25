'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { loadFile } = require('./helpers/load.js');

function setupCarousel(extra) {
  const el = {
    innerHTML: '',
    style: {},
    addEventListener: () => {}
  };
  const sb = loadFile(path.join(__dirname, '..', 'features', 'daily-content.js'), Object.assign({
    S: { lv: 3, cs: 7, log: {}, masjidCheckIns: [{ id: 'm1' }] },
    INSPIRATIONS_POOL: ['Verily, with hardship comes ease. (94:6)'],
    HADITHS_POOL: [{ text: 'Actions are judged by intentions.', source: 'Bukhari' }],
    today: () => '2026-11-25',
    lvTitle: () => 'Learner',
    iqIcon: (k) => '[' + k + ']',
    escapeHTML: (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    setInterval,
    clearInterval,
    document: {
      readyState: 'complete',
      getElementById: (id) => (id === 'dailyCarousel' ? el : null),
      addEventListener: () => {}
    },
    window: {}
  }, extra || {}));
  return { sb, el };
}

test('renderDailyContent renders rich hero carousel with nav controls and escaped text', () => {
  const { sb, el } = setupCarousel({
    INSPIRATIONS_POOL: ['<script>xss()</script> Light upon light']
  });
  sb.window.renderDailyContent();
  assert.ok(el.innerHTML.includes('carousel-card'), 'hero carousel card must render');
  assert.ok(el.innerHTML.includes('_carouselPrev'), 'prev arrow button required');
  assert.ok(el.innerHTML.includes('_carouselNext'), 'next arrow button required');
  assert.ok(el.innerHTML.includes('carousel-cta'), 'slide action button required');
  assert.ok(!el.innerHTML.includes('<script>xss'), 'HTML must be escaped safely');
  const dotCount = (el.innerHTML.match(/carousel-dot/g) || []).length;
  assert.ok(dotCount >= 4, 'hero carousel should cycle through at least 4 rich slides');
  if (sb.window._stopCarouselTimer) sb.window._stopCarouselTimer();
});

test('_carouselNext and _carouselPrev advance and wrap slide index', () => {
  const { sb, el } = setupCarousel();
  sb.window.renderDailyContent();
  const slide0 = el.innerHTML;
  sb.window._carouselNext();
  const slide1 = el.innerHTML;
  assert.notStrictEqual(slide0, slide1, 'next button must change slide');
  sb.window._carouselPrev();
  assert.strictEqual(el.innerHTML, slide0, 'prev button must return cleanly to previous slide');
  if (sb.window._stopCarouselTimer) sb.window._stopCarouselTimer();
});
