// src/pages/library/entry.js
import '../../core/error-tap.js'; // FIRST import on every page
import { renderShell } from '../../shell/layout.js';
import { loadState } from '../../core/storage.js';
const S = loadState();
document.getElementById('shell').innerHTML = renderShell('library');
document.getElementById('page').innerHTML = `<section><h2>Library</h2><p>Bookmarks: ${S.bookmarks.length}</p></section>`;
