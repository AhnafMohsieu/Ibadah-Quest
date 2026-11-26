/* features/surprise-rewards.js — Deterministic consistency milestones (no RNG or loot-box mechanics). */
(function() {
  function checkSurpriseReward(action) {
    if (typeof S === 'undefined' || !S) return false;
    var t = typeof today === 'function' ? today() : new Date().toISOString().slice(0, 10);

    // Deterministic completion milestone once per day when all 5 daily prayers are completed
    if (action === 'allPrayers') {
      if (S.lastAllPrayersSurprise === t) return false;
      S.lastAllPrayersSurprise = t;
      var bonus = 50;
      if (typeof applyXpDelta === 'function') applyXpDelta(bonus, { skipLevelToast: true });
      if (typeof toast === 'function') {
        var msg = (typeof window !== 'undefined' && typeof window.t === 'function')
          ? window.t('Daily Prayer Reflection: +{n} XP').replace('{n}', bonus)
          : ('Alhamdulillah — All 5 prayers complete! +' + bonus + ' XP');
        toast(typeof iqIcon === 'function' ? iqIcon('sparkles') : '✨', msg, false);
      }
      if (typeof saveState === 'function') saveState();
      return true;
    }
    return false;
  }

  window.checkSurpriseReward = checkSurpriseReward;
})();
