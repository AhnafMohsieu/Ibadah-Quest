# OpenCode Prompt — Noto Emoji Icons for the Full IQ App

---

## Your Task

I need you to implement **Google Noto Emoji** illustrated icons across my entire **Islamic Gamification Tracker (IQ)** app — not just the 5 prayers, but every section, feature, tab, deed category, and UI element throughout the whole app.

**Before making any changes**, read the full codebase first:
- `index.html` — main app shell and all rendered HTML sections
- `render/render.js` — all rendering logic and component generation
- `core/actions.js` — all actions and state logic
- `data/deeds.js` — all deed categories and individual deeds
- `data/tab-groups.js` — all tab groups and sub-tabs across the app
- `data/prayers.js` — the 5 daily prayers + Jummah
- `data/voluntary.js` — all voluntary prayers
- `data/quests.js` — daily, weekly, monthly, yearly, lifetime quests
- `data/shop.js` — shop items
- `data/journeys.js` — habit journeys
- `data/achievements.js` — all achievements
- `features/` folder — all feature modules (garden, mood, health, finance, muhasabah, journeys, spiritual-growth/)
- `styles/main.css` — existing styles

Only after reading all of this, plan and implement.

---

## Icon Source — Google Noto Emoji

Use **Google Noto Emoji** (open-source, free, beautiful illustrated style):

**GitHub:** `https://github.com/googlefonts/noto-emoji`

**PNG CDN base URL (128px recommended):**
```
https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/emoji_u{UNICODE}.png
```

**SVG CDN base URL:**
```
https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u{UNICODE}.svg
```

Download the needed files and place them in an `assets/icons/` folder in the project root, OR reference them via CDN — whichever approach is more consistent with how the app currently handles assets.

---

## Complete Icon Mapping

### 🕌 5 Daily Prayers + Jummah
| Prayer | Icon | Unicode | Emoji |
|--------|------|---------|-------|
| Fajr | Sunrise | `1f305` | 🌅 |
| Dhuhr | Sun | `2600` | ☀️ |
| Asr | Sun Behind Cloud | `26c5` | ⛅ |
| Maghrib | Cityscape at Dusk | `1f306` | 🌆 |
| Isha | Crescent Moon | `1f319` | 🌙 |
| Jummah | Mosque | `1f54c` | 🕌 |

---

### 🤲 Voluntary Prayers
| Prayer | Icon | Unicode | Emoji |
|--------|------|---------|-------|
| Tahajjud | Starry Night | `1f303` | 🌃 |
| Witr | Night with Stars | `1f320` | 🌠 |
| Tarawih | Lantern | `1f3ee` | 🏮 |
| Duha | Sun with Face | `1f31e` | 🌞 |
| Ishraq | Sunrise Over Mountains | `1f304` | 🌄 |
| Awwabin | Sunset | `1f307` | 🌇 |
| Janazah | Wilted Flower | `1f940` | 🥀 |
| Istikhara | Stars | `2b50` | ⭐ |
| Tawbah | Dove | `1f54a` | 🕊️ |
| Hajah | Folded Hands | `1f64f` | 🙏 |
| Eid al-Fitr | Party Popper | `1f389` | 🎉 |
| Eid al-Adha | Sheep | `1f411` | 🐑 |
| Tasbih Prayer | Prayer Beads | `1f4ff` | 📿 |
| Kusoof/Khusoof | Solar Eclipse | `1f311` | 🌑 |
| Istisqa | Cloud with Rain | `1f327` | 🌧️ |

---

### 📖 Ibadah & Spirituality Deeds
| Deed | Icon | Unicode | Emoji |
|------|------|---------|-------|
| Read Quran | Open Book | `1f4d6` | 📖 |
| Listen to Quran | Headphones | `1f3a7` | 🎧 |
| Dhikr | Prayer Beads | `1f4ff` | 📿 |
| Salawat | Star and Crescent | `262a` | ☪️ |
| Istighfar | Dove | `1f54a` | 🕊️ |
| Make Dua | Folded Hands | `1f64f` | 🙏 |
| Dua for Others | Heart | `1f49b` | 💛 |
| Dua in Last 3rd | Night Sky | `1f319` | 🌙 |
| Voluntary Fast | No Food | `1f372` | 🍲 |
| Pray in Masjid | Mosque | `1f54c` | 🕌 |
| Wudu | Water Droplet | `1f4a7` | 💧 |
| Ayatul Kursi | Book | `1f4d5` | 📕 |
| Tasbih Fatimah | Prayer Beads | `1f4ff` | 📿 |
| Reply to Adhan | Loudspeaker | `1f4e3` | 📣 |
| Surah Kahf | Scroll | `1f4dc` | 📜 |

---

### ❤️ Charity & Social Deeds
| Deed | Icon | Unicode | Emoji |
|------|------|---------|-------|
| Charity | Money with Wings | `1f4b8` | 💸 |
| Secret Charity | Wrapped Gift | `1f381` | 🎁 |
| Continuous Charity | Seedling | `1f331` | 🌱 |
| Feed Someone | Bowl with Spoon | `1f963` | 🥣 |
| Provide Water | Potable Water | `1f6b0` | 🚰 |
| Care for Orphan | Child | `1f9d2` | 🧒 |
| Kindness to Animals | Paw Prints | `1f43e` | 🐾 |
| Remove Harm | Broom | `1f9f9` | 🧹 |
| Help Neighbors | House | `1f3e0` | 🏠 |
| Give a Gift | Gift | `1f381` | 🎁 |
| Visit the Sick | Hospital | `1f3e5` | 🏥 |
| Clean Mosque | Sparkles | `2728` | ✨ |

---

### 🌟 Character & Ethics Deeds
| Deed | Icon | Unicode | Emoji |
|------|------|---------|-------|
| Act of Kindness | Sparkling Heart | `1f496` | 💖 |
| Smile (Sunnah) | Smiling Face | `1f604` | 😄 |
| Forgive Someone | White Heart | `1f90d` | 🤍 |
| Speak the Truth | Megaphone | `1f4e2` | 📢 |
| Practice Patience | Hourglass | `231b` | ⌛ |
| Control Anger | Exhaling Face | `1f62e` | 😮 |
| Lower the Gaze | Eyes | `1f440` | 👀 |
| Avoid Backbiting | No Entry | `26d4` | ⛔ |
| Guard the Tongue | Locked | `1f512` | 🔒 |
| Humble Yourself | Bow | `1f647` | 🙇 |

---

### 📚 Knowledge & Learning Deeds
| Deed | Icon | Unicode | Emoji |
|------|------|---------|-------|
| Islamic Knowledge | Graduation Cap | `1f393` | 🎓 |
| Teach Something | Teacher / Pencil | `270f` | ✏️ |
| Learn Allah's Name | Sparkles | `2728` | ✨ |
| Attend Halaqah | People | `1f465` | 👥 |
| Memorize a Verse | Brain | `1f9e0` | 🧠 |
| Read Tafsir | Books | `1f4da` | 📚 |
| Read Seerah | Scroll | `1f4dc` | 📜 |
| Listen to Lecture | Microphone | `1f3a4` | 🎤 |
| Study Tajweed | Musical Notes | `1f3b5` | 🎵 |

---

### 👨‍👩‍👧 Family & Relatives Deeds
| Deed | Icon | Unicode | Emoji |
|------|------|---------|-------|
| Honor Parents | Family | `1f46a` | 👪 |
| Dua for Parents | Folded Hands | `1f64f` | 🙏 |
| Maintain Ties | Link | `1f517` | 🔗 |
| Help with Chores | Broom | `1f9f9` | 🧹 |
| Help Spouse | Couple | `1f491` | 💑 |
| Smile at Family | Smile | `1f604` | 😄 |
| Play with Children | Balloon | `1f388` | 🎈 |
| Gift to Spouse | Gift | `1f381` | 🎁 |
| Cook for Family | Pot of Food | `1f372` | 🍲 |

---

### ☀️ Daily Sunnahs Deeds
| Deed | Icon | Unicode | Emoji |
|------|------|---------|-------|
| Morning Adhkar | Sunrise | `1f305` | 🌅 |
| Evening Adhkar | Sunset | `1f307` | 🌇 |
| Use Miswak | Toothbrush | `1fab5` | 🪥 |
| Eat Halal Only | Green Salad | `1f957` | 🥗 |
| Wear Perfume | Bottle | `1f9f4` | 🧴 |
| Clip Nails | Nail Polish | `1f485` | 💅 |
| Wudu Before Sleep | Droplet | `1f4a7` | 💧 |
| Sleep on Right Side | Bed | `1f6cf` | 🛏️ |
| Say Bismillah | Star | `2b50` | ⭐ |
| Initiate Salam | Waving Hand | `1f44b` | 👋 |
| Dua Leaving Home | Door | `1f6aa` | 🚪 |

---

### 🏆 App Sections & UI Tabs
| Section/Tab | Icon | Unicode | Emoji |
|-------------|------|---------|-------|
| Today / Dashboard | House | `1f3e0` | 🏠 |
| Prayer Times | Clock | `23f0` | ⏰ |
| Quests | Scroll | `1f4dc` | 📜 |
| Journeys | Map | `1f5fa` | 🗺️ |
| Morning Adhkar | Sunrise | `1f305` | 🌅 |
| Evening Adhkar | Sunset | `1f307` | 🌇 |
| Remembrance / Dhikr | Prayer Beads | `1f4ff` | 📿 |
| Ablution / Wudu | Water | `1f4a7` | 💧 |
| Prayer Guide / Salah | Mosque | `1f54c` | 🕌 |
| Fasting | Crescent | `1f319` | 🌙 |
| Health | Stethoscope | `1fa7a` | 🩺 |
| Finance | Money Bag | `1f4b0` | 💰 |
| Mood | Rainbow | `1f308` | 🌈 |
| Quran | Open Book | `1f4d6` | 📖 |
| Hadith | Books | `1f4da` | 📚 |
| Tafsir | Magnifying Glass | `1f50d` | 🔍 |
| Memorization | Brain | `1f9e0` | 🧠 |
| Prophetic Ways | Star | `2b50` | ⭐ |
| Fiqh / Jurisprudence | Balance Scale | `2696` | ⚖️ |
| Purification | Soap | `1f9fc` | 🧼 |
| Zakat | Coins | `1fa99` | 🪙 |
| Hajj | Kaaba | `1f54b` | 🕋 |
| Arabic | Arabic Letter | `1f1e6` | 🇦 |
| Heart Diseases | Broken Heart | `1f494` | 💔 |
| Sincerity | Diamond | `1f4a0` | 💠 |
| Tawakkul | Anchor | `2693` | ⚓ |
| Manners | Handshake | `1f91d` | 🤝 |
| Patience | Hourglass | `231b` | ⌛ |
| Major Sins | Warning | `26a0` | ⚠️ |
| Repentance | Dove | `1f54a` | 🕊️ |
| Zuhd / Asceticism | Leaf | `1f343` | 🍃 |
| Family | Family | `1f46a` | 👪 |
| Marriage | Rings | `1f48d` | 💍 |
| Parenting | Baby | `1f476` | 👶 |
| Charity | Heart with Ribbon | `1f49d` | 💝 |
| Community | Earth | `1f30d` | 🌍 |
| Ummah | Globe | `1f310` | 🌐 |
| Dawah | Megaphone | `1f4e3` | 📣 |
| Seerah / Biography | Scroll | `1f4dc` | 📜 |
| Companions | People | `1f465` | 👥 |
| Prophets | Star | `1f31f` | 🌟 |
| Great Women | Woman | `1f469` | 👩 |
| Battles | Sword | `2694` | ⚔️ |
| Science | Microscope | `1f52c` | 🔬 |
| Hereafter / Akhirah | Hourglass Done | `231b` | ⌛ |
| Paradise / Jannah | Sparkles | `2728` | ✨ |
| Hellfire / Jahannam | Fire | `1f525` | 🔥 |
| The Grave | Night | `1f30c` | 🌌 |
| Signs of Qiyamah | Clock | `1f551` | 🕑 |
| Islamic Dreams | Cloud | `2601` | ☁️ |
| Health (Life) | Green Heart | `1f49a` | 💚 |
| Prophetic Medicine | Herb | `1f33f` | 🌿 |
| Halal Food | Fork & Knife | `1f374` | 🍴 |
| Environment | Earth | `1f333` | 🌳 |
| Travel | Compass | `1f9ed` | 🧭 |
| Youth | Fire | `1f525` | 🔥 |
| Tech & Islam | Phone | `1f4f1` | 📱 |
| Mental Health | Purple Heart | `1f49c` | 💜 |
| Education | School | `1f3eb` | 🏫 |

---

### 🏅 Gamification UI Elements
| Element | Icon | Unicode | Emoji |
|---------|------|---------|-------|
| XP / Points | Lightning | `26a1` | ⚡ |
| Level Up | Trophy | `1f3c6` | 🏆 |
| Streak | Fire | `1f525` | 🔥 |
| Achievements | Medal | `1f3c5` | 🏅 |
| Leaderboard | Chart | `1f4ca` | 📊 |
| Shop | Shopping Bag | `1f6cd` | 🛍️ |
| Coins / Currency | Coin | `1fa99` | 🪙 |
| Profile | Person | `1f9d1` | 🧑 |
| Settings | Gear | `2699` | ⚙️ |
| Streak Freeze | Snowflake | `2744` | ❄️ |
| XP Boost | Rocket | `1f680` | 🚀 |
| Mystery Box | Gift Box | `1f381` | 🎁 |
| Quest Complete | Check Mark | `2705` | ✅ |
| Daily Quests | Calendar | `1f4c5` | 📅 |
| Weekly Quests | Calendar Spiral | `1f5d3` | 🗓️ |
| Monthly Quests | Moon Calendar | `1f4c6` | 📆 |
| Yearly Quests | Year | `1f4c4` | 📄 |
| Lifetime Quests | Infinity | `267e` | ♾️ |

---

### 🌱 Special Feature Sections
| Feature | Icon | Unicode | Emoji |
|---------|------|---------|-------|
| Garden (spiritual garden) | Seedling | `1f331` | 🌱 |
| Muhasabah (self-reflection) | Mirror / Thought | `1f4ad` | 💭 |
| Mood Tracker | Face with Rainbow | `1f308` | 🌈 |
| Health Log | Heart with ECG | `1fa7a` | 🩺 |
| Finance Tracker | Chart Increasing | `1f4c8` | 📈 |
| Spiritual Growth | Growing Plant | `1f33f` | 🌿 |
| Laylat al-Qadr | Star | `1f31f` | 🌟 |
| Ramadan | Crescent + Star | `1f319` | 🌙 |
| Journeys / Habit Tracker | Map | `1f5fa` | 🗺️ |
| Boat Journey | Sailboat | `26f5` | ⛵ |
| Lantern | Lantern | `1f3ee` | 🏮 |
| Mosque Journey | Mosque | `1f54c` | 🕌 |

---

### 📿 Deed Category Icons (for the deed log / today screen headers)
| Category | Icon | Unicode | Emoji |
|----------|------|---------|-------|
| Ibadah & Spirituality | Mosque | `1f54c` | 🕌 |
| Charity & Social | Heart | `2764` | ❤️ |
| Character & Ethics | Star | `2b50` | ⭐ |
| Knowledge & Learning | Books | `1f4da` | 📚 |
| Family & Relatives | Family | `1f46a` | 👪 |
| Daily Sunnahs | Sun | `2600` | ☀️ |

---

## How to Implement

1. **Read the entire codebase first** — understand how icons/emojis are currently used (if at all), how components are structured in `render.js`, and how data flows from `data/` files to the UI.

2. **Create the icon system** — create an `assets/icons/` folder and either:
   - Download the PNG files from the Noto Emoji CDN links above and save them locally, OR
   - Reference them via CDN inline in a central icon map object

3. **Create a central `ICONS` map** — a JavaScript object mapping every deed ID, prayer ID, tab ID, and feature ID to its Noto Emoji PNG URL. Keep this in one file (e.g., `data/icons.js`) so it's easy to maintain.

4. **Integrate icons throughout the app** — wherever a prayer, deed, tab, category, or feature is rendered, pull the icon from the `ICONS` map and display it consistently (as a small `<img>` tag, appropriately sized).

5. **Prayer cards specifically** should show: icon on top → prayer name → XP badge (matching the reference screenshot style).

6. **Tab icons** should appear next to each tab label in the navigation/tab system.

7. **Deed icons** should appear next to each deed name in the deed log / check-list.

8. **Category headers** should use the category icon.

9. **Do not break any existing functionality.** Test your understanding of the rendering system in `render.js` and `actions.js` before changing anything.

10. **Be consistent** — all icons should be the same size within their context (e.g., 32px in tabs, 48px in prayer cards, 24px in deed lists).
