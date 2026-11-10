import { HOME_UPDATED_AT, PROJECT_UPDATED_AT, type ProjectSlug } from "~/entities/project/model/slugs";
import { getProjectLinks } from "~/entities/project/model/links";
import { SITE } from "~/shared/config/site";
import { LOCALES, type Locale } from "~/shared/i18n/locales";
import { localizePath } from "~/shared/i18n/path";
import type { Resources } from "~/shared/i18n/types";
import { HREFLANG, assetUrl, pageUrl } from "./urls";

const PERSON_ID = `${SITE.origin}/#person`;
const WEBSITE_ID = `${SITE.origin}/#website`;
const IN_LANGUAGE = LOCALES.map((locale) => HREFLANG[locale]);

type JsonLd = Record<string, unknown>;

export function homeJsonLd(locale: Locale, resources: Resources): JsonLd {
  const url = pageUrl(localizePath("/", locale));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${url}#profilepage`,
        url,
        name: resources.meta.homeTitle,
        description: resources.meta.homeDescription,
        inLanguage: HREFLANG[locale],
        dateModified: HOME_UPDATED_AT,
        mainEntity: {
          "@type": "Person",
          "@id": PERSON_ID,
          name: SITE.author,
          url: `${SITE.origin}/`,
          image: {
            "@type": "ImageObject",
            url: assetUrl("/images/profile.jpg"),
            width: 400,
            height: 400,
          },
          jobTitle: resources.meta.jobTitle,
          description: resources.meta.personDescription,
          email: SITE.email,
          sameAs: [SITE.linkedin, SITE.github],
          address: {
            "@type": "PostalAddress",
            addressLocality: "Pindamonhangaba",
            addressRegion: "SP",
            addressCountry: "BR",
          },
          alumniOf: [
            { "@type": "EducationalOrganization", name: "UNIVESP", url: "https://univesp.br" },
            { "@type": "EducationalOrganization", name: "SENAC São Paulo" },
          ],
          knowsAbout: [
            "JavaScript", "TypeScript", "React", "C#", "Python", "Node.js", "HTML", "CSS",
            "SQLite", "REST APIs", "Software Development", "Data Analysis",
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE.origin}/`,
        name: resources.meta.homeTitle,
        description: resources.meta.homeDescription,
        inLanguage: IN_LANGUAGE,
        author: { "@id": PERSON_ID },
      },
    ],
  };
}

// Project pages describe the project only; the Person and WebSite are referenced by @id, not repeated.
export function projectJsonLd(locale: Locale, slug: ProjectSlug, resources: Resources): JsonLd {
  const copy = resources.projects[slug];
  const url = pageUrl(localizePath(`/projects/${slug}`, locale));
  const links = getProjectLinks(slug);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        "@id": `${url}#project`,
        name: copy.title,
        description: copy.description,
        url,
        ...(links.github ? { codeRepository: links.github } : {}),
        inLanguage: HREFLANG[locale],
        dateModified: PROJECT_UPDATED_AT[slug],
        programmingLanguage: links.languages,
        author: { "@id": PERSON_ID },
        isPartOf: { "@id": WEBSITE_ID },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: resources.nav.aria.home, item: pageUrl(localizePath("/", locale)) },
          {
            "@type": "ListItem",
            position: 2,
            name: resources.sections.projects.title,
            item: pageUrl(localizePath("/", locale)) + "#projects",
          },
          { "@type": "ListItem", position: 3, name: copy.title, item: url },
        ],
      },
    ],
  };
}
