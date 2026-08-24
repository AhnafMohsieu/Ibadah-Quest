# Data Layer Upgrade — Design Spec

## Problem

The app stores its entire state as a single JSON blob in one localStorage key per user. This has real limits:
- localStorage caps at ~5MB (browser-dependent) — with 400+ daily log entries, this gets tight
- The entire blob is serialized/deserialized on every save — `saveState()` is called ~76 times across the codebase
- No structure — logs, settings, preferences, and counts all live in one object
- No cross-device sync path (localStorage is origin-bound, device-bound)
- `compactLogs()` is a crude 365-day pruning that loses granular data

## Goal

Replace localStorage as the primary storage engine with IndexedDB (via a thin wrapper, no external library). Keep localStorage as a read-only fallback for existing users during migration. Preserve the global `S` singleton pattern — no reactive rewrite.

## Architecture

### Storage Layer

Introduce `core/storage.js` — a thin async abstraction over IndexedDB:

```
Storage
├── init()           → open DB, run migrations
├── load(user)       → return full state object (falls back to localStorage if IDB empty)
├── save(user, S)    → write state to IDB
├── migrate(user)    → read localStorage → write to IDB → mark migrated
├── exportAll()      → all users' data as JSON
├── importAll(data)  → bulk restore from JSON
└── destroy(user)    → delete user's IDB store
```

IndexedDB database: `ibadah-quest`, object store: `state`, key: `user`.

### Migration Strategy

On first load after upgrade:
1. Check if IDB has data for this user → if yes, use it
2. If IDB is empty but localStorage has data → run `migrate()`: copy localStorage to IDB, keep localStorage untouched (fallback)
3. After migration, `saveState()` writes to IDB (and optionally localStorage for backward compat)
4. A `migrationComplete` flag in IDB tracks who's been migrated

### State Decomposition (future, not this PR)

The single blob stays for now. This PR only changes *where* it's stored, not how it's structured. Future work can split `S` into object stores (logs, settings, progress) if needed.

### Files

| File | Responsibility |
|------|---------------|
| `core/storage.js` | IndexedDB init, load, save, migrate, export, import, destroy |
| `state/state.js` | Modified: calls `Storage.load()` / `Storage.save()` instead of direct localStorage |
| `core/actions.js` | Modified: export/import use `Storage.exportAll()` / `Storage.importAll()` |
| `core/themes.js` | Unchanged — theme localStorage key stays as-is (needed pre-load) |
| `tests/storage.test.js` | New: unit tests for all Storage methods |
| `tests/state.test.js` | Modified: mock Storage instead of localStorage |

### Constraints

- No external libraries — raw IndexedDB API
- Async storage, but `S` stays synchronous (loaded once at init, saved on each action)
- `saveState()` must remain callable from anywhere (it's a global)
- `freshState()` shape is unchanged
- Tests must continue to pass with mocked storage
- localStorage keys outside the main blob (`iqTheme`, `iq9_prayer_times`, etc.) are NOT migrated — they stay as localStorage

### Not In Scope

- Reactive/subscription pattern on `S`
- State decomposition into multiple object stores
- Cloud sync or multi-device
- Changing the `freshState()` shape or adding version fields
