'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mirrors the shared-sandbox loader pattern from tests/app-registry.test.js and the
// hand-rolled element fakes from tests/daily-summary.test.js.
function loadModule(sandbox, relPath) {
  const code = fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: relPath });
}

function fakeEl(tag) {
  const el = {
    tagName: tag || 'div',
    innerHTML: '', textContent: '', value: '', style: {}, attrs: {}, _classes: [], listeners: {},
    classList: {
      add(c) { el._classes.push(c); },
      remove(c) { el._classes = el._classes.filter(x => x !== c); },
      toggle(c) { if (el._classes.includes(c)) el._classes = el._classes.filter(x => x !== c); else el._classes.push(c); },
      contains: (c) => el._classes.includes(c)
    },
    focus() {},
    click() { el.clicked = true; },
    appendChild(c) { return c; },
    setAttribute(k, v) { el.attrs[k] = v; },
    getAttribute(k) { return el.attrs[k]; },
    addEventListener(type, fn) { (el.listeners[type] = el.listeners[type] || []).push(fn); },
    removeEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => []
  };
  return el;
}

function makeSandbox(lsOverrides) {
  const els = {};
  const created = [];
  const sb = {
    window: {},
    console: { error() {}, warn() {}, log() {} },
    setTimeout, clearTimeout,
    Promise, Math, Date, JSON, Object, Array, Number, String, Boolean, RegExp, Error,
    localStorage: Object.assign({ getItem: () => null, setItem() {}, removeItem() {}, key: () => null, length: 0 }, lsOverrides),
    iqIcon: () => '', iqEmoji: () => '',
    playSound: () => {},
    today: () => '2026-08-26',
    normalizeState: (v) => v,
    saveState: () => { sb._saves++; },
    lvFrom: () => 1,
    PREFIX: 'iq9_user_',
    currentUser: 'default',
    NEW_POOLS: {},
    prompt: () => '',
    confirm: () => false,
    FileReader: function() { this.readAsText = () => {}; },
    location: { hash: '', href: 'http://localhost/' },
    history: { pushState() {}, replaceState() {}, state: null },
    navigator: { onLine: true },
    requestAnimationFrame: (cb) => setTimeout(cb, 0),
    _saves: 0, _toasts: [],
    _els: els, _created: created
  };
  sb.toast = function(icon, msg) { sb._toasts.push(String(msg)); };
  sb.document = {
    readyState: 'complete',
    activeElement: fakeEl(),
    body: fakeEl('body'),
    head: fakeEl('head'),
    getElementById(id) { if (!els[id]) els[id] = fakeEl(); return els[id]; },
    createElement(tag) { const e = fakeEl(tag); created.push(e); return e; },
    addEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => []
  };
  sb.window.addEventListener = () => {};
  return sb;
}

// Seed a recoveryOverlay whose querySelectorAll exposes the three action buttons.
function seedOverlayButtons(sb) {
  const btns = ['salvage', 'import', 'fresh'].map(a => {
    const b = fakeEl('button');
    b.attrs['data-action'] = a;
    return b;
  });
  const ov = fakeEl();
  ov.querySelectorAll = () => btns;
  sb._els.recoveryOverlay = ov;
  return { ov, btns };
}

// ── Pure routers (core/recovery.js) ──────────────────────────────────────────

test('boot routes to recovery when __iqCorruption is flagged', () => {
  const sb = makeSandbox();
  loadModule(sb, 'core/recovery.js');
  assert.strictEqual(sb.window.Recovery.decideBootRoute({ __iqCorruption: { user: 'default' } }), 'recovery');
});

test('boot routes normally when clean', () => {
  const sb = makeSandbox();
  loadModule(sb, 'core/recovery.js');
  assert.strictEqual(sb.window.Recovery.decideBootRoute({}), 'normal');
  assert.strictEqual(sb.window.Recovery.decideBootRoute(null), 'normal');
});

test('typed confirmation gate rejects wrong token, trims correct one', () => {
  const sb = makeSandbox();
  loadModule(sb, 'core/recovery.js');
  const R = sb.window.Recovery;
  assert.strictEqual(R.FRESH_TOKEN, 'RESET');
  assert.strictEqual(R.freshStartAllowed('reset'), false);
  assert.strictEqual(R.freshStartAllowed(' RESET '), true);
  assert.strictEqual(R.freshStartAllowed('', 'RESET'), false);
  assert.strictEqual(R.freshStartAllowed(null), false);
  assert.strictEqual(R.freshStartAllowed('RESET'), true);
});

test('buildRecoveryHtml renders three typed action buttons and source label', () => {
  const sb = makeSandbox();
  loadModule(sb, 'core/recovery.js');
  const html = sb.window.Recovery.buildRecoveryHtml({ user: 'u', source: 'idb' });
  assert.strictEqual((html.match(/data-action=/g) || []).length, 3);
  assert.ok(html.includes('data-action="salvage"'));
  assert.ok(html.includes('data-action="import"'));
  assert.ok(html.includes('data-action="fresh"'));
  assert.ok(html.includes('device storage (IndexedDB)'));
  assert.ok(html.includes('role="alertdialog"'));
  const htmlLs = sb.window.Recovery.buildRecoveryHtml({ user: 'u', source: 'ls' });
  assert.ok(htmlLs.includes('browser storage (localStorage)'));
  const htmlNoInfo = sb.window.Recovery.buildRecoveryHtml(null);
  assert.ok(htmlNoInfo.includes('browser storage (localStorage)'));
});

// ── HARDENING A: salvageInto must not match inherited keys (__proto__) ───────

test('salvageInto ignores __proto__ payloads via own-property check', () => {
  const sb = makeSandbox();
  loadModule(sb, 'core/recovery.js');
  const fresh = { xp: 0 };
  const out = sb.window.Recovery.salvageInto(fresh, '{"__proto__":{"polluted":1},"xp":5}');
  assert.strictEqual(out.xp, 5, 'own plain keys still salvage');
  assert.strictEqual(({}).polluted, undefined, 'Object.prototype must stay unpolluted');
  assert.strictEqual(Object.getPrototypeOf(fresh), Object.prototype, 'template prototype must be untouched');
});

// ── HARDENING B: JSON-null raw is junk, not silently fresh-bootable ──────────

test('loadLocalState treats literal "null" raw as corrupt junk (flagged, quarantined)', () => {
  const writes = [];
  const items = { 'iq9_user_default': 'null', 'iq9_active_user': 'default' };
  const sb = makeSandbox({
    getItem: (k) => (Object.prototype.hasOwnProperty.call(items, k) ? items[k] : null),
    setItem: (k, v) => writes.push([k, v])
  });
  loadModule(sb, 'core/recovery.js');
  loadModule(sb, 'state/state.js');
  const st = sb.window.loadState();
  assert.ok(st && typeof st === 'object', 'normalized fallback state still returned');
  assert.strictEqual(writes.filter(w => w[0] === 'iq9_user_default').length, 0, 'corrupt-flagged boot must not overwrite the main key');
  assert.strictEqual(writes.length, 1, 'the only write is the quarantine copy');
  assert.ok(writes[0][0].startsWith('iq9_quarantine_default_'), 'broken bytes quarantined under user-scoped key');
});

test('healthy raw still loads and persists normally (non-regression)', () => {
  const writes = [];
  const sb = makeSandbox({
    getItem: (k) => (k === 'iq9_user_default' ? '{"xp":5}' : null),
    setItem: (k, v) => writes.push([k, v])
  });
  loadModule(sb, 'core/recovery.js');
  loadModule(sb, 'state/state.js');
  sb.window.loadState();
  assert.strictEqual(sb.window.__iqCorruption, undefined, 'no corruption flag for valid JSON');
  assert.strictEqual(writes.length, 1, 'write-back happened exactly once');
});

// ── GATE 1: interception sits before finishInit in BOTH boot paths ───────────

test('source: init() and initAsync() intercept before finishInit()', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'core', 'actions.js'), 'utf8');
  for (const fnName of ['init()', 'initAsync()']) {
    const start = src.indexOf('function ' + fnName);
    assert.ok(start > -1, fnName + ' exists');
    const end = src.indexOf('\n  }\n', start);
    const body = src.slice(start, end > -1 ? end : undefined);
    const routeIdx = body.indexOf('decideBootRoute(window)');
    const finishIdx = body.indexOf('finishInit()');
    assert.ok(routeIdx > -1, fnName + ' checks the boot route');
    assert.ok(finishIdx > -1, fnName + ' calls finishInit');
    assert.ok(routeIdx < finishIdx, fnName + ' must intercept BEFORE finishInit (GATE 1)');
    assert.ok(body.includes('showRecoveryModal()'), fnName + ' routes to the recovery modal');
  }
});

// ── Cold-boot seasonal wiring pin ─────────────────────────────────────────────

test('postDeferHook retries seasonal sync (cold-boot wiring pin)', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'core', 'actions.js'), 'utf8');
  const hookIdx = src.indexOf('postDeferHook = function');
  assert.ok(hookIdx > -1, 'postDeferHook must exist');
  const hookEnd = src.indexOf('\n      };', hookIdx);
  assert.ok(hookEnd > -1, 'postDeferHook body must be closed');
  const body = src.slice(hookIdx, hookEnd);
  assert.ok(body.includes('syncSeason'), 'postDeferHook must retry syncSeason for cold boots');
});

// ── Integration: corrupted boot shows modal and blocks normal init ───────────

function corruptBootSandbox() {
  const sb = makeSandbox({
    getItem: (k) => (k === 'iq9_user_default' ? '{"corrupt' : null)
  });
  loadModule(sb, 'core/recovery.js');
  sb.window.loadState = function() {
    sb.window.__iqCorruption = { user: 'default', source: 'ls', quarantineKey: 'iq9_quarantine_default_x' };
    return { xp: 0, log: {} };
  };
  const { ov, btns } = seedOverlayButtons(sb);
  sb._ov = ov; sb._btns = btns;
  loadModule(sb, 'core/actions.js'); // storageReady unset -> synchronous init() runs at load
  return sb;
}

test('corrupted boot fills overlay with 3 buttons, shows it, and blocks finishInit', () => {
  const sb = corruptBootSandbox();
  const ov = sb._ov;
  assert.ok(ov.innerHTML.includes('data-action="salvage"'));
  assert.ok(ov.innerHTML.includes('data-action="import"'));
  assert.ok(ov.innerHTML.includes('data-action="fresh"'));
  assert.strictEqual(ov.style.display, 'flex');
  assert.ok(ov._classes.includes('show'), 'overlay visible (opacity via .show)');
  assert.strictEqual(ov.style.pointerEvents, 'auto', 'buttons clickable');
  for (const b of sb._btns) assert.ok((b.listeners.click || []).length >= 1, 'button wired: ' + b.attrs['data-action']);
  assert.strictEqual(typeof sb.window.App, 'undefined', 'normal boot blocked behind modal');
  assert.strictEqual(typeof sb.window.closeToastOverlay, 'undefined', 'finishInit did not run (GATE 1)');
  assert.ok(sb.window.__iqCorruption, 'flag held until user resolves');
});

test('clean boot completes and facade gains the three recovery methods', () => {
  const sb = makeSandbox({
    getItem: (k) => (k === 'iq9_user_default' ? '{"xp":5}' : null)
  });
  loadModule(sb, 'core/recovery.js');
  loadModule(sb, 'core/actions.js');
  const App = sb.window.App;
  assert.ok(App, 'clean boot reaches finishInit');
  assert.strictEqual(typeof App.recoverSalvage, 'function');
  assert.strictEqual(typeof App.recoverFresh, 'function');
  assert.strictEqual(typeof App.recoverImport, 'function');
  assert.strictEqual(typeof sb.window.showRecoveryModal, 'function');
  assert.strictEqual(typeof sb.window.continueBootAfterRecovery, 'function');
  assert.strictEqual(sb.window.__iqCorruption, undefined);
});

// ── Salvage path ──────────────────────────────────────────────────────────────

function suppressedBootSandbox(lsOverrides) {
  const sb = makeSandbox(lsOverrides);
  loadModule(sb, 'core/recovery.js');
  sb.window.freshState = () => ({ xp: 0, log: {} });
  sb.window.storageReady = new Promise(() => {}); // hold auto-boot; handlers invoked manually
  return sb;
}

test('recoverSalvage failure keeps modal state and never saves (GATE 2)', () => {
  const sb = suppressedBootSandbox({ getItem: (k) => (k === 'iq9_user_default' ? '{broken-json' : null) });
  loadModule(sb, 'core/actions.js');
  sb.window.__iqCorruption = { user: 'default', source: 'ls', quarantineKey: 'q1' };
  sb.window.showRecoveryModal();
  sb.window.recoverSalvage();
  assert.ok(sb._els.toastOverlay.innerHTML.includes('Could not recover'), 'graceful failure toast');
  assert.strictEqual(sb._saves, 0, 'no save on failed salvage');
  assert.ok(sb.window.__iqCorruption, 'flag intact — still on modal');
  assert.strictEqual(typeof sb.window.App, 'undefined', 'boot NOT continued after failure');
});

test('recoverSalvage success saves recovered state and continues boot', () => {
  const sb = suppressedBootSandbox({ getItem: (k) => (k === 'iq9_user_default' ? '{"xp":42}' : null) });
  loadModule(sb, 'core/actions.js');
  sb.window.__iqCorruption = { user: 'default', source: 'ls', quarantineKey: 'q1' };
  sb.window.showRecoveryModal();
  sb.window.recoverSalvage();
  assert.ok(sb._saves >= 1, 'recovered state persisted');
  assert.strictEqual(sb.window.__iqCorruption, null, 'flag cleared after resolution (GATE 2)');
  const ov = sb._els.recoveryOverlay;
  assert.strictEqual(ov.style.display, 'none');
  assert.strictEqual(ov.innerHTML, '');
  assert.ok(sb.window.App, 'full boot continued after salvage');
  assert.strictEqual(typeof sb.window.App.recoverFresh, 'function');
  assert.strictEqual(sb.S.xp, 42, 'recovered xp applied to live state');
});

test('recoverSalvage falls back to IndexedDB raw when source is idb', async () => {
  const sb = suppressedBootSandbox({ getItem: () => null });
  loadModule(sb, 'core/actions.js');
  sb.window.Storage = { getRaw: () => Promise.resolve('{"xp":9}') };
  sb.window.__iqCorruption = { user: 'default', source: 'idb', quarantineKey: 'q1' };
  sb.window.recoverSalvage();
  await new Promise(r => setTimeout(r, 20));
  assert.ok(sb._saves >= 1);
  assert.strictEqual(sb.window.__iqCorruption, null);
  assert.strictEqual(sb.S.xp, 9);
});

test('recoverSalvage survives idb getRaw rejection without saving', async () => {
  const sb = suppressedBootSandbox({ getItem: () => null });
  loadModule(sb, 'core/actions.js');
  sb.window.Storage = { getRaw: () => Promise.reject(new Error('boom')) };
  sb.window.__iqCorruption = { user: 'default', source: 'idb', quarantineKey: 'q1' };
  sb.window.recoverSalvage();
  await new Promise(r => setTimeout(r, 20));
  assert.strictEqual(sb._saves, 0);
  assert.ok(sb.window.__iqCorruption, 'stays on modal');
});

// ── Fresh start (typed confirmation) ─────────────────────────────────────────

test('recoverFresh rejects wrong token and erases nothing', () => {
  const sb = suppressedBootSandbox();
  loadModule(sb, 'core/actions.js');
  sb.window.__iqCorruption = { user: 'default', source: 'ls', quarantineKey: 'q1' };
  sb.prompt = () => 'reset';
  sb.window.recoverFresh();
  assert.ok(sb._els.toastOverlay.innerHTML.includes('did not match'), 'mismatch toast');
  assert.strictEqual(sb._saves, 0, 'nothing written on rejection');
  assert.ok(sb.window.__iqCorruption, 'still flagged — still on modal');
  assert.strictEqual(typeof sb.window.App, 'undefined', 'boot NOT continued');
});

test('recoverFresh with exact RESET token wipes to fresh state and continues boot', () => {
  const sb = suppressedBootSandbox();
  loadModule(sb, 'core/actions.js');
  sb.window.__iqCorruption = { user: 'default', source: 'ls', quarantineKey: 'q1' };
  sb.prompt = () => ' RESET ';
  sb.window.recoverFresh();
  assert.ok(sb._saves >= 1, 'fresh state persisted');
  assert.strictEqual(sb.window.__iqCorruption, null, 'flag cleared (GATE 2)');
  const ov = sb._els.recoveryOverlay;
  assert.strictEqual(ov.style.display, 'none');
  assert.ok(sb.window.App, 'boot continued after fresh start');
});

// ── Fix round 1 (I1): corrupt LS + healthy IDB must never be destructive ─────

test('salvage falls back to healthy IDB copy when LS salvage fails', async () => {
  const sb = suppressedBootSandbox({ getItem: (k) => (k === 'iq9_user_default' ? '{junk' : null) });
  loadModule(sb, 'core/actions.js');
  sb.window.__iqCorruption = { user: 'default', source: 'ls', quarantineKey: 'q1' };
  sb.window.showRecoveryModal();
  sb.window.Storage = { getRaw: () => Promise.resolve({ xp: 7, log: {} }) };
  sb.window.recoverSalvage();
  await new Promise(r => setTimeout(r, 20));
  assert.strictEqual(sb.S.xp, 7, 'healthy IDB copy recovered');
  assert.ok(sb._saves >= 1, 'recovered IDB state persisted');
  assert.strictEqual(sb.window.__iqCorruption, null, 'flag cleared after resolution (GATE 2)');
  assert.strictEqual(sb._els.recoveryOverlay.style.display, 'none', 'overlay closed');
  assert.ok(sb.window.App, 'boot continued via recovered IDB state');
});

test('salvage stays on modal when both LS and IDB copies are unusable', async () => {
  const sb = suppressedBootSandbox({ getItem: (k) => (k === 'iq9_user_default' ? '{junk' : null) });
  loadModule(sb, 'core/actions.js');
  sb.window.__iqCorruption = { user: 'default', source: 'ls', quarantineKey: 'q1' };
  sb.window.showRecoveryModal();
  sb.window.Storage = { getRaw: () => Promise.resolve({}) }; // junk: no log/xp/schemaVersion
  sb.window.recoverSalvage();
  await new Promise(r => setTimeout(r, 20));
  assert.strictEqual(sb._saves, 0, 'nothing saved from junk');
  assert.ok(sb.window.__iqCorruption, 'flag intact — still on modal');
  assert.strictEqual(typeof sb.window.App, 'undefined', 'boot NOT continued');
  assert.ok(sb._els.toastOverlay.innerHTML.includes('Could not recover'), 'failure toast shown');
});

test('recoverFresh recovers healthy IDB copy instead of wiping (prompt never shown)', async () => {
  const sb = suppressedBootSandbox();
  loadModule(sb, 'core/actions.js');
  sb.window.__iqCorruption = { user: 'default', source: 'ls', quarantineKey: 'q1' };
  let promptCalls = 0;
  sb.prompt = () => { promptCalls++; throw new Error('prompt must not be called'); };
  const baseFresh = sb.window.freshState;
  let freshCalls = 0;
  sb.window.freshState = () => { freshCalls++; return baseFresh(); };
  sb.window.Storage = { load: () => Promise.resolve({ xp: 11, log: {} }) };
  sb.window.recoverFresh();
  await new Promise(r => setTimeout(r, 20));
  assert.strictEqual(promptCalls, 0, 'typed confirmation never requested');
  assert.strictEqual(freshCalls, 0, 'freshState never generated — nothing wiped');
  assert.strictEqual(sb.S.xp, 11, 'IDB state recovered instead');
  assert.ok(sb._saves >= 1, 'recovered state persisted');
  assert.strictEqual(sb.window.__iqCorruption, null, 'flag cleared (GATE 2)');
  assert.ok(sb.window.App, 'boot continued with recovered data');
});

test('recoverFresh proceeds to typed prompt when IDB holds only junk', async () => {
  const sb = suppressedBootSandbox();
  loadModule(sb, 'core/actions.js');
  sb.window.__iqCorruption = { user: 'default', source: 'ls', quarantineKey: 'q1' };
  sb.prompt = () => 'RESET';
  sb.window.Storage = { load: () => Promise.resolve({}) }; // junk: no log/xp/schemaVersion
  sb.window.recoverFresh();
  await new Promise(r => setTimeout(r, 20));
  assert.strictEqual(sb.S.xp, 0, 'fresh state written after typed confirm');
  assert.ok(sb._saves >= 1);
  assert.strictEqual(sb.window.__iqCorruption, null);
  assert.ok(sb.window.App);
});

// ── Import backup path ────────────────────────────────────────────────────────

test('recoverImport clears flag BEFORE invoking importer and closes overlay', () => {
  const sb = suppressedBootSandbox();
  loadModule(sb, 'core/actions.js');
  sb.window.__iqCorruption = { user: 'default', source: 'ls', quarantineKey: 'q1' };
  const realCreate = sb.document.createElement;
  sb.document.createElement = (tag) => {
    const e = realCreate(tag);
    const origClick = e.click.bind(e);
    e.click = function() { sb._flagAtClick = sb.window.__iqCorruption; origClick(); };
    return e;
  };
  sb.window.recoverImport();
  assert.strictEqual(sb._flagAtClick, null, '__iqCorruption already null when importer takes over');
  assert.strictEqual(sb.window.__iqCorruption, null);
  const ov = sb._els.recoveryOverlay;
  assert.strictEqual(ov.style.display, 'none');
  assert.strictEqual(ov.innerHTML, '');
  assert.strictEqual(sb._created.length, 1, 'file picker input created');
  assert.strictEqual(sb._created[0].type, 'file');
  assert.ok(sb._created[0].clicked, 'picker opened');
});

// ── Button dispatch wiring ────────────────────────────────────────────────────

test('overlay buttons dispatch to salvage/fresh handlers', () => {
  const sb = suppressedBootSandbox({ getItem: (k) => (k === 'iq9_user_default' ? '{junk' : null) });
  const { btns } = seedOverlayButtons(sb);
  loadModule(sb, 'core/actions.js');
  sb.window.__iqCorruption = { user: 'default', source: 'ls', quarantineKey: 'q1' };
  sb.window.showRecoveryModal();
  const [, , freshBtn] = btns;
  sb.prompt = () => 'RESET';
  freshBtn.listeners.click[0]();
  assert.ok(sb.window.App, 'fresh button dispatched recoverFresh which continued boot');
});
