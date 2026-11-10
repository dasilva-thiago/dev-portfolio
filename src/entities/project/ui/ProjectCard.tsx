import { Link } from "react-router";
import { useLocalizedPath, useT } from "~/shared/i18n/useT";
import { AccessButton, GithubButton } from "~/shared/ui/ProjectLinks";
import { ProjectTag } from "~/shared/ui/ProjectTag";
import type { Project } from "../model/projects";
import { projectPath } from "../model/slugs";

type Variant = Project["variant"];

const CARD: Record<Variant, string> = {
  featured:
    "border-[1.5px] border-link/55 bg-surface shadow-[0_8px_24px_var(--shadow-dark-md)] hover:shadow-[0_12px_32px_var(--shadow-dark-md)]",
  secondary:
    "border border-line bg-[color-mix(in_srgb,var(--text-color)_4%,var(--white-color))]",
  compact: "border border-line bg-surface",
};

const IMAGE: Record<Variant, string> = {
  featured: "h-[340px] bg-text/6",
  secondary: "flex h-[340px] items-center justify-center bg-logo-bg [&_img]:size-[70%] [&_img]:object-contain",
  compact: "aspect-[16/10] bg-text/6",
};

const INFO: Record<Variant, string> = {
  featured:
    "bg-[color-mix(in_srgb,var(--link-color)_6%,var(--white-color))] px-10 pb-10 pt-8 max-bp740:px-6 max-bp740:pb-8 max-bp740:pt-[26px]",
  secondary: "px-8 pb-8 pt-7 max-bp740:px-[22px] max-bp740:pb-7 max-bp740:pt-6",
  compact: "px-8 pb-8 pt-7 max-bp740:px-[22px] max-bp740:pb-7 max-bp740:pt-6",
};

const TITLE: Record<Variant, string> = {
  featured: "text-[28px]",
  secondary: "text-[22px]",
  compact: "text-[19px]",
};

const TEXT: Record<Variant, string> = {
  featured: "text-[15.5px]",
  secondary: "text-[14.5px]",
  compact: "text-[13.5px]",
};

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useT();
  const localize = useLocalizedPath();
  const key = `projects.${project.slug}` as const;
  const { variant } = project;

  return (
    <article
      data-slug={project.slug}
      className={
        `relative flex cursor-pointer flex-col overflow-hidden rounded-2xl text-inherit backdrop-blur-[10px] ${CARD[variant]} ` +
        "transition-[transform,box-shadow,border-color] duration-[350ms] hover:-translate-y-1.5 hover:border-link/40"
      }
    >
      <div className={`w-full overflow-hidden ${IMAGE[variant]}`}>
        <img
          src={project.cardImage.src}
          alt={t(`${key}.alt`)}
          width={project.cardImage.width}
          height={project.cardImage.height}
          loading="lazy"
          className="block size-full object-cover"
        />
      </div>
      <div className={`flex flex-1 flex-col ${INFO[variant]}`}>
        <span className="mb-2 font-[family-name:var(--font-mono)] text-[12px] font-bold text-link">
          {String(project.order).padStart(2, "0")}
        </span>
        <ProjectTag className="mb-3">{t(`${key}.tag`)}</ProjectTag>
        <h3 className={`mb-2.5 ${TITLE[variant]}`}>
          <Link
            to={localize(projectPath(project.slug))}
            className="text-inherit after:absolute after:inset-0 after:z-[1] after:content-['']"
          >
            {t(`${key}.title`)}
          </Link>
        </h3>
        <p className={`mb-4 font-medium leading-[1.6] text-muted ${TEXT[variant]}`}>{t(`${key}.description`)}</p>
        <div className="mt-auto flex flex-wrap gap-2">
          {project.tech.map((name) => (
            <span
              key={name}
              className={
                "cursor-default border border-l-2 border-line border-l-accent bg-page px-3 py-[3px] font-[family-name:var(--font-mono)] text-[13px] font-normal tracking-[0.05em] " +
                "transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-[1.5px] hover:bg-link/6 hover:shadow-[0_4px_12px_var(--shadow-link-sm)]"
              }
            >
              {name}
            </span>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {project.links.live ? <AccessButton href={project.links.live} /> : null}
          {project.links.github ? <GithubButton href={project.links.github} /> : null}
        </div>
      </div>
    </article>
  );
}
