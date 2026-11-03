import type { MetaDescriptor } from "react-router";
import { PROJECT_OG_IMAGE, type ProjectSlug } from "~/entities/project/model/slugs";
import { SITE } from "~/shared/config/site";
import { LOCALES, type Locale } from "~/shared/i18n/locales";
import { localizePath } from "~/shared/i18n/path";
import type { Resources } from "~/shared/i18n/types";
import { homeJsonLd, projectJsonLd } from "./jsonld";
import { OG_LOCALE, alternatesFor, assetUrl, pageUrl } from "./urls";

interface Page {
  neutralPath: string;
  locale: Locale;
  title: string;
  description: string;
  image: { path: string; width: number; height: number };
  type: "website" | "article";
}

function pageMeta({ neutralPath, locale, title, description, image, type }: Page): MetaDescriptor[] {
  const url = pageUrl(localizePath(neutralPath, locale));
  const imageUrl = assetUrl(image.path);
  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow" },
    { tagName: "link", rel: "canonical", href: url },
    ...alternatesFor(neutralPath).map(({ hreflang, href }) => ({
      tagName: "link" as const,
      rel: "alternate",
      hrefLang: hreflang,
      href,
    })),
    { property: "og:site_name", content: SITE.author },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: String(image.width) },
    { property: "og:image:height", content: String(image.height) },
    { property: "og:locale", content: OG_LOCALE[locale] },
    ...LOCALES.filter((other) => other !== locale).map((other) => ({
      property: "og:locale:alternate",
      content: OG_LOCALE[other],
    })),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];
}

export function homeMeta(locale: Locale, resources: Resources): MetaDescriptor[] {
  return [
    ...pageMeta({
      neutralPath: "/",
      locale,
      title: resources.meta.homeTitle,
      description: resources.meta.homeDescription,
      image: { path: "/og/portfolio.jpg", width: 1200, height: 630 },
      type: "website",
    }),
    { "script:ld+json": homeJsonLd(locale, resources) },
  ];
}

export function projectMeta(locale: Locale, slug: ProjectSlug, resources: Resources): MetaDescriptor[] {
  const copy = resources.projects[slug];
  return [
    ...pageMeta({
      neutralPath: `/projects/${slug}`,
      locale,
      title: `${copy.title} — ${SITE.author}`,
      description: copy.description,
      image: PROJECT_OG_IMAGE[slug],
      type: "article",
    }),
    { "script:ld+json": projectJsonLd(locale, slug, resources) },
  ];
}

export function notFoundMeta(resources: Resources): MetaDescriptor[] {
  return [{ title: `${resources.notFound.title} — ${SITE.author}` }, { name: "robots", content: "noindex" }];
}
