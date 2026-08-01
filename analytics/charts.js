(function() {
  'use strict';

  const COLORS = {
    primary: '#16a34a',
    secondary: '#22c55e',
    light: '#86efac',
    accent: '#f59e0b',
    red: '#ef4444',
    bg: 'rgba(22,163,74,0.15)',
    grid: 'rgba(255,255,255,0.08)',
    text: '#94a3b8',
    white: '#e2e8f0'
  };

  const instances = {};

  function destroy(id) {
    if (instances[id]) { instances[id].destroy(); delete instances[id]; }
  }

  function baseOptions(title) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: !!title, text: title, color: COLORS.white, font: { size: 14, weight: '600' } }
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
          title: { display: !!title, text: title, color: COLORS.white, font: { size: 14, weight: '600' } }
        }
      }
    });
    return instances[canvasId];
  }

  function createHeatmap(canvasId, data, title) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Build a lookup: date string -> value (0-5)
    const map = {};
    data.forEach(d => { map[d.date] = d.value; });

    // Get the date range (last 365 days)
    const today = new Date();
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    // Build weeks array
    const weeks = [];
    let currentWeek = new Array(7).fill(null);
    const d = new Date(startDate);
    const startDay = d.getDay();
    for (let i = 0; i < startDay; i++) currentWeek[i] = { date: '', value: 0 };

    while (d <= endDate) {
      const dow = d.getDay();
      const dateStr = d.toISOString().slice(0, 10);
      currentWeek[dow] = { date: dateStr, value: map[dateStr] || 0 };
      if (dow === 6) { weeks.push(currentWeek); currentWeek = new Array(7).fill(null); }
      d.setDate(d.getDate() + 1);
    }
    if (currentWeek.some(w => w !== null)) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    // Make responsive: calculate cell size based on container width
    const container = canvas.parentElement;
    const containerWidth = container ? container.clientWidth - 32 : 600;
    const labelWidth = 30;
    const topPadding = 20;
    const cellGap = 2;
    const cellSize = Math.max(8, Math.min(14, Math.floor((containerWidth - labelWidth) / weeks.length) - cellGap));
    const totalWidth = labelWidth + weeks.length * (cellSize + cellGap) + 10;
    const totalHeight = topPadding + 7 * (cellSize + cellGap) + 6;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = totalWidth * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = totalWidth + 'px';
    canvas.style.height = totalHeight + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, totalWidth, totalHeight);

    const getColor = (val) => {
      if (val === 0) return '#1a1a2e';
      return ['#2d1b4e', '#6b3fa0', '#a855f7', '#d946ef', '#f472b6'][Math.min(val, 5) - 1];
    };

    // Day labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [1, 3, 5].forEach(i => {
      ctx.fillText(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i], labelWidth - 4, topPadding + i * (cellSize + cellGap) + cellSize / 2);
    });

    // Month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstDay = week.find(w => w !== null);
      if (firstDay && firstDay.date) {
        const m = new Date(firstDay.date).getMonth();
        if (m !== lastMonth) {
          ctx.fillText(monthNames[m], labelWidth + wi * (cellSize + cellGap), topPadding - 4);
          lastMonth = m;
        }
      }
    });

    // Draw cells
    weeks.forEach((week, wi) => {
      week.forEach((day, di) => {
        if (!day) return;
        const x = labelWidth + wi * (cellSize + cellGap);
        const y = topPadding + di * (cellSize + cellGap);
        ctx.fillStyle = getColor(day.value);
        ctx.beginPath();
        ctx.roundRect(x, y, cellSize, cellSize, 2);
        ctx.fill();
      });
    });

    // Tooltip
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
