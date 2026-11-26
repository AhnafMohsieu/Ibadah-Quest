(function() {
  // Verified daily reminders with explicit Surah:Ayah or Hadith collection citations
  const TIPS = [
    {
      text: 'Your smiling in the face of your brother is an act of charity.',
      bn: 'তোমার ভাইয়ের মুখে মুচকি হাসি দেওয়া একটি সদকা (দান)।',
      ar: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ.',
      ref: 'At-Tirmidhi 1956 (Sahih)'
    },
    {
      text: 'The most beloved deeds to Allah are the most consistent ones, even if small.',
      bn: 'আল্লাহর কাছে সবচেয়ে প্রিয় আমল হলো যা নিয়মিত করা হয়, যদিও তা পরিমাণে কম হয়।',
      ar: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ.',
      ref: 'Sahih al-Bukhari 6464'
    },
    {
      text: 'None of you truly believes until they love for their brother what they love for themselves.',
      bn: 'তোমাদের কেউ পূর্ণ মুমিন হতে পারবে না, যতক্ষণ না সে নিজের জন্য যা পছন্দ করে তার ভাইয়ের জন্যও তা পছন্দ করে।',
      ar: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',
      ref: 'Sahih al-Bukhari 13'
    },
    {
      text: 'My Lord, increase me in knowledge.',
      bn: 'হে আমার প্রতিপালক, আমার জ্ঞান বৃদ্ধি করে দিন।',
      ar: 'رَّبِّ زِدْنِي عِلْمًا',
      ref: "Qur'an 20:114"
    },
    {
      text: 'The strong person is the one who controls anger.',
      bn: 'প্রকৃত শক্তিশালী সেই ব্যক্তি, যে রাগের সময় নিজেকে নিয়ন্ত্রণ করতে পারে।',
      ar: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ.',
      ref: 'Sahih al-Bukhari 6114'
    },
    {
      text: 'Speak good or remain silent.',
      bn: 'ভালো কথা বলো, নতুবা নীরব থাকো।',
      ar: 'فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ.',
      ref: 'Sahih al-Bukhari 6018'
    },
    {
      text: 'Whoever treads a path seeking knowledge, Allah makes easy a path to Paradise.',
      bn: 'যে ব্যক্তি জ্ঞান অর্জনের পথে চলে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন।',
      ar: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.',
      ref: 'Sahih Muslim 2699'
    },
    {
      text: 'Indeed, with hardship comes ease.',
      bn: 'নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি।',
      ar: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      ref: "Qur'an 94:6"
    },
    {
      text: 'Verily, in the remembrance of Allah do hearts find rest.',
      bn: 'জেনে রাখো, আল্লাহর স্মরণেই অন্তরসমূহ প্রশান্তি লাভ করে।',
      ar: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      ref: "Qur'an 13:28"
    },
    {
      text: 'Charity does not decrease wealth.',
      bn: 'সদকা (দান) কখনো সম্পদ কমিয়ে দেয় না।',
      ar: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ.',
      ref: 'Sahih Muslim 2588'
    }
  ];

  function _pickLangField(obj) {
    var lang = (typeof I18N !== 'undefined' && I18N.lang) || 'en';
    if (lang === 'bn' && obj.bn) return obj.bn;
    if (lang === 'ar' && obj.ar) return obj.ar;
    return obj.text;
  }

  function getDailyItem(pool, seed) {
    const idx = seed % pool.length;
    return pool[idx];
  }

  function _esc(val) {
    const fn = typeof escapeHTML === 'function' ? escapeHTML : (typeof window !== 'undefined' && typeof window.escapeHTML === 'function' ? window.escapeHTML : null);
    return fn ? fn(val) : String(val == null ? '' : val);
  }

  function _tr(k) {
    return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(k) : k;
  }

  function _getLiveMomentumSummary() {
    try {
      const s = (typeof S !== 'undefined' && S) ? S : {};
      const lv = s.lv || 1;
      const title = (typeof lvTitle === 'function') ? lvTitle(lv) : 'New Seeker';
      const dk = (typeof today === 'function') ? today() : '';
      const pLog = (s.log && dk && s.log[dk] && s.log[dk].p) ? s.log[dk].p : {};
      const pDone = Object.values(pLog).filter(Boolean).length;
      const streak = s.cs || 0;
      return `Level ${lv} · ${title} · ${pDone}/5 prayers today · ${streak} day consistency`;
    } catch (e) {
      return 'Track your 5 daily prayers, dhikr & daily Quran quietly offline.';
    }
  }

  function getItems() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const items = [];
    const tip = TIPS[dayOfYear % TIPS.length];

    items.push({
      badge: _tr('Daily Reminder') + ' · ' + tip.ref,
      text: _pickLangField(tip),
      icon: 'sparkles',
      ctaLabel: _tr('Quran'),
      ctaAction: "App.activateTab('quran')"
    });

    items.push({
      badge: _tr("Today's Focus"),
      text: _getLiveMomentumSummary(),
      icon: 'zap',
      ctaLabel: _tr('Quests'),
      ctaAction: "App.activateTab('quests')"
    });

    if (typeof INSPIRATIONS_POOL !== 'undefined' && INSPIRATIONS_POOL.length) {
      const ins = getDailyItem(INSPIRATIONS_POOL, dayOfYear + 100);
      const txt = typeof ins === 'string' ? ins : (ins.text || ins.desc || ins.english || '');
      if (txt) {
        items.push({
          badge: _tr('Reflection'),
          text: txt,
          icon: 'book-open',
          ctaLabel: _tr('Morning'),
          ctaAction: "App.activateTab('morning')"
        });
      }
    }

    if (typeof HADITHS_POOL !== 'undefined' && HADITHS_POOL.length) {
      const h = getDailyItem(HADITHS_POOL, dayOfYear);
      items.push({
        badge: h.source || _tr('Hadith'),
        text: h.text || h.desc || h.english,
        icon: 'book-open',
        ctaLabel: _tr('Hadith'),
        ctaAction: "App.activateTab('hadith')"
      });
    }

    return items;
  }

  let _current = 0;
  let _items = [];
  let _timer = null;

  function isReducedMotion() {
    try {
      return typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  }

  function stopTimer() {
    if (_timer && typeof clearInterval === 'function') clearInterval(_timer);
    _timer = null;
  }

  function startTimer() {
    stopTimer();
    if (isReducedMotion()) return;
    if (_items.length > 1 && typeof setInterval === 'function') {
      _timer = setInterval(() => show((_current + 1) % _items.length), 8500);
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
    const hasLatin = /[A-Za-z]/.test(String(item.text || '')) && !/[\u0600-\u06FF\u0980-\u09FF]/.test(String(item.text || ''));
    const textDirAttr = hasLatin ? ' dir="ltr" style="unicode-bidi:isolate;"' : '';
    el.innerHTML = `<div class="carousel-card">
      <div class="carousel-top-row">
        <div class="carousel-header">${icon}<span>${_esc(item.badge)}</span></div>
        <div class="carousel-nav-controls">
          <div class="carousel-dots">${dotsHtml}</div>
          <button type="button" class="carousel-nav-btn iq-mirror-icon" onclick="window._carouselPrev()" aria-label="Previous highlight"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg></button>
          <button type="button" class="carousel-nav-btn iq-mirror-icon" onclick="window._carouselNext()" aria-label="Next highlight"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
      <div class="carousel-main-row">
        <div class="carousel-text"${textDirAttr}>${_esc(item.text)}</div>
        <button type="button" class="carousel-cta" onclick="${_esc(item.ctaAction)}"><span>${_esc(item.ctaLabel)}</span><svg class="iq-mirror-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
    </div>`;
  }

  function nextSlide() { if (!_items.length) return; show(_current + 1); startTimer(); }
  function prevSlide() { if (!_items.length) return; show(_current - 1); startTimer(); }

  function touchHandlers() {
    const el = document.getElementById('dailyCarousel');
    if (!el) return;
    let startX = 0;
    el.addEventListener('touchstart', e => { if (e.touches && e.touches[0]) startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 45) {
        var rtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
        var forward = rtl ? diff < 0 : diff > 0;
        if (forward) nextSlide();
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', touchHandlers);
  else touchHandlers();
})();
