// features/spiritual-growth/index.js
// Main controller for spiritual growth features

(function() {
  const stages = (typeof FEATURE_STAGES !== 'undefined' && FEATURE_STAGES) ? FEATURE_STAGES : {};
  const DEFAULT_VISIBLE = Object.keys(stages);
  
  function getSettings() {
    return (window.S && window.S.growthSettings) || { visible: [...DEFAULT_VISIBLE] };
  }
  
  function saveSettings(settings) {
    if (window.S) {
      window.S.growthSettings = settings;
      if (typeof saveState === 'function') saveState();
    }
  }
  
  function isVisible(featureName) {
    const settings = getSettings();
    return settings.visible.includes(featureName);
  }
  
  function toggleFeature(featureName) {
    const settings = getSettings();
    const idx = settings.visible.indexOf(featureName);
    if (idx >= 0) {
      settings.visible.splice(idx, 1);
    } else {
      settings.visible.push(featureName);
    }
    saveSettings(settings);
    renderGrowthSettings();
  }
  
  function _sgT(s) { return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(s) : s; }
  function _sgN(v) { return (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function') ? window.iqFormatNum(v) : String(v); }

  function renderGrowthSettings() {
    const el = document.getElementById('growthSettingsArea');
    if (!el) return;
    
    const settings = getSettings();
    const features = Object.keys(FEATURE_STAGES);
    
    let h = `<div class="section-title">${iqIcon('sprout')} ${_sgT('Spiritual Growth Features')}</div>`;
    h += '<div class="growth-settings">';
    
    features.forEach(f => {
      const visible = settings.visible.includes(f);
      const progress = SpiritualGrowth.getProgress(f);
      const icon = SpiritualGrowth.FEATURE_ICONS[f] || progress.icon;
      const label = _sgT(SpiritualGrowth.FEATURE_LABELS[f] || f);

      h += `<div class="growth-setting-item ${visible ? 'active' : ''}" role="button" tabindex="0" aria-pressed="${visible}" onclick="SpiritualGrowth.toggle('${f}')">
        <div class="growth-setting-icon">${icon}</div>
        <div class="growth-setting-info">
          <div class="growth-setting-name">${label}</div>
          <div class="growth-setting-stage iq-tabular">${_sgT(progress.name)} (${_sgN(progress.stage)}/${_sgN(progress.totalStages)})</div>
        </div>
        <div class="growth-setting-toggle">${visible ? iqIcon('eye') || '✓' : iqIcon('eye-off') || '—'}</div>
      </div>`;
    });
    
    h += '</div>';
    el.innerHTML = h;
  }
  
  // Add to Profile tab
  if (TAB_GROUPS.profile_main) {
    TAB_GROUPS.profile_main.push({ id: 'growth', icon: 'sprout', label: 'Growth' });
  }

  function renderSpiritualGrowthTab() {
    const el = document.getElementById('growthArea');
    if (!el) return;
    const settings = getSettings();
    const features = Object.keys(FEATURE_STAGES);

    let h = `<div class="section-title">${iqIcon('sprout')} ${_sgT('Spiritual Growth')}</div>`;
    h += `<div class="growth-tab-intro">${_sgT('Each good deed grows your soul. Track your journey across the spiritual features below.')}</div>`;
    h += '<div class="growth-tab-grid">';

    features.forEach(f => {
      const visible = settings.visible.includes(f);
      const progress = SpiritualGrowth.getProgress(f);
      const icon = SpiritualGrowth.FEATURE_ICONS[f] || '';
      const label = _sgT(SpiritualGrowth.FEATURE_LABELS[f] || f);
      const stageEmoji = progress.icon || '';
      const pct = Math.round(progress.progress * 100);
      const progressText = progress.xpForNext
        ? `${_sgN(progress.xp.toLocaleString())} / ${_sgN(progress.xpForNext.toLocaleString())} XP`
        : _sgT('Max — may Allah accept it.');

      h += `<div class="growth-tab-card ${visible ? '' : 'disabled'}">
        <div class="growth-tab-card-head">
          <span class="growth-tab-icon">${icon}</span>
          <span class="growth-tab-label">${label}</span>
          <span class="growth-tab-stage-emoji">${stageEmoji}</span>
        </div>
        <div class="growth-tab-stage iq-tabular">${_sgT(progress.name)} · ${_sgT('Stage')} ${_sgN(progress.stage)}/${_sgN(progress.totalStages)}</div>
        <div class="growth-tab-bar"><div class="growth-tab-fill" style="width:${pct}%"></div></div>
        <div class="growth-tab-xp iq-tabular">${progressText}</div>
        <button type="button" class="growth-tab-toggle" aria-pressed="${visible}" onclick="SpiritualGrowth.toggle('${f}');renderSpiritualGrowthTab()">${_sgT(visible ? 'Visible' : 'Hidden')}</button>
      </div>`;
    });
    h += '</div>';
    el.innerHTML = h;
  }

  window.renderSpiritualGrowthTab = renderSpiritualGrowthTab;
  
  window.SpiritualGrowth = window.SpiritualGrowth || {};
  window.SpiritualGrowth.toggle = toggleFeature;
  window.SpiritualGrowth.isVisible = isVisible;
  window.SpiritualGrowth.renderSettings = renderGrowthSettings;
  window.SpiritualGrowth.DEFAULT_VISIBLE = DEFAULT_VISIBLE;
})();