'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
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
    addEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => []
  };
}

function setupShell() {
  const els = {
    iqFeedArea: makeEl(),
    iqHeroChallenge: makeEl(),
    iqDrawer: makeEl(),
    iqDrawerBackdrop: makeEl(),
    iqDrawerCatBar: makeEl(),
    iqDrawerTabs: makeEl(),
    iqDrawerSearch: makeEl(),
    iqDrawerSearchClear: makeEl(),
    iqNotifDrawer: makeEl(),
    iqChallengeSheet: makeEl(),
    iqChallengeBody: makeEl(),
    iqMasjidSheet: makeEl()
  };
  const body = makeEl();
  const state = {
    xp: 250,
    lv: 2,
    cs: 3,
    lastCat: 'ibadah',
    lastSub: 'today',
    log: {
      '2026-11-25': {
        p: { fajr: true, dhuhr: true, asr: true },
        v: { tahajjud: true },
        d: { smile: true, charity_daily: true }
      }
    },
    dhikrStats: { daily: { '2026-11-25': { 0: 120, 1: 130 } } },
    quranIdx: [1, 2, 3, 4],
    dq: [{ id: 'q1', done: true }, { id: 'q2', done: false }],
    masjidCheckIns: [{ id: 'm1', name: 'Masjid Noor', date: '2026-11-25', region: 'mena', prayer: 'fajr', ts: 1 }],
    dailyChallengeGoals: { dhikr: 500, quranMinutes: 20, prayers: 5 }
  };
  const sb = loadFile(path.join(ROOT, 'features', 'iq-shell.js'), {
    S: state,
    PRAYERS: [{ id: 'fajr' }, { id: 'dhuhr' }, { id: 'asr' }, { id: 'maghrib' }, { id: 'isha' }],
    VOLUNTARY: [{ id: 'tahajjud', name: 'Tahajjud' }, { id: 'duha', name: 'Duha' }],
    DEEDS: [{ id: 'smile', name: 'Smile' }, { id: 'charity_daily', name: 'Charity' }, { id: 'visit_sick', name: 'Visit' }],
    TAB_GROUPS: {
      ibadah: [
        { id: 'tracking', label: 'Daily Tracking', tabs: [{ id: 'today', label: 'Today', icon: 'today' }, { id: 'dhikr', label: 'Dhikr', icon: 'dhikr' }] }
      ],
      knowledge: [
        { id: 'quran_hadith', label: "Qur'an & Hadith", grid: true, tabs: [{ id: 'quran', label: "Qur'an", icon: 'quran', desc: 'Surah library' }, { id: 'hadith', label: 'Hadith', icon: 'hadith' }] }
      ],
      names_main: [
        { id: 'names_grp', label: 'Names', tabs: [{ id: 'allah_names', label: '99 Names', icon: 'allah_names' }] }
      ],
      library: [
        { id: 'history', label: 'History', tabs: [{ id: 'prophets', label: 'Prophets', icon: 'prophets' }] }
      ],
      profile_main: [
        { id: 'profile_hub', label: 'Account', tabs: [{ id: 'profile', label: 'Profile', icon: 'profile' }] }
      ]
    },
    today: () => '2026-11-25',
    iqIcon: (k) => '[' + k + ']',
    window: {
      escapeHTML: (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
    },
    document: {
      body,
      getElementById: (id) => els[id] || null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    }
  });
  return { sb, els, body, state };
}

test('computeDailyChallenges calculates accurate counts and clamped percentages', () => {
  const { sb, state } = setupShell();
  const summary = sb.window.computeDailyChallenges(state, '2026-11-25');
  assert.strictEqual(summary.prayersDone, 3);
  assert.strictEqual(summary.prayersTotal, 5);
  assert.strictEqual(summary.dhikrToday, 250);
  assert.strictEqual(summary.dhikrGoal, 500);
  assert.strictEqual(summary.dhikrPct, 50);
  assert.strictEqual(summary.volDone, 1);
  assert.strictEqual(summary.deedsDone, 2);
  assert.strictEqual(summary.masjidTotal, 1);
  assert.strictEqual(summary.masjidToday, 1);
});

test('openIqDrawer and closeIqDrawer toggle drawer state cleanly', () => {
  const { sb, els, body } = setupShell();
  sb.window.openIqDrawer();
  assert.strictEqual(els.iqDrawer.classList.contains('open'), true);
  assert.strictEqual(body.classList.contains('iq-drawer-open'), true);
  sb.window.closeIqDrawer();
  assert.strictEqual(els.iqDrawer.classList.contains('open'), false);
  assert.strictEqual(body.classList.contains('iq-drawer-open'), false);
});

test('openChallengeDetail renders circular progress ring sheet and closeActiveSheet dismisses it', () => {
  const { sb, els } = setupShell();
  sb.window.openChallengeDetail('dhikr');
  assert.strictEqual(els.iqChallengeSheet.classList.contains('open'), true);
  assert.ok(els.iqChallengeBody.innerHTML.includes('<svg'), 'detail sheet must render SVG progress ring');
  assert.ok(els.iqChallengeBody.innerHTML.includes('250'), 'detail sheet must show today dhikr progress');
  sb.window.closeActiveSheet();
  assert.strictEqual(els.iqChallengeSheet.classList.contains('open'), false);
});

test('3-dot drawer renders all 5 TAB_GROUPS categories lazily on open and switches category tabs', () => {
  const { sb, els } = setupShell();
  assert.strictEqual(els.iqDrawerCatBar.innerHTML, '', 'drawer tabs must not build DOM before drawer opens');
  sb.window.openIqDrawer();
  assert.ok(els.iqDrawerCatBar.innerHTML.includes('Daily'), 'drawer must list Daily category');
  assert.ok(els.iqDrawerCatBar.innerHTML.includes('Knowledge'), 'drawer must list Knowledge category');
  assert.ok(els.iqDrawerCatBar.innerHTML.includes('Names'), 'drawer must list Names category');
  assert.ok(els.iqDrawerCatBar.innerHTML.includes('Library'), 'drawer must list Library category');
  assert.ok(els.iqDrawerCatBar.innerHTML.includes('Profile'), 'drawer must list Profile category');
  assert.ok(els.iqDrawerTabs.innerHTML.includes("data-tab=\"today\""), 'initial drawer view shows Daily subtabs');
  sb.window.selectDrawerCategory('knowledge');
  assert.ok(els.iqDrawerTabs.innerHTML.includes("data-tab=\"quran\""), 'switching category renders Knowledge subtabs');
});

test('3-dot drawer search filters across categories and escapes HTML safely', () => {
  const { sb, els } = setupShell();
  sb.window.openIqDrawer();
  sb.window.filterDrawerTabs('quran');
  assert.ok(els.iqDrawerTabs.innerHTML.includes("data-tab=\"quran\""), 'search must match quran tab');
  assert.ok(!els.iqDrawerTabs.innerHTML.includes("data-tab=\"dhikr\""), 'search must exclude unmatched tabs');
  sb.window.filterDrawerTabs('<img src=x onerror=alert(1)>');
  assert.ok(!els.iqDrawerTabs.innerHTML.includes('<img'), 'malicious search input must be escaped via escapeHTML');
});
