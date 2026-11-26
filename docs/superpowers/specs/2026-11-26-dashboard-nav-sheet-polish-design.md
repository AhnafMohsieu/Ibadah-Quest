# Sub-project 1: Dashboard Hierarchy, Desktop/Tablet Navigation & Sheet Polish — Design Spec

**Date:** 2026-11-26
**Status:** Approved design — ready for spec review
**Track:** Legacy SPA (`index.html`, `styles/main.css`, `core/*`, `features/*`, `tests/*`); `src/` MPA track parity follows in Sub-project 3.

---

## 1. Context & Problem Statement

Live Playwright & visual audits across desktop (`1280x800`), portrait tablet (`768x1024`), and phone (`390x844`) identified six layout, navigation, and accessibility defects:

1. **Duplicate `"Daily challenges"` heading on Today:** `#iqHeroChallenge` (inside `.hero-strip`) and `#iqFeedArea` (below Daily Prayers) both render `Daily challenges`, making the main dashboard repetitive.
2. **Tablet (`768px–819px`) unboxed hero gap & mobile date placement:** `@media (min-width: 768px)` reveals `.level-row` and `.streak-bar` before `@media (min-width: 820px)` activates the 2-column `.hero-strip` card grid, leaving `1 NEW SEEKER` floating unstyled at `768px`. Meanwhile on phones, `#dateLine` renders below `#bonusArea`, placing the Hijri/Gregorian date between **"Tap to claim your Daily Bonus!"** and **"Weekly Reflection"**.
3. **Desktop/tablet quick navigation gap:** `#bnav` hides above `767px`, leaving desktop/tablet users without a 1-click primary category bar (`Home`, `Knowledge`, `Names`, `Library`, `Profile`) inside `#topBar`.
4. **Corner FAB overlapping content on `>= 768px`:** `.fab-container` (`#fabMain`) stays pinned at `bottom: 20px; right: 20px` on tablet and desktop, directly covering `"Show All"` on `#iqFeedArea`.
5. **Masjid Check-ins desktop layout & casing:** `#iqMasjidSheet` uses lowercase `"masjid check-ins"` headings, `.iq-section-label` applies `text-transform: lowercase`, and the full-width SVG world map pushes the **"Quick Masjid Check-In"** form below the desktop fold.
6. **Accessible overlay focus & boot modal restraint:** Closed sheets (`#iqDrawer`, `#iqNotifDrawer`, `#iqChallengeSheet`, `#iqMasjidSheet`) keep focusable DOM nodes reachable without `inert` or `visibility: hidden`, do not manage focus open/restore, and `showDailySummary()` auto-pops on brand-new zero-activity sessions (`xp === 0`, `cs === 0`, empty `log`).

---

## 2. Detailed Design

### 2.1 Desktop/Tablet Center Navigation Pills (`index.html`, `core/tabs.js`, `styles/main.css`)
- **Markup (`index.html` inside `#topBar`):** Add `<nav id="topCatNav" class="iq-top-catnav" role="tablist" aria-label="Main categories">` between `.tb-left` and `.tb-right` with five pill buttons:
  - `Home` (`data-cat="ibadah"`, default `active` / `aria-selected="true"`)
  - `Knowledge` (`data-cat="knowledge"`)
  - `Names` (`data-cat="names_main"`)
  - `Library` (`data-cat="library"`)
  - `Profile` (`data-cat="profile_main"`)
  Each calls `window.closeActiveSheet && window.closeActiveSheet(); App.switchCategory('<cat>', this)`.
- **State Synchronization (`core/tabs.js`):** Update both `switchCategory()` and `activateTab()` to sync active class and `aria-selected` on `.iq-top-cat-btn[data-cat]` alongside `.bnav-btn[data-cat]`.
- **Responsive Visibility (`styles/main.css`):**
  - Hide `.iq-top-catnav` below `768px` (`display: none`), keeping `#topBar` clean on phones.
  - At `@media (min-width: 768px)`, show `.iq-top-catnav` as a centered inline flex/pill cluster; between `768px–959px` use compact padding (`padding: 5px 10px; font-size: 0.78rem`) and hide `.tb-title` (`New Seeker`) in `.tb-left` up to `980px` so pills never collide with the level pill or right stats.

### 2.2 Hero & Today Hierarchy Cleanup (`index.html`, `features/iq-shell.js`, `styles/main.css`)
- **Hero Challenge Label (`features/iq-shell.js`):** Change `#iqHeroChallenge` header text from `Daily challenges` to **`Today's Focus`** (keeping `Details ›` -> `window.openChallengeDetail('dhikr')` and `Dhikr Counter` progress bar intact). Leave `#iqFeedArea` heading as `Daily challenges`.
- **Unified Tablet + Desktop Hero Grid (`styles/main.css`):** Lower the 2-column `.hero-strip` card grid breakpoint from `@media (min-width: 820px)` to **`@media (min-width: 768px)`** so `.level-row` card chrome and `.streak-bar` always align with `#iqHeroChallenge` on portrait tablets (`768x1024`) as well as laptops (`>= 1024px`).
- **Date Line Anchoring (`index.html`, `styles/main.css`):** Move `<div id="dateLine" class="date-line" aria-live="off"></div>` into `.hero-strip` right before `.global-search-wrap` (out of the `<main>` bonus/reflection area). Preserve `#dateLine{display:none;...}` before `@media (max-width: 767px)` and `#dateLine{display:block;}` inside `@media (pointer:coarse) and (max-width: 767px)` so existing cascade & mobile assertions remain green.
- **Hide Redundant `#fab` on `>= 768px` (`styles/main.css`):** Add `.fab-container { display: none; }` inside `@media (min-width: 768px)` while leaving `#fab`, `#fabActions`, `#fabMain`, and `features/fab.js` untouched for code/registry contract compatibility. On desktop/tablet, `"Challenges"` and `"Masjid Map"` remain one click away via `#iqHeroChallenge`, `#iqFeedArea`, and `#iqDrawerQuick`.

### 2.3 Masjid Check-ins Desktop Layout & Typography (`index.html`, `features/masjid-checkins.js`, `styles/main.css`)
- **Title Case Normalization:**
  - Change `<h2 class="iq-sheet-title">` in `#iqMasjidSheet` (`index.html`) from `masjid check-ins` to **`Masjid Check-ins`**.
  - Change history section heading in `features/masjid-checkins.js` (`renderMasjidSheet`) from `masjid check-ins` to **`Check-in History`**, and remove `text-transform: lowercase` from `.iq-section-label` in `styles/main.css`.
- **Desktop Side-by-Side Split (`features/masjid-checkins.js`, `styles/main.css`):**
  - Wrap `viewHtml` + `formHtml` inside `<div class="iq-mc-workspace">` inside `renderMasjidSheet()` when `viewHtml` is rendered (`map` or `calendar` subtabs).
  - At `@media (min-width: 900px)`, widen `#iqMasjidSheet .iq-sheet-body` (`max-width: 68rem`) and lay out `.iq-mc-workspace` as `display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr); gap: 16px; align-items: start;` with `.iq-masjid-map-svg { max-height: 290px; }`. Both map/calendar and **"Quick Masjid Check-In"** remain above the fold on desktop.

### 2.4 Overlay Focus Management (`inert`) & First-Run Daily Summary Restraint
- **Drawers & Sheets (`features/iq-shell.js`, `features/masjid-checkins.js`, `styles/main.css`):**
  - Set `inert` attribute in HTML/DOM (`inert=""` initially on `#iqDrawer`, `#iqNotifDrawer`, `#iqChallengeSheet`, `#iqMasjidSheet` in `index.html`, toggled cleanly via `el.inert = !open` in JS alongside `aria-hidden` — guarded so plain test mocks without `inert` setter still work cleanly).
  - Add CSS visibility isolation so closed overlays cannot leak into layout/a11y trees:
    - `.iq-sheet-overlay` -> `visibility: hidden;` when closed; `.iq-sheet-overlay.open { visibility: visible; }`
    - `.iq-drawer` -> `visibility: hidden;` when closed; `.iq-drawer.open { visibility: visible; }`
  - Track `_lastFocusedTrigger` only when transitioning from no open overlay (`activeSheet === null`); when switching directly between sheets (e.g. Drawer -> Challenge Sheet -> Masjid Sheet), preserve `_lastFocusedTrigger` without intermediate focus restoration, focus the opened overlay's first interactive/close control, and restore focus to `_lastFocusedTrigger` (if still connected in DOM) only when all sheets close (back/close button or `Escape`).
- **Boot Daily Summary Restraint (`features/daily-summary.js`):**
  - Add an empty-profile check inside `showDailySummary(onDone, force)`:
    If `!force` and `Number(S.xp || 0) === 0 && Number(S.cs || 0) === 0 && Object.keys(S.log || {}).length === 0`, invoke `onDone()` (if function) and return immediately without opening the modal. Active/returning users (and existing tests with `xp: 500` / streak / logs) behave unchanged.

---

## 3. Caching & Testing Contract
- **Asset Cache Bumping (`index.html`, `sw.js`, `tests/html.test.js`):**
  - Bump `?v=` query parameters on every modified classic asset in `index.html`: `styles/main.css`, `core/tabs.js`, `features/iq-shell.js`, `features/masjid-checkins.js`, `features/daily-summary.js`, and `sw.js`.
  - Bump `MANIFEST_REV` in `sw.js`.
  - Update version pins in `tests/html.test.js`.
- **Tests:**
  - `tests/iq-shell.test.js`: Assert hero renders `"Today's Focus"` (not duplicate `"Daily challenges"`), assert `openChallengeDetail` / `openIqDrawer` / `closeActiveSheet` toggle `aria-hidden` and `inert` cleanly.
  - `tests/daily-summary.test.js`: Assert zero-activity first-run state (`xp: 0, cs: 0, log: {}`) skips auto-pop and still invokes `onDone`, while explicit `force === true` or active progress shows the modal.
  - `tests/html.test.js`: Assert `#topCatNav` 5 category links exist in `index.html`, `core/tabs.js` syncs `.iq-top-cat-btn`, `#dateLine` sits inside `.hero-strip`, `Masjid Check-ins` title capitalization is used, `.iq-mc-workspace` & `.fab-container { display: none; }` at `min-width: 768px`, and updated `?v=` pins match.
  - Live Playwright verification across `1280x800`, `768x1024`, and `390x844` confirming zero console/page errors, zero horizontal overflow, clean desktop nav active states, visible `NEW SEEKER` card chrome on `768x1024`, clean side-by-side Masjid Check-ins workspace, closed sheets `inert`/hidden, and visual screenshot inspection.
