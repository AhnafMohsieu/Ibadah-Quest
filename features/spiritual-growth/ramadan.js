// features/spiritual-growth/ramadan.js
// Ramadan Tracker — Track your Ramadan journey

(function() {
  function ramadanSVG(stage) {
    const crescent = 100 - stage * 14;
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#0a0a1a" rx="10"/>
      <circle cx="20" cy="28" r="1.2" fill="#FFF" opacity="0.7"/>
      <circle cx="98" cy="24" r="1.5" fill="#FFF" opacity="0.6"/>
      <circle cx="40" cy="16" r="1" fill="#FFF" opacity="0.8"/>
      <circle cx="82" cy="18" r="1.2" fill="#FFF" opacity="0.5"/>
      <circle cx="58" cy="10" r="0.8" fill="#FFF" opacity="0.6"/>
      <circle cx="60" cy="60" r="32" fill="#F5F5DC"/>
      <circle cx="60" cy="60" r="30" fill="#0a0a1a"
              clip-path="inset(0 ${crescent}% 0 0)"/>
      <circle cx="60" cy="60" r="38" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.25"/>
    </svg>`;
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
        <div class="spiritual-stage-name">${progress.icon} Ramadan Tracker</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderRamadan = renderRamadan;
})();