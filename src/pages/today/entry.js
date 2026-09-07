// src/pages/today/entry.js
import '../../core/error-tap.js'; // FIRST import on every page — installs the error tap
import { renderShell } from '../../shell/layout.js';
import { loadState, saveState } from '../../core/storage.js';
import { getTodayKey } from '../../core/state.js';
import { renderToday, togglePrayer } from '../../render/prayers.js';

const S = loadState();
const dayKey = getTodayKey();
document.getElementById('shell').innerHTML = renderShell('today');
const main = document.getElementById('page');
function draw() { main.innerHTML = renderToday(S, dayKey); }
main.addEventListener('click', (e) => {
  const b = e.target.closest('[data-prayer]');
  if (!b) return;
  togglePrayer(S, dayKey, b.getAttribute('data-prayer'));
  saveState(undefined, S);
  draw();
});
draw();
