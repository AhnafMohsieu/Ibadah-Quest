(function() {
  // ═══════════════════════════════════════════════════════
  const THEME_KEY = 'iqTheme';
  function isValidTheme(t) {
    try { return t && (window.Themes || []).some(m => m.key === t); } catch (e) { return t === 'light'; }
  }
  function updateMeta() {
    try { const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); if (bg) document.querySelector('meta[name="theme-color"]').setAttribute('content', bg); } catch (e) {}
  }
  function applyTheme() {
    try {
      const t = (S && S.theme) || localStorage.getItem(THEME_KEY) || 'light';
      const safe = isValidTheme(t) ? t : 'light';
      if (safe === 'light') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', safe);
      updateMeta();
    } catch (e) {}
  }
  function setTheme(name) {
    const theme = isValidTheme(name) ? name : 'light';
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    if (theme === 'light') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    if (S) { S.theme = theme; saveState(); }
    updateMeta();
    updateTopBar();
    const activePanel = document.querySelector('.tab-panel.active');
    const tab = activePanel ? activePanel.id.replace('panel-', '') : 'home';
    renderTab(tab);
  }
  function toggleTheme() {
    const themes = ['light', 'serene', 'royal', 'sand', 'midnight', 'cream', 'emara'];
    const current = localStorage.getItem(THEME_KEY) || 'light';
    const idx = themes.indexOf(current);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next);
  }
  function checkLevelUp(oldLv) { if (S.lv > oldLv) { const t = lvTitle(S.lv); levelUpToast(S.lv, t); } }
  function grantDailyXp(amount, key) {
    if (!S.xpDaily) S.xpDaily = {};
    var dk = key + '|' + today();
    if (S.xpDaily[dk]) return false;
    S.xpDaily[dk] = true;
    var oldLv = S.lv;
    S.xp += amount;
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
    playSound('pop');
    saveState();
    if (typeof renderLv === 'function') renderLv();
    if (typeof renderTopBar === 'function') renderTopBar();
    return true;
  }
  function grantCappedDailyXp(amount, key, cap) {
    if (!S.xpDaily) S.xpDaily = {};
    var ck = key + '|count|' + today();
    var count = S.xpDaily[ck] || 0;
    if (count >= cap) return false;
    S.xpDaily[ck] = count + 1;
    var oldLv = S.lv;
    S.xp += amount;
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
    playSound('pop');
    saveState();
    if (typeof renderLv === 'function') renderLv();
    if (typeof renderTopBar === 'function') renderTopBar();
    return true;
  }
  function toggleP(id) { const l=tlog(); const w=!!l.p[id]; const oldLv=S.lv; l.p[id]=!w; const pr=PRAYERS.find(x=>x.id===id); if(!pr) return; let xp=pr.xp; if(isFri()&&id==='dhuhr'&&pr.fri) xp=pr.fri.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; if(!w){ S.tp++; S.xp+=xp; if(isFri()&&id==='dhuhr') S.tj=(S.tj||0)+1; playSound('pop'); if(typeof checkSurpriseReward==='function') checkSurpriseReward('prayer'); } else { S.tp=Math.max(0,S.tp-1); S.xp=Math.max(0,S.xp-xp); if(isFri()&&id==='dhuhr') S.tj=Math.max(0,(S.tj||0)-1); } S.lv=lvFrom(S.xp); checkLevelUp(oldLv); recalc(); checkQ(); checkA(); saveState(); renderDynamic(); if(typeof checkCombo==='function'){const prayedFajr=!!l.p.fajr;const prayedAll=Object.values(l.p||{}).filter(v=>v).length>=5;if(prayedFajr)checkCombo('fajr',true);if(prayedAll)checkCombo('adhkar',true);} }
  function toggleV(id) { const l=tlog(); if(!l.v) l.v={}; const w=!!l.v[id]; const oldLv=S.lv; l.v[id]=!w; const vp=VOLUNTARY.find(x=>x.id===id); if(!vp) return; let xp=vp.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; if(!w){ S.vc[id]=(S.vc[id]||0)+1; S.xp+=xp; playSound('pop'); } else { S.vc[id]=Math.max(0,(S.vc[id]||0)-1); S.xp=Math.max(0,S.xp-xp); } S.lv=lvFrom(S.xp); checkLevelUp(oldLv); checkQ(); checkA(); saveState(); renderDynamic(); }
  function toggleD(id) { const l=tlog(); const w=!!l.d[id]; const oldLv=S.lv; l.d[id]=!w; const de=DEEDS.find(x=>x.id===id); if(!de) return; let xp=de.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; if(!w){ S.td[id]=(S.td[id]||0)+1; S.xp+=xp; playSound('pop'); } else { S.td[id]=Math.max(0,(S.td[id]||0)-1); S.xp=Math.max(0,S.xp-xp); } S.lv=lvFrom(S.xp); checkLevelUp(oldLv); recalc(); checkQ(); checkA(); saveState(); renderDynamic(); }
  function buy(id) { const r=SHOP.find(x=>x.id===id); if(!r||S.ur[id]) return; if(S.xp<r.cost){ toast(iqIcon('x'),'Not enough XP'); return; } const oldLv=S.lv; S.xp-=r.cost; S.ur[id]=true; const seasonalMult = typeof getSeasonalMultiplier === 'function' ? getSeasonalMultiplier() : 1; if(r.t==='boost') S.ab={exp:today(new Date(Date.now()+86400000))}; if(r.t==='freeze') S.sfu=true; if(r.t==='xp') S.xp+=(r.v||0)*seasonalMult; if(r.t==='mystery') { const pool = [ { type:'xp', weight:60, min:100, max:2000 }, { type:'freeze', weight:10 }, { type:'reroll', weight:15 }, { type:'boost', weight:15 } ]; const total = pool.reduce((s,p) => s + p.weight, 0); let roll = Math.random() * total; let chosen = pool[0]; for (const p of pool) { roll -= p.weight; if (roll <= 0) { chosen = p; break; } } if (chosen.type === 'xp') { const amt = chosen.min + Math.floor(Math.random() * (chosen.max - chosen.min + 1)); S.xp += amt*seasonalMult; toast(iqIcon('gift'), `Mystery Box: +${amt*seasonalMult} XP!`); } else if (chosen.type === 'freeze') { S.sfu = true; toast(iqIcon('gift'), 'Mystery Box: Streak Freeze!'); } else if (chosen.type === 'reroll') { genDQ(); toast(iqIcon('refresh-cw'), 'Mystery Box: Quest Reroll!'); } else if (chosen.type === 'boost') { S.ab = { exp: today(new Date(Date.now() + 86400000)) }; toast(iqIcon('gift'), 'Mystery Box: 2x XP Boost!'); } } else if(r.t==='reroll'){ genDQ(); toast(iqIcon('refresh-cw'),'Quests rerolled!'); } else toast(iqIcon('gift'),'Purchased!'); if(r.id.startsWith('r')&&!r.t){if(!S.ownedTitles)S.ownedTitles=[];if(!S.ownedTitles.includes(r.id))S.ownedTitles.push(r.id);} if(r.id==='r10'||r.id==='r19'||r.id==='r20'){if(!S.ownedFrames)S.ownedFrames=[];if(!S.ownedFrames.includes(r.id))S.ownedFrames.push(r.id);} S.lv=lvFrom(S.xp); checkLevelUp(oldLv); saveState(); renderAll(); checkA(); setTimeout(() => { const cards = document.querySelectorAll('.reward-card'); cards.forEach(c => { if (c.onclick?.toString().includes(id)) c.classList.add('just-bought'); }); }, 50); }
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
        renderAll();
    } 
  }
  function levelUpToast(lv, title) {
    _modalTriggerEl = document.activeElement;
    const ov=document.getElementById('toastOverlay');
    ov.innerHTML=`<div class="levelup-box"><div class="levelup-glow"></div><div class="levelup-icon">${iqIcon('zap')}</div><div class="levelup-label">LEVEL UP</div><div class="levelup-num">${lv}</div><div class="levelup-title">${title}</div></div>`;
    ov.style.display='flex'; ov.classList.add('show'); ov.style.pointerEvents='auto';
    playSound('chime');
    for(let i=0;i<50;i++){ const el=document.createElement('span'); el.className='confetti'; el.textContent=[iqEmoji('star'),iqEmoji('sparkles'),iqEmoji('moon'),iqEmoji('sparkles'),iqEmoji('star'),iqEmoji('crescent')][i%6]; el.style.left=Math.random()*100+'%'; el.style.top='-20px'; el.style.setProperty('--fall-dur',(2+Math.random()*4)+'s'); el.style.setProperty('--rot',(Math.random()*720-360)+'deg'); document.body.appendChild(el); setTimeout(()=>el.remove(),4000); }
    if(ov._t) clearTimeout(ov._t);
    ov._t=setTimeout(()=>{ ov.classList.remove('show'); setTimeout(()=>{ ov.style.display='none'; ov.innerHTML=''; },400); ov.style.pointerEvents='none'; },4000);
    ov.onclick=()=>{ ov.classList.remove('show'); setTimeout(()=>{ ov.style.display='none'; ov.innerHTML=''; },400); ov.style.pointerEvents='none'; if(ov._t) clearTimeout(ov._t); };
  }
  function toast(icon, msg, conf=false, ms=2600) {
    _modalTriggerEl = document.activeElement;
    const ov=document.getElementById('toastOverlay'); ov.innerHTML=`<div class="toast-box"><span style="font-size:2.5rem">${icon}</span><h3>${msg}</h3></div>`;
    ov.style.display='flex'; ov.classList.add('show'); playSound(conf ? 'chime' : 'pop');
    ov.style.pointerEvents='auto';
    if(conf) for(let i=0;i<30;i++){ const el=document.createElement('span'); el.className='confetti'; el.textContent=[iqEmoji('sparkles'),iqEmoji('star'),iqEmoji('sparkles'),iqEmoji('zap')][i%4]; el.style.left=Math.random()*100+'%'; el.style.top='-20px'; el.style.setProperty('--fall-dur',(2+Math.random()*3)+'s'); el.style.setProperty('--rot',(Math.random()*720-360)+'deg'); document.body.appendChild(el); setTimeout(()=>el.remove(),3000); }
    if(ov._t) clearTimeout(ov._t);
    if(ms>0) ov._t=setTimeout(()=>{ ov.classList.remove('show'); setTimeout(()=>{ ov.style.display='none'; ov.innerHTML=''; },300); ov.style.pointerEvents='none'; },ms);
    ov.onclick=()=>{ ov.classList.remove('show'); setTimeout(()=>{ ov.style.display='none'; ov.innerHTML=''; },300); ov.style.pointerEvents='none'; if(ov._t) clearTimeout(ov._t); };
  }
  let _audioCtx = null;
  function playSound(type) {
    try { const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; if(!_audioCtx) _audioCtx=new AC(); const ctx=_audioCtx; const osc=ctx.createOscillator(); const gain=ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); if(type==='pop'){ osc.type='sine'; osc.frequency.setValueAtTime(880,ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(110,ctx.currentTime+0.1); gain.gain.setValueAtTime(0.5,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.1); osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.1); } else if(type==='chime'){ osc.type='triangle'; osc.frequency.setValueAtTime(523.25,ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1046.50,ctx.currentTime+0.3); gain.gain.setValueAtTime(0.3,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.8); osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.8); } } catch(e){}
  }
  function genDQ() { const t=today(); if(S.qd===t&&S.dq.length) return; const l=tlog(); S.dq=[...DQUESTS].sort(()=>Math.random()-0.5).slice(0,4).map(q=>{ const o=DQUESTS.find(x=>x.id===q.id); return {...q, done:!!(o&&o.c(S,l))}; }); S.qd=t; }
  function genWQ() { const w=ws(); if(S.wqd===w&&S.wq.length) return; S.wq=[...WQUESTS].sort(()=>Math.random()-0.5).slice(0,3).map(q=>{ const o=WQUESTS.find(x=>x.id===q.id); return {...q, done:!!(o&&o.c(S))}; }); S.wqd=w; }
  function genMQ() { const m=ms(); if(S.mqd===m&&S.mq.length) return; S.mq=[...MQUESTS].sort(()=>Math.random()-0.5).slice(0,3).map(q=>{ const o=MQUESTS.find(x=>x.id===q.id); return {...q, done:!!(o&&o.c(S))}; }); S.mqd=m; }
  function genYQ() { const y=ys(); if(S.yqd===y&&S.yq.length) return; S.yq=[...YQUESTS].sort(()=>Math.random()-0.5).slice(0,3).map(q=>{ const o=YQUESTS.find(x=>x.id===q.id); return {...q, done:!!(o&&o.c(S))}; }); S.yqd=y; }
  function genLQ() { if(!S.lq) S.lq=[]; const existing=new Set(S.lq.map(q=>q.id)); for(const q of LQUESTS) if(!existing.has(q.id)) S.lq.push({...q, done:!!q.c(S)}); S.lqd='set'; }
  function checkQ() {
    let u=false; const l=tlog(); const oldLv=S.lv;
    for(const q of S.dq){ const o=DQUESTS.find(x=>x.id===q.id); if(o&&!q.done&&o.c(S,l)){ q.done=true; S.xp+=q.xp; S.tq++; trackQuestXP('daily',q.xp); u=true; } }
    for(const q of S.wq){ const o=WQUESTS.find(x=>x.id===q.id); if(o&&!q.done&&o.c(S)){ q.done=true; S.xp+=q.xp; S.tq++; trackQuestXP('weekly',q.xp); u=true; } }
    for(const q of S.mq){ const o=MQUESTS.find(x=>x.id===q.id); if(o&&!q.done&&o.c(S)){ q.done=true; S.xp+=q.xp; S.tq++; trackQuestXP('monthly',q.xp); u=true; } }
    for(const q of S.yq){ const o=YQUESTS.find(x=>x.id===q.id); if(o&&!q.done&&o.c(S)){ q.done=true; S.xp+=q.xp; S.tq++; trackQuestXP('yearly',q.xp); u=true; } }
    for(const q of S.lq){ const o=LQUESTS.find(x=>x.id===q.id); if(o&&!q.done&&o.c(S)){ q.done=true; S.xp+=q.xp; S.tq++; trackQuestXP('lifetime',q.xp); u=true; } }
    if(u){ S.lv=lvFrom(S.xp); checkLevelUp(oldLv); checkA(); saveState(); if(typeof checkSurpriseReward==='function') checkSurpriseReward('quest'); }
  }
  function trackQuestXP(type, xp) { if (!S.questXP) S.questXP = {daily:0,weekly:0,monthly:0,yearly:0,lifetime:0}; S.questXP[type] = (S.questXP[type] || 0) + xp; S.questXP.lifetime = (S.questXP.lifetime || 0) + xp; }
  function toggleQuest(id,type,xp){ let arr; if(type==='daily') arr=S.dq; else if(type==='weekly') arr=S.wq; else if(type==='monthly') arr=S.mq; else if(type==='yearly') arr=S.yq; else if(type==='lifetime') arr=S.lq; else return; const q=arr.find(x=>x.id===id); if(!q) return; const oldLv=S.lv; q.done=!q.done; const xpVal=xp||q.xp; if(q.done){ S.xp+=xpVal; S.tq++; trackQuestXP(type,xpVal); } else { S.xp=Math.max(0,S.xp-xpVal); S.tq=Math.max(0,S.tq-1); trackQuestXP(type,-xpVal); } S.lv=lvFrom(S.xp); checkLevelUp(oldLv); saveState(); renderQ(); renderDynamic(); if(q.done&&typeof checkSurpriseReward==='function') checkSurpriseReward('quest'); }
  function recalc() { const all=Object.keys(S.log).filter(d=>Object.values(S.log[d].p||{}).filter(v=>v).length>=5).sort(); let best=0,run=0,prev=null; for(const d of all){ if(prev){ const p=new Date(prev+'T00:00:00'); const c=new Date(d+'T00:00:00'); const diffDays=Math.round((c-p)/86400000); if(diffDays===1) run++; else run=1; } else { run=1; } best=Math.max(best,run); prev=d; } S.bs=best; const tc=Object.values(tlog().p||{}).filter(v=>v).length>=5; if(tc){ let s=1,ck=new Date(); while(true){ ck.setDate(ck.getDate()-1); const dk=today(ck); if(S.log[dk]&&Object.values(S.log[dk].p||{}).filter(v=>v).length>=5) s++; else break; } S.cs=s; if(typeof checkSurpriseReward==='function') checkSurpriseReward('allPrayers'); } else { const yd=today(new Date(Date.now()-86400000)); S.cs=(S.log[yd]&&Object.values(S.log[yd].p||{}).filter(v=>v).length>=5)?1:0; } S.pd=all.length; if(S.cs>S.bs) S.bs=S.cs; if(window.checkMilestones) checkMilestones(); }
  const _loadedScripts = new Set();
  function loadScript(srcUrl) {
    return new Promise((resolve, reject) => {
      if (_loadedScripts.has(srcUrl)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = srcUrl + '?v=3';
      s.onload = () => { _loadedScripts.add(srcUrl); resolve(); };
      s.onerror = () => { console.warn('Failed to load ' + srcUrl); reject(new Error(srcUrl)); };
      document.head.appendChild(s);
    });
  }
  function ensureQuranLoaded() { return loadScript('data/pools/quran-verses.js').then(() => { if (window.invalidateSearchIndex) window.invalidateSearchIndex(); }); }
  function ensureHadithLoaded() {
    return Promise.all([
      loadScript('data/pools/hadiths.js'),
      loadScript('data/hadith-collections.js')
    ]).then(() => { if (window.invalidateSearchIndex) window.invalidateSearchIndex(); });
  }
  function refreshContent() {
    const t = today(); const isNewDay = (S.contentDate !== t); const rng = (len) => fastRng(len);
    const pools = [
      ['duaIdx',DUA_POOL],['quranIdx', (typeof QURAN_POOL !== 'undefined') ? QURAN_POOL : null],['sunnahIdx',SUNNAH_POOL],['dhikrIdx',DHIKR_POOL],
      ['storiesIdx',STORIES],['hadithIdx', (typeof HADITHS !== 'undefined') ? HADITHS : null],['namesIdx',NAMES],['sinsIdx',SINS_POOL],
      ['punishmentsIdx',PUNISHMENTS_POOL],['repentanceIdx',REPENTANCE_POOL],['sahabaIdx',SAHABA_POOL],
      ['seerahIdx',SEERAH_POOL],['tafsirIdx',TAFSIR_POOL],['mannersIdx',MANNERS_POOL],
      ['inspireIdx',INSPIRATIONS_POOL],['aqeedahIdx',AQEEDAH_POOL],['familyIdx',FAMILY_POOL],
      ['healthIdx',HEALTH_POOL],['financeIdx',FINANCE_POOL],['ummahIdx',UMMAH_POOL],
      ['hajjIdx',HAJJ_POOL],['akhirahIdx',AKHIRAH_POOL],['prophetsIdx',PROPHETS_POOL],
      ['womenIdx',WOMEN_POOL],['knowledgeIdx',KNOWLEDGE_POOL],['heartIdx',HEART_POOL],
      ['jumuahIdx',JUMUAH_POOL],['marriageIdx',MARRIAGE_POOL],['scienceIdx',SCIENCE_POOL],
      ['wuduIdx',WUDU_POOL],['scholarsIdx',SCHOLARS_POOL],['patienceIdx',PATIENCE_POOL],
      ['workIdx',WORK_POOL],['communityIdx',COMMUNITY_POOL],['environmentIdx',ENVIRONMENT_POOL],
      ['travelIdx',TRAVEL_POOL],['fiqhIdx',FIQH_POOL],['arabicIdx',ARABIC_POOL],
      ['tawakkulIdx',TAWAKKUL_POOL],['ikhlasIdx',IKHLAS_POOL],['zuhdIdx',ZUHD_POOL],
      ['dawahIdx',DAWAH_POOL],['civilisationIdx',CIVILISATION_POOL],['battlesIdx',BATTLES_POOL],
      ['jannahIdx',JANNAH_POOL],['jahannamIdx',JAHANNAM_POOL],['graveIdx',GRAVE_POOL],
      ['signsIdx',SIGNS_POOL],['dreamsIdx',DREAMS_POOL],['parentingIdx',PARENTING_POOL],
      ['foodIdx',FOOD_POOL],['tibbIdx',TIBB_POOL],['youthIdx',YOUTH_POOL],['techIdx',TECH_POOL],
      ['neighborsIdx',NEIGHBORS_POOL]
    ].concat(Object.keys(NEW_POOLS).map(k => [k + "Idx", NEW_POOLS[k]]));
    for (const [key,pool] of pools) { if (isNewDay || !S[key]?.length) S[key] = rng((pool||[]).length); }
    S.contentDate = t;
  }
  function manualRefreshContent() {
    const rng = (len) => fastRng(len);
    const keys = ['duaIdx','quranIdx','sunnahIdx','dhikrIdx','storiesIdx','hadithIdx','namesIdx','sinsIdx','punishmentsIdx','repentanceIdx','sahabaIdx','seerahIdx','tafsirIdx','mannersIdx','inspireIdx','aqeedahIdx','familyIdx','healthIdx','financeIdx','ummahIdx','hajjIdx','akhirahIdx','prophetsIdx','womenIdx','knowledgeIdx','heartIdx','jumuahIdx','marriageIdx','scienceIdx','wuduIdx','scholarsIdx','patienceIdx','workIdx','communityIdx','environmentIdx','travelIdx','fiqhIdx','arabicIdx','tawakkulIdx','ikhlasIdx','zuhdIdx','dawahIdx','civilisationIdx','battlesIdx','jannahIdx','jahannamIdx','graveIdx','signsIdx','dreamsIdx','parentingIdx','foodIdx','tibbIdx','youthIdx','techIdx','neighborsIdx'].concat(Object.keys(NEW_POOLS).map(k => k + "Idx"));
    const allPools = [DUA_POOL,(typeof QURAN_POOL !== 'undefined') ? QURAN_POOL : null,SUNNAH_POOL,DHIKR_POOL,STORIES,(typeof HADITHS !== 'undefined') ? HADITHS : null,NAMES,SINS_POOL,PUNISHMENTS_POOL,REPENTANCE_POOL,SAHABA_POOL,SEERAH_POOL,TAFSIR_POOL,MANNERS_POOL,INSPIRATIONS_POOL,AQEEDAH_POOL,FAMILY_POOL,HEALTH_POOL,FINANCE_POOL,UMMAH_POOL,HAJJ_POOL,AKHIRAH_POOL,PROPHETS_POOL,WOMEN_POOL,KNOWLEDGE_POOL,HEART_POOL,JUMUAH_POOL,MARRIAGE_POOL,SCIENCE_POOL,WUDU_POOL,SCHOLARS_POOL,PATIENCE_POOL,WORK_POOL,COMMUNITY_POOL,ENVIRONMENT_POOL,TRAVEL_POOL,FIQH_POOL,ARABIC_POOL,TAWAKKUL_POOL,IKHLAS_POOL,ZUHD_POOL,DAWAH_POOL,CIVILISATION_POOL,BATTLES_POOL,JANNAH_POOL,JAHANNAM_POOL,GRAVE_POOL,SIGNS_POOL,DREAMS_POOL,PARENTING_POOL,FOOD_POOL,TIBB_POOL,YOUTH_POOL,TECH_POOL,NEIGHBORS_POOL].concat(Object.keys(NEW_POOLS).map(k => NEW_POOLS[k]));
    keys.forEach((k,i) => { S[k] = rng(allPools[i]?.length||5); });
    saveState(); renderAll(); toast(iqIcon('refresh-cw'),'Content refreshed!',false,1500);
  }

  function switchUser() { const inp=document.getElementById('usernameInput'); if(!inp?.value.trim()) return; saveState(); currentUser=inp.value.trim(); localStorage.setItem(USER_KEY,currentUser); S=loadState(); initApp(); }
  function logout() { switchUser(); }
  function resetAll() {
    if (!confirm(iqEmoji('alert-triangle') + ' Reset all data? This cannot be undone.')) return;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(PREFIX) || k === USER_KEY)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    S = freshState();
    saveState();
    renderAll();
  }
  function claimBonus() { const t=today(); if(S.lbd===t) return; const oldLv=S.lv; const b=S.cs>=7?75:30; S.xp+=b; S.lbd=t; S.lv=lvFrom(S.xp); checkLevelUp(oldLv); saveState(); renderDynamic(); toast(iqIcon('gift'),'Daily Bonus: +'+b+' XP!'); }
  function updateDhikrStreak() {
    const t = today();
    if (!S.dhikrStats) S.dhikrStats = { total: {}, daily: {}, streak: 0, bestStreak: 0, lastSessionDate: null, badges: [], achievements: [] };

    const todaySessions = S.dhikrStats.daily[t] || {};
    const hasDhikrToday = Object.keys(todaySessions).length > 0;

    if (hasDhikrToday) {
      if (S.dhikrStats.lastSessionDate === t) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.getFullYear() + '-' + (yesterday.getMonth()+1).toString().padStart(2,'0') + '-' + yesterday.getDate().toString().padStart(2,'0');

      if (S.dhikrStats.lastSessionDate === yesterdayStr) {
        S.dhikrStats.streak++;
      } else {
        S.dhikrStats.streak = 1;
      }

      S.dhikrStats.lastSessionDate = t;

      if (S.dhikrStats.streak > S.dhikrStats.bestStreak) {
        S.dhikrStats.bestStreak = S.dhikrStats.streak;
      }

      saveState();
    }
  }
  function tapDhikr() {
    if (!S.dhikrCounters) S.dhikrCounters = {};
    const idx = S.dhikrCounters._active || 0;
    const oldLv = S.lv;
    S.dhikrCounters[idx] = (S.dhikrCounters[idx] || 0) + 1;
    if (S.dhikrSettings?.haptic && navigator.vibrate) { navigator.vibrate(10); }
    const d = DHIKR_COUNTER_DATA[idx % DHIKR_COUNTER_DATA.length];
    S.xp += 1;
    const cycleCount = S.dhikrCounters[idx];
    if (S.dhikrCounters[idx] >= d.target) {
      toast(iqIcon('sparkles'), 'Target reached! SubhanAllah!', false, 2000);
      if (S.dhikrSettings?.haptic && navigator.vibrate) { navigator.vibrate([50, 50, 50]); }
      S.xp += 20;
      S.dhikrCounters[idx] = 0;
    }
    if (!S.dhikrSessions) S.dhikrSessions = [];
    S.dhikrSessions.push({ date: today(), dhikrId: idx, count: cycleCount, timestamp: Date.now() });
    if (!S.dhikrStats) S.dhikrStats = { total: {}, daily: {}, streak: 0, bestStreak: 0, lastSessionDate: null, badges: [], achievements: [] };
    S.dhikrStats.total[idx] = (S.dhikrStats.total[idx] || 0) + 1;
    const t = today();
    if (!S.dhikrStats.daily[t]) S.dhikrStats.daily[t] = {};
    S.dhikrStats.daily[t][idx] = (S.dhikrStats.daily[t][idx] || 0) + 1;
    updateDhikrStreak();
    checkDhikrBadges();
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
    saveState(); renderDhikrCounter();
    if (typeof window !== 'undefined' && window.renderLv) window.renderLv();
    if (typeof window !== 'undefined' && window.renderTopBar) window.renderTopBar();
  }
  function checkDhikrBadges() {
    if (!S.dhikrStats) return;
    const badges = S.dhikrStats.badges || [];
    DHIKR_BADGES.forEach(badge => {
      if (!badges.includes(badge.id) && badge.check(S)) {
        badges.push(badge.id);
        toast(iqIcon('trophy'), `Badge unlocked: ${badge.name}!`);
        S.xp += 25;
      }
    });
    S.dhikrStats.badges = badges;
  }
  function resetDhikr() { if (!S.dhikrCounters) S.dhikrCounters={}; const idx=S.dhikrCounters._active||0; S.dhikrCounters[idx]=0; saveState(); renderDhikrCounter(); }
  function nextDhikr() { if (!S.dhikrCounters) S.dhikrCounters={}; S.dhikrCounters._active=((S.dhikrCounters._active||0)+1)%DHIKR_COUNTER_DATA.length; saveState(); renderDhikrCounter(); }
  function addCustomDhikr(arabic, roman, english, target) {
    if (!S.dhikrCustom) S.dhikrCustom = [];
    S.dhikrCustom.push({
      id: 'custom_' + Date.now(),
      arabic,
      transliteration: roman,
      english,
      target: target || 33,
      color: 'var(--gold)'
    });
    saveState();
    renderDhikrCounter();
  }
  function removeCustomDhikr(id) {
    if (!S.dhikrCustom) return;
    S.dhikrCustom = S.dhikrCustom.filter(d => d.id !== id);
    saveState();
    renderDhikrCounter();
  }
  function toggleDhikrFavorite(id) {
    if (!S.dhikrFavorites) S.dhikrFavorites = [];
    const idx = S.dhikrFavorites.indexOf(id);
    if (idx === -1) {
      S.dhikrFavorites.push(id);
    } else {
      S.dhikrFavorites.splice(idx, 1);
    }
    saveState();
  }
  function selectAvatar(emoji) {
    S.avatar = emoji;
    saveState();
    renderProfile();
  }
  function selectTitle(id) { if(!S.ownedTitles||!S.ownedTitles.includes(id))return; S.activeTitle=id; saveState(); renderProfile(); }
  window.selectTitle = selectTitle;
  function selectFrame(id) { if(!S.ownedFrames||!S.ownedFrames.includes(id))return; S.activeFrame=id; saveState(); renderProfile(); }
  window.selectFrame = selectFrame;

  // NEW_POOLS extracted to data/pools/new-pools.js

const NEW_POOL_TITLES = {
  zakatrules:    iqIcon('wallet') + ' Zakat — Purifying Your Wealth',
  salahrules:    iqIcon('mosque') + ' Salah — The Pillar of Prayer',
  sawmrules:     iqIcon('moon') + ' Sawm — The Fast of Ramadan',
  hajjrules:     iqIcon('mosque') + ' Hajj — The Sacred Pilgrimage',
  purification:  iqIcon('droplets') + ' Purification (Taharah)',
  trade:         iqIcon('handshake') + ' Islamic Trade & Commerce',
  marriagelaws:  iqIcon('heart') + ' Marriage Laws in Islam',
  inheritance:   iqIcon('scroll') + ' Laws of Inheritance (Mirath)',
  halaldiet:     iqIcon('utensils') + ' Halal Diet & Forbidden Foods',
  oaths:         iqIcon('hand-heart') + ' Oaths & Vows in Islam',
  umayyads:      iqIcon('castle') + ' The Umayyad Caliphate',
  abbasids:      iqIcon('scroll') + ' The Abbasid Golden Age',
  andalus:       iqIcon('castle') + ' Islamic Spain (Al-Andalus)',
  ottomans:      iqIcon('mosque') + ' The Ottoman Empire',
  mamluks:       iqIcon('target') + ' The Mamluk Sultanate',
  seljuks:       iqIcon('target') + ' The Seljuk Empire',
  fatimids:      iqIcon('moon') + ' The Fatimid Caliphate',
  ayyubids:      iqIcon('shield') + ' The Ayyubid Dynasty',
  modernhist:    iqIcon('globe') + ' Modern Islamic History',
  ancientprophets:iqIcon('clock') + ' Ancient Prophets & Nations',
  sufism:        iqIcon('heart') + ' Sufism & Spiritual Paths',
  tazkiyah:      iqIcon('sparkles') + ' Tazkiyah — Soul Purification',
  asceticism:    iqIcon('leaf') + ' Asceticism (Zuhd)',
  fear:          iqIcon('alert-triangle') + ' Fear of Allah (Khawf)',
  hope:          iqIcon('heart') + ' Hope in Allah (Raja)',
  loveofallah:   iqIcon('heart') + ' Love of Allah',
  contentment:   iqIcon('heart') + ' Contentment (Qana\'ah)',
  reflection:    iqIcon('pencil') + ' Reflection & Contemplation',
  technology:    iqIcon('zap') + ' Technology & Islam',
  socialmedia:   iqIcon('globe') + ' Social Media & Islam',
  ethics:        iqIcon('handshake') + ' Islamic Ethics',
  bioethics:     iqIcon('dna') + ' Islamic Bioethics',
  modfinance:    iqIcon('credit-card') + ' Modern Islamic Finance',
  politics:      iqIcon('castle') + ' Islam & Politics',
  green:         iqIcon('sprout') + ' Green Islam & Ecology',
  mentalhealth:  iqIcon('brain') + ' Mental Health in Islam',
  youth:         iqIcon('user') + ' Youth & Islamic Identity',
  education:     iqIcon('book-open') + ' Islamic Education',
  mecca:         iqIcon('mosque') + ' Mecca — The Holy City',
  medina:        iqIcon('mosque') + ' Medina — City of the Prophet',
  jerusalem:     iqIcon('mosque') + ' Jerusalem — Al-Quds',
  damascus:      iqIcon('castle') + ' Damascus — Ancient Capital',
  baghdad:       iqIcon('scroll') + ' Baghdad — House of Wisdom',
  cairo:         iqIcon('castle') + ' Cairo — Gateway of Egypt',
  cordoba:       iqIcon('castle') + ' Cordoba — Light of the West',
  istanbul:      iqIcon('mosque') + ' Istanbul — City of Empires',
  bukhara:       iqIcon('mosque') + ' Bukhara — City of Knowledge',
  samarkand:     iqIcon('globe') + ' Samarkand — Silk Road Jewel',
  calligraphy:   iqIcon('pen-tool') + ' Islamic Calligraphy',
  architecture:  iqIcon('castle') + ' Islamic Architecture',
  geometry:      iqIcon('sparkles') + ' Islamic Geometric Art',
  poetryart:     iqIcon('scroll') + ' Islamic Poetry',
  literature:    iqIcon('book-open') + ' Islamic Literature',
  nasheeds:      iqIcon('sparkles') + ' Nasheeds & Spiritual Music',
  illumination:  iqIcon('sparkles') + ' Manuscript Illumination',
  textiles:      iqIcon('sparkles') + ' Islamic Textiles',
  ceramics:      iqIcon('sparkles') + ' Islamic Ceramics',
  woodwork:      iqIcon('sparkles') + ' Islamic Woodwork',
  abuhanifa:     iqIcon('brain') + ' Imam Abu Hanifa',
  malik:         iqIcon('brain') + ' Imam Malik ibn Anas',
  shafii:        iqIcon('brain') + ' Imam Al-Shafi\'i',
  ahmad:         iqIcon('brain') + ' Imam Ahmad ibn Hanbal',
  alghazali:     iqIcon('brain') + ' Al-Ghazali — Proof of Islam',
  ibntaymiyyah:  iqIcon('brain') + ' Ibn Taymiyyah',
  ibnkhaldun:    iqIcon('brain') + ' Ibn Khaldun — Father of Sociology',
  ibnrushd:      iqIcon('brain') + ' Ibn Rushd (Averroes)',
  ibnsina:       iqIcon('brain') + ' Ibn Sina (Avicenna)',
  alkhwarizmi:   iqIcon('brain') + ' Al-Khwarizmi — Father of Algebra',
  arabicgrammar: iqIcon('book-open') + ' Arabic Grammar (Nahw)',
  vocab:         iqIcon('book-open') + ' Arabic Vocabulary',
  rhetoric:      iqIcon('message-circle') + ' Arabic Rhetoric (Balagha)',
  morphology:    iqIcon('sparkles') + ' Arabic Morphology (Sarf)',
  pronunciation: iqIcon('sparkles') + ' Tajweed & Pronunciation',
  poetry:        iqIcon('scroll') + ' Arabic Poetry',
  proverbs:      iqIcon('zap') + ' Arabic Proverbs',
  etymology:     iqIcon('search') + ' Arabic Etymology',
  dialects:      iqIcon('globe') + ' Arabic Dialects',
  scripts:       iqIcon('pencil') + ' Arabic Scripts',
  brotherhood:   iqIcon('handshake') + ' Brotherhood in Islam',
  sisterhood:    iqIcon('flower') + ' Sisterhood in Islam',
  orphans2:      iqIcon('heart') + ' Care for Orphans',
  elderly:       iqIcon('user') + ' Respecting the Elderly',
  disabled:      iqIcon('heart') + ' Inclusion & Disability',
  antiracism:    iqIcon('globe') + ' Anti-Racism in Islam',
  poverty:       iqIcon('heart') + ' Poverty & Social Justice',
  volunteering:  iqIcon('heart') + ' Volunteering in Islam',
  epistemology:  iqIcon('brain') + ' Islamic Epistemology',
  ontology:      iqIcon('brain') + ' Islamic Ontology',
  logic:         iqIcon('sparkles') + ' Logic in Islamic Thought',
  kalam:         iqIcon('message-circle') + ' Ilm al-Kalam (Theology)',
  reason:        iqIcon('zap') + ' Reason & Revelation',
  freewill:      iqIcon('handshake') + ' Free Will & Qadar',
  problemofevil: iqIcon('moon') + ' The Problem of Evil',
  prophethood:   iqIcon('scroll') + ' Nubuwwah (Prophethood)',
  existence:     iqIcon('sparkles') + ' Existence & Tawhid'
};
  window.NEW_POOLS = NEW_POOLS;
Object.keys(NEW_POOLS).forEach(k => {
  window['render' + k] = function() {
    const title = NEW_POOL_TITLES[k] || (iqIcon('sparkles') + ' ' + k.charAt(0).toUpperCase() + k.slice(1));
    poolRender(k + 'Area', title, NEW_POOLS[k], k + 'Idx');
  }
});

  let _activeCategoryId = null;

  function switchCategory(catId, btn) {
    document.querySelectorAll('.t1-btn').forEach(el => {
      el.classList.remove('active');
      el.setAttribute('aria-selected', 'false');
    });
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    }
    if (S) { S.lastCat = catId; saveState(); }
    const group = TAB_GROUPS[catId] || [];
    const container = document.getElementById('tier2Tabs');
    const tier3Wrap = document.getElementById('tier3Wrap');
    const isCategorized = group.length > 0 && Array.isArray(group[0].tabs);
    if (isCategorized) {
      _activeCategoryId = null;
      container.classList.add('cat-chips');
      container.innerHTML = group.map((c, i) => `<button class="cat-chip ${i===0?'active':''}" onclick="App.selectCategory('${c.id}', this)"><span>${iqIcon(c.icon || c.id)}</span> ${c.label}</button>`).join('');
      if (tier3Wrap) tier3Wrap.style.display = '';
      const firstCat = group[0];
      _activeCategoryId = firstCat.id;
      renderCategoryTabs(firstCat);
    } else {
      container.classList.remove('cat-chips');
      container.innerHTML = group.map((p, i) => `<button data-tab="${p.id}" class="t2-btn ${i===0?'active':''}" onclick="App.activateTab('${p.id}', this)"><span>${iqIcon(p.icon || p.id)}</span> ${p.label}</button>`).join('');
      if (tier3Wrap) tier3Wrap.style.display = 'none';
      if (group.length > 0) activateTab(group[0].id, container.firstElementChild);
    }
  }
  function selectCategory(catId, btn) {
    document.querySelectorAll('.cat-chip').forEach(el => el.classList.remove('active'));
    if (btn) btn.classList.add('active');
    _activeCategoryId = catId;
    const group = Object.values(TAB_GROUPS).find(g => Array.isArray(g[0]?.tabs) && g.some(c => c.id === catId)) || [];
    const cat = group.find(c => c.id === catId);
    if (cat) renderCategoryTabs(cat);
  }
  function renderCategoryTabs(cat) {
    const grid = document.getElementById('tier3Tabs');
    if (!grid) return;
    grid.innerHTML = cat.tabs.map((p, i) => `<button data-tab="${p.id}" class="t2-btn ${i===0?'active':''}" onclick="App.activateTab('${p.id}', this)"><span>${iqIcon(p.icon || p.id)}</span> ${p.label}</button>`).join('');
    if (cat.tabs.length > 0) activateTab(cat.tabs[0].id, grid.firstElementChild);
  }
  function getSectionPanels(sectionName) {
    const sections = {
      home: ['panel-today','panel-timer','panel-journeys','panel-morning','panel-evening','panel-dhikr','panel-duas','panel-quran','panel-wudu','panel-jumuah','panel-salah','panel-fasting','panel-healthlog','panel-finance','panel-mood'],
      quests: ['panel-quests'],
      stats: ['panel-stats'],
      growth: ['panel-progress', 'panel-growth'],
      profile: ['panel-profile','panel-trophies','panel-rewards','panel-allah_names','panel-prophet_names','panel-scholars_names']
    };
    return sections[sectionName] || null;
  }
  function activateTab(tabId, btn) {
    document.querySelectorAll('.t2-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    if (S) { S.lastSub = tabId; saveState(); }
    let sectionName = null;
    for (const [sec, panels] of Object.entries({home:['panel-today','panel-timer','panel-journeys','panel-morning','panel-evening','panel-dhikr','panel-duas','panel-quran','panel-wudu','panel-jumuah','panel-salah','panel-fasting','panel-healthlog','panel-finance','panel-mood'],quests:['panel-quests'],stats:['panel-stats'],growth:['panel-progress','panel-growth'],profile:['panel-profile','panel-trophies','panel-rewards','panel-allah_names','panel-prophet_names','panel-scholars_names']})) {
      if (panels.includes('panel-' + tabId)) { sectionName = sec; break; }
    }
    const sectionPanels = sectionName ? getSectionPanels(sectionName) : null;
    if (sectionPanels) {
      sectionPanels.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
      });
    } else {
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    }
    const panel = document.getElementById('panel-' + tabId);
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    if (panel) panel.classList.add('active');
    const _lazyRender = {
      quran:'renderQuran', hadith:'renderHadith', sunnahs:'renderSunnahs', dhikr:'renderDhikr',
      stories:'renderStories', names:'renderNames', inspirations:'renderInspirations', gratitude:'renderGratitude',
      allah_names:'renderNames', scholars_names:'renderScholars',
      fasting:'renderFasting', charity:'renderCharity', memorization:'renderMemorization',
      morning:'renderMorning', evening:'renderEvening', sins:'renderSins', punishments:'renderPunishments',
      repentance:'renderRepentance', sahaba:'renderSahaba', seerah:'renderSeerah', tafsir:'renderTafsir',
      manners:'renderManners', family:'renderFamily', health:'renderHealth', finance:'renderFinance',
      ummah:'renderUmmah', hajj:'renderHajj', akhirah:'renderAkhirah', prophets:'renderProphets',
      women:'renderWomen', heart:'renderHeart', marriage:'renderMarriage', science:'renderScience',
      wudu:'renderWudu', scholars:'renderScholars', patience:'renderPatience', work:'renderWork',
      community:'renderCommunity', environment:'renderEnvironment', travel:'renderTravel',
      fiqh:'renderFiqh', arabic:'renderArabic', tawakkul:'renderTawakkul', ikhlas:'renderIkhlas',
      zuhd:'renderZuhd', dawah:'renderDawah', battles:'renderBattles', jannah:'renderJannah',
      jahannam:'renderJahannam', grave:'renderGrave', signs:'renderSigns', dreams:'renderDreams',
      parenting:'renderParenting', food:'renderFood', tibb:'renderTibb', youth:'renderYouth',
      tech:'renderTech', neighbors:'renderNeighbors', salah:'renderSalah', finance:'renderFinanceTab',
      aqeedah:'renderAqeedah', knowledge:'renderKnowledge', civilisation:'renderCivilisation', jumuah:'renderJumuah',
      purification:'renderPurification', salahrules:'renderSalahrules', zakatrules:'renderZakatrules',
      sawmrules:'renderSawmrules', hajjrules:'renderHajjrules', trade:'renderTrade',
      inheritance:'renderInheritance', oaths:'renderOaths', sufism:'renderSufism', tazkiyah:'renderTazkiyah',
      fear:'renderFear', hope:'renderHope', loveofallah:'renderLoveofallah', contentment:'renderContentment',
      reflection:'renderReflection', brotherhood:'renderBrotherhood', sisterhood:'renderSisterhood',
      orphans2:'renderOrphans2', elderly:'renderElderly', disabled:'renderDisabled',
      antiracism:'renderAntiracism', poverty:'renderPoverty', volunteering:'renderVolunteering',
      technology:'renderTechnology', socialmedia:'renderSocialmedia', ethics:'renderEthics',
      bioethics:'renderBioethics', modfinance:'renderModfinance', politics:'renderPolitics',
      green:'renderGreen', mentalhealth:'renderMentalhealth', education:'renderEducation',
      umayyads:'renderUmayyads', abbasids:'renderAbbasids', andalus:'renderAndalus',
      ottomans:'renderOttomans', mamluks:'renderMamluks', seljuks:'renderSeljuks',
      fatimids:'renderFatimids', ayyubids:'renderAyyubids', modernhist:'renderModernhist',
      ancientprophets:'renderAncientprophets', mecca:'renderMecca', medina:'renderMedina',
      jerusalem:'renderJerusalem', damascus:'renderDamascus', baghdad:'renderBaghdad',
      cairo:'renderCairo', cordoba:'renderCordoba', istanbul:'renderIstanbul',
      bukhara:'renderBukhara', samarkand:'renderSamarkand', calligraphy:'renderCalligraphy',
      architecture:'renderArchitecture', geometry:'renderGeometry', poetryart:'renderPoetryart',
      literature:'renderLiterature', nasheeds:'renderNasheeds', illumination:'renderIllumination',
      textiles:'renderTextiles', ceramics:'renderCeramics', woodwork:'renderWoodwork',
      arabicgrammar:'renderArabicgrammar', vocab:'renderVocab', rhetoric:'renderRhetoric',
      morphology:'renderMorphology', pronunciation:'renderPronunciation', poetry:'renderPoetry',
      proverbs:'renderProverbs', etymology:'renderEtymology', dialects:'renderDialects',
      scripts:'renderScripts', epistemology:'renderEpistemology', ontology:'renderOntology',
      logic:'renderLogic', kalam:'renderKalam', reason:'renderReason', freewill:'renderFreewill',
      problemofevil:'renderProblemofevil', prophethood:'renderProphethood', existence:'renderExistence',
      keys:'renderKeys', mosque:'renderMosque', ramadan:'renderRamadan', laylat:'renderLaylat',
      timer:'renderPrayerTimes', stats:'renderStats'
    };
    if (_lazyRender[tabId] && window[_lazyRender[tabId]]) {
      try { window[_lazyRender[tabId]](); } catch(e) { console.warn('Lazy render ' + tabId + ' failed:', e.message); }
    }
    if (tabId === 'hadith' && typeof HADITH_COLLECTIONS_DATA === 'undefined') {
      ensureHadithLoaded().then(() => { if (window.renderHadith) window.renderHadith(); }).catch(() => {});
    }
  }

  function switchTab(name) {
    if (S) S.lastTab = name;
    if (S) saveState();
    const content = document.getElementById('mainContent');
    if (content) { content.classList.add('fading'); setTimeout(() => content.classList.remove('fading'), 60); }
    renderTab(name);
  }

  function renderTab(name) {
    const panelMap = {
      home: 'panel-today',
      quests: 'panel-quests',
      stats: 'panel-stats',
      growth: 'panel-growth',
      profile: 'panel-profile'
    };
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    const panelId = panelMap[name] || 'panel-today';
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
    if (name === 'home') {
      window.renderPrayers(); window.renderVol(); window.renderDeeds(); window.renderBonus();
      window.renderTopBar();
    } else if (name === 'quests') {
      window.renderQ(); window.renderAch();
    } else if (name === 'stats') {
      if (window.Dashboard && typeof window.Dashboard.renderInsights === 'function') window.Dashboard.renderInsights();
    } else if (name === 'growth') {
      if (window.renderProg) window.renderProg();
      if (window.renderGarden) window.renderGarden();
      if (window.renderSpiritualGrowthTab) window.renderSpiritualGrowthTab();
      if (window.renderBoat) window.renderBoat();
      if (window.renderArmor) window.renderArmor();
      if (window.renderHeartRefinement) window.renderHeartRefinement();
    } else if (name === 'profile') {
      window.renderProfile();
      if (window.renderKeys) window.renderKeys();
      if (window.renderMosque) window.renderMosque();
    }
    updateTopBar();
  }

  function updateTopBar() {
    if (window.renderTopBar) window.renderTopBar();
  }

  // Keyboard navigation for tier tabs
  function initTierTabKeyboardNav() {
    const tier1Tabs = document.querySelector('.tier1-tabs');
    if (!tier1Tabs) return;
    
    tier1Tabs.addEventListener('keydown', function(e) {
      const tabs = Array.from(tier1Tabs.querySelectorAll('.t1-btn'));
      const currentIndex = tabs.findIndex(t => t.classList.contains('active'));
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        tabs[prevIndex].focus();
        tabs[prevIndex].click();
      } else if (e.key === 'Home') {
        e.preventDefault();
        tabs[0].focus();
        tabs[0].click();
      } else if (e.key === 'End') {
        e.preventDefault();
        tabs[tabs.length - 1].focus();
        tabs[tabs.length - 1].click();
      }
    });
  }

  // Keyboard navigation for tier2 tabs
  function initTier2TabKeyboardNav() {
    const tier2Tabs = document.getElementById('tier2Tabs');
    if (!tier2Tabs) return;
    
    tier2Tabs.addEventListener('keydown', function(e) {
      const tabs = Array.from(tier2Tabs.querySelectorAll('.t2-btn, .cat-chip'));
      if (tabs.length === 0) return;
      const currentIndex = tabs.findIndex(t => t.classList.contains('active'));
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        tabs[prevIndex].focus();
        tabs[prevIndex].click();
      } else if (e.key === 'Home') {
        e.preventDefault();
        tabs[0].focus();
        tabs[0].click();
      } else if (e.key === 'End') {
        e.preventDefault();
        tabs[tabs.length - 1].focus();
        tabs[tabs.length - 1].click();
      }
    });
  }

  function populateTier1Icons() {
    const buttons = document.querySelectorAll('.t1-btn');
    buttons.forEach(function(btn) {
      const span = btn.querySelector('.iq-inline');
      if (!span || span.childElementCount > 0) return;
      const cat = btn.getAttribute('data-cat');
      if (!cat) return;
      const icon = iqIcon(cat);
      if (icon) span.innerHTML = icon;
    });
  }

  // Modal keyboard handlers (Escape to close, focus trap)
  var _modalTriggerEl = null;
  function trapFocus(modal, e) {
    var focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  function initModalKeyboardHandlers() {
    // Muhasabah modal
    var muhasabahModal = document.getElementById('muhasabahModal');
    if (muhasabahModal) {
      muhasabahModal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          if (typeof window.dismissMuhasabah === 'function') window.dismissMuhasabah();
        } else if (e.key === 'Tab') {
          trapFocus(muhasabahModal, e);
        }
      });
    }
    
    // Toast overlay
    var toastOverlay = document.getElementById('toastOverlay');
    if (toastOverlay) {
      toastOverlay.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeToastOverlay();
        } else if (e.key === 'Tab') {
          trapFocus(toastOverlay, e);
        }
      });
    }
  }
  function closeToastOverlay() {
    var toastOverlay = document.getElementById('toastOverlay');
    if (!toastOverlay) return;
    toastOverlay.classList.remove('show');
    toastOverlay.style.display = 'none';
    toastOverlay.innerHTML = '';
    toastOverlay.style.pointerEvents = 'none';
    if (_modalTriggerEl && _modalTriggerEl.focus) {
      _modalTriggerEl.focus();
      _modalTriggerEl = null;
    }
  }

  // Theme toggle keyboard support
  function initThemeToggleKeyboard() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  function initApp() {
  const overlay = document.getElementById('introOverlay');
  // Always show intro on every page load
  if (overlay) {
    overlay.classList.add('visible');
    overlay.style.opacity = '1';
  }
  applyTheme();
  // Profile as main tab
  TAB_GROUPS.profile_main = [
    { id: 'profile', icon: 'user', label: 'Profile' },
    { id: 'trophies', icon: 'trophy', label: 'Trophies' },
    { id: 'goals', icon: 'target', label: 'Goals' },
    { id: 'progress', icon: 'bar-chart-3', label: 'Progress' },
    { id: 'stats', icon: 'trending-up', label: 'Analytics' },
    { id: 'rewards', icon: 'gift', label: 'Rewards' }
  ];

    const t = today();
    if (S.lad !== t) { S.lad=t; if(S.ab&&S.ab.exp<t) S.ab=null; recalc(); saveState(); }
    genDQ(); genWQ(); genMQ(); genYQ(); genLQ(); refreshContent(); recalc(); checkQ(); S.lv=lvFrom(S.xp); saveState(); initCalView(); renderAll();
    if (window.renderDailyContent) renderDailyContent();
    if (window.showWeeklySummary) showWeeklySummary();
    if (window.showDailySummary) showDailySummary();
    if (window.showDailyRitual) showDailyRitual();
    if (window.checkConsistency) checkConsistency();
    if (window.checkWeeklyConsistency) checkWeeklyConsistency();
    try {
      const savedCat = S ? S.lastCat : null;
      const savedSub = S ? S.lastSub : null;
      let activeBtn = savedCat ? document.querySelector('.t1-btn[data-cat="' + savedCat + '"]') : null;
      if (!activeBtn) activeBtn = document.querySelector('.t1-btn.active');
      const activeCat = activeBtn ? activeBtn.getAttribute('data-cat') : 'ibadah';
      switchCategory(activeCat, activeBtn);
      if (savedSub) {
        const subBtn = document.querySelector('[data-tab="' + savedSub + '"]');
        if (subBtn) subBtn.click();
      }
    } catch(e) { console.warn('Initial nav render failed:', e); }
  }

  function init() {
    try { resolveCurrentUser(); } catch(e) { console.error('Step 0 resolve user failed:', e); }
    try { S = loadState(); } catch(e) { console.error('Step 1 loadState failed:', e); }
    if (typeof isOnboardingComplete === 'function' && !isOnboardingComplete()) {
      startOnboarding();
    }
    try { applyTheme(); } catch(e) { console.error('Step 2 applyTheme failed:', e); }
    try { initApp(); } catch(e) { console.error('Step 3 initApp failed:', e); }
    try { if (window.initSearch) initSearch(); } catch(e) { console.error('Step 3b initSearch failed:', e); }
    try { if (window.initFAB) initFAB(); } catch(e) { console.error('Step 3c initFAB failed:', e); }
    try { if (window.initPullRefresh) initPullRefresh(); } catch(e) { console.error('Step 3d initPullRefresh failed:', e); }
    try {
      if (window.requestNotificationPermission) requestNotificationPermission();
      if (S.notificationsEnabled && window.scheduleNotifications) scheduleNotifications();
    } catch(e) { console.error('Step 3e notifications init failed:', e); }
    try {
      document.addEventListener('click', (e) => {
        const sr = document.getElementById('globalSearchResults');
        if (sr && !e.target.closest('.global-search-wrap')) sr.classList.remove('show');
      });
    } catch(e) { console.error('Step 6 clickOutside failed:', e); }
    try { initTierTabKeyboardNav(); } catch(e) { console.error('Step 7 tier tab keyboard nav failed:', e); }
    try { initTier2TabKeyboardNav(); } catch(e) { console.error('Step 8 tier2 tab keyboard nav failed:', e); }
    try { populateTier1Icons(); } catch(e) { console.error('Step 8b tier1 icons failed:', e); }
    try { initModalKeyboardHandlers(); } catch(e) { console.error('Step 9 modal keyboard handlers failed:', e); }
    try { initThemeToggleKeyboard(); } catch(e) { console.error('Step 10 theme toggle keyboard failed:', e); }
    window.App = {
      toggleP, toggleV, toggleD, buy,
      detail: (id) => toast(iqIcon('alert-triangle'), DETAILS[id]||'Voluntary Prayer', false, 4000),
      tip: (id) => toast(iqIcon('zap'), TIPS[id]||'A beautiful deed!', false, 4000),
      toggleQuest, addGratitude, toggleFasting, setCharityGoals,
      grantDailyXp, grantCappedDailyXp,
      logWater: typeof window.logWater === 'function' ? window.logWater : () => {},
      logSleep: typeof window.logSleep === 'function' ? window.logSleep : () => {},
      logExercise: typeof window.logExercise === 'function' ? window.logExercise : () => {},
      toggleMeal: typeof window.toggleMeal === 'function' ? window.toggleMeal : () => {},
      addMemorization, toggleMorning, toggleEvening, switchUser, logout, resetAll,
      openMuhasabah: typeof window.openMuhasabah === 'function' ? window.openMuhasabah : () => {},
      dismissMuhasabah: typeof window.dismissMuhasabah === 'function' ? window.dismissMuhasabah : () => {},
      joinJourney: typeof window.joinJourney === 'function' ? window.joinJourney : () => {},
      manualRefresh: manualRefreshContent, ensureQuranLoaded, ensureHadithLoaded, switchCategory, selectCategory, activateTab,
      claimBonus, tapDhikr, resetDhikr, nextDhikr, addCustomDhikr, removeCustomDhikr, toggleDhikrFavorite,
      setQuranView, quranSearchFilter, openQuranSurah, quranBack, openQuranJuz,
      openHadithCollection, openHadithBook, hadithBack,
      playQuranVerse, playSurah, stopSurah, setQuranReciter, playJuz, updateJuzButton,
calPrevMonth, calNextMonth, calGoToday, selectAvatar, selectTitle, selectFrame,
setTheme, toggleTheme,
      toggleNotifications: typeof window.toggleNotifications === 'function' ? window.toggleNotifications : () => {},
      switchTab
    };
    window.checkA = checkA;
    window.playSound = playSound;
    window.levelUpToast = levelUpToast;
    window.grantDailyXp = grantDailyXp;
    window.grantCappedDailyXp = grantCappedDailyXp;
    window.closeToastOverlay = closeToastOverlay;
    App.switchTab = switchTab;
    console.log('Ibadah Quest initialized. window.App is set.');
  }

  function startJourney() {
    var overlay = document.getElementById('introOverlay');
    if (overlay) {
      overlay.style.transition = 'opacity 0.8s ease-in-out';
      overlay.style.opacity = '0';
      setTimeout(function(){
        overlay.classList.remove('visible');
        overlay.style.display = 'none';
        overlay.style.transition = '';
      }, 800);
    }
  }
  window.startJourney = startJourney;

  try {
    init();
  } catch(e) {
    console.error('Ibadah Quest init error:', e);
    console.error('Stack:', e.stack);
  }
})();
