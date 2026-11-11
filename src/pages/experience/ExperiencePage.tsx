import { faBriefcase, faFileLines } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";
import {
  EXPERIENCE,
  FEATURED_EXPERIENCE,
  SAFETY_LABELS_IMAGE,
  isWorkExperience,
  type ExperienceEntry,
  type WorkExperienceId,
} from "~/entities/experience/model/experience";
import { ExperienceCard } from "~/entities/experience/ui/ExperienceCard";
import { ExperienceGallery } from "~/entities/experience/ui/ExperienceGallery";
import { ExperienceTags } from "~/entities/experience/ui/ExperienceTags";
import { projectPath } from "~/entities/project/model/slugs";
import { CvButton } from "~/features/open-cv/CvButton";
import { useLocalizedPath, useT } from "~/shared/i18n/useT";
import { BackLink } from "~/shared/ui/BackLink";
import { Icon } from "~/shared/ui/Icon";
import { ProjectTag } from "~/shared/ui/ProjectTag";
import { SkipLink } from "~/shared/ui/SkipLink";
import { SiteNav } from "~/widgets/site-nav/SiteNav";

const BUTTON =
  "inline-flex items-center gap-2 rounded-lg border-2 px-3.5 py-[7px] text-[0.95rem] font-semibold no-underline " +
  "transition-[transform,box-shadow,filter] duration-150 hover:-translate-y-0.5";
const FILL_BUTTON = `${BUTTON} border-fill bg-fill text-on-fill hover:shadow-[0_8px_24px_var(--shadow-link-md)] hover:brightness-95`;
const OUTLINE_BUTTON = `${BUTTON} border-link bg-transparent text-link hover:text-text hover:shadow-[0_8px_24px_var(--shadow-link-sm)]`;

const SUBHEADING =
  "mb-3 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.07em] text-link";

function ExperienceSection({ entry, last }: { entry: ExperienceEntry & { id: WorkExperienceId }; last: boolean }) {
  const { t, tList } = useT();
  const localize = useLocalizedPath();
  const key = `experience.${entry.id}` as const;
  const current = entry.id === FEATURED_EXPERIENCE;

  return (
    <article
      id={entry.id}
      aria-labelledby={`${entry.id}-title`}
      className="relative grid scroll-mt-28 grid-cols-[34px_minmax(0,1fr)] gap-x-5 max-bp480:gap-x-3.5"
    >
      {/* Timeline rail: the icon, then a line down to the next entry. */}
      <div className="flex flex-col items-center" aria-hidden="true">
        <div className="flex size-[34px] shrink-0 items-center justify-center rounded-lg bg-accent/10 text-[20px] text-accent">
          <Icon icon={entry.icon} />
        </div>
        {last ? null : <div className="mt-3 w-px flex-1 bg-line" />}
      </div>

      <div className={last ? "pb-4" : "pb-16"}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-[family-name:var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.05em] text-link">
            {t(`${key}.date`)}
          </span>
          {current ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-link/40 bg-link/8 px-2.5 py-0.5 text-[11.5px] font-semibold text-link">
              <span className="size-1.5 rounded-full bg-fill" aria-hidden="true" />
              {t("about.featured.badge")}
            </span>
          ) : null}
        </div>
        <h2 id={`${entry.id}-title`} className="mt-1.5 text-[clamp(1.35rem,3vw,1.65rem)] font-semibold text-text">
          {t(`${key}.title`)}
        </h2>
        <p className="mt-1 text-[16px] font-semibold text-muted">{t(`${key}.company`)}</p>
        <p className="text-[14px] text-muted">{t(`${key}.location`)}</p>

        <p className="mt-5 text-[17px] font-medium leading-[1.75] text-muted">{t(`${key}.description`)}</p>

        {current ? <ExperienceGallery className="mt-7" /> : null}

        <h3 className={`${SUBHEADING} mt-8`}>{t("experiencePage.highlights")}</h3>
        <ul className="list-none space-y-2.5 p-0">
          {tList(`${key}.highlights`).map((item) => (
            <li
              key={item}
              className="relative pl-5 text-[16px] leading-[1.7] text-text before:absolute before:left-0 before:top-[0.7em] before:size-1.5 before:rounded-full before:bg-fill before:content-['']"
            >
              {item}
            </li>
          ))}
        </ul>

        {entry.id === "tenaris" ? (
          <div className="mt-8 rounded-xl border border-line bg-surface p-5 max-bp480:p-4">
            <h3 className={SUBHEADING}>{t("initiative.industrialSafety.title")}</h3>
            <p className="text-[16px] leading-[1.7] text-muted">{t("initiative.industrialSafety.description")}</p>
            <img
              src={SAFETY_LABELS_IMAGE.src}
              alt={t("initiative.industrialSafety.imageAlt")}
              width={SAFETY_LABELS_IMAGE.width}
              height={SAFETY_LABELS_IMAGE.height}
              loading="lazy"
              decoding="async"
              className="mt-4 block w-full rounded-lg border border-line"
            />
            <ExperienceTags tags={tList("initiative.industrialSafety.tags")} className="mt-4" />
          </div>
        ) : null}

        <ExperienceTags tags={tList(`${key}.tags`)} className="mt-7" />

        {current ? (
          <div className="mt-7">
            <Link to={localize(projectPath("eduassets"))} className={FILL_BUTTON}>
              <Icon icon={faBriefcase} />
              <span>{t("experiencePage.project")}</span>
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ExperiencePage() {
  const { t } = useT();
  const localize = useLocalizedPath();
  const work = EXPERIENCE.filter(isWorkExperience);
  const education = EXPERIENCE.filter((entry) => entry.group === "education");

  return (
    <>
      <SkipLink />
      <SiteNav floating />

      <main id="main-content" className="min-h-screen bg-page">
        <BackLink to={localize("/#about")} label={t("experiencePage.back")} />

        <div className="mx-auto max-w-[860px] px-[clamp(1.25rem,5vw,2.5rem)] pb-24 pt-[clamp(110px,16vh,150px)] text-text max-bp640:pb-16">
          <header className="mb-14 border-b border-line pb-10">
            <ProjectTag className="mb-3">{t("experiencePage.tag")}</ProjectTag>
            <h1 className="font-[family-name:var(--font-hero)] text-[clamp(2.2rem,5vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-text">
              {t("experiencePage.title")}
            </h1>
            <p className="mt-5 max-w-[640px] text-[1.125rem] font-medium leading-[1.75] text-muted">
              {t("experiencePage.intro")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <CvButton id="experience-cv-button" className={OUTLINE_BUTTON}>
                <Icon icon={faFileLines} />
                <span>{t("experiencePage.resume")}</span>
              </CvButton>
            </div>
          </header>

          <div>
            {work.map((entry, index) => (
              <ExperienceSection key={entry.id} entry={entry} last={index === work.length - 1} />
            ))}
          </div>

          <section aria-labelledby="education-title" className="mt-16 border-t border-line pt-12">
            <h2 id="education-title" className={SUBHEADING}>
              {t("experiencePage.education")}
            </h2>
            <div className="grid grid-cols-2 gap-3 max-bp640:grid-cols-1">
              {education.map((entry) => (
                <ExperienceCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
