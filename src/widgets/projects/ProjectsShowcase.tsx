import { useRef } from "react";
import { PROJECTS } from "~/entities/project/model/projects";
import { ProjectCard } from "~/entities/project/ui/ProjectCard";
import { useT } from "~/shared/i18n/useT";
import { useMotion } from "~/shared/lib/motion";
import { useSectionFade } from "~/shared/lib/useSectionFade";
import { SectionHeading } from "~/shared/ui/SectionHeading";
import { SECTION, SECTION_BLOCK } from "~/shared/ui/section";

export function ProjectsShowcase() {
  const { t } = useT();
  const section = useRef<HTMLElement>(null);
  useSectionFade(section);

  useMotion(section, ({ gsap }) => {
    const root = section.current;
    if (!root) return;
    gsap.from(["h2", ".section-subtitle"], {
      scrollTrigger: { trigger: root, start: "top 82%", once: true },
      opacity: 0,
      y: 24,
      duration: 0.65,
      stagger: 0.14,
      ease: "power2.out",
      clearProps: "all",
    });
  });

  const featured = PROJECTS.filter((p) => p.variant === "featured");
  const secondary = PROJECTS.filter((p) => p.variant === "secondary");
  const compact = PROJECTS.filter((p) => p.variant === "compact");

  return (
    <section id="projects" className={`${SECTION} ${SECTION_BLOCK} relative z-[1] cursor-default`} ref={section}>
      <SectionHeading className="mb-5">{t("sections.projects.title")}</SectionHeading>
      <p className="section-subtitle mb-10 text-center font-medium text-muted">{t("sections.projects.subtitle")}</p>

      <div className="grid grid-cols-[1.4fr_1fr] gap-6 max-bp1024:grid-cols-1">
        {featured.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
        {secondary.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
        <div className="col-span-full grid grid-cols-3 gap-6 max-bp1024:grid-cols-2 max-bp740:grid-cols-1">
          {compact.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
