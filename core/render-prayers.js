(function() {
  // -------------------------------------------------------
  // OFFLINE-FIRST PRAYER ENGINE (adhan-js MIT) + QIBLA + FIQH CONTROLS
  // -------------------------------------------------------

  const PRAYER_CACHE_KEY = 'iq9_prayer_times';
  const DEFAULT_PRAYER_SETTINGS = {
    lat: 23.8103, lng: 90.4125, label: 'Dhaka', method: 1,
    paused: false, asrSchool: 'hanafi', highLat: 'middle',
    fajrAngle: 18, ishaAngle: 18,
    offsets: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    mosqueTimes: {}
  };

  function tr(key) {
    return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(key) : key;
  }

  function nfmt(v) {
    return (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function') ? window.iqFormatNum(v) : String(v);
  }

  function safePrayerText(value) {
    return window.escapeHTML(value);
  }

  function _cleanOffsets(raw) {
    var base = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
    if (!raw || typeof raw !== 'object') return base;
    Object.keys(base).forEach(function(k) {
      var n = Number(raw[k]);
      if (Number.isFinite(n)) base[k] = Math.max(-60, Math.min(60, Math.round(n)));
    });
    return base;
  }

  function getPrayerSettings() {
    const saved = (typeof S === 'object' && S && S.prayerSettings) || {};
    const lat = Number(saved.lat), lng = Number(saved.lng), method = Number(saved.method);
    const asr = saved.asrSchool === 'shafi' ? 'shafi' : 'hanafi';
    const highLat = ['middle', 'seventh', 'twilight'].indexOf(saved.highLat) !== -1 ? saved.highLat : 'middle';
    return {
      lat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : DEFAULT_PRAYER_SETTINGS.lat,
      lng: Number.isFinite(lng) && lng >= -180 && lng <= 180 ? lng : DEFAULT_PRAYER_SETTINGS.lng,
      label: typeof saved.label === 'string' && saved.label.trim() ? saved.label.trim() : DEFAULT_PRAYER_SETTINGS.label,
      method: Number.isFinite(method) && method >= 0 ? method : DEFAULT_PRAYER_SETTINGS.method,
      paused: !!saved.paused,
      asrSchool: asr,
      highLat: highLat,
      fajrAngle: Number.isFinite(Number(saved.fajrAngle)) ? Math.max(10, Math.min(24, Number(saved.fajrAngle))) : 18,
      ishaAngle: Number.isFinite(Number(saved.ishaAngle)) ? Math.max(10, Math.min(24, Number(saved.ishaAngle))) : 18,
      offsets: _cleanOffsets(saved.offsets),
      mosqueTimes: (saved.mosqueTimes && typeof saved.mosqueTimes === 'object') ? saved.mosqueTimes : {}
    };
  }

  function prayerCacheKey() {
    const p = getPrayerSettings();
    return PRAYER_CACHE_KEY + '_' + p.lat.toFixed(3) + '_' + p.lng.toFixed(3) + '_' + p.method + '_' + p.asrSchool + '_' + p.highLat + '_' + p.fajrAngle + '_' + p.ishaAngle;
  }

  function _resolveAdhanMethod(adhan, methodId, st) {
    var CM = adhan.CalculationMethod;
    switch (Number(methodId)) {
      case 0: {
        var fa = (st && Number.isFinite(Number(st.fajrAngle))) ? Math.max(10, Math.min(24, Number(st.fajrAngle))) : 18;
        var ia = (st && Number.isFinite(Number(st.ishaAngle))) ? Math.max(10, Math.min(24, Number(st.ishaAngle))) : 18;
        if (typeof adhan.CalculationParameters === 'function') {
          return new adhan.CalculationParameters('Other', fa, ia);
        }
        var cp = CM.Other();
        cp.fajrAngle = fa;
        cp.ishaAngle = ia;
        return cp;
      }
      case 1: return CM.Karachi();
      case 2: return CM.NorthAmerica();
      case 3: return CM.MuslimWorldLeague();
      case 4: return CM.UmmAlQura();
      case 5: return CM.Egyptian();
      case 11: return CM.Singapore();
      case 13: return CM.Turkey();
      case 15: return CM.MoonsightingCommittee();
      default: return CM.Karachi();
    }
  }

  function computeOfflinePrayerTimes(settings, dateObj) {
    if (settings instanceof Date) {
      var tmpDate = settings;
      settings = dateObj;
      dateObj = tmpDate;
    }
    var adhanLib = (typeof adhan !== 'undefined' && adhan && adhan.Coordinates) ? adhan : ((typeof window !== 'undefined' && window.adhan) || (typeof globalThis !== 'undefined' && globalThis.adhan) || (typeof global !== 'undefined' && global.adhan) || null);
    if (!adhanLib || !adhanLib.Coordinates || !adhanLib.PrayerTimes) return null;
    try {
      var st = settings || getPrayerSettings();
      var dt = dateObj || new Date();
      var coords = new adhanLib.Coordinates(st.lat, st.lng);
      var params = _resolveAdhanMethod(adhanLib, st.method, st);
      params.madhab = st.asrSchool === 'shafi' ? adhanLib.Madhab.Shafi : adhanLib.Madhab.Hanafi;
      if (st.highLat === 'seventh') params.highLatitudeRule = adhanLib.HighLatitudeRule.SeventhOfTheNight;
      else if (st.highLat === 'twilight') params.highLatitudeRule = adhanLib.HighLatitudeRule.TwilightAngle;
      else params.highLatitudeRule = adhanLib.HighLatitudeRule.MiddleOfTheNight;
      if (adhanLib.PolarCircleResolution && Math.abs(st.lat) > 48) {
        params.polarCircleResolution = adhanLib.PolarCircleResolution.AqrabYaum;
      }

      var off = st.offsets || {};
      params.adjustments = {
        fajr: off.fajr || 0,
        sunrise: off.sunrise || 0,
        dhuhr: off.dhuhr || 0,
        asr: off.asr || 0,
        maghrib: off.maghrib || 0,
        isha: off.isha || 0
      };

      var presetMatch = st.tz ? null : (typeof PRAYER_CITY_PRESETS !== 'undefined' ? PRAYER_CITY_PRESETS.find(function(c) {
        return (st.label && c.label === st.label) || (Math.abs(c.lat - st.lat) < 0.05 && Math.abs(c.lng - st.lng) < 0.05);
      }) : null);
      var targetTz = st.tz || (presetMatch && presetMatch.tz) || null;
      var tzFmt = null;
      if (targetTz && typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
        try {
          tzFmt = new Intl.DateTimeFormat('en-GB', { timeZone: targetTz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
        } catch (e) { tzFmt = null; }
      }

      var pt = new adhanLib.PrayerTimes(coords, dt, params);
      function toSlot(d) {
        if (!d || isNaN(d.getTime())) return null;
        if (tzFmt) {
          try {
            var parts = tzFmt.format(d).split(':');
            if (parts.length === 2) return { h: parseInt(parts[0], 10) % 24, m: parseInt(parts[1], 10) };
          } catch (e) {}
        }
        return { h: d.getHours(), m: d.getMinutes() };
      }
      var res = {
        Fajr: toSlot(pt.fajr),
        Sunrise: toSlot(pt.sunrise),
        Dhuhr: toSlot(pt.dhuhr),
        Asr: toSlot(pt.asr),
        Maghrib: toSlot(pt.maghrib),
        Isha: toSlot(pt.isha),
        _source: 'offline-adhan'
      };
      // Optional manual mosque congregation overrides if set in valid HH:MM
      if (st.mosqueTimes) {
        ['Fajr','Dhuhr','Asr','Maghrib','Isha'].forEach(function(name) {
          var raw = st.mosqueTimes[name.toLowerCase()];
          if (typeof raw === 'string' && /^\d{1,2}:\d{2}$/.test(raw.trim())) {
            res[name + 'Jamaat'] = parsePrayerTime(raw.trim());
          }
        });
      }
      return res;
    } catch (e) {
      return null;
    }
  }

  function computeQiblaBearing(lat, lng) {
    var st = getPrayerSettings();
    var la = Number.isFinite(lat) ? lat : st.lat;
    var ln = Number.isFinite(lng) ? lng : st.lng;
    var adhanLib = (typeof adhan !== 'undefined' && adhan && adhan.Coordinates) ? adhan : ((typeof window !== 'undefined' && window.adhan) || (typeof globalThis !== 'undefined' && globalThis.adhan) || (typeof global !== 'undefined' && global.adhan) || null);
    if (adhanLib && typeof adhanLib.Qibla === 'function' && adhanLib.Coordinates) {
      return adhanLib.Qibla(new adhanLib.Coordinates(la, ln));
    }
    // Great-circle fallback to Kaaba (21.4225, 39.8262)
    var phiK = 21.4225 * Math.PI / 180;
    var lamK = 39.8262 * Math.PI / 180;
    var phi = la * Math.PI / 180;
    var lam = ln * Math.PI / 180;
    var psi = Math.atan2(Math.sin(lamK - lam), Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lamK - lam));
    var deg = (psi * 180 / Math.PI + 360) % 360;
    return deg;
  }

  function cardinalDir(deg) {
    var dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
  }

  let prayerTimesRequest = null;

  function getPrayerTimesFromCache() {
    try {
      const raw = localStorage.getItem(prayerCacheKey());
      if (raw) {
        const cache = JSON.parse(raw);
        if (cache.date === today()) return cache.times;
      }
    } catch(e) {}
    return computeOfflinePrayerTimes(getPrayerSettings(), new Date());
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
    const settings = getPrayerSettings();
    const offlineComputed = computeOfflinePrayerTimes(settings, new Date());
    if (offlineComputed && offlineComputed.Fajr) {
      setPrayerTimesCache(offlineComputed);
      return offlineComputed;
    }
    const cached = getPrayerTimesFromCache();
    if (cached) return cached;
    const d = new Date();
    const dateStr = String(d.getDate()).padStart(2,'0') + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + d.getFullYear();
    const school = settings.asrSchool === 'shafi' ? 0 : 1;
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${settings.lat}&longitude=${settings.lng}&method=${settings.method}&school=${school}`;
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
          Isha:    parsePrayerTime(t.Isha),
          _source: 'aladhan-api'
        };
        setPrayerTimesCache(times);
        return times;
      }
    } catch(e) { console.error('Prayer times fetch failed:', e); }
    return null;
  }

  const PRAYER_CITY_PRESETS = [
    { label: 'Dhaka', lat: 23.8103, lng: 90.4125, method: 1, asrSchool: 'hanafi', tz: 'Asia/Dhaka' },
    { label: 'Chattogram', lat: 22.3569, lng: 91.7832, method: 1, asrSchool: 'hanafi', tz: 'Asia/Dhaka' },
    { label: 'Sylhet', lat: 24.8949, lng: 91.8687, method: 1, asrSchool: 'hanafi', tz: 'Asia/Dhaka' },
    { label: 'Makkah', lat: 21.4225, lng: 39.8262, method: 4, asrSchool: 'shafi', tz: 'Asia/Riyadh' },
    { label: 'Madinah', lat: 24.4672, lng: 39.6111, method: 4, asrSchool: 'shafi', tz: 'Asia/Riyadh' },
    { label: 'Istanbul', lat: 41.0082, lng: 28.9784, method: 13, asrSchool: 'hanafi', tz: 'Europe/Istanbul' },
    { label: 'Cairo', lat: 30.0444, lng: 31.2357, method: 5, asrSchool: 'shafi', tz: 'Africa/Cairo' },
    { label: 'London', lat: 51.5072, lng: -0.1276, method: 15, asrSchool: 'shafi', tz: 'Europe/London' },
    { label: 'New York', lat: 40.7128, lng: -74.0060, method: 2, asrSchool: 'shafi', tz: 'America/New_York' },
    { label: 'Toronto', lat: 43.6532, lng: -79.3832, method: 2, asrSchool: 'shafi', tz: 'America/Toronto' },
    { label: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, method: 11, asrSchool: 'shafi', tz: 'Asia/Kuala_Lumpur' },
    { label: 'Tromso', lat: 69.6492, lng: 18.9553, method: 3, asrSchool: 'shafi', highLat: 'seventh', tz: 'Europe/Oslo' }
  ];

  const PRAYER_METHODS = [
    { id: 1, name: 'Islamic Foundation BD / Karachi (18°/18°)' },
    { id: 3, name: 'Muslim World League (MWL)' },
    { id: 4, name: 'Umm Al-Qura (Makkah)' },
    { id: 5, name: 'Egyptian General Authority' },
    { id: 2, name: 'ISNA (North America)' },
    { id: 15, name: 'Moonsighting Committee Worldwide' },
    { id: 13, name: 'Diyanet (Turkey)' },
    { id: 11, name: 'MUIS (Singapore)' },
    { id: 0,  name: 'Custom Angles (Fajr / Isha °)' }
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
      method: Number.isFinite(method) && method >= 0 ? Math.round(method) : prev.method,
      paused: typeof input.paused === 'boolean' ? input.paused : !!prev.paused,
      asrSchool: input.asrSchool === 'shafi' || input.asrSchool === 'hanafi' ? input.asrSchool : prev.asrSchool,
      highLat: ['middle','seventh','twilight'].indexOf(input.highLat) !== -1 ? input.highLat : prev.highLat,
      fajrAngle: Number.isFinite(Number(input.fajrAngle)) ? Math.max(10, Math.min(24, Number(input.fajrAngle))) : prev.fajrAngle,
      ishaAngle: Number.isFinite(Number(input.ishaAngle)) ? Math.max(10, Math.min(24, Number(input.ishaAngle))) : prev.ishaAngle,
      offsets: input.offsets ? _cleanOffsets(Object.assign({}, prev.offsets, input.offsets)) : prev.offsets,
      mosqueTimes: input.mosqueTimes ? Object.assign({}, prev.mosqueTimes, input.mosqueTimes) : prev.mosqueTimes
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
      toast(iqIcon(next.paused ? 'moon' : 'check'), next.paused ? tr('Rest Mode Active') + ' \u2014 ' + tr('Streak Protected') : 'Daily tracking active.');
    }
    return next.paused;
  }

  function applyPrayerCityPreset(idxStr) {
    const idx = parseInt(idxStr, 10);
    const city = PRAYER_CITY_PRESETS[idx];
    if (!city) return;
    updatePrayerSettings({
      lat: city.lat,
      lng: city.lng,
      label: city.label,
      method: city.method,
      asrSchool: city.asrSchool || 'hanafi',
      highLat: city.highLat || 'middle'
    });
    if (typeof toast === 'function') toast(iqIcon('map-pin'), `Prayer city: ${city.label}`);
  }

  function applyPrayerMethod(methodStr) {
    const m = parseInt(methodStr, 10);
    if (!Number.isFinite(m) || m < 0) return;
    updatePrayerSettings({ method: m });
    if (typeof toast === 'function') toast(iqIcon('clock'), 'Calculation method updated.');
  }

  function applyPrayerOffset(prayerKey, deltaOrValue, absolute) {
    const cur = getPrayerSettings();
    const prev = cur.offsets[prayerKey] || 0;
    const val = absolute ? Number(deltaOrValue) : (prev + Number(deltaOrValue));
    const patch = {};
    patch[prayerKey] = Math.max(-60, Math.min(60, Math.round(val || 0)));
    updatePrayerSettings({ offsets: patch });
  }

  function _renderNextPrayerPillHtml(cachedTimes) {
    const settings = getPrayerSettings();
    const nextInfo = cachedTimes ? computeNextPrayer(cachedTimes) : null;
    const bearing = Math.round(computeQiblaBearing(settings.lat, settings.lng));
    const pill = nextInfo
      ? `<button type="button" id="iqNextPrayerPill" class="iq-next-prayer-pill" onclick="App.activateTab('timer')">${safePrayerText(tr('Next'))}: <strong>${safePrayerText(tr(nextInfo.name))}</strong> &middot; <span class="iq-no-mirror">${safePrayerText(nfmt(nextInfo.timeLabel))}</span> <span class="iq-pill-eta">${safePrayerText(nfmt(nextInfo.shortRemaining))}</span></button>`
      : `<button type="button" id="iqNextPrayerPill" class="iq-next-prayer-pill" onclick="App.activateTab('timer')">${safePrayerText(tr('Prayer Times'))} &middot; ${safePrayerText(settings.label)} &rsaquo;</button>`;
    const qiblaBtn = `<button type="button" class="iq-qibla-mini-btn" onclick="App.activateTab('timer')" aria-label="Qibla ${bearing} degrees">${iqIcon('compass')} <span class="iq-tabular iq-no-mirror">${safePrayerText(nfmt(bearing))}&deg;</span></button>`;
    const pauseBtn = `<button type="button" class="iq-pause-btn${settings.paused ? ' active' : ''}" onclick="App.togglePrayerPause()" aria-pressed="${!!settings.paused}" title="Rest or travel grace pause (nothing personal is stored)">${safePrayerText(settings.paused ? tr('Rest Mode Active') : tr('Grace Mode'))}</button>`;
    return `<div class="iq-prayer-header-actions">${pill}${qiblaBtn}${pauseBtn}</div>`;
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
      let baseNm = p.name, xp = p.xp;
      if (f && p.id === 'dhuhr') { baseNm = p.fri.name; xp = p.fri.xp; }
      const nm = tr(baseNm);
      if (S.ab && S.ab.exp >= today()) xp *= 2;
      const capKey = p.id.charAt(0).toUpperCase() + p.id.slice(1);
      const cachedSlot = cached && cached[capKey];
      const liveTime = (cachedSlot && typeof cachedSlot.h === 'number') ? formatTime12(cachedSlot.h, cachedSlot.m) : p.time;
      const isNext = !!(nextInfo && !nextInfo.isTomorrow && nextInfo.name.toLowerCase() === p.id && !d);
      const cls = `card-item${d ? ' done' : ''}${isQada ? ' qada' : ''}${isNext ? ' iq-next-prayer-card' : ''}`;
      return `<div class="${cls}" tabindex="0" role="button" aria-pressed="${d ? 'true' : 'false'}" onclick="App.toggleP('${p.id}')">` +
        (isNext ? `<span class="iq-next-badge">${safePrayerText(tr('UP NEXT'))}</span>` : '') +
        `<div class="card-icon">${iqIcon(p.id)}</div>` +
        `<div class="card-name">${safePrayerText(nm)}</div>` +
        `<div class="card-sub iq-tabular iq-no-mirror">${safePrayerText(nfmt(liveTime))}</div>` +
        `<div class="card-xp">+${safePrayerText(nfmt(xp))} XP</div>` +
        (d ? `<div class="card-check" title="${isQada ? 'Made up (Qada)' : 'Completed'}">${isQada ? 'Q' : iqIcon('check')}</div>` : '') +
        `<button type="button" class="card-qada-btn${isQada ? ' active' : ''}" aria-label="Mark ${safePrayerText(nm)} made up (Qada)" title="${safePrayerText(tr('Qada'))}" onclick="event.stopPropagation();App.togglePrayerQada('${p.id}')">${isQada ? safePrayerText(tr('Qada')) : 'Q'}</button>` +
        `<button type="button" class="card-info-btn" aria-label="Details: ${safePrayerText(nm)}" onclick="event.stopPropagation();App.detail('${p.id}')">ℹ</button>` +
      `</div>`;
    }).join('');
    area.innerHTML = `<div class="prayer-header-row"><div class="section-title" style="margin:0;">${safePrayerText(tr('Daily Prayers'))}</div>${_renderNextPrayerPillHtml(cached)}</div><div class="card-grid">${cards}</div>`;
    if (!cached) {
      fetchPrayerTimes().then(times => {
        if (!times) return;
        if (getPrayerTimesFromCache()) renderPrayers();
      }).catch(() => {});
    }
  }

  let _compassListener = null;
  function toggleQiblaCompass() {
    var needle = document.getElementById('iqQiblaNeedle');
    var status = document.getElementById('iqQiblaSensorStatus');
    var st = getPrayerSettings();
    var target = computeQiblaBearing(st.lat, st.lng);
    if (_compassListener) {
      window.removeEventListener('deviceorientation', _compassListener);
      _compassListener = null;
      if (needle) needle.style.transform = 'rotate(' + target.toFixed(1) + 'deg)';
      if (status) status.textContent = 'Static map bearing active (enable device compass for live rotation).';
      return;
    }
    var attach = function() {
      _compassListener = function(ev) {
        var heading = ev.webkitCompassHeading != null ? ev.webkitCompassHeading : (ev.alpha != null ? (360 - ev.alpha) : null);
        if (heading == null) return;
        var delta = target - heading;
        if (needle) needle.style.transform = 'rotate(' + delta.toFixed(1) + 'deg)';
        if (status) status.textContent = 'Live sensor calibrated — figure-8 tilt improves accuracy.';
      };
      window.addEventListener('deviceorientation', _compassListener, true);
      if (status) status.textContent = 'Listening to compass sensor...';
    };
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(function(state) {
        if (state === 'granted') attach();
        else if (status) status.textContent = 'Compass permission declined — use bearing angle (' + Math.round(target) + '° ' + cardinalDir(target) + ') with a map.';
      }).catch(function() {
        if (status) status.textContent = 'Use bearing ' + Math.round(target) + '° ' + cardinalDir(target) + ' clockwise from True North.';
      });
    } else if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      attach();
    } else if (status) {
      status.textContent = 'No hardware compass detected — face ' + Math.round(target) + '° ' + cardinalDir(target) + ' clockwise from True North.';
    }
  }

  function renderPrayerTimes() {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('prayerTimesArea');
    if (!el) return;
    const icons = { Fajr: iqIcon('sunrise'), Sunrise: iqIcon('sun'), Dhuhr: iqIcon('sun'), Asr: iqIcon('cloud-sun'), Maghrib: iqIcon('sunset'), Isha: iqIcon('moon') };
    const descs = {
      Fajr: tr('Dawn'), Sunrise: tr('Sunrise'), Dhuhr: tr(isFri() ? 'Jumu\'ah / Noon' : 'Noon'), Asr: tr('Afternoon'), Maghrib: tr('Sunset'), Isha: tr('Night')
    };
    fetchPrayerTimes().then(times => {
      const settings = getPrayerSettings();
      const bearing = computeQiblaBearing(settings.lat, settings.lng);
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
        ? `<button class="iq-pt-gps-btn" type="button" onclick="useCurrentPrayerLocation()">${safePrayerText(tr('Use Device Location'))}</button>`
        : '';

      const customAnglesHtml = settings.method === 0
        ? `<div class="iq-pt-ctrl-group"><label class="iq-pt-label" for="iqFajrAngleInp">${safePrayerText(tr('Fajr Angle'))} (&deg;)</label><input id="iqFajrAngleInp" type="number" step="0.5" min="10" max="24" class="iq-pt-select" value="${settings.fajrAngle}" onchange="window.updatePrayerSettings({fajrAngle:this.value})"></div>` +
          `<div class="iq-pt-ctrl-group"><label class="iq-pt-label" for="iqIshaAngleInp">${safePrayerText(tr('Isha Angle'))} (&deg;)</label><input id="iqIshaAngleInp" type="number" step="0.5" min="10" max="24" class="iq-pt-select" value="${settings.ishaAngle}" onchange="window.updatePrayerSettings({ishaAngle:this.value})"></div>`
        : '';

      const controlsHtml = `<div class="iq-pt-controls">` +
        `<div class="iq-pt-ctrl-group"><label class="iq-pt-label" for="iqPrayerCitySelect">${safePrayerText(tr('City'))}</label><select id="iqPrayerCitySelect" class="iq-pt-select" onchange="window.applyPrayerCityPreset(this.value)">${customCityOpt}${cityOptions}</select></div>` +
        `<div class="iq-pt-ctrl-group"><label class="iq-pt-label" for="iqPrayerMethodSelect">${safePrayerText(tr('Method'))}</label><select id="iqPrayerMethodSelect" class="iq-pt-select" onchange="window.applyPrayerMethod(this.value)">${methodOptions}</select></div>` +
        customAnglesHtml +
        `<div class="iq-pt-ctrl-group"><label class="iq-pt-label" for="iqAsrSelect">${safePrayerText(tr('Asr Madhhab'))}</label><select id="iqAsrSelect" class="iq-pt-select" onchange="window.updatePrayerSettings({asrSchool:this.value})"><option value="hanafi"${settings.asrSchool==='hanafi'?' selected':''}>${safePrayerText(tr('Hanafi (2x shadow)'))}</option><option value="shafi"${settings.asrSchool==='shafi'?' selected':''}>${safePrayerText(tr("Standard (Shafi'i/Maliki/Hanbali)"))}</option></select></div>` +
        `<div class="iq-pt-ctrl-group"><label class="iq-pt-label" for="iqHighLatSelect">${safePrayerText(tr('High Latitude Rule'))}</label><select id="iqHighLatSelect" class="iq-pt-select" onchange="window.updatePrayerSettings({highLat:this.value})"><option value="middle"${settings.highLat==='middle'?' selected':''}>${safePrayerText(tr('Middle of Night'))}</option><option value="seventh"${settings.highLat==='seventh'?' selected':''}>${safePrayerText(tr('Seventh of Night'))}</option><option value="twilight"${settings.highLat==='twilight'?' selected':''}>${safePrayerText(tr('Twilight Angle'))}</option></select></div>` +
        `${locateButton}</div>`;

      if (!times) {
        el.innerHTML = controlsHtml + `<div style="text-align:center;color:var(--text2);padding:20px;">${safePrayerText(tr('Unable to compute prayer times for this coordinate. Please select a city preset above.'))}</div>`;
        return;
      }
      const nextInfo = computeNextPrayer(times);
      const nextPrayer = nextInfo && !nextInfo.isTomorrow ? nextInfo.name : null;
      const gridHtml = '<div class="prayer-times-grid">' + ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'].map(name => {
        const t = times[name];
        if (!t) return '';
        const isNext = name === nextPrayer;
        const offVal = (settings.offsets && settings.offsets[name.toLowerCase()]) || 0;
        const jam = times[name + 'Jamaat'];
        const dispName = (name === 'Dhuhr' && isFri()) ? tr('Jummah') : tr(name);
        return `<div class="pt-card${isNext ? ' next-prayer' : ''}">
          <div class="pt-icon">${icons[name]}</div>
          <div class="pt-name">${safePrayerText(dispName)}</div>
          <div class="pt-time"><bdi dir="ltr">${safePrayerText(nfmt(formatTime12(t.h, t.m)))}</bdi></div>
          ${jam ? `<div class="pt-sub">${safePrayerText(tr("Jama'at"))}: <bdi dir="ltr">${safePrayerText(nfmt(formatTime12(jam.h, jam.m)))}</bdi></div>` : `<div class="pt-sub">${safePrayerText(descs[name])}</div>`}
          <div style="display:flex;gap:4px;justify-content:center;align-items:center;margin-top:6px;">
            <button type="button" class="iq-btn-secondary" style="min-height:44px;min-width:44px;padding:4px 8px;font-size:0.74rem;border-radius:10px;" aria-label="Subtract 1 minute offset for ${name}" onclick="window.applyPrayerOffset('${name.toLowerCase()}',-1,false)"><bdi dir="ltr">&minus;1m</bdi></button>
            <span class="iq-tabular" style="font-size:0.75rem;color:var(--text2);min-width:34px;text-align:center;"><bdi dir="ltr">${offVal >= 0 ? '+' : ''}${nfmt(offVal)}m</bdi></span>
            <button type="button" class="iq-btn-secondary" style="min-height:44px;min-width:44px;padding:4px 8px;font-size:0.74rem;border-radius:10px;" aria-label="Add 1 minute offset for ${name}" onclick="window.applyPrayerOffset('${name.toLowerCase()}',1,false)"><bdi dir="ltr">+1m</bdi></button>
          </div>
        </div>`;
      }).join('') + '</div>';

      const bearingDeg = bearing.toFixed(1);
      const qiblaHtml = `<div class="content-card iq-qibla-card" style="margin-top:16px;text-align:center;align-items:center;">
        <div class="iq-qibla-head">${iqIcon('compass')} <span>${safePrayerText(tr('Qibla Direction'))} &middot; ${safePrayerText(settings.label)}</span></div>
        <div class="iq-qibla-dial-wrap iq-no-mirror" aria-label="Qibla compass bearing ${bearingDeg} degrees ${safePrayerText(cardinalDir(bearing))}">
          <span class="iq-qibla-cardinal iq-qc-n" aria-hidden="true">N</span>
          <span class="iq-qibla-cardinal iq-qc-e" aria-hidden="true">E</span>
          <span class="iq-qibla-cardinal iq-qc-s" aria-hidden="true">S</span>
          <span class="iq-qibla-cardinal iq-qc-w" aria-hidden="true">W</span>
          <svg class="iq-qibla-dial-svg" viewBox="0 0 220 220" width="184" height="184" aria-hidden="true">
            <circle cx="110" cy="110" r="98" fill="none" stroke="var(--border)" stroke-width="1.5"/>
            <circle cx="110" cy="110" r="82" fill="var(--surface-subtle)" stroke="var(--accent-soft)" stroke-width="1.2" stroke-dasharray="3 4"/>
            <circle cx="110" cy="110" r="56" fill="none" stroke="var(--border-light)" stroke-width="1"/>
            <g stroke="var(--text3)" stroke-width="1.5" stroke-linecap="round">
              <line x1="110" y1="12" x2="110" y2="24" stroke="var(--accent-dark)" stroke-width="2.5"/>
              <line x1="208" y1="110" x2="196" y2="110"/>
              <line x1="110" y1="208" x2="110" y2="196"/>
              <line x1="12" y1="110" x2="24" y2="110"/>
              <line x1="179" y1="41" x2="172" y2="48"/>
              <line x1="179" y1="179" x2="172" y2="172"/>
              <line x1="41" y1="179" x2="48" y2="172"/>
              <line x1="41" y1="41" x2="48" y2="48"/>
            </g>
          </svg>
          <svg id="iqQiblaNeedle" class="iq-qibla-needle-svg" viewBox="0 0 220 220" width="184" height="184" style="transform:rotate(${bearingDeg}deg);transition:transform 0.25s ease;" aria-hidden="true">
            <polygon points="110,28 119,104 110,96 101,104" fill="var(--accent)" stroke="var(--accent-dark)" stroke-width="1.5" stroke-linejoin="round"/>
            <rect x="103" y="34" width="14" height="14" rx="2.5" fill="var(--accent-dark)" stroke="var(--gold)" stroke-width="1.8"/>
            <line x1="103" y1="39" x2="117" y2="39" stroke="var(--gold)" stroke-width="1.6"/>
            <polygon points="110,188 116,116 110,122 104,116" fill="var(--border)" stroke="var(--text3)" stroke-width="1"/>
            <circle cx="110" cy="110" r="7" fill="var(--surface)" stroke="var(--accent-dark)" stroke-width="2.5"/>
          </svg>
        </div>
        <div class="iq-tabular iq-qibla-bearing"><bdi dir="ltr">${nfmt(bearingDeg)}&deg; ${safePrayerText(cardinalDir(bearing))}</bdi></div>
        <div id="iqQiblaSensorStatus" style="font-size:0.78rem;color:var(--text2);margin:6px 0;text-align:center;">${safePrayerText(tr('Measured clockwise from True North (offline great-circle bearing).'))}</div>
        <button type="button" class="iq-pill-btn" onclick="window.toggleQiblaCompass()">${safePrayerText(tr('Enable Live Compass'))}</button>
      </div>`;

      el.innerHTML = controlsHtml + gridHtml + qiblaHtml;
    });
  }

  function useCurrentPrayerLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (typeof toast === 'function') toast(iqIcon('map-pin'), 'Location is unavailable — choose a city preset.');
      return;
    }
    navigator.geolocation.getCurrentPosition(function(position) {
      const coords = position.coords;
      updatePrayerSettings({
        lat: Number(coords.latitude.toFixed(2)), // Approximate coordinates rounded for privacy
        lng: Number(coords.longitude.toFixed(2)),
        label: 'Approximate Location',
        method: getPrayerSettings().method
      });
      if (typeof toast === 'function') toast(iqIcon('map-pin'), 'Prayer times computed offline for your area.');
    }, function() {
      if (typeof toast === 'function') toast(iqIcon('map-pin-off'), 'Location permission declined — select a city manually.');
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
      if (te) te.innerText = nfmt(info.countdownText);
      if (pna) pna.innerHTML = `${safePrayerText(tr('Until'))} ${safePrayerText(tr(info.name))} (<bdi dir="ltr">${safePrayerText(nfmt(info.timeLabel))}</bdi>)`;
    }
    fetchPrayerTimes().then(times => {
      if (!times) return;
      tick(times);
      window.timerInt = setInterval(() => tick(times), 1000);
    });
  }

  // Voluntary & Deeds renderers preserved cleanly
  function renderVol() {
    const volArea = document.getElementById('volArea');
    const openStates = volArea ? Array.from(volArea.querySelectorAll('details.cat-details')).map(d => d.open) : [];
    const l = tlog().v || {};
    const byCat = {};
    VOLUNTARY.forEach(v => { if (!v.name || v.name.trim()==='') return; const cat = v.cat || 'General'; if (!byCat[cat]) byCat[cat]=[]; byCat[cat].push(v); });
    const catIcons = { 'Night Prayers': iqIcon('moon'), 'Occasional Prayers': iqIcon('hand-heart'), 'Other Daily Prayers': iqIcon('beads'), 'Special Events': iqIcon('sparkles'), 'General': iqIcon('mosque') };
    let html = '', catIdx = 0;
    for (const cat in byCat) {
      const catIcon = catIcons[cat] || iqIcon('mosque');
      const totalInCat = byCat[cat].length;
      const completedInCat = byCat[cat].filter(v => !!l[v.id]).length;
      const isOpen = catIdx < openStates.length ? openStates[catIdx] : false;
      html += `<details class="cat-details"${isOpen ? ' open' : ''}><summary><div style="display:flex;justify-content:space-between;align-items:center;flex:1;"><span>${catIcon} ${safePrayerText(cat)}</span><span class="iq-cat-badge">${nfmt(completedInCat)} / ${nfmt(totalInCat)}</span></div></summary><div style="padding:8px 4px;"><div class="card-grid">`;
      html += byCat[cat].map(v => { const d=!!l[v.id]; let xp=v.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; return `<div class="card-item${d?' done':''}" tabindex="0" role="button" onclick="App.toggleV('${v.id}')"><div class="card-icon">${iqIcon(v.icon || v.id)}</div><div class="card-name">${safePrayerText(v.name)}</div><div class="card-xp">+${nfmt(xp)} XP</div>${d?'<div class="card-check">' + iqIcon('check') + '</div>':''}<div class="card-info-btn" role="button" tabindex="0" aria-label="Details: ${safePrayerText(v.name)}" onclick="event.stopPropagation();App.detail('${v.id}')">${iqIcon('info')}</div></div>`; }).join('');
      html += '</div></div></details>';
      catIdx++;
    }
    if (volArea) volArea.innerHTML = html;
  }

  function renderDeeds() {
    const deedArea = document.getElementById('deedArea');
    if (!deedArea) return;
    const openStates = Array.from(deedArea.querySelectorAll('details.cat-details')).map(d => d.open);
    const CAT_MAP = {
      'Ibadah & Spirituality':'mosque|Ibadah & Spirituality','Faith, Intention & Worship':'mosque|Ibadah & Spirituality',"Qur'an, Dhikr & Dua":'mosque|Ibadah & Spirituality',
      'Charity & Social':'wallet|Charity & Giving','Charity & Helping Others':'wallet|Charity & Giving','Neighbors & Community':'wallet|Charity & Giving','Animals & Environment':'wallet|Charity & Giving','Unique Small Deeds':'wallet|Charity & Giving',
      'Character & Ethics':'gem|Character & Ethics','Character & Self-Control':'gem|Character & Ethics','Avoiding Harm & Positive Intentions':'gem|Character & Ethics',
      'Knowledge & Learning':'book-open|Knowledge & Learning','Knowledge & Teaching':'book-open|Knowledge & Learning',
      'Family & Relatives':'users|Family & Relations','Parents & Family':'users|Family & Relations',
      'Daily Sunnahs':'sun|Daily Sunnahs','Work, Money & Daily Life':'sun|Daily Sunnahs','General':'mosque|General'
    };
    const CAT_ORDER = ['mosque|Ibadah & Spirituality','wallet|Charity & Giving','gem|Character & Ethics','book-open|Knowledge & Learning','users|Family & Relations','sun|Daily Sunnahs','mosque|General'];
    const l = tlog().d || {}, byCat = {};
    CAT_ORDER.forEach(c => { byCat[c] = []; });
    DEEDS.forEach(d => { const norm = CAT_MAP[d.cat || 'General'] || 'mosque|General'; byCat[norm].push(d); });
    let html = '', catIdx = 0;
    for (const cat of CAT_ORDER) {
      const items = byCat[cat] || [];
      if (!items.length) { catIdx++; continue; }
      const parts = cat.split('|');
      const disp = iqIcon(parts[0]) + ' ' + parts[1];
      const doneCnt = items.filter(d => !!l[d.id]).length;
      const isOpen = catIdx < openStates.length ? openStates[catIdx] : false;
      html += `<details class="cat-details"${isOpen ? ' open' : ''}><summary><div style="display:flex;justify-content:space-between;align-items:center;flex:1;"><span>${disp}</span><span class="iq-cat-badge">${nfmt(doneCnt)} / ${nfmt(items.length)}</span></div></summary><div style="padding:8px 4px;"><div class="card-grid">`;
      html += items.map(d => { const done=!!l[d.id]; const tot=S.td[d.id]||0; let xp=d.xp; if(S.ab&&S.ab.exp>=today()) xp*=2; return `<div class="card-item${done?' done':''}" tabindex="0" role="button" onclick="App.toggleD('${d.id}')"><div class="card-icon">${iqIcon(d.icon || d.id)}</div><div class="card-name">${safePrayerText(d.name)}</div><div class="card-xp">+${nfmt(xp)} XP</div>${done?'<div class="card-check">' + iqIcon('check') + '</div>':''}${tot?`<div class="card-sub">${nfmt(tot)}&times;</div>`:''}<div class="card-info-btn" role="button" tabindex="0" aria-label="Details: ${safePrayerText(d.name)}" onclick="event.stopPropagation();App.tip('${d.id}')">${iqIcon('info')}</div></div>`; }).join('');
      html += '</div></div></details>';
      catIdx++;
    }
    deedArea.innerHTML = html;
  }

  window.renderPrayers = renderPrayers;
  window.renderVol = renderVol;
  window.renderDeeds = renderDeeds;
  window.fetchPrayerTimes = fetchPrayerTimes;
  window.computeOfflinePrayerTimes = computeOfflinePrayerTimes;
  window.computeQiblaBearing = computeQiblaBearing;
  window.toggleQiblaCompass = toggleQiblaCompass;
  window.getPrayerTimesFromCache = getPrayerTimesFromCache;
  window.getPrayerSettings = getPrayerSettings;
  window.computeNextPrayer = computeNextPrayer;
  window.updatePrayerSettings = updatePrayerSettings;
  window.togglePrayerPause = togglePrayerPause;
  window.applyPrayerCityPreset = applyPrayerCityPreset;
  window.applyPrayerMethod = applyPrayerMethod;
  window.applyPrayerOffset = applyPrayerOffset;
  window.renderPrayerTimes = renderPrayerTimes;
  window.renderTimer = renderTimer;
  window.stopPrayerTimer = function() {
    if (window.timerInt) { clearInterval(window.timerInt); window.timerInt = null; }
  };
  window.useCurrentPrayerLocation = useCurrentPrayerLocation;
})();
