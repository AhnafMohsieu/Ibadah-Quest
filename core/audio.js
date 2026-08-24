(function() {
  let recAudio = null;
  let seqQueue = [];
  let seqIdx = 0;
  let seqActive = false;
  let _voices = [];
  let _currentId = null;
  let _onChangeFn = null;

  function _fireChange() { if (_onChangeFn) { try { _onChangeFn(); } catch (e) {} } }

  function _applyOpts(opts) {
    if (typeof opts === 'function') return { onended: opts };
    return opts || {};
  }

  function currentId() { return _currentId; }
  function setOnChange(fn) { _onChangeFn = typeof fn === 'function' ? fn : null; }

  function pickArabicVoice(voices) {
    const arabic = (voices || []).filter(v => /^ar/i.test(v.lang));
    if (!arabic.length) return null;
    return arabic.find(v => /microsoft|google/i.test(v.name)) || arabic[0];
  }

  function ttsAvailable() { return 'speechSynthesis' in window; }

  // Voices load asynchronously in browsers; prime now and refresh on voiceschanged.
  if (ttsAvailable()) {
    _voices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function() { _voices = window.speechSynthesis.getVoices(); };
  }

  function stopTTS() {
    if (ttsAvailable()) window.speechSynthesis.cancel();
  }

  function isSpeaking() {
    return ttsAvailable() && (window.speechSynthesis.speaking || window.speechSynthesis.pending);
  }

  function stopRecording() {
    if (recAudio) { recAudio.pause(); recAudio = null; }
  }

  function stopAllAudio() {
    seqActive = false;
    seqQueue = [];
    seqIdx = 0;
    stopTTS();
    stopRecording();
    _currentId = null;
    _fireChange();
  }

  function isBusy() { return seqActive || isSpeaking() || !!recAudio; }

  function speak(text, lang, onend, id) {
    if (!ttsAvailable() || !text) return false;
    stopRecording();
    const u = new SpeechSynthesisUtterance(String(text));
    if (lang === 'en') {
      u.lang = 'en-US';
    } else {
      if (_voices.length === 0) _voices = window.speechSynthesis.getVoices();
      const v = pickArabicVoice(_voices);
      if (!v) return false;
      u.voice = v;
      u.lang = v.lang;
      u.rate = 0.9;
    }
    u.onend = function() {
      if (_currentId === (id || null)) _currentId = null;
      if (onend) onend();
      _fireChange();
    };
    u.onerror = function() { if (_currentId === (id || null)) _currentId = null; _fireChange(); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    _currentId = id || null;
    _fireChange();
    return true;
  }

  function playTTS(text, lang, opts) { return speak(text, lang, null, opts && opts.id); }

  function toggleTTS(text, lang, opts) {
    if (isSpeaking()) {
      stopTTS();
      _currentId = null;
      _fireChange();
      return true;
    }
    return speak(text, lang, null, opts && opts.id);
  }

  function playRecording(url, opts) {
    opts = _applyOpts(opts);
    stopTTS();
    if (typeof window.stopSurah === 'function') window.stopSurah();
    stopRecording();
    recAudio = new Audio(url);
    recAudio.onended = function() {
      _currentId = null;
      if (opts.onended) opts.onended();
      _fireChange();
    };
    recAudio.onerror = function() {
      _currentId = null;
      if (opts.onended) opts.onended();
      _fireChange();
    };
    _currentId = opts.id || null;
    recAudio.play().catch(() => {});
    _fireChange();
    return recAudio;
  }

  function _seqNext() {
    if (!seqActive || seqIdx >= seqQueue.length) { seqActive = false; return; }
    const it = seqQueue[seqIdx++];
    const advance = () => { if (seqActive) setTimeout(_seqNext, 400); };
    if (it.url) {
      playRecording(it.url, { id: it.id, onended: advance });
    } else {
      const ok = speak(it.tts, it.lang || 'ar', advance, it.id);
      if (!ok) setTimeout(_seqNext, 0);
    }
  }

  function playSequence(items) {
    stopAllAudio();
    seqQueue = (items || []).slice();
    seqIdx = 0;
    if (!seqQueue.length) return;
    seqActive = true;
    _seqNext();
  }

  window.AppAudio = { pickArabicVoice, playTTS, toggleTTS, stopTTS, playRecording, playSequence, stopAllAudio, isBusy, isSpeaking, currentId, setOnChange };
})();
