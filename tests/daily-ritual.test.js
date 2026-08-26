'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

test('showDailyRitual shows modal without setting lastDailyRitual', () => {
  const S = {
    dailyRatings: {},
    dailyReflections: {},
    lastDailyRitual: null,
    log: { '2026-08-11': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } } },
    xp: 500,
    dq: [{ done: true }]
  };
  const ov = { innerHTML: '', style: {}, classList: { add: () => {} } };
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-ritual.js'), {
    S,
    today: () => '2026-08-11',
    saveState: () => {},
    openToastModal: function(html) {
      ov.innerHTML = html;
      ov.style.display = 'flex';
      ov.classList.add('show');
      ov.style.pointerEvents = 'auto';
      return ov;
    },
    document: { getElementById: () => ov }
  });

  sandbox.window.showDailyRitual();
  assert.strictEqual(S.lastDailyRitual, null);
  assert.ok(ov.innerHTML.length > 0);
});

test('showDailyRitual does not show again on same day', () => {
  const S = {
    dailyRatings: {},
    dailyReflections: {},
    lastDailyRitual: '2026-08-11',
    log: { '2026-08-11': { p: {} } },
    xp: 100,
    dq: []
  };
  const ov = { innerHTML: 'original', style: {}, classList: { add: () => {} } };
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-ritual.js'), {
    S,
    today: () => '2026-08-11',
    saveState: () => {},
    openToastModal: function(html) {
      ov.innerHTML = html;
      ov.style.display = 'flex';
      ov.classList.add('show');
      ov.style.pointerEvents = 'auto';
      return ov;
    },
    document: { getElementById: () => ov }
  });

  sandbox.window.showDailyRitual();
  assert.strictEqual(ov.innerHTML, 'original');
});

test('saveDailyRitual saves rating and reflection', () => {
  const S = {
    dailyRatings: {},
    dailyReflections: {},
    lastDailyRitual: null
  };
  const field = { value: 'Alhamdulillah for a productive day', style: {}, classList: { add: () => {}, remove: () => {} } };
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-ritual.js'), {
    S,
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {},
    closeToastOverlay: function() {
      field.classList.remove('show');
      field.style.display = 'none';
      field.innerHTML = '';
      field.style.pointerEvents = 'none';
    },
    document: { getElementById: () => field }
  });

  sandbox.window.saveDailyRitual(4, 'Alhamdulillah for a productive day');
  assert.strictEqual(S.dailyRatings['2026-08-11'], 4);
  assert.strictEqual(S.dailyReflections['2026-08-11'], 'Alhamdulillah for a productive day');
  assert.strictEqual(S.lastDailyRitual, '2026-08-11');
});

test('showDailyRitual displays stats and quote', () => {
  const S = {
    dailyRatings: {},
    dailyReflections: {},
    lastDailyRitual: null,
    log: { '2026-08-11': { p: { fajr: true, dhuhr: true, asr: false, maghrib: true, isha: true } } },
    xp: 500,
    dq: [{ done: true }, { done: false }]
  };
  let capturedHTML = '';
  const ov = {
    style: {},
    classList: { add: () => {} },
    set innerHTML(val) { capturedHTML = val; },
    get innerHTML() { return capturedHTML; }
  };
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-ritual.js'), {
    S,
    today: () => '2026-08-11',
    saveState: () => {},
    openToastModal: function(html) {
      ov.innerHTML = html;
      ov.style.display = 'flex';
      ov.classList.add('show');
      ov.style.pointerEvents = 'auto';
      return ov;
    },
    document: { getElementById: () => ov }
  });

  sandbox.window.showDailyRitual();
  assert.ok(capturedHTML.includes('4/5 prayers'));
  assert.ok(capturedHTML.includes('500 XP'));
  assert.ok(capturedHTML.includes('1 quests'));
  assert.ok(capturedHTML.includes('dr-star'));
  assert.ok(capturedHTML.includes('dr-textarea'));
});

test('saveDailyRitual closes overlay', () => {
  const S = {
    dailyRatings: {},
    dailyReflections: {},
    lastDailyRitual: null
  };
  let classRemoved = false;
  const ov = {
    style: { display: 'flex' },
    classList: {
      add: () => {},
      remove: (cls) => { if (cls === 'show') classRemoved = true; }
    },
    innerHTML: 'content'
  };
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-ritual.js'), {
    S,
    today: () => '2026-08-11',
    saveState: () => {},
    toast: () => {},
    closeToastOverlay: function() {
      ov.classList.remove('show');
      ov.style.display = 'none';
      ov.innerHTML = '';
      ov.style.pointerEvents = 'none';
    },
    document: { getElementById: () => ov }
  });

  sandbox.window.saveDailyRitual(5, 'Great day');
  assert.ok(classRemoved);
});
