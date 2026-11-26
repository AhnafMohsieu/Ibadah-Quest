(function() {
  const RARITY_STYLES = {
    bronze: { border: '#a45b1d', bg: '#7c3e0d', fg: '#ffffff' },
    silver: { border: '#6b7280', bg: '#4b5563', fg: '#ffffff' },
    gold: { border: '#b47800', bg: '#8a5a00', fg: '#ffffff' },
    platinum: { border: '#475569', bg: '#334155', fg: '#ffffff' },
    diamond: { border: '#0369a1', bg: '#075985', fg: '#ffffff' },
    legendary: { border: '#dc2626', bg: '#991b1b', fg: '#ffffff' },
    mythic: { border: '#7e22ce', bg: '#6b21a8', fg: '#ffffff' },
    jannah: { border: '#15803d', bg: '#166534', fg: '#ffffff' }
  };
  const RARITY_COLORS = {
    bronze: '#a45b1d',
    silver: '#6b7280',
    gold: '#8a5a00',
    platinum: '#334155',
    diamond: '#075985',
    legendary: '#991b1b',
    mythic: '#6b21a8',
    jannah: '#166534'
  };

  function getUnlockedAchievements() {
    return ACHS.filter(a => S.ua[a.id]);
  }

  function getFeaturedAchievements() {
    return (S.achievementShowcase?.featured || [])
      .map(id => ACHS.find(a => a.id === id))
      .filter(Boolean)
      .slice(0, 6);
  }

  function featureAchievement(id) {
    S.achievementShowcase = S.achievementShowcase || { featured: [], unlockedAt: {} };
    if (S.achievementShowcase.featured.includes(id)) return;
    if (S.achievementShowcase.featured.length >= 6) {
      toast('Maximum 6 featured achievements!', iqIcon('alert'));
      return;
    }
    S.achievementShowcase.featured.push(id);
    saveState();
    renderAchievementShowcase();
  }

  function unfeatureAchievement(id) {
    S.achievementShowcase = S.achievementShowcase || { featured: [], unlockedAt: {} };
    S.achievementShowcase.featured = (S.achievementShowcase.featured || []).filter(f => f !== id);
    saveState();
    renderAchievementShowcase();
  }

  function renderAchievementShowcase() {
    const area = document.getElementById('achievementShowcase');
    if (!area) return;

    const featured = getFeaturedAchievements();
    const unlocked = getUnlockedAchievements();
    const _t = (s) => (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(s) : s;

    let h = '<div class="showcase-grid">';
    featured.forEach(a => {
      const st = RARITY_STYLES[a.tier] || { border: 'var(--border)', bg: 'var(--accent)', fg: 'var(--accent-contrast, #ffffff)' };
      h += `<div class="showcase-card" style="border-color:${st.border}">
        <div class="showcase-rarity" style="background:${st.bg};color:${st.fg};font-weight:700;">${_t(a.tier)}</div>
        <div class="showcase-name">${a.name}</div>
        <div class="showcase-desc">${a.desc}</div>
        <button type="button" class="showcase-remove" style="min-width:44px;min-height:44px;" onclick="unfeatureAchievement('${a.id}')" aria-label="Remove ${a.name} from showcase">✕</button>
      </div>`;
    });
    h += '</div>';

    if (unlocked.length > 0) {
      h += `<div class="showcase-unlocked"><h4>${_t('Unlocked Achievements')}</h4>`;
      unlocked.forEach(a => {
        const st = RARITY_STYLES[a.tier] || { border: 'var(--border)' };
        const isFeatured = featured.some(f => f.id === a.id);
        h += `<div class="showcase-item ${isFeatured ? 'featured' : ''}" style="border-color:${st.border}">
          <span class="showcase-item-name">${a.name}</span>
          ${!isFeatured ? `<button type="button" class="iq-btn-secondary" style="min-width:44px;min-height:44px;padding:4px 10px;" onclick="featureAchievement('${a.id}')" aria-label="Feature ${a.name} in showcase">+</button>` : ''}
        </div>`;
      });
      h += '</div>';
    }

    area.innerHTML = h;
  }

  window.getUnlockedAchievements = getUnlockedAchievements;
  window.getFeaturedAchievements = getFeaturedAchievements;
  window.renderAchievementShowcase = renderAchievementShowcase;
  window.featureAchievement = featureAchievement;
  window.unfeatureAchievement = unfeatureAchievement;
  window.RARITY_COLORS = RARITY_COLORS;
})();
