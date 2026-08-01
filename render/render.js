(function() {
  // ═══════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════
  function renderDynamic() {
    const pageScroll = window.scrollY;
    const volArea = document.getElementById('volArea');
    const deedArea = document.getElementById('deedArea');
    const questArea = document.getElementById('questArea');
    const challengeArea = document.getElementById('challengeArea');
    
    const volScroll = volArea ? volArea.scrollTop : 0;
    const deedScroll = deedArea ? deedArea.scrollTop : 0;
    const questScroll = questArea ? questArea.scrollTop : 0;
    const challengeScroll = challengeArea ? challengeArea.scrollTop : 0;

    const safe = (fn, name) => { try { fn(); } catch(e) { console.warn('Render ' + name + ' failed:', e.message); } };
    safe(renderLv, 'Lv'); safe(renderStr, 'Str'); safe(renderToday, 'Today'); safe(renderQ, 'Q'); safe(renderChallenges, 'Challenges'); safe(renderAch, 'Ach'); safe(renderProg, 'Prog'); safe(renderShop, 'Shop'); safe(renderProfile, 'Profile'); safe(renderTimer, 'Timer'); safe(renderStats, 'Stats');

    if (volArea) volArea.scrollTop = volScroll;
    if (deedArea) deedArea.scrollTop = deedScroll;
    if (questArea) questArea.scrollTop = questScroll;
    if (challengeArea) challengeArea.scrollTop = challengeScroll;
    window.scrollTo(0, pageScroll);
  }

  function renderStatic() {
    const safe = (fn, name) => { try { fn(); } catch(e) { console.warn('Static ' + name + ' failed:', e.message); } };
    safe(renderDuas,'Duas'); safe(renderQuran,'Quran'); safe(renderSunnahs,'Sunnahs'); safe(renderDhikr,'Dhikr'); safe(renderDhikrCounter,'DhikrCounter'); safe(renderStories,'Stories'); safe(renderHadith,'Hadith'); safe(renderNames,'Names'); safe(renderInspirations,'Inspirations'); safe(renderGratitude,'Gratitude'); safe(renderFasting,'Fasting'); safe(renderCharity,'Charity'); safe(renderMemorization,'Memorization'); safe(renderMorning,'Morning'); safe(renderEvening,'Evening'); safe(renderSins,'Sins'); safe(renderPunishments,'Punishments'); safe(renderRepentance,'Repentance'); safe(renderSahaba,'Sahaba'); safe(renderSeerah,'Seerah'); safe(renderTafsir,'Tafsir'); safe(renderManners,'Manners'); safe(renderAqeedah,'Aqeedah'); safe(renderFamily,'Family'); safe(renderHealth,'Health'); safe(renderFinance,'Finance'); safe(renderUmmah,'Ummah'); safe(renderHajj,'Hajj'); safe(renderAkhirah,'Akhirah'); safe(renderProphets,'Prophets'); safe(renderWomen,'Women'); safe(renderKnowledge,'Knowledge'); safe(renderHeart,'Heart'); safe(renderJumuah,'Jumuah'); safe(renderMarriage,'Marriage'); safe(renderScience,'Science'); safe(renderWudu,'Wudu'); safe(renderScholars,'Scholars'); safe(renderPatience,'Patience'); safe(renderWork,'Work'); safe(renderCommunity,'Community'); safe(renderEnvironment,'Environment'); safe(renderTravel,'Travel'); safe(renderFiqh,'Fiqh'); safe(renderArabic,'Arabic'); safe(renderTawakkul,'Tawakkul'); safe(renderIkhlas,'Ikhlas'); safe(renderZuhd,'Zuhd'); safe(renderDawah,'Dawah'); safe(renderCivilisation,'Civilisation'); safe(renderBattles,'Battles'); safe(renderJannah,'Jannah'); safe(renderJahannam,'Jahannam'); safe(renderGrave,'Grave'); safe(renderSigns,'Signs'); safe(renderDreams,'Dreams'); safe(renderParenting,'Parenting'); safe(renderFood,'Food'); safe(renderTibb,'Tibb'); safe(renderYouth,'Youth'); safe(renderTech,'Tech'); safe(renderNeighbors,'Neighbors'); safe(renderSalah,'Salah'); safe(renderPrayerTimes,'PrayerTimes');
    if (typeof NEW_POOLS !== 'undefined') Object.keys(NEW_POOLS).forEach(k => {
      if(window['render'+k]) safe(window['render'+k], k);
    });
  }

  function renderAll() {
    renderDynamic();
    renderStatic();
  }
  function renderToday() { renderDailyWidgetArea(); renderBonus(); renderTip(); renderPrayers(); renderVol(); renderDeeds(); }
  function renderDailyWidgetArea() {
    const el = document.getElementById('dailyWidgetArea');
    if (!el) return;
    el.innerHTML = renderDailyWidget();
  }

  // Hijri Calendar Conversion (Tabular Islamic Calendar algorithm)
  const HIJRI_MONTHS = ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Thani','Rajab','Sha\'ban','Ramadan','Shawwal','Dhul Qi\'dah','Dhul Hijjah'];
  const HIJRI_MONTHS_AR = ['مُحَرَّم','صَفَر','رَبِيع الأَوَّل','رَبِيع الثَّانِي','جُمَادَى الأُولَى','جُمَادَى الثَّانِيَة','رَجَب','شَعْبَان','رَمَضَان','شَوَّال','ذُو القِعْدَة','ذُو الحِجَّة'];
  const WEEKDAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const WEEKDAYS_AR = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

  function gregorianToHijri(gY, gM, gD) {
    // Tabular Islamic Calendar algorithm
    const jd = Math.floor((1461 * (gY + 4800 + Math.floor((gM - 14) / 12))) / 4) +
               Math.floor((367 * (gM - 2 - 12 * Math.floor((gM - 14) / 12))) / 12) -
               Math.floor((3 * Math.floor((gY + 4900 + Math.floor((gM - 14) / 12)) / 100)) / 4) +
               gD - 32075;
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const remainder = l - 10631 * n + 354;
    const j = Math.floor((10985 - remainder) / 5316) * Math.floor((50 * remainder) / 17719) +
              Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);
    const remainderJ = remainder - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
                       Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const hM = Math.floor((24 * remainderJ) / 709);
    const hD = remainderJ - Math.floor((709 * hM) / 24);
    const hY = 30 * n + j - 30;
    return { year: hY, month: hM, day: hD };
  }

  function hijriToGregorian(hY, hM, hD) {
    const jd = Math.floor((11 * hY + 3) / 30) + 354 * hY + 30 * hM -
               Math.floor((hM - 1) / 2) + hD + 1948440 - 385;
    const l = jd + 68569;
    const n = Math.floor((4 * l) / 146097);
    const remainder = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (remainder + 1)) / 1461001);
    const remainderI = remainder - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * remainderI) / 2447);
    const gD = remainderI - Math.floor((2447 * j) / 80);
    const remainderJ2 = Math.floor(j / 11);
    const gM = j + 2 - 12 * remainderJ2;
    const gY = 100 * (n - 49) + i + remainderJ2;
    return { year: gY, month: gM, day: gD };
  }

  function getDaysInHijriMonth(hY, hM) {
    // Regular years: 30, 29 alternating. Leap years: year 2,5,7,10,13,16,18,21,24,26,29 have 30 in month 12
    if (hM % 2 === 1 || (hM === 12 && isHijriLeapYear(hY))) return 30;
    return 29;
  }

  function isHijriLeapYear(hY) {
    return ((11 * hY + 14) % 30) < 11;
  }

  function getHijriMonthDays(hY, hM) {
    let total = 0;
    for (let m = 1; m < hM; m++) total += getDaysInHijriMonth(hY, m);
    return total;
  }

  let calViewYear, calViewMonth, calViewHijriY, calViewHijriM;

  function initCalView() {
    const now = new Date();
    calViewYear = now.getFullYear();
    calViewMonth = now.getMonth();
    const h = gregorianToHijri(calViewYear, calViewMonth + 1, 1);
    calViewHijriY = h.year;
    calViewHijriM = h.month;
  }

  function calPrevMonth() {
    calViewMonth--;
    if (calViewMonth < 0) { calViewMonth = 11; calViewYear--; }
    const h = gregorianToHijri(calViewYear, calViewMonth + 1, 1);
    calViewHijriY = h.year;
    calViewHijriM = h.month;
    renderProg();
  }

  function calNextMonth() {
    calViewMonth++;
    if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
    const h = gregorianToHijri(calViewYear, calViewMonth + 1, 1);
    calViewHijriY = h.year;
    calViewHijriM = h.month;
    renderProg();
  }

  function calGoToday() {
    const now = new Date();
    calViewYear = now.getFullYear();
    calViewMonth = now.getMonth();
    const h = gregorianToHijri(calViewYear, calViewMonth + 1, 1);
    calViewHijriY = h.year;
    calViewHijriM = h.month;
    renderProg();
  }
  function renderLv() { const lv=S.lv, xp=S.xp, cur=xpFor(lv), nxt=xpFor(lv+1), prog=xp-cur, need=nxt-cur; document.getElementById('lvNum').textContent=lv; document.getElementById('lvTitle').textContent=lvTitle(lv); document.getElementById('xpBar').style.width=Math.min(100,(prog/need)*100)+'%'; document.getElementById('xpLabel').textContent=prog+' / '+need+' XP'; }
  function renderStr() { document.getElementById('strDays').textContent=S.cs+' Day Streak'; document.getElementById('bestStr').textContent=S.bs; document.getElementById('strMsg').textContent=(STREAK_MSGS.find(x=>S.cs>=x.m)||{t:'Legendary!'}).t; }
  function renderBonus() { document.getElementById('bonusArea').innerHTML=S.lbd===today()?'':'<div class="daily-bonus" onclick="App.claimBonus()">🎁 Tap to claim your Daily Bonus!</div>'; }
  function renderTip() { document.getElementById('tipArea').innerHTML=S.tdismiss?'':'<div class="tip-box"><span>💡</span><span style="flex:1">Tap ℹ️ for details. Tap 💡 for tips. Earn XP by completing everything!</span><span style="cursor:pointer" onclick="App.dismissTip()">✖</span></div>'; }
  function renderPrayers() {
    const l = tlog(), f = isFri();
    const cards = PRAYERS.map(p => {
      const d = !!l.p[p.id]; let nm=p.name, ic=p.icon, xp=p.xp;
      if (f && p.id==='dhuhr') { nm=p.fri.name; ic=p.fri.icon; xp=p.fri.xp; }
      if (S.ab && S.ab.exp >= today()) xp *= 2;
      return `<div class="card-item${d?' done':''}" onclick="App.toggleP('${p.id}')"><div class="card-icon">${ic}</div><div class="card-name">${nm}</div><div class="card-sub">${p.time}</div><div class="card-xp">+${xp} XP</div>${d?'<div class="card-check">✓</div>':''}<div class="card-info-btn" onclick="event.stopPropagation();App.detail('${p.id}')">ℹ️</div></div>`;
    }).join('');
    document.getElementById('prayerArea').innerHTML = '<div class="section-title">🕌 Daily Prayers</div><div class="card-grid">' + cards + '</div>';
  }
  function renderVol() {
    const volArea = document.getElementById('volArea');
    const openStates = volArea ? Array.from(volArea.querySelectorAll('details.cat-details')).map(d => d.open) : [];
    const l = tlog().v || {};
    const byCat = {};
    VOLUNTARY.forEach(v => { if (!v.name || v.name.trim()==='') return; const cat = v.cat || 'General'; if (!byCat[cat]) byCat[cat]=[]; byCat[cat].push(v); });
    
    const catIcons = {
      'Night Prayers': '🌌',
      'Occasional Prayers': '🤲',
      'Other Daily Prayers': '🕌',
      'Special Events': '✨',
      'General': '✨'
    };

    let html = '';
    let catIdx = 0;
    for (const cat in byCat) {
      const catIcon = catIcons[cat] || '✨';
      const totalInCat = byCat[cat].length;
      const completedInCat = byCat[cat].filter(v => !!l[v.id]).length;
      const isOpen = catIdx < openStates.length ? openStates[catIdx] : false;
      html += `<details class="cat-details"${isOpen ? ' open' : ''}><summary><div style="display:flex;justify-content:space-between;align-items:center;flex:1;"><span>${catIcon} ${cat}</span><span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--gold-light);font-weight:700;">${completedInCat} / ${totalInCat}</span></div></summary><div style="padding:8px 4px;">`;
      html += '<div class="card-grid">';
      html += byCat[cat].map(v => { const d=!!l[v.id]; let xp=v.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; return `<div class="card-item${d?' done':''}" onclick="App.toggleV('${v.id}')"><div class="card-icon">${v.icon}</div><div class="card-name">${v.name}</div><div class="card-xp">+${xp} XP</div>${d?'<div class="card-check">✓</div>':''}<div class="card-info-btn" onclick="event.stopPropagation();App.detail('${v.id}')">ℹ️</div></div>`; }).join('');
      html += '</div></div></details>';
      catIdx++;
    }
    if (volArea) volArea.innerHTML = html;
  }
  function renderDeeds() {
    const deedArea = document.getElementById('deedArea');
    const openStates = deedArea ? Array.from(deedArea.querySelectorAll('details.cat-details')).map(d => d.open) : [];

    // ── 7-category normaliser ──────────────────────────────────────────────
    const CAT_MAP = {
      // Worship & Prayer
      'Worship & Prayer':            '🕌 Worship & Prayer',
      'Faith, Intention & Worship':  '🕌 Worship & Prayer',
      "Qur'an, Dhikr & Dua":        '🕌 Worship & Prayer',
      // Quran & Remembrance → merged into Worship
      // Charity & Giving
      'Charity & Social':            '🤲 Charity & Giving',
      'Charity & Helping Others':    '🤲 Charity & Giving',
      'Neighbors & Community':       '🤲 Charity & Giving',
      'Animals & Environment':       '🤲 Charity & Giving',
      'Unique Small Deeds':          '🤲 Charity & Giving',
      // Character & Ethics
      'Character & Ethics':          '💎 Character & Ethics',
      'Character & Self-Control':    '💎 Character & Ethics',
      'Avoiding Harm & Positive Intentions': '💎 Character & Ethics',
      // Knowledge & Learning
      'Knowledge & Learning':        '📚 Knowledge & Learning',
      'Knowledge & Teaching':        '📚 Knowledge & Learning',
      // Family & Relations
      'Family & Relatives':          '👨‍👩‍👧‍👦 Family & Relations',
      'Parents & Family':            '👨‍👩‍👧‍👦 Family & Relations',
      // Daily Sunnahs
      'Daily Sunnahs':               '🌿 Daily Sunnahs',
      'Work, Money & Daily Life':    '🌿 Daily Sunnahs',
      // General → catch-all
      'General':                     '✨ General'
    };
    // Ordered display sequence
    const CAT_ORDER = [
      '🕌 Worship & Prayer',
      '🤲 Charity & Giving',
      '💎 Character & Ethics',
      '📚 Knowledge & Learning',
      '👨‍👩‍👧‍👦 Family & Relations',
      '🌿 Daily Sunnahs',
      '✨ General'
    ];

    const l = tlog().d || {};
    const byCat = {};
    CAT_ORDER.forEach(c => { byCat[c] = []; });

    DEEDS.forEach(d => {
      const rawCat = d.cat || 'General';
      const normCat = CAT_MAP[rawCat] || '✨ General';
      if (!byCat[normCat]) byCat[normCat] = [];
      byCat[normCat].push(d);
    });

    let html = '';
    let catIdx = 0;
    for (const cat of CAT_ORDER) {
      const items = byCat[cat] || [];
      if (items.length === 0) { catIdx++; continue; }
      const totalInCat = items.length;
      const completedInCat = items.filter(d => !!l[d.id]).length;
      const isOpen = catIdx < openStates.length ? openStates[catIdx] : false;
      html += `<details class="cat-details"${isOpen ? ' open' : ''}><summary><div style="display:flex;justify-content:space-between;align-items:center;flex:1;"><span>${cat}</span><span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--gold-light);font-weight:700;">${completedInCat} / ${totalInCat}</span></div></summary><div style="padding:8px 4px;">`;
      html += '<div class="card-grid">';
      html += items.map(d => { const done=!!l[d.id]; const tot=S.td[d.id]||0; let xp=d.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; return `<div class="card-item${done?' done':''}" onclick="App.toggleD('${d.id}')"><div class="card-icon">${d.icon}</div><div class="card-name">${d.name}</div><div class="card-xp">+${xp} XP</div>${done?'<div class="card-check">✓</div>':''}${tot?`<div class="card-sub">${tot}×</div>`:''}<div class="card-info-btn" onclick="event.stopPropagation();App.tip('${d.id}')">💡</div></div>`; }).join('');
      html += '</div></div></details>';
      catIdx++;
    }
    document.getElementById('deedArea').innerHTML = html;
  }

  // Generic content card renderer
  function getSourceLink(source) {
    if (!source) return '';
    const s = source.toLowerCase();
    // Quran references
    const qm = s.match(/(\d+):(\d+)/);
    if (s.includes('al-') || s.includes('quran') || s.includes('surah') || s.includes('baqara') || s.includes('fatiha') || s.includes('ali') || s.includes('an-nisa') || s.includes('al-maidah') || s.includes('an-am') || s.includes('al-aaraf') || s.includes('al-anfaal') || s.includes('at-tawbah') || s.includes('yunus') || s.includes('hud') || s.includes('yusuf') || s.includes('ar-rad') || s.includes('ibrahim') || s.includes('al-hijr') || s.includes('an-nahl') || s.includes('al-isra') || s.includes('al-kahf') || s.includes('maryam') || s.includes('ta-ha') || s.includes('al-anbiya') || s.includes('al-hajj') || s.includes('al-muminun') || s.includes('an-nur') || s.includes('al-furqan') || s.includes('ash-shuara') || s.includes('an-naml') || s.includes('al-qasas') || s.includes('al-ankebut') || s.includes('ar-rum') || s.includes('luqman') || s.includes('as-sajdah') || s.includes('al-ahzab') || s.includes('saba') || s.includes('fatir') || s.includes('yasin') || s.includes('as-saffat') || s.includes('sad') || s.includes('az-zumar') || s.includes('ghafir') || s.includes('fussilat') || s.includes('ash-shura') || s.includes('az-zukhruf') || s.includes('ad-dukhhan') || s.includes('al-jathiyah') || s.includes('al-ahqaf') || s.includes('muhammad') || s.includes('al-fath') || s.includes('al-hujurat') || s.includes('qaf') || s.includes('adh-dhariyat') || s.includes('at-tur') || s.includes('an-najm') || s.includes('al-qamar') || s.includes('ar-rahman') || s.includes('al-waqiah') || s.includes('al-hadid') || s.includes('al-mujadila') || s.includes('al-hashr') || s.includes('al-mumtahina') || s.includes('as-saf') || s.includes('al-jumuah') || s.includes('al-munafiqun') || s.includes('at-taghabun') || s.includes('at-talaq') || s.includes('at-tahrim') || s.includes('al-mulk') || s.includes('al-qalam') || s.includes('al-haqqah') || s.includes('al-maarij') || s.includes('nuh') || s.includes('al-jinn') || s.includes('al-muzzammil') || s.includes('al-muddaththir') || s.includes('al-qiyamah') || s.includes('al-insan') || s.includes('al-mursalat') || s.includes('an-naba') || s.includes('an-naziat') || s.includes('abasa') || s.includes('at-takwir') || s.includes('al-infitaar') || s.includes('al-mutaffifin') || s.includes('al-inshiqaq') || s.includes('al-buruj') || s.includes('at-tariq') || s.includes('al-ala') || s.includes('al-ghashiyah') || s.includes('al-fajr') || s.includes('al-balad') || s.includes('ash-shams') || s.includes('al-lail') || s.includes('ad-duha') || s.includes('ash-sharh') || s.includes('at-tin') || s.includes('al-alaq') || s.includes('al-qadr') || s.includes('al-bayyinah') || s.includes('az-zalzalah') || s.includes('al-adiyat') || s.includes('al-qariah') || s.includes('at-takathur') || s.includes('al-asr') || s.includes('al-humazah') || s.includes('al-fil') || s.includes('quraysh') || s.includes('al-maun') || s.includes('al-kawthar') || s.includes('al-kafirun') || s.includes('an-nasr') || s.includes('al-masad') || s.includes('al-ikhlas') || s.includes('al-falaq') || s.includes('an-nas')) {
      if (qm) return `https://quran.com/${qm[1]}/${qm[2]}`;
      return 'https://quran.com';
    }
    // Hadith references
    if (s.includes('sahih') || s.includes('bukhari') || s.includes('muslim') || s.includes('abu dawood') || s.includes('tirmidhi') || s.includes('ibn majah') || s.includes('nasai') || s.includes('musnad') || s.includes('hadith') || s.includes('sunan') || s.includes('riyadh') || s.includes('mishkat') || s.includes('bulugh') || s.includes('adab') || s.includes('muwatta')) {
      return 'https://sunnah.com';
    }
    // Default
    return 'https://islamqa.info';
  }

  function poolRender(areaId, title, pool, idxKey, showAll = false) {
    const el = document.getElementById(areaId);
    if (!el) return;
    let html = '';
    html += `<div class="section-title">${title}</div>`;
    if (!showAll && idxKey && pool && (!S[idxKey] || !S[idxKey].length)) {
      S[idxKey] = fastRng(pool.length);
    }
    let idx = showAll ? pool.map((_, i) => i) : (S[idxKey] || []);
    if (!showAll && idx.length > 5) idx = idx.slice(0, 5);
    el.innerHTML = html + idx.map((i, mapIdx) => {
      const o = pool[i % pool.length];
      if (!o) return '';
      
      const numBadge = `<span style="display:inline-block; background:rgba(212,175,55,0.15); color:var(--gold-light); border:1px solid rgba(212,175,55,0.4); border-radius:12px; padding:0 8px; font-size:0.75rem; margin-right:8px; font-weight:800; height:22px; line-height:20px; white-space:nowrap; font-family:var(--font);">#${mapIdx + 1}</span>`;

      if (typeof o === 'string') return `<div class="content-card"><div style="display:flex;align-items:flex-start;gap:10px;"><div style="margin-top:2px;">${numBadge}</div><div class="content-english" style="flex:1;">${o}</div></div></div>`;
      
      let inner = '';
      if (o.arabic) inner += `<div class="content-arabic">${o.arabic}</div>`;
      if (o.transliteration || o.roman) inner += `<div style="font-size:0.9rem;color:var(--text1);opacity:0.9;font-style:italic;margin-bottom:6px;text-align:right;">${o.transliteration || o.roman}</div>`;
      inner += `<div class="content-english">${o.desc || o.text || o.english || ''}</div>`;
      if (o.source) inner += `<div class="content-source">📜 ${o.source}<a class="verify-btn" href="${getSourceLink(o.source)}" target="_blank" rel="noopener noreferrer" title="Verify this source">Verify ↗</a></div>`;
      
      let title_line = '';
      if (o.title) {
        title_line = `<div style="font-weight:700;margin-bottom:6px;color:var(--gold-light);display:flex;align-items:flex-start;"><div style="margin-top:1px;">${numBadge}</div><span style="line-height:1.4;">${o.title}</span></div>`;
      } else if (o.name && o.arabic && !o.title) {
        inner = `<div style="font-weight:700;font-size:1.1rem;color:var(--gold-light);display:flex;align-items:flex-start;margin-bottom:6px;"><div style="margin-top:3px;">${numBadge}</div><span style="line-height:1.3;">${o.name}</span></div><div class="content-arabic" style="font-size:1.3rem">${o.arabic}</div><div class="content-english">${o.desc||''}</div>`;
      } else {
        return `<div class="content-card" style="flex-direction:row;align-items:flex-start;"><div style="margin-top:2px;">${numBadge}</div><div style="flex:1;">${inner}</div></div>`;
      }
      
      return `<div class="content-card">${title_line}${inner}</div>`;
    }).join('');
  }

  function renderDuas() { poolRender('duaArea','🤲 Daily Duas',DUA_POOL,'duaIdx'); }

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
  let quranSurahMode = false;
  let quranSurahPaused = false;
  let quranSurahQueue = [];
  let quranSurahIdx = 0;
  let quranCurrentSurah = null;
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
        if (quranSurahMode) quranSurahPaused = false;
      } else {
        quranAudio.pause();
        if (quranSurahMode) quranSurahPaused = true;
      }
      updateAudioButtons();
      updateSurahButton();
      return;
    }
    if (quranSurahMode) {
      quranSurahMode = false;
      quranSurahPaused = false;
      if (quranAudio) { quranAudio.pause(); quranAudio = null; }
      quranPlayingVerse = null;
      quranPlayingSurah = null;
      updateAudioButtons();
      updateSurahButton();
    }
    const reciterId = S.quranAudioReciter || 7;
    const url = getQuranAudioUrl(reciterId, surah, verse);
    if (!url) return;
    quranAudio = new Audio(url);
    quranPlayingVerse = verse;
    quranPlayingSurah = surah;
    quranAudio.play().catch(()=>{});
    quranAudio.onended = () => { quranPlayingVerse = null; quranPlayingSurah = null; updateAudioButtons(); };
    updateAudioButtons();
  }

  function playSurah(surahNum) {
    if (quranSurahMode && quranSurahQueue.length > 0 && quranSurahQueue[0].surah === surahNum && quranSurahPaused) {
      quranSurahPaused = false;
      if (quranAudio) quranAudio.play().catch(()=>{});
      updateSurahButton();
      updateAudioButtons();
      return;
    }
    if (quranSurahMode && quranSurahQueue.length > 0 && quranSurahQueue[0].surah === surahNum) {
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
    quranSurahMode = true;
    quranSurahPaused = false;
    quranSurahQueue = verses;
    quranSurahIdx = 0;
    _playSurahVerse();
    updateSurahButton();
  }

  function _playSurahVerse() {
    if (!quranSurahMode || quranSurahIdx >= quranSurahQueue.length) { stopSurah(); return; }
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
        _playSurahVerse();
      } else {
        stopSurah();
      }
    };
    updateAudioButtons();
    updateSurahButton();
    _scrollToVerse();
  }

  function stopSurah() {
    if (quranAudio) { quranAudio.pause(); quranAudio = null; }
    quranSurahMode = false;
    quranSurahPaused = false;
    quranSurahQueue = [];
    quranSurahIdx = 0;
    quranPlayingVerse = null;
    quranPlayingSurah = null;
    updateAudioButtons();
    updateSurahButton();
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
    if (quranSurahMode && !quranSurahPaused) {
      btn.textContent = '⏸ Pause Surah';
      btn.classList.add('playing');
    } else if (quranSurahMode && quranSurahPaused) {
      btn.textContent = '▶ Resume Surah';
      btn.classList.add('playing');
    } else {
      btn.textContent = '▶ Play Surah';
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

    let html = '<div class="quran-header"><h2>📖 The Noble Quran</h2><div class="quran-sub">114 Surahs - Tap a surah to read</div></div>';
    html += '<div class="tab-bar-quran">';
    html += `<button class="${quranViewMode==='surah'?'active':''}" onclick="App.setQuranView('surah')">Surahs</button>`;
    html += `<button class="${quranViewMode==='juz'?'active':''}" onclick="App.setQuranView('juz')">Juz</button>`;
    html += '</div>';
    html += '<input class="quran-search" placeholder="🔍 Search surah name..." oninput="App.quranSearchFilter(this.value)">';

    if (quranViewMode === 'juz') {
      html += '<div class="juz-grid">';
      QURAN_JUZ.forEach(j => {
        html += `<div class="juz-card" onclick="App.openQuranJuz(${j.n})"><div style="font-weight:700;color:var(--gold-light);">Juz ${j.n}</div><div style="font-size:0.7rem;color:var(--text2);margin-top:3px;">${j.name}</div></div>`;
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
    const s = QURAN_SURAHS.find(x => x.n === surahNum);
    if (!s) { quranCurrentSurah = null; renderQuran(); return; }
    let html = '<button class="quran-back-btn" onclick="App.quranBack()">← Back to Surahs</button>';
    html += `<div class="quran-header"><h2>${s.ar}</h2><div style="font-family:'Amiri',serif;font-size:1.3rem;color:var(--gold);margin:4px 0;">${s.en}</div><div class="quran-sub">${s.ay} verses · ${s.type}</div></div>`;
    html += `<div style="text-align:center;margin:8px 0 12px;"><button id="surahPlayBtn" class="surah-play-btn" onclick="App.playSurah(${surahNum})">▶ Play Surah</button></div>`;
    const verses = QURAN_POOL.filter(v => {
      if (!v.source) return false;
      const m = v.source.match(/(\d+):(\d+)/);
      return m && parseInt(m[1]) === surahNum;
    });
    if (surahNum !== 1) {
      html += `<div style="text-align:center;font-size:1.6rem;color:var(--gold);font-family:'Amiri',serif;margin:16px 0;">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
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

  function setQuranView(mode) { quranViewMode = mode; quranSearchTerm = ''; renderQuran(); }
  function quranSearchFilter(term) { quranSearchTerm = term; renderQuran(); }
  function openQuranSurah(num) { quranCurrentSurah = num; renderQuran(); }
  function quranBack() { quranCurrentSurah = null; renderQuran(); }
  function openQuranJuz(juzNum) {
    const j = QURAN_JUZ.find(x => x.n === juzNum);
    if (!j) return;
    const nextJuz = QURAN_JUZ.find(x => x.n === juzNum + 1);
    const endAyah = nextJuz ? nextJuz.start - 1 : 6236;
    const startSurah = findSurahByAyah(j.start);
    const endSurah = findSurahByAyah(endAyah);
    if (!startSurah) return;
    quranCurrentSurah = startSurah.n;
    renderQuran();
  }

  function findSurahByAyah(ayahNum) {
    let cumulative = 0;
    for (const s of QURAN_SURAHS) {
      cumulative += s.ay;
      if (cumulative >= ayahNum) return s;
    }
    return QURAN_SURAHS[QURAN_SURAHS.length - 1];
  }
  function renderSunnahs() { poolRender('sunnahArea','☀️ Daily Sunnahs',SUNNAH_POOL,'sunnahIdx'); }
  function renderDhikr() { poolRender('dhikrArea','📿 Dhikr Collection',DHIKR_POOL,'dhikrIdx'); }
  function renderStories() { poolRender('storiesArea','📚 Inspiring Stories',STORIES,'storiesIdx'); }
  let hadithCurrentCollection = null;

  const HADITH_COLLECTIONS = [
    { id: 'bukhari', name: 'Sahih al-Bukhari', icon: '📗', desc: 'The most authentic collection, compiled by Imam al-Bukhari (810-870 CE)', count: 0 },
    { id: 'muslim', name: 'Sahih Muslim', icon: '📘', desc: 'Second most authentic, compiled by Imam Muslim (821-875 CE)', count: 0 },
    { id: 'abudawud', name: 'Sunan Abu Dawud', icon: '📙', desc: 'Compiled by Imam Abu Dawud (817-889 CE)', count: 0 },
    { id: 'tirmidhi', name: 'Sunan al-Tirmidhi', icon: '📕', desc: 'Compiled by Imam al-Tirmidhi (824-892 CE)', count: 0 },
    { id: 'ibnmajah', name: 'Sunan Ibn Majah', icon: '📓', desc: 'Compiled by Imam Ibn Majah (824-887 CE)', count: 0 },
    { id: 'nasai', name: "Sunan an-Nasa'i", icon: '📔', desc: "Compiled by Imam an-Nasa'i (829-915 CE)", count: 0 },
    { id: 'kubra', name: 'Sunan al-Kubra', icon: '📒', desc: "Compiled by Imam al-Bayhaqi (994-1066 CE)", count: 0 }
  ];

  function categorizeHadith() {
    const cats = {};
    HADITH_COLLECTIONS.forEach(c => { cats[c.id] = []; });
    const allHadiths = [...HADITHS];
    allHadiths.forEach(h => {
      const src = (h.source || '').toLowerCase();
      if (src.includes('bukhari')) cats.bukhari.push(h);
      else if (src.includes('muslim') && !src.includes('abu dawud')) cats.muslim.push(h);
      else if (src.includes('abu dawud') || src.includes('abi dawud')) cats.abudawud.push(h);
      else if (src.includes('tirmidhi')) cats.tirmidhi.push(h);
      else if (src.includes('ibn majah')) cats.ibnmajah.push(h);
      else if (src.includes('nasai') || src.includes("nasa'i")) cats.nasai.push(h);
      else if (src.includes('kubra') || src.includes('bayhaqi')) cats.kubra.push(h);
      else if (src.includes('muwatta')) cats.kubra.push(h);
      else if (src.includes('musnad')) cats.kubra.push(h);
      else cats.bukhari.push(h);
    });
    HADITH_COLLECTIONS.forEach(c => { c.count = cats[c.id].length; });
    return cats;
  }

  function renderHadith() {
    const el = document.getElementById('hadithArea');
    if (!el) return;
    const cats = categorizeHadith();

    if (hadithCurrentCollection) {
      const col = HADITH_COLLECTIONS.find(c => c.id === hadithCurrentCollection);
      const hadiths = cats[hadithCurrentCollection] || [];
      let html = `<button class="quran-back-btn" onclick="App.hadithBack()">← Back to Collections</button>`;
      html += `<div class="quran-header"><h2>${col.icon} ${col.name}</h2><div class="quran-sub">${hadiths.length} hadiths</div></div>`;
      hadiths.forEach((h, i) => {
        const src = h.source || '';
        html += `<div class="verse-card">
          <div class="verse-num">${i + 1}</div>
          <div class="verse-english">${h.text || h.desc || ''}</div>
          ${h.arabic ? `<div class="verse-arabic">${h.arabic}</div>` : ''}
          ${h.roman ? `<div style="font-size:0.85rem;color:var(--text2);font-style:italic;margin-top:6px;">${h.roman}</div>` : ''}
          <div class="content-source">📜 ${src}${src ? `<a class="verify-btn" href="${getSourceLink(src)}" target="_blank" rel="noopener noreferrer" title="Verify this source">Verify ↗</a>` : ''}</div>
        </div>`;
      });
      el.innerHTML = html;
      return;
    }

    let html = '<div class="quran-header"><h2>💭 The Hadith Collections</h2><div class="quran-sub">Authentic narrations of the Prophet Muhammad ﷺ</div></div>';
    html += '<div class="surah-grid">';
    HADITH_COLLECTIONS.forEach(c => {
      html += `<div class="surah-card" onclick="App.openHadithCollection('${c.id}')">
        <div class="surah-num">${c.icon}</div>
        <div class="surah-name-en">${c.name}</div>
        <div class="surah-meta">${c.count} hadiths</div>
        <div style="font-size:0.72rem;color:var(--text2);margin-top:4px;line-height:1.4;">${c.desc}</div>
      </div>`;
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function openHadithCollection(id) { hadithCurrentCollection = id; renderHadith(); }
  function hadithBack() { hadithCurrentCollection = null; renderHadith(); }
  function renderNames() { poolRender('namesArea','💯 99 Names of Allah',NAMES,'namesIdx', true); }
  function renderSins() { poolRender('sinsArea','🚫 Major Sins to Avoid',SINS_POOL,'sinsIdx'); }
  function renderPunishments() { poolRender('punishmentsArea','⚖️ Islamic Justice',PUNISHMENTS_POOL,'punishmentsIdx'); }
  function renderRepentance() { poolRender('repentanceArea','💧 Repentance & Tawbah',REPENTANCE_POOL,'repentanceIdx'); }
  function renderSeerah() { poolRender('seerahArea','🐪 Life of the Prophet ﷺ',SEERAH_POOL,'seerahIdx'); }
  function renderTafsir() { poolRender('tafsirArea','📜 Quranic Tafsir',TAFSIR_POOL,'tafsirIdx'); }
  function renderManners() { poolRender('mannersArea','🤝 Islamic Manners (Adab)',MANNERS_POOL,'mannersIdx'); }
  function renderAqeedah() { poolRender('aqeedahArea','🛡️ Islamic Aqeedah',AQEEDAH_POOL,'aqeedahIdx'); }
  function renderFamily() { poolRender('familyArea','👨‍👩‍👧‍👦 Family & Kinship',FAMILY_POOL,'familyIdx'); }
  function renderHealth() { poolRender('healthArea','🍎 Health & Well-being',HEALTH_POOL,'healthIdx'); }
  function renderFinance() { poolRender('financeArea','💰 Halal Finance',FINANCE_POOL,'financeIdx'); }
  function renderUmmah() { poolRender('ummahArea','🌍 The Muslim Ummah',UMMAH_POOL,'ummahIdx'); }
  function renderHajj() { poolRender('hajjArea','🕋 Hajj & Umrah',HAJJ_POOL,'hajjIdx'); }
  function renderAkhirah() { poolRender('akhirahArea','🌌 The Hereafter',AKHIRAH_POOL,'akhirahIdx'); }
  function renderProphets() { poolRender('prophetsArea','📜 Stories of the Prophets',PROPHETS_POOL,'prophetsIdx'); }
  function renderWomen() { poolRender('womenArea','🧕 Great Muslim Women',WOMEN_POOL,'womenIdx'); }
  function renderKnowledge() { poolRender('knowledgeArea','🧠 Seeking Knowledge',KNOWLEDGE_POOL,'knowledgeIdx'); }
  function renderHeart() { poolRender('heartArea','🤍 Diseases of the Heart',HEART_POOL,'heartIdx'); }
  function renderJumuah() { poolRender('jumuahArea','🕌 Friday (Jumuah) Virtues',JUMUAH_POOL,'jumuahIdx', true); }
  function renderMarriage() { poolRender('marriageArea','💍 Marriage & Halal Love',MARRIAGE_POOL,'marriageIdx'); }
  function renderScience() { poolRender('scienceArea','🔭 Islam & Science',SCIENCE_POOL,'scienceIdx'); }
  function renderWudu() { poolRender('wuduArea','💧 Wudu & Taharah',WUDU_POOL,'wuduIdx', true); }
  function renderScholars() { poolRender('scholarsArea','🖋️ Great Islamic Scholars',SCHOLARS_POOL,'scholarsIdx'); }
  function renderPatience() { poolRender('patienceArea','🏔️ Sabr & Shukr',PATIENCE_POOL,'patienceIdx'); }
  function renderWork() { poolRender('workArea','💼 Career & Work Ethics',WORK_POOL,'workIdx'); }
  function renderCommunity() { poolRender('communityArea','🏘️ Community & Society',COMMUNITY_POOL,'communityIdx'); }
  function renderEnvironment() { poolRender('environmentArea','🌱 Nature & Environment',ENVIRONMENT_POOL,'environmentIdx'); }
  function renderTravel() { poolRender('travelArea','✈️ Travel & Safar',TRAVEL_POOL,'travelIdx'); }
  function renderFiqh() { poolRender('fiqhArea','⚖️ Islamic Jurisprudence (Fiqh)',FIQH_POOL,'fiqhIdx'); }
  function renderArabic() { poolRender('arabicArea','🔤 Learn Arabic',ARABIC_POOL,'arabicIdx'); }
  function renderTawakkul() { poolRender('tawakkulArea','🌿 Tawakkul — Trust in Allah',TAWAKKUL_POOL,'tawakkulIdx'); }
  function renderIkhlas() { poolRender('ikhlasArea','✨ Ikhlas — Sincerity',IKHLAS_POOL,'ikhlasIdx'); }
  function renderZuhd() { poolRender('zuhdArea','🌾 Zuhd — Asceticism',ZUHD_POOL,'zuhdIdx'); }
  function renderDawah() { poolRender('dawahArea',"📢 Da'wah — Inviting to Islam",DAWAH_POOL,'dawahIdx'); }
  function renderCivilisation() { poolRender('civilisationArea','🏛️ Islamic Civilisation',CIVILISATION_POOL,'civilisationIdx'); }
  function renderBattles() { poolRender('battlesArea','🗡️ Battles of Islam',BATTLES_POOL,'battlesIdx'); }
  function renderJannah() { poolRender('jannahArea','🌴 Jannah — Paradise',JANNAH_POOL,'jannahIdx'); }
  function renderJahannam() { poolRender('jahannamArea','🔥 Jahannam — Hellfire',JAHANNAM_POOL,'jahannamIdx'); }
  function renderGrave() { poolRender('graveArea','⚰️ The Grave & Life After Death',GRAVE_POOL,'graveIdx'); }
  function renderSigns() { poolRender('signsArea','🔮 Signs of Qiyamah',SIGNS_POOL,'signsIdx'); }
  function renderDreams() { poolRender('dreamsArea','🌙 Islamic Dreams',DREAMS_POOL,'dreamsIdx'); }
  function renderParenting() { poolRender('parentingArea','👶 Islamic Parenting',PARENTING_POOL,'parentingIdx'); }
  function renderFood() { poolRender('foodArea','🍽️ Halal & Haram Food',FOOD_POOL,'foodIdx'); }
  function renderTibb() { poolRender('tibbArea','🌿 Tibb Nabawi (Prophetic Medicine)',TIBB_POOL,'tibbIdx'); }
  function renderYouth() { poolRender('youthArea','🎓 Youth & Islam',YOUTH_POOL,'youthIdx'); }
  function renderTech() { poolRender('techArea','📱 Technology & Islam',TECH_POOL,'techIdx'); }
  function renderNeighbors() { poolRender('neighborsArea','🏡 Rights of Neighbors',NEIGHBORS_POOL,'neighborsIdx'); }
  function renderSalah() {
    const el = document.getElementById('salahArea');
    if (!el) return;
    el.innerHTML = '<div class="section-title">🛐 Salah Guide</div>' + [
      { name:'Wudu', desc:'Perform wudu perfectly before each prayer. Intention + 8 steps.' },
      { name:'Facing Qibla', desc:'Face the Kaaba in Makkah. Use a compass or app to find direction.' },
      { name:'Niyyah (Intention)', desc:'Make the intention in your heart for which prayer you are praying.' },
      { name:'Takbir al-Ihram', desc:'Raise both hands to ear level and say Allahu Akbar to begin.' },
      { name:'Recite Al-Fatiha', desc:'Recite Surah Al-Fatiha in every rakat — it is the pillar of prayer.' },
      { name:'Ruku (Bowing)', desc:'Bow until your back is flat, hands on knees, saying SubhanAllah Rabbil Adheem 3x.' },
      { name:"I'tidal (Rising)", desc:'Rise from ruku saying Sami Allahu liman hamidah, then Rabbana wa lakal hamd.' },
      { name:'Sujood (Prostration)', desc:'Prostrate on 7 body parts: forehead+nose, both hands, both knees, both feet. Say SubhanAllah Rabbil Ala 3x.' },
      { name:'Tashahud', desc:'Sit between rakats reciting At-Tahiyyatu lillahi... and send Salawat on the Prophet ﷺ.' },
      { name:'Tasleem', desc:'End prayer by turning head right then left saying As-Salamu Alaykum wa rahmatullah.' }
    ].map((s, i) => {
      const numBadge = `<span style="display:inline-block; background:rgba(212,175,55,0.15); color:var(--gold-light); border:1px solid rgba(212,175,55,0.4); border-radius:12px; padding:0 8px; font-size:0.75rem; margin-right:8px; font-weight:800; height:22px; line-height:20px; white-space:nowrap; font-family:var(--font);">#${i + 1}</span>`;
      return `<div class="content-card" style="flex-direction:row;align-items:flex-start;"><div style="margin-top:2px;">${numBadge}</div><div style="flex:1;"><div style="font-weight:700;color:var(--gold-light);margin-bottom:6px;">${s.name}</div><div class="content-english">${s.desc}</div></div></div>`;
    }).join('');
  }
  const PRAYER_CACHE_KEY = 'iq9_prayer_times';
  const DHAKA_LAT = 23.8103, DHAKA_LNG = 90.4125;
  const PRAYER_METHOD = 1; // Muslim World League

  function getPrayerTimesFromCache() {
    try {
      const raw = localStorage.getItem(PRAYER_CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      if (cache.date === today()) return cache.times;
      return null;
    } catch(e) { return null; }
  }

  function setPrayerTimesCache(times) {
    try {
      localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify({ date: today(), times }));
    } catch(e) {}
  }

  function parsePrayerTime(timeStr) {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return { h, m };
  }

  async function fetchPrayerTimes() {
    const cached = getPrayerTimesFromCache();
    if (cached) return cached;
    const d = new Date();
    const dateStr = String(d.getDate()).padStart(2,'0') + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + d.getFullYear();
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${DHAKA_LAT}&longitude=${DHAKA_LNG}&method=${PRAYER_METHOD}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.code === 200 && json.data && json.data.timings) {
        const t = json.data.timings;
        const times = {
          Fajr:    parsePrayerTime(t.Fajr),
          Sunrise: parsePrayerTime(t.Sunrise),
          Dhuhr:   parsePrayerTime(t.Dhuhr),
          Asr:     parsePrayerTime(t.Asr),
          Maghrib: parsePrayerTime(t.Maghrib),
          Isha:    parsePrayerTime(t.Isha)
        };
        setPrayerTimesCache(times);
        return times;
      }
    } catch(e) { console.error('Prayer times fetch failed:', e); }
    return null;
  }

  function renderPrayerTimes() {
    const el = document.getElementById('prayerTimesArea');
    if (!el) return;
    const icons = { Fajr:'🌅', Sunrise:'☀️', Dhuhr:'☀️', Asr:'🌤️', Maghrib:'🌇', Isha:'🌙' };
    const descs = {
      Fajr: 'Dawn',
      Sunrise: 'Sunrise',
      Dhuhr: 'Noon',
      Asr: 'Afternoon',
      Maghrib: 'Sunset',
      Isha: 'Night'
    };
    fetchPrayerTimes().then(times => {
      if (!times) {
        el.innerHTML = '<div style="text-align:center;color:var(--text2);padding:20px;">Unable to load prayer times. Please check your connection.</div>';
        return;
      }
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const prayerNames = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
      let nextPrayer = null;
      for (const name of ['Fajr','Dhuhr','Asr','Maghrib','Isha']) {
        const t = times[name];
        if (t && (t.h * 60 + t.m) > nowMin) { nextPrayer = name; break; }
      }
      el.innerHTML = '<div class="prayer-times-grid">' + prayerNames.map(name => {
        const t = times[name];
        if (!t) return '';
        const ampm = t.h >= 12 ? 'PM' : 'AM';
        const h12 = t.h === 0 ? 12 : (t.h > 12 ? t.h - 12 : t.h);
        const isNext = name === nextPrayer;
        return `<div class="pt-card${isNext ? ' next-prayer' : ''}">
          <div class="pt-icon">${icons[name]}</div>
          <div class="pt-name">${name}</div>
          <div class="pt-time">${h12}:${String(t.m).padStart(2,'0')} ${ampm}</div>
          <div class="pt-sub">${descs[name]}</div>
        </div>`;
      }).join('') + '</div>';
    });
  }

  function renderDhikrCounter() {
    const el = document.getElementById('dhikrCounterArea');
    if (!el) return;
    if (!S.dhikrCounters) S.dhikrCounters = {};
    const current = S.dhikrCounters._active || 0;
    const d = DHIKR_COUNTER_DATA[current % DHIKR_COUNTER_DATA.length];
    const cnt = S.dhikrCounters[current] || 0;
    const pct = Math.min(100, Math.round((cnt / d.target) * 100));
    el.innerHTML = `
      <div class="dhikr-counter-card">
        <div style="font-size:0.75rem;color:var(--text2);margin-bottom:8px;">${current+1} / ${DHIKR_COUNTER_DATA.length}</div>
        <div class="dhikr-counter-arabic" style="color:${d.color}">${d.arabic}</div>
        <div style="font-style:italic;color:var(--text2);font-size:0.85rem;margin-bottom:4px;">${d.transliteration}</div>
        <div style="font-size:0.8rem;color:var(--text2);margin-bottom:12px;">${d.english}</div>
        <div class="dhikr-counter-num" style="color:${d.color}">${cnt}</div>
        <div class="dhikr-counter-target">Target: ${d.target} ${cnt >= d.target ? '✅' : ''}</div>
        <div style="background:rgba(0,0,0,0.3);border-radius:30px;height:8px;overflow:hidden;margin:8px 0 16px;">
          <div style="height:100%;width:${pct}%;background:${d.color};border-radius:30px;transition:width 0.3s;"></div>
        </div>
        <button class="dhikr-tap-btn" onclick="App.tapDhikr()">+1</button>
        <div style="margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button class="dhikr-reset-btn" onclick="App.resetDhikr()">↺ Reset</button>
          <button class="dhikr-reset-btn" onclick="App.nextDhikr()">Next ▶</button>
        </div>
      </div>
    `;
  }

  function renderInspirations() {
    const idxs = S.inspireIdx && S.inspireIdx.length ? S.inspireIdx : [0,1,2,3,4];
    document.getElementById('inspireArea').innerHTML = '<div class="section-title">💬 Inspirations</div>' + idxs.map(i => `<div class="content-card"><div class="content-english" style="font-size:1rem;line-height:1.8;">${INSPIRATIONS_POOL[i%INSPIRATIONS_POOL.length]}</div></div>`).join('');
  }
  function renderSahaba() {
    const el = document.getElementById('sahabaArea');
    if (!el) return;
    el.innerHTML = '<div class="section-title">⭐ The Companions (Sahabah)</div>' + SAHABA_POOL.map(s => `<div class="content-card"><div style="font-weight:700;color:var(--gold-light);margin-bottom:6px;">👤 ${s.title}</div><div class="content-english">${s.desc}</div></div>`).join('');
  }
  function renderGratitude() {
    const dt = today(), entries = S.gratitudeLog[dt] || [];
    let h = '<div class="section-title">🙌 Daily Gratitude Journal</div>';
    h += `<div style="background:var(--card2);border-radius:var(--radius);padding:16px;margin-bottom:16px;border:1px solid var(--border);">Today's entries (${entries.length}):</div>`;
    entries.forEach((e,i) => h += `<div class="quest-row">📖 ${i+1}. ${e}</div>`);
    h += `<input class="profile-input" id="gratInput" placeholder="I am grateful for..."><button class="shop-card" onclick="App.addGratitude()" style="justify-content:center;width:100%;">➕ Add Entry</button>`;
    document.getElementById('gratitudeArea').innerHTML = h;
  }
  function addGratitude() { const inp=document.getElementById('gratInput'); if(!inp?.value.trim()) return; const dt=today(); if(!S.gratitudeLog[dt]) S.gratitudeLog[dt]=[]; S.gratitudeLog[dt].push(inp.value.trim()); inp.value=''; saveState(); renderGratitude(); checkA(); }
  function renderFasting() {
    const dt = today(), fasted = !!S.fastingDays[dt];
    let h = '<div class="section-title">🌙 Fasting Tracker</div>';
    h += `<label class="quest-row"><span style="flex:1">Fasted today?</span><input type="checkbox" class="quest-check" ${fasted?'checked':''} onchange="App.toggleFasting()"></label>`;
    const start=ms(), end=me(); let cnt=0;
    for (const dk in S.fastingDays) if (dk>=start && dk<=end && S.fastingDays[dk]) cnt++;
    h += `<div class="content-card"><div class="content-english">✅ ${cnt} fasting days this month</div><div class="content-english" style="font-size:0.85rem;color:var(--text2);">Monday & Thursday are most recommended (Sunnah)</div></div>`;
    document.getElementById('fastingArea').innerHTML = h;
  }
  function toggleFasting() { const dt=today(); S.fastingDays[dt]=!S.fastingDays[dt]; if(S.fastingDays[dt]) S.td.fasting=(S.td.fasting||0)+1; else S.td.fasting=Math.max(0,(S.td.fasting||0)-1); saveState(); renderFasting(); }
  function renderCharity() {
    const cm = S.charity; if (cm.monthStart !== ms()) { cm.monthStart=ms(); cm.given=0; }
    let h = '<div class="section-title">🤲 Charity Tracker</div>';
    h += `<div class="content-card"><div class="content-english">Daily target: <strong style="color:var(--gold)">${cm.daily||'Not set'}</strong></div><input type="number" id="charityDaily" placeholder="Set daily target" class="profile-input"></div>`;
    h += `<div class="content-card"><div class="content-english">Monthly target: <strong style="color:var(--gold)">${cm.monthly||'Not set'}</strong></div><input type="number" id="charityMonthly" placeholder="Set monthly target" class="profile-input"></div>`;
    h += `<div class="content-card"><div class="content-english">Given this month: <strong style="color:var(--green)">${cm.given} / ${cm.monthly||'?'}</strong></div><input type="number" id="charityGiven" placeholder="Log amount given today" class="profile-input"></div>`;
    h += `<button class="shop-card" onclick="App.setCharityGoals()" style="justify-content:center;width:100%;">💾 Save & Log</button>`;
    document.getElementById('charityArea').innerHTML = h;
  }
  function setCharityGoals() { const d=parseInt(document.getElementById('charityDaily').value); const m=parseInt(document.getElementById('charityMonthly').value); const g=parseInt(document.getElementById('charityGiven').value); if(!isNaN(d)) S.charity.daily=d; if(!isNaN(m)) S.charity.monthly=m; if(!isNaN(g)) S.charity.given+=g; saveState(); renderCharity(); }
  function renderMemorization() {
    let h = '<div class="section-title">📗 Memorization Tracker</div>';
    h += `<div class="stat-card" style="margin-bottom:16px;"><div class="stat-num">${S.memorized}</div><div>Surahs Memorized</div></div>`;
    h += `<input class="profile-input" id="memInput" placeholder="Surah name (e.g., Al-Fatiha)"><button class="shop-card" onclick="App.addMemorization()" style="justify-content:center;width:100%;">➕ Add Surah</button>`;
    if (S.memorizationList.length) { h += '<div class="section-title" style="margin-top:20px;">📖 Memorized List</div>'; S.memorizationList.forEach(s => h += `<div class="quest-row">📗 ${s}</div>`); }
    document.getElementById('memorizationArea').innerHTML = h;
  }
  function addMemorization() { const inp=document.getElementById('memInput'); if(!inp?.value.trim()) return; S.memorizationList.push(inp.value.trim()); S.memorized++; inp.value=''; saveState(); renderMemorization(); checkA(); }
  function renderMorning() {
    const dt = today(); if (!S.morningDone[dt]) S.morningDone[dt] = {};
    const total = MORNING_DHIKR.length;
    let completed = 0;
    for (let i=0; i<total; i++) { if (S.morningDone[dt][i]) completed++; }
    
    let h = `<div class="section-title" style="display:flex;justify-content:space-between;align-items:center;">
      <span>🌅 Morning Adhkar (After Fajr)</span>
      <span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--gold-light);font-weight:700;">${completed} / ${total}</span>
    </div><div style="display:flex;flex-direction:column;gap:12px;">`;
    MORNING_DHIKR.forEach((item, idx) => { 
        const done = !!S.morningDone[dt][idx]; 
        h += `<div class="vol-card${done?' done':''}" onclick="App.toggleMorning(${idx}, ${item.xp})" style="cursor:pointer;">
            <div class="prayer-check" style="font-size:1.2rem;">${done?'✓':'🌅'}</div>
            <div class="prayer-info">
                <div style="font-family:'Amiri',serif;font-size:1.3rem;margin-bottom:2px;color:var(--gold);line-height:1.4;">${item.arabic}</div>
                ${item.roman ? `<div style="font-size:0.85rem;color:var(--text1);font-style:italic;margin-bottom:6px;opacity:0.9;">"${item.roman}"</div>` : ''}
                <div class="prayer-name">${item.text}</div>
                <div style="font-size:0.8rem;color:var(--text2);margin-top:4px;">${item.reward}</div>
            </div>
            <div class="prayer-xp">+${item.xp} XP</div>
        </div>`; 
    });
    document.getElementById('morningArea').innerHTML = h + '</div>';
  }
  function toggleMorning(idx, xp) { 
    const dt=today(); if(!S.morningDone[dt]) S.morningDone[dt]={}; 
    const w = !!S.morningDone[dt][idx];
    const oldLv=S.lv;
    S.morningDone[dt][idx] = !w; 
    if(xp){
      if(!w) { S.xp+=xp; window.playSound('pop'); }
      else S.xp=Math.max(0, S.xp-xp);
      S.lv=lvFrom(S.xp);
      if(S.lv>oldLv){ const t=lvTitle(S.lv); window.levelUpToast(S.lv, t); }
    }
    saveState(); renderAll(); 
  }
  function renderEvening() {
    const dt = today(); if (!S.eveningDone[dt]) S.eveningDone[dt] = {};
    const total = EVENING_DHIKR.length;
    let completed = 0;
    for (let i=0; i<total; i++) { if (S.eveningDone[dt][i]) completed++; }
    
    let h = `<div class="section-title" style="display:flex;justify-content:space-between;align-items:center;">
      <span>🌆 Evening Adhkar (After Asr)</span>
      <span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--gold-light);font-weight:700;">${completed} / ${total}</span>
    </div><div style="display:flex;flex-direction:column;gap:12px;">`;
    EVENING_DHIKR.forEach((item, idx) => { 
        const done = !!S.eveningDone[dt][idx]; 
        h += `<div class="vol-card${done?' done':''}" onclick="App.toggleEvening(${idx}, ${item.xp})" style="cursor:pointer;">
            <div class="prayer-check" style="font-size:1.2rem;">${done?'✓':'🌆'}</div>
            <div class="prayer-info">
                <div style="font-family:'Amiri',serif;font-size:1.3rem;margin-bottom:2px;color:var(--gold);line-height:1.4;">${item.arabic}</div>
                ${item.roman ? `<div style="font-size:0.85rem;color:var(--text1);font-style:italic;margin-bottom:6px;opacity:0.9;">"${item.roman}"</div>` : ''}
                <div class="prayer-name">${item.text}</div>
                <div style="font-size:0.8rem;color:var(--text2);margin-top:4px;">${item.reward}</div>
            </div>
            <div class="prayer-xp">+${item.xp} XP</div>
        </div>`; 
    });
    document.getElementById('eveningArea').innerHTML = h + '</div>';
  }
  function toggleEvening(idx, xp) { 
    const dt=today(); if(!S.eveningDone[dt]) S.eveningDone[dt]={}; 
    const w = !!S.eveningDone[dt][idx];
    const oldLv=S.lv;
    S.eveningDone[dt][idx] = !w; 
    if(xp){
      if(!w) { S.xp+=xp; window.playSound('pop'); }
      else S.xp=Math.max(0, S.xp-xp);
      S.lv=lvFrom(S.xp);
      if(S.lv>oldLv){ const t=lvTitle(S.lv); window.levelUpToast(S.lv, t); }
    }
    saveState(); renderAll(); 
  }
  function renderQ() {
    const questArea = document.getElementById('questArea');
    const openStates = questArea ? Array.from(questArea.querySelectorAll('details.cat-details')).map(d => d.open) : [true, false, false, false, false];
    
    const renderQuestGroup = (title, quests, type, isOpen) => {
      if (!quests || quests.length===0) return '';
      const total = quests.length;
      const completed = quests.filter(q => q.done).length;
      const openAttr = isOpen ? ' open' : '';
      
      let html = `<details class="cat-details"${openAttr}><summary><div style="display:flex;justify-content:space-between;align-items:center;flex:1;"><span>${title}</span><span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--gold-light);font-weight:700;">${completed} / ${total}</span></div></summary><div style="padding:0 12px 12px;display:flex;flex-direction:column;gap:8px;margin-top:8px;">`;
      html += quests.map(q => {
        const d = q.done;
        let icon = '🎯';
        const t = q.d.toLowerCase();
        if (t.includes('pray') || t.includes('prayer')) icon = '🕌';
        if (t.includes('quran')) icon = '📖';
        if (t.includes('charity')) icon = '🤲';
        if (t.includes('fast')) icon = '🌙';
        if (t.includes('deed')) icon = '🌟';
        if (t.includes('streak') || t.includes('day')) icon = '🔥';
        if (t.includes('dhikr') || t.includes('adhkar') || t.includes('istighfar')) icon = '📿';
        if (t.includes('memorize')) icon = '🧠';
        
        return `<div class="vol-card${d?' done':''}" onclick="App.toggleQuest('${q.id}','${type}',${q.xp})" style="cursor:pointer;">
          <div class="prayer-check">${d?'✓':icon}</div>
          <div class="prayer-info"><div class="prayer-name">${q.d}</div></div>
          <div class="prayer-xp">+${q.xp} XP</div>
        </div>`;
      }).join('');
      return html + '</div></details>';
    };

    let h = renderQuestGroup('📋 Daily Quests', S.dq, 'daily', openStates[0]);
    h += renderQuestGroup('📅 Weekly Quests', S.wq, 'weekly', openStates[1]);
    h += renderQuestGroup('🗓️ Monthly Quests', S.mq, 'monthly', openStates[2]);
    h += renderQuestGroup('📆 Yearly Quests', S.yq, 'yearly', openStates[3]);
    h += renderQuestGroup('🏆 Lifetime Quests', S.lq, 'lifetime', openStates[4]);
    h += `<div style="text-align:center;margin-top:20px;color:var(--text2);">Total quests completed: <strong style="color:var(--gold)">${S.tq||0}</strong></div>`;
    
    if(questArea) questArea.innerHTML = h;
  }
  function renderChallenges() {
    const t = today();
    if (S.cd !== t) { S.cd = t; S.chd = {}; }
    if (!S.chd) S.chd = {};
    
    const w = ws();
    if (S.cwd !== w) { S.cwd = w; S.chw = {}; }
    if (!S.chw) S.chw = {};

    const m = ms();
    if (S.cmd !== m) { S.cmd = m; S.chm = {}; }
    if (!S.chm) S.chm = {};

    const y = ys();
    if (S.cyd !== y) { S.cyd = y; S.chy = {}; }
    if (!S.chy) S.chy = {};

    if (!S.chl) S.chl = {};

    const chDaily = [
      { id:'c1', icon: '🕌', d:'Pray all 5 prayers on time today', xp:60 },
      { id:'c2', icon: '📖', d:'Read Surah Al-Kahf (Friday special)', xp:50, f: isFri },
      { id:'c3', icon: '🤲', d:'Give charity in secret', xp:40 },
      { id:'c4', icon: '🌙', d:'Fast today (Mon/Thu)', xp:50, f: ()=>[1,4].includes(new Date().getDay()) },
      { id:'c5', icon: '💚', d:'Recite 100x Salawat on the Prophet ﷺ', xp:30 },
      { id:'c6', icon: '🌌', d:'Pray 12 Rakat of Sunnah today', xp:70 },
      { id:'c7', icon: '📗', d:'Read 1 Juz of the Quran', xp:100 },
      { id:'c8', icon: '🤝', d:'Forgive someone who wronged you', xp:80 },
      { id:'c9', icon: '🍽️', d:'Feed a fasting person at Iftar', xp:60, f: ()=>[1,4].includes(new Date().getDay()) },
      { id:'c10', icon: '🧠', d:'Memorize a new Ayah', xp:45 },
      { id:'c11', icon: '👨‍👩‍👧‍👦', d:'Help a family member with a chore', xp:35 },
      { id:'c12', icon: '🌌', d:'Wake up for Tahajjud tonight', xp:80 },
      { id:'c13', icon: '🎧', d:'Listen to an Islamic lecture or khutbah', xp:40 },
      { id:'c14', icon: '😊', d:'Smile at a stranger (Sunnah)', xp:20 },
      { id:'c15', icon: '💯', d:"Learn a new Name of Allah and its meaning", xp:30 },
      { id:'c16', icon: '🌞', d:'Perform complete morning adhkar', xp:35 },
      { id:'c17', icon: '🌆', d:'Complete evening adhkar', xp:35 },
      { id:'c18', icon: '🤲', d:'Make 10 minutes of du\'a today', xp:45 },
      { id:'c19', icon: '📞', d:'Call a relative you haven\'t spoken to in a while', xp:40 },
      { id:'c20', icon: '🏡', d:'Do something kind for a neighbor', xp:35 },
      { id:'c21', icon: '📖', d:'Read the meaning of 5 new Ayahs', xp:30 },
      { id:'c22', icon: '💧', d:'Maintain Wudu throughout the entire day', xp:60 },
      { id:'c23', icon: '📵', d:'Avoid social media for 4 hours to focus on Ibadah', xp:50 },
      { id:'c24', icon: '👅', d:'Refrain completely from backbiting today', xp:80 },
      { id:'c25', icon: '📿', d:'Do 33x SubhanAllah, 33x Alhamdulillah, 34x AllahuAkbar after every fard salah', xp:100 }
    ].filter(c => !c.f || c.f());

    const chWeekly = [
      { id:'cw1', icon: '📖', d:'Complete reading 1 full Juz this week', xp:150 },
      { id:'cw2', icon: '🕌', d:'Attend Jumuah prayer early and listen to Khutbah attentively', xp:120 },
      { id:'cw3', icon: '🌙', d:'Fast at least 2 days (Monday & Thursday)', xp:200 },
      { id:'cw4', icon: '🍽️', d:'Provide a meal for a needy person or family', xp:150 },
      { id:'cw5', icon: '🌌', d:'Pray Tahajjud on 3 different nights', xp:250 }
    ];

    const chMonthly = [
      { id:'cm1', icon: '📖', d:'Complete the recitation of the entire Quran', xp:1000 },
      { id:'cm2', icon: '🌙', d:'Fast the 3 white days (13th, 14th, 15th)', xp:500 },
      { id:'cm3', icon: '🤲', d:'Donate a significant portion of income to charity (Zakat/Sadaqah)', xp:400 },
      { id:'cm4', icon: '🧠', d:'Memorize a complete new Surah', xp:600 },
      { id:'cm5', icon: '📚', d:'Read an entire Islamic book (Seerah, Tafsir, etc.)', xp:700 }
    ];

    const chYearly = [
      { id:'cy1', icon: '🕋', d:'Perform I\'tikaf in the last 10 days of Ramadan', xp:3000 },
      { id:'cy2', icon: '📖', d:'Read the entire Quran with Translation and Tafsir', xp:5000 },
      { id:'cy3', icon: '🤝', d:'Sponsor an orphan for the year', xp:4000 },
      { id:'cy4', icon: '🧠', d:'Memorize one of the long Surahs (e.g. Al-Baqarah, Al-Imran)', xp:6000 },
      { id:'cy5', icon: '🕌', d:'Pray 1000 Congregational prayers in the Masjid', xp:4500 }
    ];

    const chLifetime = [
      { id:'cl1', icon: '🕋', d:'Perform Hajj (The major pilgrimage)', xp:50000 },
      { id:'cl2', icon: '🕋', d:'Perform Umrah', xp:20000 },
      { id:'cl3', icon: '🕌', d:'Build or heavily contribute to building a Masjid', xp:40000 },
      { id:'cl4', icon: '📖', d:'Memorize the entire Quran (Hafiz)', xp:100000 },
      { id:'cl5', icon: '🌳', d:'Plant a tree or dig a well as continuous charity (Sadaqah Jariyah)', xp:30000 }
    ];

    const challengeArea = document.getElementById('challengeArea');
    const openStates = challengeArea ? Array.from(challengeArea.querySelectorAll('details.cat-details')).map(d => d.open) : [true, false, false, false, false];

    const renderChallengeGroup = (title, challenges, type, isOpen, stateDict) => {
      const total = challenges.length;
      let completed = 0;
      challenges.forEach(c => { if(stateDict[c.id]) completed++; });
      const openAttr = isOpen ? ' open' : '';
      
      let html = `<details class="cat-details"${openAttr}><summary><div style="display:flex;justify-content:space-between;align-items:center;flex:1;"><span>${title}</span><span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--gold-light);font-weight:700;">${completed} / ${total}</span></div></summary><div style="padding:0 12px 12px;display:flex;flex-direction:column;gap:8px;margin-top:8px;">`;
      
      html += challenges.map(c => {
        const d = !!stateDict[c.id];
        return `<div class="vol-card${d?' done':''}" onclick="App.completeChallenge('${c.id}',${c.xp},${!d},'${type}')" style="cursor:pointer;">
          <div class="prayer-check">${d?'✓':c.icon}</div>
          <div class="prayer-info"><div class="prayer-name">${c.d}</div></div>
          <div class="prayer-xp">+${c.xp} XP</div>
        </div>`;
      }).join('') + '</div></details>';
      return html;
    };

    let html = renderChallengeGroup('⚔️ Daily Challenges', chDaily, 'daily', openStates[0], S.chd);
    html += renderChallengeGroup('🛡️ Weekly Challenges', chWeekly, 'weekly', openStates[1], S.chw);
    html += renderChallengeGroup('🗡️ Monthly Challenges', chMonthly, 'monthly', openStates[2], S.chm);
    html += renderChallengeGroup('🏰 Yearly Challenges', chYearly, 'yearly', openStates[3], S.chy);
    html += renderChallengeGroup('👑 Lifetime Challenges', chLifetime, 'lifetime', openStates[4], S.chl);
    
    if(challengeArea) challengeArea.innerHTML = html;
  }
  function completeChallenge(id, xp, isChecked, type) {
    let d = S.chd;
    if (type === 'weekly') d = S.chw;
    if (type === 'monthly') d = S.chm;
    if (type === 'yearly') d = S.chy;
    if (type === 'lifetime') d = S.chl;
    
    if (!d) d = {};
    d[id] = isChecked;
    
    if (type === 'weekly') S.chw = d;
    else if (type === 'monthly') S.chm = d;
    else if (type === 'yearly') S.chy = d;
    else if (type === 'lifetime') S.chl = d;
    else S.chd = d;

    const oldLv=S.lv;
    if (isChecked) { S.xp+=xp; toast('⚔️','Challenge done! +'+xp+' XP'); }
    else { S.xp=Math.max(0,S.xp-xp); }
    S.lv=lvFrom(S.xp);
    if(S.lv>oldLv){ const t=lvTitle(S.lv); levelUpToast(S.lv, t); }
    saveState(); renderAll();
  }
  function renderAch() {
  const cnt = Object.keys(S.ua).length;
  const total = ACHS.length;
  const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;

  let h = '<div class="ach-header">';
  h += `<div class="section-title">🏆 Trophy Cabinet</div>`;
  h += `<div class="ach-progress"><span class="ach-progress-bar" style="width:${pct}%"></span></div>`;
  h += `<div class="ach-progress-text">${cnt} / ${total} Unlocked</div>`;
  h += '</div>';

  h += '<div class="ach-grid">';
  h += ACHS.map(a => {
    const u = !!S.ua[a.id];
    const tierStars = a.tier === 'legendary' ? '⭐⭐⭐' : a.tier === 'diamond' || a.tier === 'platinum' ? '⭐⭐' : '⭐';
    return `<div class="ach-card${u ? ' unlocked' : ' locked'}">
      <div class="ach-tier">${tierStars}</div>
      <div class="ach-icon">${u ? a.icon : '🔒'}</div>
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
  function renderProg() {
    const stats = [
      { icon: '🕌', value: S.tp, label: 'Prayers' },
      { icon: '📅', value: S.pd, label: 'Perfect Days' },
      { icon: '🔥', value: S.bs, label: 'Best Streak' },
      { icon: '⭐', value: S.lv, label: 'Level' },
      { icon: '📋', value: S.tq || 0, label: 'Quests Done' },
      { icon: '✋', value: Object.values(S.td).reduce((a, b) => a + b, 0), label: 'Extra Deeds' }
    ];

    document.getElementById('statArea').innerHTML = `<div class="prog-stats">
      ${stats.map(s => `<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-num">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
    </div>`;

    const now = new Date();
    const tk = today();
    const dim = new Date(calViewYear, calViewMonth + 1, 0).getDate();
    const fd = new Date(calViewYear, calViewMonth, 1).getDay();
    const gMonthName = now.toLocaleString('en', { month: 'long' });
    const isCurrentMonth = calViewYear === now.getFullYear() && calViewMonth === now.getMonth();

    let cal = '<div class="cal-header">';
    cal += '<div class="cal-nav"><button onclick="App.calPrevMonth()">◀</button></div>';
    cal += '<div class="cal-header-info">';
    cal += `<h3>${gMonthName} ${calViewYear}</h3>`;
    cal += `<div class="cal-hijri-title">${HIJRI_MONTHS_AR[calViewHijriM - 1]} ${calViewHijriY} هـ</div>`;
    cal += '</div>';
    cal += '<div class="cal-nav"><button onclick="App.calNextMonth()">▶</button>';
    if (!isCurrentMonth) cal += ' <button class="cal-today-btn" onclick="App.calGoToday()">Today</button>';
    cal += '</div></div>';

    // Weekday headers - English + Arabic
    cal += '<div class="cal-grid">';
    for (let i = 0; i < 7; i++) {
      cal += `<div class="cal-weekday">${WEEKDAYS_EN[i]}<br><span class="cal-weekday ar">${WEEKDAYS_AR[i]}</span></div>`;
    }

    // Empty cells before month starts
    for (let i = 0; i < fd; i++) cal += '<div class="cal-day empty"></div>';

    // Day cells with dual dates
    for (let d = 1; d <= dim; d++) {
      const dk = today(new Date(calViewYear, calViewMonth, d));
      const log = S.log[dk];
      const cnt = log ? Object.values(log.p || {}).filter(v => v).length : 0;
      let cls = cnt >= 5 ? 'good' : (cnt > 0 ? 'ok' : (dk < tk ? 'bad' : ''));
      if (dk === tk) cls += ' now';

      // Get Hijri date for this day
      const h = gregorianToHijri(calViewYear, calViewMonth + 1, d);
      const hDay = h.day;

      cal += `<div class="cal-day ${cls}"><span class="g-date">${d}</span><span class="h-date">${hDay}</span></div>`;
    }
    cal += '</div>';

    // Legend
    cal += '<div class="cal-legend">';
    cal += '<div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(16,185,129,0.5);"></div>5 prayers</div>';
    cal += '<div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(245,158,11,0.5);"></div>Some prayers</div>';
    cal += '<div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(239,68,68,0.5);"></div>Missed</div>';
    cal += '<div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(212,175,55,0.5);"></div>Today</div>';
    cal += '</div>';

    document.getElementById('calArea').innerHTML = cal;
  }
  function renderShop() { document.getElementById('shopArea').innerHTML=SHOP.map(r=>{ const o=!!S.ur[r.id]; return `<div class="shop-card" onclick="${o?'':'App.buy(\''+r.id+'\')'}"><span style="font-size:1.8rem">${r.icon}</span><div style="flex:1"><strong>${r.name}</strong></div><span class="shop-cost">${o?'✅ Owned':'💎 '+r.cost+' XP'}</span></div>`; }).join(''); }
  function renderProfile() {
    const achCnt = Object.keys(S.ua).length;
    const avatar = S.avatar || '👳';
    const joinDate = S.joinDate ? new Date(S.joinDate).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : null;

    let h = '<div class="section-title">👤 Profile</div>';

    // Identity card
    h += `<div class="profile-identity">
      <div class="profile-avatar-wrap" onclick="App.toggleAvatarPicker()">
        <span class="profile-avatar">${avatar}</span>
        <span class="profile-avatar-edit">✏️</span>
      </div>
      <div class="profile-info">
        <h2 class="profile-name">${currentUser === 'default' ? 'Guest' : currentUser}</h2>
        <div class="profile-level">Level ${S.lv} · ${lvTitle(S.lv)}</div>
        ${joinDate ? `<div class="profile-join">Member since ${joinDate}</div>` : ''}
      </div>
    </div>`;

    // Avatar picker (hidden by default)
    const emojis = ['👳','🕋','🕌','📿','⭐','🕊️','📖','🌙','🤲','📕','🧎'];
    h += `<div class="avatar-picker" id="avatarPicker" style="display:none;">
      <div class="avatar-grid">
        ${emojis.map(e => `<div class="avatar-option${e === avatar ? ' selected' : ''}" onclick="App.selectAvatar('${e}')">${e}</div>`).join('')}
      </div>
    </div>`;

    // Stats row (4 cards)
    h += '<div class="profile-stats">';
    h += `<div class="stat-card"><div class="stat-icon">⭐</div><div class="stat-num">${S.xp}</div><div class="stat-label">Total XP</div></div>`;
    h += `<div class="stat-card"><div class="stat-icon">🕌</div><div class="stat-num">${S.tp}</div><div class="stat-label">Prayers</div></div>`;
    h += `<div class="stat-card"><div class="stat-icon">🔥</div><div class="stat-num">${S.cs}</div><div class="stat-label">Streak</div></div>`;
    h += `<div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-num">${achCnt}</div><div class="stat-label">Achievements</div></div>`;
    h += '</div>';

    // Settings
    h += '<div class="section-title">⚙️ Settings</div>';
    h += '<div class="profile-settings">';
    h += '<div style="display:flex;gap:8px;margin-bottom:10px;"><input class="profile-input" id="usernameInput" placeholder="Switch user" style="margin-bottom:0;"><button class="shop-card" onclick="App.switchUser()" style="padding:10px 14px;border-radius:var(--radius-sm);">💾</button></div>';
    h += '<button class="shop-card" style="width:100%;justify-content:center;margin-bottom:10px;" onclick="App.logout()">🔓 Logout</button>';
    h += '</div>';

    // Danger zone
    h += '<div class="danger-zone"><h3 style="color:var(--red)">⚠️ Danger Zone</h3><p style="font-size:0.8rem;color:var(--text2);margin-bottom:10px;">Reset permanently deletes all your progress.</p><button class="danger-btn" onclick="App.resetAll()">🔄 Reset All Data</button></div>';

    document.getElementById('profileArea').innerHTML = h;
  }
  function renderStats() {
    if (window.Dashboard && typeof Dashboard.renderInsights === 'function') {
      Dashboard.renderInsights();
    } else {
      const el = document.getElementById('statsArea');
      if (!el) return;
      el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text2);">Loading analytics...</div>';
    }
  }
  function renderTimer() {
    if (window.timerInt) clearInterval(window.timerInt);
    function tick(times) {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const prayers = ['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(n => ({ n, ...times[n] })).filter(p => p.h != null);
      let next = null;
      for (const p of prayers) {
        const pMin = p.h * 60 + p.m;
        if (pMin > nowMin) { next = p; break; }
      }
      let d = new Date();
      if (!next) { next = prayers[0]; d.setDate(d.getDate() + 1); }
      d.setHours(next.h, next.m, 0, 0);
      const diff = d - now;
      if (diff < 0) return;
      const hh = String(Math.floor(diff / (1000*60*60))).padStart(2,'0');
      const mm = String(Math.floor((diff / (1000*60)) % 60)).padStart(2,'0');
      const ss = String(Math.floor((diff / 1000) % 60)).padStart(2,'0');
      const te = document.getElementById('timerArea');
      const pna = document.getElementById('prayerNamesArea');
      if (te) te.innerText = `${hh}:${mm}:${ss}`;
      if (pna) pna.innerText = `Until ${next.n}`;
    }
    fetchPrayerTimes().then(times => {
      if (!times) return;
      tick(times);
      window.timerInt = setInterval(() => tick(times), 1000);
    });
  }

  window.renderDynamic = renderDynamic;
  window.renderStatic = renderStatic;
  window.renderAll = renderAll;
  window.renderToday = renderToday;
  window.renderLv = renderLv;
  window.renderStr = renderStr;
  window.renderBonus = renderBonus;
  window.renderTip = renderTip;
  window.renderPrayers = renderPrayers;
  window.renderVol = renderVol;
  window.renderDeeds = renderDeeds;
  window.renderDailyWidgetArea = renderDailyWidgetArea;
  window.renderDailyWidget = renderDailyWidget;
  window.fetchPrayerTimes = fetchPrayerTimes;
  window.gregorianToHijri = gregorianToHijri;
  window.hijriToGregorian = hijriToGregorian;
  window.initCalView = initCalView;
  window.calPrevMonth = calPrevMonth;
  window.calNextMonth = calNextMonth;
  window.calGoToday = calGoToday;
  window.HIJRI_MONTHS = HIJRI_MONTHS;
  window.HIJRI_MONTHS_AR = HIJRI_MONTHS_AR;
  window.WEEKDAYS_EN = WEEKDAYS_EN;
  window.WEEKDAYS_AR = WEEKDAYS_AR;
  window.poolRender = poolRender;
  window.getSourceLink = getSourceLink;
  window.renderDuas = renderDuas;
  window.renderQuran = renderQuran;
  window.renderSunnahs = renderSunnahs;
  window.renderDhikr = renderDhikr;
  window.renderStories = renderStories;
  window.renderHadith = renderHadith;
  window.renderNames = renderNames;
  window.renderSins = renderSins;
  window.renderPunishments = renderPunishments;
  window.renderRepentance = renderRepentance;
  window.renderSeerah = renderSeerah;
  window.renderTafsir = renderTafsir;
  window.renderManners = renderManners;
  window.renderAqeedah = renderAqeedah;
  window.renderFamily = renderFamily;
  window.renderHealth = renderHealth;
  window.renderFinance = renderFinance;
  window.renderUmmah = renderUmmah;
  window.renderHajj = renderHajj;
  window.renderAkhirah = renderAkhirah;
  window.renderProphets = renderProphets;
  window.renderWomen = renderWomen;
  window.renderKnowledge = renderKnowledge;
  window.renderHeart = renderHeart;
  window.renderJumuah = renderJumuah;
  window.renderMarriage = renderMarriage;
  window.renderScience = renderScience;
  window.renderWudu = renderWudu;
  window.renderScholars = renderScholars;
  window.renderPatience = renderPatience;
  window.renderWork = renderWork;
  window.renderCommunity = renderCommunity;
  window.renderEnvironment = renderEnvironment;
  window.renderTravel = renderTravel;
  window.renderFiqh = renderFiqh;
  window.renderArabic = renderArabic;
  window.renderTawakkul = renderTawakkul;
  window.renderIkhlas = renderIkhlas;
  window.renderZuhd = renderZuhd;
  window.renderDawah = renderDawah;
  window.renderCivilisation = renderCivilisation;
  window.renderBattles = renderBattles;
  window.renderJannah = renderJannah;
  window.renderJahannam = renderJahannam;
  window.renderGrave = renderGrave;
  window.renderSigns = renderSigns;
  window.renderDreams = renderDreams;
  window.renderParenting = renderParenting;
  window.renderFood = renderFood;
  window.renderTibb = renderTibb;
  window.renderYouth = renderYouth;
  window.renderTech = renderTech;
  window.renderNeighbors = renderNeighbors;
  window.renderSalah = renderSalah;
  window.renderPrayerTimes = renderPrayerTimes;
  window.renderDhikrCounter = renderDhikrCounter;
  window.renderInspirations = renderInspirations;
  window.renderSahaba = renderSahaba;
  window.renderGratitude = renderGratitude;
  window.renderFasting = renderFasting;
  window.renderCharity = renderCharity;
  window.renderMemorization = renderMemorization;
  window.renderMorning = renderMorning;
  window.renderEvening = renderEvening;
  window.renderQ = renderQ;
  window.renderChallenges = renderChallenges;
  window.renderAch = renderAch;
  window.renderProg = renderProg;
  window.renderShop = renderShop;
  window.renderProfile = renderProfile;
  window.renderStats = renderStats;
  window.renderTimer = renderTimer;
  window.setQuranView = setQuranView;
  window.quranSearchFilter = quranSearchFilter;
  window.openQuranSurah = openQuranSurah;
  window.quranBack = quranBack;
  window.openQuranJuz = openQuranJuz;
  window.openHadithCollection = openHadithCollection;
  window.hadithBack = hadithBack;
  window.addGratitude = addGratitude;
  window.toggleFasting = toggleFasting;
  window.setCharityGoals = setCharityGoals;
  window.addMemorization = addMemorization;
  window.toggleMorning = toggleMorning;
  window.toggleEvening = toggleEvening;
  window.completeChallenge = completeChallenge;
  window.playQuranVerse = playQuranVerse;
  window.playSurah = playSurah;
  window.stopSurah = stopSurah;
  window.setQuranReciter = setQuranReciter;
  window.globalSearch = globalSearch;
  window.executeSearch = executeSearch;

  // NEW_POOLS renderers are defined in actions.js (with proper titles from NEW_POOL_TITLES)

})();