(function() {
  let _open = false;

  function toggle() {
    _open = !_open;
    const actions = document.getElementById('fabActions');
    const main = document.getElementById('fabMain');
    if (!actions || !main) return;
    main.setAttribute('aria-expanded', _open ? 'true' : 'false');
    if (_open) {
      if (typeof window.iqHaptic === 'function') window.iqHaptic(6);
      actions.style.display = 'flex';
      main.classList.add('fab-open');
      setTimeout(() => {
        actions.classList.add('fab-show');
        const firstAction = actions.querySelector('.fab-action');
        if (firstAction) firstAction.focus();
      }, 10);
    } else {
      actions.classList.remove('fab-show');
      main.classList.remove('fab-open');
      setTimeout(() => actions.style.display = 'none', 200);
      main.focus();
    }
  }

  function close() {
    if (_open) toggle();
  }

  function populateFABIcons() {
    var map = { 'Log Prayer': 'mosque', 'Dhikr': 'beads', 'Charity': 'hand-heart', 'Quests': 'scroll' };
    document.querySelectorAll('.fab-action').forEach(function (a) {
      var icon = a.querySelector('.fab-action-icon');
      if (!icon || icon.childElementCount > 0) return;
      var key = map[a.getAttribute('title')];
      if (key && window.iqIcon) icon.innerHTML = window.iqIcon(key);
    });
  }

  function init() {
    if (init._done) return;
    init._done = true;
    let lastScroll = 0;
    const fab = document.getElementById('fab');
    if (!fab) return;
    populateFABIcons();
    const scroller = document.querySelector('.app') || document.scrollingElement;
    scroller.addEventListener('scroll', () => {
      const cur = scroller.scrollTop;
      if (cur > lastScroll && cur > 100) { close(); }
      lastScroll = cur;
    }, { passive: true });

    fab.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _open) {
        e.preventDefault();
        close();
        return;
      }
      if (!_open) return;
      const actions = document.getElementById('fabActions');
      if (!actions) return;
      const items = Array.from(actions.querySelectorAll('.fab-action'));
      const idx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (idx + 1) % items.length;
        items[next].focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (idx - 1 + items.length) % items.length;
        items[prev].focus();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          const prev = (idx - 1 + items.length) % items.length;
          items[prev].focus();
        } else {
          const next = (idx + 1) % items.length;
          items[next].focus();
        }
      }
    });
  }

  window.toggleFAB = toggle;
  window.closeFAB = close;
  window.populateFABIcons = populateFABIcons;
  window.initFAB = init;

  // features/fab.js is a defer script: core/actions.js's synchronous init()
  // has already run by the time this file executes, so window.initFAB is
  // never invoked from there (same for pull-refresh.js and the SP2 nav
  // modules). Self-init at module load instead; init() is idempotent via
  // init._done, and populateFABIcons skips already-filled spans.
  populateFABIcons();
  init();
})();
