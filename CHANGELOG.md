# Changelog

All notable changes to **Ibadah Quest** are documented in this file.
Format inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2.2.0-upgrade] — 2026-11-26 ("Noor & Rhythm")

### Added
- **Design System & Multi-Theme Support (`styles/tokens.css`, `styles/main.css`):**
  - Implemented Warm Alabaster + Deep Coastal Emerald Light theme (`#07635D` accent, `7.02:1` contrast), Slate Pine Dark theme, low-glare Obsidian OLED Night theme (`#030605`), System follow-mode, and optional Seasonal Gold Accent overlay.
  - Added bundled offline WOFF2 typography (`Amiri Quran`, `Noto Sans Arabic`, `Hind Siliguri` Bengali + Latin subsets, SIL OFL v1.1) with script-specific metrics (`1.62` Bangla line-height, `0` tracking, `2.05` Quranic line-height, per-script scale `90%–130%`).
  - Added an interactive in-app **Component Gallery** (`features/gallery.js`, accessible from Profile) showcasing theme/language toggles, WCAG AA swatches, multi-script typography samples, and system states.
- **Full Localization, RTL & Numerals (`data/i18n.js`):**
  - Added authentic Arabic (`ar`), Bangla (`bn`), and English (`en`) translations, automatic `<html dir="rtl" lang="ar">` layout mirroring (preserving non-mirrored Qibla/brand assets), device-language first-run detection, and 6-category Arabic plural rules (`zero, one, two, few, many, other`).
  - Added user-selectable numeral format (`Auto`, Western `0–9`, Bangla `০–৯`, Arabic-Indic `٠–٩`) and Bangla glossary toggle (`নামাজ/রোজা` vs `সালাত/সিয়াম`).
- **Offline Astronomical Prayer, Qibla & Hijri Engine (`assets/vendor/adhan.umd.min.js`, `core/render-prayers.js`, `core/calendar.js`):**
  - Bundled `adhan@4.4.6` (MIT) synchronously on boot for 100% offline prayer times across global latitudes (Dhaka/IFB, Karachi, Makkah/Umm Al-Qura, Cairo, London, New York, Tromso Arctic polar resolution), Hanafi/Shafi'i Asr toggle, High-Latitude rules, ±1m offsets, target-city IANA timezone resolution, Qibla compass bearing + cardinal fallback, and `-2..+2` day Hijri lunar sighting adjustment.
- **Quran, Hifz & Zakat Upgrades (`core/dynamic.js`, `core/static.js`, `core/content.js`, `features/zakat-calc.js`):**
  - Added lazy-loaded **Indo-Pak script** (`data/pools/quran-indopak.js`, 6,236 ayahs) and **Bangla translation** (*Taisirul Quran*, `data/pools/quran-bn.js`, 6,236 ayahs) with explicit source attribution and script/translation toggles.
  - Added **Khatam Planner** (`S.khatamGoal`, 604-page progress tracking, daily target pace) and **Hifz Spaced Repetition Queue** (`S.hifzSrs` at 1, 3, 7, 14, 30 day intervals).
  - Updated Zakat calculator with currency selector (`BDT`, `USD`, `GBP`, `EUR`, `SAR`) and scholarly Gold vs. Silver Nisab basis selector.
- **Native Capacitor Scaffold & Error Reporting (`capacitor.config.json`, `features/native-bridge.js`, `core/actions.js`):**
  - Added Capacitor wrapper config + JS bridge for native notifications/haptics, local-first Content Error Reporter, CSV export (`exportCSVData`), Full Data Deletion (`deleteAllUserData`), and What's New dialog.
- **5-Step Gentle Onboarding (`features/onboarding.js`):**
  - Language Selection (`bn`/`en`/`ar`) -> Gentle Starting Point -> Offline Location & Asr School -> Opt-In Calm Reminders -> First 10-Second Worship Action (<60s), with Skip/Back on every step.

### Changed
- **Forgiving Habits & Calm Notifications (`core/prayers.js`, `core/xp.js`, `core/dhikr.js`, `features/notifications.js`, `features/daily-summary.js`):**
  - Mid-day streak protection: ongoing streaks no longer drop to `0` at midnight before Isha completes; Rest Mode freezes active streak without storing personal reason data.
  - Defaulted sound effects to muted (opt-in chime); replaced 30-node confetti burst with calm milestone/reflection toasts; added `100 XP/day` dhikr tap cap & `5/day` cycle bonus cap with `350 ms` batched saves.
  - Added per-prayer reminder toggles, quiet hours (`22:30–04:30`), 6/day alert cap, valid icon assets, and an interactive Test Notification action.
  - Fixed startup so brand-new guest users are never blocked by `#authOverlay` (`z-index: 100000`) above intro/onboarding, and suppressed Day-0 all-zeros Daily Summary popups.
  - Promoted Today's Daily Prayers above secondary cards; fixed Daily Challenges sheet hero overflow onto prayer pills; expanded all `<44px` interactive controls on Today to >=44px.

### Removed / Security & Content Fixes
- Removed automatic 38.67 MB remote Hadith preload on `DOMContentLoaded` (`features/hadith-library.js`) and external Google Fonts & Chart.js CDNs (zero third-party requests on boot).
- Replaced RNG "Mystery Box" loot-box and vanity/presumptuous level ranks (`data/levels.js`, `data/shop.js`), corrected factual/copywriting errors in `data/tips-details.js`, stripped BOM/duplicate Bismillah formatting in `data/pools/quran-verses.js`, and HTML-escaped Hadith rendering in `core/dynamic.js` & `features/hadith-library.js`.
- Fixed broken widget manifest paths (`widgets/*.json` -> `features/widgets/*.json`), added `features/analytics/*.js` to `core/precache-manifest.js` (`176` verified precache entries), bumped Service Worker `MANIFEST_REV = 28` (`sw.js?v=66`), and refreshed `README.md` stack/test metadata (`602` automated tests).
