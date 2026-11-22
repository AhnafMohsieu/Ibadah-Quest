// features/swipe-nav.js — Horizontal swipe between the 5 main sections (SP2).
// Self-init at module load; touch-only; dispatch mirrors a bottom-nav tap.
(function() {
  var MIN_DX = 60;
  var EDGE = 28;
  var RATIO = 1.5;
  var EXCLUDE = '#dailyCarousel, .tier-nav-container, .pull-refresh-indicator, input, textarea, select';

  // Pure gesture resolution: -1 = previous section, +1 = next, 0 = ignore.
  function _swipeDir(startX, dx, dy, viewportW) {
    if (startX < EDGE || startX > viewportW - EDGE) return 0;
    if (Math.abs(dx) < MIN_DX) return 0;
    if (Math.abs(dx) < RATIO * Math.abs(dy)) return 0;
    return dx < 0 ? 1 : -1;
  }

  function _swipeIndex(current, dir, count) {
    var idx = current + dir;
    if (idx < 0 || idx >= count) return -1;
    return idx;
  }

  function init() {
    if (init._done) return;
    init._done = true;
    if (!window.matchMedia || !window.matchMedia('(pointer: coarse)').matches) return;
    var content = document.getElementById('mainContent');
    if (!content) return;

    var startX = 0, startY = 0, track = false;

    content.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 1) { track = false; return; }
      if (e.target.closest && e.target.closest(EXCLUDE)) { track = false; return; }
      track = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    content.addEventListener('touchend', function(e) {
      if (!track) return;
      track = false;
      if (e.changedTouches.length !== 1) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      var dir = _swipeDir(startX, dx, dy, window.innerWidth);
      if (!dir) return;
      var btns = document.querySelectorAll('.bnav-btn');
      var active = document.querySelector('.bnav-btn.active');
      if (!btns.length || !active) {
        btns = document.querySelectorAll('.t1-btn');
        active = document.querySelector('.t1-btn.active');
      }
      if (!btns.length || !active) return;
      var current = Array.prototype.indexOf.call(btns, active);
      var next = _swipeIndex(current, dir, btns.length);
      if (next < 0) return;
      var target = btns[next];
      if (window.App && window.App.switchCategory) {
        window.App.switchCategory(target.getAttribute('data-cat'), target);
      }
    }, { passive: true });
  }

  window._swipeDir = _swipeDir;
  window._swipeIndex = _swipeIndex;
  window.initSwipeNav = init;
  init();
})();
