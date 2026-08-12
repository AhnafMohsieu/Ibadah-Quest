# Device Preview Tool — Design

**Date:** 2026-08-12
**Status:** Approved

## Purpose

A developer-only tool that lets the developer view the Ibadah Quest app at three
device viewports while working in a desktop web browser: Phone, Tablet, and Laptop.
The tool activates via `preview.html` (typed manually) or by appending `?dev=1` to
the app's URL, which redirects to the preview page.

## Background / Key Constraint

The app's responsive layout is driven by **viewport** media queries in
`styles/main.css`:

- `@media (max-width: 600px)` — phone layout (e.g. tier1 tabs become a scrollable row, grids collapse to 3 cols)
- `@media (max-width: 880px)` — tablet layout (`.app` `max-width: 880px`)

Constraining the `.app` container to a narrower width **does not** retrigger these
media queries, because media queries respond to the *viewport* width, not a parent
container's width. The only faithful way to preview a breakpoint is to give the app
a real viewport of that width. Therefore the tool renders the app inside
**iframes** — each iframe's own viewport IS the device width.

## Approach

Create a new standalone page `preview.html` at the project root:

- **Not linked from the app's navigation** — real users never discover it.
- Loads `index.html` inside **three switchable iframes**, one per device size.
- A fixed toolbar at the top lets the developer switch sizes.

### Device sizes

| Device    | iframe width | Frame style                              |
|-----------|--------------|------------------------------------------|
| Phone     | 375px        | Rounded bezel, top notch, home indicator |
| Tablet    | 768px        | Rounded tablet bezel, no notch           |
| Laptop    | fill (100%)  | Browser chrome bar (dots + address bar)  |

All iframes use the same height (viewport height minus the toolbar), centered
vertically with a device shadow.

### Toolbar controls

- **📱 / Tablet / 💻 buttons** — switch the active device.
- **Live readout** — "Current: 375px" updates on selection.
- **Copy-URL button** — copies a direct link like `preview.html?size=mobile` so a
  developer can share a specific viewport with someone.
- **Open-in-new-tab button** — opens the app at full size (no iframe).

### URL handling

- `preview.html` reads `?size=` → `mobile` | `tablet` | `laptop` (default `mobile`).
- `index.html?dev=1` → `window.location.replace('preview.html')` so the real app's
  URL reaches the tool. Implemented as a tiny inline script at the very top of
  `index.html`'s `<head>` so it runs before any app init.

## Files Changed

| File                      | Change                                              |
|---------------------------|-----------------------------------------------------|
| `preview.html` (new)      | Toolbar + iframe container + inline styles/script   |
| `index.html` (modified)   | Add 3-line `?dev=1` redirect at top of `<head>`     |

No changes to `styles/main.css`, `core/actions.js`, `render/render.js`, or any
app feature code. The app's own test suite is unaffected.

## Implementation Details (preview.html)

Structure:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ibadah Quest — Device Preview</title>
  <style> /* toolbar + frame CSS */ </style>
</head>
<body>
  <div id="toolbar">
    <button data-device="mobile">📱 Mobile</button>
    <button data-device="tablet">Tablet</button>
    <button data-device="laptop">💻 Laptop</button>
    <span id="readout"></span>
    <button id="copyUrl">⎘ Copy URL</button>
    <a id="openFull" target="_blank" rel="noopener">↗ Open full</a>
  </div>
  <div id="stage">
    <div id="frame" class="frame-phone"><iframe id="frameIframe" ...></iframe></div>
  </div>
  <script> /* sizing, switching, URL read/write logic */ </script>
</body>
</html>
```

Behavior:

- Default iframe source: `index.html` (same directory).
- On device switch: set frame width class, insert a fresh iframe (so the app
  reloads at the new viewport), center vertically.
- `copyUrl` uses `navigator.clipboard.writeText` with fallback to a prompt dialog.
- Height: `calc(100vh - toolbar height)`; on short screens allow vertical page
  scroll rather than squashing the frame.
- Preview page has a distinct background (dark neutral) so frames stand out.
- Reduce motion: respect `prefers-reduced-motion` — no transitions.

## Edge Cases

- **Iframe + service worker:** the app registers its SW from inside the iframe;
  works as normal. The intro overlay shows on each iframe load — acceptable for a
  dev tool.
- **localStorage / state:** iframe shares the app's origin, so saved state is
  shared. Previewing does not pollute production state beyond normal app use.
- **`?dev=1` when already on preview:** no loop — preview.html itself ignores `dev`.
- **No `?dev` on index.html:** redirect never fires; real users unaffected.
- **Clipboard blocked (insecure context / permissions):** fallback prompt.

## Non-Goals

- Not a QA harness — no automated assertions against layouts.
- Not shipped to the PWA — `preview.html` is excluded from nav and not in the
  manifest.
- Not a production feature; strictly a development aid.

## Testing / Verification

- Manual: open `preview.html` → switch all three devices, confirm each shows the
  correct layout (phone: scrollable tier tabs / 3-col grids; tablet: 880px max
  width; laptop: full width).
- Manual: `index.html?dev=1` lands on `preview.html`.
- Manual: `preview.html?size=tablet` opens directly on the tablet view.
- Run `node --test tests/*.test.js` → expect 226/226 still passing (app untouched).