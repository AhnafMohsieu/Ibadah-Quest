// core/backup.js — pure export/import utilities (v2.1 format).
(function() {
  var USER_PREFIX = 'iq9_user_';

  function stableStringify(v) {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
    var keys = Object.keys(v).sort();
    return '{' + keys.map(function(k) {
      return JSON.stringify(k) + ':' + stableStringify(v[k]);
    }).join(',') + '}';
  }

  function checksum(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  function buildExport(payload) {
    var out = {};
    Object.keys(payload).forEach(function(k) { out[k] = payload[k]; });
    out._exported = new Date().toISOString();
    out._version = '2.1';
    out._appVersion = 'phase1';
    var clone = {};
    Object.keys(out).forEach(function(k) { clone[k] = out[k]; });
    out._checksum = checksum(stableStringify(clone));
    return out;
  }

  function validateBackup(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, error: 'Backup is not a valid file (expected a JSON object).' };
    }
    var hasUser = Object.keys(data).some(function(k) { return k.indexOf(USER_PREFIX) === 0; })
      || data.iq9_active_user !== undefined;
    if (!hasUser) return { ok: false, error: 'File has no user data.' };
    var version = String(data._version || '');
    if (['1.0', '2.0', '2.1'].indexOf(version) === -1) {
      return { ok: false, error: 'Unknown backup version: ' + (version || 'missing') + '.' };
    }
    if (version === '2.1') {
      var clone = {};
      Object.keys(data).forEach(function(k) { if (k !== '_checksum') clone[k] = data[k]; });
      if (checksum(stableStringify(clone)) !== data._checksum) {
        return { ok: false, error: 'Checksum mismatch — file is damaged or was edited.' };
      }
    }
    return { ok: true };
  }

  function snapshotBeforeImport(ls, idbExport) {
    try {
      var prev = ls.getItem('iq9_preimport_1');
      if (prev !== null) ls.setItem('iq9_preimport_2', prev);
      // Capture EVERY profile key (multi-profile safety) plus theme/zakat
      // inputs and the active-user pointer.
      var wanted = { 'iq9_active_user': true, 'iqTheme': true, 'iq_zakat_inputs': true };
      var keys = {};
      for (var i = 0; i < ls.length; i++) {
        var k = ls.key(i);
        if (!k) continue;
        if (k.indexOf(USER_PREFIX) === 0 || wanted[k]) {
          var v = ls.getItem(k);
          if (v !== null) keys[k] = v;
        }
      }
      ls.setItem('iq9_preimport_1', JSON.stringify({ at: new Date().toISOString(), keys: keys, idb: idbExport || null }));
    } catch (e) { console.warn('pre-import snapshot failed:', e); }
  }

  function readSnapshot(ls) {
    try {
      var raw = ls.getItem('iq9_preimport_1');
      if (!raw) return null;
      var snap = JSON.parse(raw);
      return (snap && typeof snap === 'object') ? snap : null;
    } catch (e) { return null; }
  }

  function rollbackSnapshot(ls) {
    var restored = 0;
    try {
      var raw = ls.getItem('iq9_preimport_1');
      if (!raw) return 0;
      var snap = JSON.parse(raw);
      Object.keys(snap.keys || {}).forEach(function(k) {
        ls.setItem(k, snap.keys[k]);
        restored++;
      });
    } catch (e) { console.warn('rollback failed:', e); }
    return restored;
  }

  window.Backup = {
    checksum: checksum, stableStringify: stableStringify, buildExport: buildExport,
    validateBackup: validateBackup, snapshotBeforeImport: snapshotBeforeImport,
    rollbackSnapshot: rollbackSnapshot, readSnapshot: readSnapshot
  };
})();
