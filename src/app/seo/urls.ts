// Imported by react-router.config.ts, which loads before the `~/` alias exists: keep these imports relative.
import { SITE } from "../../shared/config/site";
import { LOCALES, type Locale } from "../../shared/i18n/locales";
import { localizePath } from "../../shared/i18n/path";

export const HREFLANG: Record<Locale, string> = { en: "en", pt: "pt-BR", es: "es" };
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", pt: "pt_BR", es: "es_ES" };

// Canonical URLs carry no trailing slash except the site root.
export function pageUrl(path: string): string {
  return path === "/" ? `${SITE.origin}/` : `${SITE.origin}${path}`;
}

export function assetUrl(path: string): string {
  return `${SITE.origin}${path}`;
}

export interface Alternate {
  hreflang: string;
  href: string;
}

// `neutralPath` is locale-independent ("/" or "/projects/<slug>").
export function alternatesFor(neutralPath: string): Alternate[] {
  return [
    ...LOCALES.map((locale) => ({
      hreflang: HREFLANG[locale],
      href: pageUrl(localizePath(neutralPath, locale)),
    })),
    { hreflang: "x-default", href: pageUrl(localizePath(neutralPath, "en")) },
  ];
}
