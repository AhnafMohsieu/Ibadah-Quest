(function() {
  function lookup() {
    var t = (typeof S !== 'undefined' && S && S.tafsirLookup) || {};
    return { surah: t.surah || 1, ayah: t.ayah || 1 };
  }
  function surahCount() {
    return (typeof QURAN_SURAHS !== 'undefined' && QURAN_SURAHS.length) || 114;
  }
  function ayahCount(n) {
    if (typeof QURAN_SURAHS !== 'undefined' && QURAN_SURAHS[n - 1]) return QURAN_SURAHS[n - 1].ay;
    return 286;
  }
  function saveLookup(surah, ayah) {
    try {
      if (typeof S === 'undefined' || !S) return;
      S.tafsirLookup = { surah: surah, ayah: ayah };
      if (typeof saveState === 'function') saveState();
    } catch (e) {}
  }
  function setBrowserSurah(n) {
    n = Math.max(1, Math.min(surahCount(), parseInt(n, 10) || 1));
    saveLookup(n, 1);
    renderTafsirBrowser();
  }
  function setBrowserAyah(v) {
    var cur = lookup();
    var max = ayahCount(cur.surah);
    var a = Math.max(1, Math.min(max, parseInt(v, 10) || 1));
    saveLookup(cur.surah, a);
    loadBrowserResult();
  }
  function setBrowserEdition(id) {
    try {
      if (typeof S === 'undefined' || !S) return;
      S.tafsirEdition = id;
      if (typeof saveState === 'function') saveState();
    } catch (e) {}
    renderTafsirBrowser();
  }
  function loadBrowserResult() {
    var box = (typeof document !== 'undefined') ? document.getElementById('tafsirBrowserResult') : null;
    if (!box) return;
    if (typeof TafsirLibrary === 'undefined') {
      box.innerHTML = '<div class="quran-loading">Tafsir library is still loading…</div>';
      return;
    }
    var cur = lookup();
    var ed = (typeof S !== 'undefined' && S && S.tafsirEdition) || 'ibnkathir';
    box.innerHTML = '<div class="quran-loading">Loading tafsir…</div>';
    TafsirLibrary.getTafsir(ed, cur.surah, cur.ayah).then(function(t) {
      var el = (typeof document !== 'undefined') ? document.getElementById('tafsirBrowserResult') : null;
      if (!el) return;
      var cur2 = lookup();
      if (cur2.surah !== cur.surah || cur2.ayah !== cur.ayah) return;
      var style = t.dir === 'rtl'
        ? 'dir="rtl" style="font-family:\'Amiri\',serif;font-size:1.05rem;line-height:2;color:var(--text);"'
        : 'style="font-size:0.92rem;line-height:1.8;color:var(--text);"';
      el.innerHTML = '<div ' + style + '>' + TafsirLibrary.sanitizeRichText(t.text) + '</div>';
    }).catch(function() {
      var el = (typeof document !== 'undefined') ? document.getElementById('tafsirBrowserResult') : null;
      if (!el) return;
      var offline = (typeof navigator !== 'undefined' && navigator && navigator.onLine === false);
      el.innerHTML = '<div class="quran-loading">' + (offline ? 'You are offline — tafsir needs connection once, then it is saved for offline use.' : 'Couldn&#39;t load tafsir — check connection.') + ' <button class="quran-retry-btn" onclick="window.retryBrowserTafsir()">Retry</button></div>';
    });
  }
  function retryBrowserTafsir() { loadBrowserResult(); }
  function renderTafsirBrowser() {
    var host = (typeof document !== 'undefined') ? document.getElementById('tafsirBrowser') : null;
    if (!host) return;
    if (typeof QURAN_SURAHS === 'undefined' || typeof TafsirLibrary === 'undefined') {
      host.innerHTML = '<div class="quran-loading">Tafsir library is still loading…</div>';
      return;
    }
    var cur = lookup();
    var ed = (typeof S !== 'undefined' && S && S.tafsirEdition) || 'ibnkathir';
    var opts = '';
    for (var i = 0; i < QURAN_SURAHS.length; i++) {
      var s = QURAN_SURAHS[i];
      opts += '<option value="' + s.n + '"' + (s.n === cur.surah ? ' selected' : '') + '>' + s.n + '. ' + s.en + '</option>';
    }
    var eds = '';
    TafsirLibrary.EDITIONS.forEach(function(e) {
      eds += '<button class="' + (ed === e.id ? 'active' : '') + '" onclick="window.setBrowserEdition(\'' + e.id + '\')">' + e.name + '</button>';
    });
    host.innerHTML = '<div class="tab-bar-quran" style="margin-bottom:10px;">'
      + '<select id="tafsirSurah" aria-label="Surah" onchange="window.setBrowserSurah(this.value)">' + opts + '</select>'
      + '<input id="tafsirAyah" type="number" min="1" max="' + ayahCount(cur.surah) + '" value="' + cur.ayah + '" aria-label="Ayah" onchange="window.setBrowserAyah(this.value)">'
      + eds + '</div><div id="tafsirBrowserResult"></div>';
    loadBrowserResult();
  }
  window.renderTafsirBrowser = renderTafsirBrowser;
  window.setBrowserSurah = setBrowserSurah;
  window.setBrowserAyah = setBrowserAyah;
  window.setBrowserEdition = setBrowserEdition;
  window.retryBrowserTafsir = retryBrowserTafsir;
})();
