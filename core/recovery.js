// core/recovery.js — corruption detection, quarantine, salvage.
(function() {
  var QUARANTINE_PREFIX = 'iq9_quarantine_';
  var MAX_QUARANTINES = 3;

  function isJunkState(v) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return true;
    return !('log' in v) && !('xp' in v) && !('schemaVersion' in v);
  }

  function lsNow(override) {
    if (override) return override;
    try { return (typeof window !== 'undefined' && window.localStorage) ||
                 (typeof localStorage !== 'undefined' ? localStorage : null); }
    catch (e) { return null; }
  }

  function pruneQuarantines(user, ls) {
    var keys = [];
    for (var i = 0; i < ls.length; i++) {
      var k = ls.key(i);
      if (k && k.indexOf(QUARANTINE_PREFIX + user + '_') === 0) keys.push(k);
    }
    keys.sort(); // ISO timestamps sort chronologically
    while (keys.length > MAX_QUARANTINES) ls.removeItem(keys.shift());
  }

  var _usedStamps = {};
  function quarantine(user, raw, lsOverride) {
    var ls = lsNow(lsOverride);
    var stamp = new Date().toISOString().replace(/[:.]/g, '-');
    var key = QUARANTINE_PREFIX + user + '_' + stamp;
    // Guarantee uniqueness even for same-ms double-quarantines (ls + idb in one boot).
    // Never reuse a bare stamp freed by pruning: a reused bare key sorts BEFORE its
    // suffixed siblings, so prune would evict the newest entry instead of the oldest.
    var suffix = 0;
    while (ls && (ls.getItem(key) !== null || _usedStamps[key])) key = QUARANTINE_PREFIX + user + '_' + stamp + '_' + (++suffix);
    _usedStamps[key] = 1;
    var payload = typeof raw === 'string' ? raw : JSON.stringify(raw);
    if (ls) {
      try { ls.setItem(key, payload); pruneQuarantines(user, ls); }
      catch (e) { console.warn('quarantine LS write failed:', e); }
    }
    try {
      if (typeof window !== 'undefined' && window.Storage && window.Storage.saveRaw) {
        window.Storage.saveRaw(key, payload).catch(function() {});
      }
    } catch (e) {}
    return key;
  }

  function salvageInto(fresh, raw) {
    var parsed = null;
    try { parsed = typeof raw === 'string' ? JSON.parse(raw) : raw; }
    catch (e) { return null; }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    Object.keys(parsed).forEach(function(k) {
      // Own-property check: `'k in fresh'` would match inherited keys like
      // __proto__ and let a payload reassign the template's prototype.
      if (!Object.prototype.hasOwnProperty.call(fresh, k)) return;
      var fv = fresh[k], pv = parsed[k];
      if (Array.isArray(fv)) { if (Array.isArray(pv)) fresh[k] = pv; return; }
      if (fv && typeof fv === 'object') {
        if (pv && typeof pv === 'object' && !Array.isArray(pv)) fresh[k] = pv;
        return;
      }
      if (typeof pv === typeof fv) fresh[k] = pv;
    });
    return fresh;
  }

  var FRESH_TOKEN = 'RESET';

  function decideBootRoute(win) {
    return (win && win.__iqCorruption) ? 'recovery' : 'normal';
  }

  function freshStartAllowed(input, token) {
    return typeof input === 'string' && input.trim() === (token || FRESH_TOKEN);
  }

  function buildRecoveryHtml(info) {
    var src = info && info.source === 'idb' ? 'device storage (IndexedDB)' : 'browser storage (localStorage)';
    var btnBase = 'padding:12px 16px;border-radius:10px;font-size:1rem;cursor:pointer;border:1px solid #d1d5db;background:#fff;';
    return '<div class="recovery-box" role="alertdialog" aria-modal="true" aria-label="Data recovery">' +
      '<div style="font-size:2rem;">🛟</div>' +
      '<h2>Your saved data looks corrupted</h2>' +
      '<p>A copy of the damaged data was saved safely (quarantine). Nothing has been deleted.</p>' +
      '<p class="recovery-src">Source: ' + src + '</p>' +
      '<div class="recovery-actions">' +
      '<button class="btn btn-primary" style="' + btnBase + '" data-action="salvage">Try to recover my data</button>' +
      '<button class="btn" style="' + btnBase + '" data-action="import">Restore from backup file</button>' +
      '<button class="btn btn-danger" style="' + btnBase + 'color:#b91c1c;border-color:#fca5a5;" data-action="fresh">Start fresh</button>' +
      '</div></div>';
  }

  window.Recovery = {
    isJunkState: isJunkState,
    quarantine: quarantine,
    salvageInto: salvageInto,
    FRESH_TOKEN: FRESH_TOKEN,
    decideBootRoute: decideBootRoute,
    freshStartAllowed: freshStartAllowed,
    buildRecoveryHtml: buildRecoveryHtml
  };
})();
