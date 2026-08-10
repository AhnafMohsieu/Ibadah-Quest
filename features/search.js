(function() {
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
    { var: 'DUA_POOL', cat: 'Duas', fields: ['english','desc','text','title'] },
    { var: 'SUNNAH_POOL', cat: 'Sunnah', fields: ['english','desc','text','title'] },
    { var: 'DHIKR_POOL', cat: 'Dhikr', fields: ['english','desc','text','roman'] },
    { var: 'STORIES', cat: 'Stories', fields: ['title','desc','text','english'] },
    { var: 'NAMES', cat: 'Names of Allah', fields: ['name','english','desc'] },
    { var: 'HADITHS', cat: 'Hadith', fields: ['text','desc','english','source'] },
    { var: 'INSPIRATIONS_POOL', cat: 'Inspirations', fields: ['text','desc','english'] },
    { var: 'SINS_POOL', cat: 'Sins', fields: ['title','desc','text'] },
    { var: 'FINANCE_POOL', cat: 'Finance', fields: ['title','desc'] },
    { var: 'FAMILY_POOL', cat: 'Family', fields: ['title','desc','text'] },
    { var: 'HEART_POOL', cat: 'Heart', fields: ['title','desc','text','english'] },
    { var: 'PUNISHMENTS_POOL', cat: 'Punishments', fields: ['title','desc','text'] },
    { var: 'REPENTANCE_POOL', cat: 'Repentance', fields: ['title','desc','text'] },
    { var: 'SAHABA_POOL', cat: 'Sahaba', fields: ['title','desc','name'] },
    { var: 'SEERAH_POOL', cat: 'Seerah', fields: ['title','desc','text'] },
    { var: 'TAFSIR_POOL', cat: 'Tafsir', fields: ['title','desc','text'] },
    { var: 'MANNERS_POOL', cat: 'Manners', fields: ['title','desc','text'] },
    { var: 'AQEEDAH_POOL', cat: 'Creed', fields: ['title','desc','text'] },
    { var: 'HEALTH_POOL', cat: 'Health', fields: ['title','desc','text'] },
    { var: 'UMMAH_POOL', cat: 'Ummah', fields: ['title','desc','text'] },
    { var: 'HAJJ_POOL', cat: 'Hajj', fields: ['title','desc','text'] },
    { var: 'AKHIRAH_POOL', cat: 'Hereafter', fields: ['title','desc','text'] },
    { var: 'PROPHETS_POOL', cat: 'Prophets', fields: ['title','desc','name'] },
    { var: 'WOMEN_POOL', cat: 'Women', fields: ['title','desc','name'] },
    { var: 'KNOWLEDGE_POOL', cat: 'Knowledge', fields: ['title','desc','text'] },
    { var: 'JUMUAH_POOL', cat: "Jumu'ah", fields: ['title','desc','text'] },
    { var: 'MARRIAGE_POOL', cat: 'Marriage', fields: ['title','desc','text'] },
    { var: 'SCIENCE_POOL', cat: 'Science', fields: ['title','desc','text'] },
    { var: 'WUDU_POOL', cat: 'Wudu', fields: ['title','desc','text'] },
    { var: 'SCHOLARS_POOL', cat: 'Scholars', fields: ['title','desc','name'] },
    { var: 'PATIENCE_POOL', cat: 'Patience', fields: ['title','desc','text'] },
    { var: 'WORK_POOL', cat: 'Work', fields: ['title','desc','text'] },
    { var: 'COMMUNITY_POOL', cat: 'Community', fields: ['title','desc','text'] },
    { var: 'ENVIRONMENT_POOL', cat: 'Environment', fields: ['title','desc','text'] },
    { var: 'TRAVEL_POOL', cat: 'Travel', fields: ['title','desc','text'] },
    { var: 'FIQH_POOL', cat: 'Fiqh', fields: ['title','desc','text'] },
    { var: 'ARABIC_POOL', cat: 'Arabic', fields: ['title','desc','text'] },
    { var: 'TAWAKKUL_POOL', cat: 'Tawakkul', fields: ['title','desc','text'] },
    { var: 'IKHLAS_POOL', cat: 'Ikhlas', fields: ['title','desc','text'] },
    { var: 'ZUHD_POOL', cat: 'Zuhd', fields: ['title','desc','text'] },
    { var: 'DAWAH_POOL', cat: "Da'wah", fields: ['title','desc','text'] },
    { var: 'CIVILISATION_POOL', cat: 'Civilisation', fields: ['title','desc','text'] },
    { var: 'BATTLES_POOL', cat: 'Battles', fields: ['title','desc','text'] },
    { var: 'JANNAH_POOL', cat: 'Jannah', fields: ['title','desc','text'] },
    { var: 'JAHANNAM_POOL', cat: 'Jahannam', fields: ['title','desc','text'] },
    { var: 'GRAVE_POOL', cat: 'Grave', fields: ['title','desc','text'] },
    { var: 'SIGNS_POOL', cat: 'Signs', fields: ['title','desc','text'] },
    { var: 'DREAMS_POOL', cat: 'Dreams', fields: ['title','desc','text'] },
    { var: 'PARENTING_POOL', cat: 'Parenting', fields: ['title','desc','text'] },
    { var: 'FOOD_POOL', cat: 'Food', fields: ['title','desc','text'] },
    { var: 'TIBB_POOL', cat: 'Tibb', fields: ['title','desc','text'] },
    { var: 'YOUTH_POOL', cat: 'Youth', fields: ['title','desc','text'] },
    { var: 'TECH_POOL', cat: 'Technology', fields: ['title','desc','text'] },
    { var: 'NEIGHBORS_POOL', cat: 'Neighbors', fields: ['title','desc','text'] },
  ];

  function searchAll(term) {
    if (!term || term.length < 2) return [];
    const results = [];
    for (const { var: varName, cat, fields } of SEARCH_POOLS) {
      const pool = typeof window[varName] !== 'undefined' ? window[varName] : [];
      for (const item of pool) {
        if (typeof item === 'string') {
          if (fuzzyMatch(term, item)) results.push({ text: item.slice(0, 100), section: cat, tab: fields[0] });
          continue;
        }
        for (const f of fields) {
          if (item[f] && fuzzyMatch(term, item[f])) {
            results.push({ text: (item.title || item.name || item[f]).slice(0, 100), section: cat, tab: fields[0] });
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
    if (!results.length) { box.innerHTML = `<div class="gs-item gs-empty">No results for "${term}"</div>`; box.classList.add('show'); return; }

    saveRecent(term);
    const recentHtml = _recent.length ? `<div class="gs-section">Recent</div>${_recent.map(r => `<div class="gs-item gs-recent" onclick="document.querySelector('.global-search').value='${r}';document.querySelector('.global-search').dispatchEvent(new Event('input'))">${iqIcon('clock')} ${r}</div>`).join('')}` : '';

    let html = recentHtml;
    const grouped = {};
    for (const r of results) { (grouped[r.section] = grouped[r.section] || []).push(r); }
    for (const [section, items] of Object.entries(grouped)) {
      html += `<div class="gs-section">${section}</div>`;
      for (const r of items) {
        html += `<div class="gs-item" onclick="App.activateTab('${r.tab}');document.getElementById('globalSearchResults').classList.remove('show');">${r.text}</div>`;
      }
    }
    box.innerHTML = html;
    box.classList.add('show');
  }

  function saveRecent(term) {
    _recent = _recent.filter(r => r !== term);
    _recent.unshift(term);
    if (_recent.length > 5) _recent = _recent.slice(0, 5);
  }

  window.initSearch = init;
})();
