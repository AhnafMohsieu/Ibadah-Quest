# Ibadah Quest — Option 3 Modern Restructure Design Spec

**Date:** 2026-11-25
**Status:** Ready for implementation (user requested full completion of Option 3 aligned with `iQ` Teal/Cyan/Gold mockup)
**Scope:** Full UI/UX layout restructure (Option 3) matching the `iQ` Teal/Cyan/Gold brand identity, clean Daily Challenges vertical feed, Slide-Over Progress Ring & Timer Detail view, offline Masjid Check-ins map & log, curved teal header with Navigation & Notification drawers, floating 5-slot bottom dock with elevated Center Crescent FAB, dark-teal Islamic-lattice onboarding/auth overlays, and updated tests + cache versioning.

---

## 1. Visual Brand & Design System

### 1.1 Color Tokens (`styles/main.css`, `data/theme-meta.js`)
Replace the legacy light theme tokens with the `iQ` Teal/Cyan/Gold palette while preserving `serene`, `royal`, `midnight`, `cream`, and `emara` themes intact:
- **Canvas & Surfaces:**
  - `--bg: #f2fbf8` (soft mint-tinted canvas)
  - `--bg-accent: #e4f5f0`
  - `--card-bg: #ffffff`
  - `--card-border: rgba(11, 122, 117, 0.12)`
- **Typography & Ink:**
  - `--text: #0b2528` (deep teal-slate)
  - `--text2: #4b6b6e`
  - `--text3: #7b9699`
- **Brand Teal / Cyan / Gold:**
  - `--teal-deep: #07434b`
  - `--teal-mid: #0b7a75`
  - `--teal-bright: #14b8a6`
  - `--header-grad: linear-gradient(145deg, #07434b 0%, #0b7a75 55%, #14b8a6 100%)`
  - `--accent: #0b8a82` (primary interactive teal)
  - `--accent-light: #14b8a6`
  - `--accent-dark: #075e64`
  - `--gold: #d4af37` / `--gold-light: #eab308` / `--gold-dark: #b8860b` (Compass Gold for stars, streaks, and primary onboarding CTAs)
  - `--accent-bg: rgba(11, 138, 130, 0.10)`
  - `--accent-border: rgba(11, 138, 130, 0.22)`
- **Shape & Elevation:**
  - `--radius: 18px`, `--radius-sm: 12px`, `--radius-lg: 24px`
  - `--shadow-sm: 0 2px 8px rgba(7, 67, 75, 0.05)`
  - `--shadow-md: 0 6px 20px rgba(7, 67, 75, 0.08)`
  - `--shadow-lg: 0 12px 32px rgba(7, 67, 75, 0.12)`

### 1.2 Brand Icon & Lattice Watermarks (`assets/icons/icon.svg`, `manifest.json`, `index.html`)
- Update `assets/icons/icon.svg` to the rounded-square teal-to-cyan gradient icon featuring the crisp white `iQ` monogram with a golden/white crescent moon & star inside the `Q`.
- Update `manifest.json` `theme_color` (`#075e64`) and `background_color` (`#f2fbf8`).
- Use pure inline SVG 8-pointed Islamic star lattice watermarks inside `.iq-curved-header` and `#introOverlay` (zero external network fetches, 100% CSP-compliant).

---

## 2. Option 3 Screen Architecture & Navigation

### 2.1 Curved Teal Header & Overlapping Hero Card (`Screen 1`)
- **Curved Teal Gradient Header (`#topBar` inside `.iq-curved-header`):**
  - Full-width header with curved lower corners (`border-radius: 0 0 28px 28px`), safe-area top padding, and 3-column bar:
    - **Left:** Hamburger Menu Button (`#iqMenuBtn`, `aria-label="Open menu"`) opening `#iqDrawer` (or `‹ Back` button `#iqHeaderBackBtn` when drilled into secondary views).
    - **Center:** `iQ` emblem + screen title (`Ibadah Quest` on Today, active view title when drilled in) + `#dateLine` Hijri/Gregorian date subtitle.
    - **Right:** Notification Bell Button (`#iqNotifBtn`, `aria-label="Notifications"`) with unread indicator opening `#iqNotifDrawer`, plus compact stats (`#tbLevel`, `#tbXP`, `#tbStreak`) and `#themeToggle` accessible cleanly without cluttering mobile width.
- **Floating Hero Progress Card (`#iqHeroCard` inside `.hero-strip`):**
  - Overlaps the curved header bottom edge (`margin-top: -36px`).
  - Displays level badge (`#lvNum`, `#lvTitle`), XP bar (`#xpBar`, `#xpLabel`), streak indicator (`#streakFire`, `#strDays`, `#strMsg`, `#bestStr`), plus the featured daily goal dual-tone (teal + gold) progress bar (`Dhikr Counter` / daily progress fraction).
  - Keeps existing DOM IDs (`headerCrescent`, `lvNum`, `lvTitle`, `xpBar`, `xpLabel`, `strDays`, `strMsg`, `bestStr`, `streakFire`) wired to `renderLv()` and `renderStr()`.

### 2.2 Clean Vertical `Daily challenges` Feed (`#panel-today`)
- On Home (`Today`), replace exposed accordion clutter with a focused, calm feed:
  1. **Daily Prayers Row (`#prayerArea`):** 5 prayer pills (`Fajr`, `Dhuhr`, `Asr`, `Maghrib`, `Isha`) with one-tap completion, XP badge, and teal checkmark.
  2. **`Daily challenges` Action Feed (`#iqFeedArea`):**
     - **Dhikr Counter** — live daily count vs `S.dailyChallengeGoals.dhikr` (default 500), linear progress bar + `%`, opens Challenge Ring & Timer Sheet (`Screen 2`).
     - **Quran Reading Goal** — daily verses/pages read vs `S.dailyChallengeGoals.quranMinutes`, linear progress bar + `%`, opens Quran view or Challenge Ring detail.
     - **Masjid Check-ins** — total/today mosque check-ins, chevron `>`, opens Masjid Check-ins Sheet (`Screen 3`).
     - **Voluntary Prayers** — completed count / total, opens Voluntary Prayers detail sheet/accordion.
     - **Extra Good Deeds** — completed count / total, opens Extra Deeds detail sheet/accordion.
     - **Active Quests & Journeys** — opens Quests / Journeys.
  3. **Expandable Full Prayers & Deeds Container:** `#volArea` and `#deedArea` remain mounted and updated by `renderToday()` inside a collapsible `<details id="iqAllActsDetails">` (or focused sheet) so zero DOM contracts break while keeping the initial scroll crisp.

### 2.3 Slide-Over Progress Ring & Timer Detail Sheet (`#iqChallengeSheet` — `Screen 2`)
- Triggered by tapping the **Center Elevated Crescent FAB** or any Challenge Feed card (`Dhikr Counter`, `Quran Reading Goal`).
- Full-height slide-over overlay with curved teal header (`‹ Back`, `Daily challenges`, `🔔`).
- **Dual-Metric Floating Card:**
  - Left: Animated **Circular SVG Progress Ring** (`stroke-dasharray` / `stroke-dashoffset`) showing today's total progress (`dhikr` taps or daily XP/actions).
  - Right: **Live Countdown / Active Session Timer** showing time until next prayer (reusing `fetchPrayerTimes()`) + interactive stopwatch toggle for focused dhikr/Quran sessions.
- **Challenge Action List:** `Dhikr +1`, `Dhikr +33`, `Quran Reader`, `Daily Quests`, `Show All` toggle — each with `Progress` / `Start` teal pill buttons.

### 2.4 Offline `Masjid Check-ins` Sheet (`#iqMasjidSheet` — `Screen 3`)
- Triggered from the Home Feed (`Masjid Check-ins` card), Hamburger Drawer, or `App.openMasjidCheckins()`.
- Curved teal header (`‹ Back`, `masjid check-ins`) + 3 segment icon tabs:
  1. **Map View:** Pure offline inline SVG stylized world/regional map (zero external map network requests, 100% CSP-compliant) plotting glowing teal check-in pins for visited cities/regions + quick pin preview.
  2. **Calendar View:** Monthly check-in attendance grid highlighting days with mosque visits.
  3. **History List:** Reverse-chronological log of check-ins + form to log a new visit (`Mosque Name`, `City / Area`, `Prayer` selector, `Region` pin selector) awarding `+15 XP` (capped once per prayer per day via `grantDailyXp`).

### 2.5 Floating 5-Slot Bottom Dock + Elevated Center Crescent FAB (`#bnav`)
- Replaces the legacy flat bar + detached corner FAB on mobile/touch viewports:
  1. **Home** (`data-cat="ibadah"`, opens Today feed)
  2. **Knowledge** (`data-cat="knowledge"`, opens Knowledge / Qur'an / Tafsir / Hadith)
  3. **Center Elevated Circular Teal-Cyan Crescent Button (`#bnavCenterFab`)** — opens the **Challenge Ring & Quick Worship Sheet (`Screen 2`)** (with secondary quick actions inside!)
  4. **Library** (`data-cat="library"`, opens Islamic Library)
  5. **Profile** (`data-cat="profile_main"`, opens Profile, Trophies, Progress, Analytics, Rewards)
- **Hamburger Drawer (`#iqDrawer`):** Provides 1-tap access to Global Search, **99 Names & Blessed Figures (`data-cat="names_main"`)**, **Masjid Check-ins**, **Daily Quests & Adhkar**, **Theme Switcher**, and **Privacy Policy / Contact**.
- **Desktop / Tablet (`>= 768px`):** Keeps `.tier1-tabs` cleanly styled in the teal pill bar while hiding `#bnav`; responsive across 320px cover screens, 16:9, 20:9, 4:3 foldables, and landscape `<= 520px` height.

### 2.6 Dark-Teal Onboarding & Auth Overlays (`Screen 4`)
- Style `#introOverlay`, `#onboardingOverlay`, and `#authOverlay` with deep teal gradient (`#063b42` -> `#0a545c`), subtle SVG geometric lattice watermark, centered `iQ` emblem, and Compass Gold pill CTA buttons (`#d4af37` -> `#eab308` with dark teal text `#073b42`).

---

## 3. Data Schema, Security & PWA Cache Discipline

### 3.1 State Fields (`core/state.js` & `src/core/state.js`)
Add identically to `freshState()` in both tracks (automatically backfilled by `normalizeState()`):
- `masjidCheckIns: []` — array of `{ id, name, city, region, prayer, date, ts }` (bounded/pruned cleanly if over 500 entries)
- `dailyChallengeGoals: { dhikr: 500, quranMinutes: 20, prayers: 5 }`

### 3.2 Security & Escaping
- All user-submitted strings in `masjidCheckIns` (`name`, `city`, `prayer`) MUST pass through `window.escapeHTML` before `innerHTML` rendering.
- Validate & clamp inputs (`slice(0, 120)`, non-empty mosque name check).
- Maintain strict CSP in `index.html` with zero external script/image additions.

### 3.3 Cache Versioning & MPA Parity
- Add `features/masjid-checkins.js` and `features/iq-shell.js` (plus `404.html`, `privacy.html`) to `core/precache-manifest.js`.
- Bump `MANIFEST_REV` in `sw.js` (`17 -> 18`).
- Bump `?v=` params in `index.html` for modified classic assets (`styles/main.css`, `core/state.js`, `core/dynamic.js`, `core/tabs.js`, `core/actions.js`, `data/theme-meta.js`, `data/icons.js`, `sw.js`).

---

## 4. Testing Strategy

1. **Schema Contract (`tests/schema-contract.test.js`):** Pin `masjidCheckIns` and `dailyChallengeGoals` in `freshState()` and legacy backfill verification.
2. **New Feature Unit Tests:**
   - `tests/masjid-checkins.test.js`: logging a check-in, XSS escaping on mosque/city names, duplicate daily XP cap per prayer, region pin validation, deletion/history count.
   - `tests/iq-shell.test.js`: daily challenge progress math (rings, percentages, capped fractions), drawer open/close state, slide-over sheet open/back navigation.
3. **Updated Shell Pin Tests (`tests/html.test.js`):** Update legacy layout assertions intentionally replaced by Option 3 (new default theme tokens, curved header, floating 5-slot dock with center crescent FAB, drawer/notifications/sheet DOM IDs, updated `?v=` pins) while preserving all non-layout domain assertions.
4. **Full Verification:** `node --check` on every touched classic file, `node core/check-syntax.js`, full `node --test tests/*.test.js`, plus live Playwright browser checks across mobile portrait, ultra-narrow (`320px`), landscape (`844x390`), and tablet (`768x1024`).
