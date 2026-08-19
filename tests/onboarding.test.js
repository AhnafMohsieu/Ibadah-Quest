'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

function fakeDoc() {
  const els = {};
  return {
    getElementById(id) {
      if (!els[id]) els[id] = { innerHTML: '', style: {} };
      return els[id];
    }
  };
}

function loadSandbox(state, overrides) {
  const sandbox = Object.assign({
    window: {},
    console,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    S: state,
    saveState: () => {},
    toast: () => {},
    iqIcon: () => '',
    document: fakeDoc()
  }, overrides || {});
  const code = fs.readFileSync(path.join(__dirname, '..', 'features', 'onboarding.js'), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: 'features/onboarding.js' });
  for (const key of Object.keys(sandbox.window)) {
    sandbox[key] = sandbox.window[key];
  }
  return sandbox;
}

function overlayHtml(sandbox) {
  return sandbox.document.getElementById('onboardingOverlay').innerHTML;
}

// ── isOnboardingComplete tests ──

test('isOnboardingComplete returns false when onboarding has never started', () => {
  const s = loadSandbox({});
  assert.strictEqual(s.isOnboardingComplete(), false);
});

test('isOnboardingComplete returns false when onboarding is incomplete', () => {
  const s = loadSandbox({ onboarding: { step: 2, complete: false } });
  assert.strictEqual(s.isOnboardingComplete(), false);
});

test('isOnboardingComplete returns true after onboarding is completed', () => {
  const s = loadSandbox({ onboarding: { step: 3, complete: true } });
  assert.strictEqual(s.isOnboardingComplete(), true);
});

// ── startOnboarding tests ──

test('startOnboarding resets state and renders the first step', () => {
  const state = { onboarding: { step: 3, complete: true } };
  const s = loadSandbox(state);
  s.startOnboarding();
  assert.strictEqual(state.onboarding.step, 0);
  assert.strictEqual(state.onboarding.complete, false);
  const html = overlayHtml(s);
  assert.ok(html.includes('Welcome to Ibadah Quest'), 'first step must be the welcome screen');
  assert.ok(html.includes('onboarding-card'), 'overlay must render the onboarding card');
  const ov = s.document.getElementById('onboardingOverlay');
  assert.strictEqual(ov.style.display, 'flex', 'overlay must be shown');
});

test('startOnboarding creates onboarding state when missing', () => {
  const state = {};
  const s = loadSandbox(state);
  s.startOnboarding();
  assert.ok(state.onboarding, 'onboarding state must be initialized');
  assert.strictEqual(state.onboarding.step, 0);
  assert.strictEqual(state.onboarding.complete, false);
  assert.ok(overlayHtml(s).includes('Welcome to Ibadah Quest'));
});

test('startOnboarding persists state via saveState', () => {
  let saved = 0;
  const s = loadSandbox({}, { saveState: () => { saved++; } });
  s.startOnboarding();
  assert.ok(saved >= 1, 'saveState must be called when onboarding starts');
});

// ── nextOnboardingStep tests ──

test('nextOnboardingStep advances through the five steps', () => {
  const state = { onboarding: { step: 0, complete: false } };
  const s = loadSandbox(state);
  s.startOnboarding();
  assert.ok(overlayHtml(s).includes('Welcome to Ibadah Quest'));

  s.nextOnboardingStep();
  assert.strictEqual(state.onboarding.step, 1);
  assert.ok(overlayHtml(s).includes('Log Your First Prayer'), 'step 2 must be log first prayer');
  assert.ok(overlayHtml(s).includes('onboarding-dot', 'progress dots must render'));

  s.nextOnboardingStep();
  assert.strictEqual(state.onboarding.step, 2);
  assert.ok(overlayHtml(s).includes('Daily Quests'), 'step 3 must be daily quests');

  s.nextOnboardingStep();
  assert.strictEqual(state.onboarding.step, 3);
  assert.ok(overlayHtml(s).includes('Personalize'), 'step 4 must be personalize');

  s.nextOnboardingStep();
  assert.strictEqual(state.onboarding.step, 4);
  assert.ok(overlayHtml(s).includes('Begin Your Journey'), 'step 5 must be the start screen');
  assert.strictEqual(s.isOnboardingComplete(), false, 'not complete before final step');
});

test('nextOnboardingStep completes onboarding when advancing past the last step', () => {
  const state = { onboarding: { step: 4, complete: false } };
  const s = loadSandbox(state);
  s.nextOnboardingStep();
  assert.strictEqual(s.isOnboardingComplete(), true, 'advancing past the end must complete onboarding');
  assert.strictEqual(state.onboarding.complete, true);
});

test('full walkthrough from fresh state completes after the last step', () => {
  const state = {};
  const s = loadSandbox(state);
  assert.strictEqual(s.isOnboardingComplete(), false);
  s.startOnboarding();
  for (let i = 0; i < 4; i++) s.nextOnboardingStep();
  assert.strictEqual(s.isOnboardingComplete(), false, 'must not complete before the start screen');
  s.nextOnboardingStep();
  assert.strictEqual(s.isOnboardingComplete(), true, 'must complete after the start screen');
  assert.strictEqual(state.onboarding.complete, true);
});

// ── completeOnboarding tests ──

test('completeOnboarding sets the complete flag and hides the overlay', () => {
  const state = { onboarding: { step: 3, complete: false } };
  const s = loadSandbox(state);
  s.completeOnboarding();
  assert.strictEqual(state.onboarding.complete, true);
  assert.strictEqual(s.isOnboardingComplete(), true);
  const ov = s.document.getElementById('onboardingOverlay');
  assert.strictEqual(ov.style.display, 'none', 'overlay must be hidden');
});

test('completeOnboarding persists the complete flag via saveState', () => {
  let saved = 0;
  const state = { onboarding: { step: 3, complete: false } };
  const s = loadSandbox(state, { saveState: () => { saved++; } });
  s.completeOnboarding();
  assert.ok(saved >= 1, 'saveState must be called on completion');
});