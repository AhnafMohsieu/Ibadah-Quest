/* features/analytics/charts.js — Zero-dependency offline 2D Canvas chart suite
 * Replaces external Chart.js CDN completely so Analytics works 100% offline with 0 KB external download.
 */
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
    get primary() { return cssVar('--accent', '#07635d'); },
    get secondary() { return cssVar('--accent-light', '#0a7a72'); },
    get light() { return cssVar('--gold', '#8e6b1e'); },
    get accent() { return cssVar('--accent', '#07635d'); },
    get red() { return cssVar('--red', '#b42318'); },
    get bg() { return cssVar('--accent-bg', '#e1f2ed'); },
    get grid() { return cssVar('--border', '#c5dad2'); },
    get text() { return cssVar('--text2', '#385752'); },
    get white() { return cssVar('--text', '#0d2421'); }
  };

  const instances = {};

  function destroy(id) {
    if (instances[id]) {
      if (instances[id].destroy) instances[id].destroy();
      delete instances[id];
    }
  }

  function setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof canvas.getContext !== 'function') return null;
    const parent = canvas.parentElement;
    const w = Math.max(240, (parent && parent.clientWidth ? parent.clientWidth - 16 : 320));
    const h = Math.max(160, canvas.clientHeight || 190);
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { canvas, ctx, w, h };
  }

  function _isRtl() {
    return typeof document !== 'undefined' && document.documentElement && document.documentElement.dir === 'rtl';
  }
  function _ct(s) {
    return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(s) : s;
  }
  function _cn(v) {
    return (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function') ? window.iqFormatNum(v) : String(v);
  }

  function drawTitle(ctx, title, w) {
    if (!title) return 10;
    ctx.fillStyle = COLORS.primary;
    ctx.font = '700 13px "Hind Siliguri", system-ui, sans-serif';
    ctx.textBaseline = 'top';
    if (_isRtl()) {
      ctx.textAlign = 'right';
      ctx.fillText(_ct(title), w - 12, 8, w - 24);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(_ct(title), 12, 8, w - 24);
    }
    return 30;
  }

  function createLine(canvasId, labels, datasets, title) {
    destroy(canvasId);
    const env = setupCanvas(canvasId);
    if (!env) return null;
    const { ctx, w, h } = env;
    const top = drawTitle(ctx, title, w);
    const padL = 34, padR = 14, padB = 26;
    const pw = Math.max(40, w - padL - padR);
    const ph = Math.max(40, h - top - padB);
    const flatVals = [];
    (datasets || []).forEach(ds => (ds.data || []).forEach(v => flatVals.push(Number(v) || 0)));
    const maxV = Math.max(1, Math.max.apply(null, flatVals.length ? flatVals : [1]));

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = top + (ph * i) / 3;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + pw, y);
      ctx.stroke();
      ctx.fillStyle = COLORS.text;
      ctx.font = '11px "Hind Siliguri", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const val = Math.round(maxV * (1 - i / 3));
      ctx.fillText(_cn(val), padL - 6, y);
    }

    (datasets || []).forEach((ds, di) => {
      const pts = ds.data || [];
      if (!pts.length) return;
      const strokeCol = ds.borderColor || (di === 0 ? COLORS.primary : COLORS.light);
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      const coords = pts.map((v, idx) => {
        const x = pts.length === 1 ? padL + pw / 2 : padL + (idx / (pts.length - 1)) * pw;
        const y = top + ph - ((Number(v) || 0) / maxV) * ph;
        return { x, y };
      });
      coords.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
      coords.forEach(p => {
        ctx.fillStyle = strokeCol;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    if (labels && labels.length) {
      ctx.fillStyle = COLORS.text;
      ctx.font = '11px "Hind Siliguri", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const step = Math.max(1, Math.ceil(labels.length / 6));
      labels.forEach((lbl, idx) => {
        if (idx % step !== 0 && idx !== labels.length - 1) return;
        const x = labels.length === 1 ? padL + pw / 2 : padL + (idx / (labels.length - 1)) * pw;
        ctx.fillText(_cn(String(lbl)), x, top + ph + 6);
      });
    }

    instances[canvasId] = { type: 'line', labels, datasets };
    return instances[canvasId];
  }

  function createBar(canvasId, labels, data, color, title) {
    destroy(canvasId);
    const env = setupCanvas(canvasId);
    if (!env) return null;
    const { ctx, w, h } = env;
    const top = drawTitle(ctx, title, w);
    const padL = 32, padR = 12, padB = 26;
    const pw = Math.max(40, w - padL - padR);
    const ph = Math.max(40, h - top - padB);
    const vals = (data || []).map(v => Number(v) || 0);
    const maxV = Math.max(1, Math.max.apply(null, vals.length ? vals : [1]));
    const count = Math.max(1, vals.length);
    const slotW = pw / count;
    const barW = Math.max(4, Math.min(28, slotW * 0.62));

    ctx.strokeStyle = COLORS.grid;
    ctx.beginPath();
    ctx.moveTo(padL, top + ph);
    ctx.lineTo(padL + pw, top + ph);
    ctx.stroke();

    vals.forEach((v, i) => {
      const bh = (v / maxV) * ph;
      const x = padL + i * slotW + (slotW - barW) / 2;
      const y = top + ph - bh;
      ctx.fillStyle = color || COLORS.primary;
      ctx.fillRect(x, y, barW, Math.max(2, bh));
      if (labels && labels[i]) {
        ctx.fillStyle = COLORS.text;
        ctx.font = '11px "Hind Siliguri", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(_cn(String(labels[i])).slice(0, 8), x + barW / 2, top + ph + 6);
      }
    });

    instances[canvasId] = { type: 'bar', labels, data };
    return instances[canvasId];
  }

  function createHorizontalBar(canvasId, labels, data, color, title) {
    destroy(canvasId);
    const env = setupCanvas(canvasId);
    if (!env) return null;
    const { ctx, w, h } = env;
    const rtl = _isRtl();
    const top = drawTitle(ctx, title, w);
    const padL = rtl ? 20 : 88, padR = rtl ? 94 : 24, padB = 10;
    const pw = Math.max(40, w - padL - padR);
    const ph = Math.max(40, h - top - padB);
    const vals = (data || []).map(v => Number(v) || 0);
    const maxV = Math.max(1, Math.max.apply(null, vals.length ? vals : [1]));
    const count = Math.max(1, vals.length);
    const rowH = ph / count;
    const barH = Math.max(6, Math.min(18, rowH * 0.58));

    vals.forEach((v, i) => {
      const bw = Math.max(2, (v / maxV) * pw);
      const y = top + i * rowH + (rowH - barH) / 2;
      const lbl = _ct(String((labels && labels[i]) || '')).slice(0, 14);
      ctx.fillStyle = COLORS.text;
      ctx.font = '11px "Hind Siliguri", system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      if (rtl) {
        ctx.textAlign = 'right';
        ctx.fillText(lbl, w - 8, y + barH / 2, padR - 14);
        ctx.fillStyle = color || COLORS.primary;
        ctx.fillRect(w - padR - bw, y, bw, barH);
      } else {
        ctx.textAlign = 'right';
        ctx.fillText(lbl, padL - 8, y + barH / 2, padL - 12);
        ctx.fillStyle = color || COLORS.primary;
        ctx.fillRect(padL, y, bw, barH);
      }
    });

    instances[canvasId] = { type: 'hbar', labels, data };
    return instances[canvasId];
  }

  function createDoughnut(canvasId, labels, data, colors, title) {
    destroy(canvasId);
    const env = setupCanvas(canvasId);
    if (!env) return null;
    const { ctx, w, h } = env;
    const rtl = _isRtl();
    const top = drawTitle(ctx, title, w);
    const vals = (data || []).map(v => Math.max(0, Number(v) || 0));
    const sum = vals.reduce((a, b) => a + b, 0) || 1;
    const cx = rtl ? (w - Math.min(w * 0.34, 90)) : Math.min(w * 0.34, 90);
    const cy = top + (h - top) / 2;
    const r = Math.max(24, Math.min(Math.min(cx, w - cx) - 12, (h - top) * 0.38));

    let angle = -Math.PI / 2;
    const pal = colors && colors.length ? colors : [COLORS.primary, COLORS.light, COLORS.secondary, COLORS.grid];
    vals.forEach((v, idx) => {
      const slice = (v / sum) * Math.PI * 2;
      ctx.strokeStyle = pal[idx % pal.length];
      ctx.lineWidth = r * 0.38;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.72, angle, angle + slice);
      ctx.stroke();
      angle += slice;
    });

    ctx.font = '11px "Hind Siliguri", system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    (labels || []).slice(0, 5).forEach((lbl, idx) => {
      const y = top + 16 + idx * 20;
      const legText = _ct(String(lbl)) + ' (' + _cn(vals[idx] || 0) + ')';
      if (rtl) {
        const boxX = cx - r - 24;
        ctx.fillStyle = pal[idx % pal.length];
        ctx.fillRect(boxX, y - 5, 10, 10);
        ctx.fillStyle = COLORS.text;
        ctx.textAlign = 'right';
        ctx.fillText(legText, boxX - 6, y, Math.max(40, boxX - 18));
      } else {
        const legX = cx + r + 16;
        ctx.fillStyle = pal[idx % pal.length];
        ctx.fillRect(legX, y - 5, 10, 10);
        ctx.fillStyle = COLORS.text;
        ctx.textAlign = 'left';
        ctx.fillText(legText, legX + 16, y, Math.max(40, w - legX - 20));
      }
    });

    instances[canvasId] = { type: 'doughnut', labels, data };
    return instances[canvasId];
  }

  function createHeatmap(canvasId, data, title) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

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

    const accent = cssVar('--accent', '#07635d');
    const bgCanvas = cssVar('--bg', '#f2fbf8');
    const ramp = [
      mix(accent, bgCanvas, 0.12),
      mix(accent, bgCanvas, 0.28),
      mix(accent, bgCanvas, 0.48),
      mix(accent, bgCanvas, 0.68),
      mix(accent, bgCanvas, 0.85),
      accent
    ];

    const getColor = (val) => {
      if (val <= 0) return ramp[0];
      if (val === 1) return ramp[1];
      if (val === 2) return ramp[2];
      if (val === 3) return ramp[3];
      if (val === 4) return ramp[4];
      return ramp[5];
    };

    ctx.fillStyle = COLORS.text;
    ctx.font = '11px "Hind Siliguri", system-ui, sans-serif';
    ctx.textAlign = _isRtl() ? 'left' : 'right';
    ctx.textBaseline = 'middle';
    const dayOffsetX = _isRtl() ? (totalWidth - labelWidth + 6) : (labelWidth - 6);
    const cellOffsetX = _isRtl() ? 16 : labelWidth;
    [1, 3, 5].forEach(i => {
      const dayLbl = _ct(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]);
      ctx.fillText(dayLbl, dayOffsetX, topPadding + i * (cellSize + cellGap) + cellSize / 2);
    });

    weeks.forEach((week, wi) => {
      const colIdx = _isRtl() ? (weeks.length - 1 - wi) : wi;
      week.forEach((day, di) => {
        if (!day) return;
        const x = cellOffsetX + colIdx * (cellSize + cellGap);
        const y = topPadding + di * (cellSize + cellGap);
        ctx.fillStyle = getColor(day.value);
        ctx.beginPath();
        const r = Math.floor(cellSize * 0.3);
        if (ctx.roundRect) ctx.roundRect(x, y, cellSize, cellSize, r);
        else ctx.rect(x, y, cellSize, cellSize);
        ctx.fill();
      });
    });

    canvas.title = _ct(title || '');
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let found = null;
      weeks.forEach((week, wi) => {
        const colIdx = _isRtl() ? (weeks.length - 1 - wi) : wi;
        week.forEach((day, di) => {
          if (!day || !day.date) return;
          const x = cellOffsetX + colIdx * (cellSize + cellGap);
          const y = topPadding + di * (cellSize + cellGap);
          if (mx >= x && mx <= x + cellSize && my >= y && my <= y + cellSize) found = day;
        });
      });
      canvas.title = found && found.date ? `${found.date}: ${_cn(found.value)} ${_ct('prayers')}` : '';
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
