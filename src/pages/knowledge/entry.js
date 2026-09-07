// src/pages/knowledge/entry.js
import '../../core/error-tap.js'; // FIRST import on every page
import { renderShell } from '../../shell/layout.js';
import { loadState } from '../../core/storage.js';
import { loadPool } from '../../data/pools.js';

const S = loadState();
document.getElementById('shell').innerHTML = renderShell('knowledge');
const main = document.getElementById('page');
main.innerHTML = '<p>Loading library…</p>';
try {
  const data = await loadPool('quran-verses');
  const count = Array.isArray(data) ? data.length : Object.keys(data || {}).length;
  main.innerHTML = `<p>Verses loaded: ${count}.</p>`;
} catch (err) {
  main.innerHTML = `<p>Library failed to load. ${String((err && err.message) || err)}</p>`;
}
void S;
