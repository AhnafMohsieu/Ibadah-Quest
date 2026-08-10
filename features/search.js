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

  function searchAll(term) {
    if (!term || term.length < 2) return [];
    const results = [];
    const pools = [
      { name:'Duas', pool: typeof DUA_POOL !== 'undefined' ? DUA_POOL : [], tab:'duas', fields:['english','desc','text','title'] },
      { name:'Hadith', pool: typeof HADITHS_POOL !== 'undefined' ? HADITHS_POOL : [], tab:'hadith', fields:['text','desc','english','source'] },
      { name:'Names of Allah', pool: typeof NAMES_POOL !== 'undefined' ? NAMES_POOL : [], tab:'allah_names', fields:['name','english','desc'] },
      { name:'Inspirations', pool: typeof INSPIRATIONS_POOL !== 'undefined' ? INSPIRATIONS_POOL : [], tab:'inspirations', fields:['text','desc','english'] },
      { name:'Stories', pool: typeof STORIES_POOL !== 'undefined' ? STORIES_POOL : [], tab:'stories', fields:['title','desc','text','english'] },
      { name:'Dhikr', pool: typeof DHIKR_POOL !== 'undefined' ? DHIKR_POOL : [], tab:'dhikr', fields:['english','desc','text','roman'] },
      { name:'Heart', pool: typeof HEART_POOL !== 'undefined' ? HEART_POOL : [], tab:'heart', fields:['title','desc','text','english'] },
      { name:'Sins', pool: typeof SINS_POOL !== 'undefined' ? SINS_POOL : [], tab:'sins', fields:['title','desc','text'] },
      { name:'Finance', pool: typeof FINANCE_POOL !== 'undefined' ? FINANCE_POOL : [], tab:'finance', fields:['title','desc'] },
      { name:'Family', pool: typeof FAMILY_POOL !== 'undefined' ? FAMILY_POOL : [], tab:'family', fields:['title','desc','text'] }
    ];

    for (const { name, pool, tab, fields } of pools) {
      for (const item of pool) {
        if (typeof item === 'string') {
          if (fuzzyMatch(term, item)) results.push({ text: item.slice(0, 100), section: name, tab });
          continue;
        }
        for (const f of fields) {
          if (item[f] && fuzzyMatch(term, item[f])) {
            results.push({ text: (item.title || item.name || item[f]).slice(0, 100), section: name, tab });
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
