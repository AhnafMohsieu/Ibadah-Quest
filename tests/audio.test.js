const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(path.join(__dirname, '..', 'core', 'audio.js'), 'utf8');

function evalModule() {
  const window = {};
  new Function('window', src)(window);
  return window.AppAudio;
}

test('audio: single-source discipline (each starter stops the others)', () => {
  assert.match(src, /function stopTTS\(\)/);
  assert.match(src, /stopTTS\(\);\s*\n?\s*if \(typeof window\.stopSurah === 'function'\) window\.stopSurah\(\);/, 'playRecording stops TTS + Quran queue');
  assert.match(src, /function stopAllAudio\(\)/);
});

test('audio: pickArabicVoice prefers ar voices, null otherwise', () => {
  const AppAudio = evalModule();
  const voices = [
    { lang: 'en-US', name: 'Zira' },
    { lang: 'ar-SA', name: 'Microsoft Hoda' },
    { lang: 'ar-EG', name: 'Google Arabic' }
  ];
  assert.equal(AppAudio.pickArabicVoice(voices).name, 'Microsoft Hoda');
  assert.equal(AppAudio.pickArabicVoice([{ lang: 'en-US', name: 'Zira' }]), null);
});

test('audio: exports complete surface', () => {
  const AppAudio = evalModule();
  ['pickArabicVoice','playTTS','toggleTTS','stopTTS','playRecording','playSequence','stopAllAudio','isBusy'].forEach(k => {
    assert.equal(typeof AppAudio[k], 'function', k + ' is a function');
  });
});

test('audio: source tracking lifecycle', () => {
  const AppAudio = evalModule();
  assert.equal(typeof AppAudio.currentId, 'function');
  assert.equal(typeof AppAudio.setOnChange, 'function');
  assert.equal(AppAudio.currentId(), null);
});

test('audio: playRecording accepts options object with id (signature shape)', () => {
  const src2 = fs.readFileSync(path.join(__dirname, '..', 'core', 'audio.js'), 'utf8');
  assert.match(src2, /function playRecording\(url, opts\)/);
  assert.match(src2, /function currentId\(\)/);
  assert.match(src2, /function setOnChange\(fn\)/);
  assert.match(src2, /_fireChange\(\);/, 'state changes fire the change callback');
});
