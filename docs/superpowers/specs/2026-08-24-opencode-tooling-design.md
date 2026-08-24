# opencode Tooling Setup Design

**Date:** 2026-08-24
**Goal:** Equip the Ibadah Quest repo with project-scoped opencode tooling — a browser-automation MCP server, a read-only QA agent, and a project-conventions skill — to close the app's biggest quality gaps: no real-browser testing, and conventions that previously lived only in the maintainer's head.

## Background

The app is vanilla JS with no build step. Its test suite asserts source-file content; nothing ever executes the UI in a browser. Several past bugs (missing favorite button, deleted modal queue, unconditional intro hiding) were violations of undocumented wiring contracts.

## Components

### 1. `opencode.json` (project root)

Registers the Playwright MCP server (`npx -y @playwright/mcp`, type local). Enables in-browser QA: open the served app, click through tabs, capture console errors, screenshot layouts. First use downloads Chromium (~120MB).

No other config: skills in `.opencode/skills/` are auto-discovered; AGENTS.md is auto-read; no GitHub MCP because `gh` CLI + the global permissioned-github skill already cover that workflow.

### 2. `.opencode/agent/iq-qa.md`

Subagent-mode verification specialist:

- Runs `node --test` and `node --check` on changed files
- Serves the app and smoke-tests via Playwright MCP when available
- `permission.edit: deny` — structurally incapable of modifying code
- Bash allowlist: only `node --test*`, `node --check *`, safe static servers (`npx -y serve *`, `npx http-server *`); all else asks

Reports must include exact commands and verbatim output as evidence.

### 3. `.opencode/skills/ibadah-quest-dev/SKILL.md`

Project conventions skill triggered by edits to core files. Encodes:

- Script load-order rules for index.html
- The 4-touchpoint tab wiring contract (tab-groups entry, index.html panel div, tabs.js lazy map, exported renderer)
- State schema rules (freshState + normalizeState backfill)
- Cache versioning discipline (?v= params + sw.js CACHE_NAME + html.test.js pin, bumped together)
- Toast/modal overlay visibility contract ('show' class; intro uses 'visible' + S.introSeen gate)
- escapeHTML-on-render XSS pattern
- Test suite conventions and PowerShell 5.1 environment quirks

### 4. `AGENTS.md` (project root)

Short session instructions auto-loaded by every agent: verify command (`node --test`), per-file syntax checks, cache-version bump rule, the four critical contracts in one line each, Windows shell notes, and the do-not-commit-without-asking rule.

## Trade-offs considered

- GitHub MCP rejected as redundant with existing gh CLI workflow.
- Global vs project scope: chose project scope so other projects on this machine are unaffected.
- One consolidated skill instead of several small ones: single load covers any task in this repo without fragmenting context.

## Verification

- JSON parses; agent/skill frontmatter fields are valid opencode keys
- After restart: Playwright MCP appears in tools; iq-qa selectable via @; skill triggers on repo edits
