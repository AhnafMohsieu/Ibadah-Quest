(function() {
  let _open = false;

  function toggle() {
    _open = !_open;
    const actions = document.getElementById('fabActions');
    const main = document.getElementById('fabMain');
    if (!actions || !main) return;
    if (_open) {
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

  function init() {
    let lastScroll = 0;
    const fab = document.getElementById('fab');
    if (!fab) return;
    window.addEventListener('scroll', () => {
      const cur = window.scrollY;
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
  window.initFAB = init;
})();
