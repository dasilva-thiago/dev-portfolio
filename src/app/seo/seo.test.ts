import { describe, expect, it } from "vitest";
import { PROJECT_SLUGS } from "~/entities/project/model/slugs";
import en from "~/shared/i18n/resources/en.json";
import es from "~/shared/i18n/resources/es.json";
import pt from "~/shared/i18n/resources/pt.json";
import type { Resources } from "~/shared/i18n/types";
import { homeMeta, projectMeta } from "./meta";
import { buildSitemap, sitemapPages } from "./sitemap";
import { alternatesFor, pageUrl } from "./urls";

const resources = { en, pt, es } as const satisfies Record<string, Resources>;

type Descriptor = Record<string, unknown>;
const find = (meta: unknown[], key: string, value: string) =>
  (meta as Descriptor[]).find((entry) => entry[key] === value);

describe("alternates", () => {
  it("lists every locale plus x-default, all absolute", () => {
    const alternates = alternatesFor("/projects/eduassets");
    expect(alternates.map((a) => a.hreflang)).toEqual(["en", "pt-BR", "es", "x-default"]);
    expect(alternates.map((a) => a.href)).toEqual([
      "https://www.dasilva-thiago.dev/projects/eduassets",
      "https://www.dasilva-thiago.dev/pt/projects/eduassets",
      "https://www.dasilva-thiago.dev/es/projects/eduassets",
      "https://www.dasilva-thiago.dev/projects/eduassets",
    ]);
  });

  it("keeps the root with a trailing slash and everything else without", () => {
    expect(pageUrl("/")).toBe("https://www.dasilva-thiago.dev/");
    expect(pageUrl("/pt")).toBe("https://www.dasilva-thiago.dev/pt");
  });
});

describe("sitemap", () => {
  const xml = buildSitemap();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  it("has one entry per locale per page (18) and no duplicates", () => {
    // Home, experience and one page per project, in each of the three languages.
    expect(locs).toHaveLength((PROJECT_SLUGS.length + 2) * 3);
    expect(new Set(locs).size).toBe(locs.length);
  });

  it("matches the canonical URLs emitted by the page metadata", () => {
    for (const locale of ["en", "pt", "es"] as const) {
      const canonical = find(homeMeta(locale, resources[locale]), "rel", "canonical")?.href;
      expect(locs).toContain(canonical);
      for (const slug of PROJECT_SLUGS) {
        const project = find(projectMeta(locale, slug, resources[locale]), "rel", "canonical")?.href;
        expect(locs).toContain(project);
      }
    }
  });

  it("is reciprocal: every url lists the same alternate set (including itself)", () => {
    const blocks = xml.split("<url>").slice(1);
    for (const block of blocks) {
      const loc = /<loc>([^<]+)<\/loc>/.exec(block)?.[1];
      const hrefs = [...block.matchAll(/hreflang="[^"]+" href="([^"]+)"/g)].map((m) => m[1]);
      expect(hrefs).toContain(loc);
      expect(hrefs).toHaveLength(4);
    }
  });

  it("carries a valid lastmod and declares the xhtml namespace", () => {
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    for (const page of sitemapPages()) expect(page.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("page metadata", () => {
  it.each(["en", "pt", "es"] as const)("%s home has title, description, canonical, social tags and JSON-LD", (locale) => {
    const meta = homeMeta(locale, resources[locale]);
    expect(find(meta, "title", resources[locale].meta.homeTitle)).toBeTruthy();
    expect(find(meta, "name", "description")?.content).toBe(resources[locale].meta.homeDescription);
    expect(find(meta, "property", "og:image")?.content).toBe("https://www.dasilva-thiago.dev/og/portfolio.jpg");
    expect(find(meta, "name", "twitter:card")?.content).toBe("summary_large_image");
    const ld = (meta as Descriptor[]).find((entry) => "script:ld+json" in entry)?.["script:ld+json"] as {
      "@graph": Array<{ "@type": string }>;
    };
    expect(ld["@graph"].map((node) => node["@type"])).toEqual(["ProfilePage", "WebSite"]);
  });

  it("gives each project its own title, image and structured data without repeating the Person", () => {
    const titles = new Set<string>();
    for (const slug of PROJECT_SLUGS) {
      const meta = projectMeta("en", slug, en);
      const title = (meta as Descriptor[]).find((entry) => "title" in entry)?.title as string;
      titles.add(title);
      expect(find(meta, "property", "og:type")?.content).toBe("article");
      expect(String(find(meta, "property", "og:image")?.content)).toContain(`/og/${slug}`);
      const ld = JSON.stringify((meta as Descriptor[]).find((entry) => "script:ld+json" in entry));
      expect(ld).toContain("SoftwareSourceCode");
      expect(ld).toContain("BreadcrumbList");
      expect(ld).not.toContain('"@type":"Person"');
      expect(ld).not.toContain("ProfilePage");
    }
    expect(titles.size).toBe(PROJECT_SLUGS.length);
  });

  it("marks the locale in Open Graph and lists the other two as alternates", () => {
    const meta = projectMeta("pt", "eduassets", pt) as Descriptor[];
    expect(find(meta, "property", "og:locale")?.content).toBe("pt_BR");
    expect(meta.filter((entry) => entry.property === "og:locale:alternate").map((e) => e.content)).toEqual([
      "en_US",
      "es_ES",
    ]);
  });
});
