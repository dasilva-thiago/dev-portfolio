// Imported by react-router.config.ts, which loads before the `~/` alias exists: keep these imports relative.
import { HOME_UPDATED_AT, PROJECT_SLUGS, PROJECT_UPDATED_AT } from "../../entities/project/model/slugs";
import { LOCALES } from "../../shared/i18n/locales";
import { localizePath } from "../../shared/i18n/path";
import { alternatesFor, pageUrl } from "./urls";

interface SitemapPage {
  neutralPath: string;
  lastmod: string;
  changefreq: "monthly" | "yearly";
  priority: string;
}

export function sitemapPages(): SitemapPage[] {
  return [
    { neutralPath: "/", lastmod: HOME_UPDATED_AT, changefreq: "monthly", priority: "1.0" },
    ...PROJECT_SLUGS.map((slug) => ({
      neutralPath: `/projects/${slug}`,
      lastmod: PROJECT_UPDATED_AT[slug],
      changefreq: "monthly" as const,
      priority: "0.8",
    })),
  ];
}

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export function buildSitemap(): string {
  const entries = sitemapPages().flatMap((page) => {
    const alternates = alternatesFor(page.neutralPath)
      .map(
        ({ hreflang, href }) =>
          `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`,
      )
      .join("\n");
    return LOCALES.map((locale) =>
      [
        "  <url>",
        `    <loc>${escapeXml(pageUrl(localizePath(page.neutralPath, locale)))}</loc>`,
        `    <lastmod>${page.lastmod}</lastmod>`,
        `    <changefreq>${page.changefreq}</changefreq>`,
        `    <priority>${page.priority}</priority>`,
        alternates,
        "  </url>",
      ].join("\n"),
    );
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}
