// src/core/storage.js
import { normalizeState } from './state.js';
import { Recovery } from './recovery.js';
import { save as idbSave } from './idb.js';
export const PREFIX = 'iq9_user_';
export const ACTIVE_KEY = 'iq9_active_user';

function activeUser() {
  try { return localStorage.getItem(ACTIVE_KEY); } catch { return null; }
}

// Mirrors legacy loadLocalState: unparseable payloads, literal "null", and
// junk states are quarantined before any overwrite. First run (no key) and
// storage-throw paths stay fresh-only — they are not corruption.
export function loadState(user) {
  const u = user || activeUser() || 'default';
  let raw = null;
  try {
    raw = localStorage.getItem(PREFIX + u);
  } catch {
    return normalizeState(null);
  }
  if (raw == null) return normalizeState(null); // first run, not corruption
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    try { Recovery.quarantine(u, raw); } catch { /* best-effort only */ }
    return normalizeState(null);
  }
  if (parsed === null || Recovery.isJunkState(parsed)) {
    try { Recovery.quarantine(u, raw); } catch { /* best-effort only */ }
    return normalizeState(null);
  }
  return normalizeState(parsed);
}

export function saveState(user, S) {
  const u = user || activeUser() || 'default';
  try { localStorage.setItem(PREFIX + u, JSON.stringify(S)); } catch { /* quota — recovery handles */ }
  // Best-effort IndexedDB mirror (same database the legacy track uses).
  // Fire-and-forget: never blocks, never throws, no-ops where IDB is absent.
  try {
    const r = idbSave(u, S);
    if (r && typeof r.catch === 'function') r.catch(() => {});
  } catch { /* mirror is advisory only */ }
}
