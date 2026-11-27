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

  function _escSc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderAchievementShowcase() {
    const areas = (typeof document.querySelectorAll === 'function')
      ? Array.from(document.querySelectorAll('#achievementShowcase'))
      : [];
    if (areas.length === 0) {
      const single = document.getElementById('achievementShowcase');
      if (single) areas.push(single);
    }
    if (areas.length === 0) return;

    const featured = getFeaturedAchievements();
    const unlocked = getUnlockedAchievements();
    const _t = (s) => (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(s) : s;
    const _n = (v) => (typeof window !== 'undefined' && typeof window.iqNum === 'function') ? window.iqNum(v) : String(v);
    const hasArt = typeof window.renderAchievementBadge === 'function';
    const hasIcon = typeof window.renderAchievementIcon === 'function';

    let h = '';
    if (featured.length === 0) {
      h += `<div class="showcase-empty">
        <div class="showcase-empty-icon">${hasIcon ? window.renderAchievementIcon('achievements') : iqIcon('trophy')}</div>
        <div class="showcase-empty-title">${_escSc(_t('No Featured Badges Yet'))}</div>
        <div class="showcase-empty-sub">${_escSc(unlocked.length > 0 ? _t('Pick up to 6 unlocked badges below to display in your showcase.') : _t('Unlock achievements to feature your favorite collectible badges here.'))}</div>
      </div>`;
    } else {
      h += '<div class="showcase-grid">';
      featured.forEach(a => {
        const st = RARITY_STYLES[a.tier] || { border: 'var(--border)', bg: 'var(--accent)', fg: 'var(--accent-contrast, #ffffff)' };
        const badgeHtml = hasArt ? window.renderAchievementBadge(a, { unlocked: true, size: 'md' }) : '';
        h += `<div class="showcase-card tier-${_escSc(a.tier)}" style="border-color:${st.border}">
          <button type="button" class="showcase-remove" style="min-width:44px;min-height:44px;" onclick="unfeatureAchievement('${_escSc(a.id)}')" aria-label="Remove ${_escSc(a.name)} from showcase">✕</button>
          ${badgeHtml ? `<div class="showcase-badge-wrap">${badgeHtml}</div>` : ''}
          <div class="showcase-rarity" style="background:${st.bg};color:${st.fg};font-weight:700;">${_escSc(_t(a.tier))}</div>
          <div class="showcase-name">${_escSc(_t(a.name))}</div>
          <div class="showcase-desc">${_escSc(_t(a.desc))}</div>
        </div>`;
      });
      h += '</div>';
    }

    if (unlocked.length > 0) {
      h += `<div class="showcase-unlocked"><h4>${_escSc(_t('Unlocked Achievements'))} (<span class="iq-tabular">${_n(unlocked.length)}</span>)</h4><div class="showcase-unlocked-list">`;
      unlocked.forEach(a => {
        const st = RARITY_STYLES[a.tier] || { border: 'var(--border)' };
        const isFeatured = featured.some(f => f.id === a.id);
        const thumbHtml = hasArt ? window.renderAchievementBadge(a, { unlocked: true, size: 'sm', showPips: false }) : '';
        h += `<div class="showcase-item ${isFeatured ? 'featured' : ''} tier-${_escSc(a.tier)}" style="border-inline-start-color:${st.border}">
          <div class="showcase-item-left">
            ${thumbHtml ? `<span class="showcase-item-thumb">${thumbHtml}</span>` : ''}
            <span class="showcase-item-meta">
              <span class="showcase-item-name">${_escSc(_t(a.name))}</span>
              <span class="showcase-item-tier">${_escSc(_t(a.tier))}</span>
            </span>
          </div>
          ${!isFeatured
            ? `<button type="button" class="iq-btn-secondary" style="min-width:44px;min-height:44px;padding:4px 10px;" onclick="featureAchievement('${_escSc(a.id)}')" aria-label="Feature ${_escSc(a.name)} in showcase">+</button>`
            : `<span class="showcase-featured-pill">${_escSc(_t('Featured'))}</span>`}
        </div>`;
      });
      h += '</div></div>';
    }

    areas.forEach(el => { el.innerHTML = h; });
  }

  window.getUnlockedAchievements = getUnlockedAchievements;
  window.getFeaturedAchievements = getFeaturedAchievements;
  window.renderAchievementShowcase = renderAchievementShowcase;
  window.featureAchievement = featureAchievement;
  window.unfeatureAchievement = unfeatureAchievement;
  window.RARITY_COLORS = RARITY_COLORS;
})();
