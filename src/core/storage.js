// src/core/storage.js
import { normalizeState } from './state.js';
import { Recovery } from './recovery.js';
export const PREFIX = 'iq9_user_';
export const ACTIVE_KEY = 'iq9_active_user';

function activeUser() {
  try { return localStorage.getItem(ACTIVE_KEY); } catch { return null; }
}

export function loadState(user) {
  const u = user || activeUser() || 'default';
  let raw = null;
  try {
    raw = localStorage.getItem(PREFIX + u);
  } catch {
    return normalizeState(null);
  }
  if (raw == null) return normalizeState(null); // first run, not corruption
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    // Mirrors legacy state/state.js loadLocalState: quarantine unparseable
    // payload via Recovery.quarantine(user, raw) before any overwrite.
    try { Recovery.quarantine(u, raw); } catch { /* best-effort only */ }
    return normalizeState(null);
  }
}

export function saveState(user, S) {
  const u = user || activeUser() || 'default';
  try { localStorage.setItem(PREFIX + u, JSON.stringify(S)); } catch { /* quota — recovery handles */ }
}
