(function() {
  const RARITY_COLORS = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
    diamond: '#b9f2ff',
    legendary: '#ff6b6b',
    mythic: '#9b59b6',
    jannah: '#2ecc71'
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

    let h = '<div class="showcase-grid">';
    featured.forEach(a => {
      const color = RARITY_COLORS[a.tier] || '#ccc';
      h += `<div class="showcase-card" style="border-color:${color}">
        <div class="showcase-rarity" style="background:${color}">${a.tier}</div>
        <div class="showcase-name">${a.name}</div>
        <div class="showcase-desc">${a.desc}</div>
        <button class="showcase-remove" onclick="unfeatureAchievement('${a.id}')">✕</button>
      </div>`;
    });
    h += '</div>';

    if (unlocked.length > 0) {
      h += '<div class="showcase-unlocked"><h4>Unlocked Achievements</h4>';
      unlocked.forEach(a => {
        const color = RARITY_COLORS[a.tier] || '#ccc';
        const isFeatured = featured.some(f => f.id === a.id);
        h += `<div class="showcase-item ${isFeatured ? 'featured' : ''}" style="border-color:${color}">
          <span class="showcase-item-name">${a.name}</span>
          ${!isFeatured ? `<button onclick="featureAchievement('${a.id}')">+</button>` : ''}
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
