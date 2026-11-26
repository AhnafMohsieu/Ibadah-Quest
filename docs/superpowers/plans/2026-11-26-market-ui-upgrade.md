# Phase B: Market-Grade UI Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a studio-grade UI upgrade incorporating Concentric 3-Ring Hero & 7-Day Rhythm Strip, Pillars-style intelligent prayer cards (live times, Qada mode, Pause streak protection), Tarteel-inspired Quran Sanctuary Toolbar & Tasbeeh Tap Orb, SVG geometric empty states, and `src/` MPA visual alignment.

**Architecture:** Additive upgrades cleanly layered onto `core/prayers.js`, `core/render-prayers.js`, `core/dynamic.js`, `core/static.js`, `core/actions.js`, `features/iq-shell.js`, `features/masjid-checkins.js`, `src/shell/layout.js`, `src/render/prayers.js`, and `styles/main.css`, strictly preserving existing state schemas and unit test contracts.

**Tech Stack:** Vanilla HTML/CSS/SVG/JS, `node --test`, Playwright visual & interaction audit.

## Global Constraints

- Reuse shared SVG builders cleanly (`renderConcentricRingsSvg`, `_renderQuranSanctuaryBar`) — no duplicated ring or toolbar markup.
- Never add ad-hoc top-level keys to `freshState()`; store `paused` inside `S.prayerSettings` and reader prefs/last surah gracefully (`S.lastQuranSurah`, `S.quranFontScale`, `S.quranTint` optional fields on `S` or localStorage? Wait: `tests/schema-contract.test.js` tests `freshState()`, NOT arbitrary optional UI prefs, OR better store Quran reader UI prefs cleanly inside `S.tafsirLookup` or local `localStorage` key `iq_quran_prefs` cleanly so zero undeclared fields land on `S`! YES — storing Quran reader prefs in `localStorage` `'iq_quran_prefs'` preserves strict `freshState()` purity!).
- Bump `?v=` pins in `index.html` (`styles/main.css?v=52`, `core/prayers.js?v=5`, `core/render-prayers.js?v=7`, `core/static.js?v=10`, `core/dynamic.js?v=17`, `features/masjid-checkins.js?v=3`, `features/iq-shell.js?v=5`, `core/actions.js?v=27`, `sw.js?v=65`) + `MANIFEST_REV = 25` in `sw.js`.

---

### Task 1: Concentric 3-Ring Hero, 7-Day Rhythm Strip & Compact Utility Bar (`features/iq-shell.js`, `index.html`, `styles/main.css`)

**Files:**
- Modify: `features/iq-shell.js`
- Modify: `index.html`, `styles/main.css`
- Test: `tests/iq-shell.test.js`

- [ ] **Step 1: Write failing tests in `tests/iq-shell.test.js`** for `computeWeeklyRhythm`, `renderConcentricRingsSvg` (`3` SVG `<circle>` progress arcs + tabular readout), `"Today's Focus"` rendering 3-ring SVG + 7-day rhythm dots, and `getTimeGreeting`.
- [ ] **Step 2: Run `node --test tests/iq-shell.test.js` to confirm RED.**
- [ ] **Step 3: Implement `renderConcentricRingsSvg`, `computeWeeklyRhythm`, `getTimeGreeting`, compact utility row CSS, and 3-ring integration in `renderIqFeed()` + `renderChallengeDetailBody()`.**
- [ ] **Step 4: Run `node --check features/iq-shell.js; node --test tests/iq-shell.test.js` to confirm GREEN.**

---

### Task 2: Pillars-Grade Prayer Cards (`qada` + `paused` streak protection + live window glow) (`core/prayers.js`, `core/render-prayers.js`, `core/actions.js`, `styles/main.css`)

**Files:**
- Modify: `core/prayers.js`
- Modify: `core/render-prayers.js`
- Modify: `core/actions.js` (`window.App.togglePrayerQada`)
- Modify: `styles/main.css`
- Test: `tests/prayers.test.js`

- [ ] **Step 1: Write failing tests in `tests/prayers.test.js`** verifying `togglePrayerQada` marks `'qada'` (counting truthy in `recalc()` without duplicating `toggleP` XP bugs when toggling qada <-> off) and `S.prayerSettings.paused = true` protects `S.cs` across days without dropping streak to 0.
- [ ] **Step 2: Run `node --test tests/prayers.test.js` to confirm RED.**
- [ ] **Step 3: Implement shared `_applyPrayerToggle(id, qadaMode)` helper, `togglePrayerQada`, `togglePrayerPause`, `paused` streak guard in `recalc()`, live clock labels + `.iq-next-prayer-card` highlight + `↺` Qada control in `renderPrayers()`.**
- [ ] **Step 4: Run `node --check core/prayers.js core/render-prayers.js core/actions.js; node --test tests/prayers.test.js` to confirm GREEN.**

---

### Task 3: Quran Sanctuary Toolbar, Haptic Tasbeeh Orb, Geometric Empty States & MPA Visual Sync (`core/dynamic.js`, `core/static.js`, `features/masjid-checkins.js`, `src/shell/layout.js`, `src/render/prayers.js`, `styles/main.css`)

**Files:**
- Modify: `core/dynamic.js` (`renderQuran`, `renderQuranSurah`, `renderQuranJuz`, sanctuary tint & scale stored in `'iq_quran_prefs'`)
- Modify: `core/static.js` (`renderDhikrCounter` SVG progress tap orb)
- Modify: `features/masjid-checkins.js` (inline SVG mosque empty state)
- Modify: `src/shell/layout.js`, `src/render/prayers.js` (`IQ` monogram & styled buttons)
- Modify: `styles/main.css`, `index.html`, `sw.js`, `tests/html.test.js`, `tests/today-page.test.js`

- [ ] **Step 1: Write failing assertions in `tests/html.test.js` and `tests/dhikr.test.js` / `tests/masjid-checkins.test.js`** checking Sanctuary toolbar functions (`adjustQuranFont`, `setQuranTint`), Tasbeeh SVG orb markup (`iq-tasbeeh-orb`), Masjid SVG empty illustration (`<svg`), updated `?v=` pins, and MPA `IQ` brand badge.
- [ ] **Step 2: Run tests to verify RED.**
- [ ] **Step 3: Implement Quran Sanctuary controls, Tasbeeh Tap Orb, SVG empty state, MPA header/card polish, tabular-numerals typography, CSS, and bump `?v=` pins + `MANIFEST_REV = 25`.**
- [ ] **Step 4: Run full syntax checks, full `node --test tests/*.test.js`, `npm run build` (`vite build` if installed — check safely!), `graphify.exe update .`, and Playwright desktop + mobile screenshots visually verifying EVERY upgraded screen!**
