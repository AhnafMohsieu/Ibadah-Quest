(function() {
  // Pull all content renderers from window into local scope so renderStatic() and
  // renderToday() can call them as bare names without window. prefix.
  const { renderSunnahs, renderDhikr, renderDhikrCounter, renderStories, renderNames, renderInspirations, renderGratitude, renderFasting, renderCharity, renderMemorization, renderMorning, renderEvening, renderSins, renderPunishments, renderRepentance, renderSahaba, renderSeerah, renderTafsir, renderManners, renderFamily, renderHealth, renderUmmah, renderHajj, renderAkhirah, renderProphets, renderWomen, renderHeart, renderMarriage, renderScience, renderWudu, renderScholars, renderPatience, renderWork, renderCommunity, renderEnvironment, renderTravel, renderFiqh, renderArabic, renderTawakkul, renderIkhlas, renderZuhd, renderDawah, renderAqeedah, renderKnowledge, renderCivilisation, renderJumuah, renderBattles, renderJannah, renderJahannam, renderGrave, renderSigns, renderDreams, renderParenting, renderFood, renderTibb, renderYouth, renderTech, renderNeighbors, renderArabicgrammar, renderVocab, renderRhetoric, renderMorphology, renderPronunciation, renderPoetry, renderProverbs, renderEtymology, renderDialects, renderScripts, renderBrotherhood, renderSisterhood, renderOrphans2, renderElderly, renderDisabled, renderAntiracism, renderPoverty, renderVolunteering, renderEpistemology, renderOntology, renderLogic, renderKalam, renderReason, renderFreewill, renderProblemofevil, renderProphethood, renderExistence, renderUmayyads, renderAbbasids, renderAndalus, renderOttomans, renderMamluks, renderSeljuks, renderFatimids, renderAyyubids, renderModernhist, renderAncientprophets, renderMecca, renderMedina, renderJerusalem, renderDamascus, renderBaghdad, renderCairo, renderCordoba, renderIstanbul, renderBukhara, renderSamarkand, renderCalligraphy, renderArchitecture, renderGeometry, renderPoetryart, renderLiterature, renderNasheeds, renderIllumination, renderTextiles, renderCeramics, renderWoodwork, renderPrayers, renderVol, renderDeeds, renderTimer, renderPrayerTimes } = window;
  // Lucide removed — no-op stub
  function refreshLucideIcons() {}

  // -------------------------------------------------------
  // DIRTY FLAGS — selective panel re-rendering
  // -------------------------------------------------------
  const dirtyPanels = new Set();
  function markDirty(panel) { dirtyPanels.add(panel); }
  function clearDirty() { dirtyPanels.clear(); }

  // Panel name → render function mapping
  const PANEL_RENDERERS = {
    topbar: renderTopBar,
    lv: renderLv,
    str: renderStr,
    today: renderToday,
    quests: renderQ,
    achievements: renderAch,
    progress: renderProg,
    shop: renderShop,
    profile: renderProfile,
    stats: renderStats,
    timer: renderTimer,
    prayertimes: renderPrayerTimes,
    garden: () => window.renderGarden && window.renderGarden(),
    lantern: () => window.renderLantern && window.renderLantern(),
    muhasabah: () => window.renderMuhasabahEntry && window.renderMuhasabahEntry(),
    journeys: () => window.renderJourneys && window.renderJourneys(),
    boat: () => window.renderBoat && window.renderBoat(),
    keys: () => window.renderKeys && window.renderKeys(),
    mosque: () => window.renderMosque && window.renderMosque(),
    achievementshowcase: () => window.renderAchievementShowcase && window.renderAchievementShowcase(),
    ramadan: () => window.renderRamadan && window.renderRamadan(),
    laylat: () => window.renderLaylat && window.renderLaylat(),
    heartrefinement: () => window.renderHeartRefinement && window.renderHeartRefinement(),
    armor: () => window.renderArmor && window.renderArmor(),
    growthtab: () => window.renderSpiritualGrowthTab && window.renderSpiritualGrowthTab(),
    combos: () => window.renderCombos && window.renderCombos(),
    autotrack: () => window.autoTrackJourneyProgress && window.autoTrackJourneyProgress(),
  };

  // -------------------------------------------------------
  // DYNAMIC CONTENT RENDERING
  // -------------------------------------------------------

  function renderDynamic() {
    if (dirtyPanels.size === 0) return;

    const pageScroll = window.scrollY;
    const volArea = document.getElementById('volArea');
    const deedArea = document.getElementById('deedArea');
    const questArea = document.getElementById('questArea');
    
    const volScroll = volArea ? volArea.scrollTop : 0;
    const deedScroll = deedArea ? deedArea.scrollTop : 0;
    const questScroll = questArea ? questArea.scrollTop : 0;

    const safe = (fn, name) => { try { fn(); } catch(e) { console.warn('Render ' + name + ' failed:', e.message); } };
    for (const panel of dirtyPanels) {
      const fn = PANEL_RENDERERS[panel];
      if (fn) safe(fn, panel);
    }
    clearDirty();

    if (volArea) volArea.scrollTop = volScroll;
    if (deedArea) deedArea.scrollTop = deedScroll;
    if (questArea) questArea.scrollTop = questScroll;
    window.scrollTo(0, pageScroll);
    refreshLucideIcons();
  }

  function renderStatic() {
    const safe = (fn, name) => { try { fn(); } catch(e) { console.warn('Static ' + name + ' failed:', e.message); } };
    safe(renderQuran,'Quran'); safe(renderSunnahs,'Sunnahs'); safe(renderDhikr,'Dhikr'); safe(renderDhikrCounter,'DhikrCounter'); safe(renderStories,'Stories'); safe(renderHadith,'Hadith'); safe(renderNames,'Names'); safe(renderInspirations,'Inspirations'); safe(renderGratitude,'Gratitude'); safe(renderFasting,'Fasting'); safe(renderCharity,'Charity'); safe(renderMemorization,'Memorization'); safe(renderMorning,'Morning'); safe(renderEvening,'Evening'); safe(renderSituationalDhikr,'SituationalDhikr'); safe(renderSins,'Sins'); safe(renderPunishments,'Punishments'); safe(renderRepentance,'Repentance'); safe(renderSahaba,'Sahaba'); safe(renderSeerah,'Seerah'); safe(renderTafsir,'Tafsir'); safe(renderManners,'Manners'); safe(renderFamily,'Family'); safe(renderHealth,'Health'); safe(() => window.renderHealthLog && window.renderHealthLog(), 'HealthLog'); safe(renderFinance,'Finance'); safe(() => window.renderFinanceTab && window.renderFinanceTab(), 'FinanceTab'); safe(renderUmmah,'Ummah'); safe(renderHajj,'Hajj'); safe(renderAkhirah,'Akhirah'); safe(renderProphets,'Prophets'); safe(renderWomen,'Women'); safe(renderHeart,'Heart'); safe(renderMarriage,'Marriage'); safe(renderScience,'Science'); safe(renderWudu,'Wudu'); safe(renderScholars,'Scholars'); safe(renderPatience,'Patience'); safe(renderWork,'Work'); safe(renderCommunity,'Community'); safe(renderEnvironment,'Environment'); safe(renderTravel,'Travel'); safe(renderFiqh,'Fiqh'); safe(renderArabic,'Arabic'); safe(renderTawakkul,'Tawakkul'); safe(renderIkhlas,'Ikhlas'); safe(renderZuhd,'Zuhd'); safe(renderDawah,'Dawah'); safe(renderAqeedah,'Aqeedah'); safe(renderKnowledge,'Knowledge'); safe(renderCivilisation,'Civilisation'); safe(renderJumuah,'Jumuah'); safe(renderBattles,'Battles'); safe(renderJannah,'Jannah'); safe(renderJahannam,'Jahannam'); safe(renderGrave,'Grave'); safe(renderSigns,'Signs'); safe(renderDreams,'Dreams'); safe(renderParenting,'Parenting'); safe(renderFood,'Food'); safe(renderTibb,'Tibb'); safe(renderYouth,'Youth'); safe(renderTech,'Tech'); safe(renderNeighbors,'Neighbors'); safe(renderSalah,'Salah'); safe(() => window.renderPersonalGoals && window.renderPersonalGoals(), 'PersonalGoals');
    if (typeof NEW_POOLS !== 'undefined') Object.keys(NEW_POOLS).forEach(k => {
      if(window['render'+k]) safe(window['render'+k], k);
    });
    refreshLucideIcons();
  }

function renderAll() {
  document.body.classList.remove('loading');
  for (const panel of Object.keys(PANEL_RENDERERS)) dirtyPanels.add(panel);
  renderDynamic();
  renderStatic();
}
  function renderToday() { const s=(fn,n)=>{try{fn();}catch(e){console.warn('Today render '+n+' failed:',e.message);}}; s(renderBonus,'bonus'); s(renderPrayers,'prayers'); s(renderVol,'vol'); s(renderDeeds,'deeds'); }

  function renderLv() {
    const cres = document.getElementById('headerCrescent');
    if (cres) cres.innerHTML = iqIcon('moon');
    const decoL = document.getElementById('decoLeft');
    if (decoL) decoL.innerHTML = iqIcon('star');
    const decoR = document.getElementById('decoRight');
    if (decoR) decoR.innerHTML = iqIcon('star');
    const lv = document.getElementById('lvNum');
    const title = document.getElementById('lvTitle');
    const bar = document.getElementById('xpBar');
    const label = document.getElementById('xpLabel');
    if (!lv || !title || !bar || !label) return;
    const xp = S.xp || 0;
    const cur = xpFor(S.lv), nxt = xpFor(S.lv + 1);
    const prog = xp - cur, need = (nxt - cur) || 1;
    lv.textContent = S.lv;
    title.textContent = lvTitle(S.lv);
    bar.style.width = Math.min(100, (prog / need) * 100) + '%';
    label.textContent = prog + ' / ' + need + ' XP';
  }
  function renderStr() {
    const fire = document.getElementById('streakFire');
    if (fire) fire.innerHTML = iqIcon('flame');
    const days = document.getElementById('strDays');
    const best = document.getElementById('bestStr');
    const msg = document.getElementById('strMsg');
    if (!days || !best || !msg) return;
    days.textContent = (S.cs || 0) + ' Day Streak';
    best.textContent = S.bs || 0;
    msg.textContent = (STREAK_MSGS.find(x => (S.cs || 0) >= x.m) || { t: 'Legendary!' }).t;
  }
  function renderBonus() { const el = document.getElementById('bonusArea'); if (el) el.innerHTML=S.lbd===today()?'':'<div class="daily-bonus" onclick="App.claimBonus()">Tap to claim your Daily Bonus!</div>'; }

  // ── Quests ──
  function renderQ() {
    const questArea = document.getElementById('questArea');
    const openStates = questArea ? Array.from(questArea.querySelectorAll('details.cat-details')).map(d => d.open) : [true, false, false, false, false];
    
    const renderQuestGroup = (title, quests, type, isOpen) => {
      if (!quests || quests.length===0) return '';
      const total = quests.length;
      const completed = quests.filter(q => q.done).length;
      const openAttr = isOpen ? ' open' : '';
      
      let html = `<details class="cat-details"${openAttr}><summary><div style="display:flex;justify-content:space-between;align-items:center;flex:1;"><span>${title}</span><span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--accent-light);font-weight:700;">${completed} / ${total}</span></div></summary><div style="padding:0 12px 12px;display:flex;flex-direction:column;gap:8px;margin-top:8px;">`;
      html += quests.map(q => {
        const d = q.done;
        let icon = iqIcon('target');
        const t = q.d.toLowerCase();
        if (t.includes('pray') || t.includes('prayer')) icon = iqIcon('mosque');
        if (t.includes('quran')) icon = iqIcon('book-open');
        if (t.includes('charity')) icon = iqIcon('hand-heart');
        if (t.includes('fast')) icon = iqIcon('moon');
        if (t.includes('deed')) icon = iqIcon('star');
        if (t.includes('streak') || t.includes('day')) icon = iqIcon('flame');
        if (t.includes('dhikr') || t.includes('adhkar') || t.includes('istighfar')) icon = iqIcon('hand-heart');
        if (t.includes('memorize')) icon = iqIcon('brain');
        
        return `<div class="vol-card${d?' done':''}" tabindex="0" role="button" onclick="App.toggleQuest('${q.id}','${type}',${q.xp})" style="cursor:pointer;">
          <div class="prayer-check">${d?iqIcon('check'):icon}</div>
          <div class="prayer-info"><div class="prayer-name">${q.d}</div></div>
          <div class="prayer-xp">+${q.xp} XP</div>
        </div>`;
      }).join('');
      return html + '</div></details>';
    };

    let h = renderQuestGroup(iqIcon('clipboard') + ' Daily Quests', S.dq, 'daily', openStates[0]);
    h += renderQuestGroup(iqIcon('calendar') + ' Weekly Quests', S.wq, 'weekly', openStates[1]);
    h += renderQuestGroup(iqIcon('calendar-days') + ' Monthly Quests', S.mq, 'monthly', openStates[2]);
    h += renderQuestGroup(iqIcon('calendar-check') + ' Yearly Quests', S.yq, 'yearly', openStates[3]);
    h += renderQuestGroup(iqIcon('star') + ' Lifetime Quests', S.lq, 'lifetime', openStates[4]);
    h += `<div style="text-align:center;margin-top:20px;color:var(--text2);">Total quests completed: <strong style="color:var(--accent)">${S.tq||0}</strong></div>`;
    
    if(questArea) questArea.innerHTML = h;
  }

  // ── Achievements ──
  function renderAch() {
  const cnt = Object.keys(S.ua).length;
  const total = ACHS.length;
  const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
  const unlockedAchs = ACHS.filter(a => !!S.ua[a.id]);

  let h = '<div class="ach-header">';
  h += `<div class="section-title">${iqIcon('trophy')} Trophy Cabinet</div>`;
  h += `<div class="ach-progress"><span class="ach-progress-bar" style="width:${pct}%"></span></div>`;
  h += `<div class="ach-progress-text">${cnt} / ${total} Unlocked</div>`;
  h += '</div>';

  h += '<div class="ach-grid">';
  h += ACHS.map(a => {
    const u = !!S.ua[a.id];
    const tierStars = a.tier === 'jannah' ? iqIcon('star').repeat(10) : a.tier === 'mythic' ? iqIcon('gem').repeat(6) : a.tier === 'legendary' ? iqIcon('award').repeat(3) : a.tier === 'diamond' || a.tier === 'platinum' ? iqIcon('gem').repeat(2) : iqIcon('star');
    const tierIcon = a.tier === 'jannah' ? iqIcon('kaaba') : a.tier === 'mythic' ? iqIcon('crown') : a.tier === 'legendary' ? iqIcon('award') : a.tier === 'diamond' ? iqIcon('gem') : a.tier === 'platinum' ? iqIcon('gem') : a.tier === 'gold' ? iqIcon('trophy') : a.tier === 'silver' ? iqIcon('medal') : iqIcon('star');
    return `<div class="ach-card${u ? ' unlocked' : ' locked'} tier-${a.tier}">
      <div class="ach-tier">${tierStars}</div>
      <div class="ach-icon">${u ? (iqIcon(a.icon || a.id || a.name) || tierIcon) : iqIcon('lock')}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
    </div>`;
  }).join('');
  h += '</div>';

  if (cnt === 0) {
    h += '<div class="ach-empty">No trophies yet. Start completing deeds to earn your first!</div>';
  }

  document.getElementById('achArea').innerHTML = h;
}

  // ── Progress / Calendar ──
  function renderProg() {
    const now = new Date();
    const tk = today();
    const calY = window.calViewYear, calM = window.calViewMonth;
    const dim = new Date(calY, calM + 1, 0).getDate();
    const fd = new Date(calY, calM, 1).getDay();
    const gMonthName = now.toLocaleString('en', { month: 'long' });
    const isCurrentMonth = calY === now.getFullYear() && calM === now.getMonth();

    let cal = '<div class="cal-header">';
    cal += '<div class="cal-nav"><button onclick="App.calPrevMonth()">◀</button></div>';
    cal += '<div class="cal-header-info">';
    cal += `<h3>${gMonthName} ${window.calViewYear}</h3>`;
    cal += `<div class="cal-hijri-title">${HIJRI_MONTHS_AR[window.calViewHijriM - 1]} ${window.calViewHijriY} AH</div>`;
    cal += '</div>';
    cal += '<div class="cal-nav"><button onclick="App.calNextMonth()">▶</button>';
    if (!isCurrentMonth) cal += ' <button class="cal-today-btn" onclick="App.calGoToday()">Today</button>';
    cal += '</div></div>';

    cal += '<div class="cal-grid">';
    for (let i = 0; i < 7; i++) {
      cal += `<div class="cal-weekday">${WEEKDAYS_EN[i]}<br><span class="cal-weekday ar">${WEEKDAYS_AR[i]}</span><br><span class="cal-weekday rom">${WEEKDAYS_ROM[i]}</span></div>`;
    }

    for (let i = 0; i < fd; i++) cal += '<div class="cal-day empty"></div>';

    for (let d = 1; d <= dim; d++) {
      const dk = today(new Date(window.calViewYear, window.calViewMonth, d));
      const log = S.log[dk];
      const cnt = log ? Object.values(log.p || {}).filter(v => v).length : 0;
      let cls = cnt >= 5 ? 'good' : (cnt > 0 ? 'ok' : (dk < tk ? 'bad' : ''));
      if (dk === tk) cls += ' now';

      const h = gregorianToHijri(calViewYear, calViewMonth + 1, d);
      const hDay = h.day;

      cal += `<div class="cal-day ${cls}"><span class="g-date">${d}</span><span class="h-date">${hDay}</span></div>`;
    }
    cal += '</div>';

    cal += '<div class="cal-legend">';
    cal += '<div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(22,163,74,0.5);"></div>5 prayers</div>';
    cal += '<div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(245,158,11,0.5);"></div>Some prayers</div>';
    cal += '<div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(239,68,68,0.5);"></div>Missed</div>';
    cal += '<div class="cal-legend-item"><div class="cal-legend-dot" style="background:var(--accent-bg);"></div>Today</div>';
    cal += '</div>';

    document.getElementById('calArea').innerHTML = cal;
    document.getElementById('statArea').innerHTML = '';
  }

  // ── Shop ──
  function renderShop() {
    let h = '<div class="section-title">' + iqIcon('gift') + ' Rewards Shop</div>';

    h += `<div class="reward-xp-banner">${iqIcon('star')} <strong>${S.xp}</strong> XP Available</div>`;

    h += '<div class="reward-grid">';
    h += SHOP.map(r => {
      const owned = !!S.ur[r.id];
      const canAfford = S.xp >= r.cost;
      const cls = owned ? 'owned' : (canAfford ? '' : 'disabled');
      return `<div class="reward-card ${cls}" onclick="${owned ? '' : 'App.buy(\'' + r.id + '\')'}">
        <span class="reward-icon">${iqIcon(r.icon || r.id || r.name)}</span>
        <div class="reward-info">
          <div class="reward-name">${r.name}</div>
          <div class="reward-desc">${r.desc || ''}</div>
        </div>
        <div class="reward-badge">${owned ? iqIcon('check') + ' Owned' : iqIcon('star') + ' ' + r.cost + ' XP'}</div>
      </div>`;
    }).join('');
    h += '</div>';

    document.getElementById('shopArea').innerHTML = h;
  }

  // ── Profile ──
  function getFrameStyle(frameId) {
    const frames = {
      'r10': 'border: 3px solid #FFD700; border-radius: 50%;',
      'r19': 'border: 3px solid #E5E4E2; border-radius: 50%;',
      'r20': 'border: 3px solid #B9F2FF; border-radius: 50%;'
    };
    return frames[frameId] || '';
  }
  function renderProfile() {
    const achCnt = Object.keys(S.ua).length;
    const avatar = String(S.avatar || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const joinDate = S.joinDate ? new Date(S.joinDate).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : null;

    let h = '<div class="section-title">Profile</div>';

    h += `<div class="profile-identity">
      <div class="profile-avatar-wrap" onclick="App.toggleAvatarPicker()">
        <span class="profile-avatar" style="${S.activeFrame ? getFrameStyle(S.activeFrame) : ''}">${avatar}</span>
      </div>
      <div class="profile-info">
        <h2 class="profile-name">${currentUser === 'default' ? 'Guest' : currentUser.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</h2>
        <div class="profile-level">Level ${S.lv} · ${lvTitle(S.lv)}</div>
        ${S.activeTitle ? (() => { const t = (typeof SHOP !== 'undefined' ? SHOP : []).find(x => x.id === S.activeTitle); return t ? `<div class="profile-title" style="color:var(--accent);font-weight:600;margin-top:2px;">${t.name.replace('Title: ','')}</div>` : ''; })() : ''}
        ${joinDate ? `<div class="profile-join">Member since ${joinDate}</div>` : ''}
      </div>
    </div>`;

    h += '<div class="profile-stats">';
    h += `<div class="stat-card"><div class="stat-num">${S.xp}</div><div class="stat-label">Total XP</div></div>`;
    h += `<div class="stat-card"><div class="stat-num">${S.tp}</div><div class="stat-label">Prayers</div></div>`;
    h += `<div class="stat-card"><div class="stat-num">${S.cs}</div><div class="stat-label">Streak</div></div>`;
    h += `<div class="stat-card"><div class="stat-icon">${iqIcon('trophy')}</div><div class="stat-num">${achCnt}</div><div class="stat-label">Achievements</div></div>`;
    h += '</div>';

    h += '<div class="profile-section"><h3>Achievement Showcase</h3><div id="achievementShowcase"></div></div>';

    h += '<div class="section-title">' + iqIcon('settings') + ' Settings</div>';
    h += '<div class="profile-settings">';
    const curTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const themeChips = (window.Themes || []).map(m => `
      <button class="theme-chip${m.key === curTheme ? ' active' : ''}" data-key="${m.key}" role="switch" aria-checked="${m.key === curTheme}" onclick="App.setTheme('${m.key}')">
        <span class="theme-swatch" style="background:linear-gradient(135deg,${m.swatch.bg},${m.swatch.accent});"></span>
        <span class="name">${m.label}</span>
      </button>`).join('');
h += '<div style="margin-bottom:10px;font-weight:700;color:var(--accent-dark);">' + iqIcon('palette') + ' Theme</div>';
h += '<div class="theme-picker">' + themeChips + '</div>';
h += '<div style="margin-bottom:10px;font-weight:700;color:var(--accent-dark);">' + iqIcon('bell') + ' Notifications</div>';
h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">';
h += '<button class="shop-card" onclick="App.toggleNotifications()" style="padding:10px 14px;border-radius:var(--radius-sm);font-weight:700;">' + (S.notificationsEnabled ? iqIcon('bell-off') + ' Disable' : iqIcon('bell') + ' Enable') + '</button>';
h += '</div>';
    h += '<div style="display:flex;gap:8px;margin-bottom:10px;"><input class="profile-input" id="usernameInput" placeholder="Switch user" style="margin-bottom:0;"><button class="shop-card" onclick="App.switchUser()" style="padding:10px 14px;border-radius:var(--radius-sm);">' + iqIcon('refresh-cw') + '</button></div>';
    h += '<button class="shop-card" style="width:100%;justify-content:center;margin-bottom:10px;font-weight:700;font-size:1rem;color:var(--accent);letter-spacing:0.5px;" onclick="App.logout()">' + iqIcon('log-out') + ' Logout</button>';
    h += '</div>';

    h += '<div class="danger-zone"><h3 style="color:var(--red)">' + iqIcon('alert-triangle') + ' Danger Zone</h3><p style="font-size:0.8rem;color:var(--text2);margin-bottom:10px;">Reset permanently deletes all your progress.</p><button class="danger-btn" onclick="App.resetAll()">' + iqIcon('trash') + ' Reset All Data</button></div>';

    document.getElementById('profileArea').innerHTML = h;
  }

  // ── Stats ──
  function renderStats() {
    // Render stat cards at top of Analytics
    const stats = [
      { icon: iqIcon('mosque'), value: S.tp, label: 'Prayers' },
      { icon: iqIcon('calendar'), value: S.pd, label: 'Perfect Days' },
      { icon: iqIcon('flame'), value: S.bs, label: 'Best Streak' },
      { icon: iqIcon('star'), value: S.lv, label: 'Level' },
      { icon: iqIcon('clipboard'), value: S.tq || 0, label: 'Quests Done' },
      { icon: iqIcon('medal'), value: Object.values(S.td).reduce((a, b) => a + b, 0), label: 'Extra Deeds' }
    ];

    const statsArea = document.getElementById('statsArea');
    if (!statsArea) return;

    statsArea.innerHTML = `<div class="prog-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px;">
      ${stats.map(s => `<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-num">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
    </div>`;

    if (window.Dashboard && typeof Dashboard.renderInsights === 'function') {
      Dashboard.renderInsights();
      var trendEl = document.getElementById('statsArea');
      if (trendEl) {
        var trendHTML = '<div id="trendCharts" class="insights-charts"><div class="insight-chart-wrap"><canvas id="prayerTrendCanvas" style="width:100%;height:200px;"></canvas></div><div class="insight-chart-wrap"><canvas id="xpTrendCanvas" style="width:100%;height:200px;"></canvas></div></div>';
        trendEl.insertAdjacentHTML('beforeend', trendHTML);
        if (window.renderTrendCharts) window.renderTrendCharts();
        
        var weeklyHTML = '<div id="weeklyCompare" class="insights-charts"></div>';
        trendEl.insertAdjacentHTML('beforeend', weeklyHTML);
        if (window.renderWeeklyCompare) window.renderWeeklyCompare();

        var smartHTML = '<div id="smartInsights" class="insights-charts"></div>';
        trendEl.insertAdjacentHTML('beforeend', smartHTML);
        if (window.renderSmartInsights) window.renderSmartInsights();
      }
    } else {
      if (window._loadAnalytics) {
        window._loadAnalytics().then(function() {
          if (window.Dashboard && typeof Dashboard.renderInsights === 'function') {
            renderStats();
          } else {
            statsArea.innerHTML += '<div style="text-align:center;padding:40px;color:var(--text2);">Analytics unavailable</div>';
          }
        }).catch(function() {
          statsArea.innerHTML += '<div style="text-align:center;padding:40px;color:var(--text2);">Failed to load analytics</div>';
        });
      }
    }
  }

  function renderTopBar() {
    const lv = document.getElementById('tbLevel');
    const title = document.getElementById('tbTitle');
    const xp = document.getElementById('tbXP');
    const streak = document.getElementById('tbStreak');
    if (lv) lv.textContent = `Lv ${S.lv}`;
    if (title) title.textContent = lvTitle(S.lv);
    if (xp) xp.innerHTML = iqIcon('zap') + ' ' + (S.xp||0).toLocaleString() + ' XP';
    if (streak) streak.innerHTML = iqIcon('flame') + ' ' + (S.cs||0);
  }

  // -------------------------------------------------------
  // QURAN RENDERING & AUDIO
  // -------------------------------------------------------

  const QURAN_RECITERS = [
    {id:7, name:'Mishari Rashid al-Afasy', folder:'Alafasy'},
    {id:2, name:'AbdulBaset AbdulSamad', folder:'Abdul_Basit'},
    {id:1, name:'AbdulBaset (Mujawwad)', folder:'Abdul_Basit_Mujawwad'},
    {id:3, name:'Abdur-Rahman as-Sudais', folder:'Sudais'},
    {id:4, name:'Abu Bakr al-Shatri', folder:'Abu_Bakr_Ash-Shatri'},
    {id:5, name:'Hani ar-Rifai', folder:'Hani_Rifai'},
    {id:6, name:'Mahmoud Khalil Al-Husary', folder:'Husary'},
    {id:12, name:'Mahmoud Khalil Al-Husary (Muallim)', folder:'Husary_Muallim'},
    {id:10, name:'Sa\'ud ash-Shuraym', folder:'Shuraym'},
    {id:9, name:'Mohamed Siddiq al-Minshawi', folder:'Minshawi'},
    {id:8, name:'Mohamed Siddiq al-Minshawi (Mujawwad)', folder:'Minshawi_Mujawwad'},
    {id:11, name:'Mohamed al-Tablawi', folder:'Tablawi'}
  ];

  let quranAudio = null;
  let quranPlayingVerse = null;
  let quranPlayingSurah = null;
  let quranPlayMode = 'none';
  let quranSurahPaused = false;
  let quranSurahQueue = [];
  let quranSurahIdx = 0;
  let quranCurrentSurah = null;
  let quranCurrentJuz = null;
  let quranViewMode = 'surah';
  let quranSearchTerm = '';

  function getQuranAudioUrl(reciterId, surah, verse) {
    const r = QURAN_RECITERS.find(x => x.id === reciterId);
    if (!r) return null;
    const s = String(surah).padStart(3,'0');
    const v = String(verse).padStart(3,'0');
    return `https://verses.quran.com/${r.folder}/mp3/${s}${v}.mp3`;
  }

  function playQuranVerse(surah, verse) {
    if (quranAudio && quranPlayingVerse === verse && quranPlayingSurah === surah) {
      if (quranAudio.paused) {
        quranAudio.play();
        if (quranPlayMode !== 'none') quranSurahPaused = false;
      } else {
        quranAudio.pause();
        if (quranPlayMode !== 'none') quranSurahPaused = true;
      }
      updateAudioButtons();
      updateSurahButton();
      updateJuzButton();
      return;
    }
    if (quranPlayMode !== 'none') {
      quranPlayMode = 'none';
      quranSurahPaused = false;
      if (quranAudio) { quranAudio.pause(); quranAudio = null; }
      quranPlayingVerse = null;
      quranPlayingSurah = null;
      updateAudioButtons();
      updateSurahButton();
      updateJuzButton();
    }
    const reciterId = S.quranAudioReciter || 7;
    const url = getQuranAudioUrl(reciterId, surah, verse);
    if (!url) return;
    quranAudio = new Audio(url);
    if (typeof window.grantDailyXp === 'function') window.grantDailyXp(1, 'quranverse|' + surah + '|' + verse);
    quranPlayingVerse = verse;
    quranPlayingSurah = surah;
    quranAudio.play().catch(()=>{});
    quranAudio.onended = () => { quranPlayingVerse = null; quranPlayingSurah = null; updateAudioButtons(); };
    updateAudioButtons();
  }

  function playSurah(surahNum) {
    if (typeof QURAN_POOL === 'undefined') {
      window.App.ensureQuranLoaded().then(() => playSurah(surahNum)).catch(() => {});
      return;
    }
    if (quranPlayMode === 'surah' && quranSurahQueue.length > 0 && quranSurahQueue[0].surah === surahNum && quranSurahPaused) {
      quranSurahPaused = false;
      if (quranAudio) quranAudio.play().catch(()=>{});
      updateSurahButton();
      updateAudioButtons();
      return;
    }
    if (quranPlayMode === 'surah' && quranSurahQueue.length > 0 && quranSurahQueue[0].surah === surahNum) {
      quranSurahPaused = true;
      if (quranAudio) quranAudio.pause();
      updateSurahButton();
      updateAudioButtons();
      return;
    }
    if (quranAudio) { quranAudio.pause(); quranAudio = null; }
    const verses = [];
    QURAN_POOL.forEach(v => {
      if (!v.source) return;
      const m = v.source.match(/(\d+):(\d+)/);
      if (m && parseInt(m[1]) === surahNum) verses.push({ surah: surahNum, verse: parseInt(m[2]) });
    });
    if (verses.length === 0) return;
    quranPlayMode = 'surah';
    quranSurahPaused = false;
    quranSurahQueue = verses;
    quranSurahIdx = 0;
    _playQueueItem();
    updateSurahButton();
  }

  function playJuz(juzNum) {
    if (typeof QURAN_POOL === 'undefined') {
      window.App.ensureQuranLoaded().then(() => playJuz(juzNum)).catch(() => {});
      return;
    }
    if (quranPlayMode === 'juz' && quranSurahQueue.length > 0 && quranSurahQueue[0].juz === juzNum && quranSurahPaused) {
      quranSurahPaused = false;
      if (quranAudio) quranAudio.play().catch(()=>{});
      updateJuzButton(); updateAudioButtons();
      return;
    }
    if (quranPlayMode === 'juz' && quranSurahQueue.length > 0 && quranSurahQueue[0].juz === juzNum) {
      quranSurahPaused = true;
      if (quranAudio) quranAudio.pause();
      updateJuzButton(); updateAudioButtons();
      return;
    }
    if (quranAudio) { quranAudio.pause(); quranAudio = null; }

    const startG = juzBegin(juzNum), endG = juzEnd(juzNum);
    if (startG === null || endG === null) return;
    const verses = [];
    QURAN_POOL.forEach(v => {
      if (!v.source) return;
      const m = v.source.match(/(\d+):(\d+)/);
      if (!m) return;
      const surah = +m[1], ayah = +m[2];
      const g = globalAyahOf(surah, ayah);
      if (g >= startG && g <= endG) verses.push({ juz: juzNum, surah: parseInt(m[1]), verse: parseInt(m[2]) });
    });
    verses.sort((a,b)=> (a.surah - b.surah) || (a.verse - b.verse) || 0);
    if (verses.length === 0) return;

    quranPlayMode = 'juz';
    quranSurahPaused = false;
    quranSurahQueue = verses;
    quranSurahIdx = 0;
    _playQueueItem();
    updateJuzButton();
  }

  function _playQueueItem() {
    if (quranPlayMode === 'none' || quranSurahIdx >= quranSurahQueue.length) { stopSurah(); return; }
    if (quranAudio) { quranAudio.pause(); quranAudio = null; }
    const sv = quranSurahQueue[quranSurahIdx];
    const reciterId = S.quranAudioReciter || 7;
    const url = getQuranAudioUrl(reciterId, sv.surah, sv.verse);
    if (!url) { stopSurah(); return; }
    quranAudio = new Audio(url);
    quranPlayingVerse = sv.verse;
    quranPlayingSurah = sv.surah;
    quranAudio.play().catch(()=>{});
    quranAudio.onended = () => {
      quranSurahIdx++;
      if (quranSurahIdx < quranSurahQueue.length) {
        _playQueueItem();
      } else {
        stopSurah();
      }
    };
    updateAudioButtons();
    updateSurahButton();
    updateJuzButton();
    _scrollToVerse();
  }

  function stopSurah() {
    if (quranAudio) { quranAudio.pause(); quranAudio = null; }
    quranPlayMode = 'none';
    quranSurahPaused = false;
    quranSurahQueue = [];
    quranSurahIdx = 0;
    quranPlayingVerse = null;
    quranPlayingSurah = null;
    updateAudioButtons();
    updateSurahButton();
    updateJuzButton();
  }

  function _scrollToVerse() {
    const el = document.querySelector('.verse-play-btn.playing');
    if (el) el.closest('.verse-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function setQuranReciter(id) {
    S.quranAudioReciter = id;
    saveState();
    if (quranAudio) { quranAudio.pause(); quranAudio = null; quranPlayingVerse = null; quranPlayingSurah = null; }
  }

  function updateSurahButton() {
    const btn = document.getElementById('surahPlayBtn');
    if (!btn) return;
    if (quranPlayMode === 'surah' && !quranSurahPaused) {
      btn.textContent = '⏸ Pause Surah';
      btn.classList.add('playing');
    } else if (quranPlayMode === 'surah' && quranSurahPaused) {
      btn.textContent = '▶ Resume Surah';
      btn.classList.add('playing');
    } else {
      btn.textContent = '▶ Play Surah';
      btn.classList.remove('playing');
    }
  }

  function updateJuzButton() {
    const btn = document.getElementById('juzPlayBtn');
    if (!btn) return;
    if (quranPlayMode === 'juz' && !quranSurahPaused) {
      btn.textContent = '⏸ Pause Juz';
      btn.classList.add('playing');
    } else if (quranPlayMode === 'juz' && quranSurahPaused) {
      btn.textContent = '▶ Resume Juz';
      btn.classList.add('playing');
    } else {
      btn.textContent = '▶ Play Juz';
      btn.classList.remove('playing');
    }
  }

  function updateAudioButtons() {
    document.querySelectorAll('.verse-play-btn').forEach(btn => {
      const s = parseInt(btn.dataset.surah);
      const v = parseInt(btn.dataset.verse);
      if (quranPlayingVerse === v && quranPlayingSurah === s && quranAudio && !quranAudio.paused) {
        btn.textContent = '⏸';
        btn.classList.add('playing');
      } else {
        btn.textContent = '▶';
        btn.classList.remove('playing');
      }
    });
    document.querySelectorAll('.verse-card').forEach(card => {
      const btn = card.querySelector('.verse-play-btn');
      if (btn && btn.classList.contains('playing')) {
        card.classList.add('verse-playing');
      } else {
        card.classList.remove('verse-playing');
      }
    });
  }

  function renderQuran() {
    const el = document.getElementById('quranArea');
    if (!el) return;

    if (quranCurrentSurah !== null) {
      renderQuranSurah(el, quranCurrentSurah);
      return;
    }
    if (quranCurrentJuz !== null) {
      renderQuranJuz(el, quranCurrentJuz);
      return;
    }

    let html = '<div class="quran-header"><h2>' + iqIcon('book-open') + ' The Noble Quran</h2><div class="quran-sub">114 Surahs - Tap a surah to read</div></div>';
    html += '<div class="tab-bar-quran">';
    html += `<button class="${quranViewMode==='surah'?'active':''}" onclick="App.setQuranView('surah')">Surahs</button>`;
    html += `<button class="${quranViewMode==='juz'?'active':''}" onclick="App.setQuranView('juz')">Juz</button>`;
    html += '</div>';
    html += '<input class="quran-search" placeholder="' + iqEmoji('search') + ' Search surah name..." oninput="App.quranSearchFilter(this.value)">';

    if (quranViewMode === 'juz') {
      html += '<div class="juz-grid">';
      QURAN_JUZ.forEach(j => {
        html += `<div class="juz-card" onclick="App.openQuranJuz(${j.n})"><div style="font-weight:700;color:var(--accent-light);">Juz ${j.n}</div><div style="font-size:0.7rem;color:var(--text2);margin-top:3px;">${j.name}</div></div>`;
      });
      html += '</div>';
    } else {
      const filtered = QURAN_SURAHS.filter(s => !quranSearchTerm || s.en.toLowerCase().includes(quranSearchTerm.toLowerCase()) || s.ar.includes(quranSearchTerm));
      html += '<div class="surah-grid">';
      filtered.forEach(s => {
        html += `<div class="surah-card" onclick="App.openQuranSurah(${s.n})">
          <div class="surah-num">#${s.n}</div>
          <div class="surah-name-ar">${s.ar}</div>
          <div class="surah-name-en">${s.en}</div>
          <div class="surah-meta">${s.ay} verses · ${s.type}</div>
        </div>`;
      });
      html += '</div>';
    }
    el.innerHTML = html;
  }

  function renderQuranSurah(el, surahNum) {
    if (typeof QURAN_POOL === 'undefined') {
      el.innerHTML = '<div class="quran-loading">Loading verses…</div>';
      window.App.ensureQuranLoaded()
        .then(() => renderQuranSurah(el, surahNum))
        .catch(() => { el.innerHTML = '<div class="quran-loading">Couldn\'t load verses — check your connection and retry.</div>'; });
      return;
    }
    const s = QURAN_SURAHS.find(x => x.n === surahNum);
    if (!s) { quranCurrentSurah = null; renderQuran(); return; }
    let html = '<button class="quran-back-btn" onclick="App.quranBack()">◀ Back to Surahs</button>';
    html += `<div class="quran-header"><h2>${s.ar}</h2><div style="font-family:'Amiri',serif;font-size:1.3rem;color:var(--accent);margin:4px 0;">${s.en}</div><div class="quran-sub">${s.ay} verses · ${s.type}</div></div>`;
    html += `<div style="text-align:center;margin:8px 0 12px;"><button id="surahPlayBtn" class="surah-play-btn" onclick="App.playSurah(${surahNum})">▶ Play Surah</button></div>`;
    const verses = QURAN_POOL.filter(v => {
      if (!v.source) return false;
      const m = v.source.match(/(\d+):(\d+)/);
      return m && parseInt(m[1]) === surahNum;
    });
    if (surahNum !== 1) {
      html += `<div style="text-align:center;font-size:1.6rem;color:var(--accent);font-family:'Amiri',serif;margin:16px 0;">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>`;
    }
    if (verses.length === 0) {
      html += `<div class="quran-loading">No local verses available for this surah. ${s.ay} verses total.</div>`;
    } else {
      verses.forEach(v => {
        const m = v.source.match(/(\d+):(\d+)/);
        const vNum = m ? m[2] : '';
        html += `<div class="verse-card">
          <div class="verse-num">${vNum}</div>
          <div class="verse-arabic">${v.arabic}</div>
          ${v.roman ? `<div style="font-size:0.85rem;color:var(--text2);font-style:italic;margin:6px 0;line-height:1.5;">${v.roman}</div>` : ''}
          <div class="verse-english">${v.english || ''}</div>
          <button class="verse-play-btn" data-surah="${surahNum}" data-verse="${vNum}" onclick="App.playQuranVerse(${surahNum},${vNum})">▶</button>
        </div>`;
      });
    }
    el.innerHTML = html;
  }

  function renderQuranJuz(el, juzNum) {
    if (typeof QURAN_POOL === 'undefined') {
      el.innerHTML = '<div class="quran-loading">Loading verses…</div>';
      window.App.ensureQuranLoaded()
        .then(() => renderQuranJuz(el, juzNum))
        .catch(() => { el.innerHTML = '<div class="quran-loading">Couldn\'t load verses — check your connection and retry.</div>'; });
      return;
    }
    const startG = juzBegin(juzNum), endG = juzEnd(juzNum);
    if (startG === null || endG === null) { quranCurrentJuz = null; renderQuran(); return; }
    const startS = findSurahByAyah(startG);
    const endS = findSurahByAyah(endG);
    const j = QURAN_JUZ.find(x => x.n === juzNum);
    const firstLocal = startG - globalAyahOf(startS.n, 1) + 1;
    const lastLocal = endG - globalAyahOf(endS.n, 1) + 1;
    const verseCount = endG - startG + 1;

    let html = '<button class="quran-back-btn" onclick="App.quranBack()">◀ Back to Juzes</button>';
    html += `<div class="quran-header"><h2>Juz ${juzNum} · ${j ? j.name : ''}</h2><div style="font-family:'Amiri',serif;font-size:1.2rem;color:var(--accent);margin:4px 0;">${startS.en} → ${endS.en}</div><div class="quran-sub">${startS.n}:${firstLocal} · ${endS.n}:${lastLocal} · ${verseCount} verses</div></div>`;
    html += `<div style="text-align:center;margin:8px 0 12px;"><button id="juzPlayBtn" class="surah-play-btn" onclick="App.playJuz(${juzNum})">▶ Play Juz</button></div>`;
    if (startS.n !== 1) { html += `<div style="text-align:center;font-size:1.6rem;color:var(--accent);font-family:'Amiri',serif;margin:16px 0;">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>`; }

    const verses = [];
    QURAN_POOL.forEach(v => {
      if (!v.source) return;
      const m = v.source.match(/(\d+):(\d+)/);
      if (!m) return;
      const surah = parseInt(m[1]), ayah = parseInt(m[2]);
      const g = globalAyahOf(surah, ayah);
      if (g >= startG && g <= endG) verses.push({ v, surah, ayah });
    });
    verses.sort((a, b) => (globalAyahOf(a.surah, a.ayah) - globalAyahOf(b.surah, b.ayah)));

    if (verses.length === 0) {
      html += `<div class="quran-loading">No local verses available for Juz ${juzNum}.</div>`;
    } else {
      verses.forEach(({ v, surah, ayah }) => {
        html += `<div class="verse-card">
          <div class="verse-num">${surah}:${ayah}</div>
          <div class="verse-arabic">${v.arabic}</div>
          ${v.roman ? `<div style="font-size:0.85rem;color:var(--text2);font-style:italic;margin:6px 0;line-height:1.5;">${v.roman}</div>` : ''}
          <div class="verse-english">${v.english || ''}</div>
          <button class="verse-play-btn" data-surah="${surah}" data-verse="${ayah}" onclick="App.playQuranVerse(${surah},${ayah})">▶</button>
        </div>`;
      });
    }
    el.innerHTML = html;
    updateAudioButtons();
    updateJuzButton();
  }

  function setQuranView(mode) { quranViewMode = mode; quranSearchTerm = ''; renderQuran(); }
  function quranSearchFilter(term) { quranSearchTerm = term; renderQuran(); }
  function openQuranSurah(num) { quranCurrentSurah = num; quranCurrentJuz = null; renderQuran(); }
  function quranBack() { quranCurrentSurah = null; quranCurrentJuz = null; renderQuran(); }
  function openQuranJuz(juzNum) {
    quranCurrentJuz = juzNum;
    quranCurrentSurah = null;
    renderQuran();
  }

  function globalAyahOf(surah, ayah) {
    let cum = 0;
    for (let i = 0; i < surah - 1; i++) cum += QURAN_SURAHS[i].ay;
    return cum + ayah;
  }
  function juzBegin(juzNum) {
    const j = QURAN_JUZ.find(x => x.n === juzNum);
    return j ? j.start : null;
  }
  function juzEnd(juzNum) {
    if (juzNum === 30) return 6236;
    const next = QURAN_JUZ.find(x => x.n === juzNum + 1);
    return next ? next.start - 1 : null;
  }
  function findSurahByAyah(ayahNum) {
    let cumulative = 0;
    for (const s of QURAN_SURAHS) {
      cumulative += s.ay;
      if (cumulative >= ayahNum) return s;
    }
    return QURAN_SURAHS[QURAN_SURAHS.length - 1];
  }

  // ── Hadith ──
  let hadithView = { level: 'collections', collectionId: null, bookId: null };

  function renderHadith() {
    const el = document.getElementById('hadithArea');
    if (!el || typeof HADITH_COLLECTIONS_DATA === 'undefined') return;
    const data = HADITH_COLLECTIONS_DATA;

    if (hadithView.level === 'hadiths') {
      const col = data.find(c => c.id === hadithView.collectionId);
      const book = col && col.books.find(b => b.id === hadithView.bookId);
      if (!col || !book) { hadithView = { level: 'collections', collectionId: null, bookId: null }; renderHadith(); return; }
      let html = `<button class="quran-back-btn" onclick="App.hadithBack()">◀ Back to ${col.name}</button>`;
      html += `<div class="quran-header"><h2>${iqIcon(col.icon || col.id)} ${book.name}</h2><div class="quran-sub">${book.hadiths.length} hadiths</div></div>`;
      book.hadiths.forEach(h => {
        html += `<div class="verse-card">
          <div class="verse-num">${h.n}</div>
          <div class="verse-english">${h.t}</div>
          <div class="content-source">${iqIcon('book-open')} ${col.name} ${h.b}:${h.h}<a class="verify-btn" href="https://sunnah.com/${col.id}/${h.b}#${h.n}" target="_blank" rel="noopener noreferrer" title="Verify on sunnah.com">Verify</a></div>
        </div>`;
      });
      el.innerHTML = html;
      return;
    }

    if (hadithView.level === 'books') {
      const col = data.find(c => c.id === hadithView.collectionId);
      if (!col) { hadithView = { level: 'collections', collectionId: null, bookId: null }; renderHadith(); return; }
      let html = `<button class="quran-back-btn" onclick="App.hadithBack()">◀ Back to Collections</button>`;
      html += `<div class="quran-header"><h2>${iqIcon(col.icon || col.id)} ${col.name}</h2><div class="quran-sub">${col.books.length} books · ${col.books.reduce((s, b) => s + b.hadiths.length, 0)} hadiths</div></div>`;
      html += '<div class="surah-grid">';
      col.books.forEach(book => {
        html += `<div class="surah-card" onclick="App.openHadithBook('${col.id}',${book.id})">
          <div class="surah-num">${iqIcon('book-open')} ${book.id}</div>
          <div class="surah-name-en">${book.name}</div>
          <div class="surah-meta">${book.hadiths.length} hadiths</div>
        </div>`;
      });
      html += '</div>';
      el.innerHTML = html;
      return;
    }

    let html = '<div class="quran-header"><h2>' + iqIcon('book') + ' The Hadith Collections</h2><div class="quran-sub">Authentic narrations of the Prophet Muhammad ﷺ</div></div>';
    html += '<div class="surah-grid">';
    data.forEach(c => {
      const total = c.books.reduce((s, b) => s + b.hadiths.length, 0);
      html += `<div class="surah-card" onclick="App.openHadithCollection('${c.id}')">
        <div class="surah-num">${iqIcon(c.icon || c.id)}</div>
        <div class="surah-name-en">${c.name}</div>
        <div class="surah-meta">${c.books.length} books · ${total} hadiths</div>
        <div style="font-size:0.72rem;color:var(--text2);margin-top:4px;line-height:1.4;">${c.desc}</div>
      </div>`;
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function openHadithCollection(id) { hadithView = { level: 'books', collectionId: id, bookId: null }; renderHadith(); }
  function openHadithBook(colId, bookId) { hadithView = { level: 'hadiths', collectionId: colId, bookId }; renderHadith(); }
  function hadithBack() {
    if (hadithView.level === 'hadiths') { hadithView.level = 'books'; hadithView.bookId = null; }
    else { hadithView = { level: 'collections', collectionId: null, bookId: null }; }
    renderHadith();
  }

  // -------------------------------------------------------
  // SCREEN READER & ACCESSIBILITY
  // -------------------------------------------------------

  function announceToScreenReader(message) {
    const el = document.getElementById('srAnnounce');
    if (el) {
      el.textContent = '';
      setTimeout(() => { el.textContent = message; }, 100);
    }
  }

  const _origGrantDailyXp = window.grantDailyXp;
  const _origGrantCappedDailyXp = window.grantCappedDailyXp;
  const _origLevelUpToast = window.levelUpToast;

  if (typeof _origGrantDailyXp === 'function') {
    window.grantDailyXp = function(amount, key) {
      const result = _origGrantDailyXp(amount, key);
      if (result) announceToScreenReader('+' + amount + ' XP earned');
      return result;
    };
  }
  if (typeof _origGrantCappedDailyXp === 'function') {
    window.grantCappedDailyXp = function(amount, key, cap) {
      const result = _origGrantCappedDailyXp(amount, key, cap);
      if (result) announceToScreenReader('+' + amount + ' XP earned');
      return result;
    };
  }
  if (typeof _origLevelUpToast === 'function') {
    window.levelUpToast = function(lv, title) {
      announceToScreenReader('Level up! You are now level ' + lv + ', ' + title);
      return _origLevelUpToast(lv, title);
    };
  }

  // -------------------------------------------------------
  // WINDOW EXPORTS
  // -------------------------------------------------------

  window.renderDynamic = renderDynamic;
  window.renderStatic = renderStatic;
  window.renderAll = renderAll;
  window.markDirty = markDirty;
  window.clearDirty = clearDirty;
  window.renderToday = renderToday;
  window.renderLv = renderLv;
  window.renderStr = renderStr;
  window.renderBonus = renderBonus;
  window.renderTopBar = renderTopBar;
  window.renderQ = renderQ;
  window.renderAch = renderAch;
  window.renderProg = renderProg;
  window.renderShop = renderShop;
  window.renderProfile = renderProfile;
  window.renderStats = renderStats;
  window.renderQuran = renderQuran;
  window.renderHadith = renderHadith;
  window.setQuranView = setQuranView;
  window.quranSearchFilter = quranSearchFilter;
  window.openQuranSurah = openQuranSurah;
  window.quranBack = quranBack;
  window.openQuranJuz = openQuranJuz;
  window.openHadithCollection = openHadithCollection;
  window.openHadithBook = openHadithBook;
  window.hadithBack = hadithBack;
  window.playQuranVerse = playQuranVerse;
  window.playSurah = playSurah;
  window.stopSurah = stopSurah;
  window.playJuz = playJuz;
  window.updateJuzButton = updateJuzButton;
  window.setQuranReciter = setQuranReciter;
  window.announceToScreenReader = announceToScreenReader;
})();
