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

  function getItems() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const items = [];

    if (typeof HADITHS_POOL !== 'undefined' && HADITHS_POOL.length) {
      const h = getDailyItem(HADITHS_POOL, dayOfYear);
      items.push({ text: h.text || h.desc || h.english, source: h.source || 'Hadith', icon: 'book-open' });
    }

    if (typeof INSPIRATIONS_POOL !== 'undefined' && INSPIRATIONS_POOL.length) {
      const ins = getDailyItem(INSPIRATIONS_POOL, dayOfYear + 100);
      const t = typeof ins === 'string' ? ins : (ins.text || ins.desc || ins.english || '');
      items.push({ text: t, source: 'Inspirations', icon: 'sparkles' });
    }

    items.push({ text: TIPS[dayOfYear % TIPS.length], source: 'Daily Tip', icon: 'lightbulb' });

    return items;
  }

  let _current = 0;
  let _items = [];
  let _timer = null;

  function render() {
    const el = document.getElementById('dailyCarousel');
    if (!el) return;
    _items = getItems();
    if (!_items.length) { el.style.display = 'none'; return; }
    el.style.display = '';
    show(0);
    clearInterval(_timer);
    _timer = setInterval(() => show((_current + 1) % _items.length), 8000);
  }

  function show(idx) {
    _current = idx;
    const el = document.getElementById('dailyCarousel');
    if (!el || !_items.length) return;
    const item = _items[_current];
    el.innerHTML = `<div class="carousel-card">
      <div class="carousel-header">${iqIcon(item.icon)} ${item.source}</div>
      <div class="carousel-text">${item.text}</div>
      <div class="carousel-dots">${_items.map((_, i) => `<span class="carousel-dot${i === _current ? ' active' : ''}" onclick="window._carouselShow(${i})"></span>`).join('')}</div>
    </div>`;
  }

  function touchHandlers() {
    const el = document.getElementById('dailyCarousel');
    if (!el) return;
    let startX = 0;
    el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) show((_current + 1) % _items.length);
        else show((_current - 1 + _items.length) % _items.length);
      }
    }, { passive: true });
  }

  window._carouselShow = show;
  window.renderDailyContent = render;
  document.addEventListener('DOMContentLoaded', touchHandlers);
})();
