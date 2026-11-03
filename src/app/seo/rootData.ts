import type { Locale } from "~/shared/i18n/locales";
import type { Resources } from "~/shared/i18n/types";

interface RootData {
  locale: Locale;
  resources: Resources;
}

// Route `meta` functions read the locale and resources that the root loader already fetched.
export function readRootData(matches: ReadonlyArray<{ id: string; loaderData?: unknown } | undefined>): RootData | null {
  const root = matches.find((match) => match?.id === "root");
  const data = root?.loaderData as Partial<RootData> | undefined;
  return data?.locale && data.resources ? { locale: data.locale, resources: data.resources } : null;
}
