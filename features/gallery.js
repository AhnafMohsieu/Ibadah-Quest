/* features/gallery.js — Live In-App Design System & Component Gallery
 * Showcases Direction D ("Noor & Rhythm") tokens, multi-script type scale, RTL checks,
 * components, and loading/empty/error/offline/permission-denied states.
 */
(function() {
  function _esc(v) {
    return (typeof window !== 'undefined' && typeof window.escapeHTML === 'function') ? window.escapeHTML(String(v == null ? '' : v)) : String(v == null ? '' : v);
  }

  function _gt(v) {
    return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(v) : v;
  }

  function renderComponentGallery() {
    var el = document.getElementById('galleryArea');
    if (!el) return;
    var curTheme = (typeof S !== 'undefined' && S && S.theme) || 'light';
    var curLang = (typeof I18N !== 'undefined' && I18N.lang) || 'en';
    var html = '<div class="section-title">' + iqIcon('sparkles') + ' ' + _esc(_gt('Noor & Rhythm Design System Gallery')) + '</div>';

    // Interactive Theme & Script Preview Controls (Segmented Buttons with unmistakable active state)
    html += '<div class="content-card" style="margin-bottom:14px;">' +
      '<div style="font-weight:700;color:var(--accent-dark);margin-bottom:10px;">' + _esc(_gt('Interactive Token & Script Preview')) + '</div>' +
      '<div style="font-size:0.78rem;color:var(--text2);font-weight:600;margin-bottom:6px;">' + _esc(_gt('Theme & Appearance')) + '</div>' +
      '<div class="iq-seg-group" role="group" aria-label="Theme preview" style="width:100%;margin-bottom:12px;">' +
        [['light', 'Light'], ['dark', 'Dark'], ['night', 'OLED Night'], ['system', 'System']].map(function(pair) {
          return '<button type="button" class="iq-seg-btn' + (curTheme === pair[0] ? ' active' : '') + '" aria-pressed="' + (curTheme === pair[0]) + '" onclick="window.iqSetTheme(\'' + pair[0] + '\');window.renderComponentGallery();">' + _esc(_gt(pair[1])) + '</button>';
        }).join('') +
      '</div>' +
      '<div style="font-size:0.78rem;color:var(--text2);font-weight:600;margin-bottom:6px;">' + _esc(_gt('Language & Script')) + '</div>' +
      '<div class="iq-seg-group" role="group" aria-label="Language preview" style="width:100%;">' +
        [['en','English (LTR)'], ['bn','\u09AC\u09BE\u0982\u09B2\u09BE (BN)'], ['ar','\u0627\u0644\u0639\u0631\u0628\u064A\u0629 (RTL)']].map(function(pair) {
          return '<button type="button" class="iq-seg-btn' + (curLang === pair[0] ? ' active' : '') + '" aria-pressed="' + (curLang === pair[0]) + '" onclick="window.iqSetLang(\'' + pair[0] + '\');window.renderComponentGallery();">' + _esc(pair[1]) + '</button>';
        }).join('') +
      '</div>' +
    '</div>';

    // Color Palette Swatches (single-card container, no nested double border)
    html += '<div class="content-card" style="margin-bottom:14px;">' +
      '<div style="font-weight:700;color:var(--accent-dark);margin-bottom:8px;">' + _esc(_gt('WCAG 2.2 AA Token Swatches')) + '</div>' +
      '<div class="iq-swatch-row" style="width:100%;">' +
        '<div class="iq-swatch" style="background:var(--bg);color:var(--text);">' + _esc(_gt('Canvas')) + '<br><code dir="ltr">--bg</code></div>' +
        '<div class="iq-swatch" style="background:var(--surface-raised, var(--card-bg));color:var(--text);">' + _esc(_gt('Surface')) + '<br><code dir="ltr">--surface-raised</code></div>' +
        '<div class="iq-swatch" style="background:var(--accent);color:var(--accent-contrast);">' + _esc(_gt('Emerald')) + '<br><code dir="ltr">--accent</code></div>' +
        '<div class="iq-swatch" style="background:var(--gold-bg);color:var(--gold-dark);">' + _esc(_gt('Gold')) + '<br><code dir="ltr">--gold</code></div>' +
        '<div class="iq-swatch" style="background:var(--green-bg);color:var(--green);">' + _esc(_gt('Complete')) + '<br><code dir="ltr">--green</code></div>' +
      '</div>' +
    '</div>';

    // Typography & Script Scale
    html += '<div class="content-card" style="margin-bottom:14px;">' +
      '<div style="font-weight:700;color:var(--accent-dark);margin-bottom:8px;">' + _esc(_gt('Multi-Script Typography & Harakat / Conjunct Safety')) + '</div>' +
      '<div lang="en" dir="ltr" style="margin-bottom:8px;"><strong>English UI:</strong> Peaceful daily devotion without noisy slot-machine pressure.</div>' +
      '<div lang="bn" dir="ltr" class="iq-script-bn" style="margin-bottom:8px;"><strong>\u09AC\u09BE\u0982\u09B2\u09BE (Hind Siliguri \u00B7 1.62x line-height):</strong> \u09AF\u09C1\u0995\u09CD\u09A4\u09BE\u0995\u09CD\u09B7\u09B0, \u0995\u09C3\u09B7\u09BF, \u09B6\u09BF\u0995\u09CD\u09B7\u09BE\u09B0\u09CD\u09A5\u09C0 \u0993 \u09A6\u09C8\u09A8\u09BF\u0995 \u09A8\u09BE\u09AE\u09BE\u099C\u09C7\u09B0 \u09AA\u09CD\u09B0\u09B6\u09BE\u09A8\u09CD\u09A4 \u09A7\u09BE\u09B0\u09BE\u09AC\u09BE\u09B9\u09BF\u0995\u09A4\u09BE\u0964</div>' +
      '<div lang="ar" dir="rtl" class="iq-script-ar" style="margin-bottom:8px;"><strong>\u0627\u0644\u0639\u0631\u0628\u064A\u0629 (Noto Sans Arabic):</strong> \u0627\u0644\u0645\u062F\u0627\u0648\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0627\u0639\u0629 \u0628\u0633\u0643\u064A\u0646\u0629 \u0648\u0625\u062E\u0644\u0627\u0635.</div>' +
      '<div lang="ar" dir="rtl" data-script="quran" class="verse-arabic" style="font-size:1.55rem;color:var(--accent-dark);text-align:center;padding:8px 0;">\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650</div>' +
    '</div>';

    // Buttons & Interactive States Showcase
    html += '<div class="content-card" style="margin-bottom:14px;">' +
      '<div style="font-weight:700;color:var(--accent-dark);margin-bottom:8px;">' + _esc(_gt('Buttons, Toggles & Interactive States')) + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
        '<button type="button" class="iq-pill-btn" onclick="toast(iqIcon(\'check\'), window.t ? window.t(\'Primary action pressed\') : \'Primary action pressed\')">' + _esc(_gt('Primary Action')) + '</button>' +
        '<button type="button" class="iq-btn-secondary" onclick="toast(iqIcon(\'sparkles\'), window.t ? window.t(\'Secondary action pressed\') : \'Secondary action pressed\')">' + _esc(_gt('Secondary Action')) + '</button>' +
        '<button type="button" class="iq-pill-btn" disabled>' + _esc(_gt('Disabled State')) + '</button>' +
        '<button type="button" class="danger-btn" style="padding:10px 14px;width:auto;" onclick="window.iqConfirmDialog(window.t ? window.t(\'Confirm Action\') : \'Confirm Action\', window.t ? window.t(\'Sample safe confirm dialog?\') : \'Sample safe confirm dialog?\', window.t ? window.t(\'Confirm\') : \'Confirm\', function(){ toast(iqIcon(\'check\'), window.t ? window.t(\'Confirmed\') : \'Confirmed\'); }, false)">' + _esc(_gt('Dialog Demo')) + '</button>' +
      '</div>' +
    '</div>';

    // System States
    html += '<div class="content-card" style="margin-bottom:14px;">' +
      '<div style="font-weight:700;color:var(--accent-dark);margin-bottom:8px;">' + _esc(_gt('System States: Loading, Empty, Offline & Error')) + '</div>' +
      '<div class="iq-gallery-states" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;width:100%;">' +
        '<div style="padding:12px;border:1px solid var(--border);border-radius:12px;"><div style="font-size:0.75rem;color:var(--text2);margin-bottom:6px;">' + _esc(_gt('Loading Skeleton')) + '</div><div style="height:14px;width:70%;background:var(--surface-subtle);border-radius:6px;margin-bottom:6px;"></div><div style="height:12px;width:90%;background:var(--surface-subtle);border-radius:6px;"></div></div>' +
        '<div style="padding:12px;border:1px solid var(--border);border-radius:12px;"><div style="font-size:0.75rem;color:var(--text2);margin-bottom:4px;">' + _esc(_gt('Empty State')) + '</div><div><strong>' + _esc(_gt('No saved bookmarks yet')) + '</strong><div style="font-size:0.8rem;color:var(--text2);">' + _esc(_gt('Tap the bookmark star on any Surah or Dua.')) + '</div></div></div>' +
        '<div style="padding:12px;border:1px solid var(--warn);background:var(--warn-bg);color:var(--warn);border-radius:12px;"><div style="font-size:0.75rem;font-weight:700;">' + _esc(_gt('Offline State')) + '</div><div style="font-size:0.8rem;">' + _esc(_gt('Using offline Adhan prayer times & local database cleanly.')) + '</div></div>' +
        '<div style="padding:12px;border:1px solid var(--red);background:var(--red-bg);color:var(--red);border-radius:12px;"><div style="font-size:0.75rem;font-weight:700;">' + _esc(_gt('Error / Permission Denied')) + '</div><div style="font-size:0.8rem;">' + _esc(_gt('Location permission declined — choose any city preset manually.')) + '</div></div>' +
      '</div>' +
    '</div>';

    el.innerHTML = html;
  }

  window.renderComponentGallery = renderComponentGallery;
})();
