// src/pages/ibadah/entry.js
import '../../core/error-tap.js'; // FIRST import on every page
import { renderShell } from '../../shell/layout.js';
import { loadState, saveState } from '../../core/storage.js';

const S = loadState();
document.getElementById('shell').innerHTML = renderShell('ibadah');
document.getElementById('page').innerHTML = `<section><h2>Ibadah</h2><p>XP: ${S.xp}</p></section>`;
void saveState;
