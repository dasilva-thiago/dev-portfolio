export const LOCALES = ["en", "pt", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  pt: "Português",
  es: "Español",
};

export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  pt: "pt-BR",
  es: "es",
};
