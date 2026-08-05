// features/spiritual-growth/well.js
// Water Well — Fill the well with your deeds

(function() {
  const CAPTIONS = ["The well awaits its first drop.","Every deed fills the well.","Water rises with each prayer.","The well is half full — persist.","Patience fills the well.","Nearly overflowing — keep going.","The well overflows with blessings."];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  function wellSVG(progress) {
    const waterH = progress * 55;
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#0b1114" rx="10"/>
      <rect x="30" y="40" width="60" height="80" fill="#8B4513" rx="5"/>
      <rect x="35" y="45" width="50" height="70" fill="#0b1114"/>
      <rect x="35" y="${110-waterH}" width="50" height="${waterH}" fill="#1E90FF" opacity="0.7" rx="2"/>
      <rect x="25" y="30" width="70" height="10" fill="#8B4513"/>
      <rect x="55" y="20" width="10" height="15" fill="#8B4513"/>
      <rect x="50" y="25" width="20" height="15" fill="#D4AF37" rx="2"/>
      <line x1="60" y1="25" x2="60" y2="15" stroke="#8B4513" stroke-width="2"/>
    </svg>`;
  }

  function renderWell() {
    const el = document.getElementById('wellArea');
    if (!el || !SpiritualGrowth.isVisible('well')) {
      if (el) el.innerHTML = '';
      return;
    }
    const progress = SpiritualGrowth.getProgress('well');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your well is full — water of life flows.';
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${wellSVG(progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Water Well <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderWell = renderWell;
})();