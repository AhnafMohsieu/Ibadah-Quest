// core/xp.js — XP granting, level-up detection, calm celebrations, opt-in sound & light haptics
(function() {
  function isReducedMotion() {
    try {
      return typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  }

  function checkLevelUp(oldLv) {
    if (S.lv > oldLv) {
      const t = lvTitle(S.lv);
      levelUpToast(S.lv, t);
    }
  }

  function applyXpDelta(delta, opts) {
    var oldLv = S.lv;
    S.xp += delta;
    S.lv = lvFrom(S.xp);
    if (!(opts && opts.skipLevelToast)) checkLevelUp(oldLv);
    return { oldLv: oldLv, newLv: S.lv, leveledUp: S.lv > oldLv };
  }

  function spendXp(amount, opts) {
    var clamped = Math.max(0, S.xp - amount);
    var delta = clamped - S.xp; // <= 0
    return applyXpDelta(delta, opts);
  }

  function saveAndRenderDirty() {
    saveState();
    markDirty('today'); markDirty('topbar'); markDirty('lv'); markDirty('progress');
    renderDynamic();
  }

  function grantDailyXp(amount, key) {
    if (!S.xpDaily) S.xpDaily = {};
    var dk = key + '|' + today();
    if (S.xpDaily[dk]) return false;
    S.xpDaily[dk] = true;
    var oldLv = S.lv;
    S.xp += amount;
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
    playSound('pop');
    iqHaptic(10);
    saveState();
    if (typeof renderLv === 'function') renderLv();
    if (typeof renderTopBar === 'function') renderTopBar();
    return true;
  }

  function grantCappedDailyXp(amount, key, cap) {
    if (!S.xpDaily) S.xpDaily = {};
    var ck = key + '|count|' + today();
    var count = S.xpDaily[ck] || 0;
    if (count >= cap) return false;
    S.xpDaily[ck] = count + 1;
    var oldLv = S.lv;
    S.xp += amount;
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
    playSound('pop');
    iqHaptic(10);
    saveState();
    if (typeof renderLv === 'function') renderLv();
    if (typeof renderTopBar === 'function') renderTopBar();
    return true;
  }

  function levelUpToast(lv, title) {
    if (typeof document === 'undefined') return;
    window._modalTriggerEl = document.activeElement;
    const ov = document.getElementById('toastOverlay');
    if (!ov) return;
    var tr = typeof window.t === 'function' ? window.t : function(k) { return k; };
    var nfmt = typeof window.iqFormatNum === 'function' ? window.iqFormatNum : function(v) { return String(v); };
    var safeTitle = typeof window.escapeHTML === 'function' ? window.escapeHTML(title) : String(title || '');
    ov.innerHTML = `<div class="levelup-box" role="status" aria-live="polite">` +
      `<div class="levelup-icon">${iqIcon('sparkles')}</div>` +
      `<div class="levelup-label">${tr('Milestone Reached')}</div>` +
      `<div class="levelup-num iq-tabular">${nfmt(lv)}</div>` +
      `<div class="levelup-title">${safeTitle}</div>` +
      `<div style="font-size:0.82rem;color:var(--text2);margin-top:6px;">${tr('Alhamdulillah — steady consistency')}</div>` +
    `</div>`;
    ov.style.display = 'flex';
    ov.classList.add('show');
    ov.style.pointerEvents = 'auto';
    playSound('chime');
    iqHaptic([30, 50, 30]);
    if (ov._t) clearTimeout(ov._t);
    var delay = isReducedMotion() ? 2200 : 3200;
    ov._t = setTimeout(() => {
      ov.classList.remove('show');
      setTimeout(() => { ov.style.display = 'none'; ov.innerHTML = ''; }, 240);
      ov.style.pointerEvents = 'none';
    }, delay);
    ov.onclick = () => {
      ov.classList.remove('show');
      setTimeout(() => { ov.style.display = 'none'; ov.innerHTML = ''; }, 240);
      ov.style.pointerEvents = 'none';
      if (ov._t) clearTimeout(ov._t);
    };
  }

  let _audioCtx = null;
  function playSound(type) {
    try {
      // Default to silence; non-instrumental chimes play ONLY when user opts in via S.soundEnabled
      if (typeof S === 'undefined' || !S || !S.soundEnabled) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!_audioCtx) _audioCtx = new AC();
      const ctx = _audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.45);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch (e) {}
  }

  window.applyXpDelta = applyXpDelta;
  window.spendXp = spendXp;
  window.saveAndRenderDirty = saveAndRenderDirty;
  window.grantDailyXp = grantDailyXp;
  window.grantCappedDailyXp = grantCappedDailyXp;
  window.checkLevelUp = checkLevelUp;
  window.levelUpToast = levelUpToast;
  function iqHaptic(pattern) {
    try {
      if (typeof S === 'undefined' || !S || !S.dhikrSettings || !S.dhikrSettings.haptic) return;
      if (typeof navigator === 'undefined' || !navigator.vibrate) return;
      navigator.vibrate(pattern == null ? 10 : pattern);
    } catch (e) {}
  }
  window.iqHaptic = iqHaptic;
  window.playSound = playSound;
})();
