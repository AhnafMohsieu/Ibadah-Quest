# Phase 2: Code Health & Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate duplicated XP-grant logic (~20 sites) into one pipeline, make facade breakage loud, deduplicate modals/rolls/date-keys/escaping, remove DOM polling, and close test gaps — zero behavior change except one timezone bug fix.

**Architecture:** Two-layer XP primitives (`applyXpDelta` / `spendXp` / `saveAndRenderDirty`) in core/xp.js that all callers compose; shared `openToastModal` + callback-driven boot queue in core/actions.js; tiny new `core/random.js` for weighted selection; canonical date keys from state/state.js. Spec: `docs/superpowers/specs/2026-08-26-phase2-code-health-design.md`.

**Tech Stack:** Vanilla JS, Node built-in test runner (`node --test`), vm-sandbox harness (`tests/helpers/load.js`).

## Global Constraints

- Zero behavior change EXCEPT: streak-milestone date keys become local-time (spec §6 bug fix) and new `console.warn` diagnostics when facade targets are missing.
- Full suite green after every task (baseline 415 passing; ≥440 by plan end).
- Commits authorized per-task (standing ruling); commit ONLY files the task lists. NEVER stage `data/hadith-collections.js` or `opencode.json`.
- PowerShell 5.1: no `&&`, no `tail`. Test command exactly `node --test` from repo root.
- Branch: create `phase2-code-health` from current HEAD before Task 1.
- Line numbers cited are from the 2026-08-26 audit pass — always MATCH ON CODE CONTENT first; line numbers are hints only.
- Cache-bump discipline deferred entirely to Task 12 (no `?v=` edits before then).
- When a migration instruction says "the sequence", match the exact statements listed; if the live code differs beyond whitespace, STOP and report BLOCKED rather than improvising.

---

### Task 1: XP primitives in core/xp.js

**Files:**
- Modify: `core/xp.js`
- Test: `tests/xp-primitives.test.js`

**Interfaces:**
- Produces: `window.applyXpDelta(delta:number) -> {oldLv, newLv, leveledUp}` (mutates S.xp/S.lv, fires checkLevelUp, NO sound/save/render); `window.spendXp(amount:number) -> same` (delta clamped to never take S.xp below 0); `window.saveAndRenderDirty()` (saveState + markDirty today/topbar/lv/progress + renderDynamic).
- Consumes: existing globals `S`, `lvFrom`, `checkLevelUp`, `saveState`, `markDirty`, `renderDynamic`.

- [ ] **Step 1: Write failing tests**

Create `tests/xp-primitives.test.js`. Mirror the sandbox style of tests/xp-dhikr.test.js IF it exists; otherwise use this self-contained harness pattern (adapt stub names to whatever the loaded xp.js requires — it needs S, lvFrom, checkLevelUp, playSound, saveState, markDirty, renderDynamic, today, iqIcon/iqEmoji/document for levelUpToast which these tests avoid calling):

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function mk(opts) {
  opts = opts || {};
  const calls = { markDirty: [], saves: 0, renders: 0 };
  const sb = loadFile(path.join(__dirname, '..', 'core', 'xp.js'), {
    S: Object.assign({ xp: 100, lv: 2, log: {}, td: {}, vc: {}, xpDaily: {} }, opts.S || {}),
    lvFrom: xp => { let l = 1; while (xp >= 100 * l * l) l++; return l; }, // simple quadratic
    checkLevelUp: () => {},
    playSound: () => {},
    saveState: () => { calls.saves++; },
    markDirty: k => { calls.markDirty.push(k); },
    renderDynamic: () => { calls.renders++; },
    today: () => '2026-08-26'
  });
  sb.__calls = calls;
  return sb;
}

test('applyXpDelta mutates xp, recomputes level, returns info, no side I/O', () => {
  const sb = mk({ S: { xp: 350, lv: 2 } });
  const r = sb.window.applyXpDelta(150);
  assert.strictEqual(sb.S.xp, 500);
  assert.strictEqual(r.newLv, 3);
  assert.strictEqual(r.leveledUp, true);
  assert.strictEqual(r.oldLv, 2);
  assert.strictEqual(sb.__calls.saves, 0, 'no implicit save');
  assert.strictEqual(sb.__calls.renders, 0, 'no implicit render');
});

test('negative delta allowed (no clamp) via applyXpDelta', () => {
  const sb = mk({ S: { xp: 10, lv: 2 } });
  sb.window.applyXpDelta(-30);
  assert.strictEqual(sb.S.xp, -20, 'raw primitive does not clamp');
});

test('spendXp clamps at zero like legacy Math.max(0, xp-cost)', () => {
  const sb = mk({ S: { xp: 10, lv: 2 } });
  sb.window.spendXp(30);
  assert.strictEqual(sb.S.xp, 0);
  const sb2 = mk({ S: { xp: 50, lv: 2 } });
  sb2.window.spendXp(30);
  assert.strictEqual(sb2.S.xp, 20);
});

test('saveAndRenderDirty saves once and marks the four standard panels', () => {
  const sb = mk({});
  sb.window.saveAndRenderDirty();
  assert.strictEqual(sb.__calls.saves, 1);
  assert.deepEqual([...sb.__calls.markDirty].sort(), ['lv', 'progress', 'today', 'topbar']);
  assert.strictEqual(sb.__calls.renders, 1);
});
```

If `loadFile`'s default sandbox lacks something xp.js touches at load time (it defines functions only — nothing executes except the IIFE assigning window exports), the overrides above suffice.

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/xp-primitives.test.js`
Expected: FAIL — `applyXpDelta is not a function`.

- [ ] **Step 3: Implement in core/xp.js**

Insert after `checkLevelUp` definition (line ~8):

```js
  function applyXpDelta(delta) {
    var oldLv = S.lv;
    S.xp += delta;
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
    return { oldLv: oldLv, newLv: S.lv, leveledUp: S.lv > oldLv };
  }

  function spendXp(amount) {
    var clamped = Math.max(0, S.xp - amount);
    var delta = clamped - S.xp; // <= 0
    return applyXpDelta(delta);
  }

  function saveAndRenderDirty() {
    saveState();
    markDirty('today'); markDirty('topbar'); markDirty('lv'); markDirty('progress');
    renderDynamic();
  }
```

Exports (bottom block):

```js
  window.applyXpDelta = applyXpDelta;
  window.spendXp = spendXp;
  window.saveAndRenderDirty = saveAndRenderDirty;
```

- [ ] **Step 4: Verify**

Run: `node --check core/xp.js`; `node --test tests/xp-primitives.test.js`; `node --test`
Expected: green; suite 419 passing.

- [ ] **Step 5: Commit**

```bash
git add core/xp.js tests/xp-primitives.test.js
git commit -m "feat: xp primitives applyXpDelta/spendXp/saveAndRenderDirty"
```

---

### Task 2: Migrate the six markDirty-tail sites

**Files:**
- Modify: `core/prayers.js`, `core/quests.js` (toggleQuest only), `core/shop.js` (buy only), `core/actions.js` (claimBonus only)

**Interfaces:**
- Consumes: `applyXpDelta`, `spendXp`, `saveAndRenderDirty` (Task 1 signatures).
- Produces: no new interfaces.

- [ ] **Step 1: Regression safety net (behavioral pin before refactor)**

The existing suites (prayers toggles 14 tests, quests 18, shop 8) ARE the net — confirm they pass BEFORE touching anything:
Run: `node --test tests/prayers.test.js tests/quests.test.js tests/shop.test.js tests/app.test.js`
Expected: PASS. Record counts. If any fail now, STOP and report BLOCKED (refactor would be unsound).

- [ ] **Step 2: migrate toggleP (core/prayers.js:2)**

Replace this exact sequence inside `toggleP`:

OLD:
```js
const w=!!l.p[id]; const oldLv=S.lv; l.p[id]=!w; let xp=pr.xp; if(isFri()&&id==='dhuhr'&&pr.fri) xp=pr.fri.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; if(!w){ S.tp++; S.xp+=xp; if(isFri()&&id==='dhuhr') S.tj=(S.tj||0)+1; playSound('pop'); if(typeof checkSurpriseReward==='function') checkSurpriseReward('prayer'); } else { S.tp=Math.max(0,S.tp-1); S.xp=Math.max(0,S.xp-xp); if(isFri()&&id==='dhuhr') S.tj=Math.max(0,(S.tj||0)-1); } S.lv=lvFrom(S.xp); checkLevelUp(oldLv); recalc(); checkQ(); checkA(); saveState(); markDirty('today'); markDirty('topbar'); markDirty('lv'); markDirty('progress'); renderDynamic();
```

NEW:
```js
const w=!!l.p[id]; l.p[id]=!w; let xp=pr.xp; if(isFri()&&id==='dhuhr'&&pr.fri) xp=pr.fri.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; if(!w){ S.tp++; applyXpDelta(xp); if(isFri()&&id==='dhuhr') S.tj=(S.tj||0)+1; playSound('pop'); if(typeof checkSurpriseReward==='function') checkSurpriseReward('prayer'); } else { S.tp=Math.max(0,S.tp-1); spendXp(xp); if(isFri()&&id==='dhuhr') S.tj=Math.max(0,(S.tj||0)-1); } recalc(); checkQ(); checkA(); saveAndRenderDirty();
```

- [ ] **Step 3: migrate toggleV and toggleD (core/prayers.js:3-4)** — same pattern:

In BOTH, delete `const oldLv=S.lv;`, replace award-branch `S.xp+=xp;` → `applyXpDelta(xp);`, refund-branch `S.xp=Math.max(0,S.xp-xp);` → `spendXp(xp);`, and replace the tail `S.lv=lvFrom(S.xp); checkLevelUp(oldLv); checkQ(); checkA(); saveState(); markDirty('today'); markDirty('topbar'); markDirty('lv'); markDirty('progress'); renderDynamic();` → `checkQ(); checkA(); saveAndRenderDirty();` (toggleV) / `recalc(); checkQ(); checkA(); saveAndRenderDirty();` plus keep its trailing journey-autoTrack call (toggleD).

- [ ] **Step 4: migrate toggleQuest (core/quests.js:17)**

Apply identical transformation: remove `const oldLv=S.lv;`; `±xpVal` branches → `applyXpDelta(xpVal)` / `spendXp(xpVal)`; tail → `saveAndRenderDirty();` preserving any intermediate statements between the old mutation block and the tail (match content).

- [ ] **Step 5: migrate buy (core/shop.js:2)**

Inside `buy`: replace ALL inline `S.xp+=…` mutations (cost deduction uses `S.xp-=cost;` — convert to `spendXp(cost)` ONLY IF cost path had no clamp; verify live code: if it is bare `-=` without Math.max, use `applyXpDelta(-cost)` instead) and mystery-box prize grant → collect into ONE `applyXpDelta(prize)` where the original did `S.xp+=amt` (keep seasonal multiplier arithmetic untouched). Keep single final `S.lv=lvFrom(S.xp);` deletion: replace `S.lv=lvFrom(S.xp); checkLevelUp(oldLv); … saveState(); markDirty×5(incl 'rewards'); renderDynamic();` with `… saveAndRenderDirty(); markDirty('rewards'); renderDynamic();` — i.e., call `saveAndRenderDirty()` FIRST then the extra marks+render? NO — preserve exact original order: extra markDirty('rewards') sat among the five; replicate as `markDirty('rewards');` immediately after `saveAndRenderDirty();` followed by nothing else (renderDynamic inside saveAndRenderDirty already ran after four marks; original ran after five). To stay strictly faithful: instead of saveAndRenderDirty here, write explicit `applyXpDelta(...)` … `saveState(); markDirty('today'); markDirty('topbar'); markDirty('lv'); markDirty('progress'); markDirty('rewards'); renderDynamic();` — five marks preserved verbatim. Document this one-site deviation from saveAndRenderDirty in the report.
Remove `const oldLv=S.lv;`.

- [ ] **Step 6: migrate claimBonus (core/actions.js:307)**

OLD tail: `const b=S.cs>=7?75:30; S.xp+=b; S.lbd=t; S.lv=lvFrom(S.xp); checkLevelUp(oldLv); saveState(); markDirty('today'); markDirty('topbar'); markDirty('lv'); markDirty('progress'); renderDynamic();`
NEW: `const b=S.cs>=7?75:30; applyXpDelta(b); S.lbd=t; saveAndRenderDirty();` (preserve surrounding toast/markDirty('today') specifics — match live content).

- [ ] **Step 7: Verify**

Run: `node --check core/prayers.js; node --check core/quests.js; node --check core/shop.js; node --check core/actions.js` then `node --test tests/prayers.test.js tests/quests.test.js tests/shop.test.js` then FULL `node --test`.
Expected: green, same counts as Step 1 (suite 419).

- [ ] **Step 8: Grep guard**

`rg -n "S\.xp\s*[+\-]=|S\.lv=lvFrom" core/prayers.js core/quests.js core/shop.js` must return ZERO hits (claimBonus lives in actions.js — checked in Task 4 sweep).
Commit:
```bash
git add core/prayers.js core/quests.js core/shop.js core/actions.js
git commit -m "refactor: route toggle/quest/shop/bonus xp flows through xp primitives"
```

---

### Task 3: Migrate dhikr XP flows

**Files:**
- Modify: `core/dhikr.js`

**Interfaces:** Consumes Task 1 primitives. Produces none.

- [ ] **Step 1: Failing-behavior pin for the latent badge-XP smell**

Append to `tests/dhikr-xp.test.js` (reuse ITS harness; it fabricates dhikrSettings already):

```js
test('badge xp participates in the same level recompute as tap xp', () => {
  // arrange: counter one tap away from target; badge threshold reachable this tap
  const sb = /* mirror file's existing builder */;
  sb.S.dhikrCounters = { 0: DHIKR_COUNTER_DATA[0].target - 1 };
  sb.S.dhikrStats = { total:{}, daily:{}, streak:0, bestStreak:0, lastSessionDate:null, badges:[], achievements:[] };
  sb.S.dhikrStats.total[0] = DHIKR_BADGES[0].check ? thresholdValueForFirstBadge() : 0;
  const xpBefore = sb.S.xp;
  sb.window.tapDhikr();
  // target(+20)+tap(+1)+badge(+25): level must reflect ALL of it immediately
  assert.strictEqual(sb.S.lv, sb.window.lvFrom(sb.S.xp));
  assert.ok(sb.S.xp > xpBefore);
});
```

Ask the file itself for the right fixture values (`thresholdValueForFirstBadge` = inspect DHIKR_BADGES[0].check in data files and satisfy it minimally; if impractical, drop the badge-trigger part and pin only `S.lv === lvFrom(S.xp)` after tap — the invariant that matters).
Run: `node --test tests/dhikr-xp.test.js` → record PASS/FAIL (may already pass since caller recomputes; the REAL assertion is the post-refactor invariant).

- [ ] **Step 2: migrate tapDhikr (core/dhikr.js:32-61)**

Replace scattered mutations with accumulation:

OLD shape (lines 39-57):
```js
    S.xp += 1;
    const cycleCount = S.dhikrCounters[idx];
    if (S.dhikrCounters[idx] >= d.target) {
      toast(iqIcon('sparkles'), 'Target reached! SubhanAllah!', false, 2000);
      if (...) navigator.vibrate([50,50,50]);
      S.xp += 20;
      S.dhikrCounters[idx] = 0;
    }
    ...
    checkDhikrBadges();
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
```

NEW:
```js
    let gain = 1;
    const cycleCount = S.dhikrCounters[idx];
    if (S.dhikrCounters[idx] >= d.target) {
      toast(iqIcon('sparkles'), 'Target reached! SubhanAllah!', false, 2000);
      if (S.dhikrSettings && S.dhikrSettings.haptic && navigator.vibrate) { navigator.vibrate([50, 50, 50]); }
      gain += 20;
      S.dhikrCounters[idx] = 0;
    }
    ...
    const badgeGained = checkDhikrBadges();   // see Step 3
    applyXpDelta(gain + (badgeGained ? 25 * badgeGained : 0));
```

Remove `const oldLv = S.lv;` and the standalone `S.lv=lvFrom(S.xp); checkLevelUp(oldLv);`.

- [ ] **Step 3: checkDhikrBadges returns count (core/dhikr.js:62-73)**

Change `S.xp += 25;` inside the unlock branch to increment a local counter; return number of newly unlocked badges (0 default). Keep everything else (toast, badges array) identical.

- [ ] **Step 4: migrate tapSituationalDhikr (core/dhikr.js:131-134)**

OLD: `const oldLv=S.lv; S.xp+=5; S.lv=lvFrom(S.xp); checkLevelUp(oldLv); playSound('pop'); saveState();`
NEW: `applyXpDelta(5); playSound('pop'); saveState();` (keep following render calls).

- [ ] **Step 5: Verify**

Run: `node --check core/dhikr.js`; `node --test tests/dhikr.test.js tests/dhikr-xp.test.js`; FULL `node --test` (green).
Grep: `rg -n "S\.xp" core/dhikr.js` → zero direct mutations remain.
Commit:
```bash
git add core/dhikr.js tests/dhikr-xp.test.js
git commit -m "refactor: dhikr xp flows through applyXpDelta; badges counted"
```

---

### Task 4: Migrate remaining raw sites + repo-wide sweep

**Files (each a small mechanical edit):**
`render/static.js` (toggleFasting ~274, toggleMorning ~321-333, toggleEvening ~359-371), `features/surprise-rewards.js:31`, `features/streak-milestones.js:19`, `features/personal-goals.js:39`, `features/finance.js:43,60`, `features/consistency-bonuses.js:16,21,58`, `features/health.js:88`, `core/actions.js` claimBonus leftovers if any.

**Uniform transformation rule** (apply per site, matching live content):
- Award: `S.xp += N; S.lv = lvFrom(S.xp); checkLevelUp(oldLv);` → `applyXpDelta(N);` and delete the site's `const oldLv = S.lv;`.
- Refund-with-clamp: `S.xp = Math.max(0, S.xp - N); S.lv = lvFrom(S.xp); checkLevelUp(oldLv);` → `spendXp(N);`.
- Bare refund (no clamp, e.g., finance removeEntry `S.xp -= xp` if unclamped) → `applyXpDelta(-N);` (verify live: if clamped, use spendXp).
- Sites lacking `const oldLv` (e.g., consistency-bonuses branches, health) just swap the mutation trio.
- health.js:88 has NO saveState by design — keep it that way; callers save.
- toggleMorning/toggleEvening keep their `renderAll()` calls untouched (Phase 3 concern).

- [ ] **Step 1: Sweep + verify zero stragglers**

After all edits: `rg -n "S\.x[pP]\s*\+=|S\.xp\s*-=|S\.x p|S\.lv=lvFrom\(S\.xp\)" --glob '!core/xp.js' --glob '!state/**' --glob '!tests/**' .` must return ZERO production hits (state/state.js lvFrom definition and xp.js excluded).
Run: `node --check` on every touched file; FULL `node --test` (green).
- [ ] **Step 2: Commit**

```bash
git add render/static.js features/surprise-rewards.js features/streak-milestones.js features/personal-goals.js features/finance.js features/consistency-bonuses.js features/health.js core/actions.js
git commit -m "refactor: remaining xp mutations routed through xp primitives"
```

---

### Task 5: Fail-loud facade

**Files:**
- Modify: `core/actions.js` (appAction def ~691, App literal ~697-736)
- Modify: `tests/app-registry.test.js`

- [ ] **Step 1: Failing test**

Append to tests/app-registry.test.js (mirror its harness):

```js
test('facade has no silent no-op stubs', () => {
  const src = require('fs').readFileSync(path.join(__dirname, '..', 'core', 'actions.js'), 'utf8');
  const facadeIdx = src.indexOf('window.App = {');
  const facadeEnd = src.indexOf('};', facadeIdx);
  const facade = src.slice(facadeIdx, facadeEnd);
  assert.ok(!/\(\)\s*=>\s*\{\}/.test(facade), 'no-op arrow stubs found in App facade');
});

test('appAction warns loudly when target missing', () => {
  // build minimal sandbox exposing appAction via a load of actions.js OR extract:
  // simplest: reuse the registry harness; call window.App.tapDhikr() BEFORE the
  // feature script exists in sandbox -> expect console.warn captured.
});
```

Implement the second test concretely within the file's existing harness conventions (its sandbox already boots actions.js; delete `window.tapDhikr` post-boot, attach console.warn spy, call `App.tapDhikr()`, assert warn mentions 'tapDhikr'). Write it for real — no meta-pseudocode.

- [ ] **Step 2: Run → FAIL** (stubs present; no warn emitted).

- [ ] **Step 3: Implement**

appAction gains the warn (exact code in spec §2). Replace each of the 17 `typeof window.X === 'function' ? window.X : () => {}` entries with `appAction('X')` — the 17 names are enumerated in spec §Problem-2. Leave `toggleAvatarPicker` toast placeholder untouched.

- [ ] **Step 4: Verify** — node --check actions.js; targeted + FULL suite green (419→421).
- [ ] **Step 5: Commit** `git commit -m "refactor: fail-loud app facade via appAction everywhere"`

---

### Task 6: openToastModal + migrate five show-trios

**Files:**
- Modify: `core/actions.js` (add helper near closeToastOverlay), `features/daily-summary.js`, `features/daily-ritual.js`, `features/streak-milestones.js` (showWeeklySummary + recovery/undo sites are in actions.js itself)
- Test: extend `tests/daily-summary.test.js` harness assertions (show-trio still applied)

- [ ] **Step 1: helper** (place directly above closeToastOverlay):

```js
  function openToastModal(html) {
    var ov = document.getElementById('toastOverlay');
    if (!ov) return null;
    window._modalTriggerEl = document.activeElement;
    ov.innerHTML = html;
    ov.style.display = 'flex';
    ov.classList.add('show');
    ov.style.pointerEvents = 'auto';
    return ov;
  }
  window.openToastModal = openToastModal;
```

- [ ] **Step 2: migrate** each site: replace its innerHTML+trio block with `openToastModal(<same html>)` (keep subsequent state-stamp/save lines). daily-summary/streak-milestones close via global closeToastOverlay already — unchanged. daily-ritual's private hide (classList.remove + setTimeout display-none + pointerEvents-none at ~59-64) → replace with `closeToastOverlay();` (matches siblings; focus-restore bonus).
showRecoveryModal/showUndoImportBar in actions.js: replace their trio blocks with `var ov = openToastModal(html); if (!ov) return;` keeping listener attachment on returned ov.

- [ ] **Step 3: Verify** — node --check ×4 files; daily-summary/daily-ritual/milestone suites; FULL suite. Commit `refactor: single openToastModal helper for overlay show-trio`.

---

### Task 7: Modal queue without polling

**Files:**
- Modify: `core/actions.js` (runModalQueue block ~584-606, closeToastOverlay ~464)
- Modify: `features/daily-summary.js`, `features/daily-ritual.js`, `features/streak-milestones.js` (accept onDone)

- [ ] **Step 1: contract** — each of the three functions gets signature `(onDone)`; store `window._iqModalDone = typeof onDone === 'function' ? onDone : null;` at show time (BEFORE openToastModal), and clear it when closed.
- [ ] **Step 2: closeToastOverlay** — after its existing teardown, add:
```js
    if (typeof window._iqModalDone === 'function') { var cb = window._iqModalDone; window._iqModalDone = null; setTimeout(cb, 300); }
```
(300 ms preserves the original inter-modal gap.)
- [ ] **Step 3: queue** rewrite:
```js
    var modalQueue = [];
    if (window.showWeeklySummary) modalQueue.push(window.showWeeklySummary);
    if (window.showDailySummary) modalQueue.push(window.showDailySummary);
    if (window.showDailyRitual) modalQueue.push(window.showDailyRitual);
    var queueTimer = null;
    function runNextModal() {
      if (!modalQueue.length) return;
      var fn = modalQueue.shift();
      try { fn(runNextModal); } catch (e) { console.error('modal queue step failed:', e); runNextModal(); }
      clearTimeout(queueTimer);
      queueTimer = setTimeout(function() { window._iqModalDone = null; runNextModal(); }, 10000);
    }
    runNextModal();
```
- [ ] **Step 4: tests** — extend tests/daily-summary.test.js: calling showDailySummary(cb) then closeToastOverlay() invokes cb after ~300 ms (use real timer + 400 ms wait, or expose fake timers if harness supports; prefer real setTimeout with await sleep(400)).
Also mid-session safety: initApp's day-roll inline consumption unaffected (Task 7 territory of Phase 1 stays intact).
- [ ] **Step 5: Verify** — node --check ×4; targeted modal suites; FULL suite; manual smoke note (three modals sequential) recorded as owed-QA.
Commit `refactor: callback-driven boot modal queue replaces dom polling`.

---

### Task 8: weightedPick util

**Files:**
- Create: `core/random.js`
- Modify: `index.html` (tag before core/shop.js?v=), `core/shop.js`, `features/surprise-rewards.js`
- Create: `tests/random.test.js`

- [ ] **Step 1: failing tests**
```js
test('weightedPick respects weights deterministically under stubbed Math.random', () => {
  const sb = loadFile(path.join(__dirname,'..','core','random.js'),{ Math: Object.assign(Math,{random:()=>0.0}) , window:{}});
  // random=0 → first entry always
  assert.strictEqual(sb.window.weightedPick([{id:'a',weight:1},{id:'b',weight:9}]).id,'a');
});
test('weightedPick lands in later bucket proportionally', () => {
  const sb = loadFile(path.join(__dirname,'..','core','random.js'),{ window:{} });
  const orig=Math.random; Math.random=()=>0.95; // past a(1)/total(10) → b
  const pick=sb.window.weightedPick([{id:'a',weight:1},{id:'b',weight:9}]);
  Math.random=orig;
  assert.strictEqual(pick.id,'b');
});
```
(Note: loadFile sandbox lacks global Math override path — instead pass `randomStub` via sandbox.Math assignment as shown; verify harness accepts overriding Math, else set `sandbox.Math.random` after load via sb.Math.random=… since module closes over global Math. Adapt to what works; both tests must genuinely exercise bucket boundaries.)

- [ ] **Step 2: implement core/random.js** — exact code in spec §5 (weightedPick + window export).
- [ ] **Step 3: index.html** — insert `<script src="core/random.js?v=1"></script>` immediately BEFORE `<script src="core/shop.js?v=1">`.
- [ ] **Step 4: migrate both call sites** — replace each pool-reduce/roll/subtract loop with `var chosen = weightedPick(pool);` (keep pool arrays + reward handling + seasonal mult verbatim).
- [ ] **Step 5: Verify** — checks; shop/surprise suites; FULL suite. Commit `refactor: shared weightedPick for shop and surprise rewards`.

---

### Task 9: Date-key consolidation + UTC bug fix

**Files:**
- Modify: `state/state.js` (add yesterdayKey export near today), `features/journeys.js` (~56 walk-back), `features/muhasabah.js` (~6 fmt), `features/finance.js` (~113 builder), `widgets/streak-calendar.js` (~13 builder), `core/dhikr.js` (~15 yesterdayStr), `features/streak-milestones.js` (~32 UTC BUG)
- Create: `tests/date-keys.test.js` (incl. timezone regression)

- [ ] **Step 1: failing regression test FIRST**
```js
test('milestone keys follow LOCAL date, not UTC (UTC+6 scenario)', () => {
  // Pin via injected clock: streak-milestones computes key from new Date().
  // Harness: load streak-milestones.js with overridden Date returning
  // 2026-08-14T20:00:00Z (= 2026-08-15 02:00 UTC+6).
  const FixedDate = class extends Date { constructor(...a){ if(a.length===0){ super(1786708800000); } else { super(...a);} } }; // careful: compute ms for 2026-08-14T20:00Z in-test
  // assert milestone key === '2026-08-15'
});
```
Write it concretely against the file's real harness (it builds sandboxes with Date overridable via loadFile overrides — pass `Date: FixedDate`). Compute the epoch ms INSIDE the test using `new Date(Date.UTC(2026,7,14,20,0,0)).getTime()` so no magic constant. Assert `sandbox` produced key `'2026-08-15'` (current code produces `'2026-08-14'` → RED).
- [ ] **Step 2: yesterdayKey in state/state.js**
```js
  function yesterdayKey(){ var d=new Date(); d.setDate(d.getDate()-1); return today(d); }
```
export `window.yesterdayKey = yesterdayKey;` beside other exports.
- [ ] **Step 3: migrations** — replace each independent builder with canonical calls:
  - muhasabah fmt(d) → `today(d)`
  - finance ~113 builder → `today(new Date(y,m,d))` equivalent (preserve intent: it builds a specific day key)
  - widgets/streak-calendar builder → `today(new Date(y,m-1,d))` (widget file loads standalone in widget hosts — ALSO safe: add local fallback `var todayFn = (typeof today==='function')?today:function(d){...same impl...}` ONLY if widget context lacks state.js; check widgets/*.js load context and note decision in report)
  - dhikr yesterdayStr → `yesterdayKey()` (state.js loads before dhikr.js in index.html — confirmed)
  - journeys walk-back → `today(ck)` where ck already mutated (verify loop already does this or adapt minimally)
  - streak-milestones:32 → `today()` (THE FIX; makes Step-1 test GREEN)
- [ ] **Step 4: Verify** — checks; affected suites (journeys/muhasabah/finance/milestones/dhikr/widgets); FULL suite (≥424 incl. new tz + date tests). Commit `fix+refactor: local-time date keys everywhere; canonical yesterdayKey`.

---

### Task 10: escapeHTML consolidation

**Files:**
- Modify: `features/health.js:3`, `features/personal-goals.js:3`, `features/search.js:3`, `render/prayers.js:137`, `render/dynamic.js:292,302`, plus affected TEST harnesses.

- [ ] **Step 1: production edits** — replace each guarded fallback body with `return escapeHTML(value);` (delete private impl; KEEP the local function name to minimize diff: `function safeText(v){ return escapeHTML(v); }` — or inline-call escapeHTML directly at call sites if the wrapper becomes trivial; choose whichever yields smaller diff and note it). dynamic.js two inline regexes → `escapeHTML(String(S.avatar || ''))` / `escapeHTML(currentUser === 'default' ? 'Guest' : currentUser)` preserving surrounding template.
- [ ] **Step 2: harness injection** — for each test file loading health/personal-goals/search/prayers/dynamic standalone, add `escapeHTML: v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))` to the loadFile overrides (grep tests/ for those modules to find every loader).
- [ ] **Step 3: guard test** — append to tests/html.test.js? No — better structural: add to tests/app-registry.test.js source scan asserting `rg "replace\(/\[&<>\"'\]/g"` has zero hits in render/features outside static.js:
```js
test('escape logic defined only in render/static.js', () => {
  const files=['render/dynamic.js','render/prayers.js','features/health.js','features/personal-goals.js','features/search.js'];
  for(const f of files){
    const src=require('fs').readFileSync(path.join(__dirname,'..',f),'utf8');
    assert.ok(!/replace\(\/\[\&<>"'\]\//.test(src), f+' still hand-rolls escaping');
  }
});
```
- [ ] **Step 4: Verify** — FULL suite green; grep clean. Commit `refactor: single escapeHTML everywhere`.

---

### Task 11: Test-gap closures

**Files:**
- Create: `tests/analytics-core.test.js`, `tests/dashboard-core.test.js`, `tests/compact-logs.test.js`, `tests/hijri.test.js`

- [ ] **Step 1: analytics stats** — read analytics/analytics.js; write tests for its exported pure computations with small fixtures (compute-from-log helpers: prayer consistency %, deed totals, weekday patterns — name actual exports found in file). Mirror loadFile harness; stub Chart-dependent imports away if module references them lazily (analytics.js should be chart-free per architecture; if not, test only the pure fns).
- [ ] **Step 2: dashboard.js pure helpers** — same approach for its non-DOM functions (skip renderInsights).
- [ ] **Step 3: compactLogs**
```js
test('compactLogs prunes >365d entries and archives perfect days', () => {
  // seed S.log with: 3 old days (2 perfect) beyond cutoff + 2 recent days (1 perfect)
  // force trigger condition: compactLogs runs unconditionally in unit context —
  // it prunes strictly older than 365d regardless of count (trigger gating lives in actions.js)
  // assert: old keys gone; S.pdArchived incremented by 2; recent retained; saveState called once
});
```
Load state/state.js with controllable Date (override sandbox Date so cutoff math deterministic: fix "now" to 2026-08-26).
- [ ] **Step 4: hijri round-trip**
```js
test('gregorianToHijri and hijriToGregorian round-trip within ±1 day', () => {
  const cal = loadFile(path.join(__dirname,'..','render','calendar.js'), { document: fakeDocMinimal(), window: {} });
  for (const [y,m,d] of [[2024,3,11],[2025,1,1],[2026,8,26],[1999,12,31],[2030,6,15]]) {
    const h = cal.window.gregorianToHijri(y,m,d);
    const g = cal.window.hijriToGregorian(h.year,h.month,h.day);
    const jd = a=>Math.floor(Date.UTC(a.y??a.gY||a[0],0)); // simpler: compare via Date.UTC triplets below
    const dt1 = Date.UTC(y, m-1, d), dt2 = Date.UTC(g.y ?? g.gY ?? g.year_g, g.m ?? 0, 0); // REPLACE with real field names from calendar.js hijriToGregorian return
    // calendar.js returns object — READ its return shape during implementation and compare day-delta ≤1
  }
});
```
CONCRETE requirement: open render/calendar.js, read hijriToGregorian's actual return fields (likely `{y,m,d}` or `{year,month,day}`), and write the comparison with real names + a 5-sample loop allowing |Δdays| ≤ 1 (algorithm rounding tolerance). No pseudo-code in final test.
Optionally switch tests/seasonal.test.js's copied inverse to use cal.window.hijriToGregorian (one-line improvement; do it if trivial).
- [ ] **Step 5: Verify** — FULL suite (expect ≥440). Commit `test: analytics/dashboard/compactLogs/hijri coverage`.

---

### Task 12: Cache bumps + final sweep

**Files:**
- Modify: `index.html` (?v= bumps for every touched asset that HAS a version param: core/xp.js, core/actions.js, core/dhikr.js, core/quests.js, core/shop.js, core/prayers.js, render/static.js, render/dynamic.js, render/prayers.js, features/{daily-summary,daily-ritual,streak-milestones,surprise-rewards,personal-goals,health,search,finance,journeys,muhasabah,consistency-bonuses}.js — GREP current values, increment each), `sw.js` CACHE_NAME → next version, update any pinned versions in tests/html.test.js (grep main.css/sw.js pins pattern learned in Phase 1)
- New assets core/random.js already carries ?v=1.

- [ ] **Step 1: bump table** — grep-driven, list every change in report.
- [ ] **Step 2: node --check all touched JS; FULL suite green (≥440).**
- [ ] **Step 3: manual QA owed-list recorded**: boot modal sequence once/day; shop mystery box; morning/evening toggles render; profile page escaping (avatar/name with `<>&"'` chars via usernameInput).
- [ ] **Step 4: Commit sweep** — single `chore: phase2 cache bumps` commit; git status shows ONLY the two untouchable dirty files.
- [ ] **Step 5: Push branch** `git push -u origin phase2-code-health` (PR creation handled at finish, targeting phase1-correctness-data-safety).

---

## Self-Review

1. **Spec coverage:** §1→Tasks 1-4 · §2→Task 5 · §3→Task 6 · §4→Task 7 · §5→Task 8 · §6→Task 9 · §7→Task 10 · §8→Task 11 · constraints/caches→Task 12. Complete.
2. **Placeholder scan:** Task 11 Steps 1-2 and 4 intentionally instruct reading target modules for real export names/return shapes — bounded and concrete (file named, purpose named, tolerance specified), not open-ended. Task 2 Step 5 documents the buy-site deviation explicitly rather than hiding it. Task 3 Step 1 offers a concrete fallback assertion if badge fixtures prove impractical. Acceptable per no-placeholder rule (engineer knows exactly what to do and what to verify).
3. **Type consistency:** applyXpDelta/spendXp/saveAndRenderDirty names identical across Tasks 1-4; openToastModal/closeToastOverlay across 6-7; weightedPick across 8; today/yesterdayKey across 9; escapeHTML across 10.
