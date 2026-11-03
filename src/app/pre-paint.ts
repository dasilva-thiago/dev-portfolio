// Runs synchronously in <head>, before first paint and before React:
//  1. applies the stored/system appearance classes to <html> (no flash of the wrong theme);
//  2. on the unprefixed root only, sends a first-time visitor to /pt or /es (stored preference, then browser
//     language) so nothing renders in English first. Prefixed URLs and project URLs are never redirected.
export const PRE_PAINT_SCRIPT = `(function () {
  try {
    var saved = localStorage.getItem('darkMode');
    var prefersDark = window.matchMedia
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'true' || (saved === null && prefersDark)) {
      document.documentElement.classList.add('dark-mode');
    }
    if (localStorage.getItem('highContrast') === 'true') {
      document.documentElement.classList.add('high-contrast');
    }
  } catch (e) {}
  try {
    if (location.pathname === '/') {
      var stored = localStorage.getItem('lang');
      var lang = stored === 'en' || stored === 'pt' || stored === 'es'
        ? stored
        : (navigator.language || '').slice(0, 2);
      if (lang === 'pt' || lang === 'es') {
        // This document keeps running until the new one loads: hide it and tell the app not to act on it.
        document.documentElement.setAttribute('data-redirecting', '');
        location.replace('/' + lang + location.search + location.hash);
      }
    }
  } catch (e) {}
})();`;
