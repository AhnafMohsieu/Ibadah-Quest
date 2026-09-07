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
