// features/spiritual-growth/heart.js
// Heart Refinement — Transform your heart from stone to light

(function() {
  const CAPTIONS = [
    'The heart begins its transformation.',
    'Sincerity softens the hardest stone.',
    'Each deed polishes the heart.',
    'The heart grows strong with iman.',
    'Purity reflects like silver.',
    'The heart shines like gold.',
    'Your heart is pure light.'
  ];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  const HEART_COLORS = {
    1: '#696969', 2: '#CD853F', 3: '#B87333',
    4: '#4A4A4A', 5: '#C0C0C0', 6: '#FFD700', 7: '#FFF'
  };

  function heartSVG(stage) {
    const color = HEART_COLORS[stage];
    let svg = '';
    if (stage === 7) {
      svg += `<defs>
        <filter id="heartGlow7" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>`;
    }
    svg += `<path d="M60 135 L18 78 Q0 58 18 38 Q36 18 60 48 Q84 18 102 38 Q120 58 102 78 Z"
      fill="${color}" ${stage === 7 ? 'filter="url(#heartGlow7)"' : ''} opacity="0.9"/>`;
    if (stage >= 3) {
      svg += `<path d="M60 90 Q48 74 60 62 Q72 74 60 90 Z" fill="var(--card-bg)" opacity="0.55"/>`;
    }
    if (stage >= 5) {
      svg += `<circle cx="60" cy="78" r="${44 + stage}" fill="none" stroke="var(--gold)" stroke-width="2" opacity="${0.15 + stage * 0.05}"/>`;
    }
    if (stage === 7) {
      svg += `<circle cx="60" cy="80" r="18" fill="#FFF" opacity="0.4"/>`;
      svg += `<path d="M84 22 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--gold)" opacity="0.9"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">${svg}</svg>`;
  }

  function renderHeartRefinement() {
    const el = document.getElementById('heartArea');
    if (!el || !SpiritualGrowth.isVisible('heart')) {
      if (el) el.innerHTML = '';
      return;
    }
    const progress = SpiritualGrowth.getProgress('heart');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your heart is pure light — a reflection of faith.';
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${heartSVG(progress.stage)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${SpiritualGrowth.FEATURE_ICONS.heart} Heart Refinement <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderHeartRefinement = renderHeartRefinement;
})();
