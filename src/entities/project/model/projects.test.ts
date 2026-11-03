import { describe, expect, it } from "vitest";
import en from "~/shared/i18n/resources/en.json";
import es from "~/shared/i18n/resources/es.json";
import pt from "~/shared/i18n/resources/pt.json";
import { PROJECTS } from "./projects";
import { PROJECT_SLUGS, isProjectSlug, projectPath } from "./slugs";

describe("project data", () => {
  it("has one entry per slug, in display order", () => {
    expect(PROJECTS.map((p) => p.slug)).toEqual([...PROJECT_SLUGS]);
    expect(PROJECTS.map((p) => p.order)).toEqual([1, 2, 3, 4, 5]);
  });

  it("has exactly one featured and one secondary project", () => {
    expect(PROJECTS.filter((p) => p.variant === "featured")).toHaveLength(1);
    expect(PROJECTS.filter((p) => p.variant === "secondary")).toHaveLength(1);
  });

  it.each([
    ["en", en],
    ["pt", pt],
    ["es", es],
  ] as const)("%s has card copy and an article for every slug", (_name, locale) => {
    for (const slug of PROJECT_SLUGS) {
      const entry = locale.projects[slug];
      expect(entry.title).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(entry.alt).toBeTruthy();
      expect(entry.article.intro.length).toBeGreaterThan(0);
      expect(entry.article.sections.length).toBeGreaterThan(0);
    }
  });

  it("images declare real dimensions", () => {
    for (const project of PROJECTS) {
      for (const image of [project.cardImage, project.heroImage]) {
        expect(image.src).toBeTruthy();
        expect(image.width).toBeGreaterThan(0);
        expect(image.height).toBeGreaterThan(0);
      }
    }
  });

  it("builds clean project paths and validates slugs", () => {
    expect(projectPath("eduassets")).toBe("/projects/eduassets");
    expect(isProjectSlug("eduassets")).toBe(true);
    expect(isProjectSlug("nope")).toBe(false);
    expect(isProjectSlug(undefined)).toBe(false);
  });
});
