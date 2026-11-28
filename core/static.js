(function() {
  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>\"']/g, function(ch) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  function _t(str) {
    return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(str) : str;
  }
  function _n(val) {
    return (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function') ? window.iqFormatNum(val) : String(val);
  }
  function _numBadge(num) {
    return `<span class="iq-num-pill iq-tabular">#${_n(num)}</span>`;
  }
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
    if (!el || !pool || !Array.isArray(pool)) return;
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
      
      const numBadge = _numBadge(mapIdx + 1);

      if (typeof o === 'string') return `<div class="content-card" onclick="if(typeof window.grantDailyXp==='function')window.grantDailyXp(2,'read|${areaId}|${i}')"><div class="iq-card-row-head"><div style="margin-top:2px;">${numBadge}</div><div class="content-english" style="flex:1;">${o}</div></div></div>`;
      
      let inner = '';
      if (o.arabic) inner += `<div class="content-arabic">${o.arabic}</div>`;
      if (o.transliteration || o.roman) inner += `<div class="iq-card-translit">${o.transliteration || o.roman}</div>`;
      inner += `<div class="content-english">${o.desc || o.text || o.english || ''}</div>`;
      if (o.source) inner += `<div class="content-source">${iqIcon('book-open')} ${o.source}<a class="verify-btn" href="${getSourceLink(o.source)}" target="_blank" rel="noopener noreferrer" title="Verify this source">${escapeHTML(_t('Verify'))}</a></div>`;
      
      let title_line = '';
      if (o.title) {
        title_line = `<div class="iq-card-title" style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;"><div style="margin-top:1px;">${numBadge}</div><span style="line-height:1.4;">${o.title}</span></div>`;
      } else if (o.name && o.arabic && !o.title) {
        inner = `<div class="iq-card-title" style="font-size:1.1rem;display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;"><div style="margin-top:2px;">${numBadge}</div><span style="line-height:1.3;">${o.name}</span></div><div class="content-arabic arabic-letter-glow">${o.arabic}</div><div class="content-english">${o.desc||''}</div>`;
      } else {
        return `<div class="content-card" style="flex-direction:row;align-items:flex-start;" onclick="if(typeof window.grantDailyXp==='function')window.grantDailyXp(2,'read|${areaId}|${i}')"><div style="margin-top:2px;">${numBadge}</div><div style="flex:1;min-width:0;">${inner}</div></div>`;
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
    charity: { icon:'hand-heart', title:'Give Charity', desc:'Charity does not decrease wealth. (Muslim)', cta:'Log Charity', tab:'charity' },
    fasting: { icon:'moon', title:'Track Your Fast', desc:'Whoever fasts a day for Allah\'s sake, Allah will distance him from Hell.', cta:'Log Fast', tab:'fasting' },
    family: { icon:'family', title:'Strengthen Family Ties', desc:'Whoever believes in Allah and the Last Day, let him maintain family ties.', cta:'Learn More', tab:'family-life' },
    patience: { icon:'hourglass', title:'Practice Patience', desc:'Indeed, Allah is with the patient.', cta:'Learn', tab:'virtues' },
    stories: { icon:'book-open', title:'Read Inspiring Stories', desc:'Indeed, in their stories is a lesson for those of understanding.', cta:'Read Stories', tab:'stories' }
  };

  // NOTE: update EMPTY_STATES.heart/sins safely below
  EMPTY_STATES.heart.tab = 'vices-return';
  EMPTY_STATES.sins.tab = 'vices-return';

  function renderSunnahs() {
    const el = document.getElementById('sunnahArea');
    if (!el || typeof SUNNAH_POOL === 'undefined' || !Array.isArray(SUNNAH_POOL)) return;
    const cats = [...new Set(SUNNAH_POOL.map(s => s.cat).filter(Boolean))];
    const cur = (S._sunnahCat || cats[0]);
    let html = '<div class="section-title">' + iqIcon('sun') + ' ' + escapeHTML(_t('Daily Sunnahs')) + '</div>';
    html += '<div class="tier2-tabs cat-chips">';
    cats.forEach(function(c) {
      const active = c === cur ? ' active' : '';
      html += '<button type="button" class="cat-chip' + active + '" onclick="S._sunnahCat=\'' + c + '\';renderSunnahs()">' + escapeHTML(_t(c)) + '</button>';
    });
    html += '</div>';
    const filtered = cur === cats[0] ? SUNNAH_POOL : SUNNAH_POOL.filter(function(s) { return s.cat === cur; });
    html += filtered.map(function(o, i) {
      const numBadge = _numBadge(i + 1);
      let inner = '';
      if (o.arabic) inner += '<div class="content-arabic">' + o.arabic + '</div>';
      if (o.roman) inner += '<div class="iq-card-translit">' + o.roman + '</div>';
      inner += '<div class="content-english">' + o.text + '</div>';
      if (o.source) inner += '<div class="content-source">' + iqIcon('book-open') + ' ' + o.source + '<a class="verify-btn" href="' + getSourceLink(o.source) + '" target="_blank" rel="noopener noreferrer" title="Verify this source">' + escapeHTML(_t('Verify')) + '</a></div>';
      return '<div class="content-card" onclick="if(typeof window.grantDailyXp===\'function\')window.grantDailyXp(2,\'read|sunnahArea|' + i + '\')"><div class="iq-card-row-head"><div style="margin-top:2px;">' + numBadge + '</div><div style="flex:1;min-width:0;">' + inner + '</div></div></div>';
    }).join('');
    el.innerHTML = html;
  }
  function renderDhikr() {
    if (typeof window.renderDhikrCounter === 'function') window.renderDhikrCounter();
    if (typeof DHIKR_POOL !== 'undefined') poolRender('dhikrArea', iqIcon('beads') + ' ' + escapeHTML(_t('Dhikr Collection')),DHIKR_POOL,'dhikrIdx');
  }
  function renderStories() { if (typeof STORIES !== 'undefined') poolRender('storiesArea', iqIcon('book-open') + ' Inspiring Stories',STORIES,'storiesIdx',true); }
  function renderNames() {
    const el = document.getElementById('namesArea');
    if (!el || typeof NAMES === 'undefined' || !Array.isArray(NAMES)) return;
    let html = `<div class="section-title">${iqIcon('mosque')} ${escapeHTML(_t('99 Names of Allah'))}</div><div class="iq-names-grid">`;
    html += NAMES.map((o, i) => {
      if (!o) return '';
      return `<div class="content-card name-card">
        <div style="align-self:flex-end;display:flex;">${_numBadge(i + 1)}</div>
        <div class="content-arabic name-an">${o.arabic || ''}</div>
        <div class="name-roman">${o.name || o.roman || ''}</div>
        <div class="content-english" style="text-align:center;">${o.desc || ''}</div>
      </div>`;
    }).join('') + '</div>';
    el.innerHTML = html;
  }
  function renderSins() { if (typeof SINS_POOL !== 'undefined') poolRender('sinsArea', iqIcon('alert-triangle') + ' Major Sins to Avoid',SINS_POOL,'sinsIdx'); }
  function renderRepentance() { if (typeof REPENTANCE_POOL !== 'undefined') poolRender('repentanceArea', iqIcon('refresh-cw') + ' Repentance & Tawbah',REPENTANCE_POOL,'repentanceIdx'); }
  function renderSeerah() { if (typeof SEERAH_POOL !== 'undefined') poolRender('seerahArea', iqIcon('book-open') + ' Life of the Prophet ﷺ',SEERAH_POOL,'seerahIdx',true); }
  function renderTafsir() { if (typeof TAFSIR_POOL !== 'undefined') poolRender('tafsirArea', iqIcon('book-open') + ' Quranic Tafsir',TAFSIR_POOL,'tafsirIdx'); var host = document.getElementById('tafsirArea'); if (!host) return; host.innerHTML += '<div id="tafsirBrowser"></div>'; if (typeof window.renderTafsirBrowser === 'function') window.renderTafsirBrowser(); }
  function renderManners() { if (typeof MANNERS_POOL !== 'undefined') poolRender('mannersArea', iqIcon('handshake') + ' Islamic Manners (Adab)',MANNERS_POOL,'mannersIdx'); }
  function renderAqeedah() { if (typeof AQEEDAH_POOL !== 'undefined') poolRender('aqeedahArea', iqIcon('mosque') + ' Islamic Aqeedah',AQEEDAH_POOL,'aqeedahIdx'); }
  function renderFamily() { if (typeof FAMILY_POOL !== 'undefined') poolRender('familyArea', iqIcon('users') + ' Family & Kinship',FAMILY_POOL,'familyIdx'); }
  function renderHealth() { if (typeof HEALTH_POOL !== 'undefined') poolRender('healthArea', iqIcon('heart') + ' Health & Well-being',HEALTH_POOL,'healthIdx'); }
  function renderFinance() { if (typeof FINANCE_POOL !== 'undefined') poolRender('financeArea', iqIcon('wallet') + ' Halal Finance',FINANCE_POOL,'financeIdx'); }
  function renderUmmah() { if (typeof UMMAH_POOL !== 'undefined') poolRender('ummahArea', iqIcon('globe') + ' The Muslim Ummah',UMMAH_POOL,'ummahIdx'); }
  function renderHajj() { if (typeof HAJJ_POOL !== 'undefined') poolRender('hajjArea', iqIcon('kaaba') + ' Hajj & Umrah',HAJJ_POOL,'hajjIdx'); }
  function renderAkhirah() { if (typeof AKHIRAH_POOL !== 'undefined') poolRender('akhirahArea', iqIcon('globe') + ' The Hereafter',AKHIRAH_POOL,'akhirahIdx'); }
  function renderProphets() {
    const el = document.getElementById('prophetsArea');
    if (!el || typeof PROPHETS_POOL === 'undefined' || !Array.isArray(PROPHETS_POOL)) return;
    let html = `<div class="section-title">${iqIcon('book-open')} ${escapeHTML(_t('Stories of the Prophets'))}</div><div class="iq-names-grid">`;
    html += PROPHETS_POOL.map((o, i) => {
      if (!o) return '';
      return `<div class="content-card name-card">
        <div style="align-self:flex-end;display:flex;">${_numBadge(i + 1)}</div>
        <div class="content-arabic name-an">${o.arabic || ''}</div>
        <div class="name-roman">${o.name || ''}</div>
        <div class="content-english" style="text-align:center;">${o.desc || ''}</div>
      </div>`;
    }).join('') + '</div>';
    el.innerHTML = html;
  }
  function renderWomen() { if (typeof WOMEN_POOL !== 'undefined') poolRender('womenArea', iqIcon('user') + ' Great Muslim Women',WOMEN_POOL,'womenIdx',true); }
  function renderKnowledge() { if (typeof KNOWLEDGE_POOL !== 'undefined') poolRender('knowledgeArea', iqIcon('book') + ' Seeking Knowledge',KNOWLEDGE_POOL,'knowledgeIdx'); }
  function renderHeart() { if (typeof HEART_POOL !== 'undefined') poolRender('heartArea', iqIcon('heart') + ' Diseases of the Heart',HEART_POOL,'heartIdx'); }
  function renderJumuah() { if (typeof JUMUAH_POOL !== 'undefined') poolRender('jumuahArea', iqIcon('mosque') + ' Friday (Jumuah) Virtues',JUMUAH_POOL,'jumuahIdx', true); }
  function renderMarriage() { if (typeof MARRIAGE_POOL !== 'undefined') poolRender('marriageArea', iqIcon('gem') + ' Marriage & Halal Love',MARRIAGE_POOL,'marriageIdx'); }
  function renderWudu() { if (typeof WUDU_POOL !== 'undefined') poolRender('wuduArea', iqIcon('droplets') + ' Wudu & Taharah',WUDU_POOL,'wuduIdx', true); }
  function renderScholars() { if (typeof SCHOLARS_POOL !== 'undefined') poolRender('scholarsArea', iqIcon('award') + ' Great Islamic Scholars',SCHOLARS_POOL,'scholarsIdx'); }
  function renderPatience() { if (typeof PATIENCE_POOL !== 'undefined') poolRender('patienceArea', iqIcon('gem') + ' Sabr & Shukr',PATIENCE_POOL,'patienceIdx'); }
  function renderFiqh() {
    const el = document.getElementById('fiqhArea');
    if (!el || typeof FIQH_POOL === 'undefined' || !Array.isArray(FIQH_POOL)) return;
    const cats = [...new Set(FIQH_POOL.map(s => s.cat).filter(Boolean))];
    const cur = (S._fiqhCat || cats[0]);
    let html = '<div class="section-title">' + iqIcon('book-open') + ' ' + escapeHTML(_t('Islamic Jurisprudence (Fiqh)')) + '</div>';
    html += '<div class="tier2-tabs cat-chips">';
    cats.forEach(function(c) {
      const active = c === cur ? ' active' : '';
      html += '<button type="button" class="cat-chip' + active + '" onclick="S._fiqhCat=\'' + c + '\';renderFiqh()">' + escapeHTML(_t(c)) + '</button>';
    });
    html += '</div>';
    const filtered = FIQH_POOL.filter(function(s) { return s.cat === cur; });
    html += filtered.map(function(o, i) {
      return '<div class="content-card" onclick="if(typeof window.grantDailyXp===\'function\')window.grantDailyXp(2,\'read|fiqhArea|' + i + '\')"><div class="iq-card-title" style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;"><div style="margin-top:1px;">' + _numBadge(i + 1) + '</div><span style="line-height:1.4;">' + o.title + '</span></div><div class="content-english">' + o.desc + '</div></div>';
    }).join('');
    el.innerHTML = html;
  }
  function renderTawakkul() { if (typeof TAWAKKUL_POOL !== 'undefined') poolRender('tawakkulArea', iqIcon('handshake') + ' Tawakkul · Trust in Allah',TAWAKKUL_POOL,'tawakkulIdx'); }
  function renderIkhlas() { if (typeof IKHLAS_POOL !== 'undefined') poolRender('ikhlasArea', iqIcon('heart') + ' Ikhlas · Sincerity',IKHLAS_POOL,'ikhlasIdx'); }
  function renderZuhd() { if (typeof ZUHD_POOL !== 'undefined') poolRender('zuhdArea', iqIcon('sparkles') + ' Zuhd · Asceticism',ZUHD_POOL,'zuhdIdx'); }
  function renderJannah() { if (typeof JANNAH_POOL !== 'undefined') poolRender('jannahArea', iqIcon('flower') + ' Jannah · Paradise',JANNAH_POOL,'jannahIdx'); }
  function renderJahannam() { if (typeof JAHANNAM_POOL !== 'undefined') poolRender('jahannamArea', iqIcon('flame') + ' Jahannam · Hellfire',JAHANNAM_POOL,'jahannamIdx'); }
  function renderGrave() { if (typeof GRAVE_POOL !== 'undefined') poolRender('graveArea', iqIcon('coffin') + ' The Grave & Life After Death',GRAVE_POOL,'graveIdx'); }
  function renderSigns() { if (typeof SIGNS_POOL !== 'undefined') poolRender('signsArea', iqIcon('hourglass') + ' Signs of Qiyamah',SIGNS_POOL,'signsIdx'); }
  function renderParenting() { if (typeof PARENTING_POOL !== 'undefined') poolRender('parentingArea', iqIcon('baby') + ' Islamic Parenting',PARENTING_POOL,'parentingIdx'); }
  function renderTibb() { if (typeof TIBB_POOL !== 'undefined') poolRender('tibbArea', iqIcon('leaf') + ' Tibb Nabawi (Prophetic Medicine)',TIBB_POOL,'tibbIdx'); }
  function renderNeighbors() { if (typeof NEIGHBORS_POOL !== 'undefined') poolRender('neighborsArea', iqIcon('home') + ' Rights of Neighbors',NEIGHBORS_POOL,'neighborsIdx'); }
  function renderSalah() {
    const el = document.getElementById('salahArea');
    if (!el) return;
    el.innerHTML = '<div class="section-title">' + iqIcon('kaaba') + ' ' + escapeHTML(_t('Salah Guide')) + '</div>' + [
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
      return `<div class="content-card"><div class="iq-card-row-head">${_numBadge(i + 1)}<div style="flex:1;"><div class="iq-card-title">${s.name}</div><div class="content-english">${s.desc}</div></div></div></div>`;
    }).join('');
  }

  function renderDhikrAnalytics() {
    const stats = S.dhikrStats || { total: {}, daily: {}, streak: 0 };
    const totalDhikr = Object.values(stats.total).reduce((a, b) => a + b, 0);
    const todaySessions = stats.daily[today()] || {};
    const todayCount = Object.values(todaySessions).reduce((a, b) => a + b, 0);
    
    return `
      <div class="dhikr-analytics">
        <div class="section-title">${iqIcon('bar-chart-3')} ${escapeHTML(_t('Dhikr Statistics'))}</div>
        <div class="dhikr-stats-row">
          <div class="dhikr-stat-item">
            <div class="dhikr-stat-num iq-tabular">${_n(totalDhikr)}</div>
            <div class="dhikr-stat-label">${escapeHTML(_t('Total Dhikr'))}</div>
          </div>
          <div class="dhikr-stat-item">
            <div class="dhikr-stat-num iq-tabular">${_n(todayCount)}</div>
            <div class="dhikr-stat-label">${escapeHTML(_t('Today'))}</div>
          </div>
          <div class="dhikr-stat-item">
            <div class="dhikr-stat-num iq-tabular">${_n(stats.streak || 0)}</div>
            <div class="dhikr-stat-label">${escapeHTML(_t('Streak'))}</div>
          </div>
        </div>
      </div>
    `;
  }

  function _dhikrOrbHtml(cnt, d, pct) {
    const r = 58, c = 364.42, off = (c - (pct / 100) * c).toFixed(2);
    return `<div class="iq-tasbeeh-wrap"><svg class="iq-tasbeeh-ring" viewBox="0 0 132 132" width="132" height="132" aria-hidden="true"><circle class="iq-tasbeeh-track" cx="66" cy="66" r="${r}"/><circle class="iq-tasbeeh-fill" cx="66" cy="66" r="${r}" style="stroke:${d.color};stroke-dasharray:${c};stroke-dashoffset:${off}"/></svg><button type="button" class="dhikr-tap-btn iq-tasbeeh-orb" onclick="this.classList.add('tap');setTimeout(()=>this.classList.remove('tap'),400);App.tapDhikr();" aria-label="Count dhikr +1"><span class="iq-orb-plus"><bdi dir="ltr">+${_n(1)}</bdi></span><span class="iq-orb-pct iq-tabular">${_n(pct)}%</span></button></div>`;
  }

  function renderDhikrCounter() {
    const el = document.getElementById('dhikrCounterArea');
    if (!el) return;
    if (!S.dhikrCounters) S.dhikrCounters = {};
    const fmt = _n;
    const current = S.dhikrCounters._active || 0;
    const pool = (typeof DHIKR_COUNTER_DATA !== 'undefined' && DHIKR_COUNTER_DATA) || (typeof window !== 'undefined' && window.DHIKR_COUNTER_DATA) || [];
    if (!pool.length) return;
    const d = pool[current % pool.length];
    const cnt = S.dhikrCounters[current] || 0;
    const pct = Math.min(100, Math.round((cnt / d.target) * 100));
    const dk = typeof today === 'function' ? today() : '';
    const dailyTapXp = (S.dhikrTapXpDay && S.dhikrTapXpDay.date === dk) ? (S.dhikrTapXpDay.xp || 0) : 0;
    const dailyCap = (typeof window.MAX_DAILY_TAP_XP === 'number') ? window.MAX_DAILY_TAP_XP : 100;
    const nextArrow = '<svg class="iq-mirror-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';
    el.innerHTML = renderDhikrAnalytics() + `
      <div class="dhikr-counter-card">
        <div class="iq-tabular" style="font-size:0.78rem;color:var(--text2);margin-bottom:8px;">${fmt(current+1)} / ${fmt(pool.length)} &middot; ${escapeHTML(_t('Daily Tap XP'))}: ${fmt(dailyTapXp)} / ${fmt(dailyCap)}</div>
        <div class="dhikr-counter-arabic" style="color:${d.color}">${d.arabic}</div>
        <div style="font-style:italic;color:var(--text2);font-size:0.86rem;margin-bottom:4px;">${d.transliteration}</div>
        <div style="font-size:0.84rem;color:var(--text2);margin-bottom:12px;">${d.english}</div>
        <div class="dhikr-counter-num iq-tabular" style="color:${d.color}">${fmt(cnt)}</div>
        <div class="dhikr-counter-target iq-tabular">${escapeHTML(_t('Target'))}: ${fmt(d.target)} ${cnt >= d.target ? iqIcon('check') : ''}</div>
        ${_dhikrOrbHtml(cnt, d, pct)}
        <div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button type="button" class="iq-btn-secondary" onclick="App.resetDhikr()">${iqIcon('refresh-cw')} ${escapeHTML(_t('Reset'))}</button>
          <button type="button" class="iq-btn-secondary" onclick="App.nextDhikr()">${escapeHTML(_t('Next'))} ${nextArrow}</button>
          <button type="button" class="iq-btn-secondary" onclick="App.toggleDhikrHaptic()" aria-pressed="${!!(S.dhikrSettings && S.dhikrSettings.haptic)}">${iqIcon('zap')} ${escapeHTML(_t('Vibration'))} ${escapeHTML(_t(S.dhikrSettings && S.dhikrSettings.haptic ? 'On' : 'Off'))}</button>
        </div>
      </div>
    `;
  }

  function renderInspirations() {
    const el = document.getElementById('inspireArea');
    if (!el) return;
    const pool = (typeof INSPIRATIONS_POOL !== 'undefined' && INSPIRATIONS_POOL) || (typeof window !== 'undefined' && window.INSPIRATIONS_POOL) || [];
    if (!pool.length) return;
    const idxs = S.inspireIdx && S.inspireIdx.length ? S.inspireIdx : [0,1,2,3,4];
    el.innerHTML = '<div class="section-title">' + iqIcon('sparkles') + ' ' + escapeHTML(_t('Inspirations')) + '</div>' + idxs.map(i => `<div class="content-card"><div class="content-english" style="font-size:1rem;line-height:1.8;">${pool[i%pool.length]}</div></div>`).join('');
  }
  function renderSahaba() {
    const el = document.getElementById('sahabaArea');
    if (!el) return;
    const pool = (typeof SAHABA_POOL !== 'undefined' && SAHABA_POOL) || (typeof window !== 'undefined' && window.SAHABA_POOL) || [];
    if (!pool.length) return;
    el.innerHTML = '<div class="section-title">' + iqIcon('users') + ' ' + escapeHTML(_t('The Companions (Sahabah)')) + '</div>' + pool.map((s,i) => `<div class="content-card"><div class="iq-card-row-head">${_numBadge(i+1)}<div style="flex:1;"><div class="iq-card-title">${s.title}</div><div class="content-english">${s.desc}</div></div></div></div>`).join('');
  }
  function renderGratitude() {
    const dt = today(), entries = S.gratitudeLog[dt] || [];
    let h = '<div class="section-title">' + iqIcon('pencil') + ' ' + escapeHTML(_t('Daily Gratitude Journal')) + '</div>';
    h += `<div class="content-card"><div class="content-english">${escapeHTML(_t("Today's entries"))} (<span class="iq-tabular">${_n(entries.length)}</span>):</div></div>`;
    entries.forEach((e,i) => h += `<div class="quest-row">${iqIcon('check')} <span class="iq-tabular">${_n(i+1)}.</span> ${escapeHTML(e)}</div>`);
    h += `<label class="sr-only" for="gratInput">${escapeHTML(_t('I am grateful for...'))}</label><input class="profile-input" id="gratInput" placeholder="${escapeHTML(_t('I am grateful for...'))}"><button type="button" class="iq-pill-btn" onclick="App.addGratitude()" style="width:100%;">${iqIcon('plus')} ${escapeHTML(_t('Add Entry'))}</button>`;
    document.getElementById('gratitudeArea').innerHTML = h;
  }
  function addGratitude() { const inp=document.getElementById('gratInput'); if(!inp?.value.trim()) return; const dt=today(); if(!S.gratitudeLog[dt]) S.gratitudeLog[dt]=[]; S.gratitudeLog[dt].push(inp.value.trim()); inp.value=''; if (typeof window.grantCappedDailyXp === 'function') window.grantCappedDailyXp(3, 'gratitude', 3); saveState(); renderGratitude(); checkA(); }
  function renderFasting() {
    const dt = today(), fasted = !!S.fastingDays[dt];
    const cues = (typeof window !== 'undefined' && typeof window.getWorshipDayCues === 'function') ? window.getWorshipDayCues(new Date()) : null;
    let h = '<div class="section-title">' + iqIcon('calendar') + ' ' + escapeHTML(_t('Fasting Tracker')) + '</div>';
    if (cues && (cues.hijriText || cues.fastCue)) {
      h += `<div class="content-card" style="border-color:var(--accent-soft);background:var(--accent-fill);">
        <div class="iq-card-title">${iqIcon('moon')} ${escapeHTML(cues.hijriText || '')}</div>
        ${cues.fastCue ? `<div class="content-english" style="color:var(--accent-dark);font-weight:600;margin-top:4px;">${escapeHTML(cues.fastCue)}</div>` : ''}
      </div>`;
    }
    h += `<label class="quest-row"><span style="flex:1">${escapeHTML(_t('Fasted today?'))}</span><input type="checkbox" class="quest-check" ${fasted?'checked':''} onchange="App.toggleFasting()"></label>`;
    const start=ms(), end=me(); let cnt=0;
    for (const dk in S.fastingDays) if (dk>=start && dk<=end && S.fastingDays[dk]) cnt++;
    h += `<div class="content-card"><div class="content-english">${iqIcon('calendar')} <span class="iq-tabular">${_n(cnt)}</span> ${escapeHTML(_t('fasting days this month'))}</div><div class="content-english" style="font-size:0.85rem;color:var(--text2);">${escapeHTML(_t('Monday & Thursday & White Days (13-15 Hijri) are recommended Sunnah fasts'))}</div></div>`;
    const el = document.getElementById('fastingArea');
    if (el) el.innerHTML = h;
  }
  function toggleFasting() { const dt=today(); S.fastingDays[dt]=!S.fastingDays[dt]; if(S.fastingDays[dt]) { S.td.fasting=(S.td.fasting||0)+1; applyXpDelta(50); window.playSound('pop'); if (typeof window.iqHaptic === 'function') window.iqHaptic(10); } else { S.td.fasting=Math.max(0,(S.td.fasting||0)-1); spendXp(50); } saveState(); renderFasting(); if (typeof window !== 'undefined' && window.renderLv) window.renderLv(); if (typeof window !== 'undefined' && window.renderTopBar) window.renderTopBar(); }
  function renderCharity() {
    const cm = S.charity; if (cm.monthStart !== ms()) { cm.monthStart=ms(); cm.given=0; }
    let h = '<div class="section-title">' + iqIcon('wallet') + ' ' + escapeHTML(_t('Charity Tracker')) + '</div>';
    h += `<div class="content-card"><label class="content-english" for="charityDaily">${escapeHTML(_t('Daily target'))}: <strong class="iq-tabular" style="color:var(--accent-dark)">${cm.daily ? _n(cm.daily) : escapeHTML(_t('Not set'))}</strong></label><input type="number" id="charityDaily" placeholder="${escapeHTML(_t('Set daily target'))}" class="profile-input" style="margin-bottom:0;"></div>`;
    h += `<div class="content-card"><label class="content-english" for="charityMonthly">${escapeHTML(_t('Monthly target'))}: <strong class="iq-tabular" style="color:var(--accent-dark)">${cm.monthly ? _n(cm.monthly) : escapeHTML(_t('Not set'))}</strong></label><input type="number" id="charityMonthly" placeholder="${escapeHTML(_t('Set monthly target'))}" class="profile-input" style="margin-bottom:0;"></div>`;
    h += `<div class="content-card"><label class="content-english" for="charityGiven">${escapeHTML(_t('Given this month'))}: <strong class="iq-tabular" style="color:var(--green)">${_n(cm.given)} / ${cm.monthly ? _n(cm.monthly) : '?'}</strong></label><input type="number" id="charityGiven" placeholder="${escapeHTML(_t('Log amount given today'))}" class="profile-input" style="margin-bottom:0;"></div>`;
    h += `<button type="button" class="iq-pill-btn" onclick="App.setCharityGoals()" style="width:100%;margin-bottom:14px;">${iqIcon('save')} ${escapeHTML(_t('Save & Log'))}</button>`;
    h += '<div class="section-title">' + iqIcon('book-open') + ' ' + escapeHTML(_t('Charity Knowledge')) + '</div>';
    h += `<div class="content-card"><div class="iq-card-title">${escapeHTML(_t('Waqf (Endowments)'))}</div><div class="content-english" style="font-size:0.85rem;color:var(--text2);">The Islamic institution of Waqf allows individuals to dedicate land or assets permanently for public benefit. Awqaf historically funded hospitals, schools, and water fountains.</div></div>`;
    h += `<div class="content-card"><div class="iq-card-title">${escapeHTML(_t('Sadaqah Jariyah'))}</div><div class="content-english" style="font-size:0.85rem;color:var(--text2);">Continuous charity. If you build a well, plant a tree, or write a useful book, you continue to receive reward even after death as long as people benefit from it. (Sahih Muslim)</div></div>`;
    document.getElementById('charityArea').innerHTML = h;
  }
  function setCharityGoals() {
    const dEl = document.getElementById('charityDaily');
    const mEl = document.getElementById('charityMonthly');
    const gEl = document.getElementById('charityGiven');
    const d = dEl ? parseInt(dEl.value, 10) : NaN;
    const m = mEl ? parseInt(mEl.value, 10) : NaN;
    const g = gEl ? parseInt(gEl.value, 10) : NaN;
    if (!isNaN(d) && d >= 0) S.charity.daily = d;
    if (!isNaN(m) && m >= 0) S.charity.monthly = m;
    if (!isNaN(g) && g > 0) S.charity.given = (S.charity.given || 0) + g;
    if (gEl) gEl.value = '';
    saveState();
    renderCharity();
  }
  const HIFZ_INTERVALS = [1, 3, 7, 14, 30];
  function _addDaysIso(baseStr, days) {
    const p = String(baseStr).split('-');
    const d = p.length === 3 ? new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12) : new Date();
    d.setDate(d.getDate() + days);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function renderMemorization() {
    const fmt = _n;
    const dt = today();
    if (!S.hifzSrs || typeof S.hifzSrs !== 'object') S.hifzSrs = {};
    let dueCount = 0;
    const rows = (S.memorizationList || []).map((s, idx) => {
      const rec = S.hifzSrs[s] || { level: 0, nextDue: dt, lastReviewed: '' };
      const isDue = !rec.nextDue || rec.nextDue <= dt;
      if (isDue) dueCount++;
      return { name: s, idx: idx, rec: rec, isDue: isDue };
    });
    let h = '<div class="section-title">' + iqIcon('brain') + ' ' + escapeHTML(_t('Hifz & Spaced Repetition')) + '</div>';
    h += `<div class="stat-card" style="margin-bottom:14px;"><div class="stat-num iq-tabular">${fmt(S.memorized)}</div><div>${escapeHTML(_t('Surahs Memorized'))} &middot; <span class="iq-srs-badge iq-tabular">${fmt(dueCount)} ${escapeHTML(_t('Due Today'))}</span></div></div>`;
    h += `<div class="content-card"><div class="content-english" style="font-size:0.84rem;color:var(--text2);">${escapeHTML(_t('Spaced repetition schedules reviews at gentle intervals (1, 3, 7, 14, 30 days) so memorized Surahs stay anchored in memory.'))}</div></div>`;
    h += `<label class="sr-only" for="memInput">${escapeHTML(_t('Surah name or Ayah range (e.g., Al-Mulk 1-10)'))}</label><input class="profile-input" id="memInput" placeholder="${escapeHTML(_t('Surah name or Ayah range (e.g., Al-Mulk 1-10)'))}"><button type="button" class="iq-pill-btn" onclick="App.addMemorization()" style="width:100%;margin-bottom:14px;">${iqIcon('plus')} ${escapeHTML(_t('Add to Hifz Queue'))}</button>`;
    if (rows.length) {
      h += '<div class="section-title">' + iqIcon('clipboard') + ' ' + escapeHTML(_t('Review Queue')) + '</div>';
      rows.forEach(item => {
        const ivl = HIFZ_INTERVALS[Math.min(HIFZ_INTERVALS.length - 1, item.rec.level || 0)];
        h += `<div class="quest-row" style="flex-wrap:wrap;gap:8px;justify-content:space-between;">
          <div style="flex:1;min-width:160px;"><strong>${escapeHTML(item.name)}</strong><div style="font-size:0.75rem;color:var(--text2);">${item.isDue ? escapeHTML(_t('Due now for gentle review')) : (escapeHTML(_t('Next review')) + ': <bdi dir="ltr">' + escapeHTML(item.rec.nextDue) + '</bdi> (<span class="iq-tabular">' + fmt(ivl) + 'd</span>)')}</div></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button type="button" class="iq-pill-btn" style="padding:6px 12px;font-size:0.76rem;" onclick="App.markHifzReviewed(${item.idx}, false)">${iqIcon('check')} ${escapeHTML(_t('Reviewed'))}</button>
            <button type="button" class="iq-btn-secondary" style="padding:6px 10px;font-size:0.76rem;" onclick="App.markHifzReviewed(${item.idx}, true)">${escapeHTML(_t('Reset'))} (<bdi dir="ltr">1d</bdi>)</button>
          </div>
        </div>`;
      });
    }
    const area = document.getElementById('memorizationArea');
    if (area) area.innerHTML = h;
  }
  function addMemorization() {
    const inp = document.getElementById('memInput');
    if (!inp?.value.trim()) return;
    const label = inp.value.trim();
    if (!Array.isArray(S.memorizationList)) S.memorizationList = [];
    if (!S.hifzSrs) S.hifzSrs = {};
    if (!S.memorizationList.includes(label)) {
      S.memorizationList.push(label);
      S.memorized = (S.memorized || 0) + 1;
      S.hifzSrs[label] = { level: 0, nextDue: today(), lastReviewed: '' };
    }
    inp.value = '';
    if (typeof window.grantCappedDailyXp === 'function') window.grantCappedDailyXp(3, 'memorization', 5);
    saveState();
    renderMemorization();
    checkA();
  }
  function markHifzReviewed(idx, reset) {
    if (!Array.isArray(S.memorizationList) || idx < 0 || idx >= S.memorizationList.length) return;
    if (!S.hifzSrs) S.hifzSrs = {};
    const name = S.memorizationList[idx];
    const dt = today();
    const cur = S.hifzSrs[name] || { level: 0, nextDue: dt, lastReviewed: '' };
    const nextLevel = reset ? 0 : Math.min(HIFZ_INTERVALS.length - 1, (cur.level || 0) + 1);
    const days = HIFZ_INTERVALS[nextLevel];
    S.hifzSrs[name] = { level: nextLevel, nextDue: _addDaysIso(dt, days), lastReviewed: dt };
    if (!reset && typeof window.grantCappedDailyXp === 'function') window.grantCappedDailyXp(2, 'hifz_review', 10);
    saveState();
    renderMemorization();
  }
  window.markHifzReviewed = markHifzReviewed;
  function renderMorning() {
    const dt = today(); if (!S.morningDone[dt]) S.morningDone[dt] = {};
    const total = MORNING_DHIKR.length;
    let completed = 0;
    for (let i=0; i<total; i++) { if (S.morningDone[dt][i]) completed++; }

    let h = `<div class="section-title" style="justify-content:space-between;gap:12px;">
      <span>${iqIcon('sunrise')} ${escapeHTML(_t('Morning Adhkar (After Fajr)'))}</span>
      <span class="iq-num-pill iq-tabular">${_n(completed)} / ${_n(total)}</span>
    </div><div class="adhkar-list" style="display:flex;flex-direction:column;gap:12px;width:100%;align-items:stretch;">`;
    MORNING_DHIKR.forEach((item, idx) => {
        const done = !!S.morningDone[dt][idx];
        h += `<div class="vol-card${done?' done':''}" tabindex="0" role="button" aria-pressed="${done?'true':'false'}" aria-label="${escapeHTML(item.text)} (${item.xp} XP)" onclick="App.toggleMorning(${idx}, ${item.xp})" style="cursor:pointer;width:100%;box-sizing:border-box;">
            <div class="prayer-check" style="font-size:1.2rem;">${done?iqIcon('check'):iqIcon('sun')}</div>
            <div class="prayer-info">
                <div class="content-arabic" style="font-size:1.3rem;margin-bottom:4px;color:var(--accent-dark);line-height:1.75;">${item.arabic}</div>
                ${item.roman ? `<div class="iq-card-translit">"${escapeHTML(item.roman)}"</div>` : ''}
                <div class="prayer-name">${escapeHTML(item.text)}</div>
                <div style="font-size:0.8rem;color:var(--text2);margin-top:4px;">${escapeHTML(item.reward)}</div>
            </div>
            <div class="prayer-xp iq-tabular">+${_n(item.xp)} XP</div>
        </div>`;
    });
    document.getElementById('morningArea').innerHTML = h + '</div>';
  }
  function toggleMorning(idx, xp) { 
    const dt=today(); if(!S.morningDone[dt]) S.morningDone[dt]={}; 
    const w = !!S.morningDone[dt][idx];
    S.morningDone[dt][idx] = !w; 
    if(xp){
      if(!w) { applyXpDelta(xp); window.playSound('pop'); if (typeof window.iqHaptic === 'function') window.iqHaptic(10); }
      else spendXp(xp);
    }
    saveState(); renderAll(); 
  }
  function renderEvening() {
    const dt = today(); if (!S.eveningDone[dt]) S.eveningDone[dt] = {};
    const total = EVENING_DHIKR.length;
    let completed = 0;
    for (let i=0; i<total; i++) { if (S.eveningDone[dt][i]) completed++; }
    
    let h = `<div class="section-title" style="justify-content:space-between;gap:12px;">
      <span>${iqIcon('moon')} ${escapeHTML(_t('Evening Adhkar (After Asr)'))}</span>
      <span class="iq-num-pill iq-tabular">${_n(completed)} / ${_n(total)}</span>
    </div><div class="adhkar-list" style="display:flex;flex-direction:column;gap:12px;width:100%;align-items:stretch;">`;
    EVENING_DHIKR.forEach((item, idx) => {
        const done = !!S.eveningDone[dt][idx];
        h += `<div class="vol-card${done?' done':''}" tabindex="0" role="button" aria-pressed="${done?'true':'false'}" aria-label="${escapeHTML(item.text)} (${item.xp} XP)" onclick="App.toggleEvening(${idx}, ${item.xp})" style="cursor:pointer;width:100%;box-sizing:border-box;">
            <div class="prayer-check" style="font-size:1.2rem;">${done?iqIcon('check'):iqIcon('moon')}</div>
            <div class="prayer-info">
                <div class="content-arabic" style="font-size:1.3rem;margin-bottom:4px;color:var(--accent-dark);line-height:1.75;">${item.arabic}</div>
                ${item.roman ? `<div class="iq-card-translit">"${escapeHTML(item.roman)}"</div>` : ''}
                <div class="prayer-name">${escapeHTML(item.text)}</div>
                <div style="font-size:0.8rem;color:var(--text2);margin-top:4px;">${escapeHTML(item.reward)}</div>
            </div>
            <div class="prayer-xp iq-tabular">+${_n(item.xp)} XP</div>
        </div>`;
    });
    document.getElementById('eveningArea').innerHTML = h + '</div>';
  }
  function toggleEvening(idx, xp) { 
    const dt=today(); if(!S.eveningDone[dt]) S.eveningDone[dt]={}; 
    const w = !!S.eveningDone[dt][idx];
    S.eveningDone[dt][idx] = !w; 
    if(xp){
      if(!w) { applyXpDelta(xp); window.playSound('pop'); if (typeof window.iqHaptic === 'function') window.iqHaptic(10); }
      else spendXp(xp);
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
      let h = `<button type="button" class="quran-back-btn" onclick="App.situationalBack()"><span class="iq-mirror-icon">${iqIcon('arrow-left')}</span> ${escapeHTML(_t('Back to Categories'))}</button>`;
      h += `<div class="section-title">${iqIcon(cat.icon)} ${escapeHTML(_t(cat.label))}</div>`;
      h += '<div class="adhkar-list" style="display:flex;flex-direction:column;gap:12px;width:100%;align-items:stretch;">';
      const favs = S.sitFavs || [];
      const sorted = cat.dhikr.map(function(item, idx) { return {item:item, idx:idx}; }).sort(function(a,b) {
        const aFav = favs.includes(_situationalView + '_' + a.idx) ? 0 : 1;
        const bFav = favs.includes(_situationalView + '_' + b.idx) ? 0 : 1;
        return aFav - bFav;
      });
      sorted.forEach(function(entry) {
        const item = entry.item, idx = entry.idx;
        const dayKey = _situationalView + '_' + idx + '|' + today();
        const tapCount = (S.situationalXp && S.situationalXp[dayKey]) || 0;
        const maxed = tapCount >= 10;
        const isFav = favs.includes(_situationalView + '_' + idx);
        h += `<div class="vol-card" role="button" tabindex="0" aria-label="Tap ${escapeHTML(item.english)}" style="position:relative;cursor:pointer;width:100%;box-sizing:border-box;padding-inline-end:48px;${maxed ? 'opacity:0.65;' : ''}" onclick="App.tapSituationalDhikr('${_situationalView}',${idx})">
            <button type="button" class="sit-fav-btn" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}" title="${isFav ? 'Unpin dhikr' : 'Pin dhikr'}" style="position:absolute;top:6px;inset-inline-end:6px;min-width:44px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;padding:6px;font-size:1rem;line-height:1;color:${isFav ? 'var(--accent-dark)' : 'var(--text3)'};" onclick="event.stopPropagation();App.toggleSitFav('${_situationalView}',${idx})">${isFav ? iqIcon('star') : iqIcon('bookmark')}</button>
            <div class="prayer-info">
              <div class="content-arabic" style="font-size:1.3rem;margin-bottom:4px;color:var(--accent-dark);line-height:1.75;">${item.arabic}</div>
              ${item.roman ? '<div class="iq-card-translit">"' + escapeHTML(item.roman) + '"</div>' : ''}
              <div class="prayer-name">${escapeHTML(item.english)}</div>
              ${item.source ? '<div style="font-size:0.75rem;color:var(--text2);margin-top:4px;">' + iqIcon('book-open') + ' ' + escapeHTML(item.source) + '</div>' : ''}
            </div>
            <div class="prayer-xp iq-tabular">+${_n(5)} XP<br><span style="font-size:0.65rem;opacity:0.85;">${_n(tapCount)}/${_n(10)}</span></div>
        </div>`;
      });
      h += '</div>';
      el.innerHTML = h;
      return;
    }

    const keys = Object.keys(SITUATIONAL_DHIKR);
    let h = '<div class="section-title">' + iqIcon('heart') + ' ' + escapeHTML(_t('Situational Dhikr')) + '</div>';
    h += `<div style="color:var(--text2);font-size:0.84rem;margin-bottom:14px;line-height:1.5;">${escapeHTML(_t('Dhikr organized by emotional and spiritual need. Tap a category to explore.'))}</div>`;
    h += '<div class="situational-grid">';
    keys.forEach(function(key) {
      const cat = SITUATIONAL_DHIKR[key];
      let totalTaps = 0;
      if (S.situationalXp) {
        cat.dhikr.forEach(function(_, idx) {
          const dayKeys = Object.keys(S.situationalXp).filter(k => k.startsWith(key + '_' + idx + '|'));
          dayKeys.forEach(function(dk) { totalTaps += S.situationalXp[dk]; });
        });
      }
      h += '<button type="button" class="situational-card" onclick="App.openSituational(\'' + key + '\')" aria-label="Explore ' + cat.label + '">';
      h += '<div class="situational-icon">' + iqIcon(cat.icon) + '</div>';
      h += '<div class="situational-label">' + cat.label + '</div>';
      h += '<div class="situational-count">' + cat.dhikr.length + ' dhikr' + (totalTaps > 0 ? ' · ' + totalTaps + ' taps' : '') + '</div>';
      h += '</button>';
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

  // ── Combined renderers (Task 4 + Amendment A) ──
  // Each combined renderer calls the dedicated render<X>() where one is
  // defined in this file, else renderPoolMember('<id>') for NEW_POOLS-only
  // members (titles identical to the generic loop in render/dynamic.js).
  function renderPoolMember(k) {
    if (typeof NEW_POOLS !== 'undefined' && NEW_POOLS[k] && NEW_POOLS[k].length) {
      var title = (typeof window !== 'undefined' && window.NEW_POOL_TITLES && window.NEW_POOL_TITLES[k]) || (iqIcon('book-open') + ' ' + k);
      poolRender(k + 'Area', title, NEW_POOLS[k], k + 'Idx');
    }
  }
  function renderVirtues() { renderIkhlas(); renderTawakkul(); renderPatience(); renderPoolMember('hope'); renderPoolMember('fear'); renderPoolMember('loveofallah'); renderPoolMember('contentment'); }
  function renderVicesreturn() { renderHeart(); renderSins(); renderRepentance(); }
  function renderCharacterpath() { renderManners(); renderZuhd(); renderPoolMember('sufism'); renderPoolMember('tazkiyah'); renderInspirations(); renderPoolMember('reflection'); }
  function renderWorshiprulings() { renderPoolMember('purification'); renderPoolMember('salahrules'); renderPoolMember('sawmrules'); renderPoolMember('hajjrules'); renderHajj(); }
  function renderWealthoaths() { renderPoolMember('zakatrules'); renderPoolMember('trade'); renderPoolMember('inheritance'); renderPoolMember('oaths'); }
  function renderFamilylife() { renderFamily(); renderMarriage(); renderParenting(); }
  function renderCommunity() {
    renderNeighbors();
    if (typeof COMMUNITY_POOL !== 'undefined') poolRender('communityArea', iqIcon('building') + ' Community & Society', COMMUNITY_POOL, 'communityIdx');
    renderPoolMember('brotherhood'); renderPoolMember('sisterhood'); renderUmmah(); renderPoolMember('antiracism');
  }
  function renderService() { renderPoolMember('orphans2'); renderPoolMember('elderly'); renderPoolMember('disabled'); renderPoolMember('poverty'); renderPoolMember('volunteering'); }
  function renderWellness() { renderHealth(); renderTibb(); renderPoolMember('mentalhealth'); }

  window.getSourceLink = getSourceLink;
  window.poolRender = poolRender;
  window.renderDuas = renderDuas;
  window.renderSunnahs = renderSunnahs;
  window.renderDhikr = renderDhikr;
  window.renderStories = renderStories;
  window.renderNames = renderNames;
  window.renderSins = renderSins;
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
  window.renderWudu = renderWudu;
  window.renderScholars = renderScholars;
  window.renderPatience = renderPatience;
  window.renderCommunity = renderCommunity;
  window.renderFiqh = renderFiqh;
  window.renderTawakkul = renderTawakkul;
  window.renderIkhlas = renderIkhlas;
  window.renderZuhd = renderZuhd;
  window.renderJannah = renderJannah;
  window.renderJahannam = renderJahannam;
  window.renderGrave = renderGrave;
  window.renderSigns = renderSigns;
  window.renderParenting = renderParenting;
  window.renderTibb = renderTibb;
  window.renderNeighbors = renderNeighbors;
  window.renderVirtues = renderVirtues;
  window.renderVicesreturn = renderVicesreturn;
  window.renderCharacterpath = renderCharacterpath;
  window.renderWorshiprulings = renderWorshiprulings;
  window.renderWealthoaths = renderWealthoaths;
  window.renderFamilylife = renderFamilylife;
  window.renderService = renderService;
  window.renderWellness = renderWellness;
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
      let h = `<button type="button" class="quran-back-btn" onclick="App.extraDeedsBack()"><span class="iq-mirror-icon">${iqIcon('arrow-left')}</span> ${escapeHTML(_t('Back to Categories'))}</button>`;
      h += '<div class="section-title">' + iqIcon(cat.icon) + ' ' + escapeHTML(_t(cat.label)) + '</div>';
      h += '<div class="adhkar-list" style="display:flex;flex-direction:column;gap:12px;width:100%;align-items:stretch;">';
      cat.deeds.forEach(function(item) {
        h += '<div class="vol-card" style="cursor:default;width:100%;box-sizing:border-box;">';
        h += '<div class="prayer-info">';
        h += '<div class="iq-card-title">' + item.name + '</div>';
        h += '<div style="font-size:0.85rem;color:var(--text2);margin-top:4px;line-height:1.5;">"' + item.virtue + '"</div>';
        if (item.source) h += '<div style="font-size:0.75rem;color:var(--text2);margin-top:4px;">' + iqIcon('book-open') + ' ' + item.source + '</div>';
        h += '</div>';
        h += '<div class="card-info-btn" role="button" tabindex="0" aria-label="Details: ' + item.name + '" onclick="event.stopPropagation();App.detail(\'' + item.id + '\')">' + iqIcon('info') + '</div>';
        h += '</div>';
      });
      h += '</div>';
      el.innerHTML = h;
      return;
    }

    var keys = Object.keys(EXTRA_GOOD_DEEDS);
    var h = '<div class="section-title">' + iqIcon('star') + ' ' + escapeHTML(_t('Extra Good Deeds')) + '</div>';
    h += `<div style="color:var(--text2);font-size:0.84rem;margin-bottom:14px;line-height:1.5;">${escapeHTML(_t('Virtuous deeds organized by spiritual benefit. Tap a category to explore.'))}</div>`;
    h += '<div class="guide-grid">';
    keys.forEach(function(key) {
      var cat = EXTRA_GOOD_DEEDS[key];
      h += '<div class="guide-card" onclick="App.openExtraDeeds(\'' + key + '\')">';
      h += '<div class="guide-icon">' + iqIcon(cat.icon) + '</div>';
      h += '<div class="guide-label">' + escapeHTML(_t(cat.label)) + '</div>';
      h += '<div class="guide-count iq-tabular">' + _n(cat.deeds.length) + ' ' + escapeHTML(_t('deeds')) + '</div>';
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
      let h = `<button type="button" class="quran-back-btn" onclick="App.volPrayersBack()"><span class="iq-mirror-icon">${iqIcon('arrow-left')}</span> ${escapeHTML(_t('Back to Categories'))}</button>`;
      h += '<div class="section-title">' + iqIcon(cat.icon) + ' ' + escapeHTML(_t(cat.label)) + '</div>';
      h += '<div class="adhkar-list" style="display:flex;flex-direction:column;gap:12px;width:100%;align-items:stretch;">';
      cat.prayers.forEach(function(item) {
        h += '<div class="vol-card" style="cursor:default;width:100%;box-sizing:border-box;">';
        h += '<div class="prayer-info">';
        h += '<div class="iq-card-title">' + item.name + '</div>';
        h += '<div style="font-size:0.85rem;color:var(--text);margin-top:4px;line-height:1.5;">' + item.desc + '</div>';
        h += '<div style="font-size:0.8rem;color:var(--accent-dark);margin-top:4px;font-weight:600;">' + item.rakat + '</div>';
        if (item.source) h += '<div style="font-size:0.75rem;color:var(--text2);margin-top:4px;">' + iqIcon('book-open') + ' ' + item.source + '</div>';
        h += '</div>';
        h += '<div class="card-info-btn" role="button" tabindex="0" aria-label="Details: ' + item.name + '" onclick="event.stopPropagation();App.detail(\'' + item.id + '\')">' + iqIcon('info') + '</div>';
        h += '</div>';
      });
      h += '</div>';
      el.innerHTML = h;
      return;
    }

    var keys = Object.keys(VOL_PRAYERS);
    var h = '<div class="section-title">' + iqIcon('moon') + ' ' + escapeHTML(_t('Volunteer Prayers')) + '</div>';
    h += `<div style="color:var(--text2);font-size:0.84rem;margin-bottom:14px;line-height:1.5;">${escapeHTML(_t('Sunnah and nafl prayers organized by type. Tap a category to explore.'))}</div>`;
    h += '<div class="guide-grid">';
    keys.forEach(function(key) {
      var cat = VOL_PRAYERS[key];
      h += '<div class="guide-card" onclick="App.openVolPrayers(\'' + key + '\')">';
      h += '<div class="guide-icon">' + iqIcon(cat.icon) + '</div>';
      h += '<div class="guide-label">' + escapeHTML(_t(cat.label)) + '</div>';
      h += '<div class="guide-count iq-tabular">' + _n(cat.prayers.length) + ' ' + escapeHTML(_t('prayers')) + '</div>';
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
  window.escapeHTML = escapeHTML;
})();
