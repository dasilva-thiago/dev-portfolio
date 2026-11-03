import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./locales";
import type { ListKey, Resources, StringKey } from "./types";

interface I18nValue {
  locale: Locale;
  resources: Resources;
  t: (key: StringKey) => string;
  tList: (key: ListKey) => readonly string[];
}

const I18nContext = createContext<I18nValue | null>(null);

function resolve(source: unknown, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>((acc, part) => (acc as Record<string, unknown> | undefined)?.[part], source);
}

// The copy is plain JSON looked up by typed key (no plurals or interpolation), so a small context replaces a
// full i18n library. Key presence and shape parity across locales are enforced by tests and by the types.
export function I18nProvider({
  locale,
  resources,
  children,
}: {
  locale: Locale;
  resources: Resources;
  children: ReactNode;
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      resources,
      t: (key) => {
        const found = resolve(resources, key);
        return typeof found === "string" ? found : key;
      },
      tList: (key) => {
        const found = resolve(resources, key);
        return Array.isArray(found) ? (found as string[]) : [];
      },
    }),
    [locale, resources],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}
