(function() {
  // ═══════════════════════════════════════════════════════
  function _isRealBrowser() {
    return typeof navigator !== 'undefined' && /Mozilla|Chrome|Safari|WebKit/i.test(navigator.userAgent || '');
  }

  function iqResolveTheme(mode) {
    var m = mode || (typeof S !== 'undefined' && S && S.theme) || 'light';
    if (m === 'system') {
      try {
        if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      } catch (e) {}
      return 'light';
    }
    if (m === 'dark' || m === 'night') return m;
    return 'light';
  }

  function iqApplyTheme() {
    if (typeof document === 'undefined' || !document.documentElement) return;
    var pref = (typeof S !== 'undefined' && S && S.theme) ? S.theme : 'light';
    var resolved = iqResolveTheme(pref);
    if (resolved === 'light') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', resolved);
    var seasonOn = !!(typeof S !== 'undefined' && S && S.seasonalAccent);
    document.documentElement.setAttribute('data-season-accent', seasonOn ? 'true' : 'false');
    var scale = (typeof S !== 'undefined' && S && typeof S.scriptScale === 'number') ? S.scriptScale : 1;
    try { document.documentElement.style.setProperty('--iq-script-scale', String(scale)); } catch (e) {}
    var metaTheme = document.querySelector && document.querySelector('meta[name="theme-color"]');
    if (metaTheme && typeof metaTheme.setAttribute === 'function') {
      metaTheme.setAttribute('content', resolved === 'night' ? '#030605' : (resolved === 'dark' ? '#0e1715' : '#054944'));
    }
    try { localStorage.setItem('iqTheme', pref); } catch (e) {}
  }
  window.iqApplyTheme = iqApplyTheme;

  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      var _mqDark = window.matchMedia('(prefers-color-scheme: dark)');
      if (_mqDark && typeof _mqDark.addEventListener === 'function') {
        _mqDark.addEventListener('change', function() {
          if (typeof S !== 'undefined' && S && S.theme === 'system') iqApplyTheme();
        });
      }
    }
  } catch (e) {}

  function iqAlertDialog(title, msg, iconHtml) {
    if (!_isRealBrowser() || typeof alert === 'function' && !document.getElementById('toastOverlay')) {
      if (typeof alert === 'function') alert(String(title || '') + (msg ? '\n' + msg : ''));
      return;
    }
    var esc = window.escapeHTML || function(s){ return String(s == null ? '' : s); };
    var tFn = window.t || function(s){ return s; };
    openToastModal(
      '<div class="toast-box iq-modal-card" role="alertdialog" aria-modal="true" style="max-width:420px;width:92%;text-align:center;">' +
        (iconHtml ? '<div style="margin-bottom:8px;">' + iconHtml + '</div>' : '') +
        '<h3 style="margin-bottom:6px;">' + esc(title) + '</h3>' +
        '<p style="color:var(--text2);font-size:0.9rem;line-height:1.5;margin-bottom:14px;">' + esc(msg || '') + '</p>' +
        '<button type="button" class="iq-pill-btn" onclick="window.closeToastOverlay && window.closeToastOverlay()">' + esc(tFn('OK')) + '</button>' +
      '</div>'
    );
  }
  window.iqAlertDialog = iqAlertDialog;

  function iqConfirmDialog(title, msg, confirmLabel, onConfirm, isDanger) {
    if (!_isRealBrowser() || !document.getElementById('toastOverlay')) {
      if (typeof confirm === 'function' && confirm(msg || title)) {
        if (typeof onConfirm === 'function') onConfirm();
      }
      return;
    }
    var esc = window.escapeHTML || function(s){ return String(s == null ? '' : s); };
    var tFn = window.t || function(s){ return s; };
    window._iqPendingConfirm = typeof onConfirm === 'function' ? onConfirm : null;
    openToastModal(
      '<div class="toast-box iq-modal-card" role="alertdialog" aria-modal="true" style="max-width:420px;width:92%;text-align:start;">' +
        '<h3 style="margin-bottom:6px;color:' + (isDanger ? 'var(--red)' : 'var(--text)') + ';">' + esc(title) + '</h3>' +
        '<p style="color:var(--text2);font-size:0.88rem;line-height:1.55;margin-bottom:16px;">' + esc(msg || '') + '</p>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">' +
          '<button type="button" class="iq-btn-secondary" onclick="window._iqPendingConfirm=null;window.closeToastOverlay();">' + esc(tFn('Cancel')) + '</button>' +
          '<button type="button" class="' + (isDanger ? 'danger-btn' : 'iq-pill-btn') + '" style="margin:0;width:auto;" onclick="var fn=window._iqPendingConfirm;window._iqPendingConfirm=null;window.closeToastOverlay();if(fn)fn();">' + esc(confirmLabel || tFn('Confirm')) + '</button>' +
        '</div>' +
      '</div>'
    );
  }
  window.iqConfirmDialog = iqConfirmDialog;

  function iqPromptDialog(title, msg, placeholder, onSubmit) {
    if (!_isRealBrowser() || !document.getElementById('toastOverlay')) {
      var ans = typeof prompt === 'function' ? prompt(msg || title) : null;
      if (typeof onSubmit === 'function') onSubmit(ans);
      return;
    }
    var esc = window.escapeHTML || function(s){ return String(s == null ? '' : s); };
    var tFn = window.t || function(s){ return s; };
    window._iqPendingPrompt = typeof onSubmit === 'function' ? onSubmit : null;
    openToastModal(
      '<div class="toast-box iq-modal-card" role="dialog" aria-modal="true" style="max-width:420px;width:92%;text-align:start;">' +
        '<h3 style="margin-bottom:6px;">' + esc(title) + '</h3>' +
        '<p style="color:var(--text2);font-size:0.88rem;line-height:1.5;margin-bottom:10px;">' + esc(msg || '') + '</p>' +
        '<input type="text" id="iqPromptModalInput" class="profile-input" placeholder="' + esc(placeholder || '') + '" style="margin-bottom:14px;">' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">' +
          '<button type="button" class="iq-btn-secondary" onclick="window._iqPendingPrompt=null;window.closeToastOverlay();">' + esc(tFn('Cancel')) + '</button>' +
          '<button type="button" class="iq-pill-btn" onclick="var inp=document.getElementById(\'iqPromptModalInput\');var val=inp?inp.value:\'\';var fn=window._iqPendingPrompt;window._iqPendingPrompt=null;window.closeToastOverlay();if(fn)fn(val);">' + esc(tFn('Confirm')) + '</button>' +
        '</div>' +
      '</div>'
    );
    setTimeout(function() { var inp = document.getElementById('iqPromptModalInput'); if (inp && inp.focus) inp.focus(); }, 60);
  }
  window.iqPromptDialog = iqPromptDialog;

  function toast(icon, msg, conf=false, ms=2600) {
    const ov = document.getElementById('toastOverlay');
    if (!ov) return;
    const hasModal = !!(ov.classList && typeof ov.classList.contains === 'function' && ov.classList.contains('iq-modal-open') && ov.classList.contains('show'));
    if (hasModal) {
      playSound(conf ? 'chime' : 'pop');
      return;
    }
    const isAchToast = typeof icon === 'string' && icon.indexOf('iq-badge') !== -1;
    window._modalTriggerEl = document.activeElement;
    if (ov.classList) {
      ov.classList.remove('iq-modal-open');
      if (isAchToast) ov.classList.remove('iq-toast-passive');
      else ov.classList.add('iq-toast-passive');
    }
    ov.innerHTML = isAchToast
      ? `<div class="toast-box toast-box--achievement" role="status" aria-live="polite"><div class="toast-badge-slot">${icon}</div><div class="toast-ach-body">${msg}</div></div>`
      : `<div class="toast-box" role="status" aria-live="polite"><span class="toast-ico" aria-hidden="true">${icon}</span><h3><bdi>${msg}</bdi></h3></div>`;
    ov.style.display='flex'; if (ov.classList) ov.classList.add('show'); playSound(conf ? 'chime' : 'pop');
    ov.style.pointerEvents = isAchToast ? 'auto' : 'none';
    if(ov._t) clearTimeout(ov._t);
    const hidePassive = ()=>{
      if (ov.classList && typeof ov.classList.contains === 'function' && ov.classList.contains('iq-modal-open')) return;
      if (ov.classList) ov.classList.remove('show');
      setTimeout(()=>{
        const stillModal = !!(ov.classList && typeof ov.classList.contains === 'function' && ov.classList.contains('iq-modal-open'));
        const isShown = !!(ov.classList && typeof ov.classList.contains === 'function' && ov.classList.contains('show'));
        if (!stillModal && !isShown) {
          ov.style.display='none'; ov.innerHTML='';
          ov.style.pointerEvents='none';
          if (ov.classList) ov.classList.remove('iq-toast-passive');
        }
      }, 260);
    };
    if(ms>0) ov._t=setTimeout(hidePassive, ms);
    ov.onclick=()=>{ if (isAchToast || (ov.classList && typeof ov.classList.contains === 'function' && ov.classList.contains('iq-toast-passive'))) hidePassive(); };
  }
  window.toast = toast;


  function switchUser() { const inp=document.getElementById('usernameInput'); if(!inp?.value.trim()) return; saveState(); currentUser=inp.value.trim(); localStorage.setItem(USER_KEY,currentUser); S=window.loadState(); initApp(); }
  function logout() {
    saveState();
    try {
      sessionStorage.removeItem('iq_session_authenticated');
      sessionStorage.removeItem('iq_unlocked_' + currentUser);
    } catch(e) {}
    if (window.Auth && typeof window.Auth.lockUser === 'function') {
      window.Auth.lockUser();
    } else if (window.Auth && typeof window.Auth.show === 'function') {
      window.Auth.show('login');
    } else {
      currentUser = 'default';
      try { localStorage.setItem(USER_KEY, currentUser); } catch (e) {}
      S = window.loadState();
      initApp();
    }
  }
  function _performResetAll() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(PREFIX) || k === USER_KEY)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    try { localStorage.removeItem('iq_intro_seen'); } catch (e) {}
    if (window.Storage && window.Storage.destroy) {
      window.Storage.destroy(currentUser).catch(function() {});
    }
    S = freshState();
    saveState();
    iqApplyTheme();
    renderAll();
  }
  function resetAll(force) {
    if (force === true) { _performResetAll(); return; }
    if (!_isRealBrowser() && typeof confirm === 'function') {
      if (!confirm(iqEmoji('alert-triangle') + ' Reset all data? This cannot be undone.')) return;
      _performResetAll();
      return;
    }
    iqConfirmDialog('Reset All Progress?', 'This permanently deletes your logs, streaks, XP, and settings on this device.', 'Reset All', _performResetAll, true);
  }
  function deleteAllUserData() {
    iqConfirmDialog(
      'Delete All On-Device Data?',
      'Removes all Ibadah Quest profiles, localStorage keys, and IndexedDB storage on this device. This cannot be undone.',
      'Delete Everything',
      function() {
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && (k.indexOf('iq') === 0)) keys.push(k);
        }
        keys.forEach(function(k) { try { localStorage.removeItem(k); } catch (e) {} });
        if (window.Storage && window.Storage.destroy) {
          try { window.Storage.destroy(currentUser).catch(function(){}); } catch (e) {}
        }
        S = freshState();
        S.introSeen = true;
        saveState();
        iqApplyTheme();
        renderAll();
        toast(iqIcon('check'), 'All personal worship data cleared from device', false, 2600);
      },
      true
    );
  }
  function exportCSVData() {
    var rows = [['date', 'prayers_done', 'prayers_qada', 'dhikr_count', 'fasted']];
    var log = (S && S.log) ? S.log : {};
    Object.keys(log).sort().forEach(function(dt) {
      var day = log[dt] || {};
      var p = day.p || {};
      var done = 0, qada = 0;
      Object.keys(p).forEach(function(k) {
        if (p[k] === 'qada') qada++;
        else if (p[k]) done++;
      });
      var dSum = 0;
      var dMap = day.d || {};
      Object.keys(dMap).forEach(function(k) { dSum += Number(dMap[k] || 0); });
      var fasted = (S && S.fastingDays && S.fastingDays[dt]) ? '1' : '0';
      rows.push([dt, done, qada, dSum, fasted]);
    });
    var csv = rows.map(function(r) { return r.join(','); }).join('\n');
    if (typeof Blob === 'function' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'ibadah-quest-log-' + today() + '.csv';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast(iqIcon('download'), 'CSV activity log exported', false, 2000);
    }
    return csv;
  }
  function _downloadBackup(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ibadah-quest-backup-' + today() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function _collectExportExtras(data) {
    try { const th = localStorage.getItem('iqTheme'); if (th !== null && th !== undefined) data.iqTheme = th; } catch (e) {}
    try {
      const zi = JSON.parse(localStorage.getItem('iq_zakat_inputs') || 'null');
      if (zi && typeof zi === 'object' && !Array.isArray(zi)) data.iq_zakat_inputs = zi;
    } catch (e) {}
    return data;
  }
  function _finalizeExport(data) {
    _collectExportExtras(data);
    if (window.Backup && typeof window.Backup.buildExport === 'function') return window.Backup.buildExport(data);
    // Backup module unavailable: keep the legacy envelope rather than fail.
    if (!data._exported) data._exported = new Date().toISOString();
    if (!data._version) data._version = '1.0';
    return data;
  }

  function exportDataLS() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(PREFIX) || k === USER_KEY)) {
        try { data[k] = JSON.parse(localStorage.getItem(k)); } catch(e) { data[k] = localStorage.getItem(k); }
      }
    }
    _downloadBackup(_finalizeExport(data));
    toast(iqIcon('download'), 'Backup exported (v2.1)', false, 2000);
  }

  function exportData() {
    if (window.Storage && window.Storage.exportAll) {
      window.Storage.exportAll().then(function(data) {
        _downloadBackup(_finalizeExport(data));
        toast(iqIcon('download'), 'Backup exported (v2.1)', false, 2000);
      }).catch(function() {
        exportDataLS();
      });
    } else {
      exportDataLS();
    }
  }

  function importDataLS(data) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(PREFIX) || k === USER_KEY)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    try { localStorage.removeItem('iq_intro_seen'); } catch (e) {}
    Object.keys(data).forEach(k => {
      if (k === '_exported' || k === '_version' || k === '_appVersion' || k === '_checksum') return;
      try { localStorage.setItem(k, typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k])); } catch(e) {}
    });
    _completeImport();
  }

  // Shared import completion: normally just initApp(); during corruption
  // recovery, recoverImport swaps in finishInit so the post-import boot gets
  // the full wiring (window.App, listeners, deferred re-render).
  var _postImportHook = null;
  var _undoPending = false; // set by a validated import; consumed once on completion
  function _completeImport() {
    S = window.loadState();
    const hook = _postImportHook; _postImportHook = null;
    if (typeof hook === 'function') hook(); else initApp();
    if (_undoPending) { _undoPending = false; showUndoImportBar(); }
    toast(iqIcon('upload'), 'Backup imported!', false, 2000);
  }

  function importData() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json';
    // If the user cancels the picker during a recovery import, drop the pending
    // boot hook so a later ordinary import can't double-run boot wiring.
    try { inp.addEventListener('cancel', function() { _postImportHook = null; }); } catch(e) {}
    inp.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        let data;
        try { data = JSON.parse(ev.target.result); } catch (e) {
          toast(iqIcon('alert-triangle'), 'Not a valid JSON backup.', false, 2400); return;
        }
        const verdict = (window.Backup && typeof window.Backup.validateBackup === 'function')
          ? window.Backup.validateBackup(data)
          : { ok: !!(data && typeof data === 'object' && !Array.isArray(data)) };
        if (!verdict.ok) { toast(iqIcon('alert-triangle'), verdict.error || 'Invalid backup file.', false, 3200); return; }
        delete data._exported; delete data._version; delete data._appVersion; delete data._checksum;
        _undoPending = true;
        // Snapshot BOTH stores before anything is touched: LS keys plus the
        // current IndexedDB contents (so IDB-path imports are fully revertible).
        var snapAndGo = function(idbExport) {
          if (window.Backup && typeof window.Backup.snapshotBeforeImport === 'function') {
            try { window.Backup.snapshotBeforeImport(localStorage, idbExport); } catch (e) {}
          }
          if (window.Storage && window.Storage.importAll) {
            window.Storage.importAll(data).then(function() {
              _completeImport();
            }).catch(function() {
              importDataLS(data);
            });
          } else {
            importDataLS(data);
          }
        };
        if (window.Storage && window.Storage.exportAll) {
          window.Storage.exportAll().then(snapAndGo).catch(function() { snapAndGo(null); });
        } else {
          snapAndGo(null);
        }
      };
      reader.readAsText(file);
    };
    inp.click();
  }
  window.exportData = exportData;
  window.importData = importData;

  // ── Post-import undo bar (uses recoveryOverlay container — free real estate) ──
  function showUndoImportBar() {
    var ov = openToastModal('<div class="recovery-box"><h2>Import finished</h2>' +
      '<p>Your previous data was snapshotted. Keep the import?</p>' +
      '<div class="recovery-actions">' +
      '<button class="btn btn-primary" data-action="keep">Keep imported data</button>' +
      '<button class="btn" data-action="undo">Undo — restore my previous data</button>' +
      '</div></div>', 'recoveryOverlay');
    if (!ov) return;
    ov.querySelectorAll('[data-action]').forEach(function(b) {
      b.addEventListener('click', function() {
        if (b.getAttribute('data-action') === 'undo') {
          var n = (window.Backup && typeof window.Backup.rollbackSnapshot === 'function')
            ? window.Backup.rollbackSnapshot(localStorage) : 0;
          var rec = (window.Backup && typeof window.Backup.readSnapshot === 'function')
            ? window.Backup.readSnapshot(localStorage) : null;
          if (rec && rec.idb && window.Storage && window.Storage.importAll) {
            try { window.Storage.importAll(rec.idb).catch(function() {}); } catch (e) {}
          }
          S = window.loadState();
          initApp();
          toast(n ? iqIcon('refresh-cw') : iqIcon('info'),
                n ? 'Previous data restored!' : 'No snapshot found.', false, 2200);
        }
        ov.classList.remove('show'); ov.style.pointerEvents = '';
        ov.style.display = 'none'; ov.innerHTML = '';
      });
    });
  }
  window.showUndoImportBar = showUndoImportBar;

  // ── Corruption recovery overlay (consumes window.__iqCorruption from Task 9) ──
  function _hide(el) { el.style.display = 'none'; el.innerHTML = ''; el.classList.remove('show'); el.style.pointerEvents = ''; }
  function showRecoveryModal() {
    var ov = openToastModal(window.Recovery.buildRecoveryHtml(window.__iqCorruption), 'recoveryOverlay');
    if (!ov) return;
    ov.querySelectorAll('[data-action]').forEach(function(b) {
      b.addEventListener('click', function() {
        var a = b.getAttribute('data-action');
        if (a === 'salvage') recoverSalvage();
        else if (a === 'import') recoverImport();
        else if (a === 'fresh') recoverFresh();
      });
    });
  }
  function continueBootAfterRecovery() {
    var ov = document.getElementById('recoveryOverlay');
    if (ov) _hide(ov);
    window.__iqCorruption = null; // subsequent saveState calls are safe again
    finishInit();
  }
  function recoverSalvage() {
    var raw = null;
    try { raw = localStorage.getItem(PREFIX + currentUser); } catch (e) {}
    if ((!raw || raw === 'undefined') && window.Storage && window.Storage.getRaw && window.__iqCorruption && window.__iqCorruption.source === 'idb') {
      window.Storage.getRaw(PREFIX + currentUser).then(function(v) {
        applySalvage(window.Recovery.salvageInto(window.freshState(), v));
      }).catch(function() { applySalvage(null); });
      return;
    }
    var lsResult = window.Recovery.salvageInto(window.freshState(), raw);
    if (lsResult) { applySalvage(lsResult); return; }
    // LS unusable — fall back to the IndexedDB copy before offering
    // destructive options (never leave the user stuck / force a wipe).
    if (window.Storage && window.Storage.getRaw) {
      window.Storage.getRaw(PREFIX + currentUser).then(function(v) {
        var idbResult = (v && !window.Recovery.isJunkState(v))
          ? window.Recovery.salvageInto(window.freshState(), v) : null;
        if (idbResult) { applySalvage(idbResult); }
        else { showRecoveryModal(); toast(iqIcon('alert-triangle'), 'Could not recover — choose another option.'); }
      }).catch(function() {
        toast(iqIcon('alert-triangle'), 'Could not recover — choose another option.');
      });
      return;
    }
    toast(iqIcon('alert-triangle'), 'Could not recover — choose another option.');
  }
  function applySalvage(result) {
    if (result) { S = normalizeState(result); saveState(); toast(iqIcon('sparkles'), 'Recovered your data!'); }
    else toast(iqIcon('alert-triangle'), 'Could not recover — choose another option.');
    if (result) continueBootAfterRecovery(); // failure stays on the modal
  }
  function recoverImport() {
    var ov = document.getElementById('recoveryOverlay');
    if (ov) _hide(ov);
    window.__iqCorruption = null; // cleared BEFORE importData so post-import saveState is safe
    _postImportHook = finishInit;
    importData();
  }
  function recoverFresh() {
    var applyResetToken = function(token) {
      if (!window.Recovery.freshStartAllowed(token)) { toast(iqIcon('info'), 'Confirmation did not match. Nothing was erased.'); return; }
      S = window.freshState();
      saveState();
      iqApplyTheme();
      toast(iqIcon('sprout'), 'Fresh start ready.');
      continueBootAfterRecovery();
    };
    var proceed = function() {
      if (!_isRealBrowser() && typeof prompt === 'function') {
        applyResetToken(prompt('Type RESET to erase corrupted data and start fresh:'));
        return;
      }
      iqPromptDialog('Start Fresh', 'Type RESET to erase corrupted data and start fresh:', 'RESET', applyResetToken);
    };
    // A typed wipe must never destroy the only healthy copy of user data.
    if (window.Storage && window.Storage.load) {
      window.Storage.load(currentUser).then(function(stored) {
        if (stored && !window.Recovery.isJunkState(stored)) {
          // Healthy copy survives in IndexedDB - recover it instead.
          toast(iqIcon('sparkles'), 'Healthy data found on device - recovering that instead.');
          S = normalizeState(stored);
          saveState();
          continueBootAfterRecovery();
          return;
        }
        proceed();
      }).catch(proceed);
      return;
    }
    proceed();
  }
  window.showRecoveryModal = showRecoveryModal;
  window.continueBootAfterRecovery = continueBootAfterRecovery;
  window.recoverSalvage = recoverSalvage;
  window.recoverFresh = recoverFresh;
  window.recoverImport = recoverImport;
  function toggleBookmark(id) {
    if (!S.bookmarks) S.bookmarks = [];
    const idx = S.bookmarks.indexOf(id);
    if (idx === -1) { S.bookmarks.push(id); toast(iqIcon('bookmark'), 'Bookmarked!', false, 1500); }
    else { S.bookmarks.splice(idx, 1); toast(iqIcon('bookmark'), 'Bookmark removed', false, 1500); }
    saveState();
  }
  function isBookmarked(id) { return S.bookmarks && S.bookmarks.indexOf(id) !== -1; }
  window.toggleBookmark = toggleBookmark;
  window.isBookmarked = isBookmarked;
  function selectAvatar(emoji) {
    S.avatar = emoji;
    saveState();
    renderProfile();
  }

  const NEW_POOL_TITLES = {
  zakatrules:    iqIcon('wallet') + ' Zakat — Purifying Your Wealth',
  salahrules:    iqIcon('mosque') + ' Salah — The Pillar of Prayer',
  sawmrules:     iqIcon('moon') + ' Sawm — The Fast of Ramadan',
  hajjrules:     iqIcon('mosque') + ' Hajj — The Sacred Pilgrimage',
  purification:  iqIcon('droplets') + ' Purification (Taharah)',
  trade:         iqIcon('handshake') + ' Islamic Trade & Commerce',
  inheritance:   iqIcon('scroll') + ' Laws of Inheritance (Mirath)',
  oaths:         iqIcon('hand-heart') + ' Oaths & Vows in Islam',
  sufism:        iqIcon('heart') + ' Sufism & Spiritual Paths',
  tazkiyah:      iqIcon('sparkles') + ' Tazkiyah — Soul Purification',
  fear:          iqIcon('alert-triangle') + ' Fear of Allah (Khawf)',
  hope:          iqIcon('heart') + ' Hope in Allah (Raja)',
  loveofallah:   iqIcon('heart') + ' Love of Allah',
  contentment:   iqIcon('heart') + ' Contentment (Qana\'ah)',
  reflection:    iqIcon('pencil') + ' Reflection & Contemplation',
  mentalhealth:  iqIcon('brain') + ' Mental Health in Islam',
  brotherhood:   iqIcon('handshake') + ' Brotherhood in Islam',
  sisterhood:    iqIcon('flower') + ' Sisterhood in Islam',
  orphans2:      iqIcon('heart') + ' Care for Orphans',
  elderly:       iqIcon('user') + ' Respecting the Elderly',
  disabled:      iqIcon('heart') + ' Inclusion & Disability',
  antiracism:    iqIcon('globe') + ' Anti-Racism in Islam',
  poverty:       iqIcon('heart') + ' Poverty & Social Justice',
  volunteering:  iqIcon('heart') + ' Volunteering in Islam'
  };
  window.NEW_POOL_TITLES = NEW_POOL_TITLES;
  function registerNewPoolRenderers() {
    if (typeof NEW_POOLS === 'undefined' || !NEW_POOLS) return;
    window.NEW_POOLS = NEW_POOLS;
    Object.keys(NEW_POOLS).forEach(function(k) {
      window['render' + k] = function() {
        const title = NEW_POOL_TITLES[k] || (iqIcon('sparkles') + ' ' + k.charAt(0).toUpperCase() + k.slice(1));
        if (typeof window.poolRender === 'function') window.poolRender(k + 'Area', title, NEW_POOLS[k], k + 'Idx');
      };
    });
  }
  window.registerNewPoolRenderers = registerNewPoolRenderers;
  registerNewPoolRenderers();

  // Modal keyboard handlers (Escape to close, focus trap)
  window._modalTriggerEl = null;
  function trapFocus(modal, e) {
    var focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  function initModalKeyboardHandlers() {
    // Muhasabah modal
    var muhasabahModal = document.getElementById('muhasabahModal');
    if (muhasabahModal) {
      muhasabahModal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          if (typeof window.dismissMuhasabah === 'function') window.dismissMuhasabah();
        } else if (e.key === 'Tab') {
          trapFocus(muhasabahModal, e);
        }
      });
    }
    
    // Toast overlay
    var toastOverlay = document.getElementById('toastOverlay');
    if (toastOverlay) {
      toastOverlay.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeToastOverlay();
        } else if (e.key === 'Tab') {
          trapFocus(toastOverlay, e);
        }
      });
    }
  }
  function openToastModal(html, overlayId) {
    var ov = document.getElementById(overlayId || 'toastOverlay');
    if (!ov) return null;
    if (ov._t) { clearTimeout(ov._t); ov._t = null; }
    window._modalTriggerEl = document.activeElement;
    if (ov.classList) {
      ov.classList.remove('iq-toast-passive');
      ov.classList.add('iq-modal-open');
    }
    ov.innerHTML = html;
    ov.style.display = 'flex';
    if (ov.classList) ov.classList.add('show');
    ov.style.pointerEvents = 'auto';
    ov.onclick = null;
    return ov;
  }
  window.openToastModal = openToastModal;
  function closeToastOverlay() {
    var toastOverlay = document.getElementById('toastOverlay');
    if (!toastOverlay) return;
    if (toastOverlay._t) { clearTimeout(toastOverlay._t); toastOverlay._t = null; }
    if (toastOverlay.classList) {
      toastOverlay.classList.remove('show');
      toastOverlay.classList.remove('iq-modal-open');
      toastOverlay.classList.remove('iq-toast-passive');
    }
    toastOverlay.style.display = 'none';
    toastOverlay.innerHTML = '';
    toastOverlay.style.pointerEvents = 'none';
    toastOverlay.onclick = null;
    if (window._modalTriggerEl && window._modalTriggerEl.focus) {
      window._modalTriggerEl.focus();
      window._modalTriggerEl = null;
    }
    if (typeof window._iqModalDone === 'function') { var cb = window._iqModalDone; window._iqModalDone = null; setTimeout(cb, 300); }
  }

  // Theme button is a native <button>: keyboard activation is built in.

  function _escAttr(s){ return String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }
  function _findBnavByCat(cat){ var esc=_escAttr(cat); try{return document.querySelector('.bnav-btn[data-cat="' + esc + '"]');}catch(e){ var els=document.querySelectorAll('.bnav-btn'); for(var i=0;i<els.length;i++) if(els[i].getAttribute('data-cat')===cat) return els[i]; return null; } }

  function _parseHashAndNavigate() {
    const hash = location.hash;
    if (hash && hash.startsWith('#/')) {
      const parts = hash.slice(2).split('/');
      if (parts.length === 2) {
        const cat = decodeURIComponent(parts[0] || '');
        const tab = decodeURIComponent(parts[1] || '');
        if (window.TAB_GROUPS && window.TAB_GROUPS[cat]) {
          window._hashNavigating = true;
          window.switchCategory(cat, _findBnavByCat(cat));
          window.activateTab(tab, null);
          window._hashNavigating = false;
          return true;
        }
      }
    }
    return false;
  }

  function _initHashRouting() {
    if (typeof window.addEventListener !== 'function') return;
    window.addEventListener('popstate', function(e) {
      if (e.state && e.state.cat && e.state.tab) {
        window._hashNavigating = true;
        window.switchCategory(e.state.cat, _findBnavByCat(e.state.cat));
        window.activateTab(e.state.tab, null);
        window._hashNavigating = false;
      }
    });
  }

  function initApp() {
  const overlay = document.getElementById('introOverlay');
  var mirrorSeen = false;
  try { mirrorSeen = localStorage.getItem('iq_intro_seen') === '1'; } catch (e) {}
  const introSeen = (S ? !!S.introSeen : true) || mirrorSeen;
  if (overlay) {
    if (!introSeen) {
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
      overlay.classList.add('visible');
    } else {
      overlay.classList.remove('visible');
      overlay.style.display = 'none';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }
  }
  if (window.Auth && typeof window.Auth.checkStartupAuth === 'function') {
    window.Auth.checkStartupAuth();
  } else if (window.Auth && typeof window.Auth.isLocked === 'function' && window.Auth.isLocked()) {
    window.Auth.show('unlock');
  }
  iqApplyTheme();
  try { if (typeof window.iqSyncLangDir === 'function') window.iqSyncLangDir(); } catch(e) {}

    const t = today();
    if (S.lad !== t) {
      window._iqPrevLad = S.lad;
      S.lad = t;
      if (S.ab && S.ab.exp < t) S.ab = null;
      if (typeof window.recalc === 'function') window.recalc();
      saveState();
    }
    try { if (typeof window.syncSeason === 'function') window.syncSeason(t); } catch(e) { console.warn('seasonal sync failed:', e); }
    if (S.log && Object.keys(S.log).length > 400) compactLogs();
    if (typeof window.genDQ === 'function') window.genDQ();
    if (typeof window.genWQ === 'function') window.genWQ();
    if (typeof window.genMQ === 'function') window.genMQ();
    if (typeof window.genYQ === 'function') window.genYQ();
    if (typeof window.genLQ === 'function') window.genLQ();
    if (typeof window.refreshContent === 'function') window.refreshContent();
    if (typeof window.recalc === 'function') window.recalc();
    if (typeof window.checkQ === 'function') window.checkQ();
    if (typeof window.compactStorage === 'function') window.compactStorage();
    S.lv=lvFrom(S.xp); saveState(); (window.initCalView || (typeof initCalView === 'function' ? initCalView : function(){}))(); (window.renderAll || (typeof renderAll === 'function' ? renderAll : function(){}))();
    if (window.renderDailyContent) window.renderDailyContent();
    const modalQueue = [];
    if (window.showWeeklySummary) modalQueue.push(window.showWeeklySummary);
    if (window.showDailySummary) modalQueue.push(window.showDailySummary);
    let queueTimer = null;
    function runNextModal() {
      if (modalQueue.length === 0) return;
      const fn = modalQueue.shift();
      try { fn(runNextModal); } catch(e) { console.error('modal queue step failed:', e); runNextModal(); }
      clearTimeout(queueTimer);
      // Watchdog: force-advance only if THIS step's callback is still armed.
      // If the modal already closed, closeToastOverlay consumed _iqModalDone
      // and its 300ms delayed callback owns the advance — consuming first
      // nulls it, so whichever path wins, the queue advances exactly once.
      const watched = window._iqModalDone;
      queueTimer = setTimeout(() => {
        if (typeof watched === 'function' && window._iqModalDone === watched) {
          window._iqModalDone = null;
          runNextModal();
        }
      }, 10000);
    }
    runNextModal();
    try {
      if (!_parseHashAndNavigate()) {
        const LEGACY_CAT_MAP = { library: 'knowledge', names_main: 'knowledge', creed: 'knowledge', rewards: 'profile_main', growth: 'profile_main' };
        const LEGACY_TAB_MAP = { finance: 'charity', zakatcalc: 'charity', gratitude: 'healthlog', rewards: 'profile', growth: 'progress' };
        const savedCat = S ? (LEGACY_CAT_MAP[S.lastCat] || S.lastCat) : null;
        const savedSub = S ? (LEGACY_TAB_MAP[S.lastSub] || S.lastSub) : null;
        const activeCat = (savedCat && window.TAB_GROUPS && window.TAB_GROUPS[savedCat]) ? savedCat : 'ibadah';
        window.switchCategory(activeCat, _findBnavByCat(activeCat));
        if (savedSub) {
          window.activateTab(savedSub, null);
        }
      }
    } catch(e) { console.warn('Initial nav render failed:', e); }
  }

  function iqSetTheme(theme) {
    var valid = ['light', 'dark', 'night', 'system'].includes(theme) ? theme : 'light';
    if (S) { S.theme = valid; saveState(); }
    iqApplyTheme();
    if (typeof window.renderProfile === 'function') window.renderProfile();
    if (typeof window.renderComponentGallery === 'function') window.renderComponentGallery();
  }
  function iqSetSeasonalAccent(on) {
    if (S) { S.seasonalAccent = !!on; saveState(); }
    iqApplyTheme();
    if (typeof window.renderProfile === 'function') window.renderProfile();
  }
  function iqSetScriptScale(scale) {
    var n = Math.max(0.9, Math.min(1.4, parseFloat(scale) || 1));
    if (S) { S.scriptScale = Math.round(n * 100) / 100; saveState(); }
    iqApplyTheme();
    if (typeof window.renderProfile === 'function') window.renderProfile();
  }
  function iqSetSoundEnabled(on) {
    if (S) { S.soundEnabled = !!on; saveState(); }
    if (typeof window.renderProfile === 'function') window.renderProfile();
  }
  function iqSetNumerals(mode) {
    var valid = ['auto', 'western', 'bangla', 'arabic'].includes(mode) ? mode : 'auto';
    if (S) { S.numerals = valid; saveState(); }
    if (window.I18N) window.I18N.numerals = valid;
    try { localStorage.setItem('iq_numerals', valid); } catch (e) {}
    if (typeof window.renderAll === 'function') window.renderAll();
  }
  function iqSetBnTermMode(mode) {
    var valid = mode === 'salat' ? 'salat' : 'namaz';
    if (S) { S.bnTermMode = valid; saveState(); }
    if (window.I18N) window.I18N.bnTermMode = valid;
    try { localStorage.setItem('iq_bn_term_mode', valid); } catch (e) {}
    if (typeof window.renderAll === 'function') window.renderAll();
  }
  function iqSetHijriOffset(val) {
    var n = Math.max(-2, Math.min(2, parseInt(val, 10) || 0));
    if (S) { S.hijriOffset = n; saveState(); }
    if (typeof window.renderDateLine === 'function') window.renderDateLine();
    if (typeof window.renderAll === 'function') window.renderAll();
  }
  function iqSetLanguage(lang) {
    if (typeof window.iqSetLang === 'function') window.iqSetLang(lang);
    else if (typeof window.setLanguage === 'function') window.setLanguage(lang);
    else if (S) { S.lang = lang; saveState(); }
    iqApplyTheme();
    if (typeof window.renderAll === 'function') window.renderAll();
  }
  function iqSetQuranScript(script) {
    if (S) { S.quranScript = script === 'indopak' ? 'indopak' : 'uthmani'; saveState(); }
    if (typeof window.renderQuran === 'function') window.renderQuran();
  }
  function iqSetQuranTranslation(tr) {
    if (S) { S.quranTranslation = ['en', 'bn', 'both'].includes(tr) ? tr : 'en'; saveState(); }
    if (typeof window.renderQuran === 'function') window.renderQuran();
  }
  function iqSetKhatamGoal(days) {
    var d = Math.max(7, Math.min(365, parseInt(days, 10) || 30));
    if (S) {
      if (!S.khatamGoal) S.khatamGoal = { targetDays: d, pagesRead: 0, startDate: today() };
      else S.khatamGoal.targetDays = d;
      saveState();
    }
    if (typeof window.renderQuran === 'function') window.renderQuran();
  }
  function iqLogKhatamPages(pages) {
    var p = Math.max(1, parseInt(pages, 10) || 1);
    if (S) {
      if (!S.khatamGoal) S.khatamGoal = { targetDays: 30, pagesRead: 0, startDate: today() };
      S.khatamGoal.pagesRead = Math.min(604, (S.khatamGoal.pagesRead || 0) + p);
      saveState();
    }
    if (typeof window.grantCappedDailyXp === 'function') window.grantCappedDailyXp(p * 3, 'quran_pages', 15);
    if (typeof window.renderQuran === 'function') window.renderQuran();
    toast(iqIcon('book-open'), '+' + p + ' Quran page(s) logged', false, 1800);
  }
  function openContentErrorModal(refLabel) {
    var esc = window.escapeHTML || function(s){ return String(s == null ? '' : s); };
    var tFn = window.t || function(s){ return s; };
    var ref = refLabel ? esc(refLabel) : '';
    openToastModal(
      '<div class="toast-box iq-modal-card" role="dialog" aria-modal="true" style="max-width:440px;width:92%;text-align:start;">' +
        '<h3 style="margin-bottom:6px;">' + esc(tFn('Report Content Error')) + '</h3>' +
        '<p style="color:var(--text2);font-size:0.84rem;line-height:1.5;margin-bottom:10px;">' + esc(tFn('Help keep every Quran, Hadith, and Fiqh text accurate. Describe the reference and correction below (saved locally for offline review or exported in a bug report — never sent without your action).')) + '</p>' +
        '<input type="text" id="iqErrRef" class="profile-input" placeholder="' + esc(tFn('Screen / Verse / Hadith reference')) + '" value="' + ref + '" style="margin-bottom:8px;">' +
        '<textarea id="iqErrDetail" class="profile-input" rows="3" placeholder="' + esc(tFn('What seems inaccurate or misprinted?')) + '" style="margin-bottom:12px;"></textarea>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">' +
          '<button type="button" class="iq-btn-secondary" onclick="window.closeToastOverlay();">' + esc(tFn('Cancel')) + '</button>' +
          '<button type="button" class="iq-pill-btn" onclick="window.App && window.App.submitContentErrorReport && window.App.submitContentErrorReport();">' + esc(tFn('Save Note')) + '</button>' +
        '</div>' +
      '</div>'
    );
  }
  function submitContentErrorReport() {
    var refEl = document.getElementById('iqErrRef');
    var detEl = document.getElementById('iqErrDetail');
    var ref = refEl ? refEl.value.trim() : '';
    var detail = detEl ? detEl.value.trim() : '';
    if (!detail) { toast(iqIcon('info'), 'Please enter a short description.', false, 2000); return; }
    try {
      var list = JSON.parse(localStorage.getItem('iq_content_error_reports') || '[]');
      list.push({ at: new Date().toISOString(), ref: ref, detail: detail });
      localStorage.setItem('iq_content_error_reports', JSON.stringify(list.slice(-50)));
    } catch (e) {}
    closeToastOverlay();
    toast(iqIcon('check'), 'Error note saved locally. JazakAllahu khayran!', false, 2600);
  }
  function openChangelogModal() {
    var esc = window.escapeHTML || function(s){ return String(s == null ? '' : s); };
    var tFn = window.t || function(s){ return s; };
    openToastModal(
      '<div class="toast-box iq-modal-card" role="dialog" aria-modal="true" style="max-width:460px;width:92%;text-align:start;max-height:80vh;overflow-y:auto;">' +
        '<h3 style="margin-bottom:8px;">' + esc(tFn("What's New in Ibadah Quest")) + '</h3>' +
        '<ul style="padding-inline-start:18px;font-size:0.86rem;line-height:1.65;color:var(--text2);margin-bottom:14px;">' +
          '<li><strong>Noor &amp; Rhythm UI:</strong> Light, Dark, and OLED Night themes + seasonal accent overlay + WCAG 2.2 AA contrast.</li>' +
          '<li><strong>Offline Prayer &amp; Qibla Engine:</strong> Bundled astronomical calculations for global cities + Dhaka/IFB, Hanafi/Shafi Asr, High-Lat, ±1m offsets, and compass Qibla.</li>' +
          '<li><strong>Bangla, English &amp; Arabic:</strong> Full RTL support, bundled Bangla/Arabic fonts, digit style choice, and Bangla terminology toggle (Namaz/Salat).</li>' +
          '<li><strong>Quran &amp; Hifz Upgrade:</strong> Indo-Pak &amp; Uthmani scripts, complete Bangla Taisirul Quran + English Saheeh translations, Khatam planner, and Hifz Spaced Repetition.</li>' +
          '<li><strong>Ethical &amp; Forgiving Habits:</strong> Mid-day streak preservation, Grace cushion, zero-reason Rest Mode, and silence-first notifications with quiet hours.</li>' +
        '</ul>' +
        '<button type="button" class="iq-pill-btn" onclick="window.closeToastOverlay();">' + esc(tFn('Close')) + '</button>' +
      '</div>'
    );
  }
  function openGallery() {
    if (typeof window.switchCategory === 'function') window.switchCategory('profile_main', null);
    if (typeof window.activateTab === 'function') window.activateTab('gallery', null);
    if (typeof window.renderComponentGallery === 'function') window.renderComponentGallery();
  }

  function finishInit() {
    iqApplyTheme();
    try { initApp(); } catch(e) { console.error('Step 3 initApp failed:', e); }
    try { if (window.initSearch) window.initSearch(); } catch(e) { console.error('Step 3b initSearch failed:', e); }
    try { if (window.initFAB) window.initFAB(); } catch(e) { console.error('Step 3c initFAB failed:', e); }
    try { if (window.initPullRefresh) window.initPullRefresh(); } catch(e) { console.error('Step 3d initPullRefresh failed:', e); }
    try {
      if (window.requestNotificationPermission) window.requestNotificationPermission();
      if (S.notificationsEnabled && window.scheduleNotifications) window.scheduleNotifications();
    } catch(e) { console.error('Step 3e notifications init failed:', e); }
    try {
      document.addEventListener('click', (e) => {
        const sr = document.getElementById('globalSearchResults');
        if (sr && !e.target.closest('.global-search-wrap')) sr.classList.remove('show');
      });
    } catch(e) { console.error('Step 6 clickOutside failed:', e); }
    try { if (window.initBnavKeyboardNav) window.initBnavKeyboardNav(); } catch(e) { console.error('Step 8c bnav keyboard nav failed:', e); }
    try { if (window.populateTier1Icons) window.populateTier1Icons(); } catch(e) { console.error('Step 8b bnav icons failed:', e); }
    try { initModalKeyboardHandlers(); } catch(e) { console.error('Step 9 modal keyboard handlers failed:', e); }
    try { _initHashRouting(); } catch(e) { console.error('Step 10b hash routing init failed:', e); }
    // Quota-failure banner: show on 'iq:quota', wire dismiss (re-arms the flag),
    // and cover a quota failure that happened before init finished.
    try {
      window.showStorageBanner = function() {
        var b = document.getElementById('storageBanner');
        if (b) b.style.display = 'flex';
      };
      function dismissStorageBanner() {
        var b = document.getElementById('storageBanner');
        if (b) b.style.display = 'none';
        try { window.__iqQuotaFailed = false; } catch(err) {}   // re-arm
      }
      if (typeof window.addEventListener === 'function') {
        window.addEventListener('iq:quota', function() { window.showStorageBanner(); });
      }
      var sbClose = document.getElementById('storageBannerClose');
      if (sbClose) sbClose.addEventListener('click', dismissStorageBanner);
      if (window.__iqQuotaFailed) window.showStorageBanner();
    } catch(e) { console.error('Step 10d storage banner init failed:', e); }
    // Deferred feature scripts (health, goals, spiritual-growth, etc.) execute after
    // init()/renderAll() has already run, so re-render once they have loaded to populate
    // their panels (DOMContentLoaded fires after all defer scripts execute).
    try {
      var postDeferHook = function() {
        // Re-render ONLY the deferred-feature panels. The direct panels were
        // rendered by init()'s renderAll() already; this eliminates the boot
        // double-render of the ~13 always-available panels.
        try { if (window.renderDeferred) window.renderDeferred(); } catch(e) { console.error('Post-defer re-render failed:', e); }
        try { if (window.renderIqFeed) window.renderIqFeed(); } catch(e) {}
        try { if (window.renderDailyContent) window.renderDailyContent(); } catch(e) {}
        try { if (window.renderAchievementShowcase) window.renderAchievementShowcase(); } catch(e) {}
        try { if (window.autoTrackJourneyProgress) window.autoTrackJourneyProgress(); } catch(e) { console.error('Post-defer journey tracking failed:', e); }
        try { if (typeof window.syncSeason === 'function') window.syncSeason(today()); } catch(e) { console.error('Post-defer seasonal sync failed:', e); }
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', postDeferHook);
      } else {
        // Deferred scripts have executed by now even if we missed the event.
        postDeferHook();
      }
    } catch(e) { console.error('Step 10c post-defer re-render hook failed:', e); }
    try {
      document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && (e.target.matches('.card-item, .vol-card, .card-info-btn') || e.target.matches('.ach-card, .quest-row, .deed-card, [role="button"][tabindex="0"]'))) {
          e.preventDefault();
          e.target.click();
        }
      });
    } catch(e) { console.error('Step 11 card keyboard nav failed:', e); }
    function appAction(name) {
      return function() {
        var fn = window[name];
        if (typeof fn === 'function') return fn.apply(window, arguments);
        console.warn('[App] ' + name + ' called but feature not loaded');
        return undefined;
      };
    }
    window.App = {
      toggleP: window.toggleP, togglePrayerQada: window.togglePrayerQada, advanceQadaPenalty: appAction('advanceQadaPenalty'), togglePrayerPause: appAction('togglePrayerPause'), toggleV: window.toggleV, toggleD: window.toggleD,
      detail: (id) => toast(iqIcon('alert-triangle'), DETAILS[id]||'Voluntary Prayer', false, 4000),
      tip: (id) => toast(iqIcon('zap'), TIPS[id]||'A beautiful deed!', false, 4000),
      toggleQuest: window.toggleQuest, addGratitude: window.addGratitude, toggleFasting: window.toggleFasting, setCharityGoals: window.setCharityGoals,
      grantDailyXp: window.grantDailyXp, grantCappedDailyXp: window.grantCappedDailyXp,
      logWater: appAction('logWater'),
      logSleep: appAction('logSleep'),
      logExercise: appAction('logExercise'),
      toggleMeal: appAction('toggleMeal'),
      addMemorization: window.addMemorization, markHifzReviewed: window.markHifzReviewed, toggleMorning: window.toggleMorning, toggleEvening: window.toggleEvening,
      ensureQuranBanglaLoaded: window.ensureQuranBanglaLoaded, ensureQuranIndoPakLoaded: window.ensureQuranIndoPakLoaded,
      setTafsirEdition: appAction('setTafsirEdition'), switchUser, logout, resetAll, exportData, exportCSVData, importData, deleteAllUserData, toggleBookmark, isBookmarked, toggleVolCat: appAction('toggleVolCat'), toggleDeedCat: appAction('toggleDeedCat'),
      iqSetTheme, iqSetSeasonalAccent, iqSetScriptScale, iqSetSoundEnabled, iqSetNumerals, iqSetBnTermMode, iqSetHijriOffset, iqSetLanguage,
      iqSetQuranScript, iqSetQuranTranslation, iqSetKhatamGoal, iqLogKhatamPages,
      openContentErrorModal, submitContentErrorReport, openChangelogModal, openGallery,
      testNotification: appAction('sendTestNotification'),
      updateNotifSetting: appAction('updateNotificationSettings'),
      openMuhasabah: appAction('openMuhasabah'),
      dismissMuhasabah: appAction('dismissMuhasabah'),
      joinJourney: appAction('joinJourney'),
      manualRefresh: window.manualRefreshContent, ensureQuranLoaded: window.ensureQuranLoaded, ensureHadithLoaded: window.ensureHadithLoaded,
      recoverSalvage, recoverFresh, recoverImport,
      setQuranView: window.setQuranView, quranSearchFilter: window.quranSearchFilter, openQuranSurah: window.openQuranSurah, quranBack: window.quranBack, openQuranJuz: window.openQuranJuz, adjustQuranFont: appAction('adjustQuranFont'), setQuranTint: appAction('setQuranTint'),
      openHadithCollection: window.openHadithCollection, openHadithBook: window.openHadithBook, hadithBack: window.hadithBack,
      playQuranVerse: window.playQuranVerse, playSurah: window.playSurah, stopSurah: window.stopSurah, setQuranReciter: window.setQuranReciter, playJuz: window.playJuz, updateJuzButton: window.updateJuzButton,
      calPrevMonth: window.calPrevMonth, calNextMonth: window.calNextMonth, calGoToday: window.calGoToday, selectAvatar,
      toggleNotifications: appAction('toggleNotifications'),
      switchCategory: appAction('switchCategory'),
      activateTab: appAction('activateTab'),
      tapDhikr: appAction('tapDhikr'),
      toggleDhikrHaptic: appAction('toggleDhikrHaptic'),
      resetDhikr: appAction('resetDhikr'),
      nextDhikr: appAction('nextDhikr'),
      openSituational: appAction('openSituational'),
      situationalBack: appAction('situationalBack'),
      tapSituationalDhikr: appAction('tapSituationalDhikr'),
      toggleSitFav: appAction('toggleSitFav'),
      openExtraDeeds: appAction('openExtraDeeds'),
      extraDeedsBack: appAction('extraDeedsBack'),
      openVolPrayers: appAction('openVolPrayers'),
      volPrayersBack: appAction('volPrayersBack'),
      openMasjidCheckins: appAction('openMasjidCheckins'),
      openChallengeDetail: appAction('openChallengeDetail'),
      openIqDrawer: appAction('openIqDrawer'),
      openNotifDrawer: appAction('openNotifDrawer'),
      closeActiveSheet: appAction('closeActiveSheet'),
      toggleAvatarPicker: function() {
        if (window.Auth && typeof window.Auth.show === 'function') {
          window.Auth.show('avatar');
        } else {
          toast(iqIcon('user'), 'Avatar picker unavailable', false, 2000);
        }
      },
      lockApp: function() {
        if (window.Auth && typeof window.Auth.lockUser === 'function') {
          window.Auth.lockUser();
        }
      },
      openSecuritySettings: function() {
        if (window.Auth && typeof window.Auth.show === 'function') {
          window.Auth.show('security');
        }
      },
      openProfilePicker: function() {
        if (window.Auth && typeof window.Auth.show === 'function') {
          window.Auth.show('profiles');
        }
      }
    };
    window.iqSetTheme = iqSetTheme;
    window.closeToastOverlay = closeToastOverlay;
    console.log('Ibadah Quest initialized. window.App is set.');
  }

  function init() {
    try { if (typeof window.resolveCurrentUser === 'function') window.resolveCurrentUser(); } catch(e) { console.error('Step 0 resolve user failed:', e); }
    try { S = window.loadState(); } catch(e) { console.error('Step 1 loadState failed:', e); }
    // Corrupt boot: hold the app on the recovery modal; finishInit (and its
    // saveState calls) must not run until the user resolves the corruption.
    if (window.Recovery && window.Recovery.decideBootRoute(window) === 'recovery') {
      showRecoveryModal();
      return;
    }
    finishInit();
  }

  async function initAsync() {
    try { if (typeof window.resolveCurrentUser === 'function') window.resolveCurrentUser(); } catch(e) { console.error('Step 0 resolve user failed:', e); }
    try {
      S = typeof window.loadStateAsync === 'function' ? await window.loadStateAsync() : window.loadState();
    } catch(e) {
      console.error('Step 1 async loadState failed:', e);
      try { S = window.loadState(); } catch(fallbackError) { console.error('Step 1 fallback loadState failed:', fallbackError); }
    }
    // Corrupt boot: same gate as init() — never reach finishInit while flagged.
    if (window.Recovery && window.Recovery.decideBootRoute(window) === 'recovery') {
      showRecoveryModal();
      return;
    }
    finishInit();
  }

  function startJourney() {
    try { S.introSeen = true; } catch (e) {}
    try { localStorage.setItem('iq_intro_seen', '1'); } catch (e) {}
    try { saveState(); } catch (e) {}
    var overlay = document.getElementById('introOverlay');
    if (overlay) {
      overlay.style.transition = 'opacity 0.4s ease-out';
      overlay.style.opacity = '0';
      setTimeout(function(){
        overlay.classList.remove('visible');
        overlay.style.display = 'none';
        overlay.style.transition = '';
        S.introSeen = true; saveState();
        if (typeof window.isOnboardingComplete === 'function' && !window.isOnboardingComplete()) {
          setTimeout(function() { if (typeof window.startOnboarding === 'function') window.startOnboarding(); }, 80);
        }
      }, 420);
    }
  }
  window.startJourney = startJourney;

  function setupOfflineDetection() {
    try {
      if (typeof navigator === 'undefined' || typeof window === 'undefined') return;
      const banner = document.getElementById('offlineBanner');
      if (!banner) return;
      if (typeof window.addEventListener !== 'function') return;
      function update() {
        banner.style.display = navigator.onLine ? 'none' : 'flex';
      }
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
      update();
    } catch(e) {}
  }
  setupOfflineDetection();

  if (window.storageReady) {
    Promise.resolve(window.storageReady).then(initAsync).catch(function(e) {
      console.error('Ibadah Quest async init error:', e);
      console.error('Stack:', e.stack);
      try {
        init();
      } catch(initError) {
        console.error('Ibadah Quest sync fallback init error:', initError);
      }
    });
  } else {
    try {
      init();
    } catch(e) {
      console.error('Ibadah Quest init error:', e);
      console.error('Stack:', e.stack);
    }
  }
})();
