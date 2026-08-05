// features/spiritual-growth/mountain.js
// Mount Nur Climber — Climb the mountain of knowledge

(function() {
  function mountainSVG(stage, progress) {
    const climberY = 130 - progress * 95;
    let scene = '';
    scene += `<polygon points="60,18 8,135 112,135" fill="#8B4513"/>`;
    scene += `<polygon points="60,18 42,55 78,55" fill="#FFF" opacity="0.25"/>`;
    scene += `<path d="M60 135 Q52 115 55 95 Q58 75 48 58 Q42 42 60 18" fill="none" stroke="#D4AF37" stroke-width="2" stroke-dasharray="4,4" opacity="0.6"/>`;
    scene += `<circle cx="48" cy="${climberY}" r="4" fill="#D4AF37"/>
      <line x1="48" y1="${climberY+4}" x2="48" y2="${climberY+12}" stroke="#D4AF37" stroke-width="2"/>
      <line x1="43" y1="${climberY+8}" x2="53" y2="${climberY+8}" stroke="#D4AF37" stroke-width="2"/>`;
    if (stage >= 6) scene += `<ellipse cx="60" cy="22" rx="12" ry="8" fill="#0b1114"/>`;
    if (stage === 7) {
      scene += `<circle cx="60" cy="15" r="16" fill="#FFD700" opacity="0.35"/>`;
      scene += `<circle cx="60" cy="15" r="8" fill="#FFF" opacity="0.5"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#1a1a2e" rx="10"/>
      ${scene}
    </svg>`;
  }

  function renderMountain() {
    const el = document.getElementById('mountainArea');
    if (!el || !SpiritualGrowth.isVisible('mountain')) {
      if (el) el.innerHTML = '';
      return;
    }
    const progress = SpiritualGrowth.getProgress('mountain');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'You have reached the summit — divine light awaits.';
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${mountainSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Mount Nur Climber</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderMountain = renderMountain;
})();