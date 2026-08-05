// features/spiritual-growth/laylat.js
// Laylat al-Qadr Meter — Track the Night of Power

(function() {
  const CAPTIONS = ["Seek this night with sincerity.","The odd nights are blessed.","Increase your worship tonight.","The Night of Power is near.","Stand in prayer this night.","The 27th night — most blessed.","The 29th night — final chance."];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  const STAR_COUNTS = [1, 3, 5, 8, 12, 20, 35];

  function laylatSVG(stage) {
    const n = STAR_COUNTS[stage - 1] || 1;
    let stars = '';
    for (let i = 0; i < n; i++) {
      const x = 10 + ((i * 41 + 23) % 100);
      const y = 8 + ((i * 59 + 11) % 110);
      stars += `<circle cx="${x}" cy="${y}" r="${0.6 + ((i * 7) % 3) * 0.5}" fill="#FFD700" opacity="${0.4 + ((i * 3) % 6) * 0.1}"/>`;
    }
    if (stage === 7) {
      stars += `<circle cx="60" cy="60" r="42" fill="#FFD700" opacity="0.08"/>`;
      stars += `<circle cx="60" cy="60" r="22" fill="#FFD700" opacity="0.15"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#0a0a2a" rx="10"/>
      ${stars}
      <text x="60" y="150" text-anchor="middle" fill="#FFD700" font-size="11" font-family="serif" opacity="0.8">لَيْلَةُ ٱلْقَدْرِ</text>
    </svg>`;
  }

  function renderLaylat() {
    const el = document.getElementById('laylatArea');
    if (!el || !SpiritualGrowth.isVisible('laylat')) {
      if (el) el.innerHTML = '';
      return;
    }
    const progress = SpiritualGrowth.getProgress('laylat');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Laylat al-Qadr — better than a thousand months.';
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${laylatSVG(progress.stage)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Laylat al-Qadr Meter <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderLaylat = renderLaylat;
})();