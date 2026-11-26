(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════
  // AUTH & SECURITY MODULE (features/auth.js)
  // ═══════════════════════════════════════════════════════

  const PROFILES_KEY = 'iq_profiles';
  const SEC_PREFIX = 'iq_sec_';
  const SESSION_UNLOCKED_PREFIX = 'iq_unlocked_';
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_MS = 30000; // 30 seconds

  // Pure JavaScript SHA-256 implementation (works in any environment)
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;
    var result = '';
    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;
    var hash = [];
    var k = [];
    var primeCounter = 0;
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength | 0);
    for (j = 0; j < words[lengthProperty];) {
      var w = words.slice(j, j += 16);
      var oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        var s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        var ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        var maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        var temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
        var temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }

  function generateSalt() {
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        const arr = new Uint8Array(16);
        window.crypto.getRandomValues(arr);
        return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch(e) {}
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  function getProfiles() {
    try {
      const stored = localStorage.getItem(PROFILES_KEY);
      const list = stored ? JSON.parse(stored) : [];
      if (!list.includes('default')) list.unshift('default');
      return Array.from(new Set(list));
    } catch(e) {
      return ['default'];
    }
  }

  function saveProfiles(list) {
    try {
      const unique = Array.from(new Set(list));
      localStorage.setItem(PROFILES_KEY, JSON.stringify(unique));
    } catch(e) {}
  }

  function getCredentials(user) {
    try {
      const raw = localStorage.getItem(SEC_PREFIX + user);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return { hasPin: false, salt: '', hash: '', failedAttempts: 0, lockoutUntil: 0 };
  }

  function saveCredentials(user, cred) {
    try {
      localStorage.setItem(SEC_PREFIX + user, JSON.stringify(cred));
      const profiles = getProfiles();
      if (!profiles.includes(user)) {
        profiles.push(user);
        saveProfiles(profiles);
      }
    } catch(e) {}
  }

  function isSessionUnlocked(user) {
    try {
      return sessionStorage.getItem(SESSION_UNLOCKED_PREFIX + user) === '1';
    } catch(e) {
      return false;
    }
  }

  function setSessionUnlocked(user, unlocked) {
    try {
      if (unlocked) {
        sessionStorage.setItem(SESSION_UNLOCKED_PREFIX + user, '1');
      } else {
        sessionStorage.removeItem(SESSION_UNLOCKED_PREFIX + user);
      }
    } catch(e) {}
  }

  function isLocked(user) {
    const target = user || (typeof currentUser !== 'undefined' ? currentUser : 'default');
    const cred = getCredentials(target);
    if (!cred.hasPin) return false;
    return !isSessionUnlocked(target);
  }

  function getLockoutRemaining(user) {
    const cred = getCredentials(user);
    if (!cred.lockoutUntil) return 0;
    const remaining = Math.ceil((cred.lockoutUntil - Date.now()) / 1000);
    if (remaining <= 0) {
      cred.failedAttempts = 0;
      cred.lockoutUntil = 0;
      saveCredentials(user, cred);
      return 0;
    }
    return remaining;
  }

  function verifyPin(user, pin) {
    const cred = getCredentials(user);
    const lockout = getLockoutRemaining(user);
    if (lockout > 0) {
      return { success: false, lockout: true, remainingSec: lockout };
    }

    if (!cred.hasPin) {
      setSessionUnlocked(user, true);
      return { success: true };
    }

    const testHash = sha256(cred.salt + String(pin).trim());
    if (testHash === cred.hash) {
      cred.failedAttempts = 0;
      cred.lockoutUntil = 0;
      saveCredentials(user, cred);
      setSessionUnlocked(user, true);
      return { success: true };
    }

    cred.failedAttempts = (cred.failedAttempts || 0) + 1;
    if (cred.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      cred.lockoutUntil = Date.now() + LOCKOUT_MS;
      saveCredentials(user, cred);
      return { success: false, lockout: true, remainingSec: Math.ceil(LOCKOUT_MS / 1000) };
    }

    saveCredentials(user, cred);
    const attemptsLeft = MAX_FAILED_ATTEMPTS - cred.failedAttempts;
    return { success: false, lockout: false, attemptsLeft: attemptsLeft };
  }

  function setPin(user, newPin, currentPin) {
    const cred = getCredentials(user);
    if (cred.hasPin) {
      const v = verifyPin(user, currentPin);
      if (!v.success) return { success: false, error: v.lockout ? 'Account locked due to failed attempts' : 'Current PIN incorrect' };
    }
    const clean = String(newPin).trim();
    if (clean.length < 4 || clean.length > 8) {
      return { success: false, error: 'PIN must be between 4 and 8 digits' };
    }
    const salt = generateSalt();
    const hash = sha256(salt + clean);
    cred.hasPin = true;
    cred.salt = salt;
    cred.hash = hash;
    cred.failedAttempts = 0;
    cred.lockoutUntil = 0;
    saveCredentials(user, cred);
    setSessionUnlocked(user, true);
    return { success: true };
  }

  function removePin(user, currentPin) {
    const cred = getCredentials(user);
    if (!cred.hasPin) return { success: true };
    const v = verifyPin(user, currentPin);
    if (!v.success) return { success: false, error: v.lockout ? 'Account locked' : 'Current PIN incorrect' };
    cred.hasPin = false;
    cred.salt = '';
    cred.hash = '';
    cred.failedAttempts = 0;
    cred.lockoutUntil = 0;
    saveCredentials(user, cred);
    setSessionUnlocked(user, true);
    return { success: true };
  }

  function lockUser(user) {
    const target = user || (typeof currentUser !== 'undefined' ? currentUser : 'default');
    setSessionUnlocked(target, false);
    showAuthOverlay('unlock');
  }

  // ═══════════════════════════════════════════════════════
  // UI OVERLAY RENDERING
  // ═══════════════════════════════════════════════════════

  let _lockoutTimer = null;

  function closeAuthOverlay() {
    const el = document.getElementById('authOverlay');
    if (!el) return;
    if (_lockoutTimer) { clearInterval(_lockoutTimer); _lockoutTimer = null; }
    el.classList.remove('show');
    el.style.display = 'none';
    el.innerHTML = '';
  }

  function showAuthOverlay(mode, opts) {
    const el = document.getElementById('authOverlay');
    if (!el) return;
    if (_lockoutTimer) { clearInterval(_lockoutTimer); _lockoutTimer = null; }

    const activeUser = (typeof currentUser !== 'undefined' ? currentUser : 'default');
    const targetUser = (opts && opts.user) || activeUser;
    const cred = getCredentials(targetUser);
    const lockoutSec = getLockoutRemaining(targetUser);

    el.style.display = 'flex';
    el.classList.add('show');

    if (mode === 'login' || mode === 'initial') {
      renderLoginGatewayView(el, targetUser, cred, lockoutSec);
    } else if (mode === 'unlock') {
      renderUnlockView(el, targetUser, cred, lockoutSec);
    } else if (mode === 'profiles') {
      renderProfilesView(el);
    } else if (mode === 'security') {
      renderSecurityView(el, targetUser, cred);
    } else if (mode === 'avatar') {
      renderAvatarPickerView(el);
    }
  }

  
  function _at(s) {
    return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(s) : s;
  }
  function _an(v) {
    return (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function') ? window.iqFormatNum(v) : String(v);
  }
  function _eyeSvg(visible) {
    if (visible) {
      return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  }

  function renderLoginGatewayView(container, user, cred, lockoutSec) {
    const userLabel = user === 'default' ? _at('Guest Profile') : user;
    const ico = (typeof window !== 'undefined' && typeof window.iqIcon === 'function') ? window.iqIcon : null;
    const userAvatar = (typeof S !== 'undefined' && S && S.avatar) ? S.avatar : (ico ? ico('moon') : '');
    const userLv = (typeof S !== 'undefined' && S && S.lv) ? S.lv : 1;
    const hasPin = cred && cred.hasPin;

    let h = `
      <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="authLoginTitle">
        <div class="auth-header">
          <div class="auth-bismillah" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
          <div class="auth-icon-crescent" style="font-size:2.1rem;margin:4px auto 10px;display:flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:var(--accent-bg);border:2px solid var(--accent);color:var(--accent-dark);">
            ${userAvatar}
          </div>
          <h2 id="authLoginTitle" class="auth-title">${_at(hasPin ? 'Sign In / Unlock' : 'Welcome to Ibadah Quest')}</h2>
          <div class="auth-badge iq-tabular">${window.escapeHTML(userLabel)} &middot; ${_at('Level')} ${_an(userLv)} &middot; ${hasPin ? ((ico ? ico('lock') + ' ' : '') + _at('Protected')) : ((ico ? ico('user') + ' ' : '') + _at('Active'))}</div>
        </div>

        ${hasPin ? `
          <div id="authLockoutNotice" class="auth-lockout" style="${lockoutSec > 0 ? 'display:block;' : 'display:none;'}">
            ${_at('Too many failed attempts. Locked for')} <span id="authCountdown" class="iq-tabular">${_an(lockoutSec)}</span>s
          </div>

          <div class="auth-pin-wrap">
            <div class="auth-pin-display">
              <input type="password" id="authPinInput" class="auth-pin-input" maxlength="8" placeholder="••••" autocomplete="off" ${lockoutSec > 0 ? 'disabled' : ''} autofocus />
              <button type="button" class="auth-eye-btn" id="authToggleEye" aria-label="Toggle PIN visibility" onclick="window.Auth.togglePinVisibility()">
                ${_eyeSvg(false)}
              </button>
            </div>
            <div id="authErrorMsg" class="auth-error-msg" style="display:none;"></div>
          </div>

          <div class="auth-keypad">
            ${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" class="auth-key iq-tabular" onclick="window.Auth.keypadInput('${n}')">${_an(n)}</button>`).join('')}
            <button type="button" class="auth-key auth-key-action" onclick="window.Auth.keypadClear()">C</button>
            <button type="button" class="auth-key iq-tabular" onclick="window.Auth.keypadInput('0')">${_an(0)}</button>
            <button type="button" class="auth-key auth-key-action" aria-label="Backspace" onclick="window.Auth.keypadBackspace()">&#9003;</button>
          </div>

          <div class="auth-actions">
            <button type="button" class="auth-btn auth-btn-primary" id="authUnlockBtn" onclick="window.Auth.submitUnlock('${window.escapeHTML(user)}')" ${lockoutSec > 0 ? 'disabled' : ''}>
              ${_at('Unlock & Enter App')}
            </button>
            <button type="button" class="auth-btn auth-btn-secondary" onclick="window.Auth.show('profiles')">
              ${_at('Switch Account')}
            </button>
          </div>
        ` : `
          <p class="auth-sub" style="margin: 10px 0 16px; font-size: 0.95rem; line-height: 1.5; color: var(--text2);">
            ${_at('Sign in to track prayers, cultivate prophetic virtues, and ascend your spiritual quest.')}
          </p>

          <div class="auth-actions">
            <button type="button" class="auth-btn auth-btn-primary" onclick="window.Auth.enterApp('${window.escapeHTML(user)}')">
              ${_at('Enter Ibadah Quest')} <span class="iq-mirror-icon">&rarr;</span>
            </button>
            <button type="button" class="auth-btn auth-btn-secondary" onclick="window.Auth.show('profiles')">
              ${_at('Switch / Create Profile')}
            </button>
          </div>
          <div style="margin-top: 12px; font-size: 0.84rem; text-align: center;">
            <button type="button" class="iq-text-btn" onclick="window.Auth.show('security')">${ico ? ico('lock') + ' ' : ''}${_at('Set up PIN Security')}</button>
          </div>
        `}
      </div>
    `;

    container.innerHTML = h;

    if (hasPin) {
      const input = document.getElementById('authPinInput');
      if (input) {
        input.focus();
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            window.Auth.submitUnlock(user);
          }
        });
      }
      if (lockoutSec > 0) {
        startLockoutCountdown(user, lockoutSec);
      }
    }
  }

  function renderUnlockView(container, user, cred, lockoutSec) {
    const userLabel = user === 'default' ? _at('Guest Profile') : user;
    const ico = (typeof window !== 'undefined' && typeof window.iqIcon === 'function') ? window.iqIcon : null;
    const userAvatar = (typeof S !== 'undefined' && S && S.avatar) ? S.avatar : (ico ? ico('moon') : '');
    const userLv = (typeof S !== 'undefined' && S && S.lv) ? S.lv : 1;

    let h = `
      <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="authTitle">
        <div class="auth-header">
          <div class="auth-bismillah" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
          <div class="auth-avatar-ring" style="font-size:2.1rem;margin:6px auto 10px;display:flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;background:var(--accent-bg);border:2px solid var(--accent);color:var(--accent-dark);">${userAvatar}</div>
          <h2 id="authTitle" class="auth-title">${window.escapeHTML(userLabel)}</h2>
          <div class="auth-badge iq-tabular">${_at('Level')} ${_an(userLv)} &middot; ${ico ? ico('lock') + ' ' : ''}${_at('Protected')}</div>
        </div>

        <div id="authLockoutNotice" class="auth-lockout" style="${lockoutSec > 0 ? 'display:block;' : 'display:none;'}">
          ${_at('Too many failed attempts. Locked for')} <span id="authCountdown" class="iq-tabular">${_an(lockoutSec)}</span>s
        </div>

        <div class="auth-pin-wrap">
          <div class="auth-pin-display">
            <input type="password" id="authPinInput" class="auth-pin-input" maxlength="8" placeholder="••••" autocomplete="off" ${lockoutSec > 0 ? 'disabled' : ''} autofocus />
            <button type="button" class="auth-eye-btn" id="authToggleEye" aria-label="Toggle PIN visibility" onclick="window.Auth.togglePinVisibility()">
              ${_eyeSvg(false)}
            </button>
          </div>
          <div id="authErrorMsg" class="auth-error-msg" style="display:none;"></div>
        </div>

        <div class="auth-keypad">
          ${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" class="auth-key iq-tabular" onclick="window.Auth.keypadInput('${n}')">${_an(n)}</button>`).join('')}
          <button type="button" class="auth-key auth-key-action" onclick="window.Auth.keypadClear()">C</button>
          <button type="button" class="auth-key iq-tabular" onclick="window.Auth.keypadInput('0')">${_an(0)}</button>
          <button type="button" class="auth-key auth-key-action" aria-label="Backspace" onclick="window.Auth.keypadBackspace()">&#9003;</button>
        </div>

        <div class="auth-actions">
          <button type="button" class="auth-btn auth-btn-primary" id="authUnlockBtn" onclick="window.Auth.submitUnlock('${window.escapeHTML(user)}')" ${lockoutSec > 0 ? 'disabled' : ''}>
            ${_at('Unlock App')}
          </button>
          <button type="button" class="auth-btn auth-btn-secondary" onclick="window.Auth.show('profiles')">
            ${_at('Switch Profile')}
          </button>
        </div>
      </div>
    `;

    container.innerHTML = h;

    const input = document.getElementById('authPinInput');
    if (input) {
      input.focus();
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          window.Auth.submitUnlock(user);
        }
      });
    }

    if (lockoutSec > 0) {
      startLockoutCountdown(user, lockoutSec);
    }
  }

  function startLockoutCountdown(user, sec) {
    let rem = sec;
    const cd = document.getElementById('authCountdown');
    const notice = document.getElementById('authLockoutNotice');
    const inp = document.getElementById('authPinInput');
    const btn = document.getElementById('authUnlockBtn');

    if (_lockoutTimer) clearInterval(_lockoutTimer);
    _lockoutTimer = setInterval(() => {
      rem--;
      if (cd) cd.textContent = rem;
      if (rem <= 0) {
        clearInterval(_lockoutTimer);
        _lockoutTimer = null;
        if (notice) notice.style.display = 'none';
        if (inp) { inp.disabled = false; inp.focus(); }
        if (btn) btn.disabled = false;
      }
    }, 1000);
  }

  function renderProfilesView(container) {
    const profiles = getProfiles();
    const activeUser = typeof currentUser !== 'undefined' ? currentUser : 'default';
    const ico = (typeof window !== 'undefined' && typeof window.iqIcon === 'function') ? window.iqIcon : null;

    let h = `
      <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="profilesTitle">
        <div class="auth-header">
          <div class="auth-icon-crescent" style="font-size:2rem;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:var(--accent-bg);border:1px solid var(--accent-border);color:var(--accent-dark);">${ico ? ico('moon') : '🌙'}</div>
          <h2 id="profilesTitle" class="auth-title">${_at('Profiles & Accounts')}</h2>
          <p class="auth-sub">${_at('Select your account or create a new profile')}</p>
        </div>

        <div class="auth-profile-list">
          ${profiles.map(p => {
            const isAct = p === activeUser;
            const cred = getCredentials(p);
            const label = p === 'default' ? _at('Guest') : p;
            return `
              <div class="auth-profile-item ${isAct ? 'active' : ''}" role="button" tabindex="0" onclick="window.Auth.selectProfile('${window.escapeHTML(p)}')">
                <div class="auth-profile-avatar">${ico ? ico(p === 'default' ? 'user' : 'sparkles') : (p === 'default' ? '👤' : '✨')}</div>
                <div class="auth-profile-details">
                  <div class="auth-profile-name">${window.escapeHTML(label)} ${isAct ? `<span class="auth-cur-tag">(${_at('Current')})</span>` : ''}</div>
                  <div class="auth-profile-status">${cred.hasPin ? ((ico ? ico('lock') + ' ' : '') + _at('PIN Protected')) : ((ico ? ico('unlock') + ' ' : '') + _at('Unlocked'))}</div>
                </div>
                <button type="button" class="auth-profile-go" style="min-width:44px;min-height:44px;" aria-label="Switch to ${window.escapeHTML(label)}"><span class="iq-mirror-icon">&rarr;</span></button>
              </div>
            `;
          }).join('')}
        </div>

        <div class="auth-new-profile">
          <label for="newProfileName" class="auth-label">${_at('Create New Profile')}</label>
          <div class="auth-input-group">
            <input type="text" id="newProfileName" class="auth-text-input" placeholder="${_at('Enter username...')}" maxlength="20" />
            <button type="button" class="auth-btn auth-btn-primary" onclick="window.Auth.createNewProfile()">${_at('Create')}</button>
          </div>
        </div>

        <div class="auth-actions" style="margin-top:16px;">
          ${!isLocked(activeUser) ? `<button type="button" class="auth-btn auth-btn-secondary" onclick="window.Auth.close()">${_at('Back to App')}</button>` : ''}
        </div>
      </div>
    `;

    container.innerHTML = h;
  }

  function renderSecurityView(container, user, cred) {
    const userLabel = user === 'default' ? _at('Guest') : user;
    const ico = (typeof window !== 'undefined' && typeof window.iqIcon === 'function') ? window.iqIcon : null;
    let h = `
      <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="secTitle">
        <div class="auth-header">
          <div class="auth-icon-crescent" style="margin:0 auto 8px;display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:var(--accent-bg);border:1px solid var(--accent-border);color:var(--accent-dark);">${ico ? ico('shield') : '🛡️'}</div>
          <h2 id="secTitle" class="auth-title">${_at('Security & PIN')}</h2>
          <div class="auth-badge">${window.escapeHTML(userLabel)} &middot; ${cred.hasPin ? _at('PIN Enabled') : _at('No PIN Set')}</div>
        </div>

        <div id="secErrorMsg" class="auth-error-msg" style="display:none;"></div>
        <div id="secSuccessMsg" class="auth-success-msg" style="display:none;"></div>

        <form onsubmit="event.preventDefault(); window.Auth.submitSecurityForm('${window.escapeHTML(user)}');" class="auth-form">
          ${cred.hasPin ? `
            <div class="auth-field">
              <label for="secCurrentPin" class="auth-label">${_at('Current PIN')}</label>
              <input type="password" id="secCurrentPin" class="auth-text-input" maxlength="8" placeholder="${_at('Enter current PIN')}" required />
            </div>
          ` : ''}

          <div class="auth-field">
            <label for="secNewPin" class="auth-label">${_at(cred.hasPin ? 'New PIN (4-8 digits)' : 'Set PIN (4-8 digits)')}</label>
            <input type="password" id="secNewPin" class="auth-text-input" maxlength="8" placeholder="${_at('4 to 8 digits')}" required />
          </div>

          <div class="auth-field">
            <label for="secConfirmPin" class="auth-label">${_at('Confirm PIN')}</label>
            <input type="password" id="secConfirmPin" class="auth-text-input" maxlength="8" placeholder="${_at('Re-enter PIN')}" required />
          </div>

          <div class="auth-actions" style="margin-top:16px;">
            <button type="submit" class="auth-btn auth-btn-primary">
              ${_at(cred.hasPin ? 'Update PIN' : 'Enable PIN Protection')}
            </button>
            ${cred.hasPin ? `
              <button type="button" class="auth-btn auth-btn-danger" onclick="window.Auth.promptRemovePin('${window.escapeHTML(user)}')">
                ${_at('Remove PIN')}
              </button>
            ` : ''}
            <button type="button" class="auth-btn auth-btn-secondary" onclick="window.Auth.close()">
              ${_at('Close')}
            </button>
          </div>
        </form>
      </div>
    `;

    container.innerHTML = h;
  }

  function renderAvatarPickerView(container) {
    const AVATARS = [
      '🌙', '🕌', '📖', '🤲', '⭐', '🕊️', '🌿', '💎',
      '🛡️', '🌴', '💧', '☀️', '🌸', '✨', '🏆', '🧭',
      '🕯️', '📿', '🕋', '🌅', '🌌', '🌾', '🕊', '👑'
    ];
    const currentAvatar = (typeof S !== 'undefined' && S && S.avatar) ? S.avatar : '';

    let h = `
      <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="avatarTitle">
        <div class="auth-header">
          <div class="auth-icon-crescent">🎨</div>
          <h2 id="avatarTitle" class="auth-title">Choose Your Avatar</h2>
          <p class="auth-sub">Select an icon that represents your spiritual journey</p>
        </div>

        <div class="auth-avatar-grid">
          ${AVATARS.map(av => `
            <button type="button" class="auth-avatar-choice ${av === currentAvatar ? 'selected' : ''}" onclick="window.Auth.chooseAvatar('${av}')">
              ${av}
            </button>
          `).join('')}
        </div>

        <div class="auth-actions" style="margin-top:16px;">
          <button type="button" class="auth-btn auth-btn-secondary" onclick="window.Auth.chooseAvatar('')">
            Clear Avatar
          </button>
          <button type="button" class="auth-btn auth-btn-primary" onclick="window.Auth.close()">
            Done
          </button>
        </div>
      </div>
    `;

    container.innerHTML = h;
  }

  // ═══════════════════════════════════════════════════════
  // ACTION HANDLERS & PUBLIC API
  // ═══════════════════════════════════════════════════════

  window.Auth = {
    sha256,
    isLocked,
    verifyPin,
    setPin,
    removePin,
    lockUser,
    getProfiles,
    show: showAuthOverlay,
    close: closeAuthOverlay,

    checkStartupAuth: function() {
      const activeUser = typeof currentUser !== 'undefined' ? currentUser : 'default';
      if (isLocked(activeUser)) {
        showAuthOverlay('unlock');
        return false;
      }
      return true;
    },

    enterApp: function(user) {
      const target = user || (typeof currentUser !== 'undefined' ? currentUser : 'default');
      try {
        sessionStorage.setItem('iq_session_authenticated', '1');
        sessionStorage.setItem(SESSION_UNLOCKED_PREFIX + target, '1');
        localStorage.setItem('iq_intro_seen', '1');
        if (typeof S !== 'undefined' && S) S.introSeen = true;
      } catch(e) {}
      var introOv = document.getElementById('introOverlay');
      if (introOv) {
        introOv.classList.remove('visible');
        introOv.style.display = 'none';
      }
      closeAuthOverlay();
      if (typeof window.toast === 'function') {
        window.toast('✨', 'Welcome to Ibadah Quest!');
      }
      if (typeof window.renderAll === 'function') window.renderAll();
      if (typeof window.isOnboardingComplete === 'function' && !window.isOnboardingComplete()) {
        setTimeout(function() { if (typeof window.startOnboarding === 'function') window.startOnboarding(); }, 350);
      }
    },

    togglePinVisibility: function() {
      const inp = document.getElementById('authPinInput');
      const btn = document.getElementById('authToggleEye');
      if (!inp) return;
      if (inp.type === 'password') {
        inp.type = 'text';
        if (btn) btn.innerHTML = _eyeSvg(true);
      } else {
        inp.type = 'password';
        if (btn) btn.innerHTML = _eyeSvg(false);
      }
    },

    keypadInput: function(num) {
      const inp = document.getElementById('authPinInput');
      if (!inp || inp.disabled) return;
      if (inp.value.length < 8) {
        inp.value += num;
      }
    },

    keypadClear: function() {
      const inp = document.getElementById('authPinInput');
      if (!inp || inp.disabled) return;
      inp.value = '';
    },

    keypadBackspace: function() {
      const inp = document.getElementById('authPinInput');
      if (!inp || inp.disabled) return;
      inp.value = inp.value.slice(0, -1);
    },

    submitUnlock: function(user) {
      const inp = document.getElementById('authPinInput');
      const errMsg = document.getElementById('authErrorMsg');
      if (!inp) return;
      const pin = inp.value;
      const res = verifyPin(user, pin);

      if (res.success) {
        closeAuthOverlay();
        if (typeof window.toast === 'function') {
          window.toast('🔓', 'Welcome back, ' + (user === 'default' ? 'Guest' : user) + '!');
        }
        if (typeof window.renderAll === 'function') window.renderAll();
      } else {
        inp.value = '';
        if (res.lockout) {
          showAuthOverlay('unlock', { user });
        } else {
          if (errMsg) {
            errMsg.textContent = `Incorrect PIN. ${res.attemptsLeft} attempts remaining.`;
            errMsg.style.display = 'block';
          }
        }
      }
    },

    selectProfile: function(user) {
      if (typeof window.saveState === 'function') window.saveState();
      if (typeof currentUser !== 'undefined') {
        currentUser = user;
        try { localStorage.setItem('iq9_active_user', user); } catch(e) {}
        if (typeof window.loadState === 'function') {
          window.S = window.loadState();
        }
        if (isLocked(user)) {
          showAuthOverlay('unlock', { user });
        } else {
          closeAuthOverlay();
          if (typeof window.initApp === 'function') window.initApp();
          if (typeof window.toast === 'function') {
            window.toast('👤', 'Switched to ' + (user === 'default' ? 'Guest' : user));
          }
        }
      }
    },

    createNewProfile: function() {
      const inp = document.getElementById('newProfileName');
      if (!inp) return;
      const name = inp.value.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '');
      const warn = function(m) {
        if (typeof window.iqAlertDialog === 'function') window.iqAlertDialog('Profile Name', m);
        else if (typeof window.toast === 'function') window.toast('!', m, false, 2400);
        else if (typeof alert === 'function') alert(m);
      };
      if (!name) {
        warn('Please enter a valid profile name.');
        return;
      }
      const profiles = getProfiles();
      if (profiles.includes(name)) {
        warn('Profile already exists.');
        return;
      }
      profiles.push(name);
      saveProfiles(profiles);
      window.Auth.selectProfile(name);
    },

    submitSecurityForm: function(user) {
      const curInp = document.getElementById('secCurrentPin');
      const newInp = document.getElementById('secNewPin');
      const confInp = document.getElementById('secConfirmPin');
      const errMsg = document.getElementById('secErrorMsg');
      const succMsg = document.getElementById('secSuccessMsg');

      if (!newInp || !confInp) return;
      const curPin = curInp ? curInp.value : '';
      const newPin = newInp.value;
      const confPin = confInp.value;

      if (errMsg) errMsg.style.display = 'none';
      if (succMsg) succMsg.style.display = 'none';

      if (newPin !== confPin) {
        if (errMsg) {
          errMsg.textContent = 'New PIN and Confirmation do not match.';
          errMsg.style.display = 'block';
        }
        return;
      }

      const res = setPin(user, newPin, curPin);
      if (res.success) {
        if (succMsg) {
          succMsg.textContent = 'PIN updated successfully!';
          succMsg.style.display = 'block';
        }
        setTimeout(() => {
          closeAuthOverlay();
          if (typeof window.renderProfile === 'function') window.renderProfile();
          if (typeof window.toast === 'function') window.toast('🔒', 'PIN security saved');
        }, 900);
      } else {
        if (errMsg) {
          errMsg.textContent = res.error || 'Failed to update PIN.';
          errMsg.style.display = 'block';
        }
      }
    },

    promptRemovePin: function(user) {
      const finish = function(pin) {
        if (!pin) return;
        const res = removePin(user, pin);
        if (res.success) {
          closeAuthOverlay();
          if (typeof window.renderProfile === 'function') window.renderProfile();
          if (typeof window.toast === 'function') window.toast('🔓', 'PIN protection removed.', false, 2200);
        } else {
          if (typeof window.iqAlertDialog === 'function') window.iqAlertDialog('PIN Removal', res.error || 'Incorrect PIN.');
          else if (typeof alert === 'function') alert(res.error || 'Incorrect PIN.');
        }
      };
      if (typeof window.iqPromptDialog === 'function') {
        window.iqPromptDialog('Remove PIN', 'Enter current PIN to confirm removal:', 'Current PIN', finish);
      } else if (typeof prompt === 'function') {
        finish(prompt('Enter current PIN to confirm removal:'));
      }
    },

    chooseAvatar: function(emoji) {
      if (typeof window.selectAvatar === 'function') {
        window.selectAvatar(emoji);
      } else if (typeof S !== 'undefined' && S) {
        S.avatar = emoji;
        if (typeof window.saveState === 'function') window.saveState();
        if (typeof window.renderProfile === 'function') window.renderProfile();
      }
      closeAuthOverlay();
      if (typeof window.toast === 'function') window.toast('✨', 'Avatar updated');
    }
  };

})();
