(function() {
  let recAudio = null;
  let seqQueue = [];
  let seqIdx = 0;
  let seqActive = false;

  function pickArabicVoice(voices) {
    const arabic = (voices || []).filter(v => /^ar/i.test(v.lang));
    if (!arabic.length) return null;
    return arabic.find(v => /microsoft|google/i.test(v.name)) || arabic[0];
  }

  function ttsAvailable() { return 'speechSynthesis' in window; }

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
  }

  function isBusy() { return seqActive || isSpeaking() || !!recAudio; }

  function speak(text, lang, onend) {
    if (!ttsAvailable() || !text) return false;
    stopRecording();
    const u = new SpeechSynthesisUtterance(String(text));
    if (lang === 'en') {
      u.lang = 'en-US';
    } else {
      const v = pickArabicVoice(window.speechSynthesis.getVoices());
      if (!v) return false;
      u.voice = v;
      u.lang = v.lang;
      u.rate = 0.9;
    }
    if (onend) u.onend = onend;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return true;
  }

  function playTTS(text, lang) { return speak(text, lang); }

  function toggleTTS(text, lang) {
    if (isSpeaking()) { stopTTS(); return true; }
    return speak(text, lang);
  }

  function playRecording(url, onended) {
    stopTTS();
    if (typeof window.stopSurah === 'function') window.stopSurah();
    stopRecording();
    recAudio = new Audio(url);
    if (onended) recAudio.onended = onended;
    recAudio.play().catch(() => {});
    return recAudio;
  }

  function _seqNext() {
    if (!seqActive || seqIdx >= seqQueue.length) { seqActive = false; return; }
    const it = seqQueue[seqIdx++];
    const advance = () => { if (seqActive) setTimeout(_seqNext, 400); };
    if (it.url) {
      playRecording(it.url, advance);
    } else {
      const ok = speak(it.tts, it.lang || 'ar', advance);
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

  window.AppAudio = { pickArabicVoice, playTTS, toggleTTS, stopTTS, playRecording, playSequence, stopAllAudio, isBusy, isSpeaking };
})();
