import type { Locale } from "./locales";
import type { Resources } from "./types";

const LOADERS: Record<Locale, () => Promise<{ default: Resources }>> = {
  en: () => import("./resources/en.json"),
  pt: () => import("./resources/pt.json"),
  es: () => import("./resources/es.json"),
};

export async function loadResources(locale: Locale): Promise<Resources> {
  return (await LOADERS[locale]()).default;
}
