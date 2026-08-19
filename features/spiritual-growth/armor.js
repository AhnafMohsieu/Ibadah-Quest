// features/spiritual-growth/armor.js
// Spiritual Armor — Collect pieces of protection

(function() {
  const CAPTIONS = [
    'Truth is the first piece of armor.',
    'Stand firm on the path.',
    'Guard your thoughts and intentions.',
    'Patience shields against trials.',
    'Faith deflects doubts.',
    'Knowledge is your sharpest weapon.',
    'You are fully armored with taqwa.'
  ];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }

  function armorSVG(stage) {
    let parts = '';
    if (stage >= 1) {
      parts += `<rect x="35" y="95" width="50" height="10" fill="var(--accent)" rx="2"/>`;
      parts += `<circle cx="60" cy="100" r="5" fill="var(--accent-light)"/>`;
    }
    if (stage >= 2) {
      parts += `<rect x="32" y="122" width="16" height="20" fill="#8B4513" rx="3"/>`;
      parts += `<rect x="72" y="122" width="16" height="20" fill="#8B4513" rx="3"/>`;
    }
    if (stage >= 3) {
      parts += `<ellipse cx="60" cy="30" rx="18" ry="14" fill="var(--accent)"/>`;
      parts += `<rect x="56" y="40" width="8" height="6" fill="var(--accent)"/>`;
    }
    if (stage >= 4) {
      parts += `<rect x="42" y="52" width="36" height="38" fill="var(--accent)" opacity="0.7" rx="5"/>`;
    }
    if (stage >= 5) {
      parts += `<ellipse cx="24" cy="70" rx="14" ry="18" fill="var(--accent-light)"/>`;
      parts += `<ellipse cx="24" cy="70" rx="9" ry="14" fill="var(--accent)"/>`;
    }
    if (stage >= 6) {
      parts += `<rect x="93" y="42" width="4" height="55" fill="#C0C0C0" rx="2"/>`;
      parts += `<rect x="88" y="48" width="14" height="5" fill="#8B4513" rx="1"/>`;
    }
    if (stage === 7) {
      parts += `<circle cx="60" cy="80" r="48" fill="none" stroke="var(--accent)" stroke-width="2" opacity="0.35"/>`;
      parts += `<path d="M84 24 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--accent)" opacity="0.9"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">${parts}</svg>`;
  }

  function renderArmor() {
    const el = document.getElementById('armorArea');
    if (!el || !SpiritualGrowth.isVisible('armor')) {
      if (el) el.innerHTML = '';
      return;
    }
    const progress = SpiritualGrowth.getProgress('armor');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your armor is complete — full protection.';
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${armorSVG(progress.stage)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${SpiritualGrowth.FEATURE_ICONS.armor} Spiritual Armor <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderArmor = renderArmor;
})();