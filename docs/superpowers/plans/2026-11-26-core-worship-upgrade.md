# Sub-project 2: Core Worship Experience Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver shared next-prayer countdown & configurable city/method prayer settings, daily Quran reading minute tracking with quick-log buttons, and inline focus-sheet prayer toggles & custom daily goal targets.

**Architecture:** Extract pure `computeNextPrayer(times, now)` and `updatePrayerSettings(opts)` into `core/render-prayers.js`; extend `features/iq-shell.js` with `logQuranMinutes(mins)` and `updateDailyChallengeGoals(opts)` plus upgraded Focus Hero & `#iqChallengeSheet` UI; add `+5m Read` pill in `core/dynamic.js` Quran Surah/Juz view; style new pills/controls in `styles/main.css`.

**Tech Stack:** Classic JS IIFEs, `node --test`, Playwright visual & interaction audit.

## Global Constraints

- Do not alter `freshState()` keys in `core/state.js` (`S.prayerSettings`, `S.dailyChallengeGoals`, and `S.log[dk]` are already declared).
- Escape any location label via `escapeHTML` / `safePrayerText`.
- Bump `?v=` pins (`core/render-prayers.js?v=6`, `core/dynamic.js?v=16`, `features/iq-shell.js?v=4`, `styles/main.css?v=51`, `sw.js?v=64`) and `MANIFEST_REV = 24`.

---

### Task 1: Pure `computeNextPrayer`, Next-Prayer Header Pill, & Configurable Location/Method (`core/render-prayers.js`)

**Files:**
- Modify: `core/render-prayers.js:1-15, 196-305`
- Test: `tests/prayers.test.js`

- [ ] **Step 1: Write failing tests in `tests/prayers.test.js`** for `computeNextPrayer`, next-prayer rollover after Isha, and `updatePrayerSettings` validation/persistence.
- [ ] **Step 2: Run `node --test tests/prayers.test.js` and verify RED.**
- [ ] **Step 3: Implement `computeNextPrayer`, `updatePrayerSettings`, location preset + calculation method picker in `renderPrayerTimes()`, and next-prayer pill in `renderPrayers()`.**
- [ ] **Step 4: Run `node --check core/render-prayers.js; node --test tests/prayers.test.js` and verify GREEN.**

---

### Task 2: Daily Quran Minute Tracking, Goal Target Customization & Upgraded Focus Sheet (`features/iq-shell.js`, `core/dynamic.js`, `styles/main.css`)

**Files:**
- Modify: `features/iq-shell.js:42-345`
- Modify: `core/dynamic.js:898-950`
- Modify: `styles/main.css`
- Test: `tests/iq-shell.test.js`

- [ ] **Step 1: Write failing tests in `tests/iq-shell.test.js`** for daily `log[dk].q` tracking via `logQuranMinutes(mins)`, XP grant deduping, `updateDailyChallengeGoals` clamping & persistence, and `#iqChallengeBody` rendering quick prayer pills + goal editor + next-prayer pill.
- [ ] **Step 2: Run `node --test tests/iq-shell.test.js` and verify RED.**
- [ ] **Step 3: Implement `logQuranMinutes`, `updateDailyChallengeGoals`, daily Quran feed metrics, Focus hero next-prayer & Quran chips, `#iqChallengeBody` quick-tap prayer row + `+5m Read` + goal inputs, and Surah/Juz `+5m Read` pill in `core/dynamic.js` + CSS polish in `styles/main.css`.**
- [ ] **Step 4: Run `node --check features/iq-shell.js; node --check core/dynamic.js; node --test tests/iq-shell.test.js` and verify GREEN.**

---

### Task 3: Cache Pins, Structural Tests & Playwright Verification (`index.html`, `sw.js`, `tests/html.test.js`)

**Files:**
- Modify: `index.html`, `sw.js`, `tests/html.test.js`

- [ ] **Step 1: Update version assertions & Sub-project 2 structural pins in `tests/html.test.js` (RED first), run `node --test tests/html.test.js` to confirm RED.**
- [ ] **Step 2: Bump `?v=` pins in `index.html` and `MANIFEST_REV = 24` in `sw.js`.**
- [ ] **Step 3: Run `node core/check-syntax.js`, full `node --test tests/*.test.js`, `graphify.exe update .`, and Playwright desktop/mobile interactive test (`Prayer Times` settings, `+5m Read`, Challenge Sheet goal update & quick prayer toggle) + inspect PNG screenshots.**
