import { describe, expect, it } from "vitest";
import { localeFromPath, localizePath, stripLocale } from "./path";

describe("localeFromPath", () => {
  it.each([
    ["/", "en"],
    ["/projects/eduassets", "en"],
    ["/pt", "pt"],
    ["/pt/projects/eduassets", "pt"],
    ["/es", "es"],
    ["/es/projects/x", "es"],
    ["/en", "en"],
    ["/ptx", "en"],
    ["/projects/pt", "en"],
  ])("%s -> %s", (path, locale) => {
    expect(localeFromPath(path)).toBe(locale);
  });
});

describe("stripLocale", () => {
  it.each([
    ["/", "/"],
    ["/pt", "/"],
    ["/pt/projects/x", "/projects/x"],
    ["/es/projects/x", "/projects/x"],
    ["/projects/x", "/projects/x"],
  ])("%s -> %s", (input, output) => {
    expect(stripLocale(input)).toBe(output);
  });
});

describe("localizePath", () => {
  it.each([
    ["/", "en", "/"],
    ["/", "pt", "/pt"],
    ["/#about", "pt", "/pt#about"],
    ["/#about", "en", "/#about"],
    ["/projects/eduassets", "es", "/es/projects/eduassets"],
    ["/pt/projects/eduassets", "en", "/projects/eduassets"],
    ["/pt/projects/eduassets", "es", "/es/projects/eduassets"],
    ["/pt#projects", "es", "/es#projects"],
    ["/es", "en", "/"],
  ] as const)("%s -> %s = %s", (input, locale, output) => {
    expect(localizePath(input, locale)).toBe(output);
  });

  it("round-trips every locale", () => {
    for (const path of ["/", "/projects/eduassets", "/#contact"]) {
      for (const from of ["en", "pt", "es"] as const) {
        for (const to of ["en", "pt", "es"] as const) {
          expect(localizePath(localizePath(path, from), to)).toBe(localizePath(path, to));
        }
      }
    }
  });
});
