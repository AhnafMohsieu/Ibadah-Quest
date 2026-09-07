// src/core/xp.js
// Verbatim port of xpFor/lvFrom from state/state.js (same formula, same boundaries).
export function xpFor(lv) { if (lv <= 1) return 0; return Math.floor(100 * Math.pow(lv, 1.5)); }
export function lvFrom(xp) { let lv = 1; while (xp >= xpFor(lv + 1)) lv++; return lv; }

export function applyXpDelta(S, delta, opts) {
  const oldLv = S.lv;
  S.xp += delta;
  S.lv = lvFrom(S.xp);
  void opts;
  return { oldLv, newLv: S.lv, leveledUp: S.lv > oldLv };
}

export function spendXp(S, amount, opts) {
  const clamped = Math.max(0, S.xp - amount);
  const delta = clamped - S.xp;
  return applyXpDelta(S, delta, opts);
}
