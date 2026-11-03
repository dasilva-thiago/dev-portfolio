import { useEffect } from "react";
import { useLocation } from "react-router";
import { SITE } from "~/shared/config/site";
import { isRedirecting } from "~/shared/lib/redirecting";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Inline bootstrap, executed before React. It only activates on the production hostname, so local
// previews and Vercel preview deployments never send hits. Its SHA-256 is added to the page CSP at build time.
export const ANALYTICS_BOOTSTRAP = `(function () {
  if (!${SITE.analyticsHostPattern}.test(location.hostname)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', '${SITE.gaId}', { send_page_view: false });
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}';
  document.head.appendChild(s);
})();`;

// One page_view per pathname change (the initial load included), since the site is a client-routed app.
export function usePageViews(): void {
  const { pathname } = useLocation();
  useEffect(() => {
    if (isRedirecting()) return;
    window.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);
}
