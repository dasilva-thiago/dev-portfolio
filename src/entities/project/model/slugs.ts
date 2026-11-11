export const PROJECT_SLUGS = [
  "eduassets",
  "buenos-aires-explorer",
  "dev-portfolio",
  "aviation-safety",
  "parkschool-alpr",
] as const;

export type ProjectSlug = (typeof PROJECT_SLUGS)[number];

export function isProjectSlug(value: string | undefined): value is ProjectSlug {
  return PROJECT_SLUGS.some((slug) => slug === value);
}

export function projectPath(slug: ProjectSlug): string {
  return `/projects/${slug}`;
}

// Content dates (YYYY-MM-DD) used for sitemap `lastmod`; update when a project's page content changes.
export const PROJECT_UPDATED_AT: Record<ProjectSlug, string> = {
  eduassets: "2026-11-09",
  "buenos-aires-explorer": "2026-11-09",
  "dev-portfolio": "2026-11-03",
  "aviation-safety": "2026-11-09",
  "parkschool-alpr": "2026-11-11",
};

export const HOME_UPDATED_AT = Object.values(PROJECT_UPDATED_AT).sort().at(-1) ?? "2026-11-03";

// Stable, unhashed 1200x630 JPEG share images in static/og (regenerate with `npm run og:images`).
export const PROJECT_OG_IMAGE: Record<ProjectSlug, { path: string; width: number; height: number }> = {
  eduassets: { path: "/og/eduassets.jpg", width: 1200, height: 630 },
  "buenos-aires-explorer": { path: "/og/buenos-aires-explorer.jpg", width: 1200, height: 630 },
  "dev-portfolio": { path: "/og/dev-portfolio.jpg", width: 1200, height: 630 },
  "aviation-safety": { path: "/og/aviation-safety.jpg", width: 1200, height: 630 },
  "parkschool-alpr": { path: "/og/parkschool-alpr.jpg", width: 1200, height: 630 },
};
