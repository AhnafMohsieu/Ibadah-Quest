'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function loadMods(files, globals) {
  const sandbox = Object.assign({
    window: {},
    console,
    Math, Date, Number, String, Boolean, Array, Object, JSON, RegExp, Error, Promise, Set,
    setTimeout, clearTimeout,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    navigator: {},
    iqIcon: (k) => '[' + k + ']'
  }, globals || {});
  sandbox.window.escapeHTML = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  sandbox.escapeHTML = sandbox.window.escapeHTML;
  sandbox.global = sandbox;
  for (const rel of files) {
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    vm.runInNewContext(code, sandbox, { filename: rel });
    for (const k of Object.keys(sandbox.window)) sandbox[k] = sandbox.window[k];
  }
  return sandbox;
}

test('dhikr tap XP caps at 100/day while continuing counter & cycle tracking honestly', () => {
  const S = {
    lv: 1, xp: 0, dhikrCounters: { _active: 0, 0: 0 },
    dhikrSessions: [], dhikrStats: { total: {}, daily: {}, streak: 0, bestStreak: 0, lastSessionDate: null, badges: [], achievements: [] },
    dhikrSettings: {}, dhikrTapXpDay: { date: '2026-11-26', xp: 99, cycles: 0 }
  };
  const sb = loadMods(['core/xp.js', 'core/dhikr.js'], {
    S,
    DHIKR_COUNTER_DATA: [{ arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'SubhanAllah', english: 'Glory', target: 200, color: '#07635d' }],
    DHIKR_BADGES: [],
    today: () => '2026-11-26',
    yesterdayKey: () => '2026-11-25',
    lvFrom: () => 1,
    lvTitle: () => 'Seeker',
    saveState: () => {},
    renderDhikrCounter: () => {},
    toast: () => {}
  });
  sb.tapDhikr(); // 100th XP
  assert.strictEqual(S.xp, 1);
  sb.tapDhikr(); // over cap: count still increments, XP stops inflating
  assert.strictEqual(S.xp, 1);
  assert.strictEqual(S.dhikrCounters[0], 2);
});

test('mid-day prayer progress preserves yesterday unbroken streak instead of dropping to 0 at Fajr', () => {
  const todayStr = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
  const yStr = (() => { const d = new Date(Date.now() - 86400000); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
  const y2Str = (() => { const d = new Date(Date.now() - 2 * 86400000); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
  const full = { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true };
  const S = {
    tp: 11, xp: 500, lv: 2, cs: 0, bs: 2, pd: 2, lad: todayStr,
    td: {}, vc: {}, tj: 0,
    log: {
      [y2Str]: { p: full },
      [yStr]: { p: full },
      [todayStr]: { p: { fajr: true } }
    }
  };
  const sb = loadMods(['core/xp.js', 'core/prayers.js'], {
    S,
    tlog: () => S.log[todayStr],
    PRAYERS: [{ id: 'fajr', xp: 50 }],
    VOLUNTARY: [], DEEDS: [],
    today: (d) => { const x = d || new Date(); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); },
    isFri: () => false,
    lvFrom: () => 2,
    saveState: () => {},
    renderDynamic: () => {}, markDirty: () => {}, clearDirty: () => {}, checkQ: () => {}, checkA: () => {}
  });
  sb.recalc();
  assert.strictEqual(S.cs, 2, 'Ongoing 2-day streak remains protected mid-day before Isha');
});

test('Day-0 fresh account never triggers empty all-zeros Daily Summary modal', () => {
  let opened = 0;
  const S = {
    xp: 0, lv: 1, cs: 0,
    log: {},
    dhikrStats: { daily: {} },
    dailySummaryShown: ''
  };
  const sb = loadMods(['features/daily-summary.js'], {
    S,
    PRAYERS: [{ id: 'fajr' }, { id: 'dhuhr' }, { id: 'asr' }, { id: 'maghrib' }, { id: 'isha' }],
    today: () => '2026-11-26',
    saveState: () => {},
    document: { getElementById: () => ({ innerHTML: '', style: {}, classList: { add() { opened++; } } }) }
  });
  assert.strictEqual(sb.shouldShowDailySummary(), false);
  sb.showDailySummary(() => {});
  assert.strictEqual(opened, 0);
});

test('Quiet hours helper blocks notifications between 22:30 and 04:30 unless bypassed', () => {
  const S = {
    notificationsEnabled: true,
    notificationSettings: { quietEnabled: true, quietStart: '22:30', quietEnd: '04:30', dailyCap: 6, sentLog: {} }
  };
  const sb = loadMods(['features/notifications.js'], { S, Notification: { permission: 'granted' }, document: { readyState: 'complete', addEventListener() {} } });
  assert.strictEqual(sb._isQuietHour('23:15'), true);
  assert.strictEqual(sb._isQuietHour('02:00'), true);
  assert.strictEqual(sb._isQuietHour('12:30'), false);
});

test('Hadith renderer HTML-escapes untrusted Arabic and translation fields safely', () => {
  const hadithArea = { innerHTML: '' };
  const S = { xp: 0, lv: 1, cs: 0, td: {}, ua: {}, activeTitle: null, notificationsEnabled: false };
  const sb = loadMods(['core/dynamic.js'], {
    S,
    QURAN_SURAHS: [], QURAN_JUZ: [], SHOP: [], ACHS: [], PRAYERS: [], VOLUNTARY: [], DEEDS: [], DQ: [], WQ: [], MQ: [], YQ: [], LQ: [],
    currentUser: 'default',
    HadithLibrary: { REMOTE_COLLECTIONS: [] },
    HADITH_COLLECTIONS_DATA: [{
      id: 'testcol', name: 'Test Col', desc: 'Safe desc', icon: 'book',
      books: [{ id: 1, name: 'Book 1', hadiths: [{ n: 1, b: 1, h: 1, a: '<script>evilA()</script>', t: '<img src=x onerror=evilT()>' }] }]
    }],
    HADITH_COLLECTIONS: [{
      id: 'testcol', name: 'Test Col', desc: 'Safe desc', icon: 'book',
      books: [{ id: 1, name: 'Book 1', hadiths: [{ n: 1, b: 1, h: 1, a: '<script>evilA()</script>', t: '<img src=x onerror=evilT()>' }] }]
    }],
    lvTitle: () => 'Seeker',
    document: { getElementById: (id) => (id === 'hadithArea' ? hadithArea : null), querySelectorAll: () => [] }
  });
  sb.openHadithCollection('testcol');
  sb.openHadithBook('testcol', 1);
  assert.ok(!hadithArea.innerHTML.includes('<script>evilA()</script>'));
  assert.ok(!hadithArea.innerHTML.includes('<img src=x onerror=evilT()>'));
  assert.ok(hadithArea.innerHTML.includes('&lt;script&gt;evilA()&lt;/script&gt;'));
});

test('normalizeState migrates legacy v1 user saves cleanly without overwriting progress', () => {
  const sb = loadMods(['core/state.js'], { document: {} });
  const legacySave = { xp: 450, cs: 9, tp: 45, lang: 'en', log: { '2026-01-01': { p: { fajr: true } } } };
  const migrated = sb.normalizeState(legacySave);
  assert.strictEqual(migrated.xp, 450);
  assert.strictEqual(migrated.cs, 9);
  assert.strictEqual(migrated.theme, 'light');
  assert.strictEqual(migrated.soundEnabled, false);
  assert.strictEqual(migrated.hijriOffset, 0);
  assert.strictEqual(migrated.quranScript, 'uthmani');
  assert.ok(migrated.khatamGoal && migrated.khatamGoal.targetDays === 30);
});
