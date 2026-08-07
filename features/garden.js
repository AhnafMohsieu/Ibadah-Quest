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
    const FLOWER_POS = [[68,118],[132,112],[92,96],[120,86],[78,78],[142,66],[56,60],[100,68],[148,76],[62,90],[130,98],[100,56]];
    let flowersSVG = '';
    if (stage >= 6) {
      for (let i = 0; i < Math.min(flowers, FLOWER_POS.length); i++) {
        const f = FLOWER_POS[i];
        flowersSVG += `<g transform="translate(${f[0]},${f[1]})"><circle r="7" fill="var(--gold-light)"/><circle r="3" fill="var(--gold)"/></g>`;
      }
    }
    if (stage === 1) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="204" rx="60" ry="8" fill="#163024"/><path d="M100 200 Q100 168 100 152" stroke="#2E7D4F" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M100 162 Q78 150 72 160 Q86 170 100 162" fill="#3E9B63"/><path d="M100 156 Q122 144 128 154 Q114 164 100 156" fill="#3E9B63"/></svg>`;
    if (stage === 2) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="204" rx="60" ry="8" fill="#163024"/><path d="M100 200 Q100 150 100 120" stroke="#2E7D4F" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M100 140 Q72 124 66 136 Q82 148 100 140" fill="#3E9B63"/><path d="M100 130 Q128 114 134 126 Q118 138 100 130" fill="#3E9B63"/><path d="M100 120 Q78 104 72 116 Q86 128 100 120" fill="#4CAF7A"/><path d="M100 112 Q122 96 128 108 Q114 120 100 112" fill="#4CAF7A"/></svg>`;
    if (stage === 3) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="204" rx="60" ry="8" fill="#163024"/><path d="M100 204 L96 110 L104 110 Z" fill="#6B4A2B"/><path d="M100 140 L70 118" stroke="#6B4A2B" stroke-width="6" stroke-linecap="round"/><path d="M100 128 L132 104" stroke="#6B4A2B" stroke-width="6" stroke-linecap="round"/><circle cx="66" cy="108" r="16" fill="#3E7C4F"/><circle cx="136" cy="94" r="15" fill="#3E7C4F"/><circle cx="100" cy="92" r="18" fill="#4CAF7A"/><circle cx="100" cy="100" r="17" fill="#3E9B63"/></svg>`;
    if (stage === 4) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="206" rx="70" ry="9" fill="#163024"/><path d="M96 206 L88 120 L112 120 L104 206 Z" fill="#5C3D21"/><path d="M100 160 L58 128" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/><path d="M100 146 L146 112" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/><path d="M100 132 L74 88" stroke="#5C3D21" stroke-width="8" stroke-linecap="round"/><path d="M100 132 L128 84" stroke="#5C3D21" stroke-width="8" stroke-linecap="round"/><circle cx="58" cy="122" r="20" fill="#2E6B3F"/><circle cx="148" cy="106" r="18" fill="#2E6B3F"/><circle cx="72" cy="82" r="20" fill="#3E7C4F"/><circle cx="130" cy="78" r="20" fill="#3E7C4F"/><circle cx="100" cy="92" r="26" fill="#3E9B63"/><circle cx="100" cy="82" r="24" fill="#4CAF7A"/></svg>`;
    if (stage === 5) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="206" rx="70" ry="9" fill="#163024"/><path d="M96 206 L84 115 L116 115 L104 206 Z" fill="#5C3D21"/><path d="M100 168 L52 130" stroke="#5C3D21" stroke-width="10" stroke-linecap="round"/><path d="M100 152 L152 114" stroke="#5C3D21" stroke-width="10" stroke-linecap="round"/><path d="M100 136 L68 84" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/><path d="M100 136 L136 80" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/><circle cx="52" cy="124" r="22" fill="#2E6B3F"/><circle cx="154" cy="108" r="20" fill="#2E6B3F"/><circle cx="66" cy="78" r="22" fill="#3E7C4F"/><circle cx="138" cy="74" r="22" fill="#3E7C4F"/><circle cx="100" cy="84" r="30" fill="#3E9B63"/><circle cx="100" cy="72" r="28" fill="#4CAF7A"/><circle cx="100" cy="62" r="20" fill="#5CB87A"/></svg>`;
    if (stage === 6) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="206" rx="70" ry="9" fill="#163024"/><path d="M96 206 L82 112 L118 112 L104 206 Z" fill="#5C3D21"/><path d="M100 170 L48 128" stroke="#5C3D21" stroke-width="11" stroke-linecap="round"/><path d="M100 154 L156 112" stroke="#5C3D21" stroke-width="11" stroke-linecap="round"/><path d="M100 138 L62 80" stroke="#5C3D21" stroke-width="10" stroke-linecap="round"/><path d="M100 138 L142 76" stroke="#5C3D21" stroke-width="10" stroke-linecap="round"/><circle cx="48" cy="120" r="24" fill="#2E6B3F"/><circle cx="160" cy="104" r="22" fill="#2E6B3F"/><circle cx="60" cy="74" r="24" fill="#3E7C4F"/><circle cx="144" cy="70" r="24" fill="#3E7C4F"/><circle cx="100" cy="80" r="32" fill="#3E9B63"/><circle cx="100" cy="68" r="30" fill="#4CAF7A"/><circle cx="100" cy="56" r="22" fill="#5CB87A"/>${flowersSVG}</svg>`;
    return `<svg class="garden-svg" viewBox="0 0 200 220"><defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><ellipse cx="100" cy="206" rx="70" ry="9" fill="#163024"/><path d="M96 206 L78 108 L122 108 L104 206 Z" fill="#5C3D21"/><path d="M100 172 L42 126" stroke="#5C3D21" stroke-width="12" stroke-linecap="round"/><path d="M100 156 L162 110" stroke="#5C3D21" stroke-width="12" stroke-linecap="round"/><path d="M100 140 L56 76" stroke="#5C3D21" stroke-width="11" stroke-linecap="round"/><path d="M100 140 L150 72" stroke="#5C3D21" stroke-width="11" stroke-linecap="round"/><circle cx="42" cy="118" r="26" fill="#2E6B3F"/><circle cx="166" cy="102" r="24" fill="#2E6B3F"/><circle cx="54" cy="70" r="26" fill="#3E7C4F"/><circle cx="152" cy="66" r="26" fill="#3E7C4F"/><circle cx="100" cy="76" r="34" fill="#3E9B63"/><circle cx="100" cy="64" r="32" fill="#4CAF7A"/><circle cx="100" cy="52" r="24" fill="#5CB87A"/><circle cx="100" cy="44" r="14" fill="#6DD09A" filter="url(#glow)"/>${flowersSVG}</svg>`;
  }
  let lastTree = null;
  function renderGarden() {
    try {
      const el = document.getElementById('gardenArea');
      if (!el) return;
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
            <div class="garden-stage-name">${g.icon} ${g.name} <span class="garden-stage-num">Stage ${g.stage}/7</span></div>
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
