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
    __PRECACHE: [],
    addEventListener: (type, fn) => { (listeners[type] = listeners[type] || []).push(fn); }
  };
  // Manifest-driven SW calls importScripts('./precache-manifest.js') at load;
  // stub it like the vite-emitted manifest would (seeds self.__PRECACHE).
  const importScripts = () => { fakeSelf.__PRECACHE = []; };
  vm.runInNewContext(src, { self: fakeSelf, URL, importScripts }, { filename: 'sw.js' });
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

test('sw: manifest-driven precache wiring', () => {
  const swSource = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  assert.ok(swSource.includes("importScripts('./precache-manifest.js')"), 'should load the vite-emitted precache manifest');
  assert.ok(swSource.includes('self.__PRECACHE'), 'install handler should precache the manifest list');
});

test('sw: CDN_CACHE is separate from core cache', () => {
  const swSource = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  assert.ok(swSource.includes("'iq-cdn-v1'"), 'should have CDN cache name');
  assert.ok(swSource.includes('CDN_CACHE'), 'should use CDN_CACHE variable');
});

test('sw: offline.html exists', () => {
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'offline.html')), 'offline.html should exist');
});

test('sw: CACHE_NAME tracks the precache manifest', () => {
  const swSource = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  assert.ok(swSource.includes('iq-cache-manifest'), 'CACHE_NAME should be iq-cache-manifest');
});

test('sw: install handler precaches the manifest list', () => {
  const swSource = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  assert.ok(swSource.includes('c.addAll(self.__PRECACHE)'), 'install handler must addAll self.__PRECACHE');
});

test('sw: manifest revision present for cache invalidation', () => {
  const swSource = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  assert.ok(swSource.includes('MANIFEST_REV'), 'sw.js must carry MANIFEST_REV (bump it whenever precache-manifest.js changes)');
});
