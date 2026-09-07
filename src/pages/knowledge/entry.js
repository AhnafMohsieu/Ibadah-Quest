// src/pages/knowledge/entry.js
import '../../core/error-tap.js'; // FIRST import on every page
import { renderShell } from '../../shell/layout.js';
import { loadState } from '../../core/storage.js';
import { loadPool } from '../../data/pools.js';

const S = loadState();
document.getElementById('shell').innerHTML = renderShell('knowledge');
const main = document.getElementById('page');
main.innerHTML = '<p>Loading library…</p>';
const mod = await loadPool('quran-verses');
main.innerHTML = `<p>Verses loaded: ${Object.keys(mod).length} exports.</p>`;
void S;
