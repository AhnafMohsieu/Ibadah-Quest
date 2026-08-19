// core/themes.js — Theme management
(function() {
  const THEME_KEY = 'iqTheme';
  function isValidTheme(t) {
    try { return t && (window.Themes || []).some(m => m.key === t); } catch (e) { return t === 'light'; }
  }
  function updateMeta() {
    try { const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); if (bg) document.querySelector('meta[name="theme-color"]').setAttribute('content', bg); } catch (e) {}
  }
  function applyTheme() {
    try {
      const t = (S && S.theme) || localStorage.getItem(THEME_KEY) || 'light';
      const safe = isValidTheme(t) ? t : 'light';
      if (safe === 'light') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', safe);
      updateMeta();
    } catch (e) {}
  }
  function setTheme(name) {
    const theme = isValidTheme(name) ? name : 'light';
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    if (theme === 'light') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    if (S) { S.theme = theme; saveState(); }
    updateMeta();
    if (window.updateTopBar) window.updateTopBar();
    const activePanel = document.querySelector('.tab-panel.active');
    const tab = activePanel ? activePanel.id.replace('panel-', '') : 'home';
    if (window.renderTab) window.renderTab(tab);
  }
  function toggleTheme() {
    const themes = ['light', 'serene', 'royal', 'midnight', 'cream', 'emara'];
    const current = localStorage.getItem(THEME_KEY) || 'light';
    const idx = themes.indexOf(current);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next);
  }

  window.applyTheme = applyTheme;
  window.setTheme = setTheme;
  window.toggleTheme = toggleTheme;
})();
