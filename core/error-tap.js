/**
 * Global error tap — makes otherwise-silent runtime errors loud.
 *
 * Registers `window.onerror` + `unhandledrejection` early (loaded near the top
 * of <body>). Every error is recorded, logged to the console, and surfaced once
 * per session via a non-intrusive toast as soon as `toast`/`iqIcon` exist.
 *
 * Exposed as `window.__iqErrorTap` ({ errors, install, onGlobalError,
 * onUnhandledRejection }) for diagnostics and tests.
 */
(function () {
  var MAX_RECORDS = 25;
  var errors = [];
  var toastShown = false;

  function record(rec) {
    errors.push(rec);
    if (errors.length > MAX_RECORDS) errors.shift();
  }

  function messageOf(msg, err) {
    if (err && typeof err === 'object' && err.message) return String(err.message);
    if (msg === '' || msg == null) return 'Unknown error';
    return String(msg);
  }

  function showToastOnce() {
    if (toastShown) return;
    toastShown = true;
    try {
      if (typeof window !== 'undefined' && typeof window.toast === 'function') {
        var icon = (typeof window.iqIcon === 'function') ? window.iqIcon('alert-triangle') : '';
        window.toast(icon, 'Something went wrong — details are in the browser console.', false, 6000);
      }
    } catch (ignore) {
      /* toast is best-effort only */
    }
  }

  function onGlobalError(msg, source, lineno, colno, error) {
    var rec = {
      message: messageOf(msg, error),
      source: source || '',
      line: lineno || null,
      column: colno || null,
      isErrorObj: !!error,
      time: Date.now()
    };
    record(rec);
    try {
      console.error('[IQQuest] Uncaught error:', rec.message, source, lineno, colno, error || '');
    } catch (ignore) {}
    showToastOnce();
    return false; // allow the browser's default handling to continue
  }

  function onUnhandledRejection(ev) {
    var reason = ev && typeof ev.reason !== 'undefined' ? ev.reason : ev;
    var rec = {
      message: 'Unhandled rejection: ' + messageOf('', reason),
      source: 'unhandledrejection',
      line: null,
      column: null,
      isErrorObj: !!(reason && typeof reason === 'object'),
      time: Date.now()
    };
    record(rec);
    try {
      console.error('[IQQuest] Unhandled rejection:', reason || '');
    } catch (ignore) {}
    showToastOnce();
  }

  function install() {
    if (window.__iqErrorTapInstalled) return;
    window.__iqErrorTapInstalled = true;
    window.onerror = onGlobalError;
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('unhandledrejection', onUnhandledRejection);
    }
  }

  window.__iqErrorTap = {
    errors: errors,
    install: install,
    onGlobalError: onGlobalError,
    onUnhandledRejection: onUnhandledRejection,
    _debug: { setToastShown: function (v) { toastShown = !!v; } }
  };

  try { install(); } catch (ignore) { /* installation failure is non-fatal */ }
})();