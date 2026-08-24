(function() {
  function stripTags(s) {
    return String(s).replace(/<br\s*\/?>/gi, ' ').trim();
  }

  function normalizeRemoteEdition(engJson, araJson, meta) {
    meta = meta || {};
    const sections = (engJson && engJson.metadata && engJson.metadata.sections) || {};
    const araMap = {};
    ((araJson && araJson.hadiths) || []).forEach(h => {
      if (!h) return;
      const ref = h.reference || {};
      if (ref.book != null && ref.hadith != null) araMap[ref.book + ':' + ref.hadith] = h.text;
      if (h.arabicnumber != null) araMap['a' + h.arabicnumber] = h.text;
    });
    const books = {};
    const order = [];
    ((engJson && engJson.hadiths) || []).forEach(h => {
      const ref = h.reference || {};
      const b = ref.book != null ? ref.book : 1;
      const hd = ref.hadith != null ? ref.hadith : h.hadithnumber;
      if (!books[b]) {
        books[b] = { id: b, name: sections[String(b)] || ('Book ' + b), hadiths: [] };
        order.push(b);
      }
      const arabic = araMap[b + ':' + hd] != null ? araMap[b + ':' + hd] : (h.arabicnumber != null ? (araMap['a' + h.arabicnumber] != null ? araMap['a' + h.arabicnumber] : null) : null);
      books[b].hadiths.push({
        n: Number(h.hadithnumber) || hd,
        t: h.text || '',
        a: typeof arabic === 'string' ? stripTags(arabic) : null,
        b: b,
        h: hd
      });
    });
    order.sort((x, y) => x - y);
    return {
      id: meta.id,
      name: meta.name || '',
      desc: meta.desc || '',
      remote: true,
      books: order.map(k => books[k])
    };
  }

  window.HadithNormalize = { normalizeRemoteEdition: normalizeRemoteEdition };
})();
