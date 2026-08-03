// ═══════════════════════════════════════════════════════
// SPIRITUAL GARDEN — Tree of Deeds
// Grows with total XP + best streak. Never withers.
// ═══════════════════════════════════════════════════════
(function() {
  const STAGES = [
    { name: 'Seed',        icon: '🌱', xp: 0,    str: 0,  xpNext: 150,  strNext: 3,  next: 'Sprout' },
    { name: 'Sprout',      icon: '🌿', xp: 150,  str: 3,  xpNext: 500,  strNext: 7,  next: 'Sapling' },
    { name: 'Sapling',     icon: '🌳', xp: 500,  str: 7,  xpNext: 1500, strNext: 14, next: 'Mature Tree' },
    { name: 'Mature Tree', icon: '🌲', xp: 1500, str: 14, xpNext: 4000, strNext: 30, next: 'Blooming Tree' },
    { name: 'Blooming Tree', icon: '🌸', xp: 4000, str: 30, xpNext: null, strNext: null, next: null }
  ];
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
    let idx = 0;
    for (let i = 0; i < STAGES.length; i++) {
      if (xp >= STAGES[i].xp && streak >= STAGES[i].str) idx = i;
    }
    const s = STAGES[idx];
    const xpPct = s.xpNext ? Math.min(1, Math.max(0, (xp - s.xp) / (s.xpNext - s.xp))) : 1;
    return { stage: idx + 1, name: s.name, icon: s.icon, next: s.next, xpMin: s.xp, xpNext: s.xpNext, strMin: s.str, strNext: s.strNext, xpPct: Math.round(xpPct * 1000) / 1000 };
  }
  function flowerCount(streak) { return Math.max(1, Math.min(7, Math.floor((streak - 30) / 5) + 1)); }
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  function treeSVG(stage, flowers) {
    const FLOWER_POS = [[68,118],[132,112],[92,96],[120,86],[78,78],[142,66],[56,60]];
    let flowersSVG = '';
    if (stage === 5) {
      for (let i = 0; i < Math.min(flowers, FLOWER_POS.length); i++) {
        const f = FLOWER_POS[i];
        flowersSVG += `<g transform="translate(${f[0]},${f[1]})"><circle r="7" fill="#E89BB0"/><circle r="3" fill="#FCE694"/></g>`;
      }
    }
    if (stage === 1) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="204" rx="60" ry="8" fill="#163024"/><path d="M100 200 Q100 168 100 152" stroke="#2E7D4F" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M100 162 Q78 150 72 160 Q86 170 100 162" fill="#3E9B63"/><path d="M100 156 Q122 144 128 154 Q114 164 100 156" fill="#3E9B63"/></svg>`;
    if (stage === 2) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="204" rx="60" ry="8" fill="#163024"/><path d="M100 200 Q100 150 100 120" stroke="#2E7D4F" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M100 140 Q72 124 66 136 Q82 148 100 140" fill="#3E9B63"/><path d="M100 130 Q128 114 134 126 Q118 138 100 130" fill="#3E9B63"/><path d="M100 120 Q78 104 72 116 Q86 128 100 120" fill="#4CAF7A"/><path d="M100 112 Q122 96 128 108 Q114 120 100 112" fill="#4CAF7A"/></svg>`;
    if (stage === 3) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="204" rx="60" ry="8" fill="#163024"/><path d="M100 204 L96 110 L104 110 Z" fill="#6B4A2B"/><path d="M100 140 L70 118" stroke="#6B4A2B" stroke-width="6" stroke-linecap="round"/><path d="M100 128 L132 104" stroke="#6B4A2B" stroke-width="6" stroke-linecap="round"/><circle cx="66" cy="108" r="16" fill="#3E7C4F"/><circle cx="136" cy="94" r="15" fill="#3E7C4F"/><circle cx="100" cy="92" r="18" fill="#4CAF7A"/><circle cx="100" cy="100" r="17" fill="#3E9B63"/></svg>`;
    if (stage === 4) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="206" rx="70" ry="9" fill="#163024"/><path d="M96 206 L88 120 L112 120 L104 206 Z" fill="#5C3D21"/><path d="M100 160 L58 128" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/><path d="M100 146 L146 112" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/><path d="M100 132 L74 88" stroke="#5C3D21" stroke-width="8" stroke-linecap="round"/><path d="M100 132 L128 84" stroke="#5C3D21" stroke-width="8" stroke-linecap="round"/><circle cx="58" cy="122" r="20" fill="#2E6B3F"/><circle cx="148" cy="106" r="18" fill="#2E6B3F"/><circle cx="72" cy="82" r="20" fill="#3E7C4F"/><circle cx="130" cy="78" r="20" fill="#3E7C4F"/><circle cx="100" cy="92" r="26" fill="#3E9B63"/><circle cx="100" cy="82" r="24" fill="#4CAF7A"/></svg>`;
    return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="206" rx="70" ry="9" fill="#163024"/><path d="M96 206 L88 120 L112 120 L104 206 Z" fill="#5C3D21"/><path d="M100 160 L58 128" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/><path d="M100 146 L146 112" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/><path d="M100 132 L74 88" stroke="#5C3D21" stroke-width="8" stroke-linecap="round"/><path d="M100 132 L128 84" stroke="#5C3D21" stroke-width="8" stroke-linecap="round"/><circle cx="58" cy="122" r="20" fill="#2E6B3F"/><circle cx="148" cy="106" r="18" fill="#2E6B3F"/><circle cx="72" cy="82" r="20" fill="#3E7C4F"/><circle cx="130" cy="78" r="20" fill="#3E7C4F"/><circle cx="100" cy="92" r="26" fill="#3E9B63"/><circle cx="100" cy="82" r="24" fill="#4CAF7A"/>${flowersSVG}</svg>`;
  }
  function renderGarden() {
    try {
      const el = document.getElementById('gardenArea');
      if (!el) return;
      const streak = Math.max(S.cs || 0, S.bs || 0);
      const g = gardenStage(S.xp || 0, streak);
      const flowers = g.stage === 5 ? flowerCount(streak) : 0;
      const scale = (1 + 0.12 * g.xpPct).toFixed(3);
      const progress = g.next
        ? `${S.xp}/${g.xpNext} XP to ${g.next}`
        : 'Your tree is in full bloom — keep nourishing it.';
      el.innerHTML = `<div class="garden-card">
        <div class="garden-tree" style="transform:scale(${scale})">${treeSVG(g.stage, flowers)}</div>
        <div class="garden-info">
          <div class="garden-stage-name">${g.icon} ${g.name}</div>
          <div class="garden-progress">${progress}</div>
          ${g.next ? `<div class="garden-progress-sub">Streak ${streak}/${g.strNext} for ${g.next}</div>` : ''}
          <div class="garden-caption">${caption()}</div>
        </div>
      </div>`;
    } catch (e) { console.warn('Render Garden failed:', e.message); }
  }
  window.gardenStage = gardenStage;
  window.flowerCount = flowerCount;
  window.renderGarden = renderGarden;
})();
