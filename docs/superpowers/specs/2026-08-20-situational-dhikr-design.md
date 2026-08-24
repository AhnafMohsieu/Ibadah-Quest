# Situational Dhikr Subtab

**Date:** 2026-08-20
**Goal:** Add a "Situational" subtab under Adhkar with dhikr grouped by emotional/spiritual need.

## Overview

Add a 4th subtab under Daily → Adhkar called "Situational". It displays 10 emotion/spiritual categories in a grid. Tapping a category expands it into a scrollable list of curated dhikr cards (Arabic, transliteration, English, source).

## Categories (10)

| Key | Label | Icon | Dhikr Count |
|---|---|---|---|
| patience | Patience | clock | 5 |
| gratitude | Gratitude | sparkles | 4 |
| forgiveness | Forgiveness | heart | 4 |
| protection | Protection | shield | 5 |
| guidance | Guidance | map | 4 |
| love | Love | heart | 4 |
| fear | Fear & Anxiety | alert-triangle | 4 |
| hope | Hope | sunrise | 4 |
| sleep | Sleep & Rest | moon | 4 |
| travel | Travel | map | 3 |

## Data Structure

File: `data/relatable-dhikr.js`

```js
const SITUATIONAL_DHIKR = {
  patience: {
    label: 'Patience',
    icon: 'clock',
    dhikr: [
      { arabic: '...', roman: '...', english: '...', source: '...' },
      // 3-6 items
    ]
  },
  // ... 10 categories
};
```

## UI Flow

1. Category grid (2-column on mobile, 3-column on desktop) showing icon + label + count badge
2. Tap category → panel slides to show dhikr card list with back button
3. Each card: Arabic (Amiri font), romanization, English, source

## Files

| File | Change |
|---|---|
| `data/relatable-dhikr.js` | New — category data |
| `data/tab-groups.js` | Add "Situational" tab to adhkar group |
| `index.html` | Add `#panel-situational` div + script tag |
| `render/static.js` | Add `renderSituationalDhikr()` |
| `render/tabs.js` | Add to lazy render map |
| `render/dynamic.js` | Add to static init |
| `styles/main.css` | Category grid + card styles |
| `tests/html.test.js` | Verify panel + script exist |
