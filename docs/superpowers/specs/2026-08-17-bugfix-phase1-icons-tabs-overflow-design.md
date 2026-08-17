# Design: Bug-Fix Phase 1 — Icons, Tab Wrap, Overflow

**Date:** 2026-08-17
**Status:** Approved (user) — implementation via SDD
**Branch:** main

## Problem

The user reports the app is "broken": missing icons, broken visuals/layout, and broken functionality (tabs wrong/cut content, unresponsive taps, nav/FAB overlap, slow loading). Diagnosis in headless Chrome (390×844) confirmed four concrete, reproducible defects:

1. **Bottom-nav icons are empty.** The inline icon-fill script at `index.html:345-355` runs before the `#bnav` markup (which lives at `index.html:571-577`). `document.querySelectorAll('.bnav-btn')` returns an empty list at that point, so all five `.bnav-icon` spans stay empty. The tier-1 `.t1-btn` icons fill fine (their markup is earlier in the DOM).

2. **FAB action icons are empty.** The four `.fab-action-icon` spans in `.fab-actions` have no fill code anywhere in the codebase. `features/fab.js` only toggles the open/close and keyboard nav; nothing populates the icon spans.

3. **Tabs scroll and overflow the viewport.** `.tier1-tabs` and `.tier2-tabs` use `flex-wrap: nowrap; overflow-x: auto` on mobile, and their children (`.t1-btn`, `.t2-btn`, `.iq-inline`, `.iq-icon`) measurably extend past the 390px viewport (`document.documentElement.clientWidth`). The user explicitly asked for no scrolling — all tab buttons should be visible "at one place."

4. **Slow/laggy loading.** `index.html` loads **124 separate `<script>` tags** (one per data/feature file) and renders **2160 `<img>` tags** on the Daily view. Every feature is a separate HTTP request. This is a real performance defect, but consolidating scripts and pruning images belongs to the separate "cleanup" workstream the user wants to do later — it is out of scope for this bug-fix phase.

## Scope

In scope (this design):
- Fix bnav icon population
- Add FAB icon population
- Wrap tier1/tier2 tabs into rows on mobile (no horizontal scroll)
- Eliminate horizontal viewport overflow on mobile
- Tests + headless verification

Out of scope (deferred to the cleanup/improvement workstream):
- Merging the 124 scripts into bundles
- Deleting dead/unused code and files
- Architectural restructuring
- Image count reduction / lazy-loading improvements
- New features or visual redesign

## Approach

Fix in place, small and surgical. No new files, no renames, no restructure. Each fix is independently verifiable.

## Design

### Fix 1: Bottom-nav icons

`render/tabs.js` already exports `populateTier1Icons()`, which fills `.t1-btn .iq-inline` late in `init()` (idempotent — it skips spans that already have children) and is called from `core/actions.js:329`. Extend it to also fill `.bnav-btn .bnav-icon`:

- After the existing `.t1-btn` loop, add a loop over `document.querySelectorAll('.bnav-btn')` that fills each `.bnav-icon` span from `iqIcon(btn.getAttribute('data-cat'))`, with the same "skip if already populated" guard.
- Remove the (currently dead) bnav-fill block from the inline script at `index.html:351-354`, keeping the t1 fill there.

Net effect: bnav icons fill correctly because the function runs after the full DOM (including `#bnav`) is parsed.

### Fix 2: FAB action icons

Add `populateFABIcons()` to `features/fab.js` and call it from `initFAB()` (after the `fab` element exists):

```js
function populateFABIcons() {
  var map = { 'Log Prayer': 'prayer', 'Dhikr': 'dhikr', 'Charity': 'charity', 'Quests': 'quests' };
  document.querySelectorAll('.fab-action').forEach(function (a) {
    var icon = a.querySelector('.fab-action-icon');
    if (!icon || icon.childElementCount > 0) return;
    var key = map[a.getAttribute('title')];
    if (key && window.iqIcon) icon.innerHTML = window.iqIcon(key);
  });
}
```

Icon keys (`prayer`, `dhikr`, `charity`, `quests`) resolve through the existing `iqIcon` → `IQ_IDS`/`IQ_AUTO` maps. Export it (`window.populateFABIcons`) so it can be called independently if the FAB actions are re-rendered.

### Fix 3: Tab wrap into rows (no horizontal scroll)

In `styles/main.css`, replace the mobile tier1 rule (currently at `main.css:415`) and the tier2/tier3 scroll rules:

- `.tier1-tabs` at `@media (max-width: 600px)`: change to `flex-wrap: wrap; justify-content: center;` (remove `flex-wrap: nowrap; overflow-x: auto; overflow-y: hidden;`). Keep `gap: 8px`. Keep `width: auto` on `.t1-btn` (from the earlier t1-btn fix) so buttons size to content.
- `.tier2-scroll`, `.tier3-scroll`: set `overflow-x: hidden` (they stay block containers; the `.tier2-tabs`/`.tier3-tabs` inside get the wrap behavior).
- `.tier2-tabs`, `.tier2-tabs.cat-chips`: change to `flex-wrap: wrap; justify-content: center;` on mobile, removing `flex-wrap: nowrap; overflow-x: auto`.
- Ensure the existing desktop rules (≥768px) are untouched.

### Fix 4: Overflow verification

After Fix 3, no element's `getBoundingClientRect().right` should exceed `document.documentElement.clientWidth + 2` at 390px. Verified via the CDP harness.

## Testing

- `tests/html.test.js`: add assertions that the mobile tier1 rule contains `flex-wrap: wrap` (and no longer `overflow-x: auto` for the tier strips), and that `populateTier1Icons`/`populateFABIcons` exist in source.
- `tests/app-registry.test.js`: assert `render/tabs.js` includes a `.bnav-icon` fill and `features/fab.js` includes `populateFABIcons`.
- Full suite must stay green (currently 312 pass).
- Headless Chrome at 390×844: `.bnav-icon` innerHTML non-empty (5/5), `.fab-action-icon` non-empty (4/4) after opening the FAB, zero horizontal overflow, all categories/tabs clickable with content, zero console errors.

## Risks

- Wrapping tier1 into multiple rows increases vertical space the hero-strip compacting already accounted for; verify the tier nav still sits above the fold (fold ratio < 75%). If it grows past that, reduce `.tier1-tabs` gap or button padding in the same pass.
- The `populateFABIcons` icon-key mapping relies on `title` attributes — if a title changes, the icon silently won't fill. Acceptable; covered by the test on span content in headless check.

## Deferred

The cleanup/improvement workstream (script consolidation, dead-code deletion, architecture, image/lazy-load, new features) is a separate design to be brainstormed after this phase is complete and verified.
