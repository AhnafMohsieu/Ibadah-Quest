// features/spiritual-growth/daynight.js
// Day/Night Cycle — Ambient background based on deeds

(function() {
  const CAPTIONS = ["A new dawn brings new chances.","The morning light calls to prayer.","Midday — pause and remember Allah.","The afternoon sun warms your deeds.","As the sun sets, reflect on your day.","In the night, seek forgiveness.","The cycle completes — eternal dawn."];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  const SKY_COLORS = {
    1: ['#FFB347', '#FF6B6B'],
    2: ['#87CEEB', '#FFD700'],
    3: ['#4A90E2', '#FFD700'],
    4: ['#FFA07A', '#FFD700'],
    5: ['#FF6B6B', '#4A90E2'],
    6: ['#191970', '#4A90E2'],
    7: ['#FFB347', '#FF6B6B']
  };

  function skyGradient(stage) {
    const colors = SKY_COLORS[stage] || SKY_COLORS[1];
    return `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  }

  function daynightSVG(stage, progress) {
    const gradient = skyGradient(stage);
    let celestial = '';

    if (stage <= 2 || stage === 7) {
      celestial = `<circle cx="60" cy="45" r="20" fill="#FFD700" opacity="0.9"/>
        <circle cx="60" cy="45" r="25" fill="none" stroke="#FFD700" stroke-width="2" opacity="0.3"/>`;
    } else if (stage === 3 || stage === 4) {
      celestial = `<circle cx="60" cy="35" r="22" fill="#FFD700" opacity="0.95"/>
        <circle cx="60" cy="35" r="28" fill="none" stroke="#FFD700" stroke-width="2" opacity="0.4"/>`;
    } else if (stage === 5) {
      celestial = `<circle cx="60" cy="65" r="18" fill="#FF6B6B" opacity="0.85"/>
        <circle cx="60" cy="65" r="24" fill="none" stroke="#FF6B6B" stroke-width="2" opacity="0.3"/>`;
    } else if (stage === 6) {
      celestial = `<circle cx="60" cy="40" r="14" fill="#F5F5DC" opacity="0.9"/>
        <circle cx="60" cy="40" r="18" fill="none" stroke="#F5F5DC" stroke-width="1.5" opacity="0.3"/>
        <circle cx="22" cy="28" r="2" fill="#FFF" opacity="0.8"/>
        <circle cx="95" cy="22" r="2.5" fill="#FFF" opacity="0.7"/>
        <circle cx="42" cy="18" r="1.5" fill="#FFF" opacity="0.6"/>
        <circle cx="80" cy="35" r="1.5" fill="#FFF" opacity="0.6"/>
        <circle cx="50" cy="55" r="1" fill="#FFF" opacity="0.5"/>
        <circle cx="105" cy="50" r="1.5" fill="#FFF" opacity="0.5"/>`;
    }

    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="${gradient}" rx="10"/>
      ${celestial}
      <rect y="120" width="120" height="40" fill="#2E5D3A" rx="5"/>
    </svg>`;
  }

  function renderDayNight() {
    const el = document.getElementById('daynightArea');
    if (!el || !SpiritualGrowth.isVisible('daynight')) {
      if (el) el.innerHTML = '';
      return;
    }

    const progress = SpiritualGrowth.getProgress('daynight');
    const stageNames = ['Dawn','Morning','Midday','Afternoon','Sunset','Night','Dawn'];
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${stageNames[progress.stage]}`
      : 'Your cycle is complete — eternal light.';

    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${daynightSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Day/Night Cycle <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderDayNight = renderDayNight;
})();