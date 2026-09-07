# AGENTS.md — Ibadah Quest

Offline-first Islamic worship tracker PWA. Vanilla JavaScript (+ light Vite build for the new MPA track), no framework.

Two tracks coexist. Legacy SPA: index.html + classic <script> IIFEs on window.* — still the shipped app, untouched until per-page ports land. New MPA (src/): ES modules, zero window.* writes, Vite MPA build — skeleton + Today page live, other pages are shells awaiting feature ports.

## Before you finish any task

- Maintain a live todo list (todowrite) while working; keep it updated as tasks start/finish.
- Run `node --test` from the project root. All must pass (baseline 521 + track tests).
- Syntax-check every JS file you touched: classic files `node --check <file>`; src/** ESM is covered by `node scripts/check-syntax.js`.
- New track needs no manual `?v=` / `CACHE_NAME` bumps (hashed build assets + precache-manifest.js). Legacy track keeps the old discipline.

## Critical contracts — legacy SPA (still binding for legacy files)

1. **New tab = 4 touchpoints**: entry in data/tab-groups.js + panel div in index.html + mapping in render/tabs.js `_lazyRender` + exported renderer function. Missing one = silently blank panel.
2. **New state field** goes in `freshState()` in state/state.js (normalizeState backfills it for existing users).
3. **Script load order in index.html matters**; feature scripts use `defer`.
4. **Escape user input on render** (`escapeHTML` pattern) — never trust strings from S.

## New-track contracts (src/**)

5. **New page = 5 touchpoints**: entry in vite.config.js rollupOptions.input + src/pages/<name>/<name>.html + entry.js (error-tap FIRST import, renderShell(pageId)) + smoke coverage in tests/mpa-complete.test.js. Missing one = build or test fails loudly.
6. **New state field** goes in `freshState()` in src/core/state.js (normalizeState backfills).
7. **Heavy pools load only via** `loadPool` in src/data/pools.js (classic-script injection); never static-import pools into page entries.
8. **Escape user input on render** (`escapeHTML`) — never trust strings from state.

Full details: the `ibadah-quest-dev` skill covers all conventions with file references. Load it when working on wiring, state, tabs, or caching.

## Environment

- Windows, PowerShell 5.1: no `tail`, no `&&` between cmdlets, no glob expansion.
- Test command is exactly `node --test` (no test runner to install).

## Rules

- Do not commit unless explicitly asked.
- The service worker caches assets aggressively — after UI changes that don't show up, suspect cache versions first.
