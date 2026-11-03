import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";
import { getProject } from "~/entities/project/model/projects";
import type { ProjectSlug } from "~/entities/project/model/slugs";
import { useLocalizedPath, useResources, useT } from "~/shared/i18n/useT";
import { Icon } from "~/shared/ui/Icon";
import { AccessButton, GithubButton } from "~/shared/ui/ProjectLinks";
import { ProjectTag } from "~/shared/ui/ProjectTag";
import { SkipLink } from "~/shared/ui/SkipLink";
import { SiteNav } from "~/widgets/site-nav/SiteNav";

const BACK_LINK =
  "fixed left-[clamp(1.25rem,5vw,2.5rem)] top-4 z-10 inline-flex items-center gap-2 whitespace-nowrap rounded-[10px] border border-line " +
  "bg-[color-mix(in_srgb,var(--white-color)_92%,transparent)] px-3.5 py-[7px] font-[family-name:var(--font-mono)] text-[0.875rem] font-medium text-text no-underline " +
  "backdrop-blur-[10px] shadow-[0_2px_8px_var(--shadow-dark-sm)] transition-[color,border-color,background-color] duration-150 " +
  "hover:border-link/50 hover:bg-[color-mix(in_srgb,var(--link-color)_6%,var(--white-color))] hover:text-link " +
  "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link hc:bg-page hc:shadow-none " +
  "max-bp640:top-3 max-bp640:px-3 max-bp640:py-1.5";

const INTRO_P = "mb-5 text-[1.125rem] font-medium leading-[1.75] text-muted last:mb-0";
const SECTION_P = "mb-4 text-[1rem] font-medium leading-[1.75] text-muted last:mb-0";

export function ProjectPage({ slug }: { slug: ProjectSlug }) {
  const { t } = useT();
  const localize = useLocalizedPath();
  const project = getProject(slug);
  const key = `projects.${slug}` as const;
  const article = useResources().projects[slug].article;

  return (
    <>
      <SkipLink />
      <SiteNav floating />

      <main id="main-content" className="min-h-screen bg-page">
        <Link to={localize("/#projects")} className={BACK_LINK}>
          <Icon icon={faArrowLeft} />
          <span>{t("projectArticle.back")}</span>
        </Link>

        <div className="mx-auto max-w-[1400px]">
          <article>
            <div
              className={
                "relative h-[clamp(220px,48vh,480px)] w-full overflow-hidden bg-surface " +
                "after:pointer-events-none after:absolute after:inset-0 after:content-[''] hc:after:hidden " +
                "after:bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--background-color)_15%,transparent)_0%,transparent_25%,transparent_45%,color-mix(in_srgb,var(--background-color)_65%,transparent)_75%,var(--background-color)_100%)]"
              }
            >
              <img
                src={project.heroImage.src}
                alt={t(`${key}.alt`)}
                width={project.heroImage.width}
                height={project.heroImage.height}
                className="block size-full object-cover object-center"
              />
            </div>

            <div className="mx-auto max-w-[680px] px-[clamp(1.25rem,5vw,2.5rem)] pb-24 text-text max-bp640:pb-16">
              <header className="mb-6 pt-6">
                <ProjectTag className="mb-3">{t(`${key}.tag`)}</ProjectTag>
                <h1 className="block font-[family-name:var(--font-hero)] text-[clamp(2.2rem,5vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-text">
                  {t(`${key}.title`)}
                </h1>
              </header>

              <div className="mb-10 flex flex-wrap gap-3 border-b border-line pb-8">
                {project.links.live ? <AccessButton href={project.links.live} /> : null}
                <GithubButton href={project.links.github} />
              </div>

              <div className="mb-12">
                {article.intro.map((paragraph) => (
                  <p key={paragraph} className={INTRO_P}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {article.sections.map((section) => (
                <section key={section.heading} className="mb-11">
                  <h2 className="text-[1.25rem] font-semibold leading-[1.15] tracking-[-0.02em] text-text after:mb-4 after:mt-2 after:block after:h-[3px] after:w-8 after:rounded-[2px] after:bg-fill after:content-['']">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className={SECTION_P}>
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
