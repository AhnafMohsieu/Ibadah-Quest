---
name: ibadah-quest-dev
description: Ibadah Quest (IQ) project conventions — use when editing any file in this repo, especially index.html, state/state.js, data/tab-groups.js, render/tabs.js, render/static.js, render/dynamic.js, core/*.js, sw.js, or adding tabs/content pools/state fields. Covers the tab wiring contract, state schema rules, cache versioning, script load order, and testing conventions.
---

# Ibadah Quest Development Conventions

Vanilla JS PWA. No build step, no bundler, no framework. Scripts load as plain `<script>` tags in dependency order; modules are IIFEs that export to `window.*`. All user data lives in `S` (one big object) persisted to IndexedDB + localStorage.

## 1. Script load order matters

`index.html` loads scripts in strict order: data files → pools → `core/storage.js` → `state/state.js` → render modules → feature scripts (`defer`) → `core/actions.js` last (it calls `init()`). A file may only reference globals from files loaded BEFORE it. Feature scripts with `defer` run after `initApp()`, so `finishInit` re-renders on DOMContentLoaded to pick them up.

## 2. Adding a new tab — all 4 touchpoints required

A tab silently renders blank if ANY is missing:

1. **Entry** in `data/tab-groups.js` under the right category/group
2. **Panel div** in `index.html`: `<div class="tab-panel" role="tabpanel" id="panel-<id>"><div id="<id>Area"></div></div>`
3. **Lazy render mapping** in `render/tabs.js` `_lazyRender`: `<id>:'render<Name>'`
4. **Renderer function** exists and is exported: `window.render<Name> = ...`

For pool-backed content tabs, also add the pool key to `data/pools/new-pools.js` (auto-generates `window['render'+k]`) plus a title in `NEW_POOL_TITLES` in `core/actions.js`, and the panel id to `getSectionPanels`/`panelLookup` sections in `render/tabs.js`.

Icons: every icon key must resolve in `data/icons.js` (`IQ_IDS` aliases map keys → canonical ids). Unknown keys silently render empty.

## 3. State schema rules

New fields MUST be added to `freshState()` in `state/state.js`. Existing users' saves are backfilled by `normalizeState()` copying freshState defaults for missing keys — so a field absent from freshState only ever exists after its runtime guard fires (fragile; never rely on it). Bump `STATE_SCHEMA_VERSION` + extend `migrateState()` only when transforming old data shapes. Never store per-user flags as separate localStorage keys — consolidate into `S`.

## 4. Cache versioning discipline

The service worker serves JS/CSS cache-first. After changing ANY asset referenced with a `?v=` query in index.html:

1. Bump the `?v=` param(s) in index.html (e.g. `styles/main.css?v=17`)
2. Bump `CACHE_NAME` in `sw.js` (e.g. `iq-cache-v18`)
3. Update the pinned version in `tests/html.test.js` (it asserts `sw.js?v=N`)

Skipping this = users stuck on stale assets until cache expires.

## 5. Overlays and modals

All toast-style modals share `#toastOverlay`: show via `classList.add('show')` + `style.display='flex'`; hide via `classList.remove('show')` then delayed `display='none'`. The daily modal queue in `core/actions.js initApp()` is callback-driven (no DOM polling) — don't reintroduce a setInterval/polling mechanism. Intro overlay uses `.visible` class and is gated on `S.introSeen`.

## 6. XSS escaping

User-entered strings rendered via innerHTML MUST pass through `escapeHTML` (defined in render/static.js; features duplicate it locally as safeText/safePrayerText/escapeSearchText). Static pool data from `data/` is trusted and conventionally unescaped. New user-input surfaces must follow the escape-on-render pattern.

## 7. Testing

Run everything: `node --test` from project root. Tests are Node built-in test-runner files in `tests/*.test.js`, many asserting source-file content (regression pins for wiring contracts — e.g. html.test.js checks renderer mappings exist in source). When changing wiring intentionally, update the corresponding assertion. Sandbox helpers live in `tests/helpers/`. Keep the suite green before finishing ANY task; run lint-equivalent via `node --check <file>` per changed file.

## 8. Windows environment

Shell is PowerShell 5.1: no `tail`/`head` (use `Select-Object -Last/-First`), no glob expansion (quote patterns for node), `&&` unsupported between PS cmdlets (use `if ($?) {}`), prefer full cmdlet names. Git warns LF→CRLF — harmless.
