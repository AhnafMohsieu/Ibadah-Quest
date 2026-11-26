// features/masjid-checkins.js — Offline-first Masjid Check-ins map, calendar & history
(function() {
  var MAP_REGIONS = [
    { id: 'north_america', label: 'North America', x: 142, y: 110 },
    { id: 'europe', label: 'Europe', x: 304, y: 84 },
    { id: 'west_africa', label: 'West Africa', x: 278, y: 164 },
    { id: 'mena', label: 'MENA & Haramain', x: 348, y: 132 },
    { id: 'east_africa', label: 'East Africa', x: 356, y: 186 },
    { id: 'south_asia', label: 'South Asia', x: 432, y: 136 },
    { id: 'se_asia', label: 'Southeast Asia', x: 492, y: 174 },
    { id: 'oceania', label: 'Oceania', x: 526, y: 234 }
  ];

  var _activeSubTab = 'map';
  var _selectedRegion = 'south_asia';

  function esc(val) {
    var s = String(val == null ? '' : val);
    return (typeof window !== 'undefined' && typeof window.escapeHTML === 'function')
      ? window.escapeHTML(s)
      : s;
  }

  function todayStr() {
    if (typeof today === 'function') return today();
    if (typeof window !== 'undefined' && typeof window.today === 'function') return window.today();
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function ensureList() {
    if (typeof S === 'undefined' || !S) return [];
    if (!Array.isArray(S.masjidCheckIns)) S.masjidCheckIns = [];
    return S.masjidCheckIns;
  }

  function computeMasjidStats() {
    var list = ensureList();
    var tk = todayStr();
    var byRegion = {};
    var unique = {};
    var todayCount = 0;
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (!item || typeof item !== 'object') continue;
      if (item.date === tk) todayCount++;
      var r = item.region || 'mena';
      byRegion[r] = (byRegion[r] || 0) + 1;
      var key = String(item.name || '').trim().toLowerCase();
      if (key) unique[key] = true;
    }
    return {
      total: list.length,
      todayCount: todayCount,
      uniqueMosques: Object.keys(unique).length,
      byRegion: byRegion
    };
  }

  function logMasjidCheckIn(input) {
    var opts = input && typeof input === 'object' ? input : {};
    var name = String(opts.name == null ? '' : opts.name).trim().slice(0, 80);
    if (!name) {
      if (typeof toast === 'function') toast(iqIcon('mosque'), 'Please enter a mosque name.', false, 2200);
      return { ok: false, error: 'Mosque name is required' };
    }
    var city = String(opts.city == null ? '' : opts.city).trim().slice(0, 60) || 'Local Masjid';
    var region = MAP_REGIONS.some(function(r) { return r.id === opts.region; }) ? opts.region : 'south_asia';
    var validPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jumuah', 'other'];
    var prayer = validPrayers.indexOf(opts.prayer) > -1 ? opts.prayer : 'fajr';
    var tk = todayStr();

    var list = ensureList();
    var entry = {
      id: 'mc_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: name,
      city: city,
      region: region,
      prayer: prayer,
      date: tk,
      ts: Date.now()
    };
    list.unshift(entry);
    if (list.length > 500) list.length = 500;
    _selectedRegion = region;

    if (typeof grantDailyXp === 'function') {
      grantDailyXp(15, 'masjid|' + tk + '|' + prayer);
    } else if (typeof window !== 'undefined' && typeof window.grantDailyXp === 'function') {
      window.grantDailyXp(15, 'masjid|' + tk + '|' + prayer);
    }
    if (typeof saveState === 'function') saveState();
    if (typeof window !== 'undefined' && typeof window.iqHaptic === 'function') window.iqHaptic(12);
    if (typeof toast === 'function') toast(iqIcon('mosque'), 'Checked in at ' + name + '!', false, 2400);
    if (typeof renderTopBar === 'function') renderTopBar();
    if (typeof renderLv === 'function') renderLv();
    if (typeof window !== 'undefined' && typeof window.renderIqFeed === 'function') window.renderIqFeed();
    renderMasjidSheet(_activeSubTab);
    return { ok: true, entry: entry };
  }

  function submitMasjidForm() {
    if (typeof document === 'undefined') return;
    var nameEl = document.getElementById('iqMasjidNameInput');
    var cityEl = document.getElementById('iqMasjidCityInput');
    var regEl = document.getElementById('iqMasjidRegionInput');
    var prayEl = document.getElementById('iqMasjidPrayerInput');
    logMasjidCheckIn({
      name: nameEl ? nameEl.value : '',
      city: cityEl ? cityEl.value : '',
      region: regEl ? regEl.value : _selectedRegion,
      prayer: prayEl ? prayEl.value : 'fajr'
    });
  }

  function renderWorldMapSvg(stats) {
    var pins = MAP_REGIONS.map(function(reg) {
      var cnt = (stats.byRegion && stats.byRegion[reg.id]) || 0;
      var active = cnt > 0 || reg.id === _selectedRegion;
      var r = cnt > 0 ? Math.min(13, 8 + cnt) : 6;
      return '<g class="iq-map-pin-grp" onclick="window.selectMasjidRegion(\'' + reg.id + '\')" style="cursor:pointer;">' +
        (cnt > 0 ? '<circle cx="' + reg.x + '" cy="' + reg.y + '" r="' + (r + 5) + '" fill="rgba(20,184,166,0.22)"/>' : '') +
        '<circle cx="' + reg.x + '" cy="' + reg.y + '" r="' + r + '" fill="' + (active ? '#0b8a82' : '#94b8b4') + '" stroke="#ffffff" stroke-width="2"/>' +
        (cnt > 0 ? '<text x="' + reg.x + '" y="' + (reg.y + 3.5) + '" text-anchor="middle" font-size="9" font-weight="700" fill="#ffffff">' + cnt + '</text>' : '') +
        '<title>' + esc(reg.label) + ': ' + cnt + ' check-in(s)</title>' +
      '</g>';
    }).join('');

    return '<div class="iq-masjid-map-card">' +
      '<svg class="iq-masjid-map-svg" viewBox="0 0 600 300" role="img" aria-label="Offline Masjid Check-ins map">' +
        '<rect width="600" height="300" rx="16" fill="var(--bg)" />' +
        '<g fill="var(--map-land, #cbe7e1)" stroke="var(--card-bg)" stroke-width="1">' +
          '<path d="M55,75 Q110,48 185,68 Q210,95 170,138 Q135,152 105,132 Q70,118 55,75 Z"/>' +
          '<path d="M148,162 Q185,158 198,205 Q182,258 152,265 Q134,225 148,162 Z"/>' +
          '<path d="M262,58 Q332,48 360,78 Q340,112 278,108 Q256,88 262,58 Z"/>' +
          '<path d="M255,120 Q328,116 365,160 Q355,232 315,244 Q282,222 272,175 Q244,155 255,120 Z"/>' +
          '<path d="M348,66 Q455,54 522,88 Q535,148 475,165 Q412,170 368,136 Q336,108 348,66 Z"/>' +
          '<path d="M466,162 Q512,160 524,188 Q490,202 466,184 Z"/>' +
          '<path d="M482,208 Q544,204 558,242 Q522,262 486,244 Z"/>' +
        '</g>' +
        pins +
      '</svg>' +
      '<div class="iq-map-legend">' +
        '<span>Selected region: <strong>' + esc((MAP_REGIONS.find(function(r) { return r.id === _selectedRegion; }) || MAP_REGIONS[0]).label) + '</strong></span>' +
        '<span>' + stats.total + ' total · ' + stats.uniqueMosques + ' mosque(s)</span>' +
      '</div>' +
    '</div>';
  }

  function renderMasjidCalendar(list) {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var dim = new Date(year, month + 1, 0).getDate();
    var prefix = year + '-' + String(month + 1).padStart(2, '0') + '-';
    var counts = {};
    for (var i = 0; i < list.length; i++) {
      if (list[i] && typeof list[i].date === 'string' && list[i].date.indexOf(prefix) === 0) {
        counts[list[i].date] = (counts[list[i].date] || 0) + 1;
      }
    }
    var cells = '';
    for (var day = 1; day <= dim; day++) {
      var dk = prefix + String(day).padStart(2, '0');
      var c = counts[dk] || 0;
      cells += '<div class="iq-mc-day' + (c > 0 ? ' visited' : '') + '">' + day + (c > 0 ? '<span>' + c + '</span>' : '') + '</div>';
    }
    return '<div class="iq-mc-cal-card"><h4>' + d.toLocaleString('en', { month: 'long', year: 'numeric' }) + '</h4><div class="iq-mc-cal-grid">' + cells + '</div></div>';
  }

  function renderMasjidList(list) {
    if (!list.length) {
      return '<div class="iq-empty-card iq-empty-illustrated">' +
        '<svg class="iq-empty-svg" viewBox="0 0 80 64" width="68" height="54" fill="none" aria-hidden="true">' +
          '<path d="M16 54V30c0-11 12-18 24-24 12 6 24 13 24 24v24" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>' +
          '<path d="M28 54V38a12 12 0 0 1 24 0v16" fill="var(--accent-bg)" stroke="var(--accent)" stroke-width="1.8"/>' +
          '<path d="M40 2v4M37 14a4 4 0 0 0 6 0" stroke="var(--gold)" stroke-width="2" stroke-linecap="round"/>' +
          '<line x1="10" y1="54" x2="70" y2="54" stroke="var(--accent-border)" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>' +
        '<div><strong>No masjid visits logged yet</strong><span>Tap a region pin above or record your next congregational prayer.</span></div>' +
      '</div>';
    }
    return '<div class="iq-mc-list">' + list.slice(0, 30).map(function(item) {
      var prayerLabel = String(item.prayer || 'prayer').toUpperCase();
      return '<div class="iq-challenge-card iq-mc-row">' +
        '<div class="iq-ch-icon teal">' + (typeof iqIcon === 'function' ? iqIcon('mosque') : '🕌') + '</div>' +
        '<div class="iq-ch-body">' +
          '<div class="iq-ch-title">' + esc(item.name) + '</div>' +
          '<div class="iq-ch-sub">' + esc(item.city || 'Local') + ' · ' + esc(prayerLabel) + ' · ' + esc(item.date || '') + '</div>' +
        '</div>' +
        '<span class="iq-ch-pill">Visited</span>' +
      '</div>';
    }).join('') + '</div>';
  }

  function renderMasjidSheet(subTab) {
    if (subTab) _activeSubTab = subTab;
    if (typeof document === 'undefined') return;
    var bodyEl = document.getElementById('iqMasjidBody');
    if (!bodyEl) return;
    var list = ensureList();
    var stats = computeMasjidStats();

    var regionOptions = MAP_REGIONS.map(function(r) {
      return '<option value="' + r.id + '"' + (r.id === _selectedRegion ? ' selected' : '') + '>' + esc(r.label) + '</option>';
    }).join('');

    var tabsHtml = '<div class="iq-mc-subtabs">' +
      '<button type="button" class="iq-mc-tab' + (_activeSubTab === 'map' ? ' active' : '') + '" onclick="window.renderMasjidSheet(\'map\')">Map</button>' +
      '<button type="button" class="iq-mc-tab' + (_activeSubTab === 'calendar' ? ' active' : '') + '" onclick="window.renderMasjidSheet(\'calendar\')">Calendar</button>' +
      '<button type="button" class="iq-mc-tab' + (_activeSubTab === 'history' ? ' active' : '') + '" onclick="window.renderMasjidSheet(\'history\')">History</button>' +
    '</div>';

    var formHtml = '<div class="iq-mc-form-card">' +
      '<div class="iq-mc-form-title">Quick Masjid Check-In <span class="iq-xp-chip">+15 XP</span></div>' +
      '<div class="iq-mc-form-grid">' +
        '<input id="iqMasjidNameInput" type="text" placeholder="Mosque name (e.g. Masjid Al-Noor)" maxlength="80" aria-label="Mosque name">' +
        '<input id="iqMasjidCityInput" type="text" placeholder="City / Neighborhood" maxlength="60" aria-label="City">' +
        '<select id="iqMasjidRegionInput" aria-label="Region">' + regionOptions + '</select>' +
        '<select id="iqMasjidPrayerInput" aria-label="Prayer">' +
          '<option value="fajr">Fajr</option><option value="dhuhr">Dhuhr</option><option value="asr">Asr</option>' +
          '<option value="maghrib">Maghrib</option><option value="isha">Isha</option><option value="jumuah">Jumuah</option>' +
        '</select>' +
      '</div>' +
      '<button type="button" class="iq-gold-btn" onclick="window.submitMasjidForm()">Check In Now</button>' +
    '</div>';

    var viewHtml = _activeSubTab === 'calendar'
      ? renderMasjidCalendar(list)
      : (_activeSubTab === 'history' ? '' : renderWorldMapSvg(stats));

    var topSection = viewHtml
      ? '<div class="iq-mc-workspace">' + viewHtml + formHtml + '</div>'
      : formHtml;

    bodyEl.innerHTML = tabsHtml + topSection + '<div class="iq-section-label">Check-in History</div>' + renderMasjidList(list);
  }

  function selectMasjidRegion(regionId) {
    _selectedRegion = regionId;
    renderMasjidSheet(_activeSubTab);
  }

  function openMasjidCheckins(subTab) {
    var a11y = typeof window !== 'undefined' ? window.iqOverlayA11y : null;
    if (a11y && a11y.captureTrigger) a11y.captureTrigger();
    if (a11y && a11y.setTransitioning) a11y.setTransitioning(true);
    try {
      if (typeof window !== 'undefined' && typeof window.closeActiveSheet === 'function') {
        window.closeActiveSheet();
      }
    } finally {
      if (a11y && a11y.setTransitioning) a11y.setTransitioning(false);
    }
    _activeSubTab = subTab || 'map';
    renderMasjidSheet(_activeSubTab);
    if (typeof document === 'undefined') return;
    var sheet = document.getElementById('iqMasjidSheet');
    if (sheet) {
      if (a11y && a11y.setOverlayState) {
        a11y.setOverlayState(sheet, true);
      } else {
        sheet.classList.add('open');
        sheet.setAttribute('aria-hidden', 'false');
        sheet.inert = false;
      }
      if (a11y && a11y.focusInside) a11y.focusInside(sheet);
    }
    if (document.body) document.body.classList.add('iq-sheet-open');
  }

  function closeMasjidCheckins() {
    if (typeof document === 'undefined') return;
    var a11y = typeof window !== 'undefined' ? window.iqOverlayA11y : null;
    var sheet = document.getElementById('iqMasjidSheet');
    if (sheet) {
      if (a11y && a11y.setOverlayState) {
        a11y.setOverlayState(sheet, false);
      } else {
        sheet.classList.remove('open');
        sheet.setAttribute('aria-hidden', 'true');
        sheet.inert = true;
      }
    }
    if (document.body) document.body.classList.remove('iq-sheet-open');
    if (a11y && a11y.restoreTrigger) a11y.restoreTrigger();
  }

  window.MAP_REGIONS = MAP_REGIONS;
  window.computeMasjidStats = computeMasjidStats;
  window.logMasjidCheckIn = logMasjidCheckIn;
  window.submitMasjidForm = submitMasjidForm;
  window.selectMasjidRegion = selectMasjidRegion;
  window.renderMasjidSheet = renderMasjidSheet;
  window.openMasjidCheckins = openMasjidCheckins;
  window.closeMasjidCheckins = closeMasjidCheckins;
})();
