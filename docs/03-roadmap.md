# Phase 3 Functionality Gap Analysis & Product Roadmap — Ibadah Quest

**Date:** `2026-11-26`  
**Prioritization Method:** Classified as **Must** (core promise, severe bugs, religious accuracy, privacy/offline, 3-language parity), **Should** (high delight & completeness without blocking core release), and **Could** (future roadmap / native ecosystem expansions).  
**Status Note:** Per user authorization ("Complete all phases"), **all Must items below are implemented, integrated, and verified** on branch `feat/ibadah-quest-upgrade`; Should/Could items remain cleanly structured for subsequent releases.

---

## 1. Ethical Gamification & Notification Policy

### 1.1 XP Curve & Anti-Grind Rules
- **Formula:** Progressive curve `threshold(lv) = Math.floor(100 * Math.pow(lv, 1.5))` anchored calmly so early beginners see steady encouragement (`Lv 2` at `100 XP`, `Lv 5` ~`1,118 XP`) without obsessive infinite farming.
- **Core Rewards:** Daily Prayers (`Fajr` +70, `Dhuhr` +50 / `Jumu'ah` +100, `Asr` +40, `Maghrib` +50, `Isha` +60), Quests (+35–200), Daily Quran Session (+10/day capped), Voluntary Acts (+25–60), Situational Dhikr (+5/act capped).
- **Anti-Spam / Sincerity Guard:** Dhikr counter raw tap XP is capped daily (`MAX_DHIKR_TAP_XP_PER_DAY = 100`) while still counting every tasbih accurately and rewarding completed 33/100 cycles (`+20 XP` capped daily to 5 cycles/day). This prevents autoclicker grinding and keeps tasbih sincere.
- **No Gambling / No Ranking:** Loot boxes (`Mystery Box`), probabilistic drop rolls (`checkSurpriseReward` RNG), net-negative XP packs, and arrogant user titles (`Friend of Allah`, `Pure Soul`) are removed cleanly; deterministic consistency milestones replace RNG rolls.

### 1.2 Quest Taxonomy
| Tier | Purpose | Example Quests | Frequency / Undo |
|---|---|---|---|
| **Daily** | Core gentle rhythm | Dawn Fajr Check-in, 5-Min Quran Reading, Morning/Evening Adhkar, 1 Kindness Act | Resets daily; partial progress & instant undo supported |
| **Weekly** | Sustained consistency & community | Jumu'ah Surah Al-Kahf, Attend Masjid / Pray in Congregation, Family/Friend Kindness | Resets weekly |
| **Seasonal** | Islamic calendar relevance | Ramadan Suhoor/Iftar + Night Prayer (10–20/8-or-20 note), Dhul Hijjah Day of Arafah, Ayyam al-Bid & Mon/Thu optional fasts (user-toggleable) | Activated automatically by Hijri sighting date |
| **Journeys** | Beginner skill & character scaffolding | Learning Wudu & Salah Essentials, 7-Day Morning Gratitude, 30-Day Juz Amma | Self-paced, pause-safe |

### 1.3 Forgiving Streaks & Privacy-First Rest Mode
- **Mid-Day Preservation:** `recalc()` preserves an ongoing active multi-day streak throughout today (e.g., if yesterday had 5/5 prayers, `S.cs` stays unbroken all day today while prayers are still upcoming!).
- **Automatic Grace Window + Recovery:** A single missed day can be recovered kindly via Qada catch-up or weekly grace cushion (`1 grace day / week` without punitive paywalls). Longest streak (`S.bs`) is permanently honored.
- **Zero-Reason Rest Mode:** One-tap `Rest / Grace Mode` (`S.prayerSettings.paused`) pauses streaks and daily prayer quests silently for travel, illness, menstruation, or postnatal bleeding. **The app never asks why, never logs categories like "menstruation", and stores only a local boolean.**

### 1.4 Notification Policy
- **Frequency Cap:** Maximum 6 scheduled alerts per 24h (5 prayers + optional 1 quiet daily reflection/quest nudge).
- **Quiet Hours:** Configurable `quietStart` / `quietEnd` (default `22:30–04:30`, strictly muted unless Fajr alarm explicitly enabled).
- **Tone:** Calm reminders only (`"Fajr window has entered — begin gently with dua"`, `"Evening Adhkar · take 2 quiet minutes"`). Zero guilt/urgency copy.
- **Verification & Platform Bridge:** Fixed browser notification icons (valid local PNG URL), Service Worker notification routing, `Send Test Notification` action in Settings, and `@capacitor/local-notifications` abstraction (`features/native-bridge.js`) ready for iOS 64-limit rolling schedules & Android 12–15 exact alarms.

---

## 2. Market Gap Analysis & Roadmap Matrix

| Area | Gap Identified vs Market | Priority | Value | Principle Fit | Effort | Privacy / License / Risk | Implementation Decision |
|---|---|---|---|---|---|---|---|
| **Offline Astronomical Prayer Engine + Asr/High-Lat/Offsets** | Uncached cities & offline boot fail (`Aladhan` online-only); missing Hanafi Asr & offsets (`Pillars`/`Athan` baseline) | **Must** | Critical | #6, #7 | M | MIT `adhan@4.4.6` (15 KB); zero network ping | **Implement now** (`assets/vendor/adhan.umd.min.js` + `core/render-prayers.js`) |
| **Qibla Compass + Bearing Fallback** | Missing completely | **Must** | High | #6, #7 | S | Sensor optional; manual deg fallback; low risk | **Implement now** (`adhan.Qibla` + Compass view) |
| **Hijri Moon-Sighting Adjustment (`-2..+2`)** | Hardcoded tabular date disagrees with local sighting | **Must** | High | #7 | S | Zero privacy/license impact | **Implement now** (`core/calendar.js` + Settings) |
| **Quran Bangla Translation + Script Cleanup + Credits** | No Bangla translation; `1:1` BOM, `2:1` Bismillah dup; missing credits; add Indo-Pak option | **Must** | Critical | #5, #6, #7 | M | `Taisirul Quran` + `Saheeh Intl` + Indo-Pak credited; store redistribution note flagged in QA | **Implement now** (`data/pools/quran-bn.js`, `quran-indopak.js`, `quran-verses.js`) |
| **Offline Arabic UI + Bangla + Full RTL Mirroring** | Pseudo-Arabic transliteration; zero RTL; no OFL offline fonts; no language UI | **Must** | Critical | #6, #7 | L | Bundled `Amiri Quran`, `Hind Siliguri`, `Noto Sans Arabic` (SIL OFL v1.1, 474 KB) | **Implement now** (`styles/tokens.css`, `data/i18n.js`, `assets/fonts/`) |
| **Light / Dark / OLED Night Themes + AA Contrast + 48px Targets** | Dark/Night stripped; 6 AA failures; 159 small targets; Daily Sheet overflow | **Must** | Critical | #1, #6, #7 | M | Pure CSS tokens | **Implement now** (`styles/tokens.css`, `styles/main.css`, Component Gallery) |
| **Humane Streaks, Rest Mode & Ethical Quests/Shop/Levels** | Broken `recalc()`; `Shirk/Kufr/Nifaq` levels; `Mystery Box`; RNG rewards; silent/loud confetti | **Must** | Critical | #1, #2, #3, #5 | M | Improves trust & religious correctness immediately | **Implement now** (`core/prayers.js`, `data/levels.js`, `data/shop.js`, `features/surprise-rewards.js`, `core/xp.js`) |
| **Startup Flow, Streamlined 5-Tab Today & 60s Onboarding** | Auth gate skips onboarding; Day-0 false modal; 7 blocks push prayers below fold | **Must** | Critical | #1, #6 | M | Zero account needed; on-device default | **Implement now** (`core/actions.js`, `features/onboarding.js`, `features/daily-summary.js`, `features/iq-shell.js`) |
| **Eliminate 38.67 MB CDN Boot + Offline SVG Charts + XSS Fix** | Boot fetches 12 Hadith JSONs & Chart.js CDN; unescaped Hadith `innerHTML`; missing Profile backup buttons | **Must** | Critical | #4, #5, #6 | M | Eliminates 3rd-party boot leakage & XSS vector | **Implement now** (`features/hadith-library.js`, `features/analytics/charts.js`, `core/dynamic.js`) |
| **Zakat Currency & Scholar Gold/Silver Nisab** | Hardcoded USD `$65/$0.8` & single `Math.max` | **Must** | High | #5, #7 | S | Clarifies Hanafi silver vs majority gold scholar opinions | **Implement now** (`features/zakat-calc.js`) |
| **Report Content Error + What's New + Accessibility + In-App Deletion** | Missing feedback/error-reporting, changelog dialog, and exposed delete/export controls | **Must** | High | #4, #5, #7 | S | Local mailto / JSON issue export; zero server upload | **Implement now** (`core/dynamic.js` Profile hub) |
| **Capacitor Native Wrapper Config & Platform Alarm Bridge** | Needed for native Play/App Store distribution (`@capacitor/local-notifications`, native widgets) | **Should** | High | #6 | M | Add `capacitor.config.json` + native bridge JS hooks now; native Xcode/Gradle compilation runs when Capacitor CLI/SDK is provisioned | **Scaffold bridge + config now; document build steps in Checklist** |
| **Spaced-Repetition Memorization Review Queue + Offline Khatam UI Enhancements** | Basic Hifz list exists without active SRS scheduling or flexible khatam pace | **Should** | Medium | #2, #6 | S | Pure local state calculation | **Implement SRS interval + Khatam calculator cleanly** |
| **Local Encrypted Profile Sync (WebDAV / Optional Opt-in Cloud)** | Multi-device opt-in E2E sync | **Could** | Medium | #4 | L | Requires backend infrastructure + key management | **Roadmap v2.3** |
| **Live AI Recitation Follow-Along (`Tarteel`-style)** | On-device ASR model size / cloud cost | **Could** | Medium | #6 | L | High battery/size footprint on low-end phones | **Roadmap v3.0** |
| **Shared Family Household Sync (Cross-Device COPPA)** | Today's multi-profile local family mode works on shared devices; remote kid accounts need COPPA parental verification | **Could** | Medium | #4, #7 | L | Privacy/COPPA compliance overhead | **Roadmap v2.4 (Local Profiles live now; Remote Family later)** |

---

## 3. Must Execution Sequence

1. **Wave A — Design System Foundations & Offline Vendor Bundles:** Add `styles/tokens.css`, bundled WOFF2 fonts (`assets/fonts/`), `adhan@4.4.6` (`assets/vendor/`), refreshed logo (`assets/icons/icon-v2.svg`), real i18n/RTL/numerals/glossary (`data/i18n.js`), and theme switching.
2. **Wave B — Religious Content & Ethical Gamification Repair:** Fix `quran-verses.js` (`1:1`/`2:1`), wire `quran-bn.js` + `quran-indopak.js` lazy pools, sanitize `levels.js`, `shop.js`, `tips-details.js`, `surprise-rewards.js`, `dhikr.js`, `xp.js`, `zakat-calc.js`.
3. **Wave C — Core Flows, Offline Prayer/Qibla, Notifications & Component Gallery:** Upgrade `core/render-prayers.js`, `core/prayers.js`, `core/calendar.js`, `features/notifications.js`, `features/onboarding.js`, `features/daily-summary.js`, `features/iq-shell.js`, `features/hadith-library.js`, `features/analytics/charts.js`, `core/dynamic.js` (Quran reader + Khatam/SRS + Profile backup/CSV/settings/gallery/error-report), `core/actions.js`, `index.html`, `manifest.json`, `sw.js`, `core/precache-manifest.js`, and shared `src/` CSS alignment.
4. **Wave D — Verification, Performance Profiling, Accessibility & Release Docs:** Expand `node --test` suites (prayer fixtures across 7 cities + DST, Hijri offsets, RTL/i18n/plurals, streaks/Rest mode, capped dhikr, schema migrations, XSS/a11y), capture live Chromium before/after benchmarks & screenshots, write `CHANGELOG.md`, `docs/04-optimization-report.md`, and `docs/05-qa-and-release-checklist.md`.
