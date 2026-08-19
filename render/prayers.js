(function() {
  // -------------------------------------------------------
  // PRAYER RENDERING & PRAYER TIMES
  // -------------------------------------------------------

  function renderPrayers() {
    const l = tlog(), f = isFri();
    const cards = PRAYERS.map(p => {
      const d = !!l.p[p.id]; let nm=p.name, ic=p.icon, xp=p.xp;
      if (f && p.id==='dhuhr') { nm=p.fri.name; ic=p.fri.icon; xp=p.fri.xp; }
      if (S.ab && S.ab.exp >= today()) xp *= 2;
      return `<div class="card-item${d?' done':''}" tabindex="0" role="button" onclick="App.toggleP('${p.id}')"><div class="card-icon">${iqIcon(p.id)}</div><div class="card-name">${nm}</div><div class="card-sub">${p.time}</div><div class="card-xp">+${xp} XP</div>${d?'<div class="card-check">'+iqIcon('check')+'</div>':''}<div class="card-info-btn" onclick="event.stopPropagation();App.detail('${p.id}')">ℹ</div></div>`;
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
      html += byCat[cat].map(v => { const d=!!l[v.id]; let xp=v.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; return `<div class="card-item${d?' done':''}" tabindex="0" role="button" onclick="App.toggleV('${v.id}')"><div class="card-icon">${iqIcon(v.icon || v.id)}</div><div class="card-name">${v.name}</div><div class="card-xp">+${xp} XP</div>${d?'<div class="card-check">' + iqIcon('check') + '</div>':''}<div class="card-info-btn" onclick="event.stopPropagation();App.detail('${v.id}')">${iqIcon('info')}</div></div>`; }).join('');
      html += '</div></div></details>';
      catIdx++;
    }
    if (volArea) volArea.innerHTML = html;
  }

  function renderDeeds() {
    const deedArea = document.getElementById('deedArea');
    const openStates = deedArea ? Array.from(deedArea.querySelectorAll('details.cat-details')).map(d => d.open) : [];

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
      html += items.map(d => { const done=!!l[d.id]; const tot=S.td[d.id]||0; let xp=d.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; return `<div class="card-item${done?' done':''}" tabindex="0" role="button" onclick="App.toggleD('${d.id}')"><div class="card-icon">${iqIcon(d.icon || d.id)}</div><div class="card-name">${d.name}</div><div class="card-xp">+${xp} XP</div>${done?'<div class="card-check">' + iqIcon('check') + '</div>':''}${tot?`<div class="card-sub">${tot}×</div>`:''}<div class="card-info-btn" onclick="event.stopPropagation();App.tip('${d.id}')">${iqIcon('info')}</div></div>`; }).join('');
      html += '</div></div></details>';
      catIdx++;
    }
    document.getElementById('deedArea').innerHTML = html;
  }

  const PRAYER_CACHE_KEY = 'iq9_prayer_times';
  const DHAKA_LAT = 23.8103, DHAKA_LNG = 90.4125;
  const PRAYER_METHOD = 1;

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
      const ss = String(Math.floor((diff / (1000*60)) % 60)).padStart(2,'0');
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

  window.renderPrayers = renderPrayers;
  window.renderVol = renderVol;
  window.renderDeeds = renderDeeds;
  window.fetchPrayerTimes = fetchPrayerTimes;
  window.renderPrayerTimes = renderPrayerTimes;
  window.renderTimer = renderTimer;
})();