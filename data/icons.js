/* ═══════════════════════════════════════════════════════
   Ibadah Quest — Central Icon Map (Google Noto Emoji)
   Every icon KEY → Noto emoji codepoint. The 128px PNG files live
   in assets/icons/ as emoji_u{code}.png (pre-fetched for offline PWA).
   ═══════════════════════════════════════════════════════ */

/* KEY → emoji character (plain-text contexts: confirm(), placeholders, confetti) */
const IQ_EMOJI = {
  'alert-triangle':'⚠️', 'award':'🏅', 'baby':'👶', 'bar-chart-3':'📊',
  'beads':'📿', 'book':'📕', 'book-open':'📖', 'bookmarks':'📑',
  'brain':'🧠', 'briefcase':'💼', 'building':'🏢', 'calendar':'📅',
  'calendar-check':'📆', 'calendar-days':'🗓️', 'lightbulb':'💡',
  'map':'🗺️', 'castle':'🏯', 'check':'✅', 'clipboard':'📋',
  'clock':'⏰', 'cloud-sun':'⛅', 'coffin':'⚰️',   'credit-card':'💳',
  'dna':'🧬', 'dollar-sign':'💵', 'droplets':'💧', 'eye':'👁️',
  'flame':'🔥', 'flower':'🌸', 'gem':'💎', 'gift':'🎁',
  'globe':'🌐', 'hand-heart':'🙏', 'handshake':'🤝', 'heart':'❤️',
  'home':'🏠', 'hourglass':'⌛', 'info':'ℹ️', 'kaaba':'🕋',
  'landmark':'🏛️', 'leaf':'🍃', 'lock':'🔒', 'log-out':'🚪',
  'medal':'🏅', 'megaphone':'📣', 'message-circle':'💬', 'microscope':'🔬',
  'monitor':'🖥️', 'moon':'🌙', 'mosque':'🕌', 'palette':'🎨',
  'pencil':'✏️', 'pen-tool':'🖊️', 'plane':'✈️', 'plus':'➕',
  'refresh-cw':'🔄', 'save':'💾', 'scales':'⚖️', 'scroll':'📜',
  'search':'🔍', 'settings':'⚙️', 'shield':'🛡️', 'sparkles':'✨',
  'sprout':'🌱', 'star':'⭐', 'sun':'☀️', 'sunrise':'🌅',
  'sunset':'🌇', 'target':'🎯', 'trash':'🗑️', 'trending-up':'📈',
  'trophy':'🏆', 'user':'🧑', 'users':'👥', 'utensils':'🍴',
  'wallet':'💰', 'x':'❌', 'zap':'⚡', 'anchor':'⚓',
  'cloud-lightning':'⛈️', 'waves':'🌊', 'tree':'🌳', 'circle':'⭕',
  'salad':'🥗', 'rocket':'🚀', 'crescent':'🌙', 'lantern':'🏮',
  'night':'🌃', 'snow':'❄️', 'coin':'🪙', 'door':'🚪',
  'diamond':'💠', 'sword':'⚔️', 'crown':'👑', 'rainbow':'🌈',
  'school':'🏫', 'bin':'🗑️', 'heartbeat':'💓', 'pill':'💊',
  'droplet':'💧', 'leafy':'🥬', 'globe2':'🌍', 'key':'🔑',
  'headphones':'🎧', 'city':'🌆', 'smile':'😄', 'family':'👪',
  'hand':'👋', 'bed':'🛏️', 'stethoscope':'🩺', 'clock2':'🕰️',
  'wave':'🌊', 'fountain':'⛲', 'milk':'🥛'
};

/* KEY → uppercase hex codepoint used to build emoji_u{code}.png filename */
const IQ_CODES = {
  'alert-triangle':'26A0', 'award':'1F3C5', 'baby':'1F476', 'bar-chart-3':'1F4CA',
  'beads':'1F4FF', 'book':'1F4D5', 'book-open':'1F4D6', 'bookmarks':'1F4D1',
  'brain':'1F9E0', 'briefcase':'1F4BC', 'building':'1F3E2', 'calendar':'1F4C5',
  'calendar-check':'1F4C6', 'calendar-days':'1F5D3', 'lightbulb':'1F4A1',
  'map':'1F5FA', 'castle':'1F3EF', 'check':'2705', 'clipboard':'1F4CB',
  'clock':'23F0', 'cloud-sun':'26C5', 'coffin':'26B0', 'credit-card':'1F4B3',
  'dna':'1F9EC', 'dollar-sign':'1F4B5', 'droplets':'1F4A7', 'eye':'1F441',
  'flame':'1F525', 'flower':'1F338', 'gem':'1F48E', 'gift':'1F381',
  'globe':'1F310', 'hand-heart':'1F64F', 'handshake':'1F91D', 'heart':'2764',
  'home':'1F3E0', 'hourglass':'231B', 'info':'2139', 'kaaba':'1F54B',
  'landmark':'1F3DB', 'leaf':'1F343', 'lock':'1F512', 'log-out':'1F6AA',
  'medal':'1F3C5', 'megaphone':'1F4E3', 'message-circle':'1F4AC', 'monitor':'1F5A5',
  'moon':'1F319', 'mosque':'1F54C', 'palette':'1F3A8', 'pencil':'270F',
  'pen-tool':'1F58B', 'plane':'2708', 'plus':'2795', 'refresh-cw':'1F504',
  'save':'1F4BE', 'scales':'2696', 'scroll':'1F4DC', 'search':'1F50D',
  'settings':'2699', 'shield':'1F6E1', 'sparkles':'2728', 'sprout':'1F331',
  'star':'2B50', 'sun':'2600', 'sunrise':'1F305', 'sunset':'1F307',
  'target':'1F3AF', 'trash':'1F5D1', 'trending-up':'1F4C8', 'trophy':'1F3C6',
  'user':'1F9D1', 'users':'1F465', 'utensils':'1F374', 'wallet':'1F4B0',
  'x':'274C', 'zap':'26A1', 'anchor':'2693', 'cloud-lightning':'26C8',
  'waves':'1F30A', 'tree':'1F333', 'circle':'2B55', 'salad':'1F951',
  'rocket':'1F680', 'crescent':'1F31B', 'lantern':'1F3EE', 'night':'1F303',
  'snow':'2744', 'coin':'1FA99', 'door':'1F6AA', 'diamond':'1F4A0',
  'sword':'2694', 'crown':'1F451', 'rainbow':'1F308', 'school':'1F3EB',
  'bin':'1F5D1', 'heartbeat':'1F493', 'pill':'1F48A', 'droplet':'1F4A7',
  'leafy':'1F96C', 'globe2':'1F30D', 'key':'1F511',
  'headphones':'1F3A7', 'smile':'1F604', 'family':'1F46A', 'city':'1F306',
  'stethoscope':'1FA7A', 'bed':'1F6CF', 'hourglass2':'231B', 'wave':'1F30A',
  'fountain':'26F2', 'milk':'1F95B',
  'microscope':'1F52C', 'hand':'1F44B', 'clock2':'1F570'
};

/* ID → KEY map for every tab, prayer, deed, feature & collection id */
const IQ_IDS = {
  /* Daily prayers + Jummah */
  'fajr':'sunrise', 'dhuhr':'sun', 'asr':'cloud-sun', 'maghrib':'sunset',
  'isha':'moon', 'jummah':'mosque',

  /* Voluntary prayers */
  'tahajjud':'night', 'witr':'moon', 'tarawih':'lantern', 'istikhara':'star',
  'tawbah':'hand-heart', 'hajah':'hand-heart', 'safar':'plane',
  'shukr':'sunrise', 'duha':'sun', 'ishraq':'sunrise', 'awwabin':'sunset',
  'tasbih':'beads', 'tahiyatul_masjid':'mosque', 'tahiyatul_wudu':'droplets',
  'janazah':'coffin', 'kusoof':'cloud-sun', 'khusoof':'moon',
  'istisqa':'cloud-lightning', 'eid_fitr':'sparkles', 'eid_adha':'crown',

  /* Daily tabs (flat ibadah group) */
  'today':'home', 'timer':'clock', 'quests':'scroll', 'journeys':'map',
  'morning':'sunrise', 'evening':'sunset', 'dhikr':'beads', 'situational':'heart',
  'extradeeds':'star', 'volprayers':'moon',
  'wudu':'droplets', 'salah':'mosque', 'fasting':'crescent', 'healthlog':'heartbeat',
  'finance':'wallet',

  /* Profile tabs */
  'profile':'user', 'trophies':'trophy', 'progress':'bar-chart-3',
  'stats':'trending-up', 'rewards':'gift', 'growth':'sprout', 'profile_main':'user',

  /* Hadith collections */
  'bukhari':'book', 'muslim':'book-open', 'nawawi':'bookmarks',

  /* ── Knowledge groups (cat chips) ── */
  'knowledge':'book-open', 'ibadah':'mosque', 'library':'book',
  'names_main':'brain', 'allah_names':'moon', 'scholars_names':'book',

  /* quran_sunnah */
  'quran_sunnah':'book-open', 'quran':'book-open', 'tafsir':'book',
  'hadith':'bookmarks', 'sunnahs':'star', 'memorization':'brain',

  /* fiqh */
  'fiqh':'scales', 'purification':'droplets', 'salah':'mosque',
  'salahrules':'mosque',   'zakat':'wallet', 'zakatcalc':'coin', 'zakatrules':'wallet',
  'sawmrules':'crescent', 'hajj':'kaaba', 'hajjrules':'kaaba',
  'trade':'handshake', 'inheritance':'scroll', 'oaths':'handshake',

  /* creed / arabic */
  'creed':'book', 'arabic':'pencil', 'aqeedah':'book',

  /* heart */
  'heart':'heart', 'ikhlas':'hand-heart', 'tawakkul':'shield',
  'manners':'handshake', 'patience':'hourglass', 'gratitude':'sun',
  'sins':'alert-triangle', 'repentance':'hand-heart', 'zuhd':'leaf',
  'inspirations':'sparkles', 'sufism':'crescent', 'tazkiyah':'sprout',
  'fear':'cloud-sun', 'hope':'sun', 'loveofallah':'heart',
  'contentment':'smile', 'reflection':'pencil',

  /* society */
  'society':'users', 'family':'family', 'marriage':'gem',
  'parenting':'baby', 'charity':'hand-heart', 'orphans':'baby',
  'work':'briefcase', 'neighbors':'home', 'community':'users',
  'ummah':'globe', 'dawah':'megaphone', 'punishments':'scales',
  'brotherhood':'handshake', 'sisterhood':'users', 'orphans2':'baby',
  'elderly':'family', 'disabled':'user', 'antiracism':'heart',
  'poverty':'hand-heart', 'volunteering':'hand-heart',

  /* life */
  'life':'leaf', 'health':'heartbeat', 'tibb':'leaf', 'food':'utensils',
  'environment':'tree', 'travel':'plane', 'youth':'zap',
  'tech':'monitor', 'technology':'monitor', 'socialmedia':'globe',
  'ethics':'handshake', 'bioethics':'dna', 'modfinance':'dollar-sign',
  'politics':'landmark', 'green':'sprout', 'mentalhealth':'brain',
  'education':'school',

  /* history */
  'history':'clock', 'seerah':'scroll', 'sahaba':'users',
  'prophets':'crescent', 'women':'family', 'stories':'book-open',
  'battles':'sword', 'science':'monitor',

  /* hereafter */
  'hereafter':'moon', 'akhirah':'moon', 'jannah':'sparkles',
  'jahannam':'flame', 'grave':'moon', 'signs':'clock', 'dreams':'moon',

  /* ── Library groups (tab-groups.js) ── */
  'dynasties':'landmark', 'umayyads':'crescent', 'abbasids':'book-open',
  'andalus':'palette', 'ottomans':'crown', 'mamluks':'shield',
  'seljuks':'moon', 'fatimids':'star', 'ayyubids':'sword',
  'modernhist':'trending-up', 'ancientprophets':'scroll',
  'cities':'building', 'mecca':'kaaba', 'medina':'kaaba',
  'jerusalem':'mosque', 'damascus':'mosque', 'baghdad':'mosque',
  'cairo':'mosque', 'cordoba':'palette', 'istanbul':'crown',
  'bukhara':'book', 'samarkand':'building',
  'arts':'palette', 'calligraphy':'pen-tool', 'architecture':'mosque',
  'geometry':'target', 'poetryart':'pen-tool', 'literature':'book-open',
  'nasheeds':'headphones', 'illumination':'sparkles', 'textiles':'palette',
  'ceramics':'palette', 'woodwork':'leaf', 'wood':'tree',
  'arabic_lang':'pencil', 'arabicgrammar':'pencil', 'vocab':'book-open',
  'rhetoric':'pen-tool', 'morphology':'pencil', 'pronunciation':'megaphone',
  'poetry':'pen-tool', 'proverbs':'lightbulb', 'etymology':'book-open',
  'dialects':'globe', 'scripts':'pencil',
  'philosophy':'brain', 'epistemology':'brain', 'ontology':'globe',
  'logic':'brain', 'kalam':'book', 'reason':'lightbulb',
  'freewill':'shield', 'problemofevil':'alert-triangle',
  'prophethood':'scroll', 'existence':'eye',

  /* Rewards shop (data/shop.js) */
  'r1':'medal', 'r2':'zap', 'r3':'gift', 'r4':'snow',
  'r5':'star', 'r6':'refresh-cw', 'r7':'shield', 'r8':'sword',
  'r9':'star', 'r10':'crown', 'r11':'snow', 'r12':'gem',
  'r13':'star', 'r14':'heart', 'r15':'sparkles', 'r16':'sword',
  'r17':'hand-heart', 'r18':'moon', 'r19':'gem', 'r20':'award',
  'r21':'crown', 'r22':'star', 'r23':'heart', 'r24':'sparkles',
  'r25':'kaaba', 'r26':'hand-heart', 'r27':'star'
};

/* fallback KEY used when nothing matches */
const IQ_FALLBACK = 'sparkles';

/* Keyword auto-resolve for id strings (deeds, achievements, quests …) */
const IQ_AUTO = [
  ['quran', 'book-open'], ['tafsir', 'book'], ['hadith', 'bookmarks'],
  ['adhkar', 'beads'], ['dhikr', 'beads'], ['wudu', 'droplets'],
  ['fast', 'crescent'], ['sawm', 'crescent'], ['salam', 'handshake'],
  ['mesjid', 'mosque'], ['masjid', 'mosque'], ['pray', 'sunrise'],
  ['tahajjud', 'night'], ['istighfar', 'hand-heart'], ['taubah', 'hand-heart'],
  ['repentance', 'hand-heart'], ['charity', 'hand-heart'], ['sadaqah', 'hand-heart'],
  ['donate', 'hand-heart'], ['volunteer', 'hand-heart'], ['feed', 'utensils'],
  ['parents', 'family'], ['family', 'family'], ['marriage', 'gem'],
  ['parents', 'family'], ['sibling', 'family'], ['neighbor', 'home'],
  ['smile', 'smile'], ['greet', 'handshake'], ['salam', 'handshake'],
  ['kind', 'heart'], ['love', 'heart'], ['patient', 'hourglass'],
  ['gratitude', 'sun'], ['shukr', 'sun'], ['thank', 'hand-heart'],
  ['learn', 'book-open'], ['study', 'book-open'], ['read', 'book-open'],
  ['memorize', 'brain'], ['science', 'monitor'], ['research', 'search'],
  ['walk', 'map'], ['travel', 'plane'], ['journey', 'map'], ['hajj', 'kaaba'],
  ['umrah', 'kaaba'], ['health', 'heartbeat'], ['exercise', 'heartbeat'],
  ['water', 'droplets'], ['drink', 'milk'], ['day', 'sun'], ['streak', 'flame'],
  ['consisten', 'flame'], ['morning', 'sunrise'], ['evening', 'sunset'],
  ['night', 'moon'], ['book', 'book-open'], ['garden', 'sprout'],
  ['enviro', 'tree'], ['plant', 'sprout'], ['clean', 'sparkles'],
  ['money', 'dollar-sign'], ['finance', 'wallet'], ['saving', 'coin'],
  ['give', 'gift'], ['gift', 'gift'], ['music', 'headphones'],
  ['art', 'palette'], ['skill', 'zap'], ['work', 'briefcase'],
  ['discipline', 'shield'], ['forgiveness', 'hand-heart'], ['peace', 'sparkles'],
  ['self', 'user'], ['friend', 'users'], ['edeployment', 'globe'],
  ['salawat', 'star'], ['dua', 'hand-heart'], ['salam', 'handshake'],
  ['ayat', 'book-open'], ['tasbih', 'beads'], ['adhan', 'megaphone'],
  ['share_food', 'utensils'], ['animals', 'flower'], ['trash', 'bin'],
  ['rock', 'trash'], ['oppressed', 'shield'], ['sick', 'heartbeat'],
  ['elder', 'family'], ['orphan', 'baby'], ['anger', 'flame'],
  ['eyes', 'eye'], ['fault', 'eye'], ['backbit', 'alert-triangle'],
  ['tongue', 'message-circle'], ['words', 'message-circle'], ['suspicion', 'eye'],
  ['pride', 'scales'], ['advise', 'message-circle'], ['silent', 'lock'],
  ['invite', 'gift'], ['ilm', 'book-open'], ['teach', 'pencil'],
  ['knowledge', 'book-open'], ['scholar', 'award'], ['sponsor', 'hand-heart'],
  ['reflect', 'search'], ['lec', 'megaphone'], ['dars', 'users'],
  ['relative', 'family'], ['spouse', 'heart'], ['kids', 'baby'],
  ['women', 'family'], ['children', 'baby'], ['miswak', 'key'],
  ['truth', 'scales'],
  ['halal', 'check'], ['clothes', 'heart'], ['perfume', 'flower'],
  ['nails', 'pencil'], ['sleep', 'moon'], ['bed', 'moon'],
  ['bismillah', 'star'], ['eat', 'utensils'], ['praise', 'sun'],
  ['sneeze', 'hand-heart'], ['toilet', 'droplets'], ['home_', 'home'],
  ['pat_head', 'hand-heart'], ['reply', 'message-circle'],
  ['hug', 'hand-heart'], ['visit', 'map'], ['answer', 'message-circle'],
  /* achievements / generic words */
  ['first', 'star'], ['step', 'map'], ['achiever', 'award'],
  ['level', 'trending-up'], ['quest', 'scroll'],
  ['diversif', 'target'], ['flawless', 'gem'], ['hafiz', 'book-open'],
  ['generous', 'gift'], ['champion', 'trophy'], ['master', 'trophy'],
  ['keeper', 'shield'], ['legend', 'award'], ['soul', 'sparkles'],
  ['crown', 'crown'], ['streak', 'flame'], ['scholar', 'book-open'],
  ['warrior', 'sword'], ['guardian', 'shield'], ['seeker', 'target'],
  ['worshipper', 'moon'], ['servant', 'hand-heart'], ['light', 'sparkles'],
  ['bird', 'sunrise'], ['path', 'map'], ['ramadan', 'crescent'],
  ['eid', 'sparkles'], ['night', 'moon'], ['dawn', 'sunrise'],
  ['fajr', 'sunrise'], ['dhuhr', 'sun'], ['asr', 'cloud-sun'],
  ['maghrib', 'sunset'], ['isha', 'moon'], ['jummah', 'mosque'],
  ['witr', 'moon'], ['duha', 'sun'], ['tara', 'lantern'], ['qiyam', 'moon'],
  ['tahajjud', 'night'], ['voluntar', 'star'], ['consistent', 'flame'],
  ['golden', 'gem'], ['celestial', 'moon'], ['pure', 'sparkles'],
  ['friend', 'users'], ['flex', 'zap'], ['gratitude', 'sun']
];

function _iqAutoResolve(key) {
  if (typeof key !== 'string') return '';
  const s = key.toLowerCase();
  for (const kw of IQ_AUTO) {
    if (s.indexOf(kw[0]) !== -1) return kw[1];
  }
  return '';
}

/* Same keyword fallback but ranked by precedence: explicit map → keyword → none */
function _iqResolve(key) {
  if (typeof key !== 'string') key = '';
  return IQ_IDS[key] || _iqAutoResolve(key) || key;
}
function _iqFile(key) {
  const code = IQ_CODES[_iqResolve(key)];
  return code ? 'assets/icons/emoji_u' + code.toLowerCase() + '.png' : '';
}

/* HTML context — <img> tag with the illustrated Noto icon */
function iqIcon(key) {
  const f = _iqFile(key);
  if (!f) return '';
  const k = _iqResolve(key);
  return '<img class="iq-icon" src="' + f + '" alt="' + (IQ_EMOJI[k] || '') + '" role="img" aria-label="' + key + '" loading="lazy">';
}

/* Plain-text context — the emoji character itself */
function iqEmoji(key) {
  return IQ_EMOJI[_iqResolve(key)] || '';
}

/* Resolve the PNG path for a key or id (used when building<img> variants) */
function iqSrc(key) { return _iqFile(key); }

window.IQ_EMOJI = IQ_EMOJI;
window.IQ_CODES = IQ_CODES;
window.IQ_IDS = IQ_IDS;
window.iqIcon = iqIcon;
window.iqEmoji = iqEmoji;
window.iqSrc = iqSrc;