// src/render/prayers.js
import { applyXpDelta } from '../core/xp.js';

export function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function renderToday(S, dayKey) {
  const day = (S.log && S.log[dayKey]) || { p: {} };
  const items = PRAYERS.map((id) => {
    const done = Boolean(day.p && day.p[id]);
    const label = id.charAt(0).toUpperCase() + id.slice(1);
    return `<button data-prayer="${id}" aria-pressed="${done}">${escapeHTML(label)}${done ? ' ✓' : ''}</button>`;
  }).join('');
  const note = day.p && day.p.note ? `<p>${escapeHTML(day.p.note)}</p>` : '';
  return `<section><h2>Today</h2><div>${items}</div>${note}<p>XP: ${S.xp} · Level ${S.lv}</p></section>`;
}

export function togglePrayer(S, dayKey, id) {
  if (!S.log[dayKey]) S.log[dayKey] = { p: {}, d: {}, v: {} };
  const day = S.log[dayKey];
  const done = !day.p[id];
  if (done) { day.p[id] = true; applyXpDelta(S, 10, { skipLevelToast: true }); }
  else { delete day.p[id]; applyXpDelta(S, -10, { skipLevelToast: true }); }
  return { done };
}
