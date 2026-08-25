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

  function quarantine(user, raw, lsOverride) {
    var ls = lsNow(lsOverride);
    var stamp = new Date().toISOString().replace(/[:.]/g, '-');
    var key = QUARANTINE_PREFIX + user + '_' + stamp;
    // Guarantee uniqueness even for same-ms double-quarantines (ls + idb in one boot).
    var suffix = 0;
    while (ls && ls.getItem(key) !== null) key = QUARANTINE_PREFIX + user + '_' + stamp + '_' + (++suffix);
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
      if (!(k in fresh)) return;
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

  window.Recovery = { isJunkState: isJunkState, quarantine: quarantine, salvageInto: salvageInto };
})();
