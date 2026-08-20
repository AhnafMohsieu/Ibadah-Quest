(function() {
  // -------------------------------------------------------
  // STATIC CONTENT RENDERING
  // -------------------------------------------------------

  function getSourceLink(source) {
    if (!source) return '';
    const s = source.toLowerCase();
    const qm = s.match(/(\d+):(\d+)/);
    if (s.includes('al-') || s.includes('quran') || s.includes('surah') || s.includes('baqara') || s.includes('fatiha') || s.includes('ali') || s.includes('an-nisa') || s.includes('al-maidah') || s.includes('an-am') || s.includes('al-aaraf') || s.includes('al-anfaal') || s.includes('at-tawbah') || s.includes('yunus') || s.includes('hud') || s.includes('yusuf') || s.includes('ar-rad') || s.includes('ibrahim') || s.includes('al-hijr') || s.includes('an-nahl') || s.includes('al-isra') || s.includes('al-kahf') || s.includes('maryam') || s.includes('ta-ha') || s.includes('al-anbiya') || s.includes('al-hajj') || s.includes('al-muminun') || s.includes('an-nur') || s.includes('al-furqan') || s.includes('ash-shuara') || s.includes('an-naml') || s.includes('al-qasas') || s.includes('al-ankebut') || s.includes('ar-rum') || s.includes('luqman') || s.includes('as-sajdah') || s.includes('al-ahzab') || s.includes('saba') || s.includes('fatir') || s.includes('yasin') || s.includes('as-saffat') || s.includes('sad') || s.includes('az-zumar') || s.includes('ghafir') || s.includes('fussilat') || s.includes('ash-shura') || s.includes('az-zukhruf') || s.includes('ad-dukhhan') || s.includes('al-jathiyah') || s.includes('al-ahqaf') || s.includes('muhammad') || s.includes('al-fath') || s.includes('al-hujurat') || s.includes('qaf') || s.includes('adh-dhariyat') || s.includes('at-tur') || s.includes('an-najm') || s.includes('al-qamar') || s.includes('ar-rahman') || s.includes('al-waqiah') || s.includes('al-hadid') || s.includes('al-mujadila') || s.includes('al-hashr') || s.includes('al-mumtahina') || s.includes('as-saf') || s.includes('al-jumuah') || s.includes('al-munafiqun') || s.includes('at-taghabun') || s.includes('at-talaq') || s.includes('at-tahrim') || s.includes('al-mulk') || s.includes('al-qalam') || s.includes('al-haqqah') || s.includes('al-maarij') || s.includes('nuh') || s.includes('al-jinn') || s.includes('al-muzzammil') || s.includes('al-muddaththir') || s.includes('al-qiyamah') || s.includes('al-insan') || s.includes('al-mursalat') || s.includes('an-naba') || s.includes('an-naziat') || s.includes('abasa') || s.includes('at-takwir') || s.includes('al-infitar') || s.includes('almutaffifin') || s.includes('alinschiqaq') || s.includes('alburuj') || s.includes('at-tariq') || s.includes('alala') || s.includes('alghashiyah') || s.includes('alfajr') || s.includes('albalad') || s.includes('ashshams') || s.includes('allail') || s.includes('adduha') || s.includes('asharh') || s.includes('atteen') || s.includes('alalaq') || s.includes('alqadr') || s.includes('bayyinah') || s.includes('azalzalah') || s.includes('aladiyat') || s.includes('alqariah') || s.includes('takathur') || s.includes('alasr') || s.includes('alhumazah') || s.includes('fil') || s.includes('quraysh') || s.includes('almaun') || s.includes('alkawthar') || s.includes('alkafirun') || s.includes('anasr') || s.includes('lahab') || s.includes('ikhlas') || s.includes('falaq') || s.includes('nas') || qm) {
      if (qm) return `https://quran.com/${qm[1]}/${qm[2]}`;
      return 'https://quran.com';
    }
    if (s.includes('sahih') || s.includes('bukhari') || s.includes('muslim') || s.includes('abu dawood') || s.includes('tirmidhi') || s.includes('ibn majah') || s.includes('nasai') || s.includes('musnad') || s.includes('hadith') || s.includes('sunan') || s.includes('riyadh') || s.includes('mishkat') || s.includes('bulugh') || s.includes('adab') || s.includes('muwatta')) {
      return 'https://sunnah.com';
    }
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
      
      const numBadge = `<span style="display:inline-block; background:var(--accent-bg); color:var(--accent-light); border:1px solid var(--accent-border); border-radius:12px; padding:0 8px; font-size:0.75rem; margin-right:8px; font-weight:800; height:22px; line-height:20px; white-space:nowrap; font-family:var(--font);">#${mapIdx + 1}</span>`;

      if (typeof o === 'string') return `<div class="content-card" onclick="if(typeof window.grantDailyXp==='function')window.grantDailyXp(2,'read|${areaId}|${i}')"><div style="display:flex;align-items:flex-start;gap:10px;"><div style="margin-top:2px;">${numBadge}</div><div class="content-english" style="flex:1;">${o}</div></div></div>`;
      
      let inner = '';
      if (o.arabic) inner += `<div class="content-arabic">${o.arabic}</div>`;
      if (o.transliteration || o.roman) inner += `<div style="font-size:0.9rem;color:var(--text2);opacity:0.9;font-style:italic;margin-bottom:6px;text-align:right;">${o.transliteration || o.roman}</div>`;
      inner += `<div class="content-english">${o.desc || o.text || o.english || ''}</div>`;
      if (o.source) inner += `<div class="content-source">${iqIcon('book-open')} ${o.source}<a class="verify-btn" href="${getSourceLink(o.source)}" target="_blank" rel="noopener noreferrer" title="Verify this source">Verify</a></div>`;
      
      let title_line = '';
      if (o.title) {
        title_line = `<div style="font-weight:700;margin-bottom:6px;color:var(--accent-light);display:flex;align-items:flex-start;"><div style="margin-top:1px;">${numBadge}</div><span style="line-height:1.4;">${o.title}</span></div>`;
      } else if (o.name && o.arabic && !o.title) {
        inner = `<div style="font-weight:700;font-size:1.1rem;color:var(--accent-light);display:flex;align-items:flex-start;margin-bottom:6px;"><div style="margin-top:3px;">${numBadge}</div><span style="line-height:1.3;">${o.name}</span></div><div class="content-arabic arabic-letter-glow">${o.arabic}</div><div class="content-english">${o.desc||''}</div>`;
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

  function renderSunnahs() { poolRender('sunnahArea', iqIcon('sun') + ' Daily Sunnahs',SUNNAH_POOL,'sunnahIdx'); }
  function renderDhikr() { poolRender('dhikrArea', iqIcon('beads') + ' Dhikr Collection',DHIKR_POOL,'dhikrIdx'); }
  function renderStories() { poolRender('storiesArea', iqIcon('book-open') + ' Inspiring Stories',STORIES,'storiesIdx',true); }
  function renderNames() {
    const el = document.getElementById('namesArea');
    if (!el) return;
    if (!NAMES) return;
    let html = `<div class="section-title">${iqIcon('mosque')} 99 Names of Allah</div>`;
    html += NAMES.map((o, i) => {
      if (!o) return '';
      const numBadge = `<span style="display:inline-block; background:var(--accent-bg); color:var(--accent-light); border:1px solid var(--accent-border); border-radius:12px; padding:0 8px; font-size:0.75rem; margin-right:8px; font-weight:800; height:22px; line-height:20px; white-space:nowrap; font-family:var(--font);">#${i + 1}</span>`;
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
      const numBadge = `<span style="display:inline-block; background:var(--accent-bg); color:var(--accent-light); border:1px solid var(--accent-border); border-radius:12px; padding:0 8px; font-size:0.75rem; margin-right:8px; font-weight:800; height:22px; line-height:20px; white-space:nowrap; font-family:var(--font);">#${i + 1}</span>`;
      return `<div class="content-card" style="flex-direction:row;align-items:flex-start;"><div style="margin-top:2px;">${numBadge}</div><div style="flex:1;"><div style="font-weight:700;color:var(--accent-light);margin-bottom:6px;">${s.name}</div><div class="content-english">${s.desc}</div></div></div>`;
    }).join('');
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
    el.innerHTML = '<div class="section-title">' + iqIcon('users') + ' The Companions (Sahabah)</div>' + SAHABA_POOL.map(s => `<div class="content-card"><div style="font-weight:700;color:var(--accent-light);margin-bottom:6px;">${iqIcon('star')} ${s.title}</div><div class="content-english">${s.desc}</div></div>`).join('');
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
    h += `<div class="content-card"><div class="content-english">Daily target: <strong style="color:var(--accent)">${cm.daily||'Not set'}</strong></div><input type="number" id="charityDaily" placeholder="Set daily target" class="profile-input"></div>`;
    h += `<div class="content-card"><div class="content-english">Monthly target: <strong style="color:var(--accent)">${cm.monthly||'Not set'}</strong></div><input type="number" id="charityMonthly" placeholder="Set monthly target" class="profile-input"></div>`;
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
      <span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--accent-light);font-weight:700;">${completed} / ${total}</span>
    </div><div style="display:flex;flex-direction:column;gap:12px;">`;
    MORNING_DHIKR.forEach((item, idx) => { 
        const done = !!S.morningDone[dt][idx]; 
        h += `<div class="vol-card${done?' done':''}" tabindex="0" role="button" onclick="App.toggleMorning(${idx}, ${item.xp})" style="cursor:pointer;">
            <div class="prayer-check" style="font-size:1.2rem;">${done?iqIcon('check'):iqIcon('sun')}</div>
            <div class="prayer-info">
                <div style="font-family:'Amiri',serif;font-size:1.3rem;margin-bottom:2px;color:var(--accent);line-height:1.4;">${item.arabic}</div>
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
      <span style="font-size:0.75rem;background:rgba(201,168,76,0.15);padding:3px 10px;border-radius:12px;color:var(--accent-light);font-weight:700;">${completed} / ${total}</span>
    </div><div style="display:flex;flex-direction:column;gap:12px;">`;
    EVENING_DHIKR.forEach((item, idx) => { 
        const done = !!S.eveningDone[dt][idx]; 
        h += `<div class="vol-card${done?' done':''}" tabindex="0" role="button" onclick="App.toggleEvening(${idx}, ${item.xp})" style="cursor:pointer;">
            <div class="prayer-check" style="font-size:1.2rem;">${done?iqIcon('check'):iqIcon('moon')}</div>
            <div class="prayer-info">
                <div style="font-family:'Amiri',serif;font-size:1.3rem;margin-bottom:2px;color:var(--accent);line-height:1.4;">${item.arabic}</div>
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

  // ── Situational Dhikr ──
  let _situationalView = null; // null = category grid, string = category key

  function renderSituationalDhikr() {
    const el = document.getElementById('situationalArea');
    if (!el) return;

    if (_situationalView && SITUATIONAL_DHIKR[_situationalView]) {
      const cat = SITUATIONAL_DHIKR[_situationalView];
      let h = `<button class="quran-back-btn" onclick="App.situationalBack()">${iqIcon('arrow-left')} Back to Categories</button>`;
      h += `<div class="section-title">${iqIcon(cat.icon)} ${cat.label}</div>`;
      h += '<div style="display:flex;flex-direction:column;gap:12px;">';
      cat.dhikr.forEach(function(item) {
        h += `<div class="vol-card" style="cursor:default;">
          <div class="prayer-info">
            <div style="font-family:'Amiri',serif;font-size:1.3rem;margin-bottom:2px;color:var(--accent);line-height:1.4;">${item.arabic}</div>
            ${item.roman ? '<div style="font-size:0.85rem;color:var(--text2);font-style:italic;margin-bottom:6px;opacity:0.9;">"' + item.roman + '"</div>' : ''}
            <div class="prayer-name">${item.english}</div>
            ${item.source ? '<div style="font-size:0.75rem;color:var(--text2);margin-top:4px;">' + iqIcon('book-open') + ' ' + item.source + '</div>' : ''}
          </div>
        </div>`;
      });
      h += '</div>';
      el.innerHTML = h;
      return;
    }

    const keys = Object.keys(SITUATIONAL_DHIKR);
    let h = '<div class="section-title">' + iqIcon('heart') + ' Situational Dhikr</div>';
    h += '<div style="color:var(--text2);font-size:0.82rem;margin-bottom:14px;line-height:1.5;">Dhikr organized by emotional and spiritual need. Tap a category to explore.</div>';
    h += '<div class="situational-grid">';
    keys.forEach(function(key) {
      const cat = SITUATIONAL_DHIKR[key];
      h += '<div class="situational-card" onclick="App.openSituational(\'' + key + '\')">';
      h += '<div class="situational-icon">' + iqIcon(cat.icon) + '</div>';
      h += '<div class="situational-label">' + cat.label + '</div>';
      h += '<div class="situational-count">' + cat.dhikr.length + ' dhikr</div>';
      h += '</div>';
    });
    h += '</div>';
    el.innerHTML = h;
  }

  function openSituational(key) {
    _situationalView = key;
    renderSituationalDhikr();
  }

  function situationalBack() {
    _situationalView = null;
    renderSituationalDhikr();
  }

  window.getSourceLink = getSourceLink;
  window.poolRender = poolRender;
  window.renderDuas = renderDuas;
  window.renderSunnahs = renderSunnahs;
  window.renderDhikr = renderDhikr;
  window.renderStories = renderStories;
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
  window.renderDhikrCounter = renderDhikrCounter;
  window.renderInspirations = renderInspirations;
  window.renderSahaba = renderSahaba;
  window.renderGratitude = renderGratitude;
  window.renderFasting = renderFasting;
  window.renderCharity = renderCharity;
  window.renderMemorization = renderMemorization;
  window.renderMorning = renderMorning;
  window.renderEvening = renderEvening;
  window.addGratitude = addGratitude;
  window.toggleFasting = toggleFasting;
  window.setCharityGoals = setCharityGoals;
  window.addMemorization = addMemorization;
  window.toggleMorning = toggleMorning;
  window.toggleEvening = toggleEvening;
  window.renderSituationalDhikr = renderSituationalDhikr;
  window.openSituational = openSituational;
  window.situationalBack = situationalBack;

  // ── Extra Good Deeds ──
  let _extraDeedsView = null;

  function renderExtraDeeds() {
    const el = document.getElementById('extraDeedsArea');
    if (!el) return;

    if (_extraDeedsView && EXTRA_GOOD_DEEDS[_extraDeedsView]) {
      const cat = EXTRA_GOOD_DEEDS[_extraDeedsView];
      let h = '<button class="quran-back-btn" onclick="App.extraDeedsBack()">' + iqIcon('arrow-left') + ' Back to Categories</button>';
      h += '<div class="section-title">' + iqIcon(cat.icon) + ' ' + cat.label + '</div>';
      h += '<div style="display:flex;flex-direction:column;gap:12px;">';
      cat.deeds.forEach(function(item) {
        h += '<div class="vol-card" style="cursor:default;">';
        h += '<div class="prayer-info">';
        h += '<div class="prayer-name" style="font-size:1rem;font-weight:700;color:var(--accent);">' + item.name + '</div>';
        h += '<div style="font-size:0.85rem;color:var(--text2);margin-top:4px;line-height:1.5;">"' + item.virtue + '"</div>';
        if (item.source) h += '<div style="font-size:0.75rem;color:var(--text2);margin-top:4px;">' + iqIcon('book-open') + ' ' + item.source + '</div>';
        h += '</div>';
        h += '<div class="card-info-btn" onclick="event.stopPropagation();App.detail(\'' + item.id + '\')">' + iqIcon('info') + '</div>';
        h += '</div>';
      });
      h += '</div>';
      el.innerHTML = h;
      return;
    }

    var keys = Object.keys(EXTRA_GOOD_DEEDS);
    var h = '<div class="section-title">' + iqIcon('star') + ' Extra Good Deeds</div>';
    h += '<div style="color:var(--text2);font-size:0.82rem;margin-bottom:14px;line-height:1.5;">Virtuous deeds organized by spiritual benefit. Tap a category to explore.</div>';
    h += '<div class="guide-grid">';
    keys.forEach(function(key) {
      var cat = EXTRA_GOOD_DEEDS[key];
      h += '<div class="guide-card" onclick="App.openExtraDeeds(\'' + key + '\')">';
      h += '<div class="guide-icon">' + iqIcon(cat.icon) + '</div>';
      h += '<div class="guide-label">' + cat.label + '</div>';
      h += '<div class="guide-count">' + cat.deeds.length + ' deeds</div>';
      h += '</div>';
    });
    h += '</div>';
    el.innerHTML = h;
  }

  function openExtraDeeds(key) { _extraDeedsView = key; renderExtraDeeds(); }
  function extraDeedsBack() { _extraDeedsView = null; renderExtraDeeds(); }

  // ── Volunteer Prayers ──
  let _volPrayersView = null;

  function renderVolPrayers() {
    const el = document.getElementById('volPrayersArea');
    if (!el) return;

    if (_volPrayersView && VOL_PRAYERS[_volPrayersView]) {
      const cat = VOL_PRAYERS[_volPrayersView];
      let h = '<button class="quran-back-btn" onclick="App.volPrayersBack()">' + iqIcon('arrow-left') + ' Back to Categories</button>';
      h += '<div class="section-title">' + iqIcon(cat.icon) + ' ' + cat.label + '</div>';
      h += '<div style="display:flex;flex-direction:column;gap:12px;">';
      cat.prayers.forEach(function(item) {
        h += '<div class="vol-card" style="cursor:default;">';
        h += '<div class="prayer-info">';
        h += '<div class="prayer-name" style="font-size:1rem;font-weight:700;color:var(--accent);">' + item.name + '</div>';
        h += '<div style="font-size:0.85rem;color:var(--text);margin-top:4px;line-height:1.5;">' + item.desc + '</div>';
        h += '<div style="font-size:0.8rem;color:var(--accent-light);margin-top:4px;font-weight:600;">' + item.rakat + '</div>';
        if (item.source) h += '<div style="font-size:0.75rem;color:var(--text2);margin-top:4px;">' + iqIcon('book-open') + ' ' + item.source + '</div>';
        h += '</div>';
        h += '<div class="card-info-btn" onclick="event.stopPropagation();App.detail(\'' + item.id + '\')">' + iqIcon('info') + '</div>';
        h += '</div>';
      });
      h += '</div>';
      el.innerHTML = h;
      return;
    }

    var keys = Object.keys(VOL_PRAYERS);
    var h = '<div class="section-title">' + iqIcon('moon') + ' Volunteer Prayers</div>';
    h += '<div style="color:var(--text2);font-size:0.82rem;margin-bottom:14px;line-height:1.5;">Sunnah and nafl prayers organized by type. Tap a category to explore.</div>';
    h += '<div class="guide-grid">';
    keys.forEach(function(key) {
      var cat = VOL_PRAYERS[key];
      h += '<div class="guide-card" onclick="App.openVolPrayers(\'' + key + '\')">';
      h += '<div class="guide-icon">' + iqIcon(cat.icon) + '</div>';
      h += '<div class="guide-label">' + cat.label + '</div>';
      h += '<div class="guide-count">' + cat.prayers.length + ' prayers</div>';
      h += '</div>';
    });
    h += '</div>';
    el.innerHTML = h;
  }

  function openVolPrayers(key) { _volPrayersView = key; renderVolPrayers(); }
  function volPrayersBack() { _volPrayersView = null; renderVolPrayers(); }

  window.renderExtraDeeds = renderExtraDeeds;
  window.openExtraDeeds = openExtraDeeds;
  window.extraDeedsBack = extraDeedsBack;
  window.renderVolPrayers = renderVolPrayers;
  window.openVolPrayers = openVolPrayers;
  window.volPrayersBack = volPrayersBack;
})();
