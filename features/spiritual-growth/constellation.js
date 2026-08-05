// features/spiritual-growth/constellation.js
// Star Constellation — Light up the night sky

(function() {
  const CAPTIONS = ["A single star lights the sky.","Each deed adds another star.","Your constellation grows brighter.","Stars multiply with gratitude.","A constellation forms — beautiful.","The night sky reflects your faith.","Your light reaches the galaxies."];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  const STAR_COUNTS = [1, 3, 5, 7, 10, 18, 30];

  function constellationSVG(stage) {
    const n = STAR_COUNTS[stage - 1] || 1;
    let stars = '';
    for (let i = 0; i < n; i++) {
      const x = 12 + ((i * 37 + 19) % 96);
      const y = 10 + ((i * 53 + 7) % 110);
      const r = 1.5 + ((i * 7) % 3) * 0.8;
      stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF" opacity="${0.6 + ((i * 3) % 4) * 0.1}"/>`;
    }
    if (stage >= 6) {
      const pairs = Math.min(8, Math.floor(n / 2));
      for (let i = 0; i < pairs; i++) {
        const x1 = 12 + ((i * 3 + 13) % 96);
        const y1 = 10 + ((i * 3 + 7) % 110);
        const x2 = 12 + (((i + 1) * 3 + 13) % 96);
        const y2 = 10 + (((i + 1) * 3 + 7) % 110);
        stars += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFD700" stroke-width="0.5" opacity="0.2"/>`;
      }
    }
    if (stage === 7) {
      stars += `<circle cx="60" cy="60" r="35" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.2"/>`;
      stars += `<circle cx="60" cy="60" r="18" fill="#FFD700" opacity="0.08"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#0a0a1a" rx="10"/>
      ${stars}
    </svg>`;
  }

  function renderConstellation() {
    const el = document.getElementById('constellationArea');
    if (!el || !SpiritualGrowth.isVisible('constellation')) {
      if (el) el.innerHTML = '';
      return;
    }
    const progress = SpiritualGrowth.getProgress('constellation');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your constellation shines across the galaxy.';
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${constellationSVG(progress.stage)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${SpiritualGrowth.FEATURE_ICONS.constellation} Star Constellation <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderConstellation = renderConstellation;
})();