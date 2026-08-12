# Device Preview Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a developer-only `preview.html` page that renders the app inside three switchable device-width iframes (Phone / Tablet / Laptop) plus a `?dev=1` redirect from `index.html`.

**Architecture:** A standalone, self-contained `preview.html` (inline CSS + inline JS, no build step) that hosts the app in an iframe whose width acts as the device viewport. A 3-line inline script at the top of `index.html`'s `<head>` redirects `?dev=1` to the preview page. No app feature code is touched.

**Tech Stack:** Plain HTML/CSS/JS. `URLSearchParams`, `navigator.clipboard` (with fallback), iframes.

## Global Constraints

- The app's responsive breakpoints are viewport-based: `@media (max-width: 600px)` (phone) and `max-width: 880px` (tablet `.app`). The preview MUST render the app in an iframe so the iframe width is the viewport.
- `preview.html` must NOT be linked from the app's navigation and must not appear in `manifest.json`.
- Device widths: Phone = 375px, Tablet = 768px, Laptop = fill (100%).
- `preview.html?size=` accepts `mobile` | `tablet` | `laptop` (default `mobile`).
- `index.html`'s redirect must run before app initialization (top of `<head>`).
- The preview page must respect `prefers-reduced-motion: reduce` (no transitions).
- The 226 existing tests must continue passing (`node --test tests/*.test.js`).

---

### Task 1: Preview.html (device frames, toolbar, switching)

**Files:**
- Create: `preview.html`

**Interfaces:**
- Consumes: nothing from other tasks (standalone page).
- Produces: an interactive page at `preview.html` handling `?size=mobile|tablet|laptop`.

- [ ] **Step 1: Create `preview.html` with full markup, styles, and script**

Create `preview.html` at the project root with exactly this content:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ibadah Quest — Device Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --toolbar-h: 56px;
      --body-bg: #1a1a24;
      --panel-bg: #23232f;
      --panel-border: #31313f;
      --text: #eceaf3;
      --text2: #9a97ad;
      --accent: #f43f5e;
      --radius: 14px;
    }
    html, body { height: 100%; }
    body {
      font-family: -apple-system, "Segoe UI", Sora, system-ui, sans-serif;
      background: var(--body-bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
    }

    /* Toolbar */
    #toolbar {
      height: var(--toolbar-h);
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      background: var(--panel-bg);
      border-bottom: 1px solid var(--panel-border);
      overflow-x: auto;
      scrollbar-width: none;
    }
    #toolbar::-webkit-scrollbar { display: none; }
    #toolbar .label { font-size: 0.8rem; color: var(--text2); margin-right: 4px; white-space: nowrap; }
    .dev-btn {
      flex: 0 0 auto;
      background: transparent;
      color: var(--text2);
      border: 1px solid var(--panel-border);
      border-radius: 999px;
      padding: 7px 16px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
    }
    .dev-btn:hover { color: var(--text); border-color: var(--accent); }
    .dev-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
    #readout { margin-left: auto; font-size: 0.8rem; color: var(--text2); white-space: nowrap; font-variant-numeric: tabular-nums; }
    #copyUrl, #openFull { background: transparent; color: var(--text2); border: 1px solid var(--panel-border); border-radius: 8px; padding: 6px 12px; font-size: 0.8rem; cursor: pointer; text-decoration: none; white-space: nowrap; }
    #copyUrl:hover, #openFull:hover { color: var(--text); }

    /* Stage + frames */
    #stage {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .frame {
      background: #0b0b11;
      border-radius: 24px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
      position: relative;
      flex: 0 0 auto;
      transition: width 0.2s ease;
    }
    /* Phone bezel */
    .frame-phone {
      width: 375px;
      border-radius: 44px;
      border: 10px solid #2c2c36;
      padding-top: 10px;
    }
    .frame-phone::before {  /* notch */
      content: "";
      position: absolute;
      top: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 26px;
      background: #0b0b11;
      border-radius: 100px;
      z-index: 2;
    }
    /* Tablet bezel */
    .frame-tablet {
      width: 768px;
      border-radius: 28px;
      border: 12px solid #2c2c36;
    }
    /* Laptop browser chrome */
    .frame-laptop {
      width: 100%;
      max-width: 1280px;
      border-radius: 14px;
      border: 1px solid var(--panel-border);
      overflow: hidden;
    }
    .browser-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 14px;
      background: var(--panel-bg);
      border-bottom: 1px solid var(--panel-border);
    }
    .browser-bar .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot-r { background: #ff5f57; }
    .dot-y { background: #febc2e; }
    .dot-g { background: #28c840; }
    .browser-bar .addr {
      flex: 1;
      margin-left: 8px;
      background: #111118;
      color: var(--text2);
      font-size: 0.75rem;
      border-radius: 8px;
      padding: 5px 12px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    iframe {
      display: block;
      width: 100%;
      height: calc(100vh - var(--toolbar-h) - 80px);
      border: 0;
      background: #fff;
    }
    .frame-phone iframe { border-radius: 0 0 34px 34px; height: min(calc(100vh - var(--toolbar-h) - 100px), 812px); }
    .frame-tablet iframe { border-radius: 0 0 16px 16px; height: min(calc(100vh - var(--toolbar-h) - 100px), 1024px); }

    @media (prefers-reduced-motion: reduce) {
      .dev-btn, .frame { transition: none; }
    }
  </style>
</head>
<body>
  <div id="toolbar">
    <span class="label">Device:</span>
    <button class="dev-btn" data-device="mobile">📱 Mobile</button>
    <button class="dev-btn" data-device="tablet">Tablet</button>
    <button class="dev-btn" data-device="laptop">💻 Laptop</button>
    <button id="copyUrl">⎘ Copy URL</button>
    <a id="openFull" href="index.html" target="_blank" rel="noopener">↗ Open full</a>
    <span id="readout"></span>
  </div>
  <div id="stage">
    <div id="frame" class="frame frame-phone">
      <div id="browserBar" class="browser-bar" style="display:none;">
        <span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span>
        <span class="addr">index.html</span>
      </div>
      <iframe id="frameIframe" src="index.html" title="App preview"></iframe>
    </div>
  </div>

  <script>
    (function () {
      var DEVICES = {
        mobile: { width: 375, cls: 'frame-phone', label: 'Mobile', size: 'mobile' },
        tablet: { width: 768, cls: 'frame-tablet', label: 'Tablet', size: 'tablet' },
        laptop: { width: '100%', cls: 'frame-laptop', label: 'Laptop', size: 'laptop' }
      };
      var param = new URLSearchParams(window.location.search).get('size');
      var current = DEVICES[param] ? param : 'mobile';

      var frame = document.getElementById('frame');
      var iframe = document.getElementById('frameIframe');
      var readout = document.getElementById('readout');
      var browserBar = document.getElementById('browserBar');
      var buttons = Array.prototype.slice.call(document.querySelectorAll('.dev-btn'));

      function apply(device) {
        current = device;
        var d = DEVICES[device];
        frame.className = 'frame ' + d.cls;
        browserBar.style.display = device === 'laptop' ? '' : 'none';
        // Reload the iframe so the app re-renders at the new viewport width.
        var src = iframe.src;
        iframe.src = '';
        iframe.src = src;
        buttons.forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-device') === device);
        });
        readout.textContent = 'Current: ' + d.label + ' (' + (d.width === '100%' ? 'flexible' : d.width + 'px') + ')';
        // Update the URL so links can be shared without clearing history.
        var url = new URL(window.location.href);
        url.searchParams.set('size', device);
        window.history.replaceState(null, '', url.toString());
      }

      buttons.forEach(function (b) {
        b.addEventListener('click', function () { apply(b.getAttribute('data-device')); });
      });

      document.getElementById('copyUrl').addEventListener('click', function () {
        var url = new URL(window.location.href);
        url.searchParams.set('size', current);
        var text = url.toString();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            alert('Preview URL copied: ' + text);
          }).catch(function () { prompt('Copy this URL:', text); });
        } else {
          prompt('Copy this URL:', text);
        }
      });

      apply(current);
    })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify preview.html renders the app at all three widths**

Manual check (no automated test — the page is a dev tool and not part of the app test suite):
1. Open `preview.html` in a browser. Expected: the app appears inside a phone frame (375px), toolbar shows "Mobile" active, readout shows `Current: Mobile (375px)`.
2. Click **Tablet** → app reloads in a 768px frame with tablet bezel.
3. Click **Laptop** → a browser-chrome bar appears above the app; app takes the full stage width.
4. On the phone view the tier tabs should be a scrollable row (phone breakpoint); on tablet the app is ≤880px; on laptop full width. This confirms the iframe really drives the breakpoints.

- [ ] **Step 3: Commit**

```bash
git add preview.html
git commit -m "feat: add device preview tool (preview.html) with phone/tablet/laptop frames"
```

---

### Task 2: ?dev=1 redirect from index.html

**Files:**
- Modify: `index.html:3-5` (add inline fragment before the existing meta tags)

**Interfaces:**
- Consumes: the app URL query string.
- Produces: `window.location.replace('preview.html')` when `?dev=1` is present.

- [ ] **Step 1: Add the redirect script at the very top of `<head>`**

In `index.html`, right after `<head>` (currently line 3), insert this script **before** the existing `<meta charset>` line:

```html
<head>
  <script>
  /* Dev-only: redirect ?dev=1 to the device preview tool. */
  if (new URLSearchParams(window.location.search).get('dev') === '1') {
    window.location.replace('preview.html');
  }
  </script>
  <meta charset="UTF-8">
```

The exact original region to replace is:

```html
<head>
  <meta charset="UTF-8">
```

The `?dev=1` redirect fires before any app CSS/JS loads, so the app never initializes on the redirect path.

- [ ] **Step 2: Verify the redirect and no-loop behavior**

Manual checks:
1. Open `index.html?dev=1` → the page should land on `preview.html`.
2. Open `preview.html` and `preview.html?size=tablet` → neither should redirect anywhere (no loop).
3. Open `index.html` (no query) → the app loads normally.

- [ ] **Step 3: Run the full test suite**

Run: `node --test tests/*.test.js`
Expected: PASS 226, FAIL 0. (The `?dev=1` fragment is inert in the test VM and the app test suite does not assert on `preview.html`.)

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: redirect ?dev=1 to device preview tool"
```

---

## Execution Notes

### Verification

Each task includes its own commit and verification steps. The final state must pass:

```
node --test tests/*.test.js
```

with 226 passing and 0 failing.

### Files Summary

| File | Task | Responsibility |
|------|------|----------------|
| `preview.html` | 1 (create) | Self-contained dev preview: toolbar, device frames, iframe host, `?size=` handling |
| `index.html` | 2 (modify) | `<head>` redirect for `?dev=1` |

### Non-Goals

- No changes to `styles/main.css`, `core/actions.js`, `render/render.js`, or feature code.
- No PWA integration: `preview.html` stays out of the manifest and app nav.