import { useLocation, useNavigate } from "react-router";
import type { Locale } from "~/shared/i18n/locales";
import { localizePath } from "~/shared/i18n/path";
import { storeLocale } from "~/shared/i18n/preference";

// Switching language is a navigation to the same page under the other locale prefix.
// The choice is persisted only here (an explicit action), never on a plain visit.
export function useSwitchLanguage(): (target: Locale) => void {
  const navigate = useNavigate();
  const location = useLocation();
  return (target) => {
    storeLocale(target);
    // The hash is left out on purpose: React Router scrolls to it even with preventScrollReset,
    // so a leftover "#about" would pull the page to that section.
    void navigate(localizePath(location.pathname, target), {
      replace: true,
      preventScrollReset: true,
    });
  };
}
