// features/spiritual-growth/mosque.js
// Mosque Builder — Construct a mosque piece by piece

(function() {
  const CAPTIONS = ["Lay the foundation with Bismillah.","Build your walls with prayer.","Raise the roof with dhikr.","The dome forms with charity.","The minaret stands tall with knowledge.","The interior fills with sincerity.","Your mosque is complete — pray within."];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  function mosqueSVG(stage, progress) {
    let parts = '';
    parts += `<rect x="20" y="120" width="80" height="15" fill="#8B4513" rx="3"/>`;
    if (stage >= 2) parts += `<rect x="25" y="70" width="70" height="50" fill="#f43f5e" opacity="0.8" rx="3"/>`;
    if (stage >= 3) parts += `<polygon points="18,72 60,38 102,72" fill="#8B4513"/>`;
    if (stage >= 4) {
      parts += `<ellipse cx="60" cy="45" rx="22" ry="18" fill="#f43f5e"/>`;
      parts += `<circle cx="60" cy="28" r="5" fill="#FFD700"/>`;
    }
    if (stage >= 5) {
      parts += `<rect x="95" y="45" width="8" height="75" fill="#f43f5e" rx="2"/>`;
      parts += `<ellipse cx="99" cy="40" rx="7" ry="9" fill="#FFD700"/>`;
      parts += `<circle cx="99" cy="32" r="3" fill="#FFD700"/>`;
    }
    if (stage >= 6) {
      parts += `<rect x="42" y="90" width="36" height="30" fill="#0b1114" opacity="0.6" rx="2"/>`;
      parts += `<rect x="48" y="96" width="24" height="24" fill="#fb7185" opacity="0.25" rx="2"/>`;
    }
    if (stage === 7) {
      parts += `<circle cx="60" cy="70" r="55" fill="none" stroke="#f43f5e" stroke-width="2" opacity="0.4"/>`;
      parts += `<circle cx="60" cy="70" r="45" fill="#FFD700" opacity="0.05"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#0b1114" rx="10"/>
      ${parts}
    </svg>`;
  }

  function renderMosque() {
    const el = document.getElementById('mosqueArea');
    if (!el || !SpiritualGrowth.isVisible('mosque')) {
      if (el) el.innerHTML = '';
      return;
    }
    const progress = SpiritualGrowth.getProgress('mosque');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your mosque is complete — a house of Allah.';
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${mosqueSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${SpiritualGrowth.FEATURE_ICONS.mosque} Mosque Builder <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderMosque = renderMosque;
})();