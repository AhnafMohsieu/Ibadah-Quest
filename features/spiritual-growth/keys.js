// features/spiritual-growth/keys.js
// Paradise Keys — Collect keys to open gates of Jannah

(function() {
  const CAPTIONS = ["Each deed is a key to Paradise.","May Allah open the gates for you.","The keys multiply with sincerity.","Your collection grows — keep seeking.","Nearing the gates — persist.","The final keys — almost there.","You hold all the keys to Jannah."];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  const gold = 'var(--gold)';
  const silver = '#C0C0C0';
  const lightGold = 'var(--gold-light)';

  // Key counts per stage: 1, 2, 3, 5, 7, 9, 10
  const KEY_COUNTS = [1, 2, 3, 5, 7, 9, 10];

  function drawKey(x, y, angle, scale, stroke) {
    const rad = angle * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    function rotate(px, py) {
      return {
        x: x + (px * cos - py * sin) * scale,
        y: y + (px * sin + py * cos) * scale
      };
    }

    // Key bow (round top)
    const bowR = 6;
    // Key shaft
    const shaftLen = 30;
    // Key bit (teeth)
    const bitW = 5;
    const bitH = 3;

    const top = rotate(0, -bowR);
    const bottom = rotate(0, shaftLen);

    // Build key path
    let path = '';

    // Bow (circle at top)
    path += `<circle cx="${x}" cy="${y - bowR * scale}" r="${bowR * scale}" fill="none" stroke="${stroke}" stroke-width="${1.5 * scale}"/>`;
    path += `<circle cx="${x}" cy="${y - bowR * scale}" r="${2 * scale}" fill="${gold}" opacity="0.5"/>`;

    // Shaft
    const shaftStart = rotate(0, 0);
    const shaftEnd = rotate(0, shaftLen);
    path += `<line x1="${shaftStart.x}" y1="${shaftStart.y}" x2="${shaftEnd.x}" y2="${shaftEnd.y}" stroke="${stroke}" stroke-width="${2 * scale}"/>`;

    // Bit (teeth) - two notches
    const bitY1 = rotate(bitW, shaftLen - bitH * 2);
    const bitY2 = rotate(bitW, shaftLen - bitH);
    const bitY3 = rotate(0, shaftLen - bitH);
    path += `<polyline points="${shaftEnd.x},${shaftEnd.y} ${bitY1.x},${bitY1.y} ${bitY2.x},${bitY2.y} ${bitY3.x},${bitY3.y}" fill="none" stroke="${stroke}" stroke-width="${1.5 * scale}"/>`;

    return path;
  }

  function keysSVG(stage, progress) {
    const count = KEY_COUNTS[Math.min(stage, 7) - 1];
    const cols = {
      1: '#9CA3AF', 2: '#CD853F', 3: '#B87333',
      4: '#6B7280', 5: '#C0C0C0', 6: '#FFD700', 7: '#FFF3B0'
    };
    const col = cols[stage];
    let h = `<rect width="120" height="132" fill="var(--card-bg)" rx="10"/>`;
    const spread = Math.max(0, count - 1);
    for (let i = 0; i < count; i++) {
      const t = spread === 0 ? 0.5 : i / spread;
      const x = 30 + t * 60;
      const y = 72 - Math.sin(t * Math.PI) * 20;
      const angle = -30 + t * 60;
      h += drawKey(x, y, angle, 1, col);
    }
    if (stage === 7) {
      h += `<circle cx="60" cy="70" r="50" fill="none" stroke="var(--gold)" stroke-width="2" opacity="0.4"/>`;
      h += `<path d="M84 18 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--gold)" opacity="0.9"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 132">${h}</svg>`;
  }

  function renderKeys() {
    const el = document.getElementById('keysArea');
    if (!el || !SpiritualGrowth.isVisible('keys')) {
      if (el) el.innerHTML = '';
      return;
    }

    const progress = SpiritualGrowth.getProgress('keys');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP`
      : 'All gates of Jannah are open to you.';
    const pct = Math.round(progress.progress * 100);

    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${keysSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${SpiritualGrowth.FEATURE_ICONS.keys} Paradise Keys <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderKeys = renderKeys;
})();
