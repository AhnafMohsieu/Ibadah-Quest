'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

function loadSW() {
  const listeners = {};
  const fakeSelf = {
    location: { href: 'https://iq.test/', origin: 'https://iq.test' },
    addEventListener: (type, fn) => { (listeners[type] = listeners[type] || []).push(fn); }
  };
  vm.runInNewContext(src, { self: fakeSelf, URL }, { filename: 'sw.js' });
  return { helpers: fakeSelf.swHelpers, listeners };
}

const { helpers, listeners } = loadSW();

test('cacheKey keeps the versioned pathname and query, strips hashes', () => {
  assert.strictEqual(helpers.cacheKey('https://iq.test/data/deeds.js?v=3'), '/data/deeds.js?v=3');
  assert.strictEqual(helpers.cacheKey('https://iq.test/data/deeds.js?v=4#top'), '/data/deeds.js?v=4');
  assert.strictEqual(helpers.cacheKey('/'), '/');
});

test('shouldCache accepts only GET http(s) requests', () => {
  assert.ok(helpers.shouldCache({ method: 'GET', url: 'https://iq.test/a.js' }));
  assert.ok(!helpers.shouldCache({ method: 'POST', url: 'https://iq.test/a.js' }));
  assert.ok(!helpers.shouldCache({ method: 'GET', url: 'chrome-extension://abc/a.js' }));
});

test('isSameOrigin splits same-origin from cross-origin', () => {
  assert.ok(helpers.isSameOrigin('https://iq.test/data/a.js'));
  assert.ok(!helpers.isSameOrigin('https://cdn.jsdelivr.net/npm/chart.js'));
  assert.ok(!helpers.isSameOrigin('https://api.aladhan.com/v1/timings'));
});

test('isCoreCache matches the versioned cache prefix only', () => {
  assert.ok(helpers.isCoreCache('iq-cache-v1'));
  assert.ok(helpers.isCoreCache('iq-cache-v2'));
  assert.ok(!helpers.isCoreCache('other-cache'));
  assert.ok(!helpers.isCoreCache('iq-cache'));
});

test('sw registers install, activate, fetch, and message handlers', () => {
  for (const ev of ['install', 'activate', 'fetch', 'message']) {
    assert.ok(listeners[ev] && listeners[ev].length === 1, ev + ' handler missing');
  }
});
