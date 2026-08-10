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
      setTimeout(() => actions.classList.add('fab-show'), 10);
    } else {
      actions.classList.remove('fab-show');
      main.classList.remove('fab-open');
      setTimeout(() => actions.style.display = 'none', 200);
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
  }

  window.toggleFAB = toggle;
  window.closeFAB = close;
  window.initFAB = init;
})();
