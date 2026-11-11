import { faArrowRight, faBriefcase } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";
import { EXPERIENCE, FEATURED_EXPERIENCE } from "~/entities/experience/model/experience";
import { EXPERIENCE_PATH } from "~/entities/experience/model/paths";
import { ExperienceGallery } from "~/entities/experience/ui/ExperienceGallery";
import { ExperienceTags } from "~/entities/experience/ui/ExperienceTags";
import { projectPath } from "~/entities/project/model/slugs";
import { useLocalizedPath, useT } from "~/shared/i18n/useT";
import { Icon } from "~/shared/ui/Icon";

const BUTTON =
  "inline-flex items-center gap-2 rounded-lg border-2 px-3.5 py-[7px] text-[0.95rem] font-semibold no-underline " +
  "transition-[transform,box-shadow,filter] duration-150 hover:-translate-y-0.5";

// The current role, shown in full in the About section: what the job is, the eduAssets photos and the links to
// the project and to the rest of the career.
export function FeaturedExperience() {
  const { t, tList } = useT();
  const localize = useLocalizedPath();
  const id = FEATURED_EXPERIENCE;
  const entry = EXPERIENCE.find((candidate) => candidate.id === id);
  const key = `experience.${id}` as const;

  return (
    <article
      id="current-experience"
      aria-labelledby="current-experience-title"
      className="mt-16 grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-start gap-10 rounded-2xl border border-line bg-surface p-8 shadow-[0_8px_32px_var(--shadow-dark-sm)] max-bp1024:gap-8 max-bp850:grid-cols-1 max-bp480:p-5"
    >
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          {entry ? (
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-lg bg-accent/10 text-[22px] text-accent">
              <Icon icon={entry.icon} />
            </div>
          ) : null}
          <div className="min-w-0">
            <span className="mb-1 block font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.05em] text-link">
              {t(`${key}.date`)}
            </span>
            <h3 id="current-experience-title" className="text-[24px] font-semibold text-text max-bp480:text-[21px]">
              {t(`${key}.title`)}
            </h3>
            <p className="mt-1 text-[15px] font-semibold text-muted">{t(`${key}.company`)}</p>
            <p className="text-[13px] text-muted">{t(`${key}.location`)}</p>
          </div>
        </div>

        <p className="mt-5 text-[17px] font-medium leading-[1.75] text-muted">{t(`${key}.description`)}</p>
        <ExperienceTags tags={tList(`${key}.tags`)} className="mt-5" />

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to={localize(projectPath("eduassets"))}
            className={`${BUTTON} border-fill bg-fill text-on-fill hover:shadow-[0_8px_24px_var(--shadow-link-md)] hover:brightness-95`}
          >
            <Icon icon={faBriefcase} />
            <span>{t("about.featured.project")}</span>
          </Link>
          <Link
            to={localize(EXPERIENCE_PATH)}
            className={`${BUTTON} border-link bg-transparent text-link hover:text-text hover:shadow-[0_8px_24px_var(--shadow-link-sm)]`}
          >
            <span>{t("about.featured.all")}</span>
            <Icon icon={faArrowRight} />
          </Link>
        </div>
      </div>

      <ExperienceGallery />
    </article>
  );
}
