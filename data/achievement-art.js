/* ═══════════════════════════════════════════════════════
   Ibadah Quest — Achievement Art Registry & Badge Renderer
   Maps every achievement ID in ACHS to reusable 512x512 SVG
   collectible sticker badges + 8 rarity frame treatments.
   Zero text, digits, or calligraphy inside badge artwork.
   ═══════════════════════════════════════════════════════ */
(function () {
  const BADGE_FALLBACK = {
    src: 'assets/badges/special/level-ascendant.svg',
    category: 'special',
    silhouette: 'fan'
  };

  const ICON_FALLBACK = 'assets/achievement-icons/achievements.svg';

  const IQ_ACHIEVEMENT_ICONS = {
    prayer: 'assets/achievement-icons/prayer.svg',
    quran: 'assets/achievement-icons/quran.svg',
    dhikr: 'assets/achievement-icons/dhikr.svg',
    charity: 'assets/achievement-icons/charity.svg',
    gratitude: 'assets/achievement-icons/gratitude.svg',
    voluntary: 'assets/achievement-icons/voluntary.svg',
    fasting: 'assets/achievement-icons/fasting.svg',
    memorization: 'assets/achievement-icons/memorization.svg',
    learning: 'assets/achievement-icons/learning.svg',
    health: 'assets/achievement-icons/health.svg',
    finance: 'assets/achievement-icons/finance.svg',
    journeys: 'assets/achievement-icons/journeys.svg',
    quests: 'assets/achievement-icons/quests.svg',
    streaks: 'assets/achievement-icons/streaks.svg',
    seasonal: 'assets/achievement-icons/seasonal.svg',
    rewards: 'assets/achievement-icons/rewards.svg',
    achievements: 'assets/achievement-icons/achievements.svg',
    lock: 'assets/achievement-icons/lock.svg'
  };

  const IQ_RARITY_META = {
    bronze:    { label: 'Bronze',    color: '#c26d38', pips: 1 },
    silver:    { label: 'Silver',    color: '#94a3b8', pips: 2 },
    gold:      { label: 'Gold',      color: '#eab308', pips: 3 },
    platinum:  { label: 'Platinum',  color: '#cbd5e1', pips: 4 },
    diamond:   { label: 'Diamond',   color: '#06b6d4', pips: 5 },
    legendary: { label: 'Legendary', color: '#e11d48', pips: 6 },
    mythic:    { label: 'Mythic',    color: '#9333ea', pips: 7 },
    jannah:    { label: 'Jannah',    color: '#10b981', pips: 8 }
  };

  // Reusable badge definitions
  const ART = {
    FIRST_STEP:         { src: 'assets/badges/prayer/first-step.svg', category: 'prayer', silhouette: 'shield' },
    DEVOUT_SALAH:       { src: 'assets/badges/prayer/devout-salah.svg', category: 'prayer', silhouette: 'arch' },
    ETERNAL_SERVANT:    { src: 'assets/badges/prayer/eternal-servant.svg', category: 'prayer', silhouette: 'rub' },
    PERFECT_DAY:        { src: 'assets/badges/prayer/perfect-day.svg', category: 'prayer', silhouette: 'octa' },
    FAJR_DAWN:          { src: 'assets/badges/prayer/fajr-dawn.svg', category: 'prayer', silhouette: 'scallop12' },
    ISHA_NIGHT:         { src: 'assets/badges/prayer/isha-night.svg', category: 'prayer', silhouette: 'shield' },
    JUMMAH_MOSQUE:      { src: 'assets/badges/prayer/jummah-mosque.svg', category: 'prayer', silhouette: 'arch' },

    QURAN_READER:       { src: 'assets/badges/quran/quran-reader.svg', category: 'quran', silhouette: 'book' },
    HAFIZ_PATH:         { src: 'assets/badges/memorization/hafiz-path.svg', category: 'memorization', silhouette: 'hex' },
    FULL_HAFIZ:         { src: 'assets/badges/memorization/full-hafiz.svg', category: 'memorization', silhouette: 'rub' },

    DHIKR_TASBIH:       { src: 'assets/badges/dhikr/dhikr-tasbih.svg', category: 'dhikr', silhouette: 'scallop12' },

    GENEROUS_HEART:     { src: 'assets/badges/charity/generous-heart.svg', category: 'charity', silhouette: 'shield' },
    CHARITY_TREASURE:   { src: 'assets/badges/charity/charity-treasure.svg', category: 'charity', silhouette: 'diamond' },
    FINANCE_SCALES:     { src: 'assets/badges/finance/finance-scales.svg', category: 'finance', silhouette: 'hex' },
    GRATITUDE_BLOOM:    { src: 'assets/badges/gratitude/gratitude-bloom.svg', category: 'gratitude', silhouette: 'scallop8' },

    TAHAJJUD_VIGIL:     { src: 'assets/badges/voluntary-prayers/tahajjud-vigil.svg', category: 'voluntary-prayers', silhouette: 'lantern' },
    DUHA_MORNING:       { src: 'assets/badges/voluntary-prayers/duha-morning.svg', category: 'voluntary-prayers', silhouette: 'scallop12' },
    WITR_CONSTELLATION: { src: 'assets/badges/voluntary-prayers/witr-constellation.svg', category: 'voluntary-prayers', silhouette: 'diamond' },
    NAWAFIL_MASTER:     { src: 'assets/badges/voluntary-prayers/nawafil-master.svg', category: 'voluntary-prayers', silhouette: 'medal' },

    FASTING_CRESCENT:   { src: 'assets/badges/fasting/fasting-crescent.svg', category: 'fasting', silhouette: 'circle' },

    HEALTH_VITALITY:    { src: 'assets/badges/health/health-vitality.svg', category: 'health', silhouette: 'shield' },
    WATER_CHAMPION:     { src: 'assets/badges/health/water-champion.svg', category: 'health', silhouette: 'teardrop' },
    SLEEP_TRACKER:      { src: 'assets/badges/health/sleep-tracker.svg', category: 'health', silhouette: 'circle' },
    EXERCISE_STARTER:   { src: 'assets/badges/health/exercise-starter.svg', category: 'health', silhouette: 'hex' },

    JOURNEY_COMPASS:    { src: 'assets/badges/journeys/journey-compass.svg', category: 'journeys', silhouette: 'circle' },
    JOURNEY_SUMMIT:     { src: 'assets/badges/journeys/journey-summit.svg', category: 'journeys', silhouette: 'shield' },

    QUEST_SCROLL:       { src: 'assets/badges/quests/quest-scroll.svg', category: 'quests', silhouette: 'scroll' },
    DEED_GEM:           { src: 'assets/badges/quests/deed-gem.svg', category: 'quests', silhouette: 'hex' },
    VERSATILE_STAR:     { src: 'assets/badges/quests/versatile-star.svg', category: 'quests', silhouette: 'rub' },

    STREAK_FLAME:       { src: 'assets/badges/streaks/streak-flame.svg', category: 'streaks', silhouette: 'teardrop' },
    STREAK_UNBREAKABLE: { src: 'assets/badges/streaks/streak-unbreakable.svg', category: 'streaks', silhouette: 'diamond' },
    COMBO_STREAK:       { src: 'assets/badges/streaks/combo-streak.svg', category: 'streaks', silhouette: 'hex' },

    LEVEL_ASCENDANT:    { src: 'assets/badges/special/level-ascendant.svg', category: 'special', silhouette: 'fan' },

    RAMADAN_LANTERN:    { src: 'assets/badges/seasonal/ramadan-lantern.svg', category: 'seasonal', silhouette: 'lantern' },
    EID_CELEBRATION:    { src: 'assets/badges/seasonal/eid-celebration.svg', category: 'seasonal', silhouette: 'scallop12' },
    HAJJ_PILGRIMAGE:    { src: 'assets/badges/seasonal/hajj-pilgrimage.svg', category: 'seasonal', silhouette: 'arch' },
    YEAR_OF_FAITH:      { src: 'assets/badges/seasonal/year-of-faith.svg', category: 'seasonal', silhouette: 'circle' }
  };

  function mapIds(ids, art) {
    const out = {};
    for (let i = 0; i < ids.length; i++) out[ids[i]] = art;
    return out;
  }

  // Complete explicit mapping for every achievement ID in data/achievements.js
  const IQ_ACHIEVEMENT_ART = Object.assign({},
    // Prayer — First step, Salah milestones, Eternal/Jannah gate
    { a1: ART.FIRST_STEP },
    mapIds([
      'a275', 'a5', 'a288', 'a289', 'a17', 'a26', 'a253', 'a254', 'a27',
      'a28', 'a41', 'a42', 'a43', 'a44', 'a45', 'a46', 'a49', 'a51'
    ], ART.DEVOUT_SALAH),
    mapIds(['m1', 'p1'], ART.ETERNAL_SERVANT),

    // Perfect Prayer Days (5 daily prayers)
    mapIds([
      'a2', 'a30', 'a52b', 'a245', 'a246', 'a255', 'a57', 'a58', 'a59',
      'a60', 'a61', 'm19', 'm2', 'm20', 'm3', 'p11', 'p2', 'p12'
    ], ART.PERFECT_DAY),

    // Fajr, Isha, Jummah
    { a247: ART.FAJR_DAWN },
    { a248: ART.ISHA_NIGHT },
    mapIds([
      'a37', 'a301', 'a195', 'a264', 'a38', 'a265', 'a197', 'a199', 'a200', 'a201'
    ], ART.JUMMAH_MOSQUE),

    // Quran reading & Memorization
    mapIds([
      'a6', 'a282', 'a120', 'a302', 'a123', 'a271', 'a124', 'a125', 'm30', 'm11', 'p8'
    ], ART.QURAN_READER),
    mapIds([
      'a284', 'a14', 'a299', 'a180', 'a181', 'a23', 'a182', 'a266', 'a183', 'a184', 'a185'
    ], ART.HAFIZ_PATH),
    mapIds(['a31', 'm35'], ART.FULL_HAFIZ),

    // Dhikr
    mapIds([
      'a7', 'a283', 'a127', 'a130', 'a270', 'a131', 'a132', 'a133', 'm31', 'm12', 'p9'
    ], ART.DHIKR_TASBIH),

    // Charity & Finance
    mapIds([
      'a8', 'a294', 'a135', 'a21', 'a267', 'a138', 'a139', 'a140', 'm32', 'm13', 'p10'
    ], ART.GENEROUS_HEART),
    mapIds(['a221', 'a222', 'a224'], ART.CHARITY_TREASURE),
    mapIds(['a217', 'a218', 'a219', 'a220'], ART.FINANCE_SCALES),

    // Gratitude
    mapIds([
      'a286', 'a15', 'a186', 'a34', 'a300', 'a188', 'a190', 'a191', 'a192', 'm18'
    ], ART.GRATITUDE_BLOOM),

    // Voluntary prayers (Tahajjud, Duha, Witr, Nawafil)
    mapIds([
      'a32', 'a149', 'a25', 'a296', 'a151', 'a269', 'a153', 'a154', 'a155', 'm15'
    ], ART.TAHAJJUD_VIGIL),
    mapIds([
      'a33', 'a157', 'a297', 'a159', 'a161', 'a162', 'a163', 'm16'
    ], ART.DUHA_MORNING),
    mapIds(['a280', 'a298', 'a165', 'a168', 'a169', 'a170'], ART.WITR_CONSTELLATION),
    mapIds([
      'a11', 'a172', 'a173', 'a174', 'a175', 'a263', 'a176', 'a177', 'a178', 'm34', 'm17', 'p18'
    ], ART.NAWAFIL_MASTER),

    // Fasting
    mapIds([
      'a281', 'a13', 'a295', 'a142', 'a22', 'a268', 'a145', 'a146', 'a147', 'm33', 'm14'
    ], ART.FASTING_CRESCENT),

    // Health
    mapIds(['a204', 'a205', 'a206', 'a207', 'a208'], ART.HEALTH_VITALITY),
    mapIds(['a209', 'a210'], ART.WATER_CHAMPION),
    mapIds(['a212', 'a213'], ART.SLEEP_TRACKER),
    mapIds(['a214', 'a215'], ART.EXERCISE_STARTER),

    // Journeys
    mapIds(['a236', 'a237', 'a238'], ART.JOURNEY_COMPASS),
    mapIds(['a239', 'a240', 'a241'], ART.JOURNEY_SUMMIT),

    // Quests, Extra Deeds, Versatile
    mapIds([
      'a10', 'a292', 'a39', 'a20', 'a242', 'a85', 'a86', 'a87', 'a243',
      'a88', 'a89', 'a90', 'a244', 'a91', 'a92', 'a96', 'a259', 'a260',
      'm24', 'm8', 'm25', 'p15', 'p5'
    ], ART.QUEST_SCROLL),
    mapIds([
      'a24', 'a97', 'a36', 'a98', 'a99', 'a100', 'a261', 'a101', 'a102',
      'a103', 'a104', 'a105', 'a107', 'm26', 'm9', 'm27', 'p16', 'p6'
    ], ART.DEED_GEM),
    mapIds([
      'a12', 'a293', 'a110', 'a111', 'a112', 'a113', 'a35', 'a262',
      'a114', 'a115', 'a116', 'a117', 'm28', 'm10', 'm29', 'p17', 'p7'
    ], ART.VERSATILE_STAR),

    // Streaks & Combos
    mapIds(['a272', 'a3', 'a273', 'a287', 'a274', 'a4', 'a63'], ART.STREAK_FLAME),
    mapIds([
      'a16', 'a251', 'a64', 'a252', 'a65', 'a40', 'a66', 'a67', 'a29', 'a249',
      'a68', 'a69', 'a70', 'a71', 'a74', 'm21', 'm4', 'm5', 'p13', 'p3'
    ], ART.STREAK_UNBREAKABLE),
    mapIds(['cs1', 'cs2', 'cs3', 'cs4', 'cs5'], ART.COMBO_STREAK),

    // Level Progression
    mapIds([
      'a277', 'a9', 'a279', 'a290', 'a291', 'a18', 'a75', 'a19', 'a250',
      'a256', 'a76', 'a257', 'a77', 'a258', 'a78', 'a79', 'a80', 'a81',
      'a82', 'a84', 'm22', 'm6', 'm23', 'm7', 'p14', 'p4'
    ], ART.LEVEL_ASCENDANT),

    // Seasonal
    mapIds(['sa1', 'sa2', 'sa3', 'sa7'], ART.RAMADAN_LANTERN),
    mapIds(['sa4', 'sa9'], ART.EID_CELEBRATION),
    mapIds(['sa5', 'sa6'], ART.HAJJ_PILGRIMAGE),
    mapIds(['sa8', 'sa10'], ART.YEAR_OF_FAITH)
  );

  function _esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getAchievementArt(achOrId) {
    const id = typeof achOrId === 'string' ? achOrId : (achOrId && achOrId.id);
    if (id && Object.prototype.hasOwnProperty.call(IQ_ACHIEVEMENT_ART, id)) {
      return IQ_ACHIEVEMENT_ART[id];
    }
    return BADGE_FALLBACK;
  }

  function getAchievementIconSrc(key) {
    if (typeof key === 'string' && Object.prototype.hasOwnProperty.call(IQ_ACHIEVEMENT_ICONS, key)) {
      return IQ_ACHIEVEMENT_ICONS[key];
    }
    return ICON_FALLBACK;
  }

  function renderAchievementIcon(key, cls) {
    const src = getAchievementIconSrc(key);
    const klass = cls ? 'iq-ach-ficon ' + _esc(cls) : 'iq-ach-ficon';
    return '<img class="' + klass + '" src="' + _esc(src) + '" alt="" aria-hidden="true" loading="lazy" decoding="async">';
  }

  function renderAchievementBadge(achOrId, opts) {
    const o = opts || {};
    const ach = typeof achOrId === 'object' && achOrId !== null ? achOrId : { id: achOrId };
    const art = getAchievementArt(ach);
    const tierRaw = o.tier || ach.tier || 'bronze';
    const tier = Object.prototype.hasOwnProperty.call(IQ_RARITY_META, tierRaw) ? tierRaw : 'bronze';
    const rarity = IQ_RARITY_META[tier];
    const unlocked = o.unlocked !== false;
    const size = (o.size === 'sm' || o.size === 'md' || o.size === 'lg' || o.size === 'xl') ? o.size : 'md';
    const showPips = o.showPips !== false;
    const showLock = o.showLock !== false && !unlocked;
    const animate = !!o.animate;
    const stateCls = unlocked ? 'is-unlocked' : 'is-locked';
    const animCls = animate ? ' is-revealing' : '';

    let pipsHtml = '';
    if (showPips) {
      let dots = '';
      for (let i = 0; i < rarity.pips; i++) {
        dots += '<span class="iq-badge-pip"></span>';
      }
      pipsHtml = '<span class="iq-badge-pips" aria-hidden="true">' + dots + '</span>';
    }

    const lockHtml = showLock
      ? '<span class="iq-badge-lock" aria-hidden="true"><img src="' + _esc(IQ_ACHIEVEMENT_ICONS.lock) + '" alt="" loading="lazy"></span>'
      : '';

    let progressHtml = '';
    if (o.progress && typeof o.progress.current === 'number' && typeof o.progress.target === 'number' && o.progress.target > 0) {
      const pct = Math.max(0, Math.min(100, Math.round((o.progress.current / o.progress.target) * 100)));
      progressHtml = '<span class="iq-badge-prog" aria-hidden="true"><span class="iq-badge-prog-bar" style="width:' + pct + '%"></span></span>';
    }

    return (
      '<span class="iq-badge iq-badge--' + size + ' tier-' + tier + ' ' + stateCls + animCls + '" data-tier="' + tier + '" data-category="' + _esc(art.category) + '">' +
        '<span class="iq-badge-aura" aria-hidden="true"></span>' +
        '<span class="iq-badge-frame" aria-hidden="true">' +
          '<img class="iq-badge-img" src="' + _esc(art.src) + '" alt="" loading="lazy" decoding="async">' +
          '<span class="iq-badge-sheen"></span>' +
        '</span>' +
        lockHtml +
        pipsHtml +
        progressHtml +
      '</span>'
    );
  }

  window.IQ_ACHIEVEMENT_ART = IQ_ACHIEVEMENT_ART;
  window.IQ_ACHIEVEMENT_ICONS = IQ_ACHIEVEMENT_ICONS;
  window.IQ_RARITY_META = IQ_RARITY_META;
  window.IQ_BADGE_FALLBACK = BADGE_FALLBACK;
  window.getAchievementArt = getAchievementArt;
  window.getAchievementIconSrc = getAchievementIconSrc;
  window.renderAchievementIcon = renderAchievementIcon;
  window.renderAchievementBadge = renderAchievementBadge;
})();
