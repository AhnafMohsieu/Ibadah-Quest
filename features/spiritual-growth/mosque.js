// features/spiritual-growth/mosque.js
// Mosque Builder — Construct a mosque piece by piece

(function () {
  /* Stage-specific motivational captions */
  var STAGE_CAPTIONS = [
    "Every great structure begins with a single intention — Bismillah.",
    "Every great structure begins with a single intention — Bismillah.",
    "With patience and prayer, your walls rise toward the heavens.",
    "A roof of dhikr shields the heart from the storms of doubt.",
    "The dome curves upward — charity shapes the soul's architecture.",
    "Your minaret calls the world to truth; knowledge lights its peak.",
    "The interior fills with sincerity — every tile placed with love.",
    "Alhamdulillah! Your mosque is complete — a house of Allah on earth."
  ];

  function caption(stage) {
    return STAGE_CAPTIONS[stage] || STAGE_CAPTIONS[0];
  }

  function mosqueSVG(stage) {
    var h = '<rect width="120" height="132" fill="var(--card-bg)" rx="10"/>';
    h += '<line x1="10" y1="118" x2="110" y2="118" stroke="var(--text2)" stroke-width="2" opacity="0.35"/>';
    if (stage >= 1) h += '<rect x="30" y="106" width="60" height="9" fill="var(--accent)" opacity="0.8"/>';
    if (stage >= 2) h += '<rect x="34" y="64" width="52" height="42" fill="var(--card-bg)" stroke="var(--accent)" stroke-width="2"/>';
    if (stage >= 3) h += '<path d="M28 64 L60 38 L92 64 Z" fill="var(--accent)" opacity="0.85"/>';
    if (stage >= 4) h += '<path d="M46 38 Q60 8 74 38 Z" fill="var(--accent)"/>';
    if (stage >= 5) h += '<rect x="92" y="58" width="8" height="48" fill="var(--accent)" opacity="0.9"/>' +
      '<circle cx="96" cy="56" r="4" fill="var(--accent)"/>';
    if (stage >= 6) h += '<path d="M46 86 h9 q0 -10 -9 -10 z M74 86 h-9 q0 -10 9 -10 z" fill="var(--accent)" opacity="0.9"/>';
    if (stage === 7) {
      h += '<circle cx="60" cy="70" r="54" fill="none" stroke="var(--accent)" stroke-width="2" opacity="0.35"/>';
      h += '<path d="M86 18 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--accent)" opacity="0.9"/>';
    }
    return '<svg class="spiritual-svg" viewBox="0 0 120 132">' + h + '</svg>';
  }

  function renderMosque() {
    var el = document.getElementById("mosqueArea");
    if (!el || !SpiritualGrowth.isVisible("mosque")) {
      if (el) el.innerHTML = "";
      return;
    }
    var progress = SpiritualGrowth.getProgress("mosque");
    var progressText = progress.xpForNext
      ? progress.xp + "/" + progress.xpForNext + " XP to " + progress.name
      : "Your mosque is complete — a house of Allah.";

    el.innerHTML =
      '<div class="spiritual-card ms-enter">' +
        '<div class="spiritual-svg-wrap">' + mosqueSVG(progress.stage) + '</div>' +
        '<div class="spiritual-info">' +
          '<div class="spiritual-stage-name">' +
            SpiritualGrowth.FEATURE_ICONS.mosque +
            ' Mosque Builder <span class="spiritual-stage-num">Stage ' + progress.stage + '/7</span>' +
          '</div>' +
          '<div class="spiritual-progress">' + progressText + '</div>' +
          '<div class="spiritual-progress-bar">' +
            '<div class="spiritual-progress-fill" style="width:' + Math.round(progress.progress * 100) + '%"></div>' +
          '</div>' +
          '<div class="spiritual-caption">' + caption(progress.stage) + '</div>' +
        '</div>' +
      '</div>';
  }

  window.renderMosque = renderMosque;
})();
