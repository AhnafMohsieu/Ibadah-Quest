// tests/today-page.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');

test('today renders prayers escaped, toggles persist xp', async () => {
  const { renderToday, togglePrayer } = await import('../src/render/prayers.js');
  const { freshState } = await import('../src/core/state.js');
  const S = freshState('2026-09-07');
  const html = renderToday(S, '2026-09-07');
  assert.match(html, /Fajr/);
  const evil = freshState('2026-09-07');
  evil.log['2026-09-07'].p.note = '<script>alert(1)</script>';
  assert.doesNotMatch(renderToday(evil, '2026-09-07'), /<script>alert/);
  const r = togglePrayer(S, '2026-09-07', 'fajr');
  assert.equal(r.done, true);
  assert.ok(S.xp > 0);
});

test('toggle off removes xp, unknown ids rejected, corrupt shapes guarded', async () => {
  const { togglePrayer, renderToday } = await import('../src/render/prayers.js');
  const { freshState } = await import('../src/core/state.js');
  const S = freshState('2026-09-07');
  togglePrayer(S, '2026-09-07', 'fajr');
  assert.equal(S.xp, 10);
  const off = togglePrayer(S, '2026-09-07', 'fajr');
  assert.equal(off.done, false);
  assert.equal(S.xp, 0);
  const bad = togglePrayer(S, '2026-09-07', 'evil-id');
  assert.equal(bad.done, false);
  assert.equal(S.xp, 0);
  assert.ok(!('evil-id' in S.log['2026-09-07'].p));
  const slim = { xp: 0, lv: 1 };
  const r2 = togglePrayer(slim, '2026-09-07', 'dhuhr');
  assert.equal(r2.done, true);
  assert.ok(slim.log['2026-09-07'].p.dhuhr);
  assert.match(renderToday({ xp: 'x', lv: undefined, log: {} }, '2026-09-07'), /XP: 0 · Level 1/);
});

test('getTodayKey uses local date, not UTC', async () => {
  const { getTodayKey } = await import('../src/core/state.js');
  // 2026-09-07T23:30 at UTC+6 is still 2026-09-07 locally; UTC date differs past midnight.
  const d = new Date(2026, 8, 7, 23, 30, 0);
  const expected = '2026-09-07';
  assert.equal(getTodayKey(d), expected);
  assert.match(getTodayKey(), /^\d{4}-\d{2}-\d{2}$/);
});
