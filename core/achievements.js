(function() {
  function _escAch(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function checkA() { 
    const nu=[]; 
    for(const a of ACHS) if(!S.ua[a.id]&&a.c(S)){ S.ua[a.id]=today(); nu.push(a); } 
    if(nu.length){ 
        saveState(); 
        let delay = 0;
        const _t = (s) => (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(s) : s;
        nu.forEach(a => {
            const tierIcon = a.tier === 'jannah' ? iqIcon('kaaba') : a.tier === 'mythic' ? iqIcon('crown') : a.tier === 'legendary' ? iqIcon('award') : (a.tier === 'diamond' || a.tier === 'platinum') ? iqIcon('gem') : a.tier === 'gold' ? iqIcon('trophy') : a.tier === 'silver' ? iqIcon('medal') : iqIcon('star');
            setTimeout(() => {
              if (typeof window.renderAchievementBadge === 'function') {
                const badgeHtml = window.renderAchievementBadge(a, { unlocked: true, size: 'xl', animate: true });
                const tier = _escAch(a.tier || 'bronze');
                const desc = a.desc ? '<div class="ach-unlock-desc">' + _escAch(_t(a.desc)) + '</div>' : '';
                const bodyHtml =
                  '<div class="ach-unlock-eyebrow">' + _escAch(_t('Achievement Unlocked')) + '</div>' +
                  '<div class="ach-unlock-name">' + _escAch(_t(a.name)) + '</div>' +
                  desc +
                  '<div class="ach-unlock-rarity tier-' + tier + '">' + _escAch(_t(tier)) + '</div>';
                toast(badgeHtml, bodyHtml, true, 4500);
              } else {
                toast(iqIcon(a.icon || a.id || a.name) || tierIcon, 'Achievement Unlocked:<br>' + a.name, true, 4000);
              }
            }, delay);
            delay += 4800;
        });
        markDirty('achievements');
        markDirty('topbar');
        markDirty('lv');
        renderDynamic();
    } 
  }
  window.checkA = checkA;
})();
