import type { Locale } from "./locales";

// Read by the pre-paint script (src/app/pre-paint.ts) on the next visit to the root.
const KEY = "lang";

export function storeLocale(locale: Locale): void {
  try {
    localStorage.setItem(KEY, locale);
  } catch {
    // storage unavailable (private mode, blocked): preference simply isn't persisted
  }
}
