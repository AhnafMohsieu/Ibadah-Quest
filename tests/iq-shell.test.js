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

test('hero summary displays Today\'s Focus without duplicating Daily challenges and overlays toggle inert', () => {
  const { sb, els } = setupShell();
  sb.window.renderIqFeed();
  assert.ok(els.iqHeroChallenge.innerHTML.includes("Today's Focus"), "hero summary must show Today's Focus");
  assert.ok(!els.iqHeroChallenge.innerHTML.includes('Daily challenges'), 'hero summary must not duplicate Daily challenges');

  sb.window.openChallengeDetail('dhikr');
  assert.strictEqual(els.iqChallengeSheet.inert, false, 'open challenge sheet clears inert');
  sb.window.closeChallengeDetail();
  assert.strictEqual(els.iqChallengeSheet.inert, true, 'closed challenge sheet sets inert');

  sb.window.openIqDrawer();
  assert.strictEqual(els.iqDrawer.inert, false, 'open drawer clears inert');
  sb.window.closeIqDrawer();
  assert.strictEqual(els.iqDrawer.inert, true, 'closed drawer sets inert');
});

test('logQuranMinutes records daily S.log[dk].q, grants capped XP, and updates daily Quran goal', () => {
  const els = {
    iqFeedArea: makeEl(), iqHeroChallenge: makeEl(), iqDrawer: makeEl(),
    iqDrawerBackdrop: makeEl(), iqDrawerCatBar: makeEl(), iqDrawerTabs: makeEl(),
    iqDrawerSearch: makeEl(), iqDrawerSearchClear: makeEl(), iqNotifDrawer: makeEl(),
    iqChallengeSheet: makeEl(), iqChallengeBody: makeEl(), iqMasjidSheet: makeEl()
  };
  let saved = 0;
  const xpGrants = [];
  const state = {
    xp: 0, lv: 1, cs: 0, lastCat: 'ibadah', lastSub: 'today',
    log: { '2026-11-26': { p: {}, v: {}, d: {} } },
    dhikrStats: { daily: {} }, quranIdx: [1, 2, 3], dq: [], masjidCheckIns: [],
    dailyChallengeGoals: { dhikr: 500, quranMinutes: 20, prayers: 5 }
  };
  const sb = loadFile(path.join(ROOT, 'features', 'iq-shell.js'), {
    S: state,
    PRAYERS: [{ id: 'fajr', name: 'Fajr' }, { id: 'dhuhr', name: 'Dhuhr' }, { id: 'asr', name: 'Asr' }, { id: 'maghrib', name: 'Maghrib' }, { id: 'isha', name: 'Isha' }],
    today: () => '2026-11-26',
    iqIcon: (k) => '[' + k + ']',
    saveState: () => { saved++; },
    grantDailyXp: (amt, key) => { xpGrants.push({ amt, key }); state.xp += amt; },
    renderTopBar: () => {},
    renderLv: () => {},
    window: { escapeHTML: (v) => String(v == null ? '' : v) },
    document: { body: makeEl(), getElementById: (id) => els[id] || null, querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {} }
  });

  const before = sb.window.computeDailyChallenges(state, '2026-11-26');
  assert.strictEqual(before.quranToday, 0, 'fresh daily log q starts at 0 rather than all-time quranIdx');
  sb.window.logQuranMinutes(5);
  sb.window.logQuranMinutes(10);
  const after = sb.window.computeDailyChallenges(state, '2026-11-26');
  assert.strictEqual(after.quranToday, 15);
  assert.strictEqual(after.quranPct, 75);
  assert.strictEqual(saved, 2);
  assert.deepStrictEqual(xpGrants, [
    { amt: 10, key: 'quran_read|2026-11-26' },
    { amt: 10, key: 'quran_read|2026-11-26' }
  ]);
});

test('updateDailyChallengeGoals clamps inputs, saves, and Challenge Sheet renders quick prayers & goal controls', () => {
  const { sb, els, state } = setupShell();
  let saved = 0;
  sb.saveState = () => { saved++; };
  const goals = sb.window.updateDailyChallengeGoals({ dhikr: 300, quranMinutes: 30 });
  assert.strictEqual(goals.dhikr, 300);
  assert.strictEqual(goals.quranMinutes, 30);
  assert.strictEqual(state.dailyChallengeGoals.dhikr, 300);

  const clamped = sb.window.updateDailyChallengeGoals({ dhikr: 5, quranMinutes: 999 });
  assert.strictEqual(clamped.dhikr, 33, 'dhikr target clamps at minimum 33');
  assert.strictEqual(clamped.quranMinutes, 180, 'quran target clamps at max 180');

  sb.window.openChallengeDetail('dhikr');
  const html = els.iqChallengeBody.innerHTML;
  assert.ok(html.includes('iqGoalDhikrInput') && html.includes('iqGoalQuranInput'), 'challenge sheet must expose customizable goal inputs');
  assert.ok(html.includes("quickChallengeAction('quran5')"), 'challenge sheet must expose +5m Quran quick log');
  assert.ok(html.includes('iq-sheet-prayer-row'), 'challenge sheet must show quick prayer completion pills');
});

test('Phase B: concentric 3-ring SVG, time greeting, and 7-day consistency rhythm strip render cleanly', () => {
  const { sb, els, state } = setupShell();
  state.log['2026-11-24'] = { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } };
  const rhythm = sb.window.computeWeeklyRhythm(state, '2026-11-25');
  assert.strictEqual(rhythm.length, 7, 'rhythm strip returns 7 trailing days');
  assert.strictEqual(rhythm[6].isToday, true);
  assert.strictEqual(rhythm[5].complete, true, '2026-11-24 had all 5 prayers complete');

  const greet = sb.window.getTimeGreeting(new Date(2026, 10, 26, 7, 30, 0));
  assert.ok(greet.includes('Morning'), 'morning greeting matches hour');

  sb.window.renderIqFeed();
  assert.ok(els.iqHeroChallenge.innerHTML.includes('iq-concentric-rings'), 'hero displays concentric 3-ring gauge');
  assert.ok(els.iqHeroChallenge.innerHTML.includes('iq-rhythm-strip'), 'hero displays 7-day rhythm strip');
});
