// features/nav-collapse.js — Sticky compact nav (SP2 feel & feedback).
// Self-init: core/actions.js runs its init() synchronously at parse time,
// before defer scripts load, so feature modules self-initialize.
(function() {
  var MEDIA = '(max-width: 767px), (pointer: coarse)';

  function resolveScroller() {
    return document.querySelector('.app') || document.scrollingElement;
  }

  function init() {
    if (init._done) return;
    init._done = true;
    if (!window.matchMedia || !window.matchMedia(MEDIA).matches) return;
    var nav = document.querySelector('.tier-nav-container');
    var topBar = document.getElementById('topBar');
    var sc = resolveScroller();
    if (!nav || !topBar || !sc) return;

    function measure() {
      document.documentElement.style.setProperty('--topbar-h', topBar.offsetHeight + 'px');
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function() { ticking = false; update(); });
    }

    function update() {
      var navTop = nav.getBoundingClientRect().top;
      var barBottom = topBar.getBoundingClientRect().bottom;
      var compact = nav.classList.contains('nav-compact');
      if (!compact && navTop <= barBottom + 2) {
        nav.classList.add('nav-compact');
      } else if (compact && navTop >= barBottom + 10) {
        nav.classList.remove('nav-compact');
      }
    }

    sc.addEventListener('scroll', onScroll, { passive: true });

    // Compact-mode taps reset to the top of the switched section; the reset
    // unsticks the nav and update() expands it on the next scroll event.
    nav.addEventListener('click', function(e) {
      if (!nav.classList.contains('nav-compact')) return;
      if (!e.target.closest || !e.target.closest('button, .surah-card')) return;
      sc.scrollTop = 0;
    });

    update();
  }

  window.initNavCollapse = init;
  init();
})();
