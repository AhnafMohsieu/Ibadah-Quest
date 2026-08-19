// features/spiritual-growth/lantern.js
// Nur Lantern — A glowing lantern that brightens with each deed

(function() {
  const CAPTIONS = ["A flicker of light against the darkness.","May Allah guide you with this light.","Your lantern steadies — keep going.","Light dispels darkness — persist.","A radiant soul shines for others.","Your light inspires those around you.","The divine light surrounds you."];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  function lanternSVG(stage, progress) {
    const p = Math.max(0, Math.min(1, progress || 0));
    const flame = Math.min(1, (stage - 1) / 6 + p * 0.15);
    const glowO = (0.15 + flame * 0.55).toFixed(2);
    const flameH = 8 + flame * 20;
    let h = `<rect width="120" height="132" fill="var(--card-bg)" rx="10"/>`;
    h += `<circle cx="60" cy="78" r="${(26 + flame * 24).toFixed(1)}" fill="var(--accent)" opacity="${glowO}"/>`;
    if (stage >= 5) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r1 = 52 + flame * 8;
        const r2 = 66 + flame * 10;
        h += `<line x1="${(60 + Math.cos(a) * r1).toFixed(1)}" y1="${(78 + Math.sin(a) * r1).toFixed(1)}" x2="${(60 + Math.cos(a) * r2).toFixed(1)}" y2="${(78 + Math.sin(a) * r2).toFixed(1)}" stroke="var(--accent)" stroke-width="2" opacity="${(0.3 + (stage - 5) * 0.15).toFixed(2)}"/>`;
      }
    }
    h += `<rect x="42" y="54" width="36" height="48" rx="8" fill="var(--card-bg)" stroke="var(--accent)" stroke-width="2.5"/>`;
    h += `<rect x="46" y="58" width="28" height="40" rx="6" fill="var(--accent)" opacity="${(0.1 + flame * 0.5).toFixed(2)}"/>`;
    h += `<line x1="60" y1="58" x2="60" y2="98" stroke="var(--accent)" stroke-width="1.5"/>`;
    h += `<rect x="44" y="48" width="32" height="7" rx="3" fill="var(--accent)"/>`;
    h += `<path d="M46 48 Q60 32 74 48" fill="none" stroke="var(--accent)" stroke-width="3"/>`;
    if (stage >= 2) {
      const yTop = 100 - flameH;
      h += `<path d="M60 ${yTop.toFixed(1)} C48 ${(yTop + 10).toFixed(1)} 50 ${(yTop + 20).toFixed(1)} 60 ${(yTop + 22).toFixed(1)} C70 ${(yTop + 20).toFixed(1)} 72 ${(yTop + 10).toFixed(1)} 60 ${yTop.toFixed(1)} Z" fill="var(--accent)"/>`;
    }
    if (stage === 7) {
      h += `<path d="M86 20 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--accent)" opacity="0.9"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 132">${h}</svg>`;
  }

  function renderLantern() {
    const el = document.getElementById('lanternArea');
    if (!el || !SpiritualGrowth.isVisible('lantern')) {
      if (el) el.innerHTML = '';
      return;
    }

    const progress = SpiritualGrowth.getProgress('lantern');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP`
      : 'Your lantern shines with divine light.';
    const pct = Math.round(progress.progress * 100);

    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${lanternSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${SpiritualGrowth.FEATURE_ICONS.lantern} Nur Lantern <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderLantern = renderLantern;
})();
