// features/spiritual-growth/keys.js
// Paradise Keys — Collect keys to open gates of Jannah

(function() {
  const CAPTIONS = ["Each deed is a key to Paradise.","May Allah open the gates for you.","The keys multiply with sincerity.","Your collection grows — keep seeking.","Nearing the gates — persist.","The final keys — almost there.","You hold all the keys to Jannah."];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  const gold = '#D4AF37';
  const silver = '#C0C0C0';
  const lightGold = '#FFE97D';

  // Key counts per stage: 1, 2, 3, 5, 7, 9, 10
  const KEY_COUNTS = [1, 2, 3, 5, 7, 9, 10];

  function drawKey(x, y, angle, scale) {
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
    path += `<circle cx="${x}" cy="${y - bowR * scale}" r="${bowR * scale}" fill="none" stroke="${gold}" stroke-width="${1.5 * scale}"/>`;
    path += `<circle cx="${x}" cy="${y - bowR * scale}" r="${2 * scale}" fill="${gold}" opacity="0.5"/>`;

    // Shaft
    const shaftStart = rotate(0, 0);
    const shaftEnd = rotate(0, shaftLen);
    path += `<line x1="${shaftStart.x}" y1="${shaftStart.y}" x2="${shaftEnd.x}" y2="${shaftEnd.y}" stroke="${gold}" stroke-width="${2 * scale}"/>`;

    // Bit (teeth) - two notches
    const bitY1 = rotate(bitW, shaftLen - bitH * 2);
    const bitY2 = rotate(bitW, shaftLen - bitH);
    const bitY3 = rotate(0, shaftLen - bitH);
    path += `<polyline points="${shaftEnd.x},${shaftEnd.y} ${bitY1.x},${bitY1.y} ${bitY2.x},${bitY2.y} ${bitY3.x},${bitY3.y}" fill="none" stroke="${gold}" stroke-width="${1.5 * scale}"/>`;

    return path;
  }

  function keysSVG(stage, progress) {
    const keyCount = KEY_COUNTS[stage - 1] || 1;
    const isMaxStage = stage === 7;
    const cx = 60;
    const ringY = 22;
    const ringR = 18;

    // Ring
    let ring = `<circle cx="${cx}" cy="${ringY}" r="${ringR}" fill="none" stroke="${silver}" stroke-width="2.5"/>`;
    ring += `<circle cx="${cx}" cy="${ringY}" r="${ringR - 4}" fill="none" stroke="${silver}" stroke-width="0.8" opacity="0.4"/>`;

    // Calculate key positions around the ring
    const startAngle = 90; // bottom of ring
    const spread = 140; // degrees of spread
    const angleStep = spread / Math.max(1, keyCount - 1);

    let keys = '';
    for (let i = 0; i < keyCount; i++) {
      let angle;
      if (keyCount === 1) {
        angle = 180; // straight down
      } else {
        angle = startAngle - spread / 2 + i * angleStep;
      }

      const rad = angle * Math.PI / 180;
      const kx = cx + ringR * Math.cos(rad);
      const ky = ringY + ringR * Math.sin(rad);

      // Draw chain link from ring to key
      const chainLen = 10;
      const chainEndX = kx + chainLen * Math.cos(rad);
      const chainEndY = ky + chainLen * Math.sin(rad);

      keys += `<line x1="${kx}" y1="${ky}" x2="${chainEndX}" y2="${chainEndY}" stroke="${silver}" stroke-width="1"/>`;
      keys += drawKey(chainEndX, chainEndY, 0, 0.8);
    }

    // Stage 7 glow effect
    let glow = '';
    if (isMaxStage) {
      glow = `
        <circle cx="${cx}" cy="${ringY + 30}" r="50" fill="rgba(212,175,55,0.12)"/>
        <circle cx="${cx}" cy="${ringY + 30}" r="35" fill="rgba(255,233,125,0.08)"/>
        <circle cx="${cx}" cy="${ringY + 30}" r="20" fill="rgba(255,255,255,0.05)"/>`;
    }

    // Ring top hook
    const hook = `<path d="M${cx} ${ringY - ringR} Q${cx} ${ringY - ringR - 8} ${cx + 4} ${ringY - ringR - 8} Q${cx + 8} ${ringY - ringR - 8} ${cx + 8} ${ringY - ringR - 2}" fill="none" stroke="${silver}" stroke-width="1.5"/>`;

    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      ${glow}
      ${hook}
      ${ring}
      ${keys}
    </svg>`;
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
        <div class="spiritual-stage-name">${progress.icon} Paradise Keys <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
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
