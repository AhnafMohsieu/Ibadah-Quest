(function() {
  function checkSurpriseReward(action) {
    let chance = 0;
    if (action === 'prayer') chance = 0.10;
    else if (action === 'allPrayers') {
      const t = today();
      if (S.lastAllPrayersSurprise === t) return;
      chance = 0.25;
    }
    else if (action === 'quest') chance = 0.15;
    
    if (Math.random() > chance) return;
    
    const pool = [
      { type: 'xp', weight: 60, min: 50, max: 200 },
      { type: 'reroll', weight: 25 },
      { type: 'freeze', weight: 10 },
      { type: 'boost', weight: 5 }
    ];
    
    const total = pool.reduce((s, p) => s + p.weight, 0);
    let roll = Math.random() * total;
    let chosen = pool[0];
    for (const p of pool) {
      roll -= p.weight;
      if (roll <= 0) { chosen = p; break; }
    }
    
    if (chosen.type === 'xp') {
      const amt = chosen.min + Math.floor(Math.random() * (chosen.max - chosen.min + 1));
      applyXpDelta(amt, { skipLevelToast: true });
      toast(iqIcon('sparkles'), `Surprise! +${amt} XP!`, true);
    } else if (chosen.type === 'reroll') {
      genDQ();
      toast(iqIcon('refresh-cw'), 'Surprise! Quest Reroll!', true);
    } else if (chosen.type === 'freeze') {
      S.sfu = true;
      toast(iqIcon('snowflake'), 'Surprise! Streak Freeze!', true);
    } else if (chosen.type === 'boost') {
      S.ab = { exp: today(new Date(Date.now() + 86400000)) };
      toast(iqIcon('zap'), 'Surprise! 2x XP Boost!', true);
    }
    
    if (action === 'allPrayers') S.lastAllPrayersSurprise = today();
    saveState();
  }
  
  window.checkSurpriseReward = checkSurpriseReward;
})();