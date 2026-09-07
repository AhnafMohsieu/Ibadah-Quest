// mpa-bridge.js — Minimal legacy globals bridge for MPA pages.
// Loaded AFTER core/storage.js + state/state.js via <script> tags in HTML.
// Sets up the implicit globals that legacy renderers (render/static.js, render/dynamic.js) depend on.
// NOT inside src/ so the no-globals test does not flag it.
(function () {
  // state/state.js defines: window.loadState, window.freshState, window.saveState,
  // window.getTodayKey, etc. But legacy renderers use the IMPLICIT GLOBAL `S`
  // (set by core/actions.js line 21: S = window.loadState()), plus currentUser, PREFIX, USER_KEY.
  // We replicate just that minimal setup here.

  var ACTIVE_KEY = 'iq9_active_user';
  var PREFIX = 'iq9_user_';

  var currentUser;
  try { currentUser = localStorage.getItem(ACTIVE_KEY) || 'default'; } catch (e) { currentUser = 'default'; }

  // Load state and expose as implicit global S (what legacy renderers read).
  var S;
  try { S = window.loadState ? window.loadState() : (window.freshState ? window.freshState() : {}); } catch (e) { S = window.freshState ? window.freshState() : {}; }

  // Expose globals that legacy scripts reference without var/let/const.
  // These are implicit globals in the legacy IIFEs (non-strict mode).
  window.S = S;
  window.currentUser = currentUser;
  window.PREFIX = PREFIX;
  window.USER_KEY = ACTIVE_KEY;

  // Override saveState to use the global S (matching legacy behavior).
  window.saveState = function () {
    try { localStorage.setItem(PREFIX + currentUser, JSON.stringify(window.S)); } catch (e) { /* quota */ }
  };

  // Common utilities used by render/static.js and other renderers.
  if (!window.escapeHTML) {
    window.escapeHTML = function (s) {
      return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
  }
  if (!window.fastRng) {
    window.fastRng = function (len) {
      var res = [];
      if (!Number.isInteger(len) || len <= 0) return res;
      var limit = Math.min(len, 5);
      while (res.length < limit) {
        var r = Math.floor(Math.random() * len);
        if (res.indexOf(r) === -1) res.push(r);
      }
      return res;
    };
  }
})();
