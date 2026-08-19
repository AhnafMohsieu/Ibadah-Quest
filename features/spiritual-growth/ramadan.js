// features/spiritual-growth/ramadan.js
// Ramadan Tracker — Track your Ramadan journey

(function() {
  const CAPTIONS = ["Ramadan begins — purify your soul.","The first week — establish habits.","Mid-Ramadan — momentum builds.","The third week — steadfast.","Laylat al-Qadr approaches.","The final days — maximize rewards.","Eid Mubarak — Ramadan complete."];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  function ramadanSVG(stage) {
    const r = 26 + (stage - 1) * 2;
    let h = `<rect width="120" height="132" fill="var(--card-bg)" rx="10"/>`;
    h += `<circle cx="60" cy="62" r="${r}" fill="var(--accent)" opacity="0.9"/>`;
    if (stage <= 4) {
      const off = stage === 1 ? 18 : stage === 2 ? 12 : stage === 3 ? 7 : 3;
      h += `<circle cx="${60 + off}" cy="62" r="${r - 2}" fill="var(--card-bg)"/>`;
    }
    if (stage >= 6) {
      h += `<circle cx="30" cy="100" r="4" fill="var(--accent)" opacity="0.8"/>`;
      h += `<circle cx="90" cy="94" r="3" fill="var(--accent)" opacity="0.8"/>`;
      h += `<rect x="26" y="104" width="8" height="8" fill="var(--accent)" opacity="0.7"/>`;
    }
    if (stage === 7) {
      h += `<circle cx="60" cy="62" r="${r + 12}" fill="none" stroke="var(--accent)" stroke-width="2" opacity="0.4"/>`;
      h += `<path d="M86 18 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--accent)"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 132">${h}</svg>`;
  }

  function renderRamadan() {
    const el = document.getElementById('ramadanArea');
    if (!el || !SpiritualGrowth.isVisible('ramadan')) {
      if (el) el.innerHTML = '';
      return;
    }
    const progress = SpiritualGrowth.getProgress('ramadan');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Ramadan Mubarak — the blessed month is complete.';
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${ramadanSVG(progress.stage)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${SpiritualGrowth.FEATURE_ICONS.ramadan} Ramadan Tracker <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderRamadan = renderRamadan;
})();