// src/core/error-tap.js
// ESM port of core/error-tap.js behavior: onerror + unhandledrejection,
// 25-entry buffer, one toast per session. Must be the FIRST import in every
// page entry. ESM-safe: reads the global window object via a local alias for
// addEventListener only, never writes window.* (the no-globals gate forbids
// it), and import is a no-op in Node.
const MAX_RECORDS = 25;
const _buf = [];
let _toastShown = false;

export function getErrorBuffer() { return _buf; }

function win() {
  return (typeof window !== 'undefined') ? window : undefined;
}

function record(rec) {
  _buf.push(rec);
  if (_buf.length > MAX_RECORDS) _buf.shift();
}

function messageOf(msg, err) {
  if (err && typeof err === 'object' && err.message) return String(err.message);
  if (msg === '' || msg == null) return 'Unknown error';
  return String(msg);
}

function showToastOnce() {
  if (_toastShown) return;
  _toastShown = true;
  try {
    const w = win();
    if (w && typeof w.toast === 'function') {
      const icon = (typeof w.iqIcon === 'function') ? w.iqIcon('alert-triangle') : '';
      w.toast(icon, 'Something went wrong — details are in the browser console.', false, 6000);
    }
  } catch (ignore) {
    /* toast is best-effort only */
  }
}

function onGlobalError(msg, source, lineno, colno, error) {
  const rec = {
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
  return false;
}

function onUnhandledRejection(ev) {
  const reason = ev && typeof ev.reason !== 'undefined' ? ev.reason : ev;
  const rec = {
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

export function installErrorTap() {
  if (installErrorTap._done) return;
  installErrorTap._done = true;
  const w = win();
  if (!w || typeof w.addEventListener !== 'function') return;
  w.addEventListener('error', (e) => {
    onGlobalError(e.message, e.filename, e.lineno, e.colno, e.error);
  });
  w.addEventListener('unhandledrejection', onUnhandledRejection);
}

// Auto-install in browsers; Node imports stay side-effect-free.
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') installErrorTap();
