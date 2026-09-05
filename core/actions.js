(function() {
  // ═══════════════════════════════════════════════════════
  function toast(icon, msg, conf=false, ms=2600) {
    window._modalTriggerEl = document.activeElement;
    const ov=document.getElementById('toastOverlay'); ov.innerHTML=`<div class="toast-box"><span style="font-size:2.5rem">${icon}</span><h3>${msg}</h3></div>`;
    ov.style.display='flex'; ov.classList.add('show'); playSound(conf ? 'chime' : 'pop');
    ov.style.pointerEvents='auto';
    if(conf) for(let i=0;i<30;i++){ const el=document.createElement('span'); el.className='confetti'; el.setAttribute('aria-hidden','true'); el.textContent=[iqEmoji('sparkles'),iqEmoji('star'),iqEmoji('sparkles'),iqEmoji('zap')][i%4]; el.style.left=Math.random()*100+'%'; el.style.top='-20px'; el.style.setProperty('--fall-dur',(2+Math.random()*3)+'s'); el.style.setProperty('--rot',(Math.random()*720-360)+'deg'); document.body.appendChild(el); setTimeout(()=>el.remove(),3000); }
    if(ov._t) clearTimeout(ov._t);
    if(ms>0) ov._t=setTimeout(()=>{ ov.classList.remove('show'); setTimeout(()=>{ ov.style.display='none'; ov.innerHTML=''; },300); ov.style.pointerEvents='none'; },ms);
    ov.onclick=()=>{ ov.classList.remove('show'); setTimeout(()=>{ ov.style.display='none'; ov.innerHTML=''; },300); ov.style.pointerEvents='none'; if(ov._t) clearTimeout(ov._t); };
  }
  window.toast = toast;


  function switchUser() { const inp=document.getElementById('usernameInput'); if(!inp?.value.trim()) return; saveState(); currentUser=inp.value.trim(); localStorage.setItem(USER_KEY,currentUser); S=window.loadState(); initApp(); }
  function logout() {
    saveState();
    currentUser = 'default';
    try { localStorage.setItem(USER_KEY, currentUser); } catch (e) {}
    S = window.loadState();
    initApp();
  }
  function resetAll() {
    if (!confirm(iqEmoji('alert-triangle') + ' Reset all data? This cannot be undone.')) return;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(PREFIX) || k === USER_KEY)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    if (window.Storage && window.Storage.destroy) {
      window.Storage.destroy(currentUser).catch(function() {});
    }
    S = freshState();
    saveState();
    renderAll();
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
    var proceed = function() {
      var token = prompt('Type RESET to erase corrupted data and start fresh:');
      if (!window.Recovery.freshStartAllowed(token)) { toast(iqIcon('info'), 'Confirmation did not match. Nothing was erased.'); return; }
      S = window.freshState();
      saveState();
      toast(iqIcon('sprout'), 'Fresh start ready.');
      continueBootAfterRecovery();
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
  function claimBonus() { const t=today(); if(S.lbd===t) return; const b=S.cs>=7?75:30; applyXpDelta(b); S.lbd=t; saveAndRenderDirty(); toast(iqIcon('gift'),'Daily Bonus: +'+b+' XP!'); }
  window.claimBonus = claimBonus;
  function selectAvatar(emoji) {
    S.avatar = emoji;
    saveState();
    renderProfile();
  }
  function selectTitle(id) { if(!S.ownedTitles||!S.ownedTitles.includes(id))return; S.activeTitle=id; saveState(); renderProfile(); }
  window.selectTitle = selectTitle;
  function selectFrame(id) { if(!S.ownedFrames||!S.ownedFrames.includes(id))return; S.activeFrame=id; saveState(); renderProfile(); }
  window.selectFrame = selectFrame;

  const NEW_POOL_TITLES = {
  zakatrules:    iqIcon('wallet') + ' Zakat — Purifying Your Wealth',
  salahrules:    iqIcon('mosque') + ' Salah — The Pillar of Prayer',
  sawmrules:     iqIcon('moon') + ' Sawm — The Fast of Ramadan',
  hajjrules:     iqIcon('mosque') + ' Hajj — The Sacred Pilgrimage',
  purification:  iqIcon('droplets') + ' Purification (Taharah)',
  trade:         iqIcon('handshake') + ' Islamic Trade & Commerce',
  marriagelaws:  iqIcon('heart') + ' Marriage Laws in Islam',
  inheritance:   iqIcon('scroll') + ' Laws of Inheritance (Mirath)',
  halaldiet:     iqIcon('utensils') + ' Halal Diet & Forbidden Foods',
  oaths:         iqIcon('hand-heart') + ' Oaths & Vows in Islam',
  umayyads:      iqIcon('castle') + ' The Umayyad Caliphate',
  abbasids:      iqIcon('scroll') + ' The Abbasid Golden Age',
  andalus:       iqIcon('castle') + ' Islamic Spain (Al-Andalus)',
  ottomans:      iqIcon('mosque') + ' The Ottoman Empire',
  mamluks:       iqIcon('target') + ' The Mamluk Sultanate',
  seljuks:       iqIcon('target') + ' The Seljuk Empire',
  fatimids:      iqIcon('moon') + ' The Fatimid Caliphate',
  ayyubids:      iqIcon('shield') + ' The Ayyubid Dynasty',
  modernhist:    iqIcon('globe') + ' Modern Islamic History',
  ancientprophets:iqIcon('clock') + ' Ancient Prophets & Nations',
  sufism:        iqIcon('heart') + ' Sufism & Spiritual Paths',
  tazkiyah:      iqIcon('sparkles') + ' Tazkiyah — Soul Purification',
  asceticism:    iqIcon('leaf') + ' Asceticism (Zuhd)',
  fear:          iqIcon('alert-triangle') + ' Fear of Allah (Khawf)',
  hope:          iqIcon('heart') + ' Hope in Allah (Raja)',
  loveofallah:   iqIcon('heart') + ' Love of Allah',
  contentment:   iqIcon('heart') + ' Contentment (Qana\'ah)',
  reflection:    iqIcon('pencil') + ' Reflection & Contemplation',
  technology:    iqIcon('zap') + ' Technology & Islam',
  socialmedia:   iqIcon('globe') + ' Social Media & Islam',
  ethics:        iqIcon('handshake') + ' Islamic Ethics',
  bioethics:     iqIcon('dna') + ' Islamic Bioethics',
  modfinance:    iqIcon('credit-card') + ' Modern Islamic Finance',
  politics:      iqIcon('castle') + ' Islam & Politics',
  green:         iqIcon('sprout') + ' Green Islam & Ecology',
  mentalhealth:  iqIcon('brain') + ' Mental Health in Islam',
  youth:         iqIcon('user') + ' Youth & Islamic Identity',
  education:     iqIcon('book-open') + ' Islamic Education',
  mecca:         iqIcon('mosque') + ' Mecca — The Holy City',
  medina:        iqIcon('mosque') + ' Medina — City of the Prophet',
  jerusalem:     iqIcon('mosque') + ' Jerusalem — Al-Quds',
  damascus:      iqIcon('castle') + ' Damascus — Ancient Capital',
  baghdad:       iqIcon('scroll') + ' Baghdad — House of Wisdom',
  cairo:         iqIcon('castle') + ' Cairo — Gateway of Egypt',
  cordoba:       iqIcon('castle') + ' Cordoba — Light of the West',
  istanbul:      iqIcon('mosque') + ' Istanbul — City of Empires',
  bukhara:       iqIcon('mosque') + ' Bukhara — City of Knowledge',
  samarkand:     iqIcon('globe') + ' Samarkand — Silk Road Jewel',
  calligraphy:   iqIcon('pen-tool') + ' Islamic Calligraphy',
  architecture:  iqIcon('castle') + ' Islamic Architecture',
  geometry:      iqIcon('sparkles') + ' Islamic Geometric Art',
  poetryart:     iqIcon('scroll') + ' Islamic Poetry',
  literature:    iqIcon('book-open') + ' Islamic Literature',
  nasheeds:      iqIcon('sparkles') + ' Nasheeds & Spiritual Music',
  illumination:  iqIcon('sparkles') + ' Manuscript Illumination',
  textiles:      iqIcon('sparkles') + ' Islamic Textiles',
  ceramics:      iqIcon('sparkles') + ' Islamic Ceramics',
  woodwork:      iqIcon('sparkles') + ' Islamic Woodwork',
  abuhanifa:     iqIcon('brain') + ' Imam Abu Hanifa',
  malik:         iqIcon('brain') + ' Imam Malik ibn Anas',
  shafii:        iqIcon('brain') + ' Imam Al-Shafi\'i',
  ahmad:         iqIcon('brain') + ' Imam Ahmad ibn Hanbal',
  alghazali:     iqIcon('brain') + ' Al-Ghazali — Proof of Islam',
  ibntaymiyyah:  iqIcon('brain') + ' Ibn Taymiyyah',
  ibnkhaldun:    iqIcon('brain') + ' Ibn Khaldun — Father of Sociology',
  ibnrushd:      iqIcon('brain') + ' Ibn Rushd (Averroes)',
  ibnsina:       iqIcon('brain') + ' Ibn Sina (Avicenna)',
  alkhwarizmi:   iqIcon('brain') + ' Al-Khwarizmi — Father of Algebra',
  arabicgrammar: iqIcon('book-open') + ' Arabic Grammar (Nahw)',
  vocab:         iqIcon('book-open') + ' Arabic Vocabulary',
  rhetoric:      iqIcon('message-circle') + ' Arabic Rhetoric (Balagha)',
  morphology:    iqIcon('sparkles') + ' Arabic Morphology (Sarf)',
  pronunciation: iqIcon('sparkles') + ' Tajweed & Pronunciation',
  poetry:        iqIcon('scroll') + ' Arabic Poetry',
  proverbs:      iqIcon('zap') + ' Arabic Proverbs',
  etymology:     iqIcon('search') + ' Arabic Etymology',
  dialects:      iqIcon('globe') + ' Arabic Dialects',
  scripts:       iqIcon('pencil') + ' Arabic Scripts',
  brotherhood:   iqIcon('handshake') + ' Brotherhood in Islam',
  sisterhood:    iqIcon('flower') + ' Sisterhood in Islam',
  orphans2:      iqIcon('heart') + ' Care for Orphans',
  elderly:       iqIcon('user') + ' Respecting the Elderly',
  disabled:      iqIcon('heart') + ' Inclusion & Disability',
  antiracism:    iqIcon('globe') + ' Anti-Racism in Islam',
  poverty:       iqIcon('heart') + ' Poverty & Social Justice',
  volunteering:  iqIcon('heart') + ' Volunteering in Islam',
  epistemology:  iqIcon('brain') + ' Islamic Epistemology',
  ontology:      iqIcon('brain') + ' Islamic Ontology',
  logic:         iqIcon('sparkles') + ' Logic in Islamic Thought',
  kalam:         iqIcon('message-circle') + ' Ilm al-Kalam (Theology)',
  reason:        iqIcon('zap') + ' Reason & Revelation',
  freewill:      iqIcon('handshake') + ' Free Will & Qadar',
  problemofevil: iqIcon('moon') + ' The Problem of Evil',
  prophethood:   iqIcon('scroll') + ' Nubuwwah (Prophethood)',
  existence:     iqIcon('sparkles') + ' Existence & Tawhid'
};
  window.NEW_POOLS = NEW_POOLS;
Object.keys(NEW_POOLS).forEach(k => {
  window['render' + k] = function() {
    const title = NEW_POOL_TITLES[k] || (iqIcon('sparkles') + ' ' + k.charAt(0).toUpperCase() + k.slice(1));
    poolRender(k + 'Area', title, NEW_POOLS[k], k + 'Idx');
  }
});

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
    window._modalTriggerEl = document.activeElement;
    ov.innerHTML = html;
    ov.style.display = 'flex';
    ov.classList.add('show');
    ov.style.pointerEvents = 'auto';
    return ov;
  }
  window.openToastModal = openToastModal;
  function closeToastOverlay() {
    var toastOverlay = document.getElementById('toastOverlay');
    if (!toastOverlay) return;
    toastOverlay.classList.remove('show');
    toastOverlay.style.display = 'none';
    toastOverlay.innerHTML = '';
    toastOverlay.style.pointerEvents = 'none';
    if (window._modalTriggerEl && window._modalTriggerEl.focus) {
      window._modalTriggerEl.focus();
      window._modalTriggerEl = null;
    }
    if (typeof window._iqModalDone === 'function') { var cb = window._iqModalDone; window._iqModalDone = null; setTimeout(cb, 300); }
  }

  // Theme toggle keyboard support
  function initThemeToggleKeyboard() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.toggleTheme();
      }
    });
  }

  function _escAttr(s){ return String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }
  function _findT1ByCat(cat){ var esc=_escAttr(cat); try{return document.querySelector('.t1-btn[data-cat="' + esc + '"]');}catch(e){ var els=document.querySelectorAll('.t1-btn'); for(var i=0;i<els.length;i++) if(els[i].getAttribute('data-cat')===cat) return els[i]; return null; } }
  function _findChipByCatId(catId){ var esc=_escAttr(catId); try{return document.querySelector('.cat-chip[onclick*="' + esc + '"]');}catch(e){ var els=document.querySelectorAll('.cat-chip'); for(var i=0;i<els.length;i++){ var oc=els[i].getAttribute('onclick')||''; if(oc.indexOf(catId)>-1) return els[i]; } return null; } }

  function _parseHashAndNavigate() {
    const hash = location.hash;
    if (hash && hash.startsWith('#/')) {
      const parts = hash.slice(2).split('/');
      if (parts.length === 2) {
        const cat = decodeURIComponent(parts[0] || '');
        const tab = decodeURIComponent(parts[1] || '');
        const btn = _findT1ByCat(cat);
        if (btn) {
          window._hashNavigating = true;
          window.switchCategory(cat, btn);
          const { catObj, tabBtn } = window._findTabBtn(cat, tab);
          if (catObj) {
            const chipBtn = _findChipByCatId(catObj.id);
            if (chipBtn) window.selectCategory(catObj.id, chipBtn);
          }
          if (tabBtn) {
            window.activateTab(tab, tabBtn);
          } else {
            window.activateTab(tab, null);
          }
          window._hashNavigating = false;
          return true;
        }
      }
    }
    return false;
  }

  function _initHashRouting() {
    window.addEventListener('popstate', function(e) {
      if (e.state && e.state.cat && e.state.tab) {
        window._hashNavigating = true;
        const btn = _findT1ByCat(e.state.cat);
        if (btn) window.switchCategory(e.state.cat, btn);
        const { catObj, tabBtn } = window._findTabBtn(e.state.cat, e.state.tab);
        if (catObj) {
          const chipBtn = _findChipByCatId(catObj.id);
          if (chipBtn) window.selectCategory(catObj.id, chipBtn);
        }
        if (tabBtn) {
          window.activateTab(e.state.tab, tabBtn);
        } else {
          window.activateTab(e.state.tab, null);
        }
        window._hashNavigating = false;
      }
    });
  }

  function initApp() {
  const overlay = document.getElementById('introOverlay');
  const introSeen = S ? !!S.introSeen : true;
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
  try { window.applyTheme(); } catch(e) { console.error('applyTheme in initApp failed:', e); }

    const t = today();
    if (S.lad !== t) {
      window._iqPrevLad = S.lad;
      S.lad = t;
      if (S.ab && S.ab.exp < t) S.ab = null;
      if (typeof window.recalc === 'function') window.recalc();
      saveState();
      // Mid-session boots (switch user / import / logout): deferred features are
      // already loaded, so run consistency checks now instead of waiting for a
      // DOMContentLoaded hook that already fired.
      if (typeof window.checkConsistency === 'function') {
        try { window.checkConsistency(); } catch(e) { console.warn('consistency check failed:', e); }
        try { if (window.checkWeeklyConsistency) window.checkWeeklyConsistency(); } catch(e) {}
      }
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
    S.lv=lvFrom(S.xp); saveState(); initCalView(); renderAll();
    if (window.renderDailyContent) window.renderDailyContent();
    const modalQueue = [];
    if (window.showWeeklySummary) modalQueue.push(window.showWeeklySummary);
    if (window.showDailySummary) modalQueue.push(window.showDailySummary);
    if (window.showDailyRitual) modalQueue.push(window.showDailyRitual);
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
        const savedCat = S ? S.lastCat : null;
        const savedSub = S ? S.lastSub : null;
        let activeBtn = savedCat ? _findT1ByCat(savedCat) : null;
        if (!activeBtn) activeBtn = document.querySelector('.t1-btn.active');
        const activeCat = activeBtn ? activeBtn.getAttribute('data-cat') : 'ibadah';
        window.switchCategory(activeCat, activeBtn);
        if (savedSub) {
          var escSub = _escAttr(savedSub); var subBtn = null;
          try { subBtn = document.querySelector('[data-tab="' + escSub + '"]'); } catch(e){ var els=document.querySelectorAll('[data-tab]'); for(var i=0;i<els.length;i++) if(els[i].getAttribute('data-tab')===savedSub){ subBtn=els[i]; break; } }
          if (subBtn) subBtn.click();
        }
      }
    } catch(e) { console.warn('Initial nav render failed:', e); }
  }

  function finishInit() {
    try { window.applyTheme(); } catch(e) { console.error('Step 2 applyTheme failed:', e); }
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
    try { if (window.initTierTabKeyboardNav) window.initTierTabKeyboardNav(); } catch(e) { console.error('Step 7 tier tab keyboard nav failed:', e); }
    try { if (window.initTier2TabKeyboardNav) window.initTier2TabKeyboardNav(); } catch(e) { console.error('Step 8 tier2 tab keyboard nav failed:', e); }
    try { if (window.initBnavKeyboardNav) window.initBnavKeyboardNav(); } catch(e) { console.error('Step 8c bnav keyboard nav failed:', e); }
    try { if (window.populateTier1Icons) window.populateTier1Icons(); } catch(e) { console.error('Step 8b tier1 icons failed:', e); }
    try { initModalKeyboardHandlers(); } catch(e) { console.error('Step 9 modal keyboard handlers failed:', e); }
    try { initThemeToggleKeyboard(); } catch(e) { console.error('Step 10 theme toggle keyboard failed:', e); }
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
        try { if (window.autoTrackJourneyProgress) window.autoTrackJourneyProgress(); } catch(e) { console.error('Post-defer journey tracking failed:', e); }
        try { if (window.checkConsistency) window.checkConsistency(); } catch(e) { console.error('Post-defer consistency check failed:', e); }
        try { if (window.checkWeeklyConsistency) window.checkWeeklyConsistency(); } catch(e) { console.error('Post-defer weekly consistency failed:', e); }
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
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.card-item, .vol-card, .shop-card')) {
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
      toggleP: window.toggleP, toggleV: window.toggleV, toggleD: window.toggleD, buy: window.buy,
      detail: (id) => toast(iqIcon('alert-triangle'), DETAILS[id]||'Voluntary Prayer', false, 4000),
      tip: (id) => toast(iqIcon('zap'), TIPS[id]||'A beautiful deed!', false, 4000),
      toggleQuest: window.toggleQuest, addGratitude: window.addGratitude, toggleFasting: window.toggleFasting, setCharityGoals: window.setCharityGoals,
      grantDailyXp: window.grantDailyXp, grantCappedDailyXp: window.grantCappedDailyXp,
      logWater: appAction('logWater'),
      logSleep: appAction('logSleep'),
      logExercise: appAction('logExercise'),
      toggleMeal: appAction('toggleMeal'),
      addMemorization: window.addMemorization, toggleMorning: window.toggleMorning, toggleEvening: window.toggleEvening,
      toggleTafsir: appAction('toggleTafsir'), setTafsirEdition: appAction('setTafsirEdition'), switchUser, logout, resetAll, exportData, importData, toggleBookmark, isBookmarked, toggleVolCat: appAction('toggleVolCat'), toggleDeedCat: appAction('toggleDeedCat'),
      openMuhasabah: appAction('openMuhasabah'),
      dismissMuhasabah: appAction('dismissMuhasabah'),
      joinJourney: appAction('joinJourney'),
      manualRefresh: window.manualRefreshContent, ensureQuranLoaded: window.ensureQuranLoaded, ensureHadithLoaded: window.ensureHadithLoaded,
      claimBonus: window.claimBonus,
      recoverSalvage, recoverFresh, recoverImport,
      setQuranView: window.setQuranView, quranSearchFilter: window.quranSearchFilter, openQuranSurah: window.openQuranSurah, quranBack: window.quranBack, openQuranJuz: window.openQuranJuz,
      openHadithCollection: window.openHadithCollection, openHadithBook: window.openHadithBook, hadithBack: window.hadithBack,
      playQuranVerse: window.playQuranVerse, playSurah: window.playSurah, stopSurah: window.stopSurah, setQuranReciter: window.setQuranReciter, playJuz: window.playJuz, updateJuzButton: window.updateJuzButton,
      calPrevMonth: window.calPrevMonth, calNextMonth: window.calNextMonth, calGoToday: window.calGoToday, selectAvatar, selectTitle, selectFrame,
      setTheme: window.setTheme, toggleTheme: window.toggleTheme,
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
      toggleAvatarPicker: () => toast(iqIcon('user'), 'Avatar picker coming soon!', false, 2000)
    };
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
    var overlay = document.getElementById('introOverlay');
    if (overlay) {
      overlay.style.transition = 'opacity 0.8s ease-in-out';
      overlay.style.opacity = '0';
      setTimeout(function(){
        overlay.classList.remove('visible');
        overlay.style.display = 'none';
        overlay.style.transition = '';
        S.introSeen = true; saveState();
        if (typeof window.isOnboardingComplete === 'function' && !window.isOnboardingComplete()) {
          setTimeout(function() { window.startOnboarding(); }, 400);
        }
      }, 800);
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
