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
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const maxVal = 5;
    instances[canvasId] = new Chart(ctx, {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Prayers',
          data: data.map(d => ({ x: d.date, y: d.date.slice(0, 3) === 'Sun' ? 0 : d.date.slice(0, 3) === 'Mon' ? 1 : d.date.slice(0, 3) === 'Tue' ? 2 : d.date.slice(0, 3) === 'Wed' ? 3 : d.date.slice(0, 3) === 'Thu' ? 4 : d.date.slice(0, 3) === 'Fri' ? 5 : 6, v: d.value })),
          backgroundColor(ctx) {
            const v = ctx.dataset.data[ctx.dataIndex];
            if (!v || !v.v) return 'rgba(255,255,255,0.03)';
            const alpha = 0.2 + (v.v / maxVal) * 0.8;
            return `rgba(22,163,74,${alpha})`;
          },
          width: ({ chart }) => (chart.chartArea || {}).width / 14 - 2,
          height: ({ chart }) => (chart.chartArea || {}).height / 7 - 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: !!title, text: title, color: COLORS.white, font: { size: 14, weight: '600' } },
          tooltip: {
            callbacks: {
              title: (items) => items[0]?.raw?.x || '',
              label: (item) => `${item.raw.v} prayers`
            }
          }
        },
        scales: {
          x: { type: 'category', labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], ticks: { color: COLORS.text }, grid: { display: false } },
          y: { type: 'category', display: false }
        }
      }
    });
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
