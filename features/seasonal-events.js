(function() {
  function isRamadan() {
    return S.seasonal?.active === 'ramadan';
  }

  function isHajjSeason() {
    return S.seasonal?.active === 'hajj';
  }

  function getSeasonalMultiplier() {
    if (isRamadan()) return 2;
    if (isHajjSeason()) return 1.5;
    return 1;
  }

  function seasonalActive() {
    return S.seasonal?.active !== null && S.seasonal?.active !== undefined;
  }

  function activateSeason(type) {
    S.seasonal = S.seasonal || { active: null, ramadanQuests: [], hajjDays: 0, eidRewards: [], arafahDone: false };
    S.seasonal.active = type;
    saveState();
    renderSeasonalBanner();
    toast(type.charAt(0).toUpperCase() + type.slice(1) + ' mode activated!', iqIcon('star'));
  }

  function deactivateSeason() {
    S.seasonal.active = null;
    saveState();
    renderSeasonalBanner();
  }

  function renderSeasonalBanner() {
    const area = document.getElementById('seasonalBanner');
    if (!area) return;
    if (!seasonalActive()) { area.innerHTML = ''; return; }

    const type = S.seasonal.active;
    const colors = { ramadan: 'green', eid_fitr: 'gold', eid_adha: 'purple', hajj: 'blue' };
    const icons = { ramadan: '🌙', eid_fitr: '🎉', eid_adha: '🐑', hajj: '🕋' };

    area.innerHTML = '<div class="seasonal-banner seasonal-' + type + '" style="background:var(--' + (colors[type] || 'accent') + '-accent)">' +
      '<span>' + (icons[type] || '✨') + ' ' + type.replace('_', ' ').toUpperCase() + ' MODE</span>' +
      '<span class="seasonal-multiplier">' + getSeasonalMultiplier() + 'x XP</span>' +
    '</div>';
  }

  function claimEidReward(type) {
    S.seasonal.eidRewards = S.seasonal.eidRewards || [];
    if (S.seasonal.eidRewards.includes(type)) return;
    S.seasonal.eidRewards.push(type);
    grantDailyXp(500, 'eid_' + type);
    toast('Eid reward claimed! +500 XP', iqIcon('star'));
    saveState();
    checkA();
  }

  function trackHajjDay() {
    if (!isHajjSeason()) return;
    S.seasonal.hajjDays = (S.seasonal.hajjDays || 0) + 1;
    if (S.seasonal.hajjDays === 10) {
      toast('10 days of Dhul Hijjah completed!', iqIcon('star'));
    }
    saveState();
    checkA();
  }

  window.seasonalActive = seasonalActive;
  window.getSeasonalMultiplier = getSeasonalMultiplier;
  window.renderSeasonalBanner = renderSeasonalBanner;
  window.activateSeason = activateSeason;
  window.deactivateSeason = deactivateSeason;
  window.claimEidReward = claimEidReward;
  window.trackHajjDay = trackHajjDay;
  window.isRamadan = isRamadan;
  window.isHajjSeason = isHajjSeason;
})();
