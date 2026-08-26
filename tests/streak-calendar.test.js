'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function makeStreakSandbox(log, cs, bs, todayStr) {
  return loadFile(path.join(__dirname, '..', 'widgets', 'streak-calendar.js'), {
    S: { log, cs: cs || 0, bs: bs || 0 },
    today: (d) => {
      if (d) return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
      return todayStr || '2026-08-11';
    }
  });
}

test('renderStreakCalendarWidget returns current month name and year', () => {
  const sb = makeStreakSandbox({}, 0, 0, '2026-08-11');
  const result = sb.window.renderStreakCalendarWidget();
  assert.strictEqual(result.month, 'August');
  assert.strictEqual(result.year, 2026);
});

test('renderStreakCalendarWidget returns streakDays array with correct length for month', () => {
  const sb = makeStreakSandbox({}, 0, 0, '2026-08-11');
  const result = sb.window.renderStreakCalendarWidget();
  assert.strictEqual(result.streakDays.length, 31);
});

test('renderStreakCalendarWidget marks days with 5+ prayers as completed', () => {
  const log = {
    '2026-08-10': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } },
    '2026-08-11': { p: { fajr: true, dhuhr: true, asr: false, maghrib: true, isha: true } }
  };
  const sb = makeStreakSandbox(log, 3, 5, '2026-08-11');
  const result = sb.window.renderStreakCalendarWidget();
  const aug10 = result.streakDays.find(d => d.date === '2026-08-10');
  const aug11 = result.streakDays.find(d => d.date === '2026-08-11');
  assert.strictEqual(aug10.completed, true);
  assert.strictEqual(aug11.completed, false);
});

test('renderStreakCalendarWidget marks days with fewer than 5 prayers as not completed', () => {
  const log = {
    '2026-08-11': { p: { fajr: true, dhuhr: false, asr: false, maghrib: false, isha: false } }
  };
  const sb = makeStreakSandbox(log, 0, 0, '2026-08-11');
  const result = sb.window.renderStreakCalendarWidget();
  const aug11 = result.streakDays.find(d => d.date === '2026-08-11');
  assert.strictEqual(aug11.completed, false);
});

test('renderStreakCalendarWidget marks days with no log as not completed', () => {
  const sb = makeStreakSandbox({}, 0, 0, '2026-08-11');
  const result = sb.window.renderStreakCalendarWidget();
  const aug11 = result.streakDays.find(d => d.date === '2026-08-11');
  assert.strictEqual(aug11.completed, false);
});

test('renderStreakCalendarWidget includes current and best streak from state', () => {
  const sb = makeStreakSandbox({}, 7, 14, '2026-08-11');
  const result = sb.window.renderStreakCalendarWidget();
  assert.strictEqual(result.currentStreak, 7);
  assert.strictEqual(result.bestStreak, 14);
});

test('renderStreakCalendarWidget defaults streak to 0 when cs/bs missing', () => {
  const sb = makeStreakSandbox({}, 0, 0, '2026-08-11');
  const result = sb.window.renderStreakCalendarWidget();
  assert.strictEqual(result.currentStreak, 0);
  assert.strictEqual(result.bestStreak, 0);
});

test('renderStreakCalendarWidget each streakDay has day number and date string', () => {
  const sb = makeStreakSandbox({}, 0, 0, '2026-08-11');
  const result = sb.window.renderStreakCalendarWidget();
  for (let i = 0; i < result.streakDays.length; i++) {
    const sd = result.streakDays[i];
    assert.strictEqual(sd.day, i + 1);
    assert.ok(sd.date.startsWith('2026-08-'));
    assert.strictEqual(typeof sd.completed, 'boolean');
  }
});

test('renderStreakCalendarWidget handles empty log object', () => {
  const sb = makeStreakSandbox({}, 0, 0, '2026-08-11');
  const result = sb.window.renderStreakCalendarWidget();
  const completed = result.streakDays.filter(d => d.completed);
  assert.strictEqual(completed.length, 0);
});

test('renderStreakCalendarWidget handles log entry with empty prayer object', () => {
  const log = { '2026-08-11': { p: {} } };
  const sb = makeStreakSandbox(log, 0, 0, '2026-08-11');
  const result = sb.window.renderStreakCalendarWidget();
  const aug11 = result.streakDays.find(d => d.date === '2026-08-11');
  assert.strictEqual(aug11.completed, false);
});

test('renderStreakCalendarWidget handles log entry with null prayers', () => {
  const log = { '2026-08-11': { p: null } };
  const sb = makeStreakSandbox(log, 0, 0, '2026-08-11');
  const result = sb.window.renderStreakCalendarWidget();
  const aug11 = result.streakDays.find(d => d.date === '2026-08-11');
  assert.strictEqual(aug11.completed, false);
});

test('renderStreakCalendarWidget for February (28 days in non-leap year)', () => {
  const sb = makeStreakSandbox({}, 0, 0, '2026-02-15');
  const result = sb.window.renderStreakCalendarWidget();
  assert.strictEqual(result.month, 'February');
  assert.strictEqual(result.streakDays.length, 28);
});

test('renderStreakCalendarWidget for February (29 days in leap year)', () => {
  const sb = makeStreakSandbox({}, 0, 0, '2028-02-15');
  const result = sb.window.renderStreakCalendarWidget();
  assert.strictEqual(result.month, 'February');
  assert.strictEqual(result.streakDays.length, 29);
});
