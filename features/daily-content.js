(function() {
  const TIPS = [
    'Smile — it is charity. (Bukhari)',
    'The best of people are those most beneficial to others.',
    'None of you truly believes until he loves for his brother what he loves for himself.',
    'Seek knowledge from the cradle to the grave.',
    'The strong person is not the one who can wrestle, but the one who controls himself when angry.',
    'Speak good or remain silent.',
    'Whoever treads a path seeking knowledge, Allah will make easy the path to Paradise.',
    'Verily, with hardship comes ease. (94:6)',
    'The world is beautiful and verdant, and verily Allah has made you His stewards in it.',
    'Take advantage of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your preoccupation, and your life before your death.'
  ];

  function getDailyItem(pool, seed) {
    const idx = seed % pool.length;
    return pool[idx];
  }

  function _esc(val) {
    const fn = typeof escapeHTML === 'function' ? escapeHTML : (typeof window !== 'undefined' && typeof window.escapeHTML === 'function' ? window.escapeHTML : null);
    return fn ? fn(val) : String(val == null ? '' : val);
  }

  function _getLiveMomentumSummary() {
    try {
      const s = (typeof S !== 'undefined' && S) ? S : {};
      const lv = s.lv || 1;
      const title = (typeof lvTitle === 'function') ? lvTitle(lv) : 'Seeker';
      const dk = (typeof today === 'function') ? today() : '';
      const pLog = (s.log && dk && s.log[dk] && s.log[dk].p) ? s.log[dk].p : {};
      const pDone = Object.values(pLog).filter(Boolean).length;
      const streak = s.cs || 0;
      return `Level ${lv} · ${title} · ${pDone}/5 prayers today · ${streak} day streak`;
    } catch (e) {
      return 'Track your 5 daily prayers, dhikr & spiritual streak today.';
    }
  }

  function getItems() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const items = [];

    if (typeof INSPIRATIONS_POOL !== 'undefined' && INSPIRATIONS_POOL.length) {
      const ins = getDailyItem(INSPIRATIONS_POOL, dayOfYear + 100);
      const t = typeof ins === 'string' ? ins : (ins.text || ins.desc || ins.english || '');
      items.push({
        badge: 'Daily Inspiration',
        text: t,
        icon: 'sparkles',
        ctaLabel: 'Open Qur\'an',
        ctaAction: "App.activateTab('quran')"
      });
    } else {
      items.push({
        badge: 'Daily Reflection',
        text: '"Indeed, with hardship [will be] ease." (Qur\'an 94:6)',
        icon: 'sparkles',
        ctaLabel: 'Open Qur\'an',
        ctaAction: "App.activateTab('quran')"
      });
    }

    items.push({
      badge: 'Daily Momentum',
      text: _getLiveMomentumSummary(),
      icon: 'zap',
      ctaLabel: 'Challenges',
      ctaAction: "window.openChallengeDetail && window.openChallengeDetail('dhikr')"
    });

    if (typeof HADITHS_POOL !== 'undefined' && HADITHS_POOL.length) {
      const h = getDailyItem(HADITHS_POOL, dayOfYear);
      items.push({
        badge: h.source || 'Hadith of the Day',
        text: h.text || h.desc || h.english,
        icon: 'book-open',
        ctaLabel: 'Hadith Library',
        ctaAction: "App.activateTab('hadith')"
      });
    }

    const visits = (typeof S !== 'undefined' && S && Array.isArray(S.masjidCheckIns)) ? S.masjidCheckIns.length : 0;
    items.push({
      badge: 'Masjid Check-ins',
      text: visits > 0 ? `${visits} masjid visit(s) logged — keep up congregation prayers!` : 'Log congregation prayers and track your masjid check-ins.',
      icon: 'mosque',
      ctaLabel: 'Masjid Map',
      ctaAction: "window.openMasjidCheckins && window.openMasjidCheckins('map')"
    });

    items.push({
      badge: 'Daily Tip',
      text: TIPS[dayOfYear % TIPS.length],
      icon: 'lightbulb',
      ctaLabel: 'Daily Quests',
      ctaAction: "App.activateTab('quests')"
    });

    return items;
  }

  let _current = 0;
  let _items = [];
  let _timer = null;

  function stopTimer() {
    if (_timer && typeof clearInterval === 'function') {
      clearInterval(_timer);
    }
    _timer = null;
  }

  function startTimer() {
    stopTimer();
    if (_items.length > 1 && typeof setInterval === 'function') {
      _timer = setInterval(() => show((_current + 1) % _items.length), 7000);
    }
  }

  function render() {
    const el = document.getElementById('dailyCarousel');
    if (!el) return;
    _items = getItems();
    if (!_items.length) { el.style.display = 'none'; stopTimer(); return; }
    el.style.display = '';
    show(0);
    startTimer();
  }

  function show(idx) {
    const el = document.getElementById('dailyCarousel');
    if (!el || !_items.length) return;
    _current = ((idx % _items.length) + _items.length) % _items.length;
    const item = _items[_current];
    if (!item) return;
    const icon = typeof iqIcon === 'function' ? iqIcon(item.icon) : '';
    const dotsHtml = _items.map((_, i) => `<button type="button" class="carousel-dot${i === _current ? ' active' : ''}" onclick="window._carouselShow(${i})" aria-label="Slide ${i + 1} of ${_items.length}"></button>`).join('');
    el.innerHTML = `<div class="carousel-card">
      <div class="carousel-top-row">
        <div class="carousel-header">${icon} <span>${_esc(item.badge)}</span></div>
        <div class="carousel-nav-controls">
          <button type="button" class="carousel-nav-btn" onclick="window._carouselPrev()" aria-label="Previous highlight">&lsaquo;</button>
          <button type="button" class="carousel-nav-btn" onclick="window._carouselNext()" aria-label="Next highlight">&rsaquo;</button>
        </div>
      </div>
      <div class="carousel-main-row">
        <div class="carousel-text">${_esc(item.text)}</div>
        <button type="button" class="carousel-cta" onclick="${_esc(item.ctaAction)}">${_esc(item.ctaLabel)} &rsaquo;</button>
      </div>
      <div class="carousel-dots">${dotsHtml}</div>
    </div>`;
  }

  function nextSlide() {
    if (!_items.length) return;
    show(_current + 1);
    startTimer();
  }

  function prevSlide() {
    if (!_items.length) return;
    show(_current - 1);
    startTimer();
  }

  function touchHandlers() {
    const el = document.getElementById('dailyCarousel');
    if (!el) return;
    let startX = 0;
    el.addEventListener('touchstart', e => { if (e.touches && e.touches[0]) startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 45) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });
    el.addEventListener('mouseenter', stopTimer);
    el.addEventListener('mouseleave', startTimer);
  }

  window._carouselShow = show;
  window._carouselNext = nextSlide;
  window._carouselPrev = prevSlide;
  window._stopCarouselTimer = stopTimer;
  window.renderDailyContent = render;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', touchHandlers);
  } else {
    touchHandlers();
  }
})();
