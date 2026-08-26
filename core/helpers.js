(function() {
  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>\"']/g, function(ch) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  window.escapeHTML = escapeHTML;
})();
