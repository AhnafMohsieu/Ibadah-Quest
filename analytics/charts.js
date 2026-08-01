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

    // Get the date range (last 365 days or whatever data covers)
    const today = new Date();
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364); // ~52 weeks

    // Build weeks array: each week is an array of 7 days [Sun..Sat]
    const weeks = [];
    let currentWeek = new Array(7).fill(null);
    const d = new Date(startDate);

    // Pad start to align to Sunday
    const startDay = d.getDay();
    for (let i = 0; i < startDay; i++) currentWeek[i] = { date: '', value: 0 };

    while (d <= endDate) {
      const dow = d.getDay();
      const dateStr = d.toISOString().slice(0, 10);
      const val = map[dateStr] || 0;
      currentWeek[dow] = { date: dateStr, value: val };

      if (dow === 6) { // Saturday = end of week
        weeks.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }
      d.setDate(d.getDate() + 1);
    }
    // Push remaining week
    if (currentWeek.some(w => w !== null)) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    // Now render on canvas
    const ctx = canvas.getContext('2d');
    const cellSize = 14;
    const cellGap = 3;
    const labelWidth = 36;
    const topPadding = 24;
    const bottomPadding = 8;

    const totalWidth = labelWidth + weeks.length * (cellSize + cellGap) + 20;
    const totalHeight = topPadding + 7 * (cellSize + cellGap) + bottomPadding;

    // Set canvas size
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    canvas.style.width = totalWidth + 'px';
    canvas.style.height = totalHeight + 'px';

    // Clear
    ctx.clearRect(0, 0, totalWidth, totalHeight);

    // Color scale (purple/pink like the image)
    const getColor = (val) => {
      if (val === 0) return '#1a1a2e';
      const colors = [
        '#2d1b4e',  // 1 - dark purple
        '#6b3fa0',  // 2 - medium purple
        '#a855f7',  // 3 - purple
        '#d946ef',  // 4 - pink
        '#f472b6'   // 5 - light pink
      ];
      return colors[Math.min(val, 5) - 1];
    };

    // Draw day labels
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [1, 3, 5].forEach(i => { // Mon, Wed, Fri
      ctx.fillText(dayLabels[i], labelWidth - 6, topPadding + i * (cellSize + cellGap) + cellSize / 2);
    });

    // Draw month labels
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
        if (day === null) return;
        const x = labelWidth + wi * (cellSize + cellGap);
        const y = topPadding + di * (cellSize + cellGap);

        ctx.fillStyle = getColor(day.value);
        ctx.beginPath();
        ctx.roundRect(x, y, cellSize, cellSize, 3);
        ctx.fill();
      });
    });

    // Store for tooltip
    instances[canvasId] = { weeks, cellSize, cellGap, labelWidth, topPadding, canvas };

    // Tooltip on hover
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
          if (mx >= x && mx <= x + cellSize && my >= y && my <= y + cellSize) {
            found = day;
          }
        });
      });

      canvas.title = found && found.date ? `${found.date}: ${found.value} prayers` : '';
    };

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
