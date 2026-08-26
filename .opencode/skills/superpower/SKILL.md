---
name: superpower
description: Apply the Superpowers methodology for this repo — spec-first design, executable checkbox plans, subagent-driven implementation, and the verification doctrine. Invoke for any non-trivial feature, refactor, or cross-cutting change (anything touching more than one module, state schema, tabs, caching, or the save path). Corresponds to the docs/superpowers workflow already in this repo.
---

# Superpower

Superpowers are the discipline that turns "a change" into "a change that is safe to make, reviewed, and verified." This repo already runs a phased improvement program under `docs/superpowers/` — this skill makes that workflow standard for every non-trivial task.

## The loop (always run it)

1. **Spec first.** Before code, write a design doc under `docs/superpowers/specs/`:
   - Problem verified against current code (read + `git grep`, not memory).
   - Goal with concrete, testable success criteria.
   - Design with exact interfaces, file list, and the intended behavior change.
   - Constraints: zero-behavior-change limits, cache discipline, never-commit files.
   - Risks table (risk → mitigation).
2. **Plan after spec.** Write an executable plan under `docs/superpowers/plans/`:
   - Task-by-task with exact files, interfaces, checkbox steps for agentic workers.
   - Global constraints repeated near the top.
   - Every step ends in "verify suite green".
3. **Implement one task at a time.** Use the plan's checkbox syntax. After each task:
   - `node --test` full suite green.
   - `node --check` on every touched JS file.
   - Bump cache (`?v=` + `CACHE_NAME` + pinned tests) for any changed asset.
4. **Verify, then claim done.** Never report "working" without command output. If you cannot verify a behavior headlessly, list the manual QA item explicitly as owed.

## Hard rules in this repo (from AGENTS.md, do not violate)

- Never stage or commit `data/hadith-collections.js` or `opencode.json`.
- New tab = 4 touchpoints (tab-groups.js entry, index.html panel, tabs.js `_lazyRender`, exported renderer).
- New state field goes in `freshState()` in `state/state.js`.
- Escape user input on render (`escapeHTML`); never trust strings from `S`.
- Test command is exactly `node --test` from repo root. Enforce reset.
- Don't introduce DOM polling back into the boot modal queue (it is callback-driven now).

## Executing plans

When implementing a plan file, follow its checkbox steps in order; mark `- [x]` as you complete each. If live code differs from what the plan assumed (beyond whitespace), STOP and report BLOCKED — do not improvise past a migration step. Re-read any inline "the sequence" it lists and match it exactly.

## Verifying sub-agent work

For larger plans prefer subagent-driven development: spawn focused agents per task with the exact file list, have each report pass counts and syntax results, then run the full suite yourself before committing progress.

Where realism requires judgment (e.g. "read the module for real export names"), the plan states the file, the purpose, and the tolerance so an engineer knows exactly what to do and what to verify — never leave open-ended pseudo-steps.

## Voice

Confident, structured, evidence-first. Answer lives in the plan output and test output, not adjectives.