# AGENTS.md — Ibadah Quest

Offline-first Islamic worship tracker PWA. Vanilla JavaScript, no build step, no bundler, no framework. Plain `<script>` tags in dependency order; IIFEs export to `window.*`.

## Before you finish any task

- Run `node --test` from the project root (~337 tests). All must pass.
- Syntax-check every JS file you touched: `node --check <file>`.
- If you changed any asset with a `?v=` version in index.html: bump the `?v=`, bump `CACHE_NAME` in sw.js, and update the pinned version in tests/html.test.js.

## Critical contracts (breaking these caused real bugs before)

1. **New tab = 4 touchpoints**: entry in data/tab-groups.js + panel div in index.html + mapping in render/tabs.js `_lazyRender` + exported renderer function. Missing one = silently blank panel.
2. **New state field** goes in `freshState()` in state/state.js (normalizeState backfills it for existing users).
3. **Script load order in index.html matters**; feature scripts use `defer`.
4. **Escape user input on render** (`escapeHTML` pattern) — never trust strings from S.

Full details: the `ibadah-quest-dev` skill covers all conventions with file references. Load it when working on wiring, state, tabs, or caching.

## Environment

- Windows, PowerShell 5.1: no `tail`, no `&&` between cmdlets, no glob expansion.
- Test command is exactly `node --test` (no test runner to install).

## Rules

- Do not commit unless explicitly asked.
- The service worker caches assets aggressively — after UI changes that don't show up, suspect cache versions first.
