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
    var p = "";

    /* ── SVG defs: gradients, filters ── */
    p += '<defs>';
    // Sky adapts to theme: uses bg-accent (light) and card-bg (dark)
    p += '<linearGradient id="msSky" x1="0" y1="0" x2="0" y2="1">';
    p += '<stop offset="0%" stop-color="var(--bg-accent)"/>';
    p += '<stop offset="100%" stop-color="var(--card-bg)"/>';
    p += '</linearGradient>';
    // Gold gradients for walls, dome, minaret
    p += '<linearGradient id="msGold" x1="0" y1="0" x2="0" y2="1">';
    p += '<stop offset="0%" stop-color="var(--gold-light)"/>';
    p += '<stop offset="100%" stop-color="var(--gold)"/>';
    p += '</linearGradient>';
    p += '<linearGradient id="msDome" x1="0" y1="0" x2="0" y2="1">';
    p += '<stop offset="0%" stop-color="var(--gold-light)"/>';
    p += '<stop offset="60%" stop-color="var(--gold)"/>';
    p += '<stop offset="100%" stop-color="var(--gold-dark)"/>';
    p += '</linearGradient>';
    p += '<linearGradient id="msWall" x1="0" y1="0" x2="0" y2="1">';
    p += '<stop offset="0%" stop-color="var(--gold-light)" stop-opacity="0.92"/>';
    p += '<stop offset="100%" stop-color="var(--gold)" stop-opacity="0.78"/>';
    p += '</linearGradient>';
    // Soft glow filter for crescent moons
    p += '<filter id="msGlow">';
    p += '<feGaussianBlur stdDeviation="1.5" result="b"/>';
    p += '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>';
    p += '</filter>';
    p += '</defs>';

    /* ── Background ── */
    p += '<rect width="120" height="160" fill="url(#msSky)" rx="10"/>';

    /* ── Stars in the sky ── */
    p += '<circle cx="16" cy="14" r="0.7" fill="var(--text2)" opacity="0.45"/>';
    p += '<circle cx="40" cy="8" r="0.5" fill="var(--text2)" opacity="0.35"/>';
    p += '<circle cx="72" cy="11" r="0.6" fill="var(--text2)" opacity="0.4"/>';
    p += '<circle cx="102" cy="17" r="0.5" fill="var(--text2)" opacity="0.3"/>';
    p += '<circle cx="56" cy="21" r="0.4" fill="var(--text2)" opacity="0.28"/>';

    /* ── Ground ── */
    p += '<rect x="0" y="136" width="120" height="24" fill="var(--card-bg)" opacity="0.35"/>';

    /* ═══ Stage 0 — Foundation ═══ */
    if (stage >= 0) {
      p += '<rect x="22" y="125" width="76" height="11" fill="var(--text2)" opacity="0.45" rx="2"/>';
      p += '<rect x="25" y="123" width="70" height="13" fill="var(--card-bg)" opacity="0.35" rx="2" stroke="var(--border)" stroke-width="0.5"/>';
      // Foundation brick pattern
      p += '<line x1="40" y1="123" x2="40" y2="136" stroke="var(--border)" stroke-width="0.4"/>';
      p += '<line x1="60" y1="123" x2="60" y2="136" stroke="var(--border)" stroke-width="0.4"/>';
      p += '<line x1="80" y1="123" x2="80" y2="136" stroke="var(--border)" stroke-width="0.4"/>';
      p += '<line x1="25" y1="129" x2="95" y2="129" stroke="var(--border)" stroke-width="0.4"/>';
    }

    /* ═══ Stage 2 — Walls ═══ */
    if (stage >= 2) {
      // Main wall body
      p += '<rect x="28" y="68" width="64" height="55" fill="url(#msWall)" rx="2"/>';
      // Horizontal brick lines
      p += '<line x1="28" y1="78" x2="92" y2="78" stroke="var(--gold-dark)" stroke-width="0.3" opacity="0.28"/>';
      p += '<line x1="28" y1="88" x2="92" y2="88" stroke="var(--gold-dark)" stroke-width="0.3" opacity="0.28"/>';
      p += '<line x1="28" y1="98" x2="92" y2="98" stroke="var(--gold-dark)" stroke-width="0.3" opacity="0.28"/>';
      p += '<line x1="28" y1="108" x2="92" y2="108" stroke="var(--gold-dark)" stroke-width="0.3" opacity="0.28"/>';
      // Vertical brick lines (offset)
      p += '<line x1="44" y1="68" x2="44" y2="78" stroke="var(--gold-dark)" stroke-width="0.3" opacity="0.22"/>';
      p += '<line x1="60" y1="68" x2="60" y2="78" stroke="var(--gold-dark)" stroke-width="0.3" opacity="0.22"/>';
      p += '<line x1="76" y1="68" x2="76" y2="78" stroke="var(--gold-dark)" stroke-width="0.3" opacity="0.22"/>';
      p += '<line x1="36" y1="78" x2="36" y2="88" stroke="var(--gold-dark)" stroke-width="0.3" opacity="0.22"/>';
      p += '<line x1="52" y1="78" x2="52" y2="88" stroke="var(--gold-dark)" stroke-width="0.3" opacity="0.22"/>';
      p += '<line x1="68" y1="78" x2="68" y2="88" stroke="var(--gold-dark)" stroke-width="0.3" opacity="0.22"/>';
      p += '<line x1="84" y1="78" x2="84" y2="88" stroke="var(--gold-dark)" stroke-width="0.3" opacity="0.22"/>';
      // Decorative scalloped arches along wall top
      p += '<path d="M28,72 Q36,66 44,72 Q52,66 60,72 Q68,66 76,72 Q84,66 92,72" fill="none" stroke="var(--gold-dark)" stroke-width="0.8" opacity="0.45"/>';
      // Arched doorway
      p += '<path d="M48,123 L48,100 Q48,92 60,92 Q72,92 72,100 L72,123" fill="var(--bg-accent)" opacity="0.5" stroke="var(--gold)" stroke-width="0.6"/>';
      p += '<path d="M50,123 L50,102 Q50,95 60,95 Q70,95 70,102 L70,123" fill="var(--card-bg)" opacity="0.3"/>';
    }

    /* ═══ Stage 3 — Roof ═══ */
    if (stage >= 3) {
      p += '<polygon points="22,70 60,42 98,70" fill="var(--gold-dark)" opacity="0.82"/>';
      // Ridge highlights
      p += '<line x1="60" y1="42" x2="22" y2="70" stroke="var(--gold-light)" stroke-width="0.7" opacity="0.35"/>';
      p += '<line x1="60" y1="42" x2="98" y2="70" stroke="var(--gold-light)" stroke-width="0.7" opacity="0.35"/>';
      // Eave line
      p += '<line x1="18" y1="72" x2="102" y2="72" stroke="var(--gold)" stroke-width="1.2" opacity="0.55"/>';
    }

    /* ═══ Stage 4 — Dome ═══ */
    if (stage >= 4) {
      // Main dome
      p += '<ellipse cx="60" cy="48" rx="24" ry="20" fill="url(#msDome)"/>';
      // 3D highlight
      p += '<ellipse cx="55" cy="42" rx="12" ry="10" fill="var(--gold-light)" opacity="0.28"/>';
      // Dome base ring
      p += '<ellipse cx="60" cy="60" rx="24" ry="4" fill="var(--gold-dark)" opacity="0.55"/>';
      // Crescent moon finial
      p += '<g transform="translate(60,26)" filter="url(#msGlow)">';
      p += '<circle cx="0" cy="0" r="4" fill="var(--gold-light)"/>';
      p += '<circle cx="1.5" cy="-0.5" r="3.2" fill="url(#msSky)"/>';
      p += '</g>';
      // Dome rib decorations
      p += '<path d="M40,54 Q60,32 80,54" fill="none" stroke="var(--gold-light)" stroke-width="0.5" opacity="0.28"/>';
      p += '<path d="M44,56 Q60,38 76,56" fill="none" stroke="var(--gold-light)" stroke-width="0.4" opacity="0.22"/>';
    }

    /* ═══ Stage 5 — Minaret ═══ */
    if (stage >= 5) {
      // Tower shaft
      p += '<rect x="96" y="44" width="8" height="79" fill="url(#msGold)" rx="2"/>';
      // Balcony
      p += '<rect x="93" y="60" width="14" height="3" fill="var(--gold)" rx="1.5" opacity="0.75"/>';
      p += '<rect x="93" y="58" width="14" height="1" fill="var(--gold-dark)" opacity="0.45"/>';
      // Minaret top dome
      p += '<ellipse cx="100" cy="42" rx="7" ry="9" fill="url(#msDome)"/>';
      // Crescent on minaret
      p += '<g transform="translate(100,31)" filter="url(#msGlow)">';
      p += '<circle cx="0" cy="0" r="2.5" fill="var(--gold-light)"/>';
      p += '<circle cx="1" cy="-0.3" r="2" fill="url(#msSky)"/>';
      p += '</g>';
      // Decorative stripes
      p += '<rect x="97" y="70" width="6" height="1" fill="var(--gold-dark)" opacity="0.35"/>';
      p += '<rect x="97" y="82" width="6" height="1" fill="var(--gold-dark)" opacity="0.35"/>';
      p += '<rect x="97" y="94" width="6" height="1" fill="var(--gold-dark)" opacity="0.35"/>';
      p += '<rect x="97" y="106" width="6" height="1" fill="var(--gold-dark)" opacity="0.35"/>';
    }

    /* ═══ Stage 6 — Interior ═══ */
    if (stage >= 6) {
      // Arched windows
      p += '<path d="M32,82 Q32,76 37,76 Q42,76 42,82 L42,96 L32,96 Z" fill="var(--card-bg)" opacity="0.45" stroke="var(--gold)" stroke-width="0.5"/>';
      p += '<path d="M55,82 Q55,76 60,76 Q65,76 65,82 L65,96 L55,96 Z" fill="var(--card-bg)" opacity="0.45" stroke="var(--gold)" stroke-width="0.5"/>';
      p += '<path d="M78,82 Q78,76 83,76 Q88,76 88,82 L88,96 L78,96 Z" fill="var(--card-bg)" opacity="0.45" stroke="var(--gold)" stroke-width="0.5"/>';
      // Interior glow through doorway
      p += '<rect x="50" y="100" width="20" height="23" fill="var(--gold)" opacity="0.12" rx="1"/>';
      p += '<path d="M50,100 Q60,94 70,100" fill="none" stroke="var(--gold-light)" stroke-width="0.5" opacity="0.4"/>';
    }

    /* ═══ Stage 7 — Complete: glow animation ═══ */
    if (stage === 7) {
      p += '<circle cx="60" cy="65" r="55" fill="none" stroke="var(--gold)" stroke-width="1.5" opacity="0.3" class="ms-glow-ring"/>';
      p += '<circle cx="60" cy="65" r="45" fill="var(--gold)" opacity="0.04" class="ms-glow-fill"/>';
      p += '<circle cx="60" cy="65" r="62" fill="none" stroke="var(--gold-light)" stroke-width="0.8" opacity="0.2" class="ms-glow-ring-outer"/>';
    }

    return '<svg class="spiritual-svg" viewBox="0 0 120 160">' + p + '</svg>';
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
