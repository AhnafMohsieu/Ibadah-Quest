(function() {
  let _startY = 0;
  let _pulling = false;
  const THRESHOLD = 60;

  function init() {
    if (!('ontouchstart' in window)) return;
    const content = document.getElementById('mainContent');
    const indicator = document.getElementById('pullRefreshIndicator');
    if (!content || !indicator) return;

    content.addEventListener('touchstart', function(e) {
      if (window.scrollY === 0) { _startY = e.touches[0].clientY; _pulling = true; }
    }, { passive: true });

    content.addEventListener('touchmove', function(e) {
      if (!_pulling) return;
      const diff = e.touches[0].clientY - _startY;
      if (diff > 0 && window.scrollY === 0) {
        const pull = Math.min(diff * 0.4, 100);
        indicator.style.transform = `translateY(${pull - 50}px)`;
        indicator.style.opacity = pull / THRESHOLD;
        if (pull >= THRESHOLD) indicator.querySelector('.pull-refresh-text').textContent = 'Release to refresh';
        else indicator.querySelector('.pull-refresh-text').textContent = 'Pull to refresh';
      }
    }, { passive: true });

    content.addEventListener('touchend', function(e) {
      if (!_pulling) return;
      _pulling = false;
      const diff = e.changedTouches[0].clientY - _startY;
      const indicator = document.getElementById('pullRefreshIndicator');
      if (diff * 0.4 >= THRESHOLD) {
        indicator.querySelector('.pull-refresh-text').textContent = 'Refreshing...';
        indicator.style.transform = 'translateY(0)';
        indicator.style.opacity = '1';
        indicator.classList.add('refreshing');
        if (typeof refreshContent === 'function') {
          refreshContent();
          setTimeout(() => {
            indicator.style.transform = 'translateY(-50px)';
            indicator.style.opacity = '0';
            indicator.classList.remove('refreshing');
          }, 1000);
        }
      } else {
        indicator.style.transform = 'translateY(-50px)';
        indicator.style.opacity = '0';
      }
    }, { passive: true });
  }

  window.initPullRefresh = init;
})();
