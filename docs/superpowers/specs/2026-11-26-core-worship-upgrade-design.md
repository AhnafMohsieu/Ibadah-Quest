# Sub-project 2: Core Worship Experience Upgrade — Design Spec

**Date:** 2026-11-26
**Status:** Executing (user approved all 3 improvement sub-projects)
**Track:** Legacy SPA (`core/render-prayers.js`, `core/dynamic.js`, `features/iq-shell.js`, `styles/main.css`, `index.html`, `sw.js`); `src/` MPA parity lands in Sub-project 3.

---

## 1. Goals

Deepen day-to-day worship utility without adding external dependencies or breaking existing state schemas:

1. **Live Next-Prayer Visibility & Configurable Location/Method (`core/render-prayers.js`):**
   - Extract shared `computeNextPrayer(times, now)` used identically by `renderTimer()`, `renderPrayerTimes()`, `#prayerArea` header pill, `#iqHeroChallenge`, and `#iqChallengeSheet`.
   - Surface city presets + Aladhan calculation method selector (`updatePrayerSettings`) inside `renderPrayerTimes()` alongside GPS detection so desktop/laptop users without geolocation can configure local prayer times in one click.
2. **True Daily Quran Reading Log & Quick Actions (`features/iq-shell.js`, `core/dynamic.js`):**
   - Track daily Quran reading minutes in `S.log[dateKey].q` via `window.logQuranMinutes(mins)` (with capped daily XP `grantDailyXp(10, 'quran_read|' + dk)` and haptic feedback).
   - Expose `+5m Read` inside the Quran Surah/Juz header (`core/dynamic.js`) and inside `#iqChallengeSheet` (`features/iq-shell.js`) so daily Quran goal progress reflects real daily reading.
3. **Interactive Focus Sheet & Goal Targets Customization (`features/iq-shell.js`, `styles/main.css`):**
   - Display next-prayer countdown/time context, quick 5-prayer completion pills, `+5m Read` Quran action, and an inline **Daily Targets** form (`updateDailyChallengeGoals`) inside `#iqChallengeSheet` to customize `S.dailyChallengeGoals.dhikr` and `S.dailyChallengeGoals.quranMinutes` live.

---

## 2. State & Compatibility

- Uses existing `freshState()` top-level keys (`S.prayerSettings`, `S.dailyChallengeGoals`, `S.log[dateKey]`) — zero new top-level keys needed.
- Clamps `dailyChallengeGoals.dhikr` (`33..5000`) and `dailyChallengeGoals.quranMinutes` (`5..180`); clamps `logQuranMinutes` (`1..240` per increment).
- Escapes all user-visible labels (`safePrayerText` / `esc`), maintains CSP rules cleanly, and bumps asset `?v=` tags + `sw.js` `MANIFEST_REV`.
