'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadFile } = require('./helpers/load.js');

const ROOT = path.join(__dirname, '..');

function makeEl() {
  return {
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    classList: {
      _set: new Set(),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      toggle(c, f) { if (f === undefined) { if (this._set.has(c)) this._set.delete(c); else this._set.add(c); } else if (f) this._set.add(c); else this._set.delete(c); },
      contains(c) { return this._set.has(c); }
    },
    setAttribute() {},
    removeAttribute() {},
    addEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => []
  };
}

function setupMasjid(initialCheckIns) {
  const els = {
    iqMasjidSheet: makeEl(),
    iqMasjidBody: makeEl(),
    iqFeedArea: makeEl()
  };
  let saved = 0;
  let xpGranted = [];
  let toasts = [];
  const state = {
    xp: 0,
    lv: 1,
    xpDaily: {},
    masjidCheckIns: initialCheckIns || []
  };
  const sb = loadFile(path.join(ROOT, 'features', 'masjid-checkins.js'), {
    S: state,
    window: {
      escapeHTML: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
      renderIqFeed: () => {}
    },
    document: {
      getElementById: (id) => els[id] || null,
      body: makeEl(),
      addEventListener: () => {}
    },
    today: () => '2026-11-25',
    iqIcon: (k) => '[' + k + ']',
    saveState: () => { saved++; },
    grantDailyXp: (amt, key) => { xpGranted.push({ amt, key }); state.xp += amt; return true; },
    toast: (icon, msg) => { toasts.push(msg); },
    renderTopBar: () => {},
    renderLv: () => {}
  });
  return { sb, state, els, getSaved: () => saved, xpGranted, toasts };
}

test('logMasjidCheckIn records valid mosque visit and awards capped daily XP', () => {
  const { sb, state, getSaved, xpGranted } = setupMasjid();
  const res = sb.window.logMasjidCheckIn({
    name: 'Masjid Al-Noor',
    city: 'Dhaka',
    region: 'south_asia',
    prayer: 'fajr'
  });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(state.masjidCheckIns.length, 1);
  assert.strictEqual(state.masjidCheckIns[0].name, 'Masjid Al-Noor');
  assert.strictEqual(state.masjidCheckIns[0].region, 'south_asia');
  assert.strictEqual(state.masjidCheckIns[0].prayer, 'fajr');
  assert.strictEqual(getSaved(), 1);
  assert.deepStrictEqual(xpGranted, [{ amt: 15, key: 'masjid|2026-11-25|fajr' }]);
});

test('logMasjidCheckIn rejects blank mosque names without mutating state', () => {
  const { sb, state, getSaved } = setupMasjid();
  const res = sb.window.logMasjidCheckIn({ name: '   ', city: 'Dhaka', region: 'south_asia', prayer: 'dhuhr' });
  assert.strictEqual(res.ok, false);
  assert.strictEqual(state.masjidCheckIns.length, 0);
  assert.strictEqual(getSaved(), 0);
});

test('renderMasjidSheet escapes XSS payloads in mosque and city fields', () => {
  const { sb, els } = setupMasjid([
    { id: 'm1', name: '<script>alert(1)</script>Masjid', city: '<img src=x onerror=alert(2)>', region: 'mena', prayer: 'maghrib', date: '2026-11-25', ts: 1700000000000 }
  ]);
  sb.window.openMasjidCheckins('history');
  const html = els.iqMasjidBody.innerHTML;
  assert.ok(!html.includes('<script>alert(1)</script>'), 'script tag must be escaped');
  assert.ok(!html.includes('<img src=x onerror=alert(2)>'), 'img handler must be escaped');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'escaped script text must render safely');
});

test('computeMasjidStats aggregates total visits, unique mosques, and region counts', () => {
  const { sb } = setupMasjid([
    { id: '1', name: 'Central Masjid', city: 'London', region: 'europe', prayer: 'fajr', date: '2026-11-25', ts: 10 },
    { id: '2', name: 'Central Masjid', city: 'London', region: 'europe', prayer: 'isha', date: '2026-11-25', ts: 20 },
    { id: '3', name: 'Baitul Mukarram', city: 'Dhaka', region: 'south_asia', prayer: 'dhuhr', date: '2026-11-24', ts: 30 }
  ]);
  const stats = sb.window.computeMasjidStats();
  assert.strictEqual(stats.total, 3);
  assert.strictEqual(stats.todayCount, 2);
  assert.strictEqual(stats.uniqueMosques, 2);
  assert.strictEqual(stats.byRegion.europe, 2);
  assert.strictEqual(stats.byRegion.south_asia, 1);
});

test('renderMasjidSheet uses iq-mc-workspace and Title Case headings while managing inert state', () => {
  const { sb, els } = setupMasjid();
  sb.window.renderMasjidSheet('map');
  assert.ok(els.iqMasjidBody.innerHTML.includes('class="iq-mc-workspace"'), 'map view must wrap visual + form in iq-mc-workspace');
  assert.ok(els.iqMasjidBody.innerHTML.includes('Check-in History'), 'history label must use Check-in History');
  assert.ok(!els.iqMasjidBody.innerHTML.includes('>masjid check-ins<'), 'lowercase masjid check-ins must be removed');

  sb.window.openMasjidCheckins('map');
  assert.strictEqual(els.iqMasjidSheet.inert, false, 'open masjid sheet clears inert');
  sb.window.closeMasjidCheckins();
  assert.strictEqual(els.iqMasjidSheet.inert, true, 'closed masjid sheet sets inert');
  assert.ok(els.iqMasjidBody.innerHTML.includes('iq-empty-svg'), 'empty history uses geometric SVG illustration');
});
