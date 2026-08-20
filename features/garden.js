// ═══════════════════════════════════════════════════════
// SPIRITUAL GARDEN — Tree of Deeds
// Grows with total XP + best streak. Never withers.
// ═══════════════════════════════════════════════════════
(function() {
  const CAPTIONS = [
    'Every seed of a deed counts, no matter how small.',
    'May Allah accept the little you do.',
    'Keep watering your deeds with sincerity.',
    'A quiet habit grows into something beautiful.',
    'Your tree is taking root — persist.',
    'A strong tree withstands the wind — keep going.',
    'Steady, gentle progress is what Allah loves.',
    'Blooming in humility — all praise belongs to Allah.'
  ];
  function gardenStage(xp, streak) {
    const p = SpiritualGrowth.getProgress('garden');
    return { stage: p.stage, name: p.name, icon: p.icon, next: p.stage < p.totalStages ? p.name : null, xpForNext: p.xpForNext, xpPct: Math.round(p.progress * 1000) / 1000 };
  }
  function flowerCount(streak) {
    if (streak < 30) return 0;
    return Math.min(12, Math.floor((streak - 30) / 5) + 1);
  }
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  function treeSVG(stage, flowers) {
    let h = '';
    h += `<rect width="120" height="132" fill="var(--card-bg)" rx="10"/>`;
    h += `<ellipse cx="60" cy="124" rx="52" ry="9" fill="#6B5B3E" opacity="0.55"/>`;
    if (stage >= 1) {
      h += `<ellipse cx="60" cy="120" rx="20" ry="7" fill="#8B5A2B" opacity="0.9"/>`;
    }
    if (stage >= 2) {
      h += `<path d="M60 120 Q58 104 60 94" stroke="var(--green)" stroke-width="3" fill="none"/>`;
      h += `<path d="M60 96 Q50 88 44 93 Q53 97 60 96 Z" fill="var(--green)"/>`;
      h += `<path d="M60 104 Q70 96 76 101 Q67 105 60 104 Z" fill="var(--green)" opacity="0.85"/>`;
    }
    if (stage >= 3) {
      h += `<path d="M60 121 Q57 102 60 80" stroke="#8B5A2B" stroke-width="5" fill="none"/>`;
      h += `<ellipse cx="60" cy="74" rx="17" ry="13" fill="var(--green)"/>`;
    }
    if (stage >= 4) {
      h += `<path d="M60 122 Q56 100 60 72" stroke="#8B5A2B" stroke-width="8" fill="none"/>`;
      h += `<ellipse cx="60" cy="62" rx="26" ry="20" fill="var(--green)"/>`;
      h += `<ellipse cx="42" cy="74" rx="13" ry="11" fill="var(--green)" opacity="0.85"/>`;
    }
    if (stage >= 5) {
      h += `<path d="M60 123 Q55 96 60 66" stroke="#8B5A2B" stroke-width="11" fill="none"/>`;
      h += `<ellipse cx="60" cy="54" rx="36" ry="28" fill="var(--green)"/>`;
      h += `<ellipse cx="36" cy="66" rx="15" ry="12" fill="var(--green)" opacity="0.9"/>`;
      h += `<ellipse cx="84" cy="64" rx="15" ry="12" fill="var(--green)" opacity="0.9"/>`;
    }
    if (stage >= 6) {
      h += `<path d="M60 124 Q54 94 60 58" stroke="#8B5A2B" stroke-width="13" fill="none"/>`;
      h += `<ellipse cx="60" cy="46" rx="42" ry="34" fill="var(--green)"/>`;
      for (let i = 0; i < flowers; i++) {
        const a = (i / Math.max(1, flowers)) * Math.PI * 2;
        const x = 60 + Math.cos(a) * 30;
        const y = 46 + Math.sin(a) * 24;
        h += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="var(--accent)"/>`;
      }
    }
    if (stage === 7) {
      h += `<circle cx="60" cy="56" r="54" fill="none" stroke="var(--accent)" stroke-width="2" opacity="0.4"/>`;
      h += `<circle cx="60" cy="46" r="44" fill="var(--accent)" opacity="0.12"/>`;
      h += `<path d="M88 18 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--accent)" opacity="0.9"/>`;
    }
    return `<svg class="garden-svg" viewBox="0 0 120 132">${h}</svg>`;
  }
  let lastTree = null;
  function renderGarden() {
    try {
      const el = document.getElementById('gardenArea');
      if (!el || !SpiritualGrowth.isVisible('garden')) {
        if (el) el.innerHTML = '';
        return;
      }
      const streak = Math.max(S.cs || 0, S.bs || 0);
      const g = gardenStage(S.xp || 0, streak);
      const flowers = g.stage >= 6 ? flowerCount(streak) : 0;
      const scale = (1 + 0.12 * g.xpPct).toFixed(3);
      const pctFill = Math.round(g.xpPct * 100);
      const progress = g.xpForNext
        ? `${S.xp}/${g.xpForNext} XP`
        : 'Max stage reached — keep nourishing it.';
      const key = g.stage + ':' + flowers;
      if (lastTree !== key) {
        el.innerHTML = `<div class="garden-card">
          <div class="garden-tree" style="transform:scale(${scale})">${treeSVG(g.stage, flowers)}</div>
          <div class="garden-info">
            <div class="garden-stage-name">${iqIcon(g.icon || g.name)} ${g.name} <span class="garden-stage-num">Stage ${g.stage}/7</span></div>
            <div class="garden-progress">${progress}</div>
            <div class="garden-progress-bar"><div class="garden-progress-fill" style="width:${pctFill}%"></div></div>
            <div class="garden-caption">${caption()}</div>
          </div>
        </div>`;
        lastTree = key;
      }
      const tree = el.querySelector('.garden-tree');
      if (!tree) return;
      tree.style.transform = 'scale(' + scale + ')';
      el.querySelector('.garden-progress').textContent = progress;
      const fill = el.querySelector('.garden-progress-fill');
      if (fill) fill.style.width = pctFill + '%';
      el.querySelector('.garden-caption').textContent = caption();
    } catch (e) { console.warn('Render Garden failed:', e.message); }
  }
  window.gardenStage = gardenStage;
  window.flowerCount = flowerCount;
  window.renderGarden = renderGarden;
})();
