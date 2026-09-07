// src/shell/tabs.js
// Reusable category-chip + tier-3 tab navigation for MPA pages.
// Works with TAB_GROUPS-style categorized groups.

const _loaded = new Set();

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function isCategorized(group) {
  return Array.isArray(group) && group.length > 0 && Array.isArray(group[0].tabs);
}

function _loadScript(src) {
  if (_loaded.has(src)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => { _loaded.add(src); resolve(); };
    s.onerror = () => reject(new Error('Failed to load ' + src));
    document.body.appendChild(s);
  });
}

/**
 * Render category-chip + tier-3-tab navigation into a container.
 *
 * @param {HTMLElement} chipContainer - where to put category chips
 * @param {HTMLElement} tabContainer - where to put tier-3 tabs
 * @param {Array} group - TAB_GROUPS-style categorized array
 * @param {Object} opts
 * @param {Function} opts.onTabActivate - called with (tabId) when a tab is clicked
 * @param {Function} [opts.getScriptsForTab] - return script URL(s) to lazy-load for a tab
 * @returns {{ activateFirst: Function, activateTab: Function }}
 */
export function renderCategoryNav(chipContainer, tabContainer, group, opts) {
  const { onTabActivate, getScriptsForTab } = opts;
  let activeCat = null;
  let activeTab = null;

  if (!isCategorized(group)) {
    // Flat tab list — no chips, just render tabs directly
    chipContainer.innerHTML = '';
    tabContainer.style.display = 'none';
    tabContainer.innerHTML = '';
    return {
      activateFirst() {
        if (group.length > 0) activateTab(group[0].id);
      },
      activateTab,
    };
  }

  chipContainer.innerHTML = group.map((c, i) =>
    `<button class="cat-chip${i === 0 ? ' active' : ''}" data-cat="${esc(c.id)}">${esc(c.label)}</button>`
  ).join('');

  chipContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-chip');
    if (!btn) return;
    const catId = btn.getAttribute('data-cat');
    chipContainer.querySelectorAll('.cat-chip').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = group.find((c) => c.id === catId);
    if (cat) renderTier3(cat);
  });

  tabContainer.style.display = '';

  function renderTier3(cat) {
    activeCat = cat.id;
    tabContainer.innerHTML = cat.tabs.map((t, i) =>
      `<button class="t2-btn${i === 0 ? ' active' : ''}" data-tab="${esc(t.id)}">${esc(t.label)}</button>`
    ).join('');
    if (cat.tabs.length > 0) activateTab(cat.tabs[0].id);
  }

  async function activateTab(tabId) {
    if (activeTab === tabId) return;
    activeTab = tabId;
    tabContainer.querySelectorAll('.t2-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    if (getScriptsForTab) {
      const urls = getScriptsForTab(tabId);
      if (urls) {
        const srcs = Array.isArray(urls) ? urls : [urls];
        await Promise.all(srcs.map(_loadScript));
      }
    }
    onTabActivate(tabId);
  }

  return {
    activateFirst() {
      if (group.length > 0 && group[0].tabs.length > 0) {
        chipContainer.querySelector('.cat-chip')?.classList.add('active');
        renderTier3(group[0]);
      }
    },
    activateTab,
  };
}

/**
 * Render a flat tab bar (no categories).
 */
export function renderFlatTabs(container, tabs, opts) {
  const { onTabActivate, getScriptsForTab } = opts;
  let activeTab = null;

  container.innerHTML = tabs.map((t, i) =>
    `<button class="t2-btn${i === 0 ? ' active' : ''}" data-tab="${esc(t.id)}">${esc(t.label)}</button>`
  ).join('');

  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('.t2-btn');
    if (!btn) return;
    const tabId = btn.getAttribute('data-tab');
    if (activeTab === tabId) return;
    activeTab = tabId;
    container.querySelectorAll('.t2-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    if (getScriptsForTab) {
      const urls = getScriptsForTab(tabId);
      if (urls) {
        const srcs = Array.isArray(urls) ? urls : [urls];
        await Promise.all(srcs.map(_loadScript));
      }
    }
    onTabActivate(tabId);
  });

  if (tabs.length > 0) {
    activeTab = tabs[0].id;
    onTabActivate(tabs[0].id);
  }
}
