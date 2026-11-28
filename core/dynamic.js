(function() {
  // Pull all content renderers from window into local scope so renderStatic() and
  // renderToday() can call them as bare names without window. prefix.
  const { renderSunnahs, renderDhikr, renderDhikrCounter, renderStories, renderNames, renderInspirations, renderGratitude, renderFasting, renderCharity, renderMemorization, renderMorning, renderEvening, renderSins, renderRepentance, renderSahaba, renderSeerah, renderTafsir, renderManners, renderFamily, renderHealth, renderUmmah, renderHajj, renderAkhirah, renderProphets, renderWomen, renderHeart, renderMarriage, renderWudu, renderScholars, renderPatience, renderCommunity, renderFiqh, renderTawakkul, renderIkhlas, renderZuhd, renderAqeedah, renderKnowledge, renderJumuah, renderJannah, renderJahannam, renderGrave, renderSigns, renderParenting, renderTibb, renderNeighbors, renderPrayers, renderVol, renderDeeds, renderTimer, renderPrayerTimes, renderVirtues, renderVicesreturn, renderCharacterpath, renderWorshiprulings, renderWealthoaths, renderFamilylife, renderService, renderWellness } = window;
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
    profile: renderProfile,
    stats: renderStats,
    timer: renderTimer,
    prayertimes: renderPrayerTimes,
    garden: () => window.renderGarden && window.renderGarden(),
    muhasabah: () => window.renderMuhasabahEntry && window.renderMuhasabahEntry(),
    journeys: () => window.renderJourneys && window.renderJourneys(),
    achievementshowcase: () => window.renderAchievementShowcase && window.renderAchievementShowcase(),
    autotrack: () => window.autoTrackJourneyProgress && window.autoTrackJourneyProgress(),
  };

  // -------------------------------------------------------
  // DYNAMIC CONTENT RENDERING
  // -------------------------------------------------------
  const safe = (fn, name) => { try { fn(); } catch(e) { console.warn('Static ' + name + ' failed:', e.message); } };
  function _escD(s) {
    return (typeof window !== 'undefined' && typeof window.escapeHTML === 'function')
      ? window.escapeHTML(s)
      : String(s == null ? '' : s);
  }
  function _fmtN(v) {
    return (typeof window.iqFormatNum === 'function') ? window.iqFormatNum(v) : String(v == null ? '' : v);
  }
  function _tr(k, fallback) {
    if (typeof window.t === 'function') {
      const out = window.t(k);
      if (out && out !== k) return out;
    }
    return fallback || k;
  }

  // Static renderers grouped by tab ID
  // Only the active tab's renderer fires on boot; _lazyRender in activateTab handles the rest.
  var TAB_STATIC_RENDERERS = {
    today: function() {},
    quran: function() { safe(renderQuran,'Quran'); },
    morning: function() { safe(renderMorning,'Morning'); },
    evening: function() { safe(renderEvening,'Evening'); },
    dhikr: function() { safe(renderDhikr,'Dhikr'); },
    situational: function() { safe(renderSituationalDhikr,'SituationalDhikr'); },
    duas: function() { safe(renderDuas,'Duas'); },
    hadith: function() { safe(renderHadith,'Hadith'); },
    sunnahs: function() { safe(renderSunnahs,'Sunnahs'); },
    wudu: function() { safe(renderWudu,'Wudu'); },
    jumuah: function() { safe(renderJumuah,'Jumuah'); },
    fasting: function() { safe(renderFasting,'Fasting'); },
    memorization: function() { safe(renderMemorization,'Memorization'); },
    charity: function() {
      safe(renderCharity,'Charity');
      safe(function() { window.renderFinanceTab && window.renderFinanceTab(); },'FinanceTab');
      safe(function() { window.renderZakatCalc && window.renderZakatCalc(); },'ZakatCalc');
    },
    healthlog: function() {
      safe(function() { window.renderHealthLog && window.renderHealthLog(); },'HealthLog');
      safe(renderGratitude,'Gratitude');
    },
    tafsir: function() { safe(renderTafsir,'Tafsir'); },
    aqeedah: function() { safe(renderAqeedah,'Aqeedah'); },
    fiqh: function() { safe(renderFiqh,'Fiqh'); },
    seerah: function() { safe(renderSeerah,'Seerah'); },
    stories: function() { safe(renderStories,'Stories'); },
    akhirah: function() { safe(renderAkhirah,'Akhirah'); },
    jannah: function() { safe(renderJannah,'Jannah'); },
    jahannam: function() { safe(renderJahannam,'Jahannam'); },
    grave: function() { safe(renderGrave,'Grave'); },
    signs: function() { safe(renderSigns,'Signs'); },
    allah_names: function() { safe(renderNames,'Names'); },
    prophets: function() { safe(renderProphets,'Prophets'); },
    sahaba: function() { safe(renderSahaba,'Sahaba'); },
    women: function() { safe(renderWomen,'Women'); },
    scholars_names: function() { safe(renderScholars,'Scholars'); },
    virtues: function() { safe(renderVirtues,'Virtues'); },
    'vices-return': function() { safe(renderVicesreturn,'Vicesreturn'); },
    'character-path': function() { safe(renderCharacterpath,'Characterpath'); },
    'worship-rulings': function() { safe(renderWorshiprulings,'Worshiprulings'); },
    'wealth-oaths': function() { safe(renderWealthoaths,'Wealthoaths'); },
    'family-life': function() { safe(renderFamilylife,'Familylife'); },
    community: function() { safe(renderCommunity,'Community'); },
    service: function() { safe(renderService,'Service'); },
    wellness: function() { safe(renderWellness,'Wellness'); }
  };

  function renderDynamic() {
    if (dirtyPanels.size === 0) return;

    const pageScroll = window.scrollY;
    const volArea = document.getElementById('volArea');
    const deedArea = document.getElementById('deedArea');
    const questArea = document.getElementById('questArea');
    
    const volScroll = volArea ? volArea.scrollTop : 0;
    const deedScroll = deedArea ? deedArea.scrollTop : 0;
    const questScroll = questArea ? questArea.scrollTop : 0;

    const renderSafe = (fn, name) => { try { fn(); } catch(e) { console.warn('Render ' + name + ' failed:', e.message); } };
    for (const panel of dirtyPanels) {
      const fn = PANEL_RENDERERS[panel];
      if (fn) renderSafe(fn, panel);
    }
    clearDirty();

    if (volArea) volArea.scrollTop = volScroll;
    if (deedArea) deedArea.scrollTop = deedScroll;
    if (questArea) questArea.scrollTop = questScroll;
    if (typeof window.scrollTo === 'function') window.scrollTo(0, pageScroll);
    refreshLucideIcons();
  }

  function renderStatic() {
    var activeTab = (window.S && window.S.lastSub) || 'today';
    var fn = TAB_STATIC_RENDERERS[activeTab];
    if (fn) fn();
  }

function renderAll() {
    document.body.classList.remove('loading');
    for (const panel of Object.keys(PANEL_RENDERERS)) dirtyPanels.add(panel);
    renderDynamic();
    renderStatic();
  }

  // Panels rendered exclusively by deferred feature scripts (health, personal
  // goals, spiritual-growth, combos, journeys, seasonal, etc.). At init-time
  // their `window.* && window.*()` guards hit a not-yet-loaded renderer and
  // render nothing, so the post-defer hook must re-render these. The direct
  // panels (topbar/lv/today/...) are already correct after init's renderAll() —
  // re-rendering them a second time is pure waste (boot double-render).
  const DEFERRED_PANELS = [
    'garden', 'muhasabah', 'journeys', 'achievementshowcase', 'autotrack'
  ];
  function renderDeferred() {
    for (const panel of DEFERRED_PANELS) dirtyPanels.add(panel);
    return renderDynamic();
  }
  function renderToday() { const s=(fn,n)=>{try{fn();}catch(e){console.warn('Today render '+n+' failed:',e.message);}}; s(renderPrayers,'prayers'); s(renderVol,'vol'); s(renderDeeds,'deeds'); s(function(){ if (typeof window.renderIqFeed === 'function') window.renderIqFeed(); },'iqFeed'); }

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
    const prefix = document.getElementById('lvPrefix');
    if (!lv || !title || !bar || !label) return;
    const xp = S.xp || 0;
    const cur = xpFor(S.lv), nxt = xpFor(S.lv + 1);
    const prog = xp - cur, need = (nxt - cur) || 1;
    if (prefix) prefix.textContent = _tr('Level', 'Level');
    lv.textContent = _fmtN(S.lv);
    title.textContent = _tr(lvTitle(S.lv), lvTitle(S.lv));
    bar.style.width = Math.min(100, (prog / need) * 100) + '%';
    label.textContent = _fmtN(prog) + ' / ' + _fmtN(need) + ' XP';
  }
  function renderStr() {
    const fire = document.getElementById('streakFire');
    if (fire) {
      fire.innerHTML = typeof iqIcon === 'function' ? iqIcon('flame') : '🔥';
    }
    const days = document.getElementById('strDays');
    const best = document.getElementById('bestStr');
    const msg = document.getElementById('strMsg');
    if (!days || !best || !msg) return;
    const curStreak = S.cs || 0;
    const barEl = days.closest ? days.closest('.streak-bar') : null;
    if (barEl && barEl.classList) barEl.classList.toggle('is-zero', curStreak === 0);
    days.textContent = _fmtN(curStreak) + ' ' + _tr('Day Streak', 'Day Streak');
    best.textContent = _fmtN(S.bs || 0);
    if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
      const bestLbl = document.querySelector('.streak-best .best-label');
      if (bestLbl) bestLbl.textContent = _tr('Best', 'Best');
    }
    const rawMsg = (STREAK_MSGS.find(x => curStreak >= x.m) || { t: 'Legendary!' }).t;
    msg.textContent = _tr(rawMsg, rawMsg);
  }

  // ── Quests ──
  function renderQ() {
    const questArea = document.getElementById('questArea');
    const openStates = questArea ? Array.from(questArea.querySelectorAll('details.cat-details')).map(d => d.open) : [true, false, false, false, false];
    
    const renderQuestGroup = (title, quests, type, isOpen) => {
      if (!quests || quests.length===0) return '';
      const total = quests.length;
      const completed = quests.filter(q => q.done).length;
      const openAttr = isOpen ? ' open' : '';
      
      let html = `<details class="cat-details"${openAttr}><summary><div style="display:flex;justify-content:space-between;align-items:center;flex:1;"><span>${title}</span><span class="iq-num-pill iq-tabular">${_fmtN(completed)} / ${_fmtN(total)}</span></div></summary><div style="padding:0 12px 12px;display:flex;flex-direction:column;gap:8px;margin-top:8px;">`;
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
        
        return `<div class="vol-card${d?' done':''}" tabindex="0" role="button" onclick="App.toggleQuest('${q.id}','${type}',${q.xp})" style="cursor:pointer;width:100%;box-sizing:border-box;">
          <div class="prayer-check">${d?iqIcon('check'):icon}</div>
          <div class="prayer-info"><div class="prayer-name">${_escD(_tr(q.d, q.d))}</div></div>
          <div class="prayer-xp iq-tabular">+${_fmtN(q.xp)} XP</div>
        </div>`;
      }).join('');
      return html + '</div></details>';
    };

    let h = renderQuestGroup(iqIcon('clipboard') + ' ' + _escD(_tr('Daily Quests', 'Daily Quests')), S.dq, 'daily', openStates[0]);
    h += renderQuestGroup(iqIcon('calendar') + ' ' + _escD(_tr('Weekly Quests', 'Weekly Quests')), S.wq, 'weekly', openStates[1]);
    h += renderQuestGroup(iqIcon('calendar-days') + ' ' + _escD(_tr('Monthly Quests', 'Monthly Quests')), S.mq, 'monthly', openStates[2]);
    h += renderQuestGroup(iqIcon('calendar-check') + ' ' + _escD(_tr('Yearly Quests', 'Yearly Quests')), S.yq, 'yearly', openStates[3]);
    h += renderQuestGroup(iqIcon('star') + ' ' + _escD(_tr('Lifetime Quests', 'Lifetime Quests')), S.lq, 'lifetime', openStates[4]);
    h += `<div style="text-align:center;margin-top:20px;color:var(--text2);">${_escD(_tr('Total quests completed', 'Total quests completed'))}: <strong class="iq-tabular" style="color:var(--accent-dark)">${_fmtN(S.tq||0)}</strong></div>`;
    
    if(questArea) questArea.innerHTML = h;
  }

  // ── Achievements ──
  let _achFilter = 'all';
  function setAchFilter(f) {
    _achFilter = f || 'all';
    renderAch();
  }
  window.setAchFilter = setAchFilter;

  function renderAch() {
  const cnt = Object.keys(S.ua).length;
  const total = ACHS.length;
  const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
  const hasArt = typeof window.renderAchievementBadge === 'function';
  const hasIcon = typeof window.renderAchievementIcon === 'function';

  let h = '<div class="ach-header">';
  h += `<div class="section-title">${hasIcon ? window.renderAchievementIcon('achievements') : iqIcon('trophy')} ${_escD(_tr('Trophy Cabinet', 'Trophy Cabinet'))}</div>`;
  h += `<div class="ach-progress"><span class="ach-progress-bar" style="width:${pct}%"></span></div>`;
  h += `<div class="ach-progress-text iq-tabular">${_fmtN(cnt)} / ${_fmtN(total)} ${_escD(_tr('Unlocked', 'Unlocked'))} (${_fmtN(pct)}%)</div>`;
  h += '<div class="ach-filters" role="group" aria-label="Filter trophies">';
  const filters = [
    { key: 'all', label: _tr('All', 'All') + ' (' + _fmtN(total) + ')' },
    { key: 'unlocked', label: _tr('Unlocked', 'Unlocked') + ' (' + _fmtN(cnt) + ')' },
    { key: 'locked', label: _tr('Locked', 'Locked') + ' (' + _fmtN(Math.max(0, total - cnt)) + ')' }
  ];
  filters.forEach(fl => {
    h += `<button type="button" class="ach-filter-btn${_achFilter === fl.key ? ' active' : ''}" onclick="window.setAchFilter('${fl.key}')">${_escD(fl.label)}</button>`;
  });
  h += '</div>';
  h += '</div>';

  const visibleAchs = ACHS.filter(a => {
    const u = !!S.ua[a.id];
    if (_achFilter === 'unlocked') return u;
    if (_achFilter === 'locked') return !u;
    return true;
  });

  h += '<div class="ach-grid">';
  h += visibleAchs.map(a => {
    const u = !!S.ua[a.id];
    const tierIcon = a.tier === 'jannah' ? iqIcon('kaaba') : a.tier === 'mythic' ? iqIcon('crown') : a.tier === 'legendary' ? iqIcon('award') : a.tier === 'diamond' ? iqIcon('gem') : a.tier === 'platinum' ? iqIcon('gem') : a.tier === 'gold' ? iqIcon('trophy') : a.tier === 'silver' ? iqIcon('medal') : iqIcon('star');
    const badgeVisual = hasArt
      ? window.renderAchievementBadge(a, { unlocked: u, size: 'md' })
      : `<div class="ach-icon">${u ? (iqIcon(a.icon || a.id || a.name) || tierIcon) : iqIcon('lock')}</div>`;
    return `<div class="ach-card${u ? ' unlocked' : ' locked'} tier-${_escD(a.tier)}" ${u ? `onclick="window.featureAchievement && window.featureAchievement('${_escD(a.id)}')" role="button" tabindex="0" title="${_escD(_tr('Tap to feature in showcase', 'Tap to feature in showcase'))}"` : ''}>
      <div class="ach-badge-wrap">${badgeVisual}</div>
      <div class="ach-name">${_escD(_tr(a.name, a.name))}</div>
      <div class="ach-desc">${_escD(_tr(a.desc, a.desc))}</div>
      <div class="ach-card-footer">
        <span class="ach-rarity-tag tier-${_escD(a.tier)}">${_escD(_tr(a.tier, a.tier))}</span>
        <span class="ach-status-tag">${_escD(u ? _tr('Unlocked', 'Unlocked') : _tr('Locked', 'Locked'))}</span>
      </div>
    </div>`;
  }).join('');
  h += '</div>';

  if (cnt === 0 && _achFilter === 'unlocked') {
    h += `<div class="ach-empty">${_escD(_tr('No trophies yet. Start completing deeds to earn your first!', 'No trophies yet. Start completing deeds to earn your first!'))}</div>`;
  } else if (visibleAchs.length === 0) {
    h += `<div class="ach-empty">${_escD(_tr('All trophies in this view are complete!', 'All trophies in this view are complete!'))}</div>`;
  }

  var aEl = document.getElementById('achArea');
  if (aEl) aEl.innerHTML = h;
  if (typeof window.renderAchievementShowcase === 'function') window.renderAchievementShowcase();
}

  // ── Progress / Calendar ──
  function renderProg() {
    const now = new Date();
    const tk = today();
    const calY = window.calViewYear, calM = window.calViewMonth;
    const vY = (calY == null ? now.getFullYear() : calY);
    const vM = (calM == null ? now.getMonth() : calM);
    const dim = new Date(vY, vM + 1, 0).getDate();
    const fd = new Date(vY, vM, 1).getDay();
    const loc = (typeof I18N !== 'undefined' && I18N.lang) ? I18N.lang : 'en';
    const gMonthName = new Date(vY, vM, 1).toLocaleString(loc, { month: 'long' });
    const isCurrentMonth = calY === now.getFullYear() && calM === now.getMonth();

    let cal = '<div class="cal-header">';
    cal += '<div class="cal-nav"><button type="button" aria-label="Previous month" onclick="App.calPrevMonth()"><span class="iq-mirror-icon">◀</span></button></div>';
    cal += '<div class="cal-header-info">';
    cal += `<h3>${gMonthName} ${_fmtN(vY)}</h3>`;
    const hMonth = (typeof window.HIJRI_MONTHS_AR !== 'undefined' && window.HIJRI_MONTHS_AR[window.calViewHijriM - 1]) || '';
    cal += `<div class="cal-hijri-title">${hMonth} ${_fmtN(window.calViewHijriY || '')} ${_escD(_tr('AH', 'AH'))}</div>`;
    cal += '</div>';
    cal += '<div class="cal-nav">';
    if (!isCurrentMonth) cal += '<button type="button" class="cal-today-btn" onclick="App.calGoToday()">' + _escD(_tr('Today', 'Today')) + '</button> ';
    cal += '<button type="button" aria-label="Next month" onclick="App.calNextMonth()"><span class="iq-mirror-icon">▶</span></button>';
    cal += '</div></div>';

    cal += '<div class="cal-grid">';
    for (let i = 0; i < 7; i++) {
      const wEn = (typeof window.WEEKDAYS_EN !== 'undefined' && window.WEEKDAYS_EN[i]) || ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i];
      const wAr = (typeof window.WEEKDAYS_AR !== 'undefined' && window.WEEKDAYS_AR[i]) || '';
      const wRom = (typeof window.WEEKDAYS_ROM !== 'undefined' && window.WEEKDAYS_ROM[i]) || '';
      cal += `<div class="cal-weekday">${_escD(_tr(wEn, wEn))}<br><span class="cal-weekday ar">${wAr}</span><br><span class="cal-weekday rom">${wRom}</span></div>`;
    }

    for (let i = 0; i < fd; i++) cal += '<div class="cal-day empty"></div>';

    for (let d = 1; d <= dim; d++) {
      const dk = today(new Date(window.calViewYear, window.calViewMonth, d));
      const log = S.log[dk];
      const cnt = log ? Object.values(log.p || {}).filter(v => v).length : 0;
      let cls = cnt >= 5 ? 'good' : (cnt > 0 ? 'ok' : (dk < tk && log ? 'bad' : ''));
      if (dk === tk) cls += ' now';

      const h = (typeof gregorianToHijri === "function") ? gregorianToHijri(window.calViewYear, window.calViewMonth + 1, d) : ((typeof window !== "undefined" && typeof window.gregorianToHijri === "function") ? window.gregorianToHijri(window.calViewYear, window.calViewMonth + 1, d) : { day: d, month: 1, year: 1448 });
      const hDay = (h && h.day) || d;

      cal += `<div class="cal-day ${cls}"><span class="g-date iq-tabular">${_fmtN(d)}</span><span class="h-date iq-tabular">${_fmtN(hDay)}</span></div>`;
    }
    cal += '</div>';

    cal += '<div class="cal-legend">';
    cal += `<div class="cal-legend-item"><div class="cal-legend-dot" style="background:var(--green);"></div>${_escD(_tr('5 prayers', '5 prayers'))}</div>`;
    cal += `<div class="cal-legend-item"><div class="cal-legend-dot" style="background:var(--orange);"></div>${_escD(_tr('Some prayers', 'Some prayers'))}</div>`;
    cal += `<div class="cal-legend-item"><div class="cal-legend-dot" style="background:var(--red);"></div>${_escD(_tr('Missed', 'Missed'))}</div>`;
    cal += `<div class="cal-legend-item"><div class="cal-legend-dot" style="background:var(--accent);"></div>${_escD(_tr('Today', 'Today'))}</div>`;
    cal += '</div>';

    document.getElementById('calArea').innerHTML = cal;
    document.getElementById('statArea').innerHTML = '';
    if (typeof window.renderGarden === 'function') window.renderGarden();
  }

  // ── Profile ──
  function renderProfile() {
    const achCnt = Object.keys(S.ua || {}).length;
    const avatar = _escD(S.avatar || '');
    const joinDate = S.joinDate ? new Date(S.joinDate).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : null;
    const esc = _escD;
    const curLang = (S && S.lang) || 'en';
    const curTheme = (S && S.theme) || 'light';
    const curNum = (S && S.numerals) || 'auto';
    const curBnTerm = (S && S.bnTermMode) || 'namaz';
    const curScale = (S && typeof S.scriptScale === 'number') ? S.scriptScale : 1;
    const curHijriOff = (S && typeof S.hijriOffset === 'number') ? S.hijriOffset : 0;
    const notifPrefs = (S && S.notificationSettings) || { prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, quietStart: '22:30', quietEnd: '04:30', quietEnabled: true };

    let h = '<div class="section-title">' + esc(_tr('Profile', 'Profile')) + '</div>';

    h += `<div class="profile-identity">
      <div class="profile-avatar-wrap" role="button" tabindex="0" aria-label="${esc(_tr('Change avatar', 'Change avatar'))}" onclick="App.toggleAvatarPicker()">
        <span class="profile-avatar">${avatar || iqIcon('user')}</span>
      </div>
      <div class="profile-info">
        <h2 class="profile-name">${esc(currentUser === 'default' ? _tr('Guest', 'Guest') : currentUser)}</h2>
        <div class="profile-level iq-tabular">${esc(_tr('Level', 'Level'))} ${_fmtN(S.lv)} &middot; ${esc(_tr(lvTitle(S.lv), lvTitle(S.lv)))}</div>
        ${joinDate ? `<div class="profile-join">${esc(_tr('Member since', 'Member since'))} ${esc(joinDate)}</div>` : ''}
      </div>
    </div>`;

    h += '<div class="profile-stats">';
    h += `<div class="stat-card"><div class="stat-num iq-tabular">${_fmtN(S.xp)}</div><div class="stat-label">${esc(_tr('Total XP', 'Total XP'))}</div></div>`;
    h += `<div class="stat-card"><div class="stat-num iq-tabular">${_fmtN(S.tp)}</div><div class="stat-label">${esc(_tr('Prayers', 'Prayers'))}</div></div>`;
    h += `<div class="stat-card"><div class="stat-num iq-tabular">${_fmtN(S.cs)}</div><div class="stat-label">${esc(_tr('Streak', 'Streak'))}</div></div>`;
    const achIconHtml = typeof window.renderAchievementIcon === 'function' ? window.renderAchievementIcon('achievements') : iqIcon('trophy');
    h += `<div class="stat-card"><div class="stat-icon">${achIconHtml}</div><div class="stat-num iq-tabular">${_fmtN(achCnt)}</div><div class="stat-label">${esc(_tr('Achievements', 'Achievements'))}</div></div>`;
    h += '</div>';

    h += `<div class="profile-section"><h3 class="showcase-heading">${achIconHtml} ${esc(_tr('Achievement Showcase', 'Achievement Showcase'))}</h3><div id="achievementShowcase"></div></div>`;

    h += `<div class="section-title">${iqIcon('settings')} ${esc(_tr('Settings & Preferences', 'Settings & Preferences'))}</div>`;
    h += '<div class="profile-settings">';

    // 1. Language, Glossary & Numerals
    h += '<div class="iq-setting-row">';
    h += `<div class="iq-setting-label"><span>${iqIcon('globe')} ${esc(_tr('Language & Script', 'Language & Script'))}</span></div>`;
    h += '<div class="iq-seg-group" role="group" aria-label="Language">';
    h += `<button type="button" class="iq-seg-btn${curLang === 'en' ? ' active' : ''}" onclick="App.iqSetLanguage && App.iqSetLanguage('en')">English</button>`;
    h += `<button type="button" class="iq-seg-btn${curLang === 'bn' ? ' active' : ''}" onclick="App.iqSetLanguage && App.iqSetLanguage('bn')">বাংলা (Bangla)</button>`;
    h += `<button type="button" class="iq-seg-btn${curLang === 'ar' ? ' active' : ''}" onclick="App.iqSetLanguage && App.iqSetLanguage('ar')">العربية (Arabic)</button>`;
    h += '</div>';
    h += `<div class="iq-setting-label" style="margin-top:12px;"><span>${esc(_tr('Bangla Glossary Terms', 'Bangla Glossary Terms'))}</span></div>`;
    h += '<div class="iq-seg-group" role="group" aria-label="Bangla glossary preference">';
    h += `<button type="button" class="iq-seg-btn${curBnTerm === 'namaz' ? ' active' : ''}" onclick="App.iqSetBnTermMode && App.iqSetBnTermMode('namaz')">নামাজ &middot; রোজা (Familiar)</button>`;
    h += `<button type="button" class="iq-seg-btn${curBnTerm === 'salat' ? ' active' : ''}" onclick="App.iqSetBnTermMode && App.iqSetBnTermMode('salat')">সালাত &middot; সিয়াম (Classical)</button>`;
    h += '</div>';
    h += `<div class="iq-setting-label" style="margin-top:12px;"><span>${esc(_tr('Numeral Digits', 'Numeral Digits'))}</span></div>`;
    h += '<div class="iq-seg-group" role="group" aria-label="Digit numerals">';
    [['auto', _tr('Auto', 'Auto')], ['western', '0–9'], ['bangla', '০–৯'], ['arabic', '٠–٩']].forEach(([m, lbl]) => {
      h += `<button type="button" class="iq-seg-btn${curNum === m ? ' active' : ''}" onclick="App.iqSetNumerals && App.iqSetNumerals('${m}')">${esc(lbl)}</button>`;
    });
    h += '</div></div>';

    // 2. Theme, Seasonal Accent, Typography Scale & Calm Audio
    h += '<div class="iq-setting-row">';
    h += `<div class="iq-setting-label"><span>${iqIcon('moon')} ${esc(_tr('Theme & Appearance', 'Theme & Appearance'))}</span></div>`;
    h += '<div class="iq-seg-group" role="group" aria-label="Theme mode">';
    [['light', _tr('Light', 'Light')], ['dark', _tr('Dark', 'Dark')], ['night', _tr('OLED Night', 'OLED Night')], ['system', _tr('System', 'System')]].forEach(([m, lbl]) => {
      h += `<button type="button" class="iq-seg-btn${curTheme === m ? ' active' : ''}" onclick="App.iqSetTheme && App.iqSetTheme('${m}')">${esc(lbl)}</button>`;
    });
    h += '</div>';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;flex-wrap:wrap;">';
    h += `<span style="font-size:0.84rem;font-weight:600;color:var(--text);">${esc(_tr('Seasonal Gold Accent Overlay', 'Seasonal Gold Accent Overlay'))}</span>`;
    h += `<button type="button" class="iq-btn-secondary" onclick="App.iqSetSeasonalAccent && App.iqSetSeasonalAccent(${!S.seasonalAccent})">${esc(_tr(S.seasonalAccent ? 'On' : 'Off', S.seasonalAccent ? 'On' : 'Off'))}</button>`;
    h += '</div>';
    h += `<div class="iq-setting-label" style="margin-top:12px;"><span>${esc(_tr('Script & UI Text Scale', 'Script & UI Text Scale'))}</span><span class="iq-tabular">${_fmtN(Math.round(curScale * 100))}%</span></div>`;
    h += '<div class="iq-seg-group" role="group" aria-label="Text scale">';
    [0.9, 1, 1.15, 1.3].forEach((sc) => {
      h += `<button type="button" class="iq-seg-btn${Math.abs(curScale - sc) < 0.04 ? ' active' : ''}" onclick="App.iqSetScriptScale && App.iqSetScriptScale(${sc})">${_fmtN(Math.round(sc * 100))}%</button>`;
    });
    h += '</div>';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;flex-wrap:wrap;">';
    h += `<span style="font-size:0.84rem;font-weight:600;color:var(--text);">${esc(_tr('UI Sound Chimes (Calm default: Off)', 'UI Sound Chimes (Calm default: Off)'))}</span>`;
    h += `<button type="button" class="iq-btn-secondary" onclick="App.iqSetSoundEnabled && App.iqSetSoundEnabled(${!S.soundEnabled})">${esc(_tr(S.soundEnabled ? 'Sound On' : 'Muted', S.soundEnabled ? 'Sound On' : 'Muted'))}</button>`;
    h += '</div>';
    h += `<div class="iq-setting-label" style="margin-top:12px;"><span>${esc(_tr('Hijri Crescent Sighting Adjustment', 'Hijri Crescent Sighting Adjustment'))}</span></div>`;
    h += '<div class="iq-seg-group" role="group" aria-label="Hijri offset">';
    [-2, -1, 0, 1, 2].forEach((off) => {
      h += `<button type="button" class="iq-seg-btn${curHijriOff === off ? ' active' : ''}" onclick="App.iqSetHijriOffset && App.iqSetHijriOffset(${off})"><bdi dir="ltr">${off > 0 ? '+' + off : String(off)}d</bdi></button>`;
    });
    h += '</div></div>';

    // 3. Notifications & Quiet Hours
    h += '<div class="iq-setting-row">';
    h += `<div class="iq-setting-label"><span>${iqIcon('bell')} ${esc(_tr('Prayer Reminders & Quiet Hours', 'Prayer Reminders & Quiet Hours'))}</span></div>`;
    h += `<div class="iq-setting-sub">${esc(_tr('Calm, opt-in browser & native local reminders. Respects Quiet Hours', 'Calm, opt-in browser & native local reminders. Respects Quiet Hours'))} (<bdi dir="ltr">${esc(notifPrefs.quietStart || '22:30')}–${esc(notifPrefs.quietEnd || '04:30')}</bdi>).</div>`;
    h += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">';
    h += '<button type="button" class="iq-btn-secondary" onclick="App.toggleNotifications()">' + (S.notificationsEnabled ? iqIcon('bell-off') + ' ' + esc(_tr('Disable Reminders', 'Disable Reminders')) : iqIcon('bell') + ' ' + esc(_tr('Enable Reminders', 'Enable Reminders'))) + '</button>';
    h += '<button type="button" class="iq-btn-secondary" onclick="App.testNotification && App.testNotification()">' + esc(_tr('Send Test Notification', 'Send Test Notification')) + '</button>';
    h += '</div>';
    h += '<div class="iq-seg-group" role="group" aria-label="Prayer notification toggles">';
    ['fajr','dhuhr','asr','maghrib','isha'].forEach((pid) => {
      const enabled = !(notifPrefs.prayers && notifPrefs.prayers[pid] === false);
      const pName = pid.charAt(0).toUpperCase() + pid.slice(1);
      h += `<button type="button" class="iq-seg-btn${enabled ? ' active' : ''}" onclick="App.updateNotifSetting && App.updateNotifSetting('${pid}', ${!enabled})">${esc(_tr(pName, pName))} ${enabled ? '✓' : esc(_tr('Off', 'Off'))}</button>`;
    });
    h += '</div></div>';

    // 4. Privacy & Local Data Control
    const isPinProtected = (function() {
      try {
        const c = JSON.parse(localStorage.getItem('iq_sec_' + currentUser) || '{}');
        return !!c.hasPin;
      } catch(e) { return false; }
    })();

    h += '<div class="iq-privacy-card">';
    h += `<div style="font-weight:700;color:var(--text);margin-bottom:4px;">${iqIcon('shield')} ${esc(_tr('Privacy Dashboard', 'Privacy Dashboard'))}</div>`;
    h += `<p style="margin-bottom:10px;">${esc(_tr('Your worship logs, Rest Mode days (no reason recorded), journals, and streaks never leave this device. Zero analytics SDKs, zero ad trackers. Network requests occur only when you tap Online Hadith collections, streaming Audio, or Quran CDN updates.', 'Your worship logs, Rest Mode days (no reason recorded), journals, and streaks never leave this device. Zero analytics SDKs, zero ad trackers. Network requests occur only when you tap Online Hadith collections, streaming Audio, or Quran CDN updates.'))}</p>`;
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px;">';
    h += '<button type="button" class="iq-btn-secondary" style="border-radius:var(--radius-sm);" onclick="App.exportData()">' + iqIcon('download') + ' ' + esc(_tr('Export JSON', 'Export JSON')) + '</button>';
    h += '<button type="button" class="iq-btn-secondary" style="border-radius:var(--radius-sm);" onclick="App.exportCSVData && App.exportCSVData()">' + iqIcon('download') + ' ' + esc(_tr('Export CSV', 'Export CSV')) + '</button>';
    h += '<button type="button" class="iq-btn-secondary" style="border-radius:var(--radius-sm);" onclick="App.importData()">' + iqIcon('upload') + ' ' + esc(_tr('Restore JSON', 'Restore JSON')) + '</button>';
    h += '</div></div>';

    // 5. Account & Security
    h += '<div class="iq-setting-row">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:8px;flex-wrap:wrap;">';
    h += `<span style="font-weight:700;color:var(--text);">${iqIcon('shield')} ${esc(_tr('Profile', 'Profile'))}: ${esc(currentUser === 'default' ? _tr('Guest', 'Guest') : currentUser)}</span>`;
    h += '<span style="font-size:var(--fs-xs);padding:3px 10px;border-radius:12px;background:' + (isPinProtected ? 'var(--green-bg);color:var(--green);font-weight:700;' : 'var(--accent-bg);color:var(--accent-dark);font-weight:600;') + '">' + esc(_tr(isPinProtected ? 'PIN Protected' : 'Open Local Profile', isPinProtected ? 'PIN Protected' : 'Open Local Profile')) + '</span>';
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;">';
    h += '<button type="button" class="iq-btn-secondary" style="border-radius:var(--radius-sm);" onclick="App.openProfilePicker()">' + iqIcon('users') + ' ' + esc(_tr('Switch Profile', 'Switch Profile')) + '</button>';
    h += '<button type="button" class="iq-btn-secondary" style="border-radius:var(--radius-sm);" onclick="App.openSecuritySettings()">' + iqIcon('shield') + ' ' + esc(_tr(isPinProtected ? 'Change PIN' : 'Set PIN', isPinProtected ? 'Change PIN' : 'Set PIN')) + '</button>';
    if (isPinProtected) {
      h += '<button type="button" class="iq-btn-secondary" style="border-radius:var(--radius-sm);" onclick="App.lockApp()">' + iqIcon('lock') + ' ' + esc(_tr('Lock Now', 'Lock Now')) + '</button>';
    }
    h += '</div></div>';
    h += '<button type="button" class="iq-btn-secondary" style="width:100%;margin-bottom:12px;color:var(--accent-dark);" onclick="App.logout()">' + iqIcon('log-out') + ' ' + esc(_tr('Switch / Lock Session', 'Switch / Lock Session')) + '</button>';
    h += '</div>';

    // 6. Design Gallery, Attributions & Support
    h += '<div class="iq-attribution-card">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px;">';
    h += `<span style="font-weight:700;color:var(--text);">${iqIcon('info')} ${esc(_tr('Sources, Design System & Support', 'Sources, Design System & Support'))}</span>`;
    h += '<span class="iq-num-pill">v2.2 · Noor &amp; Rhythm</span>';
    h += '</div>';
    h += '<p style="font-size:0.8rem;margin-bottom:10px;">Quran Uthmani (Tanzil/KFGQPC), Indo-Pak &amp; Bangla <em>Taisirul Quran</em> (Quran.com API), English <em>Saheeh International</em>, Prayer math (<code dir="ltr">adhan</code> MIT), UI fonts (SIL OFL 1.1). <em>Scholarly accuracy review recommended prior to store binary submission.</em></p>';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px;margin-bottom:10px;">';
    h += '<button type="button" class="iq-btn-secondary" style="border-radius:var(--radius-sm);" onclick="App.openGallery && App.openGallery()">' + iqIcon('sparkles') + ' ' + esc(_tr('Component Gallery', 'Component Gallery')) + '</button>';
    h += '<button type="button" class="iq-btn-secondary" style="border-radius:var(--radius-sm);" onclick="App.openContentErrorModal && App.openContentErrorModal(\'General\')">' + iqIcon('alert-triangle') + ' ' + esc(_tr('Report Content Error', 'Report Content Error')) + '</button>';
    h += '<button type="button" class="iq-btn-secondary" style="border-radius:var(--radius-sm);" onclick="App.openChangelogModal && App.openChangelogModal()">' + iqIcon('book-open') + ' ' + esc(_tr("What's New", "What's New")) + '</button>';
    h += '<a href="privacy.html" target="_blank" rel="noopener noreferrer" class="iq-btn-secondary" style="border-radius:var(--radius-sm);text-decoration:none;">' + iqIcon('shield') + ' ' + esc(_tr('Privacy Policy', 'Privacy Policy')) + '</a>';
    h += '</div></div>';

    h += `<div class="danger-zone"><h3 style="color:var(--red)">${iqIcon('alert-triangle')} ${esc(_tr('Danger Zone', 'Danger Zone'))}</h3><p style="font-size:0.8rem;color:var(--text2);margin-bottom:10px;">${esc(_tr('Reset clears this profile; Delete All wipes every local key and offline database on this device.', 'Reset clears this profile; Delete All wipes every local key and offline database on this device.'))}</p><div style="display:flex;gap:8px;flex-wrap:wrap;"><button type="button" class="danger-btn" style="flex:1 1 160px;" onclick="App.resetAll()">${iqIcon('trash')} ${esc(_tr('Reset Profile', 'Reset Profile'))}</button><button type="button" class="danger-btn" style="flex:1 1 160px;" onclick="App.deleteAllUserData && App.deleteAllUserData()">${iqIcon('trash')} ${esc(_tr('Delete All Data', 'Delete All Data'))}</button></div></div>`;

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
    const menuLbl = document.getElementById('iqMenuBtnLabel');
    if (menuLbl) menuLbl.textContent = _tr('All Sections', 'All Sections');
    if (lv) lv.textContent = `${_tr('Lv', 'Lv')} ${_fmtN(S.lv)}`;
    if (title) title.textContent = _tr(lvTitle(S.lv), lvTitle(S.lv));
    if (xp) {
      const zapImg = typeof iqIcon === 'function' ? iqIcon('zap') : '⚡';
      xp.innerHTML = zapImg + '<bdi dir="ltr">' + _fmtN(S.xp || 0) + ' XP</bdi>';
    }
    if (streak) {
      const flameImg = typeof iqIcon === 'function' ? iqIcon('flame') : '🔥';
      streak.innerHTML = flameImg + '<span>' + _fmtN(S.cs || 0) + '</span>';
    }
    if (typeof window.renderIqFeed === 'function') {
      try { window.renderIqFeed(); } catch (e) {}
    }
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
    if (typeof S === 'object' && S) { S.quranLastRead = { surah: surah, ayah: verse }; saveState(); }
    if (typeof window.grantDailyXp === 'function') window.grantDailyXp(1, 'quranverse|' + surah + '|' + verse);
    quranPlayingVerse = verse;
    quranPlayingSurah = surah;
    quranAudio.play().catch(()=>{});
    quranAudio.onended = () => { quranPlayingVerse = null; quranPlayingSurah = null; updateAudioButtons(); };
    updateAudioButtons();
  }

  function _syncQuranAudioBar() {
    if (typeof document === 'undefined' || !document.body) return;
    let bar = document.getElementById('iqQuranAudioBar');
    if (!quranPlayingSurah || !quranPlayingVerse) {
      if (bar) { bar.style.display = 'none'; bar.classList.remove('active'); }
      return;
    }
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'iqQuranAudioBar';
      bar.className = 'iq-audio-bar';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', 'Quran Recitation Player');
      document.body.appendChild(bar);
    }
    const sMeta = (typeof QURAN_SURAHS !== 'undefined') ? QURAN_SURAHS.find(x => x.n === quranPlayingSurah) : null;
    const sLabel = sMeta ? sMeta.en : ('Surah ' + quranPlayingSurah);
    const isPlaying = !!(quranAudio && !quranAudio.paused);
    const canNext = quranPlayMode !== 'none' && quranSurahIdx + 1 < quranSurahQueue.length;
    bar.style.display = 'flex';
    bar.classList.add('active');
    bar.innerHTML =
      '<div class="iq-audio-meta">' +
        '<span class="iq-audio-ico" aria-hidden="true">' + iqIcon('book-open') + '</span>' +
        '<div class="iq-audio-txt">' +
          '<div class="iq-audio-title">' + window.escapeHTML(sLabel) + '</div>' +
          '<div class="iq-audio-sub iq-tabular"><bdi dir="ltr">' + _fmtN(quranPlayingSurah) + ':' + _fmtN(quranPlayingVerse) + '</bdi> &middot; ' + window.escapeHTML(_tr(isPlaying ? 'Reciting' : 'Paused', isPlaying ? 'Reciting' : 'Paused')) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="iq-audio-actions">' +
        '<button type="button" class="iq-audio-btn" onclick="window._toggleAudioBarPlayback && window._toggleAudioBarPlayback()" aria-label="' + (isPlaying ? 'Pause recitation' : 'Resume recitation') + '">' + (isPlaying ? '⏸' : '▶') + '</button>' +
        (canNext ? '<button type="button" class="iq-audio-btn" onclick="window._nextAudioQueue && window._nextAudioQueue()" aria-label="Next verse">&#9197;</button>' : '') +
        '<button type="button" class="iq-audio-btn iq-audio-close" onclick="App.stopSurah()" aria-label="Close audio player">&#10005;</button>' +
      '</div>';
  }
  window._toggleAudioBarPlayback = function() {
    if (!quranAudio) return;
    if (quranAudio.paused) { quranSurahPaused = false; quranAudio.play().catch(()=>{}); }
    else { quranSurahPaused = true; quranAudio.pause(); }
    updateAudioButtons();
    updateSurahButton();
    updateJuzButton();
  };
  window._nextAudioQueue = function() {
    if (quranPlayMode !== 'none' && quranSurahIdx + 1 < quranSurahQueue.length) {
      quranSurahIdx++;
      _playQueueItem();
    }
  };

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
    _syncQuranAudioBar();
  }

  window._toggleQuranVerseBookmark = function(surahNum, verseNum, btnEl) {
    const bid = 'q:' + surahNum + ':' + verseNum;
    if (typeof window.toggleBookmark === 'function') window.toggleBookmark(bid);
    else if (window.App && typeof window.App.toggleBookmark === 'function') window.App.toggleBookmark(bid);
    const active = (typeof window.isBookmarked === 'function' && window.isBookmarked(bid)) ||
      (typeof S === 'object' && S && Array.isArray(S.bookmarks) && S.bookmarks.indexOf(bid) !== -1);
    if (active && typeof S === 'object' && S) {
      S.quranLastRead = { surah: surahNum, ayah: verseNum };
      if (typeof saveState === 'function') saveState();
    }
    if (btnEl && btnEl.classList) {
      btnEl.classList.toggle('active', active);
      btnEl.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    if (quranViewMode === 'bookmarks' && quranCurrentSurah === null && quranCurrentJuz === null) {
      renderQuran();
    }
  };

  var QURAN_PREFS_KEY = 'iq_quran_prefs';
  function _getQuranPrefs() {
    var def = { lastSurah: null, fontScale: 1, tint: 'light' };
    try {
      var raw = typeof localStorage !== 'undefined' ? localStorage.getItem(QURAN_PREFS_KEY) : null;
      if (!raw) return def;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return def;
      var scale = Number(parsed.fontScale);
      var tint = parsed.tint === 'sepia' || parsed.tint === 'night' ? parsed.tint : 'light';
      var lastSurah = Number.isInteger(parsed.lastSurah) && parsed.lastSurah >= 1 && parsed.lastSurah <= 114 ? parsed.lastSurah : null;
      return {
        lastSurah: lastSurah,
        fontScale: Number.isFinite(scale) ? Math.min(1.5, Math.max(0.85, scale)) : 1,
        tint: tint
      };
    } catch (e) {
      return def;
    }
  }
  function _saveQuranPrefs(patch) {
    var next = Object.assign(_getQuranPrefs(), patch || {});
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(QURAN_PREFS_KEY, JSON.stringify(next));
    } catch (e) {}
    return next;
  }
  function adjustQuranFont(delta) {
    var cur = _getQuranPrefs();
    var step = Number(delta) || 0;
    var nextScale = Math.min(1.5, Math.max(0.85, Number((cur.fontScale + step).toFixed(2))));
    _saveQuranPrefs({ fontScale: nextScale });
    renderQuran();
  }
  function setQuranTint(tint) {
    var valid = tint === 'sepia' || tint === 'night' ? tint : 'light';
    _saveQuranPrefs({ tint: valid });
    renderQuran();
  }
  function _applyQuranSanctuaryHost(el, prefs) {
    if (!el) return;
    if (el.dataset) el.dataset.quranTint = prefs.tint;
    if (el.style && typeof el.style.setProperty === 'function') {
      el.style.setProperty('--iq-quran-scale', String(prefs.fontScale));
    }
  }
  function _renderKhatamCard() {
    var kg = (S && S.khatamGoal) ? S.khatamGoal : { targetDays: 30, pagesRead: 0 };
    var pages = Math.max(0, Math.min(604, kg.pagesRead || 0));
    var days = Math.max(7, kg.targetDays || 30);
    var perDay = Math.ceil((604 - pages) / Math.max(1, days));
    var pct = Math.round((pages / 604) * 100);
    return '<div class="iq-khatam-bar-wrap">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">' +
        '<strong style="font-size:0.88rem;color:var(--text);">' + window.escapeHTML(_tr('Khatam Planner', 'Khatam Planner')) + ' &middot; <span class="iq-tabular">' + _fmtN(pages) + ' / ' + _fmtN(604) + '</span> ' + window.escapeHTML(_tr('pages', 'pages')) + ' (<span class="iq-tabular">' + _fmtN(pct) + '%</span>)</strong>' +
        '<span class="iq-tabular" style="font-size:0.78rem;color:var(--text2);">~' + _fmtN(perDay) + ' ' + window.escapeHTML(_tr('pg/day', 'pg/day')) + ' (' + _fmtN(days) + window.escapeHTML(_tr('d', 'd')) + ')</span>' +
      '</div>' +
      '<div class="iq-dual-bar" style="margin-bottom:10px;"><div class="iq-dual-teal" style="width:' + pct + '%"></div></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button type="button" class="iq-btn-secondary" style="padding:8px 14px;min-height:44px;min-width:44px;font-size:0.8rem;" onclick="App.iqLogKhatamPages && App.iqLogKhatamPages(1)"><bdi dir="ltr">+1</bdi> ' + window.escapeHTML(_tr('Page', 'Page')) + '</button>' +
          '<button type="button" class="iq-btn-secondary" style="padding:8px 14px;min-height:44px;min-width:44px;font-size:0.8rem;" onclick="App.iqLogKhatamPages && App.iqLogKhatamPages(5)"><bdi dir="ltr">+5</bdi> ' + window.escapeHTML(_tr('Pages', 'Pages')) + '</button>' +
        '</div>' +
        '<select aria-label="Khatam target days" class="iq-pt-select" style="width:auto;min-height:44px;padding:6px 12px;font-size:0.8rem;" onchange="App.iqSetKhatamGoal && App.iqSetKhatamGoal(this.value)">' +
          [15, 30, 60, 90].map(function(d){ return '<option value="' + d + '"' + (days === d ? ' selected' : '') + '>' + _fmtN(d) + ' ' + window.escapeHTML(_tr('days', 'days')) + '</option>'; }).join('') +
        '</select>' +
      '</div>' +
    '</div>';
  }

  function _renderQuranSanctuaryBar(prefs) {
    var pct = Math.round((prefs.fontScale || 1) * 100);
    var qScript = (S && S.quranScript) || 'uthmani';
    var qTr = (S && S.quranTranslation) || 'en';
    return '<div class="iq-quran-toolbar" role="toolbar" aria-label="Quran reading appearance">' +
      '<div class="iq-quran-tool-group" aria-label="' + window.escapeHTML(_tr('Text scale', 'Text scale')) + '">' +
        '<button type="button" class="iq-quran-tool-btn" onclick="App.adjustQuranFont(-0.1)" aria-label="Decrease Arabic font size">A&minus;</button>' +
        '<span class="iq-quran-scale-label iq-tabular">' + _fmtN(pct) + '%</span>' +
        '<button type="button" class="iq-quran-tool-btn" onclick="App.adjustQuranFont(0.1)" aria-label="Increase Arabic font size">A+</button>' +
      '</div>' +
      '<div class="iq-quran-tint-group" role="group" aria-label="' + window.escapeHTML(_tr('Reading theme', 'Reading theme')) + '">' +
        '<button type="button" class="iq-quran-tint-btn' + (prefs.tint === 'light' ? ' active' : '') + '" data-tint="light" aria-pressed="' + (prefs.tint === 'light') + '" onclick="App.setQuranTint(\'light\')">' + window.escapeHTML(_tr('Light', 'Light')) + '</button>' +
        '<button type="button" class="iq-quran-tint-btn' + (prefs.tint === 'sepia' ? ' active' : '') + '" data-tint="sepia" aria-pressed="' + (prefs.tint === 'sepia') + '" onclick="App.setQuranTint(\'sepia\')">' + window.escapeHTML(_tr('Sepia', 'Sepia')) + '</button>' +
        '<button type="button" class="iq-quran-tint-btn' + (prefs.tint === 'night' ? ' active' : '') + '" data-tint="night" aria-pressed="' + (prefs.tint === 'night') + '" onclick="App.setQuranTint(\'night\')">' + window.escapeHTML(_tr('Night', 'Night')) + '</button>' +
      '</div>' +
      '<div class="iq-quran-tint-group" role="group" aria-label="' + window.escapeHTML(_tr('Script', 'Script')) + '">' +
        '<button type="button" class="iq-quran-tint-btn' + (qScript === 'uthmani' ? ' active' : '') + '" onclick="App.iqSetQuranScript && App.iqSetQuranScript(\'uthmani\')">' + window.escapeHTML(_tr('Uthmani', 'Uthmani')) + '</button>' +
        '<button type="button" class="iq-quran-tint-btn' + (qScript === 'indopak' ? ' active' : '') + '" onclick="App.iqSetQuranScript && App.iqSetQuranScript(\'indopak\')">' + window.escapeHTML(_tr('Indo-Pak', 'Indo-Pak')) + '</button>' +
      '</div>' +
      '<div class="iq-quran-tint-group" role="group" aria-label="' + window.escapeHTML(_tr('Translation', 'Translation')) + '">' +
        '<button type="button" class="iq-quran-tint-btn' + (qTr === 'en' ? ' active' : '') + '" onclick="App.iqSetQuranTranslation && App.iqSetQuranTranslation(\'en\')">EN</button>' +
        '<button type="button" class="iq-quran-tint-btn' + (qTr === 'bn' ? ' active' : '') + '" onclick="App.iqSetQuranTranslation && App.iqSetQuranTranslation(\'bn\')">বাংলা</button>' +
        '<button type="button" class="iq-quran-tint-btn' + (qTr === 'both' ? ' active' : '') + '" onclick="App.iqSetQuranTranslation && App.iqSetQuranTranslation(\'both\')">EN+বাংলা</button>' +
      '</div>' +
    '</div>';
  }

  function _toArabicDigits(n) {
    return String(n == null ? '' : n).replace(/[0-9]/g, function(d) { return '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'[Number(d)]; });
  }

  function _getBookmarkAyahs() {
    const list = (typeof S === 'object' && S && Array.isArray(S.bookmarks)) ? S.bookmarks : [];
    const out = [];
    list.forEach(function(id) {
      const m = /^q:(\d+):(\d+)$/.exec(String(id || ''));
      if (m) out.push({ id: id, surah: parseInt(m[1], 10), ayah: parseInt(m[2], 10) });
    });
    return out;
  }

  function _renderBookmarkAyahsCardList(el, prefs) {
    const saved = _getBookmarkAyahs();
    const backBtn = '<button type="button" class="quran-back-btn" onclick="App.setQuranView(\'surah\')"><span class="iq-mirror-icon">◀</span> ' + window.escapeHTML(_tr('Back to Surahs', 'Back to Surahs')) + '</button>';
    if (!saved.length) {
      el.innerHTML = backBtn +
        '<div class="empty-state">' +
          '<div class="empty-state-icon">' + iqIcon('bookmark') + '</div>' +
          '<div class="empty-state-title">' + window.escapeHTML(_tr('No bookmarked ayahs yet', 'No bookmarked ayahs yet')) + '</div>' +
          '<div class="empty-state-desc">' + window.escapeHTML(_tr('Open any Surah and tap the bookmark button on any ayah to save it here.', 'Open any Surah and tap the bookmark button on any ayah to save it here.')) + '</div>' +
          '<button type="button" class="empty-state-btn" onclick="App.setQuranView(\'surah\')">' + window.escapeHTML(_tr('Browse Surahs', 'Browse Surahs')) + '</button>' +
        '</div>';
      return;
    }
    if (typeof QURAN_POOL === 'undefined') {
      el.innerHTML = '<div class="quran-loading">' + window.escapeHTML(_tr('Loading saved ayahs…', 'Loading saved ayahs…')) + '</div>';
      window.App.ensureQuranLoaded().then(() => renderQuran()).catch(() => {});
      return;
    }
    const qScript = (S && S.quranScript) || 'uthmani';
    const qTr = (S && S.quranTranslation) || 'en';
    let html = '<div class="quran-header"><h2>' + iqIcon('bookmark') + ' ' + window.escapeHTML(_tr('Bookmarked Verses', 'Bookmarked Verses')) + '</h2><div class="quran-sub iq-tabular">' + _fmtN(saved.length) + ' ' + window.escapeHTML(_tr('saved', 'saved')) + '</div></div>';
    html += '<div class="tab-bar-quran" style="display:flex;justify-content:center;gap:6px;margin:0 auto 10px;">';
    html += `<button type="button" onclick="App.setQuranView('surah')">${window.escapeHTML(_tr('Surahs', 'Surahs'))}</button>`;
    html += `<button type="button" onclick="App.setQuranView('juz')">${window.escapeHTML(_tr('Juz', 'Juz'))}</button>`;
    html += `<button type="button" class="active" onclick="App.setQuranView('bookmarks')">${iqIcon('bookmark')} ${window.escapeHTML(_tr('Bookmarks', 'Bookmarks'))} (${_fmtN(saved.length)})</button>`;
    html += '</div>';
    html += saved.map(function(item) {
      const sMeta = QURAN_SURAHS.find(x => x.n === item.surah);
      const refStr = item.surah + ':' + item.ayah;
      const v = QURAN_POOL.find(x => x.source && x.source.indexOf(refStr) !== -1 && new RegExp('(?:^|\\D)' + item.surah + ':' + item.ayah + '(?:$|\\D)').test(x.source));
      const gIdx = globalAyahOf(item.surah, item.ayah) - 1;
      const arText = v ? ((qScript === 'indopak' && window.QURAN_INDOPAK_POOL && window.QURAN_INDOPAK_POOL[gIdx]) ? window.QURAN_INDOPAK_POOL[gIdx] : v.arabic) : '';
      const bnText = (window.QURAN_BN_POOL && window.QURAN_BN_POOL[gIdx]) ? window.QURAN_BN_POOL[gIdx] : '';
      return `<div class="verse-card quran-sanctuary-card">
        <div class="verse-bmk-head">
          <button type="button" class="iq-text-btn" onclick="App.openQuranSurah(${item.surah})">${window.escapeHTML(sMeta ? sMeta.en : ('Surah ' + item.surah))} &middot; <bdi dir="ltr">${_fmtN(item.surah)}:${_fmtN(item.ayah)}</bdi></button>
        </div>
        ${arText ? `<div class="verse-arabic" dir="rtl" data-script="quran">${arText} <span class="iq-ayah-end" dir="rtl">&#x06DD;${_toArabicDigits(item.ayah)}</span></div>` : ''}
        ${v && (qTr === 'en' || qTr === 'both') ? `<div class="verse-english">${window.escapeHTML(v.english || '')}</div>` : ''}
        ${v && (qTr === 'bn' || qTr === 'both') && bnText ? `<div class="verse-english iq-script-bn" lang="bn" style="margin-top:6px;">${window.escapeHTML(bnText)}</div>` : ''}
        <div class="verse-actions">
          <button type="button" class="iq-verse-bmk-btn active" aria-pressed="true" aria-label="Remove bookmark ${refStr}" onclick="window._toggleQuranVerseBookmark(${item.surah},${item.ayah},this)">${iqIcon('bookmark')}</button>
          <button type="button" class="verse-play-btn" data-surah="${item.surah}" data-verse="${item.ayah}" onclick="App.playQuranVerse(${item.surah},${item.ayah})" aria-label="Play verse ${refStr}">▶</button>
        </div>
      </div>`;
    }).join('');
    el.innerHTML = html;
  }

  function renderQuran() {
    const el = document.getElementById('quranArea');
    if (!el || typeof QURAN_SURAHS === 'undefined') return;
    const prefs = _getQuranPrefs();
    _applyQuranSanctuaryHost(el, prefs);

    if (quranCurrentSurah !== null) {
      renderQuranSurah(el, quranCurrentSurah);
      return;
    }
    if (quranCurrentJuz !== null) {
      renderQuranJuz(el, quranCurrentJuz);
      return;
    }
    if (quranViewMode === 'bookmarks') {
      _renderBookmarkAyahsCardList(el, prefs);
      return;
    }

    const lastReadObj = (typeof S === 'object' && S && S.quranLastRead && S.quranLastRead.surah) ? S.quranLastRead : null;
    const resumeSurahNum = (lastReadObj && lastReadObj.surah) || prefs.lastSurah;
    const savedBookmarks = _getBookmarkAyahs();

    let html = '<div class="quran-header iq-mushaf-plaque"><h2>' + iqIcon('book-open') + ' ' + window.escapeHTML(_tr('The Noble Quran', 'The Noble Quran')) + '</h2><div class="quran-sub">' + _fmtN(114) + ' ' + window.escapeHTML(_tr('Surahs', 'Surahs')) + ' &middot; ' + window.escapeHTML(_tr('Tap a surah to enter reading sanctuary', 'Tap a surah to enter reading sanctuary')) + '</div></div>';
    if (resumeSurahNum) {
      const lastS = QURAN_SURAHS.find(x => x.n === resumeSurahNum);
      if (lastS) {
        const ayahPart = (lastReadObj && lastReadObj.ayah) ? (' · ' + window.escapeHTML(_tr('Ayah', 'Ayah')) + ' ' + _fmtN(lastReadObj.ayah)) : '';
        html += `<div class="iq-quran-continue-card" role="button" tabindex="0" onclick="App.openQuranSurah(${lastS.n})">
          <div><div class="iq-qc-eyebrow">${window.escapeHTML(_tr('Continue Reading', 'Continue Reading'))}</div><div class="iq-qc-title"><span class="iq-tabular">${_fmtN(lastS.n)}</span>. ${lastS.en} &middot; <span class="iq-qc-ar">${lastS.ar}</span></div><div class="iq-qc-meta iq-tabular">${_fmtN(lastS.ay)} ${window.escapeHTML(_tr('verses', 'verses'))}${ayahPart} &middot; ${window.escapeHTML(_tr(lastS.type, lastS.type))}</div></div>
          <span class="iq-pill-btn">${window.escapeHTML(_tr('Resume', 'Resume'))} <span class="iq-mirror-icon">&rsaquo;</span></span>
        </div>`;
      }
    }
    html += _renderKhatamCard();
    html += _renderQuranSanctuaryBar(prefs);
    html += '<div class="tab-bar-quran" style="display:flex;justify-content:center;gap:6px;margin:0 auto 10px;flex-wrap:wrap;">';
    html += `<button type="button" class="${quranViewMode==='surah'?'active':''}" onclick="App.setQuranView('surah')">${window.escapeHTML(_tr('Surahs', 'Surahs'))}</button>`;
    html += `<button type="button" class="${quranViewMode==='juz'?'active':''}" onclick="App.setQuranView('juz')">${window.escapeHTML(_tr('Juz', 'Juz'))}</button>`;
    html += `<button type="button" class="${quranViewMode==='bookmarks'?'active':''}" onclick="App.setQuranView('bookmarks')">${iqIcon('bookmark')} ${window.escapeHTML(_tr('Bookmarks', 'Bookmarks'))}${savedBookmarks.length ? ' (' + _fmtN(savedBookmarks.length) + ')' : ''}</button>`;
    html += '</div>';
    html += '<div style="display:flex;justify-content:center;width:100%;margin-bottom:10px;"><input class="quran-search" style="max-width:560px;" placeholder="' + window.escapeHTML(_tr('Search surah name...', 'Search surah name...')) + '" oninput="App.quranSearchFilter(this.value)"></div>';

    if (quranViewMode === 'juz') {
      html += '<div class="juz-grid">';
      QURAN_JUZ.forEach(j => {
        html += `<div class="juz-card" onclick="App.openQuranJuz(${j.n})"><div style="font-weight:700;color:var(--accent-dark);">${window.escapeHTML(_tr('Juz', 'Juz'))} ${_fmtN(j.n)}</div><div style="font-size:0.72rem;color:var(--text2);margin-top:3px;">${j.name}</div></div>`;
      });
      html += '</div>';
    } else {
      const filtered = QURAN_SURAHS.filter(s => !quranSearchTerm || s.en.toLowerCase().includes(quranSearchTerm.toLowerCase()) || s.ar.includes(quranSearchTerm));
      html += '<div class="surah-grid">';
      filtered.forEach(s => {
        html += `<div class="surah-card" onclick="App.openQuranSurah(${s.n})">
          <div class="surah-num iq-tabular">#${_fmtN(s.n)}</div>
          <div class="surah-name-ar">${s.ar}</div>
          <div class="surah-name-en">${s.en}</div>
          <div class="surah-meta iq-tabular">${_fmtN(s.ay)} ${window.escapeHTML(_tr('verses', 'verses'))} &middot; ${window.escapeHTML(_tr(s.type, s.type))}</div>
        </div>`;
      });
      html += '</div>';
    }
    el.innerHTML = html;
  }

  function renderQuranSurah(el, surahNum) {
    const prefs = _getQuranPrefs();
    _applyQuranSanctuaryHost(el, prefs);
    const needIndo = (S && S.quranScript === 'indopak' && typeof window.QURAN_INDOPAK_POOL === 'undefined');
    const needBn = (S && (S.quranTranslation === 'bn' || S.quranTranslation === 'both') && typeof window.QURAN_BN_POOL === 'undefined');
    if (typeof QURAN_POOL === 'undefined' || needIndo || needBn) {
      el.innerHTML = '<div class="quran-loading">' + window.escapeHTML(_tr('Loading Quran script & translation…', 'Loading Quran script & translation…')) + '</div>';
      const jobs = [window.App.ensureQuranLoaded()];
      if (needIndo && window.App.ensureQuranIndoPakLoaded) jobs.push(window.App.ensureQuranIndoPakLoaded());
      if (needBn && window.App.ensureQuranBanglaLoaded) jobs.push(window.App.ensureQuranBanglaLoaded());
      Promise.all(jobs)
        .then(() => renderQuranSurah(el, surahNum))
        .catch(() => { el.innerHTML = '<div class="quran-loading">Couldn\'t load verses — check your local files or connection and retry.</div>'; });
      return;
    }
    const s = QURAN_SURAHS.find(x => x.n === surahNum);
    if (!s) { quranCurrentSurah = null; renderQuran(); return; }
    const qScript = (S && S.quranScript) || 'uthmani';
    const qTr = (S && S.quranTranslation) || 'en';
    const isOffline = (typeof navigator !== 'undefined' && navigator.onLine === false);
    let html = '<button type="button" class="quran-back-btn" onclick="App.quranBack()"><span class="iq-mirror-icon">◀</span> ' + window.escapeHTML(_tr('Back to Surahs', 'Back to Surahs')) + '</button>';
    html += `<div class="quran-header iq-mushaf-plaque"><h2>${s.ar}</h2><div style="font-family:var(--iq-font-quran);font-size:1.3rem;color:var(--accent-dark);margin:4px 0;">${s.en}</div><div class="quran-sub iq-tabular">${_fmtN(s.ay)} ${window.escapeHTML(_tr('verses', 'verses'))} &middot; ${window.escapeHTML(_tr(s.type, s.type))}</div></div>`;
    html += _renderQuranSanctuaryBar(prefs);
    html += `<div style="display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0 12px;"><button type="button" id="surahPlayBtn" class="surah-play-btn" style="min-height:44px;" onclick="App.playSurah(${surahNum})">&#9654; ${window.escapeHTML(_tr('Play Surah', 'Play Surah'))}</button><button type="button" class="surah-log-btn" style="min-height:44px;" onclick="window.logQuranMinutes && window.logQuranMinutes(5)"><bdi dir="ltr">+5m</bdi> ${window.escapeHTML(_tr('Read', 'Read'))}</button></div>`;
    if (isOffline) html += '<div class="iq-setting-sub" style="text-align:center;">Offline mode: complete Arabic &amp; translation text available offline; audio recitation requires internet connection.</div>';
    const verses = QURAN_POOL.filter(v => {
      if (!v.source) return false;
      const m = v.source.match(/(\d+):(\d+)/);
      return m && parseInt(m[1]) === surahNum;
    });
    if (surahNum !== 1 && surahNum !== 9) {
      html += `<div class="iq-bismillah-banner" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>`;
    }
    if (verses.length === 0) {
      html += `<div class="quran-loading">No local verses available for this surah. ${s.ay} verses total.</div>`;
    } else {
      verses.forEach(v => {
        const m = v.source.match(/(\d+):(\d+)/);
        const vNum = m ? parseInt(m[2], 10) : 1;
        const gIdx = globalAyahOf(surahNum, vNum) - 1;
        const arText = (qScript === 'indopak' && window.QURAN_INDOPAK_POOL && window.QURAN_INDOPAK_POOL[gIdx]) ? window.QURAN_INDOPAK_POOL[gIdx] : v.arabic;
        const bnText = (window.QURAN_BN_POOL && window.QURAN_BN_POOL[gIdx]) ? window.QURAN_BN_POOL[gIdx] : '';
        const bmkId = 'q:' + surahNum + ':' + vNum;
        const isSaved = (typeof S === 'object' && S && Array.isArray(S.bookmarks)) ? S.bookmarks.indexOf(bmkId) !== -1 : false;
        html += `<div class="verse-card quran-sanctuary-card">
          <div class="verse-num">${_fmtN(vNum)}</div>
          <div class="verse-arabic" dir="rtl" data-script="quran">${arText} <span class="iq-ayah-end" dir="rtl">&#x06DD;${_toArabicDigits(vNum)}</span></div>
          ${v.roman ? `<div style="font-size:0.85rem;color:var(--text2);font-style:italic;margin:6px 0;line-height:1.5;">${window.escapeHTML(v.roman)}</div>` : ''}
          ${(qTr === 'en' || qTr === 'both') ? `<div class="verse-english">${window.escapeHTML(v.english || '')}</div>` : ''}
          ${(qTr === 'bn' || qTr === 'both') && bnText ? `<div class="verse-english iq-script-bn" lang="bn" style="margin-top:6px;">${window.escapeHTML(bnText)}</div>` : ''}
          <div class="verse-actions">
            <button type="button" class="iq-verse-bmk-btn${isSaved ? ' active' : ''}" aria-pressed="${isSaved ? 'true' : 'false'}" aria-label="Bookmark verse ${surahNum}:${vNum}" onclick="window._toggleQuranVerseBookmark(${surahNum},${vNum},this)">${iqIcon('bookmark')}</button>
            <button type="button" class="verse-play-btn" data-surah="${surahNum}" data-verse="${vNum}" onclick="App.playQuranVerse(${surahNum},${vNum})" aria-label="Play verse ${vNum}">▶</button>
          </div>
        </div>`;
      });
    }
    html += '<div class="iq-attribution-card" style="font-size:0.78rem;">Sources: Arabic Uthmani (Tanzil / KFGQPC), Indo-Pak (Quran.com), English (Saheeh International), Bangla (Taisirul Quran). <button type="button" class="iq-text-btn" style="padding:2px 6px;min-height:32px;" onclick="App.openContentErrorModal && App.openContentErrorModal(\'Surah ' + surahNum + '\')">Report text issue</button></div>';
    el.innerHTML = html;
    updateAudioButtons();
    updateSurahButton();
  }

  function renderQuranJuz(el, juzNum) {
    const prefs = _getQuranPrefs();
    _applyQuranSanctuaryHost(el, prefs);
    const needIndoJ = (S && S.quranScript === 'indopak' && typeof window.QURAN_INDOPAK_POOL === 'undefined');
    const needBnJ = (S && (S.quranTranslation === 'bn' || S.quranTranslation === 'both') && typeof window.QURAN_BN_POOL === 'undefined');
    if (typeof QURAN_POOL === 'undefined' || needIndoJ || needBnJ) {
      el.innerHTML = '<div class="quran-loading">Loading Quran Juz…</div>';
      const jobs = [window.App.ensureQuranLoaded()];
      if (needIndoJ && window.App.ensureQuranIndoPakLoaded) jobs.push(window.App.ensureQuranIndoPakLoaded());
      if (needBnJ && window.App.ensureQuranBanglaLoaded) jobs.push(window.App.ensureQuranBanglaLoaded());
      Promise.all(jobs)
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

    let html = '<button type="button" class="quran-back-btn" onclick="App.quranBack()"><span class="iq-mirror-icon">◀</span> ' + window.escapeHTML(_tr('Back to Juzes', 'Back to Juzes')) + '</button>';
    html += `<div class="quran-header iq-mushaf-plaque"><h2>${window.escapeHTML(_tr('Juz', 'Juz'))} ${_fmtN(juzNum)} &middot; ${j ? j.name : ''}</h2><div style="font-family:var(--iq-font-quran);font-size:1.2rem;color:var(--accent-dark);margin:4px 0;">${startS.en} <span class="iq-mirror-icon">&rarr;</span> ${endS.en}</div><div class="quran-sub iq-tabular"><bdi dir="ltr">${_fmtN(startS.n)}:${_fmtN(firstLocal)}</bdi> &middot; <bdi dir="ltr">${_fmtN(endS.n)}:${_fmtN(lastLocal)}</bdi> &middot; ${_fmtN(verseCount)} ${window.escapeHTML(_tr('verses', 'verses'))}</div></div>`;
    html += _renderQuranSanctuaryBar(prefs);
    html += `<div style="display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0 12px;"><button type="button" id="juzPlayBtn" class="surah-play-btn" style="min-height:44px;" onclick="App.playJuz(${juzNum})">&#9654; ${window.escapeHTML(_tr('Play Juz', 'Play Juz'))}</button><button type="button" class="surah-log-btn" style="min-height:44px;" onclick="window.logQuranMinutes && window.logQuranMinutes(5)"><bdi dir="ltr">+5m</bdi> ${window.escapeHTML(_tr('Read', 'Read'))}</button></div>`;
    if (startS.n !== 1) { html += `<div class="iq-bismillah-banner" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>`; }

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
      const qScriptJ = (S && S.quranScript) || 'uthmani';
      const qTrJ = (S && S.quranTranslation) || 'en';
      verses.forEach(({ v, surah, ayah }) => {
        const gIdx = globalAyahOf(surah, ayah) - 1;
        const arText = (qScriptJ === 'indopak' && window.QURAN_INDOPAK_POOL && window.QURAN_INDOPAK_POOL[gIdx]) ? window.QURAN_INDOPAK_POOL[gIdx] : v.arabic;
        const bnText = (window.QURAN_BN_POOL && window.QURAN_BN_POOL[gIdx]) ? window.QURAN_BN_POOL[gIdx] : '';
        const bmkId = 'q:' + surah + ':' + ayah;
        const isSaved = (typeof S === 'object' && S && Array.isArray(S.bookmarks)) ? S.bookmarks.indexOf(bmkId) !== -1 : false;
        html += `<div class="verse-card quran-sanctuary-card">
          <div class="verse-num">${_fmtN(surah)}:${_fmtN(ayah)}</div>
          <div class="verse-arabic" dir="rtl" data-script="quran">${arText} <span class="iq-ayah-end" dir="rtl">&#x06DD;${_toArabicDigits(ayah)}</span></div>
          ${v.roman ? `<div style="font-size:0.85rem;color:var(--text2);font-style:italic;margin:6px 0;line-height:1.5;">${window.escapeHTML(v.roman)}</div>` : ''}
          ${(qTrJ === 'en' || qTrJ === 'both') ? `<div class="verse-english">${window.escapeHTML(v.english || '')}</div>` : ''}
          ${(qTrJ === 'bn' || qTrJ === 'both') && bnText ? `<div class="verse-english iq-script-bn" lang="bn" style="margin-top:6px;">${window.escapeHTML(bnText)}</div>` : ''}
          <div class="verse-actions">
            <button type="button" class="iq-verse-bmk-btn${isSaved ? ' active' : ''}" aria-pressed="${isSaved ? 'true' : 'false'}" aria-label="Bookmark verse ${surah}:${ayah}" onclick="window._toggleQuranVerseBookmark(${surah},${ayah},this)">${iqIcon('bookmark')}</button>
            <button type="button" class="verse-play-btn" data-surah="${surah}" data-verse="${ayah}" onclick="App.playQuranVerse(${surah},${ayah})" aria-label="Play verse ${surah}:${ayah}">▶</button>
          </div>
        </div>`;
      });
      html += '<div class="iq-attribution-card" style="font-size:0.78rem;">Sources: Arabic Uthmani (Tanzil / KFGQPC), Indo-Pak (Quran.com), English (Saheeh International), Bangla (Taisirul Quran). <button type="button" class="iq-text-btn" style="padding:2px 6px;min-height:32px;" onclick="App.openContentErrorModal && App.openContentErrorModal(\'Juz ' + juzNum + '\')">Report text issue</button></div>';
    }
    el.innerHTML = html;
    updateAudioButtons();
    updateJuzButton();
  }

  function setTafsirEdition(id) {
    S.tafsirEdition = id;
    saveState();
    renderQuran();
  }

  function setQuranView(mode) { quranViewMode = mode; quranSearchTerm = ''; renderQuran(); }
  var _quranSearchDebounce = null;
  function quranSearchFilter(term) {
    quranSearchTerm = term;
    clearTimeout(_quranSearchDebounce);
    _quranSearchDebounce = setTimeout(function() { renderQuran(); }, 200);
  }
  function openQuranSurah(num) {
    quranCurrentSurah = num;
    quranCurrentJuz = null;
    if (Number.isInteger(num) && num >= 1 && num <= 114) {
      _saveQuranPrefs({ lastSurah: num });
      if (typeof S === 'object' && S) {
        S.quranLastRead = { surah: num, ayah: (S.quranLastRead && S.quranLastRead.surah === num && S.quranLastRead.ayah) || 1 };
        if (typeof saveState === 'function') saveState();
      }
    }
    renderQuran();
  }
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
  const _remoteCols = {};

  function _allCollections() {
    const bundled = (typeof HADITH_COLLECTIONS_DATA !== 'undefined' && Array.isArray(HADITH_COLLECTIONS_DATA)) ? HADITH_COLLECTIONS_DATA : [];
    const remoteMeta = (typeof HadithLibrary !== 'undefined' && Array.isArray(HadithLibrary.REMOTE_COLLECTIONS)) ? HadithLibrary.REMOTE_COLLECTIONS : [];
    return bundled.concat(remoteMeta.map(m => _remoteCols[m.id] || Object.assign({ remotePending: true, remote: true, books: [] }, m)));
  }

  function _findHadith(colId, b, h) {
    const col = _allCollections().find(c => c.id === colId);
    if (!col) return null;
    for (const bk of (col.books || [])) {
      const hit = bk.hadiths.find(x => String(x.h) === String(h) && String(x.b) === String(b));
      if (hit) return { col, hadith: hit };
    }
    return null;
  }

  function hadithSpeak(colId, b, h) {
    const found = _findHadith(colId, b, h);
    if (!found || !found.hadith) return;
    const attempt = () => {
      const cur = _findHadith(colId, b, h);
      const arabic = cur && cur.hadith.a;
      if (!arabic) { toast(iqIcon('music'), 'Arabic text unavailable for this narration', false, 1800); return; }
      const ok = AppAudio.toggleTTS(arabic, S.hadithTTSLang || 'ar');
      if (!ok) toast(iqIcon('music'), 'No Arabic voice installed on this device', false, 2200);
    };
    if (!found.hadith.a) {
      /* _findHadith only matches real hadith entries, so found.col is never a
         remotePending stub (those have empty books). Bundled collections
         (bukhari/muslim/nawawi) backfill Arabic in place via ensureBundledArabic;
         loaded remote cols re-run ensureHadithCollection. */
      const loader = found.col.remote ? HadithLibrary.ensureHadithCollection(colId) : HadithLibrary.ensureBundledArabic(colId);
      loader.then(col => {
        if (col && !_remoteCols[colId] && col.remote) _remoteCols[colId] = col;
        const cur = _findHadith(colId, b, h);
        if (cur && cur.hadith.a && hadithView.level === 'hadiths' && hadithView.collectionId === colId) renderHadith();
        attempt();
      })
        .catch(() => { toast(iqIcon('music'), 'Could not download audio text — check connection', false, 2200); });
      return;
    }
    attempt();
  }

  /* Icon keys verified against data/icons.js: 'scroll' resolves (IQ_CODES 1F4DC);
     'scale' does NOT exist (canonical key is 'scales'), so malik falls back to 'book-open'. */
  function colIconFor(id) {
    return ({ abudawud: 'scroll', tirmidhi: 'scroll', nasai: 'scroll', ibnmajah: 'scroll', malik: 'book-open' })[id] || 'book';
  }

  function renderHadith() {
    const el = document.getElementById('hadithArea');
    if (!el) return;
    const data = _allCollections();

    if (hadithView.level === 'hadiths') {
      const col = data.find(c => c.id === hadithView.collectionId);
      const book = col && col.books.find(b => b.id === hadithView.bookId);
      if (!col || !book) { hadithView = { level: 'collections', collectionId: null, bookId: null }; renderHadith(); return; }
      let html = `<button type="button" class="quran-back-btn" onclick="App.hadithBack()"><span class="iq-mirror-icon">◀</span> ${window.escapeHTML(_tr('Back to', 'Back to'))} ${window.escapeHTML(col.name)}</button>`;
      html += `<div class="quran-header"><h2>${iqIcon(col.icon || colIconFor(col.id))} ${window.escapeHTML(book.name)}</h2><div class="quran-sub iq-tabular">${_fmtN(book.hadiths.length)} ${window.escapeHTML(_tr('hadiths', 'hadiths'))}</div></div>`;
      const escH = window.escapeHTML || ((v) => String(v == null ? '' : v));
      book.hadiths.forEach(h => {
        const hasA = !!h.a;
        html += `<div class="verse-card" style="position:relative;padding-inline-end:52px;">
          <div class="verse-num iq-tabular">${_fmtN(h.n)}</div>
          ${hasA ? `<div dir="rtl" style="font-family:var(--iq-font-ar);font-size:1.25rem;line-height:1.9;color:var(--accent-dark);margin-bottom:10px;">${escH(h.a)}</div>` : ''}
          <div class="verse-english">${escH(h.t)}</div>
          <div class="content-source">${iqIcon('book-open')} ${escH(col.name)} <bdi dir="ltr">${escH(h.b)}:${escH(h.h)}</bdi> <a class="verify-btn" href="https://sunnah.com/${escH(col.id)}/${escH(h.b)}#${escH(h.n)}" target="_blank" rel="noopener noreferrer" title="Verify on sunnah.com">${escH(_tr('Verify', 'Verify'))}</a> <button type="button" class="iq-text-btn" style="padding:4px 8px;min-height:36px;font-size:0.74rem;" onclick="App.openContentErrorModal && App.openContentErrorModal('${escH(col.name)} ${escH(h.b)}:${escH(h.h)}')">${escH(_tr('Report', 'Report'))}</button></div>
          <button type="button" class="sit-fav-btn" aria-label="Listen" title="Listen (Arabic)" style="position:absolute;top:6px;inset-inline-end:6px;min-width:44px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;padding:6px;font-size:1rem;line-height:1;color:var(--accent-dark);" onclick="event.stopPropagation();hadithSpeak('${escH(col.id)}',${Number(h.b)},${Number(h.h)})">${iqIcon('music')}</button>
        </div>`;
      });
      el.innerHTML = html;
      return;
    }

    if (hadithView.level === 'books') {
      const col = data.find(c => c.id === hadithView.collectionId);
      if (!col) { hadithView = { level: 'collections', collectionId: null, bookId: null }; renderHadith(); return; }
      let html = `<button type="button" class="quran-back-btn" onclick="App.hadithBack()"><span class="iq-mirror-icon">◀</span> ${window.escapeHTML(_tr('Back to Collections', 'Back to Collections'))}</button>`;
      html += `<div class="quran-header"><h2>${iqIcon(col.icon || colIconFor(col.id))} ${window.escapeHTML(col.name)}</h2><div class="quran-sub iq-tabular">${_fmtN(col.books.length)} ${window.escapeHTML(_tr('books', 'books'))} &middot; ${_fmtN(col.books.reduce((s, b) => s + b.hadiths.length, 0))} ${window.escapeHTML(_tr('hadiths', 'hadiths'))}</div></div>`;
      html += '<div class="surah-grid">';
      col.books.forEach(book => {
        html += `<div class="surah-card" onclick="App.openHadithBook('${col.id}',${book.id})">
          <div class="surah-num iq-tabular">${iqIcon('book-open')} ${_fmtN(book.id)}</div>
          <div class="surah-name-en">${window.escapeHTML(book.name)}</div>
          <div class="surah-meta iq-tabular">${_fmtN(book.hadiths.length)} ${window.escapeHTML(_tr('hadiths', 'hadiths'))}</div>
        </div>`;
      });
      html += '</div>';
      el.innerHTML = html;
      return;
    }

    let html = '<div class="quran-header"><h2>' + iqIcon('book') + ' ' + window.escapeHTML(_tr('The Hadith Collections', 'The Hadith Collections')) + '</h2><div class="quran-sub">' + window.escapeHTML(_tr('Authentic narrations of the Prophet Muhammad ﷺ', 'Authentic narrations of the Prophet Muhammad ﷺ')) + '</div></div>';
    html += '<div class="surah-grid">';
    _allCollections().forEach(c => {
      const total = (c.books || []).reduce((s, b) => s + b.hadiths.length, 0);
      const pending = !!c.remotePending;
      /* Bundled cols (bukhari/muslim/nawawi) resolve via icon aliases; remote/pending
         ids don't resolve in data/icons.js, so fall back to colIconFor for those. */
      const iconHtml = (c.remote || c.remotePending) ? iqIcon(colIconFor(c.id)) : iqIcon(c.icon || c.id);
      const badge = pending ? '<span class="iq-num-pill">' + window.escapeHTML(_tr('Online', 'Online')) + '</span>' : '';
      html += `<div class="surah-card" onclick="App.openHadithCollection('${c.id}')">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;">
          <div class="surah-num">${iconHtml}</div>${badge}
        </div>
        <div class="surah-name-en">${window.escapeHTML(c.name)}</div>
        <div class="surah-meta iq-tabular">${pending ? window.escapeHTML(_tr('Tap to download', 'Tap to download')) : (_fmtN(c.books.length) + ' ' + window.escapeHTML(_tr('books', 'books')) + ' · ' + _fmtN(total) + ' ' + window.escapeHTML(_tr('hadiths', 'hadiths')))}</div>
        <div style="font-size:0.74rem;color:var(--text2);margin-top:4px;line-height:1.45;">${window.escapeHTML(c.desc)}</div>
      </div>`;
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function openHadithBook(colId, bookId) { hadithView = { level: 'hadiths', collectionId: colId, bookId }; renderHadith(); }

  function openHadithCollection(id) {
    const col = _allCollections().find(c => c.id === id);
    if (col && !col.remotePending) { hadithView = { level: 'books', collectionId: id, bookId: null }; renderHadith(); return; }
    const el = document.getElementById('hadithArea');
    if (el) el.innerHTML = '<div class="quran-header"><h2>' + iqIcon('book') + ' Downloading…</h2><div class="quran-sub">Fetching collection from the online library</div></div>';
    HadithLibrary.ensureHadithCollection(id).then(loaded => {
      if (loaded && loaded.remote) _remoteCols[id] = loaded;
      hadithView = { level: 'books', collectionId: id, bookId: null };
      renderHadith();
    }).catch(() => {
      toast(iqIcon('book'), 'Could not download collection — check connection', false, 2400);
      hadithView = { level: 'collections', collectionId: null, bookId: null };
      renderHadith();
    });
  }

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
  window.renderDeferred = renderDeferred;
  window.markDirty = markDirty;
  window.clearDirty = clearDirty;
  window.renderToday = renderToday;
  window.renderLv = renderLv;
  window.renderStr = renderStr;
  window.renderTopBar = renderTopBar;
  window.renderQ = renderQ;
  window.renderAch = renderAch;
  window.renderProg = renderProg;
  window.renderProfile = renderProfile;
  window.renderStats = renderStats;
  window.renderQuran = renderQuran;
  window.renderHadith = renderHadith;
  window.setQuranView = setQuranView;
  window.quranSearchFilter = quranSearchFilter;
  window.openQuranSurah = openQuranSurah;
  window.quranBack = quranBack;
  window.openQuranJuz = openQuranJuz;
  window.adjustQuranFont = adjustQuranFont;
  window.setQuranTint = setQuranTint;
  window.setTafsirEdition = setTafsirEdition;
  window.openHadithCollection = openHadithCollection;
  window.openHadithBook = openHadithBook;
  window.hadithBack = hadithBack;
  window.hadithSpeak = hadithSpeak;
  window.playQuranVerse = playQuranVerse;
  window.playSurah = playSurah;
  window.stopSurah = stopSurah;
  window.playJuz = playJuz;
  window.updateJuzButton = updateJuzButton;
  window.setQuranReciter = setQuranReciter;
  window.announceToScreenReader = announceToScreenReader;
})();
