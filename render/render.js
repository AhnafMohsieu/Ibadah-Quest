(function() {
  // Lucide removed — no-op stub
  function refreshLucideIcons() {}

  // -------------------------------------------------------
  // RENDERING
  // -------------------------------------------------------

  function renderDynamic() {
    const pageScroll = window.scrollY;
    const volArea = document.getElementById('volArea');
    const deedArea = document.getElementById('deedArea');
    const questArea = document.getElementById('questArea');
    
    const volScroll = volArea ? volArea.scrollTop : 0;
    const deedScroll = deedArea ? deedArea.scrollTop : 0;
    const questScroll = questArea ? questArea.scrollTop : 0;

    const safe = (fn, name) => { try { fn(); } catch(e) { console.warn('Render ' + name + ' failed:', e.message); } };
    safe(renderTopBar, 'TopBar'); safe(renderLv, 'Lv'); safe(renderStr, 'Str'); safe(renderToday, 'Today'); safe(renderQ, 'Q'); safe(renderAch, 'Ach'); safe(renderProg, 'Prog'); safe(renderShop, 'Shop'); safe(renderProfile, 'Profile'); safe(renderTimer, 'Timer'); safe(renderPrayerTimes, 'PrayerTimes'); safe(renderStats, 'Stats'); safe(() => window.renderGarden && window.renderGarden(), 'Garden'); safe(() => window.renderLantern && window.renderLantern(), 'Lantern'); safe(() => window.renderMuhasabahEntry && window.renderMuhasabahEntry(), 'MuhEntry'); safe(() => window.renderJourneys && window.renderJourneys(), 'Journeys'); safe(() => window.renderBoat && window.renderBoat(), 'Boat'); safe(() => window.renderKeys && window.renderKeys(), 'Keys'); safe(() => window.renderMosque && window.renderMosque(), 'Mosque'); safe(() => window.renderRamadan && window.renderRamadan(), 'Ramadan'); safe(() => window.renderLaylat && window.renderLaylat(), 'Laylat'); safe(() => window.renderHeartRefinement && window.renderHeartRefinement(), 'HeartRefinement'); safe(() => window.renderArmor && window.renderArmor(), 'Armor'); safe(() => window.renderSpiritualGrowthTab && window.renderSpiritualGrowthTab(), 'GrowthTab'); safe(() => window.autoTrackJourneyProgress && window.autoTrackJourneyProgress(), 'AutoTrackJourneys');

    if (volArea) volArea.scrollTop = volScroll;
    if (deedArea) deedArea.scrollTop = deedScroll;
    if (questArea) questArea.scrollTop = questScroll;
    window.scrollTo(0, pageScroll);
    refreshLucideIcons();
  }

  function renderStatic() {
    const safe = (fn, name) => { try { fn(); } catch(e) { console.warn('Static ' + name + ' failed:', e.message); } };
    safe(renderQuran,'Quran'); safe(renderSunnahs,'Sunnahs'); safe(renderDhikr,'Dhikr'); safe(renderDhikrCounter,'DhikrCounter'); safe(renderStories,'Stories'); safe(renderHadith,'Hadith'); safe(renderNames,'Names'); safe(renderInspirations,'Inspirations'); safe(renderGratitude,'Gratitude'); safe(renderFasting,'Fasting'); safe(renderCharity,'Charity'); safe(renderMemorization,'Memorization'); safe(renderMorning,'Morning'); safe(renderEvening,'Evening'); safe(renderSins,'Sins'); safe(renderPunishments,'Punishments'); safe(renderRepentance,'Repentance'); safe(renderSahaba,'Sahaba'); safe(renderSeerah,'Seerah'); safe(renderTafsir,'Tafsir'); safe(renderManners,'Manners'); safe(renderFamily,'Family'); safe(renderHealth,'Health'); safe(() => window.renderHealthLog && window.renderHealthLog(), 'HealthLog'); safe(renderFinance,'Finance'); safe(() => window.renderFinanceTab && window.renderFinanceTab(), 'FinanceTab'); safe(() => window.renderMoodTab && window.renderMoodTab(), 'MoodTab'); safe(renderUmmah,'Ummah'); safe(renderHajj,'Hajj'); safe(renderAkhirah,'Akhirah'); safe(renderProphets,'Prophets'); safe(renderWomen,'Women'); safe(renderHeart,'Heart'); safe(renderMarriage,'Marriage'); safe(renderScience,'Science'); safe(renderWudu,'Wudu'); safe(renderScholars,'Scholars'); safe(renderPatience,'Patience'); safe(renderWork,'Work'); safe(renderCommunity,'Community'); safe(renderEnvironment,'Environment'); safe(renderTravel,'Travel'); safe(renderFiqh,'Fiqh'); safe(renderArabic,'Arabic'); safe(renderTawakkul,'Tawakkul'); safe(renderIkhlas,'Ikhlas'); safe(renderZuhd,'Zuhd');     safe(renderDawah,'Dawah'); safe(renderAqeedah,'Aqeedah'); safe(renderKnowledge,'Knowledge'); safe(renderCivilisation,'Civilisation'); safe(renderJumuah,'Jumuah'); safe(renderBattles,'Battles'); safe(renderJannah,'Jannah'); safe(renderJahannam,'Jahannam'); safe(renderGrave,'Grave'); safe(renderSigns,'Signs'); safe(renderDreams,'Dreams'); safe(renderParenting,'Parenting'); safe(renderFood,'Food'); safe(renderTibb,'Tibb'); safe(renderYouth,'Youth'); safe(renderTech,'Tech'); safe(renderNeighbors,'Neighbors');
    if (typeof NEW_POOLS !== 'undefined') Object.keys(NEW_POOLS).forEach(k => {
      if(window['render'+k]) safe(window['render'+k], k);
    });
    refreshLucideIcons();
  }

function renderAll() {
  document.body.classList.remove('loading');
  renderDynamic();
  renderStatic();
}
  function renderToday() { renderBonus(); renderPrayers(); renderVol(); renderDeeds(); }

  // Hijri Calendar Conversion (Tabular Islamic Calendar algorithm)
  const HIJRI_MONTHS = ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Thani','Rajab','Sha\'ban','Ramadan','Shawwal','Dhul Qi\'dah','Dhul Hijjah'];
  const HIJRI_MONTHS_AR = ['المحرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
  const WEEKDAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const WEEKDAYS_AR = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const WEEKDAYS_ROM = ['Ahad','Ithnayn','Thulatha','Arbi\'a','Khamis','Jumu\'ah','Sabt'];

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
  // ── Prayer rendering ──
  function renderPrayers() {
    const l = tlog(), f = isFri();
    const cards = PRAYERS.map(p => {
      const d = !!l.p[p.id]; let nm=p.name, ic=p.icon, xp=p.xp;
      if (f && p.id==='dhuhr') { nm=p.fri.name; ic=p.fri.icon; xp=p.fri.xp; }
      if (S.ab && S.ab.exp >= today()) xp *= 2;
      return `<div class="card-item${d?' done':''}" onclick="App.toggleP('${p.id}')"><div class="card-icon">${iqIcon(p.id)}</div><div class="card-name">${nm}</div><div class="card-sub">${p.time}</div><div class="card-xp">+${xp} XP</div>${d?'<div class="card-check">'+iqIcon('check')+'</div>':''}<div class="card-info-btn" onclick="event.stopPropagation();App.detail('${p.id}')">ℹ</div></div>`;
    }).join('');
    document.getElementById('prayerArea').innerHTML = '<div class="section-title">Daily Prayers</div><div class="card-grid">' + cards + '</div>';
  }
  function renderVol() {
    const volArea = document.getElementById('volArea');
    const openStates = volArea ? Array.from(volArea.querySelectorAll('details.cat-details')).map(d => d.open) : [];
    const l = tlog().v || {};
    const byCat = {};
    VOLUNTARY.forEach(v => { if (!v.name || v.name.trim()==='') return; const cat = v.cat || 'General'; if (!byCat[cat]) byCat[cat]=[]; byCat[cat].push(v); });
    
    const catIcons = {
      'Night Prayers': iqIcon('moon'),
      'Occasional Prayers': iqIcon('hand-heart'),
      'Other Daily Prayers': iqIcon('beads'),
      'Special Events': iqIcon('sparkles'),
      'General': iqIcon('mosque')
    };

    let html = '';
    let catIdx = 0;
    for (const cat in byCat) {
      const catIcon = catIcons[cat] || iqIcon('mosque');
      const totalInCat = byCat[cat].length;
      const completedInCat = byCat[cat].filter(v => !!l[v.id]).length;
      const isOpen = catIdx < openStates.length ? openStates[catIdx] : false;
      html += `<details class="cat-details"${isOpen ? ' open' : ''}><summary><div style="display:flex;justify-content:space-between;align-items:center;flex:1;"><span>${catIcon} ${cat}</span><span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--gold-light);font-weight:700;">${completedInCat} / ${totalInCat}</span></div></summary><div style="padding:8px 4px;">`;
      html += '<div class="card-grid">';
      html += byCat[cat].map(v => { const d=!!l[v.id]; let xp=v.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; return `<div class="card-item${d?' done':''}" onclick="App.toggleV('${v.id}')"><div class="card-icon">${iqIcon(v.icon || v.id)}</div><div class="card-name">${v.name}</div><div class="card-xp">+${xp} XP</div>${d?'<div class="card-check">' + iqIcon('check') + '</div>':''}<div class="card-info-btn" onclick="event.stopPropagation();App.detail('${v.id}')">${iqIcon('info')}</div></div>`; }).join('');
      html += '</div></div></details>';
      catIdx++;
    }
    if (volArea) volArea.innerHTML = html;
  }
  function renderDeeds() {
    const deedArea = document.getElementById('deedArea');
    const openStates = deedArea ? Array.from(deedArea.querySelectorAll('details.cat-details')).map(d => d.open) : [];

    // -- 7-category normaliser ----------------------------------------------
    const CAT_MAP = {
      'Ibadah & Spirituality':            'mosque|Ibadah & Spirituality',
      'Faith, Intention & Worship':  'mosque|Ibadah & Spirituality',
      "Qur'an, Dhikr & Dua":        'mosque|Ibadah & Spirituality',
      'Charity & Social':            'wallet|Charity & Giving',
      'Charity & Helping Others':    'wallet|Charity & Giving',
      'Neighbors & Community':       'wallet|Charity & Giving',
      'Animals & Environment':       'wallet|Charity & Giving',
      'Unique Small Deeds':          'wallet|Charity & Giving',
      'Character & Ethics':          'gem|Character & Ethics',
      'Character & Self-Control':    'gem|Character & Ethics',
      'Avoiding Harm & Positive Intentions': 'gem|Character & Ethics',
      'Knowledge & Learning':        'book-open|Knowledge & Learning',
      'Knowledge & Teaching':        'book-open|Knowledge & Learning',
      'Family & Relatives':          'users|Family & Relations',
      'Parents & Family':            'users|Family & Relations',
      'Daily Sunnahs':               'sun|Daily Sunnahs',
      'Work, Money & Daily Life':    'sun|Daily Sunnahs',
      'General':                     'mosque|General'
    };
    const CAT_ORDER = [
      'mosque|Ibadah & Spirituality',
      'wallet|Charity & Giving',
      'gem|Character & Ethics',
      'book-open|Knowledge & Learning',
      'users|Family & Relations',
      'sun|Daily Sunnahs',
      'mosque|General'
    ];
    const catDisplayName = (c) => {
      const parts = c.split('|');
      if (parts.length === 2) return iqIcon(parts[0]) + ' ' + parts[1];
      return c;
    };

    const l = tlog().d || {};
    const byCat = {};
    CAT_ORDER.forEach(c => { byCat[c] = []; });

    DEEDS.forEach(d => {
      const rawCat = d.cat || 'General';
      const normCat = CAT_MAP[rawCat] || 'mosque|General';
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
      html += `<details class="cat-details"${isOpen ? ' open' : ''}><summary><div style="display:flex;justify-content:space-between;align-items:center;flex:1;"><span>${catDisplayName(cat)}</span><span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--gold-light);font-weight:700;">${completedInCat} / ${totalInCat}</span></div></summary><div style="padding:8px 4px;">`;
      html += '<div class="card-grid">';
      html += items.map(d => { const done=!!l[d.id]; const tot=S.td[d.id]||0; let xp=d.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; return `<div class="card-item${done?' done':''}" onclick="App.toggleD('${d.id}')"><div class="card-icon">${iqIcon(d.icon || d.id)}</div><div class="card-name">${d.name}</div><div class="card-xp">+${xp} XP</div>${done?'<div class="card-check">' + iqIcon('check') + '</div>':''}${tot?`<div class="card-sub">${tot}×</div>`:''}<div class="card-info-btn" onclick="event.stopPropagation();App.tip('${d.id}')">${iqIcon('info')}</div></div>`; }).join('');
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
    if (idx.length === 0 && !showAll) {
      const stateKey = areaId.replace('Area', '');
      const es = EMPTY_STATES[stateKey];
      if (es) {
        el.innerHTML = `<div class="section-title">${title}</div>
          <div class="empty-state">
            <div class="empty-state-icon">${iqIcon(es.icon)}</div>
            <div class="empty-state-title">${es.title}</div>
            <div class="empty-state-desc">${es.desc}</div>
            <button class="empty-state-btn" onclick="App.activateTab('${es.tab}')">${es.cta}</button>
          </div>`;
        return;
      }
    }
    el.innerHTML = html + idx.map((i, mapIdx) => {
      const o = pool[i % pool.length];
      if (!o) return '';
      
      const numBadge = `<span style="display:inline-block; background:var(--rose); color:var(--gold-light); border:1px solid rgba(var(--accent-rgb),0.4); border-radius:12px; padding:0 8px; font-size:0.75rem; margin-right:8px; font-weight:800; height:22px; line-height:20px; white-space:nowrap; font-family:var(--font);">#${mapIdx + 1}</span>`;

      if (typeof o === 'string') return `<div class="content-card" onclick="if(typeof window.grantDailyXp==='function')window.grantDailyXp(2,'read|${areaId}|${i}')"><div style="display:flex;align-items:flex-start;gap:10px;"><div style="margin-top:2px;">${numBadge}</div><div class="content-english" style="flex:1;">${o}</div></div></div>`;
      
      let inner = '';
      if (o.arabic) inner += `<div class="content-arabic">${o.arabic}</div>`;
      if (o.transliteration || o.roman) inner += `<div style="font-size:0.9rem;color:var(--text2);opacity:0.9;font-style:italic;margin-bottom:6px;text-align:right;">${o.transliteration || o.roman}</div>`;
      inner += `<div class="content-english">${o.desc || o.text || o.english || ''}</div>`;
      if (o.source) inner += `<div class="content-source">${iqIcon('book-open')} ${o.source}<a class="verify-btn" href="${getSourceLink(o.source)}" target="_blank" rel="noopener noreferrer" title="Verify this source">Verify</a></div>`;
      
      let title_line = '';
      if (o.title) {
        title_line = `<div style="font-weight:700;margin-bottom:6px;color:var(--gold-light);display:flex;align-items:flex-start;"><div style="margin-top:1px;">${numBadge}</div><span style="line-height:1.4;">${o.title}</span></div>`;
      } else if (o.name && o.arabic && !o.title) {
        inner = `<div style="font-weight:700;font-size:1.1rem;color:var(--gold-light);display:flex;align-items:flex-start;margin-bottom:6px;"><div style="margin-top:3px;">${numBadge}</div><span style="line-height:1.3;">${o.name}</span></div><div class="content-arabic arabic-letter-glow">${o.arabic}</div><div class="content-english">${o.desc||''}</div>`;
      } else {
        return `<div class="content-card" style="flex-direction:row;align-items:flex-start;" onclick="if(typeof window.grantDailyXp==='function')window.grantDailyXp(2,'read|${areaId}|${i}')"><div style="margin-top:2px;">${numBadge}</div><div style="flex:1;">${inner}</div></div>`;
      }
      
      return `<div class="content-card" onclick="if(typeof window.grantDailyXp==='function')window.grantDailyXp(2,'read|${areaId}|${i}')">${title_line}${inner}</div>`;
    }).join('');
  }

  function renderDuas() { poolRender('duaArea', iqIcon('hand-heart') + ' Daily Duas',DUA_POOL,'duaIdx'); }

  const EMPTY_STATES = {
    dhikr: { icon:'beads', title:'Start Your Dhikr', desc:'The Prophet ﷺ said: "Verily, in the remembrance of Allah do hearts find rest."', cta:'Begin Dhikr', tab:'dhikr' },
    dua: { icon:'hand-heart', title:'Daily Duas', desc:'Supplicate to Allah — He loves to be asked.', cta:'Learn Duas', tab:'duas' },
    heart: { icon:'heart', title:'Purify Your Heart', desc:'Indeed, in the remembrance of Allah do hearts find rest.', cta:'Explore', tab:'heart' },
    sins: { icon:'alert-triangle', title:'Stay Vigilant', desc:'Be mindful of Allah and He will protect you.', cta:'Review Sins', tab:'sins' },
    charity: { icon:'hand-heart', title:'Give Charity', desc:'Charity does not decrease wealth. (Muslim)', cta:'Log Charity', tab:'finance' },
    fasting: { icon:'moon', title:'Track Your Fast', desc:'Whoever fasts a day for Allah\'s sake, Allah will distance him from Hell.', cta:'Log Fast', tab:'fasting' },
    family: { icon:'family', title:'Strengthen Family Ties', desc:'Whoever believes in Allah and the Last Day, let him maintain family ties.', cta:'Learn More', tab:'family' },
    patience: { icon:'hourglass', title:'Practice Patience', desc:'Indeed, Allah is with the patient.', cta:'Learn', tab:'patience' },
    stories: { icon:'book-open', title:'Read Inspiring Stories', desc:'Indeed, in their stories is a lesson for those of understanding.', cta:'Read Stories', tab:'stories' }
  };

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
    html += `<div class="quran-header"><h2>${s.ar}</h2><div style="font-family:'Amiri',serif;font-size:1.3rem;color:var(--gold);margin:4px 0;">${s.en}</div><div class="quran-sub">${s.ay} verses · ${s.type}</div></div>`;
    html += `<div style="text-align:center;margin:8px 0 12px;"><button id="surahPlayBtn" class="surah-play-btn" onclick="App.playSurah(${surahNum})">▶ Play Surah</button></div>`;
    const verses = QURAN_POOL.filter(v => {
      if (!v.source) return false;
      const m = v.source.match(/(\d+):(\d+)/);
      return m && parseInt(m[1]) === surahNum;
    });
    if (surahNum !== 1) {
      html += `<div style="text-align:center;font-size:1.6rem;color:var(--gold);font-family:'Amiri',serif;margin:16px 0;">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>`;
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
    html += `<div class="quran-header"><h2>Juz ${juzNum} · ${j ? j.name : ''}</h2><div style="font-family:'Amiri',serif;font-size:1.2rem;color:var(--gold);margin:4px 0;">${startS.en} → ${endS.en}</div><div class="quran-sub">${startS.n}:${firstLocal} · ${endS.n}:${lastLocal} · ${verseCount} verses</div></div>`;
    html += `<div style="text-align:center;margin:8px 0 12px;"><button id="juzPlayBtn" class="surah-play-btn" onclick="App.playJuz(${juzNum})">▶ Play Juz</button></div>`;
    if (startS.n !== 1) { html += `<div style="text-align:center;font-size:1.6rem;color:var(--gold);font-family:'Amiri',serif;margin:16px 0;">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>`; }

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
  function renderSunnahs() { poolRender('sunnahArea', iqIcon('sun') + ' Daily Sunnahs',SUNNAH_POOL,'sunnahIdx'); }
  function renderDhikr() { poolRender('dhikrArea', iqIcon('beads') + ' Dhikr Collection',DHIKR_POOL,'dhikrIdx'); }
  function renderStories() { poolRender('storiesArea', iqIcon('book-open') + ' Inspiring Stories',STORIES,'storiesIdx',true); }
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
  function renderNames() {
    const el = document.getElementById('namesArea');
    if (!el) return;
    if (!NAMES) return;
    let html = `<div class="section-title">${iqIcon('mosque')} 99 Names of Allah</div>`;
    html += NAMES.map((o, i) => {
      if (!o) return '';
      const numBadge = `<span style="display:inline-block; background:var(--rose); color:var(--gold-light); border:1px solid rgba(var(--accent-rgb),0.4); border-radius:12px; padding:0 8px; font-size:0.75rem; margin-right:8px; font-weight:800; height:22px; line-height:20px; white-space:nowrap; font-family:var(--font);">#${i + 1}</span>`;
      return `<div class="content-card name-card">
        <div style="align-self:flex-end; display:flex;">${numBadge}</div>
        <div class="content-arabic name-an">${o.arabic || ''}</div>
        <div class="name-roman">${o.name || o.roman || ''}</div>
        <div class="content-english" style="text-align:center;">${o.desc || ''}</div>
      </div>`;
    }).join('');
    el.innerHTML = html;
  }
  function renderSins() { poolRender('sinsArea', iqIcon('alert-triangle') + ' Major Sins to Avoid',SINS_POOL,'sinsIdx'); }
  function renderPunishments() { poolRender('punishmentsArea', iqIcon('scales') + ' Islamic Justice',PUNISHMENTS_POOL,'punishmentsIdx'); }
  function renderRepentance() { poolRender('repentanceArea', iqIcon('refresh-cw') + ' Repentance & Tawbah',REPENTANCE_POOL,'repentanceIdx'); }
  function renderSeerah() { poolRender('seerahArea', iqIcon('book-open') + ' Life of the Prophet ﷺ',SEERAH_POOL,'seerahIdx',true); }
  function renderTafsir() { poolRender('tafsirArea', iqIcon('book-open') + ' Quranic Tafsir',TAFSIR_POOL,'tafsirIdx'); }
  function renderManners() { poolRender('mannersArea', iqIcon('handshake') + ' Islamic Manners (Adab)',MANNERS_POOL,'mannersIdx'); }
  function renderAqeedah() { poolRender('aqeedahArea', iqIcon('mosque') + ' Islamic Aqeedah',AQEEDAH_POOL,'aqeedahIdx'); }
  function renderFamily() { poolRender('familyArea', iqIcon('users') + ' Family & Kinship',FAMILY_POOL,'familyIdx'); }
  function renderHealth() { poolRender('healthArea', iqIcon('heart') + ' Health & Well-being',HEALTH_POOL,'healthIdx'); }
  function renderFinance() { poolRender('financeArea', iqIcon('wallet') + ' Halal Finance',FINANCE_POOL,'financeIdx'); }
  function renderUmmah() { poolRender('ummahArea', iqIcon('globe') + ' The Muslim Ummah',UMMAH_POOL,'ummahIdx'); }
  function renderHajj() { poolRender('hajjArea', iqIcon('kaaba') + ' Hajj & Umrah',HAJJ_POOL,'hajjIdx'); }
  function renderAkhirah() { poolRender('akhirahArea', iqIcon('globe') + ' The Hereafter',AKHIRAH_POOL,'akhirahIdx'); }
  function renderProphets() { poolRender('prophetsArea', iqIcon('book-open') + ' Stories of the Prophets',PROPHETS_POOL,'prophetsIdx',true); }
  function renderWomen() { poolRender('womenArea', iqIcon('user') + ' Great Muslim Women',WOMEN_POOL,'womenIdx',true); }
  function renderKnowledge() { poolRender('knowledgeArea', iqIcon('book') + ' Seeking Knowledge',KNOWLEDGE_POOL,'knowledgeIdx'); }
  function renderHeart() { poolRender('heartArea', iqIcon('heart') + ' Diseases of the Heart',HEART_POOL,'heartIdx'); }
  function renderJumuah() { poolRender('jumuahArea', iqIcon('mosque') + ' Friday (Jumuah) Virtues',JUMUAH_POOL,'jumuahIdx', true); }
  function renderMarriage() { poolRender('marriageArea', iqIcon('gem') + ' Marriage & Halal Love',MARRIAGE_POOL,'marriageIdx'); }
  function renderScience() { poolRender('scienceArea', iqIcon('microscope') + ' Islam & Science',SCIENCE_POOL,'scienceIdx',true); }
  function renderWudu() { poolRender('wuduArea', iqIcon('droplets') + ' Wudu & Taharah',WUDU_POOL,'wuduIdx', true); }
  function renderScholars() { poolRender('scholarsArea', iqIcon('award') + ' Great Islamic Scholars',SCHOLARS_POOL,'scholarsIdx'); }
  function renderPatience() { poolRender('patienceArea', iqIcon('gem') + ' Sabr & Shukr',PATIENCE_POOL,'patienceIdx'); }
  function renderWork() { poolRender('workArea', iqIcon('briefcase') + ' Career & Work Ethics',WORK_POOL,'workIdx'); }
  function renderCommunity() { poolRender('communityArea', iqIcon('building') + ' Community & Society',COMMUNITY_POOL,'communityIdx'); }
  function renderEnvironment() { poolRender('environmentArea', iqIcon('leaf') + ' Nature & Environment',ENVIRONMENT_POOL,'environmentIdx'); }
  function renderTravel() { poolRender('travelArea', iqIcon('plane') + ' Travel & Safar',TRAVEL_POOL,'travelIdx'); }
  function renderFiqh() { poolRender('fiqhArea', iqIcon('book-open') + ' Islamic Jurisprudence (Fiqh)',FIQH_POOL,'fiqhIdx'); }
  function renderArabic() { poolRender('arabicArea', 'Learn Arabic',ARABIC_POOL,'arabicIdx',true); }
  function renderTawakkul() { poolRender('tawakkulArea', iqIcon('handshake') + ' Tawakkul · Trust in Allah',TAWAKKUL_POOL,'tawakkulIdx'); }
  function renderIkhlas() { poolRender('ikhlasArea', iqIcon('heart') + ' Ikhlas · Sincerity',IKHLAS_POOL,'ikhlasIdx'); }
  function renderZuhd() { poolRender('zuhdArea', iqIcon('sparkles') + ' Zuhd · Asceticism',ZUHD_POOL,'zuhdIdx'); }
  function renderDawah() { poolRender('dawahArea', iqIcon('megaphone') + " Da'wah · Inviting to Islam",DAWAH_POOL,'dawahIdx'); }
  function renderCivilisation() { poolRender('civilisationArea', iqIcon('landmark') + ' Islamic Civilisation',CIVILISATION_POOL,'civilisationIdx'); }
  function renderBattles() { poolRender('battlesArea', iqIcon('shield') + ' Battles of Islam',BATTLES_POOL,'battlesIdx',true); }
  function renderJannah() { poolRender('jannahArea', iqIcon('flower') + ' Jannah · Paradise',JANNAH_POOL,'jannahIdx'); }
  function renderJahannam() { poolRender('jahannamArea', iqIcon('flame') + ' Jahannam · Hellfire',JAHANNAM_POOL,'jahannamIdx'); }
  function renderGrave() { poolRender('graveArea', iqIcon('coffin') + ' The Grave & Life After Death',GRAVE_POOL,'graveIdx'); }
  function renderSigns() { poolRender('signsArea', iqIcon('hourglass') + ' Signs of Qiyamah',SIGNS_POOL,'signsIdx'); }
  function renderDreams() { poolRender('dreamsArea', iqIcon('moon') + ' Islamic Dreams',DREAMS_POOL,'dreamsIdx'); }
  function renderParenting() { poolRender('parentingArea', iqIcon('baby') + ' Islamic Parenting',PARENTING_POOL,'parentingIdx'); }
  function renderFood() { poolRender('foodArea', iqIcon('utensils') + ' Halal & Haram Food',FOOD_POOL,'foodIdx'); }
  function renderTibb() { poolRender('tibbArea', iqIcon('leaf') + ' Tibb Nabawi (Prophetic Medicine)',TIBB_POOL,'tibbIdx'); }
  function renderYouth() { poolRender('youthArea', iqIcon('user') + ' Youth & Islam',YOUTH_POOL,'youthIdx'); }
  function renderTech() { poolRender('techArea', iqIcon('monitor') + ' Technology & Islam',TECH_POOL,'techIdx'); }
  function renderNeighbors() { poolRender('neighborsArea', iqIcon('home') + ' Rights of Neighbors',NEIGHBORS_POOL,'neighborsIdx'); }
  function renderSalah() {
    const el = document.getElementById('salahArea');
    if (!el) return;
    el.innerHTML = '<div class="section-title">' + iqIcon('kaaba') + ' Salah Guide</div>' + [
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
      const numBadge = `<span style="display:inline-block; background:var(--rose); color:var(--gold-light); border:1px solid rgba(var(--accent-rgb),0.4); border-radius:12px; padding:0 8px; font-size:0.75rem; margin-right:8px; font-weight:800; height:22px; line-height:20px; white-space:nowrap; font-family:var(--font);">#${i + 1}</span>`;
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
    const icons = { Fajr: iqIcon('sunrise'), Sunrise: iqIcon('sun'), Dhuhr: iqIcon('sun'), Asr: iqIcon('cloud-sun'), Maghrib: iqIcon('sunset'), Isha: iqIcon('moon') };
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

  function renderDhikrAnalytics() {
    const stats = S.dhikrStats || { total: {}, daily: {}, streak: 0 };
    const totalDhikr = Object.values(stats.total).reduce((a, b) => a + b, 0);
    const todaySessions = stats.daily[today()] || {};
    const todayCount = Object.values(todaySessions).reduce((a, b) => a + b, 0);
    
    return `
      <div class="dhikr-analytics">
        <div class="section-title">${iqIcon('bar-chart-3')} Dhikr Statistics</div>
        <div class="dhikr-stats-row">
          <div class="dhikr-stat-item">
            <div class="dhikr-stat-num">${totalDhikr}</div>
            <div class="dhikr-stat-label">Total Dhikr</div>
          </div>
          <div class="dhikr-stat-item">
            <div class="dhikr-stat-num">${todayCount}</div>
            <div class="dhikr-stat-label">Today</div>
          </div>
          <div class="dhikr-stat-item">
            <div class="dhikr-stat-num">${stats.streak}</div>
            <div class="dhikr-stat-label">Streak</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderDhikrCounter() {
    const el = document.getElementById('dhikrCounterArea');
    if (!el) return;
    if (!S.dhikrCounters) S.dhikrCounters = {};
    const current = S.dhikrCounters._active || 0;
    const d = DHIKR_COUNTER_DATA[current % DHIKR_COUNTER_DATA.length];
    const cnt = S.dhikrCounters[current] || 0;
    const pct = Math.min(100, Math.round((cnt / d.target) * 100));
    el.innerHTML = renderDhikrAnalytics() + `
      <div class="dhikr-counter-card">
        <div style="font-size:0.75rem;color:var(--text2);margin-bottom:8px;">${current+1} / ${DHIKR_COUNTER_DATA.length}</div>
        <div class="dhikr-counter-arabic" style="color:${d.color}">${d.arabic}</div>
        <div style="font-style:italic;color:var(--text2);font-size:0.85rem;margin-bottom:4px;">${d.transliteration}</div>
        <div style="font-size:0.8rem;color:var(--text2);margin-bottom:12px;">${d.english}</div>
        <div class="dhikr-counter-num" style="color:${d.color}">${cnt}</div>
        <div class="dhikr-counter-target">Target: ${d.target} ${cnt >= d.target ? iqIcon('check') : ''}</div>
        <div style="background:rgba(0,0,0,0.3);border-radius:30px;height:8px;overflow:hidden;margin:8px 0 16px;">
          <div style="height:100%;width:${pct}%;background:${d.color};border-radius:30px;transition:width 0.3s;"></div>
        </div>
        <button class="dhikr-tap-btn" onclick="this.classList.add('tap'); setTimeout(() => this.classList.remove('tap'), 400); App.tapDhikr();">+1</button>
        <div style="margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button class="dhikr-reset-btn" onclick="App.resetDhikr()">${iqIcon('refresh-cw')} Reset</button>
          <button class="dhikr-reset-btn" onclick="App.nextDhikr()">Next ▶</button>
        </div>
      </div>
    `;
  }

  function renderInspirations() {
    const idxs = S.inspireIdx && S.inspireIdx.length ? S.inspireIdx : [0,1,2,3,4];
    document.getElementById('inspireArea').innerHTML = '<div class="section-title">' + iqIcon('sparkles') + ' Inspirations</div>' + idxs.map(i => `<div class="content-card"><div class="content-english" style="font-size:1rem;line-height:1.8;">${INSPIRATIONS_POOL[i%INSPIRATIONS_POOL.length]}</div></div>`).join('');
  }
  function renderSahaba() {
    const el = document.getElementById('sahabaArea');
    if (!el) return;
    el.innerHTML = '<div class="section-title">' + iqIcon('users') + ' The Companions (Sahabah)</div>' + SAHABA_POOL.map(s => `<div class="content-card"><div style="font-weight:700;color:var(--gold-light);margin-bottom:6px;">${iqIcon('star')} ${s.title}</div><div class="content-english">${s.desc}</div></div>`).join('');
  }
  function renderGratitude() {
    const dt = today(), entries = S.gratitudeLog[dt] || [];
    let h = '<div class="section-title">' + iqIcon('pencil') + ' Daily Gratitude Journal</div>';
    h += `<div style="background:var(--card2);border-radius:var(--radius);padding:16px;margin-bottom:16px;border:1px solid var(--border);">Today's entries (${entries.length}):</div>`;
    entries.forEach((e,i) => h += `<div class="quest-row">${iqIcon('check')} ${i+1}. ${e}</div>`);
    h += `<input class="profile-input" id="gratInput" placeholder="I am grateful for..."><button class="shop-card" onclick="App.addGratitude()" style="justify-content:center;width:100%;">${iqIcon('plus')} Add Entry</button>`;
    document.getElementById('gratitudeArea').innerHTML = h;
  }
  function addGratitude() { const inp=document.getElementById('gratInput'); if(!inp?.value.trim()) return; const dt=today(); if(!S.gratitudeLog[dt]) S.gratitudeLog[dt]=[]; S.gratitudeLog[dt].push(inp.value.trim()); inp.value=''; if (typeof window.grantCappedDailyXp === 'function') window.grantCappedDailyXp(3, 'gratitude', 3); saveState(); renderGratitude(); checkA(); }
  function renderFasting() {
    const dt = today(), fasted = !!S.fastingDays[dt];
    let h = '<div class="section-title">' + iqIcon('calendar') + ' Fasting Tracker</div>';
    h += `<label class="quest-row"><span style="flex:1">Fasted today?</span><input type="checkbox" class="quest-check" ${fasted?'checked':''} onchange="App.toggleFasting()"></label>`;
    const start=ms(), end=me(); let cnt=0;
    for (const dk in S.fastingDays) if (dk>=start && dk<=end && S.fastingDays[dk]) cnt++;
    h += `<div class="content-card"><div class="content-english">${iqIcon('calendar')} ${cnt} fasting days this month</div><div class="content-english" style="font-size:0.85rem;color:var(--text2);">Monday & Thursday are most recommended (Sunnah)</div></div>`;
    document.getElementById('fastingArea').innerHTML = h;
  }
  function toggleFasting() { const dt=today(); S.fastingDays[dt]=!S.fastingDays[dt]; const oldLv=S.lv; if(S.fastingDays[dt]) { S.td.fasting=(S.td.fasting||0)+1; S.xp += 50; window.playSound('pop'); } else { S.td.fasting=Math.max(0,(S.td.fasting||0)-1); S.xp = Math.max(0,S.xp-50); } S.lv = lvFrom(S.xp); if(S.lv>oldLv && window.levelUpToast) window.levelUpToast(S.lv, lvTitle(S.lv)); saveState(); renderFasting(); if (typeof window !== 'undefined' && window.renderLv) window.renderLv(); if (typeof window !== 'undefined' && window.renderTopBar) window.renderTopBar(); }
  function renderCharity() {
    const cm = S.charity; if (cm.monthStart !== ms()) { cm.monthStart=ms(); cm.given=0; }
    let h = '<div class="section-title">' + iqIcon('wallet') + ' Charity Tracker</div>';
    h += `<div class="content-card"><div class="content-english">Daily target: <strong style="color:var(--gold)">${cm.daily||'Not set'}</strong></div><input type="number" id="charityDaily" placeholder="Set daily target" class="profile-input"></div>`;
    h += `<div class="content-card"><div class="content-english">Monthly target: <strong style="color:var(--gold)">${cm.monthly||'Not set'}</strong></div><input type="number" id="charityMonthly" placeholder="Set monthly target" class="profile-input"></div>`;
    h += `<div class="content-card"><div class="content-english">Given this month: <strong style="color:var(--green)">${cm.given} / ${cm.monthly||'?'}</strong></div><input type="number" id="charityGiven" placeholder="Log amount given today" class="profile-input"></div>`;
    h += `<button class="shop-card" onclick="App.setCharityGoals()" style="justify-content:center;width:100%;">${iqIcon('save')} Save & Log</button>`;
    h += '<div class="section-title">' + iqIcon('book-open') + ' Charity Knowledge</div>';
    h += `<div class="content-card"><div class="content-english">Waqf (Endowments)</div><div class="content-english" style="font-size:0.85rem;color:var(--text2);">The Islamic institution of Waqf allows individuals to dedicate land or assets permanently for public benefit. Awqaf historically funded hospitals, schools, and water fountains.</div></div>`;
    h += `<div class="content-card"><div class="content-english">Sadaqah Jariyah</div><div class="content-english" style="font-size:0.85rem;color:var(--text2);">Continuous charity. If you build a well, plant a tree, or write a useful book, you continue to receive reward even after death as long as people benefit from it. (Sahih Muslim)</div></div>`;
    document.getElementById('charityArea').innerHTML = h;
  }
  function setCharityGoals() { const d=parseInt(document.getElementById('charityDaily').value); const m=parseInt(document.getElementById('charityMonthly').value); const g=parseInt(document.getElementById('charityGiven').value); if(!isNaN(d)) S.charity.daily=d; if(!isNaN(m)) S.charity.monthly=m; if(!isNaN(g)) S.charity.given+=g; saveState(); renderCharity(); }
  function renderMemorization() {
    let h = '<div class="section-title">' + iqIcon('brain') + ' Memorization Tracker</div>';
    h += `<div class="stat-card" style="margin-bottom:16px;"><div class="stat-num">${S.memorized}</div><div>Surahs Memorized</div></div>`;
    h += `<input class="profile-input" id="memInput" placeholder="Surah name (e.g., Al-Fatiha)"><button class="shop-card" onclick="App.addMemorization()" style="justify-content:center;width:100%;">${iqIcon('plus')} Add Surah</button>`;
    if (S.memorizationList.length) { h += '<div class="section-title" style="margin-top:20px;">' + iqIcon('clipboard') + ' Memorized List</div>'; S.memorizationList.forEach(s => h += `<div class="quest-row">${iqIcon('check')} ${s}</div>`); }
    document.getElementById('memorizationArea').innerHTML = h;
  }
  function addMemorization() { const inp=document.getElementById('memInput'); if(!inp?.value.trim()) return; S.memorizationList.push(inp.value.trim()); S.memorized++; inp.value=''; if (typeof window.grantCappedDailyXp === 'function') window.grantCappedDailyXp(3, 'memorization', 5); saveState(); renderMemorization(); checkA(); }
  function renderMorning() {
    const dt = today(); if (!S.morningDone[dt]) S.morningDone[dt] = {};
    const total = MORNING_DHIKR.length;
    let completed = 0;
    for (let i=0; i<total; i++) { if (S.morningDone[dt][i]) completed++; }
    
    let h = `<div class="section-title" style="display:flex;justify-content:space-between;align-items:center;">
      <span>${iqIcon('sunrise')} Morning Adhkar (After Fajr)</span>
      <span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--gold-light);font-weight:700;">${completed} / ${total}</span>
    </div><div style="display:flex;flex-direction:column;gap:12px;">`;
    MORNING_DHIKR.forEach((item, idx) => { 
        const done = !!S.morningDone[dt][idx]; 
        h += `<div class="vol-card${done?' done':''}" onclick="App.toggleMorning(${idx}, ${item.xp})" style="cursor:pointer;">
            <div class="prayer-check" style="font-size:1.2rem;">${done?iqIcon('check'):iqIcon('sun')}</div>
            <div class="prayer-info">
                <div style="font-family:'Amiri',serif;font-size:1.3rem;margin-bottom:2px;color:var(--gold);line-height:1.4;">${item.arabic}</div>
                ${item.roman ? `<div style="font-size:0.85rem;color:var(--text2);font-style:italic;margin-bottom:6px;opacity:0.9;">"${item.roman}"</div>` : ''}
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
      <span>${iqIcon('moon')} Evening Adhkar (After Asr)</span>
      <span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--gold-light);font-weight:700;">${completed} / ${total}</span>
    </div><div style="display:flex;flex-direction:column;gap:12px;">`;
    EVENING_DHIKR.forEach((item, idx) => { 
        const done = !!S.eveningDone[dt][idx]; 
        h += `<div class="vol-card${done?' done':''}" onclick="App.toggleEvening(${idx}, ${item.xp})" style="cursor:pointer;">
            <div class="prayer-check" style="font-size:1.2rem;">${done?iqIcon('check'):iqIcon('moon')}</div>
            <div class="prayer-info">
                <div style="font-family:'Amiri',serif;font-size:1.3rem;margin-bottom:2px;color:var(--gold);line-height:1.4;">${item.arabic}</div>
                ${item.roman ? `<div style="font-size:0.85rem;color:var(--text2);font-style:italic;margin-bottom:6px;opacity:0.9;">"${item.roman}"</div>` : ''}
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
        
        return `<div class="vol-card${d?' done':''}" onclick="App.toggleQuest('${q.id}','${type}',${q.xp})" style="cursor:pointer;">
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
    h += `<div style="text-align:center;margin-top:20px;color:var(--text2);">Total quests completed: <strong style="color:var(--gold)">${S.tq||0}</strong></div>`;
    
    if(questArea) questArea.innerHTML = h;
  }
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

  // Full trophy grid
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
  function renderProg() {
    const stats = [
      { icon: iqIcon('mosque'), value: S.tp, label: 'Prayers' },
      { icon: iqIcon('calendar'), value: S.pd, label: 'Perfect Days' },
      { icon: iqIcon('flame'), value: S.bs, label: 'Best Streak' },
      { icon: iqIcon('star'), value: S.lv, label: 'Level' },
      { icon: iqIcon('clipboard'), value: S.tq || 0, label: 'Quests Done' },
      { icon: iqIcon('medal'), value: Object.values(S.td).reduce((a, b) => a + b, 0), label: 'Extra Deeds' }
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
    cal += `<div class="cal-hijri-title">${HIJRI_MONTHS_AR[calViewHijriM - 1]} ${calViewHijriY} AH</div>`;
    cal += '</div>';
    cal += '<div class="cal-nav"><button onclick="App.calNextMonth()">▶</button>';
    if (!isCurrentMonth) cal += ' <button class="cal-today-btn" onclick="App.calGoToday()">Today</button>';
    cal += '</div></div>';

    // Weekday headers - English + Arabic + Romanization
    cal += '<div class="cal-grid">';
    for (let i = 0; i < 7; i++) {
      cal += `<div class="cal-weekday">${WEEKDAYS_EN[i]}<br><span class="cal-weekday ar">${WEEKDAYS_AR[i]}</span><br><span class="cal-weekday rom">${WEEKDAYS_ROM[i]}</span></div>`;
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
    cal += '<div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(22,163,74,0.5);"></div>5 prayers</div>';
    cal += '<div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(245,158,11,0.5);"></div>Some prayers</div>';
    cal += '<div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(239,68,68,0.5);"></div>Missed</div>';
    cal += '<div class="cal-legend-item"><div class="cal-legend-dot" style="background:var(--rose);"></div>Today</div>';
    cal += '</div>';

    document.getElementById('calArea').innerHTML = cal;
  }
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
  function renderProfile() {
    const achCnt = Object.keys(S.ua).length;
    const avatar = S.avatar || '';
    const joinDate = S.joinDate ? new Date(S.joinDate).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : null;

    let h = '<div class="section-title">Profile</div>';

    // Identity card
    h += `<div class="profile-identity">
      <div class="profile-avatar-wrap" onclick="App.toggleAvatarPicker()">
        <span class="profile-avatar">${avatar}</span>
      </div>
      <div class="profile-info">
        <h2 class="profile-name">${currentUser === 'default' ? 'Guest' : currentUser}</h2>
        <div class="profile-level">Level ${S.lv} · ${lvTitle(S.lv)}</div>
        ${joinDate ? `<div class="profile-join">Member since ${joinDate}</div>` : ''}
      </div>
    </div>`;

    // Stats row (4 cards)
    h += '<div class="profile-stats">';
    h += `<div class="stat-card"><div class="stat-num">${S.xp}</div><div class="stat-label">Total XP</div></div>`;
    h += `<div class="stat-card"><div class="stat-num">${S.tp}</div><div class="stat-label">Prayers</div></div>`;
    h += `<div class="stat-card"><div class="stat-num">${S.cs}</div><div class="stat-label">Streak</div></div>`;
    h += `<div class="stat-card"><div class="stat-icon">${iqIcon('trophy')}</div><div class="stat-num">${achCnt}</div><div class="stat-label">Achievements</div></div>`;
    h += '</div>';

    // Settings
    h += '<div class="section-title">' + iqIcon('settings') + ' Settings</div>';
    h += '<div class="profile-settings">';
    const curTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const themeChips = (window.Themes || []).map(m => `
      <button class="theme-chip${m.key === curTheme ? ' active' : ''}" data-key="${m.key}" role="switch" aria-checked="${m.key === curTheme}" onclick="App.setTheme('${m.key}')">
        <span class="theme-swatch" style="background:linear-gradient(135deg,${m.swatch.bg},${m.swatch.accent});"></span>
        <span class="name">${m.label}</span>
      </button>`).join('');
h += '<div style="margin-bottom:10px;font-weight:700;color:var(--gold-dark);">' + iqIcon('palette') + ' Theme</div>';
h += '<div class="theme-picker">' + themeChips + '</div>';
    h += '<div style="display:flex;gap:8px;margin-bottom:10px;"><input class="profile-input" id="usernameInput" placeholder="Switch user" style="margin-bottom:0;"><button class="shop-card" onclick="App.switchUser()" style="padding:10px 14px;border-radius:var(--radius-sm);">' + iqIcon('refresh-cw') + '</button></div>';
    h += '<button class="shop-card" style="width:100%;justify-content:center;margin-bottom:10px;font-weight:700;font-size:1rem;color:var(--gold);letter-spacing:0.5px;" onclick="App.logout()">' + iqIcon('log-out') + ' Logout</button>';
    h += '</div>';

    // Danger zone
    h += '<div class="danger-zone"><h3 style="color:var(--red)">' + iqIcon('alert-triangle') + ' Danger Zone</h3><p style="font-size:0.8rem;color:var(--text2);margin-bottom:10px;">Reset permanently deletes all your progress.</p><button class="danger-btn" onclick="App.resetAll()">' + iqIcon('trash') + ' Reset All Data</button></div>';

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
  window.renderTopBar = renderTopBar;

  window.renderDynamic = renderDynamic;
  window.renderStatic = renderStatic;
  window.renderAll = renderAll;
  window.renderToday = renderToday;
  window.renderLv = renderLv;
  window.renderStr = renderStr;
  window.renderBonus = renderBonus;
  window.renderPrayers = renderPrayers;
  window.renderVol = renderVol;
  window.renderDeeds = renderDeeds;
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
  window.openHadithBook = openHadithBook;
  window.hadithBack = hadithBack;
  window.addGratitude = addGratitude;
  window.toggleFasting = toggleFasting;
  window.setCharityGoals = setCharityGoals;
  window.addMemorization = addMemorization;
  window.toggleMorning = toggleMorning;
  window.toggleEvening = toggleEvening;
  window.playQuranVerse = playQuranVerse;
  window.playSurah = playSurah;
  window.stopSurah = stopSurah;
  window.playJuz = playJuz;
  window.updateJuzButton = updateJuzButton;
  window.setQuranReciter = setQuranReciter;
  window.globalSearch = globalSearch;
  window.executeSearch = executeSearch;

  // NEW_POOLS renderers are defined in actions.js (with proper titles from NEW_POOL_TITLES)

})();
