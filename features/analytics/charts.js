(function() {
  'use strict';

  function cssVar(name, fallback) {
    if (typeof document === 'undefined') return fallback;
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }

  function hexToRgb(hex) {
    if (!hex) return null;
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    if (isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function mix(fgHex, bgHex, t) {
    const f = hexToRgb(fgHex), b = hexToRgb(bgHex);
    if (!f || !b) return fgHex;
    const r = Math.round(f.r * t + b.r * (1 - t));
    const g = Math.round(f.g * t + b.g * (1 - t));
    const bl = Math.round(f.b * t + b.b * (1 - t));
    return '#' + [r, g, bl].map(c => c.toString(16).padStart(2, '0')).join('');
  }

  const COLORS = {
    get primary() { return cssVar('--gold-dark', '#e11d48'); },
    get secondary() { return cssVar('--gold', '#f43f5e'); },
    get light() { return cssVar('--gold-light', '#fb7185'); },
    get accent() { return cssVar('--gold', '#f43f5e'); },
    get red() { return cssVar('--red', '#dc2626'); },
    get bg() { try {const h=cssVar('--gold-light','#fb7185');const p=hexToRgb(h);if(p)return`rgba(${p.r},${p.g},${p.b},0.12)`;}catch(e){} return'rgba(251,113,133,0.15)'; },
    get grid() { return cssVar('--border', 'rgba(31,41,55,0.08)'); },
    get text() { return cssVar('--text2', '#6b7280'); },
    get white() { return cssVar('--text', '#1f2937'); }
  };

  const instances = {};

  function destroy(id) {
    if (instances[id]) { if (instances[id].destroy) instances[id].destroy(); delete instances[id]; }
  }

  function baseOptions(title) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: !!title, text: title, color: COLORS.accent, font: { family: "'Sora', sans-serif", size: 14, weight: '600' } }
      },
      scales: {
        x: { ticks: { color: COLORS.text, font: { size: 10 } }, grid: { color: COLORS.grid } },
        y: { ticks: { color: COLORS.text, font: { size: 10 } }, grid: { color: COLORS.grid } }
      }
    };
  }

  function createLine(canvasId, labels, datasets, title) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: datasets.map(ds => ({ ...ds, borderWidth: 2, pointRadius: 2, tension: 0.3, fill: ds.fill !== false })) },
      options: baseOptions(title)
    });
    return instances[canvasId];
  }

  function createBar(canvasId, labels, data, color, title) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ data, backgroundColor: color || COLORS.primary, borderRadius: 4 }] },
      options: baseOptions(title)
    });
    return instances[canvasId];
  }

  function createHorizontalBar(canvasId, labels, data, color, title) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const opts = baseOptions(title);
    const tmp = opts.scales.x;
    opts.scales.x = opts.scales.y;
    opts.scales.y = tmp;
    instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ data, backgroundColor: color || COLORS.primary, borderRadius: 4 }] },
      options: opts
    });
    return instances[canvasId];
  }

  function createDoughnut(canvasId, labels, data, colors, title) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'right', labels: { color: COLORS.text, font: { size: 11 }, padding: 8 } },
          title: { display: !!title, text: title, color: COLORS.accent, font: { family: "'Sora', sans-serif", size: 14, weight: '600' } }
        }
      }
    });
    return instances[canvasId];
  }

  function createHeatmap(canvasId, data, title) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const map = {};
    data.forEach(d => { map[d.date] = d.value; });

    const now = new Date();
    const endDate = new Date(now);
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 364);

    const weeks = [];
    let currentWeek = new Array(7).fill(null);
    const d = new Date(startDate);
    const startDay = d.getDay();
    for (let i = 0; i < startDay; i++) currentWeek[i] = { date: '', value: 0 };

    while (d <= endDate) {
      const dow = d.getDay();
      const dateStr = today(d);
      currentWeek[dow] = { date: dateStr, value: map[dateStr] || 0 };
      if (dow === 6) { weeks.push(currentWeek); currentWeek = new Array(7).fill(null); }
      d.setDate(d.getDate() + 1);
    }
    if (currentWeek.some(w => w !== null)) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    const container = canvas.parentElement;
    const containerWidth = container ? container.clientWidth - 32 : 600;
    const labelWidth = 32;
    const topPadding = 22;
    const cellGap = 4;
    const cellSize = Math.max(10, Math.min(16, Math.floor((containerWidth - labelWidth) / weeks.length) - cellGap));
    const totalWidth = labelWidth + weeks.length * (cellSize + cellGap) + 16;
    const totalHeight = topPadding + 7 * (cellSize + cellGap) + 8;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = totalWidth * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = totalWidth + 'px';
    canvas.style.height = totalHeight + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, totalWidth, totalHeight);

    const iramp = [cssVar('--gold-dark','#e11d48'),cssVar('--gold','#f43f5e'),cssVar('--gold-light','#fb7185')];
    const ramp = [mix(iramp[2],cssVar('--bg','#faf7f5'),0.12),mix(iramp[2],cssVar('--bg','#faf7f5'),0.28),mix(iramp[1],cssVar('--bg','#faf7f5'),0.46),mix(iramp[0],cssVar('--bg','#faf7f5'),0.66),iramp[1],iramp[0]];

    const getColor = (val) => {
      if (val <= 0) return ramp[0];
      if (val === 1) return ramp[1];
      if (val === 2) return ramp[2];
      if (val === 3) return ramp[3];
      if (val === 4) return ramp[4];
      return ramp[5];
    };

    ctx.fillStyle = COLORS.text;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [1, 3, 5].forEach(i => {
      ctx.fillText(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i], labelWidth - 6, topPadding + i * (cellSize + cellGap) + cellSize / 2);
    });

    weeks.forEach((week, wi) => {
      week.forEach((day, di) => {
        if (!day) return;
        const x = labelWidth + wi * (cellSize + cellGap);
        const y = topPadding + di * (cellSize + cellGap);
        ctx.fillStyle = getColor(day.value);
        ctx.beginPath();
        const r = Math.floor(cellSize * 0.3);
        if (ctx.roundRect) {
          ctx.roundRect(x, y, cellSize, cellSize, r);
        } else {
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + cellSize - r, y);
          ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + r);
          ctx.lineTo(x + cellSize, y + cellSize - r);
          ctx.quadraticCurveTo(x + cellSize, y + cellSize, x + cellSize - r, y + cellSize);
          ctx.lineTo(x + r, y + cellSize);
          ctx.quadraticCurveTo(x, y + cellSize, x, y + cellSize - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
        }
        ctx.fill();
      });
    });

    canvas.title = '';
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let found = null;
      weeks.forEach((week, wi) => {
        week.forEach((day, di) => {
          if (!day || !day.date) return;
          const x = labelWidth + wi * (cellSize + cellGap);
          const y = topPadding + di * (cellSize + cellGap);
          if (mx >= x && mx <= x + cellSize && my >= y && my <= y + cellSize) found = day;
        });
      });
      canvas.title = found && found.date ? `${found.date}: ${found.value} prayers` : '';
    };

    instances[canvasId] = { weeks };
    return instances[canvasId];
  }

  function destroyAll() {
    Object.keys(instances).forEach(destroy);
  }

  window.Charts = {
    createLine,
    createBar,
    createHorizontalBar,
    createDoughnut,
    createHeatmap,
    destroyAll,
    COLORS
  };
})();
