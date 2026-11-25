# Ibadah Quest Option 3 Modern Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure Ibadah Quest into the modern `iQ` Teal/Cyan/Gold full-screen layout shown in the user mockup — featuring the curved gradient header with Hamburger & Notification drawers, overlapping Daily Progress hero card, clean Daily Challenges feed, Slide-Over Progress Ring & Timer Detail sheet, offline Masjid Check-ins map/log sheet, floating 5-slot bottom dock with elevated Center Crescent FAB, and dark-teal Islamic-lattice onboarding/auth overlays.

**Architecture:** Classic SPA IIFEs on `window.*` (`index.html`, `styles/main.css`, `core/*`, `features/*`, `data/*`) plus `src/core/state.js` ESM parity. Two new defer feature modules (`features/masjid-checkins.js`, `features/iq-shell.js`) render the restructured Today feed, slide-over sheets, drawers, and SVG map cleanly while keeping every existing `#panel-*` contract, `TAB_GROUPS`, `PANEL_SECTIONS`, and `src/pages/*` MPA route functional.

**Tech Stack:** Vanilla JS (classic IIFEs + ESM parity in `src/core/state.js`), CSS3 (`clamp()`, `100dvh`, safe-area insets, inline SVG lattice & world pins), Node.js built-in test runner (`node --test`), `node --check`, `node core/check-syntax.js`, Playwright for live browser checks.

## Global Constraints

- **Do not commit unless explicitly asked** (`AGENTS.md`). Task checkpoints are passing `node --test` and `node --check` checks.
- Test command: `node --test tests/*.test.js` from repo root; must end 100% green.
- Syntax check: `node --check <file>` on every touched classic `.js` file + `node core/check-syntax.js`.
- Windows PowerShell 5.1: use `;` instead of `&&`, quote file paths, no `tail`/`head`.
- State schema parity: any new `S` field MUST be added identically to `freshState()` in BOTH `core/state.js` and `src/core/state.js` (and `tests/schema-contract.test.js`).
- XSS escaping: all user-entered strings (`masjidCheckIns` name/city/prayer) MUST be escaped with `window.escapeHTML` before `innerHTML` rendering.
- Strict CSP: zero external scripts, map tiles, or third-party trackers; SVG map & geometric lattice are inline/local only.
- Cache discipline: update `?v=` refs in `index.html`, add new files to `core/precache-manifest.js`, bump `MANIFEST_REV` in `sw.js` (`17` → `18`), bump `sw.js?v=58` in `index.html`, and sync version pins in `tests/html.test.js`.

---

### Task 1: Pins & Failing Tests First (TDD RED)

**Files:**
- Modify: `tests/schema-contract.test.js:22-41`
- Modify: `tests/html.test.js:56-180` (version/theme pins + append Option 3 layout pins)
- Create: `tests/masjid-checkins.test.js`
- Create: `tests/iq-shell.test.js`

**Interfaces:**
- Consumes: `tests/helpers/load.js` sandbox helper.
- Produces: Failing test suite confirming RED before implementation.

- [ ] **Step 1: Update `tests/schema-contract.test.js`** to require `masjidCheckIns: []` and `dailyChallengeGoals: { dhikr: 500, quranMinutes: 20, prayers: 5 }`.
- [ ] **Step 2: Create `tests/masjid-checkins.test.js`** testing:
  - `logMasjidCheckIn({ name, city, region, prayer })` adds sanitized check-in entry to `S.masjidCheckIns`, increments daily XP once per prayer per day (`grantDailyXp`), persists via `saveState`.
  - Rejects blank/empty mosque names.
  - Renders check-in list with `escapeHTML` neutralizing `<script>`/`<img onerror>` payloads.
  - Computes visit counts & regional map pins accurately.
- [ ] **Step 3: Create `tests/iq-shell.test.js`** testing:
  - `computeDailyChallenges(S, todayKey)` computes accurate prayer, dhikr, quran, voluntary, deeds, and masjid check-in percentages & fractions (`0..100`).
  - `openIqDrawer()` / `closeIqDrawer()`, `openNotifDrawer()`, `openChallengeDetail()`, and `closeActiveSheet()` manage DOM state cleanly without throwing when optional elements are absent.
- [ ] **Step 4: Update `tests/html.test.js`** version pins (`styles/main.css?v=45`, `sw.js?v=58`, new `--bg: #f2fbf8` & `theme-color` `#075e64`) and append Option 3 structural pins (`features/masjid-checkins.js`, `features/iq-shell.js`, `iqDrawer`, `iqNotifDrawer`, `iqChallengeSheet`, `iqMasjidSheet`, `bnavCenterFab`).
- [ ] **Step 5: Run `node --test tests/*.test.js`** and confirm expected RED failures on the newly added tests/pins.

---

### Task 2: State Schema & Migration Parity

**Files:**
- Modify: `core/state.js:15-55`
- Modify: `src/core/state.js:14-54`

**Interfaces:**
- Produces: `S.masjidCheckIns` (`Array`) and `S.dailyChallengeGoals` (`Object`) in `freshState()` and backfilled via `normalizeState()`.

- [ ] **Step 1:** Add `masjidCheckIns:[], dailyChallengeGoals:{dhikr:500,quranMinutes:20,prayers:5}` to `freshState()` in `core/state.js` and `src/core/state.js`.
- [ ] **Step 2:** Guard malformed `masjidCheckIns` / `dailyChallengeGoals` in `normalizeState()` (coerce non-array `masjidCheckIns` to `[]`, backfill missing goal numbers).
- [ ] **Step 3:** Run `node --check core/state.js; node core/check-syntax.js; node --test tests/schema-contract.test.js tests/state.test.js tests/core-esm.test.js` — expect PASS.

---

### Task 3: Brand Icon, Manifest, Theme Metadata & Dark-Teal Intro

**Files:**
- Modify: `assets/icons/icon.svg`
- Modify: `manifest.json`
- Modify: `data/theme-meta.js`
- Modify: `data/icons.js`
- Modify: `index.html:1-225, 620-646`

**Interfaces:**
- Consumes: `window.Themes`, `window.iqIcon`, `window.App`.
- Produces: Updated `iQ` Teal-Cyan rounded square SVG icon, updated `theme-color` (`#075e64`), critical CSS tokens (`--bg: #f2fbf8`, `--accent: #0b8a82`), dark-teal geometric lattice `#introOverlay`, curved `#topBar` header with `#iqMenuBtn`, `#iqHeaderBackBtn`, `#iqNotifBtn`, `#iqHeroSummary`, `#iqFeedArea`, drawer/sheet containers (`#iqDrawer`, `#iqNotifDrawer`, `#iqChallengeSheet`, `#iqMasjidSheet`), and 5-slot floating `#bnav` with elevated `#bnavCenterFab`.

- [ ] **Step 1:** Rewrite `assets/icons/icon.svg` with the teal-cyan gradient rounded square and white `iQ` monogram + crescent moon & star.
- [ ] **Step 2:** Update `manifest.json` `background_color` (`#f2fbf8`) and `theme_color` (`#075e64`).
- [ ] **Step 3:** Update `data/theme-meta.js` light swatch (`bg:'#f2fbf8', accent:'#0b8a82'`), preserving `serene`, `royal`, `midnight`, `cream`, `emara`.
- [ ] **Step 4:** Add missing UI icon keys/aliases (`menu`, `chevron-right`, `compass`, `masjid`) in `data/icons.js` if not already present (reusing pre-cached Noto emojis/SVGs).
- [ ] **Step 5:** Update `index.html` critical CSS, `theme-color`, `#introOverlay` (with `iQ` emblem + geometric SVG lattice + `"Your Daily Spiritual Journey."`), curved header structure (`#iqMenuBtn`, `#iqNotifBtn`, `#iqHeaderTitle`), `#iqHeroCard`, `#iqFeedArea`, drawer/sheet containers, floating 5-slot `#bnav` (`ibadah`, `knowledge`, `#bnavCenterFab`, `library`, `profile_main`), and script tags (`features/masjid-checkins.js?v=1`, `features/iq-shell.js?v=1` with `defer` before `core/actions.js`). Keep all existing `#panel-*`, `.tier1-tabs`, `#headerCrescent`, `#lvNum`, `#lvTitle`, `#xpBar`, `#xpLabel`, `#strDays`, `#strMsg`, `#bestStr`, `#streakFire`, `#volArea`, `#deedArea`, `#prayerArea` IDs valid and unique (no duplicate IDs).

---

### Task 4: Masjid Check-ins & Option 3 Shell Feature Modules + Core Wiring

**Files:**
- Create: `features/masjid-checkins.js`
- Create: `features/iq-shell.js`
- Modify: `core/dynamic.js` (wire `renderIqFeed()` / `renderIqHeader()` on `renderToday` / `renderTopBar` / `renderLv`, export to `window`)
- Modify: `core/tabs.js` (sync curved header back button + sheet mode when switching tabs/categories, export `populateTier1Icons` safely for new `#bnav` icons)
- Modify: `core/actions.js` (expose `openMasjidCheckins`, `openChallengeDetail`, `logMasjidCheckIn`, `openIqDrawer`, `closeIqDrawer`, `openNotifDrawer` on `window.App`)

**Interfaces:**
- `features/masjid-checkins.js`: exports `window.logMasjidCheckIn`, `window.computeMasjidStats`, `window.openMasjidCheckins`, `window.closeMasjidCheckins`, `window.renderMasjidSheet`, `window.MAP_REGIONS`.
- `features/iq-shell.js`: exports `window.computeDailyChallenges`, `window.renderIqFeed`, `window.openChallengeDetail`, `window.closeChallengeDetail`, `window.openIqDrawer`, `window.closeIqDrawer`, `window.openNotifDrawer`, `window.closeNotifDrawer`, `window.closeActiveSheet`, `window.initIqShell`.

- [ ] **Step 1:** Implement `features/masjid-checkins.js` (classic IIFE):
  - Pure region coordinates (`MAP_REGIONS` for North America, Europe, MENA, South Asia, SE Asia, East Africa, West Africa, Oceania) on an offline inline SVG world/regional map (`viewBox="0 0 600 300"`).
  - `logMasjidCheckIn({ name, city, region, prayer })`: validates & trims input, saves into `S.masjidCheckIns`, grants `+15 XP` once per prayer/day via `grantDailyXp(15, 'masjid|' + today + '|' + prayer)`, triggers haptic/toast, re-renders sheet & feed.
  - `renderMasjidSheet(activeSubTab)`: supports `'map' | 'calendar' | 'history'` subviews inside `#iqMasjidSheet`, escaping every user field via `window.escapeHTML`.
- [ ] **Step 2:** Implement `features/iq-shell.js` (classic IIFE, self-init with `init._done`):
  - `computeDailyChallenges(state, dateKey)`: computes exact progress ratios for Daily Prayers (`done/5`), Dhikr Counter (`todayCount/goal`), Quran Reading (`todayVerses/goal`), Voluntary Prayers, Extra Deeds, and Masjid Check-ins.
  - `renderIqFeed()`: updates the Floating Hero Challenge Card (`#iqHeroChallenge`) and `#iqFeedArea` Daily Challenges cards.
  - `openChallengeDetail(focusId)`: opens `#iqChallengeSheet` (`Screen 2`) with curved teal header, animated **Circular SVG Progress Ring**, live **Next Prayer Countdown + Focus Session Stopwatch**, and action rows (`+1 Dhikr`, `+33 Dhikr`, `Open Quran`, `Log Prayer`, `Daily Quests`, `Show All`).
  - Drawer & Notification Drawer management (`openIqDrawer`, `closeIqDrawer`, `openNotifDrawer`, `closeNotifDrawer`, `Escape` handling, backdrop close).
- [ ] **Step 3:** Wire `core/dynamic.js`, `core/tabs.js`, and `core/actions.js` so `renderToday()`, `renderTopBar()`, `activateTab()`, `switchCategory()`, and `window.App` drive the restructured shell seamlessly.
- [ ] **Step 4:** Run `node --check features/masjid-checkins.js; node --check features/iq-shell.js; node --check core/dynamic.js; node --check core/tabs.js; node --check core/actions.js; node --test tests/masjid-checkins.test.js tests/iq-shell.test.js tests/app-registry.test.js tests/cross-tab-routing.test.js` — expect PASS.

---

### Task 5: `styles/main.css` Visual Overhaul & Mobile Screen Ratio Responsiveness

**Files:**
- Modify: `styles/main.css`

**Interfaces:**
- Matches all visual classes referenced in `index.html`, `features/iq-shell.js`, and `features/masjid-checkins.js`.

- [ ] **Step 1:** Update `:root` tokens at top of `styles/main.css` (`--bg: #f2fbf8`, teal/cyan/gold tokens, refined shadows & radii), keeping `serene`, `royal`, `midnight`, `cream`, `emara` themes intact.
- [ ] **Step 2:** Update `#introOverlay`, `#onboardingOverlay`, `#authOverlay` styles for the deep-teal lattice backdrop (`#07434b`) and Compass Gold pill CTAs (`#d4af37`).
- [ ] **Step 3:** Style Option 3 shell components:
  - `.iq-curved-header` / `.top-bar` curved gradient banner (`border-radius: 0 0 28px 28px`, safe-area-inset-top, inline SVG lattice positioning).
  - `#iqHeroCard` overlapping hero progress card with dual-tone teal/gold progress bar.
  - `.iq-feed-list` & `.iq-challenge-card` clean vertical cards with circular tinted icon badges, linear progress bars, `%` pill, and chevrons.
  - `.iq-sheet-overlay`, `.iq-ring-card` (SVG circular progress ring + live timer), `.iq-masjid-map` (offline world SVG pins), `.iq-drawer` (slide-out hamburger menu), `.iq-notif-drawer`.
  - Floating 5-slot `.bnav` dock (`border-radius: 24px 24px 0 0` / floating pill on mobile with safe-area bottom padding) + elevated circular `.bnav-center-fab` crescent button (`.bnav{position:fixed...}` and `.app` bottom clearance preserved).
  - Responsive behavior across narrow cover screens (`max-width: 360px`), portrait phones (`16:9`, `20:9`), landscape phones (`orientation: landscape and (max-height: 520px)`), and tablets/foldables (`min-width: 768px` switching cleanly to `.tier1-tabs` centered shell).

---

### Task 6: Cache Versioning, Precache Sync & Full Test Verification

**Files:**
- Modify: `core/precache-manifest.js`
- Modify: `sw.js` (`MANIFEST_REV = 18`)
- Modify: `index.html` (bump `?v=` on changed scripts/CSS & `sw.js?v=58`)
- Modify: `tests/sw-manifest.test.js` (ensure new offline pages/scripts are verified if appropriate)

- [ ] **Step 1:** Update `core/precache-manifest.js` to include `features/masjid-checkins.js`, `features/iq-shell.js`, `404.html`, `privacy.html`.
- [ ] **Step 2:** Bump `MANIFEST_REV = 18` in `sw.js` and sync `?v=` params + `sw.js?v=58` in `index.html`.
- [ ] **Step 3:** Run full syntax & unit suite:
  - `node core/check-syntax.js`
  - `node --check` on all touched classic files
  - `node --test tests/*.test.js` — expect 100% pass (0 failures).

---

### Task 7: Live Browser Verification across Mobile Ratios + Graphify Sync

**Files:**
- Temporary browser verification script (removed before finishing)
- Update: `graphify-out/` via `graphify.exe update .`

- [ ] **Step 1:** Start a local static server (`python -m http.server 8125`) in `C:\Users\Mahin\Desktop\IQ`.
- [ ] **Step 2:** Run headless Playwright checks across:
  - `390x844` (20:9 modern phone portrait)
  - `320x568` (ultra-narrow phone)
  - `844x390` (mobile landscape)
  - `768x1024` (tablet/foldable)
  Verify: zero console/page errors, zero horizontal scroll (`scrollWidth <= clientWidth`), visible curved teal header, floating hero card, Daily Challenges feed, floating bottom dock + elevated center crescent button, open/close Challenge Ring detail (`Screen 2`), open/log/close Masjid Check-ins map (`Screen 3`), open/close Hamburger Drawer & Notifications Drawer, theme toggle, and clean intro overlay (`Screen 4`).
- [ ] **Step 3:** Stop background server, remove temporary verification scripts/screenshots, run `graphify.exe update .`, and run final post-edit verification (`node core/check-syntax.js; node --test tests/*.test.js`).
