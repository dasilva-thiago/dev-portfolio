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
    void navigate(localizePath(location.pathname + location.hash, target), {
      replace: true,
      preventScrollReset: true,
    });
  };
}
