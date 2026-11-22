const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

// Setup mock browser environment
function createMockEnv() {
  const store = {};
  const sessionStore = {};
  const mockStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
  const mockSessionStorage = {
    getItem: (k) => (k in sessionStore ? sessionStore[k] : null),
    setItem: (k, v) => { sessionStore[k] = String(v); },
    removeItem: (k) => { delete sessionStore[k]; },
    clear: () => { Object.keys(sessionStore).forEach(k => delete sessionStore[k]); }
  };

  const context = {
    console,
    localStorage: mockStorage,
    sessionStorage: mockSessionStorage,
    window: {},
    document: {
      getElementById: () => null,
      createElement: () => ({ style: {} })
    },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    currentUser: 'testuser'
  };
  context.window = context;

  const code = fs.readFileSync(path.join(__dirname, '..', 'features', 'auth.js'), 'utf8');
  vm.runInNewContext(code, context);
  return { context, Auth: context.Auth };
}

test('Auth: sha256 matches node crypto sha256', () => {
  const { Auth } = createMockEnv();
  const input = 'bismillah_1234_test_pin';
  const expected = crypto.createHash('sha256').update(input).digest('hex');
  assert.equal(Auth.sha256(input), expected);
});

test('Auth: isLocked returns false when no PIN configured', () => {
  const { Auth } = createMockEnv();
  assert.equal(Auth.isLocked('testuser'), false);
});

test('Auth: setPin saves PIN and unlocks session', () => {
  const { Auth } = createMockEnv();
  const res = Auth.setPin('testuser', '1234');
  assert.equal(res.success, true);
  assert.equal(Auth.isLocked('testuser'), false);
});

test('Auth: setPin rejects PIN shorter than 4 digits', () => {
  const { Auth } = createMockEnv();
  const res = Auth.setPin('testuser', '12');
  assert.equal(res.success, false);
  assert.match(res.error, /4 and 8 digits/);
});

test('Auth: isLocked returns true after locking session', () => {
  const { Auth } = createMockEnv();
  Auth.setPin('testuser', '1234');
  Auth.lockUser('testuser');
  assert.equal(Auth.isLocked('testuser'), true);
});

test('Auth: verifyPin unlocks with correct PIN', () => {
  const { Auth } = createMockEnv();
  Auth.setPin('testuser', '1234');
  Auth.lockUser('testuser');
  assert.equal(Auth.isLocked('testuser'), true);

  const res = Auth.verifyPin('testuser', '1234');
  assert.equal(res.success, true);
  assert.equal(Auth.isLocked('testuser'), false);
});

test('Auth: verifyPin fails with incorrect PIN and decrements attempts', () => {
  const { Auth } = createMockEnv();
  Auth.setPin('testuser', '1234');
  Auth.lockUser('testuser');

  const res = Auth.verifyPin('testuser', '9999');
  assert.equal(res.success, false);
  assert.equal(res.attemptsLeft, 4);
});

test('Auth: brute force lockout triggers after 5 failed attempts', () => {
  const { Auth } = createMockEnv();
  Auth.setPin('testuser', '1234');
  Auth.lockUser('testuser');

  for (let i = 0; i < 4; i++) {
    const r = Auth.verifyPin('testuser', '0000');
    assert.equal(r.success, false);
    assert.equal(r.lockout, false);
  }

  // 5th failed attempt triggers lockout
  const finalAttempt = Auth.verifyPin('testuser', '0000');
  assert.equal(finalAttempt.success, false);
  assert.equal(finalAttempt.lockout, true);
  assert.ok(finalAttempt.remainingSec > 0);

  // Subsequent attempt while locked out is rejected immediately
  const duringLockout = Auth.verifyPin('testuser', '1234');
  assert.equal(duringLockout.success, false);
  assert.equal(duringLockout.lockout, true);
});

test('Auth: removePin removes PIN with correct current PIN', () => {
  const { Auth } = createMockEnv();
  Auth.setPin('testuser', '1234');
  const res = Auth.removePin('testuser', '1234');
  assert.equal(res.success, true);
  assert.equal(Auth.isLocked('testuser'), false);
});
