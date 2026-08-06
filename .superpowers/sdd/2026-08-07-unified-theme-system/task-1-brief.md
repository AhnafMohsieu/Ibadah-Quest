# Task 1: Remove 5 dark-theme variants, keep 5 light families

## Required Behavior

Objective: delete the 5 dark-theme entries from the Unified Theme system so only the 5 light families remain.

### Files & Actions

**tests/html.test.js:**
- **Delete** these tests:
  - `test('dark theme: CSS maps the dark palette under the html[data-theme=dark] selector', ...)`
  - `test('dark theme: index.html applies saved theme before first paint (no-flash)', ...)`
  - `test('theme: five families have both light and dark blocks in main.css', ...)`

- **Add** these replacement h tests:
  1. Test for 5 light-family palette blocks only:
     ```js
     test('theme: five light-family palette blocks exist in main.css', () => {
       for (const key of ['serene','royal','sand','midnight']) {
         assert.ok(css.includes(`html[data-theme="${key}"]`), `missing palette block for ${key}`);
       }
       assert.ok(css.includes('--bg: #faf7f5'));   // light (default) :root block present
       assert.ok(!css.includes('html[data-theme="dark"]'), 'dark palette block must be removed');
       assert.ok(!css.includes('html[data-theme="serene-dark"]'), 'serene-dark palette block must be removed');
     });
     ```

  2. Replace the `no-flash` test with one that still validates theme-loaded-script presence:
     ```js
     test('theme: index.html pre-paint script sets data-theme from localStorage', () => {
       assert.ok(html.includes("localStorage.getItem('iqTheme')"));
       assert.ok(html.includes("setAttribute('data-theme'"));
       assert.ok(html.includes('styles/main.css?v=5'));
     });
     ```

- **Keep** these tests unchanged:
  - `theme: picker references metadata and setTheme wiring` (chips/label)
  - `modern light glass theme: uses the new bg and glass accents`
  - `modern light theme: old emerald/gold dark backgrounds are removed`
  - All other existing tests

**styles/main.css:**
- Delete the `dark` block (lines ~32-59): `html[data-theme="dark"] { ... }` through its `.app::before/::after` opacity, `body` background breaking changes. About 28 lines.
- Delete all 5 `*-dark` blocks at about lines 69-75 (`serene-dark`), 83-89 (`royal-dark`), 97-103 (`sand-dark`), 111-117 (`midnight-dark`).
- Keep the 4 light family blocks `serene`, `royal`, `sand`, `midnight` untouched.

**data/theme-meta.js:**
- Replace entire file with:
```js
window.Themes = [
  { key:'light', label:'Light', swatch:{ bg:'#faf7f5', accent:'#f43f5e' } },
  { key:'serene', label:'Serene', swatch:{ bg:'#f3f7f2', accent:'#4c7a4a' } },
  { key:'royal', label:'Royal', swatch:{ bg:'#f7f4ff', accent:'#7c5cf0' } },
  { key:'sand', label:'Sand', swatch:{ bg:'#fbf6ec', accent:'#c98a2e' } },
  { key:'midnight', label:'Midnight', swatch:{ bg:'#f4f7fb', accent:'#3fa7c8' } }
];
```

## Work Order
1. Write the three new tests in tests/html.test.js, delete the three old tests.
2. Run `node --test` — expect failure (dark blocks removed from CSS but test still expected them).
3. Delete the dark CSS blocks from styles/main.css.
4. Replace theme-meta.js with 5 entries.
5. Run `node --test` — expect all pass.
6. Commit with message: `style: remove 5 dark-theme variants, keep 5 light families`
7. Report status, commit SHA, test summary, and concerns.

## Report
Write full report to: `.superpowers/sdd/2026-08-07-unified-theme-system/task-1-report.md`
Include: test output, files changed, commit SHA, concerns.