'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

test('daily progress widget returns correct structure', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'widgets', 'daily-progress.js'), {
    S: {
      log: {
        '2026-08-12': { p: { fajr: true, dhuhr: true, asr: false, maghrib: false, isha: false } }
      },
      xp: 350,
      lv: 5,
      cs: 3
    },
    today: () => '2026-08-12'
  });

  const result = sandbox.window.renderDailyProgressWidget();
  assert.strictEqual(result.prayers.fajr, true);
  assert.strictEqual(result.prayers.dhuhr, true);
  assert.strictEqual(result.prayers.asr, false);
  assert.strictEqual(result.prayedCount, 2);
  assert.strictEqual(result.totalPrayers, 5);
  assert.strictEqual(result.xp, 350);
  assert.strictEqual(result.level, 5);
  assert.strictEqual(result.streak, 3);
});

test('daily progress widget handles empty state', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'widgets', 'daily-progress.js'), {
    S: {
      log: {},
      xp: 0,
      lv: 1,
      cs: 0
    },
    today: () => '2026-08-12'
  });

  const result = sandbox.window.renderDailyProgressWidget();
  assert.strictEqual(result.prayedCount, 0);
  assert.strictEqual(result.totalPrayers, 5);
  assert.strictEqual(result.xp, 0);
  assert.strictEqual(result.level, 1);
  assert.strictEqual(result.streak, 0);
});

test('daily progress widget all prayers logged', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'widgets', 'daily-progress.js'), {
    S: {
      log: {
        '2026-08-12': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } }
      },
      xp: 1000,
      lv: 10,
      cs: 7
    },
    today: () => '2026-08-12'
  });

  const result = sandbox.window.renderDailyProgressWidget();
  assert.strictEqual(result.prayedCount, 5);
  assert.deepStrictEqual(Object.values(result.prayers).filter(v => v).length, 5);
});

test('dhikr counter widget returns correct structure', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'widgets', 'dhikr-counter.js'), {
    S: {
      dhikrSessions: [
        { date: '2026-08-11', count: 100 },
        { date: '2026-08-12', count: 50 },
        { date: '2026-08-12', count: 30 }
      ]
    },
    today: () => '2026-08-12'
  });

  const result = sandbox.window.renderDhikrCounterWidget();
  assert.strictEqual(result.todayTotal, 80);
  assert.deepStrictEqual(result.lastSession, { date: '2026-08-12', count: 30 });
});

test('dhikr counter widget handles empty state', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'widgets', 'dhikr-counter.js'), {
    S: {
      dhikrSessions: []
    },
    today: () => '2026-08-12'
  });

  const result = sandbox.window.renderDhikrCounterWidget();
  assert.strictEqual(result.todayTotal, 0);
  assert.strictEqual(result.lastSession, null);
});

test('dhikr counter widget no sessions today', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'widgets', 'dhikr-counter.js'), {
    S: {
      dhikrSessions: [
        { date: '2026-08-11', count: 100 }
      ]
    },
    today: () => '2026-08-12'
  });

  const result = sandbox.window.renderDhikrCounterWidget();
  assert.strictEqual(result.todayTotal, 0);
  assert.deepStrictEqual(result.lastSession, { date: '2026-08-11', count: 100 });
});

test('streak calendar widget returns correct structure', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'widgets', 'streak-calendar.js'), {
    S: {
      log: {
        '2026-08-01': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } },
        '2026-08-02': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } },
        '2026-08-03': { p: { fajr: true, dhuhr: false, asr: false, maghrib: false, isha: false } }
      },
      cs: 2,
      bs: 5
    },
    today: function(d) {
      var d2 = d || new Date();
      return d2.getFullYear() + '-' + (d2.getMonth()+1).toString().padStart(2,'0') + '-' + d2.getDate().toString().padStart(2,'0');
    }
  });

  const result = sandbox.window.renderStreakCalendarWidget();
  assert.strictEqual(result.month, 'August');
  assert.strictEqual(result.year, 2026);
  assert.strictEqual(result.currentStreak, 2);
  assert.strictEqual(result.bestStreak, 5);
  assert.ok(Array.isArray(result.streakDays));
  assert.strictEqual(result.streakDays.length, 31);
  assert.strictEqual(result.streakDays[0].completed, true);
  assert.strictEqual(result.streakDays[1].completed, true);
  assert.strictEqual(result.streakDays[2].completed, false);
});

test('streak calendar widget handles empty state', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'widgets', 'streak-calendar.js'), {
    S: {
      log: {},
      cs: 0,
      bs: 0
    },
    today: function(d) {
      var d2 = d || new Date();
      return d2.getFullYear() + '-' + (d2.getMonth()+1).toString().padStart(2,'0') + '-' + d2.getDate().toString().padStart(2,'0');
    }
  });

  const result = sandbox.window.renderStreakCalendarWidget();
  assert.strictEqual(result.currentStreak, 0);
  assert.strictEqual(result.bestStreak, 0);
  assert.ok(result.streakDays.every(d => d.completed === false));
});

test('streak calendar widget marks partial days as incomplete', () => {
  const sandbox = loadFile(path.join(__dirname, '..', 'widgets', 'streak-calendar.js'), {
    S: {
      log: {
        '2026-08-05': { p: { fajr: true, dhuhr: true } }
      },
      cs: 1,
      bs: 1
    },
    today: function(d) {
      var d2 = d || new Date();
      return d2.getFullYear() + '-' + (d2.getMonth()+1).toString().padStart(2,'0') + '-' + d2.getDate().toString().padStart(2,'0');
    }
  });

  const result = sandbox.window.renderStreakCalendarWidget();
  const day5 = result.streakDays.find(d => d.day === 5);
  assert.strictEqual(day5.completed, false);
});
