# Ibadah Quest

**Prayer · Deeds · Knowledge · Growth** — an offline-first Islamic worship tracker PWA.

Track your five daily prayers, dhikr, Quran reading, voluntary acts, and more. Earn XP, level up, unlock achievements, and build lasting streaks on your spiritual journey.

## Features

- **Daily Prayer Tracking** — Log Fajr, Dhuhr, Asr, Maghrib, and Isha with one tap
- **Dhikr Counter** — Track morning/evening adhkar with audio support and custom sessions
- **Combo Streaks** — Maintain consistency across multiple worship categories
- **Achievement Showcase** — Unlock badges and milestones as you progress
- **Seasonal Events** — Ramadan tracker, Laylat al-Qadr guidance, and themed content
- **Automatic Seasons** — Ramadan and Dhul Hijjah modes activate automatically by Hijri date
- **Tafsir Library** — Browse tafsir by surah/ayah with multiple editions
- **Analytics Dashboard** — Weekly comparisons, trend charts, and smart insights
- **Personal Goals** — Set and track custom worship targets
- **Spiritual Growth** — Progressive content system with themed journeys
- **Recovery System** — Automatic data backup, corruption quarantine, and one-click restore
- **Onboarding** — Guided first-run experience
- **PWA + Widgets** — Installable app with Daily Progress, Dhikr Counter, and Streak Calendar widgets
- **Accessibility** — Full keyboard navigation and screen reader support
- **Offline-First** — Works without internet; all data stored in localStorage
- **Pull-to-Refresh** — Mobile-friendly gesture support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Vanilla JavaScript + Tailwind CSS (CDN) |
| Charts | Chart.js + Canvas API |
| Storage | localStorage (schema-versioned with auto-migration) |
| PWA | Service Worker + Web App Manifest |
| Fonts | Sora, Noto Naskh Arabic, Amiri |
| Testing | Node.js built-in test runner (468 tests) |

No build step. No bundler. No framework dependencies.

## Getting Started

### Quick Start

```bash
# Option 1: Open directly in a browser
open index.html

# Option 2: Use a local server (recommended for PWA/service worker)
npx serve .
# or
python -m http.server 8000
```

### Running Tests

```bash
node --test
```

## Project Structure

```
Ibadah Quest/
├── index.html              # Single-page app entry point
├── manifest.json           # PWA manifest with widget definitions
├── sw.js                   # Service worker (cache-first for assets)
├── core/                   # Core modules
│   ├── actions.js          # App facade + boot modal queue
│   ├── xp.js               # XP pipeline (applyXpDelta, spendXp)
│   ├── random.js           # Weighted random selection
│   ├── helpers.js          # Shared utilities (escapeHTML)
│   ├── backup.js           # Data export/import
│   ├── recovery.js         # Corruption quarantine + repair
│   └── storage.js          # Schema-versioned localStorage
├── state/                  # App state + localStorage wrapper
│   └── state.js            # freshState, today/yesterdayKey, normalizeState
├── features/               # Feature modules
│   ├── tafsir-library.js   # Tafsir browser
│   ├── daily-ritual.js     # Daily worship checklist
│   ├── daily-summary.js    # End-of-day summary modal
│   ├── consistency-bonuses.js
│   ├── streak-milestones.js
│   ├── surprise-rewards.js
│   ├── personal-goals.js
│   ├── finance.js          # Sadaqah tracker
│   ├── health.js           # Health habits
│   ├── search.js           # Global search
│   ├── seasonal-events.js  # Ramadan / Dhul Hijjah auto-activation
│   ├── spiritual-growth/   # Themed journeys + content pools
│   └── ...
├── analytics/              # Charts, dashboards, insights
├── widgets/                # PWA widget implementations
├── render/                 # DOM rendering (static + dynamic)
├── data/                   # Static data (prayers, achievements, panel sections)
├── styles/                 # CSS (main.css)
├── assets/icons/           # App icons (SVG)
└── tests/                  # 57 test files, 468 tests
```

## Architecture

The app uses an IIFE-per-module pattern with `window.*` exports. No bundler — script tags load in dependency order with `defer`.

**Key abstractions:**
- `applyXpDelta(delta, opts?)` / `spendXp(amount, opts?)` — single source of truth for all XP mutations
- `openToastModal(html, overlayId?)` / `closeToastOverlay()` — shared modal lifecycle
- `appAction(name)` — fail-loud facade for feature calls
- `getTodayKey()` / `getYesterdayKey()` / `getWeekAgoKey()` — consistent local-date keys
- `escapeHTML(str)` — XSS-safe rendering
- `weightedPick(pool)` — weighted random selection

## Development

### Adding a Feature

1. Create a new file in `features/`
2. Add corresponding tests in `tests/`
3. Import in `index.html` via `<script>` tag (order matters)
4. Add entry in `data/tab-groups.js` if it's a new panel

### Data Structure

All user data is persisted in localStorage under the `iq9_user_` prefix. The state object tracks prayers, deeds, XP, level, streaks, achievements, and more. Schema migrations run automatically via `normalizeState()`.

## License

Personal use only.
