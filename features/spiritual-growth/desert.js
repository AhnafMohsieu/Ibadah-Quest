// features/spiritual-growth/desert.js
// Desert Garden — Transform desert into oasis

(function() {
  const CAPTIONS = ["Every oasis begins as sand.","Small stones mark the path.","Life emerges in the desert.","Shrubs take root with patience.","Trees grow from sincere deeds.","Flowers bloom with gratitude.","A paradise oasis appears."];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  function desertSVG(stage) {
    let el = '';
    el += `<rect y="120" width="120" height="40" fill="#F4A460" rx="5"/>`;
    if (stage >= 2) {
      el += `<circle cx="30" cy="132" r="3" fill="#8B4513"/>`;
      el += `<circle cx="88" cy="136" r="4" fill="#8B4513"/>`;
      el += `<circle cx="60" cy="128" r="2.5" fill="#8B4513"/>`;
    }
    if (stage >= 3) {
      el += `<rect x="22" y="98" width="9" height="26" fill="#228B22" rx="3"/>`;
      el += `<rect x="17" y="104" width="5" height="10" fill="#228B22" rx="2"/>`;
    }
    if (stage >= 4) {
      el += `<circle cx="78" cy="115" r="13" fill="#2E8B57"/>`;
      el += `<circle cx="72" cy="108" r="9" fill="#3CB371"/>`;
    }
    if (stage >= 5) {
      el += `<rect x="48" y="78" width="9" height="35" fill="#8B4513"/>`;
      el += `<circle cx="52" cy="72" r="16" fill="#228B22"/>`;
    }
    if (stage >= 6) {
      el += `<circle cx="40" cy="115" r="5" fill="#FF69B4"/><circle cx="40" cy="115" r="2.5" fill="#FFF"/>`;
      el += `<circle cx="70" cy="118" r="4" fill="#FFB6C1"/><circle cx="70" cy="118" r="2" fill="#FFF"/>`;
      el += `<circle cx="96" cy="110" r="5" fill="#FF1493"/><circle cx="96" cy="110" r="2.5" fill="#FFF"/>`;
    }
    if (stage === 7) {
      el += `<ellipse cx="60" cy="126" rx="32" ry="10" fill="#1E90FF" opacity="0.55"/>`;
      el += `<circle cx="60" cy="112" r="22" fill="#228B22" opacity="0.4"/>`;
      el += `<circle cx="60" cy="112" r="12" fill="#3CB371" opacity="0.5"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#FFD700" opacity="0.15" rx="10"/>
      ${el}
    </svg>`;
  }

  function renderDesert() {
    const el = document.getElementById('desertArea');
    if (!el || !SpiritualGrowth.isVisible('desert')) {
      if (el) el.innerHTML = '';
      return;
    }
    const progress = SpiritualGrowth.getProgress('desert');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your desert is now a paradise oasis.';
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${desertSVG(progress.stage)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${SpiritualGrowth.FEATURE_ICONS.desert} Desert Garden <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderDesert = renderDesert;
})();