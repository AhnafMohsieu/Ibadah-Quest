(() => {
  const src = document.getElementById('dhikr-deeds-data');
  if (!src) return;
  const DEEDS = window.DEEDS || [];
  const lines = src.textContent.split('\n');
  let currentCat = "General";
  let counter = 1000;
  const existing = new Set(DEEDS.map(d=>d.name.toLowerCase().replace(/[.]/g,'').trim()));
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (line.indexOf('--') > 0 && parseInt(line)) {
      currentCat = line.split('--')[0].trim().replace(/^\d+[-.]?\s*/, '');
    } else {
      let name = line.replace(/[.]$/,'');
      if (!existing.has(name.toLowerCase().trim())) {
        let icon = '\u2728';
        if (line.includes('prayer') || line.includes('salah')) icon = '\uD83D\uDD4C';
        else if (name.toLowerCase().includes('quran')) icon = '\uD83D\uDCD6';
        else if (name.toLowerCase().includes('smile')) icon = '\uD83D\uDE0A';
        else if (name.toLowerCase().includes('charity')) icon = '\uD83E\uDE99';
        else if (name.toLowerCase().includes('fast')) icon = '\uD83C\uDF19';
        else if (name.toLowerCase().includes('parent') || name.includes('family')) icon = '\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66';
        DEEDS.push({ id:'dr'+counter, cat:currentCat, name:line, icon:icon, xp:15 });
        existing.add(name.toLowerCase());
        counter++;
      }
    }
  }
})();
