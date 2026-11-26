/* features/gallery.js — Live In-App Design System & Component Gallery
 * Showcases Direction D ("Noor & Rhythm") tokens, multi-script type scale, RTL checks,
 * components, and loading/empty/error/offline/permission-denied states.
 */
(function() {
  function _esc(v) {
    return (typeof window !== 'undefined' && typeof window.escapeHTML === 'function') ? window.escapeHTML(String(v == null ? '' : v)) : String(v == null ? '' : v);
  }

  function renderComponentGallery() {
    var el = document.getElementById('galleryArea');
    if (!el) return;
    var curTheme = (typeof S !== 'undefined' && S && S.theme) || 'light';
    var curLang = (typeof I18N !== 'undefined' && I18N.lang) || 'en';
    var html = '<div class="section-title">' + iqIcon('sparkles') + ' Noor &amp; Rhythm Design System Gallery</div>';

    // Interactive Theme & Script Preview Controls
    html += '<div class="content-card" style="margin-bottom:14px;">' +
      '<div style="font-weight:700;color:var(--accent);margin-bottom:8px;">Interactive Token &amp; Script Preview</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">' +
        ['light', 'dark', 'night', 'system'].map(function(m) {
          return '<button type="button" class="iq-pill-btn' + (curTheme === m ? ' active' : '') + '" onclick="window.iqSetTheme(\'' + m + '\');window.renderComponentGallery();">' + _esc(m.toUpperCase()) + '</button>';
        }).join('') +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        [['en','English (LTR)'], ['bn','\u09AC\u09BE\u0982\u09B2\u09BE (BN)'], ['ar','\u0627\u0644\u0639\u0631\u0628\u064A\u0629 (RTL)']].map(function(pair) {
          return '<button type="button" class="iq-pill-btn' + (curLang === pair[0] ? ' active' : '') + '" onclick="window.iqSetLang(\'' + pair[0] + '\');window.renderComponentGallery();">' + pair[1] + '</button>';
        }).join('') +
      '</div>' +
    '</div>';

    // Color Palette Swatches (WCAG 2.2 AA Tokens)
    html += '<div class="content-card iq-gallery-grid" style="margin-bottom:14px;">' +
      '<div class="iq-gallery-card">' +
        '<div style="font-weight:700;color:var(--accent-dark);margin-bottom:6px;">WCAG 2.2 AA Token Swatches</div>' +
        '<div class="iq-swatch-row">' +
          '<div class="iq-swatch" style="background:var(--bg);color:var(--text);">Canvas<br><code>--bg</code></div>' +
          '<div class="iq-swatch" style="background:var(--accent);color:var(--accent-contrast);">Emerald<br><code>--accent</code></div>' +
          '<div class="iq-swatch" style="background:var(--gold-bg);color:var(--gold-dark);">Gold<br><code>--gold</code></div>' +
          '<div class="iq-swatch" style="background:var(--green-bg);color:var(--green);">Complete<br><code>--green</code></div>' +
        '</div>' +
      '</div>' +
    '</div>';

    // Typography & Script Scale
    html += '<div class="content-card" style="margin-bottom:14px;">' +
      '<div style="font-weight:700;color:var(--accent);margin-bottom:8px;">Multi-Script Typography &amp; Harakat / Conjunct Safety</div>' +
      '<div style="margin-bottom:8px;"><strong>English UI:</strong> Peaceful daily devotion without noisy slot-machine pressure.</div>' +
      '<div lang="bn" class="iq-script-bn" style="margin-bottom:8px;"><strong>\u09AC\u09BE\u0982\u09B2\u09BE (Hind Siliguri \u00B7 1.62x line-height):</strong> \u09AF\u09C1\u0995\u09CD\u09A4\u09BE\u0995\u09CD\u09B7\u09B0, \u0995\u09C3\u09B7\u09BF, \u09B6\u09BF\u0995\u09CD\u09B7\u09BE\u09B0\u09CD\u09A5\u09C0 \u0993 \u09A6\u09C8\u09A8\u09BF\u0995 \u09A8\u09BE\u09AE\u09BE\u099C\u09C7\u09B0 \u09AA\u09CD\u09B0\u09B6\u09BE\u09A8\u09CD\u09A4 \u09A7\u09BE\u09B0\u09BE\u09AC\u09BE\u09B9\u09BF\u0995\u09A4\u09BE\u0964</div>' +
      '<div lang="ar" dir="rtl" class="iq-script-ar" style="margin-bottom:8px;"><strong>\u0627\u0644\u0639\u0631\u0628\u064A\u0629 (Noto Sans Arabic):</strong> \u0627\u0644\u0645\u062F\u0627\u0648\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0627\u0639\u0629 \u0628\u0633\u0643\u064A\u0646\u0629 \u0648\u0625\u062E\u0644\u0627\u0635.</div>' +
      '<div lang="ar" dir="rtl" data-script="quran" class="verse-arabic" style="font-size:1.55rem;color:var(--accent);text-align:center;padding:8px 0;">\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650</div>' +
    '</div>';

    // Buttons & Badges Showcase
    html += '<div class="content-card" style="margin-bottom:14px;">' +
      '<div style="font-weight:700;color:var(--accent);margin-bottom:8px;">Buttons, Toggles &amp; Badges (&ge;44x44px Targets)</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
        '<button type="button" class="onboarding-btn" style="padding:10px 18px;width:auto;" onclick="toast(iqIcon(\'check\'), \'Primary action pressed\')">Primary Action</button>' +
        '<button type="button" class="iq-pill-btn" onclick="toast(iqIcon(\'sparkles\'), \'Secondary pill pressed\')">Secondary Pill</button>' +
        '<button type="button" class="danger-btn" style="padding:10px 14px;width:auto;" onclick="window.iqConfirmDialog(\'Sample safe confirm dialog?\', function(){ toast(iqIcon(\'check\'), \'Confirmed\'); })">Dialog Demo</button>' +
      '</div>' +
    '</div>';

    // Prayer Row + Quest Card + Empty / Offline / Error / Skeleton / Permission Denied States
    html += '<div class="content-card" style="margin-bottom:14px;">' +
      '<div style="font-weight:700;color:var(--accent);margin-bottom:8px;">System States: Loading, Empty, Error, Offline &amp; Permission Denied</div>' +
      '<div class="iq-gallery-states" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">' +
        '<div style="padding:12px;border:1px solid var(--border);border-radius:12px;"><div style="font-size:0.75rem;color:var(--text2);margin-bottom:6px;">Loading Skeleton</div><div style="height:14px;width:70%;background:var(--surface-subtle);border-radius:6px;margin-bottom:6px;"></div><div style="height:12px;width:90%;background:var(--surface-subtle);border-radius:6px;"></div></div>' +
        '<div style="padding:12px;border:1px solid var(--border);border-radius:12px;"><div style="font-size:0.75rem;color:var(--text2);margin-bottom:4px;">Empty State</div><div><strong>No saved bookmarks yet</strong><div style="font-size:0.8rem;color:var(--text2);">Tap the bookmark star on any Surah or Dua.</div></div></div>' +
        '<div style="padding:12px;border:1px solid var(--warn);background:var(--warn-bg);color:var(--warn);border-radius:12px;"><div style="font-size:0.75rem;font-weight:700;">Offline State</div><div style="font-size:0.8rem;">Using offline Adhan prayer times &amp; local database cleanly.</div></div>' +
        '<div style="padding:12px;border:1px solid var(--red);background:var(--red-bg);color:var(--red);border-radius:12px;"><div style="font-size:0.75rem;font-weight:700;">Error / Permission Denied</div><div style="font-size:0.8rem;">Location permission declined — choose any city preset manually.</div></div>' +
      '</div>' +
    '</div>';

    el.innerHTML = html;
  }

  window.renderComponentGallery = renderComponentGallery;
})();
