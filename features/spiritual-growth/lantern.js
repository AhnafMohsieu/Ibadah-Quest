// features/spiritual-growth/lantern.js
// Nur Lantern — A glowing lantern that brightens with each deed

(function() {
  function lanternSVG(stage, progress) {
    const glow = Math.max(0.05, progress * 0.85);
    const gold = '#D4AF37';
    const warm = '#FFE97D';
    const bodyX = 45, bodyY = 35, bodyW = 30, bodyH = 80;
    const cx = 60, cy = 75;

    const gradStops = [
      `<stop offset="0%" style="stop-color:rgba(212,175,55,${glow})"/>`,
      `<stop offset="60%" style="stop-color:rgba(212,175,55,${glow * 0.4})"/>`,
      `<stop offset="100%" style="stop-color:rgba(212,175,55,0)"/>`
    ].join('');

    let inner = '';

    // Stage 1: Dim — barely visible flicker
    if (stage === 1) {
      inner = `
        <circle cx="${cx}" cy="${cy}" r="18" fill="rgba(212,175,55,0.08)"/>
        <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="4" fill="${gold}" opacity="0.25"/>
        <rect x="${bodyX + 4}" y="${bodyY + 4}" width="${bodyW - 8}" height="${bodyH - 8}" rx="3" fill="${warm}" opacity="0.1"/>
        <ellipse cx="${cx}" cy="${cy + 10}" rx="5" ry="6" fill="${warm}" opacity="0.15"/>`;
    }
    // Stage 2: Flickering — slight glow
    else if (stage === 2) {
      inner = `
        <circle cx="${cx}" cy="${cy}" r="24" fill="rgba(212,175,55,0.15)"/>
        <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="4" fill="${gold}" opacity="0.4"/>
        <rect x="${bodyX + 4}" y="${bodyY + 4}" width="${bodyW - 8}" height="${bodyH - 8}" rx="3" fill="${warm}" opacity="0.2"/>
        <ellipse cx="${cx}" cy="${cy + 10}" rx="7" ry="8" fill="${warm}" opacity="0.25"/>`;
    }
    // Stage 3: Steady — warm glow
    else if (stage === 3) {
      inner = `
        <circle cx="${cx}" cy="${cy}" r="30" fill="rgba(212,175,55,0.22)"/>
        <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="4" fill="${gold}" opacity="0.55"/>
        <rect x="${bodyX + 4}" y="${bodyY + 4}" width="${bodyW - 8}" height="${bodyH - 8}" rx="3" fill="${warm}" opacity="0.35"/>
        <ellipse cx="${cx}" cy="${cy + 10}" rx="9" ry="10" fill="${warm}" opacity="0.4"/>`;
    }
    // Stage 4: Glowing — bright glow
    else if (stage === 4) {
      inner = `
        <circle cx="${cx}" cy="${cy}" r="38" fill="rgba(212,175,55,0.32)"/>
        <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="4" fill="${gold}" opacity="0.7"/>
        <rect x="${bodyX + 4}" y="${bodyY + 4}" width="${bodyW - 8}" height="${bodyH - 8}" rx="3" fill="${warm}" opacity="0.5"/>
        <ellipse cx="${cx}" cy="${cy + 10}" rx="11" ry="12" fill="${warm}" opacity="0.55"/>
        <circle cx="${cx}" cy="${cy + 10}" r="5" fill="#FFF" opacity="0.3"/>`;
    }
    // Stage 5: Radiant — very bright glow
    else if (stage === 5) {
      inner = `
        <circle cx="${cx}" cy="${cy}" r="46" fill="rgba(212,175,55,0.42)"/>
        <circle cx="${cx}" cy="${cy}" r="28" fill="rgba(255,233,125,0.15)"/>
        <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="4" fill="${gold}" opacity="0.82"/>
        <rect x="${bodyX + 4}" y="${bodyY + 4}" width="${bodyW - 8}" height="${bodyH - 8}" rx="3" fill="${warm}" opacity="0.65"/>
        <ellipse cx="${cx}" cy="${cy + 10}" rx="13" ry="14" fill="${warm}" opacity="0.65"/>
        <circle cx="${cx}" cy="${cy + 10}" r="7" fill="#FFF" opacity="0.4"/>`;
    }
    // Stage 6: Brilliant — intense glow with aura
    else if (stage === 6) {
      inner = `
        <circle cx="${cx}" cy="${cy}" r="55" fill="rgba(212,175,55,0.5)"/>
        <circle cx="${cx}" cy="${cy}" r="36" fill="rgba(255,233,125,0.2)"/>
        <circle cx="${cx}" cy="${cy}" r="22" fill="rgba(255,255,255,0.08)"/>
        <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="4" fill="${gold}" opacity="0.92"/>
        <rect x="${bodyX + 4}" y="${bodyY + 4}" width="${bodyW - 8}" height="${bodyH - 8}" rx="3" fill="${warm}" opacity="0.78"/>
        <ellipse cx="${cx}" cy="${cy + 10}" rx="15" ry="16" fill="${warm}" opacity="0.75"/>
        <circle cx="${cx}" cy="${cy + 10}" r="9" fill="#FFF" opacity="0.5"/>
        <line x1="${cx}" y1="${bodyY - 10}" x2="${cx}" y2="${bodyY - 25}" stroke="${gold}" stroke-width="1.5" opacity="0.4"/>
        <line x1="${cx - 12}" y1="${bodyY}" x2="${cx - 20}" y2="${bodyY - 12}" stroke="${gold}" stroke-width="1" opacity="0.3"/>
        <line x1="${cx + 12}" y1="${bodyY}" x2="${cx + 20}" y2="${bodyY - 12}" stroke="${gold}" stroke-width="1" opacity="0.3"/>`;
    }
    // Stage 7: Divine Light — maximum glow with light rays
    else {
      inner = `
        <circle cx="${cx}" cy="${cy}" r="65" fill="rgba(212,175,55,0.6)"/>
        <circle cx="${cx}" cy="${cy}" r="44" fill="rgba(255,233,125,0.28)"/>
        <circle cx="${cx}" cy="${cy}" r="28" fill="rgba(255,255,255,0.12)"/>
        <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="4" fill="${gold}"/>
        <rect x="${bodyX + 4}" y="${bodyY + 4}" width="${bodyW - 8}" height="${bodyH - 8}" rx="3" fill="${warm}" opacity="0.88"/>
        <ellipse cx="${cx}" cy="${cy + 10}" rx="17" ry="18" fill="${warm}" opacity="0.85"/>
        <circle cx="${cx}" cy="${cy + 10}" r="11" fill="#FFF" opacity="0.6"/>
        <line x1="${cx}" y1="${bodyY - 10}" x2="${cx}" y2="${bodyY - 30}" stroke="${gold}" stroke-width="2" opacity="0.5"/>
        <line x1="${cx - 14}" y1="${bodyY}" x2="${cx - 26}" y2="${bodyY - 16}" stroke="${gold}" stroke-width="1.5" opacity="0.4"/>
        <line x1="${cx + 14}" y1="${bodyY}" x2="${cx + 26}" y2="${bodyY - 16}" stroke="${gold}" stroke-width="1.5" opacity="0.4"/>
        <line x1="${cx - 8}" y1="${bodyY + bodyH + 5}" x2="${cx - 14}" y2="${bodyY + bodyH + 20}" stroke="${gold}" stroke-width="1" opacity="0.3"/>
        <line x1="${cx + 8}" y1="${bodyY + bodyH + 5}" x2="${cx + 14}" y2="${bodyY + bodyH + 20}" stroke="${gold}" stroke-width="1" opacity="0.3"/>
        <line x1="${cx}" y1="${bodyY + bodyH + 5}" x2="${cx}" y2="${bodyY + bodyH + 22}" stroke="${gold}" stroke-width="1" opacity="0.35"/>`;
    }

    // Lantern top hook and base
    const frame = `
      <rect x="${cx - 8}" y="${bodyY - 10}" width="16" height="12" rx="3" fill="#8B4513"/>
      <path d="M${cx} ${bodyY - 10} Q${cx} ${bodyY - 20} ${cx + 6} ${bodyY - 20} Q${cx + 12} ${bodyY - 20} ${cx + 12} ${bodyY - 14}"
            fill="none" stroke="#8B4513" stroke-width="2"/>
      <rect x="${bodyX - 2}" y="${bodyY}" width="${bodyW + 4}" height="4" rx="2" fill="#8B4513"/>
      <rect x="${bodyX - 2}" y="${bodyY + bodyH - 4}" width="${bodyW + 4}" height="4" rx="2" fill="#8B4513"/>
      <rect x="${cx - 3}" y="${bodyY + bodyH}" width="6" height="10" rx="2" fill="#8B4513"/>`;

    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <defs>
        <radialGradient id="lanternGlow" cx="50%" cy="47%" r="50%">
          ${gradStops}
        </radialGradient>
      </defs>
      <circle cx="${cx}" cy="${cy}" r="60" fill="url(#lanternGlow)"/>
      ${inner}
      ${frame}
    </svg>`;
  }

  function renderLantern() {
    const el = document.getElementById('lanternArea');
    if (!el || !SpiritualGrowth.isVisible('lantern')) {
      if (el) el.innerHTML = '';
      return;
    }

    const progress = SpiritualGrowth.getProgress('lantern');
    const progressText = progress.xpForNext
      ? `${progress.xp} / ${progress.xpForNext} XP`
      : 'Your lantern shines with divine light.';
    const pct = Math.round(progress.progress * 100);

    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${lanternSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Nur Lantern</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${pct}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderLantern = renderLantern;
})();
