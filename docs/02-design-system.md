# Phase 2 Design System & UX Specification — Ibadah Quest ("Noor & Rhythm")

**Design Direction:** Direction D — *"Noor & Rhythm"* (Serene Sanctuary foundation × Restrained Modern Heritage editorial craft × Gentle Time-Adaptive Rhythm)  
**Platforms:** Mobile-first PWA + Capacitor-ready Web/iOS/Android shared responsive UI (`<= 360px` small phones, `390–430px` phones, `768px+` tablets/foldables, `1024px+` desktop)  
**Single Source of Truth:** [styles/tokens.css](file:///C:/Users/Mahin/Desktop/IQ/styles/tokens.css) (imported by both legacy [index.html](file:///C:/Users/Mahin/Desktop/IQ/index.html) and [src/](file:///C:/Users/Mahin/Desktop/IQ/src/) Vite MPA) + Live **Component Gallery** screen inside the app (`More / Profile -> Design Gallery`).

---

## 1. Foundations — Color Tokens & Contrast (WCAG 2.2 AA Verified)

Every color role uses semantic tokens (`--iq-*` and mapped `--bg`, `--card`, `--accent`, `--text`) across **Light**, **Dark**, **OLED Night**, and **Follow System** (`prefers-color-scheme`), plus optional seasonal overlays (`data-season="ramadan"` / `"dhul-hijjah"`) that accent borders/badges without ever lowering text contrast. Status is **never conveyed by color alone**: every state pairs color + icon + clear text label.

| Token Role | Light (*Warm Alabaster*) | Dark (*Slate Pine*) | OLED Night (*Low-Glare Obsidian*) | Seasonal Accent Overlay (*Ramadan / Eid Brass*) |
|---|---|---|---|---|
| `--bg` (Canvas) | `#F4F9F6` | `#0F1917` | `#040706` | Preserves base canvas |
| `--surface` (Card / Sheet) | `#FFFFFF` | `#162421` | `#0C1311` | Preserves base surface |
| `--surface-subtle` | `#EBF3EE` | `#1E302C` | `#121C19` | `#FBF6E8` (Light) / `#1E1A0F` (Dark) |
| `--border` | `#C7DBD3` | `#2C433E` | `#243430` | `#B8933A` |
| `--accent` (Primary Action) | **`#07635D`** | **`#38B5A8`** | **`#4FC7BA`** | Deep Brass `#8E6B1E` (Light) / `#D7B562` (Dark/Night) |
| `--accent-contrast` (Text on Accent) | `#FFFFFF` (**7.02:1**) | `#051F1C` (**7.81:1**) | `#041513` (**9.34:1**) | `#FFFFFF` / `#141004` |
| `--text` (Primary Body) | `#0D2421` (**15.4:1**) | `#EAF3EF` (**14.2:1**) | `#D8E4DF` (**12.8:1**) | Preserved |
| `--text2` (Secondary Body) | `#3D5A55` (**6.98:1**) | `#A5C2BA` (**7.64:1**) | `#9AB6AF` (**7.92:1**) | Preserved |
| `--success` (Worship Completed) | `#0A6A46` on `#E4F5EC` | `#4DD49D` on `#123326` | `#57DBA5` | Always paired with Check icon & status text |
| `--warning` (Qada / Reminder) | `#8A4E04` on `#FEF3E1` | `#F5B759` on `#2E220D` | `#F2B860` | Always paired with Clock/Qada badge |
| `--danger` (Destructive Reset) | `#B42318` on `#FEECEB` | `#F87171` on `#331515` | `#F87171` | Confirmation dialog required |

*Fixes Phase 0 findings where `#0b8a82` on `#fff`/`#f2fbf8` fell to 4.01–4.22:1 and `#7b9699` fell to 2.99–3.15:1.*

---

## 2. Multi-Script Typography, Bundled Fonts & RTL Rules

### 2.1 Bundled Open-Source Font Stack (`SIL OFL v1.1` in `assets/fonts/`)
- **Latin & Bangla UI/Body:** `Hind Siliguri` (weights `400`, `600`, `700`, Indian Type Foundry, SIL OFL v1.1, Bengali + Latin subsets = 262 KB WOFF2) with fallback `'Noto Sans Bengali', system-ui, sans-serif`.
- **Arabic UI:** `Noto Sans Arabic` (variable weight `400–700`, Google Noto Fonts, SIL OFL v1.1, 166 KB WOFF2) with fallback `system-ui, sans-serif`.
- **Quranic Script:** `Amiri Quran` (`400`, Khaled Hosny / Alif Type, SIL OFL v1.1, 46 KB WOFF2) with `'Scheherazade New', 'Amiri', serif` fallback. Provides full diacritical height without Tashkeel collision and avoids restrictive proprietary fonts.

### 2.2 Separate Per-Script Type Scales & Rules
- **English (`:lang(en)`):** Base `1rem` (`16px` adjustable `90%–140%`), `line-height: 1.5`, standard tracking.
- **Bangla (`:lang(bn)`):** Base scale `1.04rem` (`--bn-scale`), `line-height: 1.62` (prevents upper *i-kar* `ি`, matra headlines, and lower conjuncts `ু`, `ৃ`, যুক্তাক্ষর clipping), `letter-spacing: 0 !important`.
- **Arabic UI (`:lang(ar)`):** Base scale `1.08rem` (+1.5–2pt optical balance per Apple HIG), `line-height: 1.65`, `letter-spacing: 0 !important` (never breaks cursive joins).
- **Quranic Text (`.quran-arabic`):** User-adjustable `1.5rem–2.8rem`, `line-height: 2.05`, `letter-spacing: 0`, explicit `dir="rtl" lang="ar"`, full diacritics strictly unaltered.

### 2.3 RTL & Bidi Engineering
- `<html lang="en|bn|ar" dir="ltr|rtl">` automatically switches when language changes.
- Structural layout rules migrate to **CSS Logical Properties** (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `border-inline-start`).
- **Mirrored in Arabic RTL:** Navigation drawers anchor right, back/forward chevrons (`ChevronLeft`/`ChevronRight`), tab progression arrows, swipe left/right navigation semantics, horizontal progress bars, and checklist badges.
- **Explicitly NOT Mirrored (`.iq-no-mirror`):** Analog/Qibla compass rose (`0°` North clockwise), countdown timers (`MM:SS` digits), media play/pause/scrub buttons (`▶`, `⏸`), app Crescent-Mihrab mark, URLs, and raw numerals.
- **Mixed-Direction Isolation:** Inline Arabic terms/Ayahs inside Bangla or English strings wrap in `<bdi dir="rtl" lang="ar">...</bdi>` or CSS `unicode-bidi: isolate`.

---

## 3. Numerals, Glossary & Voice/Tone Guide

### 3.1 Numerals Preference (`iqFormatNum(value)`)
Setting `S.numerals`: `'auto'` (default), `'western'` (`0-9`), `'bangla'` (`০-৯`), `'arabic'` (`٠-٩`). Default `'auto'` resolves `bn -> bangla`, `ar -> arabic`, `en -> western`, while timestamps keep clean tabular spacing (`font-variant-numeric: tabular-nums`).

### 3.2 Unified Islamic Glossary (EN / BN / AR)

| Concept | English (`en`) | Bangla Default (`bn`, Beginner-First) | Bangla Alternate (`salat` toggle) | Arabic (`ar`) |
|---|---|---|---|---|
| Obligatory Prayer | Prayer (Salah) | নামাজ | সালাত | الصلاة |
| Prayer Times | Prayer Times | নামাজের সময় | সালাতের সময়সূচি | أوقات الصلاة |
| Fasting | Fasting (Sawm) | রোজা | সিয়াম | الصيام |
| Pre-Dawn Meal | Suhoor | সেহরি | সাহরি | السحور |
| Sunset Meal | Iftar | ইফতার | ইফতার | الإفطار |
| Made-up Prayer | Qada | ক্বাযা | কাজা | قضاء |
| Obligatory Alms | Zakat | যাকাত | যাকাত | الزكاة |
| Voluntary Charity | Sadaqah | সদকা | সাদাকাহ | الصدقة |
| Remembrance | Dhikr | যিকর | জিকির | الذكر |
| Supplication | Dua | দোয়া | দুআ | الدعاء |
| Rest / Grace Mode | Grace / Rest Mode | বিশ্রাম মোড | বিরতি (ওজর) মোড | وضع العذر والراحة |
| Prophet's Honorific | ﷺ (PBUH only if ASCII) | ﷺ / (সা.) | ﷺ | ﷺ |

- **User-configurable Terminology Setting:** *"Bangla Worship Terms: সাধারণ প্রচলিত (নামাজ · রোজা) vs আরবি পরিভাষা (সালাত · সিয়াম)"* (`S.bnTermMode = 'namaz' | 'salat'`).
- **Native-Speaker Review Flags:** Bangla idiomatic microcopy and Classical/MSA Arabic notification phrases are marked `[native-review]` in `docs/05-qa-and-release-checklist.md` so a native scholar/editor validates subtle phrasing prior to App Store launch.

### 3.3 Voice & Tone Guide
- **Warm, Humble, Unhurried:** Worship is private devotion, never a productivity sprint. Celebrate returning gently (`"Alhamdulillah, glad you're back — start with one small step"` / `"আলহামদুলিল্লাহ, ফিরে আসায় স্বাগতম — ছোট এক ধাপ দিয়ে শুরু করুন"` / `"الحمد لله على عودتك — ابدأ بخطوة يسيرة"`).
- **Zero Guilt / Zero Judgment:** Never write `"You failed"`, `"Streak broken!"`, `"Risking your faith"`, or assign divine favor metrics to XP levels.
- **Dignified Celebrations:** Default to **silent light haptics + calm subtle elevation card**; audio chime & soft animation are strictly opt-in and non-instrumental, honoring `prefers-reduced-motion`.

---

## 4. Refreshed Visual Identity, App Icon & Launch Screen Proposal

To refresh the brand while keeping **"Ibadah Quest"** intact (Prompt Section 3: *"propose logo changes to me instead of discarding the existing identity"*):
- **Kept Core:** Keep the `"Ibadah Quest"` name, coastal-teal/sage heritage root, and recognizable **`IQ` wordmark** on existing [assets/icons/icon.svg](file:///C:/Users/Mahin/Desktop/IQ/assets/icons/icon.svg).
- **Proposed Refreshed Mark ([assets/icons/icon-v2.svg](file:///C:/Users/Mahin/Desktop/IQ/assets/icons/icon-v2.svg)):** Minimalist **Mihrab Arch framing an open Crescent Moon and 8-Point Rub-el-Hizb star accent** in crisp geometric stroke (`#FFFFFF` / `#D7B562` on deep teal `#07635D` squircle gradient), eliminating blocky font letters that blur at `24x24` favicon/widget scales while evoking sanctuary & journey without any figurative mascot.
- **Launch / Splash Screen:** Calm alabaster/obsidian background matching theme with `"بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"` in `Amiri Quran` + refreshed Crescent-Mihrab mark + immediate instant transition into App/Onboarding (zero forced auth gate).

---

## 5. Information Architecture (5 Destinations) & Component Library

### 5.1 Simplified 5-Tab Navigation Architecture
Validated against Pillars, Hallow, and Streaks research (eliminating Phase 0's 5 redundant nav bars & 79-link overload while retaining deep-link route compatibility for existing SPA panels):
1. **Today (`ibadah` -> `home`)**: Above-the-fold Next Prayer Countdown + 5 Daily Prayers + Quick Resume Action (`Resume Quran` / `Quick Tasbih`) + Today's Focus & Rest/Grace toggle + Hijri/Gregorian date + Daily Verified Reminder (Ayah/Hadith + source).
2. **Quests (`quests`)**: Daily, Weekly, Seasonal & Beginner Learning Journeys with partial progress, undo, `"Why & Source"` expandable card, and quiet streak consistency indicator.
3. **Quran (`quran`)**: Surah & Juz reader (`Uthmani` / `Indo-Pak` toggle + `English` / `Bangla` translation + credit), offline search, bookmarks, last-read resume, Khatam planner, spaced-repetition Hifz review, audio recitation.
4. **Progress (`progress` -> `stats` / `trophies` / `dhikr`)**: 30-day / 365-day offline SVG consistency heatmap & prayer/XP trend graphs (no external CDN), private badges, private Muhasabah reflection, quick Tasbih launch.
5. **More (`profile_main`)**: Profile & Settings (Language `বাংলা / English / العربية`, Bangla terminology mode, Numerals, Theme Light/Dark/OLED/System, Seasonal overlay, Script font scales, Notifications + Quiet hours + Test tool, Offline Prayer Calculation Method / Asr / High-Lat / Offset + Qibla Compass + Hijri Sighting `-2..+2`, Export JSON/CSV / Import / Full Delete, Privacy Dashboard, Report Error, Credits & Licenses, What's New, and **Design System Component Gallery**). All secondary encyclopedic tools (99 Names, Hadith Library, Tafsir, Zakat, Prophetic Medicine, Seerah, Masjid Check-ins) remain 1–2 taps away inside clean organized drawers/hub cards!

### 5.2 Reusable Component Library (Implemented in App & Gallery)
Every component supports Light / Dark / OLED Night, EN / BN / AR (RTL), 48dp/44pt touch target floors, `focus-visible` outlines, and `loading / empty / error / offline / permission-denied` states:
- **Buttons** (Primary, Secondary Outline, Subtle Pill, Destructive, Icon Button `44x44+`)
- **Cards** (Standard Worship Card, Prayer Row with On-Time / Qada / Remaining states, Quest Card with partial progress + undo)
- **Progress Indicators** (Tri-ring SVG Focus Dial, Logical-directional Progress Bar)
- **Consistency / Streak Indicator** (Forgiving badge + Rest/Grace paused state + 30-day calendar heatmap)
- **Interactive Controls** (Tactile Tasbih Orb + safe confirmation reset, Bottom Sheet, In-app Accessible Modal Dialog replacing browser `alert`/`confirm`, Non-intrusive Toast, Logical Tabs, Switch Toggles, Skeleton Loader, Empty / Offline / Error / Permission-Denied State Banner)

### 5.3 Annotated 10-Screen Specs Summary
1. **Splash & 5-Step Skippable Onboarding (`features/onboarding.js`):** Language First (`বাংলা / English / العربية`) -> Worship Focus & Comfort Level -> City / Method / Asr School (Dhaka/Bangladesh defaults ready offline) -> Plain-language Notification Value Prompt -> Complete First Worship Step in ~60s.
2. **Today:** Prayer Hero Pill + Immediate 5 Prayer Grid (`min-height: 48px`) + Continue Last-Read Card + Daily Focus Summary + Verified Reminder card (clickable source link).
3. **Quests:** Tabbed `Daily / Weekly / Seasonal / Journeys` cards with difficulty chips, undo, partial steps, expandable Hadith/Quran `"Why"` attribution.
4. **Prayer Times & Qibla:** Offline `adhan` timetable (`Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha`), Jumu'ah card on Fridays, Manual City + Approximate/Precise GPS toggle, Calculation Method (incl. Islamic Foundation Bangladesh/Karachi), Asr School (`Standard` vs `Hanafi`), High-Lat rule, Per-prayer minute offsets, Live **Qibla Compass + Degree/Bearing Fallback**, Rest/Grace Mode toggle.
5. **Quran:** Surah/Juz switcher, Offline Search, Uthmani vs Indo-Pak script, Translation (`Saheeh International` / `Taisirul Quran` Bangla / Both), Translator credit badge, Khatam progress calculator, Hifz review card, Reciter audio player (`verses.quran.com` online fallback clearly badged offline).
6. **Dhikr / Tasbih:** Large center tap orb (`>= 120px`), Haptic & Sound toggles, Authentic Azkar selector with Hadith sources, safe confirmation Reset dialog, offline debounced batched save.
7. **Progress & Achievements:** Private consistency calendar heatmap, offline SVG 7-day trend charts, milestone badges, private Muhasabah journal entry (zero leaderboards).
8. **Profile & Settings:** Language, Glossary Term mode, Numeral digits, Theme & Seasonal accent, Per-script font scale sliders, Granular Notifications + Quiet Hours + Test button, Hijri Day Adjustment (`-2..+2`), Backup JSON/CSV Export & Import, In-App Delete, Privacy Dashboard, Content Error Report, Licenses & About, Component Gallery shortcut.
9. **Family / Local Profiles (Existing Foundation Preserved):** Multi-profile offline switching in Profile (`Auth.show('profiles')`) without public ranking or cross-account leakage; Family Quest guidelines documented cleanly on roadmap for v2.2 expansion.
10. **Widgets & Deep Links:** Fixed [manifest.json](file:///C:/Users/Mahin/Desktop/IQ/manifest.json) pointing to `features/widgets/{daily-progress,dhikr-counter,streak-calendar}.json` + deep-link URL hash routing (`#ibadah/timer`, `#knowledge/quran`, etc.).
