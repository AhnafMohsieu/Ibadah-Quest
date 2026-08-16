(function() {
  function checkA() { 
    const nu=[]; 
    for(const a of ACHS) if(!S.ua[a.id]&&a.c(S)){ S.ua[a.id]=today(); nu.push(a); } 
    if(nu.length){ 
        saveState(); 
        let delay = 0;
        nu.forEach(a => {
            const tierIcon = a.tier === 'jannah' ? iqIcon('kaaba') : a.tier === 'mythic' ? iqIcon('crown') : a.tier === 'legendary' ? iqIcon('award') : (a.tier === 'diamond' || a.tier === 'platinum') ? iqIcon('gem') : a.tier === 'gold' ? iqIcon('trophy') : a.tier === 'silver' ? iqIcon('medal') : iqIcon('star');
            setTimeout(() => { toast(iqIcon(a.icon || a.id || a.name) || tierIcon, 'Achievement Unlocked:<br>' + a.name, true, 4000); }, delay);
            delay += 4500;
        });
        markDirty('achievements');
        markDirty('topbar');
        markDirty('lv');
        renderDynamic();
    } 
  }
  window.checkA = checkA;
})();
