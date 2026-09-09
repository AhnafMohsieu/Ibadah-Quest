// src/shell/layout.js
export function renderShell(pageId) {
  const pages = [['today', 'Today'], ['ibadah', 'Ibadah'], ['knowledge', 'Knowledge'], ['names', 'Names'], ['library', 'Library'], ['profile', 'Profile']];
  const nav = pages.map(([id, label]) => `<a href="../${id}/${id}.html" data-page="${id}"${id === pageId ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<header class="mpa-header"><h1>Ibadah Quest</h1><nav class="mpa-nav">${nav}</nav></header><main id="page"></main><div id="toastOverlay"></div>`;
}
export function markActiveNav(pageId) {
  document.querySelectorAll('[data-page]').forEach((a) => {
    if (a.getAttribute('data-page') === pageId) a.setAttribute('aria-current', 'page');
  });
}
