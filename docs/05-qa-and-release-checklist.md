# Phase 5 — QA & Release Readiness Checklist

**Release Candidate:** `v2.2.0-upgrade` ("Noor & Rhythm")  
**Branch:** `feat/ibadah-quest-upgrade`  
**Target Platforms:** Android & iOS (via `capacitor.config.json` + PWA offline shell)  

---

## 1. Verification Evidence Summary

| Check Category | Status | Verified Result & Notes |
|---|---|---|
| **JS Syntax Verification (`node scripts/check-syntax.js`)** | **PASS** | All **256 / 256** classic & ESM JS files parsed cleanly with 0 errors. |
| **Automated Test Suite (`node --test`)** | **PASS** | **602 / 602** tests passed, 0 failed, 0 skipped across existing contracts, **176/176** verified precache disk assets, offline 7-city Adhan + custom angles (`tests/offline-adhan.test.js`), RTL/numerals (`tests/i18n-rtl-numerals.test.js`), and ethics/XSS/streak suites (`tests/ethics-recovery.test.js`). |
| **Offline Cold Boot & Zero 3rd-Party Check (Playwright)** | **PASS** | **0 third-party network requests** on boot; **0 console/page/404 errors** across Today, Prayer Times (`0°`/custom angle & offsets), AR RTL Qibla, Quran + Khatam (`+5pg`), Memorization Hifz SRS, Zakat (`BDT`/`Silver` Nisab), Profile modals, Gallery, and offline Stats charts; Makkah, Tromso (69.6°N) & Dhaka Qibla computed cleanly in Chromium. |
| **WCAG 2.2 AA Contrast & Touch Targets (Playwright)** | **PASS** | **0 interactive hit-target failures** on Today (`::after` `44x44px` tap targets on compact info badges), Timer (`min 46x44px`), and Profile (`0` `<44px` buttons); measured contrast **Light `7.91:1–16.26:1`**, **Dark `9.42:1–16.11:1`**, **OLED Night `9.94:1–16.18:1`**. |
| **200% Text Scaling & Viewport Overflow (Playwright)** | **PASS** | `0 px` horizontal overflow on `390x844` mobile (EN, BN, AR RTL, 200% font scale) and `1280x800` desktop; Daily Challenges sheet `nonOverlapping: true`. |
| **Multilingual UI, RTL & Numerals (`en`, `bn`, `ar`)** | **PASS** | Tested live switching to Bangla (`দৈনিক নামাজ`, `০/৫`, `Hind Siliguri`), Arabic (`الصلوات اليومية`, `dir="rtl"`, `٠/٥`, mirrored drawer & bottom tabs, `Noto Sans Arabic`), and Quran Indo-Pak + *Taisirul Quran*. |
| **Physical Device Screen Reader (TalkBack / VoiceOver)** | **PENDING DEVICE QA** | Landmarks, `aria-live`, focus traps, semantic `<button>` info buttons verified in DOM; manual TalkBack (Android) + VoiceOver (iOS) swipe walkthrough required before store binary upload. |
| **Native Capacitor Binaries (`ios/` & `android/`)** | **SCAFFOLDED** | `capacitor.config.json` & `features/native-bridge.js` implemented; native Xcode/Gradle project generation & OS alarm scheduling tests pending Mac/Android Studio build host. |

---

## 2. Bangla, Arabic & Glossary Review Table (For Native-Speaker Sign-Off)

Please review these terminology defaults (`data/i18n.js`). Where multiple common terms exist among Bengali Muslims, an in-app Profile toggle (`bnTermMode`) switches live between them:

| English Key | Bangla Default (`namaz`) | Bangla Alternate (`salat`) | Arabic (`ar`) | Needs Native Review? |
|---|---|---|---|---|
| **Daily Prayers** | দৈনিক নামাজ | দৈনিক সালাত | الصلوات اليومية | Confirmed natural |
| **Prayer Times** | নামাজের সময় | সালাতের সময়সূচি | أوقات الصلاة | Confirmed natural |
| **Fasting** | রোজা | সিয়াম | الصيام | Confirmed natural |
| **Suhoor / Iftar** | সেহরি / ইফতার | সাহরি / ইফতার | السحور / الإفطار | Confirmed natural |
| **Dhikr / Remembrance** | যিকর | জিকির | الذكر | Confirm regional preference (`যিকির` vs `যিকর`) |
| **Qada (Make-up)** | ক্বাযা | কাজা | قضاء | Confirm preferred orthography |
| **Rest Mode / Grace Mode** | বিশ্রাম মোড | বিশ্রাম মোড | وضع الراحة | Review idiomatic warmth for sisters/travelers in AR & BN |
| **Arabic Hadith / Knowledge Subtabs** | Partial (`EN` fallback on subtopics) | Partial | Partial (`EN` fallback on long encyclopedic pools) | **Flagged:** encyclopedic knowledge articles remain English-only; UI chrome & daily reminders are localized |

---

## 3. Religious Content Sources, Licenses & Attribution Matrix

Every religious source in the repository is audited below. **Items marked "Verify Commercial License" or "Scholar Review Pending" MUST be cleared prior to public App Store / Play Store distribution.**

| Asset / Data File | Source / Translator | Verification & Edits Made in Upgrade | License / Attribution Status |
|---|---|---|---|
| **Uthmani Quran Arabic & Saheeh Int'l (`data/pools/quran-verses.js`)** | Uthmani text / Saheeh International (`QURAN_EN_META`) | Stripped `\ufeff` BOM on `1:1`; stripped duplicate prefixed Bismillah on `2:1`; added `QURAN_EN_META` attribution; `6,236` ayahs verified non-empty. | Attribution rendered in Quran footer; **Verify commercial store redistribution rights for Saheeh International** with copyright holder (Dar Abul-Qasim) or replace with open CC-BY translation if publishing commercially. |
| **Indo-Pak Quran Script (`data/pools/quran-indopak.js`)** | Quran.com API v4 (`/quran/verses/indopak`, `6,236` ayahs) | Verbatim API payload untouched; lazy-loaded offline cleanly. | Attribution rendered in footer (`QURAN_INDOPAK_META`); **Verify redistribution license** with Quran Foundation before store release. |
| **Bangla Quran Translation (`data/pools/quran-bn.js`)** | *Taisirul Quran* — Tawheed Publication (Quran.com API resource `161`, `6,236` ayahs) | Verbatim API payload untouched; lazy-loaded cleanly. | Attribution rendered (`QURAN_BN_META`); **Verify redistribution permission** with Tawheed Publication prior to store submission. |
| **Prayer & Qibla Calculation (`assets/vendor/adhan.umd.min.js`)** | Batoul Apps `adhan@4.4.6` | Astronomical algorithms verified against 7 global cities (`tests/offline-adhan.test.js`). | **MIT License** (`assets/vendor/adhan.LICENSE.txt`). Clear for commercial/OSS distribution. |
| **Bundled Fonts (`assets/fonts/*`)** | `Amiri Quran`, `Noto Sans Arabic`, `Hind Siliguri` | 8 WOFF2 subset/full files bundled locally. | **SIL Open Font License v1.1** (`assets/fonts/OFL-LICENSES.txt`). Clear for bundling. |
| **Hadith Collections (`data/hadith-collections.js`, `features/hadith-library.js`)** | Bundled Bukhari/Muslim/Nawawi + on-demand `cdn.jsdelivr.net` JSON (`fawazahmed0/hadith-api`) | Removed boot auto-fetch; HTML-escaped narration/Arabic text (`escapeHTML`); added direct `sunnah.com` verification links & Report Error flow. | **Scholar Review Pending** on secondary thematic pools (`data/pools/seerah.js`, `fiqh.js`, `aqeedah.js`, `prophets.js`) which have historical/summarized prose without narrator chains. |
| **Fiqh & Fasting Notes (`data/tips-details.js`)** | Curated rulings | Fixed typos (`"Darwin"`, `"Expansion of sins"`, `"okay person"`); explicitly noted majority vs Hanafi difference on Qunut/Witr. | **Scholar Review Pending:** Confirm balanced madhab wording before commercial release. |

---

## 4. App Store Privacy & Compliance Posture

### Apple App Privacy Labels ("App Privacy" Questionnaire)
- **Data Used to Track You:** **None.** Zero ad SDKs, zero cross-app identifiers (IDFA unused).
- **Data Linked to You:** **None.** Zero user account sign-up required; profiles stay strictly in device `localStorage` / `IndexedDB`.
- **Data Not Linked to You (Optional Features Only):**
  - *Precise / Coarse Location:* Used ephemerally **on-device** when user taps *"Use Approximate Location"* for local `adhan` solar math; never uploaded to Ibadah Quest servers.

### Google Play Data Safety Form Answers
- **Does your app collect or share any required user data types?** **No** (assuming optional Aladhan API lookup is deprecated in favor of offline `adhan`, and audio/remote Hadith streaming note in-app discloses user-initiated third-party CDN requests to `verses.quran.com` / `cdn.jsdelivr.net`).
- **Is all user data encrypted in transit?** Yes for optional user-triggered audio/collection fetches (`HTTPS` via CSP).
- **Do you provide a way for users to request data deletion?** Yes — Profile includes **Delete All Data** (`deleteAllUserData()`) wiping every `localStorage` key and `IndexedDB` database immediately on-device.

### Children / Families (`COPPA` / Mixed Audience)
- Target audience includes teens (13–35) and families doing worship quests together.
- Zero behavioral ads, zero social chat, zero public leaderboards, zero paid IAP loot boxes, zero external analytics SDKs. Safe for family use without age-gated telemetry consent prompts.

---

## 5. Native Mobile Build Handoff Checklist (`Capacitor`)

1. Initialize Node workspace packages when ready to wrap for stores:
   `npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android @capacitor/local-notifications @capacitor/haptics`
2. Configure Vite production bundle build or copy static web directory cleanly into `dist/` before syncing (`npx cap sync ios && npx cap sync android`).
3. Verify native `Info.plist` (`NSLocationWhenInUseUsageDescription`, `NSMotionUsageDescription`, `PrivacyInfo.xcprivacy`) and Android `AndroidManifest.xml` (`POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, coarse `ACCESS_COARSE_LOCATION` optional only) before TestFlight / Google Play Internal Testing.
4. Execute on physical devices:
   - Samsung / Xiaomi low-end Android handset (`<= 2 GB RAM`): verify battery standby, Doze exact-alarm Adhan timing, TalkBack swipe order, and Bangla conjunct rendering across system WebView.
   - iOS Safari / WKWebView device: verify VoiceOver rotor navigation, Safe Area insets, OLED Night contrast, and lock-screen notification quick actions.
