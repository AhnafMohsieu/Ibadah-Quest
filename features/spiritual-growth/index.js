// features/spiritual-growth/index.js
// Main controller for spiritual growth features

(function() {
  const DEFAULT_VISIBLE = ['garden', 'lantern', 'keys', 'daynight'];
  
  function getSettings() {
    return S.growthSettings || { visible: [...DEFAULT_VISIBLE] };
  }
  
  function saveSettings(settings) {
    S.growthSettings = settings;
    save();
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
  
  function renderGrowthSettings() {
    const el = document.getElementById('growthSettingsArea');
    if (!el) return;
    
    const settings = getSettings();
    const features = Object.keys(FEATURE_STAGES);
    
    let h = '<div class="section-title">🌱 Spiritual Growth Features</div>';
    h += '<div class="growth-settings">';
    
    features.forEach(f => {
      const visible = settings.visible.includes(f);
      const stages = FEATURE_STAGES[f];
      const progress = SpiritualGrowth.getProgress(f);
      const icon = SpiritualGrowth.FEATURE_ICONS[f] || progress.icon;
      const label = SpiritualGrowth.FEATURE_LABELS[f] || f;

      h += `<div class="growth-setting-item ${visible ? 'active' : ''}" onclick="SpiritualGrowth.toggle('${f}')">
        <div class="growth-setting-icon">${icon}</div>
        <div class="growth-setting-info">
          <div class="growth-setting-name">${label}</div>
          <div class="growth-setting-stage">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        </div>
        <div class="growth-setting-toggle">${visible ? '👁️' : '🙈'}</div>
      </div>`;
    });
    
    h += '</div>';
    el.innerHTML = h;
  }
  
  // Add to Profile tab
  if (TAB_GROUPS.profile_main) {
    TAB_GROUPS.profile_main.push({ id: 'growth-settings', icon: '⚙️', label: 'Growth' });
  }
  
  window.SpiritualGrowth = window.SpiritualGrowth || {};
  window.SpiritualGrowth.toggle = toggleFeature;
  window.SpiritualGrowth.isVisible = isVisible;
  window.SpiritualGrowth.renderSettings = renderGrowthSettings;
  window.SpiritualGrowth.DEFAULT_VISIBLE = DEFAULT_VISIBLE;
})();