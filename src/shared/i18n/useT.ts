import { useI18n } from "./I18nProvider";
import { localizePath } from "./path";
import type { Resources } from "./types";

export function useT() {
  const { t, tList, locale } = useI18n();
  return { t, tList, locale };
}

export function useResources(): Resources {
  return useI18n().resources;
}

export function useLocalizedPath(): (to: string) => string {
  const { locale } = useI18n();
  return (to) => localizePath(to, locale);
}
