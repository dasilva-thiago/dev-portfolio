import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locales";

export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/")[1];
  return LOCALES.find((locale) => locale === first && locale !== DEFAULT_LOCALE) ?? DEFAULT_LOCALE;
}

export function stripLocale(pathname: string): string {
  const locale = localeFromPath(pathname);
  if (locale === DEFAULT_LOCALE) return pathname === "" ? "/" : pathname;
  const rest = pathname.slice(locale.length + 1);
  return rest === "" ? "/" : rest;
}

// `to` is a locale-neutral or already-localized path, optionally with a hash.
export function localizePath(to: string, locale: Locale): string {
  const hashIndex = to.indexOf("#");
  const path = hashIndex === -1 ? to : to.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : to.slice(hashIndex);
  const base = stripLocale(path === "" ? "/" : path);
  if (locale === DEFAULT_LOCALE) return base + hash;
  return (base === "/" ? `/${locale}` : `/${locale}${base}`) + hash;
}
