// src/core/storage.js
import { normalizeState } from './state.js';
export const PREFIX = 'iq9_user_';
export const ACTIVE_KEY = 'iq9_active_user';

function activeUser() {
  try { return localStorage.getItem(ACTIVE_KEY); } catch { return null; }
}

export function loadState(user) {
  const u = user || activeUser() || 'default';
  try {
    const raw = localStorage.getItem(PREFIX + u);
    return normalizeState(raw ? JSON.parse(raw) : null);
  } catch {
    return normalizeState(null);
  }
}

export function saveState(user, S) {
  const u = user || activeUser() || 'default';
  try { localStorage.setItem(PREFIX + u, JSON.stringify(S)); } catch { /* quota — recovery handles */ }
}
