// features/spiritual-growth/boat.js
// Journey Boat — Sail across the ocean to Jannah

(function() {
  const CAPTIONS = ["The journey begins at the dock.","Set sail with Bismillah.","The open sea stretches before you.","Storms test the steadfast.","Calm waters reward patience.","Paradise Island appears ahead.","You have reached Jannah."];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  function boatSVG(stage, progress) {
    const p = Math.max(0, Math.min(1, progress || 0));
    let sky = 'var(--card-bg)';
    if (stage >= 3) sky = '#5B9BD5';
    if (stage === 4) sky = '#2E4053';
    if (stage >= 5) sky = '#F4C27A';
    let h = `<rect width="120" height="132" fill="${sky}" opacity="0.85" rx="10"/>`;
    if (stage === 3) h += `<circle cx="92" cy="34" r="13" fill="var(--accent)"/>`;
    if (stage >= 5) h += `<circle cx="92" cy="44" r="15" fill="var(--accent)"/>`;
    if (stage === 4) {
      h += `<path d="M20 34 Q35 20 52 32 Q62 20 76 30 Q90 22 100 34 L100 44 L20 44 Z" fill="#39464F"/>`;
      h += `<polyline points="50 54 58 68 54 68 62 82" fill="none" stroke="var(--accent)" stroke-width="2.5"/>`;
    }
    if (stage >= 7) h += `<path d="M84 18 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--accent)"/>`;
    if (stage >= 6) {
      h += `<path d="M12 108 Q24 90 36 108 Z" fill="var(--green)"/>`;
      h += `<path d="M14 108 Q24 98 34 108" fill="none" stroke="var(--green)" stroke-width="2"/>`;
    }
    h += `<path d="M0 118 Q15 110 30 118 T60 118 T90 118 T120 118 V132 H0 Z" fill="${stage === 4 ? '#1B2A35' : '#3A6EA5'}"/>`;
    h += `<path d="M44 100 Q60 112 78 100 L76 108 Q60 118 46 108 Z" fill="#8B5A2B"/>`;
    const sailP = stage >= 3 ? 1 : stage === 2 ? (0.4 + p * 0.6) : 0;
    if (sailP > 0) {
      h += `<line x1="60" y1="50" x2="60" y2="100" stroke="var(--text2)" stroke-width="2"/>`;
      h += `<path d="M60 ${(104 - 34 * sailP).toFixed(1)} L60 ${(100).toFixed(1)} L${(60 + 22 * sailP).toFixed(1)} ${(104 - 24 * sailP).toFixed(1)} Z" fill="var(--accent)" opacity="0.9"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 132">${h}</svg>`;
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