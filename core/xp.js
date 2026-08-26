// core/xp.js — XP granting, level-up detection, sound effects
(function() {
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
    saveState();
    if (typeof renderLv === 'function') renderLv();
    if (typeof renderTopBar === 'function') renderTopBar();
    return true;
  }

  function levelUpToast(lv, title) {
    window._modalTriggerEl = document.activeElement;
    const ov = document.getElementById('toastOverlay');
    ov.innerHTML = `<div class="levelup-box"><div class="levelup-glow"></div><div class="levelup-icon">${iqIcon('zap')}</div><div class="levelup-label">LEVEL UP</div><div class="levelup-num">${lv}</div><div class="levelup-title">${title}</div></div>`;
    ov.style.display = 'flex';
    ov.classList.add('show');
    ov.style.pointerEvents = 'auto';
    playSound('chime');
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('span');
      el.className = 'confetti';
      el.setAttribute('aria-hidden', 'true');
      el.textContent = [iqEmoji('star'), iqEmoji('sparkles'), iqEmoji('moon'), iqEmoji('sparkles'), iqEmoji('star'), iqEmoji('crescent')][i % 6];
      el.style.left = Math.random() * 100 + '%';
      el.style.top = '-20px';
      el.style.setProperty('--fall-dur', (2 + Math.random() * 4) + 's');
      el.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
    if (ov._t) clearTimeout(ov._t);
    ov._t = setTimeout(() => {
      ov.classList.remove('show');
      setTimeout(() => { ov.style.display = 'none'; ov.innerHTML = ''; }, 400);
      ov.style.pointerEvents = 'none';
    }, 4000);
    ov.onclick = () => {
      ov.classList.remove('show');
      setTimeout(() => { ov.style.display = 'none'; ov.innerHTML = ''; }, 400);
      ov.style.pointerEvents = 'none';
      if (ov._t) clearTimeout(ov._t);
    };
  }

  let _audioCtx = null;
  function playSound(type) {
    try {
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
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'chime') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
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
  window.playSound = playSound;
})();