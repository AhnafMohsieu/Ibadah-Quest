(function() {
  function escapeSearchText(value) {
    return window.escapeHTML(value);
  }

  function fuzzyMatch(query, text) {
    query = query.toLowerCase();
    text = text.toLowerCase();
    if (text.includes(query)) return true;
    let qi = 0;
    for (let ti = 0; ti < text.length && qi < query.length; ti++) {
      if (text[ti] === query[qi]) qi++;
    }
    return qi === query.length;
  }

  const SEARCH_POOLS = [
    { var: 'DUA_POOL', cat: 'Duas', tab: 'duas', fields: ['english','desc','text','title'] },
    { var: 'SUNNAH_POOL', cat: 'Sunnah', tab: 'sunnahs', fields: ['english','desc','text','title'] },
    { var: 'DHIKR_POOL', cat: 'Dhikr', tab: 'dhikr', fields: ['english','desc','text','roman'] },
    { var: 'STORIES', cat: 'Stories', tab: 'stories', fields: ['title','desc','text','english'] },
    { var: 'NAMES', cat: 'Names of Allah', tab: 'allah_names', fields: ['name','english','desc'] },
    { var: 'HADITHS', cat: 'Hadith', tab: 'hadith', fields: ['text','desc','english','source'] },
    { var: 'INSPIRATIONS_POOL', cat: 'Inspirations', tab: 'inspirations', fields: ['text','desc','english'] },
    { var: 'SINS_POOL', cat: 'Sins', tab: 'sins', fields: ['title','desc','text'] },
    { var: 'FINANCE_POOL', cat: 'Finance', tab: 'finance', fields: ['title','desc'] },
    { var: 'FAMILY_POOL', cat: 'Family', tab: 'family', fields: ['title','desc','text'] },
    { var: 'HEART_POOL', cat: 'Heart', tab: 'heart', fields: ['title','desc','text','english'] },
    { var: 'PUNISHMENTS_POOL', cat: 'Punishments', tab: 'punishments', fields: ['title','desc','text'] },
    { var: 'REPENTANCE_POOL', cat: 'Repentance', tab: 'repentance', fields: ['title','desc','text'] },
    { var: 'SAHABA_POOL', cat: 'Sahaba', tab: 'sahaba', fields: ['title','desc','name'] },
    { var: 'SEERAH_POOL', cat: 'Seerah', tab: 'seerah', fields: ['title','desc','text'] },
    { var: 'TAFSIR_POOL', cat: 'Tafsir', tab: 'tafsir', fields: ['title','desc','text'] },
    { var: 'MANNERS_POOL', cat: 'Manners', tab: 'manners', fields: ['title','desc','text'] },
    { var: 'AQEEDAH_POOL', cat: 'Creed', tab: 'aqeedah', fields: ['title','desc','text'] },
    { var: 'HEALTH_POOL', cat: 'Health', tab: 'health', fields: ['title','desc','text'] },
    { var: 'UMMAH_POOL', cat: 'Ummah', tab: 'ummah', fields: ['title','desc','text'] },
    { var: 'HAJJ_POOL', cat: 'Hajj', tab: 'hajj', fields: ['title','desc','text'] },
    { var: 'AKHIRAH_POOL', cat: 'Hereafter', tab: 'akhirah', fields: ['title','desc','text'] },
    { var: 'PROPHETS_POOL', cat: 'Prophets', tab: 'prophets', fields: ['title','desc','name'] },
    { var: 'WOMEN_POOL', cat: 'Women', tab: 'women', fields: ['title','desc','name'] },
    { var: 'KNOWLEDGE_POOL', cat: 'Knowledge', tab: 'knowledge', fields: ['title','desc','text'] },
    { var: 'JUMUAH_POOL', cat: "Jumu'ah", tab: 'jumuah', fields: ['title','desc','text'] },
    { var: 'MARRIAGE_POOL', cat: 'Marriage', tab: 'marriage', fields: ['title','desc','text'] },
    { var: 'SCIENCE_POOL', cat: 'Science', tab: 'science', fields: ['title','desc','text'] },
    { var: 'WUDU_POOL', cat: 'Wudu', tab: 'wudu', fields: ['title','desc','text'] },
    { var: 'SCHOLARS_POOL', cat: 'Scholars', tab: 'scholars_names', fields: ['title','desc','name'] },
    { var: 'PATIENCE_POOL', cat: 'Patience', tab: 'patience', fields: ['title','desc','text'] },
    { var: 'WORK_POOL', cat: 'Work', tab: 'work', fields: ['title','desc','text'] },
    { var: 'COMMUNITY_POOL', cat: 'Community', tab: 'community', fields: ['title','desc','text'] },
    { var: 'ENVIRONMENT_POOL', cat: 'Environment', tab: 'environment', fields: ['title','desc','text'] },
    { var: 'TRAVEL_POOL', cat: 'Travel', tab: 'travel', fields: ['title','desc','text'] },
    { var: 'FIQH_POOL', cat: 'Fiqh', tab: 'fiqh', fields: ['title','desc','text'] },
    { var: 'ARABIC_POOL', cat: 'Arabic', tab: 'arabic', fields: ['title','desc','text'] },
    { var: 'TAWAKKUL_POOL', cat: 'Tawakkul', tab: 'tawakkul', fields: ['title','desc','text'] },
    { var: 'IKHLAS_POOL', cat: 'Ikhlas', tab: 'ikhlas', fields: ['title','desc','text'] },
    { var: 'ZUHD_POOL', cat: 'Zuhd', tab: 'zuhd', fields: ['title','desc','text'] },
    { var: 'DAWAH_POOL', cat: "Da'wah", tab: 'dawah', fields: ['title','desc','text'] },
    { var: 'CIVILISATION_POOL', cat: 'Civilisation', tab: 'civilisation', fields: ['title','desc','text'] },
    { var: 'BATTLES_POOL', cat: 'Battles', tab: 'battles', fields: ['title','desc','text'] },
    { var: 'JANNAH_POOL', cat: 'Jannah', tab: 'jannah', fields: ['title','desc','text'] },
    { var: 'JAHANNAM_POOL', cat: 'Jahannam', tab: 'jahannam', fields: ['title','desc','text'] },
    { var: 'GRAVE_POOL', cat: 'Grave', tab: 'grave', fields: ['title','desc','text'] },
    { var: 'SIGNS_POOL', cat: 'Signs', tab: 'signs', fields: ['title','desc','text'] },
    { var: 'DREAMS_POOL', cat: 'Dreams', tab: 'dreams', fields: ['title','desc','text'] },
    { var: 'PARENTING_POOL', cat: 'Parenting', tab: 'parenting', fields: ['title','desc','text'] },
    { var: 'FOOD_POOL', cat: 'Food', tab: 'food', fields: ['title','desc','text'] },
    { var: 'TIBB_POOL', cat: 'Tibb', tab: 'tibb', fields: ['title','desc','text'] },
    { var: 'YOUTH_POOL', cat: 'Youth', tab: 'youth', fields: ['title','desc','text'] },
    { var: 'TECH_POOL', cat: 'Technology', tab: 'tech', fields: ['title','desc','text'] },
    { var: 'NEIGHBORS_POOL', cat: 'Neighbors', tab: 'neighbors', fields: ['title','desc','text'] },
  ];

  function searchAll(term) {
    if (!term || term.length < 2) return [];
    const results = [];
    for (const { var: varName, cat, tab, fields } of SEARCH_POOLS) {
      const pool = typeof window[varName] !== 'undefined' ? window[varName] : [];
      for (const item of pool) {
        if (typeof item === 'string') {
          if (fuzzyMatch(term, item)) results.push({ text: item.slice(0, 100), section: cat, tab });
          continue;
        }
        for (const f of fields) {
          if (item[f] && fuzzyMatch(term, item[f])) {
            results.push({ text: (item.title || item.name || item[f]).slice(0, 100), section: cat, tab });
            break;
          }
        }
        if (results.length >= 20) break;
      }
      if (results.length >= 20) break;
    }
    return results;
  }

  let _debounce = null;
  let _recent = [];

  function init() {
    const input = document.querySelector('.global-search');
    const box = document.getElementById('globalSearchResults');
    if (!input || !box) return;

    input.addEventListener('input', function() {
      clearTimeout(_debounce);
      _debounce = setTimeout(() => showResults(this.value, box), 200);
    });

    input.addEventListener('keydown', function(e) {
      const items = box.querySelectorAll('.gs-item');
      const active = box.querySelector('.gs-item.active');
      let idx = active ? Array.from(items).indexOf(active) : -1;
      if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx + 1, items.length - 1); setActive(items, idx); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx - 1, 0); setActive(items, idx); }
      else if (e.key === 'Enter' && active) { e.preventDefault(); active.click(); }
      else if (e.key === 'Escape') { box.classList.remove('show'); input.blur(); }
    });

    input.addEventListener('focus', function() { if (this.value.length >= 2) showResults(this.value, box); });
  }

  function setActive(items, idx) {
    items.forEach((el, i) => el.classList.toggle('active', i === idx));
  }

  function showResults(term, box) {
    if (!term || term.length < 2) { box.classList.remove('show'); box.innerHTML = ''; return; }
    const results = searchAll(term);
    if (!results.length) { box.innerHTML = `<div class="gs-item gs-empty">No results for "${escapeSearchText(term)}"</div>`; box.classList.add('show'); return; }

    saveRecent(term);
    const recentHtml = _recent.length ? `<div class="gs-section">Recent</div>${_recent.map((r, i) => `<button type="button" class="gs-item gs-recent" data-recent-index="${i}" aria-label="Search for ${escapeSearchText(r)}">${iqIcon('clock')} ${escapeSearchText(r)}</button>`).join('')}` : '';

    let html = recentHtml;
    const grouped = {};
    for (const r of results) { (grouped[r.section] = grouped[r.section] || []).push(r); }
    for (const [section, items] of Object.entries(grouped)) {
      html += `<div class="gs-section">${escapeSearchText(section)}</div>`;
      for (const r of items) {
        const resultIndex = results.indexOf(r);
        html += `<button type="button" class="gs-item gs-result" data-result-index="${resultIndex}">${escapeSearchText(r.text)}</button>`;
      }
    }
    box.innerHTML = html;
    box.querySelectorAll('.gs-recent').forEach(function(item) {
      item.addEventListener('click', function() {
        const input = document.querySelector('.global-search');
        const term = _recent[Number(item.dataset.recentIndex)];
        if (!input || typeof term !== 'string') return;
        input.value = term;
        input.dispatchEvent(new Event('input'));
      });
    });
    box.querySelectorAll('.gs-result').forEach(function(item) {
      item.addEventListener('click', function() {
        const result = results[Number(item.dataset.resultIndex)];
        if (!result) return;
        App.activateTab(result.tab);
        box.classList.remove('show');
      });
    });
    box.classList.add('show');
  }

  function saveRecent(term) {
    _recent = _recent.filter(r => r !== term);
    _recent.unshift(term);
    if (_recent.length > 5) _recent = _recent.slice(0, 5);
  }

  window.searchAll = searchAll;
  window.initSearch = init;
})();
