// src/core/state.js
export const STATE_SCHEMA_VERSION = 2;
export const PREFIX = 'iq9_user_';

export function freshState(todayKey) {
  return {
    log: { [todayKey]: { p: {}, d: {}, v: {} } },
    xp: 0, lv: 1,
    xpDaily: {}, combos: {}, milestones: [],
    personalGoals: [],
    seasonal: { active: null, ramadanQuests: [], hajjDays: 0, eidRewards: [], arafahDone: false },
    schemaVersion: STATE_SCHEMA_VERSION, bookmarks: []
  };
}

export function migrateState(p, fromVersion) {
  const version = fromVersion || Number(p.schemaVersion) || 1;
  if (version < 2 && p.log && typeof p.log === 'object') {
    for (const dk of Object.keys(p.log)) {
      const entry = p.log[dk];
      if (entry && entry.p && entry.p.Fajr && !entry.p.fajr) entry.p.fajr = entry.p.Fajr;
      if (entry && entry.p && entry.p.Fajr) delete entry.p.Fajr;
    }
  }
  p.schemaVersion = STATE_SCHEMA_VERSION;
  return p;
}

export function normalizeState(value) {
  const d = freshState('1970-01-01');
  const p = value && typeof value === 'object' ? value : d;
  const sourceVersion = Number(p.schemaVersion) || 1;
  for (const k of Object.keys(d)) { if (!(k in p)) p[k] = d[k]; }
  return migrateState(p, sourceVersion);
}
