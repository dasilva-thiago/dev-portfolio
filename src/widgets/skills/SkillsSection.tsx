import { useRef } from "react";
import { CONSOLIDATED_SKILLS, EVOLVING_SKILLS } from "~/entities/skill/model/skills";
import { SkillIconCard } from "~/entities/skill/ui/SkillIconCard";
import { SkillLearningChip } from "~/entities/skill/ui/SkillLearningChip";
import { useT } from "~/shared/i18n/useT";
import { useMotion } from "~/shared/lib/motion";
import { SectionHeading } from "~/shared/ui/SectionHeading";
import { SECTION, SECTION_BLOCK } from "~/shared/ui/section";

const GROUP_LABEL = "font-[family-name:var(--font-mono)] text-[12px] font-bold uppercase tracking-[0.08em]";

export function SkillsSection() {
  const { t } = useT();
  const section = useRef<HTMLElement>(null);

  useMotion(section, ({ gsap }) => {
    const root = section.current;
    if (!root) return;
    gsap.from(["h2", ".skills-description"], {
      scrollTrigger: { trigger: root, start: "top 85%", once: true },
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.12,
      ease: "power2.out",
      clearProps: "all",
    });

    gsap.from(".skill-icon-card", {
      scrollTrigger: { trigger: ".skills-icon-grid", start: "top 82%", once: true },
      opacity: 0,
      y: 24,
      scale: 0.92,
      duration: 0.5,
      stagger: { amount: 0.4, from: "start" },
      ease: "power2.out",
      clearProps: "all",
    });

    gsap.from(".skills-evolving", {
      scrollTrigger: { trigger: ".skills-evolving", start: "top 90%", once: true },
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
      clearProps: "all",
    });
  });

  return (
    <section id="skills" className={`${SECTION} ${SECTION_BLOCK} cursor-default`} ref={section}>
      <SectionHeading>{t("sections.skills.title")}</SectionHeading>
      <div className="skills-description mx-auto mb-10 max-w-[600px] text-center font-medium leading-[1.65] text-muted">
        {t("sections.skills.description")}
      </div>

      <p className={`${GROUP_LABEL} mb-4 text-muted`}>{t("sections.skills.consolidated")}</p>
      <div className="skills-icon-grid mb-9 grid grid-cols-4 gap-2.5 max-bp600:gap-2">
        {CONSOLIDATED_SKILLS.map((skill) => (
          <SkillIconCard key={skill.id} skill={skill} />
        ))}
      </div>

      <div className="skills-evolving flex items-center justify-between gap-8 rounded-2xl border border-dashed border-link/40 bg-[color-mix(in_srgb,var(--link-color)_5%,var(--white-color))] px-7 py-6 max-bp600:flex-col max-bp600:items-start max-bp600:gap-5 max-bp600:px-5">
        <div className="min-w-0">
          <p className={`${GROUP_LABEL} flex items-center gap-2.5 text-link`}>
            <span className="relative flex size-2.5 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-link opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2.5 rounded-full bg-link" />
            </span>
            {t("sections.skills.evolving")}
          </p>
          <p className="mt-2 text-[14.5px] font-medium leading-[1.55] text-muted">
            {t("sections.skills.evolvingDescription")}
          </p>
        </div>
        <ul className="flex flex-wrap justify-end gap-2.5 max-bp600:justify-start">
          {EVOLVING_SKILLS.map((skill) => (
            <SkillLearningChip key={skill.id} skill={skill} />
          ))}
        </ul>
      </div>
    </section>
  );
}
