(function() {
  // -------------------------------------------------------
  // PRAYER RENDERING & PRAYER TIMES
  // -------------------------------------------------------

  function renderPrayers() {
    const l = tlog(), f = isFri();
    const cards = PRAYERS.map(p => {
      const d = !!l.p[p.id]; let nm=p.name, xp=p.xp;
      if (f && p.id==='dhuhr') { nm=p.fri.name; xp=p.fri.xp; }
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
  const DEFAULT_PRAYER_SETTINGS = { lat: 23.8103, lng: 90.4125, label: 'Dhaka', method: 1 };

  function getPrayerSettings() {
    const saved = (typeof S === 'object' && S.prayerSettings) || {};
    const lat = Number(saved.lat), lng = Number(saved.lng), method = Number(saved.method);
    return {
      lat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : DEFAULT_PRAYER_SETTINGS.lat,
      lng: Number.isFinite(lng) && lng >= -180 && lng <= 180 ? lng : DEFAULT_PRAYER_SETTINGS.lng,
      label: typeof saved.label === 'string' && saved.label.trim() ? saved.label.trim() : DEFAULT_PRAYER_SETTINGS.label,
      method: Number.isFinite(method) && method > 0 ? method : DEFAULT_PRAYER_SETTINGS.method
    };
  }

  function prayerCacheKey() {
    const p = getPrayerSettings();
    return PRAYER_CACHE_KEY + '_' + p.lat.toFixed(3) + '_' + p.lng.toFixed(3) + '_' + p.method;
  }

  let prayerTimesRequest = null;

  function safePrayerText(value) {
    return window.escapeHTML(value);
  }

  function getPrayerTimesFromCache() {
    try {
      const raw = localStorage.getItem(prayerCacheKey());
      if (!raw) return null;
      const cache = JSON.parse(raw);
      if (cache.date === today()) return cache.times;
      return null;
    } catch(e) { return null; }
  }

  function setPrayerTimesCache(times) {
    try {
      localStorage.setItem(prayerCacheKey(), JSON.stringify({ date: today(), times }));
    } catch(e) {}
  }

  function parsePrayerTime(timeStr) {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return { h, m };
  }

  async function fetchPrayerTimes() {
    if (prayerTimesRequest) return prayerTimesRequest;
    prayerTimesRequest = fetchPrayerTimesInternal();
    try { return await prayerTimesRequest; } finally { prayerTimesRequest = null; }
  }

  async function fetchPrayerTimesInternal() {
    const cached = getPrayerTimesFromCache();
    if (cached) return cached;
    const settings = getPrayerSettings();
    const d = new Date();
    const dateStr = String(d.getDate()).padStart(2,'0') + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + d.getFullYear();
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${settings.lat}&longitude=${settings.lng}&method=${settings.method}`;
    try {
      const res = await fetch(url);
      if (res && res.ok === false) throw new Error('Prayer times request failed');
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
      const settings = getPrayerSettings();
      const locateButton = typeof navigator !== 'undefined' && navigator.geolocation
        ? '<button class="shop-card" type="button" onclick="useCurrentPrayerLocation()" style="padding:7px 10px;font-size:0.75rem;">Use my location</button>'
        : '';
      el.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;color:var(--text2);font-size:0.8rem;"><span>Location: ${safePrayerText(settings.label)}</span>${locateButton}</div><div class="prayer-times-grid">` + prayerNames.map(name => {
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

  function useCurrentPrayerLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (typeof toast === 'function') toast(iqIcon('map-pin'), 'Location is not available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(function(position) {
      const coords = position.coords;
      S.prayerSettings = {
        lat: coords.latitude,
        lng: coords.longitude,
        label: 'Current location',
        method: getPrayerSettings().method
      };
      saveState();
      renderPrayerTimes();
      renderTimer();
      if (typeof toast === 'function') toast(iqIcon('map-pin'), 'Prayer times updated for your location.');
    }, function() {
      if (typeof toast === 'function') toast(iqIcon('map-pin-off'), 'Unable to access your location.');
    }, { enableHighAccuracy: false, maximumAge: 86400000, timeout: 10000 });
  }

  function renderTimer() {
    if (window.timerInt) clearInterval(window.timerInt);
    function tick(times) {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const prayers = ['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(n => ({ n, ...times[n] })).filter(p => p.h != null);
      if (!prayers.length) return;
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

  window.renderPrayers = renderPrayers;
  window.renderVol = renderVol;
  window.renderDeeds = renderDeeds;
  window.fetchPrayerTimes = fetchPrayerTimes;
  window.renderPrayerTimes = renderPrayerTimes;
  window.renderTimer = renderTimer;
  window.useCurrentPrayerLocation = useCurrentPrayerLocation;
})();
