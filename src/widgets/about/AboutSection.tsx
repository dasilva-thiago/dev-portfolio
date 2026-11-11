import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";
import { Link } from "react-router";
import { EXPERIENCE } from "~/entities/experience/model/experience";
import { EXPERIENCE_PATH } from "~/entities/experience/model/paths";
import { ExperienceCard } from "~/entities/experience/ui/ExperienceCard";
import profile from "~/shared/assets/img/profile-about.webp";
import { SITE } from "~/shared/config/site";
import { useLocalizedPath, useT } from "~/shared/i18n/useT";
import { Rich } from "~/shared/lib/Rich";
import { useSectionFade } from "~/shared/lib/useSectionFade";
import { Icon } from "~/shared/ui/Icon";
import { SectionHeading } from "~/shared/ui/SectionHeading";
import { SECTION, SECTION_BLOCK } from "~/shared/ui/section";
import { FeaturedExperience } from "./FeaturedExperience";

const COPY =
  "mt-5 max-w-[475px] text-left text-[18px] font-medium leading-[1.75] tracking-[0.01em] text-muted max-bp480:text-center";

const GROUP_LABEL = "text-[12px] font-semibold uppercase tracking-[0.07em] text-muted";

export function AboutSection() {
  const { t } = useT();
  const localize = useLocalizedPath();
  const section = useRef<HTMLElement>(null);
  useSectionFade(section);

  return (
    <section id="about" className={`${SECTION} ${SECTION_BLOCK} cursor-default`} ref={section}>
      <SectionHeading className="mb-[76px]">{t("sections.about.title")}</SectionHeading>

      <div className="grid grid-cols-2 items-start gap-12 max-bp850:gap-8 max-bp740:grid-cols-1">
        <div className="flex flex-col gap-5 max-bp740:items-center max-bp740:text-center">
          <div className="flex items-center gap-4 max-bp740:flex-col max-bp740:text-center">
            <img
              src={profile}
              alt={SITE.author}
              width={400}
              height={400}
              loading="lazy"
              className={
                "mt-[15px] size-[175px] shrink-0 rounded-full border-2 border-link/50 object-cover " +
                "shadow-[0_0_0_3px_var(--background-color),0_0_0_5px_color-mix(in_srgb,var(--link-color)_40%,transparent),0_20px_60px_var(--shadow-link-md)] " +
                "transition-[transform,box-shadow] duration-[400ms] hover:-translate-y-1 " +
                "hover:shadow-[0_0_0_3px_var(--background-color),0_0_0_5px_color-mix(in_srgb,var(--link-color)_40%,transparent),0_20px_60px_var(--shadow-link-lg)]"
              }
            />
            <div>
              <p className="mb-[3px] text-[26px] font-semibold text-text">{SITE.author}</p>
              <p className="text-[13px] font-medium text-link">{t("about.role")}</p>
            </div>
          </div>

          <p className={COPY}>
            <Rich text={t("about.quote")} emClassName="font-semibold text-link" />
          </p>
          <p className={COPY}>{t("about.bio")}</p>
        </div>

        <div className="mx-auto flex w-full max-w-[75%] flex-col gap-2 max-bp1024:max-w-full">
          <p className={`${GROUP_LABEL} pb-0.5 pt-0`}>{t("sections.about.education")}</p>
          {EXPERIENCE.filter((entry) => entry.group === "education").map((entry) => (
            <ExperienceCard key={entry.id} entry={entry} />
          ))}

          <p className={`${GROUP_LABEL} pb-0.5 pt-2`}>{t("sections.about.experience")}</p>
          {EXPERIENCE.filter((entry) => entry.group === "experience").map((entry) => (
            <ExperienceCard key={entry.id} entry={entry} to={localize(`${EXPERIENCE_PATH}#${entry.id}`)} />
          ))}

          <Link
            to={localize(EXPERIENCE_PATH)}
            className="mt-2 inline-flex items-center gap-2 self-start text-[14px] font-semibold text-link no-underline transition-[gap] duration-150 hover:gap-3 max-bp740:self-center"
          >
            <span>{t("about.featured.all")}</span>
            <Icon icon={faArrowRight} />
          </Link>
        </div>
      </div>

      <FeaturedExperience />
    </section>
  );
}
