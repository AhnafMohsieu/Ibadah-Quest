# Phase B: Market-Grade UI Upgrade — Design Spec

**Date:** 2026-11-26
**Status:** Approved (`all of them` / Option 1 cleanup + upgrade)
**Benchmark:** Pillars (calm utility, Qada distinction, streak pause protection), Tarteel AI (sanctuary Quran reader, crisp concentric progress rings), and 2025/2026 habit-tracker bento UI patterns.

---

## 1. Visual Architecture & Signature Components

### 1.1 Concentric 3-Ring Bento Hero & 7-Day Consistency Rhythm (`features/iq-shell.js`, `styles/main.css`)
- **Pure SVG Helper (`renderConcentricRingsSvg(summary, size)`):** Renders crisp rounded concentric rings (`Prayers` Teal `#0b8a82`, `Dhikr` Cyan `#14b8a6`, `Quran` Gold `#d4af37`) around center overall % readout, tabular numerals (`font-variant-numeric: tabular-nums`), reused on `#iqHeroChallenge` (`84px`) and `#iqChallengeBody` (`116px`).
- **Time-Aware Salutation + Live Next Prayer Chip (`getTimeGreeting()`):** Inside `"Today's Focus"`, display personalized salam + time period (`Assalamu Alaikum · Morning`, `Peaceful Afternoon`, `Blessed Evening`) paired with the live Next Prayer pill (`Next: Dhuhr · 11:46 AM`).
- **7-Day Rhythm Strip (`computeWeeklyRhythm(state, dateKey)`):** Computes the trailing 7 local days (`dayLetter`, `prayersCount`, `complete`, `isToday`) cleanly from `S.log` using shared date math, rendered inside `.iq-hero-ch-card` (mobile/tablet/desktop) so users see weekly consistency immediately above the fold.
- **Compact Bonus + Muhasabah Utility Row (`index.html`, `styles/main.css`):** Group `#bonusArea` and `#muhasabahEntry` cleanly into a compact horizontal pill row inside `#panel-today` (moving `#bonusArea` neatly inline or compacting `.daily-bonus` & `.muh-entry` pills to `border-radius: 999px`) reclaiming >60px above Prayers on phones.

### 1.2 Pillars-Grade Prayer Cards (`core/prayers.js`, `core/render-prayers.js`, `core/actions.js`, `styles/main.css`)
- **Live Time Subtitle & Active Window Glow:** Display cached Aladhan clock time (`5:01 AM`, etc.) inside each prayer tile when cached (graceful `Dawn/Noon/...` fallback), highlighting the active upcoming prayer card with `.iq-next-prayer-card` (`border-color: var(--accent)` + crisp `UP NEXT` micro badge).
- **On-Time (`true`) vs Made-Up Qada (`'qada'`) Distinction:** Refactor `toggleP(id, mode)` cleanly cleanly via a shared toggle helper so clicking the card logs On-Time (`true`) and clicking the compact bottom-left `↺` button (`togglePrayerQada(id)`) toggles `'qada'` (`Made up` golden check state, still counted truthy toward daily 5 prayers & streak). Export `window.togglePrayerQada` and `window.App.togglePrayerQada`.
- **Excused Streak Pause Mode (`S.prayerSettings.paused`):** Add `togglePrayerPause()` in `core/render-prayers.js` (delegated cleanly via existing `S.prayerSettings`) and protect `S.cs` inside `core/prayers.js` `recalc()` when `S.prayerSettings.paused === true`. Surface a quiet `"Pause"` / `"Paused · Streak Protected"` button pill in the Prayer header row.

### 1.3 Tarteel Sanctuary Quran Reader & Tactile Tasbeeh Orb (`core/dynamic.js`, `core/static.js`, `styles/main.css`)
- **Quran Sanctuary Toolbar (`_renderQuranSanctuaryBar()` in `core/dynamic.js`):**
  - Save `S.lastQuranSurah = num` on `openQuranSurah(num)` and show a clean **"Continue Reading ›"** card at the top of `renderQuran()`.
  - Shared reader toolbar inside Surah & Juz views with:
    - Font scale pills (`A-` / `A+` adjusting `S.quranFontScale` `0.85..1.45`)
    - Scoped reader canvas tint pills (`Day` / `Parchment` / `Tahajjud`) applied strictly via class `.quran-sanctuary.tint-<mode>` (zero document-level theme mutation!)
    - `+5m Read` & `▶ Play` controls.
- **Haptic Tactile Tasbeeh Orb (`core/static.js` -> `renderDhikrCounter`):** Upgrade `.dhikr-tap-btn` into a centered circular SVG progress ring surrounding a glowing teal touch orb (`cnt / target`) with ripple ring & haptic/visual count telemetry.

### 1.4 Custom Geometric Empty States & Unified MPA Shell (`features/masjid-checkins.js`, `src/shell/layout.js`, `src/render/prayers.js`)
- Replace dashed empty box in `features/masjid-checkins.js` with clean inline SVG mosque-arch wireframe illustration + inviting callout.
- Upgrade `src/shell/layout.js` (`<strong>IQ</strong> Ibadah Quest` badge header) and `src/render/prayers.js` (teal pill prayer buttons matching visual language) while keeping `tests/mpa-complete.test.js` & `tests/today-page.test.js` 100% green.
- Add `font-variant-numeric: tabular-nums` on timers, counters, and XP/level readouts.
