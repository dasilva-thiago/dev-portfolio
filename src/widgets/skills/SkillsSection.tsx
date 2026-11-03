import { useRef } from "react";
import { CONSOLIDATED_SKILLS, EVOLVING_SKILLS } from "~/entities/skill/model/skills";
import { SkillIconCard } from "~/entities/skill/ui/SkillIconCard";
import { SkillRunway } from "~/entities/skill/ui/SkillRunway";
import { useT } from "~/shared/i18n/useT";
import { useMotion } from "~/shared/lib/motion";
import { SectionHeading } from "~/shared/ui/SectionHeading";
import { SECTION, SECTION_BLOCK } from "~/shared/ui/section";

const GROUP_LABEL =
  "font-[family-name:var(--font-mono)] text-[12px] font-bold uppercase tracking-[0.08em] text-muted";

export function SkillsSection() {
  const { t } = useT();
  const section = useRef<HTMLElement>(null);

  useMotion(section, ({ gsap, ScrollTrigger }) => {
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

    const fills = gsap.utils.toArray<HTMLElement>(".skill-runway-fill");
    gsap.set(fills, { width: "0%" });
    ScrollTrigger.create({
      trigger: ".skills-runway-stack",
      start: "top 82%",
      once: true,
      onEnter: () => {
        fills.forEach((fill, index) => {
          gsap.to(fill, {
            width: `${fill.dataset.percent ?? 0}%`,
            duration: 1.2,
            delay: index * 0.18,
            ease: "power3.out",
          });
        });
      },
    });
  });

  return (
    <section id="skills" className={`${SECTION} ${SECTION_BLOCK} cursor-default`} ref={section}>
      <SectionHeading>{t("sections.skills.title")}</SectionHeading>
      <div className="skills-description mx-auto mb-10 max-w-[600px] text-center font-medium leading-[1.65] text-muted">
        {t("sections.skills.description")}
      </div>

      <p className={`${GROUP_LABEL} mb-4`}>{t("sections.skills.consolidated")}</p>
      <div className="skills-icon-grid mb-9 grid grid-cols-3 gap-2.5 min-bp1200:grid-cols-4 min-bp1400:grid-cols-5 max-bp850:grid-cols-4 max-bp600:grid-cols-3 max-bp600:gap-2">
        {CONSOLIDATED_SKILLS.map((skill) => (
          <SkillIconCard key={skill.id} skill={skill} />
        ))}
      </div>

      <div className="mb-6 mt-2 flex items-center gap-3.5">
        <div className="h-px flex-1 bg-line" />
        <span className={`${GROUP_LABEL} shrink-0`}>{t("sections.skills.evolving")}</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="skills-runway-stack flex flex-col gap-3">
        {EVOLVING_SKILLS.map((skill) => (
          <SkillRunway key={skill.id} skill={skill} />
        ))}
      </div>
    </section>
  );
}
