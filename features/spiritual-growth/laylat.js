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
    const count = STAR_COUNTS[Math.min(stage, 7) - 1];
    let h = `<rect width="120" height="132" fill="#0B1114" rx="10"/>`;
    h += `<ellipse cx="60" cy="40" rx="${(30 + stage * 5)}" ry="${(12 + stage * 2)}" fill="var(--accent)" opacity="${(0.05 + stage * 0.04).toFixed(2)}"/>`;
    let seed = 7;
    function rnd() {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    }
    for (let i = 0; i < count; i++) {
      const x = 10 + rnd() * 100;
      const y = 16 + rnd() * 100;
      h += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${stage >= 6 ? 2.4 : 1.6}" fill="var(--accent)" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`;
    }
    const cr = 10 + stage * 1.4;
    h += `<path d="M80 ${(58 - cr).toFixed(1)} a${cr.toFixed(1)} ${cr.toFixed(1)} 0 1 0 0 ${(cr * 2).toFixed(1)} a${(cr - 3).toFixed(1)} ${(cr - 3).toFixed(1)} 0 1 1 0 ${(-(cr * 2)).toFixed(1)} Z" fill="var(--accent)"/>`;
    return `<svg class="spiritual-svg" viewBox="0 0 120 132">${h}</svg>`;
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
        <div class="spiritual-stage-name">${SpiritualGrowth.FEATURE_ICONS.laylat} Laylat al-Qadr Meter <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
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