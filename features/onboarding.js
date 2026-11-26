/* features/onboarding.js — 5-step skippable onboarding (<60s to first worship act)
 * Steps: 1) Language -> 2) Goals & Comfort -> 3) City/Asr/Location -> 4) Reminders Opt-in -> 5) First Act
 */
(function() {
  var TOTAL_STEPS = 5;

  function _tr(k) {
    return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(k) : k;
  }

  function _esc(v) {
    return (typeof window !== 'undefined' && typeof window.escapeHTML === 'function') ? window.escapeHTML(String(v == null ? '' : v)) : String(v == null ? '' : v);
  }

  function isOnboardingComplete() {
    return !!(typeof S !== 'undefined' && S && S.onboarding && S.onboarding.complete === true);
  }

  function _pickOnboardingLang(lang) {
    if (typeof window.iqSetLang === 'function') window.iqSetLang(lang);
    if (lang === 'bn' && typeof window.updatePrayerSettings === 'function') {
      window.updatePrayerSettings({ lat: 23.8103, lng: 90.4125, label: 'Dhaka', method: 1, asrSchool: 'hanafi' });
    } else if (lang === 'ar' && typeof window.updatePrayerSettings === 'function') {
      window.updatePrayerSettings({ lat: 21.4225, lng: 39.8262, label: 'Makkah', method: 4, asrSchool: 'shafi' });
    }
    renderOnboardingStep();
  }

  function _setExperienceLevel(lvl) {
    if (typeof S !== 'undefined' && S) {
      if (!S.onboarding) S.onboarding = {};
      S.onboarding.level = lvl;
      if (typeof saveState === 'function') saveState();
    }
    renderOnboardingStep();
  }

  function _firstWorshipQuickStep(type) {
    if (type === 'prayer' && typeof window.toggleP === 'function') window.toggleP('fajr');
    else if (type === 'dhikr' && typeof window.tapDhikr === 'function') { window.tapDhikr(); window.tapDhikr(); window.tapDhikr(); }
    completeOnboarding();
  }

  function _stepContent(st) {
    var curLang = (typeof I18N !== 'undefined' && I18N.lang) || 'en';
    var lvl = (S && S.onboarding && S.onboarding.level) || 'beginner';
    var ps = (typeof window.getPrayerSettings === 'function') ? window.getPrayerSettings() : { label: 'Dhaka', method: 1, asrSchool: 'hanafi' };

    if (st === 0) {
      return {
        icon: 'globe',
        title: _tr('Choose Your Language'),
        body: '<p style="margin-bottom:12px;">Switch anytime in Profile. No account required — your worship data stays private on this device.</p>' +
          '<div class="iq-onb-choice-grid">' +
            '<button type="button" class="iq-onb-choice' + (curLang === 'bn' ? ' active' : '') + '" onclick="window._onbPickLang(\'bn\')"><strong>\u09AC\u09BE\u0982\u09B2\u09BE</strong><small>Bangla \u00B7 \u09E6\u09E7\u09E8\u09E9</small></button>' +
            '<button type="button" class="iq-onb-choice' + (curLang === 'en' ? ' active' : '') + '" onclick="window._onbPickLang(\'en\')"><strong>English</strong><small>LTR \u00B7 0123</small></button>' +
            '<button type="button" class="iq-onb-choice' + (curLang === 'ar' ? ' active' : '') + '" onclick="window._onbPickLang(\'ar\')"><strong>\u0627\u0644\u0639\u0631\u0628\u064A\u0629</strong><small>RTL \u00B7 \u0660\u0661\u0662\u0663</small></button>' +
          '</div>'
      };
    }

    if (st === 1) {
      return {
        icon: 'compass',
        title: _tr('Welcome to Ibadah Quest'),
        body: '<p style="margin-bottom:10px;">Where would you like to start? Everything stays gentle — never guilt-based.</p>' +
          '<div class="iq-onb-choice-grid">' +
            '<button type="button" class="iq-onb-choice' + (lvl === 'beginner' ? ' active' : '') + '" onclick="window._onbSetLevel(\'beginner\')"><strong>Building Daily Rhythm</strong><small>Guided steps &amp; beginner-friendly reminders</small></button>' +
            '<button type="button" class="iq-onb-choice' + (lvl === 'consistent' ? ' active' : '') + '" onclick="window._onbSetLevel(\'consistent\')"><strong>Deepening Consistency</strong><small>Prayer focus, Khatam plan &amp; Dhikr presets</small></button>' +
            '<button type="button" class="iq-onb-choice' + (lvl === 'returning' ? ' active' : '') + '" onclick="window._onbSetLevel(\'returning\')"><strong>Fresh Start After a Break</strong><small>Calm restart with Rest / Grace protection</small></button>' +
          '</div>'
      };
    }

    if (st === 2) {
      return {
        icon: 'map-pin',
        title: _tr('Set Your Location & Prayer Method'),
        body: '<p style="margin-bottom:10px;">Prayer times work <strong>100% offline</strong>. Choose a preset city or share approximate coordinates — never uploaded anywhere.</p>' +
          '<div style="display:flex;flex-direction:column;gap:8px;text-align:start;margin-bottom:10px;">' +
            '<label style="font-size:0.82rem;color:var(--text2);">City Preset' +
              '<select class="iq-pt-select" style="width:100%;margin-top:4px;" onchange="window.applyPrayerCityPreset && window.applyPrayerCityPreset(this.value)">' +
                '<option value="0"' + (ps.label === 'Dhaka' ? ' selected' : '') + '>Dhaka (Islamic Foundation / Hanafi)</option>' +
                '<option value="1"' + (ps.label === 'Chattogram' ? ' selected' : '') + '>Chattogram</option>' +
                '<option value="3"' + (ps.label === 'Makkah' ? ' selected' : '') + '>Makkah (Umm Al-Qura)</option>' +
                '<option value="7"' + (ps.label === 'London' ? ' selected' : '') + '>London (Moonsighting)</option>' +
                '<option value="8"' + (ps.label === 'New York' ? ' selected' : '') + '>New York (ISNA)</option>' +
              '</select>' +
            '</label>' +
            '<label style="font-size:0.82rem;color:var(--text2);">Asr School' +
              '<select class="iq-pt-select" style="width:100%;margin-top:4px;" onchange="window.updatePrayerSettings && window.updatePrayerSettings({asrSchool:this.value})">' +
                '<option value="hanafi"' + (ps.asrSchool === 'hanafi' ? ' selected' : '') + '>Hanafi (2x shadow)</option>' +
                '<option value="shafi"' + (ps.asrSchool === 'shafi' ? ' selected' : '') + '>Standard (Shafi\'i / Maliki / Hanbali)</option>' +
              '</select>' +
            '</label>' +
            '<button type="button" class="iq-pill-btn" onclick="window.useCurrentPrayerLocation && window.useCurrentPrayerLocation()">Use Approximate Location</button>' +
          '</div>'
      };
    }

    if (st === 3) {
      return {
        icon: 'bell',
        title: _tr('Gentle Reminders'),
        body: '<p style="margin-bottom:12px;">Receive quiet alerts when prayer time enters, with quiet night hours built in and zero nagging messages.</p>' +
          '<button type="button" class="iq-pill-btn" style="margin-bottom:8px;" onclick="window.App && window.App.toggleNotifications()">' + (S && S.notificationsEnabled ? 'Reminders Enabled \u2713' : 'Enable Prayer Reminders') + '</button>' +
          '<div style="font-size:0.78rem;color:var(--text2);">You can adjust per-prayer alerts anytime in Profile.</div>'
      };
    }

    return {
      icon: 'sparkles',
      title: _tr('Your First Worship Moment'),
      body: '<p style="margin-bottom:12px;">Begin right now in under 10 seconds — tap one small sincere step:</p>' +
        '<div style="display:flex;flex-direction:column;gap:8px;">' +
          '<button type="button" class="onboarding-btn" onclick="window._onbQuickFirst(\'dhikr\')">Tap 3x SubhanAllah &amp; Begin</button>' +
          '<button type="button" class="iq-pill-btn" onclick="window._onbQuickFirst(\'prayer\')">Log Today\'s Fajr &amp; Begin</button>' +
        '</div>'
    };
  }

  function renderOnboardingStep() {
    if (typeof document === 'undefined') return;
    const ov = document.getElementById('onboardingOverlay');
    if (!ov) return;
    const st = (S && S.onboarding && S.onboarding.step) || 0;
    const content = _stepContent(st);
    const isLast = st >= TOTAL_STEPS - 1;
    let dots = '';
    for (let i = 0; i < TOTAL_STEPS; i++) {
      dots += '<div class="onboarding-dot' + (i === st ? ' active' : '') + '"></div>';
    }
    ov.innerHTML = '<div class="onboarding-card" role="dialog" aria-modal="true" aria-label="Onboarding">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
        (st > 0 ? '<button type="button" class="iq-text-btn" onclick="window.prevOnboardingStep()">&lsaquo; ' + _esc(_tr('Back')) + '</button>' : '<span></span>') +
        '<button type="button" class="iq-text-btn" onclick="window.completeOnboarding()">' + _esc(_tr('Skip')) + '</button>' +
      '</div>' +
      '<div class="onboarding-icon">' + iqIcon(content.icon) + '</div>' +
      '<h2>' + _esc(content.title) + '</h2>' +
      '<div class="onboarding-body">' + content.body + '</div>' +
      '<div class="onboarding-progress">' + dots + '</div>' +
      (!isLast
        ? '<button type="button" class="onboarding-btn" onclick="window.nextOnboardingStep()">' + _esc(_tr('Continue')) + '</button>'
        : '<button type="button" class="iq-text-btn" style="margin-top:8px;" onclick="window.completeOnboarding()">' + _esc(_tr('Begin')) + ' &rsaquo;</button>') +
    '</div>';
    ov.style.display = 'flex';
  }

  function startOnboarding() {
    if (typeof S !== 'undefined' && S) {
      if (!S.onboarding) S.onboarding = {};
      S.onboarding.step = 0;
      S.onboarding.complete = false;
      if (typeof saveState === 'function') saveState();
    }
    renderOnboardingStep();
  }

  function prevOnboardingStep() {
    if (typeof S === 'undefined' || !S) return;
    if (!S.onboarding) S.onboarding = {};
    S.onboarding.step = Math.max(0, (S.onboarding.step || 0) - 1);
    if (typeof saveState === 'function') saveState();
    renderOnboardingStep();
  }

  function nextOnboardingStep() {
    if (typeof S === 'undefined' || !S) return;
    if (!S.onboarding) S.onboarding = {};
    S.onboarding.step = (S.onboarding.step || 0) + 1;
    if (S.onboarding.step >= TOTAL_STEPS) { completeOnboarding(); return; }
    if (typeof saveState === 'function') saveState();
    renderOnboardingStep();
  }

  function completeOnboarding() {
    if (typeof S !== 'undefined' && S) {
      if (!S.onboarding) S.onboarding = {};
      S.onboarding.complete = true;
      if (typeof saveState === 'function') saveState();
    }
    if (typeof toast === 'function') toast(iqIcon('sparkles'), 'Assalamu Alaikum! Welcome to Ibadah Quest.', false, 2400);
    if (typeof document !== 'undefined') {
      const ov = document.getElementById('onboardingOverlay');
      if (ov) { ov.style.display = 'none'; ov.innerHTML = ''; }
    }
  }

  window._onbPickLang = _pickOnboardingLang;
  window._onbSetLevel = _setExperienceLevel;
  window._onbQuickFirst = _firstWorshipQuickStep;
  window.startOnboarding = startOnboarding;
  window.prevOnboardingStep = prevOnboardingStep;
  window.nextOnboardingStep = nextOnboardingStep;
  window.completeOnboarding = completeOnboarding;
  window.isOnboardingComplete = isOnboardingComplete;
  window.renderOnboardingStep = renderOnboardingStep;
})();
