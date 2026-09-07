// src/pages/profile/entry.js
import '../../core/error-tap.js'; // FIRST import on every page
import { renderShell } from '../../shell/layout.js';
import { loadState } from '../../core/storage.js';
import { Backup } from '../../core/backup.js';
const S = loadState();
document.getElementById('shell').innerHTML = renderShell('profile');
document.getElementById('page').innerHTML = `<section><h2>Profile</h2><p>XP: ${S.xp} · Level ${S.lv}</p></section>`;
void Backup;
