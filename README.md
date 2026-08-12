# Ibadah Quest

**Prayer · Deeds · Knowledge · Growth** — an offline-first habit tracker for daily Islamic worship.

Track your five daily prayers, dhikr, Quran reading, voluntary acts, and more. Earn XP, level up, unlock achievements, and build lasting streaks on your spiritual journey.

## Features

- **Daily Prayer Tracking** — Log Fajr, Dhuhr, Asr, Maghrib, and Isha with one tap
- **Dhikr Counter** — Track morning/evening adhkar and custom dhikr sessions
- **Combo Streaks** — Maintain consistency across multiple worship categories
- **Achievement Showcase** — Unlock badges and milestones as you progress
- **Seasonal Events** — Ramadan tracker, Laylat al-Qadr guidance, and themed content
- **Analytics Dashboard** — Weekly comparisons, trend charts, and smart insights
- **Personal Goals** — Set and track custom worship targets
- **Spiritual Growth** — Progressive content system with themed journeys
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
| Storage | localStorage |
| PWA | Service Worker + Web App Manifest |
| Fonts | Sora, Noto Naskh Arabic, Amiri |
| Testing | Node.js built-in test runner |

No build step required. No bundler. No framework dependencies.

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
node --test tests/*.test.js
```

## Project Structure

```
Ibadah Quest/
├── index.html          # Single-page app entry point
├── manifest.json       # PWA manifest with widget definitions
├── sw.js               # Service worker (cache-first for assets)
├── core/               # Core state management and actions
│   └── actions.js
├── state/              # App state, user data, and localStorage
│   └── state.js
├── features/           # Feature modules
│   ├── achievement-showcase.js
│   ├── combo-streaks.js
│   ├── consistency-bonuses.js
│   ├── daily-ritual.js
│   ├── daily-summary.js
│   ├── journeys.js
│   ├── muhasabah.js
│   ├── notifications.js
│   ├── onboarding.js
│   ├── personal-goals.js
│   ├── search.js
│   ├── seasonal-events.js
│   ├── spiritual-growth/   # Ramadan, Laylat, themed content
│   └── ...
├── analytics/          # Charts, dashboards, insights
├── widgets/            # PWA widget implementations
├── render/             # DOM rendering logic
├── data/               # Static data (prayers, achievements, hadith, etc.)
│   ├── prayers.js
│   ├── achievements.js
│   ├── hadith-collections.js
│   └── pools/          # Themed content pools
├── styles/             # CSS (main.css)
├── assets/icons/       # App icons (SVG)
└── tests/              # Test suite (29 test files)
```

## Development

### Adding a Feature

1. Create a new file in `features/`
2. Add corresponding tests in `tests/`
3. Import in `index.html` via `<script>` tag

### Data Structure

All user data is persisted in localStorage under the `iq9_user_` prefix. The state object tracks prayers, deeds, XP, level, streaks, achievements, and more.

## License

Personal use only.
