(function() {
  // -------------------------------------------------------
  // PRAYER RENDERING & PRAYER TIMES
  // -------------------------------------------------------

  function _renderNextPrayerPillHtml(cachedTimes) {
    const settings = getPrayerSettings();
    const nextInfo = cachedTimes ? computeNextPrayer(cachedTimes) : null;
    const pill = nextInfo
      ? `<button type="button" id="iqNextPrayerPill" class="iq-next-prayer-pill" onclick="App.activateTab('timer')">Next: <strong>${safePrayerText(nextInfo.name)}</strong> &middot; ${safePrayerText(nextInfo.timeLabel)} <span class="iq-pill-eta">${safePrayerText(nextInfo.shortRemaining)}</span></button>`
      : `<button type="button" id="iqNextPrayerPill" class="iq-next-prayer-pill" onclick="App.activateTab('timer')">Prayer Times &middot; ${safePrayerText(settings.label)} &rsaquo;</button>`;
    const pauseBtn = `<button type="button" class="iq-pause-btn${settings.paused ? ' active' : ''}" onclick="App.togglePrayerPause()" aria-pressed="${!!settings.paused}" title="Protect streak during excused days">${settings.paused ? 'Streak Paused' : 'Grace Mode'}</button>`;
    return `<div class="iq-prayer-header-actions">${pill}${pauseBtn}</div>`;
  }

  function renderPrayers() {
    if (typeof document === 'undefined') return;
    const area = document.getElementById('prayerArea');
    if (!area) return;
    const l = tlog(), f = isFri();
    const cached = getPrayerTimesFromCache();
    const nextInfo = cached ? computeNextPrayer(cached) : null;
    const cards = PRAYERS.map(p => {
      const raw = l.p && l.p[p.id];
      const d = !!raw;
      const isQada = raw === 'qada';
      let nm = p.name, xp = p.xp;
      if (f && p.id === 'dhuhr') { nm = p.fri.name; xp = p.fri.xp; }
      if (S.ab && S.ab.exp >= today()) xp *= 2;
      const capKey = p.id.charAt(0).toUpperCase() + p.id.slice(1);
      const cachedSlot = cached && cached[capKey];
      const liveTime = (cachedSlot && typeof cachedSlot.h === 'number') ? formatTime12(cachedSlot.h, cachedSlot.m) : p.time;
      const isNext = !!(nextInfo && !nextInfo.isTomorrow && nextInfo.name.toLowerCase() === p.id && !d);
      const cls = `card-item${d ? ' done' : ''}${isQada ? ' qada' : ''}${isNext ? ' iq-next-prayer-card' : ''}`;
      return `<div class="${cls}" tabindex="0" role="button" onclick="App.toggleP('${p.id}')">` +
        (isNext ? '<span class="iq-next-badge">UP NEXT</span>' : '') +
        `<div class="card-icon">${iqIcon(p.id)}</div>` +
        `<div class="card-name">${nm}</div>` +
        `<div class="card-sub iq-tabular">${safePrayerText(liveTime)}</div>` +
        `<div class="card-xp">+${xp} XP</div>` +
        (d ? `<div class="card-check" title="${isQada ? 'Made up (Qada)' : 'Completed'}">${isQada ? 'Q' : iqIcon('check')}</div>` : '') +
        `<div class="card-qada-btn${isQada ? ' active' : ''}" role="button" tabindex="0" aria-label="Mark ${nm} made up (Qada)" title="Toggle Qada (made up)" onclick="event.stopPropagation();App.togglePrayerQada('${p.id}')">${isQada ? 'Qada' : 'Q'}</div>` +
        `<div class="card-info-btn" role="button" tabindex="0" aria-label="Details: ${nm}" onclick="event.stopPropagation();App.detail('${p.id}')">ℹ</div>` +
      `</div>`;
    }).join('');
    area.innerHTML = `<div class="prayer-header-row"><div class="section-title" style="margin:0;">Daily Prayers</div>${_renderNextPrayerPillHtml(cached)}</div><div class="card-grid">${cards}</div>`;
    if (!cached) {
      fetchPrayerTimes().then(times => {
        if (!times) return;
        if (getPrayerTimesFromCache()) renderPrayers();
      }).catch(() => {});
    }
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
      html += byCat[cat].map(v => { const d=!!l[v.id]; let xp=v.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; return `<div class="card-item${d?' done':''}" tabindex="0" role="button" onclick="App.toggleV('${v.id}')"><div class="card-icon">${iqIcon(v.icon || v.id)}</div><div class="card-name">${v.name}</div><div class="card-xp">+${xp} XP</div>${d?'<div class="card-check">' + iqIcon('check') + '</div>':''}<div class="card-info-btn" role="button" tabindex="0" aria-label="Details: ${v.name}" onclick="event.stopPropagation();App.detail('${v.id}')">${iqIcon('info')}</div></div>`; }).join('');
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
      html += items.map(d => { const done=!!l[d.id]; const tot=S.td[d.id]||0; let xp=d.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; return `<div class="card-item${done?' done':''}" tabindex="0" role="button" onclick="App.toggleD('${d.id}')"><div class="card-icon">${iqIcon(d.icon || d.id)}</div><div class="card-name">${d.name}</div><div class="card-xp">+${xp} XP</div>${done?'<div class="card-check">' + iqIcon('check') + '</div>':''}${tot?`<div class="card-sub">${tot}×</div>`:''}<div class="card-info-btn" role="button" tabindex="0" aria-label="Details: ${d.name}" onclick="event.stopPropagation();App.tip('${d.id}')">${iqIcon('info')}</div></div>`; }).join('');
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
      method: Number.isFinite(method) && method > 0 ? method : DEFAULT_PRAYER_SETTINGS.method,
      paused: !!saved.paused
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

  const PRAYER_CITY_PRESETS = [
    { label: 'Dhaka', lat: 23.8103, lng: 90.4125, method: 1 },
    { label: 'Makkah', lat: 21.4225, lng: 39.8262, method: 4 },
    { label: 'Madinah', lat: 24.4672, lng: 39.6111, method: 4 },
    { label: 'Istanbul', lat: 41.0082, lng: 28.9784, method: 13 },
    { label: 'Cairo', lat: 30.0444, lng: 31.2357, method: 5 },
    { label: 'London', lat: 51.5072, lng: -0.1276, method: 2 },
    { label: 'New York', lat: 40.7128, lng: -74.0060, method: 2 },
    { label: 'Toronto', lat: 43.6532, lng: -79.3832, method: 2 },
    { label: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, method: 3 }
  ];

  const PRAYER_METHODS = [
    { id: 1, name: 'Karachi / Dhaka (Univ. Islamic Sciences)' },
    { id: 2, name: 'ISNA (North America)' },
    { id: 3, name: 'Muslim World League (MWL)' },
    { id: 4, name: 'Umm Al-Qura (Makkah)' },
    { id: 5, name: 'Egyptian General Authority' },
    { id: 13, name: 'Diyanet (Turkey)' }
  ];

  function formatTime12(h, m) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  function computeNextPrayer(times, nowDate) {
    if (!times || typeof times !== 'object') return null;
    const now = (nowDate && typeof nowDate.getHours === 'function') ? nowDate : new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
      .map(n => (times[n] && typeof times[n].h === 'number') ? { name: n, h: times[n].h, m: times[n].m } : null)
      .filter(Boolean);
    if (!prayers.length) return null;

    let next = null;
    let isTomorrow = false;
    for (const p of prayers) {
      if ((p.h * 60 + p.m) > nowMin) { next = p; break; }
    }
    const targetDate = new Date(now.getTime());
    if (!next) {
      next = prayers[0];
      isTomorrow = true;
      targetDate.setDate(targetDate.getDate() + 1);
    }
    targetDate.setHours(next.h, next.m, 0, 0);
    const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
    const totalSec = Math.floor(diffMs / 1000);
    const hhNum = Math.floor(totalSec / 3600);
    const mmNum = Math.floor((totalSec % 3600) / 60);
    const ssNum = totalSec % 60;
    const countdownText = `${String(hhNum).padStart(2, '0')}:${String(mmNum).padStart(2, '0')}:${String(ssNum).padStart(2, '0')}`;
    const shortRemaining = hhNum > 0 ? `in ${hhNum}h ${mmNum}m` : `in ${mmNum}m`;
    return {
      name: next.name,
      h: next.h,
      m: next.m,
      timeLabel: formatTime12(next.h, next.m),
      isTomorrow,
      diffMs,
      countdownText,
      shortRemaining
    };
  }

  function updatePrayerSettings(opts) {
    const prev = getPrayerSettings();
    const input = (opts && typeof opts === 'object') ? opts : {};
    const lat = Number(input.lat);
    const lng = Number(input.lng);
    const method = Number(input.method);
    const labelStr = typeof input.label === 'string' && input.label.trim() ? input.label.trim().slice(0, 60) : prev.label;
    const next = {
      lat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : prev.lat,
      lng: Number.isFinite(lng) && lng >= -180 && lng <= 180 ? lng : prev.lng,
      label: labelStr,
      method: Number.isFinite(method) && method > 0 ? Math.round(method) : prev.method,
      paused: typeof input.paused === 'boolean' ? input.paused : !!prev.paused
    };
    if (typeof S === 'object' && S) S.prayerSettings = next;
    if (typeof saveState === 'function') saveState();
    if (typeof renderPrayerTimes === 'function') renderPrayerTimes();
    if (typeof renderTimer === 'function') renderTimer();
    if (typeof renderPrayers === 'function') renderPrayers();
    if (typeof window !== 'undefined' && typeof window.renderIqFeed === 'function') window.renderIqFeed();
    return next;
  }

  function togglePrayerPause() {
    const cur = getPrayerSettings();
    const next = updatePrayerSettings({ paused: !cur.paused });
    if (typeof toast === 'function') {
      toast(iqIcon(next.paused ? 'moon' : 'check'), next.paused ? 'Grace Mode active — prayer streak protected.' : 'Grace Mode off — daily prayer streak active.');
    }
    return next.paused;
  }

  function applyPrayerCityPreset(idxStr) {
    const idx = parseInt(idxStr, 10);
    const city = PRAYER_CITY_PRESETS[idx];
    if (!city) return;
    updatePrayerSettings({ lat: city.lat, lng: city.lng, label: city.label, method: city.method });
    if (typeof toast === 'function') toast(iqIcon('map-pin'), `Prayer city updated: ${city.label}`);
  }

  function applyPrayerMethod(methodStr) {
    const m = parseInt(methodStr, 10);
    if (!Number.isFinite(m) || m <= 0) return;
    updatePrayerSettings({ method: m });
    if (typeof toast === 'function') toast(iqIcon('clock'), 'Calculation method updated.');
  }

  function renderPrayerTimes() {
    if (typeof document === 'undefined') return;
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
      const settings = getPrayerSettings();
      const cityOptions = PRAYER_CITY_PRESETS.map((c, i) => {
        const sel = c.label.toLowerCase() === settings.label.toLowerCase() ? ' selected' : '';
        return `<option value="${i}"${sel}>${safePrayerText(c.label)}</option>`;
      }).join('');
      const hasPreset = PRAYER_CITY_PRESETS.some(c => c.label.toLowerCase() === settings.label.toLowerCase());
      const customCityOpt = !hasPreset ? `<option value="" selected>${safePrayerText(settings.label)}</option>` : '';
      const methodOptions = PRAYER_METHODS.map(m =>
        `<option value="${m.id}"${m.id === settings.method ? ' selected' : ''}>${safePrayerText(m.name)}</option>`
      ).join('');
      const locateButton = typeof navigator !== 'undefined' && navigator.geolocation
        ? '<button class="iq-pt-gps-btn" type="button" onclick="useCurrentPrayerLocation()">Use GPS</button>'
        : '';
      const controlsHtml = `<div class="iq-pt-controls">` +
        `<div class="iq-pt-ctrl-group"><label class="iq-pt-label" for="iqPrayerCitySelect">City</label><select id="iqPrayerCitySelect" class="iq-pt-select" onchange="window.applyPrayerCityPreset(this.value)">${customCityOpt}${cityOptions}</select></div>` +
        `<div class="iq-pt-ctrl-group"><label class="iq-pt-label" for="iqPrayerMethodSelect">Method</label><select id="iqPrayerMethodSelect" class="iq-pt-select" onchange="window.applyPrayerMethod(this.value)">${methodOptions}</select></div>` +
        `${locateButton}</div>`;

      if (!times) {
        el.innerHTML = controlsHtml + '<div style="text-align:center;color:var(--text2);padding:20px;">Unable to load prayer times. Please check your connection.</div>';
        return;
      }
      const nextInfo = computeNextPrayer(times);
      const nextPrayer = nextInfo && !nextInfo.isTomorrow ? nextInfo.name : null;
      el.innerHTML = controlsHtml + '<div class="prayer-times-grid">' + ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'].map(name => {
        const t = times[name];
        if (!t) return '';
        const isNext = name === nextPrayer;
        return `<div class="pt-card${isNext ? ' next-prayer' : ''}">
          <div class="pt-icon">${icons[name]}</div>
          <div class="pt-name">${name}</div>
          <div class="pt-time">${formatTime12(t.h, t.m)}</div>
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
      updatePrayerSettings({
        lat: coords.latitude,
        lng: coords.longitude,
        label: 'Current location',
        method: getPrayerSettings().method
      });
      if (typeof toast === 'function') toast(iqIcon('map-pin'), 'Prayer times updated for your location.');
    }, function() {
      if (typeof toast === 'function') toast(iqIcon('map-pin-off'), 'Unable to access your location.');
    }, { enableHighAccuracy: false, maximumAge: 86400000, timeout: 10000 });
  }

  function renderTimer() {
    if (typeof document === 'undefined') return;
    if (window.timerInt) clearInterval(window.timerInt);
    function tick(times) {
      const info = computeNextPrayer(times);
      if (!info) return;
      const te = document.getElementById('timerArea');
      const pna = document.getElementById('prayerNamesArea');
      if (te) te.innerText = info.countdownText;
      if (pna) pna.innerText = `Until ${info.name} (${info.timeLabel})`;
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
  window.getPrayerTimesFromCache = getPrayerTimesFromCache;
  window.getPrayerSettings = getPrayerSettings;
  window.computeNextPrayer = computeNextPrayer;
  window.updatePrayerSettings = updatePrayerSettings;
  window.togglePrayerPause = togglePrayerPause;
  window.applyPrayerCityPreset = applyPrayerCityPreset;
  window.applyPrayerMethod = applyPrayerMethod;
  window.renderPrayerTimes = renderPrayerTimes;
  window.renderTimer = renderTimer;
  window.stopPrayerTimer = function() {
    if (window.timerInt) { clearInterval(window.timerInt); window.timerInt = null; }
  };
  window.useCurrentPrayerLocation = useCurrentPrayerLocation;
})();
