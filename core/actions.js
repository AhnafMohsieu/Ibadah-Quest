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
  function toggleP(id) { const l=tlog(); const w=!!l.p[id]; const oldLv=S.lv; l.p[id]=!w; const pr=PRAYERS.find(x=>x.id===id); if(!pr) return; let xp=pr.xp; if(isFri()&&id==='dhuhr'&&pr.fri) xp=pr.fri.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; if(!w){ S.tp++; S.xp+=xp; if(isFri()&&id==='dhuhr') S.tj=(S.tj||0)+1; playSound('pop'); } else { S.tp=Math.max(0,S.tp-1); S.xp=Math.max(0,S.xp-xp); if(isFri()&&id==='dhuhr') S.tj=Math.max(0,(S.tj||0)-1); } S.lv=lvFrom(S.xp); checkLevelUp(oldLv); recalc(); checkQ(); checkA(); saveState(); renderDynamic(); }
  function toggleV(id) { const l=tlog(); if(!l.v) l.v={}; const w=!!l.v[id]; const oldLv=S.lv; l.v[id]=!w; const vp=VOLUNTARY.find(x=>x.id===id); if(!vp) return; let xp=vp.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; if(!w){ S.vc[id]=(S.vc[id]||0)+1; S.xp+=xp; playSound('pop'); } else { S.vc[id]=Math.max(0,(S.vc[id]||0)-1); S.xp=Math.max(0,S.xp-xp); } S.lv=lvFrom(S.xp); checkLevelUp(oldLv); checkQ(); checkA(); saveState(); renderDynamic(); }
  function toggleD(id) { const l=tlog(); const w=!!l.d[id]; const oldLv=S.lv; l.d[id]=!w; const de=DEEDS.find(x=>x.id===id); if(!de) return; let xp=de.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; if(!w){ S.td[id]=(S.td[id]||0)+1; S.xp+=xp; playSound('pop'); } else { S.td[id]=Math.max(0,(S.td[id]||0)-1); S.xp=Math.max(0,S.xp-xp); } S.lv=lvFrom(S.xp); checkLevelUp(oldLv); recalc(); checkQ(); checkA(); saveState(); renderDynamic(); }
  function buy(id) { const r=SHOP.find(x=>x.id===id); if(!r||S.ur[id]) return; if(S.xp<r.cost){ toast(iqIcon('x'),'Not enough XP'); return; } const oldLv=S.lv; S.xp-=r.cost; S.ur[id]=true; if(r.t==='boost') S.ab={exp:today(new Date(Date.now()+86400000))}; if(r.t==='freeze') S.sfu=true; if(r.t==='xp') S.xp+=r.v||0; if(r.t==='reroll'){ genDQ(); toast(iqIcon('refresh-cw'),'Quests rerolled!'); } else toast(iqIcon('gift'),'Purchased!'); S.lv=lvFrom(S.xp); checkLevelUp(oldLv); saveState(); renderAll(); checkA(); setTimeout(() => { const cards = document.querySelectorAll('.reward-card'); cards.forEach(c => { if (c.onclick?.toString().includes(id)) c.classList.add('just-bought'); }); }, 50); }
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
    const ov=document.getElementById('toastOverlay');
    ov.innerHTML=`<div class="levelup-box"><div class="levelup-glow"></div><div class="levelup-icon">${iqIcon('zap')}</div><div class="levelup-label">LEVEL UP</div><div class="levelup-num">${lv}</div><div class="levelup-title">${title}</div></div>`;
    ov.style.display='flex'; ov.classList.add('show'); ov.style.pointerEvents='auto';
    playSound('chime');
    for(let i=0;i<50;i++){ const el=document.createElement('span'); el.className='confetti'; el.textContent=[iqEmoji('sparkles'),iqEmoji('star'),iqEmoji('sparkles'),iqEmoji('zap'),iqEmoji('star'),iqEmoji('moon')][i%6]; el.style.left=Math.random()*100+'%'; el.style.top='-20px'; el.style.setProperty('--fall-dur',(2+Math.random()*4)+'s'); el.style.setProperty('--rot',(Math.random()*720-360)+'deg'); document.body.appendChild(el); setTimeout(()=>el.remove(),4000); }
    if(ov._t) clearTimeout(ov._t);
    ov._t=setTimeout(()=>{ ov.classList.remove('show'); setTimeout(()=>{ ov.style.display='none'; ov.innerHTML=''; },400); ov.style.pointerEvents='none'; },4000);
    ov.onclick=()=>{ ov.classList.remove('show'); setTimeout(()=>{ ov.style.display='none'; ov.innerHTML=''; },400); ov.style.pointerEvents='none'; if(ov._t) clearTimeout(ov._t); };
  }
  function toast(icon, msg, conf=false, ms=2600) {
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
    if(u){ S.lv=lvFrom(S.xp); checkLevelUp(oldLv); checkA(); saveState(); }
  }
  function trackQuestXP(type, xp) { if (!S.questXP) S.questXP = {daily:0,weekly:0,monthly:0,yearly:0,lifetime:0}; S.questXP[type] = (S.questXP[type] || 0) + xp; S.questXP.lifetime = (S.questXP.lifetime || 0) + xp; }
  function toggleQuest(id,type,xp){ let arr; if(type==='daily') arr=S.dq; else if(type==='weekly') arr=S.wq; else if(type==='monthly') arr=S.mq; else if(type==='yearly') arr=S.yq; else if(type==='lifetime') arr=S.lq; else return; const q=arr.find(x=>x.id===id); if(!q) return; const oldLv=S.lv; q.done=!q.done; const xpVal=xp||q.xp; if(q.done){ S.xp+=xpVal; S.tq++; trackQuestXP(type,xpVal); } else { S.xp=Math.max(0,S.xp-xpVal); S.tq=Math.max(0,S.tq-1); trackQuestXP(type,-xpVal); } S.lv=lvFrom(S.xp); checkLevelUp(oldLv); saveState(); renderQ(); renderDynamic(); }
  function recalc() { const all=Object.keys(S.log).filter(d=>Object.values(S.log[d].p||{}).filter(v=>v).length>=5).sort(); let best=0,run=0,prev=null; for(const d of all){ if(prev){ const p=new Date(prev+'T00:00:00'); const c=new Date(d+'T00:00:00'); const diffDays=Math.round((c-p)/86400000); if(diffDays===1) run++; else run=1; } else { run=1; } best=Math.max(best,run); prev=d; } S.bs=best; const tc=Object.values(tlog().p||{}).filter(v=>v).length>=5; if(tc){ let s=1,ck=new Date(); while(true){ ck.setDate(ck.getDate()-1); const dk=today(ck); if(S.log[dk]&&Object.values(S.log[dk].p||{}).filter(v=>v).length>=5) s++; else break; } S.cs=s; } else { const yd=today(new Date(Date.now()-86400000)); S.cs=(S.log[yd]&&Object.values(S.log[yd].p||{}).filter(v=>v).length>=5)?1:0; } S.pd=all.length; if(S.cs>S.bs) S.bs=S.cs; }
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
  function toggleAvatarPicker() {
    const picker = document.getElementById('avatarPicker');
    if (picker) picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
  }

  const NEW_POOLS = {
  "umayyads": [
    {
      "title": "Expansion of the Ummah",
      "desc": "The Umayyad Caliphate (661-750 CE) oversaw the greatest expansion of the Islamic empire, reaching Al-Andalus in the West and Sindh in the East, unifying vast lands under a single administration.",
      "source": "Islamic History"
    },
    {
      "title": "Dome of the Rock",
      "desc": "Caliph Abd al-Malik ibn Marwan commissioned the Dome of the Rock (Qubbat al-Sakhrah) in Jerusalem in 691 CE, making it the oldest surviving major work of Islamic architecture.",
      "source": "Historical Records"
    },
    {
      "title": "Coinage Reform",
      "desc": "Abd al-Malik standardized Islamic currency, replacing Byzantine/Sassanian coins with the gold Dinar, cementing economic independence.",
      "source": "Historical Numismatics"
    },
    {
      "title": "Postal System (Barid)",
      "desc": "The Umayyads established an extensive network of post roads and horse relays (Al-Barid) for swift communication across the vast empire.",
      "source": "Umayyad Administration"
    },
    {
      "title": "Arabization of State",
      "desc": "Arabic was declared the official language of government records, unifying the diverse administrative systems of conquered lands.",
      "source": "History of the Caliphs"
    }
  ],
  "abbasids": [
    {
      "title": "The Golden Age",
      "desc": "The Abbasid Caliphate (750-1258 CE) established Baghdad as the center of global knowledge, initiating the Islamic Golden Age with the translation movement at the House of Wisdom.",
      "source": "Islamic History"
    },
    {
      "title": "Scientific Advancements",
      "desc": "Under Abbasid rule, polymaths like Al-Khwarizmi and Ibn Sina flourished. Hospitals (Bimaristans) and astronomical observatories were publicly funded and heavily developed.",
      "source": "History of Science"
    },
    {
      "title": "House of Wisdom",
      "desc": "Bayt al-Hikmah in Baghdad was a grand library and translation center where Greek, Persian, and Indian texts were translated into Arabic.",
      "source": "Intellectual History"
    },
    {
      "title": "Paper Making",
      "desc": "After the Battle of Talas (751), Abbasids adopted paper-making from Chinese prisoners, sparking a literary revolution in the Islamic world.",
      "source": "History of Technology"
    },
    {
      "title": "Mu'tazila Controversy",
      "desc": "The Mihna (Inquisition) involved the debate over whether the Quran was created or uncreated, severely impacting Abbasid scholarly life.",
      "source": "Theological History"
    }
  ],
  "andalus": [
    {
      "title": "Convivencia",
      "desc": "Al-Andalus (Muslim Spain) was known for periods of 'Convivencia'\u2014coexistence where Muslims, Christians, and Jews lived together, sparking a renaissance in art, science, and philosophy.",
      "source": "Andalusian History"
    },
    {
      "title": "Cordoba: Jewel of the World",
      "desc": "In the 10th century, Cordoba was the largest and most advanced city in Europe, boasting paved streets, street lighting, and libraries with hundreds of thousands of books.",
      "source": "Historical Records"
    },
    {
      "title": "The Great Mosque of Cordoba",
      "desc": "Started in 784 CE, the Great Mosque (Mezquita) became one of the largest and most magnificent mosques in the world, featuring iconic double arches and a forest of columns.",
      "source": "Architectural History"
    },
    {
      "title": "Agricultural Revolution",
      "desc": "Andalusian Muslims introduced new crops (oranges, cotton, sugar) and advanced irrigation techniques like the water wheel (Noria).",
      "source": "Agrarian Studies"
    },
    {
      "title": "The Fall of Granada",
      "desc": "In 1492, the Emirate of Granada, the last Muslim stronghold in Iberia, fell to the Catholic Monarchs Ferdinand and Isabella, ending nearly 800 years of Muslim rule in Al-Andalus.",
      "source": "European History"
    }
  ],
  "ottomans": [
    {
      "title": "Conquest of Constantinople",
      "desc": "In 1453, Sultan Mehmed the Conqueror captured Constantinople (modern Istanbul), fulfilling the prophecy of the Prophet Muhammad \u203e (or rather, the promise mentioned in hadith) and establishing the Ottoman Empire as a global superpower.",
      "source": "Ottoman Chronicles"
    },
    {
      "title": "The Millet System",
      "desc": "The Ottomans governed a vast multi-ethnic empire using the Millet system, which allowed religious minorities to rule themselves under their own laws and courts.",
      "source": "Historical Governance"
    },
    {
      "title": "Ottoman Architecture",
      "desc": "The Ottomans mastered dome construction, culminating in Sinan's Selimiye Mosque in Edirne, which rivaled the Hagia Sophia in grandeur.",
      "source": "Architectural History"
    },
    {
      "title": "Devshirme System",
      "desc": "A system where young Christian boys were recruited, converted, and trained to become elite Janissary soldiers or high-ranking viziers.",
      "source": "Ottoman Administration"
    },
    {
      "title": "Suleiman the Magnificent",
      "desc": "Under Suleiman, the empire reached its territorial peak and underwent major legal codification (Kanun) harmonizing with Sharia.",
      "source": "Imperial History"
    }
  ],
  "mamluks": [
    {
      "title": "Defeating the Mongols",
      "desc": "The Mamluks (slave-soldiers turned rulers) saved the Islamic world and Europe from the Mongol invasions by decisively defeating them at the Battle of Ain Jalut in 1260 CE.",
      "source": "Islamic History"
    },
    {
      "title": "Architectural Patronage",
      "desc": "The Mamluk Sultanate of Egypt and Syria (1250-1517) produced some of the most spectacular monuments in Cairo, characterized by intricate stone carving and majestic domes.",
      "source": "Mamluk Architecture"
    },
    {
      "title": "Battle of Ain Jalut",
      "desc": "In 1260, the Mamluks defeated the Mongol army, halting their westward expansion and saving the Islamic heartlands from destruction.",
      "source": "Military History"
    },
    {
      "title": "Slave-Soldier Elite",
      "desc": "Mamluks were originally enslaved soldiers of Kipchak Turkic and Circassian origin who rose to establish a powerful Sultanate in Egypt.",
      "source": "Mamluk History"
    },
    {
      "title": "Islamic Coinage",
      "desc": "The Mamluks minted some of the finest gold dinars in Islamic history, known for their purity, intricate calligraphy, and geometric patterns.",
      "source": "Numismatic History"
    }
  ],
  "seljuks": [
    {
      "title": "Revival of Sunnism",
      "desc": "The Seljuk Empire (11th-12th centuries) revitalized the Sunni Islamic world, championing the establishment of Madrasas (Nizamiyyah) to standardize higher education.",
      "source": "Seljuk History"
    },
    {
      "title": "Battle of Manzikert",
      "desc": "In 1071, Sultan Alp Arslan defeated the Byzantine Empire at Manzikert, opening Anatolia to Turkic settlement and laying the foundations for the future Ottoman Empire.",
      "source": "Historical Records"
    },
    {
      "title": "Seljuk Legacy",
      "desc": "The Seljuk Empire bridged the gap between the Abbasids and Ottomans, preserving Islamic scholarship and establishing systems that later empires would adopt.",
      "source": "Historical Analysis"
    },
    {
      "title": "Nizamiyya Madrasas",
      "desc": "Vizier Nizam al-Mulk established a network of higher education institutions (Madrasas) to standardize Sunni scholarship and combat heterodoxy.",
      "source": "History of Education"
    },
    {
      "title": "Persianate Culture",
      "desc": "The Seljuks heavily patronized Persian language and literature, bridging Turkic military rule with high Persian administrative culture.",
      "source": "Cultural History"
    }
  ],
  "fatimids": [
    {
      "title": "Founding of Cairo",
      "desc": "The Fatimid Caliphate founded the city of Cairo (Al-Qahirah, 'The Victorious') in 969 CE, which became the political and cultural capital of Egypt.",
      "source": "Fatimid History"
    },
    {
      "title": "Al-Azhar University",
      "desc": "They established Al-Azhar Mosque in 970 CE, which eventually developed into one of the oldest continuously operating universities in the world.",
      "source": "Educational History"
    },
    {
      "title": "Fatimid Art & Culture",
      "desc": "The Fatimids developed a distinctive artistic style featuring intricate woodcarvings, rock crystal, and goldwork that influenced Islamic art for centuries.",
      "source": "Art History"
    },
    {
      "title": "Naval Power",
      "desc": "The Fatimids maintained a powerful navy that dominated the Eastern Mediterranean, protecting their lucrative trade routes.",
      "source": "Maritime History"
    }
  ],
  "ayyubids": [
    {
      "title": "Salah ad-Din's Mercy",
      "desc": "Salah ad-Din (Saladin) founded the Ayyubid dynasty. He recaptured Jerusalem in 1187 but unlike the Crusaders 88 years prior, he showed immense mercy, granting amnesty and safe passage to its inhabitants.",
      "source": "Ayyubid Chronicles"
    },
    {
      "title": "Unification of the Levant",
      "desc": "The Ayyubids unified Egypt, the Levant, and the Hijaz, creating a strong front that successfully resisted the Third Crusade led by Richard the Lionheart.",
      "source": "Islamic History"
    },
    {
      "title": "Capture of Jerusalem",
      "desc": "In 1187, Salahuddin (Saladin) recaptured Jerusalem from the Crusaders following the decisive Battle of Hattin.",
      "source": "Crusader Era History"
    },
    {
      "title": "Sunni Revival",
      "desc": "Salahuddin abolished the Fatimid Caliphate in Egypt, restoring Sunni dominance and heavily patronizing Shafi'i and Ash'ari scholarship.",
      "source": "Religious History"
    },
    {
      "title": "Bimaristans (Hospitals)",
      "desc": "The Ayyubids built advanced hospitals, such as the Al-Nuri Hospital in Damascus, treating patients for free and functioning as medical schools.",
      "source": "History of Medicine"
    }
  ],
  "modernhist": [
    {
      "title": "Post-Colonial Era",
      "desc": "The 20th century saw the end of the Ottoman Empire (1924) and the struggle of Muslim-majority nations gaining independence from European colonial rule.",
      "source": "Modern History"
    },
    {
      "title": "The Awakening (Sahwa)",
      "desc": "The late 20th century experienced a global Islamic resurgence, marked by renewed interest in Islamic identity, scholarship, and political consciousness across the Muslim world.",
      "source": "Sociological Studies"
    },
    {
      "title": "Abolition of Caliphate",
      "desc": "In 1924, the newly formed Republic of Turkey officially abolished the Ottoman Caliphate, profoundly impacting global Islamic political thought.",
      "source": "Modern History"
    },
    {
      "title": "Anti-Colonial Struggles",
      "desc": "Figures like Omar al-Mukhtar in Libya and Emir Abdelkader in Algeria led fierce Islamic resistance movements against European colonization.",
      "source": "Colonial History"
    },
    {
      "title": "Islamic Resurgence",
      "desc": "The late 20th century saw a widespread Islamic revival (Sahwa), marked by a return to traditional dress, banking, and political activism.",
      "source": "Sociology of Religion"
    }
  ],
  "ancientprophets": [
    {
      "title": "Nuh (Noah) and Patience",
      "desc": "Prophet Nuh preached to his people for 950 years with immense patience despite constant mockery. The Quran highlights his unwavering endurance as an example for all believers.",
      "source": "Quran 29:14"
    },
    {
      "title": "Ibrahim (Abraham) the Friend of Allah",
      "desc": "Prophet Ibrahim is honored as 'Khalilullah' (Friend of Allah). He is the patriarch of monotheism, recognized for submitting to Allah\u2019s command to sacrifice his son.",
      "source": "Quran 4:125"
    },
    {
      "title": "Nuh's Ark",
      "desc": "Prophet Nuh preached for 950 years before God commanded him to build an ark, saving the believers and animal pairs from the Great Flood.",
      "source": "Quran 11:36-48"
    },
    {
      "title": "Ibrahim's Fire",
      "desc": "When thrown into a massive fire by King Nimrod for destroying idols, God commanded the fire to be 'cool and safe' for Prophet Ibrahim.",
      "source": "Quran 21:68-69"
    },
    {
      "title": "Musa and the Red Sea",
      "desc": "Pursued by Pharaoh's army, Prophet Musa struck the sea with his staff, parting the waters to save the Children of Israel.",
      "source": "Quran 26:63-66"
    }
  ],
  "purification": [
    {
      "title": "Conditions of Wudu",
      "desc": "Wudu requires intention (niyyah), washing the face, arms up to elbows, wiping the head, and washing the feet up to ankles. It removes minor spiritual impurities.",
      "source": "Fiqh of Taharah"
    },
    {
      "title": "Ghusl (Major Ablution)",
      "desc": "Ghusl is required after major impurity. Its pillars are the intention and ensuring water reaches every part of the body, including the roots of the hair.",
      "source": "Fiqh Manuals"
    },
    {
      "title": "Tayammum (Dry Ablution)",
      "desc": "When water is unavailable or harmful to use, one can strike clean earth/dust with their hands, wipe their face, and wipe their hands.",
      "source": "Fiqh of Taharah"
    },
    {
      "title": "Types of Water",
      "desc": "Water is classified as Mutlaq (pure and purifying), Musta'mal (used, pure but not purifying), and Mutanajjis (impure due to contact with filth).",
      "source": "Classical Fiqh"
    },
    {
      "title": "Ghusl (Ritual Bath)",
      "desc": "Required after major ritual impurity (Janabah). It involves intending purification, washing the entire body, and ensuring water reaches the roots of the hair.",
      "source": "Sunan Abu Dawud"
    }
  ],
  "salahrules": [
    {
      "title": "The Pillars (Arkan) of Salah",
      "desc": "If a pillar like the opening Takbir, standing, reciting Al-Fatiha, or bowing (Ruku) is missed, the rak'ah or prayer is invalid and must be repeated.",
      "source": "Fiqh of Salah"
    },
    {
      "title": "Sujud al-Sahw",
      "desc": "The prostration of forgetfulness is performed when one adds, omits, or is doubtful about certain obligatory acts (wajib) in the prayer.",
      "source": "Hadith & Fiqh"
    },
    {
      "title": "Istikhara Prayer",
      "desc": "A special prayer performed when seeking divine guidance for an important decision, asking Allah to choose what is best.",
      "source": "Hadith & Fiqh"
    },
    {
      "title": "Jama'ah (Congregation)",
      "desc": "Praying in congregation is highly emphasized, offering 27 times the reward of praying alone, fostering community equality.",
      "source": "Sahih Bukhari"
    },
    {
      "title": "Qada (Make-up Prayers)",
      "desc": "If a prayer is missed due to sleep or genuine forgetfulness, it must be made up (Qada) immediately upon remembering or waking.",
      "source": "Sahih Muslim"
    }
  ],
  "zakatrules": [
    {
      "title": "The Nisab",
      "desc": "Zakat is obligatory on wealth that reaches the Nisab (minimum threshold, equivalent to 85g of gold or 595g of silver) and is held for one lunar year (Hawl).",
      "source": "Fiqh of Zakat"
    },
    {
      "title": "The 8 Categories",
      "desc": "Zakat can only be given to 8 specific categories mentioned in Surah At-Tawbah (9:60), including the poor, the needy, those in debt, and travelers.",
      "source": "Quran 9:60"
    },
    {
      "title": "Nisab Threshold",
      "desc": "Zakat is calculated at 2.5% of wealth that has been held for one full lunar year (Hawl) above the Nisab threshold of 85g gold or 595g silver.",
      "source": "Fiqh of Zakat"
    },
    {
      "title": "Who Must Pay Zakat",
      "desc": "Zakat is obligatory on every sane, adult Muslim who possesses wealth above the Nisab threshold for one lunar year. It is one of the Five Pillars of Islam.",
      "source": "Quran 9:60"
    },
    {
      "title": "Zakat al-Fitr",
      "desc": "A specific, small obligatory charity given before the Eid al-Fitr prayer, usually in the form of staple food, purifying the fasting person.",
      "source": "Sunan Ibn Majah"
    }
  ],
  "sawmrules": [
    {
      "title": "Nullifiers of Fasting",
      "desc": "Fasting is invalidated by intentional eating, drinking, or marital relations from dawn to sunset. Forgetfully eating does not break the fast.",
      "source": "Fiqh of Sawm"
    },
    {
      "title": "Fidyah and Kaffarah",
      "desc": "Those chronically ill pay Fidyah (feeding a poor person per missed day). Deliberately breaking a fast without excuse requires Kaffarah (fasting 60 consecutive days).",
      "source": "Islamic Jurisprudence"
    },
    {
      "title": "Exemptions from Fasting",
      "desc": "Travelers, the sick, pregnant/nursing women, and the elderly are exempt from fasting. They must make it up later or pay Fidyah (feeding a poor person).",
      "source": "Quran 2:184"
    },
    {
      "title": "Nullifiers of the Fast",
      "desc": "Eating, drinking, or intimate relations intentionally between dawn and sunset break the fast. Unintentional eating out of forgetfulness does not.",
      "source": "Fiqh of Fasting"
    },
    {
      "title": "Taraweeh Prayer",
      "desc": "Taraweeh is a special voluntary prayer performed only during Ramadan after Isha. The Prophet (ﷺ) prayed 11 rakat at night, and Umar (RA) later established the practice of 20 rakat in congregation.",
      "source": "Sahih al-Bukhari 226"
    }
  ],
  "hajjrules": [
    {
      "title": "Meeqat and Ihram",
      "desc": "Pilgrims must enter the state of Ihram before crossing specific geographical boundaries (Meeqat). Men wear two unstitched white cloths, symbolizing equality.",
      "source": "Fiqh of Hajj"
    },
    {
      "title": "The Pillars of Hajj",
      "desc": "Hajj consists of four pillars: Ihram, standing at Arafat (the most critical), Tawaf al-Ifadah, and Sa'i between Safa and Marwah.",
      "source": "Fiqh Manuals"
    },
    {
      "title": "Ihram Restrictions",
      "desc": "While in the state of Ihram, pilgrims cannot cut hair/nails, wear perfume, hunt, or engage in marital relations until the rites are complete.",
      "source": "Fiqh of Hajj"
    },
    {
      "title": "Tawaf al-Ifadah",
      "desc": "The core, obligatory circumambulation of the Kaaba performed on the 10th of Dhul Hijjah after coming from Mina. Hajj is invalid without it.",
      "source": "Hajj Rituals"
    },
    {
      "title": "Sa'i between Safa and Marwa",
      "desc": "Walking seven times between the hills of Safa and Marwa honors the desperate search for water by Hajar, the wife of Prophet Ibrahim.",
      "source": "Historical Fiqh"
    }
  ],
  "trade": [
    {
      "title": "Prohibition of Riba",
      "desc": "Riba (usury/interest) is strictly prohibited in Islam. Money cannot generate money without risk; wealth must be generated through legitimate trade and asset-backed transactions.",
      "source": "Fiqh al-Mu'amalat"
    },
    {
      "title": "Gharar (Uncertainty)",
      "desc": "Contracts involving excessive uncertainty (Gharar) or deception are forbidden. Both the buyer and seller must have clear knowledge of the item, price, and terms.",
      "source": "Islamic Finance"
    },
    {
      "title": "Islamic Banking Principles",
      "desc": "Modern Islamic banking offers Sharia-compliant alternatives to conventional finance, including Murabaha (cost-plus financing), Ijara (leasing), and Musharakah (partnerships).",
      "source": "Islamic Finance"
    },
    {
      "title": "Fair Trade in Islam",
      "desc": "Islam emphasizes honesty, transparency, and fairness in all transactions. Cheating, fraud, and exploitation are strictly forbidden in commercial dealings.",
      "source": "Commercial Fiqh"
    },
    {
      "title": "Khiyar (Right of Option)",
      "desc": "Both the buyer and seller have the right to cancel the transaction before they physically separate from the place of the deal.",
      "source": "Sahih Muslim"
    }
  ],
  "marriagelaws": [
    {
      "title": "Pillars of the Nikah",
      "desc": "An Islamic marriage contract requires the offer (Ijab) and acceptance (Qabul), the presence of the bride's guardian (Wali), two Muslim witnesses, and a specified dowry (Mahr).",
      "source": "Fiqh of Marriage"
    },
    {
      "title": "The Mahr (Dowry)",
      "desc": "The Mahr is a mandatory gift from the groom to the bride at the time of marriage. It is her exclusive property to use as she pleases.",
      "source": "Quran 4:4"
    },
    {
      "title": "Ihsan in Marriage",
      "desc": "The Prophet ﷺ said: 'The best of you are those who are best to their wives.' Islam emphasizes kindness, respect, and emotional support in marriage.",
      "source": "Hadith & Fiqh"
    },
    {
      "title": "Wali (Guardian)",
      "desc": "In traditional Islamic jurisprudence, the consent and presence of the bride's guardian (Wali) is required for the marriage contract to be valid.",
      "source": "Family Fiqh"
    },
    {
      "title": "Khula (Wife-Initiated Divorce)",
      "desc": "A woman has the right to initiate a divorce (Khula) by returning her Mahr to the husband if she fears she cannot fulfill her marital duties.",
      "source": "Islamic Jurisprudence"
    }
  ],
  "inheritance": [
    {
      "title": "Divinely Ordained Shares",
      "desc": "Unlike general charity, Islamic inheritance laws (Mirath) dictate precise fractional shares for heirs (parents, spouses, children) to ensure fair wealth distribution.",
      "source": "Quran 4:11-12"
    },
    {
      "title": "The Wasiyyah (Will)",
      "desc": "A Muslim is permitted to bequeath up to one-third of their estate to non-heirs or charities; the remaining two-thirds must go to the rightful heirs.",
      "source": "Fiqh of Inheritance"
    },
    {
      "title": "Obligatory Shares (Fara'id)",
      "desc": "The Quran outlines fixed fractional shares (e.g., 1/2, 1/4, 1/8) for specific relatives, ensuring wealth is distributed, not hoarded by a single heir.",
      "source": "Quran 4:11-12"
    },
    {
      "title": "The 1/3 Will Limit",
      "desc": "A Muslim can only dictate a will (Wasiyyah) for up to 1/3 of their estate. The remaining 2/3 must be distributed according to the fixed Quranic shares.",
      "source": "Sahih Bukhari"
    },
    {
      "title": "No Inheritance for the Killer",
      "desc": "A fundamental rule: A person who murders their relative is entirely disinherited from that relative's estate to prevent foul play.",
      "source": "Sunan At-Tirmidhi"
    }
  ],
  "halaldiet": [
    {
      "title": "Criteria for Halal Meat",
      "desc": "The animal must be lawful to eat, slaughtered by a Muslim, Jew, or Christian, using a sharp blade to sever the jugular veins, while mentioning the name of Allah (Bismillah).",
      "source": "Dietary Fiqh"
    },
    {
      "title": "Prohibitions",
      "desc": "Islam strictly forbids the consumption of pork, flowing blood, carrion, and intoxicants (alcohol, drugs) in any quantity.",
      "source": "Quran 5:3"
    },
    {
      "title": "Zabiha Method",
      "desc": "Lawful meat must be slaughtered by a sane Muslim, Jew, or Christian, severing the jugular, windpipe, and esophagus with a sharp blade while invoking God's name.",
      "source": "Dietary Fiqh"
    },
    {
      "title": "Marine Animals",
      "desc": "According to the majority of scholars, all creatures that live entirely in the sea (fish, shrimp) are categorically Halal, regardless of how they die.",
      "source": "Quran 5:96"
    },
    {
      "title": "Prohibition of Intoxicants",
      "desc": "Khamr (intoxicants) are completely forbidden. The rule is: 'Whatever intoxicates in large quantities is forbidden in small quantities.'",
      "source": "Sunan Abu Dawud"
    }
  ],
  "oaths": [
    {
      "title": "Types of Oaths",
      "desc": "Oaths (Yameen) must only be sworn by Allah. A legally binding oath must be intentional. Swearing by anything other than Allah is considered minor shirk.",
      "source": "Hadith & Fiqh"
    },
    {
      "title": "Expiation (Kaffarah) for Broken Oaths",
      "desc": "Breaking a deliberate oath requires feeding 10 poor people, clothing them, or freeing a slave. If unable, one must fast for three days.",
      "source": "Quran 5:89"
    },
    {
      "title": "Swearing by Allah Alone",
      "desc": "It is strictly forbidden to swear an oath by anything other than Allah (e.g., swearing by one's mother or by the Prophet is impermissible).",
      "source": "Sahih Bukhari"
    },
    {
      "title": "Kaffarah for Broken Oaths",
      "desc": "Breaking a deliberate oath requires expiation: feeding/clothing ten poor people, or freeing a slave. If unable, one must fast for three days.",
      "source": "Quran 5:89"
    },
    {
      "title": "Conditional Oaths",
      "desc": "An oath conditioned on something that is not in one's control (e.g., 'If Allah wills, I will do X') is not considered a binding oath in Islamic law.",
      "source": "Fiqh of Oaths"
    }
  ],
  "sufism": [
    {
      "title": "Tasawwuf (Sufism)",
      "desc": "Classical Tasawwuf focuses on purifying the heart (Tazkiyah) and developing Ihsan (excellence in faith), recognizing that the soul must be cured of diseases like pride and envy.",
      "source": "Islamic Spirituality"
    },
    {
      "title": "The Tariqah",
      "desc": "A Tariqah is a path of spiritual discipline under the guidance of a learned shaykh, aiming to eliminate the ego and achieve continuous remembrance (Dhikr) of Allah.",
      "source": "Spiritual Sciences"
    },
    {
      "title": "Maqamat (Spiritual Stations)",
      "desc": "The Sufi path involves progressing through spiritual stations like Repentance, Patience, Gratitude, and ultimately, absolute Reliance on God.",
      "source": "Risala Qushayriyya"
    },
    {
      "title": "Dhikr Circles",
      "desc": "Sufi orders (Tariqas) often gather for communal Dhikr, rhythmically repeating the names of Allah to purify the heart and achieve spiritual presence.",
      "source": "Tassawuf"
    },
    {
      "title": "Fana (Annihilation)",
      "desc": "The spiritual state where the ego is entirely subdued, and the seeker is wholly absorbed in the awareness and love of the Divine.",
      "source": "Sufi Philosophy"
    }
  ],
  "tazkiyah": [
    {
      "title": "Purification of the Soul",
      "desc": "Tazkiyat al-Nafs involves identifying one's spiritual flaws\u2014such as arrogance, greed, and ostentation (Riya)\u2014and actively struggling against them to attain a sound heart (Qalb Saleem).",
      "source": "Quran 91:9"
    },
    {
      "title": "Al-Muhasabah",
      "desc": "Taking oneself to account daily (Muhasabah) is a core practice. Umar ibn al-Khattab said: 'Hold yourselves accountable before you are held accountable.'",
      "source": "Spiritual Principles"
    },
    {
      "title": "Mujahadat al-Nafs",
      "desc": "The inner struggle against the lower ego (Nafs). It involves disciplining desires through fasting, night prayer, and controlling the tongue.",
      "source": "Spiritual Discipline"
    },
    {
      "title": "Muhasabah (Self-Accountability)",
      "desc": "The practice of reviewing one's actions at the end of each day, repenting for sins, and resolving to improve tomorrow.",
      "source": "Ihya Ulum al-Din"
    },
    {
      "title": "Diseases of the Heart",
      "desc": "Tazkiyah focuses on curing spiritual diseases like Kibr (arrogance), Hasad (envy), and Riya (showing off) which destroy good deeds.",
      "source": "Purification of the Heart"
    }
  ],
  "asceticism": [
    {
      "title": "Zuhd (Asceticism)",
      "desc": "Zuhd is not about poverty, but detachment. It is having wealth in your hand but not in your heart, ensuring worldly matters do not distract from the Hereafter.",
      "source": "Sayings of the Salaf"
    },
    {
      "title": "The Prophet's Lifestyle",
      "desc": "The Prophet peace be upon him lived a simple life, sleeping on a mat of palm leaves that left marks on his side, choosing the life of a servant-prophet over a king-prophet.",
      "source": "Sahih Hadith"
    },
    {
      "title": "True Zuhd",
      "desc": "Zuhd is not abandoning the world or being poor; it is having the world in your hand, but not in your heart, being detached from material outcomes.",
      "source": "Imam Ahmad"
    },
    {
      "title": "The Example of Isa (Jesus)",
      "desc": "Prophet Isa is highly revered in Islamic spirituality as the ultimate ascetic (Zahid), known for his detachment, simplicity, and continuous travel.",
      "source": "Islamic Tradition"
    },
    {
      "title": "Minimalism",
      "desc": "The Prophet ﷺ slept on a rough mat that left marks on his side, choosing a life of simplicity over the luxury of kings.",
      "source": "Sahih Bukhari"
    }
  ],
  "fear": [
    {
      "title": "Khawf (Fear of Allah)",
      "desc": "True fear of Allah (Khawf) is not a paralyzing terror, but a reverential awe that actively prevents a person from committing sins and displeasing their Creator.",
      "source": "Islamic Theology"
    },
    {
      "title": "Tears of Reverence",
      "desc": "The Prophet peace be upon him said that a person who weeps out of the fear of Allah will not enter the Hellfire, just as milk does not return to the udder.",
      "source": "Sunan al-Tirmidhi"
    },
    {
      "title": "Khawf and Raja",
      "desc": "A believer must balance Khawf (Fear of God's justice) and Raja (Hope in God's mercy), like two wings of a bird required for straight flight.",
      "source": "Ibn al-Qayyim"
    },
    {
      "title": "Fear of a Bad Ending",
      "desc": "Spiritual masters constantly feared Su' al-Khatimah (a bad ending), praying that their final moments would be upon faith and righteousness.",
      "source": "Spiritual Reflections"
    },
    {
      "title": "Constructive Fear",
      "desc": "True fear of Allah doesn't cause despair; it actively prevents a person from committing sins and motivates them to rush towards good deeds.",
      "source": "Tafsir Ibn Kathir"
    }
  ],
  "hope": [
    {
      "title": "Raja' (Hope)",
      "desc": "Hope in Allah's mercy must be balanced with fear. A believer flies to Allah with two wings: the wing of fear (Khawf) and the wing of hope (Raja').",
      "source": "Ibn al-Qayyim"
    },
    {
      "title": "The Vastness of Mercy",
      "desc": "Allah says in a Hadith Qudsi: 'O son of Adam, so long as you call upon Me and ask of Me, I shall forgive you for what you have done, and I shall not mind.'",
      "source": "Sunan al-Tirmidhi"
    },
    {
      "title": "Husn al-Dhann",
      "desc": "Having a beautiful, positive opinion of Allah. The Hadith Qudsi states: 'I am as My servant expects Me to be.'",
      "source": "Sahih Bukhari"
    },
    {
      "title": "Divine Forgiveness",
      "desc": "Allah divided mercy into 100 parts, keeping 99 for the Day of Judgment and sending down just 1 part to Earth for all creation to share.",
      "source": "Sahih Muslim"
    },
    {
      "title": "Never Despair",
      "desc": "The Quran commands believers never to despair of God's mercy, for He forgives all sins for those who sincerely turn back to Him.",
      "source": "Quran 39:53"
    }
  ],
  "loveofallah": [
    {
      "title": "Mahabbah",
      "desc": "The pinnacle of spirituality is the Love of Allah. Everything else loved in this world should be loved for His sake. It is the fuel that makes worship a joy rather than a burden.",
      "source": "Spiritual Treatises"
    },
    {
      "title": "The Sweetness of Faith",
      "desc": "The Prophet peace be upon him said that whoever possesses three qualities will taste the sweetness of faith: that Allah and His Messenger are more beloved to him than anything else...",
      "source": "Sahih al-Bukhari"
    },
    {
      "title": "Love of the Prophet ﷺ",
      "desc": "The highest spiritual station goes beyond obeying out of duty; it is obeying out of intense love and longing for the Divine Messenger.",
      "source": "Madarij al-Salikin"
    },
    {
      "title": "Following the Prophet ﷺ",
      "desc": "The Quran links the love of God directly to following the Sunnah: 'Say: If you love Allah, follow me, and Allah will love you.'",
      "source": "Quran 3:31"
    },
    {
      "title": "Testing True Love",
      "desc": "True love is tested in adversity. A sincere lover of Allah accepts His decrees gracefully, recognizing the hidden wisdom in hardship.",
      "source": "Sufi Wisdom"
    }
  ],
  "tawakkul": [
    {
      "title": "Tying the Camel",
      "desc": "Tawakkul means relying entirely on Allah while actively taking necessary practical steps. The Prophet peace be upon him told a Bedouin: 'Tie your camel, and place your trust in Allah.'",
      "source": "Sunan al-Tirmidhi"
    },
    {
      "title": "Peace of Mind",
      "desc": "True Tawakkul brings immense psychological peace, as the believer knows that whatever missed them was never meant for them, and whatever hit them was never going to miss.",
      "source": "Aqeedah Principles"
    },
    {
      "title": "Tie Your Camel",
      "desc": "Tawakkul means relying on God internally while taking necessary physical actions externally. 'Tie your camel, and place your trust in Allah.'",
      "source": "Sunan At-Tirmidhi"
    },
    {
      "title": "Tawakkul in Daily Life",
      "desc": "A student studies for exams (takes means) while trusting Allah for results (places trust). Tawakkul is not laziness or abandoning effort — it is combining effort with reliance.",
      "source": "Islamic Principles"
    },
    {
      "title": "Divine Decree (Qadr)",
      "desc": "True Tawakkul eliminates anxiety about the future, knowing that whatever missed you was never meant for you, and whatever hit you could never miss.",
      "source": "Imam Ali"
    }
  ],
  "contentment": [
    {
      "title": "Rida (Contentment)",
      "desc": "Rida is being pleased with the decree of Allah, even when it involves hardship. It is the paradise of this world.",
      "source": "Spiritual Teachings"
    },
    {
      "title": "True Wealth",
      "desc": "The Prophet peace be upon him said: 'Wealth is not in having many possessions, but true wealth is the wealth of the soul (contentment).'",
      "source": "Sahih al-Bukhari"
    },
    {
      "title": "Rida bil Qada",
      "desc": "Contentment with Divine Decree. It is the ability to find peace even when life goes contrary to your desires, trusting God's perfect plan.",
      "source": "Spiritual Resilience"
    },
    {
      "title": "Gratitude for Blessings",
      "desc": "The Prophet ﷺ stated, 'True wealth is not in having many possessions, but true wealth is the contentment of the soul.'",
      "source": "Sahih Bukhari"
    },
    {
      "title": "Looking at the Less Fortunate",
      "desc": "To foster contentment, the Sunnah advises looking at those who have less wealth and health than you, rather than those who have more.",
      "source": "Sahih Muslim"
    }
  ],
  "reflection": [
    {
      "title": "Tafakkur",
      "desc": "Deep reflection upon the creation of the heavens and the earth, and upon one's own self, is considered one of the highest forms of worship in Islam.",
      "source": "Quran 3:191"
    },
    {
      "title": "Silence and Thought",
      "desc": "Hasan al-Basri said: 'An hour's reflection is better than a year's voluntary worship,' as it softens the heart and strengthens conviction.",
      "source": "Sayings of the Tabi'un"
    },
    {
      "title": "The Book of Nature",
      "desc": "Deep reflection upon the creation of the heavens and earth. An hour of genuine contemplation is considered better than a night of heedless worship.",
      "source": "Islamic Spirituality"
    },
    {
      "title": "The Signs (Ayat)",
      "desc": "The Quran frequently commands humans to reflect on nature (rain, mountains, the human body) as clear signs of a Wise, Powerful Creator.",
      "source": "Quranic Wisdom"
    },
    {
      "title": "Reflecting on Mortality",
      "desc": "Muraqabah (meditation) often involves remembering death to break the heart's attachment to the fleeting illusions of the material world.",
      "source": "Ihya Ulum al-Din"
    }
  ],
  "technology": [
    {
      "title": "Tools for Good",
      "desc": "Islam teaches that technology is neutral; its morality is determined by its use. Apps, AI, and software can be immense tools for Dawah, charity, and learning.",
      "source": "Modern Fiqh"
    },
    {
      "title": "Digital Fasting",
      "desc": "Constantly consuming digital content can cause 'Ghaflah' (heedlessness). Scholars recommend regular digital detoxes to reconnect with the physical world and Allah.",
      "source": "Contemporary Islamic Advice"
    },
    {
      "title": "Digital Fiqh",
      "desc": "Scholars constantly adapt jurisprudence for the digital age, addressing issues like cryptocurrency legality, digital privacy, and AI ethics.",
      "source": "Contemporary Fiqh"
    },
    {
      "title": "Algorithmic Bias",
      "desc": "Islamic ethics demands Adl (justice). Developing AI that encodes racial or gender bias fundamentally contradicts the Islamic mandate for fairness.",
      "source": "AI Ethics"
    },
    {
      "title": "Screen Time",
      "desc": "The concept of 'Hifz al-Waqt' (preservation of time). Islam views time as a trust; excessive mindless scrolling is seen as squandering a divine gift.",
      "source": "Modern Spirituality"
    }
  ],
  "socialmedia": [
    {
      "title": "The Evil Eye online",
      "desc": "Oversharing personal blessings on social media can invite the Evil Eye (Ayn) or destructive envy (Hasad). Discretion and modesty remain core Islamic values online.",
      "source": "Islamic Ethics"
    },
    {
      "title": "Guarding the Tongue/Keyboard",
      "desc": "Typing a slanderous comment is equivalent to speaking it. The Prophet peace be upon him warned that people will be thrown into Hellfire on their faces because of the harvest of their tongues.",
      "source": "Hadith Sciences"
    },
    {
      "title": "The Evil Eye (Ayn)",
      "desc": "Oversharing personal blessings online can attract the Evil Eye (jealousy). Islam encourages modesty and privacy regarding one's personal life.",
      "source": "Digital Adab"
    },
    {
      "title": "Verifying News (Tabayyun)",
      "desc": "The Quran strictly commands verifying information before sharing it, condemning the modern phenomena of fake news and impulsive retweeting.",
      "source": "Quran 49:6"
    },
    {
      "title": "Cyberbullying",
      "desc": "Mocking, calling others offensive names, and backbiting (Gheebah) are major sins that extend entirely into the digital realm.",
      "source": "Islamic Ethics"
    }
  ],
  "ethics": [
    {
      "title": "Integrity in a Complex World",
      "desc": "In an era of deepfakes and misinformation, the Islamic mandate to verify news (Tabayyun) before sharing it is more relevant than ever.",
      "source": "Quran 49:6"
    },
    {
      "title": "Ethical Consumerism",
      "desc": "Muslims are encouraged to look beyond the 'Halal' sticker and ensure their products are 'Tayyib' (pure, ethical)\u2014free from exploitative labor and environmental destruction.",
      "source": "Modern Fiqh"
    },
    {
      "title": "Amanah (Trust)",
      "desc": "Amanah encompasses everything entrusted to a person: their job, their health, the environment, and confidential secrets. Betraying it is hypocrisy.",
      "source": "Moral Philosophy"
    },
    {
      "title": "Ihsan (Excellence)",
      "desc": "Going beyond the bare minimum of duty. If Justice (Adl) is paying what you owe, Ihsan is giving extra out of kindness and perfection.",
      "source": "Hadith of Jibril"
    },
    {
      "title": "Keeping Promises",
      "desc": "Fulfilling covenants is a hallmark of a believer. Breaking agreements, even with non-Muslims or in warfare, is strictly forbidden.",
      "source": "Quranic Ethics"
    },
    {
      "title": "Divine Command Theory",
      "desc": "In Islamic ethics, ultimate moral truths are defined by God. What God commands is good, and what He forbids is evil, combining divine command with human intuition (Fitrah).",
      "source": "Theological Ethics"
    },
    {
      "title": "Maqasid al-Shariah",
      "desc": "The higher objectives of Islamic law are designed to protect five things: Religion, Life, Intellect, Lineage, and Property. Ethical rulings revolve around protecting these.",
      "source": "Usul al-Fiqh"
    }
  ],
  "bioethics": [
    {
      "title": "Sanctity of Life",
      "desc": "Islam highly values human life. Organ donation is widely permitted by modern scholars as an act of saving a life, governed by strict ethical guidelines.",
      "source": "International Islamic Fiqh Academy"
    },
    {
      "title": "Beginning of Life",
      "desc": "Issues like IVF are permissible provided the genetic material comes exclusively from the married couple, ensuring the preservation of lineage (Nasab).",
      "source": "Medical Fiqh"
    },
    {
      "title": "Organ Donation",
      "desc": "Many modern fatwa councils permit organ donation as a profound act of charity to save a life, provided it does not harm the donor fatally.",
      "source": "Medical Fiqh"
    },
    {
      "title": "Euthanasia",
      "desc": "Active euthanasia (assisted suicide) is strictly forbidden, as life is sacred and its end is determined by God. However, halting futile treatment is often permitted.",
      "source": "Islamic Bioethics"
    },
    {
      "title": "Cloning",
      "desc": "Human reproductive cloning is universally condemned by Islamic scholars as an interference with the sacred natural family structure and human dignity.",
      "source": "Fiqh Councils"
    }
  ],
  "modfinance": [
    {
      "title": "Islamic Banking",
      "desc": "Modern Islamic finance utilizes contracts like Murabaha (cost-plus financing) and Musharakah (joint venture) to bypass interest (Riba) and share risks equitably.",
      "source": "Islamic Economics"
    },
    {
      "title": "Cryptocurrencies",
      "desc": "Scholarly opinions on crypto vary. Some deem it permissible as a medium of exchange, while others warn of excessive Gharar (speculation and uncertainty).",
      "source": "Contemporary Fiqh Councils"
    },
    {
      "title": "Cryptocurrency",
      "desc": "Scholarly debate continues: some view crypto as too volatile (Gharar) to be money, while others argue it holds legitimate value as a digital asset.",
      "source": "Islamic Finance"
    },
    {
      "title": "Islamic Mortgages (Murabaha)",
      "desc": "Instead of an interest-bearing loan, a bank buys the house and sells it to the customer at a markup, paid in installments, avoiding Riba.",
      "source": "Modern Banking"
    },
    {
      "title": "Takaful (Islamic Insurance)",
      "desc": "A cooperative system where members pool money to guarantee each other against loss, avoiding the uncertainty and interest of commercial insurance.",
      "source": "Economic Fiqh"
    }
  ],
  "politics": [
    {
      "title": "Shura (Consultation)",
      "desc": "The Islamic political principle of Shura mandates that leaders must consult the people (or their representatives) when making decisions, rejecting absolute despotism.",
      "source": "Quran 42:38"
    },
    {
      "title": "Justice (Adl)",
      "desc": "Justice is the paramount political value in Islam. Ibn Taymiyyah wrote: 'Allah supports the just state even if it is not Muslim, and does not support the unjust state even if it is Muslim.'",
      "source": "Political Theory"
    },
    {
      "title": "Accountability of Leaders",
      "desc": "A core Islamic political principle. Leaders must consult with the people or experts before making decisions, rejecting absolute despotism.",
      "source": "Quran 42:38"
    },
    {
      "title": "Justice in Governance",
      "desc": "The primary requirement of Islamic governance is establishing justice, even against oneself, one's family, or the wealthy.",
      "source": "Quran 4:135"
    },
    {
      "title": "The Medina Charter",
      "desc": "Drafted by the Prophet ﷺ, it established a multi-religious state in Medina where Muslims and Jews had equal rights and mutual defense obligations.",
      "source": "Seerah"
    }
  ],
  "green": [
    {
      "title": "Eco-Islam",
      "desc": "Humans are 'Khulafa' (stewards) of the earth. The Prophet peace be upon him forbade wasting water even if one is washing at a flowing river, establishing early environmental ethics.",
      "source": "Sunan Ibn Majah"
    },
    {
      "title": "Animal Rights",
      "desc": "Factory farming that tortures animals violates the Islamic concept of Ihsan (kindness) in slaughter and animal rearing.",
      "source": "Contemporary Ethics"
    },
    {
      "title": "Khilafah (Stewardship)",
      "desc": "Humans are designated as Khalifahs (stewards) of the Earth, responsible for protecting its ecological balance, not exploiting it greedily.",
      "source": "Eco-Islam"
    },
    {
      "title": "Water Conservation",
      "desc": "The Prophet ﷺ commanded not to waste water even if washing by a flowing river, establishing a strict ethic of resource conservation.",
      "source": "Sunan Ibn Majah"
    },
    {
      "title": "Planting Trees",
      "desc": "Planting a tree is considered Sadaqah Jariyah (continuous charity) as long as any human or animal benefits from its shade or fruit.",
      "source": "Sahih Muslim"
    }
  ],
  "mentalhealth": [
    {
      "title": "Seeking Therapy",
      "desc": "The Prophet peace be upon him said, 'Allah has not sent down a disease except that He has also sent down a cure.' Seeking medical and psychological therapy is highly encouraged in Islam.",
      "source": "Sahih al-Bukhari"
    },
    {
      "title": "Faith and Anxiety",
      "desc": "While faith and Dhikr bring peace to the heart, clinical depression is a medical condition. Equating mental illness merely with 'low Iman' is un-Islamic and harmful.",
      "source": "Islamic Psychology"
    },
    {
      "title": "Ruqyah and Medicine",
      "desc": "Islam encourages seeking medical treatment for psychiatric issues while also utilizing Ruqyah (Quranic recitation) for spiritual healing—the two are complementary.",
      "source": "Prophetic Medicine"
    },
    {
      "title": "Grief is Normal",
      "desc": "When his son Ibrahim died, the Prophet ﷺ wept. He stated the eyes shed tears and the heart grieves, showing that sorrow does not negate faith.",
      "source": "Sahih Bukhari"
    },
    {
      "title": "Al-Balkhi's Psychology",
      "desc": "The 9th-century polymath Abu Zayd al-Balkhi was a pioneer in psychotherapy, differentiating between neuroses and psychoses, and linking mental to physical health.",
      "source": "History of Psychology"
    }
  ],
  "youth": [
    {
      "title": "Special Status of the Young",
      "desc": "Among the seven groups shaded by Allah on the Day of Judgment is 'a youth who grew up in the worship of Allah.' Their struggles against modern temptations carry massive rewards.",
      "source": "Sahih al-Bukhari"
    },
    {
      "title": "Navigating Identity",
      "desc": "Modern Muslim youth often balance multiple cultural identities. Islam teaches that cultural practices are welcomed as long as they do not contradict Islamic principles (Urf).",
      "source": "Sociological Context"
    },
    {
      "title": "The 7 Under the Shade",
      "desc": "On the Day of Judgment, one of the seven groups sheltered under God's shade will be 'a youth who grew up in the worship of Allah.'",
      "source": "Sahih Bukhari"
    },
    {
      "title": "Companionship",
      "desc": "The Prophet ﷺ emphasized that a person follows the religion of their friends. Surrounding oneself with righteous youth is critical for spiritual survival.",
      "source": "Sunan At-Tirmidhi"
    },
    {
      "title": "Questioning and Faith",
      "desc": "Modern Islamic youth work encourages creating safe spaces for youth to ask difficult theological questions (Shubuhat) rather than suppressing doubt.",
      "source": "Youth Tarbiyah"
    }
  ],
  "education": [
    {
      "title": "Lifelong Learning",
      "desc": "Seeking knowledge is mandatory. Modern education (STEM, humanities) is considered a collective obligation (Fard Kifayah) to strengthen and benefit the Ummah.",
      "source": "Islamic Epistemology"
    },
    {
      "title": "Critical Thinking",
      "desc": "Islam encourages reasoning and questions. Blind following (Taqlid) without understanding is criticized in the Quran; intellectual curiosity is a spiritual pursuit.",
      "source": "Quranic Principles"
    },
    {
      "title": "Tarbiyah vs Ta'leem",
      "desc": "Ta'leem is mere knowledge transfer, while Tarbiyah is character development and moral nurturing. True Islamic education requires both.",
      "source": "Educational Philosophy"
    },
    {
      "title": "Women in Scholarship",
      "desc": "Aisha bint Abu Bakr was one of the foremost scholars of early Islam, issuing fatwas and teaching hundreds of male and female students.",
      "source": "Islamic History"
    },
    {
      "title": "Holistic Learning",
      "desc": "Classical Madrasas did not separate 'secular' and 'religious' sciences; mathematics, astronomy, and Fiqh were all studied together to understand God's universe.",
      "source": "History of Education"
    }
  ],
  "mecca": [
    {
      "title": "Umm al-Qura",
      "desc": "Makkah is the holiest city in Islam, home to the Kaaba. It is a sanctuary where bloodshed, hunting, and cutting of trees are strictly forbidden.",
      "source": "Islamic Geography"
    },
    {
      "title": "The Qibla",
      "desc": "Over 1.9 billion Muslims face the Kaaba in Makkah at least five times a day, creating an invisible, unifying geometric grid across the globe.",
      "source": "Facts"
    },
    {
      "title": "The Haram Boundary",
      "desc": "The sanctuary around Mecca where hunting, cutting trees, and carrying weapons are strictly forbidden to ensure absolute peace.",
      "source": "Sacred Geography"
    },
    {
      "title": "Zamzam Well",
      "desc": "The miraculously generated water source that sprang up for Hajar and baby Ismail, sustaining millions of pilgrims to this day.",
      "source": "History of Mecca"
    },
    {
      "title": "Conquest of Mecca",
      "desc": "In 630 CE, the Prophet ﷺ entered Mecca peacefully with 10,000 companions, forgave his former persecutors, and cleansed the Kaaba of idols.",
      "source": "Seerah"
    }
  ],
  "medina": [
    {
      "title": "City of the Prophet",
      "desc": "Al-Madinah al-Munawwarah (The Radiant City) provided refuge to the early Muslims. It houses Al-Masjid an-Nabawi and the Prophet's resting place.",
      "source": "Islamic History"
    },
    {
      "title": "A City of Peace",
      "desc": "The Prophet declared Medina a sanctuary (Haram), making it a place of ultimate peace and spiritual tranquility for all who enter it.",
      "source": "Sahih Muslim"
    },
    {
      "title": "Al-Masjid an-Nabawi",
      "desc": "The Prophet's Mosque. The Prophet ﷺ said that one prayer here is better than a thousand prayers anywhere else, except the Sacred Mosque in Mecca.",
      "source": "Sahih Bukhari"
    },
    {
      "title": "Mount Uhud",
      "desc": "A mountain near Medina where a major battle took place. The Prophet ﷺ said, 'Uhud is a mountain that loves us, and we love it.'",
      "source": "Seerah"
    },
    {
      "title": "Rawdah",
      "desc": "The area between the Prophet's tomb and his pulpit is called a 'garden from the gardens of Paradise' (Rawdah), a highly sought place for prayer.",
      "source": "Sacred Spaces"
    }
  ],
  "jerusalem": [
    {
      "title": "Al-Quds",
      "desc": "Jerusalem was the first Qibla for Muslims and the site of the Prophet's Night Journey (Isra and Mi'raj) to the heavens from Al-Aqsa Mosque.",
      "source": "Quran 17:1"
    },
    {
      "title": "The Blessed Precincts",
      "desc": "Al-Aqsa is the third holiest site in Islam. One prayer there is multiplied significantly in reward compared to a regular mosque.",
      "source": "Hadith Sciences"
    },
  ],
  "damascus": [
    {
      "title": "Umayyad Capital",
      "desc": "Damascus is one of the oldest continuously inhabited cities. It served as the capital of the Umayyad Caliphate and is home to the magnificent Umayyad Mosque.",
      "source": "Historical Geography"
    },
    {
      "title": "Isa's Descent",
      "desc": "According to Islamic eschatology, Prophet Isa (Jesus) will descend near the white minaret in the eastern part of Damascus during the end times.",
      "source": "Sahih Muslim"
    },
  ],
  "baghdad": [
    {
      "title": "The Round City",
      "desc": "Founded by Caliph al-Mansur in 762 CE, Baghdad was designed as a perfect circle. It became the global center for trade, culture, and science.",
      "source": "Abbasid History"
    },
    {
      "title": "House of Wisdom",
      "desc": "Baghdad housed the Bayt al-Hikmah, where scholars of various faiths translated Greek, Persian, and Indian texts into Arabic, preserving world heritage.",
      "source": "History of Science"
    },
  ],
  "cairo": [
    {
      "title": "City of a Thousand Minarets",
      "desc": "Cairo is famous for its stunning Islamic architecture spanning the Fatimid, Ayyubid, Mamluk, and Ottoman eras. It is the heart of Islamic scholarship in Africa.",
      "source": "Architectural History"
    },
    {
      "title": "Al-Azhar",
      "desc": "For over a millennium, Al-Azhar in Cairo has been the foremost center for Sunni Islamic learning, shaping religious discourse across the Muslim world.",
      "source": "Educational History"
    },
  ],
  "cordoba": [
    {
      "title": "Capital of Al-Andalus",
      "desc": "Cordoba was the intellectual capital of Muslim Spain. At its height, its library contained 400,000 volumes, while European kings had barely a few dozen.",
      "source": "Andalusian History"
    },
    {
      "title": "The Great Mosque",
      "desc": "The Mezquita of Cordoba, with its mesmerizing double arches of red and white, remains a masterpiece of Moorish architecture.",
      "source": "Art History"
    },
  ],
  "istanbul": [
    {
      "title": "The Bridge of Continents",
      "desc": "Straddling Europe and Asia, Istanbul (formerly Constantinople) served as the glorious capital of the Ottoman Empire for nearly five centuries.",
      "source": "Ottoman History"
    },
    {
      "title": "Architectural Marvels",
      "desc": "It is home to the Hagia Sophia and the Blue Mosque, defining a unique silhouette of cascading domes and pencil-like minarets.",
      "source": "Geography & Tourism"
    },
  ],
  "bukhara": [
    {
      "title": "Dome of Islam in the East",
      "desc": "Located in modern-day Uzbekistan, Bukhara was a major hub on the Silk Road and a massive center for Islamic theology and science.",
      "source": "Central Asian History"
    },
    {
      "title": "Imam al-Bukhari",
      "desc": "It is the birthplace of Imam Muhammad al-Bukhari, the compiler of Sahih al-Bukhari, the most authentic book of Hadith in Sunni Islam.",
      "source": "Biographical History"
    },
  ],
  "samarkand": [
    {
      "title": "Jewel of the Silk Road",
      "desc": "Known for its breathtaking blue-tiled architecture and the Registan square, Samarkand was a global center of commerce and scholarship.",
      "source": "Timurid History"
    },
    {
      "title": "The Observatory",
      "desc": "In the 15th century, Ulugh Beg built one of the greatest observatories in Samarkand, making astronomical calculations that remained the most accurate for centuries.",
      "source": "History of Astronomy"
    },
  ],
  "calligraphy": [
    {
      "title": "The Geometry of the Spirit",
      "desc": "Because Islam discourages depicting animate beings in religious contexts, Arabic calligraphy became the highest visual art form, turning the Word of God into visual beauty.",
      "source": "Islamic Art"
    },
    {
      "title": "Scripts",
      "desc": "Masters developed various scripts like Kufic (angular and ancient), Naskh (cursive and readable), and Thuluth (elegant and complex).",
      "source": "Art History"
    },
  ],
  "architecture": [
    {
      "title": "Symmetry and Light",
      "desc": "Islamic architecture utilizes light, water, and geometry to create spaces of tranquility. The courtyard and fountain are central, mirroring the Paradise descriptions.",
      "source": "Architectural Theory"
    },
    {
      "title": "Muqarnas",
      "desc": "A unique architectural feature is the Muqarnas\u2014honeycomb or stalactite vaulting used in domes and portals to create a smooth transition between straight walls and curved ceilings.",
      "source": "Islamic Architecture"
    },
  ],
  "geometry": [
    {
      "title": "Infinite Patterns",
      "desc": "Islamic geometric patterns use stars and polygons that can extend infinitely, symbolizing the infinite nature of Allah (Tawhid).",
      "source": "Mathematics in Art"
    },
    {
      "title": "Tessellation",
      "desc": "Artisans created complex tessellations using compasses and straightedges centuries before modern mathematical theory described them.",
      "source": "History of Geometry"
    },
  ],
  "poetryart": [
    {
      "title": "The Art of the Spoken Word",
      "desc": "Before Islam, poetry was the primary art of the Arabs. The Quran's linguistic miracle elevated the Arabic language to unprecedented literary heights.",
      "source": "Literary History"
    },
    {
      "title": "Spiritual Poetry",
      "desc": "Poets like Rumi, Al-Mutanabbi, and Hafez used profound metaphors of love, wine, and nature to describe the soul's longing for the Divine.",
      "source": "Persian & Arabic Literature"
    },
  ],
  "literature": [
    {
      "title": "Adab",
      "desc": "Islamic literature (Adab) encompasses not just fiction, but works of etiquette, travelogues (like Ibn Battuta), and philosophical allegories.",
      "source": "Literary Sciences"
    },
    {
      "title": "The First Novel",
      "desc": "Ibn Tufail's 'Hayy ibn Yaqdhan' is considered one of the first philosophical novels, detailing a self-taught feral child discovering God through reason.",
      "source": "History of Literature"
    },
  ],
  "nasheeds": [
    {
      "title": "Vocal Devotion",
      "desc": "Nasheeds are Islamic vocal music, historically sung without instruments (or with only a daff drum), focusing on praising Allah and the Prophet.",
      "source": "Cultural Heritage"
    },
    {
      "title": "Tala' al-Badru",
      "desc": "The most famous early nasheed is 'Tala' al-Badru 'Alayna', sung by the Ansar of Medina to welcome the Prophet after the Hijrah.",
      "source": "Historical Traditions"
    },
  ],
  "illumination": [
    {
      "title": "Tazhib",
      "desc": "The art of illumination involves decorating Quranic manuscripts with gold leaf and vibrant colors, especially the opening pages and chapter headings.",
      "source": "Manuscript Arts"
    },
    {
      "title": "Respect for the Text",
      "desc": "Illumination was not merely decorative; it was an act of worship, ensuring the physical vessel of the Quran reflected its majestic spiritual value.",
      "source": "Islamic Calligraphy"
    },
  ],
  "textiles": [
    {
      "title": "The Kiswah",
      "desc": "The most famous Islamic textile is the Kiswah, the black silk and gold-embroidered cloth that drapes the Kaaba, replaced annually during Hajj.",
      "source": "Makkah History"
    },
    {
      "title": "Carpets and Rugs",
      "desc": "Islamic prayer rugs often feature a 'mihrab' design indicating the direction of prayer, combining utilitarian function with exquisite craftsmanship.",
      "source": "Textile Arts"
    },
  ],
  "ceramics": [
    {
      "title": "Lusterware",
      "desc": "Muslim potters in Iraq invented lusterware in the 9th century, applying metallic glazes to ceramics to give them a glowing, gold-like sheen without using solid gold.",
      "source": "Ceramic History"
    },
    {
      "title": "Iznik Tiles",
      "desc": "The Ottoman era popularized Iznik tiles, featuring vibrant cobalt blues and tomato reds with intricate floral (tulip and carnation) motifs.",
      "source": "Ottoman Arts"
    },
  ],
  "woodwork": [
    {
      "title": "Intricate Carving",
      "desc": "Islamic woodwork features deep geometric and arabesque carvings. The Minbar (pulpit) in mosques is often a masterpiece of interlocking wooden pieces.",
      "source": "Islamic Art"
    },
    {
      "title": "Mashrabiya",
      "desc": "The Mashrabiya is an architectural element of wooden lattice screens on windows. It provides shade, passive cooling, and privacy while allowing airflow.",
      "source": "Traditional Architecture"
    },
  ],
  "abuhanifa": [
    {
      "title": "Imam Abu Hanifa (d. 767 CE)",
      "desc": "The founder of the Hanafi school of jurisprudence. Known as 'Al-Imam Al-A'zam' (The Great Imam), he pioneered the use of reason and analogical deduction (Qiyas) in Fiqh.",
      "source": "Biographical History"
    },
    {
      "title": "Refusal of Power",
      "desc": "He was imprisoned and beaten because he refused the Caliph's appointment to become the Chief Judge, refusing to compromise his independent rulings.",
      "source": "Historical Records"
    },
  ],
  "malik": [
    {
      "title": "Imam Malik (d. 795 CE)",
      "desc": "The founder of the Maliki school. He lived his entire life in Medina, compiling the 'Muwatta', one of the earliest collections of Hadith and Fiqh.",
      "source": "Biographies of Scholars"
    },
    {
      "title": "Reverence for Medina",
      "desc": "He had such profound respect for the Prophet that he refused to ride a horse in Medina, saying he would not strike the earth where the Prophet was buried with hooves.",
      "source": "Historical Anecdotes"
    },
  ],
  "shafii": [
    {
      "title": "Imam Al-Shafi'i (d. 820 CE)",
      "desc": "The founder of the Shafi'i school and the architect of Islamic jurisprudence (Usul al-Fiqh). His book 'Al-Risala' laid down the systematic principles of legal deduction.",
      "source": "Legal History"
    },
    {
      "title": "Poet and Scholar",
      "desc": "He was an orphan raised in poverty. He was not only a master jurist but also an elite Arabic poet, known for his eloquent verses on wisdom and seeking knowledge.",
      "source": "Diwan Al-Shafi'i"
    },
  ],
  "ahmad": [
    {
      "title": "Imam Ahmad ibn Hanbal (d. 855 CE)",
      "desc": "The founder of the Hanbali school and a master of Hadith, compiling the massive 'Musnad' containing over 27,000 hadiths.",
      "source": "Biographical History"
    },
    {
      "title": "The Mihna (Inquisition)",
      "desc": "He endured years of torture and imprisonment for refusing to agree with the Mu'tazilite doctrine promoted by the state, becoming a symbol of unwavering orthodox faith.",
      "source": "Islamic History"
    },
  ],
  "alghazali": [
    {
      "title": "Abu Hamid Al-Ghazali (d. 1111 CE)",
      "desc": "Known as 'Hujjat al-Islam' (The Proof of Islam). He brilliantly synthesized Fiqh, theology, and Sufism in his magnum opus, 'The Revival of the Religious Sciences'.",
      "source": "Intellectual History"
    },
    {
      "title": "Defeating Philosophy",
      "desc": "His book 'The Incoherence of the Philosophers' challenged Greek metaphysical concepts, securing the dominance of orthodox Islamic theology over Hellenistic philosophy.",
      "source": "History of Philosophy"
    },
  ],
  "ibntaymiyyah": [
    {
      "title": "Ibn Taymiyyah (d. 1328 CE)",
      "desc": "A brilliant and controversial polymath. He fiercely defended orthodox Islam against Mongol invasions, extreme Sufism, and philosophical deviations.",
      "source": "Historical Biography"
    },
    {
      "title": "Prolific in Prison",
      "desc": "He spent much of his life imprisoned for his uncompromising views. Even in prison, he wrote massive volumes of fatwas and theology using whatever scraps he could find.",
      "source": "Intellectual History"
    },
  ],
  "ibnkhaldun": [
    {
      "title": "Ibn Khaldun (d. 1406 CE)",
      "desc": "Often recognized as the founding father of sociology, historiography, and demography. His famous 'Muqaddimah' analyzed the rise and fall of civilizations.",
      "source": "History of Social Sciences"
    },
    {
      "title": "Concept of Asabiyyah",
      "desc": "He introduced 'Asabiyyah' (social cohesion/tribalism) as the fundamental driving force of political power and dynastic cycles.",
      "source": "The Muqaddimah"
    },
  ],
  "ibnrushd": [
    {
      "title": "Ibn Rushd (Averroes) (d. 1198 CE)",
      "desc": "An Andalusian polymath and the most important Islamic commentator on Aristotle. His works heavily influenced the European Renaissance.",
      "source": "History of Philosophy"
    },
    {
      "title": "Harmony of Religion and Philosophy",
      "desc": "He wrote 'The Decisive Treatise', arguing that true philosophy and true religion cannot contradict each other, as truth does not contradict truth.",
      "source": "Philosophical Treatises"
    },
  ],
  "ibnsina": [
    {
      "title": "Ibn Sina (Avicenna) (d. 1037 CE)",
      "desc": "A Persian polymath who was one of the most significant physicians, astronomers, and thinkers of the Islamic Golden Age.",
      "source": "History of Medicine"
    },
    {
      "title": "The Canon of Medicine",
      "desc": "His medical encyclopedia, 'Al-Qanun fi al-Tibb', remained the standard medical textbook in European universities for nearly 600 years.",
      "source": "Medical History"
    },
  ],
  "alkhwarizmi": [
    {
      "title": "Al-Khwarizmi (d. 850 CE)",
      "desc": "The 'Father of Algebra'. A mathematician working in the House of Wisdom in Baghdad. The words 'Algebra' and 'Algorithm' are derived from his book and his name.",
      "source": "History of Mathematics"
    },
    {
      "title": "Hindu-Arabic Numerals",
      "desc": "He was instrumental in introducing the decimal positional number system (including the concept of zero) to the Islamic world and Europe.",
      "source": "Mathematical History"
    },
  ],
  "arabicgrammar": [
    {
      "title": "Nahw (Syntax)",
      "desc": "Arabic grammar (Nahw) ensures words are put together correctly and have the proper endings (I'rab) depending on their role in the sentence, which is critical for understanding the Quran.",
      "source": "Linguistic Sciences"
    },
    {
      "title": "The Father of Grammar",
      "desc": "Abu al-Aswad al-Du'ali is credited with founding Arabic grammar at the behest of Ali ibn Abi Talib, to preserve the language as non-Arabs entered Islam.",
      "source": "Historical Linguistics"
    },
  ],
  "vocab": [
    {
      "title": "The Root System",
      "desc": "Arabic vocabulary is based on a triconsonantal root system. The root K-T-B relates to writing: Kataba (he wrote), Kitab (book), Maktab (office/desk), Katib (writer).",
      "source": "Linguistic Morphology"
    },
    {
      "title": "Unmatched Richness",
      "desc": "Classical Arabic is incredibly precise. There are dozens of words for 'love', 'lion', or 'camel', each denoting a highly specific state, age, or characteristic.",
      "source": "Arabic Lexicography"
    },
  ],
  "rhetoric": [
    {
      "title": "Balaghah (Rhetoric)",
      "desc": "Balaghah is the art of speaking eloquently and appropriately for the situation. It explores metaphors, similes, and the profound conciseness (I'jaz) of the Quran.",
      "source": "Linguistic Sciences"
    },
    {
      "title": "The Linguistic Miracle",
      "desc": "The primary miracle of the Prophet is the Quran. Its rhetorical perfection left the master poets of 7th-century Arabia entirely speechless and unable to replicate it.",
      "source": "Theology & Linguistics"
    },
  ],
  "morphology": [
    {
      "title": "Sarf (Morphology)",
      "desc": "Sarf is the science of word derivation. It teaches how to take a root word and put it into different patterns (Awzan) to change its meaning (e.g., active participle, passive, time, place).",
      "source": "Arabic Linguistics"
    },
    {
      "title": "Mathematical Precision",
      "desc": "The patterns of Arabic morphology operate almost like mathematical formulas, making it highly logical and structured for learners.",
      "source": "Language Studies"
    },
  ],
  "pronunciation": [
    {
      "title": "Tajweed",
      "desc": "Tajweed is the science of pronouncing Quranic letters from their correct articulation points (Makharij) with their specific characteristics, preserving the oral tradition of recitation.",
      "source": "Quranic Sciences"
    },
    {
      "title": "Melody and Rhythm",
      "desc": "While Tajweed governs pronunciation, reading with a beautiful voice is heavily encouraged. The Prophet said: 'Beautify the Quran with your voices.'",
      "source": "Sunan Abu Dawood"
    },
  ],
  "poetry": [
    {
      "title": "The Register of the Arabs",
      "desc": "Poetry was the historical archive of the Arabs. Hassan ibn Thabit was the official poet of the Prophet, defending Islam through the power of verse.",
      "source": "Literary History"
    },
    {
      "title": "The Mu'allaqat",
      "desc": "The 'Hanging Poems' were seven pre-Islamic masterpieces considered so brilliant they were hung on the walls of the Kaaba, setting the linguistic standard.",
      "source": "Arabic Literature"
    },
  ],
  "proverbs": [
    {
      "title": "Amthal (Proverbs)",
      "desc": "Arabic proverbs pack massive wisdom into few words. E.g., 'A day for you, and a day against you' (Life has ups and downs).",
      "source": "Cultural Heritage"
    },
    {
      "title": "Quranic Proverbs",
      "desc": "The Quran frequently uses parables and proverbs to explain deep truths, such as comparing a good word to a good tree with firm roots and branches in the sky.",
      "source": "Quran 14:24"
    },
  ],
  "etymology": [
    {
      "title": "Ishtiqaq (Derivation)",
      "desc": "Understanding where words come from reveals hidden theological depths. E.g., 'Insan' (human) shares a root with 'Nisyan' (forgetfulness) and 'Uns' (companionship).",
      "source": "Linguistic Analysis"
    },
    {
      "title": "Loanwords in English",
      "desc": "Centuries of Islamic science left a massive mark on English. Words like Algebra, Algorithm, Alchemy, Coffee, Cotton, and Sugar all derive from Arabic.",
      "source": "Etymological Dictionaries"
    },
  ],
  "dialects": [
    {
      "title": "Fusha vs. Amiyya",
      "desc": "Fusha (Modern Standard/Classical Arabic) is the written lingua franca. Amiyya refers to the diverse spoken dialects (Egyptian, Levantine, Maghrebi) which vary greatly.",
      "source": "Sociolinguistics"
    },
    {
      "title": "The Unity of the Text",
      "desc": "Despite wild differences in spoken dialects across 22 Arab countries, Classical Arabic ensures a Moroccan and an Iraqi can read the exact same book or newspaper.",
      "source": "Linguistic Studies"
    },
  ],
  "scripts": [
    {
      "title": "Evolution of Writing",
      "desc": "Early Quranic scripts (Hijazi, Kufic) lacked dots and vowel marks. As non-Arabs entered Islam, scholars added dots (I'jam) and vowels (Tashkeel) to prevent misreading.",
      "source": "History of Scripts"
    },
    {
      "title": "The Six Pens",
      "desc": "Ibn Muqla codified the 'Six Pens' (Al-Aqlam Al-Sittah)\u2014the six standard cursive scripts in Arabic calligraphy, bringing mathematical proportion to the written word.",
      "source": "Art History"
    },
  ],
  "brotherhood": [
    {
      "title": "The Bonds of Faith",
      "desc": "The Quran declares, 'The believers are but brothers.' (49:10). The Prophet likened the Ummah to a single body: if one part hurts, the whole body feels the fever.",
      "source": "Sahih Muslim"
    },
    {
      "title": "Rights of a Muslim",
      "desc": "A Muslim has six basic rights over another: returning salam, accepting invitations, giving sincere advice, replying to sneezes, visiting them when sick, and attending their funeral.",
      "source": "Sahih Muslim"
    },
  ],
  "sisterhood": [
    {
      "title": "Women Supporting Women",
      "desc": "Sisterhood in Islam offers a vital spiritual and social support network. The female companions (Sahabiyat) studied, worked, and supported each other fiercely.",
      "source": "Historical Accounts"
    },
    {
      "title": "Equal in Reward",
      "desc": "The Quran emphasizes that believing men and believing women are allies of one another, enjoining good and forbidding evil, and receiving equal spiritual reward.",
      "source": "Quran 9:71"
    },
  ],
  "orphans2": [
    {
      "title": "The Ultimate Guarantee",
      "desc": "The Prophet raised his index and middle fingers together and said: 'I and the sponsor of an orphan will be in Paradise like this.'",
      "source": "Sahih al-Bukhari"
    },
    {
      "title": "Protecting their Wealth",
      "desc": "The Quran gives terrifying warnings against those who unjustly consume the property of orphans, describing it as swallowing fire into their bellies.",
      "source": "Quran 4:10"
    },
  ],
  "elderly": [
    {
      "title": "Reverence for Age",
      "desc": "The Prophet said: 'He is not one of us who does not show mercy to our young ones and respect our elders.' Gray hair in Islam is considered a light of honor.",
      "source": "Sunan al-Tirmidhi"
    },
    {
      "title": "Caring for Parents",
      "desc": "As parents reach old age, the Quran commands children not to say even 'Uff' (a word of slight irritation) to them, but to speak with utmost nobility.",
      "source": "Quran 17:23"
    },
  ],
  "disabled": [
    {
      "title": "The Blind Companion",
      "desc": "Allah revealed verses (Surah Abasa) mildly reprimanding the Prophet for turning away from a blind man (Ibn Umm Maktum), establishing the dignity and inclusion of the disabled.",
      "source": "Quran 80:1-10"
    },
    {
      "title": "Spiritual Perfection",
      "desc": "Physical limitations do not limit spiritual rank. Many great scholars of Islam, including Hadith narrators and jurists, were blind or had physical disabilities.",
      "source": "Biographical History"
    },
  ],
  "antiracism": [
    {
      "title": "The Final Sermon",
      "desc": "In his farewell sermon, the Prophet declared: 'An Arab has no superiority over a non-Arab, nor a white person over a black person, except by piety and good action.'",
      "source": "Musnad Ahmad"
    },
    {
      "title": "Bilal ibn Rabah",
      "desc": "A formerly enslaved Black African, Bilal was chosen by the Prophet to be the first Mu'adhdhin (caller to prayer), elevating him above the elite nobles of Quraysh.",
      "source": "Seerah"
    },
  ],
  "poverty": [
    {
      "title": "Systemic Solutions",
      "desc": "Islam tackles poverty not just through charity, but systematically via Zakat (wealth tax), prohibiting Riba (usury), and anti-hoarding laws to ensure wealth circulates.",
      "source": "Islamic Economics"
    },
    {
      "title": "Dignity of the Poor",
      "desc": "The poor have a 'right' in the wealth of the rich, not just a favor. Giving charity is fulfilling an obligation, and the recipient must be treated with dignity, without reminders of the favor.",
      "source": "Quran 2:264"
    },
  ],
  "volunteering": [
    {
      "title": "Khidmah (Service)",
      "desc": "Serving people is a direct path to Allah. The Prophet said: 'The most beloved of people to Allah are those who are most beneficial to people.'",
      "source": "Al-Mu'jam Al-Awsat"
    },
    {
      "title": "Removing Harm",
      "desc": "Even the smallest act of volunteering counts. Moving a branch or a harmful object from the road is considered a branch of faith.",
      "source": "Sahih Muslim"
    },
  ],
  "epistemology": [
    {
      "title": "Sources of Knowledge",
      "desc": "Islamic epistemology recognizes three main sources of knowledge: true narrative (Revelation/Wahy), sound intellect (Aql), and the physical senses (Empiricism).",
      "source": "Islamic Theology"
    },
    {
      "title": "Certainty (Yaqeen)",
      "desc": "Knowledge is categorized into stages: knowledge by inference (Ilm al-Yaqeen), knowledge by direct observation (Ayn al-Yaqeen), and knowledge by direct experience (Haqq al-Yaqeen).",
      "source": "Quran 102:5-7"
    },
  ],
  "ontology": [
    {
      "title": "Wujud (Existence)",
      "desc": "Islamic ontology fundamentally divides existence into the Necessary Being (Allah, who exists independently) and contingent beings (the universe, which relies entirely on Allah to exist).",
      "source": "Kalam & Falsafa"
    },
    {
      "title": "The Unseen (Al-Ghayb)",
      "desc": "Reality consists of both the physical world (Alam al-Shahadah) and the unseen world (Alam al-Ghayb). Belief in the unseen (Angels, Heaven) is a prerequisite of faith.",
      "source": "Quran 2:3"
    },
  ],
  "logic": [
    {
      "title": "Mantiq (Logic)",
      "desc": "Muslim scholars refined Aristotelian logic (Mantiq) and made it a core curriculum in Madrasas, using it to structure legal arguments and defend theological positions.",
      "source": "Intellectual History"
    },
    {
      "title": "The Syllogism",
      "desc": "Scholars like Al-Ghazali Islamicized Greek logic, arguing that correct logical reasoning is religiously neutral and a necessary tool for the mind to extract truth.",
      "source": "History of Ideas"
    },
  ],
  "kalam": [
    {
      "title": "Ilm al-Kalam",
      "desc": "Kalam is Islamic scholastic theology, developing rational proofs for Islamic beliefs (like the existence of God and the creation of the universe) to debate against skeptics.",
      "source": "Theology"
    },
    {
      "title": "The Cosmological Argument",
      "desc": "The Kalam Cosmological Argument posits: Whatever begins to exist has a cause; the universe began to exist; therefore, the universe has a cause (the Creator).",
      "source": "Theological Arguments"
    },
  ],
  "reason": [
    {
      "title": "Aql (The Intellect)",
      "desc": "The Quran constantly appeals to human reason, asking 'Do you not think?' and 'Do you not reflect?' Reason is seen as a flashlight; revelation is the sun.",
      "source": "Quranic Discourse"
    },
    {
      "title": "Limits of Reason",
      "desc": "While highly elevated, reason is not absolute. Scholars argue that reason has limits and cannot comprehend the full nature of God or the specifics of the afterlife without Revelation.",
      "source": "Islamic Philosophy"
    },
  ],
  "freewill": [
    {
      "title": "Qadar and Choice",
      "desc": "Islam teaches a balance: Allah is the Creator of all things and possesses ultimate knowledge/decree (Qadar), yet humans possess free will (Iradah) and are responsible for their choices.",
      "source": "Aqeedah Studies"
    },
    {
      "title": "Kasb (Acquisition)",
      "desc": "The Ash'ari school conceptualized 'Kasb'\u2014Allah creates the action, but the human 'acquires' the action through their intention, thereby bearing moral responsibility.",
      "source": "Kalam"
    },
  ],
  "problemofevil": [
    {
      "title": "The Purpose of Hardship",
      "desc": "In Islam, this world is a testing ground, not paradise. Evil and suffering exist to test patience, facilitate spiritual growth, and expose true character.",
      "source": "Quran 67:2"
    },
    {
      "title": "The Wisdom of God",
      "desc": "Because God's knowledge is infinite and human knowledge is limited, humans cannot always comprehend the ultimate wisdom behind tragic events (e.g., the story of Musa and Khidr).",
      "source": "Quran 18:60-82"
    },
  ],
  "prophethood": [
    {
      "title": "Nubuwwah",
      "desc": "Prophethood is rationally necessary in Islamic thought; a Merciful Creator would not create humans with a purpose without sending guides to explain that purpose.",
      "source": "Theological Treatises"
    },
    {
      "title": "Infallibility (Ismah)",
      "desc": "Prophets are infallible regarding the transmission of revelation and are protected from major sins, making them perfect moral exemplars for humanity.",
      "source": "Islamic Theology"
    },
  ],
  "existence": [
    {
      "title": "Tawhid al-Rububiyyah",
      "desc": "The Oneness of Lordship. Believing that Allah alone is the Creator, Sustainer, and Master of everything that exists. The universe is entirely dependent on Him.",
      "source": "Aqeedah"
    },
    {
      "title": "Fitrah",
      "desc": "The primordial, innate human nature. Islam posits that every human is born with a natural inclination to recognize their Creator, which gets clouded by society and desires.",
      "source": "Sahih Muslim"
    },
  ]
};

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
    document.querySelectorAll('.t1-btn').forEach(el => el.classList.remove('active'));
    if (btn) btn.classList.add('active');
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
      container.innerHTML = group.map((p, i) => `<button class="t2-btn ${i===0?'active':''}" onclick="App.activateTab('${p.id}', this)"><span>${iqIcon(p.icon || p.id)}</span> ${p.label}</button>`).join('');
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
    grid.innerHTML = cat.tabs.map((p, i) => `<button class="t2-btn ${i===0?'active':''}" onclick="App.activateTab('${p.id}', this)"><span>${iqIcon(p.icon || p.id)}</span> ${p.label}</button>`).join('');
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
      tech:'renderTech', neighbors:'renderNeighbors', salah:'renderSalah',
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
      timer:'renderPrayerTimes'
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
    const content = document.getElementById('tabContent');
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
    { id: 'progress', icon: 'bar-chart-3', label: 'Progress' },
    { id: 'stats', icon: 'trending-up', label: 'Analytics' },
    { id: 'rewards', icon: 'gift', label: 'Rewards' }
  ];

    const t = today();
    if (S.lad !== t) { S.lad=t; if(S.ab&&S.ab.exp<t) S.ab=null; recalc(); saveState(); }
    genDQ(); genWQ(); genMQ(); genYQ(); genLQ(); refreshContent(); recalc(); checkQ(); S.lv=lvFrom(S.xp); saveState(); initCalView(); renderAll();
    try {
      const activeBtn = document.querySelector('.t1-btn.active');
      const activeCat = activeBtn ? activeBtn.getAttribute('data-cat') : 'ibadah';
      switchCategory(activeCat, activeBtn);
    } catch(e) { console.warn('Initial nav render failed:', e); }
  }

  function init() {
    try { resolveCurrentUser(); } catch(e) { console.error('Step 0 resolve user failed:', e); }
    try { S = loadState(); } catch(e) { console.error('Step 1 loadState failed:', e); }
    try { applyTheme(); } catch(e) { console.error('Step 2 applyTheme failed:', e); }
    try { initApp(); } catch(e) { console.error('Step 3 initApp failed:', e); }
    try {
      document.addEventListener('click', (e) => {
        const sr = document.getElementById('globalSearchResults');
        if (sr && !e.target.closest('.global-search-wrap')) sr.classList.remove('show');
      });
    } catch(e) { console.error('Step 6 clickOutside failed:', e); }
    window.App = {
      toggleP, toggleV, toggleD, buy,
      detail: (id) => toast(iqIcon('alert-triangle'), DETAILS[id]||'Voluntary Prayer', false, 4000),
      tip: (id) => toast(iqIcon('zap'), TIPS[id]||'A beautiful deed!', false, 4000),
      toggleQuest, addGratitude, toggleFasting, setCharityGoals,
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
      globalSearch, executeSearch,
      calPrevMonth, calNextMonth, calGoToday, selectAvatar, toggleAvatarPicker,
      setTheme, toggleTheme,
      switchTab
    };
    window.checkA = checkA;
    window.playSound = playSound;
    window.levelUpToast = levelUpToast;
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
