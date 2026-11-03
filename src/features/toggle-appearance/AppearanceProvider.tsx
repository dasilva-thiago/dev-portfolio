import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const THEME_COLORS = { light: "#faf6ec", dark: "#16130d" } as const;

interface Appearance {
  dark: boolean;
  contrast: boolean;
  toggleDark: () => void;
  toggleContrast: () => void;
}

const AppearanceContext = createContext<Appearance | null>(null);

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const hasClass = (name: string) => () => document.documentElement.classList.contains(name);
const isDark = hasClass("dark-mode");
const isContrast = hasClass("high-contrast");
const server = () => false;

function persist(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // storage unavailable: the preference lasts for this page view only
  }
}

function hasStoredDarkPreference(): boolean {
  try {
    return localStorage.getItem("darkMode") !== null;
  } catch {
    return false;
  }
}

// `<html>` classes are the single source of truth. The inline pre-paint script sets them before React runs;
// this provider only reads them and writes them on user action or a system-theme change.
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const dark = useSyncExternalStore(subscribe, isDark, server);
  const contrast = useSyncExternalStore(subscribe, isContrast, server);

  const toggleDark = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark-mode");
    document.documentElement.classList.toggle("dark-mode", next);
    persist("darkMode", next);
  }, []);

  const toggleContrast = useCallback(() => {
    const next = !document.documentElement.classList.contains("high-contrast");
    document.documentElement.classList.toggle("high-contrast", next);
    persist("highContrast", next);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      if (hasStoredDarkPreference()) return;
      document.documentElement.classList.toggle("dark-mode", event.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? THEME_COLORS.dark : THEME_COLORS.light);
  }, [dark]);

  const value = useMemo(
    () => ({ dark, contrast, toggleDark, toggleContrast }),
    [dark, contrast, toggleDark, toggleContrast],
  );
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): Appearance {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error("useAppearance must be used inside <AppearanceProvider>");
  return value;
}
