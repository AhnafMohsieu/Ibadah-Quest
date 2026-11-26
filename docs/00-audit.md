# Phase 0 Audit — Ibadah Quest

**Audit Date:** 2026-11-26  
**Repository Branch:** `feat/ibadah-quest-upgrade` (branched cleanly from `main` at `41c1632`)  
**Scope:** Read-only architectural, functional, religious-content, i18n/RTL, privacy/security, and performance audit. No application source files were modified during Phase 0.  

---

## 1. Executive Summary & Platform Decision

Ibadah Quest is an ambitious, feature-rich Islamic habit-tracking Progressive Web App (PWA) with a large bundled worship library (6,236 Quran ayahs across 114 surahs, 6,357 local hadith entries, 99 Names, situational adhkar, zakat, fasting, Ramadan, masjid check-ins, and reflection tools). Underneath that richness, the audit found severe structural, UX, localization, performance, and theological/gamification issues:

1. **Dual-track incomplete migration & bloated boot:** `index.html` loads **144 `<script>` tags** and **10,579 DOM nodes** upfront, while `src/` holds an unlinked, partially built Vite ESM multi-page skeleton (`src/pages/today/today.html` renders only bare 5 prayer pills + XP in 585 bytes of HTML) with **no root `package.json` or `node_modules`** installed to build it.
2. **Massive unrequested network boot payload:** `features/hadith-library.js` triggers `preloadRemoteCollections()` on `DOMContentLoaded`, downloading **12 remote JSON files (38.67 MB decoded / 5.76 MB compressed)** from `cdn.jsdelivr.net` on every app launch before the user visits the Hadith tab.
3. **Broken first-run UX & stripped themes:** `authOverlay` (`z-index: 100000`) renders over `introOverlay` (`z-index: 99999`), `enterApp()` bypasses onboarding completely, a Day-0 `Daily Summary` popup fires with all zeros due to empty today-log detection, and `core/actions.js` actively strips `data-theme` (`removeAttribute('data-theme')`) on boot.
4. **Inadequate localization for Bangla, English, and Arabic:** `data/i18n.js` maps `'ar'` to romanized Latin transliteration (`Yawmiyya`, `Awqat al-Salah`), has zero Arabic RTL (`dir="rtl"`) chrome mirroring, bundles no Bangla/Arabic UI or Quranic fonts (depending on Google Fonts / system fallbacks), and offers **no UI language switcher** anywhere in Profile or Settings (`iqSetLang()` has no UI trigger).
5. **Unreliable & guilt-framed notifications / streaks:** Reminders use an in-tab 60-second `setInterval` (`features/notifications.js`), zero prayer-time/Adhan notifications, invalid `'🕌'` string icon/badge fields, and guilt copy (`"Streak at Risk!"`, `"Don't break your streak!"`). Meanwhile `recalc()` (`core/prayers.js`) resets the displayed consecutive streak `S.cs` to `1` or `0` mid-day whenever fewer than 5 prayers are checked off.
6. **Religious content & ethics issues:** `levels.js` assigns sinful/derogatory concepts as user rank titles (`365 Shirk of Association`, `366 Kufr of Disbelief`, `367 Nifaq of Hypocrisy`) and leaves levels `596–998` as copy-pasted `"Nur of Light 596..998"`; `shop.js` includes a `"Mystery Box"` loot-box, negative-value XP purchases, and titles like `"Friend of Allah"` / `"Pure Soul"`; `tips-details.js` contains copy errors (`"Darwin"` instead of Paradise, `"Expansion of sins"`, `"Serving an okay person"`); `quran-verses.js` has a BOM on `1:1` and duplicates Bismillah in `2:1`; and `hadith-library.js` inserts remote CDN hadith text into `innerHTML` without HTML escaping.

### Platform Scope Recommendation (Prompt Section 3 Alignment)

Prompt Section 3 specifies: *"Platforms: iOS and Android, mobile-first. Web/PWA is out of scope unless the audit shows the codebase already supports it."*

**Verified Finding:** The repository is **100% a Web/PWA codebase** (`index.html`, `manifest.json`, `sw.js`, `404.html` GitHub Pages routing, plus `src/` Vite MPA). There is **no native iOS (`ios/`, `.xcodeproj`) or Android (`android/`, `build.gradle`) codebase**. Because the codebase already runs as an offline-capable PWA and keeping the existing stack is preferred unless migration is proven necessary:
- **Recommendation:** **Keep Vanilla JS + consolidate onto Vite ES modules (`src/`)** rather than rewriting to React Native or Flutter.
- **Native mobile delivery option (for Gate 1/2 approval):** Wrap the modular Vite web bundle in **Capacitor** (lightweight native shell) if iOS App Store / Google Play distribution, reliable background Adhan local notifications (`@capacitor/local-notifications`), home-screen widgets, and hardware Qibla compass sensors are required. That preserves every line of existing JS logic while unlocking native iOS/Android capabilities.

---

## 2. Baseline Metrics Table

Measured locally against branch `feat/ibadah-quest-upgrade` (`41c1632`) using Node `v24.18.0`, headless Chromium via Playwright (`390x844` mobile & `1280x800` desktop), `http.server` on `127.0.0.1`, and direct filesystem inspection:

| Metric | Measured Baseline | Method / Notes |
|---|---|---|
| **Cold Start (interactive `window.App`)** | **1,473.7 ms** | Playwright `390x844` localhost (`domContentLoaded`: 1,043 ms, `load`: 1,297 ms) |
| **First Paint / FCP** | **664 ms / 1,028 ms** | Performance Paint Timing (`390x844` localhost) |
| **Network Requests on Boot** | **174 requests** | 159 same-origin, **13 `cdn.jsdelivr.net`**, 1 `fonts.googleapis.com`, 1 `api.aladhan.com` |
| **Script Tags Loaded in `index.html`** | **144 `<script>` tags** | Classic synchronous + `defer` scripts without bundling |
| **Initial DOM Node Count** | **10,579 DOM nodes** | Over 100 hidden `.tab-panel` divs stamped into initial HTML |
| **Total Network Transfer on Boot** | **7,172.5 KB (7.00 MB)** | `cdn.jsdelivr.net`: **5,902.3 KB**; same-origin: **1,267.9 KB**; Google Fonts: **2.3 KB** |
| **Total Decoded Payload on Boot** | **40,847.3 KB (39.89 MB)** | `cdn.jsdelivr.net`: **39,597.8 KB** (Chart.js + 12 Hadith JSONs); same-origin: **1,221.3 KB** |
| **JS Heap Memory (Boot Idle)** | **77.63 MB used / 110.63 MB total** | Chromium `performance.memory` after boot |
| **Repository Footprint (source assets)** | **7.86 MB across core code/data/assets** | `data/` 6,527,741 B (79 files); `assets/` 503,340 B (113 files); `core/` 306,475 B (27 files); `features/` 277,748 B (49 files); `styles/` 188,614 B (1 file); `src/` 83,829 B (24 files) |
| **Service Worker Precache Footprint** | **1,308,728 B (1.25 MB, 154 URLs)** | Defined in `core/precache-manifest.js`; **excludes** 6.1 MB local Quran/Hadith pools & analytics |
| **Touch Targets < 44x44px (Today View)** | **159 small targets** | Includes `.card-qada-btn` (23x22), `.card-info-btn` (24x24), `.carousel-nav-btn` (30x30), `.carousel-dot` (8x8), `.skip-link` (123x34), `.global-search` (368x37) |
| **WCAG AA Contrast Failures (Today View)** | **6 distinct UI token failures** | `.skip-link` & `.iq-next-badge` & `.iq-pill-eta`: `4.22:1` (`#fff` on `#0b8a82`); `.iq-hero-ch-link`: `4.01:1`; `.iq-rhythm-lbl`: `3.15:1`; `.global-search-icon`: `2.99:1` |
| **200% Text Scaling Horizontal Overflow** | **0 px overflow (`390 / 390`)**, minor wrap defect | `Details ›` wraps mid-word (`Deta` / `ils ›`) at `32px` root size |
| **Automated Tests (`node --test`)** | **585 / 585 passed** (6 suites, 7,629 ms) | Node VM / regex smoke assertions; no headless browser or visual regression suite |
| **Syntax Check (`core/check-syntax.js`)** | **248 / 248 JS files clean** | Classic `vm.Script` + Node `--input-type=module --check` |
| **Runtime Console/Page Errors (Boot)** | **0 console errors** | Wait/SW works on reload (`swOfflineReload: ok`), fails offline cold & uncached cities |
| **FPS / Battery Impact (Idle/Scroll)** | **Not measured quantitatively (unverified)** | Code inspection confirms 60s `setInterval` poll + per-tap IDB/LS JSON serialization on dhikr |

---

## 3. Architecture, Navigation & State Audit

### 3.1 Dual-Track Architecture (`index.html` vs `src/`)
- **Legacy SPA (`index.html`, `core/`, `features/`, `data/`):** All state and helpers hang on `window.*` via IIFEs or top-level scripts. Every route exists simultaneously inside `index.html` as 100+ `.tab-panel` elements and modals, inflating initial DOM to **10,579 nodes** and bypassing standard module dependency graphs.
- **New MPA Track (`src/`, `vite.config.js`):** Partially migrated ES modules (`src/core/state.js`, `src/shell/tabs.js`, `src/shell/layout.js`, `src/pages/today/`, `src/pages/ibadah/`, `src/pages/profile/`). However:
  - No root `package.json` or `node_modules/` exists (`vite` CLI is not installed in the workspace).
  - `src/pages/today/today.html` renders only a skeletal scaffold (5 bare prayer pills and `XP: 0 · Level 1`).
  - Users and documentation (`README.md`) still point to conflicting descriptions (e.g., `README.md` still claims Tailwind CDN is used, even though `index.html` uses custom `styles/main.css` + Chart.js CDN).

### 3.2 Navigation Overload & Screen Inventory
Captured runtime inspection (`14_mobile_drawer.png`, `04b_mobile_today_clean.png`, `15_mobile_challenge_sheet.png`) reveals **5 overlapping navigation layers**:
1. Top header (`iqTopHeader`) with App Logo, Level/XP/Streak counters, Notification bell button, and Drawer toggle.
2. Top desktop category bar (`topCatNav`).
3. Mobile 5-slot bottom tab bar (`Home`, `Knowledge`, center Crescent action button, `Library`, `Profile`).
4. Floating Action Button (`#fab` — coexists in DOM alongside the center Crescent bottom-bar button).
5. Bento `"All Sections"` drawer (`iqDrawer`) exposing **79+ individual sections/panels** across 5 category pills (`Daily 19`, `Knowledge 30`, `Names 5`, `Library 19`, `Profile 6`), plus inline promo carousels and stacked pill CTAs on Today.

On mobile (`390x844`), **7 stacked vertical blocks** (top chrome, Daily Inspiration carousel, Today's Focus ring card, Hijri date bar, Search input, `"Tap to claim your Daily Bonus!"`, `"Weekly Reflection"`) sit above `"DAILY PRAYERS"`, pushing all 5 prayer check-off cards below the fold behind the bottom navigation bar (`04b_mobile_today_clean.png`).

### 3.3 Startup Interception & Layout Bugs
- **Broken Welcome / Onboarding Flow:** `core/actions.js:546` opens `#authOverlay` (`z-index: 100000`) directly above `#introOverlay` (`z-index: 99999`). In `features/auth.js:612-630`, `enterApp()` force-hides `#introOverlay` instead of invoking `startJourney()` (`core/actions.js:792-810`), so new users **never see onboarding** (`onboardingAppearedAfterEnter: false`).
- **False Day-0 Summary Modal:** `features/daily-summary.js:8-11` sets `hasActivity = ... || Object.keys(S.log || {}).length > 0`. Because `freshState()` initializes `S.log[today()]`, every brand-new user is greeted on first desktop/mobile session by a `"Daily Summary"` modal showing `0/5 Prayers, 0 Total XP, 0/4 Quests, 0 Streak`.
- **Daily Challenges Bottom-Sheet Overflow:** Confirmed in `15_mobile_challenge_sheet.png` (`openChallengeDetail('dhikr')`) — `"Dhikr: 0/500"` and `"Prayers 0% · Dhikr 0% · Quran 0%"` spill outside the focus card directly over the `Fajr` and `Dhuhr` pill buttons, rendering those labels illegible, while `Isha` wraps awkwardly onto a full-width second row.

---

## 4. Data Layer, Storage, Migrations & Backup

- **Storage Model (`core/state.js`, `core/storage.js`):** Dual-writes full state `S` (`STATE_SCHEMA_VERSION = 2`) into IndexedDB (`ibadah-quest` v1, `state` object store) and `localStorage` (`iq9` / per-user `iq_data_<username>`), with schema normalization and compaction (`compactLogs`, `compactDhikrSessions`, `compactXpDaily`).
- **High Write Amplification on Dhikr (`core/dhikr.js:32-59`):** Every single tasbih tap pushes a session entry and calls `saveState()`, triggering synchronous `JSON.stringify(S)` to `localStorage` plus an IndexedDB write. On low-end phones, rapid dhikr tapping (33x–100x) degrades input latency and battery.
- **Unexposed Backup & Restore UI:** `core/backup.js` implements a solid v2.1 checksummed JSON export/import with quarantine rollback (`iq9_preimport_1/2`), and `index.html:124` warns users `"Export a backup from Profile"`, **yet `renderProfile()` (`core/dynamic.js:455-528`) renders zero Export or Import buttons**. Data recovery is effectively unreachable from the UI.
- **Quarantine & Sync:** Multi-device sync does not exist (local-only). Quarantine recovery (`core/recovery.js`) works on corrupt JSON using `RESET` confirmation, though several recovery and action flows (`core/actions.js:35,270`, `features/auth.js`) still use blocking native `alert()` / `prompt()` / `confirm()` dialogs.

---

## 5. Notifications, Prayer Times & Calendar Scheduling

### 5.1 Notifications (`features/notifications.js`)
- **Unreliable delivery:** Uses `setInterval(..., 60000)` inside the open page (`features/notifications.js:45-98`). When the browser tab or PWA is closed, backgrounded, or OS battery-optimized, **zero notifications ever fire**.
- **No Prayer/Adhan Alerts:** Only checks quest/reflection/streak timers; there are zero per-prayer (`Fajr`..`Isha`) reminder offsets or Adhan triggers.
- **Broken Notification Assets & Guilt Copy:** Passes literal emoji strings `icon: '🕌', badge: '🕌'` (which fail/break as icon URLs in Web Notification APIs) and sends anxiety-inducing messages (`"Streak at Risk!"`, `"Don't break your streak!"`), violating Product Principles #1 and #3.

### 5.2 Prayer Times & Qibla (`core/render-prayers.js`)
- **Online Failure on Uncached Cities/Days:** Tested live in Playwright: after switching to `offline=True` and calling `updatePrayerSettings({lat: 21.4225, lng: 39.8262, label: 'Makkah', method: 4})`, `fetchPrayerTimes()` returned `null` and displayed `"Unable to load prayer times. Please check your connect..."`. There is **no offline astronomical calculation** (e.g., PrayTimes / AdhanJS solar-position math), so travel or unvisited dates fail completely offline.
- **Missing Fiqh / Calculation Controls:** Supports 9 city presets, GPS, and 6 calculation methods (default Karachi/Dhaka), but lacks **Asr school toggle (Standard Shafi'i/Maliki/Hanbali vs Hanafi 2x shadow — critical for South Asian / Bangladesh users)**, **high-latitude rules**, **per-prayer minute adjustments**, and a **Qibla compass**.
- **Streak Calculation Punishes Mid-Day Progress (`core/prayers.js:73-75`):** `recalc()` drops `S.cs` down to `1` or `0` whenever today has fewer than 5 prayers checked — meaning a user with a 30-day consistent streak wakes up at Fajr and sees their streak erased until Isha!

### 5.3 Hijri Calendar (`core/calendar.js`)
- Uses arithmetic tabular conversion (`gregorianToHijri`), with **no user moon-sighting offset (`-2` to `+2` days)** — causing dates in Bangladesh/South Asia and Saudi Arabia/North America to diverge from local moonsighting announcements.

---

## 6. Styling, Accessibility, i18n, RTL & Script Rendering

### 6.1 Themes & Contrast
- **Dark / Night Themes Intentionally Broken on Boot:** `core/actions.js:550,616` executes `document.documentElement.removeAttribute('data-theme')`, overriding saved Dark/Night theme preferences so users are forced back into Light theme on startup.
- **Contrast Failures (WCAG 2.2 AA requires 4.5:1 text / 3:1 UI):** Measured on computed styles on Today:
  - `#ffffff` on `#0b8a82` (`.skip-link`, `.iq-next-badge`, `.iq-pill-eta`): **4.22:1** (FAIL < 4.5:1)
  - `#0b8a82` on `#f2fbf8` (`.iq-hero-ch-link`): **4.01:1** (FAIL < 4.5:1)
  - `#7b9699` on `#fff` (`.iq-rhythm-lbl`): **3.15:1** (FAIL < 4.5:1)
  - `#7b9699` on `#f2fbf8` (`.global-search-icon`): **2.99:1** (FAIL < 3.0:1 graphical/UI threshold)
- **Touch Targets & Motion:** **159 elements `< 44x44px`** on Today alone (`.carousel-dot` 8x8, `.card-qada-btn` 23x22, `.card-info-btn` 24x24). `core/xp.js:68-85,101-129` injects **50 confetti DOM nodes** and synthesizes WebAudio chimes on XP events without a mute setting or JS `prefers-reduced-motion` bypass.

### 6.2 Localization: Bangla (`bn`), English (`en`), Arabic (`ar`)
1. **Fake Arabic (`data/i18n.js:2-3,254-273`):** The `'ar'` dictionary stores romanized Latin transliterations (`Yawmiyya`, `Awqat al-Salah`, `Qaimah`) instead of Arabic script (`يومية`, `أوقات الصلاة`).
2. **Partial String Coverage & Missing UI Control:** `data/i18n.js` covers ~200 nav/settings labels; core screens, tips, quests, journeys, and profile contain hundreds of hard-coded English strings. Worse, `iqSetLang()` has **no UI selector in Profile or Settings**, trapping users in English.
3. **Zero RTL Support:** Switching language never sets `<html dir="rtl" lang="ar">` or mirrors directional padding, navigation chevrons, swipe direction, progress bars, or drawer anchoring.
4. **No Dedicated Arabic or Bangla Typography / Numerals:** `index.html` relies on a single online Google Fonts stylesheet request (`2.3 KB` CSS; falls back to OS fonts offline). There is **no bundled Quranic script font** (`KFGQPC Uthmanic Hafs` or `Amiri Quran`), **no bundled modern Arabic UI font** (`Noto Sans Arabic` / `IBM Plex Sans Arabic`), **no bundled well-hinted Bangla font** (`Noto Sans Bengali` / `Hind Siliguri`) with widened line-height (`1.5–1.7`) for conjuncts (যুক্তাক্ষর), and **no localized numeral formatter** (Western `0-9`, Bangla `০-৯`, Arabic-Indic `٠-٩`).
5. **Visual Icon Consistency:** App chrome mixes crisp custom SVGs (`data/icons.js`, 85 keys; note `'bell'` unexpectedly aliases `'megaphone'`) with **109 local Noto Emoji PNGs** (`assets/`), which renders playfully/inconsistently in nav tabs vs serious worship sections.

---

## 7. Dependencies, Build/Release, Service Worker & CI

- **Missing JS Toolchain in Repo Root:** `vite.config.js` and `src/package.json` exist, and CI runs cleanly for syntax/Node unit tests, yet root `package.json`, `package-lock.json`, and `node_modules/` are absent. Build tooling (`npm run build`), linting (`eslint` is not installed locally despite `.eslintrc.json`), and browser E2E checks (`playwright`) are not wired into CI.
- **Manifest & Widget Breakage (`manifest.json`):** Widget definitions point to `widgets/daily-progress.json`, `widgets/dhikr-counter.json`, and `widgets/streak-calendar.json` — all 3 fail (`exists: false`) because actual JSON files reside under `features/widgets/`.
- **Offline Precaching Holes (`core/precache-manifest.js` + `sw.js`):**
  - Precaches 154 URLs (`1.25 MB`) and reloads app shell offline once installed (`swOfflineReload: ok`).
  - **Excludes** `data/pools/quran-verses.js` (`3.22 MB`), `data/pools/hadiths.js` (`2.50 MB`), `data/hadith-collections.js` (`394 KB`), and all `features/analytics/*` charts. On a slow mobile network or offline usage after install, users opening Quran, Hadith, or Analytics hit missing/un-cached heavy bundles unless visited beforehand, while CDN Chart.js fails offline.
- **Eager CDN Fetch Anti-Pattern:** Instead of lazy-loading Hadith collections when the user enters the Hadith screen, `features/hadith-library.js:81` runs `preloadRemoteCollections()` on boot, fetching **12 JSON files (38.67 MB decoded)** every cold load.

---

## 8. Privacy & Security

- **Local-First Advantage:** Core worship logs live on-device (`IndexedDB` + `localStorage`), documented in `privacy.html`.
- **XSS Risk via Unescaped Remote CDN Data (`features/hadith-library.js:69`, `core/dynamic.js:1177-1180`):** Remote hadith payloads (`h.t`, `h.a`) downloaded from `cdn.jsdelivr.net` are interpolated directly via `.innerHTML` without HTML escaping/sanitization (unlike `TafsirLibrary.sanitizeRichText`). Combined with `script-src 'unsafe-inline'` in `index.html` CSP and 33 inline `on*=` attributes, any compromised CDN asset or crafted string carries XSS exposure.
- **Weak Custom Auth & Misleading Lock Promise (`features/auth.js:15-73`):** Uses single-round custom JS SHA-256 without KDF/salt (`PBKDF2`/`Argon2` / `crypto.subtle`) stored under plaintext `iq_sec_<user>` in `localStorage`. Meanwhile, session state lives in `sessionStorage` so every tab/PWA restart forces re-unlock or skips state unpredictably.
- **Passive Network Telemetry Leakage:** Boot unconditionally contacts 3 third-party hosts (`cdn.jsdelivr.net`, `fonts.googleapis.com`/`fonts.gstatic.com`, `api.aladhan.com`), exposing IP + timestamp on launch even when users only want offline dhikr or Quran reading.

---

## 9. Religious Content, Accuracy & Gamification Ethics

| Content / System | Verified Status & Exact Observations | Severity |
|---|---|---|
| **Quran Text (`data/pools/quran-verses.js`)** | **6,236 ayahs / 114 surahs.** Verified flaws: Surah `1:1` contains a leading UTF-8 BOM `\ufeff`; Surah `2:1` prepends Bismillah (`"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الم"`) inside verse 1 text, duplicating the UI Bismillah header; **translator/source attribution and license are missing** (English appears similar to Saheeh International — *unverified*). Bangla Quran translation is absent (`0` Bangla ayahs). | **Critical** |
| **Hadith Collections (`data/pools/hadiths.js`, `data/hadith-collections.js`, `features/hadith-library.js`)** | Local: **6,357 entries** + collections (`bukhari`: 16 books / 307; `muslim`: 26 books / 497; `nawawi`: 1 book / 42). Mixed normalized shapes, missing uniform **authenticity grading** (Sahih/Hasan/Da'if), zero source/license disclosure for remote `cdn.jsdelivr.net/gh/fawazahmed0/hadith-api` fetches (*license/exact provenance unverified*), zero Bangla hadith text. | **High** |
| **Tafsir (`data/pools/tafsir.js`, `features/tafsir-library.js`)** | `TAFSIR_POOL` is empty `[]`; online fallback hits `api.quran.com` (Ibn Kathir id `169`), failing completely offline on unvisited surahs. | **High** |
| **Levels Naming (`data/levels.js:74-75,200-334`)** | Critical theological/UX defects: Level `219` `Ubaybah Enemy`, `223` `Harb War`, `225` `Darar Harm`, **`365` `Shirk of Association`**, **`366` `Kufr of Disbelief`**, **`367` `Nifaq of Hypocrisy`**! Furthermore levels `596–998` are unedited copy-paste placeholders (`"Nur of Light 596"` .. `"Nur of Light 998"`). | **Critical** |
| **Gamification Shop & Loot (`data/shop.js`, `features/surprise-rewards.js`)** | `data/shop.js` features **`r3` `"Mystery Box"`** (variable loot-box mechanic — violates Principle #1), `r4/r11` `"Streak Freeze"`, **math-broken XP packs** (`r5/r9/r13/r22` cost *more* XP than they award, e.g., spend 250 XP for +100 XP), and presumptuous spiritual titles (`r26` `"Friend of Allah"`, `r24` `"Pure Soul"`, `r27` `"The Ultimate Flex"`). `surprise-rewards.js` injects slot-machine random drop probabilities (`10%` / `25%` / `15%`) on prayers and quests. | **High** |
| **Fiqh Tips & Typos (`data/tips-details.js:4,6,74,96,100`)** | Hardcodes single-madhab rulings without noting scholarly differences (`Witr — Wajib`, `Tarawih — 20 Rakat`, omitting sunnah mu'akkadah / 8-vs-20 scholarly views). Also contains damaging typos: line `74` `"with the Prophet ﷺ in Darwin"` (*Jannah/Firdaus* corruption!), line `96` `"Expansion of sins"` (*expiation*), line `100` `"Serving an okay person"` (*older/elderly person*). | **Critical** |
| **Zakat Calculator (`features/zakat-calc.js:40-41`)** | Hardcodes USD `$` currency (`$65/g` gold, immutable `$0.8/g` silver with no timestamp/source) and computes `Math.max(nisabGold, nisabSilver)`, silently hiding the Hanafi silver-nisab rule from South Asian / Bangla users without scholar guidance. | **High** |
| **Licensing (`LICENSE`)** | Root `LICENSE` is proprietary copyright (*All rights reserved*), conflicting with undocumented third-party Quran/Hadith/emoji assets lacking attribution notices. | **Medium** |

---

## 10. Severity-Ranked Findings Summary

### Critical (Must Resolve Before Feature Work / Release)
- **C1 — Quran Text Corruption & Unattributed Source:** UTF-8 BOM in `1:1`, duplicated Bismillah inside `2:1`, unattributed English translation, zero Bangla text (`data/pools/quran-verses.js`).
- **C2 — Offensive/Placeholder Level Progression & Tip Typos:** Rank titles `Shirk` / `Kufr` / `Nifaq`, placeholder levels `596–998`, `"Darwin"` instead of Paradise, `"Expansion of sins"` (`data/levels.js`, `data/tips-details.js`).
- **C3 — 38.67 MB Forced Boot Download + Unescaped Hadith `innerHTML`:** `preloadRemoteCollections()` stalls low-end devices/data plans and creates XSS vector via CDN HTML injection (`features/hadith-library.js:69,81`).
- **C4 — Broken First-Run Onboarding, False Day-0 Modal & Forced Light Theme:** `authOverlay` skips `startJourney()`, empty `S.log[today()]` fires Day-0 `Daily Summary`, `removeAttribute('data-theme')` wipes Dark/Night themes (`core/actions.js`, `features/auth.js`, `features/daily-summary.js`).
- **C5 — Punishing Streak Logic & Unreliable Guilt Notifications:** `recalc()` erases `S.cs` before all 5 prayers finish; 60s `setInterval` fails in background, passes broken emoji URLs, sends `"Streak at Risk!"`, and lacks prayer/Adhan alerts (`core/prayers.js`, `features/notifications.js`).

### High
- **H1 — Localization Failure (No True Arabic, No RTL, No Bangla Fonts/Switcher):** Transliterated pseudo-Arabic, zero RTL layout mirroring, zero bundled fonts for Bangla conjuncts/Arabic/Uthmanic Quran, no in-app language switcher (`data/i18n.js`, `core/dynamic.js`).
- **H2 — Online-Only Uncached Prayer Times & Missing Fiqh/Qibla Options:** Fails offline when changing city/date (`offlineUncachedMakkahPrayerTimes: null`), no Asr school / high-lat / offset / Qibla (`core/render-prayers.js`), no Hijri moon adjustment (`core/calendar.js`).
- **H3 — Slot-Machine Gamification & Presumptuous Shop Titles:** `"Mystery Box"`, random drop rolls (`surprise-rewards.js`), net-negative XP shop packs, `"Friend of Allah"`/`"Pure Soul"` (`data/shop.js`).
- **H4 — Critical Mobile Layout & Navigation Clutter:** 5 redundant nav bars, 79 drawer sections, 7 blocks above Today's prayers, Daily Challenges bottom sheet text overlapping `Fajr`/`Dhuhr` pills (`15_mobile_challenge_sheet.png`).
- **H5 — Missing Profile Backup/Restore UI & Slow Per-Tap Dhikr Persistence:** Advertised backup buttons missing from Profile; synchronous JSON serialization on every dhikr tap (`core/dynamic.js`, `core/dhikr.js`).
- **H6 — Missing Root Build Toolchain & Dual-Track Technical Debt:** `src/` Vite MPA cannot run (`node_modules` / root `package.json` missing), `index.html` loads 144 scripts & 10,579 DOM nodes upfront.
- **H7 — Stale Single-Nisab Zakat Defaults:** Hardcoded `$` & `$65/$0.8` without currency, source date, or silver-vs-gold madhab explanation (`features/zakat-calc.js`).

### Medium
- **M1 — WCAG AA Contrast & Touch Target Accessibility Failures:** 159 touch targets `< 44x44px` on Today and 6 color-token contrast failures (`#0b8a82` / `#7b9699`), `Details ›` wrapping mid-word at 200% font scale.
- **M2 — Broken PWA Widget Manifest Paths & Missing Precached Data:** `manifest.json` widget URLs 404; offline Quran/Hadith pools & analytics excluded from `core/precache-manifest.js`.
- **M3 — Audio/Confetti Sensory Overload & Blocking Dialogs:** Unconditional 50 confetti elements + chime (`core/xp.js`) and blocking `alert()`/`prompt()`/`confirm()` (`core/actions.js`, `features/auth.js`).
- **M4 — Weak Custom PIN Crypto & Session Ephemerality:** Unsalted single-round SHA-256 in `localStorage` and per-tab `sessionStorage` lock (`features/auth.js`).
- **M5 — Uncredited Religious Sources & Conflicting `LICENSE`:** `TAFSIR_POOL` empty `[]`, `LICENSE` All rights reserved without third-party text/icon attributions.

### Low
- **L1 — Icon Mapping Quirks & Emoji Mixing:** `'bell'` mapped to `'megaphone'` in `data/icons.js`; 109 raster Noto Emoji PNGs mixed with vector icons.
- **L2 — Outdated Docs:** `README.md` references Tailwind CDN that was already removed; root `CHANGELOG.md` is missing.
- **L3 — CI Gaps:** CI lacks headless Chromium / Playwright accessibility, RTL, offline, and build checks.

---

## 11. Immediate Quick Wins (Safe Post-Approval Targets)

Once design direction and roadmap pass Gates 1–2, these isolated fixes require minimal risk and immediately eliminate top Critical/High bugs:
1. Delete `document.documentElement.removeAttribute('data-theme')` in `core/actions.js` so Dark/Night themes stop being wiped.
2. Delete `DOMContentLoaded` `preloadRemoteCollections()` call in `features/hadith-library.js:81` to cut **38.67 MB decoded / 5.76 MB boot traffic** instantly and escape remote HTML with `escapeHTML`.
3. Fix Surah `1:1` BOM, strip duplicated Bismillah from Surah `2:1`, and scrub typos/derogatory ranks in `data/tips-details.js` & `data/levels.js`.
4. Fix `recalc()` (`core/prayers.js`) so an active multi-day streak is preserved throughout the current day before all 5 prayers finish.
5. Fix `features/daily-summary.js` Day-0 check (`hasActivity`) and Daily Challenge bottom-sheet flex spacing (`15_mobile_challenge_sheet.png`).
6. Fix `manifest.json` widget paths (`features/widgets/*.json`) and expose Export/Import Backup + Language Switcher inside Profile.
