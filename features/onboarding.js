(function() {
  const STEPS = [
    {
      icon: 'crescent',
      title: 'Welcome to Ibadah Quest',
      text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ<br>In the Name of Allah, the Most Gracious, the Most Merciful.<br>Your journey of worship begins now.'
    },
    {
      icon: 'sparkles',
      title: 'Key Features',
      text: 'Track your five daily prayers, complete quests for XP, and unlock achievements as you grow in worship and character.'
    },
    {
      icon: 'settings',
      title: 'Quick Settings',
      text: 'Personalize your experience: choose a theme from the top bar and manage your notification preferences whenever you like.'
    },
    {
      icon: 'target',
      title: 'Begin Your Journey',
      text: 'Your first quest awaits — complete a daily quest today to earn XP and start building your streak. May Allah accept your efforts.'
    }
  ];

  function isOnboardingComplete() {
    return !!(typeof S !== 'undefined' && S && S.onboarding && S.onboarding.complete === true);
  }

  function renderOnboardingStep() {
    if (typeof document === 'undefined') return;
    const ov = document.getElementById('onboardingOverlay');
    if (!ov) return;
    const st = (S && S.onboarding && S.onboarding.step) || 0;
    const step = STEPS[st] || STEPS[0];
    const isLast = st >= STEPS.length - 1;
    let dots = '';
    for (let i = 0; i < STEPS.length; i++) {
      dots += '<div class="onboarding-dot' + (i === st ? ' active' : '') + '"></div>';
    }
    ov.innerHTML = '<div class="onboarding-card">' +
      '<div class="onboarding-icon">' + iqIcon(step.icon) + '</div>' +
      '<h2>' + step.title + '</h2>' +
      '<p>' + step.text + '</p>' +
      '<div class="onboarding-progress">' + dots + '</div>' +
      '<button class="onboarding-btn" onclick="' + (isLast ? 'window.completeOnboarding()' : 'window.nextOnboardingStep()') + '">' +
      (isLast ? 'Start' : 'Next') + '</button>' +
      '</div>';
    ov.style.display = 'flex';
  }

  function startOnboarding() {
    if (typeof S !== 'undefined' && S) {
      if (!S.onboarding) S.onboarding = {};
      S.onboarding.step = 0;
      S.onboarding.complete = false;
      if (typeof saveState === 'function') saveState();
    }
    renderOnboardingStep();
  }

  function nextOnboardingStep() {
    if (typeof S === 'undefined' || !S) return;
    if (!S.onboarding) S.onboarding = {};
    S.onboarding.step = (S.onboarding.step || 0) + 1;
    if (S.onboarding.step >= STEPS.length) {
      completeOnboarding();
      return;
    }
    if (typeof saveState === 'function') saveState();
    renderOnboardingStep();
  }

  function completeOnboarding() {
    if (typeof S !== 'undefined' && S) {
      if (!S.onboarding) S.onboarding = {};
      S.onboarding.complete = true;
      if (typeof saveState === 'function') saveState();
    }
    if (typeof toast === 'function') toast(iqIcon('sparkles'), 'Welcome to Ibadah Quest! May Allah bless your journey.', false, 3000);
    if (typeof document !== 'undefined') {
      const ov = document.getElementById('onboardingOverlay');
      if (ov) {
        ov.style.display = 'none';
        ov.innerHTML = '';
      }
    }
  }

  window.startOnboarding = startOnboarding;
  window.nextOnboardingStep = nextOnboardingStep;
  window.completeOnboarding = completeOnboarding;
  window.isOnboardingComplete = isOnboardingComplete;
  window.renderOnboardingStep = renderOnboardingStep;
})();