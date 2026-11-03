import { beforeEach, describe, expect, it } from "vitest";
import { PRE_PAINT_SCRIPT } from "./pre-paint";

interface Env {
  prefersDark?: boolean;
  storage?: Record<string, string>;
  pathname?: string;
  language?: string;
  search?: string;
  hash?: string;
}

function run({ prefersDark = false, storage = {}, pathname = "/", language = "en-US", search = "", hash = "" }: Env) {
  const classes = new Set<string>();
  const replaced: string[] = [];
  const attributes = new Set<string>();
  const fakeWindow = { matchMedia: () => ({ matches: prefersDark }) };
  const fakeDocument = {
    documentElement: {
      classList: { add: (name: string) => classes.add(name) },
      setAttribute: (name: string) => attributes.add(name),
    },
  };
  const fakeStorage = { getItem: (key: string) => storage[key] ?? null };
  const fakeLocation = { pathname, search, hash, replace: (url: string) => replaced.push(url) };
  new Function("window", "document", "localStorage", "location", "navigator", PRE_PAINT_SCRIPT)(
    fakeWindow,
    fakeDocument,
    fakeStorage,
    fakeLocation,
    { language },
  );
  return { classes, replaced, attributes };
}

describe("pre-paint appearance", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("follows the system preference on first visit", () => {
    expect(run({ prefersDark: true }).classes.has("dark-mode")).toBe(true);
  });

  it("a stored preference wins over the system preference", () => {
    expect(run({ prefersDark: true, storage: { darkMode: "false" } }).classes.has("dark-mode")).toBe(false);
    expect(run({ prefersDark: false, storage: { darkMode: "true" } }).classes.has("dark-mode")).toBe(true);
  });

  it("high contrast is independent of dark mode", () => {
    const { classes } = run({ storage: { highContrast: "true" } });
    expect(classes.has("high-contrast")).toBe(true);
    expect(classes.has("dark-mode")).toBe(false);
  });
});

describe("pre-paint first-visit language redirect", () => {
  it.each([
    ["pt-BR", "/pt"],
    ["es-ES", "/es"],
    ["es", "/es"],
  ])("sends a %s browser at the root to %s", (language, target) => {
    expect(run({ language }).replaced).toEqual([target]);
  });

  it("marks the document as redirecting so the app does not act on it", () => {
    expect(run({ language: "pt-BR" }).attributes.has("data-redirecting")).toBe(true);
    expect(run({ language: "en-US" }).attributes.has("data-redirecting")).toBe(false);
  });

  it("keeps the search and hash so legacy links still resolve", () => {
    expect(run({ language: "pt-BR", hash: "#projects/eduassets", search: "?a=1" }).replaced).toEqual([
      "/pt?a=1#projects/eduassets",
    ]);
  });

  it("leaves English and unsupported languages on the root", () => {
    expect(run({ language: "en-US" }).replaced).toEqual([]);
    expect(run({ language: "fr-FR" }).replaced).toEqual([]);
  });

  it("a stored preference beats the browser language in both directions", () => {
    expect(run({ language: "pt-BR", storage: { lang: "en" } }).replaced).toEqual([]);
    expect(run({ language: "en-US", storage: { lang: "es" } }).replaced).toEqual(["/es"]);
    expect(run({ language: "pt-BR", storage: { lang: "es" } }).replaced).toEqual(["/es"]);
  });

  it("an invalid stored value falls back to the browser language", () => {
    expect(run({ language: "pt-BR", storage: { lang: "xx" } }).replaced).toEqual(["/pt"]);
  });

  it.each(["/pt", "/es", "/projects/eduassets", "/pt/projects/eduassets", "/anything"])(
    "never redirects %s",
    (pathname) => {
      expect(run({ pathname, language: "pt-BR" }).replaced).toEqual([]);
    },
  );
});
