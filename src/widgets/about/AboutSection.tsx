import { useRef, useState } from "react";
import { EXPERIENCE, type ExperienceId } from "~/entities/experience/model/experience";
import { ExperienceCard } from "~/entities/experience/ui/ExperienceCard";
import { ExperienceDialog } from "~/features/experience-details/ExperienceDialog";
import profile from "~/shared/assets/img/profile-about.webp";
import { SITE } from "~/shared/config/site";
import { useT } from "~/shared/i18n/useT";
import { Rich } from "~/shared/lib/Rich";
import { useSectionFade } from "~/shared/lib/useSectionFade";
import { SectionHeading } from "~/shared/ui/SectionHeading";
import { SECTION, SECTION_BLOCK } from "~/shared/ui/section";

const COPY =
  "mt-5 max-w-[475px] text-left text-[18px] font-medium leading-[1.75] tracking-[0.01em] text-muted max-bp480:text-center";

const GROUP_LABEL = "text-[12px] font-semibold uppercase tracking-[0.07em] text-muted";

export function AboutSection() {
  const { t } = useT();
  const section = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<ExperienceId | null>(null);
  useSectionFade(section);

  const renderGroup = (group: "education" | "experience") =>
    EXPERIENCE.filter((entry) => entry.group === group).map((entry) => (
      <ExperienceCard
        key={entry.id}
        entry={entry}
        expanded={openId === entry.id}
        onOpen={() => setOpenId(entry.id)}
      />
    ));

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

        <div className="mx-auto flex w-full max-w-[75%] flex-col gap-2">
          <p className={`${GROUP_LABEL} pb-0.5 pt-0`}>{t("sections.about.education")}</p>
          {renderGroup("education")}

          <p className={`${GROUP_LABEL} pb-0.5 pt-2`}>{t("sections.about.experience")}</p>
          {renderGroup("experience")}
        </div>
      </div>

      <ExperienceDialog id={openId} onClose={() => setOpenId(null)} />
    </section>
  );
}
