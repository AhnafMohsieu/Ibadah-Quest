// features/spiritual-growth/boat.js
// Journey Boat — Sail across the ocean to Jannah

(function() {
  const CAPTIONS = ["The journey begins at the dock.","Set sail with Bismillah.","The open sea stretches before you.","Storms test the steadfast.","Calm waters reward patience.","Paradise Island appears ahead.","You have reached Jannah."];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  function boatSVG(stage, progress) {
    const waterY = 100;
    const boatX = 15 + Math.min(progress, 1) * 75;
    let scene = '';
    scene += `<rect y="${waterY}" width="120" height="60" fill="#1E90FF" opacity="0.55" rx="3"/>`;
    for (let i = 0; i < 4; i++) {
      const wy = waterY + 8 + i * 12;
      scene += `<path d="M0 ${wy} Q30 ${wy-8} 60 ${wy} Q90 ${wy+8} 120 ${wy}" fill="none" stroke="#4A90E2" stroke-width="1.5" opacity="0.4"/>`;
    }
    scene += `<g transform="translate(${boatX}, ${waterY - 18})">
      <path d="M-14 0 L14 0 L10 14 L-10 14 Z" fill="#8B4513"/>
      <line x1="0" y1="0" x2="0" y2="-25" stroke="#8B4513" stroke-width="2"/>
      <polygon points="0,-25 18,-18 0,-10" fill="#FFF" opacity="0.8"/>
    </g>`;
    if (stage >= 6) {
      scene += `<ellipse cx="108" cy="${waterY}" rx="16" ry="8" fill="#2E5D3A"/>`;
      scene += `<circle cx="108" cy="${waterY-15}" r="12" fill="#3E7C4F"/>`;
    }
    if (stage === 7) {
      scene += `<circle cx="108" cy="${waterY-25}" r="18" fill="#FFD700" opacity="0.35"/>`;
      scene += `<circle cx="108" cy="${waterY-25}" r="10" fill="#FFE97D" opacity="0.5"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#87CEEB" rx="10"/>
      ${scene}
    </svg>`;
  }

  function renderBoat() {
    const el = document.getElementById('boatArea');
    if (!el || !SpiritualGrowth.isVisible('boat')) {
      if (el) el.innerHTML = '';
      return;
    }
    const progress = SpiritualGrowth.getProgress('boat');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'You have reached Jannah — the eternal abode.';
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${boatSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${SpiritualGrowth.FEATURE_ICONS.boat} Journey Boat <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderBoat = renderBoat;
})();